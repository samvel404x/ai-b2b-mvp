"use client";

import { useRef, useEffect } from "react";
import { FullAiResponse } from "./ai-response-blocks";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Check, Tags, Link as LinkIcon, Download, MoreHorizontal, Pin, Users, Copy, Trash2, Plus, Archive } from "lucide-react";

function EmptyWorkbenchLauncher({ onPromptSelect }) {
  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto px-6 py-20 text-center animate-fade-in">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 mb-6 shadow-[0_0_30px_rgba(78,161,255,0.15)]">
        <svg className="size-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
      </div>
      <h2 className="text-[22px] font-bold text-white mb-2">What do you want to accomplish?</h2>
      <p className="text-[14px] text-muted-foreground mb-10 max-w-lg leading-relaxed">
        GENIUS can analyze your workspace data, compare market benchmarks, and identify cost-saving opportunities.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full mb-10">
        {[
          { label: "Analyze Renewals", icon: <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
          { label: "Compare Vendors", icon: <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg> },
          { label: "Diagnose Spend", icon: <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> },
        ].map((action, i) => (
          <button key={i} type="button" onClick={() => onPromptSelect?.(action.label)} className="flex items-center gap-2.5 rounded-lg border border-[#28313C] bg-[#141A22] p-3 text-left transition-colors hover:border-primary/50 hover:bg-[#28313C]/80 group shadow-sm">
            <div className="text-muted-foreground group-hover:text-primary transition-colors">{action.icon}</div>
            <span className="text-[13px] font-medium text-white">{action.label}</span>
          </button>
        ))}
      </div>
      
      <div className="flex flex-col w-full text-left">
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 pl-1">Recommended Analyses</span>
        <div className="flex flex-col gap-2">
           <button type="button" onClick={() => onPromptSelect?.("Evaluate Microsoft EA renewal for Q4 against current software usage telemetry")} className="text-left px-4 py-3 rounded-lg border border-[#28313C] bg-transparent hover:bg-[#141A22] transition-colors text-[13px] text-white/80">
             Evaluate Microsoft EA renewal for Q4 against current software usage telemetry
           </button>
           <button type="button" onClick={() => onPromptSelect?.("Identify duplicate SaaS tools across Engineering and Marketing departments")} className="text-left px-4 py-3 rounded-lg border border-[#28313C] bg-transparent hover:bg-[#141A22] transition-colors text-[13px] text-white/80">
             Identify duplicate SaaS tools across Engineering and Marketing departments
           </button>
        </div>
      </div>
    </div>
  );
}

function StructuredProcessingPanel() {
  const stages = [
    { label: "Preparing analysis", status: "complete" },
    { label: "Loading workspace context", status: "complete" },
    { label: "Reading contract terms", status: "active" },
    { label: "Comparing market benchmarks", status: "pending" },
    { label: "Generating recommendations", status: "pending" },
  ];

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-primary/20 bg-[#141A22]/80 backdrop-blur-md p-5 shadow-lg w-full max-w-4xl animate-fade-in relative overflow-hidden mb-8">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary animate-pulse shadow-sm">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div className="flex flex-col">
            <h3 className="text-[15px] font-bold text-white tracking-wide">Analyzing workspace data</h3>
            <p className="text-[13px] text-muted-foreground mt-0.5">Gemini 1.5 Pro • Reading contract terms (45%)</p>
          </div>
        </div>
        <span className="text-[12px] font-mono font-medium text-muted-foreground">00:12</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2 pt-4 border-t border-[#28313C]">
        <div className="flex flex-col gap-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Execution Plan</div>
          <div className="flex flex-col gap-2.5">
            {stages.map((stage, i) => (
              <div key={i} className="flex items-center gap-3">
                {stage.status === "complete" && <div className="size-4 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0"><svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>}
                {stage.status === "active" && <div className="size-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />}
                {stage.status === "pending" && <div className="size-4 rounded-full border border-[#28313C] shrink-0" />}
                <span className={cn(
                  "text-[13px]",
                  stage.status === "complete" ? "text-white/60" :
                  stage.status === "active" ? "text-white font-medium animate-pulse" : "text-muted-foreground"
                )}>{stage.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Live Context</div>
          <div className="grid grid-cols-2 gap-3">
             <div className="rounded-lg border border-[#28313C] bg-[#0E1116] p-3 shadow-sm">
               <div className="text-[11px] text-muted-foreground mb-1">Sources Analyzed</div>
               <div className="text-[14px] font-bold text-white">4 Documents</div>
             </div>
             <div className="rounded-lg border border-[#28313C] bg-[#0E1116] p-3 shadow-sm">
               <div className="text-[11px] text-muted-foreground mb-1">Data Quality</div>
               <div className="text-[14px] font-bold text-warning flex items-center gap-1.5">
                 <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                 Missing terms
               </div>
             </div>
             <div className="rounded-lg border border-[#28313C] bg-[#0E1116] p-3 col-span-2 shadow-sm">
               <div className="text-[11px] text-muted-foreground mb-1.5">Assigned Agents</div>
               <div className="text-[13px] font-medium text-white flex items-center gap-2">
                 <span className="flex size-5 items-center justify-center rounded bg-[#4EA1FF]/20 text-[#4EA1FF]"><svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></span>
                 Spend Auditor
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function updatedLabel(value) {
  if (!value) return "Not saved yet";
  try {
    return `Last updated ${new Date(value).toLocaleString()}`;
  } catch {
    return "Last updated recently";
  }
}

const WORKBENCH_TAG_OPTIONS = ["Software", "Finance", "Operations", "Security", "HR", "Legal"];

export function WorkbenchCanvas({
  messages,
  isTyping,
  conversation,
  onNavigate,
  onPromptSelect,
  onRenameConversation,
  onArchiveConversation,
  onDeleteConversation,
  onTogglePin,
  onExportConversation,
  onBranchConversation,
  onSaveArtifact,
  onUpdateConversationTags,
  defaultTags = ["Software"],
  canSaveArtifacts = true,
  busy = false,
}) {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const conversationTitle = conversation?.title || "New workspace chat";
  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Workspace chat link copied");
    } catch {
      toast.info("Clipboard is unavailable in this browser session.");
    }
  };
  const handleLockedLocalAction = (label) => {
    toast.info(`${label} is locked until workspace sharing and tag persistence are enabled.`);
  };
  const conversationTags = Array.isArray(conversation?.tags) && conversation.tags.length ? conversation.tags : defaultTags;
  const primaryTag = conversationTags[0] || "Software";
  const saveTags = async (nextTags) => {
    if (!conversation?.id) {
      toast.info("Send a message before saving conversation tags.");
      return;
    }
    if (!onUpdateConversationTags) {
      handleLockedLocalAction("Tag persistence");
      return;
    }
    try {
      await onUpdateConversationTags(Array.from(new Set(nextTags)).filter(Boolean).slice(0, 8));
      toast.success("Conversation tags updated");
    } catch (error) {
      toast.error(error.message || "Conversation tags could not be updated.");
    }
  };
  const toggleTag = (tag) => {
    const nextTags = conversationTags.includes(tag)
      ? conversationTags.filter((item) => item !== tag)
      : [...conversationTags, tag];
    saveTags(nextTags.length ? nextTags : [tag]);
  };
  const removePrimaryTag = () => {
    saveTags(conversationTags.filter((item) => item !== primaryTag));
  };
  const createCustomTag = () => {
    const newTag = window.prompt("Enter new tag name:");
    if (newTag && newTag.trim()) {
      saveTags([...conversationTags, newTag.trim()]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#080A0E] animate-fade-in relative z-10 overflow-hidden">
      
      {/* Subtle Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(78,161,255,0.08)_0%,rgba(78,161,255,0.025)_36%,transparent_68%)] pointer-events-none" />

      {/* Title Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 shrink-0 border-b border-[#28313C]/80 bg-[#0E1116]/80 backdrop-blur-md z-20 relative shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-6 rounded-md border border-primary/30 bg-primary/10 text-primary shadow-sm">
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </div>
          <button type="button" disabled={!conversation?.id} onClick={onRenameConversation} className="flex items-center gap-1.5 group cursor-pointer disabled:cursor-not-allowed disabled:opacity-70">
            <span className="text-[15px] font-bold text-white tracking-wide group-hover:text-primary transition-colors">{conversationTitle}</span>
            <svg className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
          <div className="h-4 w-px bg-[#28313C] mx-1" />
          <div className="flex items-center gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 px-2 py-0.5 rounded border border-[#28313C] bg-[#141A22] text-[11px] font-medium text-muted-foreground hover:text-white transition-colors cursor-pointer outline-none">
                <Tags className="size-2.5" />
                {primaryTag}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-[#0E1116] border-[#28313C] text-white">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Manage Tags</DropdownMenuLabel>
                {WORKBENCH_TAG_OPTIONS.map((tag) => {
                  const selected = conversationTags.includes(tag);
                  return (
                    <DropdownMenuItem key={tag} onClick={() => toggleTag(tag)} className="hover:bg-[#28313C] focus:bg-[#28313C] cursor-pointer flex items-center justify-between">
                      {tag}
                      {selected && <Check className="size-3.5 text-primary" />}
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator className="bg-[#28313C]" />
                <DropdownMenuItem onClick={removePrimaryTag} className="hover:bg-[#28313C] focus:bg-[#28313C] cursor-pointer text-muted-foreground"><Trash2 className="size-3.5 mr-2" /> Remove tag</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 px-2 py-0.5 rounded border border-dashed border-[#28313C] bg-transparent text-[11px] font-medium text-muted-foreground hover:border-[#28313C]/80 hover:text-white transition-colors cursor-pointer outline-none">
                <Plus className="size-2.5" />
                Add tag
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-[#0E1116] border-[#28313C] text-white">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Suggested Tags</DropdownMenuLabel>
                {WORKBENCH_TAG_OPTIONS.filter((tag) => !conversationTags.includes(tag)).map((tag) => (
                  <DropdownMenuItem key={tag} onClick={() => toggleTag(tag)} className="hover:bg-[#28313C] focus:bg-[#28313C] cursor-pointer">{tag}</DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-[#28313C]" />
                <DropdownMenuItem onClick={createCustomTag} className="hover:bg-[#28313C] focus:bg-[#28313C] cursor-pointer text-primary"><Plus className="size-3.5 mr-2" /> Create new tag</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-muted-foreground mr-2 hidden sm:inline-block">{updatedLabel(conversation?.updatedAt)}</span>
          
          <button type="button" onClick={onTogglePin} disabled={!conversation?.id} className="flex items-center justify-center size-7 rounded text-primary hover:bg-[#28313C] hover:text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40" title={conversation?.pinned ? "Unpin" : "Pin"}>
            <Pin className="size-3.5" fill={conversation?.pinned ? "currentColor" : "none"} />
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center size-7 rounded text-muted-foreground hover:bg-[#28313C] hover:text-white transition-colors outline-none" title="Share">
              <Users className="size-3.5" />
            </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-[#0E1116] border-[#28313C] text-white">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Share Conversation</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => toast.success("Team sharing updated")} className="hover:bg-[#28313C] focus:bg-[#28313C] cursor-pointer"><Users className="size-3.5 mr-2" /> Share with team</DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyShareLink} className="hover:bg-[#28313C] focus:bg-[#28313C] cursor-pointer"><LinkIcon className="size-3.5 mr-2" /> Copy share link</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center size-7 rounded text-muted-foreground hover:bg-[#28313C] hover:text-white transition-colors outline-none" title="Export">
              <Download className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-[#0E1116] border-[#28313C] text-white">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Export Conversation</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onExportConversation?.("markdown")} className="hover:bg-[#28313C] focus:bg-[#28313C] cursor-pointer">Markdown (.md)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExportConversation?.("json")} className="hover:bg-[#28313C] focus:bg-[#28313C] cursor-pointer">JSON (.json)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center size-7 rounded text-muted-foreground hover:bg-[#28313C] hover:text-white transition-colors ml-1 outline-none" title="More">
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-[#0E1116] border-[#28313C] text-white">
              <DropdownMenuItem disabled={!conversation?.id} onClick={onRenameConversation} className="hover:bg-[#28313C] focus:bg-[#28313C] cursor-pointer"><Copy className="size-3.5 mr-2" /> Rename chat</DropdownMenuItem>
              <DropdownMenuItem disabled={!conversation?.id} onClick={onArchiveConversation} className="hover:bg-[#28313C] focus:bg-[#28313C] cursor-pointer"><Archive className="size-3.5 mr-2" /> Archive conversation</DropdownMenuItem>
              <DropdownMenuItem disabled={!conversation?.id} onClick={() => onBranchConversation?.(null)} className="hover:bg-[#28313C] focus:bg-[#28313C] cursor-pointer"><svg className="size-3.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7l-2 2m2-2l2 2m4 4l2-2m-2 2l-2-2" /></svg> Branch conversation</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#28313C]" />
              <DropdownMenuItem disabled={!conversation?.id} onClick={onDeleteConversation} className="hover:bg-[#28313C] focus:bg-[#28313C] cursor-pointer text-[#ef4444]"><Trash2 className="size-3.5 mr-2" /> Delete chat</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main scrolling chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-6 pb-8 pt-6 z-10 relative">
        <div className="flex flex-col w-full mx-auto">
          {messages.length === 0 && !isTyping ? (
            <EmptyWorkbenchLauncher onPromptSelect={onPromptSelect} />
          ) : (
            messages.map((msg, i) => {
              if (msg.role === "user") {
                return (
                  <div key={i} className="flex gap-3 mb-8 last:mb-0 justify-end w-full animate-fade-in-up" style={{ animationDuration: "200ms" }}>
                    <div className="flex flex-col gap-2 max-w-[70%] min-w-0 items-end">
                      <div className="flex items-center gap-2.5">
                        <button type="button" onClick={() => onBranchConversation?.(msg.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-muted-foreground hover:text-white flex items-center gap-1 bg-[#141A22] border border-[#28313C] px-1.5 py-0.5 rounded shadow-sm">
                          <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7l-2 2m2-2l2 2m4 4l2-2m-2 2l-2-2" /></svg>
                          Branch
                        </button>
                        <span className="text-[11px] text-muted-foreground">{msg.time || "Just now"}</span>
                        <span className="text-[13px] font-bold text-white">You</span>
                      </div>
                      <div className="rounded-2xl rounded-tr-sm bg-primary/20 border border-primary/30 px-5 py-3.5 text-[14px] text-white leading-relaxed shadow-sm group">
                        {msg.content}
                      </div>
                    </div>
                    <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/50 bg-primary/20">
                      <span className="text-[10px] font-bold text-white">AR</span>
                    </div>
                  </div>
                );
              }

              // Assistant messages with the structured layout if it's the large response
              if (msg.isFullResponse) {
                return (
                  <FullAiResponse
                    key={i}
                    onNavigate={onNavigate}
                    onSaveArtifact={onSaveArtifact}
                    canSaveArtifacts={canSaveArtifacts}
                    busy={busy}
                  />
                );
              }

              // Thinking State
              if (msg.isThinking) {
                 return (
                  <div key={i} className="flex mb-8 animate-fade-in-up" style={{ animationDuration: "250ms" }}>
                    <StructuredProcessingPanel />
                  </div>
                );
              }

              // Normal streaming or completed text message
              return (
                <div key={i} className="flex gap-3 mb-8 last:mb-0 w-full animate-fade-in-up" style={{ animationDuration: "250ms" }}>
                  <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary shadow-sm">
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div className="flex flex-col gap-2 max-w-[800px] min-w-0 group">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[14px] font-bold text-white">GENIUS</span>
                      <span className="text-[11px] text-muted-foreground">{msg.time || "Just now"}</span>
                      <button type="button" onClick={() => onBranchConversation?.(msg.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-muted-foreground hover:text-white flex items-center gap-1 bg-[#141A22] border border-[#28313C] px-1.5 py-0.5 rounded shadow-sm">
                        <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7l-2 2m2-2l2 2m4 4l2-2m-2 2l-2-2" /></svg>
                        Branch
                      </button>
                    </div>
                    <div className="text-[15px] leading-relaxed text-white/90">
                      {msg.content}
                      {msg.isStreaming && <span className="inline-block w-1.5 h-3.5 ml-1 bg-primary animate-pulse align-middle" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          {/* Bottom scroll anchor */}
          <div className="h-8" />
        </div>
      </div>
      
    </div>
  );
}
