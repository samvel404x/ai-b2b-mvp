"use client";

import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { useWorkspace } from "../workspace-context";

// New modular components
import { ExecutiveKpiRow } from "./command-center/executive-kpi-row";
import { RequiresAttentionPanel } from "./command-center/requires-attention";
import { DecisionQueuePanel } from "./command-center/decision-queue";
import { LiveAgentOperations } from "./command-center/live-agent-operations";
import { RiskExposureCard } from "./command-center/risk-exposure";
import { ValueCapturedCard } from "./command-center/value-captured";
import { SystemHealthPanel } from "./command-center/system-health";
import { EvidenceCoverageCard } from "./command-center/evidence-coverage";
import { ActivityStreamPanel } from "./command-center/activity-stream";

// Mock data
import {
  activeAgents,
  decisionQueue,
  ccSystemHealth,
  ccRiskExposure,
  ccValueCaptured,
  ccEvidenceCoverage,
  ccActivityStream,
  ccRequiresAttention
} from "@/lib/genius-data";

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
  return `${Math.floor(hours / 24)}d ago`;
}

function buildLiveAgentRows(agentRuns = []) {
  return agentRuns.map((run) => ({
    id: run.id,
    agentId: run.agentId,
    name: run.name || run.agentName || run.agentId || "Workspace agent",
    role: run.capability || run.guardrail || "Approval-safe workspace analysis",
    status: run.status || "Waiting",
    workload: Math.max(0, Math.min(100, Math.round(Number(run.progress ?? run.workload) || 0))),
    lastRun: formatRelativeTime(run.lastRunAt || run.updatedAt),
    actionsToday: (run.events || []).length + (run.tasks || []).length,
    impact: Math.max(0, ...(run.outputs || []).map((output) => Number(output.impact || 0))),
  }));
}

function priorityForImpact(value, severity) {
  if (severity === "Critical" || Number(value || 0) >= 5000) return "Critical";
  if (severity === "High" || Number(value || 0) >= 1500) return "High";
  return "Medium";
}

function buildDecisionRows(actions = []) {
  return actions
    .filter((action) => !["Approved", "Rejected", "Done"].includes(action.status))
    .slice(0, 8)
    .map((action) => ({
      id: action.id,
      actionId: action.id,
      findingId: action.findingId || null,
      evidenceId: action.evidenceId || null,
      title: action.title || "Review prepared action",
      sub: action.description || action.recommendedAction || "Approval-safe workspace action",
      impact: Number(action.impact || 0),
      due: action.status === "Needs review" ? "Today" : action.status || "Pending",
      priority: priorityForImpact(action.impact, action.severity),
      requestedBy: action.owner || "GENIUS",
      state: action.status || "Needs review",
    }));
}

function buildAttentionRows(findings = [], actions = []) {
  const actionByFinding = new Map(actions.map((action) => [action.findingId, action]));

  return findings
    .filter((finding) => !["Low"].includes(finding.severity))
    .slice(0, 8)
    .map((finding) => {
      const action = actionByFinding.get(finding.id);
      return {
        id: finding.id,
        findingId: finding.id,
        actionId: action?.id || null,
        evidenceId: finding.evidenceId || null,
        issue: finding.title || "Workspace finding",
        entity: finding.source || finding.evidence || finding.category || "Evidence-backed signal",
        impact: Number(finding.impact || 0),
        impactType: finding.category || "Workspace impact",
        priority: priorityForImpact(finding.impact, finding.severity),
        owner: finding.owner || "Unassigned",
        ownerInitials: String(finding.owner || "UN").split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "UN",
      };
    });
}

export default function CommandCenter({ onNavigate }) {
  const { agentRuns, actions, findings, busy, can, runAgents, updateAgentRunStatus } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [activityFilter, setActivityFilter] = useState("all");
  const liveAgents = useMemo(() => buildLiveAgentRows(agentRuns), [agentRuns]);
  const liveDecisions = useMemo(() => buildDecisionRows(actions), [actions]);
  const liveAttention = useMemo(() => buildAttentionRows(findings, actions), [actions, findings]);
  const hasWorkspaceAgents = liveAgents.length > 0;
  const displayedAgents = hasWorkspaceAgents ? liveAgents : activeAgents;
  const displayedDecisions = liveDecisions.length ? liveDecisions : decisionQueue;
  const displayedAttention = liveAttention.length ? liveAttention : ccRequiresAttention;
  const activityItems = useMemo(() => (
    activityFilter === "all"
      ? ccActivityStream
      : ccActivityStream.filter((item) => item.type === activityFilter)
  ), [activityFilter]);
  const activityFilterLabel = activityFilter === "all"
    ? "All Events"
    : activityFilter.charAt(0).toUpperCase() + activityFilter.slice(1);

  useEffect(() => {
    // Simulate initial load for polished animations
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  async function handleAgentStatusChange(agent, status) {
    if (!agent?.id && !agent?.agentId) return;
    try {
      if (agent.agentId === "langflow-demo" && status === "Running") {
        const result = await runAgents({
          agentId: "langflow-demo",
          prompt: "Prepare a concise investor demo brief from current GENIUS workspace evidence, risks, approvals, reports, and proof trails.",
        });
        toast.success(result?.runtime?.configured
          ? "Langflow Demo Agent saved a Workbench brief."
          : "Langflow Demo Agent saved a fallback Workbench brief.");
        onNavigate?.("chat", {
          source: "command-center-langflow-demo",
          artifactId: result?.artifact?.id || null,
          agentId: "langflow-demo",
        });
        return;
      }

      await updateAgentRunStatus({
        id: agent.id,
        agentId: agent.agentId,
        status,
        note: "Updated from Command Center live operations.",
      });
      toast.success(`${agent.name || "Agent run"} marked ${status}.`);
    } catch (error) {
      toast.error(error.message || "Agent run could not be updated.");
    }
  }

  function navigateToDecision(item) {
    onNavigate?.("approvals", {
      actionId: item.actionId || item.id,
      findingId: item.findingId || null,
      evidenceId: item.evidenceId || null,
      source: "command-center-decision",
    });
  }

  function navigateToIssue(item) {
    if (item.actionId) {
      onNavigate?.("approvals", {
        actionId: item.actionId,
        findingId: item.findingId || null,
        evidenceId: item.evidenceId || null,
        source: "command-center-attention",
      });
      return;
    }

    if (item.findingId) {
      onNavigate?.("savings", {
        findingId: item.findingId,
        evidenceId: item.evidenceId || null,
        source: "command-center-attention",
      });
      return;
    }

    onNavigate?.("diagnostics", {
      category: item.impactType || item.issue,
      source: "command-center-attention",
    });
  }

  function navigateToSystem(system) {
    const name = String(system?.name || "").toLowerCase();
    if (name.includes("connector") || name.includes("crm") || name.includes("erp") || name.includes("email")) {
      onNavigate?.("connectors", { connectorName: system.name, source: "command-center-system-health" });
      return;
    }
    onNavigate?.("diagnostics", { systemName: system?.name || null, source: "command-center-system-health" });
  }

  function navigateFromActivity(item) {
    if (item.type === "risk") {
      onNavigate?.("savings", { activityId: item.id, source: "command-center-activity" });
      return;
    }
    if (item.type === "success") {
      onNavigate?.("data", { activityId: item.id, source: "command-center-activity" });
      return;
    }
    onNavigate?.("chat", { activityId: item.id, source: "command-center-activity" });
  }

  function navigateFromKpi(kpi) {
    const label = String(kpi?.label || "").toLowerCase();
    if (label.includes("approval")) {
      onNavigate?.("approvals", { source: "command-center-kpi", metric: kpi.label });
      return;
    }
    if (label.includes("saving") || label.includes("risk") || label.includes("money")) {
      onNavigate?.("savings", { source: "command-center-kpi", metric: kpi.label });
      return;
    }
    if (label.includes("agent")) {
      onNavigate?.("chat", { source: "command-center-kpi", metric: kpi.label });
      return;
    }
    if (label.includes("data")) {
      onNavigate?.("data", { source: "command-center-kpi", metric: kpi.label });
      return;
    }
    onNavigate?.("diagnostics", { source: "command-center-kpi", metric: kpi.label });
  }

  function cycleActivityFilter() {
    setActivityFilter((value) => {
      if (value === "all") return "risk";
      if (value === "risk") return "success";
      if (value === "success") return "agent";
      return "all";
    });
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-up">

      {/* Tier 1: Executive KPI Row */}
      <ExecutiveKpiRow loading={loading} onOpenKpi={navigateFromKpi} />

      {/* Tier 2: Operations & Decisions (Legacy top) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[340px]">
        <div className="flex flex-col min-h-0">
          <RequiresAttentionPanel
            issues={displayedAttention}
            loading={loading}
            onReviewIssue={navigateToIssue}
            onViewAll={() => onNavigate?.("savings", { source: "command-center-attention" })}
          />
        </div>
        <div className="flex flex-col min-h-0">
          <DecisionQueuePanel
            items={displayedDecisions}
            loading={loading}
            onReviewDecision={navigateToDecision}
            onViewAll={() => onNavigate?.("approvals", { source: "command-center-decision-queue" })}
          />
        </div>
        <div className="flex flex-col min-h-0">
          <LiveAgentOperations
            agents={displayedAgents}
            loading={loading}
            busy={busy}
            canManage={hasWorkspaceAgents && can("run_agents")}
            onManage={() => onNavigate?.("chat")}
            onAudit={() => onNavigate?.("diagnostics")}
            onAgentStatusChange={handleAgentStatusChange}
          />
        </div>
      </div>

      {/* NEW ANALYTICS GRID - responsive 12-column structure */}

      {/* Desktop Top Row (Tier 3): 3 / 3 / 6 */}
      {/* Medium Desktop: 4 / 4 / 12 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col min-h-[300px]">
           <RiskExposureCard
             data={ccRiskExposure}
             loading={loading}
             onAnalyze={() => onNavigate?.("savings", { source: "command-center-risk-exposure" })}
             onOpenLevel={(item) => onNavigate?.("savings", { riskLevel: item.level, source: "command-center-risk-exposure" })}
           />
        </div>
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col min-h-[300px]">
           <ValueCapturedCard
             data={ccValueCaptured}
             loading={loading}
             onViewDetails={() => onNavigate?.("savings", { source: "command-center-value-captured" })}
             onOpenBreakdown={(item) => onNavigate?.("savings", { valueMetric: item.label, source: "command-center-value-captured" })}
           />
        </div>
        <div className="lg:col-span-12 xl:col-span-6 flex flex-col min-h-[300px]">
           <SystemHealthPanel
             systems={ccSystemHealth}
             loading={loading}
             onViewAll={() => onNavigate?.("diagnostics", { source: "command-center-system-health" })}
             onOpenSystem={navigateToSystem}
           />
        </div>
      </div>

      {/* Desktop Bottom Row (Tier 4): 7 / 5 */}
      {/* Medium Desktop: 7 / 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[380px] pb-4">
        <div className="lg:col-span-7 flex flex-col min-h-0">
          <EvidenceCoverageCard
            data={ccEvidenceCoverage}
            loading={loading}
            onViewMap={() => onNavigate?.("data", { source: "command-center-evidence-coverage" })}
            onOpenSourceType={(item) => onNavigate?.("data", { sourceType: item.label, source: "command-center-evidence-coverage" })}
          />
        </div>
        <div className="lg:col-span-5 flex flex-col min-h-0">
          <ActivityStreamPanel
            items={activityItems}
            loading={loading}
            onViewAll={() => onNavigate?.("diagnostics", { source: "command-center-activity" })}
            onOpenItem={navigateFromActivity}
            onFilter={cycleActivityFilter}
            filterLabel={activityFilterLabel}
          />
        </div>
      </div>

    </div>
  );
}
