"use client";

import { useState } from "react";
import {
  CheckCircle2, Minus, TrendingDown, TrendingUp, X, Download,
  ChevronDown, Search, Filter, MoreHorizontal, Calendar, Bell, ChevronLeft, ChevronRight, Check
} from "lucide-react";
import {
  diagnosticsKpis, diagnosticsRows, diagnosticSignals,
  spendLeakageDetail,
} from "@/lib/genius-data";
import { ConfBar, EvidenceLink, Ring, Sparkline, StatusDot, ApprovalPill } from "../shared";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const toneStroke = {
  primary: "var(--primary)", critical: "var(--critical)",
  evidence: "var(--evidence)", warning: "var(--warning)", neutral: "rgba(255,255,255,0.2)",
};
const toneText = {
  primary: "text-primary", critical: "text-critical",
  evidence: "text-evidence", warning: "text-warning", neutral: "text-foreground",
};

// ── Icons for KPIs ────────────────────────────────────────────────────────────────
import { ShieldAlert, Fingerprint, Activity, Clock, AlertTriangle, AlertCircle, TrendingDown as TrendDownIcon, ListTodo } from "lucide-react";

function KpiIcon({ label, tone }) {
  const iconProps = { className: cn("size-4", toneText[tone] || "text-muted-foreground") };
  if (label.includes("DIAGNOSTICS SCORE")) return <Activity {...iconProps} />;
  if (label.includes("PROOF COVERAGE")) return <Fingerprint {...iconProps} />;
  if (label.includes("APPROVAL BACKLOG")) return <ListTodo {...iconProps} />;
  if (label.includes("RENEWAL EXPOSURE")) return <AlertTriangle {...iconProps} />;
  if (label.includes("SPEND LEAKAGE")) return <AlertCircle {...iconProps} />;
  if (label.includes("INVOICE MISMATCHES")) return <ShieldAlert {...iconProps} />;
  if (label.includes("CONFIDENCE AVG")) return <CheckCircle2 {...iconProps} />;
  if (label.includes("TIME TO FIRST FINDING")) return <Clock {...iconProps} />;
  return null;
}

// ── Diag KPI Card ─────────────────────────────────────────────────────────────────
function DiagKpi({ label, value, unit, trend, trendDir, sub, subTone, tone = "neutral", spark, ring, index = 0 }) {
  const down = trendDir === "down";
  // Determine if trend is positive or negative based on string and direction
  const isPositive = (trend?.startsWith("+") && !down) || (trend?.startsWith("-") && down) || tone === "primary";
  const trendColor = tone === "critical" ? "text-critical" : tone === "warning" ? "text-warning" : "text-primary";

  return (
    <div
      className="group relative flex min-w-[150px] flex-1 animate-fade-up flex-col gap-3 overflow-hidden rounded-xl border border-[#1E2730] bg-[#0A0C0B] p-4 transition-all hover:bg-[#0d0f0e]"
      style={{ animationDelay: `${index * 35}ms` }}
    >
      <div className="flex items-center gap-2">
        {!ring && (
          <div className="flex size-7 items-center justify-center rounded-full border border-[#1E2730] bg-[#141B21]">
            <KpiIcon label={label.toUpperCase()} tone={tone} />
          </div>
        )}
        <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      
      <div className="flex items-center gap-4 mt-1">
        {ring ? (
          <div className="relative flex size-14 items-center justify-center shrink-0">
            <svg viewBox="0 0 36 36" className="absolute inset-0 size-full -rotate-90">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={toneStroke[tone]} strokeWidth="3" strokeDasharray={`${value}, 100`} className="transition-all duration-1000" />
            </svg>
            <div className="flex flex-col items-center justify-center mt-0.5">
              <span className="text-[17px] font-bold leading-none text-white tabular-nums">{value}</span>
              {unit && <span className="text-[8px] text-muted-foreground mt-0.5">{unit}</span>}
            </div>
          </div>
        ) : (
          <span className="text-xl font-bold tabular-nums leading-none text-white">
            {value}{unit}
          </span>
        )}

        <div className="flex flex-col gap-1 min-w-0 flex-1">
          {trend && (
            <span className={cn("flex items-center gap-1 text-[10px] font-bold tabular-nums whitespace-nowrap", trendColor)}>
              {tone === "critical" || tone === "warning" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {trend}
            </span>
          )}
          <span className="text-[9px] text-muted-foreground whitespace-nowrap">vs last 7 days</span>
          {sub && <span className={cn("text-[9px] font-bold mt-1", subTone === "warning" ? "text-warning" : "text-muted-foreground")}>{sub}</span>}
        </div>
      </div>
    </div>
  );
}

// ── Trend Cell ───────────────────────────────────────────────────────────────────
function TrendEl({ trend }) {
  if (trend === "worsening") return (
    <span className="flex items-center gap-1 text-[10px] font-semibold text-critical">
      <TrendingUp className="size-3" />Worsening
    </span>
  );
  if (trend === "improving") return (
    <span className="flex items-center gap-1 text-[10px] font-semibold text-primary">
      <TrendingDown className="size-3" />Improving
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
      <Minus className="size-3" />Flat
    </span>
  );
}

// ── Detail Panel ────────────────────────────────────────────────────────────────
function DetailPanel({ detail, onClose, onNavigate, signalsCount = 0, proofTrailsCount = 0 }) {
  return (
    <div className="flex flex-col h-full overflow-hidden rounded-xl border border-[#1E2730] bg-[#0A0C0B]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E2730] px-5 py-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex size-1.5 items-center justify-center rounded-full bg-critical" />
          <span className="text-sm font-semibold text-white">{detail.category}</span>
          <span className="rounded border border-critical/25 bg-critical/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-critical">{detail.risk}</span>
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 rounded border border-[#1E2730] bg-transparent px-2.5 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-[#1E2730]">
                Open <ChevronDown className="size-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40 border-[#1E2730] bg-[#0A0C0B] text-muted-foreground">
              <DropdownMenuItem onClick={() => toast.success("Status changed to In progress")} className="text-[11px] focus:bg-[#1E2730] focus:text-white">In progress</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.success("Status changed to Review")} className="text-[11px] focus:bg-[#1E2730] focus:text-white">Review</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.success("Status changed to Closed")} className="text-[11px] focus:bg-[#1E2730] focus:text-white">Closed</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-[#1E2730] hover:text-white transition-colors ml-1">
                <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 border-[#1E2730] bg-[#0A0C0B] text-muted-foreground">
              <DropdownMenuItem onClick={() => toast.info("Viewing details")} className="text-[11px] focus:bg-[#1E2730] focus:text-white">View details</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.success("Shared")} className="text-[11px] focus:bg-[#1E2730] focus:text-white">Share</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.error("Archived")} className="text-[11px] focus:bg-[#1E2730] focus:text-critical text-critical">Archive</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button type="button" onClick={onClose} className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-[#1E2730] hover:text-white transition-colors">
            <X className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-5 flex flex-col gap-6">
        {/* Top Stats Row */}
        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-1 flex flex-col gap-2">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Category Score</span>
            <div className="flex items-center gap-4 mt-1">
              <div className="relative flex size-14 items-center justify-center shrink-0">
                <svg viewBox="0 0 36 36" className="absolute inset-0 size-full -rotate-90">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--critical)" strokeWidth="3" strokeDasharray={`${detail.score}, 100`} />
                </svg>
                <div className="flex flex-col items-center justify-center mt-0.5">
                  <span className="text-[17px] font-bold leading-none text-white">{detail.score}</span>
                  <span className="text-[8px] text-muted-foreground mt-0.5">/100</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-critical">{detail.risk}</span>
                <span className="flex items-center gap-1 text-[9px] font-semibold tabular-nums text-primary whitespace-nowrap">
                  <TrendingUp className="size-3" />{detail.trend}
                </span>
              </div>
            </div>
          </div>
          <div className="col-span-1 flex flex-col gap-2 border-l border-[#1E2730] pl-6">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Estimated Impact</span>
            <span className="text-xl font-bold tabular-nums text-white mt-1">{detail.estimatedImpact}</span>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">{detail.impactSub}</span>
            
            <div className="mt-4 flex flex-col gap-2">
              <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Confidence</span>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold tabular-nums text-white w-8">{detail.confidence}%</span>
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#1E2730]">
                  <div className="h-full rounded-full bg-primary/80" style={{ width: `${detail.confidence}%` }} />
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-2 flex flex-col gap-3 border-l border-[#1E2730] pl-6">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Top Drivers</span>
            <div className="flex flex-col gap-2">
              {detail.topDrivers.map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{d.name}</span>
                  <span className="text-[10px] font-medium text-white tabular-nums">{d.value} ({d.pct}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-[#1E2730] text-[11px] font-semibold shrink-0">
          <button type="button" className="border-b-2 border-white pb-2 text-white">Overview</button>
          <button type="button" className="border-b-2 border-transparent pb-2 text-muted-foreground hover:text-white transition-colors">Signals ({signalsCount})</button>
          <button type="button" className="border-b-2 border-transparent pb-2 text-muted-foreground hover:text-white transition-colors">Proof trails ({proofTrailsCount})</button>
          <button type="button" className="border-b-2 border-transparent pb-2 text-muted-foreground hover:text-white transition-colors">Trend</button>
          <button type="button" className="border-b-2 border-transparent pb-2 text-muted-foreground hover:text-white transition-colors">Related (6)</button>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col gap-6">
            {/* Narrative */}
            <div className="flex flex-col gap-3">
              <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Risk Narrative</span>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {detail.riskNarrative}
              </p>
            </div>

            {/* Recommended Action */}
            <div className="flex flex-col gap-3">
              <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Recommended Next Action</span>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                  <CheckCircle2 className="size-2.5 text-primary" />
                </div>
                <p className="text-[11px] leading-relaxed text-white">
                  {detail.recommendedAction}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toast.success("Action plan created")}
                  className="rounded bg-primary/20 border border-primary/30 px-4 py-1.5 text-[11px] font-bold text-primary transition-colors hover:bg-primary/30"
                >
                  Create action plan
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1.5 rounded border border-[#1E2730] bg-[#141B21] px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-[#1E2730]">
                      Assign <ChevronDown className="size-3 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-40 border-[#1E2730] bg-[#0A0C0B] text-muted-foreground">
                    <DropdownMenuItem onClick={() => toast.success("Assigned to Michael Wong")} className="text-[11px] focus:bg-[#1E2730] focus:text-white">Michael Wong (Procurement)</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.success("Assigned to Sarah Green")} className="text-[11px] focus:bg-[#1E2730] focus:text-white">Sarah Green (Finance)</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {/* Top Evidence */}
            <div className="flex flex-col gap-3">
              <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Top Evidence</span>
              <div className="flex flex-col gap-2">
                {detail.topEvidence.map((e) => (
                  <div key={e.name} className="flex items-center justify-between group">
                    <EvidenceLink>{e.name}</EvidenceLink>
                    <span className="text-[10px] font-medium tabular-nums text-muted-foreground">{e.value}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => toast.info("Opening all evidence...")} className="text-left text-[11px] font-medium text-primary hover:underline mt-1">
                View all evidence (24) →
              </button>
            </div>

            {/* Extracted Facts */}
            <div className="flex flex-col gap-3">
              <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Extracted Facts</span>
              <div className="flex flex-col gap-2.5">
                {detail.extractedFacts.map((f) => (
                  <div key={f.fact} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <span className="text-[10px] text-muted-foreground leading-snug">{f.fact}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => toast.info("Opening all facts...")} className="text-left text-[11px] font-medium text-primary hover:underline mt-1">
                View all facts (96) →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── buildDetailFromRow ────────────────────────────────────────────────────────────
function buildDetailFromRow(row) {
  if (!row) return null;
  const topDriversMap = {
    'Spend Leakage': [
      { name: 'Maverick spend', value: '$1.28M', pct: 40 },
      { name: 'Pricing drift', value: '$0.96M', pct: 30 },
      { name: 'Uncaptured discounts', value: '$0.62M', pct: 19 },
      { name: 'Off-contract vendors', value: '$0.35M', pct: 11 },
    ],
    'Renewal Risk': [
      { name: 'Above-benchmark renewals', value: '$4.12M', pct: 54 },
      { name: 'Auto-renew exposure', value: '$2.18M', pct: 29 },
      { name: 'Missing opt-out notices', value: '$1.32M', pct: 17 },
    ],
    'Missing Owner': [
      { name: 'Unowned contracts', value: '$620K', pct: 54 },
      { name: 'Unowned vendors', value: '$380K', pct: 33 },
      { name: 'Orphaned charges', value: '$140K', pct: 13 },
    ],
    'Invoice / Contract Mismatch': [
      { name: 'Price variance', value: '$420K', pct: 46 },
      { name: 'Quantity mismatch', value: '$310K', pct: 34 },
      { name: 'Coding errors', value: '$182K', pct: 20 },
    ],
    'Data Quality': [
      { name: 'Missing fields', value: '$240K', pct: 50 },
      { name: 'Duplicate records', value: '$140K', pct: 29 },
      { name: 'Stale data', value: '$100K', pct: 21 },
    ],
    'Approval Backlog': [
      { name: 'Overdue approvals', value: '$130K', pct: 59 },
      { name: 'SLA breach risk', value: '$60K', pct: 27 },
      { name: 'Pending escalations', value: '$30K', pct: 14 },
    ],
    'Duplicate Payments': [
      { name: 'Same vendor duplicates', value: '$190K', pct: 56 },
      { name: 'Split invoice duplicates', value: '$90K', pct: 26 },
      { name: 'System sync errors', value: '$60K', pct: 18 },
    ],
  };
  const topEvidenceMap = {
    'Spend Leakage': [
      { name: 'Maverick_purchases_Q1.pdf', value: '$620K' },
      { name: 'Contract_vs_PO_variance.xlsx', value: '$480K' },
      { name: 'Vendor_Benchmark_Report.pdf', value: '$310K' },
    ],
    'Renewal Risk': [
      { name: 'Contracts_Master.xlsx', value: '$4.12M' },
      { name: 'Microsoft_EA_Renewal_Quote.pdf', value: '$2.18M' },
      { name: 'Auto_Renewal_Calendar.xlsx', value: '$1.32M' },
    ],
    'Missing Owner': [
      { name: 'Vendor_Master_2026.csv', value: '$620K' },
      { name: 'Contracts_Unowned_May.xlsx', value: '$380K' },
      { name: 'GL_Orphan_Charges_Q2.pdf', value: '$140K' },
    ],
    'Invoice / Contract Mismatch': [
      { name: 'AP_Invoices_May.xlsx', value: '$420K' },
      { name: 'Contract_vs_Invoice_Diff.pdf', value: '$310K' },
      { name: 'PO_Mismatch_Report.csv', value: '$182K' },
    ],
    'Data Quality': [
      { name: 'Data_Quality_Report_May.pdf', value: '$240K' },
      { name: 'Missing_Fields_Audit.xlsx', value: '$140K' },
      { name: 'Duplicate_Records_May.csv', value: '$100K' },
    ],
    'Approval Backlog': [
      { name: 'Approval_Queue_May.xlsx', value: '$130K' },
      { name: 'SLA_Breach_Report.pdf', value: '$60K' },
      { name: 'Escalation_Log_May.csv', value: '$30K' },
    ],
    'Duplicate Payments': [
      { name: 'AP_Duplicate_Analysis.xlsx', value: '$190K' },
      { name: 'Split_Invoice_Report.pdf', value: '$90K' },
      { name: 'Sync_Error_Log_May.csv', value: '$60K' },
    ],
  };
  const narrativeMap = {
    'Spend Leakage': `We identified ${row.impact} in potential spend leakage across 47 categories. Maverick purchasing and pricing drift drive 34% of total leakage. ${row.proofTrails} proof trails support these findings with ${row.confidence}% confidence.`,
    'Renewal Risk': `${row.signals} contracts are scheduled to renew without formal review. The total exposure is ${row.impact}. Immediate procurement review is recommended before auto-renewal triggers.`,
    'Missing Owner': `${row.signals} unowned contracts and vendors have been identified with ${row.impact} in exposure. Assigning owners will immediately reduce operational and financial risk.`,
    'Invoice / Contract Mismatch': `${row.signals} invoice mismatches have been detected against contract rates and quantities. Total deviation is ${row.impact}. Credit notes and dispute letters are recommended.`,
    'Data Quality': `Data quality issues have been found across ${row.signals} records. Total impact on analysis accuracy is estimated at ${row.impact}. A data remediation sprint is recommended.`,
    'Approval Backlog': `${row.signals} approvals are pending beyond SLA thresholds. Cumulative risk exposure is ${row.impact}. Escalation to senior management is advised for overdue items.`,
    'Duplicate Payments': `${row.signals} duplicate payment transactions have been identified. Total recoverable amount is ${row.impact}. Immediate void-and-recover process should be initiated.`,
  };
  const recommendedActionMap = {
    'Spend Leakage': 'Review top 20 vendors with highest leakage and initiate pricing alignment. Enforce PO compliance and capture available discounts before Q3 close.',
    'Renewal Risk': 'Prioritize review of all contracts renewing within 60 days. Renegotiate above-benchmark renewals and set opt-out notices for auto-renewing contracts.',
    'Missing Owner': 'Run an ownership assignment sprint across all unowned contracts and vendors. Notify department leads to claim ownership within 48 hours.',
    'Invoice / Contract Mismatch': 'Cross-reference all flagged invoices against signed contract rates. Issue dispute letters and request credit notes for confirmed discrepancies.',
    'Data Quality': 'Run automated deduplication and field-completion sweep. Prioritize records with financial impact and assign data steward for each category.',
    'Approval Backlog': 'Escalate all overdue approvals to department heads. Set SLA reminders for items approaching breach and enable auto-escalation in workflow settings.',
    'Duplicate Payments': 'Immediately void identified duplicate payments and initiate recovery requests. Review AP workflow to prevent recurrence.',
  };
  const riskToneMap = {
    'Spend Leakage': row.score < 55 ? 'High risk' : 'Medium risk',
    'Renewal Risk': 'High risk',
    'Missing Owner': 'Medium risk',
    'Invoice / Contract Mismatch': row.score < 50 ? 'High risk' : 'Medium risk',
    'Data Quality': 'Medium risk',
    'Approval Backlog': 'Medium risk',
    'Duplicate Payments': 'Medium risk',
  };
  const extractedFactsMap = {
    'Spend Leakage': [
      { fact: `${row.signals} off-contract transactions detected`, ok: true },
      { fact: 'Average price variance: 8% above contract rate', ok: true },
      { fact: `${row.proofTrails} proof trails verified at ${row.confidence}% confidence`, ok: true },
      { fact: 'Enforcement gap: 36 transactions without PO reference', ok: false },
    ],
    'Renewal Risk': [
      { fact: `${row.signals} contracts auto-renewing within 60 days`, ok: true },
      { fact: 'Benchmark deviation: avg 14% above market rate', ok: true },
      { fact: `${row.proofTrails} renewal contracts reviewed`, ok: true },
      { fact: '8 contracts missing renewal owner assignment', ok: false },
    ],
    'Missing Owner': [
      { fact: `${row.signals} contracts without assigned owner`, ok: true },
      { fact: 'Last ownership review: Q1 2026', ok: true },
      { fact: `${row.proofTrails} ownership gaps identified`, ok: true },
      { fact: 'No escalation path defined for 12 contracts', ok: false },
    ],
    'Invoice / Contract Mismatch': [
      { fact: `${row.signals} invoice lines do not match contract terms`, ok: true },
      { fact: 'Average price delta: 9.4% above agreed rate', ok: true },
      { fact: `${row.proofTrails} source documents cross-referenced`, ok: true },
      { fact: '14 invoices paid without PO authorization', ok: false },
    ],
    'Data Quality': [
      { fact: `${row.signals} records with missing required fields`, ok: true },
      { fact: 'Duplicate rate: 3.2% of total records', ok: true },
      { fact: `${row.proofTrails} data quality checks completed`, ok: true },
      { fact: 'Data steward not assigned for 7 categories', ok: false },
    ],
    'Approval Backlog': [
      { fact: `${row.signals} approvals pending beyond SLA`, ok: true },
      { fact: 'Average delay: 4.2 business days', ok: true },
      { fact: `${row.proofTrails} approval workflows audited`, ok: true },
      { fact: 'No auto-escalation configured for 6 workflow types', ok: false },
    ],
    'Duplicate Payments': [
      { fact: `${row.signals} duplicate payment pairs identified`, ok: true },
      { fact: 'Average duplicate amount: $28.3K per pair', ok: true },
      { fact: `${row.proofTrails} bank statements reviewed`, ok: true },
      { fact: 'Vendor master deduplication not enabled', ok: false },
    ],
  };
  return {
    category: row.category,
    score: row.score,
    risk: riskToneMap[row.category] || 'Medium risk',
    riskTone: row.score < 55 ? 'critical' : 'warning',
    trend: row.trend === 'worsening' ? '+8 pts vs last 7 days' : row.trend === 'improving' ? '-5 pts vs last 7 days' : 'Flat vs last 7 days',
    estimatedImpact: row.impact,
    impactSub: row.impactTone === 'critical' ? 'High business impact' : 'Medium business impact',
    confidence: row.confidence,
    topDrivers: topDriversMap[row.category] || [{ name: 'Primary driver', value: row.impact, pct: 100 }],
    riskNarrative: narrativeMap[row.category] || `${row.signals} signals detected. ${row.impact} exposure identified.`,
    topEvidence: topEvidenceMap[row.category] || [{ name: 'Evidence_File.xlsx', value: row.impact }],
    extractedFacts: extractedFactsMap[row.category] || [{ fact: `${row.signals} signals analyzed`, ok: true }],
    recommendedAction: recommendedActionMap[row.category] || 'Review findings and assign owner.',
    relatedImpacts: [],
  };
}

// ── Main Export ───────────────────────────────────────────────────────────────────
export default function Diagnostics({ onNavigate }) {
  const [selectedRow, setSelectedRow] = useState(diagnosticsRows[0]);
  const [activeTab, setActiveTab] = useState("Overview");
  const dynamicDetail = buildDetailFromRow(selectedRow);

  const tabs = ["Overview", "Signals", "Proof Trails", "Trends", "Benchmarks"];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* KPI Strip */}
      <div className="flex flex-wrap gap-4">
        {diagnosticsKpis.map((kpi, i) => (
          <DiagKpi key={kpi.label} index={i} {...kpi} />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6 h-[720px]">
        {/* Left Column */}
        <div className="col-span-12 xl:col-span-7 flex flex-col border border-[#1E2730] bg-[#0A0C0B] rounded-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center gap-6 px-6 pt-4 border-b border-[#1E2730] text-[11px] font-semibold shrink-0">
            {tabs.map(t => (
              <button 
                key={t}
                onClick={() => setActiveTab(t)}
                className={cn(
                  "pb-3 transition-colors relative",
                  activeTab === t ? "text-white" : "text-muted-foreground hover:text-white"
                )}
              >
                {t}
                {activeTab === t && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t-full" />}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between px-6 py-4 shrink-0 border-b border-[#1E2730]">
            <div className="flex items-center gap-3">
              {["All Categories", "All Severity", "All Owners", "All Business Areas"].map(f => (
                <DropdownMenu key={f}>
                  <DropdownMenuTrigger className="flex items-center gap-1.5 rounded border border-[#1E2730] bg-transparent px-3 py-1.5 text-[10px] text-muted-foreground hover:bg-[#141B21] transition-colors">
                      {f} <ChevronDown className="size-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-40 border-[#1E2730] bg-[#0A0C0B] text-muted-foreground">
                    <DropdownMenuItem onClick={() => toast.success(`${f} selected`)} className="text-[11px] focus:bg-[#1E2730] focus:text-white">Option 1</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.success(`${f} selected`)} className="text-[11px] focus:bg-[#1E2730] focus:text-white">Option 2</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.success(`${f} selected`)} className="text-[11px] focus:bg-[#1E2730] focus:text-white">Option 3</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}
              <div className="w-px h-4 bg-[#1E2730] mx-1" />
              <button onClick={() => toast.info("Opening advanced filters...")} className="flex items-center gap-1.5 rounded border border-[#1E2730] bg-transparent px-3 py-1.5 text-[10px] text-white hover:bg-[#141B21] transition-colors">
                <Filter className="size-3 text-muted-foreground" /> Filters
              </button>
              <button onClick={() => toast.success("Filters cleared")} className="text-[10px] text-primary hover:underline ml-2 font-medium">Clear all</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#1E2730]">
                  <th className="py-3 text-left text-[9px] font-semibold uppercase tracking-widest text-muted-foreground w-6 px-4"></th>
                  <th className="py-3 text-left text-[9px] font-semibold uppercase tracking-widest text-muted-foreground w-40">Category</th>
                  <th className="py-3 text-left text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Score</th>
                  <th className="py-3 text-left text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Signals</th>
                  <th className="py-3 text-left text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Est. Impact</th>
                  <th className="py-3 text-left text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Trend (7D)</th>
                  <th className="py-3 text-left text-[9px] font-semibold uppercase tracking-widest text-muted-foreground w-20">Confidence</th>
                  <th className="py-3 text-left text-[9px] font-semibold uppercase tracking-widest text-muted-foreground text-center">Proof Trails</th>
                  <th className="py-3 text-left text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Owner</th>
                  <th className="py-3 text-left text-[9px] font-semibold uppercase tracking-widest text-muted-foreground px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {diagnosticsRows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedRow(row)}
                    className={cn(
                      "cursor-pointer border-b border-[#1E2730]/50 transition-colors hover:bg-white/[0.02]",
                      selectedRow?.id === row.id && "bg-white/[0.05] border-l-2 border-l-primary border-r-0 border-y-[#1E2730]"
                    )}
                  >
                    <td className="py-3 px-4 text-center">
                      <div className={cn("size-2 rounded-full mx-auto", row.score < 55 ? "bg-critical" : row.score < 70 ? "bg-warning" : "bg-primary")} />
                    </td>
                    <td className="py-3 pr-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-semibold text-white whitespace-nowrap">{row.category}</span>
                        <span className="text-[9px] text-muted-foreground line-clamp-1">{row.description}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="relative flex size-7 items-center justify-center">
                        <svg viewBox="0 0 36 36" className="absolute inset-0 size-full -rotate-90">
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={row.score < 55 ? "var(--critical)" : row.score < 70 ? "var(--warning)" : "var(--primary)"} strokeWidth="4" strokeDasharray={`${row.score}, 100`} />
                        </svg>
                        <span className="text-[9px] font-bold leading-none text-white tabular-nums">{row.score}</span>
                      </div>
                    </td>
                    <td className="py-3 text-[10px] font-bold">
                      <div className="flex flex-col items-start gap-0.5">
                        <span className={cn(row.signalTone === "critical" ? "text-critical" : "text-warning")}>
                          {row.signals}
                        </span>
                        <span className={cn("text-[8px] uppercase tracking-widest", row.signalTone === "critical" ? "text-critical" : "text-warning")}>
                          {row.signalTone === "critical" ? "High" : "Medium"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="text-[11px] font-bold tabular-nums text-white">{row.impact}</span>
                        <span className={cn("text-[9px] uppercase tracking-widest font-semibold", row.impactTone === "critical" ? "text-critical" : "text-warning")}>
                          {row.impactTone === "critical" ? "High" : "Medium"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <TrendEl trend={row.trend} />
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold tabular-nums text-white">{row.confidence}%</span>
                        <div className="h-1 w-12 overflow-hidden rounded-full bg-[#1E2730]">
                          <div className="h-full rounded-full bg-primary/80" style={{ width: `${row.confidence}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-center text-[11px] font-bold tabular-nums text-white">
                      {row.proofTrails}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-white whitespace-nowrap">{row.owner.split(" / ")[0]}</span>
                        <span className="text-[9px] text-muted-foreground">{row.owner.split(" / ")[1]}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn("rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest",
                        row.status === "Open" ? "border-critical/25 text-critical" :
                        row.status === "Review" ? "border-warning/25 text-warning" :
                        "border-primary/25 text-primary"
                      )}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="flex items-center justify-between border-t border-[#1E2730] px-6 py-3 text-[11px] text-muted-foreground">
              <span>Showing 1 to 7 of 7 categories</span>
              <div className="flex items-center gap-4">
                <span>Rows per page:</span>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 font-medium text-white bg-[#141B21] border border-[#1E2730] rounded px-2 py-1 transition-colors hover:bg-[#1E2730]">
                      10 <ChevronDown className="size-3 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-16 min-w-0 border-[#1E2730] bg-[#0A0C0B] text-muted-foreground">
                    <DropdownMenuItem onClick={() => toast.success("Rows set to 10")} className="text-[11px] focus:bg-[#1E2730] focus:text-white">10</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.success("Rows set to 25")} className="text-[11px] focus:bg-[#1E2730] focus:text-white">25</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.success("Rows set to 50")} className="text-[11px] focus:bg-[#1E2730] focus:text-white">50</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Recent diagnostic signals */}
            <div className="flex flex-col border-t border-[#1E2730]">
              <div className="px-6 py-4 flex flex-col gap-4">
                <span className="text-[11px] font-semibold text-white">Recent diagnostic signals</span>
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="border-b border-[#1E2730] text-muted-foreground">
                      <th className="py-2 text-left font-semibold uppercase tracking-widest w-24">Time</th>
                      <th className="py-2 text-left font-semibold uppercase tracking-widest w-20">Severity</th>
                      <th className="py-2 text-left font-semibold uppercase tracking-widest">Signal</th>
                      <th className="py-2 text-left font-semibold uppercase tracking-widest w-32">Category</th>
                      <th className="py-2 text-left font-semibold uppercase tracking-widest w-40">Source Evidence</th>
                      <th className="py-2 text-left font-semibold uppercase tracking-widest w-20">Impact</th>
                      <th className="py-2 text-left font-semibold uppercase tracking-widest w-20">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diagnosticSignals.map((sig, i) => (
                      <tr key={i} className="border-b border-[#1E2730]/50 text-muted-foreground transition-colors hover:bg-white/[0.02] last:border-0">
                        <td className="py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={cn("size-1.5 rounded-full", 
                              sig.severity === "High" ? "bg-critical" : 
                              sig.severity === "Medium" ? "bg-warning" : "bg-primary"
                            )} />
                            {sig.time}
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={cn("font-semibold uppercase tracking-widest",
                            sig.severity === "High" ? "text-critical" : 
                            sig.severity === "Medium" ? "text-warning" : "text-primary"
                          )}>{sig.severity}</span>
                        </td>
                        <td className="py-3 text-white pr-4 line-clamp-1">{sig.signal}</td>
                        <td className="py-3">{sig.category}</td>
                        <td className="py-3 text-primary hover:underline cursor-pointer">{sig.evidence}</td>
                        <td className="py-3 font-semibold tabular-nums text-white">{sig.impact}</td>
                        <td className="py-3">{sig.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button onClick={() => toast.info("Opening all signals...")} className="text-left text-[11px] font-medium text-primary hover:underline w-fit mt-1">
                  View all signals →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-12 xl:col-span-5 h-full">
          {selectedRow && dynamicDetail ? (
            <DetailPanel
              detail={dynamicDetail}
              onClose={() => setSelectedRow(null)}
              onNavigate={onNavigate}
              signalsCount={selectedRow.signals}
              proofTrailsCount={selectedRow.proofTrails}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-xl border border-[#1E2730] border-dashed bg-[#0A0C0B]/50 p-8 text-center">
              <Activity className="mb-3 size-8 text-muted-foreground/30" />
              <span className="text-sm font-semibold text-white">Select a category</span>
              <span className="mt-1 max-w-[200px] text-[11px] text-muted-foreground">Click on any diagnostic category to view detailed analysis and proof trails.</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom Row - Related business impacts */}
      <div className="flex flex-col gap-4 border border-[#1E2730] bg-[#0A0C0B] rounded-xl p-5">
        <span className="text-[11px] font-semibold text-white">Related business impacts</span>
        <div className="grid grid-cols-5 gap-6">
          <div className="flex flex-col gap-2 rounded-xl border border-[#1E2730] bg-[#141B21]/30 p-4 relative overflow-hidden group hover:border-[#ffffff15] transition-colors">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Budget variance</span>
            <div className="flex flex-col z-10">
              <span className="text-xl font-bold tabular-nums text-white">-8.7%</span>
              <span className="text-[9px] text-muted-foreground mt-0.5">vs budget</span>
            </div>
            
            <div className="mt-5 pt-3 border-t border-[#1E2730]/50 z-10">
              <span className="text-[10px] text-muted-foreground">Impact: <span className="text-white">$2.14M</span></span>
            </div>
            {/* SVG Sparkline Mockup */}
            <svg viewBox="0 0 100 30" className="absolute bottom-12 left-4 right-4 h-8 w-[calc(100%-2rem)] opacity-50 transition-opacity group-hover:opacity-100" preserveAspectRatio="none">
              <path d="M0,20 L10,10 L20,15 L30,5 L40,10 L50,0 L60,8 L70,2 L80,12 L90,5 L100,10" fill="none" stroke="var(--primary)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
          
          <div className="flex flex-col gap-2 rounded-xl border border-[#1E2730] bg-[#141B21]/30 p-4 relative overflow-hidden group hover:border-[#ffffff15] transition-colors">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Cost avoidance potential</span>
            <div className="flex flex-col z-10">
              <span className="text-xl font-bold tabular-nums text-white">$1.92M</span>
              <span className="text-[9px] text-muted-foreground mt-0.5">identified</span>
            </div>
            
            <div className="mt-5 pt-3 border-t border-[#1E2730]/50 z-10">
              <span className="text-[10px] text-muted-foreground">Confidence: <span className="text-white">87%</span></span>
            </div>
            {/* SVG Sparkline Mockup */}
            <svg viewBox="0 0 100 30" className="absolute bottom-12 left-4 right-4 h-8 w-[calc(100%-2rem)] opacity-50 transition-opacity group-hover:opacity-100" preserveAspectRatio="none">
              <path d="M0,25 L15,15 L30,20 L45,10 L60,15 L75,5 L90,10 L100,2" fill="none" stroke="var(--primary)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-[#1E2730] bg-[#141B21]/30 p-4 relative overflow-hidden group hover:border-[#ffffff15] transition-colors">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Cash at risk (30 days)</span>
            <div className="flex flex-col z-10">
              <span className="text-xl font-bold tabular-nums text-white">$2.45M</span>
              <span className="text-[9px] text-muted-foreground mt-0.5">exposure</span>
            </div>
            
            <div className="mt-5 pt-3 border-t border-[#1E2730]/50 z-10">
              <span className="text-[10px] text-muted-foreground">vs last week <span className="text-critical font-bold ml-1">↑ 9%</span></span>
            </div>
            {/* SVG Sparkline Mockup */}
            <svg viewBox="0 0 100 30" className="absolute bottom-12 left-4 right-4 h-8 w-[calc(100%-2rem)] opacity-50 transition-opacity group-hover:opacity-100" preserveAspectRatio="none">
              <path d="M0,5 L15,15 L30,5 L45,20 L60,10 L75,25 L90,15 L100,25" fill="none" stroke="var(--critical)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-[#1E2730] bg-[#141B21]/30 p-4 relative overflow-hidden group hover:border-[#ffffff15] transition-colors">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Contracts auto-renewing</span>
            <div className="flex flex-col z-10">
              <span className="text-xl font-bold tabular-nums text-white">12</span>
              <span className="text-[9px] text-muted-foreground mt-0.5">at risk</span>
            </div>
            
            <div className="mt-5 pt-3 border-t border-[#1E2730]/50 z-10">
              <span className="text-[10px] text-muted-foreground">Value: <span className="text-white">$3.05M</span></span>
            </div>
            {/* SVG Sparkline Mockup */}
            <svg viewBox="0 0 100 30" className="absolute bottom-12 left-4 right-4 h-8 w-[calc(100%-2rem)] opacity-50 transition-opacity group-hover:opacity-100" preserveAspectRatio="none">
              <path d="M0,15 L20,15 L40,15 L60,25 L80,15 L100,25" fill="none" stroke="var(--critical)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-[#1E2730] bg-[#141B21]/30 p-4 relative overflow-hidden group hover:border-[#ffffff15] transition-colors">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Suppliers over contract</span>
            <div className="flex flex-col z-10">
              <span className="text-xl font-bold tabular-nums text-white">24%</span>
              <span className="text-[9px] text-muted-foreground mt-0.5">of spend</span>
            </div>
            
            <div className="mt-5 pt-3 border-t border-[#1E2730]/50 z-10">
              <span className="text-[10px] text-muted-foreground">vs last week <span className="text-primary font-bold ml-1">↑ 3%</span></span>
            </div>
            {/* SVG Sparkline Mockup */}
            <svg viewBox="0 0 100 30" className="absolute bottom-12 left-4 right-4 h-8 w-[calc(100%-2rem)] opacity-50 transition-opacity group-hover:opacity-100" preserveAspectRatio="none">
              <path d="M0,25 L20,15 L40,20 L60,10 L80,5 L100,0" fill="none" stroke="var(--warning)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
