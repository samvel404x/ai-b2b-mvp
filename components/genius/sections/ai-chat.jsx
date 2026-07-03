"use client";

import { useRef, useState } from "react";
import {
  ArrowUp, ChevronDown, FileText, Link2, Mic, Paperclip,
  Plus, ShieldCheck, Sparkles, Table2,
} from "lucide-react";
import {
  chatHistory, chatSeed, topChangesThisWeek,
  chatEvidenceContext, chatActiveAgents, chatOpenApprovals, chatDataQuality,
  formatCurrencyFull,
} from "@/lib/genius-data";
import { EvidenceLink, StatusDot } from "../shared";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const cannedReply = {
  role: "assistant",
  content: "Based on the confirmed evidence in this workspace, the pattern points to recoverable spend. I have prepared a recommended next action for your approval — nothing will be executed until you confirm.",
  citations: [
    { label: "Vendors_Master.xlsx · col E", type: "evidence" },
    { label: "ledger_q1.csv · EUR block", type: "evidence" },
  ],
  nextAction: "Draft an approval to consolidate the flagged vendors.",
  confidence: 89,
};

function TopChangesTable({ onNavigate }) {
  return (
    <div className="flex flex-col gap-2 animate-fade-in">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-foreground">Top changes this week</span>
        <button type="button" className="text-xs text-evidence hover:underline" onClick={() => onNavigate?.("savings")}>View all findings →</button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              {["#", "Finding", "Impact", "Confidence", "Source evidence", "Proof trail", "Recommended action"].map(h => (
                <th key={h} className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {topChangesThisWeek.map(row => (
              <tr key={row.rank} className={cn("hover:bg-secondary/30 transition-colors", row.rank === 1 && "bg-warning/5")}>
                <td className="px-3 py-3">
                  <span className={cn("flex size-5 items-center justify-center rounded-full text-[10px] font-bold", row.rank === 1 ? "bg-critical/20 text-critical" : row.rank === 2 ? "bg-warning/20 text-warning" : "bg-secondary text-muted-foreground")}>
                    {row.rank}
                  </span>
                </td>
                <td className="px-3 py-3 max-w-[200px]">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium text-foreground">{row.finding}</span>
                      <span className={cn("rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
                        row.risk === "High risk" ? "border-critical/30 bg-critical/10 text-critical" : "border-warning/30 bg-warning/10 text-warning"
                      )}>{row.risk}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground leading-snug">{row.desc}</span>
                  </div>
                </td>
                <td className="px-3 py-3 tabular font-semibold text-foreground whitespace-nowrap">{row.impact}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="relative size-8">
                      <svg viewBox="0 0 32 32" className="-rotate-90 size-8">
                        <circle cx="16" cy="16" r="12" fill="none" stroke="var(--muted)" strokeWidth="4" />
                        <circle cx="16" cy="16" r="12" fill="none" stroke={row.confidence > 85 ? "var(--primary)" : row.confidence > 70 ? "var(--warning)" : "var(--critical)"} strokeWidth="4" strokeLinecap="round"
                          strokeDasharray={75.4} strokeDashoffset={75.4 - (row.confidence / 100) * 75.4}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold tabular">{row.confidence}</span>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3"><EvidenceLink>{row.evidence}</EvidenceLink></td>
                <td className="px-3 py-3">
                  <button type="button" className="text-xs text-evidence hover:underline font-mono">{row.proofTrail}</button>
                </td>
                <td className="px-3 py-3">
                  <button type="button" className={cn("rounded-md px-2.5 py-1 text-xs font-medium transition-colors", row.actionTone === "primary" ? "bg-primary/15 text-primary hover:bg-primary/25" : "bg-warning/15 text-warning hover:bg-warning/25")}>
                    {row.action}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Other notable changes */}
      <button type="button" className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-secondary/20 px-3 py-2.5 text-xs text-muted-foreground hover:bg-secondary/40 transition-colors">
        <Sparkles className="size-3.5 text-muted-foreground" />
        Other notable changes (3)
        <ChevronDown className="size-3.5 ml-auto" />
      </button>
      {/* Suggestion pills */}
      <div className="flex flex-wrap gap-2 mt-1">
        {["Show me more detail", "What is the total at risk?", "Which findings need approval?", "Build a board-ready summary"].map(s => (
          <button key={s} type="button" className="rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors">
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function Message({ msg, onNavigate }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-lg rounded-br-sm bg-primary px-3.5 py-2.5 text-sm text-primary-foreground">
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
      <div className="flex flex-col gap-3 max-w-[90%]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">Genius (Gemini 1.5 Pro)</span>
          <span className="text-xs text-muted-foreground">10:42 AM</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            Using workspace data
          </span>
        </div>
        <div className="rounded-lg rounded-tl-sm border border-border bg-card px-3.5 py-2.5 text-sm leading-relaxed">
          {msg.content}
        </div>
        {msg.showTopChanges && <TopChangesTable onNavigate={onNavigate} />}
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
            <Button size="sm" onClick={() => onNavigate?.("approvals")}>
              Create approval
            </Button>
          </div>
        ) : null}
        {msg.confidence ? (
          <span className="text-xs text-muted-foreground">
            Answers are grounded in verified evidence. Actions require human approval. · {msg.confidence}% confidence
          </span>
        ) : null}
      </div>
    </div>
  );
}

const fileTypeIcon = { PDF: "bg-critical/15 text-critical", XLSX: "bg-primary/15 text-primary", CSV: "bg-evidence/15 text-evidence" };
const agentStatusDot = { Active: "bg-primary", Waiting: "bg-warning", Blocked: "bg-critical" };

function RightPanel({ onNavigate }) {
  return (
    <div className="flex flex-col gap-5 text-sm">
      {/* Evidence in context */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Evidence in context</span>
          <button type="button" className="text-xs text-evidence hover:underline">View all →</button>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">12 sources</span>
          {chatEvidenceContext.map(e => (
            <div key={e.name} className="flex items-center gap-2.5 rounded-lg border border-border bg-secondary/30 px-3 py-2 hover:border-border/70 transition-colors cursor-pointer">
              <span className={cn("flex size-7 items-center justify-center rounded text-[10px] font-bold shrink-0", fileTypeIcon[e.type] || "bg-secondary text-muted-foreground")}>{e.type}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate text-foreground">{e.name}</p>
                <p className="text-[10px] text-muted-foreground">{e.type} · {e.date} · {e.size}</p>
              </div>
            </div>
          ))}
          <button type="button" className="text-xs text-evidence hover:underline text-left mt-0.5" onClick={() => onNavigate?.("data")}>
            + 9 more sources
          </button>
        </div>
      </div>

      {/* Active agents */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Active agents</span>
          <button type="button" className="text-xs text-evidence hover:underline" onClick={() => onNavigate?.("agents")}>
            5 of 5 View all →
          </button>
        </div>
        <div className="flex flex-col gap-1.5">
          {chatActiveAgents.map(a => (
            <div key={a.name} className="flex items-start gap-2.5 rounded-lg border border-border bg-secondary/30 px-3 py-2 hover:border-border/70 transition-colors">
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className={cn("size-2 rounded-full shrink-0", agentStatusDot[a.status] || "bg-muted-foreground")} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-medium text-foreground">{a.name}</span>
                  <span className={cn("text-[10px]", a.status === "Active" ? "text-primary" : a.status === "Waiting" ? "text-warning" : "text-critical")}>{a.status}</span>
                </div>
                <span className="text-[11px] text-muted-foreground">{a.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Open approvals */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Open approvals</span>
          <button type="button" className="text-xs text-evidence hover:underline" onClick={() => onNavigate?.("approvals")}>8 View all →</button>
        </div>
        <div className="flex flex-col gap-1.5">
          {chatOpenApprovals.map((a, i) => (
            <div key={i} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{a.title}</p>
                {a.due && <p className="text-[10px] text-muted-foreground">{a.due}</p>}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={cn("text-xs font-semibold", a.priority === "Urgent" ? "text-critical" : "text-warning")}>{a.priority}</span>
                <span className="tabular text-xs text-foreground font-medium">{a.amount}</span>
              </div>
            </div>
          ))}
          <button type="button" className="text-xs text-evidence hover:underline text-left mt-0.5" onClick={() => onNavigate?.("approvals")}>
            + 5 more approvals
          </button>
        </div>
      </div>

      {/* Data quality */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Data quality</span>
          <span className="text-xs text-primary font-medium">Good (84%)</span>
          <button type="button" className="text-xs text-evidence hover:underline">View details →</button>
        </div>
        <div className="flex h-2 w-full overflow-hidden rounded-full">
          <div className="bg-primary" style={{ width: `${chatDataQuality.complete}%` }} />
          <div className="bg-evidence" style={{ width: `${chatDataQuality.partial}%` }} />
          <div className="bg-warning" style={{ width: `${chatDataQuality.missing}%` }} />
          <div className="bg-critical" style={{ width: `${chatDataQuality.invalid}%` }} />
        </div>
        <div className="mt-2 flex flex-col gap-1">
          {[
            { label: "Complete", pct: chatDataQuality.complete, color: "bg-primary" },
            { label: "Partial", pct: chatDataQuality.partial, color: "bg-evidence" },
            { label: "Missing", pct: chatDataQuality.missing, color: "bg-warning" },
            { label: "Invalid", pct: chatDataQuality.invalid, color: "bg-critical" },
          ].map(q => (
            <div key={q.label} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className={cn("size-1.5 rounded-full", q.color)} />
                {q.label}
              </span>
              <span className="tabular text-muted-foreground">{q.pct}%</span>
            </div>
          ))}
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground">Last data sync: 2m ago</p>
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
    setMessages(prev => [
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

  const pinned = chatHistory.filter(c => c.pinned);
  const today = chatHistory.filter(c => !c.pinned && (c.updated.includes("AM") || c.updated.includes("PM")));
  const yesterday = chatHistory.filter(c => !c.pinned && c.updated.includes("May 25"));
  const older = chatHistory.filter(c => !c.pinned && c.updated.includes("May 24"));

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr_260px] h-[calc(100vh-140px)] min-h-[600px]">
      {/* Left: Chat history */}
      <div className="hidden lg:flex flex-col rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-3 py-3">
          <span className="text-sm font-semibold text-foreground">Chat history</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-6" onClick={() => setMessages([])}>
              <Plus className="size-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="size-6">
              <svg className="size-3.5" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
          <div className="mb-1">
            <input placeholder="Search conversations..." className="w-full rounded-md border border-border bg-secondary/40 px-2.5 py-1.5 text-xs outline-none placeholder:text-muted-foreground focus:border-primary/40" />
          </div>
          {[
            { label: "PINNED", items: pinned },
            { label: "TODAY", items: today },
            { label: "YESTERDAY", items: yesterday },
            { label: "OLDER", items: older },
          ].map(group => group.items.length > 0 && (
            <div key={group.label} className="mt-3">
              <span className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{group.label}</span>
              <ul className="mt-1">
                {group.items.map(c => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setActiveChat(c.id)}
                      className={cn("flex w-full items-start gap-1.5 rounded-md px-2 py-1.5 text-left transition-colors", activeChat === c.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground")}
                    >
                      <svg className="size-3.5 mt-0.5 shrink-0 text-muted-foreground" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/></svg>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium">{c.title}</span>
                        <span className="text-[10px] text-muted-foreground">{c.updated}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border px-3 py-2.5">
          <button type="button" className="text-xs text-evidence hover:underline">View all conversations →</button>
        </div>
      </div>

      {/* Center: Chat */}
      <div className="flex flex-col rounded-xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <span className="text-sm font-semibold text-foreground">AI Chat / Workbench</span>
            <p className="text-xs text-muted-foreground">Ask questions. Get evidence-backed answers. Approval-first.</p>
          </div>
          {/* Meta chips */}
          <div className="hidden lg:flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-primary" />Gemini 1.5 Pro</span>
            <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-primary" />Supabase</span>
            <span>Connector health <strong className="text-foreground">98%</strong></span>
            <span>Data quality <strong className="text-foreground">84%</strong></span>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="flex flex-col gap-5 p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
                <div className="flex size-11 items-center justify-center rounded-lg bg-secondary">
                  <Sparkles className="size-5 text-primary" />
                </div>
                <p className="text-sm font-medium">Ask GENIUS about your workspace</p>
                <p className="max-w-sm text-xs text-muted-foreground">Every answer cites the evidence it used and prepares an action for your approval.</p>
              </div>
            ) : (
              messages.map((m, i) => <Message key={i} msg={m} onNavigate={onNavigate} />)
            )}
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-border p-3">
          <div className="flex items-end gap-2 rounded-lg border border-border bg-secondary/40 p-2">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask anything about your business data…"
              className="min-h-10 resize-none border-0 bg-transparent p-1.5 shadow-none focus-visible:ring-0 text-sm"
              rows={1}
            />
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="size-8"><Paperclip className="size-3.5 text-muted-foreground" /></Button>
              <Button variant="ghost" size="icon" className="size-8"><Mic className="size-3.5 text-muted-foreground" /></Button>
              <Button size="icon" className="size-9 shrink-0" onClick={send}>
                <ArrowUp className="size-4" />
              </Button>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-4 px-1">
            {[{ icon: Paperclip, label: "Upload" }, { icon: Link2, label: "URL" }, { icon: Table2, label: "Excel / CSV" }].map(({ icon: Icon, label }) => (
              <button key={label} type="button" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Icon className="size-3" />{label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <button type="button" className="flex items-center gap-1.5 rounded-md border border-border bg-secondary/40 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Sparkles className="size-3 text-primary" />
                Gemini 1.5 Pro
                <ChevronDown className="size-3" />
              </button>
            </div>
          </div>
          <p className="mt-1.5 px-1 text-[10px] text-muted-foreground">
            Answers are grounded in verified evidence. Actions require human approval.
          </p>
        </div>
      </div>

      {/* Right: Evidence, Agents, Approvals, Quality */}
      <div className="hidden lg:flex flex-col rounded-xl border border-border bg-card overflow-y-auto scrollbar-thin p-4">
        <RightPanel onNavigate={onNavigate} />
      </div>
    </div>
  );
}
