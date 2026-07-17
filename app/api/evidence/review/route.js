import { requireRequestCapability } from "../../../../lib/server/auth-session";
import { bulkReviewEvidenceRecords } from "../../../../lib/server/evidence-store";
import { guardMutationRequest } from "../../../../lib/server/request-security";

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
  const guard = guardMutationRequest(request, { keyPrefix: "evidence:review", limit: 80, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const { context, response } = await requireRequestCapability(request, "review_evidence");
  if (response) return response;
  const body = await request.json().catch(() => ({}));
  const ids = cleanIds(body.ids);
  const status = String(body.status || "");

  if (!ids.length) {
    return Response.json(
      { error: "At least one evidence id is required." },
      { status: 400, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  if (!allowedStatuses.has(status)) {
    return Response.json(
      { error: "Unsupported evidence review status." },
      { status: 400, headers: { "Cache-Control": "private, no-store" } },
    );
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
    return Response.json(
      { error: "No evidence records were updated." },
      { status: 404, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  return Response.json(
    { workspace, evidence: workspace.evidence || [] },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
