import { getRequestWorkspaceContext } from "../../../../lib/server/auth-session";
import { resetWorkspaceToDemo } from "../../../../lib/server/evidence-store";

export const runtime = "nodejs";

// Loads a deterministic investor-demo workspace for repeatable product walkthroughs.
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  if (body.confirm !== "load-investor-demo") {
    return Response.json({ error: "Demo reset requires explicit confirmation." }, { status: 400 });
  }

  const context = getRequestWorkspaceContext(request);
  const workspace = await resetWorkspaceToDemo(context.actor, { workspaceId: context.workspaceId });
  return Response.json({ workspace });
}
