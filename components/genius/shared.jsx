import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/genius-data";

const severityStyles = {
  Critical: "bg-critical/15 text-critical border-critical/30",
  High: "bg-warning/15 text-warning border-warning/30",
  Medium: "bg-evidence/15 text-evidence border-evidence/30",
  Low: "bg-muted text-muted-foreground border-border",
};

export function SeverityBadge({ level }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        severityStyles[level] || severityStyles.Low,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {level}
    </span>
  );
}

const stateStyles = {
  Pending: "bg-warning/15 text-warning",
  "In review": "bg-evidence/15 text-evidence",
  Snoozed: "bg-muted text-muted-foreground",
  Approved: "bg-primary/15 text-primary",
  Done: "bg-primary/15 text-primary",
  Rejected: "bg-critical/15 text-critical",
};

export function StatePill({ state }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        stateStyles[state] || "bg-muted text-muted-foreground",
      )}
    >
      {state}
    </span>
  );
}

const dotTone = {
  online: "bg-primary",
  connected: "bg-primary",
  healthy: "bg-primary",
  ok: "bg-primary",
  Connected: "bg-primary",
  Active: "bg-primary",
  Degraded: "bg-warning",
  retry: "bg-warning",
  Idle: "bg-muted-foreground",
  Paused: "bg-warning",
  offline: "bg-critical",
  "Not connected": "bg-muted-foreground",
};

export function StatusDot({ tone, className, pulse }) {
  const color = dotTone[tone] || "bg-muted-foreground";
  return (
    <span className={cn("relative inline-flex", className)}>
      {pulse && (color === "bg-primary" || color === "bg-warning") ? (
        <span
          className={cn(
            "absolute inline-flex size-2 animate-ping rounded-full opacity-60",
            color,
          )}
        />
      ) : null}
      <span className={cn("relative size-2 rounded-full", color)} />
    </span>
  );
}

export function PageHeader({ title, description, actions, eyebrow }) {
  return (
    <div className="flex animate-fade-up flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-1.5">
        {eyebrow ? (
          <span className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            {eyebrow}
          </span>
        ) : null}
        <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
  contentClassName,
  icon: Icon,
}) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-xl border border-border bg-card transition-colors hover:border-border/80",
        className,
      )}
    >
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2.5">
            {Icon ? (
              <span className="flex size-7 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                <Icon className="size-3.5" />
              </span>
            ) : null}
            <div className="flex flex-col gap-0.5">
              {title ? (
                <h2 className="text-sm font-semibold text-foreground">{title}</h2>
              ) : null}
              {description ? (
                <p className="text-xs text-muted-foreground">{description}</p>
              ) : null}
            </div>
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </header>
      )}
      <div className={cn("flex-1 p-4", contentClassName)}>{children}</div>
    </section>
  );
}

const toneText = {
  primary: "text-primary",
  critical: "text-critical",
  evidence: "text-evidence",
  warning: "text-warning",
  neutral: "text-foreground",
};

const toneStroke = {
  primary: "var(--primary)",
  critical: "var(--critical)",
  evidence: "var(--evidence)",
  warning: "var(--warning)",
  neutral: "var(--muted-foreground)",
};

export function Sparkline({ data = [], stroke = "var(--primary)", className }) {
  if (!data.length) return null;
  const w = 100;
  const h = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const step = w / (data.length - 1 || 1);
  const points = data.map((d, i) => {
    const x = i * step;
    const y = h - ((d - min) / span) * (h - 4) - 2;
    return [x, y];
  });
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  const id = `spark-${stroke.replace(/[^a-z]/gi, "")}`;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={cn("h-8 w-full", className)}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function MetricCard({
  label,
  value,
  unit,
  format,
  trend,
  tone = "neutral",
  hint,
  spark,
  index = 0,
}) {
  const display =
    format === "currency" ? formatCurrency(value) : `${value}${unit || ""}`;
  const trendUp = trend?.startsWith("+");
  const trendDown = trend?.startsWith("-");
  return (
    <div
      className="group relative flex animate-fade-up flex-col gap-3 overflow-hidden rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:bg-card/80"
      style={{ animationDelay: `${index * 55}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {trend ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular",
              trendUp && "bg-primary/12 text-primary",
              trendDown && "bg-muted text-muted-foreground",
              !trendUp && !trendDown && "text-muted-foreground",
            )}
          >
            {trendUp ? <ArrowUpRight className="size-3" /> : null}
            {trendDown ? <ArrowDownRight className="size-3" /> : null}
            {trend}
          </span>
        ) : null}
      </div>
      <div
        className={cn(
          "text-[26px] font-semibold leading-none tracking-tight tabular",
          toneText[tone],
        )}
      >
        {display}
      </div>
      {spark ? (
        <Sparkline data={spark} stroke={toneStroke[tone]} />
      ) : hint ? (
        <p className="text-xs leading-snug text-muted-foreground">{hint}</p>
      ) : null}
      {spark && hint ? (
        <p className="text-xs leading-snug text-muted-foreground">{hint}</p>
      ) : null}
      <span className="pointer-events-none absolute -right-6 -top-6 size-16 rounded-full bg-primary/0 blur-2xl transition-colors duration-500 group-hover:bg-primary/10" />
    </div>
  );
}

export function Ring({ value, size = 68, label, stroke = "var(--primary)" }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={6}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 700ms cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-semibold tabular text-foreground">
          {value}
        </span>
        {label ? (
          <span className="text-[10px] text-muted-foreground">{label}</span>
        ) : null}
      </div>
    </div>
  );
}

export function EvidenceLink({ children }) {
  return (
    <button
      type="button"
      className="inline-flex max-w-full items-center gap-1 truncate text-left text-xs font-medium text-evidence transition-colors hover:text-evidence/80"
    >
      <span className="truncate">{children}</span>
    </button>
  );
}
