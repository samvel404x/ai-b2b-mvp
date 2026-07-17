"use client";

import { cn } from "@/lib/utils";

export function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button" role="switch" aria-checked={checked} disabled={disabled}
      onClick={() => onChange && onChange(!checked)}
      className={cn(
        "relative inline-flex h-[18px] w-8 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E1116]",
        checked ? "bg-primary" : "bg-[#28313C]",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span className={cn(
        "pointer-events-none inline-block size-3.5 transform rounded-full bg-[#0E1116] shadow transition duration-200 ease-in-out",
        checked ? "translate-x-[16px]" : "translate-x-0.5 bg-muted-foreground"
      )} />
    </button>
  );
}

export function Card({ title, description, icon: Icon, action, children, className }) {
  return (
    <div className={cn("bg-[#0E1116] border border-[#28313C] rounded-xl overflow-hidden flex flex-col shadow-sm", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-[24px] pb-5 border-b border-[#28313C]/50 gap-4">
        <div className="flex items-start sm:items-center gap-3">
          {Icon && (
            <div className="size-8 rounded-lg bg-[#141A22] border border-[#28313C] flex items-center justify-center shrink-0">
              <Icon className="size-4 text-muted-foreground" strokeWidth={1.5} />
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <h3 className="text-[16px] font-semibold text-white tracking-tight leading-none">{title}</h3>
            {description && <p className="text-[13px] text-muted-foreground leading-tight mt-1">{description}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="flex flex-col p-[24px] flex-1">
        {children}
      </div>
    </div>
  );
}
