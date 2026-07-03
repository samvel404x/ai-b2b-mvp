import { getRequestWorkspaceContext, publicSession } from "../../../lib/server/auth-session";
import { getWorkspaceSnapshot } from "../../../lib/server/evidence-store";

export const runtime = "nodejs";

function compactFinding(finding) {
  return {
    id: finding.id,
    title: finding.title,
    category: finding.category,
    severity: finding.severity,
    impact: finding.impact || 0,
    confidence: finding.confidence || 0,
    status: finding.status,
    source: finding.source,
    recommendedAction: finding.recommendedAction,
  };
}

function compactAction(action) {
  return {
    id: action.id,
    findingId: action.findingId,
    agentId: action.agentId || null,
    category: action.category || null,
    severity: action.severity || null,
    confidence: action.confidence || 0,
    evidenceId: action.evidenceId || null,
    evidenceName: action.evidenceName || null,
    proofTrailId: action.proofTrailId || null,
    title: action.title,
    description: action.description,
    status: action.status,
    impact: action.impact || 0,
    owner: action.owner,
    rationale: Array.isArray(action.rationale) ? action.rationale : [],
    guardrails: Array.isArray(action.guardrails) ? action.guardrails : [],
    lastDecisionAt: action.lastDecisionAt || null,
    lastDecisionBy: action.lastDecisionBy || null,
  };
}

// Dedicated diagnostics contract for dashboards, mobile monitoring, and investor QA.
export async function GET(request) {
  const context = getRequestWorkspaceContext(request);
  const workspace = await getWorkspaceSnapshot({ workspaceId: context.workspaceId });
  const openActions = (workspace.actions || []).filter((action) => !["Approved", "Rejected", "Done"].includes(action.status));

  return Response.json(
    {
      session: publicSession(context.session),
      diagnostics: workspace.diagnostics || {},
      metrics: workspace.metrics || {},
      categories: workspace.diagnostics?.categories || [],
      topFindings: (workspace.findings || []).slice(0, 8).map(compactFinding),
      openActions: openActions.slice(0, 8).map(compactAction),
      proofTrail: workspace.proofGraph?.trail?.slice(0, 8) || [],
      live: {
        events: workspace.liveEvents?.length || 0,
        revenue: workspace.metrics?.liveRevenue || 0,
        marginPercent: workspace.metrics?.liveMarginPercent || 0,
        refundRate: workspace.metrics?.liveRefundRate || 0,
        roas: workspace.metrics?.liveRoas || null,
      },
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
