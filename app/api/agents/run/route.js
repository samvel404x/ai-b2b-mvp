import { runSupervisedAgents } from "../../../../lib/server/evidence-store";
import { getRequestWorkspaceContext } from "../../../../lib/server/auth-session";

export const runtime = "nodejs";

// Refreshes supervised agent outputs from existing evidence; no autonomous external action is taken.
export async function POST(request) {
  const workspaceContext = getRequestWorkspaceContext(request);
  const workspace = await runSupervisedAgents(workspaceContext.actor, { workspaceId: workspaceContext.workspaceId });
  return Response.json({ workspace });
}
