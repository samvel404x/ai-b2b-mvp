"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, Sparkles, Hexagon, ThumbsUp } from "lucide-react";
import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function MessageList({ messages, onViewEvidence, onAcknowledge }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-8 py-6 space-y-6 scrollbar-thin scrollbar-thumb-[#28313C] pb-48 relative"
    >
      <div className="flex justify-center mb-6">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">May 23, 2026</span>
      </div>

      {messages.map((msg, idx) => (
        <div key={msg.id} className={cn("flex w-full", msg.isSystem || msg.isInternal ? "justify-center" : msg.isSelf ? "justify-end" : "justify-start")}>

          {msg.isSystem ? (
            /* AI / System Event Block */
            <div className={cn(
              "flex flex-col rounded-xl border p-5 shadow-lg relative min-w-[500px] max-w-[700px]",
              msg.role.includes('AI')
                ? "border-[#4EA1FF]/40 bg-[#141A22]"
                : "border-emerald-500/40 bg-[#141A22]/60"
            )}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-widest">
                  <div className={cn("flex size-6 items-center justify-center rounded-full text-white", msg.role.includes('AI') ? "bg-[#4EA1FF]" : "bg-[#0E1116] border border-emerald-500 text-emerald-500")}>
                    <Sparkles className={cn("size-3", msg.role.includes('AI') ? "text-white" : "text-emerald-500")} />
                  </div>
                  {msg.role.includes('AI') ? 'AI VERIFICATION' : 'SYSTEM BOT'}
                  <span className="text-muted-foreground font-medium ml-1 lowercase tracking-normal">{msg.time}</span>
                </div>
                {msg.status && (
                  <span className={cn(
                    "rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest",
                    msg.status === 'Resolved' 
                      ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" 
                      : "bg-[#4EA1FF]/20 text-[#4EA1FF] border border-[#4EA1FF]/30"
                  )}>
                    {msg.status}
                  </span>
                )}
              </div>
              <p className="text-[13px] text-white/95 leading-relaxed whitespace-pre-line font-medium mb-4">{msg.text}</p>
              
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => onViewEvidence?.(msg)} className={cn("flex items-center gap-1.5 rounded border px-3 py-1.5 text-[11px] font-bold transition-colors",
                  msg.role.includes('AI') ? "border-[#4EA1FF]/30 text-[#4EA1FF] hover:bg-[#4EA1FF]/10" : "border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
                )}>
                  {msg.role.includes('AI') ? 'View evidence' : 'View summary'}
                </button>
                {msg.role.includes('AI') && (
                  <>
                    <button type="button" onClick={() => onAcknowledge?.(msg, "useful")} className="flex items-center gap-1.5 rounded border border-[#28313C] bg-[#141A22] px-2.5 py-1.5 text-[11px] font-bold text-muted-foreground hover:text-white transition-colors">
                      <ThumbsUp className="size-3.5" /> 1
                    </button>
                    <button type="button" onClick={() => onAcknowledge?.(msg, "verified")} className="flex items-center gap-1.5 rounded border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-bold text-emerald-500 hover:bg-emerald-500/20 transition-colors">
                      <CheckCircle2 className="size-3.5" /> 1
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : msg.isInternal ? (
            /* Internal Note Block */
             <div className="flex flex-col rounded-xl border border-warning/40 bg-warning/5 p-4 shadow-lg relative min-w-[400px] max-w-[600px]">
                <div className="absolute -top-3 left-4 rounded bg-warning px-2 py-0.5 text-[9px] font-bold text-black uppercase tracking-widest">
                  Internal Note
                </div>
                <div className="flex items-center justify-between mb-2 mt-1">
                  <span className="text-[11px] font-bold text-warning">{msg.sender}</span>
                  <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                </div>
                <p className="text-[13px] text-white/90 leading-relaxed font-medium">{msg.text}</p>
             </div>
          ) : (
            /* Normal Chat Bubbles */
            <div className={cn("flex gap-4 max-w-[75%]", msg.isSelf ? "flex-row" : "flex-row-reverse")}>

              <div className="flex flex-col w-full">
                <div className={cn("flex items-center gap-2 mb-2 px-1", msg.isSelf ? "justify-end" : "justify-start")}>
                  {!msg.isSelf && (
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#4EA1FF] text-white text-[10px] font-bold shadow-sm">
                      {msg.sender.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                  <span className="text-[12px] font-bold text-white">{msg.sender}</span>
                  <span className="text-[10px] text-muted-foreground">{msg.role}</span>
                  <span className="text-[10px] text-muted-foreground ml-2">{msg.time}</span>
                </div>

                <div className="flex gap-3 items-end">

                  <div className="flex flex-col w-full">
                    <div className={cn(
                      "rounded-xl p-4 text-[14px] leading-relaxed shadow-sm relative",
                      msg.isSelf
                        ? "bg-[#141A22] text-white border border-[#28313C] rounded-tr-sm shadow-[0_4px_20px_rgba(78,161,255,0.05)]"
                        : "bg-[#141A22] text-white/90 border border-[#28313C] rounded-tl-sm"
                    )}>
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>

                    <div className={cn("flex mt-2", msg.isSelf ? "justify-end" : "justify-start")}>
                      {msg.isSelf ? (
                        <span className="text-[10px] font-semibold flex items-center gap-1 text-[#4EA1FF]">
                          {msg.status} {(msg.status.includes('Read') || msg.status === 'Delivered') && <CheckCircle2 className="size-3" />}
                        </span>
                      ) : (
                        <button type="button" onClick={() => onAcknowledge?.(msg, "acknowledged")} className="flex items-center gap-1.5 rounded border border-[#28313C] bg-[#141A22] px-2.5 py-1 text-[11px] font-bold text-warning hover:text-white transition-colors">
                          <ThumbsUp className="size-3" /> 1
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}
        </div>
      ))}
    </div>
  );
}
