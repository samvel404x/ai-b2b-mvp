"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Download,
  SlidersHorizontal,
  Check,
  X,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  LayoutGrid,
  Search,
  CheckCircle2,
  FileText,
  Clock,
  Maximize2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Bold, Italic, Underline, List, Type, PenTool, Link2, AlignLeft,
  Filter,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

import { approvalsKpis, approvalsQueue, approvalsDetail, approvalsInsights } from "@/lib/genius-data";
import { useWorkspace } from "../workspace-context";
import {
  Panel,
  SeverityBadge,
  ConfBar,
  Ring,
  Sparkline,
  StatusDot
} from "../shared";

const toneText = {
  primary: "text-primary", critical: "text-critical",
  evidence: "text-evidence", warning: "text-warning", neutral: "text-white",
};

const toneStroke = {
  primary: "var(--primary)", critical: "var(--critical)",
  evidence: "var(--evidence)", warning: "var(--warning)", neutral: "rgba(255,255,255,0.2)",
};

function formatMoney(value) {
  const numeric = Number(value || 0);
  return `$${Math.max(0, Math.round(numeric)).toLocaleString("en-US")}`;
}

function moneyValue(value) {
  return Number(String(value || "").replace(/[^\d.-]/g, "")) || 0;
}

function priorityForAction(action) {
  if (action.severity === "Critical" || action.impact >= 5000) return "High";
  if (action.severity === "High" || action.impact >= 1500) return "Medium";
  return "Low";
}

function statusForAction(action) {
  if (action.status === "Needs review") return action.impact >= 5000 ? "Urgent" : "Open";
  if (action.status === "Delegated") return "Delegated";
  return action.status || "Open";
}

function formatDecisionDate(value) {
  if (!value) return "Pending";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Pending";
  return date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function buildApprovalTimeline(item, fallback = []) {
  const history = Array.isArray(item?.decisionHistory) ? item.decisionHistory : [];
  if (history.length) {
    return history
      .slice(0, 6)
      .map((decision, index) => ({
        label: decision.status || "Decision",
        date: formatDecisionDate(decision.createdAt),
        done: index > 0,
        active: index === 0,
        note: decision.note || "",
        actor: decision.actor || "workspace user",
      }));
  }

  if (item?.backendAction) {
    return [
      { label: "Action created", date: formatDecisionDate(item.createdAt), done: true },
      { label: item.status || "Needs review", date: formatDecisionDate(item.lastDecisionAt), active: true },
      { label: "External execution", date: item.executionBlocked ? "Blocked" : "Pending", done: false },
    ];
  }

  return fallback;
}

function isMine(item) {
  return /founder|approval|owner/i.test(item?.owner || "");
}

function dueRank(item) {
  if (item?.dueUrgent) return 0;
  if (/today/i.test(item?.due || "")) return 1;
  if (/no sla/i.test(item?.due || "")) return 4;
  return 2;
}

function sortApprovalItems(items, mode) {
  return [...items].sort((left, right) => {
    if (mode === "impact") return moneyValue(right.impactStr) - moneyValue(left.impactStr);
    if (mode === "agent") return String(left.agent || "").localeCompare(String(right.agent || ""));
    if (mode === "confidence") return Number(right.confidence || 0) - Number(left.confidence || 0);

    const dueDelta = dueRank(left) - dueRank(right);
    if (dueDelta !== 0) return dueDelta;
    return moneyValue(right.impactStr) - moneyValue(left.impactStr);
  });
}

function agentLabel(agentId) {
  return {
    contract: "Contract Analyst",
    spend: "Spend Auditor",
    finance: "Finance Watcher",
    action: "Action Drafter",
  }[agentId] || "Genius Agent";
}

function mapBackendAction(action) {
  const priority = priorityForAction(action);

  return {
    id: action.id,
    priority,
    title: action.title || "Approve next step",
    sub: action.description || action.recommendedAction || "Approval-safe action prepared from confirmed evidence.",
    impactStr: formatMoney(action.impact),
    impactSub: action.category || "Workspace impact",
    owner: action.owner || "Founder approval",
    ownerRole: "Decision owner",
    evidenceDocs: action.evidenceId ? 1 : 0,
    evidenceId: action.evidenceId || null,
    evidenceName: action.evidenceName || null,
    findingId: action.findingId || null,
    proofTrail: action.proofTrailId || `trail:${String(action.findingId || action.id).slice(0, 8)}`,
    rationale: Array.isArray(action.rationale) ? action.rationale : [],
    status: statusForAction(action),
    rawStatus: action.status || "Needs review",
    reviewNote: action.reviewNote || "",
    decisionHistory: Array.isArray(action.decisionHistory) ? action.decisionHistory : [],
    lastDecisionAt: action.lastDecisionAt || null,
    lastDecisionBy: action.lastDecisionBy || null,
    createdAt: action.createdAt || null,
    updatedAt: action.updatedAt || null,
    delegatedTo: action.delegatedTo || "",
    snoozedUntil: action.snoozedUntil || null,
    executionBlocked: action.executionBlocked !== false,
    externalExecution: action.externalExecution || null,
    due: action.status === "Needs review" ? "Today pending" : "No SLA",
    dueUrgent: priority === "High",
    agent: agentLabel(action.agentId),
    agentVer: action.agentId || "workspace",
    confidence: Number(action.confidence || 0),
    urgency: priority === "High" ? "Urgent" : "Due soon",
    backendAction: true,
  };
}

function ApprovalPill({ state }) {
  const s = {
    Open: "text-white",
    "Needs evidence": "text-warning",
    "Needs review": "text-warning",
    "Due soon": "text-warning",
    Urgent: "text-critical",
    Review: "text-[#4EA1FF]",
    Ready: "text-primary",
    Approved: "text-primary",
    Rejected: "text-critical",
    Edited: "text-[#4EA1FF]",
    Delegated: "text-[#4EA1FF]",
    Snoozed: "text-[#4EA1FF]",
    Done: "text-primary",
  }[state] || "text-muted-foreground";

  return (
    <span className={cn("text-[10px] font-bold uppercase tracking-widest whitespace-nowrap", s)}>
      {state}
    </span>
  );
}

function KpiCard({ kpi, index }) {
  const trendUp = kpi.trendDir === "up";
  const trendDown = kpi.trendDir === "down";

  return (
    <div
      className="group relative flex flex-col gap-2 overflow-hidden rounded-xl border border-[#28313C] bg-[#0E1116] p-3 transition-all hover:bg-[#141A22] min-w-[160px] flex-1 animate-fade-up"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-center gap-2">
        <Ring value={kpi.ring} size={36} stroke={`var(--${kpi.tone})`} />
        <div className="flex flex-col gap-0 min-w-0">
          <span className="truncate text-[10px] font-semibold uppercase tracking-widest text-muted-foreground leading-snug">
            {kpi.label}
          </span>
          <span className="text-lg font-bold tabular-nums leading-tight text-white">
            {kpi.value}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-1 mt-1">
        <span
          className={cn(
            "flex items-center gap-0.5 text-[9px] font-semibold tabular-nums",
            trendUp ? "text-primary" : trendDown ? "text-critical" : "text-muted-foreground"
          )}
        >
          {trendUp && <ArrowUpRight className="size-3" />}
          {trendDown && <ArrowDownRight className="size-3" />}
          {kpi.trend}
        </span>
      </div>
    </div>
  );
}

function EvidenceLink({ children }) {
  return (
    <div className="flex items-center gap-1.5 cursor-pointer group">
      <FileText className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
      <span className="text-[11px] font-medium text-white group-hover:text-primary group-hover:underline transition-colors line-clamp-1">{children}</span>
    </div>
  )
}

function DetailPanel({
  item,
  onClose,
  onUpdateState,
  canDecide,
  isUpdating = false,
  onNavigate,
  onOpenEvidence,
  onOpenProofTrail,
  onLockedAction,
}) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [reviewNote, setReviewNote] = useState(item?.reviewNote || "");
  const d = approvalsDetail;
  const title = item?.backendAction ? item.title : d.title;
  const sub = item?.backendAction ? item.sub : d.sub;
  const estimatedImpact = item?.backendAction ? item.impactStr : d.estimatedImpact;
  const recommendedAction = item?.backendAction ? item.sub : d.recommendedAction;
  const confidence = item?.backendAction ? item.confidence : d.confidence;
  const rationaleItems = item?.backendAction && Array.isArray(item.rationale) && item.rationale.length ? item.rationale : d.rationale;
  const decisionTimeline = buildApprovalTimeline(item, d.timeline);
  const tabList = ["Overview", `Evidence (${item?.evidenceDocs || d.totalDocs || 0})`, "Impact", `Timeline (${decisionTimeline.length})`, "Related (4)"];
  const requestedBy = item?.backendAction ? item.owner : d.requestedBy;
  const requestedAt = item?.backendAction ? formatDecisionDate(item.createdAt) : d.requestedAt;
  const statusLabel = item?.status || d.urgency;
  const secondaryButtonClass = cn(
    "flex-1 flex items-center justify-center gap-2 rounded border border-[#28313C] bg-[#141A22] px-3 py-1.5 text-[10px] font-medium text-white transition-colors hover:bg-[#28313C]",
    (!canDecide || isUpdating) && "cursor-not-allowed opacity-50",
  );
  const smallActionClass = cn(
    "flex items-center gap-1.5 transition-colors hover:text-white",
    (!canDecide || isUpdating) && "cursor-not-allowed opacity-50 hover:text-muted-foreground",
  );

  const noteWithFallback = (fallback) => {
    const cleanNote = reviewNote.trim();
    return cleanNote || fallback;
  };

  const handleLocked = (label) => {
    if (onLockedAction) {
      onLockedAction(label);
      return;
    }
    toast.info(`${label} is locked until production approval tooling is enabled.`);
  };

  const handleStatusUpdate = async (status, fallbackNote, { close = false } = {}) => {
    if (!canDecide || isUpdating || !item?.id) return;
    const saved = await onUpdateState(item.id, status, noteWithFallback(fallbackNote), {
      delegateTo: status === "Delegated" ? item.owner || "Decision owner" : undefined,
      source: "approvals-detail",
    });
    if (saved && close) onClose();
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-[#28313C] bg-[#0E1116] overflow-hidden">
      {/* Header */}
      <div className="flex flex-col border-b border-[#28313C]">
        <div className="flex items-center justify-between px-5 py-4 shrink-0">
          <div className="flex flex-col gap-1.5 min-w-0 pr-2">
            <h3 className="text-sm font-semibold text-white truncate flex items-center gap-2">
              {title}
              <SeverityBadge level={d.badge} />
            </h3>
            <span className="text-[10px] text-muted-foreground">
              {sub}
            </span>
            <span className="text-[10px] text-muted-foreground mt-1">
              Requested by {requestedBy} - {requestedAt}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-start">
            <span className="flex items-center gap-1.5 rounded border border-critical/30 bg-critical/10 px-2 py-1 text-[10px] font-bold text-critical uppercase tracking-widest">
              <AlertCircle className="size-3" /> {statusLabel}
            </span>
            <button type="button" onClick={() => handleLocked("Approval panel fullscreen")} className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-[#28313C] hover:text-white transition-colors">
              <Maximize2 className="size-3.5" />
            </button>
            <button type="button" onClick={onClose} className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-[#28313C] hover:text-white transition-colors">
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 px-5 text-[11px] font-semibold shrink-0">
          {tabList.map(t => (
            <button
              type="button"
              key={t}
              onClick={() => setActiveTab(t.split(' ')[0])}
              className={cn(
                "pb-3 transition-colors relative",
                activeTab === t.split(' ')[0] ? "text-white" : "text-muted-foreground hover:text-white"
              )}
            >
              {t}
              {activeTab === t.split(' ')[0] && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t-full" />}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin flex flex-col">
        {activeTab === "Overview" && (
          <div className="flex flex-col gap-6 p-5">
            {/* Impact Summary Grid */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white">Impact summary</span>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <div className="flex flex-col gap-1">
                  <span className="text-xl font-bold text-white tabular-nums">{estimatedImpact}</span>
                  <span className="text-[10px] text-muted-foreground">{d.impactSub}</span>
                </div>
                <div className="flex flex-col gap-1 pl-4">
                  <span className="text-xl font-bold text-white tabular-nums">{d.roi}</span>
                  <span className="text-[10px] text-muted-foreground">{d.roiSub}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xl font-bold text-white tabular-nums">{d.reduction}</span>
                  <span className="text-[10px] text-muted-foreground">{d.reductionSub}</span>
                </div>
                <div className="flex flex-col gap-1 pl-4">
                  <span className="text-lg font-bold text-critical">{d.strategicPriority}</span>
                  <span className="text-[10px] text-muted-foreground">Strategic priority</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Confidence */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white">Confidence</span>
                <div className="flex flex-col items-center justify-center p-4 border border-[#28313C] rounded-lg bg-[#141A22]/50 gap-2">
                  <div className="relative flex size-16 items-center justify-center">
                     <svg viewBox="0 0 36 36" className="absolute inset-0 size-full -rotate-90">
                       <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                       <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--primary)" strokeWidth="3" strokeDasharray={`${confidence}, 100`} />
                     </svg>
                     <span className="text-lg font-bold text-white tabular-nums">{confidence}%</span>
                  </div>
                  <span className="text-[11px] font-bold text-primary">{d.confidenceLabel}</span>
                  <button type="button" onClick={() => onNavigate?.("diagnostics", { actionId: item?.id, findingId: item?.findingId, source: "approvals-confidence" })} className="text-[9px] text-primary hover:underline mt-1">How confidence is calculated</button>
                </div>
              </div>

              {/* Evidence Summary */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white">Evidence summary</span>
                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Total documents</span>
                    <span className="font-bold text-white tabular-nums">{d.totalDocs}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Data sources</span>
                    <span className="font-bold text-white tabular-nums">{d.dataSources}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Extracted facts</span>
                    <span className="font-bold text-white tabular-nums">{d.extractedFacts}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Completeness</span>
                    <span className="font-bold text-white tabular-nums">{d.completeness}%</span>
                  </div>
                  <button type="button" onClick={() => onOpenEvidence?.(item)} className="text-[10px] text-[#4EA1FF] hover:underline font-medium mt-1 text-left">View all evidence</button>
                </div>
              </div>
            </div>

            {/* AI Recommended Action */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white">AI recommended action</span>
              <p className="text-[11px] leading-relaxed text-muted-foreground">{recommendedAction}</p>
            </div>

            {/* Rationale */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white">Rationale</span>
              <div className="flex flex-col gap-2.5">
                {rationaleItems.map((r, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="text-[11px] text-muted-foreground leading-relaxed">{r}</span>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => onOpenProofTrail?.(item)} className="text-[10px] text-[#4EA1FF] hover:underline font-medium mt-1 text-left">View full rationale</button>
            </div>

            {/* Reviewer Notes */}
            <div className="flex flex-col gap-3 border-t border-[#28313C] pt-6">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white">Reviewer notes</span>
              <div className="flex flex-col rounded-md border border-[#28313C] bg-[#141A22]/50 overflow-hidden">
                <div className="flex items-center gap-1 border-b border-[#28313C] px-2 py-1.5 bg-[#0E1116]">
                  <button type="button" onClick={() => handleLocked("Rich text bold formatting")} className="p-1.5 text-muted-foreground hover:text-white rounded hover:bg-[#28313C]"><Bold className="size-3" /></button>
                  <button type="button" onClick={() => handleLocked("Rich text italic formatting")} className="p-1.5 text-muted-foreground hover:text-white rounded hover:bg-[#28313C]"><Italic className="size-3" /></button>
                  <button type="button" onClick={() => handleLocked("Rich text underline formatting")} className="p-1.5 text-muted-foreground hover:text-white rounded hover:bg-[#28313C]"><Underline className="size-3" /></button>
                  <div className="w-px h-3 bg-[#28313C] mx-1" />
                  <button type="button" onClick={() => handleLocked("Rich text alignment")} className="p-1.5 text-muted-foreground hover:text-white rounded hover:bg-[#28313C]"><AlignLeft className="size-3" /></button>
                  <button type="button" onClick={() => handleLocked("Rich text list formatting")} className="p-1.5 text-muted-foreground hover:text-white rounded hover:bg-[#28313C]"><List className="size-3" /></button>
                  <div className="w-px h-3 bg-[#28313C] mx-1" />
                  <button type="button" onClick={() => handleLocked("Approval note links")} className="p-1.5 text-muted-foreground hover:text-white rounded hover:bg-[#28313C]"><Link2 className="size-3" /></button>
                </div>
                <textarea
                  className="w-full bg-transparent p-3 text-[11px] text-white placeholder:text-muted-foreground outline-none resize-none min-h-[80px]"
                  placeholder="Add your notes, questions, or instructions for the agent..."
                  value={reviewNote}
                  onChange={(event) => setReviewNote(event.target.value)}
                />
                <div className="flex justify-end p-2 px-3 text-[9px] text-muted-foreground">
                  {reviewNote.trim() ? "Unsaved note" : item?.reviewNote ? "Saved review note" : "No note saved"}
                </div>
              </div>
            </div>

          </div>
        )}
        {activeTab === "Evidence" && (
          <div className="flex flex-col gap-4 p-5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white">Linked evidence</span>
            <div className="rounded-lg border border-[#28313C] bg-[#141A22]/40 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold text-white">{item?.evidenceName || item?.evidenceId || "No linked evidence record"}</span>
                  <span className="text-[10px] text-muted-foreground">{item?.evidenceDocs || 0} document{item?.evidenceDocs === 1 ? "" : "s"} attached to this approval.</span>
                </div>
                <button type="button" onClick={() => onOpenEvidence?.(item)} className="rounded border border-[#28313C] px-3 py-1.5 text-[10px] font-medium text-white transition-colors hover:bg-[#28313C]">
                  Open intake
                </button>
              </div>
            </div>
            <button type="button" onClick={() => onOpenProofTrail?.(item)} className="w-fit text-[10px] font-medium text-[#4EA1FF] hover:underline">
              Open proof chain in Reports
            </button>
          </div>
        )}
        {activeTab === "Impact" && (
          <div className="flex flex-col gap-4 p-5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white">Impact model</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-[#28313C] bg-[#141A22]/40 p-4">
                <span className="text-xl font-bold text-white tabular-nums">{estimatedImpact}</span>
                <p className="mt-1 text-[10px] text-muted-foreground">{item?.impactSub || d.impactSub}</p>
              </div>
              <div className="rounded-lg border border-[#28313C] bg-[#141A22]/40 p-4">
                <span className="text-xl font-bold text-white tabular-nums">{confidence}%</span>
                <p className="mt-1 text-[10px] text-muted-foreground">AI confidence from linked facts.</p>
              </div>
            </div>
            <button type="button" onClick={() => onNavigate?.("savings", { actionId: item?.id, findingId: item?.findingId, evidenceId: item?.evidenceId, source: "approvals-impact" })} className="w-fit text-[10px] font-medium text-[#4EA1FF] hover:underline">
              Open savings impact
            </button>
          </div>
        )}
        {activeTab === "Timeline" && (
          <div className="flex flex-col gap-4 p-5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white">Decision timeline</span>
            <div className="flex flex-col gap-2">
              {decisionTimeline.map((step, index) => (
                <div key={`${step.label}-${index}`} className="flex items-center justify-between rounded border border-[#28313C] bg-[#141A22]/40 px-3 py-2 text-[10px]">
                  <span className={step.done || step.active ? "text-white" : "text-muted-foreground"}>
                    {step.label}
                    {step.actor && <span className="ml-2 text-muted-foreground">by {step.actor}</span>}
                  </span>
                  <span className="text-muted-foreground">{step.date}</span>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => onNavigate?.("reports", { actionId: item?.id, proofTrailId: item?.proofTrail, source: "approvals-timeline" })} className="w-fit text-[10px] font-medium text-[#4EA1FF] hover:underline">
              View full timeline
            </button>
          </div>
        )}
        {activeTab === "Related" && (
          <div className="grid grid-cols-2 gap-3 p-5">
            {[
              { label: "Reports", section: "reports" },
              { label: "Savings", section: "savings" },
              { label: "Diagnostics", section: "diagnostics" },
              { label: "AI Chat", section: "chat" },
            ].map((target) => (
              <button
                key={target.section}
                type="button"
                onClick={() => onNavigate?.(target.section, { actionId: item?.id, findingId: item?.findingId, evidenceId: item?.evidenceId, source: "approvals-related" })}
                className="rounded-lg border border-[#28313C] bg-[#141A22]/40 p-4 text-left text-[11px] font-semibold text-white transition-colors hover:border-primary/40"
              >
                {target.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col border-t border-[#28313C] bg-[#080A0E] shrink-0 p-4 gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleStatusUpdate("Approved", "Approved from Approvals detail.", { close: true })}
            disabled={!canDecide || isUpdating}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 rounded bg-primary/20 border border-primary/30 px-3 py-2 text-[11px] font-bold text-primary transition-colors hover:bg-primary/30",
              (!canDecide || isUpdating) && "cursor-not-allowed opacity-50",
            )}
          >
            <Check className="size-3.5" /> Approve
          </button>
          <button
            type="button"
            onClick={() => handleStatusUpdate("Rejected", "Rejected from Approvals detail.", { close: true })}
            disabled={!canDecide || isUpdating}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 rounded bg-critical/20 border border-critical/30 px-3 py-2 text-[11px] font-bold text-critical transition-colors hover:bg-critical/30",
              (!canDecide || isUpdating) && "cursor-not-allowed opacity-50",
            )}
          >
            <X className="size-3.5" /> Reject
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleStatusUpdate("Edited", "Reviewer note saved from Approvals detail.")}
            disabled={!canDecide || isUpdating}
            className={secondaryButtonClass}
          >
            <PenTool className="size-3 text-muted-foreground" /> Save review note
          </button>
          <button
            type="button"
            onClick={() => handleStatusUpdate("Needs evidence", "Requested more evidence from Approvals detail.")}
            disabled={!canDecide || isUpdating}
            className={secondaryButtonClass}
          >
            <FileText className="size-3 text-muted-foreground" /> Request more evidence
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 mt-1 text-[10px] text-muted-foreground font-medium">
          <button
            type="button"
            onClick={() => handleStatusUpdate("Snoozed", "Snoozed from Approvals detail.")}
            disabled={!canDecide || isUpdating}
            className={smallActionClass}
          >
            <Clock className="size-3" /> Snooze
          </button>
          <button
            type="button"
            onClick={() => handleStatusUpdate("Delegated", `Delegated to ${item?.owner || "decision owner"} for follow-up.`)}
            disabled={!canDecide || isUpdating}
            className={smallActionClass}
          >
            <ArrowRight className="size-3" /> Delegate
          </button>
          <button
            type="button"
            onClick={() => handleStatusUpdate("Needs review", "Reopened from Approvals detail.")}
            disabled={!canDecide || isUpdating}
            className={smallActionClass}
          >
            <RefreshCw className="size-3" /> Reopen
          </button>
          <button
            type="button"
            onClick={() => handleStatusUpdate("Done", "Marked done from Approvals detail.", { close: true })}
            disabled={!canDecide || isUpdating}
            className={smallActionClass}
          >
            <CheckCircle2 className="size-3" /> Mark done
          </button>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="flex flex-col border-t border-[#28313C] bg-[#0E1116] shrink-0 p-5">
        <div className="flex flex-col gap-4">
          <span className="text-[11px] font-semibold text-white">Approval timeline</span>
          <div className="relative flex items-start justify-between">
            <div className="absolute left-2 right-2 top-[7px] h-px bg-[#28313C]" />
            <div className="absolute left-2 right-1/2 top-[7px] h-px bg-primary" />

            {decisionTimeline.map((step, idx) => (
              <div key={idx} className="relative flex flex-col items-center flex-1 z-10 px-1 group cursor-default">
                <div className={cn(
                  "flex size-3.5 items-center justify-center rounded-full border border-[#0E1116] mb-2",
                  step.done ? "bg-primary" : step.active ? "bg-[#4EA1FF] shadow-[0_0_8px_rgba(78,161,255,0.5)]" : "bg-[#28313C]"
                )}>
                  {step.active && <div className="size-1.5 rounded-full bg-white" />}
                </div>
                <div className="text-center flex flex-col gap-0.5 items-center max-w-[60px]">
                  <span className={cn("text-[9px] font-medium line-clamp-2 leading-tight", step.active || step.done ? "text-white" : "text-muted-foreground")}>{step.label}</span>
                  <span className="text-[8px] text-muted-foreground line-clamp-1">{step.date}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-[10px] mt-2">
            <button type="button" onClick={() => onNavigate?.("reports", { actionId: item?.id, proofTrailId: item?.proofTrail, source: "approvals-full-timeline" })} className="text-[#4EA1FF] hover:underline font-medium flex items-center gap-1">View full timeline <ArrowRight className="size-3" /></button>
            <div className="flex items-center gap-2 text-muted-foreground">
              Approval SLA: {d.sla} <span className="rounded bg-warning/20 border border-warning/30 px-1.5 py-0.5 font-bold text-warning uppercase tracking-widest">{d.slaRisk}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Approvals({ onNavigate, focusContext }) {
  const { actions, metrics, updateAction, exportAudit, can } = useWorkspace();
  const canDecideApprovals = can("decide_approvals");
  const canExportData = can("export_data");
  const backendItems = useMemo(() => actions.map(mapBackendAction), [actions]);
  const [localItems, setLocalItems] = useState(approvalsQueue);
  const [filter, setFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(approvalsQueue[0].id);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingActionId, setUpdatingActionId] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortMode, setSortMode] = useState("due");
  const items = backendItems.length ? backendItems : localItems;
  const approvalKpis = useMemo(() => {
    if (!actions.length) return approvalsKpis;

    const open = actions.filter((action) => !["Approved", "Rejected", "Done"].includes(action.status)).length;
    const approved = actions.filter((action) => action.status === "Approved").length;
    const highImpact = actions.filter((action) => Number(action.impact || 0) >= 5000).length;
    const avgConfidence = Math.round(actions.reduce((sum, action) => sum + Number(action.confidence || 0), 0) / actions.length);

    return [
      { id: "open", label: "Open approvals", value: String(open), trend: `${approved} approved`, trendDir: "flat", tone: open ? "warning" : "primary", ring: Math.min(100, open * 12) },
      { id: "impact", label: "Approval exposure", value: formatMoney(metrics?.moneyAtRisk || 0), trend: `${highImpact} high impact`, trendDir: highImpact ? "up" : "flat", tone: highImpact ? "critical" : "primary", ring: Math.min(100, highImpact * 20) },
      { id: "confidence", label: "AI confidence", value: `${avgConfidence}%`, trend: "Workspace average", trendDir: avgConfidence >= 70 ? "up" : "down", tone: avgConfidence >= 70 ? "primary" : "warning", ring: avgConfidence },
      { id: "audit", label: "Audit trail", value: String(actions.reduce((sum, action) => sum + (action.decisionHistory?.length || 0), 0)), trend: "Saved decisions", trendDir: "flat", tone: "evidence", ring: 100 },
    ];
  }, [actions, metrics]);

  const queueTabs = [
    { id: "All", label: `All ${items.length}` },
    { id: "Urgent", label: `Urgent ${items.filter((item) => item.urgency === "Urgent").length}` },
    { id: "Due soon", label: `Due Soon ${items.filter((item) => item.urgency === "Due soon").length}` },
    { id: "Mine", label: `Mine ${items.filter(isMine).length}` },
    { id: "By Agent", label: "By Agent", sortMode: "agent" },
    { id: "By Impact", label: "By Impact", sortMode: "impact" },
  ];

  const filteredItems = useMemo(() => {
    const scoped = items.filter((item) => {
      if (filter === "All" || filter === "By Agent" || filter === "By Impact") return true;
      if (filter === "Mine") return isMine(item);
      return item.priority === filter || item.urgency === filter;
    });

    const activeSort = filter === "By Agent" ? "agent" : filter === "By Impact" ? "impact" : sortMode;
    return sortApprovalItems(scoped, activeSort);
  }, [filter, items, sortMode]);

  const selectedItem = selectedId === null ? null : items.find((i) => i.id === selectedId) || items[0] || null;
  const validItemIds = useMemo(() => new Set(items.map((item) => item.id)), [items]);
  const activeSelectedIds = useMemo(
    () => selectedIds.filter((id) => validItemIds.has(id)),
    [selectedIds, validItemIds],
  );

  useEffect(() => {
    if (!focusContext?.actionId && !focusContext?.findingId && !focusContext?.evidenceId) return undefined;

    const timer = window.setTimeout(() => {
      const item = items.find((candidate) =>
        candidate.id === focusContext.actionId
        || candidate.findingId === focusContext.findingId
        || candidate.evidenceId === focusContext.evidenceId
      );

      if (!item) {
        toast.info("Linked approval is not available in this workspace yet.");
        return;
      }

      setSelectedId(item.id);
      toast.success(`Focused approval: ${item.title}`);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [focusContext?.actionId, focusContext?.evidenceId, focusContext?.findingId, focusContext?.token, items]);

  const updateState = async (id, newState, note, { silent = false, delegateTo, source = "approvals" } = {}) => {
    if (!canDecideApprovals) {
      toast.error("Approval decisions require decide approvals permission.");
      return false;
    }
    const item = items.find((candidate) => candidate.id === id);
    const now = new Date().toISOString();

    setUpdatingActionId(id);
    try {
      if (item?.backendAction) {
        await updateAction(id, newState, note || `Decision from Approvals screen: ${newState}`, {
          delegateTo,
          source,
        });
      }

      if (!item?.backendAction) {
        setLocalItems((prev) =>
          prev.map((candidate) => {
            if (candidate.id !== id) return candidate;
            const decision = {
              id: `local-decision-${now}`,
              status: newState,
              previousStatus: candidate.rawStatus || candidate.status || "Open",
              note: note || "",
              actor: "Local reviewer",
              source,
              delegateTo: newState === "Delegated" ? delegateTo || candidate.owner || "Decision owner" : "",
              createdAt: now,
            };

            return {
              ...candidate,
              status: newState,
              rawStatus: newState,
              reviewNote: note || candidate.reviewNote || "",
              lastDecisionAt: now,
              lastDecisionBy: "Local reviewer",
              delegatedTo: newState === "Delegated" ? delegateTo || candidate.owner || "Decision owner" : candidate.delegatedTo || "",
              snoozedUntil: newState === "Snoozed" ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : candidate.snoozedUntil || null,
              decisionHistory: [decision, ...(Array.isArray(candidate.decisionHistory) ? candidate.decisionHistory : [])].slice(0, 50),
            };
          })
        );
      }
      if (!silent) toast.success(`Marked as ${newState}`);
      return true;
    } catch (error) {
      toast.error(error.message || "Approval update failed");
      return false;
    } finally {
      setUpdatingActionId(null);
    }
  };

  const handleOpenProofTrail = (item) => {
    if (!item) return;

    if (item.backendAction) {
      toast.success(`${item.proofTrail} is linked to ${item.evidenceName || "workspace evidence"}. Opening report proof chain.`);
      onNavigate?.("reports", {
        actionId: item.id,
        findingId: item.findingId,
        evidenceId: item.evidenceId,
        proofTrailId: item.proofTrail,
        source: "approvals",
      });
      return;
    }

    toast.info(`${item.proofTrail} belongs to the demo queue. Opening Reports for proof coverage.`);
    onNavigate?.("reports", { proofTrailId: item.proofTrail, source: "approvals" });
  };

  const handleOpenEvidence = (item) => {
    if (!item?.evidenceId) {
      toast.info("This action does not have a linked evidence record yet.");
      return;
    }

    toast.success(`Opening evidence source: ${item.evidenceName || item.evidenceId}`);
    onNavigate?.("data", {
      evidenceId: item.evidenceId,
      actionId: item.id,
      findingId: item.findingId,
      source: "approvals",
    });
  };

  const handleLockedAction = (label) => {
    toast.info(`${label} is locked until production approval tooling is enabled.`);
  };

  const toggleCurrentPageSelection = () => {
    if (paginatedItemIds.length === 0) return;

    setSelectedIds((previous) => {
      const pageIds = new Set(paginatedItemIds);
      const isPageSelected = paginatedItemIds.every((id) => previous.includes(id));
      if (isPageSelected) return previous.filter((id) => !pageIds.has(id));
      return Array.from(new Set([...previous, ...paginatedItemIds]));
    });
  };

  const toggleItemSelection = (id, checked) => {
    setSelectedIds((previous) => {
      if (checked) return Array.from(new Set([...previous, id]));
      return previous.filter((candidate) => candidate !== id);
    });
  };

  const handleBulkUpdate = async (status, note) => {
    if (!canDecideApprovals) {
      toast.error("Approval decisions require decide approvals permission.");
      return;
    }

    const selected = items.filter((item) => activeSelectedIds.includes(item.id));
    if (!selected.length) {
      toast.info("Select approvals first.");
      return;
    }

    let savedCount = 0;
    setUpdatingActionId("__bulk__");
    try {
      for (const item of selected) {
        const saved = await updateState(item.id, status, note, { silent: true });
        if (saved) savedCount += 1;
      }
      setSelectedIds([]);
      toast.success(`${savedCount} approval${savedCount === 1 ? "" : "s"} marked as ${status}.`);
    } finally {
      setUpdatingActionId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedItems = filteredItems.slice((safeCurrentPage - 1) * rowsPerPage, safeCurrentPage * rowsPerPage);
  const paginatedItemIds = paginatedItems.map((item) => item.id);
  const selectedOnPage = paginatedItemIds.filter((id) => activeSelectedIds.includes(id));
  const allPageItemsSelected = paginatedItemIds.length > 0 && selectedOnPage.length === paginatedItemIds.length;
  const somePageItemsSelected = selectedOnPage.length > 0 && !allPageItemsSelected;

  return (
    <div className="scrollbar-thin flex h-full flex-col gap-6 overflow-y-auto p-6 pb-2">
      {/* Header */}
      <header className="flex flex-col gap-1 shrink-0">
        <h1 className="text-2xl font-semibold text-white">Approvals</h1>
        <p className="text-[11px] text-muted-foreground">Human oversight for high-impact actions. You stay in control.</p>
      </header>

      {/* KPI Strip */}
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-thin pb-2 shrink-0">
        {approvalKpis.map((kpi, i) => (
          <KpiCard key={kpi.id} kpi={kpi} index={i} />
        ))}
      </div>

      <div className="flex gap-6 items-start relative pb-8">
        {/* Main List */}
        <div className="flex flex-col flex-1 rounded-xl border border-[#28313C] bg-[#0E1116] overflow-hidden min-w-0">
          <div className="flex items-center justify-between border-b border-[#28313C] px-5 py-4 shrink-0">
            <div className="flex items-center gap-6">
              <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">Human decision queue <span className="text-muted-foreground font-normal normal-case text-[10px]">{items.length}</span></h3>
              <div className="flex items-center gap-6 text-[11px] font-semibold">
                {queueTabs.map((tab) => (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => {
                      setFilter(tab.id);
                      if (tab.sortMode) setSortMode(tab.sortMode);
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "transition-colors relative pb-4 -mb-4",
                      filter === tab.id
                        ? "text-white"
                        : "text-muted-foreground hover:text-white"
                    )}
                  >
                    {tab.label}
                    {filter === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t-full" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button type="button" onClick={() => { setFilter("All"); setSortMode("due"); setCurrentPage(1); }} className="flex items-center gap-1.5 rounded border border-[#28313C] bg-transparent px-3 py-1.5 text-[10px] text-white hover:bg-[#141A22] transition-colors">
                <Filter className="size-3 text-muted-foreground" /> Reset filters
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!canExportData) {
                    toast.error("Audit export requires export data permission.");
                    return;
                  }
                  exportAudit("csv");
                }}
                disabled={!canExportData}
                className={cn(
                  "flex items-center gap-1.5 rounded border border-[#28313C] bg-transparent px-3 py-1.5 text-[10px] text-white hover:bg-[#141A22] transition-colors",
                  !canExportData && "cursor-not-allowed opacity-50",
                )}
              >
                <Download className="size-3 text-muted-foreground" /> Export audit
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1.5 rounded border border-[#28313C] bg-transparent px-3 py-1.5 text-[10px] text-muted-foreground hover:bg-[#141A22] transition-colors">
                  Sort: {sortMode === "impact" ? "Highest impact" : sortMode === "agent" ? "Agent" : sortMode === "confidence" ? "AI confidence" : "Due soonest"} <ChevronDown className="size-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 border-[#28313C] bg-[#0E1116] text-muted-foreground">
                  <DropdownMenuItem onClick={() => { setSortMode("due"); setFilter((previous) => previous === "By Agent" || previous === "By Impact" ? "All" : previous); }} className="text-[11px] focus:bg-[#28313C] focus:text-white">Due soonest</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortMode("impact"); setFilter((previous) => previous === "By Agent" ? "All" : previous); }} className="text-[11px] focus:bg-[#28313C] focus:text-white">Highest impact</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortMode("agent"); setFilter((previous) => previous === "By Impact" ? "All" : previous); }} className="text-[11px] focus:bg-[#28313C] focus:text-white">Agent</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortMode("confidence"); setFilter((previous) => previous === "By Agent" || previous === "By Impact" ? "All" : previous); }} className="text-[11px] focus:bg-[#28313C] focus:text-white">AI confidence</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <button type="button" onClick={() => handleLockedAction("Approval grid layout switching")} className="flex size-7 items-center justify-center rounded border border-[#28313C] text-muted-foreground hover:bg-[#141A22] hover:text-white transition-colors ml-1">
                <LayoutGrid className="size-3.5" />
              </button>
            </div>
          </div>

          {activeSelectedIds.length > 0 && (
            <div className="flex items-center justify-between border-b border-[#28313C] bg-[#080A0E] px-5 py-2 text-[10px]">
              <span className="font-semibold text-white">{activeSelectedIds.length} selected</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBulkUpdate("Approved", "Bulk approved from Approvals queue.")}
                  disabled={!canDecideApprovals || updatingActionId === "__bulk__"}
                  className="rounded border border-primary/30 bg-primary/10 px-3 py-1.5 font-semibold text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Approve selected
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkUpdate("Needs evidence", "Bulk requested more evidence from Approvals queue.")}
                  disabled={!canDecideApprovals || updatingActionId === "__bulk__"}
                  className="rounded border border-warning/30 bg-warning/10 px-3 py-1.5 font-semibold text-warning transition-colors hover:bg-warning/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Request evidence
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkUpdate("Delegated", "Bulk delegated from Approvals queue.")}
                  disabled={!canDecideApprovals || updatingActionId === "__bulk__"}
                  className="rounded border border-[#4EA1FF]/30 bg-[#4EA1FF]/10 px-3 py-1.5 font-semibold text-[#4EA1FF] transition-colors hover:bg-[#4EA1FF]/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Delegate selected
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkUpdate("Rejected", "Bulk rejected from Approvals queue.")}
                  disabled={!canDecideApprovals || updatingActionId === "__bulk__"}
                  className="rounded border border-critical/30 bg-critical/10 px-3 py-1.5 font-semibold text-critical transition-colors hover:bg-critical/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reject selected
                </button>
                <button type="button" onClick={() => setSelectedIds([])} className="rounded border border-[#28313C] px-3 py-1.5 font-semibold text-muted-foreground transition-colors hover:bg-[#141A22] hover:text-white">
                  Clear
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left text-[10px]">
              <thead className="sticky top-0 z-10 border-b border-[#28313C] bg-[#0E1116]">
                <tr>
                  <th className="px-4 py-3 font-semibold w-10 text-center">
                    <Checkbox
                      aria-label={allPageItemsSelected ? "Clear current page approvals" : "Select current page approvals"}
                      className="border-[#28313C] data-[state=checked]:bg-primary data-[state=checked]:text-black"
                      checked={allPageItemsSelected ? true : somePageItemsSelected ? "indeterminate" : false}
                      onCheckedChange={toggleCurrentPageSelection}
                    />
                  </th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-widest text-muted-foreground w-16">Action</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-widest text-muted-foreground w-[280px]"></th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-widest text-muted-foreground">Impact</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-widest text-muted-foreground">Owner</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-widest text-muted-foreground">Evidence</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-widest text-muted-foreground">Proof trail</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-widest text-muted-foreground text-center">Status</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-widest text-muted-foreground">Due</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-widest text-muted-foreground">Agent</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-widest text-muted-foreground text-center">AI Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#28313C]/50">
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-muted-foreground">
                      No approvals match this view.
                    </td>
                  </tr>
                ) : paginatedItems.map((item, i) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      "group animate-fade-up cursor-pointer transition-colors hover:bg-white/[0.02]",
                      selectedId === item.id && "bg-white/[0.05] border-l-2 border-l-primary border-r-0 border-y-[#28313C]"
                    )}
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        aria-label={`Select approval ${item.id}`}
                        className="border-[#28313C] data-[state=checked]:bg-primary data-[state=checked]:text-black"
                        checked={activeSelectedIds.includes(item.id)}
                        onCheckedChange={(checked) => toggleItemSelection(item.id, checked === true)}
                      />
                    </td>
                    <td className="px-3 py-3.5">
                      <span className={cn("rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap",
                          item.priority === "High" ? "border-critical/30 bg-critical/10 text-critical" :
                          item.priority === "Medium" ? "border-warning/30 bg-warning/10 text-warning" :
                          "border-[#28313C] bg-[#141A22] text-muted-foreground"
                        )}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 max-w-[280px]">
                      <div className="flex flex-col gap-0.5 pr-4">
                        <span className="font-semibold text-white truncate text-[11px]">
                          {item.title}
                        </span>
                        <span className="truncate text-[9px] text-muted-foreground">
                          {item.sub}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-white tabular-nums text-[11px]">
                          {item.impactStr}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          {item.impactSub}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-white text-[11px]">
                          {item.owner}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          {item.ownerRole}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleOpenEvidence(item);
                          }}
                          className="w-fit font-bold text-white tabular-nums text-[11px] transition-colors hover:text-primary"
                        >
                          {item.evidenceDocs}
                        </button>
                        <span className="text-[9px] text-muted-foreground">docs</span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                       <button
                         type="button"
                         onClick={(event) => {
                           event.stopPropagation();
                           handleOpenProofTrail(item);
                         }}
                         className="flex items-center gap-1 text-[10px] font-medium text-[#4EA1FF] hover:underline whitespace-nowrap"
                       >
                         {item.proofTrail} <ArrowUpRight className="size-3" />
                       </button>
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <ApprovalPill state={item.status} />
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={cn("text-[10px]", item.dueUrgent ? "text-critical font-semibold" : "text-white")}
                        >
                          {item.due.split(' ')[0]} {item.due.split(' ')[1] === "overdue" ? "overdue" : ""}
                        </span>
                        {item.due.split(' ').length > 2 && <span className="text-[9px] text-muted-foreground">{item.due.split(' ').slice(1).join(' ')}</span>}
                        {item.due.split(' ').length === 2 && item.due.split(' ')[1] !== "overdue" && <span className="text-[9px] text-muted-foreground">{item.due.split(' ')[1]}</span>}
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-white text-[11px]">
                          {item.agent}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          {item.agentVer}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 flex justify-center">
                      <div className="relative flex size-8 items-center justify-center">
                         <svg viewBox="0 0 36 36" className="absolute inset-0 size-full -rotate-90">
                           <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                           <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--primary)" strokeWidth="4" strokeDasharray={`${item.confidence}, 100`} />
                         </svg>
                         <span className="text-[9px] font-bold leading-none text-white tabular-nums">{item.confidence}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-[#28313C] px-5 py-3 text-[10px] text-muted-foreground shrink-0 bg-[#0E1116]">
            {filteredItems.length > 0 ? (
              <span>Showing {(safeCurrentPage - 1) * rowsPerPage + 1} to {Math.min(safeCurrentPage * rowsPerPage, filteredItems.length)} of {filteredItems.length} approvals</span>
            ) : (
              <span>No approvals match this view</span>
            )}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={safeCurrentPage === 1} className="flex size-6 items-center justify-center rounded hover:bg-[#28313C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="size-3" /></button>
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const page = idx + 1;
                  return (
                    <button
                      type="button"
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn("flex size-6 items-center justify-center rounded transition-colors hover:bg-[#28313C] hover:text-white", safeCurrentPage === page ? "border border-[#28313C] bg-[#141A22] text-white" : "")}
                    >
                      {page}
                    </button>
                  )
                })}
                <button type="button" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={safeCurrentPage === totalPages} className="flex size-6 items-center justify-center rounded hover:bg-[#28313C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronRight className="size-3" /></button>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 font-medium text-white bg-transparent rounded px-2 py-1 transition-colors hover:bg-[#28313C]">
                    {rowsPerPage} / page <ChevronDown className="size-3 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-16 min-w-0 border-[#28313C] bg-[#0E1116] text-muted-foreground">
                    {[10, 15].map(num => (
                      <DropdownMenuItem key={num} onClick={() => { setRowsPerPage(num); setCurrentPage(1); }} className="text-[11px] focus:bg-[#28313C] focus:text-white">{num}</DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Approval Insights */}
          <div className="flex flex-col border-t border-[#28313C] shrink-0 bg-[#080A0E]">
            <div className="px-5 py-4 flex flex-col gap-5">
              <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">Approval insights</h3>
              <div className="grid grid-cols-3 gap-8">
                {/* By Category */}
                <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-semibold text-white">Approvals by category</span>
                  <div className="flex items-center gap-6">
                    <div className="relative flex size-20 shrink-0">
                      <svg viewBox="0 0 36 36" className="size-full -rotate-90">
                        {approvalsInsights.byCategory.map((item, i) => {
                          const offset = approvalsInsights.byCategory.slice(0, i).reduce((sum, previous) => sum + previous.pct, 0);
                          return <path key={i} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={item.color} strokeWidth="6" strokeDasharray={`${item.pct}, 100`} strokeDashoffset={`-${offset}`} />;
                        })}
                      </svg>
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      {approvalsInsights.byCategory.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-[9px]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-white truncate">{item.label}</span>
                          </div>
                          <span className="text-muted-foreground tabular-nums shrink-0">{item.value} ({item.pct}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* By Owner */}
                <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-semibold text-white">By owner</span>
                  <div className="flex flex-col gap-2">
                    {approvalsInsights.byOwner.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-[9px]">
                        <span className="text-muted-foreground w-20 truncate">{item.label}</span>
                        <div className="flex-1 h-1.5 bg-[#28313C] rounded-full overflow-hidden flex items-center">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${(item.value / item.max) * 100}%` }} />
                        </div>
                        <span className="text-white tabular-nums font-bold w-4 text-right">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* By Urgency */}
                <div className="flex flex-col gap-4 pl-4 border-l border-[#28313C]">
                  <span className="text-[10px] font-semibold text-white">By urgency</span>
                  <div className="flex items-center gap-6">
                    <div className="relative flex size-20 shrink-0">
                      <svg viewBox="0 0 36 36" className="size-full -rotate-90">
                        {approvalsInsights.byUrgency.map((item, i) => {
                          const offset = approvalsInsights.byUrgency.slice(0, i).reduce((sum, previous) => sum + previous.pct, 0);
                          return <path key={i} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={item.color} strokeWidth="6" strokeDasharray={`${item.pct}, 100`} strokeDashoffset={`-${offset}`} />;
                        })}
                      </svg>
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      {approvalsInsights.byUrgency.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-[9px]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-white truncate">{item.label}</span>
                          </div>
                          <span className="text-muted-foreground tabular-nums shrink-0">{item.value} ({item.pct}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Detail Panel */}
        {selectedItem && (
          <div className="w-[440px] shrink-0 animate-fade-left sticky top-0 h-[calc(100vh-140px)]">
            <DetailPanel
              key={selectedItem.id}
              item={selectedItem}
              onClose={() => setSelectedId(null)}
              onUpdateState={updateState}
              canDecide={canDecideApprovals}
              isUpdating={updatingActionId === selectedItem.id}
              onNavigate={onNavigate}
              onOpenEvidence={handleOpenEvidence}
              onOpenProofTrail={handleOpenProofTrail}
              onLockedAction={handleLockedAction}
            />
          </div>
        )}
      </div>
    </div>
  );
}
