"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Download, Filter, RefreshCw, Sparkles } from "lucide-react";
import {
  excelWorkbookRows, excelAiFindings, excelSpendByCategory,
  excelForecastTrend, excelProofTrail, excelConnectors, formatCurrencyFull,
} from "@/lib/genius-data";
import { PageHeader, Panel, EvidenceLink } from "../shared";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const anomalyStyle = {
  "Duplicate": "border-critical/30 bg-critical/10 text-critical",
  "High spend": "border-warning/30 bg-warning/10 text-warning",
  "At risk": "border-critical/30 bg-critical/10 text-critical",
  "Uncoded": "border-muted-foreground/30 bg-secondary text-muted-foreground",
  "Forecast var.": "border-warning/30 bg-warning/10 text-warning",
  "Price variance": "border-warning/30 bg-warning/10 text-warning",
  "Policy breach": "border-critical/30 bg-critical/10 text-critical",
  "Low stock": "border-evidence/30 bg-evidence/10 text-evidence",
  "Missing owner": "border-warning/30 bg-warning/10 text-warning",
  "Formula issue": "border-warning/30 bg-warning/10 text-warning",
  "Inactive vendor": "border-muted-foreground/30 bg-secondary text-muted-foreground",
};

const approvalStyle = {
  "Pending": "bg-warning/10 text-warning",
  "Review": "bg-evidence/10 text-evidence",
  "Not started": "bg-secondary text-muted-foreground",
};

function SpendByCategoryBar({ data }) {
  const max = Math.max(...data.map(d => d.amount));
  const colors = ["bg-primary", "bg-evidence", "bg-warning", "bg-critical", "bg-muted-foreground/60", "bg-primary/40"];
  return (
    <div className="flex flex-col gap-2">
      {data.map((d, i) => (
        <div key={d.category} className="flex items-center gap-2">
          <span className="w-20 text-[11px] text-muted-foreground truncate shrink-0">{d.category}</span>
          <div className="flex-1 h-3 rounded-full bg-secondary overflow-hidden">
            <div className={cn("h-full rounded-full transition-all duration-700", colors[i % colors.length])} style={{ width: `${(d.amount / max) * 100}%` }} />
          </div>
          <span className="w-16 text-right text-[11px] tabular text-muted-foreground shrink-0">${d.amount}K ({d.pct}%)</span>
        </div>
      ))}
    </div>
  );
}

function ForecastTrendLine({ data }) {
  const vals = data.map(d => d.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const w = 280, h = 60;
  const step = w / (data.length - 1);
  const points = data.map((d, i) => [i * step, h - ((d.value - min) / span) * (h - 8) - 4]);
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const zero = h - ((0 - min) / span) * (h - 8) - 4;
  return (
    <div className="flex flex-col gap-1">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-14 w-full">
        {/* Zero line */}
        <line x1="0" y1={zero.toFixed(1)} x2={w} y2={zero.toFixed(1)} stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" />
        <path d={line} fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        {data.map(d => <span key={d.month}>{d.month.replace(" '26", "")}</span>)}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Forecast variance</span>
        <span className="text-sm font-semibold tabular text-critical">-$430K</span>
      </div>
    </div>
  );
}

function AiAnalysisPanel({ onNavigate }) {
  return (
    <div className="flex flex-col gap-5">
      {/* AI Analysis Summary */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">AI Analysis Summary</span>
          <button type="button" className="text-xs text-evidence hover:underline" onClick={() => onNavigate?.("reports")}>View full report →</button>
        </div>
        <div className="flex flex-col gap-1.5">
          {excelAiFindings.map(f => (
            <div key={f.rank} className="flex items-center gap-2.5 rounded-lg border border-border bg-secondary/30 px-3 py-2 hover:border-border/70 transition-colors cursor-pointer">
              <span className={cn("flex size-5 items-center justify-center rounded-full text-[10px] font-bold shrink-0",
                f.rank === 1 ? "bg-critical/20 text-critical" : f.rank === 2 ? "bg-warning/20 text-warning" : "bg-secondary text-muted-foreground"
              )}>{f.rank}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{f.label}</p>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="text-xs font-semibold tabular text-foreground">Impact {f.impact}</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] tabular text-muted-foreground">{f.confidence}%</span>
                  <span className="text-[10px] tabular text-muted-foreground">{f.count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spend leakage by category */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Spend leakage by category</span>
          <button type="button" className="text-xs text-evidence hover:underline" onClick={() => onNavigate?.("diagnostics")}>View breakdown →</button>
        </div>
        <SpendByCategoryBar data={excelSpendByCategory} />
      </div>

      {/* Forecast variance trend */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Forecast variance trend</span>
          <button type="button" className="text-xs text-evidence hover:underline">View details →</button>
        </div>
        <ForecastTrendLine data={excelForecastTrend} />
      </div>
    </div>
  );
}

export default function ExcelWorkspace({ onNavigate }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("Workbook view");
  const tabs = ["Workbook view", "Sheet overview", "Anomalies", "Trends", "Modeling", "What-if"];
  const statusFilters = ["All", "Duplicate", "High spend", "At risk", "Uncoded", "Forecast var.", "Price variance", "Policy breach", "Missing owner", "Formula issue", "Inactive vendor"];

  const rows = useMemo(() => {
    return excelWorkbookRows.filter(row => {
      const matchStatus = status === "All" || row.anomaly === status;
      const matchQuery = !query || row.description.toLowerCase().includes(query.toLowerCase()) || row.source.toLowerCase().includes(query.toLowerCase());
      return matchStatus && matchQuery;
    });
  }, [query, status]);

  const allSelected = rows.length > 0 && selected.length === rows.length;
  const flaggedTotal = rows.filter(r => r.amount > 0).reduce((s, r) => s + r.amount, 0);
  const rowsPerPage = 12;
  const totalRows = 1421687;

  function toggleAll() { setSelected(allSelected ? [] : rows.map(r => r.id)); }
  function toggleRow(id) { setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]); }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Excel Workspace"
        description="Spreadsheet intelligence. Detect issues, quantify impact, and take approval-safe actions."
        actions={
          <>
            <Button variant="outline" size="sm"><Download className="size-3.5 mr-1.5" />Export</Button>
            <Button size="sm" disabled={selected.length === 0} onClick={() => toast.success(`Asking AI about ${selected.length} rows`)}>
              <Sparkles className="size-3.5 mr-1.5" />
              Ask about selection
            </Button>
          </>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-8">
        {[
          { label: "Rows processed", value: "1.42M", trend: "▲ 24.6%", tone: "primary" },
          { label: "Spend analyzed", value: "$6.21M", trend: "▲ 8.7%", tone: "primary" },
          { label: "Duplicate payments", value: "95", trend: "▲ 19", tone: "critical" },
          { label: "Forecast variance", value: "-$430K", trend: "▼ 5.1%", tone: "critical" },
          { label: "Margin risk", value: "$1.21M", trend: "▲ 15.6%", tone: "warning" },
          { label: "Missing values", value: "8,771", trend: "▼ 6.3%", tone: "warning" },
          { label: "Formula issues", value: "241", trend: "▲ 31", sub: "3 approvals", tone: "warning" },
          { label: "Open approval value", value: "$1.84M", trend: "▲ 12%", tone: "evidence" },
        ].map((k, i) => (
          <div key={k.label} className="flex flex-col gap-1 rounded-xl border border-border bg-card p-3 animate-fade-up" style={{ animationDelay: `${i * 35}ms` }}>
            <span className="text-[10px] font-medium text-muted-foreground leading-snug">{k.label}</span>
            <span className={cn("text-base font-semibold tabular leading-none", k.tone === "primary" ? "text-primary" : k.tone === "critical" ? "text-critical" : k.tone === "warning" ? "text-warning" : "text-evidence")}>{k.value}</span>
            <span className="text-[10px] text-muted-foreground">{k.trend} vs last 7 days</span>
          </div>
        ))}
      </div>

      {/* Main content: table + right panel */}
      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-4">
          {/* Tabs + workbook selector */}
          <div className="flex items-center gap-1 border-b border-border">
            {tabs.map(t => (
              <button key={t} type="button" onClick={() => setActiveTab(t)} className={cn("relative px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap", activeTab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
                {t}
                {activeTab === t && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
              </button>
            ))}
          </div>

          {/* Workbook control bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Select defaultValue="Spend_Analysis_May2026.xlsx">
              <SelectTrigger className="h-8 w-56 text-xs border-primary/30 text-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Spend_Analysis_May2026.xlsx">Spend_Analysis_May2026.xlsx</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select defaultValue="Sheet1">
              <SelectTrigger className="h-8 w-44 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Sheet1">Sheet1 – Transactions</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <span className="flex items-center gap-1.5 text-xs text-primary font-medium">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />Live
            </span>
            <span className="text-xs text-muted-foreground">1.42M rows</span>
            <span className="text-xs text-muted-foreground">Last analyzed: 10:41 AM</span>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs">Columns</Button>
              <div className="relative">
                <Filter className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
                <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search in data..." className="h-8 w-36 pl-8 text-xs" />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {statusFilters.map(s => <SelectItem key={s} value={s}>{s === "All" ? "All anomalies" : s}</SelectItem>)}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => { setQuery(""); setStatus("All"); }}>Clear all</Button>
            </div>
          </div>

          {/* Workbook table */}
          <Panel contentClassName="p-0">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary/20">
                    <th className="px-3 py-2.5 text-left">
                      <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" />
                    </th>
                    {["#", "Source / Sheet", "Row", "Description", "Amount", "Category", "Anomaly", "Confidence", "Suggested Fix", "Owner", "Approval state"].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((row, idx) => {
                    const isSelected = selected.includes(row.id);
                    return (
                      <tr key={row.id} data-state={isSelected ? "selected" : undefined} className={cn("transition-colors hover:bg-secondary/30", isSelected && "bg-secondary/50")}>
                        <td className="px-3 py-2.5">
                          <Checkbox checked={isSelected} onCheckedChange={() => toggleRow(row.id)} />
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground tabular">{(page - 1) * rowsPerPage + idx + 1}</td>
                        <td className="px-3 py-2.5 max-w-[120px]"><span className="truncate block text-evidence text-[11px]">{row.source}</span></td>
                        <td className="px-3 py-2.5 tabular text-muted-foreground">{row.row.toLocaleString()}</td>
                        <td className="px-3 py-2.5 font-medium text-foreground max-w-[180px]"><span className="truncate block">{row.description}</span></td>
                        <td className="px-3 py-2.5 tabular font-medium text-foreground">{row.amount > 0 ? `$${row.amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}` : "—"}</td>
                        <td className="px-3 py-2.5 text-muted-foreground">{row.category}</td>
                        <td className="px-3 py-2.5">
                          <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium whitespace-nowrap", anomalyStyle[row.anomaly] || "border-border bg-secondary text-muted-foreground")}>
                            {row.anomaly}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <div className="relative size-6">
                              <svg viewBox="0 0 24 24" className="-rotate-90 size-6">
                                <circle cx="12" cy="12" r="9" fill="none" stroke="var(--muted)" strokeWidth="3" />
                                <circle cx="12" cy="12" r="9" fill="none" stroke={row.confidence > 85 ? "var(--primary)" : row.confidence > 70 ? "var(--warning)" : "var(--critical)"} strokeWidth="3" strokeLinecap="round"
                                  strokeDasharray={56.5} strokeDashoffset={56.5 - (row.confidence / 100) * 56.5} />
                              </svg>
                            </div>
                            <span className="tabular text-[10px] text-muted-foreground">{row.confidence}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 max-w-[160px] text-muted-foreground"><span className="truncate block">{row.suggestedFix}</span></td>
                        <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{row.owner}</td>
                        <td className="px-3 py-2.5">
                          <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-medium", approvalStyle[row.approvalState] || "bg-secondary text-muted-foreground")}>
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
            <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
              <span className="text-xs text-muted-foreground">
                Showing {(page - 1) * rowsPerPage + 1} to {Math.min(page * rowsPerPage, rows.length)} of {totalRows.toLocaleString()} rows
              </span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="size-7" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft className="size-3.5" />
                </Button>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button" onClick={() => setPage(n)} className={cn("flex size-7 items-center justify-center rounded-md text-xs transition-colors", page === n ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-muted-foreground")}>
                    {n}
                  </button>
                ))}
                <span className="text-xs text-muted-foreground">…</span>
                <button type="button" className="flex h-7 items-center justify-center rounded-md px-2 text-xs text-muted-foreground hover:bg-secondary">118,474</button>
                <Button variant="ghost" size="icon" className="size-7" onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="size-3.5" />
                </Button>
                <Select defaultValue="12">
                  <SelectTrigger className="h-7 w-20 text-xs ml-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="12">12 rows</SelectItem>
                      <SelectItem value="25">25 rows</SelectItem>
                      <SelectItem value="50">50 rows</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Panel>

          {/* Data Connectors strip */}
          <Panel title="Data Connectors" contentClassName="p-0" actions={<Button variant="ghost" size="sm">Manage connectors →</Button>}>
            <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-5">
              {excelConnectors.map(c => (
                <div key={c.name} className="flex flex-col gap-2 rounded-lg border border-border bg-secondary/30 p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-md bg-secondary text-xs font-bold text-foreground">{c.icon}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate text-foreground">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground">{c.rows}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">Synced {c.synced}</span>
                    <span className="flex items-center gap-1 text-[10px] font-medium text-primary">
                      <span className="size-1.5 rounded-full bg-primary" />
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {/* System status bar */}
            <div className="flex items-center gap-6 border-t border-border px-4 py-2.5 text-[10px] text-muted-foreground">
              {[{ label: "System status", value: "All systems operational" }, { label: "Data pipeline", value: "Healthy" }, { label: "AI extraction", value: "Healthy" }, { label: "Agent runtime", value: "Healthy" }].map(s => (
                <span key={s.label} className="flex items-center gap-1.5">
                  {s.label}: <span className="flex items-center gap-1 font-medium text-primary"><span className="size-1.5 rounded-full bg-primary" />{s.value}</span>
                </span>
              ))}
              <span className="ml-auto flex items-center gap-1">
                Last updated: 2m ago
                <button type="button" className="ml-1 hover:text-foreground transition-colors"><RefreshCw className="size-3" /></button>
              </span>
            </div>
          </Panel>
        </div>

        {/* Right: AI Analysis Panel + Proof Trail */}
        <div className="flex flex-col gap-5">
          <Panel title="AI Analysis Summary" contentClassName="overflow-y-auto scrollbar-thin max-h-[500px]" actions={<Button variant="ghost" size="sm" onClick={() => onNavigate?.("reports")}>View full report →</Button>}>
            <AiAnalysisPanel onNavigate={onNavigate} />
          </Panel>

          <Panel title="Proof Trail (Latest)" contentClassName="p-0">
            <div className="divide-y divide-border">
              <div className="grid grid-cols-4 px-4 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                <span>Source Row</span>
                <span>Finding</span>
                <span>Action</span>
                <span>Approval</span>
              </div>
              {excelProofTrail.map(pt => (
                <div key={pt.row} className="grid grid-cols-4 items-start gap-1 px-4 py-2.5 hover:bg-secondary/30 transition-colors">
                  <span className="tabular text-xs text-muted-foreground">{pt.row.toLocaleString()}</span>
                  <span className="text-xs text-foreground">{pt.finding}</span>
                  <span className="text-xs text-muted-foreground leading-snug">{pt.action}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-warning">{pt.approval}</span>
                    <button type="button" className="text-[10px] text-evidence hover:underline font-mono ml-auto">{pt.link} →</button>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
