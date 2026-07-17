import { publicSession, requireContextCapability, requireRequestWorkspaceContext, sessionRequiredResponse } from "../../../lib/server/auth-session";
import { getWorkspaceSnapshot } from "../../../lib/server/evidence-store";
import { isSupabaseWorkspaceStoreConfigured } from "../../../lib/server/supabase-workspace-store";

export const runtime = "nodejs";

const readyStatuses = new Set(["Ready", "Board-ready", "Board Ready"]);
const closedActionStatuses = new Set(["Approved", "Rejected", "Done"]);

function money(value) {
  return `$${Math.max(0, Math.round(Number(value || 0))).toLocaleString("en-US")}`;
}

function section(id, title, mode, state, detail) {
  return { id, title, mode, state, detail };
}

function readinessItem(id, label, done, detail, weight = 10) {
  return {
    id,
    label,
    status: done ? "ready" : "needs_work",
    done: Boolean(done),
    detail,
    weight,
  };
}

function buildReadiness(workspace, backend) {
  const evidence = workspace.evidence || [];
  const liveEvents = workspace.liveEvents || [];
  const findings = workspace.findings || [];
  const actions = workspace.actions || [];
  const reports = workspace.reports || [];
  const excelViews = workspace.excelWorkspaceViews || [];
  const excelRowCount = (workspace.spendRows || []).length + (workspace.invoices || []).length + (workspace.contracts || []).length;
  const proofTrail = workspace.proofGraph?.trail || [];
  const diagnostics = workspace.diagnostics || {};
  const auditLog = workspace.auditLog || [];
  const openActions = actions.filter((action) => !closedActionStatuses.has(action.status));
  const decisionCount = actions.reduce((sum, action) => sum + (Array.isArray(action.decisionHistory) ? action.decisionHistory.length : 0), 0);
  const agentOutputCount = (workspace.agentRuns || []).reduce((sum, run) => sum + (run.outputs?.length || 0), 0);
  const moneyAtRisk = workspace.metrics?.moneyAtRisk || findings.reduce((sum, finding) => sum + (finding.impact || 0), 0);

  const items = [
    readinessItem("evidence", "Evidence connected", evidence.length || liveEvents.length, `${evidence.length} uploaded sources / ${liveEvents.length} live events`, 12),
    readinessItem("review", "Reviewed facts available", evidence.some((record) => record.status === "Confirmed") || liveEvents.length, "Confirmed fields or normalized live events are available", 10),
    readinessItem("diagnostics", "Diagnostics generated", diagnostics.categories?.length, `${diagnostics.overallScore || 0}% diagnostic score`, 12),
    readinessItem("findings", "Risks and savings found", findings.length, `${findings.length} findings / ${money(moneyAtRisk)} at risk`, 12),
    readinessItem("proof", "Proof trails linked", proofTrail.length, `${proofTrail.length} source-to-action proof chains`, 12),
    readinessItem("agents", "Agents produced outputs", agentOutputCount, `${agentOutputCount} supervised agent outputs`, 10),
    readinessItem("approvals", "Approval queue active", actions.length, `${openActions.length} open approvals / ${decisionCount} decisions`, 10),
    readinessItem("reports", "Board reports generated", reports.length && reports.some((report) => readyStatuses.has(report.status)), `${reports.length} reports / ${reports.filter((report) => readyStatuses.has(report.status)).length} board-ready`, 10),
    readinessItem("excel", "Excel workspace data available", excelViews.length || excelRowCount, `${excelRowCount} workspace rows / ${excelViews.length} saved views`, 4),
    readinessItem("audit", "Audit trail recorded", auditLog.length || decisionCount, `${auditLog.length} audit events / ${decisionCount} human decisions`, 6),
    readinessItem("provider", "AI provider configured", backend.geminiConfigured, backend.geminiConfigured ? "Gemini key configured" : "Gemini missing; local fallback active", 3),
    readinessItem("persistence", "Persistence configured", backend.storage === "supabase", backend.storage === "supabase" ? "Supabase persistence active" : "Local fallback active", 3),
  ];

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const readyWeight = items.filter((item) => item.done).reduce((sum, item) => sum + item.weight, 0);
  const score = Math.round((readyWeight / totalWeight) * 100);

  return {
    score,
    status: score >= 85 ? "investor_ready" : score >= 65 ? "qa_ready" : "needs_setup",
    generatedAt: new Date().toISOString(),
    backend,
    metrics: {
      moneyAtRisk,
      evidence: evidence.length,
      liveEvents: liveEvents.length,
      findings: findings.length,
      actions: actions.length,
      openApprovals: openActions.length,
      proofTrails: proofTrail.length,
      reports: reports.length,
      boardReadyReports: reports.filter((report) => readyStatuses.has(report.status)).length,
      excelViews: excelViews.length,
      excelRows: excelRowCount,
      auditEvents: auditLog.length,
      humanDecisions: decisionCount,
    },
    items,
    sections: [
      section("dashboard", "Dashboard / Command Center", "working", findings.length || evidence.length ? "ready" : "needs_data", "Executive metrics, proof graph, risks, approvals, and reports."),
      section("chat", "AI Chat", "working", backend.geminiConfigured ? "ready" : "fallback", "Gemini-backed chat with workspace context; local fallback protects workspace stability."),
      section("data-intake", "Data Intake", "working", evidence.length ? "ready" : "needs_data", "Files, URL analysis, extracted fields, review, and exports."),
      section("diagnostics", "Diagnostics", "working", diagnostics.categories?.length ? "ready" : "needs_data", "Business health scoring across spend, renewals, owners, data quality, approvals, proof, and live signals."),
      section("savings-radar", "Savings Radar", "working", findings.length ? "ready" : "needs_data", "Evidence-backed risks with impact, confidence, source, owner, action, and proof trail."),
      section("agents", "Agent Control", "working", agentOutputCount ? "ready" : "needs_data", "Supervised agents produce outputs and blocked external operation drafts."),
      section("approvals", "Approvals", "working", actions.length ? "ready" : "needs_data", "Approve, reject, edit, snooze, decision history, and audit export."),
      section("reports", "Board Reports", "working", reports.length ? "ready" : "needs_data", "Board-ready report packs with metrics, findings, approvals, proof, and linked evidence."),
      section("business-live", "Business Live", "working", liveEvents.length ? "ready" : "qa_sample_available", "Webhook-ready live events for commerce, ads, supplier, inventory, and payment signals."),
      section("mobile-approval-api", "Mobile Approval API", "working", actions.length ? "ready" : "needs_data", "Compact approval queue and decision endpoint for future mobile confirmation."),
      section("crm", "CRM Layer", "roadmap", "roadmap", "Roadmap only: contacts, deals, timelines, and approval-safe CRM actions."),
      section("excel", "Excel Layer", "working", excelViews.length || excelRowCount ? "ready" : "needs_data", "Workspace-backed spend, invoice, and contract rows with saved views, CSV export, and notes. Formula execution and XLSX write-back remain locked."),
      section("native-mobile-app", "Native Mobile App", "roadmap", "roadmap", "Roadmap only: approvals, monitoring, ask-AI status, and support UI."),
    ],
    walkthroughScript: [
      "Load QA sample data or connect one file/live event.",
      "Open Data Intake and show extracted fields that require review.",
      "Open Diagnostics and explain business health categories.",
      "Open Savings Radar and show one evidence-backed risk.",
      "Open Agent Control and show supervised outputs plus blocked external operations.",
      "Open Approvals and approve/reject/edit one action.",
      "Open Board Reports and show proof chain coverage.",
      "Ask AI Chat: 'What changed and what should I approve next?'",
    ],
    nextSteps: items
      .filter((item) => !item.done)
      .map((item) => ({
        id: item.id,
        action: item.id === "provider"
          ? "Set GEMINI_API_KEY for real provider responses."
          : item.id === "persistence"
            ? "Use Supabase persistence for a stable shared workspace."
            : "Load QA sample data or connect reviewed evidence to complete this readiness gate.",
        detail: item.detail,
      })),
  };
}

function toMarkdown(readiness) {
  const lines = [
    `# GENIUS MVP Readiness`,
    "",
    `Status: ${readiness.status}`,
    `Score: ${readiness.score}%`,
    `Generated: ${readiness.generatedAt}`,
    "",
    "## Metrics",
    ...Object.entries(readiness.metrics).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Readiness Gates",
    ...readiness.items.map((item) => `- [${item.done ? "x" : " "}] ${item.label}: ${item.detail}`),
    "",
    "## Working / QA / Roadmap Sections",
    ...readiness.sections.map((item) => `- ${item.title} (${item.mode}): ${item.state} - ${item.detail}`),
    "",
    "## Walkthrough Script",
    ...readiness.walkthroughScript.map((step, index) => `${index + 1}. ${step}`),
    "",
    "## Next Steps",
    ...(readiness.nextSteps.length ? readiness.nextSteps.map((step) => `- ${step.action}`) : ["- No critical readiness gaps detected."]),
    "",
  ];

  return `${lines.join("\n")}\n`;
}

// Investor QA endpoint: shows what is working, QA-ready, or roadmap.
export async function GET(request) {
  const context = await requireRequestWorkspaceContext(request);
  if (!context) return sessionRequiredResponse();

  const url = new URL(request.url);
  const format = url.searchParams.get("format") || "json";
  if (format === "markdown") {
    const denied = requireContextCapability(context, "export_data");
    if (denied) return denied;
  }
  const workspace = await getWorkspaceSnapshot({ workspaceId: context.workspaceId });
  const liveIngestTokenConfigured = Boolean(
    process.env.GENIUS_LIVE_INGEST_SECRET
    || (process.env.GENIUS_LIVE_INGEST_TOKEN && process.env.GENIUS_LIVE_INGEST_WORKSPACE_ID),
  );
  const backend = {
    storage: isSupabaseWorkspaceStoreConfigured() ? "supabase" : "local",
    aiProvider: "Gemini",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY),
    liveIngestTokenConfigured,
    externalExecution: "disabled",
  };
  const readiness = buildReadiness(workspace, backend);

  if (format === "markdown") {
    return new Response(toMarkdown(readiness), {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="genius-mvp-readiness-${readiness.generatedAt.slice(0, 10)}.md"`,
      },
    });
  }

  return Response.json(
    {
      session: publicSession(context.session),
      readiness,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
