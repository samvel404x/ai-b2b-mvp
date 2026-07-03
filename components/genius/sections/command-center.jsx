"use client";

import { useState } from "react";
import { ArrowUpRight, Check, ChevronRight, Download, X } from "lucide-react";
import {
  commandKpis,
  evidenceGraphNodes,
  decisionQueue,
  activeAgents,
  proofBackedFindings,
  formatCurrencyFull,
} from "@/lib/genius-data";
import { PageHeader, Panel, SeverityBadge, StatePill, StatusDot, Sparkline, EvidenceLink } from "../shared";
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

function KpiCard({ label, value, trend, trendDir, tone = "neutral", sub, subTone, spark, ring, index = 0 }) {
  const up = trendDir === "up";
  const down = trendDir === "down";
  const toneClass = {
    primary: "text-primary",
    critical: "text-critical",
    evidence: "text-evidence",
    warning: "text-warning",
    neutral: "text-foreground",
  }[tone] || "text-foreground";
  const subToneClass = {
    primary: "text-primary",
    critical: "text-critical",
    warning: "text-warning",
  }[subTone] || "text-muted-foreground";

  return (
    <div
      className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-3.5 transition-all hover:border-primary/30 animate-fade-up"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-start justify-between gap-1">
        <span className="text-[11px] font-medium text-muted-foreground leading-snug">{label}</span>
        {trend && (
          <span className={cn(
            "shrink-0 text-[10px] font-semibold tabular px-1.5 py-0.5 rounded-full",
            up ? "bg-critical/10 text-critical" : down ? "bg-primary/10 text-primary" : "text-muted-foreground"
          )}>
            {trend}
          </span>
        )}
      </div>
      <div className={cn("text-xl font-semibold tracking-tight tabular leading-none", toneClass)}>
        {value}
      </div>
      {spark && <Sparkline data={spark} stroke={toneStroke[tone] || "var(--muted-foreground)"} />}
      <div className="flex items-center justify-between gap-2">
        {sub && <span className={cn("text-[11px]", subToneClass)}>{sub}</span>}
        <span className="text-[10px] text-muted-foreground">vs last 7 days</span>
      </div>
    </div>
  );
}

function EvidenceGraph() {
  const nodes = evidenceGraphNodes;
  const cols = [
    { key: "sourceEvidence", data: nodes.sourceEvidence, color: "evidence" },
    { key: "extractedFacts", data: nodes.extractedFacts, color: "evidence" },
    { key: "diagnosticRisks", data: nodes.diagnosticRisks, color: "critical" },
    { key: "agentActions", data: nodes.agentActions, color: "warning" },
    { key: "humanApprovals", data: nodes.humanApprovals, color: "primary" },
    { key: "boardReports", data: nodes.boardReports, color: "primary" },
  ];
  const colorClass = { evidence: "text-evidence border-evidence/40 bg-evidence/8", critical: "text-critical border-critical/40 bg-critical/8", warning: "text-warning border-warning/40 bg-warning/8", primary: "text-primary border-primary/40 bg-primary/8" };
  const dotColor = { evidence: "bg-evidence", critical: "bg-critical", warning: "bg-warning", primary: "bg-primary" };

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <div className="flex min-w-[900px] gap-0">
        {cols.map((col, ci) => (
          <div key={col.key} className="flex flex-1 items-start gap-0">
            <div className="flex flex-1 flex-col gap-2">
              {/* Header */}
              <div className="flex flex-col items-center gap-1 pb-1">
                <span className={cn("text-[10px] font-semibold uppercase tracking-widest", colorClass[col.color].split(" ")[0])}>
                  {col.data.label}
                </span>
                <span className="text-sm font-semibold tabular text-foreground">{col.data.count.toLocaleString()}</span>
              </div>
              {/* Node cards */}
              <div className="flex flex-col gap-1.5">
                {col.data.items.map((item, i) => (
                  <div
                    key={i}
                    className={cn("rounded-md border px-2.5 py-2 text-xs transition-colors hover:brightness-110 cursor-pointer", colorClass[col.color])}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium leading-snug">{item}</span>
                      {col.data.scores?.[i] !== undefined && (
                        <span className="tabular shrink-0 text-[10px] opacity-70">{col.data.scores[i]}</span>
                      )}
                    </div>
                    {col.data.statuses?.[i] && (
                      <div className="mt-0.5 text-[10px] opacity-60">{col.data.statuses[i]}</div>
                    )}
                    {col.data.severities?.[i] && (
                      <div className={cn("mt-0.5 text-[10px]", col.data.severities[i] === "High" ? "text-critical" : "text-warning")}>{col.data.severities[i]}</div>
                    )}
                  </div>
                ))}
                {/* Show more */}
                <button type="button" className="text-[10px] text-muted-foreground hover:text-foreground text-center py-1 transition-colors">
                  + {col.key === "sourceEvidence" ? "90 more sources" : col.key === "extractedFacts" ? "2,837 more facts" : col.key === "diagnosticRisks" ? "30 more risks" : col.key === "agentActions" ? "83 more actions" : col.key === "humanApprovals" ? "20 more" : "8 more"}
                </button>
              </div>
            </div>
            {/* Arrow connector */}
            {ci < cols.length - 1 && (
              <div className="flex items-center px-1 pt-8">
                <ChevronRight className="size-3.5 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="mt-3 flex items-center gap-6 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-evidence" />Evidence</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-muted-foreground" />Fact</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-critical" />Risk</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-warning" />Agent Action</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />Approval</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-px w-6 bg-primary opacity-50" />Report</span>
      </div>
    </div>
  );
}

function DecisionQueueItem({ item, onApprove, onReject }) {
  const priorityColor = item.priority === "High" ? "border-critical/30 bg-critical/10 text-critical" : item.priority === "Medium" ? "border-warning/30 bg-warning/10 text-warning" : "border-border bg-secondary text-muted-foreground";
  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-3 transition-colors hover:border-border/60">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className={cn("text-[10px] font-semibold uppercase tracking-wide border rounded-full px-2 py-0.5", priorityColor)}>{item.priority}</span>
        <div className="flex items-center gap-1">
          <Button size="icon" className="size-6 rounded-md bg-primary/15 text-primary hover:bg-primary/25 border-0" onClick={() => onApprove(item)}>
            <Check className="size-3" />
          </Button>
          <Button size="icon" className="size-6 rounded-md bg-critical/10 text-critical hover:bg-critical/20 border-0" onClick={() => onReject(item)}>
            <X className="size-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">Edit</Button>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-critical">Reject</Button>
        </div>
      </div>
      <p className="text-sm font-medium text-foreground leading-snug">{item.title}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="font-medium tabular text-foreground">{formatCurrencyFull(item.impact)}</span>
        <span className={cn("font-medium", item.due?.includes("overdue") ? "text-critical" : "text-warning")}>Due {item.due}</span>
        <span>Requested by {item.requestedBy}</span>
      </div>
    </div>
  );
}

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
      <PageHeader
        eyebrow="Command Center"
        title="Evidence-backed operations. Real-time insights. Approval-first execution."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="size-3.5 mr-1.5" />
              Export summary
            </Button>
            <Button size="sm" onClick={() => onNavigate("data")}>
              Import data
            </Button>
          </>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
        {commandKpis.map((kpi, i) => (
          <KpiCard key={kpi.label} index={i} {...kpi} />
        ))}
      </div>

      {/* Evidence Graph */}
      <Panel
        title="Evidence graph"
        description="How your data becomes decisions"
        actions={
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-1.5 animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
              </span>
              Live
            </span>
            <span className="text-xs text-muted-foreground">How your data becomes decisions</span>
          </div>
        }
      >
        <EvidenceGraph />
      </Panel>

      {/* Bottom grid: Findings + Decision Queue + Agents */}
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        {/* Proof-Backed Findings table */}
        <Panel
          title="Proof-backed findings"
          description={`${proofBackedFindings.length} findings`}
          contentClassName="p-0"
          actions={
            <Button variant="ghost" size="sm" onClick={() => onNavigate("savings")}>
              View all findings
              <ArrowUpRight className="size-3.5 ml-1" />
            </Button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Risk / Finding", "Category", "Source evidence", "Impact", "Confidence", "Owner", "Agent action", "Approval state"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {proofBackedFindings.map((f) => (
                  <tr key={f.id} className="group cursor-pointer transition-colors hover:bg-secondary/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={cn("size-1.5 rounded-full shrink-0", f.severity === "High" || f.severity === "Critical" ? "bg-critical" : f.severity === "Medium" ? "bg-warning" : "bg-muted-foreground")} />
                        <span className="font-medium text-foreground text-sm">{f.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{f.category}</span>
                    </td>
                    <td className="px-4 py-3 max-w-[140px]">
                      <EvidenceLink>{f.evidence}</EvidenceLink>
                    </td>
                    <td className="px-4 py-3 tabular font-medium text-foreground whitespace-nowrap">
                      {typeof f.impact === "number" ? formatCurrencyFull(Math.abs(f.impact)) : f.impact}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Progress value={f.confidence} className="h-1 w-14" />
                        <span className="text-xs tabular text-muted-foreground">{f.confidence}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{f.owner}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[160px]">
                      <div className="whitespace-pre-line leading-snug">{f.agentAction}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatePill state={f.approvalState === "Open" ? "Pending" : f.approvalState === "In progress" ? "In review" : "In review"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
              Showing 1 to {proofBackedFindings.length} of {proofBackedFindings.length} findings
            </div>
          </div>
        </Panel>

        {/* Right column: Decision Queue + Active Agents */}
        <div className="flex flex-col gap-5">
          <Panel
            title="Decision queue"
            description={`${queueItems.length} pending`}
            contentClassName="p-0"
            actions={
              <Button variant="ghost" size="sm" onClick={() => onNavigate("approvals")}>
                View all
                <ArrowUpRight className="size-3.5 ml-1" />
              </Button>
            }
          >
            <div className="flex flex-col gap-2 p-3">
              {queueItems.slice(0, 4).map(item => (
                <DecisionQueueItem key={item.id} item={item} onApprove={handleApprove} onReject={handleReject} />
              ))}
              {queueItems.length > 4 && (
                <button type="button" className="text-xs text-muted-foreground hover:text-foreground py-1 text-center transition-colors" onClick={() => onNavigate("approvals")}>
                  + {queueItems.length - 4} more pending
                </button>
              )}
            </div>
          </Panel>

          <Panel
            title="Active supervised agents"
            description={`${activeAgents.filter(a => a.status === "Active").length} of ${activeAgents.length} running`}
            contentClassName="p-0"
            actions={
              <Button variant="ghost" size="sm" onClick={() => onNavigate("agents")}>
                View all
                <ArrowUpRight className="size-3.5 ml-1" />
              </Button>
            }
          >
            <div className="divide-y divide-border">
              <div className="grid grid-cols-4 px-4 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                <span className="col-span-1">Agent</span>
                <span>Status</span>
                <span>Workload</span>
                <span>Actions</span>
              </div>
              {activeAgents.map(agent => (
                <div key={agent.id} className="grid grid-cols-4 items-center px-4 py-2.5 hover:bg-secondary/30 transition-colors">
                  <div className="col-span-1 flex items-center gap-2">
                    <span className="size-1.5 rounded-full shrink-0 bg-muted-foreground" />
                    <span className="text-xs font-medium truncate">{agent.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StatusDot tone={agent.status} />
                    <span className="text-xs text-muted-foreground">{agent.status}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Progress value={agent.workload} className="h-1 w-12" />
                    <span className="text-xs tabular text-muted-foreground">{agent.workload}%</span>
                  </div>
                  <span className="text-xs tabular text-foreground font-medium">{agent.actionsToday}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
