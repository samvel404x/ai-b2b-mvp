import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createAuditEvent, syncDerivedWorkspaceData } from "./workspace-engine";
import {
  isSupabaseWorkspaceStoreConfigured,
  readSupabaseWorkspace,
  writeSupabaseWorkspace,
} from "./supabase-workspace-store";
import { deleteEvidenceFiles } from "./supabase-file-store";
import { buildPersistedWorkspace, emptyWorkspace, normalizeWorkspace } from "./workspace-state";

const workspaceFileName = "genius-workspace.json";

function workspaceIdFromOptions(options = {}) {
  return options.workspaceId;
}

// Keeps fallback MVP data local when Supabase env vars are not configured.
function getDataDirectory() {
  return path.join(process.cwd(), ".data");
}

// Local fallback uses one file per workspace so auth testing does not mix customer data.
function getWorkspacePath(workspaceId) {
  if (!workspaceId || workspaceId === "default") return path.join(getDataDirectory(), workspaceFileName);
  const safeWorkspaceId = String(workspaceId).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 96);
  return path.join(getDataDirectory(), `genius-workspace-${safeWorkspaceId}.json`);
}

// Creates .data lazily only when the backend needs to persist evidence.
async function ensureDataDirectory() {
  await mkdir(getDataDirectory(), { recursive: true });
}

// Reads the local workspace and falls back to an empty state on first run.
async function readLocalWorkspace(options = {}) {
  const workspaceId = workspaceIdFromOptions(options);
  try {
    const raw = await readFile(getWorkspacePath(workspaceId), "utf8");
    const parsed = JSON.parse(raw);
    return normalizeWorkspace(parsed, workspaceId);
  } catch (error) {
    if (error.code === "ENOENT") return emptyWorkspace(workspaceId);
    throw error;
  }
}

// Writes the full workspace atomically enough for a single-user local fallback.
async function writeLocalWorkspace(workspace) {
  await ensureDataDirectory();
  await writeFile(getWorkspacePath(workspace.id), `${JSON.stringify(workspace, null, 2)}\n`, "utf8");
  return workspace;
}

// Routes all storage through Supabase when configured, otherwise through the local fallback.
async function readWorkspace(options = {}) {
  const workspaceId = workspaceIdFromOptions(options);
  if (isSupabaseWorkspaceStoreConfigured()) return await readSupabaseWorkspace(workspaceId);
  return await readLocalWorkspace({ workspaceId });
}

// Persists a derived workspace snapshot through the active backend adapter.
async function writeWorkspace(workspace, options = {}) {
  const workspaceId = workspaceIdFromOptions(options) || workspace?.id;
  const nextWorkspace = buildPersistedWorkspace(normalizeWorkspace(workspace, workspaceId));

  if (isSupabaseWorkspaceStoreConfigured()) {
    return await writeSupabaseWorkspace(nextWorkspace, workspaceId);
  }

  return await writeLocalWorkspace(nextWorkspace);
}

function stableReportDigest(reports = []) {
  return reports.map(({ id, type, title, detail, status, summary, metrics, sections }) => ({
    id,
    type,
    title,
    detail,
    status,
    summary,
    metrics,
    sections,
  }));
}

function derivedWorkspaceChanged(snapshot, workspace) {
  return (
    JSON.stringify(snapshot.metrics) !== JSON.stringify(workspace.metrics) ||
    JSON.stringify(stableReportDigest(snapshot.reports)) !== JSON.stringify(stableReportDigest(workspace.reports))
  );
}

// Returns all stored evidence for dashboard hydration.
export async function listEvidenceRecords(options = {}) {
  const workspace = await readWorkspace(options);
  return workspace.evidence;
}

// Returns the full backend source of truth for dashboard, agents, approvals, and reports.
export async function getWorkspaceSnapshot(options = {}) {
  const workspace = await readWorkspace(options);
  const snapshot = syncDerivedWorkspaceData(workspace);

  if (derivedWorkspaceChanged(snapshot, workspace)) {
    return await writeWorkspace(snapshot, options);
  }

  return snapshot;
}

// Upserts analyzed evidence records after upload.
export async function saveEvidenceRecords(records, options = {}) {
  const workspace = await readWorkspace(options);
  const existingById = new Map(workspace.evidence.map((record) => [record.id, record]));

  for (const record of records) {
    existingById.set(record.id, record);
  }

  const evidence = Array.from(existingById.values()).sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const auditLog = [
    createAuditEvent("evidence_uploaded", "system", { count: records.length }),
    ...workspace.auditLog,
  ].slice(0, 250);
  const nextWorkspace = await writeWorkspace({ ...workspace, evidence, auditLog }, options);
  return nextWorkspace.evidence;
}

// Saves human-reviewed fields without touching unrelated evidence records.
export async function updateEvidenceRecord(id, patch, options = {}) {
  const workspace = await readWorkspace(options);
  let updatedRecord = null;
  const evidence = workspace.evidence.map((record) => {
    if (record.id !== id) return record;

    updatedRecord = {
      ...record,
      ...patch,
      fields: {
        ...record.fields,
        ...patch.fields,
      },
      updatedAt: new Date().toISOString(),
    };

    return updatedRecord;
  });

  if (!updatedRecord) return null;

  const auditLog = [
    createAuditEvent("evidence_reviewed", "user", { evidenceId: id }),
    ...workspace.auditLog,
  ].slice(0, 250);
  await writeWorkspace({ ...workspace, evidence, auditLog }, options);
  return updatedRecord;
}

// Removes one evidence record from the local MVP store.
export async function deleteEvidenceRecord(id, options = {}) {
  const workspace = await readWorkspace(options);
  const deletedRecord = workspace.evidence.find((record) => record.id === id);
  const evidence = workspace.evidence.filter((record) => record.id !== id);
  if (evidence.length === workspace.evidence.length) return false;
  const auditLog = [
    createAuditEvent("evidence_deleted", "user", { evidenceId: id }),
    ...workspace.auditLog,
  ].slice(0, 250);
  await writeWorkspace({ ...workspace, evidence, auditLog }, options);
  await deleteEvidenceFiles([deletedRecord]);
  return true;
}

// Clears local evidence when the user resets Data Room.
export async function clearEvidenceRecords(options = {}) {
  const workspace = await readWorkspace(options);
  const deletedRecords = workspace.evidence;
  const auditLog = [
    createAuditEvent("evidence_cleared", "user"),
    ...workspace.auditLog,
  ].slice(0, 250);
  await writeWorkspace({ ...workspace, evidence: [], findings: [], actions: [], notifications: [], auditLog }, options);
  await deleteEvidenceFiles(deletedRecords);
}

// Applies an approval decision while keeping future external execution behind guardrails.
export async function updateActionStatus(id, status, actor = "user", options = {}) {
  const allowed = new Set(["Needs review", "Ready", "Approved", "Rejected", "Edited", "Snoozed", "Done"]);
  if (!allowed.has(status)) return null;

  const workspace = await readWorkspace(options);
  let updatedAction = null;
  const actions = workspace.actions.map((action) => {
    if (action.id !== id) return action;
    updatedAction = {
      ...action,
      status,
      updatedAt: new Date().toISOString(),
      approvedAt: status === "Approved" ? new Date().toISOString() : action.approvedAt ?? null,
    };
    return updatedAction;
  });

  if (!updatedAction) return null;

  const auditLog = [
    createAuditEvent("action_status_updated", actor, { actionId: id, status }),
    ...workspace.auditLog,
  ].slice(0, 250);
  const nextWorkspace = await writeWorkspace({ ...workspace, actions, auditLog }, options);
  return nextWorkspace.actions.find((action) => action.id === id) ?? updatedAction;
}

// Records a supervised agent refresh; the engine then rebuilds findings/actions from evidence.
export async function runSupervisedAgents(actor = "user", options = {}) {
  const workspace = await readWorkspace(options);
  const auditLog = [
    createAuditEvent("agents_refreshed", actor, { evidenceCount: workspace.evidence.length }),
    ...workspace.auditLog,
  ].slice(0, 250);
  return await writeWorkspace({ ...workspace, auditLog }, options);
}
