"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  ChevronLeft, ChevronRight, X, ExternalLink, CheckCircle2,
  SlidersHorizontal, Download, ChevronDown,
  BarChart2, Activity, Save, Bot, Zap, Shield, ArrowUpRight,
  TrendingUp, TrendingDown, Clock, Search, ListTodo, PackageOpen, LayoutDashboard, Bookmark, Filter,
  RefreshCw
} from "lucide-react";
import { 
  Panel, Ring, Sparkline, StatusDot, SeverityBadge, ConfBar, EvidenceLink 
} from "../shared";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

// ── Icons for KPIs ────────────────────────────────────────────────────────────────
import { AlertTriangle, AlertCircle, TrendingDown as TrendDownIcon, Check } from "lucide-react";

// Tone helpers
const toneText = {
  primary:  "text-primary",
  critical: "text-critical",
  warning:  "text-warning",
  evidence: "text-evidence",
  neutral:  "text-foreground",
};
const toneStroke = {
  primary:  "var(--primary)",
  critical: "var(--critical)",
  warning:  "var(--warning)",
  evidence: "var(--evidence)",
  neutral:  "var(--muted-foreground)",
};

const topKpis = [
  { label: "TOTAL MONEY AT RISK", value: "$16.44M", trend: "18.6%", trendDir: "up", conf: "High", tone: "critical", icon: Shield, spark: [12,14,13,15,16,14,15,18,17,19] },
  { label: "SAVINGS OPPORTUNITIES", value: "$4.87M", trend: "12.3%", trendDir: "up", conf: "High", tone: "primary", icon: PackageOpen, spark: [5,6,5,7,8,7,9,10,11,12] },
  { label: "HIGH CONFIDENCE RISKS", value: "23", trend: "15%", trendDir: "up", conf: "High", tone: "critical", icon: Search, spark: [10,12,11,14,13,15,18,16,20,23] },
  { label: "RENEWAL EXPOSURE", value: "$7.62M", trend: "7%", trendDir: "down", conf: "Medium", tone: "warning", icon: Clock, spark: [8,9,8,7,6,7,5,4,3,2] },
  { label: "SPEND LEAKAGE EXPOSURE", value: "$3.21M", trend: "15%", trendDir: "up", conf: "High", tone: "critical", icon: AlertCircle, spark: [2,2.5,2.4,2.7,2.8,3.0,2.9,3.1,3.15,3.21] },
  { label: "DUPLICATE PAYMENTS", value: "$1.23M", trend: "23%", trendDir: "up", conf: "High", tone: "primary", icon: LayoutDashboard, spark: [0.5,0.6,0.5,0.7,0.8,1.0,0.9,1.1,1.2,1.23] },
  { label: "OPEN APPROVALS", value: "8", textSub: "3 urgent", conf: "Medium", tone: "warning", icon: ListTodo, spark: [4,5,6,5,4,5,6,7,8,8] },
  { label: "PROOF TRAILS", value: "1,247", trend: "14%", trendDir: "up", conf: "High", tone: "evidence", icon: Search, spark: [900,950,920,1000,1050,1100,1080,1150,1200,1247] },
];

function fileTypeColor(t) {
  if (t === "PDF")  return "bg-critical/15 text-critical";
  if (t === "XLSX") return "bg-primary/15 text-primary";
  if (t === "CSV")  return "bg-primary/15 text-primary";
  return "bg-evidence/15 text-evidence";
}

function ApprovalPill({ state }) {
  const s = {
    "Open": "border-critical/25 bg-critical/10 text-critical",
    "In progress": "border-warning/25 bg-warning/10 text-warning",
    "Review": "border-evidence/25 bg-evidence/10 text-evidence",
    "Monitoring": "border-primary/25 bg-primary/10 text-primary",
  }[state] || "border-[#1E2730] bg-[#141B21] text-muted-foreground";
  return <span className={cn("inline-flex rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap", s)}>{state}</span>;
}

const baseOpportunities = [
  { id: 1, title: "Microsoft renewal above benchmark", sub: "EA renewal is 18-22% above benchmark", category: "Renewal Risk", severity: "High", conf: 92, impact: "$2.45M", evidence: "Microsoft_EA_Renewal_Quote.pdf", evidenceDate: "May 23, 2026", pt: "PT-1247", action: "Renegotiate terms\nTarget 15-20% reduction", owner: "Sarah K.\nProcurement", status: "Open" },
  { id: 2, title: "Unused SaaS licenses", sub: "298 seats unused for > 60 days", category: "Spend Leakage", severity: "High", conf: 89, impact: "$1.15M", evidence: "SaaS_Usage_May_2026.xlsx", evidenceDate: "May 24, 2026", pt: "PT-1245", action: "Reclaim or reassign\nEnd of month cleanup", owner: "Sarah K.\nProcurement", status: "In progress" },
  { id: 3, title: "Duplicate vendor payments", sub: "32 duplicates across AP & cards", category: "Data Quality", severity: "High", conf: 91, impact: "$280K", evidence: "AP_Invoices_May.xlsx", evidenceDate: "May 24, 2026", pt: "PT-1233", action: "Void duplicates\nRecover overpayments", owner: "Review", status: "Review" },
  { id: 4, title: "Payment terms drift", sub: "Net 30 vs Net 15 in 27% of invoices", category: "Financial Risk", severity: "Medium", conf: 76, impact: "$820K", evidence: "AP_Terms_Drift_May.csv", evidenceDate: "May 24, 2026", pt: "PT-1243", action: "Standardize terms\nNet 30 to Net 15", owner: "Open", status: "Open" },
  { id: 5, title: "Contract auto-renews", sub: "12 contracts auto-renewing soon", category: "Renewal Risk", severity: "Medium", conf: 85, impact: "$612K", evidence: "Contracts_Master.xlsx", evidenceDate: "May 21, 2026", pt: "PT-1241", action: "Add opt-out notice\nCalendar reminders", owner: "Open", status: "Open" },
  { id: 6, title: "Inventory overstock", sub: "Excess inventory across 4 SKUs", category: "Inventory", severity: "Medium", conf: 73, impact: "$438K", evidence: "Inventory_Aging_May.xlsx", evidenceDate: "May 24, 2026", pt: "PT-1231", action: "Adjust purchase plan\nReduce overstock", owner: "Review", status: "Review" },
  { id: 7, title: "Forecast variance increase", sub: "Q4 variance exceeds 10%", category: "Forecasting", severity: "Low", conf: 64, impact: "-$430K", evidence: "Forecast_Variance_Q4.xlsx", evidenceDate: "May 24, 2026", pt: "PT-1222", action: "Re-forecast Q4\nUpdate assumptions", owner: "Monitoring", status: "Monitoring" },
  { id: 8, title: "Marketing ad spend leakage", sub: "Low performing campaigns", category: "Spend Leakage", severity: "Low", conf: 61, impact: "$196K", evidence: "Google_Ads_Q4_Campaigns.xlsx", evidenceDate: "May 24, 2026", pt: "PT-1227", action: "Pause & reallocate\nFocus on ROAS > 3", owner: "Open", status: "Open" },
];

const mockOpportunities = Array.from({ length: 47 }).map((_, i) => ({
  ...baseOpportunities[i % baseOpportunities.length],
  id: i + 1,
  title: `${baseOpportunities[i % baseOpportunities.length].title}${i > 7 ? ` (#${i+1})` : ''}`
}));

const mockTimeline = [
  { id: "t1", date: "May 22, 10:15 AM", title: "Microsoft renewal above benchmark",   subtitle: "$2.45M opportunity",   tone: "critical" },
  { id: "t2", date: "May 23, 9:41 AM",  title: "Unused SaaS licenses detected",        subtitle: "$1.15M opportunity",   tone: "primary" },
  { id: "t3", date: "May 23, 11:02 AM", title: "Duplicate payments found",             subtitle: "$280K opportunity",    tone: "warning" },
  { id: "t4", date: "May 24, 8:37 AM",  title: "Payment terms drift increasing",       subtitle: "$820K opportunity",    tone: "warning" },
  { id: "t5", date: "May 24, 10:06 AM", title: "Inventory overstock identified",       subtitle: "$438K opportunity",    tone: "primary" },
  { id: "t6", date: "May 24, 1:14 PM",  title: "Forecast variance Q4 increased",       subtitle: "-$430K risk",          tone: "evidence" },
  { id: "t7", date: "May 24, 3:22 PM",  title: "Marketing spend leakage detected",     subtitle: "$196K opportunity",    tone: "critical" },
];

export default function SavingsRadar({ onNavigate }) {
  const [selectedIds, setSelectedIds] = useState([1]); // Default to first row selected for checkbox
  const [selectedRow, setSelectedRow] = useState(mockOpportunities[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [agentRunning, setAgentRunning] = useState(false);

  const totalPages = Math.ceil(mockOpportunities.length / rowsPerPage);
  const paginatedData = mockOpportunities.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // --- Derived detail-panel values from selectedRow ---
  const narrativeMap = {
    'Renewal Risk': `${selectedRow?.title} has been flagged based on ${selectedRow?.evidence}. Renewal pricing is above benchmark for comparable scope. Negotiation window is open.`,
    'Spend Leakage': `${selectedRow?.title} detected across ${selectedRow?.conf}% confidence analysis. ${selectedRow?.sub}. Immediate reclaim action recommended.`,
    'Data Quality': `${selectedRow?.title} identified via cross-reference analysis. ${selectedRow?.sub}. Recovery action required to prevent further exposure.`,
    'Financial Risk': `${selectedRow?.title} flagged from payment terms analysis. ${selectedRow?.sub}. Finance alignment needed.`,
    'Inventory': `${selectedRow?.title} detected from inventory aging report. ${selectedRow?.sub}. Purchase plan adjustment recommended.`,
    'Forecasting': `${selectedRow?.title} identified from Q4 variance analysis. ${selectedRow?.sub}. Forecast update required before board review.`,
  };
  const narrative = narrativeMap[selectedRow?.category] || `${selectedRow?.title}. ${selectedRow?.sub}. Review recommended.`;

  const breakdownMap = {
    'Renewal Risk':   [{ label: 'Price uplift', pct: 68 }, { label: 'Licensing mix', pct: 21 }, { label: 'Payment terms', pct: 11 }],
    'Spend Leakage':  [{ label: 'Maverick spend', pct: 45 }, { label: 'Pricing drift', pct: 35 }, { label: 'Off-contract', pct: 20 }],
    'Data Quality':   [{ label: 'Duplicate records', pct: 55 }, { label: 'Overpayments', pct: 30 }, { label: 'Admin cost', pct: 15 }],
    'Financial Risk': [{ label: 'Cash flow delta', pct: 60 }, { label: 'Working capital', pct: 25 }, { label: 'Credit terms', pct: 15 }],
    'Inventory':      [{ label: 'Overstock value', pct: 65 }, { label: 'Carrying cost', pct: 25 }, { label: 'Obsolescence', pct: 10 }],
    'Forecasting':    [{ label: 'Revenue variance', pct: 70 }, { label: 'Cost variance', pct: 20 }, { label: 'Timing risk', pct: 10 }],
  };
  const breakdown = breakdownMap[selectedRow?.category] || [{ label: 'Primary risk', pct: 70 }, { label: 'Secondary', pct: 20 }, { label: 'Other', pct: 10 }];

  const agentMap = {
    'Renewal Risk':   'Contract Analyst',
    'Spend Leakage':  'Spend Auditor',
    'Data Quality':   'Excel Analyst',
    'Financial Risk': 'Finance Watcher',
    'Inventory':      'Spend Auditor',
    'Forecasting':    'Finance Watcher',
  };
  const recommendedAgent = agentMap[selectedRow?.category] || 'AI Analyst';

  const evidenceExt = selectedRow?.evidence?.split('.').pop()?.toUpperCase() ?? 'FILE';
  const evidenceBadgeClass = fileTypeColor(evidenceExt);

  const factsMap = {
    'Renewal Risk':   [`Renewal quote: above benchmark`, `Benchmark delta: 18-22%`, `Payment terms: Annual upfront`],
    'Spend Leakage':  [`Unused seats: detected`, `${selectedRow?.sub}`, `Action: reclaim or reassign`],
    'Data Quality':   [`${selectedRow?.sub}`, `Recovery action: required`, `Source: ${selectedRow?.evidence}`],
    'Financial Risk': [`${selectedRow?.sub}`, `Source: ${selectedRow?.evidence}`, `Finance alignment needed`],
    'Inventory':      [`${selectedRow?.sub}`, `Source: ${selectedRow?.evidence}`, `Purchase plan adjustment required`],
    'Forecasting':    [`${selectedRow?.sub}`, `Source: ${selectedRow?.evidence}`, `Board review impacted`],
  };
  const facts = factsMap[selectedRow?.category] || [`${selectedRow?.title}`, `${selectedRow?.sub}`, `Confidence: ${selectedRow?.conf}%`];

  const statusColors = {
    'Open':        'border-critical/30 bg-critical/10 text-critical hover:bg-critical/20',
    'In progress': 'border-warning/30 bg-warning/10 text-warning hover:bg-warning/20',
    'Review':      'border-evidence/30 bg-evidence/10 text-evidence hover:bg-evidence/20',
    'Monitoring':  'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20',
  };
  const statusCls = statusColors[selectedRow?.status] ?? 'border-[#1E2730] bg-[#141B21] text-muted-foreground hover:bg-[#1E2730]';

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      
      {/* KPI Strip */}
      <div className="flex flex-wrap gap-4 overflow-x-auto scrollbar-none pb-2 -mb-2">
        {topKpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className="group relative flex min-w-[180px] flex-1 animate-fade-up flex-col gap-3 overflow-hidden rounded-xl border border-[#1E2730] bg-[#0A0C0B] p-4 transition-all hover:bg-[#141B21]"
            style={{ animationDelay: `${i * 35}ms` }}
          >
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-full border border-[#1E2730] bg-[#141B21]">
                <kpi.icon className={cn("size-3.5", toneText[kpi.tone])} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground line-clamp-1">{kpi.label}</span>
            </div>
            
            <div className="mt-1 flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-xl font-bold tabular-nums leading-none text-white">{kpi.value}</span>
                {kpi.trend ? (
                  <span className={cn("mt-1.5 flex items-center gap-1 text-[10px] font-bold", toneText[kpi.tone])}>
                    {kpi.trendDir === "up" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                    {kpi.trend} <span className="text-muted-foreground ml-0.5 font-normal">vs last 7 days</span>
                  </span>
                ) : kpi.textSub ? (
                  <span className={cn("mt-1.5 flex items-center gap-1 text-[10px] font-bold text-critical")}>
                    {kpi.textSub}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="mt-1 flex items-center justify-between z-10">
              <span className={cn("text-[9px] font-bold uppercase tracking-widest", kpi.conf === "High" ? "text-primary" : "text-warning")}>
                Confidence: {kpi.conf}
              </span>
            </div>

            {/* Sparkline in background/bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-10 opacity-30 pointer-events-none group-hover:opacity-60 transition-opacity">
              <Sparkline data={kpi.spark} stroke={toneStroke[kpi.tone]} className="h-full w-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6 h-[760px]">
        
        {/* Left Column */}
        <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">
          
          {/* Main Table Panel */}
          <div className="flex flex-col border border-[#1E2730] bg-[#0A0C0B] rounded-xl overflow-hidden flex-1">
            {/* Header & Actions */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E2730]">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-white">Evidence-backed opportunities</span>
                <AlertCircle className="size-3.5 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toast.success("View saved")} className="flex items-center gap-1.5 rounded border border-[#1E2730] bg-[#141B21] px-3 py-1.5 text-[10px] text-white hover:bg-[#1E2730] transition-colors">
                  <Bookmark className="size-3" /> Save view <ChevronDown className="size-3" />
                </button>
                <button onClick={() => toast.success("Exporting...")} className="flex items-center gap-1.5 rounded border border-[#1E2730] bg-transparent px-3 py-1.5 text-[10px] text-white hover:bg-[#141B21] transition-colors">
                  Export <ChevronDown className="size-3" />
                </button>
                <button onClick={() => toast.info("Column settings")} className="flex size-7 items-center justify-center rounded border border-[#1E2730] bg-transparent text-muted-foreground hover:bg-[#141B21] transition-colors">
                  <SlidersHorizontal className="size-3" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-[#1E2730]">
              {["All Categories", "All Severity", "All Confidence", "All Owners", "All Approval States", "All Source Types"].map(f => (
                <DropdownMenu key={f}>
                  <DropdownMenuTrigger className="flex items-center gap-1.5 rounded border border-[#1E2730] bg-transparent px-2.5 py-1 text-[10px] text-muted-foreground hover:bg-[#141B21] transition-colors">
                      {f} <ChevronDown className="size-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-40 border-[#1E2730] bg-[#0A0C0B] text-muted-foreground">
                    <DropdownMenuItem onClick={() => toast.success(`${f} selected`)} className="text-[11px] focus:bg-[#1E2730] focus:text-white">Option 1</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.success(`${f} selected`)} className="text-[11px] focus:bg-[#1E2730] focus:text-white">Option 2</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.success(`${f} selected`)} className="text-[11px] focus:bg-[#1E2730] focus:text-white">Option 3</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}
              <div className="w-px h-4 bg-[#1E2730] mx-1" />
              <button onClick={() => toast.info("Opening filters...")} className="flex items-center gap-1.5 rounded border border-[#1E2730] bg-transparent px-2.5 py-1 text-[10px] text-white hover:bg-[#141B21] transition-colors">
                <Filter className="size-3 text-muted-foreground" /> Filters
              </button>
              <button onClick={() => toast.success("Filters cleared")} className="text-[10px] text-primary hover:underline ml-1 font-medium">Clear all</button>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="border-b border-[#1E2730] bg-[#0A0C0B] sticky top-0 z-10">
                    <th className="py-2.5 text-left font-semibold uppercase tracking-widest text-muted-foreground w-12 px-4">
                      <div className="flex items-center gap-3">
                        <Checkbox checked={selectedIds.length > 0} onCheckedChange={() => setSelectedIds([])} />
                        #
                      </div>
                    </th>
                    <th className="py-2.5 text-left font-semibold uppercase tracking-widest text-muted-foreground">Opportunity / Risk</th>
                    <th className="py-2.5 text-left font-semibold uppercase tracking-widest text-muted-foreground w-24">Category</th>
                    <th className="py-2.5 text-left font-semibold uppercase tracking-widest text-muted-foreground w-20">Severity</th>
                    <th className="py-2.5 text-left font-semibold uppercase tracking-widest text-muted-foreground w-20 text-center">Confidence</th>
                    <th className="py-2.5 text-left font-semibold uppercase tracking-widest text-muted-foreground w-20">Est. Impact</th>
                    <th className="py-2.5 text-left font-semibold uppercase tracking-widest text-muted-foreground w-40">Source Evidence</th>
                    <th className="py-2.5 text-left font-semibold uppercase tracking-widest text-muted-foreground w-24">Proof Trail</th>
                    <th className="py-2.5 text-left font-semibold uppercase tracking-widest text-muted-foreground">Recommended Agent Action</th>
                    <th className="py-2.5 text-left font-semibold uppercase tracking-widest text-muted-foreground w-24 pr-4">Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedRow(row)}
                      className={cn(
                        "cursor-pointer border-b border-[#1E2730]/50 transition-colors hover:bg-white/[0.02]",
                        selectedRow?.id === row.id && "bg-white/[0.05] border-l-2 border-l-primary border-r-0 border-y-[#1E2730]"
                      )}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                          <Checkbox checked={selectedIds.includes(row.id)} onCheckedChange={() => toggleSelect(row.id)} />
                          <span className="font-semibold text-muted-foreground">{row.id}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-2">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] font-semibold text-white whitespace-nowrap">{row.title}</span>
                          <span className="text-[9px] text-muted-foreground line-clamp-1">{row.sub}</span>
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground whitespace-nowrap">{row.category}</td>
                      <td className="py-3">
                        <span className={cn("rounded border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest", 
                          row.severity === "High" ? "bg-critical/10 text-critical border-critical/20" :
                          row.severity === "Medium" ? "bg-warning/10 text-warning border-warning/20" :
                          "bg-primary/10 text-primary border-primary/20"
                        )}>
                          {row.severity}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex justify-center">
                          <div className="relative flex size-7 items-center justify-center">
                            <svg viewBox="0 0 36 36" className="absolute inset-0 size-full -rotate-90">
                              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={row.conf >= 90 ? "var(--primary)" : row.conf >= 70 ? "var(--warning)" : "var(--critical)"} strokeWidth="4" strokeDasharray={`${row.conf}, 100`} />
                            </svg>
                            <span className="text-[9px] font-bold leading-none text-white tabular-nums">{row.conf}%</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-[11px] font-bold tabular-nums text-white">{row.impact}</td>
                      <td className="py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-muted-foreground hover:text-white truncate max-w-[140px] transition-colors">{row.evidence}</span>
                          <span className="text-[8px] text-muted-foreground">{row.evidenceDate}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <EvidenceLink onClick={(e) => { e.stopPropagation(); toast.info(`Opening ${row.pt}`); }}>
                          {row.pt}
                        </EvidenceLink>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-white line-clamp-1">{row.action.split('\n')[0]}</span>
                          <span className="text-muted-foreground line-clamp-1">{row.action.split('\n')[1]}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        {row.owner.includes('\n') ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-white">{row.owner.split('\n')[0]}</span>
                            <span className="text-muted-foreground">{row.owner.split('\n')[1]}</span>
                          </div>
                        ) : (
                          <ApprovalPill state={row.owner} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex items-center justify-between border-t border-[#1E2730] px-5 py-3 text-[10px] text-muted-foreground shrink-0 bg-[#0A0C0B]">
              <span>Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, mockOpportunities.length)} of {mockOpportunities.length} opportunities</span>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="flex size-6 items-center justify-center rounded hover:bg-[#1E2730] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="size-3" /></button>
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
                  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="flex size-6 items-center justify-center rounded hover:bg-[#1E2730] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronRight className="size-3" /></button>
                </div>
                <div className="flex items-center gap-3">
                  <span>Rows per page:</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1 font-medium text-white bg-[#141B21] border border-[#1E2730] rounded px-2 py-1 transition-colors hover:bg-[#1E2730]">
                        {rowsPerPage} <ChevronDown className="size-3 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-16 min-w-0 border-[#1E2730] bg-[#0A0C0B] text-muted-foreground">
                      <DropdownMenuItem onClick={() => { setRowsPerPage(10); setCurrentPage(1); }} className="text-[11px] focus:bg-[#1E2730] focus:text-white">10</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setRowsPerPage(25); setCurrentPage(1); }} className="text-[11px] focus:bg-[#1E2730] focus:text-white">25</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setRowsPerPage(50); setCurrentPage(1); }} className="text-[11px] focus:bg-[#1E2730] focus:text-white">50</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Panel */}
          <div className="flex flex-col border border-[#1E2730] bg-[#0A0C0B] rounded-xl p-5 shrink-0">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-white">Newly detected opportunities this week</span>
                <AlertCircle className="size-3.5 text-muted-foreground" />
              </div>
              <button onClick={() => toast.info("Opening full timeline")} className="text-[10px] text-primary hover:underline font-medium flex items-center gap-1">
                View all timeline <ChevronRight className="size-3" />
              </button>
            </div>
            
            <div className="relative flex items-start justify-between">
              {/* Horizontal line */}
              <div className="absolute left-4 right-4 top-[11px] h-px bg-[#1E2730]" />
              
              {mockTimeline.map((item, i) => (
                <div key={item.id} className="relative flex flex-col items-center flex-1 z-10 px-1 group">
                  <div className={cn(
                    "flex size-6 items-center justify-center rounded-full border-2 border-[#0A0C0B] mb-3 transition-transform group-hover:scale-110",
                    item.tone === "critical" ? "bg-critical" :
                    item.tone === "warning" ? "bg-warning" :
                    item.tone === "primary" ? "bg-primary" : "bg-evidence"
                  )}>
                    {item.tone === "critical" ? <Shield className="size-3 text-[#0A0C0B]" /> :
                     item.tone === "warning" ? <AlertTriangle className="size-3 text-[#0A0C0B]" /> :
                     item.tone === "primary" ? <PackageOpen className="size-3 text-[#0A0C0B]" /> :
                     <Activity className="size-3 text-[#0A0C0B]" />}
                  </div>
                  
                  {/* Connecting vertical line (mocking the UI where text drops down) */}
                  <div className="absolute top-6 bottom-0 w-px bg-[#1E2730]/50" />
                  
                  <div className="text-center flex flex-col gap-1 items-center mt-2 max-w-[100px]">
                    <span className="text-[9px] font-semibold text-white line-clamp-2 leading-tight">{item.title}</span>
                    <span className="text-[9px] text-muted-foreground line-clamp-1">{item.subtitle}</span>
                    <span className="text-[8px] text-muted-foreground mt-1">{item.date}</span>
                  </div>
                </div>
              ))}
              <div className="relative flex items-center justify-center size-6 rounded-full bg-[#141B21] border border-[#1E2730] mt-0 cursor-pointer hover:bg-[#1E2730] transition-colors z-10">
                <ChevronRight className="size-3 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Detail Panel */}
        <div className="col-span-12 xl:col-span-4 h-full">
          {selectedRow ? (
            <div className="flex flex-col h-full rounded-xl border border-[#1E2730] bg-[#0A0C0B] overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#1E2730] px-5 py-4 shrink-0">
                <div className="flex flex-col gap-1.5 min-w-0 pr-2">
                  <h3 className="text-sm font-semibold text-white truncate">{selectedRow.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest", 
                      selectedRow.severity === "High" ? "bg-critical/10 text-critical border border-critical/20" :
                      selectedRow.severity === "Medium" ? "bg-warning/10 text-warning border border-warning/20" :
                      "bg-primary/10 text-primary border border-primary/20"
                    )}>
                      {selectedRow.severity}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger className={cn("flex items-center gap-1.5 rounded border px-2.5 py-1 text-[10px] font-bold transition-colors uppercase tracking-widest", statusCls)}>
                        {selectedRow.status} <ChevronDown className="size-3" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32 border-[#1E2730] bg-[#0A0C0B] text-muted-foreground">
                      <DropdownMenuItem onClick={() => setSelectedRow({...selectedRow, status: "In progress"})} className="text-[11px] focus:bg-[#1E2730] focus:text-white">In progress</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedRow({...selectedRow, status: "Review"})} className="text-[11px] focus:bg-[#1E2730] focus:text-white">Review</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedRow({...selectedRow, status: "Closed"})} className="text-[11px] focus:bg-[#1E2730] focus:text-white">Closed</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <button onClick={() => setSelectedRow(null)} className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-[#1E2730] hover:text-white transition-colors">
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-6 border-b border-[#1E2730] px-5 text-[10px] font-semibold shrink-0">
                <button onClick={() => toast.info("Viewing Overview")} className="border-b-2 border-white py-3 text-white">Overview</button>
                <button onClick={() => toast.info("Viewing Evidence")} className="border-b-2 border-transparent py-3 text-muted-foreground hover:text-white transition-colors">Evidence (6)</button>
                <button onClick={() => toast.info("Viewing Impact")} className="border-b-2 border-transparent py-3 text-muted-foreground hover:text-white transition-colors">Impact</button>
                <button onClick={() => toast.info("Viewing Timeline")} className="border-b-2 border-transparent py-3 text-muted-foreground hover:text-white transition-colors">Timeline</button>
                <button onClick={() => toast.info("Viewing Activity")} className="border-b-2 border-transparent py-3 text-muted-foreground hover:text-white transition-colors">Activity</button>
                <button onClick={() => toast.info("Viewing Related items")} className="border-b-2 border-transparent py-3 text-muted-foreground hover:text-white transition-colors">Related (4)</button>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-thin p-5 flex flex-col gap-6">
                
                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-1 flex flex-col gap-1">
                    <span className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">Est. Impact</span>
                    <span className="text-lg font-bold tabular-nums text-white mt-0.5">{selectedRow.impact}</span>
                    <span className="text-[9px] text-muted-foreground leading-tight whitespace-nowrap">Annual opportunity</span>
                  </div>
                  <div className="col-span-1 flex flex-col gap-1 items-center border-l border-[#1E2730]">
                    <span className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">Confidence</span>
                    <div className="relative flex size-10 items-center justify-center mt-1">
                      <svg viewBox="0 0 36 36" className="absolute inset-0 size-full -rotate-90">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--primary)" strokeWidth="3" strokeDasharray={`${selectedRow.conf}, 100`} />
                      </svg>
                      <span className="text-[11px] font-bold leading-none text-white tabular-nums">{selectedRow.conf}%</span>
                    </div>
                    <span className="text-[9px] font-bold text-primary mt-1">{selectedRow.conf >= 90 ? "High" : "Medium"}</span>
                  </div>
                  <div className="col-span-1 flex flex-col gap-1 pl-4 border-l border-[#1E2730]">
                    <span className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">Category</span>
                    <span className="text-[11px] font-bold text-white mt-1">{selectedRow.category}</span>
                  </div>
                  <div className="col-span-1 flex flex-col gap-1 pl-4 border-l border-[#1E2730]">
                    <span className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">Owner</span>
                    <span className="text-[11px] font-bold text-white mt-1 whitespace-nowrap">{selectedRow.owner.split('\n')[0]}</span>
                    <span className="text-[9px] text-muted-foreground whitespace-nowrap">{selectedRow.owner.split('\n')[1]}</span>
                    <div className="flex flex-col mt-2">
                      <span className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">Due Date</span>
                      <span className="text-[10px] font-medium text-white whitespace-nowrap">May 30, 2026</span>
                      <span className="text-[9px] text-critical">(4 days)</span>
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-[#1E2730]" />

                {/* Risk Narrative & Impact Breakdown */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-semibold text-white">Risk narrative</span>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      {narrative}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-white">Impact breakdown</span>
                      <span className="text-[10px] text-muted-foreground">Total: {selectedRow.impact}</span>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {breakdown.map((b, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-[9px] text-muted-foreground w-20 truncate">{b.label}</span>
                          <div className="flex-1 h-1.5 bg-[#1E2730] rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${b.pct}%` }} />
                          </div>
                          <span className="text-[9px] text-muted-foreground w-16 text-right whitespace-nowrap">{b.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Impact Horizontal Chart Scale (mocked) */}
                <div className="grid grid-cols-2 gap-6 -mt-3">
                  <div />
                  <div className="flex items-center justify-between text-[8px] text-muted-foreground pl-24">
                    <span>$0</span>
                    <span>$1M</span>
                    <span>$2M</span>
                    <span>$3M</span>
                  </div>
                </div>

                <div className="w-full h-px bg-[#1E2730]" />

                {/* Supporting evidence */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-white">Supporting evidence (3)</span>
                    <button onClick={() => toast.info("Opening all evidence files")} className="text-[10px] text-primary hover:underline">View all</button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1 flex items-start gap-2 border border-[#1E2730] rounded-lg p-2.5 bg-[#141B21]/50 cursor-pointer hover:bg-[#1E2730]/50 transition-colors">
                      <div className={cn("flex size-6 shrink-0 items-center justify-center rounded text-[7px] font-bold", evidenceBadgeClass)}>{evidenceExt}</div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] text-white truncate">{selectedRow.evidence}</span>
                        <span className="text-[8px] text-muted-foreground mt-0.5">{selectedRow.evidenceDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Extracted Facts & Agent Action */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Extracted facts */}
                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-semibold text-white">Extracted facts</span>
                    <div className="flex flex-col gap-2">
                      {facts.map((fact, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                          <span className="text-[10px] text-muted-foreground">{fact}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => toast.info("Opening all facts checklist")} className="text-left text-[10px] text-primary hover:underline mt-1 w-fit">View all facts (18) →</button>
                  </div>

                  {/* Recommended agent action */}
                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-semibold text-white">Recommended agent action</span>
                    
                    <div className="flex flex-col border border-primary/20 bg-primary/5 rounded-lg p-3 relative overflow-hidden">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2.5">
                          <div className="flex size-6 items-center justify-center rounded-full bg-primary/20 text-primary">
                            <Bot className="size-3.5" />
                          </div>
                          <div className="flex flex-col gap-0.5">
                             <span className="text-[11px] font-bold text-white">{recommendedAgent}</span>
                             <span className="text-[10px] text-muted-foreground">{selectedRow.action?.split('\n')[0]}</span>
                             <span className="text-[10px] text-muted-foreground">{selectedRow.action?.split('\n')[1]}</span>
                           </div>
                        </div>
                        <button
                           type="button"
                           onClick={() => { setAgentRunning(true); setTimeout(() => { setAgentRunning(false); toast.success(`${recommendedAgent} completed analysis`); }, 2500); }}
                           disabled={agentRunning}
                           className="flex items-center gap-1.5 rounded border border-primary/30 bg-transparent px-3 py-1.5 text-[10px] font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-60">
                           {agentRunning ? <><RefreshCw className="size-3 animate-spin" /> Running...</> : 'Run agent'}
                        </button>
                      </div>

                      <div className="mt-4 flex flex-col gap-2">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Next actions</span>
                        <div className="flex items-start gap-2">
                          <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          <span className="text-[10px] text-muted-foreground">Prepare negotiation brief</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          <span className="text-[10px] text-muted-foreground">Identify low-utilization SKUs</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          <span className="text-[10px] text-muted-foreground">Model savings scenarios</span>
                        </div>
                      </div>

                      <button onClick={() => toast.info("Opening detailed action plan")} className="text-left text-[10px] text-primary hover:underline mt-3 w-fit flex items-center gap-1">
                        View action plan <ArrowUpRight className="size-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="flex items-center justify-between border-t border-[#1E2730] px-5 py-3 shrink-0 bg-[#0A0C0B]">
                <button onClick={() => toast.info("Opening proof trail")} className="text-[11px] font-medium text-white hover:underline">
                  View proof trail
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={() => toast.success("Approval created")} className="rounded bg-primary/20 border border-primary/30 px-4 py-1.5 text-[10px] font-bold text-primary transition-colors hover:bg-primary/30">
                    Create approval
                  </button>
                  <button onClick={() => toast.info("Opening chat")} className="flex items-center gap-1.5 rounded border border-[#1E2730] bg-[#141B21] px-3 py-1.5 text-[10px] text-white hover:bg-[#1E2730] transition-colors">
                    <Zap className="size-3" /> Ask AI
                  </button>
                  <button onClick={() => toast.success("Exporting data")} className="flex items-center gap-1.5 rounded border border-[#1E2730] bg-transparent px-3 py-1.5 text-[10px] text-white hover:bg-[#141B21] transition-colors">
                    <Download className="size-3" /> Export
                  </button>
                  <button onClick={() => toast.info("More options")} className="flex size-7 items-center justify-center rounded border border-[#1E2730] text-muted-foreground hover:bg-[#1E2730] hover:text-white transition-colors">
                    <span className="mb-2 tracking-widest text-[16px] leading-none">...</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-xl border border-[#1E2730] border-dashed bg-[#0A0C0B]/50 p-8 text-center">
              <PackageOpen className="mb-3 size-8 text-muted-foreground/30" />
              <span className="text-sm font-semibold text-white">Select an opportunity</span>
              <span className="mt-1 max-w-[200px] text-[11px] text-muted-foreground">Click on any savings opportunity to view its detailed analysis.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
