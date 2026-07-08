"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, Calendar, Check, CheckCircle2,
  ChevronDown, Clock, Cloud, Code2, Database, Download, ExternalLink, FileSpreadsheet,
  FileText, GitBranch, Globe, HelpCircle, History, LayoutDashboard, Link as LinkIcon,
  MessageSquare, MoreHorizontal, Pause, PiggyBank, Plus, RefreshCw, RotateCcw, Search,
  Settings, Share2, Shield, ShieldAlert, Sparkles, Target, Upload, User, Zap, Copy
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  reportsKpis, reportsLibrary, reportsDetail, reportsSummaryPanel, workspace
} from "@/lib/genius-data";
import { Ring, Sparkline } from "../shared";
import { Button } from "@/components/ui/button";

const reportIconMap = {
  risk: { Icon: ShieldAlert, color: "text-[#3b82f6]" },
  savings: { Icon: PiggyBank, color: "text-[#22c55e]" },
  renewal: { Icon: Clock, color: "text-[#f59e0b]" },
  history: { Icon: History, color: "text-[#14b8a6]" },
  summary: { Icon: FileText, color: "text-muted-foreground" },
};

const statusMap = {
  "Board-ready": { color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", Icon: CheckCircle2 },
  "In review": { color: "text-warning", bg: "bg-warning/10", border: "border-warning/20", Icon: Clock },
  "Draft": { color: "text-muted-foreground", bg: "bg-[#141B21]", border: "border-[#1E2730]", Icon: FileText },
};

function KpiCard({ kpi, index }) {
  const trendUp = kpi.trendDir === "up";
  const trendDown = kpi.trendDir === "down";

  return (
    <div
      onClick={() => toast(`Viewing KPI: ${kpi.label}`)}
      className="group relative flex flex-col gap-2 overflow-hidden rounded-xl border border-[#1E2730] bg-[#0A0C0B] p-3 transition-all hover:bg-[#141B21] hover:border-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.03)] min-w-[170px] flex-1 cursor-pointer animate-fade-up"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-center gap-2">
        <div className="transition-transform duration-500 group-hover:scale-110">
           <Ring value={kpi.ring} size={36} stroke={`var(--${kpi.tone})`} />
        </div>
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
      {kpi.spark && (
        <div className="absolute bottom-0 left-0 right-0 h-8 opacity-20 group-hover:opacity-40 transition-opacity">
          <Sparkline data={kpi.spark} color={`var(--${kpi.tone})`} />
        </div>
      )}
    </div>
  );
}

export default function Reports({ onNavigate }) {
  const [activeTab, setActiveTab] = useState("Executive Summary");
  const [activeReportId, setActiveReportId] = useState("RL-1");
  const [search, setSearch] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    toast(`Navigated to ${tab}`);
  };

  const handleReportClick = (id, name) => {
    setActiveReportId(id);
    toast(`Viewing report: ${name}`);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast(`${label} copied to clipboard`);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#040504]">
      
      {/* Scrollable Main Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 pb-2 flex flex-col gap-6">
        
        {/* Header */}
        <header className="flex items-start justify-between shrink-0 animate-fade-in">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-white">
              <span className="text-muted-foreground">Reports /</span> Board Reports
            </h1>
            <p className="text-[11px] text-muted-foreground">Board-ready reporting built from evidence, approvals, and proof trails.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-[#1E2730] bg-[#0A0C0B] px-3 py-1.5 transition-all hover:bg-[#141B21] cursor-pointer" onClick={() => toast("Provider info clicked")}>
               <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center"><Zap className="size-2.5 text-primary" /></div>
               <div className="flex flex-col gap-0 leading-none">
                 <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">AI Provider</span>
                 <span className="text-[10px] font-semibold text-white">Gemini 1.5 Pro</span>
               </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#1E2730] bg-[#0A0C0B] px-3 py-1.5 transition-all hover:bg-[#141B21] cursor-pointer" onClick={() => toast("Database info clicked")}>
               <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center"><Database className="size-2.5 text-primary" /></div>
               <div className="flex flex-col gap-0 leading-none">
                 <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Database</span>
                 <span className="text-[10px] font-semibold text-white">Supabase</span>
               </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#1E2730] bg-[#0A0C0B] px-3 py-1.5 transition-all hover:bg-[#141B21] cursor-pointer" onClick={() => toast("Connectors info clicked")}>
               <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center"><Cloud className="size-2.5 text-primary" /></div>
               <div className="flex flex-col gap-0 leading-none">
                 <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Connectors</span>
                 <span className="text-[10px] font-semibold text-white">18 / 20</span>
               </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#1E2730] bg-[#0A0C0B] px-3 py-1.5 transition-all hover:bg-[#141B21] cursor-pointer" onClick={() => toast("Quality info clicked")}>
               <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center"><CheckCircle2 className="size-2.5 text-primary" /></div>
               <div className="flex flex-col gap-0 leading-none">
                 <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Data quality</span>
                 <span className="text-[10px] font-semibold text-primary flex items-center gap-1">Good (98%)</span>
               </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#1E2730] bg-[#0A0C0B] px-3 py-1.5 transition-all hover:bg-[#141B21] cursor-pointer group" onClick={() => toast("Manual sync triggered")}>
               <div className="size-4 rounded-full bg-[#1E2730] flex items-center justify-center group-hover:bg-primary/20 transition-colors"><RefreshCw className="size-2.5 text-muted-foreground group-hover:text-primary transition-colors" /></div>
               <div className="flex flex-col gap-0 leading-none">
                 <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Last sync</span>
                 <span className="text-[10px] font-semibold text-white">2m ago</span>
               </div>
            </div>

            <div className="h-8 w-px bg-[#1E2730] mx-2" />

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => toast("Refreshing reports...")} className="h-8 text-[11px] border-[#1E2730] bg-[#141B21] hover:bg-white/[0.05] text-white hover:text-white transition-colors">
                <RefreshCw className="size-3.5 mr-1.5" /> Refresh
              </Button>
              <Button 
                size="sm" 
                disabled={isPublishing}
                onClick={() => {
                  setIsPublishing(true);
                  toast("Generating report pack...");
                  setTimeout(() => {
                    toast.success("Pack published successfully to board portal.");
                    setIsPublishing(false);
                  }, 2000);
                }} 
                className="h-8 text-[11px] bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(33,163,102,0.3)] hover:shadow-[0_0_20px_rgba(33,163,102,0.5)] transition-all disabled:opacity-50"
              >
                {isPublishing ? (
                  <><div className="size-3 mr-1.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Publishing...</>
                ) : (
                  <><ExternalLink className="size-3.5 mr-1.5" /> Publish pack</>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast("Link copied")} className="h-8 text-[11px] border-[#1E2730] bg-[#141B21] hover:bg-white/[0.05] text-white hover:text-white transition-colors">
                <LinkIcon className="size-3.5 mr-1.5" /> Share link
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast("Opening coverage view")} className="h-8 text-[11px] border-[#1E2730] bg-[#141B21] hover:bg-white/[0.05] text-white hover:text-white transition-colors">
                View approval coverage
              </Button>
            </div>
            
            <div className="flex items-center gap-3 ml-2">
              <div className="size-8 rounded-lg bg-[#141B21] border border-[#1E2730] flex items-center justify-center relative shadow-[0_0_10px_rgba(255,255,255,0.05)] cursor-pointer" onClick={() => toast("Calendar view")}>
                <Calendar className="size-4 text-muted-foreground" />
              </div>
              <div className="flex flex-col gap-0 cursor-pointer" onClick={() => toast("Date settings")}>
                <span className="text-[10px] text-muted-foreground font-semibold">Last Published</span>
                <span className="text-xs font-bold text-white">May 24, 2026</span>
                <span className="text-[9px] text-muted-foreground">10:17 AM</span>
              </div>
            </div>
          </div>
        </header>

        {/* KPI Strip */}
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-thin pb-2 shrink-0">
          {reportsKpis.map((kpi, i) => (
            <KpiCard key={kpi.id} kpi={kpi} index={i} />
          ))}
        </div>

        {/* Main 3-Column Layout */}
        <div className="flex gap-6 min-h-[700px] animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          
          {/* LEFT SIDEBAR: Report Library */}
          <div className="w-[280px] flex flex-col gap-4 shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-bold text-white uppercase tracking-widest">Report Library <span className="text-muted-foreground font-normal ml-1">(24)</span></h2>
            </div>
            
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search reports..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0A0C0B] border border-[#1E2730] rounded-lg pl-9 pr-8 py-2 text-[11px] text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              />
              <Settings className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground cursor-pointer hover:text-white transition-colors" onClick={() => toast("Filter settings")} />
            </div>

            <div className="flex flex-col flex-1 overflow-y-auto scrollbar-thin pr-2 gap-2">
              {reportsLibrary.filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase())).map(report => {
                const isActive = report.id === activeReportId;
                const iconCfg = reportIconMap[report.icon] || { Icon: FileText, color: "text-white" };
                const st = statusMap[report.status] || statusMap["Draft"];
                
                return (
                  <button
                    key={report.id}
                    onClick={() => handleReportClick(report.id, report.name)}
                    className={cn(
                      "group flex flex-col gap-2 p-3 rounded-xl text-left transition-all border",
                      isActive 
                        ? "bg-[#141B21] border-[#38BDF8]/30 shadow-[0_0_15px_rgba(56,189,248,0.05)]" 
                        : "bg-[#0A0C0B] border-transparent hover:bg-white/[0.03] hover:border-[#1E2730]"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          "size-6 rounded flex items-center justify-center border transition-colors", 
                          isActive ? "bg-[#38BDF8]/10 border-[#38BDF8]/30" : "bg-[#141B21] border-[#1E2730] group-hover:border-white/20"
                        )}>
                          <iconCfg.Icon className={cn("size-3.5", isActive ? "text-[#38BDF8]" : iconCfg.color)} />
                        </div>
                        <span className={cn("text-[11px] font-bold transition-colors", isActive ? "text-white" : "text-white/80 group-hover:text-white")}>{report.name}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[9px] font-medium pl-8.5">
                      <span className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded border", st.bg, st.border, st.color)}>
                        <st.Icon className="size-2.5" /> {report.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pl-8.5 mt-1">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-muted-foreground font-mono">{report.period}</span>
                        <span className="text-[9px] text-muted-foreground/60">Updated {report.updated}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {report.formats.map(f => (
                          <span key={f} className="text-[8px] font-bold text-primary px-1 rounded border border-primary/20 bg-primary/10 tracking-widest uppercase">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-[#1E2730] mt-auto">
              <span className="text-[10px] text-muted-foreground font-medium">Show 24 of 24 reports</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => toast("Creating new report...")}
                className="h-7 text-[10px] border-[#1E2730] bg-[#141B21] hover:bg-white/[0.05] text-white transition-all"
              >
                <Plus className="size-3 mr-1" /> New report
              </Button>
            </div>
          </div>

          {/* CENTER PANEL: Report Details */}
          <div className="flex-1 flex flex-col rounded-xl border border-[#1E2730] bg-[#0A0C0B] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-[#1E2730] bg-[#0A0C0B]">
               <div className="flex flex-col gap-1.5">
                 <div className="flex items-center gap-3">
                   <h2 className="text-xl font-bold text-white">{reportsDetail.title}</h2>
                   <span className="flex items-center gap-1 text-[10px] text-primary font-bold uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded border border-primary/20 shadow-[0_0_10px_rgba(33,163,102,0.1)]">
                     {reportsDetail.badge}
                   </span>
                 </div>
                 <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                   <span>{reportsDetail.period}</span>
                   <span className="size-1 rounded-full bg-[#1E2730]" />
                   <span>Prepared {reportsDetail.prepared}</span>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <div className="flex items-center gap-2 cursor-pointer group" onClick={() => toast("Auto-refresh toggled")}>
                   <div className="size-2 rounded-full bg-primary animate-pulse shadow-[0_0_5px_rgba(33,163,102,0.8)]" />
                   <span className="text-[10px] font-medium text-white group-hover:text-primary transition-colors">Auto-refresh</span>
                 </div>
                 <Button 
                   variant="outline" 
                   size="icon" 
                   onClick={() => toast("More options...")}
                   className="h-7 w-7 border-[#1E2730] bg-[#141B21] hover:bg-white/[0.05] hover:text-white transition-all text-white"
                 >
                   <MoreHorizontal className="size-3.5" />
                 </Button>
               </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-[#1E2730] px-4 bg-[#0A0C0B]">
               <div className="flex items-center gap-6">
                 {reportsDetail.tabs.map(tab => {
                   const count = reportsDetail.tabCounts[tab];
                   return (
                     <button
                       key={tab}
                       onClick={() => handleTabClick(tab)}
                       className={cn(
                         "px-2 py-3 text-[11px] font-semibold border-b-2 transition-all relative overflow-hidden flex items-center gap-1.5",
                         activeTab === tab 
                           ? "border-[#38BDF8] text-[#38BDF8]" 
                           : "border-transparent text-muted-foreground hover:text-white hover:border-white/20"
                       )}
                     >
                       {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#38BDF8] shadow-[0_0_8px_rgba(56,189,248,1)]" />}
                       {tab}
                       {count !== undefined && (
                         <span className={cn("px-1.5 rounded-full text-[9px] border transition-colors", activeTab === tab ? "bg-[#38BDF8]/10 border-[#38BDF8]/30" : "bg-[#141B21] border-[#1E2730]")}>{count}</span>
                       )}
                     </button>
                   );
                 })}
               </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 flex flex-col overflow-y-auto scrollbar-thin p-6 bg-[#040504]">
              
              {/* Combine sections to fill empty space when on Summary or Findings tabs */}
              {["Executive Summary", "Findings", "Approvals"].includes(activeTab) ? (
                <div className="flex flex-col gap-10 animate-fade-in">
                  
                  {/* Executive Summary Section */}
                  <div id="executive-summary" className="flex flex-col gap-8">
                    {/* Summary Description */}
                    <div className="flex flex-col gap-2">
                      <h3 className="text-[12px] font-bold text-white uppercase tracking-widest">Executive summary</h3>
                      <p className="text-[11px] text-muted-foreground leading-relaxed max-w-3xl">
                        {reportsDetail.description}
                      </p>
                    </div>

                    {/* Stat Strip */}
                    <div className="flex items-center justify-between border-y border-[#1E2730] py-4 bg-[#0A0C0B] -mx-6 px-6 relative overflow-hidden">
                       <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1E2730] to-transparent" />
                       {reportsDetail.summaryStats.map((stat, idx) => (
                         <div key={idx} className="flex flex-col gap-1 flex-1 relative px-2 first:pl-0 last:pr-0">
                           {idx !== reportsDetail.summaryStats.length - 1 && (
                             <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-8 bg-[#1E2730]" />
                           )}
                           <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</span>
                           <span className="text-lg font-bold text-white tabular-nums flex items-center gap-2">
                             {stat.value}
                             {stat.ring && (
                               <div className="scale-75 origin-left -my-2 opacity-80"><Ring value={stat.ring} size={24} stroke="var(--evidence)" /></div>
                             )}
                           </span>
                           <span className={cn("text-[9px] font-semibold flex items-center gap-0.5", stat.trendDir === "up" ? `text-${stat.tone}` : `text-${stat.tone}`)}>
                             {stat.trendDir === "up" ? <ArrowUpRight className="size-2.5" /> : <ArrowDownRight className="size-2.5" />}
                             {stat.trend}
                           </span>
                         </div>
                       ))}
                    </div>

                    {/* 2-Column Split: Top Findings & Risk Exposure */}
                    <div className="grid grid-cols-2 gap-8">
                      
                      {/* Top Findings */}
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-[#1E2730] pb-2">
                          <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">Top findings</h3>
                          <button className="text-[10px] text-[#3b82f6] hover:text-[#60a5fa] font-medium flex items-center gap-1 group transition-colors" onClick={() => handleTabClick("Findings")}>
                            View all findings <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                          {reportsDetail.topFindings.map((finding, idx) => {
                            const sevMap = {
                              High: "bg-critical/10 text-critical border-critical/20",
                              Medium: "bg-warning/10 text-warning border-warning/20",
                              Low: "bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20"
                            };
                            return (
                              <div key={idx} className="flex flex-col gap-2 p-3 rounded-xl border border-[#1E2730] bg-[#0A0C0B] hover:bg-[#141B21] transition-colors cursor-pointer group" onClick={() => toast(`Finding: ${finding.title}`)}>
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-3 flex-1">
                                    <span className={cn("text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border w-12 text-center shrink-0", sevMap[finding.severity])}>{finding.severity}</span>
                                    <div className="flex flex-col gap-0.5">
                                      <span className="text-[11px] font-bold text-white group-hover:text-primary transition-colors">{finding.title}</span>
                                      <span className="text-[10px] text-muted-foreground max-w-[200px] truncate">{finding.sub}</span>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-0.5 shrink-0 pl-2 border-l border-[#1E2730]/50">
                                    <span className="text-[11px] font-bold text-white tabular-nums">{finding.value}</span>
                                    <span className="text-[8px] text-muted-foreground uppercase">{finding.valueSub}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Risk Exposure */}
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-[#1E2730] pb-2">
                          <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">Risk exposure by category</h3>
                        </div>
                        
                        <div className="flex items-center gap-6 mt-4 pl-4">
                          {/* Donut Chart (CSS implementation) */}
                          <div className="relative size-32 shrink-0">
                            <div 
                              className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                              style={{
                                background: "conic-gradient(var(--critical) 0% 45%, var(--warning) 45% 75%, var(--evidence) 75% 89%, #3a4440 89% 100%)"
                              }}
                            />
                            <div className="absolute inset-3 bg-[#040504] rounded-full" />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <span className="text-xl font-bold text-white tracking-tight">{reportsDetail.riskExposure.total}</span>
                            </div>
                          </div>

                          {/* Legend */}
                          <div className="flex flex-col gap-2.5 flex-1">
                            {reportsDetail.riskExposure.categories.map((cat, idx) => (
                              <div key={idx} className="flex items-center justify-between text-[10px] group cursor-pointer" onClick={() => toast(`Filtered by ${cat.label}`)}>
                                <div className="flex items-center gap-2">
                                  <span className="size-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                                  <span className="text-muted-foreground group-hover:text-white transition-colors">{cat.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-medium tabular-nums">{cat.value}</span>
                                  <span className="text-muted-foreground font-mono w-8 text-right">({cat.pct}%)</span>
                                </div>
                              </div>
                            ))}
                            <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-[#1E2730]">
                              <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Total at-risk exposure</span>
                              <div className="flex items-baseline gap-2">
                                <span className="text-lg font-bold text-white tabular-nums">{reportsDetail.riskExposure.total}</span>
                                <span className="text-[9px] font-bold text-critical flex items-center"><ArrowDownRight className="size-2.5 mr-0.5" /> vs last week</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Findings Section (Always rendered to fill space) */}
                  <div id="all-findings" className="flex flex-col gap-4 pt-6 border-t border-[#1E2730]">
                    <div className="flex items-center justify-between border-b border-[#1E2730] pb-2">
                      <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">All Findings & Recommendations</h3>
                      <button className="text-[10px] text-[#3b82f6] hover:text-[#60a5fa] font-medium flex items-center gap-1 transition-colors" onClick={() => toast("Export findings")}>
                        <Download className="size-3" /> Export CSV
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {reportsDetail.topFindings.map((finding, idx) => {
                         const sevMap = {
                           High: "bg-critical/10 text-critical border-critical/20",
                           Medium: "bg-warning/10 text-warning border-warning/20",
                           Low: "bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20"
                         };
                         return (
                          <div key={idx} className="flex flex-col gap-3 p-4 rounded-xl border border-[#1E2730] bg-[#0A0C0B] hover:bg-[#141B21] transition-colors cursor-pointer" onClick={() => toast(`Finding details: ${finding.title}`)}>
                            <div className="flex items-start justify-between">
                              <span className={cn("text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border w-12 text-center", sevMap[finding.severity])}>{finding.severity}</span>
                              <span className="text-[11px] font-bold text-white tabular-nums">{finding.value}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[11px] font-bold text-white">{finding.title}</span>
                              <span className="text-[10px] text-muted-foreground">{finding.sub}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2 pt-3 border-t border-[#1E2730]">
                               <Button size="sm" className="h-6 text-[9px] bg-primary/20 text-primary hover:bg-primary hover:text-white transition-colors" onClick={(e) => { e.stopPropagation(); toast("Action taken"); }}>Take Action</Button>
                               <Button variant="outline" size="sm" className="h-6 text-[9px] border-[#1E2730] bg-[#141B21] text-white hover:bg-white/[0.05]" onClick={(e) => { e.stopPropagation(); toast("Added to backlog"); }}>Add to backlog</Button>
                            </div>
                          </div>
                         );
                      })}
                    </div>
                  </div>

                  {/* Recent approvals included */}
                  <div id="approvals" className="flex flex-col gap-4 pt-6 border-t border-[#1E2730]">
                    <div className="flex items-center justify-between border-b border-[#1E2730] pb-2">
                      <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">Recent approvals included</h3>
                      <button className="text-[10px] text-[#3b82f6] hover:text-[#60a5fa] font-medium flex items-center gap-1 group transition-colors" onClick={() => handleTabClick("Approvals")}>
                        View all approvals <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 mt-2">
                      {reportsDetail.recentApprovals.map((app, idx) => (
                        <div key={idx} className="flex flex-col gap-2 p-3 rounded-xl border border-[#1E2730] bg-[#0A0C0B] hover:bg-[#141B21] transition-colors cursor-pointer group" onClick={() => toast(`Approval details: ${app.title}`)}>
                          <span className="text-[11px] font-bold text-white leading-tight group-hover:text-[#38BDF8] transition-colors h-8">{app.title}</span>
                          <div className="flex items-center gap-1.5 mt-1">
                             <div className="size-4 rounded bg-primary/20 flex items-center justify-center border border-primary/30 text-[8px] font-bold text-primary">{app.owner.charAt(0)}</div>
                             <span className="text-[10px] text-muted-foreground">{app.owner}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1E2730]/50">
                             <span className="text-[9px] text-muted-foreground font-mono">{app.date}</span>
                             <span className="text-[9px] font-bold text-primary">{app.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 text-center animate-fade-in mt-10">
                  <Settings className="size-8 text-muted-foreground/30 mb-3" />
                  <h3 className="text-sm font-semibold text-white">{activeTab} Details</h3>
                  <p className="text-[11px] text-muted-foreground mt-1 max-w-xs">Detailed data for {activeTab.toLowerCase()} will appear here. This section is currently locked in demo mode.</p>
                  <Button variant="outline" size="sm" onClick={() => handleTabClick("Executive Summary")} className="mt-4 border-[#1E2730] bg-[#141B21] text-white hover:bg-white/[0.05]">
                    Return to Summary
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR: Summary & Export */}
          <div className="w-[300px] shrink-0 flex flex-col gap-6">
            
            {/* Report Summary */}
            <div className="flex flex-col rounded-xl border border-[#1E2730] bg-[#0A0C0B] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
               <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#1E2730]">
                 <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">Report Summary</h3>
                 <span className="text-[10px] font-bold text-primary px-1.5 py-0.5 rounded border border-primary/20 bg-primary/10 tracking-widest uppercase shadow-[0_0_10px_rgba(33,163,102,0.1)]">Board-ready</span>
               </div>
               
               {/* Proof Coverage */}
               <div className="flex flex-col gap-3 pb-4 border-b border-[#1E2730]">
                 <h4 className="text-[10px] font-bold text-white">Proof coverage</h4>
                 <div className="flex items-center gap-4">
                   <div className="relative">
                     <div className="absolute inset-0 bg-[#38BDF8]/20 blur-xl rounded-full" />
                     <Ring value={reportsSummaryPanel.proofCoverage} size={64} stroke="#38BDF8" />
                   </div>
                   <div className="flex flex-col gap-1.5 flex-1">
                     {reportsSummaryPanel.proofCoverageItems.map((item, i) => (
                       <div key={i} className="flex items-center justify-between text-[9px]">
                         <span className="text-muted-foreground">{item.label}</span>
                         <span className="font-bold text-white tabular-nums">{item.value}</span>
                       </div>
                     ))}
                   </div>
                 </div>
                 <button className="text-[10px] text-[#3b82f6] hover:text-[#60a5fa] font-medium flex items-center gap-1 transition-colors group mt-1" onClick={() => toast("Opening proof chain")}>
                    View proof chain <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                 </button>
               </div>

               {/* Board Status */}
               <div className="flex flex-col gap-2 pt-4 pb-4 border-b border-[#1E2730]">
                 <h4 className="text-[10px] font-bold text-white mb-1">Board status</h4>
                 <div className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-2 text-[10px]">
                    <span className="text-muted-foreground">Readiness</span>
                    <span className="font-bold text-primary text-right">{reportsSummaryPanel.boardStatus.readiness}</span>
                    <span className="text-muted-foreground">Quality score</span>
                    <span className="font-bold text-white tabular-nums text-right">{reportsSummaryPanel.boardStatus.qualityScore}</span>
                    <span className="text-muted-foreground">Last reviewed</span>
                    <span className="text-muted-foreground tabular-nums text-right">{reportsSummaryPanel.boardStatus.lastReviewed}</span>
                    <span className="text-muted-foreground">Next review</span>
                    <span className="text-white font-medium tabular-nums text-right">{reportsSummaryPanel.boardStatus.nextReview}</span>
                 </div>
               </div>

               {/* Included approvals */}
               <div className="flex flex-col gap-2 pt-4 pb-4 border-b border-[#1E2730]">
                 <div className="flex items-center justify-between mb-1">
                   <h4 className="text-[10px] font-bold text-white">Included approvals</h4>
                   <button className="text-[9px] text-[#3b82f6] hover:text-[#60a5fa] font-medium transition-colors" onClick={() => toast("View all approvals")}>View all →</button>
                 </div>
                 <div className="flex flex-col gap-1.5">
                   {reportsSummaryPanel.includedApprovals.map((app, i) => (
                     <div key={i} className="flex items-center justify-between text-[10px]">
                       <div className="flex items-center gap-2">
                         <span className={cn("size-1.5 rounded-full", `bg-${app.tone}`)} />
                         <span className="text-muted-foreground">{app.label}</span>
                       </div>
                       <span className="font-bold text-white tabular-nums">{app.value}</span>
                     </div>
                   ))}
                 </div>
               </div>

               {/* Key risks to watch */}
               <div className="flex flex-col gap-2 pt-4 pb-4 border-b border-[#1E2730]">
                 <h4 className="text-[10px] font-bold text-white mb-1">Key risks to watch</h4>
                 <div className="flex flex-col gap-1.5">
                   {reportsSummaryPanel.keyRisks.map((risk, i) => (
                     <div key={i} className="flex items-center justify-between text-[10px]">
                       <div className="flex items-center gap-2">
                         <span className={cn("size-1.5 rounded-full", `bg-${risk.tone}`)} />
                         <span className="text-muted-foreground">{risk.label}</span>
                       </div>
                       <span className="font-bold text-white tabular-nums">{risk.value}</span>
                     </div>
                   ))}
                 </div>
                 <button className="text-[10px] text-[#3b82f6] hover:text-[#60a5fa] font-medium flex items-center gap-1 transition-colors group mt-2" onClick={() => toast("View all risks")}>
                    View all risks <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                 </button>
               </div>

               {/* Report Details Footer */}
               <div className="flex flex-col gap-2 pt-4">
                 <h4 className="text-[10px] font-bold text-white mb-1">Report details</h4>
                 <div className="grid grid-cols-[80px_1fr] gap-x-2 gap-y-2 text-[9px]">
                    <span className="text-muted-foreground">Report ID</span>
                    <span className="font-mono text-white text-right flex items-center justify-end gap-1">{reportsSummaryPanel.reportDetails.id} <Copy className="size-2.5 text-muted-foreground cursor-pointer hover:text-white" onClick={() => copyToClipboard(reportsSummaryPanel.reportDetails.id, "Report ID")}/></span>
                    <span className="text-muted-foreground">Prepared by</span>
                    <span className="text-muted-foreground text-right">{reportsSummaryPanel.reportDetails.preparedBy}</span>
                    <span className="text-muted-foreground">Data as of</span>
                    <span className="text-muted-foreground tabular-nums text-right">{reportsSummaryPanel.reportDetails.dataAsOf}</span>
                    <span className="text-muted-foreground">Report period</span>
                    <span className="text-muted-foreground tabular-nums text-right">{reportsSummaryPanel.reportDetails.period}</span>
                    <span className="text-muted-foreground">Included entities</span>
                    <span className="text-muted-foreground text-right">{reportsSummaryPanel.reportDetails.entities}</span>
                 </div>
               </div>
            </div>

            {/* Export Report */}
            <div className="flex flex-col rounded-xl border border-[#1E2730] bg-[#0A0C0B] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
               <h3 className="text-[11px] font-bold text-white uppercase tracking-widest mb-1">Export report</h3>
               <p className="text-[9px] text-muted-foreground mb-4">Choose a format to export this report pack.</p>
               
               <div className="flex flex-col gap-2">
                 <button className="flex items-center gap-3 p-2.5 rounded-lg border border-[#1E2730] bg-[#141B21] hover:border-primary/50 hover:bg-[#1A251C] transition-colors group" onClick={() => toast("Exporting PDF...")}>
                   <div className="size-8 rounded bg-[#0A0C0B] border border-[#1E2730] flex items-center justify-center group-hover:border-primary/30 transition-colors">
                     <FileText className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                   </div>
                   <div className="flex flex-col text-left gap-0">
                     <span className="text-[11px] font-bold text-white group-hover:text-primary transition-colors">PDF</span>
                     <span className="text-[9px] text-muted-foreground">Board-ready PDF</span>
                   </div>
                 </button>
                 <button className="flex items-center gap-3 p-2.5 rounded-lg border border-[#1E2730] bg-[#141B21] hover:border-primary/50 hover:bg-[#1A251C] transition-colors group" onClick={() => toast("Exporting XLSX...")}>
                   <div className="size-8 rounded bg-[#0A0C0B] border border-[#1E2730] flex items-center justify-center group-hover:border-primary/30 transition-colors">
                     <FileSpreadsheet className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                   </div>
                   <div className="flex flex-col text-left gap-0">
                     <span className="text-[11px] font-bold text-white group-hover:text-primary transition-colors">XLSX</span>
                     <span className="text-[9px] text-muted-foreground">Data workbook</span>
                   </div>
                 </button>
                 <button className="flex items-center gap-3 p-2.5 rounded-lg border border-[#1E2730] bg-[#141B21] hover:border-primary/50 hover:bg-[#1A251C] transition-colors group" onClick={() => toast("Exporting Markdown...")}>
                   <div className="size-8 rounded bg-[#0A0C0B] border border-[#1E2730] flex items-center justify-center group-hover:border-primary/30 transition-colors">
                     <Code2 className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                   </div>
                   <div className="flex flex-col text-left gap-0">
                     <span className="text-[11px] font-bold text-white group-hover:text-primary transition-colors">Markdown</span>
                     <span className="text-[9px] text-muted-foreground">Structured notes</span>
                   </div>
                 </button>
               </div>
            </div>

            {/* Report Actions */}
            <div className="flex flex-col rounded-xl border border-[#1E2730] bg-[#0A0C0B] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
               <h3 className="text-[11px] font-bold text-white uppercase tracking-widest mb-4">Report actions</h3>
               <div className="flex flex-col gap-2">
                 <Button disabled={isPublishing} className="w-full justify-start text-[11px] bg-[#141B21] hover:bg-white/[0.05] border border-[#1E2730] text-white transition-colors h-9 disabled:opacity-50" onClick={() => {
                   setIsPublishing(true);
                   toast("Generating report pack...");
                   setTimeout(() => {
                     toast.success("Pack published successfully to board portal.");
                     setIsPublishing(false);
                   }, 2000);
                 }}>
                   {isPublishing ? (
                     <><div className="size-3.5 mr-2 rounded-full border-2 border-primary/30 border-t-primary animate-spin" /> Publishing...</>
                   ) : (
                     <><Plus className="size-3.5 mr-2 text-primary" /> Publish pack</>
                   )}
                 </Button>
                 <Button className="w-full justify-start text-[11px] bg-[#141B21] hover:bg-white/[0.05] border border-[#1E2730] text-white transition-colors h-9" onClick={() => toast("Share link copied")}>
                   <LinkIcon className="size-3.5 mr-2 text-muted-foreground" /> Share link
                 </Button>
                 <Button className="w-full justify-start text-[11px] bg-[#141B21] hover:bg-white/[0.05] border border-[#1E2730] text-white transition-colors h-9" onClick={() => toast("Schedule settings opened")}>
                   <Calendar className="size-3.5 mr-2 text-muted-foreground" /> Schedule report
                 </Button>
                 <Button className="w-full justify-start text-[11px] bg-[#141B21] hover:bg-white/[0.05] border border-[#1E2730] text-white transition-colors h-9" onClick={() => toast("Report duplicated")}>
                   <Copy className="size-3.5 mr-2 text-muted-foreground" /> Duplicate report
                 </Button>
               </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* GLOBAL SYSTEM STATUS FOOTER (Pinned to bottom of view) */}
      <div className="shrink-0 border-t border-[#1E2730] bg-[#0A0C0B] px-6 py-2.5 flex items-center justify-between text-[10px] z-10 relative shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
         <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
             <span className="font-semibold text-white">System status</span>
             <span className="size-1.5 rounded-full bg-primary shadow-[0_0_5px_rgba(33,163,102,0.8)]" />
             <span className="text-muted-foreground">All systems operational</span>
           </div>
           
           <div className="flex items-center gap-6 pl-6 border-l border-[#1E2730]">
             <div className="flex items-center gap-2">
               <span className="text-muted-foreground">Data pipeline</span>
               <span className="size-1.5 rounded-full bg-primary" />
               <span className="font-medium text-primary">Healthy</span>
             </div>
             <div className="flex items-center gap-2">
               <span className="text-muted-foreground">AI extraction</span>
               <span className="size-1.5 rounded-full bg-primary" />
               <span className="font-medium text-primary">Healthy</span>
             </div>
             <div className="flex items-center gap-2">
               <span className="text-muted-foreground">Agent runtime</span>
               <span className="size-1.5 rounded-full bg-primary" />
               <span className="font-medium text-primary">Healthy</span>
             </div>
             <div className="flex items-center gap-2">
               <span className="text-muted-foreground">Approval service</span>
               <span className="size-1.5 rounded-full bg-primary" />
               <span className="font-medium text-primary">Healthy</span>
             </div>
           </div>
         </div>
         
         <div className="flex items-center gap-3">
           <span className="text-muted-foreground">Last updated: 2m ago</span>
           <RefreshCw className="size-3 text-muted-foreground cursor-pointer hover:text-white transition-colors" onClick={() => toast("Refreshed status")} />
         </div>
      </div>
    </div>
  );
}
