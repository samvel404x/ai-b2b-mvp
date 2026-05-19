import { getWorkspaceSnapshot } from "../../../lib/server/evidence-store";
import { getRequestWorkspaceContext } from "../../../lib/server/auth-session";

export const runtime = "nodejs";

// Returns backend-generated reports built from reviewed evidence, findings, actions, and audit history.
export async function GET(request) {
  const context = getRequestWorkspaceContext(request);
  const workspace = await getWorkspaceSnapshot({ workspaceId: context.workspaceId });
  return Response.json({
    reports: workspace.reports || [],
    metrics: workspace.metrics || {},
    generatedAt: new Date().toISOString(),
  });
}
