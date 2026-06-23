import { analyzeEvidenceFile, EvidenceUploadError } from "../../../lib/server/evidence-analysis";
import { clearEvidenceRecords, listEvidenceRecords, saveEvidenceRecords } from "../../../lib/server/evidence-store";
import { getRequestWorkspaceContext } from "../../../lib/server/auth-session";
import { deleteEvidenceFiles } from "../../../lib/server/supabase-file-store";

export const runtime = "nodejs";

// Normalizes API errors so the frontend can show a stable pipeline message.
function jsonError(message, status = 500, details = undefined) {
  return Response.json({ error: message, details }, { status });
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
  const context = getRequestWorkspaceContext(request);
  const evidence = await listEvidenceRecords({ workspaceId: context.workspaceId });
  return Response.json({ evidence });
}

// Uploads files, runs extraction, stores review records, and returns them to the UI.
export async function POST(request) {
  const analyzed = [];

  try {
    const context = getRequestWorkspaceContext(request);
    const formData = await request.formData();
    const source = String(formData.get("source") || "Data Intake");
    const files = filesFromFormData(formData);

    if (!files.length) {
      return jsonError("Attach at least one evidence file.", 400);
    }

    for (const file of files) {
      analyzed.push(await analyzeEvidenceFile(file, source, { workspaceId: context.workspaceId }));
    }

    await saveEvidenceRecords(analyzed, { workspaceId: context.workspaceId });

    return Response.json({
      evidence: analyzed,
      providerStatuses: analyzed.map((record) => record.providerStatus),
    });
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
  const context = getRequestWorkspaceContext(request);
  await clearEvidenceRecords({ workspaceId: context.workspaceId });
  return Response.json({ ok: true });
}
