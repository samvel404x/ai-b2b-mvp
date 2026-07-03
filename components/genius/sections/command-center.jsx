"use client";

import { ArrowUpRight, Download, FileText, Sparkles, Zap } from "lucide-react";
import {
  healthMetrics,
  findings,
  evidencePipeline,
  approvals,
  commandActivity,
  savingsTrend,
  formatCurrency,
} from "@/lib/genius-data";
import {
  PageHeader,
  Panel,
  MetricCard,
  Ring,
  SeverityBadge,
  StatePill,
  EvidenceLink,
} from "../shared";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const activityTone = {
  critical: "bg-critical",
  warning: "bg-warning",
  evidence: "bg-evidence",
  primary: "bg-primary",
};

function SavingsTrendChart() {
  const max = Math.max(...savingsTrend.map((d) => d.potential));
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-2">
        {savingsTrend.map((d, i) => (
          <div key={d.month} className="flex flex-1 flex-col items-center gap-2">
            <div className="relative flex h-32 w-full items-end justify-center gap-1">
              <div
                className="w-1/2 rounded-t bg-muted"
                style={{ height: `${(d.potential / max) * 100}%` }}
                title={`Potential ${d.potential}k`}
              />
              <div
                className="w-1/2 animate-fade-up rounded-t bg-primary"
                style={{
                  height: `${(d.captured / max) * 100}%`,
                  animationDelay: `${i * 60}ms`,
                }}
                title={`Captured ${d.captured}k`}
              />
            </div>
            <span className="text-[11px] text-muted-foreground">{d.month}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-primary" /> Captured
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-muted" /> Potential
        </span>
      </div>
    </div>
  );
}

export default function CommandCenter({ onNavigate }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Command Center"
        title="Every dollar accounted for, every action approved by you"
        description="Business health, money at risk and prepared actions — every finding is backed by source evidence and waits for your approval."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download data-icon="inline-start" />
              Export summary
            </Button>
            <Button size="sm" onClick={() => onNavigate("data")}>
              Import data
            </Button>
          </>
        }
      />

      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
        <div className="ring-grid absolute inset-0 opacity-40" />
        <div className="absolute -right-16 -top-20 size-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3">
            <span className="flex w-fit items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
              <Sparkles className="size-3" />
              5 agents monitoring · 82% evidence coverage
            </span>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-semibold tracking-tight text-primary tabular">
                {formatCurrency(64200)}
              </span>
              <span className="pb-1.5 text-sm text-muted-foreground">
                recoverable this quarter
              </span>
            </div>
            <p className="max-w-md text-sm text-muted-foreground">
              {formatCurrency(128400)} at risk across{" "}
              {findings.length} open findings. GENIUS has prepared{" "}
              {approvals.length} actions for your review.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="sm" onClick={() => onNavigate("approvals")}>
                <Zap data-icon="inline-start" />
                Review {approvals.length} actions
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate("chat")}
              >
                Ask GENIUS
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-6 rounded-xl border border-border bg-background/60 p-5 backdrop-blur">
            <Ring value={78} size={104} label="health" />
            <div className="flex flex-col gap-2.5 text-sm">
              <div className="flex items-center justify-between gap-8">
                <span className="text-muted-foreground">Evidence coverage</span>
                <span className="font-medium tabular text-evidence">82%</span>
              </div>
              <div className="flex items-center justify-between gap-8">
                <span className="text-muted-foreground">AI confidence</span>
                <span className="font-medium tabular text-primary">91%</span>
              </div>
              <div className="flex items-center justify-between gap-8">
                <span className="text-muted-foreground">Open approvals</span>
                <span className="font-medium tabular text-warning">
                  {approvals.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {healthMetrics.map((metric, i) => (
          <MetricCard key={metric.id} index={i} {...metric} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel
          title="Proof-backed findings"
          description="Ranked by financial impact"
          className="lg:col-span-2"
          contentClassName="p-0"
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("savings")}
            >
              Savings Radar
              <ArrowUpRight data-icon="inline-end" />
            </Button>
          }
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Finding</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead className="text-right">Impact</TableHead>
                <TableHead className="text-right">Confidence</TableHead>
                <TableHead>Evidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {findings.slice(0, 5).map((f) => (
                <TableRow
                  key={f.id}
                  className="cursor-pointer transition-colors hover:bg-secondary/40"
                >
                  <TableCell className="max-w-[240px]">
                    <div className="flex flex-col">
                      <span className="truncate font-medium text-foreground">
                        {f.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {f.id} · {f.category} · {f.owner}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <SeverityBadge level={f.severity} />
                  </TableCell>
                  <TableCell className="text-right font-medium tabular">
                    {formatCurrency(f.impact)}
                  </TableCell>
                  <TableCell className="text-right tabular text-muted-foreground">
                    {f.confidence}%
                  </TableCell>
                  <TableCell>
                    <EvidenceLink>{f.evidence}</EvidenceLink>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel title="Savings momentum" description="Captured vs potential (k)">
            <SavingsTrendChart />
          </Panel>

          <Panel
            title="Decision queue"
            description="Waiting for human approval"
            contentClassName="p-0"
            actions={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate("approvals")}
              >
                Review
              </Button>
            }
          >
            <ul className="divide-y divide-border">
              {approvals.slice(0, 3).map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/40"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">
                      {a.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {a.agent} · {formatCurrency(a.impact)}
                    </span>
                  </div>
                  <div className="ml-auto">
                    <SeverityBadge level={a.priority} />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel
          title="Evidence pipeline"
          description="From upload to confirmed proof"
          className="lg:col-span-2"
          contentClassName="p-0"
          actions={
            <Button variant="ghost" size="sm" onClick={() => onNavigate("data")}>
              Data Intake
              <ArrowUpRight data-icon="inline-end" />
            </Button>
          }
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead className="text-right">Fields</TableHead>
                <TableHead className="w-40">Coverage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evidencePipeline.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-2">
                      <FileText className="size-3.5 text-muted-foreground" />
                      {e.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{e.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <StatePill
                      state={
                        e.stage === "Confirmed"
                          ? "Approved"
                          : e.stage === "Review"
                            ? "In review"
                            : "Pending"
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right tabular text-muted-foreground">
                    {e.fields}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={e.coverage} className="h-1.5" />
                      <span className="w-9 text-right text-xs tabular text-muted-foreground">
                        {e.coverage}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Panel>

        <Panel title="Live agent activity" description="Real-time reasoning stream">
          <ul className="flex flex-col gap-4">
            {commandActivity.map((a) => (
              <li key={a.id} className="flex gap-3">
                <div className="relative flex flex-col items-center">
                  <span
                    className={`mt-1 size-2 rounded-full ${activityTone[a.tone] || "bg-muted-foreground"}`}
                  />
                  <span className="mt-1 w-px flex-1 bg-border" />
                </div>
                <div className="flex flex-col pb-1">
                  <span className="text-sm text-foreground">
                    <span className="font-medium text-primary">{a.agent}</span>{" "}
                    {a.text}
                  </span>
                  <span className="text-xs text-muted-foreground">{a.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
