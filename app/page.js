"use client";

import { useState } from "react";
import LandingPage from "@/components/genius/landing-page";
import AppShell from "@/components/genius/app-shell";

export default function Home() {
  const [inWorkspace, setInWorkspace] = useState(false);

  if (inWorkspace) return <AppShell />;
  return <LandingPage onEnter={() => setInWorkspace(true)} />;
}
