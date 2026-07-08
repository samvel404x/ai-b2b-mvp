import { ArrowDownRight, ArrowUpRight, ExternalLink, FileText, FileSpreadsheet, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/genius-data";

// ── Tone helpers ──────────────────────────────────────────────────────────────
export const toneStroke = {
  primary: "var(--primary)",
  critical: "var(--critical)",
  evidence: "var(--evidence)",
  warning: "var(--warning)",
  neutral: "rgba(255,255,255,0.25)",
};
export const toneText = {
  primary: "text-primary",
  critical: "text-critical",
  evidence: "text-evidence",
  warning: "text-warning",
  neutral: "text-foreground",
};
export const toneAccent = {
  primary: "stat-accent-primary",
  critical: "stat-accent-critical",
  warning: "stat-accent-warning",
  evidence: "stat-accent-evidence",
  neutral: "",
};

// ── Severity Badge ────────────────────────────────────────────────────────────
const severityStyles = {
  Critical: "bg-critical/10 text-critical border-critical/25",
  High: "bg-warning/10 text-warning border-warning/25",
  Medium: "bg-evidence/10 text-evidence border-evidence/25",
  Low: "bg-white/5 text-muted-foreground border-white/8",
};

export function SeverityBadge({ level }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest",
      severityStyles[level] || severityStyles.Low,
    )}>
      <span className="size-1.5 rounded-full bg-current" />
      {level}
    </span>
  );
}

// ── Approval Pill ─────────────────────────────────────────────────────────────
const approvalStyles = {
  "Open": "border-warning/30 bg-warning/10 text-warning",
  "In progress": "border-primary/30 bg-primary/10 text-primary",
  "Review": "border-evidence/30 bg-evidence/10 text-evidence",
  "Approved": "border-primary/30 bg-primary/10 text-primary",
  "Rejected": "border-critical/30 bg-critical/10 text-critical",
  "Pending": "border-warning/30 bg-warning/10 text-warning",
  "Monitoring": "border-evidence/30 bg-evidence/10 text-evidence",
  "Included": "border-primary/30 bg-primary/10 text-primary",
};
export function ApprovalPill({ state }) {
  const s = approvalStyles[state] || "border-[#1E2730] bg-[#141B21] text-muted-foreground";
  return (
    <span className={cn(
      "inline-flex items-center rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap",
      s,
    )}>
      {state}
    </span>
  );
}

// ── State Pill ────────────────────────────────────────────────────────────────
const stateStyles = {
  Pending: "bg-warning/10 text-warning border border-warning/20",
  "In review": "bg-evidence/10 text-evidence border border-evidence/20",
  Snoozed: "bg-white/5 text-muted-foreground border border-white/8",
  Approved: "bg-primary/10 text-primary border border-primary/20",
  Done: "bg-primary/10 text-primary border border-primary/20",
  Rejected: "bg-critical/10 text-critical border border-critical/20",
};
export function StatePill({ state }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold",
      stateStyles[state] || "bg-white/5 text-muted-foreground border border-white/8",
    )}>
      {state}
    </span>
  );
}

// ── Status Dot ────────────────────────────────────────────────────────────────
const dotTone = {
  online: "bg-primary", connected: "bg-primary", healthy: "bg-primary",
  Healthy: "bg-primary", ok: "bg-primary", Connected: "bg-primary",
  Active: "bg-primary", Degraded: "bg-warning", retry: "bg-warning",
  Idle: "bg-muted-foreground", Paused: "bg-warning", Waiting: "bg-warning",
  offline: "bg-critical", "Not connected": "bg-muted-foreground",
  Blocked: "bg-critical", primary: "bg-primary", warning: "bg-warning",
  critical: "bg-critical", evidence: "bg-evidence",
};
export function StatusDot({ tone, className, pulse }) {
  const color = dotTone[tone] || "bg-[#3a4040]";
  return (
    <span className={cn("relative inline-flex items-center justify-center", className)}>
      {pulse && ["bg-primary", "bg-warning"].includes(color) && (
        <span className={cn("absolute inline-flex size-2 animate-ping rounded-full opacity-50", color)} />
      )}
      <span className={cn("relative size-1.5 rounded-full", color)} />
    </span>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────
export function Panel({
  title, description, actions, children,
  className, contentClassName, titleClassName,
  icon: Icon, accent,
}) {
  return (
    <section className={cn(
      "relative flex flex-col overflow-hidden rounded-xl border border-[#1E2730] bg-[#0A0C0B]",
      className,
    )}>
      {accent && (
        <div className={cn("absolute inset-x-0 top-0 h-px", {
          "bg-primary/60": accent === "primary",
          "bg-critical/60": accent === "critical",
          "bg-warning/60": accent === "warning",
          "bg-evidence/60": accent === "evidence",
        })} />
      )}
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-[#1E2730] px-4 py-3">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <span className="flex size-6 items-center justify-center rounded bg-[#141B21] text-muted-foreground">
                <Icon className="size-3.5" />
              </span>
            )}
            <div className="flex items-center gap-2">
              {title && (
                <h2 className={cn(
                  "text-[11px] font-semibold uppercase tracking-widest text-white",
                  titleClassName,
                )}>{title}</h2>
              )}
              {description && (
                typeof description === "string"
                  ? <span className="text-[10px] text-muted-foreground">{description}</span>
                  : description
              )}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn("flex-1", contentClassName)}>{children}</div>
    </section>
  );
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
export function Sparkline({ data = [], stroke = "var(--primary)", className }) {
  if (!data.length) return null;
  const w = 100, h = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const step = w / (data.length - 1 || 1);
  const points = data.map((d, i) => [i * step, h - ((d - min) / span) * (h - 4) - 2]);
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  // Deterministic id — no Math.random() to avoid SSR hydration mismatch
  const id = `spark-${stroke.replace(/[^a-z0-9]/gi, "")}-${data.length}-${Math.round((data[0] ?? 0) * 100)}-${Math.round((data[data.length - 1] ?? 0) * 100)}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={cn("h-6 w-full", className)}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// ── Metric Card (generic) ─────────────────────────────────────────────────────
export function MetricCard({ label, value, unit, format, trend, tone = "neutral", hint, spark, index = 0 }) {
  const display = format === "currency" ? formatCurrency(value) : `${value}${unit || ""}`;
  const trendUp = trend?.startsWith("+");
  const trendDown = trend?.startsWith("-");
  return (
    <div
      className={cn(
        "group relative flex animate-fade-up flex-col gap-2.5 overflow-hidden rounded-xl border border-[#1E2730] bg-[#0A0C0B] p-4 transition-all duration-300 hover:bg-[#0d0f0e]",
        toneAccent[tone],
      )}
      style={{ animationDelay: `${index * 55}ms` }}
    >
      <div className="flex items-start justify-between gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground leading-snug">{label}</span>
        {trend && (
          <span className={cn(
            "inline-flex shrink-0 items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold tabular",
            trendUp ? "bg-primary/10 text-primary" : trendDown ? "bg-critical/10 text-critical" : "text-muted-foreground",
          )}>
            {trendUp && <ArrowUpRight className="size-2.5" />}
            {trendDown && <ArrowDownRight className="size-2.5" />}
            {trend}
          </span>
        )}
      </div>
      <div className={cn("text-xl font-bold leading-none tracking-tight tabular", toneText[tone] || "text-foreground")}>
        {display}
      </div>
      {spark && <Sparkline data={spark} stroke={toneStroke[tone]} />}
      {hint && <p className="text-[9.5px] leading-snug text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ── Ring ──────────────────────────────────────────────────────────────────────
export function Ring({ value, size = 68, label, stroke = "var(--primary)", hideLabel = false }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={4} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={stroke} strokeWidth={4} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 800ms cubic-bezier(0.16,1,0.3,1)", filter: `drop-shadow(0 0 5px ${stroke}50)` }}
        />
      </svg>
      {!hideLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[13px] font-bold tabular text-white leading-none">{value}</span>
          {label && <span className="text-[8px] text-muted-foreground mt-0.5">{label}</span>}
        </div>
      )}
    </div>
  );
}

// ── Evidence Link ─────────────────────────────────────────────────────────────
const evidenceIconMap = {
  pdf: FileText,
  xlsx: FileSpreadsheet,
  csv: FileText,
  xls: FileSpreadsheet,
};
export function EvidenceLink({ children }) {
  const ext = String(children)?.split(".").pop()?.toLowerCase();
  const Icon = evidenceIconMap[ext] || File;
  return (
    <button
      type="button"
      className="inline-flex max-w-full items-center gap-1 truncate text-left text-[10px] font-medium text-evidence transition-colors hover:text-evidence/70"
    >
      <Icon className="size-3 shrink-0 opacity-70" />
      <span className="truncate">{children}</span>
      <ExternalLink className="size-2.5 shrink-0 opacity-40" />
    </button>
  );
}

// ── Confidence Bar ────────────────────────────────────────────────────────────
export function ConfBar({ value, className }) {
  const color = value >= 85 ? "bg-primary" : value >= 70 ? "bg-warning" : "bg-critical";
  const textColor = value >= 85 ? "text-primary" : value >= 70 ? "text-warning" : "text-critical";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/5">
        <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${value}%` }} />
      </div>
      <span className={cn("w-7 shrink-0 text-right text-[10px] font-bold tabular", textColor)}>{value}%</span>
    </div>
  );
}

// ── Page Header ───────────────────────────────────────────────────────────────
export function PageHeader({ title, description, actions, eyebrow }) {
  return (
    <div className="flex animate-fade-up flex-col gap-3 pb-5 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-1.5">
        {eyebrow && (
          <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-primary">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-1.5 animate-ping rounded-full bg-primary opacity-50" />
              <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
            </span>
            {eyebrow}
          </span>
        )}
        <h1 className="text-xl font-bold tracking-tight text-white">{title}</h1>
        {description && (
          <p className="text-[11px] text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
