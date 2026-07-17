import { requireRequestWorkspaceContext, sessionRequiredResponse } from "../../../../lib/server/auth-session";
import {
  addSupportTicketAttachment,
  addSupportTicketComment,
  createSupportTicket,
  getWorkspaceSnapshot,
  updateSupportTicketStatus,
} from "../../../../lib/server/evidence-store";
import { guardMutationRequest } from "../../../../lib/server/request-security";

export const runtime = "nodejs";

function ticketSummary(ticket) {
  const requester = ticket.requester
    ? {
        role: ticket.requester.role || "Member",
        position: ticket.requester.position || "",
        department: ticket.requester.department || "",
      }
    : null;

  return {
    id: ticket.id,
    issueType: ticket.issueType,
    priority: ticket.priority,
    subject: ticket.subject,
    description: ticket.description,
    status: ticket.status,
    requester,
    attachments: Array.isArray(ticket.attachments)
      ? ticket.attachments.map((attachment) => ({
          id: attachment.id,
          name: attachment.name,
          type: attachment.type,
          size: attachment.size || 0,
          note: attachment.note || "",
          addedAt: attachment.addedAt || null,
        }))
      : [],
    events: Array.isArray(ticket.events)
      ? ticket.events.map((event) => ({
          id: event.id,
          type: event.type,
          message: event.message || "",
          status: event.status || "",
          attachmentId: event.attachmentId || "",
          createdAt: event.createdAt || null,
        }))
      : [],
    createdAt: ticket.createdAt || null,
    updatedAt: ticket.updatedAt || null,
    lastActivityAt: ticket.lastActivityAt || null,
  };
}

export async function GET(request) {
  const context = await requireRequestWorkspaceContext(request);
  if (!context) return sessionRequiredResponse();

  const workspace = await getWorkspaceSnapshot({ workspaceId: context.workspaceId });
  const tickets = (workspace.supportTickets || []).map(ticketSummary);

  return Response.json(
    {
      count: tickets.length,
      open: tickets.filter((ticket) => ticket.status === "open" || ticket.status === "pending").length,
      tickets,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "support:tickets:post", limit: 40, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const context = await requireRequestWorkspaceContext(request);
  if (!context) return sessionRequiredResponse();

  const body = await request.json().catch(() => ({}));

  try {
    const result = await createSupportTicket(
      body,
      { actor: context.actor, member: context.member },
      { workspaceId: context.workspaceId },
    );

    return Response.json(
      {
        workspace: result.workspace,
        ticket: ticketSummary(result.ticket),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return Response.json({ error: error.message || "Support ticket could not be created." }, { status: 400 });
  }
}

export async function PATCH(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "support:tickets:patch", limit: 80, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const context = await requireRequestWorkspaceContext(request);
  if (!context) return sessionRequiredResponse();

  const body = await request.json().catch(() => ({}));

  try {
    const action = body.action || (body.message || body.comment ? "add_comment" : body.attachment || body.name || body.fileName ? "add_attachment" : "update_status");
    if (action === "add_comment") {
      const result = await addSupportTicketComment(
        body,
        { actor: context.actor, member: context.member },
        { workspaceId: context.workspaceId },
      );

      return Response.json(
        {
          workspace: result.workspace,
          ticket: ticketSummary(result.ticket),
        },
        { headers: { "Cache-Control": "private, no-store" } },
      );
    }

    if (action === "add_attachment") {
      const result = await addSupportTicketAttachment(
        body.attachment ? { ...body.attachment, id: body.id || body.ticketId } : body,
        { actor: context.actor, member: context.member },
        { workspaceId: context.workspaceId },
      );

      return Response.json(
        {
          workspace: result.workspace,
          ticket: ticketSummary(result.ticket),
          attachment: result.attachment
            ? {
                id: result.attachment.id,
                name: result.attachment.name,
                type: result.attachment.type,
                size: result.attachment.size || 0,
                note: result.attachment.note || "",
                addedAt: result.attachment.addedAt || null,
              }
            : null,
        },
        { headers: { "Cache-Control": "private, no-store" } },
      );
    }

    const result = await updateSupportTicketStatus(
      body,
      { actor: context.actor, member: context.member },
      { workspaceId: context.workspaceId },
    );

    return Response.json(
      {
        workspace: result.workspace,
        ticket: ticketSummary(result.ticket),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return Response.json({ error: error.message || "Support ticket could not be updated." }, { status: 400 });
  }
}
