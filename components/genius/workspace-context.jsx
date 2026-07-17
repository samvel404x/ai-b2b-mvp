"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const emptyWorkspace = {
  id: "default",
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
  preferences: {
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
      channels: { email: true, inapp: true, sms: false, slack: false },
      categories: {
        urgentApprovals: true,
        agentFailures: true,
        guardrailBlocks: true,
        securityEvents: true,
        dailyDigest: true,
        immediateOverrides: true,
      },
      quietHours: { start: "22:00", end: "07:00" },
    },
    policies: {
      rlsEnabled: true,
      auditLogging: true,
      restrictExport: true,
      dataMasking: true,
      autoPurge: true,
      softDelete: true,
      retentionDays: 180,
      graceDays: 30,
    },
    workbench: { defaultTags: ["Software"] },
  },
  operations: {
    gatewayReports: [],
    b2bThread: {
      workflowStatus: "Pending Approval",
      messages: [],
      discussions: [],
      discussionThreads: [],
    },
    crmTasks: [],
  },
  members: [],
  diagnostics: {},
  proofGraph: { nodes: [], edges: [], trail: [] },
  metrics: {},
};

const WorkspaceContext = createContext(null);

function capabilityLabel(capability) {
  return String(capability || "permission").replace(/_/g, " ");
}

async function readApiResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof body === "object" && body?.error ? body.error : `Request failed with ${response.status}`;
    throw new Error(message);
  }

  return body;
}

function downloadUrl(url) {
  if (typeof window === "undefined") return;
  const link = document.createElement("a");
  link.href = url;
  link.download = "";
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function WorkspaceProvider({ children }) {
  const [workspace, setWorkspace] = useState(emptyWorkspace);
  const [session, setSession] = useState(null);
  const [backend, setBackend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const can = useCallback((capability) => {
    if (!capability) return true;
    const required = Array.isArray(capability) ? capability : [capability];
    const available = new Set(session?.capabilities || []);
    return required.every((item) => available.has(item));
  }, [session]);

  const requireCapability = useCallback((capability, label = "This action") => {
    if (can(capability)) return;
    throw new Error(`${label} requires ${capabilityLabel(capability)} permission.`);
  }, [can]);

  const loadWorkspace = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError(null);

    try {
      const data = await readApiResponse(await fetch("/api/workspace", { cache: "no-store" }));
      setWorkspace(data.workspace || emptyWorkspace);
      setSession(data.session || null);
      setBackend(data.backend || null);
      return data.workspace || emptyWorkspace;
    } catch (nextError) {
      setError(nextError.message || "Workspace could not be loaded.");
      throw nextError;
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadWorkspace().catch(() => {});
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadWorkspace]);

  const withBusy = useCallback(async (task) => {
    setBusy(true);
    setError(null);
    try {
      return await task();
    } catch (nextError) {
      setError(nextError.message || "Workspace action failed.");
      throw nextError;
    } finally {
      setBusy(false);
    }
  }, []);

  const uploadEvidence = useCallback(async (files, source = "Data Intake") => {
    requireCapability("upload_evidence", "Evidence upload");
    const uploadFiles = Array.from(files || []).filter(Boolean);
    if (!uploadFiles.length) throw new Error("Attach at least one evidence file.");

    return withBusy(async () => {
      const formData = new FormData();
      formData.set("source", source);
      uploadFiles.forEach((file) => formData.append("files", file));

      const data = await readApiResponse(await fetch("/api/evidence", { method: "POST", body: formData }));
      await loadWorkspace({ silent: true });
      return data;
    });
  }, [loadWorkspace, requireCapability, withBusy]);

  const analyzeUrl = useCallback(async (url) => {
    requireCapability("upload_evidence", "URL analysis");
    const cleanUrl = String(url || "").trim();
    if (!cleanUrl) throw new Error("Enter a URL to analyze.");

    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/sources/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: cleanUrl }),
      }));
      await loadWorkspace({ silent: true });
      return data;
    });
  }, [loadWorkspace, requireCapability, withBusy]);

  const reviewEvidence = useCallback(async ({ ids, status = "Confirmed", fieldsById = {} }) => {
    requireCapability("review_evidence", "Evidence review");
    const cleanIds = Array.from(ids || []).filter(Boolean);
    if (!cleanIds.length) throw new Error("Select evidence to review.");

    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/evidence/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: cleanIds, status, fieldsById }),
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data;
    });
  }, [requireCapability, withBusy]);

  const updateAction = useCallback(async (id, status, note, options = {}) => {
    requireCapability("decide_approvals", "Approval decisions");
    if (!id) throw new Error("Action id is required.");

    return withBusy(async () => {
      const data = await readApiResponse(await fetch(`/api/actions/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note, ...options }),
      }));
      await loadWorkspace({ silent: true });
      return data.action;
    });
  }, [loadWorkspace, requireCapability, withBusy]);

  const submitTeamReport = useCallback(async ({ taskId, taskTitle, team, sender, role, deliveryLog, notes }) => {
    requireCapability("submit_team_report", "Team report submission");
    if (!String(taskTitle || "").trim()) throw new Error("Task title is required.");
    if (!String(deliveryLog || "").trim()) throw new Error("Delivery log is required.");

    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/operations/team-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, taskTitle, team, sender, role, deliveryLog, notes }),
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data.report;
    });
  }, [requireCapability, withBusy]);

  const createCrmTask = useCallback(async (task = {}) => {
    requireCapability("submit_team_report", "Team CRM task creation");
    if (!String(task.title || "").trim()) throw new Error("Task title is required.");

    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/operations/crm-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data.task;
    });
  }, [requireCapability, withBusy]);

  const updateCrmTask = useCallback(async (task = {}) => {
    requireCapability("submit_team_report", "Team CRM task update");
    if (!task.id && !task.taskId) throw new Error("CRM task id is required.");

    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/operations/crm-tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data.task;
    });
  }, [requireCapability, withBusy]);

  const deleteCrmTask = useCallback(async (task = {}) => {
    requireCapability("submit_team_report", "Team CRM task deletion");
    if (!task.id && !task.taskId) throw new Error("CRM task id is required.");

    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/operations/crm-tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data.task;
    });
  }, [requireCapability, withBusy]);

  const updateGatewayReport = useCallback(async (id, status, note) => {
    requireCapability("decide_gateway_report", "Gateway report decisions");
    if (!id) throw new Error("Gateway report id is required.");

    return withBusy(async () => {
      const data = await readApiResponse(await fetch(`/api/operations/reports/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note }),
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data.report;
    });
  }, [requireCapability, withBusy]);

  const sendB2bMessage = useCallback(async ({ text, sender, role, isSelf = true, isInternal = false, isSystem = false, isAction = false, status, statusColor, discussionId }) => {
    requireCapability("send_b2b_message", "B2B messaging");
    if (!String(text || "").trim()) throw new Error("Message text is required.");

    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/operations/b2b", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, sender, role, isSelf, isInternal, isSystem, isAction, status, statusColor, discussionId }),
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data.message;
    });
  }, [requireCapability, withBusy]);

  const updateB2bWorkflowStatus = useCallback(async (status, discussionId) => {
    requireCapability("approve_b2b_workflow", "B2B workflow approval");
    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/operations/b2b", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, discussionId }),
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data.b2bThread;
    });
  }, [requireCapability, withBusy]);

  const updateB2bDiscussion = useCallback(async (discussion = {}) => {
    requireCapability("send_b2b_message", "B2B discussion updates");
    if (!discussion.id && !discussion.discussionId) throw new Error("B2B discussion id is required.");
    const { action, operation, ...payload } = discussion;

    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/operations/b2b", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, action: "update_discussion", operation: action || operation || "upsert" }),
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data.discussion;
    });
  }, [requireCapability, withBusy]);

  const runAgents = useCallback(async (payload = {}) => {
    requireCapability("run_agents", "Agent execution");
    return withBusy(async () => {
      const hasPayload = payload && typeof payload === "object" && Object.keys(payload).length > 0;
      const data = await readApiResponse(await fetch("/api/agents/run", {
        method: "POST",
        headers: hasPayload ? { "Content-Type": "application/json" } : undefined,
        body: hasPayload ? JSON.stringify(payload) : undefined,
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data;
    });
  }, [requireCapability, withBusy]);

  const updateAgentRunStatus = useCallback(async ({ id, agentId, status, note } = {}) => {
    requireCapability("run_agents", "Agent run lifecycle");
    if (!id && !agentId) throw new Error("Agent run id is required.");
    if (!status) throw new Error("Agent run status is required.");

    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/agents/run", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, agentId, status, note }),
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data.agentRun;
    });
  }, [requireCapability, withBusy]);

  const ingestDemoLiveEvents = useCallback(async () => {
    requireCapability("ingest_live_events", "Live event ingestion");
    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/live-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demo: true }),
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data.liveEvents || [];
    });
  }, [requireCapability, withBusy]);

  const clearLiveEvents = useCallback(async () => {
    requireCapability("manage_live_events", "Live event management");
    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/live-events", { method: "DELETE" }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data.liveEvents || [];
    });
  }, [requireCapability, withBusy]);

  const updateNotificationStatus = useCallback(async ({ id, status, all = false }) => {
    requireCapability("update_notifications", "Notification updates");
    if (!all && !id) throw new Error("Notification id is required.");
    if (!status) throw new Error("Notification status is required.");

    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, all }),
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data.notifications || [];
    });
  }, [requireCapability, withBusy]);

  const updateDiagnosticWorkflow = useCallback(async ({ id, status, owner, ownerRole, note }) => {
    requireCapability("decide_approvals", "Diagnostic workflow updates");
    if (!id) throw new Error("Diagnostic category id is required.");

    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/diagnostics", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, owner, ownerRole, note }),
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data.diagnostic;
    });
  }, [requireCapability, withBusy]);

  const sendChatMessage = useCallback(async ({ conversationId, messages, mode = "Ask", title, language, signal, onChunk, onConversationId }) => {
    requireCapability("ask_ai", "AI chat");
    const cleanMessages = Array.from(messages || [])
      .filter((message) => message?.role === "user" || message?.role === "assistant")
      .map((message) => ({
        role: message.role,
        text: String(message.text || message.content || "").trim(),
      }))
      .filter((message) => message.text);

    if (!cleanMessages.some((message) => message.role === "user")) {
      throw new Error("Add a message before asking GENIUS.");
    }

    return withBusy(async () => {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal,
        body: JSON.stringify({ conversationId, messages: cleanMessages, mode, title, language }),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";
        const body = contentType.includes("application/json") ? await response.json() : await response.text();
        const message = typeof body === "object" && body?.error ? body.error : `Chat request failed with ${response.status}`;
        throw new Error(message);
      }

      const nextConversationId = response.headers.get("x-genius-conversation-id") || conversationId || "";
      const provider = response.headers.get("x-genius-chat-provider") || "unknown";
      if (nextConversationId && onConversationId) onConversationId(nextConversationId);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let text = "";

      if (!reader) {
        text = await response.text();
        if (text && onChunk) onChunk(text);
      } else {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (!chunk) continue;
          text += chunk;
          if (onChunk) onChunk(chunk, text);
        }
      }

      await loadWorkspace({ silent: true });
      return { text, conversationId: nextConversationId, provider };
    });
  }, [loadWorkspace, requireCapability, withBusy]);

  const createChatConversation = useCallback(async ({ title, mode, tags }) => {
    requireCapability("ask_ai", "AI chat");
    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", title, mode, tags }),
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data.conversation;
    });
  }, [requireCapability, withBusy]);

  const branchConversation = useCallback(async ({ sourceId, messageId }) => {
    requireCapability("ask_ai", "AI chat");
    if (!sourceId) throw new Error("Source conversation id is required.");
    return withBusy(async () => {
      // Find the source conversation to clone messages locally
      // (Since we don't have a dedicated branch API, we'll create a new conversation and send the history as the first request or just copy properties if the backend supports it.
      // Wait, we need the backend to copy messages. Let's just create an endpoint behavior for action === "branch".
      const data = await readApiResponse(await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "branch", sourceId, messageId }),
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data.conversation;
    });
  }, [requireCapability, withBusy]);

  const updateChatConversation = useCallback(async ({ id, title, mode, status, pinned, tags }) => {
    requireCapability("ask_ai", "AI chat");
    if (!id) throw new Error("Chat conversation id is required.");

    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title, mode, status, pinned, tags }),
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data.conversation;
    });
  }, [requireCapability, withBusy]);

  const deleteChatConversation = useCallback(async ({ id }) => {
    requireCapability("ask_ai", "AI chat");
    if (!id) throw new Error("Chat conversation id is required.");

    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/chat", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data.conversationId;
    });
  }, [requireCapability, withBusy]);

  const createSupportTicket = useCallback(async ({ issueType, priority, subject, description }) => {
    const cleanSubject = String(subject || "").trim();
    const cleanDescription = String(description || "").trim();
    if (!cleanSubject || !cleanDescription) throw new Error("Add a subject and description before creating a ticket.");

    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueType, priority, subject: cleanSubject, description: cleanDescription }),
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data.ticket;
    });
  }, [withBusy]);

  const updateSupportTicketStatus = useCallback(async ({ id, status, note }) => {
    if (!id) throw new Error("Support ticket id is required.");
    if (!status) throw new Error("Support ticket status is required.");

    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/support/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, note }),
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data.ticket;
    });
  }, [withBusy]);

  const addSupportTicketComment = useCallback(async ({ id, message }) => {
    const cleanMessage = String(message || "").trim();
    if (!id) throw new Error("Support ticket id is required.");
    if (!cleanMessage) throw new Error("Support ticket comment is required.");

    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/support/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_comment", id, message: cleanMessage }),
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data.ticket;
    });
  }, [withBusy]);

  const addSupportTicketAttachment = useCallback(async ({ id, name, type, size, note }) => {
    const cleanName = String(name || "").trim();
    if (!id) throw new Error("Support ticket id is required.");
    if (!cleanName) throw new Error("Support ticket attachment name is required.");

    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/support/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_attachment",
          id,
          name: cleanName,
          type,
          size,
          note,
        }),
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data.ticket;
    });
  }, [withBusy]);

  const requestConnector = useCallback(async ({ name, category, useCase }) => {
    const cleanName = String(name || "").trim();
    const cleanUseCase = String(useCase || "").trim();
    if (!cleanName || !cleanUseCase) throw new Error("Connector name and use case are required.");

    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/connectors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cleanName, category, useCase: cleanUseCase }),
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data.request;
    });
  }, [withBusy]);

  const saveConnectorFilters = useCallback(async ({ connectorId, label, rules }) => {
    requireCapability("manage_live_events", "Connector filter persistence");
    if (!connectorId) throw new Error("Connector id is required.");
    const cleanRules = Array.from(rules || []).filter(Boolean);
    if (!cleanRules.length) throw new Error("At least one filter rule is required.");

    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/connectors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectorId, label, rules: cleanRules }),
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data.preset;
    });
  }, [requireCapability, withBusy]);

  const updateConnectorRequestStatus = useCallback(async ({ id, status, note }) => {
    requireCapability("manage_connectors", "Connector request management");
    if (!id) throw new Error("Connector request id is required.");
    if (!status) throw new Error("Connector request status is required.");

    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/connectors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_request_status",
          requestId: id,
          status,
          note,
        }),
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data.request;
    });
  }, [requireCapability, withBusy]);

  const createReportSchedule = useCallback(async ({ reportId, reportName, cadence, format, recipients, note, nextRunAt }) => {
    requireCapability("export_data", "Report schedule draft");
    if (!reportId) throw new Error("Report id is required.");
    if (!String(recipients || "").trim() && !Array.isArray(recipients)) {
      throw new Error("At least one recipient is required.");
    }

    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/reports/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, reportName, cadence, format, recipients, note, nextRunAt }),
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data.schedule;
    });
  }, [requireCapability, withBusy]);

  const updateReportScheduleStatus = useCallback(async ({ id, status, note }) => {
    requireCapability("export_data", "Report schedule lifecycle");
    if (!id) throw new Error("Report schedule id is required.");
    if (!status) throw new Error("Report schedule status is required.");

    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/reports/schedules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, note }),
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data.schedule;
    });
  }, [requireCapability, withBusy]);

  const saveExcelWorkspaceView = useCallback(async (view = {}) => {
    requireCapability("upload_evidence", "Excel workspace persistence");

    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/excel-workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(view),
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data.view;
    });
  }, [requireCapability, withBusy]);

  const saveWorkbenchArtifact = useCallback(async (artifact = {}) => {
    requireCapability("ask_ai", "AI Workbench artifact persistence");
    if (!String(artifact.title || "").trim()) throw new Error("Artifact title is required.");

    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/workbench/artifacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(artifact),
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data;
    });
  }, [requireCapability, withBusy]);

  const saveWorkspacePreferences = useCallback(async (preferences = {}) => {
    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/workspace/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data.preferences || data.workspace?.preferences || {};
    });
  }, [withBusy]);

  const listWorkspaceSessions = useCallback(async () => {
    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/workspace/sessions", { cache: "no-store" }));
      if (data.workspace) setWorkspace(data.workspace);
      return data.sessions || [];
    });
  }, [withBusy]);

  const revokeWorkspaceSession = useCallback(async ({ id, allOther = false } = {}) => {
    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/workspace/sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, allOther }),
      }));
      if (data.workspace) setWorkspace(data.workspace);
      return {
        sessions: data.sessions || [],
        revokedCount: data.revokedCount || 0,
      };
    });
  }, [withBusy]);

  const resetWorkspace = useCallback(async () => {
    requireCapability("reset_workspace", "Workspace reset");
    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/workspace", { method: "DELETE" }));
      setWorkspace(data.workspace || emptyWorkspace);
      setSession(data.session || null);
      setBackend(data.backend || null);
      return data.workspace || emptyWorkspace;
    });
  }, [requireCapability, withBusy]);

  const loadDemoWorkspace = useCallback(async () => {
    requireCapability("reset_workspace", "Investor demo reset");
    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/demo/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "load-investor-demo" }),
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data.workspace || emptyWorkspace;
    });
  }, [requireCapability, withBusy]);

  const exportWorkspace = useCallback(() => {
    if (!can("export_data")) {
      setError("Workspace export requires export data permission.");
      return false;
    }
    downloadUrl("/api/workspace/portable");
    return true;
  }, [can]);

  const importWorkspaceFile = useCallback(async (file) => {
    requireCapability("reset_workspace", "Workspace import");
    if (!file) throw new Error("Choose a GENIUS workspace JSON file.");
    if (file.size > 10 * 1024 * 1024) throw new Error("Workspace import file must be 10 MB or smaller.");

    return withBusy(async () => {
      const raw = await file.text();
      const data = await readApiResponse(await fetch("/api/workspace/portable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: raw,
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      setSession(data.session || null);
      return data.workspace || emptyWorkspace;
    });
  }, [requireCapability, withBusy]);

  const createGuestWorkspace = useCallback(async ({ workspaceName, position, department, companySize, businessType } = {}) => {
    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/auth/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceName: String(workspaceName || "").trim() || "GENIUS Guest Workspace",
          position: String(position || session?.position || "").trim() || "Product Owner",
          department: String(department || session?.department || "").trim() || "Executive",
          companySize: String(companySize || "").trim() || "Local guest mode",
          businessType: String(businessType || "").trim() || "Guest evaluation",
        }),
      }));

      setWorkspace(data.workspace || emptyWorkspace);
      setSession(data.session || null);

      const refreshed = await readApiResponse(await fetch("/api/workspace", { cache: "no-store" }));
      setWorkspace(refreshed.workspace || data.workspace || emptyWorkspace);
      setSession(refreshed.session || data.session || null);
      setBackend(refreshed.backend || null);
      return refreshed.workspace || data.workspace || emptyWorkspace;
    });
  }, [session?.department, session?.position, withBusy]);

  const signOut = useCallback(async () => {
    return withBusy(async () => {
      await readApiResponse(await fetch("/api/auth/session", { method: "DELETE" }));
      setSession(null);
      window.location.assign("/");
    });
  }, [withBusy]);

  const exportEvidence = useCallback((format = "csv", scope = "confirmed") => {
    if (!can("export_data")) {
      setError("Data export requires export data permission.");
      return false;
    }
    downloadUrl(`/api/evidence/export?format=${encodeURIComponent(format)}&scope=${encodeURIComponent(scope)}`);
    return true;
  }, [can]);

  const exportAudit = useCallback((format = "csv") => {
    if (!can("export_data")) {
      setError("Audit export requires export data permission.");
      return false;
    }
    downloadUrl(`/api/audit/export?format=${encodeURIComponent(format)}`);
    return true;
  }, [can]);

  const exportReport = useCallback((reportId, format = "markdown") => {
    if (!can("export_data")) {
      setError("Report export requires export data permission.");
      return false;
    }
    if (!reportId) throw new Error("Report id is required.");
    downloadUrl(`/api/reports/${encodeURIComponent(reportId)}?format=${encodeURIComponent(format)}`);
    return true;
  }, [can]);

  const inviteMember = useCallback(async ({ email, role, position, department }) => {
    requireCapability("manage_members", "Team invites");
    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/workspace/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, position, department }),
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data;
    });
  }, [requireCapability, withBusy]);

  const updateMember = useCallback(async ({ id, email, role, position, department, status }) => {
    requireCapability("manage_members", "Member management");
    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/workspace/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, email, role, position, department, status }),
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data.member;
    });
  }, [requireCapability, withBusy]);

  const disableMember = useCallback(async ({ id, email }) => {
    requireCapability("manage_members", "Member management");
    return withBusy(async () => {
      const data = await readApiResponse(await fetch("/api/workspace/members", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, email }),
      }));
      setWorkspace(data.workspace || emptyWorkspace);
      return data.member;
    });
  }, [requireCapability, withBusy]);

  const value = useMemo(() => ({
    workspace,
    session,
    backend,
    loading,
    busy,
    error,
    evidence: workspace.evidence || [],
    findings: workspace.findings || [],
    actions: workspace.actions || [],
    reports: workspace.reports || [],
    agentRuns: workspace.agentRuns || [],
    diagnostics: workspace.diagnostics || {},
    proofTrail: workspace.proofGraph?.trail || [],
    metrics: workspace.metrics || {},
    operations: workspace.operations || emptyWorkspace.operations,
    notifications: workspace.notifications || [],
    supportTickets: workspace.supportTickets || [],
    connectorRequests: workspace.connectorRequests || [],
    connectorFilters: workspace.connectorFilters || {},
    reportSchedules: workspace.reportSchedules || [],
    chatConversations: workspace.chatConversations || [],
    excelWorkspaceViews: workspace.excelWorkspaceViews || [],
    workspaceArtifacts: workspace.workspaceArtifacts || [],
    connectors: workspace.connectors || [],
    preferences: workspace.preferences || emptyWorkspace.preferences,
    members: workspace.members || [],
    currentMember: session?.member || null,
    can,
    loadWorkspace,
    uploadEvidence,
    analyzeUrl,
    reviewEvidence,
    updateAction,
    submitTeamReport,
    createCrmTask,
    updateCrmTask,
    deleteCrmTask,
    updateGatewayReport,
    sendB2bMessage,
    updateB2bWorkflowStatus,
    updateB2bDiscussion,
    runAgents,
    updateAgentRunStatus,
    ingestDemoLiveEvents,
    clearLiveEvents,
    updateNotificationStatus,
    updateDiagnosticWorkflow,
    sendChatMessage,
    updateChatConversation,
    deleteChatConversation,
    createSupportTicket,
    updateSupportTicketStatus,
    addSupportTicketComment,
    addSupportTicketAttachment,
    requestConnector,
    saveConnectorFilters,
    updateConnectorRequestStatus,
    createReportSchedule,
    updateReportScheduleStatus,
    saveExcelWorkspaceView,
    saveWorkbenchArtifact,
    saveWorkspacePreferences,
    listWorkspaceSessions,
    revokeWorkspaceSession,
    resetWorkspace,
    loadDemoWorkspace,
    exportWorkspace,
    importWorkspaceFile,
    createGuestWorkspace,
    signOut,
    exportEvidence,
    exportAudit,
    exportReport,
    inviteMember,
    updateMember,
    disableMember,
  }), [
    workspace,
    session,
    backend,
    loading,
    busy,
    error,
    can,
    loadWorkspace,
    uploadEvidence,
    analyzeUrl,
    reviewEvidence,
    updateAction,
    submitTeamReport,
    createCrmTask,
    updateCrmTask,
    deleteCrmTask,
    updateGatewayReport,
    sendB2bMessage,
    updateB2bWorkflowStatus,
    updateB2bDiscussion,
    runAgents,
    updateAgentRunStatus,
    ingestDemoLiveEvents,
    clearLiveEvents,
    updateNotificationStatus,
    updateDiagnosticWorkflow,
    sendChatMessage,
    createChatConversation,
    branchConversation,
    updateChatConversation,
    deleteChatConversation,
    createSupportTicket,
    updateSupportTicketStatus,
    addSupportTicketComment,
    addSupportTicketAttachment,
    requestConnector,
    saveConnectorFilters,
    updateConnectorRequestStatus,
    createReportSchedule,
    updateReportScheduleStatus,
    saveExcelWorkspaceView,
    saveWorkbenchArtifact,
    saveWorkspacePreferences,
    listWorkspaceSessions,
    revokeWorkspaceSession,
    resetWorkspace,
    loadDemoWorkspace,
    exportWorkspace,
    importWorkspaceFile,
    createGuestWorkspace,
    signOut,
    exportEvidence,
    exportAudit,
    exportReport,
    inviteMember,
    updateMember,
    disableMember,
  ]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider.");
  }

  return context;
}
