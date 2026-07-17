"use client";

import {
  ShieldCheck,
  Star,
  CheckCircle2,
  AlertTriangle,
  Users,
  MoreVertical,
  Hexagon,
  FileText,
  ArrowLeft,
  Building2,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const workflowMeta = {
  "Pending Approval": {
    label: "PENDING",
    className: "bg-warning text-black shadow-[0_0_10px_rgba(245,158,11,0.35)]",
  },
  Approved: {
    label: "APPROVED",
    className: "bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.35)]",
  },
  Rejected: {
    label: "REJECTED",
    className: "bg-critical text-white shadow-[0_0_10px_rgba(239,68,68,0.35)]",
  },
};

export function ConversationHeader({
  status = "Pending Approval",
  discussion = null,
  pinned = false,
  busy = false,
  canApprove = false,
  onWorkflowStatusChange,
  onExportTranscript,
  onPinChannel,
  onInviteParticipants,
  onOpenChannelSettings,
  onArchiveChannel,
  onDeleteChannel,
  onNavigate,
}) {
  const meta = workflowMeta[status] || workflowMeta["Pending Approval"];
  const canAct = canApprove && !busy;
  const discussionTitle = discussion?.label || "INV-2025-0519 Discrepancy";
  const counterparty = discussion?.sub || "Farm Fresh Co.";
  const isArchived = Boolean(discussion?.archived);

  return (
    <div className="flex flex-col shrink-0 border-b border-[#28313C] bg-[#0E1116] z-20">
      {/* Top Bar: Title & Actions */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-1">
            <button type="button" onClick={() => onNavigate?.("connectors")} className="text-muted-foreground hover:text-white transition-colors" aria-label="Back to connectors">
              <ArrowLeft className="size-4" />
            </button>
            <h1 className="text-xl font-bold text-white tracking-tight">{discussionTitle}</h1>
            
            <span className={`flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${meta.className}`}>
              {meta.label}
            </span>
            <button type="button" onClick={onPinChannel} className={cn("transition-colors", pinned ? "text-warning hover:text-warning/80" : "text-muted-foreground hover:text-white")} aria-label={pinned ? "Unpin channel" : "Pin channel"}>
              <Star className="size-4" fill={pinned ? "currentColor" : "none"} />
            </button>
          </div>
          <div className="flex items-center gap-1.5 pl-7">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              Secure channel <ShieldCheck className="size-3" /> End-to-end encrypted
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 border-r border-[#28313C] pr-4">
            <div className="flex items-center -space-x-2">
              <Avatar className="size-7 border-2 border-[#0E1116]">
                <AvatarFallback className="bg-[#4EA1FF] text-[10px] font-bold text-white">SM</AvatarFallback>
              </Avatar>
              <Avatar className="size-7 border-2 border-[#0E1116]">
                <AvatarFallback className="bg-[#4EA1FF] text-[10px] font-bold text-white">JB</AvatarFallback>
              </Avatar>
              <Avatar className="size-7 border-2 border-[#0E1116]">
                <AvatarFallback className="bg-[#4EA1FF] text-[10px] font-bold text-white">LN</AvatarFallback>
              </Avatar>
              <Avatar className="size-7 border-2 border-[#0E1116]">
                <AvatarFallback className="bg-[#4EA1FF] text-[10px] font-bold text-white">DP</AvatarFallback>
              </Avatar>
              <div className="size-7 rounded-full border-2 border-[#0E1116] bg-[#141A22] flex items-center justify-center text-[10px] font-bold text-muted-foreground z-10">
                +5
              </div>
            </div>
            <button type="button" onClick={onInviteParticipants} className="flex items-center gap-2 text-xs font-semibold text-white bg-[#141A22] border border-[#28313C] hover:border-primary/50 hover:bg-[#28313C] transition-colors rounded-lg px-3 py-1.5">
              <Users className="size-3.5 text-muted-foreground" />
              Invite
            </button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger aria-label="Open channel actions" className="text-muted-foreground hover:text-white transition-colors size-8 flex items-center justify-center rounded-lg hover:bg-[#141A22] border border-transparent hover:border-[#28313C] outline-none">
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-[#0E1116] border-[#28313C] text-muted-foreground p-1">
              <DropdownMenuItem
                onClick={() => canAct ? onWorkflowStatusChange?.("Approved") : toast.error("Approving requires B2B workflow permission.")}
                className="text-xs hover:text-white cursor-pointer rounded-md focus:bg-white/5 focus:text-white"
              >
                <CheckCircle2 className="mr-2 size-3.5" /> Approve workflow
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => canAct ? onWorkflowStatusChange?.("Rejected") : toast.error("Rejecting requires B2B workflow permission.")}
                className="text-xs hover:text-white cursor-pointer rounded-md focus:bg-white/5 focus:text-white"
              >
                <AlertTriangle className="mr-2 size-3.5" /> Reject workflow
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => canAct ? onWorkflowStatusChange?.("Pending Approval") : toast.error("Reopening requires B2B workflow permission.")}
                className="text-xs hover:text-white cursor-pointer rounded-md focus:bg-white/5 focus:text-white"
              >
                <RotateCcw className="mr-2 size-3.5" /> Reopen approval
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#28313C] my-1" />
              <DropdownMenuItem onClick={onExportTranscript} className="text-xs hover:text-white cursor-pointer rounded-md focus:bg-white/5 focus:text-white">
                Export Conversation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenChannelSettings} className="text-xs hover:text-white cursor-pointer rounded-md focus:bg-white/5 focus:text-white">
                Channel Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onArchiveChannel} className="text-xs text-warning hover:text-warning cursor-pointer rounded-md focus:bg-warning/10 focus:text-warning">
                {isArchived ? "Restore Channel" : "Archive Channel"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDeleteChannel} className="text-xs text-critical hover:text-critical cursor-pointer rounded-md focus:bg-critical/10 focus:text-critical">
                Delete Channel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Bottom Bar: Compact Business Context Cards */}
      <div className="flex items-center px-6 py-3 border-t border-[#28313C] bg-[#080A0E]">
        
        <div className="flex gap-4 flex-1">
          {/* Your Company Card */}
          <div className="flex items-center gap-3 rounded-xl border border-[#28313C] bg-[#0E1116] px-4 py-2.5 min-w-[240px]">
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#4EA1FF]/10 border border-[#4EA1FF]/30 text-[#4EA1FF]">
              <Hexagon className="size-6 absolute opacity-50" />
              <span className="text-[12px] font-bold z-10">G</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Your Company</span>
              <span className="text-xs font-bold text-white leading-tight">Acme Corporation</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">Finance Lead</span>
            </div>
          </div>

          {/* Counterparty Card */}
          <div className="flex items-center gap-3 rounded-xl border border-[#28313C] bg-[#0E1116] px-4 py-2.5 min-w-[240px]">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-500">
              <Building2 className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Counterparty</span>
              <span className="text-xs font-bold text-white leading-tight">{counterparty}</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">Vendor</span>
            </div>
          </div>

          {/* Related Invoice Card */}
          <div className="flex items-center gap-3 rounded-xl border border-[#28313C] bg-[#0E1116] px-4 py-2.5 min-w-[240px]">
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#4EA1FF]/10 border border-[#4EA1FF]/30 text-[#4EA1FF]">
              <FileText className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Related Invoice</span>
              <span className="text-xs font-bold text-white leading-tight">INV-2025-0519</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">Total: $12,485.00</span>
            </div>
          </div>
        </div>

        <button type="button" onClick={() => onNavigate?.("data", { source: "b2b-bridge", evidenceId: "INV-2025-0519" })} className="flex items-center justify-center rounded-lg border border-[#28313C] bg-[#141A22] px-4 py-2 text-[11px] font-bold text-white hover:bg-[#28313C] transition-colors whitespace-nowrap ml-4">
          View details
        </button>

      </div>
    </div>
  );
}
