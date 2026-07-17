"use client";

import { User, Zap, ShieldCheck, CheckCircle2, ChevronRight, Edit2, Bell } from "lucide-react";
import { Card } from "../shared";
import { Button } from "@/components/ui/button";

export default function OverviewTab({ profile, workspace, onChangeTab, onNavigate }) {
  const recentEvents = [
    { text: "Approved vendor contract renewal for TechSoft Solutions", time: "14m ago" },
    { text: "Reviewed AI conclusion on Q2 savings opportunity", time: "2h ago" },
    { text: "Exported Q2 financial report to PDF", time: "5h ago" },
    { text: "Enabled two-factor authentication (MFA)", time: "1d ago" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
      {/* Column 1 */}
      <div className="flex flex-col gap-6">
        {/* Account Summary */}
        <Card title="Account summary" className="border-[#28313C]">
          <div className="flex flex-col divide-y divide-[#28313C]/50 -mx-6 px-6">
            <SummaryRow label="Display Name" value={profile.displayName} icon={User} />
            <SummaryRow label="Role" value={profile.role} icon={User} />
            <SummaryRow label="Workspace" value={workspace.workspaceName || workspace.name || "GENIUS Workspace"} icon={User} />
            <SummaryRow label="Email" value={profile.email} icon={User} />
            <SummaryRow label="Timezone" value={profile.timezone} icon={User} />
            <SummaryRow label="Preferred Currency" value={profile.currency} icon={User} />
          </div>
          <Button variant="ghost" onClick={() => onChangeTab("personal-info")} className="w-full mt-4 text-muted-foreground hover:text-white justify-center h-9 text-[12px]">
            View full information <ChevronRight className="size-3.5 ml-1" />
          </Button>
        </Card>

        {/* Security Summary */}
        <Card title="Security summary">
          <div className="flex flex-col divide-y divide-[#28313C]/50 -mx-6 px-6">
            <SummaryRow label="MFA Status" value={<span className="text-[#22C55E]">Enabled</span>} icon={ShieldCheck} />
            <SummaryRow label="Active Sessions" value="3 active sessions" icon={ShieldCheck} />
            <SummaryRow label="Last Password Change" value="23 days ago" icon={ShieldCheck} />
            <SummaryRow label="API Tokens" value="4 active tokens" icon={ShieldCheck} />
          </div>
          <Button variant="ghost" onClick={() => onChangeTab("security")} className="w-full mt-4 text-muted-foreground hover:text-white justify-center h-9 text-[12px]">
            Manage security <ChevronRight className="size-3.5 ml-1" />
          </Button>
        </Card>
      </div>

      {/* Column 2 */}
      <div className="flex flex-col gap-6">
        {/* AI Behavior Summary */}
        <Card title="AI behavior Summary">
          <div className="flex flex-col divide-y divide-[#28313C]/50 -mx-6 px-6">
            <SummaryRow label="Tone of Voice" value="Concise" icon={Zap} />
            <div className="py-3 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-muted-foreground flex items-center gap-3"><Zap className="size-4" /> Confidence Threshold</span>
                <span className="text-[13px] font-medium text-white">75%</span>
              </div>
              <div className="relative h-1.5 bg-[#28313C] rounded-full w-full ml-7" style={{ width: 'calc(100% - 28px)' }}>
                <div className="absolute h-full bg-primary rounded-full" style={{ width: `75%` }} />
                <div className="absolute size-3 bg-white rounded-full top-1/2 -translate-y-1/2 border border-primary pointer-events-none" style={{ left: `calc(75% - 6px)` }} />
              </div>
            </div>
            <SummaryRow label="Evidence Display" value="Enabled" icon={Zap} />
            <SummaryRow label="Human Approval" value="When confidence < 75%" icon={Zap} />
          </div>
          <Button variant="ghost" onClick={() => onChangeTab("ai-preferences")} className="w-full mt-4 text-muted-foreground hover:text-white justify-center h-9 text-[12px]">
            Configure AI preferences <ChevronRight className="size-3.5 ml-1" />
          </Button>
        </Card>

        {/* Workspace Context */}
        <Card title="Workspace context">
          <div className="flex flex-col divide-y divide-[#28313C]/50 -mx-6 px-6">
            <SummaryRow label="Workspace Plan" value="Enterprise" icon={User} />
            <SummaryRow label="Your Role" value="Owner" icon={User} />
            <SummaryRow label="Team Members" value="27" icon={User} />
            <SummaryRow label="Agents" value="18 active" icon={User} />
          </div>
          <Button variant="ghost" onClick={() => onNavigate?.("settings", { source: "profile-workspace-context" })} className="w-full mt-4 text-muted-foreground hover:text-white justify-center h-9 text-[12px]">
            Open workspace settings <ChevronRight className="size-3.5 ml-1" />
          </Button>
        </Card>
      </div>

      {/* Column 3 */}
      <div className="flex flex-col gap-6">
        {/* Quick Actions */}
        <Card title="Quick actions">
          <div className="flex flex-col gap-1 -mx-2">
            <QuickAction icon={Edit2} label="Edit personal information" onClick={() => onChangeTab("personal-info")} />
            <QuickAction icon={Zap} label="Configure AI preferences" onClick={() => onChangeTab("ai-preferences")} />
            <QuickAction icon={Bell} label="Manage notifications" onClick={() => onChangeTab("notifications")} />
            <QuickAction icon={ShieldCheck} label="Review active sessions" onClick={() => onChangeTab("security")} />
            <QuickAction icon={User} label="Create API token" onClick={() => onChangeTab("developer")} />
          </div>
        </Card>

        {/* Recent Activity */}
        <Card title="Recent activity" action={
          <Button variant="ghost" onClick={() => onChangeTab("activity")} className="text-primary hover:text-primary/80 hover:bg-white/5 h-8 text-[12px]">
            View full activity <ChevronRight className="size-3.5 ml-1" />
          </Button>
        }>
          <div className="flex flex-col gap-4">
            {recentEvents.map((evt, i) => {
              let dotColor = "text-[#22C55E] bg-[#22C55E]/10";
              if (i === 1) dotColor = "text-[#0EA5E9] bg-[#0EA5E9]/10";
              if (i === 2) dotColor = "text-[#F59E0B] bg-[#F59E0B]/10";
              if (i === 3) dotColor = "text-critical bg-critical/10";
              return (
                <div key={i} className="flex items-start justify-between gap-3 group">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`mt-0.5 size-4 rounded-full flex items-center justify-center shrink-0 ${dotColor}`}>
                      {i === 3 ? <span className="text-[10px] font-bold">×</span> : <CheckCircle2 className="size-2.5" />}
                    </div>
                    <span className="text-[13px] text-white/90 leading-snug group-hover:text-white transition-colors cursor-pointer truncate">{evt.text}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0">{evt.time}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <Icon className="size-4 text-muted-foreground" />
        <span className="text-[13px] text-muted-foreground">{label}</span>
      </div>
      <span className="text-[13px] font-medium text-white">{value}</span>
    </div>
  );
}


function QuickAction({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg group transition-colors text-left">
      <div className="flex items-center gap-3">
        <Icon className="size-4 text-muted-foreground group-hover:text-white transition-colors" />
        <span className="text-[13px] font-medium text-white/90">{label}</span>
      </div>
      <ChevronRight className="size-4 text-muted-foreground group-hover:text-white transition-colors" />
    </button>
  );
}
