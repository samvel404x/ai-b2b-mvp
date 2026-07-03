"use client";

import {
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
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

const activity = [
  { id: "a1", text: "Approved cancellation notice to Acme Analytics", time: "2h ago", tone: "primary" },
  { id: "a2", text: "Confirmed evidence on INV-2291 dispute", time: "5h ago", tone: "evidence" },
  { id: "a3", text: "Snoozed FX variance finding F-1028", time: "1d ago", tone: "warning" },
  { id: "a4", text: "Exported Q2 savings proof pack", time: "2d ago", tone: "primary" },
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
  { label: "Manage billing", on: false },
];

const dotTone = {
  primary: "bg-primary",
  evidence: "bg-evidence",
  warning: "bg-warning",
};

export default function Profile({ label }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Account"
        title={label}
        description="Your account, role and decision history across the workspace."
      />

      {/* Cover + identity */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="ring-grid relative h-28 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent">
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
        </div>
        <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <Avatar className="-mt-10 size-24 border-4 border-card">
              <AvatarFallback className="bg-secondary text-2xl">NO</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1.5 pb-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Nadia Okafor</h2>
                <Badge variant="secondary" className="gap-1">
                  <ShieldCheck className="size-3 text-primary" />
                  Verified
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-primary" />
                  Head of Finance
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  nadia@northwind.co
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5" />
                  {workspace.name}
                </span>
              </div>
            </div>
          </div>
          <Button size="sm" variant="outline">
            Edit profile
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="flex animate-fade-up items-center gap-3 rounded-xl border border-border bg-card p-4"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-secondary">
              <s.icon className={`size-5 ${s.tone}`} />
            </span>
            <div className="flex flex-col">
              <span className="text-lg font-semibold tabular">{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Panel
            title="Account details"
            actions={
              <Button size="sm" variant="outline">
                Save changes
              </Button>
            }
          >
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <Label htmlFor="p-name">Full name</Label>
                  <Input id="p-name" defaultValue="Nadia Okafor" />
                </Field>
                <Field>
                  <Label htmlFor="p-email">Email</Label>
                  <Input id="p-email" defaultValue="nadia@northwind.co" />
                </Field>
                <Field>
                  <Label htmlFor="p-role">Role</Label>
                  <Input id="p-role" defaultValue="Head of Finance" />
                </Field>
                <Field>
                  <Label htmlFor="p-team">Team</Label>
                  <Input id="p-team" defaultValue="Finance & Ops" />
                </Field>
              </div>
            </FieldGroup>
          </Panel>

          <Panel title="Recent activity" contentClassName="p-0">
            <ul className="flex flex-col">
              {activity.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-0"
                >
                  <span
                    className={`size-2 rounded-full ${dotTone[a.tone] || "bg-muted-foreground"}`}
                  />
                  <span className="text-sm">{a.text}</span>
                  <span className="ml-auto whitespace-nowrap text-xs text-muted-foreground">
                    {a.time}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel title="Access & permissions">
            <ul className="flex flex-col gap-3">
              {permissions.map((p) => (
                <li
                  key={p.label}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-sm text-foreground">{p.label}</span>
                  {p.on ? (
                    <Badge variant="secondary" className="gap-1 text-primary">
                      <CheckCircle2 className="size-3" />
                      Granted
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Restricted
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Security">
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Two-factor auth</span>
                <Badge variant="secondary" className="text-primary">
                  Enabled
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last sign-in</span>
                <span className="tabular">Today, 09:14</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Active sessions</span>
                <span className="tabular">2 devices</span>
              </div>
              <Button variant="outline" size="sm" className="mt-1">
                Manage security
              </Button>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
