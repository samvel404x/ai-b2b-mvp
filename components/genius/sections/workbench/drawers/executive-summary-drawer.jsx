"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { workbenchMockData } from "../workbench-mock-data";

const defaultSummary = `Executive Summary

Our analysis of the Microsoft Enterprise Agreement renewal quote ($3.42M) reveals a 23% premium over current market benchmarks. The primary drivers for this risk exposure are overlapping SaaS licenses, unused capacity across Power BI and M365, and unfavorable price escalators.

By implementing a structured right-sizing initiative prior to negotiation, we can realize a potential annual savings of $1.37M.

Key Findings:
- Overlapping Licenses: $1.05M (42% of total risk)
- Unused Capacity: $750K (30% of total risk)
- Price Escalators: $420K (17% of total risk)

Recommendation:
Initiate aggressive renegotiation starting Q3. Consolidate vendor overlap and demand removal of automatic 5% YoY price escalators. Director approval is required to proceed with the execution plan.`;

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ExecutiveSummaryDrawer({ open, onOpenChange, onNavigate, onSaveArtifact, canSaveArtifacts = true, busy = false }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [audience, setAudience] = useState("c-level");
  const [tone, setTone] = useState("direct");
  const [title, setTitle] = useState("Microsoft EA Renewal Risk Assessment");
  const [summary, setSummary] = useState(defaultSummary);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setSummary(defaultSummary);
      setIsGenerating(false);
      toast.success("Executive summary updated successfully.");
    }, 1500);
  };

  const handleDownload = () => {
    downloadTextFile("genius-executive-summary.md", summary);
    toast.success("Executive summary downloaded");
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      toast.success("Executive summary copied for sharing");
    } catch {
      toast.info("Clipboard is unavailable in this browser session.");
    }
  };

  const handleSaveArtifact = async () => {
    if (!canSaveArtifacts) {
      toast.error("Saving Workbench artifacts requires ask AI permission.");
      return;
    }
    if (!onSaveArtifact) {
      toast.error("Workbench artifact persistence is not connected.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await onSaveArtifact({
        type: "executive_summary",
        title,
        content: summary,
        status: "saved",
        metrics: {
          expectedSavings: 1_370_000,
          riskExposure: 3_420_000,
          confidence: workbenchMockData.kpis.aiConfidence,
        },
        recommendations: workbenchMockData.recommendations.map((item, index) => ({
          id: `summary-rec-${index + 1}`,
          title: item.title,
          detail: item.detail || "",
          impact: item.impact,
          selected: true,
        })),
        metadata: { audience, tone },
      });
      toast.success("Executive summary saved to Reports.");
      onOpenChange(false);
      const reportId = result?.artifact?.id ? `report-${result.artifact.id}` : undefined;
      onNavigate?.("reports", { reportId, source: "ai-workbench-summary" });
    } catch (error) {
      toast.error(error.message || "Executive summary could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[600px] bg-[#0E1116] border-l-[#28313C] text-white p-0 flex flex-col">
        <div className="p-6 border-b border-[#28313C] flex items-center justify-between">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              Draft Executive Summary
            </SheetTitle>
            <SheetDescription className="text-muted-foreground text-xs mt-1">
              Configure and edit an artifact for executive stakeholders.
            </SheetDescription>
          </SheetHeader>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="icon" onClick={handleDownload} className="size-8 border-[#28313C] bg-[#141A22] text-muted-foreground hover:text-white">
              <Download className="size-3.5" />
            </Button>
            <Button type="button" variant="outline" size="icon" onClick={handleShare} className="size-8 border-[#28313C] bg-[#141A22] text-muted-foreground hover:text-white">
              <Share2 className="size-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin flex flex-col">
          {/* Editor Configuration */}
          <div className="p-6 border-b border-[#28313C] grid grid-cols-2 gap-4 bg-[#141A22]/50">
            <div className="grid gap-2">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger className="bg-[#141A22] border-[#28313C] text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#141A22] border-[#28313C] text-white">
                  <SelectItem value="c-level">C-Level Executives</SelectItem>
                  <SelectItem value="board">Board of Directors</SelectItem>
                  <SelectItem value="procurement">Procurement Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="bg-[#141A22] border-[#28313C] text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#141A22] border-[#28313C] text-white">
                  <SelectItem value="direct">Direct & Actionable</SelectItem>
                  <SelectItem value="analytical">Analytical & Detailed</SelectItem>
                  <SelectItem value="persuasive">Persuasive (Negotiation)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 flex justify-end">
              <Button onClick={handleGenerate} disabled={isGenerating || busy} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-8">
                {isGenerating ? "Regenerating..." : "Regenerate with AI"}
              </Button>
            </div>
          </div>

          {/* Editable Document */}
          <div className="flex-1 p-6 flex flex-col gap-4">
            <Input 
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="text-lg font-bold bg-transparent border-0 px-0 h-10 focus-visible:ring-0 text-white placeholder-muted-foreground"
            />
            <Textarea
              className="flex-1 min-h-[300px] resize-none bg-transparent border-0 px-0 focus-visible:ring-0 text-sm text-white/90 leading-relaxed shadow-none"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
            />
          </div>
        </div>

        <div className="p-6 border-t border-[#28313C] bg-[#0E1116]">
          <SheetFooter className="flex w-full items-center sm:justify-between">
            <span className="text-xs text-muted-foreground">Last saved: Just now</span>
            <div className="flex gap-2">
              <Button variant="ghost" className="text-muted-foreground hover:text-white text-xs" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button type="button" onClick={handleSaveArtifact} disabled={isSaving || busy} className="bg-[#28313C] text-white hover:bg-[#28313C] text-xs">
                {isSaving ? "Saving..." : "Save to Artifacts"}
              </Button>
            </div>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
