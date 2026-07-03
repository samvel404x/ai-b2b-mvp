import { ArrowDownRight, ArrowUpRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/genius-data";

// ── Severity Badge ──────────────────────────────────────────────────────────
const severityStyles = {
  Critical: "bg-critical/12 text-critical border-critical/25 shadow-[0_0_8px_rgba(242,85,90,0.08)]",
  High:     "bg-warning/12 text-warning border-warning/25",
  Medium:   "bg-evidence/10 text-evidence border-evidence/20",
  Low:      "bg-white/4 text-[#5a6660] border-white/6",
};

export function SeverityBadge({ level }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
      severityStyles[level] || severityStyles.Low,
    )}>
      <span className="size-1.5 rounded-full bg-current" />
      {level}
    </span>
  );
}

// ── State Pill ───────────────────────────────────────────────────────────────
const stateStyles = {
  Pending:    "bg-warning/10 text-warning border border-warning/20",
  "In review": "bg-evidence/10 text-evidence border border-evidence/20",
  Snoozed:    "bg-white/5 text-[#5a6660] border border-white/8",
  Approved:   "bg-primary/10 text-primary border border-primary/20",
  Done:       "bg-primary/10 text-primary border border-primary/20",
  Rejected:   "bg-critical/10 text-critical border border-critical/20",
};

export function StatePill({ state }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold",
      stateStyles[state] || "bg-white/5 text-[#5a6660] border border-white/8",
    )}>
      {state}
    </span>
  );
}

// ── Status Dot ───────────────────────────────────────────────────────────────
const dotTone = {
  online: "bg-primary", connected: "bg-primary", healthy: "bg-primary",
  ok: "bg-primary", Connected: "bg-primary", Active: "bg-primary",
  Degraded: "bg-warning", retry: "bg-warning", Idle: "bg-[#5a6660]",
  Paused: "bg-warning", offline: "bg-critical", "Not connected": "bg-[#3a4040]",
  Waiting: "bg-warning", Blocked: "bg-critical",
};

export function StatusDot({ tone, className, pulse }) {
  const color = dotTone[tone] || "bg-[#3a4040]";
  return (
    <span className={cn("relative inline-flex", className)}>
      {pulse && (color === "bg-primary" || color === "bg-warning") && (
        <span className={cn("absolute inline-flex size-2 animate-ping rounded-full opacity-50", color)} />
      )}
      <span className={cn("relative size-2 rounded-full", color)} />
    </span>
  );
}

// ── Page Header ──────────────────────────────────────────────────────────────
export function PageHeader({ title, description, actions, eyebrow }) {
  return (
    <div className="flex animate-fade-up flex-col gap-3 pb-5 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-1.5">
        {eyebrow && (
          <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            {eyebrow}
          </span>
        )}
        <h1 className="text-balance text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-pretty text-sm leading-relaxed text-[#5a6660]">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}

// ── Panel ────────────────────────────────────────────────────────────────────
export function Panel({ title, description, actions, children, className, contentClassName, icon: Icon, accent }) {
  return (
    <section className={cn(
      "relative flex flex-col overflow-hidden rounded-xl border border-[#ffffff08] bg-[#0a0c0b] transition-colors",
      className,
    )}>
      {accent && (
        <div className={cn("absolute inset-x-0 top-0 h-px", {
          "bg-primary/50": accent === "primary",
          "bg-critical/50": accent === "critical",
          "bg-warning/50": accent === "warning",
          "bg-evidence/50": accent === "evidence",
        })} />
      )}
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-[#ffffff06] px-4 py-3">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <span className="flex size-7 items-center justify-center rounded-md bg-[#131614] text-[#5a6660]">
                <Icon className="size-3.5" />
              </span>
            )}
            <div className="flex flex-col gap-0.5">
              {title && <h2 className="text-sm font-semibold text-foreground">{title}</h2>}
              {description && <p className="text-xs text-[#4a5450]">{description}</p>}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn("flex-1 p-4", contentClassName)}>{children}</div>
    </section>
  );
}

// ── Sparkline ────────────────────────────────────────────────────────────────
export function Sparkline({ data = [], stroke = "var(--primary)", className }) {
  if (!data.length) return null;
  const w = 100, h = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const step = w / (data.length - 1 || 1);
  const points = data.map((d, i) => [i * step, h - ((d - min) / span) * (h - 6) - 3]);
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  const id = `spark-${stroke.replace(/[^a-z0-9]/gi, "")}${Math.random().toString(36).slice(2, 6)}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={cn("h-7 w-full", className)}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.3" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// ── Metric Card ──────────────────────────────────────────────────────────────
const toneText = {
  primary: "text-primary", critical: "text-critical",
  evidence: "text-evidence", warning: "text-warning", neutral: "text-foreground",
};
const toneStroke = {
  primary: "var(--primary)", critical: "var(--critical)",
  evidence: "var(--evidence)", warning: "var(--warning)", neutral: "var(--muted-foreground)",
};
const toneAccent = {
  primary: "stat-accent-primary", critical: "stat-accent-critical",
  warning: "stat-accent-warning", evidence: "stat-accent-evidence", neutral: "",
};

export function MetricCard({ label, value, unit, format, trend, tone = "neutral", hint, spark, index = 0 }) {
  const display = format === "currency" ? formatCurrency(value) : `${value}${unit || ""}`;
  const trendUp = trend?.startsWith("+");
  const trendDown = trend?.startsWith("-");
  return (
    <div
      className={cn(
        "group relative flex animate-fade-up flex-col gap-2.5 overflow-hidden rounded-xl border border-[#ffffff08] bg-[#0a0c0b] p-4 transition-all duration-200 hover:border-[#1a2820] hover:bg-[#0d0f0e]",
        toneAccent[tone],
      )}
      style={{ animationDelay: `${index * 55}ms` }}
    >
      <div className="flex items-start justify-between gap-1">
        <span className="text-[11px] font-medium text-[#4a5450] leading-snug">{label}</span>
        {trend && (
          <span className={cn(
            "inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular",
            trendUp ? "bg-primary/10 text-primary" : trendDown ? "bg-critical/10 text-critical" : "text-[#5a6660]",
          )}>
            {trendUp && <ArrowUpRight className="size-2.5" />}
            {trendDown && <ArrowDownRight className="size-2.5" />}
            {trend}
          </span>
        )}
      </div>
      <div className={cn("text-[22px] font-semibold leading-none tracking-tight tabular", toneText[tone])}>
        {display}
      </div>
      {spark && <Sparkline data={spark} stroke={toneStroke[tone]} />}
      {hint && <p className="text-[10px] leading-snug text-[#3a4040]">{hint}</p>}
      <div className="pointer-events-none absolute -right-4 -top-4 size-12 rounded-full blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-0"
        style={{ background: toneStroke[tone] + "20" }} />
    </div>
  );
}

// ── Ring ─────────────────────────────────────────────────────────────────────
export function Ring({ value, size = 68, label, stroke = "var(--primary)" }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={5} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={stroke} strokeWidth={5} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 700ms cubic-bezier(0.16,1,0.3,1)", filter: `drop-shadow(0 0 4px ${stroke}60)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-semibold tabular text-foreground">{value}</span>
        {label && <span className="text-[9px] text-[#4a5450]">{label}</span>}
      </div>
    </div>
  );
}

// ── Evidence Link ─────────────────────────────────────────────────────────────
export function EvidenceLink({ children }) {
  return (
    <button type="button" className="inline-flex max-w-full items-center gap-1 truncate text-left text-xs font-medium text-evidence transition-colors hover:text-evidence/70">
      <span className="truncate">{children}</span>
      <ExternalLink className="size-2.5 shrink-0 opacity-50" />
    </button>
  );
}

// ── Confidence Bar ─────────────────────────────────────────────────────────────
export function ConfBar({ value, className }) {
  const color = value >= 85 ? "bg-primary" : value >= 70 ? "bg-warning" : "bg-critical";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/6">
        <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${value}%` }} />
      </div>
      <span className="w-7 shrink-0 text-right text-[10px] tabular text-[#5a6660]">{value}%</span>
    </div>
  );
}
