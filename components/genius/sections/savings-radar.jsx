"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  ChevronLeft, ChevronRight, X, ExternalLink, CheckCircle2,
  SlidersHorizontal, Download, ChevronDown, BookOpen,
  BarChart2, Clock, Activity, Link2, Save, FileText,
  ArrowUpRight, Info, Bot, Zap, Shield,
} from "lucide-react";
import {
  savingsRadarKpis,
  savingsRadarOpportunities,
  savingsRadarTimeline,
  savingsRadarDetail,
} from "@/lib/genius-data";
import { Ring, Sparkline, ConfBar, EvidenceLink, SeverityBadge } from "../shared";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
const toneRingStroke = {
  primary:  "var(--primary)",
  critical: "var(--critical)",
  warning:  "var(--warning)",
  evidence: "var(--evidence)",
  neutral:  "var(--muted-foreground)",
};
const toneBg = {
  critical: "bg-critical/10 text-critical border-critical/20",
  warning:  "bg-warning/10 text-warning border-warning/20",
  primary:  "bg-primary/10 text-primary border-primary/20",
  evidence: "bg-evidence/10 text-evidence border-evidence/20",
};
const confColor = (v) => v >= 85 ? "text-primary" : v >= 70 ? "text-warning" : "text-critical";
const confBg    = (v) => v >= 85 ? "bg-primary"   : v >= 70 ? "bg-warning"   : "bg-critical";

function fileTypeColor(t) {
  if (t === "PDF")  return "bg-critical/15 text-critical";
  if (t === "XLSX") return "bg-primary/15 text-primary";
  return "bg-evidence/15 text-evidence";
}

// ── KPI strip card ────────────────────────────────────────────────────────────
function KpiCard({ kpi, index }) {
  const trendUp = kpi.trendDir === "up";
  const confidenceColor = kpi.confidence === "High" ? "text-primary" : kpi.confidence === "Medium" ? "text-warning" : "text-critical";
  return (
    <div
      className={cn(
        "group relative flex flex-col gap-2 overflow-hidden rounded-xl border border-[#ffffff08] bg-[#0a0c0b] p-3 transition-all duration-200 hover:border-[#1a2820] hover:bg-[#0d0f0e] animate-fade-up",
        `stat-accent-${kpi.tone}`,
      )}
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <Ring value={kpi.ring} size={36} stroke={toneRingStroke[kpi.tone]} />
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-[#4a5450] leading-snug truncate">{kpi.label}</p>
            <p className={cn("text-base font-bold tabular leading-tight", toneText[kpi.tone])}>{kpi.value}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-1">
        <span className={cn(
          "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular",
          trendUp ? "bg-primary/10 text-primary" : "bg-critical/10 text-critical",
        )}>
          <ArrowUpRight className="size-2.5" />
          {kpi.trend}
        </span>
        <span className={cn("text-[10px] font-semibold", confidenceColor)}>
          Confidence: {kpi.confidence}
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

// ── Row action state pill ─────────────────────────────────────────────────────
function ActionStatePill({ state }) {
  if (!state) return null;
  const styles = {
    "In progress": "bg-evidence/10 text-evidence border border-evidence/20",
    "Review":      "bg-warning/10 text-warning border border-warning/20",
    "Monitoring":  "bg-primary/10 text-primary border border-primary/20",
  };
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap", styles[state] || "bg-white/5 text-[#5a6660] border border-white/8")}>
      {state}
    </span>
  );
}

// ── Filter dropdown (display only) ───────────────────────────────────────────
function FilterChip({ label, children }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 rounded-md border border-[#ffffff10] bg-[#0d0f0e] px-2.5 py-1 text-[11px] font-medium text-[#8a9490] hover:bg-white/5 transition-colors whitespace-nowrap"
    >
      {label}
      <ChevronDown className="size-3 opacity-60" />
    </button>
  );
}

// ── Confidence badge ──────────────────────────────────────────────────────────
function ConfBadge({ value }) {
  const bg = value >= 85 ? "bg-primary/10 border-primary/25 text-primary" : value >= 70 ? "bg-warning/10 border-warning/25 text-warning" : "bg-critical/10 border-critical/25 text-critical";
  return (
    <span className={cn("inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-bold tabular", bg)}>
      {value}%
    </span>
  );
}

// ── Detail Panel ──────────────────────────────────────────────────────────────
const detailTabs = ["Overview", "Evidence", "Impact", "Timeline", "Activity", "Related"];

function DetailPanel({ detail, onClose }) {
  const [tab, setTab] = useState("Overview");

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[#ffffff08] bg-[#0a0c0b] animate-scale-in">
      {/* Panel header */}
      <div className="flex items-start justify-between gap-3 border-b border-[#ffffff06] px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-foreground truncate">{detail.title}</p>
            <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold", toneBg[detail.badgeTone])}>
              + {detail.badge}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button type="button" className="inline-flex items-center gap-1 rounded-md border border-[#ffffff10] bg-[#0d0f0e] px-2 py-1 text-[11px] text-[#8a9490] hover:bg-white/5">
            {detail.state} <ChevronDown className="size-3" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-md text-[#4a5450] hover:bg-white/5 hover:text-foreground transition-colors"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-[#ffffff06] px-4 overflow-x-auto scrollbar-thin">
        {detailTabs.map((t, i) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "shrink-0 px-3 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px",
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-[#5a6660] hover:text-foreground",
            )}
          >
            {t}{t === "Evidence" ? ` (${detail.supportingEvidence.length})` : ""}
            {t === "Related" ? " (4)" : ""}
          </button>
        ))}
      </div>

      {/* Panel body — scrollable */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {tab === "Overview" && (
          <div className="flex flex-col gap-4 p-4">
            {/* Top meta grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#3a4040]">Estimated impact</span>
                <span className="text-2xl font-bold text-foreground tabular">{detail.estimatedImpact}</span>
                <span className="text-[11px] text-[#4a5450]">{detail.impactSub}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#3a4040]">Confidence</span>
                <div className="flex items-center gap-2 pt-1">
                  <Ring value={detail.confidence} size={52} stroke="var(--primary)" />
                  <div>
                    <p className="text-sm font-bold text-foreground tabular">{detail.confidence}%</p>
                    <p className="text-[11px] text-primary font-semibold">{detail.confidenceLabel}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#3a4040]">Category</span>
                <span className="text-sm font-semibold text-foreground">{detail.category}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#3a4040]">Owner</span>
                <span className="text-sm font-semibold text-foreground">{detail.owner}</span>
                <span className="text-[11px] text-[#4a5450]">{detail.ownerRole}</span>
              </div>
              <div className="flex flex-col gap-0.5 col-span-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#3a4040]">Due date</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{detail.dueDate}</span>
                  <span className="rounded-full bg-critical/10 text-critical px-2 py-0.5 text-[11px] font-semibold">({detail.dueSub})</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-[#ffffff06]" />

            {/* Risk narrative + Impact breakdown */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="mb-1.5 text-xs font-semibold text-foreground">Risk narrative</p>
                <p className="text-[12px] leading-relaxed text-[#7a8480]">{detail.riskNarrative}</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-foreground">Impact breakdown</p>
                  <span className="text-[11px] text-[#4a5450]">Total: {detail.estimatedImpact}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {detail.impactBreakdown.map((row) => (
                    <div key={row.label} className="flex items-center gap-2">
                      <span className="w-24 shrink-0 text-[11px] text-[#5a6660]">{row.label}</span>
                      <div className="flex-1 h-2 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-700"
                          style={{ width: `${row.pct}%` }}
                        />
                      </div>
                      <span className="w-14 text-right text-[11px] font-semibold tabular text-foreground shrink-0">{row.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-[10px] text-[#3a4040] px-0.5 pt-1">
                    <span>$0</span><span>$1M</span><span>$2M</span><span>$3M</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-[#ffffff06]" />

            {/* Supporting evidence */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-foreground">Supporting evidence ({detail.supportingEvidence.length})</p>
                <button type="button" className="text-[11px] text-evidence hover:text-evidence/70 transition-colors">View all</button>
              </div>
              <div className="flex flex-col gap-2">
                {detail.supportingEvidence.map((ev) => (
                  <div key={ev.name} className="flex items-center gap-2.5 rounded-lg border border-[#ffffff06] bg-[#0d0f0e] p-2.5 hover:bg-white/[0.03] transition-colors">
                    <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold shrink-0", fileTypeColor(ev.type))}>
                      {ev.type}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-medium text-foreground">{ev.name}</p>
                      <p className="text-[10px] text-[#4a5450]">{ev.date} · {ev.size}</p>
                    </div>
                    <ExternalLink className="size-3 shrink-0 text-[#3a4040]" />
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-[#ffffff06]" />

            {/* Extracted facts */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-foreground">Extracted facts</p>
                <button type="button" className="text-[11px] text-evidence hover:text-evidence/70 transition-colors">
                  View all facts (18) →
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                {detail.extractedFacts.map((fact) => (
                  <div key={fact} className="flex items-start gap-2">
                    <CheckCircle2 className="size-3.5 shrink-0 mt-0.5 text-primary" />
                    <span className="text-[12px] text-[#7a8480]">{fact}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-[#ffffff06]" />

            {/* Recommended agent action */}
            <div>
              <p className="mb-2 text-xs font-semibold text-foreground">Recommended agent action</p>
              <div className="flex items-start gap-3 rounded-lg border border-[#ffffff08] bg-[#0d1210] p-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="size-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">{detail.recommendedAgent}</p>
                  {detail.recommendedAgentDesc.split("\n").map((line) => (
                    <p key={line} className="text-[11px] text-[#5a6660]">{line}</p>
                  ))}
                </div>
                <Button
                  size="sm"
                  className="shrink-0 h-7 px-3 text-[11px] bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => toast.success("Agent queued", { description: `${detail.recommendedAgent} is now processing` })}
                >
                  Run agent
                </Button>
              </div>
            </div>

            {/* Next actions */}
            <div>
              <p className="mb-1.5 text-xs font-semibold text-foreground">Next actions</p>
              <div className="flex flex-col gap-1.5">
                {detail.nextActions.map((a) => (
                  <div key={a} className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 shrink-0 text-primary" />
                    <span className="text-[12px] text-[#7a8480]">{a}</span>
                  </div>
                ))}
              </div>
              <button type="button" className="mt-2 text-[11px] text-evidence hover:text-evidence/70 transition-colors">
                View action plan →
              </button>
            </div>
          </div>
        )}

        {tab === "Evidence" && (
          <div className="flex flex-col gap-3 p-4">
            <p className="text-xs font-semibold text-foreground">Evidence files</p>
            {detail.supportingEvidence.map((ev) => (
              <div key={ev.name} className="flex items-center gap-3 rounded-lg border border-[#ffffff08] bg-[#0d0f0e] p-3 hover:bg-white/[0.03] transition-colors">
                <span className={cn("rounded px-2 py-1 text-[11px] font-bold shrink-0", fileTypeColor(ev.type))}>{ev.type}</span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{ev.name}</p>
                  <p className="text-xs text-[#4a5450]">{ev.date} · {ev.size}</p>
                </div>
                <button type="button" className="text-evidence hover:text-evidence/70">
                  <ExternalLink className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === "Impact" && (
          <div className="flex flex-col gap-4 p-4">
            <div>
              <p className="mb-3 text-xs font-semibold text-foreground">Impact breakdown — {detail.estimatedImpact} total</p>
              <div className="flex flex-col gap-3">
                {detail.impactBreakdown.map((row) => (
                  <div key={row.label} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground">{row.label}</span>
                      <span className="text-xs font-semibold tabular text-foreground">{row.value} ({row.pct}%)</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${row.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(tab === "Timeline" || tab === "Activity" || tab === "Related") && (
          <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-[#131614]">
              <Activity className="size-5 text-[#3a4040]" />
            </div>
            <p className="text-sm font-semibold text-foreground">{tab} data</p>
            <p className="text-xs text-[#4a5450] max-w-[180px]">Detailed {tab.toLowerCase()} information for this opportunity.</p>
          </div>
        )}
      </div>

      {/* Panel footer actions */}
      <div className="flex items-center justify-between gap-2 border-t border-[#ffffff06] px-4 py-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-[#ffffff10] bg-transparent text-[#8a9490] hover:bg-white/5 text-xs"
            onClick={() => toast.info("Proof trail opened")}
          >
            <Shield className="size-3.5 mr-1.5" />View proof trail
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-[#ffffff10] bg-transparent text-[#8a9490] hover:bg-white/5 text-xs"
            onClick={() => toast.info("Export started")}
          >
            <Download className="size-3.5 mr-1.5" />Export
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 border-[#ffffff10] bg-transparent text-[#8a9490] hover:bg-white/5 text-xs"
            onClick={() => toast.info("Opening AI chat...")}
          >
            <Zap className="size-3.5 mr-1.5 text-evidence" />Ask AI
          </Button>
          <Button
            size="sm"
            className="h-8 bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
            onClick={() => toast.success("Approval created", { description: "Sent to approval queue" })}
          >
            Create approval
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Timeline section ──────────────────────────────────────────────────────────
function TimelineSection() {
  const scrollRef = useRef(null);
  const scrollBy = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 220, behavior: "smooth" });
  };

  const toneIcon = { critical: "text-critical", warning: "text-warning", evidence: "text-evidence", primary: "text-primary" };
  const toneDot  = { critical: "bg-critical", warning: "bg-warning", evidence: "bg-evidence", primary: "bg-primary" };

  return (
    <div className="rounded-xl border border-[#ffffff08] bg-[#0a0c0b]">
      <div className="flex items-center justify-between border-b border-[#ffffff06] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">Newly detected opportunities this week</span>
          <button type="button" className="text-[#3a4040] hover:text-[#5a6660]"><Info className="size-3.5" /></button>
        </div>
        <button type="button" className="text-[11px] text-evidence hover:text-evidence/70 transition-colors whitespace-nowrap">
          View all timeline →
        </button>
      </div>

      {/* Timeline track */}
      <div className="relative px-4 pt-4 pb-2">
        <div className="flex items-center gap-0 overflow-hidden">
          {/* Track line */}
          <div className="absolute left-6 right-6 top-[28px] h-px bg-[#ffffff08]" />
          {savingsRadarTimeline.map((item, i) => (
            <div key={item.id} className="relative flex flex-1 flex-col items-center">
              <span className={cn("relative z-10 mb-1 size-3 rounded-full border-2 border-[#0a0c0b] transition-all", toneDot[item.tone])} />
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable cards */}
      <div className="relative px-2 pb-3">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 flex size-7 items-center justify-center rounded-full border border-[#ffffff10] bg-[#0d0f0e] text-[#5a6660] hover:bg-white/5 transition-colors"
        >
          <ChevronLeft className="size-3.5" />
        </button>
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-thin px-6 pb-1"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {savingsRadarTimeline.map((item, i) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-[200px] rounded-lg border border-[#ffffff08] bg-[#0d0f0e] p-3 hover:border-[#1a2820] transition-all cursor-pointer animate-fade-up"
              style={{ scrollSnapAlign: "start", animationDelay: `${i * 60}ms` }}
            >
              <div className={cn("mb-1.5 flex size-6 items-center justify-center rounded-full border", toneBg[item.tone])}>
                <BarChart2 className="size-3" />
              </div>
              <p className="text-[11px] font-semibold text-foreground leading-snug mb-1">{item.title}</p>
              <p className="text-[11px] font-bold text-primary tabular mb-1">{item.subtitle}</p>
              <p className="text-[10px] text-[#3a4040]">{item.date}</p>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 flex size-7 items-center justify-center rounded-full border border-[#ffffff10] bg-[#0d0f0e] text-[#5a6660] hover:bg-white/5 transition-colors"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const FILTER_LABELS = ["All Categories", "All Severity", "All Confidence", "All Owners", "All Approval States", "All Source Types"];
const PAGES_TOTAL = 5;

export default function SavingsRadar({ onNavigate }) {
  const [selectedRows, setSelectedRows]   = useState([]);
  const [allSelected, setAllSelected]     = useState(false);
  const [activeRow, setActiveRow]         = useState(savingsRadarOpportunities[0].id);
  const [detailOpen, setDetailOpen]       = useState(true);
  const [page, setPage]                   = useState(1);

  const rows = savingsRadarOpportunities;

  function toggleRow(id) {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }
  function toggleAll() {
    if (allSelected) { setSelectedRows([]); setAllSelected(false); }
    else             { setSelectedRows(rows.map((r) => r.id)); setAllSelected(true); }
  }
  function handleRowClick(id) {
    setActiveRow(id);
    setDetailOpen(true);
  }

  const activeOpportunity = rows.find((r) => r.id === activeRow);

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Savings Radar</h1>
        <p className="text-sm text-[#5a6660]">Find hidden leaks and savings opportunities backed by evidence.</p>
      </div>

      {/* KPI Strip — 8 cards */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 xl:grid-cols-8">
        {savingsRadarKpis.map((kpi, i) => (
          <KpiCard key={kpi.id} kpi={kpi} index={i} />
        ))}
      </div>

      {/* Main content: table + detail panel */}
      <div className={cn("grid gap-4", detailOpen ? "xl:grid-cols-[1fr_420px]" : "xl:grid-cols-1")}>
        {/* Opportunities table */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-[#ffffff08] bg-[#0a0c0b]">
          {/* Table header */}
          <div className="flex flex-col gap-3 border-b border-[#ffffff06] px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">Evidence-backed opportunities</p>
              <div className="flex items-center gap-2">
                <button type="button" className="inline-flex items-center gap-1 rounded-md border border-[#ffffff10] bg-[#0d0f0e] px-2.5 py-1 text-[11px] font-medium text-[#8a9490] hover:bg-white/5 transition-colors">
                  <Save className="size-3" />Save view
                  <ChevronDown className="size-3 opacity-60" />
                </button>
                <button
                  type="button"
                  onClick={() => toast.info("Exporting...")}
                  className="inline-flex items-center gap-1 rounded-md border border-[#ffffff10] bg-[#0d0f0e] px-2.5 py-1 text-[11px] font-medium text-[#8a9490] hover:bg-white/5 transition-colors"
                >
                  <Download className="size-3" />Export
                  <ChevronDown className="size-3 opacity-60" />
                </button>
                <button type="button" className="flex size-7 items-center justify-center rounded-md border border-[#ffffff10] bg-[#0d0f0e] text-[#5a6660] hover:bg-white/5 transition-colors">
                  <BookOpen className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Filters row */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-0.5">
              {FILTER_LABELS.map((f) => (
                <FilterChip key={f} label={f} />
              ))}
              <div className="ml-auto flex items-center gap-2 shrink-0">
                <button type="button" className="inline-flex items-center gap-1.5 rounded-md border border-[#ffffff10] bg-[#0d0f0e] px-2.5 py-1 text-[11px] font-medium text-[#8a9490] hover:bg-white/5 transition-colors">
                  <SlidersHorizontal className="size-3" />Filters
                </button>
                <button type="button" className="text-[11px] text-[#4a5450] hover:text-foreground transition-colors">Clear all</button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#ffffff06]">
                  <th className="px-4 py-2.5 w-8">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleAll}
                      aria-label="Select all"
                      className="border-[#ffffff15]"
                    />
                  </th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#3a4040] w-6">#</th>
                  {["Opportunity / Risk", "Category", "Severity", "Confidence", "Est. Impact", "Source evidence", "Proof trail", "Recommended agent action", "Owner"].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#3a4040] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const isActive   = row.id === activeRow && detailOpen;
                  const isSelected = selectedRows.includes(row.id);
                  return (
                    <tr
                      key={row.id}
                      onClick={() => handleRowClick(row.id)}
                      className={cn(
                        "border-b border-[#ffffff04] cursor-pointer transition-colors",
                        isActive   ? "bg-primary/5 border-l-2 border-l-primary"  : "hover:bg-white/[0.02]",
                        isSelected && !isActive && "bg-white/[0.03]",
                        i === rows.length - 1 && "border-b-0",
                      )}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleRow(row.id)}
                          aria-label={`Select ${row.title}`}
                          className="border-[#ffffff15]"
                        />
                      </td>
                      <td className="px-3 py-3 text-xs text-[#3a4040] tabular font-medium">{row.id}</td>
                      <td className="px-3 py-3 min-w-[200px] max-w-[240px]">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold text-foreground leading-snug">{row.title}</span>
                          <span className="text-[11px] text-[#4a5450]">{row.subtitle}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="text-[11px] text-[#5a6660]">{row.category}</span>
                      </td>
                      <td className="px-3 py-3">
                        <SeverityBadge level={row.severity} />
                      </td>
                      <td className="px-3 py-3">
                        <ConfBadge value={row.confidence} />
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={cn("text-sm font-bold tabular", row.impact < 0 ? "text-critical" : "text-foreground")}>
                          {row.impactStr}
                        </span>
                      </td>
                      <td className="px-3 py-3 max-w-[160px]">
                        <div className="flex flex-col gap-0.5">
                          <EvidenceLink>{row.evidenceLabel}</EvidenceLink>
                          <span className="text-[10px] text-[#3a4040]">{row.evidenceDate}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-evidence hover:text-evidence/70 transition-colors whitespace-nowrap"
                          onClick={(e) => { e.stopPropagation(); toast.info(`Proof trail ${row.proofTrail}`); }}
                        >
                          {row.proofTrail}
                          <ExternalLink className="size-2.5 opacity-50" />
                        </button>
                      </td>
                      <td className="px-3 py-3 max-w-[160px]">
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] text-[#5a6660]">{row.action}</span>
                          <span className="text-[10px] text-[#3a4040]">{row.actionSub}</span>
                          {row.actionState && <ActionStatePill state={row.actionState} />}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-[11px] text-[#5a6660] whitespace-nowrap">{row.owner}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div className="flex items-center justify-between border-t border-[#ffffff06] px-4 py-2.5">
            <span className="text-[11px] text-[#4a5450]">
              Showing 1 to {rows.length} of 47 opportunities
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex size-7 items-center justify-center rounded-md border border-[#ffffff10] bg-[#0d0f0e] text-[#5a6660] hover:bg-white/5 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="size-3.5" />
              </button>
              {Array.from({ length: PAGES_TOTAL }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-md text-[11px] font-medium transition-colors",
                    page === p
                      ? "bg-primary text-primary-foreground"
                      : "border border-[#ffffff10] bg-[#0d0f0e] text-[#5a6660] hover:bg-white/5",
                  )}
                >
                  {p}
                </button>
              ))}
              <span className="text-[#3a4040] text-xs px-1">...</span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(PAGES_TOTAL, p + 1))}
                disabled={page === PAGES_TOTAL}
                className="flex size-7 items-center justify-center rounded-md border border-[#ffffff10] bg-[#0d0f0e] text-[#5a6660] hover:bg-white/5 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="size-3.5" />
              </button>
              <div className="ml-2 flex items-center gap-1.5">
                <span className="text-[11px] text-[#4a5450]">Rows per page:</span>
                <button type="button" className="inline-flex items-center gap-1 rounded border border-[#ffffff10] bg-[#0d0f0e] px-2 py-0.5 text-[11px] text-[#8a9490]">
                  10 <ChevronDown className="size-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Detail panel */}
        {detailOpen && activeOpportunity && (
          <DetailPanel
            detail={savingsRadarDetail}
            onClose={() => setDetailOpen(false)}
          />
        )}
      </div>

      {/* Timeline */}
      <TimelineSection />
    </div>
  );
}
