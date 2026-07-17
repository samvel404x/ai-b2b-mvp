import { requireRequestCapability, requireRequestWorkspaceContext, sessionRequiredResponse } from "../../../../lib/server/auth-session";
import {
  createReportScheduleDraft,
  getWorkspaceSnapshot,
  updateReportScheduleStatus,
} from "../../../../lib/server/evidence-store";
import { guardMutationRequest } from "../../../../lib/server/request-security";

export const runtime = "nodejs";

function scheduleSummary(schedule) {
  const owner = schedule.owner
    ? {
        role: schedule.owner.role || "Member",
        position: schedule.owner.position || "",
        department: schedule.owner.department || "",
      }
    : null;

  return {
    id: schedule.id,
    reportId: schedule.reportId,
    reportName: schedule.reportName,
    cadence: schedule.cadence,
    format: schedule.format,
    recipients: Array.isArray(schedule.recipients) ? schedule.recipients : [],
    note: schedule.note || "",
    status: schedule.status,
    owner,
    statusNote: schedule.statusNote || "",
    updatedBy: schedule.updatedBy || "",
    events: Array.isArray(schedule.events) ? schedule.events.slice(-10) : [],
    nextRunAt: schedule.nextRunAt || null,
    createdAt: schedule.createdAt || null,
    updatedAt: schedule.updatedAt || null,
  };
}

export async function GET(request) {
  const context = await requireRequestWorkspaceContext(request);
  if (!context) return sessionRequiredResponse();

  const workspace = await getWorkspaceSnapshot({ workspaceId: context.workspaceId });

  return Response.json(
    {
      reportSchedules: (workspace.reportSchedules || []).map(scheduleSummary),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "reports:schedules:post", limit: 30, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const { context, response } = await requireRequestCapability(request, "export_data");
  if (response) return response;

  const body = await request.json().catch(() => ({}));

  try {
    const result = await createReportScheduleDraft(
      body,
      { actor: context.actor, member: context.member },
      { workspaceId: context.workspaceId },
    );

    return Response.json(
      {
        workspace: result.workspace,
        schedule: scheduleSummary(result.schedule),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return Response.json({ error: error.message || "Report schedule draft could not be created." }, { status: 400 });
  }
}

export async function PATCH(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "reports:schedules:patch", limit: 60, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const { context, response } = await requireRequestCapability(request, "export_data");
  if (response) return response;

  const body = await request.json().catch(() => ({}));

  try {
    const result = await updateReportScheduleStatus(
      body,
      { actor: context.actor, member: context.member },
      { workspaceId: context.workspaceId },
    );

    return Response.json(
      {
        workspace: result.workspace,
        schedule: scheduleSummary(result.schedule),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return Response.json({ error: error.message || "Report schedule status could not be updated." }, { status: 400 });
  }
}
