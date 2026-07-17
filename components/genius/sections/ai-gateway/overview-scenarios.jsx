"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ShieldAlert, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedMetric } from "./animated-metric";

export const SCENARIOS = [
  { 
    id: "conservative", 
    label: "Conservative", 
    desc: "Minimize spend, accept higher stockout risk.",
    quantity: "70 kg", 
    cost: 1134, 
    coverage: "3–4", 
    stockoutRisk: "Medium",
    overstockRisk: "Low",
    benefit: 2180,
    roi: 192,
    confidence: 85,
  },
  { 
    id: "recommended", 
    label: "AI Recommended", 
    desc: "Optimal balance of cost and coverage.",
    quantity: "100 kg", 
    cost: 1620, 
    coverage: "5–7", 
    stockoutRisk: "Low",
    overstockRisk: "Low",
    benefit: 3180,
    roi: 196,
    confidence: 94,
    isRecommended: true
  },
  { 
    id: "aggressive", 
    label: "Aggressive", 
    desc: "Maximum operational coverage, higher cost.",
    quantity: "130 kg", 
    cost: 2106, 
    coverage: "7–9", 
    stockoutRisk: "Very Low",
    overstockRisk: "Medium",
    benefit: 3850,
    roi: 182,
    confidence: 81,
  }
];

export function ScenarioComparison({ scenario, setScenario, itemVariants }) {
  // Requirement 17: Show 3 comparative scenario cards before selection.

  return (
    <motion.div variants={itemVariants} className="space-y-4 pt-6">
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white">Alternative Scenarios</h3>
        <div className="h-px flex-1 bg-gradient-to-r from-[#28313C] to-transparent" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SCENARIOS.map((s) => {
          const isActive = scenario === s.id;
          return (
            <div 
              key={s.id}
              onClick={() => setScenario(s.id)}
              className={cn(
                "relative flex flex-col rounded-xl border p-5 cursor-pointer transition-all duration-300 group",
                isActive 
                  ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(34,197,94,0.1)]" 
                  : "border-[#28313C] bg-gradient-to-b from-[#0E1116] to-[#080A0E] hover:border-[#28313C]"
              )}
            >
              {isActive && (
                <div className="absolute top-0 right-0 p-3">
                  <CheckCircle2 className="size-4 text-primary" />
                </div>
              )}
              {s.isRecommended && !isActive && (
                <div className="absolute top-0 right-0 p-3">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-primary">Recommended</span>
                </div>
              )}

              <div className="flex flex-col mb-4">
                <span className={cn("text-base font-bold", isActive ? "text-primary" : "text-white")}>{s.label}</span>
                <span className="text-[11px] text-muted-foreground mt-1 min-h-[32px]">{s.desc}</span>
              </div>

              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between border-b border-[#28313C]/50 pb-2">
                  <span className="text-xs text-muted-foreground">Action</span>
                  <span className="text-sm font-bold text-white">Order {s.quantity}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#28313C]/50 pb-2">
                  <span className="text-xs text-muted-foreground">Est. Cost</span>
                  <AnimatedMetric value={s.cost} format="currency" className="text-sm font-semibold text-white tabular-nums" />
                </div>
                <div className="flex items-center justify-between border-b border-[#28313C]/50 pb-2">
                  <span className="text-xs text-muted-foreground">Coverage</span>
                  <span className="text-sm font-semibold text-white">{s.coverage} days</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#28313C]/50 pb-2">
                  <span className="text-xs text-muted-foreground">Stockout Risk</span>
                  <span className={cn(
                    "text-[11px] font-bold",
                    s.stockoutRisk === "Medium" ? "text-warning" : "text-primary"
                  )}>
                    {s.stockoutRisk === "Medium" ? <ShieldAlert className="size-3.5 inline mr-1" /> : <ShieldCheck className="size-3.5 inline mr-1" />}
                    {s.stockoutRisk}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Net Benefit</span>
                  <AnimatedMetric value={s.benefit} format="currency" className="text-sm font-semibold text-primary tabular-nums" />
                </div>
              </div>
              
              <div className="mt-5 pt-4 border-t border-[#28313C]/50 flex items-center justify-center">
                <span className={cn(
                  "text-[11px] font-bold flex items-center gap-1 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-white"
                )}>
                  {isActive ? "Selected Scenario" : "Select Scenario"} {isActive ? "" : <ArrowRight className="size-3" />}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
