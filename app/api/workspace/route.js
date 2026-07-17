import { clearWorkspaceData, getWorkspaceSnapshot } from "../../../lib/server/evidence-store";
import { isGuestWorkspaceId, publicSession, requireRequestCapability, requireRequestWorkspaceContext, sessionRequiredResponse } from "../../../lib/server/auth-session";
import { isSupabaseWorkspaceStoreConfigured } from "../../../lib/server/supabase-workspace-store";
import { guardMutationRequest } from "../../../lib/server/request-security";

export const runtime = "nodejs";

function backendStatus(workspaceId) {
  const localOnly = isGuestWorkspaceId(workspaceId);
  const liveIngestTokenConfigured = Boolean(
    process.env.GENIUS_LIVE_INGEST_SECRET
    || (process.env.GENIUS_LIVE_INGEST_TOKEN && process.env.GENIUS_LIVE_INGEST_WORKSPACE_ID),
  );
  return {
    storage: !localOnly && isSupabaseWorkspaceStoreConfigured() ? "supabase" : "local",
    aiProvider: "Gemini",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY),
    liveIngestTokenConfigured,
    externalExecution: "disabled",
  };
}

// Returns the backend source of truth for every working section.
export async function GET(request) {
  const context = await requireRequestWorkspaceContext(request);
  if (!context) return sessionRequiredResponse();
  const workspace = await getWorkspaceSnapshot({ workspaceId: context.workspaceId });
  return Response.json(
    {
      workspace,
      session: publicSession(context.session),
      backend: backendStatus(context.workspaceId),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

// Deletes the current workspace data set. External systems are untouched in the MVP.
export async function DELETE(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "workspace:reset", limit: 8, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const { context, response } = await requireRequestCapability(request, "reset_workspace");
  if (response) return response;
  const workspace = await clearWorkspaceData(context.actor, { workspaceId: context.workspaceId });
  return Response.json(
    {
      workspace,
      session: publicSession(context.session),
      backend: backendStatus(context.workspaceId),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
