"use client";

import { cn } from "@/lib/utils";
import { Plus, Search, Pin, MessageSquare, Archive, MoreVertical, Pencil, Trash2, ShieldCheck, Share2, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { NewWorkbenchDialog } from "./drawers/new-workbench-dialog";

function formatRelativeTime(value) {
  if (!value) return "New";
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "New";

  const diffMs = Date.now() - timestamp;
  const minutes = Math.max(0, Math.floor(diffMs / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(value).toLocaleDateString();
}

function runLabel(run = {}) {
  return run.title || run.agentName || run.agentId || "Agent run";
}

function runStatus(run = {}) {
  return String(run.status || "waiting").toLowerCase();
}

export function WorkbenchSidebar({
  activeId,
  onSelect,
  onNew,
  conversations = [],
  agentRuns = [],
  reports = [],
  busy = false,
  onRename,
  onArchive,
  onDelete,
  onTogglePin,
  onNewChat,
}) {
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [query, setQuery] = useState("");
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);

  const groups = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    const matchesQuery = (item) => !cleanQuery || item.title.toLowerCase().includes(cleanQuery);
    const chatItems = conversations
      .map((conversation) => {
        const isRegularChat = Array.isArray(conversation.tags) && conversation.tags.includes("Regular Chat");
        return {
          conversation,
          id: conversation.id,
          title: conversation.title || "New workspace chat",
          time: formatRelativeTime(conversation.updatedAt || conversation.createdAt),
          type: isRegularChat ? "regular-chat" : "chat",
          status: conversation.status || "active",
          pinned: Boolean(conversation.pinned),
        };
      })
      .filter(matchesQuery);
    const runItems = agentRuns.slice(0, 5).map((run) => ({
      id: run.id || run.runId || runLabel(run),
      title: runLabel(run),
      time: run.status || "Waiting",
      type: "agent",
      status: runStatus(run),
    })).filter(matchesQuery);
    const reportItems = reports.slice(0, 5).map((report) => ({
      id: report.id || report.title,
      title: report.title || "Workspace report",
      time: report.status || "Ready",
      type: "shared",
      status: report.status || "Ready",
    })).filter(matchesQuery);

    return [
      { label: "PINNED", items: chatItems.filter((item) => item.status !== "archived" && item.pinned) },
      { label: "RECENT", items: chatItems.filter((item) => item.status !== "archived" && !item.pinned) },
      { label: "AGENT RUNS", items: runItems },
      { label: "SHARED", items: reportItems },
      { label: "ARCHIVED", items: chatItems.filter((item) => item.status === "archived") },
    ].filter((group) => group.items.length);
  }, [agentRuns, conversations, query, reports]);

  const getStatusColor = (status) => {
    if (status === "running") return "text-[#4EA1FF] border-[#4EA1FF]/30 bg-[#4EA1FF]/10";
    if (status === "completed" || status === "ready") return "text-primary border-primary/30 bg-primary/10";
    if (status === "failed" || status === "error") return "text-critical border-critical/30 bg-critical/10";
    return "text-warning border-warning/30 bg-warning/10";
  };

  return (
    <aside className="w-[260px] shrink-0 border-r border-[#28313C] bg-[#0E1116] flex flex-col h-full overflow-hidden animate-slide-in">
      <div className="p-4 shrink-0 flex flex-col gap-4">
        <div className="flex items-center gap-2 w-full">
          <button
            type="button"
            onClick={() => setIsNewDialogOpen(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[#4EA1FF] px-3 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-[#4EA1FF] shadow-sm whitespace-nowrap"
          >
            <Plus className="size-3.5" /> Workbench
          </button>
          <button
            type="button"
            onClick={onNewChat}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[#141A22] border border-[#28313C] px-3 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-[#28313C] shadow-sm whitespace-nowrap"
          >
            <MessageSquare className="size-3.5" /> Chat
          </button>
        </div>

        <div className="relative flex items-center">
          <Search className="absolute left-3 size-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search conversations..."
            className="w-full rounded-md border border-[#28313C] bg-[#141A22] py-1.5 pl-8 pr-3 text-xs text-white outline-none transition-colors focus:border-[#4EA1FF]/50 placeholder-muted-foreground"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-4">
        {groups.length === 0 && (
          <div className="mx-3 mt-6 rounded-lg border border-dashed border-[#28313C] bg-[#141A22]/40 p-4 text-center">
            <MessageSquare className="mx-auto mb-2 size-5 text-muted-foreground" />
            <p className="text-xs font-medium text-white">No conversations yet</p>
            <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">Ask GENIUS a workspace question to create the first saved chat.</p>
          </div>
        )}

        {groups.map((group) => (
          <div key={group.label} className="mb-5 last:mb-0">
            <span className="block px-3 mb-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/80">
              {group.label}
            </span>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const isActive = activeId === item.id;
                const isChat = item.type === "chat" || item.type === "regular-chat";
                return (
                  <li key={`${group.label}-${item.id}`} className="relative group">
                    <button
                      type="button"
                      onClick={() => isChat && onSelect(item.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors",
                        isActive
                          ? "bg-[#28313C]/70 text-white"
                          : "text-muted-foreground hover:bg-[#141A22] hover:text-white",
                        !isChat && "cursor-default",
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                        {item.type === "agent" ? (
                          <ShieldCheck className={cn("size-3.5 shrink-0", getStatusColor(item.status).split(" ")[0])} />
                        ) : item.type === "shared" ? (
                          <Share2 className="size-3.5 shrink-0" />
                        ) : item.status === "archived" ? (
                          <Archive className="size-3.5 shrink-0" />
                        ) : item.pinned ? (
                          <Pin className="size-3.5 shrink-0 text-[#ef4444]" />
                        ) : item.type === "chat" ? (
                          <svg className="size-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        ) : (
                          <MessageSquare className="size-3.5 shrink-0" />
                        )}
                        <span className={cn("truncate text-[11.5px]", isActive ? "font-semibold" : "font-medium")}>{item.title}</span>
                      </div>

                      {item.type === "agent" ? (
                        <span className={cn("text-[9px] font-bold border px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 tabular-nums transition-opacity", getStatusColor(item.status), menuOpenId === item.id ? "opacity-0" : "group-hover:opacity-0")}>
                          {item.time}
                        </span>
                      ) : (
                        <span className={cn("text-[10px] opacity-70 shrink-0 transition-opacity tabular-nums whitespace-nowrap", menuOpenId === item.id ? "opacity-0" : "group-hover:opacity-0")}>
                          {item.time}
                        </span>
                      )}
                    </button>

                    {isChat && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={(event) => {
                          event.stopPropagation();
                          setMenuOpenId(menuOpenId === item.id ? null : item.id);
                        }}
                        className={cn(
                          "absolute right-2 top-1.5 mt-[2px] flex size-5 items-center justify-center rounded transition-all disabled:cursor-not-allowed disabled:opacity-40",
                          menuOpenId === item.id ? "opacity-100 text-white bg-[#28313C]" : "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-white hover:bg-[#28313C]",
                        )}
                      >
                        <MoreVertical className="size-3.5" />
                      </button>
                    )}

                    {isChat && menuOpenId === item.id && (
                      <div className="absolute right-0 top-8 z-20 w-44 rounded-lg border border-[#28313C] bg-[#0E1116] shadow-2xl py-1 animate-scale-in">
                        <button type="button" onClick={() => { setMenuOpenId(null); onRename?.(item.conversation || item); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-white hover:bg-[#141A22] transition-colors">
                          <Pencil className="size-3.5 text-muted-foreground" /> Rename
                        </button>
                        <button type="button" onClick={() => { setMenuOpenId(null); onTogglePin?.(item.conversation || item); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-white hover:bg-[#141A22] transition-colors">
                          <Pin className="size-3.5 text-muted-foreground" /> {item.pinned ? "Unpin" : "Pin"}
                        </button>
                        <button type="button" onClick={() => { setMenuOpenId(null); onArchive?.(item.conversation || item); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-white hover:bg-[#141A22] transition-colors">
                          {item.status === "archived" ? <RotateCcw className="size-3.5 text-muted-foreground" /> : <Archive className="size-3.5 text-muted-foreground" />}
                          {item.status === "archived" ? "Restore" : "Archive"}
                        </button>
                        <button type="button" onClick={() => { setMenuOpenId(null); onDelete?.(item.conversation || item); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-critical hover:bg-critical/10 transition-colors">
                          <Trash2 className="size-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="h-4" />

      <NewWorkbenchDialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen} onCreate={onNew} />
    </aside>
  );
}
