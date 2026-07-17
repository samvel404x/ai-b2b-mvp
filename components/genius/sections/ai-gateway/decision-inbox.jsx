"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ListFilter, ArrowDownUp, Package, AlertTriangle, CheckCircle2, Clock, Search, Folder, User } from "lucide-react";
import { Panel } from "../../shared";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "../../skeleton";

export function DecisionInbox({ reports = [], selectedReportId, onSelectReport, isLoading }) {
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("newest"); // newest, oldest, urgent
  const [search, setSearch] = useState("");

  const filteredAndSortedReports = useMemo(() => {
    let result = [...reports];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r => 
        r.title.toLowerCase().includes(q) || 
        r.id?.toLowerCase().includes(q) ||
        r.department?.toLowerCase().includes(q)
      );
    }

    // Filter
    if (filter === "Pending AI Review") result = result.filter((r) => r.status === "Pending AI Review");
    if (filter === "Pending Human") result = result.filter((r) => r.status === "Ready" || r.status === "Pending");
    if (filter === "Urgent") result = result.filter((r) => r.urgent);

    // Sort
    result.sort((a, b) => {
      if (sort === "urgent") {
        if (a.urgent && !b.urgent) return -1;
        if (!a.urgent && b.urgent) return 1;
      }
      // Assuming 'createdAt' exists for real sorting, otherwise fallback to simple string compare or keep original order
      // For mock data, we just preserve order unless urgent
      return 0; 
    });

    return result;
  }, [reports, filter, sort, search]);

  if (isLoading) {
    return (
      <div className="flex w-full shrink-0 flex-col bg-[#0E1116] border-r border-[#28313C]">
        <div className="flex items-center justify-between border-b border-[#28313C] p-4">
          <Skeleton className="h-4 w-12 bg-white/5" />
          <Skeleton className="h-4 w-4 bg-white/5" />
        </div>
        <div className="p-3 space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex gap-3 p-3 rounded-xl border border-transparent">
              <Skeleton className="size-10 rounded-lg shrink-0 bg-white/5" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-3/4 bg-white/5" />
                <Skeleton className="h-2 w-1/2 bg-white/5" />
                <Skeleton className="h-2 w-1/4 mt-2 bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full shrink-0 flex-col bg-transparent overflow-hidden h-full z-20">
      
      {/* Header & Controls */}
      <div className="flex flex-col border-b border-[#28313C]">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Decision Queue</h2>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none focus:ring-2 focus:ring-primary/50 rounded-sm">
                <ArrowDownUp className="size-4 text-muted-foreground hover:text-white transition-colors" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-[#0E1116] border-[#28313C] text-white">
                <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#28313C]" />
                <DropdownMenuCheckboxItem checked={sort === "newest"} onCheckedChange={() => setSort("newest")} className="focus:bg-[#141A22] focus:text-white text-sm cursor-pointer">
                  Newest First
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={sort === "urgent"} onCheckedChange={() => setSort("urgent")} className="focus:bg-[#141A22] focus:text-white text-sm cursor-pointer">
                  Urgent First
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none focus:ring-2 focus:ring-primary/50 rounded-sm">
                <ListFilter className="size-4 text-muted-foreground hover:text-white transition-colors" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-[#0E1116] border-[#28313C] text-white">
                <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">Filter</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#28313C]" />
                <DropdownMenuCheckboxItem checked={filter === "All"} onCheckedChange={() => setFilter("All")} className="focus:bg-[#141A22] focus:text-white text-sm cursor-pointer">
                  Show All
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={filter === "Pending Human"} onCheckedChange={() => setFilter("Pending Human")} className="focus:bg-[#141A22] focus:text-white text-sm cursor-pointer">
                  Pending Human Review
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={filter === "Urgent"} onCheckedChange={() => setFilter("Urgent")} className="focus:bg-[#141A22] focus:text-white text-sm cursor-pointer">
                  Show Urgent Only
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search ID, title, or department..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#141A22] border border-[#28313C] rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-none">
        {filteredAndSortedReports.length === 0 ? (
          <div className="py-8 text-center flex flex-col items-center">
             <div className="size-10 rounded-full bg-[#141A22] flex items-center justify-center mb-3">
               <Search className="size-4 text-muted-foreground" />
             </div>
            <p className="text-sm text-muted-foreground">No reports found.</p>
          </div>
        ) : (
          filteredAndSortedReports.map(report => {
            const isSelected = selectedReportId === report.id;
            const Icon = report.icon || Package;
            
            return (
              <button
                key={report.id}
                onClick={() => onSelectReport(report.id)}
                className={cn(
                  "flex w-full flex-col gap-2 rounded-lg p-4 text-left transition-colors relative overflow-hidden group focus-visible:ring-2 focus-visible:ring-primary/50 outline-none border",
                  isSelected
                    ? "border-[#28313C] bg-[#141A22]"
                    : "border-transparent hover:bg-[#141A22]/40"
                )}
              >
                {isSelected && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#4EA1FF]" />
                )}
                
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 max-w-[80%]">
                    {report.urgent && <div className="size-2 rounded-full bg-critical shrink-0" title="Urgent" />}
                    <span className={cn(
                      "text-sm font-bold truncate transition-colors",
                      isSelected ? "text-primary" : "text-white group-hover:text-primary/80"
                    )}>{report.title}</span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground shrink-0">{report.time}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 shrink-0 truncate"><Folder className="size-3.5" /> {report.department || "Operations"}</span>
                  <span className="w-px h-3 bg-[#28313C]" />
                  <span className="flex items-center gap-1.5 shrink-0 truncate"><User className="size-3.5" /> {report.assignee || "Unassigned"}</span>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex flex-col gap-1">
                    <span className={cn(
                      "text-xs font-bold",
                      report.status === "Pending AI Review" ? "text-[#4EA1FF]" :
                      report.status === "Ready" || report.status === "Pending" ? "text-warning" :
                      report.status === "Delegated" || report.status === "Approved" ? "text-primary" :
                      report.status === "Rejected" ? "text-critical" :
                      "text-muted-foreground"
                    )}>
                      {report.status}
                    </span>
                    {report.status !== "Approved" && report.status !== "Rejected" && (
                      <span className="text-[11px] text-muted-foreground">
                        SLA: 14h left
                      </span>
                    )}
                  </div>
                  
                  {report.decision?.impact?.revenue && (
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Impact</span>
                      <span className="text-xs font-bold text-white tabular-nums">
                        ${typeof report.decision.impact.revenue === 'number' ? report.decision.impact.revenue.toLocaleString() : report.decision.impact.revenue}
                      </span>
                    </div>
                  )}
                </div>

              </button>
            )
          })
        )}
      </div>
    </div>
  );
}
