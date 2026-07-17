import { requireRequestCapability, requireRequestWorkspaceContext, sessionRequiredResponse } from "../../../lib/server/auth-session";
import {
  createConnectorRequest,
  getWorkspaceSnapshot,
  saveConnectorFilters,
  updateConnectorRequestStatus,
} from "../../../lib/server/evidence-store";
import { guardMutationRequest } from "../../../lib/server/request-security";

export const runtime = "nodejs";

function connectorRequestSummary(request) {
  const requester = request.requester
    ? {
        role: request.requester.role || "Member",
        position: request.requester.position || "",
        department: request.requester.department || "",
      }
    : null;

  return {
    id: request.id,
    name: request.name,
    category: request.category,
    useCase: request.useCase,
    status: request.status,
    requester,
    statusNote: request.statusNote || "",
    updatedBy: request.updatedBy || "",
    events: Array.isArray(request.events) ? request.events.slice(-10) : [],
    createdAt: request.createdAt || null,
    updatedAt: request.updatedAt || null,
  };
}

function filterPresetSummary(preset) {
  return {
    connectorId: preset.connectorId,
    label: preset.label,
    rules: Array.isArray(preset.rules) ? preset.rules : [],
    savedBy: preset.savedBy || null,
    savedAt: preset.savedAt || null,
    updatedAt: preset.updatedAt || null,
  };
}

export async function GET(request) {
  const context = await requireRequestWorkspaceContext(request);
  if (!context) return sessionRequiredResponse();

  const workspace = await getWorkspaceSnapshot({ workspaceId: context.workspaceId });
  const connectorFilters = Object.fromEntries(
    Object.entries(workspace.connectorFilters || {}).map(([connectorId, preset]) => [connectorId, filterPresetSummary(preset)]),
  );

  return Response.json(
    {
      connectorRequests: (workspace.connectorRequests || []).map(connectorRequestSummary),
      connectorFilters,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "connectors:post", limit: 40, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const context = await requireRequestWorkspaceContext(request);
  if (!context) return sessionRequiredResponse();

  const body = await request.json().catch(() => ({}));

  try {
    const result = await createConnectorRequest(
      body,
      { actor: context.actor, member: context.member },
      { workspaceId: context.workspaceId },
    );

    return Response.json(
      {
        workspace: result.workspace,
        request: connectorRequestSummary(result.request),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return Response.json({ error: error.message || "Connector request could not be created." }, { status: 400 });
  }
}

export async function PATCH(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "connectors:patch", limit: 80, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const body = await request.json().catch(() => ({}));
  const isStatusUpdate = body.action === "update_request_status" || Boolean(body.requestId || body.id);
  const { context, response } = await requireRequestCapability(
    request,
    isStatusUpdate ? "manage_connectors" : "manage_live_events",
  );
  if (response) return response;

  try {
    if (isStatusUpdate) {
      const result = await updateConnectorRequestStatus(
        body,
        { actor: context.actor, member: context.member },
        { workspaceId: context.workspaceId },
      );

      return Response.json(
        {
          workspace: result.workspace,
          request: connectorRequestSummary(result.request),
        },
        { headers: { "Cache-Control": "private, no-store" } },
      );
    }

    const result = await saveConnectorFilters(
      body,
      { actor: context.actor, member: context.member },
      { workspaceId: context.workspaceId },
    );

    return Response.json(
      {
        workspace: result.workspace,
        preset: filterPresetSummary(result.preset),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return Response.json(
      { error: error.message || (isStatusUpdate ? "Connector request status could not be updated." : "Connector filters could not be saved.") },
      { status: 400 },
    );
  }
}
