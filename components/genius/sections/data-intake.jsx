"use client";

import { useState, useRef, useMemo } from "react";
import { toast } from "sonner";
import { 
  Upload, FileText, CheckCircle2, MoreHorizontal, 
  Settings, RefreshCw, Shield, Link2, Download,
  Check, ExternalLink, Calendar, ChevronRight,
  ChevronLeft, ArrowRight, X, ChevronDown, MoreVertical, Search, File, Database, KeyRound, CheckSquare, ShieldCheck, Cpu,
  Edit2, Sparkles
} from "lucide-react";
import { Panel, StatusDot, ConfBar } from "../shared";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const kpiData = [
  { id: "sources", label: "EVIDENCE SOURCES", value: "95", trend: "↑ 8 vs last 7 days", trendUp: true, sub: "12 connected", tone: "evidence", ringValue: 95 },
  { id: "processed", label: "FILES PROCESSED", value: "132", trend: "↑ 16 vs last 7 days", trendUp: true, sub: "This week", tone: "primary", ringValue: 100 },
  { id: "confidence", label: "EXTRACTION CONFIDENCE", value: "88%", trend: "↑ 6 pts vs last 7 days", trendUp: true, sub: "Average", tone: "evidence", ringValue: 81 },
  { id: "pending", label: "PENDING REVIEW", value: "24", trend: "↓ 5 vs last 7 days", trendUp: false, sub: "Requires attention", tone: "warning", ringValue: 24 },
  { id: "quality", label: "DATA QUALITY SCORE", value: "84%", trend: "↑ 5 pts vs last 7 days", trendUp: true, sub: "Good", tone: "evidence", ringValue: 84 },
  { id: "duplicates", label: "DUPLICATE SOURCES", value: "7", trend: "↓ 3 vs last 7 days", trendUp: false, sub: "Auto-detected", tone: "critical", ringValue: 7 },
];

const uploadedSources = Array.from({ length: 24 }).map((_, i) => {
  const types = ["Contract", "Spreadsheet", "CSV", "URL", "Invoice"];
  const statuses = ["Extraction complete", "Processing", "Needs review"];
  const type = types[i % types.length];
  const status = statuses[i % statuses.length];
  
  let name = `Document_${i + 1}`;
  if (type === "Contract" || type === "Invoice") name += ".pdf";
  else if (type === "Spreadsheet") name += ".xlsx";
  else if (type === "CSV") name += ".csv";
  else name = `https://example.com/doc_${i + 1}`;

  return {
    id: i + 1,
    name,
    type,
    time: `May ${24 - (i % 5)}, 2026 ${10 - (i % 8)}:${15 + i} AM`,
    user: ["Alex Rivera", "Sarah Green", "Daniel Tran", "Michael Wong"][i % 4],
    status,
    statusTone: status === "Extraction complete" ? "evidence" : status === "Processing" ? "primary" : "warning",
    confidence: Math.floor(Math.random() * (99 - 60 + 1) + 60),
    fields: `${Math.floor(Math.random() * 10 + 5)} / 15`,
    proof: `PT-12${68 - i}`
  };
});

const extractionFields = [
  { label: "Counterparty", value: "TechSoft Solutions LLC", conf: 96, source: "Page 1", checked: true },
  { label: "Agreement Type", value: "Master Services Agreement", conf: 93, source: "Page 1", checked: true },
  { label: "Effective Date", value: "May 15, 2026", type: "date", conf: 98, source: "Page 1", checked: true },
  { label: "Renewal Date", value: "May 15, 2027", type: "date", conf: 91, source: "Page 8", checked: false },
  { label: "Payment Terms", value: "Net 30", type: "select", conf: 89, source: "Page 5", checked: true },
  { label: "Contract Value", value: "$248,700.00", conf: 94, source: "Page 2", checked: true },
  { label: "Owner", value: "Michael Wong", conf: 86, source: "Page 1", checked: false },
  { label: "Currency", value: "USD", type: "select", conf: 99, source: "Page 2", checked: true },
  { label: "Auto-renewal", value: "Yes, 12 months", type: "select", conf: 88, source: "Page 8", checked: true },
];

function CircularRing({ value, tone, label }) {
  const colorMap = {
    evidence: "text-evidence",
    primary: "text-primary",
    warning: "text-warning",
    critical: "text-critical"
  };
  const strokeColor = colorMap[tone] || "text-primary";
  
  return (
    <div className="relative flex size-[52px] items-center justify-center shrink-0">
      <svg viewBox="0 0 36 36" className="absolute inset-0 size-full -rotate-90">
        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3.5" />
        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" strokeDasharray={`${value}, 100`} className={strokeColor} />
      </svg>
      <span className={cn("text-lg font-bold text-white")}>{label}</span>
    </div>
  );
}

export default function DataIntake({ onNavigate }) {
  const fileInputRef = useRef(null);
  
  // State for filtering and pagination
  const [sourceFilter, setSourceFilter] = useState("All sources");
  const [statusFilter, setStatusFilter] = useState("All status");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [dragging, setDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    simulateUpload();
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      simulateUpload();
    }
  };

  const simulateUpload = () => {
    setUploadProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setUploadProgress(null);
          toast.success('Files uploaded and sent for extraction');
        }, 500);
      }
    }, 150);
  };

  // Filter and paginate data
  const filteredSources = useMemo(() => {
    return uploadedSources.filter(s => {
      if (sourceFilter !== "All sources" && s.type !== sourceFilter) return false;
      if (statusFilter !== "All status" && s.status !== statusFilter) return false;
      return true;
    });
  }, [sourceFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSources.length / rowsPerPage));
  const displaySources = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredSources.slice(start, start + rowsPerPage);
  }, [filteredSources, currentPage, rowsPerPage]);

  const startIndex = (currentPage - 1) * rowsPerPage + 1;
  const endIndex = Math.min(currentPage * rowsPerPage, filteredSources.length);

  return (
    <div className="flex flex-col h-[calc(100vh-72px)] overflow-hidden bg-background">
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 flex flex-col gap-6">
        
        {/* KPI Strip */}
        <div className="grid grid-cols-6 gap-4">
          {kpiData.map(kpi => (
            <div key={kpi.id} className="flex items-center gap-4 rounded-xl border border-[#1E2730] bg-[#0A0C0B] p-4">
              <CircularRing value={kpi.ringValue} tone={kpi.tone} label={kpi.value.replace('%', '')} />
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground truncate">{kpi.label}</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={cn("text-[10px] font-medium whitespace-nowrap", kpi.trendUp ? "text-evidence" : "text-critical")}>{kpi.trend}</span>
                </div>
                <span className="text-[10px] text-muted-foreground truncate">{kpi.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-6 items-start">
          
          {/* Left Column (Upload) */}
          <div className="col-span-3 flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white">1. Upload Evidence</span>
                <button onClick={() => toast.info("View supported types")} className="text-[10px] text-muted-foreground flex items-center gap-1 hover:text-white transition-colors">
                  Supported types <Shield className="size-3" />
                </button>
              </div>
              <div 
                className={cn(
                  "relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed bg-[#0A0C0B]/50 py-10 transition-all cursor-pointer overflow-hidden",
                  dragging ? "border-primary bg-primary/5" : "border-[#1E2730] hover:border-primary/40"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {dragging && <div className="absolute inset-0 bg-primary/5 animate-pulse pointer-events-none" />}
                <Upload className={cn("size-6 transition-colors", dragging ? "text-primary" : "text-muted-foreground")} />
                <p className={cn("text-sm font-medium transition-colors", dragging ? "text-primary" : "text-white")}>
                  {dragging ? "Drop files now" : "Drag & drop files here"}
                </p>
                
                <div className="flex items-center gap-2 w-full px-12 z-10">
                  <div className="h-px flex-1 bg-[#1E2730]" />
                  <span className="text-[10px] text-muted-foreground uppercase">or</span>
                  <div className="h-px flex-1 bg-[#1E2730]" />
                </div>
                
                <div className="flex items-center justify-center gap-2 flex-wrap px-4">
                  <Button onClick={() => toast.success("Browse files opened")} size="sm" variant="outline" className="h-7 px-2.5 text-[10px] bg-transparent border-[#1E2730] text-white hover:bg-[#1E2730]">
                    <FileText className="size-3 mr-1.5" /> Browse Files
                  </Button>
                  <Button onClick={() => toast.success("Paste URL opened")} size="sm" variant="outline" className="h-7 px-2.5 text-[10px] bg-transparent border-[#1E2730] text-white hover:bg-[#1E2730]">
                    <Link2 className="size-3 mr-1.5" /> Paste URL
                  </Button>
                  <Button onClick={() => toast.success("Source connection opened")} size="sm" variant="outline" className="h-7 px-2.5 text-[10px] bg-transparent border-[#1E2730] text-white hover:bg-[#1E2730]">
                    <Database className="size-3 mr-1.5" /> Connect Source
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {["PDF", "DOCX", "XLSX", "CSV", "TXT", "PNG / JPG"].map(ext => (
                  <span key={ext} className="rounded border border-[#1E2730] bg-[#141B21] px-2 py-0.5 text-[9px] font-semibold text-muted-foreground">
                    {ext}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white">URL Analysis</span>
              <p className="text-[11px] text-muted-foreground">Paste a URL to analyze web content or public filings</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="https://example.com/contract/12345" 
                  className="flex-1 rounded border border-[#1E2730] bg-[#0A0C0B] px-3 py-1.5 text-[11px] text-white placeholder-muted-foreground focus:border-primary/50 outline-none transition-colors"
                />
                <Button onClick={() => toast.success("URL submitted for analysis")} size="sm" className="h-[30px] px-3 text-[10px] font-semibold bg-transparent border border-primary text-primary hover:bg-primary/10">
                  Analyze URL
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-[10px] text-muted-foreground">Supported:</span>
                {["Contracts", "Invoices", "SEC Filings", "News", "Web pages", "Other"].map(ext => (
                  <span key={ext} className="text-[10px] text-white/80 hover:text-white cursor-pointer transition-colors">
                    {ext}
                  </span>
                ))}
              </div>
            </div>
            
            <input 
              ref={fileInputRef} 
              type="file" 
              className="hidden" 
              multiple 
              onChange={handleFileSelect} 
            />

            {uploadProgress !== null && (
              <div className="flex flex-col gap-1.5 animate-fade-in">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Uploading files...</span>
                  <span className="font-bold tabular-nums text-white">{uploadProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#1E2730] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-150" 
                    style={{ width: `${uploadProgress}%` }} 
                  />
                </div>
              </div>
            )}
          </div>

          {/* Center Column (Extraction) */}
          <div className="col-span-6 flex flex-col gap-4">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white">2. Extraction Review</span>
            
            <div className="rounded-xl border border-[#1E2730] bg-[#141B21] flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[#1E2730] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-8 items-center justify-center rounded bg-critical/10 border border-critical/20 shrink-0">
                    <span className="text-[9px] font-bold text-critical">PDF</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-white">Vendor_Contract_2026.pdf</span>
                    <span className="text-[10px] text-muted-foreground">PDF • 1.8 MB • Uploaded May 24, 2026 10:15 AM</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] font-medium text-white">12 / 15 fields confirmed</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => toast.info("Previous page")} className="flex size-6 items-center justify-center rounded hover:bg-[#1E2730] text-muted-foreground hover:text-white transition-colors">
                        <ChevronLeft className="size-3.5" />
                      </button>
                      <span className="text-[11px] font-medium text-white tabular-nums">1 / 12</span>
                      <button onClick={() => toast.info("Next page")} className="flex size-6 items-center justify-center rounded hover:bg-[#1E2730] text-muted-foreground hover:text-white transition-colors">
                        <ChevronRight className="size-3.5" />
                      </button>
                      <button onClick={() => toast.info("More options")} className="flex size-6 items-center justify-center rounded hover:bg-[#1E2730] text-muted-foreground hover:text-white transition-colors ml-1">
                        <MoreVertical className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="h-1 w-32 rounded-full bg-[#1E2730] overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '80%' }} />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="p-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#1E2730]">
                      <th className="pb-3 text-left text-[9px] font-semibold uppercase tracking-widest text-muted-foreground w-[28%]">Field</th>
                      <th className="pb-3 text-left text-[9px] font-semibold uppercase tracking-widest text-muted-foreground w-[32%]">Extracted Value</th>
                      <th className="pb-3 text-left text-[9px] font-semibold uppercase tracking-widest text-muted-foreground w-[15%]">Confidence</th>
                      <th className="pb-3 text-left text-[9px] font-semibold uppercase tracking-widest text-muted-foreground w-[12%]">Source</th>
                      <th className="pb-3 text-center text-[9px] font-semibold uppercase tracking-widest text-muted-foreground w-[8%]">Confirmed</th>
                      <th className="pb-3 text-center text-[9px] font-semibold uppercase tracking-widest text-muted-foreground w-[5%]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractionFields.map((f, i) => (
                      <tr key={i} className="border-b border-[#1E2730]/50 last:border-0 hover:bg-white/[0.02] transition-colors">
                        <td className="py-2.5 font-medium text-white pr-2">{f.label}</td>
                        <td className="py-2.5 pr-4">
                          <div className="flex items-center justify-between gap-2 border-b border-[#1E2730] pb-0.5">
                            <span className="text-white truncate">{f.value}</span>
                            {f.type === "date" ? <Calendar className="size-3 text-muted-foreground shrink-0" /> : f.type === "select" ? <ChevronDown className="size-3 text-muted-foreground shrink-0" /> : null}
                          </div>
                        </td>
                        <td className="py-2.5 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-medium text-white tabular-nums w-6">{f.conf}%</span>
                            <div className="h-1 w-8 rounded-full bg-[#1E2730] overflow-hidden">
                              <div className="h-full bg-evidence" style={{ width: `${f.conf}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 text-muted-foreground">{f.source}</td>
                        <td className="py-2.5">
                          <div className="flex justify-center">
                            <button onClick={() => toast.success("Confirmation toggled")} className={cn("flex size-3.5 items-center justify-center rounded-sm border", f.checked ? "bg-primary border-primary text-[#0A0C0B]" : "border-muted-foreground/40 hover:border-muted-foreground")}>
                              {f.checked && <Check className="size-2.5 stroke-[3]" />}
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5">
                          <div className="flex justify-center">
                            <button onClick={() => toast.info("Edit field")} className="text-muted-foreground hover:text-white transition-colors">
                              <Edit2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-[#1E2730] p-4 bg-[#0A0C0B]/40 rounded-b-xl">
                <button onClick={() => toast.info("Add custom field modal opened")} className="text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5">
                  <span className="text-sm leading-none">+</span> Add custom field
                </button>
                <div className="flex items-center gap-3">
                  <Button onClick={() => toast.success("Changes reset")} size="sm" variant="outline" className="h-8 px-4 text-[11px] bg-transparent border-[#1E2730] text-white hover:bg-[#1E2730]">
                    Reset
                  </Button>
                  <Button onClick={() => toast.success("Changes saved")} size="sm" className="h-8 px-4 text-[11px] bg-primary text-primary-foreground hover:bg-primary/90">
                    Save changes
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Rules & Actions) */}
          <div className="col-span-3 flex flex-col gap-6">
            
            {/* Intake Rules */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white">Intake Rules</span>
                <button onClick={() => toast.info("Manage rules settings opened")} className="text-[10px] text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                  Manage rules <ArrowRight className="size-3" />
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { title: "Extract key fields and metadata", desc: "AI extracts and suggests values" },
                  { title: "Detect duplicates & near-matches", desc: "Auto-check before adding new sources" },
                  { title: "Validate data quality", desc: "Confidence, completeness, and consistency" },
                  { title: "Require human confirmation", desc: "No data affects metrics without review" },
                  { title: "Create proof trail", desc: "Every change is logged with evidence" }
                ].map((rule, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="size-3.5 text-primary mt-0.5 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-medium text-white">{rule.title}</span>
                      <span className="text-[10px] text-muted-foreground">{rule.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Provider & System Status */}
            <div className="flex flex-col gap-3 mt-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white">Provider & System Status</span>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-3.5 text-[#3b82f6]" fill="currentColor" />
                    <span className="text-[11px] font-medium text-white">Gemini 1.5 Pro</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground flex-1 ml-4">AI extraction</span>
                  <span className="text-[11px] font-medium text-evidence">Ready</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="size-3.5 text-evidence" />
                    <span className="text-[11px] font-medium text-white">OCR Engine</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground flex-1 ml-4">Document OCR</span>
                  <span className="text-[11px] font-medium text-evidence">Ready</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <File className="size-3.5 text-evidence" />
                    <span className="text-[11px] font-medium text-white">Local Parser</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground flex-1 ml-4">Structured data</span>
                  <span className="text-[11px] font-medium text-evidence">Ready</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="size-3.5 text-evidence" />
                    <span className="text-[11px] font-medium text-white">Supabase Storage</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground flex-1 ml-4">Data storage</span>
                  <span className="text-[11px] font-medium text-evidence">Healthy</span>
                </div>
              </div>
            </div>

            {/* Review Actions */}
            <div className="flex flex-col gap-3 mt-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white">Review Actions</span>
              <div className="flex flex-col gap-2">
                <Button onClick={() => toast.success("Selected items confirmed")} className="w-full justify-center bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 text-xs font-semibold h-9">
                  Confirm Selected (3)
                </Button>
                <Button onClick={() => toast.success("Sent to Diagnostics")} variant="outline" className="w-full justify-center bg-transparent border-[#1E2730] text-white hover:bg-[#1E2730] text-xs h-9">
                  Send to Diagnostics (3)
                </Button>
                <Button onClick={() => toast.success("Proof trail created")} variant="outline" className="w-full justify-center bg-transparent border-[#1E2730] text-white hover:bg-[#1E2730] text-xs h-9">
                  Create Proof Trail (3)
                </Button>
                <Button onClick={() => toast.success("Export started")} variant="outline" className="w-full justify-center bg-transparent border-[#1E2730] text-white hover:bg-[#1E2730] text-xs h-9 mt-2">
                  <Download className="size-3.5 mr-2" /> Export Extracted Data
                </Button>
              </div>
            </div>

          </div>

          {/* Bottom Table */}
          <div className="col-span-12 flex flex-col gap-4 mt-2 border-t border-[#1E2730] pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white">3. Uploaded Sources</span>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1.5 rounded border border-[#1E2730] bg-[#141B21] px-2 py-1 text-[11px] text-white hover:bg-[#1E2730] transition-colors">
                        {sourceFilter} <ChevronDown className="size-3 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 border-[#1E2730] bg-[#0A0C0B] text-white">
                      {["All sources", "Contract", "Spreadsheet", "CSV", "URL", "Invoice"].map((option) => (
                        <DropdownMenuItem key={option} className="text-xs hover:bg-[#1E2730] cursor-pointer" onClick={() => setSourceFilter(option)}>
                          {option}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1.5 rounded border border-[#1E2730] bg-[#141B21] px-2 py-1 text-[11px] text-white hover:bg-[#1E2730] transition-colors">
                        {statusFilter} <ChevronDown className="size-3 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 border-[#1E2730] bg-[#0A0C0B] text-white">
                      {["All status", "Extraction complete", "Processing", "Needs review"].map((option) => (
                        <DropdownMenuItem key={option} className="text-xs hover:bg-[#1E2730] cursor-pointer" onClick={() => setStatusFilter(option)}>
                          {option}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <button onClick={() => toast.info("Date range picker opened")} className="flex items-center gap-1.5 rounded border border-[#1E2730] bg-[#141B21] px-2 py-1 text-[11px] text-white hover:bg-[#1E2730] transition-colors">
                    <Calendar className="size-3 text-muted-foreground" /> May 19, 2026 - May 26, 2026
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">View archived</span>
                  <div className="h-3.5 w-6 rounded-full bg-[#1E2730] relative cursor-pointer">
                    <div className="absolute left-0.5 top-0.5 size-2.5 rounded-full bg-muted-foreground" />
                  </div>
                </div>
                <div className="w-px h-4 bg-[#1E2730]" />
                <button onClick={() => toast.info("Columns settings opened")} className="flex items-center gap-1.5 rounded border border-[#1E2730] bg-[#141B21] px-2 py-1 text-[11px] text-white hover:bg-[#1E2730] transition-colors">
                  <div className="flex flex-col gap-0.5">
                    <div className="h-px w-2.5 bg-current" />
                    <div className="h-px w-2.5 bg-current" />
                    <div className="h-px w-2.5 bg-current" />
                  </div>
                  Columns <ChevronDown className="size-3 text-muted-foreground" />
                </button>
              </div>
            </div>
            
            <div className="rounded-xl border border-[#1E2730] bg-[#0A0C0B]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#1E2730]">
                    <th className="px-4 py-3 text-left w-10">
                      <div className="flex size-3.5 items-center justify-center rounded-sm border border-muted-foreground/40" />
                    </th>
                    <th className="py-3 text-left text-[9px] font-semibold uppercase tracking-widest text-muted-foreground w-[22%]">Source Name</th>
                    <th className="py-3 text-left text-[9px] font-semibold uppercase tracking-widest text-muted-foreground w-[10%]">Type</th>
                    <th className="py-3 text-left text-[9px] font-semibold uppercase tracking-widest text-muted-foreground w-[15%]">Uploaded <ChevronDown className="size-3 inline-block ml-0.5 align-text-bottom" /></th>
                    <th className="py-3 text-left text-[9px] font-semibold uppercase tracking-widest text-muted-foreground w-[12%]">Uploaded By</th>
                    <th className="py-3 text-left text-[9px] font-semibold uppercase tracking-widest text-muted-foreground w-[15%]">Extraction Status</th>
                    <th className="py-3 text-left text-[9px] font-semibold uppercase tracking-widest text-muted-foreground w-[10%]">Confidence</th>
                    <th className="py-3 text-left text-[9px] font-semibold uppercase tracking-widest text-muted-foreground w-[10%]">Fields Confirmed</th>
                    <th className="py-3 text-left text-[9px] font-semibold uppercase tracking-widest text-muted-foreground w-[6%]">Proof Trail</th>
                    <th className="px-4 py-3 text-right text-[9px] font-semibold uppercase tracking-widest text-muted-foreground w-[10%]"></th>
                  </tr>
                </thead>
                <tbody>
                  {displaySources.map((row, i) => (
                    <tr key={row.id} className="border-b border-[#1E2730]/50 last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="flex size-3.5 items-center justify-center rounded-sm border border-muted-foreground/40" />
                      </td>
                      <td className="py-2.5 pr-2">
                        <div className="flex items-center gap-2">
                          <div className={cn("flex size-5 items-center justify-center rounded shrink-0", 
                            row.name.endsWith('.pdf') ? "bg-critical/10 text-critical" :
                            row.name.endsWith('.xlsx') || row.name.endsWith('.csv') ? "bg-primary/10 text-primary" :
                            "bg-evidence/10 text-evidence"
                          )}>
                            <span className="text-[7px] font-bold">{
                              row.name.endsWith('.pdf') ? "PDF" :
                              row.name.endsWith('.xlsx') ? "XLSX" :
                              row.name.endsWith('.csv') ? "CSV" : "URL"
                            }</span>
                          </div>
                          <span className="font-medium text-white truncate max-w-[180px]">{row.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-white">{row.type}</td>
                      <td className="py-2.5 text-white tabular-nums">{row.time}</td>
                      <td className="py-2.5 text-muted-foreground">{row.user}</td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <StatusDot tone={row.statusTone} />
                          <span className="text-white">{row.status}</span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium text-white tabular-nums w-6">{row.confidence}%</span>
                          <div className="h-1 flex-1 rounded-full bg-[#1E2730] overflow-hidden">
                            <div className="h-full bg-evidence" style={{ width: `${row.confidence}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 text-white tabular-nums">{row.fields}</td>
                      <td className="py-2.5">
                        <a href="#" className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline">
                          {row.proof} <ExternalLink className="size-2.5" />
                        </a>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button onClick={() => toast.success("Review opened")} size="sm" variant="outline" className="h-6 px-2 text-[10px] bg-transparent border-[#1E2730] text-white hover:bg-[#1E2730]">
                            Review
                          </Button>
                          <div className="flex">
                            <Button onClick={() => toast.success("Sent")} size="sm" variant="outline" className="h-6 px-2 text-[10px] bg-transparent border-[#1E2730] text-evidence hover:bg-[#1E2730] border-r-0 rounded-r-none">
                              Send
                            </Button>
                            <Button onClick={() => toast.info("Send options opened")} size="sm" variant="outline" className="h-6 px-1 text-[10px] bg-transparent border-[#1E2730] text-evidence hover:bg-[#1E2730] rounded-l-none">
                              <ChevronDown className="size-3" />
                            </Button>
                          </div>
                          <button onClick={() => toast.info("More options opened")} className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-[#1E2730] hover:text-white transition-colors ml-1">
                            <MoreVertical className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between border-t border-[#1E2730] px-4 py-3">
                <span className="text-[11px] text-muted-foreground">
                  Showing {filteredSources.length === 0 ? 0 : startIndex} to {endIndex} of {filteredSources.length} sources
                </span>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                      disabled={currentPage === 1}
                      className="text-muted-foreground hover:text-white transition-colors mr-1 disabled:opacity-50 disabled:hover:text-muted-foreground"
                    >
                      <ChevronLeft className="size-3.5" />
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      // Simple logic to show a window of pages around current
                      let pageNum = currentPage;
                      if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;
                      
                      if (pageNum < 1 || pageNum > totalPages) return null;

                      return (
                        <button 
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={cn(
                            "flex size-5 items-center justify-center rounded transition-colors",
                            currentPage === pageNum 
                              ? "border border-[#1E2730] bg-[#1E2730] text-white"
                              : "text-muted-foreground hover:text-white"
                          )}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <span className="text-muted-foreground px-1">...</span>
                        <button 
                          onClick={() => setCurrentPage(totalPages)}
                          className="flex size-5 items-center justify-center rounded text-muted-foreground hover:text-white transition-colors"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                    
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                      disabled={currentPage === totalPages}
                      className="text-muted-foreground hover:text-white transition-colors ml-1 disabled:opacity-50 disabled:hover:text-muted-foreground"
                    >
                      <ChevronRight className="size-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    Rows per page: 
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center gap-1 font-medium text-white hover:bg-white/5 px-1.5 py-0.5 rounded transition-colors">
                          {rowsPerPage} <ChevronDown className="size-3 text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[80px] border-[#1E2730] bg-[#0A0C0B] text-white">
                        {[5, 10, 20, 50].map((size) => (
                          <DropdownMenuItem 
                            key={size} 
                            className="text-xs hover:bg-[#1E2730] cursor-pointer" 
                            onClick={() => {
                              setRowsPerPage(size);
                              setCurrentPage(1);
                            }}
                          >
                            {size}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="flex items-center gap-8 border-t border-[#1E2730] bg-[#0A0C0B] px-6 py-2.5 text-[11px]">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-white">System status</span>
          <StatusDot tone="evidence" />
          <span className="text-muted-foreground">All systems operational</span>
        </div>
        <div className="h-3 w-px bg-[#1E2730]" />
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="font-semibold text-white">Data pipeline</span>
          <StatusDot tone="evidence" /> Healthy
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="font-semibold text-white">AI extraction</span>
          <StatusDot tone="evidence" /> Healthy
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="font-semibold text-white">Agent runtime</span>
          <StatusDot tone="evidence" /> Healthy
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="font-semibold text-white">Approval service</span>
          <StatusDot tone="evidence" /> Healthy
        </div>
        <div className="ml-auto flex items-center gap-2 text-muted-foreground">
          Last updated: 2m ago <RefreshCw className="size-3" />
        </div>
      </div>
    </div>
  );
}
