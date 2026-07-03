"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Download,
  FileText,
  Plus,
  TrendingUp,
  Shield,
  Calendar,
  BookOpen,
  Eye,
  Share2,
  Clock,
  CheckCircle2,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import { reports } from "@/lib/genius-data";
import { PageHeader, Panel, StatePill, Sparkline } from "../shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const templates = [
  {
    name: "Risk report",
    desc: "Ranked findings with evidence and exposure",
    icon: AlertTriangle,
    count: 18,
    tone: "critical",
  },
  {
    name: "Savings proof pack",
    desc: "Recovered value with before/after totals",
    icon: TrendingUp,
    count: 12,
    tone: "primary",
  },
  {
    name: "Renewal risk",
    desc: "Upcoming renewals and clause exposure",
    icon: Calendar,
    count: 6,
    tone: "warning",
  },
  {
    name: "Audit history",
    desc: "Every action, decision, and approver",
    icon: BookOpen,
    count: 41,
    tone: "muted",
  },
];

const reportStats = [
  { label: "Reports ready", value: "3", tone: "primary", icon: CheckCircle2, spark: [2, 2, 3, 3, 3, 3, 3, 3, 3, 3] },
  { label: "Total findings", value: "77", tone: "warning", icon: AlertTriangle, spark: [40, 44, 49, 52, 58, 63, 68, 72, 74, 77] },
  { label: "Board-ready", value: "96%", tone: "primary", icon: BarChart3, spark: [88, 89, 90, 91, 92, 93, 93, 94, 95, 96] },
  { label: "Last generated", value: "Today", tone: "muted", icon: Clock, spark: null },
];

const coverageSections = [
  { label: "Spend Leakage", pct: 92, findings: 18, tone: "critical" },
  { label: "Renewal Risk", pct: 87, findings: 14, tone: "warning" },
  { label: "Invoice / Contract", pct: 79, findings: 11, tone: "warning" },
  { label: "Data Quality", pct: 68, findings: 9, tone: "muted" },
  { label: "Governance", pct: 55, findings: 7, tone: "muted" },
];

export default function Reports({ label }) {
  const [selectedReport, setSelectedReport] = useState(reports[0]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={label}
        description="Board-ready outputs generated from live findings. Every report carries the complete evidence trail behind each number — verifiable, auditable, exportable."
        actions={
          <Button size="sm" onClick={() => toast.success("Opening report builder...")}>
            <Plus className="size-4 mr-1.5" />
            New report
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {reportStats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
              <Icon className={cn("size-5 shrink-0", {
                "text-primary": s.tone === "primary",
                "text-warning": s.tone === "warning",
                "text-critical": s.tone === "critical",
                "text-muted-foreground": s.tone === "muted",
              })} />
              <div className="flex-1 min-w-0">
                <div className="text-lg font-bold tabular leading-none">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
              {s.spark && (
                <div className="w-12 shrink-0">
                  <Sparkline data={s.spark} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Template quick-create */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {templates.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.name}
              type="button"
              onClick={() => toast.success(`Creating ${t.name}...`)}
              className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary/40 hover:bg-secondary/30 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className={cn("flex size-8 items-center justify-center rounded-md", {
                  "bg-primary/15 text-primary": t.tone === "primary",
                  "bg-warning/15 text-warning": t.tone === "warning",
                  "bg-critical/15 text-critical": t.tone === "critical",
                  "bg-secondary text-muted-foreground": t.tone === "muted",
                })}>
                  <Icon className="size-4" />
                </div>
                <Badge variant="secondary" className="text-xs tabular">{t.count}</Badge>
              </div>
              <div>
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-xs leading-snug text-muted-foreground mt-0.5">{t.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.55fr]">
        {/* Generated reports table */}
        <Panel title="Generated reports" contentClassName="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Report</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Findings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((r) => (
                <TableRow
                  key={r.id}
                  className={cn("cursor-pointer", selectedReport?.id === r.id && "bg-secondary/40")}
                  onClick={() => setSelectedReport(r)}
                >
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{r.type}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{r.period}</TableCell>
                  <TableCell className="text-right tabular font-medium">{r.findings}</TableCell>
                  <TableCell>
                    <StatePill state={r.status === "Ready" ? "Done" : "Pending"} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{r.updated}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={(e) => { e.stopPropagation(); toast.success("Opening preview..."); }}
                      >
                        <Eye className="size-3.5" />
                        <span className="sr-only">Preview</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={(e) => { e.stopPropagation(); toast.success("Sharing..."); }}
                      >
                        <Share2 className="size-3.5" />
                        <span className="sr-only">Share</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={(e) => { e.stopPropagation(); toast.success(`Exporting ${r.name}...`); }}
                      >
                        <Download className="size-3.5" />
                        <span className="sr-only">Export</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Panel>

        {/* Report detail panel */}
        <div className="flex flex-col gap-4">
          {selectedReport && (
            <Panel
              title={selectedReport.name}
              description={`${selectedReport.type} · ${selectedReport.period}`}
              contentClassName="flex flex-col gap-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border border-border bg-secondary/40 p-3 text-center">
                  <div className="text-2xl font-bold tabular text-foreground">{selectedReport.findings}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Total findings</div>
                </div>
                <div className="rounded-md border border-border bg-secondary/40 p-3 text-center">
                  <div className="text-2xl font-bold tabular text-primary">96%</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Evidence coverage</div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="text-xs font-medium text-muted-foreground mb-1">Coverage by category</div>
                {coverageSections.map((s) => (
                  <div key={s.label} className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="tabular font-medium text-foreground">{s.findings} findings · {s.pct}%</span>
                    </div>
                    <Progress
                      value={s.pct}
                      className={cn("h-1.5",
                        s.tone === "critical" ? "[&>div]:bg-critical" :
                        s.tone === "warning" ? "[&>div]:bg-warning" :
                        "[&>div]:bg-primary/40"
                      )}
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <Button className="w-full" onClick={() => toast.success(`Exporting ${selectedReport.name}...`)}>
                  <Download className="size-4 mr-1.5" />
                  Export PDF
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => toast.success("Opening preview...")}>
                    <Eye className="size-4 mr-1" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => toast.success("Sharing link copied...")}>
                    <Share2 className="size-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </Panel>
          )}

          <Panel title="Scheduled reports" contentClassName="p-0">
            <ul className="divide-y divide-border">
              {[
                { name: "Weekly risk digest", freq: "Every Monday", next: "Jul 7" },
                { name: "Monthly savings summary", freq: "1st of month", next: "Aug 1" },
                { name: "Renewal alerts", freq: "30d before renewal", next: "Rolling" },
              ].map((s) => (
                <li key={s.name} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <div className="text-sm font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.freq} · Next: {s.next}</div>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">Active</Badge>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
