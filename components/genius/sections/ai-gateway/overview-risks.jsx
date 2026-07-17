"use client";

import { motion } from "framer-motion";
import { ShieldAlert, ArrowRight, Activity, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function RisksSection({ itemVariants, onOpenRisks }) {
  const risks = [
    {
      name: "Supplier Delay Risk",
      severity: "Medium",
      probability: "16%",
      impact: "3–5 days late delivery possible",
      mitigation: "Backup supplier available",
      icon: <AlertTriangle className="size-3.5 text-warning" />
    },
    {
      name: "Budget Overrun",
      severity: "Low",
      probability: "8%",
      impact: "May exceed Q2 allocation by $500",
      mitigation: "Reallocate from Marketing",
      icon: <ShieldAlert className="size-3.5 text-[#4EA1FF]" />
    },
    {
      name: "Demand Volatility",
      severity: "Medium",
      probability: "11%",
      impact: "Forecast uncertainty: Medium",
      mitigation: "Monitor daily, adjust if needed",
      icon: <TrendingUp className="size-4 text-[#7CC7FF]" />
    }
  ];

  return (
    <motion.div variants={itemVariants} className="flex flex-col gap-3 rounded-xl border border-[#28313C] bg-gradient-to-b from-[#0E1116] to-[#080A0E] p-5">
      
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <ShieldAlert className="size-4" /> 3. Key Risks
        </h3>
      </div>

      <div className="flex flex-col gap-5 flex-1 mt-1">
        {risks.map((risk, i) => (
          <div key={i} className="flex gap-3">
            <div className="mt-0.5 shrink-0">
              {risk.icon}
            </div>
            <div className="flex flex-col flex-1 gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{risk.name}</span>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border",
                    risk.severity === "Medium" ? "text-warning border-warning/30 bg-warning/10" : "text-[#4EA1FF] border-[#4EA1FF]/30 bg-[#4EA1FF]/10"
                  )}>
                    {risk.severity}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">Prob. {risk.probability}</span>
              </div>
              <span className="text-sm text-muted-foreground leading-snug">{risk.impact}</span>
              <span className="text-sm text-muted-foreground leading-snug">
                <span className="text-white/60">Mitigation:</span> {risk.mitigation}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 text-center border-t border-[#28313C]/50">
        <button type="button" onClick={onOpenRisks} className="text-xs font-bold text-[#4EA1FF] hover:text-[#4EA1FF]/80 transition-colors flex items-center gap-1.5 mx-auto">
          View all risks <ArrowRight className="size-3.5" />
        </button>
      </div>

    </motion.div>
  );
}
