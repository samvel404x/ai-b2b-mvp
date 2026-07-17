"use client";

import { useState } from "react";
import { BrainCircuit, Check, ShieldAlert, SlidersHorizontal, Zap } from "lucide-react";
import { toast } from "sonner";
import { Card } from "../shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TONES = [
  { id: "Strict / Analytical", label: "Strict / Analytical", desc: "Data-first, direct, evidence-heavy.", example: "The projection is unsupported because source confidence is 61%." },
  { id: "Concise", label: "Concise", desc: "Brief, to the point.", example: "Projection rejected; 61% confidence." },
  { id: "Detailed", label: "Detailed", desc: "In-depth, comprehensive.", example: "The projection appears promising, but source confidence is only 61%, so human review is required." },
];

const LIMITS = ["$1K", "$5K", "$25K", "$50K", "Custom"];

export default function AIPreferencesTab({ profile, onUpdateProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({ ...profile });
  const [isSaving, setIsSaving] = useState(false);

  const activeProfile = isEditing ? draft : profile;
  const hasChanges = JSON.stringify(profile) !== JSON.stringify(draft);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateProfile(draft);
      setIsEditing(false);
      toast.success("AI preferences updated");
    } catch (error) {
      toast.error(error.message || "AI preferences could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-semibold text-white tracking-tight">AI Preferences</h2>
        {!isEditing && (
          <Button onClick={() => { setDraft({ ...profile }); setIsEditing(true); }} variant="outline" className="h-9 bg-transparent border-[#28313C] text-muted-foreground hover:text-white">
            <SlidersHorizontal className="size-3.5 mr-2" /> Configure AI
          </Button>
        )}
      </div>

      <Card title="Communication Style" icon={BrainCircuit} description="Adjust how GENIUS agents communicate with you.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TONES.map((tone) => {
            const isSelected = activeProfile.tone === tone.id;
            return (
              <button
                key={tone.id}
                onClick={() => isEditing && setDraft((current) => ({ ...current, tone: tone.id }))}
                disabled={!isEditing}
                className={cn(
                  "flex flex-col text-left p-4 rounded-xl border transition-all duration-200",
                  isSelected ? "bg-primary/5 border-primary shadow-[0_0_20px_-5px_rgba(78,161,255,0.2)]" : "bg-transparent border-[#28313C]",
                  isEditing && !isSelected ? "hover:border-[#28313C] hover:bg-white/[0.02]" : "",
                  !isEditing && "opacity-80 cursor-default",
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn("text-[14px] font-bold", isSelected ? "text-primary" : "text-white")}>{tone.label}</span>
                  <div className={cn("size-4 rounded-full border flex items-center justify-center shrink-0 transition-colors", isSelected ? "border-primary bg-primary" : "border-muted-foreground")}>
                    {isSelected && <Check className="size-2.5 text-[#0E1116]" strokeWidth={3} />}
                  </div>
                </div>
                <p className="text-[12px] text-muted-foreground mb-3 leading-snug">{tone.desc}</p>
                <div className="mt-auto pt-3 border-t border-[#28313C]/50">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Example</span>
                  <p className="text-[11px] text-white/70 italic leading-snug">&quot;{tone.example}&quot;</p>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card title="Confidence & Human Review" icon={ShieldAlert} description="GENIUS will request human approval whenever confidence is below this threshold.">
        <div className="flex flex-col pt-6 pb-2 w-full max-w-2xl px-2">
          <div className="flex justify-between items-end mb-4">
            <span className="text-[14px] font-medium text-white">Confidence Threshold</span>
            <span className="text-[20px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
              {activeProfile.confidenceThreshold}%
            </span>
          </div>

          <div className="relative h-2 bg-[#28313C] rounded-full w-full">
            <div className="absolute h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${activeProfile.confidenceThreshold}%` }} />
            <input
              type="range"
              min="0"
              max="100"
              value={activeProfile.confidenceThreshold}
              onChange={(event) => isEditing && setDraft((current) => ({ ...current, confidenceThreshold: Number.parseInt(event.target.value, 10) }))}
              disabled={!isEditing}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-default"
            />
            <div className="absolute size-4 bg-white rounded-full top-1/2 -translate-y-1/2 shadow-lg transition-all duration-300 pointer-events-none border-2 border-primary" style={{ left: `calc(${activeProfile.confidenceThreshold}% - 8px)` }} />
          </div>

          <div className="flex items-center justify-between mt-3 text-[11px] text-muted-foreground font-semibold uppercase tracking-widest">
            <span className="text-warning">Low (Higher Risk)</span>
            <span>Balanced</span>
            <span className="text-primary">Strict (More Reviews)</span>
          </div>
        </div>
      </Card>

      <Card title="Personal Delegation" icon={Zap} description="Control the maximum financial value agents can auto-approve on your behalf.">
        <div className="flex flex-col gap-6 max-w-2xl">
          <div className="flex items-center p-1.5 bg-[#0E1116] rounded-xl border border-[#28313C]">
            {LIMITS.map((value) => {
              const isSelected = activeProfile.autoApprovalLimit === value;
              return (
                <button
                  key={value}
                  onClick={() => isEditing && setDraft((current) => ({ ...current, autoApprovalLimit: value }))}
                  disabled={!isEditing}
                  className={cn(
                    "flex-1 py-2 text-[13px] font-bold rounded-lg transition-all",
                    isSelected ? "bg-primary text-[#0E1116] shadow-md" : "text-muted-foreground",
                    isEditing && !isSelected ? "hover:text-white hover:bg-white/5" : "",
                    !isEditing && !isSelected ? "opacity-50" : "",
                  )}
                >
                  {value}
                </button>
              );
            })}
          </div>
          <div className="bg-[#28313C]/30 rounded-lg p-4 border border-[#28313C] text-[13px] text-muted-foreground flex gap-3">
            <ShieldAlert className="size-5 shrink-0 text-primary" />
            <p>
              Transactions up to <strong className="text-white">{activeProfile.autoApprovalLimit}</strong> can be proposed by AI agents. Final external execution still stays behind workspace approval policies.
            </p>
          </div>
        </div>
      </Card>

      {isEditing && (
        <div className="sticky bottom-6 z-50 mt-4 flex items-center justify-between p-4 bg-[#0E1116] border border-[#28313C] rounded-xl shadow-2xl animate-slide-up">
          <span className="text-[13px] text-muted-foreground ml-2">
            {hasChanges ? "You have unsaved AI preference changes." : "Modify your AI settings to save."}
          </span>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => { setDraft({ ...profile }); setIsEditing(false); }} disabled={isSaving} className="text-muted-foreground hover:text-white hover:bg-[#28313C]">Cancel</Button>
            <Button onClick={handleSave} disabled={!hasChanges || isSaving} className="bg-primary text-[#FFFFFF] hover:bg-primary/90 font-semibold px-6 active:scale-[0.98]">
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
