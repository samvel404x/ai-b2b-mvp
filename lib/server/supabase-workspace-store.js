import { getDefaultWorkspaceId, normalizeWorkspace } from "./workspace-state";

const restSchema = "public";
const workspaceTable = "genius_workspaces";
const evidenceTable = "genius_evidence_records";
const vendorTable = "genius_vendors";
const contractTable = "genius_contracts";
const invoiceTable = "genius_invoices";
const spendTable = "genius_spend_rows";
const actionTable = "genius_action_states";
const reportTable = "genius_reports";
const auditTable = "genius_audit_log";

class SupabaseStoreError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "SupabaseStoreError";
    this.status = status;
    this.details = details;
  }
}

// Reads server-only Supabase credentials lazily so Next build never requires database env vars.
function getSupabaseConfig(workspaceId) {
  return {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    workspaceId: getDefaultWorkspaceId(workspaceId),
  };
}

export function isSupabaseWorkspaceStoreConfigured() {
  if (process.env.GENIUS_FORCE_LOCAL_STORE === "1") return false;
  const { url, serviceRoleKey } = getSupabaseConfig();
  return Boolean(url && serviceRoleKey);
}

function tableUrl(tableName, query = {}) {
  const { url } = getSupabaseConfig();
  const endpoint = new URL(`/rest/v1/${tableName}`, url);

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) endpoint.searchParams.set(key, String(value));
  }

  return endpoint;
}

async function supabaseRequest(tableName, { method = "GET", query, body, prefer, headers } = {}) {
  const { serviceRoleKey } = getSupabaseConfig();
  const response = await fetch(tableUrl(tableName, query), {
    method,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Profile": restSchema,
      "Content-Profile": restSchema,
      ...(prefer ? { Prefer: prefer } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new SupabaseStoreError(
      payload?.message || `Supabase ${method} ${tableName} failed with ${response.status}.`,
      response.status,
      payload,
    );
  }

  return payload;
}

function createdAtDesc(a, b) {
  return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
}

function toEvidenceRow(record, workspaceId) {
  const storage = record.storage || record.extracted?.storage_file || null;
  const extracted = storage
    ? {
        ...(record.extracted || {}),
        storage_file: storage,
      }
    : record.extracted || {};

  return {
    id: record.id,
    workspace_id: workspaceId,
    name: record.name,
    url: record.url || null,
    size_label: record.size || null,
    bytes: record.bytes || 0,
    mime_type: record.type || null,
    kind: record.kind || null,
    source: record.source || null,
    status: record.status || "Needs review",
    provider: record.provider || null,
    provider_status: record.providerStatus || null,
    model: record.model || null,
    fields: record.fields || {},
    extracted,
    evidence_snippets: Array.isArray(record.evidence) ? record.evidence : [],
    confidence: Number.isFinite(Number(record.confidence)) ? Number(record.confidence) : null,
    error: record.error || null,
    reviewed_at: record.reviewedAt || null,
    created_at: record.createdAt || new Date().toISOString(),
    updated_at: record.updatedAt || new Date().toISOString(),
  };
}

function fromEvidenceRow(row) {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    size: row.size_label || "Stored",
    bytes: row.bytes || 0,
    type: row.mime_type || "",
    kind: row.kind || "Document",
    source: row.source || "Data Intake",
    status: row.status || "Needs review",
    provider: row.provider || "local",
    providerStatus: row.provider_status || "unknown",
    model: row.model || null,
    fields: row.fields || {},
    extracted: row.extracted || {},
    storage: row.extracted?.storage_file || null,
    evidence: Array.isArray(row.evidence_snippets) ? row.evidence_snippets : [],
    confidence: row.confidence || 0,
    error: row.error || null,
    reviewedAt: row.reviewed_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toActionRow(action, workspaceId) {
  const externalExecution = {
    ...(action.externalExecution || {}),
    context: {
      ...(action.externalExecution?.context || {}),
      agentId: action.agentId || action.externalExecution?.context?.agentId || null,
      category: action.category || action.externalExecution?.context?.category || null,
      severity: action.severity || action.externalExecution?.context?.severity || null,
      confidence: action.confidence || action.externalExecution?.context?.confidence || 0,
      evidenceId: action.evidenceId || action.externalExecution?.context?.evidenceId || null,
      evidenceName: action.evidenceName || action.externalExecution?.context?.evidenceName || null,
      proofTrailId: action.proofTrailId || action.externalExecution?.context?.proofTrailId || null,
      rationale: Array.isArray(action.rationale) ? action.rationale : action.externalExecution?.context?.rationale || [],
      recommendedAction: action.recommendedAction || action.externalExecution?.context?.recommendedAction || action.description || "",
      guardrails: Array.isArray(action.guardrails) ? action.guardrails : action.externalExecution?.context?.guardrails || [],
    },
    approval: {
      reviewNote: action.reviewNote || "",
      lastDecisionAt: action.lastDecisionAt || null,
      lastDecisionBy: action.lastDecisionBy || null,
      decisionHistory: Array.isArray(action.decisionHistory) ? action.decisionHistory : [],
    },
  };

  return {
    id: action.id,
    workspace_id: workspaceId,
    finding_id: action.findingId,
    title: action.title,
    description: action.description,
    impact: action.impact || 0,
    owner: action.owner || null,
    status: action.status || "Needs review",
    approval_channel: action.approvalChannel || "web",
    mobile_ready: Boolean(action.mobileReady),
    external_execution: externalExecution,
    approved_at: action.approvedAt || null,
    created_at: action.createdAt || new Date().toISOString(),
    updated_at: action.updatedAt || new Date().toISOString(),
  };
}

function toVendorRow(vendor, workspaceId) {
  return {
    id: vendor.id,
    workspace_id: workspaceId,
    name: vendor.name,
    owner: vendor.owner || null,
    source_evidence_ids: Array.isArray(vendor.sourceEvidenceIds) ? vendor.sourceEvidenceIds : [],
    total_exposure: vendor.totalExposure || 0,
    status: vendor.status || "Active",
    created_at: vendor.createdAt || new Date().toISOString(),
    updated_at: vendor.updatedAt || new Date().toISOString(),
  };
}

function toContractRow(contract, workspaceId) {
  return {
    id: contract.id,
    workspace_id: workspaceId,
    vendor_id: contract.vendorId,
    vendor_name: contract.vendorName,
    evidence_id: contract.evidenceId,
    value: contract.value || 0,
    currency: contract.currency || "USD",
    start_date: contract.startDate || null,
    end_date: contract.endDate || null,
    renewal_date: contract.renewalDate || null,
    notice_period_days: contract.noticePeriodDays || null,
    auto_renewal: contract.autoRenewal,
    status: contract.status || "Reviewed",
    created_at: contract.createdAt || new Date().toISOString(),
    updated_at: contract.updatedAt || new Date().toISOString(),
  };
}

function toInvoiceRow(invoice, workspaceId) {
  return {
    id: invoice.id,
    workspace_id: workspaceId,
    vendor_id: invoice.vendorId,
    vendor_name: invoice.vendorName,
    evidence_id: invoice.evidenceId,
    invoice_number: invoice.invoiceNumber || null,
    total: invoice.total || 0,
    currency: invoice.currency || "USD",
    status: invoice.status || "Reviewed",
    created_at: invoice.createdAt || new Date().toISOString(),
    updated_at: invoice.updatedAt || new Date().toISOString(),
  };
}

function toSpendRow(spendRow, workspaceId) {
  return {
    id: spendRow.id,
    workspace_id: workspaceId,
    vendor_id: spendRow.vendorId,
    vendor_name: spendRow.vendorName,
    evidence_id: spendRow.evidenceId,
    amount: spendRow.amount || 0,
    currency: spendRow.currency || "USD",
    source: spendRow.source || null,
    status: spendRow.status || "Reviewed",
    created_at: spendRow.createdAt || new Date().toISOString(),
    updated_at: spendRow.updatedAt || new Date().toISOString(),
  };
}

function toReportRow(report, workspaceId) {
  return {
    id: report.id,
    workspace_id: workspaceId,
    type: report.type,
    title: report.title,
    detail: report.detail,
    status: report.status || "Draft",
    summary: Array.isArray(report.summary) ? report.summary : [],
    metrics: report.metrics || {},
    sections: Array.isArray(report.sections) ? report.sections : [],
    generated_at: report.generatedAt || new Date().toISOString(),
    updated_at: report.updatedAt || new Date().toISOString(),
  };
}

function fromReportRow(row) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    detail: row.detail || "",
    status: row.status || "Draft",
    summary: Array.isArray(row.summary) ? row.summary : [],
    metrics: row.metrics || {},
    sections: Array.isArray(row.sections) ? row.sections : [],
    generatedAt: row.generated_at,
    updatedAt: row.updated_at,
  };
}

function fromActionRow(row) {
  const approval = row.external_execution?.approval || {};
  const context = row.external_execution?.context || {};

  return {
    id: row.id,
    findingId: row.finding_id,
    artifactId: context.artifactId || null,
    agentId: context.agentId || null,
    category: context.category || null,
    severity: context.severity || null,
    confidence: context.confidence || 0,
    evidenceId: context.evidenceId || null,
    evidenceName: context.evidenceName || null,
    proofTrailId: context.proofTrailId || null,
    rationale: Array.isArray(context.rationale) ? context.rationale : [],
    recommendedAction: context.recommendedAction || row.description || "",
    guardrails: Array.isArray(context.guardrails) ? context.guardrails : [],
    title: row.title,
    description: row.description,
    impact: row.impact || 0,
    owner: row.owner || "Founder approval",
    status: row.status || "Needs review",
    approvalChannel: row.approval_channel || "web",
    mobileReady: Boolean(row.mobile_ready),
    externalExecution: row.external_execution || {},
    reviewNote: approval.reviewNote || "",
    lastDecisionAt: approval.lastDecisionAt || null,
    lastDecisionBy: approval.lastDecisionBy || null,
    decisionHistory: Array.isArray(approval.decisionHistory) ? approval.decisionHistory : [],
    approvedAt: row.approved_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toAuditRow(event, workspaceId) {
  return {
    id: event.id,
    workspace_id: workspaceId,
    type: event.type,
    actor: event.actor,
    details: event.details || {},
    created_at: event.createdAt || new Date().toISOString(),
  };
}

function fromAuditRow(row) {
  return {
    id: row.id,
    type: row.type,
    actor: row.actor,
    details: row.details || {},
    createdAt: row.created_at,
  };
}

async function deleteRowsMissing(tableName, ids, workspaceId) {
  const query = { workspace_id: `eq.${workspaceId}` };

  if (ids.length) {
    query.id = `not.in.(${ids.join(",")})`;
  }

  await supabaseRequest(tableName, {
    method: "DELETE",
    query,
    prefer: "return=minimal",
  });
}

async function upsertRows(tableName, rows) {
  if (!rows.length) return [];

  return await supabaseRequest(tableName, {
    method: "POST",
    query: { on_conflict: "id" },
    body: rows,
    prefer: "resolution=merge-duplicates,return=representation",
  });
}

// Reads normalized workspace rows from Supabase and lets the engine derive findings/actions.
export async function readSupabaseWorkspace(workspaceIdOverride) {
  const { workspaceId } = getSupabaseConfig(workspaceIdOverride);
  const [workspaceRows, evidenceRows, actionRows, reportRows, auditRows] = await Promise.all([
    supabaseRequest(workspaceTable, {
      query: { id: `eq.${workspaceId}`, select: "id,version,data,updated_at", limit: 1 },
    }),
    supabaseRequest(evidenceTable, {
      query: { workspace_id: `eq.${workspaceId}`, select: "*", order: "created_at.desc" },
    }),
    supabaseRequest(actionTable, {
      query: { workspace_id: `eq.${workspaceId}`, select: "*", order: "updated_at.desc" },
    }),
    supabaseRequest(reportTable, {
      query: { workspace_id: `eq.${workspaceId}`, select: "*", order: "updated_at.desc" },
    }),
    supabaseRequest(auditTable, {
      query: { workspace_id: `eq.${workspaceId}`, select: "*", order: "created_at.desc", limit: 250 },
    }),
  ]);

  const workspaceBackup = workspaceRows?.[0]?.data || {};

  return normalizeWorkspace(
    {
      ...workspaceBackup,
      id: workspaceId,
      version: workspaceRows?.[0]?.version || 1,
      evidence: (evidenceRows || []).map(fromEvidenceRow).sort(createdAtDesc),
      actions: (actionRows || []).map(fromActionRow),
      reports: (reportRows || []).length ? reportRows.map(fromReportRow) : workspaceBackup.reports || [],
      auditLog: (auditRows || []).map(fromAuditRow),
      updatedAt: workspaceRows?.[0]?.updated_at || null,
    },
    workspaceId,
  );
}

export async function findSupabaseWorkspaceByMemberIdentity({ email, userId } = {}) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedUserId = String(userId || "").trim();
  if (!normalizedEmail && !normalizedUserId) return null;

  const rows = await supabaseRequest(workspaceTable, {
    query: { select: "id,version,data,updated_at", limit: 1000, order: "updated_at.desc" },
  });

  for (const row of rows || []) {
    const workspace = normalizeWorkspace(
      {
        ...(row.data || {}),
        id: row.id,
        version: row.version || 1,
        updatedAt: row.updated_at || null,
      },
      row.id,
    );
    const member = (workspace.members || []).find((item) => {
      return (
        item.status === "active"
        && ((normalizedEmail && item.email === normalizedEmail) || (normalizedUserId && item.userId === normalizedUserId))
      );
    });

    if (member) {
      return { workspace, member };
    }
  }

  return null;
}

// Persists the same workspace snapshot the local store writes, but into Supabase tables.
export async function writeSupabaseWorkspace(workspace, workspaceIdOverride) {
  const { workspaceId } = getSupabaseConfig(workspaceIdOverride || workspace?.id);
  const now = new Date().toISOString();
  const nextWorkspace = normalizeWorkspace({ ...workspace, id: workspaceId, updatedAt: now }, workspaceId);

  await upsertRows(workspaceTable, [
    {
      id: workspaceId,
      version: nextWorkspace.version || 1,
      data: nextWorkspace,
      updated_at: now,
    },
  ]);

  const evidenceRows = nextWorkspace.evidence.map((record) => toEvidenceRow(record, workspaceId));
  const vendorRows = nextWorkspace.vendors.map((vendor) => toVendorRow(vendor, workspaceId));
  const contractRows = nextWorkspace.contracts.map((contract) => toContractRow(contract, workspaceId));
  const invoiceRows = nextWorkspace.invoices.map((invoice) => toInvoiceRow(invoice, workspaceId));
  const spendRows = nextWorkspace.spendRows.map((spendRow) => toSpendRow(spendRow, workspaceId));
  const actionRows = nextWorkspace.actions.map((action) => toActionRow(action, workspaceId));
  const reportRows = nextWorkspace.reports.map((report) => toReportRow(report, workspaceId));
  const auditRows = nextWorkspace.auditLog.map((event) => toAuditRow(event, workspaceId));

  await deleteRowsMissing(evidenceTable, evidenceRows.map((row) => row.id), workspaceId);
  await deleteRowsMissing(vendorTable, vendorRows.map((row) => row.id), workspaceId);
  await deleteRowsMissing(contractTable, contractRows.map((row) => row.id), workspaceId);
  await deleteRowsMissing(invoiceTable, invoiceRows.map((row) => row.id), workspaceId);
  await deleteRowsMissing(spendTable, spendRows.map((row) => row.id), workspaceId);
  await deleteRowsMissing(actionTable, actionRows.map((row) => row.id), workspaceId);
  await deleteRowsMissing(reportTable, reportRows.map((row) => row.id), workspaceId);
  await Promise.all([
    upsertRows(evidenceTable, evidenceRows),
    upsertRows(vendorTable, vendorRows),
    upsertRows(contractTable, contractRows),
    upsertRows(invoiceTable, invoiceRows),
    upsertRows(spendTable, spendRows),
    upsertRows(actionTable, actionRows),
    upsertRows(reportTable, reportRows),
    upsertRows(auditTable, auditRows),
  ]);

  return { ...nextWorkspace, updatedAt: now };
}
