import { getDefaultWorkspaceId, normalizeWorkspace } from "./workspace-state";

const restSchema = "public";
const workspaceTable = "genius_workspaces";
const evidenceTable = "genius_evidence_records";
const vendorTable = "genius_vendors";
const contractTable = "genius_contracts";
const invoiceTable = "genius_invoices";
const spendTable = "genius_spend_rows";
const actionTable = "genius_action_states";
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
function getSupabaseConfig() {
  return {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    workspaceId: getDefaultWorkspaceId(),
  };
}

export function isSupabaseWorkspaceStoreConfigured() {
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
    extracted: record.extracted || {},
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
    evidence: Array.isArray(row.evidence_snippets) ? row.evidence_snippets : [],
    confidence: row.confidence || 0,
    error: row.error || null,
    reviewedAt: row.reviewed_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toActionRow(action, workspaceId) {
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
    external_execution: action.externalExecution || {},
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

function fromActionRow(row) {
  return {
    id: row.id,
    findingId: row.finding_id,
    title: row.title,
    description: row.description,
    impact: row.impact || 0,
    owner: row.owner || "Founder approval",
    status: row.status || "Needs review",
    approvalChannel: row.approval_channel || "web",
    mobileReady: Boolean(row.mobile_ready),
    externalExecution: row.external_execution || {},
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

async function deleteRowsMissing(tableName, ids) {
  const { workspaceId } = getSupabaseConfig();
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
export async function readSupabaseWorkspace() {
  const { workspaceId } = getSupabaseConfig();
  const [workspaceRows, evidenceRows, actionRows, auditRows] = await Promise.all([
    supabaseRequest(workspaceTable, {
      query: { id: `eq.${workspaceId}`, select: "id,version,data,updated_at", limit: 1 },
    }),
    supabaseRequest(evidenceTable, {
      query: { workspace_id: `eq.${workspaceId}`, select: "*", order: "created_at.desc" },
    }),
    supabaseRequest(actionTable, {
      query: { workspace_id: `eq.${workspaceId}`, select: "*", order: "updated_at.desc" },
    }),
    supabaseRequest(auditTable, {
      query: { workspace_id: `eq.${workspaceId}`, select: "*", order: "created_at.desc", limit: 250 },
    }),
  ]);

  const workspaceBackup = workspaceRows?.[0]?.data || {};

  return normalizeWorkspace({
    ...workspaceBackup,
    id: workspaceId,
    version: workspaceRows?.[0]?.version || 1,
    evidence: (evidenceRows || []).map(fromEvidenceRow).sort(createdAtDesc),
    actions: (actionRows || []).map(fromActionRow),
    auditLog: (auditRows || []).map(fromAuditRow),
    updatedAt: workspaceRows?.[0]?.updated_at || null,
  });
}

// Persists the same workspace snapshot the local store writes, but into Supabase tables.
export async function writeSupabaseWorkspace(workspace) {
  const { workspaceId } = getSupabaseConfig();
  const now = new Date().toISOString();
  const nextWorkspace = normalizeWorkspace({ ...workspace, id: workspaceId, updatedAt: now });

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
  const auditRows = nextWorkspace.auditLog.map((event) => toAuditRow(event, workspaceId));

  await deleteRowsMissing(evidenceTable, evidenceRows.map((row) => row.id));
  await deleteRowsMissing(vendorTable, vendorRows.map((row) => row.id));
  await deleteRowsMissing(contractTable, contractRows.map((row) => row.id));
  await deleteRowsMissing(invoiceTable, invoiceRows.map((row) => row.id));
  await deleteRowsMissing(spendTable, spendRows.map((row) => row.id));
  await deleteRowsMissing(actionTable, actionRows.map((row) => row.id));
  await Promise.all([
    upsertRows(evidenceTable, evidenceRows),
    upsertRows(vendorTable, vendorRows),
    upsertRows(contractTable, contractRows),
    upsertRows(invoiceTable, invoiceRows),
    upsertRows(spendTable, spendRows),
    upsertRows(actionTable, actionRows),
    upsertRows(auditTable, auditRows),
  ]);

  return { ...nextWorkspace, updatedAt: now };
}
