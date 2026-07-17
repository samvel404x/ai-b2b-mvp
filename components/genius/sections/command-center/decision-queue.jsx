"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatCurrencyFull } from "@/lib/genius-data";

function tabForItem(item) {
  const text = `${item.state || ""} ${item.status || ""} ${item.priority || ""}`.toLowerCase();
  if (text.includes("blocked") || text.includes("needs evidence")) return "Blocked";
  if (text.includes("approved") || text.includes("ready")) return "Awaiting Approval";
  if (text.includes("info") || text.includes("low")) return "Info";
  return "Awaiting Review";
}

export function DecisionQueuePanel({ items, loading, onReviewDecision, onViewAll }) {
  const [activeTab, setActiveTab] = useState("Awaiting Review");
  const countsByTab = items.reduce((counts, item) => {
    const tab = tabForItem(item);
    return { ...counts, [tab]: (counts[tab] || 0) + 1 };
  }, {});

  const tabs = [
    { id: "Awaiting Review", count: countsByTab["Awaiting Review"] || 0 },
    { id: "Awaiting Approval", count: countsByTab["Awaiting Approval"] || 0 },
    { id: "Blocked", count: countsByTab.Blocked || 0 },
    { id: "Info", count: countsByTab.Info || 0 },
  ];
  const visibleItems = items.filter((item) => tabForItem(item) === activeTab);

  if (loading) {
    return (
      <div className="rounded-xl border border-[#28313C] bg-[#0E1116] flex flex-col min-h-0 relative h-[300px]">
        {/* ... */}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#28313C] bg-[#0E1116] flex flex-col min-h-0">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#28313C] shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-[13px] font-bold text-white tracking-wide">Decision Queue</h3>
          <span className="rounded bg-critical/20 px-1.5 py-0.5 text-[10px] font-bold text-critical border border-critical/30">135</span>
        </div>
        <button type="button" onClick={onViewAll} className="text-[10px] font-bold text-[#4EA1FF] hover:text-white transition-colors">
          View all
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 px-5 border-b border-[#28313C] shrink-0 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 py-3 text-[10px] font-bold uppercase tracking-widest border-b-2 whitespace-nowrap transition-colors",
              activeTab === tab.id
                ? "border-[#4EA1FF] text-[#4EA1FF]"
                : "border-transparent text-muted-foreground hover:text-white"
            )}
          >
            {tab.id}
            <span className={cn(
              "rounded px-1.5 py-0.5 text-[9px]",
              activeTab === tab.id ? "bg-[#4EA1FF]/20 text-[#4EA1FF]" : "bg-[#141A22] text-muted-foreground border border-[#28313C]"
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[1fr_80px_70px_70px_60px] gap-2 px-5 py-2.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground border-b border-[#28313C]/50 shrink-0">
        <span>Decision</span>
        <span>Impact</span>
        <span>Priority</span>
        <span>Requested</span>
        <span className="text-right">Action</span>
      </div>

      {/* List */}
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto scrollbar-thin">
        {visibleItems.length === 0 && (
          <div className="flex flex-1 items-center justify-center px-5 py-8 text-center text-xs text-muted-foreground">
            No decisions in this queue.
          </div>
        )}

        {visibleItems.map((item, idx) => (
          <div
            key={item.id}
            className={cn(
              "grid grid-cols-[1fr_80px_70px_70px_60px] gap-2 px-5 py-3.5 items-center transition-colors hover:bg-white/5 animate-fade-up",
              idx < items.length - 1 && "border-b border-[#28313C]/50"
            )}
            style={{ animationDelay: `${100 + (idx * 50)}ms`, animationFillMode: 'both' }}
          >
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-[11px] font-bold text-white truncate">{item.title}</span>
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-white tabular-nums">{formatCurrencyFull(item.impact)}</span>
            </div>

            <div>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                item.priority === "Critical" ? "text-critical" :
                item.priority === "High" ? "text-warning" : "text-evidence"
              )}>
                {item.priority}
              </span>
            </div>

            <div>
               <span className="text-[10px] text-muted-foreground">{item.due}</span>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onReviewDecision?.(item)}
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
          View all decisions →
        </button>
      </div>

    </div>
  );
}
