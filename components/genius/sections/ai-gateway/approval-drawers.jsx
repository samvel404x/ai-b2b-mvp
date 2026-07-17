"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Users, Briefcase, Bell, CheckCircle2, FileWarning } from "lucide-react";
import { cn } from "@/lib/utils";

export function ConfigureDrawer({ open, onOpenChange, onConfirm }) {
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] bg-[#0E1116] border-[#28313C] text-white p-0 flex flex-col sm:max-w-md">
        <SheetHeader className="border-b border-[#28313C] p-6">
          <SheetTitle className="text-white flex items-center gap-2">
            <Settings className="size-4 text-primary" /> Approve & Configure
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Configure execution parameters before finalizing the decision.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-widest">Execution Target</h4>
            <div className="flex flex-col gap-2">
              <label className="flex items-center justify-between p-3 rounded-lg border border-primary/30 bg-primary/5 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="size-4 rounded-full border-4 border-primary bg-[#0E1116]" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">AI Automation Agent</span>
                    <span className="text-xs text-muted-foreground">Executes immediately via API</span>
                  </div>
                </div>
              </label>
              <label className="flex items-center justify-between p-3 rounded-lg border border-[#28313C] bg-[#141A22] opacity-60 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <div className="size-4 rounded-full border border-muted-foreground bg-transparent" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">Human Procurement Team</span>
                    <span className="text-xs text-muted-foreground">Adds to team backlog (Unavailable)</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-widest">Stakeholders</h4>
            <div className="rounded-lg border border-[#28313C] bg-[#141A22] p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-white">
                  <Users className="size-4 text-muted-foreground" /> Notify Operations Team
                </div>
                <div className="h-4 w-7 rounded-full bg-primary relative cursor-pointer shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                  <div className="absolute right-0.5 top-0.5 size-3 rounded-full bg-black" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-white">
                  <Briefcase className="size-4 text-muted-foreground" /> Update Finance Ledger
                </div>
                <div className="h-4 w-7 rounded-full bg-primary relative cursor-pointer shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                  <div className="absolute right-0.5 top-0.5 size-3 rounded-full bg-black" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-white">
                  <Bell className="size-4 text-muted-foreground" /> Slack Announcement
                </div>
                <div className="h-4 w-7 rounded-full bg-[#28313C] relative cursor-pointer">
                  <div className="absolute left-0.5 top-0.5 size-3 rounded-full bg-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="border-t border-[#28313C] p-6 bg-[#0E1116]">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-white hover:bg-[#141A22]">
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={busy} className="bg-primary text-black hover:bg-primary/90 font-bold w-full">
            {busy ? "Executing..." : "Confirm & Execute"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function RevisionDrawer({ open, onOpenChange, onConfirm }) {
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("");

  const handleConfirm = async () => {
    if (!reason.trim()) return;
    setBusy(true);
    try {
      await onConfirm(reason);
      onOpenChange(false);
      setReason("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] bg-[#0E1116] border-[#28313C] text-white p-0 flex flex-col sm:max-w-md">
        <SheetHeader className="border-b border-[#28313C] p-6">
          <SheetTitle className="text-white flex items-center gap-2">
            <FileWarning className="size-4 text-warning" /> Request Revision
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Return this decision to the AI agent or human owner for adjustments.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-widest">Reason for Revision</h4>
            <Textarea 
              placeholder="E.g. The proposed cost is too high, find an alternative supplier..." 
              className="bg-[#141A22] border-[#28313C] text-white min-h-[120px] focus-visible:ring-warning"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-widest">Target Specific Assumptions</h4>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-[#28313C] bg-[#141A22] cursor-pointer hover:border-warning/50">
                <input type="checkbox" className="rounded border-[#28313C] bg-[#0E1116] text-warning focus:ring-warning" />
                <span className="text-sm text-white">Demand forecast is overly optimistic</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-[#28313C] bg-[#141A22] cursor-pointer hover:border-warning/50">
                <input type="checkbox" className="rounded border-[#28313C] bg-[#0E1116] text-warning focus:ring-warning" />
                <span className="text-sm text-white">Budget allocation is incorrect</span>
              </label>
            </div>
          </div>
        </div>

        <SheetFooter className="border-t border-[#28313C] p-6 bg-[#0E1116]">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-white hover:bg-[#141A22]">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={busy || !reason.trim()} 
            className="bg-warning text-black hover:bg-warning/90 font-bold w-full disabled:opacity-50"
          >
            {busy ? "Sending..." : "Submit Request"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
