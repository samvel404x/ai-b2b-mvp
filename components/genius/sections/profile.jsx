"use client";

import {
  Edit2,
  Mail,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { workspace } from "@/lib/genius-data";
import { PageHeader, Panel } from "../shared";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const activity = [
  { id: "a1", text: "Approved vendor contract renewal for TechSoft Solutions", time: "14m ago", tone: "primary" },
  { id: "a2", text: "Reviewed evidence on Microsoft EA renewal benchmark", time: "2h ago", tone: "evidence" },
  { id: "a3", text: "Rejected aged receivable write-off for Acme Corp", time: "5h ago", tone: "critical" },
  { id: "a4", text: "Snoozed FX variance finding F-1028", time: "1d ago", tone: "warning" },
  { id: "a5", text: "Exported Q2 savings proof pack", time: "2d ago", tone: "primary" },
  { id: "a6", text: "Approved new vendor onboarding for CloudScale LLC", time: "3d ago", tone: "primary" },
];

const sessions = [
  { device: "Chrome on Windows", location: "New York, US", time: "Active now", current: true },
  { device: "Safari on iPhone", location: "New York, US", time: "2h ago", current: false },
];

const dotTone = {
  primary: "bg-primary",
  evidence: "bg-evidence",
  warning: "bg-warning",
  critical: "bg-critical",
};

export default function Profile({ label, onNavigate }) {
  const inputClasses = "bg-[#141B21] border border-[#1E2730] rounded-lg px-3 py-2 text-sm text-white w-full focus:outline-none focus:border-primary transition-colors";
  const labelClasses = "text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block";

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        eyebrow="Account"
        title={label || "Profile"}
        description="Manage your identity, preferences, and activity."
        actions={<Button size="sm" className="bg-[#22C55E] text-[#03110a] hover:bg-[#16A34A]">Save changes</Button>}
      />

      {/* Cover + identity card */}
      <div className="overflow-hidden rounded-xl border border-[#1E2730] bg-[#0A0C0B]">
        <div className="relative h-24 bg-gradient-to-r from-[#22C55E]/10 via-[#0EA5E9]/5 to-transparent border-b border-[#1E2730]">
        </div>
        <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <Avatar className="-mt-10 h-20 w-20 border-[3px] border-[#0A0C0B] bg-[#141B21]">
              <AvatarFallback className="text-xl font-semibold text-[#22C55E]">AR</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1 pb-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-white">Alex Rivera</h2>
                <Badge variant="secondary" className="gap-1 border-[#1E2730] bg-[#141B21] text-white">
                  <ShieldCheck className="size-3 text-[#22C55E]" />
                  Owner
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-[#22C55E]" />
                  Head of Operations
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  alex@acmecorp.io
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5" />
                  {workspace.name}
                </span>
              </div>
            </div>
          </div>
          <Button size="sm" variant="outline" className="border-[#1E2730] text-muted-foreground hover:bg-[#141B21] hover:text-white">
            <Edit2 className="size-3 mr-1.5" />
            Edit profile
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account details */}
        <Panel title="Personal Information">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClasses}>Display Name</label>
              <input type="text" className={inputClasses} defaultValue="Alex Rivera" />
            </div>
            <div>
              <label className={labelClasses}>Email Address</label>
              <input type="email" className={inputClasses} defaultValue="alex@acmecorp.io" />
            </div>
            <div>
              <label className={labelClasses}>Role</label>
              <input type="text" className={inputClasses} defaultValue="Head of Operations" />
            </div>
            <div>
              <label className={labelClasses}>Timezone</label>
              <select className={inputClasses}>
                <option>America/New_York (EST)</option>
                <option>UTC</option>
                <option>Europe/London (GMT)</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClasses}>Notification Preferences</label>
              <select className={inputClasses}>
                <option>All activity</option>
                <option>Mentions and Direct only</option>
                <option>Nothing</option>
              </select>
            </div>
          </div>
        </Panel>

        {/* Security */}
        <div className="flex flex-col gap-6">
          <Panel title="Security Settings">
            <div className="flex flex-col gap-5">
              <div>
                <label className={labelClasses}>Change Password</label>
                <div className="flex gap-2">
                  <input type="password" className={inputClasses} placeholder="New password" />
                  <Button variant="outline" className="border-[#1E2730] text-white hover:bg-[#141B21]">Update</Button>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-[#1E2730]/50 pt-5">
                <div>
                  <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Currently enabled via app.</p>
                </div>
                <Button variant="outline" size="sm" className="border-[#1E2730] text-white hover:bg-[#141B21]">
                  Manage 2FA
                </Button>
              </div>
            </div>
          </Panel>

          <Panel title="Active Sessions" contentClassName="p-0">
            <div className="flex flex-col">
              {sessions.map((s, i) => (
                <div key={s.device} className={cn("flex items-center justify-between p-4", i !== sessions.length - 1 && "border-b border-[#1E2730]/50")}>
                  <div>
                    <p className="text-sm font-medium text-white">{s.device}</p>
                    <p className="text-xs text-muted-foreground">{s.location}</p>
                  </div>
                  <span className={cn("text-[10px] font-bold uppercase tracking-widest", s.current ? "text-[#22C55E]" : "text-muted-foreground")}>
                    {s.time}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {/* Recent activity */}
      <Panel title="Activity Log" description={`${activity.length} recent actions`} contentClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#1E2730]">
              <tr>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Action</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Time</th>
              </tr>
            </thead>
            <tbody>
              {activity.map((a, i) => (
                <tr key={a.id} className="border-b border-[#1E2730]/50 transition-colors hover:bg-[#141B21]/50 last:border-0">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className={cn("size-2 shrink-0 rounded-full", dotTone[a.tone] || "bg-muted-foreground")} />
                      <span className="text-white">{a.text}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{a.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
