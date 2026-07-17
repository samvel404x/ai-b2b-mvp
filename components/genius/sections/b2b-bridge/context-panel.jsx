"use client";

import { cn } from "@/lib/utils";
import { 
  FileText, 
  CheckCircle2, 
  ChevronDown,
  X,
  Eye,
  Download,
  AlertTriangle,
  RotateCcw,
  Clock
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const statusMeta = {
  "Pending Approval": {
    label: "Pending approval",
    dot: "bg-warning shadow-[0_0_8px_rgba(245,158,11,0.8)]",
    text: "text-warning",
    Icon: Clock,
  },
  Approved: {
    label: "Approved",
    dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]",
    text: "text-emerald-500",
    Icon: CheckCircle2,
  },
  Rejected: {
    label: "Rejected",
    dot: "bg-critical shadow-[0_0_8px_rgba(239,68,68,0.8)]",
    text: "text-critical",
    Icon: AlertTriangle,
  },
};

function formatDateTime(value, fallback = "Current session") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function initials(value) {
  return String(value || "U")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "U";
}

function timelineLabel(message) {
  if (message.isInternal) return "Internal note logged";
  if (message.isSystem || message.isAction) return "System action recorded";
  if (message.isSelf) return "Message sent";
  return "Counterparty replied";
}

export function ContextPanel({
  collapsed,
  onCollapse,
  thread = {},
  status = "Pending Approval",
  busy = false,
  canApprove = false,
  workflowAction = null,
  onWorkflowStatusChange,
  onCreateFollowUp,
  onExportTranscript,
  onNavigate,
}) {
  const messages = Array.isArray(thread.messages) ? thread.messages : [];
  const discussion = thread.discussion || {};
  const meta = statusMeta[status] || statusMeta["Pending Approval"];
  const MetaIcon = meta.Icon;
  const lastMessage = messages[messages.length - 1] || null;
  const createdAt = messages[0]?.createdAt || "2026-05-20T09:15:00.000Z";
  const updatedAt = thread.updatedAt || lastMessage?.createdAt;
  const participants = Array.from(new Set(messages.map((message) => message.sender).filter(Boolean))).slice(0, 5);
  const timelineEvents = messages.slice(-7).reverse().map((message, index) => ({
    id: message.id || `event-${index}`,
    label: timelineLabel(message),
    detail: message.text || "",
    time: formatDateTime(message.createdAt, message.time || "Current session"),
    tone: message.isInternal ? "warning" : message.isSystem || message.isAction ? "emerald" : "blue",
  }));

  if (collapsed) return null;

  return (
    <div className="w-[340px] shrink-0 border-l border-[#28313C] flex flex-col bg-[#080A0E] h-full overflow-hidden transition-all duration-300 z-20 relative">
      
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#28313C] pb-24">
        
        {/* Section 1: Conversation Details */}
        <div className="px-5 pt-6 pb-6 border-b border-[#28313C] relative">
          <button 
            type="button"
            onClick={onCollapse}
            className="absolute top-6 right-5 text-muted-foreground hover:text-white transition-colors"
            aria-label="Collapse context panel"
          >
            <X className="size-4" />
          </button>
          
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-white mb-5">Conversation Details</h3>
          
          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Type</span>
              <span className="text-white font-medium">{discussion.label?.includes("Pricing") ? "Pricing Review" : "Invoice Discrepancy"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Priority</span>
              <span className="text-warning font-bold flex items-center gap-1.5">
                <div className="size-1.5 rounded-full bg-warning"></div>
                Medium
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status</span>
              <span className={cn("font-bold flex items-center gap-1.5", meta.text)}>
                <div className={cn("size-1.5 rounded-full", meta.dot)}></div>
                {meta.label}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Created by</span>
              <span className="text-white font-medium">{messages[0]?.sender || "Alex Rivera"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Created on</span>
              <span className="text-white font-medium">{formatDateTime(createdAt)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Last updated</span>
              <span className="text-white font-medium">{formatDateTime(updatedAt, lastMessage?.time || "Current session")}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-muted-foreground">Participants</span>
              <div className="flex items-center -space-x-2">
                {(participants.length ? participants : ["Alex Rivera", "Sarah Miller"]).slice(0, 4).map((participant) => (
                  <Avatar key={participant} className="size-6 border-2 border-[#080A0E]">
                    <AvatarFallback className="bg-[#4EA1FF] text-[9px] font-bold text-white">{initials(participant)}</AvatarFallback>
                  </Avatar>
                ))}
                <div className="size-6 rounded-full border-2 border-[#080A0E] bg-[#141A22] flex items-center justify-center text-[9px] font-bold text-muted-foreground z-10">
                  +{Math.max(1, participants.length + 3)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Related Documents */}
        <div className="px-5 py-6 border-b border-[#28313C]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-white">Related Documents</h3>
            <button type="button" onClick={() => onNavigate?.("data", { source: "b2b-related-documents" })} className="text-[10px] font-semibold text-[#4EA1FF] cursor-pointer hover:text-white transition-colors">View all (3)</button>
          </div>

          <div className="space-y-4">
            {[
              { name: "INV-2025-0519.pdf", amount: "Invoice - $12,485.00", bg: "bg-critical/10 text-critical", date: "May 19, 2026" },
              { name: "Delivery Note DN-77821.pdf", amount: "Delivery Note - May 19, 2026", bg: "bg-critical/10 text-critical", date: "May 19, 2026" },
              { name: "Credit Note CN-2025-0712.pdf", amount: "Credit Note - $413.50", bg: "bg-critical/10 text-critical", date: "May 24, 2026" },
            ].map((doc, i) => (
              <div key={i} className="flex items-start gap-3 group">
                <div className={cn("size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", doc.bg)}>
                  <FileText className="size-4" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => onNavigate?.("data", { source: "b2b-document-name", evidenceName: doc.name })}
                    className="truncate text-left text-[12px] font-bold text-white hover:underline"
                  >
                    {doc.name}
                  </button>
                  <span className="text-[10px] text-muted-foreground truncate">{doc.amount}</span>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                  <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Verified</span>
                  <span className="text-[9px] text-muted-foreground">{doc.date}</span>
                </div>
                <div className="flex flex-col gap-2 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button type="button" onClick={() => onNavigate?.("data", { source: "b2b-document", evidenceName: doc.name })} className="text-muted-foreground hover:text-white" aria-label={`Open ${doc.name}`}>
                    <Eye className="size-3.5" />
                  </button>
                  <button type="button" onClick={onExportTranscript} className="text-muted-foreground hover:text-white" aria-label={`Export context for ${doc.name}`}>
                    <Download className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Workflow Timeline */}
        <div className="px-5 py-6 border-b border-[#28313C]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-white">Workflow Timeline</h3>
            <button type="button" onClick={onExportTranscript} className="text-[10px] font-semibold text-[#4EA1FF] cursor-pointer hover:text-white transition-colors">Export</button>
          </div>

          <div className="relative pl-3 space-y-5 before:absolute before:inset-y-2 before:left-[15px] before:w-px before:bg-[#28313C]">
            {(timelineEvents.length ? timelineEvents : [{ id: "seed", label: "Thread opened", detail: "Waiting for B2B activity.", time: "Current session", tone: "blue" }]).map((event) => (
              <div key={event.id} className="relative flex items-start gap-4">
                <div className={cn(
                  "size-2 rounded-full absolute -left-1 top-1.5 ring-4 ring-[#080A0E]",
                  event.tone === "warning" ? "bg-warning shadow-[0_0_8px_rgba(245,158,11,0.5)]" :
                    event.tone === "emerald" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                      "bg-[#4EA1FF] shadow-[0_0_8px_rgba(78,161,255,0.5)]"
                )}></div>
                <div className="flex flex-col ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <span className={cn("text-[11px] font-bold truncate", event.tone === "warning" ? "text-warning" : "text-white")}>{event.label}</span>
                    <span className="text-[9px] text-muted-foreground shrink-0">{event.time}</span>
                  </div>
                  {event.detail && <span className="mt-1 line-clamp-2 text-[10px] text-muted-foreground">{event.detail}</span>}
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* Section 4: SLA & Performance */}
        <div className="px-5 py-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-white">SLA & Performance</h3>
            <button
              type="button"
              onClick={() => onNavigate?.("diagnostics", { source: "b2b-sla", workflowStatus: status })}
              className="text-[10px] font-semibold text-[#4EA1FF] cursor-pointer hover:text-white transition-colors"
            >
              View details
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground">First response</span>
              <span className="text-[22px] font-bold text-emerald-500 my-0.5">36m</span>
              <span className="text-[9px] text-muted-foreground">Target &lt; 2h</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground">Resolution time</span>
              <span className="text-[22px] font-bold text-emerald-500 my-0.5">1h 50m</span>
              <span className="text-[9px] text-muted-foreground">Target &lt; 24h</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground">SLA compliance</span>
              <span className="text-[22px] font-bold text-emerald-500 my-0.5">100%</span>
              <span className="text-[9px] font-bold text-emerald-500">On Track</span>
            </div>
          </div>
        </div>

      </div>

      {/* Sticky Bottom Action */}
      <div className="absolute bottom-0 left-0 w-full p-5 bg-[#0E1116] border-t border-[#28313C]">
        <div className="mb-3 flex items-center justify-between rounded-lg border border-[#28313C] bg-[#080A0E] px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <MetaIcon className={cn("size-4 shrink-0", meta.text)} />
            <div className="min-w-0">
              <div className="truncate text-[11px] font-bold text-white">Workflow status</div>
              <div className={cn("text-[10px] font-semibold", meta.text)}>{meta.label}</div>
            </div>
          </div>
          {!canApprove && <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Read only</span>}
        </div>

        {status === "Pending Approval" ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={busy || !canApprove}
              onClick={() => onWorkflowStatusChange?.("Approved")}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#4EA1FF] px-3 py-3 text-xs font-bold text-white shadow-[0_0_15px_rgba(78,161,255,0.3)] transition-colors hover:bg-[#4EA1FF] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle2 className="size-4" /> {workflowAction === "Approved" ? "Approving..." : "Approve"}
            </button>
            <button
              type="button"
              disabled={busy || !canApprove}
              onClick={() => onWorkflowStatusChange?.("Rejected")}
              className="flex items-center justify-center gap-2 rounded-lg border border-critical/30 bg-critical/10 px-3 py-3 text-xs font-bold text-critical transition-colors hover:bg-critical/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <AlertTriangle className="size-4" /> {workflowAction === "Rejected" ? "Rejecting..." : "Reject"}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              disabled={busy}
              onClick={onCreateFollowUp}
              className="flex-1 bg-[#4EA1FF] text-white font-bold text-sm py-3 rounded-l-lg hover:bg-[#4EA1FF] transition-colors shadow-[0_0_15px_rgba(78,161,255,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Create Follow-Up Task
            </button>
            <button
              type="button"
              disabled={busy || !canApprove}
              onClick={() => onWorkflowStatusChange?.("Pending Approval")}
              className="flex size-[44px] shrink-0 items-center justify-center bg-[#4EA1FF] rounded-r-lg text-white hover:bg-[#4EA1FF] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Reopen approval"
            >
              <RotateCcw className="size-4" />
            </button>
          </div>
        )}
        {status === "Pending Approval" && (
          <button
            type="button"
            onClick={onCreateFollowUp}
            disabled={busy}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-[#28313C] bg-[#141A22] px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-[#28313C] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Log follow-up note <ChevronDown className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
