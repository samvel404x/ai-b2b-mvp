"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, RefreshCw, Radio, CheckCircle2, AlertCircle, XCircle, Wifi, Database, Zap, TrendingUp, Activity } from "lucide-react";
import { connectors, liveEvents } from "@/lib/genius-data";
import { PageHeader, Panel, StatusDot } from "../shared";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const summaryStats = [
  { label: "Active", value: "6", tone: "primary", icon: CheckCircle2 },
  { label: "Degraded", value: "1", tone: "warning", icon: AlertCircle },
  { label: "Disconnected", value: "3", tone: "critical", icon: XCircle },
  { label: "Events / hr", value: "11.1K", tone: "muted", icon: Activity },
];

const categoryIcons = {
  Accounting: Database,
  Payments: Zap,
  Email: Radio,
  Files: Database,
  CRM: TrendingUp,
  Webhook: Radio,
  ERP: Database,
  Spend: TrendingUp,
};

const statusConfig = {
  Connected: { label: "Connected", tone: "ok", cls: "text-primary" },
  Degraded: { label: "Degraded", tone: "warning", cls: "text-warning" },
  "Not connected": { label: "Not connected", tone: "critical", cls: "text-muted-foreground" },
};

export default function Connectors({ label }) {
  const [connectorList, setConnectorList] = useState(connectors);

  const active = connectorList.filter((c) => c.status === "Connected");
  const degraded = connectorList.filter((c) => c.status === "Degraded");
  const available = connectorList.filter((c) => c.status === "Not connected");
  const totalEvents = connectorList.reduce((sum, c) => sum + c.events, 0);

  function resync(id) {
    toast.success("Resync triggered", { description: "Reconnecting..." });
  }

  function connect(id) {
    setConnectorList((prev) =>
      prev.map((c) => c.id === id ? { ...c, status: "Connected", health: 100, events: Math.floor(Math.random() * 500) + 100, lastSync: "just now" } : c)
    );
    toast.success("Connector enabled", { description: "First sync in progress..." });
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={label}
        description="Every data source feeding GENIUS. Health, event volume, and sync freshness are monitored continuously so findings never run on stale data."
        actions={
          <Button size="sm" onClick={() => toast.success("Opening connector catalog...")}>
            <Plus className="size-4 mr-1.5" />
            Add connector
          </Button>
        }
      />

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summaryStats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
              <Icon className={cn("size-5 shrink-0", {
                "text-primary": s.tone === "primary",
                "text-warning": s.tone === "warning",
                "text-critical": s.tone === "critical",
                "text-muted-foreground": s.tone === "muted",
              })} />
              <div>
                <div className="text-lg font-bold tabular leading-none">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr_0.8fr]">
        {/* Active connections */}
        <Panel title={`Active connections (${active.length + degraded.length})`} contentClassName="p-0">
          <div className="divide-y divide-border">
            {[...active, ...degraded].map((c) => {
              const cfg = statusConfig[c.status] || statusConfig["Not connected"];
              const CatIcon = categoryIcons[c.category] || Database;
              return (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="flex size-9 items-center justify-center rounded-md border border-border bg-secondary/60 text-xs font-bold text-foreground shrink-0">
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{c.name}</span>
                      <StatusDot tone={c.status === "Connected" ? "ok" : c.status === "Degraded" ? "warning" : "critical"} />
                      <span className={cn("text-xs font-medium", cfg.cls)}>{cfg.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {c.category} · {c.events.toLocaleString("en-US")} events · synced {c.lastSync}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Progress
                        value={c.health}
                        className={cn("h-1 flex-1", c.health < 80 ? "[&>div]:bg-warning" : "[&>div]:bg-primary")}
                      />
                      <span className={cn("text-xs tabular font-medium shrink-0",
                        c.health >= 90 ? "text-primary" : c.health >= 70 ? "text-warning" : "text-critical"
                      )}>
                        {c.health}%
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    onClick={() => resync(c.id)}
                  >
                    <RefreshCw className="size-3.5" />
                    <span className="sr-only">Resync {c.name}</span>
                  </Button>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Available connectors */}
        <Panel
          title="Available connectors"
          description="Expand your data coverage"
          contentClassName="flex flex-col gap-3"
        >
          {available.map((c) => {
            const CatIcon = categoryIcons[c.category] || Database;
            return (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-secondary/20 p-3"
              >
                <div className="flex size-9 items-center justify-center rounded-md border border-border bg-card text-xs font-bold text-foreground shrink-0">
                  {c.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.category}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => connect(c.id)}
                >
                  Connect
                </Button>
              </div>
            );
          })}

          <div className="mt-auto pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Connect more sources to improve evidence coverage and finding confidence across all diagnostic categories.
            </p>
          </div>
        </Panel>

        {/* Live event stream */}
        <Panel
          title="Live event stream"
          description="Business Live webhook"
          actions={
            <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
              <Radio className="size-3 animate-pulse" />
              Live
            </span>
          }
          contentClassName="p-0 flex flex-col"
        >
          <div className="divide-y divide-border flex-1">
            {liveEvents.map((ev) => (
              <div key={ev.id} className="flex items-start gap-3 px-4 py-3">
                <StatusDot tone={ev.status === "ok" ? "ok" : ev.status === "retry" ? "warning" : "critical"} />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs text-foreground truncate">{ev.type}</p>
                  <p className="text-xs text-muted-foreground">{ev.source}</p>
                </div>
                <span className="font-mono text-[11px] tabular text-muted-foreground shrink-0">{ev.time}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-border px-4 py-3">
            <div className="text-xs font-medium text-muted-foreground mb-2">Event volume (24h)</div>
            <div className="flex items-end gap-0.5 h-12">
              {[22, 18, 31, 44, 38, 52, 61, 48, 55, 70, 63, 58, 72, 66, 80, 74, 68, 85, 91, 77, 88, 95, 82, 90].map((v, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-primary/30 hover:bg-primary/60 transition-colors"
                  style={{ height: `${(v / 100) * 100}%` }}
                />
              ))}
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              <span>00:00</span>
              <span>12:00</span>
              <span>Now</span>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
