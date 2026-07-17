"use client";

import { cn } from "@/lib/utils";
import { LayoutDashboard, User, Zap, Bell, ShieldCheck, TerminalSquare, Activity } from "lucide-react";

export const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "personal-info", label: "Personal Information", icon: User },
  { id: "ai-preferences", label: "AI Preferences", icon: Zap },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security & Sessions", icon: ShieldCheck },
  { id: "developer", label: "Developer & API", icon: TerminalSquare },
  { id: "activity", label: "Activity", icon: Activity },
];

export function ProfileNav({ activeTab, onChange }) {
  return (
    <div className="w-full border-b border-[#28313C] mb-8 overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-1 min-w-max pb-[1px]">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative flex items-center gap-2.5 px-4 py-3 text-[14px] font-medium transition-all",
                isActive ? "text-white" : "text-muted-foreground hover:text-white hover:bg-white/5 rounded-t-lg"
              )}
            >
              <tab.icon className={cn("size-4", isActive ? "text-primary" : "text-muted-foreground")} />
              {tab.label}
              
              {/* Active Indicator Line */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary shadow-[0_-2px_10px_rgba(78,161,255,0.5)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
