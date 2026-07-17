"use client";

import { useEffect, useState } from "react";
import { KeyRound, LogOut, Monitor, ShieldAlert, ShieldCheck, Smartphone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "../shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatDateTime(value, fallback = "Recently") {
  if (!value) return fallback;
  try {
    return new Date(value).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return fallback;
  }
}

function fallbackSession(session) {
  return session?.sessionId ? [{
    id: "current",
    current: true,
    status: "active",
    device: "Current browser",
    browser: "GENIUS web app",
    os: session?.authMode === "guest" ? "Guest workspace session" : "Workspace session",
    ip: "Hidden",
    location: "Hidden for privacy",
    createdAt: session?.createdAt,
    lastSeenAt: session?.lastSeenAt,
    expiresAt: session?.expiresAt,
  }] : [];
}

export default function SecurityTab({ session, onLoadSessions, onRevokeSession }) {
  const [sessions, setSessions] = useState(() => fallbackSession(session));
  const [loading, setLoading] = useState(false);
  const [revokingId, setRevokingId] = useState("");

  useEffect(() => {
    let mounted = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      Promise.resolve(onLoadSessions ? onLoadSessions() : fallbackSession(session))
        .then((items) => {
          if (mounted) setSessions(items?.length ? items : fallbackSession(session));
        })
        .catch((error) => {
          if (mounted) {
            setSessions(fallbackSession(session));
            toast.error(error.message || "Active sessions could not be loaded.");
          }
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
    }, 0);

    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, [onLoadSessions, session]);

  const handleRevoke = async (target) => {
    if (!target?.id || target.current) return;
    setRevokingId(target.id);
    try {
      const result = await onRevokeSession?.({ id: target.id });
      setSessions(result?.sessions?.length ? result.sessions : sessions.filter((item) => item.id !== target.id));
      toast.success("Session revoked");
    } catch (error) {
      toast.error(error.message || "Session could not be revoked.");
    } finally {
      setRevokingId("");
    }
  };

  const handleRevokeOthers = async () => {
    setRevokingId("all-other");
    try {
      const result = await onRevokeSession?.({ allOther: true });
      setSessions(result?.sessions?.length ? result.sessions : sessions.filter((item) => item.current));
      toast.success(result?.revokedCount ? "All other sessions ended" : "No other active sessions found");
    } catch (error) {
      toast.error(error.message || "Other sessions could not be ended.");
    } finally {
      setRevokingId("");
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-semibold text-white tracking-tight">Security & Sessions</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Authentication" icon={ShieldCheck}>
          <div className="flex flex-col divide-y divide-[#28313C]/50 -mx-6 px-6">
            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-[#141A22] border border-[#28313C] flex items-center justify-center shrink-0">
                  <KeyRound className="size-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium text-white">Password</span>
                  <span className="text-[12px] text-muted-foreground">Managed by the connected production auth provider.</span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast.info("Password management is available after production auth provider setup.")} className="h-8 bg-transparent border-[#28313C] text-muted-foreground hover:text-white">Locked</Button>
            </div>

            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Smartphone className="size-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium text-white">Two-factor authentication</span>
                    <span className="text-[10px] font-bold text-warning bg-warning/10 border border-warning/20 px-1.5 rounded uppercase tracking-wider">Provider</span>
                  </div>
                  <span className="text-[12px] text-muted-foreground">Policy controlled by SSO/Auth provider.</span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast.info("2FA management is delegated to the production auth provider.")} className="h-8 bg-transparent border-[#28313C] text-muted-foreground hover:text-white">View</Button>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Active Sessions" icon={Monitor} description="Devices that are currently logged into your account. Sensitive location data is hidden in the workspace UI.">
        <div className="flex flex-col w-full -mx-2 overflow-x-auto">
          <table className="w-full text-[13px] text-left border-collapse">
            <thead>
              <tr className="border-b border-[#28313C]/50 text-muted-foreground uppercase text-[10px] font-bold tracking-widest">
                <th className="font-medium px-2 py-3">Device</th>
                <th className="font-medium px-2 py-3">Browser / OS</th>
                <th className="font-medium px-2 py-3">IP Address</th>
                <th className="font-medium px-2 py-3">Location</th>
                <th className="font-medium px-2 py-3 text-right">Status</th>
                <th className="font-medium px-2 py-3 w-[70px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#28313C]/30">
              {sessions.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-2 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="mt-0.5 size-1.5 rounded-full shrink-0" style={{ backgroundColor: item.current ? "#22C55E" : "#28313C" }} />
                      <span className="text-white font-medium whitespace-nowrap">{item.device}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3.5 text-muted-foreground whitespace-nowrap">{item.browser} / {item.os}</td>
                  <td className="px-2 py-3.5 text-muted-foreground font-mono text-[12px]">{item.ip}</td>
                  <td className="px-2 py-3.5 text-muted-foreground whitespace-nowrap">{item.location}</td>
                  <td className="px-2 py-3.5 text-right whitespace-nowrap">
                    {item.current ? <span className="text-[#22C55E] font-medium">Active now</span> : <span className="text-muted-foreground">{formatDateTime(item.lastSeenAt)}</span>}
                  </td>
                  <td className="px-2 py-3.5 text-right">
                    {!item.current && (
                      <button
                        onClick={() => handleRevoke(item)}
                        disabled={revokingId === item.id}
                        className={cn("text-[12px] font-medium text-critical opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50", revokingId === item.id && "opacity-100")}
                      >
                        {revokingId === item.id ? "..." : "Revoke"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!sessions.length && (
                <tr>
                  <td colSpan={6} className="px-2 py-8 text-center text-muted-foreground">
                    {loading ? "Loading sessions..." : "No active sessions found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Danger Zone" icon={ShieldAlert} className="border-critical/30 bg-critical/5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-critical/10 pb-4">
            <div className="flex flex-col">
              <span className="text-[14px] font-medium text-white">End all other sessions</span>
              <span className="text-[12px] text-muted-foreground">Signs you out of all devices except this one.</span>
            </div>
            <Button onClick={handleRevokeOthers} disabled={revokingId === "all-other"} variant="outline" className="bg-transparent border-critical/30 text-critical hover:bg-critical/10 hover:text-critical disabled:opacity-50">
              <LogOut className="size-4 mr-2" /> {revokingId === "all-other" ? "Ending..." : "End sessions"}
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
            <div className="flex flex-col">
              <span className="text-[14px] font-medium text-white">Delete Account</span>
              <span className="text-[12px] text-muted-foreground">Permanent deletion requires admin approval and production auth provider confirmation.</span>
            </div>
            <Button onClick={() => toast.error("Account deletion requires admin approval")} className="bg-critical hover:bg-critical/90 text-white font-semibold">
              <Trash2 className="size-4 mr-2" /> Delete account
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
