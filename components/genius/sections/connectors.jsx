"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Database, FileText, Globe, Code2, TrendingUp, Zap, Check, CheckCircle2,
  Settings, Activity, Shield, AlertCircle, ArrowUpRight, ArrowDownRight,
  FileSpreadsheet, Lock, ExternalLink, ChevronRight, Pause, RotateCcw,
  RefreshCw, Copy, Search, HelpCircle, Eye, ArrowRight, MoreHorizontal,
  Mail, Cloud, FileImage, MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  connectorsKpis, connectorCatalog, connectorLocked,
  connectorDetail, connectorHealthPanel, liveEvents
} from "@/lib/genius-data";
import { Ring, Sparkline } from "../shared";
import { Button } from "@/components/ui/button";

const catalogIconMap = {
  xlsx:    { Icon: FileSpreadsheet, color: "text-[#22C55E]" },
  gsheet:  { Icon: FileSpreadsheet, color: "text-primary" },
  finance: { Icon: Database,    color: "text-[#38BDF8]" },
  crm:     { Icon: Cloud,  color: "text-[#3b82f6]" },
  webhook: { Icon: Code2,       color: "text-primary" },
  url:     { Icon: Globe,       color: "text-warning" },
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
        <span className="text-[9px] text-muted-foreground truncate max-w-[80px]">
          {kpi.sub}
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

export default function Connectors({ onNavigate }) {
  const [activeTab, setActiveTab] = useState("Schema mapping");
  const [activeConnectorId, setActiveConnectorId] = useState("c-biz");
  const [isTesting, setIsTesting] = useState(false);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    toast(`Navigated to ${tab}`);
  };

  const handleConnectorClick = (id, name) => {
    setActiveConnectorId(id);
    toast(`Switched to connector: ${name}`);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast(`${label} copied to clipboard`);
  };

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto scrollbar-thin p-6 pb-2 bg-[#040504]">
      {/* Header */}
      <header className="flex items-start justify-between shrink-0 animate-fade-in">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-white">
            <span className="text-muted-foreground">Connectors /</span> Business Live
          </h1>
          <p className="text-[11px] text-muted-foreground">Connect, sync, and manage your business data sources.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full border border-[#1E2730] bg-[#0A0C0B] px-3 py-1.5 transition-all hover:bg-[#141B21] cursor-pointer" onClick={() => toast("Provider info clicked")}>
             <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center"><Zap className="size-2.5 text-primary" /></div>
             <div className="flex flex-col gap-0 leading-none">
               <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Provider</span>
               <span className="text-[10px] font-semibold text-white">Gemini 1.5 Pro</span>
             </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#1E2730] bg-[#0A0C0B] px-3 py-1.5 transition-all hover:bg-[#141B21] cursor-pointer" onClick={() => toast("Database info clicked")}>
             <div className="size-4 rounded-full bg-[#21A366]/20 flex items-center justify-center"><Database className="size-2.5 text-[#21A366]" /></div>
             <div className="flex flex-col gap-0 leading-none">
               <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Database</span>
               <span className="text-[10px] font-semibold text-white">Supabase</span>
             </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#1E2730] bg-[#0A0C0B] px-3 py-1.5 transition-all hover:bg-[#141B21] cursor-pointer" onClick={() => toast("Health info clicked")}>
             <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center"><CheckCircle2 className="size-2.5 text-primary" /></div>
             <div className="flex flex-col gap-0 leading-none">
               <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Connector health</span>
               <span className="text-[10px] font-semibold text-white">98%</span>
             </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#1E2730] bg-[#0A0C0B] px-3 py-1.5 transition-all hover:bg-[#141B21] cursor-pointer" onClick={() => toast("Quality info clicked")}>
             <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center"><CheckCircle2 className="size-2.5 text-primary" /></div>
             <div className="flex flex-col gap-0 leading-none">
               <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Data quality</span>
               <span className="text-[10px] font-semibold text-primary flex items-center gap-1">Good (84%)</span>
             </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#1E2730] bg-[#0A0C0B] px-3 py-1.5 transition-all hover:bg-[#141B21] cursor-pointer group" onClick={() => toast("Manual sync triggered")}>
             <div className="size-4 rounded-full bg-[#1E2730] flex items-center justify-center group-hover:bg-primary/20 transition-colors"><RefreshCw className="size-2.5 text-muted-foreground group-hover:text-primary transition-colors" /></div>
             <div className="flex flex-col gap-0 leading-none">
               <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Last sync</span>
               <span className="text-[10px] font-semibold text-white">2m ago</span>
             </div>
          </div>
        </div>
      </header>

      {/* KPI Strip */}
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-thin pb-2 shrink-0">
        {connectorsKpis.map((kpi, i) => (
          <KpiCard key={kpi.id} kpi={kpi} index={i} />
        ))}
      </div>

      {/* Main 3-Column Layout */}
      <div className="flex gap-6 min-h-[700px] mb-2 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        
        {/* LEFT SIDEBAR: Connector Catalog */}
        <div className="w-[280px] flex flex-col gap-4 shrink-0">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search connectors..." 
              className="w-full bg-[#0A0C0B] border border-[#1E2730] rounded-lg pl-9 pr-4 py-2 text-[11px] text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>

          <div className="flex flex-col flex-1 overflow-y-auto scrollbar-thin pr-2 gap-6">
            {Object.entries(connectorCatalog).map(([category, items]) => (
              <div key={category} className="flex flex-col gap-2">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-1">{category}</span>
                <div className="flex flex-col gap-1">
                  {items.map(item => {
                    const isActive = item.id === activeConnectorId;
                    const cfg = catalogIconMap[item.icon] || { Icon: FileText, color: "text-white" };
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleConnectorClick(item.id, item.name)}
                        className={cn(
                          "group flex items-center justify-between p-2 rounded-lg text-left transition-all border",
                          isActive 
                            ? "bg-[#141B21] border-[#1E2730] shadow-[0_0_10px_rgba(255,255,255,0.02)]" 
                            : "border-transparent hover:bg-white/[0.03] hover:border-white/5"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "size-6 rounded bg-[#0A0C0B] flex items-center justify-center border transition-colors", 
                            isActive ? "border-primary/50 shadow-[0_0_8px_rgba(33,163,102,0.15)]" : "border-[#1E2730] group-hover:border-white/20"
                          )}>
                            <cfg.Icon className={cn("size-3.5", cfg.color)} />
                          </div>
                          <div className="flex flex-col gap-0">
                            <span className={cn("text-[11px] font-semibold transition-colors", isActive ? "text-white" : "text-muted-foreground group-hover:text-white")}>{item.name}</span>
                            <span className="text-[9px] text-muted-foreground">{item.desc}</span>
                          </div>
                        </div>
                        <span className="flex items-center gap-1 text-[9px] text-primary font-bold uppercase tracking-widest">
                          <span className={cn("size-1.5 rounded-full transition-colors", isActive ? "bg-primary shadow-[0_0_5px_rgba(33,163,102,0.8)]" : "bg-primary/50")} /> {item.status}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-[#1E2730]">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-1">FUTURE CONNECTORS (LOCKED)</span>
              <div className="flex flex-col gap-1">
                {connectorLocked.map(item => (
                  <button 
                    key={item.id} 
                    onClick={() => toast("This connector is currently locked in your plan.")}
                    className="flex items-center justify-between p-2 rounded-lg text-left opacity-50 hover:opacity-80 transition-opacity grayscale hover:bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-6 rounded bg-[#0A0C0B] flex items-center justify-center border border-[#1E2730]">
                        <Lock className="size-3 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col gap-0">
                        <span className="text-[11px] font-semibold text-muted-foreground">{item.name}</span>
                        <span className="text-[9px] text-muted-foreground">{item.desc}</span>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                       <Lock className="size-2" /> Locked
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => toast("Connector request form opened")}
              className="w-full text-[11px] border-[#1E2730] bg-[#0A0C0B] hover:bg-[#141B21] hover:text-white hover:border-white/20 transition-all mt-4"
            >
              Request a connector
            </Button>
          </div>
        </div>

        {/* CENTER PANEL: Main Connector Setup & Details */}
        <div className="flex-1 flex flex-col rounded-xl border border-[#1E2730] bg-[#0A0C0B] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-[#1E2730] bg-[#0A0C0B]">
             <div className="flex items-center gap-4">
               <div className="size-10 rounded-lg bg-[#141B21] border border-[#1E2730] shadow-[0_0_15px_rgba(33,163,102,0.05)] flex items-center justify-center">
                 <Code2 className="size-5 text-primary" />
               </div>
               <div className="flex flex-col gap-1">
                 <div className="flex items-center gap-3">
                   <h2 className="text-lg font-bold text-white">{connectorDetail.name}</h2>
                   <span className="flex items-center gap-1 text-[10px] text-primary font-bold uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded border border-primary/20 shadow-[0_0_10px_rgba(33,163,102,0.1)]">
                     <span className="size-1.5 rounded-full bg-primary animate-pulse" /> {connectorDetail.status}
                   </span>
                 </div>
                 <p className="text-[11px] text-muted-foreground">{connectorDetail.description}</p>
               </div>
             </div>
             <div className="flex items-center gap-2">
               <Button 
                 variant="outline" 
                 size="sm" 
                 onClick={() => toast("Opening documentation...")}
                 className="h-8 text-[11px] border-[#1E2730] bg-[#141B21] hover:bg-white/[0.05] hover:text-white hover:border-white/20 transition-all text-white"
               >
                 <FileText className="size-3.5 mr-1.5" /> View docs
               </Button>
               <Button 
                 variant="outline" 
                 size="sm" 
                 onClick={() => toast("Opening connector settings...")}
                 className="h-8 text-[11px] border-[#1E2730] bg-[#141B21] hover:bg-white/[0.05] hover:text-white hover:border-white/20 transition-all text-white"
               >
                 <Settings className="size-3.5 mr-1.5" /> Connector settings
               </Button>
               <Button 
                 variant="outline" 
                 size="icon" 
                 onClick={() => toast("More options...")}
                 className="h-8 w-8 border-[#1E2730] bg-[#141B21] hover:bg-white/[0.05] hover:text-white hover:border-white/20 transition-all text-white"
               >
                 <MoreHorizontal className="size-3.5" />
               </Button>
             </div>
          </div>

          {/* Setup Checklist */}
          <div className="flex flex-col gap-4 p-6 border-b border-[#1E2730] bg-gradient-to-b from-[#0A0C0B] to-[#141B21]/30">
            <h3 className="text-[11px] font-bold text-white">Setup checklist</h3>
            <div className="flex items-start justify-between relative mt-2">
               <div className="absolute top-[9px] left-4 right-4 h-px bg-[#1E2730] z-0" />
               {connectorDetail.checklist.map((step, idx) => (
                 <div key={idx} className="flex flex-col items-center gap-2 relative z-10 w-24 group cursor-pointer" onClick={() => toast(`Checklist step: ${step.label}`)}>
                   <div className={cn(
                     "flex items-center justify-center size-5 rounded-full border-2 bg-[#0A0C0B] transition-all duration-300",
                     step.done 
                       ? "border-primary text-primary shadow-[0_0_10px_rgba(33,163,102,0.3)] group-hover:bg-primary/10" 
                       : "border-[#1E2730] text-muted-foreground group-hover:border-white/30 group-hover:text-white/70"
                   )}>
                     <Check className="size-3" strokeWidth={3} />
                   </div>
                   <div className="flex flex-col items-center text-center gap-0.5">
                     <span className={cn(
                       "text-[10px] font-bold leading-tight transition-colors", 
                       step.done ? "text-white" : "text-muted-foreground group-hover:text-white/70"
                     )}>{step.label}</span>
                     <span className={cn(
                       "text-[9px] transition-colors", 
                       step.done ? "text-primary" : "text-muted-foreground"
                     )}>{step.sub}</span>
                   </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-[#1E2730] px-4 bg-[#0A0C0B]">
             <div className="flex items-center gap-6">
               {["Schema mapping", "Event stream", "Logs", "Transformations", "Filters (3)"].map(tab => (
                 <button
                   key={tab}
                   onClick={() => handleTabClick(tab)}
                   className={cn(
                     "px-2 py-3 text-[11px] font-semibold border-b-2 transition-all relative overflow-hidden",
                     activeTab === tab 
                       ? "border-primary text-primary" 
                       : "border-transparent text-muted-foreground hover:text-white hover:border-white/20"
                   )}
                 >
                   {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary shadow-[0_0_8px_rgba(33,163,102,1)]" />}
                   {tab}
                 </button>
               ))}
             </div>
             <button 
               onClick={() => toast("Opening setup guide")}
               className="text-[10px] text-[#3b82f6] hover:text-[#60a5fa] transition-colors flex items-center gap-1 font-medium group"
             >
               <ExternalLink className="size-3 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" /> View setup guide
             </button>
          </div>

          {/* Tab Content: Switch content based on activeTab */}
          <div className="flex-1 flex flex-col overflow-y-auto scrollbar-thin p-6 bg-gradient-to-b from-[#0A0C0B] to-[#040504] relative">
            
            {(activeTab === "Schema mapping" || activeTab === "Event stream") && (
              <div className="flex flex-col gap-10 animate-fade-in">
                {/* Schema Mapping Section */}
                <div id="schema-mapping" className="flex flex-col gap-4">
                  <table className="w-full text-left text-[10px]">
                    <thead className="border-b border-[#1E2730] text-muted-foreground">
                      <tr>
                        <th className="pb-2 font-bold uppercase tracking-widest w-6"></th>
                        <th className="pb-2 font-bold uppercase tracking-widest">Payload field</th>
                        <th className="pb-2 font-bold uppercase tracking-widest">Example value</th>
                        <th className="pb-2 font-bold uppercase tracking-widest">Mapped to</th>
                        <th className="pb-2 font-bold uppercase tracking-widest">Data type</th>
                        <th className="pb-2 font-bold uppercase tracking-widest text-center">Required</th>
                        <th className="pb-2 font-bold uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E2730]/50">
                      {connectorDetail.schemaMapping.map((row, i) => (
                        <tr key={i} className="group hover:bg-white/[0.03] transition-colors cursor-pointer" onClick={() => toast(`Editing field mapping: ${row.field}`)}>
                          <td className="py-2.5 text-muted-foreground"><MoreHorizontal className="size-3 opacity-30 group-hover:opacity-100 transition-opacity" /></td>
                          <td className="py-2.5 font-semibold text-white group-hover:text-primary transition-colors">{row.field}</td>
                          <td className="py-2.5 text-muted-foreground tabular-nums group-hover:text-white/80 transition-colors">{row.example}</td>
                          <td className="py-2.5">
                             <div className="flex items-center justify-between border border-[#1E2730] group-hover:border-white/20 transition-colors rounded bg-[#141B21] px-2 py-1 max-w-[140px]">
                               <span className="text-white font-medium">{row.mappedTo}</span>
                               <ChevronRight className="size-3 text-muted-foreground rotate-90" />
                             </div>
                          </td>
                          <td className="py-2.5 text-muted-foreground"><span className="px-1.5 py-0.5 rounded bg-[#141B21] border border-[#1E2730]">{row.dataType}</span></td>
                          <td className="py-2.5 text-center">
                            {row.required ? <Check className="size-3.5 text-primary mx-auto" /> : <span className="text-muted-foreground">-</span>}
                          </td>
                          <td className="py-2.5 text-right">
                            <button 
                              className="text-muted-foreground hover:text-white p-1 rounded hover:bg-[#141B21] transition-all"
                              onClick={(e) => { e.stopPropagation(); toast(`Settings for ${row.field}`); }}
                            >
                              <Settings className="size-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex items-center justify-between mt-2 pt-4 border-t border-[#1E2730]">
                     <button 
                       onClick={() => toast("Add field mapping")}
                       className="text-[10px] text-muted-foreground hover:text-white flex items-center gap-1.5 font-medium group transition-colors"
                     >
                       <div className="flex items-center justify-center size-4 rounded bg-[#1E2730] group-hover:bg-primary group-hover:text-white transition-colors"><Check className="size-2.5" /></div>
                       Add field mapping
                     </button>
                     <Button 
                       variant="outline" 
                       size="sm" 
                       onClick={() => toast("Validating mapping configuration...")}
                       className="h-7 text-[10px] border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/50 transition-all hover:shadow-[0_0_10px_rgba(33,163,102,0.2)]"
                     >
                       <Check className="size-3 mr-1.5" /> Validate mapping
                     </Button>
                  </div>
                </div>
                
                {/* Event Stream Section */}
                <div id="event-stream" className="flex flex-col gap-4 pt-4 border-t border-[#1E2730]">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-[11px] font-bold text-white flex items-center gap-2">
                       Live event stream <span className="flex items-center gap-1 text-[9px] text-primary uppercase tracking-widest px-2 py-0.5 rounded border border-primary/20 bg-primary/10"><span className="size-1.5 rounded-full bg-primary animate-pulse" /> Live</span>
                     </h3>
                     <div className="flex items-center gap-2">
                       <Button variant="outline" size="sm" onClick={() => toast("Stream paused")} className="h-7 text-[10px] border-[#1E2730] bg-[#141B21] hover:bg-white/[0.05] hover:text-white transition-all text-white">
                         <Pause className="size-3 mr-1.5" /> Pause
                       </Button>
                       <Button variant="outline" size="sm" onClick={() => toast("Stream cleared")} className="h-7 text-[10px] border-[#1E2730] bg-[#141B21] hover:bg-white/[0.05] hover:text-white transition-all text-white">
                         <RotateCcw className="size-3 mr-1.5" /> Clear
                       </Button>
                       <div className="relative">
                         <div 
                           className="flex items-center justify-between border border-[#1E2730] hover:border-white/20 transition-colors rounded bg-[#141B21] px-2 py-1 w-24 h-7 cursor-pointer group/filter"
                           onClick={() => toast("Filter dropdown opened")}
                         >
                           <span className="text-white text-[10px] font-medium">All events</span>
                           <ChevronRight className="size-3 text-muted-foreground group-hover/filter:rotate-90 transition-transform" />
                         </div>
                       </div>
                     </div>
                  </div>
                  
                  <table className="w-full text-left text-[9px]">
                    <thead className="border-b border-[#1E2730] text-muted-foreground">
                      <tr>
                        <th className="pb-2 font-bold uppercase tracking-widest">Time (Live)</th>
                        <th className="pb-2 font-bold uppercase tracking-widest">Event Type</th>
                        <th className="pb-2 font-bold uppercase tracking-widest">Source</th>
                        <th className="pb-2 font-bold uppercase tracking-widest">Order / Ref ID</th>
                        <th className="pb-2 font-bold uppercase tracking-widest">Customer</th>
                        <th className="pb-2 font-bold uppercase tracking-widest text-right">Amount</th>
                        <th className="pb-2 font-bold uppercase tracking-widest text-center">Status</th>
                        <th className="pb-2 font-bold uppercase tracking-widest text-right">Ingestion</th>
                        <th className="pb-2 font-bold uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E2730]/50">
                      {connectorDetail.eventStream.map((ev, i) => (
                        <tr key={i} className="group hover:bg-white/[0.03] transition-colors cursor-pointer" onClick={() => toast(`Viewing event: ${ev.orderId}`)}>
                          <td className="py-2.5 tabular-nums text-muted-foreground group-hover:text-white/80 transition-colors">{ev.time}</td>
                          <td className="py-2.5 text-white font-medium flex items-center gap-1.5">
                            <span className="size-1 rounded-full bg-primary shadow-[0_0_5px_rgba(33,163,102,0.8)]" /> {ev.type}
                          </td>
                          <td className="py-2.5 text-muted-foreground"><span className="px-1.5 py-0.5 rounded bg-[#141B21] border border-[#1E2730]">{ev.source}</span></td>
                          <td className="py-2.5 text-white tabular-nums font-mono">{ev.orderId}</td>
                          <td className="py-2.5 text-muted-foreground">{ev.customer}</td>
                          <td className="py-2.5 text-white font-bold tabular-nums text-right group-hover:text-primary transition-colors">{ev.amount}</td>
                          <td className="py-2.5 text-center">
                            <span className={cn(
                              "px-2 py-0.5 rounded uppercase tracking-widest text-[8px] font-bold",
                              ev.status === "completed" ? "text-primary bg-primary/10 border border-primary/20" : 
                              ev.status === "refunded" ? "text-critical bg-critical/10 border border-critical/20" :
                              ev.status === "updated" ? "text-[#3b82f6] bg-[#3b82f6]/10 border border-[#3b82f6]/20" :
                              "text-warning bg-warning/10 border border-warning/20"
                            )}>{ev.status}</span>
                          </td>
                          <td className="py-2.5 text-muted-foreground tabular-nums text-right">{ev.ingestion}</td>
                          <td className="py-2.5 text-right">
                            <button className="text-muted-foreground hover:text-white p-1 rounded hover:bg-[#141B21] transition-all"><Eye className="size-3.5" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex items-center justify-between mt-4">
                    <button 
                      onClick={() => toast("Loading all historical events...")}
                      className="text-[10px] text-[#3b82f6] hover:text-[#60a5fa] transition-colors font-medium flex items-center gap-1 group"
                    >
                      View all events <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                    <span className="flex items-center gap-1 text-[9px] text-primary font-bold uppercase tracking-widest px-2 py-1 rounded bg-primary/5 border border-primary/10">
                      <span className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(33,163,102,0.8)] animate-pulse" /> Streaming • 1,247 events today
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Filters (3)" && (
              <div className="flex flex-col gap-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">Active Filters</h3>
                  <Button variant="outline" size="sm" className="h-7 text-[10px] border-primary/30 bg-primary/10 text-primary hover:bg-primary/20">
                    <Check className="size-3 mr-1.5" /> Save filters
                  </Button>
                </div>
                
                <div className="flex flex-col gap-2">
                  {[
                    { field: "amount", op: "is greater than", val: "100", active: true },
                    { field: "status", op: "equals", val: "completed", active: true },
                    { field: "source", op: "is not", val: "test", active: true }
                  ].map((filter, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-[#1E2730] bg-[#141B21] hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="px-2 py-1 rounded bg-[#0A0C0B] border border-[#1E2730] text-[10px] text-white font-medium min-w-[80px] text-center">{filter.field}</span>
                        <span className="text-[10px] text-muted-foreground font-semibold">{filter.op}</span>
                        <span className="px-2 py-1 rounded bg-[#0A0C0B] border border-[#1E2730] text-[10px] text-white font-mono">{filter.val}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-4 rounded-full bg-primary/20 relative cursor-pointer" onClick={() => toast("Toggled filter")}>
                           <div className="absolute top-0.5 left-4 size-3 rounded-full bg-primary shadow-[0_0_5px_rgba(33,163,102,0.8)]" />
                        </div>
                        <button className="text-muted-foreground hover:text-critical transition-colors" onClick={() => toast("Removed filter")}><RotateCcw className="size-3.5 rotate-45" /></button>
                      </div>
                    </div>
                  ))}
                  
                  <button className="border border-dashed border-[#1E2730] hover:border-white/20 hover:bg-white/[0.02] transition-colors rounded-lg p-3 text-center text-[10px] text-muted-foreground hover:text-white flex items-center justify-center gap-2 mt-2" onClick={() => toast("Add new filter rule")}>
                     <div className="size-4 rounded-full bg-[#1E2730] flex items-center justify-center"><Check className="size-2.5" /></div>
                     Add filter rule
                  </button>
                </div>
              </div>
            )}

            {/* Placeholder for other tabs */}
            {!["Schema mapping", "Event stream", "Filters (3)"].includes(activeTab) && (
               <div className="flex flex-col items-center justify-center flex-1 text-center animate-fade-in mt-10">
                 <Settings className="size-8 text-muted-foreground/30 mb-3" />
                 <h3 className="text-sm font-semibold text-white">{activeTab}</h3>
                 <p className="text-[11px] text-muted-foreground mt-1 max-w-xs">Configuration for {activeTab.toLowerCase()} will appear here. This section is currently locked in demo mode.</p>
                 <Button variant="outline" size="sm" onClick={() => handleTabClick("Schema mapping")} className="mt-4 border-[#1E2730] bg-[#141B21] text-white hover:bg-white/[0.05]">
                   Return to Schema mapping
                 </Button>
               </div>
            )}

          </div>
        </div>

        {/* RIGHT SIDEBAR: Health & Auth */}
        <div className="w-[300px] shrink-0 flex flex-col gap-6">
          
          {/* Connector Health */}
          <div className="flex flex-col rounded-xl border border-[#1E2730] bg-[#0A0C0B] p-5 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:border-primary/30 transition-colors group">
             <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">Connector health</h3>
               <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">Healthy</span>
             </div>
             <div className="flex items-center gap-4 mb-4">
               <div className="relative">
                 <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                 <Ring value={98} size={50} stroke="var(--primary)" />
               </div>
               <div className="flex flex-col gap-0.5">
                 <span className="text-[11px] font-semibold text-primary">Excellent</span>
                 <span className="text-[10px] text-muted-foreground">All systems operational</span>
               </div>
             </div>
             <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#1E2730]">
                <div className="flex flex-col gap-1 cursor-pointer hover:bg-white/[0.02] p-1.5 -ml-1.5 rounded transition-colors" onClick={() => toast("Latency details")}>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Latency</span>
                  <span className="text-lg font-bold text-white tabular-nums">1.8s</span>
                  <span className="text-[9px] text-primary flex items-center gap-1 font-semibold"><ArrowUpRight className="size-2.5" /> Good</span>
                </div>
                <div className="flex flex-col gap-1 cursor-pointer hover:bg-white/[0.02] p-1.5 -ml-1.5 rounded transition-colors" onClick={() => toast("Error rate details")}>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Error rate</span>
                  <span className="text-lg font-bold text-white tabular-nums">0.12%</span>
                  <span className="text-[9px] text-primary flex items-center gap-1 font-semibold"><ArrowDownRight className="size-2.5" /> Good</span>
                </div>
             </div>
             <button 
               onClick={() => toast("Opening full health report...")}
               className="text-[10px] text-[#3b82f6] hover:text-[#60a5fa] transition-colors flex items-center gap-1 font-medium mt-4 group/btn"
             >
               View health details <ArrowRight className="size-3 group-hover/btn:translate-x-0.5 transition-transform" />
             </button>
          </div>

          {/* Authentication & permissions */}
          <div className="flex flex-col rounded-xl border border-[#1E2730] bg-[#0A0C0B] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:border-white/10 transition-colors">
            <h3 className="text-[11px] font-bold text-white uppercase tracking-widest mb-4">Authentication & permissions</h3>
            <div className="flex flex-col gap-3 text-[10px] border-b border-[#1E2730] pb-4 mb-4">
               <div className="flex items-center justify-between">
                 <span className="text-muted-foreground">API Key</span>
                 <span className="font-semibold text-primary flex items-center gap-1"><Check className="size-3" /> Connected</span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-muted-foreground">Permission scope</span>
                 <span className="font-medium text-white px-1.5 py-0.5 rounded bg-[#141B21] border border-[#1E2730]">Read / Write</span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-muted-foreground">Last verified</span>
                 <span className="font-medium text-white tabular-nums">10m ago</span>
               </div>
            </div>
            <button 
              onClick={() => toast("Opening credential manager...")}
              className="text-[10px] text-[#3b82f6] hover:text-[#60a5fa] transition-colors flex items-center gap-1 font-medium group/btn"
            >
               Manage credentials <ArrowRight className="size-3 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Retry queue */}
          <div className="flex flex-col rounded-xl border border-[#1E2730] bg-[#0A0C0B] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">Retry queue</h3>
               <span className="text-[10px] font-bold text-warning px-2 py-0.5 rounded bg-warning/10 border border-warning/20">3 items</span>
            </div>
            <div className="flex flex-col gap-2 text-[10px] border-b border-[#1E2730] pb-4 mb-4">
               {connectorHealthPanel.retryQueue.map((r, i) => (
                 <div key={i} className="flex items-center justify-between text-muted-foreground hover:text-white transition-colors cursor-pointer p-1 -mx-1 rounded hover:bg-white/[0.03]" onClick={() => toast(`Retrying ${r.id}`)}>
                   <span className="w-16 tabular-nums font-mono">{r.id}</span>
                   <span className="flex-1 truncate px-2">{r.type}</span>
                   <span className="w-12 text-right text-warning">{r.retries} retry</span>
                 </div>
               ))}
            </div>
            <button 
              onClick={() => toast("Opening retry queue manager...")}
              className="text-[10px] text-[#3b82f6] hover:text-[#60a5fa] transition-colors flex items-center gap-1 font-medium group/btn"
            >
               View retry queue <ArrowRight className="size-3 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Webhook secret */}
          <div className="flex flex-col rounded-xl border border-[#1E2730] bg-[#0A0C0B] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:border-white/10 transition-colors">
            <h3 className="text-[11px] font-bold text-white uppercase tracking-widest mb-3">Webhook secret</h3>
            <div className="flex items-center justify-between bg-[#141B21] border border-[#1E2730] hover:border-white/20 transition-colors rounded-lg px-3 py-2 mb-3 group/secret">
               <span className="text-[11px] font-mono text-muted-foreground tracking-wider blur-[2px] group-hover/secret:blur-0 transition-all">{connectorHealthPanel.webhookSecret}</span>
               <button 
                 onClick={() => copyToClipboard(connectorHealthPanel.webhookSecret, "Webhook secret")}
                 className="text-muted-foreground hover:text-white transition-colors p-1 rounded hover:bg-[#1E2730]"
               >
                 <Copy className="size-3.5" />
               </button>
            </div>
            <button 
              onClick={() => toast("Secret rotation requested. Verification sent to email.")}
              className="text-[10px] text-[#3b82f6] hover:text-[#60a5fa] transition-colors flex items-center gap-1 font-medium"
            >
               <RotateCcw className="size-3" /> Rotate secret
            </button>
          </div>

          {/* Test connection */}
          <div className="flex flex-col rounded-xl border border-[#1E2730] bg-[#0A0C0B] p-5 mt-auto shadow-[0_4px_20px_rgba(0,0,0,0.2)] bg-gradient-to-br from-[#0A0C0B] to-primary/5">
            <h3 className="text-[11px] font-bold text-white uppercase tracking-widest mb-1.5">Test connection</h3>
            <p className="text-[10px] text-muted-foreground mb-4 leading-relaxed">Send a test event to verify your webhook is working.</p>
            <Button 
              variant="outline" 
              disabled={isTesting}
              onClick={() => {
                setIsTesting(true);
                toast("Connecting to endpoint...");
                setTimeout(() => {
                  toast.success("Test event sent successfully! Status: 200 OK");
                  setIsTesting(false);
                }, 1500);
              }}
              className="w-full text-[11px] border-primary/30 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-[0_0_10px_rgba(33,163,102,0.2)] hover:shadow-[0_0_15px_rgba(33,163,102,0.4)] disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <div className="size-3.5 mr-2 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Zap className="size-3.5 mr-1.5" /> Send test event
                </>
              )}
            </Button>
          </div>

        </div>
      </div>

      {/* BOTTOM PIPELINE DIAGRAM */}
      <div className="flex items-center justify-between mt-4 px-2 py-4 bg-[#040504] shrink-0 border-t border-[#1E2730] relative animate-fade-in-up" style={{ animationDelay: '200ms' }}>
         <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-[#1E2730] via-primary/30 to-[#1E2730] -z-10" />
         
         <div className="flex flex-col items-center gap-2 bg-[#040504] px-4 -ml-4 group cursor-pointer" onClick={() => toast("Pipeline step: Live event")}>
           <span className="text-[10px] font-bold text-primary flex items-center gap-1 transition-transform group-hover:-translate-y-0.5"><span className="flex items-center justify-center size-4 rounded bg-primary/20 border border-primary/40 text-primary shadow-[0_0_8px_rgba(33,163,102,0.5)]">1</span> Live event</span>
           <div className="flex flex-col gap-1 p-3 rounded-xl border border-primary/30 bg-[#0A0C0B] shadow-[0_0_15px_rgba(33,163,102,0.1)] w-40 h-[60px] justify-center relative transition-colors group-hover:border-primary/50 group-hover:bg-[#141B21]">
             <div className="absolute -right-[1px] top-1/2 -translate-y-1/2 w-1 h-3 bg-primary rounded-l-full shadow-[0_0_5px_rgba(33,163,102,1)] animate-pulse" />
             <span className="text-[10px] font-bold text-white flex items-center gap-1.5"><Globe className="size-3 text-muted-foreground group-hover:text-primary transition-colors" /> purchase</span>
             <span className="text-[10px] text-muted-foreground tabular-nums font-mono pl-4.5 group-hover:text-white/80 transition-colors">ORD-884512</span>
           </div>
         </div>

         <div className="relative w-8 h-px overflow-hidden">
           <div className="absolute inset-0 bg-primary/50 animate-[slide-right_2s_infinite]" />
           <ArrowRight className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-4 text-primary" />
         </div>

         <div className="flex flex-col items-center gap-2 bg-[#040504] px-4 group cursor-pointer" onClick={() => toast("Pipeline step: Extracted fact")}>
           <span className="text-[10px] font-bold text-white flex items-center gap-1 transition-transform group-hover:-translate-y-0.5"><span className="flex items-center justify-center size-4 rounded bg-[#141B21] border border-[#1E2730] text-muted-foreground group-hover:border-white/30 transition-colors">2</span> Extracted fact</span>
           <div className="flex flex-col gap-1 p-3 rounded-xl border border-[#1E2730] bg-[#0A0C0B] shadow-lg w-40 h-[60px] justify-center transition-colors group-hover:border-white/20 group-hover:bg-[#141B21]">
             <span className="text-[10px] font-medium text-white flex items-center gap-1.5"><FileText className="size-3 text-[#38BDF8]" /> Order amount</span>
             <span className="text-[11px] font-bold text-white tabular-nums pl-4.5">$129.99</span>
           </div>
         </div>

         <ArrowRight className="size-4 text-muted-foreground" />

         <div className="flex flex-col items-center gap-2 bg-[#040504] px-4 group cursor-pointer" onClick={() => toast("Pipeline step: Metric update")}>
           <span className="text-[10px] font-bold text-white flex items-center gap-1 transition-transform group-hover:-translate-y-0.5"><span className="flex items-center justify-center size-4 rounded bg-[#141B21] border border-[#1E2730] text-muted-foreground group-hover:border-white/30 transition-colors">3</span> Metric update</span>
           <div className="flex flex-col gap-1 p-3 rounded-xl border border-[#1E2730] bg-[#0A0C0B] shadow-lg w-40 h-[60px] justify-center relative overflow-hidden transition-colors group-hover:border-white/20 group-hover:bg-[#141B21]">
             <div className="absolute bottom-0 right-0 opacity-20 group-hover:opacity-40 transition-opacity group-hover:scale-110 duration-500"><TrendingUp className="size-8 text-primary" /></div>
             <span className="text-[10px] font-medium text-white flex items-center gap-1.5"><Activity className="size-3 text-primary" /> Revenue tracked</span>
             <span className="text-[11px] font-bold text-primary tabular-nums pl-4.5">+$129.99</span>
           </div>
         </div>

         <ArrowRight className="size-4 text-muted-foreground" />

         <div className="flex flex-col items-center gap-2 bg-[#040504] px-4 group cursor-pointer" onClick={() => toast("Pipeline step: Risk impact")}>
           <span className="text-[10px] font-bold text-warning flex items-center gap-1 transition-transform group-hover:-translate-y-0.5"><span className="flex items-center justify-center size-4 rounded bg-warning/10 border border-warning/30 text-warning shadow-[0_0_8px_rgba(245,158,11,0.3)]">4</span> Risk impact</span>
           <div className="flex flex-col gap-1 p-3 rounded-xl border border-warning/30 bg-[#0A0C0B] shadow-[0_0_15px_rgba(245,158,11,0.05)] w-40 h-[60px] justify-center transition-colors group-hover:border-warning/50 group-hover:bg-warning/5">
             <span className="text-[10px] font-bold text-white flex items-center gap-1.5"><Shield className="size-3 text-warning group-hover:scale-110 transition-transform" /> Low risk</span>
             <span className="text-[10px] text-muted-foreground pl-4.5 group-hover:text-white/80 transition-colors">No anomalies</span>
           </div>
         </div>

         <ArrowRight className="size-4 text-muted-foreground" />

         <div className="flex flex-col items-center gap-2 bg-[#040504] px-4 group cursor-pointer" onClick={() => toast("Pipeline step: Approval")}>
           <span className="text-[10px] font-bold text-white flex items-center gap-1 transition-transform group-hover:-translate-y-0.5"><span className="flex items-center justify-center size-4 rounded bg-[#141B21] border border-[#1E2730] text-muted-foreground group-hover:border-white/30 transition-colors">5</span> Approval <span className="text-muted-foreground font-normal">(if needed)</span></span>
           <div className="flex flex-col gap-1 p-3 rounded-xl border border-[#1E2730] bg-[#0A0C0B] shadow-lg w-40 h-[60px] justify-center transition-colors group-hover:border-white/20 group-hover:bg-[#141B21]">
             <span className="text-[10px] font-bold text-white flex items-center gap-1.5"><CheckCircle2 className="size-3 text-[#a855f7]" /> Auto-approved</span>
             <span className="text-[10px] text-muted-foreground pl-4.5">Rules applied</span>
           </div>
         </div>

         <ArrowRight className="size-4 text-muted-foreground" />

         <div className="flex flex-col items-center gap-2 bg-[#040504] pl-4 -mr-4 group cursor-pointer" onClick={() => toast("Pipeline step: Audit trail")}>
           <span className="text-[10px] font-bold text-[#38BDF8] flex items-center gap-1 transition-transform group-hover:-translate-y-0.5"><span className="flex items-center justify-center size-4 rounded bg-[#141B21] border border-[#1E2730] text-white group-hover:border-[#38BDF8]/50 transition-colors shadow-[0_0_8px_rgba(56,189,248,0.2)]">6</span> Audit trail</span>
           <div className="flex items-center justify-between p-3 rounded-xl border border-[#1E2730] bg-[#0A0C0B] shadow-lg w-44 h-[60px] transition-colors group-hover:border-[#38BDF8]/30 group-hover:bg-[#141B21]">
             <div className="flex flex-col gap-1">
               <span className="text-[10px] font-medium text-white flex items-center gap-1.5"><FileImage className="size-3 text-muted-foreground group-hover:text-[#38BDF8] transition-colors" /> Proof trail</span>
               <span className="text-[11px] font-bold text-white tabular-nums pl-4.5">PT-1247</span>
             </div>
             <button className="text-[9px] text-[#3b82f6] group-hover:text-[#60a5fa] font-medium transition-colors">View proof trail →</button>
           </div>
         </div>
      </div>
    </div>
  );
}
