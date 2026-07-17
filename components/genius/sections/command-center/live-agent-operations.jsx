"use client";

import { cn } from "@/lib/utils";
import { formatCurrencyFull } from "@/lib/genius-data";
import { Bot, Play, Pause, ChevronRight } from "lucide-react";

const activeStatuses = new Set(["Active", "Ready", "Running"]);

function statusDot(status) {
  if (status === "Running" || status === "Active") return "bg-primary shadow-[0_0_4px_rgba(16,185,129,0.5)] animate-pulse";
  if (status === "Ready" || status === "Completed") return "bg-primary";
  if (status === "Failed") return "bg-critical";
  return "bg-warning";
}

function nextLifecycleStatus(status) {
  return status === "Running" || status === "Active" ? "Paused" : "Running";
}

function impactLabel(agent = {}) {
  const impact = Number(agent.impact);
  if (Number.isFinite(impact) && impact > 0) return formatCurrencyFull(impact);
  return formatCurrencyFull((Number(agent.workload) || 0) * 1234);
}

export function LiveAgentOperations({
  agents = [],
  loading,
  busy = false,
  canManage = false,
  onManage,
  onAudit,
  onAgentStatusChange,
}) {
  const activeCount = agents.filter((agent) => activeStatuses.has(agent.status)).length;
  const actionsToday = agents.reduce((sum, agent) => sum + (Number(agent.actionsToday) || 0), 0);

  if (loading) {
    return (
      <div className="rounded-xl border border-[#28313C] bg-[#0E1116] flex-1 flex flex-col min-h-0 relative">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#28313C]">
          <Bot className="size-4 text-primary" />
          <h3 className="text-[12px] font-bold text-white">Live Agent Operations</h3>
        </div>
        <div className="flex flex-col p-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="flex gap-4">
                <div className="h-4 w-4 rounded bg-[#ffffff08]" />
                <div className="flex-1">
                  <div className="h-3 w-32 rounded bg-[#ffffff08] mb-1.5" />
                  <div className="h-2 w-24 rounded bg-[#ffffff08]" />
                </div>
              </div>
              <div className="h-1.5 w-full rounded bg-[#ffffff08]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#28313C] bg-[#0E1116] flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#28313C] shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Bot className="size-3.5 text-[#10b981] shrink-0" />
          <h3 className="truncate text-[13px] font-bold text-white tracking-wide">Live Agent Operations</h3>
          <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary border border-primary/30 ml-2 shrink-0">
            {activeCount} active
          </span>
        </div>
        <button type="button" onClick={onManage} className="text-[10px] font-bold text-[#4EA1FF] hover:text-white transition-colors">
          Manage Agents
        </button>
      </div>

      <div className="grid grid-cols-[1fr_80px_70px_72px_60px] gap-2 px-5 py-2.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground border-b border-[#28313C]/50 shrink-0">
        <span>Agent / Task</span>
        <span>Progress</span>
        <span>Impact ID</span>
        <span>Status</span>
        <span className="text-right">Control</span>
      </div>

      <div className="scrollbar-thin flex flex-1 flex-col min-h-0 overflow-y-auto">
        {agents.length === 0 && (
          <div className="flex flex-1 items-center justify-center px-5 py-8 text-center text-xs text-muted-foreground">
            Agent runs will appear after workspace evidence is available.
          </div>
        )}

        {agents.map((agent, idx) => {
          const nextStatus = nextLifecycleStatus(agent.status);
          const disabled = busy || !canManage || (!agent.id && !agent.agentId);

          return (
            <div
              key={agent.id || agent.agentId || agent.name}
              className={cn(
                "grid grid-cols-[1fr_80px_70px_72px_60px] gap-2 px-5 py-3.5 items-center transition-colors hover:bg-white/5 group animate-fade-up",
                idx < agents.length - 1 && "border-b border-[#28313C]/50",
              )}
              style={{ animationDelay: `${100 + (idx * 50)}ms`, animationFillMode: "both" }}
            >
              <div className="flex items-start gap-2.5 min-w-0 pr-2">
                <div className="size-5 rounded border border-[#28313C] flex items-center justify-center bg-[#141A22] shrink-0 mt-0.5">
                  <Bot className="size-3 text-muted-foreground" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="truncate text-[11px] font-bold text-white">{agent.name}</span>
                  <span className="truncate text-[9px] text-muted-foreground">{agent.role}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 justify-center">
                <div className="h-1.5 w-full bg-[#28313C] rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${agent.workload || 0}%` }} />
                </div>
                <span className="text-[8px] text-muted-foreground tabular-nums text-right font-medium">{agent.workload || 0}% complete</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-evidence">
                  {impactLabel(agent)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 min-w-0">
                <span className={cn("size-1.5 rounded-full shrink-0", statusDot(agent.status))} />
                <span className="truncate text-[9px] font-bold text-muted-foreground uppercase">{agent.status}</span>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`${nextStatus} ${agent.name}`}
                  onClick={() => onAgentStatusChange?.(agent, nextStatus)}
                  className="flex items-center justify-center size-6 rounded border border-[#28313C] bg-[#141A22] text-muted-foreground hover:bg-[#28313C] hover:text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {agent.status === "Running" || agent.status === "Active" ? <Pause className="size-3" /> : <Play className="size-3" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-[#28313C] px-5 py-3 shrink-0 flex justify-between items-center bg-[#0E1116] gap-3">
        <span className="truncate text-[9px] text-muted-foreground">
          Agents have recorded <strong className="text-white">{actionsToday}</strong> supervised lifecycle events.
        </span>
        <button type="button" onClick={onAudit} className="text-[10px] font-bold text-[#4EA1FF] hover:text-white transition-colors flex items-center shrink-0">
          View Audit Log <ChevronRight className="size-3 ml-0.5" />
        </button>
      </div>
    </div>
  );
}
