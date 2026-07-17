import { decodeGeminiStreamText, streamChatWithGemini } from "../../../lib/server/gemini";
import { requireRequestCapability } from "../../../lib/server/auth-session";
import {
  appendChatConversationTurn,
  createChatConversation,
  deleteChatConversation,
  getWorkspaceSnapshot,
  updateChatConversation,
} from "../../../lib/server/evidence-store";
import { applyRateLimit, guardMutationRequest } from "../../../lib/server/request-security";

export const runtime = "nodejs";

function cleanMessages(messages) {
  return (Array.isArray(messages) ? messages : [])
    .filter((message) => message?.role === "user" || message?.role === "assistant")
    .map((message) => ({
      role: message.role,
      text: String(message.text || message.content || "").slice(0, 12000),
    }))
    .filter((message) => message.text.trim())
    .slice(-16);
}

function cleanEvidence(evidence) {
  return (Array.isArray(evidence) ? evidence : [])
    .map((record) => ({
      id: String(record.id || ""),
      name: String(record.name || ""),
      kind: String(record.kind || ""),
      status: String(record.status || ""),
      provider: String(record.provider || ""),
      fields: record.fields && typeof record.fields === "object" ? record.fields : {},
    }))
    .slice(0, 12);
}

function cleanLiveEvents(liveEvents) {
  return (Array.isArray(liveEvents) ? liveEvents : [])
    .map((event) => ({
      id: String(event.id || ""),
      type: String(event.type || ""),
      name: String(event.name || ""),
      amount: Number(event.amount || 0),
      cost: Number(event.cost || 0),
      currency: String(event.currency || "USD"),
      channel: String(event.channel || ""),
      sku: String(event.sku || ""),
      status: String(event.status || ""),
      occurredAt: String(event.occurredAt || ""),
    }))
    .slice(0, 16);
}

function cleanDiagnostics(diagnostics) {
  if (!diagnostics || typeof diagnostics !== "object") return {};
  return {
    overallScore: Number(diagnostics.overallScore || 0),
    dataQualityScore: Number(diagnostics.dataQualityScore || 0),
    summary: diagnostics.summary && typeof diagnostics.summary === "object" ? diagnostics.summary : {},
    categories: Array.isArray(diagnostics.categories)
      ? diagnostics.categories.map((category) => ({
          id: String(category.id || ""),
          label: String(category.label || ""),
          score: Number(category.score || 0),
          status: String(category.status || ""),
          impact: Number(category.impact || 0),
          signals: Number(category.signals || 0),
        })).slice(0, 8)
      : [],
  };
}

function cleanProofTrail(proofTrail) {
  return (Array.isArray(proofTrail) ? proofTrail : [])
    .map((item) => ({
      id: String(item.id || ""),
      evidenceName: String(item.evidenceName || ""),
      fact: String(item.fact || ""),
      risk: String(item.risk || ""),
      actionStatus: String(item.actionStatus || ""),
      impact: Number(item.impact || 0),
    }))
    .slice(0, 8);
}

function cleanFindings(findings) {
  return (Array.isArray(findings) ? findings : [])
    .map((finding) => ({
      id: String(finding.id || ""),
      title: String(finding.title || ""),
      category: String(finding.category || ""),
      severity: String(finding.severity || ""),
      impact: Number(finding.impact || 0),
      confidence: Number(finding.confidence || 0),
      owner: String(finding.owner || ""),
      source: String(finding.source || ""),
      evidence: String(finding.evidence || ""),
      recommendedAction: String(finding.recommendedAction || ""),
    }))
    .slice(0, 12);
}

function cleanActions(actions) {
  return (Array.isArray(actions) ? actions : [])
    .map((action) => ({
      id: String(action.id || ""),
      title: String(action.title || ""),
      status: String(action.status || ""),
      owner: String(action.owner || ""),
      impact: Number(action.impact || 0),
      agentId: String(action.agentId || ""),
      findingId: String(action.findingId || ""),
      proofTrailId: String(action.proofTrailId || ""),
      description: String(action.description || action.recommendedAction || ""),
      decisionHistory: Array.isArray(action.decisionHistory) ? action.decisionHistory.slice(0, 4) : [],
    }))
    .slice(0, 12);
}

function cleanReports(reports) {
  return (Array.isArray(reports) ? reports : [])
    .map((report) => ({
      id: String(report.id || ""),
      title: String(report.title || ""),
      type: String(report.type || ""),
      status: String(report.status || ""),
      detail: String(report.detail || ""),
      summary: Array.isArray(report.summary) ? report.summary.slice(0, 4).map(String) : [],
    }))
    .slice(0, 8);
}

function mergeById(primary = [], fallback = []) {
  const byId = new Map();
  for (const item of [...fallback, ...primary]) {
    const id = item.id || `${item.name || item.title || item.type}-${byId.size}`;
    byId.set(id, item);
  }
  return Array.from(byId.values());
}

function textFromSseEvent(eventText) {
  return eventText
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim())
    .filter((payload) => payload && payload !== "[DONE]")
    .map((payload) => {
      try {
        return decodeGeminiStreamText(JSON.parse(payload));
      } catch {
        return "";
      }
    })
    .join("");
}

// Converts Gemini SSE chunks into plain text chunks that the browser can render immediately.
function createPlainTextStream(geminiBody, onComplete) {
  const reader = geminiBody.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  let completeText = "";

  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();

      if (done) {
        const finalText = textFromSseEvent(buffer);
        if (finalText) {
          completeText += finalText;
          controller.enqueue(encoder.encode(finalText));
        }
        if (onComplete) {
          await onComplete(completeText);
        }
        controller.close();
        return;
      }

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() ?? "";

      for (const eventText of events) {
        const text = textFromSseEvent(eventText);
        if (text) {
          completeText += text;
          controller.enqueue(encoder.encode(text));
        }
      }
    },
    cancel() {
      reader.cancel();
    },
  });
}

function createTextStream(text) {
  const encoder = new TextEncoder();
  const chunks = String(text || "").match(/.{1,220}(\s|$)/gs) || [String(text || "")];

  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}

function isRussianRequest(language, latestText) {
  return language === "ru" || /[а-яё]/i.test(latestText);
}

function formatMoney(value) {
  const numeric = Number(value || 0);
  return `$${Math.max(0, Math.round(numeric)).toLocaleString("en-US")}`;
}

function buildLocalChatFallback({ messages, evidence, liveEvents, diagnostics, proofTrail, findings, actions, reports, language, providerError }) {
  const latestText = [...messages].reverse().find((message) => message.role === "user")?.text || "";
  const ru = isRussianRequest(language, latestText);
  const topFindings = findings.slice(0, 3);
  const openActions = actions.filter((action) => !["Approved", "Rejected", "Done"].includes(action.status)).slice(0, 3);
  const topProofs = proofTrail.slice(0, 3);
  const evidenceCount = evidence.length + liveEvents.length;
  const diagnosticScore = diagnostics.overallScore || 0;
  const moneyAtRisk = topFindings.reduce((sum, finding) => sum + Number(finding.impact || 0), 0);

  if (ru) {
    if (!evidenceCount && !topFindings.length) {
      return [
        "Gemini сейчас недоступен, поэтому отвечаю локально по workspace state.",
        "Пока нет подтвержденных источников данных. Чтобы GENIUS дал полезный анализ, загрузите contract / invoice / CSV / screenshot / URL и подтвердите extracted fields в Data Intake.",
        "После подтверждения появятся Diagnostics, Savings Radar, Agent Control, Approvals и Board Reports.",
        providerError ? `Provider status: ${providerError}` : "",
      ].filter(Boolean).join("\n");
    }

    return [
      "Gemini сейчас недоступен, поэтому отвечаю локально по сохраненным данным workspace.",
      `Коротко: diagnostic score ${diagnosticScore || "не рассчитан"}, источников ${evidenceCount}, открытых approval-действий ${openActions.length}, оценка риска по top findings ${formatMoney(moneyAtRisk)}.`,
      "",
      "Главные findings:",
      ...(topFindings.length ? topFindings.map((finding, index) =>
        `${index + 1}. ${finding.title} — ${finding.severity || "risk"}, impact ${formatMoney(finding.impact)}, source: ${finding.source || "unknown"}.`,
      ) : ["Нет подтвержденных findings. Подтвердите evidence в Data Intake."]),
      "",
      "Следующие approval-safe действия:",
      ...(openActions.length ? openActions.map((action, index) =>
        `${index + 1}. ${action.title} — статус ${action.status}, owner: ${action.owner || "human approval"}.`,
      ) : ["Нет открытых действий. Запустите supervised agent refresh после подтверждения данных."]),
      "",
      "Proof trail:",
      ...(topProofs.length ? topProofs.map((proof, index) =>
        `${index + 1}. ${proof.evidenceName} -> ${proof.risk} -> ${proof.actionStatus}.`,
      ) : ["Proof trails появятся после подтвержденных источников."]),
      "",
      `Reports: ${reports.map((report) => `${report.title} (${report.status})`).join(", ") || "нет готовых report packs"}.`,
      "Я не выполнял внешние действия. Все изменения остаются через human approval.",
      providerError ? `Provider status: ${providerError}` : "",
    ].filter(Boolean).join("\n");
  }

  if (!evidenceCount && !topFindings.length) {
    return [
      "Gemini is unavailable, so I am answering from local workspace state.",
      "There is no confirmed evidence yet. Upload a contract, invoice, CSV, screenshot, or URL and confirm extracted fields in Data Intake.",
      "After review, GENIUS will populate Diagnostics, Savings Radar, Agent Control, Approvals, and Board Reports.",
      providerError ? `Provider status: ${providerError}` : "",
    ].filter(Boolean).join("\n");
  }

  return [
    "Gemini is unavailable, so I am answering from saved workspace data.",
    `Summary: diagnostic score ${diagnosticScore || "not calculated"}, ${evidenceCount} sources, ${openActions.length} open approval actions, ${formatMoney(moneyAtRisk)} in top finding exposure.`,
    "",
    "Top findings:",
    ...(topFindings.length ? topFindings.map((finding, index) =>
      `${index + 1}. ${finding.title} — ${finding.severity || "risk"}, impact ${formatMoney(finding.impact)}, source: ${finding.source || "unknown"}.`,
    ) : ["No confirmed findings yet. Confirm evidence in Data Intake."]),
    "",
    "Approval-safe next actions:",
    ...(openActions.length ? openActions.map((action, index) =>
      `${index + 1}. ${action.title} — status ${action.status}, owner: ${action.owner || "human approval"}.`,
    ) : ["No open actions yet. Run supervised agent refresh after confirming data."]),
    "",
    "Proof trail:",
    ...(topProofs.length ? topProofs.map((proof, index) =>
      `${index + 1}. ${proof.evidenceName} -> ${proof.risk} -> ${proof.actionStatus}.`,
    ) : ["Proof trails will appear after confirmed sources."]),
    "",
    `Reports: ${reports.map((report) => `${report.title} (${report.status})`).join(", ") || "no report packs yet"}.`,
    "I did not execute external actions. All changes remain behind human approval.",
    providerError ? `Provider status: ${providerError}` : "",
  ].filter(Boolean).join("\n");
}

function chatMessageSummary(message) {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    provider: message.provider,
    model: message.model,
    mode: message.mode,
    createdAt: message.createdAt,
    metadata: message.metadata || {},
  };
}

function chatConversationSummary(conversation) {
  return {
    id: conversation.id,
    title: conversation.title,
    mode: conversation.mode,
    status: conversation.status,
    pinned: Boolean(conversation.pinned),
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    archivedAt: conversation.archivedAt || null,
    tags: Array.isArray(conversation.tags) ? conversation.tags : [],
    messageCount: Array.isArray(conversation.messages) ? conversation.messages.length : 0,
    messages: (conversation.messages || []).map(chatMessageSummary),
  };
}

async function persistChatTurn({ context, conversationId, userText, assistantText, provider, model, mode, title, providerError }) {
  try {
    await appendChatConversationTurn(
      { conversationId, userText, assistantText, provider, model, mode, title, providerError },
      context,
      { workspaceId: context.workspaceId },
    );
  } catch (error) {
    console.warn(`[GENIUS chat] turn persistence failed: ${error?.message || String(error)}`);
  }
}

export async function GET(request) {
  const guard = applyRateLimit(request, { keyPrefix: "chat:get", limit: 120, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const { context, response } = await requireRequestCapability(request, "ask_ai");
  if (response) return response;

  const workspace = await getWorkspaceSnapshot({ workspaceId: context.workspaceId });
  return Response.json(
    {
      conversations: (workspace.chatConversations || []).map(chatConversationSummary),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

// Chat endpoint used by the frontend composer; returns a streaming text response.
export async function POST(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "chat:post", limit: 40, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const { context, response } = await requireRequestCapability(request, "ask_ai");
  if (response) return response;

  try {
    const body = await request.json();
    const mode = String(body.mode || "Ask").slice(0, 60);

    if (body.action === "create") {
      const created = await createChatConversation(
        { title: body.title || "New workspace chat", mode, tags: body.tags },
        context,
        { workspaceId: context.workspaceId },
      );
      const workspace = await getWorkspaceSnapshot({ workspaceId: context.workspaceId });
      return Response.json(
        {
          workspace,
          conversation: chatConversationSummary(created.conversation),
          conversations: (workspace.chatConversations || []).map(chatConversationSummary),
        },
        { headers: { "Cache-Control": "private, no-store" } },
      );
    }

    if (body.action === "branch") {
      const workspace = await getWorkspaceSnapshot({ workspaceId: context.workspaceId });
      const sourceConv = workspace.chatConversations?.find(c => c.id === body.sourceId);
      if (!sourceConv) {
        return Response.json({ error: "Source conversation not found." }, { status: 404 });
      }

      let messagesToCopy = sourceConv.messages || [];
      if (body.messageId) {
        const messageIndex = messagesToCopy.findIndex(m => m.id === body.messageId);
        if (messageIndex !== -1) {
          messagesToCopy = messagesToCopy.slice(0, messageIndex + 1);
        }
      }

      const created = await createChatConversation(
        {
          title: `${sourceConv.title} (Branch)`,
          mode: sourceConv.mode,
          tags: Array.from(new Set([...(sourceConv.tags || []), "Branch"])).slice(0, 8),
          messages: messagesToCopy,
          branchedFrom: sourceConv.id,
          branchMessageId: body.messageId || "",
        },
        context,
        { workspaceId: context.workspaceId },
      );

      const updatedWorkspace = await getWorkspaceSnapshot({ workspaceId: context.workspaceId });
      const newConv = updatedWorkspace.chatConversations?.find(c => c.id === created.conversation.id) || created.conversation;

      return Response.json(
        {
          workspace: updatedWorkspace,
          conversation: chatConversationSummary(newConv),
          conversations: (updatedWorkspace.chatConversations || []).map(chatConversationSummary),
        },
        { headers: { "Cache-Control": "private, no-store" } },
      );
    }

    const messages = cleanMessages(body.messages);
    const requestedConversationId = String(body.conversationId || "").trim();

    if (!messages.length) {
      return Response.json({ error: "At least one message is required." }, { status: 400 });
    }

    const latestUserText = [...messages].reverse().find((message) => message.role === "user")?.text || "";
    if (!latestUserText) {
      return Response.json({ error: "A user message is required." }, { status: 400 });
    }

    let conversationId = requestedConversationId && requestedConversationId !== "new" ? requestedConversationId : "";
    if (!conversationId) {
      const created = await createChatConversation(
        { title: body.title || latestUserText, mode },
        context,
        { workspaceId: context.workspaceId },
      );
      conversationId = created.conversation.id;
    }

    const workspace = await getWorkspaceSnapshot({ workspaceId: context.workspaceId });
    const evidence = cleanEvidence(mergeById(workspace.evidence, body.evidence));
    const liveEvents = cleanLiveEvents(mergeById(workspace.liveEvents, body.liveEvents));
    const diagnostics = cleanDiagnostics(Object.keys(workspace.diagnostics || {}).length ? workspace.diagnostics : body.diagnostics);
    const proofTrail = cleanProofTrail(mergeById(workspace.proofGraph?.trail, body.proofTrail));
    const findings = cleanFindings(workspace.findings);
    const actions = cleanActions(workspace.actions);
    const reports = cleanReports(workspace.reports);
    const language = String(body.language || "en");

    try {
      if (process.env.GENIUS_FORCE_LOCAL_CHAT === "1") {
        throw new Error("Local chat fallback was forced by GENIUS_FORCE_LOCAL_CHAT.");
      }

      const geminiBody = await streamChatWithGemini({
        messages,
        evidence,
        liveEvents,
        diagnostics,
        proofTrail,
        findings,
        actions,
        reports,
        language,
      });

      return new Response(createPlainTextStream(geminiBody, async (assistantText) => {
        if (!assistantText.trim()) return;
        await persistChatTurn({
          context,
          conversationId,
          userText: latestUserText,
          assistantText,
          provider: "gemini",
          model: "gemini",
          mode,
          title: body.title,
        });
      }), {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
          "x-genius-chat-provider": "gemini",
          "x-genius-conversation-id": conversationId,
        },
      });
    } catch (error) {
      const fallback = buildLocalChatFallback({
        messages,
        evidence,
        liveEvents,
        diagnostics,
        proofTrail,
        findings,
        actions,
        reports,
        language,
        providerError: error.message || "Gemini request failed.",
      });
      await persistChatTurn({
        context,
        conversationId,
        userText: latestUserText,
        assistantText: fallback,
        provider: "local-fallback",
        model: "workspace-local",
        mode,
        title: body.title,
        providerError: error.message || "Gemini request failed.",
      });

      return new Response(createTextStream(fallback), {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
          "x-genius-chat-provider": "local-fallback",
          "x-genius-conversation-id": conversationId,
        },
      });
    }
  } catch (error) {
    return Response.json({ error: error.message || "Chat request failed." }, { status: 500 });
  }
}

export async function PATCH(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "chat:patch", limit: 80, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const { context, response } = await requireRequestCapability(request, "ask_ai");
  if (response) return response;

  try {
    const body = await request.json().catch(() => ({}));
    const { workspace, conversation } = await updateChatConversation(body, context, { workspaceId: context.workspaceId });

    return Response.json(
      {
        workspace,
        conversation: chatConversationSummary(conversation),
        conversations: (workspace.chatConversations || []).map(chatConversationSummary),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return Response.json({ error: error.message || "Chat conversation could not be updated." }, { status: 400 });
  }
}

export async function DELETE(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "chat:delete", limit: 40, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const { context, response } = await requireRequestCapability(request, "ask_ai");
  if (response) return response;

  try {
    const body = await request.json().catch(() => ({}));
    const { workspace, conversationId } = await deleteChatConversation(body, context, { workspaceId: context.workspaceId });

    return Response.json(
      {
        workspace,
        conversationId,
        conversations: (workspace.chatConversations || []).map(chatConversationSummary),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return Response.json({ error: error.message || "Chat conversation could not be deleted." }, { status: 400 });
  }
}
