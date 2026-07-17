"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Database,
  FileText,
  Users,
  Target,
  DollarSign,
  ShieldCheck,
  Brain,
  History,
  ChevronRight,
  Plus,
  Upload,
  MoreHorizontal,
  Calendar,
  Zap,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  BookOpen,
  Network,
  Scale,
  Save,
} from "lucide-react";

function StatusPill({ status }) {
  const styles = {
    "On track":        "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    "At risk":         "bg-amber-500/10 text-amber-400 border-amber-500/25",
    "Off track":       "bg-red-500/10 text-red-400 border-red-500/25",
    "Healthy":         "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    "Needs attention": "bg-amber-500/10 text-amber-400 border-amber-500/25",
    "Verified":        "bg-primary/10 text-primary border-primary/25",
    "Pending":         "bg-amber-500/10 text-amber-400 border-amber-500/25",
    "High":            "bg-red-500/10 text-red-400 border-red-500/25",
    "Medium":          "bg-amber-500/10 text-amber-400 border-amber-500/25",
    "Low":             "bg-zinc-500/10 text-zinc-400 border-zinc-500/25",
    "Critical":        "bg-red-500/10 text-red-400 border-red-500/25",
    "Enabled":         "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap", styles[status] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/25")}>
      <span className="size-1 rounded-full bg-current" />
      {status}
    </span>
  );
}

function SectionCard({ title, icon: Icon, children, action, actionLabel, className }) {
  return (
    <div className={cn("flex flex-col rounded-xl border border-[#28313C] bg-[#0E1116] overflow-hidden", className)}>
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#28313C]">
        <div className="flex items-center gap-2.5">
          {Icon && <Icon className="size-4 text-primary shrink-0" strokeWidth={1.5} />}
          <span className="text-[13px] font-bold text-white">{title}</span>
        </div>
        {action && (
          <button type="button" onClick={action} className="flex items-center gap-1.5 text-[11px] text-primary hover:text-primary/80 transition-colors cursor-pointer">
            {actionLabel}<ArrowRight className="size-3" />
          </button>
        )}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function ProgressBar({ value, tone = "primary" }) {
  const pct = Math.min(100, Math.round(Number(value) || 0));
  const colors = { primary: "bg-primary", warning: "bg-amber-400", critical: "bg-red-400", success: "bg-emerald-400" };
  return (
    <div className="h-1.5 w-full rounded-full bg-white/5">
      <div className={cn("h-full rounded-full transition-all duration-500", colors[tone] || colors.primary)} style={{ width: `${pct}%` }} />
    </div>
  );
}

function MetricRow({ label, value, sub, mono = false, tone }) {
  const toneClass = tone === "warning" ? "text-amber-400" : tone === "critical" ? "text-red-400" : tone === "success" ? "text-emerald-400" : "text-white";
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#28313C]/60 last:border-0">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <div className="flex flex-col items-end gap-0.5">
        <span className={cn("text-[11px] font-semibold", mono && "font-mono", toneClass)}>{value}</span>
        {sub && <span className="text-[9px] text-muted-foreground/70">{sub}</span>}
      </div>
    </div>
  );
}

const companyData = {
  legalName: "GreenFarm Inc.",
  description: "Sustainable agriculture and smart farming solutions. AI-powered crop monitoring, precision irrigation, and supply chain optimization for modern agribusiness.",
  industry: "Agriculture Technology",
  businessModel: "B2B SaaS",
  size: "201\u2013500 employees",
  jurisdiction: "Delaware, USA",
  markets: ["USA", "EU", "UK"],
  currency: "USD",
  fiscalYear: "Jan 1 \u2013 Dec 31",
  languages: ["EN", "ES"],
  regulations: ["GDPR", "SOC 2", "ISO 27001"],
  website: "greenfarm.io",
  owner: "Alex Morgan",
  verified: true,
  lastEdited: "May 20, 2026",
  lastEditedBy: "Sarah M.",
};

const objectives = [
  { id: 1, title: "Reduce operational costs by 15%", owner: "CFO \u2013 Sarah M.", period: "Q2 2026", current: "6.8%", target: "15%", progress: 45, status: "On track", agents: 3 },
  { id: 2, title: "Expand into the European market", owner: "COO \u2013 James B.", period: "Q3 2026", current: "40%", target: "100%", progress: 40, status: "At risk", agents: 2 },
  { id: 3, title: "Increase gross margin from 24% to 30%", owner: "CFO \u2013 Sarah M.", period: "Q2 2026", current: "24%", target: "30%", progress: 0, status: "On track", agents: 2 },
  { id: 4, title: "Improve customer retention to 95%", owner: "Head of CS \u2013 Ken R.", period: "Q2 2026", current: "88%", target: "95%", progress: 71, status: "On track", agents: 1 },
];

const financialBaselines = [
  { label: "Quarterly OPEX budget", value: "$4,250,000", sub: "Q2 2026" },
  { label: "Monthly spending limit", value: "$1,400,000" },
  { label: "Target gross margin", value: "28%" },
  { label: "Min. acceptable ROI", value: "15%" },
  { label: "Cash runway target", value: "18 months" },
  { label: "Primary currency", value: "USD" },
];

const financialGuardrails = [
  { label: "Purchase approval limit", value: "$10,000", agents: ["Approvals", "Savings Radar"] },
  { label: "Contract approval limit", value: "$50,000", agents: ["Approvals", "AI Gateway"] },
  { label: "Vendor price increase alert", value: "> 8%", agents: ["Diagnostics"] },
  { label: "Spending anomaly threshold", value: "> 12%", agents: ["Diagnostics", "Savings Radar"] },
  { label: "Budget variance threshold", value: "10%", agents: ["Diagnostics"] },
];

const orgNodes = [
  { id: "ceo", title: "CEO", name: "Alex Morgan", color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
  { id: "cfo", title: "CFO", name: "Sarah M.", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  { id: "coo", title: "COO", name: "James B.", color: "text-[#7CC7FF]", bg: "bg-[#4EA1FF]/10", border: "border-[#4EA1FF]/30" },
  { id: "cto", title: "CTO", name: "Ken R.", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/30" },
];

const departments = [
  { name: "Finance", count: 12, head: "Sarah M." },
  { name: "Operations", count: 28, head: "James B." },
  { name: "Product", count: 16, head: "Maria L." },
  { name: "Sales", count: 22, head: "Chris D." },
];

const approvalMatrix = [
  { decision: "Purchases < $10k", threshold: "< $10,000", primary: "Dept. Head", backup: "Finance Dir.", sla: "24h", escalation: "COO after 24h" },
  { decision: "Contracts $10k\u2013$50k", threshold: "$10k\u2013$50k", primary: "Finance Director", backup: "CFO", sla: "48h", escalation: "CEO after 48h" },
  { decision: "Contracts > $50k", threshold: "> $50,000", primary: "CFO", backup: "CEO", sla: "72h", escalation: "Board after 72h" },
  { decision: "High-risk legal", threshold: "Any", primary: "Legal Lead + CFO", backup: "CEO", sla: "48h", escalation: "Board review" },
];

const knowledgeStats = { total: 142, verified: 89, pending: 9, outdated: 7, conflicts: 2, restricted: 6 };

const knowledgeCategories = [
  { name: "Policies", pct: 42, color: "bg-primary" },
  { name: "Contracts", pct: 25, color: "bg-[#7CC7FF]" },
  { name: "Financial", pct: 18, color: "bg-emerald-400" },
  { name: "Operations", pct: 10, color: "bg-violet-400" },
  { name: "Other", pct: 5, color: "bg-zinc-500" },
];

const recentDocs = [
  { title: "AI Data Usage Policy v3", type: "Policy", version: "3.0", date: "May 19, 2026", status: "Verified", access: "All agents" },
  { title: "Vendor Risk Policy v2", type: "Policy", version: "2.0", date: "May 17, 2026", status: "Verified", access: "Restricted" },
  { title: "Q2 Financial Baseline", type: "Financial", version: "1.2", date: "May 15, 2026", status: "Verified", access: "Finance agents" },
  { title: "EU Expansion Strategy", type: "Operations", version: "0.9", date: "May 12, 2026", status: "Pending", access: "All agents" },
];

const evidenceRules = [
  { rule: "AI agents may use only verified documents as authoritative sources", priority: "Critical", agents: "All", updated: "May 1, 2026" },
  { rule: "Draft documents are not valid primary evidence", priority: "High", agents: "All", updated: "May 1, 2026" },
  { rule: "Financial recommendations require \u2265 2 independent sources", priority: "Critical", agents: "Finance agents", updated: "Apr 15, 2026" },
  { rule: "Documents older than 12 months require re-verification", priority: "High", agents: "All", updated: "Apr 15, 2026" },
  { rule: "Conflicting documents \u2192 use latest approved version", priority: "High", agents: "All", updated: "Mar 20, 2026" },
  { rule: "Critical AI actions must be traceable to source documents", priority: "Critical", agents: "All", updated: "Mar 20, 2026" },
  { rule: "Restricted docs may only be used by authorized agents", priority: "High", agents: "Auth agents", updated: "Mar 10, 2026" },
  { rule: "Unverified assumptions must be clearly disclosed in output", priority: "Medium", agents: "All", updated: "Feb 28, 2026" },
];

const missingItems = [
  { issue: "Vendor risk policy is not defined", severity: "High", agents: 3, impact: "Financial guardrails incomplete", owner: "James B." },
  { issue: "Data retention policy is missing", severity: "High", agents: 5, impact: "GDPR compliance risk", owner: "Legal" },
  { issue: "Q2 Product team targets not set", severity: "Medium", agents: 2, impact: "Agent recommendations unaligned", owner: "Maria L." },
  { issue: "Two documents contain conflicting approval limits", severity: "High", agents: 4, impact: "Approval workflow inconsistency", owner: "Sarah M." },
  { issue: "Financial baseline not reviewed this quarter", severity: "Medium", agents: 7, impact: "Guardrails may be stale", owner: "CFO" },
];

const contextHealth = [
  { metric: "Context completeness", value: 82, status: "Needs attention" },
  { metric: "Data freshness", value: 91, status: "Healthy" },
  { metric: "Consistency", value: 74, status: "Needs attention" },
  { metric: "Evidence coverage", value: 88, status: "Healthy" },
  { metric: "Ownership coverage", value: 95, status: "Healthy" },
  { metric: "Agent readiness", value: 79, status: "Needs attention" },
];

const recentChanges = [
  { what: "Updated OKR: Reduce operational costs", detail: "Progress 6.8% \u2192 target 15%", who: "Sarah M.", when: "May 20, 11:42 AM", agents: 3 },
  { what: "Added policy: AI Data Usage Policy", detail: "v3.0 \u2013 all agents authorized", who: "Alex M.", when: "May 19, 09:15 AM", agents: 7 },
  { what: "Changed purchase approval limit", detail: "$10,000 \u2192 $12,000 (pending)", who: "Sarah M.", when: "May 18, 04:32 PM", agents: 4 },
  { what: "Uploaded Vendor Risk Policy v2", detail: "Restricted \u2013 James B. authorized", who: "James B.", when: "May 17, 01:08 PM", agents: 2 },
  { what: "Updated organization chart", detail: "Added COO direct reports", who: "Alex M.", when: "May 16, 10:21 AM", agents: 1 },
];

const aiContextItems = [
  { label: "Primary objective", value: "Reduce operating costs" },
  { label: "Target gross margin", value: "28%" },
  { label: "Main markets", value: "USA, EU, UK" },
  { label: "Primary jurisdiction", value: "Delaware, USA" },
  { label: "Approval threshold", value: "$10,000 / $50,000" },
  { label: "Restricted data", value: "Employee PII & salaries" },
  { label: "Trusted sources", value: "89 verified documents" },
  { label: "Risk tolerance", value: "Conservative (15% ROI min)" },
  { label: "Active agents", value: "7 using this context" },
];

function OrgNode({ node }) {
  return (
    <div className={cn("flex flex-col items-center gap-1 rounded-lg border p-2.5 min-w-[90px] cursor-pointer hover:brightness-110 transition-all", node.bg, node.border)}>
      <div className={cn("flex size-7 items-center justify-center rounded-full bg-white/5 text-[10px] font-bold", node.color)}>
        {node.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
      </div>
      <span className={cn("text-[9px] font-bold uppercase tracking-widest", node.color)}>{node.title}</span>
      <span className="text-[10px] text-white font-medium text-center leading-tight">{node.name}</span>
    </div>
  );
}

function OkrRow({ obj }) {
  const tone = obj.status === "On track" ? "success" : obj.status === "At risk" ? "warning" : "critical";
  const dotClass = tone === "success" ? "bg-emerald-400" : tone === "warning" ? "bg-amber-400" : "bg-red-400";
  return (
    <button type="button" onClick={() => toast.info(`Opening: ${obj.title}`)} className="w-full flex items-center gap-4 px-5 py-3.5 border-b border-[#28313C]/60 last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer text-left group">
      <div className={cn("size-2 rounded-full shrink-0 mt-0.5", dotClass)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-[12px] font-semibold text-white truncate">{obj.title}</span>
          <StatusPill status={obj.status} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-muted-foreground">{obj.owner}</span>
          <span className="text-[10px] text-muted-foreground">\u00b7</span>
          <span className="text-[10px] text-muted-foreground">{obj.period}</span>
          <span className="text-[10px] text-muted-foreground">\u00b7</span>
          <span className="text-[10px] text-muted-foreground">{obj.agents} agents</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0 w-32">
        <div className="flex items-center gap-1 w-full justify-end">
          <span className="text-[10px] text-muted-foreground">{obj.current}</span>
          <span className="text-[10px] text-muted-foreground">\u2192</span>
          <span className="text-[10px] font-semibold text-white">{obj.target}</span>
        </div>
        <ProgressBar value={obj.progress} tone={tone} />
        <span className="text-[9px] text-muted-foreground">{obj.progress}%</span>
      </div>
      <ChevronRight className="size-3.5 text-muted-foreground/40 group-hover:text-white transition-colors shrink-0" />
    </button>
  );
}

function HealthRow({ item }) {
  const tone = item.status === "Healthy" ? "success" : item.status === "Needs attention" ? "warning" : "critical";
  const dotClass = tone === "success" ? "bg-emerald-400" : tone === "warning" ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-3 py-2 border-b border-[#28313C]/50 last:border-0">
      <div className={cn("size-1.5 rounded-full shrink-0", dotClass)} />
      <span className="text-[11px] text-muted-foreground flex-1 min-w-0 truncate">{item.metric}</span>
      <div className="w-20 shrink-0"><ProgressBar value={item.value} tone={tone} /></div>
      <span className="text-[11px] font-semibold text-white w-8 text-right shrink-0">{item.value}%</span>
    </div>
  );
}

export default function CompanyDetails({ onNavigate }) {
  const [unsaved, setUnsaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Q2 2026");
  const [confirmDialog, setConfirmDialog] = useState(null);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 900));
    setSaving(false);
    setUnsaved(false);
    toast.success("Company context saved successfully");
  };

  const handleFinancialChange = () => {
    setConfirmDialog({
      title: "Change affects active agents",
      body: "This change affects 4 active agents and 3 approval workflows. New actions will use the updated threshold after confirmation.",
      onConfirm: () => { setConfirmDialog(null); setUnsaved(true); toast.success("Financial guardrail updated"); },
    });
  };

  const healthScore = Math.round(contextHealth.reduce((a, c) => a + c.value, 0) / contextHealth.length);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#080A0E]">

      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setConfirmDialog(null)} />
          <div className="relative w-full max-w-md rounded-2xl border border-[#28313C] bg-[#0E1116] p-6 shadow-2xl">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="size-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-white mb-1">{confirmDialog.title}</h3>
                <p className="text-[12px] text-muted-foreground leading-relaxed">{confirmDialog.body}</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setConfirmDialog(null)} className="px-4 py-2 text-[11px] font-medium text-muted-foreground rounded-lg border border-[#28313C] hover:bg-white/5 transition-colors cursor-pointer">Cancel</button>
              <button type="button" onClick={confirmDialog.onConfirm} className="px-4 py-2 text-[11px] font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">Confirm change</button>
            </div>
          </div>
        </div>
      )}

      <div className="shrink-0 border-b border-[#28313C] bg-[#0E1116] px-6 py-4">
        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1">
              <span>Workspace</span>
              <ChevronRight className="size-3" />
              <span className="text-white font-medium">Company Details</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-white">Company Details</h1>
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Context healthy</span>
              </div>
              {unsaved && (
                <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1">
                  <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">Unsaved changes</span>
                </div>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Central business context used by AI agents for analysis, recommendations and actions.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <div className="hidden xl:flex flex-col items-end gap-0.5 mr-1">
              <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Last reviewed</span>
              <span className="text-[11px] font-semibold text-white">May 20, 2026 \u00b7 {companyData.owner}</span>
            </div>
            <button type="button" className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#28313C] bg-[#141A22] text-[11px] text-muted-foreground hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
              <History className="size-3.5" /><span className="hidden sm:inline">Audit log</span>
            </button>
            <button type="button" className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#28313C] bg-[#141A22] text-[11px] text-muted-foreground hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
              <MoreHorizontal className="size-3.5" />
            </button>
            <button type="button" className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-primary/30 bg-primary/10 text-[11px] font-bold text-primary hover:bg-primary/20 transition-colors cursor-pointer">
              <RefreshCw className="size-3.5" />Review context
            </button>
            {unsaved && (
              <button type="button" onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-[11px] font-bold text-white hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-70">
                <Save className="size-3.5" />{saving ? "Saving\u2026" : "Save changes"}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center overflow-x-auto scrollbar-none -mx-1">
          {[
            { label: "Context completeness", value: "82%", tone: "success", icon: CheckCircle2 },
            { label: "Last reviewed", value: "May 20, 2026", tone: "neutral", icon: null },
            { label: "Data sources", value: "8 connected", tone: "neutral", icon: null },
            { label: "Context conflicts", value: "2", tone: "critical", icon: null },
            { label: "Agents using", value: "7", tone: "neutral", icon: null },
          ].map((stat, i) => {
            const Icon = stat.icon;
            const valClass = stat.tone === "warning" ? "text-amber-400" : stat.tone === "success" ? "text-emerald-400" : stat.tone === "primary" ? "text-primary" : stat.tone === "critical" ? "text-red-400" : "text-white";
            return (
              <div key={i} className="flex items-center gap-2.5 px-4 py-2 border-r border-[#28313C] first:pl-1 last:border-r-0 shrink-0">
                {Icon && <Icon className={cn("size-3.5 shrink-0", valClass)} />}
                <div className="flex flex-col">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider whitespace-nowrap">{stat.label}</span>
                  <span className={cn("text-[12px] font-bold whitespace-nowrap", valClass)}>{stat.value}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="flex min-h-full">


          {/* MAIN GRID */}
          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1.4fr_1fr] gap-5 w-full">

            {/* LEFT COLUMN - 35% */}
            <div className="flex flex-col gap-5 min-w-0">
              {/* COMPANY IDENTITY */}
              <SectionCard title="Company Identity" actionLabel="..." className="flex-col">
                 <div className="flex flex-col p-5">
                    <div className="flex items-start gap-4 mb-5">
                       <div className="relative size-14 rounded-lg overflow-hidden shrink-0 border border-[#28313C]">
                          <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=200&auto=format&fit=crop" className="absolute inset-0 size-full object-cover" alt="HQ" />
                          <div className="absolute inset-0 bg-black/40" />
                          <div className="absolute inset-0 flex items-center justify-center">
                             <div className="size-8 bg-[#0E1116]/90 rounded flex items-center justify-center backdrop-blur-sm border border-emerald-500/30">
                                <Building2 className="size-4 text-emerald-400" />
                             </div>
                          </div>
                       </div>
                       <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                             <h2 className="text-[16px] font-bold text-white leading-none">GreenFarm Inc.</h2>
                             <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 rounded px-1.5 py-0.5 uppercase tracking-wider">
                                <CheckCircle2 className="size-2.5" /> Verified
                             </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">Sustainable agriculture and smart farming solutions</p>
                          <div className="flex items-center gap-1.5 mt-2">
                             <span className="text-[10px] text-muted-foreground border border-[#28313C] bg-[#141A22] px-2 py-0.5 rounded">Agriculture</span>
                             <span className="text-[10px] text-muted-foreground border border-[#28313C] bg-[#141A22] px-2 py-0.5 rounded">SaaS</span>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 gap-x-4 border-t border-[#28313C] pt-5">
                       <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Company size</span>
                          <span className="text-[11px] font-medium text-white">201-500 employees</span>
                       </div>
                       <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Jurisdiction</span>
                          <span className="text-[11px] font-medium text-white">Delaware, USA</span>
                       </div>
                       <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Business model</span>
                          <span className="text-[11px] font-medium text-white">B2B SaaS</span>
                       </div>
                       <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Primary currency</span>
                          <span className="text-[11px] font-medium text-white">USD</span>
                       </div>
                       <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Markets</span>
                          <span className="text-[11px] font-medium text-white">USA, EU, UK</span>
                       </div>
                       <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Fiscal year</span>
                          <span className="text-[11px] font-medium text-white">Jan 1 - Dec 31</span>
                       </div>
                       <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Languages</span>
                          <span className="text-[11px] font-medium text-white">EN, ES</span>
                       </div>
                       <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Regulatory profile</span>
                          <span className="text-[11px] font-medium text-white">GDPR, SOC2, ISO27001</span>
                       </div>
                    </div>
                 </div>
              </SectionCard>

              {/* FINANCIAL BASELINES & GUARDRAILS */}
              <SectionCard title="Financial Baselines & Guardrails" actionLabel="Edit">
                 <div className="grid grid-cols-2 p-5 gap-6">
                    <div className="flex flex-col gap-3">
                       <div className="flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">Quarterly budget (OPEX)</span>
                          <span className="text-[11px] font-semibold text-white font-mono">$4,250,000</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">Monthly spending limit</span>
                          <span className="text-[11px] font-semibold text-white font-mono">$1,400,000</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">Target gross margin</span>
                          <span className="text-[11px] font-semibold text-white font-mono">28%</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">Min. acceptable ROI</span>
                          <span className="text-[11px] font-semibold text-white font-mono">15%</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">Budget variance threshold</span>
                          <span className="text-[11px] font-semibold text-white font-mono">10%</span>
                       </div>
                    </div>
                    <div className="flex flex-col gap-3">
                       <div className="flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">Purchase approval limit</span>
                          <span className="text-[11px] font-semibold text-white font-mono">$10,000</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">Contract approval limit</span>
                          <span className="text-[11px] font-semibold text-white font-mono">$50,000</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">Vendor price increase alert</span>
                          <span className="text-[11px] font-semibold text-amber-400 font-mono">&gt; 8%</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">Spend anomaly threshold</span>
                          <span className="text-[11px] font-semibold text-amber-400 font-mono">&gt; 12%</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">Cash runway target</span>
                          <span className="text-[11px] font-semibold text-white font-mono">12 months</span>
                       </div>
                    </div>
                 </div>
              </SectionCard>

              {/* EVIDENCE RULES */}
              <SectionCard title="Evidence Rules" actionLabel="Edit rules">
                 <div className="flex flex-col p-5 gap-3.5">
                    <div className="flex items-start gap-3">
                       <FileText className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
                       <span className="text-[11px] text-white">AI agents must use only verified documents as sources of truth</span>
                    </div>
                    <div className="flex items-start gap-3">
                       <FileText className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
                       <span className="text-[11px] text-white">Draft documents are not allowed as primary evidence</span>
                    </div>
                    <div className="flex items-start gap-3">
                       <FileText className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
                       <span className="text-[11px] text-white">For financial recommendations – at least 2 independent sources required</span>
                    </div>
                    <div className="flex items-start gap-3">
                       <FileText className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
                       <span className="text-[11px] text-white">Documents older than 12 months require re-verification</span>
                    </div>
                    <div className="flex items-start gap-3">
                       <FileText className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
                       <span className="text-[11px] text-white">Conflicting documents &rarr; use latest approved version</span>
                    </div>
                    <div className="flex items-start gap-3">
                       <FileText className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
                       <span className="text-[11px] text-white">All AI actions must be traceable to source documents</span>
                    </div>
                 </div>
              </SectionCard>
            </div>

            {/* CENTER COLUMN - 40% */}
            <div className="flex flex-col gap-5 min-w-0">
               {/* STRATEGIC OBJECTIVES */}
               <SectionCard title="Strategic Objectives (OKRs)" actionLabel="...">
                  <div className="flex items-center justify-between p-4 border-b border-[#28313C]">
                     <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">Q2 2026</span>
                     </div>
                     <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#28313C] bg-[#141A22] text-[10px] text-white hover:bg-white/5 transition-colors">
                        <Plus className="size-3" /> Add Objective
                     </button>
                  </div>
                  <div className="flex flex-col p-2">
                     {/* OKR 1 */}
                     <div className="flex flex-col gap-2 p-3 rounded-lg hover:bg-white/[0.02] transition-colors border-b border-[#28313C]/50 last:border-0">
                        <div className="flex items-start justify-between gap-4">
                           <div className="flex items-start gap-3 min-w-0">
                              <div className="size-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                 <Target className="size-3.5 text-emerald-400" />
                              </div>
                              <div className="flex flex-col gap-1 min-w-0">
                                 <span className="text-[12px] font-bold text-white truncate">Reduce operational costs by 15%</span>
                                 <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                    <span>Financial</span>
                                    <span className="w-1 h-1 rounded-full bg-[#28313C]" />
                                    <span>Owner: CFO – Sarah M.</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <div className="flex items-center gap-2">
                                 <span className="text-[11px] font-semibold text-white">6.8% &rarr; 15%</span>
                                 <StatusPill status="On track" />
                              </div>
                              <div className="w-24 h-1 rounded-full bg-[#28313C] mt-0.5 overflow-hidden">
                                 <div className="h-full bg-emerald-400 rounded-full" style={{ width: '45%' }} />
                              </div>
                           </div>
                        </div>
                     </div>
                     {/* OKR 2 */}
                     <div className="flex flex-col gap-2 p-3 rounded-lg hover:bg-white/[0.02] transition-colors border-b border-[#28313C]/50 last:border-0">
                        <div className="flex items-start justify-between gap-4">
                           <div className="flex items-start gap-3 min-w-0">
                              <div className="size-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                 <Target className="size-3.5 text-emerald-400" />
                              </div>
                              <div className="flex flex-col gap-1 min-w-0">
                                 <span className="text-[12px] font-bold text-white truncate">Expand into European market</span>
                                 <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                    <span>Growth</span>
                                    <span className="w-1 h-1 rounded-full bg-[#28313C]" />
                                    <span>Owner: COO – James B.</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <div className="flex items-center gap-2">
                                 <span className="text-[11px] font-semibold text-white">40%</span>
                                 <StatusPill status="At risk" />
                              </div>
                              <div className="w-24 h-1 rounded-full bg-[#28313C] mt-0.5 overflow-hidden">
                                 <div className="h-full bg-amber-400 rounded-full" style={{ width: '40%' }} />
                              </div>
                           </div>
                        </div>
                     </div>
                     {/* OKR 3 */}
                     <div className="flex flex-col gap-2 p-3 rounded-lg hover:bg-white/[0.02] transition-colors border-b border-[#28313C]/50 last:border-0">
                        <div className="flex items-start justify-between gap-4">
                           <div className="flex items-start gap-3 min-w-0">
                              <div className="size-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                 <Target className="size-3.5 text-emerald-400" />
                              </div>
                              <div className="flex flex-col gap-1 min-w-0">
                                 <span className="text-[12px] font-bold text-white truncate">Increase gross margin to 30%</span>
                                 <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                    <span>Financial</span>
                                    <span className="w-1 h-1 rounded-full bg-[#28313C]" />
                                    <span>Owner: CFO – Sarah M.</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <div className="flex items-center gap-2">
                                 <span className="text-[11px] font-semibold text-white">24% &rarr; 30%</span>
                                 <StatusPill status="On track" />
                              </div>
                              <div className="w-24 h-1 rounded-full bg-[#28313C] mt-0.5 overflow-hidden">
                                 <div className="h-full bg-emerald-400 rounded-full" style={{ width: '20%' }} />
                              </div>
                           </div>
                        </div>
                     </div>
                     {/* OKR 4 */}
                     <div className="flex flex-col gap-2 p-3 rounded-lg hover:bg-white/[0.02] transition-colors border-b border-[#28313C]/50 last:border-0">
                        <div className="flex items-start justify-between gap-4">
                           <div className="flex items-start gap-3 min-w-0">
                              <div className="size-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                 <Target className="size-3.5 text-emerald-400" />
                              </div>
                              <div className="flex flex-col gap-1 min-w-0">
                                 <span className="text-[12px] font-bold text-white truncate">Improve customer retention to 95%</span>
                                 <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                    <span>Customer</span>
                                    <span className="w-1 h-1 rounded-full bg-[#28313C]" />
                                    <span>Owner: Head of CS – Ken R.</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <div className="flex items-center gap-2">
                                 <span className="text-[11px] font-semibold text-white">88% &rarr; 95%</span>
                                 <StatusPill status="On track" />
                              </div>
                              <div className="w-24 h-1 rounded-full bg-[#28313C] mt-0.5 overflow-hidden">
                                 <div className="h-full bg-emerald-400 rounded-full" style={{ width: '70%' }} />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </SectionCard>

               {/* ORGANIZATION & APPROVALS */}
               <SectionCard title="Organization & Approvals" actionLabel="View org chart">
                  <div className="flex flex-col items-center p-6 py-8 relative">
                     {/* CEO */}
                     <div className="flex flex-col items-center justify-center rounded border border-[#28313C] bg-[#141A22] px-4 py-2 min-w-[120px] z-10 relative">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">CEO</span>
                        <span className="text-[11px] font-bold text-white">Alex Morgan</span>
                     </div>
                     {/* Line down from CEO */}
                     <div className="w-px h-6 bg-[#28313C]" />
                     {/* Horizontal connector */}
                     <div className="w-[80%] h-px bg-[#28313C]" />
                     {/* C-Level Row */}
                     <div className="flex items-start justify-between w-[80%] mt-0 relative">
                        {/* CFO */}
                        <div className="flex flex-col items-center relative">
                           <div className="w-px h-6 bg-[#28313C]" />
                           <div className="flex flex-col items-center justify-center rounded border border-[#28313C] bg-[#141A22] px-4 py-2 min-w-[100px] z-10">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">CFO</span>
                              <span className="text-[11px] font-bold text-white">Sarah M.</span>
                           </div>
                           <div className="w-px h-6 bg-[#28313C]" />
                           <div className="flex flex-col items-center justify-center rounded border border-[#28313C] bg-[#0E1116] px-3 py-1.5 min-w-[90px] opacity-70">
                              <span className="text-[10px] text-white">Finance</span>
                              <span className="text-[9px] text-muted-foreground">12 members</span>
                           </div>
                        </div>
                        {/* COO */}
                        <div className="flex flex-col items-center relative">
                           <div className="w-px h-6 bg-[#28313C]" />
                           <div className="flex flex-col items-center justify-center rounded border border-[#28313C] bg-[#141A22] px-4 py-2 min-w-[100px] z-10">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">COO</span>
                              <span className="text-[11px] font-bold text-white">James B.</span>
                           </div>
                           <div className="w-px h-6 bg-[#28313C]" />
                           <div className="flex flex-col gap-2 w-full mt-2">
                              <div className="flex gap-4 w-[200px] -ml-[50px] justify-between relative">
                                 <div className="absolute top-[-8px] left-[50px] right-[50px] h-px bg-[#28313C]" />
                                 <div className="flex flex-col items-center relative">
                                    <div className="w-px h-2 bg-[#28313C] absolute top-[-8px]" />
                                    <div className="flex flex-col items-center justify-center rounded border border-[#28313C] bg-[#0E1116] px-3 py-1.5 min-w-[90px] opacity-70">
                                       <span className="text-[10px] text-white">Operations</span>
                                       <span className="text-[9px] text-muted-foreground">28 members</span>
                                    </div>
                                 </div>
                                 <div className="flex flex-col items-center relative">
                                    <div className="w-px h-2 bg-[#28313C] absolute top-[-8px]" />
                                    <div className="flex flex-col items-center justify-center rounded border border-[#28313C] bg-[#0E1116] px-3 py-1.5 min-w-[90px] opacity-70">
                                       <span className="text-[10px] text-white">Product</span>
                                       <span className="text-[9px] text-muted-foreground">18 members</span>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                        {/* CTO */}
                        <div className="flex flex-col items-center relative">
                           <div className="w-px h-6 bg-[#28313C]" />
                           <div className="flex flex-col items-center justify-center rounded border border-[#28313C] bg-[#141A22] px-4 py-2 min-w-[100px] z-10">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">CTO</span>
                              <span className="text-[11px] font-bold text-white">Ken R.</span>
                           </div>
                           <div className="w-px h-6 bg-[#28313C]" />
                           <div className="flex flex-col items-center justify-center rounded border border-[#28313C] bg-[#0E1116] px-3 py-1.5 min-w-[90px] opacity-70">
                              <span className="text-[10px] text-white">Sales</span>
                              <span className="text-[9px] text-muted-foreground">22 members</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </SectionCard>

               {/* CONTEXT HEALTH */}
               <SectionCard title="Context Health">
                  <div className="grid grid-cols-2 p-5 gap-6">
                     <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                           <span className="text-[11px] text-muted-foreground flex items-center gap-2"><CheckCircle2 className="size-3 text-muted-foreground" /> Completeness</span>
                           <span className="text-[11px] font-bold text-emerald-400">82%</span>
                        </div>
                        <div className="flex items-center justify-between">
                           <span className="text-[11px] text-muted-foreground flex items-center gap-2"><Clock className="size-3 text-muted-foreground" /> Data freshness</span>
                           <span className="text-[11px] font-bold text-emerald-400">Good</span>
                        </div>
                        <div className="flex items-center justify-between">
                           <span className="text-[11px] text-muted-foreground flex items-center gap-2"><Calendar className="size-3 text-muted-foreground" /> Last full review</span>
                           <span className="text-[11px] font-medium text-white">May 8, 2026</span>
                        </div>
                     </div>
                     <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                           <span className="text-[11px] text-muted-foreground flex items-center gap-2"><AlertTriangle className="size-3 text-amber-400" /> Conflicts detected</span>
                           <span className="text-[11px] font-bold bg-amber-500/10 text-amber-400 px-1.5 rounded">2</span>
                        </div>
                        <div className="flex items-center justify-between">
                           <span className="text-[11px] text-muted-foreground flex items-center gap-2"><AlertTriangle className="size-3 text-amber-400" /> Outdated information</span>
                           <span className="text-[11px] font-bold bg-amber-500/10 text-amber-400 px-1.5 rounded">3</span>
                        </div>
                        <div className="flex items-center justify-between">
                           <span className="text-[11px] text-muted-foreground flex items-center gap-2"><AlertTriangle className="size-3 text-red-400" /> Unverified assumptions</span>
                           <span className="text-[11px] font-bold bg-red-500/10 text-red-400 px-1.5 rounded">1</span>
                        </div>
                     </div>
                  </div>
               </SectionCard>
            </div>

            {/* RIGHT COLUMN - 25% */}
            <div className="flex flex-col gap-5 min-w-0">
               {/* AI CONTEXT PREVIEW */}
               <SectionCard title="AI Context Preview" actionLabel="Open full view">
                  <div className="flex flex-col p-5 border-b border-[#28313C]">
                     <span className="text-[11px] font-bold text-white mb-3">What AI knows</span>
                     <div className="flex flex-col gap-2">
                        <div className="flex items-start gap-2">
                           <CheckCircle2 className="size-3 text-emerald-400 mt-0.5 shrink-0" />
                           <span className="text-[11px] text-muted-foreground leading-tight"><strong className="text-white font-medium">Primary objective:</strong> Reduce operational costs</span>
                        </div>
                        <div className="flex items-start gap-2">
                           <CheckCircle2 className="size-3 text-emerald-400 mt-0.5 shrink-0" />
                           <span className="text-[11px] text-muted-foreground leading-tight"><strong className="text-white font-medium">Target margin:</strong> 28%</span>
                        </div>
                        <div className="flex items-start gap-2">
                           <CheckCircle2 className="size-3 text-emerald-400 mt-0.5 shrink-0" />
                           <span className="text-[11px] text-muted-foreground leading-tight"><strong className="text-white font-medium">Main markets:</strong> USA, EU, UK</span>
                        </div>
                        <div className="flex items-start gap-2">
                           <CheckCircle2 className="size-3 text-emerald-400 mt-0.5 shrink-0" />
                           <span className="text-[11px] text-muted-foreground leading-tight"><strong className="text-white font-medium">Primary jurisdiction:</strong> Delaware, USA</span>
                        </div>
                        <div className="flex items-start gap-2">
                           <CheckCircle2 className="size-3 text-emerald-400 mt-0.5 shrink-0" />
                           <span className="text-[11px] text-muted-foreground leading-tight"><strong className="text-white font-medium">Approval threshold:</strong> $10,000 / $50,000</span>
                        </div>
                        <div className="flex items-start gap-2">
                           <CheckCircle2 className="size-3 text-emerald-400 mt-0.5 shrink-0" />
                           <span className="text-[11px] text-muted-foreground leading-tight"><strong className="text-white font-medium">Restricted data:</strong> Employee PII and salaries</span>
                        </div>
                        <div className="flex items-start gap-2">
                           <CheckCircle2 className="size-3 text-emerald-400 mt-0.5 shrink-0" />
                           <span className="text-[11px] text-muted-foreground leading-tight"><strong className="text-white font-medium">Trusted sources:</strong> 17 verified documents</span>
                        </div>
                     </div>
                  </div>
                  <div className="flex flex-col p-5">
                     <span className="text-[11px] font-bold text-white mb-3">Missing or incomplete</span>
                     <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <AlertTriangle className="size-3 text-amber-400 shrink-0" />
                              <span className="text-[11px] text-amber-400/90">Vendor risk policy</span>
                           </div>
                           <span className="text-[9px] text-muted-foreground">Not defined</span>
                        </div>
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <AlertTriangle className="size-3 text-amber-400 shrink-0" />
                              <span className="text-[11px] text-amber-400/90">Data retention policy</span>
                           </div>
                           <span className="text-[9px] text-muted-foreground">Not uploaded</span>
                        </div>
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <AlertTriangle className="size-3 text-amber-400 shrink-0" />
                              <span className="text-[11px] text-amber-400/90">Q2 Product targets</span>
                           </div>
                           <span className="text-[9px] text-muted-foreground">Not set</span>
                        </div>
                     </div>
                  </div>
               </SectionCard>

               {/* KNOWLEDGE BASE OVERVIEW */}
               <SectionCard title="Knowledge Base Overview" actionLabel="View all">
                  <div className="flex flex-col p-5 border-b border-[#28313C] gap-3">
                     <div className="flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-2"><BookOpen className="size-3.5 text-primary" /> Total documents</span>
                        <span className="text-[11px] font-bold text-white">142</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-2"><CheckCircle2 className="size-3.5 text-emerald-400" /> Verified sources</span>
                        <span className="text-[11px] font-bold text-emerald-400">89</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-2"><AlertTriangle className="size-3.5 text-amber-400" /> Outdated documents</span>
                        <span className="text-[11px] font-bold text-white">7</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-2"><Clock className="size-3.5 text-muted-foreground" /> Pending review</span>
                        <span className="text-[11px] font-bold text-white">9</span>
                     </div>
                  </div>
                  <div className="flex flex-col p-5">
                     <span className="text-[11px] font-bold text-white mb-4">Top categories</span>
                     <div className="flex items-center gap-6">
                        <div className="relative size-16 shrink-0">
                           <svg viewBox="0 0 36 36" className="size-full -rotate-90">
                              <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#28313C" strokeWidth="4"></circle>
                              <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#4EA1FF" strokeWidth="4" strokeDasharray="42 58" strokeDashoffset="0"></circle>
                              <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#7CC7FF" strokeWidth="4" strokeDasharray="25 75" strokeDashoffset="-42"></circle>
                              <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#34d399" strokeWidth="4" strokeDasharray="18 82" strokeDashoffset="-67"></circle>
                              <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#7CC7FF" strokeWidth="4" strokeDasharray="10 90" strokeDashoffset="-85"></circle>
                           </svg>
                        </div>
                        <div className="flex flex-col gap-1.5 flex-1">
                           <div className="flex items-center justify-between text-[10px]">
                              <span className="text-muted-foreground flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-[#4EA1FF]" /> Policies</span>
                              <span className="font-medium text-white">42%</span>
                           </div>
                           <div className="flex items-center justify-between text-[10px]">
                              <span className="text-muted-foreground flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-[#7CC7FF]" /> Contracts</span>
                              <span className="font-medium text-white">25%</span>
                           </div>
                           <div className="flex items-center justify-between text-[10px]">
                              <span className="text-muted-foreground flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-emerald-400" /> Financial</span>
                              <span className="font-medium text-white">18%</span>
                           </div>
                           <div className="flex items-center justify-between text-[10px]">
                              <span className="text-muted-foreground flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-violet-400" /> Operations</span>
                              <span className="font-medium text-white">10%</span>
                           </div>
                           <div className="flex items-center justify-between text-[10px]">
                              <span className="text-muted-foreground flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-zinc-500" /> Other</span>
                              <span className="font-medium text-white">5%</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </SectionCard>

               {/* RECENT CHANGES */}
               <SectionCard title="Recent Changes">
                  <div className="flex flex-col">
                     <div className="flex flex-col gap-1.5 p-4 border-b border-[#28313C]/50 last:border-0 hover:bg-white/[0.01]">
                        <span className="text-[11px] font-medium text-white">Updated OKR: Reduce operational costs</span>
                        <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                           <span>May 20, 11:42 AM</span>
                           <span className="flex items-center gap-1"><Users className="size-3" /> Sarah M.</span>
                        </div>
                     </div>
                     <div className="flex flex-col gap-1.5 p-4 border-b border-[#28313C]/50 last:border-0 hover:bg-white/[0.01]">
                        <span className="text-[11px] font-medium text-white">Added new policy: AI Data Usage Policy</span>
                        <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                           <span>May 19, 09:15 AM</span>
                           <span className="flex items-center gap-1"><Users className="size-3" /> Alex M.</span>
                        </div>
                     </div>
                     <div className="flex flex-col gap-1.5 p-4 border-b border-[#28313C]/50 last:border-0 hover:bg-white/[0.01]">
                        <span className="text-[11px] font-medium text-white">Changed approval limit: $10k &rarr; $12k</span>
                        <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                           <span>May 18, 04:32 PM</span>
                           <span className="flex items-center gap-1"><Users className="size-3" /> Sarah M.</span>
                        </div>
                     </div>
                     <div className="flex flex-col gap-1.5 p-4 border-b border-[#28313C]/50 last:border-0 hover:bg-white/[0.01]">
                        <span className="text-[11px] font-medium text-white">Uploaded document: Vendor Risk Policy v2</span>
                        <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                           <span>May 17, 01:08 PM</span>
                           <span className="flex items-center gap-1"><Users className="size-3" /> James B.</span>
                        </div>
                     </div>
                     <div className="flex flex-col gap-1.5 p-4 border-b border-[#28313C]/50 last:border-0 hover:bg-white/[0.01]">
                        <span className="text-[11px] font-medium text-white">Updated org chart</span>
                        <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                           <span>May 16, 10:21 AM</span>
                           <span className="flex items-center gap-1"><Users className="size-3" /> Alex M.</span>
                        </div>
                     </div>
                  </div>
               </SectionCard>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
