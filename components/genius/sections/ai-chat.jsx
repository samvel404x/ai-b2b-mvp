"use client";

import { useRef, useState } from "react";
import {
  ArrowUp,
  FileText,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { chatHistory, chatSeed } from "@/lib/genius-data";
import { Panel, EvidenceLink } from "../shared";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const cannedReply = {
  role: "assistant",
  content:
    "Based on the confirmed evidence in this workspace, the pattern points to recoverable spend. I've prepared a recommended next action for your approval — nothing will be executed until you confirm.",
  citations: [
    { label: "vendors_master.xlsx · col E", type: "evidence" },
    { label: "ledger_q1.csv · EUR block", type: "evidence" },
  ],
  nextAction: "Draft an approval to consolidate the flagged vendors.",
  confidence: 89,
};

function Message({ msg, onNavigate }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-lg rounded-br-sm bg-primary px-3.5 py-2.5 text-sm text-primary-foreground">
          {msg.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-secondary">
        <Sparkles className="size-4 text-primary" />
      </div>
      <div className="flex max-w-[80%] flex-col gap-3">
        <div className="rounded-lg rounded-tl-sm border border-border bg-card px-3.5 py-2.5 text-sm leading-relaxed">
          {msg.content}
        </div>
        {msg.citations?.length ? (
          <div className="rounded-lg border border-evidence/20 bg-evidence/5 p-3">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-evidence">
              <FileText className="size-3.5" />
              Proof trail
            </div>
            <div className="flex flex-col gap-1.5">
              {msg.citations.map((c) => (
                <EvidenceLink key={c.label}>{c.label}</EvidenceLink>
              ))}
            </div>
          </div>
        ) : null}
        {msg.nextAction ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-secondary/40 p-3">
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheck className="size-4 text-primary" />
              <span>{msg.nextAction}</span>
            </div>
            <Button size="sm" onClick={() => onNavigate("approvals")}>
              Create approval
            </Button>
          </div>
        ) : null}
        {msg.confidence ? (
          <span className="text-xs text-muted-foreground">
            Grounded in workspace evidence · {msg.confidence}% confidence
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default function AiChat({ onNavigate }) {
  const [messages, setMessages] = useState(chatSeed);
  const [input, setInput] = useState("");
  const [activeChat, setActiveChat] = useState(chatHistory[0].id);
  const scrollRef = useRef(null);

  function send() {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { ...cannedReply },
    ]);
    setInput("");
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      {/* History rail */}
      <Panel
        title="Conversations"
        contentClassName="p-0"
        className="hidden lg:flex"
        actions={
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setMessages([])}
          >
            <Plus />
          </Button>
        }
      >
        <ul className="flex flex-col p-2">
          {chatHistory.map((c) => (
            <li key={c.id}>
              <div
                className={cn(
                  "group flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors",
                  activeChat === c.id
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/50",
                )}
              >
                <button
                  type="button"
                  onClick={() => setActiveChat(c.id)}
                  className="flex min-w-0 flex-1 flex-col items-start text-left"
                >
                  <span className="w-full truncate">{c.title}</span>
                  <span className="text-xs text-muted-foreground">{c.updated}</span>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 opacity-0 group-hover:opacity-100"
                      >
                        <MoreHorizontal />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuItem>Rename</DropdownMenuItem>
                      <DropdownMenuItem>Archive</DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-critical">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      {/* Chat pane */}
      <Panel
        title="Workbench"
        description="Workspace-aware AI, grounded in your confirmed evidence"
        contentClassName="flex min-h-[560px] flex-col p-0"
      >
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-5 p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
                <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                  <Sparkles className="size-5 text-primary" />
                </div>
                <p className="text-sm font-medium">Ask about your workspace</p>
                <p className="max-w-sm text-xs text-muted-foreground">
                  Every answer cites the evidence it used and prepares an action
                  for your approval.
                </p>
              </div>
            ) : (
              messages.map((m, i) => (
                <Message key={i} msg={m} onNavigate={onNavigate} />
              ))
            )}
          </div>
        </div>

        <div className="border-t border-border p-3">
          <div className="flex items-end gap-2 rounded-lg border border-border bg-secondary/40 p-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing &&
                  e.keyCode !== 229
                ) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask GENIUS about findings, evidence or next actions…"
              className="min-h-10 resize-none border-0 bg-transparent p-1.5 shadow-none focus-visible:ring-0"
              rows={1}
            />
            <Button size="icon" className="size-9 shrink-0" onClick={send}>
              <ArrowUp />
            </Button>
          </div>
          <p className="mt-2 px-1 text-xs text-muted-foreground">
            GENIUS uses uploaded evidence and current findings. Actions require
            approval.
          </p>
        </div>
      </Panel>
    </div>
  );
}
