import { runSupervisedAgents } from "../../../../lib/server/evidence-store";

export const runtime = "nodejs";

// Refreshes supervised agent outputs from existing evidence; no autonomous external action is taken.
export async function POST() {
  const workspace = await runSupervisedAgents("user");
  return Response.json({ workspace });
}
