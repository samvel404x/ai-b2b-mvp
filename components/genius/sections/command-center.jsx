"use client";

import { useState } from "react";
import { ArrowUpRight, Check, ChevronRight, Clock, Download, TrendingUp, X, Zap } from "lucide-react";
import {
  commandKpis, evidenceGraphNodes, decisionQueue,
  activeAgents, proofBackedFindings, formatCurrencyFull,
} from "@/lib/genius-data";
import { ConfBar, EvidenceLink, Panel, Ring, SeverityBadge, Sparkline, StatePill, StatusDot } from "../shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const toneStroke = {
  primary: "var(--primary)", critical: "var(--critical)",
  evidence: "var(--evidence)", warning: "var(--warning)", neutral: "rgba(255,255,255,0.3)",
};
const toneText = {
  primary: "text-primary", critical: "text-critical",
  evidence: "text-evidence", warning: "text-warning", neutral: "text-foreground",
};
const toneAccent = {
  primary: "border-t-primary/40", critical: "border-t-critical/40",
  warning: "border-t-warning/40", evidence: "border-t-evidence/40", neutral: "",
};

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, trend, trendDir, tone = "neutral", sub, subTone, spark, ring, index = 0 }) {
  const up = trendDir === "up";
  const subToneClass = { primary: "text-primary", critical: "text-critical", warning: "text-warning" }[subTone] || "text-[#4a5450]";

  return (
    <div
      className={cn(
        "group relative flex animate-fade-up flex-col gap-2 overflow-hidden rounded-xl border border-t-2 border-[#ffffff08] bg-[#0a0c0b] p-3.5 transition-all duration-200 hover:border-[#1a2820] hover:bg-[#0d100e]",
        toneAccent[tone],
      )}
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <div className="flex items-start justify-between gap-1">
        <span className="text-[11px] font-medium text-[#4a5450] leading-tight">{label}</span>
        {trend && (
          <span className={cn(
            "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular",
            up ? "bg-critical/10 text-critical" : "bg-primary/10 text-primary",
          )}>
            {trend}
          </span>
        )}
      </div>

      {ring ? (
        <Ring value={typeof value === "number" ? value : 72} size={48} stroke={toneStroke[tone]} />
      ) : (
        <div className={cn("text-xl font-semibold tracking-tight tabular leading-none", toneText[tone])}>
          {value}
        </div>
      )}

      {spark && <Sparkline data={spark} stroke={toneStroke[tone]} />}

      <div className="flex items-center justify-between gap-1">
        {sub && <span className={cn("text-[10px] font-medium", subToneClass)}>{sub}</span>}
        <span className="text-[10px] text-[#2e3630]">vs 7d</span>
      </div>
    </div>
  );
}

// ── Evidence Graph ─────────────────────────────────────────────────────────────
const colConfig = [
  { key: "sourceEvidence",  label: "Source Evidence",  color: "#38bdf8", bg: "rgba(56,189,248,0.06)", border: "rgba(56,189,248,0.15)" },
  { key: "extractedFacts",  label: "Extracted Facts",  color: "#94a3b8", bg: "rgba(148,163,184,0.04)", border: "rgba(148,163,184,0.1)" },
  { key: "diagnosticRisks", label: "Diagnostic Risks", color: "#f2555a", bg: "rgba(242,85,90,0.07)",   border: "rgba(242,85,90,0.2)" },
  { key: "agentActions",    label: "Agent Actions",    color: "#e0b341", bg: "rgba(224,179,65,0.06)",  border: "rgba(224,179,65,0.15)" },
  { key: "humanApprovals",  label: "Human Approvals",  color: "#1fd672", bg: "rgba(31,214,114,0.06)",  border: "rgba(31,214,114,0.15)" },
  { key: "boardReports",    label: "Board Reports",    color: "#1fd672", bg: "rgba(31,214,114,0.04)",  border: "rgba(31,214,114,0.1)" },
];

function EvidenceGraph() {
  const nodes = evidenceGraphNodes;
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <div className="flex min-w-[860px] items-start gap-0">
        {colConfig.map((col, ci) => {
          const data = nodes[col.key];
          return (
            <div key={col.key} className="flex flex-1 items-start">
              <div className="flex flex-1 flex-col gap-2">
                {/* Column header */}
                <div className="flex flex-col items-center gap-0.5 pb-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: col.color }}>
                    {data.label}
                  </span>
                  <span className="text-sm font-bold tabular text-foreground">{data.count.toLocaleString()}</span>
                </div>
                {/* Node cards */}
                <div className="flex flex-col gap-1.5 px-1">
                  {data.items.map((item, i) => (
                    <div
                      key={i}
                      className="group cursor-pointer rounded-lg border px-2.5 py-2 text-xs transition-all duration-150 hover:brightness-125"
                      style={{ background: col.bg, borderColor: col.border }}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate font-medium text-[#c8d4cf] leading-snug">{item}</span>
                        {data.scores?.[i] !== undefined && (
                          <span className="shrink-0 text-[10px] tabular opacity-60" style={{ color: col.color }}>
                            {data.scores[i]}
                          </span>
                        )}
                      </div>
                      {(data.statuses?.[i] || data.severities?.[i]) && (
                        <div className="mt-0.5 text-[10px]" style={{ color: col.color, opacity: 0.65 }}>
                          {data.statuses?.[i] || data.severities?.[i]}
                        </div>
                      )}
                    </div>
                  ))}
                  <button type="button" className="py-1 text-center text-[10px] text-[#3a4040] transition-colors hover:text-[#6a7470]">
                    {ci === 0 ? "+ 90 more sources" : ci === 1 ? "+ 2,837 facts" : ci === 2 ? "+ 30 risks" : ci === 3 ? "+ 83 actions" : ci === 4 ? "+ 20 more" : "+ 8 more"}
                  </button>
                </div>
              </div>
              {/* Arrow */}
              {ci < colConfig.length - 1 && (
                <div className="flex items-start pt-10 px-0.5">
                  <ChevronRight className="size-3.5 text-[#2e3630]" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="mt-3 flex items-center gap-5 text-[10px] text-[#4a5450]">
        {[
          { color: "#38bdf8", label: "Evidence" },
          { color: "#94a3b8", label: "Fact" },
          { color: "#f2555a", label: "Risk" },
          { color: "#e0b341", label: "Agent Action" },
          { color: "#1fd672", label: "Approval / Report" },
        ].map(l => (
          <span key={l.label} className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Decision Queue Item ────────────────────────────────────────────────────────
function DecisionItem({ item, onApprove, onReject }) {
  const priorityStyle = {
    High:   "border-critical/25 bg-critical/8 text-critical",
    Medium: "border-warning/25 bg-warning/8 text-warning",
    Low:    "border-white/8 bg-white/3 text-[#5a6660]",
  }[item.priority] || "border-white/8 bg-white/3 text-[#5a6660]";

  return (
    <div className="rounded-xl border border-[#ffffff08] bg-[#0d0f0e] p-3.5 transition-all hover:border-[#1a2820]">
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", priorityStyle)}>
          {item.priority}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onApprove(item)}
            className="flex size-6 items-center justify-center rounded-md bg-primary/12 text-primary transition-colors hover:bg-primary/20"
          >
            <Check className="size-3" />
          </button>
          <button
            type="button"
            onClick={() => onReject(item)}
            className="flex size-6 items-center justify-center rounded-md bg-critical/10 text-critical transition-colors hover:bg-critical/18"
          >
            <X className="size-3" />
          </button>
          <button type="button" className="rounded-md px-2 py-0.5 text-[10px] text-[#5a6660] transition-colors hover:bg-white/5 hover:text-foreground">Edit</button>
        </div>
      </div>
      <p className="text-sm font-semibold text-foreground leading-snug">{item.title}</p>
      <p className="mt-0.5 text-xs text-[#4a5450]">{item.sub}</p>
      <div className="mt-2.5 flex items-center gap-3 text-xs">
        <span className="font-semibold tabular text-foreground">{formatCurrencyFull(item.impact)}</span>
        <span className={cn("font-medium", item.due?.includes("overdue") ? "text-critical" : "text-warning")}>
          <Clock className="mr-0.5 inline size-3" />Due {item.due}
        </span>
        <span className="text-[#3a4040]">{item.requestedBy}</span>
      </div>
    </div>
  );
}

// ── Approval State Pill (for table) ────────────────────────────────────────────
function ApprovalPill({ state }) {
  const s = {
    "Open":        "bg-primary/10 text-primary border border-primary/20",
    "In progress": "bg-evidence/10 text-evidence border border-evidence/20",
    "Review":      "bg-warning/10 text-warning border border-warning/20",
  }[state] || "bg-white/5 text-[#5a6660] border border-white/8";
  return <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-semibold", s)}>{state}</span>;
}

// ── Trend Sparkline in-cell ────────────────────────────────────────────────────
function TrendCell({ color = "var(--primary)" }) {
  // Static jitter — no Math.random() to avoid SSR hydration mismatch
  const vals = [3.2, 4.1, 3.8, 5.3, 4.7, 6.2, 5.4, 7.1, 6.8, 8.3];
  return <Sparkline data={vals} stroke={color} className="h-6 w-16" />;
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function CommandCenter({ onNavigate }) {
  const [queueItems, setQueueItems] = useState(decisionQueue);

  function handleApprove(item) {
    setQueueItems(prev => prev.filter(i => i.id !== item.id));
    toast.success(`Approved: ${item.title}`, { description: `${formatCurrencyFull(item.impact)} committed` });
  }
  function handleReject(item) {
    setQueueItems(prev => prev.filter(i => i.id !== item.id));
    toast.error(`Rejected: ${item.title}`);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary">Command Center</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">Evidence-backed operations.</h1>
          <p className="text-sm text-[#4a5450]">Real-time insights. Approval-first execution.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-[#ffffff10] bg-transparent text-[#8a9490] hover:bg-white/5 hover:text-foreground">
            <Download className="size-3.5 mr-1.5" />Export summary
          </Button>
          <Button size="sm" onClick={() => onNavigate("data")} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Import data
          </Button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
        {commandKpis.map((kpi, i) => (
          <KpiCard key={kpi.label} index={i} {...kpi} />
        ))}
      </div>

      {/* Evidence Graph */}
      <Panel
        title="Evidence Graph"
        accent="evidence"
        actions={
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-1.5 animate-ping rounded-full bg-primary opacity-50" />
                <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
              </span>
              Live
            </span>
            <span className="text-xs text-[#4a5450]">How your data becomes decisions</span>
          </div>
        }
      >
        <EvidenceGraph />
      </Panel>

      {/* Bottom grid */}
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Proof-Backed Findings */}
        <Panel
          title="Proof-backed findings"
          description={`${proofBackedFindings.length} findings`}
          accent="primary"
          contentClassName="p-0"
          actions={
            <Button variant="ghost" size="sm" className="text-evidence hover:text-evidence/80 text-xs" onClick={() => onNavigate("savings")}>
              View all <ArrowUpRight className="size-3 ml-1" />
            </Button>
          }
        >
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#ffffff06]">
                  {["Risk / Finding", "Category", "Source evidence", "Impact", "Confidence", "Owner", "Agent action", "State"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#3a4040] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {proofBackedFindings.map((f, idx) => (
                  <tr
                    key={f.id}
                    className={cn("cursor-pointer border-b border-[#ffffff04] transition-colors hover:bg-white/[0.02]", idx === proofBackedFindings.length - 1 && "border-b-0")}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={cn("size-1.5 shrink-0 rounded-full", f.severity === "High" || f.severity === "Critical" ? "bg-critical" : f.severity === "Medium" ? "bg-warning" : "bg-[#5a6660]")} />
                        <span className="text-sm font-medium text-foreground whitespace-nowrap">{f.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-[#5a6660]">{f.category}</span>
                    </td>
                    <td className="px-4 py-3 max-w-[120px]">
                      <EvidenceLink>{f.evidence}</EvidenceLink>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-sm font-semibold tabular whitespace-nowrap", f.impact < 0 ? "text-critical" : "text-foreground")}>
                        {typeof f.impact === "number" ? formatCurrencyFull(Math.abs(f.impact)) : f.impact}
                      </span>
                    </td>
                    <td className="px-4 py-3 min-w-[90px]">
                      <ConfBar value={f.confidence} />
                    </td>
                    <td className="px-4 py-3 text-xs text-[#5a6660] whitespace-nowrap">{f.owner}</td>
                    <td className="px-4 py-3 text-xs text-[#4a5450] max-w-[150px]">
                      <div className="whitespace-pre-line leading-snug">{f.agentAction}</div>
                    </td>
                    <td className="px-4 py-3">
                      <ApprovalPill state={f.approvalState} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-[#ffffff06] px-4 py-2.5 text-[11px] text-[#3a4040]">
              Showing 1 to {proofBackedFindings.length} of {proofBackedFindings.length} findings
            </div>
          </div>
        </Panel>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          {/* Decision Queue */}
          <Panel
            title="Decision queue"
            description={`${queueItems.length} pending`}
            accent="warning"
            contentClassName="p-0"
            actions={
              <Button variant="ghost" size="sm" className="text-evidence hover:text-evidence/80 text-xs" onClick={() => onNavigate("approvals")}>
                View all <ArrowUpRight className="size-3 ml-1" />
              </Button>
            }
          >
            <div className="flex flex-col gap-2 p-3">
              {queueItems.slice(0, 4).map(item => (
                <DecisionItem key={item.id} item={item} onApprove={handleApprove} onReject={handleReject} />
              ))}
              {queueItems.length > 4 && (
                <button
                  type="button"
                  className="py-1.5 text-center text-xs text-[#4a5450] transition-colors hover:text-foreground"
                  onClick={() => onNavigate("approvals")}
                >
                  + {queueItems.length - 4} more pending
                </button>
              )}
            </div>
          </Panel>

          {/* Active Supervised Agents */}
          <Panel
            title="Active supervised agents"
            description={`${activeAgents.filter(a => a.status === "Active").length} of ${activeAgents.length} running`}
            accent="primary"
            contentClassName="p-0"
            actions={
              <Button variant="ghost" size="sm" className="text-evidence hover:text-evidence/80 text-xs" onClick={() => onNavigate("agents")}>
                View all <ArrowUpRight className="size-3 ml-1" />
              </Button>
            }
          >
            <div>
              <div className="grid grid-cols-4 border-b border-[#ffffff06] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#3a4040]">
                <span className="col-span-1">Agent</span>
                <span>Status</span>
                <span>Load</span>
                <span>Today</span>
              </div>
              {activeAgents.map((agent, i) => (
                <div
                  key={agent.id}
                  className={cn(
                    "grid grid-cols-4 items-center px-4 py-2.5 transition-colors hover:bg-white/[0.02]",
                    i < activeAgents.length - 1 && "border-b border-[#ffffff04]",
                  )}
                >
                  <div className="col-span-1 min-w-0">
                    <span className="block truncate text-xs font-medium text-foreground">{agent.name}</span>
                    <span className="text-[10px] text-[#3a4040]">{agent.lastRun}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StatusDot tone={agent.status} />
                    <span className={cn("text-[11px] font-medium", agent.status === "Active" ? "text-primary" : agent.status === "Waiting" ? "text-warning" : "text-critical")}>
                      {agent.status}
                    </span>
                  </div>
                  <div className="pr-3">
                    <div className="mb-0.5 flex items-center justify-between">
                      <span className="text-[9px] tabular text-[#3a4040]">{agent.workload}%</span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-white/6">
                      <div
                        className={cn("h-full rounded-full", agent.status === "Active" ? "bg-primary" : "bg-warning")}
                        style={{ width: `${agent.workload}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold tabular text-foreground">{agent.actionsToday}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
