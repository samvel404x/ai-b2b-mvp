"use client";

import { ArrowLeft, CheckCircle2, MoreHorizontal, User, Building2, Copy, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function DecisionHeader({ report, onBack, onValidateData, onOpenAudit, onCopyReportId }) {
  if (!report) return null;

  const isStale = report.dataStale || false;

  return (
    <div className="flex flex-col bg-[#0E1116] shrink-0 z-20 relative p-6 pb-0">
      
      {/* Back button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-white transition-colors self-start mb-6"
      >
        <ArrowLeft className="size-4" /> Back to queue
      </button>

      {/* Main Title Row */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex flex-col gap-3 flex-1">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight leading-none">{report.title}</h1>
            {report.urgent && (
              <span className="rounded border border-critical/30 bg-critical/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest text-critical mt-1">
                Urgent
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground font-medium mt-1">
            <span className="flex items-center gap-2"><Building2 className="size-4" /> Source: {report.department || "Operations"}</span>
            <span className="flex items-center gap-2"><User className="size-4" /> Owner: {report.assignee || report.sender || "Unassigned"}</span>
            <span className="flex items-center gap-2">
              State: <span className={cn(
                "font-bold",
                report.status === "Approved" ? "text-primary" :
                report.status === "Rejected" ? "text-critical" :
                report.status === "Pending AI Review" ? "text-warning" :
                "text-white"
              )}>{report.status}</span>
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={onValidateData} className="flex items-center gap-1.5 bg-transparent border border-[#28313C] hover:bg-[#141A22] text-xs font-semibold text-primary px-3 py-1.5 rounded transition-colors">
            <CheckCircle2 className="size-3.5" /> Validate Data
          </button>
          <button type="button" onClick={onOpenAudit} className="flex items-center justify-center size-7 border border-[#28313C] hover:bg-[#141A22] text-muted-foreground hover:text-white rounded transition-colors" aria-label="Open audit log">
            <MoreHorizontal className="size-4" />
          </button>
        </div>
      </div>

      {/* Stale Warning Banner (Only visible if stale) */}
      {isStale && (
        <div className="mt-6 rounded border border-critical/30 bg-critical/5 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-critical">
            <AlertTriangle className="size-4 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider">Stale Data Warning:</span>
            <span className="text-sm opacity-90">Source data hasn&apos;t synced in over 3 hours. Approvals are blocked.</span>
          </div>
        </div>
      )}

      {/* Meta Row */}
      <div className="flex items-center gap-12 mt-8 pt-5 border-t border-[#28313C]/50 text-sm">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Source data period</span>
          <span className="font-semibold text-white">{report.period || "May 20 – May 26, 2026"}</span>
        </div>
        
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Generated</span>
          <span className="font-semibold text-white">{report.date || "May 20, 2026 - 09:30 AM"}</span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Last validated</span>
          <span className="font-semibold text-primary flex items-center gap-2">
            <div className="size-2 rounded-full bg-primary animate-pulse" />
            {isStale ? "3 hours ago" : "4m ago"}
          </span>
        </div>

        <div className="flex flex-col gap-1 ml-auto">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Report ID</span>
          <span className="font-mono text-white flex items-center gap-2">
            {report.id}
            <button type="button" onClick={onCopyReportId} className="text-muted-foreground hover:text-white transition-colors" aria-label="Copy report id">
              <Copy className="size-4" />
            </button>
          </span>
        </div>
      </div>

    </div>
  );
}
