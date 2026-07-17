"use client";

import { cn } from "@/lib/utils";
import { formatCurrencyFull } from "@/lib/genius-data";
import { AlertCircle, HelpCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function RequiresAttentionPanel({ issues, loading, onReviewIssue, onViewAll }) {

  if (loading) {
    return (
      <div className="rounded-xl border border-[#28313C] bg-[#0E1116] flex-1 flex flex-col min-h-0 relative">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#28313C]">
          <div className="size-2 rounded-full bg-critical shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
          <h3 className="text-[12px] font-bold text-white">Requires Attention</h3>
          <div className="flex size-4 items-center justify-center rounded-full bg-[#28313C] text-[9px] font-bold text-muted-foreground">?</div>
        </div>
        <div className="flex flex-col p-4 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 w-4 rounded-full bg-[#ffffff08]" />
              <div className="flex-1">
                <div className="h-3 w-32 rounded bg-[#ffffff08] mb-1.5" />
                <div className="h-2 w-24 rounded bg-[#ffffff08]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#28313C] bg-[#0E1116] flex-1 flex flex-col min-h-0">

      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#28313C] shrink-0">
        <div className="size-1.5 rounded-full bg-critical shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
        <h3 className="text-[13px] font-bold text-white tracking-wide">Requires Attention</h3>
        <div className="flex size-3.5 items-center justify-center rounded-full bg-[#141A22] border border-[#28313C] text-[9px] font-bold text-muted-foreground cursor-help">
          ?
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[1fr_90px_60px_100px_60px] gap-2 px-5 py-2.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground border-b border-[#28313C]/50 shrink-0">
        <span>Issue</span>
        <span>Impact</span>
        <span>Priority</span>
        <span>Owner</span>
        <span className="text-right">Action</span>
      </div>

      {/* List */}
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto scrollbar-thin">
        {issues.map((item, idx) => (
          <div
            key={item.id}
            className={cn(
              "grid grid-cols-[1fr_90px_60px_100px_60px] gap-2 px-5 py-3.5 items-center transition-colors hover:bg-white/5 animate-fade-up",
              idx < issues.length - 1 && "border-b border-[#28313C]/50"
            )}
            style={{ animationDelay: `${100 + (idx * 50)}ms`, animationFillMode: 'both' }}
          >
            <div className="flex items-start gap-2.5 min-w-0 pr-2">
              <div className={cn(
                "size-5 rounded flex items-center justify-center shrink-0 mt-0.5",
                item.priority === "Critical" ? "bg-critical/10 text-critical" : "bg-warning/10 text-warning"
              )}>
                <AlertCircle className="size-3.5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-bold text-white truncate">{item.issue}</span>
                <span className="text-[10px] text-muted-foreground truncate">{item.entity}</span>
              </div>
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-white">{item.impact ? formatCurrencyFull(item.impact) : "—"}</span>
              <span className="text-[9px] text-muted-foreground">{item.impactType}</span>
            </div>

            <div>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                item.priority === "Critical" ? "text-critical" : "text-warning"
              )}>
                {item.priority}
              </span>
            </div>

            <div className="flex items-center gap-2 min-w-0">
              <Avatar className="size-5 border border-[#28313C]">
                <AvatarFallback className="bg-[#4EA1FF] text-[8px] font-bold text-white">{item.ownerInitials}</AvatarFallback>
              </Avatar>
              <span className="text-[10px] text-white truncate">{item.owner}</span>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onReviewIssue?.(item)}
                className="rounded border border-[#28313C] bg-[#141A22] px-2.5 py-1 text-[10px] font-bold text-[#4EA1FF] hover:bg-[#28313C] transition-colors"
              >
                Review
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[#28313C] px-5 py-3 shrink-0">
        <button type="button" onClick={onViewAll} className="text-[10px] font-bold text-[#4EA1FF] hover:text-white transition-colors">
          View all issues →
        </button>
      </div>

    </div>
  );
}
