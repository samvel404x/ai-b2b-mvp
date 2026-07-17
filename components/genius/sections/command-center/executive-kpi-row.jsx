"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ShieldAlert, Zap, Network, Bot, KeyRound, FileText, Activity, AlertOctagon } from "lucide-react";
import { Ring, Sparkline } from "../../shared";
import { formatCurrencyFull } from "@/lib/genius-data";
import { AnimatedNumber } from "./animated-number";

const toneStroke = {
  primary: "var(--primary)",
  critical: "var(--critical)",
  evidence: "var(--evidence)",
  warning: "var(--warning)",
  neutral: "rgba(255,255,255,0.3)",
};

const toneText = {
  primary: "text-primary",
  critical: "text-critical",
  evidence: "text-evidence",
  warning: "text-warning",
  neutral: "text-foreground",
};

const kpiIcons = {
  "Business Health": null, // Uses Ring
  "Critical Risks": ShieldAlert,
  "Money at Risk": AlertOctagon,
  "Savings Captured": Zap,
  "Pending Approvals": KeyRound,
  "Active Agents": Bot,
  "Failed Actions": Activity,
  "Data Freshness": Network,
};

function HexagonIcon({ tone, Icon }) {
  const color = toneStroke[tone] || toneStroke.neutral;
  return (
    <div className="relative flex size-[42px] items-center justify-center shrink-0">
      <svg className="absolute inset-0 size-full" viewBox="0 0 42 42" fill="none">
        <path d="M21 2L39 12V30L21 40L3 30V12L21 2Z" fill={`${color}10`} stroke={color} strokeWidth="1.5" strokeOpacity="0.5" />
      </svg>
      {Icon && <Icon className="relative z-10 size-4" style={{ color }} />}
    </div>
  );
}

export function ExecutiveKpiRow({ loading, onOpenKpi }) {
  const kpis = [
    { label: "Business Health", value: 72, unit: "/100", trend: "+ 6 pts", tone: "primary", ring: true, spark: [58,60,61,64,65,67,68,70,71,72] },
    { label: "Critical Risks", value: 34, trend: "+ 6", tone: "critical", spark: [10,12,15,18,22,25,28,30,32,34] },
    { label: "Money at Risk", value: "$2.48M", trend: "+ $800K", tone: "critical", spark: [1.6,1.7,1.8,1.9,2.0,2.1,2.2,2.3,2.4,2.48] },
    { label: "Savings Captured", value: "$1.37M", trend: "+ $420K", tone: "evidence", spark: [0.8,0.9,1.0,1.1,1.1,1.2,1.2,1.3,1.3,1.37] },
    { label: "Pending Approvals", value: 135, trend: "+ 12", tone: "warning", spark: [120,122,125,123,124,128,130,132,134,135] },
    { label: "Active Agents", value: 27, trend: "+ 5", tone: "primary", spark: [20,21,22,22,23,24,25,25,26,27] },
    { label: "Failed Actions", value: 8, trend: "+ 3", tone: "critical", spark: [2,2,3,4,4,5,6,6,7,8] },
    { label: "Data Freshness", value: "98%", trend: "+ 2%", tone: "primary", spark: [90,92,93,94,95,96,96,97,98,98] },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-xl border border-[#ffffff08] bg-[#0E1116] p-4 h-[94px]">
            <div className="h-2 w-16 rounded bg-[#ffffff08]" />
            <div className="h-6 w-20 rounded bg-[#ffffff08]" />
            <div className="h-1.5 w-full rounded bg-[#ffffff08]" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
      {kpis.map((kpi, i) => {
        const Icon = kpiIcons[kpi.label];
        return (
          <button
            key={kpi.label}
            type="button"
            onClick={() => onOpenKpi?.(kpi)}
            className={cn(
              "group relative flex animate-fade-up flex-col justify-between overflow-hidden rounded-xl border border-[#28313C] bg-[#0E1116] p-3 transition-all duration-300 hover:border-[#ffffff18] hover:bg-[#0E1116] cursor-pointer text-left"
            )}
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <div className="flex items-start gap-3 relative z-10">
              <div className="shrink-0 pt-0.5">
                {kpi.ring ? (
                  <Ring value={typeof kpi.value === "number" ? kpi.value : 72} size={42} stroke={toneStroke[kpi.tone]} hideLabel />
                ) : (
                  <HexagonIcon tone={kpi.tone} Icon={Icon} />
                )}
                {kpi.ring && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-0.5">
                    <span className="text-[12px] font-bold text-white leading-none">B+</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest leading-none mb-1.5 truncate">{kpi.label}</span>
                <div className="flex items-baseline gap-0.5 mb-1.5">
                  <span className="text-[18px] font-bold tracking-tight tabular leading-none text-white">
                    <AnimatedNumber value={kpi.value} />
                  </span>
                  {kpi.unit && <span className="text-[10px] font-medium text-muted-foreground">{kpi.unit}</span>}
                </div>

                <div className="flex items-center gap-1">
                  <span className={cn("text-[8.5px] font-bold flex items-center gap-0.5 whitespace-nowrap", toneText[kpi.tone])}>
                    <span className="text-[7px]">↑</span>
                    {kpi.trend}
                  </span>
                  <span className="text-[8.5px] font-medium text-muted-foreground/70 ml-0.5">vs last 7d</span>
                </div>
              </div>
            </div>

            {kpi.spark && (
              <div className="absolute inset-x-0 bottom-0 top-8 opacity-40 pointer-events-none -mx-2 flex items-end">
                <Sparkline data={kpi.spark} stroke={toneStroke[kpi.tone]} className="h-8 w-full" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
