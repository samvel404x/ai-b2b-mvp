"use client";

import { BookOpen, LifeBuoy, MessageSquare, Send } from "lucide-react";
import { PageHeader, Panel } from "../shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Field, FieldGroup } from "@/components/ui/field";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How does GENIUS score confidence on a finding?",
    a: "Each finding combines model certainty, evidence coverage and cross-source agreement into a single confidence score. Anything below 80% is routed for human review before an agent can act.",
  },
  {
    q: "Can an agent take action without my approval?",
    a: "No. Any outbound action — emails, cancellations, disputes — is held in the Approvals queue. Agents can only prepare the action; a human confirms it.",
  },
  {
    q: "Where does my data live?",
    a: "Your source files and connector data are stored in your connected database. Evidence links always point back to the original source row or document page.",
  },
  {
    q: "How often do connectors sync?",
    a: "Most connectors sync every few minutes; the Business Live webhook streams events in real time. You can force a resync from the Connectors page.",
  },
];

const channels = [
  { icon: MessageSquare, title: "Live chat", desc: "Median reply under 5 minutes", cta: "Start chat" },
  { icon: BookOpen, title: "Documentation", desc: "Guides, API and playbooks", cta: "Open docs" },
  { icon: LifeBuoy, title: "Priority support", desc: "Business plan · 24/7", cta: "Email team" },
];

export default function Support({ label }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={label}
        description="Get help fast. Search the knowledge base, browse common questions, or reach the team directly."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {channels.map((c) => (
          <div
            key={c.title}
            className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
          >
            <div className="flex size-9 items-center justify-center rounded-md bg-primary/15 text-primary">
              <c.icon className="size-4" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{c.title}</span>
              <span className="text-xs text-muted-foreground">{c.desc}</span>
            </div>
            <Button variant="outline" size="sm" className="mt-1 w-full">
              {c.cta}
            </Button>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Panel title="Frequently asked" className="lg:col-span-3">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Panel>

        <Panel title="Contact us" className="lg:col-span-2">
          <FieldGroup>
            <Field>
              <Label htmlFor="s-subject">Subject</Label>
              <Input id="s-subject" placeholder="What do you need help with?" />
            </Field>
            <Field>
              <Label htmlFor="s-message">Message</Label>
              <Textarea
                id="s-message"
                rows={5}
                placeholder="Describe your issue or question…"
              />
            </Field>
            <Button className="w-full">
              <Send data-icon="inline-start" />
              Send message
            </Button>
          </FieldGroup>
        </Panel>
      </div>
    </div>
  );
}
