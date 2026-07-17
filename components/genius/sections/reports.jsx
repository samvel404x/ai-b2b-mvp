"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, Calendar, Check, CheckCircle2,
  ChevronDown, Clock, Cloud, Code2, Database, Download, ExternalLink, FileSpreadsheet,
  FileText, GitBranch, Globe, HelpCircle, History, LayoutDashboard, Link as LinkIcon,
  MessageSquare, MoreHorizontal, Pause, PiggyBank, Plus, RefreshCw, RotateCcw, Search,
  Settings, Share2, Shield, ShieldAlert, Sparkles, Target, Upload, User, Zap, Copy
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  reportsKpis, reportsLibrary, reportsDetail, reportsSummaryPanel
} from "@/lib/genius-data";
import { Ring, Sparkline } from "../shared";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "../workspace-context";

const reportIconMap = {
  risk: { Icon: ShieldAlert, color: "text-[#4EA1FF]" },
  savings: { Icon: PiggyBank, color: "text-[#22c55e]" },
  renewal: { Icon: Clock, color: "text-[#f59e0b]" },
  history: { Icon: History, color: "text-[#14b8a6]" },
  summary: { Icon: FileText, color: "text-muted-foreground" },
};

const statusMap = {
  "Board-ready": { color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", Icon: CheckCircle2 },
  "Ready": { color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", Icon: CheckCircle2 },
  "Build": { color: "text-warning", bg: "bg-warning/10", border: "border-warning/20", Icon: Clock },
  "In review": { color: "text-warning", bg: "bg-warning/10", border: "border-warning/20", Icon: Clock },
  "Draft": { color: "text-muted-foreground", bg: "bg-[#141A22]", border: "border-[#28313C]", Icon: FileText },
};

const scheduleStatusMeta = {
  draft: { label: "Draft", className: "border-[#28313C] bg-[#141A22] text-muted-foreground" },
  active: { label: "Active", className: "border-primary/20 bg-primary/10 text-primary" },
  paused: { label: "Paused", className: "border-warning/20 bg-warning/10 text-warning" },
  archived: { label: "Archived", className: "border-critical/20 bg-critical/10 text-critical" },
};

const scheduleStatusActions = {
  draft: [
    { status: "active", label: "Activate", Icon: CheckCircle2 },
    { status: "archived", label: "Archive", Icon: FileText },
  ],
  active: [
    { status: "paused", label: "Pause", Icon: Pause },
    { status: "archived", label: "Archive", Icon: FileText },
  ],
  paused: [
    { status: "active", label: "Resume", Icon: RotateCcw },
    { status: "archived", label: "Archive", Icon: FileText },
  ],
  archived: [
    { status: "draft", label: "Restore", Icon: RotateCcw },
  ],
};

function numberValue(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function parseMoneyValue(value) {
  const parsed = Number.parseFloat(String(value || "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoneyShort(value) {
  const amount = Math.max(0, numberValue(value));
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(amount >= 10_000_000 ? 0 : 1)}M`;
  if (amount >= 1_000) return `$${Math.round(amount / 1_000)}K`;
  return `$${Math.round(amount).toLocaleString("en-US")}`;
}

function formatReportDate(value) {
  if (!value) return "Current workspace";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Current workspace";
  return date.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function statusLabel(status) {
  if (status === "Ready") return "Board-ready";
  if (status === "Build") return "In review";
  return status || "Draft";
}

function allReportItems(report) {
  return (report?.sections || []).flatMap((section) =>
    (section.items || []).map((item) => ({ ...item, sectionTitle: section.title })),
  );
}

function reportSectionItems(report, titles = []) {
  const loweredTitles = titles.map((title) => title.toLowerCase());
  return allReportItems(report).filter((item) => loweredTitles.some((title) => item.sectionTitle?.toLowerCase().includes(title)));
}

function reportMatchesFocus(report, context = {}) {
  if (!report || !context) return false;
  if (context.reportId && report.id === context.reportId) return true;

  return allReportItems(report).some((item) =>
    item.proofTrailId === context.proofTrailId
    || item.actionId === context.actionId
    || item.findingId === context.findingId
    || item.evidenceId === context.evidenceId
  );
}

function tabForFocusContext(context = {}) {
  if (context.proofTrailId) return "Proof Chain";
  if (context.actionId) return "Approvals";
  if (context.findingId) return "Findings";
  if (context.evidenceId) return "Linked Evidence";
  return "Executive Summary";
}

function uniqueCount(items = [], key) {
  return new Set(items.map((item) => item[key]).filter(Boolean)).size;
}

function normalizeReportFinding(item, index) {
  return {
    severity: item.severity === "Critical" ? "High" : item.severity || (index < 2 ? "High" : "Medium"),
    title: item.label || "Workspace finding",
    sub: item.evidence || item.recommendedAction || "Evidence-backed workspace finding",
    value: item.value || formatMoneyShort(item.impact),
    valueSub: item.category || "Potential impact",
    findingId: item.findingId || null,
    actionId: item.actionId || null,
    evidenceId: item.evidenceId || null,
    proofTrailId: item.proofTrailId || null,
  };
}

function normalizeReportApproval(item) {
  return {
    title: item.label || "Approval-safe action",
    owner: item.owner || "Founder approval",
    date: formatReportDate(item.updatedAt || item.createdAt),
    status: item.status || item.value || "Needs review",
    actionId: item.actionId || null,
  };
}

function slugForTaskId(value, fallback = "item") {
  const slug = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || fallback;
}

function priorityFromFinding(finding = {}) {
  const severity = String(finding.severity || "").toLowerCase();
  if (severity.includes("critical")) return "Critical";
  if (severity.includes("high")) return "High";
  if (severity.includes("low")) return "Low";
  return "Medium";
}

function reportBacklogTaskId(reportId, finding = {}) {
  const findingKey = finding.findingId || finding.actionId || finding.evidenceId || finding.title || "finding";
  return `report-backlog-${slugForTaskId(reportId, "report")}-${slugForTaskId(findingKey, "finding")}`.slice(0, 120);
}

function buildRiskExposure(topFindings, metrics = {}) {
  const colors = ["var(--critical)", "var(--warning)", "var(--evidence)", "#28313C"];
  const totals = new Map();

  for (const finding of topFindings) {
    const label = finding.valueSub || "Workspace risk";
    totals.set(label, (totals.get(label) || 0) + parseMoneyValue(finding.value));
  }

  const total = numberValue(metrics.moneyAtRisk) || Array.from(totals.values()).reduce((sum, value) => sum + value, 0);
  const denominator = total || 1;
  const categories = Array.from(totals.entries()).slice(0, 4).map(([label, value], index) => ({
    label,
    value: formatMoneyShort(value),
    pct: Math.max(5, Math.round((value / denominator) * 100)),
    color: colors[index % colors.length],
  }));

  return {
    total: formatMoneyShort(total),
    totalTrend: `${topFindings.length} linked findings`,
    categories: categories.length ? categories : reportsDetail.riskExposure.categories,
  };
}

function buildWorkspaceReportDetail(report, metrics = {}) {
  if (!report) return reportsDetail;

  const allItems = allReportItems(report);
  const topFindings = reportSectionItems(report, ["top findings", "live risks", "evidence chain"])
    .slice(0, 4)
    .map(normalizeReportFinding);
  const approvals = reportSectionItems(report, ["approval", "decision"])
    .slice(0, 4)
    .map(normalizeReportApproval);
  const linkedEvidence = uniqueCount(allItems, "evidenceId");
  const proofTrailCount = uniqueCount(allItems, "proofTrailId") || numberValue(metrics.proofTrailCount);
  const openApprovals = numberValue(report.metrics?.openApprovals, numberValue(metrics.openApprovalCount));
  const approvedActions = numberValue(report.metrics?.approvedActions, numberValue(metrics.approvedActionCount));
  const rejectedActions = numberValue(report.metrics?.rejectedActions, numberValue(metrics.rejectedActionCount));
  const delegatedActions = numberValue(report.metrics?.delegatedActions, numberValue(metrics.delegatedActionCount));
  const diagnosticScore = numberValue(report.metrics?.diagnosticScore, numberValue(metrics.diagnosticsScore));

  return {
    id: report.id,
    title: report.title || "Workspace report",
    badge: statusLabel(report.status),
    autoRefresh: true,
    period: report.period || "Current workspace",
    prepared: formatReportDate(report.updatedAt || report.generatedAt),
    tabs: reportsDetail.tabs,
    tabCounts: {
      Findings: topFindings.length,
      Approvals: openApprovals + approvedActions + rejectedActions + delegatedActions || approvals.length,
      "Proof Chain": proofTrailCount,
      "Linked Evidence": linkedEvidence || numberValue(metrics.evidenceCount),
    },
    summaryStats: [
      { label: "Findings", value: String(numberValue(report.metrics?.findings, numberValue(metrics.findingCount))), trend: `${topFindings.length} in this pack`, trendDir: "up", tone: "critical" },
      { label: "Money at risk", value: formatMoneyShort(report.metrics?.moneyAtRisk ?? metrics.moneyAtRisk), trend: "Workspace-derived", trendDir: "up", tone: "critical" },
      { label: "Open approvals", value: String(openApprovals), trend: `${approvedActions} approved / ${delegatedActions} delegated`, trendDir: openApprovals ? "up" : "down", tone: "warning" },
      { label: "Proof trails", value: String(proofTrailCount), trend: `${linkedEvidence || numberValue(metrics.evidenceCount)} linked evidence`, trendDir: "up", tone: "primary" },
      { label: "Diagnostic score", value: `${diagnosticScore || 0}%`, trend: "Current workspace", trendDir: diagnosticScore >= 70 ? "up" : "down", tone: "evidence", ring: diagnosticScore || 0 },
    ],
    description: (report.summary || []).join(" ") || report.detail || reportsDetail.description,
    topFindings: topFindings.length ? topFindings : reportsDetail.topFindings,
    riskExposure: buildRiskExposure(topFindings, report.metrics || metrics),
    recentApprovals: approvals.length ? approvals : reportsDetail.recentApprovals,
  };
}

function buildWorkspaceReportSummary(report, metrics = {}) {
  if (!report) return reportsSummaryPanel;

  const allItems = allReportItems(report);
  const topFindings = reportSectionItems(report, ["top findings", "live risks", "evidence chain"]).slice(0, 3).map(normalizeReportFinding);
  const proofTrailCount = uniqueCount(allItems, "proofTrailId") || numberValue(metrics.proofTrailCount);
  const linkedEvidence = uniqueCount(allItems, "evidenceId") || numberValue(metrics.evidenceCount);
  const findingCount = numberValue(report.metrics?.findings, numberValue(metrics.findingCount));
  const openApprovals = numberValue(report.metrics?.openApprovals, numberValue(metrics.openApprovalCount));
  const approvedActions = numberValue(report.metrics?.approvedActions, numberValue(metrics.approvedActionCount));
  const rejectedActions = numberValue(report.metrics?.rejectedActions, numberValue(metrics.rejectedActionCount));
  const delegatedActions = numberValue(report.metrics?.delegatedActions, numberValue(metrics.delegatedActionCount));
  const proofCoverage = findingCount ? Math.min(100, Math.round((proofTrailCount / findingCount) * 100)) : proofTrailCount ? 100 : 0;

  return {
    proofCoverage,
    proofCoverageItems: [
      { label: "Linked evidence", value: linkedEvidence },
      { label: "Proof trail items", value: proofTrailCount },
      { label: "Open approvals", value: openApprovals },
      { label: "Approved actions", value: approvedActions },
    ],
    boardStatus: {
      readiness: statusLabel(report.status),
      qualityScore: `${numberValue(metrics.diagnosticsScore || metrics.dataQualityScore)}%`,
      lastReviewed: formatReportDate(report.updatedAt || report.generatedAt),
      nextReview: "Manual review required",
    },
    includedApprovals: [
      { label: "Approved", value: approvedActions, tone: "primary" },
      { label: "In review", value: openApprovals, tone: "evidence" },
      { label: "Rejected", value: rejectedActions, tone: "critical" },
      { label: "Delegated", value: delegatedActions, tone: "evidence" },
      { label: "Not required", value: Math.max(0, linkedEvidence - openApprovals - approvedActions - rejectedActions - delegatedActions), tone: "warning" },
    ],
    keyRisks: topFindings.length
      ? topFindings.map((finding) => ({ label: finding.title, value: finding.value, tone: finding.severity === "High" ? "critical" : "warning" }))
      : reportsSummaryPanel.keyRisks,
    reportDetails: {
      id: report.id,
      preparedBy: "GENIUS workspace engine",
      dataAsOf: formatReportDate(report.updatedAt || report.generatedAt),
      period: report.period || "Current workspace",
      entities: `${numberValue(metrics.vendorCount)} vendors / ${numberValue(metrics.evidenceCount)} evidence records`,
    },
  };
}

function buildWorkspaceReportKpis(reports = [], metrics = {}) {
  if (!reports.length) return reportsKpis;

  const readyReports = reports.filter((report) => ["Ready", "Board-ready"].includes(report.status)).length;
  const proofCoverage = numberValue(metrics.findingCount)
    ? Math.min(100, Math.round((numberValue(metrics.proofTrailCount) / numberValue(metrics.findingCount)) * 100))
    : 0;

  return [
    { id: "readiness", label: "Report Readiness", value: `${proofCoverage || (readyReports ? 85 : 35)}%`, trend: `${readyReports} board-ready`, trendDir: "up", tone: "primary", ring: proofCoverage || (readyReports ? 85 : 35), spark: [20, 35, 45, 55, 65, 75, proofCoverage || 85] },
    { id: "generated", label: "Reports Generated", value: String(reports.length), trend: "Workspace engine", trendDir: "up", tone: "evidence", ring: Math.min(100, reports.length * 20), spark: [0, 1, 2, 3, reports.length] },
    { id: "boardready", label: "Board-Ready Packs", value: String(readyReports), trend: `${reports.length - readyReports} in build`, trendDir: "up", tone: "primary", ring: reports.length ? Math.round((readyReports / reports.length) * 100) : 0, spark: [0, 1, readyReports] },
    { id: "history", label: "Action History Items", value: String(numberValue(metrics.approvedActionCount) + numberValue(metrics.openApprovalCount)), trend: "Approval queue", trendDir: "up", tone: "warning", ring: Math.min(100, (numberValue(metrics.approvedActionCount) + numberValue(metrics.openApprovalCount)) * 12), spark: [0, 1, 2, numberValue(metrics.openApprovalCount)] },
    { id: "coverage", label: "Proof Coverage", value: `${proofCoverage}%`, trend: `${numberValue(metrics.proofTrailCount)} proof trails`, trendDir: "up", tone: "primary", ring: proofCoverage, spark: [0, 20, 40, 60, proofCoverage] },
    { id: "approvals", label: "Approvals Included", value: String(numberValue(metrics.approvedActionCount)), trend: `${numberValue(metrics.openApprovalCount)} open`, trendDir: "flat", tone: "evidence", ring: Math.min(100, numberValue(metrics.approvedActionCount) * 20), spark: [0, 1, numberValue(metrics.approvedActionCount)] },
    { id: "published", label: "Last Published", value: readyReports ? "Available" : "Draft", trend: readyReports ? "Publish workflow ready" : "Create schedule", trendDir: "flat", tone: "primary", ring: 100, spark: null },
  ];
}

function reportIcon(type) {
  if (/risk/i.test(type)) return "risk";
  if (/saving|leak/i.test(type)) return "savings";
  if (/renewal/i.test(type)) return "renewal";
  if (/audit|history/i.test(type)) return "history";
  return "summary";
}

function mapWorkspaceReport(report) {
  return {
    id: report.id,
    name: report.title || "Workspace report",
    icon: reportIcon(report.type || report.title || ""),
    status: report.status || "Draft",
    period: report.period || "Current workspace",
    owner: report.owner || "GENIUS",
    pages: report.sections?.length || report.summary?.length || 1,
    updated: report.updatedAt ? new Date(report.updatedAt).toLocaleDateString() : "Current",
    formats: Array.isArray(report.formats) && report.formats.length ? report.formats : ["json", "csv", "md"],
  };
}

function KpiCard({ kpi, index, onSelect }) {
  const trendUp = kpi.trendDir === "up";
  const trendDown = kpi.trendDir === "down";

  return (
    <button
      type="button"
      onClick={() => onSelect?.(kpi)}
      className="group relative flex min-w-0 w-full animate-fade-up flex-col gap-2 overflow-hidden rounded-xl border border-[#28313C] bg-[#0E1116] p-3 text-left transition-all hover:border-white/10 hover:bg-[#141A22] hover:shadow-[0_0_15px_rgba(255,255,255,0.03)]"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-center gap-2">
        <div className="transition-transform duration-500 group-hover:scale-110">
           <Ring value={kpi.ring} size={36} stroke={`var(--${kpi.tone})`} />
        </div>
        <div className="flex flex-col gap-0 min-w-0">
          <span className="truncate text-[9px] font-semibold uppercase tracking-widest text-muted-foreground leading-snug">
            {kpi.label}
          </span>
          <span className="text-lg font-bold tabular-nums leading-tight text-white">
            {kpi.value}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-1 mt-1">
        <span
          className={cn(
            "flex items-center gap-0.5 text-[9px] font-semibold tabular-nums",
            trendUp ? "text-primary" : trendDown ? "text-critical" : "text-muted-foreground"
          )}
        >
          {trendUp && <ArrowUpRight className="size-3" />}
          {trendDown && <ArrowDownRight className="size-3" />}
          {kpi.trend}
        </span>
      </div>
      {kpi.spark && (
        <div className="absolute bottom-0 left-0 right-0 h-8 opacity-20 group-hover:opacity-40 transition-opacity">
          <Sparkline data={kpi.spark} color={`var(--${kpi.tone})`} />
        </div>
      )}
    </button>
  );
}

export default function Reports({ onNavigate, focusContext }) {
  const {
    reports,
    metrics,
    busy,
    reportSchedules,
    loadWorkspace,
    exportReport,
    exportEvidence,
    createReportSchedule,
    updateReportScheduleStatus,
    createCrmTask,
    can,
  } = useWorkspace();
  const reportLibrary = useMemo(() => reports.length ? reports.map(mapWorkspaceReport) : reportsLibrary, [reports]);
  const reportKpiCards = useMemo(() => (reports.length ? buildWorkspaceReportKpis(reports, metrics) : reportsKpis), [metrics, reports]);
  const [activeTab, setActiveTab] = useState("Executive Summary");
  const [activeReportId, setActiveReportId] = useState("RL-1");
  const [search, setSearch] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false);
  const [isSchedulingReport, setIsSchedulingReport] = useState(false);
  const [isDuplicatingReport, setIsDuplicatingReport] = useState(false);
  const [updatingScheduleStatus, setUpdatingScheduleStatus] = useState(null);
  const [backlogFindingKey, setBacklogFindingKey] = useState(null);
  const [scheduleDraft, setScheduleDraft] = useState({
    cadence: "Weekly",
    format: "markdown",
    recipients: "board@acmecorp.io",
    note: "Send the board-ready proof pack after human review.",
  });
  const activeReport = reportLibrary.find((report) => report.id === activeReportId) || reportLibrary[0];
  const activeWorkspaceReport = useMemo(
    () => (reports || []).find((report) => report.id === activeReport?.id) || (reports || [])[0] || null,
    [activeReport?.id, reports],
  );
  const reportDetailView = useMemo(
    () => buildWorkspaceReportDetail(activeWorkspaceReport, metrics),
    [activeWorkspaceReport, metrics],
  );
  const reportSummaryView = useMemo(
    () => buildWorkspaceReportSummary(activeWorkspaceReport, metrics),
    [activeWorkspaceReport, metrics],
  );
  const filteredReportLibrary = useMemo(
    () => reportLibrary.filter((report) => !search || report.name.toLowerCase().includes(search.toLowerCase())),
    [reportLibrary, search],
  );
  const activeTabDetailItems = useMemo(() => {
    if (activeTab === "Metrics") {
      return reportDetailView.summaryStats.map((stat) => ({
        label: stat.label,
        value: stat.value,
        evidence: stat.trend,
      }));
    }

    if (!activeWorkspaceReport) return [];
    if (activeTab === "Proof Chain") return reportSectionItems(activeWorkspaceReport, ["proof", "evidence chain"]);
    if (activeTab === "Linked Evidence") return allReportItems(activeWorkspaceReport).filter((item) => item.evidenceId);

    return [];
  }, [activeTab, activeWorkspaceReport, reportDetailView.summaryStats]);
  const canExportData = can("export_data");
  const canCreateTeamTasks = can("submit_team_report");
  const latestSchedule = (reportSchedules || []).find((schedule) => schedule.reportId === activeReport?.id)
    || (reportSchedules || [])[0]
    || null;
  const latestScheduleMeta = scheduleStatusMeta[latestSchedule?.status] || scheduleStatusMeta.draft;
  const latestScheduleActions = scheduleStatusActions[latestSchedule?.status] || [];
  const latestScheduleNextRun = latestSchedule?.nextRunAt
    ? new Date(latestSchedule.nextRunAt).toLocaleString()
    : "Not scheduled";

  useEffect(() => {
    if (!focusContext?.reportId && !focusContext?.proofTrailId && !focusContext?.actionId && !focusContext?.findingId && !focusContext?.evidenceId) return undefined;

    const timer = window.setTimeout(() => {
      const matchedReport = (reports || []).find((report) => reportMatchesFocus(report, focusContext)) || (reports || [])[0] || null;
      if (!matchedReport) {
        toast.info("Linked proof chain is not available in reports yet.");
        return;
      }

      setActiveReportId(matchedReport.id);
      setActiveTab(tabForFocusContext(focusContext));
      toast.success(`Focused report: ${matchedReport.title || matchedReport.id}`);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [focusContext, reports]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleReportClick = (id) => {
    setActiveReportId(id);
  };

  const handleRefreshReports = async () => {
    try {
      await loadWorkspace({ silent: true });
      toast.success("Reports refreshed from current workspace");
    } catch (error) {
      toast.error(error.message || "Report refresh failed");
    }
  };

  const handleExportReport = (format) => {
    if (!canExportData) {
      toast.error("Report export requires export data permission.");
      return;
    }

    try {
      exportReport(activeReport?.id || activeReportId, format);
    } catch (error) {
      toast.error(error.message || "Report export failed");
    }
  };

  const handleExportFindings = () => {
    if (!canExportData) {
      toast.error("Evidence export requires export data permission.");
      return;
    }

    exportEvidence("csv", "confirmed");
    toast.success("Confirmed evidence export started");
  };

  const handlePublishReport = async () => {
    if (!canExportData) {
      toast.error("Publishing requires export data permission.");
      return;
    }

    setIsPublishing(true);
    try {
      const schedule = await createReportSchedule({
        reportId: activeReport?.id || activeReportId,
        reportName: activeReport?.name || reportDetailView.title,
        cadence: "One-time",
        format: "markdown",
        recipients: scheduleDraft.recipients,
        note: `Board pack published from Reports workspace. ${scheduleDraft.note || ""}`.trim(),
      });
      await updateReportScheduleStatus({
        id: schedule.id,
        status: "active",
        note: "Published as an active board-ready report pack.",
      });
      setIsScheduleFormOpen(false);
      toast.success("Board-ready report pack published.");
    } catch (error) {
      toast.error(error.message || "Report publishing failed");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDuplicateReport = async () => {
    if (!canExportData) {
      toast.error("Report duplication requires export data permission.");
      return;
    }

    const reportId = activeReport?.id || activeReportId;
    const reportName = activeReport?.name || reportDetailView.title || "Board report";
    setIsDuplicatingReport(true);
    try {
      const duplicatedSchedule = await createReportSchedule({
        reportId,
        reportName: `${reportName} copy`.slice(0, 160),
        cadence: "One-time",
        format: "markdown",
        recipients: scheduleDraft.recipients,
        note: `Duplicated from ${reportName} for board review. ${scheduleDraft.note || ""}`.trim(),
      });
      setIsScheduleFormOpen(false);
      toast.success(`${duplicatedSchedule.id} saved as duplicate report draft.`);
    } catch (error) {
      toast.error(error.message || "Report duplication failed.");
    } finally {
      setIsDuplicatingReport(false);
    }
  };

  const handleCreateReportBuilder = async () => {
    try {
      const workspace = await loadWorkspace({ silent: true });
      const generatedReport = (workspace.reports || [])[0] || null;
      if (generatedReport?.id) setActiveReportId(generatedReport.id);
      setSearch("");
      setActiveTab("Executive Summary");
      setIsScheduleFormOpen(true);
      toast.success("Report builder prepared from current workspace data.");
    } catch (error) {
      toast.error(error.message || "Report builder could not load workspace data");
    }
  };

  const updateScheduleDraft = (field, value) => {
    setScheduleDraft((current) => ({ ...current, [field]: value }));
  };

  const handleCreateSchedule = async (event) => {
    event.preventDefault();

    if (!canExportData) {
      toast.error("Report schedule draft requires export data permission.");
      return;
    }

    setIsSchedulingReport(true);
    try {
      const schedule = await createReportSchedule({
        reportId: activeReport?.id || activeReportId,
        reportName: activeReport?.name || reportDetailView.title,
        cadence: scheduleDraft.cadence,
        format: scheduleDraft.format,
        recipients: scheduleDraft.recipients,
        note: scheduleDraft.note,
      });
      toast.success(`${schedule.id} saved as draft schedule.`);
      setIsScheduleFormOpen(false);
    } catch (error) {
      toast.error(error.message || "Report schedule draft failed");
    } finally {
      setIsSchedulingReport(false);
    }
  };

  const handleUpdateScheduleStatus = async (schedule, status) => {
    if (!canExportData) {
      toast.error("Report schedule lifecycle requires export data permission.");
      return;
    }

    const actionKey = `${schedule.id}:${status}`;
    setUpdatingScheduleStatus(actionKey);
    try {
      const updatedSchedule = await updateReportScheduleStatus({
        id: schedule.id,
        status,
        note: `Moved from ${schedule.status} to ${status} from Reports workspace.`,
      });
      toast.success(`${updatedSchedule.reportName} schedule is now ${updatedSchedule.status}.`);
    } catch (error) {
      toast.error(error.message || "Report schedule status update failed");
    } finally {
      setUpdatingScheduleStatus(null);
    }
  };

  const handleCopyShareLink = () => {
    const link = typeof window === "undefined" ? "GENIUS reports" : window.location.href;
    copyToClipboard(link, "Report link");
  };

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(`${label} copied to clipboard`);
    } catch {
      toast.error(`${label} could not be copied.`);
    }
  };

  const activeReportContext = (source) => ({
    reportId: activeWorkspaceReport?.id || activeReport?.id,
    source,
  });

  const handleKpiClick = (kpi) => {
    const id = String(kpi?.id || "").toLowerCase();
    const label = String(kpi?.label || "").toLowerCase();

    if (id.includes("published") || label.includes("published")) {
      setIsScheduleFormOpen(true);
      toast.info("Publishing workflow is available in Report actions.");
      return;
    }

    if (id.includes("approval") || id.includes("history") || label.includes("approval") || label.includes("action history")) {
      onNavigate?.("approvals", activeReportContext("reports-kpi"));
      return;
    }

    if (id.includes("coverage") || label.includes("proof")) {
      setActiveTab("Proof Chain");
      return;
    }

    setActiveTab("Executive Summary");
  };

  const handleOpenFinding = (finding) => {
    if (finding?.findingId || finding?.actionId || finding?.evidenceId) {
      onNavigate?.("savings", {
        ...activeReportContext("reports-finding"),
        findingId: finding.findingId,
        actionId: finding.actionId,
        evidenceId: finding.evidenceId,
        proofTrailId: finding.proofTrailId,
      });
      return;
    }

    setActiveTab("Findings");
  };

  const handleOpenApproval = (approval) => {
    onNavigate?.("approvals", {
      ...activeReportContext("reports-approval-card"),
      actionId: approval?.actionId,
    });
  };

  const handleOpenRiskCategory = (category) => {
    onNavigate?.("diagnostics", {
      ...activeReportContext("reports-risk-category"),
      riskCategory: category?.label,
    });
  };

  const handleAddFindingToBacklog = async (finding) => {
    if (!canCreateTeamTasks) {
      toast.error("Backlog creation requires Team CRM task permission.");
      return;
    }

    const reportId = activeWorkspaceReport?.id || activeReport?.id || "report";
    const taskId = reportBacklogTaskId(reportId, finding);
    const priority = priorityFromFinding(finding);
    const title = `Backlog: ${finding?.title || "Workspace finding"}`.slice(0, 150);

    setBacklogFindingKey(taskId);
    try {
      const task = await createCrmTask({
        id: taskId,
        reportId,
        title,
        team: finding?.valueSub || "Operations",
        assignee: "Operations Team",
        status: "backlog",
        priority,
        priorityColor: priority === "Critical" || priority === "High" ? "critical" : priority === "Medium" ? "warning" : "muted",
        date: "Today",
        checklist: "0/5",
        attachments: finding?.evidenceId ? 1 : 0,
        comments: 1,
        tag: "Report",
        progress: 0,
      });
      const savedTaskId = task?.id || taskId;
      toast.success(`${savedTaskId} added to Team CRM backlog.`);
      onNavigate?.("team-crm", {
        source: "reports-backlog",
        taskId: savedTaskId,
        reportId,
        findingId: finding?.findingId || null,
        actionId: finding?.actionId || null,
        evidenceId: finding?.evidenceId || null,
        proofTrailId: finding?.proofTrailId || null,
      });
    } catch (error) {
      toast.error(error.message || "Backlog task could not be created.");
    } finally {
      setBacklogFindingKey(null);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#080A0E]">

      {/* Scrollable Main Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 pb-2 flex flex-col gap-6">

        {/* Header */}
        <header className="flex shrink-0 flex-col gap-4 animate-fade-in min-[1500px]:flex-row min-[1500px]:items-start min-[1500px]:justify-between">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-2xl font-semibold text-white">
              <span className="text-muted-foreground">Reports /</span> Board Reports
            </h1>
            <p className="text-[11px] text-muted-foreground">Board-ready reporting built from evidence, approvals, and proof trails.</p>
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-2 min-[1500px]:justify-end">
            <button type="button" className="hidden items-center gap-2 rounded-full border border-[#28313C] bg-[#0E1116] px-3 py-1.5 text-left transition-all hover:bg-[#141A22] min-[1500px]:flex" onClick={() => onNavigate?.("settings")}>
               <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center"><Zap className="size-2.5 text-primary" /></div>
               <div className="flex flex-col gap-0 leading-none">
                 <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">AI Provider</span>
                 <span className="text-[10px] font-semibold text-white">Gemini 1.5 Pro</span>
               </div>
            </button>
            <button type="button" className="hidden items-center gap-2 rounded-full border border-[#28313C] bg-[#0E1116] px-3 py-1.5 text-left transition-all hover:bg-[#141A22] min-[1500px]:flex" onClick={() => onNavigate?.("settings")}>
               <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center"><Database className="size-2.5 text-primary" /></div>
               <div className="flex flex-col gap-0 leading-none">
                 <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Database</span>
                 <span className="text-[10px] font-semibold text-white">Supabase</span>
               </div>
            </button>
            <button type="button" className="hidden items-center gap-2 rounded-full border border-[#28313C] bg-[#0E1116] px-3 py-1.5 text-left transition-all hover:bg-[#141A22] min-[1500px]:flex" onClick={() => onNavigate?.("connectors")}>
               <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center"><Cloud className="size-2.5 text-primary" /></div>
               <div className="flex flex-col gap-0 leading-none">
                 <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Connectors</span>
                 <span className="text-[10px] font-semibold text-white">18 / 20</span>
               </div>
            </button>
            <button type="button" className="hidden items-center gap-2 rounded-full border border-[#28313C] bg-[#0E1116] px-3 py-1.5 text-left transition-all hover:bg-[#141A22] min-[1500px]:flex" onClick={() => onNavigate?.("diagnostics")}>
               <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center"><CheckCircle2 className="size-2.5 text-primary" /></div>
               <div className="flex flex-col gap-0 leading-none">
                 <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Data quality</span>
                 <span className="text-[10px] font-semibold text-primary flex items-center gap-1">{metrics?.dataQualityScore ? `Good (${metrics.dataQualityScore}%)` : "Waiting for evidence"}</span>
               </div>
            </button>
            <button type="button" className="group hidden items-center gap-2 rounded-full border border-[#28313C] bg-[#0E1116] px-3 py-1.5 text-left transition-all hover:bg-[#141A22] min-[1500px]:flex" onClick={handleRefreshReports}>
               <div className="size-4 rounded-full bg-[#28313C] flex items-center justify-center group-hover:bg-primary/20 transition-colors"><RefreshCw className="size-2.5 text-muted-foreground group-hover:text-primary transition-colors" /></div>
               <div className="flex flex-col gap-0 leading-none">
                 <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Last sync</span>
                 <span className="text-[10px] font-semibold text-white">2m ago</span>
               </div>
            </button>

            <div className="hidden h-8 w-px bg-[#28313C] mx-2 min-[1500px]:block" />

            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleRefreshReports} className="h-8 text-[11px] border-[#28313C] bg-[#141A22] hover:bg-white/[0.05] text-white hover:text-white transition-colors">
                <RefreshCw className="size-3.5 mr-1.5" /> Refresh
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isPublishing || !canExportData}
                onClick={handlePublishReport}
                className="h-8 text-[11px] bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(33,163,102,0.3)] hover:shadow-[0_0_20px_rgba(33,163,102,0.5)] transition-all disabled:opacity-50"
              >
                {isPublishing ? (
                  <><div className="size-3 mr-1.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Publishing...</>
                ) : (
                  <><ExternalLink className="size-3.5 mr-1.5" /> Publish pack</>
                )}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleCopyShareLink} className="h-8 text-[11px] border-[#28313C] bg-[#141A22] hover:bg-white/[0.05] text-white hover:text-white transition-colors">
                <LinkIcon className="size-3.5 mr-1.5" /> Share link
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onNavigate?.("approvals", {
                  reportId: activeWorkspaceReport?.id || activeReport?.id,
                  source: "reports",
                })}
                className="h-8 text-[11px] border-[#28313C] bg-[#141A22] hover:bg-white/[0.05] text-white hover:text-white transition-colors"
              >
                View approval coverage
              </Button>
            </div>

            <div className="hidden items-center gap-3 ml-2 min-[1500px]:flex">
              <button type="button" className="size-8 rounded-lg bg-[#141A22] border border-[#28313C] flex items-center justify-center relative shadow-[0_0_10px_rgba(255,255,255,0.05)]" onClick={() => setIsScheduleFormOpen(true)}>
                <Calendar className="size-4 text-muted-foreground" />
              </button>
              <button type="button" className="flex flex-col gap-0 text-left" onClick={() => setIsScheduleFormOpen(true)}>
                <span className="text-[10px] text-muted-foreground font-semibold">Last Published</span>
                <span className="text-xs font-bold text-white">May 24, 2026</span>
                <span className="text-[9px] text-muted-foreground">10:17 AM</span>
              </button>
            </div>
          </div>
        </header>

        {/* KPI Strip */}
        <div className="grid min-w-0 shrink-0 grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-4">
          {reportKpiCards.map((kpi, i) => (
            <KpiCard key={kpi.id} kpi={kpi} index={i} onSelect={handleKpiClick} />
          ))}
        </div>

        {/* Main 3-Column Layout */}
        <div className="flex gap-6 min-h-[700px] animate-fade-in-up" style={{ animationDelay: '100ms' }}>

          {/* LEFT SIDEBAR: Report Library */}
          <div className="w-[280px] flex flex-col gap-4 shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-bold text-white uppercase tracking-widest">Report Library <span className="text-muted-foreground font-normal ml-1">({reportLibrary.length})</span></h2>
            </div>

            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search reports..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0E1116] border border-[#28313C] rounded-lg pl-9 pr-8 py-2 text-[11px] text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-[#141A22] hover:text-white"
                aria-label="Clear report search"
              >
                <Settings className="size-3.5" />
              </button>
            </div>

            <div className="flex flex-col flex-1 overflow-y-auto scrollbar-thin pr-2 gap-2">
              {filteredReportLibrary.map(report => {
                const isActive = report.id === activeReport?.id;
                const iconCfg = reportIconMap[report.icon] || { Icon: FileText, color: "text-white" };
                const st = statusMap[report.status] || statusMap["Draft"];

                return (
                  <button
                    type="button"
                    key={report.id}
                    onClick={() => handleReportClick(report.id)}
                    className={cn(
                      "group flex flex-col gap-2 p-3 rounded-xl text-left transition-all border",
                      isActive
                        ? "bg-[#141A22] border-[#7CC7FF]/30 shadow-[0_0_15px_rgba(78,161,255,0.05)]"
                        : "bg-[#0E1116] border-transparent hover:bg-white/[0.03] hover:border-[#28313C]"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          "size-6 rounded flex items-center justify-center border transition-colors",
                          isActive ? "bg-[#7CC7FF]/10 border-[#7CC7FF]/30" : "bg-[#141A22] border-[#28313C] group-hover:border-white/20"
                        )}>
                          <iconCfg.Icon className={cn("size-3.5", isActive ? "text-[#7CC7FF]" : iconCfg.color)} />
                        </div>
                        <span className={cn("text-[11px] font-bold transition-colors", isActive ? "text-white" : "text-white/80 group-hover:text-white")}>{report.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[9px] font-medium pl-8.5">
                      <span className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded border", st.bg, st.border, st.color)}>
                        <st.Icon className="size-2.5" /> {report.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pl-8.5 mt-1">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-muted-foreground font-mono">{report.period}</span>
                        <span className="text-[9px] text-muted-foreground/60">Updated {report.updated}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {report.formats.map(f => (
                          <span key={f} className="text-[8px] font-bold text-primary px-1 rounded border border-primary/20 bg-primary/10 tracking-widest uppercase">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#28313C] mt-auto">
              <span className="text-[10px] text-muted-foreground font-medium">Show {filteredReportLibrary.length} of {reportLibrary.length} reports</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCreateReportBuilder}
                className="h-7 text-[10px] border-[#28313C] bg-[#141A22] hover:bg-white/[0.05] text-white transition-all"
              >
                <Plus className="size-3 mr-1" /> New report
              </Button>
            </div>
          </div>

          {/* CENTER PANEL: Report Details */}
          <div className="flex-1 flex flex-col rounded-xl border border-[#28313C] bg-[#0E1116] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-[#28313C] bg-[#0E1116]">
               <div className="flex flex-col gap-1.5">
                 <div className="flex items-center gap-3">
                   <h2 className="text-xl font-bold text-white">{reportDetailView.title}</h2>
                   <span className="flex items-center gap-1 text-[10px] text-primary font-bold uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded border border-primary/20 shadow-[0_0_10px_rgba(33,163,102,0.1)]">
                     {reportDetailView.badge}
                   </span>
                 </div>
                 <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                   <span>{reportDetailView.period}</span>
                   <span className="size-1 rounded-full bg-[#28313C]" />
                   <span>Prepared {reportDetailView.prepared}</span>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <button type="button" className="group flex items-center gap-2" onClick={handleRefreshReports}>
                   <div className="size-2 rounded-full bg-primary animate-pulse shadow-[0_0_5px_rgba(33,163,102,0.8)]" />
                   <span className="text-[10px] font-medium text-white group-hover:text-primary transition-colors">Auto-refresh</span>
                 </button>
                 <Button
                   type="button"
                   variant="outline"
                   size="icon"
                   onClick={() => handleLockedReportAction("Report options menu")}
                   className="h-7 w-7 border-[#28313C] bg-[#141A22] hover:bg-white/[0.05] hover:text-white transition-all text-white"
                 >
                   <MoreHorizontal className="size-3.5" />
                 </Button>
               </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-[#28313C] px-4 bg-[#0E1116]">
               <div className="flex items-center gap-6">
                 {reportDetailView.tabs.map(tab => {
                   const count = reportDetailView.tabCounts[tab];
                   return (
                     <button
                       type="button"
                       key={tab}
                       onClick={() => handleTabClick(tab)}
                       className={cn(
                         "px-2 py-3 text-[11px] font-semibold border-b-2 transition-all relative overflow-hidden flex items-center gap-1.5",
                         activeTab === tab
                           ? "border-[#7CC7FF] text-[#7CC7FF]"
                           : "border-transparent text-muted-foreground hover:text-white hover:border-white/20"
                       )}
                     >
                       {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#7CC7FF] shadow-[0_0_8px_rgba(78,161,255,1)]" />}
                       {tab}
                       {count !== undefined && (
                         <span className={cn("px-1.5 rounded-full text-[9px] border transition-colors", activeTab === tab ? "bg-[#7CC7FF]/10 border-[#7CC7FF]/30" : "bg-[#141A22] border-[#28313C]")}>{count}</span>
                       )}
                     </button>
                   );
                 })}
               </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 flex flex-col overflow-y-auto scrollbar-thin p-6 bg-[#080A0E]">

              {/* Combine sections to fill empty space when on Summary or Findings tabs */}
              {["Executive Summary", "Findings", "Approvals"].includes(activeTab) ? (
                <div className="flex flex-col gap-10 animate-fade-in">

                  {/* Executive Summary Section */}
                  <div id="executive-summary" className="flex flex-col gap-8">
                    {/* Summary Description */}
                    <div className="flex flex-col gap-2">
                      <h3 className="text-[12px] font-bold text-white uppercase tracking-widest">Executive summary</h3>
                      <p className="text-[11px] text-muted-foreground leading-relaxed max-w-3xl">
                        {reportDetailView.description}
                      </p>
                    </div>

                    {/* Stat Strip */}
                    <div className="flex items-center justify-between border-y border-[#28313C] py-4 bg-[#0E1116] -mx-6 px-6 relative overflow-hidden">
                       <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#28313C] to-transparent" />
                       {reportDetailView.summaryStats.map((stat, idx) => (
                         <div key={idx} className="flex flex-col gap-1 flex-1 relative px-2 first:pl-0 last:pr-0">
                           {idx !== reportDetailView.summaryStats.length - 1 && (
                             <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-8 bg-[#28313C]" />
                           )}
                           <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</span>
                           <span className="text-lg font-bold text-white tabular-nums flex items-center gap-2">
                             {stat.value}
                             {stat.ring && (
                               <div className="scale-75 origin-left -my-2 opacity-80"><Ring value={stat.ring} size={24} stroke="var(--evidence)" /></div>
                             )}
                           </span>
                           <span className={cn("text-[9px] font-semibold flex items-center gap-0.5", stat.trendDir === "up" ? `text-${stat.tone}` : `text-${stat.tone}`)}>
                             {stat.trendDir === "up" ? <ArrowUpRight className="size-2.5" /> : <ArrowDownRight className="size-2.5" />}
                             {stat.trend}
                           </span>
                         </div>
                       ))}
                    </div>

                    {/* 2-Column Split: Top Findings & Risk Exposure */}
                    <div className="grid grid-cols-2 gap-8">

                      {/* Top Findings */}
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-[#28313C] pb-2">
                          <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">Top findings</h3>
                          <button type="button" className="text-[10px] text-[#4EA1FF] hover:text-[#7CC7FF] font-medium flex items-center gap-1 group transition-colors" onClick={() => handleTabClick("Findings")}>
                            View all findings <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </div>

                        <div className="flex flex-col gap-3">
                          {reportDetailView.topFindings.map((finding, idx) => {
                            const sevMap = {
                              High: "bg-critical/10 text-critical border-critical/20",
                              Medium: "bg-warning/10 text-warning border-warning/20",
                              Low: "bg-[#4EA1FF]/10 text-[#4EA1FF] border-[#4EA1FF]/20"
                            };
                            return (
                              <button key={idx} type="button" className="group flex flex-col gap-2 rounded-xl border border-[#28313C] bg-[#0E1116] p-3 text-left transition-colors hover:bg-[#141A22]" onClick={() => handleOpenFinding(finding)}>
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-3 flex-1">
                                    <span className={cn("text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border w-12 text-center shrink-0", sevMap[finding.severity])}>{finding.severity}</span>
                                    <div className="flex flex-col gap-0.5">
                                      <span className="text-[11px] font-bold text-white group-hover:text-primary transition-colors">{finding.title}</span>
                                      <span className="text-[10px] text-muted-foreground max-w-[200px] truncate">{finding.sub}</span>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-0.5 shrink-0 pl-2 border-l border-[#28313C]/50">
                                    <span className="text-[11px] font-bold text-white tabular-nums">{finding.value}</span>
                                    <span className="text-[8px] text-muted-foreground uppercase">{finding.valueSub}</span>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Risk Exposure */}
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-[#28313C] pb-2">
                          <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">Risk exposure by category</h3>
                        </div>

                        <div className="flex items-center gap-6 mt-4 pl-4">
                          {/* Donut Chart (CSS implementation) */}
                          <div className="relative size-32 shrink-0">
                            <div
                              className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                              style={{
                                background: "conic-gradient(var(--critical) 0% 45%, var(--warning) 45% 75%, var(--evidence) 75% 89%, #28313C 89% 100%)"
                              }}
                            />
                            <div className="absolute inset-3 bg-[#080A0E] rounded-full" />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <span className="text-xl font-bold text-white tracking-tight">{reportDetailView.riskExposure.total}</span>
                            </div>
                          </div>

                          {/* Legend */}
                          <div className="flex flex-col gap-2.5 flex-1">
                            {reportDetailView.riskExposure.categories.map((cat, idx) => (
                              <button key={idx} type="button" className="group flex items-center justify-between text-left text-[10px]" onClick={() => handleOpenRiskCategory(cat)}>
                                <div className="flex items-center gap-2">
                                  <span className="size-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                                  <span className="text-muted-foreground group-hover:text-white transition-colors">{cat.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-medium tabular-nums">{cat.value}</span>
                                  <span className="text-muted-foreground font-mono w-8 text-right">({cat.pct}%)</span>
                                </div>
                              </button>
                            ))}
                            <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-[#28313C]">
                              <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Total at-risk exposure</span>
                              <div className="flex items-baseline gap-2">
                                <span className="text-lg font-bold text-white tabular-nums">{reportDetailView.riskExposure.total}</span>
                                <span className="text-[9px] font-bold text-critical flex items-center"><ArrowDownRight className="size-2.5 mr-0.5" /> vs last week</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Findings Section (Always rendered to fill space) */}
                  <div id="all-findings" className="flex flex-col gap-4 pt-6 border-t border-[#28313C]">
                    <div className="flex items-center justify-between border-b border-[#28313C] pb-2">
                      <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">All Findings & Recommendations</h3>
                      <button type="button" className="text-[10px] text-[#4EA1FF] hover:text-[#7CC7FF] font-medium flex items-center gap-1 transition-colors" onClick={handleExportFindings}>
                        <Download className="size-3" /> Export CSV
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {reportDetailView.topFindings.map((finding, idx) => {
                         const sevMap = {
                           High: "bg-critical/10 text-critical border-critical/20",
                           Medium: "bg-warning/10 text-warning border-warning/20",
                           Low: "bg-[#4EA1FF]/10 text-[#4EA1FF] border-[#4EA1FF]/20"
                         };
                         const reportId = activeWorkspaceReport?.id || activeReport?.id || "report";
                         const backlogTaskId = reportBacklogTaskId(reportId, finding);
                         const isBacklogSaving = backlogFindingKey === backlogTaskId;
                         return (
                          <div
                            key={idx}
                            role="button"
                            tabIndex={0}
                            className="flex flex-col gap-3 rounded-xl border border-[#28313C] bg-[#0E1116] p-4 text-left transition-colors hover:bg-[#141A22]"
                            onClick={() => handleOpenFinding(finding)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                handleOpenFinding(finding);
                              }
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <span className={cn("text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border w-12 text-center", sevMap[finding.severity])}>{finding.severity}</span>
                              <span className="text-[11px] font-bold text-white tabular-nums">{finding.value}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[11px] font-bold text-white">{finding.title}</span>
                              <span className="text-[10px] text-muted-foreground">{finding.sub}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2 pt-3 border-t border-[#28313C]">
                               <Button
                                 type="button"
                                 size="sm"
                                 className="h-6 text-[9px] bg-primary/20 text-primary hover:bg-primary hover:text-white transition-colors"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   onNavigate?.("approvals", {
                                     actionId: finding.actionId,
                                     findingId: finding.findingId,
                                     evidenceId: finding.evidenceId,
                                     proofTrailId: finding.proofTrailId,
                                     reportId: activeWorkspaceReport?.id || activeReport?.id,
                                     source: "reports",
                                   });
                                 }}
                               >
                                 Take Action
                               </Button>
                               <Button
                                 type="button"
                                 variant="outline"
                                 size="sm"
                                 disabled={busy || !canCreateTeamTasks || isBacklogSaving}
                                 className="h-6 text-[9px] border-[#28313C] bg-[#141A22] text-white hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-50"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleAddFindingToBacklog(finding);
                                 }}
                               >
                                 {isBacklogSaving ? "Saving..." : "Add to backlog"}
                               </Button>
                            </div>
                          </div>
                         );
                      })}
                    </div>
                  </div>

                  {/* Recent approvals included */}
                  <div id="approvals" className="flex flex-col gap-4 pt-6 border-t border-[#28313C]">
                    <div className="flex items-center justify-between border-b border-[#28313C] pb-2">
                      <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">Recent approvals included</h3>
                      <button type="button" className="text-[10px] text-[#4EA1FF] hover:text-[#7CC7FF] font-medium flex items-center gap-1 group transition-colors" onClick={() => handleTabClick("Approvals")}>
                        View all approvals <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-2">
                      {reportDetailView.recentApprovals.map((app, idx) => (
                        <button key={idx} type="button" className="group flex flex-col gap-2 rounded-xl border border-[#28313C] bg-[#0E1116] p-3 text-left transition-colors hover:bg-[#141A22]" onClick={() => handleOpenApproval(app)}>
                          <span className="text-[11px] font-bold text-white leading-tight group-hover:text-[#7CC7FF] transition-colors h-8">{app.title}</span>
                          <div className="flex items-center gap-1.5 mt-1">
                             <div className="size-4 rounded bg-primary/20 flex items-center justify-center border border-primary/30 text-[8px] font-bold text-primary">{app.owner.charAt(0)}</div>
                             <span className="text-[10px] text-muted-foreground">{app.owner}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#28313C]/50">
                             <span className="text-[9px] text-muted-foreground font-mono">{app.date}</span>
                             <span className="text-[9px] font-bold text-primary">{app.status}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="flex flex-col gap-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-[#28313C] pb-3">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-[12px] font-bold uppercase tracking-widest text-white">{activeTab}</h3>
                      <p className="text-[11px] text-muted-foreground">
                        Workspace-derived report data linked to evidence, findings, actions, and proof trails.
                      </p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleTabClick("Executive Summary")} className="h-8 border-[#28313C] bg-[#141A22] text-[10px] text-white hover:bg-white/[0.05]">
                      Summary
                    </Button>
                  </div>

                  {activeTabDetailItems.length ? (
                    <div className="grid grid-cols-2 gap-4">
                      {activeTabDetailItems.map((item, index) => (
                        <div key={`${item.label}-${index}`} className="flex flex-col gap-3 rounded-xl border border-[#28313C] bg-[#0E1116] p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 flex-col gap-1">
                              <span className="truncate text-[11px] font-bold text-white">{item.label}</span>
                              <span className="line-clamp-2 text-[10px] leading-relaxed text-muted-foreground">{item.evidence || item.sectionTitle || "Workspace report item"}</span>
                            </div>
                            <span className="shrink-0 text-right text-[11px] font-bold text-white tabular-nums">{item.value || item.status || item.impact || "Linked"}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 border-t border-[#28313C] pt-3">
                            {item.evidenceId && (
                              <button
                                type="button"
                                onClick={() => onNavigate?.("data", {
                                  evidenceId: item.evidenceId,
                                  findingId: item.findingId,
                                  actionId: item.actionId,
                                  proofTrailId: item.proofTrailId,
                                  reportId: activeWorkspaceReport?.id || activeReport?.id,
                                  source: "reports",
                                })}
                                className="rounded border border-[#28313C] bg-[#141A22] px-2 py-1 text-[9px] font-semibold text-white transition-colors hover:border-primary/40 hover:text-primary"
                              >
                                Evidence
                              </button>
                            )}
                            {(item.actionId || item.findingId) && (
                              <button
                                type="button"
                                onClick={() => onNavigate?.("approvals", {
                                  actionId: item.actionId,
                                  findingId: item.findingId,
                                  evidenceId: item.evidenceId,
                                  proofTrailId: item.proofTrailId,
                                  reportId: activeWorkspaceReport?.id || activeReport?.id,
                                  source: "reports",
                                })}
                                className="rounded border border-primary/30 bg-primary/10 px-2 py-1 text-[9px] font-semibold text-primary transition-colors hover:bg-primary/20"
                              >
                                Approval
                              </button>
                            )}
                            {item.proofTrailId && (
                              <span className="rounded border border-[#28313C] bg-[#080A0E] px-2 py-1 text-[9px] font-mono text-muted-foreground">
                                {item.proofTrailId}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-[#28313C] border-dashed bg-[#0E1116]/60 text-center">
                      <Settings className="mb-3 size-8 text-muted-foreground/30" />
                      <h3 className="text-sm font-semibold text-white">No linked {activeTab.toLowerCase()} data yet</h3>
                      <p className="mt-1 max-w-xs text-[11px] text-muted-foreground">Load demo data or confirm evidence to populate this report section.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR: Summary & Export */}
          <div className="w-[300px] shrink-0 flex flex-col gap-6">

            {/* Report Summary */}
            <div className="flex flex-col rounded-xl border border-[#28313C] bg-[#0E1116] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
               <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#28313C]">
                 <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">Report Summary</h3>
                 <span className="text-[10px] font-bold text-primary px-1.5 py-0.5 rounded border border-primary/20 bg-primary/10 tracking-widest uppercase shadow-[0_0_10px_rgba(33,163,102,0.1)]">Board-ready</span>
               </div>

               {/* Proof Coverage */}
               <div className="flex flex-col gap-3 pb-4 border-b border-[#28313C]">
                 <h4 className="text-[10px] font-bold text-white">Proof coverage</h4>
                 <div className="flex items-center gap-4">
                   <div className="relative">
                     <div className="absolute inset-0 bg-[#7CC7FF]/20 blur-xl rounded-full" />
                     <Ring value={reportSummaryView.proofCoverage} size={64} stroke="#7CC7FF" />
                   </div>
                   <div className="flex flex-col gap-1.5 flex-1">
                     {reportSummaryView.proofCoverageItems.map((item, i) => (
                       <div key={i} className="flex items-center justify-between text-[9px]">
                         <span className="text-muted-foreground">{item.label}</span>
                         <span className="font-bold text-white tabular-nums">{item.value}</span>
                       </div>
                     ))}
                   </div>
                 </div>
                 <button type="button" className="text-[10px] text-[#4EA1FF] hover:text-[#7CC7FF] font-medium flex items-center gap-1 transition-colors group mt-1" onClick={() => handleTabClick("Proof Chain")}>
                    View proof chain <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                 </button>
               </div>

               {/* Board Status */}
               <div className="flex flex-col gap-2 pt-4 pb-4 border-b border-[#28313C]">
                 <h4 className="text-[10px] font-bold text-white mb-1">Board status</h4>
                 <div className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-2 text-[10px]">
                    <span className="text-muted-foreground">Readiness</span>
                    <span className="font-bold text-primary text-right">{reportSummaryView.boardStatus.readiness}</span>
                    <span className="text-muted-foreground">Quality score</span>
                    <span className="font-bold text-white tabular-nums text-right">{reportSummaryView.boardStatus.qualityScore}</span>
                    <span className="text-muted-foreground">Last reviewed</span>
                    <span className="text-muted-foreground tabular-nums text-right">{reportSummaryView.boardStatus.lastReviewed}</span>
                    <span className="text-muted-foreground">Next review</span>
                    <span className="text-white font-medium tabular-nums text-right">{reportSummaryView.boardStatus.nextReview}</span>
                 </div>
               </div>

               {/* Included approvals */}
               <div className="flex flex-col gap-2 pt-4 pb-4 border-b border-[#28313C]">
                 <div className="flex items-center justify-between mb-1">
                   <h4 className="text-[10px] font-bold text-white">Included approvals</h4>
                   <button
                     type="button"
                     className="flex items-center gap-1 text-[9px] text-[#4EA1FF] hover:text-[#7CC7FF] font-medium transition-colors group"
                     onClick={() => onNavigate?.("approvals", {
                       reportId: activeWorkspaceReport?.id || activeReport?.id,
                       source: "reports",
                     })}
                   >
                     View all <ArrowRight className="size-2.5 group-hover:translate-x-0.5 transition-transform" />
                   </button>
                 </div>
                 <div className="flex flex-col gap-1.5">
                   {reportSummaryView.includedApprovals.map((app, i) => (
                     <div key={i} className="flex items-center justify-between text-[10px]">
                       <div className="flex items-center gap-2">
                         <span className={cn("size-1.5 rounded-full", `bg-${app.tone}`)} />
                         <span className="text-muted-foreground">{app.label}</span>
                       </div>
                       <span className="font-bold text-white tabular-nums">{app.value}</span>
                     </div>
                   ))}
                 </div>
               </div>

               {/* Key risks to watch */}
               <div className="flex flex-col gap-2 pt-4 pb-4 border-b border-[#28313C]">
                 <h4 className="text-[10px] font-bold text-white mb-1">Key risks to watch</h4>
                 <div className="flex flex-col gap-1.5">
                   {reportSummaryView.keyRisks.map((risk, i) => (
                     <div key={i} className="flex items-center justify-between text-[10px]">
                       <div className="flex items-center gap-2">
                         <span className={cn("size-1.5 rounded-full", `bg-${risk.tone}`)} />
                         <span className="text-muted-foreground">{risk.label}</span>
                       </div>
                       <span className="font-bold text-white tabular-nums">{risk.value}</span>
                     </div>
                   ))}
                 </div>
                 <button type="button" className="text-[10px] text-[#4EA1FF] hover:text-[#7CC7FF] font-medium flex items-center gap-1 transition-colors group mt-2" onClick={() => onNavigate?.("diagnostics", activeReportContext("reports-key-risks"))}>
                    View all risks <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                 </button>
               </div>

               {/* Report Details Footer */}
               <div className="flex flex-col gap-2 pt-4">
                 <h4 className="text-[10px] font-bold text-white mb-1">Report details</h4>
                 <div className="grid grid-cols-[80px_1fr] gap-x-2 gap-y-2 text-[9px]">
                    <span className="text-muted-foreground">Report ID</span>
                    <span className="font-mono text-white text-right flex items-center justify-end gap-1">
                      {reportSummaryView.reportDetails.id}
                      <button
                        type="button"
                        onClick={() => copyToClipboard(reportSummaryView.reportDetails.id, "Report ID")}
                        className="inline-flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-[#141A22] hover:text-white"
                        aria-label="Copy report ID"
                      >
                        <Copy className="size-2.5" />
                      </button>
                    </span>
                    <span className="text-muted-foreground">Prepared by</span>
                    <span className="text-muted-foreground text-right">{reportSummaryView.reportDetails.preparedBy}</span>
                    <span className="text-muted-foreground">Data as of</span>
                    <span className="text-muted-foreground tabular-nums text-right">{reportSummaryView.reportDetails.dataAsOf}</span>
                    <span className="text-muted-foreground">Report period</span>
                    <span className="text-muted-foreground tabular-nums text-right">{reportSummaryView.reportDetails.period}</span>
                    <span className="text-muted-foreground">Included entities</span>
                    <span className="text-muted-foreground text-right">{reportSummaryView.reportDetails.entities}</span>
                 </div>
               </div>
            </div>

            {/* Export Report */}
            <div className="flex flex-col rounded-xl border border-[#28313C] bg-[#0E1116] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
               <h3 className="text-[11px] font-bold text-white uppercase tracking-widest mb-1">Export report</h3>
               <p className="text-[9px] text-muted-foreground mb-4">Choose a format to export this report pack.</p>

               <div className="flex flex-col gap-2">
                 <button type="button" disabled={!canExportData || busy} className="flex items-center gap-3 p-2.5 rounded-lg border border-[#28313C] bg-[#141A22] hover:border-primary/50 hover:bg-[rgba(78,161,255,0.10)] transition-colors group disabled:cursor-not-allowed disabled:opacity-45" onClick={() => handleExportReport("json")}>
                   <div className="size-8 rounded bg-[#0E1116] border border-[#28313C] flex items-center justify-center group-hover:border-primary/30 transition-colors">
                     <FileText className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                   </div>
                   <div className="flex flex-col text-left gap-0">
                     <span className="text-[11px] font-bold text-white group-hover:text-primary transition-colors">JSON</span>
                     <span className="text-[9px] text-muted-foreground">Board pack data</span>
                   </div>
                 </button>
                 <button type="button" disabled={!canExportData || busy} className="flex items-center gap-3 p-2.5 rounded-lg border border-[#28313C] bg-[#141A22] hover:border-primary/50 hover:bg-[rgba(78,161,255,0.10)] transition-colors group disabled:cursor-not-allowed disabled:opacity-45" onClick={() => handleExportReport("csv")}>
                   <div className="size-8 rounded bg-[#0E1116] border border-[#28313C] flex items-center justify-center group-hover:border-primary/30 transition-colors">
                     <FileSpreadsheet className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                   </div>
                   <div className="flex flex-col text-left gap-0">
                     <span className="text-[11px] font-bold text-white group-hover:text-primary transition-colors">CSV</span>
                     <span className="text-[9px] text-muted-foreground">Data workbook</span>
                   </div>
                 </button>
                 <button type="button" disabled={!canExportData || busy} className="flex items-center gap-3 p-2.5 rounded-lg border border-[#28313C] bg-[#141A22] hover:border-primary/50 hover:bg-[rgba(78,161,255,0.10)] transition-colors group disabled:cursor-not-allowed disabled:opacity-45" onClick={() => handleExportReport("markdown")}>
                   <div className="size-8 rounded bg-[#0E1116] border border-[#28313C] flex items-center justify-center group-hover:border-primary/30 transition-colors">
                     <Code2 className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                   </div>
                   <div className="flex flex-col text-left gap-0">
                     <span className="text-[11px] font-bold text-white group-hover:text-primary transition-colors">Markdown</span>
                     <span className="text-[9px] text-muted-foreground">Structured notes</span>
                   </div>
                 </button>
               </div>
            </div>

            {/* Report Actions */}
            <div className="flex flex-col rounded-xl border border-[#28313C] bg-[#0E1116] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
               <h3 className="text-[11px] font-bold text-white uppercase tracking-widest mb-4">Report actions</h3>
               <div className="flex flex-col gap-2">
                 <Button type="button" disabled={isPublishing || !canExportData} className="w-full justify-start text-[11px] bg-[#141A22] hover:bg-white/[0.05] border border-[#28313C] text-white transition-colors h-9 disabled:opacity-50" onClick={handlePublishReport}>
                   {isPublishing ? (
                     <><div className="size-3.5 mr-2 rounded-full border-2 border-primary/30 border-t-primary animate-spin" /> Publishing...</>
                   ) : (
                     <><Plus className="size-3.5 mr-2 text-primary" /> Publish pack</>
                   )}
                 </Button>
                 <Button type="button" className="w-full justify-start text-[11px] bg-[#141A22] hover:bg-white/[0.05] border border-[#28313C] text-white transition-colors h-9" onClick={handleCopyShareLink}>
                   <LinkIcon className="size-3.5 mr-2 text-muted-foreground" /> Share link
                 </Button>
                 <Button type="button" className="w-full justify-start text-[11px] bg-[#141A22] hover:bg-white/[0.05] border border-[#28313C] text-white transition-colors h-9" onClick={() => setIsScheduleFormOpen((value) => !value)}>
                   <Calendar className="size-3.5 mr-2 text-muted-foreground" /> Schedule report
                 </Button>
                 <Button type="button" disabled={isDuplicatingReport || !canExportData} className="w-full justify-start text-[11px] bg-[#141A22] hover:bg-white/[0.05] border border-[#28313C] text-white transition-colors h-9 disabled:opacity-50" onClick={handleDuplicateReport}>
                   {isDuplicatingReport ? (
                     <><div className="size-3.5 mr-2 rounded-full border-2 border-primary/30 border-t-primary animate-spin" /> Duplicating...</>
                   ) : (
                     <><Copy className="size-3.5 mr-2 text-muted-foreground" /> Duplicate report</>
                   )}
                 </Button>
               </div>

               {latestSchedule && (
                 <div className="mt-4 rounded-lg border border-[#28313C] bg-[#080A0E] p-3">
                   <div className="flex items-center justify-between gap-2">
                     <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Latest schedule</span>
                     <span className={cn("rounded border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest", latestScheduleMeta.className)}>
                       {latestScheduleMeta.label}
                     </span>
                   </div>
                   <p className="mt-2 break-all font-mono text-[9px] text-white">{latestSchedule.id}</p>
                   <div className="mt-2 grid grid-cols-2 gap-2 text-[9px]">
                     <span className="text-muted-foreground">Cadence</span>
                     <span className="text-right font-medium text-white">{latestSchedule.cadence}</span>
                     <span className="text-muted-foreground">Format</span>
                     <span className="text-right font-medium uppercase text-white">{latestSchedule.format}</span>
                     <span className="text-muted-foreground">Recipients</span>
                     <span className="text-right font-medium text-white">{latestSchedule.recipients?.length || 0}</span>
                     <span className="text-muted-foreground">Next run</span>
                     <span className="text-right font-medium text-white">{latestScheduleNextRun}</span>
                   </div>
                   {latestSchedule.statusNote && (
                     <p className="mt-2 line-clamp-2 rounded border border-[#28313C] bg-[#0E1116] px-2 py-1 text-[9px] leading-snug text-muted-foreground">
                       {latestSchedule.statusNote}
                     </p>
                   )}
                   <div className="mt-3 flex flex-wrap gap-1">
                     {latestScheduleActions.map(({ status, label, Icon }) => {
                       const actionKey = `${latestSchedule.id}:${status}`;
                       const isUpdating = updatingScheduleStatus === actionKey;

                       return (
                         <button
                           key={status}
                           type="button"
                           disabled={!canExportData || busy || Boolean(updatingScheduleStatus)}
                           onClick={() => handleUpdateScheduleStatus(latestSchedule, status)}
                           className="inline-flex h-6 items-center gap-1 rounded border border-[#28313C] bg-[#141A22] px-2 text-[9px] font-semibold text-white transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-45"
                         >
                           <Icon className="size-3" />
                           {isUpdating ? "Saving" : label}
                         </button>
                       );
                     })}
                   </div>
                 </div>
               )}

               {isScheduleFormOpen && (
                 <form onSubmit={handleCreateSchedule} className="mt-4 flex flex-col gap-3 rounded-lg border border-[#28313C] bg-[#080A0E] p-3">
                   <div className="grid grid-cols-2 gap-2">
                     <label className="flex flex-col gap-1">
                       <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Cadence</span>
                       <select
                         value={scheduleDraft.cadence}
                         onChange={(event) => updateScheduleDraft("cadence", event.target.value)}
                         className="h-8 rounded border border-[#28313C] bg-[#0E1116] px-2 text-[10px] text-white outline-none focus:border-primary/50"
                       >
                         <option>Weekly</option>
                         <option>Monthly</option>
                         <option>Quarterly</option>
                         <option>One-time</option>
                       </select>
                     </label>
                     <label className="flex flex-col gap-1">
                       <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Format</span>
                       <select
                         value={scheduleDraft.format}
                         onChange={(event) => updateScheduleDraft("format", event.target.value)}
                         className="h-8 rounded border border-[#28313C] bg-[#0E1116] px-2 text-[10px] text-white outline-none focus:border-primary/50"
                       >
                         <option value="markdown">Markdown</option>
                         <option value="json">JSON</option>
                         <option value="csv">CSV</option>
                       </select>
                     </label>
                   </div>
                   <label className="flex flex-col gap-1">
                     <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Recipients</span>
                     <input
                       value={scheduleDraft.recipients}
                       onChange={(event) => updateScheduleDraft("recipients", event.target.value)}
                       placeholder="board@company.com, finance@company.com"
                       className="h-8 rounded border border-[#28313C] bg-[#0E1116] px-2 text-[10px] text-white outline-none placeholder:text-muted-foreground focus:border-primary/50"
                     />
                   </label>
                   <label className="flex flex-col gap-1">
                     <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Review note</span>
                     <textarea
                       value={scheduleDraft.note}
                       onChange={(event) => updateScheduleDraft("note", event.target.value)}
                       rows={3}
                       className="resize-none rounded border border-[#28313C] bg-[#0E1116] px-2 py-2 text-[10px] leading-relaxed text-white outline-none placeholder:text-muted-foreground focus:border-primary/50"
                     />
                   </label>
                   <Button
                     type="submit"
                     disabled={!canExportData || busy || isSchedulingReport}
                     className="h-8 justify-center bg-primary text-[10px] text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                   >
                     {isSchedulingReport ? (
                       <><div className="mr-2 size-3 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving draft...</>
                     ) : (
                       <><Check className="mr-2 size-3" /> Save schedule draft</>
                     )}
                   </Button>
                 </form>
               )}
            </div>

          </div>
        </div>
      </div>

      {/* GLOBAL SYSTEM STATUS FOOTER (Pinned to bottom of view) */}
      <div className="shrink-0 border-t border-[#28313C] bg-[#0E1116] px-6 py-2.5 flex items-center justify-between text-[10px] z-10 relative shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
         <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
             <span className="font-semibold text-white">System status</span>
             <span className="size-1.5 rounded-full bg-primary shadow-[0_0_5px_rgba(33,163,102,0.8)]" />
             <span className="text-muted-foreground">All systems operational</span>
           </div>

           <div className="flex items-center gap-6 pl-6 border-l border-[#28313C]">
             <div className="flex items-center gap-2">
               <span className="text-muted-foreground">Data pipeline</span>
               <span className="size-1.5 rounded-full bg-primary" />
               <span className="font-medium text-primary">Healthy</span>
             </div>
             <div className="flex items-center gap-2">
               <span className="text-muted-foreground">AI extraction</span>
               <span className="size-1.5 rounded-full bg-primary" />
               <span className="font-medium text-primary">Healthy</span>
             </div>
             <div className="flex items-center gap-2">
               <span className="text-muted-foreground">Agent runtime</span>
               <span className="size-1.5 rounded-full bg-primary" />
               <span className="font-medium text-primary">Healthy</span>
             </div>
             <div className="flex items-center gap-2">
               <span className="text-muted-foreground">Approval service</span>
               <span className="size-1.5 rounded-full bg-primary" />
               <span className="font-medium text-primary">Healthy</span>
             </div>
           </div>
         </div>

         <div className="flex items-center gap-3">
           <span className="text-muted-foreground">Last updated: 2m ago</span>
           <button
             type="button"
             disabled={busy}
             onClick={handleRefreshReports}
             className="inline-flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-[#141A22] hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
             aria-label="Refresh report status"
           >
             <RefreshCw className="size-3" />
           </button>
         </div>
      </div>
    </div>
  );
}
