"use client";

import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, ArrowRight, ArrowUp, ArrowDown, Info, BrainCircuit, Box, Clock, Database, Building2, Zap, DollarSign, Target, Activity, Droplets } from "lucide-react";
import { AnimatedMetric } from "./animated-metric";
import { Ring } from "../../shared";
import { cn } from "@/lib/utils";

const Sparkline = ({ data, color, glow }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d - min) / range) * 100;
    return `${x},${y}`;
  }).join(" ");

  const colorId = color.replace('#', '');

  return (
    <div className="w-full h-full overflow-hidden">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
        {glow && (
          <polyline points={points} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="opacity-30 blur-[4px]" />
        )}
        <polyline points={points} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <defs>
          <linearGradient id={`grad-${colorId}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,100 ${points} 100,100`} fill={`url(#grad-${colorId})`} />
      </svg>
    </div>
  );
};

export function RecommendationSection({ scenarioData, itemVariants, onOpenRationale }) {
  const revenue = scenarioData.cost + scenarioData.benefit;

  return (
    <motion.div variants={itemVariants} className="flex flex-col gap-4">
      
      {/* Top Hero Card */}
      <div className="flex flex-col rounded-xl border border-[#4EA1FF]/40 bg-gradient-to-br from-[#141A22] to-[#0E1116] overflow-hidden relative shadow-[0_0_50px_rgba(30,58,138,0.15)]">
        <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-[#4EA1FF] shadow-[0_0_10px_#4EA1FF]" />
        
        <div className="flex flex-col xl:flex-row xl:items-start p-6 lg:p-8 gap-8">
          
          {/* Main Text Content */}
          <div className="flex flex-col flex-1 gap-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#4EA1FF] flex items-center gap-1.5">
              <ShieldCheck className="size-4" /> AI RECOMMENDATION
            </span>
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">Order {scenarioData.quantity} of mushrooms</h2>
              <p className="text-base text-muted-foreground leading-relaxed max-w-xl">
                Replenish inventory to optimize availability and prevent stockouts based on rising demand and projected inventory depletion in 3–5 days.
              </p>
            </div>
          </div>

          {/* Right Side Info (Confidence + Execution Stats) */}
          <div className="flex flex-col sm:flex-row items-center gap-8 shrink-0">
            
            {/* Confidence Ring */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <Ring value={scenarioData.confidence} size={120} stroke="var(--primary)" hideLabel />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-white leading-none tabular-nums flex items-end">
                    <AnimatedMetric value={scenarioData.confidence} />
                    <span className="text-xl text-muted-foreground ml-0.5">%</span>
                  </span>
                  <span className="text-xs uppercase font-bold text-muted-foreground mt-2 tracking-widest">Confidence</span>
                </div>
              </div>
              <span className="mt-4 px-3 py-1 rounded border border-primary/30 bg-primary/10 text-xs font-bold uppercase tracking-widest text-primary">
                High
              </span>
            </div>

            {/* Execution Details */}
            <div className="flex flex-col gap-4 pl-0 sm:pl-8 sm:border-l border-[#28313C]">
              <div className="flex items-center gap-3">
                <BrainCircuit className="size-5 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider leading-none mb-1">Executor</span>
                  <span className="text-sm font-medium text-white leading-none">AI Procurement Agent</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="size-5 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider leading-none mb-1">Supplier</span>
                  <span className="text-sm font-medium text-white leading-none">Global Logistics Co.</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Box className="size-5 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider leading-none mb-1">Est. delivery</span>
                  <span className="text-sm font-medium text-white leading-none">May 23, 2026 (3 days)</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="size-5 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider leading-none mb-1">Execution window</span>
                  <span className="text-sm font-medium text-white leading-none">Immediate upon approval</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Database className="size-5 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider leading-none mb-1">Systems affected</span>
                  <span className="text-sm font-medium text-white leading-none">6 systems</span>
                </div>
              </div>

              <div className="mt-2 text-right">
                <button type="button" onClick={onOpenRationale} className="text-sm font-semibold text-[#4EA1FF] hover:text-[#4EA1FF]/80 transition-colors flex items-center gap-1.5 ml-auto">
                  View full rationale <ArrowRight className="size-4" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Metric 1: Revenue Protected */}
        <div className="flex flex-col rounded-xl border border-[#28313C] bg-gradient-to-b from-[#0E1116] to-[#080A0E] p-4 relative overflow-hidden order-1 lg:order-1">
          <div className="flex items-center justify-between mb-2 z-10">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-full bg-[#28313C] flex items-center justify-center shrink-0 border border-[#28313C]">
                <DollarSign className="size-3 text-muted-foreground" />
              </div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Revenue protected</span>
            </div>
            <Info className="size-3 text-muted-foreground/50" />
          </div>
          
          <div className="text-xl font-bold text-white tabular-nums flex items-baseline z-10">
            <span className="text-sm mr-0.5 text-muted-foreground">$</span>
            <AnimatedMetric value={revenue} format="number" duration={800} />
          </div>
          
          <div className="flex items-center gap-1 mt-1 z-10">
            <ArrowUp className="size-3 text-emerald-500" />
            <span className="text-[10px] text-muted-foreground">12% vs last week</span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-12 opacity-50">
            <Sparkline data={[10, 15, 12, 18, 22, 20, 25, 28, 30]} color="#778493" />
          </div>
        </div>

        {/* Metric 2: Purchase Cost */}
        <div className="flex flex-col rounded-xl border border-[#28313C] bg-gradient-to-b from-[#0E1116] to-[#080A0E] p-4 relative overflow-hidden order-2 lg:order-2">
          <div className="flex items-center justify-between mb-2 z-10">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-full bg-[#28313C] flex items-center justify-center shrink-0 border border-[#28313C]">
                <DollarSign className="size-3 text-muted-foreground" />
              </div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Purchase cost</span>
            </div>
            <Info className="size-3 text-muted-foreground/50" />
          </div>
          
          <div className="text-xl font-bold text-white tabular-nums flex items-baseline z-10">
            <span className="text-sm mr-0.5 text-muted-foreground">$</span>
            <AnimatedMetric value={scenarioData.cost} format="number" duration={800} />
          </div>
          
          <div className="flex items-center gap-1 mt-1 z-10">
            <ArrowUp className="size-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">8% vs last week</span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-12 opacity-50">
            <Sparkline data={[5, 8, 7, 10, 12, 11, 14, 15, 16]} color="#778493" />
          </div>
        </div>

        {/* Metric 3: Net Benefit (DOMINANT) */}
        <div className="flex flex-col rounded-xl border border-[#4EA1FF]/40 bg-gradient-to-br from-[#4EA1FF]/30 to-[#0E1116] p-4 relative overflow-hidden shadow-[0_0_30px_rgba(78,161,255,0.15)] order-3 lg:order-3">
          <div className="flex items-center justify-between mb-2 z-10">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                <ShieldCheck className="size-3 text-primary" />
              </div>
              <span className="text-[10px] text-primary uppercase font-bold tracking-wider">Net expected benefit</span>
            </div>
            <Info className="size-3 text-primary/50" />
          </div>
          
          <div className="text-2xl font-bold text-white tabular-nums flex items-baseline z-10 mt-1">
            <span className="text-lg mr-0.5 text-primary/80">$</span>
            <AnimatedMetric value={scenarioData.benefit} format="number" duration={800} />
          </div>
          
          <div className="flex items-center gap-1 mt-1 z-10">
            <ArrowUp className="size-3 text-primary" />
            <span className="text-[10px] text-primary/80 font-medium">18% vs last week</span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-16 opacity-80">
            <Sparkline data={[10, 12, 15, 20, 25, 22, 30, 35, 45]} color="#4EA1FF" glow />
          </div>
        </div>

        {/* Metric 4: Estimated ROI */}
        <div className="flex flex-col rounded-xl border border-[#28313C] bg-gradient-to-b from-[#0E1116] to-[#080A0E] p-4 relative overflow-hidden order-4 lg:order-4">
          <div className="flex items-center justify-between mb-2 z-10">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-full bg-[#28313C] flex items-center justify-center shrink-0 border border-[#28313C]">
                <Activity className="size-3 text-muted-foreground" />
              </div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Estimated ROI</span>
            </div>
            <Info className="size-3 text-muted-foreground/50" />
          </div>
          
          <div className="text-xl font-bold text-white tabular-nums flex items-baseline z-10">
            <AnimatedMetric value={scenarioData.roi} format="number" duration={800} />
            <span className="text-base ml-0.5 text-muted-foreground">%</span>
          </div>
          
          <div className="flex items-center gap-1 mt-1 z-10">
            <ArrowUp className="size-3 text-emerald-500" />
            <span className="text-[10px] text-muted-foreground">16% vs last week</span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-12 opacity-50">
            <Sparkline data={[50, 80, 70, 100, 120, 110, 140, 160, 196]} color="#778493" />
          </div>
        </div>

        {/* Metric 5: Operational Coverage */}
        <div className="flex flex-col rounded-xl border border-[#28313C] bg-gradient-to-b from-[#0E1116] to-[#080A0E] p-4 relative overflow-hidden order-5 lg:order-5">
          <div className="flex items-center justify-between mb-2 z-10">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-full bg-[#28313C] flex items-center justify-center shrink-0 border border-[#28313C]">
                <Target className="size-3 text-muted-foreground" />
              </div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Operational coverage</span>
            </div>
          </div>
          
          <div className="text-xl font-bold text-white tabular-nums flex items-baseline z-10">
            <AnimatedMetric value={92} format="number" duration={800} />
            <span className="text-base ml-0.5 text-muted-foreground">%</span>
          </div>
          
          <div className="flex items-center gap-1 mt-1 z-10">
            <span className="text-[10px] text-muted-foreground">Service level</span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 h-1 bg-[#28313C] rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: "92%" }} />
          </div>
        </div>

      </div>
    </motion.div>
  );
}
