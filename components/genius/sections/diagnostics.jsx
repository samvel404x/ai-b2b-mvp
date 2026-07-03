"use client";

import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, CheckCircle2, ExternalLink, Minus, X } from "lucide-react";
import {
  diagnosticsKpis,
  diagnosticsRows,
  diagnosticSignals,
  spendLeakageDetail,
  formatCurrencyFull,
} from "@/lib/genius-data";
import { PageHeader, Panel, EvidenceLink, Sparkline, Ring, StatusDot } from "../shared";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const toneStroke = {
  primary: "var(--primary)",
  critical: "var(--critical)",
  evidence: "var(--evidence)",
  warning: "var(--warning)",
  neutral: "var(--muted-foreground)",
};

function DiagKpi({ label, value, unit, trend, trendDir, sub, subTone, tone = "neutral", spark, ring, index = 0 }) {
  const up = trendDir !== "down";
  const toneClass = { primary: "text-primary", critical: "text-critical", evidence: "text-evidence", warning: "text-warning", neutral: "text-foreground" }[tone] || "text-foreground";
  const subToneClass = { primary: "text-primary", critical: "text-critical", warning: "text-warning" }[subTone] || "text-muted-foreground";

  return (
    <div
      className="group flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/25 animate-fade-up overflow-hidden"
      style={{ animationDelay: `${index * 35}ms` }}
    >
      <span className="text-[11px] font-medium text-muted-foreground leading-snug">{label}</span>
      <div className="flex items-end gap-1.5">
        {ring ? (
          <Ring value={typeof value === "number" ? value : 72} size={52} stroke="var(--primary)" />
        ) : (
          <span className={cn("text-xl font-semibold tabular leading-none", toneClass)}>
            {value}{unit}
          </span>
        )}
        {trend && (
          <span className={cn("text-[11px] font-semibold tabular pb-0.5", up ? "text-primary" : "text-critical")}>
            {trend}
          </span>
        )}
      </div>
      {spark && <Sparkline data={spark} stroke={toneStroke[tone] || "var(--muted-foreground)"} />}
      <div className="flex items-center justify-between gap-1">
        {sub && <span className={cn("text-[11px]", subToneClass)}>{sub}</span>}
        <span className="text-[10px] text-muted-foreground">vs last 7 days</span>
      </div>
    </div>
  );
}

const trendIconEl = {
  worsening: <span className="flex items-center gap-1 text-critical text-xs"><ArrowUpRight className="size-3" />Worsening</span>,
  improving: <span className="flex items-center gap-1 text-primary text-xs"><ArrowDownRight className="size-3" />Improving</span>,
  flat: <span className="flex items-center gap-1 text-muted-foreground text-xs"><Minus className="size-3" />Flat</span>,
};

const signalToneClass = {
  High: "border-critical/30 bg-critical/10 text-critical",
  Medium: "border-warning/30 bg-warning/10 text-warning",
  Low: "border-border bg-secondary text-muted-foreground",
};

const statusPillClass = {
  Open: "bg-primary/10 text-primary",
  Review: "bg-warning/10 text-warning",
  "In progress": "bg-evidence/10 text-evidence",
};

function DetailPanel({ row, onClose, onNavigate }) {
  const detail = spendLeakageDetail;
  const tabs = ["Overview", "Signals (36)", "Proof trails (24)", "Trend", "Related (6)"];
  const [tab, setTab] = useState("Overview");

  if (!row) return null;

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <span className="size-2 rounded-full bg-critical" />
            {row.category}
          </span>
          <span className="rounded-full border border-critical/30 bg-critical/10 px-2 py-0.5 text-xs font-medium text-critical">High risk</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground rounded-md border border-border px-2 py-1">Open</span>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors">
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Category score + Impact */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-secondary/40 p-3">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Category score</span>
          <div className="flex items-center gap-3">
            <Ring value={row.score} size={64} stroke="var(--critical)" />
            <div>
              <div className="text-sm font-semibold text-critical">{detail.risk}</div>
              <div className="text-xs text-primary">{detail.trend}</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-secondary/40 p-3">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Estimated impact</span>
          <div className="text-2xl font-semibold tabular text-foreground">{detail.estimatedImpact}</div>
          <div className="text-xs text-muted-foreground">{detail.impactSub}</div>
          <div className="mt-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Confidence</span>
              <span className="font-medium">{detail.confidence}%</span>
            </div>
            <Progress value={detail.confidence} className="h-1.5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border">
        {tabs.map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn("relative px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap", tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            {t}
            {tab === t && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>

      {/* Overview tab content */}
      <div className="flex flex-col gap-4">
        {/* Top Drivers */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Top drivers</h4>
          <div className="flex flex-col gap-1.5">
            {detail.topDrivers.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs gap-2">
                <span className="text-muted-foreground truncate">{d.name}</span>
                <span className="font-medium tabular text-foreground shrink-0">{d.value} ({d.pct}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk narrative */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Risk narrative</h4>
          <p className="text-xs leading-relaxed text-muted-foreground">{detail.riskNarrative}</p>
        </div>

        {/* Top evidence + Extracted facts */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Top evidence</h4>
            <div className="flex flex-col gap-1.5">
              {detail.topEvidence.map(e => (
                <div key={e.name} className="flex items-center justify-between gap-2">
                  <EvidenceLink>{e.name}</EvidenceLink>
                  <span className="text-xs tabular text-muted-foreground shrink-0">{e.value}</span>
                </div>
              ))}
            </div>
            <button type="button" className="mt-1.5 text-xs text-evidence hover:underline">View all evidence (24) →</button>
          </div>
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Extracted facts</h4>
            <div className="flex flex-col gap-1.5">
              {detail.extractedFacts.map(f => (
                <div key={f.fact} className="flex items-start gap-1.5 text-xs">
                  <CheckCircle2 className={cn("size-3.5 mt-0.5 shrink-0", f.ok ? "text-primary" : "text-critical")} />
                  <span className="text-muted-foreground">{f.fact}</span>
                </div>
              ))}
            </div>
            <button type="button" className="mt-1.5 text-xs text-evidence hover:underline">View all facts (36) →</button>
          </div>
        </div>

        {/* Recommended action */}
        <div className="rounded-lg border border-border bg-secondary/30 p-3">
          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Recommended next action</h4>
          <p className="text-xs leading-relaxed text-foreground">{detail.recommendedAction}</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button size="sm" className="flex-1" onClick={() => { toast.success("Action plan created"); onNavigate?.("approvals"); }}>
            Create action plan
          </Button>
          <Button variant="outline" size="sm">
            Assign
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Diagnostics({ onNavigate }) {
  const [selectedRow, setSelectedRow] = useState(diagnosticsRows[0]);
  const [activeTab, setActiveTab] = useState("Overview");
  const mainTabs = ["Overview", "Signals", "Proof Trails", "Trends", "Benchmarks"];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Diagnostics"
        description="Understand health, surface risks, and take action with evidence."
        actions={
          <Button variant="outline" size="sm" onClick={() => onNavigate("savings")}>
            Open Savings Radar
          </Button>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 lg:grid-cols-9">
        {diagnosticsKpis.map((kpi, i) => (
          <DiagKpi key={kpi.label} index={i} {...kpi} />
        ))}
      </div>

      {/* Main tabs + content */}
      <div className="flex items-center gap-1 border-b border-border">
        {mainTabs.map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTab(t)}
            className={cn("relative px-3 py-2.5 text-sm font-medium transition-colors", activeTab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            {t}
            {activeTab === t && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>

      {/* Two-column layout: table + detail panel */}
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* Categories table */}
        <Panel contentClassName="p-0">
          {/* Filters */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 flex-wrap">
            {["All Categories", "All Severity", "All Owners", "All Business Areas"].map(f => (
              <button key={f} type="button" className="flex items-center gap-1 rounded-md border border-border bg-secondary/50 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                {f}
                <svg className="size-3" viewBox="0 0 10 10"><path d="M2 4l3 3 3-3" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </button>
            ))}
            <button type="button" className="flex items-center gap-1.5 rounded-md border border-border bg-secondary/50 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <svg className="size-3" viewBox="0 0 16 16" fill="none"><path d="M2 5h12M4 8h8M6 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Filters
            </button>
            <button type="button" className="text-xs text-evidence hover:underline ml-auto">Clear all</button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Category", "Score", "Signals", "Est. Impact", "Trend (7D)", "Confidence", "Proof Trails", "Owner", "Status"].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {diagnosticsRows.map(row => (
                <tr
                  key={row.id}
                  onClick={() => setSelectedRow(row)}
                  className={cn("cursor-pointer transition-colors hover:bg-secondary/40", selectedRow?.id === row.id && "bg-secondary/60")}
                >
                  <td className="px-3 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground text-sm leading-snug">{row.category}</span>
                      <span className="text-[11px] text-muted-foreground">{row.description}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <Ring value={row.score} size={38} stroke={row.score < 55 ? "var(--critical)" : row.score < 70 ? "var(--warning)" : "var(--primary)"} />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="tabular font-medium text-foreground">{row.signals}</span>
                      <span className={cn("text-[11px]", row.signalTone === "critical" ? "text-critical" : "text-warning")}>
                        {row.signalTone === "critical" ? "High" : "Medium"}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className={cn("tabular font-medium", row.impactTone === "critical" ? "text-critical" : "text-warning")}>{row.impact}</span>
                      <span className={cn("text-[11px]", row.impactTone === "critical" ? "text-critical" : "text-warning")}>{row.impactTone === "critical" ? "High" : "Medium"}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">{trendIconEl[row.trend]}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <Progress value={row.confidence} className="h-1 w-10" />
                      <span className="text-xs tabular text-muted-foreground">{row.confidence}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 tabular text-muted-foreground text-sm">{row.proofTrails}</td>
                  <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">{row.owner}</td>
                  <td className="px-3 py-3">
                    <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", statusPillClass[row.status] || "bg-muted text-muted-foreground")}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
            Showing 1 to {diagnosticsRows.length} of {diagnosticsRows.length} categories
          </div>
        </Panel>

        {/* Detail panel */}
        <Panel contentClassName="overflow-y-auto max-h-[700px] scrollbar-thin">
          {selectedRow ? (
            <DetailPanel row={selectedRow} onClose={() => setSelectedRow(null)} onNavigate={onNavigate} />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
              <p className="text-sm text-muted-foreground">Select a category to inspect</p>
            </div>
          )}
        </Panel>
      </div>

      {/* Recent diagnostic signals */}
      <Panel
        title="Recent diagnostic signals"
        contentClassName="p-0"
        actions={
          <Button variant="ghost" size="sm">View all signals →</Button>
        }
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Time", "Severity", "Signal", "Category", "Source evidence", "Impact", "Status"].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {diagnosticSignals.map((s, i) => (
              <tr key={i} className="hover:bg-secondary/30 transition-colors cursor-pointer">
                <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                  <span className={cn("mr-1.5 inline-block size-1.5 rounded-full", s.severity === "High" ? "bg-critical" : s.severity === "Medium" ? "bg-warning" : "bg-muted-foreground")} />
                  {s.time}
                </td>
                <td className="px-4 py-2.5">
                  <span className={cn("rounded-full border px-2 py-0.5 text-xs font-medium", signalToneClass[s.severity] || signalToneClass.Low)}>{s.severity}</span>
                </td>
                <td className="px-4 py-2.5 text-xs text-foreground max-w-[220px] truncate">{s.signal}</td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{s.category}</td>
                <td className="px-4 py-2.5"><EvidenceLink>{s.evidence}</EvidenceLink></td>
                <td className="px-4 py-2.5 tabular text-xs font-medium text-foreground">{s.impact}</td>
                <td className="px-4 py-2.5">
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{s.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
