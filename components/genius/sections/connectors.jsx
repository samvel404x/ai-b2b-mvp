"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Activity, ArrowUpRight, ArrowDownRight, Check, CheckCircle2, ChevronDown,
  Code2, Copy, Database, Edit2, Eye, EyeOff, ExternalLink, FileText,
  Filter, Globe, Lock, MoreHorizontal, Pause, Play, Plus, RefreshCw,
  RotateCcw, Search, Send, Settings, Shield, ShoppingCart, TrendingUp,
  Wifi, Zap, ArrowRight, BarChart2, Clock, AlertTriangle,
} from "lucide-react";
import {
  connectorsKpis, connectorCatalog, connectorLocked,
  connectorDetail, connectorHealthPanel,
} from "@/lib/genius-data";
import { Panel, StatusDot, Sparkline, Ring } from "../shared";
import { cn } from "@/lib/utils";

// ── Tone helpers ─────────────────────────────────────────────────────────────
const toneText  = { primary: "text-primary", critical: "text-critical", evidence: "text-evidence", warning: "text-warning", neutral: "text-foreground" };
const toneStroke = { primary: "var(--primary)", critical: "var(--critical)", evidence: "var(--evidence)", warning: "var(--warning)", neutral: "var(--muted-foreground)" };
const toneAccent = { primary: "stat-accent-primary", critical: "stat-accent-critical", warning: "stat-accent-warning", evidence: "stat-accent-evidence" };
const toneRing   = { primary: "var(--primary)", critical: "var(--critical)", evidence: "var(--evidence)", warning: "var(--warning)", neutral: "var(--muted-foreground)" };
const toneBg     = { primary: "bg-primary/10 text-primary border-primary/20", critical: "bg-critical/10 text-critical border-critical/20", evidence: "bg-evidence/10 text-evidence border-evidence/20", warning: "bg-warning/10 text-warning border-warning/20" };

// ── KPI Strip ────────────────────────────────────────────────────────────────
function KpiStrip() {
  return (
    <div className="grid grid-cols-4 gap-3 lg:grid-cols-8">
      {connectorsKpis.map((kpi, i) => (
        <div
          key={kpi.id}
          className={cn(
            "group relative flex animate-fade-up flex-col gap-2 overflow-hidden rounded-xl border border-[#ffffff08] bg-[#0a0c0b] p-3.5 transition-all duration-200 hover:border-[#1a2820] hover:bg-[#0d0f0e]",
            toneAccent[kpi.tone],
          )}
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <span className="text-[10px] font-medium text-[#4a5450] leading-tight">{kpi.label}</span>
          <div className="flex items-end justify-between gap-1">
            <span className={cn("text-[18px] font-semibold leading-none tabular", toneText[kpi.tone])}>{kpi.value}</span>
            <Ring value={kpi.ring} size={38} stroke={toneRing[kpi.tone]} />
          </div>
          {kpi.spark && <Sparkline data={kpi.spark} stroke={toneStroke[kpi.tone]} className="h-5 w-full" />}
          <div className="flex items-center gap-1">
            {kpi.trendDir === "up"   && <ArrowUpRight   className={cn("size-3 shrink-0", kpi.tone === "critical" ? "text-critical" : "text-primary")} />}
            {kpi.trendDir === "down" && <ArrowDownRight className="size-3 shrink-0 text-critical" />}
            <span className="text-[10px] text-[#4a5450] leading-tight truncate">{kpi.trend}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Catalog icon ─────────────────────────────────────────────────────────────
const catalogIconMap = {
  xlsx:    { Icon: FileText,    color: "text-[#1fd672]",  bg: "bg-[#1fd672]/10" },
  gsheet:  { Icon: FileText,    color: "text-[#4ade80]",  bg: "bg-[#4ade80]/10" },
  finance: { Icon: Database,    color: "text-[#38bdf8]",  bg: "bg-[#38bdf8]/10" },
  crm:     { Icon: TrendingUp,  color: "text-[#e0b341]",  bg: "bg-[#e0b341]/10" },
  webhook: { Icon: Code2,       color: "text-[#1fd672]",  bg: "bg-[#1fd672]/10" },
  url:     { Icon: Globe,       color: "text-[#38bdf8]",  bg: "bg-[#38bdf8]/10" },
};

// ── Connector Catalog Sidebar ─────────────────────────────────────────────────
function ConnectorCatalog({ selected, onSelect }) {
  const [search, setSearch] = useState("");
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[#ffffff08] bg-[#0a0c0b] animate-fade-up" style={{ animationDelay: "100ms" }}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#ffffff06] px-4 py-3">
        <span className="text-sm font-semibold text-foreground">Connector catalog</span>
        <Settings className="size-4 text-[#4a5450] cursor-pointer hover:text-foreground transition-colors" />
      </div>

      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 size-3.5 text-[#4a5450]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search connectors..."
            className="h-8 w-full rounded-lg border border-[#ffffff08] bg-[#0d0f0e] pl-8 pr-3 text-xs text-foreground placeholder-[#3a4040] outline-none focus:border-primary/30 transition-colors"
          />
          <ChevronDown className="absolute right-2.5 size-3 text-[#4a5450]" />
        </div>
      </div>

      {/* Active connectors */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-3 flex flex-col gap-3">
        {Object.entries(connectorCatalog).map(([group, items]) => {
          const filtered = items.filter(c =>
            !search || c.name.toLowerCase().includes(search.toLowerCase())
          );
          if (!filtered.length) return null;
          return (
            <div key={group}>
              <p className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#3a4040]">{group}</p>
              <div className="flex flex-col gap-1">
                {filtered.map((c) => {
                  const cfg = catalogIconMap[c.icon] || { Icon: Zap, color: "text-foreground", bg: "bg-white/5" };
                  const isActive = selected === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onSelect(c.id)}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-150",
                        isActive
                          ? "bg-primary/8 border border-primary/15"
                          : "border border-transparent hover:bg-white/4 hover:border-[#ffffff08]",
                      )}
                    >
                      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-md", cfg.bg)}>
                        <cfg.Icon className={cn("size-4", cfg.color)} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-foreground truncate">{c.name}</span>
                        </div>
                        <p className="text-[10px] text-[#4a5450] truncate">{c.desc}</p>
                      </div>
                      <span className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary shrink-0">
                        <span className="size-1.5 rounded-full bg-primary" />
                        {c.status}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Future connectors locked */}
        <div>
          <p className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#3a4040]">Future Connectors (Locked)</p>
          <div className="flex flex-col gap-1">
            {connectorLocked.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 opacity-50">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[#131614] text-[#3a4040]">
                  <Lock className="size-3.5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#4a5450] truncate">{c.name}</p>
                  <p className="text-[10px] text-[#3a4040] truncate">{c.desc}</p>
                </div>
                <span className="flex items-center gap-1 rounded-full border border-[#2a2f2d] px-2 py-0.5 text-[10px] text-[#3a4040] shrink-0">
                  <Lock className="size-2.5" /> Locked
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Request */}
        <button
          type="button"
          onClick={() => toast.success("Request submitted!")}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#ffffff0a] py-2.5 text-xs text-[#4a5450] transition-colors hover:border-primary/20 hover:text-primary"
        >
          <Plus className="size-3.5" />
          Request a connector
        </button>
      </div>
    </div>
  );
}

// ── Active Connector Tabs ────────────────────────────────────────────────────
const TABS = ["Schema mapping", "Event stream", "Logs", "Transformations", "Filters (3)"];

function ConnectorViewer() {
  const [tab, setTab] = useState("Schema mapping");
  const [streaming, setStreaming] = useState(true);
  const detail = connectorDetail;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[#ffffff08] bg-[#0a0c0b] animate-fade-up" style={{ animationDelay: "150ms" }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-[#ffffff06] px-5 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Code2 className="size-4 text-primary" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">{detail.name}</h2>
              <span className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                <span className="size-1.5 animate-pulse rounded-full bg-primary" /> Active
              </span>
            </div>
            <p className="text-[11px] text-[#4a5450]">{detail.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={() => toast.success("Opening docs...")} className="flex items-center gap-1.5 rounded-lg border border-[#ffffff08] bg-[#0d0f0e] px-3 py-1.5 text-xs text-[#8a9490] hover:text-foreground transition-colors">
            <FileText className="size-3" /> View docs
          </button>
          <button type="button" onClick={() => toast.success("Opening settings...")} className="flex items-center gap-1.5 rounded-lg border border-[#ffffff08] bg-[#0d0f0e] px-3 py-1.5 text-xs text-[#8a9490] hover:text-foreground transition-colors">
            <Settings className="size-3" /> Connector settings
          </button>
          <button type="button" className="flex size-7 items-center justify-center rounded-lg border border-[#ffffff08] bg-[#0d0f0e] text-[#5a6660] hover:text-foreground transition-colors">
            <MoreHorizontal className="size-4" />
          </button>
        </div>
      </div>

      {/* Setup checklist */}
      <div className="border-b border-[#ffffff06] px-5 py-4">
        <p className="mb-3 text-xs font-semibold text-foreground">Setup checklist</p>
        <div className="flex items-start gap-0">
          {detail.checklist.map((step, i) => (
            <div key={step.label} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full items-center">
                {i > 0 && <div className={cn("h-px flex-1 transition-all duration-500", step.done ? "bg-primary/40" : "bg-[#1a1f1d]")} style={{ animationDelay: `${i * 80}ms` }} />}
                <span className={cn(
                  "relative flex size-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                  step.done ? "border-primary/30 bg-primary/15" : "border-[#1a1f1d] bg-[#0d0f0e]",
                )}>
                  <CheckCircle2 className={cn("size-4 transition-colors", step.done ? "text-primary" : "text-[#3a4040]")} />
                  {step.done && <span className="absolute inset-0 rounded-full animate-pulse-ring" />}
                </span>
                {i < detail.checklist.length - 1 && <div className={cn("h-px flex-1", step.done && detail.checklist[i + 1]?.done ? "bg-primary/40" : "bg-[#1a1f1d]")} />}
              </div>
              <div className="flex flex-col items-center text-center px-1">
                <span className={cn("text-[10px] font-semibold leading-tight", step.done ? "text-foreground" : "text-[#4a5450]")}>{step.label}</span>
                <span className={cn("text-[9px] leading-tight mt-0.5", step.done ? "text-primary" : "text-[#3a4040]")}>{step.sub}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-end">
          <button type="button" className="text-[11px] text-evidence hover:text-evidence/70 transition-colors">
            View setup guide →
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-[#ffffff06] px-5">
        {TABS.map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "border-b-2 px-3 py-2.5 text-xs font-medium transition-all",
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-[#5a6660] hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content — schema mapping */}
      {tab === "Schema mapping" && (
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <table className="w-full text-xs">
            <thead className="sticky top-0 z-10 bg-[#0a0c0b]">
              <tr className="border-b border-[#ffffff06]">
                {["PAYLOAD FIELD", "EXAMPLE VALUE", "MAPPED TO", "DATA TYPE", "REQUIRED", "ACTIONS"].map(col => (
                  <th key={col} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-[#3a4040]">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {detail.schemaMapping.map((row, i) => (
                <tr
                  key={row.field}
                  className="animate-fade-up border-b border-[#ffffff04] table-row-hover group"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <MoreHorizontal className="size-3 text-[#3a4040] opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                      <span className="font-mono text-[11px] text-foreground">{row.field}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-[#5a6660]">{row.example}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5 rounded-md border border-[#ffffff08] bg-[#0d0f0e] px-2 py-1 w-fit">
                      <span className="text-[11px] text-foreground">{row.mappedTo}</span>
                      <ChevronDown className="size-2.5 text-[#4a5450]" />
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="rounded-md border border-[#ffffff06] bg-[#131614] px-2 py-0.5 text-[10px] font-mono text-[#5a6660]">{row.dataType}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={cn(
                      "flex size-5 items-center justify-center rounded border",
                      row.required ? "border-primary/30 bg-primary/15" : "border-[#1a1f1d] bg-[#0d0f0e]",
                    )}>
                      {row.required && <Check className="size-3 text-primary" />}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <Edit2 className="size-3.5 text-[#3a4040] hover:text-foreground cursor-pointer transition-colors" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3">
            <button
              type="button"
              onClick={() => toast.success("Field added")}
              className="flex items-center gap-1.5 text-[11px] text-[#4a5450] hover:text-primary transition-colors"
            >
              <Plus className="size-3.5" /> Add field mapping
            </button>
          </div>
          <div className="border-t border-[#ffffff06] px-4 py-3 flex justify-end">
            <button
              type="button"
              onClick={() => toast.success("Mapping validated!")}
              className="flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
            >
              <Check className="size-3.5" /> Validate mapping
            </button>
          </div>
        </div>
      )}

      {/* Tab content — event stream */}
      {tab === "Event stream" && (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#ffffff06] px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold text-foreground">Live event stream</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">Live</span>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setStreaming(s => !s)} className="flex items-center gap-1.5 rounded-md border border-[#ffffff08] px-2.5 py-1 text-[11px] text-[#8a9490] hover:text-foreground transition-colors">
                {streaming ? <Pause className="size-3" /> : <Play className="size-3" />}
                {streaming ? "Pause" : "Resume"}
              </button>
              <button type="button" className="rounded-md border border-[#ffffff08] px-2.5 py-1 text-[11px] text-[#8a9490] hover:text-foreground transition-colors">Clear</button>
              <div className="flex items-center gap-1 rounded-md border border-[#ffffff08] px-2.5 py-1 text-[11px] text-[#8a9490]">
                All events <ChevronDown className="size-3" />
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <table className="w-full text-xs">
              <thead className="sticky top-0 z-10 bg-[#0a0c0b] border-b border-[#ffffff06]">
                <tr>
                  {["TIME (LIVE)", "EVENT TYPE", "SOURCE", "ORDER / REF ID", "CUSTOMER", "AMOUNT", "STATUS", "INGESTION", "ACTIONS"].map(col => (
                    <th key={col} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-[#3a4040]">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {detail.eventStream.map((ev, i) => (
                  <tr key={i} className="animate-fade-up border-b border-[#ffffff04] table-row-hover" style={{ animationDelay: `${i * 60}ms` }}>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-[#5a6660]">{ev.time}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-primary" />
                        <span className="font-mono text-[11px] text-foreground">{ev.type}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-[11px] text-[#5a6660]">{ev.source}</td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-evidence">{ev.orderId}</td>
                    <td className="px-3 py-2.5 text-[11px] text-[#8a9490] truncate max-w-[120px]">{ev.customer}</td>
                    <td className={cn("px-3 py-2.5 font-mono text-[11px] font-semibold tabular", ev.amount.startsWith("-") ? "text-critical" : "text-foreground")}>{ev.amount}</td>
                    <td className="px-3 py-2.5">
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        ev.status === "completed" ? "bg-primary/10 text-primary" :
                        ev.status === "refunded"  ? "bg-critical/10 text-critical" :
                        ev.status === "reserved"  ? "bg-warning/10 text-warning" :
                        "bg-evidence/10 text-evidence",
                      )}>{ev.status}</span>
                    </td>
                    <td className="px-3 py-2.5 text-[11px] text-[#4a5450]">{ev.ingestion}</td>
                    <td className="px-3 py-2.5">
                      <Eye className="size-3.5 text-[#3a4040] hover:text-foreground cursor-pointer transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-[#ffffff06] px-4 py-2.5 text-[11px] text-[#4a5450]">
            <button type="button" className="text-primary hover:text-primary/70 transition-colors">
              View all events →
            </button>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                Streaming
              </span>
              <span>·</span>
              <span>1,247 events today</span>
            </div>
          </div>
        </div>
      )}

      {/* Other tabs placeholder */}
      {tab !== "Schema mapping" && tab !== "Event stream" && (
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-center">
            <Activity className="size-8 text-[#3a4040]" />
            <p className="text-sm font-medium text-[#4a5450]">{tab}</p>
            <p className="text-xs text-[#3a4040]">Data loading...</p>
          </div>
        </div>
      )}

      {/* Pipeline flow */}
      <div className="border-t border-[#ffffff06] px-5 py-4">
        <div className="flex items-center gap-0 overflow-x-auto scrollbar-thin">
          {detail.pipeline.map((step, i) => (
            <div key={step.step} className="flex items-center shrink-0">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-1 rounded-full border border-[#ffffff08] bg-[#0d0f0e] px-2 py-0.5">
                  <span className="text-[10px] font-semibold text-primary">{step.step}</span>
                  <span className="text-[10px] text-[#5a6660]">{step.label}</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-[#ffffff06] bg-[#0d0f0e] px-3 py-2 min-w-[110px]">
                  {step.icon === "cart"    && <ShoppingCart className="size-4 text-primary shrink-0" />}
                  {step.icon === "doc"     && <FileText      className="size-4 text-evidence shrink-0" />}
                  {step.icon === "chart"   && <BarChart2     className="size-4 text-[#e0b341] shrink-0" />}
                  {step.icon === "shield"  && <Shield        className="size-4 text-primary shrink-0" />}
                  {step.icon === "check"   && <CheckCircle2  className="size-4 text-primary shrink-0" />}
                  {step.icon === "trail"   && <FileText      className="size-4 text-evidence shrink-0" />}
                  <div className="flex flex-col gap-0.5">
                    {step.sub.split("\n").map((line, j) => (
                      <span key={j} className={cn("text-[10px] leading-tight", j === 0 ? "font-semibold text-foreground" : "text-[#5a6660]")}>{line}</span>
                    ))}
                  </div>
                </div>
              </div>
              {i < detail.pipeline.length - 1 && (
                <ArrowRight className="mx-2 size-4 text-[#2a2f2d] shrink-0 mt-5" />
              )}
            </div>
          ))}
          <div className="ml-3 shrink-0">
            <button type="button" onClick={() => toast.success("Opening proof trail...")} className="text-[11px] text-evidence hover:text-evidence/70 transition-colors whitespace-nowrap">
              View proof trail →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Health Panel ─────────────────────────────────────────────────────────────
function HealthPanel() {
  const [secretVisible, setSecretVisible] = useState(false);
  const h = connectorHealthPanel;

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto scrollbar-thin animate-fade-up" style={{ animationDelay: "200ms" }}>
      {/* Connector health */}
      <div className="rounded-xl border border-[#ffffff08] bg-[#0a0c0b] overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#ffffff06] px-4 py-3">
          <span className="text-sm font-semibold text-foreground">Connector health</span>
          <span className="text-xs font-semibold text-primary">{h.label}</span>
        </div>
        <div className="flex items-center gap-4 px-4 py-4">
          <div className="relative shrink-0">
            <Ring value={h.health} size={80} stroke="var(--primary)" />
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <p className="text-xs font-semibold text-foreground">{h.sub}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-1">
              <div>
                <p className="text-[10px] text-[#4a5450]">Latency</p>
                <p className="text-xs font-semibold text-foreground">{h.latency}</p>
                <p className="text-[10px] text-primary">{h.latencyLabel}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#4a5450]">Error rate</p>
                <p className="text-xs font-semibold text-foreground">{h.errorRate}</p>
                <p className="text-[10px] text-primary">{h.errorRateLabel}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-[#ffffff06] px-4 py-2.5">
          <button type="button" className="text-[11px] text-evidence hover:text-evidence/70 transition-colors">View health details →</button>
        </div>
      </div>

      {/* Auth & permissions */}
      <div className="rounded-xl border border-[#ffffff08] bg-[#0a0c0b] overflow-hidden">
        <div className="border-b border-[#ffffff06] px-4 py-3">
          <span className="text-sm font-semibold text-foreground">Authentication & permissions</span>
        </div>
        <div className="flex flex-col gap-2 px-4 py-3">
          {[
            { label: "API Key",           value: h.auth.apiKey,           tone: "primary" },
            { label: "Permission scope",  value: h.auth.permissionScope,  tone: null },
            { label: "Last verified",     value: h.auth.lastVerified,     tone: null },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-xs text-[#4a5450]">{row.label}</span>
              <span className={cn("text-xs font-medium", row.tone === "primary" ? "text-primary" : "text-foreground")}>{row.value}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-[#ffffff06] px-4 py-2.5">
          <button type="button" className="text-[11px] text-evidence hover:text-evidence/70 transition-colors">Manage credentials →</button>
        </div>
      </div>

      {/* Retry queue */}
      <div className="rounded-xl border border-[#ffffff08] bg-[#0a0c0b] overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#ffffff06] px-4 py-3">
          <span className="text-sm font-semibold text-foreground">Retry queue</span>
          <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-semibold text-warning">{h.retryQueue.length} items</span>
        </div>
        <div className="flex flex-col divide-y divide-[#ffffff04]">
          {h.retryQueue.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-4 py-2.5 group">
              <div>
                <p className="font-mono text-[11px] text-foreground">{item.id}</p>
                <p className="text-[10px] text-[#4a5450]">{item.type}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-warning">{item.retries} {item.retries === 1 ? "retry" : "retries"}</span>
                <RotateCcw className="size-3.5 text-[#3a4040] hover:text-warning cursor-pointer transition-colors" onClick={() => toast.success(`Retrying ${item.id}...`)} />
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-[#ffffff06] px-4 py-2.5">
          <button type="button" className="text-[11px] text-evidence hover:text-evidence/70 transition-colors">View retry queue →</button>
        </div>
      </div>

      {/* Webhook secret */}
      <div className="rounded-xl border border-[#ffffff08] bg-[#0a0c0b] overflow-hidden">
        <div className="border-b border-[#ffffff06] px-4 py-3">
          <span className="text-sm font-semibold text-foreground">Webhook secret</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-3">
          <code className="flex-1 rounded-md border border-[#ffffff06] bg-[#0d0f0e] px-3 py-2 font-mono text-[11px] text-[#8a9490] truncate">
            {secretVisible ? "whsec_a7b3real_key_shown_here" : h.webhookSecret}
          </code>
          <button type="button" onClick={() => setSecretVisible(s => !s)} className="flex size-8 items-center justify-center rounded-md border border-[#ffffff08] text-[#5a6660] hover:text-foreground transition-colors">
            {secretVisible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          </button>
          <button type="button" onClick={() => toast.success("Copied!")} className="flex size-8 items-center justify-center rounded-md border border-[#ffffff08] text-[#5a6660] hover:text-foreground transition-colors">
            <Copy className="size-3.5" />
          </button>
        </div>
        <div className="border-t border-[#ffffff06] px-4 py-2.5">
          <button type="button" onClick={() => toast.success("Secret rotated!")} className="text-[11px] text-critical hover:text-critical/70 transition-colors">Rotate secret</button>
        </div>
      </div>

      {/* Test connection */}
      <div className="rounded-xl border border-[#ffffff08] bg-[#0a0c0b] overflow-hidden">
        <div className="border-b border-[#ffffff06] px-4 py-3">
          <span className="text-sm font-semibold text-foreground">Test connection</span>
        </div>
        <div className="px-4 py-3">
          <p className="mb-3 text-[11px] text-[#4a5450]">Send a test event to verify your webhook is working.</p>
          <button
            type="button"
            onClick={() => toast.success("Test event sent!", { description: "Received in 1.2s" })}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary/10 border border-primary/20 py-2.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-all duration-200"
          >
            <Send className="size-3.5" /> Send test event
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Connectors Page ─────────────────────────────────────────────────────
export default function Connectors() {
  const [selectedConnector, setSelectedConnector] = useState("c-biz");

  return (
    <div className="flex h-[calc(100vh-6.5rem)] flex-col gap-4">
      {/* KPI strip */}
      <KpiStrip />

      {/* 3-column layout fills remaining space */}
      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[240px_1fr_260px]">
        <ConnectorCatalog selected={selectedConnector} onSelect={setSelectedConnector} />
        <ConnectorViewer />
        <HealthPanel />
      </div>
    </div>
  );
}
