"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  Plus,
  MessageSquare,
  FileText,
  LineChart,
  Hexagon,
  CreditCard,
  Truck,
  FileSignature,
  PackageX
} from "lucide-react";

export const DEFAULT_ACTIVE_CHANNEL_ID = "inv-2025-0519";

const filterOptions = [
  { id: "All", label: "All" },
  { id: "Unread", label: "Unread" },
  { id: "Mentions", label: "Mentions" },
  { id: "Favorites", label: "Favorites" },
];

const pinnedDiscussions = [
  {
    id: "inv-2025-0519",
    label: "INV-2025-0519 Discrepancy",
    sub: "Farm Fresh Co.",
    time: "9:23 AM",
    unread: 0,
    alert: true,
    mentioned: true,
    favorite: true,
    pinned: true,
    icon: FileText,
    color: "text-critical",
    bg: "bg-critical/10",
  },
  {
    id: "q2-pricing",
    label: "Q2 Pricing Review",
    sub: "GreenLeaf Suppliers",
    time: "Yesterday",
    unread: 0,
    alert: false,
    mentioned: false,
    favorite: true,
    pinned: true,
    icon: LineChart,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
];

const activeDiscussions = [
  {
    id: "inv-2025-0518",
    label: "INV-2025-0518 Discrepancy",
    sub: "Farm Fresh Co.",
    time: "9:23 AM",
    unread: 4,
    alert: false,
    mentioned: false,
    favorite: false,
    icon: Hexagon,
    color: "text-[#4EA1FF]",
    bg: "bg-[#4EA1FF]/10",
  },
  {
    id: "monthly-recon",
    label: "Monthly Reconciliation",
    sub: "Boxed Goods Inc.",
    time: "Yesterday",
    unread: 2,
    alert: false,
    mentioned: true,
    favorite: false,
    icon: FileSignature,
    color: "text-[#4EA1FF]",
    bg: "bg-[#4EA1FF]/10",
  },
  {
    id: "po-2025-1943",
    label: "PO-2025-1943 Clarification",
    sub: "LogiTrack Ltd.",
    time: "May 20",
    unread: 0,
    alert: false,
    mentioned: false,
    favorite: false,
    icon: Truck,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    id: "payment-terms",
    label: "Payment Terms Update",
    sub: "Global Produce",
    time: "May 19",
    unread: 0,
    alert: false,
    mentioned: false,
    favorite: false,
    icon: CreditCard,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    id: "quality-issue",
    label: "Quality Issue - Batch #442",
    sub: "Fresh Harvest",
    time: "May 18",
    unread: 3,
    alert: false,
    mentioned: true,
    favorite: false,
    icon: PackageX,
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    id: "contract-renewal",
    label: "Contract Renewal",
    sub: "Northfield Farms",
    time: "May 18",
    unread: 0,
    alert: false,
    mentioned: false,
    favorite: true,
    icon: FileSignature,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    id: "shipping-delay",
    label: "Shipping Delay Update",
    sub: "TransCold Logistics",
    time: "May 17",
    unread: 0,
    alert: false,
    mentioned: false,
    favorite: false,
    icon: Truck,
    color: "text-[#4EA1FF]",
    bg: "bg-[#4EA1FF]/10",
  },
];

const archivedDiscussions = [
  {
    id: "arch-credit-note-q1",
    label: "Q1 Credit Note Closure",
    sub: "Farm Fresh Co.",
    time: "May 12",
    unread: 0,
    alert: false,
    mentioned: false,
    favorite: false,
    archived: true,
    icon: FileText,
    color: "text-muted-foreground",
    bg: "bg-[#141A22]",
  },
  {
    id: "arch-cold-chain",
    label: "Cold Chain Exception",
    sub: "TransCold Logistics",
    time: "May 9",
    unread: 0,
    alert: false,
    mentioned: true,
    favorite: false,
    archived: true,
    icon: Truck,
    color: "text-muted-foreground",
    bg: "bg-[#141A22]",
  },
  {
    id: "arch-renewal-2024",
    label: "2024 Contract Renewal",
    sub: "Northfield Farms",
    time: "Apr 28",
    unread: 0,
    alert: false,
    mentioned: false,
    favorite: true,
    archived: true,
    icon: FileSignature,
    color: "text-muted-foreground",
    bg: "bg-[#141A22]",
  },
];

function matchesFilter(discussion, filter) {
  if (filter === "Unread") return Number(discussion.unread) > 0;
  if (filter === "Mentions") return Boolean(discussion.mentioned);
  if (filter === "Favorites") return Boolean(discussion.favorite);
  return true;
}

function matchesSearch(discussion, query) {
  if (!query) return true;
  const haystack = [discussion.id, discussion.label, discussion.sub]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function DiscussionButton({ discussion, active, onSelect }) {
  const Icon = discussion.icon || MessageSquare;

  return (
    <button
      type="button"
      onClick={() => onSelect(discussion)}
      className={cn(
        "flex items-center px-5 py-3 text-xs font-medium transition-all w-full text-left relative",
        active
          ? "bg-[#141A22] text-white border-y border-[#28313C]"
          : "text-muted-foreground hover:bg-[#141A22]/50 hover:text-white border-y border-transparent"
      )}
    >
      {active && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4EA1FF] rounded-r-md"></div>
      )}
      <div className="flex items-center gap-3 w-full min-w-0">
        <div className={cn("flex size-8 items-center justify-center rounded-lg shrink-0", discussion.bg, discussion.color)}>
          <Icon className="size-4" />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className={cn("truncate font-bold", active || discussion.unread ? "text-white" : "text-foreground")}>
              {discussion.label}
            </span>
            <span className="text-[9px] text-muted-foreground shrink-0">{discussion.time}</span>
          </div>
          <div className="flex items-center justify-between mt-0.5 gap-2">
            <span className="text-[10px] text-muted-foreground truncate">{discussion.sub}</span>
            {discussion.local && (
              <span className="rounded border border-[#28313C] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[#7CC7FF]">
                Local
              </span>
            )}
            {discussion.unread > 0 && (
              <span className="bg-[#4EA1FF] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-[0_0_10px_rgba(78,161,255,0.5)]">
                {discussion.unread}
              </span>
            )}
            {discussion.alert && (
              <div className="size-1.5 rounded-full bg-critical shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export function ChannelList({
  collapsed,
  selectedDiscussionId = DEFAULT_ACTIVE_CHANNEL_ID,
  pinnedIds = [],
  unpinnedIds = [],
  archivedIds = [],
  restoredIds = [],
  deletedIds = [],
  archivedClearedAt = null,
  customDiscussions = [],
  onDiscussionSelect,
  onDiscussionCreate,
  onArchivedToggle,
  onClearArchived,
}) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const activeChannel = selectedDiscussionId || DEFAULT_ACTIVE_CHANNEL_ID;
  const pinnedSet = useMemo(() => new Set(pinnedIds), [pinnedIds]);
  const unpinnedSet = useMemo(() => new Set(unpinnedIds), [unpinnedIds]);
  const archivedSet = useMemo(() => new Set(archivedIds), [archivedIds]);
  const restoredSet = useMemo(() => new Set(restoredIds), [restoredIds]);
  const deletedSet = useMemo(() => new Set(deletedIds), [deletedIds]);
  const customDiscussionRows = useMemo(() => (
    Array.isArray(customDiscussions) ? customDiscussions : []
  ), [customDiscussions]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const enrichedDiscussions = useMemo(() => {
    // Determine which archived discussions to include based on when we cleared them
    // The hardcoded archivedDiscussions don't have createdAt, but if archivedClearedAt is set, we assume they were cleared!
    const effectiveArchived = archivedClearedAt ? [] : archivedDiscussions;

    return [
      ...pinnedDiscussions,
      ...customDiscussionRows,
      ...activeDiscussions,
      ...effectiveArchived,
    ].filter((discussion) => !deletedSet.has(discussion.id))
     .map((discussion) => ({
      ...discussion,
      pinned: unpinnedSet.has(discussion.id) ? false : pinnedSet.has(discussion.id) ? true : discussion.pinned,
      favorite: unpinnedSet.has(discussion.id) ? false : pinnedSet.has(discussion.id) ? true : discussion.favorite,
      archived: restoredSet.has(discussion.id) ? false : archivedSet.has(discussion.id) ? true : discussion.archived,
      unread: activeChannel === discussion.id ? 0 : discussion.unread,
    }));
  }, [activeChannel, archivedSet, customDiscussionRows, pinnedSet, restoredSet, unpinnedSet, deletedSet, archivedClearedAt]);

  const archivedCount = useMemo(() => (
    enrichedDiscussions.filter((discussion) => discussion.archived).length
  ), [enrichedDiscussions]);

  const discussionScope = useMemo(() => (
    enrichedDiscussions.filter((discussion) => showArchived || !discussion.archived)
  ), [enrichedDiscussions, showArchived]);

  const filterCounts = useMemo(() => (
    filterOptions.reduce((counts, filter) => ({
      ...counts,
      [filter.id]: discussionScope.filter((discussion) => matchesFilter(discussion, filter.id)).length,
    }), {})
  ), [discussionScope]);

  const filteredDiscussions = useMemo(() => (
    discussionScope.filter((discussion) => (
      matchesFilter(discussion, activeFilter) && matchesSearch(discussion, normalizedQuery)
    ))
  ), [activeFilter, discussionScope, normalizedQuery]);

  const filteredPinned = filteredDiscussions.filter((discussion) => discussion.pinned && !discussion.archived);
  const filteredActive = filteredDiscussions.filter((discussion) => !discussion.pinned && !discussion.archived);
  const filteredArchived = filteredDiscussions.filter((discussion) => discussion.archived);

  const handleSelectDiscussion = (discussion) => {
    onDiscussionSelect?.(discussion);
  };

  const handleCreateDiscussion = () => {
    const nextNumber = customDiscussionRows.length + 1;
    const discussion = {
      id: `local-discussion-${Date.now()}-${nextNumber}`,
      label: `New discussion ${nextNumber}`,
      sub: "Local draft",
      time: "Just now",
      unread: 0,
      alert: false,
      mentioned: false,
      favorite: false,
      local: true,
      icon: MessageSquare,
      color: "text-[#4EA1FF]",
      bg: "bg-[#4EA1FF]/10",
    };

    setActiveFilter("All");
    setSearchQuery("");
    onDiscussionCreate?.(discussion);
  };

  const handleArchivedToggle = () => {
    const nextVisible = !showArchived;

    setShowArchived(nextVisible);
    if (!nextVisible && enrichedDiscussions.some((discussion) => discussion.id === activeChannel && discussion.archived)) {
      onDiscussionSelect?.(pinnedDiscussions[0]);
    }
    onArchivedToggle?.(nextVisible, archivedCount);
  };

  if (collapsed) return null;

  return (
    <div className="w-[280px] shrink-0 border-r border-[#28313C] flex flex-col bg-[#080A0E] h-full overflow-hidden transition-all duration-300">
      
      {/* Header */}
      <div className="px-5 pt-6 pb-4 shrink-0">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Discussions</h2>
          <button
            type="button"
            onClick={handleCreateDiscussion}
            className="flex items-center gap-1 bg-primary hover:bg-[#4EA1FF] text-white px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors"
          >
            <Plus className="size-3" /> New
          </button>
        </div>
        
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search discussions..." 
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full bg-[#141A22] border border-[#28313C] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-muted-foreground focus:outline-none focus:border-[#4EA1FF] transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {filterOptions.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors whitespace-nowrap",
                activeFilter === filter.id ? "bg-[#4EA1FF] text-white" : "bg-[#141A22] border border-[#28313C] text-muted-foreground hover:text-white"
              )}
            >
              {filter.label}
              <span className={cn("px-1 rounded-md text-[9px]", activeFilter === filter.id ? "bg-white/20 text-white" : "bg-[#28313C] text-muted-foreground")}>
                {filterCounts[filter.id] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#28313C] scrollbar-track-transparent">
        
        {filteredPinned.length > 0 && (
          <div className="pt-2 pb-4">
            <div className="px-5 mb-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pinned</h3>
            </div>
            <div className="flex flex-col">
              {filteredPinned.map((discussion) => (
                <DiscussionButton
                  key={discussion.id}
                  discussion={discussion}
                  active={activeChannel === discussion.id}
                  onSelect={handleSelectDiscussion}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Discussions */}
        <div className="pb-6">
          {filteredActive.length > 0 && (
            <>
              <div className="px-5 mb-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">All Discussions</h3>
              </div>
              <div className="flex flex-col">
                {filteredActive.map((discussion) => (
                  <DiscussionButton
                    key={discussion.id}
                    discussion={discussion}
                    active={activeChannel === discussion.id}
                    onSelect={handleSelectDiscussion}
                  />
                ))}
              </div>
            </>
          )}

          {showArchived && filteredArchived.length > 0 && (
            <div className="mt-6">
              <div className="px-5 mb-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Archived</h3>
              </div>
              <div className="flex flex-col">
                {filteredArchived.map((discussion) => (
                  <DiscussionButton
                    key={discussion.id}
                    discussion={discussion}
                    active={activeChannel === discussion.id}
                    onSelect={handleSelectDiscussion}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredDiscussions.length === 0 && (
            <div className="mx-5 rounded-lg border border-[#28313C] bg-[#0E1116] px-4 py-5 text-center">
              <MessageSquare className="mx-auto mb-2 size-4 text-muted-foreground" />
              <p className="text-[11px] font-semibold text-white">No discussions found</p>
              <p className="mt-1 text-[10px] text-muted-foreground">Adjust search or filters to widen the list.</p>
            </div>
          )}

          <div className="mt-6 mx-5 text-center flex flex-col gap-3">
            <button
              type="button"
              aria-pressed={showArchived}
              onClick={handleArchivedToggle}
              className="text-[11px] font-semibold text-[#4EA1FF] hover:text-[#7CC7FF] transition-colors"
            >
              {showArchived ? "Hide archived" : "View archived"} ({archivedCount})
            </button>
            {archivedCount > 0 && showArchived && (
              <button
                type="button"
                onClick={onClearArchived}
                className="text-[11px] font-semibold text-critical hover:text-critical/80 transition-colors bg-critical/10 py-1.5 px-3 rounded inline-flex items-center justify-center self-center"
              >
                Clear Archived
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
