"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Check,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  FileText,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Share2,
  Shield,
  Sparkles,
} from "lucide-react";
import {
  reportsKpis,
  reportsLibrary,
  reportsDetail,
  reportsSummaryPanel,
} from "@/lib/genius-data";
import { PageHeader, Panel, Ring, Sparkline } from "../shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Tone helpers ──────────────────────────────────────────────────────────────
const toneText = {
  primary: "text-primary", critical: "text-critical",
  evidence: "text-evidence", warning: "text-warning", muted: "text-[#5a6660]",
};
const toneStroke = {
  primary: "var(--primary)", critical: "var(--critical)",
  evidence: "var(--evidence)", warning: "var(--warning)", muted: "#5a6660",
};
const toneBg = {
  primary: "bg-primary/10 text-primary border-primary/20",
  critical: "bg-critical/10 text-critical border-critical/20",
  evidence: "bg-evidence/10 text-evidence border-evidence/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  muted: "bg-white/5 text-[#5a6660] border-white/8",
};
const severityStyle = {
  High:   "bg-critical/10 text-critical border border-critical/20",
  Medium: "bg-warning/10 text-warning border border-warning/20",
  Low:    "bg-white/5 text-[#5a6660] border border-white/8",
};
const statusStyle = {
  "Board-ready": "bg-primary/10 text-primary border border-primary/20",
  "In review":   "bg-evidence/10 text-evidence border border-evidence/20",
  "Draft":       "bg-white/5 text-[#5a6660] border border-white/8",
};
const iconColor = {
  risk:    "bg-critical/10 text-critical",
  savings: "bg-primary/10 text-primary",
  renewal: "bg-warning/10 text-warning",
  history: "bg-evidence/10 text-evidence",
  summary: "bg-white/8 text-[#5a6660]",
};

// ── KPI Strip ─────────────────────────────────────────────────────────────────
function KpiCard({ kpi, index }) {
  const trendUp = kpi.trendDir === "up";
  const trendDown = kpi.trendDir === "down";
  return (
    <div
      className="relative flex flex-col gap-2 overflow-hidden rounded-xl border border-[#ffffff08] bg-[#0a0c0b] p-3.5 animate-fade-up hover:border-[#1a2820] transition-all duration-200 group"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* accent line */}
      <div className={cn("absolute inset-x-0 top-0 h-px", {
        "bg-primary/60": kpi.tone === "primary",
        "bg-critical/60": kpi.tone === "critical",
        "bg-warning/60": kpi.tone === "warning",
        "bg-evidence/60": kpi.tone === "evidence",
      })} />
      <span className="text-[10px] font-medium text-[#4a5450] leading-snug">{kpi.label}</span>
      <div className={cn("text-[22px] font-semibold tabular leading-none tracking-tight", toneText[kpi.tone])}>
        {kpi.value}
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className={cn(
          "inline-flex items-center gap-0.5 text-[10px] font-medium",
          trendUp ? "text-primary" : trendDown ? "text-critical" : "text-[#5a6660]",
        )}>
          {trendUp && <ArrowUpRight className="size-2.5" />}
          {trendDown && <ArrowDownRight className="size-2.5" />}
          <span>{kpi.trend}</span>
        </span>
      </div>
      {kpi.spark && (
        <div className="h-6">
          <Sparkline data={kpi.spark} stroke={toneStroke[kpi.tone]} />
        </div>
      )}
    </div>
  );
}

// ── Report Library Card ───────────────────────────────────────────────────────
function LibraryCard({ report, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex flex-col gap-2 rounded-xl border p-3.5 text-left transition-all duration-200 animate-fade-up",
        active
          ? "border-primary/30 bg-primary/5 shadow-[0_0_0_1px_rgba(31,214,114,0.15)]"
          : "border-[#ffffff08] bg-[#0a0c0b] hover:border-[#1a2820] hover:bg-[#0d0f0e]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={cn("flex size-8 items-center justify-center rounded-lg shrink-0", iconColor[report.icon])}>
          <FileText className="size-3.5" />
        </div>
        <div className="flex gap-1 shrink-0">
          {report.formats.map((f) => (
            <span key={f} className={cn(
              "rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wide border",
              f === "PDF"  ? "bg-critical/10 text-critical border-critical/20" :
              f === "XLSX" ? "bg-primary/10 text-primary border-primary/20" :
                             "bg-[#1a1f1d] text-[#5a6660] border-[#ffffff08]",
            )}>{f}</span>
          ))}
        </div>
      </div>
      <div>
        <div className={cn("text-sm font-semibold leading-snug", active ? "text-primary" : "text-foreground")}>
          {report.name}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={cn("inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold border", statusStyle[report.status])}>
            {report.status === "Board-ready" && <Check className="size-2.5" />}
            {report.status}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-[#4a5450] truncate">{report.period}</span>
        <span className="text-[10px] text-[#3a4040] shrink-0">Updated {report.updated}</span>
      </div>
    </button>
  );
}

// ── SVG Donut ─────────────────────────────────────────────────────────────────
function Donut({ segments, size = 120, label, subLabel }) {
  const r = (size - 12) / 2;
  const c = size / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const total = segments.reduce((a, s) => a + s.pct, 0) || 100;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={10} />
        {segments.map((seg, i) => {
          const dash = (seg.pct / total) * circumference;
          const gap  = circumference - dash;
          const el = (
            <circle
              key={i}
              cx={c} cy={c} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={10}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              style={{ transition: "stroke-dashoffset 800ms cubic-bezier(0.16,1,0.3,1)", filter: `drop-shadow(0 0 3px ${seg.color}50)` }}
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && <span className="text-base font-bold tabular text-foreground leading-none">{label}</span>}
        {subLabel && <span className="text-[9px] text-[#4a5450] mt-0.5">{subLabel}</span>}
      </div>
    </div>
  );
}

// ── Executive Summary Tab ─────────────────────────────────────────────────────
function ExecutiveSummaryTab({ detail }) {
  return (
    <div className="flex flex-col gap-4 animate-fade-up">
      {/* Summary description */}
      <p className="text-sm leading-relaxed text-[#7d857f]">{detail.description}</p>

      {/* Stats strip */}
      <div className="grid grid-cols-5 gap-2">
        {detail.summaryStats.map((s, i) => (
          <div
            key={s.label}
            className="flex flex-col gap-1.5 rounded-lg border border-[#ffffff08] bg-[#0a0c0b] p-3 animate-fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="text-[10px] text-[#4a5450] leading-snug">{s.label}</span>
            {s.ring !== undefined ? (
              <div className="flex items-center gap-2">
                <Ring value={s.ring} size={44} stroke="var(--evidence)" />
                <span className={cn("text-base font-bold tabular", toneText[s.tone])}>{s.value}</span>
              </div>
            ) : (
              <span className={cn("text-xl font-bold tabular leading-none", toneText[s.tone])}>{s.value}</span>
            )}
            <span className={cn(
              "inline-flex items-center gap-0.5 text-[9px] font-medium",
              s.trendDir === "up" ? "text-primary" : s.trendDir === "down" ? "text-critical" : "text-[#5a6660]",
            )}>
              {s.trendDir === "up"   && <ArrowUpRight className="size-2.5" />}
              {s.trendDir === "down" && <ArrowDownRight className="size-2.5" />}
              {s.trend}
            </span>
          </div>
        ))}
      </div>

      {/* Top findings + Risk exposure */}
      <div className="grid grid-cols-2 gap-4">
        {/* Top findings */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">Top findings</span>
            <button type="button" className="flex items-center gap-0.5 text-[11px] text-evidence hover:text-evidence/70 transition-colors" onClick={() => toast.success("Viewing all findings...")}>
              View all findings <ChevronRight className="size-3" />
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            {detail.topFindings.map((f, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 rounded-lg border border-[#ffffff08] bg-[#0a0c0b] p-2.5 hover:border-[#1a2820] transition-colors animate-fade-up"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <span className={cn("mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold", severityStyle[f.severity])}>
                  {f.severity}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-foreground truncate">{f.title}</div>
                  <div className="text-[10px] text-[#4a5450] truncate">{f.sub}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-bold tabular text-foreground">{f.value}</div>
                  <div className="text-[9px] text-[#4a5450]">{f.valueSub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk exposure */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">Risk exposure by category</span>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-[#ffffff08] bg-[#0a0c0b] p-3">
            <Donut
              segments={detail.riskExposure.categories}
              size={100}
            />
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              {detail.riskExposure.categories.map((cat) => (
                <div key={cat.label} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="size-1.5 rounded-full shrink-0" style={{ background: cat.color }} />
                    <span className="text-[10px] text-[#7d857f] truncate">{cat.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-semibold tabular text-foreground">{cat.value}</span>
                    <span className="text-[9px] text-[#4a5450]">({cat.pct}%)</span>
                  </div>
                </div>
              ))}
              <div className="mt-1 border-t border-[#ffffff06] pt-1.5">
                <div className="text-[9px] text-[#4a5450]">Total at-risk exposure</div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold tabular text-critical">{detail.riskExposure.total}</span>
                  <span className="text-[9px] text-critical flex items-center gap-0.5">
                    <ArrowDownRight className="size-2.5" />{detail.riskExposure.totalTrend}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent approvals */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">Recent approvals included</span>
          <button type="button" className="flex items-center gap-0.5 text-[11px] text-evidence hover:text-evidence/70 transition-colors" onClick={() => toast.success("Viewing all approvals...")}>
            View all approvals <ChevronRight className="size-3" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {detail.recentApprovals.map((a, i) => (
            <div
              key={i}
              className="flex flex-col gap-1.5 rounded-lg border border-[#ffffff08] bg-[#0a0c0b] p-2.5 animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="text-[11px] font-medium text-foreground leading-snug line-clamp-2">{a.title}</span>
              <div className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-[#5a6660]" />
                <span className="text-[10px] text-[#5a6660] truncate">{a.owner}</span>
              </div>
              <span className="text-[9px] text-[#3a4040]">{a.date}</span>
              <span className="inline-flex items-center gap-1 self-start rounded-full border border-primary/20 bg-primary/8 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                <Check className="size-2.5" />{a.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Report Viewer (center panel) ──────────────────────────────────────────────
function ReportViewer({ report }) {
  const [activeTab, setActiveTab] = useState("Executive Summary");
  const detail = reportsDetail; // use detail data matched to first report

  return (
    <div className="flex flex-col gap-0 h-full overflow-hidden rounded-xl border border-[#ffffff08] bg-[#0a0c0b] animate-scale-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[#ffffff06] px-4 py-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">{report.name}</h2>
            <span className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold", statusStyle[report.status])}>
              {report.status === "Board-ready" && <Check className="size-2.5" />}
              {report.status}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[#4a5450]">
            <span>{detail.period}</span>
            <span className="size-0.5 rounded-full bg-[#3a4040]" />
            <span>Prepared {detail.prepared}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1 text-[10px] text-primary font-medium">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-1.5 animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
            </span>
            Auto-refresh
          </div>
          <button type="button" className="flex size-6 items-center justify-center rounded-md text-[#4a5450] hover:bg-white/5 hover:text-foreground transition-colors">
            <MoreHorizontal className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 border-b border-[#ffffff06] px-4 overflow-x-auto scrollbar-thin">
        {detail.tabs.map((tab) => {
          const count = detail.tabCounts[tab];
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-[11px] font-medium transition-colors",
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-[#5a6660] hover:text-[#8a9490]",
              )}
            >
              {tab}
              {count !== undefined && (
                <span className={cn(
                  "rounded-full px-1 py-0.5 text-[9px] font-bold tabular",
                  activeTab === tab ? "bg-primary/15 text-primary" : "bg-white/6 text-[#5a6660]",
                )}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        {activeTab === "Executive Summary" && <ExecutiveSummaryTab detail={detail} />}
        {activeTab !== "Executive Summary" && (
          <div className="flex flex-col items-center justify-center gap-3 py-12 animate-fade-in">
            <div className="flex size-10 items-center justify-center rounded-xl border border-[#ffffff08] bg-[#0d0f0e]">
              <Sparkles className="size-4 text-primary" />
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-foreground">{activeTab}</div>
              <div className="text-xs text-[#4a5450] mt-0.5">
                {detail.tabCounts[activeTab] !== undefined
                  ? `${detail.tabCounts[activeTab]} items`
                  : "Content loaded on demand"}
              </div>
            </div>
            <button
              type="button"
              onClick={() => toast.success(`Loading ${activeTab}...`)}
              className="rounded-lg border border-[#ffffff08] bg-[#0d0f0e] px-3 py-1.5 text-[11px] font-medium text-[#8a9490] hover:border-[#1a2820] hover:text-foreground transition-colors"
            >
              Load {activeTab}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Right Summary Panel ───────────────────────────────────────────────────────
function SummaryPanel() {
  const s = reportsSummaryPanel;
  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto scrollbar-thin animate-fade-up" style={{ animationDelay: "100ms" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Report Summary</span>
        <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/8 px-2 py-0.5 text-[9px] font-bold text-primary">
          <Check className="size-2.5" />Board-ready
        </span>
      </div>

      {/* Proof Coverage */}
      <div className="rounded-xl border border-[#ffffff08] bg-[#0a0c0b] p-3.5">
        <div className="text-[11px] font-semibold text-[#5a6660] mb-2.5">Proof coverage</div>
        <div className="flex items-center gap-3">
          <Ring value={s.proofCoverage} size={64} stroke="var(--primary)" label={`${s.proofCoverage}%`} />
          <div className="flex flex-col gap-1.5 flex-1">
            {s.proofCoverageItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-[#5a6660]">{item.label}</span>
                <span className="text-[10px] font-semibold tabular text-foreground">{item.value}</span>
              </div>
            ))}
            <button type="button" className="mt-0.5 flex items-center gap-0.5 text-[10px] text-evidence hover:text-evidence/70 transition-colors" onClick={() => toast.success("Viewing proof chain...")}>
              View proof chain <ChevronRight className="size-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Export report */}
      <div className="rounded-xl border border-[#ffffff08] bg-[#0a0c0b] p-3.5">
        <div className="text-[11px] font-semibold text-[#5a6660] mb-1">Export report</div>
        <p className="text-[10px] text-[#3a4040] mb-2.5 leading-relaxed">Choose a format to export this report pack.</p>
        <div className="flex flex-col gap-1.5">
          {[
            { ext: "PDF",      label: "Board-ready PDF",    color: "text-critical", bg: "bg-critical/10 border-critical/20" },
            { ext: "XLSX",     label: "Data workbook",       color: "text-primary",  bg: "bg-primary/10 border-primary/20"  },
            { ext: "MD",       label: "Structured notes",    color: "text-[#5a6660]",bg: "bg-white/5 border-white/8"         },
          ].map(({ ext, label, color, bg }) => (
            <button
              key={ext}
              type="button"
              onClick={() => toast.success(`Exporting ${ext}...`)}
              className="flex items-center gap-2.5 rounded-lg border border-[#ffffff08] bg-[#0d0f0e] px-2.5 py-2 text-left hover:border-[#1a2820] transition-colors group"
            >
              <span className={cn("flex size-6 items-center justify-center rounded-md border text-[9px] font-bold", color, bg)}>{ext}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium text-foreground">{ext}</div>
                <div className="text-[9px] text-[#4a5450]">{label}</div>
              </div>
              <Download className="size-3 text-[#3a4040] group-hover:text-[#5a6660] transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Board status */}
      <div className="rounded-xl border border-[#ffffff08] bg-[#0a0c0b] p-3.5">
        <div className="text-[11px] font-semibold text-[#5a6660] mb-2.5">Board status</div>
        <div className="flex flex-col gap-1.5">
          {[
            { label: "Readiness",     value: s.boardStatus.readiness,    valueClass: "text-primary" },
            { label: "Quality score", value: s.boardStatus.qualityScore,  valueClass: "text-foreground" },
            { label: "Last reviewed", value: s.boardStatus.lastReviewed,  valueClass: "text-[#8a9490]" },
            { label: "Next review",   value: s.boardStatus.nextReview,    valueClass: "text-[#8a9490]" },
          ].map(({ label, value, valueClass }) => (
            <div key={label} className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-[#4a5450]">{label}</span>
              <span className={cn("text-[10px] font-semibold tabular truncate max-w-[60%] text-right", valueClass)}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Included approvals */}
      <div className="rounded-xl border border-[#ffffff08] bg-[#0a0c0b] p-3.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-[#5a6660]">Included approvals</span>
          <button type="button" className="flex items-center gap-0.5 text-[10px] text-evidence hover:text-evidence/70 transition-colors" onClick={() => toast.success("Viewing all...")}>
            View all <ChevronRight className="size-3" />
          </button>
        </div>
        <div className="flex flex-col gap-1">
          {s.includedApprovals.map((a) => (
            <div key={a.label} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className={cn("size-1.5 rounded-full", {
                  "bg-primary":  a.tone === "primary",
                  "bg-evidence": a.tone === "evidence",
                  "bg-critical": a.tone === "critical",
                  "bg-[#3a4040]": a.tone === "muted",
                })} />
                <span className="text-[10px] text-[#5a6660]">{a.label}</span>
              </div>
              <span className="text-[10px] font-semibold tabular text-foreground">{a.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key risks */}
      <div className="rounded-xl border border-[#ffffff08] bg-[#0a0c0b] p-3.5">
        <div className="text-[11px] font-semibold text-[#5a6660] mb-2">Key risks to watch</div>
        <div className="flex flex-col gap-1.5">
          {s.keyRisks.map((r) => (
            <div key={r.label} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={cn("size-1.5 rounded-full shrink-0", r.tone === "critical" ? "bg-critical" : "bg-warning")} />
                <span className="text-[10px] text-[#5a6660] truncate">{r.label}</span>
              </div>
              <span className={cn("text-[10px] font-bold tabular shrink-0", r.tone === "critical" ? "text-critical" : "text-warning")}>{r.value}</span>
            </div>
          ))}
        </div>
        <button type="button" className="mt-2 flex items-center gap-0.5 text-[10px] text-evidence hover:text-evidence/70 transition-colors" onClick={() => toast.success("Viewing all risks...")}>
          View all risks <ChevronRight className="size-3" />
        </button>
      </div>

      {/* Report actions */}
      <div className="rounded-xl border border-[#ffffff08] bg-[#0a0c0b] p-3.5">
        <div className="text-[11px] font-semibold text-[#5a6660] mb-2.5">Report actions</div>
        <div className="flex flex-col gap-1.5">
          <Button className="w-full justify-start gap-2 h-8 text-[11px]" onClick={() => toast.success("Publishing pack...")}>
            <Plus className="size-3.5" />Publish pack
          </Button>
          {[
            { icon: Share2,   label: "Share link",       action: "Copying share link..." },
            { icon: Calendar, label: "Schedule report",  action: "Opening scheduler..." },
            { icon: Copy,     label: "Duplicate report", action: "Duplicating report..." },
          ].map(({ icon: Icon, label, action }) => (
            <button
              key={label}
              type="button"
              onClick={() => toast.success(action)}
              className="flex items-center gap-2 rounded-lg border border-[#ffffff08] bg-[#0d0f0e] px-2.5 py-1.5 text-[11px] font-medium text-[#8a9490] hover:border-[#1a2820] hover:text-foreground transition-colors"
            >
              <Icon className="size-3.5 text-[#4a5450]" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Report details */}
      <div className="rounded-xl border border-[#ffffff08] bg-[#0a0c0b] p-3.5">
        <div className="text-[11px] font-semibold text-[#5a6660] mb-2">Report details</div>
        <div className="flex flex-col gap-1.5">
          {[
            { label: "Report ID",      value: s.reportDetails.id, copy: true },
            { label: "Prepared by",    value: s.reportDetails.preparedBy },
            { label: "Data as of",     value: s.reportDetails.dataAsOf },
            { label: "Report period",  value: s.reportDetails.period },
            { label: "Included entities", value: s.reportDetails.entities },
          ].map(({ label, value, copy }) => (
            <div key={label} className="flex items-start justify-between gap-2">
              <span className="text-[10px] text-[#4a5450] shrink-0">{label}</span>
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-[10px] text-[#8a9490] text-right truncate">{value}</span>
                {copy && (
                  <button type="button" onClick={() => toast.success("Copied!")} className="text-[#3a4040] hover:text-[#5a6660] transition-colors shrink-0">
                    <Copy className="size-2.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Reports({ label }) {
  const [selectedReport, setSelectedReport] = useState(reportsLibrary[0]);

  return (
    <div className="flex h-[calc(100vh-6.5rem)] flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <PageHeader
          title="Reports / Board Reports"
          description="Board-ready reporting built from evidence, approvals, and proof trails."
        />
        <div className="flex items-center gap-2 shrink-0 pt-1">
          <button
            type="button"
            onClick={() => toast.success("Refreshing...")}
            className="flex items-center gap-1.5 rounded-lg border border-[#ffffff08] bg-[#0d0f0e] px-2.5 py-1.5 text-[11px] font-medium text-[#8a9490] hover:border-[#1a2820] hover:text-foreground transition-colors"
          >
            <RefreshCw className="size-3" />Refresh
            <Plus className="size-3 text-primary" />
          </button>
          <button
            type="button"
            onClick={() => toast.success("Publishing pack...")}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-[#03110a] hover:bg-primary/90 transition-colors"
          >
            <Shield className="size-3" />Publish pack
          </button>
          <button
            type="button"
            onClick={() => toast.success("Copying share link...")}
            className="flex items-center gap-1.5 rounded-lg border border-[#ffffff08] bg-[#0d0f0e] px-2.5 py-1.5 text-[11px] font-medium text-[#8a9490] hover:border-[#1a2820] hover:text-foreground transition-colors"
          >
            <Share2 className="size-3" />Share link
          </button>
          <button
            type="button"
            onClick={() => toast.success("Viewing approval coverage...")}
            className="flex items-center gap-1.5 rounded-lg border border-[#ffffff08] bg-[#0d0f0e] px-2.5 py-1.5 text-[11px] font-medium text-[#8a9490] hover:border-[#1a2820] hover:text-foreground transition-colors"
          >
            View approval coverage
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid shrink-0 grid-cols-7 gap-2.5">
        {reportsKpis.map((kpi, i) => (
          <KpiCard key={kpi.id} kpi={kpi} index={i} />
        ))}
      </div>

      {/* 3-Column layout */}
      <div className="grid min-h-0 flex-1 grid-cols-[220px_1fr_240px] gap-3">
        {/* Left: Report Library */}
        <div className="flex flex-col gap-2 overflow-y-auto scrollbar-thin animate-fade-up pr-0.5">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-xs font-semibold text-foreground">Report Library</span>
            <span className="rounded-full bg-[#1a1f1d] px-1.5 py-0.5 text-[9px] font-bold tabular text-[#5a6660]">{reportsLibrary.length}</span>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-[#3a4040]" />
            <input
              placeholder="Search reports..."
              className="h-7 w-full rounded-lg border border-[#ffffff08] bg-[#0a0c0b] pl-7 pr-3 text-[11px] text-[#8a9490] placeholder-[#3a4040] outline-none transition-all focus:border-[#1a2820] focus:text-foreground"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            {reportsLibrary.map((report) => (
              <LibraryCard
                key={report.id}
                report={report}
                active={selectedReport.id === report.id}
                onClick={() => setSelectedReport(report)}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => toast.success("Creating new report...")}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#ffffff10] py-2 text-[11px] font-medium text-[#4a5450] hover:border-[#1a2820] hover:text-[#8a9490] transition-colors mt-1"
          >
            <Plus className="size-3" />New report
          </button>
          <div className="pt-1 text-center text-[10px] text-[#3a4040]">
            Show {reportsLibrary.length} of {reportsLibrary.length} reports
          </div>
        </div>

        {/* Center: Report Viewer */}
        <ReportViewer report={selectedReport} />

        {/* Right: Summary Panel */}
        <SummaryPanel />
      </div>
    </div>
  );
}
