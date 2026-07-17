"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useWorkspace } from "@/components/genius/workspace-context";

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
  }[state] || "border-[#28313C] bg-[#141A22] text-muted-foreground";
  return <span className={cn("inline-flex rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap", s)}>{state}</span>;
}



function formatImpact(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount === 0) return "$0";
  const sign = amount < 0 ? "-" : "";
  const absolute = Math.abs(amount);
  if (absolute >= 1_000_000) return `${sign}$${(absolute / 1_000_000).toFixed(2)}M`;
  if (absolute >= 1_000) return `${sign}$${Math.round(absolute / 1_000)}K`;
  return `${sign}$${absolute.toLocaleString()}`;
}

function formatEvidenceDate(value) {
  if (!value) return "Workspace evidence";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Workspace evidence";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function normalizeSeverity(value) {
  if (value === "Critical" || value === "High") return "High";
  if (value === "Watch" || value === "Low") return "Low";
  return "Medium";
}

function uiStatusFromAction(status) {
  if (status === "Ready" || status === "Edited" || status === "Delegated") return "In progress";
  if (status === "Approved" || status === "Done") return "Monitoring";
  if (status === "Rejected" || status === "Snoozed") return "Open";
  return "Review";
}

export default function SavingsRadar({ onNavigate, focusContext }) {
  const { findings, actions, runAgents, updateAction, exportEvidence } = useWorkspace();
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [agentRunning, setAgentRunning] = useState(false);
  const [localStatuses, setLocalStatuses] = useState({});
  const [filters, setFilters] = useState({
    category: "all",
    severity: "all",
    confidence: "all",
    owner: "all",
    status: "all",
    sourceType: "all",
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [savedViewCount, setSavedViewCount] = useState(0);
  const [activeDetailTab, setActiveDetailTab] = useState("overview");

  const workspaceOpportunities = useMemo(() => {
    const actionsByFinding = new Map((actions || []).map((action) => [action.findingId, action]));
    return (findings || []).map((finding) => {
      const action = actionsByFinding.get(finding.id);
      const actionText = action?.description || finding.recommendedAction || "Review evidence and prepare an approval-safe action.";
      const [primaryAction, secondaryAction = "Human approval required"] = String(actionText).split(/\n|\. /);
      return {
        id: finding.id,
        actionId: action?.id || null,
        evidenceId: finding.evidenceId || action?.evidenceId || null,
        title: finding.title,
        sub: finding.evidence || finding.recommendedAction || "Evidence-backed workspace finding",
        category: finding.category || "Workspace",
        severity: normalizeSeverity(finding.severity),
        conf: finding.confidence || action?.confidence || 0,
        impact: formatImpact(finding.impact),
        evidence: finding.source || action?.evidenceName || "Workspace evidence",
        evidenceDate: formatEvidenceDate(finding.updatedAt || finding.createdAt),
        pt: action?.proofTrailId || `trail:${String(finding.id).slice(0, 8)}`,
        action: `${primaryAction}\n${secondaryAction}`,
        owner: action?.owner || finding.owner || "Founder approval",
        status: localStatuses[finding.id] || uiStatusFromAction(action?.status),
      };
    });
  }, [actions, findings, localStatuses]);

  const opportunities = workspaceOpportunities;
  const filterOptions = useMemo(() => {
    const unique = (items) => [...new Set(items.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
    const sourceType = (row) => row.evidence?.split(".").pop()?.toUpperCase() || "FILE";

    return {
      category: unique(opportunities.map((row) => row.category)),
      severity: unique(opportunities.map((row) => row.severity)),
      confidence: ["High confidence", "Medium confidence", "Low confidence"],
      owner: unique(opportunities.map((row) => row.owner.split("\n")[0])),
      status: unique(opportunities.map((row) => row.status)),
      sourceType: unique(opportunities.map(sourceType)),
    };
  }, [opportunities]);

  const activeFilterCount = Object.values(filters).filter((value) => value !== "all").length;

  const filteredOpportunities = useMemo(() => {
    const confidenceBucket = (row) => {
      if (row.conf >= 90) return "High confidence";
      if (row.conf >= 70) return "Medium confidence";
      return "Low confidence";
    };
    const sourceType = (row) => row.evidence?.split(".").pop()?.toUpperCase() || "FILE";

    return opportunities.filter((row) => {
      if (filters.category !== "all" && row.category !== filters.category) return false;
      if (filters.severity !== "all" && row.severity !== filters.severity) return false;
      if (filters.confidence !== "all" && confidenceBucket(row) !== filters.confidence) return false;
      if (filters.owner !== "all" && row.owner.split("\n")[0] !== filters.owner) return false;
      if (filters.status !== "all" && row.status !== filters.status) return false;
      if (filters.sourceType !== "all" && sourceType(row) !== filters.sourceType) return false;
      return true;
    });
  }, [filters, opportunities]);

  const selectedRow = selectedRowId === null
    ? filteredOpportunities[0] || opportunities[0] || null
    : filteredOpportunities.find((row) => row.id === selectedRowId)
      || opportunities.find((row) => row.id === selectedRowId)
      || filteredOpportunities[0]
      || opportunities[0]
      || null;

  const setFilter = (id, value) => {
    setFilters((current) => ({ ...current, [id]: value }));
    setCurrentPage(1);
    if (value !== "all") setFiltersOpen(true);
  };

  const clearFilters = () => {
    setFilters({
      category: "all",
      severity: "all",
      confidence: "all",
      owner: "all",
      status: "all",
      sourceType: "all",
    });
    setCurrentPage(1);
  };

  const filterControls = [
    { id: "category", label: "All Categories", options: filterOptions.category },
    { id: "severity", label: "All Severity", options: filterOptions.severity },
    { id: "confidence", label: "All Confidence", options: filterOptions.confidence },
    { id: "owner", label: "All Owners", options: filterOptions.owner },
    { id: "status", label: "All Approval States", options: filterOptions.status },
    { id: "sourceType", label: "All Source Types", options: filterOptions.sourceType },
  ];

  useEffect(() => {
    if (!focusContext?.findingId && !focusContext?.actionId && !focusContext?.evidenceId) return undefined;

    const timer = window.setTimeout(() => {
      const row = opportunities.find((candidate) =>
        candidate.id === focusContext.findingId
        || candidate.actionId === focusContext.actionId
        || candidate.evidenceId === focusContext.evidenceId
      );

      if (!row) {
        toast.info("Linked finding is not available in this workspace yet.");
        return;
      }

      setSelectedRowId(row.id);
      setSelectedIds((current) => current.includes(row.id) ? current : [row.id, ...current]);
      toast.success(`Focused finding: ${row.title}`);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [focusContext?.actionId, focusContext?.evidenceId, focusContext?.findingId, focusContext?.token, opportunities]);
  const totalPages = Math.max(1, Math.ceil(filteredOpportunities.length / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedData = filteredOpportunities.slice((safeCurrentPage - 1) * rowsPerPage, safeCurrentPage * rowsPerPage);

  const pageIds = paginatedData.map((row) => row.id);
  const allPageRowsSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

  const togglePageSelection = () => {
    if (allPageRowsSelected) {
      setSelectedIds((current) => current.filter((id) => !pageIds.includes(id)));
      return;
    }

    setSelectedIds((current) => [...new Set([...current, ...pageIds])]);
  };

  // --- Derived detail-panel values from selectedRow ---
  const narrativeMap = {
    'Renewal Risk': `${selectedRow?.title} has been flagged based on ${selectedRow?.evidence}. Renewal pricing is above benchmark for comparable scope. Negotiation window is open.`,
    'Spend Leakage': `${selectedRow?.title} detected across ${selectedRow?.conf}% confidence analysis. ${selectedRow?.sub}. Immediate reclaim action recommended.`,
    'Data Quality': `${selectedRow?.title} identified via cross-reference analysis. ${selectedRow?.sub}. Recovery action required to prevent further exposure.`,
    'Financial Risk': `${selectedRow?.title} flagged from payment terms analysis. ${selectedRow?.sub}. Finance alignment needed.`,
    'Inventory': `${selectedRow?.title} detected from inventory aging report. ${selectedRow?.sub}. Purchase plan adjustment recommended.`,
    'Forecasting': `${selectedRow?.title} identified from Q4 variance analysis. ${selectedRow?.sub}. Forecast update required before board review.`,
  };

  const detailNarrative = narrativeMap[selectedRow?.category]
    || `${selectedRow?.title} has been flagged for review based on ${selectedRow?.evidence}. Action is required.`;

  const timelineItems = useMemo(() => {
    return [...(findings || [])]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 7)
      .map(f => ({
        id: f.id,
        date: formatEvidenceDate(f.createdAt),
        title: f.title,
        subtitle: `${formatImpact(f.impact)} opportunity`,
        tone: f.severity === "Critical" ? "critical" : f.severity === "High" ? "primary" : f.severity === "Medium" ? "warning" : "evidence"
      }));
  }, [findings]);

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
  const detailTabs = [
    { id: "overview", label: "Overview" },
    { id: "evidence", label: `Evidence (${selectedRow?.evidenceId ? 1 : 0})` },
    { id: "impact", label: "Impact" },
    { id: "timeline", label: "Timeline" },
    { id: "activity", label: "Activity" },
    { id: "related", label: `Related (${selectedRow?.actionId ? 1 : 0})` },
  ];

  const statusColors = {
    'Open':        'border-critical/30 bg-critical/10 text-critical hover:bg-critical/20',
    'In progress': 'border-warning/30 bg-warning/10 text-warning hover:bg-warning/20',
    'Review':      'border-evidence/30 bg-evidence/10 text-evidence hover:bg-evidence/20',
    'Monitoring':  'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20',
  };
  const statusCls = statusColors[selectedRow?.status] ?? 'border-[#28313C] bg-[#141A22] text-muted-foreground hover:bg-[#28313C]';

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const updateSelectedStatus = async (apiStatus, uiStatus) => {
    if (!selectedRow) return;

    try {
      if (selectedRow.actionId) {
        await updateAction(selectedRow.actionId, apiStatus, `Savings Radar marked this action as ${uiStatus}.`);
      } else {
        setLocalStatuses((prev) => ({ ...prev, [selectedRow.id]: uiStatus }));
      }
      toast.success(`Status updated to ${uiStatus}`);
      return true;
    } catch (error) {
      toast.error(error.message || "Status update failed.");
      return false;
    }
  };

  const handleRunAgent = async () => {
    setAgentRunning(true);
    try {
      await runAgents();
      toast.success(`${recommendedAgent} refreshed findings and approval-safe actions.`);
    } catch (error) {
      toast.error(error.message || "Agent refresh failed.");
    } finally {
      setAgentRunning(false);
    }
  };

  const handleCreateApproval = async () => {
    if (!selectedRow) return;
    const updated = await updateSelectedStatus("Ready", "In progress");
    if (updated) {
      onNavigate?.("approvals", {
        actionId: selectedRow.actionId,
        findingId: selectedRow.id,
        evidenceId: selectedRow.evidenceId,
        proofTrailId: selectedRow.pt,
        source: "savings",
      });
    }
  };

  const handleExport = () => {
    if (exportEvidence("csv", "all")) {
      toast.success("Evidence export started");
    }
  };

  const openProofTrailFor = (row) => {
    if (!row) return;

    if (row.actionId) {
      toast.success(`Opening approval-safe action for ${row.pt}.`);
      onNavigate?.("approvals", {
        actionId: row.actionId,
        findingId: row.id,
        evidenceId: row.evidenceId,
        proofTrailId: row.pt,
        source: "savings",
      });
      return;
    }

    if (row.evidenceId) {
      toast.success(`Opening source evidence for ${row.pt}.`);
      onNavigate?.("data", {
        evidenceId: row.evidenceId,
        findingId: row.id,
        proofTrailId: row.pt,
        source: "savings",
      });
      return;
    }

    toast.info(`Opening report proof coverage for ${row.pt || "selected finding"}.`);
    onNavigate?.("reports", {
      findingId: row.id,
      proofTrailId: row.pt,
      source: "savings",
    });
  };

  const handleOpenProofTrail = () => openProofTrailFor(selectedRow);

  return (
    <div className="flex flex-col gap-6 p-6">

      {/* KPI Strip */}
      <div className="flex flex-wrap gap-4 overflow-x-auto scrollbar-none pb-2 -mb-2">
        {topKpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className="group relative flex min-w-[180px] flex-1 animate-fade-up flex-col gap-3 overflow-hidden rounded-xl border border-[#28313C] bg-[#0E1116] p-4 transition-all hover:bg-[#141A22]"
            style={{ animationDelay: `${i * 35}ms` }}
          >
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-full border border-[#28313C] bg-[#141A22]">
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
          <div className="flex flex-col border border-[#28313C] bg-[#0E1116] rounded-xl overflow-hidden flex-1">
            {/* Header & Actions */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#28313C]">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-white">Evidence-backed opportunities</span>
                <AlertCircle className="size-3.5 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSavedViewCount((count) => count + 1);
                    toast.success(`Saved view with ${activeFilterCount} active filters`);
                  }}
                  className="flex items-center gap-1.5 rounded border border-[#28313C] bg-[#141A22] px-3 py-1.5 text-[10px] text-white hover:bg-[#28313C] transition-colors"
                >
                  <Bookmark className="size-3" /> Save view {savedViewCount > 0 ? `(${savedViewCount})` : ""} <ChevronDown className="size-3" />
                </button>
                <button onClick={handleExport} className="flex items-center gap-1.5 rounded border border-[#28313C] bg-transparent px-3 py-1.5 text-[10px] text-white hover:bg-[#141A22] transition-colors">
                  Export <ChevronDown className="size-3" />
                </button>
                <button
                  type="button"
                  aria-pressed={showColumnSettings}
                  onClick={() => setShowColumnSettings((open) => !open)}
                  className={cn(
                    "flex size-7 items-center justify-center rounded border border-[#28313C] bg-transparent text-muted-foreground hover:bg-[#141A22] transition-colors",
                    showColumnSettings && "border-primary/40 bg-primary/10 text-primary"
                  )}
                >
                  <SlidersHorizontal className="size-3" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-[#28313C]">
              {filterControls.map((control) => (
                <DropdownMenu key={control.id}>
                  <DropdownMenuTrigger className="flex items-center gap-1.5 rounded border border-[#28313C] bg-transparent px-2.5 py-1 text-[10px] text-muted-foreground hover:bg-[#141A22] transition-colors">
                      {filters[control.id] === "all" ? control.label : filters[control.id]} <ChevronDown className="size-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-40 border-[#28313C] bg-[#0E1116] text-muted-foreground">
                    <DropdownMenuItem onClick={() => setFilter(control.id, "all")} className="text-[11px] focus:bg-[#28313C] focus:text-white">{control.label}</DropdownMenuItem>
                    {control.options.map((option) => (
                      <DropdownMenuItem key={option} onClick={() => setFilter(control.id, option)} className="text-[11px] focus:bg-[#28313C] focus:text-white">{option}</DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}
              <div className="w-px h-4 bg-[#28313C] mx-1" />
              <button
                type="button"
                aria-pressed={filtersOpen}
                onClick={() => setFiltersOpen((open) => !open)}
                className={cn(
                  "flex items-center gap-1.5 rounded border border-[#28313C] bg-transparent px-2.5 py-1 text-[10px] text-white hover:bg-[#141A22] transition-colors",
                  filtersOpen && "border-primary/40 bg-primary/10 text-primary"
                )}
              >
                <Filter className="size-3 text-muted-foreground" /> Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
              </button>
              <button type="button" onClick={clearFilters} disabled={activeFilterCount === 0} className="text-[10px] text-primary hover:underline ml-1 font-medium disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed">Clear all</button>
            </div>

            {(filtersOpen || showColumnSettings) ? (
              <div className="flex flex-wrap items-center gap-2 border-b border-[#28313C] bg-[#080A09] px-5 py-3 text-[10px] text-muted-foreground">
                {filtersOpen ? (
                  <>
                    <span className="font-semibold text-white">Filtered result:</span>
                    <span>{filteredOpportunities.length} of {opportunities.length} opportunities</span>
                    {filterControls.filter((control) => filters[control.id] !== "all").map((control) => (
                      <button
                        key={control.id}
                        type="button"
                        onClick={() => setFilter(control.id, "all")}
                        className="rounded border border-[#28313C] bg-[#141A22] px-2 py-1 text-white hover:bg-[#28313C]"
                      >
                        {filters[control.id]} <X className="ml-1 inline size-2.5" />
                      </button>
                    ))}
                  </>
                ) : null}
                {showColumnSettings ? (
                  <>
                    <span className="font-semibold text-white">Visible columns:</span>
                    {["Opportunity", "Category", "Severity", "Confidence", "Impact", "Evidence", "Proof", "Action", "Owner"].map((column) => (
                      <span key={column} className="rounded border border-primary/20 bg-primary/5 px-2 py-1 text-primary">{column}</span>
                    ))}
                  </>
                ) : null}
              </div>
            ) : null}

            {/* Table */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="border-b border-[#28313C] bg-[#0E1116] sticky top-0 z-10">
                    <th className="py-2.5 text-left font-semibold uppercase tracking-widest text-muted-foreground w-12 px-4">
                      <div className="flex items-center gap-3">
                        <Checkbox checked={allPageRowsSelected} onCheckedChange={togglePageSelection} />
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
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-5 py-12 text-center text-[11px] text-muted-foreground">
                        No opportunities match the active filters.
                      </td>
                    </tr>
                  ) : null}
                  {paginatedData.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedRowId(row.id)}
                      className={cn(
                        "cursor-pointer border-b border-[#28313C]/50 transition-colors hover:bg-white/[0.02]",
                        selectedRow?.id === row.id && "bg-white/[0.05] border-l-2 border-l-primary border-r-0 border-y-[#28313C]"
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
                        <EvidenceLink onClick={(e) => { e.stopPropagation(); setSelectedRowId(row.id); openProofTrailFor(row); }}>
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

            <div className="flex items-center justify-between border-t border-[#28313C] px-5 py-3 text-[10px] text-muted-foreground shrink-0 bg-[#0E1116]">
              <span>
                Showing {filteredOpportunities.length ? (safeCurrentPage - 1) * rowsPerPage + 1 : 0} to {Math.min(safeCurrentPage * rowsPerPage, filteredOpportunities.length)} of {filteredOpportunities.length} opportunities
              </span>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={safeCurrentPage === 1} className="flex size-6 items-center justify-center rounded hover:bg-[#28313C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="size-3" /></button>
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const page = idx + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={cn("flex size-6 items-center justify-center rounded transition-colors hover:bg-[#28313C] hover:text-white", safeCurrentPage === page ? "border border-[#28313C] bg-[#141A22] text-white" : "")}
                      >
                        {page}
                      </button>
                    )
                  })}
                  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={safeCurrentPage === totalPages} className="flex size-6 items-center justify-center rounded hover:bg-[#28313C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronRight className="size-3" /></button>
                </div>
                <div className="flex items-center gap-3">
                  <span>Rows per page:</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1 font-medium text-white bg-[#141A22] border border-[#28313C] rounded px-2 py-1 transition-colors hover:bg-[#28313C]">
                        {rowsPerPage} <ChevronDown className="size-3 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-16 min-w-0 border-[#28313C] bg-[#0E1116] text-muted-foreground">
                      <DropdownMenuItem onClick={() => { setRowsPerPage(10); setCurrentPage(1); }} className="text-[11px] focus:bg-[#28313C] focus:text-white">10</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setRowsPerPage(25); setCurrentPage(1); }} className="text-[11px] focus:bg-[#28313C] focus:text-white">25</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setRowsPerPage(50); setCurrentPage(1); }} className="text-[11px] focus:bg-[#28313C] focus:text-white">50</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Panel */}
          <div className="flex flex-col border border-[#28313C] bg-[#0E1116] rounded-xl p-5 shrink-0">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-white">Newly detected opportunities this week</span>
                <AlertCircle className="size-3.5 text-muted-foreground" />
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveDetailTab("timeline");
                  if (!selectedRow && filteredOpportunities[0]) setSelectedRowId(filteredOpportunities[0].id);
                }}
                className="text-[10px] text-primary hover:underline font-medium flex items-center gap-1"
              >
                View all timeline <ChevronRight className="size-3" />
              </button>
            </div>

            <div className="relative flex items-start justify-between">
              {/* Horizontal line */}
              <div className="absolute left-4 right-4 top-[11px] h-px bg-[#28313C]" />

              {timelineItems.map((item, i) => (
                <div key={item.id} className="relative flex flex-col items-center flex-1 z-10 px-1 group">
                  <div className={cn(
                    "flex size-6 items-center justify-center rounded-full border-2 border-[#0E1116] mb-3 transition-transform group-hover:scale-110",
                    item.tone === "critical" ? "bg-critical" :
                    item.tone === "warning" ? "bg-warning" :
                    item.tone === "primary" ? "bg-primary" : "bg-evidence"
                  )}>
                    {item.tone === "critical" ? <Shield className="size-3 text-[#0E1116]" /> :
                     item.tone === "warning" ? <AlertTriangle className="size-3 text-[#0E1116]" /> :
                     item.tone === "primary" ? <PackageOpen className="size-3 text-[#0E1116]" /> :
                     <Activity className="size-3 text-[#0E1116]" />}
                  </div>

                  {/* Connecting vertical line (mocking the UI where text drops down) */}
                  <div className="absolute top-6 bottom-0 w-px bg-[#28313C]/50" />

                  <div className="text-center flex flex-col gap-1 items-center mt-2 max-w-[100px]">
                    <span className="text-[9px] font-semibold text-white line-clamp-2 leading-tight">{item.title}</span>
                    <span className="text-[9px] text-muted-foreground line-clamp-1">{item.subtitle}</span>
                    <span className="text-[8px] text-muted-foreground mt-1">{item.date}</span>
                  </div>
                </div>
              ))}
              <div className="relative flex items-center justify-center size-6 rounded-full bg-[#141A22] border border-[#28313C] mt-0 cursor-pointer hover:bg-[#28313C] transition-colors z-10">
                <ChevronRight className="size-3 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Detail Panel */}
        <div className="col-span-12 xl:col-span-4 h-full">
          {selectedRow ? (
            <div className="flex flex-col h-full rounded-xl border border-[#28313C] bg-[#0E1116] overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#28313C] px-5 py-4 shrink-0">
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
                    <DropdownMenuContent align="end" className="w-32 border-[#28313C] bg-[#0E1116] text-muted-foreground">
                      <DropdownMenuItem onClick={() => updateSelectedStatus("Ready", "In progress")} className="text-[11px] focus:bg-[#28313C] focus:text-white">In progress</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateSelectedStatus("Needs review", "Review")} className="text-[11px] focus:bg-[#28313C] focus:text-white">Review</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateSelectedStatus("Done", "Monitoring")} className="text-[11px] focus:bg-[#28313C] focus:text-white">Closed</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <button onClick={() => setSelectedRowId(null)} className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-[#28313C] hover:text-white transition-colors">
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-6 border-b border-[#28313C] px-5 text-[10px] font-semibold shrink-0">
                {detailTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveDetailTab(tab.id)}
                    className={cn(
                      "border-b-2 py-3 transition-colors",
                      activeDetailTab === tab.id
                        ? "border-white text-white"
                        : "border-transparent text-muted-foreground hover:text-white"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-thin p-5 flex flex-col gap-6">
                {activeDetailTab !== "overview" ? (
                  <div className="rounded-lg border border-[#28313C] bg-[#141A22]/40 p-3 text-[10px] text-muted-foreground">
                    {activeDetailTab === "evidence" ? (
                      <div className="flex items-center justify-between gap-3">
                        <span className="truncate">Primary source: <span className="text-white">{selectedRow.evidence}</span></span>
                        <button
                          type="button"
                          onClick={() => onNavigate?.("data", {
                            evidenceId: selectedRow.evidenceId,
                            findingId: selectedRow.id,
                            proofTrailId: selectedRow.pt,
                            source: "savings",
                          })}
                          className="shrink-0 text-primary hover:underline"
                        >
                          Open in Data Intake
                        </button>
                      </div>
                    ) : null}
                    {activeDetailTab === "impact" ? (
                      <div className="grid grid-cols-3 gap-3">
                        {breakdown.map((item) => (
                          <div key={item.label} className="rounded border border-[#28313C] bg-[#0E1116] p-2">
                            <div className="text-white">{item.label}</div>
                            <div className="mt-1 text-primary">{item.pct}% of impact</div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {activeDetailTab === "timeline" ? (
                      <div className="grid gap-2">
                        {timelineItems.slice(0, 4).map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedRowId(item.id)}
                            className="flex items-center justify-between rounded border border-[#28313C] bg-[#0E1116] px-3 py-2 text-left hover:bg-[#28313C]"
                          >
                            <span className="truncate text-white">{item.title}</span>
                            <span className="shrink-0 text-muted-foreground">{item.date}</span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                    {activeDetailTab === "activity" ? (
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between rounded border border-[#28313C] bg-[#0E1116] px-3 py-2">
                          <span>Status</span>
                          <span className="text-white">{selectedRow.status}</span>
                        </div>
                        <div className="flex items-center justify-between rounded border border-[#28313C] bg-[#0E1116] px-3 py-2">
                          <span>Owner</span>
                          <span className="text-white">{selectedRow.owner.split("\n")[0]}</span>
                        </div>
                      </div>
                    ) : null}
                    {activeDetailTab === "related" ? (
                      <div className="flex items-center justify-between gap-3">
                        <span className="truncate">Related approval-safe action: <span className="text-white">{selectedRow.action.split("\n")[0]}</span></span>
                        <button
                          type="button"
                          onClick={() => onNavigate?.("approvals", {
                            actionId: selectedRow.actionId,
                            findingId: selectedRow.id,
                            evidenceId: selectedRow.evidenceId,
                            proofTrailId: selectedRow.pt,
                            source: "savings",
                          })}
                          className="shrink-0 text-primary hover:underline"
                        >
                          Open approval
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-1 flex flex-col gap-1">
                    <span className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">Est. Impact</span>
                    <span className="text-lg font-bold tabular-nums text-white mt-0.5">{selectedRow.impact}</span>
                    <span className="text-[9px] text-muted-foreground leading-tight whitespace-nowrap">Annual opportunity</span>
                  </div>
                  <div className="col-span-1 flex flex-col gap-1 items-center border-l border-[#28313C]">
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
                  <div className="col-span-1 flex flex-col gap-1 pl-4 border-l border-[#28313C]">
                    <span className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">Category</span>
                    <span className="text-[11px] font-bold text-white mt-1">{selectedRow.category}</span>
                  </div>
                  <div className="col-span-1 flex flex-col gap-1 pl-4 border-l border-[#28313C]">
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

                <div className="w-full h-px bg-[#28313C]" />

                {/* Risk Narrative & Impact Breakdown */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-semibold text-white">Risk narrative</span>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      {detailNarrative}
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
                          <div className="flex-1 h-1.5 bg-[#28313C] rounded-full overflow-hidden">
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

                <div className="w-full h-px bg-[#28313C]" />

                {/* Supporting evidence */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-white">Supporting evidence (3)</span>
                    <button
                      type="button"
                      onClick={() => onNavigate?.("data", {
                        evidenceId: selectedRow.evidenceId,
                        findingId: selectedRow.id,
                        proofTrailId: selectedRow.pt,
                        source: "savings",
                      })}
                      className="text-[10px] text-primary hover:underline"
                    >
                      View all
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1 flex items-start gap-2 border border-[#28313C] rounded-lg p-2.5 bg-[#141A22]/50 cursor-pointer hover:bg-[#28313C]/50 transition-colors">
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
                    <button
                      onClick={() => onNavigate?.("data", {
                        evidenceId: selectedRow.evidenceId,
                        findingId: selectedRow.id,
                        proofTrailId: selectedRow.pt,
                        source: "savings",
                      })}
                      className="text-left text-[10px] text-primary hover:underline mt-1 w-fit"
                    >
                      View all facts (18) →
                    </button>
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
                           onClick={handleRunAgent}
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

                      <button
                        onClick={() => onNavigate?.("approvals", {
                          actionId: selectedRow.actionId,
                          findingId: selectedRow.id,
                          evidenceId: selectedRow.evidenceId,
                          proofTrailId: selectedRow.pt,
                          source: "savings",
                        })}
                        className="text-left text-[10px] text-primary hover:underline mt-3 w-fit flex items-center gap-1"
                      >
                        View action plan <ArrowUpRight className="size-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="flex items-center justify-between border-t border-[#28313C] px-5 py-3 shrink-0 bg-[#0E1116]">
                <button onClick={handleOpenProofTrail} className="text-[11px] font-medium text-white hover:underline">
                  View proof trail
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={handleCreateApproval} className="rounded bg-primary/20 border border-primary/30 px-4 py-1.5 text-[10px] font-bold text-primary transition-colors hover:bg-primary/30">
                    Create approval
                  </button>
                  <button onClick={() => onNavigate?.("chat")} className="flex items-center gap-1.5 rounded border border-[#28313C] bg-[#141A22] px-3 py-1.5 text-[10px] text-white hover:bg-[#28313C] transition-colors">
                    <Zap className="size-3" /> Ask AI
                  </button>
                  <button onClick={handleExport} className="flex items-center gap-1.5 rounded border border-[#28313C] bg-transparent px-3 py-1.5 text-[10px] text-white hover:bg-[#141A22] transition-colors">
                    <Download className="size-3" /> Export
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex size-7 items-center justify-center rounded border border-[#28313C] text-muted-foreground hover:bg-[#28313C] hover:text-white transition-colors">
                      <span className="mb-2 tracking-widest text-[16px] leading-none">...</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 border-[#28313C] bg-[#0E1116] text-muted-foreground">
                      <DropdownMenuItem onClick={handleOpenProofTrail} className="text-[11px] focus:bg-[#28313C] focus:text-white">Open proof trail</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateSelectedStatus("Needs review", "Review")} className="text-[11px] focus:bg-[#28313C] focus:text-white">Mark for review</DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onNavigate?.("data", {
                          evidenceId: selectedRow.evidenceId,
                          findingId: selectedRow.id,
                          proofTrailId: selectedRow.pt,
                          source: "savings",
                        })}
                        className="text-[11px] focus:bg-[#28313C] focus:text-white"
                      >
                        Open source evidence
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-xl border border-[#28313C] border-dashed bg-[#0E1116]/50 p-8 text-center">
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
