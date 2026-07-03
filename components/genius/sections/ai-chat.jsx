"use client";

import { useRef, useState } from "react";
import {
  ArrowUp, Bot, ChevronDown, FileText, Link2, Mic, Paperclip,
  Plus, ShieldCheck, Sparkles, Table2, X,
} from "lucide-react";
import {
  chatHistory, chatSeed, topChangesThisWeek,
  chatEvidenceContext, chatActiveAgents, chatOpenApprovals, chatDataQuality,
  formatCurrencyFull,
} from "@/lib/genius-data";
import { EvidenceLink, StatusDot } from "../shared";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const cannedReply = {
  role: "assistant",
  content: "Based on confirmed evidence in this workspace, the pattern points to recoverable spend. I have prepared a recommended next action for your approval — nothing will be executed until you confirm.",
  citations: [
    { label: "Vendors_Master.xlsx · col E", type: "evidence" },
    { label: "ledger_q1.csv · EUR block", type: "evidence" },
  ],
  nextAction: "Draft an approval to consolidate the flagged vendors.",
  confidence: 89,
};

// ── Top Changes Table ──────────────────────────────────────────────────────────
function TopChangesTable({ onNavigate }) {
  return (
    <div className="flex flex-col gap-2 animate-fade-in">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-foreground">Top changes this week</span>
        <button type="button" className="text-xs text-evidence hover:text-evidence/70 transition-colors" onClick={() => onNavigate?.("savings")}>
          View all findings →
        </button>
      </div>
      <div className="overflow-x-auto scrollbar-thin rounded-xl border border-[#ffffff08]">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#ffffff06] bg-white/[0.015]">
              {["#", "Finding", "Impact", "Confidence", "Source evidence", "Proof trail", "Recommended action"].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#3a4040] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topChangesThisWeek.map((row, i) => (
              <tr key={row.rank} className={cn("border-b border-[#ffffff04] transition-colors hover:bg-white/[0.02]", i === topChangesThisWeek.length - 1 && "border-b-0", row.rank === 1 && "bg-critical/[0.025]")}>
                <td className="px-3 py-3">
                  <span className={cn("flex size-5 items-center justify-center rounded-full text-[10px] font-bold",
                    row.rank === 1 ? "bg-critical/15 text-critical" : row.rank === 2 ? "bg-warning/15 text-warning" : "bg-white/5 text-[#5a6660]"
                  )}>{row.rank}</span>
                </td>
                <td className="px-3 py-3 max-w-[200px]">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-foreground">{row.finding}</span>
                      <span className={cn("rounded-full border px-1.5 py-0.5 text-[9px] font-semibold",
                        row.risk === "High risk" ? "border-critical/25 bg-critical/8 text-critical" : "border-warning/25 bg-warning/8 text-warning"
                      )}>{row.risk}</span>
                    </div>
                    <span className="text-[10px] text-[#4a5450] leading-snug">{row.desc}</span>
                  </div>
                </td>
                <td className="px-3 py-3 font-bold tabular text-foreground whitespace-nowrap">{row.impact}</td>
                <td className="px-3 py-3">
                  <div className="relative size-8">
                    <svg viewBox="0 0 32 32" className="-rotate-90 size-8">
                      <circle cx="16" cy="16" r="12" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                      <circle cx="16" cy="16" r="12" fill="none"
                        stroke={row.confidence > 85 ? "var(--primary)" : row.confidence > 70 ? "var(--warning)" : "var(--critical)"}
                        strokeWidth="4" strokeLinecap="round"
                        strokeDasharray={75.4} strokeDashoffset={75.4 - (row.confidence / 100) * 75.4}
                        style={{ filter: row.confidence > 85 ? "drop-shadow(0 0 3px var(--primary)60)" : undefined }}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold tabular text-foreground">{row.confidence}</span>
                  </div>
                </td>
                <td className="px-3 py-3"><EvidenceLink>{row.evidence}</EvidenceLink></td>
                <td className="px-3 py-3">
                  <button type="button" className="font-mono text-[11px] text-evidence hover:text-evidence/70 transition-colors">{row.proofTrail}</button>
                </td>
                <td className="px-3 py-3">
                  <button type="button" onClick={() => onNavigate?.("approvals")} className={cn("rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors",
                    row.actionTone === "primary" ? "bg-primary/12 text-primary hover:bg-primary/20" : "bg-warning/12 text-warning hover:bg-warning/20"
                  )}>{row.action}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Other notable */}
      <button type="button" className="flex items-center gap-2 rounded-xl border border-[#ffffff08] bg-white/[0.015] px-3 py-2.5 text-xs text-[#5a6660] transition-colors hover:bg-white/[0.03] hover:text-foreground">
        <Sparkles className="size-3.5 text-[#4a5450]" />
        Other notable changes (3)
        <ChevronDown className="size-3.5 ml-auto" />
      </button>
      {/* Suggestion pills */}
      <div className="flex flex-wrap gap-2">
        {["Show me more detail", "What is the total at risk?", "Which findings need approval?", "Build a board-ready summary"].map(s => (
          <button key={s} type="button" className="rounded-full border border-[#ffffff08] bg-white/[0.02] px-3 py-1.5 text-[11px] text-[#5a6660] transition-colors hover:border-primary/20 hover:text-foreground">
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Message ────────────────────────────────────────────────────────────────────
function Message({ msg, onNavigate }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/10">
          {msg.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-xl bg-[#16211b] shadow-sm shadow-primary/10">
        <Sparkles className="size-3.5 text-primary" />
      </div>
      <div className="flex flex-col gap-3 max-w-[92%]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-foreground">Genius (Gemini 1.5 Pro)</span>
          <span className="text-xs text-[#3a4040]">10:42 AM</span>
          <span className="flex items-center gap-1 text-[11px] font-medium text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            Using workspace data
          </span>
        </div>
        <div className="rounded-2xl rounded-tl-sm border border-[#ffffff08] bg-[#0d0f0e] px-4 py-3 text-sm leading-relaxed text-foreground">
          {msg.content}
        </div>
        {msg.showTopChanges && <TopChangesTable onNavigate={onNavigate} />}
        {msg.citations?.length ? (
          <div className="rounded-xl border border-evidence/15 bg-evidence/5 p-3">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-evidence">
              <FileText className="size-3.5" />
              Proof trail
            </div>
            <div className="flex flex-col gap-1.5">
              {msg.citations.map(c => <EvidenceLink key={c.label}>{c.label}</EvidenceLink>)}
            </div>
          </div>
        ) : null}
        {msg.nextAction && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#1a2820] bg-primary/5 p-3">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <ShieldCheck className="size-4 text-primary" />
              {msg.nextAction}
            </div>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => onNavigate?.("approvals")}>
              Create approval
            </Button>
          </div>
        )}
        {msg.confidence && (
          <span className="text-[11px] text-[#3a4040]">
            Answers grounded in verified evidence. Actions require human approval. · {msg.confidence}% confidence
          </span>
        )}
      </div>
    </div>
  );
}

// ── KPI Strip ──────────────────────────────────────────────────────────────────
const chatKpis = [
  { label: "Money at risk", value: "$287,430", trend: "+18.6%", tone: "critical" },
  { label: "Evidence sources", value: "95", trend: "+7 new", tone: "evidence" },
  { label: "Open approvals", value: "8", sub: "3 urgent", tone: "warning" },
  { label: "AI confidence", value: "87%", trend: "+5 pts", tone: "primary" },
  { label: "Data quality", value: "84%", sub: "Good", tone: "primary" },
];

function ChatKpiChip({ label, value, trend, tone, sub }) {
  const toneClass = { primary: "text-primary", critical: "text-critical", evidence: "text-evidence", warning: "text-warning" }[tone] || "text-foreground";
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border border-[#ffffff08] bg-[#0a0c0b] px-3.5 py-2.5">
      <span className="text-[10px] text-[#4a5450]">{label}</span>
      <span className={cn("text-lg font-bold tabular leading-none", toneClass)}>{value}</span>
      {(trend || sub) && <span className="text-[10px] text-[#3a4040]">{trend || sub}</span>}
    </div>
  );
}

// ── Right Panel ────────────────────────────────────────────────────────────────
const fileTypeStyle = {
  PDF: "bg-critical/12 text-critical border-critical/20",
  XLSX: "bg-primary/12 text-primary border-primary/20",
  CSV: "bg-evidence/12 text-evidence border-evidence/20",
};

const agentStatusStyle = {
  Active: "text-primary", Waiting: "text-warning", Blocked: "text-critical",
};

function RightPanel({ onNavigate }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Evidence in context */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#3a4040]">Evidence in context</span>
          <button type="button" className="text-[11px] text-evidence hover:text-evidence/70 transition-colors" onClick={() => onNavigate?.("data")}>
            View all →
          </button>
        </div>
        <p className="mb-2 text-[11px] text-[#4a5450]">12 sources</p>
        <div className="flex flex-col gap-1.5">
          {chatEvidenceContext.map(e => (
            <div key={e.name} className="flex items-center gap-2.5 rounded-xl border border-[#ffffff08] bg-[#0d0f0e] px-3 py-2 transition-colors hover:border-[#1a2820] cursor-pointer">
              <span className={cn("flex size-7 items-center justify-center rounded-lg border text-[9px] font-bold shrink-0", fileTypeStyle[e.type] || "bg-white/5 text-[#5a6660] border-white/8")}>{e.type}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate text-foreground">{e.name}</p>
                <p className="text-[10px] text-[#4a5450]">{e.type} · {e.date} · {e.size}</p>
              </div>
            </div>
          ))}
          <button type="button" className="text-[11px] text-evidence hover:text-evidence/70 transition-colors text-left" onClick={() => onNavigate?.("data")}>
            + 9 more sources
          </button>
        </div>
      </div>

      {/* Active agents */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#3a4040]">Active agents</span>
          <button type="button" className="text-[11px] text-evidence hover:text-evidence/70 transition-colors" onClick={() => onNavigate?.("agents")}>
            5 of 5 View all →
          </button>
        </div>
        <div className="flex flex-col gap-1.5">
          {chatActiveAgents.map(a => (
            <div key={a.name} className="flex items-start gap-2.5 rounded-xl border border-[#ffffff08] bg-[#0d0f0e] px-3 py-2 transition-colors hover:border-[#1a2820]">
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className={cn("size-1.5 rounded-full shrink-0", a.status === "Active" ? "bg-primary" : a.status === "Waiting" ? "bg-warning" : "bg-critical")} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-foreground">{a.name}</span>
                  <span className={cn("text-[10px] font-medium", agentStatusStyle[a.status])}>{a.status}</span>
                </div>
                <span className="text-[10px] text-[#4a5450]">{a.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Open approvals */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#3a4040]">Open approvals</span>
          <button type="button" className="text-[11px] text-evidence hover:text-evidence/70 transition-colors" onClick={() => onNavigate?.("approvals")}>
            8 View all →
          </button>
        </div>
        <div className="flex flex-col gap-1.5">
          {chatOpenApprovals.map((a, i) => (
            <div key={i} className="flex items-center justify-between gap-2 rounded-xl border border-[#ffffff08] bg-[#0d0f0e] px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate">{a.title}</p>
                {a.due && <p className="text-[10px] text-[#4a5450]">{a.due}</p>}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={cn("text-[11px] font-bold", a.priority === "Urgent" ? "text-critical" : "text-warning")}>{a.priority}</span>
                <span className="text-xs font-bold tabular text-foreground">{a.amount}</span>
              </div>
            </div>
          ))}
          <button type="button" className="text-[11px] text-evidence hover:text-evidence/70 transition-colors text-left" onClick={() => onNavigate?.("approvals")}>
            + 5 more approvals
          </button>
        </div>
      </div>

      {/* Data quality */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#3a4040]">Data quality</span>
          <span className="text-[11px] font-semibold text-primary">Good (84%)</span>
        </div>
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-white/4">
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
            <div key={q.label} className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-[#4a5450]">
                <span className={cn("size-1.5 rounded-full", q.color)} />
                {q.label}
              </span>
              <span className="tabular font-medium text-[#5a6660]">{q.pct}%</span>
            </div>
          ))}
        </div>
        <p className="mt-1.5 text-[10px] text-[#2e3630]">Last data sync: 2m ago</p>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AiChat({ onNavigate }) {
  const [messages, setMessages] = useState(chatSeed);
  const [input, setInput] = useState("");
  const [activeChat, setActiveChat] = useState(chatHistory[0].id);
  const scrollRef = useRef(null);

  function send() {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { role: "user", content: text }, { ...cannedReply }]);
    setInput("");
    requestAnimationFrame(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; });
  }

  const pinned = chatHistory.filter(c => c.pinned);
  const today = chatHistory.filter(c => !c.pinned && (c.updated.includes("AM") || c.updated.includes("PM")));
  const yesterday = chatHistory.filter(c => !c.pinned && c.updated.includes("May 25"));
  const older = chatHistory.filter(c => !c.pinned && c.updated.includes("May 24"));

  return (
    <div className="flex flex-col gap-4">
      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {chatKpis.map(k => <ChatKpiChip key={k.label} {...k} />)}
      </div>

      {/* Main 3-column layout */}
      <div className="grid gap-4 lg:grid-cols-[220px_1fr_240px] h-[calc(100vh-260px)] min-h-[520px]">
        {/* Left: Chat history */}
        <div className="hidden lg:flex flex-col rounded-xl border border-[#ffffff08] bg-[#0a0c0b] overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#ffffff06] px-3 py-3">
            <span className="text-sm font-semibold text-foreground">Chat history</span>
            <div className="flex items-center gap-1">
              <button type="button" className="flex size-6 items-center justify-center rounded-md text-[#5a6660] transition-colors hover:bg-white/5 hover:text-foreground" onClick={() => { setMessages([]); }}>
                <Plus className="size-3.5" />
              </button>
            </div>
          </div>
          <div className="px-2 py-2">
            <input
              placeholder="Search conversations..."
              className="w-full rounded-lg border border-[#ffffff08] bg-white/[0.025] px-2.5 py-1.5 text-xs text-[#5a6660] outline-none placeholder-[#2e3630] focus:border-[#1a2820] focus:text-foreground transition-colors"
            />
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin px-2 py-1">
            {[
              { label: "PINNED", items: pinned },
              { label: "TODAY", items: today },
              { label: "YESTERDAY", items: yesterday },
              { label: "OLDER", items: older },
            ].map(group => group.items.length > 0 && (
              <div key={group.label} className="mt-2.5">
                <span className="block px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[#2e3630]">{group.label}</span>
                <ul className="flex flex-col gap-0.5">
                  {group.items.map(c => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => setActiveChat(c.id)}
                        className={cn("flex w-full items-start gap-1.5 rounded-lg px-2 py-1.5 text-left transition-colors",
                          activeChat === c.id ? "bg-white/[0.04] text-foreground" : "text-[#5a6660] hover:bg-white/[0.025] hover:text-[#8a9490]"
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-medium">{c.title}</span>
                          <span className="text-[10px] text-[#3a4040]">{c.updated}</span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-[#ffffff06] px-3 py-2.5">
            <button type="button" className="text-[11px] text-evidence hover:text-evidence/70 transition-colors">View all conversations →</button>
          </div>
        </div>

        {/* Center: Chat */}
        <div className="flex flex-col rounded-xl border border-[#ffffff08] bg-[#0a0c0b] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#ffffff06] px-4 py-3">
            <div>
              <span className="text-sm font-semibold text-foreground">AI Chat / Workbench</span>
              <p className="text-[11px] text-[#4a5450]">Ask questions. Get evidence-backed answers. Approval-first.</p>
            </div>
            <div className="hidden lg:flex items-center gap-4 text-[11px]">
              {[
                { dot: "primary", label: "Gemini 1.5 Pro" },
                { dot: "primary", label: "Supabase" },
                { dot: "primary", label: "98%" },
                { dot: "primary", label: "84%" },
              ].map((c, i) => (
                <span key={i} className="flex items-center gap-1.5 text-[#5a6660]">
                  <span className="size-1.5 rounded-full bg-primary" />
                  {c.label}
                </span>
              ))}
              <span className="text-[#3a4040]">2m ago</span>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-4">
            <div className="flex flex-col gap-5">
              {messages.map((msg, i) => (
                <Message key={i} msg={msg} onNavigate={onNavigate} />
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-[#ffffff06] p-3">
            <div className="flex items-end gap-2 rounded-xl border border-[#ffffff10] bg-[#0d0f0e] p-2 transition-colors focus-within:border-[#1a2820]">
              <div className="flex-1">
                <Textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask anything about your business data..."
                  rows={2}
                  className="min-h-0 resize-none border-0 bg-transparent p-1 text-sm text-foreground placeholder-[#2e3630] outline-none ring-0 focus-visible:ring-0"
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && !(e.keyCode === 229)) {
                      e.preventDefault();
                      send();
                    }
                  }}
                />
              </div>
              <div className="flex items-center gap-1 pb-0.5">
                {[Paperclip, Link2, Table2, Mic].map((Icon, i) => (
                  <button key={i} type="button" className="flex size-7 items-center justify-center rounded-lg text-[#3a4040] transition-colors hover:bg-white/5 hover:text-[#6a7470]">
                    <Icon className="size-3.5" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={send}
                  className={cn("flex size-8 items-center justify-center rounded-xl transition-colors", input.trim() ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-white/5 text-[#3a4040]")}
                >
                  <ArrowUp className="size-4" />
                </button>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              {["Upload", "URL", "Excel / CSV", "Screenshot"].map(a => (
                <button key={a} type="button" className="flex items-center gap-1 text-[11px] text-[#3a4040] transition-colors hover:text-[#6a7470]">
                  <span>⊕</span>{a}
                </button>
              ))}
              <span className="ml-auto flex items-center gap-1 text-[10px] text-[#2e3630]">
                <ShieldCheck className="size-3" />
                Answers grounded in verified evidence
              </span>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="hidden lg:flex flex-col rounded-xl border border-[#ffffff08] bg-[#0a0c0b] overflow-hidden">
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
            <RightPanel onNavigate={onNavigate} />
          </div>
        </div>
      </div>
    </div>
  );
}
