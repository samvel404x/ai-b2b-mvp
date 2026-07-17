"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, FileText, Lock, Activity, Users, BarChart3, RefreshCw, ArrowUp, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import { Ring, Sparkline } from "../../shared";
import { AnimatedMetric } from "../ai-gateway/animated-metric";

const ICONS = {
  open: <FileText className="size-4" />,
  progress: <RefreshCw className="size-4" />,
  waiting: <Clock className="size-4" />,
  submitted: <CheckCircle2 className="size-4" />,
  blocked: <Lock className="size-4" />,
  sla: <Activity className="size-4" />,
  capacity: <Users className="size-4" />,
  throughput: <BarChart3 className="size-4" />
};

export function CrmMetrics({ metrics = [] }) {
  return (
    <div className="grid min-w-0 shrink-0 grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 border-b border-[#28313C] px-5 py-5">
      {metrics.map((metric, index) => {
        // Extract numeric value from strings like "67" or "96%" for AnimatedMetric
        const isPercentage = metric.value.includes("%");
        const numValue = parseInt(metric.value.replace(/\D/g, ""));
        
        return (
        <motion.div 
          key={metric.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.05, ease: [0.23, 1, 0.32, 1] }}
          whileHover={{ y: -2 }}
          className={cn(
            "flex min-h-[150px] min-w-0 flex-col rounded-2xl border bg-gradient-to-b from-[#141A22] to-[#0E1116] p-4 relative overflow-hidden group transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg",
            metric.color === "primary" ? "border-[#28313C] hover:border-[#4EA1FF]/40" :
            metric.color === "warning" ? "border-[#28313C] hover:border-warning/40" :
            "border-[#28313C] hover:border-critical/40"
          )}
        >
          {/* Subtle top glow */}
          <div className={cn(
            "absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent transition-colors duration-500",
            metric.color === "primary" ? "via-[#28313C] group-hover:via-[#4EA1FF]/60 to-transparent" :
            metric.color === "warning" ? "via-[#28313C] group-hover:via-warning/60 to-transparent" :
            "via-[#28313C] group-hover:via-critical/60 to-transparent"
          )} />

          <div className="flex flex-col gap-4 h-full justify-between z-10 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={cn(
                  "flex size-7 items-center justify-center rounded-lg border",
                  metric.color === "primary" ? "bg-[#4EA1FF]/10 border-[#4EA1FF]/20 text-[#4EA1FF] shadow-[0_0_10px_rgba(78,161,255,0.15)]" :
                  metric.color === "warning" ? "bg-warning/10 border-warning/20 text-warning shadow-[0_0_10px_rgba(245,158,11,0.15)]" :
                  "bg-critical/10 border-critical/20 text-critical shadow-[0_0_10px_rgba(239,68,68,0.15)]"
                )}>
                  {ICONS[metric.id] || <Activity className="size-4" />}
                </div>
                <span className="text-[11px] font-bold text-white uppercase tracking-widest">{metric.title}</span>
              </div>
            </div>

            <div className="flex items-end justify-between mt-1">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline gap-1">
                  {metric.type !== "circular" && (
                    <span className="text-3xl font-extrabold text-white leading-none tracking-tighter drop-shadow-sm">
                      <AnimatedMetric value={numValue} format="number" duration={800} />
                      {isPercentage && "%"}
                    </span>
                  )}
                  {metric.type === "circular" && metric.target && (
                    <div className="flex flex-col mt-2">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Target</span>
                      <span className="text-lg font-bold text-white leading-none tracking-tighter drop-shadow-sm">{metric.target}</span>
                    </div>
                  )}
                </div>
                
                {metric.change && (
                  <div className="flex items-center gap-1.5 mt-1 bg-[#141A22]/50 px-2 py-0.5 rounded-md w-fit border border-[#28313C]">
                    {metric.trend === "up" ? (
                      <ArrowUp className={cn("size-3.5", metric.color === "primary" ? "text-[#4EA1FF]" : metric.color === "warning" ? "text-warning" : "text-critical")} strokeWidth={3} />
                    ) : (
                      <ArrowDown className={cn("size-3.5", metric.color === "primary" ? "text-[#4EA1FF]" : metric.color === "warning" ? "text-warning" : "text-critical")} strokeWidth={3} />
                    )}
                    <span className={cn(
                      "text-[11px] font-bold tracking-tight",
                      metric.color === "primary" ? "text-[#4EA1FF]" : metric.color === "warning" ? "text-warning" : "text-critical"
                    )}>{metric.change}</span>
                  </div>
                )}
                {metric.subtitle && (
                  <span className="text-[11px] font-semibold text-muted-foreground mt-1 tracking-wide">{metric.subtitle}</span>
                )}
              </div>

              <div className="w-[52px] h-[52px] flex items-center justify-center relative">
                {metric.type === "circular" ? (
                  <div className="flex flex-col items-center justify-center w-full h-full relative">
                    <Ring value={metric.progress} size={52} stroke="#4EA1FF" hideLabel={true} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-extrabold text-white drop-shadow-md leading-none">
                        <AnimatedMetric value={numValue} format="number" duration={800} />
                      </span>
                    </div>
                  </div>
                ) : metric.type === "bar" ? (
                  <div className="flex items-end gap-1.5 h-full w-full opacity-90 group-hover:opacity-100 transition-opacity justify-end">
                    {metric.data?.map((val, i) => (
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${(val / 50) * 100}%` }}
                        transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                        key={i} 
                        className="w-2 bg-[#4EA1FF]/60 hover:bg-[#4EA1FF] rounded-t-sm transition-colors cursor-crosshair" 
                      />
                    ))}
                  </div>
                ) : metric.sparkline ? (
                  <Sparkline 
                    data={metric.sparkline} 
                    stroke={metric.color === "primary" ? "#4EA1FF" : metric.color === "warning" ? "var(--warning)" : "var(--critical)"} 
                    className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" 
                  />
                ) : null}
              </div>
            </div>
          </div>
        </motion.div>
      )})}
    </div>
  );
}
