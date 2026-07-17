"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Activity, Bot, CheckCircle2, Pause, Play, ShieldAlert, Square } from "lucide-react";

function statusTone(status) {
  switch (status) {
    case "Running":
      return "text-[#4EA1FF]";
    case "Ready":
    case "Completed":
      return "text-primary";
    case "Paused":
    case "Waiting":
      return "text-warning";
    case "Failed":
      return "text-critical";
    default:
      return "text-muted-foreground";
  }
}

function statusIcon(status) {
  if (status === "Running") return <Activity className="size-3.5 animate-pulse" />;
  if (status === "Ready" || status === "Completed") return <CheckCircle2 className="size-3.5" />;
  if (status === "Failed") return <ShieldAlert className="size-3.5" />;
  return null;
}

function normalizeProgress(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function eventLogs(agent = {}) {
  if (Array.isArray(agent.logs) && agent.logs.length) return agent.logs;
  if (Array.isArray(agent.events) && agent.events.length) {
    return agent.events.slice(0, 8).map((event) => ({
      time: event.createdAt ? new Date(event.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Now",
      msg: event.message || `Status changed to ${event.status || "updated"}.`,
      type: event.status === "Failed" ? "error" : event.status === "Paused" ? "warning" : "success",
    }));
  }
  return [
    { time: "Now", msg: `${agent.workload || 0} workspace signals in scope.`, type: agent.status === "Ready" || agent.status === "Completed" ? "success" : "info" },
    ...(agent.guardrail ? [{ time: "Guardrail", msg: agent.guardrail, type: "warning" }] : []),
  ];
}

function fallbackAgent() {
  return {
    name: "Workspace Agent",
    status: "Waiting",
    progress: 0,
    runtime: "Not run",
    mission: "Analyze workspace context and prepare approval-safe output.",
    logs: [{ time: "Now", msg: "Waiting for workspace evidence.", type: "info" }],
  };
}

export function AgentDetailDrawer({
  open,
  onOpenChange,
  agent,
  canManage = false,
  busy = false,
  onStatusChange,
}) {
  const data = agent || fallbackAgent();
  const status = data.status || "Waiting";
  const logs = eventLogs(data);
  const progress = normalizeProgress(data.progress, status === "Ready" || status === "Completed" ? 100 : 0);
  const controlsDisabled = busy || !canManage || (!data.id && !data.agentId);
  const canPause = status === "Running";
  const canRun = ["Waiting", "Ready", "Paused", "Failed"].includes(status);
  const canComplete = ["Running", "Paused", "Ready"].includes(status);
  const canFail = ["Running", "Paused", "Ready"].includes(status);

  function handleStatusChange(nextStatus) {
    if (controlsDisabled) return;
    onStatusChange?.(data, nextStatus);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[500px] bg-[#0E1116] border-l-[#28313C] text-white p-0 flex flex-col">
        <div className="p-6 border-b border-[#28313C] flex flex-col gap-4">
          <SheetHeader className="space-y-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[#4EA1FF]/30 bg-[#4EA1FF]/10 text-[#4EA1FF]">
                  <Bot className="size-5" />
                </div>
                <div className="flex min-w-0 flex-col">
                  <SheetTitle className="truncate text-sm">{data.name}</SheetTitle>
                  <SheetDescription className="mt-0.5 truncate text-xs text-muted-foreground">
                    {data.agentId || "supervised-agent"}
                  </SheetDescription>
                </div>
              </div>
              <div className={`flex shrink-0 items-center gap-1.5 text-xs font-bold uppercase tracking-widest ${statusTone(status)}`}>
                {statusIcon(status)}
                {status}
              </div>
            </div>
          </SheetHeader>

          <div className="mt-2 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Mission Progress</span>
              <span className="font-medium text-white">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-[#28313C] indicator-[#4EA1FF]" />
            <span className="mt-0.5 text-right text-[10px] text-muted-foreground">Runtime: {data.runtime || "Not run"}</span>
          </div>
        </div>

        <div className="scrollbar-thin flex flex-1 flex-col gap-6 overflow-y-auto p-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-white">Current Mission</span>
            <div className="rounded border border-[#28313C] bg-[#141A22] p-3 text-xs leading-relaxed text-muted-foreground">
              {data.mission || data.capability || "Analyze workspace context and prepare approval-safe output."}
            </div>
          </div>

          {data.statusNote && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-white">Latest Note</span>
              <div className="rounded border border-[#28313C] bg-[#141A22] p-3 text-xs leading-relaxed text-muted-foreground">
                {data.statusNote}
              </div>
            </div>
          )}

          <div className="flex flex-1 flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-white">Execution Logs</span>
            <div className="scrollbar-thin flex flex-1 flex-col gap-3 overflow-y-auto rounded border border-[#28313C] bg-[#141A22] p-3 font-mono text-[10px]">
              {logs.map((log, index) => (
                <div key={`${log.time}-${index}`} className="flex gap-3">
                  <span className="shrink-0 text-muted-foreground">{log.time}</span>
                  <span className={`
                    ${log.type === "info" ? "text-white/80" : ""}
                    ${log.type === "success" ? "text-primary" : ""}
                    ${log.type === "warning" ? "text-warning" : ""}
                    ${log.type === "error" ? "text-critical" : ""}
                  `}>
                    {log.msg}
                  </span>
                </div>
              ))}
              {status === "Running" && (
                <div className="flex gap-3 text-muted-foreground animate-pulse">
                  <span>...</span>
                  <span>Executing next supervised step...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-[#28313C] bg-[#0E1116] p-6">
          <SheetFooter className="flex w-full items-center justify-between gap-3">
            <Button variant="ghost" className="px-2 text-xs text-muted-foreground hover:text-white" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <div className="flex flex-wrap justify-end gap-2">
              {canFail && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={controlsDisabled}
                  onClick={() => handleStatusChange("Failed")}
                  className="border-[#28313C] bg-[#141A22] text-xs text-white hover:bg-[#28313C]"
                >
                  <Square className="mr-1.5 size-3.5" /> Fail
                </Button>
              )}
              {canComplete && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={controlsDisabled}
                  onClick={() => handleStatusChange("Completed")}
                  className="border-[#28313C] bg-[#141A22] text-xs text-white hover:bg-[#28313C]"
                >
                  <CheckCircle2 className="mr-1.5 size-3.5" /> Complete
                </Button>
              )}
              {canPause && (
                <Button
                  type="button"
                  disabled={controlsDisabled}
                  onClick={() => handleStatusChange("Paused")}
                  className="bg-[#4EA1FF] text-xs text-white hover:bg-[#4EA1FF]"
                >
                  <Pause className="mr-1.5 size-3.5" /> Pause
                </Button>
              )}
              {canRun && (
                <Button
                  type="button"
                  disabled={controlsDisabled}
                  onClick={() => handleStatusChange("Running")}
                  className="bg-[#4EA1FF] text-xs text-white hover:bg-[#4EA1FF]"
                >
                  <Play className="mr-1.5 size-3.5" /> Run
                </Button>
              )}
            </div>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
