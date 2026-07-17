"use client";

import { cn } from "@/lib/utils";
import { Sparkline } from "../../shared";
import { Database, Sparkles, FileText, Mail, Server, Users, HardDrive, Activity } from "lucide-react";

const iconMap = {
  Database,
  Sparkles,
  FileText,
  Mail,
  Server,
  Users,
  HardDrive,
  Activity
};

export function SystemHealthPanel({ systems, loading, onViewAll, onOpenSystem }) {
  if (loading) {
    return (
      <div className="rounded-xl border border-[#28313C] bg-[#0E1116] flex flex-col h-full min-h-[300px] p-[20px]">
        <div className="flex items-center justify-between pb-[16px]">
          <h3 className="text-[16px] font-semibold text-white tracking-wide">System Health</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#28313C] bg-[#0E1116] flex flex-col h-full p-[20px]">

      {/* Header */}
      <div className="flex items-center justify-between pb-[16px] shrink-0">
        <h3 className="text-[16px] font-semibold text-white tracking-wide">System Health</h3>
        <button type="button" onClick={onViewAll} className="text-[13px] font-medium text-[#4EA1FF] hover:text-white transition-colors">
          View all
        </button>
      </div>

      {/* Grid: 2 columns, 4 rows */}
      <div className="grid grid-cols-1 md:grid-cols-2 flex-1 gap-x-6">
        {systems.map((sys, idx) => {
          const Icon = iconMap[sys.icon] || Activity;
          const isHealthy = sys.status === "Healthy";

          // Generate realistic looking sparkline data
          const sparkData = Array.from({ length: 20 }, () => isHealthy ? 98 + Math.random() * 2 : 85 + Math.random() * 10);

          return (
            <button
              key={sys.name}
              type="button"
              onClick={() => onOpenSystem?.(sys)}
              className={cn(
                "flex items-center justify-between py-[12px] transition-colors hover:bg-white/5 cursor-pointer rounded px-2 -mx-2 group animate-fade-up text-left",
                idx < systems.length - 2 && "border-b border-[#28313C]/50"
              )}
              style={{ animationDelay: `${100 + (idx * 50)}ms`, animationFillMode: 'both' }}
            >
              {/* Left Side: Icon & Name */}
              <div className="flex items-center gap-3">
                <div className="size-6 rounded border border-[#28313C] flex items-center justify-center bg-[#141A22] shrink-0 group-hover:border-white/20 transition-colors">
                  <Icon className="size-3.5 text-muted-foreground" />
                </div>
                <span className="text-[13px] font-medium text-white truncate max-w-[160px]">{sys.name}</span>
              </div>

              {/* Right Side: Status, Uptime, Sparkline */}
              <div className="flex items-center gap-4 shrink-0">
                <div className={cn(
                  "flex items-center gap-1.5 rounded px-2 py-0.5 border text-[11px] font-bold w-20 justify-center",
                  isHealthy ? "bg-primary/10 border-primary/20 text-primary" : "bg-warning/10 border-warning/20 text-warning"
                )}>
                  <span className={cn("size-1.5 rounded-full", isHealthy ? "bg-primary" : "bg-warning")} />
                  {sys.status}
                </div>
                <span className="text-[12px] text-white font-medium w-10 text-right">{sys.uptime}</span>
                <div className="w-[60px] h-[24px] flex items-center">
                  <Sparkline data={sparkData} stroke={isHealthy ? "var(--primary)" : "var(--warning)"} className="h-full w-full" strokeWidth={1.5} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
}
