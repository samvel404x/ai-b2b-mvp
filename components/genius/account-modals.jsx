"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowRightLeft,
  Building2,
  Check,
  Copy,
  CreditCard,
  Database,
  Download,
  FileText,
  Globe,
  LogOut,
  Plus,
  Settings,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useWorkspace } from "./workspace-context";

function workspaceInitial(name) {
  const cleanName = String(name || "GENIUS Workspace").trim();
  const words = cleanName.split(/\s+/).filter(Boolean);
  return (words.length > 1 ? `${words[0][0]}${words[1][0]}` : cleanName.slice(0, 2)).toUpperCase();
}

function backendStorageLabel(backend) {
  if (backend?.storage === "supabase") return "Supabase";
  if (backend?.storage === "local") return "Local";
  return "Workspace store";
}

export function AccountModals({ activeModal, onClose, onSignOut, onNavigate }) {
  return (
    <>
      <AccountSwitcherModal
        open={activeModal === "account-switcher"}
        onClose={onClose}
        onNavigate={onNavigate}
      />
      <LogoutModal
        open={activeModal === "logout"}
        onClose={onClose}
        onSignOut={onSignOut}
      />
      <InviteTeamModal
        open={activeModal === "invite-team"}
        onClose={onClose}
      />
      <BillingModal
        open={activeModal === "billing"}
        onClose={onClose}
        onNavigate={onNavigate}
      />
    </>
  );
}

// ── Account Switcher ────────────────────────────────────────────────────────
function AccountSwitcherModal({ open, onClose, onNavigate }) {
  const {
    workspace,
    session,
    backend,
    busy,
    exportWorkspace,
    createGuestWorkspace,
  } = useWorkspace();
  const workspaceName = workspace?.workspaceName || "GENIUS Workspace";
  const role = session?.role || workspace?.role || "Member";
  const initials = workspaceInitial(workspaceName);
  const evidenceCount = workspace?.evidence?.length || 0;
  const actionCount = workspace?.actions?.length || 0;
  const memberCount = workspace?.members?.length || 0;

  function openSettings() {
    onClose();
    onNavigate?.("settings");
  }

  function exportCurrentWorkspace() {
    const started = exportWorkspace();
    if (started) toast.success("Workspace export started.");
  }

  async function createNewGuestWorkspace() {
    const confirmed = window.confirm("Create a new local guest workspace for this browser session? Export the current workspace first if you need to keep a portable copy.");
    if (!confirmed) return;

    try {
      await createGuestWorkspace({
        workspaceName: "GENIUS Guest Workspace",
        position: session?.position || "Product Owner",
        department: session?.department || "Executive",
      });
      toast.success("New guest workspace created.");
      onClose();
      onNavigate?.("command");
    } catch (error) {
      toast.error(error.message || "Guest workspace could not be created.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-[540px] sm:max-w-[540px] bg-[#0E1116] border-[#28313C] p-0 overflow-hidden shadow-[0_0_80px_-20px_rgba(78,161,255,0.15)] sm:rounded-2xl">
        {/* Ambient glow behind the content */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none opacity-50" />
        
        <div className="relative p-7 pb-5">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-2">
              <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-b from-[#28313C] to-[#0E1116] border border-[#28313C] shadow-inner">
                <ArrowRightLeft className="size-5 text-primary" />
              </div>
              <div className="flex flex-col text-left">
                <DialogTitle className="text-[22px] font-black text-white tracking-tight">Switch Workspace</DialogTitle>
                <DialogDescription className="text-[13px] font-medium text-muted-foreground mt-0.5">
                  Manage your active context & environments
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="relative px-7 pb-7 flex flex-col gap-6">
          
          {/* Active Workspace Card */}
          <div className="relative group rounded-2xl border border-primary/30 bg-gradient-to-b from-[rgba(78,161,255,0.10)] to-[#0E1116] p-6 shadow-[0_4px_20px_rgba(78,161,255,0.1)] overflow-hidden transition-all duration-300 hover:shadow-[0_4px_25px_rgba(78,161,255,0.15)] hover:border-primary/50">
            {/* Subtle light effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="relative flex items-start justify-between gap-3 mb-6">
              <div className="flex min-w-0 items-center gap-4">
                <div className="relative">
                  <Avatar className="size-[52px] ring-2 ring-primary/40 shadow-[0_0_15px_rgba(78,161,255,0.2)]">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-[#4EA1FF] text-[15px] font-bold text-[#FFFFFF]">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-[#0E1116] border border-[#28313C]">
                    <div className="size-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className="truncate text-[17px] font-bold text-white tracking-tight leading-none">{workspaceName}</div>
                  <div className="flex items-center gap-2.5 text-[11px] font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1 text-white/90">
                      <ShieldCheck className="size-3.5" /> {role}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[#28313C]" />
                    <span className="flex items-center gap-1">
                      <Database className="size-3.5" /> {backendStorageLabel(backend)}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[#28313C]" />
                    <span className="flex items-center gap-1 text-primary/90">
                      <Globe className="size-3.5" /> {session?.isGuest ? "Guest" : "Registered"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/20">
                <Check className="size-3.5" /> Active
              </div>
            </div>
            
            {/* Stats Row */}
            <div className="relative grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center justify-center rounded-xl border border-[#28313C] bg-[#0E1116]/60 py-3 px-2 hover:bg-[#0E1116] hover:border-[#28313C] transition-colors">
                <div className="text-xl font-black text-white leading-none">{evidenceCount}</div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">
                  <FileText className="size-3" /> Evidence
                </div>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl border border-[#28313C] bg-[#0E1116]/60 py-3 px-2 hover:bg-[#0E1116] hover:border-[#28313C] transition-colors">
                <div className="text-xl font-black text-white leading-none">{actionCount}</div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">
                  <Sparkles className="size-3" /> Actions
                </div>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl border border-[#28313C] bg-[#0E1116]/60 py-3 px-2 hover:bg-[#0E1116] hover:border-[#28313C] transition-colors">
                <div className="text-xl font-black text-white leading-none">{memberCount}</div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">
                  <Users className="size-3" /> Members
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={openSettings} 
              className="h-12 rounded-xl border-[#28313C] bg-gradient-to-b from-[#141A22] to-[#0E1116] text-[13px] font-bold text-white hover:bg-[#28313C] hover:text-white hover:border-[#28313C] transition-all shadow-sm hover:shadow-md group"
            >
              <Settings className="mr-2 size-4 text-muted-foreground group-hover:text-white transition-colors" /> Workspace Settings
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={exportCurrentWorkspace} 
              className="h-12 rounded-xl border-[#28313C] bg-gradient-to-b from-[#141A22] to-[#0E1116] text-[13px] font-bold text-white hover:bg-[#28313C] hover:text-white hover:border-[#28313C] transition-all shadow-sm hover:shadow-md group"
            >
              <Download className="mr-2 size-4 text-muted-foreground group-hover:text-white transition-colors" /> Export Portable Data
            </Button>
          </div>

          {/* Info Notice */}
          <div className="rounded-xl border border-[#28313C] bg-[#0E1116] p-4 flex gap-3 items-start relative overflow-hidden group hover:border-[#28313C] transition-colors">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/50 to-transparent" />
            <div className="flex size-6 items-center justify-center rounded-full bg-[#141A22] border border-[#28313C] shrink-0 mt-0.5">
              <Building2 className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <p className="text-[12px] font-medium leading-relaxed text-muted-foreground/90">
              Additional organizations appear here after invite acceptance or portable workspace import. Demo-only switching has been disabled.
            </p>
          </div>
        </div>

        <div className="bg-[#080A0E] border-t border-[#28313C] p-5 px-7">
          <Button
            type="button"
            variant="outline"
            onClick={createNewGuestWorkspace}
            disabled={busy}
            className="w-full h-12 rounded-xl bg-transparent border-2 border-dashed border-[#28313C] text-muted-foreground hover:text-white hover:border-primary/50 hover:bg-primary/5 transition-all justify-center text-[13px] font-bold group disabled:opacity-50"
          >
            <Plus className="mr-2 size-4 text-muted-foreground group-hover:text-primary transition-colors" /> 
            {busy ? "Creating Workspace..." : "Create New Guest Workspace"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Logout Modal ────────────────────────────────────────────────────────────
function LogoutModal({ open, onClose, onSignOut }) {
  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-sm bg-[#0E1116] border-[#28313C] shadow-2xl">
        <DialogHeader>
          <div className="flex size-10 items-center justify-center rounded-full bg-critical/10 border border-critical/20 mb-3 mx-auto">
            <LogOut className="size-5 text-critical ml-1" />
          </div>
          <DialogTitle className="text-center text-lg text-white">Sign out of GENIUS?</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            You will be signed out of your current session on this device.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 flex gap-3 sm:justify-center border-none bg-transparent mx-0 mb-0 p-0">
          <Button variant="outline" onClick={onClose} className="flex-1 bg-[#141A22] border-[#28313C] text-white hover:bg-[#28313C]">
            Cancel
          </Button>
          <Button onClick={onSignOut} className="flex-1 bg-critical hover:bg-critical/90 text-white font-medium border-none">
            Sign out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Invite Team ─────────────────────────────────────────────────────────────
function InviteTeamModal({ open, onClose }) {
  const { busy, can, inviteMember } = useWorkspace();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Member");
  const [position, setPosition] = useState("Team Member");
  const [department, setDepartment] = useState("Operations");
  const [inviteLink, setInviteLink] = useState("");
  const canInvite = can("manage_members");

  async function handleInvite() {
    if (!canInvite) {
      toast.error("Your role cannot invite workspace members.");
      return;
    }

    try {
      const result = await inviteMember({ email, role, position, department });
      const url = result?.invite?.url || "";
      setInviteLink(url);
      toast.success(url ? "Workspace invite link created." : "Workspace member updated.");
      setEmail("");
      setRole("Member");
      setPosition("Team Member");
      setDepartment("Operations");
    } catch (error) {
      toast.error(error.message || "Invite failed.");
    }
  }

  async function copyInviteLink() {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success("Invite link copied.");
    } catch {
      toast.error("Could not copy invite link.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-md bg-[#0E1116] border-[#28313C] p-0 shadow-2xl">
        <div className="p-6 pb-4">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex size-8 items-center justify-center rounded-lg bg-[#141A22] border border-[#28313C]">
                <UserPlus className="size-4 text-white" />
              </div>
              <DialogTitle className="text-lg text-white">Invite team members</DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground mt-1">
              Add new members to the current workspace roster.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 flex flex-col gap-4">
          {!canInvite && (
            <div className="rounded-lg border border-critical/20 bg-critical/10 px-3 py-2 text-xs text-critical">
              Member invites require Owner or Admin access.
            </div>
          )}
          {inviteLink && (
            <div className="rounded-lg border border-primary/25 bg-primary/10 p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">Invite link</div>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={inviteLink}
                  className="min-w-0 flex-1 rounded-md border border-[#28313C] bg-[#0E1116] px-3 py-2 text-xs text-white"
                />
                <Button type="button" size="icon" onClick={copyInviteLink} className="size-9 bg-primary text-[#FFFFFF] hover:bg-primary/90">
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="colleague@acmecorp.io"
              className="bg-[#141A22] border border-[#28313C] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</label>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="bg-[#141A22] border border-[#28313C] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors appearance-none"
            >
              <option>Admin</option>
              <option>Manager</option>
              <option>Member</option>
              <option>Viewer</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Position</label>
              <input
                value={position}
                onChange={(event) => setPosition(event.target.value)}
                className="bg-[#141A22] border border-[#28313C] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Department</label>
              <input
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className="bg-[#141A22] border border-[#28313C] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#0E1116] border-t border-[#28313C] p-4 px-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => { setInviteLink(""); onClose(); }} className="bg-transparent border-[#28313C] text-muted-foreground hover:text-white">Close</Button>
          <Button
            onClick={handleInvite}
            disabled={busy || !canInvite}
            className="bg-primary text-[#FFFFFF] hover:bg-primary/90 font-medium disabled:opacity-50"
          >
            {busy ? "Saving..." : "Send invitation"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Billing Modal ───────────────────────────────────────────────────────────
function BillingModal({ open, onClose, onNavigate }) {
  const { backend } = useWorkspace();

  function lockedBillingAction(label) {
    toast.info(`${label} requires production billing to be connected.`);
  }

  function openSettings() {
    onClose();
    onNavigate?.("settings");
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-md bg-[#0E1116] border-[#28313C] p-0 shadow-2xl">
        <div className="p-6 pb-4">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex size-8 items-center justify-center rounded-lg bg-[#141A22] border border-[#28313C]">
                <CreditCard className="size-4 text-white" />
              </div>
              <DialogTitle className="text-lg text-white">Billing & Plans</DialogTitle>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 flex flex-col gap-4">
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-warning">
              <ShieldCheck className="size-4" /> Billing locked
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-white">Evaluation workspace</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Production billing, invoices, and payment methods are disabled in this local/investor demo environment.
            </p>
          </div>
          
          <div className="rounded-xl border border-[#28313C] bg-[#141A22]/50 p-4 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-white">Billing provider</span>
              <span className="text-xs text-muted-foreground">
                {backend?.storage === "supabase" ? "Ready for production integration" : "Local mode: no payment data stored"}
              </span>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => lockedBillingAction("Payment method update")} className="bg-transparent border-[#28313C] text-white hover:bg-[#141A22]">Update</Button>
          </div>
        </div>

        <div className="bg-[#0E1116] border-t border-[#28313C] p-4 px-6 flex justify-between items-center">
          <button type="button" onClick={() => lockedBillingAction("Invoice history")} className="text-xs text-muted-foreground hover:text-white transition-colors underline underline-offset-4">View past invoices</button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={openSettings} className="bg-transparent border-[#28313C] text-white hover:bg-[#141A22]">Settings</Button>
            <Button onClick={onClose} className="bg-[#141A22] border border-[#28313C] text-white hover:bg-[#28313C]">Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
