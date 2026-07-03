import { getRequestWorkspaceContext } from "../../../../lib/server/auth-session";
import { getWorkspaceSnapshot } from "../../../../lib/server/evidence-store";
import { buildReportDetail, reportExportFilename, serializeReportDetail } from "../../../../lib/server/report-engine";

export const runtime = "nodejs";

const supportedFormats = new Set(["json", "csv", "markdown"]);

// Returns a board-pack report detail or an export file generated from the current workspace state.
export async function GET(request, context) {
  const { id } = await context.params;
  const url = new URL(request.url);
  const format = url.searchParams.get("format");
  const workspaceContext = getRequestWorkspaceContext(request);
  const workspace = await getWorkspaceSnapshot({ workspaceId: workspaceContext.workspaceId });
  const detail = buildReportDetail(workspace, id);

  if (!detail) {
    return Response.json({ error: "Report not found." }, { status: 404 });
  }

  if (!format) {
    return Response.json(detail, { headers: { "Cache-Control": "private, no-store" } });
  }

  if (!supportedFormats.has(format)) {
    return Response.json({ error: "Unsupported report format. Use json, csv, or markdown." }, { status: 400 });
  }

  const serialized = serializeReportDetail(detail, format);
  return new Response(serialized.body, {
    headers: {
      "Content-Type": serialized.contentType,
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="${reportExportFilename(detail.report, format)}"`,
    },
  });
}
