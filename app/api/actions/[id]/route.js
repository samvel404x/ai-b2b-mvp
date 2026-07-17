import { updateActionStatus } from "../../../../lib/server/evidence-store";
import { requireRequestCapability } from "../../../../lib/server/auth-session";
import { guardMutationRequest } from "../../../../lib/server/request-security";

export const runtime = "nodejs";

const allowedStatuses = new Set(["Needs review", "Needs evidence", "Ready", "Delegated", "Approved", "Rejected", "Edited", "Snoozed", "Done"]);

// Approval endpoint: records a user decision but never executes external changes directly.
export async function PATCH(request, context) {
  const guard = guardMutationRequest(request, { keyPrefix: "actions:patch", limit: 120, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const { id } = await context.params;
  const { context: workspaceContext, response } = await requireRequestCapability(request, "decide_approvals");
  if (response) return response;
  const body = await request.json().catch(() => ({}));
  const status = String(body.status || "");

  if (!allowedStatuses.has(status)) {
    return Response.json({ error: "Unsupported action status." }, { status: 400 });
  }

  const action = await updateActionStatus(id, status, workspaceContext.actor, {
    workspaceId: workspaceContext.workspaceId,
    note: body.note,
    delegateTo: body.delegateTo,
    source: body.source || "approvals",
  });

  if (!action) {
    return Response.json({ error: "Action not found." }, { status: 404 });
  }

  return Response.json({ action });
}
