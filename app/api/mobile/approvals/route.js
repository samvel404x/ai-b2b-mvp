import { publicSession, requireRequestCapability, requireRequestWorkspaceContext, sessionRequiredResponse } from "../../../../lib/server/auth-session";
import { getWorkspaceSnapshot, updateActionStatus } from "../../../../lib/server/evidence-store";
import { guardMutationRequest } from "../../../../lib/server/request-security";

export const runtime = "nodejs";

const closedStatuses = new Set(["Approved", "Rejected", "Done"]);
const allowedDecisionStatuses = new Set(["Approved", "Rejected", "Edited", "Snoozed", "Needs review"]);

function compactProofTrail(proofTrail) {
  if (!proofTrail) return null;

  return {
    id: proofTrail.id,
    evidenceId: proofTrail.evidenceId || null,
    evidenceName: proofTrail.evidenceName || "",
    risk: proofTrail.risk || "",
    fact: proofTrail.fact || "",
    actionStatus: proofTrail.actionStatus || "",
    impact: proofTrail.impact || 0,
    steps: (proofTrail.steps || []).slice(0, 6),
  };
}

function compactApproval(action, workspace) {
  const finding = (workspace.findings || []).find((item) => item.id === action.findingId);
  const proofTrail = (workspace.proofGraph?.trail || []).find((item) => item.id === action.proofTrailId || item.findingId === action.findingId);
  const notification = (workspace.notifications || []).find((item) => item.actionId === action.id);

  return {
    id: action.id,
    title: action.title,
    description: action.description || "",
    status: action.status,
    owner: action.owner || "Human approval",
    impact: action.impact || 0,
    severity: action.severity || finding?.severity || null,
    confidence: action.confidence || finding?.confidence || 0,
    category: action.category || finding?.category || null,
    recommendedAction: action.recommendedAction || action.description || "",
    rationale: Array.isArray(action.rationale) ? action.rationale : [],
    guardrails: Array.isArray(action.guardrails) ? action.guardrails : [],
    externalExecution: {
      enabled: false,
      reason: action.externalExecution?.reason || "External execution is disabled in MVP and requires human approval.",
      connectorId: action.externalExecution?.connectorId || null,
      operation: action.externalExecution?.operation || null,
    },
    notification: notification
      ? {
          id: notification.id,
          status: notification.status,
          priority: notification.priority || "normal",
          futureChannels: notification.futureChannels || ["mobile_push"],
        }
      : null,
    proofTrail: compactProofTrail(proofTrail),
    lastDecisionAt: action.lastDecisionAt || null,
    lastDecisionBy: action.lastDecisionBy || null,
    decisionHistory: (action.decisionHistory || []).slice(0, 5),
  };
}

function mobilePayload(workspace, session) {
  const actions = workspace.actions || [];
  const openApprovals = actions.filter((action) => !closedStatuses.has(action.status));
  const queuedNotifications = (workspace.notifications || []).filter((notification) => notification.status === "queued");
  const diagnostics = workspace.diagnostics || {};

  return {
    session: publicSession(session),
    generatedAt: new Date().toISOString(),
    workspaceId: workspace.id,
    mode: "approval_first_mobile_contract",
    externalExecution: "disabled",
    summary: {
      openApprovals: openApprovals.length,
      queuedNotifications: queuedNotifications.length,
      moneyAtRisk: workspace.metrics?.moneyAtRisk || 0,
      diagnosticScore: diagnostics.overallScore || 0,
      dataQualityScore: diagnostics.dataQualityScore || 0,
      proofTrails: workspace.proofGraph?.trail?.length || 0,
      reports: workspace.reports?.length || 0,
      liveEvents: workspace.liveEvents?.length || 0,
    },
    approvals: openApprovals.slice(0, 30).map((action) => compactApproval(action, workspace)),
    notifications: queuedNotifications.slice(0, 20).map((notification) => ({
      id: notification.id,
      actionId: notification.actionId,
      title: notification.title,
      body: notification.body,
      priority: notification.priority || "normal",
      impact: notification.impact || 0,
      owner: notification.owner || "Human approval",
      futureChannels: notification.futureChannels || ["mobile_push"],
      createdAt: notification.createdAt || null,
    })),
    diagnostics: {
      overallScore: diagnostics.overallScore || 0,
      dataQualityScore: diagnostics.dataQualityScore || 0,
      categories: (diagnostics.categories || []).slice(0, 8).map((category) => ({
        id: category.id,
        label: category.label,
        score: category.score,
        status: category.status,
        impact: category.impact || 0,
        signals: category.signals || 0,
      })),
    },
    reports: (workspace.reports || []).slice(0, 5).map((report) => ({
      id: report.id,
      title: report.title,
      status: report.status,
      type: report.type || null,
      generatedAt: report.generatedAt || null,
    })),
  };
}

// Mobile-ready approval queue: compact data for phone confirmation and monitoring.
export async function GET(request) {
  const context = await requireRequestWorkspaceContext(request);
  if (!context) return sessionRequiredResponse();
  const workspace = await getWorkspaceSnapshot({ workspaceId: context.workspaceId });

  return Response.json(mobilePayload(workspace, context.session), {
    headers: { "Cache-Control": "private, no-store" },
  });
}

// Records a human decision from a mobile client. It never executes external connector actions.
export async function PATCH(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "mobile:approvals:patch", limit: 80, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const { context, response } = await requireRequestCapability(request, "decide_approvals");
  if (response) return response;
  const body = await request.json().catch(() => ({}));
  const actionId = String(body.actionId || "");
  const status = String(body.status || "");

  if (!actionId) {
    return Response.json({ error: "actionId is required." }, { status: 400 });
  }

  if (!allowedDecisionStatuses.has(status)) {
    return Response.json({ error: "Unsupported mobile approval status." }, { status: 400 });
  }

  const action = await updateActionStatus(actionId, status, context.actor, {
    workspaceId: context.workspaceId,
    note: body.note,
  });

  if (!action) {
    return Response.json({ error: "Approval action not found." }, { status: 404 });
  }

  const workspace = await getWorkspaceSnapshot({ workspaceId: context.workspaceId });

  return Response.json({
    action,
    mobile: mobilePayload(workspace, context.session),
  });
}
