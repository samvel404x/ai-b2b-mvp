"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Check,
  Clock,
  Mail,
  Pencil,
  X,
  FileSearch,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  Activity,
  Shield,
  Zap,
} from "lucide-react";
import { approvals as seedApprovals, formatCurrency } from "@/lib/genius-data";
import {
  PageHeader,
  Panel,
  SeverityBadge,
  StatePill,
  EvidenceLink,
} from "../shared";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const auditTrail = [
  { id: 1, actor: "Contract Analyst", action: "Generated approval request", time: "14m ago", tone: "primary" },
  { id: 2, actor: "System", action: "Evidence attached: Microsoft_EA_Renewal_Quote.pdf (96% coverage)", time: "14m ago", tone: "evidence" },
  { id: 3, actor: "System", action: "Risk score computed: High (confidence 94%)", time: "14m ago", tone: "warning" },
  { id: 4, actor: "Michael Wong", action: "Assigned as approver", time: "12m ago", tone: "muted" },
  { id: 5, actor: "System", action: "SLA breach imminent — 14 min overdue", time: "2m ago", tone: "critical" },
];

const summaryKpis = [
  { label: "Pending", value: 5, tone: "warning", icon: Clock },
  { label: "Approved today", value: 12, tone: "primary", icon: Check },
  { label: "Value at stake", value: "$517K", tone: "critical", icon: TrendingUp },
  { label: "Avg response", value: "1h 24m", tone: "muted", icon: Activity },
];

export default function Approvals() {
  const [items, setItems] = useState(
    seedApprovals.map((a) => ({ ...a, state: a.state || "Pending" })),
  );
  const [selectedId, setSelectedId] = useState(seedApprovals[0].id);
  const [emailOpen, setEmailOpen] = useState(false);
  const [pendingEmail, setPendingEmail] = useState(null);

  const selected = items.find((i) => i.id === selectedId) || items[0];
  const pendingCount = items.filter((i) => i.state === "Pending").length;

  function setState(id, state, message) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, state } : i)));
    if (message) toast.success(message);
  }

  function confirmApprove() {
    setState(pendingEmail.id, "Approved");
    setEmailOpen(false);
    toast.success("Approved & email sent", {
      description: `Confirmation sent to vendor for ${pendingEmail.title}`,
    });
  }

  const toneMap = {
    primary: "text-primary",
    evidence: "text-evidence",
    warning: "text-warning",
    critical: "text-critical",
    muted: "text-muted-foreground",
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Approvals"
        description="Human decision queue. Every action is evidence-backed and triggers a vendor email only when approved. GENIUS never acts autonomously."
        actions={
          <span className="flex items-center gap-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-1.5 text-sm font-medium text-warning">
            <Clock className="size-4" />
            {pendingCount} pending
          </span>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summaryKpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
              <div className={cn("flex size-8 items-center justify-center rounded-md bg-secondary", toneMap[k.tone] || "text-muted-foreground")}>
                <Icon className="size-4" />
              </div>
              <div>
                <div className={cn("text-lg font-semibold tabular leading-none", toneMap[k.tone])}>{k.value}</div>
                <div className="text-xs text-muted-foreground">{k.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr_0.85fr]">
        {/* Decision queue */}
        <Panel title="Decision queue" contentClassName="p-0">
          <ul className="divide-y divide-border">
            {items.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(a.id)}
                  className={cn(
                    "group flex w-full flex-col gap-2 px-4 py-3.5 text-left transition-colors hover:bg-secondary/40",
                    selectedId === a.id && "bg-secondary/50 border-l-2 border-l-primary",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      {a.priority === "High" && (
                        <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-critical" />
                      )}
                      <span className="text-sm font-medium text-foreground leading-snug">{a.title}</span>
                    </div>
                    <StatePill state={a.state} />
                  </div>
                  <div className="text-xs text-muted-foreground">{a.sub}</div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <SeverityBadge level={a.priority} />
                    <span className="text-muted-foreground">{a.agent}</span>
                    <span className="tabular font-semibold text-foreground">{formatCurrency(a.impact)}</span>
                    <span className="text-muted-foreground">{a.confidence}% conf.</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    <span className={cn(a.requested?.includes("overdue") ? "text-critical font-medium" : "text-muted-foreground")}>
                      {a.requested}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        {/* Detail panel */}
        <Panel
          title="Decision detail"
          description={selected.id}
          contentClassName="flex flex-col gap-4"
        >
          <div>
            <h3 className="text-base font-semibold text-foreground leading-snug">{selected.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{selected.sub}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <SeverityBadge level={selected.priority} />
              <StatePill state={selected.state} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border border-border bg-secondary/40 p-3">
              <div className="text-xs text-muted-foreground">Impact</div>
              <div className="mt-1 text-xl font-bold tabular text-critical">{formatCurrency(selected.impact)}</div>
            </div>
            <div className="rounded-md border border-border bg-secondary/40 p-3">
              <div className="text-xs text-muted-foreground">Confidence</div>
              <div className="mt-1 text-xl font-bold tabular text-foreground">{selected.confidence}%</div>
              <Progress value={selected.confidence} className="mt-1.5 h-1" />
            </div>
          </div>

          <div className="rounded-md border border-border bg-secondary/30 p-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
              <Zap className="size-3 text-primary" />
              Recommended action
            </div>
            <p className="text-sm leading-snug">{selected.action}</p>
          </div>

          <div className="rounded-md border border-evidence/20 bg-evidence/5 p-3">
            <div className="flex items-center gap-1.5 mb-1.5 text-xs font-medium text-evidence">
              <Shield className="size-3" />
              Source evidence · {selected.evidenceRef}
            </div>
            <EvidenceLink>{selected.evidence}</EvidenceLink>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => {
                setPendingEmail(selected);
                setEmailOpen(true);
              }}
              disabled={selected.state === "Approved"}
              className="col-span-2"
            >
              <Check className="size-4 mr-1.5" />
              Approve & send email
            </Button>
            <Button
              variant="destructive"
              onClick={() => setState(selected.id, "Rejected", "Rejected")}
            >
              <X className="size-4 mr-1" />
              Reject
            </Button>
            <Button variant="outline" onClick={() => setState(selected.id, "In review", "Requested evidence")}>
              <FileSearch className="size-4 mr-1" />
              Request evidence
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={() => setState(selected.id, "Snoozed", "Snoozed")}
            >
              Snooze
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={() => setState(selected.id, "Done", "Marked done")}
            >
              Mark done
            </Button>
            <Button variant="ghost" size="sm" className="flex-1" onClick={() => toast("Edit details")}>
              <Pencil className="size-3 mr-1" />
              Edit
            </Button>
          </div>
        </Panel>

        {/* Audit trail */}
        <Panel title="Audit trail" description="AP-501" contentClassName="p-0">
          <ol className="relative px-4 py-3">
            {auditTrail.map((ev, i) => (
              <li key={ev.id} className="relative flex gap-3 pb-4 last:pb-0">
                {/* Vertical line */}
                {i < auditTrail.length - 1 && (
                  <div className="absolute left-[7px] top-3 bottom-0 w-px bg-border" />
                )}
                <div className={cn(
                  "relative mt-1 size-3.5 shrink-0 rounded-full border-2",
                  ev.tone === "critical" ? "border-critical bg-critical/20" :
                  ev.tone === "warning" ? "border-warning bg-warning/10" :
                  ev.tone === "primary" ? "border-primary bg-primary/10" :
                  ev.tone === "evidence" ? "border-evidence bg-evidence/10" :
                  "border-border bg-secondary"
                )} />
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-xs font-medium text-foreground">{ev.actor}</span>
                  <span className="text-xs text-muted-foreground leading-snug">{ev.action}</span>
                  <span className="text-[11px] text-muted-foreground/60">{ev.time}</span>
                </div>
              </li>
            ))}
          </ol>

          <div className="border-t border-border px-4 py-3">
            <div className="text-xs font-medium text-muted-foreground mb-2">SLA Status</div>
            <div className="flex items-center gap-2 mb-1">
              <Progress value={110} className="flex-1 h-1.5" />
              <span className="text-xs font-medium text-critical tabular shrink-0">Breached</span>
            </div>
            <p className="text-xs text-muted-foreground">Target: 60 min · Elapsed: 74 min</p>
          </div>

          <div className="border-t border-border px-4 py-3">
            <div className="text-xs font-medium text-muted-foreground mb-2">Related approvals</div>
            <ul className="flex flex-col gap-2">
              {seedApprovals.slice(1, 3).map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-2 rounded-md bg-secondary/40 px-2.5 py-2 text-xs cursor-pointer hover:bg-secondary/60 transition-colors"
                  onClick={() => setSelectedId(a.id)}
                >
                  <span className="truncate font-medium">{a.title}</span>
                  <ChevronRight className="size-3 shrink-0 text-muted-foreground" />
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </div>

      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="size-4 text-primary" />
              Send email confirmation
            </DialogTitle>
            <DialogDescription>
              Approving executes the prepared action and sends a confirmation email. This is the only point where GENIUS acts.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="to">Recipient</Label>
              <Input id="to" defaultValue="vendor@acme-analytics.com" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" defaultValue={pendingEmail ? pendingEmail.title : ""} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                rows={4}
                defaultValue={pendingEmail ? `${pendingEmail.action}\n\nEvidence: ${pendingEmail.evidence}` : ""}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailOpen(false)}>Cancel</Button>
            <Button onClick={confirmApprove}>
              <Mail className="size-4 mr-1.5" />
              Approve & send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
