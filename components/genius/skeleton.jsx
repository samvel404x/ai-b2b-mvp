"use client";

import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-[#ffffff08]",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/[0.06] before:to-transparent",
        className
      )}
      {...props}
    />
  );
}

export function SkeletonText({ className, lines = 1, ...props }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-3 rounded",
            i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonCircle({ className, size = 40, ...props }) {
  return (
    <Skeleton className={cn("rounded-full", className)} style={{ width: size, height: size }} {...props} />
  );
}

export function SkeletonButton({ className, ...props }) {
  return (
    <Skeleton className={cn("h-8 rounded-lg", className)} {...props} />
  );
}

export function SkeletonCard() {
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-[#ffffff08] bg-[#0E1116] p-5">
      <Skeleton className="h-2.5 w-16 rounded bg-[#ffffff08]" />
      <Skeleton className="h-7 w-24 rounded bg-[#ffffff08]" />
      <Skeleton className="h-2 w-full rounded bg-[#ffffff08]" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <Skeleton className="h-2 w-2 rounded-full shrink-0" />
      <Skeleton className="h-4 flex-1 rounded bg-[#ffffff08]" />
      <Skeleton className="h-4 w-20 rounded bg-[#ffffff08]" />
    </div>
  );
}

export { Skeleton };
