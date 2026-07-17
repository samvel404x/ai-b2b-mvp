import {
  disableWorkspaceMember,
  getWorkspaceSnapshot,
  inviteWorkspaceMember,
  updateWorkspaceMember,
} from "../../../../lib/server/evidence-store";
import {
  publicSession,
  requireRequestCapability,
  requireRequestWorkspaceContext,
  sessionRequiredResponse,
} from "../../../../lib/server/auth-session";
import { publicMember } from "../../../../lib/server/authorization";
import { guardMutationRequest } from "../../../../lib/server/request-security";

export const runtime = "nodejs";

function memberHeaders() {
  return { "Cache-Control": "private, no-store" };
}

function readTargetFromRequest(request, body = {}) {
  const url = new URL(request.url);
  return {
    id: body.id || url.searchParams.get("id"),
    email: body.email || url.searchParams.get("email"),
  };
}

function isCurrentMember(target, context) {
  const email = String(target?.email || "").trim().toLowerCase();
  const id = String(target?.id || target?.userId || "").trim();
  return Boolean(
    (email && email === context.member.email)
    || (id && id === context.member.userId),
  );
}

function badRequest(message) {
  return Response.json(
    { error: message, code: "BAD_REQUEST" },
    { status: 400, headers: memberHeaders() },
  );
}

// Lists the normalized workspace roster for the signed-in tenant.
export async function GET(request) {
  const context = await requireRequestWorkspaceContext(request);
  if (!context) return sessionRequiredResponse();

  const workspace = await getWorkspaceSnapshot({ workspaceId: context.workspaceId });
  return Response.json(
    {
      members: workspace.members || [],
      currentMember: publicMember(context.member),
      session: publicSession(context.session),
    },
    { headers: memberHeaders() },
  );
}

// Creates or refreshes a persisted workspace invite/member record.
export async function POST(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "members:post", limit: 30, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const { context, response } = await requireRequestCapability(request, "manage_members");
  if (response) return response;

  try {
    const body = await request.json().catch(() => ({}));
    const result = await inviteWorkspaceMember(body, context.actor, { workspaceId: context.workspaceId });
    if (result.invite?.token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("invite", result.invite.token);
      result.invite.url = url.toString();
    }
    return Response.json(result, { headers: memberHeaders() });
  } catch (error) {
    return badRequest(error.message || "Member invite failed.");
  }
}

// Updates role, department, position, or status for an existing member.
export async function PATCH(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "members:patch", limit: 60, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const { context, response } = await requireRequestCapability(request, "manage_members");
  if (response) return response;

  try {
    const body = await request.json().catch(() => ({}));
    const target = readTargetFromRequest(request, body);
    if (isCurrentMember(target, context) && (body.status === "disabled" || body.role)) {
      return badRequest("You cannot change your own role or disable your own member from this session.");
    }

    const result = await updateWorkspaceMember(target, {
      role: body.role,
      position: body.position,
      department: body.department,
      status: body.status,
    }, context.actor, { workspaceId: context.workspaceId });
    if (!result) return badRequest("Workspace member was not found.");

    return Response.json(result, { headers: memberHeaders() });
  } catch (error) {
    return badRequest(error.message || "Member update failed.");
  }
}

// Disables a member instead of hard-deleting the audit subject.
export async function DELETE(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "members:delete", limit: 30, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const { context, response } = await requireRequestCapability(request, "manage_members");
  if (response) return response;

  try {
    const body = await request.json().catch(() => ({}));
    const target = readTargetFromRequest(request, body);
    if (isCurrentMember(target, context)) {
      return badRequest("You cannot disable your own member from this session.");
    }

    const result = await disableWorkspaceMember(target, context.actor, { workspaceId: context.workspaceId });
    if (!result) return badRequest("Workspace member was not found.");

    return Response.json(result, { headers: memberHeaders() });
  } catch (error) {
    return badRequest(error.message || "Member disable failed.");
  }
}
