import { analyzeEvidenceFile, EvidenceUploadError, validateEvidenceUploadBatch } from "../../../lib/server/evidence-analysis";
import { clearEvidenceRecords, listEvidenceRecords, saveEvidenceRecords } from "../../../lib/server/evidence-store";
import { requireRequestCapability, requireRequestWorkspaceContext, sessionRequiredResponse } from "../../../lib/server/auth-session";
import { deleteEvidenceFiles } from "../../../lib/server/supabase-file-store";
import { evidenceUploadPolicy } from "../../../lib/evidence-upload-policy";
import { guardMutationRequest } from "../../../lib/server/request-security";

export const runtime = "nodejs";

// Normalizes API errors so the frontend can show a stable pipeline message.
function jsonError(message, status = 500, details = undefined) {
  return Response.json(
    { error: message, details },
    { status, headers: { "Cache-Control": "private, no-store" } },
  );
}

// Extracts only real uploaded File objects from multipart form data.
function filesFromFormData(formData) {
  return formData
    .getAll("files")
    .filter((value) => {
      return value && typeof value === "object" && typeof value.arrayBuffer === "function";
    });
}

// Hydrates the Data Room with locally saved MVP evidence.
export async function GET(request) {
  const context = await requireRequestWorkspaceContext(request);
  if (!context) return sessionRequiredResponse();
  const evidence = await listEvidenceRecords({ workspaceId: context.workspaceId });
  return Response.json(
    { evidence, uploadPolicy: evidenceUploadPolicy },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

// Uploads files, runs extraction, stores review records, and returns them to the UI.
export async function POST(request) {
  const guard = guardMutationRequest(request, {
    keyPrefix: "evidence:upload",
    limit: 30,
    windowMs: 10 * 60_000,
    maxBodyBytes: evidenceUploadPolicy.maxBatchBytes + 5 * 1024 * 1024,
  });
  if (guard) return guard;

  const analyzed = [];
  const { context, response } = await requireRequestCapability(request, "upload_evidence");
  if (response) return response;

  try {
    const formData = await request.formData();
    const source = String(formData.get("source") || "Data Intake").trim().slice(0, 120) || "Data Intake";
    const files = validateEvidenceUploadBatch(filesFromFormData(formData));

    if (!files.length) {
      return jsonError("Attach at least one evidence file.", 400);
    }

    for (const file of files) {
      analyzed.push(await analyzeEvidenceFile(file, source, { workspaceId: context.workspaceId }));
    }

    await saveEvidenceRecords(analyzed, { workspaceId: context.workspaceId, actor: context.actor });

    return Response.json(
      {
        evidence: analyzed,
        providerStatuses: analyzed.map((record) => record.providerStatus),
        uploadPolicy: evidenceUploadPolicy,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    // If persistence fails after raw object upload, remove those private objects on a best-effort basis.
    await deleteEvidenceFiles(analyzed);

    if (error instanceof EvidenceUploadError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Evidence extraction failed.", 500, error.message);
  }
}

// Clears all local evidence for the current single-user MVP workspace.
export async function DELETE(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "evidence:delete", limit: 10, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const { context, response } = await requireRequestCapability(request, "delete_evidence");
  if (response) return response;
  await clearEvidenceRecords({ workspaceId: context.workspaceId });
  return Response.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
}
