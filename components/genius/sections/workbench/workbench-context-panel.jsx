"use client";

import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { FileText, ShieldCheck, Database, History, Bot, Activity, CheckCircle2, Search, Share2, AlertTriangle, RefreshCw } from "lucide-react";
import { AgentDetailDrawer } from "./drawers/agent-detail-drawer";

function percent(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function formatRelativeTime(value) {
  if (!value) return "Never";
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "Recently";

  const diffMs = Date.now() - timestamp;
  const minutes = Math.max(0, Math.floor(diffMs / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(value).toLocaleDateString();
}

function workspacePeriod(workspace = {}) {
  const dates = [
    ...(workspace.evidence || []).map((record) => record.createdAt || record.updatedAt),
    ...(workspace.liveEvents || []).map((event) => event.occurredAt || event.createdAt),
  ]
    .map((value) => new Date(value).getTime())
    .filter(Number.isFinite)
    .sort((a, b) => a - b);

  if (!dates.length) return "Waiting for data";
  const first = new Date(dates[0]).toLocaleDateString();
  const last = new Date(dates[dates.length - 1]).toLocaleDateString();
  return first === last ? first : `${first} - ${last}`;
}

function sourceTone(record = {}) {
  if (record.status === "Confirmed" || record.providerStatus === "ready") return "bg-primary";
  if (record.status === "Excluded" || record.providerStatus === "error") return "bg-critical";
  if (record.type || record.occurredAt || record.channel) return "bg-[#4EA1FF]";
  return "bg-warning";
}

function buildSources({ evidence = [], liveEvents = [], connectors = [] }) {
  const evidenceRows = evidence.slice(0, 5).map((record) => ({
    id: record.id,
    name: record.name || "Evidence source",
    value: record.status || record.kind || "Uploaded",
    tone: sourceTone(record),
    icon: FileText,
  }));
  const liveRows = liveEvents.slice(0, Math.max(0, 5 - evidenceRows.length)).map((event) => ({
    id: event.id,
    name: event.name || event.type || "Live event",
    value: event.status || "Live",
    tone: sourceTone(event),
    icon: Database,
  }));
  const connectorRows = !evidenceRows.length && !liveRows.length
    ? connectors.slice(0, 3).map((connector) => ({
        id: connector.id || connector.name,
        name: connector.name || "Connector",
        value: connector.status || "Locked",
        tone: connector.status === "ready" ? "bg-primary" : "bg-[#28313C]",
        icon: Database,
      }))
    : [];

  return [...evidenceRows, ...liveRows, ...connectorRows];
}

function buildAgentRows(agentRuns = []) {
  return agentRuns.slice(0, 8).map((run) => {
    const isReady = run.status === "Ready";
    const isWaiting = run.status === "Waiting";
    const progress = percent(run.progress, isReady ? 100 : isWaiting ? 20 : 55);
    const eventLogs = Array.isArray(run.events)
      ? run.events.slice(0, 4).map((event) => ({
          time: event.createdAt ? formatRelativeTime(event.createdAt) : "Now",
          msg: event.message || `Status changed to ${event.status || run.status || "updated"}.`,
          type: event.status === "Failed" ? "error" : event.status === "Paused" ? "warning" : "success",
        }))
      : [];

    return {
      ...run,
      name: run.name || run.agentName || run.agentId || "Workspace agent",
      status: run.status || "Waiting",
      progress,
      runtime: run.lastRunAt ? formatRelativeTime(run.lastRunAt) : "Not run",
      mission: run.capability || run.guardrail || "Analyze workspace context and prepare approval-safe output.",
      logs: eventLogs.length ? eventLogs : [
        { time: run.lastRunAt ? formatRelativeTime(run.lastRunAt) : "Now", msg: `${run.workload || 0} workspace signals in scope.`, type: isReady ? "success" : "info" },
        ...(run.guardrail ? [{ time: "Guardrail", msg: run.guardrail, type: "warning" }] : []),
      ],
    };
  });
}

function artifactTypeLabel(type) {
  if (type === "executive_summary") return "Executive summary";
  if (type === "negotiation_plan") return "Negotiation plan";
  if (type === "approval_workflow") return "Approval workflow";
  if (type === "alternative_analysis") return "Alternative analysis";
  return "Workbench artifact";
}

function artifactTarget(artifact = {}) {
  if (artifact.type === "executive_summary") return "reports";
  if (artifact.type === "negotiation_plan" || artifact.type === "approval_workflow") return "approvals";
  return "chat";
}

function buildArtifacts({ reports = [], chatConversations = [], workspaceArtifacts = [] }) {
  return [
    ...workspaceArtifacts.slice(0, 6).map((artifact) => ({
      id: artifact.id,
      title: artifact.title || "Workbench artifact",
      type: artifactTypeLabel(artifact.type),
      date: formatRelativeTime(artifact.updatedAt || artifact.createdAt),
      status: artifact.status || "saved",
      target: artifactTarget(artifact),
      context: {
        artifactId: artifact.id,
        reportId: artifact.type === "executive_summary" ? `report-${artifact.id}` : undefined,
      },
    })),
    ...reports.slice(0, 5).map((report) => ({
      id: report.id,
      title: report.title || "Workspace report",
      type: report.type || "Report",
      date: formatRelativeTime(report.updatedAt || report.createdAt),
      status: report.status || "Ready",
      target: "reports",
      context: { reportId: report.id },
    })),
    ...chatConversations.slice(0, 3).map((conversation) => ({
      id: conversation.id,
      title: conversation.title || "Workspace chat",
      type: "Chat",
      date: formatRelativeTime(conversation.updatedAt || conversation.createdAt),
      status: conversation.status || "active",
      target: "chat",
      context: { conversationId: conversation.id },
    })),
  ];
}

function auditText(event = {}) {
  const type = String(event.type || "workspace_event").replace(/_/g, " ");
  const actor = event.actor || event.createdBy || "System";
  return `${type} by ${actor}`;
}

export function WorkbenchContextPanel({
  workspace = {},
  backend = {},
  evidence = [],
  liveEvents = [],
  diagnostics = {},
  metrics = {},
  agentRuns = [],
  reports = [],
  chatConversations = [],
  workspaceArtifacts = [],
  connectors = [],
  currentMember = null,
  busy = false,
  canManageAgents = false,
  onNavigate,
  onRefresh,
  onAgentStatusChange,
}) {
  const [activeTab, setActiveTab] = useState("Context");
  const [selectedAgent, setSelectedAgent] = useState(null);

  const tabs = ["Context", "Evidence", "Agents", "Artifacts", "Activity"];
  const sources = useMemo(() => buildSources({ evidence, liveEvents, connectors }), [connectors, evidence, liveEvents]);
  const agents = useMemo(() => buildAgentRows(agentRuns), [agentRuns]);
  const artifacts = useMemo(() => buildArtifacts({ reports, chatConversations, workspaceArtifacts }), [chatConversations, reports, workspaceArtifacts]);
  const auditLog = Array.isArray(workspace.auditLog) ? workspace.auditLog : [];
  const confirmedEvidence = evidence.filter((record) => record.status === "Confirmed").length;
  const completeness = evidence.length ? percent((confirmedEvidence / evidence.length) * 100) : percent(diagnostics.dataQualityScore || metrics.dataQualityScore, 0);
  const avgConfidence = evidence.length ? percent(evidence.reduce((sum, record) => sum + Number(record.confidence || 0), 0) / evidence.length) : 0;
  const dataQuality = percent(diagnostics.dataQualityScore || metrics.dataQualityScore || completeness || avgConfidence, 0);
  const lastSignalAt = [
    ...evidence.map((record) => record.updatedAt || record.createdAt),
    ...liveEvents.map((event) => event.occurredAt || event.createdAt),
    workspace.updatedAt,
  ].filter(Boolean).sort((a, b) => new Date(b) - new Date(a))[0];

  return (
    <aside className="w-[300px] shrink-0 border-l border-[#28313C] bg-[#0E1116] flex flex-col h-full animate-slide-in-right">
      <div className="flex items-center px-4 pt-4 border-b border-[#28313C] gap-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "pb-3 text-[11px] font-semibold transition-colors relative",
              activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-white",
            )}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-t-full shadow-[0_-2px_8px_rgba(78,161,255,0.5)]" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-5 flex flex-col gap-6">
        {activeTab === "Context" && (
          <>
            <div className="flex flex-col gap-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Workspace Context</h3>
              <div className="flex flex-col gap-2 rounded-lg border border-[#28313C] bg-[#141A22] p-3 text-xs text-white">
                <div className="flex justify-between gap-3 py-1 border-b border-[#28313C]/50">
                  <span className="text-muted-foreground">Workspace</span>
                  <span className="font-semibold text-right truncate">{workspace.workspaceName || "GENIUS workspace"}</span>
                </div>
                <div className="flex justify-between gap-3 py-1 border-b border-[#28313C]/50">
                  <span className="text-muted-foreground">Period</span>
                  <span className="font-semibold text-right">{workspacePeriod(workspace)}</span>
                </div>
                <div className="flex justify-between gap-3 py-1 border-b border-[#28313C]/50">
                  <span className="text-muted-foreground">Department</span>
                  <span className="font-semibold text-right truncate">{currentMember?.department || workspace.department || "All"}</span>
                </div>
                <div className="flex justify-between gap-3 py-1">
                  <span className="text-muted-foreground">Storage</span>
                  <span className="font-semibold text-right">{backend?.storage === "supabase" ? "Supabase" : "Local"}</span>
                </div>
              </div>
              <button type="button" onClick={() => onNavigate?.("settings")} className="text-[10px] text-muted-foreground hover:text-white transition-colors self-end mt-1">
                Edit context
              </button>
            </div>

            <div className="flex flex-col gap-3 mt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Active Sources ({evidence.length + liveEvents.length})</h3>
                <button type="button" onClick={() => onNavigate?.("data")} className="text-[10px] text-primary hover:text-primary/80 transition-colors">View all</button>
              </div>
              <div className="flex flex-col gap-1.5">
                {sources.length === 0 && (
                  <div className="rounded-lg border border-dashed border-[#28313C] bg-[#141A22]/40 p-3 text-xs text-muted-foreground">
                    No active sources yet.
                  </div>
                )}
                {sources.map((source) => {
                  const Icon = source.icon;
                  return (
                    <button key={source.id || source.name} type="button" onClick={() => onNavigate?.("data")} className="flex items-center justify-between text-xs hover:bg-[#141A22] p-1.5 rounded-md transition-colors cursor-pointer group text-left">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={cn("size-2 rounded-full shrink-0", source.tone)} />
                        <Icon className="size-3 text-muted-foreground shrink-0" />
                        <span className="text-white group-hover:text-primary transition-colors truncate">{source.name}</span>
                      </div>
                      <span className="text-muted-foreground shrink-0 ml-2">{source.value}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Data Quality</h3>
                <span className={cn("text-[10px] font-bold", dataQuality >= 75 ? "text-primary" : dataQuality >= 45 ? "text-warning" : "text-critical")}>
                  {dataQuality ? `${dataQuality}%` : "Waiting"}
                </span>
              </div>
              <div className="flex flex-col gap-2 rounded-lg border border-[#28313C] bg-[#141A22] p-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground"><ShieldCheck className="size-3.5" /> Completeness</div>
                  <span className="text-white">{completeness}%</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2 text-muted-foreground"><Activity className="size-3.5" /> Confidence</div>
                  <span className="text-white">{avgConfidence || dataQuality}%</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2 text-muted-foreground"><History className="size-3.5" /> Signals</div>
                  <span className="text-white">{diagnostics.summary?.liveEvents || liveEvents.length}</span>
                </div>
                <div className="flex items-center justify-between border-t border-[#28313C]/50 pt-2 mt-1">
                  <span className="text-[10px] text-muted-foreground">Last signal: {formatRelativeTime(lastSignalAt)}</span>
                  <button type="button" disabled={busy} onClick={onRefresh} className="text-[10px] text-primary hover:text-primary/80 transition-colors disabled:opacity-50">
                    {busy ? "Refreshing" : "Refresh"}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "Agents" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Active Agents</h3>
              <button type="button" onClick={() => onNavigate?.("agents")} className="text-[10px] text-primary hover:text-primary/80 transition-colors">View all</button>
            </div>
            <div className="flex flex-col gap-3">
              {agents.length === 0 && (
                <div className="rounded-lg border border-dashed border-[#28313C] bg-[#141A22]/40 p-4 text-center text-xs text-muted-foreground">
                  Agents will appear after workspace evidence is available.
                </div>
              )}
              {agents.map((agent) => (
                <button key={agent.id || agent.agentId || agent.name} type="button" onClick={() => setSelectedAgent(agent)} className="flex flex-col gap-2 rounded-lg border border-[#28313C] bg-[#141A22] p-3 hover:border-primary/50 transition-colors cursor-pointer group text-left">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded bg-[#0E1116] border border-[#28313C] group-hover:border-primary/30">
                      <Bot className="size-3.5 text-primary" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-xs font-semibold text-white truncate">{agent.name}</span>
                      <span className="text-[9px] text-muted-foreground truncate">{agent.mission}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-1 flex-1 bg-[#28313C] rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all duration-1000", agent.status === "Completed" || agent.status === "Ready" ? "bg-primary" : agent.status === "Running" ? "bg-[#4EA1FF]" : agent.status === "Failed" ? "bg-critical" : "bg-warning")} style={{ width: `${agent.progress}%` }} />
                    </div>
                    <span className="text-[10px] font-medium text-white w-7 text-right">{agent.progress}%</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Evidence" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Evidence In Scope</h3>
              <button type="button" onClick={() => onNavigate?.("data")} className="text-[10px] text-primary hover:text-primary/80 transition-colors">Open intake</button>
            </div>
            {evidence.length === 0 && (
              <div className="flex flex-col gap-3 text-center py-10">
                <Database className="size-8 text-[#28313C] mx-auto" />
                <p className="text-xs text-muted-foreground">Upload or connect evidence before asking for source-specific citations.</p>
              </div>
            )}
            {evidence.slice(0, 8).map((record) => (
              <button key={record.id || record.name} type="button" onClick={() => onNavigate?.("data")} className="flex items-start gap-3 rounded-lg border border-[#28313C] bg-[#141A22] p-3 text-left transition-colors hover:border-primary/40">
                <FileText className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-white">{record.name || "Evidence source"}</p>
                  <p className="mt-1 line-clamp-2 text-[10px] text-muted-foreground">{record.extracted || record.summary || record.source || "Workspace evidence"}</p>
                  <div className="mt-2 flex items-center gap-2 text-[9px] text-muted-foreground">
                    <span>{record.kind || "File"}</span>
                    <span>{record.status || "Needs review"}</span>
                    <span>{percent(record.confidence)}%</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {activeTab === "Artifacts" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Generated Artifacts</h3>
              <button type="button" onClick={() => onNavigate?.("reports")} className="text-[10px] text-primary hover:text-primary/80 transition-colors">Reports</button>
            </div>
            {artifacts.length === 0 && (
              <div className="rounded-lg border border-dashed border-[#28313C] bg-[#141A22]/40 p-4 text-center text-xs text-muted-foreground">
                Reports and saved chat artifacts will appear here.
              </div>
            )}
            {artifacts.map((artifact) => (
              <button key={`${artifact.type}-${artifact.id || artifact.title}`} type="button" onClick={() => onNavigate?.(artifact.target || "reports", artifact.context)} className="flex items-center gap-3 p-3 rounded-lg border border-[#28313C] bg-[#141A22] hover:border-primary/50 cursor-pointer transition-colors group text-left">
                <FileText className="size-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-xs font-semibold text-white truncate">{artifact.title}</span>
                  <span className="text-[10px] text-muted-foreground">{artifact.type} - {artifact.date}</span>
                </div>
                <Share2 className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        )}

        {activeTab === "Activity" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Recent Activity</h3>
              <button type="button" disabled={busy} onClick={onRefresh} className="text-[10px] text-primary hover:text-primary/80 transition-colors disabled:opacity-50">
                <RefreshCw className={cn("inline size-3", busy && "animate-spin")} />
              </button>
            </div>
            {auditLog.length === 0 && (
              <div className="rounded-lg border border-dashed border-[#28313C] bg-[#141A22]/40 p-4 text-center text-xs text-muted-foreground">
                No workspace activity has been recorded yet.
              </div>
            )}
            <div className="relative pl-3 border-l border-[#28313C] flex flex-col gap-5 ml-2 mt-2">
              {auditLog.slice(0, 8).map((event, index) => (
                <div key={event.id || `${event.type}-${index}`} className="relative">
                  <div className={cn("absolute -left-[17px] top-1 size-2.5 rounded-full border-[2px] border-[#0E1116]", index === 0 ? "bg-primary" : event.type?.includes("failed") ? "bg-critical" : "bg-[#4EA1FF]")} />
                  <p className="text-xs text-white capitalize">{auditText(event)}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{formatRelativeTime(event.createdAt || event.timestamp)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AgentDetailDrawer
        open={!!selectedAgent}
        onOpenChange={() => setSelectedAgent(null)}
        agent={selectedAgent}
        canManage={canManageAgents}
        busy={busy}
        onStatusChange={onAgentStatusChange}
      />
    </aside>
  );
}
