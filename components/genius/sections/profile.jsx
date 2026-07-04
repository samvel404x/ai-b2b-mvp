"use client";

import {
  CheckCircle2,
  Clock,
  Edit2,
  Mail,
  MapPin,
  Shield,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { workspace, formatCurrency } from "@/lib/genius-data";
import { PageHeader, Panel } from "../shared";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldGroup } from "@/components/ui/field";
import { cn } from "@/lib/utils";

const activity = [
  { id: "a1", text: "Approved vendor contract renewal for TechSoft Solutions", time: "14m ago", tone: "primary" },
  { id: "a2", text: "Reviewed evidence on Microsoft EA renewal benchmark", time: "2h ago", tone: "evidence" },
  { id: "a3", text: "Rejected aged receivable write-off for Acme Corp", time: "5h ago", tone: "critical" },
  { id: "a4", text: "Snoozed FX variance finding F-1028", time: "1d ago", tone: "warning" },
  { id: "a5", text: "Exported Q2 savings proof pack", time: "2d ago", tone: "primary" },
  { id: "a6", text: "Approved new vendor onboarding for CloudScale LLC", time: "3d ago", tone: "primary" },
];

const stats = [
  { label: "Decisions made", value: "142", icon: CheckCircle2, tone: "text-primary" },
  { label: "Value recovered", value: formatCurrency(48600), icon: TrendingUp, tone: "text-primary" },
  { label: "Avg. response", value: "3.2h", icon: Clock, tone: "text-evidence" },
];

const permissions = [
  { label: "Approve outbound actions", on: true },
  { label: "Manage connectors", on: true },
  { label: "Export proof packs", on: true },
  { label: "Invite team members", on: true },
  { label: "Manage billing", on: true },
  { label: "Delete workspace data", on: false },
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

export default function Profile({ label }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Account"
        title={label || "Profile"}
        description="Your account, role and decision history across the workspace."
      />

      {/* Cover + identity card */}
      <div className="overflow-hidden rounded-xl border border-[#1E2730] bg-[#0E1418]">
        <div className="ring-grid relative h-24 bg-gradient-to-r from-[#22C55E]/10 via-[#0EA5E9]/5 to-transparent">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E1418] to-transparent" />
        </div>
        <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <Avatar className="-mt-10 size-20 border-[3px] border-[#0E1418]">
              <AvatarFallback className="bg-[#182128] text-xl font-semibold text-[#22C55E]">AR</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1 pb-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-[#F4F7F8]">Alex Rivera</h2>
                <Badge variant="secondary" className="gap-1 border-[#1E2730]">
                  <ShieldCheck className="size-3 text-[#22C55E]" />
                  Owner
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#68737D]">
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
          <Button size="sm" variant="outline" className="border-[#1E2730] text-[#A7B0B8] hover:bg-[#182128] hover:text-[#F4F7F8]">
            <Edit2 className="size-3 mr-1.5" />
            Edit profile
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="flex animate-fade-up items-center gap-3 rounded-xl border border-[#1E2730] bg-[#0E1418] p-4 transition-colors hover:bg-[#11171C]"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-[#141B21]">
              <s.icon className={`size-5 ${s.tone}`} />
            </span>
            <div className="flex flex-col">
              <span className="text-lg font-semibold tabular text-[#F4F7F8]">{s.value}</span>
              <span className="text-xs text-[#68737D]">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Account details */}
          <Panel
            title="Account details"
            actions={
              <Button size="sm" className="bg-[#22C55E] text-[#03110a] hover:bg-[#16A34A]">
                Save changes
              </Button>
            }
          >
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <Label htmlFor="p-name">Full name</Label>
                  <Input id="p-name" defaultValue="Alex Rivera" />
                </Field>
                <Field>
                  <Label htmlFor="p-email">Email</Label>
                  <Input id="p-email" defaultValue="alex@acmecorp.io" />
                </Field>
                <Field>
                  <Label htmlFor="p-role">Role</Label>
                  <Input id="p-role" defaultValue="Head of Operations" />
                </Field>
                <Field>
                  <Label htmlFor="p-team">Team</Label>
                  <Input id="p-team" defaultValue="Operations & Finance" />
                </Field>
                <Field>
                  <Label htmlFor="p-phone">Phone</Label>
                  <Input id="p-phone" defaultValue="+1 (212) 555-0147" />
                </Field>
                <Field>
                  <Label htmlFor="p-tz">Timezone</Label>
                  <Input id="p-tz" defaultValue="America/New_York (EST)" />
                </Field>
              </div>
            </FieldGroup>
          </Panel>

          {/* Recent activity */}
          <Panel title="Recent activity" description={`${activity.length} actions`} contentClassName="p-0">
            <ul className="flex flex-col">
              {activity.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-3 border-b border-[#1E2730]/50 px-4 py-3 last:border-0 transition-colors hover:bg-[#11171C]"
                >
                  <span className={cn("size-2 shrink-0 rounded-full", dotTone[a.tone] || "bg-[#68737D]")} />
                  <span className="flex-1 text-sm text-[#A7B0B8]">{a.text}</span>
                  <span className="shrink-0 whitespace-nowrap text-xs text-[#68737D]">{a.time}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          {/* Access & permissions */}
          <Panel title="Access & permissions">
            <ul className="flex flex-col gap-3">
              {permissions.map((p) => (
                <li key={p.label} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-[#A7B0B8]">{p.label}</span>
                  {p.on ? (
                    <Badge variant="secondary" className="gap-1 border-[#1E2730] text-[#22C55E]">
                      <CheckCircle2 className="size-3" />
                      Granted
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-[#1E2730] text-[#68737D]">
                      Restricted
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          </Panel>

          {/* Security */}
          <Panel title="Security">
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#68737D]">Two-factor auth</span>
                <Badge variant="secondary" className="border-[#1E2730] text-[#22C55E]">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#68737D]">Last sign-in</span>
                <span className="tabular text-[#A7B0B8]">Today, 09:14</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#68737D]">Active sessions</span>
                <span className="tabular text-[#A7B0B8]">{sessions.length} devices</span>
              </div>
              <div className="mt-2 space-y-2">
                {sessions.map((s) => (
                  <div key={s.device} className="flex items-center justify-between rounded-lg border border-[#1E2730] bg-[#11171C] px-3 py-2">
                    <div>
                      <p className="text-xs font-medium text-[#A7B0B8]">{s.device}</p>
                      <p className="text-[10px] text-[#68737D]">{s.location}</p>
                    </div>
                    <span className={cn("text-[10px] font-medium", s.current ? "text-[#22C55E]" : "text-[#68737D]")}>
                      {s.time}
                    </span>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="mt-1 border-[#1E2730] text-[#A7B0B8] hover:bg-[#182128]">
                <Shield className="size-3 mr-1.5" />
                Manage security
              </Button>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
