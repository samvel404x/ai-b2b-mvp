"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, Filter, Target, TrendingUp } from "lucide-react";
import { savingsOpportunities, savingsTrend, formatCurrencyFull } from "@/lib/genius-data";
import { ConfBar, EvidenceLink, Panel, SeverityBadge } from "../shared";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

function SavingsBarChart() {
  const max = Math.max(...savingsTrend.map(d => d.potential));
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-1.5 h-28">
        {savingsTrend.map((d, i) => (
          <div key={d.month} className="flex flex-1 flex-col items-center gap-1">
            <div className="relative flex h-full w-full items-end justify-center gap-0.5">
              <div className="w-5/12 rounded-t bg-white/8 transition-all" style={{ height: `${(d.potential / max) * 100}%` }} />
              <div
                className="w-5/12 animate-fade-up rounded-t bg-primary transition-all"
                style={{ height: `${(d.captured / max) * 100}%`, animationDelay: `${i * 60}ms`, boxShadow: "0 -2px 12px rgba(31,214,114,0.15)" }}
              />
            </div>
            <span className="text-[9px] text-[#3a4040]">{d.month}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 text-[11px] text-[#4a5450]">
        <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-primary" />Captured ($K)</span>
        <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-white/20" />Potential ($K)</span>
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
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Savings Radar</h1>
          <p className="text-sm text-[#4a5450]">Opportunities ranked by impact and confidence. Turn any row into an approval — nothing executes without a human decision.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-[#ffffff10] bg-transparent text-[#8a9490] hover:bg-white/5">
            <Download className="size-3.5 mr-1.5" />Export
          </Button>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={selected.length === 0}
            onClick={() => { toast.success(`Created ${selected.length} approval${selected.length > 1 ? "s" : ""}`, { description: `${formatCurrencyFull(selectedTotal)} queued for review` }); onNavigate("approvals"); }}>
            Create approval{selected.length ? ` (${selected.length})` : ""}
          </Button>
        </div>
      </div>

      {/* KPI + chart */}
      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total opportunity", value: formatCurrencyFull(total), tone: "primary", Icon: Target },
            { label: "Selected value", value: formatCurrencyFull(selectedTotal), tone: "neutral", Icon: TrendingUp },
            { label: "Opportunities", value: rows.length.toString(), tone: "neutral" },
            { label: "Avg confidence", value: `${avgConf}%`, tone: "primary" },
          ].map((k, i) => {
            const toneClass = k.tone === "primary" ? "text-primary" : "text-foreground";
            const accentClass = k.tone === "primary" ? "border-t-primary/35" : "";
            return (
              <div key={k.label} className={cn("flex flex-col gap-2 rounded-xl border border-t-2 border-[#ffffff08] bg-[#0a0c0b] p-4 animate-fade-up transition-all hover:border-[#1a2820]", accentClass)} style={{ animationDelay: `${i * 50}ms` }}>
                <span className="text-[11px] font-medium text-[#4a5450]">{k.label}</span>
                <span className={cn("text-2xl font-bold tabular", toneClass)}>{k.value}</span>
              </div>
            );
          })}
        </div>
        <div className="rounded-xl border border-[#ffffff08] bg-[#0a0c0b] p-4">
          <div className="mb-3">
            <p className="text-sm font-semibold text-foreground">Savings momentum</p>
            <p className="text-[11px] text-[#4a5450]">Captured vs potential (K)</p>
          </div>
          <SavingsBarChart />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#ffffff08] bg-[#0a0c0b]">
        <div className="flex items-center justify-between border-b border-[#ffffff06] px-4 py-3">
          <span className="text-sm font-semibold text-foreground">Ranked opportunities</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-[#ffffff10] bg-transparent text-[#8a9490] h-8 text-xs hover:bg-white/5">
              <Filter className="size-3.5 mr-1.5" />Filters
            </Button>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-40 h-8 text-xs border-[#ffffff10] bg-white/[0.025]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="impact">Sort by impact</SelectItem>
                  <SelectItem value="confidence">Sort by confidence</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#ffffff06]">
                <th className="px-4 py-2.5 w-10" />
                {["Opportunity", "Category", "Impact", "Confidence", "Owner", "Evidence", "Recommended action"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#3a4040] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} className={cn("border-b border-[#ffffff04] transition-colors hover:bg-white/[0.02]", selected.includes(r.id) && "bg-white/[0.03]", i === rows.length - 1 && "border-b-0")}>
                  <td className="px-4 py-3">
                    <Checkbox checked={selected.includes(r.id)} onCheckedChange={() => toggle(r.id)} aria-label={`Select ${r.title}`} />
                  </td>
                  <td className="px-4 py-3 max-w-[220px]">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-foreground truncate">{r.title}</span>
                      <span className="text-[11px] text-[#4a5450]">{r.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><SeverityBadge level={r.severity} /></td>
                  <td className="px-4 py-3 font-bold tabular text-primary whitespace-nowrap text-sm">{formatCurrencyFull(r.impact)}</td>
                  <td className="px-4 py-3 min-w-[100px]"><ConfBar value={r.confidence} /></td>
                  <td className="px-4 py-3 text-xs text-[#5a6660]">{r.owner}</td>
                  <td className="px-4 py-3"><EvidenceLink>{r.evidence}</EvidenceLink></td>
                  <td className="px-4 py-3 text-xs text-[#4a5450] max-w-[200px]">{r.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
