import { buildDemoLiveEvents } from "./live-events";

function nowIso() {
  return new Date().toISOString();
}

function demoEvidenceRecord({ id, name, kind, source, fields, extracted, evidence, confidence = 88 }) {
  const now = nowIso();

  return {
    id,
    name,
    url: null,
    size: kind === "CSV" ? "42 KB" : "Demo",
    bytes: 0,
    type: kind === "CSV" ? "text/csv" : "application/pdf",
    kind,
    source,
    status: "Confirmed",
    provider: "gemini",
    providerStatus: "ready",
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    fields,
    extracted: {
      vendor_name: fields.vendor,
      contract_value: fields.value,
      renewal_date: fields.renewal,
      notice_period_days: Number.parseInt(fields.notice, 10) || null,
      currency: "USD",
      owner: fields.owner,
      risk_summary: "Demo evidence for investor-ready proof trail.",
      evidence_snippets: evidence,
      ...extracted,
    },
    evidence,
    confidence,
    error: null,
    createdAt: now,
    updatedAt: now,
  };
}

// Builds a stable demo workspace that exercises the full MVP loop without requiring live customer files.
export function buildDemoWorkspace(workspaceId) {
  const now = nowIso();

  return {
    id: workspaceId,
    version: 1,
    evidence: [
      demoEvidenceRecord({
        id: "demo-evidence-acme-contract",
        name: "Acme Analytics renewal contract.pdf",
        kind: "PDF",
        source: "Investor Demo",
        fields: {
          vendor: "Acme Analytics",
          renewal: "2026-07-12",
          notice: "30 days",
          value: "$9,600",
          owner: "Finance",
        },
        extracted: {
          start_date: "2025-07-12",
          end_date: "2026-07-12",
          auto_renewal: true,
          payment_terms: "Net 30",
        },
        evidence: [
          "Agreement renews automatically unless either party gives 30 days written notice.",
          "Annual subscription value is USD 9,600.",
        ],
        confidence: 94,
      }),
      demoEvidenceRecord({
        id: "demo-evidence-northstar-invoice",
        name: "Northstar Cloud invoice INV-1042.pdf",
        kind: "PDF",
        source: "Investor Demo",
        fields: {
          vendor: "Northstar Cloud",
          renewal: "2026-08-01",
          notice: "Pending review",
          value: "$12,180",
          owner: "Unassigned",
        },
        extracted: {
          invoice_number: "INV-1042",
          invoice_total: 12180,
          payment_terms: "Net 15",
        },
        evidence: [
          "Invoice INV-1042 total is USD 12,180.",
          "No internal owner is listed on the invoice export.",
        ],
        confidence: 91,
      }),
      demoEvidenceRecord({
        id: "demo-evidence-april-spend",
        name: "April SaaS spend export.csv",
        kind: "CSV",
        source: "Investor Demo",
        fields: {
          vendor: "Research Stack",
          renewal: "Pending review",
          notice: "Pending review",
          value: "$3,240",
          owner: "Ops",
        },
        extracted: {
          line_items_summary: "Two overlapping research tools and unused seats detected in CSV sample.",
          invoice_total: 3240,
        },
        evidence: [
          "Rows 42 and 119 show overlapping research tooling.",
          "Seat count exceeds active users by 7 seats.",
        ],
        confidence: 87,
      }),
    ],
    vendors: [],
    contracts: [],
    invoices: [],
    spendRows: [],
    liveEvents: buildDemoLiveEvents(),
    findings: [],
    actions: [],
    reports: [],
    agentRuns: [],
    notifications: [],
    connectors: [],
    diagnostics: {},
    proofGraph: { nodes: [], edges: [], trail: [] },
    metrics: {},
    auditLog: [
      {
        id: "demo-audit-reset",
        type: "demo_workspace_loaded",
        actor: "system",
        details: {
          reason: "Investor demo data loaded for proof-trail walkthrough.",
        },
        createdAt: now,
      },
    ],
    updatedAt: now,
  };
}
