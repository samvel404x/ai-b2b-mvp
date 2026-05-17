import { updateActionStatus } from "../../../../lib/server/evidence-store";

export const runtime = "nodejs";

const allowedStatuses = new Set(["Needs review", "Ready", "Approved", "Rejected", "Edited", "Snoozed", "Done"]);

// Approval endpoint: records a user decision but never executes external changes directly.
export async function PATCH(request, context) {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const status = String(body.status || "");

  if (!allowedStatuses.has(status)) {
    return Response.json({ error: "Unsupported action status." }, { status: 400 });
  }

  const action = await updateActionStatus(id, status, "user");

  if (!action) {
    return Response.json({ error: "Action not found." }, { status: 404 });
  }

  return Response.json({ action });
}
