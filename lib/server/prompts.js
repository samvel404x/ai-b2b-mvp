export const promptVersions = {
  contractExtraction: "contract_extraction@2026-05-16",
  chatAnalyst: "chat_analyst@2026-06-27",
};

// Canonical extraction shape; UI should consume these keys instead of free-form AI text.
export const evidenceExtractionSchema = {
  vendor_name: null,
  document_type: null,
  contract_value: null,
  currency: null,
  start_date: null,
  end_date: null,
  renewal_date: null,
  notice_period_days: null,
  auto_renewal: null,
  payment_terms: null,
  owner: null,
  invoice_number: null,
  invoice_total: null,
  line_items_summary: null,
  risk_summary: null,
  evidence_snippets: [],
  confidence: 0,
};

// Builds a versioned prompt so future extraction changes are auditable and reversible.
export function buildEvidenceExtractionPrompt({ fileName, kind }) {
  return [
    "You are GENIUS, a supervised B2B spend and operations leak analyst.",
    "Extract only evidence-backed structured fields from the provided contract, invoice, spend CSV, screenshot, image, URL text, or business document.",
    "Return JSON only. Do not include markdown.",
    "If a field is not present, use null. Do not invent values.",
    "Every evidence snippet must be short and copied from source text when possible. For screenshots/images, describe the visible evidence briefly.",
    "",
    `Prompt version: ${promptVersions.contractExtraction}`,
    `File name: ${fileName}`,
    `Detected kind: ${kind}`,
    "",
    "Required JSON shape:",
    JSON.stringify(evidenceExtractionSchema),
  ].join("\n");
}

// Turns saved evidence records into compact context that Gemini can cite in chat answers.
export function buildEvidenceContext(evidence = []) {
  if (!Array.isArray(evidence) || !evidence.length) {
    return "No uploaded evidence is currently attached.";
  }

  return evidence
    .slice(0, 12)
    .map((record, index) => {
      const fields = record.fields ?? {};
      return [
        `Evidence ${index + 1}: ${record.name}`,
        `kind=${record.kind || "unknown"}`,
        `status=${record.status || "unknown"}`,
        `provider=${record.provider || "unknown"}`,
        `vendor=${fields.vendor || "unknown"}`,
        `renewal=${fields.renewal || "unknown"}`,
        `notice=${fields.notice || "unknown"}`,
        `value=${fields.value || "unknown"}`,
      ].join("; ");
    })
    .join("\n");
}

export function buildLiveEventsContext(liveEvents = []) {
  if (!Array.isArray(liveEvents) || !liveEvents.length) {
    return "No Business Live events are currently attached.";
  }

  return liveEvents
    .slice(0, 16)
    .map((event, index) => {
      return [
        `Live event ${index + 1}: ${event.name || event.type || "event"}`,
        `type=${event.type || "unknown"}`,
        `amount=${event.amount || 0} ${event.currency || "USD"}`,
        `cost=${event.cost || 0}`,
        `channel=${event.channel || "unknown"}`,
        `sku=${event.sku || "unknown"}`,
        `status=${event.status || "unknown"}`,
        `occurred_at=${event.occurredAt || "unknown"}`,
      ].join("; ");
    })
    .join("\n");
}

function buildDiagnosticsContext(diagnostics = {}, proofTrail = []) {
  const categories = Array.isArray(diagnostics.categories) ? diagnostics.categories : [];
  const trails = Array.isArray(proofTrail) ? proofTrail : [];

  return [
    `diagnostic_score=${diagnostics.overallScore ?? "unknown"}`,
    `data_quality=${diagnostics.dataQualityScore ?? "unknown"}`,
    `open_actions=${diagnostics.summary?.openActions ?? "unknown"}`,
    `proof_trails=${trails.length}`,
    ...categories.slice(0, 6).map((category) => {
      return `category=${category.label}; score=${category.score}; status=${category.status}; signals=${category.signals}; impact=${category.impact}`;
    }),
    ...trails.slice(0, 5).map((item) => {
      return `proof=${item.evidenceName} -> ${item.fact} -> ${item.risk} -> ${item.actionStatus}`;
    }),
  ].join("\n");
}

function buildFindingsContext(findings = []) {
  if (!Array.isArray(findings) || !findings.length) {
    return "No diagnostic findings are currently available.";
  }

  return findings
    .slice(0, 10)
    .map((finding, index) => {
      return [
        `Finding ${index + 1}: ${finding.title || "Untitled finding"}`,
        `category=${finding.category || "unknown"}`,
        `severity=${finding.severity || "unknown"}`,
        `impact=${finding.impact || 0}`,
        `confidence=${finding.confidence || 0}`,
        `owner=${finding.owner || "unknown"}`,
        `source=${finding.source || "unknown"}`,
        `recommended_action=${finding.recommendedAction || "unknown"}`,
      ].join("; ");
    })
    .join("\n");
}

function buildActionsContext(actions = []) {
  if (!Array.isArray(actions) || !actions.length) {
    return "No supervised agent actions are currently available.";
  }

  return actions
    .slice(0, 10)
    .map((action, index) => {
      return [
        `Action ${index + 1}: ${action.title || "Untitled action"}`,
        `status=${action.status || "unknown"}`,
        `owner=${action.owner || "unknown"}`,
        `impact=${action.impact || 0}`,
        `agent=${action.agentId || "unknown"}`,
        `proof_trail=${action.proofTrailId || "unknown"}`,
        `description=${action.description || action.recommendedAction || "unknown"}`,
      ].join("; ");
    })
    .join("\n");
}

function buildReportsContext(reports = []) {
  if (!Array.isArray(reports) || !reports.length) {
    return "No board reports are currently available.";
  }

  return reports
    .slice(0, 6)
    .map((report, index) => {
      return [
        `Report ${index + 1}: ${report.title || "Untitled report"}`,
        `type=${report.type || "unknown"}`,
        `status=${report.status || "unknown"}`,
        `detail=${report.detail || "unknown"}`,
      ].join("; ");
    })
    .join("\n");
}

// Defines the runtime chat behavior: useful analyst, evidence-first, no autonomous actions.
export function buildChatSystemPrompt({
  evidence = [],
  liveEvents = [],
  diagnostics = {},
  proofTrail = [],
  findings = [],
  actions = [],
  reports = [],
  language = "en",
}) {
  return [
    "You are GENIUS, a supervised AI business leak analyst for B2B companies.",
    `Prompt version: ${promptVersions.chatAnalyst}`,
    `Preferred language code: ${language}`,
    "Answer in the user's language when it is clear from the latest message.",
    "Use concise, practical business language.",
    "Focus on renewals, spend leakage, duplicate tools, invoice mismatch, owners, approvals, and next actions.",
    "Never claim you executed an action. You can only recommend, draft, or prepare actions for human approval.",
    "If evidence is missing, say what data is needed instead of inventing facts.",
    "When using uploaded evidence, cite file names or extracted fields.",
    "",
    "Attached evidence context:",
    buildEvidenceContext(evidence),
    "",
    "Business Live event context:",
    buildLiveEventsContext(liveEvents),
    "",
    "Diagnostics and proof-trail context:",
    buildDiagnosticsContext(diagnostics, proofTrail),
    "",
    "Diagnostic findings context:",
    buildFindingsContext(findings),
    "",
    "Supervised agent actions context:",
    buildActionsContext(actions),
    "",
    "Board reports context:",
    buildReportsContext(reports),
  ].join("\n");
}
