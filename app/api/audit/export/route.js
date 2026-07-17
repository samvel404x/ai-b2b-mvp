import { requireRequestCapability } from "../../../../lib/server/auth-session";
import { getWorkspaceSnapshot } from "../../../../lib/server/evidence-store";
import { applyRateLimit } from "../../../../lib/server/request-security";

export const runtime = "nodejs";

const supportedFormats = new Set(["json", "csv"]);

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function filenameDate() {
  return new Date().toISOString().slice(0, 10);
}

function decisionRows(actions = []) {
  return actions.flatMap((action) => {
    const history = Array.isArray(action.decisionHistory) ? action.decisionHistory : [];
    return history.map((decision) => ({
      type: "approval_decision",
      id: decision.id || `${action.id}:${decision.createdAt || "decision"}`,
      actor: decision.actor || "user",
      actionId: action.id,
      actionTitle: action.title,
      status: decision.status || action.status,
      note: decision.note || "",
      createdAt: decision.createdAt || action.lastDecisionAt || "",
      details: {
        impact: action.impact || 0,
        owner: action.owner || "",
        proofTrailId: action.proofTrailId || "",
        findingId: action.findingId || "",
      },
    }));
  });
}

function auditRows(workspace) {
  const auditLog = Array.isArray(workspace.auditLog) ? workspace.auditLog : [];
  return [
    ...auditLog.map((event) => ({
      type: event.type || "audit_event",
      id: event.id,
      actor: event.actor || "system",
      actionId: event.details?.actionId || "",
      actionTitle: "",
      status: event.details?.status || "",
      note: event.details?.note || "",
      createdAt: event.createdAt || "",
      details: event.details || {},
    })),
    ...decisionRows(workspace.actions || []),
  ].sort((a, b) => Date.parse(b.createdAt || 0) - Date.parse(a.createdAt || 0));
}

function toCsv(rows) {
  const columns = ["type", "id", "actor", "actionId", "actionTitle", "status", "note", "createdAt", "details"];
  return `${[
    columns.map(csvCell).join(","),
    ...rows.map((row) => columns.map((column) => csvCell(column === "details" ? JSON.stringify(row.details || {}) : row[column])).join(",")),
  ].join("\n")}\n`;
}

// Exports the human approval and audit trail for investor review or compliance QA.
export async function GET(request) {
  const guard = applyRateLimit(request, { keyPrefix: "audit:export:get", limit: 30, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const { context, response } = await requireRequestCapability(request, "export_data");
  if (response) return response;

  const url = new URL(request.url);
  const format = url.searchParams.get("format") || "json";

  if (!supportedFormats.has(format)) {
    return Response.json({ error: "Unsupported audit export format. Use json or csv." }, { status: 400 });
  }

  const workspace = await getWorkspaceSnapshot({ workspaceId: context.workspaceId });
  const rows = auditRows(workspace);

  if (format === "csv") {
    return new Response(toCsv(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="genius-audit-trail-${filenameDate()}.csv"`,
      },
    });
  }

  return Response.json(
    {
      generatedAt: new Date().toISOString(),
      workspaceId: workspace.id,
      count: rows.length,
      rows,
    },
    {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="genius-audit-trail-${filenameDate()}.json"`,
      },
    },
  );
}
