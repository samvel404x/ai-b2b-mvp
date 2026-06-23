import crypto from "node:crypto";
import { extractEvidenceWithGemini } from "./gemini";
import { storeEvidenceFile, isSupabaseFileStorageConfigured } from "./supabase-file-store";

export const supportedEvidenceExtensions = [".pdf", ".csv", ".txt", ".xlsx", ".xls", ".doc", ".docx", ".png", ".jpg", ".jpeg", ".webp"];
export const maxEvidenceUploadBytes = 20 * 1024 * 1024;

// Typed upload error used by route handlers to return precise HTTP statuses.
export class EvidenceUploadError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "EvidenceUploadError";
    this.status = status;
  }
}

// Reads the file extension without trusting browser-provided MIME data.
function extensionFromName(name) {
  const match = name.toLowerCase().match(/\.[a-z0-9]+$/);
  return match?.[0] ?? "";
}

// Sanitizes user file names before they are stored or shown back in the app.
function safeName(name) {
  return String(name || "evidence-file").replace(/[^\w.\- ()]/g, "_").slice(0, 180);
}

// Converts bytes into compact UI text.
function fileSizeLabel(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

// Maps evidence files to product categories used by Data Room and leak cards.
function sourceKindFromName(name) {
  const extension = extensionFromName(name);
  if (extension === ".csv") return "CSV";
  if (extension === ".xlsx" || extension === ".xls") return "Excel";
  if (extension === ".pdf") return "PDF";
  if ([".png", ".jpg", ".jpeg", ".webp"].includes(extension)) return "Image";
  if (extension === ".txt") return "Text";
  return "Document";
}

// Browser MIME types are inconsistent, so extension fallback keeps uploads predictable.
function mimeTypeForFile(file, name) {
  if (file.type) return file.type;

  const extension = extensionFromName(name);
  if (extension === ".pdf") return "application/pdf";
  if (extension === ".csv") return "text/csv";
  if (extension === ".txt") return "text/plain";
  if (extension === ".png") return "image/png";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  if (extension === ".docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (extension === ".xlsx") return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  return "application/octet-stream";
}

// Only plain text and CSV are decoded locally; PDFs are sent to Gemini as binary input.
function canDecodeAsText(name, mimeType) {
  const extension = extensionFromName(name);
  return extension === ".csv" || extension === ".txt" || mimeType.startsWith("text/");
}

// Decodes small text-like files for fallback extraction and Gemini text prompts.
function decodeText(buffer, name, mimeType) {
  if (!canDecodeAsText(name, mimeType)) return "";
  return new TextDecoder("utf-8", { fatal: false }).decode(buffer).slice(0, 160000);
}

// Gemini can inspect PDFs and screenshots directly as inline binary inputs.
function shouldSendAsGeminiBinary(mimeType) {
  return mimeType === "application/pdf" || mimeType.startsWith("image/");
}

// Minimal CSV parser for MVP fallback; handles quoted commas without adding dependencies.
function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

// Reads a small CSV sample so fallback extraction can identify vendors and spend totals.
function parseCsvSample(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 80);

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase().replace(/\s+/g, "_"));
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
  });
}

// Finds common business columns across exports with different header names.
function findField(row, names) {
  const entries = Object.entries(row);
  const match = entries.find(([key]) => names.some((name) => key.includes(name)));
  return match?.[1] || "";
}

// Normalizes money-like strings into numbers for calculations.
function numberFromMoney(value) {
  const normalized = String(value || "")
    .replace(/[^0-9.,-]/g, "")
    .replace(/,/g, "");
  const number = Number.parseFloat(normalized);
  return Number.isFinite(number) ? number : null;
}

// Formats extracted amounts for the review screen.
function formatMoney(value, currency = "$") {
  const numeric = numberFromMoney(value);
  if (numeric === null) return value || null;
  return `${currency}${Math.round(numeric).toLocaleString("en-US")}`;
}

// Uses the uploaded filename as a low-confidence vendor fallback.
function cleanVendorFromName(name) {
  return safeName(name)
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\b(contract|invoice|spend|export|msa|agreement|report)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 42) || "Uploaded vendor";
}

// Extracts simple ISO-like dates from text and CSV content.
function extractDates(text) {
  return Array.from(text.matchAll(/\b(20\d{2}[-/.](?:0?[1-9]|1[0-2])[-/.](?:0?[1-9]|[12]\d|3[01])|(?:0?[1-9]|[12]\d|3[01])[-/.](?:0?[1-9]|1[0-2])[-/.]20\d{2})\b/g))
    .map((match) => match[0])
    .slice(0, 4);
}

// Extracts basic notice-period language such as "30 days notice".
function extractNotice(text) {
  const direct = text.match(/\b(\d{1,3})\s+days?\s+(?:written\s+)?notice\b/i);
  if (direct) return Number.parseInt(direct[1], 10);

  const inverse = text.match(/\bnotice\b.{0,40}\b(\d{1,3})\s+days?\b/i);
  if (inverse) return Number.parseInt(inverse[1], 10);

  return null;
}

// Provides a deterministic fallback when Gemini is missing, rate-limited, or returns bad JSON.
function buildLocalExtraction({ fileName, kind, text }) {
  const csvRows = kind === "CSV" ? parseCsvSample(text) : [];
  const firstRow = csvRows[0] ?? {};
  const vendorFromCsv = findField(firstRow, ["vendor", "supplier", "merchant", "company"]);
  const amountValues = csvRows
    .map((row) => findField(row, ["amount", "total", "price", "cost", "spend"]))
    .map(numberFromMoney)
    .filter((value) => value !== null);
  const total = amountValues.length ? amountValues.reduce((sum, value) => sum + value, 0) : null;
  const moneyMatch = text.match(/(?:[$]\s?\d[\d,]*(?:\.\d{2})?|\d[\d,]*(?:\.\d{2})?\s?(?:USD|EUR|GBP))/i)?.[0];
  const dates = extractDates(text);
  const noticePeriod = extractNotice(text);

  return {
    vendor_name: vendorFromCsv || cleanVendorFromName(fileName),
    document_type: kind,
    contract_value: total ?? numberFromMoney(moneyMatch),
    currency: /\bEUR\b/i.test(moneyMatch || "") ? "EUR" : /\bGBP\b/i.test(moneyMatch || "") ? "GBP" : "USD",
    start_date: dates[0] ?? null,
    end_date: dates[1] ?? null,
    renewal_date: dates[1] ?? dates[0] ?? null,
    notice_period_days: noticePeriod,
    auto_renewal: /\bauto(?:matic)?[-\s]?renew/i.test(text) ? true : null,
    payment_terms: text.match(/\bnet\s+\d{1,3}\b/i)?.[0] ?? null,
    owner: null,
    invoice_number: text.match(/\b(?:invoice|inv)[\s#:.-]*([a-z0-9-]{3,})\b/i)?.[1] ?? null,
    invoice_total: total,
    line_items_summary: csvRows.length ? `${csvRows.length} CSV rows sampled` : null,
    risk_summary: "Needs human review before any action is created.",
    evidence_snippets: text ? text.split(/\r?\n/).filter(Boolean).slice(0, 3) : [],
    confidence: text ? 45 : 25,
  };
}

// Merges AI output over fallback fields while preserving safe defaults.
function normalizeExtraction(data, fallback) {
  const source = data && typeof data === "object" ? data : {};
  return {
    ...fallback,
    ...Object.fromEntries(
      Object.entries(source).filter(([, value]) => {
        return value !== undefined && value !== "";
      }),
    ),
    evidence_snippets: Array.isArray(source.evidence_snippets)
      ? source.evidence_snippets.filter(Boolean).slice(0, 6)
      : fallback.evidence_snippets,
    confidence: Number.isFinite(Number(source.confidence)) ? Number(source.confidence) : fallback.confidence,
  };
}

// Converts structured extraction into the compact fields shown in the review panel.
function displayFieldsFromExtraction(extraction) {
  const value = extraction.contract_value ?? extraction.invoice_total;
  const currencySymbol = extraction.currency === "EUR" ? "EUR " : extraction.currency === "GBP" ? "GBP " : "$";

  return {
    vendor: extraction.vendor_name || "Uploaded vendor",
    renewal: extraction.renewal_date || extraction.end_date || "Pending review",
    notice: extraction.notice_period_days ? `${extraction.notice_period_days} days` : "Pending review",
    value: value ? formatMoney(value, currencySymbol) : "Pending review",
  };
}

// Shared record builder for uploaded files and URL/text sources.
async function createEvidenceRecord({ name, source, kind, mimeType, bytes = 0, buffer = null, text = "", url = null }) {
  const localExtraction = buildLocalExtraction({ fileName: name, kind, text });
  const geminiExtraction = await extractEvidenceWithGemini({
    fileName: name,
    kind,
    mimeType,
    base64Data: buffer && shouldSendAsGeminiBinary(mimeType) ? buffer.toString("base64") : "",
    text,
  });
  const extracted = normalizeExtraction(geminiExtraction.data, localExtraction);
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    name,
    url,
    size: bytes ? fileSizeLabel(bytes) : "URL",
    bytes,
    type: mimeType,
    kind,
    source,
    status: "Needs review",
    provider: geminiExtraction.provider,
    providerStatus: geminiExtraction.providerStatus,
    model: geminiExtraction.model,
    fields: displayFieldsFromExtraction(extracted),
    extracted,
    evidence: extracted.evidence_snippets,
    confidence: extracted.confidence,
    error: geminiExtraction.error ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

function withStorageMetadata(record, storage) {
  if (!storage) return record;

  return {
    ...record,
    storage,
    extracted: {
      ...record.extracted,
      storage_file: storage,
    },
  };
}

// Main upload pipeline: validate file, run Gemini/fallback extraction, store raw evidence, and return a review record.
export async function analyzeEvidenceFile(file, source = "Data Intake", options = {}) {
  const name = safeName(file.name);
  const extension = extensionFromName(name);

  if (!supportedEvidenceExtensions.includes(extension)) {
    throw new EvidenceUploadError(`${name} is not supported. Use PDF, CSV, XLSX, DOCX, TXT, PNG, JPG, or WEBP.`, 415);
  }

  if (file.size > maxEvidenceUploadBytes) {
    throw new EvidenceUploadError(`${name} is too large. Upload files under 20 MB.`, 413);
  }

  const mimeType = mimeTypeForFile(file, name);
  const buffer = Buffer.from(await file.arrayBuffer());
  const kind = sourceKindFromName(name);
  const text = decodeText(buffer, name, mimeType);

  const record = await createEvidenceRecord({
    name,
    source,
    kind,
    mimeType,
    bytes: file.size,
    buffer,
    text,
  });

  if (!options.workspaceId || !isSupabaseFileStorageConfigured()) return record;

  try {
    const storage = await storeEvidenceFile({
      workspaceId: options.workspaceId,
      evidenceId: record.id,
      fileName: name,
      mimeType,
      buffer,
    });
    return withStorageMetadata(record, storage);
  } catch (error) {
    throw new EvidenceUploadError(`Raw evidence storage failed for ${name}: ${error.message}`, 502);
  }
}

// URL analysis uses fetched page text as evidence and flows through the same review pipeline.
export async function analyzeEvidenceTextSource({ name, source = "URL Analysis", kind = "URL", text, url }) {
  return await createEvidenceRecord({
    name: safeName(name),
    source,
    kind,
    mimeType: "text/plain",
    bytes: Buffer.byteLength(text || "", "utf8"),
    text: String(text || "").slice(0, 160000),
    url,
  });
}
