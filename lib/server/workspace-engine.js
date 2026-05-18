import crypto from "node:crypto";

export const connectorCatalog = [
  {
    id: "manual-upload",
    name: "Manual upload",
    type: "files",
    status: "active",
    description: "Contracts, invoices, spend exports, screenshots, and text files.",
  },
  {
    id: "url-analysis",
    name: "URL analysis",
    type: "web",
    status: "active",
    description: "Vendor pricing, terms, and public business pages with SSRF protections.",
  },
  {
    id: "database-connector",
    name: "Database connector",
    type: "database",
    status: "planned",
    description: "Future read/write business database connector guarded by approvals.",
  },
  {
    id: "mobile-approvals",
    name: "Mobile approvals",
    type: "notifications",
    status: "planned",
    description: "Future push notifications for approve/reject/edit decisions.",
  },
];

export const agentDefinitions = [
  {
    id: "contract",
    name: "Contract Analyst",
    capability: "Extract renewal dates, clauses, notice periods, and contract evidence.",
    permission: "read_evidence_prepare_findings",
  },
  {
    id: "spend",
    name: "Spend Auditor",
    capability: "Find duplicate vendors, recurring spend, and invoice mismatches.",
    permission: "read_spend_prepare_findings",
  },
  {
    id: "finance",
    name: "Finance Watcher",
    capability: "Monitor upcoming renewals, missing owners, and exposed spend.",
    permission: "read_confirmed_records_prepare_alerts",
  },
  {
    id: "action",
    name: "Action Drafter",
    capability: "Prepare approval-safe action drafts without executing them.",
    permission: "draft_actions_requires_human_approval",
  },
];

function nowIso() {
  return new Date().toISOString();
}

function hashId(prefix, value) {
  return `${prefix}-${crypto.createHash("sha1").update(value).digest("hex").slice(0, 14)}`;
}

function parseMoney(value) {
  const normalized = String(value || "")
    .replace(/[^0-9.,-]/g, "")
    .replace(/,/g, "");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? Math.round(parsed) : 0;
}

function daysUntil(dateValue) {
  const timestamp = Date.parse(dateValue);
  if (!Number.isFinite(timestamp)) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((timestamp - today.getTime()) / 86400000);
}

function parseNoticeDays(value) {
  const match = String(value || "").match(/\d{1,3}/);
  return match ? Number.parseInt(match[0], 10) : null;
}

function normalizeVendorName(value) {
  return String(value || "Uploaded vendor").trim().replace(/\s+/g, " ").slice(0, 120) || "Uploaded vendor";
}

function currencyFromExtraction(extracted = {}) {
  return extracted.currency || "USD";
}

function isReviewedEvidence(record) {
  return record?.status === "Confirmed";
}

function severityForImpact(impact, urgent = false) {
  if (urgent || impact >= 5000) return "Critical";
  if (impact >= 1500) return "High";
  return "Watch";
}

function findingBase(record, category, title, impact, evidence, recommendedAction, confidence = 72) {
  const severity = severityForImpact(impact, category === "Renewal" && /closes/i.test(title));
  return {
    id: hashId("finding", `${record.id}:${category}:${title}`),
    evidenceId: record.id,
    title,
    category,
    severity,
    impact,
    confidence,
    owner: record.fields?.owner || "Unassigned",
    source: record.name,
    evidence,
    recommendedAction,
    status: "Open",
    requiresApproval: true,
    createdAt: record.createdAt || nowIso(),
    updatedAt: nowIso(),
  };
}

// Converts confirmed evidence records into deterministic leak findings.
export function buildFindingsFromEvidence(evidence = []) {
  const findings = [];

  for (const record of evidence) {
    const fields = record.fields ?? {};
    const value = parseMoney(fields.value);
    const renewalDays = daysUntil(fields.renewal);
    const hasConfirmedData = record.status === "Confirmed" || record.status === "Needs review";

    if (!hasConfirmedData) continue;

    if (fields.renewal && !/pending|not detected/i.test(fields.renewal)) {
      const urgent = renewalDays !== null && renewalDays <= 45;
      findings.push(
        findingBase(
          record,
          "Renewal",
          urgent ? `Renewal window needs review in ${Math.max(renewalDays, 0)} days` : "Renewal date captured for monitoring",
          Math.max(value, 900),
          `${record.name}: renewal=${fields.renewal}, notice=${fields.notice || "unknown"}`,
          "Confirm owner, notice period, and whether cancellation or renegotiation is needed.",
          record.confidence || 76,
        ),
      );
    }

    if (!fields.owner || /pending|unknown|unassigned/i.test(fields.owner)) {
      findings.push(
        findingBase(
          record,
          "Ownership",
          "Vendor has no confirmed internal owner",
          Math.max(Math.round(value * 0.15), 500),
          `${record.name}: owner is missing from reviewed fields.`,
          "Assign an owner before renewal, invoice dispute, or spend change.",
          68,
        ),
      );
    }

    if (record.kind === "CSV" || record.kind === "Excel" || record.kind === "PDF") {
      findings.push(
        findingBase(
          record,
          "Spend",
          "Spend source is ready for mismatch review",
          Math.max(Math.round(value * 0.12), 650),
          `${record.name}: value=${fields.value || "unknown"}.`,
          "Compare confirmed contract value against invoice or recurring spend records.",
          62,
        ),
      );
    }
  }

  const byId = new Map();
  for (const finding of findings) {
    byId.set(finding.id, finding);
  }

  return Array.from(byId.values()).sort((a, b) => b.impact - a.impact);
}

// Converts reviewed evidence into normalized business entities for the database layer.
export function buildBusinessEntitiesFromEvidence(evidence = []) {
  const vendorsById = new Map();
  const contracts = [];
  const invoices = [];
  const spendRows = [];

  for (const record of evidence) {
    if (!isReviewedEvidence(record)) continue;

    const fields = record.fields ?? {};
    const extracted = record.extracted ?? {};
    const vendorName = normalizeVendorName(fields.vendor || extracted.vendor_name);
    const vendorId = hashId("vendor", vendorName.toLowerCase());
    const value = parseMoney(fields.value || extracted.contract_value || extracted.invoice_total);
    const owner = fields.owner || extracted.owner || "Unassigned";

    const existingVendor = vendorsById.get(vendorId);
    vendorsById.set(vendorId, {
      id: vendorId,
      name: vendorName,
      owner: existingVendor?.owner && existingVendor.owner !== "Unassigned" ? existingVendor.owner : owner,
      sourceEvidenceIds: Array.from(new Set([...(existingVendor?.sourceEvidenceIds || []), record.id])),
      totalExposure: (existingVendor?.totalExposure || 0) + value,
      status: owner === "Unassigned" ? "Needs owner" : "Active",
      createdAt: existingVendor?.createdAt || record.createdAt || nowIso(),
      updatedAt: nowIso(),
    });

    if (fields.renewal || extracted.end_date || extracted.renewal_date || record.kind === "PDF" || record.kind === "Document") {
      contracts.push({
        id: hashId("contract", `${record.id}:${vendorId}`),
        vendorId,
        vendorName,
        evidenceId: record.id,
        value,
        currency: currencyFromExtraction(extracted),
        startDate: extracted.start_date || null,
        endDate: extracted.end_date || null,
        renewalDate: fields.renewal || extracted.renewal_date || extracted.end_date || null,
        noticePeriodDays: parseNoticeDays(fields.notice || extracted.notice_period_days),
        autoRenewal: extracted.auto_renewal ?? null,
        status: "Reviewed",
        createdAt: record.createdAt || nowIso(),
        updatedAt: nowIso(),
      });
    }

    if (extracted.invoice_number || extracted.invoice_total || /invoice/i.test(record.name || "")) {
      invoices.push({
        id: hashId("invoice", `${record.id}:${extracted.invoice_number || record.name}`),
        vendorId,
        vendorName,
        evidenceId: record.id,
        invoiceNumber: extracted.invoice_number || null,
        total: parseMoney(extracted.invoice_total || fields.value),
        currency: currencyFromExtraction(extracted),
        status: "Reviewed",
        createdAt: record.createdAt || nowIso(),
        updatedAt: nowIso(),
      });
    }

    if (record.kind === "CSV" || record.kind === "Excel") {
      spendRows.push({
        id: hashId("spend", `${record.id}:${vendorId}`),
        vendorId,
        vendorName,
        evidenceId: record.id,
        amount: value,
        currency: currencyFromExtraction(extracted),
        source: record.name,
        status: "Reviewed",
        createdAt: record.createdAt || nowIso(),
        updatedAt: nowIso(),
      });
    }
  }

  return {
    vendors: Array.from(vendorsById.values()).sort((a, b) => b.totalExposure - a.totalExposure),
    contracts,
    invoices,
    spendRows,
  };
}

function actionFromFinding(finding, existingAction) {
  return {
    id: hashId("action", finding.id),
    findingId: finding.id,
    title: `Approve next step: ${finding.title}`,
    description: finding.recommendedAction,
    impact: finding.impact,
    owner: finding.owner === "Unassigned" ? "Founder approval" : `${finding.owner} approval`,
    status: existingAction?.status || "Needs review",
    approvalChannel: existingAction?.approvalChannel || "web",
    mobileReady: false,
    externalExecution: {
      enabled: false,
      connectorId: null,
      operation: null,
      reason: "External DB/CRM writes stay disabled until connector permissions exist.",
    },
    createdAt: existingAction?.createdAt || nowIso(),
    updatedAt: nowIso(),
  };
}

// Creates approval-safe actions; no action can execute without a user decision.
export function buildActionsFromFindings(findings = [], existingActions = []) {
  const existingByFinding = new Map(existingActions.map((action) => [action.findingId, action]));
  return findings.map((finding) => actionFromFinding(finding, existingByFinding.get(finding.id)));
}

// Updates agent status based on current workspace data without pretending to execute work.
export function buildAgentRuns(evidence = [], findings = [], existingRuns = []) {
  const existingByAgent = new Map(existingRuns.map((run) => [run.agentId, run]));
  const counts = {
    contract: evidence.filter((record) => ["PDF", "Document", "Text", "Image"].includes(record.kind)).length,
    spend: evidence.filter((record) => ["CSV", "Excel"].includes(record.kind)).length,
    finance: findings.filter((finding) => finding.category === "Renewal" || finding.category === "Ownership").length,
    action: findings.length,
  };

  return agentDefinitions.map((agent) => {
    const previous = existingByAgent.get(agent.id);
    const workload = counts[agent.id] ?? 0;
    return {
      id: previous?.id || hashId("agent-run", agent.id),
      agentId: agent.id,
      name: agent.name,
      capability: agent.capability,
      permission: agent.permission,
      status: workload ? "Ready" : "Waiting",
      workload,
      lastRunAt: workload ? nowIso() : previous?.lastRunAt || null,
      guardrail: "Cannot execute external changes without explicit approval.",
    };
  });
}

// Produces in-app notification records that can later map to mobile push notifications.
export function buildApprovalNotifications(actions = [], existingNotifications = []) {
  const existingByAction = new Map(existingNotifications.map((notification) => [notification.actionId, notification]));

  return actions
    .filter((action) => action.status === "Needs review" || action.status === "Ready")
    .map((action) => ({
      id: existingByAction.get(action.id)?.id || hashId("notification", action.id),
      actionId: action.id,
      channel: "in_app",
      futureChannels: ["mobile_push"],
      title: "Approval required",
      body: action.title,
      status: existingByAction.get(action.id)?.status || "queued",
      createdAt: existingByAction.get(action.id)?.createdAt || nowIso(),
      updatedAt: nowIso(),
    }));
}

export function createAuditEvent(type, actor, details = {}) {
  return {
    id: hashId("audit", `${type}:${actor}:${nowIso()}:${JSON.stringify(details)}`),
    type,
    actor,
    details,
    createdAt: nowIso(),
  };
}

export function summarizeWorkspace(workspace) {
  const findings = workspace.findings || [];
  const actions = workspace.actions || [];
  const openActions = actions.filter((action) => !["Approved", "Rejected", "Done"].includes(action.status));

  return {
    moneyAtRisk: findings.reduce((sum, finding) => sum + (finding.impact || 0), 0),
    evidenceCount: workspace.evidence?.length || 0,
    findingCount: findings.length,
    openApprovalCount: openActions.length,
    approvedActionCount: actions.filter((action) => action.status === "Approved").length,
    activeAgentCount: (workspace.agentRuns || []).filter((run) => run.status !== "Paused").length,
    vendorCount: workspace.vendors?.length || 0,
    contractCount: workspace.contracts?.length || 0,
    invoiceCount: workspace.invoices?.length || 0,
    spendRowCount: workspace.spendRows?.length || 0,
  };
}

// Rebuilds derived product state after upload, review, delete, or agent refresh.
export function syncDerivedWorkspaceData(workspace) {
  const businessEntities = buildBusinessEntitiesFromEvidence(workspace.evidence || []);
  const findings = buildFindingsFromEvidence(workspace.evidence || []);
  const actions = buildActionsFromFindings(findings, workspace.actions || []);
  const agentRuns = buildAgentRuns(workspace.evidence || [], findings, workspace.agentRuns || []);
  const notifications = buildApprovalNotifications(actions, workspace.notifications || []);

  return {
    ...workspace,
    ...businessEntities,
    findings,
    actions,
    agentRuns,
    notifications,
    connectors: connectorCatalog,
    metrics: summarizeWorkspace({ ...workspace, ...businessEntities, findings, actions, agentRuns, notifications }),
  };
}
