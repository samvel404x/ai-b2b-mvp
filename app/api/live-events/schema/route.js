import { liveEventSamplePayload, liveEventSchema, liveEventTypes } from "../../../../lib/server/live-events";

export const runtime = "nodejs";

// Documents the Business Live ingest contract for future Shopify/Stripe/CRM/database connectors.
export async function GET() {
  return Response.json(
    {
      endpoint: "/api/live-events",
      method: "POST",
      auth: {
        ui: "Same-origin product UI can post into the current workspace session.",
        externalWebhook: "Send x-genius-workspace-id plus x-genius-live-token. Preferred token is v1:<HMAC_SHA256('live-events:' + workspaceId, GENIUS_LIVE_INGEST_SECRET)>. Legacy GENIUS_LIVE_INGEST_TOKEN is accepted only when GENIUS_LIVE_INGEST_WORKSPACE_ID matches the same workspace.",
      },
      idempotency: {
        header: "x-idempotency-key",
        body: "idempotencyKey",
        behavior: "Retries with the same workspace id and idempotency key upsert the same deterministic live event ids instead of appending duplicates.",
      },
      eventTypes: liveEventTypes,
      schema: liveEventSchema,
      samplePayload: liveEventSamplePayload,
      result: "GENIUS normalizes events, rebuilds metrics, diagnostics, findings, approval-safe actions, proof graph, reports, and chat context.",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
