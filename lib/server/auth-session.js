import crypto from "node:crypto";
import {
  authorizationDeniedResponse,
  buildWorkspaceMember,
  capabilitiesForRole,
  memberHasCapability,
  normalizeDepartment,
  normalizePosition,
  normalizeRole,
  maskEmail,
  publicMember,
} from "./authorization";
import { validateWorkspaceSession } from "./evidence-store";

const sessionCookieName = "genius_session";
const sessionMaxAgeSeconds = 60 * 60 * 24 * 30;
const localDevelopmentSecret = "genius-local-dev-session-secret";

function base64UrlEncode(value) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sessionSecret() {
  const configuredSecret = String(process.env.GENIUS_SESSION_SECRET || "");

  if (configuredSecret) {
    if (process.env.NODE_ENV === "production" && configuredSecret.length < 32) {
      throw new Error("GENIUS_SESSION_SECRET must contain at least 32 characters in production.");
    }
    return configuredSecret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("GENIUS_SESSION_SECRET is required in production.");
  }

  return localDevelopmentSecret;
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
        const value = part.slice(separator + 1);
        try {
          return [part.slice(0, separator), decodeURIComponent(value)];
        } catch {
          return [part.slice(0, separator), ""];
        }
      }),
  );
}

export function workspaceIdForUser(userId) {
  const digest = crypto.createHash("sha1").update(String(userId)).digest("hex").slice(0, 18);
  return `workspace-${digest}`;
}

export function isGuestWorkspaceId(workspaceId) {
  return /^guest-[a-f0-9-]{12,}$/i.test(String(workspaceId || ""));
}

export function createGuestWorkspaceId() {
  return `guest-${crypto.randomUUID()}`;
}

export function createAppSession({
  userId,
  email,
  provider = "Email",
  role = "Owner",
  position = "CEO",
  department = "Operations",
  workspaceId,
}) {
  const normalizedEmail = String(email || "").toLowerCase();
  const normalizedUserId = String(userId || normalizedEmail);
  const resolvedWorkspaceId = String(workspaceId || workspaceIdForUser(normalizedUserId));
  const member = buildWorkspaceMember({
    userId: normalizedUserId,
    email: normalizedEmail,
    workspaceId: resolvedWorkspaceId,
    role: normalizeRole(role, "Owner"),
    position: normalizePosition(position),
    department: normalizeDepartment(department),
  });
  const issuedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + sessionMaxAgeSeconds * 1000).toISOString();

  return {
    sessionId: crypto.randomUUID(),
    userId: normalizedUserId,
    email: normalizedEmail,
    name: normalizedEmail.split("@")[0] || "user",
    provider,
    role: member.role,
    position: member.position,
    department: member.department,
    workspaceId: resolvedWorkspaceId,
    capabilities: capabilitiesForRole(member.role),
    issuedAt,
    expiresAt,
  };
}

export function createGuestAppSession(profile = {}) {
  const guestId = `guest-${crypto.randomUUID()}`;
  return createAppSession({
    userId: guestId,
    email: `${guestId}@guest.genius.local`,
    provider: "Guest",
    role: "Owner",
    position: profile.position || "Guest Operator",
    department: profile.department || "Local Workspace",
    workspaceId: createGuestWorkspaceId(),
  });
}

export function publicSession(session) {
  if (!session) return null;
  const isGuest = session.provider === "Guest" || isGuestWorkspaceId(session.workspaceId);
  const member = session.member
    ? buildWorkspaceMember({ ...session.member, workspaceId: session.workspaceId })
    : buildWorkspaceMember({
        userId: session.userId,
        email: session.email,
        workspaceId: session.workspaceId,
        role: session.role,
        position: session.position,
        department: session.department,
        status: session.status,
        createdAt: session.issuedAt,
      });
  const emailMasked = session.email ? maskEmail(session.email) : "";

  return {
    authMode: isGuest ? "guest" : "account",
    isGuest,
    // Public client state should not expose auth/login identifiers. UI can use
    // emailMasked for recognition while server routes keep the signed cookie.
    email: "",
    emailMasked: isGuest ? "" : emailMasked,
    displayName: isGuest ? "Guest local workspace" : emailMasked,
    name: isGuest ? "Guest" : session.name,
    provider: session.provider,
    role: member.role,
    position: member.position,
    department: member.department,
    workspaceId: session.workspaceId,
    capabilities: member.status === "active" ? capabilitiesForRole(member.role) : [],
    member: publicMember(member, { exposeEmail: false }),
    expiresAt: session.expiresAt,
  };
}

export function encodeSession(session) {
  const payload = base64UrlEncode(JSON.stringify(session));
  return `${payload}.${signPayload(payload)}`;
}

export function decodeSession(value) {
  try {
    const [payload, signature] = String(value || "").split(".");
    if (!payload || !signature || !safeEqual(signPayload(payload), signature)) return null;

    const session = JSON.parse(base64UrlDecode(payload));
    if (
      !session?.userId
      || !session?.email
      || !session?.workspaceId
      || !Number.isFinite(Date.parse(session.expiresAt))
      || Date.parse(session.expiresAt) <= Date.now()
    ) {
      return null;
    }
    return {
      ...session,
      role: normalizeRole(session.role, "Member"),
      position: normalizePosition(session.position),
      department: normalizeDepartment(session.department),
      capabilities: capabilitiesForRole(session.role),
    };
  } catch {
    return null;
  }
}

export function getRequestSession(request) {
  const cookies = parseCookieHeader(request.headers.get("cookie") || "");
  return decodeSession(cookies[sessionCookieName]);
}

export async function getValidatedRequestSession(request) {
  const session = getRequestSession(request);
  if (!session) return null;
  const validated = await validateWorkspaceSession(session);
  return validated?.session || null;
}

export async function requireRequestWorkspaceContext(request) {
  const session = getRequestSession(request);
  if (!session) return null;
  const validated = await validateWorkspaceSession(session);
  if (!validated) return null;
  const { member } = validated;
  const activeSession = validated.session;

  return {
    session: activeSession,
    workspaceId: activeSession.workspaceId,
    actor: member.email || activeSession.email,
    member,
    capabilities: capabilitiesForRole(member.role),
  };
}

export function requireContextCapability(context, capability) {
  if (!context) return sessionRequiredResponse();
  if (!memberHasCapability(context.member, capability)) {
    return authorizationDeniedResponse(capability, context.member);
  }
  return null;
}

export async function requireRequestCapability(request, capability) {
  const context = await requireRequestWorkspaceContext(request);
  const response = requireContextCapability(context, capability);
  return { context, response };
}

export function sessionRequiredResponse() {
  return Response.json(
    { error: "Authentication required.", code: "UNAUTHORIZED" },
    {
      status: 401,
      headers: {
        "Cache-Control": "private, no-store",
        "WWW-Authenticate": "Session",
      },
    },
  );
}

export function sessionCookie(session) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${sessionCookieName}=${encodeURIComponent(encodeSession(session))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${sessionMaxAgeSeconds}; Priority=High${secure}`;
}

export function clearSessionCookie() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
