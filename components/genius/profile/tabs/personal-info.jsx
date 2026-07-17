"use client";

import { useState } from "react";
import { Edit2, Globe, User } from "lucide-react";
import { toast } from "sonner";
import { Card } from "../shared";
import { Button } from "@/components/ui/button";

export default function PersonalInfoTab({ profile, workspace, session, onUpdateProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({ ...profile });
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges = JSON.stringify(profile) !== JSON.stringify(draft);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateProfile(draft);
      setIsEditing(false);
      toast.success("Personal information updated");
    } catch (error) {
      toast.error(error.message || "Personal information could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft({ ...profile });
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-semibold text-white tracking-tight">Personal Information</h2>
        {!isEditing && (
          <Button onClick={() => { setDraft({ ...profile }); setIsEditing(true); }} variant="outline" className="h-9 bg-transparent border-[#28313C] text-muted-foreground hover:text-white">
            <Edit2 className="size-3.5 mr-2" /> Edit information
          </Button>
        )}
      </div>

      <Card title="Identity & Organization" icon={User}>
        <div className="flex flex-col divide-y divide-[#28313C]/50 -mx-6 px-6">
          <InfoRow label="Display Name" value={profile.displayName} field="displayName" isEditing={isEditing} draft={draft} setDraft={setDraft} />
          <InfoRow label="Job Title" value={profile.role} field="role" isEditing={isEditing} draft={draft} setDraft={setDraft} />
          <InfoRow label="Email Address" value={profile.email} readOnly />
          <InfoRow label="Workspace" value={workspace?.workspaceName || workspace?.name || "GENIUS Workspace"} readOnly />
          <InfoRow label="Access Role" value={session?.role || workspace?.role || "Member"} readOnly />
        </div>
      </Card>

      <Card title="Localization & Formatting" icon={Globe}>
        <div className="flex flex-col divide-y divide-[#28313C]/50 -mx-6 px-6">
          <InfoRow label="Timezone" value={profile.timezone} field="timezone" isEditing={isEditing} draft={draft} setDraft={setDraft} type="select" options={["America/New_York (EST)", "UTC", "Europe/London (GMT)"]} />
          <InfoRow label="Date Format" value={profile.dateFormat} field="dateFormat" isEditing={isEditing} draft={draft} setDraft={setDraft} type="select" options={["Jun 26, 2024, 11:45 AM", "26 Jun 2024, 11:45", "YYYY-MM-DD HH:mm"]} />
          <InfoRow label="Preferred Currency" value={profile.currency} field="currency" isEditing={isEditing} draft={draft} setDraft={setDraft} type="select" options={["USD - US Dollar", "EUR - Euro", "GBP - British Pound"]} />
        </div>
      </Card>

      {isEditing && (
        <div className="sticky bottom-6 z-50 mt-4 flex items-center justify-between p-4 bg-[#0E1116] border border-[#28313C] rounded-xl shadow-2xl animate-slide-up">
          <span className="text-[13px] text-muted-foreground ml-2">
            {hasChanges ? "You have unsaved changes." : "Modify your details to save."}
          </span>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={handleCancel} disabled={isSaving} className="text-muted-foreground hover:text-white hover:bg-[#28313C]">Cancel</Button>
            <Button onClick={handleSave} disabled={!hasChanges || isSaving} className="bg-primary text-[#FFFFFF] hover:bg-primary/90 font-semibold px-6 active:scale-[0.98]">
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, field, isEditing, draft, setDraft, type = "text", options = [], readOnly }) {
  const isEditable = isEditing && !readOnly && field;

  return (
    <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 group">
      <span className="text-[14px] text-muted-foreground sm:w-1/3 shrink-0">{label}</span>
      <div className="flex-1 w-full max-w-md">
        {isEditable ? (
          type === "select" ? (
            <select
              value={draft[field] || ""}
              onChange={(event) => setDraft((current) => ({ ...current, [field]: event.target.value }))}
              className="w-full bg-[#141A22] border border-[#28313C] rounded-md px-3 py-2 text-[14px] text-white focus:outline-none focus:border-primary transition-colors appearance-none"
            >
              {options.map((option) => <option key={option}>{option}</option>)}
            </select>
          ) : (
            <input
              type={type}
              value={draft[field] || ""}
              onChange={(event) => setDraft((current) => ({ ...current, [field]: event.target.value }))}
              className="w-full bg-[#141A22] border border-[#28313C] rounded-md px-3 py-2 text-[14px] text-white focus:outline-none focus:border-primary transition-colors"
            />
          )
        ) : (
          <span className="text-[14px] font-medium text-white">{value || "Not set"}</span>
        )}
      </div>
    </div>
  );
}
