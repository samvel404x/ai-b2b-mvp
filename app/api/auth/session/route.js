import { clearSessionCookie, getRequestSession, getValidatedRequestSession, publicSession } from "../../../../lib/server/auth-session";
import { revokeWorkspaceSession } from "../../../../lib/server/evidence-store";
import { guardMutationRequest } from "../../../../lib/server/request-security";

export const runtime = "nodejs";

// Returns the app session derived from the signed httpOnly cookie.
export async function GET(request) {
  return Response.json(
    { session: publicSession(await getValidatedRequestSession(request)) },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

// Revokes the current app session server-side and clears the browser cookie.
export async function DELETE(request) {
  const guard = guardMutationRequest(request, { keyPrefix: "auth:session:delete", limit: 30, windowMs: 10 * 60_000 });
  if (guard) return guard;

  const session = getRequestSession(request);
  if (session) {
    await revokeWorkspaceSession(session, session.email);
  }

  return Response.json(
    { ok: true },
    {
      headers: {
        "Set-Cookie": clearSessionCookie(),
        "Cache-Control": "private, no-store",
      },
    },
  );
}
