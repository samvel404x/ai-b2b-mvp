"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Download, Filter, RefreshCw, Sparkles } from "lucide-react";
import {
  excelWorkbookRows, excelAiFindings, excelSpendByCategory,
  excelForecastTrend, excelProofTrail, excelConnectors, formatCurrencyFull,
} from "@/lib/genius-data";
import { EvidenceLink } from "../shared";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const anomalyStyle = {
  "Duplicate":      "border-critical/25 bg-critical/8 text-critical",
  "High spend":     "border-warning/25 bg-warning/8 text-warning",
  "At risk":        "border-critical/25 bg-critical/8 text-critical",
  "Uncoded":        "border-white/8 bg-white/3 text-[#5a6660]",
  "Forecast var.":  "border-warning/25 bg-warning/8 text-warning",
  "Price variance": "border-warning/25 bg-warning/8 text-warning",
  "Policy breach":  "border-critical/25 bg-critical/8 text-critical",
  "Low stock":      "border-evidence/20 bg-evidence/8 text-evidence",
  "Missing owner":  "border-warning/25 bg-warning/8 text-warning",
  "Formula issue":  "border-warning/25 bg-warning/8 text-warning",
  "Inactive vendor": "border-white/8 bg-white/3 text-[#5a6660]",
};

const approvalStyle = {
  "Pending":     "bg-warning/10 text-warning border border-warning/20",
  "Review":      "bg-evidence/10 text-evidence border border-evidence/20",
  "Not started": "bg-white/5 text-[#5a6660] border border-white/8",
};

// ── Spend By Category Bar ───────────────────────────────────────────────────
function SpendByCategoryBar({ data }) {
  const max = Math.max(...data.map(d => d.amount));
  const colors = ["bg-primary", "bg-evidence", "bg-warning", "bg-critical", "bg-[#5a6660]", "bg-primary/40"];
  return (
    <div className="flex flex-col gap-2">
      {data.map((d, i) => (
        <div key={d.category} className="flex items-center gap-2">
          <span className="w-20 text-[10px] text-[#5a6660] truncate shrink-0">{d.category}</span>
          <div className="flex-1 h-2.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-700", colors[i % colors.length])}
              style={{ width: `${(d.amount / max) * 100}%` }}
            />
          </div>
          <span className="w-20 text-right text-[10px] tabular text-[#5a6660] shrink-0">${d.amount}K ({d.pct}%)</span>
        </div>
      ))}
    </div>
  );
}

// ── Forecast Trend Line ───────────────────────────────────────────────────────
function ForecastTrendLine({ data }) {
  const vals = data.map(d => d.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const w = 260, h = 56;
  const step = w / (data.length - 1);
  const points = data.map((d, i) => [i * step, h - ((d.value - min) / span) * (h - 8) - 4]);
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const zeroY = h - ((0 - min) / span) * (h - 8) - 4;

  return (
    <div className="flex flex-col gap-1">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-12 w-full">
        <line x1="0" y1={zeroY.toFixed(1)} x2={w} y2={zeroY.toFixed(1)} stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="4 3" />
        <path d={line} fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="flex items-center justify-between text-[9px] text-[#3a4040]">
        {data.map(d => <span key={d.month}>{d.month.replace(" '26", "")}</span>)}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[#4a5450]">Forecast variance</span>
        <span className="text-sm font-bold tabular text-critical">-$430K</span>
      </div>
    </div>
  );
}

// ── Confidence circle ────────────────────────────────────────────────────────
function ConfCircle({ value }) {
  const color = value > 85 ? "var(--primary)" : value > 70 ? "var(--warning)" : "var(--critical)";
  return (
    <div className="relative size-7">
      <svg viewBox="0 0 28 28" className="-rotate-90 size-7">
        <circle cx="14" cy="14" r="10" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <circle cx="14" cy="14" r="10" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={62.8} strokeDashoffset={62.8 - (value / 100) * 62.8} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[8px] tabular font-bold text-foreground">{value}</span>
    </div>
  );
}

// ── AI Analysis Panel ────────────────────────────────────────────────────────
function AiAnalysisPanel({ onNavigate }) {
  return (
    <div className="flex flex-col gap-5">
      {/* AI Summary */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#3a4040]">AI Analysis Summary</span>
          <button type="button" className="text-[11px] text-evidence hover:text-evidence/70 transition-colors" onClick={() => onNavigate?.("reports")}>
            View full report →
          </button>
        </div>
        <div className="flex flex-col gap-1.5">
          {excelAiFindings.map(f => (
            <div key={f.rank} className="flex items-center gap-2.5 rounded-xl border border-[#ffffff08] bg-[#0d0f0e] px-3 py-2.5 transition-colors hover:border-[#1a2820] cursor-pointer">
              <span className={cn("flex size-5 items-center justify-center rounded-full text-[10px] font-bold shrink-0",
                f.rank === 1 ? "bg-critical/15 text-critical" : f.rank === 2 ? "bg-warning/15 text-warning" : "bg-white/8 text-[#5a6660]"
              )}>{f.rank}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{f.label}</p>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="text-[11px] font-bold tabular text-foreground">Impact {f.impact}</span>
                <span className="text-[10px] tabular text-[#4a5450]">{f.confidence}% · {f.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spend leakage by category */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#3a4040]">Spend leakage by category</span>
          <button type="button" className="text-[11px] text-evidence hover:text-evidence/70 transition-colors" onClick={() => onNavigate?.("diagnostics")}>
            View breakdown →
          </button>
        </div>
        <SpendByCategoryBar data={excelSpendByCategory} />
      </div>

      {/* Forecast variance trend */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#3a4040]">Forecast variance trend</span>
          <button type="button" className="text-[11px] text-evidence hover:text-evidence/70 transition-colors">View details →</button>
        </div>
        <ForecastTrendLine data={excelForecastTrend} />
      </div>

      {/* Proof Trail */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#3a4040]">Proof Trail (Latest)</span>
        </div>
        <div className="overflow-hidden rounded-xl border border-[#ffffff08]">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-[#ffffff06]">
                {["Source row", "Finding", "Action", "Approval", "Proof link"].map(h => (
                  <th key={h} className="px-2 py-2 text-left font-semibold uppercase tracking-[0.08em] text-[#2e3630] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {excelProofTrail.map((pt, i) => (
                <tr key={i} className={cn("border-b border-[#ffffff04] transition-colors hover:bg-white/[0.02]", i === excelProofTrail.length - 1 && "border-b-0")}>
                  <td className="px-2 py-1.5">
                    <span className={cn("mr-1 inline-block size-1.5 rounded-full", pt.severity === "High" ? "bg-critical" : pt.severity === "Medium" ? "bg-warning" : "bg-[#3a4040]")} />
                    {pt.sourceRow}
                  </td>
                  <td className="px-2 py-1.5 text-[#5a6660]">{pt.finding}</td>
                  <td className="px-2 py-1.5 text-[#4a5450]">{pt.action}</td>
                  <td className="px-2 py-1.5">
                    <span className="text-warning font-medium">{pt.approval}</span>
                  </td>
                  <td className="px-2 py-1.5">
                    <EvidenceLink>{pt.proofLink}</EvidenceLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ExcelWorkspace({ onNavigate }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("Workbook view");
  const tabs = ["Workbook view", "Sheet overview", "Anomalies", "Trends", "Modeling", "What-if"];
  const statusFilters = ["All", "Duplicate", "High spend", "At risk", "Uncoded", "Forecast var.", "Price variance", "Policy breach", "Missing owner", "Formula issue", "Inactive vendor"];

  const rows = useMemo(() => excelWorkbookRows.filter(row => {
    const matchStatus = status === "All" || row.anomaly === status;
    const matchQuery = !query || row.description.toLowerCase().includes(query.toLowerCase()) || row.source.toLowerCase().includes(query.toLowerCase());
    return matchStatus && matchQuery;
  }), [query, status]);

  const allSelected = rows.length > 0 && selected.length === rows.length;
  const rowsPerPage = 12;
  const totalRows = 1421687;

  function toggleAll() { setSelected(allSelected ? [] : rows.map(r => r.id)); }
  function toggleRow(id) { setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]); }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Excel Workspace</h1>
          <p className="text-sm text-[#4a5450]">Spreadsheet intelligence. Detect issues, quantify impact, take approval-safe actions.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-[#ffffff10] bg-transparent text-[#8a9490] hover:bg-white/5">
            <Download className="size-3.5 mr-1.5" />Export
          </Button>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={selected.length === 0}
            onClick={() => toast.success(`Asking AI about ${selected.length} rows`)}>
            <Sparkles className="size-3.5 mr-1.5" />Ask about selection
          </Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {[
          { label: "Rows processed", value: "1.42M", trend: "▲ 24.6%", tone: "primary" },
          { label: "Spend analyzed", value: "$6.21M", trend: "▲ 8.7%", tone: "primary" },
          { label: "Duplicate payments", value: "95", trend: "▲ 19", tone: "critical" },
          { label: "Forecast variance", value: "-$430K", trend: "▼ 5.1%", tone: "critical" },
          { label: "Margin risk", value: "$1.21M", trend: "▲ 15.6%", tone: "warning" },
          { label: "Missing values", value: "8,771", trend: "▼ 6.3%", tone: "warning" },
          { label: "Formula issues", value: "241", trend: "▲ 31", tone: "warning" },
          { label: "Open approval value", value: "$1.84M", trend: "▲ 12%", tone: "evidence" },
        ].map((k, i) => {
          const toneClass = { primary: "text-primary", critical: "text-critical", warning: "text-warning", evidence: "text-evidence" }[k.tone] || "text-foreground";
          const accentClass = { primary: "border-t-primary/35", critical: "border-t-critical/35", warning: "border-t-warning/35", evidence: "border-t-evidence/35" }[k.tone] || "";
          return (
            <div key={k.label} className={cn("flex flex-col gap-1.5 rounded-xl border border-t-2 border-[#ffffff08] bg-[#0a0c0b] p-3 animate-fade-up", accentClass)} style={{ animationDelay: `${i * 35}ms` }}>
              <span className="text-[10px] font-medium text-[#4a5450] leading-snug">{k.label}</span>
              <span className={cn("text-base font-bold tabular leading-none", toneClass)}>{k.value}</span>
              <span className="text-[9px] text-[#2e3630]">{k.trend} vs 7d</span>
            </div>
          );
        })}
      </div>

      {/* Main content */}
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-0 border-b border-[#ffffff06]">
            {tabs.map(t => (
              <button key={t} type="button" onClick={() => setActiveTab(t)} className={cn("relative px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap", activeTab === t ? "text-foreground" : "text-[#4a5450] hover:text-[#8a9490]")}>
                {t}
                {activeTab === t && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
              </button>
            ))}
          </div>

          {/* Control bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Select defaultValue="Spend_Analysis_May2026.xlsx">
              <SelectTrigger className="h-8 w-56 border-primary/25 bg-primary/5 text-xs text-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup><SelectItem value="Spend_Analysis_May2026.xlsx">Spend_Analysis_May2026.xlsx</SelectItem></SelectGroup>
              </SelectContent>
            </Select>
            <Select defaultValue="Sheet1">
              <SelectTrigger className="h-8 w-44 text-xs border-[#ffffff10] bg-white/[0.025]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup><SelectItem value="Sheet1">Sheet1 – Transactions</SelectItem></SelectGroup>
              </SelectContent>
            </Select>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />Live
            </span>
            <span className="text-xs text-[#3a4040]">1.42M rows</span>
            <span className="text-xs text-[#3a4040]">Last analyzed: 10:41 AM</span>
            <div className="ml-auto flex items-center gap-2">
              <div className="relative">
                <Filter className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-[#4a5450]" />
                <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search in data..." className="h-8 w-36 pl-8 text-xs border-[#ffffff10] bg-white/[0.025]" />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-8 w-36 text-xs border-[#ffffff10] bg-white/[0.025]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {statusFilters.map(s => <SelectItem key={s} value={s}>{s === "All" ? "All anomalies" : s}</SelectItem>)}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-[#5a6660]" onClick={() => { setQuery(""); setStatus("All"); }}>Clear all</Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-[#ffffff08] bg-[#0a0c0b]">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#ffffff06] bg-white/[0.015]">
                    <th className="px-3 py-2.5 text-left">
                      <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" />
                    </th>
                    {["#", "Source / Sheet", "Row", "Description", "Amount", "Category", "Anomaly", "Confidence", "Suggested Fix", "Owner", "State"].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-[#3a4040] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => {
                    const isSel = selected.includes(row.id);
                    return (
                      <tr key={row.id} className={cn("border-b border-[#ffffff04] transition-colors hover:bg-white/[0.02]", isSel && "bg-white/[0.03]", idx === rows.length - 1 && "border-b-0")}>
                        <td className="px-3 py-2.5">
                          <Checkbox checked={isSel} onCheckedChange={() => toggleRow(row.id)} />
                        </td>
                        <td className="px-3 py-2.5 tabular text-[#4a5450]">{(page - 1) * rowsPerPage + idx + 1}</td>
                        <td className="px-3 py-2.5 max-w-[110px]">
                          <span className="block truncate text-evidence text-[10px] font-medium">{row.source}</span>
                        </td>
                        <td className="px-3 py-2.5 tabular text-[#5a6660]">{row.row.toLocaleString()}</td>
                        <td className="px-3 py-2.5 max-w-[160px]">
                          <span className="block truncate font-medium text-foreground">{row.description}</span>
                        </td>
                        <td className="px-3 py-2.5 tabular font-semibold text-foreground">
                          {row.amount > 0 ? `$${row.amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}` : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-[#5a6660]">{row.category}</td>
                        <td className="px-3 py-2.5">
                          <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap", anomalyStyle[row.anomaly] || "border-white/8 bg-white/3 text-[#5a6660]")}>
                            {row.anomaly}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <ConfCircle value={row.confidence} />
                        </td>
                        <td className="px-3 py-2.5 max-w-[150px] text-[#5a6660]">
                          <span className="block truncate">{row.suggestedFix}</span>
                        </td>
                        <td className="px-3 py-2.5 text-[#5a6660] whitespace-nowrap">{row.owner}</td>
                        <td className="px-3 py-2.5">
                          <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-semibold", approvalStyle[row.approvalState] || "bg-white/5 text-[#5a6660] border border-white/8")}>
                            {row.approvalState}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-[#ffffff06] px-4 py-2.5">
              <span className="text-[11px] text-[#3a4040]">
                Showing {(page - 1) * rowsPerPage + 1} to {Math.min(page * rowsPerPage, rows.length)} of {totalRows.toLocaleString()} rows
              </span>
              <div className="flex items-center gap-1">
                <button type="button" className="flex size-6 items-center justify-center rounded-md text-[#5a6660] transition-colors hover:bg-white/5 hover:text-foreground disabled:opacity-30" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                  <ChevronLeft className="size-3" />
                </button>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button" onClick={() => setPage(n)} className={cn("flex size-6 items-center justify-center rounded-md text-xs transition-colors", page === n ? "bg-primary text-primary-foreground" : "text-[#5a6660] hover:bg-white/5")}>
                    {n}
                  </button>
                ))}
                <span className="text-[11px] text-[#3a4040] px-1">…</span>
                <button type="button" className="flex h-6 items-center justify-center rounded-md px-1.5 text-[11px] text-[#5a6660] hover:bg-white/5">118,474</button>
                <button type="button" className="flex size-6 items-center justify-center rounded-md text-[#5a6660] transition-colors hover:bg-white/5 hover:text-foreground" onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="size-3" />
                </button>
                <Select defaultValue="12">
                  <SelectTrigger className="h-6 w-20 text-[11px] border-[#ffffff10] bg-white/[0.025] ml-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {["12", "25", "50"].map(v => <SelectItem key={v} value={v}>{v} rows</SelectItem>)}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Data Connectors */}
          <div className="overflow-hidden rounded-xl border border-[#ffffff08] bg-[#0a0c0b]">
            <div className="flex items-center justify-between border-b border-[#ffffff06] px-4 py-3">
              <span className="text-sm font-semibold text-foreground">Data Connectors</span>
              <Button variant="ghost" size="sm" className="text-evidence text-xs">Manage connectors →</Button>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-5">
              {excelConnectors.map(c => (
                <div key={c.name} className="flex flex-col gap-2 rounded-xl border border-[#ffffff08] bg-[#0d0f0e] p-3 transition-colors hover:border-[#1a2820]">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-white/[0.04] text-xs font-bold text-foreground">{c.icon}</div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{c.name}</p>
                    <p className="text-[10px] text-[#4a5450]">{c.rows}</p>
                    <p className="text-[10px] text-[#3a4040]">{c.synced}</p>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-primary">
                    <span className="size-1.5 rounded-full bg-primary" />{c.status}
                  </span>
                </div>
              ))}
            </div>
            {/* System status footer */}
            <div className="flex flex-wrap items-center gap-4 border-t border-[#ffffff06] px-4 py-2.5 text-[11px]">
              {[
                { label: "System status", value: "All systems operational" },
                { label: "Data pipeline", value: "Healthy", color: "text-primary" },
                { label: "AI extraction", value: "Healthy", color: "text-primary" },
                { label: "Agent runtime", value: "Healthy", color: "text-primary" },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <span className="text-[#3a4040]">{s.label}</span>
                  <span className={cn("font-semibold", s.color || "text-[#5a6660]")}>{s.value}</span>
                </div>
              ))}
              <div className="ml-auto flex items-center gap-1 text-[#3a4040]">
                <RefreshCw className="size-3" />
                Last updated: 2m ago
              </div>
            </div>
          </div>
        </div>

        {/* Right: AI Analysis Panel */}
        <div className="overflow-hidden rounded-xl border border-[#ffffff08] bg-[#0a0c0b]">
          <div className="flex items-center justify-between border-b border-[#ffffff06] px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">AI Analysis</span>
            </div>
          </div>
          <div className="overflow-y-auto scrollbar-thin p-4" style={{ maxHeight: "calc(100vh - 360px)" }}>
            <AiAnalysisPanel onNavigate={onNavigate} />
          </div>
        </div>
      </div>
    </div>
  );
}
