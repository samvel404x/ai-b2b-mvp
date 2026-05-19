import { getWorkspaceSnapshot } from "../../../lib/server/evidence-store";
import { getRequestWorkspaceContext, publicSession } from "../../../lib/server/auth-session";

export const runtime = "nodejs";

// Returns the backend source of truth for every working section.
export async function GET(request) {
  const context = getRequestWorkspaceContext(request);
  const workspace = await getWorkspaceSnapshot({ workspaceId: context.workspaceId });
  return Response.json(
    {
      workspace,
      session: publicSession(context.session),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
