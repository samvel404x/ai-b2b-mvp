import { createAppSession, publicSession, sessionCookie } from "../../../../lib/server/auth-session";
import { getWorkspaceSnapshot } from "../../../../lib/server/evidence-store";
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
  try {
    const body = await request.json().catch(() => ({}));
    const mode = body.mode === "signup" ? "signup" : "signin";
    const authUser = mode === "signup"
      ? await signUpWithPassword(body.email, body.password)
      : await signInWithPassword(body.email, body.password);
    const session = createAppSession(authUser);
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
