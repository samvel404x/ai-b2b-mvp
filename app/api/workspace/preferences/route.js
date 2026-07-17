import { getWorkspaceSnapshot, updateWorkspacePreferences } from "../../../../lib/server/evidence-store";
import { authorizationDeniedResponse, memberHasCapability } from "../../../../lib/server/authorization";
import { requireRequestWorkspaceContext, sessionRequiredResponse } from "../../../../lib/server/auth-session";
import { guardMutationRequest } from "../../../../lib/server/request-security";

export const runtime = "nodejs";

function requestedSections(body = {}) {
  const source = body.preferences && typeof body.preferences === "object" ? body.preferences : body;
  return ["profile", "ai", "notifications", "policies", "workbench"].filter((section) => {
    return source[section] && typeof source[section] === "object";
  });
}

function permissionResponseForPreferences(body, member) {
  const sections = requestedSections(body);
  if (sections.includes("policies") && !memberHasCapability(member, "manage_workspace")) {
    return authorizationDeniedResponse("manage_workspace", member);
  }
  if (sections.includes("notifications") && !memberHasCapability(member, "update_notifications")) {
    return authorizationDeniedResponse("update_notifications", member);
  }
  if (sections.includes("ai") && !memberHasCapability(member, "ask_ai")) {
    return authorizationDeniedResponse("ask_ai", member);
  }
  return null;
}

export async function GET(request) {
  const context = await requireRequestWorkspaceContext(request);
  if (!context) return sessionRequiredResponse();
  const workspace = await getWorkspaceSnapshot({ workspaceId: context.workspaceId });
  return Response.json(
    { preferences: workspace.preferences || {}, workspace },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function PATCH(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "workspace:preferences", limit: 80, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const context = await requireRequestWorkspaceContext(request);
  if (!context) return sessionRequiredResponse();

  try {
    const body = await request.json().catch(() => ({}));
    const permissionResponse = permissionResponseForPreferences(body, context.member);
    if (permissionResponse) return permissionResponse;

    const result = await updateWorkspacePreferences(body, context, { workspaceId: context.workspaceId });
    return Response.json(
      {
        workspace: result.workspace,
        preferences: result.preferences,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return Response.json(
      { error: error.message || "Workspace preferences could not be saved." },
      { status: 400, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
