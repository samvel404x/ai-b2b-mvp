import { runLangflowDemoAgent, runSupervisedAgents, updateAgentRunStatus } from "../../../../lib/server/evidence-store";
import { requireRequestCapability } from "../../../../lib/server/auth-session";
import { guardMutationRequest } from "../../../../lib/server/request-security";

export const runtime = "nodejs";

// Refreshes supervised agent outputs from existing evidence; no autonomous external action is taken.
export async function POST(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "agents:run", limit: 30, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const { context: workspaceContext, response } = await requireRequestCapability(request, "run_agents");
  if (response) return response;
  const body = await request.json().catch(() => ({}));

  try {
    if (body.agentId === "langflow-demo" || body.agentId === "langflow") {
      const result = await runLangflowDemoAgent(body, workspaceContext, { workspaceId: workspaceContext.workspaceId });
      return Response.json(
        {
          workspace: result.workspace,
          artifact: result.artifact,
          runtime: result.runtime,
          output: result.output,
        },
        { headers: { "Cache-Control": "private, no-store" } },
      );
    }

    const workspace = await runSupervisedAgents(workspaceContext.actor, { workspaceId: workspaceContext.workspaceId });
    return Response.json({ workspace }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return Response.json(
      { error: error.message || "Agent run could not be started." },
      {
        status: 400,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  }
}

// Updates the supervised run lifecycle only; agents still cannot execute external changes.
export async function PATCH(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "agents:patch", limit: 60, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const { context: workspaceContext, response } = await requireRequestCapability(request, "run_agents");
  if (response) return response;
  const body = await request.json().catch(() => ({}));

  try {
    const result = await updateAgentRunStatus(body, workspaceContext, { workspaceId: workspaceContext.workspaceId });
    return Response.json(
      {
        workspace: result.workspace,
        agentRun: result.agentRun,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return Response.json(
      { error: error.message || "Agent run could not be updated." },
      {
        status: 400,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  }
}
