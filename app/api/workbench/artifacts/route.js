import { requireRequestCapability } from "../../../../lib/server/auth-session";
import { saveWorkbenchArtifact } from "../../../../lib/server/evidence-store";
import { guardMutationRequest } from "../../../../lib/server/request-security";

export const runtime = "nodejs";

function artifactSummary(artifact) {
  if (!artifact) return null;

  return {
    id: artifact.id,
    type: artifact.type,
    title: artifact.title,
    content: artifact.content,
    status: artifact.status,
    source: artifact.source,
    metrics: artifact.metrics || {},
    recommendations: Array.isArray(artifact.recommendations) ? artifact.recommendations : [],
    owner: artifact.owner || {},
    metadata: artifact.metadata || {},
    createdAt: artifact.createdAt,
    updatedAt: artifact.updatedAt,
  };
}

export async function POST(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "workbench:artifacts:post", limit: 50, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const { context, response } = await requireRequestCapability(request, "ask_ai");
  if (response) return response;

  const body = await request.json().catch(() => ({}));

  try {
    const result = await saveWorkbenchArtifact(
      body,
      { actor: context.actor, member: context.member },
      { workspaceId: context.workspaceId },
    );

    return Response.json(
      {
        workspace: result.workspace,
        artifact: artifactSummary(result.artifact),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return Response.json({ error: error.message || "Workbench artifact could not be saved." }, { status: 400 });
  }
}
