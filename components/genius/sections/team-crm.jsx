"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Plus,
  ArrowUp,
  ArrowDown,
  Filter,
  Users,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  Paperclip,
  RefreshCw,
  LayoutGrid,
  ArrowRight,
  TrendingUp,
  Calendar,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Panel, Ring, Sparkline } from "../shared";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";

const initialTasks = [
  { id: "t1", title: "Review Vendor Contracts", team: "Procurement Team", priority: "Medium", initials: "SM", user: "Sarah Miller", date: "May 21", status: "todo", color: "warning" },
  { id: "t2", title: "Warehouse Stock Audit", team: "Ops Team", priority: "High", initials: "JB", user: "James Brown", date: "May 21", status: "todo", color: "critical" },
  { id: "t3", title: "Update Delivery Routes", team: "Logistics Team", priority: "Medium", initials: "DP", user: "David Patel", date: "May 22", status: "todo", color: "warning" },
  { id: "t4", title: "Equipment Maintenance Check", team: "Facilities Team", priority: "Low", initials: "KR", user: "Ken Roberts", date: "May 22", status: "todo", color: "primary" },
  { id: "t5", title: "Monthly Cost Reconciliation", team: "Finance Team", priority: "Medium", initials: "LN", user: "Lena Nguyen", date: "May 23", status: "todo", color: "warning" },
  
  // The active task is special, but we handle it via ID
  { id: "t_active", title: "Log Daily Deliveries", team: "Logistics Team", priority: "High", initials: "DP", user: "David Patel", date: "May 20", status: "in-progress", color: "primary", isActive: true },
  
  { id: "t6", title: "Quality Assurance Sampling", team: "Ops Team", priority: "High", initials: "SM", user: "Sarah Miller", date: "May 20", status: "in-progress", color: "critical" },
  { id: "t7", title: "Onboard New Drivers", team: "HR Team", priority: "Low", initials: "KR", user: "Ken Roberts", date: "May 20", status: "in-progress", color: "primary" },

  { id: "t8", title: "Daily Cash Summary", team: "Finance Team", priority: "High", initials: "LN", user: "Lena Nguyen", date: "May 20 - 9:15 AM", status: "done", color: "primary" },
  { id: "t9", title: "Stock Reconciliation Report", team: "Warehouse Team", priority: "High", initials: "JB", user: "James Brown", date: "May 20 - 8:45 AM", status: "done", color: "primary" },
  { id: "t10", title: "Procurement Request: Packaging", team: "Procurement Team", priority: "Medium", initials: "SM", user: "Sarah Miller", date: "May 20 - 8:30 AM", status: "done", color: "primary" },
  { id: "t11", title: "Line Efficiency Update", team: "Ops Team", priority: "Medium", initials: "DP", user: "David Patel", date: "May 20 - 7:50 AM", status: "done", color: "primary" },
  { id: "t12", title: "HR Attendance Summary", team: "HR Team", priority: "Low", initials: "KR", user: "Ken Roberts", date: "May 20 - 7:30 AM", status: "done", color: "primary" }
];

export default function TeamCrm() {
  const [tasks, setTasks] = useState(initialTasks);
  const [deliveryLog, setDeliveryLog] = useState(
    "08:00 - Mushrooms: 50kg received from Farm Fresh Co.\n09:15 - Leafy greens: 32 crates received.\n10:10 - Dairy shipment delayed by 20 min."
  );
  const [notes, setNotes] = useState(
    "Dairy delivery ETA updated to 10:30 AM.\nAll other items received and quality checked."
  );

  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const handleDragStart = (e, id) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id); // Required for HTML5 drag & drop to work in many browsers
    // Minor delay to allow visual styling
    setTimeout(() => {
      e.target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedTaskId(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    if (draggedTaskId) {
      setTasks(prev => prev.map(t => t.id === draggedTaskId ? { ...t, status } : t));
    }
  };

  const handleSubmit = () => {
    toast.success("Delivery log submitted to AI Gateway");
    setTasks(prev => prev.map(t => t.isActive ? { ...t, status: "done", isActive: false, date: "May 20 - Just now" } : t));
  };

  const todoTasks = tasks.filter(t => t.status === "todo");
  const inProgressTasks = tasks.filter(t => t.status === "in-progress");
  const doneTasks = tasks.filter(t => t.status === "done");

  return (
    <div className="flex h-full flex-col w-full bg-[#050606] overflow-hidden text-white font-sans p-4 space-y-4">
      
      {/* Local Top Action Bar */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg border border-[#1E2730] bg-[#0A0C0B] px-3 py-1.5 text-xs font-semibold text-muted-foreground cursor-pointer hover:bg-[#141B21] hover:text-white transition-colors">
                <Users className="size-3.5" /> All Teams <ChevronDown className="size-3.5 ml-2 opacity-50" />
              </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-[#0A0C0B] border-[#1E2730] text-white">
              <DropdownMenuItem className="focus:bg-[#141B21] focus:text-white text-xs cursor-pointer">Procurement Team</DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-[#141B21] focus:text-white text-xs cursor-pointer">Logistics Team</DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-[#141B21] focus:text-white text-xs cursor-pointer">Warehouse Team</DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-[#141B21] focus:text-white text-xs cursor-pointer">Finance Team</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#1E2730]" />
              <DropdownMenuItem className="focus:bg-[#141B21] focus:text-white text-xs cursor-pointer"><Settings className="size-3.5 mr-2" /> Manage Teams</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg border border-[#1E2730] bg-[#0A0C0B] px-3 py-1.5 text-xs font-semibold text-muted-foreground cursor-pointer hover:bg-[#141B21] hover:text-white transition-colors">
                <Filter className="size-3.5" /> Filters
              </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-[#0A0C0B] border-[#1E2730] text-white">
              <DropdownMenuCheckboxItem checked className="focus:bg-[#141B21] focus:text-white text-xs cursor-pointer">Show High Priority</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked className="focus:bg-[#141B21] focus:text-white text-xs cursor-pointer">Show Medium Priority</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked className="focus:bg-[#141B21] focus:text-white text-xs cursor-pointer">Show Low Priority</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg border border-[#1E2730] bg-[#0A0C0B] px-3 py-1.5 text-xs font-semibold text-muted-foreground cursor-pointer hover:bg-[#141B21] hover:text-white transition-colors">
                <LayoutGrid className="size-3.5" /> Group by: Status <ChevronDown className="size-3.5 ml-2 opacity-50" />
              </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-[#0A0C0B] border-[#1E2730] text-white">
              <DropdownMenuItem className="focus:bg-[#141B21] focus:text-white text-xs cursor-pointer">Status (Kanban)</DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-[#141B21] focus:text-white text-xs cursor-pointer">Assignee</DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-[#141B21] focus:text-white text-xs cursor-pointer">Due Date</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-black shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]">
          <Plus className="size-4" /> Invite Member
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="flex gap-4 shrink-0 overflow-x-auto scrollbar-none pb-1">
        <Panel className="flex flex-1 min-w-[200px] items-center gap-4 border-[#1E2730] bg-[#0A0C0B] p-4 py-5 hover:border-primary/30 transition-colors cursor-pointer">
          <div className="flex size-10 items-center justify-center rounded-lg bg-[#141B21] border border-[#1E2730] text-primary">
            <CheckCircle2 className="size-5" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-muted-foreground">Open Tasks</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white leading-none">{todoTasks.length + inProgressTasks.length}</span>
              <span className="flex items-center text-[10px] font-bold text-primary"><ArrowUp className="size-3 mr-0.5" /> 8 vs yesterday</span>
            </div>
          </div>
        </Panel>

        <Panel className="flex flex-1 min-w-[200px] items-center gap-4 border-[#1E2730] bg-[#0A0C0B] p-4 py-5 hover:border-[#3b82f6]/30 transition-colors cursor-pointer">
          <div className="flex size-10 items-center justify-center rounded-lg bg-[#141B21] border border-[#1E2730] text-[#3b82f6]">
            <RefreshCw className="size-5" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-muted-foreground">In Progress</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white leading-none">{inProgressTasks.length}</span>
              <span className="flex items-center text-[10px] font-bold text-[#3b82f6]"><ArrowUp className="size-3 mr-0.5" /> 4 vs yesterday</span>
            </div>
          </div>
        </Panel>

        <Panel className="flex flex-1 min-w-[200px] items-center justify-between border border-primary/20 bg-primary/5 p-4 py-5 shadow-[0_0_15px_rgba(34,197,94,0.05)] cursor-pointer">
          <div className="flex gap-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/20 text-primary border border-primary/30">
              <ArrowRight className="size-5 rotate-[-45deg]" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-primary">Submitted Today</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white leading-none drop-shadow-md">{doneTasks.length}</span>
                <span className="text-[10px] text-muted-foreground">Target: 30</span>
              </div>
            </div>
          </div>
          <Ring value={Math.round((doneTasks.length/30)*100)} size={42} stroke="var(--primary)" hideLabel={false} className="opacity-90" />
        </Panel>

        <Panel className="flex flex-1 min-w-[200px] items-center gap-4 border-[#1E2730] bg-[#0A0C0B] p-4 py-5 hover:border-critical/30 transition-colors cursor-pointer">
          <div className="flex size-10 items-center justify-center rounded-lg bg-critical/10 border border-critical/30 text-critical">
            <Lock className="size-5" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-muted-foreground">Blocked</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white leading-none">3</span>
              <span className="flex items-center text-[10px] font-bold text-critical"><ArrowDown className="size-3 mr-0.5" /> 1 vs yesterday</span>
            </div>
          </div>
        </Panel>

        <Panel className="flex flex-1 min-w-[200px] items-center justify-between border-[#1E2730] bg-[#0A0C0B] p-4 py-5 hover:border-primary/30 transition-colors cursor-pointer">
          <div className="flex gap-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#141B21] border border-[#1E2730] text-primary">
              <TrendingUp className="size-5" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-muted-foreground">Team Capacity</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white leading-none">78%</span>
              </div>
              <span className="text-[9px] font-bold text-primary">Healthy</span>
            </div>
          </div>
          <div className="w-16 h-8 flex items-end">
             <Sparkline data={[60, 65, 62, 70, 75, 78]} stroke="var(--primary)" className="h-full" />
          </div>
        </Panel>
      </div>

      {/* Main Content Area: Kanban + Sidebar */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        
        {/* Kanban Board Container */}
        <div className="flex-1 flex gap-4 overflow-x-auto scrollbar-none pb-2">
          
          {/* Column 1: To Do */}
          <div 
            className={cn("flex flex-col w-[320px] shrink-0 gap-3 border-2 border-transparent transition-colors rounded-xl p-1", draggedTaskId && "border-dashed border-[#1E2730] bg-[#141B21]/10")}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "todo")}
          >
            <div className="flex items-center justify-between mb-1 px-1">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">To Do <span className="text-[10px] font-semibold text-muted-foreground">{todoTasks.length}</span></h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Plus className="size-3.5 cursor-pointer hover:text-white" />
                <MoreHorizontal className="size-3.5 cursor-pointer hover:text-white" />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 scrollbar-none pb-4">
              {todoTasks.map(task => (
                <Panel 
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragEnd={handleDragEnd}
                  className="flex flex-col gap-3 border-[#1E2730] bg-[#0A0C0B] p-4 cursor-grab active:cursor-grabbing hover:border-muted-foreground/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-[13px] font-bold text-white/90">{task.title}</span>
                      <span className="text-[10px] text-muted-foreground">{task.team}</span>
                    </div>
                    <span className={cn(
                      "rounded border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest",
                      task.color === "warning" ? "border-warning/30 bg-warning/10 text-warning" : 
                      task.color === "critical" ? "border-critical/30 bg-critical/10 text-critical" : 
                      "border-primary/30 bg-primary/10 text-primary"
                    )}>{task.priority}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-3 border-t border-[#1E2730]/50">
                    <div className="flex items-center gap-2">
                      <div className="flex size-5 items-center justify-center rounded-full bg-[#1E2730] text-[8px] font-bold text-white border border-[#2C3842]">{task.initials}</div>
                      <span className="text-[10px] text-muted-foreground">{task.user}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Calendar className="size-3" /> {task.date}
                    </div>
                  </div>
                </Panel>
              ))}
              <button className="w-full mt-2 rounded-lg border border-dashed border-[#1E2730] py-2.5 text-[11px] font-bold text-muted-foreground hover:text-white hover:border-muted-foreground/50 transition-colors flex items-center justify-center gap-2">
                <Plus className="size-3.5" /> New Task
              </button>
            </div>
          </div>

          {/* Column 2: In Progress (Active) */}
          <div 
            className={cn("flex flex-col w-[420px] shrink-0 gap-3 border-2 border-transparent transition-colors rounded-xl p-1 relative", draggedTaskId && "border-dashed border-[#3b82f6]/50 bg-[#3b82f6]/5")}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "in-progress")}
          >
            <div className="absolute -inset-2 bg-gradient-to-b from-[#3b82f6]/5 to-transparent rounded-2xl pointer-events-none z-0"></div>
            <div className="flex items-center justify-between mb-1 px-1 relative z-10">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">In Progress <span className="text-[10px] font-semibold text-[#3b82f6]">{inProgressTasks.length}</span></h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Plus className="size-3.5 cursor-pointer hover:text-white" />
                <MoreHorizontal className="size-3.5 cursor-pointer hover:text-white" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 scrollbar-none pb-4 relative z-10">
              {inProgressTasks.map(task => (
                task.isActive ? (
                  /* Active Task Card: Log Daily Deliveries */
                  <Panel 
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className="flex flex-col border border-[#3b82f6]/30 bg-[#0A0C0B] shadow-[0_0_30px_rgba(59,130,246,0.05)] relative overflow-hidden z-10 cursor-grab active:cursor-grabbing"
                  >
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent opacity-80"></div>
                    
                    <div className="p-5 flex flex-col gap-5 pointer-events-auto">
                      <div className="flex items-start justify-between">
                        <h2 className="text-lg font-bold text-white tracking-tight">{task.title}</h2>
                        <span className="rounded border border-[#3b82f6]/30 bg-[#3b82f6]/10 px-2 py-0.5 text-[9px] font-bold text-[#3b82f6] uppercase tracking-widest">In Progress</span>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-full bg-[#142338] text-xs font-bold text-[#3b82f6] border border-[#1e3a8a]">{task.initials}</div>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-white">{task.user}</span>
                            <span className="text-[9px] text-muted-foreground">{task.team}</span>
                          </div>
                        </div>
                        <div className="w-px h-8 bg-[#1E2730]"></div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Due</span>
                          <span className="flex items-center gap-1.5 text-[11px] font-bold text-white"><Calendar className="size-3" /> May 20, 2025</span>
                          <span className="text-[10px] text-muted-foreground mt-0.5">3:00 PM</span>
                        </div>
                        <div className="ml-auto flex flex-col items-end">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Priority</span>
                          <span className="rounded border border-critical/30 bg-critical/10 px-1.5 py-0.5 text-[9px] font-bold text-critical">High</span>
                        </div>
                      </div>

                      {/* Form Fields */}
                      <div className="flex flex-col gap-4 mt-2" onMouseDown={(e) => e.stopPropagation()} draggable="false">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Delivery Log</label>
                          <textarea 
                            className="w-full min-h-[80px] rounded-lg border border-[#1E2730] bg-[#141B21]/50 p-3 text-xs text-white/90 font-mono resize-none focus:outline-none focus:border-primary/50 transition-colors"
                            value={deliveryLog}
                            onChange={(e) => setDeliveryLog(e.target.value)}
                          />
                        </div>

                        <div className="flex gap-3">
                          <div className="flex flex-1 flex-col gap-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Warehouse</label>
                            <DropdownMenu>
                              <DropdownMenuTrigger className="w-full flex items-center justify-between rounded-lg border border-[#1E2730] bg-[#141B21]/50 p-2.5 px-3 cursor-pointer hover:border-[#2C3842] transition-colors">
                                  <span className="text-xs font-semibold text-white">Main Warehouse</span>
                                  <ChevronDown className="size-3.5 text-muted-foreground" />
                                </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-48 bg-[#0A0C0B] border-[#1E2730] text-white">
                                <DropdownMenuItem className="focus:bg-[#141B21] focus:text-white text-xs cursor-pointer">Main Warehouse</DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-[#141B21] focus:text-white text-xs cursor-pointer">Secondary Storage</DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-[#141B21] focus:text-white text-xs cursor-pointer">Cold Storage A</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="flex flex-1 flex-col gap-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Supplier</label>
                            <DropdownMenu>
                              <DropdownMenuTrigger className="w-full flex items-center justify-between rounded-lg border border-[#1E2730] bg-[#141B21]/50 p-2.5 px-3 cursor-pointer hover:border-[#2C3842] transition-colors">
                                  <span className="text-xs font-semibold text-white">Farm Fresh Co.</span>
                                  <ChevronDown className="size-3.5 text-muted-foreground" />
                                </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-48 bg-[#0A0C0B] border-[#1E2730] text-white">
                                <DropdownMenuItem className="focus:bg-[#141B21] focus:text-white text-xs cursor-pointer">Farm Fresh Co.</DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-[#141B21] focus:text-white text-xs cursor-pointer">Global Supply Inc.</DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-[#141B21] focus:text-white text-xs cursor-pointer">Regional Logistics</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <div className="flex items-end gap-6 mt-2">
                          <div className="flex flex-1 flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Checklist Progress</label>
                              <span className="text-[10px] font-semibold text-primary">4 / 5 completed</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="h-1.5 flex-1 rounded-full bg-[#1E2730] overflow-hidden">
                                <div className="h-full w-[80%] bg-primary rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                              </div>
                              <span className="text-[11px] font-bold text-white">80%</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Attachments</label>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1.5 rounded bg-critical/10 border border-critical/20 px-2 py-1 text-[9px] font-bold text-critical cursor-pointer hover:bg-critical/20 transition-colors">
                                <FileText className="size-3" /> PDF
                              </div>
                              <div className="flex items-center gap-1.5 rounded bg-primary/10 border border-primary/20 px-2 py-1 text-[9px] font-bold text-primary cursor-pointer hover:bg-primary/20 transition-colors">
                                <FileSpreadsheet className="size-3" /> XLS
                              </div>
                              <div className="flex size-6 items-center justify-center rounded border border-dashed border-muted-foreground/30 text-muted-foreground cursor-pointer hover:text-white hover:border-white/30 transition-colors">
                                <Plus className="size-3" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 mt-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex justify-between">Notes <span className="opacity-50 lowercase tracking-normal">(Optional)</span></label>
                          <textarea 
                            className="w-full min-h-[60px] rounded-lg border border-[#1E2730] bg-[#141B21]/30 p-3 text-xs text-muted-foreground font-mono resize-none focus:outline-none focus:border-primary/50 transition-colors"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                          />
                        </div>

                      </div>

                      <div className="pt-2">
                        <button 
                          onClick={handleSubmit}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#22c55e_0%,#16a34a_100%)] p-4 text-sm font-extrabold text-black shadow-[0_0_30px_rgba(34,197,94,0.25)] transition-all hover:scale-[1.01] active:scale-[0.99] group"
                        >
                          Submit to CEO / AI <RefreshCw className="size-4 opacity-50 group-hover:rotate-180 transition-transform duration-500" />
                        </button>
                      </div>
                    </div>
                  </Panel>
                ) : (
                  <Panel 
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className="flex flex-col gap-3 border-[#1E2730] bg-[#0A0C0B] p-4 cursor-grab active:cursor-grabbing hover:border-muted-foreground/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-[13px] font-bold text-white/90">{task.title}</span>
                        <span className="text-[10px] text-muted-foreground">{task.team}</span>
                      </div>
                      <span className={cn(
                        "rounded border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest",
                        task.color === "warning" ? "border-warning/30 bg-warning/10 text-warning" : 
                        task.color === "critical" ? "border-critical/30 bg-critical/10 text-critical" : 
                        "border-primary/30 bg-primary/10 text-primary"
                      )}>{task.priority}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-[#1E2730]/50">
                      <div className="flex items-center gap-2">
                        <div className="flex size-5 items-center justify-center rounded-full bg-[#1E2730] text-[8px] font-bold text-white border border-[#2C3842]">{task.initials}</div>
                        <span className="text-[10px] text-muted-foreground">{task.user}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Calendar className="size-3" /> {task.date}
                      </div>
                    </div>
                  </Panel>
                )
              ))}
              
              <button className="w-full mt-2 rounded-lg border border-dashed border-[#1E2730] py-2.5 text-[11px] font-bold text-muted-foreground hover:text-white hover:border-muted-foreground/50 transition-colors flex items-center justify-center gap-2">
                <Plus className="size-3.5" /> New Task
              </button>
            </div>
          </div>

          {/* Column 3: Submitted */}
          <div 
            className={cn("flex flex-col w-[320px] shrink-0 gap-3 border-2 border-transparent transition-colors rounded-xl p-1", draggedTaskId && "border-dashed border-primary/50 bg-primary/5 opacity-100", !draggedTaskId && "opacity-80 hover:opacity-100")}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "done")}
          >
            <div className="flex items-center justify-between mb-1 px-1">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">Submitted <span className="text-[10px] font-semibold text-primary">{doneTasks.length}</span></h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Plus className="size-3.5 cursor-pointer hover:text-white" />
                <MoreHorizontal className="size-3.5 cursor-pointer hover:text-white" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 scrollbar-none pb-4">
              {doneTasks.map(task => (
                <Panel 
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragEnd={handleDragEnd}
                  className="flex flex-col gap-3 border-[#1E2730] bg-[#0A0C0B] p-4 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-[13px] font-bold text-white/70 line-through">{task.title}</span>
                      <span className="text-[10px] text-muted-foreground">{task.team}</span>
                    </div>
                    <div className="flex size-5 items-center justify-center rounded-full bg-primary/10 border border-primary/30 text-primary shrink-0">
                      <CheckCircle2 className="size-3" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-3 border-t border-[#1E2730]/50">
                    <div className="flex items-center gap-2 opacity-70">
                      <div className="flex size-5 items-center justify-center rounded-full bg-[#1E2730] text-[8px] font-bold text-white border border-[#2C3842]">{task.initials}</div>
                      <span className="text-[10px] text-muted-foreground">{task.user}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      {task.date}
                    </div>
                  </div>
                </Panel>
              ))}

              <button className="w-full mt-2 rounded-lg border border-dashed border-[#1E2730] py-2.5 text-[11px] font-bold text-muted-foreground hover:text-white hover:border-muted-foreground/50 transition-colors flex items-center justify-center gap-2">
                <Plus className="size-3.5" /> New Task
              </button>
            </div>
          </div>

        </div>

        {/* Right Sidebar: Analytics & Feed */}
        <div className="w-[320px] shrink-0 flex flex-col gap-4 overflow-y-auto scrollbar-none pb-4 pr-1">
          
          <Panel className="flex flex-col border-[#1E2730] bg-[#0A0C0B] p-5 py-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-white">Recent Submissions</h3>
              <span className="text-[10px] font-semibold text-[#3b82f6] hover:text-[#60a5fa] cursor-pointer transition-colors">View all</span>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { title: "Daily Cash Summary", user: "Lena Nguyen", time: "9:15 AM" },
                { title: "Stock Reconciliation Report", user: "James Brown", time: "8:45 AM" },
                { title: "Procurement Request: Packaging", user: "Sarah Miller", time: "8:30 AM" },
                { title: "Line Efficiency Update", user: "David Patel", time: "7:50 AM" },
                { title: "HR Attendance Summary", user: "Ken Roberts", time: "7:30 AM" },
                { title: "Equipment Diagnostics", user: "James Brown", time: "7:15 AM" }
              ].map((item, i) => (
                <div key={i} className="flex items-start justify-between group cursor-pointer">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex size-3.5 items-center justify-center rounded-full bg-primary/20 text-primary shrink-0">
                      <CheckCircle2 className="size-2.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold text-white/90 group-hover:text-primary transition-colors leading-tight">{item.title}</span>
                      <span className="text-[9px] text-muted-foreground">{item.user}</span>
                    </div>
                  </div>
                  <span className="text-[9px] text-muted-foreground whitespace-nowrap mt-0.5">{item.time}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="flex flex-col border-[#1E2730] bg-[#0A0C0B] p-5 py-4 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-white">Team Activity</h3>
              <span className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[8px] font-bold text-primary uppercase tracking-widest animate-pulse">
                <div className="size-1.5 rounded-full bg-primary"></div> Live
              </span>
            </div>
            <div className="flex flex-col gap-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-[#1E2730]">
              {[
                { user: "David Patel", initials: "DP", action: "updated", target: "Log Daily Deliveries", time: "2m ago", color: "bg-[#142338] text-[#3b82f6] border-[#1e3a8a]" },
                { user: "Sarah Miller", initials: "SM", action: "completed", target: "Procurement Request", time: "12m ago", color: "bg-warning/10 text-warning border-warning/30" },
                { user: "James Brown", initials: "JB", action: "submitted", target: "Stock Reconciliation", time: "25m ago", color: "bg-[#142338] text-[#3b82f6] border-[#1e3a8a]" },
                { user: "Ken Roberts", initials: "KR", action: "commented on", target: "Maintenance Check", time: "35m ago", color: "bg-[#1E2730] text-white border-[#2C3842]" },
                { user: "Lena Nguyen", initials: "LN", action: "submitted", target: "Daily Cash Summary", time: "45m ago", color: "bg-[#1E2730] text-white border-[#2C3842]" },
                { user: "Sarah Miller", initials: "SM", action: "moved", target: "Vendor Contracts", time: "1h ago", color: "bg-warning/10 text-warning border-warning/30" }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 relative z-10">
                  <div className={cn("flex size-6 items-center justify-center rounded-full text-[8px] font-bold border shrink-0 bg-[#0A0C0B]", item.color)}>
                    {item.initials}
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      <span className="font-bold text-white">{item.user}</span> {item.action} <span className="font-semibold text-white/80">{item.target}</span>
                    </p>
                    <span className="text-[8px] text-muted-foreground/70">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="flex flex-col border-[#1E2730] bg-[#0A0C0B] p-5 py-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-white">SLA Health</h3>
              <span className="text-[10px] font-semibold text-[#3b82f6] hover:text-[#60a5fa] cursor-pointer transition-colors">View details</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center gap-2">
                <Ring value={96} size={50} stroke="var(--primary)" hideLabel={false} className="font-bold text-sm text-white" />
                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-muted-foreground text-center">On-Time Rate</span>
                  <span className="flex items-center text-[8px] font-bold text-primary"><ArrowUp className="size-2.5 mr-0.5" /> 4%</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Ring value={80} size={50} stroke="#3b82f6" hideLabel={true} />
                <div className="absolute mt-[18px] text-sm font-bold text-white">1.2h</div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-muted-foreground text-center">Response Time</span>
                  <span className="flex items-center text-[8px] font-bold text-[#3b82f6]"><ArrowDown className="size-2.5 mr-0.5" /> 0.3h</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Ring value={10} size={50} stroke="var(--critical)" hideLabel={true} />
                <div className="absolute mt-[18px] text-sm font-bold text-white">2</div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-muted-foreground text-center">Overdue Tasks</span>
                  <span className="flex items-center text-[8px] font-bold text-critical"><ArrowDown className="size-2.5 mr-0.5" /> 1</span>
                </div>
              </div>
            </div>
          </Panel>

        </div>
      </div>
    </div>
  );
}
