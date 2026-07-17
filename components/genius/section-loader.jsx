"use client";

import { Skeleton } from "./skeleton";

export function SectionLoader({ children, loading = false }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-3 w-24 rounded bg-[#ffffff08]" />
          <Skeleton className="h-8 w-64 rounded bg-[#ffffff08]" />
          <Skeleton className="h-4 w-96 rounded bg-[#ffffff08]" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-2xl border border-[#ffffff08] bg-[#0E1116] p-5">
              <Skeleton className="h-2.5 w-16 rounded bg-[#ffffff08]" />
              <Skeleton className="h-7 w-24 rounded bg-[#ffffff08]" />
              <Skeleton className="h-2 w-full rounded bg-[#ffffff08]" />
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-[#ffffff08] bg-[#0E1116] p-6">
          <Skeleton className="mb-4 h-4 w-40 rounded bg-[#ffffff08]" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-2 w-2 rounded-full shrink-0" />
                <Skeleton className="h-4 flex-1 rounded bg-[#ffffff08]" />
                <Skeleton className="h-4 w-24 rounded bg-[#ffffff08]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
