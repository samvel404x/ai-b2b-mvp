import crypto from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { agentRunStatuses, createAuditEvent, syncDerivedWorkspaceData } from "./workspace-engine";
import { buildDemoWorkspace } from "./demo-workspace";
import { buildLangflowDemoArtifact } from "./langflow-demo-agent";
import { buildDemoLiveEvents, normalizeLiveEvents } from "./live-events";
import { buildWorkspaceMember, memberHasCapability, publicMember } from "./authorization";
import {
  isSupabaseWorkspaceStoreConfigured,
  findSupabaseWorkspaceByMemberIdentity,
  readSupabaseWorkspace,
  writeSupabaseWorkspace,
} from "./supabase-workspace-store";
import { deleteEvidenceFiles } from "./supabase-file-store";
import {
  buildPersistedWorkspace,
  defaultOperations,
  emptyWorkspace,
  getDefaultWorkspaceId,
  normalizeB2bDiscussionThread,
  normalizeB2bDiscussion,
  normalizeChatConversation,
  normalizeConnectorFilterPreset,
  normalizeConnectorRequest,
  normalizeExcelWorkspaceView,
  normalizeReportSchedule,
  normalizeSupportTicket,
  normalizeWorkspaceArtifact,
  normalizeWorkspacePreferences,
  normalizeWorkspace,
  publicWorkspaceSnapshot,
} from "./workspace-state";

const workspaceFileName = "genius-workspace.json";
const inviteMaxAgeMs = 1000 * 60 * 60 * 24 * 7;
const sessionTouchIntervalMs = 1000 * 60 * 5;
const portableExportSchema = "genius.workspace.portable.v1";

const portableStorageMetadataKeys = new Set([
  "storage",
  "storage_file",
  "storagefile",
  "storage_path",
  "storagepath",
  "file_path",
  "filepath",
]);

function workspaceIdFromOptions(options = {}) {
  return options.workspaceId;
}

function isGuestWorkspaceId(workspaceId) {
  return /^guest-[a-f0-9-]{12,}$/i.test(String(workspaceId || ""));
}

function isPortableStorageMetadataKey(key) {
  return portableStorageMetadataKeys.has(String(key || "").toLowerCase());
}

function compactPortableKey(key = "") {
  return String(key || "").toLowerCase().replace(/[^a-z0-9_]/g, "");
}

function isPortableSensitiveMetadataKey(key = "") {
  const normalized = compactPortableKey(key);
  return isPortableStorageMetadataKey(normalized)
    || normalized === "sessions"
    || normalized === "session"
    || normalized === "cookie"
    || normalized === "authorization"
    || normalized === "credentials"
    || normalized.includes("session")
    || normalized.includes("password")
    || normalized.includes("secret")
    || normalized.includes("token")
    || normalized.includes("apikey")
    || normalized.includes("api_key")
    || normalized === "email"
    || normalized.endsWith("_email")
    || normalized.endsWith("email");
}

function safePortableActorLabel(actor = "user") {
  const value = String(actor || "user").trim().slice(0, 254);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "workspace-user" : value;
}

function shouldUseSupabaseStore(options = {}, workspaceId) {
  if (options.forceLocalStore) return false;
  if (isGuestWorkspaceId(workspaceId)) return false;
  return isSupabaseWorkspaceStoreConfigured();
}

function shouldRequireSupabaseStore(options = {}, workspaceId) {
  if (options.forceLocalStore) return false;
  if (process.env.GENIUS_FORCE_LOCAL_STORE === "1") return false;
  if (isGuestWorkspaceId(workspaceId)) return false;
  return process.env.GENIUS_EXPECT_SUPABASE === "1";
}

function assertSupabaseStoreAvailable(operation, options = {}, workspaceId) {
  if (!shouldRequireSupabaseStore(options, getDefaultWorkspaceId(workspaceId))) return;
  if (!isSupabaseWorkspaceStoreConfigured()) {
    throw new Error(`Supabase workspace store is required for ${operation}, but Supabase is not configured.`);
  }
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

function workspaceIdFromLocalFileName(fileName) {
  if (fileName === workspaceFileName) return "default";
  const match = /^genius-workspace-(.+)\.json$/.exec(fileName);
  return match?.[1] || null;
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

async function findLocalWorkspaceByMemberIdentity({ email, userId } = {}) {
  const normalizedEmail = cleanMemberEmail(email);
  const normalizedUserId = String(userId || "").trim();
  if (!normalizedEmail && !normalizedUserId) return null;

  let files = [];
  try {
    files = await readdir(getDataDirectory());
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }

  for (const fileName of files.filter((file) => file === workspaceFileName || /^genius-workspace-.+\.json$/.test(file))) {
    const workspaceId = workspaceIdFromLocalFileName(fileName);
    if (!workspaceId) continue;
    const workspace = await readLocalWorkspace({ workspaceId });
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
  assertSupabaseStoreAvailable("workspace read", options, workspaceId);
  if (shouldUseSupabaseStore(options, getDefaultWorkspaceId(workspaceId))) {
    try {
      return await readSupabaseWorkspace(workspaceId);
    } catch (error) {
      if (shouldRequireSupabaseStore(options, workspaceId)) throw error;
      warnLocalStoreFallback("read", error);
    }
  }

  return await readLocalWorkspace({ workspaceId });
}

// Persists a derived workspace snapshot through the active backend adapter.
async function writeWorkspace(workspace, options = {}) {
  const workspaceId = workspaceIdFromOptions(options) || workspace?.id;
  assertSupabaseStoreAvailable("workspace write", options, workspaceId);
  const nextWorkspace = buildPersistedWorkspace(normalizeWorkspace(workspace, workspaceId));

  if (shouldUseSupabaseStore(options, getDefaultWorkspaceId(workspaceId))) {
    try {
      return publicWorkspaceSnapshot(await writeSupabaseWorkspace(nextWorkspace, workspaceId));
    } catch (error) {
      if (shouldRequireSupabaseStore(options, workspaceId)) throw error;
      warnLocalStoreFallback("write", error);
    }
  }

  return publicWorkspaceSnapshot(await writeLocalWorkspace(nextWorkspace));
}

function redactPortableValue(value, key = "") {
  const normalizedKey = String(key || "").toLowerCase();
  if (
    isPortableStorageMetadataKey(normalizedKey)
    || normalizedKey === "bucket"
    || normalizedKey === "objectpath"
    || normalizedKey === "object_path"
  ) {
    return "";
  }

  if (
    normalizedKey.includes("password")
    || normalizedKey.includes("secret")
    || normalizedKey.includes("token")
    || normalizedKey.includes("apikey")
    || normalizedKey.includes("api_key")
    || normalizedKey.includes("session")
    || normalizedKey === "email"
    || normalizedKey.endsWith("_email")
  ) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactPortableValue(item, key));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([entryKey]) => !["sessions", "inviteTokenHash"].includes(entryKey) && !isPortableStorageMetadataKey(entryKey))
        .map(([entryKey, entryValue]) => [entryKey, redactPortableValue(entryValue, entryKey)]),
    );
  }

  return value;
}

function portableWorkspaceSnapshot(workspace) {
  const normalized = buildPersistedWorkspace(normalizeWorkspace(workspace, workspace?.id));
  const publicSnapshot = publicWorkspaceSnapshot(normalized, { exposeMemberEmails: false });
  const { sessions: _sessions, ...safeWorkspace } = publicSnapshot;

  return redactPortableValue({
    ...safeWorkspace,
    members: (publicSnapshot.members || []).map((member) => ({
      ...member,
      email: "",
      emailMasked: member.emailMasked || "",
    })),
  });
}

function resolvePortableWorkspacePayload(payload = {}) {
  if (payload?.schema === portableExportSchema && payload.workspace) return payload.workspace;
  if (payload?.workspace && typeof payload.workspace === "object") return payload.workspace;
  return payload;
}

function stripImportedStorageMetadata(value, key = "") {
  if (isPortableSensitiveMetadataKey(key)) return undefined;

  if (Array.isArray(value)) {
    return value
      .map((item) => stripImportedStorageMetadata(item))
      .filter((item) => item !== undefined);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([entryKey]) => !isPortableStorageMetadataKey(entryKey))
        .map(([entryKey, entryValue]) => [entryKey, stripImportedStorageMetadata(entryValue, entryKey)])
        .filter(([, entryValue]) => entryValue !== undefined),
    );
  }

  return value;
}

function importedEvidenceId(originalId, workspaceId, index) {
  return `imp-${crypto
    .createHash("sha1")
    .update(`${workspaceId}:${originalId || index}:${crypto.randomUUID?.() || Date.now()}`)
    .digest("hex")
    .slice(0, 18)}`;
}

function sanitizeImportedEvidence(evidence = [], workspaceId) {
  const idMap = new Map();
  const records = Array.isArray(evidence) ? evidence : [];
  const sanitizedRecords = records.map((record, index) => {
    const source = record && typeof record === "object" ? record : {};
    const originalId = String(source.id || "").trim();
    const nextId = importedEvidenceId(originalId, workspaceId, index);
    if (originalId) idMap.set(originalId, nextId);

    return {
      ...stripImportedStorageMetadata(source),
      id: nextId,
      importedFromId: originalId || null,
      workspaceId,
      updatedAt: new Date().toISOString(),
    };
  });

  return { evidence: sanitizedRecords, idMap };
}

function remapEvidenceReferences(value, idMap) {
  if (!idMap.size) return value;

  if (Array.isArray(value)) {
    return value.map((item) => remapEvidenceReferences(item, idMap));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => {
        if ((key === "evidenceId" || key === "sourceEvidenceId") && idMap.has(entryValue)) {
          return [key, idMap.get(entryValue)];
        }

        if ((key === "evidenceIds" || key === "sourceEvidenceIds") && Array.isArray(entryValue)) {
          return [key, entryValue.map((id) => idMap.get(id) || id)];
        }

        return [key, remapEvidenceReferences(entryValue, idMap)];
      }),
    );
  }

  return value;
}

function sanitizePortableWorkspaceImport(importedPayload, workspaceId) {
  const scrubbedPayload = stripImportedStorageMetadata(importedPayload);
  const source = scrubbedPayload && typeof scrubbedPayload === "object" ? scrubbedPayload : {};
  const { evidence, idMap } = sanitizeImportedEvidence(source.evidence, workspaceId);
  return remapEvidenceReferences({ ...source, evidence }, idMap);
}

export async function exportPortableWorkspace(actor = "user", options = {}) {
  const workspace = await readWorkspace(options);
  return {
    schema: portableExportSchema,
    exportedAt: new Date().toISOString(),
    exportedBy: safePortableActorLabel(actor),
    workspaceId: workspace.id,
    workspace: portableWorkspaceSnapshot(workspace),
  };
}

export async function importPortableWorkspace(payload = {}, actor = "user", options = {}) {
  const currentWorkspace = await readWorkspace(options);
  const workspaceId = workspaceIdFromOptions(options) || currentWorkspace.id;
  const importedPayload = resolvePortableWorkspacePayload(payload);
  const sanitizedPayload = sanitizePortableWorkspaceImport(importedPayload, workspaceId);
  const importedWorkspace = normalizeWorkspace(sanitizedPayload, workspaceId);
  const now = new Date().toISOString();
  const auditLog = [
    createAuditEvent("portable_workspace_imported", actor, {
      sourceWorkspaceId: importedPayload?.id || importedPayload?.workspaceId || null,
      evidenceCount: importedWorkspace.evidence.length,
      actionCount: importedWorkspace.actions.length,
      reportCount: importedWorkspace.reports.length,
    }),
    ...(Array.isArray(importedWorkspace.auditLog) ? importedWorkspace.auditLog : []),
    ...currentWorkspace.auditLog,
  ].slice(0, 250);

  return await writeWorkspace({
    ...importedWorkspace,
    id: workspaceId,
    members: currentWorkspace.members || [],
    sessions: currentWorkspace.sessions || [],
    role: currentWorkspace.role || importedWorkspace.role,
    position: currentWorkspace.position || importedWorkspace.position,
    department: currentWorkspace.department || importedWorkspace.department,
    auditLog,
    updatedAt: now,
  }, options);
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

  return publicWorkspaceSnapshot(snapshot);
}

// Updates core workspace configuration (e.g. from registration).
export async function updateWorkspaceSettings(settings = {}, options = {}) {
  const workspace = await readWorkspace(options);
  const existingMembers = Array.isArray(workspace.members) ? workspace.members : [];
  const existingMember = settings.member
    ? existingMembers.find((item) => {
        return item.userId === settings.member.userId || item.email === settings.member.email;
      })
    : null;
  const member = settings.member
    ? buildWorkspaceMember({
        ...existingMember,
        ...settings.member,
        workspaceId: workspace.id,
        updatedAt: new Date().toISOString(),
      })
    : null;
  const members = member
    ? [
        member,
        ...existingMembers.filter((item) => {
          return item.userId !== member.userId && item.email !== member.email;
        }),
      ]
    : existingMembers;
  const updatedWorkspace = {
    ...workspace,
    workspaceName: settings.workspaceName || workspace.workspaceName,
    companySize: settings.companySize || workspace.companySize,
    businessType: settings.businessType || workspace.businessType,
    role: member?.role || settings.role || workspace.role,
    position: member?.position || settings.position || workspace.position,
    department: member?.department || settings.department || workspace.department,
    members,
  };
  return await writeWorkspace(updatedWorkspace, options);
}

function mergeWorkspacePreferences(current = {}, patch = {}) {
  const existing = normalizeWorkspacePreferences(current);
  const requested = patch.preferences && typeof patch.preferences === "object" ? patch.preferences : patch;
  const notifications = requested.notifications && typeof requested.notifications === "object" ? requested.notifications : {};

  return normalizeWorkspacePreferences({
    ...existing,
    profile: {
      ...existing.profile,
      ...(requested.profile && typeof requested.profile === "object" ? requested.profile : {}),
    },
    ai: {
      ...existing.ai,
      ...(requested.ai && typeof requested.ai === "object" ? requested.ai : {}),
    },
    notifications: {
      ...existing.notifications,
      ...notifications,
      channels: {
        ...existing.notifications.channels,
        ...(notifications.channels && typeof notifications.channels === "object" ? notifications.channels : {}),
      },
      categories: {
        ...existing.notifications.categories,
        ...(notifications.categories && typeof notifications.categories === "object" ? notifications.categories : {}),
      },
      quietHours: {
        ...existing.notifications.quietHours,
        ...(notifications.quietHours && typeof notifications.quietHours === "object" ? notifications.quietHours : {}),
      },
    },
    policies: {
      ...existing.policies,
      ...(requested.policies && typeof requested.policies === "object" ? requested.policies : {}),
    },
    workbench: {
      ...existing.workbench,
      ...(requested.workbench && typeof requested.workbench === "object" ? requested.workbench : {}),
    },
  });
}

function preferenceSectionsFromPatch(patch = {}) {
  const requested = patch.preferences && typeof patch.preferences === "object" ? patch.preferences : patch;
  return ["profile", "ai", "notifications", "policies", "workbench"].filter((section) => {
    return requested[section] && typeof requested[section] === "object";
  });
}

export async function updateWorkspacePreferences(input = {}, context = {}, options = {}) {
  const workspace = await readWorkspace(options);
  const actor = safePortableActorLabel(context.actor || context.email || "workspace-user");
  const preferences = mergeWorkspacePreferences(workspace.preferences, input);
  const sections = preferenceSectionsFromPatch(input);
  const auditLog = [
    createAuditEvent("workspace_preferences_updated", actor, {
      sections,
      policyUpdate: sections.includes("policies"),
    }),
    ...workspace.auditLog,
  ].slice(0, 250);

  const nextWorkspace = await writeWorkspace({ ...workspace, preferences, auditLog }, options);

  return {
    workspace: nextWorkspace,
    preferences: nextWorkspace.preferences || preferences,
  };
}

function cleanMemberEmail(value) {
  return String(value || "").trim().toLowerCase().slice(0, 254);
}

function findMemberIndex(members = [], target = {}) {
  const email = cleanMemberEmail(target.email);
  const userId = String(target.userId || target.id || "").trim();

  return members.findIndex((member) => {
    return (email && member.email === email) || (userId && member.userId === userId);
  });
}

function hasActiveOwner(members = []) {
  return members.some((member) => member.status === "active" && member.role === "Owner");
}

function assertValidMemberEmail(email) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("A valid member email is required.");
  }
}

function createInviteToken(workspaceId) {
  return `${String(workspaceId || "default")}.${crypto.randomBytes(32).toString("base64url")}`;
}

function hashInviteToken(token) {
  return crypto.createHash("sha256").update(String(token || "")).digest("hex");
}

function workspaceIdFromInviteToken(token) {
  const [workspaceId] = String(token || "").split(".");
  const cleanWorkspaceId = String(workspaceId || "").trim();
  return /^[a-zA-Z0-9_-]{1,120}$/.test(cleanWorkspaceId) ? cleanWorkspaceId : null;
}

function inviteStillValid(member) {
  return Boolean(member?.inviteTokenHash && Number.isFinite(Date.parse(member.inviteExpiresAt)) && Date.parse(member.inviteExpiresAt) > Date.now());
}

function sessionStillActive(session) {
  return Boolean(
    session?.status === "active"
    && Number.isFinite(Date.parse(session.expiresAt))
    && Date.parse(session.expiresAt) > Date.now(),
  );
}

function sessionMatchesMember(session, member) {
  return Boolean(
    member
    && ((session.userId && session.userId === member.userId) || (session.email && session.email === member.email)),
  );
}

function sessionNeedsTouch(session) {
  const lastSeen = Date.parse(session.lastSeenAt || session.createdAt || 0);
  return !Number.isFinite(lastSeen) || Date.now() - lastSeen > sessionTouchIntervalMs;
}

async function resolveWorkspaceInvite(token, expectedEmail) {
  const workspaceId = workspaceIdFromInviteToken(token);
  if (!workspaceId) throw new Error("Invite token is invalid.");

  const workspace = await readWorkspace({ workspaceId });
  const tokenHash = hashInviteToken(token);
  const members = [...(workspace.members || [])];
  const index = members.findIndex((member) => member.inviteTokenHash === tokenHash);
  if (index < 0) throw new Error("Invite token was not found or has already been used.");

  const member = members[index];
  if (member.status === "disabled") throw new Error("This workspace invitation has been disabled.");
  if (!inviteStillValid(member)) throw new Error("This workspace invitation has expired.");

  const email = cleanMemberEmail(expectedEmail);
  if (email && member.email !== email) {
    throw new Error("This invitation is assigned to a different email address.");
  }

  return { workspace, workspaceId, members, index, member };
}

function buildStoredSession(session, patch = {}) {
  return {
    id: String(patch.id || session.sessionId || session.id || "").trim(),
    userId: String(patch.userId || session.userId || session.email || "").trim(),
    email: cleanMemberEmail(patch.email || session.email),
    workspaceId: String(patch.workspaceId || session.workspaceId || "").trim(),
    status: patch.status || "active",
    createdAt: patch.createdAt || session.issuedAt || new Date().toISOString(),
    expiresAt: patch.expiresAt || session.expiresAt || new Date().toISOString(),
    lastSeenAt: patch.lastSeenAt || new Date().toISOString(),
    revokedAt: patch.revokedAt || null,
    revokedBy: patch.revokedBy || null,
  };
}

export async function readWorkspaceInvite(token, expectedEmail) {
  const { workspace, member } = await resolveWorkspaceInvite(token, expectedEmail);

  return {
    workspaceId: workspace.id,
    workspaceName: workspace.workspaceName,
    member: publicMember(member, { exposeEmail: true }),
    expiresAt: member.inviteExpiresAt,
  };
}

export async function findWorkspaceMembership(identity = {}) {
  const normalizedEmail = cleanMemberEmail(identity.email);
  const normalizedUserId = String(identity.userId || "").trim();
  if (!normalizedEmail && !normalizedUserId) return null;

  if (isSupabaseWorkspaceStoreConfigured()) {
    try {
      const result = await findSupabaseWorkspaceByMemberIdentity({
        email: normalizedEmail,
        userId: normalizedUserId,
      });
      if (result) return result;
    } catch (error) {
      if (shouldRequireSupabaseStore({}, "default")) throw error;
      warnLocalStoreFallback("membership lookup", error);
    }
  }

  return await findLocalWorkspaceByMemberIdentity({
    email: normalizedEmail,
    userId: normalizedUserId,
  });
}

export async function acceptWorkspaceInvite(token, authUser = {}) {
  const { workspace, members, index, member } = await resolveWorkspaceInvite(token, authUser.email);
  const now = new Date().toISOString();
  const nextMember = buildWorkspaceMember({
    ...member,
    userId: authUser.userId || member.userId || authUser.email,
    email: authUser.email || member.email,
    status: "active",
    acceptedAt: member.acceptedAt || now,
    lastSeenAt: now,
    inviteTokenHash: null,
    inviteExpiresAt: null,
    updatedAt: now,
  });
  const nextMembers = members.map((item, memberIndex) => (memberIndex === index ? nextMember : item));
  const auditLog = [
    createAuditEvent("workspace_invite_accepted", nextMember.email, {
      email: nextMember.email,
      role: nextMember.role,
    }),
    ...workspace.auditLog,
  ].slice(0, 250);
  const nextWorkspace = await writeWorkspace({ ...workspace, members: nextMembers, auditLog }, { workspaceId: workspace.id });

  return {
    workspace: nextWorkspace,
    workspaceId: nextWorkspace.id,
    member: nextMember,
  };
}

export async function registerWorkspaceSession(session, options = {}) {
  const workspace = await readWorkspace(options);
  const now = new Date().toISOString();
  const sessions = (workspace.sessions || [])
    .map((item) => buildStoredSession(item, item))
    .filter((item) => item.id !== session.sessionId && (sessionStillActive(item) || item.status === "revoked"))
    .slice(0, 99);
  const nextSession = buildStoredSession(session, {
    status: "active",
    createdAt: session.issuedAt || now,
    lastSeenAt: now,
  });
  const members = (workspace.members || []).map((member) => {
    if (!sessionMatchesMember(nextSession, member)) return member;
    return buildWorkspaceMember({ ...member, lastSeenAt: now, updatedAt: now });
  });

  const nextWorkspace = await writeWorkspace(
    {
      ...workspace,
      members,
      sessions: [nextSession, ...sessions],
      auditLog: [
        createAuditEvent("session_created", session.email, {
          sessionId: nextSession.id,
          email: nextSession.email,
        }),
        ...workspace.auditLog,
      ].slice(0, 250),
    },
    options,
  );

  return nextWorkspace;
}

export async function validateWorkspaceSession(session) {
  if (!session?.sessionId || !session.workspaceId) return null;
  const workspace = await readWorkspace({ workspaceId: session.workspaceId });
  const storedSession = (workspace.sessions || []).find((item) => item.id === session.sessionId);
  if (!sessionStillActive(storedSession)) return null;

  const member = (workspace.members || []).find((item) => {
    return item.status === "active" && sessionMatchesMember(storedSession, item);
  });
  if (!member) return null;

  const nextSession = {
    ...session,
    role: member.role,
    position: member.position,
    department: member.department,
    status: member.status,
    member,
    capabilities: undefined,
  };

  if (sessionNeedsTouch(storedSession)) {
    const now = new Date().toISOString();
    const sessions = (workspace.sessions || []).map((item) => {
      return item.id === storedSession.id ? buildStoredSession(item, { ...item, lastSeenAt: now }) : item;
    });
    const members = (workspace.members || []).map((item) => {
      return item.email === member.email ? buildWorkspaceMember({ ...item, lastSeenAt: now, updatedAt: now }) : item;
    });
    await writeWorkspace({ ...workspace, sessions, members }, { workspaceId: workspace.id });
  }

  return {
    workspace,
    member,
    session: nextSession,
  };
}

export async function revokeWorkspaceSession(session, actor = "user") {
  if (!session?.sessionId || !session.workspaceId) return null;
  const workspace = await readWorkspace({ workspaceId: session.workspaceId });
  const now = new Date().toISOString();
  let changed = false;
  const sessions = (workspace.sessions || []).map((item) => {
    if (item.id !== session.sessionId || item.status !== "active") return item;
    changed = true;
    return buildStoredSession(item, {
      ...item,
      status: "revoked",
      revokedAt: now,
      revokedBy: actor,
      lastSeenAt: now,
    });
  });

  if (!changed) return workspace;

  return await writeWorkspace(
    {
      ...workspace,
      sessions,
      auditLog: [
        createAuditEvent("session_revoked", actor, { sessionId: session.sessionId }),
        ...workspace.auditLog,
      ].slice(0, 250),
    },
    { workspaceId: workspace.id },
  );
}

function publicSessionId(sessionId = "") {
  return crypto.createHash("sha256").update(`public-session:${sessionId}`).digest("hex").slice(0, 18);
}

function sessionBelongsToContext(session = {}, context = {}) {
  const email = cleanMemberEmail(context.session?.email || context.email);
  const userId = String(context.session?.userId || context.userId || "").trim();
  return (
    (email && session.email === email)
    || (userId && session.userId === userId)
  );
}

function publicWorkspaceSession(session = {}, context = {}) {
  const current = session.id === context.session?.sessionId;
  return {
    id: publicSessionId(session.id),
    current,
    status: session.status || "active",
    device: current ? "Current browser" : "Saved browser session",
    browser: "GENIUS web app",
    os: "Workspace session",
    ip: "Hidden",
    location: "Hidden for privacy",
    createdAt: session.createdAt,
    lastSeenAt: session.lastSeenAt,
    expiresAt: session.expiresAt,
    revokedAt: session.revokedAt || null,
  };
}

export async function listWorkspaceSessions(context = {}, options = {}) {
  const workspace = await readWorkspace(options);
  const sessions = (workspace.sessions || [])
    .filter((session) => session.status === "active")
    .filter((session) => sessionBelongsToContext(session, context))
    .map((session) => publicWorkspaceSession(session, context))
    .sort((a, b) => Number(b.current) - Number(a.current) || Date.parse(b.lastSeenAt || 0) - Date.parse(a.lastSeenAt || 0));

  return { workspace: publicWorkspaceSnapshot(workspace), sessions };
}

export async function revokeWorkspaceSessions(input = {}, context = {}, options = {}) {
  const workspace = await readWorkspace(options);
  const now = new Date().toISOString();
  const actor = safePortableActorLabel(context.actor || context.email || "workspace-user");
  const targetPublicId = String(input.id || input.sessionId || "").trim();
  const allOther = Boolean(input.allOther || input.all);
  let revokedCount = 0;
  let matchedCurrent = false;

  if (!allOther && !targetPublicId) {
    throw new Error("Session id is required.");
  }

  const sessions = (workspace.sessions || []).map((session) => {
    if (session.status !== "active" || !sessionBelongsToContext(session, context)) return session;
    const isCurrent = session.id === context.session?.sessionId;
    const isTarget = publicSessionId(session.id) === targetPublicId;
    if (isCurrent && (allOther || isTarget)) {
      matchedCurrent = isTarget;
      return session;
    }
    if (!allOther && !isTarget) return session;
    revokedCount += 1;
    return buildStoredSession(session, {
      ...session,
      status: "revoked",
      revokedAt: now,
      revokedBy: actor,
      lastSeenAt: now,
    });
  });

  if (matchedCurrent && !allOther) {
    throw new Error("The current browser session cannot be revoked from this panel.");
  }

  const auditLog = revokedCount
    ? [
        createAuditEvent("workspace_sessions_revoked", actor, {
          revokedCount,
          allOther,
        }),
        ...workspace.auditLog,
      ].slice(0, 250)
    : workspace.auditLog;
  const nextWorkspace = revokedCount ? await writeWorkspace({ ...workspace, sessions, auditLog }, options) : publicWorkspaceSnapshot(workspace);
  const nextSessions = (sessions || [])
    .filter((session) => session.status === "active")
    .filter((session) => sessionBelongsToContext(session, context))
    .map((session) => publicWorkspaceSession(session, context))
    .sort((a, b) => Number(b.current) - Number(a.current) || Date.parse(b.lastSeenAt || 0) - Date.parse(a.lastSeenAt || 0));

  return {
    workspace: nextWorkspace,
    sessions: nextSessions,
    revokedCount,
  };
}

export async function listWorkspaceMembers(options = {}) {
  const workspace = await readWorkspace(options);
  return (workspace.members || []).map(publicMember);
}

export async function inviteWorkspaceMember(input = {}, actor = "user", options = {}) {
  const workspace = await readWorkspace(options);
  const email = cleanMemberEmail(input.email);
  assertValidMemberEmail(email);

  const now = new Date().toISOString();
  const members = [...(workspace.members || [])];
  const existingIndex = findMemberIndex(members, { email });
  const existing = existingIndex >= 0 ? members[existingIndex] : null;
  const shouldIssueInvite = existing?.status !== "active";
  const inviteToken = shouldIssueInvite ? createInviteToken(workspace.id) : null;
  const member = buildWorkspaceMember({
    ...existing,
    email,
    userId: existing?.userId || email,
    workspaceId: workspace.id,
    role: input.role || existing?.role || "Member",
    position: input.position || existing?.position || "Team Member",
    department: input.department || existing?.department || "Operations",
    status: existing?.status === "active" ? "active" : "invited",
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    invitedBy: existing?.invitedBy || actor,
    invitedAt: existing?.invitedAt || now,
    inviteTokenHash: inviteToken ? hashInviteToken(inviteToken) : existing?.inviteTokenHash || null,
    inviteExpiresAt: inviteToken ? new Date(Date.now() + inviteMaxAgeMs).toISOString() : existing?.inviteExpiresAt || null,
  });

  if (existingIndex >= 0) {
    members[existingIndex] = member;
  } else {
    members.unshift(member);
  }

  const auditLog = [
    createAuditEvent(existing ? "workspace_member_updated" : "workspace_member_invited", actor, {
      email: member.email,
      role: member.role,
      status: member.status,
    }),
    ...workspace.auditLog,
  ].slice(0, 250);
  const nextWorkspace = await writeWorkspace({ ...workspace, members, auditLog }, options);
  return {
    workspace: nextWorkspace,
    member: publicMember(member),
    invite: inviteToken
      ? {
          token: inviteToken,
          expiresAt: member.inviteExpiresAt,
        }
      : null,
  };
}

export async function updateWorkspaceMember(target = {}, patch = {}, actor = "user", options = {}) {
  const workspace = await readWorkspace(options);
  const members = [...(workspace.members || [])];
  const index = findMemberIndex(members, target);
  if (index < 0) return null;

  const existing = members[index];
  const now = new Date().toISOString();
  const nextMember = buildWorkspaceMember({
    ...existing,
    role: patch.role || existing.role,
    position: patch.position || existing.position,
    department: patch.department || existing.department,
    status: patch.status || existing.status,
    updatedAt: now,
  });
  const nextMembers = members.map((member, memberIndex) => (memberIndex === index ? nextMember : member));
  const nextSessions = nextMember.status === "active"
    ? workspace.sessions || []
    : (workspace.sessions || []).map((session) => {
        if (!sessionMatchesMember(session, nextMember) || session.status !== "active") return session;
        return buildStoredSession(session, {
          ...session,
          status: "revoked",
          revokedAt: now,
          revokedBy: actor,
          lastSeenAt: now,
        });
      });

  if (!hasActiveOwner(nextMembers)) {
    throw new Error("At least one active Owner is required in the workspace.");
  }

  const auditLog = [
    createAuditEvent("workspace_member_updated", actor, {
      email: nextMember.email,
      role: nextMember.role,
      status: nextMember.status,
    }),
    ...workspace.auditLog,
  ].slice(0, 250);
  const nextWorkspace = await writeWorkspace({ ...workspace, members: nextMembers, sessions: nextSessions, auditLog }, options);
  return { workspace: nextWorkspace, member: publicMember(nextMember) };
}

export async function disableWorkspaceMember(target = {}, actor = "user", options = {}) {
  return await updateWorkspaceMember(target, { status: "disabled" }, actor, options);
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
    createAuditEvent("evidence_uploaded", options.actor || "system", { count: records.length }),
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
  const workspaceId = workspaceIdFromOptions(options) || workspace.id;
  const deletedRecord = workspace.evidence.find((record) => record.id === id);
  const evidence = workspace.evidence.filter((record) => record.id !== id);
  if (evidence.length === workspace.evidence.length) return false;
  const auditLog = [
    createAuditEvent("evidence_deleted", "user", { evidenceId: id }),
    ...workspace.auditLog,
  ].slice(0, 250);
  await writeWorkspace({ ...workspace, evidence, auditLog }, options);
  await deleteEvidenceFiles([deletedRecord], { workspaceId });
  return true;
}

// Clears local evidence when the user resets Data Room.
export async function clearEvidenceRecords(options = {}) {
  const workspace = await readWorkspace(options);
  const workspaceId = workspaceIdFromOptions(options) || workspace.id;
  const deletedRecords = workspace.evidence;
  const auditLog = [
    createAuditEvent("evidence_cleared", "user"),
    ...workspace.auditLog,
  ].slice(0, 250);
  await writeWorkspace({ ...workspace, evidence: [], findings: [], actions: [], notifications: [], auditLog }, options);
  await deleteEvidenceFiles(deletedRecords, { workspaceId });
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
  await deleteEvidenceFiles(deletedRecords, { workspaceId });
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
  const workspaceId = workspaceIdFromOptions(options) || workspace.id;
  await deleteEvidenceFiles(workspace.evidence, { workspaceId });

  const demoWorkspace = buildDemoWorkspace(workspaceId);
  const auditLog = [
    createAuditEvent("demo_workspace_loaded", actor, { evidenceCount: demoWorkspace.evidence.length }),
    ...workspace.auditLog,
  ].slice(0, 250);

  return await writeWorkspace({
    ...demoWorkspace,
    workspaceName: workspace.workspaceName || demoWorkspace.workspaceName,
    role: workspace.role || demoWorkspace.role,
    position: workspace.position || demoWorkspace.position,
    department: workspace.department || demoWorkspace.department,
    companySize: workspace.companySize || demoWorkspace.companySize,
    businessType: workspace.businessType || demoWorkspace.businessType,
    members: workspace.members || [],
    sessions: workspace.sessions || [],
    auditLog,
  }, options);
}

function normalizeDecisionNote(value) {
  return String(value || "").trim().slice(0, 2000);
}

function cleanOperationText(value, fallback = "", maxLength = 2000) {
  const text = String(value || fallback).trim();
  return (text || fallback).slice(0, maxLength);
}

function normalizeOperations(operations = {}) {
  const source = operations && typeof operations === "object" ? operations : {};
  const b2bThread = source.b2bThread && typeof source.b2bThread === "object" ? source.b2bThread : {};
  const defaults = defaultOperations();

  return {
    gatewayReports: Array.isArray(source.gatewayReports) ? source.gatewayReports : [],
    b2bThread: {
      ...defaults.b2bThread,
      ...b2bThread,
      workflowStatus: b2bThread.workflowStatus || defaults.b2bThread.workflowStatus,
      messages: Array.isArray(b2bThread.messages) && b2bThread.messages.length ? b2bThread.messages : defaults.b2bThread.messages,
      discussions: Array.isArray(b2bThread.discussions) ? b2bThread.discussions.map(normalizeB2bDiscussion) : [],
      discussionThreads: Array.isArray(b2bThread.discussionThreads) ? b2bThread.discussionThreads.map(normalizeB2bDiscussionThread) : [],
      updatedAt: b2bThread.updatedAt || null,
    },
    crmTasks: Array.isArray(source.crmTasks) ? source.crmTasks : [],
  };
}

const allowedCrmTaskStatuses = new Set(["backlog", "todo", "in-progress", "review", "submitted", "completed"]);
const allowedCrmTaskPriorities = new Set(["Low", "Medium", "High", "Urgent", "Critical"]);

function normalizeCrmTaskStatus(value) {
  const status = String(value || "").trim().toLowerCase();
  if (allowedCrmTaskStatuses.has(status)) return status;
  if (status === "done" || status === "approved") return "submitted";
  if (status === "pending ai review" || status === "ready") return "review";
  return "todo";
}

function normalizeCrmTask(input = {}, fallback = {}) {
  const now = new Date().toISOString();
  const priority = allowedCrmTaskPriorities.has(input.priority) ? input.priority : fallback.priority || "Medium";
  const status = normalizeCrmTaskStatus(input.status || fallback.status);
  const progress = Number(input.progress ?? fallback.progress ?? 0);

  return {
    ...fallback,
    id: cleanOperationText(input.id || fallback.id, `crm-${crypto.randomUUID?.() || crypto.createHash("sha1").update(`${now}:${input.title || ""}`).digest("hex").slice(0, 16)}`, 120),
    reportId: cleanOperationText(input.reportId || fallback.reportId, "", 120) || null,
    title: cleanOperationText(input.title || fallback.title, "New operations task", 160),
    team: cleanOperationText(input.team || fallback.team, "Operations", 120),
    assignee: cleanOperationText(input.assignee || fallback.assignee, "Operations Team", 120),
    status,
    priority,
    priorityColor: cleanOperationText(
      input.priorityColor || fallback.priorityColor,
      priority === "High" || priority === "Urgent" || priority === "Critical" ? "critical" : priority === "Medium" ? "warning" : "muted",
      40,
    ),
    date: cleanOperationText(input.date || fallback.date, "Today", 80),
    checklist: cleanOperationText(input.checklist || fallback.checklist, status === "submitted" || status === "completed" ? "7/7" : "0/5", 40),
    attachments: Math.max(0, Math.min(99, Number(input.attachments ?? fallback.attachments ?? 0) || 0)),
    comments: Math.max(0, Math.min(999, Number(input.comments ?? fallback.comments ?? 0) || 0)),
    tag: cleanOperationText(input.tag || fallback.tag, "", 40) || null,
    progress: Math.max(0, Math.min(100, Number.isFinite(progress) ? Math.round(progress) : 0)),
    isCompleted: status === "completed" || input.isCompleted === true,
    submittedAt: input.submittedAt || fallback.submittedAt || null,
    createdAt: input.createdAt || fallback.createdAt || now,
    updatedAt: now,
  };
}

export async function upsertCrmTask(input = {}, actor = "user", options = {}) {
  const workspace = await readWorkspace(options);
  const operations = normalizeOperations(workspace.operations);
  const existing = operations.crmTasks.find((task) => task.id === input.id);
  const task = normalizeCrmTask(input, existing);
  const crmTasks = [task, ...operations.crmTasks.filter((item) => item.id !== task.id)].slice(0, 200);
  const auditLog = [
    createAuditEvent(existing ? "crm_task_updated" : "crm_task_created", actor, { taskId: task.id, title: task.title, status: task.status }),
    ...workspace.auditLog,
  ].slice(0, 250);
  const nextWorkspace = await writeWorkspace({ ...workspace, operations: { ...operations, crmTasks }, auditLog }, options);
  return { workspace: nextWorkspace, task };
}

export async function updateCrmTask(input = {}, actor = "user", options = {}) {
  const workspace = await readWorkspace(options);
  const operations = normalizeOperations(workspace.operations);
  const id = cleanOperationText(input.id || input.taskId, "", 120);
  if (!id) return null;

  const existing = operations.crmTasks.find((task) => task.id === id);
  const task = normalizeCrmTask({ ...existing, ...input, id }, existing);
  const crmTasks = [task, ...operations.crmTasks.filter((item) => item.id !== id)].slice(0, 200);
  const auditLog = [
    createAuditEvent(existing ? "crm_task_updated" : "crm_task_upserted", actor, { taskId: task.id, title: task.title, status: task.status }),
    ...workspace.auditLog,
  ].slice(0, 250);
  const nextWorkspace = await writeWorkspace({ ...workspace, operations: { ...operations, crmTasks }, auditLog }, options);
  return { workspace: nextWorkspace, task };
}

export async function deleteCrmTask(input = {}, actor = "user", options = {}) {
  const workspace = await readWorkspace(options);
  const operations = normalizeOperations(workspace.operations);
  const id = cleanOperationText(input.id || input.taskId, "", 120);
  if (!id) return null;

  const existing = operations.crmTasks.find((task) => task.id === id);
  if (!existing) return null;

  const crmTasks = operations.crmTasks.filter((task) => task.id !== id);
  const auditLog = [
    createAuditEvent("crm_task_deleted", actor, { taskId: id, title: existing.title }),
    ...workspace.auditLog,
  ].slice(0, 250);
  const nextWorkspace = await writeWorkspace({ ...workspace, operations: { ...operations, crmTasks }, auditLog }, options);
  return { workspace: nextWorkspace, task: existing };
}

function operationDecisionFromTeamReport({ deliveryLog, notes, taskTitle }) {
  const compactLog = cleanOperationText(deliveryLog, "No delivery log provided.", 600);
  const compactNotes = cleanOperationText(notes, "No manager notes provided.", 400);

  return {
    summary: `Team CRM submitted "${taskTitle}". GENIUS reviewed the delivery log and notes, then prepared an approval-safe operational recommendation.`,
    action: "Review and delegate operational follow-up",
    reasoning: `${compactLog}\n\nManager notes: ${compactNotes}`,
    confidence: 91,
    metrics: {
      trend: "Live",
      intake: "Submitted",
      optimal: "Reviewed",
      risk: /delay|missing|blocked|issue|variance/i.test(`${deliveryLog} ${notes}`) ? "Medium" : "Low",
    },
    impact: {
      revenue: "Protected",
      coverage: "Current shift",
      cost: "Approval gated",
    },
  };
}

export async function createTeamOperationReport(body = {}, actor = "user", options = {}) {
  const workspace = await readWorkspace(options);
  const operations = normalizeOperations(workspace.operations);
  const now = new Date().toISOString();
  const taskTitle = cleanOperationText(body.taskTitle, "Team operations update", 160);
  const report = {
    id: `ops-${crypto.randomUUID?.() || crypto.createHash("sha1").update(`${now}:${taskTitle}`).digest("hex").slice(0, 16)}`,
    source: "team-crm",
    sender: cleanOperationText(body.sender, "Operations Team", 120),
    role: cleanOperationText(body.role, body.team || "Team Operations", 120),
    title: taskTitle,
    status: "Pending AI Review",
    urgent: /delay|blocked|urgent|risk|issue|variance/i.test(`${body.deliveryLog || ""} ${body.notes || ""}`),
    deliveryLog: cleanOperationText(body.deliveryLog, "", 4000),
    notes: cleanOperationText(body.notes, "", 2000),
    decision: operationDecisionFromTeamReport({ ...body, taskTitle }),
    createdAt: now,
    updatedAt: now,
    auditTrail: [
      {
        status: "Pending AI Review",
        actor,
        note: "Submitted from Team Operations CRM.",
        createdAt: now,
      },
    ],
  };

  const auditLog = [
    createAuditEvent("team_report_submitted", actor, { reportId: report.id, title: report.title }),
    ...workspace.auditLog,
  ].slice(0, 250);
  const crmTask = {
    id: cleanOperationText(body.taskId, report.id, 120),
    reportId: report.id,
    title: report.title,
    team: cleanOperationText(body.team, report.role, 120),
    assignee: report.sender,
    status: "done",
    priority: report.urgent ? "High" : "Medium",
    submittedAt: now,
    updatedAt: now,
  };
  const nextOperations = {
    ...operations,
    gatewayReports: [report, ...operations.gatewayReports].slice(0, 100),
    crmTasks: [crmTask, ...operations.crmTasks.filter((task) => task.id !== crmTask.id)].slice(0, 200),
  };
  const nextWorkspace = await writeWorkspace({ ...workspace, operations: nextOperations, auditLog }, options);
  return { workspace: nextWorkspace, report };
}

export async function updateGatewayOperationReport(id, status, actor = "user", options = {}) {
  const allowed = new Set([
    "Pending AI Review",
    "Ready",
    "Approved",
    "Execution Queued",
    "Revision Requested",
    "Delegated",
    "Rejected",
    "Archived",
  ]);
  const requestedStatus = String(status || "").trim();
  const note = normalizeDecisionNote(options.note);
  const isNoteOnly = !requestedStatus && Boolean(note);
  if (!isNoteOnly && !allowed.has(requestedStatus)) return null;

  const workspace = await readWorkspace(options);
  const operations = normalizeOperations(workspace.operations);
  const now = new Date().toISOString();
  let updatedReport = null;
  let updatedStatus = "";
  const gatewayReports = operations.gatewayReports.map((report) => {
    if (report.id !== id) return report;
    const nextStatus = isNoteOnly ? report.status : requestedStatus;
    updatedStatus = nextStatus;
    const decision = {
      type: isNoteOnly ? "note_added" : "status_updated",
      status: nextStatus,
      actor,
      note,
      createdAt: now,
    };
    updatedReport = {
      ...report,
      status: nextStatus,
      updatedAt: now,
      delegatedAt: nextStatus === "Delegated" ? now : report.delegatedAt || null,
      delegatedBy: nextStatus === "Delegated" ? actor : report.delegatedBy || null,
      auditTrail: [decision, ...(Array.isArray(report.auditTrail) ? report.auditTrail : [])].slice(0, 50),
    };
    return updatedReport;
  });

  if (!updatedReport) return null;

  const auditLog = [
    createAuditEvent(isNoteOnly ? "gateway_report_note_added" : "gateway_report_status_updated", actor, {
      reportId: id,
      status: updatedStatus,
      note: note || undefined,
    }),
    ...workspace.auditLog,
  ].slice(0, 250);
  const nextWorkspace = await writeWorkspace({ ...workspace, operations: { ...operations, gatewayReports }, auditLog }, options);
  return { workspace: nextWorkspace, report: updatedReport };
}

const primaryB2bDiscussionId = "inv-2025-0519";

function buildB2bMessage(body = {}, now = new Date().toISOString()) {
  return {
    id: `b2b-${crypto.randomUUID?.() || crypto.createHash("sha1").update(`${now}:${body.text || ""}`).digest("hex").slice(0, 16)}`,
    sender: cleanOperationText(body.sender, "You", 80),
    role: cleanOperationText(body.role, "Alex Rivera", 120),
    time: "Just now",
    text: cleanOperationText(body.text, "", 4000),
    isSelf: body.isSelf !== false,
    isInternal: Boolean(body.isInternal),
    isSystem: Boolean(body.isSystem),
    isAction: Boolean(body.isAction),
    status: body.status || "Delivered",
    statusColor: body.statusColor || "text-primary",
    createdAt: now,
  };
}

export async function appendB2bThreadMessage(body = {}, actor = "user", options = {}) {
  const workspace = await readWorkspace(options);
  const operations = normalizeOperations(workspace.operations);
  const now = new Date().toISOString();
  const message = buildB2bMessage(body, now);
  const discussionId = cleanOperationText(body.discussionId, "", 120);

  if (discussionId && discussionId !== primaryB2bDiscussionId) {
    const existingThread = operations.b2bThread.discussionThreads.find((thread) => thread.discussionId === discussionId);
    const discussionThread = normalizeB2bDiscussionThread({
      ...existingThread,
      id: existingThread?.id || discussionId,
      discussionId,
      workflowStatus: existingThread?.workflowStatus || "Pending Approval",
      messages: [...(existingThread?.messages || []), message].slice(-200),
      createdAt: existingThread?.createdAt || now,
      updatedAt: now,
    });
    const b2bThread = {
      ...operations.b2bThread,
      discussionThreads: [
        discussionThread,
        ...operations.b2bThread.discussionThreads.filter((thread) => thread.discussionId !== discussionId),
      ].slice(0, 100),
      updatedAt: now,
    };
    const auditLog = [
      createAuditEvent("b2b_discussion_message_added", actor, {
        discussionId,
        messageId: message.id,
        isSystem: message.isSystem,
        isInternal: message.isInternal,
      }),
      ...workspace.auditLog,
    ].slice(0, 250);
    const nextWorkspace = await writeWorkspace({ ...workspace, operations: { ...operations, b2bThread }, auditLog }, options);
    return { workspace: nextWorkspace, message, b2bThread, discussionThread };
  }

  const b2bThread = {
    ...operations.b2bThread,
    messages: [...operations.b2bThread.messages, message].slice(-200),
    updatedAt: now,
  };
  const auditLog = [
    createAuditEvent("b2b_message_added", actor, { messageId: message.id, isSystem: message.isSystem, isInternal: message.isInternal }),
    ...workspace.auditLog,
  ].slice(0, 250);
  const nextWorkspace = await writeWorkspace({ ...workspace, operations: { ...operations, b2bThread }, auditLog }, options);
  return { workspace: nextWorkspace, message };
}

export async function updateB2bWorkflowStatus(status, actor = "user", options = {}) {
  const allowed = new Set(["Pending Approval", "Approved", "Rejected"]);
  if (!allowed.has(status)) return null;

  const workspace = await readWorkspace(options);
  const operations = normalizeOperations(workspace.operations);
  const now = new Date().toISOString();
  const discussionId = cleanOperationText(options.discussionId, "", 120);
  const isScopedDiscussion = Boolean(discussionId && discussionId !== primaryB2bDiscussionId);
  let workflowText = `Workflow status changed to ${status}.`;
  if (status === "Approved") {
    workflowText = isScopedDiscussion
      ? "Workspace approval recorded. External partner execution remains locked until partner access is connected."
      : "Terms approved. Credit note workflow is now unlocked for Finance processing.";
  }
  const systemMessage = {
    id: `b2b-system-${crypto.randomUUID?.() || now}`,
    sender: "Smart Assist",
    role: "System Action",
    time: "Just now",
    text: workflowText,
    isSystem: true,
    isAction: true,
    createdAt: now,
  };

  if (isScopedDiscussion) {
    const existingThread = operations.b2bThread.discussionThreads.find((thread) => thread.discussionId === discussionId);
    const discussionThread = normalizeB2bDiscussionThread({
      ...existingThread,
      id: existingThread?.id || discussionId,
      discussionId,
      workflowStatus: status,
      messages: [...(existingThread?.messages || []), systemMessage].slice(-200),
      createdAt: existingThread?.createdAt || now,
      updatedAt: now,
    });
    const b2bThread = {
      ...operations.b2bThread,
      discussionThreads: [
        discussionThread,
        ...operations.b2bThread.discussionThreads.filter((thread) => thread.discussionId !== discussionId),
      ].slice(0, 100),
      updatedAt: now,
    };
    const auditLog = [
      createAuditEvent("b2b_discussion_workflow_status_updated", actor, { discussionId, status }),
      ...workspace.auditLog,
    ].slice(0, 250);
    const nextWorkspace = await writeWorkspace({ ...workspace, operations: { ...operations, b2bThread }, auditLog }, options);
    return { workspace: nextWorkspace, b2bThread, discussionThread };
  }

  const b2bThread = {
    ...operations.b2bThread,
    workflowStatus: status,
    messages: [...operations.b2bThread.messages, systemMessage].slice(-200),
    updatedAt: now,
  };
  const auditLog = [
    createAuditEvent("b2b_workflow_status_updated", actor, { status }),
    ...workspace.auditLog,
  ].slice(0, 250);
  const nextWorkspace = await writeWorkspace({ ...workspace, operations: { ...operations, b2bThread }, auditLog }, options);
  return { workspace: nextWorkspace, b2bThread };
}

const allowedB2bDiscussionActions = new Set(["upsert", "pin", "unpin", "archive", "restore", "delete", "clear_archived"]);

export async function updateB2bDiscussion(input = {}, actor = "user", options = {}) {
  const action = cleanOperationText(input.action || input.operation, "upsert", 40).toLowerCase();
  if (!allowedB2bDiscussionActions.has(action)) return null;

  const id = cleanOperationText(input.id || input.discussionId, "", 120);
  if (!id) return null;

  const workspace = await readWorkspace(options);
  const operations = normalizeOperations(workspace.operations);
  const now = new Date().toISOString();
  const existing = operations.b2bThread.discussions.find((discussion) => discussion.id === id);
  const patch = {
    ...existing,
    ...input,
    id,
    updatedAt: now,
  };

  if (action === "pin") {
    patch.pinned = true;
    patch.favorite = true;
  }
  if (action === "unpin") {
    patch.pinned = false;
    patch.favorite = false;
  }
  if (action === "archive") {
    patch.archived = true;
  }
  if (action === "restore") {
    patch.archived = false;
  }

  const discussion = normalizeB2bDiscussion({
    ...patch,
    local: Boolean(existing?.local || input.local),
    createdAt: existing?.createdAt || input.createdAt || now,
  });

  let discussions = operations.b2bThread.discussions;
  let archivedClearedAt = operations.b2bThread.archivedClearedAt;

  if (action === "clear_archived") {
    archivedClearedAt = now;
    discussions = discussions.filter(item => !item.archived);
  } else if (action === "delete") {
    discussion.deleted = true;
    discussions = [
      discussion,
      ...discussions.filter((item) => item.id !== discussion.id),
    ].slice(0, 100);
  } else {
    discussions = [
      discussion,
      ...discussions.filter((item) => item.id !== discussion.id),
    ].slice(0, 100);
  }
  const b2bThread = {
    ...operations.b2bThread,
    discussions,
    archivedClearedAt,
    updatedAt: now,
  };
  const auditEvent = existing || action !== "upsert" ? "b2b_discussion_updated" : "b2b_discussion_created";
  const auditLog = [
    createAuditEvent(auditEvent, actor, {
      discussionId: discussion.id,
      label: discussion.label,
      action,
      pinned: discussion.pinned,
      archived: discussion.archived,
    }),
    ...workspace.auditLog,
  ].slice(0, 250);
  const nextWorkspace = await writeWorkspace({ ...workspace, operations: { ...operations, b2bThread }, auditLog }, options);

  return { workspace: nextWorkspace, b2bThread, discussion };
}

// Applies an approval decision while keeping future external execution behind guardrails.
export async function updateActionStatus(id, status, actor = "user", options = {}) {
  const allowed = new Set(["Needs review", "Needs evidence", "Ready", "Delegated", "Approved", "Rejected", "Edited", "Snoozed", "Done"]);
  if (!allowed.has(status)) return null;

  const workspace = await readWorkspace(options);
  const now = new Date().toISOString();
  const note = normalizeDecisionNote(options.note);
  const delegateTo = normalizeDecisionNote(options.delegateTo).slice(0, 160);
  const snoozedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  let updatedAction = null;
  const actions = workspace.actions.map((action) => {
    if (action.id !== id) return action;
    const previousStatus = action.status || "Needs review";
    const decision = {
      id: `decision-${crypto.randomUUID?.() || now}`,
      status,
      previousStatus,
      note,
      actor,
      source: normalizeDecisionNote(options.source || "approvals").slice(0, 80),
      delegateTo: status === "Delegated" ? delegateTo || action.owner || "Decision owner" : "",
      createdAt: now,
    };
    const externalExecution = {
      ...(action.externalExecution || {}),
      enabled: false,
      approvedAt: status === "Approved" ? now : action.externalExecution?.approvedAt || null,
      approvedBy: status === "Approved" ? actor : action.externalExecution?.approvedBy || null,
      lastApprovalStatus: status,
      blockedReason: status === "Approved"
        ? "Human approval recorded. External execution still requires production connector permissions."
        : "External execution blocked until a human approval and production connector permissions exist.",
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
      approvedBy: status === "Approved" ? actor : action.approvedBy ?? null,
      rejectedAt: status === "Rejected" ? now : action.rejectedAt ?? null,
      rejectedBy: status === "Rejected" ? actor : action.rejectedBy ?? null,
      doneAt: status === "Done" ? now : action.doneAt ?? null,
      doneBy: status === "Done" ? actor : action.doneBy ?? null,
      needsEvidenceAt: status === "Needs evidence" ? now : action.needsEvidenceAt ?? null,
      needsEvidenceBy: status === "Needs evidence" ? actor : action.needsEvidenceBy ?? null,
      editedAt: status === "Edited" ? now : action.editedAt ?? null,
      editedBy: status === "Edited" ? actor : action.editedBy ?? null,
      readyAt: status === "Ready" ? now : action.readyAt ?? null,
      readyBy: status === "Ready" ? actor : action.readyBy ?? null,
      delegatedAt: status === "Delegated" ? now : action.delegatedAt ?? null,
      delegatedBy: status === "Delegated" ? actor : action.delegatedBy ?? null,
      delegatedTo: status === "Delegated" ? delegateTo || action.owner || "Decision owner" : action.delegatedTo ?? null,
      snoozedAt: status === "Snoozed" ? now : action.snoozedAt ?? null,
      snoozedBy: status === "Snoozed" ? actor : action.snoozedBy ?? null,
      snoozedUntil: status === "Snoozed" ? snoozedUntil : action.snoozedUntil ?? null,
      executionBlocked: true,
      externalExecution,
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

function cleanDiagnosticWorkflowText(value, fallback = "", maxLength = 160) {
  const text = String(value || "").trim();
  return (text || fallback).slice(0, maxLength);
}

export async function updateDiagnosticWorkflow(input = {}, actor = "user", options = {}) {
  const workspace = await readWorkspace(options);
  const snapshot = syncDerivedWorkspaceData(workspace);
  const categories = snapshot.diagnostics?.categories || [];
  const id = cleanDiagnosticWorkflowText(input.id, "", 120);
  const category = categories.find((item) => item.id === id);
  const allowedStatuses = new Set(["Open", "In progress", "Review", "Closed"]);
  const requestedStatus = cleanDiagnosticWorkflowText(input.status, "", 40);
  const owner = cleanDiagnosticWorkflowText(input.owner, "", 120);
  const ownerRole = cleanDiagnosticWorkflowText(input.ownerRole, "", 120);
  const note = cleanDiagnosticWorkflowText(input.note, "", 500);

  if (!id || !category) {
    throw new Error("Diagnostic category was not found.");
  }

  if (requestedStatus && !allowedStatuses.has(requestedStatus)) {
    throw new Error("Unsupported diagnostic workflow status.");
  }

  if (!requestedStatus && !owner && !ownerRole && !note) {
    throw new Error("Diagnostic workflow update is empty.");
  }

  const now = new Date().toISOString();
  const existingOverrides = workspace.diagnostics?.overrides && typeof workspace.diagnostics.overrides === "object"
    ? workspace.diagnostics.overrides
    : {};
  const previous = existingOverrides[id] && typeof existingOverrides[id] === "object" ? existingOverrides[id] : {};
  const override = {
    ...previous,
    ...(requestedStatus ? { status: requestedStatus } : {}),
    ...(owner ? { owner } : {}),
    ...(ownerRole ? { ownerRole } : {}),
    ...(note ? { note } : {}),
    updatedAt: now,
    updatedBy: cleanDiagnosticWorkflowText(actor, "user", 254).toLowerCase(),
  };
  const diagnostics = {
    ...(workspace.diagnostics || {}),
    overrides: {
      ...existingOverrides,
      [id]: override,
    },
  };
  const auditLog = [
    createAuditEvent("diagnostic_workflow_updated", actor, {
      diagnosticId: id,
      status: override.status,
      owner: override.owner,
      ownerRole: override.ownerRole,
    }),
    ...workspace.auditLog,
  ].slice(0, 250);
  const nextWorkspace = await writeWorkspace({ ...workspace, diagnostics, auditLog }, options);

  return {
    workspace: nextWorkspace,
    diagnostic: (nextWorkspace.diagnostics?.categories || []).find((item) => item.id === id) || null,
  };
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

export async function runLangflowDemoAgent(input = {}, context = {}, options = {}) {
  const workspace = syncDerivedWorkspaceData(await readWorkspace(options));
  const actor = cleanWorkbenchArtifactInput(context.actor || context.email || "workspace-user", "workspace-user", 254).toLowerCase();
  const prepared = await buildLangflowDemoArtifact({
    workspace,
    prompt: input.prompt,
  });

  const saved = await saveWorkbenchArtifact(
    prepared.artifact,
    {
      actor,
      member: context.member,
      role: context.role,
      position: context.position,
      department: context.department,
    },
    options,
  );
  const persistedWorkspace = await readWorkspace(options);
  const savedArtifact = (persistedWorkspace.workspaceArtifacts || []).find((artifact) => artifact.id === saved.artifact?.id)
    || saved.artifact;
  const auditLog = [
    createAuditEvent("langflow_demo_agent_run", actor, {
      artifactId: savedArtifact?.id,
      runtimeProvider: prepared.runtime.provider,
      runtimeStatus: prepared.runtime.status,
      flowId: prepared.runtime.flowId,
      configured: prepared.runtime.configured,
      externalExecutionEnabled: false,
    }),
    ...persistedWorkspace.auditLog,
  ].slice(0, 250);
  const nextWorkspace = await writeWorkspace(syncDerivedWorkspaceData({ ...persistedWorkspace, auditLog }), options);

  return {
    workspace: nextWorkspace,
    artifact: (nextWorkspace.workspaceArtifacts || []).find((artifact) => artifact.id === savedArtifact?.id) || savedArtifact,
    runtime: prepared.runtime,
    output: prepared.output,
  };
}

function cleanAgentRunText(value, fallback = "", maxLength = 500) {
  const text = String(value || "").trim();
  return (text || fallback).slice(0, maxLength);
}

function applyAgentRunLifecycleTimestamps(run, status, now) {
  return {
    ...run,
    lastRunAt: status === "Running" || status === "Completed" ? now : run.lastRunAt || now,
    startedAt: status === "Running" ? now : run.startedAt || null,
    pausedAt: status === "Paused" ? now : status === "Running" ? null : run.pausedAt || null,
    completedAt: status === "Completed" ? now : status === "Running" ? null : run.completedAt || null,
    failedAt: status === "Failed" ? now : status === "Running" ? null : run.failedAt || null,
  };
}

export async function updateAgentRunStatus(input = {}, context = {}, options = {}) {
  const allowedStatuses = new Set(agentRunStatuses);
  const workspace = await readWorkspace(options);
  const snapshot = syncDerivedWorkspaceData(workspace);
  const id = cleanAgentRunText(input.id, "", 160);
  const agentId = cleanAgentRunText(input.agentId, "", 120);
  const status = cleanAgentRunText(input.status, "", 40);
  const note = cleanAgentRunText(input.note, "", 500);
  const actor = cleanAgentRunText(context.actor || context.email || context, "user", 254).toLowerCase();

  if (!id && !agentId) {
    throw new Error("Agent run id is required.");
  }

  if (!allowedStatuses.has(status)) {
    throw new Error("Unsupported agent run status.");
  }

  const currentRun = (snapshot.agentRuns || []).find((run) => run.id === id || run.agentId === agentId);
  if (!currentRun) {
    throw new Error("Agent run was not found.");
  }

  const now = new Date().toISOString();
  const event = {
    id: `agent-event-${crypto.randomUUID?.() || crypto.randomBytes(8).toString("hex")}`,
    type: "status_updated",
    actor,
    status,
    message: note || `Agent run status changed to ${status}.`,
    createdAt: now,
  };
  const updatedRun = applyAgentRunLifecycleTimestamps({
    ...currentRun,
    status,
    statusNote: note,
    updatedAt: now,
    updatedBy: actor,
    events: [event, ...(Array.isArray(currentRun.events) ? currentRun.events : [])].slice(0, 50),
  }, status, now);
  const agentRuns = (snapshot.agentRuns || []).map((run) => (run.agentId === currentRun.agentId ? updatedRun : run));
  const auditLog = [
    createAuditEvent("agent_run_status_updated", actor, {
      agentRunId: updatedRun.id,
      agentId: updatedRun.agentId,
      status,
      note: note || undefined,
    }),
    ...workspace.auditLog,
  ].slice(0, 250);
  const nextWorkspace = await writeWorkspace({ ...workspace, agentRuns, auditLog }, options);

  return {
    workspace: nextWorkspace,
    agentRun: (nextWorkspace.agentRuns || []).find((run) => run.agentId === updatedRun.agentId) || updatedRun,
  };
}

// Updates in-app notification state; future mobile push uses the same approval-linked records.
export async function updateNotificationStatus({ id, status, actor = "user", all = false }, options = {}) {
  const allowed = new Set(["queued", "read", "dismissed"]);
  if (!allowed.has(status)) return null;

  const workspace = await readWorkspace(options);
  const now = new Date().toISOString();
  let updatedCount = 0;
  const notifications = (workspace.notifications || []).map((notification) => {
    if (!all && notification.id !== id) return notification;
    if (all && status === "read" && notification.status === "dismissed") return notification;
    if (notification.status === status) return notification;
    updatedCount += 1;
    return {
      ...notification,
      status,
      readAt: status === "read" ? now : status === "queued" ? null : notification.readAt || null,
      dismissedAt: status === "dismissed" ? now : status === "queued" || status === "read" ? null : notification.dismissedAt || null,
      updatedAt: now,
    };
  });

  if (!all && !updatedCount) return null;

  const auditLog = [
    createAuditEvent("notification_status_updated", actor, { notificationId: all ? "all" : id, status, count: updatedCount }),
    ...workspace.auditLog,
  ].slice(0, 250);

  return await writeWorkspace({ ...workspace, notifications, auditLog }, options);
}

function cleanSupportInput(value, fallback = "", maxLength = 500) {
  const text = String(value || "").trim();
  return (text || fallback).slice(0, maxLength);
}

function createSupportTicketId(now = new Date().toISOString()) {
  const suffix = (crypto.randomUUID?.() || crypto.randomBytes(8).toString("hex")).replace(/-/g, "").slice(0, 8).toUpperCase();
  return `SUP-${now.slice(0, 10).replace(/-/g, "")}-${suffix}`;
}

function createSupportEntityId(prefix, now = new Date().toISOString()) {
  const suffix = (crypto.randomUUID?.() || crypto.randomBytes(8).toString("hex")).replace(/-/g, "").slice(0, 8);
  return `${prefix}-${now.slice(0, 10).replace(/-/g, "")}-${suffix}`;
}

function requireSupportTicketMutation(ticket, actor, member) {
  const isRequester = ticket.requester?.email && ticket.requester.email === actor;
  const canManageWorkspaceTickets = memberHasCapability(member, "manage_members");

  if (!isRequester && !canManageWorkspaceTickets) {
    throw new Error("Only the requester or a workspace admin can update this support ticket.");
  }
}

export async function createSupportTicket(input = {}, context = {}, options = {}) {
  const workspace = await readWorkspace(options);
  const now = new Date().toISOString();
  const subject = cleanSupportInput(input.subject, "", 160);
  const description = cleanSupportInput(input.description, "", 2000);

  if (!subject || !description) {
    throw new Error("Support ticket subject and description are required.");
  }

  const actor = cleanSupportInput(context.actor || context.email, "user", 254).toLowerCase();
  const ticket = normalizeSupportTicket({
    id: createSupportTicketId(now),
    issueType: cleanSupportInput(input.issueType, "How-to / Usage", 80),
    priority: cleanSupportInput(input.priority, "Medium", 20),
    subject,
    description,
    status: "open",
    requester: {
      email: actor,
      role: cleanSupportInput(context.member?.role || context.role, "Member", 80),
      position: cleanSupportInput(context.member?.position || context.position, "", 120),
      department: cleanSupportInput(context.member?.department || context.department, "", 120),
    },
    source: cleanSupportInput(input.source, "support-center", 80),
    createdAt: now,
    updatedAt: now,
    lastActivityAt: now,
    events: [
      {
        id: `event-${crypto.randomUUID?.() || now}`,
        type: "created",
        actor,
        message: "Support ticket created from the workspace support center.",
        createdAt: now,
      },
    ],
  });

  const supportTickets = [ticket, ...(workspace.supportTickets || [])].slice(0, 200);
  const auditLog = [
    createAuditEvent("support_ticket_created", actor, {
      ticketId: ticket.id,
      priority: ticket.priority,
      issueType: ticket.issueType,
    }),
    ...workspace.auditLog,
  ].slice(0, 250);

  const nextWorkspace = await writeWorkspace({ ...workspace, supportTickets, auditLog }, options);
  return {
    workspace: nextWorkspace,
    ticket: (nextWorkspace.supportTickets || []).find((item) => item.id === ticket.id) || ticket,
  };
}

export async function updateSupportTicketStatus(input = {}, context = {}, options = {}) {
  const workspace = await readWorkspace(options);
  const now = new Date().toISOString();
  const id = cleanSupportInput(input.id || input.ticketId, "", 120);
  const status = cleanSupportInput(input.status, "", 40).toLowerCase();
  const validStatuses = new Set(["open", "pending", "resolved", "closed"]);

  if (!id) {
    throw new Error("Support ticket id is required.");
  }

  if (!validStatuses.has(status)) {
    throw new Error("Support ticket status is invalid.");
  }

  const supportTickets = Array.isArray(workspace.supportTickets) ? workspace.supportTickets : [];
  const ticketIndex = supportTickets.findIndex((ticket) => ticket.id === id);

  if (ticketIndex === -1) {
    throw new Error("Support ticket was not found.");
  }

  const actor = cleanSupportInput(context.actor || context.email, "user", 254).toLowerCase();
  const existingTicket = normalizeSupportTicket(supportTickets[ticketIndex]);
  const isRequester = existingTicket.requester?.email && existingTicket.requester.email === actor;
  const canManageWorkspaceTickets = memberHasCapability(context.member, "manage_members");

  if (!isRequester && !canManageWorkspaceTickets) {
    throw new Error("Only the requester or a workspace admin can update this support ticket.");
  }

  const note = cleanSupportInput(input.note, "", 500);
  const event = {
    id: `event-${crypto.randomUUID?.() || now}`,
    type: "status_updated",
    actor,
    message: note || `Support ticket status changed to ${status}.`,
    status,
    createdAt: now,
  };
  const updatedTicket = normalizeSupportTicket({
    ...existingTicket,
    status,
    updatedAt: now,
    lastActivityAt: now,
    events: [...(existingTicket.events || []).slice(-49), event],
  });
  const nextSupportTickets = supportTickets.map((ticket, index) => (
    index === ticketIndex ? updatedTicket : normalizeSupportTicket(ticket)
  ));
  const auditLog = [
    createAuditEvent("support_ticket_status_updated", actor, {
      ticketId: updatedTicket.id,
      status: updatedTicket.status,
    }),
    ...workspace.auditLog,
  ].slice(0, 250);

  const nextWorkspace = await writeWorkspace({ ...workspace, supportTickets: nextSupportTickets, auditLog }, options);
  return {
    workspace: nextWorkspace,
    ticket: (nextWorkspace.supportTickets || []).find((item) => item.id === updatedTicket.id) || updatedTicket,
  };
}

export async function addSupportTicketComment(input = {}, context = {}, options = {}) {
  const workspace = await readWorkspace(options);
  const now = new Date().toISOString();
  const id = cleanSupportInput(input.id || input.ticketId, "", 120);
  const message = cleanSupportInput(input.message || input.comment || input.note, "", 2000);

  if (!id) {
    throw new Error("Support ticket id is required.");
  }

  if (!message) {
    throw new Error("Support ticket comment is required.");
  }

  const supportTickets = Array.isArray(workspace.supportTickets) ? workspace.supportTickets : [];
  const ticketIndex = supportTickets.findIndex((ticket) => ticket.id === id);

  if (ticketIndex === -1) {
    throw new Error("Support ticket was not found.");
  }

  const actor = cleanSupportInput(context.actor || context.email, "user", 254).toLowerCase();
  const existingTicket = normalizeSupportTicket(supportTickets[ticketIndex]);
  requireSupportTicketMutation(existingTicket, actor, context.member);

  const event = {
    id: createSupportEntityId("event", now),
    type: "comment_added",
    actor,
    message,
    createdAt: now,
  };
  const updatedTicket = normalizeSupportTicket({
    ...existingTicket,
    updatedAt: now,
    lastActivityAt: now,
    events: [...(existingTicket.events || []).slice(-49), event],
  });
  const nextSupportTickets = supportTickets.map((ticket, index) => (
    index === ticketIndex ? updatedTicket : normalizeSupportTicket(ticket)
  ));
  const auditLog = [
    createAuditEvent("support_ticket_comment_added", actor, {
      ticketId: updatedTicket.id,
    }),
    ...workspace.auditLog,
  ].slice(0, 250);

  const nextWorkspace = await writeWorkspace({ ...workspace, supportTickets: nextSupportTickets, auditLog }, options);
  return {
    workspace: nextWorkspace,
    ticket: (nextWorkspace.supportTickets || []).find((item) => item.id === updatedTicket.id) || updatedTicket,
  };
}

export async function addSupportTicketAttachment(input = {}, context = {}, options = {}) {
  const workspace = await readWorkspace(options);
  const now = new Date().toISOString();
  const id = cleanSupportInput(input.id || input.ticketId, "", 120);
  const name = cleanSupportInput(input.name || input.fileName || input.label, "", 160);
  const note = cleanSupportInput(input.note || input.description, "", 500);
  const type = cleanSupportInput(input.type || input.mimeType, "reference", 120);
  const size = Number(input.size || 0);

  if (!id) {
    throw new Error("Support ticket id is required.");
  }

  if (!name) {
    throw new Error("Support ticket attachment name is required.");
  }

  const supportTickets = Array.isArray(workspace.supportTickets) ? workspace.supportTickets : [];
  const ticketIndex = supportTickets.findIndex((ticket) => ticket.id === id);

  if (ticketIndex === -1) {
    throw new Error("Support ticket was not found.");
  }

  const actor = cleanSupportInput(context.actor || context.email, "user", 254).toLowerCase();
  const existingTicket = normalizeSupportTicket(supportTickets[ticketIndex]);
  requireSupportTicketMutation(existingTicket, actor, context.member);

  if ((existingTicket.attachments || []).length >= 10) {
    throw new Error("A support ticket can store up to 10 attachment references.");
  }

  const attachment = {
    id: createSupportEntityId("attachment", now),
    name,
    type,
    size: Number.isFinite(size) && size > 0 ? Math.min(size, 50 * 1024 * 1024) : 0,
    note,
    addedBy: actor,
    addedAt: now,
  };
  const event = {
    id: createSupportEntityId("event", now),
    type: "attachment_added",
    actor,
    attachmentId: attachment.id,
    message: note ? `Attachment reference added: ${name}. ${note}` : `Attachment reference added: ${name}.`,
    createdAt: now,
  };
  const updatedTicket = normalizeSupportTicket({
    ...existingTicket,
    attachments: [...(existingTicket.attachments || []), attachment],
    updatedAt: now,
    lastActivityAt: now,
    events: [...(existingTicket.events || []).slice(-49), event],
  });
  const nextSupportTickets = supportTickets.map((ticket, index) => (
    index === ticketIndex ? updatedTicket : normalizeSupportTicket(ticket)
  ));
  const auditLog = [
    createAuditEvent("support_ticket_attachment_added", actor, {
      ticketId: updatedTicket.id,
      attachmentId: attachment.id,
      name: attachment.name,
    }),
    ...workspace.auditLog,
  ].slice(0, 250);

  const nextWorkspace = await writeWorkspace({ ...workspace, supportTickets: nextSupportTickets, auditLog }, options);
  return {
    workspace: nextWorkspace,
    ticket: (nextWorkspace.supportTickets || []).find((item) => item.id === updatedTicket.id) || updatedTicket,
    attachment,
  };
}

function cleanConnectorInput(value, fallback = "", maxLength = 500) {
  const text = String(value || "").trim();
  return (text || fallback).slice(0, maxLength);
}

function createConnectorRequestId(now = new Date().toISOString()) {
  const suffix = (crypto.randomUUID?.() || crypto.randomBytes(8).toString("hex")).replace(/-/g, "").slice(0, 8).toUpperCase();
  return `CONN-REQ-${now.slice(0, 10).replace(/-/g, "")}-${suffix}`;
}

const connectorRequestStatuses = new Set(["requested", "reviewing", "planned", "declined"]);

export async function createConnectorRequest(input = {}, context = {}, options = {}) {
  const workspace = await readWorkspace(options);
  const now = new Date().toISOString();
  const name = cleanConnectorInput(input.name, "", 120);
  const useCase = cleanConnectorInput(input.useCase, "", 1000);

  if (!name || !useCase) {
    throw new Error("Connector name and use case are required.");
  }

  const actor = cleanConnectorInput(context.actor || context.email, "user", 254).toLowerCase();
  const request = normalizeConnectorRequest({
    id: createConnectorRequestId(now),
    name,
    category: cleanConnectorInput(input.category, "Application", 80),
    useCase,
    status: "requested",
    requester: {
      email: actor,
      role: cleanConnectorInput(context.member?.role || context.role, "Member", 80),
      position: cleanConnectorInput(context.member?.position || context.position, "", 120),
      department: cleanConnectorInput(context.member?.department || context.department, "", 120),
    },
    createdAt: now,
    updatedAt: now,
  });

  const connectorRequests = [request, ...(workspace.connectorRequests || [])].slice(0, 100);
  const auditLog = [
    createAuditEvent("connector_requested", actor, {
      requestId: request.id,
      name: request.name,
      category: request.category,
    }),
    ...workspace.auditLog,
  ].slice(0, 250);

  const nextWorkspace = await writeWorkspace({ ...workspace, connectorRequests, auditLog }, options);
  return {
    workspace: nextWorkspace,
    request: (nextWorkspace.connectorRequests || []).find((item) => item.id === request.id) || request,
  };
}

export async function updateConnectorRequestStatus(input = {}, context = {}, options = {}) {
  const workspace = await readWorkspace(options);
  const now = new Date().toISOString();
  const requestId = cleanConnectorInput(input.requestId || input.id, "", 100);
  const status = cleanConnectorInput(input.status, "", 80).toLowerCase();
  const note = cleanConnectorInput(input.note || input.statusNote, "", 500);

  if (!requestId) {
    throw new Error("Connector request id is required.");
  }

  if (!connectorRequestStatuses.has(status)) {
    throw new Error("Connector request status is invalid.");
  }

  const actor = cleanConnectorInput(context.actor || context.email, "user", 254).toLowerCase();
  const connectorRequests = Array.isArray(workspace.connectorRequests) ? workspace.connectorRequests : [];
  const requestIndex = connectorRequests.findIndex((request) => request.id === requestId);

  if (requestIndex === -1) {
    throw new Error("Connector request was not found.");
  }

  const existingRequest = normalizeConnectorRequest(connectorRequests[requestIndex]);
  const event = {
    id: `event-${crypto.randomUUID?.() || now}`,
    type: "status_updated",
    actor,
    status,
    message: note || `Connector request status changed to ${status}.`,
    createdAt: now,
  };
  const updatedRequest = normalizeConnectorRequest({
    ...existingRequest,
    status,
    statusNote: note || existingRequest.statusNote,
    updatedBy: actor,
    updatedAt: now,
    events: [...(existingRequest.events || []).slice(-49), event],
  });
  const nextConnectorRequests = connectorRequests.map((request, index) => (
    index === requestIndex ? updatedRequest : normalizeConnectorRequest(request)
  ));
  const auditLog = [
    createAuditEvent("connector_request_status_updated", actor, {
      requestId: updatedRequest.id,
      name: updatedRequest.name,
      status: updatedRequest.status,
    }),
    ...workspace.auditLog,
  ].slice(0, 250);

  const nextWorkspace = await writeWorkspace({ ...workspace, connectorRequests: nextConnectorRequests, auditLog }, options);
  return {
    workspace: nextWorkspace,
    request: (nextWorkspace.connectorRequests || []).find((item) => item.id === updatedRequest.id) || updatedRequest,
  };
}

export async function saveConnectorFilters(input = {}, context = {}, options = {}) {
  const workspace = await readWorkspace(options);
  const actor = cleanConnectorInput(context.actor || context.email, "user", 254).toLowerCase();
  const preset = normalizeConnectorFilterPreset({
    connectorId: cleanConnectorInput(input.connectorId, "business-live", 120),
    label: cleanConnectorInput(input.label, "Workspace filter preset", 120),
    rules: Array.isArray(input.rules) ? input.rules : [],
    savedBy: actor,
    savedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  if (!preset.rules.length) {
    throw new Error("At least one filter rule is required.");
  }

  const connectorFilters = {
    ...(workspace.connectorFilters || {}),
    [preset.connectorId]: preset,
  };
  const auditLog = [
    createAuditEvent("connector_filters_saved", actor, {
      connectorId: preset.connectorId,
      rules: preset.rules.length,
    }),
    ...workspace.auditLog,
  ].slice(0, 250);

  const nextWorkspace = await writeWorkspace({ ...workspace, connectorFilters, auditLog }, options);
  return {
    workspace: nextWorkspace,
    preset: nextWorkspace.connectorFilters?.[preset.connectorId] || preset,
  };
}

function cleanReportScheduleInput(value, fallback = "", maxLength = 500) {
  const text = String(value || "").trim();
  return (text || fallback).slice(0, maxLength);
}

function createReportScheduleId(now = new Date().toISOString()) {
  const suffix = (crypto.randomUUID?.() || crypto.randomBytes(8).toString("hex")).replace(/-/g, "").slice(0, 8).toUpperCase();
  return `REP-SCHED-${now.slice(0, 10).replace(/-/g, "")}-${suffix}`;
}

const reportScheduleStatuses = new Set(["draft", "active", "paused", "archived"]);

function calculateNextReportRunAt(cadence, fromDate = new Date()) {
  const nextRun = new Date(fromDate.getTime());

  if (cadence === "One-time") {
    nextRun.setDate(nextRun.getDate() + 1);
  } else if (cadence === "Monthly") {
    nextRun.setMonth(nextRun.getMonth() + 1);
  } else if (cadence === "Quarterly") {
    nextRun.setMonth(nextRun.getMonth() + 3);
  } else {
    nextRun.setDate(nextRun.getDate() + 7);
  }

  return nextRun.toISOString();
}

export async function createReportScheduleDraft(input = {}, context = {}, options = {}) {
  const workspace = await readWorkspace(options);
  const now = new Date().toISOString();
  const reportId = cleanReportScheduleInput(input.reportId, "", 120);
  const reportName = cleanReportScheduleInput(input.reportName, "Board report", 160);
  const recipients = Array.isArray(input.recipients)
    ? input.recipients
    : String(input.recipients || "").split(/[,\n;]/);

  if (!reportId) {
    throw new Error("Report id is required.");
  }

  if (!recipients.map((item) => String(item || "").trim()).filter(Boolean).length) {
    throw new Error("At least one recipient is required.");
  }

  const actor = cleanReportScheduleInput(context.actor || context.email, "user", 254).toLowerCase();
  const schedule = normalizeReportSchedule({
    id: createReportScheduleId(now),
    reportId,
    reportName,
    cadence: input.cadence,
    format: input.format,
    recipients,
    note: input.note,
    status: "draft",
    owner: {
      email: actor,
      role: cleanReportScheduleInput(context.member?.role || context.role, "Member", 80),
      position: cleanReportScheduleInput(context.member?.position || context.position, "", 120),
      department: cleanReportScheduleInput(context.member?.department || context.department, "", 120),
    },
    nextRunAt: input.nextRunAt || null,
    createdAt: now,
    updatedAt: now,
  });

  const reportSchedules = [schedule, ...(workspace.reportSchedules || [])].slice(0, 100);
  const auditLog = [
    createAuditEvent("report_schedule_draft_created", actor, {
      scheduleId: schedule.id,
      reportId: schedule.reportId,
      cadence: schedule.cadence,
      recipients: schedule.recipients.length,
    }),
    ...workspace.auditLog,
  ].slice(0, 250);

  const nextWorkspace = await writeWorkspace({ ...workspace, reportSchedules, auditLog }, options);
  return {
    workspace: nextWorkspace,
    schedule: (nextWorkspace.reportSchedules || []).find((item) => item.id === schedule.id) || schedule,
  };
}

export async function updateReportScheduleStatus(input = {}, context = {}, options = {}) {
  const workspace = await readWorkspace(options);
  const now = new Date().toISOString();
  const scheduleId = cleanReportScheduleInput(input.scheduleId || input.id, "", 100);
  const status = cleanReportScheduleInput(input.status, "", 80).toLowerCase();
  const note = cleanReportScheduleInput(input.note || input.statusNote, "", 500);

  if (!scheduleId) {
    throw new Error("Report schedule id is required.");
  }

  if (!reportScheduleStatuses.has(status)) {
    throw new Error("Report schedule status is invalid.");
  }

  const actor = cleanReportScheduleInput(context.actor || context.email, "user", 254).toLowerCase();
  const reportSchedules = Array.isArray(workspace.reportSchedules) ? workspace.reportSchedules : [];
  const scheduleIndex = reportSchedules.findIndex((schedule) => schedule.id === scheduleId);

  if (scheduleIndex === -1) {
    throw new Error("Report schedule was not found.");
  }

  const existingSchedule = normalizeReportSchedule(reportSchedules[scheduleIndex]);
  const event = {
    id: `event-${crypto.randomUUID?.() || now}`,
    type: "status_updated",
    actor,
    status,
    message: note || `Report schedule status changed to ${status}.`,
    createdAt: now,
  };
  const updatedSchedule = normalizeReportSchedule({
    ...existingSchedule,
    status,
    statusNote: note || existingSchedule.statusNote,
    updatedBy: actor,
    updatedAt: now,
    nextRunAt: status === "active" ? calculateNextReportRunAt(existingSchedule.cadence, new Date(now)) : null,
    events: [...(existingSchedule.events || []).slice(-49), event],
  });
  const nextReportSchedules = reportSchedules.map((schedule, index) => (
    index === scheduleIndex ? updatedSchedule : normalizeReportSchedule(schedule)
  ));
  const auditLog = [
    createAuditEvent("report_schedule_status_updated", actor, {
      scheduleId: updatedSchedule.id,
      reportId: updatedSchedule.reportId,
      status: updatedSchedule.status,
      nextRunAt: updatedSchedule.nextRunAt,
    }),
    ...workspace.auditLog,
  ].slice(0, 250);

  const nextWorkspace = await writeWorkspace({ ...workspace, reportSchedules: nextReportSchedules, auditLog }, options);
  return {
    workspace: nextWorkspace,
    schedule: (nextWorkspace.reportSchedules || []).find((item) => item.id === updatedSchedule.id) || updatedSchedule,
  };
}

function cleanExcelWorkspaceInput(value, fallback = "", maxLength = 500) {
  const text = String(value || "").trim();
  return (text || fallback).slice(0, maxLength);
}

function createExcelWorkspaceViewId(now = new Date().toISOString()) {
  const suffix = (crypto.randomUUID?.() || crypto.randomBytes(8).toString("hex")).replace(/-/g, "").slice(0, 8).toUpperCase();
  return `EXCEL-VIEW-${now.slice(0, 10).replace(/-/g, "")}-${suffix}`;
}

export async function saveExcelWorkspaceView(input = {}, context = {}, options = {}) {
  const workspace = await readWorkspace(options);
  const now = new Date().toISOString();
  const actor = cleanExcelWorkspaceInput(context.actor || context.email, "user", 254).toLowerCase();
  const requestedId = cleanExcelWorkspaceInput(input.id || input.viewId, "", 100);
  const existingViews = Array.isArray(workspace.excelWorkspaceViews) ? workspace.excelWorkspaceViews : [];
  const existingView = requestedId ? existingViews.find((view) => view.id === requestedId) : null;
  const view = normalizeExcelWorkspaceView({
    ...input,
    id: existingView?.id || createExcelWorkspaceViewId(now),
    status: input.status || existingView?.status || "saved",
    savedBy: {
      role: cleanExcelWorkspaceInput(context.member?.role || context.role, "Member", 80),
      position: cleanExcelWorkspaceInput(context.member?.position || context.position, "", 120),
      department: cleanExcelWorkspaceInput(context.member?.department || context.department, "", 120),
    },
    updatedBy: cleanExcelWorkspaceInput(context.member?.role || context.role, "Member", 120),
    createdAt: existingView?.createdAt || now,
    updatedAt: now,
  });

  if (!view.tabs.length) {
    throw new Error("At least one workbook tab is required.");
  }

  const excelWorkspaceViews = existingView
    ? [view, ...existingViews.filter((item) => item.id !== view.id).map(normalizeExcelWorkspaceView)]
    : [view, ...existingViews.map(normalizeExcelWorkspaceView)];
  const auditLog = [
    createAuditEvent("excel_workspace_view_saved", actor, {
      viewId: view.id,
      workbookName: view.workbookName,
      filteredRows: view.metrics.filteredRows,
      selectedRows: view.metrics.selectedRows,
    }),
    ...workspace.auditLog,
  ].slice(0, 250);
  const nextWorkspace = await writeWorkspace(
    { ...workspace, excelWorkspaceViews: excelWorkspaceViews.slice(0, 25), auditLog },
    options,
  );

  return {
    workspace: nextWorkspace,
    view: (nextWorkspace.excelWorkspaceViews || []).find((item) => item.id === view.id) || view,
  };
}

function cleanWorkbenchArtifactInput(value, fallback = "", maxLength = 12000) {
  const text = String(value || "").trim();
  return (text || fallback).slice(0, maxLength);
}

function createWorkbenchArtifactId(type = "executive_summary", now = new Date().toISOString()) {
  const suffix = (crypto.randomUUID?.() || crypto.randomBytes(8).toString("hex")).replace(/-/g, "").slice(0, 8).toUpperCase();
  const cleanType = cleanWorkbenchArtifactInput(type, "executive_summary", 80).toUpperCase().replace(/[^A-Z0-9]+/g, "-");
  return `WB-${cleanType}-${now.slice(0, 10).replace(/-/g, "")}-${suffix}`;
}

function workbenchActorLabel(context = {}) {
  return cleanWorkbenchArtifactInput(
    context.member?.position || context.position || context.member?.role || context.role,
    "workspace-user",
    120,
  );
}

function workbenchArtifactAuditType(type, status) {
  if (type === "executive_summary") return "workbench_summary_saved";
  if (type === "negotiation_plan" && status === "draft") return "workbench_negotiation_plan_drafted";
  if (type === "negotiation_plan") return "workbench_negotiation_plan_saved";
  if (type === "approval_workflow") return "workbench_approval_workflow_started";
  if (type === "alternative_analysis") return "workbench_alternative_selected";
  return "workbench_artifact_saved";
}

export async function saveWorkbenchArtifact(input = {}, context = {}, options = {}) {
  const workspace = await readWorkspace(options);
  const now = new Date().toISOString();
  const actor = workbenchActorLabel(context);
  const requestedId = cleanWorkbenchArtifactInput(input.id || input.artifactId, "", 120);
  const existingArtifacts = Array.isArray(workspace.workspaceArtifacts) ? workspace.workspaceArtifacts : [];
  const existingArtifact = requestedId ? existingArtifacts.find((artifact) => artifact.id === requestedId) : null;
  const title = cleanWorkbenchArtifactInput(input.title, "", 180);
  const content = cleanWorkbenchArtifactInput(input.content || input.body || input.summary, "", 12000);
  const recommendations = Array.isArray(input.recommendations) ? input.recommendations : [];

  if (!title) {
    throw new Error("Workbench artifact title is required.");
  }

  if (!content && !recommendations.length) {
    throw new Error("Workbench artifact content or recommendations are required.");
  }

  const artifact = normalizeWorkspaceArtifact({
    ...input,
    id: existingArtifact?.id || createWorkbenchArtifactId(input.type, now),
    title,
    content,
    recommendations,
    status: input.status || existingArtifact?.status || "saved",
    owner: {
      role: cleanWorkbenchArtifactInput(context.member?.role || context.role || input.owner?.role, "Member", 80),
      position: cleanWorkbenchArtifactInput(context.member?.position || context.position || input.owner?.position, "", 120),
      department: cleanWorkbenchArtifactInput(context.member?.department || context.department || input.owner?.department, "", 120),
    },
    createdBy: existingArtifact?.createdBy || actor,
    updatedBy: actor,
    createdAt: existingArtifact?.createdAt || now,
    updatedAt: now,
  });
  const workspaceArtifacts = existingArtifact
    ? [artifact, ...existingArtifacts.filter((item) => item.id !== artifact.id).map(normalizeWorkspaceArtifact)]
    : [artifact, ...existingArtifacts.map(normalizeWorkspaceArtifact)];
  const auditLog = [
    createAuditEvent(workbenchArtifactAuditType(artifact.type, artifact.status), actor, {
      artifactId: artifact.id,
      artifactType: artifact.type,
      artifactStatus: artifact.status,
      expectedSavings: artifact.metrics.expectedSavings,
    }),
    ...workspace.auditLog,
  ].slice(0, 250);

  const nextWorkspace = await writeWorkspace(
    { ...workspace, workspaceArtifacts: workspaceArtifacts.slice(0, 50), auditLog },
    options,
  );

  return {
    workspace: nextWorkspace,
    artifact: (nextWorkspace.workspaceArtifacts || []).find((item) => item.id === artifact.id) || artifact,
  };
}

function cleanChatInput(value, fallback = "", maxLength = 12000) {
  const text = String(value || "").trim();
  return (text || fallback).slice(0, maxLength);
}

function createChatEntityId(prefix, now = new Date().toISOString()) {
  const suffix = (crypto.randomUUID?.() || crypto.randomBytes(8).toString("hex")).replace(/-/g, "").slice(0, 10);
  return `${prefix}-${now.slice(0, 10).replace(/-/g, "")}-${suffix}`;
}

function chatTitleFromText(value) {
  const text = cleanChatInput(value, "New workspace chat", 120).replace(/\s+/g, " ");
  if (text.length <= 72) return text;
  return `${text.slice(0, 69).trim()}...`;
}

function chatActor(context = {}) {
  return cleanChatInput(context.actor || context.email, "user", 254).toLowerCase();
}

export async function createChatConversation(input = {}, context = {}, options = {}) {
  const workspace = await readWorkspace(options);
  const now = new Date().toISOString();
  const actor = chatActor(context);
  const title = chatTitleFromText(input.title || input.prompt);
  const initialMessages = Array.isArray(input.messages)
    ? input.messages
        .filter((message) => message?.role === "user" || message?.role === "assistant" || message?.role === "system")
        .map((message, index) => ({
          ...message,
          id: cleanChatInput(message.id, createChatEntityId(`chat-${message.role || "message"}`, now), 120),
          content: cleanChatInput(message.content || message.text, "", 12000),
          createdAt: message.createdAt || now,
          metadata: message.metadata && typeof message.metadata === "object" ? message.metadata : {},
          branch: input.branchedFrom
            ? {
                sourceConversationId: cleanChatInput(input.branchedFrom, "", 120),
                sourceMessageId: cleanChatInput(input.branchMessageId, "", 120),
                copiedIndex: index,
              }
            : undefined,
        }))
        .filter((message) => message.content)
    : [];
  const conversation = normalizeChatConversation({
    id: createChatEntityId("chat", now),
    title,
    mode: cleanChatInput(input.mode, "Ask", 60),
    status: "active",
    pinned: Boolean(input.pinned),
    createdBy: actor,
    createdAt: now,
    updatedAt: now,
    tags: Array.isArray(input.tags) ? input.tags : [],
    messages: initialMessages,
  });
  const chatConversations = [conversation, ...(workspace.chatConversations || [])].slice(0, 80);
  const auditLog = [
    createAuditEvent("chat_conversation_created", actor, {
      conversationId: conversation.id,
      mode: conversation.mode,
    }),
    ...workspace.auditLog,
  ].slice(0, 250);

  const nextWorkspace = await writeWorkspace({ ...workspace, chatConversations, auditLog }, options);
  return {
    workspace: nextWorkspace,
    conversation: (nextWorkspace.chatConversations || []).find((item) => item.id === conversation.id) || conversation,
  };
}

export async function appendChatConversationTurn(input = {}, context = {}, options = {}) {
  const workspace = await readWorkspace(options);
  const now = new Date().toISOString();
  const actor = chatActor(context);
  const userText = cleanChatInput(input.userText || input.prompt, "", 12000);
  const assistantText = cleanChatInput(input.assistantText || input.response, "", 16000);
  const mode = cleanChatInput(input.mode, "Ask", 60);
  const provider = cleanChatInput(input.provider, "local-fallback", 80);
  const model = cleanChatInput(input.model, "", 120);

  if (!userText) {
    throw new Error("Chat message text is required.");
  }

  if (!assistantText) {
    throw new Error("Assistant response text is required.");
  }

  const chatConversations = Array.isArray(workspace.chatConversations) ? workspace.chatConversations : [];
  const requestedId = cleanChatInput(input.conversationId || input.id, "", 120);
  const existingIndex = requestedId ? chatConversations.findIndex((conversation) => conversation.id === requestedId) : -1;
  const existingConversation = existingIndex >= 0
    ? normalizeChatConversation(chatConversations[existingIndex])
    : normalizeChatConversation({
        id: requestedId || createChatEntityId("chat", now),
        title: chatTitleFromText(input.title || userText),
        mode,
        status: "active",
        createdBy: actor,
        createdAt: now,
        updatedAt: now,
        messages: [],
      });
  const userMessage = {
    id: createChatEntityId("chat-user", now),
    role: "user",
    content: userText,
    provider: "user",
    mode,
    createdAt: now,
    metadata: {},
  };
  const assistantMessage = {
    id: createChatEntityId("chat-assistant", now),
    role: "assistant",
    content: assistantText,
    provider,
    model,
    mode,
    createdAt: now,
    metadata: {
      responseLength: assistantText.length,
      providerError: cleanChatInput(input.providerError, "", 500),
    },
  };
  const updatedConversation = normalizeChatConversation({
    ...existingConversation,
    title: existingConversation.title || chatTitleFromText(userText),
    mode: existingConversation.mode || mode,
    status: "active",
    updatedAt: now,
    messages: [...(existingConversation.messages || []), userMessage, assistantMessage].slice(-100),
  });
  const nextChatConversations = existingIndex >= 0
    ? chatConversations.map((conversation, index) => (
        index === existingIndex ? updatedConversation : normalizeChatConversation(conversation)
      ))
    : [updatedConversation, ...chatConversations.map(normalizeChatConversation)];
  const auditLog = [
    createAuditEvent("chat_turn_added", actor, {
      conversationId: updatedConversation.id,
      provider,
      mode,
      responseLength: assistantText.length,
    }),
    ...workspace.auditLog,
  ].slice(0, 250);

  const nextWorkspace = await writeWorkspace({
    ...workspace,
    chatConversations: nextChatConversations.slice(0, 80),
    auditLog,
  }, options);
  return {
    workspace: nextWorkspace,
    conversation: (nextWorkspace.chatConversations || []).find((item) => item.id === updatedConversation.id) || updatedConversation,
    messages: updatedConversation.messages,
  };
}

export async function updateChatConversation(input = {}, context = {}, options = {}) {
  const workspace = await readWorkspace(options);
  const now = new Date().toISOString();
  const actor = chatActor(context);
  const conversationId = cleanChatInput(input.conversationId || input.id, "", 120);
  const status = input.status ? cleanChatInput(input.status, "", 40).toLowerCase() : "";

  if (!conversationId) {
    throw new Error("Chat conversation id is required.");
  }

  if (status && !["active", "archived"].includes(status)) {
    throw new Error("Chat conversation status is invalid.");
  }

  const chatConversations = Array.isArray(workspace.chatConversations) ? workspace.chatConversations : [];
  const conversationIndex = chatConversations.findIndex((conversation) => conversation.id === conversationId);

  if (conversationIndex === -1) {
    throw new Error("Chat conversation was not found.");
  }

  const existingConversation = normalizeChatConversation(chatConversations[conversationIndex]);
  const updatedConversation = normalizeChatConversation({
    ...existingConversation,
    title: input.title !== undefined ? chatTitleFromText(input.title) : existingConversation.title,
    mode: input.mode !== undefined ? cleanChatInput(input.mode, existingConversation.mode, 60) : existingConversation.mode,
    pinned: input.pinned !== undefined ? Boolean(input.pinned) : existingConversation.pinned,
    status: status || existingConversation.status,
    tags: Array.isArray(input.tags) ? input.tags : existingConversation.tags,
    archivedAt: status === "archived" ? now : status === "active" ? null : existingConversation.archivedAt,
    updatedAt: now,
  });
  const nextChatConversations = chatConversations.map((conversation, index) => (
    index === conversationIndex ? updatedConversation : normalizeChatConversation(conversation)
  ));
  const auditLog = [
    createAuditEvent("chat_conversation_updated", actor, {
      conversationId: updatedConversation.id,
      status: updatedConversation.status,
      pinned: updatedConversation.pinned,
      tags: updatedConversation.tags || [],
    }),
    ...workspace.auditLog,
  ].slice(0, 250);

  const nextWorkspace = await writeWorkspace({ ...workspace, chatConversations: nextChatConversations, auditLog }, options);
  return {
    workspace: nextWorkspace,
    conversation: (nextWorkspace.chatConversations || []).find((item) => item.id === updatedConversation.id) || updatedConversation,
  };
}

export async function deleteChatConversation(input = {}, context = {}, options = {}) {
  const workspace = await readWorkspace(options);
  const actor = chatActor(context);
  const conversationId = cleanChatInput(input.conversationId || input.id, "", 120);

  if (!conversationId) {
    throw new Error("Chat conversation id is required.");
  }

  const chatConversations = Array.isArray(workspace.chatConversations) ? workspace.chatConversations : [];
  const existingConversation = chatConversations.find((conversation) => conversation.id === conversationId);

  if (!existingConversation) {
    throw new Error("Chat conversation was not found.");
  }

  const auditLog = [
    createAuditEvent("chat_conversation_deleted", actor, { conversationId }),
    ...workspace.auditLog,
  ].slice(0, 250);
  const nextWorkspace = await writeWorkspace({
    ...workspace,
    chatConversations: chatConversations.filter((conversation) => conversation.id !== conversationId).map(normalizeChatConversation),
    auditLog,
  }, options);

  return { workspace: nextWorkspace, conversationId };
}
