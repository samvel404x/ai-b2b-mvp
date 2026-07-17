"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, Calendar, Filter, Zap, Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TABS = [
  { id: "board", label: "Board" },
  { id: "my_tasks", label: "My Tasks", badge: "12" },
  { id: "submissions", label: "Submissions" },
  { id: "team", label: "Team" },
  { id: "activity", label: "Activity" },
  { id: "analytics", label: "Analytics" },
];

export function CrmHeader({
  activeTab = "board",
  onTabChange,
  myTaskCount = 0,
  dateRangeLabel = "This week",
  busy = false,
  onCreateTask,
  onOpenFilters,
  onOpenAutomations,
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [created, setCreated] = useState(false);

  const tabs = TABS.map((tab) => (
    tab.id === "my_tasks" ? { ...tab, badge: String(myTaskCount) } : tab
  ));

  const handleCreateTask = async () => {
    if (!onCreateTask) return;
    setIsCreating(true);
    try {
      await onCreateTask();
      setCreated(true);
      setTimeout(() => setCreated(false), 2000);
    } catch {
      setCreated(false);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#28313C] px-6 py-3.5 shrink-0 bg-[#0E1116]">
      
      {/* Left Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none relative">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap overflow-hidden group",
                isActive 
                  ? "text-white bg-[#141A22]/50" 
                  : "text-muted-foreground hover:bg-[#141A22] hover:text-white"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeCrmTab" 
                  className="absolute inset-0 rounded-lg border border-[#28313C] bg-[#141A22]" 
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
              {tab.badge && (
                <span className={cn(
                  "relative z-10 rounded-full px-2 py-0.5 text-[10px] font-bold border",
                  isActive ? "bg-[#4EA1FF]/10 text-[#4EA1FF] border-[#4EA1FF]/30" : "bg-[#28313C] text-muted-foreground border-transparent"
                )}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-none shrink-0">
        <button type="button" onClick={() => onTabChange?.("analytics")} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#28313C] bg-[#141A22] hover:bg-[#28313C] transition-colors text-xs font-semibold text-white whitespace-nowrap">
          <Calendar className="size-3.5 text-muted-foreground" />
          {dateRangeLabel}
        </button>
        
        <button type="button" onClick={onOpenFilters} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#28313C] bg-transparent hover:bg-[#141A22] transition-colors text-xs font-semibold text-white whitespace-nowrap">
          <Filter className="size-3.5 text-muted-foreground" />
          Filters
        </button>

        <button type="button" onClick={onOpenAutomations} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#28313C] bg-transparent hover:bg-[#141A22] transition-colors text-xs font-semibold text-white whitespace-nowrap">
          <Zap className="size-3.5 text-muted-foreground" />
          Automations
        </button>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreateTask}
          disabled={isCreating || created || busy}
          className={cn(
            "flex items-center gap-2 px-5 py-2 rounded-lg transition-all text-xs font-bold text-white whitespace-nowrap shadow-[0_0_15px_rgba(78,161,255,0.2)]",
            created ? "bg-primary" : "bg-[#4EA1FF] hover:bg-[#4EA1FF]"
          )}
        >
          <AnimatePresence mode="wait">
            {isCreating ? (
              <motion.div key="creating" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="flex items-center gap-2">
                <Loader2 className="size-3.5 animate-spin" /> Creating...
              </motion.div>
            ) : created ? (
              <motion.div key="created" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                <Check className="size-3.5" /> Created
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="flex items-center gap-2">
                <Plus className="size-3.5" /> Create Task
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
      
    </div>
  );
}
