"use client";

import { useMemo, useState } from "react";
import { Bell, Clock, Mail, Monitor, Settings, Smartphone, TerminalSquare } from "lucide-react";
import { toast } from "sonner";
import { Card, Toggle } from "../shared";

const DEFAULT_NOTIFICATIONS = {
  channels: { email: true, inapp: true, sms: false, slack: false },
  categories: {
    urgentApprovals: true,
    agentFailures: true,
    guardrailBlocks: true,
    securityEvents: true,
    dailyDigest: true,
    immediateOverrides: true,
  },
  quietHours: { start: "22:00", end: "07:00" },
};

function mergeNotifications(preferences = {}) {
  return {
    channels: { ...DEFAULT_NOTIFICATIONS.channels, ...(preferences.channels || {}) },
    categories: { ...DEFAULT_NOTIFICATIONS.categories, ...(preferences.categories || {}) },
    quietHours: { ...DEFAULT_NOTIFICATIONS.quietHours, ...(preferences.quietHours || {}) },
  };
}

export default function NotificationsTab({ preferences, onSave, busy }) {
  const saved = useMemo(() => mergeNotifications(preferences), [preferences]);
  const [optimistic, setOptimistic] = useState(null);
  const draft = optimistic || saved;

  const commit = async (next) => {
    setOptimistic(next);
    try {
      await onSave?.(next);
      setOptimistic(null);
      toast.success("Notification preferences saved");
    } catch (error) {
      setOptimistic(null);
      toast.error(error.message || "Notification preferences could not be saved.");
    }
  };

  const updateChannel = (key, value) => {
    commit({ ...draft, channels: { ...draft.channels, [key]: value } });
  };

  const updateCategory = (key, value) => {
    commit({ ...draft, categories: { ...draft.categories, [key]: value } });
  };

  const updateQuietHours = (key, value) => {
    commit({ ...draft, quietHours: { ...draft.quietHours, [key]: value } });
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[20px] font-semibold text-white tracking-tight">Notifications</h2>
      </div>

      <Card title="Delivery Channels" icon={Bell} description="Configure where GENIUS should route important alerts when providers are connected.">
        <div className="flex flex-col gap-4">
          <ChannelRow icon={Mail} title="Email" subtitle="Workspace email delivery setting" checked={draft.channels.email} disabled={busy} onChange={(value) => updateChannel("email", value)} />
          <ChannelRow icon={Monitor} title="In-app" subtitle="Real-time application notifications" checked={draft.channels.inapp} disabled={busy} onChange={(value) => updateChannel("inapp", value)} />
          <ChannelRow icon={Smartphone} title="SMS" subtitle="Delivery locked until SMS provider is connected" checked={draft.channels.sms} disabled={busy} onChange={(value) => updateChannel("sms", value)} />
          <ChannelRow icon={TerminalSquare} title="Slack / Teams" subtitle="Delivery locked until collaboration provider is connected" checked={draft.channels.slack} disabled={busy} onChange={(value) => updateChannel("slack", value)} />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Event Categories" icon={Settings} description="Select which events trigger notifications.">
          <div className="flex flex-col gap-5">
            <CategoryRow title="Urgent approvals" desc="Contracts and critical budget limits." checked={draft.categories.urgentApprovals} disabled={busy} onChange={(value) => updateCategory("urgentApprovals", value)} />
            <CategoryRow title="Agent failures" desc="When an agent encounters a fatal error." checked={draft.categories.agentFailures} disabled={busy} onChange={(value) => updateCategory("agentFailures", value)} />
            <CategoryRow title="Guardrail blocks" desc="When actions are blocked by compliance." checked={draft.categories.guardrailBlocks} disabled={busy} onChange={(value) => updateCategory("guardrailBlocks", value)} />
            <CategoryRow title="Security events" desc="New sessions and sensitive workspace changes." checked={draft.categories.securityEvents} disabled={busy} onChange={(value) => updateCategory("securityEvents", value)} />
          </div>
        </Card>

        <Card title="Schedule & Quiet Hours" icon={Clock} description="Control when notifications are delivered.">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5 pb-5 border-b border-[#28313C]/50">
              <span className="text-[13px] font-semibold text-white">Quiet hours</span>
              <p className="text-[12px] text-muted-foreground mb-3">Pause non-urgent notifications during this window.</p>
              <div className="flex items-center gap-3">
                <input type="time" value={draft.quietHours.start} disabled={busy} onChange={(event) => updateQuietHours("start", event.target.value)} className="bg-[#141A22] border border-[#28313C] rounded-md px-3 py-1.5 text-[13px] text-white disabled:opacity-50" />
                <span className="text-muted-foreground">to</span>
                <input type="time" value={draft.quietHours.end} disabled={busy} onChange={(event) => updateQuietHours("end", event.target.value)} className="bg-[#141A22] border border-[#28313C] rounded-md px-3 py-1.5 text-[13px] text-white disabled:opacity-50" />
              </div>
            </div>

            <CategoryRow title="Daily digest" desc="Receive a summary instead of individual alerts." checked={draft.categories.dailyDigest} disabled={busy} onChange={(value) => updateCategory("dailyDigest", value)} />
            <CategoryRow title="Immediate overrides" desc="Allow urgent approvals to bypass quiet hours." checked={draft.categories.immediateOverrides} disabled={busy} onChange={(value) => updateCategory("immediateOverrides", value)} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function ChannelRow({ icon: Icon, title, subtitle, checked, disabled, onChange }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#28313C]/30 last:border-0 last:pb-0">
      <div className="flex items-center gap-4">
        <div className="size-10 rounded-full bg-[#141A22] border border-[#28313C] flex items-center justify-center shrink-0">
          <Icon className="size-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] font-medium text-white">{title}</span>
          <span className="text-[12px] text-muted-foreground">{subtitle}</span>
        </div>
      </div>
      <Toggle checked={checked} disabled={disabled} onChange={onChange} />
    </div>
  );
}

function CategoryRow({ title, desc, checked, disabled, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col mr-4">
        <span className="text-[13px] font-medium text-white/90">{title}</span>
        <span className="text-[11px] text-muted-foreground">{desc}</span>
      </div>
      <Toggle checked={checked} disabled={disabled} onChange={onChange} />
    </div>
  );
}
