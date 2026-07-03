import { getRequestWorkspaceContext } from "../../../lib/server/auth-session";
import { getWorkspaceSnapshot, updateNotificationStatus } from "../../../lib/server/evidence-store";

export const runtime = "nodejs";

const allowedStatuses = new Set(["queued", "read", "dismissed"]);

function notificationSummary(notification) {
  return {
    id: notification.id,
    actionId: notification.actionId,
    channel: notification.channel,
    futureChannels: notification.futureChannels || [],
    title: notification.title,
    body: notification.body,
    status: notification.status,
    priority: notification.priority || "normal",
    owner: notification.owner || "Human approval",
    impact: notification.impact || 0,
    severity: notification.severity || null,
    findingId: notification.findingId || null,
    proofTrailId: notification.proofTrailId || null,
    createdAt: notification.createdAt || null,
    updatedAt: notification.updatedAt || null,
    readAt: notification.readAt || null,
    dismissedAt: notification.dismissedAt || null,
  };
}

// Lists approval-linked notifications. Mobile push will consume the same records later.
export async function GET(request) {
  const context = getRequestWorkspaceContext(request);
  const workspace = await getWorkspaceSnapshot({ workspaceId: context.workspaceId });
  const notifications = (workspace.notifications || []).map(notificationSummary);

  return Response.json(
    {
      count: notifications.length,
      unread: notifications.filter((notification) => notification.status === "queued").length,
      notifications,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

// Updates notification state only; the underlying approval action is unchanged.
export async function PATCH(request) {
  const context = getRequestWorkspaceContext(request);
  const body = await request.json().catch(() => ({}));
  const status = String(body.status || "");
  const id = body.id ? String(body.id) : "";
  const all = Boolean(body.all);

  if (!allowedStatuses.has(status)) {
    return Response.json({ error: "Unsupported notification status." }, { status: 400 });
  }

  if (!all && !id) {
    return Response.json({ error: "Notification id is required unless all=true." }, { status: 400 });
  }

  const workspace = await updateNotificationStatus(
    { id, status, all, actor: context.actor },
    { workspaceId: context.workspaceId },
  );

  if (!workspace) {
    return Response.json({ error: "Notification not found." }, { status: 404 });
  }

  return Response.json({
    workspace,
    notifications: (workspace.notifications || []).map(notificationSummary),
  });
}
