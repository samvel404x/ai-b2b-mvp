import { createAppSession, publicSession, sessionCookie, workspaceIdForUser } from "../../../../lib/server/auth-session";
import {
  acceptWorkspaceInvite,
  findWorkspaceMembership,
  getWorkspaceSnapshot,
  readWorkspaceInvite,
  registerWorkspaceSession,
  updateWorkspaceSettings,
} from "../../../../lib/server/evidence-store";
import { guardMutationRequest } from "../../../../lib/server/request-security";
import { signInWithPassword, signUpWithPassword, SupabaseAuthError } from "../../../../lib/server/supabase-auth";

export const runtime = "nodejs";

function authHeaders(session) {
  return {
    "Set-Cookie": sessionCookie(session),
    "Cache-Control": "private, no-store",
  };
}

// Email/password auth stays server-side: Supabase tokens never enter the browser bundle.
export async function POST(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "auth:email", limit: 20, windowMs: 10 * 60_000 });
  if (guard) return guard;

  try {
    const body = await request.json().catch(() => ({}));
    const mode = body.mode === "signup" ? "signup" : "signin";
    const inviteToken = String(body.inviteToken || "").trim();
    const requestedProfile = {
      role: body.role,
      position: body.position,
      department: body.department,
      workspaceName: body.workspaceName,
      companySize: body.companySize,
      businessType: body.businessType,
    };
    if (inviteToken) {
      await readWorkspaceInvite(inviteToken, body.email);
    }
    const authUser = mode === "signup"
      ? await signUpWithPassword(body.email, body.password, requestedProfile)
      : await signInWithPassword(body.email, body.password);

    const acceptedInvite = inviteToken ? await acceptWorkspaceInvite(inviteToken, authUser) : null;
    const membership = !acceptedInvite ? await findWorkspaceMembership(authUser).catch(() => null) : null;
    const persistedWorkspaceId = acceptedInvite?.workspaceId
      || membership?.workspace?.id
      || workspaceIdForUser(authUser.userId || authUser.email);
    const persistedWorkspace = acceptedInvite?.workspace
      || membership?.workspace
      || (mode === "signin" ? await getWorkspaceSnapshot({ workspaceId: persistedWorkspaceId }).catch(() => null) : null);
    const persistedMember = acceptedInvite?.member || membership?.member || (persistedWorkspace?.members || []).find((member) => {
      return member.userId === authUser.userId || member.email === authUser.email;
    });
    if (persistedMember?.status === "disabled") {
      throw new SupabaseAuthError("This workspace member has been disabled.", 403);
    }
    const session = createAppSession({
      ...authUser,
      workspaceId: persistedWorkspaceId,
      role: acceptedInvite?.member?.role || (mode === "signup" && !inviteToken ? requestedProfile.role : persistedMember?.role || persistedWorkspace?.role || authUser.role),
      position: acceptedInvite?.member?.position || (mode === "signup" && !inviteToken ? requestedProfile.position : persistedMember?.position || persistedWorkspace?.position || authUser.position),
      department: acceptedInvite?.member?.department || (mode === "signup" && !inviteToken ? requestedProfile.department : persistedMember?.department || persistedWorkspace?.department || authUser.department),
    });

    await updateWorkspaceSettings({
      ...(mode === "signup" && !inviteToken ? {
        workspaceName: body.workspaceName,
        role: body.role,
        position: body.position,
        department: body.department,
        companySize: body.companySize,
        businessType: body.businessType,
      } : {}),
      member: {
        userId: session.userId,
        email: session.email,
        role: session.role,
        position: session.position,
        department: session.department,
        status: "active",
        lastSeenAt: new Date().toISOString(),
      },
    }, { workspaceId: session.workspaceId });
    await registerWorkspaceSession(session, { workspaceId: session.workspaceId });

    const workspace = await getWorkspaceSnapshot({ workspaceId: session.workspaceId });

    return Response.json(
      {
        session: publicSession(session),
        workspace,
      },
      { headers: authHeaders(session) },
    );
  } catch (error) {
    const status = error instanceof SupabaseAuthError ? error.status : 500;
    return Response.json(
      { error: error.message || "Authentication failed." },
      {
        status,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  }
}
