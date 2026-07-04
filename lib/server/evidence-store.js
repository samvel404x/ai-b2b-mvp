import crypto from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createAuditEvent, syncDerivedWorkspaceData } from "./workspace-engine";
import { buildDemoWorkspace } from "./demo-workspace";
import { buildDemoLiveEvents, normalizeLiveEvents } from "./live-events";
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
  if (process.env.GENIUS_DATA_DIR) return process.env.GENIUS_DATA_DIR;
  if (process.env.VERCEL === "1") return path.join(tmpdir(), "genius-mvp-data");
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

function warnLocalStoreFallback(operation, error) {
  console.warn(`[GENIUS store] ${operation} used local fallback: ${error?.message || String(error)}`);
}

// Routes all storage through Supabase when configured, otherwise through the local fallback.
async function readWorkspace(options = {}) {
  const workspaceId = workspaceIdFromOptions(options);
  if (isSupabaseWorkspaceStoreConfigured()) {
    try {
      return await readSupabaseWorkspace(workspaceId);
    } catch (error) {
      warnLocalStoreFallback("read", error);
    }
  }

  return await readLocalWorkspace({ workspaceId });
}

// Persists a derived workspace snapshot through the active backend adapter.
async function writeWorkspace(workspace, options = {}) {
  const workspaceId = workspaceIdFromOptions(options) || workspace?.id;
  const nextWorkspace = buildPersistedWorkspace(normalizeWorkspace(workspace, workspaceId));

  if (isSupabaseWorkspaceStoreConfigured()) {
    try {
      return await writeSupabaseWorkspace(nextWorkspace, workspaceId);
    } catch (error) {
      warnLocalStoreFallback("write", error);
    }
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
    JSON.stringify(snapshot.diagnostics) !== JSON.stringify(workspace.diagnostics) ||
    JSON.stringify(snapshot.proofGraph) !== JSON.stringify(workspace.proofGraph) ||
    JSON.stringify(stableReportDigest(snapshot.reports)) !== JSON.stringify(stableReportDigest(workspace.reports))
  );
}

// Returns all stored evidence for dashboard hydration.
export async function listEvidenceRecords(options = {}) {
  const workspace = await readWorkspace(options);
  return workspace.evidence;
}

export async function listLiveEvents(options = {}) {
  const workspace = await readWorkspace(options);
  return workspace.liveEvents || [];
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

function cleanEvidenceStatus(status) {
  const allowed = new Set(["Needs review", "Confirmed", "Excluded"]);
  return allowed.has(status) ? status : null;
}

// Applies one review decision to multiple evidence records and rebuilds derived workspace state once.
export async function bulkReviewEvidenceRecords({ ids = [], status, fieldsById = {}, actor = "user" } = {}, options = {}) {
  const nextStatus = cleanEvidenceStatus(status);
  if (!nextStatus) return null;

  const workspace = await readWorkspace(options);
  const targetIds = new Set((Array.isArray(ids) ? ids : []).map(String).filter(Boolean));
  if (!targetIds.size) return null;

  const now = new Date().toISOString();
  let updatedCount = 0;
  const evidence = workspace.evidence.map((record) => {
    if (!targetIds.has(record.id)) return record;
    updatedCount += 1;
    const reviewedFields = fieldsById?.[record.id] && typeof fieldsById[record.id] === "object" ? fieldsById[record.id] : null;

    return {
      ...record,
      status: nextStatus,
      fields: reviewedFields
        ? {
            ...record.fields,
            ...Object.fromEntries(Object.entries(reviewedFields).map(([key, value]) => [String(key), String(value ?? "").trim()])),
          }
        : record.fields,
      reviewedAt: nextStatus === "Confirmed" ? now : record.reviewedAt ?? null,
      updatedAt: now,
    };
  });

  if (!updatedCount) return null;

  const auditLog = [
    createAuditEvent("evidence_bulk_reviewed", actor, { count: updatedCount, status: nextStatus }),
    ...workspace.auditLog,
  ].slice(0, 250);

  return await writeWorkspace({ ...workspace, evidence, auditLog }, options);
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

// Clears the full customer workspace while keeping only a minimal deletion audit marker.
export async function clearWorkspaceData(actor = "user", options = {}) {
  const workspace = await readWorkspace(options);
  const workspaceId = workspaceIdFromOptions(options) || workspace.id;
  const deletedRecords = workspace.evidence;
  const auditLog = [
    createAuditEvent("workspace_data_cleared", actor, {
      evidenceCount: workspace.evidence.length,
      actionCount: workspace.actions.length,
      liveEventCount: workspace.liveEvents?.length || 0,
    }),
  ];

  const nextWorkspace = await writeWorkspace({ ...emptyWorkspace(workspaceId), auditLog }, { workspaceId });
  await deleteEvidenceFiles(deletedRecords);
  return nextWorkspace;
}

// Upserts commerce/live-business events from a connector, webhook, or demo stream.
export async function saveLiveEvents(events, actor = "user", options = {}) {
  const workspace = await readWorkspace(options);
  const existingById = new Map((workspace.liveEvents || []).map((event) => [event.id, event]));
  const normalizedEvents = normalizeLiveEvents(events, { source: "Business Live", connectorId: "business-live" });

  for (const event of normalizedEvents) {
    existingById.set(event.id, event);
  }

  const liveEvents = normalizeLiveEvents(Array.from(existingById.values()));
  const auditLog = [
    createAuditEvent("live_events_ingested", actor, { count: normalizedEvents.length }),
    ...workspace.auditLog,
  ].slice(0, 250);

  return await writeWorkspace({ ...workspace, liveEvents, auditLog }, options);
}

// Clears only live commerce signals; uploaded evidence remains untouched.
export async function clearLiveEvents(actor = "user", options = {}) {
  const workspace = await readWorkspace(options);
  const auditLog = [
    createAuditEvent("live_events_cleared", actor),
    ...workspace.auditLog,
  ].slice(0, 250);

  return await writeWorkspace({ ...workspace, liveEvents: [], auditLog }, options);
}

export async function loadDemoLiveEvents(actor = "user", options = {}) {
  return await saveLiveEvents(buildDemoLiveEvents(), actor, options);
}

// Replaces the current workspace with a deterministic investor demo, then lets the engine derive all sections.
export async function resetWorkspaceToDemo(actor = "user", options = {}) {
  const workspace = await readWorkspace(options);
  await deleteEvidenceFiles(workspace.evidence);

  const workspaceId = workspaceIdFromOptions(options) || workspace.id;
  const demoWorkspace = buildDemoWorkspace(workspaceId);
  const auditLog = [
    createAuditEvent("demo_workspace_loaded", actor, { evidenceCount: demoWorkspace.evidence.length }),
    ...demoWorkspace.auditLog,
  ].slice(0, 250);

  return await writeWorkspace({ ...demoWorkspace, auditLog }, options);
}

function normalizeDecisionNote(value) {
  return String(value || "").trim().slice(0, 2000);
}

// Applies an approval decision while keeping future external execution behind guardrails.
export async function updateActionStatus(id, status, actor = "user", options = {}) {
  const allowed = new Set(["Needs review", "Ready", "Approved", "Rejected", "Edited", "Snoozed", "Done"]);
  if (!allowed.has(status)) return null;

  const workspace = await readWorkspace(options);
  const now = new Date().toISOString();
  const note = normalizeDecisionNote(options.note);
  let updatedAction = null;
  const actions = workspace.actions.map((action) => {
    if (action.id !== id) return action;
    const decision = {
      id: `decision-${crypto.randomUUID?.() || now}`,
      status,
      note,
      actor,
      createdAt: now,
    };
    updatedAction = {
      ...action,
      status,
      reviewNote: note || action.reviewNote || "",
      lastDecisionAt: now,
      lastDecisionBy: actor,
      decisionHistory: [decision, ...(Array.isArray(action.decisionHistory) ? action.decisionHistory : [])].slice(0, 50),
      updatedAt: now,
      approvedAt: status === "Approved" ? now : action.approvedAt ?? null,
    };
    return updatedAction;
  });

  if (!updatedAction) return null;

  const auditLog = [
    createAuditEvent("action_status_updated", actor, { actionId: id, status, note: note || undefined }),
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

// Updates in-app notification state; future mobile push uses the same approval-linked records.
export async function updateNotificationStatus({ id, status, actor = "user", all = false }, options = {}) {
  const allowed = new Set(["queued", "read", "dismissed"]);
  if (!allowed.has(status)) return null;

  const workspace = await readWorkspace(options);
  let updatedCount = 0;
  const notifications = (workspace.notifications || []).map((notification) => {
    if (!all && notification.id !== id) return notification;
    if (notification.status === status) return notification;
    updatedCount += 1;
    return {
      ...notification,
      status,
      readAt: status === "read" ? new Date().toISOString() : notification.readAt || null,
      dismissedAt: status === "dismissed" ? new Date().toISOString() : notification.dismissedAt || null,
      updatedAt: new Date().toISOString(),
    };
  });

  if (!all && !updatedCount) return null;

  const auditLog = [
    createAuditEvent("notification_status_updated", actor, { notificationId: all ? "all" : id, status, count: updatedCount }),
    ...workspace.auditLog,
  ].slice(0, 250);

  return await writeWorkspace({ ...workspace, notifications, auditLog }, options);
}
