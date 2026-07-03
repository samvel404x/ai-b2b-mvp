"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Bot, Lock, Play, ShieldAlert, Zap } from "lucide-react";
import { agents } from "@/lib/genius-data";
import { ConfBar, StatusDot } from "../shared";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export default function Agents({ onNavigate }) {
  const [selected, setSelected] = useState([]);

  function toggle(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  const totalBlocked = agents.reduce((s, a) => s + a.blocked, 0);
  const activeCount = agents.filter(a => a.status === "Active").length;

  const kpis = [
    { label: "Active agents", value: activeCount, tone: "primary" },
    { label: "Total workload", value: agents.reduce((s, a) => s + a.workload, 0), tone: "neutral" },
    { label: "Prepared outputs", value: agents.reduce((s, a) => s + a.outputs, 0), tone: "neutral" },
    { label: "Blocked actions", value: totalBlocked, tone: "warning" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Agents</h1>
          <p className="text-sm text-[#4a5450]">Supervised AI agents recommend actions but cannot execute without approval. Guardrails enforced on every agent.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-[#ffffff10] bg-transparent text-[#8a9490] hover:bg-white/5"
            disabled={selected.length === 0}
            onClick={() => toast.success(`Running ${selected.length} agent(s)`, { description: "Outputs will appear in the approval queue." })}>
            <Play className="size-3.5 mr-1.5" />Run selected
          </Button>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => toast.success("Running all agents", { description: "Supervised run started." })}>
            Run all
          </Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpis.map((k, i) => {
          const toneClass = k.tone === "primary" ? "text-primary" : k.tone === "warning" ? "text-warning" : "text-foreground";
          const accentClass = k.tone === "primary" ? "border-t-primary/35" : k.tone === "warning" ? "border-t-warning/35" : "";
          return (
            <div key={k.label} className={cn("flex flex-col gap-2 rounded-xl border border-t-2 border-[#ffffff08] bg-[#0a0c0b] p-4 animate-fade-up", accentClass)} style={{ animationDelay: `${i * 50}ms` }}>
              <span className="text-[11px] font-medium text-[#4a5450]">{k.label}</span>
              <span className={cn("text-2xl font-bold tabular", toneClass)}>{k.value}</span>
            </div>
          );
        })}
      </div>

      {/* Agent cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {agents.map(a => {
          const isSel = selected.includes(a.id);
          const statusColor = a.status === "Active" ? "text-primary" : a.status === "Waiting" ? "text-warning" : "text-critical";
          const statusBg = a.status === "Active" ? "bg-primary" : a.status === "Waiting" ? "bg-warning" : "bg-critical";
          return (
            <div
              key={a.id}
              className={cn(
                "group flex flex-col gap-4 rounded-xl border bg-[#0a0c0b] p-5 transition-all",
                isSel ? "border-primary/30 bg-[#0d1410]" : "border-[#ffffff08] hover:border-[#1a2820]",
              )}
            >
              <div className="flex items-start gap-3">
                <Checkbox checked={isSel} onCheckedChange={() => toggle(a.id)} className="mt-1" aria-label={`Select ${a.name}`} />
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#16211b] shadow-sm shadow-primary/10">
                  <Bot className="size-5 text-primary" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{a.name}</span>
                    <span className="flex items-center gap-1 text-xs">
                      <span className={cn("size-1.5 rounded-full", statusBg)} />
                      <span className={statusColor}>{a.status}</span>
                    </span>
                  </div>
                  <span className="text-xs text-[#4a5450]">{a.role}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "Workload", value: a.workload, suffix: "" },
                  { label: "Outputs", value: a.outputs, suffix: "" },
                  { label: "Blocked", value: a.blocked, suffix: "", alert: a.blocked > 0 },
                ].map(m => (
                  <div key={m.label} className="flex flex-col gap-0.5 rounded-xl border border-[#ffffff06] bg-[#0d0f0e] py-2.5">
                    <span className="text-[10px] text-[#4a5450]">{m.label}</span>
                    <span className={cn("text-sm font-bold tabular", m.alert ? "text-warning" : "text-foreground")}>{m.value}{m.suffix}</span>
                  </div>
                ))}
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between text-[11px]">
                  <span className="text-[#4a5450]">Confidence</span>
                  <span className="font-semibold tabular text-foreground">{a.confidence}%</span>
                </div>
                <ConfBar value={a.confidence} />
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-[#ffffff06] bg-[#0d0f0e] px-3 py-2 text-xs text-[#4a5450]">
                <Lock className="size-3 shrink-0" />
                <span className="truncate">Guardrail: {a.guardrail}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex-1 border-[#ffffff10] bg-transparent text-[#8a9490] hover:bg-white/5 text-xs" onClick={() => onNavigate("approvals")}>
                  View outputs
                </Button>
                {a.blocked > 0 ? (
                  <Button variant="outline" size="sm" className="flex-1 border-warning/25 bg-warning/5 text-warning text-xs hover:bg-warning/10" onClick={() => onNavigate("approvals")}>
                    <ShieldAlert className="size-3 mr-1.5" />Review
                  </Button>
                ) : (
                  <span className="flex-1 rounded-lg border border-[#ffffff06] bg-[#0d0f0e] py-1.5 text-center text-[11px] font-medium text-[#3a4040]">No blockers</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
