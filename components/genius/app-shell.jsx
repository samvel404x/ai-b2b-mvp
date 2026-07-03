"use client";

import { useState } from "react";
import {
  ChevronDown,
  Cpu,
  Database,
  Plug,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { navSections, moreSections, workspace } from "@/lib/genius-data";
import { StatusDot } from "./shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import CommandCenter from "./sections/command-center";
import AiChat from "./sections/ai-chat";
import DataIntake from "./sections/data-intake";
import Diagnostics from "./sections/diagnostics";
import SavingsRadar from "./sections/savings-radar";
import Agents from "./sections/agents";
import Approvals from "./sections/approvals";
import ExcelWorkspace from "./sections/excel-workspace";
import Connectors from "./sections/connectors";
import Reports from "./sections/reports";
import Profile from "./sections/profile";
import Support from "./sections/support";
import Settings from "./sections/settings";

const sectionComponents = {
  command: CommandCenter,
  chat: AiChat,
  data: DataIntake,
  diagnostics: Diagnostics,
  savings: SavingsRadar,
  agents: Agents,
  approvals: Approvals,
  excel: ExcelWorkspace,
  connectors: Connectors,
  reports: Reports,
  profile: Profile,
  support: Support,
  settings: Settings,
};

function SystemChip({ icon: Icon, label, value, tone, valueClass }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <div className="hidden items-center gap-2 rounded-md border border-border bg-secondary/60 px-2.5 py-1.5 lg:flex">
            <Icon className="size-3.5 text-muted-foreground" />
            <span className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground">{label}</span>
              <span className={cn("font-medium text-foreground", valueClass)}>
                {value}
              </span>
            </span>
            {tone ? <StatusDot tone={tone} /> : null}
          </div>
        }
      />
      <TooltipContent>
        {label}: {value}
      </TooltipContent>
    </Tooltip>
  );
}

export default function AppShell() {
  const [active, setActive] = useState("command");
  const ActiveSection = sectionComponents[active] || CommandCenter;
  const activeLabel =
    [...navSections, ...moreSections].find((s) => s.id === active)?.label || "";
  const isMoreActive = moreSections.some((s) => s.id === active);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar: brand + system chips + account */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4">
          <div className="flex items-center gap-2.5">
            <div className="glow-primary flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-semibold tracking-tight">GENIUS</span>
              <span className="text-[10px] text-muted-foreground">
                {workspace.name}
              </span>
            </div>
            <span className="ml-1 hidden rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary sm:inline">
              Live
            </span>
          </div>

          <div className="relative ml-2 hidden max-w-xs flex-1 items-center md:flex">
            <Search className="absolute left-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search findings, evidence, vendors…"
              className="h-8 border-border bg-secondary/50 pl-8 text-xs"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <SystemChip
              icon={Cpu}
              label="Provider"
              value={workspace.provider.name}
              tone={workspace.provider.status}
            />
            <SystemChip
              icon={Database}
              label="Database"
              value={workspace.database.name}
              tone={workspace.database.status}
            />
            <SystemChip
              icon={Plug}
              label="Connectors"
              value={`${workspace.connectors.active}/${workspace.connectors.total}`}
              tone={workspace.connectors.status}
            />
            <SystemChip
              icon={ShieldCheck}
              label="Data quality"
              value={`${workspace.dataQuality}%`}
            />
            <button
              type="button"
              onClick={() => setActive("approvals")}
              className="flex items-center gap-1.5 rounded-md border border-warning/30 bg-warning/10 px-2.5 py-1.5 text-xs font-medium text-warning transition-colors hover:bg-warning/15"
            >
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-1.5 animate-ping rounded-full bg-warning opacity-70" />
                <span className="relative inline-flex size-1.5 rounded-full bg-warning" />
              </span>
              {workspace.openApprovals} approvals
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" className="size-8 rounded-full">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-secondary text-xs">
                        NO
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm">Nadia Okafor</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      Head of Finance
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setActive("profile")}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActive("settings")}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActive("support")}>
                    Support
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-critical">
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Section navigation */}
        <nav className="flex items-center gap-1 overflow-x-auto px-2">
          {navSections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActive(section.id)}
              className={cn(
                "relative whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors",
                active === section.id
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {section.label}
              {active === section.id ? (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
              ) : null}
            </button>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className={cn(
                    "relative flex items-center gap-1 whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors",
                    isMoreActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  More
                  <ChevronDown className="size-3.5" />
                  {isMoreActive ? (
                    <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
                  ) : null}
                </button>
              }
            />
            <DropdownMenuContent align="start">
              <DropdownMenuGroup>
                {moreSections.map((section) => (
                  <DropdownMenuItem
                    key={section.id}
                    onClick={() => setActive(section.id)}
                  >
                    {section.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </header>

      <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
        <div key={active} className="mx-auto w-full max-w-[1760px] animate-fade-in">
          <ActiveSection label={activeLabel} onNavigate={setActive} />
        </div>
      </main>
    </div>
  );
}
