import { listWorkspaceSessions, revokeWorkspaceSessions } from "../../../../lib/server/evidence-store";
import { requireRequestWorkspaceContext, sessionRequiredResponse } from "../../../../lib/server/auth-session";
import { guardMutationRequest } from "../../../../lib/server/request-security";

export const runtime = "nodejs";

export async function GET(request) {
  const context = await requireRequestWorkspaceContext(request);
  if (!context) return sessionRequiredResponse();
  const result = await listWorkspaceSessions(context, { workspaceId: context.workspaceId });
  return Response.json(
    {
      workspace: result.workspace,
      sessions: result.sessions,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function PATCH(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "workspace:sessions", limit: 40, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const context = await requireRequestWorkspaceContext(request);
  if (!context) return sessionRequiredResponse();

  try {
    const body = await request.json().catch(() => ({}));
    const result = await revokeWorkspaceSessions(body, context, { workspaceId: context.workspaceId });
    return Response.json(
      {
        workspace: result.workspace,
        sessions: result.sessions,
        revokedCount: result.revokedCount,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return Response.json(
      { error: error.message || "Workspace sessions could not be updated." },
      { status: 400, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
