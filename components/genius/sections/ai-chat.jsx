"use client";

import { useRef, useState } from "react";
import {
  ArrowUp, ArrowUpRight, Bot, ChevronDown, FileText, Link2, Mic, Paperclip, Pin,
  Plus, ShieldCheck, Sparkles, Table2, X, MoreVertical, Pencil, Trash2, Archive, MessageSquare, Search, Copy
} from "lucide-react";
import {
  chatHistory as initialChatHistory, chatSeed, topChangesThisWeek,
  chatEvidenceContext, chatActiveAgents, chatOpenApprovals, chatDataQuality,
} from "@/lib/genius-data";
import { Panel, EvidenceLink, StatusDot, SeverityBadge, MetricCard } from "../shared";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SectionLoader } from "../section-loader";

function ApprovalPill({ state }) {
  const s = {
    "Open": "border-warning/25 bg-warning/10 text-warning",
    "In progress": "border-primary/25 bg-primary/10 text-primary",
    "Review": "border-evidence/25 bg-evidence/10 text-evidence",
    "Approved": "border-primary/25 bg-primary/10 text-primary",
    "Rejected": "border-critical/25 bg-critical/10 text-critical",
  }[state] || "border-[#1E2730] bg-[#141B21] text-muted-foreground";
  return <span className={cn("rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest", s)}>{state}</span>;
}

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

// ── Pinned thread message maps ─────────────────────────────────────────────────
const pinnedThreads = {
  'Microsoft EA renewal': [
    { role: 'user', content: 'What is the status of the Microsoft EA renewal?' },
    { role: 'assistant', content: 'The Microsoft EA renewal is scheduled for June 15, 2026. Current quote is $3.42M — 18-22% above benchmark (range: $2.51M–$2.90M). I recommend initiating renegotiation this week. Confidence: 92%. Source: Microsoft_EA_Renewal_Quote.pdf', confidence: 92 },
  ],
  'Unused licenses': [
    { role: 'user', content: 'Show me unused SaaS license analysis' },
    { role: 'assistant', content: '298 seats have been unused for >60 days across Zoom, Salesforce, and Slack. Estimated annual waste: $1.15M. Confidence: 89%. Action: Reclaim or reassign by end of month. Source: SaaS_Usage_May_2026.xlsx', confidence: 89 },
  ],
  'Q4 forecast': [
    { role: 'user', content: 'What is the Q4 forecast variance?' },
    { role: 'assistant', content: 'Q4 forecast variance has increased to 10.2% ($430K below target). Primary drivers: delayed enterprise deals (52%) and higher-than-expected vendor costs (34%). Confidence: 64%. Recommend forecast update before board review. Source: Forecast_Variance_Q4.xlsx', confidence: 64 },
  ],
};

// ── Timestamp helper ───────────────────────────────────────────────────────────
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── Top Changes Table ───────────────────────────────────────────────────────────
function TopChangesTable({ onNavigate }) {
  return (
    <div className="flex flex-col gap-3 animate-fade-in mt-2">
      <div className="overflow-x-auto scrollbar-thin rounded border border-[#1E2730]">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-[#141B21]">
              {["#", "Finding", "Impact", "Confidence", "Source evidence", "Proof trail", "Recommended action"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topChangesThisWeek.map((row, i) => (
              <tr key={row.rank} className={cn("border-b border-[#1E2730]/50 transition-colors hover:bg-[#141B21]/50", i === topChangesThisWeek.length - 1 && "border-b-0", row.rank === 1 && "bg-critical/5")}>
                <td className="px-4 py-3">
                  <span className={cn("flex size-5 items-center justify-center rounded-full text-[10px] font-bold",
                    row.rank === 1 ? "bg-critical/10 text-critical" : row.rank === 2 ? "bg-warning/10 text-warning" : "bg-white/5 text-muted-foreground"
                  )}>{row.rank}</span>
                </td>
                <td className="px-4 py-3 max-w-[180px]">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-white truncate">{row.finding}</span>
                    <span className="text-[10px] text-muted-foreground leading-snug truncate">{row.desc}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-bold tabular text-white whitespace-nowrap">{row.impact}</td>
                <td className="px-4 py-3">{row.confidence}%</td>
                <td className="px-4 py-3"><EvidenceLink>{row.evidence}</EvidenceLink></td>
                <td className="px-4 py-3">
                  <button type="button" onClick={() => toast.info("Viewing proof trail...")} className="font-mono text-[11px] text-evidence hover:text-evidence/70 transition-colors">{row.proofTrail}</button>
                </td>
                <td className="px-4 py-3">
                  <button type="button" onClick={() => onNavigate?.("approvals")} className={cn("flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-semibold transition-colors",
                    row.actionTone === "primary" ? "bg-primary/10 text-primary hover:bg-primary/20" : "bg-warning/10 text-warning hover:bg-warning/20"
                  )}>
                    {row.action}
                    <ChevronDown className="size-3 opacity-70" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Message({ msg, onNavigate }) {
  const timestamp = msg.timestamp ? formatTime(new Date(msg.timestamp)) : formatTime(new Date());

  // Typing indicator
  if (msg.isThinking) {
    return (
      <div className="flex gap-3 mb-6 last:mb-0">
        <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded border border-[#1e3a8a]/50 bg-[#0f1f3d]">
          <Sparkles className="size-3.5 text-[#3b82f6]" fill="currentColor" />
        </div>
        <div className="flex flex-col gap-2 max-w-[95%] min-w-0">
          <span className="text-[13px] font-semibold text-white">Genius <span className="font-normal text-muted-foreground">(Gemini 1.5 Pro)</span></span>
          <div className="rounded-xl rounded-tl-sm border border-[#1E2730] bg-[#141B21] px-4 py-3 inline-flex">
            <div className="flex items-center gap-1 py-1">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="size-1.5 rounded-full bg-muted-foreground animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (msg.role === "user") {
    return (
      <div className="flex gap-3 mb-6 last:mb-0">
        <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full border border-[#1E2730] bg-[#141B21]">
          <span className="text-[10px] font-bold text-white">AR</span>
        </div>
        <div className="flex flex-col gap-2 max-w-[88%] min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="text-[13px] font-semibold text-white">You</span>
            <span className="text-[9px] text-muted-foreground">{timestamp}</span>
          </div>
          <div className="rounded-xl rounded-tl-sm border border-[#1E2730] bg-[#141B21] px-4 py-3 text-[13px] text-white/90 leading-relaxed shadow-sm">
            {msg.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative flex gap-3 mb-6 last:mb-0">
      <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded border border-[#1e3a8a]/50 bg-[#0f1f3d]">
        <Sparkles className="size-3.5 text-[#3b82f6]" fill="currentColor" />
      </div>
      <div className="flex flex-col gap-3 max-w-[95%] min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-[13px] font-semibold text-white">Genius <span className="font-normal text-muted-foreground">(Gemini 1.5 Pro)</span></span>
          <span className="text-[9px] text-muted-foreground">{timestamp} · Gemini 1.5 Pro</span>
          <span className="flex items-center gap-1.5 text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 ml-1">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-1.5 animate-ping rounded-full bg-primary opacity-50" />
              <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
            </span>
            Using workspace data
          </span>
        </div>
        <div className="relative">
          <div className="text-[13px] leading-relaxed text-white/80">
            {msg.content}
          </div>
          <button
            type="button"
            onClick={() => { navigator.clipboard.writeText(msg.content); toast.success('Copied to clipboard'); }}
            className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-1 right-0 flex size-6 items-center justify-center rounded text-muted-foreground hover:text-white hover:bg-[#1E2730]"
          >
            <Copy className="size-3" />
          </button>
        </div>
        {msg.showTopChanges && <TopChangesTable onNavigate={onNavigate} />}
        {msg.citations?.length ? (
          <div className="rounded-xl border border-evidence/20 bg-evidence/5 p-3">
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-evidence">
              <FileText className="size-3.5" />
              Proof trail
            </div>
            <div className="flex flex-col gap-1.5">
              {msg.citations.map(c => <EvidenceLink key={c.label}>{c.label}</EvidenceLink>)}
            </div>
          </div>
        ) : null}
        {msg.nextAction && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1E2730] bg-[#141B21] p-3.5 mt-1">
            <div className="flex items-center gap-2.5 text-sm text-white min-w-0 flex-1">
              <ShieldCheck className="size-4 text-primary shrink-0" />
              <span className="truncate">{msg.nextAction}</span>
            </div>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 h-8 text-[11px]" onClick={() => onNavigate?.("approvals")}>
              Create approval
            </Button>
          </div>
        )}
        {msg.confidence && (
          <span className="text-[10px] text-muted-foreground">
            Answers grounded in verified evidence. Actions require human approval. · {msg.confidence}% confidence
          </span>
        )}
      </div>
    </div>
  );
}

// ── KPI Data ───────────────────────────────────────────────────────────────────
const chatKpis = [
  { label: "Money at risk", value: 287430, format: "currency", trend: "+18.6%", tone: "critical" },
  { label: "Evidence sources", value: 95, trend: "+7 new", tone: "evidence" },
  { label: "Open approvals", value: 8, hint: "3 urgent", tone: "warning" },
  { label: "AI confidence", value: 87, unit: "%", trend: "+5 pts", tone: "primary" },
  { label: "Data quality", value: 84, unit: "%", hint: "Good", tone: "primary" },
];

// ── Right Panel ────────────────────────────────────────────────────────────────
function RightPanel({ onNavigate }) {
  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto scrollbar-none pr-2 pb-8">
      {/* Evidence in context */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white">Evidence in context</span>
          <button type="button" className="text-[10px] text-evidence hover:text-evidence/70 transition-colors" onClick={() => onNavigate?.("data")}>View all →</button>
        </div>
        <p className="text-[11px] text-muted-foreground">12 sources</p>
        <div className="flex flex-col gap-1.5">
          {chatEvidenceContext.map(e => (
            <div key={e.name} className="flex items-center gap-2.5 rounded-lg border border-[#1E2730] bg-[#141B21] px-3 py-2 transition-colors hover:border-primary/30 cursor-pointer">
              <span className={cn("flex size-7 items-center justify-center rounded border text-[9px] font-bold shrink-0", 
                e.type === "PDF" ? "bg-critical/10 text-critical border-critical/20" :
                e.type === "XLSX" ? "bg-primary/10 text-primary border-primary/20" :
                "bg-evidence/10 text-evidence border-evidence/20"
              )}>{e.type}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate text-white" title={e.name}>{e.name}</p>
                <p className="text-[10px] text-muted-foreground">{e.type} · {e.date} · {e.size}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active agents */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white">Active agents</span>
          <button type="button" className="text-[10px] text-evidence hover:text-evidence/70 transition-colors" onClick={() => onNavigate?.("agents")}>View all →</button>
        </div>
        <div className="flex flex-col gap-1.5">
          {chatActiveAgents.map(a => (
            <div key={a.name} className="flex items-start gap-2.5 rounded-lg border border-[#1E2730] bg-[#141B21] px-3 py-2">
              <div className="mt-1"><StatusDot tone={a.status} /></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-white">{a.name}</span>
                  <span className={cn("text-[10px] font-medium", 
                    a.status === "Active" ? "text-primary" : a.status === "Waiting" ? "text-warning" : "text-critical"
                  )}>{a.status}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{a.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Open approvals */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white">Open approvals</span>
          <button type="button" className="text-[10px] text-evidence hover:text-evidence/70 transition-colors" onClick={() => onNavigate?.("approvals")}>8 View all →</button>
        </div>
        <div className="flex flex-col gap-1.5">
          {chatOpenApprovals.map((a, i) => (
            <div key={i} className="flex items-center justify-between gap-2 rounded-lg border border-[#1E2730] bg-[#141B21] px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{a.title}</p>
                {a.due && <p className="text-[10px] text-muted-foreground">{a.due}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <SeverityBadge level={a.priority === "Urgent" ? "Critical" : "High"} />
                <span className="text-[11px] font-bold tabular text-white">{a.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data quality */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white">Data quality</span>
          <span className="text-[10px] font-bold text-primary">Good (84%)</span>
        </div>
        <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-[#1E2730]">
          <div className="bg-primary" style={{ width: `${chatDataQuality.complete}%` }} />
          <div className="bg-evidence" style={{ width: `${chatDataQuality.partial}%` }} />
          <div className="bg-warning" style={{ width: `${chatDataQuality.missing}%` }} />
          <div className="bg-critical" style={{ width: `${chatDataQuality.invalid}%` }} />
        </div>
        <div className="mt-1 flex flex-col gap-1">
          {[
            { label: "Complete", pct: chatDataQuality.complete, color: "bg-primary" },
            { label: "Partial", pct: chatDataQuality.partial, color: "bg-evidence" },
            { label: "Missing", pct: chatDataQuality.missing, color: "bg-warning" },
            { label: "Invalid", pct: chatDataQuality.invalid, color: "bg-critical" },
          ].map(q => (
            <div key={q.label} className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className={cn("size-1.5 rounded-full", q.color)} />
                {q.label}
              </span>
              <span className="tabular font-medium text-white">{q.pct}%</span>
            </div>
          ))}
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground text-center">Last data sync: 2m ago</p>
      </div>
    </div>
  );
}

// ── Chat Context Menu ──────────────────────────────────────────────────────────
function ChatContextMenu({ chat, onClose, onRename, onDelete, onArchive }) {
  const [showRename, setShowRename] = useState(false);
  const [renameValue, setRenameValue] = useState(chat.title);

  return (
    <div className="absolute right-0 top-7 z-20 w-40 rounded-lg border border-[#1E2730] bg-[#0A0C0B] shadow-xl py-1 animate-scale-in">
      {showRename ? (
        <div className="p-2">
          <input
            autoFocus
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onBlur={() => { onRename(chat.id, renameValue); setShowRename(false); }}
            onKeyDown={e => { if (e.key === "Enter") { onRename(chat.id, renameValue); setShowRename(false); } }}
            className="w-full rounded border border-[#1E2730] bg-[#141B21] px-2 py-1 text-xs text-white outline-none focus:border-primary"
          />
        </div>
      ) : (
        <>
          <button type="button" onClick={() => setShowRename(true)} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-white hover:bg-[#141B21] transition-colors">
            <Pencil className="size-3.5 text-muted-foreground" /> Rename
          </button>
          <button type="button" onClick={() => { onArchive(chat.id); onClose(); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-white hover:bg-[#141B21] transition-colors">
            <Archive className="size-3.5 text-muted-foreground" /> Archive
          </button>
          <button type="button" onClick={() => { onDelete(chat.id); onClose(); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-critical hover:bg-critical/10 transition-colors">
            <Trash2 className="size-3.5" /> Delete
          </button>
        </>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AiChat({ onNavigate }) {
  const [messages, setMessages] = useState(chatSeed);
  const [input, setInput] = useState("");
  const [chatHistoryState, setChatHistoryState] = useState(initialChatHistory);
  const [activeChat, setActiveChat] = useState(initialChatHistory?.[0]?.id ?? "default-chat");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const scrollRef = useRef(null);

  function send() {
    const text = input.trim();
    if (!text) return;
    const now = new Date().toISOString();
    setMessages(prev => [
      ...prev,
      { role: "user", content: text, timestamp: now },
      { id: 'thinking', role: 'assistant', content: '...', isThinking: true },
    ]);
    setInput("");
    requestAnimationFrame(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; });
    setTimeout(() => {
      setMessages(prev => {
        const withoutThinking = prev.filter(m => m.id !== 'thinking');
        return [...withoutThinking, { ...cannedReply, timestamp: new Date().toISOString() }];
      });
      requestAnimationFrame(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; });
    }, 1500);
  }

  function createNewChat() {
    const newId = `ch-new-${Date.now()}`;
    const newChat = { id: newId, title: "New conversation", updated: "Just now", pinned: false };
    setChatHistoryState(prev => [newChat, ...prev]);
    setActiveChat(newId);
    setMessages([]);
    toast.success("New chat created");
  }

  function renameChat(id, newTitle) {
    if (!newTitle.trim()) return;
    setChatHistoryState(prev => prev.map(c => c.id === id ? { ...c, title: newTitle.trim() } : c));
    toast.success("Chat renamed");
  }

  function deleteChat(id) {
    setChatHistoryState(prev => prev.filter(c => c.id !== id));
    if (activeChat === id) {
      const remaining = chatHistoryState.filter(c => c.id !== id);
      setActiveChat(remaining[0]?.id || null);
      setMessages([]);
    }
    toast.success("Chat deleted");
  }

  function archiveChat(id) {
    setChatHistoryState(prev => prev.map(c => c.id === id ? { ...c, archived: true } : c));
    if (activeChat === id) {
      const remaining = chatHistoryState.filter(c => c.id !== id && !c.archived);
      setActiveChat(remaining[0]?.id || null);
      setMessages([]);
    }
    toast.success("Chat archived");
  }

  function selectChat(id, chatTitle) {
    setActiveChat(id);
    setMenuOpenId(null);
    // Load pinned thread data if available, otherwise fall back to default seed
    const threadKey = Object.keys(pinnedThreads).find(k => chatTitle?.toLowerCase().includes(k.toLowerCase()));
    setMessages(threadKey ? pinnedThreads[threadKey] : chatSeed);
  }

  const visibleChats = chatHistoryState.filter(c => !c.archived);
  const pinned = visibleChats.filter(c => c.pinned);
  const today = visibleChats.filter(c => !c.pinned && (c.updated.includes("AM") || c.updated.includes("PM") || c.updated.includes("Just now")));
  const yesterday = visibleChats.filter(c => !c.pinned && c.updated.includes("May 25"));
  const older = visibleChats.filter(c => !c.pinned && c.updated.includes("May 24"));

  return (
    <SectionLoader delay={500}>
      <div className="flex flex-col gap-6 animate-fade-in">
        {/* KPI strip */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {chatKpis.map((k, i) => <MetricCard key={k.label} {...k} index={i} />)}
        </div>

        {/* Main 3-column layout */}
        <div className="grid gap-8 lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_300px]">
          {/* Left: Chat history */}
          <div className="hidden lg:flex flex-col h-[calc(100vh-200px)] min-h-[600px]">
            <div className="flex items-center justify-between pb-4">
              <span className="text-[13px] font-semibold text-white">Chat history</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={createNewChat} className="flex items-center gap-1.5 rounded border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary hover:bg-primary/20 transition-colors">
                  <Plus className="size-3" /> New chat
                </button>
                <button type="button" className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-[#141B21] hover:text-white transition-colors border border-[#1E2730]">
                  <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                </button>
              </div>
            </div>
            
            <div className="pb-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <input
                  placeholder="Search conversations..."
                  className="w-full rounded bg-transparent pl-8 pr-3 py-1.5 text-xs text-white outline-none placeholder-muted-foreground border-b border-[#1E2730] focus:border-primary/50 transition-colors"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-none py-2 pr-2">
              {[
                { label: "PINNED", items: pinned },
                { label: "TODAY", items: today },
                { label: "YESTERDAY", items: yesterday },
                { label: "OLDER", items: older },
              ].map(group => group.items.length > 0 && (
                <div key={group.label} className="mb-4 last:mb-0">
                  <span className="block px-2 pb-1.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">{group.label}</span>
                  <ul className="flex flex-col gap-0.5">
                    {group.items.map(c => (
                      <li key={c.id} className="group relative">
                        <button
                          type="button"
                          onClick={() => selectChat(c.id, c.title)}
                          className={cn("flex w-full items-center justify-between rounded-lg px-2 py-2 text-left transition-colors",
                            activeChat === c.id ? "bg-[#141B21] text-white" : "text-muted-foreground hover:bg-[#141B21]/50 hover:text-white"
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            {c.pinned ? <Pin className="size-3.5 shrink-0" /> : <MessageSquare className="size-3.5 shrink-0" />}
                            <span className="truncate text-[11.5px] font-medium" title={c.title}>{c.title}</span>
                          </div>
                          <span className={cn("text-[9px] opacity-70 shrink-0 tabular-nums transition-opacity", menuOpenId === c.id ? "opacity-0" : "group-hover:opacity-0")}>{c.updated}</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === c.id ? null : c.id); }}
                          className={cn("absolute right-2 top-1.5 mt-[2px] flex size-5 items-center justify-center rounded transition-all",
                            menuOpenId === c.id ? "opacity-100 text-white bg-[#1E2730]" : "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-white hover:bg-[#1E2730]"
                          )}
                        >
                          <MoreVertical className="size-3" />
                        </button>
                        {menuOpenId === c.id && (
                          <ChatContextMenu
                            chat={c}
                            onClose={() => setMenuOpenId(null)}
                            onRename={renameChat}
                            onDelete={deleteChat}
                            onArchive={archiveChat}
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-[#1E2730]">
              <button type="button" className="text-[11px] font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5" onClick={() => onNavigate("chat")}>
                View all conversations <ArrowUpRight className="size-3" />
              </button>
            </div>
          </div>

          {/* Center: Chat */}
          <div className="flex flex-col h-[calc(100vh-200px)] min-h-[600px]">
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-4">
              <div className="flex flex-col">
                {messages.map((msg, i) => (
                  <Message key={i} msg={msg} onNavigate={onNavigate} />
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  "Show me more detail",
                  "What is the total at risk?",
                  "Which findings need approval?",
                  "Build a board-ready summary",
                ].map(pill => (
                  <button key={pill} type="button" className="rounded-full border border-[#1E2730] bg-[#141B21] px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:border-primary/50 hover:bg-[#1E2730]">
                    {pill}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="bg-[#0A0C0B] p-4 shrink-0 border-t border-[#1E2730]">
              <div className="flex flex-col gap-2 rounded-xl border border-[#1E2730] bg-[#141B21] p-3 focus-within:border-primary/50 transition-colors shadow-sm">
                <Textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask anything about your business data..."
                  rows={2}
                  className="min-h-0 resize-none border-0 bg-transparent p-1 text-[13px] text-white placeholder-muted-foreground outline-none ring-0 focus-visible:ring-0"
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && !(e.keyCode === 229)) {
                      e.preventDefault();
                      send();
                    }
                  }}
                />
                <div className="flex items-center justify-between pt-2 border-t border-[#1E2730] mt-2">
                  <div className="flex items-center gap-3 pl-1">
                    <button type="button" className="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-[#1E2730] hover:text-white">
                      <Paperclip className="size-3.5" />
                    </button>
                    <div className="flex gap-3">
                      {["Upload", "URL", "Excel / CSV", "Screenshot"].map(a => (
                        <button key={a} type="button" className="text-[10px] text-muted-foreground transition-colors hover:text-white">
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground mr-1">
                      <Sparkles className="size-3 text-[#3b82f6]" fill="currentColor" /> Gemini 1.5 Pro <ChevronDown className="size-3" />
                    </div>
                    <button type="button" className="flex size-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-[#1E2730] hover:text-white">
                      <Mic className="size-3.5" />
                    </button>
                    <Button
                      size="sm"
                      onClick={send}
                      disabled={!input.trim()}
                      className={cn("h-7 px-3 rounded-md text-[11px] font-semibold transition-colors", 
                        input.trim() ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <ArrowUp className="size-3 mr-1" /> Send
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-center px-1">
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <ShieldCheck className="size-3.5 text-primary" />
                  Answers are grounded in verified evidence. Actions require human approval.
                </span>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="hidden xl:flex flex-col h-[calc(100vh-200px)] min-h-[600px]">
            <RightPanel onNavigate={onNavigate} />
          </div>
        </div>
      </div>
    </SectionLoader>
  );
}
