"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Download,
  SlidersHorizontal,
  Check,
  X,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  LayoutGrid,
  Search,
  CheckCircle2,
  FileText,
  Clock,
  Maximize2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Bold, Italic, Underline, List, Type, PenTool, Link2, AlignLeft,
  Filter, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

import { approvalsKpis, approvalsQueue, approvalsDetail, approvalsInsights } from "@/lib/genius-data";
import {
  Panel,
  SeverityBadge,
  ConfBar,
  Ring,
  Sparkline,
  StatusDot
} from "../shared";

const toneText = {
  primary: "text-primary", critical: "text-critical",
  evidence: "text-evidence", warning: "text-warning", neutral: "text-white",
};

const toneStroke = {
  primary: "var(--primary)", critical: "var(--critical)",
  evidence: "var(--evidence)", warning: "var(--warning)", neutral: "rgba(255,255,255,0.2)",
};

function ApprovalPill({ state }) {
  const s = {
    Open: "text-white",
    "Due soon": "text-warning",
    Urgent: "text-critical",
    Review: "text-[#3b82f6]",
    Snoozed: "text-[#3b82f6]",
  }[state] || "text-muted-foreground";
  
  return (
    <span className={cn("text-[10px] font-bold uppercase tracking-widest whitespace-nowrap", s)}>
      {state}
    </span>
  );
}

function KpiCard({ kpi, index }) {
  const trendUp = kpi.trendDir === "up";
  const trendDown = kpi.trendDir === "down";

  return (
    <div
      className="group relative flex flex-col gap-2 overflow-hidden rounded-xl border border-[#1E2730] bg-[#0A0C0B] p-3 transition-all hover:bg-[#141B21] min-w-[160px] flex-1 animate-fade-up"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-center gap-2">
        <Ring value={kpi.ring} size={36} stroke={`var(--${kpi.tone})`} />
        <div className="flex flex-col gap-0 min-w-0">
          <span className="truncate text-[10px] font-semibold uppercase tracking-widest text-muted-foreground leading-snug">
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
    </div>
  );
}

function EvidenceLink({ children }) {
  return (
    <div className="flex items-center gap-1.5 cursor-pointer group">
      <FileText className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
      <span className="text-[11px] font-medium text-white group-hover:text-primary group-hover:underline transition-colors line-clamp-1">{children}</span>
    </div>
  )
}

function DetailPanel({ item, onClose, onUpdateState }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const d = approvalsDetail;
  const tabList = ["Overview", "Evidence (12)", "Impact", "Timeline", "Related (4)"];

  return (
    <div className="flex flex-col h-full rounded-xl border border-[#1E2730] bg-[#0A0C0B] overflow-hidden">
      {/* Header */}
      <div className="flex flex-col border-b border-[#1E2730]">
        <div className="flex items-center justify-between px-5 py-4 shrink-0">
          <div className="flex flex-col gap-1.5 min-w-0 pr-2">
            <h3 className="text-sm font-semibold text-white truncate flex items-center gap-2">
              {d.title}
              <SeverityBadge level={d.badge} />
            </h3>
            <span className="text-[10px] text-muted-foreground">
              {d.sub}
            </span>
            <span className="text-[10px] text-muted-foreground mt-1">
              Requested by {d.requestedBy} · {d.requestedAt}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-start">
            <span className="flex items-center gap-1.5 rounded border border-critical/30 bg-critical/10 px-2 py-1 text-[10px] font-bold text-critical uppercase tracking-widest">
              <AlertCircle className="size-3" /> {d.urgency}
            </span>
            <button className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-[#1E2730] hover:text-white transition-colors">
              <Maximize2 className="size-3.5" />
            </button>
            <button onClick={onClose} className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-[#1E2730] hover:text-white transition-colors">
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 px-5 text-[11px] font-semibold shrink-0">
          {tabList.map(t => (
            <button 
              key={t}
              onClick={() => setActiveTab(t.split(' ')[0])}
              className={cn(
                "pb-3 transition-colors relative",
                activeTab === t.split(' ')[0] ? "text-white" : "text-muted-foreground hover:text-white"
              )}
            >
              {t}
              {activeTab === t.split(' ')[0] && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t-full" />}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin flex flex-col">
        {activeTab === "Overview" && (
          <div className="flex flex-col gap-6 p-5">
            {/* Impact Summary Grid */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white">Impact summary</span>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <div className="flex flex-col gap-1">
                  <span className="text-xl font-bold text-white tabular-nums">{d.estimatedImpact}</span>
                  <span className="text-[10px] text-muted-foreground">{d.impactSub}</span>
                </div>
                <div className="flex flex-col gap-1 pl-4">
                  <span className="text-xl font-bold text-white tabular-nums">{d.roi}</span>
                  <span className="text-[10px] text-muted-foreground">{d.roiSub}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xl font-bold text-white tabular-nums">{d.reduction}</span>
                  <span className="text-[10px] text-muted-foreground">{d.reductionSub}</span>
                </div>
                <div className="flex flex-col gap-1 pl-4">
                  <span className="text-lg font-bold text-critical">{d.strategicPriority}</span>
                  <span className="text-[10px] text-muted-foreground">Strategic priority</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Confidence */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white">Confidence</span>
                <div className="flex flex-col items-center justify-center p-4 border border-[#1E2730] rounded-lg bg-[#141B21]/50 gap-2">
                  <div className="relative flex size-16 items-center justify-center">
                     <svg viewBox="0 0 36 36" className="absolute inset-0 size-full -rotate-90">
                       <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                       <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--primary)" strokeWidth="3" strokeDasharray={`${d.confidence}, 100`} />
                     </svg>
                     <span className="text-lg font-bold text-white tabular-nums">{d.confidence}%</span>
                  </div>
                  <span className="text-[11px] font-bold text-primary">{d.confidenceLabel}</span>
                  <button className="text-[9px] text-primary hover:underline mt-1">How confidence is calculated</button>
                </div>
              </div>

              {/* Evidence Summary */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white">Evidence summary</span>
                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Total documents</span>
                    <span className="font-bold text-white tabular-nums">{d.totalDocs}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Data sources</span>
                    <span className="font-bold text-white tabular-nums">{d.dataSources}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Extracted facts</span>
                    <span className="font-bold text-white tabular-nums">{d.extractedFacts}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Completeness</span>
                    <span className="font-bold text-white tabular-nums">{d.completeness}%</span>
                  </div>
                  <button onClick={() => toast.info("Opening all evidence")} className="text-[10px] text-[#3b82f6] hover:underline font-medium mt-1 text-left">View all evidence →</button>
                </div>
              </div>
            </div>

            {/* AI Recommended Action */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white">AI recommended action</span>
              <p className="text-[11px] leading-relaxed text-muted-foreground">{d.recommendedAction}</p>
            </div>
            
            {/* Rationale */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white">Rationale</span>
              <div className="flex flex-col gap-2.5">
                {d.rationale.map((r, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="text-[11px] text-muted-foreground leading-relaxed">{r}</span>
                  </div>
                ))}
              </div>
              <button className="text-[10px] text-[#3b82f6] hover:underline font-medium mt-1 text-left">View full rationale →</button>
            </div>

            {/* Reviewer Notes */}
            <div className="flex flex-col gap-3 border-t border-[#1E2730] pt-6">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white">Reviewer notes</span>
              <div className="flex flex-col rounded-md border border-[#1E2730] bg-[#141B21]/50 overflow-hidden">
                <div className="flex items-center gap-1 border-b border-[#1E2730] px-2 py-1.5 bg-[#0A0C0B]">
                  <button className="p-1.5 text-muted-foreground hover:text-white rounded hover:bg-[#1E2730]"><Bold className="size-3" /></button>
                  <button className="p-1.5 text-muted-foreground hover:text-white rounded hover:bg-[#1E2730]"><Italic className="size-3" /></button>
                  <button className="p-1.5 text-muted-foreground hover:text-white rounded hover:bg-[#1E2730]"><Underline className="size-3" /></button>
                  <div className="w-px h-3 bg-[#1E2730] mx-1" />
                  <button className="p-1.5 text-muted-foreground hover:text-white rounded hover:bg-[#1E2730]"><AlignLeft className="size-3" /></button>
                  <button className="p-1.5 text-muted-foreground hover:text-white rounded hover:bg-[#1E2730]"><List className="size-3" /></button>
                  <div className="w-px h-3 bg-[#1E2730] mx-1" />
                  <button className="p-1.5 text-muted-foreground hover:text-white rounded hover:bg-[#1E2730]"><Link2 className="size-3" /></button>
                </div>
                <textarea 
                  className="w-full bg-transparent p-3 text-[11px] text-white placeholder:text-muted-foreground outline-none resize-none min-h-[80px]"
                  placeholder="Add your notes, questions, or instructions for the agent..."
                />
                <div className="flex justify-end p-2 px-3 text-[9px] text-muted-foreground">
                  Saved 2m ago
                </div>
              </div>
            </div>
            
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col border-t border-[#1E2730] bg-[#050706] shrink-0 p-4 gap-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { onUpdateState(item.id, "Approved"); onClose(); }} 
            className="flex-1 flex items-center justify-center gap-2 rounded bg-primary/20 border border-primary/30 px-3 py-2 text-[11px] font-bold text-primary transition-colors hover:bg-primary/30"
          >
            <Check className="size-3.5" /> Approve
          </button>
          <button 
            onClick={() => { onUpdateState(item.id, "Rejected"); onClose(); }}
            className="flex-1 flex items-center justify-center gap-2 rounded bg-critical/20 border border-critical/30 px-3 py-2 text-[11px] font-bold text-critical transition-colors hover:bg-critical/30"
          >
            <X className="size-3.5" /> Reject
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 rounded border border-[#1E2730] bg-[#141B21] px-3 py-1.5 text-[10px] font-medium text-white transition-colors hover:bg-[#1E2730]">
            <PenTool className="size-3 text-muted-foreground" /> Edit details
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 rounded border border-[#1E2730] bg-[#141B21] px-3 py-1.5 text-[10px] font-medium text-white transition-colors hover:bg-[#1E2730]">
            <FileText className="size-3 text-muted-foreground" /> Request more evidence
          </button>
        </div>
        <div className="flex items-center justify-center gap-6 mt-1 text-[10px] text-muted-foreground font-medium">
          <button className="flex items-center gap-1.5 hover:text-white transition-colors"><Clock className="size-3" /> Snooze</button>
          <button className="flex items-center gap-1.5 hover:text-white transition-colors"><CheckCircle2 className="size-3" /> Mark done</button>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="flex flex-col border-t border-[#1E2730] bg-[#0A0C0B] shrink-0 p-5">
        <div className="flex flex-col gap-4">
          <span className="text-[11px] font-semibold text-white">Approval timeline</span>
          <div className="relative flex items-start justify-between">
            <div className="absolute left-2 right-2 top-[7px] h-px bg-[#1E2730]" />
            <div className="absolute left-2 right-1/2 top-[7px] h-px bg-primary" />
            
            {d.timeline.map((step, idx) => (
              <div key={idx} className="relative flex flex-col items-center flex-1 z-10 px-1 group cursor-default">
                <div className={cn(
                  "flex size-3.5 items-center justify-center rounded-full border border-[#0A0C0B] mb-2",
                  step.done ? "bg-primary" : step.active ? "bg-[#3b82f6] shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-[#1E2730]"
                )}>
                  {step.active && <div className="size-1.5 rounded-full bg-white" />}
                </div>
                <div className="text-center flex flex-col gap-0.5 items-center max-w-[60px]">
                  <span className={cn("text-[9px] font-medium line-clamp-2 leading-tight", step.active || step.done ? "text-white" : "text-muted-foreground")}>{step.label}</span>
                  <span className="text-[8px] text-muted-foreground line-clamp-1">{step.date}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-[10px] mt-2">
            <button className="text-[#3b82f6] hover:underline font-medium flex items-center gap-1">View full timeline <ArrowRight className="size-3" /></button>
            <div className="flex items-center gap-2 text-muted-foreground">
              Approval SLA: {d.sla} <span className="rounded bg-warning/20 border border-warning/30 px-1.5 py-0.5 font-bold text-warning uppercase tracking-widest">{d.slaRisk}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Approvals({ onNavigate }) {
  const [items, setItems] = useState(approvalsQueue);
  const [filter, setFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(approvalsQueue[0].id);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const filteredItems = items.filter((item) => {
    if (filter === "All") return true;
    return item.priority === filter || item.urgency === filter;
  });

  const selectedItem = items.find((i) => i.id === selectedId);

  const updateState = (id, newState) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newState } : item))
    );
    toast.success(`Marked as ${newState}`);
  };

  const totalPages = Math.ceil(filteredItems.length / rowsPerPage);

  return (
    <div className="scrollbar-thin flex h-full flex-col gap-6 overflow-y-auto p-6 pb-2">
      {/* Header */}
      <header className="flex flex-col gap-1 shrink-0">
        <h1 className="text-2xl font-semibold text-white">Approvals</h1>
        <p className="text-[11px] text-muted-foreground">Human oversight for high-impact actions. You stay in control.</p>
      </header>

      {/* KPI Strip */}
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-thin pb-2 shrink-0">
        {approvalsKpis.map((kpi, i) => (
          <KpiCard key={kpi.id} kpi={kpi} index={i} />
        ))}
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden h-full min-h-[900px]">
        {/* Main List */}
        <div className="flex flex-col flex-1 rounded-xl border border-[#1E2730] bg-[#0A0C0B] overflow-hidden min-w-0">
          <div className="flex items-center justify-between border-b border-[#1E2730] px-5 py-4 shrink-0">
            <div className="flex items-center gap-6">
              <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">Human decision queue <span className="text-muted-foreground font-normal normal-case text-[10px]">24</span></h3>
              <div className="flex items-center gap-6 text-[11px] font-semibold">
                {["All 24", "Urgent 6", "Due Soon 7", "Mine 8", "By Agent", "By Impact"].map((f, i) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f.split(' ')[0])}
                    className={cn(
                      "transition-colors relative pb-4 -mb-4",
                      (i === 0 && filter === "All") || filter === f.split(' ')[0]
                        ? "text-white"
                        : "text-muted-foreground hover:text-white"
                    )}
                  >
                    {f}
                    {((i === 0 && filter === "All") || filter === f.split(' ')[0]) && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t-full" />}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 rounded border border-[#1E2730] bg-transparent px-3 py-1.5 text-[10px] text-white hover:bg-[#141B21] transition-colors">
                <Filter className="size-3 text-muted-foreground" /> Filters
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1.5 rounded border border-[#1E2730] bg-transparent px-3 py-1.5 text-[10px] text-muted-foreground hover:bg-[#141B21] transition-colors">
                  Sort: Due soonest <ChevronDown className="size-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 border-[#1E2730] bg-[#0A0C0B] text-muted-foreground">
                  <DropdownMenuItem onClick={() => toast.success("Sorted by Due Date")} className="text-[11px] focus:bg-[#1E2730] focus:text-white">Due soonest</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.success("Sorted by Impact")} className="text-[11px] focus:bg-[#1E2730] focus:text-white">Highest impact</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <button className="flex size-7 items-center justify-center rounded border border-[#1E2730] text-muted-foreground hover:bg-[#141B21] hover:text-white transition-colors ml-1">
                <LayoutGrid className="size-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <table className="w-full whitespace-nowrap text-left text-[10px]">
              <thead className="sticky top-0 z-10 border-b border-[#1E2730] bg-[#0A0C0B]">
                <tr>
                  <th className="px-4 py-3 font-semibold w-10 text-center"><Checkbox className="border-[#1E2730] data-[state=checked]:bg-primary data-[state=checked]:text-black" /></th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-widest text-muted-foreground w-16">Action</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-widest text-muted-foreground w-[280px]"></th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-widest text-muted-foreground">Impact</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-widest text-muted-foreground">Owner</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-widest text-muted-foreground">Evidence</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-widest text-muted-foreground">Proof trail</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-widest text-muted-foreground text-center">Status</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-widest text-muted-foreground">Due</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-widest text-muted-foreground">Agent</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-widest text-muted-foreground text-center">AI Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2730]/50">
                {filteredItems.map((item, i) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      "group animate-fade-up cursor-pointer transition-colors hover:bg-white/[0.02]",
                      selectedId === item.id && "bg-white/[0.05] border-l-2 border-l-primary border-r-0 border-y-[#1E2730]"
                    )}
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <td className="px-4 py-3.5 text-center"><Checkbox className="border-[#1E2730] data-[state=checked]:bg-primary data-[state=checked]:text-black" checked={selectedId === item.id} /></td>
                    <td className="px-3 py-3.5">
                      <span className={cn("rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap", 
                          item.priority === "High" ? "border-critical/30 bg-critical/10 text-critical" :
                          item.priority === "Medium" ? "border-warning/30 bg-warning/10 text-warning" :
                          "border-[#1E2730] bg-[#141B21] text-muted-foreground"
                        )}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 max-w-[280px]">
                      <div className="flex flex-col gap-0.5 pr-4">
                        <span className="font-semibold text-white truncate text-[11px]">
                          {item.title}
                        </span>
                        <span className="truncate text-[9px] text-muted-foreground">
                          {item.sub}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-white tabular-nums text-[11px]">
                          {item.impactStr}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          {item.impactSub}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-white text-[11px]">
                          {item.owner}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          {item.ownerRole}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-white tabular-nums text-[11px]">
                          {item.evidenceDocs}
                        </span>
                        <span className="text-[9px] text-muted-foreground">docs</span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                       <button onClick={() => toast.info("Viewing proof trail")} className="flex items-center gap-1 text-[10px] font-medium text-[#3b82f6] hover:underline whitespace-nowrap">
                         {item.proofTrail} <ArrowUpRight className="size-3" />
                       </button>
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <ApprovalPill state={item.status} />
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={cn("text-[10px]", item.dueUrgent ? "text-critical font-semibold" : "text-white")}
                        >
                          {item.due.split(' ')[0]} {item.due.split(' ')[1] === "overdue" ? "overdue" : ""}
                        </span>
                        {item.due.split(' ').length > 2 && <span className="text-[9px] text-muted-foreground">{item.due.split(' ').slice(1).join(' ')}</span>}
                        {item.due.split(' ').length === 2 && item.due.split(' ')[1] !== "overdue" && <span className="text-[9px] text-muted-foreground">{item.due.split(' ')[1]}</span>}
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-white text-[11px]">
                          {item.agent}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          {item.agentVer}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 flex justify-center">
                      <div className="relative flex size-8 items-center justify-center">
                         <svg viewBox="0 0 36 36" className="absolute inset-0 size-full -rotate-90">
                           <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                           <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--primary)" strokeWidth="4" strokeDasharray={`${item.confidence}, 100`} />
                         </svg>
                         <span className="text-[9px] font-bold leading-none text-white tabular-nums">{item.confidence}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between border-t border-[#1E2730] px-5 py-3 text-[10px] text-muted-foreground shrink-0 bg-[#0A0C0B]">
            <span>Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredItems.length)} of {filteredItems.length} approvals</span>
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
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 font-medium text-white bg-transparent rounded px-2 py-1 transition-colors hover:bg-[#1E2730]">
                    10 / page <ChevronDown className="size-3 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-16 min-w-0 border-[#1E2730] bg-[#0A0C0B] text-muted-foreground">
                    <DropdownMenuItem onClick={() => { setCurrentPage(1); }} className="text-[11px] focus:bg-[#1E2730] focus:text-white">10</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setCurrentPage(1); }} className="text-[11px] focus:bg-[#1E2730] focus:text-white">25</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setCurrentPage(1); }} className="text-[11px] focus:bg-[#1E2730] focus:text-white">50</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          
          {/* Approval Insights */}
          <div className="flex flex-col border-t border-[#1E2730] shrink-0 bg-[#050706]">
            <div className="px-5 py-4 flex flex-col gap-5">
              <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">Approval insights</h3>
              <div className="grid grid-cols-3 gap-8">
                {/* By Category */}
                <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-semibold text-white">Approvals by category</span>
                  <div className="flex items-center gap-6">
                    <div className="relative flex size-20 shrink-0">
                      <svg viewBox="0 0 36 36" className="size-full -rotate-90">
                        {(() => {
                          let offset = 0;
                          return approvalsInsights.byCategory.map((item, i) => {
                            const val = item.pct;
                            const stroke = item.color;
                            const path = <path key={i} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={stroke} strokeWidth="6" strokeDasharray={`${val}, 100`} strokeDashoffset={`-${offset}`} />;
                            offset += val;
                            return path;
                          });
                        })()}
                      </svg>
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      {approvalsInsights.byCategory.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-[9px]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-white truncate">{item.label}</span>
                          </div>
                          <span className="text-muted-foreground tabular-nums shrink-0">{item.value} ({item.pct}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* By Owner */}
                <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-semibold text-white">By owner</span>
                  <div className="flex flex-col gap-2">
                    {approvalsInsights.byOwner.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-[9px]">
                        <span className="text-muted-foreground w-20 truncate">{item.label}</span>
                        <div className="flex-1 h-1.5 bg-[#1E2730] rounded-full overflow-hidden flex items-center">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${(item.value / item.max) * 100}%` }} />
                        </div>
                        <span className="text-white tabular-nums font-bold w-4 text-right">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* By Urgency */}
                <div className="flex flex-col gap-4 pl-4 border-l border-[#1E2730]">
                  <span className="text-[10px] font-semibold text-white">By urgency</span>
                  <div className="flex items-center gap-6">
                    <div className="relative flex size-20 shrink-0">
                      <svg viewBox="0 0 36 36" className="size-full -rotate-90">
                        {(() => {
                          let offset = 0;
                          return approvalsInsights.byUrgency.map((item, i) => {
                            const val = item.pct;
                            const stroke = item.color;
                            const path = <path key={i} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={stroke} strokeWidth="6" strokeDasharray={`${val}, 100`} strokeDashoffset={`-${offset}`} />;
                            offset += val;
                            return path;
                          });
                        })()}
                      </svg>
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      {approvalsInsights.byUrgency.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-[9px]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-white truncate">{item.label}</span>
                          </div>
                          <span className="text-muted-foreground tabular-nums shrink-0">{item.value} ({item.pct}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Detail Panel */}
        {selectedItem && (
          <div className="w-[440px] shrink-0 h-full animate-fade-left">
            <DetailPanel
              item={selectedItem}
              onClose={() => setSelectedId(null)}
              onUpdateState={updateState}
            />
          </div>
        )}
      </div>
    </div>
  );
}
