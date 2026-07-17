import { requireRequestCapability } from "../../../../lib/server/auth-session";
import { resetWorkspaceToDemo } from "../../../../lib/server/evidence-store";
import { guardMutationRequest } from "../../../../lib/server/request-security";

export const runtime = "nodejs";

// Loads a deterministic investor-demo workspace for repeatable product walkthroughs.
export async function POST(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "demo:reset", limit: 8, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const { context, response } = await requireRequestCapability(request, "reset_workspace");
  if (response) return response;

  const body = await request.json().catch(() => ({}));
  if (body.confirm !== "load-investor-demo") {
    return Response.json({ error: "Demo reset requires explicit confirmation." }, { status: 400 });
  }

  const workspace = await resetWorkspaceToDemo(context.actor, { workspaceId: context.workspaceId });
  return Response.json({ workspace });
}
