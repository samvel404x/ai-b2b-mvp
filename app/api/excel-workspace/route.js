import { requireRequestCapability, requireRequestWorkspaceContext, sessionRequiredResponse } from "../../../lib/server/auth-session";
import { getWorkspaceSnapshot, saveExcelWorkspaceView } from "../../../lib/server/evidence-store";
import { guardMutationRequest } from "../../../lib/server/request-security";

export const runtime = "nodejs";

function viewSummary(view) {
  return {
    id: view.id,
    workbookName: view.workbookName,
    sheetName: view.sheetName,
    tabs: Array.isArray(view.tabs) ? view.tabs : [],
    activeTabId: view.activeTabId,
    filters: view.filters || {},
    visibleColumnIds: Array.isArray(view.visibleColumnIds) ? view.visibleColumnIds : [],
    searchQuery: view.searchQuery || "",
    rowsPerPage: view.rowsPerPage || 12,
    selectedRowIds: Array.isArray(view.selectedRowIds) ? view.selectedRowIds : [],
    note: view.note || "",
    status: view.status || "saved",
    metrics: view.metrics || {},
    savedBy: view.savedBy
      ? {
          role: view.savedBy.role || "Member",
          position: view.savedBy.position || "",
          department: view.savedBy.department || "",
        }
      : null,
    updatedBy: view.updatedBy || "",
    createdAt: view.createdAt || null,
    updatedAt: view.updatedAt || null,
  };
}

export async function GET(request) {
  const context = await requireRequestWorkspaceContext(request);
  if (!context) return sessionRequiredResponse();

  const workspace = await getWorkspaceSnapshot({ workspaceId: context.workspaceId });
  const views = (workspace.excelWorkspaceViews || []).map(viewSummary);

  return Response.json(
    {
      count: views.length,
      latest: views[0] || null,
      views,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "excel-workspace:post", limit: 60, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const { context, response } = await requireRequestCapability(request, "upload_evidence");
  if (response) return response;

  const body = await request.json().catch(() => ({}));

  try {
    const result = await saveExcelWorkspaceView(
      body,
      { actor: context.actor, member: context.member },
      { workspaceId: context.workspaceId },
    );

    return Response.json(
      {
        workspace: result.workspace,
        view: viewSummary(result.view),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return Response.json(
      { error: error.message || "Excel workspace view could not be saved." },
      {
        status: 400,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  }
}
