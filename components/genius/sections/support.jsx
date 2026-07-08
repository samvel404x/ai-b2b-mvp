"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle, ArrowDown, ArrowDownRight, ArrowRight, ArrowUpRight, BookOpen,
  Calendar, Check, CheckCircle2, ChevronDown, ChevronRight, Clock, Cloud, Code2,
  Cpu, Database, Download, ExternalLink, FileSpreadsheet, FileText, GitBranch,
  Globe, HelpCircle, History, LayoutDashboard, Link as LinkIcon, Mail, MessageSquare,
  MoreHorizontal, Network, Pause, PiggyBank, Plus, RefreshCw, RotateCcw, Search,
  Server, Settings, Share2, Shield, ShieldAlert, Sparkles, Star, Target, Upload,
  UploadCloud, User, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Ring } from "../shared";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// --- Mock Data ---

const supportKpis = [
  { id: "status", label: "SYSTEM STATUS", value: "All systems operational", sub: "100% uptime", tone: "primary", ring: 100, icon: Check },
  { id: "ai", label: "AI PROVIDER STATUS", value: "Gemini 1.5 Pro", sub: "Healthy", tone: "info", ring: 98, ringText: "98%" },
  { id: "data", label: "DATA PIPELINE HEALTH", value: "All pipelines running", sub: "No delays", tone: "primary", ring: 96, ringText: "96%" },
  { id: "response", label: "AVG RESPONSE TIME", value: "Live support", sub: "5m vs last 7 days", trend: "down", tone: "primary", ring: 18, ringText: "18m" },
  { id: "tickets", label: "OPEN SUPPORT TICKETS", value: "2 urgent", valueTone: "text-[#f59e0b]", sub: "1 pending", subTone: "text-[#fbbf24]", tone: "warning", ring: 20, ringText: "3" },
  { id: "docs", label: "DOCS COVERAGE", value: "Help docs coverage", sub: "4% vs last 7 days", trend: "up", tone: "primary", ring: 92, ringText: "92%" },
];

const categories = [
  { icon: PlayCircleIcon, title: "Getting Started", count: 12 },
  { icon: CloudUploadIcon, title: "Data Uploads", count: 18 },
  { icon: Network, title: "Evidence Graph", count: 14 },
  { icon: ActivityIcon, title: "Diagnostics", count: 16 },
  { icon: Cpu, title: "Agents", count: 17 },
  { icon: Shield, title: "Approvals", count: 12 },
  { icon: PlugIcon, title: "Connectors", count: 15 },
  { icon: LockIcon, title: "Security & Compliance", count: 11 },
  { icon: FileText, title: "Reports", count: 10 },
  { icon: CreditCardIcon, title: "Billing & Future Plans", count: 8 },
];

function PlayCircleIcon(props) { return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>; }
function CloudUploadIcon(props) { return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>; }
function ActivityIcon(props) { return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>; }
function PlugIcon(props) { return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/></svg>; }
function LockIcon(props) { return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>; }
function CreditCardIcon(props) { return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>; }

const pipelineSteps = [
  { id: 1, title: "Upload Evidence", desc: "Files, URLs, screenshots, connectors", color: "bg-primary text-white" },
  { id: 2, title: "Extract Facts", desc: "AI reads and extracts facts & metadata", color: "bg-[#38BDF8] text-white" },
  { id: 3, title: "Diagnostics", desc: "Identify risks, anomalies, and opportunities", color: "bg-primary text-white" },
  { id: 4, title: "Agent Draft", desc: "AI agents propose actions with rationale", color: "bg-[#a855f7] text-white" },
  { id: 5, title: "Human Approval", desc: "You review, edit, or approve actions", color: "bg-[#f59e0b] text-white" },
  { id: 6, title: "Board Report", desc: "Clear reports with proof trails", color: "bg-[#3b82f6] text-white" },
];

const categoryData = {
  "Getting Started": {
    title: "How GENIUS turns evidence into decisions",
    desc: "GENIUS transforms messy business data into clear, evidence-backed actions. Every step is auditable, transparent, and requires human approval before execution.",
    faqs: [
      { q: "Which AI provider does GENIUS use?", a: "GENIUS is powered by Google Gemini 1.5 Pro. We route requests through secure endpoints with enterprise safeguards. Fallbacks are available to maintain uptime." },
      { q: "Why is GENIUS approval-first?", a: "GENIUS believes in human-in-the-loop validation for critical business actions to ensure accuracy and compliance." },
      { q: "What data can I upload or connect?", a: "You can upload PDFs, spreadsheets, connect direct database integrations, or use our pre-built CRM/ERP connectors." },
      { q: "How does the Evidence Graph work?", a: "The Evidence Graph links every output back to its source document, cell, or API payload, creating an unbroken chain of custody." },
      { q: "What does GENIUS not do (MVP limits)?", a: "Currently, GENIUS does not execute direct bank transfers or legally binding contract signatures without third-party authorization integrations." },
      { q: "How long is my data stored?", a: "Data is stored according to your workspace retention policies, typically 7 years for compliance-related evidence." },
    ],
    troubleshooting: [
      { issue: "Can't find a file I uploaded", remedy: "Check file status, filters, and indexing." },
      { issue: "Approval won't submit", remedy: "Verify required fields and permissions." },
      { issue: "Connector not syncing", remedy: "Review connector health and logs." },
      { issue: "Report not generating", remedy: "Ensure data coverage and approvals." },
    ]
  },
  "Data Uploads": {
    title: "Managing Data Uploads & Processing",
    desc: "Learn how to securely upload files, connect cloud storage, and monitor the AI indexing pipeline.",
    faqs: [
      { q: "What file formats are supported?", a: "We support PDF, DOCX, XLSX, CSV, TXT, PNG, and JPG. Max file size is 200MB by default." },
      { q: "How long does indexing take?", a: "Most files under 10MB are indexed within 30 seconds. Large reports or messy spreadsheets may take up to 2 minutes." },
      { q: "Can I delete an upload?", a: "Yes, workspace admins can delete uploads. The evidence graph will automatically unlink the document." }
    ],
    troubleshooting: [
      { issue: "Upload stuck at 99%", remedy: "The AI extraction pipeline is finalizing. If it takes >5m, retry." },
      { issue: "File format not supported", remedy: "Convert proprietary formats to standard PDF or CSV before uploading." }
    ]
  },
  "Evidence Graph": {
    title: "Understanding the Evidence Graph",
    desc: "Every claim, diagnostic, and agent action is mapped to source data. Learn how to navigate the graph.",
    faqs: [
      { q: "What is an evidence trail?", a: "An evidence trail is a cryptographic link between an AI assertion and the exact cell, page, or API payload it came from." },
      { q: "Can I export the graph?", a: "Yes, you can export the evidence graph as a JSON bundle for external auditing." }
    ],
    troubleshooting: [
      { issue: "Broken source link", remedy: "The original file may have been deleted or permissions changed." },
      { issue: "Graph not rendering", remedy: "Clear your browser cache or check if you have more than 10,000 nodes." }
    ]
  },
  "Diagnostics": {
    title: "Running Business Diagnostics",
    desc: "Identify spend leakage, compliance risks, and operational anomalies automatically.",
    faqs: [
      { q: "How often do diagnostics run?", a: "They run continuously on new data, and perform a full batch scan weekly." },
      { q: "What is spend leakage?", a: "Spend leakage refers to maverick purchasing, pricing drift, or duplicated invoices that cost your business money." }
    ],
    troubleshooting: [
      { issue: "High false positives", remedy: "Adjust your diagnostic thresholds in Settings > Feature Modes." },
      { issue: "Diagnostic stuck on 'Running'", remedy: "A large dataset is being processed. Check the System Status page." }
    ]
  },
  "Agents": {
    title: "Configuring Autonomous Agents",
    desc: "Set up and manage AI agents that draft actions, write reports, and monitor systems.",
    faqs: [
      { q: "Do agents execute actions on their own?", a: "No, in GENIUS all agents are 'Approval-first'. They only draft actions." },
      { q: "How do I create a custom agent?", a: "Go to Command Center > New Agent. You can define instructions and connect it to specific data sources." }
    ],
    troubleshooting: [
      { issue: "Agent hallucinated a fact", remedy: "Check the Evidence Graph. If the source data is wrong, the agent will be wrong." },
      { issue: "Agent not triggering", remedy: "Verify the agent's scheduled interval or webhook payload." }
    ]
  },
  "Approvals": {
    title: "Managing Human Approvals",
    desc: "Reviewing agent drafts, setting up multi-step approval chains, and delegating authority.",
    faqs: [
      { q: "Can I set up multi-level approvals?", a: "Yes, you can require both a Manager and a VP to approve actions over $10,000." },
      { q: "Can I approve via mobile?", a: "Yes, you can use our native mobile app or approve directly from email notifications." }
    ],
    troubleshooting: [
      { issue: "Didn't receive approval email", remedy: "Check your spam folder and verify your Notification settings." },
      { issue: "Cannot approve request", remedy: "You may not have the required role (e.g. Finance Admin) for this specific action." }
    ]
  },
  "Connectors": {
    title: "Connecting External Systems",
    desc: "Link GENIUS to your CRM, ERP, and databases for real-time bidirectional syncing.",
    faqs: [
      { q: "Which ERPs are supported?", a: "We currently support SAP, NetSuite, and Microsoft Dynamics 365." },
      { q: "Is the connection real-time?", a: "Most connectors use webhooks for real-time updates. Databases use periodic polling (default 15m)." }
    ],
    troubleshooting: [
      { issue: "Connector auth failed", remedy: "Your API key may have expired or lacks necessary scopes." },
      { issue: "Missing data from sync", remedy: "Check if the missing records were created before your 'Sync From' date." }
    ]
  },
  "Security & Compliance": {
    title: "Security, Privacy & Audits",
    desc: "Manage data retention, PII masking, and access your SOC2 / HIPAA compliance reports.",
    faqs: [
      { q: "Where is my data stored?", a: "All data is encrypted at rest and stored in isolated VPCs in US-East-1 (or EU-Central-1 for enterprise)." },
      { q: "Do you train models on my data?", a: "No. Your data is strictly processed for your workspace and is NEVER used to train foundational public models." }
    ],
    troubleshooting: [
      { issue: "Cannot export Audit Log", remedy: "You must have the 'Owner' or 'Compliance Officer' role." },
      { issue: "SSO Login failing", remedy: "Verify your SAML certificate is up to date in the Auth & Login settings." }
    ]
  },
  "Reports": {
    title: "Generating Board Reports",
    desc: "Create beautiful, evidence-backed reports for executives and board members.",
    faqs: [
      { q: "Can I schedule reports?", a: "Yes, reports can be scheduled weekly, monthly, or quarterly." },
      { q: "Can I export to PowerPoint?", a: "We currently support PDF and web links. PowerPoint export is coming in Q3." }
    ],
    troubleshooting: [
      { issue: "Report is missing data", remedy: "Ensure the underlying diagnostics have finished running for the reporting period." },
      { issue: "Formatting looks broken", remedy: "Try reducing the amount of data in a single chart or use a table layout." }
    ]
  },
  "Billing & Future Plans": {
    title: "Billing & Subscriptions",
    desc: "Manage your payment methods, view invoices, and upgrade your workspace plan.",
    faqs: [
      { q: "How are tokens calculated?", a: "Tokens represent AI compute. 1 document page is roughly 500 tokens. Your plan includes 1M tokens/mo." },
      { q: "Can I pay by invoice?", a: "Yes, annual Enterprise plans can be paid via ACH or wire transfer." }
    ],
    troubleshooting: [
      { issue: "Card declined", remedy: "Check with your bank or try adding a new payment method." },
      { issue: "Workspace locked", remedy: "You may have exceeded your token limit. Please upgrade or purchase an add-on." }
    ]
  }
};

const timeline = [
  { time: "Jun 26, 10:12 AM", status: "All systems operational", desc: "All services running normally." },
  { time: "Jun 26, 9:47 AM", status: "Connector sync delay resolved", desc: "Short delay with Google Sheets connector." },
  { time: "Jun 26, 7:15 AM", status: "Maintenance completed", desc: "Scheduled maintenance completed successfully." },
  { time: "Jun 25, 11:32 PM", status: "Incident resolved", desc: "Invoices extraction issue resolved." },
];

function KpiCard({ kpi }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#1E2730] bg-[#0A0C0B] p-4 flex-1 min-w-[190px] transition-colors hover:bg-[#141B21] hover:border-white/10 group">
      <div className="relative shrink-0 flex items-center justify-center">
        <Ring value={kpi.ring} size={42} stroke={kpi.tone === "info" ? "#38BDF8" : kpi.tone === "warning" ? "#f59e0b" : "var(--primary)"} />
        <div className="absolute inset-0 flex items-center justify-center">
           {kpi.icon && <kpi.icon className="size-4 text-primary" />}
           {kpi.ringText && <span className="text-[10px] font-bold text-white tabular-nums">{kpi.ringText}</span>}
        </div>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">{kpi.label}</span>
        <span className="text-[11px] font-bold text-white leading-tight">{kpi.value}</span>
        <div className="flex items-center gap-1 mt-0.5">
          {kpi.trend === "up" && <ArrowUpRight className="size-3 text-primary" />}
          {kpi.trend === "down" && <ArrowDownRight className="size-3 text-primary" />}
          <span className={cn("text-[10px] font-medium", kpi.subTone || "text-muted-foreground")}>{kpi.sub}</span>
        </div>
      </div>
    </div>
  );
}

export default function Support() {
  const [activeCategory, setActiveCategory] = useState("Getting Started");
  const [search, setSearch] = useState("");

  const currentData = categoryData[activeCategory] || categoryData["Getting Started"];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#040504]">
      
      {/* Scrollable Main Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 pb-2 flex flex-col gap-6">
        
        {/* Header */}
        <header className="flex items-start justify-between shrink-0 animate-fade-in">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-white">Support / FAQ</h1>
            <p className="text-[11px] text-muted-foreground">Get help, learn product capabilities, and manage your support requests.</p>
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
            <div className="flex items-center gap-2 rounded-full border border-[#1E2730] bg-[#0A0C0B] px-3 py-1.5 transition-all hover:bg-[#141B21] cursor-pointer" onClick={() => toast("Connectors health checked")}>
               <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center"><CheckCircle2 className="size-2.5 text-primary" /></div>
               <div className="flex flex-col gap-0 leading-none">
                 <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Connector health</span>
                 <span className="text-[10px] font-semibold text-white">12 / 12</span>
               </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#1E2730] bg-[#0A0C0B] px-3 py-1.5 transition-all hover:bg-[#141B21] cursor-pointer group" onClick={() => toast("Manual sync triggered")}>
               <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors"><Zap className="size-2.5 text-primary group-hover:animate-pulse" /></div>
               <div className="flex flex-col gap-0 leading-none pr-2 border-r border-[#1E2730]">
                 <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Last quality</span>
                 <span className="text-[10px] font-semibold text-white">2m ago</span>
               </div>
               <RefreshCw className="size-3.5 text-muted-foreground group-hover:text-white transition-colors ml-1" />
            </div>
          </div>
        </header>

        {/* KPI Strip */}
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-none shrink-0 animate-fade-in-up" style={{ animationDelay: "50ms" }}>
          {supportKpis.map((kpi, i) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>

        {/* Main Layout */}
        <div className="flex gap-6 min-h-[700px] animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          
          {/* LEFT SIDEBAR: Search & Categories */}
          <div className="w-[260px] flex flex-col gap-6 shrink-0">
            
            <div className="flex flex-col gap-3">
              <h2 className="text-[11px] font-bold text-white">Search support articles</h2>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search articles, topics, or ask a question..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#0A0C0B] border border-[#1E2730] rounded-lg pl-9 pr-8 py-2.5 text-[11px] text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Categories</h3>
              <div className="flex flex-col gap-1">
                {categories.map((cat, i) => (
                  <button
                    key={cat.title}
                    onClick={() => { setActiveCategory(cat.title); toast(`Category selected: ${cat.title}`); }}
                    className={cn(
                      "flex items-center justify-between p-2.5 rounded-lg transition-colors group text-left",
                      activeCategory === cat.title 
                        ? "bg-[#141B21] border border-[#1E2730]" 
                        : "border border-transparent hover:bg-white/[0.03]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <cat.icon className={cn("size-4", activeCategory === cat.title ? "text-white" : "text-muted-foreground group-hover:text-white/80 transition-colors")} />
                      <span className={cn("text-[11px] font-medium", activeCategory === cat.title ? "text-white" : "text-muted-foreground group-hover:text-white/80 transition-colors")}>{cat.title}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground tabular-nums">{cat.count} articles</span>
                  </button>
                ))}
              </div>
              <button className="text-[11px] text-[#3b82f6] hover:text-[#60a5fa] font-medium flex items-center gap-1 transition-colors mt-2 px-2" onClick={() => toast("Viewing all articles")}>
                View all articles <ArrowRight className="size-3" />
              </button>
            </div>
            
          </div>

          {/* CENTER PANEL: Main Content */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Article view */}
            <div className="flex flex-col rounded-xl border border-[#1E2730] bg-[#0A0C0B] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-6">
                <span className="hover:text-white cursor-pointer transition-colors">Home</span>
                <ChevronRight className="size-3" />
                <span className="hover:text-white cursor-pointer transition-colors">{activeCategory}</span>
                <ChevronRight className="size-3" />
                <span className="text-white">{currentData.title}</span>
              </div>

              {/* Title & Actions */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex flex-col gap-2">
                  <h1 className="text-2xl font-bold text-white">{currentData.title}</h1>
                  <span className="text-[11px] text-muted-foreground">Updated: May 24, 2025 • 8 min read</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => toast("Following article")} className="h-8 text-[11px] border-[#1E2730] bg-[#141B21] text-white hover:bg-white/[0.05]">
                    <Star className="size-3.5 mr-1.5" /> Follow
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => toast("More options")} className="h-8 w-8 border-[#1E2730] bg-[#141B21] text-white hover:bg-white/[0.05]">
                    <MoreHorizontal className="size-3.5" />
                  </Button>
                </div>
              </div>

              {/* Text */}
              <p className="text-[12px] text-muted-foreground leading-relaxed mb-8">
                {currentData.desc}
              </p>

              {/* Pipeline Diagram */}
              {activeCategory === "Getting Started" && (
              <div className="flex items-center justify-between mb-10 overflow-x-auto scrollbar-none px-2 py-4">
                {pipelineSteps.map((step, idx) => (
                  <div key={step.id} className="flex items-center shrink-0">
                    <div className="flex flex-col items-center text-center w-[110px] group cursor-pointer" onClick={() => toast(`Step ${step.id}: ${step.title}`)}>
                      <div className={cn("size-8 rounded-full flex items-center justify-center text-[12px] font-bold mb-3 shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-transform group-hover:scale-110", step.color)}>
                        {step.id}
                      </div>
                      <span className="text-[11px] font-bold text-white mb-1">{step.title}</span>
                      <span className="text-[9px] text-muted-foreground leading-tight px-1">{step.desc}</span>
                    </div>
                    {idx !== pipelineSteps.length - 1 && (
                      <div className="w-8 mx-2 border-t-2 border-dashed border-[#1E2730] flex items-center justify-end">
                        <ChevronRight className="size-4 text-[#1E2730] -mr-2" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              )}

              {/* FAQs */}
              <Accordion type="multiple" defaultValue={["item-0"]} className="w-full flex flex-col gap-2" key={activeCategory}>
                {currentData.faqs.map((faq, idx) => (
                  <AccordionItem key={idx} value={`item-${idx}`} className="border-b border-[#1E2730] last:border-0 px-2">
                    <AccordionTrigger className="text-left text-[12px] font-bold text-white hover:text-primary py-4 hover:no-underline">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-[11px] text-muted-foreground leading-relaxed pb-4">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Bottom Troubleshooting Grid */}
            <div className="grid grid-cols-2 gap-6 mt-2">
              
              {/* Troubleshooting Checklist */}
              <div className="flex flex-col rounded-xl border border-[#1E2730] bg-[#0A0C0B] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                <h3 className="text-[11px] font-bold text-white mb-4">Troubleshooting checklist</h3>
                <div className="flex flex-col gap-3" key={activeCategory}>
                  {currentData.troubleshooting.map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-1.5 pb-3 border-b border-[#1E2730] last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <FileText className="size-3.5 text-muted-foreground" />
                        <span className="text-[11px] font-medium text-white">{item.issue}</span>
                      </div>
                      <div className="flex items-center justify-between pl-5.5">
                        <span className="text-[10px] text-muted-foreground">{item.remedy}</span>
                        <span className="text-[10px] text-[#3b82f6] hover:text-[#60a5fa] font-medium flex items-center gap-1 cursor-pointer transition-colors" onClick={() => toast("Navigating to article")}>
                          Go to article <ArrowRight className="size-2.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System status timeline */}
              <div className="flex flex-col rounded-xl border border-[#1E2730] bg-[#0A0C0B] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-bold text-white">System status timeline</h3>
                  <button className="text-[10px] text-[#3b82f6] hover:text-[#60a5fa] font-medium flex items-center gap-1 transition-colors" onClick={() => toast("View full status page")}>
                    View full status page <ArrowRight className="size-3" />
                  </button>
                </div>
                <div className="flex flex-col gap-3 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-[#1E2730]">
                  {timeline.map((event, idx) => (
                    <div key={idx} className="flex items-start gap-4 relative">
                      <div className="size-6 rounded-full bg-[#0A0C0B] border border-[#1E2730] flex items-center justify-center shrink-0 z-10">
                        <CheckCircle2 className="size-3.5 text-primary" />
                      </div>
                      <div className="flex flex-col gap-1 pt-0.5">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-muted-foreground font-mono">{event.time}</span>
                          <span className="text-[11px] font-bold text-white">{event.status}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{event.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR */}
          <div className="w-[300px] shrink-0 flex flex-col gap-6">
            
            {/* Live Support */}
            <div className="flex flex-col rounded-xl border border-[#1E2730] bg-[#0A0C0B] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
               <div className="flex items-center justify-between mb-2">
                 <h3 className="text-[11px] font-bold text-white">Live Support</h3>
                 <button className="text-[10px] text-[#3b82f6] hover:text-[#60a5fa] font-medium flex items-center gap-1 transition-colors" onClick={() => toast("View my tickets")}>
                    View my tickets <ArrowRight className="size-3" />
                 </button>
               </div>
               <p className="text-[10px] text-muted-foreground">We typically respond in under 30 minutes.</p>
            </div>

            {/* Create a support ticket */}
            <div className="flex flex-col rounded-xl border border-[#1E2730] bg-[#0A0C0B] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
               <h3 className="text-[11px] font-bold text-white mb-4">Create a support ticket</h3>
               
               <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); toast("Support ticket created!"); }}>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="flex flex-col gap-1.5">
                     <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Issue type</label>
                     <div className="relative">
                       <select className="w-full bg-[#141B21] border border-[#1E2730] rounded-lg pl-3 pr-8 py-2 text-[11px] text-white appearance-none focus:outline-none focus:border-primary/50 transition-colors">
                         <option>How-to / Usage</option>
                         <option>Bug Report</option>
                         <option>Feature Request</option>
                         <option>Billing</option>
                       </select>
                       <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                     </div>
                   </div>
                   <div className="flex flex-col gap-1.5">
                     <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Priority</label>
                     <div className="relative">
                       <select className="w-full bg-[#141B21] border border-[#1E2730] rounded-lg pl-7 pr-8 py-2 text-[11px] text-white appearance-none focus:outline-none focus:border-primary/50 transition-colors">
                         <option>Medium</option>
                         <option>High</option>
                         <option>Urgent</option>
                         <option>Low</option>
                       </select>
                       <div className="absolute left-3 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-[#f59e0b] pointer-events-none" />
                       <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                     </div>
                   </div>
                 </div>

                 <div className="flex flex-col gap-1.5">
                   <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Subject</label>
                   <input type="text" className="w-full bg-[#141B21] border border-[#1E2730] rounded-lg px-3 py-2 text-[11px] text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors" defaultValue="Need help with vendor contract renewal approval" />
                 </div>

                 <div className="flex flex-col gap-1.5">
                   <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Description</label>
                   <textarea rows={4} className="w-full bg-[#141B21] border border-[#1E2730] rounded-lg px-3 py-2 text-[11px] text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none" defaultValue="I'm unsure why the approval is blocked. Can you help me understand the missing requirements?" />
                 </div>

                 <div className="flex flex-col gap-1.5">
                   <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Attach screenshot (optional)</label>
                   <div className="flex items-center gap-3">
                     <Button type="button" variant="outline" size="sm" className="h-7 text-[10px] border-[#1E2730] bg-[#141B21] text-white hover:bg-white/[0.05]" onClick={() => toast("File dialog opened")}>Choose file</Button>
                     <span className="text-[10px] text-muted-foreground">or drag and drop</span>
                   </div>
                   <span className="text-[9px] text-muted-foreground/60 mt-1">PNG, JPG, PDF up to 10MB</span>
                 </div>

                 <Button type="submit" className="w-full h-9 text-[11px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mt-2">
                   Create ticket
                 </Button>
               </form>
            </div>

            {/* Other ways to reach us */}
            <div className="flex flex-col gap-4">
              <h3 className="text-[11px] font-bold text-white">Other ways to reach us</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 cursor-pointer group" onClick={() => toast("Opening email client")}>
                  <Mail className="size-4 text-[#38BDF8] mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-medium text-white group-hover:text-[#38BDF8] transition-colors">support@genius.ai</span>
                    <span className="text-[10px] text-muted-foreground">We reply within business hours</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 cursor-pointer group" onClick={() => toast("Opening live chat")}>
                  <MessageSquare className="size-4 text-primary mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-medium text-white group-hover:text-primary transition-colors">Live chat</span>
                    <span className="text-[10px] text-muted-foreground">Available Mon-Fri, 9am-6pm EST</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security & Compliance */}
            <div className="flex flex-col gap-4 pt-4 border-t border-[#1E2730]">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-bold text-white">Security & Compliance</h3>
                <button className="text-[10px] text-[#3b82f6] hover:text-[#60a5fa] font-medium flex items-center gap-1 transition-colors" onClick={() => toast("Viewing security details")}>
                  View details <ArrowRight className="size-3" />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  "Data stored in Supabase (SOC 2 Type II)",
                  "Row Level Security (RLS) enabled",
                  "Audit logs for all actions & approvals",
                  "Data deletion available on request",
                  "Provider fallback for resilience"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="size-3.5 text-primary mt-0.5 shrink-0" />
                    <span className="text-[10px] text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

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
