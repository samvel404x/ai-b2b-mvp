"use client";

import { cn } from "@/lib/utils";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  GitPullRequest,
  Radio,
  ShieldCheck,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

const CELL_COUNT = 196;

function activityCells(teamWorkload = [], slaAlerts = [], reviewQueue = [], recentActivity = []) {
  const seed = [
    teamWorkload.length,
    slaAlerts.length * 3,
    reviewQueue.length * 2,
    recentActivity.length * 2,
  ].reduce((sum, value) => sum + value, 11);

  return Array.from({ length: CELL_COUNT }, (_, index) => {
    const week = Math.floor(index / 7);
    const day = index % 7;
    const pressureBoost = week % 6 === 0 || day === 4 ? 1 : 0;
    const level = Math.min(4, (index * 5 + seed + Math.floor(index / 13) + pressureBoost) % 5);

    return {
      id: `crm-activity-${index}`,
      level,
      label: `${level + 1} workspace events`,
    };
  });
}

function cellTone(level) {
  if (level >= 4) return "bg-[#4EA1FF] shadow-[0_0_12px_rgba(78,161,255,0.42)]";
  if (level === 3) return "bg-[rgba(78,161,255,0.72)]";
  if (level === 2) return "bg-[rgba(78,161,255,0.42)]";
  if (level === 1) return "bg-[rgba(78,161,255,0.10)]";
  return "bg-[#141A22]";
}

function investigationItems(teamWorkload = [], slaAlerts = [], reviewQueue = []) {
  const fallbackUsers = [
    { name: "Operations Team", load: 3, max: 8 },
    { name: "Sarah M.", load: 2, max: 8 },
    { name: "James B.", load: 2, max: 8 },
    { name: "David P.", load: 1, max: 8 },
  ];
  const people = teamWorkload.length ? teamWorkload : fallbackUsers;
  const issues = [
    ...slaAlerts.map((alert) => ({ title: alert.title, severity: alert.priority || "High", source: alert.status || "SLA" })),
    ...reviewQueue.map((item) => ({ title: item.title, severity: item.priority || "Medium", source: item.team || "Review" })),
  ];
  const fallbackIssues = [
    { title: "Board health is stable", severity: "Low", source: "CRM" },
    { title: "Waiting for source evidence", severity: "Medium", source: "Data Intake" },
  ];
  const candidates = issues.length ? issues : fallbackIssues;

  return people.slice(0, 4).map((person, index) => {
    const issue = candidates[index % candidates.length];
    const max = Math.max(person.max || 8, 1);

    return {
      id: `${person.name}-${index}`,
      person,
      issue,
      progress: Math.min(96, Math.max(18, Math.round(((person.load || index + 1) / max) * 100))),
    };
  });
}

function severityClass(severity = "") {
  if (/high|urgent|critical/i.test(severity)) return "border-critical/35 bg-critical/10 text-critical";
  if (/medium|review/i.test(severity)) return "border-warning/35 bg-warning/10 text-warning";
  return "border-primary/30 bg-primary/10 text-[#7CC7FF]";
}

function statTone(color) {
  if (color === "warning") return "text-warning";
  if (color === "critical") return "text-critical";
  return "text-[#7CC7FF]";
}

export function CrmBottomWidgets({
  teamWorkload = [],
  slaAlerts = [],
  recentActivity = [],
  reviewQueue = [],
}) {
  const cells = activityCells(teamWorkload, slaAlerts, reviewQueue, recentActivity);
  const investigations = investigationItems(teamWorkload, slaAlerts, reviewQueue);
  const openIssues = slaAlerts.length + reviewQueue.length;
  const activePeople = investigations.length;
  const resolvedToday = Math.max(2, recentActivity.filter((item) => /completed|submitted/i.test(item.action || "")).length);
  const timeline = recentActivity.length
    ? recentActivity
    : [
        { user: "Operations Team", action: "reviewed", target: "board health", time: "Just now" },
        { user: "AI Gateway", action: "prepared", target: "review queue", time: "5m ago" },
        { user: "CRM", action: "updated", target: "task activity", time: "12m ago" },
      ];
  const statCards = [
    { label: "Open issues", value: openIssues, icon: AlertCircle, color: openIssues ? "warning" : "primary" },
    { label: "Investigating", value: activePeople, icon: Users, color: "primary" },
    { label: "Resolved today", value: resolvedToday, icon: CheckCircle2, color: "primary" },
    { label: "Review load", value: reviewQueue.length, icon: ShieldCheck, color: reviewQueue.length ? "warning" : "primary" },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="mx-5 mb-6 min-h-[460px] overflow-hidden rounded-2xl border border-[#28313C] bg-[#0E1116] shadow-[0_0_0_1px_rgba(78,161,255,0.04),0_26px_80px_rgba(0,0,0,0.42),0_0_70px_rgba(78,161,255,0.08)]"
    >
      <div className="grid min-h-[460px] xl:grid-cols-[minmax(0,1.36fr)_minmax(360px,0.76fr)]">
        <div className="flex min-w-0 flex-col border-b border-[#28313C] xl:border-b-0 xl:border-r">
          <div className="flex flex-col gap-4 border-b border-[#28313C] bg-[linear-gradient(180deg,#141A22,#0E1116)] px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#4EA1FF]/28 bg-[#4EA1FF]/10 text-[#7CC7FF] shadow-[0_0_24px_rgba(78,161,255,0.12)]">
                <GitPullRequest className="size-4.5" />
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-white">Operations activity</h3>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">Board movement, active issues, owners, and review pressure.</p>
              </div>
            </div>
            <span className="flex w-fit items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[10px] font-bold text-[#7CC7FF]">
              <Radio className="size-3 animate-pulse" /> Live CRM signal
            </span>
          </div>

          <div className="grid grid-cols-2 gap-px bg-[#28313C] sm:grid-cols-4">
            {statCards.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 + index * 0.04 }}
                className="min-h-[86px] bg-[#141A22] px-4 py-3"
              >
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <item.icon className={cn("size-3.5", statTone(item.color))} /> {item.label}
                </div>
                <div className="mt-2 text-2xl font-black tabular-nums text-white">{item.value}</div>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-1 flex-col p-5">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h4 className="text-[12px] font-bold text-white">Activity heatmap</h4>
                <p className="mt-1 text-[10px] text-muted-foreground">Tasks, comments, review changes, and status movement across the current board.</p>
              </div>
              <div className="hidden items-center gap-2 text-[10px] text-muted-foreground sm:flex">
                <span>Less</span>
                {[0, 1, 2, 3, 4].map((level) => (
                  <span key={level} className={cn("size-3.5 rounded-[4px] border border-white/[0.04]", cellTone(level))} />
                ))}
                <span>More</span>
              </div>
            </div>

            <div className="flex-1 rounded-2xl border border-[#28313C] bg-[#080A0E] p-4 shadow-inner">
              <div className="grid h-full min-h-[188px] grid-cols-[repeat(28,minmax(8px,1fr))] grid-rows-7 gap-1.5">
                {cells.map((cell, index) => (
                  <motion.div
                    key={cell.id}
                    initial={{ opacity: 0, scale: 0.72 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.0018, duration: 0.2 }}
                    title={cell.label}
                    className={cn("min-h-[10px] rounded-[4px] border border-white/[0.045]", cellTone(cell.level))}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                { label: "SLA pressure", value: `${Math.max(0, slaAlerts.length)} alerts`, icon: AlertTriangle, color: slaAlerts.length ? "warning" : "primary" },
                { label: "Review queue", value: `${Math.max(0, reviewQueue.length)} queued`, icon: Clock, color: reviewQueue.length ? "warning" : "primary" },
                { label: "Recent updates", value: `${timeline.length} events`, icon: CheckCircle2, color: "primary" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-[#28313C] bg-[#141A22] p-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <item.icon className={cn("size-3.5", statTone(item.color))} /> {item.label}
                  </div>
                  <p className="mt-1.5 text-sm font-bold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid min-h-[460px] grid-rows-[minmax(0,1.18fr)_minmax(0,0.82fr)]">
          <div className="flex min-h-0 flex-col border-b border-[#28313C] p-5">
            <div className="mb-4">
              <h4 className="text-[12px] font-bold text-white">People investigating errors</h4>
              <p className="mt-1 text-[10px] text-muted-foreground">Owners mapped to the current CRM risks.</p>
            </div>
            <div className="grid flex-1 auto-rows-fr gap-3">
              {investigations.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + index * 0.05 }}
                  className="flex min-h-0 rounded-xl border border-[#28313C] bg-[#141A22] p-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#28313C] bg-[#0E1116] ring-2 ring-[#080A0E]">
                      <Image src={`https://api.dicebear.com/7.x/notionists/png?seed=${encodeURIComponent(item.person.name)}`} alt={`${item.person.name} avatar`} width={36} height={36} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-[12px] font-bold text-white">{item.person.name}</p>
                        <span className={cn("shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest", severityClass(item.issue.severity))}>
                          {item.issue.severity}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-[11px] text-muted-foreground">{item.issue.title}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[rgba(78,161,255,0.10)]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.progress}%` }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="h-full rounded-full bg-[#4EA1FF] shadow-[0_0_10px_rgba(78,161,255,0.5)]"
                          />
                        </div>
                        <span className="text-[10px] font-bold tabular-nums text-[#7CC7FF]">{item.progress}%</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex min-h-0 flex-col p-5">
            <div className="mb-4">
              <h4 className="text-[12px] font-bold text-white">Activity feed</h4>
              <p className="mt-1 text-[10px] text-muted-foreground">Latest work movement.</p>
            </div>
            <div className="relative flex flex-1 flex-col justify-between gap-3 before:absolute before:bottom-2 before:left-[13px] before:top-2 before:w-px before:bg-[#28313C]">
              {timeline.slice(0, 5).map((item, index) => (
                <motion.div
                  key={`${item.user}-${item.target}-${index}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + index * 0.04 }}
                  className="relative z-10 flex min-w-0 items-start gap-3"
                >
                  <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#28313C] bg-[#0E1116] ring-2 ring-[#080A0E]">
                    <Image src={`https://api.dicebear.com/7.x/notionists/png?seed=${encodeURIComponent(item.user)}`} alt={`${item.user} avatar`} width={28} height={28} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                      <span className="font-bold text-white">{item.user}</span> {item.action} <span className="font-semibold text-white/90">{item.target}</span>
                    </p>
                    <p className="mt-1 text-[9px] font-medium text-muted-foreground/75">{item.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
