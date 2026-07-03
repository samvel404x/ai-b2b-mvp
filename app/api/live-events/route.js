import { clearLiveEvents, listLiveEvents, loadDemoLiveEvents, saveLiveEvents } from "../../../lib/server/evidence-store";
import { getRequestWorkspaceContext } from "../../../lib/server/auth-session";
import { getDefaultWorkspaceId } from "../../../lib/server/workspace-state";

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

function tokenIsValid(request) {
  const configuredToken = process.env.GENIUS_LIVE_INGEST_TOKEN;
  const providedToken = request.headers.get("x-genius-live-token");

  return Boolean(configuredToken && providedToken && providedToken === configuredToken);
}

function workspaceIdFromExternalRequest(request, body, fallbackWorkspaceId) {
  return getDefaultWorkspaceId(
    request.headers.get("x-genius-workspace-id")
      || body?.workspaceId
      || fallbackWorkspaceId,
  );
}

function resolveLiveWriteContext(request, body) {
  const context = getRequestWorkspaceContext(request);
  const requestedWorkspaceId = request.headers.get("x-genius-workspace-id") || body?.workspaceId;
  const hasToken = Boolean(request.headers.get("x-genius-live-token"));

  if (hasToken) {
    if (!tokenIsValid(request)) {
      return { error: jsonError("Invalid live ingest token.", 401) };
    }

    return {
      context: {
        session: context.session,
        workspaceId: workspaceIdFromExternalRequest(request, body, context.workspaceId),
        actor: "business-live-webhook",
      },
    };
  }

  if (requestedWorkspaceId) {
    return { error: jsonError("workspaceId requires x-genius-live-token.", 401) };
  }

  return { context };
}

// Lists raw live-business events for connector/debug views.
export async function GET(request) {
  const context = getRequestWorkspaceContext(request);
  const liveEvents = await listLiveEvents({ workspaceId: context.workspaceId });
  return Response.json({ liveEvents }, { headers: { "Cache-Control": "private, no-store" } });
}

// Ingests live commerce events; external execution remains blocked behind approvals.
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { context, error } = resolveLiveWriteContext(request, body);
  if (error) return error;

  if (body?.demo === true) {
    const workspace = await loadDemoLiveEvents(context.actor, { workspaceId: context.workspaceId });
    return Response.json({ workspace, liveEvents: workspace.liveEvents || [] });
  }

  const events = eventsFromBody(body);
  if (!events.length) return jsonError("Send at least one live event or set demo=true.");
  if (events.length > maxEventsPerRequest) return jsonError(`Send ${maxEventsPerRequest} live events or fewer per request.`, 413);

  const workspace = await saveLiveEvents(events, context.actor, { workspaceId: context.workspaceId });
  return Response.json({ workspace, liveEvents: workspace.liveEvents || [] });
}

// Clears live events without deleting uploaded evidence.
export async function DELETE(request) {
  const context = getRequestWorkspaceContext(request);
  const workspace = await clearLiveEvents(context.actor, { workspaceId: context.workspaceId });
  return Response.json({ workspace, liveEvents: [] });
}
