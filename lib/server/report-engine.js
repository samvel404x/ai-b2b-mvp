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

function reportStatus(hasData, isStrong = false) {
  if (!hasData) return "Draft";
  return isStrong ? "Ready" : "Build";
}

// Builds board-ready reports from confirmed workspace data, not frontend seed copy.
export function buildWorkspaceReports(workspace) {
  const metrics = workspace.metrics || {};
  const findings = workspace.findings || [];
  const actions = workspace.actions || [];
  const vendors = workspace.vendors || [];
  const contracts = workspace.contracts || [];
  const auditLog = workspace.auditLog || [];
  const now = new Date().toISOString();
  const openActions = actions.filter((action) => !["Approved", "Rejected", "Done"].includes(action.status));
  const approvedActions = actions.filter((action) => action.status === "Approved");
  const hasEvidence = Boolean(metrics.evidenceCount || findings.length || vendors.length);

  return [
    {
      id: "report-weekly-leak-summary",
      type: "weekly_summary",
      title: "Weekly leak summary",
      detail: `${plural(findings.length, "finding")} / ${plural(openActions.length, "open approval")} / ${money(metrics.moneyAtRisk)} at risk`,
      status: reportStatus(hasEvidence, findings.length > 0),
      summary: [
        `${money(metrics.moneyAtRisk)} estimated money at risk.`,
        `${plural(openActions.length, "approval")} still needs a human decision.`,
        `${plural(vendors.length, "vendor")} mapped from reviewed evidence.`,
      ],
      metrics: {
        moneyAtRisk: metrics.moneyAtRisk || 0,
        findings: findings.length,
        openApprovals: openActions.length,
        approvedActions: approvedActions.length,
      },
      sections: [
        {
          title: "Top findings",
          items: topItems(findings).map((finding) => ({
            label: finding.title,
            value: money(finding.impact),
            evidence: finding.evidence,
          })),
        },
        {
          title: "Approval queue",
          items: topItems(openActions).map((action) => ({
            label: action.title,
            value: action.status,
            evidence: action.description,
          })),
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
        `${plural(auditLog.length, "audit event")} captured for traceability.`,
        `${plural(vendors.length, "vendor")} can be referenced in buyer-ready reporting.`,
      ],
      metrics: {
        approvedActions: approvedActions.length,
        auditEvents: auditLog.length,
        vendors: vendors.length,
      },
      sections: [
        {
          title: "Approved actions",
          items: topItems(approvedActions).map((action) => ({
            label: action.title,
            value: money(action.impact),
            evidence: action.description,
          })),
        },
      ],
      generatedAt: now,
      updatedAt: now,
    },
  ];
}
