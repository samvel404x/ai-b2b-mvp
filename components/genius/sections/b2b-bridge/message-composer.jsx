"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Paperclip, 
  Send, 
  Lock, 
  AtSign, 
  Type, 
  Smile
} from "lucide-react";

export function MessageComposer({ onSend, busy, status, canSend = true, disabledReason, onUtilityAction }) {
  const [chatInput, setChatInput] = useState("");
  const [mode, setMode] = useState("external"); // 'external' or 'internal'
  const isClosed = status === "Rejected" || status === "Resolved";

  const appendToken = (token) => {
    setChatInput((current) => {
      const separator = current && !current.endsWith(" ") ? " " : "";
      return `${current}${separator}${token}`;
    });
  };

  const handleMention = () => {
    appendToken("@Finance");
    onUtilityAction?.("Participant mention");
  };

  const handleEmoji = () => {
    appendToken(":thumbs-up:");
    onUtilityAction?.("Emoji picker");
  };

  const handleFormatting = () => {
    setChatInput((current) => {
      const trimmed = current.trim();
      return trimmed ? `**${trimmed}**` : "**Action needed:** ";
    });
    onUtilityAction?.("Message formatting");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || busy || !canSend || isClosed) return;
    const text = chatInput;
    await onSend(text, mode);
    setChatInput("");
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-[#0E1116] border-t border-[#28313C] px-8 pt-4 pb-6 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      
      {/* Mode Selector Tabs (Above input) */}
      <div className="flex items-center gap-6 mb-3 px-2">
        <button
          type="button"
          onClick={() => setMode("external")}
          className={cn(
            "pb-2 text-[12px] font-bold transition-all border-b-2",
            mode === "external" 
              ? "border-[#4EA1FF] text-white" 
              : "border-transparent text-muted-foreground hover:text-white"
          )}
        >
          Message to participants
        </button>
        <button
          type="button"
          onClick={() => setMode("internal")}
          className={cn(
            "pb-2 text-[12px] font-bold transition-all border-b-2",
            mode === "internal" 
              ? "border-warning text-warning" 
              : "border-transparent text-muted-foreground hover:text-white"
          )}
        >
          Internal note
        </button>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <div className={cn(
          "flex items-center rounded-xl border p-2 transition-all shadow-inner",
          mode === "internal"
            ? "border-warning/50 bg-warning/5 focus-within:bg-warning/10"
            : "border-[#28313C] bg-[#080A0E] focus-within:border-[#4EA1FF]/50 focus-within:bg-[#0E1116]"
        )}>
          
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={!canSend || isClosed}
            placeholder={
              !canSend
                ? disabledReason || "Your role can read this thread but cannot send messages."
                : isClosed
                ? "This discussion is closed." 
                : mode === "internal" 
                  ? "Type an internal note..." 
                  : "Type your message..."
            }
            className="flex-1 bg-transparent px-4 py-2.5 text-[14px] text-white placeholder-muted-foreground outline-none disabled:opacity-50"
          />
          
          <div className="flex items-center gap-2 pr-2">
            <button type="button" onClick={() => onUtilityAction?.("Attachment upload")} className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors" aria-label="Attach file">
              <Paperclip className="size-4" />
            </button>
            <button type="button" onClick={handleEmoji} className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors" aria-label="Open emoji picker">
              <Smile className="size-4" />
            </button>
            <button type="button" onClick={handleMention} className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors" aria-label="Mention participant">
              <AtSign className="size-4" />
            </button>
            <button type="button" onClick={handleFormatting} className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors mr-2" aria-label="Message formatting">
              <Type className="size-4" />
            </button>
            
            <button 
              type="submit" 
              aria-label={mode === "internal" ? "Send internal note" : "Send message"}
              disabled={busy || !canSend || isClosed} 
              className={cn(
                "flex size-10 items-center justify-center rounded-full shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50",
                mode === "internal"
                  ? "bg-warning text-black hover:bg-warning/90"
                  : "bg-[#4EA1FF] text-white hover:scale-[1.02] active:scale-95 shadow-[0_0_15px_rgba(78,161,255,0.3)]"
              )}
            >
              <Send className="size-4 ml-0.5" />
            </button>
          </div>
        </div>

        {mode === "internal" && (
          <div className="flex justify-start mt-3 px-2">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-warning/80">
              <Lock className="size-3" /> Visible to internal team only
            </span>
          </div>
        )}
      </form>
    </div>
  );
}
