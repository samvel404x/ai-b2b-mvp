function money(value) {
  const numeric = Number(value || 0);
  return `$${Math.max(0, Math.round(numeric)).toLocaleString("en-US")}`;
}

function plural(count, single, many = `${single}s`) {
  return `${count} ${count === 1 ? single : many}`;
}

function topItems(items = [], count = 3) {
  return items.slice(0, count);
}

function actionForFinding(actions = [], findingId) {
  return actions.find((action) => action.findingId === findingId) || null;
}

function findingSectionItem(finding, actions = []) {
  const action = actionForFinding(actions, finding.id);
  return {
    label: finding.title,
    value: money(finding.impact),
    evidence: finding.evidence || finding.source,
    findingId: finding.id,
    actionId: action?.id || null,
    proofTrailId: `trail:${finding.id}`,
    evidenceId: finding.evidenceId || null,
    severity: finding.severity,
    confidence: finding.confidence || 0,
    owner: finding.owner || "Unassigned",
    category: finding.category,
    status: finding.status || "Open",
    recommendedAction: finding.recommendedAction || action?.description || "",
  };
}

function actionSectionItem(action) {
  return {
    label: action.title,
    value: action.status,
    evidence: action.description,
    actionId: action.id,
    findingId: action.findingId || null,
    proofTrailId: action.proofTrailId || (action.findingId ? `trail:${action.findingId}` : null),
    evidenceId: action.evidenceId || null,
    owner: action.owner,
    impact: action.impact || 0,
    status: action.status,
  };
}

function proofSectionItem(item) {
  return {
    label: item.risk,
    value: item.actionStatus,
    evidence: `${item.evidenceName} -> ${item.fact}`,
    proofTrailId: item.id,
    findingId: item.findingId || null,
    actionId: item.actionId || null,
    evidenceId: item.evidenceId || null,
    severity: item.severity,
    confidence: item.confidence || 0,
    impact: item.impact || 0,
  };
}

function reportStatus(hasData, isStrong = false) {
  if (!hasData) return "Draft";
  return isStrong ? "Ready" : "Build";
}

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function filenameSafe(value) {
  return String(value || "report")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "report";
}

// Builds board-ready reports from confirmed workspace data, not frontend seed copy.
export function buildWorkspaceReports(workspace) {
  const metrics = workspace.metrics || {};
  const findings = workspace.findings || [];
  const actions = workspace.actions || [];
  const vendors = workspace.vendors || [];
  const contracts = workspace.contracts || [];
  const liveEvents = workspace.liveEvents || [];
  const auditLog = workspace.auditLog || [];
  const diagnostics = workspace.diagnostics || {};
  const proofTrail = workspace.proofGraph?.trail || [];
  const now = new Date().toISOString();
  const openActions = actions.filter((action) => !["Approved", "Rejected", "Done"].includes(action.status));
  const approvedActions = actions.filter((action) => action.status === "Approved");
  const decisionItems = actions.flatMap((action) =>
    (Array.isArray(action.decisionHistory) ? action.decisionHistory : []).map((decision) => ({
      action,
      decision,
    })),
  );
  const hasEvidence = Boolean(metrics.evidenceCount || findings.length || vendors.length);
  const hasReportInput = Boolean(hasEvidence || actions.length || liveEvents.length || proofTrail.length);

  if (!hasReportInput) return [];

  return [
    {
      id: "report-weekly-leak-summary",
      type: "weekly_summary",
      title: "Weekly leak summary",
      detail: `${plural(findings.length, "finding")} / ${plural(openActions.length, "open approval")} / ${money(metrics.moneyAtRisk)} at risk / ${diagnostics.overallScore || 0} diagnostic score`,
      status: reportStatus(hasEvidence, findings.length > 0),
      summary: [
        `${money(metrics.moneyAtRisk)} estimated money at risk.`,
        `${plural(openActions.length, "approval")} still needs a human decision.`,
        `${plural(proofTrail.length, "proof trail")} connects evidence to actions.`,
        `${plural(vendors.length, "vendor")} mapped from reviewed evidence.`,
      ],
      metrics: {
        moneyAtRisk: metrics.moneyAtRisk || 0,
        findings: findings.length,
        openApprovals: openActions.length,
        approvedActions: approvedActions.length,
        diagnosticScore: diagnostics.overallScore || 0,
      },
      sections: [
        {
          title: "Top findings",
          items: topItems(findings).map((finding) => findingSectionItem(finding, actions)),
        },
        {
          title: "Approval queue",
          items: topItems(openActions).map(actionSectionItem),
        },
        {
          title: "Decision history",
          items: topItems(decisionItems).map(({ action, decision }) => ({
            label: action.title,
            value: decision.status,
            evidence: `${decision.actor || "user"} - ${decision.note || "No note"} - ${decision.createdAt}`,
            actionId: action.id,
            findingId: action.findingId || null,
            proofTrailId: action.proofTrailId || (action.findingId ? `trail:${action.findingId}` : null),
            evidenceId: action.evidenceId || null,
          })),
        },
        {
          title: "Proof trails",
          items: topItems(proofTrail).map(proofSectionItem),
        },
      ],
      generatedAt: now,
      updatedAt: now,
    },
    {
      id: "report-renewal-risk",
      type: "renewal_risk",
      title: "Renewal risk report",
      detail: `${plural(contracts.length, "contract")} tracked / ${plural(findings.filter((finding) => finding.category === "Renewal").length, "renewal signal")}`,
      status: reportStatus(contracts.length > 0),
      summary: [
        `${plural(contracts.length, "reviewed contract")} available for renewal tracking.`,
        `${plural(findings.filter((finding) => finding.category === "Renewal").length, "renewal finding")} currently detected.`,
        "Every renewal action remains approval-first.",
      ],
      metrics: {
        contracts: contracts.length,
        renewalFindings: findings.filter((finding) => finding.category === "Renewal").length,
        openApprovals: openActions.length,
      },
      sections: [
        {
          title: "Contracts",
          items: topItems(contracts).map((contract) => ({
            label: contract.vendorName,
            value: contract.renewalDate || "No renewal date",
            evidence: contract.evidenceId,
            evidenceId: contract.evidenceId || null,
          })),
        },
      ],
      generatedAt: now,
      updatedAt: now,
    },
    {
      id: "report-savings-proof-pack",
      type: "savings_proof_pack",
      title: "Savings proof pack",
      detail: `${plural(approvedActions.length, "approved action")} / ${plural(auditLog.length, "audit event")}`,
      status: reportStatus(approvedActions.length > 0 || auditLog.length > 0),
      summary: [
        `${plural(approvedActions.length, "approved action")} ready for proof tracking.`,
        `${plural(decisionItems.length, "human decision")} recorded in the approval trail.`,
        `${plural(auditLog.length, "audit event")} captured for traceability.`,
        `${plural(vendors.length, "vendor")} can be referenced in buyer-ready reporting.`,
      ],
      metrics: {
        approvedActions: approvedActions.length,
        auditEvents: auditLog.length,
        vendors: vendors.length,
        proofTrails: proofTrail.length,
        decisions: decisionItems.length,
      },
      sections: [
        {
          title: "Approved actions",
          items: topItems(approvedActions).map((action) => ({
            ...actionSectionItem(action),
            value: money(action.impact),
          })),
        },
        {
          title: "Decision trail",
          items: topItems(decisionItems).map(({ action, decision }) => ({
            label: action.title,
            value: decision.status,
            evidence: `${decision.actor || "user"}: ${decision.note || "No note"}`,
            actionId: action.id,
            findingId: action.findingId || null,
            proofTrailId: action.proofTrailId || (action.findingId ? `trail:${action.findingId}` : null),
            evidenceId: action.evidenceId || null,
          })),
        },
        {
          title: "Evidence chain",
          items: topItems(proofTrail).map((item) => ({
            ...proofSectionItem(item),
            label: item.evidenceName,
            value: item.risk,
            evidence: item.steps.map((step) => `${step.label}: ${step.status}`).join(" / "),
          })),
        },
      ],
      generatedAt: now,
      updatedAt: now,
    },
    {
      id: "report-business-live-pulse",
      type: "business_live_pulse",
      title: "Business Live pulse",
      detail: `${plural(metrics.liveEventCount || liveEvents.length, "live event")} / ${money(metrics.liveRevenue)} revenue / ${metrics.liveMarginPercent || 0}% margin`,
      status: reportStatus((metrics.liveEventCount || liveEvents.length) > 0, (metrics.liveEventCount || liveEvents.length) > 0),
      summary: [
        `${money(metrics.liveRevenue)} live revenue captured from connected events.`,
        `${metrics.liveRefundRate || 0}% refund and chargeback rate.`,
        `${metrics.liveRoas ?? 0}x paid traffic ROAS.`,
        `${money(metrics.liveUnfulfilledSpend)} supplier/fulfillment exposure needs review.`,
      ],
      metrics: {
        liveEvents: metrics.liveEventCount || liveEvents.length,
        liveRevenue: metrics.liveRevenue || 0,
        liveRefundRate: metrics.liveRefundRate || 0,
        liveMarginPercent: metrics.liveMarginPercent || 0,
        liveRoas: metrics.liveRoas || 0,
        unfulfilledSpend: metrics.liveUnfulfilledSpend || 0,
      },
      sections: [
        {
          title: "Recent live signals",
          items: topItems(liveEvents, 5).map((event) => ({
            label: event.name,
            value: `${event.type} / ${money(event.amount)}`,
            evidence: `${event.channel || event.source} - ${event.status} - ${event.occurredAt}`,
            liveEventId: event.id || null,
          })),
        },
        {
          title: "Live risks",
          items: topItems(findings.filter((finding) => ["Live Commerce", "Marketing Spend", "Fulfillment", "Inventory"].includes(finding.category))).map((finding) => findingSectionItem(finding, actions)),
        },
      ],
      generatedAt: now,
      updatedAt: now,
    },
  ];
}

export function getWorkspaceReport(workspace, reportId) {
  const reports = workspace.reports || [];
  return reports.find((report) => report.id === reportId) || reports[0] || null;
}

export function buildReportDetail(workspace, reportId) {
  const report = getWorkspaceReport(workspace, reportId);
  if (!report) return null;

  const findingIds = new Set(
    (report.sections || [])
      .flatMap((section) => section.items || [])
      .map((item) => item.findingId)
      .filter(Boolean),
  );
  const actionIds = new Set(
    (report.sections || [])
      .flatMap((section) => section.items || [])
      .map((item) => item.actionId)
      .filter(Boolean),
  );

  const relatedFindings = findingIds.size
    ? (workspace.findings || []).filter((finding) => findingIds.has(finding.id))
    : (workspace.findings || []).slice(0, 12);
  const relatedActions = actionIds.size
    ? (workspace.actions || []).filter((action) => actionIds.has(action.id))
    : (workspace.actions || []).slice(0, 12);

  return {
    report,
    generatedAt: new Date().toISOString(),
    workspace: {
      id: workspace.id,
      metrics: workspace.metrics || {},
      diagnostics: workspace.diagnostics || {},
    },
    evidence: (workspace.evidence || []).slice(0, 20).map((record) => ({
      id: record.id,
      name: record.name,
      kind: record.kind,
      status: record.status,
      fields: record.fields || {},
      confidence: record.confidence || 0,
    })),
    findings: relatedFindings,
    actions: relatedActions,
    proofTrail: (workspace.proofGraph?.trail || []).slice(0, 20),
    liveEvents: (workspace.liveEvents || []).slice(0, 20),
    auditLog: (workspace.auditLog || []).slice(0, 30),
  };
}

export function reportExportFilename(report, format) {
  const extension = format === "markdown" ? "md" : format;
  return `${filenameSafe(report?.title || report?.id || "genius-report")}.${extension}`;
}

export function serializeReportDetail(detail, format = "json") {
  if (!detail) return null;

  if (format === "json") {
    return {
      contentType: "application/json; charset=utf-8",
      body: `${JSON.stringify(detail, null, 2)}\n`,
    };
  }

  if (format === "csv") {
    const rows = [
      ["section", "label", "value", "evidence"].map(csvCell).join(","),
      ...(detail.report.sections || []).flatMap((section) =>
        (section.items || []).map((item) =>
          [
            section.title,
            item.label,
            item.value,
            item.evidence,
          ].map(csvCell).join(","),
        ),
      ),
      ...detail.findings.map((finding) =>
        [
          "Findings",
          finding.title,
          finding.impact || 0,
          finding.evidence || finding.source || "",
        ].map(csvCell).join(","),
      ),
      ...detail.actions.map((action) =>
        [
          "Actions",
          action.title,
          action.status,
          action.reviewNote || action.description || "",
        ].map(csvCell).join(","),
      ),
    ];

    return {
      contentType: "text/csv; charset=utf-8",
      body: `${rows.join("\n")}\n`,
    };
  }

  const markdown = [
    `# ${detail.report.title}`,
    "",
    detail.report.detail || "",
    "",
    "## Summary",
    ...(detail.report.summary || []).map((item) => `- ${item}`),
    "",
    "## Metrics",
    ...Object.entries(detail.report.metrics || {}).map(([key, value]) => `- **${key}**: ${value}`),
    "",
    "## Sections",
    ...(detail.report.sections || []).flatMap((section) => [
      `### ${section.title}`,
      ...(section.items || []).map((item) => `- **${item.label}**: ${item.value || ""}${item.evidence ? ` (${item.evidence})` : ""}`),
      "",
    ]),
    "## Proof Trail",
    ...detail.proofTrail.map((item) => `- ${item.evidenceName} -> ${item.fact} -> ${item.risk} -> ${item.actionStatus}`),
    "",
    "## Approval Decisions",
    ...detail.actions.flatMap((action) =>
      (Array.isArray(action.decisionHistory) && action.decisionHistory.length ? action.decisionHistory : [{ status: action.status, note: action.reviewNote || "No reviewer note", actor: action.lastDecisionBy || "user", createdAt: action.lastDecisionAt }])
        .map((decision) => `- ${action.title}: ${decision.status} by ${decision.actor || "user"}${decision.note ? ` - ${decision.note}` : ""}`),
    ),
    "",
  ].join("\n");

  return {
    contentType: "text/markdown; charset=utf-8",
    body: markdown,
  };
}
