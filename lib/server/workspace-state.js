import { syncDerivedWorkspaceData } from "./workspace-engine";

// Stable single-workspace id for the current MVP. Later this becomes the real tenant/workspace id.
export function getDefaultWorkspaceId() {
  return process.env.GENIUS_WORKSPACE_ID || "default";
}

// Defines the stable workspace shape so missing files, old files, and remote rows load safely.
export function emptyWorkspace() {
  return {
    id: getDefaultWorkspaceId(),
    version: 1,
    evidence: [],
    vendors: [],
    contracts: [],
    invoices: [],
    spendRows: [],
    findings: [],
    actions: [],
    reports: [],
    agentRuns: [],
    auditLog: [],
    notifications: [],
    connectors: [],
    metrics: {},
    updatedAt: null,
  };
}

// Normalizes dynamic storage payloads before the engine or UI reads them.
export function normalizeWorkspace(parsed = {}) {
  const source = parsed && typeof parsed === "object" ? parsed : {};

  return {
    ...emptyWorkspace(),
    ...source,
    id: source.id || getDefaultWorkspaceId(),
    evidence: Array.isArray(source.evidence) ? source.evidence : [],
    vendors: Array.isArray(source.vendors) ? source.vendors : [],
    contracts: Array.isArray(source.contracts) ? source.contracts : [],
    invoices: Array.isArray(source.invoices) ? source.invoices : [],
    spendRows: Array.isArray(source.spendRows) ? source.spendRows : [],
    findings: Array.isArray(source.findings) ? source.findings : [],
    actions: Array.isArray(source.actions) ? source.actions : [],
    reports: Array.isArray(source.reports) ? source.reports : [],
    agentRuns: Array.isArray(source.agentRuns) ? source.agentRuns : [],
    auditLog: Array.isArray(source.auditLog) ? source.auditLog : [],
    notifications: Array.isArray(source.notifications) ? source.notifications : [],
    connectors: Array.isArray(source.connectors) ? source.connectors : [],
    metrics: source.metrics && typeof source.metrics === "object" ? source.metrics : {},
  };
}

// Rebuilds derived sections before persistence so every store writes the same product state.
export function buildPersistedWorkspace(workspace) {
  return {
    ...syncDerivedWorkspaceData(normalizeWorkspace(workspace)),
    updatedAt: new Date().toISOString(),
  };
}
