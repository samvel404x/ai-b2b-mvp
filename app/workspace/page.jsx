"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/genius/app-shell";
import { WorkspaceProvider } from "@/components/genius/workspace-context";

export default function WorkspacePage() {
  const [inWorkspace, setInWorkspace] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        const payload = await response.json().catch(() => ({}));
        if (!cancelled) {
          if (payload.session) {
            setInWorkspace(true);
          } else {
            router.replace("/login?mode=signin");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [router]);

  if (loading || !inWorkspace) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#050914]">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <WorkspaceProvider>
      <AppShell />
    </WorkspaceProvider>
  );
}
