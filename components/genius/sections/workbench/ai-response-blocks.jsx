"use client";

import { cn } from "@/lib/utils";
import { FileText, Copy, Check, BarChart3, TrendingUp, CheckCircle2, ShieldCheck, ShieldAlert, AlertTriangle, ArrowUpRight, ChevronRight, Database, Settings, Sparkles, GitMerge, Download, Share2, Save, LayoutTemplate, MoreHorizontal, ChevronDown } from "lucide-react";
import { NegotiationPlanDrawer } from "./drawers/negotiation-plan-drawer";
import { ApprovalWorkflowDialog } from "./drawers/approval-workflow-dialog";
import { CompareAlternativesModal } from "./drawers/compare-alternatives-modal";
import { ExecutiveSummaryDrawer } from "./drawers/executive-summary-drawer";
import { workbenchMockData } from "./workbench-mock-data";
import { useState } from "react";
import { toast } from "sonner";

export function ExecutiveSummary() {
  const { text } = workbenchMockData.executiveSummary;
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#28313C] bg-[#141A22] p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck className="size-4 text-primary" />
        <span className="text-xs font-bold uppercase tracking-widest text-primary">Executive Summary</span>
      </div>
      <p className="text-[15px] leading-relaxed text-white/90">{text}</p>
    </div>
  );
}

export function QuickMetrics() {
  const { totalRisk, potentialSavings, riskDelta, savingsDelta } = workbenchMockData.executiveSummary;
  const { kpis } = workbenchMockData;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="flex flex-col rounded-xl border border-[#28313C] bg-[#141A22] p-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <AlertTriangle className="size-10 text-critical" />
        </div>
        <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1 relative z-10">Total Risk Exposure</div>
        <div className="text-2xl font-bold text-critical relative z-10">{totalRisk}</div>
        <div className="text-[11px] text-critical/80 mt-1 relative z-10 font-medium">{riskDelta} vs Last Year</div>
      </div>
      <div className="flex flex-col rounded-xl border border-[#28313C] bg-[#141A22] p-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <TrendingUp className="size-10 text-primary" />
        </div>
        <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1 relative z-10">Potential Savings</div>
        <div className="text-2xl font-bold text-primary relative z-10">{potentialSavings}</div>
        <div className="text-[11px] text-primary/80 mt-1 relative z-10 font-medium">{savingsDelta} achievable</div>
      </div>
      <div className="flex flex-col rounded-xl border border-[#28313C] bg-[#141A22] p-4 shadow-sm">
        <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">AI Confidence</div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white">{kpis.aiConfidence}%</span>
          <span className="text-[11px] text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded uppercase tracking-wider">High</span>
        </div>
        <div className="text-[11px] text-muted-foreground mt-1">Based on 4 primary sources</div>
      </div>
      <div className="flex flex-col rounded-xl border border-[#28313C] bg-[#141A22] p-4 shadow-sm">
        <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Sources Analyzed</div>
        <div className="text-2xl font-bold text-white">{kpis.evidenceSources}</div>
        <div className="text-[11px] text-evidence/80 mt-1 font-medium">Fully verified</div>
      </div>
    </div>
  );
}

export function RiskBreakdownChart() {
  const data = workbenchMockData.riskBreakdown;
  
  return (
    <div className="flex flex-col h-full gap-4 rounded-xl border border-[#28313C] bg-[#141A22] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-4 text-warning" />
          <span className="text-xs font-bold uppercase tracking-widest text-white">Risk Breakdown</span>
        </div>
        <span className="text-[11px] text-muted-foreground">Impact in Millions (USD)</span>
      </div>
      
      <div className="flex h-8 w-full overflow-hidden rounded-lg shadow-inner">
        {data.map((item, i) => (
          <div 
            key={i} 
            className="h-full border-r border-[#141A22] last:border-0 hover:brightness-110 transition-all cursor-crosshair"
            style={{ width: `${item.percent}%`, backgroundColor: item.color }}
            title={`${item.label}: $${item.value}M`}
          />
        ))}
      </div>
      
      <div className="flex flex-col gap-y-3 mt-4 flex-1 justify-center">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <span className="size-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
              <span className="text-[13px] text-white/90 group-hover:text-white transition-colors">{item.label}</span>
            </div>
            <span className="text-[13px] font-bold text-white">${item.value}M</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TopRiskDrivers() {
  const data = workbenchMockData.topRiskDrivers;
  return (
    <div className="flex flex-col h-full gap-3 rounded-xl border border-[#28313C] bg-[#141A22] p-5 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-widest text-white mb-2">Top Risk Drivers</div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead className="text-muted-foreground border-b border-[#28313C]">
            <tr>
              <th className="px-2 pb-3 font-medium">Driver</th>
              <th className="px-2 pb-3 font-medium">Impact</th>
              <th className="px-2 pb-3 font-medium">Confidence</th>
              <th className="px-2 pb-3 font-medium">Evidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#28313C]/50">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-[#28313C]/50 transition-colors group cursor-default">
                <td className="px-2 py-3.5 font-medium text-white group-hover:text-primary transition-colors">{row.driver}</td>
                <td className="px-2 py-3.5 text-critical font-bold">{row.impact}</td>
                <td className="px-2 py-3.5">
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                    row.confidenceTone === 'primary' ? "bg-primary/10 text-primary border border-primary/20" : "bg-warning/10 text-warning border border-warning/20"
                  )}>
                    {row.confidence}
                  </span>
                </td>
                <td className="px-2 py-3.5 text-muted-foreground">
                  <div className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors w-fit">
                    <FileText className="size-3.5" /> <span className="truncate max-w-[120px]">{row.evidence}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function MarketBenchmark() {
  const data = workbenchMockData.marketBenchmark;
  return (
    <div className="flex flex-col h-full gap-3 rounded-xl border border-[#28313C] bg-[#141A22] p-5 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-widest text-white mb-2">Market Benchmark Comparison</div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead className="text-muted-foreground border-b border-[#28313C]">
            <tr>
              <th className="px-2 pb-3 font-medium">Category</th>
              <th className="px-2 pb-3 font-medium">Your Terms</th>
              <th className="px-2 pb-3 font-medium">Market Benchmark</th>
              <th className="px-2 pb-3 font-medium">Variance</th>
              <th className="px-2 pb-3 font-medium">Value at Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#28313C]/50">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-[#28313C]/50 transition-colors group cursor-default">
                <td className="px-2 py-3.5 font-medium text-white group-hover:text-primary transition-colors">{row.category}</td>
                <td className="px-2 py-3.5 text-white/80">{row.yourTerms}</td>
                <td className="px-2 py-3.5 text-white/80">{row.benchmark}</td>
                <td className="px-2 py-3.5 text-critical font-medium">{row.variance}</td>
                <td className="px-2 py-3.5 text-critical font-bold">{row.risk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Recommendations({ onAction }) {
  const data = workbenchMockData.recommendations;
  const actionByIndex = ["Create negotiation plan", "Start approval workflow", "Compare Alternatives"];

  return (
    <div className="flex flex-col h-full gap-4 rounded-xl border border-[#28313C] bg-[#141A22] p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp className="size-4 text-primary" />
        <span className="text-xs font-bold uppercase tracking-widest text-white">Recommended Actions</span>
      </div>
      <div className="flex flex-col gap-3 flex-1 justify-center">
        {data.map((rec, i) => (
          <button key={i} type="button" onClick={() => onAction?.(actionByIndex[i] || "Compare Alternatives")} className="flex items-center justify-between rounded-lg border border-[#28313C] bg-[#0E1116] px-4 py-3.5 text-left hover:border-primary/50 transition-colors group cursor-pointer shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-7 items-center justify-center rounded-full bg-[#28313C] text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                <CheckCircle2 className="size-4" />
              </div>
              <span className="text-[14px] font-medium text-white">{rec.title}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[13px] font-bold text-primary bg-primary/10 px-2 py-1 rounded">Save {rec.impact}</span>
              <ChevronRight className="size-4.5 text-muted-foreground group-hover:text-white transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ResponseActionBar({ onAction }) {
  const [copied, setCopied] = useState(false);
  const copyAnalysis = async () => {
    const summary = [
      workbenchMockData.executiveSummary.text,
      `Total risk: ${workbenchMockData.executiveSummary.totalRisk}`,
      `Potential savings: ${workbenchMockData.executiveSummary.potentialSavings}`,
      ...workbenchMockData.recommendations.map((item) => `- ${item.title}: ${item.impact}`),
    ].join("\n");

    try {
      await navigator.clipboard.writeText(summary);
      toast.success("Analysis copied");
    } catch {
      toast.info("Clipboard is unavailable in this browser session.");
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="flex flex-wrap items-center gap-3 mt-4">
      <button 
        type="button"
        onClick={() => onAction("Create negotiation plan")}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
      >
        <ShieldCheck className="size-4" /> Create negotiation plan
      </button>
      <button 
        type="button"
        onClick={() => onAction("Open evidence map")}
        className="flex items-center gap-2 rounded-lg border border-[#28313C] bg-[#141A22] px-4 py-2.5 text-[13px] font-medium text-white hover:bg-[#28313C] transition-colors shadow-sm"
      >
        <FileText className="size-4 text-evidence" /> Open evidence map
      </button>
      <button
        type="button"
        onClick={() => onAction("Draft executive summary")}
        className="flex items-center gap-2 rounded-lg border border-[#28313C] bg-[#141A22] px-4 py-2.5 text-[13px] font-medium text-white hover:bg-[#28313C] transition-colors shadow-sm"
      >
        <LayoutTemplate className="size-4 text-primary" /> Draft summary
      </button>
      <button
        type="button"
        onClick={() => onAction("Compare Alternatives")}
        className="flex items-center gap-2 rounded-lg border border-[#28313C] bg-[#141A22] px-4 py-2.5 text-[13px] font-medium text-white hover:bg-[#28313C] transition-colors shadow-sm"
      >
        <GitMerge className="size-4 text-warning" /> Compare
      </button>
      
      <div className="flex-1" />
      
      <button 
        type="button"
        onClick={copyAnalysis}
        className="flex items-center gap-2 rounded-lg border border-[#28313C] bg-transparent px-3 py-2.5 text-[13px] font-medium text-muted-foreground hover:text-white hover:bg-[#141A22] transition-colors"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />} 
        {copied ? "Copied" : "Copy analysis"}
      </button>
    </div>
  );
}

export function FullAiResponse({ onNavigate, onSaveArtifact, canSaveArtifacts = true, busy = false }) {
  const [activeModal, setActiveModal] = useState(null);
  const handleAction = (action) => {
    if (action === "Open evidence map") {
      onNavigate?.("data", { source: "ai-workbench-evidence-map" });
      return;
    }
    setActiveModal(action);
  };
  
  return (
    <div className="flex flex-col gap-2 w-full max-w-none animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded border border-[#4EA1FF]/50 bg-[#0f1f3d] shadow-sm">
          <ShieldCheck className="size-4 text-[#4EA1FF]" fill="currentColor" />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="text-[14px] font-bold text-white">GENIUS <span className="font-normal text-muted-foreground">(Gemini 1.5 Pro)</span></span>
            <span className="text-[11px] text-muted-foreground">Just now</span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 ml-2">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-1.5 animate-ping rounded-full bg-primary opacity-50" />
                <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
              </span>
              Using workspace data
            </span>
          </div>
        </div>
      </div>
      
      {/* 
        Full-Width Structured Content 
        The grid layout adapts to smaller screens but utilizes the entire central area on desktop.
      */}
      <div className="pl-11 pr-2 flex flex-col gap-5 pb-8 w-full">
        <ExecutiveSummary />
        
        <QuickMetrics />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
          <div className="lg:col-span-5">
            <RiskBreakdownChart />
          </div>
          <div className="lg:col-span-7">
            <TopRiskDrivers />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
          <div className="lg:col-span-7">
            <MarketBenchmark />
          </div>
          <div className="lg:col-span-5">
            <Recommendations onAction={handleAction} />
          </div>
        </div>
        
        <ResponseActionBar onAction={handleAction} />
      </div>

      {/* Interactive Modals */}
      <ExecutiveSummaryDrawer
        open={activeModal === "Draft executive summary"}
        onOpenChange={(open) => !open && setActiveModal(null)}
        onNavigate={onNavigate}
        onSaveArtifact={onSaveArtifact}
        canSaveArtifacts={canSaveArtifacts}
        busy={busy}
      />

      <NegotiationPlanDrawer 
        open={activeModal === "Create negotiation plan"} 
        onOpenChange={(open) => !open && setActiveModal(null)} 
        onNavigate={onNavigate}
        onSaveArtifact={onSaveArtifact}
        canSaveArtifacts={canSaveArtifacts}
        busy={busy}
      />

      <ApprovalWorkflowDialog
        open={activeModal === "Start approval workflow"}
        onOpenChange={(open) => !open && setActiveModal(null)}
        onNavigate={onNavigate}
        onSaveArtifact={onSaveArtifact}
        canSaveArtifacts={canSaveArtifacts}
        busy={busy}
      />
      
      <CompareAlternativesModal 
        open={activeModal === "Compare Alternatives"} 
        onOpenChange={(open) => !open && setActiveModal(null)} 
        onNavigate={onNavigate}
        onSaveArtifact={onSaveArtifact}
        canSaveArtifacts={canSaveArtifacts}
        busy={busy}
      />
    </div>
  );
}
