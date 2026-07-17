"use client";

import { motion } from "framer-motion";
import { User, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SituationSection({ report, itemVariants, onOpenDetails }) {
  const metrics = report?.decision?.metrics || {};

  return (
    <motion.div variants={itemVariants} className="flex flex-col gap-3 rounded-xl border border-[#28313C] bg-gradient-to-b from-[#0E1116] to-[#080A0E] p-5">
      
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <User className="size-4" /> 1. Situation Summary
        </h3>
      </div>

      <div className="flex flex-col gap-4">
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Demand growth</span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-[#4EA1FF]">{metrics.trend || "+22%"}</span>
            {/* Simple CSS sparkline mock */}
            <div className="flex items-end gap-[1px] h-4">
              <div className="w-[2px] h-[30%] bg-[#4EA1FF]/40" />
              <div className="w-[2px] h-[40%] bg-[#4EA1FF]/50" />
              <div className="w-[2px] h-[60%] bg-[#4EA1FF]/60" />
              <div className="w-[2px] h-[50%] bg-[#4EA1FF]/70" />
              <div className="w-[2px] h-[80%] bg-[#4EA1FF]/80" />
              <div className="w-[2px] h-[100%] bg-[#4EA1FF]" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current inventory</span>
          <span className="text-sm font-bold text-white">{metrics.intake || "50 kg"}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Forecasted stockout</span>
          <span className="text-sm font-bold text-white">3 – 5 days</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Forecast uncertainty</span>
          <span className="text-sm font-bold text-warning">{metrics.risk || "Medium"}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Detected</span>
          <span className="text-sm font-medium text-white">{report?.date || "May 20, 09:15 AM"}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Data freshness</span>
          <div className="flex flex-col items-end gap-1">
            <span className="text-sm font-bold text-primary">4m ago</span>
            <span className="text-xs text-primary/80 leading-none">Very fresh</span>
          </div>
        </div>

      </div>

      <div className="mt-auto pt-4 text-center">
        <button type="button" onClick={onOpenDetails} className="text-xs font-bold text-[#4EA1FF] hover:text-[#4EA1FF]/80 transition-colors flex items-center gap-1.5 mx-auto">
          View details <ArrowRight className="size-3.5" />
        </button>
      </div>
      
    </motion.div>
  );
}
