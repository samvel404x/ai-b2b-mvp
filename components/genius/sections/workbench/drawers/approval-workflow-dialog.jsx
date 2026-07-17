"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShieldCheck, UserCheck, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ApprovalWorkflowDialog({ open, onOpenChange, data, onNavigate, onSaveArtifact, canSaveArtifacts = true, busy = false }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [extraApprovers, setExtraApprovers] = useState([]);
  const defaultData = data || {
    action: "Consolidate Microsoft EA & Azure Commit",
    impact: "$1.37M",
    riskLevel: "Medium",
    deadline: "2026-06-25",
    approvers: ["Sarah Connor (VP Finance)", "John Smith (IT Director)"]
  };
  const [note, setNote] = useState(`Based on the GENIUS AI analysis of our Q4 telemetry, right-sizing the M365 and Azure commit will yield ${defaultData.impact} in savings.`);

  const handleSubmit = async () => {
    if (!canSaveArtifacts) {
      toast.error("Starting Workbench approvals requires ask AI permission.");
      return;
    }
    if (!onSaveArtifact) {
      toast.error("Workbench artifact persistence is not connected.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onSaveArtifact({
        type: "approval_workflow",
        title: defaultData.action,
        content: note,
        status: "needs_review",
        metrics: {
          expectedSavings: 1_370_000,
          riskExposure: 2_480_000,
          confidence: 89,
        },
        recommendations: approvers.map((approver, index) => ({
          id: `approver-${index + 1}`,
          title: approver,
          detail: index === 0 ? "Primary approver" : "Sequential approver",
          impact: defaultData.impact,
          selected: true,
        })),
        metadata: {
          deadline: defaultData.deadline,
          riskLevel: defaultData.riskLevel,
          approvers,
        },
      });
      const action = (result.workspace?.actions || []).find((item) => item.artifactId === result.artifact?.id);
      setIsSubmitting(false);
      setExtraApprovers([]);
      onOpenChange(false);
      toast.success("Approval workflow sent to Approvals.");
      onNavigate?.("approvals", { actionId: action?.id, artifactId: result.artifact?.id, source: "ai-workbench-approval" });
    } catch (error) {
      setIsSubmitting(false);
      toast.error(error.message || "Approval workflow could not be started.");
    }
  };
  const approvers = [...defaultData.approvers, ...extraApprovers];

  const handleAddApprover = () => {
    const index = extraApprovers.length + 1;
    setExtraApprovers((current) => [...current, `Additional approver ${index} (Pending assignment)`]);
    toast.success("Approver placeholder added.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-[#0E1116] border-[#28313C] text-white">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex size-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <DialogTitle>Start Approval Workflow</DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs mt-1">
                Request authorization before executing this action.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="rounded-lg border border-[#28313C] bg-[#141A22] p-4 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Proposed Action</span>
                <span className="text-sm font-semibold text-white">{defaultData.action}</span>
              </div>
              <div className="flex flex-col gap-1 text-right">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Financial Impact</span>
                <span className="text-sm font-bold text-primary">{defaultData.impact}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Risk Level</span>
                <div className="flex items-center gap-1.5 text-warning">
                  <AlertTriangle className="size-3.5" />
                  <span className="text-xs font-semibold">{defaultData.riskLevel}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-right">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Target Execution</span>
                <span className="text-xs text-white">{defaultData.deadline}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-xs">Required Approvers (Sequential)</Label>
            <div className="flex flex-col gap-2">
              {approvers.map((approver, index) => (
                <div key={index} className="flex items-center gap-3 rounded border border-[#28313C] bg-[#141A22] px-3 py-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-[#28313C] text-[10px] font-bold text-muted-foreground">
                    {index + 1}
                  </span>
                  <UserCheck className="size-4 text-muted-foreground" />
                  <span className="text-xs text-white flex-1">{approver}</span>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={handleAddApprover} className="w-full border-dashed border-[#28313C] bg-transparent text-xs text-muted-foreground hover:text-white hover:bg-[#141A22] mt-1">
                + Add Approver
              </Button>
            </div>
          </div>

          <div className="grid gap-2 mt-2">
            <Label className="text-xs">Justification / Notes</Label>
            <Textarea
              placeholder="Add additional context for the approvers..."
              className="bg-[#141A22] border-[#28313C] text-sm resize-none h-20"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="border-t border-[#28313C] pt-4 mt-2">
          <Button variant="ghost" className="text-muted-foreground hover:text-white text-xs" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || busy} className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs min-w-[140px]">
            {isSubmitting ? "Submitting..." : "Send to Approval"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
