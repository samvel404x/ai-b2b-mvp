"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useWorkspace } from "../workspace-context";

import { ChannelList, DEFAULT_ACTIVE_CHANNEL_ID } from "./b2b-bridge/channel-list";
import { ConversationHeader } from "./b2b-bridge/conversation-header";
import { MessageList } from "./b2b-bridge/message-list";
import { MessageComposer } from "./b2b-bridge/message-composer";
import { ContextPanel } from "./b2b-bridge/context-panel";

function workflowToast(status) {
  if (status === "Approved") return "Terms approved and Finance workflow unlocked";
  if (status === "Rejected") return "Workflow rejected and recorded in the audit trail";
  return "Workflow moved back to pending approval";
}

const PRIMARY_DISCUSSION = {
  id: DEFAULT_ACTIVE_CHANNEL_ID,
  label: "INV-2025-0519 Discrepancy",
  sub: "Farm Fresh Co.",
  pinned: true,
};

const FALLBACK_DISCUSSIONS = [
  PRIMARY_DISCUSSION,
  { id: "q2-pricing", label: "Q2 Pricing Review", sub: "GreenLeaf Suppliers", pinned: true },
  { id: "inv-2025-0518", label: "INV-2025-0518 Discrepancy", sub: "Farm Fresh Co." },
  { id: "monthly-recon", label: "Monthly Reconciliation", sub: "Boxed Goods Inc." },
  { id: "po-2025-1943", label: "PO-2025-1943 Clarification", sub: "LogiTrack Ltd." },
];

function pickNextDiscussion(deletedIds = [], currentId = "") {
  const deletedSet = new Set(deletedIds);
  return FALLBACK_DISCUSSIONS.find((discussion) => discussion.id !== currentId && !deletedSet.has(discussion.id)) || null;
}

function buildLocalThreadMessages(discussion = PRIMARY_DISCUSSION) {
  const label = discussion?.label || "Selected discussion";
  const company = discussion?.sub || "Counterparty";

  return [
    {
      id: `${discussion?.id || "local"}-seed-system`,
      sender: "SYSTEM BOT",
      role: "SYSTEM BOT",
      time: "Current session",
      createdAt: "2026-05-20T09:15:00.000Z",
      text: `${label} opened as a workspace-scoped channel for ${company}. Messages and decisions are saved in this workspace; external partner delivery remains locked until partner access is connected.`,
      isSelf: false,
      isSystem: true,
      isAction: true,
      status: "SESSION",
      statusColor: "text-[#7CC7FF]",
    },
    {
      id: `${discussion?.id || "local"}-seed-note`,
      sender: "Smart Assist",
      role: "System Action",
      time: "Current session",
      createdAt: "2026-05-20T09:17:00.000Z",
      text: `Suggested next step: confirm owner, attach evidence, and record an approval decision for ${label}.`,
      isSelf: false,
      isInternal: true,
      status: "Suggested",
      statusColor: "text-warning",
    },
  ];
}

export default function B2bBridge({ onNavigate }) {
  const { operations, sendB2bMessage, updateB2bWorkflowStatus, updateB2bDiscussion, busy, can } = useWorkspace();
  const canSendB2bMessage = can("send_b2b_message");
  const canApproveWorkflow = can("approve_b2b_workflow");
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [workflowAction, setWorkflowAction] = useState(null);
  const [selectedDiscussion, setSelectedDiscussion] = useState(PRIMARY_DISCUSSION);

  const b2bThread = operations?.b2bThread || null;
  const persistedDiscussions = useMemo(() => (
    Array.isArray(b2bThread?.discussions) ? b2bThread.discussions : []
  ), [b2bThread]);
  const persistedDiscussionById = useMemo(() => (
    new Map(persistedDiscussions.map((discussion) => [discussion.id, discussion]))
  ), [persistedDiscussions]);
  const customDiscussions = useMemo(() => (
    persistedDiscussions.filter((discussion) => discussion.local)
  ), [persistedDiscussions]);
  const pinnedDiscussionIds = useMemo(() => (
    persistedDiscussions.filter((discussion) => discussion.pinned).map((discussion) => discussion.id)
  ), [persistedDiscussions]);
  const unpinnedDiscussionIds = useMemo(() => (
    persistedDiscussions.filter((discussion) => discussion.pinned === false).map((discussion) => discussion.id)
  ), [persistedDiscussions]);
  const archivedDiscussionIds = useMemo(() => (
    persistedDiscussions.filter((discussion) => discussion.archived).map((discussion) => discussion.id)
  ), [persistedDiscussions]);
  const restoredDiscussionIds = useMemo(() => (
    persistedDiscussions.filter((discussion) => discussion.archived === false).map((discussion) => discussion.id)
  ), [persistedDiscussions]);
  const deletedDiscussionIds = useMemo(() => (
    persistedDiscussions.filter((discussion) => discussion.deleted).map((discussion) => discussion.id)
  ), [persistedDiscussions]);
  const archivedClearedAt = b2bThread?.archivedClearedAt || null;
  const rawMessages = useMemo(() => (
    Array.isArray(b2bThread?.messages) ? b2bThread.messages : []
  ), [b2bThread]);
  const discussionThreads = useMemo(() => (
    Array.isArray(b2bThread?.discussionThreads) ? b2bThread.discussionThreads : []
  ), [b2bThread]);
  const currentWorkflowStatus = b2bThread?.workflowStatus || "Pending Approval";
  const requestedDiscussionId = selectedDiscussion?.id || DEFAULT_ACTIVE_CHANNEL_ID;
  const requestedPersistedDiscussion = persistedDiscussionById.get(requestedDiscussionId);
  const requestedDiscussionDeleted = deletedDiscussionIds.includes(requestedDiscussionId) || Boolean(requestedPersistedDiscussion?.deleted);
  const effectiveSelectedDiscussion = requestedDiscussionDeleted
    ? pickNextDiscussion(deletedDiscussionIds, requestedDiscussionId) || selectedDiscussion || PRIMARY_DISCUSSION
    : selectedDiscussion;
  const selectedDiscussionId = effectiveSelectedDiscussion?.id || DEFAULT_ACTIVE_CHANNEL_ID;
  const selectedPersistedDiscussion = persistedDiscussionById.get(selectedDiscussionId);
  const selectedDiscussionThread = useMemo(() => (
    discussionThreads.find((threadItem) => threadItem.discussionId === selectedDiscussionId) || null
  ), [discussionThreads, selectedDiscussionId]);
  const isPrimaryDiscussion = selectedDiscussionId === DEFAULT_ACTIVE_CHANNEL_ID;
  const selectedDiscussionPinned = !unpinnedDiscussionIds.includes(selectedDiscussionId)
    && (pinnedDiscussionIds.includes(selectedDiscussionId) || Boolean(selectedDiscussion?.pinned));
  const selectedDiscussionArchived = !restoredDiscussionIds.includes(selectedDiscussionId)
    && (archivedDiscussionIds.includes(selectedDiscussionId) || Boolean(selectedDiscussion?.archived));
  const selectedDiscussionDeleted = deletedDiscussionIds.includes(selectedDiscussionId) || Boolean(selectedPersistedDiscussion?.deleted);
  const selectedDiscussionSnapshot = useMemo(() => ({
    ...(effectiveSelectedDiscussion || PRIMARY_DISCUSSION),
    ...(selectedPersistedDiscussion || {}),
    pinned: selectedDiscussionPinned,
    archived: selectedDiscussionArchived,
    deleted: selectedDiscussionDeleted,
  }), [effectiveSelectedDiscussion, selectedPersistedDiscussion, selectedDiscussionArchived, selectedDiscussionDeleted, selectedDiscussionPinned]);
  const effectiveWorkflowStatus = isPrimaryDiscussion
    ? currentWorkflowStatus
    : selectedDiscussionThread?.workflowStatus || "Pending Approval";
  const selectedBaseMessages = useMemo(() => {
    if (isPrimaryDiscussion) return rawMessages;
    const persistedMessages = Array.isArray(selectedDiscussionThread?.messages) ? selectedDiscussionThread.messages : [];
    return [
      ...buildLocalThreadMessages(selectedDiscussionSnapshot),
      ...persistedMessages,
    ];
  }, [isPrimaryDiscussion, rawMessages, selectedDiscussionSnapshot, selectedDiscussionThread]);
  const thread = useMemo(() => ({
    ...(b2bThread || {}),
    id: selectedDiscussionId,
    discussion: selectedDiscussionSnapshot,
    workflowStatus: effectiveWorkflowStatus,
    messages: selectedBaseMessages,
    updatedAt: isPrimaryDiscussion ? b2bThread?.updatedAt : selectedBaseMessages[selectedBaseMessages.length - 1]?.createdAt,
  }), [b2bThread, effectiveWorkflowStatus, isPrimaryDiscussion, selectedBaseMessages, selectedDiscussionId, selectedDiscussionSnapshot]);

  const messages = useMemo(() => {
    const nextMessages = [...selectedBaseMessages];
    const approvalAlreadyRendered = isPrimaryDiscussion
      ? nextMessages.some((message) => message.text?.includes("Discrepancy resolved"))
      : nextMessages.some((message) => message.text?.includes("Workspace approval recorded"));

    if (effectiveWorkflowStatus === "Approved" && !approvalAlreadyRendered) {
      nextMessages.push({
        id: `system-approved-${selectedDiscussionId}`,
        sender: "SYSTEM BOT",
        role: "SYSTEM BOT",
        time: "Just now",
        createdAt: new Date().toISOString(),
        text: isPrimaryDiscussion
          ? "Credit note CN-2025-0712 received and matched to invoice INV-2025-0519.\nDiscrepancy resolved. Total adjustment: $413.50. This discussion is now closed."
          : `${selectedDiscussionSnapshot.label} approved for workspace review. External partner delivery remains locked until partner access is connected.`,
        isSystem: true,
        status: isPrimaryDiscussion ? "RESOLVED" : "APPROVED"
      });
    }

    return nextMessages;
  }, [effectiveWorkflowStatus, isPrimaryDiscussion, selectedBaseMessages, selectedDiscussionId, selectedDiscussionSnapshot.label]);

  const handleSendMessage = async (text, mode) => {
    if (!canSendB2bMessage) {
      toast.error("B2B messaging requires send B2B message permission.");
      return;
    }

    if (selectedDiscussionArchived) {
      toast.error("Archived channels are read-only until restored.");
      return;
    }

    try {
      await sendB2bMessage({
        text,
        sender: "You",
        role: "Alex Rivera",
        isSelf: mode === "external",
        isInternal: mode === "internal",
        status: mode === "internal" ? "Saved" : isPrimaryDiscussion ? "Delivered" : "Saved",
        statusColor: mode === "internal" ? "text-warning" : isPrimaryDiscussion ? "text-emerald-500" : "text-[#7CC7FF]",
        discussionId: isPrimaryDiscussion ? undefined : selectedDiscussionId,
      });
      toast.success(mode === "internal" ? "Internal note saved" : isPrimaryDiscussion ? "Encrypted message sent" : "Message saved in workspace channel");
    } catch (error) {
      toast.error(error.message || "Message could not be sent");
    }
  };

  const handleWorkflowStatusChange = async (status) => {
    if (!canApproveWorkflow) {
      toast.error("B2B workflow decisions require approval permission.");
      return;
    }

    setWorkflowAction(status);
    try {
      await updateB2bWorkflowStatus(status, isPrimaryDiscussion ? undefined : selectedDiscussionId);
      toast.success(workflowToast(status));
    } catch (error) {
      toast.error(error.message || "Could not update workflow");
    } finally {
      setWorkflowAction(null);
    }
  };

  const handleCreateFollowUp = async () => {
    if (!canSendB2bMessage) {
      toast.error("Creating follow-up notes requires send B2B message permission.");
      return;
    }

    try {
      await sendB2bMessage({
        text: isPrimaryDiscussion
          ? "Follow-up task logged: Finance should verify the credit note against INV-2025-0519 before closing the discrepancy."
          : `Follow-up task logged: verify owner, evidence, and next decision for ${selectedDiscussionSnapshot.label}.`,
        sender: "Smart Assist",
        role: "System Action",
        isSelf: false,
        isInternal: true,
        status: "Logged",
        statusColor: "text-warning",
        discussionId: isPrimaryDiscussion ? undefined : selectedDiscussionId,
      });
      toast.success("Follow-up note logged in the B2B thread");
    } catch (error) {
      toast.error(error.message || "Follow-up note could not be created");
    }
  };

  const handleViewEvidence = () => {
    onNavigate?.("data", {
      source: "b2b-thread",
      evidenceName: "INV-2025-0519",
    });
  };

  const handleAcknowledgeMessage = async (message, action) => {
    if (!canSendB2bMessage) {
      toast.error("Acknowledgements require send B2B message permission.");
      return;
    }

    try {
      await sendB2bMessage({
        text: `Internal acknowledgement recorded: ${action} for "${String(message?.text || "").slice(0, 120)}"`,
        sender: "You",
        role: "Alex Rivera",
        isSelf: false,
        isInternal: true,
        status: "Logged",
        statusColor: "text-warning",
        discussionId: isPrimaryDiscussion ? undefined : selectedDiscussionId,
      });
      toast.success("Acknowledgement recorded in the thread");
    } catch (error) {
      toast.error(error.message || "Acknowledgement could not be recorded");
    }
  };

  const handleExportTranscript = () => {
    try {
      const payload = {
        schema: "genius.b2b.transcript.v1",
        exportedAt: new Date().toISOString(),
        discussion: selectedDiscussionSnapshot,
        workflowStatus: effectiveWorkflowStatus,
        messages,
      };
      const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `genius-b2b-transcript-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Conversation transcript exported");
    } catch (error) {
      toast.error(error.message || "Conversation export failed");
    }
  };

  const handleDiscussionCreate = async (discussion) => {
    if (!canSendB2bMessage) {
      toast.error("Creating B2B discussions requires send B2B message permission.");
      return;
    }

    try {
      const savedDiscussion = await updateB2bDiscussion({
        ...discussion,
        action: "upsert",
        local: true,
        pinned: false,
        archived: false,
      });
      setSelectedDiscussion(savedDiscussion || discussion);
      toast.success(`${savedDiscussion?.label || discussion.label} saved to workspace`);
    } catch (error) {
      toast.error(error.message || "Discussion could not be saved");
    }
  };

  const handleArchivedToggle = (visible, count) => {
    toast.info(visible ? `Showing ${count} archived discussions` : "Archived discussions hidden");
  };

  const handleDiscussionSelect = (discussion) => {
    setSelectedDiscussion(discussion || PRIMARY_DISCUSSION);
    if (discussion?.archived) {
      toast.info("Archived discussion opened in local read-only view");
    }
  };

  const handlePinChannel = async () => {
    if (!canSendB2bMessage) {
      toast.error("Pinning channels requires send B2B message permission.");
      return;
    }

    const nextAction = selectedDiscussionPinned ? "unpin" : "pin";
    const nextPinned = nextAction === "pin";

    try {
      const savedDiscussion = await updateB2bDiscussion({
        ...selectedDiscussionSnapshot,
        action: nextAction,
        pinned: nextPinned,
        favorite: nextPinned,
      });
      setSelectedDiscussion(savedDiscussion || { ...selectedDiscussionSnapshot, pinned: nextPinned, favorite: nextPinned });
      toast.success(nextPinned ? "Channel pinned" : "Channel unpinned");
    } catch (error) {
      toast.error(error.message || "Channel pin state could not be saved");
    }
  };

  const handleArchiveChannel = async () => {
    if (!canSendB2bMessage) {
      toast.error("Archiving channels requires send B2B message permission.");
      return;
    }

    const nextAction = selectedDiscussionArchived ? "restore" : "archive";
    const nextArchived = nextAction === "archive";

    try {
      const savedDiscussion = await updateB2bDiscussion({
        ...selectedDiscussionSnapshot,
        action: nextAction,
        archived: nextArchived,
      });
      setSelectedDiscussion(savedDiscussion || { ...selectedDiscussionSnapshot, archived: nextArchived });
      toast.success(nextArchived ? "Channel archived" : "Channel restored");
    } catch (error) {
      toast.error(error.message || "Channel archive state could not be saved");
    }
  };

  const handleDeleteChannel = async () => {
    if (!canSendB2bMessage) {
      toast.error("Deleting channels requires send B2B message permission.");
      return;
    }

    try {
      const confirmed = window.confirm(`Delete "${selectedDiscussionSnapshot.label}"? This removes it from the discussion list for this workspace.`);
      if (!confirmed) return;

      await updateB2bDiscussion({
        ...selectedDiscussionSnapshot,
        action: "delete",
      });
      const fallback = pickNextDiscussion([...deletedDiscussionIds, selectedDiscussionId], selectedDiscussionId);
      if (fallback) setSelectedDiscussion(fallback);
      toast.success("Channel deleted");
    } catch (error) {
      toast.error(error.message || "Channel could not be deleted");
    }
  };

  const handleClearArchived = async () => {
    if (!canSendB2bMessage) {
      toast.error("Clearing archived channels requires send B2B message permission.");
      return;
    }

    try {
      await updateB2bDiscussion({
        action: "clear_archived",
      });
      toast.success("Archived channels cleared");
    } catch (error) {
      toast.error(error.message || "Archived channels could not be cleared");
    }
  };

  const handleInviteParticipants = async () => {
    if (!canSendB2bMessage) {
      toast.error("Inviting participants requires send B2B message permission.");
      return;
    }

    const inviteText = `Partner invite request logged for ${selectedDiscussionSnapshot.label}. Workspace admin should confirm counterparty identity before sending access.`;

    try {
      await sendB2bMessage({
        text: inviteText,
        sender: "Smart Assist",
        role: "System Action",
        isSelf: false,
        isInternal: true,
        status: "Invite queued",
        statusColor: "text-warning",
        discussionId: isPrimaryDiscussion ? undefined : selectedDiscussionId,
      });
      toast.success("Partner invite request logged for workspace admins");
    } catch (error) {
      toast.error(error.message || "Invite request could not be logged");
    }
  };

  const handleOpenChannelSettings = () => {
    onNavigate?.("settings", {
      source: "b2b-channel-settings",
      discussionId: selectedDiscussionId,
      discussionLabel: selectedDiscussionSnapshot.label,
    });
  };

  const handleComposerUtilityAction = (label) => {
    if (label === "Attachment upload") {
      onNavigate?.("data", {
        source: "b2b-attachment",
        discussionId: selectedDiscussionId,
        discussionLabel: selectedDiscussionSnapshot.label,
      });
      toast.info("Open Data Intake to attach or verify evidence for this discussion.");
      return;
    }

    toast.info(`${label} applied in the message composer.`);
  };

  return (
    <div className="flex h-full w-full bg-[#080A0E] overflow-hidden text-white font-sans">
      {/* 1. Left Channel Navigation */}
      <ChannelList
        collapsed={leftCollapsed}
        selectedDiscussionId={selectedDiscussionId}
        pinnedIds={pinnedDiscussionIds}
        unpinnedIds={unpinnedDiscussionIds}
        archivedIds={archivedDiscussionIds}
        restoredIds={restoredDiscussionIds}
        deletedIds={deletedDiscussionIds}
        archivedClearedAt={archivedClearedAt}
        customDiscussions={customDiscussions}
        onCollapse={() => setLeftCollapsed(true)}
        onDiscussionCreate={handleDiscussionCreate}
        onArchivedToggle={handleArchivedToggle}
        onDiscussionSelect={handleDiscussionSelect}
        onClearArchived={handleClearArchived}
      />

      {/* 2. Main Workspace */}
      <div className="flex-1 flex flex-col bg-[#0E1116] relative min-w-0">
        <ConversationHeader
          status={effectiveWorkflowStatus}
          discussion={selectedDiscussionSnapshot}
          pinned={selectedDiscussionPinned}
          busy={busy || Boolean(workflowAction)}
          canApprove={canApproveWorkflow}
          onWorkflowStatusChange={handleWorkflowStatusChange}
          onExportTranscript={handleExportTranscript}
          onPinChannel={handlePinChannel}
          onInviteParticipants={handleInviteParticipants}
          onOpenChannelSettings={handleOpenChannelSettings}
          onArchiveChannel={handleArchiveChannel}
          onDeleteChannel={handleDeleteChannel}
          onNavigate={onNavigate}
        />

        <MessageList
          messages={messages}
          onViewEvidence={handleViewEvidence}
          onAcknowledge={handleAcknowledgeMessage}
        />

        <MessageComposer
          onSend={handleSendMessage}
          busy={busy}
          status={effectiveWorkflowStatus}
          canSend={canSendB2bMessage && !selectedDiscussionArchived && !selectedDiscussionDeleted}
          disabledReason={selectedDiscussionDeleted ? "This deleted channel is no longer writable." : selectedDiscussionArchived ? "This archived channel is read-only until restored." : undefined}
          onUtilityAction={handleComposerUtilityAction}
        />
      </div>

      {/* 3. Right Context Panel */}
      <ContextPanel
        collapsed={rightCollapsed}
        onCollapse={() => setRightCollapsed(true)}
        thread={thread}
        status={effectiveWorkflowStatus}
        busy={busy || Boolean(workflowAction)}
        canApprove={canApproveWorkflow}
        workflowAction={workflowAction}
        onWorkflowStatusChange={handleWorkflowStatusChange}
        onCreateFollowUp={handleCreateFollowUp}
        onExportTranscript={handleExportTranscript}
        onNavigate={onNavigate}
      />
    </div>
  );
}
