"use client";

import { motion } from "framer-motion";
import { Clock, User, Bell, Workflow, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ExecutionPreview({ scenarioData, itemVariants, onConfigureExecution }) {
  return (
    <motion.div variants={itemVariants} className="flex flex-col gap-3 rounded-xl border border-[#28313C] bg-gradient-to-b from-[#0E1116] to-[#080A0E] p-5">
      
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <Workflow className="size-4" /> 4. Execution Preview
        </h3>
      </div>

      <div className="flex flex-col gap-4 flex-1 mt-1">
        
        {/* Timeline Steps */}
        <div className="relative pl-5 space-y-5">
          <div className="absolute left-[9px] top-2 bottom-2 w-px bg-[#28313C]" />

          <div className="relative flex flex-col gap-1.5">
            <div className="absolute -left-[25px] top-1 size-3.5 rounded-full bg-primary border-2 border-[#141A22] z-10" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Step 1: Generate PO</span>
            <span className="text-sm text-muted-foreground leading-relaxed">
              Automated PO for {scenarioData.quantity} to Global Logistics Co.
            </span>
          </div>

          <div className="relative flex flex-col gap-1.5">
            <div className="absolute -left-[25px] top-1 size-3.5 rounded-full bg-[#4EA1FF] border-2 border-[#141A22] z-10" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Step 2: Sync Systems</span>
            <span className="text-sm text-muted-foreground leading-relaxed">
              Write to Oracle ERP & update Salesforce CRM.
            </span>
          </div>

          <div className="relative flex flex-col gap-1.5">
            <div className="absolute -left-[25px] top-1 size-3.5 rounded-full bg-[#28313C] border-2 border-[#141A22] z-10" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Step 3: Notify Stakeholders</span>
            <div className="flex flex-col gap-1.5 mt-1">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Bell className="size-3.5" /> #ops-alerts (Slack)
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Bell className="size-3.5" /> Finance Team (Email)
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Meta */}
      <div className="mt-auto pt-4 border-t border-[#28313C]/50 grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Executor</span>
          <span className="text-sm font-medium text-white flex items-center gap-1.5">
            <User className="size-3.5 text-primary" /> AI Agent
          </span>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Timing</span>
          <span className="text-sm font-medium text-white flex items-center justify-end gap-1.5">
            <Clock className="size-3.5 text-primary" /> Immediate
          </span>
        </div>
      </div>
      
      <div className="mt-3 text-center">
        <button type="button" onClick={onConfigureExecution} className="text-xs font-bold text-[#4EA1FF] hover:text-[#4EA1FF]/80 transition-colors flex items-center gap-1.5 mx-auto">
          Configure execution <ArrowRight className="size-3.5" />
        </button>
      </div>

    </motion.div>
  );
}
