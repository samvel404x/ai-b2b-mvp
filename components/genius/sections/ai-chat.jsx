"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { WorkbenchSidebar } from "./workbench/workbench-sidebar";
import { WorkbenchCanvas } from "./workbench/workbench-canvas";
import { WorkbenchContextPanel } from "./workbench/workbench-context-panel";
import { WorkbenchComposer } from "./workbench/workbench-composer";
import { SectionLoader } from "../section-loader";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, PanelRight } from "lucide-react";
import { toast } from "sonner";
import { useWorkspace } from "../workspace-context";

function formatMessageTime(value) {
  if (!value) return "Just now";
  try {
    return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "Just now";
  }
}

function conversationMessages(conversation) {
  return (conversation?.messages || []).map((message) => ({
    id: message.id,
    role: message.role === "assistant" ? "assistant" : "user",
    content: message.content || "",
    provider: message.provider,
    time: formatMessageTime(message.createdAt),
  }));
}

function conversationExportName(conversation, format) {
  const slug = String(conversation?.title || "genius-chat")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "genius-chat";
  return `${slug}.${format === "json" ? "json" : "md"}`;
}

function downloadConversation(conversation, format = "markdown") {
  if (!conversation || typeof window === "undefined") return false;
  const content = format === "json"
    ? JSON.stringify(conversation, null, 2)
    : [
        `# ${conversation.title || "GENIUS Conversation"}`,
        "",
        `Exported: ${new Date().toISOString()}`,
        "",
        ...(conversation.messages || []).map((message) => [
          `## ${message.role === "assistant" ? "GENIUS" : "User"}`,
          "",
          message.content || "",
          "",
        ].join("\n")),
      ].join("\n");
  const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = conversationExportName(conversation, format);
  link.click();
  URL.revokeObjectURL(url);
  return true;
}

function shouldUseStructuredResponse(text) {
  return /analy[sz]e renewal|compare vendors|diagnose spend|microsoft ea|duplicate saas|renewal|vendor|spend|savings|contract/i.test(String(text || ""));
}

export default function AiChat({ onNavigate }) {
  const {
    workspace,
    backend,
    busy,
    can,
    evidence,
    preferences,
    diagnostics,
    metrics,
    chatConversations,
    workspaceArtifacts,
    agentRuns,
    reports,
    connectors,
    uploadEvidence,
    currentMember,
    loadWorkspace,
    sendChatMessage,
    updateChatConversation,
    deleteChatConversation,
    createChatConversation,
    branchConversation,
    updateAgentRunStatus,
    saveWorkbenchArtifact,
  } = useWorkspace();
  const activeConversations = useMemo(
    () => [...(chatConversations || [])].sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)),
    [chatConversations],
  );
  const [activeChat, setActiveChat] = useState("new");
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileContextOpen, setIsMobileContextOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const abortRef = useRef(null);
  const activeConversation = activeConversations.find((conversation) => conversation.id === activeChat) || null;

  useEffect(() => {
    if (isSending) return;
    if (activeChat === "new") {
      setMessages([]);
      return;
    }
    if (activeConversation) {
      setMessages(conversationMessages(activeConversation));
      return;
    }
    if (activeConversations.length) {
      setActiveChat(activeConversations[0].id);
    }
  }, [activeChat, activeConversation, activeConversations, isSending]);

  async function handleNewWorkbench(config = {}) {
    try {
      const mode = config.mode || "Analyze";
      const created = await createChatConversation({
        title: config.title || config.initialPrompt || "New Workbench",
        mode,
        tags: config.tags || ["Workbench", mode],
      });
      setActiveChat(created.id);
      setIsMobileMenuOpen(false);
      setMessages(conversationMessages(created));
      if (config.initialPrompt) {
        setInput(config.initialPrompt);
      }
      toast.success("Workbench created");
    } catch (error) {
      toast.error(error.message || "Failed to create workbench.");
    }
  }

  async function handleNewChat() {
    try {
      const created = await createChatConversation({
        title: "New Chat",
        mode: "Ask",
        tags: ["Regular Chat"]
      });
      setActiveChat(created.id);
      setIsMobileMenuOpen(false);
      setMessages(conversationMessages(created));
      setInput("");
      toast.success("Chat created");
    } catch (error) {
      toast.error(error.message || "Failed to create chat.");
    }
  }

  async function handleBranchConversation(messageId = null) {
    if (!activeConversation?.id) {
      toast.info("Save or select a conversation before branching.");
      return;
    }
    try {
      const created = await branchConversation({ sourceId: activeConversation.id, messageId });
      setActiveChat(created.id);
      setMessages(conversationMessages(created));
      toast.success("Conversation branched successfully.");
    } catch (error) {
      toast.error(error.message || "Failed to branch conversation.");
    }
  }

  function handleSelectChat(id) {
    setActiveChat(id);
    setIsMobileMenuOpen(false);
  }

  function handleStop() {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsSending(false);
    setMessages((current) => {
      const next = [...current];
      const lastIndex = next.length - 1;
      if (lastIndex >= 0 && next[lastIndex]?.role === "assistant" && (next[lastIndex].isThinking || next[lastIndex].isStreaming)) {
        next[lastIndex] = {
          ...next[lastIndex],
          content: next[lastIndex].content || "Generation stopped before a final answer was completed.",
          isThinking: false,
          isStreaming: false,
          time: "Just now",
        };
      }
      return next;
    });
    toast.message("Generation stopped");
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || isSending) return;
    if (!can("ask_ai")) {
      toast.error("AI chat requires ask AI permission.");
      return;
    }

    const userMessage = { role: "user", content: text, time: "Just now" };
    const assistantPlaceholder = { role: "assistant", content: "", isThinking: true, time: "Just now" };
    const requestMessages = [...messages, userMessage]
      .filter((message) => message.role === "user" || message.role === "assistant")
      .map((message) => ({ role: message.role, text: message.content }));

    setMessages((current) => [...current, userMessage, assistantPlaceholder]);
    setInput("");
    setIsSending(true);
    const controller = new AbortController();
    abortRef.current = controller;
    let assistantText = "";

    try {
      const result = await sendChatMessage({
        conversationId: activeChat !== "new" ? activeChat : undefined,
        messages: requestMessages,
        mode: "Ask",
        title: activeConversation?.title || text,
        language: /[а-яё]/i.test(text) ? "ru" : "en",
        signal: controller.signal,
        onConversationId: (id) => setActiveChat(id),
        onChunk: (chunk, fullText) => {
          assistantText = fullText || `${assistantText}${chunk || ""}`;
          setMessages((current) => {
            const next = [...current];
            const lastIndex = next.length - 1;
            next[lastIndex] = { role: "assistant", content: assistantText, isStreaming: true, time: "Just now" };
            return next;
          });
        },
      });

      assistantText = result.text || assistantText;
      setMessages((current) => {
        const next = [...current];
        const lastIndex = next.length - 1;
        next[lastIndex] = {
          role: "assistant",
          content: assistantText,
          provider: result.provider,
          isFullResponse: shouldUseStructuredResponse(text),
          time: "Just now",
        };
        return next;
      });
      if (result.provider === "local-fallback") {
        toast.message("Answered from local workspace context");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        setMessages((current) => {
          const next = [...current];
          const lastIndex = next.length - 1;
          next[lastIndex] = {
            role: "assistant",
            content: error.message || "Chat request failed.",
            time: "Just now",
          };
          return next;
        });
        toast.error(error.message || "Chat request failed.");
      }
    } finally {
      abortRef.current = null;
      setIsSending(false);
    }
  }

  async function handleRenameConversation(item = activeConversation) {
    if (!item?.id) {
      toast.info("Create or select a saved chat before renaming.");
      return;
    }
    const nextTitle = window.prompt("Conversation title", item.title || activeConversation?.title || "");
    if (!nextTitle?.trim()) return;
    try {
      await updateChatConversation({ id: item.id, title: nextTitle.trim() });
      toast.success("Conversation renamed");
    } catch (error) {
      toast.error(error.message || "Conversation could not be renamed.");
    }
  }

  async function handleArchiveConversation(item = activeConversation) {
    if (!item?.id) {
      toast.info("Create or select a saved chat before archiving.");
      return;
    }
    const status = item.status === "archived" ? "active" : "archived";
    try {
      await updateChatConversation({ id: item.id, status });
      if (item.id === activeChat && status === "archived") {
        setActiveChat("new");
      }
      toast.success(status === "archived" ? "Conversation archived" : "Conversation restored");
    } catch (error) {
      toast.error(error.message || "Conversation status could not be updated.");
    }
  }

  async function handleDeleteConversation(item = activeConversation) {
    if (!item?.id) {
      toast.info("Create or select a saved chat before deleting.");
      return;
    }
    const confirmed = window.confirm(`Delete "${item.title || "this conversation"}"? This removes the saved chat history.`);
    if (!confirmed) return;
    try {
      await deleteChatConversation({ id: item.id });
      if (item.id === activeChat) {
        setActiveChat("new");
        setMessages([]);
      }
      toast.success("Conversation deleted");
    } catch (error) {
      toast.error(error.message || "Conversation could not be deleted.");
    }
  }

  async function handleTogglePin(item = activeConversation) {
    if (!item?.id) {
      toast.info("Create or select a saved chat before pinning.");
      return;
    }
    try {
      await updateChatConversation({ id: item.id, pinned: !item.pinned });
    } catch (error) {
      toast.error(error.message || "Conversation could not be updated.");
    }
  }

  function handleExportConversation(format) {
    if (!activeConversation?.id) {
      toast.error("There is no saved conversation to export.");
      return;
    }
    if (downloadConversation(activeConversation, format)) {
      toast.success("Conversation exported");
    }
  }

  async function handleAttachWorkbenchFiles(files) {
    const result = await uploadEvidence(files, "AI Workbench attachment");
    const count = result?.evidence?.length || Array.from(files || []).length;
    toast.success(`${count} file${count === 1 ? "" : "s"} attached to workspace evidence`);
    return result;
  }

  function handleClearConversation() {
    if (activeConversation?.id) {
      handleDeleteConversation(activeConversation);
      return;
    }
    setMessages([]);
    setInput("");
    toast.success("Draft conversation cleared");
  }

  function handleOpenChatSettings() {
    onNavigate?.("settings", { source: "workbench-chat-settings" });
  }

  function handleShowShortcuts() {
    toast.info("Shortcuts: Enter to send, Shift+Enter for a new line, Esc to stop generation.");
  }

  async function handleUpdateConversationTags(tags) {
    if (!activeConversation?.id) throw new Error("Save a conversation before changing tags.");
    await updateChatConversation({ id: activeConversation.id, tags });
  }

  async function handleAgentStatusChange(agent, status) {
    if (!agent?.id && !agent?.agentId) return;
    try {
      await updateAgentRunStatus({
        id: agent.id,
        agentId: agent.agentId,
        status,
        note: `Updated from AI Workbench context panel.`,
      });
      toast.success(`${agent.name || "Agent run"} marked ${status}.`);
    } catch (error) {
      toast.error(error.message || "Agent run could not be updated.");
    }
  }

  return (
    <SectionLoader delay={500}>
      <div className="flex h-screen w-full bg-[#080A0E] overflow-hidden -m-4 sm:-m-6 lg:-m-8 relative">

        {/* Mobile Header Overlays (visible only on lg/xl down) */}
        <div className="absolute top-4 left-4 z-40 lg:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger className="flex size-10 items-center justify-center rounded-lg border border-[#28313C] bg-[#141A22] text-white shadow-lg">
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[260px] border-r-[#28313C]">
              <WorkbenchSidebar
                activeId={activeChat}
                onSelect={handleSelectChat}
                onNew={handleNewWorkbench}
                onNewChat={handleNewChat}
                conversations={activeConversations}
                agentRuns={agentRuns}
                reports={reports}
                busy={busy || isSending}
                onRename={handleRenameConversation}
                onArchive={handleArchiveConversation}
                onDelete={handleDeleteConversation}
                onTogglePin={handleTogglePin}
              />
            </SheetContent>
          </Sheet>
        </div>

        <div className="absolute top-4 right-4 z-40 xl:hidden">
          <Sheet open={isMobileContextOpen} onOpenChange={setIsMobileContextOpen}>
            <SheetTrigger className="flex size-10 items-center justify-center rounded-lg border border-[#28313C] bg-[#141A22] text-white shadow-lg">
              <PanelRight className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-[300px] border-l-[#28313C]">
              <WorkbenchContextPanel
                workspace={workspace}
                backend={backend}
                evidence={evidence}
                liveEvents={workspace.liveEvents || []}
                diagnostics={diagnostics}
                metrics={metrics}
                agentRuns={agentRuns}
                reports={reports}
                workspaceArtifacts={workspaceArtifacts}
                chatConversations={activeConversations}
                connectors={connectors}
                currentMember={currentMember}
                busy={busy}
                canManageAgents={can("run_agents")}
                onNavigate={onNavigate}
                onRefresh={() => loadWorkspace({ silent: true })}
                onAgentStatusChange={handleAgentStatusChange}
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Left Sidebar */}
        <div className="hidden lg:block h-full">
          <WorkbenchSidebar
            activeId={activeChat}
            onSelect={handleSelectChat}
            onNew={handleNewWorkbench}
            onNewChat={handleNewChat}
            conversations={activeConversations}
            agentRuns={agentRuns}
            reports={reports}
            busy={busy || isSending}
            onRename={handleRenameConversation}
            onArchive={handleArchiveConversation}
            onDelete={handleDeleteConversation}
            onTogglePin={handleTogglePin}
          />
        </div>

        {/* Center Canvas */}
        <div className="flex-1 relative min-w-0 flex flex-col h-full bg-[#080A0E]">
          <div className="flex-1 overflow-hidden">
            <WorkbenchCanvas
              messages={messages}
              isTyping={isSending}
              conversation={activeConversation}
              onNavigate={onNavigate}
              onPromptSelect={setInput}
              onRenameConversation={() => handleRenameConversation(activeConversation)}
              onArchiveConversation={() => handleArchiveConversation(activeConversation)}
              onDeleteConversation={() => handleDeleteConversation(activeConversation)}
              onTogglePin={() => handleTogglePin(activeConversation)}
              onExportConversation={handleExportConversation}
              onBranchConversation={handleBranchConversation}
              onSaveArtifact={saveWorkbenchArtifact}
              onUpdateConversationTags={handleUpdateConversationTags}
              defaultTags={preferences?.workbench?.defaultTags || ["Software"]}
              canSaveArtifacts={can("ask_ai")}
              busy={busy || isSending}
            />
          </div>

          <div className="shrink-0 w-full bg-[#080A0E]">
            <WorkbenchComposer
              input={input}
              setInput={setInput}
              isSending={isSending}
              onSend={handleSend}
              onStop={handleStop}
              isEmpty={messages.length === 0 && !isSending}
              workspaceName={workspace?.workspaceName || workspace?.name || "GENIUS Workspace"}
              onAttachFiles={handleAttachWorkbenchFiles}
              onClearConversation={handleClearConversation}
              onOpenSettings={handleOpenChatSettings}
              onShowShortcuts={handleShowShortcuts}
            />
          </div>
        </div>

        {/* Desktop Right Context Panel */}
        <div className="hidden xl:block h-full">
          <WorkbenchContextPanel
            workspace={workspace}
            backend={backend}
            evidence={evidence}
            liveEvents={workspace.liveEvents || []}
            diagnostics={diagnostics}
            metrics={metrics}
            agentRuns={agentRuns}
            reports={reports}
            workspaceArtifacts={workspaceArtifacts}
            chatConversations={activeConversations}
            connectors={connectors}
            currentMember={currentMember}
            busy={busy}
            canManageAgents={can("run_agents")}
            onNavigate={onNavigate}
            onRefresh={() => loadWorkspace({ silent: true })}
            onAgentStatusChange={handleAgentStatusChange}
          />
        </div>
      </div>
    </SectionLoader>
  );
}
