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
        externalWebhook: "Send x-genius-live-token and x-genius-workspace-id. The token value must match GENIUS_LIVE_INGEST_TOKEN.",
      },
      eventTypes: liveEventTypes,
      schema: liveEventSchema,
      samplePayload: liveEventSamplePayload,
      result: "GENIUS normalizes events, rebuilds metrics, diagnostics, findings, approval-safe actions, proof graph, reports, and chat context.",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
