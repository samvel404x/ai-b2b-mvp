"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Database,
  Eye,
  FileText,
  FileUp,
  Filter,
  Globe,
  Link2,
  MoreHorizontal,
  RefreshCw,
  Search,
  Send,
  Shield,
  Sparkles,
  Upload,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { PageHeader, Panel, ConfBar, EvidenceLink, StatusDot } from "../shared";
import { evidencePipeline } from "@/lib/genius-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

/* ── KPI cards data ────────────────────────────────────────────────────────── */
const intakeKpis = [
  { label: "Evidence Sources", value: "95", sub: "12 connected", trend: "+8 vs last 7 days", ring: 95, ringColor: "#38BDF8" },
  { label: "Files Processed", value: "132", sub: "This week", trend: "+16 vs last 7 days", ring: 81, ringColor: "#22C55E" },
  { label: "Extraction Confidence", value: "88%", sub: "Average", trend: "+6 pts vs last 7 days", ring: 88, ringColor: "#22C55E" },
  { label: "Pending Review", value: "24", sub: "Requires attention", trend: "-5 vs last 7 days", ring: 24, ringColor: "#F59E0B" },
  { label: "Data Quality Score", value: "84%", sub: "Good", trend: "+5 pts vs last 7 days", ring: 84, ringColor: "#22C55E" },
  { label: "Duplicate Sources", value: "7", sub: "Auto-detected", trend: "+2 vs last 7 days", ring: 7, ringColor: "#EF4444" },
];

/* ── Extraction review fields ──────────────────────────────────────────────── */
const extractionDoc = {
  name: "Vendor_Contract_2026.pdf",
  type: "PDF",
  size: "1.8 MB",
  uploaded: "May 24, 2026 10:15 AM",
  totalFields: 15,
  confirmedFields: 12,
  page: 1,
  totalPages: 12,
};

const extractionFields = [
  { id: 1, field: "Counterparty", value: "TechSoft Solutions LLC", confidence: 95, source: "Page 1", confirmed: true },
  { id: 2, field: "Agreement Type", value: "Master Services Agreement", confidence: 93, source: "Page 1", confirmed: true },
  { id: 3, field: "Effective Date", value: "May 15, 2026", confidence: 98, source: "Page 1", confirmed: true },
  { id: 4, field: "Renewal Date", value: "May 15, 2027", confidence: 91, source: "Page 8", confirmed: false },
  { id: 5, field: "Payment Terms", value: "Net 30", confidence: 89, source: "Page 5", confirmed: true },
  { id: 6, field: "Contract Value", value: "$248,700.00", confidence: 94, source: "Page 2", confirmed: true },
  { id: 7, field: "Owner", value: "Michael Wong", confidence: 86, source: "Page 1", confirmed: true },
  { id: 8, field: "Currency", value: "USD", confidence: 99, source: "Page 2", confirmed: true },
  { id: 9, field: "Auto-renewal", value: "Yes, 12 months", confidence: 88, source: "Page 8", confirmed: true },
];

/* ── Uploaded sources data ────────────────────────────────────────────────── */
const uploadedSources = [
  { id: "S-01", name: "Vendor_Contract_2026.pdf", type: "Contract", uploadedBy: "Alex Rivera", date: "May 24, 2026 10:15 AM", status: "Extraction complete", confidence: 92, confirmed: "12 / 15", proofTrail: "PT-1268" },
  { id: "S-02", name: "Spend_Analysis_May_2026.xlsx", type: "Spreadsheet", uploadedBy: "Sarah Green", date: "May 24, 2026 9:42 AM", status: "Extraction complete", confidence: 89, confirmed: "18 / 22", proofTrail: "PT-1267" },
  { id: "S-03", name: "AP_Terms_Drift_May.csv", type: "CSV", uploadedBy: "Daniel Tran", date: "May 24, 2026 9:15 AM", status: "Processing", confidence: 60, confirmed: "8 / 20", proofTrail: "PT-1266" },
  { id: "S-04", name: "https://sec.gov/ix?doc=/..", type: "URL", uploadedBy: "Alex Rivera", date: "May 23, 2026 4:32 PM", status: "Extraction complete", confidence: 85, confirmed: "10 / 14", proofTrail: "PT-1265" },
  { id: "S-05", name: "Microsoft_EA_Renewal_Quote.pdf", type: "Invoice", uploadedBy: "Michael Wong", date: "May 23, 2026 11:08 AM", status: "Needs review", confidence: 78, confirmed: "6 / 12", proofTrail: "PT-1264" },
];

/* ── Intake rules ──────────────────────────────────────────────────────────── */
const intakeRules = [
  { icon: Sparkles, label: "Extract key fields and metadata", desc: "AI extracts and suggests values", active: true },
  { icon: Search, label: "Detect duplicates & near-matches", desc: "Auto-check before adding new sources", active: true },
  { icon: Shield, label: "Validate data quality", desc: "Confidence, completeness, and consistency", active: true },
  { icon: ClipboardCheck, label: "Require human confirmation", desc: "No data affects metrics without review", active: true },
  { icon: FileText, label: "Create proof trail", desc: "Every change is logged with evidence", active: true },
];

/* ── Supported file types ──────────────────────────────────────────────────── */
const fileTypes = ["PDF", "DOCX", "XLSX", "CSV", "TXT", "PNG / JPG"];

/* ── URL supported types ──────────────────────────────────────────────────── */
const urlTypes = ["Contracts", "Invoices", "SEC Filings", "News", "Web pages", "Other"];

export default function DataIntake({ onNavigate }) {
  const [confirmed, setConfirmed] = useState(
    extractionFields.filter(f => f.confirmed).map(f => f.id)
  );
  const [urlValue, setUrlValue] = useState("https://example.com/contract/12345");
  const [activeSource, setActiveSource] = useState("S-01");
  const [page, setPage] = useState(1);
  const [viewArchived, setViewArchived] = useState(false);
  const inputRef = useRef(null);

  function toggle(id) {
    setConfirmed(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function onFiles(list) {
    if (list?.length) {
      toast.success(`${list.length} file(s) uploaded`, { description: "Extraction started." });
    }
  }

  const statusColor = (status) => {
    if (status === "Extraction complete") return "text-[#22C55E]";
    if (status === "Processing") return "text-[#F59E0B]";
    return "text-[#EF4444]";
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <PageHeader
        title="Data Intake"
        description="Upload, connect, and review business evidence before it impacts your metrics."
      />

      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {intakeKpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className="group relative flex animate-fade-up items-center gap-3 overflow-hidden rounded-xl border border-[#1E2730] bg-[#0E1418] p-3.5 transition-all hover:bg-[#141B21]"
            style={{ animationDelay: `${i * 45}ms` }}
          >
            {/* Mini ring */}
            <div className="relative flex size-11 shrink-0 items-center justify-center">
              <svg viewBox="0 0 36 36" className="size-11">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#1E2730"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={kpi.ringColor}
                  strokeWidth="3"
                  strokeDasharray={`${kpi.ring}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[10px] font-bold tabular text-[#F4F7F8]">{kpi.ring}</span>
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#68737D]">{kpi.label}</span>
              <div className="text-lg font-semibold tabular text-[#F4F7F8]">{kpi.value}</div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#22C55E]">{kpi.trend.startsWith("+") ? "^" : ""} {kpi.trend}</span>
              </div>
              <span className="text-[10px] text-[#68737D]">{kpi.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main 3-column layout: Upload | Extraction Review | Intake Rules */}
      <div className="grid gap-5 xl:grid-cols-[280px_1fr_280px]">
        {/* Left: Upload Evidence */}
        <div className="flex flex-col gap-4">
          <Panel title="1. Upload Evidence" description="Supported types">
            {/* Drop zone */}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#2C3842] bg-[#11171C] px-4 py-8 text-center transition-colors hover:border-[#22C55E]/40 hover:bg-[#141B21]"
            >
              <Upload className="size-8 text-[#68737D]" />
              <span className="text-sm font-medium text-[#A7B0B8]">Drag & drop files here</span>
              <span className="text-xs text-[#68737D]">or</span>
              <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
            </button>

            {/* Action buttons */}
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 border-[#1E2730] text-[#A7B0B8] hover:bg-[#182128]" onClick={() => inputRef.current?.click()}>
                <FileUp className="size-3.5 mr-1.5" />Browse Files
              </Button>
              <Button variant="outline" size="sm" className="flex-1 border-[#1E2730] text-[#A7B0B8] hover:bg-[#182128]">
                <Link2 className="size-3.5 mr-1.5" />Paste URL
              </Button>
              <Button variant="outline" size="sm" className="flex-1 border-[#1E2730] text-[#A7B0B8] hover:bg-[#182128]">
                <Database className="size-3.5 mr-1.5" />Connect Source
              </Button>
            </div>

            {/* File type pills */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {fileTypes.map(t => (
                <span key={t} className="rounded border border-[#1E2730] bg-[#11171C] px-2 py-1 text-[10px] font-medium text-[#A7B0B8]">{t}</span>
              ))}
            </div>
          </Panel>

          {/* URL Analysis */}
          <Panel title="URL Analysis" description="Paste a URL to analyze web content or public filings">
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/contract/12345"
                className="flex-1 border-[#1E2730] bg-[#11171C] text-[#A7B0B8] placeholder-[#68737D]"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
              />
              <Button size="sm" className="bg-[#22C55E] text-[#03110a] hover:bg-[#16A34A]" onClick={() => {
                if (urlValue) { toast.success("URL queued", { description: "Analyzing source..." }); }
              }}>
                Analyze URL
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="text-[10px] text-[#68737D]">Supported:</span>
              {urlTypes.map(t => (
                <span key={t} className="rounded bg-[#182128] px-2 py-0.5 text-[10px] text-[#A7B0B8]">{t}</span>
              ))}
            </div>
          </Panel>
        </div>

        {/* Center: Extraction Review */}
        <Panel
          title="2. Extraction Review"
          contentClassName="p-0"
          actions={
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A7B0B8]">{extractionDoc.confirmedFields} / {extractionDoc.totalFields} fields confirmed</span>
              <div className="flex items-center gap-1 rounded border border-[#1E2730] bg-[#11171C]">
                <button type="button" className="p-1 text-[#68737D] hover:text-[#F4F7F8]"><ChevronLeft className="size-3.5" /></button>
                <span className="px-1 text-[11px] tabular text-[#A7B0B8]">{extractionDoc.page} / {extractionDoc.totalPages}</span>
                <button type="button" className="p-1 text-[#68737D] hover:text-[#F4F7F8]"><ChevronRight className="size-3.5" /></button>
              </div>
              <button type="button" className="rounded border border-[#1E2730] bg-[#11171C] p-1 text-[#68737D] hover:text-[#F4F7F8]"><MoreHorizontal className="size-3.5" /></button>
            </div>
          }
        >
          {/* Document header */}
          <div className="flex items-center gap-3 border-b border-[#1E2730] px-4 py-3">
            <div className="flex size-8 items-center justify-center rounded bg-[#EF4444]/10 text-[#EF4444]">
              <FileText className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-[#F4F7F8]">{extractionDoc.name}</span>
              <span className="text-[11px] text-[#68737D]">{extractionDoc.type} &middot; {extractionDoc.size} &middot; Uploaded {extractionDoc.uploaded}</span>
            </div>
          </div>

          {/* Fields table */}
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1E2730]">
                  {["Field", "Extracted Value", "Confidence", "Source", "Confirmed", "Actions"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#68737D] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {extractionFields.map((f, idx) => (
                  <tr key={f.id} className={cn("border-b border-[#1E2730]/50 transition-colors hover:bg-[#141B21]", idx === extractionFields.length - 1 && "border-b-0")}>
                    <td className="px-4 py-2.5 text-sm font-medium text-[#A7B0B8]">{f.field}</td>
                    <td className="px-4 py-2.5 text-sm text-[#F4F7F8]">{f.value}</td>
                    <td className="px-4 py-2.5">
                      <ConfBar value={f.confidence} />
                    </td>
                    <td className="px-4 py-2.5 text-xs text-[#68737D]">{f.source}</td>
                    <td className="px-4 py-2.5">
                      <Checkbox
                        checked={confirmed.includes(f.id)}
                        onCheckedChange={() => toggle(f.id)}
                        className="border-[#2C3842] data-[state=checked]:bg-[#22C55E] data-[state=checked]:border-[#22C55E]"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <button type="button" className="rounded p-1 text-[#68737D] transition-colors hover:bg-[#182128] hover:text-[#F4F7F8]">
                        <Eye className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between border-t border-[#1E2730] px-4 py-3">
            <span className="text-xs text-[#68737D]">+ Add custom field</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-[#1E2730] text-[#A7B0B8] hover:bg-[#182128]">Reset</Button>
              <Button size="sm" className="bg-[#22C55E] text-[#03110a] hover:bg-[#16A34A]" onClick={() => {
                toast.success("Evidence confirmed", { description: "Sent to diagnostics and the proof trail." });
              }}>
                Save changes
              </Button>
            </div>
          </div>
        </Panel>

        {/* Right: Intake Rules + Provider status + Review actions */}
        <div className="flex flex-col gap-4">
          <Panel title="Intake Rules" actions={
            <button type="button" className="text-xs text-[#38BDF8] hover:text-[#38BDF8]/80">Manage rules</button>
          }>
            <ul className="flex flex-col gap-3">
              {intakeRules.map((r) => (
                <li key={r.label} className="flex items-start gap-3">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded bg-[#22C55E]/10 text-[#22C55E] mt-0.5">
                    <CheckCircle2 className="size-3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-medium text-[#F4F7F8]">{r.label}</span>
                    <span className="text-[10px] text-[#68737D]">{r.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Provider & System Status">
            <div className="flex flex-col gap-2.5 text-xs">
              {[
                { label: "Gemini 1.5 Pro", desc: "AI extraction", status: "Ready" },
                { label: "OCR Engine", desc: "Document OCR", status: "Ready" },
                { label: "Local Parser", desc: "Structured data", status: "Ready" },
                { label: "Supabase Storage", desc: "Data storage", status: "Healthy" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-[#A7B0B8]">{s.label}</span>
                    <span className="ml-2 text-[#68737D]">{s.desc}</span>
                  </div>
                  <span className="text-[#22C55E] font-medium">{s.status}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Review Actions">
            <div className="flex flex-col gap-2">
              <Button className="w-full bg-[#22C55E] text-[#03110a] hover:bg-[#16A34A] justify-center">
                <CheckCircle2 className="size-3.5 mr-1.5" />Confirm Selected (3)
              </Button>
              <Button className="w-full bg-[#0EA5E9] text-white hover:bg-[#0EA5E9]/90 justify-center">
                <Send className="size-3.5 mr-1.5" />Send to Diagnostics (3)
              </Button>
              <Button variant="outline" className="w-full border-[#1E2730] text-[#A7B0B8] hover:bg-[#182128] justify-center">
                <FileText className="size-3.5 mr-1.5" />Create Proof Trail (3)
              </Button>
              <Button variant="outline" className="w-full border-[#1E2730] text-[#A7B0B8] hover:bg-[#182128] justify-center">
                <Upload className="size-3.5 mr-1.5" />Export Extracted Data
              </Button>
            </div>
          </Panel>
        </div>
      </div>

      {/* Uploaded Sources Table */}
      <Panel
        title="3. Uploaded Sources"
        contentClassName="p-0"
        actions={
          <div className="flex items-center gap-3">
            <select className="rounded border border-[#1E2730] bg-[#11171C] px-2 py-1 text-[11px] text-[#A7B0B8] outline-none">
              <option>All sources</option>
              <option>Contracts</option>
              <option>Spreadsheets</option>
              <option>URLs</option>
            </select>
            <select className="rounded border border-[#1E2730] bg-[#11171C] px-2 py-1 text-[11px] text-[#A7B0B8] outline-none">
              <option>All status</option>
              <option>Complete</option>
              <option>Processing</option>
              <option>Needs review</option>
            </select>
            <span className="text-[11px] text-[#68737D]">May 19, 2026 – May 26, 2026</span>
            <button
              type="button"
              className={cn("flex items-center gap-1.5 rounded border px-2 py-1 text-[11px] transition-colors", viewArchived ? "border-[#22C55E]/30 bg-[#22C55E]/8 text-[#22C55E]" : "border-[#1E2730] bg-[#11171C] text-[#68737D] hover:text-[#A7B0B8]")}
              onClick={() => setViewArchived(!viewArchived)}
            >
              View archived
            </button>
            <button type="button" className="rounded border border-[#1E2730] bg-[#11171C] px-2 py-1 text-[11px] text-[#68737D] hover:text-[#A7B0B8]">
              <Filter className="mr-1 inline size-3" />Columns
            </button>
          </div>
        }
      >
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1E2730]">
                <th className="w-10 px-4 py-2.5"><Checkbox className="border-[#2C3842]" /></th>
                {["Source Name", "Type", "Uploaded", "Uploaded By", "Extraction Status", "Confidence", "Fields Confirmed", "Proof Trail", ""].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#68737D] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {uploadedSources.map((s, idx) => (
                <tr key={s.id} className={cn("border-b border-[#1E2730]/50 transition-colors hover:bg-[#141B21]", activeSource === s.id && "bg-[#141B21]")}>
                  <td className="px-4 py-3">
                    <Checkbox className="border-[#2C3842] data-[state=checked]:bg-[#22C55E] data-[state=checked]:border-[#22C55E]" checked={activeSource === s.id} onCheckedChange={() => setActiveSource(s.id)} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={cn("size-1.5 rounded-full", s.status === "Extraction complete" ? "bg-[#22C55E]" : s.status === "Processing" ? "bg-[#F59E0B]" : "bg-[#EF4444]")} />
                      <span className="text-sm font-medium text-[#F4F7F8]">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#A7B0B8]">{s.type}</td>
                  <td className="px-4 py-3 text-xs text-[#A7B0B8] whitespace-nowrap">{s.date}</td>
                  <td className="px-4 py-3 text-xs text-[#A7B0B8]">{s.uploadedBy}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs font-medium", statusColor(s.status))}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ConfBar value={s.confidence} />
                  </td>
                  <td className="px-4 py-3 text-xs text-[#A7B0B8]">{s.confirmed}</td>
                  <td className="px-4 py-3">
                    <EvidenceLink>{s.proofTrail}</EvidenceLink>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" className="h-6 border-[#1E2730] px-2 text-[10px] text-[#A7B0B8] hover:bg-[#182128]">Review</Button>
                      <Button variant="outline" size="sm" className="h-6 border-[#1E2730] px-2 text-[10px] text-[#A7B0B8] hover:bg-[#182128]">Send</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-[#1E2730] px-4 py-2.5">
            <span className="text-[11px] text-[#68737D]">Showing 1 to {uploadedSources.length} of 95 sources</span>
            <div className="flex items-center gap-1">
              <button type="button" className="rounded border border-[#1E2730] bg-[#11171C] p-1 text-[#68737D] hover:text-[#A7B0B8]"><ChevronLeft className="size-3" /></button>
              {[1, 2, 3, 4, 5, "...", 19].map((p, i) => (
                <button
                  key={i}
                  type="button"
                  className={cn(
                    "flex size-6 items-center justify-center rounded text-[11px] font-medium transition-colors",
                    p === page ? "bg-[#22C55E] text-[#03110a]" : "text-[#68737D] hover:bg-[#182128] hover:text-[#A7B0B8]"
                  )}
                  onClick={() => typeof p === "number" && setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button type="button" className="rounded border border-[#1E2730] bg-[#11171C] p-1 text-[#68737D] hover:text-[#A7B0B8]"><ChevronRight className="size-3" /></button>
              <span className="ml-2 text-[11px] text-[#68737D]">Rows per page:</span>
              <select className="rounded border border-[#1E2730] bg-[#11171C] px-1 py-0.5 text-[11px] text-[#A7B0B8] outline-none">
                <option>5</option>
                <option>10</option>
                <option>25</option>
              </select>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
