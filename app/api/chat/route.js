import { decodeGeminiStreamText, streamChatWithGemini } from "../../../lib/server/gemini";

export const runtime = "nodejs";

function cleanMessages(messages) {
  return (Array.isArray(messages) ? messages : [])
    .filter((message) => message?.role === "user" || message?.role === "assistant")
    .map((message) => ({
      role: message.role,
      text: String(message.text || "").slice(0, 12000),
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
function createPlainTextStream(geminiBody) {
  const reader = geminiBody.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();

      if (done) {
        const finalText = textFromSseEvent(buffer);
        if (finalText) controller.enqueue(encoder.encode(finalText));
        controller.close();
        return;
      }

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() ?? "";

      for (const eventText of events) {
        const text = textFromSseEvent(eventText);
        if (text) controller.enqueue(encoder.encode(text));
      }
    },
    cancel() {
      reader.cancel();
    },
  });
}

// Chat endpoint used by the frontend composer; returns a streaming text response.
export async function POST(request) {
  try {
    const body = await request.json();
    const messages = cleanMessages(body.messages);

    if (!messages.length) {
      return Response.json({ error: "At least one message is required." }, { status: 400 });
    }

    const geminiBody = await streamChatWithGemini({
      messages,
      evidence: cleanEvidence(body.evidence),
      language: String(body.language || "en"),
    });

    return new Response(createPlainTextStream(geminiBody), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return Response.json({ error: error.message || "Chat request failed." }, { status: 500 });
  }
}
