import { getRequestWorkspaceContext } from "../../../../lib/server/auth-session";
import { getWorkspaceSnapshot } from "../../../../lib/server/evidence-store";

export const runtime = "nodejs";

const supportedFormats = new Set(["json", "csv"]);

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function filenameDate() {
  return new Date().toISOString().slice(0, 10);
}

function exportableRecord(record) {
  const fields = record.fields && typeof record.fields === "object" ? record.fields : {};
  const extracted = record.extracted && typeof record.extracted === "object" ? record.extracted : {};

  return {
    id: record.id,
    name: record.name,
    kind: record.kind,
    source: record.source,
    status: record.status,
    provider: record.provider,
    providerStatus: record.providerStatus,
    model: record.model,
    confidence: record.confidence || 0,
    vendor: fields.vendor || extracted.vendor_name || "",
    owner: fields.owner || extracted.owner || "",
    renewal: fields.renewal || extracted.renewal_date || extracted.end_date || "",
    notice: fields.notice || extracted.notice_period_days || "",
    value: fields.value || extracted.contract_value || extracted.invoice_total || "",
    documentType: extracted.document_type || "",
    invoiceNumber: extracted.invoice_number || "",
    paymentTerms: extracted.payment_terms || "",
    reviewedAt: record.reviewedAt || "",
    createdAt: record.createdAt || "",
    updatedAt: record.updatedAt || "",
  };
}

function filterRecords(records, scope) {
  if (scope === "all") return records;
  if (scope === "reviewed") return records.filter((record) => record.status === "Confirmed" || record.status === "Excluded");
  return records.filter((record) => record.status === "Confirmed");
}

function toCsv(records) {
  const columns = [
    "id",
    "name",
    "kind",
    "source",
    "status",
    "provider",
    "providerStatus",
    "model",
    "confidence",
    "vendor",
    "owner",
    "renewal",
    "notice",
    "value",
    "documentType",
    "invoiceNumber",
    "paymentTerms",
    "reviewedAt",
    "createdAt",
    "updatedAt",
  ];
  const rows = [
    columns.map(csvCell).join(","),
    ...records.map((record) => columns.map((column) => csvCell(record[column])).join(",")),
  ];

  return `${rows.join("\n")}\n`;
}

// Exports reviewed extracted data for spreadsheets, CRM import, or investor QA.
export async function GET(request) {
  const url = new URL(request.url);
  const format = url.searchParams.get("format") || "json";
  const scope = url.searchParams.get("scope") || "confirmed";

  if (!supportedFormats.has(format)) {
    return Response.json({ error: "Unsupported evidence export format. Use json or csv." }, { status: 400 });
  }

  const context = getRequestWorkspaceContext(request);
  const workspace = await getWorkspaceSnapshot({ workspaceId: context.workspaceId });
  const records = filterRecords(workspace.evidence || [], scope).map(exportableRecord);

  if (format === "csv") {
    return new Response(toCsv(records), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="genius-extracted-data-${scope}-${filenameDate()}.csv"`,
      },
    });
  }

  return Response.json(
    {
      generatedAt: new Date().toISOString(),
      workspaceId: workspace.id,
      scope,
      count: records.length,
      records,
    },
    {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="genius-extracted-data-${scope}-${filenameDate()}.json"`,
      },
    },
  );
}
