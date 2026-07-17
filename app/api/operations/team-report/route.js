import { requireRequestCapability } from "../../../../lib/server/auth-session";
import { createTeamOperationReport } from "../../../../lib/server/evidence-store";
import { guardMutationRequest } from "../../../../lib/server/request-security";

export const runtime = "nodejs";

export async function POST(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "operations:team-report", limit: 60, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const { context, response } = await requireRequestCapability(request, "submit_team_report");
  if (response) return response;
  const body = await request.json().catch(() => ({}));
  const result = await createTeamOperationReport(body, context.actor, { workspaceId: context.workspaceId });
  return Response.json(result, { headers: { "Cache-Control": "private, no-store" } });
}
