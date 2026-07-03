"use client";

import { useState } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Minus } from "lucide-react";
import {
  diagnosticsCategories,
  findings,
  formatCurrency,
} from "@/lib/genius-data";
import {
  PageHeader,
  Panel,
  SeverityBadge,
  EvidenceLink,
} from "../shared";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const trendIcon = {
  up: <ArrowUpRight className="size-3.5 text-critical" />,
  down: <ArrowDownRight className="size-3.5 text-primary" />,
  flat: <Minus className="size-3.5 text-muted-foreground" />,
};

export default function Diagnostics({ onNavigate }) {
  const [selected, setSelected] = useState(diagnosticsCategories[0].id);
  const active = diagnosticsCategories.find((c) => c.id === selected);
  const related = findings.filter(
    (f) => f.category.toLowerCase() === active.name.split(" ")[0].toLowerCase(),
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Diagnostics"
        description="Risk and data-quality analysis. Every category explains why a finding exists and which evidence supports it."
        actions={
          <Button variant="outline" size="sm" onClick={() => onNavigate("savings")}>
            Open Savings Radar
            <ArrowRight data-icon="inline-end" />
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Risk categories" contentClassName="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Issues</TableHead>
                <TableHead className="text-right">Impact</TableHead>
                <TableHead className="w-32">Data quality</TableHead>
                <TableHead className="text-center">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {diagnosticsCategories.map((c) => (
                <TableRow
                  key={c.id}
                  onClick={() => setSelected(c.id)}
                  className={cn(
                    "cursor-pointer",
                    selected === c.id && "bg-secondary/50",
                  )}
                >
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-right tabular">{c.issues}</TableCell>
                  <TableCell className="text-right tabular font-medium">
                    {formatCurrency(c.impact)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={c.quality} className="h-1.5" />
                      <span className="w-8 text-right text-xs tabular text-muted-foreground">
                        {c.quality}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex justify-center">
                      {trendIcon[c.trend]}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Panel>

        <Panel
          title={active.name}
          description="Selected issue inspector"
          actions={
            <Button variant="outline" size="sm" onClick={() => onNavigate("chat")}>
              Ask AI
            </Button>
          }
        >
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-md border border-border bg-secondary/40 p-3">
                <div className="text-xs text-muted-foreground">Open issues</div>
                <div className="mt-1 text-lg font-semibold tabular">
                  {active.issues}
                </div>
              </div>
              <div className="rounded-md border border-border bg-secondary/40 p-3">
                <div className="text-xs text-muted-foreground">Exposure</div>
                <div className="mt-1 text-lg font-semibold tabular text-critical">
                  {formatCurrency(active.impact)}
                </div>
              </div>
              <div className="rounded-md border border-border bg-secondary/40 p-3">
                <div className="text-xs text-muted-foreground">Quality</div>
                <div className="mt-1 text-lg font-semibold tabular">
                  {active.quality}%
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Related business impacts
              </h3>
              <ul className="flex flex-col gap-2">
                {(related.length ? related : findings.slice(0, 2)).map((f) => (
                  <li
                    key={f.id}
                    className="rounded-md border border-border bg-secondary/30 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {f.title}
                      </span>
                      <SeverityBadge level={f.severity} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Why: {f.action}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <EvidenceLink>{f.evidence}</EvidenceLink>
                      <span className="text-xs tabular text-muted-foreground">
                        {formatCurrency(f.impact)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
