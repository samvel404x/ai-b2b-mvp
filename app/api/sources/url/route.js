import dns from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import net from "node:net";
import { analyzeEvidenceTextSource } from "../../../../lib/server/evidence-analysis";
import { saveEvidenceRecords } from "../../../../lib/server/evidence-store";
import { requireRequestCapability } from "../../../../lib/server/auth-session";
import { maxEvidenceDecodedTextChars } from "../../../../lib/evidence-upload-policy";
import { guardMutationRequest } from "../../../../lib/server/request-security";

export const runtime = "nodejs";

const maxRedirectHops = 5;
const maxUrlBodyBytes = 2 * 1024 * 1024;
const urlFetchTimeoutMs = 12000;
const redirectStatuses = new Set([301, 302, 303, 307, 308]);
const allowedUrlPorts = new Set(["", "80", "443"]);

class UrlAnalysisError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "UrlAnalysisError";
    this.status = status;
  }
}

function isPrivateIp(address) {
  if (net.isIP(address) === 4) {
    const [a, b, c] = address.split(".").map(Number);
    return a === 10
      || a === 0
      || a === 127
      || (a === 100 && b >= 64 && b <= 127)
      || (a === 172 && b >= 16 && b <= 31)
      || (a === 192 && b === 168)
      || (a === 192 && b === 0)
      || (a === 169 && b === 254)
      || (a === 198 && (b === 18 || b === 19))
      || (a === 198 && b === 51 && c === 100)
      || (a === 203 && b === 0 && c === 113)
      || a >= 224;
  }

  if (net.isIP(address) === 6) {
    const normalized = address.toLowerCase();
    if (normalized.startsWith("::ffff:")) {
      return isPrivateIp(normalized.replace("::ffff:", ""));
    }
    return normalized === "::"
      || normalized === "::1"
      || normalized.startsWith("fc")
      || normalized.startsWith("fd")
      || normalized.startsWith("fe80")
      || normalized.startsWith("ff")
      || normalized.startsWith("2001:db8");
  }

  return false;
}

function normalizeHostname(value) {
  return String(value || "").trim().replace(/\.$/, "").toLowerCase();
}

function responseHeader(response, name) {
  const value = response.headers?.[String(name || "").toLowerCase()];
  return Array.isArray(value) ? value[0] || "" : value || "";
}

async function assertPublicHttpUrl(rawUrl) {
  let url;
  try {
    url = new URL(String(rawUrl || "").trim());
  } catch {
    throw new UrlAnalysisError("Enter a valid URL.", 400);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new UrlAnalysisError("Only HTTP and HTTPS URLs are supported.", 400);
  }

  if (!allowedUrlPorts.has(url.port)) {
    throw new UrlAnalysisError("Only standard HTTP and HTTPS ports are supported.", 400);
  }

  if (url.username || url.password) {
    throw new UrlAnalysisError("URLs with embedded credentials are not supported.", 400);
  }

  const hostname = normalizeHostname(url.hostname);
  if (["localhost", "0.0.0.0"].includes(hostname) || hostname.endsWith(".localhost") || isPrivateIp(hostname)) {
    throw new UrlAnalysisError("Private and local network URLs are blocked.", 400);
  }

  const resolved = await dns.lookup(url.hostname, { all: true }).catch(() => []);
  if (!resolved.length || resolved.some((entry) => isPrivateIp(entry.address))) {
    throw new UrlAnalysisError("URL host could not be verified as public.", 400);
  }

  return { url, addresses: resolved };
}

function addressForFamily(addresses, family) {
  return addresses.find((entry) => !family || entry.family === family) || addresses[0];
}

function requestPublicUrl(url, addresses) {
  const client = url.protocol === "https:" ? https : http;
  const expectedHostname = normalizeHostname(url.hostname);

  return new Promise((resolve, reject) => {
    const request = client.request(
      url,
      {
        method: "GET",
        headers: {
          "User-Agent": "GENIUS-MVP/0.1 URL evidence analyzer",
          Accept: "text/html,text/plain,application/xhtml+xml",
        },
        timeout: urlFetchTimeoutMs,
        servername: url.hostname,
        lookup(hostname, options, callback) {
          if (normalizeHostname(hostname) !== expectedHostname) {
            callback(new UrlAnalysisError("URL hostname changed during DNS validation.", 400));
            return;
          }

          const selected = addressForFamily(addresses, options?.family);
          callback(null, selected.address, selected.family);
        },
      },
      (response) => resolve(response),
    );

    request.on("timeout", () => request.destroy(new UrlAnalysisError("URL fetch timed out.", 408)));
    request.on("error", reject);
    request.end();
  });
}

async function fetchPublicUrl(rawUrl, redirects = 0) {
  const { url, addresses } = await assertPublicHttpUrl(rawUrl);
  const response = await requestPublicUrl(url, addresses);

  if (redirectStatuses.has(response.statusCode)) {
    if (redirects >= maxRedirectHops) {
      throw new UrlAnalysisError(`URL redirected more than ${maxRedirectHops} times.`, 400);
    }

    const location = responseHeader(response, "location");
    await cancelResponseBody(response);
    if (!location) {
      throw new UrlAnalysisError("URL redirected without a Location header.", 400);
    }

    return await fetchPublicUrl(new URL(location, url).toString(), redirects + 1);
  }

  return { response, finalUrl: url, redirects };
}

async function cancelResponseBody(response) {
  try {
    response.destroy?.();
  } catch {
    // Best-effort cleanup only; redirect validation must not depend on body cancellation.
  }
}

async function readResponseTextWithLimit(response) {
  const declaredLength = Number(responseHeader(response, "content-length") || 0);
  if (declaredLength > maxUrlBodyBytes) {
    throw new UrlAnalysisError("URL response is too large to analyze.", 413);
  }

  const chunks = [];
  let totalBytes = 0;

  for await (const value of response) {
    const chunk = Buffer.from(value);
    totalBytes += chunk.byteLength;
    if (totalBytes > maxUrlBodyBytes) {
      response.destroy?.();
      throw new UrlAnalysisError("URL response is too large to analyze.", 413);
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString("utf8");
}

function readableTextFromHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxEvidenceDecodedTextChars);
}

// Fetches public URL evidence and stores it through the same review-first pipeline as uploads.
export async function POST(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "sources:url", limit: 30, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const { context: workspaceContext, response: authResponse } = await requireRequestCapability(request, "upload_evidence");
  if (authResponse) return authResponse;

  try {
    const body = await request.json().catch(() => ({}));
    const { response, finalUrl, redirects } = await fetchPublicUrl(String(body.url || "").trim());

    if (response.statusCode < 200 || response.statusCode >= 300) {
      return Response.json(
        { error: `URL fetch failed with ${response.statusCode}.` },
        { status: 400, headers: { "Cache-Control": "private, no-store" } },
      );
    }

    const contentType = responseHeader(response, "content-type");
    if (!/text\/html|text\/plain|application\/xhtml\+xml/i.test(contentType)) {
      return Response.json(
        { error: "URL content must be HTML or plain text." },
        { status: 415, headers: { "Cache-Control": "private, no-store" } },
      );
    }

    const rawText = await readResponseTextWithLimit(response);
    const text = contentType.includes("text/plain") ? rawText.slice(0, maxEvidenceDecodedTextChars) : readableTextFromHtml(rawText);

    if (!text) {
      return Response.json(
        { error: "No readable text was found at this URL." },
        { status: 422, headers: { "Cache-Control": "private, no-store" } },
      );
    }

    const record = await analyzeEvidenceTextSource({
      name: finalUrl.hostname,
      source: "URL Analysis",
      kind: "URL",
      text,
      url: finalUrl.toString(),
    });

    await saveEvidenceRecords([record], { workspaceId: workspaceContext.workspaceId, actor: workspaceContext.actor });

    return Response.json(
      { evidence: record, redirects },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    const status = error instanceof UrlAnalysisError ? error.status : 400;
    return Response.json(
      { error: error.message || "URL analysis failed." },
      { status, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
