"use client";

import { useState } from "react";
import { Send, Settings, XCircle, FileWarning, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function ApprovalActions({ report, onApprove, onApproveAndConfigure, onRequestRevision, onReject, isMobile, canAct = true }) {
  const [busy, setBusy] = useState(false);
  const [actionLabel, setActionLabel] = useState("");

  const handleAction = async (actionFn, label) => {
    setBusy(true);
    setActionLabel(label);
    try {
      await actionFn();
    } finally {
      setBusy(false);
      setActionLabel("");
    }
  };

  const isStale = report?.dataStale || false;
  const isDisabled = !canAct || busy || report?.status === "Delegated" || report?.status === "Rejected" || isStale;

  return (
    <div className={cn(
      "border-[#28313C] bg-[#0E1116]/95 backdrop-blur-md z-30 flex items-center justify-between gap-3 transition-all",
      isMobile 
        ? "fixed bottom-0 left-0 right-0 p-4 border-t shadow-[0_-10px_40px_rgba(0,0,0,0.5)]" 
        : "sticky bottom-0 p-4 px-6 border-t mt-auto"
    )}>
      
      {/* Left side context (hidden on mobile) */}
      {!isMobile && (
        <div className="flex items-center gap-3 mr-auto">
          <div className="flex items-center gap-2">
            {isStale ? (
              <>
                <FileWarning className="size-3.5 text-critical" />
                <span className="text-[11px] font-semibold text-critical uppercase tracking-wider">Data Stale</span>
              </>
            ) : !canAct ? (
              <>
                <XCircle className="size-3.5 text-warning" />
                <span className="text-[11px] font-semibold text-warning uppercase tracking-wider">Decision Access Required</span>
              </>
            ) : (
              <>
                <div className="size-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">Data Verified</span>
              </>
            )}
          </div>
          <span className="text-muted-foreground text-[10px]">{isStale ? "3 hours ago" : "Just now"}</span>
        </div>
      )}

      {/* Primary Actions */}
      <div className={cn("flex items-center gap-3", isMobile && "w-full justify-between")}>
        {!isMobile && (
          <button 
            disabled={isDisabled}
            onClick={() => handleAction(onRequestRevision, "Requesting Revision...")}
            className="flex items-center gap-2 rounded-lg border border-[#28313C] bg-transparent px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-[#141A22] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileWarning className="size-3.5" /> Request Revision
          </button>
        )}

        <button 
          onClick={onApproveAndConfigure}
          disabled={isDisabled}
          className="flex items-center gap-2 rounded-lg border border-[#28313C] bg-[#141A22] px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-[#28313C] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Settings className="size-3.5" /> {canAct ? "Approve & Configure" : "Access required"}
        </button>

        <button
          onClick={() => handleAction(onApprove, "Approving...")}
          disabled={isDisabled}
          className="relative flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-xs font-bold text-black shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 overflow-hidden group"
        >
          {busy && actionLabel === "Approving..." ? (
            <span className="flex items-center gap-2">
              <div className="size-3.5 rounded-full border-2 border-black/20 border-t-black animate-spin" />
              Approving...
            </span>
          ) : (
            <>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              {isStale ? <FileWarning className="size-3.5 relative z-10" /> : <Send className="size-3.5 relative z-10" />} 
              <span className="relative z-10">{!canAct ? "Decision access required" : isStale ? "Approval Blocked" : "Approve Recommendation"}</span>
            </>
          )}
        </button>
      </div>

      {/* Reject is often hidden in a menu, but we'll show it as a subtle link or icon for desktop */}
      {!isMobile && (
        <button 
          disabled={isDisabled}
          onClick={() => handleAction(onReject, "Rejecting...")}
          className="ml-2 p-2.5 rounded-lg text-muted-foreground hover:text-critical hover:bg-critical/10 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          title="Reject"
        >
          <XCircle className="size-4" />
        </button>
      )}
    </div>
  );
}
