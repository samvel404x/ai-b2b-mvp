"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  AlertCircle,
  Bell,
  Bot,
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { workspace } from "@/lib/genius-data";
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

import CommandCenter from "./sections/command-center";
import AiChat from "./sections/ai-chat";
import DataIntake from "./sections/data-intake";
import Diagnostics from "./sections/diagnostics";
import SavingsRadar from "./sections/savings-radar";
import Agents from "./sections/agents";
import Approvals from "./sections/approvals";
import ExcelWorkspace from "./sections/excel-workspace";
import Connectors from "./sections/connectors";
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
  reports: Reports,
  profile: Profile,
  support: Support,
  settings: SettingsSection,
};

const mainNav = [
  { id: "command", label: "Command Center", icon: LayoutDashboard },
  { id: "chat", label: "AI Chat", icon: MessageSquare },
  { id: "data", label: "Data Intake", icon: Upload },
  { id: "diagnostics", label: "Diagnostics", icon: AlertCircle },
  { id: "savings", label: "Savings Radar", icon: Target },
  { id: "agents", label: "Agents", icon: Bot },
  { id: "approvals", label: "Approvals", icon: ShieldCheck, badge: 8 },
  { id: "excel", label: "Excel Workspace", icon: FileSpreadsheet },
  { id: "connectors", label: "Connectors", icon: Plug },
  { id: "reports", label: "Reports", icon: GitBranch },
];

/* ── Search overlay ────────────────────────────────────────────────────── */
function SearchOverlay({ open, onClose }) {
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setQuery("");
    }
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

  const suggestions = [
    "Renewal risk summary",
    "Spend leakage by vendor",
    "Open approvals",
    "Microsoft EA contract",
    "Q4 forecast variance",
  ].filter((s) => !query || s.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg animate-scale-in rounded-xl border border-[#1E2730] bg-[#0E1418] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[#1E2730] px-4 py-3">
          <Search className="size-4 text-[#68737D]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search findings, evidence, actions..."
            className="flex-1 bg-transparent text-sm text-[#F4F7F8] placeholder-[#68737D] outline-none"
          />
          <kbd className="rounded border border-[#243039] bg-[#11171C] px-1.5 py-0.5 text-[10px] text-[#68737D]">ESC</kbd>
        </div>
        <div className="max-h-64 overflow-y-auto p-2">
          {suggestions.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-[#68737D]">No results found</p>
          ) : (
            suggestions.map((s) => (
              <button
                key={s}
                type="button"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[#A7B0B8] transition-colors hover:bg-[#182128] hover:text-[#F4F7F8]"
                onClick={onClose}
              >
                <Search className="size-3.5 text-[#68737D]" />
                {s}
              </button>
            ))
          )}
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

  const typeDot = { critical: "bg-[#EF4444]", warning: "bg-[#F59E0B]", primary: "bg-[#22C55E]" };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full z-50 mt-2 w-96 animate-scale-in rounded-xl border border-[#1E2730] bg-[#0E1418] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1E2730] px-4 py-3">
          <span className="text-sm font-semibold text-[#F4F7F8]">Notifications</span>
          <button type="button" onClick={onClose} className="text-[#68737D] transition-colors hover:text-[#F4F7F8]">
            <X className="size-4" />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto scrollbar-thin">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={cn(
                "flex gap-3 border-b border-[#1E2730]/50 px-4 py-3 transition-colors hover:bg-[#182128]",
                !n.read && "bg-[#141B21]/50",
              )}
            >
              <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", typeDot[n.type])} />
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm leading-snug", n.read ? "text-[#A7B0B8]" : "font-medium text-[#F4F7F8]")}>{n.title}</p>
                <p className="mt-0.5 text-xs text-[#68737D]">{n.desc}</p>
                <span className="mt-1 text-[10px] text-[#68737D]">{n.time}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-[#1E2730] px-4 py-2.5 text-center">
          <button type="button" className="text-xs font-medium text-[#0EA5E9] transition-colors hover:text-[#38BDF8]">
            View all notifications
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Status bar ────────────────────────────────────────────────────────── */
function StatusBar() {
  return (
    <div className="flex items-center gap-4 overflow-x-auto border-b border-[#1E2730]/50 bg-[#080A0C] px-5 py-1.5">
      {[
        { icon: Cpu, label: "Provider", value: workspace.provider.name, dot: "online" },
        { icon: Database, label: "Database", value: workspace.database.name, dot: "connected" },
        { icon: Plug, label: "Connectors", value: `${workspace.connectors.active}/${workspace.connectors.total}`, dot: "healthy" },
        { icon: ShieldCheck, label: "Data quality", value: `Good (${workspace.dataQuality}%)` },
        { icon: RefreshCw, label: "Last sync", value: "2m ago" },
      ].map(({ icon: Icon, label, value, dot }) => (
        <div key={label} className="flex shrink-0 items-center gap-2 py-0.5">
          {dot ? <StatusDot tone={dot} /> : <Icon className="size-3 text-[#68737D]" />}
          <span className="text-[11px] text-[#68737D]">{label}</span>
          <span className="text-[11px] font-medium text-[#A7B0B8]">{value}</span>
        </div>
      ))}
      <div className="ml-auto flex items-center gap-1.5 shrink-0">
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-1.5 animate-ping rounded-full bg-[#22C55E] opacity-50" />
          <span className="relative inline-flex size-1.5 rounded-full bg-[#22C55E]" />
        </span>
        <span className="text-[11px] font-medium text-[#22C55E]">Auto-refresh</span>
      </div>
    </div>
  );
}

/* ── Main App Shell ────────────────────────────────────────────────────── */
export default function AppShell() {
  const [active, setActive] = useState("command");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const navRef = useRef(null);
  const ActiveSection = sectionComponents[active] || CommandCenter;

  const toggleSearch = useCallback(() => setSearchOpen((p) => !p), []);

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

  // Scroll active nav item into view
  useEffect(() => {
    const navEl = navRef.current;
    if (!navEl) return;
    const activeBtn = navEl.querySelector(`[data-nav-id="${active}"]`);
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [active]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#080A0C]">
      {/* ── Top Header ──────────────────────────────────────────── */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#1E2730]/60 bg-[#0B0F12] px-5">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-[#22C55E]" style={{ boxShadow: "0 0 12px rgba(34,197,94,0.25)" }}>
              <Sparkles className="size-3.5 text-[#03110a]" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-[#F4F7F8]">GENIUS</span>
          </div>
          <span className="hidden rounded border border-[#22C55E]/20 bg-[#22C55E]/8 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-[#22C55E] sm:inline">
            AI-BACKED OPS
          </span>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1.5">
          {/* AI Provider selector */}
          <DropdownMenu>
            <DropdownMenuTrigger className="hidden items-center gap-1.5 rounded-md border border-[#1E2730] bg-[#11171C] px-2.5 py-1.5 text-[11px] font-medium text-[#A7B0B8] transition-colors hover:border-[#2C3842] hover:text-[#F4F7F8] md:flex">
              <Cpu className="size-3" />
              {workspace.provider.name}
              <ChevronDown className="size-3 text-[#68737D]" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs text-[#68737D]">AI Provider</DropdownMenuLabel>
              <DropdownMenuItem className="text-sm">
                <span className="mr-2 size-1.5 rounded-full bg-[#22C55E]" />Gemini 1.5 Pro
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm">GPT-4o</DropdownMenuItem>
              <DropdownMenuItem className="text-sm">Claude 3.5 Sonnet</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-md border border-[#1E2730] bg-[#11171C] px-3 py-1.5 text-[11px] text-[#68737D] transition-colors hover:border-[#2C3842] hover:text-[#A7B0B8]"
          >
            <Search className="size-3" />
            <span className="hidden sm:inline">Search anything...</span>
            <kbd className="hidden rounded border border-[#243039] bg-[#0E1418] px-1 py-0.5 text-[9px] text-[#68737D] sm:inline">⌘K</kbd>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative flex size-8 items-center justify-center rounded-md text-[#68737D] transition-colors hover:bg-[#182128] hover:text-[#F4F7F8]"
            >
              <Bell className="size-4" />
              <span className="absolute right-1 top-1 flex size-3.5 items-center justify-center rounded-full bg-[#EF4444] text-[8px] font-bold text-white">
                3
              </span>
            </button>
            <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
          </div>

          {/* Help */}
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-md text-[#68737D] transition-colors hover:bg-[#182128] hover:text-[#F4F7F8]"
            onClick={() => setActive("support")}
          >
            <HelpCircle className="size-4" />
          </button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-[#A7B0B8] transition-colors hover:bg-[#182128] hover:text-[#F4F7F8]">
              <Avatar className="size-6">
                <AvatarFallback className="bg-[#182128] text-[10px] font-semibold text-[#22C55E]">AR</AvatarFallback>
              </Avatar>
              <span className="hidden font-medium sm:inline">Alex Rivera</span>
              <ChevronDown className="size-3 text-[#68737D]" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-[#182128] text-sm font-semibold text-[#22C55E]">AR</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[#F4F7F8]">Alex Rivera</span>
                    <span className="text-xs font-normal text-[#68737D]">alex@acmecorp.io</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setActive("profile")}>
                  <User className="mr-2 size-3.5" />Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActive("settings")}>
                  <Settings className="mr-2 size-3.5" />Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActive("support")}>
                  <HelpCircle className="mr-2 size-3.5" />Support & FAQ
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <KeyRound className="mr-2 size-3.5" />API keys
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-[#EF4444] focus:text-[#EF4444]">
                <LogOut className="mr-2 size-3.5" />Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ── Horizontal Navigation ───────────────────────────────── */}
      <nav className="shrink-0 border-b border-[#1E2730]/60 bg-[#0B0F12]">
        <div
          ref={navRef}
          className="flex items-center gap-0.5 overflow-x-auto px-5 scrollbar-thin"
        >
          {mainNav.map((item) => {
            const isActive = active === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                data-nav-id={item.id}
                onClick={() => setActive(item.id)}
                className={cn(
                  "relative flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-[13px] font-medium transition-colors",
                  isActive
                    ? "text-[#F4F7F8]"
                    : "text-[#68737D] hover:text-[#A7B0B8]",
                )}
              >
                <Icon className={cn("size-3.5", isActive ? "text-[#22C55E]" : "text-[#68737D]")} />
                {item.label}
                {item.badge && (
                  <span className="flex size-4.5 items-center justify-center rounded-full bg-[#F59E0B] text-[9px] font-bold text-[#0B0F12]">
                    {item.badge}
                  </span>
                )}
                {/* Active indicator line */}
                {isActive && (
                  <span
                    className="absolute inset-x-1 bottom-0 h-[2px] rounded-full bg-[#22C55E]"
                    style={{ boxShadow: "0 1px 8px rgba(34,197,94,0.3)" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Status Bar ──────────────────────────────────────────── */}
      <StatusBar />

      {/* ── Content ─────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto scrollbar-thin bg-[#080A0C]">
        <div
          key={active}
          className="mx-auto w-full max-w-[1600px] animate-fade-in p-5"
        >
          <ActiveSection
            label={mainNav.find((n) => n.id === active)?.label || active.charAt(0).toUpperCase() + active.slice(1)}
            onNavigate={setActive}
          />
        </div>
      </main>

      {/* ── Search overlay ──────────────────────────────────────── */}
      <SearchOverlay open={searchOpen} onClose={toggleSearch} />
    </div>
  );
}
