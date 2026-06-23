export const promptVersions = {
  contractExtraction: "contract_extraction@2026-05-16",
  chatAnalyst: "chat_analyst@2026-05-17",
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

// Defines the runtime chat behavior: useful analyst, evidence-first, no autonomous actions.
export function buildChatSystemPrompt({ evidence = [], language = "en" }) {
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
  ].join("\n");
}
