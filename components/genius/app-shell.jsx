"use client";

import { useState } from "react";
import {
  AlertCircle,
  Bell,
  Bot,
  ChevronDown,
  CircleDot,
  Cpu,
  Database,
  FileSpreadsheet,
  GitBranch,
  HelpCircle,
  Home,
  LayoutDashboard,
  Lock,
  MessageSquare,
  Plug,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Upload,
  User,
  Zap,
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

const roadmapNav = [
  { id: "crm", label: "CRM Layer", tag: "Demo" },
  { id: "contracts", label: "Contract Repository", tag: "Demo" },
  { id: "mobile", label: "Native Mobile App", tag: "Demo" },
  { id: "multi", label: "Multi-Business OS", tag: "Demo" },
  { id: "billing", label: "Billing", tag: null },
  { id: "marketplace", label: "Marketplace Extensions", tag: "Demo" },
  { id: "autonomous", label: "Autonomous Execution", tag: "Locked" },
  { id: "deep", label: "Genius Deep", tag: "Locked" },
  { id: "audit", label: "Genius Audit", tag: "Locked" },
];

const systemStatus = [
  { label: "Data pipeline", status: "Healthy" },
  { label: "AI extraction", status: "Healthy" },
  { label: "Agent runtime", status: "Healthy" },
  { label: "Approval service", status: "Healthy" },
  { label: "Connectors", status: "Healthy" },
];

function NavItem({ item, active, onClick }) {
  const Icon = item.icon;
  const isActive = active === item.id;
  return (
    <button
      type="button"
      onClick={() => onClick(item.id)}
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-all duration-150",
        isActive
          ? "bg-primary/12 text-primary"
          : "text-[#8a9490] hover:bg-white/5 hover:text-[#c8d4cf]",
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            "size-4 shrink-0 transition-colors",
            isActive ? "text-primary" : "text-[#5a6660] group-hover:text-[#8a9490]",
          )}
        />
      )}
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge ? (
        <span className="flex size-5 items-center justify-center rounded-full bg-warning text-[10px] font-bold text-warning-foreground">
          {item.badge}
        </span>
      ) : null}
      {isActive && (
        <span className="size-1.5 rounded-full bg-primary" />
      )}
    </button>
  );
}

function StatusBar() {
  return (
    <div className="flex items-center gap-3 overflow-x-auto border-b border-[#ffffff08] bg-[#030404] px-4 py-1.5">
      {[
        { icon: Cpu, label: "Provider", value: workspace.provider.name, dot: "online" },
        { icon: Database, label: "Database", value: workspace.database.name, dot: "connected" },
        { icon: Plug, label: "Connectors", value: `${workspace.connectors.active}/${workspace.connectors.total}`, dot: "healthy" },
        { icon: ShieldCheck, label: "Data quality", value: `Good (${workspace.dataQuality}%)` },
        { icon: RefreshCw, label: "Last sync", value: "2m ago" },
      ].map(({ icon: Icon, label, value, dot }) => (
        <div key={label} className="flex shrink-0 items-center gap-2 py-0.5">
          {dot ? <StatusDot tone={dot} /> : <Icon className="size-3 text-[#4a5450]" />}
          <span className="text-[11px] text-[#4a5450]">{label}</span>
          <span className="text-[11px] font-medium text-[#8a9490]">{value}</span>
        </div>
      ))}
      <div className="ml-auto flex items-center gap-1.5 shrink-0">
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-1.5 animate-ping rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
        </span>
        <span className="text-[11px] text-primary font-medium">Auto-refresh</span>
        <RefreshCw className="size-3 text-primary" />
      </div>
    </div>
  );
}

export default function AppShell() {
  const [active, setActive] = useState("command");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const ActiveSection = sectionComponents[active] || CommandCenter;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#050607]">
      {/* Top header */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#ffffff08] bg-[#07080a] px-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="glow-primary flex size-7 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="size-3.5 text-[#03110a]" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">GENIUS.</span>
          </div>
          <span className="hidden rounded-full border border-primary/20 bg-primary/8 px-2 py-0.5 text-[10px] font-medium text-primary sm:inline">
            AI-BACKED OPS
          </span>
        </div>

        {/* Center: workspace selector */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button type="button" className="flex items-center gap-2 rounded-md border border-[#ffffff08] bg-[#0d0f0e] px-3 py-1.5 text-xs font-medium text-[#8a9490] transition-colors hover:border-[#1a1f1d] hover:text-foreground">
                <span className="size-1.5 rounded-full bg-primary" />
                {workspace.name}
                <ChevronDown className="size-3" />
              </button>
            }
          />
          <DropdownMenuContent align="center" className="w-52">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Workspace</DropdownMenuLabel>
            <DropdownMenuItem className="text-sm font-medium">
              <span className="size-1.5 rounded-full bg-primary mr-2" />
              {workspace.name}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative hidden md:flex items-center">
            <Search className="absolute left-2.5 size-3 text-[#4a5450]" />
            <input
              placeholder="Search anything…"
              className="h-7 w-48 rounded-md border border-[#ffffff08] bg-[#0d0f0e] pl-8 pr-3 text-xs text-[#8a9490] placeholder-[#3a4040] outline-none transition-all focus:border-[#1a2820] focus:w-56 focus:text-foreground"
            />
            <span className="absolute right-2.5 text-[10px] text-[#3a4040]">⌘K</span>
          </div>

          {/* Notifications */}
          <button type="button" className="relative flex size-7 items-center justify-center rounded-md text-[#5a6660] transition-colors hover:bg-white/5 hover:text-foreground">
            <Bell className="size-4" />
            <span className="absolute right-1 top-1 flex size-3.5 items-center justify-center rounded-full bg-critical text-[8px] font-bold text-white">8</span>
          </button>

          <button type="button" className="flex size-7 items-center justify-center rounded-md text-[#5a6660] transition-colors hover:bg-white/5 hover:text-foreground" onClick={() => setActive("support")}>
            <HelpCircle className="size-4" />
          </button>

          {/* User */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button type="button" className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-[#8a9490] transition-colors hover:bg-white/5 hover:text-foreground">
                  <Avatar className="size-6">
                    <AvatarFallback className="bg-[#16211b] text-[10px] font-semibold text-primary">AR</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">Alex Rivera</span>
                  <ChevronDown className="size-3" />
                </button>
              }
            />
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm">Alex Rivera</span>
                  <span className="text-xs font-normal text-muted-foreground">Owner</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setActive("profile")}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActive("settings")}>Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActive("support")}>Support</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-critical">Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Status bar */}
      <StatusBar />

      {/* Main layout: sidebar + content */}
      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <aside className="flex w-[200px] shrink-0 flex-col overflow-hidden border-r border-[#ffffff08] bg-[#07080a]">
          {/* Workspace label */}
          <div className="px-4 pb-1 pt-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#3a4040]">Workspace</span>
          </div>

          {/* Workspace pill */}
          <div className="px-2 pb-2">
            <button type="button" className="flex w-full items-center justify-between rounded-lg border border-[#ffffff06] bg-[#0d0f0e] px-3 py-2 text-xs font-medium text-[#8a9490] hover:border-[#1a1f1d] hover:text-foreground transition-colors">
              <span className="truncate">{workspace.name}</span>
              <ChevronDown className="size-3 shrink-0" />
            </button>
          </div>

          {/* Main nav */}
          <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-1">
            <div className="flex flex-col gap-0.5">
              {mainNav.map((item) => (
                <NavItem key={item.id} item={item} active={active} onClick={setActive} />
              ))}
            </div>

            {/* Roadmap section */}
            <div className="mt-4">
              <div className="px-3 pb-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#3a4040]">Roadmap & Future</span>
              </div>
              <div className="flex flex-col gap-0.5">
                {roadmapNav.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg px-3 py-1.5 text-sm text-[#4a5450]"
                  >
                    <span className="truncate text-xs">{item.label}</span>
                    {item.tag && (
                      <span className={cn(
                        "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
                        item.tag === "Demo" && "bg-primary/10 text-primary",
                        item.tag === "Locked" && "bg-[#1a1f1d] text-[#3a4040]",
                      )}>
                        {item.tag}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </nav>

          {/* User profile */}
          <div className="border-t border-[#ffffff08] p-2">
            <button
              type="button"
              onClick={() => setActive("profile")}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/5"
            >
              <Avatar className="size-7 shrink-0">
                <AvatarFallback className="bg-[#16211b] text-[10px] font-semibold text-primary">AR</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-[#c8d4cf]">Alex Rivera</p>
                <p className="text-[10px] text-[#4a5450]">Owner</p>
              </div>
            </button>

            {/* System status */}
            <div className="mt-2 rounded-lg border border-[#ffffff06] bg-[#0d0f0e] px-3 py-2">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#3a4040]">System status</p>
              <div className="flex flex-col gap-1">
                {systemStatus.map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[10px] text-[#4a5450]">
                      <span className="size-1.5 rounded-full bg-primary" />
                      {s.label}
                    </span>
                    <span className="text-[10px] text-primary">{s.status}</span>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setActive("support")} className="mt-1.5 text-[10px] text-[#3a4040] hover:text-[#5a6660] transition-colors">
                Need help? Visit Support / FAQ
              </button>
            </div>
          </div>
        </aside>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin bg-[#050607]">
          <div
            key={active}
            className="mx-auto w-full max-w-[1600px] animate-fade-in p-5"
          >
            <ActiveSection label={mainNav.find(n => n.id === active)?.label || ""} onNavigate={setActive} />
          </div>
        </main>
      </div>
    </div>
  );
}
