"use client";

import { cn } from "@/lib/utils";
import { AnimatedNumber } from "./animated-number";

export function EvidenceCoverageCard({ data, loading, onViewMap, onOpenSourceType }) {
  if (loading) {
    return (
      <div className="rounded-xl border border-[#28313C] bg-[#0E1116] flex flex-col h-full p-[20px]">
         <div className="flex items-center justify-between pb-[16px]">
           <h3 className="text-[16px] font-semibold text-white tracking-wide">Evidence Coverage</h3>
         </div>
      </div>
    );
  }

  // Fake data for the line chart (Jun 19 to Jun 26)
  const lineChartData = [80, 82, 81, 68, 80, 75, 88, 95];
  const labels = ["Jun 19", "Jun 20", "Jun 21", "Jun 22", "Jun 23", "Jun 24", "Jun 25", "Jun 26"];

  return (
    <div className="rounded-xl border border-[#28313C] bg-[#0E1116] flex flex-col h-full overflow-hidden transition-colors hover:border-[#ffffff18] p-[20px]">

      {/* Header */}
      <div className="flex items-center justify-between pb-[16px] shrink-0 border-b border-[#28313C]">
        <h3 className="text-[16px] font-semibold text-white tracking-wide">Evidence Coverage</h3>
        <button type="button" onClick={onViewMap} className="text-[13px] font-medium text-[#4EA1FF] hover:text-white transition-colors flex items-center gap-1">
          View evidence map <span>→</span>
        </button>
      </div>

      <div className="flex flex-col flex-1 pt-[20px] gap-[24px]">

        {/* Top KPI strip */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-[12px] text-muted-foreground font-medium">Sources</span>
            <span className="text-[24px] font-bold text-white tabular-nums leading-none"><AnimatedNumber value={data.sources} delay={100} /></span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 animate-fade-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
              <span className="text-primary font-bold">↑ 5</span> vs last 7d
            </span>
          </div>
          <div className="flex flex-col gap-1.5 flex-1 pl-4 border-l border-[#28313C]/50">
            <span className="text-[12px] text-muted-foreground font-medium">Extracted Facts</span>
            <span className="text-[24px] font-bold text-white tabular-nums leading-none"><AnimatedNumber value={data.extractedFacts.toLocaleString()} delay={150} /></span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 animate-fade-up" style={{ animationDelay: '350ms', animationFillMode: 'both' }}>
              <span className="text-primary font-bold">↑ 312</span> vs last 7d
            </span>
          </div>
          <div className="flex flex-col gap-1.5 flex-1 pl-4 border-l border-[#28313C]/50">
            <span className="text-[12px] text-muted-foreground font-medium">Verified Facts</span>
            <span className="text-[24px] font-bold text-white tabular-nums leading-none"><AnimatedNumber value={data.verifiedFacts.toLocaleString()} delay={200} /></span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 animate-fade-up" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
              <span className="text-primary font-bold">↑ 210</span> vs last 7d
            </span>
          </div>
          <div className="flex flex-col gap-1.5 flex-1 pl-4 border-l border-[#28313C]/50">
            <span className="text-[12px] text-muted-foreground font-medium">Coverage</span>
            <span className="text-[24px] font-bold text-white tabular-nums leading-none"><AnimatedNumber value={data.coverage} delay={250} />%</span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 animate-fade-up" style={{ animationDelay: '450ms', animationFillMode: 'both' }}>
              <span className="text-primary font-bold">↑ 4%</span> vs last 7d
            </span>
          </div>
          <div className="flex flex-col gap-1.5 flex-1 pl-4 border-l border-[#28313C]/50">
            <span className="text-[12px] text-muted-foreground font-medium">Stale Sources</span>
            <span className="text-[24px] font-bold text-white tabular-nums leading-none"><AnimatedNumber value={data.staleSources} delay={300} /></span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 animate-fade-up" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
              <span className="text-critical font-bold">↓ 3</span> vs last 7d
            </span>
          </div>
        </div>

        {/* Bottom charts row */}
        <div className="grid grid-cols-[1.6fr_1fr] gap-[32px] flex-1">

          {/* LEFT: Coverage trend line chart (60-65%) */}
          <div className="flex flex-col h-full">
            <span className="text-[12px] text-white font-medium mb-4">Coverage trend</span>
            <div className="flex-1 relative flex items-end ml-[32px] mb-5 min-h-[140px]">
              {/* Y-axis labels */}
              <div className="absolute left-[-32px] inset-y-0 flex flex-col justify-between text-[11px] text-muted-foreground pb-2">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>

              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pb-2 border-l border-[#28313C]/50">
                <div className="w-full border-b border-[#28313C]/30 border-dashed h-0" />
                <div className="w-full border-b border-[#28313C]/30 border-dashed h-0" />
                <div className="w-full border-b border-[#28313C]/30 border-dashed h-0" />
                <div className="w-full border-b border-[#28313C]/30 border-dashed h-0" />
                <div className="w-full border-b border-[#28313C] h-0" />
              </div>

              {/* Line & Area SVG */}
              <div className="absolute inset-0 pb-2 overflow-visible">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="size-full overflow-visible">
                  <defs>
                    <linearGradient id="coverageGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4EA1FF" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#4EA1FF" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Draw area and line */}
                  {(() => {
                    const points = lineChartData.map((val, i) => {
                      const x = (i / (lineChartData.length - 1)) * 100;
                      const y = 100 - val;
                      return `${x},${y}`;
                    }).join(' L ');

                    const areaPath = `M 0,100 L ${points} L 100,100 Z`;
                    const linePath = `M ${points}`;

                    return (
                      <>
                        <path d={areaPath} fill="url(#coverageGradient)" />
                        <path d={linePath} fill="none" stroke="#4EA1FF" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                      </>
                    );
                  })()}
                </svg>

                {/* Dots (rendered as HTML to prevent SVG aspect ratio distortion) */}
                {lineChartData.map((val, i) => {
                  const x = (i / (lineChartData.length - 1)) * 100;
                  const y = 100 - val;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onViewMap?.({ date: labels[i], coverage: val })}
                      className="absolute size-[7px] rounded-full bg-[#0E1116] border-[1.5px] border-[#4EA1FF] -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-150 cursor-pointer"
                      style={{ left: `${x}%`, top: `${y}%` }}
                    />
                  );
                })}
              </div>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between text-[11px] text-muted-foreground ml-[32px]">
              {labels.map(label => <span key={label}>{label}</span>)}
            </div>
          </div>

          {/* RIGHT: By source type donut (35-40%) */}
          <div className="flex flex-col h-full">
            <span className="text-[12px] text-white font-medium mb-4">By source type</span>
            <div className="flex items-center gap-[24px] flex-1">

              {/* Donut Chart (Max 160px) */}
              <div className="relative size-[140px] shrink-0">
                <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                  <circle cx="50" cy="50" r="35" fill="none" stroke="#28313C" strokeWidth="24" />

                  <circle cx="50" cy="50" r="35" fill="none" stroke="#4EA1FF" strokeWidth="24" strokeDasharray="110 220" strokeDashoffset="0" className="transition-all duration-1000" /> {/* Contracts 44% */}
                  <circle cx="50" cy="50" r="35" fill="none" stroke="#4EA1FF" strokeWidth="24" strokeDasharray="64 220" strokeDashoffset="-110" className="transition-all duration-1000" /> {/* Invoices 29% */}
                  <circle cx="50" cy="50" r="35" fill="none" stroke="#f59e0b" strokeWidth="24" strokeDasharray="35 220" strokeDashoffset="-174" className="transition-all duration-1000" /> {/* Emails 16% */}
                  <circle cx="50" cy="50" r="35" fill="none" stroke="#10b981" strokeWidth="24" strokeDasharray="24 220" strokeDashoffset="-209" className="transition-all duration-1000" /> {/* Reports 11% */}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
                  <span className="text-[20px] font-bold text-white leading-none">{data.sources}</span>
                  <span className="text-[11px] text-muted-foreground mt-1">Total</span>
                </div>
              </div>

              {/* Legend directly beside it */}
              <div className="flex flex-col gap-[12px] flex-1">
                {data.byType.map((item, idx) => {
                  let dotColor = "#4EA1FF";
                  if (item.label === "Invoices") dotColor = "#4EA1FF";
                  if (item.label === "Emails") dotColor = "#f59e0b";
                  if (item.label === "Reports") dotColor = "#10b981";

                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => onOpenSourceType?.(item)}
                      className="flex items-center justify-between group cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2">
                        <div className="size-3 rounded-full shadow-sm" style={{ backgroundColor: dotColor }} />
                        <span className="text-[12px] text-muted-foreground group-hover:text-white transition-colors">{item.label}</span>
                      </div>
                      <span className="text-[12px] text-white font-medium tabular-nums text-right">
                        {item.value} <span className="text-muted-foreground font-normal ml-1">({item.pct}%)</span>
                      </span>
                    </button>
                  );
                })}
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
