"use client";

import { cn } from "@/lib/utils";
import { formatCurrencyFull } from "@/lib/genius-data";
import { useState, useEffect } from "react";
import { AnimatedNumber } from "./animated-number";

export function ValueCapturedCard({ data, loading, onViewDetails, onOpenBreakdown }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setAnimated(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="rounded-xl border border-[#28313C] bg-[#0E1116] flex flex-col h-full min-h-[300px] p-[20px]">
         <div className="flex items-center justify-between pb-[16px]">
           <h3 className="text-[16px] font-semibold text-white tracking-wide">Value Captured</h3>
         </div>
      </div>
    );
  }

  // Helper to get consistent heights
  const maxVal = Math.max(...data.breakdown.map(d => d.value));

  return (
    <div className="rounded-xl border border-[#28313C] bg-[#0E1116] flex flex-col h-full overflow-hidden transition-colors hover:border-[#ffffff18] p-[20px]">

      {/* Header */}
      <div className="flex items-center justify-between pb-[16px] shrink-0">
        <h3 className="text-[16px] font-semibold text-white tracking-wide">Value Captured</h3>
        <button type="button" onClick={onViewDetails} className="text-[13px] font-medium text-[#4EA1FF] hover:text-white transition-colors flex items-center gap-1">
          View details <span>→</span>
        </button>
      </div>

      <div className="flex flex-col flex-1 pt-[8px]">

        {/* Top metrics */}
        <div className="flex flex-col gap-1 mb-[24px]">
          <span className="text-[30px] font-bold text-white tracking-tight leading-none">
            <AnimatedNumber value={formatCurrencyFull(data.total)} delay={200} />
          </span>
          <span className="text-[13px] text-muted-foreground mt-1">Total captured</span>
          <span className="text-[12px] font-semibold text-primary mt-1 flex items-center gap-1 animate-fade-up" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
             <span className="text-[11px]">↑</span> {data.delta.replace('+ ', '')}
          </span>
        </div>

        {/* Vertical Bar Chart - centered in lower area */}
        <div className="flex items-end justify-between gap-3 mt-auto h-[140px] w-full px-2">
          {data.breakdown.map((item, idx) => {
            const heightPct = animated ? Math.max(12, (item.value / maxVal) * 100) : 0;

            // Assign specific colors
            let barColor = "var(--primary)"; // Green for realized
            if (idx === 1) barColor = "#4EA1FF"; // Blue
            else if (idx === 2) barColor = "#4EA1FF"; // Darker blue
            else if (idx === 3) barColor = "#4EA1FF"; // Darkest blue

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onOpenBreakdown?.(item)}
                className="flex flex-col items-center gap-2 flex-1 group/bar h-full justify-end cursor-pointer"
              >
                <span className="text-[14px] font-bold text-white tabular-nums">
                  $<AnimatedNumber value={(item.value / 1000).toString()} delay={300 + (idx * 100)} />K
                </span>
                <div
                  className="w-full rounded-t transition-all duration-1000 opacity-90 group-hover/bar:opacity-100 group-hover/bar:brightness-110"
                  style={{ height: `${heightPct}%`, backgroundColor: barColor, transitionDelay: `${idx * 100}ms` }}
                />
                <span className="text-[11px] text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-full text-center px-1">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
