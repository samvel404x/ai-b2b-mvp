"use client";

import { workspace, formatCurrency } from "@/lib/genius-data";
import { PageHeader, Panel } from "../shared";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldGroup } from "@/components/ui/field";

const activity = [
  { id: "a1", text: "Approved cancellation notice to Acme Analytics", time: "2h ago" },
  { id: "a2", text: "Confirmed evidence on INV-2291 dispute", time: "5h ago" },
  { id: "a3", text: "Snoozed FX variance finding F-1028", time: "1d ago" },
  { id: "a4", text: "Exported Q2 savings proof pack", time: "2d ago" },
];

const stats = [
  { label: "Decisions made", value: "142" },
  { label: "Value recovered", value: formatCurrency(48600) },
  { label: "Avg. response", value: "3.2h" },
];

export default function Profile({ label }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={label}
        description="Your account, role and decision history across the workspace."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-1">
          <div className="flex flex-col items-center gap-3 text-center">
            <Avatar className="size-20">
              <AvatarFallback className="bg-secondary text-xl">NO</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold">Nadia Okafor</h2>
              <p className="text-sm text-muted-foreground">Head of Finance</p>
            </div>
            <Badge variant="secondary">{workspace.name}</Badge>
            <div className="mt-2 grid w-full grid-cols-3 gap-2 border-t border-border pt-4">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold tabular">
                    {s.value}
                  </span>
                  <span className="text-[11px] leading-tight text-muted-foreground">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

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
            <div className="divide-y divide-border">
              {activity.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <span className="text-sm">{a.text}</span>
                  <span className="whitespace-nowrap text-xs text-muted-foreground">
                    {a.time}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
