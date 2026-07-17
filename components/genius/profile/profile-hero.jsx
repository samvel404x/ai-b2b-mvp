"use client";

import { ShieldCheck, Calendar, MapPin, Mail, Edit2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function ProfileHero({ profile, workspace, initials, onEditInfo }) {
  return (
    <div className="relative overflow-hidden rounded-[16px] border border-[#28313C] bg-[#0E1116] mb-8 shadow-sm h-auto sm:h-[180px] flex flex-col sm:flex-row items-start sm:items-center px-8 py-6 sm:py-0 justify-between gap-6 sm:gap-0">
      
      {/* Background Wave */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-[150%] h-[200%] bg-gradient-to-br from-[#4EA1FF]/5 via-[#7CC7FF]/10 to-transparent blur-[80px] animate-slow-pan" style={{ transform: 'rotate(-15deg)' }} />
        <div className="absolute -bottom-3/4 -left-1/4 w-[120%] h-[200%] bg-gradient-to-tr from-[#4EA1FF]/10 to-transparent blur-[100px] mix-blend-overlay animate-slow-pan-reverse" />
        {/* Mesh texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      </div>

      <div className="relative z-10 flex items-center gap-6 w-full sm:w-auto">
        <div className="relative shrink-0">
          <Avatar className="h-[88px] w-[88px] border-2 border-[#28313C] bg-[#4EA1FF] shadow-[0_0_20px_rgba(78,161,255,0.3)]">
            <AvatarFallback className="text-[32px] font-bold text-white bg-transparent">{initials}</AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 size-5 rounded-full bg-[#0E1116] flex items-center justify-center">
            <div className="size-3.5 rounded-full bg-[#22C55E]" />
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-0.5">
            <h2 className="text-[26px] font-bold text-white tracking-tight leading-none">{profile.displayName}</h2>
            <span className="bg-[#28313C]/80 border border-[#28313C] text-muted-foreground text-[10px] uppercase tracking-widest px-2 py-0.5 rounded font-semibold mt-0.5">Owner</span>
          </div>
          <p className="text-[15px] text-white/80 font-medium mb-2">{profile.role}</p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-[13px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><Mail className="size-3.5" /> {profile.email}</span>
            <span className="flex items-center gap-1.5"><MapPin className="size-3.5" /> {workspace?.workspaceName || workspace?.name || "GENIUS Workspace"}</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col xl:flex-row items-start sm:items-center gap-4 w-full sm:w-auto justify-end">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-[#0E1116] border border-[#28313C] rounded-xl px-4 py-3">
            <div className="size-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="size-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-white leading-tight">MFA Enabled</span>
              <span className="text-[12px] text-muted-foreground mt-0.5">Secure</span>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-[#0E1116] border border-[#28313C] rounded-xl px-4 py-3">
            <div className="size-10 rounded-full bg-[#28313C]/80 border border-[#28313C] flex items-center justify-center shrink-0">
              <Calendar className="size-5 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-white leading-tight">Member Since</span>
              <span className="text-[12px] text-muted-foreground mt-0.5">Jan 12, 2024</span>
            </div>
          </div>
        </div>
        {onEditInfo && (
          <Button onClick={onEditInfo} variant="outline" className="h-10 bg-transparent border-[#28313C] hover:bg-[#28313C]/50 hover:text-white transition-colors active:scale-[0.98]">
            <Edit2 className="size-4 mr-2" /> Edit profile
          </Button>
        )}
      </div>
    </div>
  );
}
