"use client";

import { ArrowUpRight, Download, FileText } from "lucide-react";
import {
  healthMetrics,
  findings,
  evidencePipeline,
  approvals,
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

export default function CommandCenter({ onNavigate }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Command Center"
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

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {healthMetrics.map((metric) => (
          <MetricCard key={metric.id} {...metric} />
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
                <TableRow key={f.id} className="cursor-pointer">
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
          <Panel title="Health index">
            <div className="flex items-center gap-4">
              <Ring value={78} size={92} label="health" />
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center justify-between gap-6">
                  <span className="text-muted-foreground">Evidence coverage</span>
                  <span className="font-medium tabular">82%</span>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span className="text-muted-foreground">AI confidence</span>
                  <span className="font-medium tabular">91%</span>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span className="text-muted-foreground">Open approvals</span>
                  <span className="font-medium tabular text-warning">5</span>
                </div>
              </div>
            </div>
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
                <li key={a.id} className="flex items-center gap-3 px-4 py-3">
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

      <Panel
        title="Evidence pipeline"
        description="From upload to confirmed proof"
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
    </div>
  );
}
