"use client";

import { Plus, RefreshCw, Radio } from "lucide-react";
import { connectors, liveEvents } from "@/lib/genius-data";
import { PageHeader, Panel, StatusDot } from "../shared";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function Connectors({ label }) {
  const active = connectors.filter((c) => c.status !== "Not connected");
  const available = connectors.filter((c) => c.status === "Not connected");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={label}
        description="Every source that feeds GENIUS. Health, event volume and last sync are monitored continuously so findings never run on stale data."
        actions={
          <Button size="sm">
            <Plus data-icon="inline-start" />
            Add connector
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Panel title="Active connections" contentClassName="p-0">
            <div className="divide-y divide-border">
              {active.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-4 px-4 py-3.5"
                >
                  <div className="flex size-9 items-center justify-center rounded-md border border-border bg-secondary/50 text-xs font-semibold">
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {c.name}
                      </span>
                      <StatusDot tone={c.status} />
                      <span className="text-xs text-muted-foreground">
                        {c.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {c.category} · {c.events.toLocaleString()} events · synced{" "}
                      {c.lastSync}
                    </p>
                  </div>
                  <div className="hidden w-28 flex-col gap-1 sm:flex">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Health</span>
                      <span
                        className={cn(
                          "tabular font-medium",
                          c.health >= 90
                            ? "text-primary"
                            : c.health >= 70
                              ? "text-warning"
                              : "text-critical",
                        )}
                      >
                        {c.health}%
                      </span>
                    </div>
                    <Progress value={c.health} className="h-1.5" />
                  </div>
                  <Button variant="ghost" size="icon" className="size-8">
                    <RefreshCw />
                    <span className="sr-only">Resync {c.name}</span>
                  </Button>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            title="Available connectors"
            description="Connect more sources to widen coverage"
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {available.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col gap-3 rounded-lg border border-dashed border-border bg-secondary/20 p-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-md border border-border bg-card text-xs font-semibold">
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{c.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {c.category}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Connect
                  </Button>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <Panel
          title="Live event stream"
          description="Business Live webhook"
          actions={
            <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
              <Radio className="size-3.5 animate-pulse" />
              Live
            </span>
          }
          contentClassName="p-0"
        >
          <div className="divide-y divide-border">
            {liveEvents.map((ev) => (
              <div key={ev.id} className="flex items-center gap-3 px-4 py-3">
                <StatusDot tone={ev.status} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-xs text-foreground">
                    {ev.type}
                  </p>
                  <p className="text-xs text-muted-foreground">{ev.source}</p>
                </div>
                <span className="font-mono text-[11px] tabular text-muted-foreground">
                  {ev.time}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
