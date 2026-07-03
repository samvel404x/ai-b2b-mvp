"use client";

import { Download, FileText, Plus } from "lucide-react";
import { reports } from "@/lib/genius-data";
import { PageHeader, Panel, StatePill } from "../shared";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const templates = [
  { name: "Risk report", desc: "Ranked findings with evidence and exposure" },
  { name: "Savings proof pack", desc: "Recovered value with before/after totals" },
  { name: "Renewal risk", desc: "Upcoming renewals and clause exposure" },
  { name: "Audit history", desc: "Every action, decision and approver" },
];

export default function Reports({ label }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={label}
        description="Board-ready outputs generated from live findings. Every report carries the evidence trail behind each number."
        actions={
          <Button size="sm">
            <Plus data-icon="inline-start" />
            New report
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {templates.map((t) => (
          <button
            key={t.name}
            type="button"
            className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-secondary/30"
          >
            <div className="flex size-8 items-center justify-center rounded-md bg-primary/15 text-primary">
              <FileText className="size-4" />
            </div>
            <span className="text-sm font-medium">{t.name}</span>
            <span className="text-xs leading-snug text-muted-foreground">
              {t.desc}
            </span>
          </button>
        ))}
      </div>

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
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell className="text-muted-foreground">{r.type}</TableCell>
                <TableCell className="text-muted-foreground">
                  {r.period}
                </TableCell>
                <TableCell className="text-right tabular">
                  {r.findings}
                </TableCell>
                <TableCell>
                  <StatePill state={r.status === "Ready" ? "Done" : "Pending"} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {r.updated}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <Download data-icon="inline-start" />
                    Export
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>
    </div>
  );
}
