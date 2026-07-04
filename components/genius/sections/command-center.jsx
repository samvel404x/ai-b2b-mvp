"use client";

import { useState } from "react";
import { ArrowUpRight, Check, ChevronRight, Clock, Download, Maximize2, Minus, Plus, TrendingUp, X, Zap } from "lucide-react";
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
  primary: "text-[#22C55E]", critical: "text-[#EF4444]",
  evidence: "text-[#38BDF8]", warning: "text-[#F59E0B]", neutral: "text-[#F4F7F8]",
};
const toneAccent = {
  primary: "border-t-[#22C55E]/30", critical: "border-t-[#EF4444]/30",
  warning: "border-t-[#F59E0B]/30", evidence: "border-t-[#38BDF8]/30", neutral: "border-t-transparent",
};

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, trend, trendDir, tone = "neutral", sub, subTone, spark, ring, index = 0 }) {
  const up = trendDir === "up";
  const subToneClass = { primary: "text-[#22C55E]", critical: "text-[#EF4444]", warning: "text-[#F59E0B]" }[subTone] || "text-[#68737D]";

  return (
    <div
      className={cn(
        "group relative flex animate-fade-up flex-col gap-2 overflow-hidden rounded-xl border border-t-2 border-[#1E2730] bg-[#0E1418] p-4 transition-all duration-200 hover:bg-[#141B21]",
        toneAccent[tone],
      )}
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <div className="flex items-start justify-between gap-1">
        <span className="text-[11px] font-medium text-[#68737D] leading-tight">{label}</span>
        {trend && (
          <span className={cn(
            "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular",
            up ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#22C55E]/10 text-[#22C55E]",
          )}>
            {trend}
          </span>
        )}
      </div>

      {ring ? (
        <Ring value={typeof value === "number" ? value : 72} size={48} stroke={toneStroke[tone]} />
      ) : (
        <div className={cn("text-xl font-semibold tracking-tight tabular leading-none", toneText[tone] || "text-[#F4F7F8]")}>
          {value}
        </div>
      )}

      {spark && <Sparkline data={spark} stroke={toneStroke[tone]} />}

      <div className="flex items-center justify-between gap-1">
        {sub && <span className={cn("text-[10px] font-medium", subToneClass)}>{sub}</span>}
        <span className="text-[10px] text-[#68737D]">vs 7d</span>
      </div>
    </div>
  );
}

// ── Evidence Graph ─────────────────────────────────────────────────────────────
const colConfig = [
  { key: "sourceEvidence",  label: "Source Evidence",  color: "#38BDF8", bg: "rgba(56,189,248,0.06)", border: "rgba(56,189,248,0.15)" },
  { key: "extractedFacts",  label: "Extracted Facts",  color: "#A7B0B8", bg: "rgba(167,176,184,0.04)", border: "rgba(167,176,184,0.1)" },
  { key: "diagnosticRisks", label: "Diagnostic Risks", color: "#EF4444", bg: "rgba(239,68,68,0.06)",   border: "rgba(239,68,68,0.18)" },
  { key: "agentActions",    label: "Agent Actions",    color: "#F59E0B", bg: "rgba(245,158,11,0.06)",  border: "rgba(245,158,11,0.15)" },
  { key: "humanApprovals",  label: "Human Approvals",  color: "#22C55E", bg: "rgba(34,197,94,0.06)",  border: "rgba(34,197,94,0.15)" },
  { key: "boardReports",    label: "Board Reports",    color: "#22C55E", bg: "rgba(34,197,94,0.04)",  border: "rgba(34,197,94,0.1)" },
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
                <div className="flex flex-col items-center gap-0.5 pb-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: col.color }}>
                    {data.label}
                  </span>
                  <span className="text-sm font-bold tabular text-[#F4F7F8]">{data.count.toLocaleString("en-US")}</span>
                </div>
                <div className="flex flex-col gap-1.5 px-1">
                  {data.items.map((item, i) => (
                    <div
                      key={i}
                      className="group cursor-pointer rounded-lg border px-2.5 py-2 text-xs transition-all duration-150 hover:brightness-125"
                      style={{ background: col.bg, borderColor: col.border }}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate font-medium text-[#A7B0B8] leading-snug">{item}</span>
                        {data.scores?.[i] !== undefined && (
                          <span className="shrink-0 text-[10px] tabular opacity-70" style={{ color: col.color }}>
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
                  <button type="button" className="py-1 text-center text-[10px] text-[#68737D] transition-colors hover:text-[#A7B0B8]">
                    {ci === 0 ? "+ 90 more sources" : ci === 1 ? "+ 2,837 facts" : ci === 2 ? "+ 30 risks" : ci === 3 ? "+ 83 actions" : ci === 4 ? "+ 20 more" : "+ 8 more"}
                  </button>
                </div>
              </div>
              {ci < colConfig.length - 1 && (
                <div className="flex items-start pt-10 px-0.5">
                  <ChevronRight className="size-3.5 text-[#2C3842]" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-5 text-[10px] text-[#68737D]">
        {[
          { color: "#38BDF8", label: "Evidence" },
          { color: "#A7B0B8", label: "Fact" },
          { color: "#EF4444", label: "Risk" },
          { color: "#F59E0B", label: "Agent Action" },
          { color: "#22C55E", label: "Approval / Report" },
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
    High:   "border-[#EF4444]/25 bg-[#EF4444]/8 text-[#EF4444]",
    Medium: "border-[#F59E0B]/25 bg-[#F59E0B]/8 text-[#F59E0B]",
    Low:    "border-[#1E2730] bg-[#141B21] text-[#68737D]",
  }[item.priority] || "border-[#1E2730] bg-[#141B21] text-[#68737D]";

  return (
    <div className="rounded-xl border border-[#1E2730] bg-[#11171C] p-3.5 transition-all hover:bg-[#141B21]">
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", priorityStyle)}>
          {item.priority}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onApprove(item)}
            className="flex size-6 items-center justify-center rounded-md bg-[#22C55E]/12 text-[#22C55E] transition-colors hover:bg-[#22C55E]/20"
          >
            <Check className="size-3" />
          </button>
          <button
            type="button"
            onClick={() => onReject(item)}
            className="flex size-6 items-center justify-center rounded-md bg-[#EF4444]/10 text-[#EF4444] transition-colors hover:bg-[#EF4444]/18"
          >
            <X className="size-3" />
          </button>
          <button type="button" className="rounded-md px-2 py-0.5 text-[10px] text-[#68737D] transition-colors hover:bg-[#182128] hover:text-[#F4F7F8]">Edit</button>
        </div>
      </div>
      <p className="text-sm font-semibold text-[#F4F7F8] leading-snug">{item.title}</p>
      <p className="mt-0.5 text-xs text-[#68737D]">{item.sub}</p>
      <div className="mt-2.5 flex items-center gap-3 text-xs">
        <span className="font-semibold tabular text-[#F4F7F8]">{formatCurrencyFull(item.impact)}</span>
        <span className={cn("font-medium", item.due?.includes("overdue") ? "text-[#EF4444]" : "text-[#F59E0B]")}>
          <Clock className="mr-0.5 inline size-3" />Due {item.due}
        </span>
        <span className="text-[#68737D]">{item.requestedBy}</span>
      </div>
    </div>
  );
}

// ── Approval State Pill ────────────────────────────────────────────────────────
function ApprovalPill({ state }) {
  const s = {
    "Open":        "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20",
    "In progress": "bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20",
    "Review":      "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20",
  }[state] || "bg-[#141B21] text-[#68737D] border border-[#1E2730]";
  return <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-semibold", s)}>{state}</span>;
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
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#22C55E]">Command Center</span>
          </div>
          <h1 className="text-xl font-semibold text-[#F4F7F8]">Evidence-backed operations.</h1>
          <p className="text-sm text-[#68737D]">Real-time insights. Approval-first execution.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-[#1E2730] bg-transparent text-[#A7B0B8] hover:bg-[#182128] hover:text-[#F4F7F8]">
            <Download className="size-3.5 mr-1.5" />Export summary
          </Button>
          <Button size="sm" onClick={() => onNavigate("data")} className="bg-[#22C55E] text-[#03110a] hover:bg-[#16A34A]">
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

      {/* Evidence Graph + Decision Queue side-by-side */}
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Panel
          title="Evidence Graph"
          accent="evidence"
          actions={
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-1 sm:flex">
                <button type="button" className="rounded border border-[#1E2730] bg-[#11171C] px-2 py-1 text-[10px] text-[#A7B0B8] hover:bg-[#182128]">Layout</button>
                <button type="button" className="rounded border border-[#1E2730] bg-[#11171C] p-1 text-[#68737D] hover:bg-[#182128]"><Minus className="size-3" /></button>
                <span className="px-1 text-[10px] text-[#68737D]">100%</span>
                <button type="button" className="rounded border border-[#1E2730] bg-[#11171C] p-1 text-[#68737D] hover:bg-[#182128]"><Plus className="size-3" /></button>
                <button type="button" className="rounded border border-[#1E2730] bg-[#11171C] p-1 text-[#68737D] hover:bg-[#182128]"><Maximize2 className="size-3" /></button>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[#22C55E]">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-1.5 animate-ping rounded-full bg-[#22C55E] opacity-50" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-[#22C55E]" />
                </span>
                Live
              </span>
              <span className="text-xs text-[#68737D]">How your data becomes decisions</span>
            </div>
          }
        >
          <EvidenceGraph />
        </Panel>

        {/* Decision Queue */}
        <Panel
          title="Decision queue"
          description={`${queueItems.length} pending`}
          accent="warning"
          contentClassName="p-0"
          actions={
            <Button variant="ghost" size="sm" className="text-[#38BDF8] hover:text-[#38BDF8]/80 text-xs" onClick={() => onNavigate("approvals")}>
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
                className="py-1.5 text-center text-xs text-[#68737D] transition-colors hover:text-[#F4F7F8]"
                onClick={() => onNavigate("approvals")}
              >
                + {queueItems.length - 4} more pending
              </button>
            )}
          </div>
        </Panel>
      </div>

      {/* Proof-Backed Findings + Active Agents */}
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Panel
          title="Proof-backed findings"
          description={`${proofBackedFindings.length} findings`}
          accent="primary"
          contentClassName="p-0"
          actions={
            <Button variant="ghost" size="sm" className="text-[#38BDF8] hover:text-[#38BDF8]/80 text-xs" onClick={() => onNavigate("savings")}>
              View all findings <ArrowUpRight className="size-3 ml-1" />
            </Button>
          }
        >
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1E2730]">
                  {["Risk / Finding", "Category", "Source evidence", "Impact", "Confidence", "Owner", "Agent action", "Approval state"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#68737D] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {proofBackedFindings.map((f, idx) => (
                  <tr
                    key={f.id}
                    className={cn("cursor-pointer border-b border-[#1E2730]/50 transition-colors hover:bg-[#141B21]", idx === proofBackedFindings.length - 1 && "border-b-0")}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={cn("size-1.5 shrink-0 rounded-full", f.severity === "High" || f.severity === "Critical" ? "bg-[#EF4444]" : f.severity === "Medium" ? "bg-[#F59E0B]" : "bg-[#68737D]")} />
                        <span className="text-sm font-medium text-[#F4F7F8] whitespace-nowrap">{f.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-[#182128] px-2 py-0.5 text-[10px] font-medium text-[#A7B0B8]">{f.category}</span>
                    </td>
                    <td className="px-4 py-3 max-w-[140px]">
                      <EvidenceLink>{f.evidence}</EvidenceLink>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-sm font-semibold tabular whitespace-nowrap", f.impact < 0 ? "text-[#EF4444]" : "text-[#F4F7F8]")}>
                        {typeof f.impact === "number" ? formatCurrencyFull(Math.abs(f.impact)) : f.impact}
                      </span>
                    </td>
                    <td className="px-4 py-3 min-w-[90px]">
                      <ConfBar value={f.confidence} />
                    </td>
                    <td className="px-4 py-3 text-xs text-[#A7B0B8] whitespace-nowrap">{f.owner}</td>
                    <td className="px-4 py-3 text-xs text-[#68737D] max-w-[150px]">
                      <div className="whitespace-pre-line leading-snug">{f.agentAction}</div>
                    </td>
                    <td className="px-4 py-3">
                      <ApprovalPill state={f.approvalState} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-[#1E2730] px-4 py-2.5 text-[11px] text-[#68737D]">
              Showing 1 to {proofBackedFindings.length} of 23 findings
            </div>
          </div>
        </Panel>

        {/* Active Supervised Agents */}
        <Panel
          title="Active supervised agents"
          description={`${activeAgents.filter(a => a.status === "Active").length} of ${activeAgents.length} running`}
          accent="primary"
          contentClassName="p-0"
          actions={
            <Button variant="ghost" size="sm" className="text-[#38BDF8] hover:text-[#38BDF8]/80 text-xs" onClick={() => onNavigate("agents")}>
              View all <ArrowUpRight className="size-3 ml-1" />
            </Button>
          }
        >
          <div>
            <div className="grid grid-cols-4 border-b border-[#1E2730] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#68737D]">
              <span className="col-span-1">Agent</span>
              <span>Status</span>
              <span>Load</span>
              <span>Today</span>
            </div>
            {activeAgents.map((agent, i) => (
              <div
                key={agent.id}
                className={cn(
                  "grid grid-cols-4 items-center px-4 py-2.5 transition-colors hover:bg-[#141B21]",
                  i < activeAgents.length - 1 && "border-b border-[#1E2730]/50",
                )}
              >
                <div className="col-span-1 min-w-0">
                  <span className="block truncate text-xs font-medium text-[#F4F7F8]">{agent.name}</span>
                  <span className="text-[10px] text-[#68737D]">{agent.lastRun}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <StatusDot tone={agent.status} />
                  <span className={cn("text-[11px] font-medium", agent.status === "Active" ? "text-[#22C55E]" : agent.status === "Waiting" ? "text-[#F59E0B]" : "text-[#EF4444]")}>
                    {agent.status}
                  </span>
                </div>
                <div className="pr-3">
                  <div className="mb-0.5 flex items-center justify-between">
                    <span className="text-[9px] tabular text-[#68737D]">{agent.workload}%</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-[#1E2730]">
                    <div
                      className={cn("h-full rounded-full", agent.status === "Active" ? "bg-[#22C55E]" : "bg-[#F59E0B]")}
                      style={{ width: `${agent.workload}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-bold tabular text-[#F4F7F8]">{agent.actionsToday}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
