import { createGuestAppSession, publicSession, sessionCookie } from "../../../../lib/server/auth-session";
import {
  getWorkspaceSnapshot,
  registerWorkspaceSession,
  updateWorkspaceSettings,
} from "../../../../lib/server/evidence-store";
import { guardMutationRequest } from "../../../../lib/server/request-security";

export const runtime = "nodejs";

function guestHeaders(session) {
  return {
    "Set-Cookie": sessionCookie(session),
    "Cache-Control": "private, no-store",
  };
}

// Creates a local-only guest workspace session. No Supabase Auth tokens are issued.
export async function POST(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "auth:guest", limit: 12, windowMs: 10 * 60_000 });
  if (guard) return guard;

  try {
    const body = await request.json().catch(() => ({}));
    const session = createGuestAppSession({
      position: body.position,
      department: body.department,
    });

    await updateWorkspaceSettings({
      workspaceName: body.workspaceName || "GENIUS Guest Workspace",
      role: "Owner",
      position: session.position,
      department: session.department,
      companySize: body.companySize || "Local guest mode",
      businessType: body.businessType || "Guest evaluation",
      member: {
        userId: session.userId,
        email: session.email,
        role: session.role,
        position: session.position,
        department: session.department,
        status: "active",
        lastSeenAt: new Date().toISOString(),
      },
    }, { workspaceId: session.workspaceId, forceLocalStore: true });

    await registerWorkspaceSession(session, { workspaceId: session.workspaceId, forceLocalStore: true });
    const workspace = await getWorkspaceSnapshot({ workspaceId: session.workspaceId, forceLocalStore: true });

    return Response.json(
      {
        session: publicSession(session),
        workspace,
      },
      { headers: guestHeaders(session) },
    );
  } catch (error) {
    return Response.json(
      { error: error.message || "Guest workspace could not be created." },
      {
        status: 500,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  }
}
