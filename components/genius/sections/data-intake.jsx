"use client";

import { useEffect, useState, useRef, useMemo } from "react";
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
import { useWorkspace } from "../workspace-context";
import {
  evidenceFileSizeLabel,
  evidenceUploadPolicy,
  validateEvidenceUploadSelection,
} from "@/lib/evidence-upload-policy";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";





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

function formatDateTime(value) {
  if (!value) return "Not uploaded yet";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatShortMoney(value) {
  const numeric = Number(value || 0);
  if (!numeric) return "$0";
  if (numeric >= 1_000_000) return `$${(numeric / 1_000_000).toFixed(1)}M`;
  if (numeric >= 1_000) return `$${Math.round(numeric / 1_000)}K`;
  return `$${Math.round(numeric).toLocaleString("en-US")}`;
}

function evidenceType(record) {
  if (record?.kind === "PDF") return "Contract";
  if (record?.kind === "Excel") return "Spreadsheet";
  if (record?.kind === "CSV") return "CSV";
  if (record?.kind === "URL") return "URL";
  if (/invoice/i.test(record?.name || "")) return "Invoice";
  return record?.kind || "Document";
}

function evidenceExtension(record) {
  if (record?.kind === "Excel") return "XLSX";
  if (record?.kind === "Document") return "DOC";
  return String(record?.kind || "DOC").toUpperCase().slice(0, 4);
}

function statusFromEvidence(record) {
  if (record?.status === "Confirmed") return { label: "Extraction complete", tone: "evidence" };
  if (record?.status === "Excluded") return { label: "Excluded", tone: "critical" };
  if (record?.providerStatus && record.providerStatus !== "ready") return { label: "Processing", tone: "primary" };
  return { label: "Needs review", tone: "warning" };
}

function fieldsForEvidence(record) {
  const fields = record?.fields && typeof record.fields === "object" ? record.fields : {};
  return Object.entries(fields)
    .filter(([, value]) => String(value ?? "").trim())
    .map(([key, value], index) => ({
      key,
      label: key.replace(/([A-Z])/g, " $1").replace(/[_-]/g, " ").replace(/^./, (letter) => letter.toUpperCase()),
      value: String(value),
      conf: Math.max(35, Math.min(99, Number(record?.confidence || 72) - (index % 3) * 3)),
      source: record?.kind === "URL" ? "URL" : "Extracted",
      checked: record?.status === "Confirmed" || index < 3,
    }));
}

function fieldInputId(key) {
  return `evidence-field-${String(key || "field").replace(/[^a-zA-Z0-9_-]/g, "_")}`;
}

function evidenceToSource(record) {
  const status = statusFromEvidence(record);
  const fields = fieldsForEvidence(record);
  const confirmed = record?.status === "Confirmed" ? fields.length : fields.filter((field) => field.checked).length;

  return {
    id: record.id,
    name: record.name || record.url || "Untitled source",
    type: evidenceType(record),
    extension: evidenceExtension(record),
    time: formatDateTime(record.createdAt),
    user: record.source || "Data Intake",
    status: status.label,
    statusTone: status.tone,
    confidence: Number(record.confidence || 0),
    fields: `${confirmed} / ${Math.max(fields.length, 1)}`,
    proof: record.status === "Confirmed" ? `PT-${String(record.id).slice(-6)}` : "Pending",
  };
}

function buildWorkspaceKpis({ evidence, metrics, diagnostics }) {
  const pending = evidence.filter((record) => record.status !== "Confirmed").length;
  const confirmed = evidence.length - pending;
  const avgConfidence = evidence.length
    ? Math.round(evidence.reduce((sum, record) => sum + Number(record.confidence || 0), 0) / evidence.length)
    : 0;
  const dataQuality = diagnostics?.dataQualityScore || metrics?.dataQualityScore || 0;

  return [
    { id: "sources", label: "EVIDENCE SOURCES", value: String(evidence.length), trend: `${confirmed} confirmed`, trendUp: true, sub: `${pending} pending`, tone: "evidence", ringValue: Math.min(100, evidence.length * 12) },
    { id: "processed", label: "FILES PROCESSED", value: String(evidence.length), trend: `${metrics?.findingCount || 0} findings`, trendUp: true, sub: "Workspace total", tone: "primary", ringValue: evidence.length ? 100 : 0 },
    { id: "confidence", label: "EXTRACTION CONFIDENCE", value: `${avgConfidence}%`, trend: avgConfidence ? "Workspace average" : "Waiting for evidence", trendUp: avgConfidence >= 70, sub: "Average", tone: "evidence", ringValue: avgConfidence },
    { id: "pending", label: "PENDING REVIEW", value: String(pending), trend: pending ? "Needs human check" : "Review clear", trendUp: pending === 0, sub: "Requires attention", tone: pending ? "warning" : "primary", ringValue: Math.min(100, pending * 20) },
    { id: "quality", label: "DATA QUALITY SCORE", value: `${dataQuality}%`, trend: dataQuality ? "Derived from review state" : "No data yet", trendUp: dataQuality >= 70, sub: "Workspace quality", tone: dataQuality >= 70 ? "evidence" : "warning", ringValue: dataQuality },
    { id: "risk", label: "MONEY AT RISK", value: formatShortMoney(metrics?.moneyAtRisk), trend: `${metrics?.openApprovalCount || 0} approvals`, trendUp: false, sub: "From findings", tone: "critical", ringValue: Math.min(100, metrics?.openApprovalCount ? 75 : 0) },
  ];
}

export default function DataIntake({ onNavigate, focusContext }) {
  const fileInputRef = useRef(null);
  const {
    evidence,
    metrics,
    diagnostics,
    backend,
    busy,
    uploadEvidence,
    analyzeUrl,
    reviewEvidence,
    exportEvidence,
    loadWorkspace,
    can,
  } = useWorkspace();
  const canUploadEvidence = can("upload_evidence");
  const canReviewEvidence = can("review_evidence");
  const canExportData = can("export_data");

  // State for filtering and pagination
  const [sourceFilter, setSourceFilter] = useState("All sources");
  const [statusFilter, setStatusFilter] = useState("All status");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [dragging, setDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [urlValue, setUrlValue] = useState("");
  const [fieldChecks, setFieldChecks] = useState({});
  const [fieldDrafts, setFieldDrafts] = useState({});
  const [selectedEvidenceId, setSelectedEvidenceId] = useState(null);
  const [selectedSourceIds, setSelectedSourceIds] = useState([]);

  const selectedEvidence = useMemo(() => {
    return evidence.find((record) => record.id === selectedEvidenceId)
      || evidence.find((record) => record.status === "Needs review")
      || evidence[0]
      || null;
  }, [evidence, selectedEvidenceId]);
  const selectedSourceIdSet = useMemo(() => new Set(selectedSourceIds), [selectedSourceIds]);
  const selectedSourceRecords = useMemo(() => {
    return evidence.filter((record) => selectedSourceIdSet.has(record.id));
  }, [evidence, selectedSourceIdSet]);

  useEffect(() => {
    if (!focusContext?.evidenceId) return undefined;

    const timer = window.setTimeout(() => {
      const record = evidence.find((item) => item.id === focusContext.evidenceId);
      if (!record) {
        toast.info("Linked evidence is not available in this workspace yet.");
        return;
      }

      setSelectedEvidenceId(record.id);
      document.getElementById("evidence-review-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
      toast.success(`Focused evidence: ${record.name}`);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [evidence, focusContext?.evidenceId, focusContext?.token]);

  useEffect(() => {
    if (!focusContext?.sourceType) return;

    const timer = window.setTimeout(() => {
      const mappedType = {
        Contracts: "Contract",
        Invoices: "Invoice",
        Emails: "Document",
        Reports: "Document",
      }[focusContext.sourceType] || focusContext.sourceType;

      setSourceFilter(mappedType);
      setCurrentPage(1);
      toast.success(`Filtered evidence sources by ${focusContext.sourceType}.`);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [focusContext?.sourceType, focusContext?.token]);

  const displayExtractionFields = useMemo(() => {
    if (!selectedEvidence) return [];
    return fieldsForEvidence(selectedEvidence).map((field) => ({
      ...field,
      checked: fieldChecks[field.key] ?? field.checked,
      value: fieldDrafts[field.key] ?? field.value,
    }));
  }, [fieldChecks, fieldDrafts, selectedEvidence]);

  const confirmedFieldCount = displayExtractionFields.filter((field) => field.checked).length;
  const workspaceKpis = useMemo(() => buildWorkspaceKpis({ evidence, metrics, diagnostics }), [diagnostics, evidence, metrics]);
  const sourceRows = useMemo(() => evidence.map(evidenceToSource), [evidence]);
  const reviewTargetRecords = selectedSourceRecords.length ? selectedSourceRecords : selectedEvidence ? [selectedEvidence] : [];
  const reviewTargetCount = reviewTargetRecords.length;

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
    if (!canUploadEvidence) {
      toast.error("Evidence upload requires upload evidence permission.");
      return;
    }
    handleFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = "";
    }
  };

  const openFilePicker = () => {
    if (!canUploadEvidence) {
      toast.error("Evidence upload requires upload evidence permission.");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleUploadZoneKeyDown = (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openFilePicker();
  };

  const handleFiles = async (fileList) => {
    if (!canUploadEvidence) {
      toast.error("Evidence upload requires upload evidence permission.");
      return;
    }
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const validation = validateEvidenceUploadSelection(files);

    if (!validation.ok) {
      toast.error(validation.error || "Evidence upload is outside the allowed policy.");
      return;
    }

    setUploadProgress(8);
    let progress = 0;
    const interval = setInterval(() => {
      progress = Math.min(88, progress + 12);
      setUploadProgress(progress);
    }, 180);

    try {
      await uploadEvidence(validation.files, "Data Intake");
      setUploadProgress(100);
      toast.success(`${validation.files.length} evidence source${validation.files.length === 1 ? "" : "s"} uploaded and sent for extraction`);
    } catch (error) {
      toast.error(error.message || "Evidence upload failed");
    } finally {
      clearInterval(interval);
      setTimeout(() => setUploadProgress(null), 450);
    }
  };

  const handleAnalyzeUrl = async () => {
    if (!canUploadEvidence) {
      toast.error("URL analysis requires upload evidence permission.");
      return;
    }
    try {
      await analyzeUrl(urlValue);
      setUrlValue("");
      toast.success("URL analyzed and added to review queue");
    } catch (error) {
      toast.error(error.message || "URL analysis failed");
    }
  };

  const extractionFieldsForRecord = (record) => {
    if (!record) return [];
    if (record.id === selectedEvidence?.id) return displayExtractionFields;
    return fieldsForEvidence(record);
  };

  const handleConfirmEvidence = async (status = "Confirmed", targetRecords = null) => {
    if (!canReviewEvidence) {
      toast.error("Evidence review requires review evidence permission.");
      return false;
    }
    const records = Array.isArray(targetRecords) && targetRecords.length
      ? targetRecords
      : selectedEvidence
        ? [selectedEvidence]
        : [];

    if (!records.length) {
      toast.info("Upload evidence before review.");
      return false;
    }

    const fieldsById = Object.fromEntries(
      records.map((record) => [
        record.id,
        Object.fromEntries(
          extractionFieldsForRecord(record)
          .filter((field) => field.checked)
          .map((field) => [field.key, field.value]),
        ),
      ]),
    );

    try {
      await reviewEvidence({ ids: records.map((record) => record.id), status, fieldsById });
      setSelectedSourceIds([]);
      setFieldDrafts({});
      toast.success(status === "Confirmed"
        ? `${records.length} evidence source${records.length === 1 ? "" : "s"} confirmed. Diagnostics and actions were refreshed.`
        : `${records.length} evidence source${records.length === 1 ? "" : "s"} excluded from diagnostics.`);
      return true;
    } catch (error) {
      toast.error(error.message || "Evidence review failed");
      return false;
    }
  };

  const handleLockedAction = (label) => {
    toast.info(`${label} is locked until production evidence workflow settings are enabled.`);
  };

  const openEvidenceReview = (id) => {
    setSelectedEvidenceId(id);
    setFieldChecks({});
    setFieldDrafts({});
    document.getElementById("evidence-review-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSaveFieldChanges = async () => {
    if (!selectedEvidence) {
      toast.info("Upload evidence before saving extraction fields.");
      return;
    }
    if (!canReviewEvidence) {
      toast.error("Evidence review requires review evidence permission.");
      return;
    }

    const fieldsById = {
      [selectedEvidence.id]: Object.fromEntries(
        displayExtractionFields
          .filter((field) => field.checked)
          .map((field) => [field.key, field.value]),
      ),
    };

    try {
      await reviewEvidence({
        ids: [selectedEvidence.id],
        status: selectedEvidence.status === "Confirmed" ? "Confirmed" : "Needs review",
        fieldsById,
      });
      setFieldDrafts({});
      toast.success("Extraction changes saved to workspace.");
    } catch (error) {
      toast.error(error.message || "Extraction changes could not be saved.");
    }
  };

  const openEvidenceProof = (id) => {
    const record = evidence.find((item) => item.id === id);
    if (!record) return;

    if (record.status !== "Confirmed") {
      openEvidenceReview(id);
      toast.info("Confirm this evidence before opening its proof trail.");
      return;
    }

    onNavigate?.("reports", {
      evidenceId: record.id,
      tab: "proof",
      source: "data-proof-trail",
    });
  };

  const toggleSourceSelection = (id) => {
    setSelectedSourceIds((previous) => previous.includes(id)
      ? previous.filter((item) => item !== id)
      : [...previous, id]);
  };

  const handleSendSource = (id) => {
    const record = evidence.find((item) => item.id === id);
    openEvidenceReview(id);

    if (record?.status !== "Confirmed") {
      toast.info("Review and confirm this evidence before opening its approval actions.");
      return;
    }

    onNavigate?.("approvals", {
      evidenceId: record.id,
      source: "data",
    });
  };

  const handleRefresh = async () => {
    try {
      await loadWorkspace();
      toast.success("Evidence workspace refreshed");
    } catch (error) {
      toast.error(error.message || "Evidence refresh failed");
    }
  };

  // Filter and paginate data
  const filteredSources = useMemo(() => {
    return sourceRows.filter(s => {
      if (sourceFilter !== "All sources" && s.type !== sourceFilter) return false;
      if (statusFilter !== "All status" && s.status !== statusFilter) return false;
      return true;
    });
  }, [sourceFilter, sourceRows, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSources.length / rowsPerPage));
  const displaySources = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredSources.slice(start, start + rowsPerPage);
  }, [filteredSources, currentPage, rowsPerPage]);

  const startIndex = (currentPage - 1) * rowsPerPage + 1;
  const endIndex = Math.min(currentPage * rowsPerPage, filteredSources.length);
  const visibleSourceIds = displaySources.map((row) => row.id);
  const allVisibleSelected = visibleSourceIds.length > 0 && visibleSourceIds.every((id) => selectedSourceIdSet.has(id));
  const someVisibleSelected = visibleSourceIds.some((id) => selectedSourceIdSet.has(id));

  const toggleVisibleSources = () => {
    setSelectedSourceIds((previous) => {
      const previousSet = new Set(previous);
      if (allVisibleSelected) {
        visibleSourceIds.forEach((id) => previousSet.delete(id));
      } else {
        visibleSourceIds.forEach((id) => previousSet.add(id));
      }
      return Array.from(previousSet);
    });
  };

  return (
    <div className="flex h-full min-h-[680px] flex-col overflow-hidden bg-transparent">
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 flex flex-col gap-6">

        {/* KPI Strip */}
        <div className="grid grid-cols-6 gap-4">
          {workspaceKpis.map(kpi => (
            <div key={kpi.id} className="flex items-center gap-4 rounded-xl border border-[#28313C] bg-[#0E1116] p-4">
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
                <button type="button" onClick={() => onNavigate?.("support")} className="text-[10px] text-muted-foreground flex items-center gap-1 hover:text-white transition-colors">
                  Supported types <Shield className="size-3" />
                </button>
              </div>
              <div
                className={cn(
                  "relative flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed bg-[#0E1116]/60 backdrop-blur-md py-12 shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all cursor-pointer overflow-hidden group",
                  dragging ? "border-primary bg-primary/10 shadow-[0_0_40px_rgba(78,161,255,0.15)]" : "border-[#28313C] hover:border-primary/50 hover:bg-[#0F141A]/80 hover:shadow-[0_0_30px_rgba(78,161,255,0.05)]"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                aria-label="Upload evidence files"
                onKeyDown={handleUploadZoneKeyDown}
                onClick={openFilePicker}
              >
                {dragging && <div className="absolute inset-0 bg-primary/5 animate-pulse pointer-events-none" />}
                <Upload className={cn("size-6 transition-colors", dragging ? "text-primary" : "text-muted-foreground")} />
                <p className={cn("text-sm font-medium transition-colors", dragging ? "text-primary" : "text-white")}>
                  {dragging ? "Drop files now" : "Drag & drop files here"}
                </p>

                <div className="flex items-center gap-2 w-full px-12 z-10">
                  <div className="h-px flex-1 bg-[#28313C]" />
                  <span className="text-[10px] text-muted-foreground uppercase">or</span>
                  <div className="h-px flex-1 bg-[#28313C]" />
                </div>

                <div className="flex items-center justify-center gap-2 flex-wrap px-4">
                  <Button
                    onClick={(event) => {
                      event.stopPropagation();
                      if (!canUploadEvidence) {
                        toast.error("Evidence upload requires upload evidence permission.");
                        return;
                      }
                      openFilePicker();
                    }}
                    disabled={!canUploadEvidence}
                    size="sm"
                    variant="outline"
                    className="h-7 px-2.5 text-[10px] bg-transparent border-[#28313C] text-white hover:bg-[#28313C] disabled:opacity-50"
                  >
                    <FileText className="size-3 mr-1.5" /> Browse Files
                  </Button>
                  <Button onClick={(event) => { event.stopPropagation(); document.getElementById("genius-url-analysis-input")?.focus(); }} size="sm" variant="outline" className="h-7 px-2.5 text-[10px] bg-transparent border-[#28313C] text-white hover:bg-[#28313C]">
                    <Link2 className="size-3 mr-1.5" /> Paste URL
                  </Button>
                  <Button onClick={(event) => { event.stopPropagation(); onNavigate?.("connectors"); }} size="sm" variant="outline" className="h-7 px-2.5 text-[10px] bg-transparent border-[#28313C] text-white hover:bg-[#28313C]">
                    <Database className="size-3 mr-1.5" /> Connect Source
                  </Button>
                </div>
                <p className="px-6 text-center text-[10px] leading-relaxed text-muted-foreground">
                  Max {evidenceUploadPolicy.maxFiles} files, {evidenceFileSizeLabel(evidenceUploadPolicy.maxFileBytes)} each, {evidenceFileSizeLabel(evidenceUploadPolicy.maxBatchBytes)} per batch.
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {evidenceUploadPolicy.supportedLabels.map(ext => (
                  <span key={ext} className="rounded border border-[#28313C] bg-[#141A22] px-2 py-0.5 text-[9px] font-semibold text-muted-foreground">
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
                  id="genius-url-analysis-input"
                  type="text"
                  placeholder="https://example.com/contract/12345"
                  value={urlValue}
                  onChange={(event) => setUrlValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleAnalyzeUrl();
                  }}
                  className="flex-1 rounded border border-[#28313C] bg-[#0E1116] px-3 py-1.5 text-[11px] text-white placeholder-muted-foreground focus:border-primary/50 outline-none transition-colors"
                />
                <Button onClick={handleAnalyzeUrl} disabled={busy || !canUploadEvidence || !urlValue.trim()} size="sm" className="h-[30px] px-3 text-[10px] font-semibold bg-transparent border border-primary text-primary hover:bg-primary/10 disabled:opacity-50">
                  {busy ? "Analyzing..." : "Analyze URL"}
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-[10px] text-muted-foreground">Supported:</span>
                {["Contracts", "Invoices", "SEC Filings", "News", "Web pages", "Other"].map(ext => (
                  <button
                    key={ext}
                    type="button"
                    onClick={() => {
                      document.getElementById("genius-url-analysis-input")?.focus();
                      toast.info(`${ext} URLs can be pasted into URL Analysis.`);
                    }}
                    className="text-[10px] text-white/80 hover:text-white cursor-pointer transition-colors"
                  >
                    {ext}
                  </button>
                ))}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept={evidenceUploadPolicy.accept}
              onChange={handleFileSelect}
            />

            {uploadProgress !== null && (
              <div className="flex flex-col gap-1.5 animate-fade-in">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Uploading files...</span>
                  <span className="font-bold tabular-nums text-white">{uploadProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#28313C] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Center Column (Extraction) */}
          <div id="evidence-review-panel" className="col-span-6 flex flex-col gap-4 scroll-mt-4">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white">2. Extraction Review</span>

            <div className="rounded-xl border border-[#28313C] bg-[#141A22] flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[#28313C] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-8 items-center justify-center rounded bg-critical/10 border border-critical/20 shrink-0">
                    <span className="text-[9px] font-bold text-critical">{selectedEvidence ? evidenceExtension(selectedEvidence) : "NEW"}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-white">{selectedEvidence?.name || "Upload evidence to start extraction review"}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {selectedEvidence ? `${selectedEvidence.kind || "Document"} - ${selectedEvidence.source || "Data Intake"} - Uploaded ${formatDateTime(selectedEvidence.createdAt)}` : "Files stay in review until you confirm extracted fields."}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] font-medium text-white">{confirmedFieldCount} / {Math.max(displayExtractionFields.length, 1)} fields confirmed</span>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => handleLockedAction("Evidence page preview")} className="flex size-6 items-center justify-center rounded hover:bg-[#28313C] text-muted-foreground hover:text-white transition-colors">
                        <ChevronLeft className="size-3.5" />
                      </button>
                      <span className="text-[11px] font-medium text-white tabular-nums">{selectedEvidence ? "1 / 1" : "0 / 0"}</span>
                      <button type="button" onClick={() => handleLockedAction("Evidence page preview")} className="flex size-6 items-center justify-center rounded hover:bg-[#28313C] text-muted-foreground hover:text-white transition-colors">
                        <ChevronRight className="size-3.5" />
                      </button>
                      <button type="button" onClick={() => handleLockedAction("Evidence review options")} className="flex size-6 items-center justify-center rounded hover:bg-[#28313C] text-muted-foreground hover:text-white transition-colors ml-1">
                        <MoreVertical className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="h-1 w-32 rounded-full bg-[#28313C] overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${displayExtractionFields.length ? (confirmedFieldCount / displayExtractionFields.length) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="p-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#28313C]">
                      <th className="pb-3 text-left text-[9px] font-semibold uppercase tracking-widest text-muted-foreground w-[28%]">Field</th>
                      <th className="pb-3 text-left text-[9px] font-semibold uppercase tracking-widest text-muted-foreground w-[32%]">Extracted Value</th>
                      <th className="pb-3 text-left text-[9px] font-semibold uppercase tracking-widest text-muted-foreground w-[15%]">Confidence</th>
                      <th className="pb-3 text-left text-[9px] font-semibold uppercase tracking-widest text-muted-foreground w-[12%]">Source</th>
                      <th className="pb-3 text-center text-[9px] font-semibold uppercase tracking-widest text-muted-foreground w-[8%]">Confirmed</th>
                      <th className="pb-3 text-center text-[9px] font-semibold uppercase tracking-widest text-muted-foreground w-[5%]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayExtractionFields.length ? displayExtractionFields.map((f) => (
                      <tr key={f.key} className="border-b border-[#28313C]/50 last:border-0 hover:bg-white/[0.02] transition-colors">
                        <td className="py-2.5 font-medium text-white pr-2">{f.label}</td>
                        <td className="py-2.5 pr-4">
                          <div className="flex items-center justify-between gap-2 border-b border-[#28313C] pb-0.5">
                            <input
                              id={fieldInputId(f.key)}
                              value={f.value}
                              onChange={(event) => setFieldDrafts((previous) => ({ ...previous, [f.key]: event.target.value }))}
                              className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-muted-foreground"
                              aria-label={`Edit ${f.label}`}
                            />
                            {f.type === "date" ? <Calendar className="size-3 text-muted-foreground shrink-0" /> : f.type === "select" ? <ChevronDown className="size-3 text-muted-foreground shrink-0" /> : null}
                          </div>
                        </td>
                        <td className="py-2.5 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-medium text-white tabular-nums w-6">{f.conf}%</span>
                            <div className="h-1 w-8 rounded-full bg-[#28313C] overflow-hidden">
                              <div className="h-full bg-evidence" style={{ width: `${f.conf}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 text-muted-foreground">{f.source}</td>
                        <td className="py-2.5">
                          <div className="flex justify-center">
                            <button type="button" onClick={() => setFieldChecks((previous) => ({ ...previous, [f.key]: !(previous[f.key] ?? f.checked) }))} className={cn("flex size-3.5 items-center justify-center rounded-sm border", f.checked ? "bg-primary border-primary text-[#0E1116]" : "border-muted-foreground/40 hover:border-muted-foreground")}>
                              {f.checked && <Check className="size-2.5 stroke-[3]" />}
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5">
                          <div className="flex justify-center">
                            <button type="button" onClick={() => document.getElementById(fieldInputId(f.key))?.focus()} className="text-muted-foreground hover:text-white transition-colors" aria-label={`Edit ${f.label}`}>
                              <Edit2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[11px] text-muted-foreground">
                          No evidence is waiting for extraction review. Upload a file or analyze a URL to begin.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-[#28313C] p-4 bg-[#0E1116]/40 rounded-b-xl">
                <button type="button" onClick={() => handleLockedAction("Custom extraction fields")} className="text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5">
                  <span className="text-sm leading-none">+</span> Add custom field
                </button>
                <div className="flex items-center gap-3">
                  <Button onClick={() => { setFieldChecks({}); setFieldDrafts({}); toast.success("Field selections reset"); }} size="sm" variant="outline" className="h-8 px-4 text-[11px] bg-transparent border-[#28313C] text-white hover:bg-[#28313C]">
                    Reset
                  </Button>
                  <Button onClick={handleSaveFieldChanges} disabled={busy || !canReviewEvidence || !selectedEvidence} size="sm" className="h-8 px-4 text-[11px] bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
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
                <button type="button" onClick={() => onNavigate?.("settings")} className="text-[10px] text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
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
                    <Sparkles className="size-3.5 text-[#4EA1FF]" fill="currentColor" />
                  <span className="text-[11px] font-medium text-white">{backend?.aiProvider || "Gemini"}</span>
                </div>
                <span className="text-[11px] text-muted-foreground flex-1 ml-4">AI extraction</span>
                  <span className={cn("text-[11px] font-medium", backend?.geminiConfigured ? "text-evidence" : "text-warning")}>{backend?.geminiConfigured ? "Ready" : "Fallback"}</span>
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
                    <span className="text-[11px] font-medium text-white">{backend?.storage === "supabase" ? "Supabase Storage" : "Local Storage"}</span>
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
                <Button onClick={() => handleConfirmEvidence("Confirmed", reviewTargetRecords)} disabled={busy || !canReviewEvidence || !reviewTargetCount} className="w-full justify-center bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 text-xs font-semibold h-9 disabled:opacity-50">
                  Confirm Selected ({reviewTargetCount})
                </Button>
                <Button
                  onClick={async () => {
                    if (await handleConfirmEvidence("Confirmed", reviewTargetRecords)) {
                      onNavigate?.("approvals", {
                        evidenceId: reviewTargetRecords[0]?.id,
                        evidenceIds: reviewTargetRecords.map((record) => record.id),
                        source: "data",
                      });
                    }
                  }}
                  disabled={busy || !canReviewEvidence || !reviewTargetCount}
                  variant="outline"
                  className="w-full justify-center bg-transparent border-[#28313C] text-white hover:bg-[#28313C] text-xs h-9 disabled:opacity-50"
                >
                  Send to Approvals ({reviewTargetCount})
                </Button>
                <Button
                  onClick={async () => {
                    if (await handleConfirmEvidence("Confirmed", reviewTargetRecords)) {
                      onNavigate?.("reports", {
                        evidenceId: reviewTargetRecords[0]?.id,
                        evidenceIds: reviewTargetRecords.map((record) => record.id),
                        tab: "proof",
                        source: "data",
                      });
                    }
                  }}
                  disabled={busy || !canReviewEvidence || !reviewTargetCount}
                  variant="outline"
                  className="w-full justify-center bg-transparent border-[#28313C] text-white hover:bg-[#28313C] text-xs h-9 disabled:opacity-50"
                >
                  Create Proof Trail ({reviewTargetCount})
                </Button>
                <Button
                  onClick={() => {
                    if (!canExportData) {
                      toast.error("Evidence export requires export data permission.");
                      return;
                    }
                    exportEvidence("csv", "reviewed");
                  }}
                  disabled={!canExportData}
                  variant="outline"
                  className="w-full justify-center bg-transparent border-[#28313C] text-white hover:bg-[#28313C] text-xs h-9 mt-2 disabled:opacity-50"
                >
                  <Download className="size-3.5 mr-2" /> Export Extracted Data
                </Button>
              </div>
            </div>

          </div>

          {/* Bottom Table */}
          <div className="col-span-12 flex flex-col gap-4 mt-2 border-t border-[#28313C] pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white">3. Uploaded Sources</span>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1.5 rounded border border-[#28313C] bg-[#141A22] px-2 py-1 text-[11px] text-white hover:bg-[#28313C] transition-colors">
                        {sourceFilter} <ChevronDown className="size-3 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 border-[#28313C] bg-[#0E1116] text-white">
                      {["All sources", "Contract", "Spreadsheet", "CSV", "URL", "Invoice", "Document"].map((option) => (
                        <DropdownMenuItem key={option} className="text-xs hover:bg-[#28313C] cursor-pointer" onClick={() => { setSourceFilter(option); setCurrentPage(1); }}>
                          {option}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1.5 rounded border border-[#28313C] bg-[#141A22] px-2 py-1 text-[11px] text-white hover:bg-[#28313C] transition-colors">
                        {statusFilter} <ChevronDown className="size-3 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 border-[#28313C] bg-[#0E1116] text-white">
                      {["All status", "Extraction complete", "Processing", "Needs review", "Excluded"].map((option) => (
                        <DropdownMenuItem key={option} className="text-xs hover:bg-[#28313C] cursor-pointer" onClick={() => { setStatusFilter(option); setCurrentPage(1); }}>
                          {option}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <button type="button" onClick={() => handleLockedAction("Evidence date range filtering")} className="flex items-center gap-1.5 rounded border border-[#28313C] bg-[#141A22] px-2 py-1 text-[11px] text-white hover:bg-[#28313C] transition-colors">
                    <Calendar className="size-3 text-muted-foreground" /> May 19, 2026 - May 26, 2026
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">View archived</span>
                  <button type="button" aria-pressed="false" aria-label="View archived evidence" onClick={() => handleLockedAction("Archived evidence browsing")} className="h-3.5 w-6 rounded-full bg-[#28313C] relative cursor-pointer">
                    <div className="absolute left-0.5 top-0.5 size-2.5 rounded-full bg-muted-foreground" />
                  </button>
                </div>
                <div className="w-px h-4 bg-[#28313C]" />
                <button type="button" onClick={() => handleLockedAction("Evidence table column settings")} className="flex items-center gap-1.5 rounded border border-[#28313C] bg-[#141A22] px-2 py-1 text-[11px] text-white hover:bg-[#28313C] transition-colors">
                  <div className="flex flex-col gap-0.5">
                    <div className="h-px w-2.5 bg-current" />
                    <div className="h-px w-2.5 bg-current" />
                    <div className="h-px w-2.5 bg-current" />
                  </div>
                  Columns <ChevronDown className="size-3 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-[#28313C] bg-[#0E1116]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#28313C]">
                    <th className="px-4 py-3 text-left w-10">
                      <button
                        type="button"
                        aria-pressed={allVisibleSelected}
                        aria-label={allVisibleSelected ? "Clear visible evidence selection" : "Select visible evidence"}
                        onClick={toggleVisibleSources}
                        className={cn(
                          "flex size-3.5 items-center justify-center rounded-sm border transition-colors",
                          allVisibleSelected
                            ? "border-primary bg-primary text-[#0E1116]"
                            : someVisibleSelected
                              ? "border-primary/60 bg-primary/20 text-primary"
                              : "border-muted-foreground/40 hover:border-muted-foreground",
                        )}
                      >
                        {(allVisibleSelected || someVisibleSelected) && <Check className="size-2.5 stroke-[3]" />}
                      </button>
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
                  {displaySources.length ? displaySources.map((row) => (
                    <tr
                      key={row.id}
                      className={cn(
                        "border-b border-[#28313C]/50 transition-colors last:border-0 hover:bg-white/[0.02]",
                        selectedEvidence?.id === row.id && "bg-primary/[0.04] outline outline-1 outline-primary/20",
                      )}
                    >
                      <td className="px-4 py-2.5">
                        <button
                          type="button"
                          aria-pressed={selectedSourceIdSet.has(row.id)}
                          aria-label={`${selectedSourceIdSet.has(row.id) ? "Clear" : "Select"} ${row.name}`}
                          onClick={() => toggleSourceSelection(row.id)}
                          className={cn(
                            "flex size-3.5 items-center justify-center rounded-sm border transition-colors",
                            selectedSourceIdSet.has(row.id)
                              ? "border-primary bg-primary text-[#0E1116]"
                              : "border-muted-foreground/40 hover:border-muted-foreground",
                          )}
                        >
                          {selectedSourceIdSet.has(row.id) && <Check className="size-2.5 stroke-[3]" />}
                        </button>
                      </td>
                      <td className="py-2.5 pr-2">
                        <div className="flex items-center gap-2">
                          <div className={cn("flex size-5 items-center justify-center rounded shrink-0",
                            row.extension === "PDF" ? "bg-critical/10 text-critical" :
                            row.extension === "XLSX" || row.extension === "CSV" ? "bg-primary/10 text-primary" :
                            "bg-evidence/10 text-evidence"
                          )}>
                            <span className="text-[7px] font-bold">{row.extension}</span>
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
                          <div className="h-1 flex-1 rounded-full bg-[#28313C] overflow-hidden">
                            <div className="h-full bg-evidence" style={{ width: `${row.confidence}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 text-white tabular-nums">{row.fields}</td>
                      <td className="py-2.5">
                        <button type="button" onClick={() => openEvidenceProof(row.id)} className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline">
                          {row.proof} <ExternalLink className="size-2.5" />
                        </button>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button onClick={() => openEvidenceReview(row.id)} size="sm" variant="outline" className="h-6 px-2 text-[10px] bg-transparent border-[#28313C] text-white hover:bg-[#28313C]">
                            Review
                          </Button>
                          <div className="flex">
                            <Button onClick={() => handleSendSource(row.id)} size="sm" variant="outline" className="h-6 px-2 text-[10px] bg-transparent border-[#28313C] text-evidence hover:bg-[#28313C] border-r-0 rounded-r-none">
                              Send
                            </Button>
                            <Button aria-label={`Send options for ${row.name}`} onClick={() => handleLockedAction("Evidence routing options")} size="sm" variant="outline" className="h-6 px-1 text-[10px] bg-transparent border-[#28313C] text-evidence hover:bg-[#28313C] rounded-l-none">
                              <ChevronDown className="size-3" />
                            </Button>
                          </div>
                          <button type="button" aria-label={`More options for ${row.name}`} onClick={() => handleLockedAction("Evidence source actions")} className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-[#28313C] hover:text-white transition-colors ml-1">
                            <MoreVertical className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={10} className="px-4 py-10 text-center text-[11px] text-muted-foreground">
                        No uploaded sources yet. Use file upload or URL analysis to populate the workspace.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="flex items-center justify-between border-t border-[#28313C] px-4 py-3">
                <span className="text-[11px] text-muted-foreground">
                  Showing {filteredSources.length === 0 ? 0 : startIndex} to {endIndex} of {filteredSources.length} sources
                </span>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium">
                    <button
                      type="button"
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
                          type="button"
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={cn(
                            "flex size-5 items-center justify-center rounded transition-colors",
                            currentPage === pageNum
                              ? "border border-[#28313C] bg-[#28313C] text-white"
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
                          type="button"
                          onClick={() => setCurrentPage(totalPages)}
                          className="flex size-5 items-center justify-center rounded text-muted-foreground hover:text-white transition-colors"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}

                    <button
                      type="button"
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
                      <DropdownMenuContent align="end" className="min-w-[80px] border-[#28313C] bg-[#0E1116] text-white">
                        {[5, 10, 20, 50].map((size) => (
                          <DropdownMenuItem
                            key={size}
                            className="text-xs hover:bg-[#28313C] cursor-pointer"
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
      <div className="flex items-center gap-8 border-t border-[#28313C] bg-[#0E1116] px-6 py-2.5 text-[11px]">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-white">System status</span>
          <StatusDot tone="evidence" />
          <span className="text-muted-foreground">All systems operational</span>
        </div>
        <div className="h-3 w-px bg-[#28313C]" />
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
        <button type="button" onClick={handleRefresh} disabled={busy} className="ml-auto flex items-center gap-2 text-muted-foreground hover:text-white disabled:opacity-50">
          Refresh workspace <RefreshCw className={cn("size-3", busy && "animate-spin")} />
        </button>
      </div>
    </div>
  );
}
