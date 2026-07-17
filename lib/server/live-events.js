import crypto from "node:crypto";

export const liveEventTypes = [
  "order",
  "refund",
  "chargeback",
  "ad_spend",
  "supplier_purchase",
  "platform_fee",
  "inventory_stockout",
  "failed_payment",
  "fulfillment_delay",
];

export const liveEventSchema = {
  type: liveEventTypes,
  externalId: "string optional; stable id from Shopify, Stripe, supplier system, ad platform, or database row",
  name: "string optional; human readable event name",
  amount: "number; revenue, refund, ad spend, supplier purchase, fee, or estimated exposure",
  cost: "number optional; COGS or order fulfillment cost",
  currency: "string optional; defaults to USD",
  channel: "string optional; Shopify, Stripe, Meta Ads, TikTok, supplier, marketplace, database",
  vendor: "string optional; supplier/vendor/platform name",
  customer: "string optional; customer label or id",
  sku: "string optional; SKU/product id",
  quantity: "number optional",
  status: "string optional; captured, paid, issued, open, failed, untracked, delayed, stockout",
  campaign: "string optional; marketing campaign name",
  occurredAt: "ISO datetime optional; defaults to server time",
  metadata: "object optional; compact extra connector fields",
};

export const liveEventSamplePayload = {
  workspaceId: "workspace-id-for-token-authenticated-webhooks",
  idempotencyKey: "retry-safe-batch-id-2026-06-27T10:00:00Z",
  events: [
    {
      type: "order",
      externalId: "shopify-order-10042",
      name: "Shopify order #10042",
      amount: 96,
      cost: 84,
      currency: "USD",
      channel: "Shopify",
      sku: "FAST-CHARGER-02",
      quantity: 1,
      status: "paid",
      occurredAt: "2026-06-27T10:00:00.000Z",
    },
    {
      type: "ad_spend",
      externalId: "meta-campaign-812",
      name: "Meta prospecting spend",
      amount: 620,
      currency: "USD",
      channel: "Meta Ads",
      campaign: "US dropshipping prospecting",
      status: "active",
      occurredAt: "2026-06-27T10:15:00.000Z",
    },
  ],
};

const allowedLiveEventTypes = new Set(liveEventTypes);

function nowIso() {
  return new Date().toISOString();
}

function hashId(prefix, value) {
  return `${prefix}-${crypto.createHash("sha1").update(value).digest("hex").slice(0, 14)}`;
}

function asNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function safeText(value, fallback = "", maxLength = 160) {
  const text = String(value ?? fallback).trim();
  return (text || fallback).slice(0, maxLength);
}

function safeIsoDate(value, fallback = nowIso()) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : fallback;
}

function compactMetadata(metadata) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return {};

  return Object.fromEntries(
    Object.entries(metadata)
      .slice(0, 24)
      .map(([key, value]) => [safeText(key, "field", 48), typeof value === "object" ? JSON.stringify(value).slice(0, 240) : safeText(value, "", 240)]),
  );
}

export function normalizeLiveEvent(input = {}, defaults = {}) {
  const source = safeText(input.source ?? defaults.source, "Business Live", 80);
  const connectorId = safeText(input.connectorId ?? defaults.connectorId, "business-live", 80);
  const type = safeText(input.type, "order", 48).toLowerCase().replace(/\s+/g, "_");
  const normalizedType = allowedLiveEventTypes.has(type) ? type : "order";
  const occurredAt = safeIsoDate(input.occurredAt ?? input.timestamp ?? input.createdAt);
  const externalId = safeText(input.externalId ?? input.orderId ?? input.id, "", 120);
  const stableKey = `${connectorId}:${normalizedType}:${externalId || JSON.stringify(input).slice(0, 500)}:${occurredAt}`;

  const amount = Math.max(0, Math.round(asNumber(input.amount ?? input.total ?? input.revenue ?? input.value)));
  const cost = Math.max(0, Math.round(asNumber(input.cost ?? input.cogs ?? input.supplierCost)));

  return {
    id: safeText(input.id, hashId("live", stableKey), 96),
    connectorId,
    source,
    type: normalizedType,
    externalId: externalId || null,
    name: safeText(input.name, `${source} ${normalizedType.replace(/_/g, " ")}`, 140),
    amount,
    cost,
    currency: safeText(input.currency, "USD", 12).toUpperCase(),
    channel: safeText(input.channel, "Online", 80),
    vendor: safeText(input.vendor ?? input.supplier ?? input.platform, "", 120) || null,
    customer: safeText(input.customer, "", 120) || null,
    sku: safeText(input.sku, "", 96) || null,
    quantity: Math.max(0, Math.round(asNumber(input.quantity, 1))),
    status: safeText(input.status, "captured", 80),
    campaign: safeText(input.campaign, "", 120) || null,
    marginPercent: input.marginPercent === undefined ? null : Math.round(asNumber(input.marginPercent)),
    occurredAt,
    metadata: compactMetadata(input.metadata),
    createdAt: safeIsoDate(input.createdAt, nowIso()),
    updatedAt: nowIso(),
  };
}

export function normalizeLiveEvents(events = [], defaults = {}) {
  const byId = new Map();

  for (const event of Array.isArray(events) ? events : []) {
    const normalized = normalizeLiveEvent(event, defaults);
    byId.set(normalized.id, normalized);
  }

  return Array.from(byId.values()).sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
}

export function buildDemoLiveEvents() {
  const now = Date.now();
  const hoursAgo = (hours) => new Date(now - hours * 3600000).toISOString();
  const defaults = { source: "Business Live Demo", connectorId: "business-live-demo" };

  return normalizeLiveEvents(
    [
      {
        type: "order",
        externalId: "ord-10041",
        name: "Shopify order #10041",
        amount: 184,
        cost: 118,
        channel: "Shopify",
        customer: "Retail customer",
        sku: "NORD-LED-01",
        quantity: 2,
        occurredAt: hoursAgo(3),
      },
      {
        type: "order",
        externalId: "ord-10042",
        name: "Low-margin order #10042",
        amount: 96,
        cost: 84,
        channel: "Shopify",
        sku: "FAST-CHARGER-02",
        quantity: 1,
        marginPercent: 13,
        occurredAt: hoursAgo(2),
      },
      {
        type: "ad_spend",
        externalId: "meta-campaign-812",
        name: "Meta prospecting spend",
        amount: 620,
        channel: "Meta Ads",
        campaign: "US dropshipping prospecting",
        occurredAt: hoursAgo(5),
      },
      {
        type: "refund",
        externalId: "refund-10039",
        name: "Refund for delayed delivery",
        amount: 129,
        channel: "Shopify",
        sku: "NORD-LED-01",
        status: "issued",
        occurredAt: hoursAgo(9),
      },
      {
        type: "chargeback",
        externalId: "cb-204",
        name: "Payment chargeback",
        amount: 88,
        channel: "Stripe",
        status: "open",
        occurredAt: hoursAgo(14),
      },
      {
        type: "supplier_purchase",
        externalId: "ali-po-771",
        name: "Supplier purchase without tracking",
        amount: 410,
        vendor: "Shenzhen FastSupply",
        sku: "FAST-CHARGER-02",
        quantity: 12,
        status: "untracked",
        occurredAt: hoursAgo(56),
      },
      {
        type: "inventory_stockout",
        externalId: "stockout-92",
        name: "Stockout risk on winning SKU",
        amount: 560,
        sku: "NORD-LED-01",
        quantity: 18,
        status: "stockout",
        occurredAt: hoursAgo(1),
      },
      {
        type: "failed_payment",
        externalId: "fail-302",
        name: "Failed payment on high-value cart",
        amount: 220,
        channel: "Stripe",
        status: "failed",
        occurredAt: hoursAgo(7),
      },
    ],
    defaults,
  );
}

export function summarizeLiveEvents(events = []) {
  const normalized = normalizeLiveEvents(events);
  const orderEvents = normalized.filter((event) => event.type === "order");
  const refundEvents = normalized.filter((event) => event.type === "refund" || event.type === "chargeback");
  const spendEvents = normalized.filter((event) => event.type === "ad_spend" || event.type === "supplier_purchase" || event.type === "platform_fee");
  const fulfillmentEvents = normalized.filter((event) => event.type === "fulfillment_delay" || event.type === "inventory_stockout");
  const revenue = orderEvents.reduce((sum, event) => sum + event.amount, 0);
  const refunds = refundEvents.reduce((sum, event) => sum + event.amount, 0);
  const adSpend = normalized.filter((event) => event.type === "ad_spend").reduce((sum, event) => sum + event.amount, 0);
  const supplierCost = normalized.filter((event) => event.type === "supplier_purchase").reduce((sum, event) => sum + event.amount, 0);
  const orderCost = orderEvents.reduce((sum, event) => sum + event.cost, 0);
  const platformFees = normalized.filter((event) => event.type === "platform_fee").reduce((sum, event) => sum + event.amount, 0);
  const grossProfit = revenue - refunds - adSpend - supplierCost - orderCost - platformFees;
  const marginPercent = revenue ? Math.round((grossProfit / revenue) * 100) : 0;
  const refundRate = revenue ? Math.round((refunds / revenue) * 100) : 0;
  const roas = adSpend ? Number((revenue / adSpend).toFixed(2)) : null;
  const unfulfilledSpend = normalized
    .filter((event) => event.type === "supplier_purchase" && /untracked|pending|delayed/i.test(event.status))
    .reduce((sum, event) => sum + event.amount, 0);

  return {
    eventCount: normalized.length,
    orderCount: orderEvents.length,
    revenue,
    refunds,
    refundRate,
    adSpend,
    supplierCost,
    grossProfit,
    marginPercent,
    roas,
    unfulfilledSpend,
    fulfillmentSignals: fulfillmentEvents.length,
    failedPayments: normalized.filter((event) => event.type === "failed_payment").length,
    connectedSources: Array.from(new Set(normalized.map((event) => event.connectorId || event.source).filter(Boolean))),
    lastEventAt: normalized[0]?.occurredAt || null,
  };
}

function liveFinding(event, category, title, impact, evidence, recommendedAction, confidence = 78) {
  const severity = impact >= 500 ? "High" : impact >= 150 ? "Watch" : "Low";

  return {
    id: hashId("finding", `live:${event.id}:${category}:${title}`),
    evidenceId: event.id,
    title,
    category,
    severity,
    impact: Math.max(0, Math.round(impact)),
    confidence,
    owner: "Operations",
    source: event.name,
    evidence,
    recommendedAction,
    status: "Open",
    requiresApproval: true,
    createdAt: event.createdAt || nowIso(),
    updatedAt: nowIso(),
  };
}

export function buildFindingsFromLiveEvents(events = []) {
  const normalized = normalizeLiveEvents(events);
  const summary = summarizeLiveEvents(normalized);
  const findings = [];
  const firstEvent = normalized[0];

  if (!firstEvent || !summary.eventCount) return findings;

  if (summary.revenue > 0 && summary.marginPercent < 25) {
    findings.push(
      liveFinding(
        firstEvent,
        "Live Commerce",
        `Live gross margin is ${summary.marginPercent}%`,
        Math.round(summary.revenue * ((25 - summary.marginPercent) / 100)),
        `Revenue=${summary.revenue}, refunds=${summary.refunds}, ad_spend=${summary.adSpend}, supplier_cost=${summary.supplierCost}.`,
        "Review pricing, supplier cost, ad spend, and discount rules before scaling the campaign.",
        84,
      ),
    );
  }

  if (summary.refundRate >= 8 || summary.refunds >= 150) {
    const refundEvent = normalized.find((event) => event.type === "refund" || event.type === "chargeback") || firstEvent;
    findings.push(
      liveFinding(
        refundEvent,
        "Live Commerce",
        `Refund and chargeback rate is ${summary.refundRate}%`,
        summary.refunds,
        `Refunds/chargebacks=${summary.refunds} across ${summary.orderCount || 0} orders.`,
        "Pause weak fulfillment routes, inspect delayed SKUs, and prepare customer recovery actions.",
        82,
      ),
    );
  }

  if (summary.adSpend >= 300 && (!summary.roas || summary.roas < 1.5)) {
    const adEvent = normalized.find((event) => event.type === "ad_spend") || firstEvent;
    findings.push(
      liveFinding(
        adEvent,
        "Marketing Spend",
        `Paid traffic ROAS is ${summary.roas ?? 0}x`,
        summary.adSpend,
        `Ad spend=${summary.adSpend}, tracked revenue=${summary.revenue}, ROAS=${summary.roas ?? 0}x.`,
        "Hold campaign scale-up until revenue attribution, margin, and winning SKU proof are reviewed.",
        79,
      ),
    );
  }

  if (summary.unfulfilledSpend >= 100) {
    const supplierEvent = normalized.find((event) => event.type === "supplier_purchase" && /untracked|pending|delayed/i.test(event.status)) || firstEvent;
    findings.push(
      liveFinding(
        supplierEvent,
        "Fulfillment",
        "Supplier purchases need tracking confirmation",
        summary.unfulfilledSpend,
        `Untracked/pending supplier purchase exposure=${summary.unfulfilledSpend}.`,
        "Ask the supplier for tracking, update customer ETA, or reroute fulfillment before approvals execute.",
        76,
      ),
    );
  }

  const stockoutEvent = normalized.find((event) => event.type === "inventory_stockout");
  if (stockoutEvent) {
    findings.push(
      liveFinding(
        stockoutEvent,
        "Inventory",
        `Stockout risk for ${stockoutEvent.sku || "active SKU"}`,
        stockoutEvent.amount,
        `${stockoutEvent.name}: quantity=${stockoutEvent.quantity}, status=${stockoutEvent.status}.`,
        "Confirm available units and prepare reorder or ad throttling action for approval.",
        73,
      ),
    );
  }

  return findings.sort((a, b) => b.impact - a.impact);
}

export function liveEventToEvidenceRecord(event) {
  const amountLabel = event.amount ? `$${event.amount.toLocaleString("en-US")}` : "No amount";

  return {
    id: event.id,
    name: event.name,
    url: null,
    size: "Live",
    bytes: 0,
    type: "application/json",
    kind: "Live event",
    source: event.source,
    status: "Confirmed",
    provider: event.connectorId,
    providerStatus: "ready",
    model: null,
    fields: {
      vendor: event.vendor || event.channel || event.source,
      renewal: "Live signal",
      notice: event.status,
      value: amountLabel,
      owner: "Operations",
    },
    extracted: {
      live_event_type: event.type,
      channel: event.channel,
      sku: event.sku,
      order_id: event.externalId,
      occurred_at: event.occurredAt,
      evidence_snippets: [`${event.type} ${amountLabel} from ${event.channel || event.source}`],
    },
    evidence: [`${event.name}: ${event.type} ${amountLabel} status=${event.status}`],
    confidence: 88,
    error: null,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

export function buildBusinessEntitiesFromLiveEvents(events = []) {
  const normalized = normalizeLiveEvents(events);
  const spendRows = normalized
    .filter((event) => ["ad_spend", "supplier_purchase", "platform_fee", "refund", "chargeback"].includes(event.type))
    .map((event) => ({
      id: hashId("spend", `live:${event.id}`),
      vendorId: hashId("vendor", (event.vendor || event.channel || event.source).toLowerCase()),
      vendorName: event.vendor || event.channel || event.source,
      evidenceId: event.id,
      amount: event.amount,
      currency: event.currency,
      source: event.name,
      status: "Live",
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    }));
  const vendorsById = new Map();

  for (const event of normalized) {
    const vendorName = event.vendor || event.channel || event.source;
    if (!vendorName) continue;
    const vendorId = hashId("vendor", vendorName.toLowerCase());
    const existing = vendorsById.get(vendorId);

    vendorsById.set(vendorId, {
      id: vendorId,
      name: vendorName,
      owner: "Operations",
      sourceEvidenceIds: Array.from(new Set([...(existing?.sourceEvidenceIds || []), event.id])),
      totalExposure: (existing?.totalExposure || 0) + event.amount,
      status: "Live",
      createdAt: existing?.createdAt || event.createdAt,
      updatedAt: event.updatedAt,
    });
  }

  return {
    vendors: Array.from(vendorsById.values()).sort((a, b) => b.totalExposure - a.totalExposure),
    spendRows,
  };
}
