"use client";

import { useEffect, useMemo, useState } from "react";
import { useWorkspace } from "../workspace-context";

import { ProfileHero } from "./profile-hero";
import { ProfileNav } from "./profile-nav";
import OverviewTab from "./tabs/overview";
import PersonalInfoTab from "./tabs/personal-info";
import AIPreferencesTab from "./tabs/ai-preferences";
import NotificationsTab from "./tabs/notifications";
import SecurityTab from "./tabs/security";
import DeveloperTab from "./tabs/developer";
import ActivityTab from "./tabs/activity";

export default function Profile({ onNavigate }) {
  const {
    workspace,
    session,
    preferences,
    saveWorkspacePreferences,
    listWorkspaceSessions,
    revokeWorkspaceSession,
    busy,
  } = useWorkspace();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const profile = useMemo(() => {
    const profilePrefs = preferences?.profile || {};
    const aiPrefs = preferences?.ai || {};
    return {
      displayName: profilePrefs.displayName || session?.displayName || "Guest local workspace",
      role: profilePrefs.role || session?.position || workspace.position || "Head of Operations",
      email: session?.emailMasked || (session?.isGuest ? "Guest mode" : "Hidden for privacy"),
      timezone: profilePrefs.timezone || "America/New_York (EST)",
      dateFormat: profilePrefs.dateFormat || "Jun 26, 2024, 11:45 AM",
      currency: profilePrefs.currency || "USD - US Dollar",
      tone: aiPrefs.tone || "Concise",
      confidenceThreshold: Number(aiPrefs.confidenceThreshold || 75),
      autoApprovalLimit: aiPrefs.autoApprovalLimit || "$25K",
    };
  }, [preferences, session, workspace.position]);

  const initials = profile.displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  async function handleUpdateProfile(nextProfile = {}) {
    return await saveWorkspacePreferences({
      profile: {
        displayName: nextProfile.displayName,
        role: nextProfile.role,
        timezone: nextProfile.timezone,
        dateFormat: nextProfile.dateFormat,
        currency: nextProfile.currency,
      },
      ai: {
        tone: nextProfile.tone,
        confidenceThreshold: nextProfile.confidenceThreshold,
        autoApprovalLimit: nextProfile.autoApprovalLimit,
      },
    });
  }

  async function handleUpdateNotifications(nextNotifications = {}) {
    return await saveWorkspacePreferences({ notifications: nextNotifications });
  }

  if (!mounted) return null;

  return (
    <div className="w-full h-full flex flex-col bg-transparent text-white">
      <div className="flex-1 overflow-y-auto w-full scrollbar-none pb-24">
        <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-10 pt-6 sm:pt-8">
          <div className="flex items-center justify-between mb-6 animate-fade-in">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-primary tracking-widest uppercase mb-1 flex items-center gap-1.5">
                <div className="size-1.5 rounded-full bg-primary animate-pulse" /> Account
              </span>
              <h1 className="text-[28px] sm:text-[32px] font-bold tracking-tight text-white mb-0.5 leading-none">Profile</h1>
              <p className="text-[14px] text-muted-foreground mt-1">Manage your identity, AI interaction preferences, notifications, security, and developer access.</p>
            </div>
          </div>

          <ProfileHero
            profile={profile}
            workspace={workspace}
            initials={initials}
            onEditInfo={() => setActiveTab("personal-info")}
          />

          <ProfileNav activeTab={activeTab} onChange={setActiveTab} />

          <div className="w-full">
            {activeTab === "overview" && (
              <OverviewTab profile={profile} workspace={workspace} onChangeTab={setActiveTab} onNavigate={onNavigate} />
            )}
            {activeTab === "personal-info" && (
              <PersonalInfoTab profile={profile} workspace={workspace} session={session} onUpdateProfile={handleUpdateProfile} />
            )}
            {activeTab === "ai-preferences" && (
              <AIPreferencesTab profile={profile} onUpdateProfile={handleUpdateProfile} />
            )}
            {activeTab === "notifications" && (
              <NotificationsTab preferences={preferences?.notifications} onSave={handleUpdateNotifications} busy={busy} />
            )}
            {activeTab === "security" && (
              <SecurityTab
                session={session}
                onLoadSessions={listWorkspaceSessions}
                onRevokeSession={revokeWorkspaceSession}
              />
            )}
            {activeTab === "developer" && (
              <DeveloperTab />
            )}
            {activeTab === "activity" && (
              <ActivityTab />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
