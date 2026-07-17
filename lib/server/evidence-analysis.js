import crypto from "node:crypto";
import zlib from "node:zlib";
import { extractEvidenceWithGemini } from "./gemini";
import { storeEvidenceFile, isSupabaseFileStorageConfigured } from "./supabase-file-store";
import {
  evidenceFileSizeLabel,
  extensionFromEvidenceName,
  maxEvidenceDecodedTextChars,
  maxEvidenceUploadBytes,
  safeEvidenceFileName,
  supportedEvidenceExtensions,
  validateEvidenceUploadSelection,
} from "../evidence-upload-policy";

export { maxEvidenceUploadBytes, supportedEvidenceExtensions };

const maxSpreadsheetRows = 200;
const maxSpreadsheetColumns = 40;
const maxXlsxXmlEntryBytes = 2_000_000;
const maxXlsxInflatedBytes = 6_000_000;

// Typed upload error used by route handlers to return precise HTTP statuses.
export class EvidenceUploadError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "EvidenceUploadError";
    this.status = status;
  }
}

// Maps evidence files to product categories used by Data Room and leak cards.
function sourceKindFromName(name) {
  const extension = extensionFromEvidenceName(name);
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

  const extension = extensionFromEvidenceName(name);
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
  const extension = extensionFromEvidenceName(name);
  return extension === ".csv" || extension === ".txt" || mimeType.startsWith("text/");
}

// Decodes small text-like files for fallback extraction and Gemini text prompts.
function decodeText(buffer, name, mimeType) {
  if (!canDecodeAsText(name, mimeType)) return "";
  return new TextDecoder("utf-8", { fatal: false }).decode(buffer).slice(0, maxEvidenceDecodedTextChars);
}

// Gemini can inspect PDFs and screenshots directly as inline binary inputs.
function shouldSendAsGeminiBinary(mimeType) {
  return mimeType === "application/pdf" || mimeType.startsWith("image/");
}

function bufferStartsWith(buffer, bytes) {
  if (buffer.length < bytes.length) return false;
  return bytes.every((byte, index) => buffer[index] === byte);
}

function bufferAscii(buffer, start, length) {
  return buffer.subarray(start, start + length).toString("ascii");
}

function isZipContainer(buffer) {
  return bufferStartsWith(buffer, [0x50, 0x4b, 0x03, 0x04])
    || bufferStartsWith(buffer, [0x50, 0x4b, 0x05, 0x06])
    || bufferStartsWith(buffer, [0x50, 0x4b, 0x07, 0x08]);
}

function isOleCompoundDocument(buffer) {
  return bufferStartsWith(buffer, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
}

function hasBinaryNullSignature(buffer) {
  const sample = buffer.subarray(0, Math.min(buffer.length, 2048));
  const nulBytes = sample.reduce((count, byte) => count + (byte === 0 ? 1 : 0), 0);
  return nulBytes > Math.max(8, sample.length * 0.2);
}

function assertEvidenceFileSignature({ buffer, extension, name }) {
  if (!buffer.length) {
    throw new EvidenceUploadError(`${name} is empty and cannot be analyzed.`, 422);
  }

  const valid = (() => {
    if (extension === ".pdf") return bufferAscii(buffer, 0, 5) === "%PDF-";
    if (extension === ".png") return bufferStartsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    if (extension === ".jpg" || extension === ".jpeg") return bufferStartsWith(buffer, [0xff, 0xd8, 0xff]);
    if (extension === ".webp") return bufferAscii(buffer, 0, 4) === "RIFF" && bufferAscii(buffer, 8, 4) === "WEBP";
    if (extension === ".docx" || extension === ".xlsx") return isZipContainer(buffer);
    if (extension === ".doc" || extension === ".xls") return isOleCompoundDocument(buffer);
    if (extension === ".csv" || extension === ".txt") return !hasBinaryNullSignature(buffer);
    return true;
  })();

  if (!valid) {
    throw new EvidenceUploadError(`${name} does not match its file extension. Upload the original PDF, Office, CSV, text, or image file.`, 415);
  }
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

  const headers = parseCsvLine(lines[0]).map(normalizeSpreadsheetHeader);
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
  });
}

function normalizeSpreadsheetHeader(value, index) {
  return String(value || `Column ${index + 1}`)
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80) || `column_${index + 1}`;
}

function cleanSpreadsheetText(value, maxLength = 180) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function detectCurrency(value, fallback = "USD") {
  const text = String(value || "");
  if (/\bEUR\b/.test(text) || text.includes("\u20ac")) return "EUR";
  if (/\bGBP\b/.test(text) || text.includes("\u00a3")) return "GBP";
  if (/\bEUR\b|€/.test(text)) return "EUR";
  if (/\bGBP\b|£/.test(text)) return "GBP";
  if (/\bUSD\b|\$/.test(text)) return "USD";
  return fallback || "USD";
}

function normalizeSpreadsheetRow(row, index) {
  const vendorName = cleanSpreadsheetText(
    row.vendorName || row.vendor || row.supplier || row.merchant || row.company || row.payee,
    120,
  );
  const amountSource = row.amount ?? row.total ?? row.price ?? row.cost ?? row.spend ?? row.value ?? row.invoice_total ?? "";
  const amount = numberFromMoney(amountSource);
  const description = cleanSpreadsheetText(
    row.description || row.memo || row.item || row.product || row.service || row.name || vendorName,
    180,
  );
  const invoiceNumber = cleanSpreadsheetText(row.invoiceNumber || row.invoice || row.invoice_no || row.invoice_number || row.bill_number, 80);
  const category = cleanSpreadsheetText(row.category || row.department || row.account || row.gl || row.type, 80);
  const date = cleanSpreadsheetText(row.date || row.transaction_date || row.posted_date || row.invoice_date || row.created_at, 40);
  const owner = cleanSpreadsheetText(row.owner || row.department_owner || row.approver, 120);
  const raw = Object.fromEntries(
    Object.entries(row.raw || row)
      .slice(0, maxSpreadsheetColumns)
      .map(([key, value]) => [normalizeSpreadsheetHeader(key, 0), cleanSpreadsheetText(value, 240)]),
  );

  return {
    rowNumber: Number.isFinite(Number(row.rowNumber)) ? Number(row.rowNumber) : index + 2,
    vendorName,
    amount: amount ?? 0,
    currency: cleanSpreadsheetText(row.currency, 12) || detectCurrency(amountSource),
    category: category || "Spend",
    description: description || vendorName || "Spreadsheet row",
    invoiceNumber,
    date,
    owner,
    raw,
  };
}

function rowsFromMatrix(matrix = []) {
  const cleanRows = matrix
    .map((row) => row.slice(0, maxSpreadsheetColumns).map((cell) => cleanSpreadsheetText(cell, 240)))
    .filter((row) => row.some(Boolean));

  if (cleanRows.length < 2) return [];

  const headers = cleanRows[0].map(normalizeSpreadsheetHeader);
  return cleanRows.slice(1, maxSpreadsheetRows + 1)
    .map((cells, index) => {
      const raw = Object.fromEntries(headers.map((header, cellIndex) => [header, cells[cellIndex] ?? ""]));
      return normalizeSpreadsheetRow({ ...raw, raw, rowNumber: index + 2 }, index);
    })
    .filter((row) => row.vendorName || row.amount || row.description || row.invoiceNumber);
}

function parseCsvSpreadsheetRows(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .slice(0, maxSpreadsheetRows + 1);

  if (lines.length < 2) return [];
  return rowsFromMatrix(lines.map(parseCsvLine));
}

function decodeXmlEntities(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function xmlAttr(attrs, name) {
  const match = String(attrs || "").match(new RegExp(`\\b${name}="([^"]*)"`, "i"));
  return match ? decodeXmlEntities(match[1]) : "";
}

function stripXmlTags(value) {
  return decodeXmlEntities(String(value || "").replace(/<[^>]+>/g, ""));
}

function findXlsxEocd(buffer) {
  const minOffset = Math.max(0, buffer.length - 65557);
  for (let offset = buffer.length - 22; offset >= minOffset; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) return offset;
  }
  return -1;
}

function readXlsxEntries(buffer) {
  const eocdOffset = findXlsxEocd(buffer);
  if (eocdOffset < 0) return new Map();

  const entryCount = buffer.readUInt16LE(eocdOffset + 10);
  const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);
  const entries = new Map();
  let offset = centralDirectoryOffset;
  let inflatedBytes = 0;

  for (let index = 0; index < entryCount && offset < buffer.length; index += 1) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) break;

    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    const fileNameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const fileName = buffer.toString("utf8", offset + 46, offset + 46 + fileNameLength).replace(/\\/g, "/");
    offset += 46 + fileNameLength + extraLength + commentLength;

    const wanted = fileName === "xl/sharedStrings.xml" || /^xl\/worksheets\/sheet\d+\.xml$/i.test(fileName);
    if (!wanted || uncompressedSize > maxXlsxXmlEntryBytes || inflatedBytes + uncompressedSize > maxXlsxInflatedBytes) continue;
    if (buffer.readUInt32LE(localHeaderOffset) !== 0x04034b50) continue;

    const localFileNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + localFileNameLength + localExtraLength;
    const compressed = buffer.subarray(dataStart, dataStart + compressedSize);

    try {
      const inflated = method === 0
        ? compressed
        : method === 8
          ? zlib.inflateRawSync(compressed)
          : null;
      if (!inflated || inflated.length > maxXlsxXmlEntryBytes) continue;
      inflatedBytes += inflated.length;
      entries.set(fileName, inflated.toString("utf8"));
    } catch {
      // Ignore malformed workbook parts; signature validation already accepted the container.
    }
  }

  return entries;
}

function parseSharedStrings(xml = "") {
  return Array.from(xml.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/gi)).map((match) => {
    const textNodes = Array.from(match[1].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/gi)).map((textMatch) => stripXmlTags(textMatch[1]));
    return textNodes.join("");
  });
}

function columnIndexFromCellRef(ref) {
  const letters = String(ref || "").match(/^[A-Z]+/i)?.[0] || "";
  return letters.toUpperCase().split("").reduce((sum, letter) => (sum * 26) + letter.charCodeAt(0) - 64, 0) - 1;
}

function parseWorksheetMatrix(xml = "", sharedStrings = []) {
  const rows = [];
  for (const rowMatch of xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/gi)) {
    const cells = [];
    for (const cellMatch of rowMatch[1].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/gi)) {
      const attrs = cellMatch[1];
      const body = cellMatch[2];
      const cellIndex = Math.max(0, columnIndexFromCellRef(xmlAttr(attrs, "r")));
      const type = xmlAttr(attrs, "t");
      const value = body.match(/<v\b[^>]*>([\s\S]*?)<\/v>/i)?.[1] || "";
      const inlineValue = body.match(/<t\b[^>]*>([\s\S]*?)<\/t>/i)?.[1] || "";
      cells[cellIndex] = type === "s"
        ? sharedStrings[Number.parseInt(value, 10)] || ""
        : type === "inlineStr"
          ? stripXmlTags(inlineValue)
          : stripXmlTags(value);
    }
    if (cells.some(Boolean)) rows.push(cells);
    if (rows.length > maxSpreadsheetRows + 1) break;
  }
  return rows;
}

function parseXlsxSpreadsheetRows(buffer) {
  const entries = readXlsxEntries(buffer);
  const sharedStrings = parseSharedStrings(entries.get("xl/sharedStrings.xml") || "");
  const sheetName = Array.from(entries.keys()).find((name) => /^xl\/worksheets\/sheet\d+\.xml$/i.test(name));
  if (!sheetName) return [];

  return rowsFromMatrix(parseWorksheetMatrix(entries.get(sheetName), sharedStrings));
}

function parseSpreadsheetRows({ kind, text, buffer }) {
  if (kind === "CSV") return parseCsvSpreadsheetRows(text);
  if (kind === "Excel" && buffer && isZipContainer(buffer)) return parseXlsxSpreadsheetRows(buffer);
  return [];
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
  return safeEvidenceFileName(name)
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
function buildLocalExtraction({ fileName, kind, text, buffer = null }) {
  const csvRows = kind === "CSV" ? parseCsvSample(text) : [];
  const spreadsheetRows = parseSpreadsheetRows({ kind, text, buffer });
  const firstRow = csvRows[0] ?? {};
  const vendorFromCsv = spreadsheetRows[0]?.vendorName || findField(firstRow, ["vendor", "supplier", "merchant", "company"]);
  const amountValues = spreadsheetRows.length
    ? spreadsheetRows.map((row) => Number(row.amount || 0)).filter((value) => Number.isFinite(value))
    : csvRows
      .map((row) => findField(row, ["amount", "total", "price", "cost", "spend"]))
      .map(numberFromMoney)
      .filter((value) => value !== null);
  const total = amountValues.length ? amountValues.reduce((sum, value) => sum + value, 0) : null;
  const moneyMatch = text.match(/(?:[$]\s?\d[\d,]*(?:\.\d{2})?|\d[\d,]*(?:\.\d{2})?\s?(?:USD|EUR|GBP))/i)?.[0];
  const dates = extractDates(text);
  const noticePeriod = extractNotice(text);
  const firstInvoiceNumber = spreadsheetRows.find((row) => row.invoiceNumber)?.invoiceNumber;

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
    invoice_number: firstInvoiceNumber || text.match(/\b(?:invoice|inv)[\s#:.-]*([a-z0-9-]{3,})\b/i)?.[1] || null,
    invoice_total: total,
    line_items_summary: spreadsheetRows.length
      ? `${spreadsheetRows.length} spreadsheet rows parsed for workspace review`
      : csvRows.length ? `${csvRows.length} CSV rows sampled` : null,
    spreadsheet_rows: spreadsheetRows,
    spreadsheet_row_count: spreadsheetRows.length,
    spreadsheet_amount_total: total ?? 0,
    spreadsheet_parse_status: spreadsheetRows.length ? "parsed" : kind === "CSV" || kind === "Excel" ? "no_rows_detected" : "not_spreadsheet",
    risk_summary: "Needs human review before any action is created.",
    evidence_snippets: text
      ? text.split(/\r?\n/).filter(Boolean).slice(0, 3)
      : spreadsheetRows.slice(0, 3).map((row) => `${row.vendorName || row.description}: ${row.amount} ${row.currency}`),
    confidence: text || spreadsheetRows.length ? 45 : 25,
  };
}

// Merges AI output over fallback fields while preserving safe defaults.
function normalizeExtraction(data, fallback) {
  const source = data && typeof data === "object" ? data : {};
  const spreadsheetRows = (Array.isArray(source.spreadsheet_rows) ? source.spreadsheet_rows : fallback.spreadsheet_rows || [])
    .slice(0, maxSpreadsheetRows)
    .map(normalizeSpreadsheetRow);
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
    spreadsheet_rows: spreadsheetRows,
    spreadsheet_row_count: spreadsheetRows.length,
    spreadsheet_amount_total: spreadsheetRows.reduce((sum, row) => sum + Number(row.amount || 0), 0),
    spreadsheet_parse_status: spreadsheetRows.length
      ? "parsed"
      : source.spreadsheet_parse_status || fallback.spreadsheet_parse_status,
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

function canUseLocalSpreadsheetExtraction({ kind, extraction }) {
  return (kind === "CSV" || kind === "Excel")
    && Number(extraction?.spreadsheet_row_count || 0) > 0
    && Array.isArray(extraction?.spreadsheet_rows)
    && extraction.spreadsheet_rows.length > 0;
}

function localSpreadsheetExtractionResult(kind) {
  return {
    provider: "local",
    providerStatus: "ready",
    model: `${kind.toLowerCase()}-spreadsheet-parser`,
    data: null,
    error: null,
  };
}

// Shared record builder for uploaded files and URL/text sources.
async function createEvidenceRecord({ name, source, kind, mimeType, bytes = 0, buffer = null, text = "", url = null }) {
  const localExtraction = buildLocalExtraction({ fileName: name, kind, text, buffer });
  const geminiExtraction = canUseLocalSpreadsheetExtraction({ kind, extraction: localExtraction })
    ? localSpreadsheetExtractionResult(kind)
    : await extractEvidenceWithGemini({
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
    size: bytes ? evidenceFileSizeLabel(bytes) : "URL",
    sizeLabel: bytes ? evidenceFileSizeLabel(bytes) : "URL",
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
  const name = safeEvidenceFileName(file.name);
  const extension = extensionFromEvidenceName(name);

  if (!supportedEvidenceExtensions.includes(extension)) {
    throw new EvidenceUploadError(`${name} is not supported. Use PDF, CSV, XLSX, DOCX, TXT, PNG, JPG, or WEBP.`, 415);
  }

  if (file.size > maxEvidenceUploadBytes) {
    throw new EvidenceUploadError(`${name} is too large. Upload files under 20 MB.`, 413);
  }

  const mimeType = mimeTypeForFile(file, name);
  const buffer = Buffer.from(await file.arrayBuffer());
  assertEvidenceFileSignature({ buffer, extension, name });
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
    console.warn(`[GENIUS storage] raw evidence stored locally only for ${name}: ${error?.message || String(error)}`);
    return {
      ...record,
      extracted: {
        ...record.extracted,
        storage_status: "local_fallback",
      },
    };
  }
}

// URL analysis uses fetched page text as evidence and flows through the same review pipeline.
export async function analyzeEvidenceTextSource({ name, source = "URL Analysis", kind = "URL", text, url }) {
  return await createEvidenceRecord({
    name: safeEvidenceFileName(name),
    source,
    kind,
    mimeType: "text/plain",
    bytes: Buffer.byteLength(text || "", "utf8"),
    text: String(text || "").slice(0, maxEvidenceDecodedTextChars),
    url,
  });
}

export function validateEvidenceUploadBatch(files = []) {
  const validation = validateEvidenceUploadSelection(files);
  if (!validation.ok) {
    throw new EvidenceUploadError(validation.error, validation.status);
  }
  return validation.files;
}
