import crypto from "node:crypto";
import { getDefaultWorkspaceId } from "./workspace-state";

const sessionCookieName = "genius_session";
const sessionMaxAgeSeconds = 60 * 60 * 24 * 30;

function base64UrlEncode(value) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sessionSecret() {
  return process.env.GENIUS_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "genius-local-dev-session-secret";
}

function signPayload(payload) {
  return crypto.createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function parseCookieHeader(cookieHeader = "") {
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separator = part.indexOf("=");
        if (separator === -1) return [part, ""];
        return [part.slice(0, separator), decodeURIComponent(part.slice(separator + 1))];
      }),
  );
}

export function workspaceIdForUser(userId) {
  const digest = crypto.createHash("sha1").update(String(userId)).digest("hex").slice(0, 18);
  return `workspace-${digest}`;
}

export function createAppSession({ userId, email, provider = "Email" }) {
  const normalizedEmail = String(email || "").toLowerCase();
  const expiresAt = new Date(Date.now() + sessionMaxAgeSeconds * 1000).toISOString();

  return {
    userId,
    email: normalizedEmail,
    name: normalizedEmail.split("@")[0] || "user",
    provider,
    workspaceId: workspaceIdForUser(userId || normalizedEmail),
    expiresAt,
  };
}

export function publicSession(session) {
  if (!session) return null;

  return {
    email: session.email,
    name: session.name,
    provider: session.provider,
    workspaceId: session.workspaceId,
    expiresAt: session.expiresAt,
  };
}

export function encodeSession(session) {
  const payload = base64UrlEncode(JSON.stringify(session));
  return `${payload}.${signPayload(payload)}`;
}

export function decodeSession(value) {
  const [payload, signature] = String(value || "").split(".");
  if (!payload || !signature || !safeEqual(signPayload(payload), signature)) return null;

  try {
    const session = JSON.parse(base64UrlDecode(payload));
    if (!session?.email || !session?.workspaceId || Date.parse(session.expiresAt) <= Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export function getRequestSession(request) {
  const cookies = parseCookieHeader(request.headers.get("cookie") || "");
  return decodeSession(cookies[sessionCookieName]);
}

export function getRequestWorkspaceContext(request) {
  const session = getRequestSession(request);
  return {
    session,
    workspaceId: getDefaultWorkspaceId(session?.workspaceId),
    actor: session?.email || "user",
  };
}

export function sessionCookie(session) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${sessionCookieName}=${encodeURIComponent(encodeSession(session))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${sessionMaxAgeSeconds}${secure}`;
}

export function clearSessionCookie() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
