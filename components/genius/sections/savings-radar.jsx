"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, Filter } from "lucide-react";
import { savingsOpportunities, formatCurrency } from "@/lib/genius-data";
import {
  PageHeader,
  Panel,
  SeverityBadge,
  EvidenceLink,
} from "../shared";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SavingsRadar({ onNavigate }) {
  const [sort, setSort] = useState("impact");
  const [selected, setSelected] = useState([]);

  const rows = [...savingsOpportunities].sort((a, b) =>
    sort === "impact" ? b.impact - a.impact : b.confidence - a.confidence,
  );

  const total = rows.reduce((sum, r) => sum + r.impact, 0);
  const selectedTotal = rows
    .filter((r) => selected.includes(r.id))
    .reduce((sum, r) => sum + r.impact, 0);

  function toggle(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Savings Radar"
        description="Opportunities and risks ranked by impact and confidence. Turn any row into an approval — nothing executes without a human decision."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download data-icon="inline-start" />
              Export
            </Button>
            <Button
              size="sm"
              disabled={selected.length === 0}
              onClick={() => {
                toast.success(
                  `Created ${selected.length} approval${selected.length > 1 ? "s" : ""}`,
                  { description: `${formatCurrency(selectedTotal)} queued for review` },
                );
                onNavigate("approvals");
              }}
            >
              Create approval{selected.length ? ` (${selected.length})` : ""}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Total opportunity</div>
          <div className="mt-1 text-2xl font-semibold tabular text-primary">
            {formatCurrency(total)}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Selected</div>
          <div className="mt-1 text-2xl font-semibold tabular">
            {formatCurrency(selectedTotal)}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Opportunities</div>
          <div className="mt-1 text-2xl font-semibold tabular">{rows.length}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Avg confidence</div>
          <div className="mt-1 text-2xl font-semibold tabular">
            {Math.round(rows.reduce((s, r) => s + r.confidence, 0) / rows.length)}%
          </div>
        </div>
      </div>

      <Panel
        title="Ranked opportunities"
        contentClassName="p-0"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter data-icon="inline-start" />
              Filters
            </Button>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger size="sm" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="impact">Sort by impact</SelectItem>
                  <SelectItem value="confidence">Sort by confidence</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Opportunity</TableHead>
              <TableHead className="text-right">Impact</TableHead>
              <TableHead className="w-36">Confidence</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Evidence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} data-state={selected.includes(r.id) ? "selected" : undefined}>
                <TableCell>
                  <Checkbox
                    checked={selected.includes(r.id)}
                    onCheckedChange={() => toggle(r.id)}
                    aria-label={`Select ${r.title}`}
                  />
                </TableCell>
                <TableCell className="max-w-[280px]">
                  <div className="flex flex-col">
                    <span className="truncate font-medium text-foreground">
                      {r.title}
                    </span>
                    <span className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <SeverityBadge level={r.severity} />
                      {r.category}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium tabular text-primary">
                  {formatCurrency(r.impact)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={r.confidence} className="h-1.5" />
                    <span className="w-8 text-right text-xs tabular text-muted-foreground">
                      {r.confidence}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{r.owner}</TableCell>
                <TableCell>
                  <EvidenceLink>{r.evidence}</EvidenceLink>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>
    </div>
  );
}
