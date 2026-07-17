"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  BriefcaseBusiness,
  Building2,
  Camera,
  CheckCircle2,
  Clock3,
  Database,
  Eye,
  EyeOff,
  FileText,
  GitBranch,
  Globe2,
  LockKeyhole,
  Network,
  Plus,
  RefreshCw,
  ShieldCheck,
  Target,
  Users,
  WalletCards,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useWorkspace } from "../workspace-context";

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function compactNumber(value) {
  const number = Number(value || 0);
  if (!Number.isFinite(number)) return "0";
  return new Intl.NumberFormat("en", { notation: number >= 10000 ? "compact" : "standard" }).format(number);
}

function money(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount === 0) return "$0";
  if (Math.abs(amount) >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1_000) return `$${Math.round(amount / 1_000)}K`;
  return `$${Math.round(amount).toLocaleString()}`;
}

function pct(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(100, Math.round(number))) : fallback;
}

function companyInitials(name) {
  const clean = String(name || "GENIUS Workspace").trim();
  const words = clean.split(/\s+/).filter(Boolean);
  return (words.length > 1 ? `${words[0][0]}${words[1][0]}` : clean.slice(0, 2)).toUpperCase();
}

function recentDate(value) {
  if (!value) return "Not reviewed yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not reviewed yet";
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function cardVariants(index = 0) {
  return {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.45, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] } },
  };
}

function IntelligenceCard({ children, className, index = 0 }) {
  return (
    <motion.section
      variants={cardVariants(index)}
      initial="initial"
      animate="animate"
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[#4EA1FF]/18 bg-[linear-gradient(180deg,rgba(8,17,29,0.96),rgba(5,10,18,0.96))] shadow-[0_0_0_1px_rgba(78,161,255,0.04),0_18px_50px_rgba(0,0,0,0.3)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#7CC7FF]/45 to-transparent" />
      {children}
    </motion.section>
  );
}

function SectionHeader({ title, action, onAction, icon: Icon }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#28313C] px-5 py-4">
      <div className="flex min-w-0 items-center gap-2.5">
        {Icon && (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
        )}
        <h2 className="truncate text-sm font-bold text-white">{title}</h2>
      </div>
      {action && (
        <button
          type="button"
          onClick={onAction}
          className="shrink-0 rounded-lg border border-[#28313C] bg-[#0E1116] px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:border-primary/40 hover:bg-primary/10"
        >
          {action}
        </button>
      )}
    </div>
  );
}

function StatStrip({ stats = [] }) {
  return (
    <div className="grid gap-px overflow-hidden rounded-2xl border border-[#4EA1FF]/22 bg-[#28313C] shadow-[0_0_44px_rgba(78,161,255,0.07)] sm:grid-cols-2 xl:grid-cols-5">
      {stats.map((stat) => (
        <button
          key={stat.label}
          type="button"
          onClick={stat.onClick}
          className="flex min-h-[76px] items-center gap-3 bg-[linear-gradient(180deg,#141A22,#0E1116)] px-4 py-3 text-left transition-colors hover:bg-[#111A2A]"
        >
          <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl border", stat.tone)}>
            <stat.icon className="size-4" />
          </span>
          <span className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{stat.label}</span>
            <span className="mt-1 block truncate text-sm font-bold text-white">{stat.value}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

function ProgressLine({ title, owner, value, target, tone = "primary" }) {
  const current = pct(value);
  const targetValue = pct(target, 100);
  return (
    <div className="grid gap-3 border-b border-[#28313C] px-5 py-4 last:border-0 md:grid-cols-[1.2fr_0.8fr_170px] md:items-center">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">{owner}</p>
      </div>
      <div className="text-[11px] font-medium text-muted-foreground">{current}% to {targetValue}%</div>
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[rgba(78,161,255,0.10)]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${current}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={cn("h-full rounded-full", tone === "warning" ? "bg-warning" : "bg-primary")}
          />
        </div>
        <span className={cn(
          "rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest",
          tone === "warning" ? "border-warning/30 bg-warning/10 text-warning" : "border-primary/30 bg-primary/10 text-primary",
        )}>
          {tone === "warning" ? "At risk" : "On track"}
        </span>
      </div>
    </div>
  );
}

function MiniOrg({ members = [] }) {
  const leadership = members.slice(0, 4);
  const fallback = [
    { id: "ceo", displayName: "Workspace Owner", role: "Owner" },
    { id: "ops", displayName: "Operations", role: "Admin" },
    { id: "finance", displayName: "Finance", role: "Member" },
    { id: "growth", displayName: "Growth", role: "Member" },
  ];
  const people = [...leadership, ...fallback].slice(0, 4);

  return (
    <div className="px-5 py-5">
      <div className="mx-auto flex w-full max-w-[620px] flex-col items-center gap-5">
        <div className="rounded-xl border border-primary/30 bg-primary/10 px-5 py-3 text-center">
          <div className="text-xs font-bold text-white">{people[0]?.displayName || people[0]?.emailMasked || "Owner"}</div>
          <div className="mt-1 text-[10px] uppercase tracking-widest text-primary">{people[0]?.role || "Owner"}</div>
        </div>
        <div className="h-6 w-px bg-[#28313C]" />
        <div className="grid w-full gap-3 sm:grid-cols-3">
          {people.slice(1, 4).map((member, index) => (
            <div key={member.id || member.emailMasked || index} className="rounded-xl border border-[#28313C] bg-[#0E1116] px-4 py-3 text-center">
              <div className="truncate text-xs font-bold text-white">{member.displayName || member.emailMasked || `Member ${index + 1}`}</div>
              <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{member.role || "Member"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CompanyIntelligence({ onNavigate }) {
  const { workspace, session, backend, members, evidence, actions, findings, reports, connectors, diagnostics, preferences, saveWorkspacePreferences } = useWorkspace();
  const workspaceId = workspace?.id || "default";
  const fileInputRef = useRef(null);
  const [companyPhoto, setCompanyPhoto] = useState(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(`genius-company-photo:${workspaceId}`) || window.localStorage.getItem("genius-company-photo:default");
  });
  const [privacyDraft, setPrivacyDraft] = useState(null);
  const [companyNotice, setCompanyNotice] = useState("");
  const companyPrefs = preferences?.company || {};
  const companyPrivacy = privacyDraft || companyPrefs.visibility || "private";

  const saveCompanyPreferences = async (patch = {}) => {
    const nextCompany = {
      ...companyPrefs,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    await saveWorkspacePreferences({ company: nextCompany });
  };

  const handleCompanyPhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setCompanyNotice("Use a PNG or JPG image for the company photo.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setCompanyNotice("Company photo must be under 2MB for local demo storage.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result || "");
      setCompanyPhoto(dataUrl);
      try {
        window.localStorage.setItem(`genius-company-photo:${workspaceId}`, dataUrl);
        window.localStorage.setItem("genius-company-photo:default", dataUrl);
        await saveCompanyPreferences({ photoName: file.name, photoUpdatedAt: new Date().toISOString() });
        setCompanyNotice("Company photo saved for this workspace session.");
      } catch {
        setCompanyNotice("Photo preview is active, but persistent storage is not available.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePrivacyChange = async (visibility) => {
    setPrivacyDraft(visibility);
    try {
      await saveCompanyPreferences({ visibility });
      setCompanyNotice(visibility === "private" ? "Company context is private to this workspace." : "Company context can be used in shared reports.");
    } catch {
      setCompanyNotice("Privacy preference could not be saved.");
    }
  };

  const model = useMemo(() => {
    const workspaceName = workspace?.workspaceName || workspace?.name || "GENIUS Workspace";
    const evidenceCount = safeArray(evidence).length;
    const actionItems = safeArray(actions);
    const findingItems = safeArray(findings);
    const reportItems = safeArray(reports);
    const memberItems = safeArray(members);
    const connectorItems = safeArray(connectors);
    const connectedSources = connectorItems.filter((connector) => /active|connected|healthy/i.test(connector.status || "")).length || connectorItems.length;
    const dataQuality = pct(diagnostics?.dataQualityScore || diagnostics?.overallScore, evidenceCount ? 72 : 38);
    const completion = Math.min(96, Math.max(42, Math.round((dataQuality * 0.45) + Math.min(30, evidenceCount * 4) + Math.min(16, memberItems.length * 2) + Math.min(8, connectedSources * 2))));
    const highRisk = findingItems.filter((finding) => /critical|high/i.test(finding.severity || finding.risk || "")).length;
    const pendingActions = actionItems.filter((action) => !/approved|done|resolved|completed/i.test(action.status || action.state || "")).length;
    const totalImpact = findingItems.reduce((sum, finding) => sum + Math.abs(Number(finding.impact || finding.amount || 0) || 0), 0);

    return {
      workspaceName,
      initials: companyInitials(workspaceName),
      companySize: workspace?.companySize || "51 - 200 employees",
      businessType: workspace?.businessType || "B2B SaaS Operations",
      role: session?.role || workspace?.role || "Owner",
      position: session?.position || workspace?.position || preferences?.profile?.role || "Product Owner",
      department: session?.department || workspace?.department || "Executive",
      storage: backend?.storage === "supabase" ? "Supabase" : backend?.storage === "local" ? "Local workspace" : "Workspace store",
      provider: backend?.aiProvider || "Gemini",
      evidenceCount,
      actionCount: actionItems.length,
      pendingActions,
      reportCount: reportItems.length,
      memberCount: memberItems.length,
      connectorCount: connectedSources,
      highRisk,
      dataQuality,
      completion,
      totalImpact,
      lastReviewed: recentDate(workspace?.updatedAt),
    };
  }, [actions, backend, connectors, diagnostics, evidence, findings, members, preferences, reports, session, workspace]);

  const stats = [
    { label: "Context completeness", value: `${model.completion}%`, icon: ShieldCheck, tone: "border-primary/25 bg-primary/10 text-primary", onClick: () => onNavigate?.("data") },
    { label: "Last reviewed", value: model.lastReviewed, icon: Clock3, tone: "border-[#7CC7FF]/25 bg-[#7CC7FF]/10 text-[#7CC7FF]", onClick: () => onNavigate?.("diagnostics") },
    { label: "Data sources", value: `${compactNumber(model.connectorCount)} connected`, icon: Database, tone: "border-primary/25 bg-primary/10 text-primary", onClick: () => onNavigate?.("connectors") },
    { label: "Context conflicts", value: compactNumber(model.highRisk), icon: AlertTriangle, tone: "border-warning/30 bg-warning/10 text-warning", onClick: () => onNavigate?.("savings") },
    { label: "Agents using", value: "7 active", icon: Brain, tone: "border-[#7CC7FF]/25 bg-[#7CC7FF]/10 text-[#7CC7FF]", onClick: () => onNavigate?.("ai-gateway") },
  ];

  const okrs = [
    { title: "Reduce operational costs by 15%", owner: "Finance and Operations", value: model.totalImpact ? 68 : 42, target: 85 },
    { title: "Improve evidence completeness to 90%", owner: "Data governance", value: model.completion, target: 90 },
    { title: "Cut approval cycle time by 30%", owner: "CEO AI Gateway", value: model.pendingActions ? 54 : 82, target: 88, tone: model.pendingActions > 4 ? "warning" : "primary" },
    { title: "Expand connected business systems", owner: "Systems and integrations", value: Math.min(88, 25 + model.connectorCount * 9), target: 80 },
  ];

  const evidenceRules = [
    "AI agents must use verified documents as source of truth.",
    "Draft or local files cannot be primary evidence until reviewed.",
    "Financial recommendations require at least two independent sources.",
    "Every approval action must be traceable to evidence and audit history.",
    "Guest workspaces can export local state, but production data requires Supabase policies.",
  ];

  const healthRows = [
    { label: "Completeness", value: `${model.completion}%`, tone: "primary" },
    { label: "Data freshness", value: model.lastReviewed, tone: "primary" },
    { label: "Conflicts detected", value: model.highRisk, tone: model.highRisk ? "warning" : "primary" },
    { label: "Open approvals", value: model.pendingActions, tone: model.pendingActions ? "warning" : "primary" },
    { label: "Verified evidence", value: model.evidenceCount, tone: "primary" },
  ];

  return (
    <div className="flex min-h-full w-full flex-col gap-5 bg-[radial-gradient(circle_at_50%_-10%,rgba(78,161,255,0.13),transparent_34%),linear-gradient(180deg,#080A0E,#080A0E_42%,#080A0E)] p-4 text-white sm:p-5 xl:p-6">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="flex flex-col gap-4 rounded-2xl border border-[#4EA1FF]/20 bg-[linear-gradient(180deg,rgba(8,17,29,0.9),rgba(5,10,18,0.9))] p-5 shadow-[0_0_0_1px_rgba(78,161,255,0.04),0_20px_70px_rgba(0,0,0,0.32)] min-[1420px]:flex-row min-[1420px]:items-center min-[1420px]:justify-between"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
            <span>Workspace</span>
            <ArrowRight className="size-3" />
            <span className="text-white">Company Intelligence</span>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Company Intelligence</h1>
                <span className="rounded-lg border border-primary/25 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">Context healthy</span>
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Central source of business truth for AI analysis, recommendations, approvals, reports, CRM work, and workspace automation.
              </p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate?.("settings")}
          className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-[0_12px_32px_rgba(78,161,255,0.28)] transition-colors hover:bg-primary/90"
        >
          <RefreshCw className="size-4" /> Review company context
        </button>
      </motion.header>

      <StatStrip stats={stats} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <IntelligenceCard className="xl:col-span-4" index={1}>
          <SectionHeader title="Company Identity" icon={Building2} action="Edit" onAction={() => onNavigate?.("settings")} />
          <div className="p-5">
            <div className="relative overflow-hidden rounded-2xl border border-[#4EA1FF]/25 bg-[#0E1116] shadow-[0_0_42px_rgba(78,161,255,0.08)]">
              <div className="relative h-40 overflow-hidden bg-[radial-gradient(circle_at_50%_10%,rgba(78,161,255,0.25),transparent_44%),linear-gradient(135deg,#141A22,#0E1116)]">
                {companyPhoto ? (
                  <div className="h-full w-full bg-cover bg-center opacity-90" style={{ backgroundImage: `url("${companyPhoto}")` }} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="flex size-20 items-center justify-center rounded-3xl border border-[#4EA1FF]/30 bg-[#4EA1FF]/10 text-2xl font-black text-primary shadow-[0_0_45px_rgba(78,161,255,0.22)]">
                      {model.initials}
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E1116] via-[#0E1116]/18 to-transparent" />
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleCompanyPhotoChange} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg border border-[#4EA1FF]/30 bg-[#0E1116]/82 px-3 py-2 text-[11px] font-bold text-white shadow-[0_0_28px_rgba(78,161,255,0.16)] backdrop-blur transition-colors hover:bg-[#4EA1FF]/20"
                >
                  <Camera className="size-3.5" /> Change photo
                </button>
              </div>
              <div className="relative p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-xl font-bold text-white">{model.workspaceName}</h2>
                  <span className="flex items-center gap-1 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    <CheckCircle2 className="size-3" /> Verified
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{model.businessType}</p>

                <div className="mt-5 rounded-xl border border-[#28313C] bg-[#0E1116] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Company context visibility</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {companyPrivacy === "private" ? "Private to this workspace and internal AI context." : "Allowed in shared reports and external demo exports."}
                      </p>
                    </div>
                    <div className="flex shrink-0 rounded-lg border border-[#28313C] bg-[#0E1116] p-1">
                      {[
                        { id: "private", label: "Private", icon: EyeOff },
                        { id: "shared", label: "Shared", icon: Eye },
                      ].map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handlePrivacyChange(option.id)}
                          className={cn(
                            "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[10px] font-bold transition-colors",
                            companyPrivacy === option.id ? "bg-primary text-white shadow-[0_0_18px_rgba(78,161,255,0.25)]" : "text-muted-foreground hover:text-white",
                          )}
                        >
                          <option.icon className="size-3.5" /> {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {companyNotice && (
                    <p className="mt-3 rounded-lg border border-[#4EA1FF]/20 bg-[#4EA1FF]/8 px-3 py-2 text-[10px] font-medium text-[#7CC7FF]">{companyNotice}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ["Company size", model.companySize],
                ["Primary role", model.role],
                ["Your position", model.position],
                ["Department", model.department],
                ["AI provider", model.provider],
                ["Storage", model.storage],
              ].map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
                  <p className="mt-1 truncate text-sm font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </IntelligenceCard>

        <IntelligenceCard className="xl:col-span-5" index={2}>
          <SectionHeader title="Strategic Objectives" icon={Target} action="Add Objective" onAction={() => onNavigate?.("approvals")} />
          <div>
            {okrs.map((okr) => (
              <ProgressLine key={okr.title} {...okr} />
            ))}
          </div>
          <button type="button" onClick={() => onNavigate?.("reports")} className="flex w-full items-center justify-center gap-2 border-t border-[#28313C] px-5 py-3 text-xs font-semibold text-muted-foreground transition-colors hover:text-white">
            View all objectives <ArrowRight className="size-3.5" />
          </button>
        </IntelligenceCard>

        <IntelligenceCard className="xl:col-span-3" index={3}>
          <SectionHeader title="AI Context Preview" icon={Brain} action="Open full view" onAction={() => onNavigate?.("chat")} />
          <div className="divide-y divide-[#28313C]">
            <div className="p-5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-white">What AI knows</p>
              <div className="mt-4 flex flex-col gap-3">
                {[
                  `Main objective: reduce operational waste and risk.`,
                  `Workspace size: ${model.companySize}.`,
                  `Evidence records: ${model.evidenceCount}.`,
                  `Open approvals: ${model.pendingActions}.`,
                  `Trusted storage: ${model.storage}.`,
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-[12px] text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-white">Missing or incomplete</p>
              <div className="mt-4 flex flex-col gap-2.5">
                {[
                  "Vendor risk policy",
                  "Data retention policy",
                  "Q3 departmental targets",
                ].map((item, index) => (
                  <div key={item} className="flex items-center justify-between gap-3 rounded-lg border border-warning/20 bg-warning/5 px-3 py-2 text-[12px]">
                    <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                      <AlertTriangle className="size-3.5 shrink-0 text-warning" /> <span className="truncate">{item}</span>
                    </span>
                    <span className="rounded bg-[rgba(78,161,255,0.10)] px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{index === 0 ? "Not defined" : index === 1 ? "Not uploaded" : "Not set"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </IntelligenceCard>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <IntelligenceCard className="xl:col-span-4" index={4}>
          <SectionHeader title="Financial Baselines and Guardrails" icon={WalletCards} action="Edit" onAction={() => onNavigate?.("settings")} />
          <div className="grid gap-px bg-[#28313C] sm:grid-cols-2">
            {[
              ["Estimated risk impact", money(model.totalImpact)],
              ["Approval items", compactNumber(model.actionCount)],
              ["Pending approvals", compactNumber(model.pendingActions)],
              ["Target gross margin", "28%"],
              ["Budget variance threshold", "10%"],
              ["Purchase approval limit", "$10,000"],
            ].map(([label, value]) => (
              <div key={label} className="bg-[#091525] px-5 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
                <p className="mt-1 text-sm font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
        </IntelligenceCard>

        <IntelligenceCard className="xl:col-span-5" index={5}>
          <SectionHeader title="Organization and Approvals" icon={Users} action="View org chart" onAction={() => onNavigate?.("settings")} />
          <MiniOrg members={members} />
        </IntelligenceCard>

        <IntelligenceCard className="xl:col-span-3" index={6}>
          <SectionHeader title="Knowledge Base Overview" icon={FileText} action="View all" onAction={() => onNavigate?.("data")} />
          <div className="p-5">
            <div className="grid gap-3">
              {[
                ["Total documents", model.evidenceCount],
                ["Verified sources", Math.max(0, Math.round(model.evidenceCount * 0.72))],
                ["Reports generated", model.reportCount],
                ["Pending review", model.pendingActions],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-bold text-white">{compactNumber(value)}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-[108px_1fr] items-center gap-4">
              <div
                className="size-[108px] rounded-full"
                style={{ background: "conic-gradient(#7CC7FF 0 42%, #4EA1FF 42% 67%, #22C55E 67% 85%, #778493 85% 100%)" }}
              >
                <div className="m-[18px] flex size-[72px] items-center justify-center rounded-full bg-[#0E1116] text-sm font-bold text-white">{model.dataQuality}%</div>
              </div>
              <div className="flex flex-col gap-2 text-[12px]">
                {[
                  ["Policies", "42%", "#7CC7FF"],
                  ["Contracts", "25%", "#4EA1FF"],
                  ["Financial", "18%", "#22C55E"],
                  ["Other", "15%", "#778493"],
                ].map(([label, value, color]) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-muted-foreground"><span className="size-2 rounded-full" style={{ backgroundColor: color }} /> {label}</span>
                    <span className="font-bold text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </IntelligenceCard>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <IntelligenceCard className="xl:col-span-4" index={7}>
          <SectionHeader title="Evidence Rules" icon={LockKeyhole} action="Edit rules" onAction={() => onNavigate?.("settings")} />
          <div className="divide-y divide-[#28313C]">
            {evidenceRules.map((rule) => (
              <div key={rule} className="flex items-start gap-3 px-5 py-3 text-[12px] text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </IntelligenceCard>

        <IntelligenceCard className="xl:col-span-3" index={8}>
          <SectionHeader title="Context Health" icon={Network} />
          <div className="divide-y divide-[#28313C]">
            {healthRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3 px-5 py-3 text-[12px]">
                <span className="text-muted-foreground">{row.label}</span>
                <span className={cn(
                  "rounded border px-2 py-0.5 text-[10px] font-bold",
                  row.tone === "warning" ? "border-warning/30 bg-warning/10 text-warning" : "border-primary/30 bg-primary/10 text-primary",
                )}>{row.value}</span>
              </div>
            ))}
          </div>
        </IntelligenceCard>

        <IntelligenceCard className="xl:col-span-5" index={9}>
          <SectionHeader title="Recent Changes" icon={GitBranch} action="Open audit trail" onAction={() => onNavigate?.("settings")} />
          <div className="divide-y divide-[#28313C]">
            {[
              ["Updated workspace context", model.lastReviewed, model.position],
              [`Added ${model.evidenceCount} evidence records`, "Current workspace", "Data Intake"],
              [`Generated ${model.reportCount} reports`, "Reports", "Report Builder"],
              [`Queued ${model.pendingActions} approvals`, "Approval Matrix", "CEO AI Gateway"],
              [`Connected ${model.connectorCount} sources`, model.storage, "Connectors"],
            ].map(([title, date, owner]) => (
              <div key={title} className="grid gap-2 px-5 py-3 text-[12px] sm:grid-cols-[1fr_150px_140px] sm:items-center">
                <span className="font-medium text-white">{title}</span>
                <span className="text-muted-foreground">{date}</span>
                <span className="flex items-center gap-2 text-muted-foreground"><Users className="size-3.5" /> {owner}</span>
              </div>
            ))}
          </div>
        </IntelligenceCard>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {[
          { icon: BriefcaseBusiness, title: "Business operating model", value: model.businessType, action: "Review workspace profile", target: "settings" },
          { icon: Globe2, title: "Markets and compliance", value: "US-first, GDPR-ready, SOC2-ready controls", action: "Open security settings", target: "settings" },
          { icon: Plus, title: "Next context upgrade", value: "Upload policy docs, owner matrix, and department targets.", action: "Upload evidence", target: "data" },
        ].map((item, index) => (
          <IntelligenceCard key={item.title} index={10 + index}>
            <button type="button" onClick={() => onNavigate?.(item.target)} className="flex h-full w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-white/[0.02]">
              <span className="flex min-w-0 items-center gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                  <item.icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-white">{item.title}</span>
                  <span className="mt-1 block truncate text-[12px] text-muted-foreground">{item.value}</span>
                </span>
              </span>
              <span className="hidden shrink-0 items-center gap-2 text-[11px] font-semibold text-primary sm:flex">
                {item.action} <ArrowRight className="size-3.5" />
              </span>
            </button>
          </IntelligenceCard>
        ))}
      </div>
    </div>
  );
}
