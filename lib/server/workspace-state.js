import { syncDerivedWorkspaceData } from "./workspace-engine";
import { buildWorkspaceMember, maskEmail, publicMember } from "./authorization";

const defaultB2bMessages = [
  {
    id: "b2b-seed-1",
    sender: "You",
    role: "Alex Rivera",
    time: "May 20, 9:15 AM",
    text: "Hi Sarah, while reviewing Invoice INV-2025-0519, we noticed a discrepancy in the delivered quantity for White Button Mushrooms.\nInvoice lists 550kg, but our receiving report shows 500kg.",
    isSelf: true,
    status: "Delivered",
    statusColor: "text-primary",
  },
  {
    id: "b2b-seed-2",
    sender: "Farm Fresh Co.",
    role: "Sarah Miller",
    time: "May 20, 9:18 AM",
    text: "Hi Alex, thanks for flagging this. You are correct - there was a packing variance at dispatch. We can issue a credit note for the 50kg difference.",
    isSelf: false,
  },
  {
    id: "b2b-seed-3",
    sender: "You",
    role: "Alex Rivera",
    time: "May 20, 9:20 AM",
    text: "Great, please proceed with the credit note.\nAlso, can we confirm payment terms as Net 30 from invoice date?",
    isSelf: true,
    status: "Read 9:21 AM",
    statusColor: "text-[#3b82f6]",
  },
  {
    id: "b2b-seed-4",
    sender: "Farm Fresh Co.",
    role: "Sarah Miller",
    time: "May 20, 9:22 AM",
    text: "Confirmed - Net 30 from invoice date. Credit note will reference INV-2025-0519.\nExpect it within 24 hours.",
    isSelf: false,
  },
  {
    id: "b2b-seed-ai-1",
    sender: "Smart Assist",
    role: "AI Summary",
    time: "9:23 AM",
    text: "Invoice discrepancy acknowledged (50kg overcharge). Credit note to be issued.\nPayment terms confirmed: Net 30 from invoice date.",
    isSystem: true,
  },
  {
    id: "b2b-seed-5",
    sender: "You",
    role: "Alex Rivera",
    time: "May 20, 9:24 AM",
    text: "Perfect, thanks Sarah. Please share once the credit note is issued.",
    isSelf: true,
    status: "Read 9:24 AM",
    statusColor: "text-[#3b82f6]",
  },
];

const defaultCrmTasks = [
  { id: "t1", title: "Review Vendor Contracts", team: "Procurement Team", priority: "Medium", initials: "SM", user: "Sarah Miller", date: "May 21", status: "todo", color: "warning" },
  { id: "t2", title: "Warehouse Stock Audit", team: "Ops Team", priority: "High", initials: "JB", user: "James Brown", date: "May 21", status: "todo", color: "critical" },
  { id: "t3", title: "Update Delivery Routes", team: "Logistics Team", priority: "Medium", initials: "DP", user: "David Patel", date: "May 22", status: "todo", color: "warning" },
  { id: "t4", title: "Equipment Maintenance Check", team: "Facilities Team", priority: "Low", initials: "KR", user: "Ken Roberts", date: "May 22", status: "todo", color: "primary" },
  { id: "t5", title: "Monthly Cost Reconciliation", team: "Finance Team", priority: "Medium", initials: "LN", user: "Lena Nguyen", date: "May 23", status: "todo", color: "warning" },
  { id: "t_active", title: "Log Daily Deliveries", team: "Logistics Team", priority: "High", initials: "DP", user: "David Patel", date: "May 20", status: "in-progress", color: "primary", isActive: true },
  { id: "t6", title: "Quality Assurance Sampling", team: "Ops Team", priority: "High", initials: "SM", user: "Sarah Miller", date: "May 20", status: "in-progress", color: "critical" },
  { id: "t7", title: "Onboard New Drivers", team: "HR Team", priority: "Low", initials: "KR", user: "Ken Roberts", date: "May 20", status: "in-progress", color: "primary" },
  { id: "t8", title: "Daily Cash Summary", team: "Finance Team", priority: "High", initials: "LN", user: "Lena Nguyen", date: "May 20 - 9:15 AM", status: "done", color: "primary" },
  { id: "t9", title: "Stock Reconciliation Report", team: "Warehouse Team", priority: "High", initials: "JB", user: "James Brown", date: "May 20 - 8:45 AM", status: "done", color: "primary" },
  { id: "t10", title: "Procurement Request: Packaging", team: "Procurement Team", priority: "Medium", initials: "SM", user: "Sarah Miller", date: "May 20 - 8:30 AM", status: "done", color: "primary" },
  { id: "t11", title: "Line Efficiency Update", team: "Ops Team", priority: "Medium", initials: "DP", user: "David Patel", date: "May 20 - 7:50 AM", status: "done", color: "primary" },
  { id: "t12", title: "HR Attendance Summary", team: "HR Team", priority: "Low", initials: "KR", user: "Ken Roberts", date: "May 20 - 7:30 AM", status: "done", color: "primary" }
];

const publicStorageMetadataKeys = new Set([
  "storage",
  "storage_file",
  "storagefile",
  "storage_path",
  "storagepath",
  "file_path",
  "filepath",
  "bucket",
  "objectpath",
  "object_path",
]);

const publicIdentityValueKeys = new Set([
  "actor",
  "updatedby",
  "savedby",
  "addedby",
  "requestedby",
  "invitedby",
  "revokedby",
  "exportedby",
  "recipients",
]);

function compactPublicKey(key = "") {
  return String(key || "").toLowerCase().replace(/[^a-z0-9_]/g, "");
}

function isSensitivePublicWorkspaceKey(key = "") {
  const normalized = compactPublicKey(key);
  return publicStorageMetadataKeys.has(normalized)
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
    || normalized.includes("api_key");
}

function isEmailPublicWorkspaceKey(key = "") {
  const normalized = String(key || "").toLowerCase();
  const compact = compactPublicKey(key);
  return normalized === "email"
    || normalized.endsWith("_email")
    || normalized.endsWith("-email")
    || compact.endsWith("email");
}

function looksLikeEmail(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function redactPublicWorkspaceValue(value, key = "") {
  if (isSensitivePublicWorkspaceKey(key)) return undefined;
  if (isEmailPublicWorkspaceKey(key) && typeof value === "string") return "";

  if (Array.isArray(value)) {
    return value
      .map((item) => redactPublicWorkspaceValue(item, key))
      .filter((item) => item !== undefined);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .map(([entryKey, entryValue]) => [entryKey, redactPublicWorkspaceValue(entryValue, entryKey)])
        .filter(([, entryValue]) => entryValue !== undefined),
    );
  }

  if (typeof value === "string" && looksLikeEmail(value) && publicIdentityValueKeys.has(compactPublicKey(key))) {
    return maskEmail(value);
  }

  return value;
}

function cleanPreferenceText(value, fallback = "", maxLength = 500) {
  const text = String(value || "").trim();
  return (text || fallback).slice(0, maxLength);
}

function cleanPreferenceNumber(value, fallback = 0, min = 0, max = 1000000) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(min, Math.min(max, Math.round(numeric)));
}

function cleanPreferenceBoolean(value, fallback = false) {
  if (value === undefined || value === null) return fallback;
  return Boolean(value);
}

function normalizeNotificationCategories(input = {}) {
  const source = input && typeof input === "object" ? input : {};
  return {
    urgentApprovals: cleanPreferenceBoolean(source.urgentApprovals, true),
    agentFailures: cleanPreferenceBoolean(source.agentFailures, true),
    guardrailBlocks: cleanPreferenceBoolean(source.guardrailBlocks, true),
    securityEvents: cleanPreferenceBoolean(source.securityEvents, true),
    dailyDigest: cleanPreferenceBoolean(source.dailyDigest, true),
    immediateOverrides: cleanPreferenceBoolean(source.immediateOverrides, true),
  };
}

function normalizePolicyPreferences(input = {}) {
  const source = input && typeof input === "object" ? input : {};
  return {
    rlsEnabled: cleanPreferenceBoolean(source.rlsEnabled, true),
    auditLogging: cleanPreferenceBoolean(source.auditLogging, true),
    restrictExport: cleanPreferenceBoolean(source.restrictExport, true),
    dataMasking: cleanPreferenceBoolean(source.dataMasking, true),
    autoPurge: cleanPreferenceBoolean(source.autoPurge, true),
    softDelete: cleanPreferenceBoolean(source.softDelete, true),
    retentionDays: cleanPreferenceNumber(source.retentionDays, 180, 1, 3650),
    graceDays: cleanPreferenceNumber(source.graceDays, 30, 0, 365),
  };
}

export function defaultWorkspacePreferences() {
  return {
    profile: {
      displayName: "Alex Rivera",
      role: "Head of Operations",
      timezone: "America/New_York (EST)",
      dateFormat: "Jun 26, 2024, 11:45 AM",
      currency: "USD - US Dollar",
    },
    ai: {
      tone: "Concise",
      confidenceThreshold: 75,
      autoApprovalLimit: "$25K",
    },
    notifications: {
      channels: {
        email: true,
        inapp: true,
        sms: false,
        slack: false,
      },
      categories: normalizeNotificationCategories(),
      quietHours: {
        start: "22:00",
        end: "07:00",
      },
    },
    policies: normalizePolicyPreferences(),
    workbench: {
      defaultTags: ["Software"],
    },
  };
}

function normalizePreferenceTags(input) {
  const values = Array.isArray(input) ? input : [];
  return Array.from(new Set(values
    .map((item) => cleanPreferenceText(item, "", 40))
    .filter(Boolean)))
    .slice(0, 8);
}

export function normalizeWorkspacePreferences(input = {}) {
  const defaults = defaultWorkspacePreferences();
  const source = input && typeof input === "object" ? input : {};
  const notifications = source.notifications && typeof source.notifications === "object" ? source.notifications : {};
  const notificationChannels = notifications.channels && typeof notifications.channels === "object" ? notifications.channels : {};
  const quietHours = notifications.quietHours && typeof notifications.quietHours === "object" ? notifications.quietHours : {};

  return {
    profile: {
      displayName: cleanPreferenceText(source.profile?.displayName, defaults.profile.displayName, 120),
      role: cleanPreferenceText(source.profile?.role, defaults.profile.role, 120),
      timezone: cleanPreferenceText(source.profile?.timezone, defaults.profile.timezone, 120),
      dateFormat: cleanPreferenceText(source.profile?.dateFormat, defaults.profile.dateFormat, 80),
      currency: cleanPreferenceText(source.profile?.currency, defaults.profile.currency, 80),
    },
    ai: {
      tone: cleanPreferenceText(source.ai?.tone, defaults.ai.tone, 80),
      confidenceThreshold: cleanPreferenceNumber(source.ai?.confidenceThreshold, defaults.ai.confidenceThreshold, 0, 100),
      autoApprovalLimit: cleanPreferenceText(source.ai?.autoApprovalLimit, defaults.ai.autoApprovalLimit, 40),
    },
    notifications: {
      channels: {
        email: cleanPreferenceBoolean(notificationChannels.email, defaults.notifications.channels.email),
        inapp: cleanPreferenceBoolean(notificationChannels.inapp, defaults.notifications.channels.inapp),
        sms: cleanPreferenceBoolean(notificationChannels.sms, defaults.notifications.channels.sms),
        slack: cleanPreferenceBoolean(notificationChannels.slack, defaults.notifications.channels.slack),
      },
      categories: normalizeNotificationCategories(notifications.categories),
      quietHours: {
        start: cleanPreferenceText(quietHours.start, defaults.notifications.quietHours.start, 20),
        end: cleanPreferenceText(quietHours.end, defaults.notifications.quietHours.end, 20),
      },
    },
    policies: normalizePolicyPreferences(source.policies),
    workbench: {
      defaultTags: normalizePreferenceTags(source.workbench?.defaultTags).length
        ? normalizePreferenceTags(source.workbench?.defaultTags)
        : defaults.workbench.defaultTags,
    },
  };
}

const defaultGatewayReports = [
  {
    id: "OPS-2025-05-20-001",
    sender: "Operations Manager",
    role: "Main Warehouse",
    time: "2m ago",
    date: "May 20, 2025 - 09:30 AM",
    title: "Daily Supply Intake: 50kg mushrooms",
    status: "Pending AI Review",
    urgent: true,
    color: "primary",
    decision: {
      summary: "Based on intake volume, demand forecast, and current stock levels, AI recommends replenishing inventory to optimize availability and prevent stockouts.",
      action: "Order 100kg more",
      reasoning: "Demand is trending up 22% compared to last week. Current stock may fall below optimal range in 3-5 days. Ordering 100kg will maintain ideal inventory and ensure uninterrupted operations.",
      confidence: 96,
      metrics: { trend: "↑ 22%", intake: "50 kg", optimal: "120 - 150 kg", risk: "High" },
      impact: { revenue: "$4,800", coverage: "4-6 days", cost: "$1,620" }
    }
  },
  {
    id: "OPS-2025-05-20-002",
    sender: "Procurement Manager",
    role: "Head Office",
    time: "15m ago",
    date: "May 20, 2025 - 09:15 AM",
    title: "Procurement Request: Packaging Materials",
    status: "Pending AI Review",
    urgent: true,
    color: "warning",
    decision: {
      summary: "Packaging materials are running low due to an unexpected spike in outbound shipments. Procurement request is within budget.",
      action: "Approve $2,500 PO",
      reasoning: "Supplier offers a 5% discount on bulk orders above $2,000. Approving this PO prevents a packaging bottleneck later this week.",
      confidence: 92,
      metrics: { trend: "↑ 15%", intake: "0", optimal: "5,000 units", risk: "Medium" },
      impact: { revenue: "$12,000", coverage: "14 days", cost: "$2,500" }
    }
  },
  {
    id: "OPS-2025-05-20-003",
    sender: "Warehouse Manager",
    role: "Main Warehouse",
    time: "1h ago",
    date: "May 20, 2025 - 08:30 AM",
    title: "Warehouse Report: Stock Reconciliation",
    status: "Ready",
    urgent: false,
    color: "evidence",
    decision: {
      summary: "Routine stock reconciliation completed. No major discrepancies found. Shrinkage is within acceptable limits (0.4%).",
      action: "Acknowledge Report",
      reasoning: "All inventory counts match system records within the 1% tolerance threshold. No immediate action required.",
      confidence: 99,
      metrics: { trend: "Stable", intake: "N/A", optimal: "N/A", risk: "Low" },
      impact: { revenue: "N/A", coverage: "N/A", cost: "$0" }
    }
  },
  {
    id: "OPS-2025-05-20-004",
    sender: "Finance Manager",
    role: "Head Office",
    time: "2h ago",
    date: "May 20, 2025 - 07:30 AM",
    title: "Finance Report: Daily Cash Summary",
    status: "Ready",
    urgent: false,
    color: "evidence",
    decision: {
      summary: "Daily cash flow summary generated. Operating cash flow remains positive with a healthy runway.",
      action: "Archive to GL",
      reasoning: "Cash inflows exceeded outflows by $14,000 yesterday. Meets financial health criteria for automatic archiving.",
      confidence: 98,
      metrics: { trend: "↑ 2%", intake: "$14k Net", optimal: ">$5k Net", risk: "Low" },
      impact: { revenue: "Protected", coverage: "6 months", cost: "None" }
    }
  },
  {
    id: "OPS-2025-05-20-005",
    sender: "Operations Manager",
    role: "Main Warehouse",
    time: "3h ago",
    date: "May 20, 2025 - 06:30 AM",
    title: "Operations Report: Line Efficiency Update",
    status: "Pending AI Review",
    urgent: false,
    color: "primary",
    decision: {
      summary: "Packaging Line B is operating at 82% efficiency, down from the target of 90%. Delay caused by minor sensor misalignment.",
      action: "Schedule Maintenance",
      reasoning: "Sensor recalibration takes 15 minutes but prevents a potential 2-hour downtime later in the shift.",
      confidence: 94,
      metrics: { trend: "↓ 8%", intake: "82% OEE", optimal: "90% OEE", risk: "Medium" },
      impact: { revenue: "$3,200", coverage: "Uptime", cost: "$150" }
    }
  },
  {
    id: "OPS-2025-05-20-006",
    sender: "Logistics Coordinator",
    role: "Transport Fleet",
    time: "4h ago",
    date: "May 20, 2025 - 05:30 AM",
    title: "Route Optimization: Traffic Delay Alert",
    status: "Pending AI Review",
    urgent: true,
    color: "critical",
    decision: {
      summary: "Major accident on Highway 4 is delaying 3 inbound delivery trucks by approx 45 minutes.",
      action: "Reroute via Hwy 7",
      reasoning: "Rerouting adds 12 miles but saves 30 minutes of idling. Ensures perishable goods arrive within temperature safety window.",
      confidence: 97,
      metrics: { trend: "Traffic ↑", intake: "+45 min", optimal: "<15 min delay", risk: "High" },
      impact: { revenue: "$18,500", coverage: "Perishables", cost: "+$45 Fuel" }
    }
  },
  {
    id: "OPS-2025-05-20-007",
    sender: "HR Manager",
    role: "Head Office",
    time: "5h ago",
    date: "May 20, 2025 - 04:30 AM",
    title: "HR Request: Seasonal Staffing Approval",
    status: "Pending AI Review",
    urgent: false,
    color: "primary",
    decision: {
      summary: "Requesting approval to hire 4 temporary warehouse workers for the upcoming holiday peak season.",
      action: "Approve Hiring",
      reasoning: "Historical data shows a 40% volume increase in the next month. 4 temp workers will prevent a backlog and maintain SLA.",
      confidence: 91,
      metrics: { trend: "Volume ↑", intake: "4 Temps", optimal: "3-5 Temps", risk: "Low" },
      impact: { revenue: "$45,000", coverage: "SLA Maintained", cost: "$12,000" }
    }
  }
];

export function defaultOperations() {
  return {
    gatewayReports: defaultGatewayReports,
    b2bThread: {
      workflowStatus: "Pending Approval",
      messages: defaultB2bMessages,
      discussions: [],
      discussionThreads: [],
    },
    crmTasks: defaultCrmTasks,
  };
}

function cleanB2bDiscussionText(value, fallback = "", maxLength = 500) {
  const text = String(value || "").trim();
  return (text || fallback).slice(0, maxLength);
}

export function normalizeB2bDiscussion(input = {}) {
  const now = new Date().toISOString();

  return {
    id: cleanB2bDiscussionText(input.id || input.discussionId, "b2b-discussion", 120),
    label: cleanB2bDiscussionText(input.label || input.title, "B2B discussion", 160),
    sub: cleanB2bDiscussionText(input.sub || input.counterparty || input.company, "Counterparty", 160),
    time: cleanB2bDiscussionText(input.time, "Just now", 80),
    unread: Math.max(0, Math.min(99, Number(input.unread || 0) || 0)),
    alert: Boolean(input.alert),
    mentioned: Boolean(input.mentioned),
    favorite: Boolean(input.favorite),
    pinned: input.pinned === undefined ? false : Boolean(input.pinned),
    archived: input.archived === undefined ? false : Boolean(input.archived),
    deleted: Boolean(input.deleted),
    local: Boolean(input.local),
    color: cleanB2bDiscussionText(input.color, "text-[#3b82f6]", 80),
    bg: cleanB2bDiscussionText(input.bg, "bg-[#3b82f6]/10", 80),
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || input.createdAt || now,
  };
}

export function normalizeB2bThreadMessage(input = {}, index = 0) {
  const now = new Date().toISOString();
  const isSystem = Boolean(input.isSystem);

  return {
    id: cleanB2bDiscussionText(input.id, `b2b-message-${index + 1}`, 120),
    sender: cleanB2bDiscussionText(input.sender, "You", 80),
    role: cleanB2bDiscussionText(input.role, "Alex Rivera", 120),
    time: cleanB2bDiscussionText(input.time, "Just now", 80),
    text: cleanB2bDiscussionText(input.text, "", 4000),
    isSelf: isSystem ? false : input.isSelf !== false,
    isInternal: Boolean(input.isInternal),
    isSystem,
    isAction: Boolean(input.isAction),
    status: cleanB2bDiscussionText(input.status, "", 120),
    statusColor: cleanB2bDiscussionText(input.statusColor, "", 120),
    createdAt: input.createdAt || now,
  };
}

export function normalizeB2bDiscussionThread(input = {}) {
  const now = new Date().toISOString();
  const discussionId = cleanB2bDiscussionText(input.discussionId || input.id, "b2b-discussion", 120);
  const workflowStatus = ["Pending Approval", "Approved", "Rejected"].includes(input.workflowStatus)
    ? input.workflowStatus
    : "Pending Approval";
  const messages = Array.isArray(input.messages)
    ? input.messages.slice(-200).map((message, index) => normalizeB2bThreadMessage(message, index))
    : [];

  return {
    id: cleanB2bDiscussionText(input.id, discussionId, 120),
    discussionId,
    workflowStatus,
    messages,
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || input.createdAt || now,
  };
}

// Stable workspace resolver: unauthenticated users stay on the MVP default, signed-in users get their own id.
export function getDefaultWorkspaceId(workspaceId) {
  return workspaceId || process.env.GENIUS_WORKSPACE_ID || "default";
}

function cleanSupportText(value, fallback = "", maxLength = 500) {
  const text = String(value || "").trim();
  return (text || fallback).slice(0, maxLength);
}

export function normalizeSupportTicket(input = {}) {
  const now = new Date().toISOString();
  const priority = ["Low", "Medium", "High", "Urgent"].includes(input.priority) ? input.priority : "Medium";
  const status = ["open", "pending", "resolved", "closed"].includes(input.status) ? input.status : "open";
  const attachments = Array.isArray(input.attachments)
    ? input.attachments.slice(0, 10).map((attachment, index) => {
        const size = Number(attachment.size || 0);

        return {
          id: cleanSupportText(attachment.id, `attachment-${index + 1}`, 100),
          name: cleanSupportText(attachment.name || attachment.fileName || attachment.label, "Attachment reference", 160),
          type: cleanSupportText(attachment.type || attachment.mimeType, "reference", 120),
          size: Number.isFinite(size) && size > 0 ? Math.min(size, 50 * 1024 * 1024) : 0,
          note: cleanSupportText(attachment.note || attachment.description, "", 500),
          addedBy: cleanSupportText(attachment.addedBy || attachment.actor, "", 254).toLowerCase(),
          addedAt: attachment.addedAt || attachment.createdAt || now,
        };
      })
    : [];
  const events = Array.isArray(input.events)
    ? input.events.slice(0, 50).map((event, index) => ({
        id: cleanSupportText(event.id, `support-event-${index + 1}`, 100),
        type: cleanSupportText(event.type, "activity", 80),
        actor: cleanSupportText(event.actor, "", 254).toLowerCase(),
        message: cleanSupportText(event.message, "", 2000),
        status: cleanSupportText(event.status, "", 80),
        attachmentId: cleanSupportText(event.attachmentId, "", 100),
        createdAt: event.createdAt || now,
      }))
    : [];

  return {
    id: cleanSupportText(input.id, "SUP-000000", 80),
    issueType: cleanSupportText(input.issueType, "How-to / Usage", 80),
    priority,
    subject: cleanSupportText(input.subject, "Support request", 160),
    description: cleanSupportText(input.description, "", 2000),
    status,
    requester: {
      email: cleanSupportText(input.requester?.email || input.email, "", 254).toLowerCase(),
      role: cleanSupportText(input.requester?.role || input.role, "Member", 80),
      position: cleanSupportText(input.requester?.position || input.position, "", 120),
      department: cleanSupportText(input.requester?.department || input.department, "", 120),
    },
    source: cleanSupportText(input.source, "support-center", 80),
    attachments,
    events,
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || input.createdAt || now,
    lastActivityAt: input.lastActivityAt || input.updatedAt || input.createdAt || now,
  };
}

function cleanConnectorText(value, fallback = "", maxLength = 500) {
  const text = String(value || "").trim();
  return (text || fallback).slice(0, maxLength);
}

export function normalizeConnectorRequest(input = {}) {
  const now = new Date().toISOString();
  const status = ["requested", "reviewing", "planned", "declined"].includes(input.status) ? input.status : "requested";
  const events = Array.isArray(input.events)
    ? input.events.slice(0, 50).map((event, index) => ({
        id: cleanConnectorText(event.id, `connector-event-${index + 1}`, 100),
        type: cleanConnectorText(event.type, "status_updated", 80),
        actor: cleanConnectorText(event.actor, "", 254).toLowerCase(),
        status: cleanConnectorText(event.status, status, 80),
        message: cleanConnectorText(event.message, "", 500),
        createdAt: event.createdAt || now,
      }))
    : [];

  return {
    id: cleanConnectorText(input.id, "CONN-REQ-000000", 100),
    name: cleanConnectorText(input.name, "Requested connector", 120),
    category: cleanConnectorText(input.category, "Application", 80),
    useCase: cleanConnectorText(input.useCase, "", 1000),
    status,
    requester: {
      email: cleanConnectorText(input.requester?.email || input.email, "", 254).toLowerCase(),
      role: cleanConnectorText(input.requester?.role || input.role, "Member", 80),
      position: cleanConnectorText(input.requester?.position || input.position, "", 120),
      department: cleanConnectorText(input.requester?.department || input.department, "", 120),
    },
    statusNote: cleanConnectorText(input.statusNote || input.note, "", 500),
    updatedBy: cleanConnectorText(input.updatedBy, "", 254).toLowerCase(),
    events,
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || input.createdAt || now,
  };
}

export function normalizeConnectorFilterPreset(input = {}) {
  const now = new Date().toISOString();
  const rules = Array.isArray(input.rules)
    ? input.rules.slice(0, 25).map((rule, index) => ({
        id: cleanConnectorText(rule.id, `rule-${index + 1}`, 80),
        field: cleanConnectorText(rule.field, "amount", 80),
        op: cleanConnectorText(rule.op, "equals", 80),
        val: cleanConnectorText(rule.val, "", 160),
        active: rule.active !== false,
      }))
    : [];

  return {
    connectorId: cleanConnectorText(input.connectorId, "business-live", 120),
    label: cleanConnectorText(input.label, "Workspace filter preset", 120),
    rules,
    savedBy: cleanConnectorText(input.savedBy, "", 254).toLowerCase(),
    savedAt: input.savedAt || now,
    updatedAt: input.updatedAt || input.savedAt || now,
  };
}

function normalizeConnectorFilters(source = {}) {
  if (!source || typeof source !== "object") return {};
  return Object.fromEntries(
    Object.entries(source)
      .map(([connectorId, preset]) => {
        const normalized = normalizeConnectorFilterPreset({ ...preset, connectorId });
        return [normalized.connectorId, normalized];
      })
      .filter(([connectorId]) => connectorId),
  );
}

function cleanReportScheduleText(value, fallback = "", maxLength = 500) {
  const text = String(value || "").trim();
  return (text || fallback).slice(0, maxLength);
}

export function normalizeReportSchedule(input = {}) {
  const now = new Date().toISOString();
  const cadence = ["Weekly", "Monthly", "Quarterly", "One-time"].includes(input.cadence) ? input.cadence : "Weekly";
  const format = ["markdown", "json", "csv"].includes(input.format) ? input.format : "markdown";
  const status = ["draft", "active", "paused", "archived"].includes(input.status) ? input.status : "draft";
  const recipients = Array.isArray(input.recipients)
    ? input.recipients.map((item) => cleanReportScheduleText(item, "", 254).toLowerCase()).filter(Boolean).slice(0, 25)
    : String(input.recipients || "")
        .split(/[,\n;]/)
        .map((item) => cleanReportScheduleText(item, "", 254).toLowerCase())
        .filter(Boolean)
        .slice(0, 25);
  const events = Array.isArray(input.events)
    ? input.events.slice(0, 50).map((event, index) => ({
        id: cleanReportScheduleText(event.id, `schedule-event-${index + 1}`, 100),
        type: cleanReportScheduleText(event.type, "status_updated", 80),
        actor: cleanReportScheduleText(event.actor, "", 254).toLowerCase(),
        status: cleanReportScheduleText(event.status, status, 80),
        message: cleanReportScheduleText(event.message, "", 500),
        createdAt: event.createdAt || now,
      }))
    : [];

  return {
    id: cleanReportScheduleText(input.id, "REP-SCHED-000000", 100),
    reportId: cleanReportScheduleText(input.reportId, "", 120),
    reportName: cleanReportScheduleText(input.reportName, "Board report", 160),
    cadence,
    format,
    recipients,
    note: cleanReportScheduleText(input.note, "", 1000),
    status,
    owner: {
      email: cleanReportScheduleText(input.owner?.email || input.email, "", 254).toLowerCase(),
      role: cleanReportScheduleText(input.owner?.role || input.role, "Member", 80),
      position: cleanReportScheduleText(input.owner?.position || input.position, "", 120),
      department: cleanReportScheduleText(input.owner?.department || input.department, "", 120),
    },
    statusNote: cleanReportScheduleText(input.statusNote || input.noteStatus, "", 500),
    updatedBy: cleanReportScheduleText(input.updatedBy, "", 254).toLowerCase(),
    events,
    nextRunAt: input.nextRunAt || null,
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || input.createdAt || now,
  };
}

function cleanChatText(value, fallback = "", maxLength = 12000) {
  const text = String(value || "").trim();
  return (text || fallback).slice(0, maxLength);
}

function normalizeChatMessage(input = {}, index = 0, now = new Date().toISOString()) {
  const role = ["user", "assistant", "system"].includes(input.role) ? input.role : "user";
  const content = cleanChatText(input.content || input.text, "", 12000);

  return {
    id: cleanChatText(input.id, `chat-message-${index + 1}`, 120),
    role,
    content,
    provider: cleanChatText(input.provider, role === "assistant" ? "local-fallback" : "user", 80),
    model: cleanChatText(input.model, "", 120),
    mode: cleanChatText(input.mode, "", 60),
    createdAt: input.createdAt || now,
    metadata: input.metadata && typeof input.metadata === "object" ? input.metadata : {},
  };
}

function normalizeChatTags(input) {
  const values = Array.isArray(input) ? input : [];
  return Array.from(new Set(values
    .map((item) => cleanChatText(item, "", 40))
    .filter(Boolean)))
    .slice(0, 8);
}

export function normalizeChatConversation(input = {}) {
  const now = new Date().toISOString();
  const messages = Array.isArray(input.messages)
    ? input.messages
        .slice(-100)
        .map((message, index) => normalizeChatMessage(message, index, now))
        .filter((message) => message.content)
    : [];
  const firstUserMessage = messages.find((message) => message.role === "user")?.content || "";
  const title = cleanChatText(input.title, firstUserMessage || "New workspace chat", 120);
  const status = ["active", "archived"].includes(input.status) ? input.status : "active";

  return {
    id: cleanChatText(input.id, "chat-conversation", 120),
    title,
    mode: cleanChatText(input.mode, "Ask", 60),
    status,
    pinned: Boolean(input.pinned),
    createdBy: cleanChatText(input.createdBy, "", 254).toLowerCase(),
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || input.createdAt || now,
    archivedAt: input.archivedAt || null,
    tags: normalizeChatTags(input.tags),
    messages,
  };
}

function cleanExcelWorkspaceText(value, fallback = "", maxLength = 500) {
  const text = String(value || "").trim();
  return (text || fallback).slice(0, maxLength);
}

function normalizeExcelFilters(input = {}) {
  const source = input && typeof input === "object" ? input : {};

  return {
    anomaly: cleanExcelWorkspaceText(source.anomaly, "All anomalies", 80),
    category: cleanExcelWorkspaceText(source.category, "All categories", 80),
    owner: cleanExcelWorkspaceText(source.owner, "All owners", 120),
    approvalState: cleanExcelWorkspaceText(source.approvalState, "All approval states", 80),
  };
}

const excelVisibleColumnIds = [
  "id",
  "source",
  "row",
  "description",
  "amount",
  "category",
  "anomaly",
  "confidence",
  "suggestedFix",
  "owner",
  "approvalState",
];

function normalizeExcelVisibleColumnIds(input) {
  const allowed = new Set(excelVisibleColumnIds);
  const selected = Array.isArray(input)
    ? input.map((id) => cleanExcelWorkspaceText(id, "", 80)).filter((id) => allowed.has(id))
    : [];

  return selected.length ? Array.from(new Set(selected)).slice(0, excelVisibleColumnIds.length) : excelVisibleColumnIds;
}

export function normalizeExcelWorkspaceView(input = {}) {
  const now = new Date().toISOString();
  const tabs = Array.isArray(input.tabs)
    ? input.tabs.slice(0, 12).map((tab, index) => ({
        id: cleanExcelWorkspaceText(tab.id, `sheet-${index + 1}`, 80),
        label: cleanExcelWorkspaceText(tab.label || tab.name, `Sheet ${index + 1}`, 80),
      }))
    : [];
  const safeTabs = tabs.length ? tabs : [{ id: "1", label: "Workbook view" }];
  const activeTabId = safeTabs.some((tab) => tab.id === input.activeTabId)
    ? input.activeTabId
    : safeTabs[0].id;
  const rowsPerPage = [12, 25, 50].includes(Number(input.rowsPerPage)) ? Number(input.rowsPerPage) : 12;
  const selectedRowIds = Array.isArray(input.selectedRowIds || input.selected)
    ? (input.selectedRowIds || input.selected)
        .map((id) => cleanExcelWorkspaceText(id, "", 80))
        .filter(Boolean)
        .slice(0, 200)
    : [];
  const status = ["saved", "archived"].includes(input.status) ? input.status : "saved";
  const metrics = input.metrics && typeof input.metrics === "object" ? input.metrics : {};

  return {
    id: cleanExcelWorkspaceText(input.id, "EXCEL-VIEW-000000", 100),
    workbookName: cleanExcelWorkspaceText(input.workbookName, "Spend_Analysis_May_2026.xlsx", 160),
    sheetName: cleanExcelWorkspaceText(input.sheetName, "Sheet1 - Transactions", 160),
    tabs: safeTabs,
    activeTabId,
    filters: normalizeExcelFilters(input.filters),
    visibleColumnIds: normalizeExcelVisibleColumnIds(input.visibleColumnIds || input.columns),
    searchQuery: cleanExcelWorkspaceText(input.searchQuery, "", 160),
    rowsPerPage,
    selectedRowIds,
    note: cleanExcelWorkspaceText(input.note, "", 1000),
    status,
    metrics: {
      filteredRows: Math.max(0, Number(metrics.filteredRows || input.filteredRows || 0)),
      totalRows: Math.max(0, Number(metrics.totalRows || input.totalRows || 0)),
      selectedRows: Math.max(0, Number(metrics.selectedRows || selectedRowIds.length || 0)),
    },
    savedBy: {
      role: cleanExcelWorkspaceText(input.savedBy?.role || input.role, "Member", 80),
      position: cleanExcelWorkspaceText(input.savedBy?.position || input.position, "", 120),
      department: cleanExcelWorkspaceText(input.savedBy?.department || input.department, "", 120),
    },
    updatedBy: cleanExcelWorkspaceText(input.updatedBy, "", 120),
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || input.createdAt || now,
  };
}

function cleanArtifactText(value, fallback = "", maxLength = 12000) {
  const text = String(value || "").trim();
  return (text || fallback).slice(0, maxLength);
}

function normalizeArtifactMetrics(metrics = {}) {
  const source = metrics && typeof metrics === "object" ? metrics : {};

  return {
    expectedSavings: Math.max(0, Number(source.expectedSavings || source.targetSavings || 0)),
    riskExposure: Math.max(0, Number(source.riskExposure || source.totalRisk || 0)),
    confidence: Math.max(0, Math.min(100, Math.round(Number(source.confidence || 0)))),
  };
}

export function normalizeWorkspaceArtifact(input = {}) {
  const now = new Date().toISOString();
  const type = ["executive_summary", "negotiation_plan", "approval_workflow", "alternative_analysis"].includes(input.type)
    ? input.type
    : "executive_summary";
  const status = ["draft", "saved", "needs_review", "approved", "archived"].includes(input.status)
    ? input.status
    : "saved";
  const recommendations = Array.isArray(input.recommendations)
    ? input.recommendations.slice(0, 12).map((item, index) => ({
        id: cleanArtifactText(item.id, `recommendation-${index + 1}`, 100),
        title: cleanArtifactText(item.title || item.label, "Recommendation", 180),
        detail: cleanArtifactText(item.detail || item.description || item.objective, "", 1000),
        impact: cleanArtifactText(item.impact, "", 120),
        selected: item.selected !== false,
      }))
    : [];

  return {
    id: cleanArtifactText(input.id, "workbench-artifact", 120),
    type,
    title: cleanArtifactText(input.title, "Workbench artifact", 180),
    content: cleanArtifactText(input.content || input.body || input.summary, "", 12000),
    status,
    source: cleanArtifactText(input.source, "ai-workbench", 80),
    metrics: normalizeArtifactMetrics(input.metrics),
    recommendations,
    owner: {
      role: cleanArtifactText(input.owner?.role || input.role, "Member", 80),
      position: cleanArtifactText(input.owner?.position || input.position, "", 120),
      department: cleanArtifactText(input.owner?.department || input.department, "", 120),
    },
    metadata: input.metadata && typeof input.metadata === "object" ? input.metadata : {},
    createdBy: cleanArtifactText(input.createdBy, "", 254).toLowerCase(),
    updatedBy: cleanArtifactText(input.updatedBy, "", 254).toLowerCase(),
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || input.createdAt || now,
  };
}

// Defines the stable workspace shape so missing files, old files, and remote rows load safely.
export function emptyWorkspace(workspaceId) {
  return {
    id: getDefaultWorkspaceId(workspaceId),
    version: 1,
    workspaceName: "Acme Corporation Operations",
    role: "Owner",
    position: "CEO",
    department: "Operations",
    companySize: "51 - 200 employees",
    businessType: "Professional Services",
    members: [],
    sessions: [],
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
    supportTickets: [],
    connectorRequests: [],
    connectorFilters: {},
    reportSchedules: [],
    chatConversations: [],
    excelWorkspaceViews: [],
    workspaceArtifacts: [],
    connectors: [],
    preferences: defaultWorkspacePreferences(),
    operations: defaultOperations(),
    diagnostics: {},
    proofGraph: { nodes: [], edges: [], trail: [] },
    metrics: {},
    updatedAt: null,
  };
}

function normalizeWorkspaceSession(input = {}, workspaceId) {
  const now = new Date().toISOString();
  const status = ["active", "revoked"].includes(input.status) ? input.status : "active";

  return {
    id: String(input.id || input.sessionId || "").trim(),
    userId: String(input.userId || input.email || "").trim(),
    email: String(input.email || "").trim().toLowerCase(),
    workspaceId: getDefaultWorkspaceId(input.workspaceId || workspaceId),
    status,
    createdAt: input.createdAt || input.issuedAt || now,
    expiresAt: input.expiresAt || now,
    lastSeenAt: input.lastSeenAt || input.createdAt || input.issuedAt || now,
    revokedAt: input.revokedAt || null,
    revokedBy: input.revokedBy || null,
  };
}

// Normalizes dynamic storage payloads before the engine or UI reads them.
export function normalizeWorkspace(parsed = {}, workspaceId) {
  const source = parsed && typeof parsed === "object" ? parsed : {};
  const resolvedWorkspaceId = getDefaultWorkspaceId(workspaceId || source.id);
  const members = Array.isArray(source.members)
    ? source.members.map((member) => buildWorkspaceMember({ ...member, workspaceId: resolvedWorkspaceId }))
    : [];
  const sessions = Array.isArray(source.sessions)
    ? source.sessions
        .map((session) => normalizeWorkspaceSession(session, resolvedWorkspaceId))
        .filter((session) => session.id && session.email)
    : [];

  return {
    ...emptyWorkspace(resolvedWorkspaceId),
    ...source,
    id: resolvedWorkspaceId,
    members,
    sessions,
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
    supportTickets: Array.isArray(source.supportTickets) ? source.supportTickets.map(normalizeSupportTicket) : [],
    connectorRequests: Array.isArray(source.connectorRequests) ? source.connectorRequests.map(normalizeConnectorRequest) : [],
    connectorFilters: normalizeConnectorFilters(source.connectorFilters),
    reportSchedules: Array.isArray(source.reportSchedules) ? source.reportSchedules.map(normalizeReportSchedule) : [],
    chatConversations: Array.isArray(source.chatConversations) ? source.chatConversations.map(normalizeChatConversation) : [],
    excelWorkspaceViews: Array.isArray(source.excelWorkspaceViews) ? source.excelWorkspaceViews.map(normalizeExcelWorkspaceView) : [],
    workspaceArtifacts: Array.isArray(source.workspaceArtifacts) ? source.workspaceArtifacts.map(normalizeWorkspaceArtifact) : [],
    connectors: Array.isArray(source.connectors) ? source.connectors : [],
    preferences: normalizeWorkspacePreferences(source.preferences),
    operations: {
      ...defaultOperations(),
      ...(source.operations && typeof source.operations === "object" ? source.operations : {}),
      gatewayReports: Array.isArray(source.operations?.gatewayReports) ? source.operations.gatewayReports : [],
      b2bThread: {
        ...defaultOperations().b2bThread,
        ...(source.operations?.b2bThread && typeof source.operations.b2bThread === "object" ? source.operations.b2bThread : {}),
        messages: Array.isArray(source.operations?.b2bThread?.messages) && source.operations.b2bThread.messages.length
          ? source.operations.b2bThread.messages
          : defaultOperations().b2bThread.messages,
        discussions: Array.isArray(source.operations?.b2bThread?.discussions)
          ? source.operations.b2bThread.discussions.map(normalizeB2bDiscussion)
          : [],
        discussionThreads: Array.isArray(source.operations?.b2bThread?.discussionThreads)
          ? source.operations.b2bThread.discussionThreads.map(normalizeB2bDiscussionThread)
          : [],
      },
      crmTasks: Array.isArray(source.operations?.crmTasks) ? source.operations.crmTasks : [],
    },
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

export function publicWorkspaceSnapshot(workspace, options = {}) {
  const normalized = normalizeWorkspace(workspace, workspace?.id);
  const { sessions: _sessions, ...publicWorkspace } = normalized;
  const exposeMemberEmails = options.exposeMemberEmails === true;

  return redactPublicWorkspaceValue({
    ...publicWorkspace,
    members: (normalized.members || []).map((member) => publicMember(member, { exposeEmail: exposeMemberEmails })),
  });
}
