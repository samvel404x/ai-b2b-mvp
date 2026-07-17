import { requireRequestCapability } from "../../../../lib/server/auth-session";
import { appendB2bThreadMessage, updateB2bDiscussion, updateB2bWorkflowStatus } from "../../../../lib/server/evidence-store";
import { guardMutationRequest } from "../../../../lib/server/request-security";

export const runtime = "nodejs";

const allowedWorkflowStatuses = new Set(["Pending Approval", "Approved", "Rejected"]);

function cleanText(value, maxLength = 4000) {
  return String(value || "").trim().slice(0, maxLength);
}

// Adds a supervised B2B thread message. This records conversation context only; it never performs external partner actions.
export async function POST(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "operations:b2b:post", limit: 80, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const { context, response } = await requireRequestCapability(request, "send_b2b_message");
  if (response) return response;
  const body = await request.json().catch(() => ({}));
  const text = cleanText(body.text);

  if (!text) {
    return Response.json({ error: "Message text is required." }, { status: 400 });
  }

  const result = await appendB2bThreadMessage(
    {
      ...body,
      text,
    },
    context.actor,
    { workspaceId: context.workspaceId },
  );

  return Response.json(result, { headers: { "Cache-Control": "private, no-store" } });
}

// Updates the approval-gated workflow state for a B2B thread without executing finance/vendor changes.
export async function PATCH(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "operations:b2b:patch", limit: 60, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const body = await request.json().catch(() => ({}));
  const action = cleanText(body.action, 80).toLowerCase();

  if (action === "update_discussion") {
    const { context, response } = await requireRequestCapability(request, "send_b2b_message");
    if (response) return response;

    const result = await updateB2bDiscussion(
      { ...body, action: cleanText(body.operation || body.discussionAction, 40) || "upsert" },
      context.actor,
      { workspaceId: context.workspaceId },
    );

    if (!result) {
      return Response.json({ error: "B2B discussion could not be updated." }, { status: 400 });
    }

    return Response.json(result, { headers: { "Cache-Control": "private, no-store" } });
  }

  const { context, response } = await requireRequestCapability(request, "approve_b2b_workflow");
  if (response) return response;
  const status = String(body.status || "");

  if (!allowedWorkflowStatuses.has(status)) {
    return Response.json({ error: "Unsupported B2B workflow status." }, { status: 400 });
  }

  const result = await updateB2bWorkflowStatus(
    status,
    context.actor,
    {
      workspaceId: context.workspaceId,
      discussionId: cleanText(body.discussionId, 120),
    },
  );

  if (!result) {
    return Response.json({ error: "B2B workflow could not be updated." }, { status: 404 });
  }

  return Response.json(result, { headers: { "Cache-Control": "private, no-store" } });
}
