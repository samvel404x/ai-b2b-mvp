const DEFAULT_FLOW_ID = "genius-investor-demo-agent";
const DEFAULT_TIMEOUT_MS = 12000;
const MAX_TIMEOUT_MS = 60000;

function cleanText(value, fallback = "", maxLength = 12000) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return (text || fallback).slice(0, maxLength);
}

function cleanNumber(value, fallback = 0, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(min, Math.min(max, Math.round(numeric)));
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function pickTopByImpact(items = [], limit = 5) {
  return safeArray(items)
    .slice()
    .sort((a, b) => Number(b?.impact || 0) - Number(a?.impact || 0))
    .slice(0, limit);
}

function getLangflowConfig() {
  const enabled = process.env.LANGFLOW_DEMO_ENABLED === "1" || process.env.GENIUS_LANGFLOW_ENABLED === "1";
  const serverUrl = cleanText(process.env.LANGFLOW_SERVER_URL || process.env.LANGFLOW_BASE_URL, "", 500).replace(/\/+$/, "");
  const flowId = cleanText(process.env.LANGFLOW_FLOW_ID || process.env.FLOW_ID, DEFAULT_FLOW_ID, 160);
  const apiKey = cleanText(process.env.LANGFLOW_API_KEY, "", 500);
  const timeoutMs = cleanNumber(process.env.LANGFLOW_TIMEOUT_MS, DEFAULT_TIMEOUT_MS, 1000, MAX_TIMEOUT_MS);
  const configured = Boolean(enabled && serverUrl && flowId && apiKey && validateLangflowUrl(serverUrl));

  return {
    enabled,
    configured,
    serverUrl,
    serverOrigin: configured ? new URL(serverUrl).origin : "",
    flowId,
    timeoutMs,
    hasApiKey: Boolean(apiKey),
    apiKey,
  };
}

function validateLangflowUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}

function buildDemoContext(workspace = {}) {
  const findings = pickTopByImpact(workspace.findings, 5).map((finding) => ({
    id: cleanText(finding.id, "", 120),
    title: cleanText(finding.title, "Finding", 180),
    category: cleanText(finding.category, "Workspace", 80),
    severity: cleanText(finding.severity, "Medium", 40),
    owner: cleanText(finding.owner, "Unassigned", 120),
    impact: cleanNumber(finding.impact, 0),
    evidenceId: cleanText(finding.evidenceId, "", 120),
    proofTrailId: `trail:${cleanText(finding.id, "finding", 120)}`,
    recommendedAction: cleanText(finding.recommendedAction, "", 500),
  }));
  const actions = pickTopByImpact(workspace.actions, 5).map((action) => ({
    id: cleanText(action.id, "", 120),
    title: cleanText(action.title, "Approval action", 180),
    status: cleanText(action.status, "Needs review", 80),
    owner: cleanText(action.owner, "Human approval", 120),
    impact: cleanNumber(action.impact, 0),
    findingId: cleanText(action.findingId, "", 120),
    externalExecution: {
      enabled: false,
      reason: cleanText(action.externalExecution?.reason, "External execution requires human approval.", 240),
    },
  }));

  return {
    workspaceId: cleanText(workspace.id, "workspace", 120),
    metrics: {
      evidenceCount: safeArray(workspace.evidence).length,
      findingCount: safeArray(workspace.findings).length,
      openActionCount: safeArray(workspace.actions).filter((action) => !["Approved", "Rejected", "Done"].includes(action.status)).length,
      reportCount: safeArray(workspace.reports).length,
      liveEventCount: safeArray(workspace.liveEvents).length,
      expectedSavings: cleanNumber(workspace.metrics?.expectedSavings || workspace.metrics?.totalImpact, 0),
      riskExposure: cleanNumber(workspace.metrics?.riskExposure || workspace.metrics?.moneyAtRisk, 0),
    },
    topFindings: findings,
    openActions: actions,
    proofTrailIds: findings.map((finding) => finding.proofTrailId).filter(Boolean).slice(0, 8),
  };
}

function buildLangflowPrompt({ prompt, context }) {
  const requestedPrompt = cleanText(
    prompt,
    "Create an investor-safe GENIUS demo brief from this workspace context. Explain the risk, evidence, recommended approvals, and why no external action is executed without human approval.",
    1500,
  );

  return JSON.stringify({
    task: requestedPrompt,
    outputContract: {
      title: "string <= 180",
      summary: "string <= 5000",
      recommendations: [
        {
          title: "string <= 180",
          rationale: "string <= 500",
          impact: "number",
          confidence: "number 0-100",
          evidenceIds: ["string"],
          proposedAction: "string <= 500",
        },
      ],
      metrics: {
        expectedSavings: "number",
        riskExposure: "number",
        confidence: "number 0-100",
      },
      externalExecution: {
        enabled: false,
        reason: "Human approval is required before external execution.",
      },
    },
    context,
  });
}

function parseJsonObject(value) {
  if (!value) return null;
  if (typeof value === "object" && !Array.isArray(value)) return value;
  const text = String(value || "").trim();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        return null;
      }
    }
  }

  return null;
}

function extractLangflowText(payload) {
  const outputs = safeArray(payload?.outputs);
  const nestedOutputs = outputs.flatMap((item) => safeArray(item?.outputs));
  const candidates = [
    ...nestedOutputs.map((item) => item?.results?.message?.text),
    ...nestedOutputs.map((item) => item?.results?.text),
    ...nestedOutputs.map((item) => item?.message?.text),
    ...outputs.map((item) => item?.results?.message?.text),
    payload?.result?.message,
    payload?.message,
    payload?.text,
  ];
  return cleanText(candidates.find((item) => typeof item === "string" && item.trim()), "", 12000);
}

function fallbackRecommendations(context) {
  return context.topFindings.slice(0, 3).map((finding, index) => ({
    id: `langflow-demo-recommendation-${index + 1}`,
    title: finding.title,
    detail: finding.recommendedAction || `Review ${finding.category.toLowerCase()} risk with ${finding.owner}.`,
    impact: String(finding.impact || 0),
    selected: true,
  }));
}

function normalizeRecommendations(value, context) {
  const source = safeArray(value).length ? value : fallbackRecommendations(context);
  return source.slice(0, 6).map((item, index) => ({
    id: cleanText(item.id, `langflow-demo-recommendation-${index + 1}`, 100),
    title: cleanText(item.title || item.label, "Review workspace risk", 180),
    detail: cleanText(item.rationale || item.detail || item.description || item.proposedAction, "Use linked evidence before approving the next action.", 1000),
    impact: String(cleanNumber(item.impact, 0)),
    selected: item.selected !== false,
  }));
}

function buildFallbackOutput(context, reason = "Langflow is not configured in this environment.") {
  const expectedSavings = context.topFindings.reduce((sum, finding) => sum + cleanNumber(finding.impact, 0), 0);
  const summary = [
    "GENIUS prepared a supervised investor demo brief from the current workspace.",
    `${context.metrics.evidenceCount} evidence records, ${context.metrics.findingCount} findings, and ${context.metrics.openActionCount} open approval actions are in scope.`,
    "This fallback proves the product workflow without calling an external Langflow server.",
    reason,
  ].filter(Boolean).join(" ");

  return {
    title: "Langflow Demo Agent workspace brief",
    summary,
    recommendations: fallbackRecommendations(context),
    metrics: {
      expectedSavings,
      riskExposure: cleanNumber(context.metrics.riskExposure, 0),
      confidence: context.topFindings.length ? 82 : 55,
    },
    externalExecution: {
      enabled: false,
      reason: "Demo only. Human approval is required before any external execution.",
    },
  };
}

function normalizeAgentOutput({ rawText, rawJson, context, status, fallbackReason }) {
  const parsed = parseJsonObject(rawJson) || parseJsonObject(rawText);
  const fallback = buildFallbackOutput(context, fallbackReason);
  const output = parsed || fallback;
  const metrics = output.metrics && typeof output.metrics === "object" ? output.metrics : {};
  const summary = cleanText(
    output.summary || output.content || output.body || rawText,
    fallback.summary,
    5000,
  );

  return {
    title: cleanText(output.title, fallback.title, 180),
    summary,
    recommendations: normalizeRecommendations(output.recommendations, context),
    metrics: {
      expectedSavings: cleanNumber(metrics.expectedSavings || metrics.targetSavings || fallback.metrics.expectedSavings, 0),
      riskExposure: cleanNumber(metrics.riskExposure || metrics.totalRisk || fallback.metrics.riskExposure, 0),
      confidence: cleanNumber(metrics.confidence || fallback.metrics.confidence, fallback.metrics.confidence, 0, 100),
    },
    externalExecution: {
      enabled: false,
      reason: cleanText(output.externalExecution?.reason, fallback.externalExecution.reason, 300),
    },
    status,
  };
}

async function callLangflow(config, { prompt, context }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
  const url = `${config.serverUrl}/api/v1/run/${encodeURIComponent(config.flowId)}?stream=false`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
      },
      body: JSON.stringify({
        input_value: buildLangflowPrompt({ prompt, context }),
        input_type: "chat",
        output_type: "chat",
        output_component: "",
        session_id: `genius-${context.workspaceId}`,
      }),
      signal: controller.signal,
    });
    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { text };
    }

    if (!response.ok) {
      throw new Error(`Langflow returned HTTP ${response.status}`);
    }

    return {
      ok: true,
      rawText: extractLangflowText(data) || text,
      rawJson: data,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function buildLangflowDemoArtifact({ workspace = {}, prompt = "" } = {}) {
  const context = buildDemoContext(workspace);
  const config = getLangflowConfig();
  let status = config.configured ? "completed" : "local_fallback";
  let fallbackReason = config.configured ? "" : "Langflow env is not configured, so GENIUS used the local supervised fallback.";
  let rawText = "";
  let rawJson = null;

  if (config.configured) {
    try {
      const result = await callLangflow(config, { prompt, context });
      rawText = result.rawText;
      rawJson = result.rawJson;
    } catch (error) {
      status = "fallback_after_error";
      fallbackReason = cleanText(error.message, "Langflow call failed; GENIUS used the local supervised fallback.", 300);
    }
  }

  const output = normalizeAgentOutput({ rawText, rawJson, context, status, fallbackReason });

  return {
    output,
    runtime: {
      agentId: "langflow-demo",
      provider: config.configured ? "langflow-http" : "local-supervised-fallback",
      enabled: config.enabled,
      configured: config.configured,
      status,
      flowId: config.flowId,
      serverOrigin: config.serverOrigin,
      timeoutMs: config.timeoutMs,
      blueprintPath: "langflow/genius-demo-agent.blueprint.json",
      docs: "https://docs.langflow.org/api-flows-run",
      externalExecution: output.externalExecution,
    },
    artifact: {
      type: "executive_summary",
      title: output.title,
      content: output.summary,
      status: "saved",
      source: "langflow-demo-agent",
      metrics: output.metrics,
      recommendations: output.recommendations,
      metadata: {
        agentId: "langflow-demo",
        runtimeProvider: config.configured ? "Langflow HTTP adapter" : "Local supervised fallback",
        langflowStatus: status,
        langflowConfigured: config.configured,
        langflowEnabled: config.enabled,
        flowId: config.flowId,
        serverOrigin: config.serverOrigin,
        blueprintPath: "langflow/genius-demo-agent.blueprint.json",
        docs: "https://docs.langflow.org/api-flows-run",
        context: {
          evidenceCount: context.metrics.evidenceCount,
          findingCount: context.metrics.findingCount,
          openActionCount: context.metrics.openActionCount,
          proofTrailIds: context.proofTrailIds,
        },
        externalExecution: output.externalExecution,
      },
    },
  };
}
