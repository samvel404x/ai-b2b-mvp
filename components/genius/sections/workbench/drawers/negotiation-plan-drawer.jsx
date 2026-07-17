"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { workbenchMockData } from "../workbench-mock-data";

const defaultObjectives = `1. Right-size M365 licenses based on usage data.
2. Eliminate overlapping Power BI Pro seats.
3. Negotiate Azure committed use discount for a 15% reduction.`;

export function NegotiationPlanDrawer({ open, onOpenChange, onNavigate, onSaveArtifact, canSaveArtifacts = true, busy = false }) {
  const [isSaving, setIsSaving] = useState(false);
  const [planName, setPlanName] = useState("Microsoft EA Renewal Strategy Q3");
  const [objectives, setObjectives] = useState(defaultObjectives);
  const [deadline, setDeadline] = useState("2026-08-15");

  const selectedRecommendations = workbenchMockData.recommendations.slice(0, 3).map((item, index) => ({
    id: `negotiation-rec-${index + 1}`,
    title: item.title,
    impact: item.impact,
    selected: true,
  }));

  const savePlan = async (status) => {
    if (!canSaveArtifacts) {
      toast.error("Saving Workbench artifacts requires ask AI permission.");
      return null;
    }
    if (!onSaveArtifact) {
      toast.error("Workbench artifact persistence is not connected.");
      return null;
    }

    setIsSaving(true);
    try {
      const result = await onSaveArtifact({
        type: "negotiation_plan",
        title: planName,
        content: objectives,
        status,
        metrics: {
          expectedSavings: 1_540_000,
          riskExposure: 2_480_000,
          confidence: 91,
        },
        recommendations: selectedRecommendations,
        metadata: {
          deadline,
          targetVendor: "Microsoft",
          approvalRequired: status !== "draft",
        },
      });
      return result;
    } catch (error) {
      toast.error(error.message || "Negotiation plan could not be saved.");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    const result = await savePlan("needs_review");
    if (!result) return;

    const action = (result.workspace?.actions || []).find((item) => item.artifactId === result.artifact?.id);
    onOpenChange(false);
    toast.success("Negotiation plan created and sent to Approvals.");
    onNavigate?.("approvals", { actionId: action?.id, artifactId: result.artifact?.id, source: "ai-workbench-plan" });
  };

  const handleSaveDraft = async () => {
    const result = await savePlan("draft");
    if (result) toast.success("Negotiation plan draft saved to Workbench artifacts.");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] bg-[#0E1116] border-l-[#28313C] text-white p-0 flex flex-col">
        <div className="p-6 border-b border-[#28313C]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              Create Negotiation Plan
            </SheetTitle>
            <SheetDescription className="text-muted-foreground text-xs mt-1">
              Configure a structured plan to negotiate the Microsoft EA renewal based on AI recommendations.
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-6 flex flex-col gap-6">
          <div className="grid gap-2">
            <Label className="text-xs">Plan Name</Label>
            <Input value={planName} onChange={(event) => setPlanName(event.target.value)} className="bg-[#141A22] border-[#28313C] text-sm" />
          </div>

          <div className="grid gap-2">
            <Label className="text-xs">Primary Objectives</Label>
            <Textarea 
              value={objectives}
              onChange={(event) => setObjectives(event.target.value)}
              className="bg-[#141A22] border-[#28313C] text-sm h-24" 
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs">Selected AI Recommendations</Label>
            <div className="rounded border border-[#28313C] bg-[#141A22] overflow-hidden">
              <div className="flex items-center gap-3 p-3 border-b border-[#28313C]/50">
                <Checkbox id="rec1" defaultChecked />
                <Label htmlFor="rec1" className="text-xs font-normal cursor-pointer flex-1">Right-size M365 licenses</Label>
                <span className="text-xs text-evidence font-medium">$750K</span>
              </div>
              <div className="flex items-center gap-3 p-3 border-b border-[#28313C]/50">
                <Checkbox id="rec2" defaultChecked />
                <Label htmlFor="rec2" className="text-xs font-normal cursor-pointer flex-1">Negotiate Azure committed use discount</Label>
                <span className="text-xs text-evidence font-medium">$480K</span>
              </div>
              <div className="flex items-center gap-3 p-3">
                <Checkbox id="rec3" defaultChecked />
                <Label htmlFor="rec3" className="text-xs font-normal cursor-pointer flex-1">Remove unused Power BI seats</Label>
                <span className="text-xs text-evidence font-medium">$310K</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1 px-1">
              <span className="text-xs text-muted-foreground">Target Savings:</span>
              <span className="text-sm font-bold text-evidence">$1.54M</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-xs">Owner</Label>
              <div className="flex items-center gap-2 rounded border border-[#28313C] bg-[#141A22] p-2">
                <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary font-bold">AR</div>
                <span className="text-xs text-white">Alex Rivera</span>
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">Deadline</Label>
              <Input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} className="bg-[#141A22] border-[#28313C] text-sm text-white [color-scheme:dark]" />
            </div>
          </div>

          <div className="flex flex-col gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-2">
              <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-white">Approval Required</span>
                <span className="text-[10px] text-muted-foreground">
                  This plan targets &gt;$1M in savings and requires Director-level approval before execution.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[#28313C] bg-[#0E1116]">
          <SheetFooter className="flex w-full items-center sm:justify-between">
            <Button variant="ghost" className="text-muted-foreground hover:text-white text-xs" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={isSaving || busy} className="border-[#28313C] bg-[#141A22] text-white hover:bg-[#28313C] text-xs">
                Save as Draft
              </Button>
              <Button onClick={handleSave} disabled={isSaving || busy} className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs min-w-[140px]">
                {isSaving ? "Saving..." : "Create & Request Approval"}
              </Button>
            </div>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
