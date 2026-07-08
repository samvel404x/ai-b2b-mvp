"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Inbox,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Send,
  User,
  Building2,
  Database,
  ArrowLeft,
  Calendar,
  MapPin,
  TrendingUp,
  DollarSign,
  Package,
  Activity,
  ExternalLink,
  ChevronDown,
  ListFilter,
  Check,
  Info,
  FileText,
  MoreVertical,
  TerminalSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Panel, Ring, Sparkline } from "../shared";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";

const allReports = [
  {
    id: "OPS-2025-05-20-001",
    sender: "Operations Manager",
    role: "Main Warehouse",
    time: "2m ago",
    date: "May 20, 2025 - 09:30 AM",
    title: "Daily Supply Intake: 50kg mushrooms",
    status: "Pending AI Review",
    urgent: true,
    icon: Package,
    color: "primary",
    decision: {
      summary: "Based on intake volume, demand forecast, and current stock levels, AI recommends replenishing inventory to optimize availability and prevent stockouts.",
      action: "Order 100kg more",
      reasoning: "Demand is trending up 22% compared to last week. Current stock may fall below optimal range in 3-5 days. Ordering 100kg will maintain ideal inventory and ensure uninterrupted operations.",
      confidence: 96,
      metrics: { trend: "↑ 22%", intake: "50 kg", optimal: "120 - 150 kg", risk: "High" },
      impact: { revenue: "$4,800", coverage: "4-6 days", cost: "$1,620" }
    }
  },
  {
    id: "OPS-2025-05-20-002",
    sender: "Procurement Manager",
    role: "Head Office",
    time: "15m ago",
    date: "May 20, 2025 - 09:15 AM",
    title: "Procurement Request: Packaging Materials",
    status: "Pending AI Review",
    urgent: true,
    icon: DollarSign,
    color: "warning",
    decision: {
      summary: "Packaging materials are running low due to an unexpected spike in outbound shipments. Procurement request is within budget.",
      action: "Approve $2,500 PO",
      reasoning: "Supplier offers a 5% discount on bulk orders above $2,000. Approving this PO prevents a packaging bottleneck later this week.",
      confidence: 92,
      metrics: { trend: "↑ 15%", intake: "0", optimal: "5,000 units", risk: "Medium" },
      impact: { revenue: "$12,000", coverage: "14 days", cost: "$2,500" }
    }
  },
  {
    id: "OPS-2025-05-20-003",
    sender: "Warehouse Manager",
    role: "Main Warehouse",
    time: "1h ago",
    date: "May 20, 2025 - 08:30 AM",
    title: "Warehouse Report: Stock Reconciliation",
    status: "Ready",
    urgent: false,
    icon: Building2,
    color: "evidence",
    decision: {
      summary: "Routine stock reconciliation completed. No major discrepancies found. Shrinkage is within acceptable limits (0.4%).",
      action: "Acknowledge Report",
      reasoning: "All inventory counts match system records within the 1% tolerance threshold. No immediate action required.",
      confidence: 99,
      metrics: { trend: "Stable", intake: "N/A", optimal: "N/A", risk: "Low" },
      impact: { revenue: "N/A", coverage: "N/A", cost: "$0" }
    }
  },
  {
    id: "OPS-2025-05-20-004",
    sender: "Finance Manager",
    role: "Head Office",
    time: "2h ago",
    date: "May 20, 2025 - 07:30 AM",
    title: "Finance Report: Daily Cash Summary",
    status: "Ready",
    urgent: false,
    icon: DollarSign,
    color: "evidence",
    decision: {
      summary: "Daily cash flow summary generated. Operating cash flow remains positive with a healthy runway.",
      action: "Archive to GL",
      reasoning: "Cash inflows exceeded outflows by $14,000 yesterday. Meets financial health criteria for automatic archiving.",
      confidence: 98,
      metrics: { trend: "↑ 2%", intake: "$14k Net", optimal: ">$5k Net", risk: "Low" },
      impact: { revenue: "Protected", coverage: "6 months", cost: "None" }
    }
  },
  {
    id: "OPS-2025-05-20-005",
    sender: "Operations Manager",
    role: "Main Warehouse",
    time: "3h ago",
    date: "May 20, 2025 - 06:30 AM",
    title: "Operations Report: Line Efficiency Update",
    status: "Pending AI Review",
    urgent: false,
    icon: Activity,
    color: "primary",
    decision: {
      summary: "Packaging Line B is operating at 82% efficiency, down from the target of 90%. Delay caused by minor sensor misalignment.",
      action: "Schedule Maintenance",
      reasoning: "Sensor recalibration takes 15 minutes but prevents a potential 2-hour downtime later in the shift.",
      confidence: 94,
      metrics: { trend: "↓ 8%", intake: "82% OEE", optimal: "90% OEE", risk: "Medium" },
      impact: { revenue: "$3,200", coverage: "Uptime", cost: "$150" }
    }
  },
  {
    id: "OPS-2025-05-20-006",
    sender: "Logistics Coordinator",
    role: "Transport Fleet",
    time: "4h ago",
    date: "May 20, 2025 - 05:30 AM",
    title: "Route Optimization: Traffic Delay Alert",
    status: "Pending AI Review",
    urgent: true,
    icon: AlertTriangle,
    color: "critical",
    decision: {
      summary: "Major accident on Highway 4 is delaying 3 inbound delivery trucks by approx 45 minutes.",
      action: "Reroute via Hwy 7",
      reasoning: "Rerouting adds 12 miles but saves 30 minutes of idling. Ensures perishable goods arrive within temperature safety window.",
      confidence: 97,
      metrics: { trend: "Traffic ↑", intake: "+45 min", optimal: "<15 min delay", risk: "High" },
      impact: { revenue: "$18,500", coverage: "Perishables", cost: "+$45 Fuel" }
    }
  },
  {
    id: "OPS-2025-05-20-007",
    sender: "HR Manager",
    role: "Head Office",
    time: "5h ago",
    date: "May 20, 2025 - 04:30 AM",
    title: "HR Request: Seasonal Staffing Approval",
    status: "Pending AI Review",
    urgent: false,
    icon: User,
    color: "primary",
    decision: {
      summary: "Requesting approval to hire 4 temporary warehouse workers for the upcoming holiday peak season.",
      action: "Approve Hiring",
      reasoning: "Historical data shows a 40% volume increase in the next month. 4 temp workers will prevent a backlog and maintain SLA.",
      confidence: 91,
      metrics: { trend: "Volume ↑", intake: "4 Temps", optimal: "3-5 Temps", risk: "Low" },
      impact: { revenue: "$45,000", coverage: "SLA Maintained", cost: "$12,000" }
    }
  }
];

export default function AiGateway() {
  const [filter, setFilter] = useState("All");
  const [reports, setReports] = useState(allReports);
  const [selectedReport, setSelectedReport] = useState(reports[0]);

  const handleFilter = (type) => {
    setFilter(type);
    if (type === "All") {
      setReports(allReports);
    } else if (type === "Pending AI Review") {
      setReports(allReports.filter(r => r.status === "Pending AI Review"));
    } else if (type === "Urgent") {
      setReports(allReports.filter(r => r.urgent));
    }
  };

  const handleApprove = () => {
    toast.success("Task Delegated Successfully");
    setReports(prev => prev.map(r => r.id === selectedReport.id ? { ...r, status: "Delegated" } : r));
    setSelectedReport(prev => ({...prev, status: "Delegated"}));
  };

  return (
    <div className="flex h-full w-full gap-4 overflow-hidden p-4">
      {/* 1. Left Sidebar: Inbox */}
      <Panel className="flex w-[22rem] shrink-0 flex-col bg-[#0A0C0B] border-[#1E2730]">
        <div className="flex items-center justify-between border-b border-[#1E2730] p-4">
          <h2 className="text-sm font-bold text-white">Inbox</h2>
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
                <ListFilter className="size-4 text-muted-foreground cursor-pointer hover:text-white transition-colors" />
              </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-[#0A0C0B] border-[#1E2730] text-white">
              <DropdownMenuCheckboxItem checked={filter === "All"} onClick={() => handleFilter("All")} className="focus:bg-[#141B21] focus:text-white text-xs cursor-pointer">Show All Reports</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={filter === "Pending AI Review"} onClick={() => handleFilter("Pending AI Review")} className="focus:bg-[#141B21] focus:text-white text-xs cursor-pointer">Pending AI Review</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={filter === "Urgent"} onClick={() => handleFilter("Urgent")} className="focus:bg-[#141B21] focus:text-white text-xs cursor-pointer">Show Urgent Only</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-2 border-b border-[#1E2730] px-4 py-3 overflow-x-auto scrollbar-none">
          <button 
            onClick={() => handleFilter("All")}
            className={cn("rounded-full px-3 py-1 text-[10px] font-bold whitespace-nowrap transition-colors", 
              filter === "All" ? "bg-primary/20 border border-primary/30 text-primary" : "bg-[#141B21] border border-[#1E2730] text-muted-foreground hover:text-white hover:bg-white/5"
            )}>
            All <span className="ml-1 opacity-70">{allReports.length}</span>
          </button>
          <button 
            onClick={() => handleFilter("Pending AI Review")}
            className={cn("rounded-full px-3 py-1 text-[10px] font-bold whitespace-nowrap transition-colors", 
              filter === "Pending AI Review" ? "bg-[#3b82f6]/20 border border-[#3b82f6]/30 text-[#3b82f6]" : "bg-[#141B21] border border-[#1E2730] text-muted-foreground hover:text-white hover:bg-white/5"
            )}>
            Pending AI Review <span className="ml-1 opacity-70">{allReports.filter(r => r.status === "Pending AI Review").length}</span>
          </button>
          <button 
            onClick={() => handleFilter("Urgent")}
            className={cn("rounded-full px-3 py-1 text-[10px] font-bold whitespace-nowrap transition-colors", 
              filter === "Urgent" ? "bg-critical/20 border border-critical/30 text-critical" : "bg-[#141B21] border border-[#1E2730] text-muted-foreground hover:text-white hover:bg-white/5"
            )}>
            Urgent <span className="ml-1 opacity-70">{allReports.filter(r => r.urgent).length}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-none">
          {reports.map(report => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report)}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all",
                selectedReport?.id === report.id
                  ? "border-[#1E2730] bg-[#141B21]"
                  : "border-transparent hover:bg-white/5"
              )}
            >
              <div className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-lg border",
                report.color === "primary" ? "border-primary/30 bg-primary/10 text-primary" : 
                report.color === "warning" ? "border-warning/30 bg-warning/10 text-warning" : 
                report.color === "critical" ? "border-critical/30 bg-critical/10 text-critical" :
                "border-evidence/30 bg-evidence/10 text-evidence"
              )}>
                <report.icon className="size-5" />
              </div>
              <div className="flex flex-1 flex-col gap-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-white line-clamp-2 leading-tight">{report.title}</span>
                  <span className="text-[9px] text-muted-foreground whitespace-nowrap mt-0.5">{report.time}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{report.sender}</span>
                <div className="flex items-center justify-end gap-2 mt-1">
                  {report.urgent && (
                    <span className="rounded border border-critical/30 bg-critical/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest text-critical">
                      Urgent
                    </span>
                  )}
                  <span className={cn(
                    "rounded border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest",
                    report.status === "Pending AI Review" ? "border-[#1E2730] bg-[#0A0C0B] text-[#3b82f6]" :
                    report.status === "Ready" ? "border-[#1E2730] bg-[#0A0C0B] text-primary" :
                    report.status === "Delegated" ? "border-primary/30 bg-primary/10 text-primary" :
                    "border-[#1E2730] bg-[#0A0C0B] text-muted-foreground"
                  )}>
                    {report.status}
                  </span>
                </div>
              </div>
            </button>
          ))}
          <button className="w-full mt-2 rounded-lg border border-[#1E2730] bg-[#0A0C0B] py-3 text-xs font-bold text-muted-foreground hover:bg-[#141B21] hover:text-white transition-colors flex items-center justify-center gap-2">
            View all reports <ArrowRight className="size-3.5" />
          </button>
        </div>
      </Panel>

      {/* 2. Center Panel: Report Detail & AI Recommendation */}
      <Panel className="flex flex-1 flex-col bg-[#0A0C0B] border-[#1E2730] relative overflow-hidden">
        {selectedReport ? (
          <>
            <div className="border-b border-[#1E2730] shrink-0 bg-[#0A0C0B] z-10 relative">
              <div className="flex items-center justify-between p-4 px-6 pb-2">
                <button className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-white transition-colors">
                  <ArrowLeft className="size-3.5" /> Back to reports
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground">Report ID: {selectedReport.id}</span>
                  <ExternalLink className="size-3.5 text-muted-foreground cursor-pointer hover:text-white" />
                </div>
              </div>

              <div className="px-6 pb-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-xl font-bold text-white tracking-tight">{selectedReport.title}</h1>
                    {selectedReport.urgent && (
                      <span className="rounded border border-critical/30 bg-critical/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-critical">Urgent</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5"><User className="size-3.5" /> From: {selectedReport.sender}</span>
                    <span className="w-px h-3 bg-[#1E2730]"></span>
                    <span className="flex items-center gap-1.5"><Calendar className="size-3.5" /> {selectedReport.date}</span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-6 px-6 overflow-x-auto scrollbar-none">
                {["Overview", "Details", "Forecast", "Notes", "Audit Log"].map((tab, i) => (
                  <button key={tab} className={cn(
                    "whitespace-nowrap pb-3 text-xs font-semibold transition-colors border-b-2",
                    i === 0 ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-white"
                  )}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto flex relative z-0">
              {/* Left summary strip */}
              <div className="w-[18rem] shrink-0 border-r border-[#1E2730] flex flex-col bg-[#0A0C0B]">
                <div className="p-6 space-y-6 flex-1">
                  <h3 className="text-[11px] font-bold text-white mb-4">Summary Context</h3>
                  
                  <div className="flex gap-3">
                    <Building2 className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground mb-0.5">Department/Supplier</span>
                      <span className="text-xs font-semibold text-white">Genius Corp Network</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Calendar className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground mb-0.5">Timestamp</span>
                      <span className="text-xs font-semibold text-white">{selectedReport.date}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle2 className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground mb-0.5">Priority Level</span>
                      <span className="text-xs font-semibold text-white">{selectedReport.urgent ? 'Critical' : 'Routine'}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <MapPin className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground mb-0.5">Location</span>
                      <span className="text-xs font-semibold text-white">{selectedReport.role}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-[#141B21]/50 border-t border-[#1E2730]">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                    <ShieldCheck className="size-3.5 text-primary" /> System Checks
                  </h3>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2">
                      <Check className="size-3.5 text-primary shrink-0 mt-0.5" />
                      <span className="text-xs text-white/90">Sender Identity Verified</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="size-3.5 text-primary shrink-0 mt-0.5" />
                      <span className="text-xs text-white/90">Authentication Valid <span className="text-[10px] text-muted-foreground block">(MFA Enforced)</span></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="size-3.5 text-primary shrink-0 mt-0.5" />
                      <span className="text-xs text-white/90">No Data Anomalies Detected</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Glowing AI Card Area */}
              <div className="flex-1 p-6 relative">
                {/* Neural Grid Background */}
                <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
                <div className="absolute top-0 inset-x-0 h-[400px] bg-primary/5 blur-[100px] z-0 pointer-events-none"></div>

                {/* Main Content Area */}
                <div className="relative z-10 flex flex-col gap-6 max-w-4xl">
                  
                  {/* Glowing AI Recommendation Card (Tight fit) */}
                  <div className="rounded-2xl border border-primary/40 bg-[#0A0C0B]/90 backdrop-blur-md p-6 shadow-[0_0_50px_rgba(34,197,94,0.1)] relative overflow-hidden h-fit">
                    {/* Subtle top glow line */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-80"></div>
                    
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20 shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                          <Sparkles className="size-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight text-shadow-sm">AI Recommendation</h2>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-muted-foreground mb-1 font-semibold">Confidence Score</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-primary drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">{selectedReport.decision.confidence}%</span>
                          <Ring value={selectedReport.decision.confidence} size={24} hideLabel stroke="var(--primary)" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Summary</h3>
                        <p className="text-sm text-white/90 leading-relaxed">{selectedReport.decision.summary}</p>
                      </div>

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-4 gap-3">
                        <div className="rounded-xl border border-[#1E2730] bg-[#141B21]/80 backdrop-blur p-3 hover:border-primary/30 transition-colors">
                          <div className="flex items-center gap-1.5 mb-2">
                            <TrendingUp className="size-3.5 text-primary" />
                            <span className="text-[10px] font-semibold text-muted-foreground">Primary Metric</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-lg font-bold text-primary">{selectedReport.decision.metrics.trend}</span>
                          </div>
                        </div>
                        <div className="rounded-xl border border-[#1E2730] bg-[#141B21]/80 backdrop-blur p-3">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Package className="size-3.5 text-warning" />
                            <span className="text-[10px] font-semibold text-muted-foreground">Current State</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-lg font-bold text-white">{selectedReport.decision.metrics.intake}</span>
                          </div>
                        </div>
                        <div className="rounded-xl border border-[#1E2730] bg-[#141B21]/80 backdrop-blur p-3">
                          <div className="flex items-center gap-1.5 mb-2">
                            <CheckCircle2 className="size-3.5 text-primary" />
                            <span className="text-[10px] font-semibold text-muted-foreground">Optimal State</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-lg font-bold text-white">{selectedReport.decision.metrics.optimal}</span>
                          </div>
                        </div>
                        <div className="rounded-xl border border-critical/30 bg-critical/5 backdrop-blur p-3">
                          <div className="flex items-center gap-1.5 mb-2">
                            <AlertTriangle className="size-3.5 text-critical" />
                            <span className="text-[10px] font-semibold text-critical">Est. Risk Level</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-lg font-bold text-critical">{selectedReport.decision.metrics.risk}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Recommended Action</h3>
                        <p className="text-2xl font-bold text-white drop-shadow-md">{selectedReport.decision.action}</p>
                      </div>

                      <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Reasoning</h3>
                        <p className="text-sm text-white/80 leading-relaxed">{selectedReport.decision.reasoning}</p>
                      </div>

                      <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Business Impact</h3>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="flex items-start gap-3 rounded-lg border border-[#1E2730] bg-[#141B21]/80 p-3">
                            <DollarSign className="size-4 text-primary shrink-0 mt-0.5" />
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white">{selectedReport.decision.impact.revenue}</span>
                              <span className="text-[10px] text-muted-foreground">Revenue Impact</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 rounded-lg border border-[#1E2730] bg-[#141B21]/80 p-3">
                            <Activity className="size-4 text-primary shrink-0 mt-0.5" />
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white">{selectedReport.decision.impact.coverage}</span>
                              <span className="text-[10px] text-muted-foreground">Operational Coverage</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 rounded-lg border border-[#1E2730] bg-[#141B21]/80 p-3">
                            <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white">{selectedReport.decision.impact.cost}</span>
                              <span className="text-[10px] text-muted-foreground">Estimated Cost</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons Inside the Card */}
                      <div className="flex items-center gap-3 pt-4 border-t border-[#1E2730]/50">
                        <button
                          onClick={handleApprove}
                          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-black shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Send className="size-4" /> Approve & Execute
                        </button>
                        <button className="flex items-center gap-2 rounded-lg border border-[#1E2730] bg-transparent px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#141B21]">
                          Request Revision
                        </button>
                        <button className="flex items-center gap-2 ml-auto text-xs font-semibold text-muted-foreground hover:text-white transition-colors">
                          View Full Rationale <ExternalLink className="size-3.5" />
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* Compact Delegation Block Below */}
                  <div className="flex flex-col max-w-4xl">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 px-1">Delegation Details</h3>
                    <div className="flex items-center gap-6 rounded-xl border border-[#1E2730] bg-[#0A0C0B]/90 backdrop-blur p-4">
                      
                      <div className="flex flex-col gap-1 max-w-[200px] flex-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Assignee</span>
                        <div className="flex items-center justify-between rounded border border-[#1E2730] bg-[#141B21]/50 p-1.5 px-3 cursor-pointer hover:border-[#2C3842] transition-colors">
                          <div className="flex items-center gap-2">
                            <div className="flex size-5 items-center justify-center rounded-full bg-[#1E2730] text-[8px] font-bold text-white">SYS</div>
                            <span className="text-[11px] font-bold text-white">AI Automation Agent</span>
                          </div>
                          <ChevronDown className="size-3.5 text-muted-foreground ml-2" />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 max-w-[160px]">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Execution</span>
                        <div className="flex items-center justify-between rounded border border-[#1E2730] bg-[#141B21]/50 p-1.5 px-3 cursor-pointer hover:border-[#2C3842] transition-colors">
                          <div className="flex items-center gap-2">
                            <Clock className="size-3.5 text-muted-foreground" />
                            <span className="text-[11px] font-bold text-white">Immediate</span>
                          </div>
                          <ChevronDown className="size-3.5 text-muted-foreground ml-2" />
                        </div>
                      </div>

                      <div className="flex items-center gap-5 ml-auto">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-white">Notify Stakeholders</span>
                          <div className="h-4 w-7 rounded-full bg-primary relative cursor-pointer shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                            <div className="absolute right-0.5 top-0.5 size-3 rounded-full bg-black"></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-white">Sync CRM</span>
                          <div className="h-4 w-7 rounded-full bg-primary relative cursor-pointer shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                            <div className="absolute right-0.5 top-0.5 size-3 rounded-full bg-black"></div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
            <Inbox className="mb-4 size-8 opacity-20" />
            <p className="text-sm">Select a report to review</p>
          </div>
        )}
      </Panel>

      {/* 3. Right Sidebar: Context/Analytics */}
      <Panel className="flex w-80 shrink-0 flex-col bg-[#0A0C0B] border-[#1E2730] p-4 space-y-6 overflow-y-auto scrollbar-none">
        
        {/* Widget 1: System Health */}
        <div className="rounded-xl border border-[#1E2730] bg-[#141B21] p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-white">Global Operations Health</h3>
            <MoreVertical className="size-3.5 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Ring value={92} size={90} stroke="#22c55e" hideLabel />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-white leading-none">92%</span>
                <span className="text-[9px] text-muted-foreground mt-1 text-center">Score</span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col">
                <span className="text-[9px] text-muted-foreground mb-0.5">Uptime</span>
                <span className="text-xs font-bold text-white">99.98%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-muted-foreground mb-0.5">Active Incidents</span>
                <span className="text-xs font-bold text-white">0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Widget 2: Volume */}
        <div className="rounded-xl border border-[#1E2730] bg-[#141B21] p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-white">Data Ingestion Volume</h3>
            <div className="flex items-center gap-1 rounded border border-[#1E2730] px-2 py-0.5 text-[9px] font-semibold text-muted-foreground cursor-pointer hover:bg-white/5 transition-colors">
              Today <ChevronDown className="size-3" />
            </div>
          </div>
          <div className="h-24 w-full relative mb-2 flex items-end pb-4 pt-2">
             <Sparkline data={[20, 35, 25, 45, 60, 50, 80]} stroke="#3b82f6" className="h-full" />
             <div className="absolute left-0 top-0 bottom-4 flex flex-col justify-between text-[8px] text-muted-foreground opacity-50">
               <span>10k</span>
               <span>5k</span>
               <span>0</span>
             </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="h-0.5 w-3 bg-[#3b82f6]"></div>
            <span className="text-[10px] text-muted-foreground">Records processed/hr</span>
          </div>
        </div>

        {/* Widget 3: Supplier Performance */}
        <div className="rounded-xl border border-[#1E2730] bg-[#141B21] p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-white">Network Connections</h3>
            <span className="flex items-center gap-1 rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
              <CheckCircle2 className="size-3" /> Active
            </span>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex size-6 items-center justify-center rounded-lg bg-white/5 border border-[#1E2730]">
               <Building2 className="size-3.5 text-muted-foreground" />
            </div>
            <span className="text-sm font-bold text-white">B2B Bridge Nodes</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
             <div className="flex flex-col gap-1">
               <span className="text-[9px] text-muted-foreground">Connected Suppliers</span>
               <span className="text-sm font-bold text-white">124</span>
             </div>
             <div className="flex flex-col gap-1">
               <span className="text-[9px] text-muted-foreground">Data Sync Rate</span>
               <span className="text-sm font-bold text-white">Real-time</span>
             </div>
          </div>
        </div>

      </Panel>
    </div>
  );
}
