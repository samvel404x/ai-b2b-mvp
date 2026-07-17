"use client";

import { useState } from "react";
import { Activity, Search, Filter, Download, User, Bot, ShieldAlert, FileText, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ActivityTab() {
  const events = [
    { id: "e1", action: "Contract approved", target: "TechSoft Solutions · Vendor renewal", actor: "Alex Rivera", actorType: "user", time: "14 minutes ago", type: "approval", icon: CheckCircle2, status: "success" },
    { id: "e2", action: "AI conclusion reviewed", target: "Q2 savings opportunity", actor: "Alex Rivera", actorType: "user", time: "2 hours ago", type: "ai", icon: Bot, status: "info" },
    { id: "e3", action: "Report exported", target: "Q2 financial report to PDF", actor: "Alex Rivera", actorType: "user", time: "5 hours ago", type: "report", icon: FileText, status: "warning" },
    { id: "e4", action: "AI recommendation rejected", target: "Budget reallocation", actor: "Alex Rivera", actorType: "user", time: "7 hours ago", type: "ai", icon: Bot, status: "error" },
    { id: "e5", action: "Two-factor authentication enabled", target: "Authenticator app (TOTP)", actor: "Alex Rivera", actorType: "user", time: "1 day ago", type: "security", icon: ShieldAlert, status: "success" },
    { id: "e6", action: "API token created", target: "Acme ETL Integration", actor: "Alex Rivera", actorType: "user", time: "2 days ago", type: "developer", icon: LockKeyhole, status: "primary" },
    { id: "e7", action: "Notification preferences updated", target: "Quiet hours schedule", actor: "Alex Rivera", actorType: "user", time: "3 days ago", type: "profile", icon: User, status: "primary" },
    { id: "e8", action: "Agent executed workflow", target: "Weekly vendor compliance check", actor: "Compliance Agent", actorType: "ai", time: "4 days ago", type: "ai", icon: Bot, status: "info" },
  ];
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(6);
  const cleanQuery = query.trim().toLowerCase();
  const filteredEvents = events.filter((event) => {
    const matchesType = typeFilter === "all" || event.type === typeFilter;
    const matchesQuery = !cleanQuery || `${event.action} ${event.target} ${event.actor} ${event.type}`.toLowerCase().includes(cleanQuery);
    return matchesType && matchesQuery;
  });
  const visibleEvents = filteredEvents.slice(0, visibleCount);

  const cycleFilter = () => {
    setTypeFilter((value) => value === "all" ? "ai" : value === "ai" ? "security" : "all");
    setVisibleCount(6);
  };

  const exportActivity = () => {
    const rows = [["action", "target", "actor", "type", "time"], ...filteredEvents.map((event) => [event.action, event.target, event.actor, event.type, event.time])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([`${csv}\n`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "genius-profile-activity.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-semibold text-white tracking-tight">Recent Activity</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input 
              type="text" 
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search activity..." 
              className="bg-[#0E1116] border border-[#28313C] rounded-lg pl-9 pr-4 py-2 text-[13px] text-white focus:outline-none focus:border-primary transition-colors w-[240px]"
            />
          </div>
          <Button variant="outline" onClick={cycleFilter} className="bg-[#0E1116] border-[#28313C] text-muted-foreground hover:text-white h-9 px-3">
            <Filter className="size-4 mr-2" /> {typeFilter === "all" ? "All" : typeFilter}
          </Button>
          <Button variant="outline" onClick={exportActivity} className="bg-[#0E1116] border-[#28313C] text-muted-foreground hover:text-white h-9 px-3">
            <Download className="size-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      <div className="bg-[#0E1116] border border-[#28313C] rounded-xl overflow-hidden shadow-sm p-2">
        <div className="flex flex-col divide-y divide-[#28313C]/40">
          {visibleEvents.map((evt) => {
            let dotColor = "text-muted-foreground bg-muted";
            if (evt.status === "success") dotColor = "text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20";
            else if (evt.status === "info") dotColor = "text-[#0EA5E9] bg-[#0EA5E9]/10 border-[#0EA5E9]/20";
            else if (evt.status === "warning") dotColor = "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20";
            else if (evt.status === "error") dotColor = "text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20";
            else if (evt.status === "primary") dotColor = "text-primary bg-primary/10 border-primary/20";

            return (
              <div key={evt.id} className="flex items-start gap-4 p-4 hover:bg-white/[0.02] transition-colors group">
                <div className={cn("size-8 rounded-full border flex items-center justify-center shrink-0 mt-0.5", dotColor)}>
                  <evt.icon className="size-4" />
                </div>
                
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-1 sm:gap-4 mb-1">
                    <span className="text-[14px] font-semibold text-white/90 group-hover:text-white transition-colors">{evt.action}</span>
                    <span className="text-[12px] text-muted-foreground shrink-0">{evt.time}</span>
                  </div>
                  
                  <span className="text-[13px] text-white/70 mb-2 truncate">{evt.target}</span>
                  
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>Performed by <strong className="text-white/80 font-medium">{evt.actor}</strong></span>
                    {evt.actorType === "ai" && <span className="bg-primary/20 text-primary border border-primary/20 px-1.5 py-0.5 rounded uppercase tracking-widest font-bold text-[9px] ml-1">AI Agent</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center pt-2">
        <Button
          variant="ghost"
          onClick={() => setVisibleCount((count) => Math.min(count + 4, filteredEvents.length))}
          disabled={visibleCount >= filteredEvents.length}
          className="text-muted-foreground hover:text-white disabled:opacity-45"
        >
          {visibleCount >= filteredEvents.length ? "All matching activity loaded" : "Load more activity"}
        </Button>
      </div>
    </div>
  );
}

// Dummy icon to avoid missing import
function CheckCircle2(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
