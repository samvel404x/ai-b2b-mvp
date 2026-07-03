"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Bot, Play, ShieldAlert, ChevronRight, X, ExternalLink,
  ListChecks, Wrench, Shield, FileText, Settings2, LayoutGrid,
  CheckCircle2, Clock, Loader2, AlertTriangle, Filter,
} from "lucide-react";
import {
  agents, agentKpis, agentRunHistory, agentTaskBoard, agentDetailByName,
} from "@/lib/genius-data";
import { Ring, StatusDot } from "../shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Workload bar ──────────────────────────────────────────────────────────────
function WorkloadBar({ value, tone }) {
  const color = tone === "critical" ? "bg-critical" : tone === "warning" ? "bg-warning" : "bg-primary";
  const label = value >= 70 ? "High" : value >= 40 ? "Medium" : "Low";
  const labelColor = value >= 70 ? "text-critical" : value >= 40 ? "text-warning" : "text-primary";
  return (
    <div className="flex flex-col gap-1 min-w-[80px]">
      <span className={cn("text-[11px] font-semibold", labelColor)}>{label}</span>
      <div className="h-1.5 w-full rounded-full bg-white/6 overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

// ── Confidence donut ──────────────────────────────────────────────────────────
function ConfidenceDonut({ value }) {
  const r = 16;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const color = value >= 85 ? "var(--primary)" : value >= 70 ? "var(--warning)" : "var(--critical)";
  return (
    <div className="relative inline-flex items-center justify-center w-11 h-11">
      <svg width="44" height="44" className="-rotate-90">
        <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
        <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 3px ${color}80)` }} />
      </svg>
      <span className="absolute text-[11px] font-bold tabular text-foreground">{value}%</span>
    </div>
  );
}

// ── KPI strip card ────────────────────────────────────────────────────────────
function AgentKpi({ label, value, sub, tone, index }) {
  const valColor = tone === "primary" ? "text-primary" : tone === "critical" ? "text-critical" : tone === "warning" ? "text-warning" : "text-foreground";
  const subUp = sub?.startsWith("+");
  const subDown = sub?.startsWith("-");
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[#ffffff08] bg-[#0a0c0b] p-3.5 animate-fade-up hover:border-[#1a2820] transition-colors"
      style={{ animationDelay: `${index * 40}ms` }}>
      <span className="text-[10px] font-medium text-[#4a5450] uppercase tracking-wide leading-none">{label}</span>
      <span className={cn("text-xl font-bold tabular leading-none", valColor)}>{value}</span>
      <span className={cn("text-[10px] tabular", subUp ? "text-primary" : subDown ? "text-critical" : "text-[#4a5450]")}>{sub}</span>
    </div>
  );
}

// ── Detail panel tab ──────────────────────────────────────────────────────────
const TABS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "guardrails", label: "Guardrails", icon: Shield },
  { id: "tools", label: "Tools", icon: Wrench },
  { id: "tasks", label: "Tasks", icon: ListChecks },
  { id: "prooftrails", label: "Proof trails", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings2 },
];

function DetailPanel({ agent, detail, onClose, onNavigate }) {
  const [tab, setTab] = useState("overview");

  const priorityColor = { Urgent: "text-critical", High: "text-warning", Medium: "text-evidence", Low: "text-[#5a6660]" };

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-xl border border-[#ffffff08] bg-[#0a0c0b]">
      {/* Panel header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#ffffff06]">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-[#16211b]">
            <Bot className="size-3.5 text-primary" />
          </div>
          <span className="font-semibold text-foreground">{agent.name}</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            {agent.status}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => onNavigate?.("approvals")} className="rounded px-2 py-1 text-[11px] text-evidence hover:text-evidence/70 transition-colors">
            View outputs →
          </button>
          <button type="button" onClick={onClose} className="rounded p-1 text-[#4a5450] hover:text-foreground hover:bg-white/5 transition-colors">
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 px-3 pt-2 border-b border-[#ffffff06] overflow-x-auto scrollbar-thin">
        {TABS.map(t => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={cn("flex items-center gap-1.5 px-2.5 py-2 text-[11px] font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
              tab === t.id ? "border-primary text-foreground" : "border-transparent text-[#4a5450] hover:text-[#8a9490]")}>
            <t.icon className="size-3" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === "overview" && detail && (
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
          <p className="text-xs text-[#5a6660] leading-relaxed">{detail.description}</p>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Workload", value: detail.workload, tone: detail.workloadTone },
              { label: "Last run", value: detail.lastRun.split("\n")[0] },
              { label: "Outputs (24h)", value: detail.outputs24h, sub: detail.outputsDelta },
              { label: "Confidence", value: null, conf: detail.confidence },
            ].map((s, i) => (
              <div key={i} className="flex flex-col gap-1 rounded-lg border border-[#ffffff06] bg-[#0d0f0e] p-2.5">
                <span className="text-[10px] text-[#4a5450]">{s.label}</span>
                {s.conf !== undefined ? (
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="text-sm font-bold tabular text-primary">{s.conf}%</span>
                    <span className="text-[10px] text-[#4a5450]">{detail.guardrails}</span>
                  </div>
                ) : (
                  <span className={cn("text-sm font-bold tabular",
                    s.tone === "critical" ? "text-critical" : s.tone === "warning" ? "text-warning" : "text-foreground")}>
                    {s.value}
                  </span>
                )}
                {s.sub && <span className="text-[10px] text-primary">{s.sub}</span>}
              </div>
            ))}
          </div>

          {/* Allowed tools + Recent outputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-[#8a9490]">Allowed tools</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {detail.allowedTools.map(t => (
                  <span key={t} className="rounded-md border border-[#ffffff08] bg-[#0d0f0e] px-2 py-1 text-[10px] text-[#8a9490]">{t}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-[#8a9490]">Recent outputs</span>
                <button type="button" className="text-[10px] text-evidence hover:text-evidence/70">View all (23) →</button>
              </div>
              <div className="space-y-1.5">
                {detail.recentOutputs.map((o, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <span className="truncate text-[11px] text-[#8a9490]">{o.title}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-[#4a5450]">{o.time}</span>
                      <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-semibold",
                        o.state === "New" ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning")}>{o.state}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Blocked external actions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-[#8a9490]">Blocked external actions</span>
            </div>
            <div className="space-y-1">
              {detail.blockedActions.map((a, i) => (
                <div key={i} className="flex items-center justify-between rounded-md border border-[#ffffff06] bg-[#0d0f0e] px-3 py-1.5">
                  <span className="text-[11px] text-[#8a9490]">{a}</span>
                  <span className="rounded px-2 py-0.5 text-[10px] font-semibold bg-critical/10 text-critical border border-critical/20">Blocked</span>
                </div>
              ))}
            </div>
          </div>

          {/* Proof trails + Current tasks side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-[#8a9490]">Linked proof trails</span>
                <button type="button" className="text-[10px] text-evidence hover:text-evidence/70">View all (24) →</button>
              </div>
              <div className="space-y-1.5">
                {detail.proofTrails.map((pt, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="shrink-0 rounded border border-evidence/25 bg-evidence/10 px-1.5 py-0.5 text-[9px] font-bold text-evidence">{pt.id}</span>
                      <span className="truncate text-[11px] text-[#8a9490]">{pt.title}</span>
                    </div>
                    <span className="shrink-0 text-[10px] text-[#4a5450]">{pt.time}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-[#8a9490]">Current tasks</span>
                <button type="button" className="text-[10px] text-evidence hover:text-evidence/70">View all (5) →</button>
              </div>
              <div className="space-y-1.5">
                {detail.currentTasks.map((t, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <span className="truncate text-[11px] text-[#8a9490]">{t.title}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={cn("text-[10px] font-medium", priorityColor[t.priority] || "text-[#5a6660]")}>{t.priority}</span>
                      <span className="text-[10px] text-[#4a5450]">{t.eta}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Approval queue */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-[#8a9490]">Approval queue for this agent</span>
              <button type="button" className="text-[10px] text-evidence hover:text-evidence/70">View all (4) →</button>
            </div>
            <div className="space-y-1.5">
              {detail.approvalQueue.map((aq, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-[#ffffff06] bg-[#0d0f0e] px-3 py-2">
                  <span className={cn("size-2 rounded-full shrink-0",
                    aq.priority === "Urgent" ? "bg-critical" : aq.priority === "High" ? "bg-warning" : aq.priority === "Medium" ? "bg-evidence" : "bg-primary")} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium text-foreground truncate">{aq.title}</div>
                    <div className="text-[10px] text-[#5a6660]">{aq.impact}</div>
                  </div>
                  <span className={cn("shrink-0 text-[10px] font-semibold tabular",
                    aq.priority === "Urgent" ? "text-critical" : aq.priority === "High" ? "text-warning" : "text-[#5a6660]")}>{aq.due}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Other tabs placeholder */}
      {tab !== "overview" && (
        <div className="flex flex-1 items-center justify-center text-[#3a4040] text-sm p-8">
          {TABS.find(t => t.id === tab)?.label} — coming soon
        </div>
      )}
    </div>
  );
}

// ── Task board card ───────────────────────────────────────────────────────────
function BoardCard({ task, col }) {
  const agentColor = { "Contract Analyst": "text-evidence", "Spend Auditor": "text-warning", "Finance Watcher": "text-primary" };
  return (
    <div className="rounded-lg border border-[#ffffff08] bg-[#0d0f0e] p-2.5 space-y-1.5 hover:border-[#1a2820] transition-colors">
      <p className="text-[11px] text-foreground leading-snug">{task.title.split("\n")[0]}</p>
      {task.title.includes("\n") && (
        <p className="text-[10px] text-[#5a6660]">{task.title.split("\n")[1]}</p>
      )}
      <div className="flex items-center justify-between gap-1">
        <span className={cn("text-[10px] font-medium truncate", agentColor[task.agent] || "text-[#5a6660]")}>{task.agent}</span>
        {task.duration && <span className="text-[10px] text-[#4a5450] shrink-0">{task.duration}</span>}
        {task.confidence !== null && task.confidence !== undefined && (
          <span className={cn("text-[10px] font-bold tabular shrink-0",
            task.confidence >= 70 ? "text-primary" : task.confidence >= 50 ? "text-warning" : "text-critical")}>
            {task.confidence}%
          </span>
        )}
        {task.flag && <AlertTriangle className="size-3 text-warning shrink-0" />}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Agents({ onNavigate }) {
  const [selected, setSelected] = useState([]);
  const [activeAgent, setActiveAgent] = useState(agents[0]);

  function toggleRow(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  const detail = agentDetailByName[activeAgent?.name];

  const boardCols = [
    { id: "queued", label: "Queued", count: agentTaskBoard.queued.length, icon: Clock, color: "text-[#5a6660]", headerBg: "bg-[#ffffff06]" },
    { id: "analyzing", label: "Analyzing", count: agentTaskBoard.analyzing.length, icon: Loader2, color: "text-evidence", headerBg: "bg-evidence/8" },
    { id: "drafted", label: "Drafted", count: agentTaskBoard.drafted.length, icon: FileText, color: "text-warning", headerBg: "bg-warning/8" },
    { id: "completed", label: "Completed", count: agentTaskBoard.completed.length, icon: CheckCircle2, color: "text-primary", headerBg: "bg-primary/8" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* ── KPI strip ── */}
      <div className="grid grid-cols-4 gap-2 lg:grid-cols-8">
        {agentKpis.map((k, i) => (
          <AgentKpi key={k.label} {...k} index={i} />
        ))}
      </div>

      {/* ── Main split: table left, detail right ── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_400px]">
        {/* Left column */}
        <div className="flex flex-col gap-4 min-w-0">

          {/* Supervised agents table */}
          <div className="rounded-xl border border-[#ffffff08] bg-[#0a0c0b] overflow-hidden">
            {/* Table header bar */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#ffffff06]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground text-sm">Supervised agents</span>
                <span className="rounded-full bg-[#ffffff08] px-2 py-0.5 text-[11px] text-[#5a6660]">{agents.length}</span>
              </div>
              <div className="flex items-center gap-2">
                {["All status", "All types", "All risk levels"].map(f => (
                  <button key={f} type="button"
                    className="flex items-center gap-1 rounded-md border border-[#ffffff08] bg-transparent px-2.5 py-1 text-[11px] text-[#5a6660] hover:border-[#1a2820] hover:text-[#8a9490] transition-colors">
                    {f} <ChevronRight className="size-3 rotate-90" />
                  </button>
                ))}
                <button type="button"
                  className="flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] text-primary hover:bg-primary/10 transition-colors">
                  <ShieldAlert className="size-3" />Configure guardrails
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[860px] text-[11px]">
                <thead>
                  <tr className="border-b border-[#ffffff06]">
                    {["AGENT", "STATUS", "WORKLOAD", "LAST RUN", "OUTPUTS (24H)", "CONFIDENCE", "GUARDRAILS", "CURRENT QUEUE", "ASSIGNED RISKS", "NEXT ACTION"].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-semibold text-[#4a5450] whitespace-nowrap first:pl-4 last:pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {agents.map(a => {
                    const isActive = activeAgent?.id === a.id;
                    return (
                      <tr key={a.id}
                        onClick={() => setActiveAgent(a)}
                        className={cn(
                          "border-b border-[#ffffff04] cursor-pointer transition-colors",
                          isActive ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-white/[0.02]",
                        )}>
                        {/* Agent */}
                        <td className="px-3 py-2.5 first:pl-4">
                          <div className="flex items-center gap-2">
                            <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[#16211b]">
                              <Bot className="size-3.5 text-primary" />
                            </div>
                            <div>
                              <div className="font-semibold text-foreground whitespace-nowrap">{a.name}</div>
                              <div className="text-[10px] text-[#4a5450]">{a.role}</div>
                            </div>
                          </div>
                        </td>
                        {/* Status */}
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <StatusDot tone={a.status} pulse={a.status === "Active"} />
                            <span className={cn("font-medium",
                              a.status === "Active" ? "text-primary" : a.status === "Idle" ? "text-[#5a6660]" : "text-warning")}>
                              {a.status}
                            </span>
                          </div>
                        </td>
                        {/* Workload */}
                        <td className="px-3 py-2.5">
                          <WorkloadBar value={a.workload}
                            tone={a.workload >= 70 ? "critical" : a.workload >= 40 ? "warning" : "ok"} />
                        </td>
                        {/* Last run */}
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <div className="text-[#8a9490]">{a.lastRun}</div>
                          <div className="text-[10px] text-[#4a5450]">{a.lastRunFull}</div>
                        </td>
                        {/* Outputs */}
                        <td className="px-3 py-2.5 tabular">
                          <span className="font-semibold text-foreground">{a.outputs}</span>
                          <span className="ml-1 text-primary">{a.outputsDelta}</span>
                        </td>
                        {/* Confidence donut */}
                        <td className="px-3 py-2.5">
                          <ConfidenceDonut value={a.confidence} />
                        </td>
                        {/* Guardrails */}
                        <td className="px-3 py-2.5">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-primary font-medium">On</span>
                            <span className="text-[#5a6660]">{a.guardrailsState}</span>
                          </div>
                        </td>
                        {/* Queue */}
                        <td className="px-3 py-2.5 tabular text-[#8a9490]">{a.queue}</td>
                        {/* Risks */}
                        <td className="px-3 py-2.5">
                          {a.risks.split("\n").map((r, i) => (
                            <div key={i} className={cn("text-[10px]", i === 0 ? "text-[#8a9490]" : "text-[#4a5450]")}>{r}</div>
                          ))}
                          {a.risksCount > 0 && <div className="text-[10px] text-[#4a5450]">{a.risksCount} pending</div>}
                        </td>
                        {/* Next action */}
                        <td className="px-3 py-2.5 last:pr-4">
                          {a.nextAction.split("\n").map((r, i) => (
                            <div key={i} className={cn("text-[10px]", i === 0 ? "text-[#8a9490]" : "text-[#4a5450]")}>{r}</div>
                          ))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#ffffff06] text-[10px] text-[#4a5450]">
              <span>Showing 1 to {agents.length} of {agents.length} agents</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />Low (0–39%)</span>
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-warning" />Medium (40–69%)</span>
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-critical" />High (70–100%)</span>
              </div>
            </div>
          </div>

          {/* Bottom row: run history + task board */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
            {/* Run history */}
            <div className="rounded-xl border border-[#ffffff08] bg-[#0a0c0b] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#ffffff06]">
                <div>
                  <span className="text-sm font-semibold text-foreground">Run history</span>
                  <span className="ml-2 text-[11px] text-[#4a5450]">({activeAgent?.name})</span>
                </div>
                <button type="button" className="text-[11px] text-evidence hover:text-evidence/70 transition-colors">
                  View full history →
                </button>
              </div>
              <div className="divide-y divide-[#ffffff04]">
                {agentRunHistory.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                    <CheckCircle2 className="size-3.5 shrink-0 text-primary" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#8a9490]">{r.time}</span>
                        <span className="text-[10px] text-[#4a5450]">Run completed</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-[#4a5450]">
                        <span className="text-primary">{r.outputs} outputs</span>
                        {r.incidents === 0 && <span>0 incidents</span>}
                        {r.duration && <span>{r.duration}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Task board */}
            <div className="rounded-xl border border-[#ffffff08] bg-[#0a0c0b] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#ffffff06]">
                <span className="text-sm font-semibold text-foreground">Agent task board <span className="text-[#4a5450] font-normal text-xs">(All agents)</span></span>
                <Filter className="size-3.5 text-[#4a5450]" />
              </div>
              <div className="grid grid-cols-4 divide-x divide-[#ffffff06]">
                {boardCols.map(col => (
                  <div key={col.id} className="flex flex-col gap-0">
                    {/* Column header */}
                    <div className={cn("flex items-center justify-between px-3 py-2 border-b border-[#ffffff06]", col.headerBg)}>
                      <div className="flex items-center gap-1.5">
                        <col.icon className={cn("size-3", col.color)} />
                        <span className={cn("text-[11px] font-semibold", col.color)}>{col.label}</span>
                      </div>
                      <span className="rounded-full bg-[#ffffff08] px-1.5 py-0.5 text-[10px] text-[#5a6660]">{col.count}</span>
                    </div>
                    {/* Cards */}
                    <div className="flex flex-col gap-2 p-2.5">
                      {agentTaskBoard[col.id].map((task, i) => (
                        <BoardCard key={i} task={task} col={col.id} />
                      ))}
                      {agentTaskBoard[col.id].length > 3 && (
                        <button type="button" className="text-center text-[10px] text-evidence hover:text-evidence/70 py-1 transition-colors">
                          + {agentTaskBoard[col.id].length - 3} more
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom action bar */}
          <div className="flex items-center gap-2 rounded-xl border border-[#ffffff08] bg-[#0a0c0b] p-3">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs px-4"
              onClick={() => toast.success("Running selected agents")}>
              <Play className="size-3 mr-1.5" />Run selected
            </Button>
            <Button size="sm" variant="outline" className="border-[#ffffff10] bg-transparent text-[#8a9490] hover:bg-white/5 text-xs"
              onClick={() => toast.success("Running all agents")}>
              Run all agents
            </Button>
            <Button size="sm" variant="outline" className="border-[#ffffff10] bg-transparent text-[#8a9490] hover:bg-white/5 text-xs"
              onClick={() => onNavigate("approvals")}>
              View outputs
            </Button>
            <Button size="sm" variant="outline" className="border-warning/25 bg-warning/5 text-warning hover:bg-warning/10 text-xs"
              onClick={() => onNavigate("approvals")}>
              Review approvals (8)
            </Button>
            <Button size="sm" variant="outline" className="border-[#ffffff10] bg-transparent text-[#8a9490] hover:bg-white/5 text-xs ml-auto">
              Configure agents
            </Button>
          </div>
        </div>

        {/* Right: Detail panel */}
        <div className="h-full min-h-[600px]">
          {detail ? (
            <DetailPanel
              agent={activeAgent}
              detail={detail}
              onClose={() => setActiveAgent(null)}
              onNavigate={onNavigate}
            />
          ) : (
            <div className="flex h-full min-h-[400px] items-center justify-center rounded-xl border border-[#ffffff08] bg-[#0a0c0b] text-sm text-[#3a4040]">
              Select an agent to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
