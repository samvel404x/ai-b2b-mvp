"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Upload, Download, Sparkles, AlertCircle, AlertTriangle, ArrowDownRight, ArrowUpRight, Check, ChevronDown, CheckCircle2, FileSpreadsheet, Lock, MoreHorizontal, Settings2, SlidersHorizontal, ArrowRight,
  Maximize2, PlusSquare, Search, Copy, FolderInput,
  MinusSquare, ArrowUp, ArrowDown, ExternalLink,
  ChevronLeft, ChevronRight, X, LayoutGrid, FileText, Database, Activity, Terminal, Filter, RefreshCw
} from "lucide-react";
import {
  excelWorkbookRows, excelAiFindings, excelProofTrail, excelConnectors, excelKpis, excelSpendByCategory, excelForecastTrend
} from "@/lib/genius-data";
import { EvidenceLink, Panel, ConfBar, Ring, Sparkline } from "../shared";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useWorkspace } from "../workspace-context";

function ApprovalPill({ state }) {
  const s = {
    "Pending": "text-warning",
    "Review": "text-[#4EA1FF]",
    "Not started": "text-muted-foreground",
    "Approved": "text-primary",
  }[state] || "text-muted-foreground";
  return <span className={cn("rounded border border-current/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap", s)}>{state}</span>;
}

function AnomalyPill({ type }) {
  const isRed = ["Duplicate", "At risk", "Policy breach"].includes(type);
  const isYellow = ["High spend", "Price variance", "Low stock", "Missing owner", "Formula issue", "Forecast var."].includes(type);
  const isBlue = ["Uncoded", "Inactive vendor"].includes(type);

  const c = isRed ? "border-critical/30 bg-critical/10 text-critical"
          : isYellow ? "border-warning/30 bg-warning/10 text-warning"
          : isBlue ? "border-[#4EA1FF]/30 bg-[#4EA1FF]/10 text-[#4EA1FF]"
          : "border-[#28313C] bg-[#141A22] text-muted-foreground";

  return (
    <span className={cn("flex items-center gap-1.5 rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap w-fit", c)}>
      {isRed && <AlertCircle className="size-2.5" />}
      {isYellow && <AlertTriangle className="size-2.5" />}
      {isBlue && <CheckCircle2 className="size-2.5" />}
      {type}
    </span>
  );
}

function KpiCard({ kpi, index }) {
  const trendUp = kpi.trendDir === "up";
  const trendDown = kpi.trendDir === "down";

  return (
    <div
      className="group relative flex flex-[1_1_150px] flex-col gap-2 overflow-hidden rounded-xl border border-[#28313C] bg-[#0E1116] p-3 transition-all hover:bg-[#141A22] min-w-[150px] animate-fade-up"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-center gap-2">
        <Ring value={kpi.ring} size={36} stroke={`var(--${kpi.tone})`} />
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
      <div className="absolute right-3 bottom-3 hidden opacity-30 transition-opacity group-hover:opacity-100 min-[1500px]:block">
         <Sparkline data={kpi.spark} stroke={`var(--${kpi.tone})`} className="h-6 w-16 opacity-50" />
      </div>
    </div>
  );
}

function escapeCsvCell(value) {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function formatSavedAt(value) {
  if (!value) return "Not saved";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not saved";
  return date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

const defaultExcelVisibleColumnIds = [
  "id",
  "source",
  "row",
  "description",
  "amount",
  "category",
  "anomaly",
  "confidence",
  "suggestedFix",
  "owner",
  "approvalState",
];

function textValue(value, fallback = "") {
  return String(value || fallback).trim() || fallback;
}

function numericValue(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function formatMoneyShort(value) {
  const amount = Math.max(0, numericValue(value));
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(amount >= 10000000 ? 0 : 1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(amount >= 10000 ? 0 : 1)}K`;
  return `$${Math.round(amount).toLocaleString("en-US")}`;
}

function approvalStateFromStatus(status) {
  if (["Approved", "Done"].includes(status)) return "Approved";
  if (["Needs evidence", "Edited", "Review"].includes(status)) return "Review";
  if (status === "Rejected") return "Not started";
  return "Pending";
}

function anomalyFromFinding(finding, fallback = "Review") {
  const category = String(finding?.category || "").toLowerCase();
  const title = String(finding?.title || "").toLowerCase();

  if (title.includes("duplicate")) return "Duplicate";
  if (category.includes("renewal") || title.includes("renewal")) return "At risk";
  if (category.includes("invoice") || title.includes("mismatch")) return "Price variance";
  if (category.includes("ownership") || title.includes("owner")) return "Missing owner";
  if (category.includes("spend") || title.includes("spend")) return "High spend";
  return fallback;
}

function categoryFromSource(source, fallback = "Spend") {
  const text = String(source || "").toLowerCase();
  if (text.includes("invoice")) return "Invoice";
  if (text.includes("contract")) return "Contract";
  if (text.includes("marketing") || text.includes("ads")) return "Marketing";
  if (text.includes("logistics") || text.includes("freight")) return "Logistics";
  if (text.includes("software") || text.includes("saas")) return "Software";
  return fallback;
}

function buildFindingIndex(findings = [], actions = []) {
  const actionByFinding = new Map(actions.map((action) => [action.findingId, action]));
  const byEvidenceId = new Map();

  for (const finding of findings) {
    const evidenceId = finding.evidenceId;
    if (!evidenceId || byEvidenceId.has(evidenceId)) continue;
    byEvidenceId.set(evidenceId, {
      finding,
      action: actionByFinding.get(finding.id) || null,
    });
  }

  return byEvidenceId;
}

function rowWithFinding(row, indexedFinding, fallbackFix) {
  const finding = indexedFinding?.finding;
  const action = indexedFinding?.action;

  return {
    ...row,
    anomaly: anomalyFromFinding(finding, row.anomaly),
    confidence: numericValue(finding?.confidence, row.confidence),
    suggestedFix: textValue(action?.title || finding?.recommendedAction, fallbackFix),
    owner: textValue(finding?.owner || row.owner, "Unassigned"),
    approvalState: approvalStateFromStatus(action?.status || row.approvalState),
  };
}

function buildWorkspaceRows(workspace = {}) {
  const findingsByEvidence = buildFindingIndex(workspace.findings || [], workspace.actions || []);
  const rows = [];

  for (const [index, spendRow] of (workspace.spendRows || []).entries()) {
    const indexedFinding = findingsByEvidence.get(spendRow.evidenceId);
    rows.push(rowWithFinding({
      id: spendRow.id || `spend-${index + 1}`,
      evidenceId: spendRow.evidenceId || "",
      source: textValue(spendRow.source, "Confirmed spend evidence"),
      row: numericValue(spendRow.rowNumber, index + 1),
      description: textValue(spendRow.description, `${textValue(spendRow.vendorName, "Vendor")} - confirmed spend`),
      amount: numericValue(spendRow.amount),
      category: textValue(spendRow.category, categoryFromSource(spendRow.source, "Spend")),
      anomaly: numericValue(spendRow.amount) > 5000 ? "High spend" : "Review",
      confidence: 72,
      suggestedFix: "Compare against contract, invoice, or approval history",
      owner: "Unassigned",
      approvalState: "Pending",
    }, indexedFinding, "Compare against contract, invoice, or approval history"));
  }

  for (const [index, invoice] of (workspace.invoices || []).entries()) {
    const indexedFinding = findingsByEvidence.get(invoice.evidenceId);
    rows.push(rowWithFinding({
      id: invoice.id || `invoice-${index + 1}`,
      evidenceId: invoice.evidenceId || "",
      source: invoice.invoiceNumber ? `Invoice ${invoice.invoiceNumber}` : "Reviewed invoice",
      row: rows.length + 1,
      description: `${textValue(invoice.vendorName, "Vendor")} - invoice review`,
      amount: numericValue(invoice.total),
      category: "Invoice",
      anomaly: "Price variance",
      confidence: 76,
      suggestedFix: "Validate invoice total against contract terms",
      owner: "Finance",
      approvalState: "Review",
    }, indexedFinding, "Validate invoice total against contract terms"));
  }

  for (const [index, contract] of (workspace.contracts || []).entries()) {
    const indexedFinding = findingsByEvidence.get(contract.evidenceId);
    rows.push(rowWithFinding({
      id: contract.id || `contract-${index + 1}`,
      evidenceId: contract.evidenceId || "",
      source: "Reviewed contract",
      row: rows.length + 1,
      description: `${textValue(contract.vendorName, "Vendor")} - renewal / terms`,
      amount: numericValue(contract.value),
      category: "Contract",
      anomaly: contract.renewalDate ? "At risk" : "Review",
      confidence: 78,
      suggestedFix: "Confirm owner, renewal date, and negotiation path",
      owner: "Procurement",
      approvalState: "Pending",
    }, indexedFinding, "Confirm owner, renewal date, and negotiation path"));
  }

  return rows;
}

function buildWorkspaceKpis(rows, workspace = {}) {
  const totalSpend = rows.reduce((sum, row) => sum + numericValue(row.amount), 0);
  const duplicateCount = rows.filter((row) => row.anomaly === "Duplicate").length;
  const missingOwnerCount = rows.filter((row) => /unassigned|unknown|missing/i.test(row.owner)).length;
  const openActions = (workspace.actions || []).filter((action) => !["Approved", "Rejected", "Done"].includes(action.status));
  const moneyAtRisk = workspace.metrics?.moneyAtRisk || (workspace.findings || []).reduce((sum, finding) => sum + numericValue(finding.impact), 0);
  const evidenceCount = (workspace.evidence || []).length;
  const confirmedEvidence = (workspace.evidence || []).filter((record) => record.status === "Confirmed").length;
  const readiness = evidenceCount ? Math.round((confirmedEvidence / evidenceCount) * 100) : rows.length ? 80 : 0;

  return [
    { id: "rows", label: "Rows Processed", value: rows.length.toLocaleString("en-US"), trend: `${confirmedEvidence} confirmed sources`, trendDir: "up", tone: "primary", ring: rows.length ? 75 : 20, spark: [1, 2, 3, 4, 5, 6, rows.length || 1] },
    { id: "spend", label: "Spend Analyzed", value: formatMoneyShort(totalSpend), trend: `${rows.length} workspace rows`, trendDir: "up", tone: "primary", ring: totalSpend ? 68 : 20, spark: [1, 2, 2, 3, 4, 5, Math.max(6, rows.length)] },
    { id: "dupes", label: "Duplicate Payments", value: duplicateCount.toLocaleString("en-US"), trend: `${duplicateCount} flagged`, trendDir: duplicateCount ? "up" : "flat", tone: duplicateCount ? "critical" : "primary", ring: duplicateCount ? 80 : 35, spark: [0, 0, 0, 1, 1, 2, duplicateCount] },
    { id: "risk", label: "Money At Risk", value: formatMoneyShort(moneyAtRisk), trend: `${(workspace.findings || []).length} findings`, trendDir: moneyAtRisk ? "up" : "flat", tone: "warning", ring: moneyAtRisk ? 72 : 25, spark: [1, 1, 2, 3, 4, 5, Math.max(6, (workspace.findings || []).length)] },
    { id: "missing", label: "Missing Owners", value: missingOwnerCount.toLocaleString("en-US"), trend: `${missingOwnerCount} rows`, trendDir: missingOwnerCount ? "up" : "flat", tone: "warning", ring: missingOwnerCount ? 60 : 30, spark: [0, 1, 1, 2, 2, 3, missingOwnerCount] },
    { id: "open", label: "Open Approval Value", value: formatMoneyShort(openActions.reduce((sum, action) => sum + numericValue(action.impact), 0)), trend: `${openActions.length} approvals`, trendDir: openActions.length ? "up" : "flat", tone: "warning", ring: openActions.length ? 58 : 25, spark: [0, 1, 1, 2, 3, 3, openActions.length] },
    { id: "export", label: "Export Readiness", value: `${readiness}%`, trend: `${confirmedEvidence}/${evidenceCount || rows.length} reviewed`, trendDir: readiness >= 70 ? "up" : "down", tone: readiness >= 70 ? "primary" : "warning", ring: readiness, spark: [20, 30, 45, 55, 65, 75, readiness] },
  ];
}

function buildWorkspaceAiFindings(workspace = {}) {
  const findings = (workspace.findings || []).slice(0, 5);
  if (!findings.length) return excelAiFindings;

  return findings.map((finding, index) => ({
    rank: index + 1,
    label: finding.title || "Workspace finding",
    impact: formatMoneyShort(finding.impact),
    confidence: numericValue(finding.confidence, 70),
    count: (workspace.actions || []).filter((action) => action.findingId === finding.id).length || 1,
  }));
}

function buildWorkspaceSpendByCategory(rows) {
  if (!rows.length) return excelSpendByCategory;
  const colors = ["#e84142", "#f97316", "#eab308", "#10b981", "#4EA1FF", "#7CC7FF"];
  const totals = new Map();

  for (const row of rows) {
    totals.set(row.category, (totals.get(row.category) || 0) + numericValue(row.amount));
  }

  const grandTotal = Array.from(totals.values()).reduce((sum, value) => sum + value, 0) || 1;

  return Array.from(totals.entries())
    .sort(([, left], [, right]) => right - left)
    .slice(0, 6)
    .map(([category, amount], index) => ({
      category,
      amount: Math.round(amount / 1000),
      pct: Math.max(4, Math.round((amount / grandTotal) * 100)),
      color: colors[index % colors.length],
    }));
}

function buildWorkspaceProofTrail(workspace = {}, rows = []) {
  const rowByEvidence = new Map(rows.map((row) => [row.evidenceId || row.id, row]));
  const actionsByFinding = new Map((workspace.actions || []).map((action) => [action.findingId, action]));
  const trail = (workspace.findings || []).slice(0, 8).map((finding, index) => {
    const row = rowByEvidence.get(finding.evidenceId) || rows[index] || {};
    const action = actionsByFinding.get(finding.id);

    return {
      row: numericValue(row.row, index + 1),
      finding: finding.title || "Workspace finding",
      action: action?.title || finding.recommendedAction || "Review recommended action",
      approval: approvalStateFromStatus(action?.status || "Pending"),
      link: finding.evidenceId || `PT-${index + 1}`,
      evidenceId: finding.evidenceId || row.evidenceId || "",
      findingId: finding.id || "",
      actionId: action?.id || "",
      source: row.source || "Workspace evidence",
      description: row.description || finding.summary || finding.detail || "",
      owner: row.owner || finding.owner || action?.owner || "Unassigned",
      category: row.category || finding.category || "Workspace",
      amount: numericValue(row.amount || finding.impact),
    };
  });

  return trail.length ? trail : excelProofTrail;
}

function proofTrailKey(item = {}, index = 0) {
  return [
    item.evidenceId,
    item.findingId,
    item.actionId,
    item.link,
    item.row,
    index,
  ]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join("::") || `proof-trail-${index}`;
}

function proofLineageSummary(item = {}, workspace = {}, rows = []) {
  const evidenceId = item.evidenceId || item.link || "";
  const evidence = (workspace.evidence || []).find((record) => record.id === evidenceId) || null;
  const row = rows.find((candidate) => candidate.evidenceId === evidenceId || candidate.row === item.row) || {};
  const finding = (workspace.findings || []).find((candidate) => candidate.id === item.findingId || candidate.evidenceId === evidenceId) || null;
  const action = (workspace.actions || []).find((candidate) => candidate.id === item.actionId || candidate.findingId === finding?.id) || null;

  return {
    evidenceName: evidence?.name || evidence?.fileName || row.source || item.source || "Workspace evidence",
    evidenceStatus: evidence?.status || "Linked",
    sourceRow: row.row || item.row,
    rowDescription: row.description || item.description || finding?.summary || finding?.detail || "Evidence-backed workspace row.",
    category: row.category || item.category || finding?.category || "Workspace",
    amount: numericValue(row.amount || item.amount || finding?.impact),
    owner: row.owner || item.owner || finding?.owner || action?.owner || "Unassigned",
    confidence: numericValue(row.confidence || finding?.confidence),
    actionStatus: action?.status || item.approval || "Pending",
    evidenceId,
    findingId: finding?.id || item.findingId || "",
    actionId: action?.id || item.actionId || "",
  };
}

export default function ExcelWorkspace({ onNavigate }) {
  const { workspace, saveExcelWorkspaceView, loadWorkspace, busy } = useWorkspace();
  const savedViews = workspace.excelWorkspaceViews || [];
  const latestSavedView = savedViews[0] || null;
  const workspaceRows = useMemo(() => buildWorkspaceRows(workspace), [workspace]);
  const hasWorkspaceRows = workspaceRows.length > 0;
  const excelRows = hasWorkspaceRows ? workspaceRows : excelWorkbookRows;
  const workbookName = hasWorkspaceRows ? "Workspace_Reviewed_Data.xlsx" : "Spend_Analysis_May_2026.xlsx";
  const sheetName = hasWorkspaceRows ? "Reviewed workspace rows" : "Sheet1 - Transactions";
  const workbookKpis = useMemo(() => (hasWorkspaceRows ? buildWorkspaceKpis(workspaceRows, workspace) : excelKpis), [hasWorkspaceRows, workspaceRows, workspace]);
  const aiFindings = useMemo(() => buildWorkspaceAiFindings(workspace), [workspace]);
  const spendByCategory = useMemo(() => (hasWorkspaceRows ? buildWorkspaceSpendByCategory(workspaceRows) : excelSpendByCategory), [hasWorkspaceRows, workspaceRows]);
  const proofTrailRows = useMemo(() => (hasWorkspaceRows ? buildWorkspaceProofTrail(workspace, workspaceRows) : excelProofTrail), [hasWorkspaceRows, workspace, workspaceRows]);
  const [selected, setSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    anomaly: "All anomalies",
    category: "All categories",
    owner: "All owners",
    approvalState: "All approval states"
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  const [tabs, setTabs] = useState([
    { id: "1", label: "Workbook view" },
    { id: "2", label: "Sheet overview" },
    { id: "3", label: "Anomalies" },
    { id: "4", label: "Trends" },
    { id: "5", label: "Modeling" },
    { id: "6", label: "What-if" }
  ]);
  const [activeTabId, setActiveTabId] = useState("1");
  const [editingTabId, setEditingTabId] = useState(null);
  const [editingTabText, setEditingTabText] = useState("");
  const [loadedViewId, setLoadedViewId] = useState("");
  const [workbookNote, setWorkbookNote] = useState("");
  const [visibleColumnIds, setVisibleColumnIds] = useState(defaultExcelVisibleColumnIds);
  const [expandedLineageKeys, setExpandedLineageKeys] = useState([]);

  useEffect(() => {
    if (!latestSavedView || loadedViewId === latestSavedView.id) return;

    const timer = window.setTimeout(() => {
      if (Array.isArray(latestSavedView.tabs) && latestSavedView.tabs.length) {
        setTabs(latestSavedView.tabs);
        setActiveTabId(latestSavedView.activeTabId || latestSavedView.tabs[0].id);
      }

      setFilters((previous) => ({
        ...previous,
        ...(latestSavedView.filters || {}),
      }));
      if (Array.isArray(latestSavedView.visibleColumnIds) && latestSavedView.visibleColumnIds.length) {
        setVisibleColumnIds(latestSavedView.visibleColumnIds);
      }
      setSearchQuery(latestSavedView.searchQuery || "");
      setRowsPerPage([12, 25, 50].includes(Number(latestSavedView.rowsPerPage)) ? Number(latestSavedView.rowsPerPage) : 12);
      setSelected(Array.isArray(latestSavedView.selectedRowIds) ? latestSavedView.selectedRowIds : []);
      setWorkbookNote(latestSavedView.note || "");
      setCurrentPage(1);
      setLoadedViewId(latestSavedView.id);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [latestSavedView, loadedViewId]);

  const handleAddTab = () => {
    const newId = Date.now().toString();
    setTabs([...tabs, { id: newId, label: "New Sheet" }]);
    setActiveTabId(newId);
  };

  const handleRemoveTab = (e, id) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) setActiveTabId(newTabs[0].id);
  };

  const saveTabEdit = () => {
    if (editingTabText.trim()) {
      setTabs(tabs.map(t => t.id === editingTabId ? { ...t, label: editingTabText } : t));
    }
    setEditingTabId(null);
  };

  const anomalies = ["All anomalies", ...new Set(excelRows.map(r => r.anomaly))];
  const categories = ["All categories", ...new Set(excelRows.map(r => r.category))];
  const owners = ["All owners", ...new Set(excelRows.map(r => r.owner))];
  const approvalStates = ["All approval states", ...new Set(excelRows.map(r => r.approvalState))];

  // Filtering logic
  const filteredRows = excelRows.filter(r => {
    const matchesSearch = searchQuery === "" ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.owner.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAnomaly = filters.anomaly === "All anomalies" || r.anomaly === filters.anomaly;
    const matchesCategory = filters.category === "All categories" || r.category === filters.category;
    const matchesOwner = filters.owner === "All owners" || r.owner === filters.owner;
    const matchesApproval = filters.approvalState === "All approval states" || r.approvalState === filters.approvalState;

    return matchesSearch && matchesAnomaly && matchesCategory && matchesOwner && matchesApproval;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedRows = filteredRows.slice((safeCurrentPage - 1) * rowsPerPage, safeCurrentPage * rowsPerPage);
  const paginatedRowIds = paginatedRows.map((row) => String(row.id));
  const selectedOnPage = paginatedRowIds.filter((id) => selected.includes(id));
  const allPageRowsSelected = paginatedRowIds.length > 0 && selectedOnPage.length === paginatedRowIds.length;
  const somePageRowsSelected = selectedOnPage.length > 0 && !allPageRowsSelected;
  const columnDefinitions = useMemo(() => ([
    {
      id: "id",
      label: "#",
      headerClassName: "px-3 py-3 font-semibold text-muted-foreground",
      cellClassName: "px-3 py-3 font-bold text-muted-foreground",
      render: (row) => row.id,
    },
    {
      id: "source",
      label: "Source / Sheet",
      headerClassName: "px-3 py-3 font-semibold text-muted-foreground",
      cellClassName: "px-3 py-3 font-medium text-white max-w-[150px] truncate",
      render: (row) => row.source,
    },
    {
      id: "row",
      label: "Row",
      headerClassName: "px-3 py-3 font-semibold text-muted-foreground text-right",
      cellClassName: "px-3 py-3 font-bold text-muted-foreground tabular-nums text-right",
      render: (row) => row.row.toLocaleString(),
    },
    {
      id: "description",
      label: "Description",
      headerClassName: "px-3 py-3 font-semibold text-muted-foreground",
      cellClassName: "px-3 py-3 font-medium text-muted-foreground max-w-[150px] truncate",
      render: (row) => row.description,
    },
    {
      id: "amount",
      label: "Amount",
      headerClassName: "px-3 py-3 font-semibold text-muted-foreground text-right",
      cellClassName: "px-3 py-3 font-bold text-white tabular-nums text-right",
      render: (row) => row.amount > 0 ? `$${row.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "--",
    },
    {
      id: "category",
      label: "Category",
      headerClassName: "px-3 py-3 font-semibold text-muted-foreground",
      cellClassName: "px-3 py-3 font-medium text-muted-foreground",
      render: (row) => row.category,
    },
    {
      id: "anomaly",
      label: "Anomaly",
      headerClassName: "px-3 py-3 font-semibold text-muted-foreground text-center",
      cellClassName: "px-3 py-3",
      render: (row) => <div className="flex justify-center"><AnomalyPill type={row.anomaly} /></div>,
    },
    {
      id: "confidence",
      label: "Confidence",
      headerClassName: "px-3 py-3 font-semibold text-muted-foreground text-center w-24",
      cellClassName: "px-3 py-3 text-center",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <span className="font-bold tabular-nums text-white">{row.confidence}%</span>
          <div className="relative flex size-4 shrink-0 items-center justify-center">
            <svg viewBox="0 0 36 36" className="absolute inset-0 size-full -rotate-90">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--primary)" strokeWidth="6" strokeDasharray={`${row.confidence}, 100`} />
            </svg>
          </div>
        </div>
      ),
    },
    {
      id: "suggestedFix",
      label: "Suggested Fix",
      headerClassName: "px-3 py-3 font-semibold text-muted-foreground",
      cellClassName: "px-3 py-3 font-medium text-white",
      render: (row) => row.suggestedFix,
    },
    {
      id: "owner",
      label: "Owner",
      headerClassName: "px-3 py-3 font-semibold text-muted-foreground",
      cellClassName: "px-3 py-3 font-medium text-muted-foreground",
      render: (row) => row.owner,
    },
    {
      id: "approvalState",
      label: "Approval State",
      headerClassName: "px-3 py-3 font-semibold text-muted-foreground text-center",
      cellClassName: "px-3 py-3",
      render: (row) => <div className="flex justify-center"><ApprovalPill state={row.approvalState} /></div>,
    },
  ]), []);
  const visibleColumns = useMemo(() => {
    const selectedIds = new Set(visibleColumnIds);
    const columns = columnDefinitions.filter((column) => selectedIds.has(column.id));
    return columns.length ? columns : columnDefinitions;
  }, [columnDefinitions, visibleColumnIds]);

  const toggleAll = () => {
    if (paginatedRowIds.length === 0) return;

    setSelected((previous) => {
      const pageIds = new Set(paginatedRowIds);
      const isPageSelected = paginatedRowIds.every((id) => previous.includes(id));

      if (isPageSelected) return previous.filter((id) => !pageIds.has(id));
      return Array.from(new Set([...previous, ...paginatedRowIds]));
    });
  };

  const toggleRow = (id) => {
    const rowId = String(id);
    setSelected(prev => prev.includes(rowId) ? prev.filter(x => x !== rowId) : [...prev, rowId]);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setFilters({
      anomaly: "All anomalies",
      category: "All categories",
      owner: "All owners",
      approvalState: "All approval states"
    });
    setCurrentPage(1);
    toast.info("All filters cleared");
  };

  const handleLockedAction = (label) => {
    toast.info(`${label} is locked until persistent spreadsheet workspace tools are enabled.`);
  };

  const handleToggleColumn = (columnId) => {
    setVisibleColumnIds((current) => {
      if (current.includes(columnId)) {
        if (current.length <= 1) {
          toast.info("At least one data column must stay visible.");
          return current;
        }
        return current.filter((id) => id !== columnId);
      }
      return defaultExcelVisibleColumnIds.filter((id) => id === columnId || current.includes(id));
    });
  };

  const handleToggleLineage = (item, index) => {
    const key = proofTrailKey(item, index);
    setExpandedLineageKeys((current) =>
      current.includes(key) ? current.filter((id) => id !== key) : [...current, key],
    );
  };

  const handleRefreshWorkspace = async () => {
    try {
      await loadWorkspace({ silent: true });
      toast.success("Workspace data refreshed");
    } catch (error) {
      toast.error(error.message || "Workspace refresh failed.");
    }
  };

  const handleExportView = () => {
    if (filteredRows.length === 0) {
      toast.info("No rows match the current filters.");
      return;
    }

    const columns = [
      ["id", "ID"],
      ["source", "Source"],
      ["row", "Source row"],
      ["description", "Description"],
      ["amount", "Amount"],
      ["category", "Category"],
      ["anomaly", "Anomaly"],
      ["confidence", "Confidence"],
      ["suggestedFix", "Suggested fix"],
      ["owner", "Owner"],
      ["approvalState", "Approval state"],
    ];
    const csv = [
      columns.map(([, label]) => escapeCsvCell(label)).join(","),
      ...filteredRows.map((row) => columns.map(([key]) => escapeCsvCell(row[key])).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `genius-excel-workspace-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredRows.length} rows`);
  };

  const handleSaveWorkbookView = async () => {
    try {
      const view = await saveExcelWorkspaceView({
        id: loadedViewId || undefined,
        workbookName,
        sheetName,
        tabs,
        activeTabId,
        filters,
        visibleColumnIds,
        searchQuery,
        rowsPerPage,
        selectedRowIds: selected,
        note: workbookNote,
        metrics: {
          filteredRows: filteredRows.length,
          totalRows: excelRows.length,
          selectedRows: selected.length,
        },
      });
      setLoadedViewId(view.id);
      toast.success("Excel workspace view saved");
    } catch (error) {
      toast.error(error.message || "Excel workspace view could not be saved.");
    }
  };

  const handleAnalyzeSelected = () => {
    if (selected.length === 0) return;
    toast.success(`${selected.length} rows selected. Opening AI Chat with spreadsheet context.`);
    onNavigate?.("chat", {
      source: "excel-workspace",
      selectedRowIds: selected,
    });
  };

  const handleOpenProofTrail = (link) => {
    const evidenceId = String(link || "");
    const hasEvidenceRecord = (workspace.evidence || []).some((record) => record.id === evidenceId);

    onNavigate?.("data", hasEvidenceRecord
      ? { evidenceId, source: "excel-workspace-proof-trail" }
      : { proofTrailId: evidenceId, source: "excel-workspace-proof-trail" });
  };

  // UI rendering helpers
  const renderFilterDropdown = (options, currentVal, filterKey) => (
    <DropdownMenu>
      <DropdownMenuTrigger className="text-[10px] text-muted-foreground hover:text-white flex items-center gap-1 transition-colors capitalize">
        {currentVal} <ChevronDown className="size-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40 border-[#28313C] bg-[#0E1116] text-muted-foreground">
        {options.map(opt => (
          <DropdownMenuItem
            key={opt}
            onClick={() => {
              setFilters(prev => ({ ...prev, [filterKey]: opt }));
              setCurrentPage(1);
            }}
            className={cn("text-[11px] focus:bg-[#28313C] focus:text-white flex justify-between items-center", currentVal === opt && "text-white font-medium bg-white/[0.02]")}
          >
            {opt}
            {currentVal === opt && <Check className="size-3 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto scrollbar-thin p-6 pb-2">
      {/* Header */}
      <header className="flex items-start justify-between shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-white">Excel Workspace</h1>
          <p className="text-[11px] text-muted-foreground">Spreadsheet intelligence. Detect issues, quantify impact, and take approval-safe actions.</p>
        </div>
        <div className="flex items-center gap-4">
          <button type="button" className="flex items-center gap-2 rounded-full border border-[#28313C] bg-[#0E1116] px-3 py-1.5 text-left transition-colors hover:bg-[#141A22]" onClick={() => onNavigate?.("settings")}>
             <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center"><Sparkles className="size-2.5 text-primary" /></div>
             <div className="flex flex-col gap-0 leading-none">
               <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Provider</span>
               <span className="text-[10px] font-semibold text-white">Gemini 1.5 Pro</span>
             </div>
          </button>
          <button type="button" className="flex items-center gap-2 rounded-full border border-[#28313C] bg-[#0E1116] px-3 py-1.5 text-left transition-colors hover:bg-[#141A22]" onClick={() => onNavigate?.("settings")}>
             <div className="size-4 rounded-full bg-[#21A366]/20 flex items-center justify-center"><Database className="size-2.5 text-[#21A366]" /></div>
             <div className="flex flex-col gap-0 leading-none">
               <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Database</span>
               <span className="text-[10px] font-semibold text-white">Supabase</span>
             </div>
          </button>
          <button type="button" className="flex items-center gap-2 rounded-full border border-[#28313C] bg-[#0E1116] px-3 py-1.5 text-left transition-colors hover:bg-[#141A22]" onClick={() => onNavigate?.("connectors")}>
             <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center"><CheckCircle2 className="size-2.5 text-primary" /></div>
             <div className="flex flex-col gap-0 leading-none">
               <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Connector health</span>
               <span className="text-[10px] font-semibold text-white">98%</span>
             </div>
          </button>
          <button type="button" className="flex items-center gap-2 rounded-full border border-[#28313C] bg-[#0E1116] px-3 py-1.5 text-left transition-colors hover:bg-[#141A22]" onClick={() => onNavigate?.("diagnostics")}>
             <div className="size-4 rounded-full bg-[#28313C] flex items-center justify-center"><Activity className="size-2.5 text-muted-foreground" /></div>
             <div className="flex flex-col gap-0 leading-none">
               <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Data quality</span>
               <span className="text-[10px] font-semibold text-white flex items-center gap-1">2m ago <RefreshCw className={cn("size-2.5", busy && "animate-spin")} /></span>
             </div>
          </button>
        </div>
      </header>

      {/* KPI Strip */}
      <div className="flex min-w-0 items-center gap-3 overflow-x-auto scrollbar-thin pb-2 shrink-0">
        {workbookKpis.map((kpi, i) => (
          <KpiCard key={kpi.id} kpi={kpi} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-6 flex-1 min-h-[800px]">
        {/* Left Panel: Spreadsheet Data */}
        <div className="flex flex-col rounded-xl border border-[#28313C] bg-[#0E1116] overflow-hidden">

          {/* Top Tabs */}
          <div className="flex items-center gap-2 px-5 pt-4 border-b border-[#28313C] shrink-0 overflow-x-auto scrollbar-none">
            {tabs.map((t) => {
              const isActive = activeTabId === t.id;
              const isEditing = editingTabId === t.id;
              return (
                <div
                  key={t.id}
                  role="button"
                  tabIndex={isEditing ? -1 : 0}
                  onClick={() => !isEditing && setActiveTabId(t.id)}
                  onKeyDown={(event) => {
                    if (isEditing) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setActiveTabId(t.id);
                    }
                  }}
                  onDoubleClick={() => {
                    setEditingTabId(t.id);
                    setEditingTabText(t.label);
                  }}
                  className={cn(
                    "group flex items-center gap-2 text-[11px] font-semibold transition-colors relative pb-3 -mb-3 cursor-pointer px-3",
                    isActive ? "text-white" : "text-muted-foreground hover:text-white"
                  )}
                >
                  {isEditing ? (
                    <input
                      autoFocus
                      className="bg-transparent text-white outline-none w-20 border-b border-primary/50"
                      value={editingTabText}
                      onChange={e => setEditingTabText(e.target.value)}
                      onBlur={saveTabEdit}
                      onKeyDown={e => e.key === 'Enter' && saveTabEdit()}
                    />
                  ) : (
                    <span>{t.label}</span>
                  )}
                  {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t-full" />}
                  {!isEditing && tabs.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => handleRemoveTab(e, t.id)}
                      className={cn("opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-white/10 rounded", isActive && "opacity-50")}
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>
              );
            })}
            <button type="button" onClick={handleAddTab} className="p-1 mb-3 ml-2 text-muted-foreground hover:text-white transition-colors hover:bg-white/5 rounded" aria-label="Add workbook view tab">
              <PlusSquare className="size-3.5" />
            </button>
          </div>

          {/* Secondary Toolbar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#28313C] shrink-0 bg-[#0E1116]">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => handleLockedAction("Workbook switching")} className="flex items-center gap-2 rounded border border-[#28313C] bg-[#141A22] px-2 py-1 text-[11px] font-medium text-white transition-colors hover:border-primary/40">
                <FileSpreadsheet className="size-3.5 text-[#21A366]" /> {workbookName} <ChevronDown className="size-3 text-muted-foreground" />
              </button>
              <button type="button" onClick={() => handleLockedAction("Sheet switching")} className="flex items-center gap-2 rounded border border-[#28313C] bg-[#141A22] px-2 py-1 text-[11px] font-medium text-white transition-colors hover:border-primary/40">
                <LayoutGrid className="size-3 text-muted-foreground" /> {sheetName} <ChevronDown className="size-3 text-muted-foreground" />
              </button>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-primary ml-2">
                <span className="size-1.5 bg-primary rounded-full animate-pulse" /> {hasWorkspaceRows ? "Workspace" : "Demo"}
              </span>
              <span className="text-[10px] text-muted-foreground ml-2 font-medium">
                {hasWorkspaceRows ? `${filteredRows.length} reviewed rows` : filteredRows.length === excelRows.length ? "1.42M rows" : `${filteredRows.length} rows`}
              </span>
              <span className="text-[10px] text-muted-foreground ml-2 font-medium">Last synced: {formatSavedAt(workspace.updatedAt)}</span>
              <span className="text-[10px] text-muted-foreground ml-2 font-medium">Saved: {formatSavedAt(latestSavedView?.updatedAt)}</span>
            </div>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1.5 text-[10px] font-medium text-white transition-colors hover:text-primary">
                  <LayoutGrid className="size-3 text-muted-foreground" /> Columns
                  <span className="rounded bg-[#28313C] px-1.5 py-0.5 text-[9px] text-white">{visibleColumns.length}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 border-[#28313C] bg-[#0E1116] text-muted-foreground">
                  {columnDefinitions.map((column) => (
                    <DropdownMenuItem
                      key={column.id}
                      onSelect={(event) => {
                        event.preventDefault();
                        handleToggleColumn(column.id);
                      }}
                      className="flex items-center gap-2 text-[10px] focus:bg-[#28313C] focus:text-white"
                    >
                      <Checkbox
                        checked={visibleColumnIds.includes(column.id)}
                        className="size-3 border-[#28313C] data-[state=checked]:bg-primary data-[state=checked]:text-black"
                        aria-label={`Toggle ${column.label} column`}
                      />
                      <span>{column.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <button type="button" onClick={() => toast.info("Use the live filter controls below to scope the workbook view.")} className="flex items-center gap-1.5 text-[10px] font-medium text-white hover:text-primary transition-colors">
                <Filter className="size-3 text-muted-foreground" /> Filters
                {Object.values(filters).some(v => !v.startsWith("All ")) && (
                  <span className="bg-[#28313C] text-white rounded px-1.5 py-0.5 ml-0.5">
                    {Object.values(filters).filter(v => !v.startsWith("All ")).length} <ChevronDown className="size-2.5 inline" />
                  </span>
                )}
              </button>
              <button type="button" onClick={handleExportView} className="flex items-center gap-1.5 text-[10px] font-medium text-white hover:text-primary transition-colors">
                <Download className="size-3 text-muted-foreground" /> Export CSV
              </button>
              <button
                type="button"
                onClick={handleSaveWorkbookView}
                disabled={busy}
                className="flex items-center gap-1.5 text-[10px] font-medium text-white transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check className="size-3 text-muted-foreground" /> Save view
              </button>
              <Button size="sm" className="h-7 ml-2 bg-evidence text-[#FFFFFF] hover:bg-evidence/90 text-[10px] font-bold tracking-wide" disabled={selected.length === 0} onClick={handleAnalyzeSelected}>
                <Sparkles className="size-3 mr-1 text-[#FFFFFF]" /> Analyze
              </Button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-[#28313C] shrink-0 bg-[#080A0E]">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1.5 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="Search in data..."
                  className="w-full bg-transparent border border-[#28313C] rounded px-8 py-1 text-[10px] text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {renderFilterDropdown(anomalies, filters.anomaly, "anomaly")}
              {renderFilterDropdown(categories, filters.category, "category")}
              {renderFilterDropdown(owners, filters.owner, "owner")}
              {renderFilterDropdown(approvalStates, filters.approvalState, "approvalState")}
            </div>

            <button
              type="button"
              onClick={clearAllFilters}
              className="text-[10px] text-muted-foreground hover:text-white transition-colors"
            >
              Clear all
            </button>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-[10px] whitespace-nowrap">
              <thead className="sticky top-0 z-10 border-b border-[#28313C] bg-[#0E1116]">
                <tr>
                  <th className="px-4 py-3 font-semibold text-muted-foreground w-8">
                    <Checkbox
                      aria-label={allPageRowsSelected ? "Clear current page selection" : "Select current page rows"}
                      checked={allPageRowsSelected ? true : somePageRowsSelected ? "indeterminate" : false}
                      onCheckedChange={toggleAll}
                      className="border-[#28313C] data-[state=checked]:bg-primary data-[state=checked]:text-black"
                    />
                  </th>
                  {visibleColumns.map((column) => (
                    <th key={column.id} className={column.headerClassName}>{column.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#28313C]/50">
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={visibleColumns.length + 1} className="px-4 py-8 text-center text-muted-foreground">
                      No results match your filters.
                    </td>
                  </tr>
                ) : paginatedRows.map((r) => {
                  const isSel = selected.includes(String(r.id));
                  return (
                    <tr
                      key={r.id}
                      onClick={() => toggleRow(r.id)}
                      className={cn("group transition-colors hover:bg-white/[0.02] cursor-pointer", isSel && "bg-white/[0.04] border-l-2 border-l-primary border-r-0")}
                    >
                      <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                        <Checkbox
                          aria-label={`Select row ${r.id}`}
                          checked={isSel}
                          onCheckedChange={() => toggleRow(r.id)}
                          className="border-[#28313C] data-[state=checked]:bg-primary data-[state=checked]:text-black"
                        />
                      </td>
                      {visibleColumns.map((column) => (
                        <td key={column.id} className={column.cellClassName}>{column.render(r)}</td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-[#28313C] px-5 py-3 text-[10px] text-muted-foreground shrink-0 bg-[#080A0E]">
            {filteredRows.length > 0 ? (
              <span>
                Showing {((safeCurrentPage - 1) * rowsPerPage) + 1} to {Math.min(safeCurrentPage * rowsPerPage, filteredRows.length)} of {hasWorkspaceRows ? filteredRows.length : filteredRows.length === excelRows.length ? "1,421,687" : filteredRows.length} rows
              </span>
            ) : (
              <span>No results</span>
            )}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={safeCurrentPage === 1}
                  className="flex size-6 items-center justify-center rounded hover:bg-[#28313C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="size-3" />
                </button>

                {/* Show a simplistic window of pages based on totalPages */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(page => (
                  <button
                    type="button"
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "flex size-6 items-center justify-center rounded transition-colors hover:bg-[#28313C] hover:text-white",
                      page === safeCurrentPage ? "bg-[#141A22] text-white" : ""
                    )}
                  >
                    {page}
                  </button>
                ))}

                {totalPages > 5 && <span className="px-1">...</span>}
                {totalPages > 5 && (
                  <button
                    type="button"
                    onClick={() => setCurrentPage(totalPages)}
                    className={cn(
                      "flex size-6 items-center justify-center rounded transition-colors hover:bg-[#28313C] hover:text-white",
                      safeCurrentPage === totalPages && "bg-[#141A22] text-white"
                    )}
                    aria-label={`Go to page ${totalPages}`}
                  >
                    {totalPages}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={safeCurrentPage === totalPages || totalPages === 0}
                  className="flex size-6 items-center justify-center rounded hover:bg-[#28313C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="size-3" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 font-medium text-white bg-transparent rounded transition-colors hover:bg-[#28313C]">
                    {rowsPerPage} <ChevronDown className="size-3 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-16 min-w-0 border-[#28313C] bg-[#0E1116] text-muted-foreground">
                    {[12, 25, 50].map(val => (
                      <DropdownMenuItem
                        key={val}
                        onClick={() => { setRowsPerPage(val); setCurrentPage(1); }}
                        className={cn("text-[11px] focus:bg-[#28313C] focus:text-white", val === rowsPerPage && "text-white bg-white/[0.02]")}
                      >
                        {val}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: AI Analysis */}
        <div className="flex flex-col gap-6 h-full">
          {/* AI Analysis Summary */}
          <div className="flex flex-col rounded-xl border border-[#28313C] bg-[#0E1116] overflow-hidden p-5 flex-1">
             <div className="flex items-center justify-between border-b border-[#28313C] pb-3 mb-4 shrink-0">
               <h3 className="text-[11px] font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                 AI Analysis Summary <AlertCircle className="size-3.5 text-muted-foreground" />
               </h3>
               <button type="button" onClick={() => onNavigate?.("reports", { source: "excel-workspace-analysis" })} className="text-[10px] text-[#4EA1FF] hover:underline flex items-center gap-1 font-medium">
                 View full report <ArrowRight className="size-3" />
               </button>
             </div>

             <div className="flex-1 overflow-y-auto scrollbar-thin">
                <table className="w-full text-[10px] whitespace-nowrap text-left">
                   <tbody>
                     {aiFindings.map((f, i) => (
                       <tr key={i} className="border-b border-[#28313C]/50 hover:bg-white/[0.02]">
                          <td className="py-2.5 w-6">
                            <span className={cn("flex size-5 items-center justify-center rounded-full text-[10px] font-bold border",
                              f.rank === 1 ? "border-critical/30 bg-critical/10 text-critical" :
                              f.rank === 2 ? "border-warning/30 bg-warning/10 text-warning" :
                              f.rank === 3 ? "border-[#7CC7FF]/30 bg-[#7CC7FF]/10 text-[#7CC7FF]" :
                              f.rank === 4 ? "border-[#4EA1FF]/30 bg-[#4EA1FF]/10 text-[#4EA1FF]" :
                              "border-warning/30 bg-warning/10 text-warning"
                            )}>
                              {f.rank}
                            </span>
                          </td>
                          <td className="py-2.5 font-semibold text-white whitespace-normal pr-4 leading-tight">{f.label}</td>
                          <td className="py-2.5 text-muted-foreground text-right w-10">Impact</td>
                          <td className="py-2.5 font-bold text-white tabular-nums text-right w-14">{f.impact}</td>
                          <td className="py-2.5 font-bold text-muted-foreground tabular-nums text-right w-10">{f.confidence}%</td>
                          <td className="py-2.5 font-bold text-white tabular-nums text-right w-8">{f.count}</td>
                       </tr>
                     ))}
                   </tbody>
                </table>
                <button type="button" onClick={() => onNavigate?.("savings", { source: "excel-workspace-findings" })} className="text-[10px] text-[#4EA1FF] hover:underline font-medium mt-4">
                  View all findings ({hasWorkspaceRows ? (workspace.findings || []).length : 34})
                </button>
                <div className="mt-4 rounded-lg border border-[#28313C] bg-[#080A0E] p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Workbook note</span>
                    <span className="text-[9px] font-semibold text-muted-foreground">{savedViews.length} saved view{savedViews.length === 1 ? "" : "s"}</span>
                  </div>
                  <textarea
                    rows={3}
                    value={workbookNote}
                    onChange={(event) => setWorkbookNote(event.target.value)}
                    maxLength={1000}
                    placeholder="Add review context before saving this workbook view..."
                    className="w-full resize-none rounded-md border border-[#28313C] bg-[#0E1116] px-3 py-2 text-[10px] leading-relaxed text-white outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
                  />
                </div>
             </div>

             <div className="flex flex-col gap-3 pt-6 border-t border-[#28313C] mt-4">
               <div className="flex items-center justify-between">
                 <h3 className="text-[11px] font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                   Spend leakage by category <AlertCircle className="size-3.5 text-muted-foreground" />
                 </h3>
                 <button type="button" onClick={() => onNavigate?.("savings", { source: "excel-workspace-spend-breakdown" })} className="text-[10px] text-[#4EA1FF] hover:underline flex items-center gap-1 font-medium">
                   View breakdown <ArrowRight className="size-3" />
                 </button>
               </div>

               <div className="flex flex-col gap-2 text-[9px] relative mt-2">
                 {/* Background Grid Lines for axes */}
                 <div className="absolute top-0 bottom-4 left-24 right-4 flex justify-between pointer-events-none">
                    <div className="w-px h-full bg-[#28313C]/50" />
                    <div className="w-px h-full bg-[#28313C]/50" />
                    <div className="w-px h-full bg-[#28313C]/50" />
                    <div className="w-px h-full bg-[#28313C]/50" />
                 </div>
                 {spendByCategory.map((c, i) => (
                   <div key={i} className="flex items-center gap-4 relative z-10">
                     <span className="text-muted-foreground w-20 text-right truncate font-medium">{c.category}</span>
                     <div className="flex-1 flex items-center">
                       <div className="h-2 rounded-r-sm transition-all" style={{ width: `${c.pct}%`, backgroundColor: c.color }} />
                       <span className="font-bold text-white tabular-nums ml-2 tracking-wide">${c.amount}K <span className="text-muted-foreground font-normal">({c.pct}%)</span></span>
                     </div>
                   </div>
                 ))}
                 {/* X Axis */}
                 <div className="flex items-center gap-4 mt-1 text-[8px] text-muted-foreground font-medium pl-24 pr-4">
                   <div className="flex-1 flex justify-between">
                      <span className="-ml-1">$0</span>
                      <span>$200K</span>
                      <span>$400K</span>
                      <span className="-mr-1">$600K</span>
                   </div>
                 </div>
               </div>
             </div>

             <div className="flex flex-col gap-3 pt-6 border-t border-[#28313C] mt-4">
               <div className="flex items-center justify-between">
                 <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">
                   Forecast variance trend
                 </h3>
                 <button type="button" onClick={() => onNavigate?.("diagnostics", { source: "excel-workspace-forecast-variance" })} className="text-[10px] text-[#4EA1FF] hover:underline flex items-center gap-1 font-medium">
                   View details <ArrowRight className="size-3" />
                 </button>
               </div>
               <div className="relative h-32 w-full mt-2 border-b border-[#28313C] pb-2">
                 {/* Y Axis Labels */}
                 <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[8px] text-muted-foreground z-10 font-medium tabular-nums">
                   <span>$600K</span>
                   <span>$0</span>
                   <span>-$600K</span>
                   <span>-$1.2M</span>
                 </div>

                 {/* Grid lines */}
                 <div className="absolute left-10 right-0 top-1 h-px bg-[#28313C]/50" />
                 <div className="absolute left-10 right-0 top-[33%] h-px bg-[#28313C]/50" />
                 <div className="absolute left-10 right-0 top-[66%] h-px bg-[#28313C]/50" />
                 <div className="absolute left-10 right-0 bottom-2 h-px bg-[#28313C]/50" />

                 <div className="absolute left-10 right-0 top-0 bottom-2">
                   <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                     <path d="M0,50 L10,60 L20,40 L30,45 L40,20 L50,30 L60,40 L70,35 L80,50 L90,60 L100,70" fill="none" stroke="#7CC7FF" strokeWidth="2" />
                     {/* Dots */}
                     {[0,10,20,30,40,50,60,70,80,90].map((x, i) => {
                       const y = [50, 60, 40, 45, 20, 30, 40, 35, 50, 60][i];
                       return <circle key={i} cx={x} cy={y} r="1" fill="#7CC7FF" stroke="#0E1116" strokeWidth="0.5" />;
                     })}
                   </svg>

                   {/* HTML overlay for the end point to prevent stretching */}
                   <div className="absolute" style={{ right: 0, top: '70%', transform: 'translate(50%, -50%)' }}>
                     <div className="size-2 rounded-full border-[1.5px] border-[#7CC7FF] bg-[#0E1116] shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                   </div>
                   <div className="absolute font-bold text-white text-[11px] tabular-nums tracking-wide shadow-black drop-shadow-md" style={{ right: 0, top: '70%', transform: 'translate(50%, -180%)' }}>
                     -$430K
                   </div>
                 </div>
               </div>
               {/* X Axis */}
               <div className="flex justify-between pl-10 text-[8px] text-muted-foreground font-medium uppercase tracking-widest mt-1">
                 <span>Jan &apos;26</span>
                 <span>Feb &apos;26</span>
                 <span>Mar &apos;26</span>
                 <span>Apr &apos;26</span>
                 <span>May &apos;26</span>
                 <span>Jun &apos;26</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-[3fr_2fr] gap-6 shrink-0 pb-4">
         {/* Data Connectors */}
         <div className="flex flex-col rounded-xl border border-[#28313C] bg-[#0E1116] p-5">
           <div className="flex items-center justify-between border-b border-[#28313C] pb-3 mb-4">
             <h3 className="text-[11px] font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
               Data Connectors <AlertCircle className="size-3.5 text-muted-foreground" />
             </h3>
             <button type="button" onClick={() => onNavigate?.("connectors")} className="text-[10px] text-[#4EA1FF] hover:underline font-medium">Manage connectors</button>
           </div>

           <div className="grid grid-cols-5 gap-4 h-full">
             {excelConnectors.map((c, i) => {
               const syncTimes = ["2.4s", "1.8s", "4.2s", "0.9s", "Live"];
               return (
                 <div key={i} className="flex flex-col rounded-lg border border-[#28313C]/50 bg-[#141A22]/30 p-3 h-full relative overflow-hidden group hover:border-[#28313C] transition-colors">
                   <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#28313C] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                   <div className="flex flex-col gap-3 flex-1">
                     <div className="flex items-start gap-2">
                       <div className="flex items-center justify-center size-6 rounded bg-[#0E1116] border border-[#28313C] shrink-0 mt-0.5">
                         {c.name.includes("Excel") && <FileSpreadsheet className="size-3.5 text-[#21A366]" />}
                         {c.name.includes("Google") && <FileSpreadsheet className="size-3.5 text-primary" />}
                         {c.name.includes("CRM") && <Database className="size-3.5 text-[#4EA1FF]" />}
                         {c.name.includes("Finance") && <Activity className="size-3.5 text-[#7CC7FF]" />}
                         {c.name.includes("Webhook") && <Lock className="size-3.5 text-warning" />}
                       </div>
                       <span className="text-[10px] font-semibold text-white leading-tight mt-1 line-clamp-2">{c.name}</span>
                     </div>

                     <div className="flex flex-col gap-0.5 mt-1">
                       <span className="text-[14px] font-bold text-white tabular-nums tracking-tight">{c.rows || "Streaming"}</span>
                       <span className="text-[9px] text-muted-foreground">{c.rows ? "rows synced" : "events streamed"}</span>
                     </div>

                     <div className="grid grid-cols-2 gap-2 mt-auto pt-3 border-t border-[#28313C]/50">
                        <div className="flex flex-col gap-0.5">
                           <span className="text-[8px] text-muted-foreground uppercase tracking-wider">Latency</span>
                           <span className="text-[10px] font-medium text-white tabular-nums">{syncTimes[i]}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                           <span className="text-[8px] text-muted-foreground uppercase tracking-wider">Errors</span>
                           <span className="text-[10px] font-medium text-white tabular-nums">0.00%</span>
                        </div>
                     </div>
                   </div>

                   <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#28313C]/50">
                     <div className="flex items-center gap-1.5 text-[9px] font-bold text-primary uppercase tracking-widest">
                       <span className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(33,163,102,0.5)]" /> {c.status}
                     </div>
                     <span className="text-[9px] text-muted-foreground">{c.synced}</span>
                   </div>
                 </div>
               );
             })}
           </div>
         </div>

         {/* Proof Trail */}
         <div className="flex flex-col rounded-xl border border-[#28313C] bg-[#0E1116] p-5">
           <div className="flex items-center justify-between border-b border-[#28313C] pb-3 mb-4">
             <h3 className="text-[11px] font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
               Proof Trail <span className="text-muted-foreground font-medium normal-case tracking-normal">(Latest)</span> <AlertCircle className="size-3.5 text-muted-foreground" />
             </h3>
           </div>
           <div className="flex-1 overflow-x-auto">
             <table className="w-full text-left text-[10px] whitespace-nowrap">
               <thead className="border-b border-[#28313C]">
                 <tr>
                   <th className="px-4 py-2 font-semibold text-muted-foreground">Source Row</th>
                   <th className="px-4 py-2 font-semibold text-muted-foreground">Finding</th>
                   <th className="px-4 py-2 font-semibold text-muted-foreground">Action</th>
                   <th className="px-4 py-2 font-semibold text-muted-foreground text-center">Approval</th>
                   <th className="px-4 py-2 font-semibold text-muted-foreground">Proof Link</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-[#28313C]/50">
                 {proofTrailRows.map((pt, i) => {
                   const lineageKey = proofTrailKey(pt, i);
                   const isExpanded = expandedLineageKeys.includes(lineageKey);
                   const lineage = proofLineageSummary(pt, workspace, excelRows);

                   return (
                     <Fragment key={lineageKey}>
                       <tr className="hover:bg-white/[0.02] transition-colors">
                         <td className="px-4 py-2.5 font-bold text-muted-foreground tabular-nums">
                           <div className="flex items-center gap-1.5">
                             <button
                               type="button"
                               onClick={() => handleToggleLineage(pt, i)}
                               className="flex size-3.5 items-center justify-center rounded border border-[#28313C] text-muted-foreground transition-colors hover:bg-[#28313C] hover:text-white"
                               aria-expanded={isExpanded}
                               aria-label={`${isExpanded ? "Collapse" : "Expand"} proof lineage for row ${pt.row}`}
                             >
                               {isExpanded ? <MinusSquare className="size-2.5" /> : <PlusSquare className="size-2.5" />}
                             </button>
                             {pt.row.toLocaleString()}
                           </div>
                         </td>
                         <td className="px-4 py-2.5 font-medium text-white">{pt.finding}</td>
                         <td className="px-4 py-2.5 text-muted-foreground">{pt.action}</td>
                         <td className="px-4 py-2.5 text-center"><ApprovalPill state={pt.approval} /></td>
                         <td className="px-4 py-2.5">
                           <button type="button" onClick={() => handleOpenProofTrail(pt.link)} className="flex items-center gap-1 font-medium text-[#4EA1FF] hover:underline">
                             {pt.link} <ArrowUpRight className="size-3" />
                           </button>
                         </td>
                       </tr>
                       {isExpanded && (
                         <tr className="bg-[#080A0E]">
                           <td colSpan={5} className="px-4 py-3 whitespace-normal">
                             <div className="grid gap-3 rounded-lg border border-[#28313C] bg-[#0E1116] p-3 min-[1500px]:grid-cols-[1.4fr_1fr_auto]">
                               <div className="min-w-0">
                                 <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Source lineage</p>
                                 <p className="mt-1 truncate text-[11px] font-semibold text-white">{lineage.evidenceName}</p>
                                 <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-muted-foreground">{lineage.rowDescription}</p>
                               </div>
                               <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9px]">
                                 <span className="text-muted-foreground">Status</span>
                                 <span className="font-semibold text-white">{lineage.evidenceStatus}</span>
                                 <span className="text-muted-foreground">Category</span>
                                 <span className="font-semibold text-white">{lineage.category}</span>
                                 <span className="text-muted-foreground">Owner</span>
                                 <span className="font-semibold text-white">{lineage.owner}</span>
                                 <span className="text-muted-foreground">Impact</span>
                                 <span className="font-semibold text-white">{formatMoneyShort(lineage.amount)}</span>
                                 <span className="text-muted-foreground">Confidence</span>
                                 <span className="font-semibold text-white">{lineage.confidence}%</span>
                                 <span className="text-muted-foreground">Action</span>
                                 <span className="font-semibold text-white">{lineage.actionStatus}</span>
                               </div>
                               <div className="flex flex-wrap items-start gap-2 min-[1500px]:justify-end">
                                 <button
                                   type="button"
                                   onClick={() => handleOpenProofTrail(lineage.evidenceId || pt.link)}
                                   className="rounded border border-[#28313C] bg-[#141A22] px-2 py-1 text-[9px] font-semibold text-white transition-colors hover:border-primary/40 hover:text-primary"
                                 >
                                   Evidence
                                 </button>
                                 <button
                                   type="button"
                                   onClick={() => onNavigate?.("reports", { source: "excel-lineage", proofTrailId: lineage.evidenceId || pt.link, findingId: lineage.findingId })}
                                   className="rounded border border-[#28313C] bg-[#141A22] px-2 py-1 text-[9px] font-semibold text-white transition-colors hover:border-primary/40 hover:text-primary"
                                 >
                                   Report
                                 </button>
                                 <button
                                   type="button"
                                   onClick={() => onNavigate?.("approvals", { source: "excel-lineage", actionId: lineage.actionId, evidenceId: lineage.evidenceId })}
                                   className="rounded border border-[#28313C] bg-[#141A22] px-2 py-1 text-[9px] font-semibold text-white transition-colors hover:border-primary/40 hover:text-primary"
                                 >
                                   Approval
                                 </button>
                               </div>
                             </div>
                           </td>
                         </tr>
                       )}
                     </Fragment>
                   );
                 })}
               </tbody>
             </table>
           </div>
         </div>
      </div>

      {/* Global System Status Footer */}
      <div className="flex items-center justify-between border-t border-[#28313C] bg-[#0E1116] mt-4 pt-4 shrink-0 text-[10px]">
         <div className="flex items-center gap-6">
            <span className="font-bold text-white uppercase tracking-widest flex items-center gap-2">System status</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-muted-foreground font-medium"><span className="size-1.5 rounded-full bg-primary" /> All systems operational</span>
            </div>
         </div>
         <div className="flex items-center gap-8">
            <span className="flex items-center gap-1.5 text-muted-foreground font-medium">Data pipeline <span className="text-primary font-bold">Healthy</span></span>
            <span className="flex items-center gap-1.5 text-muted-foreground font-medium">AI extraction <span className="text-primary font-bold">Healthy</span></span>
            <span className="flex items-center gap-1.5 text-muted-foreground font-medium">Agent runtime <span className="text-primary font-bold">Healthy</span></span>
            <span className="flex items-center gap-1.5 text-muted-foreground font-medium">Approval service <span className="text-primary font-bold">Healthy</span></span>
         </div>
         <div className="flex items-center gap-2 text-muted-foreground font-medium">
            Last updated: 2m ago
            <button
              type="button"
              onClick={handleRefreshWorkspace}
              disabled={busy}
              className="rounded text-muted-foreground transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Refresh workspace data"
            >
              <RefreshCw className={cn("size-3", busy && "animate-spin")} />
            </button>
         </div>
      </div>
    </div>
  );
}
