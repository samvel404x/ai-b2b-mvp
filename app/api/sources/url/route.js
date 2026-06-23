import dns from "node:dns/promises";
import net from "node:net";
import { analyzeEvidenceTextSource } from "../../../../lib/server/evidence-analysis";
import { saveEvidenceRecords } from "../../../../lib/server/evidence-store";
import { getRequestWorkspaceContext } from "../../../../lib/server/auth-session";

export const runtime = "nodejs";

function isPrivateIp(address) {
  if (net.isIP(address) === 4) {
    const [a, b] = address.split(".").map(Number);
    return a === 10
      || a === 127
      || (a === 172 && b >= 16 && b <= 31)
      || (a === 192 && b === 168)
      || (a === 169 && b === 254)
      || a === 0;
  }

  if (net.isIP(address) === 6) {
    const normalized = address.toLowerCase();
    return normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80");
  }

  return false;
}

async function assertPublicHttpUrl(rawUrl) {
  const url = new URL(rawUrl);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only HTTP and HTTPS URLs are supported.");
  }

  if (url.username || url.password) {
    throw new Error("URLs with embedded credentials are not supported.");
  }

  if (["localhost", "0.0.0.0"].includes(url.hostname.toLowerCase()) || isPrivateIp(url.hostname)) {
    throw new Error("Private and local network URLs are blocked.");
  }

  const resolved = await dns.lookup(url.hostname, { all: true }).catch(() => []);
  if (!resolved.length || resolved.some((entry) => isPrivateIp(entry.address))) {
    throw new Error("URL host could not be verified as public.");
  }

  return url;
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
    .slice(0, 160000);
}

// Fetches public URL evidence and stores it through the same review-first pipeline as uploads.
export async function POST(request) {
  try {
    const workspaceContext = getRequestWorkspaceContext(request);
    const body = await request.json();
    const url = await assertPublicHttpUrl(String(body.url || "").trim());

    const response = await fetch(url, {
      headers: {
        "User-Agent": "GENIUS-MVP/0.1 URL evidence analyzer",
        Accept: "text/html,text/plain,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(15000),
      redirect: "follow",
    });

    if (!response.ok) {
      return Response.json({ error: `URL fetch failed with ${response.status}.` }, { status: 400 });
    }

    const contentType = response.headers.get("content-type") || "";
    if (!/text\/html|text\/plain|application\/xhtml\+xml/i.test(contentType)) {
      return Response.json({ error: "URL content must be HTML or plain text." }, { status: 415 });
    }

    const rawText = await response.text();
    const text = contentType.includes("text/plain") ? rawText.slice(0, 160000) : readableTextFromHtml(rawText);

    if (!text) {
      return Response.json({ error: "No readable text was found at this URL." }, { status: 422 });
    }

    const record = await analyzeEvidenceTextSource({
      name: url.hostname,
      source: "URL Analysis",
      kind: "URL",
      text,
      url: url.toString(),
    });

    await saveEvidenceRecords([record], { workspaceId: workspaceContext.workspaceId });

    return Response.json({ evidence: record });
  } catch (error) {
    return Response.json({ error: error.message || "URL analysis failed." }, { status: 400 });
  }
}
