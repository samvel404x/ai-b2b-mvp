import { getWorkspaceSnapshot } from "../../../lib/server/evidence-store";

export const runtime = "nodejs";

// Returns backend-generated reports built from reviewed evidence, findings, actions, and audit history.
export async function GET() {
  const workspace = await getWorkspaceSnapshot();
  return Response.json({
    reports: workspace.reports || [],
    metrics: workspace.metrics || {},
    generatedAt: new Date().toISOString(),
  });
}
