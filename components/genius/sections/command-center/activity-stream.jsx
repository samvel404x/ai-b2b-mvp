"use client";

import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Bot, ChevronDown } from "lucide-react";

export function ActivityStreamPanel({ items, loading, onViewAll, onOpenItem, onFilter, filterLabel = "All Events" }) {
  if (loading) {
    return (
      <div className="rounded-xl border border-[#28313C] bg-[#0E1116] flex flex-col h-full min-h-[300px] p-[20px]">
        <div className="flex items-center justify-between pb-[16px]">
          <h3 className="text-[16px] font-semibold text-white tracking-wide">Activity Stream</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#28313C] bg-[#0E1116] flex flex-col h-full p-[20px] overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between pb-[16px] border-b border-[#28313C] shrink-0">
        <h3 className="text-[16px] font-semibold text-white tracking-wide">Activity Stream</h3>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onFilter}
            className="flex items-center gap-1.5 rounded border border-[#28313C] bg-[#141A22] px-2.5 py-1 cursor-pointer hover:bg-[#28313C] transition-colors"
          >
            <span className="text-[12px] font-medium text-white">{filterLabel}</span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>
          <button type="button" onClick={onViewAll} className="text-[13px] font-medium text-[#4EA1FF] hover:text-white transition-colors">
            View all
          </button>
        </div>
      </div>

      {/* Stream list - densely packed at top */}
      <div className="flex flex-col flex-1 pt-[16px] overflow-y-auto scrollbar-thin pr-2">
        <div className="flex flex-col relative w-full h-fit pb-4">

          {/* Connecting line */}
          <div className="absolute left-[11px] top-4 bottom-4 w-px bg-[#28313C]" />

          {items.map((item, idx) => {
            let Icon = Bot;
            let iconColorClass = "text-muted-foreground";
            let iconBgClass = "bg-[#141A22]";

            if (item.type === "risk") {
              Icon = AlertCircle;
              iconColorClass = "text-warning";
              iconBgClass = "bg-warning/10 border-warning/20";
            } else if (item.type === "success") {
              Icon = CheckCircle2;
              iconColorClass = "text-primary";
              iconBgClass = "bg-primary/10 border-primary/20";
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onOpenItem?.(item)}
                className={cn(
                  "flex items-start gap-[16px] relative z-10 group cursor-pointer transition-colors px-1 rounded-md animate-fade-up text-left",
                  "h-[54px] hover:bg-white/5" // Exact row height
                )}
                style={{ animationDelay: `${100 + (idx * 50)}ms`, animationFillMode: 'both' }}
              >
                {/* Timeline Icon */}
                <div className="flex flex-col items-center shrink-0 pt-2.5">
                  <div className={cn("size-[22px] rounded-full flex items-center justify-center border border-[#28313C]", iconBgClass)}>
                    <Icon className={cn("size-3.5", iconColorClass)} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 min-w-0 justify-center h-full border-b border-[#28313C]/40 group-hover:border-transparent">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-[13px] font-medium text-white leading-tight truncate">{item.title}</span>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap pt-0.5">{item.time}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[12px] text-muted-foreground truncate max-w-[280px]">{item.sub}</span>
                  </div>
                </div>
              </button>
            );
          })}

        </div>
      </div>

    </div>
  );
}
