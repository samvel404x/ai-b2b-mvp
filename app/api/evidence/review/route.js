import { getRequestWorkspaceContext } from "../../../../lib/server/auth-session";
import { bulkReviewEvidenceRecords } from "../../../../lib/server/evidence-store";

export const runtime = "nodejs";

const allowedStatuses = new Set(["Needs review", "Confirmed", "Excluded"]);

function cleanIds(value) {
  return (Array.isArray(value) ? value : [])
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, 250);
}

function cleanFieldsById(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value).map(([id, fields]) => [
      String(id),
      fields && typeof fields === "object" && !Array.isArray(fields)
        ? Object.fromEntries(Object.entries(fields).map(([key, fieldValue]) => [String(key), String(fieldValue ?? "").trim()]))
        : {},
    ]),
  );
}

// Bulk review endpoint: confirms or excludes extracted evidence before agents rely on it.
export async function POST(request) {
  const context = getRequestWorkspaceContext(request);
  const body = await request.json().catch(() => ({}));
  const ids = cleanIds(body.ids);
  const status = String(body.status || "");

  if (!ids.length) {
    return Response.json({ error: "At least one evidence id is required." }, { status: 400 });
  }

  if (!allowedStatuses.has(status)) {
    return Response.json({ error: "Unsupported evidence review status." }, { status: 400 });
  }

  const workspace = await bulkReviewEvidenceRecords(
    {
      ids,
      status,
      fieldsById: cleanFieldsById(body.fieldsById),
      actor: context.actor,
    },
    { workspaceId: context.workspaceId },
  );

  if (!workspace) {
    return Response.json({ error: "No evidence records were updated." }, { status: 404 });
  }

  return Response.json({ workspace, evidence: workspace.evidence || [] });
}
