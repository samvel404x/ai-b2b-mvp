"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle, ArrowRight, Bell, Building, Briefcase, Calendar, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight,
  Clock, Cloud, Code2, Copy, CreditCard, Database, Download, ExternalLink, FileSpreadsheet, FileText, Fingerprint, GitBranch, Globe,
  Grid, HelpCircle, History, Info, Key, KeyRound, Laptop, LayoutDashboard, Link as LinkIcon, Lock,
  Mail, MapPin, MessageSquare, MonitorSmartphone, MoreHorizontal, Network, Palette, Plug, Plus, RefreshCw, Search, Settings,
  Shield, ShieldAlert, ShieldCheck, Sparkles, Star, Target, Timer, User, UserCheck, Users, UserPlus, Zap, Filter, Bot, X, Play, Share2, Trash2, Activity, BadgeDollarSign, Flame, Speaker, LineChart, Pencil, Moon, Wallet, TrendingUp, Bookmark, Headphones, PieChart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Ring } from "../shared";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/components/genius/workspace-context";
import {
  memberActionLabel,
  memberPrimaryLabel,
  memberSecondaryLabel,
  sessionIdentityLabel,
  sessionMaskedIdentifier,
} from "@/components/genius/identity-display";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- Custom Toggle Component ---
function CustomToggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
        checked ? "bg-primary" : "bg-[#28313C]",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  );
}

// --- Mock Data ---

const settingsKpis = [
  { id: "sec", label: "ACCOUNT SECURITY", value: "98%", sub1: "Excellent", sub2: "No issues", tone: "primary", ring: 98, ringText: "98%" },
  { id: "health", label: "WORKSPACE HEALTH", value: "96%", sub1: "Healthy", sub2: "All systems good", tone: "primary", ring: 96, ringText: "96%" },
  { id: "provider", label: "PROVIDER STATUS", value: "Ready", sub1: "Gemini 1.5 Pro", sub2: "Supabase Connected", tone: "info", ring: 100, icon: Zap },
  { id: "storage", label: "STORAGE USAGE", value: "148 GB / 500 GB", sub1: "29% used", sub2: "352 GB available", tone: "muted", ring: 29, icon: Database },
  { id: "retention", label: "DATA RETENTION", value: "180 days", sub1: "Active policy", sub2: "Auto purge enabled", tone: "primary", ring: 100, icon: Shield },
  { id: "connectors", label: "ACTIVE CONNECTORS", value: "12 / 20", sub1: "Healthy", sub2: "2 warnings", tone: "primary", ring: 60, icon: Network },
  { id: "guardrails", label: "AGENT GUARDRAILS", value: "Strict", sub1: "Enforced", sub2: "All agents", tone: "primary", ring: 100, icon: ShieldCheck },
  { id: "locked", label: "LOCKED MODES", value: "3", sub1: "Locked", sub2: "See details", tone: "warning", ring: 100, icon: Lock },
];

const accountKpis = [
  { id: "completion", label: "ACCOUNT COMPLETION", value: "86%", sub1: "Almost there", sub2: "Review checklist \u2192", tone: "primary", ring: 86, ringText: "86%" },
  { id: "sec_score", label: "SECURITY SCORE", value: "92", sub1: "Excellent", sub2: "View details \u2192", tone: "primary", ring: 92, ringText: "92" },
  { id: "sessions", label: "ACTIVE SESSIONS", value: "3", sub1: "Across 2 devices", sub2: "Manage sessions \u2192", tone: "primary", ring: 100, icon: User },
  { id: "linked", label: "LINKED ACCOUNTS", value: "4", sub1: "Google, Microsoft, SSO", sub2: "Manage accounts \u2192", tone: "warning", ring: 100, icon: Cloud },
  { id: "tokens", label: "API TOKENS", value: "5", sub1: "2 expiring soon", sub2: "Manage tokens \u2192", tone: "warning", ring: 100, icon: KeyRound },
  { id: "protection", label: "LOGIN PROTECTION", value: "All good", sub1: "MFA + Device trust", sub2: "Manage security \u2192", tone: "primary", ring: 100, ringText: "100%" },
];

const recentActivity = [
  { id: 1, time: "May 24, 2026 10:42 AM", event: "Sign in", details: "Successful sign-in from Chrome on macOS", ip: "76.12.45.23", location: "New York, USA", icon: CheckCircle2 },
  { id: 2, time: "May 24, 2026 10:38 AM", event: "MFA verified", details: "Two-factor authentication completed", ip: "76.12.45.23", location: "New York, USA", icon: ShieldCheck },
  { id: 3, time: "May 24, 2026 10:25 AM", event: "Password changed", details: "Password was changed successfully", ip: "76.12.45.23", location: "New York, USA", icon: KeyRound },
  { id: 4, time: "May 23, 2026 9:18 PM", event: "API token created", details: "Created token \"Finance ETL Integrator\"", ip: "76.12.45.23", location: "New York, USA", icon: Plus },
  { id: 5, time: "May 23, 2026 8:46 PM", event: "New device trusted", details: "MacBook Pro - Chrome on macOS", ip: "76.12.45.23", location: "New York, USA", icon: Shield },
  { id: 6, time: "May 22, 2026 11:19 PM", event: "Sign in", details: "Successful sign-in from Chrome on Windows", ip: "76.12.45.19", location: "Boston, USA", icon: CheckCircle2 },
  { id: 7, time: "May 22, 2026 09:12 AM", event: "MFA verified", details: "Two-factor authentication completed", ip: "76.12.45.19", location: "Boston, USA", icon: ShieldCheck },
  { id: 8, time: "May 21, 2026 04:30 PM", event: "Sign in", details: "Successful sign-in from Safari on iOS", ip: "172.56.21.99", location: "Chicago, USA", icon: CheckCircle2 },
  { id: 9, time: "May 20, 2026 01:15 PM", event: "API token created", details: "Created token \"Salesforce Sync\"", ip: "76.12.45.23", location: "New York, USA", icon: Plus },
  { id: 10, time: "May 19, 2026 10:05 AM", event: "Sign in", details: "Successful sign-in from Chrome on macOS", ip: "76.12.45.23", location: "New York, USA", icon: CheckCircle2 },
  { id: 11, time: "May 18, 2026 08:45 AM", event: "Password changed", details: "Password was changed successfully", ip: "76.12.45.23", location: "New York, USA", icon: KeyRound },
  { id: 12, time: "May 17, 2026 11:20 PM", event: "New device trusted", details: "iPhone 15 Pro - Safari", ip: "172.56.21.99", location: "Chicago, USA", icon: Shield },
  { id: 13, time: "May 16, 2026 02:30 PM", event: "Sign in", details: "Successful sign-in from Firefox on Linux", ip: "104.28.19.45", location: "London, UK", icon: CheckCircle2 },
  { id: 14, time: "May 15, 2026 09:10 AM", event: "MFA verified", details: "Two-factor authentication completed", ip: "104.28.19.45", location: "London, UK", icon: ShieldCheck },
  { id: 15, time: "May 14, 2026 03:45 PM", event: "Sign in", details: "Successful sign-in from Chrome on Windows", ip: "76.12.45.19", location: "Boston, USA", icon: CheckCircle2 },
  { id: 16, time: "May 13, 2026 10:20 AM", event: "API token created", details: "Created token \"Jenkins CI\"", ip: "76.12.45.23", location: "New York, USA", icon: Plus },
  { id: 17, time: "May 12, 2026 01:15 PM", event: "Sign in", details: "Successful sign-in from Chrome on macOS", ip: "76.12.45.23", location: "New York, USA", icon: CheckCircle2 },
  { id: 18, time: "May 11, 2026 08:30 AM", event: "MFA verified", details: "Two-factor authentication completed", ip: "76.12.45.23", location: "New York, USA", icon: ShieldCheck },
];

const recentSignIns = [
  { id: 1, time: "May 24, 2026 10:42 AM", browser: "Chrome on macOS", location: "New York, USA", status: "This device" },
  { id: 2, time: "May 24, 2026 10:05 AM", browser: "Chrome on Windows", location: "New York, USA", status: "Successful" },
  { id: 3, time: "May 23, 2026 7:38 PM", browser: "Safari on iPhone", location: "New York, USA", status: "Successful" },
  { id: 4, time: "May 23, 2026 7:02 AM", browser: "Chrome on Windows", location: "Boston, USA", status: "Successful" },
  { id: 5, time: "May 22, 2026 11:19 PM", browser: "Chrome on macOS", location: "New York, USA", status: "Successful" },
];

const workspaceKpis = [
  { id: "health", label: "HEALTH SCORE", value: "93%", sub1: "Excellent", sub2: "All critical systems operational", tone: "primary", ring: 93, ringText: "93%" },
  { id: "teams", label: "ACTIVE TEAMS", value: "7", sub1: "Across 5 business units", sub2: "Manage teams \u2192", tone: "primary", ring: 100, icon: User },
  { id: "cost_centers", label: "COST CENTERS MAPPED", value: "1,248 / 1,270", sub1: "Transactions mapped", sub2: "View mapping \u2192", tone: "primary", ring: 98, ringText: "98%" },
  { id: "spend", label: "SPEND COVERAGE", value: "$86.7M / $94.2M", sub1: "Potential tail not mapped", sub2: "Improve coverage \u2192", tone: "warning", ring: 92, ringText: "92%" },
  { id: "region", label: "DEFAULT REGION", value: "US East (N. Virginia)", sub1: "Primary data region", sub2: "Change region \u2192", tone: "muted", ring: 100, icon: Cloud },
  { id: "residency", label: "DATA RESIDENCY", value: "Enforced", sub1: "All policies compliant", sub2: "View governance \u2192", tone: "primary", ring: 100, icon: ShieldCheck },
];

const workspaceActivity = [
  { id: 1, time: "May 24, 2026 10:42 AM", user: "Alex Rivera", action: "Updated", actionTone: "info", resource: "Cost center mapping", details: "+23 cost centers mapped", impact: "Positive" },
  { id: 2, time: "May 24, 2026 9:51 AM", user: "Sarah Chen", action: "Created", actionTone: "primary", resource: 'New business unit "Data & Infra"', details: "Added under Technology", impact: "Positive" },
  { id: 3, time: "May 24, 2026 8:21 AM", user: "Daniel Tran", action: "Changed", actionTone: "warning", resource: "Default region", details: "US East (N. Virginia)", impact: "Neutral" },
  { id: 4, time: "May 24, 2026 6:03 AM", user: "Priya Nair", action: "Updated", actionTone: "info", resource: "Fiscal calendar", details: "FY start changed to Jan 1", impact: "Neutral" },
  { id: 5, time: "May 23, 2026 3:17 PM", user: "Alex Rivera", action: "Enabled", actionTone: "primary", resource: "Data residency lock", details: "Enforced in-region processing", impact: "Positive" },
];

const authKpis = [
  { id: "sso", label: "SSO COVERAGE", value: "87%", sub1: "104 / 120 users", tone: "primary", ring: 87, ringText: "87%" },
  { id: "mfa", label: "MFA ENROLLMENT", value: "92%", sub1: "110 / 120 users", tone: "primary", ring: 92, ringText: "92%" },
  { id: "pw", label: "PASSWORD POLICY", value: "Strong", sub1: "Last updated 5d ago", tone: "primary", ring: 100, icon: ShieldCheck },
  { id: "timeout", label: "SESSION TIMEOUT", value: "8h", sub1: "Idle timeout", tone: "info", ring: 100, icon: MonitorSmartphone },
  { id: "devices", label: "TRUSTED DEVICES", value: "22", sub1: "Managed devices", tone: "primary", ring: 100, icon: Laptop },
  { id: "risk", label: "LOGIN RISK (7D)", value: "Low", sub1: "0 high-risk sign-ins", tone: "primary", ring: 100, icon: UserCheck },
  { id: "uptime", label: "UPTIME (30D)", value: "99.98%", sub1: "No auth incidents", tone: "primary", ring: 100, ringText: "99%" },
];

const authActivity = [
  { id: 1, time: "May 24, 2026 10:42 AM", user: "Alex Rivera", event: "SSO via Okta", details: "SSO via Okta", ip: "76.12.45.23", risk: "Low", tone: "primary" },
  { id: 2, time: "May 24, 2026 10:21 AM", user: "Sarah Chen", event: "TOTP", details: "TOTP", ip: "76.12.18.77", risk: "Low", tone: "primary" },
  { id: 3, time: "May 24, 2026 9:43 AM", user: "Daniel Tran", event: "Chrome on macOS", details: "Chrome on macOS", ip: "76.12.91.34", risk: "Medium", tone: "warning" },
  { id: 4, time: "May 24, 2026 9:41 AM", user: "Priya Nair", event: "Self-service", details: "Self-service", ip: "76.12.45.23", risk: "Low", tone: "primary" },
  { id: 5, time: "May 24, 2026 9:15 AM", user: "Miguel Soto", event: "SSO via Google", details: "SSO via Google", ip: "76.12.33.11", risk: "Low", tone: "primary" },
];

const navItems = [
  { id: "workspace", label: "General", icon: Settings },
  { id: "auth", label: "Team & Access", icon: Users },
  { id: "ai", label: "AI Runtime & Models", icon: Sparkles },
  { id: "connectors", label: "Integrations & API", icon: LinkIcon },
  { id: "notifications", label: "Notifications & Alerts", icon: Bell },
  { id: "billing", label: "Billing & Usage", icon: CreditCard },
];

const auditLogs = [
  { time: "May 24, 2026 10:42 AM", user: "Alex Rivera", action: "Updated", resource: "Security settings", desc: "Retention period changed: 90d → 180d", ip: "76.12.45.23", actionTone: "info" },
  { time: "May 24, 2026 10:41 AM", user: "Sarah Green", action: "Enabled", resource: "Audit logging", desc: "Audit logging enabled", ip: "76.12.18.77", actionTone: "primary" },
  { time: "May 24, 2026 10:32 AM", user: "Daniel Tran", action: "Exported", resource: "Workspace data", desc: "Exported data (CSV) for Finance Review", ip: "76.12.91.34", actionTone: "primary" },
  { time: "May 24, 2026 10:25 AM", user: "Alex Rivera", action: "Configured", resource: "RLS policies", desc: "Updated RLS policies for Finance role", ip: "76.12.45.23", actionTone: "warning" },
  { time: "May 24, 2026 9:14 AM", user: "Priya N.", action: "Deleted", resource: "Old data", desc: "Auto-purged data older than 180 days", ip: "System", actionTone: "critical" },
];

const securityChecklist = [
  { label: "2FA enforced", status: "Enabled", tone: "primary" },
  { label: "RLS enabled", status: "Enabled", tone: "primary" },
  { label: "Audit logging", status: "Enabled", tone: "primary" },
  { label: "Data retention policy", status: "Compliant", tone: "primary" },
  { label: "Encryption at rest", status: "Enabled", tone: "primary" },
  { label: "SSO (SAML)", status: "Optional", tone: "muted" },
];

const featureModes = [
  { label: "Genius Deep", status: "Locked", icon: Lock, tone: "muted" },
  { label: "Genius Audit", status: "Locked", icon: Lock, tone: "muted" },
  { label: "Autonomous Execution", status: "Locked", icon: Lock, tone: "muted" },
  { label: "Contract Repository", status: "Demo", icon: Database, tone: "info" },
  { label: "Excel AI", status: "Active", icon: CheckCircle2, tone: "primary" },
];

function KpiCard({ kpi, onSelect }) {
  const toneMap = {
    primary: "var(--primary)",
    info: "#7CC7FF",
    warning: "#f59e0b",
  };
  const color = toneMap[kpi.tone] || toneMap.primary;

  return (
    <button type="button" className="group flex min-w-0 items-center gap-4 overflow-hidden rounded-xl border border-[#28313C] bg-[#0E1116] p-3 text-left transition-colors hover:bg-[#0E1116]" onClick={() => onSelect?.(kpi)}>
      <div className="relative shrink-0 flex items-center justify-center">
        <Ring value={kpi.ring} size={42} stroke={color} hideLabel />
        <div className="absolute inset-0 flex items-center justify-center">
           {kpi.icon ? <kpi.icon className="size-4" style={{ color }} /> : (kpi.ringText && <span className="text-[10px] font-bold text-white tabular-nums">{kpi.ringText}</span>)}
        </div>
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground truncate">{kpi.label}</span>
        <span className="text-[12px] font-bold text-white leading-tight truncate">{kpi.value}</span>
        <span className="text-[10px] font-medium text-white truncate">{kpi.sub1}</span>
        <span className="text-[9px] text-muted-foreground truncate">{kpi.sub2}</span>
      </div>
    </button>
  );
}

export default function SettingsSection({ onNavigate }) {
  const {
    session,
    backend,
    busy,
    preferences,
    loadWorkspace,
    resetWorkspace,
    loadDemoWorkspace,
    exportWorkspace,
    importWorkspaceFile,
    signOut,
    members,
    can,
    inviteMember,
    updateMember,
    disableMember,
    saveWorkspacePreferences,
  } = useWorkspace();
  const canExportData = can("export_data");
  const canResetWorkspace = can("reset_workspace");
  const canManageMembers = can("manage_members");
  const canManageWorkspace = can("manage_workspace");
  const storageLabel = backend?.storage === "supabase" ? "Supabase" : "Local";
  const policyPreferences = useMemo(() => ({
    rlsEnabled: true,
    auditLogging: true,
    restrictExport: true,
    dataMasking: true,
    autoPurge: true,
    softDelete: true,
    retentionDays: 180,
    graceDays: 30,
    ...(preferences?.policies || {}),
  }), [preferences?.policies]);
  const [activeNav, setActiveNav] = useState("workspace");
  const [policyDraft, setPolicyDraft] = useState({});
  const activePolicyPreferences = useMemo(() => ({
    ...policyPreferences,
    ...policyDraft,
  }), [policyDraft, policyPreferences]);
  const rlsEnabled = Boolean(activePolicyPreferences.rlsEnabled);
  const auditEnabled = Boolean(activePolicyPreferences.auditLogging);

  const [activityPage, setActivityPage] = useState(1);
  const [activityRows, setActivityRows] = useState(6);
  const [activityFilter, setActivityFilter] = useState("All");

  const filteredActivity = useMemo(() => {
    if (activityFilter === "All") return recentActivity;
    return recentActivity.filter(a => a.event.includes(activityFilter));
  }, [activityFilter]);

  const totalActivityPages = Math.max(1, Math.ceil(filteredActivity.length / activityRows));
  const paginatedActivity = filteredActivity.slice((activityPage - 1) * activityRows, activityPage * activityRows);
  const exportEnabled = Boolean(activePolicyPreferences.restrictExport);
  const maskingEnabled = Boolean(activePolicyPreferences.dataMasking);
  const autoPurge = Boolean(activePolicyPreferences.autoPurge);
  const softDelete = Boolean(activePolicyPreferences.softDelete);
  const [inviteDraft, setInviteDraft] = useState({
    email: "",
    role: "Member",
    position: "Operations",
    department: "Operations",
  });
  const [inviteLink, setInviteLink] = useState("");
  const importInputRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const totalLogs = auditLogs.length;
  const totalPages = Math.max(1, Math.ceil(totalLogs / rowsPerPage));
  const paginatedAuditLogs = auditLogs.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  const handlePageClick = (page) => {
    setCurrentPage(page);
  };
  const handleLockedSettingsAction = (label) => {
    toast.info(`${label} is locked until the production account/security provider is connected.`);
  };
  const handleNavClick = (id) => {
    setActiveNav(id);
  };
  const handleKpiClick = (kpi) => {
    if (["sec", "sec_score", "protection", "retention", "guardrails", "locked"].includes(kpi.id)) {
      setActiveNav("security");
      return;
    }
    if (["sessions", "linked", "tokens", "sso", "mfa", "pw", "timeout", "devices", "risk", "uptime"].includes(kpi.id)) {
      setActiveNav("auth");
      return;
    }
    if (["health", "storage"].includes(kpi.id)) {
      setActiveNav("workspace");
      return;
    }
    if (kpi.id === "provider") {
      setActiveNav("ai");
      return;
    }
    if (kpi.id === "connectors") {
      setActiveNav("connectors");
      return;
    }
    setActiveNav("account");
  };
  const handleAccountAction = (action) => {
    if (action === "sessions" || action === "roles") {
      setActiveNav("auth");
      return;
    }
    if (action === "notifications") {
      setActiveNav("notifications");
      return;
    }
    if (action === "help") {
      onNavigate?.("support", { source: "settings-help" });
      return;
    }
    if (action === "summary") {
      setActiveNav("workspace");
      return;
    }
    handleLockedSettingsAction(action);
  };
  const updateInviteDraft = (field, value) => {
    setInviteDraft((current) => ({ ...current, [field]: value }));
  };
  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`${label} could not be copied.`);
    }
  };
  const handleInviteMember = async (event) => {
    event.preventDefault();
    if (!canManageMembers) {
      toast.error("Member invites require Owner or Admin access.");
      return;
    }

    try {
      const result = await inviteMember(inviteDraft);
      const url = result?.invite?.url || "";
      setInviteLink(url);
      setInviteDraft((current) => ({ ...current, email: "" }));
      toast.success(url ? "Workspace invite link created." : "Workspace member updated.");
    } catch (error) {
      toast.error(error.message || "Invite failed.");
    }
  };
  const handleRefreshWorkspace = async () => {
    try {
      await loadWorkspace();
      toast.success("Workspace refreshed");
    } catch (error) {
      toast.error(error.message || "Workspace refresh failed.");
    }
  };
  const handleExportWorkspace = () => {
    if (!canExportData) {
      toast.error("Workspace export requires export data permission.");
      return;
    }
    exportWorkspace();
    toast.success("Workspace JSON export started");
  };
  const setPolicyFieldState = (field, value) => {
    setPolicyDraft((current) => ({ ...current, [field]: Boolean(value) }));
  };
  const clearPolicyFieldState = (field) => {
    setPolicyDraft((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };
  const handlePolicyToggle = async (field, value) => {
    if (!canManageWorkspace) {
      toast.error("Security policy changes require workspace admin access.");
      return;
    }

    setPolicyFieldState(field, value);
    try {
      await saveWorkspacePreferences({
        policies: {
          ...activePolicyPreferences,
          [field]: value,
        },
      });
      clearPolicyFieldState(field);
      toast.success("Security policy updated");
    } catch (error) {
      clearPolicyFieldState(field);
      toast.error(error.message || "Security policy could not be saved.");
    }
  };
  const handleImportWorkspace = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!canResetWorkspace) {
      toast.error("Workspace import requires Owner access.");
      return;
    }
    if (!window.confirm("Import this GENIUS workspace file into the current workspace? Existing data will be replaced, but your current session and access role will stay active.")) return;

    try {
      await importWorkspaceFile(file);
      toast.success("Workspace file imported");
    } catch (error) {
      toast.error(error.message || "Workspace import failed.");
    }
  };
  const handleResetWorkspace = async () => {
    if (!canResetWorkspace) {
      toast.error("Workspace reset requires Owner access.");
      return;
    }
    if (!window.confirm("Delete all MVP workspace data for this account? This cannot be undone.")) return;
    try {
      await resetWorkspace();
      toast.success("Workspace data deleted");
    } catch (error) {
      toast.error(error.message || "Workspace reset failed.");
    }
  };
  const handleLoadDemoWorkspace = async () => {
    if (!canResetWorkspace) {
      toast.error("Investor demo reset requires Owner access.");
      return;
    }
    if (!window.confirm("Replace the current workspace with deterministic investor demo data? Existing MVP workspace data will be replaced, but your current session and access role will stay active.")) return;
    try {
      await loadDemoWorkspace();
      toast.success("Investor demo workspace loaded");
    } catch (error) {
      toast.error(error.message || "Investor demo workspace could not be loaded.");
    }
  };
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.warn("Sign out API failed, forcing redirect.");
      window.location.href = "/login";
    }
  };
  const handleMemberRoleChange = async (member, role) => {
    if (!canManageMembers) {
      toast.error("Member management requires Owner or Admin access.");
      return;
    }

    try {
      await updateMember({ id: member.id, role });
      toast.success(`${memberActionLabel(member)} updated to ${role}`);
    } catch (error) {
      toast.error(error.message || "Member update failed.");
    }
  };
  const handleDisableMember = async (member) => {
    if (!canManageMembers) {
      toast.error("Member management requires Owner or Admin access.");
      return;
    }
    if (!window.confirm(`Disable ${memberActionLabel(member)} in this workspace?`)) return;

    try {
      await disableMember({ id: member.id });
      toast.success(`${memberActionLabel(member)} disabled`);
    } catch (error) {
      toast.error(error.message || "Member disable failed.");
    }
  };

  const kpisToRender = activeNav === "account" ? accountKpis : settingsKpis;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#080A0E]">

      {/* Scrollable Main Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin flex flex-col">
        <div className="w-full h-full p-6 pb-20 flex flex-col gap-6">

        {/* Header */}
        <header className="flex shrink-0 flex-col gap-4 animate-fade-in min-[1500px]:flex-row min-[1500px]:items-start min-[1500px]:justify-between">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-2xl font-semibold text-white">
              <span className="text-muted-foreground">Settings /</span> {navItems.find(i => i.id === activeNav)?.label || activeNav}
            </h1>
            <p className="text-[11px] text-muted-foreground">
              {activeNav === "account" ? "Manage your personal profile, access, and account preferences." : 
               activeNav === "workspace" ? "Configure your organization, operating context, and workspace defaults." : 
               activeNav === "auth" ? "Control authentication, sign-in methods, and access policies across the workspace." : 
               activeNav === "security" ? "Manage security, data protection, and compliance for your workspace." :
               activeNav === "ai" ? "Configure generative AI models, provider API keys, and context window limits." :
               activeNav === "notifications" ? "Manage how and when GENIUS alerts you to important events." :
               activeNav === "connectors" ? "Configure data ingest pipelines and outbound webhook integrations." :
               activeNav === "guardrails" ? "Define system limits, manual review triggers, and execution boundaries." :
               activeNav === "features" ? "Toggle experimental UI elements and beta functionality across the app." :
               activeNav === "billing" ? "View usage limits, plan details, and invoice history." :
               "Configure workspace settings and operational preferences."}
            </p>
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-2 min-[1500px]:justify-end">
            <button type="button" className="flex items-center gap-2 rounded-full border border-[#28313C] bg-[#141A22] px-3 py-1.5 text-left transition-all hover:bg-[#141A22]" onClick={() => setActiveNav("ai")}>
               <div className="size-4 rounded-full bg-[#7CC7FF]/20 flex items-center justify-center"><Zap className="size-2.5 text-[#7CC7FF]" /></div>
               <div className="flex flex-col gap-0 leading-none">
                 <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">AI Provider</span>
                 <span className="text-[10px] font-semibold text-white flex items-center gap-1">Gemini 1.5 Pro <span className="size-1.5 rounded-full bg-primary" /></span>
               </div>
            </button>
            <button type="button" className="flex items-center gap-2 rounded-full border border-[#28313C] bg-[#141A22] px-3 py-1.5 text-left transition-all hover:bg-[#141A22]" onClick={() => setActiveNav("workspace")}>
               <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center"><Database className="size-2.5 text-primary" /></div>
               <div className="flex flex-col gap-0 leading-none">
                 <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Database</span>
                 <span className="text-[10px] font-semibold text-white flex items-center gap-1">{storageLabel} <span className="size-1.5 rounded-full bg-primary" /></span>
               </div>
            </button>
            <button type="button" className="flex items-center gap-2 rounded-full border border-[#28313C] bg-[#141A22] px-3 py-1.5 text-left transition-all hover:bg-[#141A22]" onClick={() => setActiveNav("security")}>
               <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center"><CheckCircle2 className="size-2.5 text-primary" /></div>
               <div className="flex flex-col gap-0 leading-none">
                 <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Data quality</span>
                 <span className="text-[10px] font-semibold text-white">92%</span>
               </div>
            </button>
            <button type="button" disabled={busy} className="group flex items-center gap-2 rounded-full border border-[#28313C] bg-[#141A22] px-3 py-1.5 text-left transition-all hover:bg-[#141A22] disabled:cursor-not-allowed disabled:opacity-50" onClick={handleRefreshWorkspace}>
               <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors"><RefreshCw className="size-2.5 text-primary group-hover:animate-spin" /></div>
               <div className="flex flex-col gap-0 leading-none pr-2 border-r border-[#28313C]">
                 <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Last sync</span>
                 <span className="text-[10px] font-semibold text-white">1m ago</span>
               </div>
               <RefreshCw className="size-3.5 text-muted-foreground group-hover:text-white transition-colors ml-1" />
            </button>
          </div>
        </header>

        {/* KPI Strip */}
        <div className="grid min-w-0 shrink-0 grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3 animate-fade-in-up" style={{ animationDelay: "50ms" }}>
          {kpisToRender.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} onSelect={handleKpiClick} />
          ))}
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid flex-1 min-w-0 grid-cols-1 gap-0 animate-fade-in-up min-[900px]:grid-cols-[220px_minmax(0,1fr)]" style={{ animationDelay: '100ms' }}>

          {/* LEFT SIDEBAR: Nav Menu */}
          <div className="flex w-full flex-col gap-2 self-start border-r border-[#28313C] pr-4 min-[900px]:sticky min-[900px]:top-0 min-[900px]:w-[220px]">
            <h3 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1 pl-3">Settings</h3>
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left group",
                  activeNav === item.id
                    ? "bg-[#141A22] border border-[#28313C] shadow-[0_0_15px_rgba(255,255,255,0.02)]"
                    : "border border-transparent hover:bg-white/[0.03]"
                )}
              >
                <item.icon className={cn("size-4", activeNav === item.id ? "text-primary" : "text-muted-foreground group-hover:text-white/80 transition-colors")} />
                <span className={cn("text-[11px] font-medium", activeNav === item.id ? "text-white" : "text-muted-foreground group-hover:text-white/80 transition-colors")}>{item.label}</span>
              </button>
            ))}
          </div>

          {/* CENTER PANEL: Main Content */}
          <div className="min-w-0 flex flex-col gap-6 pl-8">

            {activeNav === "account" ? (
              <>
            {/* Title Block */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg font-bold text-white">Account Settings</h2>
                <p className="text-[11px] text-muted-foreground">Manage your personal information, credentials, and preferences.</p>
              </div>
            </div>

            {/* Account Settings Grid */}
            <div className="flex flex-col rounded-xl border border-[#28313C] bg-[#0E1116] shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
               <div className="grid grid-cols-2 p-5 gap-x-8 gap-y-6">
                 {/* Left Column */}
                 <div className="flex flex-col gap-6">
                   <div className="flex items-center justify-between group">
                     <div className="flex items-start gap-3">
                       <User className="size-4 text-muted-foreground mt-0.5" />
                       <div className="flex flex-col gap-0.5">
                         <span className="text-[11px] font-bold text-white">Personal information</span>
                         <span className="text-[10px] text-muted-foreground">Update your profile details and how others see you.</span>
                       </div>
                     </div>
                     <Button type="button" variant="outline" size="sm" className="h-7 text-[10px] border-[#28313C] bg-[#141A22] text-white hover:bg-white/[0.05]" onClick={() => handleAccountAction("Personal profile editing")}>Edit</Button>
                   </div>

                   <div className="flex items-center justify-between group">
                     <div className="flex items-start gap-3">
                       <LayoutDashboard className="size-4 text-muted-foreground mt-0.5" />
                       <div className="flex flex-col gap-0.5">
                         <span className="text-[11px] font-bold text-white">Company / Contact details</span>
                         <span className="text-[10px] text-muted-foreground">Manage your organization and primary contact info.</span>
                       </div>
                     </div>
                     <Button type="button" variant="outline" size="sm" className="h-7 text-[10px] border-[#28313C] bg-[#141A22] text-white hover:bg-white/[0.05]" onClick={() => handleAccountAction("summary")}>Edit</Button>
                   </div>

                   <div className="flex items-center justify-between group">
                     <div className="flex items-start gap-3">
                       <Mail className="size-4 text-muted-foreground mt-0.5" />
                       <div className="flex flex-col gap-0.5">
                         <span className="text-[11px] font-bold text-white">Email addresses</span>
                         <span className="text-[10px] text-muted-foreground">Manage your email addresses and preferences.</span>
                       </div>
                     </div>
                     <Button type="button" variant="outline" size="sm" className="h-7 text-[10px] border-[#28313C] bg-[#141A22] text-white hover:bg-white/[0.05]" onClick={() => handleAccountAction("Email management")}>Manage</Button>
                   </div>

                   <div className="flex items-center justify-between group">
                     <div className="flex items-start gap-3">
                       <Settings className="size-4 text-muted-foreground mt-0.5" />
                       <div className="flex flex-col gap-0.5">
                         <span className="text-[11px] font-bold text-white">Phone number</span>
                         <span className="text-[10px] text-muted-foreground">Add or update your phone number.</span>
                       </div>
                     </div>
                     <Button type="button" variant="outline" size="sm" className="h-7 text-[10px] border-[#28313C] bg-[#141A22] text-white hover:bg-white/[0.05]" onClick={() => handleAccountAction("Phone management")}>Add</Button>
                   </div>

                   <div className="flex items-center justify-between group">
                     <div className="flex items-start gap-3">
                       <KeyRound className="size-4 text-muted-foreground mt-0.5" />
                       <div className="flex flex-col gap-0.5">
                         <span className="text-[11px] font-bold text-white">Password</span>
                         <span className="text-[10px] text-muted-foreground">Change your password and improve security.</span>
                       </div>
                     </div>
                     <Button type="button" variant="outline" size="sm" className="h-7 text-[10px] border-[#28313C] bg-[#141A22] text-white hover:bg-white/[0.05]" onClick={() => handleAccountAction("Password management")}>Change</Button>
                   </div>

                   <div className="flex items-center justify-between group">
                     <div className="flex items-start gap-3">
                       <ShieldCheck className="size-4 text-muted-foreground mt-0.5" />
                       <div className="flex flex-col gap-0.5">
                         <span className="text-[11px] font-bold text-white">Multi-factor authentication</span>
                         <span className="text-[10px] text-muted-foreground">Secure your account with an extra verification step.</span>
                       </div>
                     </div>
                     <div className="flex items-center gap-3">
                       <span className="text-[10px] font-bold text-primary">Enabled</span>
                       <Button type="button" variant="outline" size="sm" className="h-7 text-[10px] border-[#28313C] bg-[#141A22] text-white hover:bg-white/[0.05]" onClick={() => handleAccountAction("MFA management")}>Manage</Button>
                     </div>
                   </div>

                   <div className="flex items-center justify-between group">
                     <div className="flex items-start gap-3">
                       <History className="size-4 text-muted-foreground mt-0.5" />
                       <div className="flex flex-col gap-0.5">
                         <span className="text-[11px] font-bold text-white">Recovery methods</span>
                         <span className="text-[10px] text-muted-foreground">Manage recovery email and backup codes.</span>
                       </div>
                     </div>
                     <Button type="button" variant="outline" size="sm" className="h-7 text-[10px] border-[#28313C] bg-[#141A22] text-white hover:bg-white/[0.05]" onClick={() => handleAccountAction("Recovery methods")}>Manage</Button>
                   </div>

                   <div className="flex items-center justify-between group">
                     <div className="flex items-start gap-3">
                       <LinkIcon className="size-4 text-muted-foreground mt-0.5" />
                       <div className="flex flex-col gap-0.5">
                         <span className="text-[11px] font-bold text-white">Linked accounts</span>
                         <span className="text-[10px] text-muted-foreground">Connect or manage third-party sign-in providers.</span>
                       </div>
                     </div>
                     <Button type="button" variant="outline" size="sm" className="h-7 text-[10px] border-[#28313C] bg-[#141A22] text-white hover:bg-white/[0.05]" onClick={() => handleAccountAction("Linked account management")}>Manage</Button>
                   </div>
                 </div>

                 {/* Right Column */}
                 <div className="flex flex-col gap-6">
                   <div className="flex items-center justify-between group">
                     <div className="flex items-start gap-3">
                       <History className="size-4 text-muted-foreground mt-0.5" />
                       <div className="flex flex-col gap-0.5">
                         <span className="text-[11px] font-bold text-white">Session management</span>
                         <span className="text-[10px] text-muted-foreground">View and sign out of active sessions.</span>
                       </div>
                     </div>
                     <Button type="button" variant="outline" size="sm" className="h-7 text-[10px] border-[#28313C] bg-[#141A22] text-white hover:bg-white/[0.05]" onClick={() => handleAccountAction("sessions")}>Manage</Button>
                   </div>

                   <div className="flex items-center justify-between group">
                     <div className="flex items-start gap-3">
                       <ShieldCheck className="size-4 text-muted-foreground mt-0.5" />
                       <div className="flex flex-col gap-0.5">
                         <span className="text-[11px] font-bold text-white">Trusted devices</span>
                         <span className="text-[10px] text-muted-foreground">Manage devices you trust to sign in.</span>
                       </div>
                     </div>
                     <Button type="button" variant="outline" size="sm" className="h-7 text-[10px] border-[#28313C] bg-[#141A22] text-white hover:bg-white/[0.05]" onClick={() => handleAccountAction("Trusted device management")}>Manage</Button>
                   </div>

                   <div className="flex items-center justify-between group">
                     <div className="flex items-start gap-3">
                       <Code2 className="size-4 text-muted-foreground mt-0.5" />
                       <div className="flex flex-col gap-0.5">
                         <span className="text-[11px] font-bold text-white">API keys & tokens</span>
                         <span className="text-[10px] text-muted-foreground">Create and manage API keys for integrations.</span>
                       </div>
                     </div>
                     <Button type="button" variant="outline" size="sm" className="h-7 text-[10px] border-[#28313C] bg-[#141A22] text-white hover:bg-white/[0.05]" onClick={() => handleAccountAction("API token management")}>Manage</Button>
                   </div>

                   <div className="flex items-center justify-between group">
                     <div className="flex items-start gap-3">
                       <User className="size-4 text-muted-foreground mt-0.5" />
                       <div className="flex flex-col gap-0.5">
                         <span className="text-[11px] font-bold text-white">Roles & permissions</span>
                         <span className="text-[10px] text-muted-foreground">View your roles and workspace permissions.</span>
                       </div>
                     </div>
                     <Button type="button" variant="outline" size="sm" className="h-7 text-[10px] border-[#28313C] bg-[#141A22] text-white hover:bg-white/[0.05]" onClick={() => handleAccountAction("roles")}>Manage</Button>
                   </div>

                   <div className="flex items-center justify-between group">
                     <div className="flex items-start gap-3">
                       <Bell className="size-4 text-muted-foreground mt-0.5" />
                       <div className="flex flex-col gap-0.5">
                         <span className="text-[11px] font-bold text-white">Notification preferences</span>
                         <span className="text-[10px] text-muted-foreground">Choose how you receive notifications.</span>
                       </div>
                     </div>
                     <Button type="button" variant="outline" size="sm" className="h-7 text-[10px] border-[#28313C] bg-[#141A22] text-white hover:bg-white/[0.05]" onClick={() => handleAccountAction("notifications")}>Manage</Button>
                   </div>

                    <div className="flex items-center justify-between gap-4 group">
                      <div className="flex items-start gap-3">
                        <Download className="size-4 text-muted-foreground mt-0.5" />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] font-bold text-white">Portable workspace</span>
                          <span className="text-[10px] text-muted-foreground">Export or import a GENIUS JSON file without auth secrets.</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          ref={importInputRef}
                          type="file"
                          accept="application/json,.json"
                          className="hidden"
                          onChange={handleImportWorkspace}
                        />
                        <Button type="button" variant="outline" size="sm" disabled={busy || !canResetWorkspace} className="h-7 text-[10px] border-[#28313C] bg-[#141A22] text-white hover:bg-white/[0.05] disabled:opacity-50" onClick={() => importInputRef.current?.click()}>Import</Button>
                        <Button type="button" variant="outline" size="sm" disabled={!canExportData} className="h-7 text-[10px] border-[#28313C] bg-[#141A22] text-white hover:bg-white/[0.05] disabled:opacity-50" onClick={handleExportWorkspace}>Export</Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 group">
                      <div className="flex items-start gap-3">
                        <RefreshCw className="size-4 text-muted-foreground mt-0.5" />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] font-bold text-white">Investor demo workspace</span>
                          <span className="text-[10px] text-muted-foreground">Load deterministic demo data for a repeatable investor walkthrough.</span>
                        </div>
                      </div>
                      <Button type="button" variant="outline" size="sm" disabled={busy || !canResetWorkspace} className="h-7 text-[10px] border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50" onClick={handleLoadDemoWorkspace}>
                        Load demo
                      </Button>
                    </div>

                   <div className="flex items-center justify-between group">
                     <div className="flex items-start gap-3">
                       <AlertTriangle className="size-4 text-muted-foreground mt-0.5" />
                       <div className="flex flex-col gap-0.5">
                         <span className="text-[11px] font-bold text-white">Sign out</span>
                         <span className="text-[10px] text-muted-foreground">Clear the current browser session and return to the product screen.</span>
                       </div>
                     </div>
                     <Button type="button" variant="outline" size="sm" disabled={busy} className="h-7 text-[10px] border-[#28313C] bg-[#141A22] text-white hover:bg-white/[0.05]" onClick={handleSignOut}>Sign out</Button>
                   </div>
                 </div>
               </div>

               <div className="border-t border-critical/20 bg-critical/5 p-5 flex items-center justify-between rounded-b-xl mt-[-1px]">
                 <div className="flex items-start gap-3">
                   <AlertTriangle className="size-4 text-critical mt-0.5" />
                   <div className="flex flex-col gap-0.5">
                     <span className="text-[11px] font-bold text-white">Delete workspace data</span>
                     <span className="text-[10px] text-muted-foreground">Permanently delete all uploaded evidence, findings, actions, reports, and audit entries for this MVP workspace.</span>
                   </div>
                 </div>
                 <Button type="button" variant="outline" size="sm" disabled={busy || !canResetWorkspace} className="h-8 text-[11px] border-critical/30 bg-critical/10 text-critical hover:bg-critical/20 disabled:opacity-50" onClick={handleResetWorkspace}>Delete data</Button>
               </div>
            </div>

            {/* Dashboard Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Account Summary */}
              <div className="flex flex-col rounded-xl border border-[#28313C] bg-[#0E1116] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                 <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#28313C]">
                   <h3 className="text-[11px] font-bold text-white">Account Summary</h3>
                   <button type="button" className="text-[10px] text-muted-foreground hover:text-white font-medium transition-colors" onClick={() => handleAccountAction("summary")}>Edit</button>
                 </div>
                 <div className="flex flex-col gap-2.5 text-[10px]">
                   <div className="flex items-center justify-between">
                     <span className="text-muted-foreground font-medium">Workspace</span>
                     <span className="text-white">Acme Corporation</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-muted-foreground font-medium">Account ID</span>
                     <span className="text-white font-mono">{session?.workspaceId || "ws_local_mvp"}</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-muted-foreground font-medium">Signed in as</span>
                     <span className="text-white truncate max-w-[170px]">{sessionIdentityLabel(session, "Local MVP user")}</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-muted-foreground font-medium">Plan</span>
                     <span className="text-white">MVP</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-muted-foreground font-medium">Member since</span>
                     <span className="text-white">Feb 18, 2026</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-muted-foreground font-medium">Time zone</span>
                     <span className="text-white">(UTC-05:00) Eastern Time (US & Canada)</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-muted-foreground font-medium">Default currency</span>
                     <span className="text-white">USD</span>
                   </div>
                 </div>
              </div>

              {/* Security Checklist */}
              <div className="flex flex-col rounded-xl border border-[#28313C] bg-[#0E1116] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                <h3 className="text-[11px] font-bold text-white mb-4">Security Checklist</h3>
                <div className="flex flex-col gap-2.5">
                  {[
                    { label: "Two-factor authentication", status: "Enabled", tone: "primary" },
                    { label: "Strong password", status: "Good", tone: "primary" },
                    { label: "Trusted devices", status: "2 devices", tone: "primary" },
                    { label: "Recovery methods", status: "2 methods", tone: "primary" },
                    { label: "Recent account activity", status: "No issues", tone: "primary" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-primary" />
                        <span className="text-white">{item.label}</span>
                      </div>
                      <span className="font-bold text-primary">{item.status}</span>
                    </div>
                  ))}
                </div>
                <button type="button" className="text-[10px] text-[#4EA1FF] hover:text-[#7CC7FF] font-medium flex items-center gap-1 transition-colors mt-4 group" onClick={() => setActiveNav("security")}>
                  View full security report <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Recent Sign-ins */}
              <div className="flex flex-col rounded-xl border border-[#28313C] bg-[#0E1116] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)] lg:col-span-2">
                 <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#28313C]">
                   <h3 className="text-[11px] font-bold text-white">Recent Sign-ins</h3>
                   <button type="button" className="text-[10px] text-[#4EA1FF] hover:text-[#7CC7FF] font-medium transition-colors" onClick={() => setActiveNav("auth")}>View all</button>
                 </div>
                 <div className="flex flex-col gap-4">
                   {recentSignIns.map((signin) => (
                     <div key={signin.id} className="flex items-start gap-3 text-[10px]">
                       <div className="size-6 rounded-full bg-[#0E1116] border border-[#28313C] flex items-center justify-center shrink-0">
                         {signin.browser.includes("Chrome") ? (
                           <div className="size-3 rounded-full bg-[conic-gradient(from_0deg,#ea4335_0_120deg,#fbbc04_120deg_240deg,#34a853_240deg_360deg)] p-0.5"><div className="size-full rounded-full bg-[#4285f4]" /></div>
                         ) : (
                           <span className="size-3 rounded-full border-2 border-white/50" />
                         )}
                       </div>
                       <div className="flex flex-col min-w-0">
                         <span className="text-white truncate">{signin.time}</span>
                         <span className="text-muted-foreground truncate">{signin.browser} - {signin.location}</span>
                       </div>
                       <span className={cn(
                         "ml-auto text-[9px] font-medium whitespace-nowrap",
                         signin.status === "This device" ? "text-primary" : "text-primary"
                       )}>{signin.status}</span>
                     </div>
                   ))}
                 </div>
              </div>
            </div>

            {/* Recent Account Activity */}
            <div className="flex flex-col rounded-xl border border-[#28313C] bg-[#0E1116] shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
              <div className="flex items-center justify-between p-5 border-b border-[#28313C]">
                <div className="flex items-center gap-4">
                  <h3 className="text-[11px] font-bold text-white">Recent Account Activity</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-white transition-colors bg-[#0E1116] px-2 py-1 rounded border border-[#28313C]">
                      <Filter className="size-3" /> {activityFilter === "All" ? "All Events" : activityFilter}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-0 border-[#28313C] bg-[#0E1116] text-muted-foreground">
                      {["All", "Sign in", "MFA verified", "Password changed", "API token created", "New device trusted"].map(f => (
                        <DropdownMenuItem key={f} onClick={() => { setActivityFilter(f); setActivityPage(1); }} className="text-[11px] focus:bg-[#28313C] focus:text-white">{f}</DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <button type="button" className="text-[10px] text-[#4EA1FF] hover:text-[#7CC7FF] font-medium flex items-center gap-1 transition-colors group" onClick={() => { setActivityRows(18); setActivityPage(1); }}>
                  View all activity <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
              <div className="overflow-x-auto scrollbar-none min-h-[300px]">
                <table className="w-full text-left text-[10px] whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-[#28313C] bg-white/[0.02]">
                      <th className="px-5 py-2.5 font-bold text-muted-foreground uppercase tracking-widest w-[160px]">Time</th>
                      <th className="px-5 py-2.5 font-bold text-muted-foreground uppercase tracking-widest w-[140px]">Event</th>
                      <th className="px-5 py-2.5 font-bold text-muted-foreground uppercase tracking-widest">Details</th>
                      <th className="px-5 py-2.5 font-bold text-muted-foreground uppercase tracking-widest w-[120px]">IP Address</th>
                      <th className="px-5 py-2.5 font-bold text-muted-foreground uppercase tracking-widest w-[140px]">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#28313C]/50">
                    {paginatedActivity.map((log) => (
                      <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3 text-muted-foreground">{log.time}</td>
                        <td className="px-5 py-3 text-white">
                          <div className="flex items-center gap-2">
                            <log.icon className="size-3 text-muted-foreground" />
                            {log.event}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground truncate max-w-[300px]">{log.details}</td>
                        <td className="px-5 py-3 text-muted-foreground font-mono">{log.ip}</td>
                        <td className="px-5 py-3 text-muted-foreground">{log.location}</td>
                      </tr>
                    ))}
                    {paginatedActivity.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                          No activity found for this filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between p-3 border-t border-[#28313C] text-[10px] text-muted-foreground">
                <span>Showing {(activityPage - 1) * activityRows + 1} to {Math.min(activityPage * activityRows, filteredActivity.length)} of {filteredActivity.length} events</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setActivityPage(prev => Math.max(prev - 1, 1))} disabled={activityPage === 1} className="size-6 flex items-center justify-center rounded hover:bg-[#0E1116] hover:text-white transition-colors disabled:opacity-50"><ChevronLeft className="size-3" /></button>
                    {Array.from({ length: totalActivityPages }).map((_, idx) => {
                      const page = idx + 1;
                      return (
                        <button key={page} type="button" onClick={() => setActivityPage(page)} className={cn("size-6 flex items-center justify-center rounded hover:bg-[#0E1116] hover:text-white transition-colors font-medium", activityPage === page ? "bg-primary text-primary-foreground" : "")}>{page}</button>
                      )
                    })}
                    <button type="button" onClick={() => setActivityPage(prev => Math.min(prev + 1, totalActivityPages))} disabled={activityPage === totalActivityPages} className="size-6 flex items-center justify-center rounded hover:bg-[#0E1116] hover:text-white transition-colors disabled:opacity-50"><ChevronRight className="size-3" /></button>
                  </div>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center gap-1 font-medium text-white bg-transparent rounded px-2 py-1 transition-colors hover:bg-[#28313C]">
                        {activityRows} / page <ChevronDown className="size-3 text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-16 min-w-0 border-[#28313C] bg-[#0E1116] text-muted-foreground">
                        {[6, 12, 18].map(num => (
                          <DropdownMenuItem key={num} onClick={() => { setActivityRows(num); setActivityPage(1); }} className="text-[11px] focus:bg-[#28313C] focus:text-white">{num}</DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
              </>
  ) : activeNav === "workspace" ? (
              <div className="flex flex-col gap-6 animate-fade-in w-full">
                
                {/* Action Buttons Top Right */}
                <div className="flex items-center justify-end gap-2 w-full">
                  <Button type="button" variant="outline" className="h-8 border-[#28313C] bg-[#141A22] text-[11px] text-white hover:bg-white/[0.05]">
                    <CheckCircle2 className="mr-1.5 size-3.5" /> Review Audit
                  </Button>
                  <Button type="button" variant="outline" className="h-8 border-[#28313C] bg-[#141A22] text-[11px] text-white hover:bg-white/[0.05]">
                    <RefreshCw className="mr-1.5 size-3.5" /> Reset
                  </Button>
                  <Button type="button" variant="outline" className="h-8 border-[#28313C] bg-[#141A22] text-[11px] text-white hover:bg-white/[0.05]">
                    <MoreHorizontal className="mr-1.5 size-3.5" /> More
                  </Button>
                  <Button type="button" className="h-8 bg-[#7CC7FF] hover:bg-[#7CC7FF]/90 text-[11px] font-bold text-black ml-1">
                    <Plus className="mr-1.5 size-3.5" /> Save Changes
                  </Button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
                  
                  {/* LEFT COLUMN */}
                  <div className="flex flex-col gap-6">
                    {/* 1 Workspace Profile */}
                    <div className="rounded-xl border border-[#28313C] bg-[#0E1116] overflow-hidden flex flex-col">
                      <div className="flex items-center gap-3 p-5 border-b border-[#28313C]">
                        <div className="size-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-white leading-none">1</span>
                        </div>
                        <h3 className="text-[13px] font-bold text-white">Workspace Profile</h3>
                      </div>
                      <div className="flex flex-col p-5 gap-5">
                        <div className="flex flex-col xl:flex-row gap-5">
                          <div className="flex flex-col gap-2 shrink-0">
                            <span className="text-[11px] text-muted-foreground">Workspace Logo</span>
                            <div className="relative size-24 rounded-xl border border-[#28313C] bg-[#141A22] flex items-center justify-center">
                               <div className="size-12 rounded-full bg-emerald-500 flex items-center justify-center">
                                 <svg viewBox="0 0 24 24" className="size-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
                               </div>
                               <button type="button" className="absolute -bottom-2 -right-2 size-6 rounded-full border border-[#28313C] bg-[#141A22] flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
                                 <Plus className="size-3" />
                               </button>
                            </div>
                            <span className="text-[9px] text-muted-foreground mt-1">PNG, JPG or SVG<br/>Max 2MB</span>
                          </div>
                          <div className="flex flex-col gap-4 flex-1 min-w-0">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[11px] text-muted-foreground">Workspace Name</label>
                              <input type="text" defaultValue="GreenFarm Operations" className="w-full bg-[#141A22] border border-[#28313C] rounded-lg px-3 py-2 text-[12px] text-white focus:outline-none focus:border-primary/50 transition-colors" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[11px] text-muted-foreground">Workspace URL</label>
                              <div className="flex">
                                <div className="flex items-center px-3 bg-[#141A22] border border-[#28313C] border-r-0 rounded-l-lg text-[11px] text-muted-foreground">app.genius.com/</div>
                                <input type="text" defaultValue="greenfarm" className="flex-1 bg-[#141A22] border border-[#28313C] border-l-0 rounded-r-lg px-3 py-2 text-[12px] text-white focus:outline-none focus:border-primary/50 transition-colors" />
                              </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[11px] text-muted-foreground">Description / Business Context</label>
                              <textarea rows="2" defaultValue="AI-powered operations and intelligence platform for GreenFarm." className="w-full bg-[#141A22] border border-[#28313C] rounded-lg px-3 py-2 text-[12px] text-white focus:outline-none focus:border-primary/50 transition-colors resize-none" />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-5">
                          <div className="flex flex-col gap-1.5 flex-1">
                            <label className="text-[11px] text-muted-foreground">Primary Workspace Owner</label>
                            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#141A22] border border-[#28313C] cursor-pointer hover:border-primary/30 transition-colors">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="size-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                                  <span className="text-[10px] font-bold text-white">JS</span>
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[11px] font-semibold text-white truncate">Jane Smith</span>
                                  <span className="text-[9px] text-muted-foreground truncate">jane.smith@greenfarm.com</span>
                                </div>
                              </div>
                              <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5 flex-1">
                            <label className="text-[11px] text-muted-foreground">Workspace Status</label>
                            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#141A22] border border-[#28313C] cursor-pointer hover:border-primary/30 transition-colors h-[42px]">
                              <div className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-emerald-500" />
                                <span className="text-[11px] font-semibold text-white">Active</span>
                              </div>
                              <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 4 Workspace Defaults */}
                    <div className="rounded-xl border border-[#28313C] bg-[#0E1116] overflow-hidden flex flex-col">
                      <div className="flex items-center gap-3 p-5 border-b border-[#28313C]">
                        <div className="size-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-white leading-none">4</span>
                        </div>
                        <h3 className="text-[13px] font-bold text-white">Workspace Defaults</h3>
                      </div>
                      <div className="flex flex-col p-5 gap-0">
                        {[
                          { icon: Timer, label: "Default Approval SLA", value: "3 business days" },
                          { icon: Globe, label: "Default Workspace Region", value: "US East (N. Virginia)" },
                          { icon: Shield, label: "Default Document Classification", value: "Internal" },
                          { icon: Lock, label: "Default Privacy Posture", value: "Confidential" },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between py-3.5 border-b border-[#28313C]/50 last:border-0 group cursor-pointer">
                            <div className="flex items-center gap-2.5">
                              <item.icon className="size-3.5 text-muted-foreground" />
                              <span className="text-[11px] text-muted-foreground">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-medium text-white">{item.value}</span>
                              <ChevronDown className="size-3 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ))}
                        <div className="flex items-center justify-between py-4 border-t border-[#28313C] mt-1">
                          <div className="flex items-start gap-3">
                            <UserPlus className="size-3.5 text-muted-foreground mt-0.5" />
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[11px] font-medium text-white">Auto-assign Approvals</span>
                              <span className="text-[10px] text-muted-foreground">Automatically assign approvals to content owners</span>
                            </div>
                          </div>
                          <CustomToggle checked={true} onChange={() => {}} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CENTER COLUMN */}
                  <div className="flex flex-col gap-6">
                    {/* 2 Localization */}
                    <div className="rounded-xl border border-[#28313C] bg-[#0E1116] overflow-hidden flex flex-col">
                      <div className="flex items-center gap-3 p-5 border-b border-[#28313C]">
                        <div className="size-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-white leading-none">2</span>
                        </div>
                        <h3 className="text-[13px] font-bold text-white">Localization</h3>
                      </div>
                      <div className="flex flex-col p-5 gap-0">
                        {[
                          { icon: Clock, label: "Time Zone", value: "(UTC-05:00) Eastern Time (US & Canada)" },
                          { icon: Globe, label: "Interface Language", value: "English (US)" },
                          { icon: Calendar, label: "Date Format", value: "MM/DD/YYYY" },
                          { icon: Clock, label: "Time Format", value: "12-hour (1:30 PM)" },
                          { icon: CreditCard, label: "Default Currency", value: "USD — US Dollar" },
                          { icon: FileText, label: "Number Formatting", value: "1,234,567.89 (US)" },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between py-3.5 border-b border-[#28313C]/50 group cursor-pointer">
                            <div className="flex items-center gap-2.5 min-w-0 mr-4">
                              <item.icon className="size-3.5 text-muted-foreground shrink-0" />
                              <span className="text-[11px] text-muted-foreground truncate">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[11px] font-medium text-white">{item.value}</span>
                              <ChevronDown className="size-3 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ))}
                        <div className="flex items-center justify-between pt-5 mt-1">
                          <span className="text-[11px] font-medium text-muted-foreground">Preview</span>
                          <div className="flex items-center gap-4 text-[11px] text-white">
                            <span>05/22/2025</span>
                            <span>1:30 PM</span>
                            <span>$1,234.56</span>
                            <span>1,234.56</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 5 Danger Zone */}
                    <div className="rounded-xl border border-red-500/20 bg-[#0E1116] overflow-hidden flex flex-col relative">
                      <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent pointer-events-none" />
                      <div className="flex items-center gap-3 p-5 border-b border-red-500/10 relative">
                        <div className="size-5 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-white leading-none">5</span>
                        </div>
                        <h3 className="text-[13px] font-bold text-red-500">Danger Zone</h3>
                      </div>
                      <div className="flex flex-col p-5 gap-5 relative">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-start gap-3 min-w-0">
                            <UserCheck className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[11px] font-bold text-white">Transfer ownership</span>
                              <span className="text-[10px] text-muted-foreground">Transfer workspace ownership to another administrator.</span>
                            </div>
                          </div>
                          <Button type="button" variant="outline" className="h-8 border-[#28313C] text-[11px] text-white hover:bg-white/[0.05] shrink-0 min-w-[70px]">Transfer</Button>
                        </div>
                        
                        <div className="w-full h-px bg-[#28313C]/50" />
                        
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-start gap-3 min-w-0">
                            <Download className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[11px] font-bold text-white">Export all data</span>
                              <span className="text-[10px] text-muted-foreground">Export all workspace data, including documents, logs, and settings.</span>
                            </div>
                          </div>
                          <Button type="button" variant="outline" className="h-8 border-[#28313C] text-[11px] text-white hover:bg-white/[0.05] shrink-0 min-w-[70px]">Export</Button>
                        </div>
                        
                        <div className="w-full h-px bg-[#28313C]/50" />
                        
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-start gap-3 min-w-0">
                            <AlertTriangle className="size-4 text-red-400 mt-0.5 shrink-0" />
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[11px] font-bold text-white">Delete workspace</span>
                              <span className="text-[10px] text-muted-foreground">Permanently delete this workspace and all associated data.</span>
                            </div>
                          </div>
                          <Button type="button" variant="outline" className="h-8 border-red-500/30 text-[11px] text-red-400 hover:bg-red-500/10 shrink-0 min-w-[70px]">Delete</Button>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <AlertTriangle className="size-3 text-red-500" />
                          <span className="text-[10px] text-red-500 font-medium">These actions are irreversible. Please proceed with caution.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className="flex flex-col gap-6">
                    {/* 3 Data Retention Policy */}
                    <div className="rounded-xl border border-[#28313C] bg-[#0E1116] overflow-hidden flex flex-col h-full">
                      <div className="flex items-center gap-3 p-5 border-b border-[#28313C]">
                        <div className="size-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-white leading-none">3</span>
                        </div>
                        <h3 className="text-[13px] font-bold text-white">Data Retention Policy</h3>
                      </div>
                      
                      <div className="flex flex-col p-5 gap-6">
                        {/* Mode switch */}
                        <div className="flex items-center gap-6 pb-2">
                           <span className="text-[11px] text-muted-foreground w-24">Retention Mode</span>
                           <div className="flex items-center gap-4">
                             <label className="flex items-center gap-2 cursor-pointer">
                               <div className="size-3.5 rounded-full border border-[#28313C] flex items-center justify-center" />
                               <span className="text-[11px] text-muted-foreground">Keep forever</span>
                             </label>
                             <label className="flex items-center gap-2 cursor-pointer">
                               <div className="size-3.5 rounded-full border border-primary flex items-center justify-center">
                                 <div className="size-1.5 rounded-full bg-primary" />
                               </div>
                               <span className="text-[11px] text-white">Custom policy</span>
                             </label>
                           </div>
                        </div>

                        {/* Dropdowns */}
                        <div className="flex flex-col gap-3">
                           <div className="flex items-center justify-between group cursor-pointer">
                             <div className="flex items-center gap-2">
                               <ChevronRight className="size-3.5 text-muted-foreground opacity-50" />
                               <span className="text-[11px] text-muted-foreground">AI logs retention</span>
                             </div>
                             <div className="flex items-center justify-between px-3 py-1.5 rounded border border-[#28313C] bg-[#141A22] w-[100px]">
                               <span className="text-[11px] font-medium text-white">30 days</span>
                               <ChevronDown className="size-3.5 text-muted-foreground opacity-50" />
                             </div>
                           </div>
                           <div className="flex items-center justify-between group cursor-pointer">
                             <div className="flex items-center gap-2">
                               <ChevronRight className="size-3.5 text-muted-foreground opacity-50" />
                               <span className="text-[11px] text-muted-foreground">Old document retention</span>
                             </div>
                             <div className="flex items-center justify-between px-3 py-1.5 rounded border border-[#28313C] bg-[#141A22] w-[100px]">
                               <span className="text-[11px] font-medium text-white">1 year</span>
                               <ChevronDown className="size-3.5 text-muted-foreground opacity-50" />
                             </div>
                           </div>
                           <div className="flex items-center justify-between group cursor-pointer">
                             <div className="flex items-center gap-2">
                               <ChevronRight className="size-3.5 text-muted-foreground opacity-50" />
                               <span className="text-[11px] text-muted-foreground">Audit trail retention</span>
                             </div>
                             <div className="flex items-center justify-between px-3 py-1.5 rounded border border-[#28313C] bg-[#141A22] w-[100px]">
                               <span className="text-[11px] font-medium text-white">7 years</span>
                               <ChevronDown className="size-3.5 text-muted-foreground opacity-50" />
                             </div>
                           </div>
                        </div>

                        {/* Auto-cleanup toggle */}
                        <div className="flex items-center justify-between py-2 border-t border-[#28313C]/50 mt-1">
                          <div className="flex items-start gap-2">
                            <ChevronRight className="size-3.5 text-muted-foreground opacity-50 mt-0.5" />
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[11px] font-medium text-white">Auto-cleanup</span>
                              <span className="text-[10px] text-muted-foreground">Automatically purge data after the retention period</span>
                            </div>
                          </div>
                          <CustomToggle checked={true} onChange={() => {}} />
                        </div>

                        {/* Info Alert */}
                        <div className="flex items-start gap-2 p-3 rounded bg-primary/5 border border-primary/20">
                           <Info className="size-3.5 text-primary shrink-0 mt-0.5" />
                           <span className="text-[11px] text-primary/90">This policy helps ensure compliance with data retention regulations.</span>
                        </div>

                        {/* Timeline */}
                        <div className="flex flex-col mt-2 gap-4">
                           <span className="text-[11px] font-semibold text-white">Retention Timeline</span>
                           <div className="flex flex-col relative pl-4 pb-2">
                              {/* Vertical Line */}
                              <div className="absolute top-2 bottom-2 left-[19px] w-px bg-primary/20" />
                              
                              <div className="flex items-start gap-4 mb-5 relative">
                                <div className="absolute left-[15px] top-1.5 size-[9px] rounded-full bg-primary ring-4 ring-[#0E1116] z-10" />
                                <span className="text-[11px] font-medium text-white w-24 shrink-0 pl-7">AI logs</span>
                                <span className="text-[10px] text-muted-foreground">Retained for 30 days, then permanently deleted</span>
                              </div>
                              <div className="flex items-start gap-4 mb-5 relative">
                                <div className="absolute left-[15px] top-1.5 size-[9px] rounded-full bg-primary ring-4 ring-[#0E1116] z-10" />
                                <span className="text-[11px] font-medium text-white w-24 shrink-0 pl-7">Old documents</span>
                                <span className="text-[10px] text-muted-foreground">Retained for 1 year, then permanently deleted</span>
                              </div>
                              <div className="flex items-start gap-4 relative">
                                <div className="absolute left-[15px] top-1.5 size-[9px] rounded-full bg-primary ring-4 ring-[#0E1116] z-10" />
                                <span className="text-[11px] font-medium text-white w-24 shrink-0 pl-7">Audit trail</span>
                                <span className="text-[10px] text-muted-foreground">Retained for 7 years, then archived</span>
                              </div>
                           </div>
                        </div>

                      </div>
                    </div>
                  </div>

                </div>
              </div>
  ) : activeNav === "auth" ? (
              <div className="flex flex-col gap-6 w-full animate-fade-in">
                
                {/* Action Buttons Top Right */}
                <div className="flex items-center justify-end gap-2 w-full">
                  <Button type="button" variant="outline" className="h-8 border-[#28313C] bg-[#141A22] text-[11px] text-white hover:bg-white/[0.05]">
                    <UserPlus className="mr-1.5 size-3.5" /> Invite Members
                  </Button>
                  <Button type="button" variant="outline" className="h-8 border-[#28313C] bg-[#141A22] text-[11px] text-white hover:bg-white/[0.05]">
                    <Download className="mr-1.5 size-3.5" /> Export Directory
                  </Button>
                  <Button type="button" className="h-8 bg-[#4EA1FF] hover:bg-[#4EA1FF]/90 text-[11px] font-bold text-white ml-1 border-0">
                    <CheckCircle2 className="mr-1.5 size-3.5" /> Save Changes
                  </Button>
                </div>

                {/* 1. Member Management */}
                <div className="rounded-xl border border-[#28313C] bg-[#0E1116] overflow-hidden flex flex-col w-full">
                  <div className="flex items-center justify-between p-5 border-b border-[#28313C]">
                     <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-[#4EA1FF]/10 flex items-center justify-center border border-[#4EA1FF]/20 shrink-0">
                          <Users className="size-4 text-[#4EA1FF]" />
                        </div>
                        <div className="flex flex-col">
                          <h3 className="text-[13px] font-bold text-white">Member Management</h3>
                          <p className="text-[11px] text-muted-foreground">View and manage members, roles, and access.</p>
                        </div>
                     </div>
                     <div className="flex flex-wrap items-center gap-4 justify-end">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                          <input type="text" placeholder="Search members by name or email..." className="w-[260px] h-8 bg-[#141A22] border border-[#28313C] rounded-lg pl-9 pr-3 text-[11px] text-white outline-none focus:border-[#4EA1FF]/50 transition-colors" />
                        </div>
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                           <button type="button" className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#4EA1FF]/10 border border-[#4EA1FF]/30 text-[11px] font-medium text-[#7CC7FF] shrink-0">All members <span className="px-1.5 py-0.5 rounded bg-black/40 text-[10px]">42</span></button>
                           <button type="button" className="flex items-center gap-2 px-3 py-1.5 rounded border border-transparent hover:bg-white/[0.05] text-[11px] font-medium text-muted-foreground hover:text-white shrink-0">Active <span className="px-1.5 py-0.5 rounded bg-[#28313C] text-[10px]">36</span></button>
                           <button type="button" className="flex items-center gap-2 px-3 py-1.5 rounded border border-transparent hover:bg-white/[0.05] text-[11px] font-medium text-muted-foreground hover:text-white shrink-0">Pending invites <span className="px-1.5 py-0.5 rounded bg-[#28313C] text-[10px]">4</span></button>
                           <button type="button" className="flex items-center gap-2 px-3 py-1.5 rounded border border-transparent hover:bg-white/[0.05] text-[11px] font-medium text-muted-foreground hover:text-white shrink-0">Suspended <span className="px-1.5 py-0.5 rounded bg-[#28313C] text-[10px]">2</span></button>
                        </div>
                     </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] whitespace-nowrap">
                      <thead className="border-b border-[#28313C] text-[9px] text-muted-foreground font-bold tracking-widest uppercase">
                        <tr>
                          <th className="pl-5 pr-3 py-3">Member</th>
                          <th className="px-3 py-3">Email</th>
                          <th className="px-3 py-3">Role</th>
                          <th className="px-3 py-3">Department</th>
                          <th className="px-3 py-3">Last Active</th>
                          <th className="px-3 py-3">MFA</th>
                          <th className="px-3 py-3">Account Status</th>
                          <th className="pr-5 pl-3 py-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#28313C]">
                        {[
                          { initials: "JD", name: "Jane Doe", email: "jane.doe@geniuscapital.com", role: "Super Admin", roleColor: "text-[#7CC7FF] bg-[#4EA1FF]/10 border-[#4EA1FF]/20", icon: Star, dept: "Executive", active: "Today, 10:30 AM", mfa: true, status: "Active", avatarColor: "bg-[#4EA1FF]", dot: "bg-green-500" },
                          { initials: "SB", name: "Sam Bennett", email: "sam.bennett@geniuscapital.com", role: "Editor", roleColor: "text-[#7CC7FF] bg-[#7CC7FF]/10 border-[#7CC7FF]/20", dept: "Finance", active: "Today, 9:12 AM", mfa: true, status: "Active", avatarColor: "bg-[#7CC7FF]", dot: "bg-green-500" },
                          { initials: "RT", name: "Riley Thomas", email: "riley.thomas@geniuscapital.com", role: "Analyst", roleColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", dept: "Strategy", active: "Yesterday, 4:45 PM", mfa: true, status: "Active", avatarColor: "bg-emerald-600", dot: "bg-green-500" },
                          { initials: "MC", name: "Morgan Chen", email: "morgan.chen@geniuscapital.com", role: "Approver", roleColor: "text-orange-400 bg-orange-500/10 border-orange-500/20", icon: CheckCircle2, dept: "Risk", active: "May 14, 2025", mfa: true, status: "Active", avatarColor: "bg-orange-600", dot: "bg-green-500" },
                          { initials: "AL", name: "Alex Lee", email: "alex.lee@geniuscapital.com", role: "Viewer", roleColor: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20", dept: "Operations", active: "May 10, 2025", mfa: false, status: "Suspended", avatarColor: "bg-red-900 text-red-300", dot: "bg-gray-500" },
                        ].map((row, i) => (
                          <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="pl-5 pr-3 py-3">
                              <div className="flex items-center gap-3">
                                <div className={`size-7 rounded-full ${row.avatarColor} flex items-center justify-center shrink-0`}>
                                  <span className="text-[10px] font-bold text-white">{row.initials}</span>
                                </div>
                                <span className="font-semibold text-white">{row.name}</span>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-muted-foreground">{row.email}</td>
                            <td className="px-3 py-3">
                              <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-medium ${row.roleColor}`}>
                                {row.role}
                                {row.icon && <row.icon className="size-3" />}
                              </div>
                            </td>
                            <td className="px-3 py-3 text-muted-foreground">{row.dept}</td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2">
                                <span className={`size-1.5 rounded-full ${row.dot}`} />
                                <span className="text-muted-foreground">{row.active}</span>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              {row.mfa ? (
                                <div className="flex items-center gap-1.5 text-green-500">
                                  <CheckCircle2 className="size-3.5" /> <span className="text-[10px]">Enabled</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <div className="w-3.5 flex justify-center"><div className="w-2.5 h-[1.5px] bg-muted-foreground" /></div> <span className="text-[10px]">Disabled</span>
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-3">
                              <span className={row.status === "Active" ? "text-green-500 font-medium" : "text-red-500 font-medium"}>{row.status}</span>
                            </td>
                            <td className="pr-5 pl-3 py-3 text-center">
                              <button type="button" className="text-muted-foreground hover:text-white transition-colors">
                                <MoreHorizontal className="size-4 mx-auto" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3 Columns Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
                  
                  {/* Roles & Permissions */}
                  <div className="rounded-xl border border-[#28313C] bg-[#0E1116] overflow-hidden flex flex-col">
                    <div className="flex items-center gap-3 p-5 border-b border-[#28313C]">
                      <div className="size-8 rounded-lg bg-[#4EA1FF]/10 flex items-center justify-center border border-[#4EA1FF]/20 shrink-0">
                        <Shield className="size-4 text-[#4EA1FF]" />
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-[13px] font-bold text-white">Roles & Permissions</h3>
                        <p className="text-[11px] text-muted-foreground">Permissions matrix by role.</p>
                      </div>
                    </div>
                    <div className="p-4 overflow-x-auto">
                       <table className="w-full text-left text-[11px] whitespace-nowrap">
                         <thead className="text-[8px] text-muted-foreground font-bold tracking-widest uppercase">
                           <tr>
                             <th className="pb-3">Capability</th>
                             <th className="pb-3 text-center">Super Admin</th>
                             <th className="pb-3 text-center">Editor</th>
                             <th className="pb-3 text-center">Analyst</th>
                             <th className="pb-3 text-center">Viewer</th>
                             <th className="pb-3 text-center">Approver</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-[#28313C]/50">
                           {[
                             { label: "Approve AI actions", icon: ShieldCheck, perms: [2, 2, 1, 0, 2] },
                             { label: "Manage integrations", icon: Network, perms: [2, 2, 1, 0, 0] },
                             { label: "Edit company context", icon: FileText, perms: [2, 2, 2, 0, 0] },
                             { label: "Manage billing", icon: CreditCard, perms: [2, 1, 0, 0, 0] },
                             { label: "View audit logs", icon: History, perms: [2, 2, 2, 2, 2] },
                           ].map((row, i) => (
                             <tr key={i}>
                               <td className="py-2.5 flex items-center gap-2">
                                 <row.icon className="size-3.5 text-muted-foreground" />
                                 <span className="text-white">{row.label}</span>
                               </td>
                               {row.perms.map((p, j) => (
                                 <td key={j} className="py-2.5 text-center">
                                   {p === 2 ? <CheckCircle2 className="size-3.5 text-green-500 mx-auto" /> :
                                    p === 1 ? <div className="size-3.5 rounded-full border border-orange-500 mx-auto flex items-center justify-center"><div className="w-1.5 h-[1.5px] bg-orange-500" /></div> :
                                    <div className="size-3.5 rounded-full border border-muted-foreground mx-auto" />}
                                 </td>
                               ))}
                             </tr>
                           ))}
                         </tbody>
                       </table>
                    </div>
                  </div>

                  {/* Approval Authority */}
                  <div className="rounded-xl border border-[#28313C] bg-[#0E1116] overflow-hidden flex flex-col">
                    <div className="flex items-center gap-3 p-5 border-b border-[#28313C]">
                      <div className="size-8 rounded-lg bg-[#4EA1FF]/10 flex items-center justify-center border border-[#4EA1FF]/20 shrink-0">
                        <CheckCircle2 className="size-4 text-[#4EA1FF]" />
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-[13px] font-bold text-white">Approval Authority</h3>
                        <p className="text-[11px] text-muted-foreground">Define who can approve actions by risk level.</p>
                      </div>
                    </div>
                    <div className="p-4 overflow-x-auto">
                       <table className="w-full text-left text-[11px] whitespace-nowrap">
                         <thead className="text-[8px] text-muted-foreground font-bold tracking-widest uppercase">
                           <tr>
                             <th className="pb-3 w-1/3">Risk Level</th>
                             <th className="pb-3">Can Be Approved By</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-[#28313C]/50">
                           {[
                             { level: "Low", dot: "bg-green-500", roles: "Editor, Analyst, Approver, Super Admin" },
                             { level: "Medium", dot: "bg-yellow-500", roles: "Approver, Super Admin" },
                             { level: "High", dot: "bg-orange-500", roles: "Approver, Super Admin" },
                             { level: "Critical", dot: "bg-red-500", roles: "Super Admin only" },
                           ].map((row, i) => (
                             <tr key={i}>
                               <td className="py-3 flex items-center gap-2">
                                 <span className={`size-1.5 rounded-full ${row.dot}`} />
                                 <span className="text-white">{row.level}</span>
                               </td>
                               <td className="py-3 text-muted-foreground">{row.roles}</td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                    </div>
                  </div>

                  {/* Security & Authentication */}
                  <div className="rounded-xl border border-[#28313C] bg-[#0E1116] overflow-hidden flex flex-col">
                    <div className="flex items-center gap-3 p-5 border-b border-[#28313C]">
                      <div className="size-8 rounded-lg bg-[#4EA1FF]/10 flex items-center justify-center border border-[#4EA1FF]/20 shrink-0">
                        <Lock className="size-4 text-[#4EA1FF]" />
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-[13px] font-bold text-white">Security & Authentication</h3>
                        <p className="text-[11px] text-muted-foreground">Configure authentication and access controls.</p>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col gap-4">
                       <div className="flex items-center justify-between gap-4">
                         <div className="flex items-center gap-2">
                           <span className="text-[11px] text-white">Single Sign-On (SSO)</span>
                           <span className="px-1.5 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] font-bold tracking-widest uppercase">Enabled</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <span className="text-[10px] text-muted-foreground">SAML 2.0</span>
                           <div className="px-2 py-1 rounded bg-[#141A22] border border-[#28313C] flex items-center gap-1.5">
                             <div className="size-3 rounded-full border border-white flex items-center justify-center"><div className="size-1 bg-white rounded-full" /></div>
                             <span className="text-[10px] text-white">Okta</span>
                           </div>
                           <div className="px-2 py-1 rounded bg-[#141A22] border border-[#28313C] flex items-center gap-1.5">
                             <Grid className="size-3 text-[#4EA1FF]" />
                             <span className="text-[10px] text-white">Microsoft Entra ID</span>
                           </div>
                           <button type="button" className="size-6 rounded border border-[#28313C] bg-[#141A22] flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
                             <Plus className="size-3" />
                           </button>
                         </div>
                       </div>
                       
                       <div className="w-full h-px bg-[#28313C]/50" />
                       
                       <div className="flex items-center justify-between">
                         <span className="text-[11px] text-white">Enforce 2FA</span>
                         <CustomToggle checked={true} onChange={() => {}} />
                       </div>
                       
                       <div className="w-full h-px bg-[#28313C]/50" />
                       
                       <div className="flex items-center justify-between">
                         <span className="text-[11px] text-white">Session timeout</span>
                         <div className="flex items-center justify-between px-3 py-1.5 rounded border border-[#28313C] bg-[#141A22] w-[130px] cursor-pointer">
                           <span className="text-[11px] text-white">8 hours</span>
                           <ChevronDown className="size-3.5 text-muted-foreground" />
                         </div>
                       </div>
                       
                       <div className="w-full h-px bg-[#28313C]/50" />
                       
                       <div className="flex items-center justify-between gap-4">
                         <span className="text-[11px] text-white whitespace-nowrap">Domain allowlist</span>
                         <div className="flex items-center justify-end gap-2 overflow-hidden flex-1">
                           <div className="px-2 py-1 rounded-full bg-[#141A22] border border-[#28313C] flex items-center gap-1.5 shrink-0">
                             <span className="text-[10px] text-muted-foreground">geniuscapital.com</span>
                             <button className="text-muted-foreground hover:text-white"><X className="size-3" /></button>
                           </div>
                           <div className="flex items-center justify-between px-3 py-1.5 rounded border border-[#28313C] bg-[#141A22] min-w-[110px] cursor-pointer shrink-0">
                             <span className="text-[11px] text-muted-foreground">Add domain</span>
                             <ChevronDown className="size-3.5 text-muted-foreground" />
                           </div>
                         </div>
                       </div>
                       
                       <div className="w-full h-px bg-[#28313C]/50" />
                       
                       <div className="flex items-center justify-between">
                         <span className="text-[11px] text-white">SCIM provisioning</span>
                         <span className="text-[11px] text-green-500 font-medium">Enabled</span>
                       </div>
                    </div>
                  </div>

                </div>

                {/* 3. Pending Invitations */}
                <div className="rounded-xl border border-[#28313C] bg-[#0E1116] overflow-hidden flex flex-col w-full">
                  <div className="flex items-center gap-3 p-5 border-b border-[#28313C]">
                    <div className="size-8 rounded-lg bg-[#4EA1FF]/10 flex items-center justify-center border border-[#4EA1FF]/20 shrink-0">
                      <Mail className="size-4 text-[#4EA1FF]" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-[13px] font-bold text-white">Pending Invitations</h3>
                      <p className="text-[11px] text-muted-foreground">Manage outstanding invitations.</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] whitespace-nowrap">
                      <thead className="border-b border-[#28313C] text-[9px] text-muted-foreground font-bold tracking-widest uppercase">
                        <tr>
                          <th className="pl-5 pr-3 py-3">Invitee Email</th>
                          <th className="px-3 py-3">Role</th>
                          <th className="px-3 py-3">Invited By</th>
                          <th className="px-3 py-3">Date Sent</th>
                          <th className="px-3 py-3">Expires</th>
                          <th className="px-3 py-3 text-center">Status</th>
                          <th className="pr-5 pl-3 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#28313C]">
                        {[
                          { email: "olivia.parker@geniuscapital.com", role: "Editor", roleColor: "text-[#7CC7FF] bg-[#7CC7FF]/10 border-[#7CC7FF]/20", by: "Jane Doe", date: "May 15, 2025 10:15 AM", exp: "May 22, 2025 (7 days)", expColor: "text-yellow-500" },
                          { email: "david.nguyen@geniuscapital.com", role: "Analyst", roleColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", by: "Sam Bennett", date: "May 14, 2025 3:40 PM", exp: "May 21, 2025 (6 days)", expColor: "text-yellow-500" },
                          { email: "emily.ross@geniuscapital.com", role: "Approver", roleColor: "text-orange-400 bg-orange-500/10 border-orange-500/20", by: "Morgan Chen", date: "May 13, 2025 9:05 AM", exp: "May 20, 2025 (5 days)", expColor: "text-yellow-500" },
                        ].map((row, i) => (
                          <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                            <td className="pl-5 pr-3 py-3 text-muted-foreground">{row.email}</td>
                            <td className="px-3 py-3">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-medium ${row.roleColor}`}>
                                {row.role}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-muted-foreground">{row.by}</td>
                            <td className="px-3 py-3 text-muted-foreground">{row.date}</td>
                            <td className="px-3 py-3"><span className={row.expColor}>{row.exp}</span></td>
                            <td className="px-3 py-3 text-center">
                              <span className="px-2 py-0.5 rounded border border-yellow-500/20 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold tracking-widest uppercase">Pending</span>
                            </td>
                            <td className="pr-5 pl-3 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button type="button" className="px-3 py-1 rounded border border-[#4EA1FF]/30 text-[#7CC7FF] text-[10px] hover:bg-[#4EA1FF]/10 transition-colors">Resend</button>
                                <button type="button" className="px-3 py-1 rounded border border-red-500/30 text-red-400 text-[10px] hover:bg-red-500/10 transition-colors">Cancel</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            ) : activeNav === "security" ? (
              <div className="flex flex-col gap-6 animate-fade-in">
                <div>
                  <h2 className="text-lg font-bold text-white">Security & Data</h2>
                  <p className="mt-1 text-[11px] text-muted-foreground">Review workspace security posture and local policy switches for this MVP environment.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { field: "rlsEnabled", label: "RLS enabled", value: rlsEnabled, sub: "Server APIs still enforce capability checks." },
                    { field: "auditLogging", label: "Audit logging", value: auditEnabled, sub: "Audit events are retained with workspace state." },
                    { field: "restrictExport", label: "Export permission", value: exportEnabled, sub: "UI indicator only; server role still controls export." },
                    { field: "dataMasking", label: "Data masking", value: maskingEnabled, sub: "Member emails stay masked in public workspace data." },
                    { field: "autoPurge", label: "Auto purge", value: autoPurge, sub: "Policy indicator for retention review." },
                    { field: "softDelete", label: "Soft delete", value: softDelete, sub: "Disable members instead of removing audit subjects." },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-4 rounded-xl border border-[#28313C] bg-[#0E1116] p-4">
                      <div>
                        <span className="text-[11px] font-bold text-white">{item.label}</span>
                        <p className="mt-1 text-[10px] text-muted-foreground">{item.sub}</p>
                      </div>
                      <CustomToggle checked={item.value} disabled={busy || !canManageWorkspace} onChange={(value) => handlePolicyToggle(item.field, value)} />
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-[#28313C] bg-[#0E1116]">
                  <div className="flex items-center justify-between border-b border-[#28313C] p-5">
                    <h3 className="text-[11px] font-bold text-white">Audit log preview</h3>
                    <Button type="button" variant="outline" size="sm" disabled={!canExportData} onClick={handleExportWorkspace} className="h-7 border-[#28313C] bg-[#0E1116] text-[10px] text-white hover:bg-white/[0.05] disabled:opacity-50">
                      Export workspace
                    </Button>
                  </div>
                  <table className="w-full text-left text-[10px]">
                    <thead className="border-b border-[#28313C] text-muted-foreground">
                      <tr>
                        <th className="px-5 py-2 font-bold uppercase tracking-widest">Time</th>
                        <th className="px-5 py-2 font-bold uppercase tracking-widest">User</th>
                        <th className="px-5 py-2 font-bold uppercase tracking-widest">Action</th>
                        <th className="px-5 py-2 font-bold uppercase tracking-widest">Resource</th>
                        <th className="px-5 py-2 font-bold uppercase tracking-widest">IP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#28313C]/50">
                      {paginatedAuditLogs.map((log) => (
                        <tr key={`${log.time}-${log.resource}`} className="hover:bg-white/[0.02]">
                          <td className="px-5 py-3 text-muted-foreground">{log.time}</td>
                          <td className="px-5 py-3 text-white">{log.user}</td>
                          <td className="px-5 py-3 text-muted-foreground">{log.action}</td>
                          <td className="px-5 py-3 text-white">{log.resource}</td>
                          <td className="px-5 py-3 font-mono text-muted-foreground">{log.ip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex items-center justify-between border-t border-[#28313C] p-3 text-[10px] text-muted-foreground">
                    <span>Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, totalLogs)} of {totalLogs} audit events</span>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={handlePrevPage} disabled={currentPage === 1} className="flex size-6 items-center justify-center rounded transition-colors hover:bg-[#0E1116] hover:text-white disabled:opacity-50"><ChevronLeft className="size-3" /></button>
                      {Array.from({ length: totalPages }).map((_, index) => {
                        const page = index + 1;
                        return (
                          <button key={page} type="button" onClick={() => handlePageClick(page)} className={cn("flex size-6 items-center justify-center rounded font-medium transition-colors hover:bg-[#0E1116] hover:text-white", currentPage === page ? "bg-primary text-primary-foreground" : "")}>{page}</button>
                        );
                      })}
                      <button type="button" onClick={handleNextPage} disabled={currentPage === totalPages} className="flex size-6 items-center justify-center rounded transition-colors hover:bg-[#0E1116] hover:text-white disabled:opacity-50"><ChevronRight className="size-3" /></button>
                    </div>
                  </div>
                </div>
              </div>
  ) : activeNav === "ai" ? (
              <div className="flex flex-col gap-6 w-full animate-fade-in">
                
                {/* Action Buttons Top Right */}
                <div className="flex items-center justify-end gap-2 w-full">
                  <Button type="button" variant="outline" className="h-8 border-[#28313C] bg-[#141A22] text-[11px] text-white hover:bg-white/[0.05]">
                    <div className="border border-white/20 rounded-sm p-[1px] mr-1.5"><ChevronRight className="size-2.5" /></div> Test Configuration
                  </Button>
                  <Button type="button" variant="outline" className="h-8 border-[#28313C] bg-[#141A22] text-[11px] text-white hover:bg-white/[0.05]">
                    <RefreshCw className="mr-1.5 size-3.5" /> Reset Defaults
                  </Button>
                  <Button type="button" className="h-8 bg-[#4EA1FF] hover:bg-[#4EA1FF]/90 text-[11px] font-bold text-white ml-1 border-0">
                    <CheckCircle2 className="mr-1.5 size-3.5" /> Save Changes
                  </Button>
                </div>

                {/* ROW 1: 2 Columns */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
                  
                  {/* Provider Selection */}
                  <div className="rounded-xl border border-[#28313C] bg-[#0E1116] overflow-hidden flex flex-col">
                    <div className="flex items-center gap-3 p-5 border-b border-[#28313C]">
                      <div className="size-8 rounded-lg bg-[#4EA1FF]/10 flex items-center justify-center border border-[#4EA1FF]/20 shrink-0">
                        <Globe className="size-4 text-[#4EA1FF]" />
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-[13px] font-bold text-white">Provider Selection</h3>
                        <p className="text-[11px] text-muted-foreground">Choose and configure AI providers for your workspace.</p>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px] whitespace-nowrap">
                        <thead className="border-b border-[#28313C] text-[9px] text-muted-foreground font-bold tracking-widest uppercase">
                          <tr>
                            <th className="pl-5 pr-3 py-3">Provider</th>
                            <th className="px-3 py-3">Status</th>
                            <th className="px-3 py-3">Region</th>
                            <th className="px-3 py-3">Latency (P95)</th>
                            <th className="px-3 py-3">Default Model</th>
                            <th className="pr-5 pl-3 py-3"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#28313C]">
                          {[
                            { name: "OpenAI", model: "GPT-4o", logo: <div className="size-6 rounded-full border border-white/20 flex items-center justify-center"><Sparkles className="size-3 text-white" /></div>, region: "US East (Virginia)", ms: "412 ms", def: "gpt-4o" },
                            { name: "Anthropic", model: "Claude 3.5", logo: <div className="size-6 rounded-full bg-[#d97757] flex items-center justify-center text-white font-bold font-serif text-[12px]">A</div>, region: "US West (Oregon)", ms: "438 ms", def: "claude-3-5-sonnet-20240620" },
                            { name: "Google", model: "Gemini 1.5 Pro", logo: <div className="size-6 rounded-full bg-[#4EA1FF] flex items-center justify-center text-white font-bold text-[12px]">G</div>, region: "us-central1 (Iowa)", ms: "467 ms", def: "gemini-1.5-pro-002" },
                          ].map((row, i) => (
                            <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                              <td className="pl-5 pr-3 py-3">
                                <div className="flex items-center gap-3">
                                  {row.logo}
                                  <div className="flex flex-col gap-0.5">
                                    <span className="font-semibold text-white leading-none">{row.name}</span>
                                    <span className="text-[10px] text-muted-foreground leading-none">{row.model}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-1.5 text-white">
                                  <span className="size-1.5 rounded-full bg-green-500" /> <span className="text-[11px] font-medium">Connected</span>
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <div className="w-3 h-2 bg-[#4EA1FF] rounded-[1px] relative overflow-hidden flex shadow-sm"><div className="w-1/2 bg-white" /><div className="w-1/2 bg-red-500" /></div>
                                  <span>{row.region}</span>
                                </div>
                              </td>
                              <td className="px-3 py-3 text-green-500 font-medium">{row.ms}</td>
                              <td className="px-3 py-3">
                                <div className="flex items-center justify-between w-[150px] px-2.5 py-1.5 rounded border border-[#28313C] bg-[#141A22]">
                                  <span className="text-[10px] text-muted-foreground truncate">{row.def}</span>
                                  <ChevronDown className="size-3.5 text-muted-foreground opacity-50 shrink-0" />
                                </div>
                              </td>
                              <td className="pr-5 pl-3 py-3 text-right">
                                <button className="text-muted-foreground hover:text-white"><MoreHorizontal className="size-4" /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="p-5 mt-auto border-t border-[#28313C]/50 bg-[#0E1116] flex items-center gap-4">
                      <Button type="button" variant="outline" className="h-8 border-[#28313C] bg-[#141A22] text-[11px] text-white hover:bg-white/[0.05]">
                        <Plus className="mr-1.5 size-3.5" /> Add Provider
                      </Button>
                      <span className="text-[11px] text-muted-foreground">Connect a new AI provider to expand model access.</span>
                    </div>
                  </div>

                  {/* Agent Model Routing */}
                  <div className="rounded-xl border border-[#28313C] bg-[#0E1116] overflow-hidden flex flex-col">
                    <div className="flex items-center gap-3 p-5 border-b border-[#28313C]">
                      <div className="size-8 rounded-lg bg-[#4EA1FF]/10 flex items-center justify-center border border-[#4EA1FF]/20 shrink-0">
                        <Network className="size-4 text-[#4EA1FF]" />
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-[13px] font-bold text-white">Agent Model Routing</h3>
                        <p className="text-[11px] text-muted-foreground">Define primary and fallback models for each agent.</p>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px] whitespace-nowrap">
                        <thead className="border-b border-[#28313C] text-[9px] text-muted-foreground font-bold tracking-widest uppercase">
                          <tr>
                            <th className="pl-5 pr-3 py-3">Agent</th>
                            <th className="px-3 py-3">Primary Model</th>
                            <th className="px-3 py-3">Fallback Model</th>
                            <th className="px-3 py-3 text-center">Max Context</th>
                            <th className="px-3 py-3 text-center">Temperature</th>
                            <th className="pr-5 pl-3 py-3">Cost Tier</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#28313C]/50">
                          {[
                            { agent: "Contract Analyst", prim: "gpt-4o", fall: "claude-3-5-sonnet", ctx: "128K", temp: "0.2", tier: "Premium", tierColor: "text-[#7CC7FF] bg-[#7CC7FF]/10 border border-[#7CC7FF]/20" },
                            { agent: "Spend Auditor", prim: "claude-3-5-sonnet", fall: "gpt-4o-mini", ctx: "128K", temp: "0.1", tier: "Premium", tierColor: "text-[#7CC7FF] bg-[#7CC7FF]/10 border border-[#7CC7FF]/20" },
                            { agent: "Finance Watcher", prim: "gpt-4o-mini", fall: "gemini-1.5-pro", ctx: "64K", temp: "0.2", tier: "Balanced", tierColor: "text-[#7CC7FF] bg-[#4EA1FF]/10 border border-[#4EA1FF]/20" },
                            { agent: "Ops Monitor", prim: "gemini-1.5-pro", fall: "gpt-4o-mini", ctx: "128K", temp: "0.2", tier: "Balanced", tierColor: "text-[#7CC7FF] bg-[#4EA1FF]/10 border border-[#4EA1FF]/20" },
                            { agent: "Drafting Assistant", prim: "claude-3-5-haiku", fall: "gpt-4o-mini", ctx: "32K", temp: "0.3", tier: "Economy", tierColor: "text-green-400 bg-green-500/10 border border-green-500/20" },
                          ].map((row, i) => (
                            <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                              <td className="pl-5 pr-3 py-3 text-white font-medium">{row.agent}</td>
                              <td className="px-3 py-3">
                                <div className="flex items-center justify-between w-[120px] px-2 py-1.5 rounded border border-[#28313C] bg-[#141A22]">
                                  <span className="text-[10px] text-muted-foreground truncate">{row.prim}</span>
                                  <ChevronDown className="size-3.5 text-muted-foreground opacity-50 shrink-0" />
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex items-center justify-between w-[120px] px-2 py-1.5 rounded border border-[#28313C] bg-[#141A22]">
                                  <span className="text-[10px] text-muted-foreground truncate">{row.fall}</span>
                                  <ChevronDown className="size-3.5 text-muted-foreground opacity-50 shrink-0" />
                                </div>
                              </td>
                              <td className="px-3 py-3 text-center text-muted-foreground">{row.ctx}</td>
                              <td className="px-3 py-3 text-center text-muted-foreground">{row.temp}</td>
                              <td className="pr-5 pl-3 py-3">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${row.tierColor}`}>{row.tier}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

                {/* ROW 2: 3 Columns */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
                  
                  {/* Cost Guardrails */}
                  <div className="rounded-xl border border-[#28313C] bg-[#0E1116] overflow-hidden flex flex-col">
                    <div className="flex items-center gap-3 p-5 border-b border-[#28313C]">
                      <div className="size-8 rounded-lg bg-[#4EA1FF]/10 flex items-center justify-center border border-[#4EA1FF]/20 shrink-0">
                        <ShieldAlert className="size-4 text-[#4EA1FF]" />
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-[13px] font-bold text-white">Cost Guardrails</h3>
                        <p className="text-[11px] text-muted-foreground">Control AI spend with budgets, thresholds and anomaly detection.</p>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col gap-4">
                      
                      <div className="flex items-center justify-between group">
                        <span className="text-[11px] text-muted-foreground">Monthly AI Budget</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-bold text-white">$25,000.00</span>
                          <button className="text-muted-foreground hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"><Plus className="size-3 hidden" /><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg></button>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-white">Current Spend</span>
                          <span className="text-[11px] text-white font-medium">$12,345.67 (49%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#28313C] rounded-full overflow-hidden">
                          <div className="h-full bg-[#4EA1FF] rounded-full" style={{width: '49%'}} />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2.5 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">Tokens Used</span>
                          <span className="text-[11px] text-white">215,234,567</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">Requests</span>
                          <span className="text-[11px] text-white">84,732</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">Average Cost per 1M Tokens</span>
                          <span className="text-[11px] text-white">$0.573</span>
                        </div>
                      </div>

                      <div className="w-full h-px bg-[#28313C] my-1" />

                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between group">
                          <span className="text-[11px] text-muted-foreground">Hard Stop Threshold</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-white font-medium">$25,000.00 (100%)</span>
                            <button className="text-muted-foreground hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg></button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between group">
                          <span className="text-[11px] text-muted-foreground">Warning Threshold</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-white font-medium">$18,750.00 (75%)</span>
                            <button className="text-muted-foreground hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg></button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between cursor-pointer group">
                          <span className="text-[11px] text-muted-foreground">Per-Agent Budget Caps</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-white font-medium group-hover:text-[#7CC7FF] transition-colors">Configured (5)</span>
                            <ChevronRight className="size-3.5 text-muted-foreground group-hover:text-[#7CC7FF] transition-colors" />
                          </div>
                        </div>
                      </div>

                      <div className="w-full h-px bg-[#28313C] my-1" />

                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] font-medium text-white">Anomaly Detection</span>
                          <span className="text-[10px] text-muted-foreground">Detect unusual spend patterns</span>
                        </div>
                        <CustomToggle checked={true} onChange={() => {}} />
                      </div>

                    </div>
                  </div>

                  {/* Data Privacy Toggles */}
                  <div className="rounded-xl border border-[#28313C] bg-[#0E1116] overflow-hidden flex flex-col">
                    <div className="flex items-center gap-3 p-5 border-b border-[#28313C]">
                      <div className="size-8 rounded-lg bg-[#4EA1FF]/10 flex items-center justify-center border border-[#4EA1FF]/20 shrink-0">
                        <Lock className="size-4 text-[#4EA1FF]" />
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-[13px] font-bold text-white">Data Privacy Toggles</h3>
                        <p className="text-[11px] text-muted-foreground">Configure how data is handled across providers.</p>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col gap-6">
                      
                      <div className="flex flex-col gap-5">
                        {[
                          { icon: History, label: "Zero Data Retention", sub: "Do not retain prompts or completions", checked: true },
                          { icon: Shield, label: "Provider Training Opt-Out", sub: "Prevent providers from using data for training", checked: true },
                          { icon: FileText, label: "Redact PII Before Sending", sub: "Automatically detect and redact PII", checked: true },
                          { icon: Lock, label: "Encrypted Prompt Logging", sub: "Encrypt prompts and metadata at rest", checked: true },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <item.icon className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[11px] font-bold text-white">{item.label}</span>
                                <span className="text-[10px] text-muted-foreground leading-tight">{item.sub}</span>
                              </div>
                            </div>
                            <CustomToggle checked={item.checked} onChange={() => {}} />
                          </div>
                        ))}
                      </div>

                      <div className="w-full h-px bg-[#28313C]" />

                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] font-bold text-white">External Retention Policy</span>
                          <span className="text-[10px] text-muted-foreground">Set maximum retention for logs and metadata</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <button className="h-8 rounded border border-[#28313C] bg-[#141A22] text-[11px] text-muted-foreground hover:bg-white/[0.05] transition-colors">30 days</button>
                          <button className="h-8 rounded border border-[#28313C] bg-[#141A22] text-[11px] text-muted-foreground hover:bg-white/[0.05] transition-colors">90 days</button>
                          <button className="h-8 rounded border border-[#4EA1FF]/50 bg-[#4EA1FF]/10 text-[11px] text-[#7CC7FF] font-medium">180 days</button>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Runtime Policies */}
                  <div className="rounded-xl border border-[#28313C] bg-[#0E1116] overflow-hidden flex flex-col">
                    <div className="flex items-center gap-3 p-5 border-b border-[#28313C]">
                      <div className="size-8 rounded-lg bg-[#4EA1FF]/10 flex items-center justify-center border border-[#4EA1FF]/20 shrink-0">
                        <Timer className="size-4 text-[#4EA1FF]" />
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-[13px] font-bold text-white">Runtime Policies</h3>
                        <p className="text-[11px] text-muted-foreground">Set execution limits and behavior for all agent runs.</p>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col gap-5">
                      
                      <div className="flex flex-col gap-4">
                        {[
                          { label: "Max Concurrency", val: "10 concurrent runs" },
                          { label: "Retry Policy", val: "Exponential (3 retries)" },
                          { label: "Timeout per Request", val: "120 seconds" },
                          { label: "Max Tool-Calls per Request", val: "15" },
                          { label: "Escalation on Failure", val: "Notify + Fallback Model" },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-white">{item.label}</span>
                              <Info className="size-3 text-muted-foreground" />
                            </div>
                            <div className="flex items-center justify-between px-3 py-1.5 rounded border border-[#28313C] bg-[#141A22] min-w-[140px] cursor-pointer">
                              <span className="text-[10px] text-muted-foreground truncate">{item.val}</span>
                              <ChevronDown className="size-3.5 text-muted-foreground opacity-50 shrink-0" />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-auto pt-5 border-t border-[#28313C]/50">
                        <div className="flex items-center justify-between p-3 rounded-lg border border-[#4EA1FF]/20 bg-[#4EA1FF]/5 cursor-pointer group hover:bg-[#4EA1FF]/10 transition-colors">
                          <div className="flex items-start gap-3">
                            <Settings className="size-4 text-[#4EA1FF] mt-0.5" />
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[11px] font-bold text-[#7CC7FF]">Advanced Runtime Settings</span>
                              <span className="text-[10px] text-muted-foreground group-hover:text-muted-foreground/80">Circuit breakers, rate limits, caching, and more</span>
                            </div>
                          </div>
                          <ChevronRight className="size-3.5 text-[#4EA1FF]" />
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

              </div>
) : activeNav === "notifications" ? (
              <div className="flex flex-col gap-6 w-full animate-fade-in">
                
                {/* Header & Action Buttons Top Right */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <h2 className="text-lg font-bold text-white">Notifications & Alerts</h2>
                    <p className="text-[11px] text-muted-foreground">Configure how and where your team receives notifications and alerts.</p>
                  </div>
                  <div className="flex items-center justify-end gap-2 shrink-0">
                    <Button type="button" variant="outline" className="h-8 border-[#28313C] bg-[#0E1116] text-[11px] text-white hover:bg-white/[0.05]">
                      Discard changes
                    </Button>
                    <Button type="button" className="h-8 bg-[#4EA1FF] hover:bg-[#4EA1FF]/90 text-[11px] font-bold text-white ml-1 border-0">
                      Save changes
                    </Button>
                  </div>
                </div>

                {/* Tabs Sub-navigation */}
                <div className="flex items-center gap-6 border-b border-[#28313C] pb-3 mb-2 overflow-x-auto whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-[#4EA1FF] font-bold text-[11px] cursor-pointer pb-3 -mb-3 border-b-2 border-[#4EA1FF] shrink-0">
                    <Activity className="size-3.5" /> Routing Rules
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground hover:text-white font-medium text-[11px] cursor-pointer pb-3 -mb-3 border-b-2 border-transparent shrink-0 transition-colors">
                    <Bell className="size-3.5" /> Alert Thresholds
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground hover:text-white font-medium text-[11px] cursor-pointer pb-3 -mb-3 border-b-2 border-transparent shrink-0 transition-colors">
                    <Clock className="size-3.5" /> Quiet Hours
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground hover:text-white font-medium text-[11px] cursor-pointer pb-3 -mb-3 border-b-2 border-transparent shrink-0 transition-colors">
                    <MessageSquare className="size-3.5" /> Notification Channels
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground hover:text-white font-medium text-[11px] cursor-pointer pb-3 -mb-3 border-b-2 border-transparent shrink-0 transition-colors">
                    <FileText className="size-3.5" /> Digest & Summary
                  </div>
                </div>

                {/* Block 1: Routing Rules */}
                <div className="rounded-xl border border-[#28313C] bg-[#0E1116] flex flex-col w-full">
                  <div className="flex items-center justify-between p-5 border-b border-[#28313C]">
                    <div className="flex flex-col">
                      <h3 className="text-[13px] font-bold text-white">Routing Rules</h3>
                      <p className="text-[11px] text-muted-foreground">Define where different types of notifications and approval requests are sent.</p>
                    </div>
                    <Button type="button" variant="outline" className="h-7 border-[#4EA1FF]/30 bg-[#4EA1FF]/10 text-[10px] text-[#7CC7FF] hover:bg-[#4EA1FF]/20 shrink-0 transition-colors">
                      <Plus className="mr-1 size-3" /> Add routing rule
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] whitespace-nowrap">
                      <thead className="border-b border-[#28313C] text-[9px] text-muted-foreground font-bold tracking-widest uppercase">
                        <tr>
                          <th className="pl-5 pr-3 py-3 w-[20%]">Event Type</th>
                          <th className="px-3 py-3 w-[30%]">Description</th>
                          <th className="px-3 py-3 w-[20%]">Channel / Recipients</th>
                          <th className="px-3 py-3 w-[15%]">Delivery Method</th>
                          <th className="px-3 py-3 w-[10%]">Status</th>
                          <th className="pr-5 pl-3 py-3 w-[5%] text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#28313C]/50">
                        {[
                          { title: "Approval Requests", icon: <CheckCircle2 className="size-4 text-green-500" />, iconBg: "border-green-500/20 bg-green-500/10", desc: "Requests that require human approval before an action is executed.", chanIcon: <div className="grid grid-cols-2 gap-[1px] rotate-45 size-3.5"><div className="bg-[#E01E5A] rounded-full w-full h-full"/><div className="bg-[#36C5F0] rounded-full w-full h-full"/><div className="bg-[#2EB67D] rounded-full w-full h-full"/><div className="bg-[#ECB22E] rounded-full w-full h-full"/></div>, chanName: "#finance-approvals", chanSub: "3 members", meth: "Slack" },
                          { title: "Risk Alerts", icon: <AlertTriangle className="size-4 text-pink-500" />, iconBg: "border-pink-500/20 bg-pink-500/10", desc: "High or critical risks detected by AI agents.", chanIcon: <Mail className="size-3.5 text-[#7CC7FF]" />, chanName: "risk@greenfarm.com", chanSub: "5 recipients", meth: "Email" },
                          { title: "Legal Reviews", icon: <FileText className="size-4 text-orange-500" />, iconBg: "border-orange-500/20 bg-orange-500/10", desc: "Documents or actions that require legal review.", chanIcon: <Mail className="size-3.5 text-[#7CC7FF]" />, chanName: "legal@greenfarm.com", chanSub: "4 recipients", meth: "Email" },
                          { title: "System Alerts", icon: <Info className="size-4 text-[#4EA1FF]" />, iconBg: "border-[#4EA1FF]/20 bg-[#4EA1FF]/10", desc: "System issues, downtime, or performance problems.", chanIcon: <div className="grid grid-cols-2 gap-[1px] rotate-45 size-3.5"><div className="bg-[#E01E5A] rounded-full w-full h-full"/><div className="bg-[#36C5F0] rounded-full w-full h-full"/><div className="bg-[#2EB67D] rounded-full w-full h-full"/><div className="bg-[#ECB22E] rounded-full w-full h-full"/></div>, chanName: "#system-alerts", chanSub: "6 members", meth: "Slack" },
                          { title: "AI Agent Failures", icon: <Bot className="size-4 text-emerald-500" />, iconBg: "border-emerald-500/20 bg-emerald-500/10", desc: "Failures in agent execution or tool errors.", chanIcon: <Mail className="size-3.5 text-[#7CC7FF]" />, chanName: "team@greenfarm.com", chanSub: "8 recipients", meth: "Email" },
                          { title: "Weekly Digest", icon: <LineChart className="size-4 text-[#7CC7FF]" />, iconBg: "border-[#7CC7FF]/20 bg-[#7CC7FF]/10", desc: "Summary of key updates and actions from the past week.", chanIcon: <Mail className="size-3.5 text-[#7CC7FF]" />, chanName: "digest@greenfarm.com", chanSub: "12 recipients", meth: "Email" },
                        ].map((row, i) => (
                          <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="pl-5 pr-3 py-3">
                              <div className="flex items-center gap-3">
                                <div className={`size-7 rounded border flex items-center justify-center shrink-0 ${row.iconBg}`}>
                                  {row.icon}
                                </div>
                                <span className="font-bold text-white">{row.title}</span>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <p className="text-muted-foreground whitespace-normal min-w-[200px] leading-relaxed text-[10px] pr-8">{row.desc}</p>
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2">
                                {row.chanIcon}
                                <div className="flex flex-col">
                                  <span className="font-semibold text-white">{row.chanName}</span>
                                  <span className="text-[9px] text-muted-foreground">{row.chanSub}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-muted-foreground">{row.meth}</td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-1.5 text-green-500">
                                <span className="size-1.5 rounded-full bg-green-500" />
                                <span className="font-medium text-[10px]">Active</span>
                              </div>
                            </td>
                            <td className="pr-5 pl-3 py-3">
                              <div className="flex items-center justify-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                <button className="size-6 rounded border border-[#28313C] bg-[#141A22] flex items-center justify-center text-muted-foreground hover:text-white transition-colors"><Pencil className="size-3" /></button>
                                <button className="size-6 rounded border border-[#28313C] bg-[#141A22] flex items-center justify-center text-muted-foreground hover:text-white transition-colors"><MoreHorizontal className="size-3" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-center p-3 border-t border-[#28313C]/50">
                    <a href="#" className="flex items-center gap-1 text-[10px] font-bold text-[#4EA1FF] hover:text-[#7CC7FF] transition-colors">
                      View all routing rules <ArrowRight className="size-3" />
                    </a>
                  </div>
                </div>

                {/* Block 2 & 3: Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6 w-full">
                  
                  {/* Alert Thresholds */}
                  <div className="rounded-xl border border-[#28313C] bg-[#0E1116] flex flex-col p-6">
                    <div className="flex flex-col gap-1 mb-6">
                      <h3 className="text-[13px] font-bold text-white">Alert Thresholds</h3>
                      <p className="text-[11px] text-muted-foreground">Set thresholds for alerts and choose how sensitive notifications should be.</p>
                    </div>
                    <div className="flex flex-col gap-4">
                      {[
                        { title: "Risk severity", sub: "Notify when risks are at or above the selected level", icon: <Lock className="size-3.5 text-yellow-500" />, valIcon: <div className="size-1.5 rounded-full bg-red-500 mr-1.5"/>, valText: "High and above", type: "select" },
                        { title: "Approval amount", sub: "Notify for actions over the specified amount", icon: <BadgeDollarSign className="size-3.5 text-green-500" />, valText: "$10,000", type: "select" },
                        { title: "Confidence score", sub: "Notify when AI confidence is below the threshold", icon: <Activity className="size-3.5 text-[#4EA1FF]" />, valText: "70%", type: "select" },
                        { title: "Data anomalies", sub: "Notify when anomalies exceed the defined threshold", icon: <Settings className="size-3.5 text-muted-foreground" />, valText: "Medium sensitivity", type: "select" },
                        { title: "System updates", sub: "Notify about important system updates and maintenance", icon: <Settings className="size-3.5 text-muted-foreground" />, type: "toggle", checked: true },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between gap-4 group">
                          <div className="flex items-center gap-3">
                            <div className="size-7 rounded border border-[#28313C] bg-[#141A22] flex items-center justify-center shrink-0">
                              {item.icon}
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[11px] font-bold text-white">{item.title}</span>
                              <span className="text-[10px] text-muted-foreground leading-tight">{item.sub}</span>
                            </div>
                          </div>
                          {item.type === "select" ? (
                            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg border border-[#28313C] bg-[#141A22] min-w-[200px] cursor-pointer group-hover:border-primary/30 transition-colors">
                              <div className="flex items-center text-[11px] text-white font-medium">
                                {item.valIcon}
                                {item.valText}
                              </div>
                              <ChevronDown className="size-3.5 text-muted-foreground" />
                            </div>
                          ) : (
                            <CustomToggle checked={item.checked} onChange={() => {}} />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-[#28313C]/50">
                      <a href="#" className="flex items-center gap-1 text-[10px] font-bold text-[#4EA1FF] hover:text-[#7CC7FF] transition-colors">
                        Learn more about alert thresholds <ArrowRight className="size-3" />
                      </a>
                    </div>
                  </div>

                  {/* Notification Sensitivity Presets */}
                  <div className="rounded-xl border border-[#28313C] bg-[#0E1116] flex flex-col p-6">
                    <div className="flex flex-col gap-1 mb-5">
                      <h3 className="text-[13px] font-bold text-white">Notification Sensitivity Presets</h3>
                      <p className="text-[11px] text-muted-foreground">Choose a preset to quickly adjust your alert preferences.</p>
                    </div>
                    <div className="flex flex-col gap-3">
                      
                      <div className="flex items-center justify-between p-4 rounded-lg border border-[#4EA1FF]/50 bg-[#4EA1FF]/5 cursor-pointer">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <div className="size-6 rounded border border-[#4EA1FF]/30 bg-[#4EA1FF]/20 flex items-center justify-center shrink-0">
                              <Settings className="size-3 text-[#7CC7FF]" />
                            </div>
                            <span className="text-[12px] font-bold text-white">Balanced</span>
                            <span className="px-1.5 py-[1px] rounded text-[8px] font-bold bg-[#141A22] border border-[#28313C] text-muted-foreground uppercase tracking-widest">Recommended</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground leading-relaxed pr-10">Recommended for most teams. Important alerts with moderate frequency.</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#4EA1FF] text-white">Active</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg border border-[#28313C] bg-[#141A22] cursor-pointer hover:border-[#28313C] hover:bg-white/[0.02] transition-colors">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <div className="size-6 rounded border border-red-500/30 bg-red-500/10 flex items-center justify-center shrink-0">
                              <Flame className="size-3 text-red-500" />
                            </div>
                            <span className="text-[12px] font-bold text-white">High signal</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground leading-relaxed pr-10">Only critical alerts and approvals. Minimal noise.</span>
                        </div>
                        <div className="size-4 rounded-full border border-[#28313C] shrink-0" />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg border border-[#28313C] bg-[#141A22] cursor-pointer hover:border-[#28313C] hover:bg-white/[0.02] transition-colors">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <div className="size-6 rounded border border-gray-500/30 bg-gray-500/10 flex items-center justify-center shrink-0">
                              <Speaker className="size-3 text-gray-400" />
                            </div>
                            <span className="text-[12px] font-bold text-white">High visibility</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground leading-relaxed pr-10">All alerts and updates. Maximum visibility.</span>
                        </div>
                        <div className="size-4 rounded-full border border-[#28313C] shrink-0" />
                      </div>

                    </div>
                  </div>

                </div>

                {/* Block 4: Quiet Hours */}
                <div className="rounded-xl border border-[#28313C] bg-[#0E1116] flex flex-col p-6">
                  <div className="flex items-start justify-between w-full pb-6 border-b border-[#28313C]/50 mb-6">
                    <div className="flex flex-col gap-4 max-w-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                          <h3 className="text-[13px] font-bold text-white">Quiet Hours</h3>
                          <p className="text-[11px] text-muted-foreground">Pause non-critical notifications during off-hours.</p>
                        </div>
                        <CustomToggle checked={true} onChange={() => {}} />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] text-muted-foreground font-medium">Start time</span>
                          <div className="flex items-center justify-between px-3 py-1.5 rounded border border-[#28313C] bg-[#141A22] cursor-pointer">
                            <span className="text-[11px] text-white">22:00</span>
                            <ChevronDown className="size-3.5 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] text-muted-foreground font-medium">End time</span>
                          <div className="flex items-center justify-between px-3 py-1.5 rounded border border-[#28313C] bg-[#141A22] cursor-pointer">
                            <span className="text-[11px] text-white">07:00</span>
                            <ChevronDown className="size-3.5 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] text-muted-foreground font-medium">Timezone</span>
                          <div className="flex items-center justify-between px-3 py-1.5 rounded border border-[#28313C] bg-[#141A22] cursor-pointer">
                            <span className="text-[11px] text-white truncate">(UTC+03:00) Moscow</span>
                            <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-16 border-l border-[#28313C]/50 pl-16">
                      <div className="flex flex-col gap-3">
                        <span className="text-[11px] font-bold text-white mb-1">What&apos;s paused?</span>
                        <div className="flex gap-8">
                          <div className="flex flex-col gap-2.5">
                            {[
                              "Info alerts", "Weekly digests", "System updates"
                            ].map((s,i) => (
                              <div key={i} className="flex items-center gap-2">
                                <Check className="size-3 text-green-500" />
                                <span className="text-[10px] text-muted-foreground">{s}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex flex-col gap-2.5">
                            {[
                              "Performance summaries", "Tips and suggestions"
                            ].map((s,i) => (
                              <div key={i} className="flex items-center gap-2">
                                <Check className="size-3 text-green-500" />
                                <span className="text-[10px] text-muted-foreground">{s}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <span className="text-[11px] font-bold text-white mb-1">What&apos;s not paused?</span>
                        <div className="flex gap-8">
                          <div className="flex flex-col gap-2.5">
                            {[
                              "Approval requests", "High and critical risks", "System outages"
                            ].map((s,i) => (
                              <div key={i} className="flex items-center gap-2">
                                <AlertTriangle className="size-3 text-orange-500" />
                                <span className="text-[10px] text-white font-medium">{s}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex flex-col gap-2.5">
                            {[
                              "AI agent failures", "Security alerts"
                            ].map((s,i) => (
                              <div key={i} className="flex items-center gap-2">
                                <AlertTriangle className="size-3 text-orange-500" />
                                <span className="text-[10px] text-white font-medium">{s}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Block 5: Test Notifications */}
                <div className="rounded-xl border border-[#28313C] bg-[#0E1116] flex items-center justify-between p-6 w-full">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-[13px] font-bold text-white">Test Notifications</h3>
                    <p className="text-[11px] text-muted-foreground">Send a test notification to verify your routing rules and channels.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-between px-3 py-1.5 rounded border border-[#28313C] bg-[#141A22] w-[180px] cursor-pointer">
                      <span className="text-[11px] text-white">Select event type</span>
                      <ChevronDown className="size-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#28313C] bg-[#141A22] cursor-pointer hover:bg-white/[0.05] transition-colors">
                      <MessageSquare className="size-3.5 text-muted-foreground" />
                      <span className="text-[11px] text-white">Choose channel</span>
                    </div>
                    <Button type="button" className="h-8 bg-[#4EA1FF] hover:bg-[#4EA1FF]/90 text-[11px] font-bold text-white px-4 border-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3 mr-1.5"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg> Send test notification
                    </Button>
                  </div>
                </div>

              </div>
            ) : activeNav === "connectors" ? (
              <div className="flex flex-col gap-6 w-full animate-fade-in">
                
                {/* Action Buttons Top Right */}
                <div className="flex items-center justify-end gap-2 w-full">
                  <Button type="button" variant="outline" className="h-8 border-[#28313C] bg-[#141A22] text-[11px] text-white hover:bg-white/[0.05]">
                    <Grid className="mr-1.5 size-3.5" /> Connect App
                  </Button>
                  <Button type="button" variant="outline" className="h-8 border-[#28313C] bg-[#141A22] text-[11px] text-white hover:bg-white/[0.05]">
                    <Key className="mr-1.5 size-3.5" /> Create API Key
                  </Button>
                  <Button type="button" className="h-8 bg-[#4EA1FF] hover:bg-[#4EA1FF]/90 text-[11px] font-bold text-white ml-1 border-0">
                    <CheckCircle2 className="mr-1.5 size-3.5" /> Save Changes
                  </Button>
                </div>

                {/* ROW 1: 2 Columns */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
                  
                  {/* Connected Apps */}
                  <div className="rounded-xl border border-[#28313C] bg-[#0E1116] overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between p-5 border-b border-[#28313C]">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-[#4EA1FF]/10 flex items-center justify-center border border-[#4EA1FF]/20 shrink-0">
                          <Globe className="size-4 text-[#4EA1FF]" />
                        </div>
                        <div className="flex flex-col">
                          <h3 className="text-[13px] font-bold text-white">Connected Apps</h3>
                          <p className="text-[11px] text-muted-foreground">Manage third-party applications connected to your workspace.</p>
                        </div>
                      </div>
                      <Button type="button" variant="outline" className="h-7 border-[#28313C] bg-[#141A22] text-[10px] text-white hover:bg-white/[0.05] shrink-0">
                        <Plus className="mr-1 size-3" /> Connect App
                      </Button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px] whitespace-nowrap">
                        <thead className="border-b border-[#28313C] text-[9px] text-muted-foreground font-bold tracking-widest uppercase">
                          <tr>
                            <th className="pl-5 pr-3 py-3">App</th>
                            <th className="px-3 py-3">Status</th>
                            <th className="px-3 py-3">Workspace / Account</th>
                            <th className="px-3 py-3">Scopes</th>
                            <th className="px-3 py-3">Last Sync</th>
                            <th className="px-3 py-3 text-center">Configure</th>
                            <th className="pr-5 pl-3 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#28313C]">
                          {[
                            { name: "Slack", icon: <div className="grid grid-cols-2 gap-[1px] rotate-45 size-4"><div className="bg-[#E01E5A] rounded-full w-full h-full"/><div className="bg-[#36C5F0] rounded-full w-full h-full"/><div className="bg-[#2EB67D] rounded-full w-full h-full"/><div className="bg-[#ECB22E] rounded-full w-full h-full"/></div>, ws: "Genius Capital", sub: "Slack Workspace", scopes: "channels:read", scopes2: "users:read, more", time: "May 15, 2025", time2: "10:28 PM" },
                            { name: "Microsoft Teams", icon: <div className="bg-[#6264A7] size-4 rounded-sm flex items-center justify-center text-white font-bold text-[8px]">T</div>, ws: "Genius Capital", sub: "Teams Tenant", scopes: "channels:read", scopes2: "members:read, more", time: "May 15, 2025", time2: "9:41 PM" },
                            { name: "Google Drive", icon: <div className="relative size-4 flex items-center justify-center"><div className="absolute w-2 h-3 bg-[#FFD04B] rotate-[-60deg] -translate-x-[2px] translate-y-[1px]" /><div className="absolute w-2 h-3 bg-[#00AC47] translate-x-[3px] translate-y-[2px]" /><div className="absolute w-3 h-1.5 bg-[#4285F4] -translate-y-[3px]" /></div>, ws: "genius-capital.com", sub: "Google Workspace", scopes: "drive.readonly", scopes2: "file.metadata, more", time: "May 15, 2025", time2: "8:16 PM" },
                            { name: "Notion", icon: <div className="bg-white text-black size-4 rounded-sm flex items-center justify-center font-serif font-bold text-[10px]">N</div>, ws: "Genius Capital", sub: "Notion Workspace", scopes: "pages:read", scopes2: "databases:read, more", time: "May 15, 2025", time2: "7:32 PM" },
                            { name: "Salesforce", icon: <div className="text-[#00A1E0] size-4 flex items-center justify-center"><Cloud className="size-4 fill-current" /></div>, ws: "Genius Capital", sub: "Production Org", scopes: "api:read", scopes2: "objects:read, more", time: "May 15, 2025", time2: "6:04 PM" },
                            { name: "HubSpot", icon: <div className="text-[#FF7A59] size-4 flex items-center justify-center"><Share2 className="size-4 fill-current" /></div>, ws: "Genius Capital", sub: "Hub ID: 12345678", scopes: "crm.objects.read", scopes2: "crm.schemas.read, more", time: "May 15, 2025", time2: "5:22 PM" },
                          ].map((row, i) => (
                            <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                              <td className="pl-5 pr-3 py-3">
                                <div className="flex items-center gap-2.5">
                                  {row.icon}
                                  <span className="font-semibold text-white">{row.name}</span>
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-1.5 text-white">
                                  <span className="size-1.5 rounded-full bg-green-500" /> <span className="text-[11px] font-medium text-green-500">Connected</span>
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex flex-col">
                                  <span className="text-white">{row.ws}</span>
                                  <span className="text-[10px] text-muted-foreground">{row.sub}</span>
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex flex-col">
                                  <span className="text-muted-foreground">{row.scopes}</span>
                                  <span className="text-[10px] text-muted-foreground">{row.scopes2}</span>
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex flex-col">
                                  <span className="text-muted-foreground">{row.time}</span>
                                  <span className="text-[10px] text-muted-foreground">{row.time2}</span>
                                </div>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <button className="px-2.5 py-1 rounded border border-[#28313C] bg-[#141A22] text-[10px] text-white hover:bg-white/[0.05] transition-colors">Configure</button>
                              </td>
                              <td className="pr-5 pl-3 py-3 text-right">
                                <button className="text-muted-foreground hover:text-white"><MoreHorizontal className="size-4" /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* API Keys */}
                  <div className="rounded-xl border border-[#28313C] bg-[#0E1116] overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between p-5 border-b border-[#28313C]">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-[#4EA1FF]/10 flex items-center justify-center border border-[#4EA1FF]/20 shrink-0">
                          <Key className="size-4 text-[#4EA1FF]" />
                        </div>
                        <div className="flex flex-col">
                          <h3 className="text-[13px] font-bold text-white">API Keys</h3>
                          <p className="text-[11px] text-muted-foreground">Manage API keys for programmatic access to your workspace data.</p>
                        </div>
                      </div>
                      <Button type="button" variant="outline" className="h-7 border-[#28313C] bg-[#141A22] text-[10px] text-white hover:bg-white/[0.05] shrink-0">
                        <Plus className="mr-1 size-3" /> Create API Key
                      </Button>
                    </div>
                    <div className="overflow-x-auto flex-1">
                      <table className="w-full text-left text-[11px] whitespace-nowrap">
                        <thead className="border-b border-[#28313C] text-[9px] text-muted-foreground font-bold tracking-widest uppercase">
                          <tr>
                            <th className="pl-5 pr-3 py-3">Key Name</th>
                            <th className="px-3 py-3">Key Prefix</th>
                            <th className="px-3 py-3">Created By</th>
                            <th className="px-3 py-3">Created</th>
                            <th className="px-3 py-3">Last Used</th>
                            <th className="px-3 py-3">Permissions</th>
                            <th className="px-3 py-3">Expiry</th>
                            <th className="pr-5 pl-3 py-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#28313C]">
                          {[
                            { name: "Analytics Service", prefix: "gcap_live_7f3a...", by: "Jane Doe", created: "May 10, 2025", used: "May 15, 2025", used2: "10:21 PM", perms: "Read", exp: "Jun 10, 2026", exp2: "(365 days)" },
                            { name: "Data Pipeline", prefix: "gcap_live_ab9c...", by: "John Smith", created: "May 8, 2025", used: "May 15, 2025", used2: "9:05 PM", perms: "Read / Write", exp: "May 8, 2026", exp2: "(365 days)" },
                            { name: "BI Dashboard", prefix: "gcap_live_3d1e...", by: "Maria Garcia", created: "Apr 28, 2025", used: "May 15, 2025", used2: "8:44 AM", perms: "Read", exp: "Apr 28, 2026", exp2: "(365 days)" },
                            { name: "Mobile App", prefix: "gcap_live_9b2f...", by: "Alex Chen", created: "Apr 15, 2025", used: "May 14, 2025", used2: "11:32 PM", perms: "Read / Write", exp: "Apr 15, 2026", exp2: "(365 days)" },
                            { name: "Reports Exporter", prefix: "gcap_live_c8e4...", by: "Priya Nair", created: "Mar 30, 2025", used: "May 13, 2025", used2: "6:18 PM", perms: "Read", exp: "Mar 30, 2026", exp2: "(365 days)" },
                          ].map((row, i) => (
                            <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                              <td className="pl-5 pr-3 py-3 text-white font-medium">{row.name}</td>
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-1.5 text-muted-foreground group cursor-pointer hover:text-white transition-colors">
                                  <span className="font-mono text-[10px]">{row.prefix}</span>
                                  <Copy className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </td>
                              <td className="px-3 py-3 text-muted-foreground">{row.by}</td>
                              <td className="px-3 py-3 text-muted-foreground">{row.created}</td>
                              <td className="px-3 py-3">
                                <div className="flex flex-col">
                                  <span className="text-muted-foreground">{row.used}</span>
                                  <span className="text-[10px] text-muted-foreground">{row.used2}</span>
                                </div>
                              </td>
                              <td className="px-3 py-3 text-muted-foreground">{row.perms}</td>
                              <td className="px-3 py-3">
                                <div className="flex flex-col">
                                  <span className="text-white">{row.exp}</span>
                                  <span className="text-[10px] text-muted-foreground">{row.exp2}</span>
                                </div>
                              </td>
                              <td className="pr-5 pl-3 py-3">
                                <div className="flex items-center justify-end gap-1">
                                  <button className="size-6 rounded border border-[#4EA1FF]/20 bg-[#4EA1FF]/10 text-[#7CC7FF] flex items-center justify-center hover:bg-[#4EA1FF]/20 transition-colors"><RefreshCw className="size-3" /></button>
                                  <button className="size-6 rounded border border-red-500/20 bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors"><Trash2 className="size-3" /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="p-3 border-t border-[#28313C]/50 bg-[#0E1116] flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <ShieldCheck className="size-3.5" /> API keys are encrypted and never shown in full. Store them securely.
                      </div>
                      <a href="#" className="flex items-center gap-1 text-[10px] text-[#7CC7FF] hover:text-[#7CC7FF] transition-colors">
                        Learn more about API access <ExternalLink className="size-3" />
                      </a>
                    </div>
                  </div>

                </div>

                {/* ROW 2: 3 Columns */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
                  
                  {/* Webhooks */}
                  <div className="rounded-xl border border-[#28313C] bg-[#0E1116] overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between p-5 border-b border-[#28313C]">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-[#4EA1FF]/10 flex items-center justify-center border border-[#4EA1FF]/20 shrink-0">
                          <Network className="size-4 text-[#4EA1FF]" />
                        </div>
                        <div className="flex flex-col">
                          <h3 className="text-[13px] font-bold text-white">Webhooks</h3>
                          <p className="text-[11px] text-muted-foreground">Receive real-time event notifications from your workspace.</p>
                        </div>
                      </div>
                      <Button type="button" variant="outline" className="h-7 border-[#28313C] bg-[#141A22] text-[10px] text-white hover:bg-white/[0.05] shrink-0">
                        <Plus className="mr-1 size-3" /> Add Webhook
                      </Button>
                    </div>
                    <div className="overflow-x-auto flex-1">
                      <table className="w-full text-left text-[11px] whitespace-nowrap">
                        <thead className="border-b border-[#28313C] text-[9px] text-muted-foreground font-bold tracking-widest uppercase">
                          <tr>
                            <th className="pl-5 pr-3 py-3">Webhook Name</th>
                            <th className="px-3 py-3">Endpoint URL</th>
                            <th className="px-3 py-3">Events</th>
                            <th className="px-3 py-3">Secret Verification</th>
                            <th className="px-3 py-3">Retry Policy</th>
                            <th className="pr-5 pl-3 py-3 text-center">Active</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#28313C]">
                          {[
                            { name: "Data Updates", url: "https://hooks.geniuscap...", ev: "data.updated", pol: "Exponential (5)" },
                            { name: "User Provisioning", url: "https://hooks.geniuscap...", ev: "user.created", pol: "Exponential (5)" },
                            { name: "Report Completed", url: "https://hooks.geniuscap...", ev: "report.completed", pol: "Exponential (3)" },
                            { name: "Security Alerts", url: "https://hooks.geniuscap...", ev: "security.alert", pol: "Exponential (5)" },
                            { name: "Integrations Sync", url: "https://hooks.geniuscap...", ev: "integration.sync", pol: "Exponential (3)" },
                          ].map((row, i) => (
                            <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                              <td className="pl-5 pr-3 py-3 text-white font-medium">{row.name}</td>
                              <td className="px-3 py-3 text-[#7CC7FF] font-mono text-[10px] hover:underline cursor-pointer">{row.url}</td>
                              <td className="px-3 py-3 text-muted-foreground font-mono text-[10px]">{row.ev}</td>
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-1.5 text-white">
                                  <CheckCircle2 className="size-3.5 text-green-500" /> <span className="text-[10px]">Verified</span>
                                </div>
                              </td>
                              <td className="px-3 py-3 text-muted-foreground">{row.pol}</td>
                              <td className="pr-5 pl-3 py-3">
                                <div className="flex justify-center">
                                  <CustomToggle checked={true} onChange={() => {}} />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="p-3 border-t border-[#28313C]/50 bg-[#0E1116] flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Lock className="size-3.5" /> Secret verification uses HMAC SHA-256 signatures.
                      </div>
                      <a href="#" className="flex items-center gap-1 text-[10px] text-[#7CC7FF] hover:text-[#7CC7FF] transition-colors">
                        Learn more <ExternalLink className="size-3" />
                      </a>
                    </div>
                  </div>

                  {/* OAuth / Access Scopes */}
                  <div className="rounded-xl border border-[#28313C] bg-[#0E1116] overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between p-5 border-b border-[#28313C]">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-[#4EA1FF]/10 flex items-center justify-center border border-[#4EA1FF]/20 shrink-0">
                          <Lock className="size-4 text-[#4EA1FF]" />
                        </div>
                        <div className="flex flex-col">
                          <h3 className="text-[13px] font-bold text-white">OAuth / Access Scopes</h3>
                          <p className="text-[11px] text-muted-foreground">View and manage OAuth grants and data access permissions.</p>
                        </div>
                      </div>
                    </div>
                    <div className="overflow-x-auto flex-1">
                      <table className="w-full text-left text-[11px] whitespace-nowrap">
                        <thead className="border-b border-[#28313C] text-[9px] text-muted-foreground font-bold tracking-widest uppercase">
                          <tr>
                            <th className="pl-5 pr-3 py-3">Application</th>
                            <th className="px-3 py-3">Granted By</th>
                            <th className="px-3 py-3">Scopes</th>
                            <th className="px-3 py-3">Granted On</th>
                            <th className="pr-5 pl-3 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#28313C]">
                          {[
                            { name: "Slack", icon: <div className="grid grid-cols-2 gap-[1px] rotate-45 size-3"><div className="bg-[#E01E5A] rounded-full w-full h-full"/><div className="bg-[#36C5F0] rounded-full w-full h-full"/><div className="bg-[#2EB67D] rounded-full w-full h-full"/><div className="bg-[#ECB22E] rounded-full w-full h-full"/></div>, by: "Jane Doe", scopes: "channels:read", scopes2: "users:read, more", time: "May 10, 2025" },
                            { name: "Google Drive", icon: <div className="relative size-3 flex items-center justify-center"><div className="absolute w-1.5 h-2 bg-[#FFD04B] rotate-[-60deg] -translate-x-[1px] translate-y-[1px]" /><div className="absolute w-1.5 h-2 bg-[#00AC47] translate-x-[2px] translate-y-[1px]" /><div className="absolute w-2 h-1 bg-[#4285F4] -translate-y-[2px]" /></div>, by: "John Smith", scopes: "drive.readonly", scopes2: "file.metadata, more", time: "May 9, 2025" },
                            { name: "Notion", icon: <div className="bg-white text-black size-3 rounded-sm flex items-center justify-center font-serif font-bold text-[8px]">N</div>, by: "Maria Garcia", scopes: "pages:read", scopes2: "databases:read, more", time: "Apr 30, 2025" },
                            { name: "Salesforce", icon: <div className="text-[#00A1E0] size-3 flex items-center justify-center"><Cloud className="size-3 fill-current" /></div>, by: "Alex Chen", scopes: "api:read", scopes2: "objects:read, more", time: "Apr 22, 2025" },
                            { name: "HubSpot", icon: <div className="text-[#FF7A59] size-3 flex items-center justify-center"><Share2 className="size-3 fill-current" /></div>, by: "Priya Nair", scopes: "crm.objects.read", scopes2: "crm.schemas.read, more", time: "Apr 18, 2025" },
                          ].map((row, i) => (
                            <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                              <td className="pl-5 pr-3 py-3">
                                <div className="flex items-center gap-2">
                                  {row.icon}
                                  <span className="font-semibold text-white">{row.name}</span>
                                </div>
                              </td>
                              <td className="px-3 py-3 text-muted-foreground">{row.by}</td>
                              <td className="px-3 py-3">
                                <div className="flex flex-col">
                                  <span className="text-muted-foreground">{row.scopes}</span>
                                  <span className="text-[10px] text-muted-foreground">{row.scopes2}</span>
                                </div>
                              </td>
                              <td className="px-3 py-3 text-muted-foreground">{row.time}</td>
                              <td className="pr-5 pl-3 py-3">
                                <div className="flex items-center gap-1.5 text-white">
                                  <span className="size-1.5 rounded-full bg-green-500" /> <span className="text-[11px] font-medium text-green-500">Active</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="p-3 border-t border-[#28313C]/50 bg-[#0E1116] flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <ShieldAlert className="size-3.5" /> Review and revoke access anytime.
                      </div>
                      <a href="#" className="flex items-center gap-1 text-[10px] text-[#7CC7FF] hover:text-[#7CC7FF] transition-colors">
                        Manage permissions <ExternalLink className="size-3" />
                      </a>
                    </div>
                  </div>

                  {/* Integration Health / Delivery Log */}
                  <div className="rounded-xl border border-[#28313C] bg-[#0E1116] overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between p-5 border-b border-[#28313C]">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-[#4EA1FF]/10 flex items-center justify-center border border-[#4EA1FF]/20 shrink-0">
                          <Activity className="size-4 text-[#4EA1FF]" />
                        </div>
                        <div className="flex flex-col">
                          <h3 className="text-[13px] font-bold text-white">Integration Health / Delivery Log</h3>
                          <p className="text-[11px] text-muted-foreground">Monitor delivery status and recent events across integrations.</p>
                        </div>
                      </div>
                      <Button type="button" variant="outline" className="h-7 border-[#28313C] bg-[#141A22] text-[10px] text-white hover:bg-white/[0.05] shrink-0">
                        View Logs <ExternalLink className="ml-1 size-3" />
                      </Button>
                    </div>
                    <div className="overflow-x-auto flex-1">
                      <table className="w-full text-left text-[11px] whitespace-nowrap">
                        <thead className="border-b border-[#28313C] text-[9px] text-muted-foreground font-bold tracking-widest uppercase">
                          <tr>
                            <th className="pl-5 pr-3 py-3">Time</th>
                            <th className="px-3 py-3">System</th>
                            <th className="px-3 py-3">Event</th>
                            <th className="px-3 py-3">Status</th>
                            <th className="pr-5 pl-3 py-3 text-right">Latency</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#28313C]">
                          {[
                            { time: "May 15, 2025 10:28 PM", icon: <div className="grid grid-cols-2 gap-[1px] rotate-45 size-3.5"><div className="bg-[#E01E5A] rounded-full w-full h-full"/><div className="bg-[#36C5F0] rounded-full w-full h-full"/><div className="bg-[#2EB67D] rounded-full w-full h-full"/><div className="bg-[#ECB22E] rounded-full w-full h-full"/></div>, ev: "Message Received", status: "Success", stColor: "text-green-500", ms: "120 ms" },
                            { time: "May 15, 2025 10:21 PM", icon: <div className="bg-[#6264A7] size-3.5 rounded-[2px] flex items-center justify-center text-white font-bold text-[7px]">T</div>, ev: "Record Updated", status: "Success", stColor: "text-green-500", ms: "210 ms" },
                            { time: "May 15, 2025 10:19 PM", icon: <div className="relative size-3.5 flex items-center justify-center"><div className="absolute w-[5px] h-[7px] bg-[#FFD04B] rotate-[-60deg] -translate-x-[1px] translate-y-[1px]" /><div className="absolute w-[5px] h-[7px] bg-[#00AC47] translate-x-[2px] translate-y-[1px]" /><div className="absolute w-[7px] h-[3px] bg-[#4285F4] -translate-y-[2px]" /></div>, ev: "File Uploaded", status: "Success", stColor: "text-green-500", ms: "340 ms" },
                            { time: "May 15, 2025 10:14 PM", icon: <div className="text-[#FF7A59] size-3.5 flex items-center justify-center"><Share2 className="size-3.5 fill-current" /></div>, ev: "Contact Created", status: "Success", stColor: "text-green-500", ms: "180 ms" },
                            { time: "May 15, 2025 10:09 PM", icon: <div className="text-[#00A1E0] size-3.5 flex items-center justify-center"><Cloud className="size-3.5 fill-current" /></div>, ev: "Notification Sent", status: "Success", stColor: "text-green-500", ms: "95 ms" },
                            { time: "May 15, 2025 10:04 PM", icon: <Network className="size-3.5 text-[#4EA1FF]" />, ev: "Webhook Delivered", status: "Retrying", stColor: "text-yellow-500", ms: "—" },
                          ].map((row, i) => (
                            <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                              <td className="pl-5 pr-3 py-3 text-muted-foreground">{row.time}</td>
                              <td className="px-3 py-3">
                                <div className="flex justify-center w-6">{row.icon}</div>
                              </td>
                              <td className="px-3 py-3 text-white">{row.ev}</td>
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-1.5">
                                  {row.status === "Success" ? <CheckCircle2 className="size-3.5 text-green-500" /> : <div className="size-1.5 rounded-full bg-yellow-500 ml-1" />}
                                  <span className={`text-[10px] font-medium ${row.stColor}`}>{row.status}</span>
                                </div>
                              </td>
                              <td className="pr-5 pl-3 py-3 text-right text-muted-foreground">{row.ms}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="p-3 border-t border-[#28313C]/50 bg-[#0E1116] flex items-center justify-between mt-auto">
                      <div className="text-[10px] text-muted-foreground">
                        All times shown in UTC-05:00 (Eastern Time)
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <span className="size-1.5 rounded-full bg-green-500" /> Auto-refresh enabled
                      </div>
                    </div>
                  </div>

                </div>

              </div>
) : activeNav === "billing" ? (
              <div className="flex flex-col gap-6 w-full animate-fade-in">
                {/* Header & Actions */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-[#0E1116] border border-[#28313C] flex items-center justify-center shrink-0">
                      <Wallet className="size-5 text-[#4EA1FF]" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <h2 className="text-xl font-bold text-white tracking-tight">Billing & Usage</h2>
                      <p className="text-[11px] text-muted-foreground">Manage your plan, monitor usage, and control spending.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button type="button" variant="outline" className="h-8 border-[#28313C] bg-[#0E1116] text-[11px] text-white hover:bg-white/[0.05]">
                      <TrendingUp className="mr-1.5 size-3.5 text-[#7CC7FF]" /> Upgrade Plan
                    </Button>
                    <Button type="button" variant="outline" className="h-8 border-[#28313C] bg-[#0E1116] text-[11px] text-white hover:bg-white/[0.05]">
                      <Download className="mr-1.5 size-3.5 text-[#7CC7FF]" /> Download Invoice
                    </Button>
                    <Button type="button" className="h-8 bg-[#4EA1FF] hover:bg-[#4EA1FF]/90 text-[11px] font-bold text-white ml-1 border-0">
                      <CheckCircle2 className="mr-1.5 size-3.5" /> Save Changes
                    </Button>
                  </div>
                </div>

                {/* KPI Row */}
                <div className="flex w-full gap-3 overflow-x-auto pb-2 -mb-2 no-scrollbar">
                  {[
                    { label: "CURRENT PLAN", icon: <ShieldCheck className="size-4 text-[#4EA1FF]" />, val: "Enterprise Plan", sub: "Active", subColor: "text-green-500" },
                    { label: "SEATS (INCLUDED / USED)", icon: <Users className="size-4 text-[#4EA1FF]" />, val: "50 / 32", sub: "64% used", subColor: "text-[#4EA1FF]" },
                    { label: "MONTHLY SPEND", icon: <BadgeDollarSign className="size-4 text-[#4EA1FF]" />, val: "$24,560.00", sub: "↑ 8.2% vs last month", subColor: "text-green-500" },
                    { label: "BILLING CYCLE", icon: <Calendar className="size-4 text-[#4EA1FF]" />, val: "Annual", sub: "Renews Dec 1, 2025", subColor: "text-muted-foreground" },
                    { label: "COMMITTED USAGE", icon: <Activity className="size-4 text-[#4EA1FF]" />, val: "$300,000 / year", sub: "18% consumed", subColor: "text-[#4EA1FF]" },
                    { label: "OVERAGE TO DATE", icon: <AlertTriangle className="size-4 text-yellow-500" />, val: "$1,240.00", sub: "This month", subColor: "text-yellow-500" },
                    { label: "NEXT INVOICE", icon: <FileText className="size-4 text-[#4EA1FF]" />, val: "Jun 1, 2025", sub: "Est. $25,800.00", subColor: "text-muted-foreground" },
                  ].map((kpi, i) => (
                    <div key={i} className="rounded-xl border border-[#28313C] bg-[#0E1116] flex flex-col p-4 min-w-[200px] shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full border border-[#28313C] bg-[#141A22] flex items-center justify-center shrink-0">
                          {kpi.icon}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] font-bold text-muted-foreground tracking-widest uppercase">{kpi.label}</span>
                          <span className="text-[14px] font-bold text-white">{kpi.val}</span>
                          <span className={`text-[10px] font-medium ${kpi.subColor}`}>{kpi.sub}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ROW 1: 3 Columns */}
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.3fr_1fr] gap-6 w-full">
                  
                  {/* Current Plan */}
                  <div className="rounded-xl border border-[#28313C] bg-[#0E1116] flex flex-col p-5">
                    <div className="flex items-center gap-2 border-b border-[#28313C] pb-4 mb-4">
                      <Bookmark className="size-4 text-[#4EA1FF]" />
                      <div className="flex flex-col">
                        <h3 className="text-[13px] font-bold text-white">Current Plan</h3>
                        <p className="text-[10px] text-muted-foreground">Your subscription and committed usage details.</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-4 text-[11px]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <ShieldCheck className="size-3.5" /> Plan
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-white font-medium">Enterprise Plan</span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">Active</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="size-3.5" /> Billing Cycle
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-white font-medium">Annual</span>
                          <span className="text-[10px] text-muted-foreground">Next: Jun 1, 2026</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <FileText className="size-3.5" /> Contract Renewal
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-white font-medium">Dec 1, 2025</span>
                          <span className="text-[10px] text-muted-foreground">234 days left</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="size-3.5" /> Seats
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-white font-medium">50 included</span>
                          <span className="text-[10px] text-muted-foreground">32 used</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Headphones className="size-3.5" /> Support Tier
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-white font-medium">Premium Support</span>
                          <span className="text-[10px] text-muted-foreground">24/7 response</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-5 border-t border-[#28313C]">
                      <span className="text-[11px] font-bold text-white mb-4 block">Committed Usage (Annual)</span>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-start gap-2">
                            <Bot className="size-3.5 text-[#4EA1FF] mt-0.5" />
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] font-medium text-muted-foreground">Models</span>
                              <span className="text-[11px] font-bold text-white">120M tokens</span>
                              <span className="text-[9px] text-[#7CC7FF]">18% used</span>
                            </div>
                          </div>
                          <div className="h-1.5 w-full bg-[#141A22] rounded-full overflow-hidden">
                            <div className="h-full bg-[#4EA1FF] w-[18%]" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-start gap-2">
                            <Database className="size-3.5 text-[#4EA1FF] mt-0.5" />
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] font-medium text-muted-foreground">Storage</span>
                              <span className="text-[11px] font-bold text-white">50 TB</span>
                              <span className="text-[9px] text-[#7CC7FF]">26% used</span>
                            </div>
                          </div>
                          <div className="h-1.5 w-full bg-[#141A22] rounded-full overflow-hidden">
                            <div className="h-full bg-[#4EA1FF] w-[26%]" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 col-span-2 mt-1">
                          <div className="flex items-start gap-2">
                            <Code2 className="size-3.5 text-[#4EA1FF] mt-0.5" />
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] font-medium text-muted-foreground">API Requests</span>
                              <span className="text-[11px] font-bold text-white">250M req</span>
                              <span className="text-[9px] text-[#7CC7FF]">22% used</span>
                            </div>
                          </div>
                          <div className="h-1.5 w-full bg-[#141A22] rounded-full overflow-hidden">
                            <div className="h-full bg-[#4EA1FF] w-[22%]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Usage Monitor */}
                  <div className="rounded-xl border border-[#28313C] bg-[#0E1116] flex flex-col p-5">
                    <div className="flex items-center justify-between border-b border-[#28313C] pb-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Activity className="size-4 text-[#4EA1FF]" />
                        <div className="flex flex-col">
                          <h3 className="text-[13px] font-bold text-white">Usage Monitor</h3>
                          <p className="text-[10px] text-muted-foreground">Track your consumption against committed limits.</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between px-2 py-1 rounded border border-[#28313C] bg-[#141A22] min-w-[100px] cursor-pointer">
                        <span className="text-[10px] text-white">This Month</span>
                        <ChevronDown className="size-3 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="flex flex-col text-[11px] w-full">
                      <div className="grid grid-cols-[1fr_1fr_40px_60px] gap-2 pb-2 border-b border-[#28313C] mb-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        <span>Metric</span>
                        <span>Usage</span>
                        <span className="text-right"></span>
                        <span className="text-right pr-2">Trend</span>
                      </div>
                      
                      {[
                        { icon: <User className="size-3.5" />, name: "Active AI Agents", val1: "18", val2: "/ 50", pct: "36%", bar: 36, spark: "M2 12l4-6 3 3 5-8 4 5" },
                        { icon: <FileText className="size-3.5" />, name: "Processed Documents", val1: "128,450", val2: "/ 500,000", pct: "26%", bar: 26, spark: "M2 10l3-2 4 4 4-6 5 2" },
                        { icon: <Network className="size-3.5" />, name: "Token Consumption", val1: "22.6M", val2: "/ 120M", pct: "19%", bar: 19, spark: "M2 14l3-4 4 2 5-6 4 3" },
                        { icon: <Code2 className="size-3.5" />, name: "API Requests", val1: "54.8M", val2: "/ 250M", pct: "22%", bar: 22, spark: "M2 12l4-2 3 4 5-8 4 6" },
                        { icon: <Database className="size-3.5" />, name: "Storage Usage", val1: "13.1 TB", val2: "/ 50 TB", pct: "26%", bar: 26, spark: "M2 10l3-2 4 4 4-6 5 2" },
                        { icon: <Share2 className="size-3.5" />, name: "Connector Usage", val1: "12", val2: "/ 20", pct: "60%", bar: 60, spark: "M2 14l3-8 4 2 5-6 4 4" },
                      ].map((m, i) => (
                        <div key={i} className="grid grid-cols-[1fr_1fr_40px_60px] gap-2 items-center py-2 group">
                          <div className="flex items-center gap-2 text-muted-foreground group-hover:text-white transition-colors">
                            {m.icon}
                            <span className="font-medium truncate">{m.name}</span>
                          </div>
                          <div className="flex flex-col gap-1.5 w-full pr-4">
                            <span className="text-white font-medium">{m.val1} <span className="text-muted-foreground">{m.val2}</span></span>
                            <div className="h-1 w-full bg-[#141A22] rounded-full overflow-hidden">
                              <div className="h-full bg-[#4EA1FF]" style={{width: `${m.bar}%`}} />
                            </div>
                          </div>
                          <div className="text-right text-muted-foreground">{m.pct}</div>
                          <div className="flex justify-end">
                            <svg viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-4 text-[#4EA1FF]"><path d={m.spark}/></svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Spend Breakdown */}
                  <div className="rounded-xl border border-[#28313C] bg-[#0E1116] flex flex-col p-5">
                    <div className="flex items-center justify-between border-b border-[#28313C] pb-4 mb-4">
                      <div className="flex items-center gap-2">
                        <PieChart className="size-4 text-[#4EA1FF]" />
                        <div className="flex flex-col">
                          <h3 className="text-[13px] font-bold text-white">Spend Breakdown</h3>
                          <p className="text-[10px] text-muted-foreground">Detailed view of your monthly spending.</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between px-2 py-1 rounded border border-[#28313C] bg-[#141A22] min-w-[100px] cursor-pointer">
                        <span className="text-[10px] text-white">This Month</span>
                        <ChevronDown className="size-3 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 mb-5">
                      <span className="text-[11px] text-muted-foreground">Total Spend</span>
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-white">$24,560.00</span>
                      </div>
                      <span className="text-[10px] font-medium text-green-500">↑ 8.2% vs last month</span>
                    </div>

                    <div className="flex flex-col text-[11px] w-full">
                      <div className="grid grid-cols-[1fr_2fr_30px_60px] gap-2 pb-2 border-b border-[#28313C] mb-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        <span>Category</span>
                        <span></span>
                        <span className="text-right"></span>
                        <span className="text-right">Amount</span>
                      </div>
                      
                      {[
                        { color: "bg-[#4EA1FF]", name: "Model Usage", pct: "56%", bar: 56, amt: "$13,753.60" },
                        { color: "bg-[#7CC7FF]", name: "Storage", pct: "18%", bar: 18, amt: "$4,414.80" },
                        { color: "bg-cyan-500", name: "Connectors", pct: "12%", bar: 12, amt: "$2,947.20" },
                        { color: "bg-orange-500", name: "Premium Support", pct: "8%", bar: 8, amt: "$1,964.80" },
                        { color: "bg-red-500", name: "Overages", pct: "6%", bar: 6, amt: "$1,479.60" },
                      ].map((m, i) => (
                        <div key={i} className="grid grid-cols-[1fr_2fr_30px_60px] gap-2 items-center py-2.5">
                          <div className="flex items-center gap-2">
                            <div className={`size-2 rounded-full ${m.color}`} />
                            <span className="text-muted-foreground whitespace-nowrap">{m.name}</span>
                          </div>
                          <div className="flex items-center w-full px-2">
                            <div className="h-1.5 w-full bg-[#141A22] rounded-full overflow-hidden">
                              <div className={`h-full ${m.color}`} style={{width: `${m.bar}%`}} />
                            </div>
                          </div>
                          <div className="text-right text-muted-foreground">{m.pct}</div>
                          <div className="text-right text-white font-medium">{m.amt}</div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-[#28313C] flex items-center justify-between">
                      <span className="text-[11px] font-bold text-white">Total</span>
                      <span className="text-[11px] font-bold text-white">$24,560.00</span>
                    </div>
                  </div>

                </div>

                {/* ROW 2: 3 Columns */}
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.3fr_1fr] gap-6 w-full">
                  
                  {/* Payment Methods */}
                  <div className="rounded-xl border border-[#28313C] bg-[#0E1116] flex flex-col p-5">
                    <div className="flex items-center gap-2 border-b border-[#28313C] pb-4 mb-4">
                      <CreditCard className="size-4 text-[#4EA1FF]" />
                      <div className="flex flex-col">
                        <h3 className="text-[13px] font-bold text-white">Payment Methods</h3>
                        <p className="text-[10px] text-muted-foreground">Manage your payment methods and billing information.</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      {/* Primary Card */}
                      <div className="flex items-center justify-between p-3 rounded-lg border border-[#4EA1FF]/30 bg-[#4EA1FF]/5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-6 bg-white rounded flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-[#1434CB] italic tracking-tighter">VISA</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-white">**** **** **** 4242</span>
                              <span className="px-1.5 py-[1px] rounded text-[9px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">Primary</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">Expires 04/27</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button type="button" variant="outline" className="h-6 px-2 text-[10px] border-[#28313C] bg-[#141A22] text-white hover:bg-white/[0.05]">Edit</Button>
                          <Button type="button" variant="outline" className="h-6 px-2 text-[10px] border-[#28313C] bg-[#141A22] text-white hover:bg-white/[0.05]">Set as Primary</Button>
                        </div>
                      </div>

                      {/* Billing Info */}
                      <div className="flex flex-col gap-3 text-[11px] px-1 py-1">
                        <div className="flex items-start gap-3">
                          <User className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                          <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground">Billing Contact</span>
                            <span className="text-white font-medium">Jane Doe</span>
                            <span className="text-muted-foreground">jane.doe@geniuscapital.com</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <FileText className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                          <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground">Tax ID / VAT</span>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">98-7654321</span>
                              <span className="text-[9px] text-green-500">Verified</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                          <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground">Billing Address</span>
                            <span className="text-white font-medium leading-relaxed">123 Innovation Way, Suite 500<br/>New York, NY 10001, USA</span>
                          </div>
                        </div>
                      </div>

                      {/* Backup Card */}
                      <div className="flex items-center justify-between p-3 rounded-lg border border-[#28313C] bg-[#141A22] mt-auto">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-6 bg-[#252525] rounded flex items-center justify-center shrink-0 overflow-hidden relative">
                            <div className="w-4 h-4 rounded-full bg-[#EB001B] absolute left-1.5 opacity-90"/>
                            <div className="w-4 h-4 rounded-full bg-[#F79E1B] absolute right-1.5 opacity-90"/>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[11px] font-bold text-white">**** **** **** 8881</span>
                            <span className="text-[10px] text-muted-foreground">Expires 11/26</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button type="button" variant="outline" className="h-6 px-2 text-[10px] border-[#28313C] bg-[#141A22] text-white hover:bg-white/[0.05]">Edit</Button>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Invoices & Billing History */}
                  <div className="rounded-xl border border-[#28313C] bg-[#0E1116] flex flex-col p-5">
                    <div className="flex items-center gap-2 border-b border-[#28313C] pb-4 mb-4">
                      <FileText className="size-4 text-[#4EA1FF]" />
                      <div className="flex flex-col">
                        <h3 className="text-[13px] font-bold text-white">Invoices & Billing History</h3>
                        <p className="text-[10px] text-muted-foreground">View and download your invoices and payment history.</p>
                      </div>
                    </div>

                    <div className="flex flex-col w-full text-[11px]">
                      <div className="grid grid-cols-[1fr_2fr_1fr_60px_1.5fr_40px] gap-2 pb-2 border-b border-[#28313C] mb-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        <span>Invoice #</span>
                        <span>Billing Period</span>
                        <span>Amount</span>
                        <span>Status</span>
                        <span>Payment Date</span>
                        <span className="text-center">Action</span>
                      </div>
                      
                      {[
                        { id: "INV-2025-000234", period: "May 1 – May 31, 2025", amt: "$24,560.00", status: "Paid", color: "text-green-500 border-green-500/20 bg-green-500/10", date: "May 2, 2025" },
                        { id: "INV-2025-000233", period: "Apr 1 – Apr 30, 2025", amt: "$26,740.00", status: "Paid", color: "text-green-500 border-green-500/20 bg-green-500/10", date: "Apr 2, 2025" },
                        { id: "INV-2025-000232", period: "Mar 1 – Mar 31, 2025", amt: "$25,980.00", status: "Paid", color: "text-green-500 border-green-500/20 bg-green-500/10", date: "Mar 2, 2025" },
                        { id: "INV-2025-000231", period: "Feb 1 – Feb 28, 2025", amt: "$25,410.00", status: "Paid", color: "text-green-500 border-green-500/20 bg-green-500/10", date: "Mar 1, 2025" },
                        { id: "INV-2025-000230", period: "Jan 1 – Jan 31, 2025", amt: "$24,100.00", status: "Paid", color: "text-green-500 border-green-500/20 bg-green-500/10", date: "Feb 1, 2025" },
                      ].map((inv, i) => (
                        <div key={i} className="grid grid-cols-[1fr_2fr_1fr_60px_1.5fr_40px] gap-2 items-center py-2.5 hover:bg-white/[0.02] transition-colors rounded -mx-2 px-2">
                          <span className="text-muted-foreground">{inv.id}</span>
                          <span className="text-white">{inv.period}</span>
                          <span className="text-white font-medium">{inv.amt}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border w-fit ${inv.color}`}>{inv.status}</span>
                          <span className="text-muted-foreground">{inv.date}</span>
                          <div className="flex justify-center">
                            <button className="size-6 rounded border border-[#28313C] bg-[#141A22] flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/[0.05] transition-colors">
                              <Download className="size-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto pt-4 border-t border-[#28313C] flex justify-center">
                      <a href="#" className="flex items-center gap-1 text-[11px] font-bold text-white hover:text-[#7CC7FF] transition-colors">
                        View All Invoices <ExternalLink className="size-3" />
                      </a>
                    </div>
                  </div>

                  {/* Budget Controls */}
                  <div className="rounded-xl border border-[#28313C] bg-[#0E1116] flex flex-col p-5">
                    <div className="flex items-center gap-2 border-b border-[#28313C] pb-4 mb-4">
                      <ShieldCheck className="size-4 text-[#4EA1FF]" />
                      <div className="flex flex-col">
                        <h3 className="text-[13px] font-bold text-white">Budget Controls</h3>
                        <p className="text-[10px] text-muted-foreground">Set controls to manage and prevent unexpected spend.</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-6 text-[11px]">
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-medium">Account Spend Cap (Monthly)</span>
                          <Info className="size-3 text-muted-foreground" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">$30,000.00</span>
                          <Button type="button" variant="outline" className="h-6 px-2 text-[10px] border-[#28313C] bg-[#141A22] text-white hover:bg-white/[0.05]">Edit</Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-medium">Warning Threshold</span>
                          <Info className="size-3 text-muted-foreground" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">80% ($24,000.00)</span>
                          <Button type="button" variant="outline" className="h-6 px-2 text-[10px] border-[#28313C] bg-[#141A22] text-white hover:bg-white/[0.05]">Edit</Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-white font-medium">Auto-notify Finance</span>
                            <Info className="size-3 text-muted-foreground" />
                          </div>
                          <span className="text-[10px] text-muted-foreground">Notify finance team when threshold is reached</span>
                        </div>
                        <CustomToggle checked={true} onChange={() => {}} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-white font-medium">Overage Approval Requirement</span>
                            <Info className="size-3 text-muted-foreground" />
                          </div>
                          <span className="text-[10px] text-muted-foreground">Require approval for any overages</span>
                        </div>
                        <CustomToggle checked={true} onChange={() => {}} />
                      </div>

                    </div>

                    <div className="mt-auto pt-6">
                      <div className="flex items-start gap-2.5 p-3 rounded-lg border border-[#28313C] bg-[#141A22]">
                        <Info className="size-4 text-[#4EA1FF] shrink-0 mt-0.5" />
                        <p className="text-[10px] text-muted-foreground leading-relaxed pr-2">
                          You will be notified when you reach <span className="text-white font-medium">80%</span> of your spend cap. 
                          Overages require approval from authorized approvers.
                        </p>
                      </div>
                    </div>

                  </div>

                </div>
              </div>

            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center animate-fade-in mt-20">
                <Settings className="size-10 text-muted-foreground/30 mb-4" />
                <h3 className="text-base font-semibold text-white capitalize">{navItems.find(i => i.id === activeNav)?.label || activeNav} Configuration</h3>
                <p className="text-xs text-muted-foreground mt-2 max-w-sm">
                  Detailed settings for {navItems.find(i => i.id === activeNav)?.label || activeNav} are locked until the production provider integration is enabled.
                </p>
                <Button type="button" variant="outline" size="sm" onClick={() => setActiveNav("security")} className="mt-6 border-[#28313C] bg-[#141A22] text-white hover:bg-white/[0.05]">
                  Return to Security & Data
                </Button>
              </div>
            )}

          </div>


        </div>
      </div>

    </div>
    </div>
  );
}

function EyeIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
