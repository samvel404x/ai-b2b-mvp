import { getWorkspaceSnapshot } from "../../../lib/server/evidence-store";

export const runtime = "nodejs";

// Returns the backend source of truth for every working section.
export async function GET() {
  const workspace = await getWorkspaceSnapshot();
  return Response.json({ workspace });
}
