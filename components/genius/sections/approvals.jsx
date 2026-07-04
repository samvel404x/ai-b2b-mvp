"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Check, X, Clock, ChevronDown, SlidersHorizontal, ArrowUpRight,
  ArrowDownRight, ExternalLink, Bot, FileText, ChevronLeft,
  ChevronRight, Maximize2, LayoutGrid, CheckCircle2, Circle,
  AlertCircle, Bold, Italic, Underline, Link2, List, ListOrdered,
} from "lucide-react";
import {
  approvalsKpis,
  approvalsQueue,
  approvalsDetail,
  approvalsInsights,
} from "@/lib/genius-data";
import { Ring, Sparkline, SeverityBadge, PageHeader } from "../shared";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// ── Tone helpers ──────────────────────────────────────────────────────────────
const toneText = {
  primary:  "text-primary",
  critical: "text-critical",
  warning:  "text-warning",
  evidence: "text-evidence",
  neutral:  "text-foreground",
};
const toneStroke = {
  primary:  "var(--primary)",
  critical: "var(--critical)",
  warning:  "var(--warning)",
  evidence: "var(--evidence)",
  neutral:  "var(--muted-foreground)",
};

const statusStyles = {
  "Urgent":   "bg-critical/12 text-critical border-critical/25",
  "Due soon": "bg-warning/12 text-warning border-warning/25",
  "Review":   "bg-evidence/10 text-evidence border-evidence/20",
  "Snoozed":  "bg-white/5 text-[#5a6660] border-white/8",
};

const tabList = ["Overview", "Evidence (12)", "Impact", "Timeline", "Related (4)"];

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ kpi, index }) {
  const trendUp   = kpi.trendDir === "up";
  const trendDown = kpi.trendDir === "down";
  const confColor = kpi.confidence === "High" ? "text-primary" : kpi.confidence === "Medium" ? "text-warning" : "text-critical";
  return (
    <div
      className={cn(
        "group relative flex flex-col gap-2 overflow-hidden rounded-xl border border-[#ffffff08] bg-[#0a0c0b] p-3 transition-all duration-200 hover:border-[#1a2820] hover:bg-[#0d0f0e] animate-fade-up",
        `stat-accent-${kpi.tone}`,
      )}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-center gap-2">
        <Ring value={kpi.ring} size={36} stroke={toneStroke[kpi.tone]} />
        <div className="min-w-0">
          <p className="text-[10px] font-medium text-[#4a5450] leading-snug truncate">{kpi.label}</p>
          <p className={cn("text-base font-bold tabular leading-tight", toneText[kpi.tone])}>{kpi.value}</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-1">
        <span className={cn(
          "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular",
          trendUp ? "bg-primary/10 text-primary" : trendDown ? "bg-critical/10 text-critical" : "text-[#5a6660]",
        )}>
          {trendUp   && <ArrowUpRight   className="size-2.5" />}
          {trendDown && <ArrowDownRight className="size-2.5" />}
          {kpi.trend}
        </span>
        <span className={cn("text-[10px] font-semibold", confColor)}>
          {kpi.confidence}
        </span>
      </div>
      <Sparkline data={kpi.spark} stroke={toneStroke[kpi.tone]} className="h-6" />
      <div
        className="pointer-events-none absolute -right-4 -top-4 size-12 rounded-full blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: toneStroke[kpi.tone] + "20" }}
      />
    </div>
  );
}

// ── Donut Chart ───────────────────────────────────────────────────────────────
function DonutChart({ segments, size = 96 }) {
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={10} />
      {segments.map((seg, i) => {
        const dash  = (seg.pct / 100) * circ;
        const gap   = circ - dash;
        const el = (
          <circle
            key={i}
            cx={size/2} cy={size/2} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={10}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
            style={{ transition: "stroke-dashoffset 700ms ease" }}
          />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
}

// ── Insights section ──────────────────────────────────────────────────────────
function InsightsSection() {
  const { byCategory, byOwner, byUrgency } = approvalsInsights;
  return (
    <section className="rounded-xl border border-[#ffffff08] bg-[#0a0c0b] animate-fade-up" style={{ animationDelay: "120ms" }}>
      <header className="border-b border-[#ffffff06] px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Approval insights</h2>
      </header>
      <div className="grid grid-cols-1 gap-0 divide-y divide-[#ffffff06] sm:grid-cols-3 sm:divide-x sm:divide-y-0">

        {/* By category */}
        <div className="flex flex-col gap-3 p-4">
          <p className="text-xs font-medium text-[#4a5450]">Approvals by category</p>
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <DonutChart segments={byCategory} size={88} />
            </div>
            <ul className="flex flex-col gap-1.5">
              {byCategory.map((c) => (
                <li key={c.label} className="flex items-center gap-2 text-xs">
                  <span className="size-2 shrink-0 rounded-full" style={{ background: c.color }} />
                  <span className="text-[#5a6660]">{c.label}</span>
                  <span className="ml-auto font-semibold text-foreground tabular">{c.value} ({c.pct}%)</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* By owner */}
        <div className="flex flex-col gap-3 p-4">
          <p className="text-xs font-medium text-[#4a5450]">By owner</p>
          <ul className="flex flex-col gap-2">
            {byOwner.map((o) => (
              <li key={o.label} className="flex items-center gap-2 text-xs">
                <span className="w-24 shrink-0 truncate text-[#5a6660]">{o.label}</span>
                <div className="flex-1 overflow-hidden rounded-full bg-white/5 h-1.5">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700"
                    style={{ width: `${(o.value / o.max) * 100}%` }}
                  />
                </div>
                <span className="w-4 text-right font-semibold text-foreground tabular">{o.value}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* By urgency */}
        <div className="flex flex-col gap-3 p-4">
          <p className="text-xs font-medium text-[#4a5450]">By urgency</p>
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <DonutChart segments={byUrgency} size={88} />
            </div>
            <ul className="flex flex-col gap-1.5">
              {byUrgency.map((u) => (
                <li key={u.label} className="flex items-center gap-2 text-xs">
                  <span className="size-2 shrink-0 rounded-full" style={{ background: u.color }} />
                  <span className="text-[#5a6660]">{u.label}</span>
                  <span className="ml-auto font-semibold text-foreground tabular">{u.value} ({u.pct}%)</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

      {/* System status bar */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-[#ffffff06] px-4 py-2.5 text-[11px]">
        {[
          { label: "System status", value: "All systems operational", tone: "primary" },
          { label: "Data pipeline", value: "Healthy", tone: "primary" },
          { label: "AI extraction", value: "Healthy", tone: "primary" },
          { label: "Agent runtime", value: "Healthy", tone: "primary" },
          { label: "Approval service", value: "Healthy", tone: "primary" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className="text-[#4a5450]">{s.label}</span>
            <span className="flex items-center gap-1 font-medium text-primary">
              <span className="size-1.5 rounded-full bg-primary" />
              {s.value}
            </span>
          </div>
        ))}
        <span className="ml-auto text-[#3a4040]">Last updated: 2m ago</span>
      </div>
    </section>
  );
}

// ── Approval detail panel ─────────────────────────────────────────────────────
function DetailPanel({ item, onClose }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [notes, setNotes]         = useState("");
  const [approved, setApproved]   = useState(false);
  const d = approvalsDetail;

  function handleApprove() {
    setApproved(true);
    toast.success("Approved", { description: `${item.title} approved and queued for execution.` });
  }
  function handleReject() {
    toast.error("Rejected", { description: `${item.title} has been rejected.` });
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[#ffffff08] bg-[#0a0c0b] h-full">

      {/* Panel header */}
      <header className="flex items-start justify-between gap-3 border-b border-[#ffffff06] px-4 py-3">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-foreground leading-snug truncate">{item.title}</span>
            <SeverityBadge level={item.priority} />
            <span className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
              "bg-critical/10 text-critical border-critical/25",
            )}>
              <AlertCircle className="size-2.5" />
              {item.urgency}
            </span>
          </div>
          <p className="text-[11px] text-[#4a5450]">
            {item.sub} &middot; Requested by {item.owner} ({item.ownerRole}) &middot; May 24, 2026 10:15 AM
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            className="flex items-center gap-1 rounded-md border border-[#ffffff10] px-2.5 py-1 text-[11px] text-[#5a6660] hover:bg-white/5 transition-colors"
          >
            Open <ChevronDown className="size-3" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-md text-[#5a6660] hover:bg-white/5 transition-colors"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-[#ffffff06] px-4 overflow-x-auto">
        {tabList.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "shrink-0 border-b-2 px-3 py-2.5 text-xs font-medium transition-colors",
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-[#5a6660] hover:text-foreground",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview body */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "Overview" && (
          <div className="flex flex-col gap-4 p-4">

            {/* Metrics grid */}
            <div className="grid grid-cols-3 gap-3">
              {/* Impact */}
              <div className="flex flex-col gap-0.5">
                <p className="text-[10px] font-medium text-[#4a5450] uppercase tracking-wide">Impact summary</p>
                <p className="text-xl font-bold tabular text-foreground">{d.estimatedImpact}</p>
                <p className="text-[10px] text-[#4a5450]">{d.impactSub}</p>
                <div className="mt-1 flex flex-col gap-0.5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-foreground">{d.roi}</span>
                    <span className="text-[10px] text-[#4a5450]">{d.roiSub}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-foreground">{d.reduction}</span>
                    <span className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                      "bg-critical/10 text-critical",
                    )}>{d.strategicPriority}</span>
                  </div>
                </div>
              </div>

              {/* Confidence ring */}
              <div className="flex flex-col items-center gap-1">
                <p className="text-[10px] font-medium text-[#4a5450] uppercase tracking-wide">Confidence</p>
                <Ring value={d.confidence} size={64} stroke="var(--primary)" />
                <span className="text-xs font-semibold text-primary">{d.confidenceLabel}</span>
                <button type="button" className="text-[10px] text-primary underline-offset-2 hover:underline">
                  How confidence is calculated
                </button>
              </div>

              {/* Evidence summary */}
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-medium text-[#4a5450] uppercase tracking-wide">Evidence summary</p>
                {[
                  { label: "Total documents", value: d.totalDocs },
                  { label: "Data sources",    value: d.dataSources },
                  { label: "Extracted facts", value: d.extractedFacts },
                  { label: "Completeness",    value: `${d.completeness}%` },
                ].map((m) => (
                  <div key={m.label} className="flex items-center justify-between text-xs">
                    <span className="text-[#5a6660]">{m.label}</span>
                    <span className="font-semibold text-foreground tabular">{m.value}</span>
                  </div>
                ))}
                <button type="button" className="mt-0.5 text-left text-[10px] text-primary underline-offset-2 hover:underline">
                  View all evidence →
                </button>
              </div>
            </div>

            {/* AI recommended action */}
            <div className="rounded-lg border border-[#ffffff08] bg-[#0d0f0e] p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <Bot className="size-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">AI recommended action</span>
              </div>
              <p className="text-xs leading-relaxed text-[#8a9490]">{d.recommendedAction}</p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-[#4a5450]">Rationale</p>
              <ul className="mt-1 flex flex-col gap-1">
                {d.rationale.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-[#8a9490]">
                    <Check className="mt-0.5 size-3 shrink-0 text-primary" />
                    {r}
                  </li>
                ))}
              </ul>
              <button type="button" className="mt-2 text-[11px] text-primary underline-offset-2 hover:underline">
                View full rationale →
              </button>
            </div>

            {/* Reviewer notes */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-foreground">Reviewer notes</p>
              <div className="rounded-lg border border-[#ffffff08] bg-[#0d0f0e] overflow-hidden">
                {/* Toolbar */}
                <div className="flex items-center gap-1 border-b border-[#ffffff06] px-2 py-1.5">
                  {[Bold, Italic, Underline, Link2, List, ListOrdered].map((Icon, i) => (
                    <button
                      key={i}
                      type="button"
                      className="flex size-6 items-center justify-center rounded text-[#5a6660] hover:bg-white/5 hover:text-foreground transition-colors"
                    >
                      <Icon className="size-3" />
                    </button>
                  ))}
                </div>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your notes, questions, or instructions for the agent..."
                  className="min-h-[72px] resize-none rounded-none border-0 bg-transparent text-xs text-[#8a9490] placeholder:text-[#3a4440] focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                {notes && (
                  <div className="border-t border-[#ffffff06] px-3 py-1.5 text-[10px] text-[#3a4040]">
                    Saved 2m ago
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleApprove}
                disabled={approved}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 text-xs"
              >
                <Check className="size-3.5" />
                {approved ? "Approved" : "Approve"}
              </Button>
              <Button
                onClick={handleReject}
                variant="destructive"
                className="gap-1.5 text-xs"
              >
                <X className="size-3.5" />
                Reject
              </Button>
              <Button variant="outline" className="gap-1.5 text-xs border-[#ffffff10] text-[#8a9490] hover:text-foreground hover:bg-white/5">
                <FileText className="size-3.5" />
                Edit details
              </Button>
              <Button variant="outline" className="gap-1.5 text-xs border-[#ffffff10] text-[#8a9490] hover:text-foreground hover:bg-white/5">
                <ExternalLink className="size-3.5" />
                Request more evidence
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="ghost" className="gap-1.5 text-xs text-[#5a6660] hover:text-foreground border border-[#ffffff08]">
                <Clock className="size-3.5" />
                Snooze
                <ChevronDown className="size-3" />
              </Button>
              <Button variant="ghost" className="gap-1.5 text-xs text-[#5a6660] hover:text-foreground border border-[#ffffff08]">
                <Check className="size-3.5" />
                Mark done
              </Button>
            </div>

            {/* Approval timeline */}
            <div>
              <p className="mb-3 text-xs font-semibold text-foreground">Approval timeline</p>
              <div className="relative">
                {/* Connector line */}
                <div className="absolute left-0 right-0 top-2.5 h-px bg-[#ffffff08]" />
                <div className="relative flex items-start justify-between gap-1 overflow-x-auto pb-1">
                  {d.timeline.map((step, i) => (
                    <div key={i} className="flex min-w-[72px] flex-col items-center gap-1.5 text-center">
                      <div className={cn(
                        "relative z-10 flex size-5 items-center justify-center rounded-full border-2",
                        step.done
                          ? "border-primary bg-primary text-primary-foreground"
                          : step.active
                          ? "border-primary bg-[#0a0c0b] shadow-[0_0_8px_rgba(74,222,128,0.4)]"
                          : "border-[#2a3430] bg-[#0a0c0b]",
                      )}>
                        {step.done && <Check className="size-2.5" />}
                        {step.active && <span className="size-1.5 rounded-full bg-primary animate-pulse" />}
                      </div>
                      <span className={cn(
                        "text-[9px] font-medium leading-tight",
                        step.active ? "text-primary" : step.done ? "text-foreground" : "text-[#3a4040]",
                      )}>{step.label}</span>
                      <span className="text-[9px] text-[#2a3430] leading-tight">{step.date}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <button type="button" className="text-[10px] text-primary underline-offset-2 hover:underline">
                  View full timeline →
                </button>
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  "bg-critical/10 text-critical",
                )}>
                  Approval SLA: {d.sla} · {d.slaRisk}
                </span>
              </div>
            </div>

          </div>
        )}

        {activeTab !== "Overview" && (
          <div className="flex items-center justify-center p-12 text-sm text-[#4a5450]">
            {activeTab} — coming soon
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Approvals() {
  const [selectedId, setSelectedId] = useState(approvalsQueue[0].id);
  const [checkedIds, setCheckedIds] = useState(new Set());
  const [activeTab,  setActiveTab]  = useState("All 24");
  const [page,       setPage]       = useState(1);
  const rowsPerPage = 10;
  const totalPages  = Math.ceil(approvalsQueue.length / rowsPerPage);

  const selected = approvalsQueue.find((r) => r.id === selectedId) || approvalsQueue[0];

  function toggleCheck(id) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const queueTabs = ["All 24", "Urgent 6", "Due Soon 7", "Mine 8", "By Agent", "By Impact"];

  return (
    <div className="flex h-[calc(100vh-6.5rem)] flex-col gap-4">
      <PageHeader
        title="Approvals"
        description="Human oversight for high-impact actions. You stay in control."
      />

      {/* ── KPI strip ── */}
      <div className="grid shrink-0 grid-cols-3 gap-2.5 sm:grid-cols-5 xl:grid-cols-9">
        {approvalsKpis.map((kpi, i) => (
          <KpiCard key={kpi.id} kpi={kpi} index={i} />
        ))}
      </div>

      {/* ── Main split: table + detail panel ── */}
  <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[1fr_420px]">
  
  {/* Left: Human decision queue */}
        <section className="flex flex-col overflow-hidden rounded-xl border border-[#ffffff08] bg-[#0a0c0b] animate-fade-up" style={{ animationDelay: "60ms" }}>

          {/* Queue header */}
          <header className="flex items-center justify-between gap-3 border-b border-[#ffffff06] px-4 py-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">Human decision queue</h2>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-bold text-primary">
                {approvalsQueue.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="flex items-center gap-1.5 rounded-md border border-[#ffffff10] px-2.5 py-1.5 text-[11px] text-[#5a6660] hover:bg-white/5 transition-colors">
                <SlidersHorizontal className="size-3" />
                Filters
              </button>
              <button type="button" className="flex items-center gap-1.5 rounded-md border border-[#ffffff10] px-2.5 py-1.5 text-[11px] text-[#5a6660] hover:bg-white/5 transition-colors">
                Sort: Due soonest
                <ChevronDown className="size-3" />
              </button>
              <button type="button" className="flex size-7 items-center justify-center rounded-md border border-[#ffffff10] text-[#5a6660] hover:bg-white/5 transition-colors">
                <LayoutGrid className="size-3.5" />
              </button>
            </div>
          </header>

          {/* Tab bar */}
          <div className="flex items-center gap-0 overflow-x-auto border-b border-[#ffffff06] px-4">
            {queueTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "shrink-0 border-b-2 px-3 py-2.5 text-xs font-medium transition-colors whitespace-nowrap",
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-[#5a6660] hover:text-foreground",
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="border-b border-[#ffffff06]">
                  <th className="px-4 py-2.5 text-left">
                    <Checkbox className="border-[#2a3430] data-[state=checked]:bg-primary" />
                  </th>
                  {["Action", "Impact", "Owner", "Evidence", "Proof trail", "Status", "Due", "Agent", "AI Confidence"].map((col) => (
                    <th key={col} className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[#4a5450] whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {approvalsQueue.map((row) => {
                  const isSelected = row.id === selectedId;
                  const confColor  = row.confidence >= 88 ? "text-primary" : row.confidence >= 75 ? "text-warning" : "text-critical";
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedId(row.id)}
                      className={cn(
                        "cursor-pointer border-b border-[#ffffff04] transition-colors hover:bg-[#0d1110]",
                        isSelected && "bg-primary/5 border-l-2 border-l-primary",
                      )}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={checkedIds.has(row.id)}
                          onCheckedChange={() => toggleCheck(row.id)}
                          className="border-[#2a3430] data-[state=checked]:bg-primary"
                        />
                      </td>

                      {/* Action */}
                      <td className="max-w-[180px] px-3 py-3">
                        <div className="flex items-start gap-2">
                          <SeverityBadge level={row.priority} />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-foreground leading-snug">{row.title}</p>
                            <p className="truncate text-[10px] text-[#4a5450]">{row.sub}</p>
                          </div>
                        </div>
                      </td>

                      {/* Impact */}
                      <td className="px-3 py-3">
                        <p className="text-xs font-bold tabular text-foreground">{row.impactStr}</p>
                        <p className="text-[10px] text-[#4a5450]">{row.impactSub}</p>
                      </td>

                      {/* Owner */}
                      <td className="px-3 py-3">
                        <p className="text-xs text-foreground whitespace-nowrap">{row.owner}</p>
                        <p className="text-[10px] text-[#4a5450]">{row.ownerRole}</p>
                      </td>

                      {/* Evidence */}
                      <td className="px-3 py-3 text-center">
                        <p className="text-xs font-semibold text-foreground">{row.evidenceDocs}</p>
                        <p className="text-[10px] text-[#4a5450]">docs</p>
                      </td>

                      {/* Proof trail */}
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toast(`Proof trail ${row.proofTrail}`); }}
                          className="flex items-center gap-1 text-[11px] font-medium text-evidence hover:text-evidence/70 transition-colors"
                        >
                          {row.proofTrail}
                          <ExternalLink className="size-2.5 opacity-60" />
                        </button>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3">
                        <span className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap",
                          statusStyles[row.status] || "bg-white/5 text-[#5a6660] border-white/8",
                        )}>
                          {row.status}
                        </span>
                      </td>

                      {/* Due */}
                      <td className="px-3 py-3">
                        <span className={cn(
                          "text-xs font-medium whitespace-nowrap",
                          row.dueUrgent ? "text-critical" : "text-[#5a6660]",
                        )}>
                          {row.due}
                        </span>
                      </td>

                      {/* Agent */}
                      <td className="px-3 py-3">
                        <p className="text-[11px] text-foreground whitespace-nowrap">{row.agent}</p>
                        <p className="text-[10px] text-[#4a5450]">{row.agentVer}</p>
                      </td>

                      {/* AI Confidence ring */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <Ring value={row.confidence} size={28} stroke={row.confidence >= 88 ? "var(--primary)" : row.confidence >= 75 ? "var(--warning)" : "var(--critical)"} />
                          <span className={cn("text-[11px] font-semibold tabular", confColor)}>{row.confidence}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between gap-3 border-t border-[#ffffff06] px-4 py-3">
            <p className="text-[11px] text-[#4a5450]">
              Showing 1 to {approvalsQueue.length} of 24 approvals
            </p>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={cn(
                    "flex size-6 items-center justify-center rounded text-[11px] font-medium transition-colors",
                    page === p
                      ? "bg-primary text-primary-foreground"
                      : "text-[#5a6660] hover:bg-white/5",
                  )}
                >
                  {p}
                </button>
              ))}
              <span className="px-1 text-[11px] text-[#4a5450]">...</span>
              <button
                type="button"
                className="flex size-6 items-center justify-center rounded text-[#5a6660] hover:bg-white/5 transition-colors"
              >
                <ChevronRight className="size-3.5" />
              </button>
              <div className="ml-2 flex items-center gap-1.5 text-[11px] text-[#4a5450]">
                10 / page
                <ChevronDown className="size-3" />
              </div>
            </div>
          </div>
        </section>

        {/* Right: Detail panel */}
        <DetailPanel item={selected} onClose={() => {}} />
      </div>

      {/* ── Insights ── */}
      <InsightsSection />
    </div>
  );
}
