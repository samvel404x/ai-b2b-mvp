import { clearWorkspaceData, getWorkspaceSnapshot } from "../../../lib/server/evidence-store";
import { getRequestWorkspaceContext, publicSession } from "../../../lib/server/auth-session";
import { isSupabaseWorkspaceStoreConfigured } from "../../../lib/server/supabase-workspace-store";

export const runtime = "nodejs";

function backendStatus() {
  return {
    storage: isSupabaseWorkspaceStoreConfigured() ? "supabase" : "local",
    aiProvider: "Gemini",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY),
    liveIngestTokenConfigured: Boolean(process.env.GENIUS_LIVE_INGEST_TOKEN),
    externalExecution: "disabled",
  };
}

// Returns the backend source of truth for every working section.
export async function GET(request) {
  const context = getRequestWorkspaceContext(request);
  const workspace = await getWorkspaceSnapshot({ workspaceId: context.workspaceId });
  return Response.json(
    {
      workspace,
      session: publicSession(context.session),
      backend: backendStatus(),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

// Deletes the current workspace data set. External systems are untouched in the MVP.
export async function DELETE(request) {
  const context = getRequestWorkspaceContext(request);
  const workspace = await clearWorkspaceData(context.actor, { workspaceId: context.workspaceId });
  return Response.json(
    {
      workspace,
      session: publicSession(context.session),
      backend: backendStatus(),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
