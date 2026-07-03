"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, Filter, Target, TrendingUp } from "lucide-react";
import { savingsOpportunities, savingsTrend, formatCurrencyFull } from "@/lib/genius-data";
import { PageHeader, Panel, SeverityBadge, EvidenceLink, Sparkline } from "../shared";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

function SavingsBar() {
  const max = Math.max(...savingsTrend.map(d => d.potential));
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-1.5">
        {savingsTrend.map((d, i) => (
          <div key={d.month} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="relative flex h-28 w-full items-end justify-center gap-0.5">
              <div className="w-5/12 rounded-t bg-muted/50" style={{ height: `${(d.potential / max) * 100}%` }} title={`Potential $${d.potential}K`} />
              <div className="w-5/12 animate-fade-up rounded-t bg-primary" style={{ height: `${(d.captured / max) * 100}%`, animationDelay: `${i * 60}ms` }} title={`Captured $${d.captured}K`} />
            </div>
            <span className="text-[10px] text-muted-foreground">{d.month}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-primary" />Captured ($K)</span>
        <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-muted" />Potential ($K)</span>
      </div>
    </div>
  );
}

export default function SavingsRadar({ onNavigate }) {
  const [sort, setSort] = useState("impact");
  const [selected, setSelected] = useState([]);

  const rows = [...savingsOpportunities].sort((a, b) =>
    sort === "impact" ? b.impact - a.impact : b.confidence - a.confidence
  );
  const total = rows.reduce((s, r) => s + r.impact, 0);
  const selectedTotal = rows.filter(r => selected.includes(r.id)).reduce((s, r) => s + r.impact, 0);
  const avgConf = Math.round(rows.reduce((s, r) => s + r.confidence, 0) / rows.length);

  function toggle(id) { setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]); }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Savings Radar"
        description="Opportunities and risks ranked by impact and confidence. Turn any row into an approval — nothing executes without a human decision."
        actions={
          <>
            <Button variant="outline" size="sm"><Download className="size-3.5 mr-1.5" />Export</Button>
            <Button size="sm" disabled={selected.length === 0} onClick={() => {
              toast.success(`Created ${selected.length} approval${selected.length > 1 ? "s" : ""}`, { description: `${formatCurrencyFull(selectedTotal)} queued for review` });
              onNavigate("approvals");
            }}>
              Create approval{selected.length ? ` (${selected.length})` : ""}
            </Button>
          </>
        }
      />

      {/* KPI + chart grid */}
      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total opportunity", value: formatCurrencyFull(total), tone: "primary", icon: Target },
            { label: "Selected value", value: formatCurrencyFull(selectedTotal), tone: "neutral", icon: TrendingUp },
            { label: "Opportunities", value: rows.length.toString(), tone: "neutral" },
            { label: "Avg confidence", value: `${avgConf}%`, tone: "primary" },
          ].map((k, i) => (
            <div key={k.label} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
              <span className="text-xs text-muted-foreground">{k.label}</span>
              <span className={cn("text-2xl font-semibold tabular", k.tone === "primary" ? "text-primary" : "text-foreground")}>{k.value}</span>
            </div>
          ))}
        </div>
        <Panel title="Savings momentum" description="Captured vs potential (K)">
          <SavingsBar />
        </Panel>
      </div>

      {/* Table */}
      <Panel
        title="Ranked opportunities"
        contentClassName="p-0"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="size-3.5 mr-1.5" />Filters
            </Button>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger size="sm" className="w-40"><SelectValue /></SelectTrigger>
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
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-2.5 w-10" />
              {["Opportunity", "Category", "Impact", "Confidence", "Owner", "Evidence", "Recommended action"].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r, i) => (
              <tr key={r.id} data-state={selected.includes(r.id) ? "selected" : undefined} className="transition-colors hover:bg-secondary/40">
                <td className="px-4 py-3">
                  <Checkbox checked={selected.includes(r.id)} onCheckedChange={() => toggle(r.id)} aria-label={`Select ${r.title}`} />
                </td>
                <td className="px-4 py-3 max-w-[220px]">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-foreground truncate">{r.title}</span>
                    <span className="text-xs text-muted-foreground">{r.id}</span>
                  </div>
                </td>
                <td className="px-4 py-3"><SeverityBadge level={r.severity} /></td>
                <td className="px-4 py-3 font-medium tabular text-primary whitespace-nowrap">{formatCurrencyFull(r.impact)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Progress value={r.confidence} className="h-1.5 w-16" />
                    <span className="text-xs tabular text-muted-foreground">{r.confidence}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{r.owner}</td>
                <td className="px-4 py-3"><EvidenceLink>{r.evidence}</EvidenceLink></td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px]">{r.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
