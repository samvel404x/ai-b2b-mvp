import { readWorkspaceInvite } from "../../../../lib/server/evidence-store";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    const email = url.searchParams.get("email");
    const invite = await readWorkspaceInvite(token, email);

    return Response.json(
      {
        invite,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return Response.json(
      { error: error.message || "Invite link is invalid." },
      { status: 400, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
