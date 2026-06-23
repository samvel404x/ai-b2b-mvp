import { clearSessionCookie, getRequestSession, publicSession } from "../../../../lib/server/auth-session";

export const runtime = "nodejs";

// Returns the app session derived from the signed httpOnly cookie.
export async function GET(request) {
  return Response.json(
    { session: publicSession(getRequestSession(request)) },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

// Clears only the app cookie. Supabase refresh-token revocation will be added when full SSR auth lands.
export async function DELETE() {
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
