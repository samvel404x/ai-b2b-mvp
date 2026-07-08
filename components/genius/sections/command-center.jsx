"use client";

import { useState, useEffect, useMemo } from "react";
import { ArrowUpRight, Check, ChevronDown, ChevronRight, Clock, Download, Maximize2, Minus, Plus, X, Zap, FileText, FileSpreadsheet, CheckSquare, ShieldAlert, Bot, User, File, Network, KeyRound, Search, MoreVertical, SlidersHorizontal, Filter } from "lucide-react";
import {
  commandKpis, evidenceGraphNodes, decisionQueue,
  activeAgents, proofBackedFindings, formatCurrencyFull,
} from "@/lib/genius-data";
import { ConfBar, EvidenceLink, Panel, Ring, SeverityBadge, Sparkline, StatePill, StatusDot } from "../shared";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Skeleton, SkeletonCard, SkeletonRow } from "../skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const toneStroke = {
  primary: "var(--primary)", critical: "var(--critical)",
  evidence: "var(--evidence)", warning: "var(--warning)", neutral: "rgba(255,255,255,0.3)",
};
const toneText = {
  primary: "text-primary", critical: "text-critical",
  evidence: "text-evidence", warning: "text-warning", neutral: "text-foreground",
};

// ── KPI Card ─────────────────────────────────────────────────────────────────
const kpiIcons = {
  "Business health": null, // Uses Ring
  "Money at risk": ShieldAlert,
  "Savings potential": Zap, // Or a custom trend icon
  "Evidence coverage": Network,
  "AI confidence": Bot,
  "Approval queue": KeyRound, // Key icon
  "Report readiness": FileText,
};

function HexagonIcon({ tone, Icon }) {
  const color = toneStroke[tone] || toneStroke.neutral;
  return (
    <div className="relative flex size-[42px] items-center justify-center">
      <svg className="absolute inset-0 size-full" viewBox="0 0 42 42" fill="none">
        <path d="M21 2L39 12V30L21 40L3 30V12L21 2Z" fill={`${color}10`} stroke={color} strokeWidth="1.5" strokeOpacity="0.5" />
      </svg>
      {Icon && <Icon className="relative z-10 size-4" style={{ color }} />}
    </div>
  );
}

function AnimatedNumber({ value }) {
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    let startTimestamp = null;
    const duration = 1500;
    const strVal = String(value);
    const numMatch = strVal.replace(/,/g, '').match(/\d+/);
    
    if (!numMatch) {
      setDisplayValue(value);
      return;
    }
    
    const target = parseInt(numMatch[0], 10);
    const hasComma = strVal.includes(',');
    const prefixMatch = strVal.match(/^[^\d]+/);
    const suffixMatch = strVal.match(/[^\d]+$/);
    const prefix = prefixMatch ? prefixMatch[0] : '';
    const suffix = suffixMatch ? suffixMatch[0] : '';

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(easeProgress * target);
      
      let formatted = current.toString();
      if (hasComma) {
        formatted = current.toLocaleString('en-US');
      }
      
      setDisplayValue(`${prefix}${formatted}${suffix}`);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };
    window.requestAnimationFrame(step);
  }, [value]);

  return <>{displayValue}</>;
}

function KpiCard({ label, value, unit, trend, trendDir, tone = "neutral", sub, subTone, spark, ring, index = 0, loading = false }) {
  const up = trendDir === "up";
  const subToneClass = { primary: "text-primary", critical: "text-critical", warning: "text-warning" }[subTone] || "text-muted-foreground";
  const Icon = kpiIcons[label];

  if (loading) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-[#ffffff08] bg-[#0A0C0B] p-4">
        <Skeleton className="h-2 w-16 rounded bg-[#ffffff08]" />
        <Skeleton className="h-6 w-20 rounded bg-[#ffffff08]" />
        <Skeleton className="h-1.5 w-full rounded bg-[#ffffff08]" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative flex animate-fade-up flex-col justify-between overflow-hidden rounded-xl border border-[#1E2730] bg-[#0A0C0B] p-3 transition-all duration-300 hover:border-[#ffffff18] hover:bg-[#0d0f0e]",
      )}
      style={{ animationDelay: `${index * 55}ms` }}
    >
      <div className="flex items-start gap-3 relative z-10">
        {/* Left Icon / Ring */}
        <div className="shrink-0 pt-0.5">
          {ring ? (
            <Ring value={typeof value === "number" ? value : 72} size={44} stroke={toneStroke[tone]} hideLabel />
          ) : (
            <HexagonIcon tone={tone} Icon={Icon} />
          )}
        </div>

        {/* Right Content */}
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[8.5px] font-semibold text-muted-foreground uppercase tracking-widest leading-none mb-1.5 truncate">{label}</span>
          <div className="flex items-baseline gap-0.5 mb-1.5">
            <span className="text-[17px] font-bold tracking-tight tabular leading-none text-white">
              <AnimatedNumber value={value} />
            </span>
            {unit && <span className="text-[10px] font-medium text-muted-foreground">{unit}</span>}
          </div>
          
          <div className="flex flex-col gap-0.5">
            {trend && (
              <span className={cn("text-[9px] font-medium flex items-center gap-0.5 whitespace-nowrap", up && tone === "critical" ? "text-critical" : up ? "text-primary" : "text-muted-foreground")}>
                <span className="text-[8px]">{up ? "↑" : "↓"}</span>
                {trend.replace(/[-+↑↓]/g, "").trim()}
                <span className="text-muted-foreground/70 font-normal ml-0.5">vs last 7 days</span>
              </span>
            )}
            {sub && <span className={cn("text-[9px] font-semibold", subToneClass)}>{sub}</span>}
          </div>
        </div>
      </div>

      {spark && (
        <div className="absolute inset-x-0 bottom-0 top-6 opacity-30 pointer-events-none -mx-2 overflow-hidden flex items-end">
          <Sparkline data={spark} stroke={toneStroke[tone]} className="h-12 w-full" />
        </div>
      )}
    </div>
  );
}

// ── Evidence Graph ─────────────────────────────────────────────────────────────
const colConfig = [
  { key: "sourceEvidence",  label: "Source Evidence",  color: "var(--evidence)", bg: "rgba(56,189,248,0.06)", border: "rgba(56,189,248,0.15)" },
  { key: "extractedFacts",  label: "Extracted Facts",  color: "var(--foreground)", bg: "rgba(248,250,251,0.03)", border: "rgba(248,250,251,0.08)" },
  { key: "diagnosticRisks", label: "Diagnostic Risks", color: "var(--critical)", bg: "rgba(239,68,68,0.06)",   border: "rgba(239,68,68,0.15)" },
  { key: "agentActions",    label: "Agent Actions",    color: "var(--warning)", bg: "rgba(245,158,11,0.06)",  border: "rgba(245,158,11,0.12)" },
  { key: "humanApprovals",  label: "Human Approvals",  color: "var(--primary)", bg: "rgba(16,185,129,0.06)",  border: "rgba(16,185,129,0.12)" },
  { key: "boardReports",    label: "Board Reports",    color: "var(--primary)", bg: "rgba(16,185,129,0.04)",  border: "rgba(16,185,129,0.08)" },
];

const iconMap = {
  pdf: FileText,
  excel: FileSpreadsheet,
  fact: CheckSquare,
  risk: ShieldAlert,
  agent: Bot,
  user: User,
  report: File,
};

function EvidenceGraph({ loading = false }) {
  if (loading) {
    return (
      <div className="flex min-w-[960px] items-start gap-0">
        {colConfig.map((col, ci) => (
          <div key={col.key} className="flex flex-1 items-start">
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex flex-col items-center gap-1 pb-2">
                <Skeleton className="h-3 w-20 rounded bg-[#ffffff08]" />
                <Skeleton className="h-5 w-8 rounded bg-[#ffffff08]" />
              </div>
              <div className="flex flex-col gap-2 px-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg bg-[#ffffff08]" />
                ))}
              </div>
            </div>
            {ci < colConfig.length - 1 && (
              <div className="flex items-start pt-12 px-1">
                <div className="h-4 w-px bg-[#ffffff08]" />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  const nodes = evidenceGraphNodes;
  const numCols = colConfig.length;
  const colWidth = 210;
  const cardWidth = 180;
  
  return (
    <div className="overflow-x-auto scrollbar-thin relative pb-4">
      {/* SVG Connections */}
      <svg className="absolute inset-0 pointer-events-none z-0" style={{ minWidth: 1260, height: "100%" }}>
        {colConfig.slice(0, numCols - 1).map((_, ci) => {
          return Array.from({ length: 4 }).map((_, r1) => {
            return Array.from({ length: 4 }).map((_, r2) => {
              if (Math.abs(r1 - r2) > 1 && !(r1===0 && r2===3)) return null;
              
              const startX = ci * colWidth + cardWidth - 4;
              const endX = (ci + 1) * colWidth + 4;
              const startY = 64 + r1 * 56 + 28;
              const endY = 64 + r2 * 56 + 28;
              
              const d = `M ${startX} ${startY} C ${startX + 20} ${startY}, ${endX - 20} ${endY}, ${endX} ${endY}`;
              const isGlowing = r1 === 0 && r2 === 0;
              const glowOpacity = isGlowing ? 0.6 : 0.15;
              const strokeWidth = isGlowing ? 1.5 : 1;
              
              return (
                <path key={`${ci}-${r1}-${r2}`} d={d} fill="none" stroke={isGlowing ? colConfig[ci].color : "rgba(255,255,255,1)"} strokeOpacity={glowOpacity} strokeWidth={strokeWidth} />
              );
            });
          });
        })}
      </svg>

      <div className="relative z-10 flex min-w-[1260px] items-start gap-0">
        {colConfig.map((col, ci) => {
          const data = nodes[col.key];
          return (
            <div key={col.key} className="flex flex-col" style={{ width: colWidth }}>
              <div className="flex flex-col items-center gap-0.5 pb-4 w-[180px]">
                <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: col.color }}>
                  {data.label}
                </span>
                <span className="text-sm font-bold tabular text-white">{data.count.toLocaleString("en-US")}</span>
              </div>
              <div className="flex flex-col gap-2.5 px-1 w-[180px]">
                {data.items.map((item, i) => {
                  const Icon = iconMap[item.icon] || FileText;
                  
                  return (
                    <div
                      key={i}
                      className="group cursor-pointer rounded-lg border px-2.5 py-2 transition-all duration-300 relative overflow-visible bg-[#0A0C0B]"
                      style={{ 
                        borderColor: col.color,
                        borderWidth: "1px"
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 shrink-0" style={{ color: col.color }}>
                          <Icon className="size-3.5" />
                        </div>
                        <div className="flex-1 min-w-0 pr-1">
                          <span className="line-clamp-2 text-[11px] font-medium text-white leading-tight block pb-1">
                            {item.label}
                          </span>
                          <div className="flex items-center justify-between">
                            <span className="truncate text-[9.5px] font-medium text-muted-foreground">
                              {item.sub}
                            </span>
                          </div>
                          {item.status && (
                            <div className="mt-1.5 flex items-center gap-1.5">
                              {item.status === "In progress" && <StatusDot tone="primary" />}
                              {item.status === "Queued" && <StatusDot tone="warning" />}
                              <span className={cn("text-[9.5px] font-medium", item.status === "In progress" ? "text-primary" : "text-muted-foreground")}>
                                {item.status}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Confidence/Score Badge attached to right edge */}
                      {item.score !== undefined && item.score !== null && (
                        <div 
                          className="absolute -right-2 top-1/2 -translate-y-1/2 size-4 rounded-full border border-[#1E2730] flex items-center justify-center bg-[#050706] shadow-sm z-10"
                        >
                          <span className="text-[8px] font-bold tabular" style={{ color: col.color }}>{item.score}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
                <button type="button" className="py-1 mt-1 text-center text-[10px] font-medium text-muted-foreground transition-colors hover:text-white">
                  {ci === 0 ? "+ 90 more sources" : ci === 1 ? "+ 2,837 more facts" : ci === 2 ? "+ 30 more risks" : ci === 3 ? "+ 83 more actions" : ci === 4 ? "+ 20 more" : "+ 8 more"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-5 flex items-center gap-5 px-3 text-[10px] font-medium text-muted-foreground relative z-10">
        {[
          { color: "var(--evidence)", label: "Evidence" },
          { color: "var(--foreground)", label: "Fact" },
          { color: "var(--critical)", label: "Risk" },
          { color: "var(--warning)", label: "Agent Action" },
          { color: "var(--primary)", label: "Approval / Report" },
        ].map(l => (
          <span key={l.label} className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full" style={{ background: l.color, boxShadow: `0 0 6px ${l.color}` }} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Decision Queue Item ────────────────────────────────────────────────────────
function DecisionItem({ item, onApprove, onReject, loading = false }) {
  const priorityStyle = {
    High:   "border-critical/25 text-critical",
    Medium: "border-warning/25 text-warning",
    Low:    "border-evidence/25 text-evidence",
  }[item.priority] || "border-border text-muted-foreground";

  if (loading) {
    return (
      <div className="rounded-xl border border-[#1E2730] bg-[#0A0C0B] p-4 flex">
        <div className="flex-1">
          <Skeleton className="h-4 w-16 rounded-full bg-[#ffffff08] mb-2" />
          <Skeleton className="mb-2 h-4 w-full rounded bg-[#ffffff08]" />
          <Skeleton className="h-3 w-3/4 rounded bg-[#ffffff08]" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#1E2730] bg-[#0A0C0B] transition-colors hover:bg-[#141B21] flex p-3">
      <div className="flex-1 min-w-0 pr-3">
        <span className={cn("inline-block rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest mb-2", priorityStyle)}>
          {item.priority}
        </span>
        <p className="text-xs font-semibold text-white leading-snug mb-1">{item.title}</p>
        <p className="text-[10px] text-muted-foreground">{item.sub}</p>
        
        <div className="mt-4 flex items-start gap-4">
          <div className="flex flex-col gap-0.5 min-w-[70px]">
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Impact</span>
            <span className="text-xs font-bold text-white tabular">{formatCurrencyFull(item.impact)}</span>
          </div>
          <div className="flex flex-col gap-0.5 min-w-[60px]">
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Due</span>
            <span className={cn("text-xs font-semibold tabular", item.due?.includes("overdue") ? "text-critical" : "text-warning")}>
              {item.due}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 min-w-[70px]">
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Requested By</span>
            <span className="text-xs text-muted-foreground truncate">{item.requestedBy}</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-2 shrink-0 justify-start w-[72px] border-l border-[#1E2730] pl-3">
        <button
          type="button"
          onClick={() => onApprove(item)}
          className="w-full rounded bg-primary py-1.5 text-[10px] font-bold text-[#050505] transition-colors hover:bg-primary/90"
        >
          Approve
        </button>
        <button type="button" onClick={() => toast.info("Editing decision item...")} className="w-full rounded border border-[#1E2730] bg-transparent py-1.5 text-[10px] font-semibold text-muted-foreground transition-colors hover:bg-white/5 hover:text-white">Edit</button>
        <button type="button" onClick={() => onReject(item)} className="w-full rounded border border-critical/50 bg-transparent py-1.5 text-[10px] font-semibold text-critical transition-colors hover:bg-critical/10">Reject</button>
      </div>
    </div>
  );
}

// ── Approval State Pill ────────────────────────────────────────────────────────
function ApprovalPill({ state }) {
  const s = {
    "Open":        "bg-primary/10 text-primary border border-primary/20",
    "In progress": "bg-evidence/10 text-evidence border border-evidence/20",
    "Review":      "bg-warning/10 text-warning border border-warning/20",
  }[state] || "bg-secondary text-muted-foreground border border-border";
  return <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-semibold", s)}>{state}</span>;
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function CommandCenter({ onNavigate }) {
  const [queueItems, setQueueItems] = useState(decisionQueue);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // Reset to page 1 when search changes
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };


  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  function handleApprove(item) {
    setQueueItems(prev => prev.filter(i => i.id !== item.id));
    toast.success(`Approved: ${item.title}`, { description: `${formatCurrencyFull(item.impact)} committed` });
  }
  function handleReject(item) {
    setQueueItems(prev => prev.filter(i => i.id !== item.id));
    toast.error(`Rejected: ${item.title}`);
  }

  // Create mock findings dataset — 23 rows seeded from base data
  const baseFindings = useMemo(() => Array.from({ length: 23 }).map((_, i) => ({
    ...proofBackedFindings[i % proofBackedFindings.length],
    id: `finding-${i}`,
    title: proofBackedFindings[i % proofBackedFindings.length].title + (i >= proofBackedFindings.length ? ` (${i+1})` : ''),
  })), []);
  
  const filteredFindings = useMemo(() => searchQuery.trim()
    ? baseFindings.filter(f =>
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.owner && f.owner.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : baseFindings, [searchQuery, baseFindings]);
    
  const totalFindings = filteredFindings.length;
  const totalPages = Math.max(1, Math.ceil(totalFindings / rowsPerPage));
  const clampedPage = Math.min(currentPage, totalPages);
  const startIndex = (clampedPage - 1) * rowsPerPage;
  const currentFindings = useMemo(() => filteredFindings.slice(startIndex, startIndex + rowsPerPage), [filteredFindings, startIndex, rowsPerPage]);


  return (
    <div className="flex flex-col gap-6">
      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        {loading
          ? Array.from({ length: 7 }).map((_, i) => <SkeletonCard key={i} />)
          : commandKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} index={i} {...kpi} unit={kpi.unit} />
          ))
        }
      </div>

      {/* 2-Column Grid for Graph/Findings and Queue/Agents */}
      <div className="grid gap-4 xl:grid-cols-[1fr_360px] items-start">
        
        {/* Left Column: Evidence Graph & Findings */}
        <div className="flex flex-col gap-5 min-w-0">
          <Panel
            title="EVIDENCE GRAPH"
            titleClassName="uppercase tracking-widest text-[11px] text-white"
            actions={
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-primary">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-1.5 animate-ping rounded-full bg-primary opacity-50" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
                  </span>
                  Live
                </span>
                <span className="hidden text-[10px] text-muted-foreground lg:inline border-l border-[#1E2730] pl-4">How your data becomes decisions</span>
              </div>
            }
          >
            <EvidenceGraph loading={loading} />
          </Panel>

          <Panel
            title="PROOF-BACKED FINDINGS (23)"
            titleClassName="uppercase tracking-widest text-[11px] text-white"
            contentClassName="p-0 flex flex-col min-h-0"
            actions={
              <div className="flex items-center gap-3">
                <div className="relative hidden md:flex items-center">
                  <Search className="absolute left-2.5 size-3.5 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Search findings..." 
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="h-7 w-[160px] rounded-md border border-[#1E2730] bg-[#141B21] pl-8 pr-3 text-[11px] text-white placeholder-muted-foreground focus:border-primary/50 focus:bg-[#1A232A] outline-none transition-all"
                  />
                </div>
                <div className="h-4 w-px bg-[#1E2730] hidden md:block" />
                <Button variant="ghost" size="sm" className="text-evidence hover:text-evidence/80 text-[10px] font-semibold h-7 px-2" onClick={() => onNavigate("savings")}>
                  View all findings <ArrowUpRight className="size-3 ml-1" />
                </Button>
              </div>
            }
          >
            <div className="flex flex-col flex-1 min-h-0 overflow-x-auto scrollbar-thin">
              {loading ? (
                <div className="flex flex-col">
                  {Array.from({ length: rowsPerPage }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-[#1E2730]/50 last:border-b-0">
                      <Skeleton className="h-2 w-2 rounded-full shrink-0" />
                      <Skeleton className="h-4 flex-1 rounded bg-[#ffffff08]" />
                      <Skeleton className="h-4 w-20 rounded bg-[#ffffff08]" />
                      <Skeleton className="h-4 w-24 rounded bg-[#ffffff08]" />
                      <Skeleton className="h-4 w-16 rounded bg-[#ffffff08]" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-[900px]">
                    <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#1E2730]">
                        {["Risk / Finding", "Category", "Source evidence", "Impact", "Confidence", "Owner", "Agent action", "Approval state"].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-[9px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">{h}</th>
                        ))}
                        <th className="px-5 py-3 text-right"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentFindings.map((f, idx) => {
                        const catStyle = {
                          Contracts: "border-[#1E2730] text-muted-foreground bg-[#141B21]",
                          Spend: "border-warning/30 text-warning bg-warning/10",
                          Finance: "border-critical/30 text-critical bg-critical/10",
                          Forecast: "border-evidence/30 text-evidence bg-evidence/10"
                        }[f.category] || "border-[#1E2730] text-muted-foreground bg-[#141B21]";

                        return (
                        <tr
                          key={f.id}
                          className={cn("cursor-pointer border-b border-[#1E2730]/50 transition-colors hover:bg-white/5", idx === currentFindings.length - 1 && "border-b-0")}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              <span className={cn("size-2 shrink-0 rounded-full", f.severity === "High" || f.severity === "Critical" ? "bg-critical" : f.severity === "Medium" ? "bg-warning" : "bg-evidence")} />
                              <span className="text-[11px] font-medium text-white whitespace-nowrap">{f.title}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={cn("rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest", catStyle)}>{f.category}</span>
                          </td>
                          <td className="px-5 py-4 max-w-[160px]">
                            <EvidenceLink>{f.evidence}</EvidenceLink>
                          </td>
                          <td className="px-5 py-4">
                            <span className={cn("text-xs font-semibold tabular whitespace-nowrap", f.impact < 0 ? "text-critical" : "text-white")}>
                              {typeof f.impact === "number" ? formatCurrencyFull(Math.abs(f.impact)) : f.impact}
                            </span>
                          </td>
                          <td className="px-5 py-4 min-w-[100px]">
                            <ConfBar value={f.confidence} />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-white whitespace-nowrap">{f.owner.split(' / ')[0]}</span>
                              <span className="text-[9px] text-muted-foreground whitespace-nowrap">{f.owner.split(' / ')[1]}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-[10px] text-muted-foreground max-w-[160px]">
                            <div className="whitespace-pre-line leading-tight">{f.agentAction}</div>
                          </td>
                          <td className="px-5 py-4">
                            <ApprovalPill state={f.approvalState} />
                          </td>
                          <td className="px-5 py-4 text-right">
                            <DropdownMenu>
    <DropdownMenuTrigger className="flex size-6 items-center justify-center rounded hover:bg-[#141B21] text-muted-foreground hover:text-white outline-none">
      <MoreVertical className="size-3.5" />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-48 bg-[#0A0C0B] border-[#1E2730] text-white p-1">
      <DropdownMenuItem className="text-xs cursor-pointer focus:bg-[#141B21] focus:text-white rounded-md mb-0.5"><Search className="size-3.5 mr-2 opacity-70"/> Inspect Evidence</DropdownMenuItem>
      <DropdownMenuItem className="text-xs cursor-pointer focus:bg-[#141B21] focus:text-white rounded-md mb-0.5"><Check className="size-3.5 mr-2 opacity-70"/> Quick Approve</DropdownMenuItem>
      <div className="h-px w-full bg-[#1E2730] my-1" />
      <DropdownMenuItem className="text-xs cursor-pointer focus:bg-critical/10 focus:text-critical text-critical rounded-md"><ShieldAlert className="size-3.5 mr-2 opacity-70"/> Flag as False Positive</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  </div>
                  <div className="mt-auto shrink-0 border-t border-[#1E2730] px-5 py-3 text-[10px] text-muted-foreground flex items-center justify-between min-w-[900px]">
                    <span>Showing {Math.min(startIndex + 1, totalFindings)} to {Math.min(startIndex + rowsPerPage, totalFindings)} of {totalFindings} findings</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} className="flex items-center justify-center size-5 rounded hover:bg-[#141B21]">&lt;</button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => (
                        <button 
                          key={i} 
                          onClick={() => setCurrentPage(i + 1)}
                          className={cn("flex items-center justify-center size-5 rounded", currentPage === i + 1 ? "bg-primary/20 text-primary font-bold" : "hover:bg-[#141B21]")}
                        >
                          {i + 1}
                        </button>
                      ))}
                      
                      {totalPages > 5 && <span>...</span>}
                      
                      <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} className="flex items-center justify-center size-5 rounded hover:bg-[#141B21]">&gt;</button>
                      
                      <span className="ml-4">Rows per page:</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-1.5 rounded border border-[#1E2730] bg-[#141B21] px-2 py-0.5 text-[10px] text-white transition-colors hover:bg-[#1E2730]">
                          {rowsPerPage} <ChevronDown className="size-3 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[4rem] border-[#1E2730] bg-[#0A0C0B]">
                          {[5, 10, 20].map((num) => (
                            <DropdownMenuItem
                              key={num}
                              className="cursor-pointer text-[10px] text-muted-foreground focus:bg-[#141B21] focus:text-white"
                              onClick={() => { setRowsPerPage(num); setCurrentPage(1); }}
                            >
                              {num}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Panel>
        </div>

        {/* Right Column: Decision Queue & Agents */}
        <div className="flex flex-col gap-5 min-w-0">
          <Panel
            title="DECISION QUEUE"
            titleClassName="uppercase tracking-widest text-[11px] text-white flex items-center gap-2"
            description={<span className="rounded-full bg-critical px-1.5 py-0.5 text-[9px] font-bold text-white shadow-[0_0_8px_rgba(239,68,68,0.5)]">135</span>}
            contentClassName="p-0"
            actions={
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-warning">{queueItems.length} pending</span>
                <Button variant="ghost" size="sm" className="text-evidence hover:text-evidence/80 text-[10px] font-semibold h-7 px-2" onClick={() => onNavigate("approvals")}>
                  View all <ArrowUpRight className="size-3 ml-1" />
                </Button>
              </div>
            }
          >
            <div className="flex flex-col gap-3 p-4">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
                : queueItems.slice(0, 4).map(item => (
                  <DecisionItem key={item.id} item={item} onApprove={handleApprove} onReject={handleReject} />
                ))
              }
              {!loading && queueItems.length > 4 && (
                <button
                  type="button"
                  className="py-1.5 text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => onNavigate("approvals")}
                >
                  + {queueItems.length - 4} more pending
                </button>
              )}
            </div>
          </Panel>

          <Panel
            title="ACTIVE SUPERVISED AGENTS"
            titleClassName="uppercase tracking-widest text-[11px] text-white flex items-center gap-1.5"
            description={<Bot className="size-3.5 text-muted-foreground" />}
            contentClassName="p-0"
            actions={
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-primary font-medium">5 of 5 running</span>
                <Button variant="ghost" size="sm" className="text-evidence hover:text-evidence/80 text-[10px] font-semibold h-7 px-2" onClick={() => onNavigate("agents")}>
                  View all <ArrowUpRight className="size-3 ml-1" />
                </Button>
              </div>
            }
          >
          {loading ? (
            <div className="flex flex-col gap-3 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-8 w-8 rounded-full bg-[#ffffff08]" />
                  <div className="flex-1">
                    <Skeleton className="h-3 w-24 rounded mb-1.5 bg-[#ffffff08]" />
                    <Skeleton className="h-2 w-16 rounded bg-[#ffffff08]" />
                  </div>
                  <Skeleton className="h-3 w-8 rounded bg-[#ffffff08]" />
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-[1fr_80px_80px_60px_60px] gap-2 border-b border-[#1E2730] px-4 py-2.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                <span>Agent</span>
                <span>Status</span>
                <span>Workload</span>
                <span>Last Run</span>
                <span className="text-right">Actions Today</span>
              </div>
              {activeAgents.map((agent, i) => (
                <div
                  key={agent.id}
                  className={cn(
                    "grid grid-cols-[1fr_80px_80px_60px_60px] items-center gap-2 px-4 py-3.5 transition-colors hover:bg-white/5",
                    i < activeAgents.length - 1 && "border-b border-[#1E2730]/50",
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="size-4 rounded border border-[#1E2730] flex items-center justify-center bg-[#141B21] shrink-0">
                      <Bot className="size-2.5 text-muted-foreground" />
                    </div>
                    <span className="truncate text-[11px] font-medium text-white">{agent.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StatusDot tone={agent.status} />
                    <span className={cn("text-[10px] font-medium", agent.status === "Active" ? "text-primary" : agent.status === "Waiting" ? "text-warning" : "text-critical")}>
                      {agent.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#1E2730]">
                      <div
                        className={cn("h-full rounded-full transition-all duration-500", agent.status === "Active" ? "bg-primary" : "bg-warning")}
                        style={{ width: `${agent.workload}%` }}
                      />
                    </div>
                    <span className="text-[9px] tabular text-muted-foreground w-6 shrink-0 text-right">{agent.workload}%</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{agent.lastRun}</span>
                  <span className="text-[11px] font-bold tabular text-white text-right pr-2">{agent.actionsToday}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  </div>
  );
}