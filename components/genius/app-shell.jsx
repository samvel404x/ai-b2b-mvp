"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowRightLeft,
  Building,
  CreditCard,
  UserPlus,
  AlertCircle,
  Bell,
  Bot,
  Calendar,
  ChevronDown,
  Cpu,
  Database,
  FileSpreadsheet,
  GitBranch,
  HelpCircle,
  KeyRound,
  LogOut,
  MessageSquare,
  Moon,
  Plug,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  Upload,
  User,
  X,
  LayoutDashboard,
  PanelLeft,
  PanelLeftClose,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { workspace } from "@/lib/genius-data";
import { GeniusLogo } from "./logo";
import { StatusDot } from "./shared";
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
import Agents from "./sections/agents";
import Approvals from "./sections/approvals";
import ExcelWorkspace from "./sections/excel-workspace";
import Connectors from "./sections/connectors";
import AiGateway from "./sections/ai-gateway";
import TeamCrm from "./sections/team-crm";
import B2bBridge from "./sections/b2b-bridge";
import Reports from "./sections/reports";
import Profile from "./sections/profile";
import Support from "./sections/support";
import SettingsSection from "./sections/settings";

const sectionComponents = {
  command: CommandCenter,
  chat: AiChat,
  data: DataIntake,
  diagnostics: Diagnostics,
  savings: SavingsRadar,
  agents: Agents,
  approvals: Approvals,
  excel: ExcelWorkspace,
  connectors: Connectors,
  "ai-gateway": AiGateway,
  "team-crm": TeamCrm,
  "b2b-bridge": B2bBridge,
  reports: Reports,
  profile: Profile,
  support: Support,
  settings: SettingsSection,
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
  { id: "agents", label: "Agents", icon: Bot },
  { id: "approvals", label: "Approvals", icon: ShieldCheck, badge: 9 },
  { id: "excel", label: "Excel Workspace", icon: FileSpreadsheet },
  { id: "connectors", label: "Connectors", icon: Plug },
  { id: "reports", label: "Reports", icon: GitBranch },
  { id: "support", label: "Support / FAQ", icon: HelpCircle },
  { id: "settings", label: "Settings", icon: Settings },
];

const roadmapNav = [
  { label: "CRM Layer", status: "Demo" },
  { label: "Contract Repository", status: "Demo" },
  { label: "Native Mobile App", status: "Demo" },
  { label: "Multi-Business OS", status: "Demo" },
  { label: "Billing", status: "Demo" },
  { label: "Marketplace Extensions", status: "Demo" },
  { label: "Autonomous Execution", status: "Locked" },
  { label: "Genius Deep", status: "Locked" },
  { label: "Genius Audit", status: "Locked" },
];

/* ── Skeleton Screens ────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-[#ffffff08] bg-[#0a0c0b] p-4">
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
          <GeniusLogo className="w-8 h-8" />
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
        <div className="rounded-xl border border-[#ffffff08] bg-[#0a0c0b] p-4">
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
const searchItems = [
  { category: 'Findings', label: 'Microsoft EA renewal above benchmark', meta: 'High · $2.45M · PT-1247', id: 'savings' },
  { category: 'Findings', label: 'Unused SaaS licenses', meta: 'High · $1.15M · PT-1245', id: 'savings' },
  { category: 'Findings', label: 'Duplicate vendor payments', meta: 'High · $280K · PT-1233', id: 'savings' },
  { category: 'Screens', label: 'Command Center', meta: 'Dashboard overview', id: 'command' },
  { category: 'Screens', label: 'Approvals', meta: '8 pending · 3 urgent', id: 'approvals' },
  { category: 'Screens', label: 'AI Agents', meta: '6 active agents', id: 'agents' },
  { category: 'Actions', label: 'Run Contract Analyst agent', meta: 'Agent action', id: 'agents' },
  { category: 'Actions', label: 'Approve pending decisions', meta: '8 items pending', id: 'approvals' },
  { category: 'Actions', label: 'View spend leakage details', meta: '$3.21M identified', id: 'savings' },
];

const categoryIcon = {
  Findings: Search,
  Screens: LayoutDashboard,
  Actions: Zap,
};

function SearchOverlay({ open, onClose, onNavigate }) {
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
    ? searchItems.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase()),
      )
    : searchItems;

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
        className="relative w-full max-w-lg animate-scale-in rounded-2xl border border-[#1E2730] bg-[#0C1014] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[#1E2730] px-4 py-3.5">
          <Search className="size-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search findings, evidence, actions..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none"
          />
          <kbd className="rounded border border-[#243039] bg-[#0F1318] px-1.5 py-0.5 text-[10px] text-muted-foreground">ESC</kbd>
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
                      key={item.label}
                      type="button"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150 hover:bg-accent"
                      onClick={() => { onClose(); onNavigate(item.id); }}
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
        <div className="border-t border-[#1E2730] px-4 py-2.5 text-center">
          <span className="text-[10px] text-muted-foreground">Press <kbd className="rounded border border-[#243039] bg-[#0F1318] px-1 py-0.5 text-[9px]">⌘K</kbd> to toggle</span>
        </div>
      </div>
    </div>
  );
}

/* ── Notification panel ────────────────────────────────────────────────── */
function NotificationPanel({ open, onClose }) {
  if (!open) return null;

  const notifications = [
    { id: 1, title: "Microsoft EA renewal due in 12 days", desc: "Contract Analyst flagged renewal window.", time: "2m ago", type: "critical", read: false },
    { id: 2, title: "298 unused SaaS licenses detected", desc: "Spend Auditor found idle seats across 4 tools.", time: "18m ago", type: "warning", read: false },
    { id: 3, title: "Invoice mismatch on INV-2291", desc: "18% variance detected vs contract rate.", time: "41m ago", type: "warning", read: false },
    { id: 4, title: "Q2 savings proof pack ready", desc: "Report Builder prepared 12 findings.", time: "3h ago", type: "primary", read: true },
    { id: 5, title: "Connector sync completed", desc: "All 18 sources synced successfully.", time: "5h ago", type: "primary", read: true },
  ];

  const typeDot = { critical: "bg-critical", warning: "bg-warning", primary: "bg-primary" };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full z-50 mt-3 w-[380px] animate-scale-in rounded-2xl border border-[#1E2730] bg-[#0C1014] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1E2730] px-5 py-3.5">
          <span className="text-sm font-semibold text-foreground">Notifications</span>
          <div className="flex items-center gap-1">
            <button type="button" className="text-xs text-muted-foreground transition-colors hover:text-foreground mr-2">
              Mark all read
            </button>
            <button type="button" onClick={onClose} className="text-muted-foreground transition-colors hover:text-foreground">
              <X className="size-4" />
            </button>
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto scrollbar-thin">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={cn(
                "flex gap-3 border-b border-[#1E2730]/50 px-5 py-3.5 transition-colors duration-150 hover:bg-accent",
                !n.read && "bg-accent/30",
              )}
            >
              <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", typeDot[n.type])} />
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm leading-snug", n.read ? "text-muted-foreground" : "font-medium text-foreground")}>{n.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{n.desc}</p>
                <span className="mt-1.5 text-[10px] font-medium text-muted-foreground">{n.time}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-[#1E2730] px-5 py-3 text-center">
          <button type="button" className="text-xs font-medium text-primary transition-colors hover:text-primary/80">
            View all notifications
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Left Sidebar ────────────────────────────────────────────────────── */
function LeftSidebar({ active, onNavigate, collapsed, setCollapsed }) {
  return (
    <aside
      className={cn(
        "shrink-0 border-r border-sidebar-border bg-[#050706] transition-all duration-200 ease-in-out flex flex-col h-full",
        collapsed ? "w-16" : "w-[240px]",
      )}
    >
      {/* Brand */}
      <div className="flex flex-col gap-4 px-4 py-6 pb-2">
        <div className="flex items-center gap-3 overflow-hidden">
          <GeniusLogo className="size-8 shrink-0" />
          {!collapsed && (
            <span className="text-xl font-bold tracking-tight text-white">GENIUS.</span>
          )}
        </div>
        {!collapsed && (
          <div className="flex flex-col gap-1.5 mt-2">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">WORKSPACE</span>
            <button className="flex w-full items-center justify-between rounded border border-[#1E2730] bg-[#0A0C0B] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[#141B21]">
              Acme Corporation
              <ChevronDown className="size-3 text-muted-foreground" />
            </button>
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
            <span className="mb-1 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">ROADMAP & FUTURE</span>
            {roadmapNav.map(item => (
              <div key={item.label} className="flex items-center justify-between py-1.5">
                <span className="flex items-center gap-2 text-[11px] text-muted-foreground/60">
                  <div className="size-3.5 rounded-full border border-[#1E2730] shrink-0" />
                  {item.label}
                </span>
                <span className={cn(
                  "rounded border px-1.5 py-0.5 text-[8.5px] font-bold tracking-wide uppercase",
                  item.status === "Demo" ? "border-primary/30 bg-primary/10 text-primary" : "border-[#1E2730] bg-[#141B21] text-muted-foreground/60"
                )}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* Bottom section */}
      {!collapsed && (
        <div className="mt-auto flex flex-col gap-4 border-t border-[#1E2730] px-4 py-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full text-left flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/5 cursor-pointer border border-transparent hover:border-[#1E2730] outline-none">
              <Avatar className="size-8 ring-1 ring-[#1E2730]">
                <AvatarFallback className="bg-[#141B21] text-[10px] font-bold text-white">AR</AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-bold text-white truncate">Alex Rivera</span>
                <span className="text-[9px] text-muted-foreground">Owner</span>
              </div>
              <ChevronDown className="ml-auto size-3 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[240px] bg-[#0A0C0B] border-[#1E2730] text-muted-foreground p-2">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">My Account</DropdownMenuLabel>
                <DropdownMenuItem className="text-xs hover:text-white cursor-pointer rounded-md focus:bg-white/5 focus:text-white">
                  <User className="mr-2 size-3.5" /> Profile settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs hover:text-white cursor-pointer rounded-md focus:bg-white/5 focus:text-white">
                  <Settings className="mr-2 size-3.5" /> Workspace preferences
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-[#1E2730] my-1" />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 mt-1">Organization</DropdownMenuLabel>
                <DropdownMenuItem className="text-xs hover:text-white cursor-pointer rounded-md focus:bg-white/5 focus:text-white">
                  <Building className="mr-2 size-3.5" /> Company details
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs hover:text-white cursor-pointer rounded-md focus:bg-white/5 focus:text-white">
                  <CreditCard className="mr-2 size-3.5" /> Billing & plans
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs hover:text-white cursor-pointer rounded-md focus:bg-white/5 focus:text-white text-primary focus:text-primary">
                  <UserPlus className="mr-2 size-3.5" /> Invite team
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-[#1E2730] my-1" />
              <DropdownMenuItem className="text-xs hover:text-white cursor-pointer rounded-md focus:bg-white/5 focus:text-white">
                <ArrowRightLeft className="mr-2 size-3.5" /> Change account
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs text-critical hover:text-critical cursor-pointer rounded-md focus:bg-critical/10 focus:text-critical mt-1">
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
  chat:        { title: 'AI Chat / Workbench',    subtitle: 'Ask questions. Get evidence-backed answers. Approval-first AI.' },
  data:        { title: 'Data Intake',            subtitle: 'Upload, connect, and review business evidence before it impacts metrics.' },
  diagnostics: { title: 'Diagnostics',            subtitle: 'Understand business health, surface risks, and take action with evidence.' },
  savings:     { title: 'Savings Radar',          subtitle: 'Track every cost reduction opportunity with AI confidence and source proof.' },
  agents:      { title: 'AI Agents',              subtitle: 'Supervised autonomous agents running in real-time. Guardrail-enforced.' },
  approvals:   { title: 'Approvals',              subtitle: 'Human-in-the-loop decision management. Review, approve, delegate, or reject.' },
  excel:       { title: 'Excel Workspace',        subtitle: 'AI-powered spreadsheet analysis. Anomaly detection and proof trails.' },
  connectors:  { title: 'Connectors',             subtitle: 'Connect your data sources. Live sync status and health monitoring.' },
  'ai-gateway':{ title: 'CEO AI Gateway',         subtitle: 'Executive-level operational intelligence. Approve and delegate with confidence.' },
  'team-crm':  { title: 'Team Operations CRM',   subtitle: 'Manager-level task board. Log, assign, and escalate operational items.' },
  'b2b-bridge':{ title: 'Multi-Business OS',      subtitle: 'Secure cross-company collaboration. Encrypted channels with AI oversight.' },
  reports:     { title: 'Reports',                subtitle: 'AI-generated board-ready reports. Proof-backed findings and executive summaries.' },
  profile:     { title: 'My Profile',             subtitle: 'Manage your account, preferences, and security settings.' },
  support:     { title: 'Support & Help Center',  subtitle: 'Documentation, FAQs, and live support for your workspace.' },
  settings:    { title: 'Workspace Settings',     subtitle: 'Configure security, team access, connectors, AI guardrails, and billing.' },
};

/* ── Main App Shell ────────────────────────────────────────────────────── */
export default function AppShell() {
  const [active, setActive] = useState("command");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);
  const ActiveSection = sectionComponents[active] || CommandCenter;

  const toggleSearch = useCallback(() => setSearchOpen((p) => !p), []);

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

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* ── Top Header ──────────────────────────────────────────── */}
      <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#1E2730] bg-[#0A0C0B] px-8">
        {/* Page Title Left */}
        <div className="flex flex-col justify-center">
          <h1 className="text-xl font-bold tracking-tight text-white">
            {screenMeta[active]?.title ?? active}
          </h1>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {screenMeta[active]?.subtitle ?? ""}
          </p>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-4">
          
          {/* Status Pills */}
          <div className="hidden lg:flex items-center gap-4 mr-4">
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded bg-[#1E2730]/50 border border-[#1E2730]">
                <Sparkles className="size-3.5 text-[#3b82f6]" fill="currentColor" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Provider</span>
                <span className="text-[11px] font-semibold text-white">Gemini 1.5 Pro</span>
              </div>
            </div>
            <div className="h-6 w-px bg-[#1E2730]" />
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded bg-[#1E2730]/50 border border-[#1E2730]">
                <Database className="size-3.5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Database</span>
                <span className="text-[11px] font-semibold text-white">Supabase</span>
              </div>
            </div>
            <div className="h-6 w-px bg-[#1E2730]" />
            <div className="flex items-center gap-2">
              {(active === "data-intake" || active === "diagnostics") && (
                <div className="flex size-6 items-center justify-center rounded bg-[#1E2730]/50 border border-[#1E2730]">
                  <KeyRound className="size-3.5 text-primary" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
                  {active === "data-intake" || active === "diagnostics" ? "Connector health" : "Connectors"}
                </span>
                <span className="text-[11px] font-semibold text-white">
                  {active === "data-intake" || active === "diagnostics" ? "98%" : "18 / 20"}
                </span>
              </div>
            </div>
            <div className="h-6 w-px bg-[#1E2730]" />
            <div className="flex items-center gap-2">
              {(active === "data-intake" || active === "diagnostics") && (
                <div className="flex size-6 items-center justify-center rounded bg-[#1E2730]/50 border border-[#1E2730]">
                  <ShieldCheck className="size-3.5 text-primary" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Data quality</span>
                <span className={cn("text-[11px] font-semibold text-white", (active === "data-intake" || active === "diagnostics") && "text-primary")}>
                  {active === "data-intake" || active === "diagnostics" ? "Good (84%)" : "Good (84%)"}
                </span>
              </div>
            </div>
            <div className="h-6 w-px bg-[#1E2730]" />
            <div className="flex flex-col">
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Last sync</span>
              <span className="text-[11px] font-semibold text-white">2m ago</span>
            </div>
            <button className="flex size-6 items-center justify-center rounded border border-[#1E2730] hover:bg-[#141B21] transition-colors ml-2">
              <RefreshCw className="size-3 text-muted-foreground" />
            </button>
          </div>

          {/* Search */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-8 items-center gap-2 rounded-full border border-[#1E2730] bg-[#141B21] px-3 text-xs text-muted-foreground transition-colors hover:border-[#2C3842] hover:text-white"
          >
            <Search className="size-3.5" />
            <span className="hidden w-40 text-left sm:inline">Search anything...</span>
            <kbd className="hidden rounded bg-[#1E2730] px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground sm:inline">⌘ K</kbd>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative flex size-8 items-center justify-center rounded-full border border-[#1E2730] bg-[#141B21] text-muted-foreground transition-colors hover:bg-[#1E2730] hover:text-white"
            >
              <Bell className="size-3.5" />
              <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-critical text-[8px] font-bold text-white shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                8
              </span>
            </button>
            <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
          </div>

          {/* Sidebar toggle */}
          <button
            type="button"
            className="hidden lg:flex size-8 items-center justify-center rounded-full border border-[#1E2730] bg-[#141B21] text-muted-foreground transition-colors hover:bg-[#1E2730] hover:text-white"
            onClick={() => setSidebarCollapsed((c) => !c)}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <PanelLeft className="size-3.5" /> : <PanelLeftClose className="size-3.5" />}
          </button>

          {/* Help */}
          <button
            type="button"
            className="hidden sm:flex size-8 items-center justify-center rounded-full border border-[#1E2730] bg-[#141B21] text-muted-foreground transition-colors hover:bg-[#1E2730] hover:text-white"
            onClick={() => setActive("support")}
          >
            <HelpCircle className="size-3.5" />
          </button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-[#1E2730] bg-[#141B21] pl-1 pr-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-[#1E2730] hover:text-white mr-4 outline-none">
              <Avatar className="size-6 ring-1 ring-transparent hover:ring-[#1E2730] transition-all">
                <AvatarFallback className="bg-accent text-[9px] font-bold text-white">AR</AvatarFallback>
              </Avatar>
              <ChevronDown className="size-3 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[240px] bg-[#0A0C0B] border-[#1E2730] text-muted-foreground p-2 mt-1">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">My Account</DropdownMenuLabel>
                <DropdownMenuItem className="text-xs hover:text-white cursor-pointer rounded-md focus:bg-white/5 focus:text-white">
                  <User className="mr-2 size-3.5" /> Profile settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs hover:text-white cursor-pointer rounded-md focus:bg-white/5 focus:text-white">
                  <Settings className="mr-2 size-3.5" /> Workspace preferences
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-[#1E2730] my-1" />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 mt-1">Organization</DropdownMenuLabel>
                <DropdownMenuItem className="text-xs hover:text-white cursor-pointer rounded-md focus:bg-white/5 focus:text-white">
                  <Building className="mr-2 size-3.5" /> Company details
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs hover:text-white cursor-pointer rounded-md focus:bg-white/5 focus:text-white">
                  <CreditCard className="mr-2 size-3.5" /> Billing & plans
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs hover:text-white cursor-pointer rounded-md focus:bg-white/5 focus:text-white text-primary focus:text-primary">
                  <UserPlus className="mr-2 size-3.5" /> Invite team
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-[#1E2730] my-1" />
              <DropdownMenuItem className="text-xs hover:text-white cursor-pointer rounded-md focus:bg-white/5 focus:text-white">
                <ArrowRightLeft className="mr-2 size-3.5" /> Change account
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs text-critical hover:text-critical cursor-pointer rounded-md focus:bg-critical/10 focus:text-critical mt-1">
                <LogOut className="mr-2 size-3.5" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-6 w-px bg-[#1E2730]" />

          {/* Date Picker & Auto Refresh */}
          <div className="flex items-center gap-3 pl-2">
            <button className="flex h-8 items-center gap-2 rounded border border-[#1E2730] bg-[#0A0C0B] px-3 text-[11px] text-muted-foreground transition-colors hover:bg-[#141B21]">
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
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute left-0 top-14 h-[calc(100vh-3.5rem)] w-72 bg-sidebar border-r border-border animate-slide-in">
            <LeftSidebar
              active={active}
              onNavigate={(id) => { setActive(id); setMobileMenuOpen(false); }}
              collapsed={false}
              setCollapsed={() => {}}
            />
          </div>
        </div>
      )}

      {/* ── Body: Sidebar + Content ──────────────────────────────── */}
      <div className="flex flex-1 min-h-0">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <LeftSidebar
            active={active}
            onNavigate={setActive}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
          />
        </div>

        {/* Main content area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0A0C0B]">
          {/* Content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <LoadingOverlay />
              </div>
            ) : (
              <div
                key={active}
                className="w-full animate-enter px-6 py-6"
              >
                <ActiveSection
                  label={mainNav.find((n) => n.id === active)?.label || active.charAt(0).toUpperCase() + active.slice(1)}
                  onNavigate={setActive}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Search overlay ──────────────────────────────────────── */}
      <SearchOverlay open={searchOpen} onClose={toggleSearch} onNavigate={setActive} />
    </div>
  );
}
