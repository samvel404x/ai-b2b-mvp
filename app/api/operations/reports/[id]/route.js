import { requireRequestCapability } from "../../../../../lib/server/auth-session";
import { updateGatewayOperationReport } from "../../../../../lib/server/evidence-store";
import { guardMutationRequest } from "../../../../../lib/server/request-security";

export const runtime = "nodejs";

export async function PATCH(request, context) {
  const guard = guardMutationRequest(request, { keyPrefix: "operations:reports:patch", limit: 60, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const { context: workspaceContext, response } = await requireRequestCapability(request, "decide_gateway_report");
  if (response) return response;

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const status = String(body.status || "");
  const result = await updateGatewayOperationReport(id, status, workspaceContext.actor, {
    workspaceId: workspaceContext.workspaceId,
    note: body.note,
  });

  if (!result) {
    return Response.json({ error: "Operation report not found or update payload is unsupported." }, { status: 404 });
  }

  return Response.json(result, { headers: { "Cache-Control": "private, no-store" } });
}
