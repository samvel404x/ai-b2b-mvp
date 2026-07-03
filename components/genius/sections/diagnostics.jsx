"use client";

import { useState } from "react";
import { ArrowUpRight, CheckCircle2, ChevronDown, Minus, TrendingDown, TrendingUp, X } from "lucide-react";
import {
  diagnosticsKpis, diagnosticsRows, diagnosticSignals,
  spendLeakageDetail, formatCurrencyFull,
} from "@/lib/genius-data";
import { ConfBar, EvidenceLink, Panel, Ring, Sparkline, StatusDot } from "../shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const toneStroke = {
  primary: "var(--primary)", critical: "var(--critical)",
  evidence: "var(--evidence)", warning: "var(--warning)", neutral: "rgba(255,255,255,0.2)",
};
const toneText = {
  primary: "text-primary", critical: "text-critical",
  evidence: "text-evidence", warning: "text-warning", neutral: "text-foreground",
};
const toneAccent = {
  primary: "border-t-primary/40", critical: "border-t-critical/40",
  warning: "border-t-warning/40", evidence: "border-t-evidence/40", neutral: "",
};

// ── Diag KPI Card ──────────────────────────────────────────────────────────────
function DiagKpi({ label, value, unit, trend, trendDir, sub, subTone, tone = "neutral", spark, ring, index = 0 }) {
  const down = trendDir === "down";
  const subToneClass = { primary: "text-primary", critical: "text-critical", warning: "text-warning" }[subTone] || "text-[#4a5450]";

  return (
    <div
      className={cn(
        "group relative flex animate-fade-up flex-col gap-2 overflow-hidden rounded-xl border border-t-2 border-[#ffffff08] bg-[#0a0c0b] p-3 transition-all hover:border-[#1a2820] hover:bg-[#0d100e]",
        toneAccent[tone],
      )}
      style={{ animationDelay: `${index * 35}ms` }}
    >
      <span className="text-[10px] font-medium text-[#4a5450] leading-snug">{label}</span>
      <div className="flex items-end gap-1.5">
        {ring ? (
          <Ring value={typeof value === "number" ? value : 72} size={46} stroke={toneStroke[tone]} />
        ) : (
          <span className={cn("text-lg font-semibold tabular leading-none", toneText[tone])}>
            {value}{unit}
          </span>
        )}
        {trend && (
          <span className={cn("pb-0.5 text-[10px] font-semibold tabular", down ? "text-primary" : "text-critical")}>
            {trend}
          </span>
        )}
      </div>
      {spark && <Sparkline data={spark} stroke={toneStroke[tone]} />}
      {sub && <span className={cn("text-[10px]", subToneClass)}>{sub}</span>}
    </div>
  );
}

// ── Trend cell ──────────────────────────────────────────────────────────────
function TrendEl({ trend }) {
  if (trend === "worsening") return (
    <span className="flex items-center gap-1 text-[11px] font-medium text-critical">
      <TrendingUp className="size-3" />Worsening
    </span>
  );
  if (trend === "improving") return (
    <span className="flex items-center gap-1 text-[11px] font-medium text-primary">
      <TrendingDown className="size-3" />Improving
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-[11px] text-[#5a6660]">
      <Minus className="size-3" />Flat
    </span>
  );
}

// ── Status Pill ──────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const s = {
    Open:        "bg-primary/10 text-primary border-primary/20",
    Review:      "bg-warning/10 text-warning border-warning/20",
    "In progress": "bg-evidence/10 text-evidence border-evidence/20",
  }[status] || "bg-white/5 text-[#5a6660] border-white/8";
  return <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-semibold", s)}>{status}</span>;
}

// ── Signal Severity Badge ──────────────────────────────────────────────────────
function SigBadge({ level }) {
  const s = {
    High:   "border-critical/25 bg-critical/8 text-critical",
    Medium: "border-warning/25 bg-warning/8 text-warning",
    Low:    "border-white/8 bg-white/3 text-[#5a6660]",
  }[level] || "border-white/8 bg-white/3 text-[#5a6660]";
  return <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", s)}>{level}</span>;
}

// ── Detail Panel ──────────────────────────────────────────────────────────────
const detailTabs = ["Overview", "Signals (36)", "Proof trails (24)", "Trend", "Related (6)"];

function DetailPanel({ row, onClose, onNavigate }) {
  const d = spendLeakageDetail;
  const [tab, setTab] = useState("Overview");

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <span className="size-2 rounded-full bg-critical" />
            {row.category}
          </div>
          <span className="rounded-full border border-critical/25 bg-critical/10 px-2 py-0.5 text-[10px] font-semibold text-critical">High risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="rounded-md border border-[#ffffff08] bg-white/5 px-2 py-0.5 text-[10px] text-[#5a6660]">Open</span>
          <span className="rounded-md border border-[#ffffff08] bg-white/5 px-2 py-0.5 text-[10px] text-[#5a6660]">···</span>
          <button type="button" onClick={onClose} className="flex size-6 items-center justify-center rounded-md text-[#5a6660] transition-colors hover:bg-white/5 hover:text-foreground">
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Score + Impact row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2 rounded-xl border border-[#ffffff08] bg-[#0d0f0e] p-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#3a4040]">Category score</span>
          <div className="flex items-center gap-3">
            <Ring value={row.score} size={60} stroke="var(--critical)" />
            <div>
              <div className="text-sm font-bold text-critical">High risk</div>
              <div className="text-[11px] text-primary">+8 pts vs 7d</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-[#ffffff08] bg-[#0d0f0e] p-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#3a4040]">Estimated impact</span>
          <div className="text-2xl font-bold tabular text-foreground">{d.estimatedImpact}</div>
          <div className="text-[11px] text-[#4a5450]">{d.impactSub}</div>
          <div>
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-[#4a5450]">Confidence</span>
              <span className="font-semibold text-foreground">{d.confidence}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/6">
              <div className="h-full rounded-full bg-primary" style={{ width: `${d.confidence}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Top drivers sidebar box */}
      <div className="rounded-xl border border-[#ffffff08] bg-[#0d0f0e] p-3">
        <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#3a4040]">Top drivers</h4>
        <div className="flex flex-col gap-1.5">
          {d.topDrivers.map(dr => (
            <div key={dr.name} className="flex items-center justify-between text-xs gap-2">
              <span className="text-[#5a6660] truncate">{dr.name}</span>
              <span className="shrink-0 font-semibold tabular text-foreground">{dr.value} <span className="text-[#3a4040]">({dr.pct}%)</span></span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[#ffffff06]">
        {detailTabs.map(t => (
          <button key={t} type="button" onClick={() => setTab(t)} className={cn("relative px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap", tab === t ? "text-foreground" : "text-[#4a5450] hover:text-[#8a9490]")}>
            {t}
            {tab === t && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>

      {/* Tab body */}
      <div className="flex flex-col gap-4">
        {/* Risk narrative */}
        <div>
          <h4 className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#3a4040]">Risk narrative</h4>
          <p className="text-xs leading-relaxed text-[#5a6660]">{d.riskNarrative}</p>
        </div>

        {/* Top evidence + extracted facts */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#3a4040]">Top evidence</h4>
            <div className="flex flex-col gap-1.5">
              {d.topEvidence.map(e => (
                <div key={e.name} className="flex items-center justify-between gap-2">
                  <EvidenceLink>{e.name}</EvidenceLink>
                  <span className="shrink-0 text-[11px] tabular font-medium text-[#5a6660]">{e.value}</span>
                </div>
              ))}
            </div>
            <button type="button" className="mt-1.5 text-xs text-evidence hover:text-evidence/80 transition-colors">View all evidence (24) →</button>
          </div>
          <div>
            <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#3a4040]">Extracted facts</h4>
            <div className="flex flex-col gap-1.5">
              {d.extractedFacts.map(f => (
                <div key={f.fact} className="flex items-start gap-1.5 text-xs">
                  <CheckCircle2 className={cn("mt-0.5 size-3.5 shrink-0", f.ok ? "text-primary" : "text-critical")} />
                  <span className="text-[#5a6660] leading-snug">{f.fact}</span>
                </div>
              ))}
            </div>
            <button type="button" className="mt-1.5 text-xs text-evidence hover:text-evidence/80 transition-colors">View all facts (36) →</button>
          </div>
        </div>

        {/* Recommended action */}
        <div className="rounded-xl border border-[#1a2820] bg-primary/5 p-3">
          <h4 className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-primary/70">Recommended next action</h4>
          <p className="text-xs leading-relaxed text-[#8a9490]">{d.recommendedAction}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button size="sm" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => { toast.success("Action plan created"); onNavigate?.("approvals"); }}>
            Create action plan
          </Button>
          <Button variant="outline" size="sm" className="border-[#ffffff10] bg-transparent text-[#8a9490] hover:bg-white/5">
            Assign
          </Button>
        </div>

        {/* Related business impacts */}
        <div>
          <h4 className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#3a4040]">Related business impacts</h4>
          <div className="grid grid-cols-2 gap-2">
            {d.relatedImpacts.slice(0, 4).map(ri => (
              <div key={ri.label} className="rounded-xl border border-[#ffffff08] bg-[#0d0f0e] p-3">
                <p className="text-[10px] font-medium text-[#4a5450]">{ri.label}</p>
                <p className={cn("mt-1 text-base font-bold tabular", ri.trend === "down" && ri.value.startsWith("-") ? "text-critical" : "text-foreground")}>{ri.value}</p>
                <p className="text-[10px] text-[#3a4040]">{ri.sub}</p>
                <p className="mt-1 text-[10px] text-[#4a5450]">{ri.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Diagnostics({ onNavigate }) {
  const [selectedRow, setSelectedRow] = useState(diagnosticsRows[0]);
  const [activeTab, setActiveTab] = useState("Overview");
  const mainTabs = ["Overview", "Signals", "Proof Trails", "Trends", "Benchmarks"];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Diagnostics</h1>
          <p className="text-sm text-[#4a5450]">Understand health, surface risks, and take action with evidence.</p>
        </div>
        <Button variant="outline" size="sm" className="border-[#ffffff10] bg-transparent text-[#8a9490] hover:bg-white/5" onClick={() => onNavigate("savings")}>
          Open Savings Radar
        </Button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
        {diagnosticsKpis.map((kpi, i) => (
          <DiagKpi key={kpi.label} index={i} {...kpi} />
        ))}
      </div>

      {/* Main tabs */}
      <div className="flex items-center gap-0 border-b border-[#ffffff06]">
        {mainTabs.map(t => (
          <button key={t} type="button" onClick={() => setActiveTab(t)} className={cn("relative px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap", activeTab === t ? "text-foreground" : "text-[#4a5450] hover:text-[#8a9490]")}>
            {t}
            {activeTab === t && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>

      {/* Two-column */}
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        {/* Table */}
        <Panel contentClassName="p-0" accent="primary">
          {/* Filters */}
          <div className="flex items-center gap-2 border-b border-[#ffffff06] px-4 py-2.5 flex-wrap">
            {["All Categories", "All Severity", "All Owners", "All Business Areas"].map(f => (
              <button key={f} type="button" className="flex items-center gap-1 rounded-md border border-[#ffffff08] bg-white/3 px-2.5 py-1 text-[11px] text-[#5a6660] transition-colors hover:text-foreground">
                {f}
                <ChevronDown className="size-3 opacity-60" />
              </button>
            ))}
            <button type="button" className="ml-auto text-[11px] text-evidence hover:text-evidence/70 transition-colors">Clear all</button>
          </div>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#ffffff06]">
                  {["Category", "Score", "Signals", "Est. Impact", "Trend (7D)", "Confidence", "Proof Trails", "Owner", "Status"].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#3a4040] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {diagnosticsRows.map((row, idx) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedRow(row)}
                    className={cn(
                      "cursor-pointer border-b border-[#ffffff04] transition-all hover:bg-white/[0.025]",
                      selectedRow?.id === row.id && "bg-white/[0.035]",
                      idx === diagnosticsRows.length - 1 && "border-b-0",
                    )}
                  >
                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-foreground whitespace-nowrap">{row.category}</span>
                        <span className="text-[10px] text-[#4a5450]">{row.description}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Ring value={row.score} size={36} stroke={row.score < 55 ? "var(--critical)" : row.score < 70 ? "var(--warning)" : "var(--primary)"} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold tabular text-foreground">{row.signals}</span>
                        <span className={cn("text-[10px] font-medium", row.signalTone === "critical" ? "text-critical" : "text-warning")}>
                          {row.signalTone === "critical" ? "High" : "Medium"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className={cn("text-sm font-bold tabular whitespace-nowrap", row.impactTone === "critical" ? "text-critical" : "text-warning")}>{row.impact}</span>
                        <span className={cn("text-[10px] font-medium", row.impactTone === "critical" ? "text-critical" : "text-warning")}>{row.impactTone === "critical" ? "High" : "Medium"}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3"><TrendEl trend={row.trend} /></td>
                    <td className="px-3 py-3 min-w-[90px]"><ConfBar value={row.confidence} /></td>
                    <td className="px-3 py-3 text-sm font-semibold tabular text-foreground">{row.proofTrails}</td>
                    <td className="px-3 py-3 text-xs text-[#5a6660] whitespace-nowrap">{row.owner}</td>
                    <td className="px-3 py-3"><StatusPill status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-[#ffffff06] px-4 py-2.5 text-[11px] text-[#3a4040]">
              Showing 1 to {diagnosticsRows.length} of {diagnosticsRows.length} categories
            </div>
          </div>
        </Panel>

        {/* Detail panel */}
        <div className="rounded-xl border border-[#ffffff08] bg-[#0a0c0b] overflow-hidden">
          <div className="overflow-y-auto max-h-[680px] scrollbar-thin p-4">
            {selectedRow ? (
              <DetailPanel row={selectedRow} onClose={() => setSelectedRow(null)} onNavigate={onNavigate} />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
                <p className="text-sm text-[#3a4040]">Select a category to inspect</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Diagnostic signals */}
      <Panel title="Recent diagnostic signals" contentClassName="p-0" accent="warning"
        actions={<Button variant="ghost" size="sm" className="text-evidence text-xs">View all signals →</Button>}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#ffffff06]">
              {["Time", "Severity", "Signal", "Category", "Source evidence", "Impact", "Status"].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#3a4040] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {diagnosticSignals.map((s, i) => (
              <tr key={i} className={cn("cursor-pointer border-b border-[#ffffff04] transition-colors hover:bg-white/[0.02]", i === diagnosticSignals.length - 1 && "border-b-0")}>
                <td className="px-4 py-2.5 text-xs text-[#5a6660] whitespace-nowrap">
                  <span className={cn("mr-2 inline-block size-1.5 rounded-full", s.severity === "High" ? "bg-critical" : s.severity === "Medium" ? "bg-warning" : "bg-[#3a4040]")} />
                  {s.time}
                </td>
                <td className="px-4 py-2.5"><SigBadge level={s.severity} /></td>
                <td className="px-4 py-2.5 text-xs text-foreground max-w-[240px] truncate">{s.signal}</td>
                <td className="px-4 py-2.5 text-xs text-[#5a6660]">{s.category}</td>
                <td className="px-4 py-2.5"><EvidenceLink>{s.evidence}</EvidenceLink></td>
                <td className="px-4 py-2.5 text-xs font-semibold tabular text-foreground">{s.impact}</td>
                <td className="px-4 py-2.5">
                  <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-[#5a6660]">{s.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
