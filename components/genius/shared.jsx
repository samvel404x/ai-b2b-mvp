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

export function StatusDot({ tone, className }) {
  return (
    <span
      className={cn(
        "size-2 rounded-full",
        dotTone[tone] || "bg-muted-foreground",
        className,
      )}
    />
  );
}

export function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-balance text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({ title, description, actions, children, className, contentClassName }) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-lg border border-border bg-card",
        className,
      )}
    >
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex flex-col gap-0.5">
            {title ? (
              <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            ) : null}
            {description ? (
              <p className="text-xs text-muted-foreground">{description}</p>
            ) : null}
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

export function MetricCard({ label, value, unit, format, trend, tone = "neutral", hint }) {
  const display =
    format === "currency" ? formatCurrency(value) : `${value}${unit || ""}`;
  const trendUp = trend?.startsWith("+");
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {trend ? (
          <span
            className={cn(
              "text-xs font-medium tabular",
              trendUp ? "text-primary" : "text-muted-foreground",
            )}
          >
            {trend}
          </span>
        ) : null}
      </div>
      <div className={cn("text-2xl font-semibold tracking-tight tabular", toneText[tone])}>
        {display}
      </div>
      {hint ? <p className="text-xs leading-snug text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function Ring({ value, size = 68, label }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
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
          stroke="var(--primary)"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 400ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-semibold tabular text-foreground">{value}</span>
        {label ? <span className="text-[10px] text-muted-foreground">{label}</span> : null}
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
