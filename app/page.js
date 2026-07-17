"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LandingPage from "@/components/genius/landing-page";

export default function Home() {
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        const payload = await response.json().catch(() => ({}));
        if (!cancelled && payload.session) {
          setSession(payload.session);
        }
      } finally {
        if (!cancelled) {
          setCheckingSession(false);
        }
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  const openAuth = (mode) => {
    router.push(`/login?mode=${mode}`);
  };

  return (
    <LandingPage
      session={session}
      checkingSession={checkingSession}
      onEnter={() => {
        if (session) {
          router.push("/workspace");
        } else {
          openAuth("signup");
        }
      }}
      onSignIn={() => openAuth("signin")}
    />
  );
}
