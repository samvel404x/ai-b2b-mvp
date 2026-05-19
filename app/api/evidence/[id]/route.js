import { deleteEvidenceRecord, updateEvidenceRecord } from "../../../../lib/server/evidence-store";
import { getRequestWorkspaceContext } from "../../../../lib/server/auth-session";

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
  const { id } = await context.params;
  const workspaceContext = getRequestWorkspaceContext(request);
  const body = await request.json().catch(() => ({}));
  const fields = cleanReviewedFields(body.fields);

  if (!fields) {
    return Response.json({ error: "Reviewed fields are required." }, { status: 400 });
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
    return Response.json({ error: "Evidence record not found." }, { status: 404 });
  }

  return Response.json({ evidence: record });
}

// Deletes one evidence record from the local MVP workspace.
export async function DELETE(_request, context) {
  const { id } = await context.params;
  const workspaceContext = getRequestWorkspaceContext(_request);
  const deleted = await deleteEvidenceRecord(id, { workspaceId: workspaceContext.workspaceId });

  if (!deleted) {
    return Response.json({ error: "Evidence record not found." }, { status: 404 });
  }

  return Response.json({ ok: true });
}
