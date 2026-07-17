import { exportPortableWorkspace, importPortableWorkspace } from "../../../../lib/server/evidence-store";
import {
  publicSession,
  requireContextCapability,
  requireRequestWorkspaceContext,
  sessionRequiredResponse,
} from "../../../../lib/server/auth-session";
import { guardMutationRequest } from "../../../../lib/server/request-security";

export const runtime = "nodejs";

const maxImportBytes = 10 * 1024 * 1024;

function portableHeaders(extra = {}) {
  return {
    "Cache-Control": "private, no-store",
    ...extra,
  };
}

function portableFilename(workspaceId) {
  const safeId = String(workspaceId || "workspace").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);
  const date = new Date().toISOString().slice(0, 10);
  return `genius-${safeId}-${date}.json`;
}

// Downloads a portable workspace JSON file without auth/session secrets.
export async function GET(request) {
  const context = await requireRequestWorkspaceContext(request);
  if (!context) return sessionRequiredResponse();
  const denied = requireContextCapability(context, "export_data");
  if (denied) return denied;

  const portableWorkspace = await exportPortableWorkspace(context.actor, { workspaceId: context.workspaceId });
  return Response.json(portableWorkspace, {
    headers: portableHeaders({
      "Content-Disposition": `attachment; filename="${portableFilename(context.workspaceId)}"`,
    }),
  });
}

// Imports a portable workspace file into the current session's workspace.
export async function POST(request) {
  const guard = guardMutationRequest(request, {
    keyPrefix: "workspace:portable:import",
    limit: 8,
    windowMs: 10 * 60_000,
    maxBodyBytes: maxImportBytes + 1024,
  });
  if (guard) return guard;

  const context = await requireRequestWorkspaceContext(request);
  if (!context) return sessionRequiredResponse();
  const denied = requireContextCapability(context, "reset_workspace");
  if (denied) return denied;

  try {
    const raw = await request.text();
    if (!raw || raw.length > maxImportBytes) {
      return Response.json(
        { error: "Workspace import file is empty or too large.", code: "BAD_REQUEST" },
        { status: 400, headers: portableHeaders() },
      );
    }

    const payload = JSON.parse(raw);
    const workspace = await importPortableWorkspace(payload, context.actor, { workspaceId: context.workspaceId });

    return Response.json(
      {
        workspace,
        session: publicSession(context.session),
      },
      { headers: portableHeaders() },
    );
  } catch (error) {
    return Response.json(
      { error: error.message || "Workspace import failed.", code: "BAD_REQUEST" },
      { status: 400, headers: portableHeaders() },
    );
  }
}
