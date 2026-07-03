import { syncDerivedWorkspaceData } from "./workspace-engine";

// Stable workspace resolver: unauthenticated users stay on the MVP default, signed-in users get their own id.
export function getDefaultWorkspaceId(workspaceId) {
  return workspaceId || process.env.GENIUS_WORKSPACE_ID || "default";
}

// Defines the stable workspace shape so missing files, old files, and remote rows load safely.
export function emptyWorkspace(workspaceId) {
  return {
    id: getDefaultWorkspaceId(workspaceId),
    version: 1,
    evidence: [],
    vendors: [],
    contracts: [],
    invoices: [],
    spendRows: [],
    liveEvents: [],
    findings: [],
    actions: [],
    reports: [],
    agentRuns: [],
    auditLog: [],
    notifications: [],
    connectors: [],
    diagnostics: {},
    proofGraph: { nodes: [], edges: [], trail: [] },
    metrics: {},
    updatedAt: null,
  };
}

// Normalizes dynamic storage payloads before the engine or UI reads them.
export function normalizeWorkspace(parsed = {}, workspaceId) {
  const source = parsed && typeof parsed === "object" ? parsed : {};
  const resolvedWorkspaceId = getDefaultWorkspaceId(workspaceId || source.id);

  return {
    ...emptyWorkspace(resolvedWorkspaceId),
    ...source,
    id: resolvedWorkspaceId,
    evidence: Array.isArray(source.evidence) ? source.evidence : [],
    vendors: Array.isArray(source.vendors) ? source.vendors : [],
    contracts: Array.isArray(source.contracts) ? source.contracts : [],
    invoices: Array.isArray(source.invoices) ? source.invoices : [],
    spendRows: Array.isArray(source.spendRows) ? source.spendRows : [],
    liveEvents: Array.isArray(source.liveEvents) ? source.liveEvents : [],
    findings: Array.isArray(source.findings) ? source.findings : [],
    actions: Array.isArray(source.actions) ? source.actions : [],
    reports: Array.isArray(source.reports) ? source.reports : [],
    agentRuns: Array.isArray(source.agentRuns) ? source.agentRuns : [],
    auditLog: Array.isArray(source.auditLog) ? source.auditLog : [],
    notifications: Array.isArray(source.notifications) ? source.notifications : [],
    connectors: Array.isArray(source.connectors) ? source.connectors : [],
    diagnostics: source.diagnostics && typeof source.diagnostics === "object" ? source.diagnostics : {},
    proofGraph: source.proofGraph && typeof source.proofGraph === "object" ? source.proofGraph : { nodes: [], edges: [], trail: [] },
    metrics: source.metrics && typeof source.metrics === "object" ? source.metrics : {},
  };
}

// Rebuilds derived sections before persistence so every store writes the same product state.
export function buildPersistedWorkspace(workspace) {
  return {
    ...syncDerivedWorkspaceData(normalizeWorkspace(workspace, workspace?.id)),
    updatedAt: new Date().toISOString(),
  };
}
