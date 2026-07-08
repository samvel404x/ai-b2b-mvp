"use client";

import { useState, useEffect } from "react";
import {
  ArrowUpRight, Bot, ChevronRight, Play, Pause, ChevronDown, ChevronLeft,
  Settings, X, Clock, CheckCircle2, AlertTriangle, ArrowRight, Activity, Search,
  Download, RefreshCw, Zap, Shield, FileText, Lock, LayoutGrid, Calendar, Inbox
} from "lucide-react";
import {
  agents, agentKpis, agentRunHistory, agentTaskBoard,
  agentDetailByName,
} from "@/lib/genius-data";
import { ConfBar, Panel, Ring, Sparkline, StatusDot, SeverityBadge } from "../shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

const toneStroke = {
  primary: "var(--primary)", critical: "var(--critical)",
  evidence: "var(--evidence)", warning: "var(--warning)", neutral: "rgba(255,255,255,0.2)",
};
const toneText = {
  primary: "text-primary", critical: "text-critical",
  evidence: "text-evidence", warning: "text-warning", neutral: "text-white",
};

function AgentKpiCard({ label, value, sub, tone = "neutral", index = 0 }) {
  const iconMap = {
    "Active agents": Shield,
    "Queued workloads": Inbox,
    "Outputs today": FileText,
    "Guardrail incidents": Shield,
    "Avg runtime": Clock,
    "Approvals pending": CheckCircle2,
    "Agent confidence": Zap,
    "External actions blocked": Lock,
  };
  const Icon = iconMap[label] || Activity;
  const isRing = ["Agent confidence", "Active agents"].includes(label);
  const ringValue = label === "Active agents" ? 100 : (parseInt(value) || 0);

  return (
    <div
      className="group relative flex min-w-[160px] flex-1 animate-fade-up flex-col gap-3 rounded-xl border border-[#1E2730] bg-[#0A0C0B] p-4 transition-all hover:bg-[#141B21]"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-3 mt-1">
        {isRing ? (
          <div className="relative flex size-10 items-center justify-center">
             <svg viewBox="0 0 36 36" className="absolute inset-0 size-full -rotate-90">
               <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
               <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={toneStroke[tone] || "var(--primary)"} strokeWidth="3" strokeDasharray={`${ringValue}, 100`} />
             </svg>
             <Icon className={cn("size-3.5 absolute", toneText[tone] || "text-white")} />
          </div>
        ) : (
          <div className={cn("flex size-10 items-center justify-center rounded-full border border-[#1E2730] bg-[#141B21]", toneText[tone] || "text-white")}>
            <Icon className="size-4" />
          </div>
        )}
        <div className="flex flex-col">
          <span className={cn("text-2xl font-bold tabular-nums leading-none text-white", toneText[tone] || "text-white")}>{value}</span>
          {sub && <span className={cn("text-[10px] font-bold mt-1", toneText[tone] || "text-muted-foreground")}>{sub}</span>}
        </div>
      </div>
    </div>
  );
}

const stageLeftBorder = {
  queued:    "border-l-[#EF4444]",
  analyzing: "border-l-[#38BDF8]",
  drafted:   "border-l-[#F59E0B]",
  completed: "border-l-[#22C55E]",
};
const stageQuickAction = {
  queued:    { label: "View details", icon: ArrowUpRight },
  analyzing: { label: "View details", icon: ArrowUpRight },
  drafted:   { label: "Approve",      icon: CheckCircle2  },
  completed: { label: "View details", icon: ArrowUpRight },
};

function TaskCard({ task, stage }) {
  const stageBorder = {
    queued:    "border-[#1E2730]",
    analyzing: "border-[#3b82f6]/20",
    drafted:   "border-warning/20",
    completed: "border-primary/20",
  }[stage] || "border-[#1E2730]";

  const leftBorder = stageLeftBorder[stage] || "border-l-[#1E2730]";
  const action     = stageQuickAction[stage];
  const ActionIcon = action?.icon;
  const hasConfidence = task.confidence !== null && task.confidence !== undefined;

  return (
    <div className={cn(
      "group relative rounded-lg border border-l-2 bg-[#0A0C0B] p-3 transition-colors hover:bg-[#141B21] flex flex-col gap-2",
      stageBorder,
      leftBorder,
    )}>
      <p className="text-[10px] font-medium text-white leading-snug whitespace-pre-line">{task.title}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {/* Agent chip */}
          <span className="inline-flex items-center gap-1 rounded-full border border-[#1E2730] bg-[#141B21] px-1.5 py-0.5 text-[8px] font-medium text-muted-foreground truncate max-w-[90px]">
            <Bot className="size-2.5 shrink-0" />
            {task.agent}
          </span>
          {task.flag && (
            <AlertTriangle className="size-3 text-warning shrink-0" />
          )}
        </div>

        <div className="flex items-center gap-2">
          {task.duration && (
            <span className="text-[9px] text-muted-foreground">{task.duration}</span>
          )}
          {/* Confidence ring */}
          {hasConfidence && (
            <div className="relative flex size-7 items-center justify-center shrink-0">
              <svg viewBox="0 0 36 36" className="absolute inset-0 size-full -rotate-90">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--primary)" strokeWidth="4" strokeDasharray={`${task.confidence}, 100`} />
              </svg>
              <span className="text-[8px] font-bold text-white leading-none">{task.confidence}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Hover quick-action */}
      {action && (
        <button
          type="button"
          onClick={() => toast.info(`${action.label}: ${task.title}`)}
          className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 right-2 flex items-center gap-1 rounded border border-[#1E2730] bg-[#0A0C0B] px-1.5 py-0.5 text-[8px] font-medium text-white hover:bg-[#141B21]"
        >
          <ActionIcon className="size-2.5" />
          {action.label}
        </button>
      )}
    </div>
  );
}

export default function Agents({ onNavigate }) {
  const [selectedAgent, setSelectedAgent] = useState(agents[0]);
  const [activeTab, setActiveTab] = useState("Overview");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Improvement 2: Run state machine
  const [runningAgentId, setRunningAgentId] = useState(null);

  // Improvement 3: Guardrail toggle per-agent — keyed by agent id
  const [guardrailStates, setGuardrailStates] = useState({});
  const [guardrailPending, setGuardrailPending] = useState(null); // { agentId, newStrict }

  // Improvement 5: Workload bar mount animation
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const allAgents = Array.from({ length: 24 }).map((_, i) => ({
    ...agents[i % agents.length],
    id: `A-${i + 1}`,
    name: `${agents[i % agents.length].name}${i > 5 ? ` (#${i+1})` : ''}`
  }));

  const totalPages = Math.ceil(allAgents.length / rowsPerPage);
  const paginatedAgents = allAgents.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Improvement 1: proper fallback placeholder instead of hardcoded "Contract Analyst"
  const detail = agentDetailByName[selectedAgent?.name] ?? agentDetailByName[agents[0]?.name] ?? null;

  // Improvement 2: Run handler
  function handleRunAgent(agent) {
    if (runningAgentId === agent.id) return;
    setRunningAgentId(agent.id);
    setTimeout(() => {
      setRunningAgentId(null);
      toast.success(`${agent.name} completed. 3 new findings added.`);
    }, 2500);
  }

  // Improvement 3: Guardrail helpers
  function getGuardrailMode(ag) {
    return guardrailStates[ag.id] ?? (ag.guardrailsState ?? "Strict");
  }
  function requestGuardrailToggle(ag) {
    const current = getGuardrailMode(ag);
    // Only warn when lowering (Strict → Standard or disabling)
    if (current === "Strict" || current === "Standard") {
      setGuardrailPending({ agentId: ag.id, agentName: ag.name, current });
    } else {
      // Was already Off — just re-enable silently
      setGuardrailStates(s => ({ ...s, [ag.id]: "Strict" }));
      toast.success(`Guardrails re-enabled for ${ag.name}`);
    }
  }
  function confirmGuardrailToggle() {
    if (!guardrailPending) return;
    const next = guardrailPending.current === "Strict" ? "Standard" : "Off";
    setGuardrailStates(s => ({ ...s, [guardrailPending.agentId]: next }));
    toast.warning(`Guardrails set to "${next}" for ${guardrailPending.agentName}. Monitor autonomous actions closely.`);
    setGuardrailPending(null);
  }
  function cancelGuardrailToggle() {
    setGuardrailPending(null);
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#050505]">
      
      {/* Scrollable container for main content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 pb-24 flex flex-col gap-6">
        {/* KPI Strip */}
        <div className="flex flex-wrap gap-4">
          {agentKpis.map((kpi, i) => (
            <AgentKpiCard key={kpi.label} {...kpi} index={i} />
          ))}
        </div>

        {/* Main Grid: 8 Cols Left / 4 Cols Right */}
        <div className="grid grid-cols-12 gap-6 items-start h-full pb-10">
          
          {/* Left Column */}
          <div className="col-span-12 xl:col-span-8 flex flex-col gap-6 h-full">
            {/* Supervised Agents Panel */}
            <div className="flex flex-col rounded-xl border border-[#1E2730] bg-[#0A0C0B] overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#1E2730] px-5 py-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-[13px] font-bold text-white">Supervised agents</h2>
                  <span className="flex items-center justify-center rounded-full bg-[#141B21] px-2 py-0.5 text-[10px] font-semibold text-muted-foreground border border-[#1E2730]">
                    6
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1.5 rounded border border-[#1E2730] bg-transparent px-3 py-1.5 text-[10px] font-medium text-muted-foreground hover:bg-[#141B21] transition-colors">
                        All status <ChevronDown className="size-3" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32 border-[#1E2730] bg-[#0A0C0B] text-muted-foreground">
                      <DropdownMenuItem onClick={() => toast.success("Filtered by status")} className="text-[11px] focus:bg-[#1E2730] focus:text-white">Active</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1.5 rounded border border-[#1E2730] bg-transparent px-3 py-1.5 text-[10px] font-medium text-muted-foreground hover:bg-[#141B21] transition-colors">
                        All types <ChevronDown className="size-3" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32 border-[#1E2730] bg-[#0A0C0B] text-muted-foreground">
                      <DropdownMenuItem onClick={() => toast.success("Filtered by type")} className="text-[11px] focus:bg-[#1E2730] focus:text-white">Type A</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1.5 rounded border border-[#1E2730] bg-transparent px-3 py-1.5 text-[10px] font-medium text-muted-foreground hover:bg-[#141B21] transition-colors">
                        All risk levels <ChevronDown className="size-3" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32 border-[#1E2730] bg-[#0A0C0B] text-muted-foreground">
                      <DropdownMenuItem onClick={() => toast.success("Filtered by risk")} className="text-[11px] focus:bg-[#1E2730] focus:text-white">High Risk</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <button onClick={() => toast.info("Configure guardrails")} className="flex items-center gap-1.5 rounded border border-[#1E2730] bg-transparent px-3 py-1.5 text-[10px] font-medium text-white hover:bg-[#141B21] transition-colors ml-2">
                    <Shield className="size-3 text-muted-foreground" /> Configure guardrails
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-[#1E2730] bg-[#0A0C0B]">
                      <th className="py-3 px-5 font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Agent</th>
                      <th className="py-3 px-3 font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Status</th>
                      <th className="py-3 px-3 font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Workload</th>
                      <th className="py-3 px-3 font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Last Run</th>
                      <th className="py-3 px-3 font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Outputs (24H)</th>
                      <th className="py-3 px-3 font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Confidence</th>
                      <th className="py-3 px-3 font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Guardrails</th>
                      <th className="py-3 px-3 font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Current Queue</th>
                      <th className="py-3 px-3 font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Assigned Risks</th>
                      <th className="py-3 px-5 font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Next Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2730]">
                    {paginatedAgents.map((ag) => (
                      <tr 
                        key={ag.id} 
                        onClick={() => setSelectedAgent(ag)}
                        className={cn(
                          "group cursor-pointer transition-colors hover:bg-[#141B21]",
                          selectedAgent.id === ag.id ? "bg-[#141B21] border-l-2 border-primary" : "border-l-2 border-transparent"
                        )}
                      >
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-3">
                            <div className="flex size-7 items-center justify-center rounded bg-[#0A0C0B] border border-[#1E2730] text-muted-foreground">
                              <Bot className="size-3.5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-white">{ag.name}</span>
                              <span className="text-[10px] text-muted-foreground">{ag.role}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <StatusDot tone={ag.status === "Active" ? "primary" : "neutral"} className="size-1.5" />
                            <span className={ag.status === "Active" ? "text-primary font-medium" : "text-muted-foreground"}>{ag.status}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 w-32">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className={ag.workload > 70 ? "text-warning" : ag.workload > 40 ? "text-evidence" : "text-primary"}>
                                {ag.workload > 70 ? "High" : ag.workload > 40 ? "Medium" : "Low"}
                              </span>
                              <span className="text-white font-medium">{ag.workload}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-[#1E2730] overflow-hidden">
                              <div 
                                className={cn("h-full rounded-full", ag.workload > 70 ? "bg-warning" : ag.workload > 40 ? "bg-evidence" : "bg-primary")} 
                                style={{ width: mounted ? `${ag.workload}%` : "0%", transition: "width 1s ease-out" }} 
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-white">{ag.lastRun}</span>
                            <span className="text-[9px] text-muted-foreground">{ag.lastRunFull.split(", ")[1]}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span className="text-white text-sm font-semibold">{ag.outputs}</span>
                            <span className="text-[9px] text-primary">{ag.outputsDelta}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="relative flex size-8 items-center justify-center">
                            <svg viewBox="0 0 36 36" className="absolute inset-0 size-full -rotate-90">
                              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--primary)" strokeWidth="3" strokeDasharray={`${ag.confidence}, 100`} />
                            </svg>
                            <span className="text-[10px] font-bold text-white leading-none">{ag.confidence}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {guardrailPending?.agentId === ag.id ? (
                            <div className="flex flex-col gap-1.5 min-w-[140px]">
                              <p className="text-[9px] text-warning leading-snug">
                                Lowering guardrails increases risk of autonomous actions without approval. Continue?
                              </p>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={confirmGuardrailToggle}
                                  className="rounded border border-warning/40 bg-warning/10 px-2 py-0.5 text-[9px] font-semibold text-warning hover:bg-warning/20 transition-colors"
                                >
                                  Confirm
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelGuardrailToggle}
                                  className="rounded border border-[#1E2730] bg-transparent px-2 py-0.5 text-[9px] font-medium text-muted-foreground hover:bg-[#1E2730] transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => requestGuardrailToggle(ag)}
                              className="flex flex-col text-left group/gr"
                            >
                              <span className={cn(
                                "text-[11px] font-semibold transition-colors",
                                getGuardrailMode(ag) === "Off" ? "text-critical" : getGuardrailMode(ag) === "Standard" ? "text-warning" : "text-white"
                              )}>
                                {getGuardrailMode(ag) === "Off" ? "Off" : "On"}
                              </span>
                              <span className={cn(
                                "text-[10px] transition-colors group-hover/gr:underline",
                                getGuardrailMode(ag) === "Off" ? "text-critical/70" : getGuardrailMode(ag) === "Standard" ? "text-warning/70" : "text-muted-foreground"
                              )}>
                                {getGuardrailMode(ag)}
                              </span>
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-white font-medium">{ag.queue}</span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-white whitespace-pre-line">{ag.risks}</span>
                          </div>
                        </td>
                        <td className="py-3 px-5">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-white whitespace-pre-line">{ag.nextAction}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-[#1E2730] px-5 py-3 text-[10px] text-muted-foreground bg-[#0A0C0B]">
                <span>Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, allAgents.length)} of {allAgents.length} agents</span>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5"><StatusDot tone="primary" /> Low (0-39%)</div>
                    <div className="flex items-center gap-1.5"><StatusDot tone="warning" /> Medium (40-69%)</div>
                    <div className="flex items-center gap-1.5"><StatusDot tone="critical" /> High (70-100%)</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="flex size-6 items-center justify-center rounded hover:bg-[#1E2730] disabled:opacity-50 transition-colors"><ChevronLeft className="size-3" /></button>
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const page = idx + 1;
                      return (
                        <button 
                          key={page} 
                          onClick={() => setCurrentPage(page)} 
                          className={cn("flex size-6 items-center justify-center rounded transition-colors hover:bg-[#1E2730] hover:text-white", currentPage === page ? "border border-[#1E2730] bg-[#141B21] text-white" : "")}
                        >
                          {page}
                        </button>
                      )
                    })}
                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="flex size-6 items-center justify-center rounded hover:bg-[#1E2730] disabled:opacity-50 transition-colors"><ChevronRight className="size-3" /></button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Run History & Task Board */}
            <div className="grid grid-cols-12 gap-6 items-start">
              {/* Run History */}
              <div className="col-span-12 lg:col-span-4 flex flex-col rounded-xl border border-[#1E2730] bg-[#0A0C0B] overflow-hidden h-[420px]">
                <div className="flex items-center justify-between border-b border-[#1E2730] px-4 py-3 shrink-0">
                  <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">Run history <span className="text-muted-foreground normal-case font-normal text-[10px]">({selectedAgent.name})</span></h3>
                  <button onClick={() => toast.info("View full history")} className="text-[10px] text-primary hover:underline font-medium">View full history</button>
                </div>
                <div className="p-4 flex flex-col gap-3">
                  {agentRunHistory.map((run, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground w-12">{run.time}</span>
                      <div className="flex items-center gap-1.5 w-24">
                        <StatusDot tone={run.status === "completed" ? "primary" : run.status === "blocked" ? "warning" : "critical"} /> 
                        <span className={cn(
                          "capitalize",
                          run.status === "completed" ? "text-white" : run.status === "blocked" ? "text-warning" : "text-critical"
                        )}>
                          {run.status === "completed" ? "Run completed" : `Run ${run.status}`}
                        </span>
                      </div>
                      <span className="text-muted-foreground w-16 text-right">{run.outputs} outputs</span>
                      <div className="flex items-center justify-end gap-1.5 w-16 text-muted-foreground">
                        {run.incidents === 0 ? <CheckCircle2 className="size-3 text-muted-foreground" /> : <AlertTriangle className="size-3 text-warning" />}
                        {run.duration ? run.duration : "Incidents"}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#1E2730] px-4 py-3 bg-[#0A0C0B] shrink-0 mt-auto">
                   <button onClick={() => toast.info("View all history")} className="text-[10px] text-primary hover:underline font-medium flex items-center gap-1">View all history <ArrowRight className="size-3" /></button>
                </div>
              </div>

              {/* Agent Task Board */}
              <div className="col-span-12 lg:col-span-8 flex flex-col rounded-xl border border-[#1E2730] bg-[#0A0C0B] overflow-hidden h-[420px]">
                <div className="flex items-center justify-between border-b border-[#1E2730] px-4 py-3 shrink-0">
                  <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">Agent task board <span className="text-muted-foreground normal-case font-normal text-[10px]">(All agents)</span></h3>
                </div>
                <div className="grid grid-cols-4 divide-x divide-[#1E2730] p-4 flex-1 overflow-y-auto scrollbar-thin">
                  <div className="flex flex-col gap-3 px-3 pl-0">
                    <div className="flex items-center justify-between text-[10px] font-bold text-white">
                      <span>Queued (18)</span>
                      <Bot className="size-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col gap-3">
                      {agentTaskBoard.queued.map((t, i) => <TaskCard key={`q-${i}`} task={t} stage="queued" />)}
                    </div>
                    <button onClick={() => toast.info("Load more queued")} className="text-[10px] text-muted-foreground hover:text-white mt-1 text-left">+ 15 more</button>
                  </div>
                  <div className="flex flex-col gap-3 px-3">
                    <div className="flex items-center justify-between text-[10px] font-bold text-white">
                      <div className="flex items-center gap-1.5">
                         <div className="size-2 rounded-full border border-[#3b82f6] border-t-transparent animate-spin" />
                         <span>Analyzing (6)</span>
                      </div>
                      <Bot className="size-3.5 text-[#3b82f6]" />
                    </div>
                    <div className="flex flex-col gap-3">
                      {agentTaskBoard.analyzing.map((t, i) => <TaskCard key={`a-${i}`} task={t} stage="analyzing" />)}
                    </div>
                    <button onClick={() => toast.info("Load more analyzing")} className="text-[10px] text-muted-foreground hover:text-white mt-1 text-left">+ 3 more</button>
                  </div>
                  <div className="flex flex-col gap-3 px-3">
                    <div className="flex items-center justify-between text-[10px] font-bold text-white">
                      <div className="flex items-center gap-1.5">
                         <StatusDot tone="warning" />
                         <span>Drafted</span>
                      </div>
                      <Bot className="size-3.5 text-warning" />
                    </div>
                    <div className="flex flex-col gap-3">
                      {agentTaskBoard.drafted.map((t, i) => <TaskCard key={`d-${i}`} task={t} stage="drafted" />)}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 px-3 pr-0">
                    <div className="flex items-center justify-between text-[10px] font-bold text-white">
                      <div className="flex items-center gap-1.5">
                         <StatusDot tone="primary" />
                         <span>Completed (47)</span>
                      </div>
                      <Bot className="size-3.5 text-primary" />
                    </div>
                    <div className="flex flex-col gap-3">
                      {agentTaskBoard.completed.map((t, i) => <TaskCard key={`c-${i}`} task={t} stage="completed" />)}
                    </div>
                    <button onClick={() => toast.info("Load more completed")} className="text-[10px] text-muted-foreground hover:text-white mt-1 text-left">+ 5 more</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Detail Panel */}
          <div className="col-span-12 xl:col-span-4 h-[calc(100vh-110px)] sticky top-6">
            <div className="flex flex-col h-full rounded-xl border border-[#1E2730] bg-[#0A0C0B] overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#1E2730] px-5 py-4 shrink-0">
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-sm font-semibold text-white">{selectedAgent.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                      + Active
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRunAgent(selectedAgent)}
                    disabled={runningAgentId === selectedAgent?.id}
                    className={cn(
                      "flex items-center gap-1.5 rounded border border-[#1E2730] bg-transparent px-3 py-1.5 text-[10px] font-medium transition-colors",
                      runningAgentId === selectedAgent?.id
                        ? "text-muted-foreground cursor-not-allowed"
                        : "text-white hover:bg-[#141B21]"
                    )}
                  >
                    {runningAgentId === selectedAgent?.id ? (
                      <><RefreshCw className="size-3 animate-spin" /> Running...</>
                    ) : (
                      <>Run manually</>
                    )}
                  </button>
                  <button onClick={() => toast.info("Close panel")} className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-[#1E2730] hover:text-white transition-colors">
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-6 border-b border-[#1E2730] px-5 text-[10px] font-semibold shrink-0">
                {["Overview", "Guardrails", "Tools", "Tasks", "Prompts", "Settings"].map((tab) => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)}
                    className={cn("border-b-2 py-3 transition-colors", activeTab === tab ? "border-white text-white" : "border-transparent text-muted-foreground hover:text-white")}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-thin p-5 flex flex-col gap-6">
                {!detail ? (
                  <div className="flex flex-col items-center justify-center flex-1 gap-3 py-12 text-center">
                    <Bot className="size-8 text-muted-foreground/40" />
                    <p className="text-[12px] font-semibold text-white">{selectedAgent?.name}</p>
                    <p className="text-[11px] text-muted-foreground max-w-[200px] leading-relaxed">
                      No detailed profile available for this agent yet.
                    </p>
                  </div>
                ) : (
                <>
                <span className="text-[11px] text-muted-foreground leading-relaxed">{detail.description}</span>
                
                {/* Metrics */}
                <div className="grid grid-cols-5 gap-4">
                  <div className="col-span-1 flex flex-col gap-1">
                    <span className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">Workload</span>
                    <span className={cn("text-[11px] font-bold mt-1", detail.workloadTone === "critical" ? "text-warning" : "text-primary")}>{detail.workload.split(' ')[0]}</span>
                    <span className={cn("text-[11px] font-bold", detail.workloadTone === "critical" ? "text-warning" : "text-primary")}>{detail.workload.split(' ')[1]}</span>
                  </div>
                  <div className="col-span-1 flex flex-col gap-1 border-l border-[#1E2730] pl-4">
                    <span className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">Last Run</span>
                    <span className="text-[11px] font-bold text-white mt-1">{detail.lastRun.split('\n')[0]}</span>
                    <span className="text-[9px] text-muted-foreground">{detail.lastRun.split('\n')[1]}</span>
                  </div>
                  <div className="col-span-1 flex flex-col gap-1 border-l border-[#1E2730] pl-4">
                    <span className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">Outputs (24h)</span>
                    <span className="text-xl font-bold tabular-nums text-white leading-none mt-1">{detail.outputs24h}</span>
                    <span className="text-[9px] text-primary mt-1 whitespace-nowrap">{detail.outputsDelta}</span>
                  </div>
                  <div className="col-span-1 flex flex-col gap-1 border-l border-[#1E2730] pl-4 items-center">
                    <span className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">Confidence</span>
                    <div className="relative flex size-8 items-center justify-center mt-1">
                      <svg viewBox="0 0 36 36" className="absolute inset-0 size-full -rotate-90">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--primary)" strokeWidth="3" strokeDasharray={`${detail.confidence}, 100`} />
                      </svg>
                      <span className="text-[10px] font-bold text-white leading-none">{detail.confidence}%</span>
                    </div>
                  </div>
                  <div className="col-span-1 flex flex-col gap-1 border-l border-[#1E2730] pl-4">
                    <span className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">Guardrails</span>
                    <span className="text-[11px] font-bold text-white mt-1">{detail.guardrails.split(' / ')[0]}</span>
                    <span className="text-[9px] text-muted-foreground">{detail.guardrails.split(' / ')[1]}</span>
                  </div>
                </div>

                <div className="w-full h-px bg-[#1E2730]" />

                {/* Allowed Tools */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-white">Allowed tools</span>
                    <button onClick={() => toast.info("Configure tools")} className="text-[10px] text-primary hover:underline"><Settings className="size-3 inline-block mr-1" />Configure</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {detail.allowedTools.map(t => (
                      <span key={t} className="inline-flex items-center rounded-full border border-[#1E2730] bg-[#141B21] px-2 py-1 text-[9px] font-medium text-muted-foreground">{t}</span>
                    ))}
                  </div>
                </div>

                {/* Blocked external actions */}
                <div className="flex flex-col gap-3 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-white">Blocked external actions</span>
                    <button onClick={() => toast.info("View blocked log")} className="text-[10px] text-primary hover:underline">View log</button>
                  </div>
                  <div className="flex flex-col gap-2 rounded-lg border border-critical/20 bg-critical/5 p-3">
                    {detail.blockedActions.map(act => (
                      <div key={act} className="flex items-center justify-between text-[9px]">
                        <div className="flex items-center gap-2 text-white">
                          <X className="size-3 text-critical" /> {act}
                        </div>
                        <span className="text-critical font-medium">Blocked</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Linked proof trails */}
                <div className="flex flex-col gap-3 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-white">Linked proof trails</span>
                    <button onClick={() => toast.info("View all proof trails")} className="text-[10px] text-primary hover:underline">View all (24) →</button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {detail.proofTrails.map(pt => (
                      <div key={pt.id} className="flex items-center gap-3 text-[10px]">
                        <button onClick={() => toast.info(`Opened ${pt.id}`)} className="text-primary hover:underline font-medium border border-primary/20 bg-primary/10 rounded px-1.5 py-0.5">{pt.id}</button>
                        <span className="text-white flex-1 truncate">{pt.title}</span>
                        <span className="text-muted-foreground">{pt.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Outputs & Current Tasks (Grid) */}
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col gap-3">
                     <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-white">Recent outputs</span>
                      <button onClick={() => toast.info("View all outputs")} className="text-[10px] text-primary hover:underline">View all (23) →</button>
                    </div>
                    <div className="flex flex-col gap-3">
                      {detail.recentOutputs.slice(0, 3).map((out, i) => (
                        <div key={i} className="flex flex-col gap-1">
                          <div className="flex items-start gap-2">
                            <FileText className="size-3 text-muted-foreground shrink-0 mt-0.5" />
                            <span className="text-[9px] text-white leading-tight">{out.title}</span>
                          </div>
                          <div className="flex items-center gap-2 pl-5 text-[9px]">
                            <span className="text-muted-foreground">{out.time}</span>
                            <span className={cn("font-medium", out.state === "New" ? "text-primary" : "text-warning")}>{out.state}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-white">Current tasks</span>
                      <button onClick={() => toast.info("View all tasks")} className="text-[10px] text-primary hover:underline">View all (5) →</button>
                    </div>
                    <div className="flex flex-col gap-3">
                      {detail.currentTasks.slice(0, 3).map((task, i) => (
                        <div key={i} className="flex flex-col gap-1">
                          <div className="flex items-start gap-2">
                            <div className="flex size-3 items-center justify-center rounded-full border border-muted-foreground shrink-0 mt-0.5"><div className="size-1 bg-muted-foreground rounded-full" /></div>
                            <span className="text-[9px] text-white leading-tight">{task.title}</span>
                          </div>
                          <div className="flex items-center gap-2 pl-5 text-[9px]">
                            <span className={cn("font-medium", task.priority === "High" ? "text-warning" : "text-evidence")}>{task.priority}</span>
                            <span className="text-muted-foreground">{task.eta}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Approval queue for this agent */}
                <div className="flex flex-col gap-3 mt-4 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-white flex items-center gap-1">Approval queue for this agent <ChevronDown className="size-3 text-muted-foreground" /></span>
                    <button onClick={() => toast.info("View all approvals")} className="text-[10px] text-primary hover:underline">View all (4) →</button>
                  </div>
                  <div className="flex flex-col rounded-lg border border-[#1E2730] overflow-hidden bg-[#141B21]/30 flex-1">
                    {detail.approvalQueue.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 border-b border-[#1E2730] last:border-0 hover:bg-[#141B21] transition-colors cursor-pointer text-[10px]">
                        <CheckCircle2 className="size-3 text-warning shrink-0" />
                        <span className="text-white flex-1 truncate">{item.title}</span>
                        <span className="text-white w-20 text-right">{item.impact}</span>
                        <span className="text-muted-foreground w-16 text-right">{item.due}</span>
                        <span className={cn("font-medium w-12 text-right", item.priority === "Urgent" ? "text-critical" : item.priority === "High" ? "text-warning" : item.priority === "Medium" ? "text-evidence" : "text-primary")}>{item.priority}</span>
                      </div>
                    ))}
                  </div>
                </div>
                </> )}

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-[#1E2730] bg-[#0A0C0B] px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Button onClick={() => toast.success("Running selected agents")} className="h-8 bg-primary text-white hover:bg-primary/90 text-[11px] font-semibold px-6">
            Run selected
          </Button>
          <Button onClick={() => toast.success("Running all agents")} className="h-8 bg-[#3b82f6]/20 text-[#3b82f6] hover:bg-[#3b82f6]/30 border border-[#3b82f6]/30 text-[11px] font-semibold px-6">
            Run all agents
          </Button>
          <div className="w-px h-4 bg-[#1E2730] mx-2" />
          <Button onClick={() => toast.info("Viewing agent outputs")} variant="outline" className="h-8 border-[#1E2730] bg-transparent text-white hover:bg-[#141B21] text-[11px] px-4">
            View outputs
          </Button>
          <Button onClick={() => toast.info("Reviewing approvals")} variant="outline" className="h-8 border-warning/30 bg-warning/10 text-warning hover:bg-warning/20 text-[11px] px-4">
            Review approvals (8)
          </Button>
          <Button onClick={() => toast.info("Configuring agents")} variant="outline" className="h-8 border-[#1E2730] bg-transparent text-white hover:bg-[#141B21] text-[11px] px-4">
            Configure agents
          </Button>
        </div>
        <div className="flex items-center gap-6 text-[10px] text-muted-foreground font-medium">
          <div className="flex items-center gap-2">
             <span className="text-white">System status</span>
             <StatusDot tone="primary" /> All systems operational
          </div>
          <div className="flex items-center gap-2">
             <span className="text-white">Data pipeline</span>
             <StatusDot tone="primary" /> Healthy
          </div>
          <div className="flex items-center gap-2">
             <span className="text-white">AI extraction</span>
             <StatusDot tone="primary" /> Healthy
          </div>
          <div className="flex items-center gap-2">
             <span className="text-white">Agent runtime</span>
             <StatusDot tone="primary" /> Healthy
          </div>
          <div className="flex items-center gap-2">
             <span className="text-white">Approval service</span>
             <StatusDot tone="primary" /> Healthy
          </div>
          <div className="flex items-center gap-1.5 ml-8 border-l border-[#1E2730] pl-6">
            <RefreshCw className="size-3" /> Last updated: 2m ago
          </div>
        </div>
      </div>
    </div>
  );
}
