"use client";

import { motion } from "framer-motion";
import { ShieldCheck, FileText, Database, Activity, User, ArrowRight } from "lucide-react";

export function EvidenceAndConfidence({ scenarioData, itemVariants, onOpenEvidence }) {
  const scenarioConfidence = Math.max(0, Math.min(100, Number(scenarioData?.confidence || 92)));

  return (
    <motion.div variants={itemVariants} className="flex flex-col gap-3 rounded-xl border border-[#28313C] bg-gradient-to-b from-[#0E1116] to-[#080A0E] p-5">
      
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <ShieldCheck className="size-4" /> 2. Evidence & Confidence
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-5 flex-1 mt-1">
        
        {/* Left Column: Confidence Factors */}
        <div className="flex flex-col gap-4 pr-4 border-r border-[#28313C]/50">
          
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-white">
                <div className="size-2 rounded-full bg-primary" /> Data completeness
              </span>
              <span className="font-bold text-white">92%</span>
            </div>
            <div className="h-1 w-full bg-[#28313C] rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: "92%" }} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-white">
                <div className="size-2 rounded-full bg-primary" /> Forecast reliability
              </span>
              <span className="font-bold text-white">{scenarioConfidence}%</span>
            </div>
            <div className="h-1 w-full bg-[#28313C] rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${scenarioConfidence}%` }} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-white">
                <div className="size-2 rounded-full bg-primary" /> Policy compliance
              </span>
              <span className="font-bold text-white">Passed</span>
            </div>
            <div className="h-1 w-full bg-[#28313C] rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: "100%" }} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-white">
                <div className="size-2 rounded-full bg-warning" /> Supplier reliability
              </span>
              <span className="font-bold text-warning">Warning</span>
            </div>
            <div className="h-1 w-full bg-[#28313C] rounded-full overflow-hidden">
              <div className="h-full bg-warning rounded-full" style={{ width: "60%" }} />
            </div>
          </div>

        </div>

        {/* Right Column: Evidence Sources */}
        <div className="flex flex-col gap-4">
          <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Key evidence sources</span>
          
          <div className="flex flex-col gap-3.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
              <FileText className="size-4" /> Sales history (90d)
            </span>
            <span className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
              <Database className="size-4" /> Inventory system
            </span>
            <span className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
              <Activity className="size-4" /> Market demand signals
            </span>
            <span className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
              <User className="size-4" /> Supplier performance
            </span>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 text-center border-t border-[#28313C]/50">
        <button type="button" onClick={onOpenEvidence} className="text-xs font-bold text-[#4EA1FF] hover:text-[#4EA1FF]/80 transition-colors flex items-center gap-1.5 mx-auto">
          View all evidence <ArrowRight className="size-3.5" />
        </button>
      </div>

    </motion.div>
  );
}
