import { deleteEvidenceRecord, updateEvidenceRecord } from "../../../../lib/server/evidence-store";
import { requireRequestCapability } from "../../../../lib/server/auth-session";
import { guardMutationRequest } from "../../../../lib/server/request-security";

export const runtime = "nodejs";

// Accepts only simple string-like review fields from the browser.
function cleanReviewedFields(fields) {
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) return null;

  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => {
      return [String(key), String(value ?? "").trim()];
    }),
  );
}

// Saves human-confirmed extraction fields and marks the record as safe to use downstream.
export async function POST(request, context) {
  const guard = guardMutationRequest(request, { keyPrefix: "evidence:item:post", limit: 80, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const { context: workspaceContext, response } = await requireRequestCapability(request, "review_evidence");
  if (response) return response;

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const fields = cleanReviewedFields(body.fields);

  if (!fields) {
    return Response.json(
      { error: "Reviewed fields are required." },
      { status: 400, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const record = await updateEvidenceRecord(
    id,
    {
      fields,
      status: "Confirmed",
      reviewedAt: new Date().toISOString(),
    },
    { workspaceId: workspaceContext.workspaceId },
  );

  if (!record) {
    return Response.json(
      { error: "Evidence record not found." },
      { status: 404, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  return Response.json(
    { evidence: record },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

// Deletes one evidence record from the local MVP workspace.
export async function DELETE(_request, context) {
  const guard = guardMutationRequest(_request, { keyPrefix: "evidence:item:delete", limit: 40, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const { context: workspaceContext, response } = await requireRequestCapability(_request, "delete_evidence");
  if (response) return response;

  const { id } = await context.params;
  const deleted = await deleteEvidenceRecord(id, { workspaceId: workspaceContext.workspaceId });

  if (!deleted) {
    return Response.json(
      { error: "Evidence record not found." },
      { status: 404, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  return Response.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
}
