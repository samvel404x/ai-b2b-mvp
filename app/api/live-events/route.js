import crypto from "node:crypto";
import { clearLiveEvents, listLiveEvents, loadDemoLiveEvents, saveLiveEvents } from "../../../lib/server/evidence-store";
import {
  requireContextCapability,
  requireRequestCapability,
  requireRequestWorkspaceContext,
  sessionRequiredResponse,
} from "../../../lib/server/auth-session";
import { applyRateLimit, guardMutationRequest } from "../../../lib/server/request-security";

export const runtime = "nodejs";

const maxEventsPerRequest = 100;

function jsonError(message, status = 400, details = undefined) {
  return Response.json({ error: message, details }, { status });
}

function eventsFromBody(body) {
  if (body?.demo === true) return null;
  if (Array.isArray(body?.events)) return body.events;
  if (body?.event && typeof body.event === "object") return [body.event];
  if (body && typeof body === "object" && body.type) return [body];
  return [];
}

function cleanIdempotencyKey(value) {
  return String(value || "").trim().slice(0, 180);
}

function shortHash(value, length = 24) {
  return crypto.createHash("sha1").update(value).digest("hex").slice(0, length);
}

function metadataObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function applyIdempotency(events, request, body, workspaceId) {
  const idempotencyKey = cleanIdempotencyKey(request.headers.get("x-idempotency-key") || body?.idempotencyKey);
  if (!idempotencyKey) return { events, idempotencyKeyHash: "" };

  const idempotencyKeyHash = shortHash(`${workspaceId}:${idempotencyKey}`, 16);
  return {
    idempotencyKeyHash,
    events: events.map((event, index) => {
      const source = event && typeof event === "object" ? event : {};
      const originalId = String(source.id || "").trim();
      const originalExternalId = String(source.externalId || "").trim();
      const metadata = {
        ...metadataObject(source.metadata),
        idempotencyKeyHash,
      };

      if (originalId && !originalExternalId) metadata.originalId = originalId.slice(0, 120);

      return {
        ...source,
        id: `live-idem-${shortHash(`${workspaceId}:${idempotencyKey}:${index}`)}`,
        externalId: originalExternalId || originalId || `idempotency:${idempotencyKeyHash}:${index}`,
        metadata,
      };
    }),
  };
}

function timingSafeStringEqual(left, right) {
  if (!left || !right) return false;
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function workspaceScopedToken(workspaceId) {
  const secret = process.env.GENIUS_LIVE_INGEST_SECRET;
  if (!secret || !workspaceId) return null;
  const digest = crypto
    .createHmac("sha256", secret)
    .update(`live-events:${workspaceId}`)
    .digest("hex");
  return `v1:${digest}`;
}

function legacyTokenIsValidForWorkspace(providedToken, workspaceId) {
  const legacyToken = process.env.GENIUS_LIVE_INGEST_TOKEN;
  const legacyWorkspaceId = process.env.GENIUS_LIVE_INGEST_WORKSPACE_ID;
  return Boolean(legacyToken && legacyWorkspaceId)
    && legacyWorkspaceId === workspaceId
    && timingSafeStringEqual(providedToken, legacyToken);
}

function tokenIsValidForWorkspace(request, workspaceId) {
  const providedToken = request.headers.get("x-genius-live-token");
  const expectedScopedToken = workspaceScopedToken(workspaceId);

  return timingSafeStringEqual(providedToken, expectedScopedToken)
    || legacyTokenIsValidForWorkspace(providedToken, workspaceId);
}

function externalWorkspaceId(request, body) {
  const workspaceId = String(request.headers.get("x-genius-workspace-id") || body?.workspaceId || "").trim();
  return /^[a-zA-Z0-9_-]{1,80}$/.test(workspaceId) ? workspaceId : null;
}

async function resolveLiveWriteContext(request, body) {
  const requestedWorkspaceId = request.headers.get("x-genius-workspace-id") || body?.workspaceId;
  const hasToken = Boolean(request.headers.get("x-genius-live-token"));

  if (hasToken) {
    const workspaceId = externalWorkspaceId(request, body);
    if (!workspaceId) {
      return { error: jsonError("A valid workspaceId is required for token-authenticated ingestion.", 400) };
    }

    if (!tokenIsValidForWorkspace(request, workspaceId)) {
      return { error: jsonError("Invalid live ingest token for workspace.", 401) };
    }

    return {
      authMode: "token",
      context: {
        session: null,
        workspaceId,
        actor: "business-live-webhook",
      },
    };
  }

  if (requestedWorkspaceId) {
    return { error: jsonError("workspaceId requires x-genius-live-token.", 401) };
  }

  const sessionContext = await requireRequestWorkspaceContext(request);
  if (!sessionContext) {
    return { error: sessionRequiredResponse() };
  }

  return { authMode: "session", context: sessionContext };
}

// Lists raw live-business events for connector/debug views.
export async function GET(request) {
  const guard = applyRateLimit(request, { keyPrefix: "live-events:get", limit: 120, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const context = await requireRequestWorkspaceContext(request);
  if (!context) return sessionRequiredResponse();
  const liveEvents = await listLiveEvents({ workspaceId: context.workspaceId });
  return Response.json({ liveEvents }, { headers: { "Cache-Control": "private, no-store" } });
}

// Ingests live commerce events; external execution remains blocked behind approvals.
export async function POST(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "live-events:post", limit: 120, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const body = await request.json().catch(() => ({}));
  const { context, error, authMode } = await resolveLiveWriteContext(request, body);
  if (error) return error;
  if (authMode === "session") {
    const denied = requireContextCapability(context, "ingest_live_events");
    if (denied) return denied;
  }

  if (body?.demo === true) {
    if (authMode !== "session") {
      return jsonError("Demo event loading requires an authenticated workspace session.", 403);
    }
    const workspace = await loadDemoLiveEvents(context.actor, { workspaceId: context.workspaceId });
    return Response.json({ workspace, liveEvents: workspace.liveEvents || [] });
  }

  const events = eventsFromBody(body);
  if (!events.length) return jsonError("Send at least one live event or set demo=true.");
  if (events.length > maxEventsPerRequest) return jsonError(`Send ${maxEventsPerRequest} live events or fewer per request.`, 413);

  const idempotent = applyIdempotency(events, request, body, context.workspaceId);
  const workspace = await saveLiveEvents(idempotent.events, context.actor, { workspaceId: context.workspaceId });
  return Response.json({
    workspace,
    liveEvents: workspace.liveEvents || [],
    idempotencyKeyHash: idempotent.idempotencyKeyHash || null,
  });
}

// Clears live events without deleting uploaded evidence.
export async function DELETE(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "live-events:delete", limit: 20, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const { context, response } = await requireRequestCapability(request, "manage_live_events");
  if (response) return response;
  const workspace = await clearLiveEvents(context.actor, { workspaceId: context.workspaceId });
  return Response.json({ workspace, liveEvents: [] });
}
