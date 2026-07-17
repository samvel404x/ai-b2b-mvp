import { requireRequestCapability, requireRequestWorkspaceContext, sessionRequiredResponse } from "../../../../lib/server/auth-session";
import {
  deleteCrmTask,
  getWorkspaceSnapshot,
  updateCrmTask,
  upsertCrmTask,
} from "../../../../lib/server/evidence-store";
import { guardMutationRequest } from "../../../../lib/server/request-security";

export const runtime = "nodejs";

function taskSummary(task) {
  return {
    id: task.id,
    reportId: task.reportId || null,
    title: task.title,
    team: task.team,
    assignee: task.assignee,
    status: task.status,
    priority: task.priority,
    priorityColor: task.priorityColor,
    date: task.date,
    checklist: task.checklist,
    attachments: task.attachments || 0,
    comments: task.comments || 0,
    tag: task.tag || null,
    progress: task.progress || 0,
    isCompleted: task.isCompleted === true,
    submittedAt: task.submittedAt || null,
    createdAt: task.createdAt || null,
    updatedAt: task.updatedAt || null,
  };
}

export async function GET(request) {
  const context = await requireRequestWorkspaceContext(request);
  if (!context) return sessionRequiredResponse();

  const workspace = await getWorkspaceSnapshot({ workspaceId: context.workspaceId });

  return Response.json(
    {
      crmTasks: (workspace.operations?.crmTasks || []).map(taskSummary),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "operations:crm-tasks:post", limit: 80, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const { context, response } = await requireRequestCapability(request, "submit_team_report");
  if (response) return response;

  const body = await request.json().catch(() => ({}));

  try {
    const result = await upsertCrmTask(body, context.actor, { workspaceId: context.workspaceId });

    return Response.json(
      {
        workspace: result.workspace,
        task: taskSummary(result.task),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return Response.json({ error: error.message || "CRM task could not be created." }, { status: 400 });
  }
}

export async function PATCH(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "operations:crm-tasks:patch", limit: 120, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const { context, response } = await requireRequestCapability(request, "submit_team_report");
  if (response) return response;

  const body = await request.json().catch(() => ({}));

  try {
    const result = await updateCrmTask(body, context.actor, { workspaceId: context.workspaceId });
    if (!result) {
      return Response.json({ error: "CRM task id is required." }, { status: 400 });
    }

    return Response.json(
      {
        workspace: result.workspace,
        task: taskSummary(result.task),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return Response.json({ error: error.message || "CRM task could not be updated." }, { status: 400 });
  }
}

export async function DELETE(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "operations:crm-tasks:delete", limit: 60, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const { context, response } = await requireRequestCapability(request, "submit_team_report");
  if (response) return response;

  const body = await request.json().catch(() => ({}));
  const result = await deleteCrmTask(body, context.actor, { workspaceId: context.workspaceId });

  if (!result) {
    return Response.json({ error: "CRM task not found." }, { status: 404 });
  }

  return Response.json(
    {
      workspace: result.workspace,
      task: taskSummary(result.task),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
