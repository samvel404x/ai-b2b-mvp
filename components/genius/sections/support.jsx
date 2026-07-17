"use client";

import { useRef, useState } from "react";
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
import { useWorkspace } from "../workspace-context";
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

const categoryTargets = {
  "Getting Started": "command",
  "Data Uploads": "data",
  "Evidence Graph": "command",
  Diagnostics: "diagnostics",
  Agents: "ai-gateway",
  Approvals: "approvals",
  Connectors: "connectors",
  "Security & Compliance": "settings",
  Reports: "reports",
  "Billing & Future Plans": "settings",
};

const pipelineTargets = {
  1: "data",
  2: "data",
  3: "diagnostics",
  4: "agents",
  5: "approvals",
  6: "reports",
};

const supportAttachmentLimitBytes = 10 * 1024 * 1024;
const supportAttachmentExtensions = new Set(["png", "jpg", "jpeg", "pdf"]);
const emptyAttachmentDraft = {
  name: "",
  note: "",
  type: "reference",
  size: 0,
  attachToNewTicket: false,
};

function formatFileSize(bytes = 0) {
  const size = Number(bytes) || 0;
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  if (size >= 1024) return `${Math.round(size / 1024)} KB`;
  return `${size} B`;
}

function supportFileExtension(name = "") {
  return String(name).split(".").pop()?.toLowerCase() || "";
}

function supportFileType(file, extension) {
  if (file?.type) return file.type;
  if (extension === "pdf") return "application/pdf";
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  if (extension === "png") return "image/png";
  return "reference";
}

function PlayCircleIcon(props) { return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>; }
function CloudUploadIcon(props) { return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>; }
function ActivityIcon(props) { return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>; }
function PlugIcon(props) { return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/></svg>; }
function LockIcon(props) { return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>; }
function CreditCardIcon(props) { return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>; }

const pipelineSteps = [
  { id: 1, title: "Upload Evidence", desc: "Files, URLs, screenshots, connectors", color: "bg-primary text-white" },
  { id: 2, title: "Extract Facts", desc: "AI reads and extracts facts & metadata", color: "bg-[#7CC7FF] text-white" },
  { id: 3, title: "Diagnostics", desc: "Identify risks, anomalies, and opportunities", color: "bg-primary text-white" },
  { id: 4, title: "Agent Draft", desc: "AI agents propose actions with rationale", color: "bg-[#7CC7FF] text-white" },
  { id: 5, title: "Human Approval", desc: "You review, edit, or approve actions", color: "bg-[#f59e0b] text-white" },
  { id: 6, title: "Board Report", desc: "Clear reports with proof trails", color: "bg-[#4EA1FF] text-white" },
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
    <div className="flex items-center gap-3 rounded-xl border border-[#28313C] bg-[#0E1116] p-4 flex-1 min-w-[190px] transition-colors hover:bg-[#141A22] hover:border-white/10 group">
      <div className="relative shrink-0 flex items-center justify-center">
        <Ring value={kpi.ring} size={42} stroke={kpi.tone === "info" ? "#7CC7FF" : kpi.tone === "warning" ? "#f59e0b" : "var(--primary)"} />
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

export default function Support({ onNavigate }) {
  const {
    workspace,
    session,
    backend,
    loadWorkspace,
    busy,
    createSupportTicket,
    updateSupportTicketStatus,
    addSupportTicketComment,
    addSupportTicketAttachment,
    supportTickets = [],
  } = useWorkspace();
  const attachmentFileInputRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState("Getting Started");
  const [search, setSearch] = useState("");
  const [ticketDraft, setTicketDraft] = useState({
    issueType: "How-to / Usage",
    priority: "Medium",
    subject: "Need help with vendor contract renewal approval",
    description: "I'm unsure why the approval is blocked. Can you help me understand the missing requirements?",
  });
  const [lastTicket, setLastTicket] = useState(null);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [isUpdatingTicketId, setIsUpdatingTicketId] = useState(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [attachmentDraft, setAttachmentDraft] = useState(emptyAttachmentDraft);
  const [followedCategories, setFollowedCategories] = useState([]);
  const [isAddingTicketComment, setIsAddingTicketComment] = useState(false);
  const [isAddingTicketAttachment, setIsAddingTicketAttachment] = useState(false);

  const currentData = categoryData[activeCategory] || categoryData["Getting Started"];
  const ticketItems = supportTickets || [];
  const latestTicket = (lastTicket && ticketItems.find((ticket) => ticket.id === lastTicket.id)) || lastTicket || ticketItems[0] || null;
  const latestTicketTimeline = latestTicket?.events?.slice(-3).reverse() || [];
  const latestTicketAttachments = latestTicket?.attachments || [];
  const workspaceName = workspace?.workspaceName || workspace?.name || "GENIUS Workspace";
  const workspaceRole = session?.role || workspace?.role || "Member";
  const storageLabel = backend?.storage === "supabase" ? "Supabase" : backend?.storage === "local" ? "Local" : "Store";
  const workspaceInitials = workspaceName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "GW";
  const openTicketCount = ticketItems.filter((ticket) => ticket.status === "open" || ticket.status === "pending").length;
  const urgentTicketCount = ticketItems.filter((ticket) => ticket.priority === "Urgent" || ticket.priority === "High").length;
  const supportKpiItems = supportKpis.map((kpi) => (
    kpi.id === "tickets"
      ? {
          ...kpi,
          value: `${openTicketCount} open`,
          sub: urgentTicketCount ? `${urgentTicketCount} high priority` : "No urgent tickets",
          subTone: urgentTicketCount ? "text-[#fbbf24]" : "text-primary",
          ring: Math.min(100, Math.max(8, openTicketCount * 24)),
          ringText: String(openTicketCount),
        }
      : kpi
  ));
  const filteredCategories = categories.filter((cat) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return cat.title.toLowerCase().includes(query) || categoryData[cat.title]?.title.toLowerCase().includes(query);
  });

  const updateTicketDraft = (field, value) => {
    setTicketDraft((current) => ({ ...current, [field]: value }));
  };

  const updateAttachmentDraft = (field, value) => {
    setAttachmentDraft((current) => ({ ...current, [field]: value }));
  };

  const handleLockedSupportAction = (label) => {
    toast.info(`${label} is locked until production support integrations or attachment storage are enabled.`);
  };

  const handleToggleArticleFollow = () => {
    setFollowedCategories((current) => (
      current.includes(activeCategory)
        ? current.filter((category) => category !== activeCategory)
        : [...current, activeCategory]
    ));
    toast.success(
      followedCategories.includes(activeCategory)
        ? `${activeCategory} removed from followed articles.`
        : `${activeCategory} added to followed articles.`,
    );
  };

  const handleCopyArticleLink = async () => {
    const link = typeof window === "undefined" ? activeCategory : `${window.location.href.split("#")[0]}#${encodeURIComponent(activeCategory)}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Article link copied.");
    } catch {
      toast.info(link);
    }
  };

  const handleRefreshStatus = async () => {
    try {
      await loadWorkspace({ silent: true });
      toast.success("Workspace status refreshed");
    } catch (error) {
      toast.error(error.message || "Status refresh failed.");
    }
  };

  const handleCreateTicket = async (event) => {
    event.preventDefault();
    const subject = ticketDraft.subject.trim();
    const description = ticketDraft.description.trim();
    const pendingAttachment = attachmentDraft.attachToNewTicket && attachmentDraft.name.trim()
      ? {
          name: attachmentDraft.name.trim(),
          type: attachmentDraft.type || "reference",
          size: attachmentDraft.size || 0,
          note: attachmentDraft.note.trim(),
        }
      : null;

    if (!subject || !description) {
      toast.error("Add a subject and description before creating a ticket.");
      return;
    }

    setIsCreatingTicket(true);
    try {
      const ticket = await createSupportTicket({
        issueType: ticketDraft.issueType,
        priority: ticketDraft.priority,
        subject,
        description,
      });
      let savedTicket = ticket;

      if (pendingAttachment) {
        try {
          savedTicket = await addSupportTicketAttachment({
            id: ticket.id,
            ...pendingAttachment,
          });
          setAttachmentDraft(emptyAttachmentDraft);
          toast.success(`${savedTicket.id} created with attachment reference.`);
        } catch (attachmentError) {
          toast.error(attachmentError.message || "Ticket was created, but attachment reference could not be saved.");
          toast.success(`${ticket.id} created and saved to the workspace support queue.`);
        }
      } else {
        toast.success(`${ticket.id} created and saved to the workspace support queue.`);
      }

      setTicketDraft((current) => ({ ...current, subject, description }));
      setLastTicket(savedTicket);
    } catch (error) {
      toast.error(error.message || "Support ticket could not be created.");
    } finally {
      setIsCreatingTicket(false);
    }
  };

  const handleUpdateTicketStatus = async (ticket, status) => {
    if (!ticket?.id) return;

    setIsUpdatingTicketId(ticket.id);
    try {
      const updatedTicket = await updateSupportTicketStatus({
        id: ticket.id,
        status,
        note: status === "resolved"
          ? "Requester marked the support ticket as resolved from the support center."
          : "Requester reopened the support ticket from the support center.",
      });
      setLastTicket(updatedTicket);
      toast.success(`${updatedTicket.id} moved to ${updatedTicket.status}.`);
    } catch (error) {
      toast.error(error.message || "Support ticket status could not be updated.");
    } finally {
      setIsUpdatingTicketId(null);
    }
  };

  const handleAddTicketComment = async (event) => {
    event.preventDefault();

    if (!latestTicket?.id) {
      toast.error("Create a support ticket before adding a comment.");
      return;
    }

    const message = commentDraft.trim();
    if (!message) {
      toast.error("Write a comment before adding it to the ticket.");
      return;
    }

    setIsAddingTicketComment(true);
    try {
      const updatedTicket = await addSupportTicketComment({
        id: latestTicket.id,
        message,
      });
      setLastTicket(updatedTicket);
      setCommentDraft("");
      toast.success("Comment added to the support ticket.");
    } catch (error) {
      toast.error(error.message || "Support ticket comment could not be added.");
    } finally {
      setIsAddingTicketComment(false);
    }
  };

  const handleAddTicketAttachment = async (event) => {
    event.preventDefault();

    if (!latestTicket?.id) {
      toast.error("Create a support ticket before adding an attachment reference.");
      return;
    }

    const name = attachmentDraft.name.trim();
    const note = attachmentDraft.note.trim();
    if (!name) {
      toast.error("Add an attachment name or link before saving the reference.");
      return;
    }

    setIsAddingTicketAttachment(true);
    try {
      const updatedTicket = await addSupportTicketAttachment({
        id: latestTicket.id,
        name,
        type: attachmentDraft.type || "reference",
        size: attachmentDraft.size || 0,
        note,
      });
      setLastTicket(updatedTicket);
      setAttachmentDraft(emptyAttachmentDraft);
      toast.success("Attachment reference added to the support ticket.");
    } catch (error) {
      toast.error(error.message || "Support ticket attachment reference could not be added.");
    } finally {
      setIsAddingTicketAttachment(false);
    }
  };

  const handleViewTickets = () => {
    if (!ticketItems.length && !lastTicket) {
      toast.info("No support tickets have been created in this workspace yet.");
      return;
    }

    document.getElementById("support-live-ticket-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCategorySelect = (title) => {
    setActiveCategory(title);
  };

  const handleOpenCurrentCategoryTarget = () => {
    const target = categoryTargets[activeCategory];
    if (target) onNavigate?.(target);
  };

  const handleEmailSupport = () => {
    window.location.href = `mailto:support@genius.ai?subject=${encodeURIComponent(ticketDraft.subject || "GENIUS support request")}`;
  };

  const handleStartLiveChat = async () => {
    const subject = `Live chat: ${activeCategory}`;
    const description = `Live chat requested from Support / ${activeCategory}. Current topic: ${currentData.title}`;

    setIsCreatingTicket(true);
    try {
      const ticket = await createSupportTicket({
        issueType: "How-to / Usage",
        priority: "High",
        subject,
        description,
      });
      setLastTicket(ticket);
      setCommentDraft("I am available now for a live support session.");
      document.getElementById("support-live-ticket-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
      toast.success(`${ticket.id} opened for live support follow-up.`);
    } catch (error) {
      toast.error(error.message || "Live support ticket could not be created.");
    } finally {
      setIsCreatingTicket(false);
    }
  };

  const handlePrepareAttachmentReference = () => {
    attachmentFileInputRef.current?.click();
  };

  const handleAttachmentFileChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const extension = supportFileExtension(file.name);
    if (!supportAttachmentExtensions.has(extension)) {
      toast.error("Support attachments accept PNG, JPG, or PDF files.");
      return;
    }

    if (file.size > supportAttachmentLimitBytes) {
      toast.error("Support attachment metadata is limited to files up to 10MB.");
      return;
    }

    setAttachmentDraft({
      name: file.name,
      note: `Local ${extension.toUpperCase()} selected for support reference (${formatFileSize(file.size)}).`,
      type: supportFileType(file, extension),
      size: file.size,
      attachToNewTicket: true,
    });
    toast.success(`${file.name} selected as support attachment reference.`);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#080A0E]">
      
      {/* Scrollable Main Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 pb-2 flex flex-col gap-6">
        
        {/* Header */}
        <header className="flex shrink-0 animate-fade-in flex-col gap-4 min-[1350px]:flex-row min-[1350px]:items-start min-[1350px]:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-white">Support / FAQ</h1>
            <p className="text-[11px] text-muted-foreground">Get help, learn product capabilities, and manage your support requests.</p>
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-3 min-[1350px]:justify-end">
            <button
              type="button"
              className="group flex min-w-[220px] max-w-full items-center gap-3 rounded-xl border border-primary/20 bg-[linear-gradient(180deg,rgba(78,161,255,0.14),rgba(11,22,36,0.92))] px-3 py-2 text-left shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition-all hover:border-primary/40 hover:bg-primary/10"
              onClick={() => onNavigate?.("company")}
              title="Open company details"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/15 text-[11px] font-black text-primary">
                {workspaceInitials}
              </div>
              <div className="min-w-0 flex-1">
                <span className="block truncate text-[11px] font-bold text-white">{workspaceName}</span>
                <span className="mt-0.5 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                  <Globe className="size-3 text-primary" /> {workspaceRole} / {storageLabel}
                </span>
              </div>
              <ChevronDown className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-y-0.5" />
            </button>
            <div className="flex items-center gap-2 rounded-full border border-[#28313C] bg-[#0E1116] px-3 py-1.5 transition-all hover:bg-[#141A22] cursor-pointer" onClick={() => onNavigate?.("settings")}>
               <div className="size-4 rounded-full bg-[#7CC7FF]/20 flex items-center justify-center"><Zap className="size-2.5 text-[#7CC7FF]" /></div>
               <div className="flex flex-col gap-0 leading-none">
                 <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">AI Provider</span>
                 <span className="text-[10px] font-semibold text-white flex items-center gap-1">Gemini 1.5 Pro <span className="size-1.5 rounded-full bg-primary" /></span>
               </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#28313C] bg-[#0E1116] px-3 py-1.5 transition-all hover:bg-[#141A22] cursor-pointer" onClick={() => onNavigate?.("settings")}>
               <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center"><Database className="size-2.5 text-primary" /></div>
               <div className="flex flex-col gap-0 leading-none">
                 <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Database</span>
                 <span className="text-[10px] font-semibold text-white flex items-center gap-1">Supabase <span className="size-1.5 rounded-full bg-primary" /></span>
               </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#28313C] bg-[#0E1116] px-3 py-1.5 transition-all hover:bg-[#141A22] cursor-pointer" onClick={() => onNavigate?.("connectors")}>
               <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center"><CheckCircle2 className="size-2.5 text-primary" /></div>
               <div className="flex flex-col gap-0 leading-none">
                 <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Connector health</span>
                 <span className="text-[10px] font-semibold text-white">12 / 12</span>
               </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#28313C] bg-[#0E1116] px-3 py-1.5 transition-all hover:bg-[#141A22] cursor-pointer group" onClick={handleRefreshStatus}>
               <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors"><Zap className="size-2.5 text-primary group-hover:animate-pulse" /></div>
               <div className="flex flex-col gap-0 leading-none pr-2 border-r border-[#28313C]">
                 <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Last quality</span>
                 <span className="text-[10px] font-semibold text-white">2m ago</span>
               </div>
               <RefreshCw className={cn("size-3.5 text-muted-foreground group-hover:text-white transition-colors ml-1", busy && "animate-spin")} />
            </div>
          </div>
        </header>

        {/* KPI Strip */}
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-none shrink-0 animate-fade-in-up" style={{ animationDelay: "50ms" }}>
          {supportKpiItems.map((kpi) => (
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
                  className="w-full bg-[#0E1116] border border-[#28313C] rounded-lg pl-9 pr-8 py-2.5 text-[11px] text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Categories</h3>
              <div className="flex flex-col gap-1">
                {filteredCategories.map((cat, i) => (
                  <button
                    key={cat.title}
                    onClick={() => handleCategorySelect(cat.title)}
                    className={cn(
                      "flex items-center justify-between p-2.5 rounded-lg transition-colors group text-left",
                      activeCategory === cat.title 
                        ? "bg-[#141A22] border border-[#28313C]" 
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
                {filteredCategories.length === 0 && (
                  <div className="rounded-lg border border-[#28313C] bg-[#0E1116] p-3 text-[11px] text-muted-foreground">
                    No matching articles.
                  </div>
                )}
              </div>
              <button className="text-[11px] text-[#4EA1FF] hover:text-[#7CC7FF] font-medium flex items-center gap-1 transition-colors mt-2 px-2" onClick={() => { setSearch(""); setActiveCategory("Getting Started"); }}>
                Reset article view <ArrowRight className="size-3" />
              </button>
            </div>
            
          </div>

          {/* CENTER PANEL: Main Content */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Article view */}
            <div className="flex flex-col rounded-xl border border-[#28313C] bg-[#0E1116] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-6">
                <span className="hover:text-white cursor-pointer transition-colors" onClick={() => onNavigate?.("command")}>Home</span>
                <ChevronRight className="size-3" />
                <span className="hover:text-white cursor-pointer transition-colors" onClick={handleOpenCurrentCategoryTarget}>{activeCategory}</span>
                <ChevronRight className="size-3" />
                <span className="text-white">{currentData.title}</span>
              </div>

              {/* Title & Actions */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex flex-col gap-2">
                  <h1 className="text-2xl font-bold text-white">{currentData.title}</h1>
                  <span className="text-[11px] text-muted-foreground">Updated: May 24, 2025 - 8 min read</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={handleToggleArticleFollow} className="h-8 text-[11px] border-[#28313C] bg-[#141A22] text-white hover:bg-white/[0.05]">
                    <Star className={cn("size-3.5 mr-1.5", followedCategories.includes(activeCategory) && "fill-primary text-primary")} /> {followedCategories.includes(activeCategory) ? "Following" : "Follow"}
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleCopyArticleLink} className="h-8 w-8 border-[#28313C] bg-[#141A22] text-white hover:bg-white/[0.05]">
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
                    <div className="flex flex-col items-center text-center w-[110px] group cursor-pointer" onClick={() => onNavigate?.(pipelineTargets[step.id])}>
                      <div className={cn("size-8 rounded-full flex items-center justify-center text-[12px] font-bold mb-3 shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-transform group-hover:scale-110", step.color)}>
                        {step.id}
                      </div>
                      <span className="text-[11px] font-bold text-white mb-1">{step.title}</span>
                      <span className="text-[9px] text-muted-foreground leading-tight px-1">{step.desc}</span>
                    </div>
                    {idx !== pipelineSteps.length - 1 && (
                      <div className="w-8 mx-2 border-t-2 border-dashed border-[#28313C] flex items-center justify-end">
                        <ChevronRight className="size-4 text-[#28313C] -mr-2" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              )}

              {/* FAQs */}
              <Accordion type="multiple" defaultValue={["item-0"]} className="w-full flex flex-col gap-2" key={activeCategory}>
                {currentData.faqs.map((faq, idx) => (
                  <AccordionItem key={idx} value={`item-${idx}`} className="border-b border-[#28313C] last:border-0 px-2">
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
              <div className="flex flex-col rounded-xl border border-[#28313C] bg-[#0E1116] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                <h3 className="text-[11px] font-bold text-white mb-4">Troubleshooting checklist</h3>
                <div className="flex flex-col gap-3" key={activeCategory}>
                  {currentData.troubleshooting.map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-1.5 pb-3 border-b border-[#28313C] last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <FileText className="size-3.5 text-muted-foreground" />
                        <span className="text-[11px] font-medium text-white">{item.issue}</span>
                      </div>
                      <div className="flex items-center justify-between pl-5.5">
                        <span className="text-[10px] text-muted-foreground">{item.remedy}</span>
                        <span className="text-[10px] text-[#4EA1FF] hover:text-[#7CC7FF] font-medium flex items-center gap-1 cursor-pointer transition-colors" onClick={handleOpenCurrentCategoryTarget}>
                          Open section <ArrowRight className="size-2.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System status timeline */}
              <div className="flex flex-col rounded-xl border border-[#28313C] bg-[#0E1116] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-bold text-white">System status timeline</h3>
                  <button className="text-[10px] text-[#4EA1FF] hover:text-[#7CC7FF] font-medium flex items-center gap-1 transition-colors" onClick={() => onNavigate?.("diagnostics")}>
                    View full status page <ArrowRight className="size-3" />
                  </button>
                </div>
                <div className="flex flex-col gap-3 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-[#28313C]">
                  {timeline.map((event, idx) => (
                    <div key={idx} className="flex items-start gap-4 relative">
                      <div className="size-6 rounded-full bg-[#0E1116] border border-[#28313C] flex items-center justify-center shrink-0 z-10">
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
            <div id="support-live-ticket-panel" className="flex flex-col rounded-xl border border-[#28313C] bg-[#0E1116] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)] scroll-mt-4">
               <div className="flex items-center justify-between mb-2">
                 <h3 className="text-[11px] font-bold text-white">Live Support</h3>
                 <button className="text-[10px] text-[#4EA1FF] hover:text-[#7CC7FF] font-medium flex items-center gap-1 transition-colors" onClick={handleViewTickets}>
                    View my tickets <ArrowRight className="size-3" />
                 </button>
               </div>
               <p className="text-[10px] text-muted-foreground">We typically respond in under 30 minutes.</p>
               {latestTicket && (
                 <div className="mt-4 rounded-lg border border-[#28313C] bg-[#141A22]/70 p-3">
                   <div className="flex items-center justify-between gap-3">
                     <span className="truncate text-[10px] font-bold text-white">{latestTicket.id}</span>
                     <span className="rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest text-primary">
                       {latestTicket.status}
                     </span>
                   </div>
                   <p className="mt-1 truncate text-[11px] font-medium text-white/85">{latestTicket.subject}</p>
                   <div className="mt-2 flex items-center justify-between text-[9px] text-muted-foreground">
                     <span>{latestTicket.priority} priority</span>
                     <span>{latestTicket.issueType}</span>
                   </div>
                   <div className="mt-3 flex items-center gap-2 border-t border-[#28313C] pt-3">
                     {latestTicket.status === "resolved" || latestTicket.status === "closed" ? (
                       <Button
                         type="button"
                         variant="outline"
                         size="sm"
                         disabled={isUpdatingTicketId === latestTicket.id || busy}
                         onClick={() => handleUpdateTicketStatus(latestTicket, "open")}
                         className="h-7 flex-1 border-[#28313C] bg-[#0E1116] text-[10px] text-white hover:bg-white/[0.05] disabled:opacity-60"
                       >
                         <RotateCcw className="mr-1.5 size-3" /> Reopen
                       </Button>
                     ) : (
                       <Button
                         type="button"
                         variant="outline"
                         size="sm"
                         disabled={isUpdatingTicketId === latestTicket.id || busy}
                         onClick={() => handleUpdateTicketStatus(latestTicket, "resolved")}
                         className="h-7 flex-1 border-primary/30 bg-primary/10 text-[10px] text-primary hover:bg-primary hover:text-white disabled:opacity-60"
                       >
                         <CheckCircle2 className="mr-1.5 size-3" /> Mark resolved
                       </Button>
                     )}
                   </div>
                   <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#28313C] pt-3 text-[9px]">
                     <span className="text-muted-foreground">Activity</span>
                     <span className="text-right font-medium text-white">{latestTicket.events?.length || 0}</span>
                     <span className="text-muted-foreground">Attachments</span>
                     <span className="text-right font-medium text-white">{latestTicketAttachments.length}</span>
                   </div>
                   {latestTicketTimeline.length > 0 && (
                     <div className="mt-3 flex flex-col gap-2 border-t border-[#28313C] pt-3">
                       <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Recent activity</span>
                       {latestTicketTimeline.map((event) => (
                         <div key={event.id} className="flex flex-col gap-0.5">
                           <div className="flex items-center justify-between gap-2">
                             <span className="truncate text-[9px] font-semibold uppercase text-muted-foreground">{event.type?.replaceAll("_", " ") || "Activity"}</span>
                             <span className="shrink-0 text-[8px] text-muted-foreground">{event.createdAt ? new Date(event.createdAt).toLocaleDateString() : "Now"}</span>
                           </div>
                           <p className="line-clamp-2 text-[9px] leading-snug text-white/75">{event.message}</p>
                         </div>
                       ))}
                     </div>
                   )}
                   {latestTicketAttachments.length > 0 && (
                     <div className="mt-3 flex flex-col gap-1.5 border-t border-[#28313C] pt-3">
                       <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Attachment references</span>
                       {latestTicketAttachments.slice(-3).map((attachment) => (
                         <div key={attachment.id} className="flex items-start gap-2 text-[9px]">
                           <LinkIcon className="mt-0.5 size-3 shrink-0 text-[#7CC7FF]" />
                           <div className="min-w-0">
                             <p className="truncate font-medium text-white">{attachment.name}</p>
                             {attachment.note && <p className="line-clamp-1 text-muted-foreground">{attachment.note}</p>}
                           </div>
                         </div>
                       ))}
                     </div>
                   )}
                   <form onSubmit={handleAddTicketComment} className="mt-3 flex flex-col gap-2 border-t border-[#28313C] pt-3">
                     <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Add comment</label>
                     <textarea
                       rows={2}
                       value={commentDraft}
                       onChange={(event) => setCommentDraft(event.target.value)}
                       placeholder="Add context, reproduction steps, or a follow-up question..."
                       className="resize-none rounded border border-[#28313C] bg-[#0E1116] px-2 py-1.5 text-[10px] text-white outline-none placeholder:text-muted-foreground focus:border-primary/50"
                     />
                     <Button
                       type="submit"
                       disabled={busy || isAddingTicketComment || !commentDraft.trim()}
                       className="h-7 justify-center bg-primary text-[10px] text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                     >
                       <MessageSquare className="mr-1.5 size-3" /> {isAddingTicketComment ? "Adding..." : "Add comment"}
                     </Button>
                   </form>
                   <form onSubmit={handleAddTicketAttachment} className="mt-3 flex flex-col gap-2 border-t border-[#28313C] pt-3">
                     <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Attachment reference</label>
                     <input
                       value={attachmentDraft.name}
                       onChange={(event) => updateAttachmentDraft("name", event.target.value)}
                       placeholder="Screenshot name, Drive link, or error log reference"
                       className="h-7 rounded border border-[#28313C] bg-[#0E1116] px-2 text-[10px] text-white outline-none placeholder:text-muted-foreground focus:border-primary/50"
                     />
                     <input
                       value={attachmentDraft.note}
                       onChange={(event) => updateAttachmentDraft("note", event.target.value)}
                       placeholder="Short note for support"
                       className="h-7 rounded border border-[#28313C] bg-[#0E1116] px-2 text-[10px] text-white outline-none placeholder:text-muted-foreground focus:border-primary/50"
                     />
                     <Button
                       type="submit"
                       variant="outline"
                       disabled={busy || isAddingTicketAttachment || !attachmentDraft.name.trim() || latestTicketAttachments.length >= 10}
                       className="h-7 justify-center border-[#28313C] bg-[#141A22] text-[10px] text-white hover:bg-white/[0.05] disabled:opacity-50"
                     >
                       <LinkIcon className="mr-1.5 size-3" /> {isAddingTicketAttachment ? "Saving..." : "Save reference"}
                     </Button>
                     <span className="text-[8px] leading-snug text-muted-foreground">Reference metadata only. Binary upload storage is a later security slice.</span>
                   </form>
                 </div>
               )}
               {ticketItems.length > 1 && (
                 <div className="mt-3 flex flex-col gap-2">
                   {ticketItems.slice(1, 3).map((ticket) => (
                     <div key={ticket.id} className="flex items-center justify-between gap-3 rounded border border-[#28313C] bg-[#141A22]/40 px-2 py-1.5">
                       <span className="truncate text-[10px] text-muted-foreground">{ticket.subject}</span>
                       <span className="shrink-0 text-[9px] font-semibold text-muted-foreground">{ticket.status}</span>
                     </div>
                   ))}
                 </div>
               )}
            </div>

            {/* Create a support ticket */}
            <div className="flex flex-col rounded-xl border border-[#28313C] bg-[#0E1116] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
               <h3 className="text-[11px] font-bold text-white mb-4">Create a support ticket</h3>
               
               <form className="flex flex-col gap-4" onSubmit={handleCreateTicket}>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="flex flex-col gap-1.5">
                     <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Issue type</label>
                     <div className="relative">
                       <select value={ticketDraft.issueType} onChange={(event) => updateTicketDraft("issueType", event.target.value)} className="w-full bg-[#141A22] border border-[#28313C] rounded-lg pl-3 pr-8 py-2 text-[11px] text-white appearance-none focus:outline-none focus:border-primary/50 transition-colors">
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
                       <select value={ticketDraft.priority} onChange={(event) => updateTicketDraft("priority", event.target.value)} className="w-full bg-[#141A22] border border-[#28313C] rounded-lg pl-7 pr-8 py-2 text-[11px] text-white appearance-none focus:outline-none focus:border-primary/50 transition-colors">
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
                   <input type="text" className="w-full bg-[#141A22] border border-[#28313C] rounded-lg px-3 py-2 text-[11px] text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors" value={ticketDraft.subject} onChange={(event) => updateTicketDraft("subject", event.target.value)} />
                 </div>

                 <div className="flex flex-col gap-1.5">
                   <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Description</label>
                   <textarea rows={4} className="w-full bg-[#141A22] border border-[#28313C] rounded-lg px-3 py-2 text-[11px] text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none" value={ticketDraft.description} onChange={(event) => updateTicketDraft("description", event.target.value)} />
                 </div>

                 <div className="flex flex-col gap-1.5">
                   <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Attach screenshot (optional)</label>
                   <div className="flex items-center gap-3">
                     <input
                       ref={attachmentFileInputRef}
                       type="file"
                       accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf"
                       className="hidden"
                       onChange={handleAttachmentFileChange}
                     />
                     <Button type="button" variant="outline" size="sm" disabled={busy || isCreatingTicket} className="h-7 text-[10px] border-[#28313C] bg-[#141A22] text-white hover:bg-white/[0.05] disabled:opacity-50" onClick={handlePrepareAttachmentReference}>Choose file</Button>
                     <span className="min-w-0 truncate text-[10px] text-muted-foreground">
                       {attachmentDraft.attachToNewTicket && attachmentDraft.name
                         ? `${attachmentDraft.name} - ${formatFileSize(attachmentDraft.size)}`
                         : "or drag and drop"}
                     </span>
                   </div>
                   <span className="text-[9px] text-muted-foreground/60 mt-1">PNG, JPG, PDF up to 10MB</span>
                 </div>

                 <Button type="submit" disabled={isCreatingTicket || busy} className="w-full h-9 text-[11px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mt-2 disabled:cursor-not-allowed disabled:opacity-70">
                   {isCreatingTicket ? "Creating ticket..." : "Create ticket"}
                 </Button>
               </form>
            </div>

            {/* Other ways to reach us */}
            <div className="flex flex-col gap-4">
              <h3 className="text-[11px] font-bold text-white">Other ways to reach us</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 cursor-pointer group" onClick={handleEmailSupport}>
                  <Mail className="size-4 text-[#7CC7FF] mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-medium text-white group-hover:text-[#7CC7FF] transition-colors">support@genius.ai</span>
                    <span className="text-[10px] text-muted-foreground">We reply within business hours</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 cursor-pointer group" onClick={handleStartLiveChat}>
                  <MessageSquare className="size-4 text-primary mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-medium text-white group-hover:text-primary transition-colors">Live chat</span>
                    <span className="text-[10px] text-muted-foreground">Available Mon-Fri, 9am-6pm EST</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security & Compliance */}
            <div className="flex flex-col gap-4 pt-4 border-t border-[#28313C]">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-bold text-white">Security & Compliance</h3>
                <button className="text-[10px] text-[#4EA1FF] hover:text-[#7CC7FF] font-medium flex items-center gap-1 transition-colors" onClick={() => onNavigate?.("settings")}>
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
      <div className="shrink-0 border-t border-[#28313C] bg-[#0E1116] px-6 py-2.5 flex items-center justify-between text-[10px] z-10 relative shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
         <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
             <span className="font-semibold text-white">System status</span>
             <span className="size-1.5 rounded-full bg-primary shadow-[0_0_5px_rgba(33,163,102,0.8)]" />
             <span className="text-muted-foreground">All systems operational</span>
           </div>
           
           <div className="flex items-center gap-6 pl-6 border-l border-[#28313C]">
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
           <RefreshCw className={cn("size-3 text-muted-foreground cursor-pointer hover:text-white transition-colors", busy && "animate-spin")} onClick={handleRefreshStatus} />
         </div>
      </div>
    </div>
  );
}
