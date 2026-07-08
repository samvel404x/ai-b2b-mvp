"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Upload, Download, Sparkles, AlertCircle, AlertTriangle, ArrowDownRight, ArrowUpRight, Check, ChevronDown, CheckCircle2, FileSpreadsheet, Lock, MoreHorizontal, Settings2, SlidersHorizontal, ArrowRight,
  Maximize2, PlusSquare, Search, Copy, FolderInput,
  MinusSquare, ArrowUp, ArrowDown, ExternalLink,
  ChevronLeft, ChevronRight, X, LayoutGrid, FileText, Database, Activity, Terminal, Filter, RefreshCw
} from "lucide-react";
import {
  excelWorkbookRows, excelAiFindings, excelProofTrail, excelConnectors, excelKpis, excelSpendByCategory, excelForecastTrend
} from "@/lib/genius-data";
import { EvidenceLink, Panel, ConfBar, Ring, Sparkline } from "../shared";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function ApprovalPill({ state }) {
  const s = {
    "Pending": "text-warning",
    "Review": "text-[#3b82f6]",
    "Not started": "text-muted-foreground",
    "Approved": "text-primary",
  }[state] || "text-muted-foreground";
  return <span className={cn("rounded border border-current/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap", s)}>{state}</span>;
}

function AnomalyPill({ type }) {
  const isRed = ["Duplicate", "At risk", "Policy breach"].includes(type);
  const isYellow = ["High spend", "Price variance", "Low stock", "Missing owner", "Formula issue", "Forecast var."].includes(type);
  const isBlue = ["Uncoded", "Inactive vendor"].includes(type);
  
  const c = isRed ? "border-critical/30 bg-critical/10 text-critical"
          : isYellow ? "border-warning/30 bg-warning/10 text-warning"
          : isBlue ? "border-[#3b82f6]/30 bg-[#3b82f6]/10 text-[#3b82f6]"
          : "border-[#1E2730] bg-[#141B21] text-muted-foreground";
          
  return (
    <span className={cn("flex items-center gap-1.5 rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap w-fit", c)}>
      {isRed && <AlertCircle className="size-2.5" />}
      {isYellow && <AlertTriangle className="size-2.5" />}
      {isBlue && <CheckCircle2 className="size-2.5" />}
      {type}
    </span>
  );
}

function KpiCard({ kpi, index }) {
  const trendUp = kpi.trendDir === "up";
  const trendDown = kpi.trendDir === "down";

  return (
    <div
      className="group relative flex flex-col gap-2 overflow-hidden rounded-xl border border-[#1E2730] bg-[#0A0C0B] p-3 transition-all hover:bg-[#141B21] min-w-[170px] flex-1 animate-fade-up"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-center gap-2">
        <Ring value={kpi.ring} size={36} stroke={`var(--${kpi.tone})`} />
        <div className="flex flex-col gap-0 min-w-0">
          <span className="truncate text-[9px] font-semibold uppercase tracking-widest text-muted-foreground leading-snug">
            {kpi.label}
          </span>
          <span className="text-lg font-bold tabular-nums leading-tight text-white">
            {kpi.value}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-1 mt-1">
        <span
          className={cn(
            "flex items-center gap-0.5 text-[9px] font-semibold tabular-nums",
            trendUp ? "text-primary" : trendDown ? "text-critical" : "text-muted-foreground"
          )}
        >
          {trendUp && <ArrowUpRight className="size-3" />}
          {trendDown && <ArrowDownRight className="size-3" />}
          {kpi.trend}
        </span>
      </div>
      <div className="absolute right-3 bottom-3 opacity-30 group-hover:opacity-100 transition-opacity">
         <Sparkline data={kpi.spark} stroke={`var(--${kpi.tone})`} className="h-6 w-16 opacity-50" />
      </div>
    </div>
  );
}

export default function ExcelWorkspace({ onNavigate }) {
  const [selected, setSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    anomaly: "All anomalies",
    category: "All categories",
    owner: "All owners",
    approvalState: "All approval states"
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  const [tabs, setTabs] = useState([
    { id: "1", label: "Workbook view" },
    { id: "2", label: "Sheet overview" },
    { id: "3", label: "Anomalies" },
    { id: "4", label: "Trends" },
    { id: "5", label: "Modeling" },
    { id: "6", label: "What-if" }
  ]);
  const [activeTabId, setActiveTabId] = useState("1");
  const [editingTabId, setEditingTabId] = useState(null);
  const [editingTabText, setEditingTabText] = useState("");

  const handleAddTab = () => {
    const newId = Date.now().toString();
    setTabs([...tabs, { id: newId, label: "New Sheet" }]);
    setActiveTabId(newId);
  };
  
  const handleRemoveTab = (e, id) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) setActiveTabId(newTabs[0].id);
  };
  
  const saveTabEdit = () => {
    if (editingTabText.trim()) {
      setTabs(tabs.map(t => t.id === editingTabId ? { ...t, label: editingTabText } : t));
    }
    setEditingTabId(null);
  };

  // Unique filter options from mock data
  const anomalies = ["All anomalies", ...new Set(excelWorkbookRows.map(r => r.anomaly))];
  const categories = ["All categories", ...new Set(excelWorkbookRows.map(r => r.category))];
  const owners = ["All owners", ...new Set(excelWorkbookRows.map(r => r.owner))];
  const approvalStates = ["All approval states", ...new Set(excelWorkbookRows.map(r => r.approvalState))];

  // Filtering logic
  const filteredRows = excelWorkbookRows.filter(r => {
    const matchesSearch = searchQuery === "" || 
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.owner.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesAnomaly = filters.anomaly === "All anomalies" || r.anomaly === filters.anomaly;
    const matchesCategory = filters.category === "All categories" || r.category === filters.category;
    const matchesOwner = filters.owner === "All owners" || r.owner === filters.owner;
    const matchesApproval = filters.approvalState === "All approval states" || r.approvalState === filters.approvalState;
    
    return matchesSearch && matchesAnomaly && matchesCategory && matchesOwner && matchesApproval;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
  // Ensure current page is valid after filtering
  if (currentPage > totalPages) {
    setCurrentPage(totalPages);
  }
  const paginatedRows = filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const toggleAll = () => {
    setSelected(selected.length === paginatedRows.length ? [] : paginatedRows.map(r => r.id));
  };
  
  const toggleRow = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setFilters({
      anomaly: "All anomalies",
      category: "All categories",
      owner: "All owners",
      approvalState: "All approval states"
    });
    setCurrentPage(1);
    toast.info("All filters cleared");
  };

  // UI rendering helpers
  const renderFilterDropdown = (options, currentVal, filterKey) => (
    <DropdownMenu>
      <DropdownMenuTrigger className="text-[10px] text-muted-foreground hover:text-white flex items-center gap-1 transition-colors capitalize">
        {currentVal} <ChevronDown className="size-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40 border-[#1E2730] bg-[#0A0C0B] text-muted-foreground">
        {options.map(opt => (
          <DropdownMenuItem 
            key={opt}
            onClick={() => {
              setFilters(prev => ({ ...prev, [filterKey]: opt }));
              setCurrentPage(1);
            }}
            className={cn("text-[11px] focus:bg-[#1E2730] focus:text-white flex justify-between items-center", currentVal === opt && "text-white font-medium bg-white/[0.02]")}
          >
            {opt}
            {currentVal === opt && <Check className="size-3 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto scrollbar-thin p-6 pb-2">
      {/* Header */}
      <header className="flex items-start justify-between shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-white">Excel Workspace</h1>
          <p className="text-[11px] text-muted-foreground">Spreadsheet intelligence. Detect issues, quantify impact, and take approval-safe actions.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full border border-[#1E2730] bg-[#0A0C0B] px-3 py-1.5">
             <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center"><Sparkles className="size-2.5 text-primary" /></div>
             <div className="flex flex-col gap-0 leading-none">
               <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Provider</span>
               <span className="text-[10px] font-semibold text-white">Gemini 1.5 Pro</span>
             </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#1E2730] bg-[#0A0C0B] px-3 py-1.5">
             <div className="size-4 rounded-full bg-[#21A366]/20 flex items-center justify-center"><Database className="size-2.5 text-[#21A366]" /></div>
             <div className="flex flex-col gap-0 leading-none">
               <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Database</span>
               <span className="text-[10px] font-semibold text-white">Supabase</span>
             </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#1E2730] bg-[#0A0C0B] px-3 py-1.5">
             <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center"><CheckCircle2 className="size-2.5 text-primary" /></div>
             <div className="flex flex-col gap-0 leading-none">
               <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Connector health</span>
               <span className="text-[10px] font-semibold text-white">98%</span>
             </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#1E2730] bg-[#0A0C0B] px-3 py-1.5">
             <div className="size-4 rounded-full bg-[#1E2730] flex items-center justify-center"><Activity className="size-2.5 text-muted-foreground" /></div>
             <div className="flex flex-col gap-0 leading-none">
               <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Data quality</span>
               <span className="text-[10px] font-semibold text-white flex items-center gap-1">2m ago <RefreshCw className="size-2.5" /></span>
             </div>
          </div>
        </div>
      </header>

      {/* KPI Strip */}
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-thin pb-2 shrink-0">
        {excelKpis.map((kpi, i) => (
          <KpiCard key={kpi.id} kpi={kpi} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-6 flex-1 min-h-[800px]">
        {/* Left Panel: Spreadsheet Data */}
        <div className="flex flex-col rounded-xl border border-[#1E2730] bg-[#0A0C0B] overflow-hidden">
          
          {/* Top Tabs */}
          <div className="flex items-center gap-2 px-5 pt-4 border-b border-[#1E2730] shrink-0 overflow-x-auto scrollbar-none">
            {tabs.map((t) => {
              const isActive = activeTabId === t.id;
              const isEditing = editingTabId === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => !isEditing && setActiveTabId(t.id)}
                  onDoubleClick={() => {
                    setEditingTabId(t.id);
                    setEditingTabText(t.label);
                  }}
                  className={cn(
                    "group flex items-center gap-2 text-[11px] font-semibold transition-colors relative pb-3 -mb-3 cursor-pointer px-3",
                    isActive ? "text-white" : "text-muted-foreground hover:text-white"
                  )}
                >
                  {isEditing ? (
                    <input 
                      autoFocus
                      className="bg-transparent text-white outline-none w-20 border-b border-primary/50"
                      value={editingTabText}
                      onChange={e => setEditingTabText(e.target.value)}
                      onBlur={saveTabEdit}
                      onKeyDown={e => e.key === 'Enter' && saveTabEdit()}
                    />
                  ) : (
                    <span>{t.label}</span>
                  )}
                  {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t-full" />}
                  {!isEditing && tabs.length > 1 && (
                    <button 
                      onClick={(e) => handleRemoveTab(e, t.id)}
                      className={cn("opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-white/10 rounded", isActive && "opacity-50")}
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>
              );
            })}
            <button onClick={handleAddTab} className="p-1 mb-3 ml-2 text-muted-foreground hover:text-white transition-colors hover:bg-white/5 rounded">
              <PlusSquare className="size-3.5" />
            </button>
          </div>

          {/* Secondary Toolbar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#1E2730] shrink-0 bg-[#0A0C0B]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 text-[11px] font-medium text-white border border-[#1E2730] bg-[#141B21] px-2 py-1 rounded">
                <FileSpreadsheet className="size-3.5 text-[#21A366]" /> Spend_Analysis_May_2026.xlsx <ChevronDown className="size-3 text-muted-foreground" />
              </span>
              <span className="flex items-center gap-2 text-[11px] font-medium text-white border border-[#1E2730] bg-[#141B21] px-2 py-1 rounded">
                <LayoutGrid className="size-3 text-muted-foreground" /> Sheet1 - Transactions <ChevronDown className="size-3 text-muted-foreground" />
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-primary ml-2">
                <span className="size-1.5 bg-primary rounded-full animate-pulse" /> Live
              </span>
              <span className="text-[10px] text-muted-foreground ml-2 font-medium">
                {/* Dynamically adjust the "rows" string for realism vs reality */}
                {filteredRows.length === excelWorkbookRows.length ? "1.42M rows" : `${filteredRows.length} rows`}
              </span>
              <span className="text-[10px] text-muted-foreground ml-2 font-medium">Last analyzed: 10:41 AM</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => toast.info("Opening column visibility settings")} className="flex items-center gap-1.5 text-[10px] font-medium text-white hover:text-primary transition-colors">
                <Lock className="size-3 text-muted-foreground" /> Columns
              </button>
              <button onClick={() => toast.info("Opening advanced filters")} className="flex items-center gap-1.5 text-[10px] font-medium text-white hover:text-primary transition-colors">
                <Filter className="size-3 text-muted-foreground" /> Filters 
                {Object.values(filters).some(v => !v.startsWith("All ")) && (
                  <span className="bg-[#1E2730] text-white rounded px-1.5 py-0.5 ml-0.5">
                    {Object.values(filters).filter(v => !v.startsWith("All ")).length} <ChevronDown className="size-2.5 inline" />
                  </span>
                )}
              </button>
              <button onClick={() => toast.info("Exporting view data")} className="flex items-center gap-1.5 text-[10px] font-medium text-white hover:text-primary transition-colors">
                <Download className="size-3 text-muted-foreground" /> Export <ChevronDown className="size-3" />
              </button>
              <Button size="sm" className="h-7 ml-2 bg-evidence text-[#03110A] hover:bg-evidence/90 text-[10px] font-bold tracking-wide" disabled={selected.length === 0} onClick={() => toast.success("Analyzing selected rows...")}>
                <Sparkles className="size-3 mr-1 text-[#03110A]" /> Analyze
              </Button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-[#1E2730] shrink-0 bg-[#050706]">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1.5 size-3.5 text-muted-foreground" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="Search in data..." 
                  className="w-full bg-transparent border border-[#1E2730] rounded px-8 py-1 text-[10px] text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              
              {renderFilterDropdown(anomalies, filters.anomaly, "anomaly")}
              {renderFilterDropdown(categories, filters.category, "category")}
              {renderFilterDropdown(owners, filters.owner, "owner")}
              {renderFilterDropdown(approvalStates, filters.approvalState, "approvalState")}
            </div>
            
            <button 
              onClick={clearAllFilters}
              className="text-[10px] text-muted-foreground hover:text-white transition-colors"
            >
              Clear all
            </button>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-[10px] whitespace-nowrap">
              <thead className="sticky top-0 z-10 border-b border-[#1E2730] bg-[#0A0C0B]">
                <tr>
                  <th className="px-4 py-3 font-semibold text-muted-foreground w-8">
                    <Checkbox 
                      checked={selected.length === paginatedRows.length && paginatedRows.length > 0} 
                      onCheckedChange={toggleAll} 
                      className="border-[#1E2730] data-[state=checked]:bg-primary data-[state=checked]:text-black" 
                    />
                  </th>
                  <th className="px-3 py-3 font-semibold text-muted-foreground">#</th>
                  <th className="px-3 py-3 font-semibold text-muted-foreground">Source / Sheet</th>
                  <th className="px-3 py-3 font-semibold text-muted-foreground text-right">Row</th>
                  <th className="px-3 py-3 font-semibold text-muted-foreground">Description</th>
                  <th className="px-3 py-3 font-semibold text-muted-foreground text-right">Amount</th>
                  <th className="px-3 py-3 font-semibold text-muted-foreground">Category</th>
                  <th className="px-3 py-3 font-semibold text-muted-foreground text-center">Anomaly</th>
                  <th className="px-3 py-3 font-semibold text-muted-foreground text-center w-24">Confidence</th>
                  <th className="px-3 py-3 font-semibold text-muted-foreground">Suggested Fix</th>
                  <th className="px-3 py-3 font-semibold text-muted-foreground">Owner</th>
                  <th className="px-3 py-3 font-semibold text-muted-foreground text-center">Approval State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2730]/50">
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center text-muted-foreground">
                      No results match your filters.
                    </td>
                  </tr>
                ) : paginatedRows.map((r) => {
                  const isSel = selected.includes(r.id);
                  return (
                    <tr 
                      key={r.id}
                      onClick={() => toggleRow(r.id)}
                      className={cn("group transition-colors hover:bg-white/[0.02] cursor-pointer", isSel && "bg-white/[0.04] border-l-2 border-l-primary border-r-0")}
                    >
                      <td className="px-4 py-3"><Checkbox checked={isSel} className="border-[#1E2730] data-[state=checked]:bg-primary data-[state=checked]:text-black" /></td>
                      <td className="px-3 py-3 font-bold text-muted-foreground">{r.id}</td>
                      <td className="px-3 py-3 font-medium text-white max-w-[150px] truncate">{r.source}</td>
                      <td className="px-3 py-3 font-bold text-muted-foreground tabular-nums text-right">{r.row.toLocaleString()}</td>
                      <td className="px-3 py-3 font-medium text-muted-foreground max-w-[150px] truncate">{r.description}</td>
                      <td className="px-3 py-3 font-bold text-white tabular-nums text-right">
                        {r.amount > 0 ? `$${r.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
                      </td>
                      <td className="px-3 py-3 font-medium text-muted-foreground">{r.category}</td>
                      <td className="px-3 py-3 flex justify-center"><AnomalyPill type={r.anomaly} /></td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                           <span className="font-bold tabular-nums text-white">{r.confidence}%</span>
                           <div className="relative flex size-4 shrink-0 items-center justify-center">
                             <svg viewBox="0 0 36 36" className="absolute inset-0 size-full -rotate-90">
                               <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                               <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--primary)" strokeWidth="6" strokeDasharray={`${r.confidence}, 100`} />
                             </svg>
                           </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 font-medium text-white">{r.suggestedFix}</td>
                      <td className="px-3 py-3 font-medium text-muted-foreground">{r.owner}</td>
                      <td className="px-3 py-3 flex justify-center"><ApprovalPill state={r.approvalState} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-[#1E2730] px-5 py-3 text-[10px] text-muted-foreground shrink-0 bg-[#050706]">
            {filteredRows.length > 0 ? (
              <span>
                Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filteredRows.length)} of {
                  filteredRows.length === excelWorkbookRows.length ? "1,421,687" : filteredRows.length
                } rows
              </span>
            ) : (
              <span>No results</span>
            )}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex size-6 items-center justify-center rounded hover:bg-[#1E2730] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="size-3" />
                </button>
                
                {/* Show a simplistic window of pages based on totalPages */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(page => (
                  <button 
                    key={page} 
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "flex size-6 items-center justify-center rounded transition-colors hover:bg-[#1E2730] hover:text-white", 
                      page === currentPage ? "bg-[#141B21] text-white" : ""
                    )}
                  >
                    {page}
                  </button>
                ))}
                
                {totalPages > 5 && <span className="px-1">...</span>}
                {totalPages > 5 && (
                  <button className="flex size-6 items-center justify-center rounded hover:bg-[#1E2730] pointer-events-none">
                    118,474
                  </button>
                )}

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="flex size-6 items-center justify-center rounded hover:bg-[#1E2730] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="size-3" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 font-medium text-white bg-transparent rounded transition-colors hover:bg-[#1E2730]">
                    {rowsPerPage} <ChevronDown className="size-3 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-16 min-w-0 border-[#1E2730] bg-[#0A0C0B] text-muted-foreground">
                    {[12, 25, 50].map(val => (
                      <DropdownMenuItem 
                        key={val} 
                        onClick={() => { setRowsPerPage(val); setCurrentPage(1); }}
                        className={cn("text-[11px] focus:bg-[#1E2730] focus:text-white", val === rowsPerPage && "text-white bg-white/[0.02]")}
                      >
                        {val}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: AI Analysis */}
        <div className="flex flex-col gap-6 h-full">
          {/* AI Analysis Summary */}
          <div className="flex flex-col rounded-xl border border-[#1E2730] bg-[#0A0C0B] overflow-hidden p-5 flex-1">
             <div className="flex items-center justify-between border-b border-[#1E2730] pb-3 mb-4 shrink-0">
               <h3 className="text-[11px] font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                 AI Analysis Summary <AlertCircle className="size-3.5 text-muted-foreground" />
               </h3>
               <button className="text-[10px] text-[#3b82f6] hover:underline flex items-center gap-1 font-medium">
                 View full report <ArrowRight className="size-3" />
               </button>
             </div>
             
             <div className="flex-1 overflow-y-auto scrollbar-thin">
                <table className="w-full text-[10px] whitespace-nowrap text-left">
                   <tbody>
                     {excelAiFindings.map((f, i) => (
                       <tr key={i} className="border-b border-[#1E2730]/50 hover:bg-white/[0.02]">
                          <td className="py-2.5 w-6">
                            <span className={cn("flex size-5 items-center justify-center rounded-full text-[10px] font-bold border", 
                              f.rank === 1 ? "border-critical/30 bg-critical/10 text-critical" :
                              f.rank === 2 ? "border-warning/30 bg-warning/10 text-warning" :
                              f.rank === 3 ? "border-[#a855f7]/30 bg-[#a855f7]/10 text-[#a855f7]" :
                              f.rank === 4 ? "border-[#3b82f6]/30 bg-[#3b82f6]/10 text-[#3b82f6]" :
                              "border-warning/30 bg-warning/10 text-warning"
                            )}>
                              {f.rank}
                            </span>
                          </td>
                          <td className="py-2.5 font-semibold text-white whitespace-normal pr-4 leading-tight">{f.label}</td>
                          <td className="py-2.5 text-muted-foreground text-right w-10">Impact</td>
                          <td className="py-2.5 font-bold text-white tabular-nums text-right w-14">{f.impact}</td>
                          <td className="py-2.5 font-bold text-muted-foreground tabular-nums text-right w-10">{f.confidence}%</td>
                          <td className="py-2.5 font-bold text-white tabular-nums text-right w-8">{f.count}</td>
                       </tr>
                     ))}
                   </tbody>
                </table>
                <button className="text-[10px] text-[#3b82f6] hover:underline font-medium mt-4">
                  View all findings (34)
                </button>
             </div>

             <div className="flex flex-col gap-3 pt-6 border-t border-[#1E2730] mt-4">
               <div className="flex items-center justify-between">
                 <h3 className="text-[11px] font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                   Spend leakage by category <AlertCircle className="size-3.5 text-muted-foreground" />
                 </h3>
                 <button className="text-[10px] text-[#3b82f6] hover:underline flex items-center gap-1 font-medium">
                   View breakdown <ArrowRight className="size-3" />
                 </button>
               </div>
               
               <div className="flex flex-col gap-2 text-[9px] relative mt-2">
                 {/* Background Grid Lines for axes */}
                 <div className="absolute top-0 bottom-4 left-24 right-4 flex justify-between pointer-events-none">
                    <div className="w-px h-full bg-[#1E2730]/50" />
                    <div className="w-px h-full bg-[#1E2730]/50" />
                    <div className="w-px h-full bg-[#1E2730]/50" />
                    <div className="w-px h-full bg-[#1E2730]/50" />
                 </div>
                 {excelSpendByCategory.map((c, i) => (
                   <div key={i} className="flex items-center gap-4 relative z-10">
                     <span className="text-muted-foreground w-20 text-right truncate font-medium">{c.category}</span>
                     <div className="flex-1 flex items-center">
                       <div className="h-2 rounded-r-sm transition-all" style={{ width: `${c.pct}%`, backgroundColor: c.color }} />
                       <span className="font-bold text-white tabular-nums ml-2 tracking-wide">${c.amount}K <span className="text-muted-foreground font-normal">({c.pct}%)</span></span>
                     </div>
                   </div>
                 ))}
                 {/* X Axis */}
                 <div className="flex items-center gap-4 mt-1 text-[8px] text-muted-foreground font-medium pl-24 pr-4">
                   <div className="flex-1 flex justify-between">
                      <span className="-ml-1">$0</span>
                      <span>$200K</span>
                      <span>$400K</span>
                      <span className="-mr-1">$600K</span>
                   </div>
                 </div>
               </div>
             </div>

             <div className="flex flex-col gap-3 pt-6 border-t border-[#1E2730] mt-4">
               <div className="flex items-center justify-between">
                 <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">
                   Forecast variance trend
                 </h3>
                 <button className="text-[10px] text-[#3b82f6] hover:underline flex items-center gap-1 font-medium">
                   View details <ArrowRight className="size-3" />
                 </button>
               </div>
               <div className="relative h-32 w-full mt-2 border-b border-[#1E2730] pb-2">
                 {/* Y Axis Labels */}
                 <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[8px] text-muted-foreground z-10 font-medium tabular-nums">
                   <span>$600K</span>
                   <span>$0</span>
                   <span>-$600K</span>
                   <span>-$1.2M</span>
                 </div>
                 
                 {/* Grid lines */}
                 <div className="absolute left-10 right-0 top-1 h-px bg-[#1E2730]/50" />
                 <div className="absolute left-10 right-0 top-[33%] h-px bg-[#1E2730]/50" />
                 <div className="absolute left-10 right-0 top-[66%] h-px bg-[#1E2730]/50" />
                 <div className="absolute left-10 right-0 bottom-2 h-px bg-[#1E2730]/50" />

                 <div className="absolute left-10 right-0 top-0 bottom-2">
                   <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                     <path d="M0,50 L10,60 L20,40 L30,45 L40,20 L50,30 L60,40 L70,35 L80,50 L90,60 L100,70" fill="none" stroke="#a855f7" strokeWidth="2" />
                     {/* Dots */}
                     {[0,10,20,30,40,50,60,70,80,90].map((x, i) => {
                       const y = [50, 60, 40, 45, 20, 30, 40, 35, 50, 60][i];
                       return <circle key={i} cx={x} cy={y} r="1" fill="#a855f7" stroke="#0A0C0B" strokeWidth="0.5" />;
                     })}
                   </svg>
                   
                   {/* HTML overlay for the end point to prevent stretching */}
                   <div className="absolute" style={{ right: 0, top: '70%', transform: 'translate(50%, -50%)' }}>
                     <div className="size-2 rounded-full border-[1.5px] border-[#a855f7] bg-[#0A0C0B] shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                   </div>
                   <div className="absolute font-bold text-white text-[11px] tabular-nums tracking-wide shadow-black drop-shadow-md" style={{ right: 0, top: '70%', transform: 'translate(50%, -180%)' }}>
                     -$430K
                   </div>
                 </div>
               </div>
               {/* X Axis */}
               <div className="flex justify-between pl-10 text-[8px] text-muted-foreground font-medium uppercase tracking-widest mt-1">
                 <span>Jan '26</span>
                 <span>Feb '26</span>
                 <span>Mar '26</span>
                 <span>Apr '26</span>
                 <span>May '26</span>
                 <span>Jun '26</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-[3fr_2fr] gap-6 shrink-0 pb-4">
         {/* Data Connectors */}
         <div className="flex flex-col rounded-xl border border-[#1E2730] bg-[#0A0C0B] p-5">
           <div className="flex items-center justify-between border-b border-[#1E2730] pb-3 mb-4">
             <h3 className="text-[11px] font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
               Data Connectors <AlertCircle className="size-3.5 text-muted-foreground" />
             </h3>
             <button onClick={() => toast.info("Opening connector management")} className="text-[10px] text-[#3b82f6] hover:underline font-medium">Manage connectors →</button>
           </div>
           
           <div className="grid grid-cols-5 gap-4 h-full">
             {excelConnectors.map((c, i) => {
               const syncTimes = ["2.4s", "1.8s", "4.2s", "0.9s", "Live"];
               return (
                 <div key={i} className="flex flex-col rounded-lg border border-[#1E2730]/50 bg-[#141B21]/30 p-3 h-full relative overflow-hidden group hover:border-[#1E2730] transition-colors">
                   <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#1E2730] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   
                   <div className="flex flex-col gap-3 flex-1">
                     <div className="flex items-start gap-2">
                       <div className="flex items-center justify-center size-6 rounded bg-[#0A0C0B] border border-[#1E2730] shrink-0 mt-0.5">
                         {c.name.includes("Excel") && <FileSpreadsheet className="size-3.5 text-[#21A366]" />}
                         {c.name.includes("Google") && <FileSpreadsheet className="size-3.5 text-primary" />}
                         {c.name.includes("CRM") && <Database className="size-3.5 text-[#3b82f6]" />}
                         {c.name.includes("Finance") && <Activity className="size-3.5 text-[#a855f7]" />}
                         {c.name.includes("Webhook") && <Lock className="size-3.5 text-warning" />}
                       </div>
                       <span className="text-[10px] font-semibold text-white leading-tight mt-1 line-clamp-2">{c.name}</span>
                     </div>

                     <div className="flex flex-col gap-0.5 mt-1">
                       <span className="text-[14px] font-bold text-white tabular-nums tracking-tight">{c.rows || "Streaming"}</span>
                       <span className="text-[9px] text-muted-foreground">{c.rows ? "rows synced" : "events streamed"}</span>
                     </div>

                     <div className="grid grid-cols-2 gap-2 mt-auto pt-3 border-t border-[#1E2730]/50">
                        <div className="flex flex-col gap-0.5">
                           <span className="text-[8px] text-muted-foreground uppercase tracking-wider">Latency</span>
                           <span className="text-[10px] font-medium text-white tabular-nums">{syncTimes[i]}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                           <span className="text-[8px] text-muted-foreground uppercase tracking-wider">Errors</span>
                           <span className="text-[10px] font-medium text-white tabular-nums">0.00%</span>
                        </div>
                     </div>
                   </div>

                   <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1E2730]/50">
                     <div className="flex items-center gap-1.5 text-[9px] font-bold text-primary uppercase tracking-widest">
                       <span className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(33,163,102,0.5)]" /> {c.status}
                     </div>
                     <span className="text-[9px] text-muted-foreground">{c.synced}</span>
                   </div>
                 </div>
               );
             })}
           </div>
         </div>

         {/* Proof Trail */}
         <div className="flex flex-col rounded-xl border border-[#1E2730] bg-[#0A0C0B] p-5">
           <div className="flex items-center justify-between border-b border-[#1E2730] pb-3 mb-4">
             <h3 className="text-[11px] font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
               Proof Trail <span className="text-muted-foreground font-medium normal-case tracking-normal">(Latest)</span> <AlertCircle className="size-3.5 text-muted-foreground" />
             </h3>
           </div>
           <div className="flex-1 overflow-x-auto">
             <table className="w-full text-left text-[10px] whitespace-nowrap">
               <thead className="border-b border-[#1E2730]">
                 <tr>
                   <th className="px-4 py-2 font-semibold text-muted-foreground">Source Row</th>
                   <th className="px-4 py-2 font-semibold text-muted-foreground">Finding</th>
                   <th className="px-4 py-2 font-semibold text-muted-foreground">Action</th>
                   <th className="px-4 py-2 font-semibold text-muted-foreground text-center">Approval</th>
                   <th className="px-4 py-2 font-semibold text-muted-foreground">Proof Link</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-[#1E2730]/50">
                 {excelProofTrail.map((pt, i) => (
                   <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                     <td className="px-4 py-2.5 font-bold text-muted-foreground tabular-nums flex items-center gap-1.5">
                       <span className="flex items-center justify-center size-3.5 rounded border border-[#1E2730] text-muted-foreground hover:bg-[#1E2730] cursor-pointer">
                         {i === 0 ? <MinusSquare className="size-2.5" /> : <PlusSquare className="size-2.5" />}
                       </span>
                       {pt.row.toLocaleString()}
                     </td>
                     <td className="px-4 py-2.5 font-medium text-white">{pt.finding}</td>
                     <td className="px-4 py-2.5 text-muted-foreground">{pt.action}</td>
                     <td className="px-4 py-2.5 text-center"><ApprovalPill state={pt.approval} /></td>
                     <td className="px-4 py-2.5">
                       <button onClick={() => toast.info("Opening proof trail link")} className="flex items-center gap-1 font-medium text-[#3b82f6] hover:underline">
                         {pt.link} <ArrowUpRight className="size-3" />
                       </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>
      </div>

      {/* Global System Status Footer */}
      <div className="flex items-center justify-between border-t border-[#1E2730] bg-[#0A0C0B] mt-4 pt-4 shrink-0 text-[10px]">
         <div className="flex items-center gap-6">
            <span className="font-bold text-white uppercase tracking-widest flex items-center gap-2">System status</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-muted-foreground font-medium"><span className="size-1.5 rounded-full bg-primary" /> All systems operational</span>
            </div>
         </div>
         <div className="flex items-center gap-8">
            <span className="flex items-center gap-1.5 text-muted-foreground font-medium">Data pipeline <span className="text-primary font-bold">Healthy</span></span>
            <span className="flex items-center gap-1.5 text-muted-foreground font-medium">AI extraction <span className="text-primary font-bold">Healthy</span></span>
            <span className="flex items-center gap-1.5 text-muted-foreground font-medium">Agent runtime <span className="text-primary font-bold">Healthy</span></span>
            <span className="flex items-center gap-1.5 text-muted-foreground font-medium">Approval service <span className="text-primary font-bold">Healthy</span></span>
         </div>
         <div className="flex items-center gap-2 text-muted-foreground font-medium">
            Last updated: 2m ago <RefreshCw className="size-3 cursor-pointer hover:text-white transition-colors" />
         </div>
      </div>
    </div>
  );
}
