import { buildChatSystemPrompt, buildEvidenceExtractionPrompt } from "./prompts";

const geminiEndpoint = "https://generativelanguage.googleapis.com/v1beta/models";
const defaultGeminiModel = "gemini-2.5-flash";

// Reads Gemini runtime config lazily so Next build does not require secrets.
function getGeminiConfig() {
  return {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || defaultGeminiModel,
  };
}

// Gemini returns text parts inside candidates; this flattens them into one JSON string.
function decodeGeminiText(responseBody) {
  return responseBody?.candidates
    ?.flatMap((candidate) => candidate?.content?.parts ?? [])
    ?.map((part) => part.text)
    ?.filter(Boolean)
    ?.join("\n")
    ?.trim();
}

// Extracts generated text from one streaming Gemini response event.
export function decodeGeminiStreamText(responseBody) {
  return decodeGeminiText(responseBody) || "";
}

// Keeps extraction resilient when a model wraps JSON in markdown or explanatory text.
function parseJsonPayload(text) {
  if (!text) return null;

  const trimmed = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;
    return JSON.parse(trimmed.slice(start, end + 1));
  }
}

// Converts provider HTTP errors into stable product states for the UI.
function geminiErrorStatus(status) {
  if (status === 401 || status === 403) return "auth_error";
  if (status === 429) return "rate_limited";
  if (status >= 500) return "provider_unavailable";
  return "provider_error";
}

// Runs the only active MVP AI flow: Gemini document extraction with local fallback support.
export async function extractEvidenceWithGemini({ fileName, kind, mimeType, base64Data, text }) {
  const { apiKey, model } = getGeminiConfig();

  if (!apiKey) {
    return {
      provider: "local",
      providerStatus: "needs_key",
      model,
      data: null,
      error: "GEMINI_API_KEY is not configured.",
    };
  }

  const prompt = buildEvidenceExtractionPrompt({ fileName, kind });
  const parts = [{ text: prompt }];

  if ((mimeType === "application/pdf" || mimeType.startsWith("image/")) && base64Data) {
    parts.push({
      inline_data: {
        mime_type: mimeType,
        data: base64Data,
      },
    });
  } else if (text) {
    parts.push({ text: text.slice(0, 120000) });
  }

  const response = await fetch(`${geminiEndpoint}/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    }),
    signal: AbortSignal.timeout(45000),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      provider: "gemini",
      providerStatus: geminiErrorStatus(response.status),
      model,
      data: null,
      error: body?.error?.message || `Gemini request failed with ${response.status}.`,
    };
  }

  const textPayload = decodeGeminiText(body);
  const parsed = parseJsonPayload(textPayload);

  if (!parsed) {
    return {
      provider: "gemini",
      providerStatus: "invalid_json",
      model,
      data: null,
      error: "Gemini returned a response that could not be parsed as JSON.",
    };
  }

  return {
    provider: "gemini",
    providerStatus: "ready",
    model,
    data: parsed,
    usage: body.usageMetadata ?? null,
  };
}

function normalizeChatMessages(messages) {
  return (Array.isArray(messages) ? messages : [])
    .filter((message) => message?.role === "user" || message?.role === "assistant")
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: String(message.text || "").slice(0, 12000) }],
    }))
    .filter((message) => message.parts[0].text.trim());
}

// Opens a Gemini streaming response for live chat; the route handler converts SSE to plain text.
export async function streamChatWithGemini({ messages, evidence, language }) {
  const { apiKey, model } = getGeminiConfig();

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const contents = normalizeChatMessages(messages);
  if (!contents.length) {
    throw new Error("At least one chat message is required.");
  }

  const response = await fetch(`${geminiEndpoint}/${model}:streamGenerateContent?alt=sse`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: buildChatSystemPrompt({ evidence, language }) }],
      },
      contents,
      generationConfig: {
        temperature: 0.35,
      },
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error?.message || `Gemini chat failed with ${response.status}.`);
  }

  if (!response.body) {
    throw new Error("Gemini chat returned an empty stream.");
  }

  return response.body;
}
