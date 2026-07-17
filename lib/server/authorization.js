const roles = ["Owner", "Admin", "Manager", "Member", "Viewer"];
export const workspaceRoles = Object.freeze([...roles]);

export const capabilities = Object.freeze({
  READ_WORKSPACE: "read_workspace",
  ASK_AI: "ask_ai",
  UPLOAD_EVIDENCE: "upload_evidence",
  REVIEW_EVIDENCE: "review_evidence",
  DELETE_EVIDENCE: "delete_evidence",
  RUN_AGENTS: "run_agents",
  DECIDE_APPROVALS: "decide_approvals",
  SUBMIT_TEAM_REPORT: "submit_team_report",
  DECIDE_GATEWAY_REPORT: "decide_gateway_report",
  SEND_B2B_MESSAGE: "send_b2b_message",
  APPROVE_B2B_WORKFLOW: "approve_b2b_workflow",
  INGEST_LIVE_EVENTS: "ingest_live_events",
  MANAGE_LIVE_EVENTS: "manage_live_events",
  UPDATE_NOTIFICATIONS: "update_notifications",
  EXPORT_DATA: "export_data",
  MANAGE_CONNECTORS: "manage_connectors",
  MANAGE_WORKSPACE: "manage_workspace",
  RESET_WORKSPACE: "reset_workspace",
  MANAGE_MEMBERS: "manage_members",
});

const allCapabilities = Object.values(capabilities);

const roleCapabilityMap = {
  Owner: allCapabilities,
  Admin: allCapabilities.filter((capability) => capability !== capabilities.RESET_WORKSPACE),
  Manager: [
    capabilities.READ_WORKSPACE,
    capabilities.ASK_AI,
    capabilities.UPLOAD_EVIDENCE,
    capabilities.REVIEW_EVIDENCE,
    capabilities.DELETE_EVIDENCE,
    capabilities.RUN_AGENTS,
    capabilities.DECIDE_APPROVALS,
    capabilities.SUBMIT_TEAM_REPORT,
    capabilities.DECIDE_GATEWAY_REPORT,
    capabilities.SEND_B2B_MESSAGE,
    capabilities.APPROVE_B2B_WORKFLOW,
    capabilities.INGEST_LIVE_EVENTS,
    capabilities.MANAGE_LIVE_EVENTS,
    capabilities.UPDATE_NOTIFICATIONS,
    capabilities.EXPORT_DATA,
  ],
  Member: [
    capabilities.READ_WORKSPACE,
    capabilities.ASK_AI,
    capabilities.UPLOAD_EVIDENCE,
    capabilities.REVIEW_EVIDENCE,
    capabilities.RUN_AGENTS,
    capabilities.SUBMIT_TEAM_REPORT,
    capabilities.SEND_B2B_MESSAGE,
    capabilities.INGEST_LIVE_EVENTS,
    capabilities.UPDATE_NOTIFICATIONS,
  ],
  Viewer: [
    capabilities.READ_WORKSPACE,
    capabilities.ASK_AI,
    capabilities.UPDATE_NOTIFICATIONS,
  ],
};

function cleanText(value, fallback, maxLength = 120) {
  const text = String(value || "").trim();
  return (text || fallback).slice(0, maxLength);
}

export function normalizeRole(value, fallback = "Member") {
  const role = roles.find((item) => item.toLowerCase() === String(value || "").trim().toLowerCase());
  return role || fallback;
}

export function normalizePosition(value, fallback = "CEO") {
  return cleanText(value, fallback);
}

export function normalizeDepartment(value, fallback = "Operations") {
  return cleanText(value, fallback);
}

export function capabilitiesForRole(role) {
  return [...(roleCapabilityMap[normalizeRole(role)] || roleCapabilityMap.Member)];
}

export function memberHasCapability(member, capability) {
  if (!capability) return true;
  if (member?.status && member.status !== "active") return false;
  const required = Array.isArray(capability) ? capability : [capability];
  const available = new Set(capabilitiesForRole(member?.role));
  return required.every((item) => available.has(item));
}

export function buildWorkspaceMember(input = {}) {
  const role = normalizeRole(input.role, "Member");
  const now = new Date().toISOString();
  const status = ["active", "invited", "disabled"].includes(input.status) ? input.status : "active";

  return {
    userId: cleanText(input.userId || input.email, "unknown-user", 160),
    email: cleanText(input.email, "", 254).toLowerCase(),
    workspaceId: cleanText(input.workspaceId, "default", 120),
    role,
    position: normalizePosition(input.position),
    department: normalizeDepartment(input.department),
    status,
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now,
    invitedBy: input.invitedBy ? cleanText(input.invitedBy, "", 254).toLowerCase() : null,
    invitedAt: input.invitedAt || null,
    inviteTokenHash: input.inviteTokenHash || null,
    inviteExpiresAt: input.inviteExpiresAt || null,
    acceptedAt: input.acceptedAt || null,
    lastSeenAt: input.lastSeenAt || null,
  };
}

export function maskEmail(value) {
  const [localPart, domain] = String(value || "").split("@");
  if (!localPart || !domain) return "";
  const visible = localPart.slice(0, 2);
  return `${visible}${localPart.length > 2 ? "***" : "*"}@${domain}`;
}

export function publicMember(member, options = {}) {
  if (!member) return null;
  const normalized = buildWorkspaceMember(member);
  const exposeEmail = options.exposeEmail === true;
  const email = exposeEmail ? normalized.email : "";

  return {
    id: normalized.userId,
    email,
    emailMasked: normalized.email ? maskEmail(normalized.email) : "",
    role: normalized.role,
    position: normalized.position,
    department: normalized.department,
    status: normalized.status,
    capabilities: normalized.status === "active" ? capabilitiesForRole(normalized.role) : [],
    createdAt: normalized.createdAt,
    updatedAt: normalized.updatedAt,
    invitedBy: normalized.invitedBy,
    invitedAt: normalized.invitedAt,
    inviteExpiresAt: normalized.inviteExpiresAt,
    acceptedAt: normalized.acceptedAt,
    lastSeenAt: normalized.lastSeenAt,
  };
}

export function authorizationDeniedResponse(capability, member) {
  return Response.json(
    {
      error: "You do not have permission to perform this action.",
      code: "FORBIDDEN",
      capability,
      role: normalizeRole(member?.role),
    },
    {
      status: 403,
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}
