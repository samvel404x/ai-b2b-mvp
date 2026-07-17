"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRightLeft,
  Building,
  CreditCard,
  UserPlus,
  AlertCircle,
  Archive,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Database,
  FileSpreadsheet,
  GitBranch,
  HelpCircle,
  KeyRound,
  LogOut,
  MessageSquare,
  Plug,
  RefreshCw,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  User,
  X,
  LayoutDashboard,
  PanelLeft,
  PanelLeftClose,
  Zap,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { GeniusLogo } from "./logo";
import { buildSessionProfile } from "./identity-display";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "./skeleton";

import CommandCenter from "./sections/command-center";
import AiChat from "./sections/ai-chat";
import DataIntake from "./sections/data-intake";
import Diagnostics from "./sections/diagnostics";
import SavingsRadar from "./sections/savings-radar";
import Approvals from "./sections/approvals";
import ExcelWorkspace from "./sections/excel-workspace";
import Connectors from "./sections/connectors";
import AiGateway from "./sections/ai-gateway";
import TeamCrm from "./sections/team-crm";
import B2bBridge from "./sections/b2b-bridge";
import Reports from "./sections/reports";
import ProfileSection from "./profile/index";
import Support from "./sections/support";
import SettingsSection from "./sections/settings";
import CompanyIntelligence from "./sections/company-intelligence";
import { useWorkspace } from "./workspace-context";
import { AccountModals } from "./account-modals";

const sectionComponents = {
  command: CommandCenter,
  chat: AiChat,
  data: DataIntake,
  diagnostics: Diagnostics,
  savings: SavingsRadar,
  approvals: Approvals,
  excel: ExcelWorkspace,
  connectors: Connectors,
  "ai-gateway": AiGateway,
  "team-crm": TeamCrm,
  "b2b-bridge": B2bBridge,
  reports: Reports,
  company: CompanyIntelligence,
  profile: ProfileSection,
  support: Support,
};

const mainNav = [
  { id: "ai-gateway", label: "CEO AI Gateway", icon: Sparkles },
  { id: "team-crm", label: "Team Operations CRM", icon: Database },
  { id: "b2b-bridge", label: "Multi-Business OS", icon: Building },
  { id: "command", label: "Command Center", icon: LayoutDashboard },
  { id: "chat", label: "AI Chat", icon: MessageSquare },
  { id: "data", label: "Data Intake", icon: Upload },
  { id: "diagnostics", label: "Diagnostics", icon: AlertCircle },
  { id: "savings", label: "Savings Radar", icon: Target },
  { id: "approvals", label: "Approvals", icon: ShieldCheck, badge: 9 },
  { id: "excel", label: "Excel Workspace", icon: FileSpreadsheet },
  { id: "connectors", label: "Connectors", icon: Plug },
  { id: "reports", label: "Reports", icon: GitBranch },
];

const roadmapNav = [
  { label: "Contract Repository", status: "Demo" },
  { label: "Native Mobile App", status: "Demo" },
  { label: "Multi-Business OS", status: "Demo" },
  { label: "Billing", status: "Demo" },
  { label: "Marketplace Extensions", status: "Demo" },
  { label: "Autonomous Execution", status: "Locked" },
  { label: "Genius Deep", status: "Locked" },
  { label: "Genius Audit", status: "Locked" },
];

function sessionProfile(session) {
  return buildSessionProfile(session);
}

function workspaceInitial(name) {
  const cleanName = String(name || "GENIUS Workspace").trim();
  const words = cleanName.split(/\s+/).filter(Boolean);
  return (words.length > 1 ? `${words[0][0]}${words[1][0]}` : cleanName.slice(0, 2)).toUpperCase();
}

function workspaceStorageLabel(backend) {
  if (backend?.storage === "supabase") return "Supabase";
  if (backend?.storage === "local") return "Local";
  return "Store";
}

function compactSyncTime(value) {
  if (!value) return "Not synced";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not synced";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function compactSearchText(value, fallback = "Workspace item", maxLength = 96) {
  const text = String(value || "").replace(/\s+/g, " ").trim() || fallback;
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}...` : text;
}

function searchMoneyLabel(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount === 0) return "No value";
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${Math.round(amount / 1_000)}K`;
  return `$${Math.round(amount).toLocaleString()}`;
}

function compactSearchDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 24);
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

/* ── Skeleton Screens ────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-[#ffffff08] bg-[#0E1116] p-4">
      <Skeleton className="h-2.5 w-16 rounded bg-[#ffffff08]" />
      <Skeleton className="h-7 w-24 rounded bg-[#ffffff08]" />
      <Skeleton className="h-2 w-full rounded bg-[#ffffff08]" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <Skeleton className="h-2 w-2 rounded-full shrink-0" />
      <Skeleton className="h-4 flex-1 rounded bg-[#ffffff08]" />
      <Skeleton className="h-4 w-20 rounded bg-[#ffffff08]" />
    </div>
  );
}

/* ── Loading Overlay ────────────────────────────────────────────────────── */
function LoadingOverlay() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 mb-8 px-2">
          <GeniusLogo className="w-8 h-8" preload />
          <span className="text-xl font-bold tracking-tight text-foreground">GENIUS</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Evidence-backed AI Operations</span>
        </div>
      </div>
      <div className="flex w-full max-w-sm flex-col gap-3">
        <div className="grid grid-cols-3 gap-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="rounded-xl border border-[#ffffff08] bg-[#0E1116] p-4">
          <Skeleton className="mb-3 h-4 w-40 rounded bg-[#ffffff08]" />
          <div className="flex flex-col gap-2">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Loading your workspace...</p>
    </div>
  );
}

/* ── Search overlay ────────────────────────────────────────────────────── */
const screenSearchItems = [
  { key: "screen:command", category: "Screens", label: "Command Center", meta: "Executive workspace overview", id: "command" },
  { key: "screen:company", category: "Screens", label: "Company Details", meta: "Company identity, AI context, evidence rules, and guardrails", id: "company" },
  { key: "screen:ai-gateway", category: "Screens", label: "CEO AI Gateway", meta: "Executive AI reports, scenarios, and approvals", id: "ai-gateway" },
  { key: "screen:team-crm", category: "Screens", label: "Team Operations CRM", meta: "Tasks, owners, escalations, and operating cadence", id: "team-crm" },
  { key: "screen:b2b-bridge", category: "Screens", label: "Multi-Business OS", meta: "Cross-company thread, shared context, and collaboration controls", id: "b2b-bridge" },
  { key: "screen:chat", category: "Screens", label: "AI Chat / Workbench", meta: "Evidence-backed assistant", id: "chat" },
  { key: "screen:data", category: "Screens", label: "Data Intake", meta: "Upload and review business evidence", id: "data" },
  { key: "screen:diagnostics", category: "Screens", label: "Diagnostics", meta: "Business health, risks, and evidence quality", id: "diagnostics" },
  { key: "screen:savings", category: "Screens", label: "Savings Radar", meta: "Cost leakage findings and proof trails", id: "savings" },
  { key: "screen:approvals", category: "Screens", label: "Approvals", meta: "Human-in-the-loop action review", id: "approvals" },
  { key: "screen:excel", category: "Screens", label: "Excel Workspace", meta: "Spreadsheet rows, anomalies, and workspace views", id: "excel" },
  { key: "screen:connectors", category: "Screens", label: "Connectors", meta: "Connector catalog, requests, and filters", id: "connectors" },
  { key: "screen:reports", category: "Screens", label: "Reports", meta: "Board-ready reports and schedules", id: "reports" },
  { key: "screen:support", category: "Screens", label: "Support", meta: "Tickets, help center, and product support", id: "support" },
  { key: "screen:settings", category: "Actions", label: "Workspace Settings", meta: "Open the settings modal", id: "settings" },
].filter((item) => item.key);

function buildWorkspaceSearchItems(workspace = {}) {
  const findings = (workspace.findings || []).slice(0, 8).map((finding) => ({
    key: `finding:${finding.id || finding.title}`,
    category: "Findings",
    label: compactSearchText(finding.title || finding.name || finding.summary, "Workspace finding"),
    meta: [
      finding.severity || finding.category || "Risk",
      searchMoneyLabel(finding.impact),
      finding.proofTrailId || finding.evidenceId || finding.source || finding.id,
    ].filter(Boolean).join(" · "),
    id: "savings",
    context: { findingId: finding.id || null, evidenceId: finding.evidenceId || null, source: "global-search" },
  }));

  const actions = (workspace.actions || []).slice(0, 8).map((action) => ({
    key: `action:${action.id || action.title}`,
    category: "Actions",
    label: compactSearchText(action.title || action.recommendedAction || action.description, "Approval action"),
    meta: [
      action.status || "Needs review",
      searchMoneyLabel(action.impact),
      action.owner || action.agentId || "Owner pending",
    ].filter(Boolean).join(" · "),
    id: "approvals",
    context: { actionId: action.id || null, findingId: action.findingId || null, source: "global-search" },
  }));

  const evidence = (workspace.evidence || []).slice(0, 8).map((record) => ({
    key: `evidence:${record.id || record.name}`,
    category: "Evidence",
    label: compactSearchText(record.name || record.fileName || record.source, "Uploaded evidence"),
    meta: [
      record.kind || record.type || "File",
      record.status || "Uploaded",
      record.providerStatus?.status || record.extracted?.spreadsheet_parse_status || compactSearchDate(record.createdAt),
    ].filter(Boolean).join(" · "),
    id: "data",
    context: { evidenceId: record.id || null, source: "global-search" },
  }));

  const spreadsheetRows = (workspace.spendRows || []).slice(0, 8).map((row) => ({
    key: `spreadsheet-row:${row.id || `${row.vendor}:${row.date}:${row.amount}`}`,
    category: "Excel Rows",
    label: compactSearchText(row.description || row.vendor || row.category || "Spreadsheet row"),
    meta: [
      row.vendor || row.category || "Workspace row",
      searchMoneyLabel(row.amount || row.value),
      compactSearchDate(row.date || row.createdAt),
    ].filter(Boolean).join(" · "),
    id: "excel",
    context: { rowId: row.id || null, evidenceId: row.evidenceId || null, source: "global-search" },
  }));

  const reports = (workspace.reports || []).slice(0, 6).map((report) => ({
    key: `report:${report.id || report.title}`,
    category: "Reports",
    label: compactSearchText(report.title || report.name, "Workspace report"),
    meta: [
      report.status || "Draft",
      report.period || report.type || "Board-ready",
      compactSearchDate(report.generatedAt || report.createdAt || report.updatedAt),
    ].filter(Boolean).join(" · "),
    id: "reports",
    context: { reportId: report.id || null, source: "global-search" },
  }));

  const tickets = (workspace.supportTickets || []).slice(0, 5).map((ticket) => ({
    key: `support:${ticket.id || ticket.subject}`,
    category: "Support",
    label: compactSearchText(ticket.subject, "Support ticket"),
    meta: [
      ticket.status || "open",
      ticket.priority || "Medium",
      ticket.issueType || ticket.id,
    ].filter(Boolean).join(" · "),
    id: "support",
    context: { ticketId: ticket.id || null, source: "global-search" },
  }));

  const connectorRequests = (workspace.connectorRequests || []).slice(0, 5).map((request) => ({
    key: `connector-request:${request.id || request.name}`,
    category: "Connectors",
    label: compactSearchText(request.name, "Connector request"),
    meta: [
      request.status || "requested",
      request.category || "Application",
      request.statusNote || request.useCase,
    ].filter(Boolean).join(" · "),
    id: "connectors",
    context: { connectorRequestId: request.id || null, source: "global-search" },
  }));

  return [
    ...screenSearchItems,
    ...findings,
    ...actions,
    ...evidence,
    ...spreadsheetRows,
    ...reports,
    ...tickets,
    ...connectorRequests,
  ];
}

const categoryIcon = {
  Findings: Search,
  Screens: LayoutDashboard,
  Actions: Zap,
  Evidence: Upload,
  "Excel Rows": FileSpreadsheet,
  Reports: GitBranch,
  Support: HelpCircle,
  Connectors: Plug,
};

function SearchOverlay({ open, onClose, onNavigate, items = screenSearchItems }) {
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const prevOpen = useRef(open);

  useEffect(() => {
    if (open && !prevOpen.current) {
      inputRef.current?.focus();
    }
    prevOpen.current = open;
  }, [open]);

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Escape" && open) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const filtered = query
    ? items.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase()) ||
          item.meta.toLowerCase().includes(query.toLowerCase()),
      )
    : items;

  // Group by category preserving insertion order
  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg animate-scale-in rounded-2xl border border-[#28313C] bg-[#0E1116] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[#28313C] px-4 py-3.5">
          <Search className="size-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search findings, evidence, actions..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none"
          />
          <kbd className="rounded border border-[#28313C] bg-[#141A22] px-1.5 py-0.5 text-[10px] text-muted-foreground">ESC</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {Object.keys(grouped).length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">No results found</p>
          ) : (
            Object.entries(grouped).map(([cat, items]) => {
              const CatIcon = categoryIcon[cat] ?? Search;
              return (
                <div key={cat}>
                  <p className="px-3 pt-3 pb-1 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    {cat}
                  </p>
                  {items.map((item) => (
                    <button
                      key={item.key || `${item.category}:${item.id}:${item.label}`}
                      type="button"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150 hover:bg-accent"
                      onClick={() => { onClose(); onNavigate(item.id, item.context || null); }}
                    >
                      <CatIcon className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="flex-1 min-w-0">
                        <span className="block truncate text-sm text-foreground">{item.label}</span>
                        <span className="block truncate text-[11px] text-muted-foreground">{item.meta}</span>
                      </span>
                    </button>
                  ))}
                </div>
              );
            })
          )}
        </div>
        <div className="border-t border-[#28313C] px-4 py-2.5 text-center">
          <span className="text-[10px] text-muted-foreground">Press <kbd className="rounded border border-[#28313C] bg-[#141A22] px-1 py-0.5 text-[9px]">⌘K</kbd> to toggle</span>
        </div>
      </div>
    </div>
  );
}

/* ── Notification panel ────────────────────────────────────────────────── */
function notificationTone(notification) {
  if (notification.priority === "high" || notification.severity === "High") return "critical";
  if (notification.severity === "Medium" || notification.priority === "medium") return "warning";
  return "primary";
}

function notificationTime(value) {
  if (!value) return "Now";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "Now";
  }
}

function NotificationPanel({
  open,
  onClose,
  onNavigate,
  notifications = [],
  unreadCount = 0,
  busy = false,
  canUpdateNotifications = false,
  onOpenNotification,
  onUpdateNotification,
  onMarkAllRead,
}) {
  if (!open) return null;

  const typeDot = { critical: "bg-critical", warning: "bg-warning", primary: "bg-primary" };
  const visibleNotifications = notifications.filter((notification) => notification.status !== "dismissed").slice(0, 8);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full z-50 mt-3 w-[380px] animate-scale-in rounded-2xl border border-[#28313C] bg-[#0E1116] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#28313C] px-5 py-3.5">
          <span className="text-sm font-semibold text-foreground">Notifications</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={!canUpdateNotifications || busy || unreadCount === 0}
              onClick={onMarkAllRead}
              className="mr-2 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-45"
            >
              {busy ? "Updating..." : "Mark all read"}
            </button>
            <button type="button" onClick={onClose} className="text-muted-foreground transition-colors hover:text-foreground">
              <X className="size-4" />
            </button>
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto scrollbar-thin">
          {visibleNotifications.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 px-5 py-10 text-center">
              <Bell className="size-5 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">No active notifications</p>
              <p className="text-xs text-muted-foreground">Approval alerts will appear here when workspace actions need attention.</p>
            </div>
          )}
          {visibleNotifications.map((notification) => {
            const isUnread = notification.status === "queued";
            const tone = notificationTone(notification);

            return (
              <div
                key={notification.id}
                className={cn(
                  "flex gap-3 border-b border-[#28313C]/50 px-5 py-3.5 transition-colors duration-150 hover:bg-accent",
                  isUnread && "bg-accent/30",
                )}
              >
                <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", typeDot[tone])} />
                <div className="min-w-0 flex-1">
                  <button type="button" onClick={() => onOpenNotification(notification)} className="w-full text-left">
                    <p className={cn("text-sm leading-snug", isUnread ? "font-medium text-foreground" : "text-muted-foreground")}>{notification.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{notification.body}</p>
                    <span className="mt-1.5 block text-[10px] font-medium text-muted-foreground">
                      {notificationTime(notification.updatedAt || notification.createdAt)}
                    </span>
                  </button>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    type="button"
                    disabled={!canUpdateNotifications || busy}
                    onClick={() => onUpdateNotification(notification, isUnread ? "read" : "queued")}
                    className="flex size-6 items-center justify-center rounded border border-[#28313C] text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-45"
                    title={isUnread ? "Mark read" : "Mark unread"}
                  >
                    {isUnread ? <CheckCircle2 className="size-3" /> : <RotateCcw className="size-3" />}
                  </button>
                  <button
                    type="button"
                    disabled={!canUpdateNotifications || busy}
                    onClick={() => onUpdateNotification(notification, "dismissed")}
                    className="flex size-6 items-center justify-center rounded border border-[#28313C] text-muted-foreground transition-colors hover:border-critical/40 hover:text-critical disabled:cursor-not-allowed disabled:opacity-45"
                    title="Dismiss notification"
                  >
                    <Archive className="size-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="border-t border-[#28313C] px-5 py-3 text-center">
          <button type="button" onClick={() => { onClose(); onNavigate("settings"); }} className="text-xs font-medium text-primary transition-colors hover:text-primary/80">
            View all notifications
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Left Sidebar ────────────────────────────────────────────────────── */
function WorkspaceSettingsModal({ open, onClose, onNavigate }) {
  if (!open) return null;

  const handleNavigate = (section, context) => {
    if (section !== "settings" && section !== "workspace-settings") onClose();
    onNavigate?.(section, context);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/82 p-2 backdrop-blur-md sm:p-3">
      <div className="flex h-[calc(100dvh-24px)] w-[calc(100vw-24px)] max-w-[1840px] flex-col overflow-hidden rounded-2xl border border-[#4EA1FF]/25 bg-[#0E1116] shadow-[0_0_0_1px_rgba(78,161,255,0.08),0_34px_110px_rgba(0,0,0,0.74),0_0_80px_rgba(78,161,255,0.12)]">
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#28313C] bg-[linear-gradient(180deg,#0E1116,#080A0E)] px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <Settings className="size-4" />
              </span>
              <h2 className="truncate text-base font-bold text-white">Workspace Settings</h2>
            </div>
            <p className="mt-1 hidden text-[11px] text-muted-foreground sm:block">
              Security, members, AI, guardrails, billing, workspace preferences, and profile controls.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#28313C] bg-[#0E1116] text-muted-foreground transition-colors hover:border-critical/40 hover:bg-critical/10 hover:text-critical"
            aria-label="Close workspace settings"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <SettingsSection onNavigate={handleNavigate} />
        </div>
      </div>
    </div>
  );
}

function LeftSidebar({ active, onNavigate, collapsed, setCollapsed, onLockedAction, setActiveModal, session, currentWorkspace, backend, can }) {
  const profile = sessionProfile(session);
  const canManageMembers = can?.("manage_members");
  const [roadmapOpen, setRoadmapOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const workspaceName = currentWorkspace?.workspaceName || "GENIUS Workspace";
  const workspaceRole = session?.role || currentWorkspace?.role || "Member";
  const workspaceInitials = workspaceInitial(workspaceName);
  const workspaceMeta = `${workspaceRole} · ${workspaceStorageLabel(backend)}${session?.isGuest ? " · Guest" : ""}`;

  return (
    <aside
      className={cn(
        "shrink-0 border-r border-sidebar-border bg-[#080A0E] transition-all duration-200 ease-in-out flex flex-col h-full",
        collapsed ? "w-16" : "w-[208px] 2xl:w-[240px]",
      )}
    >
      {/* Brand */}
      <div className="flex flex-col gap-4 px-4 py-6 pb-2">
        <Link href="/" className="flex items-center gap-3 overflow-hidden hover:opacity-80 transition-opacity">
          <GeniusLogo className="size-9 shrink-0" preload />
          {!collapsed && (
            <span className="text-xl font-bold tracking-tight text-white">GENIUS.</span>
          )}
        </Link>
        {!collapsed && (
          <div className="flex flex-col gap-1.5 mt-2">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">WORKSPACE</span>
            <DropdownMenu onOpenChange={setWorkspaceOpen}>
              <DropdownMenuTrigger className="flex w-full items-center justify-between rounded border border-[#28313C] bg-[#0E1116] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[#141A22] outline-none">
                <div className="flex items-center gap-2">
                  <div className="flex size-4 items-center justify-center rounded bg-primary/20 text-[9px] font-bold text-primary">{workspaceInitials.slice(0, 2)}</div>
                  <span className="truncate max-w-[110px]">{workspaceName}</span>
                </div>
                <ChevronDown className={cn("size-3 text-muted-foreground shrink-0 transition-transform duration-200", workspaceOpen ? "rotate-180" : "rotate-0")} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[208px] 2xl:w-[240px] bg-[#0E1116] border-[#28313C] text-white p-1">
                <DropdownMenuLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 py-1.5">
                  Current Workspace
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onNavigate("command")} className="flex items-center justify-between text-xs cursor-pointer rounded-md focus:bg-white/5 focus:text-white px-2 py-1.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex size-5 shrink-0 items-center justify-center rounded bg-primary/20 text-[9px] font-bold text-primary">{workspaceInitials.slice(0, 2)}</div>
                    <span className="min-w-0">
                      <span className="block truncate max-w-[130px]">{workspaceName}</span>
                      <span className="block truncate max-w-[130px] text-[10px] text-muted-foreground">{workspaceMeta}</span>
                    </span>
                  </div>
                  <CheckCircle2 className="size-3 text-primary" />
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#28313C] my-1" />
                <DropdownMenuItem onClick={() => setActiveModal("account-switcher")} className="flex items-center gap-2 text-xs cursor-pointer rounded-md focus:bg-white/5 focus:text-white px-2 py-1.5">
                  <Plus className="size-3.5 text-muted-foreground" />
                  Manage workspaces
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate("settings")} className="flex items-center gap-2 text-xs cursor-pointer rounded-md focus:bg-white/5 focus:text-white px-2 py-1.5">
                  <Settings className="size-3.5 text-muted-foreground" />
                  Workspace Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-none px-3 py-2 flex flex-col gap-0.5">
        {mainNav.map((item) => {
          const isActive = active === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 group",
                isActive
                  ? "bg-transparent text-primary"
                  : "text-muted-foreground hover:bg-white/5 hover:text-white",
                collapsed && "justify-center px-1.5 py-2.5",
              )}
              title={collapsed ? item.label : undefined}
            >
              {isActive && !collapsed && (
                <div className="absolute inset-0 rounded-lg border border-primary/30 bg-primary/10" />
              )}
              {isActive && collapsed && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-r-full bg-primary" />
              )}
              <Icon className={cn("relative z-10 size-[18px] shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-white")} strokeWidth={1.5} />
              {!collapsed && (
                <span className="relative z-10 truncate">{item.label}</span>
              )}
              {item.badge && !collapsed && (
                <span className="relative z-10 ml-auto flex size-4 items-center justify-center rounded-full bg-critical text-[9px] font-bold text-white shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {!collapsed && (
          <div className="mt-6 flex flex-col gap-1.5 px-3">
            <button onClick={() => setRoadmapOpen(!roadmapOpen)} className="flex items-center justify-between mb-1 group w-full outline-none">
              <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground group-hover:text-white transition-colors">ROADMAP & FUTURE</span>
              <ChevronDown className={cn("size-3 text-muted-foreground transition-transform duration-200", roadmapOpen ? "rotate-180" : "rotate-0")} />
            </button>
            <div className={cn("flex flex-col gap-1.5 overflow-hidden transition-all duration-300", roadmapOpen ? "max-h-[500px] opacity-100 mt-1" : "max-h-0 opacity-0")}>
              {roadmapNav.map(item => (
                <div key={item.label} className="flex items-center justify-between py-1.5">
                  <span className="flex items-center gap-2 text-[11px] text-muted-foreground/60">
                    <div className="size-3.5 rounded-full border border-[#28313C] shrink-0" />
                    {item.label}
                  </span>
                  <span className={cn(
                    "rounded border px-1.5 py-0.5 text-[8.5px] font-bold tracking-wide uppercase",
                    item.status === "Demo" ? "border-primary/30 bg-primary/10 text-primary" : "border-[#28313C] bg-[#141A22] text-muted-foreground/60"
                  )}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Bottom section */}
      {!collapsed && (
        <div className="mt-auto flex flex-col gap-4 border-t border-[#28313C] px-4 py-4">
          <DropdownMenu onOpenChange={setProfileOpen}>
            <DropdownMenuTrigger className="w-full text-left flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/5 cursor-pointer border border-transparent hover:border-[#28313C] outline-none">
              <Avatar className="size-8 ring-1 ring-[#28313C]">
                <AvatarFallback className="bg-[#141A22] text-[10px] font-bold text-white">{profile.initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-bold text-white truncate">{profile.name}</span>
                <span className="text-[9px] text-muted-foreground">{profile.role}</span>
              </div>
              <ChevronUp className={cn("ml-auto size-3 text-muted-foreground transition-transform duration-200", profileOpen ? "rotate-180" : "rotate-0")} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[240px] bg-[#0E1116] border-[#28313C] text-muted-foreground p-2">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">My Account</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onNavigate("profile")} className="text-xs hover:text-white cursor-pointer rounded-md focus:bg-white/5 focus:text-white">
                  <User className="mr-2 size-3.5" /> Profile settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate("settings")} className="text-xs hover:text-white cursor-pointer rounded-md focus:bg-white/5 focus:text-white">
                  <Settings className="mr-2 size-3.5" /> Workspace preferences
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-[#28313C] my-1" />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 mt-1">Organization</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onNavigate("company")} className="text-xs hover:text-white cursor-pointer rounded-md focus:bg-white/5 focus:text-white">
                  <Building className="mr-2 size-3.5" /> Company details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveModal("billing")} className="text-xs hover:text-white cursor-pointer rounded-md focus:bg-white/5 focus:text-white">
                  <CreditCard className="mr-2 size-3.5" /> Billing & plans
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => (canManageMembers ? setActiveModal("invite-team") : onLockedAction("Team invites"))}
                  className={cn(
                    "text-xs hover:text-white cursor-pointer rounded-md focus:bg-white/5 focus:text-white",
                    canManageMembers ? "text-primary focus:text-primary" : "text-muted-foreground/60 focus:text-muted-foreground/60",
                  )}
                >
                  <UserPlus className="mr-2 size-3.5" /> Invite team
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-[#28313C] my-1" />
              <DropdownMenuItem onClick={() => setActiveModal("account-switcher")} className="text-xs hover:text-white cursor-pointer rounded-md focus:bg-white/5 focus:text-white">
                <ArrowRightLeft className="mr-2 size-3.5" /> Change account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = "/login"} className="text-xs hover:text-white cursor-pointer rounded-md focus:bg-white/5 focus:text-white mt-1">
                <Plus className="mr-2 size-3.5" /> Add account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveModal("logout")} className="text-xs text-critical hover:text-critical cursor-pointer rounded-md focus:bg-critical/10 focus:text-critical mt-1">
                <LogOut className="mr-2 size-3.5" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </aside>
  );
}

/* ── Screen metadata ────────────────────────────────────────────────────── */
const screenMeta = {
  command:     { title: 'Command Center',         subtitle: 'Evidence-backed operations. Real-time insights. Approval-first execution.' },
  company:     { title: 'Company Details',        subtitle: 'Company identity, AI context, evidence rules, guardrails, and operating baselines.' },
  chat:        { title: 'AI Chat / Workbench',    subtitle: 'Ask questions. Get evidence-backed answers. Approval-first AI.' },
  data:        { title: 'Data Intake',            subtitle: 'Upload, connect, and review business evidence before it impacts metrics.' },
  diagnostics: { title: 'Diagnostics',            subtitle: 'Understand business health, surface risks, and take action with evidence.' },
  savings:     { title: 'Savings Radar',          subtitle: 'Track every cost reduction opportunity with AI confidence and source proof.' },
  approvals:   { title: 'Approvals',              subtitle: 'Human-in-the-loop decision management. Review, approve, delegate, or reject.' },
  excel:       { title: 'Excel Workspace',        subtitle: 'AI-powered spreadsheet analysis. Anomaly detection and proof trails.' },
  connectors:  { title: 'Connectors',             subtitle: 'Connect your data sources. Live sync status and health monitoring.' },
  'ai-gateway':{ title: 'CEO AI Gateway',         subtitle: 'Executive-level operational intelligence. Approve and delegate with confidence.' },
  'team-crm':  { title: 'Team Operations CRM',   subtitle: 'Manager-level task board. Log, assign, and escalate operational items.' },
  'b2b-bridge':{ title: 'Multi-Business OS',      subtitle: 'Secure cross-company collaboration. Encrypted channels with AI oversight.' },
  reports:     { title: 'Reports',                subtitle: 'AI-generated board-ready reports. Proof-backed findings and executive summaries.' },
  profile:     { title: 'My Profile',             subtitle: 'Manage your account, preferences, and security settings.' },
  support:     { title: 'Support & Help Center',  subtitle: 'Documentation, FAQs, and live support for your workspace.' },
};

/* ── Main App Shell ────────────────────────────────────────────────────── */
export default function AppShell() {
  const { workspace: currentWorkspace, session, backend, signOut, loadWorkspace, can, busy, notifications, updateNotificationStatus } = useWorkspace();
  const [active, setActive] = useState("command");
  const [focusContext, setFocusContext] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const navRef = useRef(null);
  const ActiveSection = sectionComponents[active] || CommandCenter;
  const profile = sessionProfile(session);
  const canManageMembers = can("manage_members");
  const canUpdateNotifications = can("update_notifications");
  const unreadNotificationCount = (notifications || []).filter((notification) => notification.status === "queued").length;
  const workspaceSearchItems = useMemo(() => buildWorkspaceSearchItems(currentWorkspace), [currentWorkspace]);

  const toggleSearch = useCallback(() => setSearchOpen((p) => !p), []);
  const handleLockedAction = useCallback((label) => {
    toast.info(`${label} requires a higher workspace role or a production integration.`);
  }, []);
  const handleInviteTeam = useCallback(() => {
    if (!canManageMembers) {
      toast.error("Team invites require Owner or Admin access.");
      return;
    }
    setActiveModal("invite-team");
  }, [canManageMembers]);
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.warn("Sign out API failed, forcing redirect.");
      window.location.href = "/login";
    }
  }, [signOut]);
  const handleRefreshWorkspace = useCallback(async () => {
    try {
      await loadWorkspace({ silent: true });
      toast.success("Workspace refreshed");
    } catch (error) {
      toast.error(error.message || "Workspace refresh failed.");
    }
  }, [loadWorkspace]);
  const handleNavigate = useCallback((section, context = null) => {
    if (!section) return;

    if (section === "settings" || section === "workspace-settings") {
      setActiveModal("workspace-settings");
      setFocusContext(null);
      return;
    }

    setActive(section);
    if (context && typeof context === "object" && Object.keys(context).length) {
      setFocusContext({
        ...context,
        section,
        token: `${section}:${Date.now()}`,
      });
      return;
    }

    setFocusContext(null);
  }, []);

  const handleUpdateNotification = useCallback(async (notification, status) => {
    if (!notification?.id) return;

    try {
      await updateNotificationStatus({ id: notification.id, status });
      toast.success(status === "dismissed" ? "Notification dismissed" : "Notification updated");
    } catch (error) {
      toast.error(error.message || "Notification update failed.");
    }
  }, [updateNotificationStatus]);

  const handleMarkAllNotificationsRead = useCallback(async () => {
    try {
      await updateNotificationStatus({ status: "read", all: true });
      toast.success("Notifications marked read");
    } catch (error) {
      toast.error(error.message || "Notification update failed.");
    }
  }, [updateNotificationStatus]);

  const handleOpenNotification = useCallback(async (notification) => {
    if (!notification) return;

    if (notification.status === "queued" && canUpdateNotifications) {
      try {
        await updateNotificationStatus({ id: notification.id, status: "read" });
      } catch (error) {
        toast.error(error.message || "Notification update failed.");
      }
    }

    setNotifOpen(false);
    handleNavigate(notification.actionId ? "approvals" : notification.findingId ? "savings" : "command", {
      actionId: notification.actionId || null,
      findingId: notification.findingId || null,
      source: "notification",
    });
  }, [canUpdateNotifications, handleNavigate, updateNotificationStatus]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const providerLabel = backend?.aiProvider || "Gemini";
  const providerStatus = backend?.geminiConfigured ? "Configured" : "Local fallback";
  const storageLabel = workspaceStorageLabel(backend);
  const connectorCatalogCount = currentWorkspace?.connectors?.length || 0;
  const liveEventCount = currentWorkspace?.liveEvents?.length || 0;
  const connectorLabel = active === "data" || active === "diagnostics" ? "Live events" : "Connectors";
  const connectorValue = active === "data" || active === "diagnostics"
    ? `${liveEventCount} synced`
    : connectorCatalogCount ? `${connectorCatalogCount} catalog` : "Locked";
  const dataQualityScore = Math.round(Number(
    currentWorkspace?.diagnostics?.dataQualityScore
    || currentWorkspace?.diagnostics?.overallScore
    || 0,
  ));
  const dataQualityLabel = dataQualityScore ? `${dataQualityScore}%` : "Needs data";
  const lastSyncLabel = compactSyncTime(currentWorkspace?.updatedAt);

  return (
    <div className="workspace-shell flex h-screen flex-col overflow-hidden bg-background">
      {/* ── Top Header ──────────────────────────────────────────── */}
      <header className="flex h-[72px] shrink-0 items-center justify-between gap-3 border-b border-[#28313C] bg-[#080A0E] px-3 sm:px-4 xl:px-6 2xl:px-8 shadow-[0_1px_0_rgba(78,161,255,0.14)]">
        {/* Page Title Left */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#28313C] bg-[#141A22] text-muted-foreground transition-colors hover:text-white 2xl:hidden"
            aria-label="Open workspace navigation"
          >
            <PanelLeft className="size-4" />
          </button>
          <div className="flex min-w-0 flex-col justify-center">
            <h1 className="truncate text-base font-bold text-white sm:text-lg 2xl:text-xl">
              {screenMeta[active]?.title ?? active}
            </h1>
            <p className="mt-0.5 hidden truncate text-[10px] text-muted-foreground sm:block">
              {screenMeta[active]?.subtitle ?? ""}
            </p>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3 2xl:gap-4">
          
          {/* Status Pills */}
          <div className="hidden 2xl:flex items-center gap-4 mr-2">
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded bg-[#28313C]/50 border border-[#28313C]">
                <Sparkles className="size-3.5 text-[#4EA1FF]" fill="currentColor" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Provider</span>
                <span className="text-[11px] font-semibold text-white">{providerLabel} · {providerStatus}</span>
              </div>
            </div>
            <div className="h-6 w-px bg-[#28313C]" />
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded bg-[#28313C]/50 border border-[#28313C]">
                <Database className="size-3.5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Storage</span>
                <span className="text-[11px] font-semibold text-white">{storageLabel}</span>
              </div>
            </div>
            <div className="h-6 w-px bg-[#28313C]" />
            <div className="flex items-center gap-2">
              {(active === "data" || active === "diagnostics") && (
                <div className="flex size-6 items-center justify-center rounded bg-[#28313C]/50 border border-[#28313C]">
                  <KeyRound className="size-3.5 text-primary" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
                  {connectorLabel}
                </span>
                <span className="text-[11px] font-semibold text-white">
                  {connectorValue}
                </span>
              </div>
            </div>
            <div className="h-6 w-px bg-[#28313C]" />
            <div className="flex items-center gap-2">
              {(active === "data" || active === "diagnostics") && (
                <div className="flex size-6 items-center justify-center rounded bg-[#28313C]/50 border border-[#28313C]">
                  <ShieldCheck className="size-3.5 text-primary" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Data quality</span>
                <span className={cn("text-[11px] font-semibold text-white", (active === "data" || active === "diagnostics") && "text-primary")}>
                  {dataQualityLabel}
                </span>
              </div>
            </div>
            <div className="h-6 w-px bg-[#28313C]" />
            <div className="flex flex-col">
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Last sync</span>
              <span className="text-[11px] font-semibold text-white">{lastSyncLabel}</span>
            </div>
            <button type="button" onClick={handleRefreshWorkspace} className="flex size-6 items-center justify-center rounded border border-[#28313C] hover:bg-[#141A22] transition-colors ml-2">
              <RefreshCw className="size-3 text-muted-foreground" />
            </button>
          </div>

          {/* Search */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-8 items-center gap-2 rounded-full border border-[#28313C] bg-[#141A22] px-3 text-xs text-muted-foreground transition-colors hover:border-[#28313C] hover:text-white"
          >
            <Search className="size-3.5" />
            <span className="hidden w-32 text-left xl:inline 2xl:w-40">Search anything...</span>
            <kbd className="hidden rounded bg-[#28313C] px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground 2xl:inline">Ctrl K</kbd>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative flex size-8 items-center justify-center rounded-full border border-[#28313C] bg-[#141A22] text-muted-foreground transition-colors hover:bg-[#28313C] hover:text-white"
            >
              <Bell className="size-3.5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-critical text-[8px] font-bold text-white shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                  {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                </span>
              )}
            </button>
            <NotificationPanel
              open={notifOpen}
              onClose={() => setNotifOpen(false)}
              onNavigate={handleNavigate}
              notifications={notifications}
              unreadCount={unreadNotificationCount}
              busy={busy}
              canUpdateNotifications={canUpdateNotifications}
              onOpenNotification={handleOpenNotification}
              onUpdateNotification={handleUpdateNotification}
              onMarkAllRead={handleMarkAllNotificationsRead}
            />
          </div>

          {/* Sidebar toggle */}
          <button
            type="button"
            className="hidden 2xl:flex size-8 items-center justify-center rounded-full border border-[#28313C] bg-[#141A22] text-muted-foreground transition-colors hover:bg-[#28313C] hover:text-white"
            onClick={() => setSidebarCollapsed((c) => !c)}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <PanelLeft className="size-3.5" /> : <PanelLeftClose className="size-3.5" />}
          </button>

          {/* Help */}
          <button
            type="button"
            className="hidden sm:flex size-8 items-center justify-center rounded-full border border-[#28313C] bg-[#141A22] text-muted-foreground transition-colors hover:bg-[#28313C] hover:text-white"
            onClick={() => handleNavigate("support")}
          >
            <HelpCircle className="size-3.5" />
          </button>

          {/* Workspace settings */}
          <button
            type="button"
            className="hidden sm:flex size-8 items-center justify-center rounded-full border border-[#28313C] bg-[#141A22] text-muted-foreground transition-colors hover:bg-[#28313C] hover:text-white"
            onClick={() => setActiveModal("workspace-settings")}
            title="Workspace settings"
          >
            <Settings className="size-3.5" />
          </button>



          <div className="hidden h-6 w-px bg-[#28313C] 2xl:block" />

          {/* Date Picker & Auto Refresh */}
          <div className="hidden items-center gap-3 pl-2 2xl:flex">
            <button type="button" onClick={() => handleLockedAction("Date range selection")} className="flex h-8 items-center gap-2 rounded border border-[#28313C] bg-[#0E1116] px-3 text-[11px] text-muted-foreground transition-colors hover:bg-[#141A22]">
              <Calendar className="size-3.5" />
              Jun 19 - Jun 26, 2026
              <ChevronDown className="size-3 ml-1" />
            </button>
            <div className="flex items-center gap-2 pr-2">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-1.5 animate-ping rounded-full bg-primary opacity-50" />
                <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
              </span>
              <span className="text-[11px] font-medium text-white">Auto-refresh</span>
              <RefreshCw className="size-3.5 text-muted-foreground ml-1" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm 2xl:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute left-0 top-[72px] h-[calc(100dvh-72px)] w-[min(288px,88vw)] bg-sidebar border-r border-border animate-slide-in">
            <LeftSidebar
              active={active}
              onNavigate={(id, context) => { handleNavigate(id, context); setMobileMenuOpen(false); }}
              collapsed={false}
              setCollapsed={() => {}}
              onLockedAction={handleLockedAction}
              setActiveModal={setActiveModal}
              session={session}
              currentWorkspace={currentWorkspace}
              backend={backend}
              can={can}
            />
          </div>
        </div>
      )}

      {/* ── Body: Sidebar + Content ──────────────────────────────── */}
      <div className="flex flex-1 min-h-0">
        {/* Desktop sidebar */}
        <div className="hidden 2xl:block">
          <LeftSidebar
            active={active}
            onNavigate={handleNavigate}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
            onLockedAction={handleLockedAction}
            setActiveModal={setActiveModal}
            session={session}
            currentWorkspace={currentWorkspace}
            backend={backend}
            can={can}
          />
        </div>

        {/* Main content area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#080A0E]">
          {/* Content */}
          <div
            className={cn(
              "workspace-scroll flex-1 min-h-0",
              active !== "b2b-bridge"
                ? "overflow-auto scrollbar-thin"
                : "flex flex-col overflow-hidden",
            )}
          >
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <LoadingOverlay />
              </div>
            ) : (
              <div
                key={active}
                className={cn(
                  "w-full animate-enter flex-1 flex flex-col min-h-0",
                  active !== "b2b-bridge"
                    ? "workspace-canvas px-3 py-3 sm:px-4 sm:py-4 xl:px-5 xl:py-5 2xl:px-6 2xl:py-6"
                    : "min-w-0",
                )}
              >
                <ActiveSection
                  label={mainNav.find((n) => n.id === active)?.label || active.charAt(0).toUpperCase() + active.slice(1)}
                  onNavigate={handleNavigate}
                  focusContext={focusContext?.section === active ? focusContext : null}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Search overlay ──────────────────────────────────────── */}
      <SearchOverlay open={searchOpen} onClose={toggleSearch} onNavigate={handleNavigate} items={workspaceSearchItems} />
      <WorkspaceSettingsModal
        open={activeModal === "workspace-settings"}
        onClose={() => setActiveModal(null)}
        onNavigate={handleNavigate}
      />
      <AccountModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        onSignOut={handleSignOut}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
