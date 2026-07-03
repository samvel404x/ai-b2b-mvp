"use client";

import { useState } from "react";
import { workspace } from "@/lib/genius-data";
import { PageHeader, Panel } from "../shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Field, FieldGroup } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

function ToggleRow({ title, desc, defaultChecked }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-muted-foreground">{desc}</span>
      </div>
      <Switch checked={on} onCheckedChange={setOn} />
    </div>
  );
}

export default function Settings({ label }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={label}
        description="Configure the workspace, AI behavior, guardrails and integrations."
        actions={<Button size="sm">Save all changes</Button>}
      />

      <Tabs defaultValue="workspace" className="w-full">
        <TabsList>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="ai">AI &amp; Agents</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="workspace" className="mt-4">
          <Panel title="Workspace details">
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <Label htmlFor="w-name">Workspace name</Label>
                  <Input id="w-name" defaultValue={workspace.name} />
                </Field>
                <Field>
                  <Label htmlFor="w-plan">Plan</Label>
                  <Input id="w-plan" defaultValue={workspace.plan} disabled />
                </Field>
                <Field>
                  <Label htmlFor="w-currency">Reporting currency</Label>
                  <Select defaultValue="usd">
                    <SelectTrigger id="w-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="usd">USD ($)</SelectItem>
                        <SelectItem value="eur">EUR (€)</SelectItem>
                        <SelectItem value="gbp">GBP (£)</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <Label htmlFor="w-tz">Timezone</Label>
                  <Select defaultValue="utc">
                    <SelectTrigger id="w-tz">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="est">America/New York</SelectItem>
                        <SelectItem value="cet">Europe/Berlin</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </FieldGroup>
          </Panel>
        </TabsContent>

        <TabsContent value="ai" className="mt-4">
          <Panel
            title="AI behavior &amp; guardrails"
            description="Control how much autonomy agents have"
          >
            <div className="flex flex-col divide-y divide-border">
              <div className="pb-4">
                <Field>
                  <Label htmlFor="ai-model">Default model</Label>
                  <Select defaultValue="gemini">
                    <SelectTrigger id="ai-model" className="sm:max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="gemini">Gemini 2.0</SelectItem>
                        <SelectItem value="gpt">GPT-4o</SelectItem>
                        <SelectItem value="claude">Claude 3.5</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <ToggleRow
                title="Require approval for outbound actions"
                desc="Emails, cancellations and disputes always need human sign-off"
                defaultChecked
              />
              <ToggleRow
                title="Auto-snooze low confidence findings"
                desc="Hide findings below 70% confidence until more evidence arrives"
                defaultChecked
              />
              <ToggleRow
                title="Allow agents to draft replies"
                desc="Agents can prepare responses but not send them"
                defaultChecked
              />
              <ToggleRow
                title="Autonomous mode"
                desc="Let high-confidence agents act without approval (not recommended)"
                defaultChecked={false}
              />
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Panel title="Notifications">
            <div className="flex flex-col divide-y divide-border">
              <ToggleRow
                title="Critical findings"
                desc="Notify immediately when a critical finding is detected"
                defaultChecked
              />
              <ToggleRow
                title="Approval requests"
                desc="Email me when an agent requests approval"
                defaultChecked
              />
              <ToggleRow
                title="Weekly digest"
                desc="Summary of risk, savings and activity every Monday"
                defaultChecked
              />
              <ToggleRow
                title="Connector issues"
                desc="Alert when a connector degrades or disconnects"
                defaultChecked={false}
              />
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="billing" className="mt-4">
          <Panel title="Plan &amp; billing">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">
                    {workspace.plan} plan
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Unlimited findings · 9 connectors · priority support
                  </span>
                </div>
                <span className="text-lg font-semibold tabular">
                  $499<span className="text-xs text-muted-foreground">/mo</span>
                </span>
              </div>
              <Separator />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  Change plan
                </Button>
                <Button variant="outline" size="sm">
                  Update payment method
                </Button>
                <Button variant="ghost" size="sm" className="text-critical">
                  Cancel subscription
                </Button>
              </div>
            </div>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
