"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle, ArrowRight, Bell, Building, Briefcase, Calendar, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight,
  Clock, Cloud, Code2, Copy, CreditCard, Database, Download, ExternalLink, FileSpreadsheet, FileText, Fingerprint, GitBranch, Globe,
  Grid, HelpCircle, History, Info, Key, KeyRound, Laptop, LayoutDashboard, Link as LinkIcon, Lock,
  Mail, MapPin, MessageSquare, MonitorSmartphone, MoreHorizontal, Network, Palette, Plug, Plus, RefreshCw, Search, Settings,
  Shield, ShieldAlert, ShieldCheck, Sparkles, Star, Target, Timer, User, UserCheck, Users, UserPlus, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Ring } from "../shared";
import { Button } from "@/components/ui/button";

// --- Custom Toggle Component ---
function CustomToggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
        checked ? "bg-primary" : "bg-[#1E2730]"
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
  { id: "account", label: "Account", icon: User },
  { id: "workspace", label: "Workspace", icon: LayoutDashboard },
  { id: "auth", label: "Auth & Login", icon: KeyRound },
  { id: "ai", label: "AI Provider", icon: Zap },
  { id: "security", label: "Security & Data", icon: ShieldCheck },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "connectors", label: "Connectors", icon: Network },
  { id: "guardrails", label: "Agent Guardrails", icon: ShieldAlert },
  { id: "features", label: "Feature Modes", icon: Grid },
  { id: "billing", label: "Billing", icon: CreditCard },
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
  { label: "CRM Layer", status: "Demo", icon: Zap, tone: "info" },
  { label: "Excel AI", status: "Active", icon: CheckCircle2, tone: "primary" },
];

function KpiCard({ kpi }) {
  const toneMap = {
    primary: "var(--primary)",
    info: "#38BDF8",
    warning: "#f59e0b",
  };
  const color = toneMap[kpi.tone] || toneMap.primary;

  return (
    <div className="flex items-center gap-4 pr-6 border-r border-[#1E2730] last:border-0 min-w-[200px] transition-colors group cursor-pointer" onClick={() => toast(`Viewing KPI: ${kpi.label}`)}>
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
    </div>
  );
}

export default function SettingsSection() {
  const [activeNav, setActiveNav] = useState("account");
  const [rlsEnabled, setRlsEnabled] = useState(true);
  const [auditEnabled, setAuditEnabled] = useState(true);
  const [exportEnabled, setExportEnabled] = useState(true);
  const [maskingEnabled, setMaskingEnabled] = useState(true);
  const [autoPurge, setAutoPurge] = useState(true);
  const [softDelete, setSoftDelete] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const totalLogs = 247;
  const totalPages = Math.ceil(totalLogs / rowsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      toast(`Loading page ${currentPage - 1}`);
    }
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      toast(`Loading page ${currentPage + 1}`);
    }
  };
  const handlePageClick = (page) => {
    setCurrentPage(page);
    toast(`Loading page ${page}`);
  };

  const kpisToRender = activeNav === "account" ? accountKpis : settingsKpis;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#040504]">
      
      {/* Scrollable Main Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 pb-2 flex flex-col gap-6">
        
        {/* Header */}
        <header className="flex items-start justify-between shrink-0 animate-fade-in">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-white">
              <span className="text-muted-foreground">Settings /</span> {activeNav === "account" ? "Account" : activeNav === "workspace" ? "Workspace" : activeNav === "auth" ? "Auth & Login" : "Security & Data"}
            </h1>
            <p className="text-[11px] text-muted-foreground">
              {activeNav === "account" ? "Manage your personal profile, access, and account preferences." : activeNav === "workspace" ? "Configure your organization, operating context, and workspace defaults." : activeNav === "auth" ? "Control authentication, sign-in methods, and access policies across the workspace." : "Manage security, data protection, and compliance for your workspace."}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-[#1E2730] bg-[#0A0C0B] px-3 py-1.5 transition-all hover:bg-[#141B21] cursor-pointer" onClick={() => toast("Provider info clicked")}>
               <div className="size-4 rounded-full bg-[#38BDF8]/20 flex items-center justify-center"><Zap className="size-2.5 text-[#38BDF8]" /></div>
               <div className="flex flex-col gap-0 leading-none">
                 <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">AI Provider</span>
                 <span className="text-[10px] font-semibold text-white flex items-center gap-1">Gemini 1.5 Pro <span className="size-1.5 rounded-full bg-primary" /></span>
               </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#1E2730] bg-[#0A0C0B] px-3 py-1.5 transition-all hover:bg-[#141B21] cursor-pointer" onClick={() => toast("Database info clicked")}>
               <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center"><Database className="size-2.5 text-primary" /></div>
               <div className="flex flex-col gap-0 leading-none">
                 <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Database</span>
                 <span className="text-[10px] font-semibold text-white flex items-center gap-1">Supabase <span className="size-1.5 rounded-full bg-primary" /></span>
               </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#1E2730] bg-[#0A0C0B] px-3 py-1.5 transition-all hover:bg-[#141B21] cursor-pointer" onClick={() => toast("Quality info clicked")}>
               <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center"><CheckCircle2 className="size-2.5 text-primary" /></div>
               <div className="flex flex-col gap-0 leading-none">
                 <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Data quality</span>
                 <span className="text-[10px] font-semibold text-white">92%</span>
               </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#1E2730] bg-[#0A0C0B] px-3 py-1.5 transition-all hover:bg-[#141B21] cursor-pointer group" onClick={() => toast("Manual sync triggered")}>
               <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors"><RefreshCw className="size-2.5 text-primary group-hover:animate-spin" /></div>
               <div className="flex flex-col gap-0 leading-none pr-2 border-r border-[#1E2730]">
                 <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Last sync</span>
                 <span className="text-[10px] font-semibold text-white">1m ago</span>
               </div>
               <RefreshCw className="size-3.5 text-muted-foreground group-hover:text-white transition-colors ml-1" />
            </div>
          </div>
        </header>

        {/* KPI Strip */}
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-none shrink-0 pb-1 animate-fade-in-up" style={{ animationDelay: "50ms" }}>
          {kpisToRender.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>

        {/* Main 3-Column Layout */}
        <div className="flex gap-6 min-h-[700px] animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          
          {/* LEFT SIDEBAR: Nav Menu */}
          <div className="w-[200px] flex flex-col gap-2 shrink-0 sticky top-0 self-start">
            <h3 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1 pl-3">Settings</h3>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveNav(item.id); toast(`Navigated to ${item.label}`); }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left group",
                  activeNav === item.id 
                    ? "bg-[#141B21] border border-[#1E2730] shadow-[0_0_15px_rgba(255,255,255,0.02)]" 
                    : "border border-transparent hover:bg-white/[0.03]"
                )}
              >
                <item.icon className={cn("size-4", activeNav === item.id ? "text-primary" : "text-muted-foreground group-hover:text-white/80 transition-colors")} />
                <span className={cn("text-[11px] font-medium", activeNav === item.id ? "text-white" : "text-muted-foreground group-hover:text-white/80 transition-colors")}>{item.label}</span>
              </button>
            ))}
          </div>

          {/* CENTER PANEL: Main Content */}
          <div className="flex-1 flex flex-col gap-6">
            
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
            <div className="flex flex-col rounded-xl border border-[#1E2730] bg-[#0A0C0B] shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
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
                     <Button variant="outline" size="sm" className="h-7 text-[10px] border-[#1E2730] bg-[#141B21] text-white hover:bg-white/[0.05]" onClick={() => toast("Editing personal info")}>Edit</Button>
                   </div>

                   <div className="flex items-center justify-between group">
                     <div className="flex items-start gap-3">
                       <LayoutDashboard className="size-4 text-muted-foreground mt-0.5" />
                       <div className="flex flex-col gap-0.5">
                         <span className="text-[11px] font-bold text-white">Company / Contact details</span>
                         <span className="text-[10px] text-muted-foreground">Manage your organization and primary contact info.</span>
                       </div>
                     </div>
                     <Button variant="outline" size="sm" className="h-7 text-[10px] border-[#1E2730] bg-[#141B21] text-white hover:bg-white/[0.05]" onClick={() => toast("Editing company details")}>Edit</Button>
                   </div>

                   <div className="flex items-center justify-between group">
                     <div className="flex items-start gap-3">
                       <Mail className="size-4 text-muted-foreground mt-0.5" />
                       <div className="flex flex-col gap-0.5">
                         <span className="text-[11px] font-bold text-white">Email addresses</span>
                         <span className="text-[10px] text-muted-foreground">Manage your email addresses and preferences.</span>
                       </div>
                     </div>
                     <Button variant="outline" size="sm" className="h-7 text-[10px] border-[#1E2730] bg-[#141B21] text-white hover:bg-white/[0.05]" onClick={() => toast("Managing emails")}>Manage</Button>
                   </div>

                   <div className="flex items-center justify-between group">
                     <div className="flex items-start gap-3">
                       <Settings className="size-4 text-muted-foreground mt-0.5" />
                       <div className="flex flex-col gap-0.5">
                         <span className="text-[11px] font-bold text-white">Phone number</span>
                         <span className="text-[10px] text-muted-foreground">Add or update your phone number.</span>
                       </div>
                     </div>
                     <Button variant="outline" size="sm" className="h-7 text-[10px] border-[#1E2730] bg-[#141B21] text-white hover:bg-white/[0.05]" onClick={() => toast("Adding phone number")}>Add</Button>
                   </div>

                   <div className="flex items-center justify-between group">
                     <div className="flex items-start gap-3">
                       <KeyRound className="size-4 text-muted-foreground mt-0.5" />
                       <div className="flex flex-col gap-0.5">
                         <span className="text-[11px] font-bold text-white">Password</span>
                         <span className="text-[10px] text-muted-foreground">Change your password and improve security.</span>
                       </div>
                     </div>
                     <Button variant="outline" size="sm" className="h-7 text-[10px] border-[#1E2730] bg-[#141B21] text-white hover:bg-white/[0.05]" onClick={() => toast("Changing password")}>Change</Button>
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
                       <Button variant="outline" size="sm" className="h-7 text-[10px] border-[#1E2730] bg-[#141B21] text-white hover:bg-white/[0.05]" onClick={() => toast("Managing MFA")}>Manage</Button>
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
                     <Button variant="outline" size="sm" className="h-7 text-[10px] border-[#1E2730] bg-[#141B21] text-white hover:bg-white/[0.05]" onClick={() => toast("Managing recovery")}>Manage</Button>
                   </div>

                   <div className="flex items-center justify-between group">
                     <div className="flex items-start gap-3">
                       <LinkIcon className="size-4 text-muted-foreground mt-0.5" />
                       <div className="flex flex-col gap-0.5">
                         <span className="text-[11px] font-bold text-white">Linked accounts</span>
                         <span className="text-[10px] text-muted-foreground">Connect or manage third-party sign-in providers.</span>
                       </div>
                     </div>
                     <Button variant="outline" size="sm" className="h-7 text-[10px] border-[#1E2730] bg-[#141B21] text-white hover:bg-white/[0.05]" onClick={() => toast("Managing linked accounts")}>Manage</Button>
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
                     <Button variant="outline" size="sm" className="h-7 text-[10px] border-[#1E2730] bg-[#141B21] text-white hover:bg-white/[0.05]" onClick={() => toast("Managing sessions")}>Manage</Button>
                   </div>

                   <div className="flex items-center justify-between group">
                     <div className="flex items-start gap-3">
                       <ShieldCheck className="size-4 text-muted-foreground mt-0.5" />
                       <div className="flex flex-col gap-0.5">
                         <span className="text-[11px] font-bold text-white">Trusted devices</span>
                         <span className="text-[10px] text-muted-foreground">Manage devices you trust to sign in.</span>
                       </div>
                     </div>
                     <Button variant="outline" size="sm" className="h-7 text-[10px] border-[#1E2730] bg-[#141B21] text-white hover:bg-white/[0.05]" onClick={() => toast("Managing trusted devices")}>Manage</Button>
                   </div>

                   <div className="flex items-center justify-between group">
                     <div className="flex items-start gap-3">
                       <Code2 className="size-4 text-muted-foreground mt-0.5" />
                       <div className="flex flex-col gap-0.5">
                         <span className="text-[11px] font-bold text-white">API keys & tokens</span>
                         <span className="text-[10px] text-muted-foreground">Create and manage API keys for integrations.</span>
                       </div>
                     </div>
                     <Button variant="outline" size="sm" className="h-7 text-[10px] border-[#1E2730] bg-[#141B21] text-white hover:bg-white/[0.05]" onClick={() => toast("Managing API keys")}>Manage</Button>
                   </div>

                   <div className="flex items-center justify-between group">
                     <div className="flex items-start gap-3">
                       <User className="size-4 text-muted-foreground mt-0.5" />
                       <div className="flex flex-col gap-0.5">
                         <span className="text-[11px] font-bold text-white">Roles & permissions</span>
                         <span className="text-[10px] text-muted-foreground">View your roles and workspace permissions.</span>
                       </div>
                     </div>
                     <Button variant="outline" size="sm" className="h-7 text-[10px] border-[#1E2730] bg-[#141B21] text-white hover:bg-white/[0.05]" onClick={() => toast("Viewing roles")}>Manage</Button>
                   </div>

                   <div className="flex items-center justify-between group">
                     <div className="flex items-start gap-3">
                       <Bell className="size-4 text-muted-foreground mt-0.5" />
                       <div className="flex flex-col gap-0.5">
                         <span className="text-[11px] font-bold text-white">Notification preferences</span>
                         <span className="text-[10px] text-muted-foreground">Choose how you receive notifications.</span>
                       </div>
                     </div>
                     <Button variant="outline" size="sm" className="h-7 text-[10px] border-[#1E2730] bg-[#141B21] text-white hover:bg-white/[0.05]" onClick={() => toast("Managing notifications")}>Manage</Button>
                   </div>

                   <div className="flex items-center justify-between group">
                     <div className="flex items-start gap-3">
                       <Download className="size-4 text-muted-foreground mt-0.5" />
                       <div className="flex flex-col gap-0.5">
                         <span className="text-[11px] font-bold text-white">Data export</span>
                         <span className="text-[10px] text-muted-foreground">Download a copy of your personal data.</span>
                       </div>
                     </div>
                     <Button variant="outline" size="sm" className="h-7 text-[10px] border-[#1E2730] bg-[#141B21] text-white hover:bg-white/[0.05]" onClick={() => toast("Exporting data")}>Export</Button>
                   </div>

                   <div className="flex items-center justify-between group">
                     <div className="flex items-start gap-3">
                       <AlertTriangle className="size-4 text-muted-foreground mt-0.5" />
                       <div className="flex flex-col gap-0.5">
                         <span className="text-[11px] font-bold text-white">Deactivate account</span>
                         <span className="text-[10px] text-muted-foreground">Temporarily disable your account.</span>
                       </div>
                     </div>
                     <Button variant="outline" size="sm" className="h-7 text-[10px] border-[#1E2730] bg-[#141B21] text-white hover:bg-white/[0.05]" onClick={() => toast("Deactivating account")}>Deactivate</Button>
                   </div>
                 </div>
               </div>

               <div className="border-t border-critical/20 bg-critical/5 p-5 flex items-center justify-between rounded-b-xl mt-[-1px]">
                 <div className="flex items-start gap-3">
                   <AlertTriangle className="size-4 text-critical mt-0.5" />
                   <div className="flex flex-col gap-0.5">
                     <span className="text-[11px] font-bold text-white">Delete account</span>
                     <span className="text-[10px] text-muted-foreground">Permanently delete your account and all associated data. This action cannot be undone.</span>
                   </div>
                 </div>
                 <Button variant="outline" size="sm" className="h-8 text-[11px] border-critical/30 bg-critical/10 text-critical hover:bg-critical/20" onClick={() => toast("Deleting account")}>Delete account</Button>
               </div>
            </div>

            {/* Recent Account Activity */}
            <div className="flex flex-col rounded-xl border border-[#1E2730] bg-[#0A0C0B] shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
              <div className="flex items-center justify-between p-5 border-b border-[#1E2730]">
                <h3 className="text-[11px] font-bold text-white">Recent Account Activity</h3>
                <button className="text-[10px] text-[#3b82f6] hover:text-[#60a5fa] font-medium flex items-center gap-1 transition-colors group" onClick={() => toast("Viewing all activity")}>
                  View all activity <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
              <div className="overflow-x-auto scrollbar-none">
                <table className="w-full text-left text-[10px] whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-[#1E2730] bg-white/[0.02]">
                      <th className="px-5 py-2.5 font-bold text-muted-foreground uppercase tracking-widest w-[160px]">Time</th>
                      <th className="px-5 py-2.5 font-bold text-muted-foreground uppercase tracking-widest w-[140px]">Event</th>
                      <th className="px-5 py-2.5 font-bold text-muted-foreground uppercase tracking-widest">Details</th>
                      <th className="px-5 py-2.5 font-bold text-muted-foreground uppercase tracking-widest w-[120px]">IP Address</th>
                      <th className="px-5 py-2.5 font-bold text-muted-foreground uppercase tracking-widest w-[140px]">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2730]/50">
                    {recentActivity.map((log) => (
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
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between p-3 border-t border-[#1E2730] text-[10px] text-muted-foreground">
                <span>Showing 1 to 6 of 120 events</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <button className="size-6 flex items-center justify-center rounded hover:bg-[#141B21] hover:text-white transition-colors disabled:opacity-50"><ChevronLeft className="size-3" /></button>
                    <button className="size-6 flex items-center justify-center rounded bg-primary text-primary-foreground font-medium">1</button>
                    <button className="size-6 flex items-center justify-center rounded hover:bg-[#141B21] hover:text-white transition-colors font-medium">2</button>
                    <button className="size-6 flex items-center justify-center rounded hover:bg-[#141B21] hover:text-white transition-colors font-medium">3</button>
                    <button className="size-6 flex items-center justify-center rounded hover:bg-[#141B21] hover:text-white transition-colors font-medium">4</button>
                    <button className="size-6 flex items-center justify-center rounded hover:bg-[#141B21] hover:text-white transition-colors font-medium">5</button>
                    <span className="px-1">...</span>
                    <button className="size-6 flex items-center justify-center rounded hover:bg-[#141B21] hover:text-white transition-colors font-medium">20</button>
                    <button className="size-6 flex items-center justify-center rounded hover:bg-[#141B21] hover:text-white transition-colors disabled:opacity-50"><ChevronRight className="size-3" /></button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Rows per page:</span>
                    <div className="relative">
                      <select className="appearance-none bg-transparent font-medium text-white pr-4 cursor-pointer focus:outline-none">
                        <option value={6} className="bg-[#0A0C0B]">6</option>
                      </select>
                      <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 size-3 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center animate-fade-in mt-20">
                <Settings className="size-10 text-muted-foreground/30 mb-4" />
                <h3 className="text-base font-semibold text-white capitalize">{navItems.find(i => i.id === activeNav)?.label || activeNav} Configuration</h3>
                <p className="text-xs text-muted-foreground mt-2 max-w-sm">
                  Detailed settings for {navItems.find(i => i.id === activeNav)?.label || activeNav} will appear here. This section is currently locked in demo mode.
                </p>
                <Button variant="outline" size="sm" onClick={() => { setActiveNav("security"); toast("Returned to Security & Data"); }} className="mt-6 border-[#1E2730] bg-[#141B21] text-white hover:bg-white/[0.05]">
                  Return to Security & Data
                </Button>
              </div>
            )}

          </div>

          {/* RIGHT SIDEBAR */}
          <div className="w-[300px] shrink-0 flex flex-col gap-6 sticky top-0 self-start">
            
            {activeNav === "account" ? (
              <>
            {/* Recent Sign-ins */}
            <div className="flex flex-col rounded-xl border border-[#1E2730] bg-[#0A0C0B] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
               <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#1E2730]">
                 <h3 className="text-[11px] font-bold text-white">Recent Sign-ins</h3>
                 <button className="text-[10px] text-[#3b82f6] hover:text-[#60a5fa] font-medium transition-colors" onClick={() => toast("Viewing all sign-ins")}>View all</button>
               </div>
               <div className="flex flex-col gap-4">
                 {recentSignIns.map((signin) => (
                   <div key={signin.id} className="flex items-start gap-3 text-[10px]">
                     <div className="size-6 rounded-full bg-[#141B21] border border-[#1E2730] flex items-center justify-center shrink-0">
                       {signin.browser.includes("Chrome") ? (
                         <div className="size-3 rounded-full bg-[conic-gradient(from_0deg,#ea4335_0_120deg,#fbbc04_120deg_240deg,#34a853_240deg_360deg)] p-0.5"><div className="size-full rounded-full bg-[#4285f4]" /></div>
                       ) : (
                         <span className="size-3 rounded-full border-2 border-white/50" />
                       )}
                     </div>
                     <div className="flex flex-col min-w-0">
                       <span className="text-white truncate">{signin.time}</span>
                       <span className="text-muted-foreground truncate">{signin.browser} • {signin.location}</span>
                     </div>
                     <span className={cn(
                       "ml-auto text-[9px] font-medium whitespace-nowrap",
                       signin.status === "This device" ? "text-primary" : "text-primary"
                     )}>{signin.status}</span>
                   </div>
                 ))}
               </div>
            </div>

            {/* Account Summary */}
            <div className="flex flex-col rounded-xl border border-[#1E2730] bg-[#0A0C0B] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
               <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#1E2730]">
                 <h3 className="text-[11px] font-bold text-white">Account Summary</h3>
                 <button className="text-[10px] text-muted-foreground hover:text-white font-medium transition-colors" onClick={() => toast("Editing account summary")}>Edit</button>
               </div>
               <div className="flex flex-col gap-2.5 text-[10px]">
                 <div className="flex items-center justify-between">
                   <span className="text-muted-foreground font-medium">Workspace</span>
                   <span className="text-white">Acme Corporation</span>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-muted-foreground font-medium">Account ID</span>
                   <span className="text-white font-mono">ws_8f3c6b2a</span>
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
            <div className="flex flex-col rounded-xl border border-[#1E2730] bg-[#0A0C0B] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
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
              <button className="text-[10px] text-[#3b82f6] hover:text-[#60a5fa] font-medium flex items-center gap-1 transition-colors mt-4 group" onClick={() => toast("Viewing security report")}>
                View full security report <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Need help? */}
            <div className="flex flex-col gap-1.5 p-4 rounded-xl border border-[#1E2730] bg-[#141B21]/50 text-[10px]">
              <span className="font-bold text-white">Need help?</span>
              <span className="text-muted-foreground">Visit our Help Center for guides and troubleshooting.</span>
              <Button variant="outline" size="sm" className="mt-2 h-7 text-[10px] border-[#1E2730] bg-[#0A0C0B] text-white hover:bg-white/[0.05] justify-between" onClick={() => toast("Opening Help Center")}>
                Go to Help Center <ExternalLink className="size-3 ml-2 text-muted-foreground" />
              </Button>
            </div>
              </>
            ) : null}

          </div>
        </div>
      </div>
      
      {/* GLOBAL SYSTEM STATUS FOOTER (Pinned to bottom of view) */}
      <div className="shrink-0 border-t border-[#1E2730] bg-[#0A0C0B] px-6 py-2.5 flex items-center justify-between text-[10px] z-10 relative shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
         <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
             <span className="font-semibold text-white">System status</span>
             <span className="size-1.5 rounded-full bg-primary shadow-[0_0_5px_rgba(33,163,102,0.8)]" />
             <span className="text-muted-foreground">All systems operational</span>
           </div>
           
           <div className="flex items-center gap-6 pl-6 border-l border-[#1E2730]">
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
           <RefreshCw className="size-3 text-muted-foreground cursor-pointer hover:text-white transition-colors" onClick={() => toast("Refreshed status")} />
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
