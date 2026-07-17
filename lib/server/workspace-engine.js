import crypto from "node:crypto";
import { buildWorkspaceReports } from "./report-engine";
import {
  buildBusinessEntitiesFromLiveEvents,
  buildFindingsFromLiveEvents,
  liveEventToEvidenceRecord,
  normalizeLiveEvents,
  summarizeLiveEvents,
} from "./live-events";

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
    id: "business-live",
    name: "Business Live",
    type: "live_events",
    status: "active",
    description: "Live purchases, refunds, ad spend, supplier orders, fulfillment, and inventory signals.",
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
  {
    id: "langflow-demo",
    name: "Langflow Demo Agent",
    capability: "Orchestrate an investor-ready brief from evidence, findings, approvals, and proof trails.",
    permission: "langflow_demo_artifact_only_requires_human_approval",
  },
];

export const agentRunStatuses = Object.freeze(["Waiting", "Ready", "Running", "Paused", "Completed", "Failed"]);

const agentRunStatusSet = new Set(agentRunStatuses);
const manuallyManagedAgentRunStatuses = new Set(["Running", "Paused", "Completed", "Failed"]);

function cleanRuntimeText(value, fallback = "", maxLength = 200) {
  const text = String(value || "").trim();
  return (text || fallback).slice(0, maxLength);
}

function isValidRuntimeUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}

function langflowRuntimeSummary() {
  const enabled = process.env.LANGFLOW_DEMO_ENABLED === "1" || process.env.GENIUS_LANGFLOW_ENABLED === "1";
  const serverUrl = cleanRuntimeText(process.env.LANGFLOW_SERVER_URL || process.env.LANGFLOW_BASE_URL, "", 500).replace(/\/+$/, "");
  const flowId = cleanRuntimeText(process.env.LANGFLOW_FLOW_ID || process.env.FLOW_ID, "genius-investor-demo-agent", 160);
  const configured = Boolean(enabled && serverUrl && flowId && process.env.LANGFLOW_API_KEY && isValidRuntimeUrl(serverUrl));

  return {
    provider: configured ? "Langflow HTTP adapter" : "Local supervised fallback",
    enabled,
    configured,
    status: configured ? "configured" : enabled ? "missing_credentials_or_url" : "disabled",
    flowId,
    serverOrigin: configured ? new URL(serverUrl).origin : "",
    blueprintPath: "langflow/genius-demo-agent.blueprint.json",
    docs: "https://docs.langflow.org/api-flows-run",
    externalExecution: {
      enabled: false,
      reason: "Langflow demo output is saved as an artifact only; external execution requires human approval.",
    },
  };
}

function nowIso() {
  return new Date().toISOString();
}

function hashId(prefix, value) {
  return `${prefix}-${crypto.createHash("sha1").update(value).digest("hex").slice(0, 14)}`;
}

function normalizeAgentRunEvents(events = []) {
  if (!Array.isArray(events)) return [];
  return events
    .filter((event) => event && typeof event === "object")
    .map((event) => ({
      id: String(event.id || hashId("agent-event", JSON.stringify(event))),
      type: String(event.type || "status_updated").slice(0, 80),
      actor: String(event.actor || "system").slice(0, 254),
      status: agentRunStatusSet.has(event.status) ? event.status : null,
      message: String(event.message || "").slice(0, 500),
      createdAt: Number.isFinite(Date.parse(event.createdAt)) ? event.createdAt : nowIso(),
    }))
    .slice(0, 50);
}

function deriveAgentRunStatus(workload, previous) {
  const previousStatus = agentRunStatusSet.has(previous?.status) ? previous.status : "";

  if (!workload) return "Waiting";
  if (manuallyManagedAgentRunStatuses.has(previousStatus)) return previousStatus;
  return "Ready";
}

function deriveAgentRunProgress(status, workload, previous) {
  if (!workload) return 0;
  if (status === "Completed" || status === "Ready") return 100;
  if (status === "Failed") return Math.max(10, Math.min(100, Number(previous?.progress) || 100));
  if (status === "Paused") return Math.max(10, Math.min(95, Number(previous?.progress) || 65));
  if (status === "Running") return Math.max(25, Math.min(95, Number(previous?.progress) || 70));
  return Math.max(20, Math.min(80, Number(previous?.progress) || 35));
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

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function compactText(value, fallback = "Pending review", maxLength = 90) {
  const text = String(value || fallback).trim() || fallback;
  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
}

function factLabelFromEvidence(record) {
  const fields = record?.fields ?? {};
  const pieces = [
    fields.vendor && `vendor ${fields.vendor}`,
    fields.value && `value ${fields.value}`,
    fields.renewal && `renewal ${fields.renewal}`,
    fields.notice && `notice ${fields.notice}`,
  ];

  return compactText(pieces.filter(Boolean).join(" / "), `${record?.kind || "Evidence"} extracted fields`);
}

function agentIdForFinding(finding) {
  if (finding.category === "Live Commerce" || finding.category === "Inventory") return "finance";
  if (finding.category === "Marketing Spend" || finding.category === "Fulfillment") return "spend";
  if (finding.category === "Spend" || finding.category === "Invoice") return "spend";
  if (finding.category === "Renewal" || finding.category === "Ownership") return "contract";
  return "finance";
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

// Converts human-confirmed evidence records into deterministic leak findings.
export function buildFindingsFromEvidence(evidence = []) {
  const findings = [];

  for (const record of evidence) {
    const fields = record.fields ?? {};
    const value = parseMoney(fields.value);
    const renewalDays = daysUntil(fields.renewal);
    if (!isReviewedEvidence(record)) continue;

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
function spreadsheetRowsFromExtraction(extracted = {}) {
  if (!Array.isArray(extracted.spreadsheet_rows)) return [];

  return extracted.spreadsheet_rows
    .slice(0, 200)
    .map((row, index) => ({
      rowNumber: Number.isFinite(Number(row.rowNumber)) ? Number(row.rowNumber) : index + 2,
      vendorName: compactText(row.vendorName || row.vendor || row.supplier, "", 120),
      amount: Number.isFinite(Number(row.amount)) ? Number(row.amount) : 0,
      currency: row.currency || extracted.currency || "USD",
      category: compactText(row.category, "Spend", 80),
      description: compactText(row.description, row.vendorName || "Spreadsheet row", 180),
      invoiceNumber: compactText(row.invoiceNumber, "", 80),
      date: compactText(row.date, "", 40),
      owner: compactText(row.owner, "", 120),
      raw: row.raw && typeof row.raw === "object" ? row.raw : {},
    }))
    .filter((row) => row.vendorName || row.amount || row.description || row.invoiceNumber);
}

function upsertVendor(vendorsById, { vendorName, owner, value, record }) {
  const cleanVendorName = normalizeVendorName(vendorName);
  const vendorId = hashId("vendor", cleanVendorName.toLowerCase());
  const existingVendor = vendorsById.get(vendorId);
  const cleanOwner = owner || "Unassigned";

  vendorsById.set(vendorId, {
    id: vendorId,
    name: cleanVendorName,
    owner: existingVendor?.owner && existingVendor.owner !== "Unassigned" ? existingVendor.owner : cleanOwner,
    sourceEvidenceIds: Array.from(new Set([...(existingVendor?.sourceEvidenceIds || []), record.id])),
    totalExposure: (existingVendor?.totalExposure || 0) + Math.max(0, Number(value || 0)),
    status: cleanOwner === "Unassigned" ? "Needs owner" : "Active",
    createdAt: existingVendor?.createdAt || record.createdAt || nowIso(),
    updatedAt: nowIso(),
  });

  return { vendorId, vendorName: cleanVendorName };
}

export function buildBusinessEntitiesFromEvidence(evidence = []) {
  const vendorsById = new Map();
  const contracts = [];
  const invoices = [];
  const spendRows = [];

  for (const record of evidence) {
    if (!isReviewedEvidence(record)) continue;

    const fields = record.fields ?? {};
    const extracted = record.extracted ?? {};
    const value = parseMoney(fields.value || extracted.contract_value || extracted.invoice_total);
    const owner = fields.owner || extracted.owner || "Unassigned";
    const parsedRows = spreadsheetRowsFromExtraction(extracted);

    if ((record.kind === "CSV" || record.kind === "Excel") && parsedRows.length) {
      for (const row of parsedRows) {
        const vendor = upsertVendor(vendorsById, {
          vendorName: row.vendorName || fields.vendor || extracted.vendor_name,
          owner: row.owner || owner,
          value: row.amount,
          record,
        });

        spendRows.push({
          id: hashId("spend", `${record.id}:${row.rowNumber}:${vendor.vendorId}:${row.amount}:${row.description}`),
          vendorId: vendor.vendorId,
          vendorName: vendor.vendorName,
          evidenceId: record.id,
          amount: Math.max(0, row.amount),
          currency: row.currency || currencyFromExtraction(extracted),
          source: `${record.name} row ${row.rowNumber}`,
          sourceFile: record.name,
          rowNumber: row.rowNumber,
          category: row.category,
          description: row.description,
          invoiceNumber: row.invoiceNumber || null,
          transactionDate: row.date || null,
          status: "Reviewed",
          createdAt: record.createdAt || nowIso(),
          updatedAt: nowIso(),
        });

        if (row.invoiceNumber) {
          invoices.push({
            id: hashId("invoice", `${record.id}:${row.rowNumber}:${row.invoiceNumber}`),
            vendorId: vendor.vendorId,
            vendorName: vendor.vendorName,
            evidenceId: record.id,
            invoiceNumber: row.invoiceNumber,
            total: Math.max(0, row.amount),
            currency: row.currency || currencyFromExtraction(extracted),
            status: "Reviewed",
            createdAt: record.createdAt || nowIso(),
            updatedAt: nowIso(),
          });
        }
      }

      continue;
    }

    const vendor = upsertVendor(vendorsById, {
      vendorName: fields.vendor || extracted.vendor_name,
      owner,
      value,
      record,
    });
    const vendorName = vendor.vendorName;
    const vendorId = vendor.vendorId;

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
  const isLiveFinding = ["Live Commerce", "Marketing Spend", "Fulfillment", "Inventory"].includes(finding.category);
  const agentId = agentIdForFinding(finding);
  const proofTrailId = `trail:${finding.id}`;
  const rationale = [
    finding.evidence && `Evidence: ${finding.evidence}`,
    finding.confidence !== undefined && `Confidence: ${finding.confidence}%`,
    finding.impact !== undefined && `Estimated impact: ${finding.impact}`,
    finding.owner && `Human owner: ${finding.owner}`,
  ].filter(Boolean);
  const actionContext = {
    agentId,
    category: finding.category,
    severity: finding.severity,
    confidence: finding.confidence || 0,
    evidenceId: finding.evidenceId || null,
    evidenceName: finding.source || null,
    proofTrailId,
    rationale,
    recommendedAction: finding.recommendedAction,
    guardrails: [
      "No external execution in MVP.",
      "Human approval is required before any connector write.",
      "Every action must remain linked to source evidence.",
    ],
    ...(existingAction?.externalExecution?.context || {}),
  };
  const externalExecution = {
    ...(existingAction?.externalExecution || {}),
    enabled: false,
    connectorId: isLiveFinding ? "business-live" : existingAction?.externalExecution?.connectorId || null,
    operation: isLiveFinding ? "prepare_live_business_review" : existingAction?.externalExecution?.operation || null,
    reason: "External DB/CRM/commerce writes stay disabled until connector permissions exist and a human approves.",
    context: actionContext,
  };

  return {
    id: hashId("action", finding.id),
    findingId: finding.id,
    agentId,
    category: finding.category,
    severity: finding.severity,
    confidence: finding.confidence || 0,
    evidenceId: finding.evidenceId || null,
    evidenceName: finding.source || null,
    proofTrailId,
    rationale,
    recommendedAction: finding.recommendedAction,
    guardrails: actionContext.guardrails,
    title: `Approve next step: ${finding.title}`,
    description: finding.recommendedAction,
    impact: finding.impact,
    owner: finding.owner === "Unassigned" ? "Founder approval" : `${finding.owner} approval`,
    status: existingAction?.status || "Needs review",
    approvalChannel: existingAction?.approvalChannel || "web",
    mobileReady: Boolean(existingAction?.mobileReady),
    externalExecution,
    reviewNote: existingAction?.reviewNote || "",
    lastDecisionAt: existingAction?.lastDecisionAt || null,
    lastDecisionBy: existingAction?.lastDecisionBy || null,
    decisionHistory: Array.isArray(existingAction?.decisionHistory) ? existingAction.decisionHistory : [],
    approvedAt: existingAction?.approvedAt || null,
    approvedBy: existingAction?.approvedBy || null,
    rejectedAt: existingAction?.rejectedAt || null,
    rejectedBy: existingAction?.rejectedBy || null,
    doneAt: existingAction?.doneAt || null,
    doneBy: existingAction?.doneBy || null,
    needsEvidenceAt: existingAction?.needsEvidenceAt || null,
    needsEvidenceBy: existingAction?.needsEvidenceBy || null,
    editedAt: existingAction?.editedAt || null,
    editedBy: existingAction?.editedBy || null,
    readyAt: existingAction?.readyAt || null,
    readyBy: existingAction?.readyBy || null,
    delegatedAt: existingAction?.delegatedAt || null,
    delegatedBy: existingAction?.delegatedBy || null,
    delegatedTo: existingAction?.delegatedTo || null,
    snoozedAt: existingAction?.snoozedAt || null,
    snoozedBy: existingAction?.snoozedBy || null,
    snoozedUntil: existingAction?.snoozedUntil || null,
    executionBlocked: existingAction?.executionBlocked ?? true,
    createdAt: existingAction?.createdAt || nowIso(),
    updatedAt: nowIso(),
  };
}

// Creates approval-safe actions; no action can execute without a user decision.
export function buildActionsFromFindings(findings = [], existingActions = []) {
  const existingByFinding = new Map(existingActions.map((action) => [action.findingId, action]));
  return findings.map((finding) => actionFromFinding(finding, existingByFinding.get(finding.id)));
}

function actionFromArtifact(artifact, existingAction) {
  const proofTrailId = `trail:${artifact.id}`;
  const expectedSavings = Number(artifact.metrics?.expectedSavings || 0);
  const recommendations = Array.isArray(artifact.recommendations) ? artifact.recommendations : [];
  const rationale = [
    artifact.content && `Plan: ${artifact.content.slice(0, 300)}`,
    expectedSavings > 0 && `Target savings: ${expectedSavings}`,
    artifact.metrics?.confidence && `Confidence: ${artifact.metrics.confidence}%`,
    recommendations.length && `Recommendations: ${recommendations.map((item) => item.title).join(", ")}`,
  ].filter(Boolean);
  const ownerLabel = artifact.owner?.position || artifact.owner?.role || "Decision owner";

  return {
    id: existingAction?.id || hashId("action", `workbench-artifact:${artifact.id}`),
    findingId: null,
    artifactId: artifact.id,
    agentId: "action",
    category: "AI Workbench",
    severity: expectedSavings >= 1_000_000 ? "High" : "Watch",
    confidence: artifact.metrics?.confidence || 86,
    evidenceId: null,
    evidenceName: artifact.title,
    proofTrailId,
    rationale,
    recommendedAction: artifact.content || artifact.title,
    guardrails: [
      "No external execution in MVP.",
      "Human approval is required before any connector write.",
      "Workbench artifacts must remain reviewable from Reports and Approvals.",
    ],
    title: `Approve workbench plan: ${artifact.title}`,
    description: artifact.content || "Review and approve the AI Workbench plan.",
    impact: expectedSavings,
    owner: `${ownerLabel} approval`,
    status: existingAction?.status || "Needs review",
    approvalChannel: existingAction?.approvalChannel || "web",
    mobileReady: Boolean(existingAction?.mobileReady),
    externalExecution: {
      ...(existingAction?.externalExecution || {}),
      enabled: false,
      connectorId: null,
      operation: "prepare_workbench_plan_review",
      reason: "Workbench plans create approval drafts only; production connector execution is blocked until policy and credentials exist.",
      context: {
        artifactId: artifact.id,
        artifactType: artifact.type,
        expectedSavings,
        recommendations,
      },
    },
    reviewNote: existingAction?.reviewNote || "",
    lastDecisionAt: existingAction?.lastDecisionAt || null,
    lastDecisionBy: existingAction?.lastDecisionBy || null,
    decisionHistory: Array.isArray(existingAction?.decisionHistory) ? existingAction.decisionHistory : [],
    approvedAt: existingAction?.approvedAt || null,
    approvedBy: existingAction?.approvedBy || null,
    rejectedAt: existingAction?.rejectedAt || null,
    rejectedBy: existingAction?.rejectedBy || null,
    doneAt: existingAction?.doneAt || null,
    doneBy: existingAction?.doneBy || null,
    needsEvidenceAt: existingAction?.needsEvidenceAt || null,
    needsEvidenceBy: existingAction?.needsEvidenceBy || null,
    editedAt: existingAction?.editedAt || null,
    editedBy: existingAction?.editedBy || null,
    readyAt: existingAction?.readyAt || null,
    readyBy: existingAction?.readyBy || null,
    delegatedAt: existingAction?.delegatedAt || null,
    delegatedBy: existingAction?.delegatedBy || null,
    delegatedTo: existingAction?.delegatedTo || null,
    snoozedAt: existingAction?.snoozedAt || null,
    snoozedBy: existingAction?.snoozedBy || null,
    snoozedUntil: existingAction?.snoozedUntil || null,
    executionBlocked: existingAction?.executionBlocked ?? true,
    createdAt: existingAction?.createdAt || artifact.createdAt || nowIso(),
    updatedAt: nowIso(),
  };
}

export function buildActionsFromArtifacts(artifacts = [], existingActions = []) {
  const existingByArtifact = new Map(existingActions.filter((action) => action.artifactId).map((action) => [action.artifactId, action]));
  return artifacts
    .filter((artifact) => ["negotiation_plan", "approval_workflow"].includes(artifact.type) && artifact.status !== "draft" && artifact.status !== "archived")
    .map((artifact) => actionFromArtifact(artifact, existingByArtifact.get(artifact.id)));
}

// Builds the investor-facing proof trail: every risk can be traced back to evidence and an approval-safe action.
export function buildProofGraph({ evidence = [], findings = [], actions = [], reports = [] } = {}) {
  const evidenceById = new Map(evidence.map((record) => [record.id, record]));
  const actionByFinding = new Map(actions.map((action) => [action.findingId, action]));
  const defaultReport = reports[0] || { id: "report-weekly-leak-summary", title: "Weekly leak summary", status: "Draft" };
  const nodes = new Map();
  const edges = [];
  const trail = [];

  function addNode(node) {
    nodes.set(node.id, { ...nodes.get(node.id), ...node });
  }

  function addEdge(source, target, label) {
    if (!source || !target) return;
    edges.push({ id: `${source}->${target}`, source, target, label });
  }

  const chainFindings = findings.length
    ? findings
    : evidence.slice(0, 6).map((record) => ({
        id: hashId("pending-finding", record.id),
        evidenceId: record.id,
        title: "Evidence needs diagnostic review",
        category: record.kind || "Evidence",
        severity: "Watch",
        impact: 0,
        confidence: record.confidence || 45,
        source: record.name,
        recommendedAction: "Confirm extracted fields so GENIUS can produce approval-safe actions.",
        status: "Needs review",
      }));

  for (const finding of chainFindings.slice(0, 12)) {
    const record = evidenceById.get(finding.evidenceId) || evidence.find((item) => item.name === finding.source) || null;
    const action = actionByFinding.get(finding.id);
    const agentId = agentIdForFinding(finding);
    const evidenceNodeId = record ? `evidence:${record.id}` : `evidence:${finding.id}`;
    const factNodeId = `fact:${finding.id}`;
    const riskNodeId = `risk:${finding.id}`;
    const agentNodeId = `agent:${agentId}`;
    const actionNodeId = action ? `action:${action.id}` : `action:${finding.id}`;
    const approvalNodeId = action ? `approval:${action.id}` : `approval:${finding.id}`;
    const reportNodeId = `report:${defaultReport.id}`;

    addNode({
      id: evidenceNodeId,
      type: "evidence",
      label: record?.name || finding.source || "Uploaded evidence",
      status: record?.status || "Needs review",
      tone: record?.status === "Confirmed" ? "success" : "warning",
    });
    addNode({
      id: factNodeId,
      type: "fact",
      label: factLabelFromEvidence(record),
      status: record?.providerStatus || "derived",
      tone: record?.providerStatus === "ready" || record?.status === "Confirmed" ? "success" : "info",
    });
    addNode({
      id: riskNodeId,
      type: "risk",
      label: finding.title,
      status: finding.severity,
      tone: finding.severity === "Critical" ? "danger" : finding.severity === "High" ? "warning" : "neutral",
      impact: finding.impact || 0,
    });
    addNode({
      id: agentNodeId,
      type: "agent",
      label: agentDefinitions.find((agent) => agent.id === agentId)?.name || "Finance Watcher",
      status: "Supervised",
      tone: "info",
    });
    addNode({
      id: actionNodeId,
      type: "action",
      label: action?.title || finding.recommendedAction,
      status: action?.status || "Needs review",
      tone: statusToneForAction(action?.status),
      impact: action?.impact || finding.impact || 0,
    });
    addNode({
      id: approvalNodeId,
      type: "approval",
      label: action?.owner || "Human approval",
      status: action?.status || "Needs review",
      tone: statusToneForAction(action?.status),
    });
    addNode({
      id: reportNodeId,
      type: "report",
      label: defaultReport.title || "Board report",
      status: defaultReport.status || "Draft",
      tone: defaultReport.status === "Ready" ? "success" : "info",
    });

    addEdge(evidenceNodeId, factNodeId, "extracts");
    addEdge(factNodeId, riskNodeId, "diagnoses");
    addEdge(riskNodeId, agentNodeId, "assigned");
    addEdge(agentNodeId, actionNodeId, "drafts");
    addEdge(actionNodeId, approvalNodeId, "requires");
    addEdge(approvalNodeId, reportNodeId, "records");

    trail.push({
      id: `trail:${finding.id}`,
      findingId: finding.id,
      evidenceId: record?.id || finding.evidenceId || null,
      evidenceName: record?.name || finding.source || "Uploaded evidence",
      fact: factLabelFromEvidence(record),
      risk: finding.title,
      category: finding.category,
      severity: finding.severity,
      confidence: finding.confidence || 0,
      impact: finding.impact || 0,
      agentId,
      actionId: action?.id || null,
      actionStatus: action?.status || "Needs review",
      approvalOwner: action?.owner || "Human approval",
      reportId: defaultReport.id,
      steps: [
        { label: "Evidence", value: record?.name || finding.source || "Uploaded evidence", status: record?.status || "Needs review" },
        { label: "Extracted fact", value: factLabelFromEvidence(record), status: record?.providerStatus || "derived" },
        { label: "Diagnostic risk", value: finding.title, status: finding.severity },
        { label: "Agent action", value: action?.title || finding.recommendedAction, status: action?.status || "Needs review" },
        { label: "Approval", value: action?.owner || "Human approval", status: action?.status || "Needs review" },
        { label: "Report", value: defaultReport.title || "Board report", status: defaultReport.status || "Draft" },
      ],
    });
  }

  return {
    nodes: Array.from(nodes.values()),
    edges: unique(edges.map((edge) => edge.id)).map((id) => edges.find((edge) => edge.id === id)),
    trail,
  };
}

function statusToneForAction(status) {
  if (status === "Approved" || status === "Done" || status === "Ready") return "success";
  if (status === "Rejected") return "danger";
  if (status === "Snoozed" || status === "Edited") return "warning";
  return "info";
}

function diagnosticDriversFromFindings(findings = [], fallback = []) {
  const drivers = findings
    .slice()
    .sort((a, b) => (b.impact || 0) - (a.impact || 0))
    .slice(0, 4)
    .map((finding) => ({
      id: finding.id,
      label: finding.title,
      value: finding.impact || 0,
      status: finding.severity || finding.status || "Needs review",
    }));

  return drivers.length ? drivers : fallback;
}

function actionIdsForFindings(actions = [], findings = []) {
  const findingIds = new Set(findings.map((finding) => finding.id));
  return actions.filter((action) => findingIds.has(action.findingId)).map((action) => action.id);
}

const diagnosticWorkflowStatuses = new Set(["Open", "In progress", "Review", "Closed"]);

function cleanDiagnosticOverrideText(value, fallback = "", maxLength = 160) {
  const text = String(value || "").trim();
  return (text || fallback).slice(0, maxLength);
}

function derivedDiagnosticWorkflowStatus(status) {
  if (diagnosticWorkflowStatuses.has(status)) return status;
  if (status === "Ready") return "Review";
  return "Open";
}

function normalizeDiagnosticOverrides(overrides = {}) {
  if (!overrides || typeof overrides !== "object") return {};

  return Object.fromEntries(
    Object.entries(overrides)
      .map(([id, override]) => {
        const cleanId = cleanDiagnosticOverrideText(id, "", 120);
        if (!cleanId || !override || typeof override !== "object") return null;
        const status = diagnosticWorkflowStatuses.has(override.status) ? override.status : "";
        const owner = cleanDiagnosticOverrideText(override.owner, "", 120);
        const ownerRole = cleanDiagnosticOverrideText(override.ownerRole, "", 120);
        const note = cleanDiagnosticOverrideText(override.note, "", 500);
        const updatedAt = cleanDiagnosticOverrideText(override.updatedAt, "", 80);
        const updatedBy = cleanDiagnosticOverrideText(override.updatedBy, "", 254);
        return [
          cleanId,
          {
            ...(status ? { status } : {}),
            ...(owner ? { owner } : {}),
            ...(ownerRole ? { ownerRole } : {}),
            ...(note ? { note } : {}),
            ...(updatedAt ? { updatedAt } : {}),
            ...(updatedBy ? { updatedBy } : {}),
          },
        ];
      })
      .filter(Boolean),
  );
}

function applyDiagnosticOverrides(categories = [], overrides = {}) {
  const normalizedOverrides = normalizeDiagnosticOverrides(overrides);

  return categories.map((category) => {
    const override = normalizedOverrides[category.id] || {};
    const owner = override.owner || category.owner || "Unassigned";
    const ownerRole = override.ownerRole || category.ownerRole || "Diagnostics";

    return {
      ...category,
      workflowStatus: override.status || derivedDiagnosticWorkflowStatus(category.status),
      owner,
      ownerRole,
      workflowNote: override.note || "",
      workflowUpdatedAt: override.updatedAt || null,
      workflowUpdatedBy: override.updatedBy || null,
    };
  });
}

function categoryDiagnostics({
  id,
  label,
  score,
  status,
  impact,
  signals,
  proofTrailIds,
  findingIds,
  actionIds,
  drivers,
  summary,
  risk,
  recommendedAction,
}) {
  return {
    id,
    label,
    score: clampScore(score),
    status,
    impact: impact || 0,
    signals: Math.max(0, signals || 0),
    proofTrailIds: proofTrailIds || [],
    findingIds: findingIds || [],
    actionIds: actionIds || [],
    drivers: drivers || [],
    summary,
    risk,
    recommendedAction,
  };
}

// Scores the workspace as a business operating system: risk, data quality, approvals, live signals, and proof depth.
export function buildDiagnostics({ evidence = [], liveEvents = [], findings = [], actions = [], proofGraph = { trail: [] }, overrides = {} } = {}) {
  const confirmedEvidence = evidence.filter((record) => record.status === "Confirmed");
  const providerIssues = evidence.filter((record) => record.providerStatus && record.providerStatus !== "ready").length;
  const liveSummary = summarizeLiveEvents(liveEvents);
  const openActions = actions.filter((action) => !["Approved", "Rejected", "Done"].includes(action.status));
  const approvedActions = actions.filter((action) => action.status === "Approved");
  const rejectedActions = actions.filter((action) => action.status === "Rejected");
  const delegatedActions = actions.filter((action) => action.status === "Delegated");
  const doneActions = actions.filter((action) => action.status === "Done");
  const hasWorkspaceSignals = Boolean(evidence.length || liveSummary.eventCount || findings.length || actions.length || proofGraph.trail.length);

  if (!hasWorkspaceSignals) {
    return {
      overallScore: 0,
      dataQualityScore: 0,
      approvalScore: 0,
      proofScore: 0,
      categories: [],
      summary: {
        confirmedEvidence: 0,
        evidenceCount: 0,
        openActions: 0,
        approvedActions: 0,
        rejectedActions: 0,
        delegatedActions: 0,
        doneActions: 0,
        proofTrails: 0,
        providerIssues: 0,
        liveEvents: 0,
        liveRevenue: 0,
        liveRefundRate: 0,
        liveMarginPercent: 0,
      },
    };
  }

  const missingOwnerFindings = findings.filter((finding) => finding.category === "Ownership");
  const renewalFindings = findings.filter((finding) => finding.category === "Renewal");
  const spendFindings = findings.filter((finding) => finding.category === "Spend" || finding.category === "Invoice");
  const liveFindings = findings.filter((finding) => ["Live Commerce", "Marketing Spend", "Fulfillment", "Inventory"].includes(finding.category));
  const proofTrailIdsByCategory = (...categories) =>
    proofGraph.trail.filter((item) => categories.includes(item.category)).map((item) => item.id);
  const pendingEvidence = evidence.filter((record) => record.status !== "Confirmed" && record.status !== "Excluded");
  const dataQualityDrivers = [
    ...pendingEvidence.slice(0, 4).map((record) => ({
      id: record.id,
      label: record.name,
      value: record.confidence || 0,
      status: record.status || "Needs review",
    })),
    ...evidence
      .filter((record) => record.providerStatus && record.providerStatus !== "ready")
      .slice(0, 4)
      .map((record) => ({
        id: `${record.id}:provider`,
        label: `${record.name} provider fallback`,
        value: record.confidence || 0,
        status: record.providerStatus,
      })),
  ].slice(0, 4);
  const approvalDrivers = openActions.slice(0, 4).map((action) => ({
    id: action.id,
    label: action.title,
    value: action.impact || 0,
    status: action.status,
  }));
  const liveDrivers = [
    liveSummary.revenue
      ? { id: "live-revenue", label: "Live revenue monitored", value: liveSummary.revenue, status: `${liveSummary.marginPercent}% margin` }
      : null,
    liveSummary.refundRate
      ? { id: "live-refunds", label: "Refund rate", value: liveSummary.refundRate, status: "Needs monitoring" }
      : null,
    liveSummary.adSpend
      ? { id: "live-ad-spend", label: "Ad spend tracked", value: liveSummary.adSpend, status: liveSummary.roas ? `${liveSummary.roas} ROAS` : "Tracked" }
      : null,
    liveSummary.unfulfilledSpend
      ? { id: "live-unfulfilled", label: "Unfulfilled supplier spend", value: liveSummary.unfulfilledSpend, status: "Needs review" }
      : null,
  ].filter(Boolean);
  const liveRiskPenalty =
    (liveSummary.marginPercent && liveSummary.marginPercent < 25 ? (25 - liveSummary.marginPercent) * 2 : 0) +
    liveSummary.refundRate * 1.2 +
    (liveSummary.unfulfilledSpend ? 10 : 0) +
    liveSummary.fulfillmentSignals * 6;

  const dataQualityScore = evidence.length
    ? clampScore((confirmedEvidence.length / evidence.length) * 82 + Math.max(0, 18 - providerIssues * 6))
    : liveSummary.eventCount
      ? 62
      : 35;
  const approvalScore = actions.length ? clampScore(100 - (openActions.length / actions.length) * 55) : 68;
  const proofScore = proofGraph.trail.length ? clampScore(56 + Math.min(proofGraph.trail.length, 8) * 5 + approvedActions.length * 4) : 42;

  const categories = applyDiagnosticOverrides([
    categoryDiagnostics({
      id: "spend-leakage",
      label: "Spend leakage",
      score: 86 - spendFindings.length * 9,
      status: spendFindings.length ? "Needs review" : "Ready",
      impact: spendFindings.reduce((sum, finding) => sum + (finding.impact || 0), 0),
      signals: spendFindings.length,
      proofTrailIds: proofTrailIdsByCategory("Spend", "Invoice"),
      findingIds: spendFindings.map((finding) => finding.id),
      actionIds: actionIdsForFindings(actions, spendFindings),
      drivers: diagnosticDriversFromFindings(spendFindings, [
        { id: "spend-confirmed-records", label: "Confirmed spend records", value: confirmedEvidence.length, status: "Ready" },
      ]),
      summary: "Checks confirmed spend, invoice, and workbook evidence for duplicate vendors, recurring waste, and mismatch risk.",
      risk: "Leakage can continue when spend files and contracts are not reconciled before renewal or payment.",
      recommendedAction: "Review the highest-impact spend finding, confirm owner, and send the prepared approval action for human decision.",
    }),
    categoryDiagnostics({
      id: "renewal-risk",
      label: "Renewal risk",
      score: 88 - renewalFindings.length * 11,
      status: renewalFindings.length ? "Needs review" : "Ready",
      impact: renewalFindings.reduce((sum, finding) => sum + (finding.impact || 0), 0),
      signals: renewalFindings.length,
      proofTrailIds: proofTrailIdsByCategory("Renewal"),
      findingIds: renewalFindings.map((finding) => finding.id),
      actionIds: actionIdsForFindings(actions, renewalFindings),
      drivers: diagnosticDriversFromFindings(renewalFindings, [
        { id: "renewal-confirmed-contracts", label: "Confirmed contracts monitored", value: confirmedEvidence.length, status: "Ready" },
      ]),
      summary: "Tracks confirmed contract dates, notice periods, and renewal windows so auto-renewals do not surprise the business.",
      risk: "Renewals without owner review can lock the company into avoidable spend or weak terms.",
      recommendedAction: "Assign the renewal owner, verify notice period, and approve a renegotiation or cancellation review draft.",
    }),
    categoryDiagnostics({
      id: "missing-owner",
      label: "Missing owner",
      score: 90 - missingOwnerFindings.length * 14,
      status: missingOwnerFindings.length ? "Needs review" : "Ready",
      impact: missingOwnerFindings.reduce((sum, finding) => sum + (finding.impact || 0), 0),
      signals: missingOwnerFindings.length,
      proofTrailIds: proofTrailIdsByCategory("Ownership"),
      findingIds: missingOwnerFindings.map((finding) => finding.id),
      actionIds: actionIdsForFindings(actions, missingOwnerFindings),
      drivers: diagnosticDriversFromFindings(missingOwnerFindings, [
        { id: "owner-no-findings", label: "No missing owner findings", value: 0, status: "Ready" },
      ]),
      summary: "Finds vendors, invoices, or renewals where no accountable business owner is confirmed.",
      risk: "Unowned spend and contracts create slow approvals, missed renewals, and unclear accountability.",
      recommendedAction: "Assign a human owner before approving contract, invoice, or vendor changes.",
    }),
    categoryDiagnostics({
      id: "data-quality",
      label: "Data quality",
      score: dataQualityScore,
      status: confirmedEvidence.length === evidence.length && evidence.length ? "Ready" : "Needs review",
      impact: 0,
      signals: Math.max(0, evidence.length - confirmedEvidence.length + providerIssues),
      proofTrailIds: proofGraph.trail.slice(0, 4).map((item) => item.id),
      findingIds: [],
      actionIds: [],
      drivers: dataQualityDrivers,
      summary: "Measures whether uploaded evidence is confirmed, provider extraction is healthy, and fields are safe for downstream diagnostics.",
      risk: "Low-quality or unreviewed data can create weak findings and bad approval decisions.",
      recommendedAction: "Confirm pending evidence fields or exclude low-quality records from diagnostics.",
    }),
    categoryDiagnostics({
      id: "approval-backlog",
      label: "Approval backlog",
      score: approvalScore,
      status: openActions.length ? "Needs review" : "Ready",
      impact: openActions.reduce((sum, action) => sum + (action.impact || 0), 0),
      signals: openActions.length,
      proofTrailIds: proofGraph.trail.filter((item) => item.actionStatus === "Needs review").map((item) => item.id),
      findingIds: openActions.map((action) => action.findingId).filter(Boolean),
      actionIds: openActions.map((action) => action.id),
      drivers: approvalDrivers,
      summary: "Tracks approval-safe action drafts waiting for a human decision before anything can move forward.",
      risk: "Delayed approvals keep savings and risk remediation stuck in a queue.",
      recommendedAction: "Approve, reject, edit, snooze, or mark the oldest/highest-impact actions done.",
    }),
    categoryDiagnostics({
      id: "business-live",
      label: "Business Live",
      score: liveSummary.eventCount ? 90 - liveRiskPenalty : 58,
      status: liveFindings.length ? "Needs review" : liveSummary.eventCount ? "Ready" : "Waiting",
      impact: liveFindings.reduce((sum, finding) => sum + (finding.impact || 0), 0),
      signals: liveSummary.eventCount,
      proofTrailIds: proofGraph.trail.filter((item) => ["Live Commerce", "Marketing Spend", "Fulfillment", "Inventory"].includes(item.category)).map((item) => item.id),
      findingIds: liveFindings.map((finding) => finding.id),
      actionIds: actionIdsForFindings(actions, liveFindings),
      drivers: diagnosticDriversFromFindings(liveFindings, liveDrivers),
      summary: "Monitors live purchases, refunds, ad spend, supplier orders, fulfillment, and inventory signals.",
      risk: "Live operating issues can become margin loss if they are not routed into approvals quickly.",
      recommendedAction: "Review live-commerce findings and approve the next controlled operating action.",
    }),
    categoryDiagnostics({
      id: "proof-coverage",
      label: "Proof coverage",
      score: proofScore,
      status: proofGraph.trail.length ? "Ready" : "Needs review",
      impact: findings.reduce((sum, finding) => sum + (finding.impact || 0), 0),
      signals: proofGraph.trail.length,
      proofTrailIds: proofGraph.trail.map((item) => item.id),
      findingIds: findings.map((finding) => finding.id),
      actionIds: actions.map((action) => action.id),
      drivers: proofGraph.trail.slice(0, 4).map((item) => ({
        id: item.id,
        label: item.risk || item.evidenceName,
        value: item.impact || 0,
        status: item.actionStatus || item.severity || "Linked",
      })),
      summary: "Shows how much of the workspace can be traced from source evidence to risk, action, approval, and report.",
      risk: "Weak proof coverage makes findings harder to defend with leadership, auditors, or investors.",
      recommendedAction: "Open the proof trail for the largest finding and verify every step before reporting.",
    }),
  ], overrides);

  return {
    overallScore: clampScore(categories.reduce((sum, item) => sum + item.score, 0) / categories.length),
    dataQualityScore,
    approvalScore,
    proofScore,
    categories,
    overrides: normalizeDiagnosticOverrides(overrides),
    summary: {
      confirmedEvidence: confirmedEvidence.length,
      evidenceCount: evidence.length,
      openActions: openActions.length,
      approvedActions: approvedActions.length,
      rejectedActions: rejectedActions.length,
      delegatedActions: delegatedActions.length,
      doneActions: doneActions.length,
      proofTrails: proofGraph.trail.length,
      providerIssues,
      liveEvents: liveSummary.eventCount,
      liveRevenue: liveSummary.revenue,
      liveRefundRate: liveSummary.refundRate,
      liveMarginPercent: liveSummary.marginPercent,
    },
  };
}

// Updates agent status based on current workspace data without pretending to execute work.
export function buildAgentRuns(evidence = [], findings = [], actions = [], existingRuns = [], liveEvents = []) {
  const existingByAgent = new Map(existingRuns.map((run) => [run.agentId, run]));
  const liveSummary = summarizeLiveEvents(liveEvents);
  const actionByFinding = new Map(actions.map((action) => [action.findingId, action]));
  const generatedAt = nowIso();
  const langflowRuntime = langflowRuntimeSummary();
  const highestImpact = Math.max(0, ...findings.map((finding) => Number(finding.impact || 0)));
  const counts = {
    contract: evidence.filter((record) => ["PDF", "Document", "Text", "Image"].includes(record.kind)).length,
    spend: evidence.filter((record) => ["CSV", "Excel"].includes(record.kind)).length + liveEvents.filter((event) => ["ad_spend", "supplier_purchase", "platform_fee"].includes(event.type)).length,
    finance: findings.filter((finding) => finding.category === "Renewal" || finding.category === "Ownership").length + liveSummary.eventCount,
    action: findings.length,
    "langflow-demo": evidence.length + findings.length + actions.length + liveSummary.eventCount,
  };
  const outputsByAgent = {
    contract: findings
      .filter((finding) => finding.category === "Renewal" || finding.category === "Ownership")
      .slice(0, 4)
      .map((finding) => ({
        id: finding.id,
        actionId: actionByFinding.get(finding.id)?.id || null,
        proofTrailId: `trail:${finding.id}`,
        label: finding.title,
        detail: finding.evidence,
        impact: finding.impact,
        status: finding.severity,
      })),
    spend: findings
      .filter((finding) => finding.category === "Spend" || finding.category === "Invoice" || finding.category === "Marketing Spend" || finding.category === "Fulfillment")
      .slice(0, 4)
      .map((finding) => ({
        id: finding.id,
        actionId: actionByFinding.get(finding.id)?.id || null,
        proofTrailId: `trail:${finding.id}`,
        label: finding.title,
        detail: finding.evidence,
        impact: finding.impact,
        status: finding.severity,
      })),
    finance: findings
      .filter((finding) => finding.category === "Renewal" || finding.category === "Ownership" || finding.category === "Live Commerce" || finding.category === "Inventory")
      .slice(0, 4)
      .map((finding) => ({
        id: finding.id,
        actionId: actionByFinding.get(finding.id)?.id || null,
        proofTrailId: `trail:${finding.id}`,
        label: `${finding.category}: ${finding.owner}`,
        detail: finding.recommendedAction,
        impact: finding.impact,
        status: finding.severity,
      })),
    action: actions.slice(0, 4).map((action) => ({
      id: action.id,
      actionId: action.id,
      proofTrailId: action.proofTrailId || `trail:${action.findingId}`,
      label: action.title,
      detail: action.description,
      impact: action.impact,
      status: action.status,
    })),
    "langflow-demo": [
      {
        id: "langflow-demo-workspace-brief",
        actionId: actions[0]?.id || null,
        proofTrailId: findings[0]?.id ? `trail:${findings[0].id}` : null,
        label: "Investor demo workspace brief",
        detail: `${evidence.length} evidence records, ${findings.length} findings, ${actions.length} approval actions, and ${liveSummary.eventCount} live events are ready for a Langflow-safe brief.`,
        impact: highestImpact,
        status: langflowRuntime.configured ? "Langflow configured" : "Local fallback ready",
      },
      {
        id: "langflow-demo-guardrail",
        actionId: null,
        proofTrailId: null,
        label: "Artifact-only execution guardrail",
        detail: "The Langflow demo can create a Workbench artifact, but cannot send emails, alter vendors, move money, or write to external tools.",
        impact: 0,
        status: "Strict",
      },
    ],
  };

  return agentDefinitions.map((agent) => {
    const previous = existingByAgent.get(agent.id);
    const workload = counts[agent.id] ?? 0;
    const status = deriveAgentRunStatus(workload, previous);
    const outputs = outputsByAgent[agent.id] || [];
    const agentActions = actions.filter((action) => action.agentId === agent.id);
    const outputFindingIds = outputs.map((output) => output.id).filter(Boolean);
    const outputActionIds = outputs.map((output) => output.actionId).filter(Boolean);
    const outputProofTrailIds = outputs.map((output) => output.proofTrailId).filter(Boolean);

    return {
      id: previous?.id || hashId("agent-run", agent.id),
      agentId: agent.id,
      name: agent.name,
      capability: agent.capability,
      permission: agent.permission,
      runtime: agent.id === "langflow-demo" ? langflowRuntime.provider : "GENIUS supervised runtime",
      runtimeProvider: agent.id === "langflow-demo" ? langflowRuntime.provider : "local-supervised-engine",
      langflow: agent.id === "langflow-demo" ? langflowRuntime : null,
      status,
      statusNote: previous?.statusNote || "",
      workload,
      progress: deriveAgentRunProgress(status, workload, previous),
      lastRunAt: previous?.lastRunAt || (workload ? generatedAt : null),
      startedAt: previous?.startedAt || null,
      pausedAt: previous?.pausedAt || null,
      completedAt: previous?.completedAt || null,
      failedAt: previous?.failedAt || null,
      updatedAt: previous?.updatedAt || (workload ? generatedAt : null),
      updatedBy: previous?.updatedBy || null,
      events: normalizeAgentRunEvents(previous?.events),
      guardrail: agent.id === "langflow-demo"
        ? "Langflow demo saves a Workbench artifact only; external execution requires explicit approval."
        : "Cannot execute external changes without explicit approval.",
      outputs,
      findingIds: outputFindingIds,
      actionIds: Array.from(new Set([...outputActionIds, ...agentActions.map((action) => action.id).filter(Boolean)])),
      proofTrailIds: outputProofTrailIds,
      blockedOperations: agentActions
        .filter((action) => action.externalExecution?.enabled === false)
        .slice(0, 6)
        .map((action) => ({
          actionId: action.id,
          title: action.title,
          reason: action.externalExecution?.reason || "External execution requires human approval.",
          connectorId: action.externalExecution?.connectorId || null,
          operation: action.externalExecution?.operation || null,
        })),
      tasks: outputs.slice(0, 6).map((output) => ({
        id: hashId("agent-task", `${agent.id}:${output.id}`),
        title: output.label,
        status: output.actionId ? "Approval draft linked" : "Needs approval draft",
        proofTrailId: output.proofTrailId,
        actionId: output.actionId,
      })),
      summary: {
        outputs: outputs.length,
        approvals: agentActions.length,
        blockedExternalOperations: agentActions.filter((action) => action.externalExecution?.enabled === false).length,
        highestImpact: Math.max(0, ...outputs.map((output) => Number(output.impact || 0))),
      },
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
      priority: action.impact > 5000 || action.severity === "High" ? "high" : "normal",
      actionStatus: action.status,
      owner: action.owner || "Human approval",
      impact: action.impact || 0,
      severity: action.severity || null,
      findingId: action.findingId || null,
      proofTrailId: action.proofTrailId || null,
      createdAt: existingByAction.get(action.id)?.createdAt || nowIso(),
      updatedAt: nowIso(),
      readAt: existingByAction.get(action.id)?.readAt || null,
      dismissedAt: existingByAction.get(action.id)?.dismissedAt || null,
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
  const reports = workspace.reports || [];
  const liveSummary = summarizeLiveEvents(workspace.liveEvents || []);
  const openActions = actions.filter((action) => !["Approved", "Rejected", "Done"].includes(action.status));
  const approvedActions = actions.filter((action) => action.status === "Approved");
  const rejectedActions = actions.filter((action) => action.status === "Rejected");
  const delegatedActions = actions.filter((action) => action.status === "Delegated");
  const doneActions = actions.filter((action) => action.status === "Done");

  return {
    moneyAtRisk: findings.reduce((sum, finding) => sum + (finding.impact || 0), 0),
    evidenceCount: workspace.evidence?.length || 0,
    findingCount: findings.length,
    openApprovalCount: openActions.length,
    approvedActionCount: approvedActions.length,
    rejectedActionCount: rejectedActions.length,
    delegatedActionCount: delegatedActions.length,
    doneActionCount: doneActions.length,
    activeAgentCount: (workspace.agentRuns || []).filter((run) => ["Ready", "Running"].includes(run.status)).length,
    reportCount: reports.length,
    diagnosticsScore: workspace.diagnostics?.overallScore || 0,
    dataQualityScore: workspace.diagnostics?.dataQualityScore || 0,
    proofTrailCount: workspace.proofGraph?.trail?.length || 0,
    vendorCount: workspace.vendors?.length || 0,
    contractCount: workspace.contracts?.length || 0,
    invoiceCount: workspace.invoices?.length || 0,
    spendRowCount: workspace.spendRows?.length || 0,
    liveEventCount: liveSummary.eventCount,
    liveOrderCount: liveSummary.orderCount,
    liveRevenue: liveSummary.revenue,
    liveRefunds: liveSummary.refunds,
    liveRefundRate: liveSummary.refundRate,
    liveAdSpend: liveSummary.adSpend,
    liveGrossProfit: liveSummary.grossProfit,
    liveMarginPercent: liveSummary.marginPercent,
    liveRoas: liveSummary.roas,
    liveUnfulfilledSpend: liveSummary.unfulfilledSpend,
    liveFailedPayments: liveSummary.failedPayments,
    liveLastEventAt: liveSummary.lastEventAt,
  };
}

// Rebuilds derived product state after upload, review, delete, or agent refresh.
export function syncDerivedWorkspaceData(workspace) {
  const evidence = workspace.evidence || [];
  const liveEvents = normalizeLiveEvents(workspace.liveEvents || []);
  const evidenceEntities = buildBusinessEntitiesFromEvidence(evidence);
  const liveEntities = buildBusinessEntitiesFromLiveEvents(liveEvents);
  const liveEvidence = liveEvents.map(liveEventToEvidenceRecord);
  const evidenceForProof = [...evidence, ...liveEvidence];
  const vendorsById = new Map([...evidenceEntities.vendors, ...liveEntities.vendors].map((vendor) => [vendor.id, vendor]));
  const businessEntities = {
    vendors: Array.from(vendorsById.values()).sort((a, b) => b.totalExposure - a.totalExposure),
    contracts: evidenceEntities.contracts,
    invoices: evidenceEntities.invoices,
    spendRows: [...evidenceEntities.spendRows, ...liveEntities.spendRows].sort((a, b) => Date.parse(b.createdAt || 0) - Date.parse(a.createdAt || 0)),
  };
  const findings = [...buildFindingsFromEvidence(evidence), ...buildFindingsFromLiveEvents(liveEvents)].sort((a, b) => b.impact - a.impact);
  const findingActions = buildActionsFromFindings(findings, workspace.actions || []);
  const artifactActions = buildActionsFromArtifacts(workspace.workspaceArtifacts || [], workspace.actions || []);
  const actions = [...artifactActions, ...findingActions];
  const proofGraphBeforeReports = buildProofGraph({ evidence: evidenceForProof, findings, actions, reports: workspace.reports || [] });
  const diagnostics = buildDiagnostics({
    evidence,
    liveEvents,
    findings,
    actions,
    proofGraph: proofGraphBeforeReports,
    overrides: workspace.diagnostics?.overrides,
  });
  const agentRuns = buildAgentRuns(evidence, findings, actions, workspace.agentRuns || [], liveEvents);
  const notifications = buildApprovalNotifications(actions, workspace.notifications || []);
  const reportWorkspace = { ...workspace, liveEvents, ...businessEntities, findings, actions, agentRuns, notifications, diagnostics, proofGraph: proofGraphBeforeReports };
  const reports = buildWorkspaceReports({
    ...reportWorkspace,
    metrics: summarizeWorkspace(reportWorkspace),
  });
  const proofGraph = buildProofGraph({ evidence: evidenceForProof, findings, actions, reports });
  const nextWorkspace = { ...workspace, liveEvents, ...businessEntities, findings, actions, reports, agentRuns, notifications, connectors: connectorCatalog, diagnostics, proofGraph };

  return {
    ...nextWorkspace,
    metrics: summarizeWorkspace(nextWorkspace),
  };
}
