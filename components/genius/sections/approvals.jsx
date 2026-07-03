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

export default function Approvals() {
  const [items, setItems] = useState(
    seedApprovals.map((a) => ({ ...a, state: "Pending" })),
  );
  const [selectedId, setSelectedId] = useState(seedApprovals[0].id);
  const [emailOpen, setEmailOpen] = useState(false);
  const [pendingEmail, setPendingEmail] = useState(null);

  const selected = items.find((i) => i.id === selectedId) || items[0];

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

  const pendingCount = items.filter((i) => i.state === "Pending").length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Approvals"
        description="The human decision queue. Approve, reject, edit, request more evidence or snooze — approvals can trigger an email confirmation to the vendor."
        actions={
          <span className="flex items-center gap-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-1.5 text-sm font-medium text-warning">
            <Clock className="size-4" />
            {pendingCount} pending
          </span>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Panel title="Decision queue" contentClassName="p-0">
          <ul className="divide-y divide-border">
            {items.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(a.id)}
                  className={cn(
                    "flex w-full flex-col gap-2 px-4 py-3 text-left transition-colors hover:bg-secondary/40",
                    selectedId === a.id && "bg-secondary/50",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-medium text-foreground">{a.title}</span>
                    <StatePill state={a.state} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <SeverityBadge level={a.priority} />
                    <span>{a.agent}</span>
                    <span className="tabular font-medium text-foreground">
                      {formatCurrency(a.impact)}
                    </span>
                    <span>{a.confidence}% conf.</span>
                    <span>{a.requested}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Decision detail" description={selected.id}>
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {selected.title}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <SeverityBadge level={selected.priority} />
                <StatePill state={selected.state} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border border-border bg-secondary/40 p-3">
                <div className="text-xs text-muted-foreground">Impact</div>
                <div className="mt-1 text-lg font-semibold tabular text-primary">
                  {formatCurrency(selected.impact)}
                </div>
              </div>
              <div className="rounded-md border border-border bg-secondary/40 p-3">
                <div className="text-xs text-muted-foreground">Confidence</div>
                <div className="mt-1 text-lg font-semibold tabular">
                  {selected.confidence}%
                </div>
              </div>
            </div>

            <div className="rounded-md border border-border bg-secondary/30 p-3">
              <div className="text-xs font-medium text-muted-foreground">
                Recommended action
              </div>
              <p className="mt-1 text-sm">{selected.action}</p>
            </div>

            <div className="rounded-md border border-evidence/20 bg-evidence/5 p-3">
              <div className="mb-1.5 text-xs font-medium text-evidence">
                Source evidence
              </div>
              <EvidenceLink>{selected.evidence}</EvidenceLink>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => {
                  setPendingEmail(selected);
                  setEmailOpen(true);
                }}
                disabled={selected.state === "Approved"}
              >
                <Check data-icon="inline-start" />
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => setState(selected.id, "Rejected", "Rejected")}
              >
                <X data-icon="inline-start" />
                Reject
              </Button>
              <Button variant="outline" onClick={() => toast("Edit details")}>
                <Pencil data-icon="inline-start" />
                Edit details
              </Button>
              <Button
                variant="outline"
                onClick={() => setState(selected.id, "In review", "Requested evidence")}
              >
                <FileSearch data-icon="inline-start" />
                Request evidence
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => setState(selected.id, "Snoozed", "Snoozed")}
                    >
                      Snooze
                    </Button>
                  }
                />
                <TooltipContent>Hide until tomorrow</TooltipContent>
              </Tooltip>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => setState(selected.id, "Done", "Marked done")}
              >
                Mark done
              </Button>
            </div>
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
              Approving executes the prepared action and sends a confirmation
              email. This is the only point where GENIUS acts.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="to">Recipient</Label>
              <Input id="to" defaultValue="vendor@acme-analytics.com" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                defaultValue={pendingEmail ? pendingEmail.title : ""}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                rows={4}
                defaultValue={
                  pendingEmail
                    ? `${pendingEmail.action}\n\nEvidence: ${pendingEmail.evidence}`
                    : ""
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmApprove}>
              <Mail data-icon="inline-start" />
              Approve & send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
