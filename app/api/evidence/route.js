import { analyzeEvidenceFile, EvidenceUploadError } from "../../../lib/server/evidence-analysis";
import { clearEvidenceRecords, listEvidenceRecords, saveEvidenceRecords } from "../../../lib/server/evidence-store";

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
export async function GET() {
  const evidence = await listEvidenceRecords();
  return Response.json({ evidence });
}

// Uploads files, runs extraction, stores review records, and returns them to the UI.
export async function POST(request) {
  try {
    const formData = await request.formData();
    const source = String(formData.get("source") || "Data Intake");
    const files = filesFromFormData(formData);

    if (!files.length) {
      return jsonError("Attach at least one evidence file.", 400);
    }

    const analyzed = [];
    for (const file of files) {
      analyzed.push(await analyzeEvidenceFile(file, source));
    }

    await saveEvidenceRecords(analyzed);

    return Response.json({
      evidence: analyzed,
      providerStatuses: analyzed.map((record) => record.providerStatus),
    });
  } catch (error) {
    if (error instanceof EvidenceUploadError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Evidence extraction failed.", 500, error.message);
  }
}

// Clears all local evidence for the current single-user MVP workspace.
export async function DELETE() {
  await clearEvidenceRecords();
  return Response.json({ ok: true });
}
