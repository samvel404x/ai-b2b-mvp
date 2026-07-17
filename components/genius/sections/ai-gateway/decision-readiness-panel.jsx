"use client";

import { CheckCircle2, Clock, User, AlertTriangle, GitCommit, ShieldCheck, Zap, Database, Check, ArrowRight } from "lucide-react";
import { Ring } from "../../shared";
import { cn } from "@/lib/utils";

export function DecisionReadinessPanel({ report, onOpenDetails, onOpenAudit, onOpenIssues }) {
  const readinessLabel = /approved|execution queued/i.test(report?.status || "") ? "Approved" : "Ready with warnings";

  return (
    <div className="flex w-full shrink-0 flex-col bg-transparent p-5 space-y-6 overflow-y-auto scrollbar-none z-20 h-full">
      
      {/* 1. Decision Readiness */}
      <div className="flex flex-col gap-4">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          DECISION READINESS
        </h3>
        
        <div className="flex items-center gap-4 border border-[#28313C] rounded-xl bg-[#141A22]/50 p-4">
          <div className="relative size-14 shrink-0">
            <Ring value={72} size={56} stroke="#a3e635" hideLabel />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-bold text-white leading-none">72<span className="text-[10px]">%</span></span>
              <span className="text-[8px] text-muted-foreground">/ 100</span>
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold text-[#a3e635]">{readinessLabel}</span>
            <span className="text-xs text-muted-foreground">Action recommended</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 mt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-emerald-500" /> Data freshness
            </span>
            <span className="text-xs font-medium text-emerald-500">Very fresh</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-emerald-500" /> Evidence completeness
            </span>
            <span className="text-xs font-medium text-emerald-500">92%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-emerald-500" /> Policy compliance
            </span>
            <span className="text-xs font-medium text-emerald-500">Passed</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="size-3.5 text-warning" /> Budget availability
            </span>
            <span className="text-xs font-medium text-warning">Warning</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="size-3.5 text-warning" /> Supplier validation
            </span>
            <span className="text-xs font-medium text-warning">Warning</span>
          </div>
        </div>

        <div className="mt-1">
          <button type="button" onClick={onOpenDetails} className="text-xs text-[#4EA1FF] hover:text-[#4EA1FF]/80 flex items-center gap-1.5 transition-colors">
            How this score is calculated <ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="h-px bg-[#28313C]/50 w-full" />

      {/* 2. Workflow & Approval */}
      <div className="flex flex-col gap-4">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          WORKFLOW & APPROVAL
        </h3>
        
        <div className="flex flex-col mt-2">
          
          <div className="flex items-start gap-4 relative mb-4">
            <div className="absolute left-2 top-4 bottom-0 w-px bg-emerald-500/30" />
            <div className="size-4 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center shrink-0 z-10 mt-0.5">
              <Check className="size-2.5 text-emerald-500" />
            </div>
            <div className="flex flex-col flex-1 pb-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white">AI Data Preparation</span>
                <span className="text-[10px] text-emerald-500">Completed</span>
              </div>
              <span className="text-[10px] text-muted-foreground">May 20, 08:45 AM</span>
            </div>
          </div>

          <div className="flex items-start gap-4 relative mb-4">
            <div className="absolute left-2 top-4 bottom-0 w-px bg-[#28313C]" />
            <div className="size-4 rounded-full border-2 border-[#4EA1FF] flex items-center justify-center shrink-0 z-10 bg-[#141A22] mt-0.5 shadow-[0_0_8px_rgba(78,161,255,0.3)]">
              <div className="size-2 rounded-full bg-[#4EA1FF]" />
            </div>
            <div className="flex flex-col flex-1 pb-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Operations Review</span>
                <span className="text-[10px] text-[#4EA1FF] font-bold">In Review</span>
              </div>
              <span className="text-[10px] text-muted-foreground">SLA 2h</span>
            </div>
          </div>

          <div className="flex items-start gap-4 relative mb-4">
            <div className="absolute left-2 top-4 bottom-0 w-px bg-[#28313C]" />
            <div className="size-4 rounded-full border-2 border-[#28313C] shrink-0 z-10 bg-[#141A22] mt-0.5" />
            <div className="flex flex-col flex-1 pb-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Finance Approval</span>
                <span className="text-[10px] text-muted-foreground">Pending</span>
              </div>
              <span className="text-[10px] text-muted-foreground">SLA 4h</span>
            </div>
          </div>

          <div className="flex items-start gap-4 relative">
            <div className="size-4 rounded-full border-2 border-[#28313C] shrink-0 z-10 bg-[#141A22] mt-0.5" />
            <div className="flex flex-col flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Final Approval</span>
                <span className="text-[10px] text-muted-foreground">Pending</span>
              </div>
              <span className="text-[10px] text-muted-foreground">SLA 2h</span>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <button type="button" onClick={onOpenAudit} className="text-[10px] text-[#4EA1FF] hover:text-[#4EA1FF]/80 flex items-center justify-center gap-1.5 transition-colors mx-auto">
              View full chain <ArrowRight className="size-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="h-px bg-[#28313C]/50 w-full" />

      {/* 3. Blocking Issues */}
      <div className="flex flex-col gap-4">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          BLOCKING ISSUES
        </h3>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-critical/30 bg-critical/10 px-2.5 py-1">
            <div className="size-4 rounded-full bg-critical/20 flex items-center justify-center text-[10px] font-bold text-critical">1</div>
            <span className="text-xs font-bold text-critical">Blocking</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1">
            <div className="size-4 rounded-full bg-warning/20 flex items-center justify-center text-[10px] font-bold text-warning">2</div>
            <span className="text-xs font-bold text-warning">Warnings</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-1">
          <div className="flex items-start gap-2">
            <AlertTriangle className="size-3.5 text-warning shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">Supplier SLA risk</span>
              <span className="text-[10px] text-muted-foreground">Backup supplier needed</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="size-3.5 text-warning shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">Budget allocation</span>
              <span className="text-[10px] text-muted-foreground">Q2 allocation 85% used</span>
            </div>
          </div>
        </div>

        <div className="mt-1 text-center">
          <button type="button" onClick={onOpenIssues} className="text-[10px] text-[#4EA1FF] hover:text-[#4EA1FF]/80 flex items-center justify-center gap-1.5 transition-colors mx-auto">
            View all issues <ArrowRight className="size-3" />
          </button>
        </div>
      </div>

      <div className="h-px bg-[#28313C]/50 w-full" />

      {/* 4. Similar Decisions */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            SIMILAR DECISIONS
          </h3>
          <span className="text-[10px] text-muted-foreground">85% avg success rate</span>
        </div>
        
        <div className="flex flex-col gap-4">
          
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Ordered 80kg mushrooms</span>
              <span className="text-[10px] text-muted-foreground">ROI <span className="text-emerald-500 font-bold">+3%</span> similar</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-500 border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 rounded">Success</span>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground">Apr</span>
                <span className="text-[10px] font-bold text-emerald-500">+241%</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Ordered 60kg mushrooms</span>
              <span className="text-[10px] text-muted-foreground">API <span className="text-emerald-500 font-bold">+182%</span></span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-500 border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 rounded">Success</span>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground">Apr</span>
                <span className="text-[10px] font-bold text-emerald-500">+182%</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Delayed order</span>
              <span className="text-[10px] text-muted-foreground">82% similar</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-critical border border-critical/30 bg-critical/10 px-1.5 py-0.5 rounded">Stockout</span>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground">Apr 23</span>
                <span className="text-[10px] font-bold text-critical">ROI -31%</span>
              </div>
            </div>
          </div>
          
          <div className="mt-1 text-center">
            <button type="button" onClick={onOpenAudit} className="text-[10px] font-bold text-[#4EA1FF] hover:text-[#4EA1FF]/80 flex items-center justify-center gap-1.5 transition-colors mx-auto">
              View all precedents <ArrowRight className="size-3" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
