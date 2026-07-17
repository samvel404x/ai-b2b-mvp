"use client";

import { cn } from "@/lib/utils";
import { formatCurrencyFull } from "@/lib/genius-data";
import { useState, useEffect } from "react";

export function RiskExposureCard({ data, loading, onAnalyze, onOpenLevel }) {
  const [animatedTotal, setAnimatedTotal] = useState(0);

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  useEffect(() => {
    if (loading) return;
    let start = null;
    const duration = 800;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setAnimatedTotal(easeProgress * total);
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [loading, total]);

  if (loading) {
    return (
      <div className="rounded-xl border border-[#28313C] bg-[#0E1116] flex flex-col h-full p-[20px]">
         <div className="flex items-center justify-between pb-4">
           <h3 className="text-[16px] font-semibold text-white tracking-wide">Risk Exposure</h3>
         </div>
         <div className="flex-1 flex flex-col justify-center gap-4 animate-pulse">
           <div className="size-[150px] rounded-full border-[12px] border-[#28313C] mx-auto opacity-50" />
         </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#28313C] bg-[#0E1116] flex flex-col h-full overflow-hidden transition-colors hover:border-[#ffffff18] group p-[20px]">

      {/* Header */}
      <div className="flex items-center justify-between pb-[16px] shrink-0">
        <h3 className="text-[16px] font-semibold text-white tracking-wide">Risk Exposure</h3>
        <button type="button" onClick={onAnalyze} className="text-[13px] font-medium text-[#4EA1FF] hover:text-white transition-colors">
          Analyze →
        </button>
      </div>

      <div className="flex flex-col flex-1">

        {/* Central Chart */}
        <div className="flex justify-center items-center py-[16px]">
          <div className="relative size-[150px] shrink-0">
            <svg viewBox="0 0 100 100" className="size-full -rotate-90">
               <circle cx="50" cy="50" r="40" fill="none" stroke="#28313C" strokeWidth="12" />
               <circle cx="50" cy="50" r="40" fill="none" stroke="var(--critical)" strokeWidth="12" strokeDasharray="135 251" strokeDashoffset="0" className="drop-shadow-[0_0_4px_rgba(239,68,68,0.5)] transition-all duration-1000" />
               <circle cx="50" cy="50" r="40" fill="none" stroke="var(--warning)" strokeWidth="12" strokeDasharray="65 251" strokeDashoffset="-135" className="transition-all duration-1000" />
               <circle cx="50" cy="50" r="40" fill="none" stroke="var(--evidence)" strokeWidth="12" strokeDasharray="32 251" strokeDashoffset="-200" className="transition-all duration-1000" />
               <circle cx="50" cy="50" r="40" fill="none" stroke="var(--primary)" strokeWidth="12" strokeDasharray="19 251" strokeDashoffset="-232" className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
              <span className="text-[17px] font-bold text-white tabular-nums tracking-tight">{formatCurrencyFull(animatedTotal)}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Total Risk</span>
            </div>
          </div>
        </div>

        {/* Connected Legend */}
        <div className="w-full flex flex-col gap-1 mt-auto">
          {data.map((item) => (
             <button
               key={item.level}
               type="button"
               onClick={() => onOpenLevel?.(item)}
               className="flex items-center justify-between group/row hover:bg-white/5 rounded px-2 py-[6px] transition-colors cursor-pointer text-left"
             >
               <div className="flex items-center gap-2.5">
                 <div className="size-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}80` }} />
                 <span className="text-[13px] font-medium text-white">{item.level}</span>
               </div>
               <div className="flex items-center gap-4">
                 <span className="text-[13px] font-semibold text-white tabular-nums">{formatCurrencyFull(item.amount)}</span>
                 <span className="text-[12px] text-muted-foreground w-8 text-right tabular-nums">{item.pct}%</span>
               </div>
             </button>
          ))}
        </div>
      </div>
    </div>
  );
}
