"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Bot, Lock, Play, ShieldAlert } from "lucide-react";
import { agents } from "@/lib/genius-data";
import { PageHeader, Panel, StatusDot } from "../shared";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function Agents({ onNavigate }) {
  const [selected, setSelected] = useState([]);

  function toggle(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  const totalBlocked = agents.reduce((s, a) => s + a.blocked, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Agents"
        description="Supervised AI agents recommend actions but cannot execute without approval. Guardrails are enforced on every agent."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={selected.length === 0}
              onClick={() =>
                toast.success(`Running ${selected.length} agent(s)`, {
                  description: "Outputs will appear in the approval queue.",
                })
              }
            >
              <Play data-icon="inline-start" />
              Run selected
            </Button>
            <Button
              size="sm"
              onClick={() =>
                toast.success("Running all agents", {
                  description: "Supervised run started across the workspace.",
                })
              }
            >
              Run all
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Active agents</div>
          <div className="mt-1 text-2xl font-semibold tabular text-primary">
            {agents.filter((a) => a.status === "Active").length}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Total workload</div>
          <div className="mt-1 text-2xl font-semibold tabular">
            {agents.reduce((s, a) => s + a.workload, 0)}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Prepared outputs</div>
          <div className="mt-1 text-2xl font-semibold tabular">
            {agents.reduce((s, a) => s + a.outputs, 0)}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Blocked actions</div>
          <div className="mt-1 text-2xl font-semibold tabular text-warning">
            {totalBlocked}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {agents.map((a) => (
          <Panel
            key={a.id}
            className={cn(
              "transition-colors",
              selected.includes(a.id) && "border-primary/40",
            )}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selected.includes(a.id)}
                  onCheckedChange={() => toggle(a.id)}
                  className="mt-1"
                  aria-label={`Select ${a.name}`}
                />
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary">
                  <Bot className="size-4.5 text-primary" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{a.name}</span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <StatusDot tone={a.status} />
                      {a.status}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{a.role}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-md border border-border bg-secondary/40 py-2">
                  <div className="text-xs text-muted-foreground">Workload</div>
                  <div className="text-sm font-semibold tabular">{a.workload}</div>
                </div>
                <div className="rounded-md border border-border bg-secondary/40 py-2">
                  <div className="text-xs text-muted-foreground">Outputs</div>
                  <div className="text-sm font-semibold tabular">{a.outputs}</div>
                </div>
                <div className="rounded-md border border-border bg-secondary/40 py-2">
                  <div className="text-xs text-muted-foreground">Blocked</div>
                  <div className="text-sm font-semibold tabular text-warning">
                    {a.blocked}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Confidence</span>
                  <span className="tabular">{a.confidence}%</span>
                </div>
                <Progress value={a.confidence} className="h-1.5" />
              </div>

              <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
                <Lock className="size-3.5 shrink-0" />
                <span className="truncate">Guardrail: {a.guardrail}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onNavigate("approvals")}
                >
                  View outputs
                </Button>
                {a.blocked > 0 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-warning/30 text-warning"
                    onClick={() => onNavigate("approvals")}
                  >
                    <ShieldAlert data-icon="inline-start" />
                    Review approvals
                  </Button>
                ) : (
                  <Badge variant="secondary" className="ml-auto">
                    No blockers
                  </Badge>
                )}
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
