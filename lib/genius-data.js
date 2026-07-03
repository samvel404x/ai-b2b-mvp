// Sample workspace data for the GENIUS demo frontend.
// All numbers are illustrative and feed the UI before a backend is wired in.

export const workspace = {
  name: "Northwind Ops",
  plan: "Business",
  provider: { name: "Gemini 2.0", status: "online" },
  database: { name: "Supabase", status: "connected" },
  connectors: { active: 6, total: 9, status: "healthy" },
  dataQuality: 82,
  openApprovals: 5,
};

export const healthMetrics = [
  {
    id: "health",
    label: "Business health",
    value: 78,
    unit: "/100",
    trend: "+4",
    tone: "primary",
    hint: "Composite of risk, coverage and confidence",
  },
  {
    id: "risk",
    label: "Money at risk",
    value: 128400,
    format: "currency",
    trend: "+12%",
    tone: "critical",
    hint: "Exposure across open findings",
  },
  {
    id: "savings",
    label: "Savings potential",
    value: 64200,
    format: "currency",
    trend: "+8%",
    tone: "primary",
    hint: "Recoverable across ranked opportunities",
  },
  {
    id: "coverage",
    label: "Evidence coverage",
    value: 82,
    unit: "%",
    trend: "+6",
    tone: "evidence",
    hint: "Findings backed by source documents",
  },
  {
    id: "confidence",
    label: "AI confidence",
    value: 91,
    unit: "%",
    trend: "+2",
    tone: "primary",
    hint: "Average model confidence on findings",
  },
];

export const findings = [
  {
    id: "F-1042",
    title: "Auto-renewal window closes in 12 days",
    category: "Contract",
    severity: "Critical",
    impact: 9600,
    confidence: 94,
    owner: "Finance",
    evidence: "Acme Analytics MSA · p.4",
    evidenceCount: 3,
    action: "Request cancellation terms and renewal discount.",
    state: "Pending",
  },
  {
    id: "F-1039",
    title: "Duplicate research tools detected",
    category: "Spend",
    severity: "High",
    impact: 3240,
    confidence: 87,
    owner: "Ops",
    evidence: "card_spend_april.csv · rows 42, 119",
    evidenceCount: 2,
    action: "Consolidate seats into one vendor before June billing.",
    state: "Pending",
  },
  {
    id: "F-1036",
    title: "Invoice exceeds contract by 18%",
    category: "Invoice",
    severity: "High",
    impact: 2180,
    confidence: 90,
    owner: "Finance",
    evidence: "INV-2291.pdf · line 6",
    evidenceCount: 4,
    action: "Dispute overage and reconcile to signed rate card.",
    state: "In review",
  },
  {
    id: "F-1031",
    title: "Missing owner on 14 recurring charges",
    category: "Governance",
    severity: "Medium",
    impact: 1450,
    confidence: 76,
    owner: "RevOps",
    evidence: "vendors_master.xlsx · col E",
    evidenceCount: 1,
    action: "Assign accountable owner for each recurring vendor.",
    state: "Pending",
  },
  {
    id: "F-1028",
    title: "FX variance on EU subscriptions",
    category: "Spend",
    severity: "Medium",
    impact: 980,
    confidence: 71,
    owner: "Finance",
    evidence: "ledger_q1.csv · EUR block",
    evidenceCount: 2,
    action: "Lock annual billing to reduce FX drift.",
    state: "Snoozed",
  },
  {
    id: "F-1024",
    title: "Unused Datadog seats (9 of 20)",
    category: "Spend",
    severity: "Low",
    impact: 640,
    confidence: 83,
    owner: "Engineering",
    evidence: "seat_report.xlsx · sheet 2",
    evidenceCount: 1,
    action: "Downgrade plan tier at next renewal.",
    state: "Pending",
  },
];

export const savingsOpportunities = findings
  .filter((f) => f.category === "Spend" || f.category === "Contract" || f.category === "Invoice")
  .map((f) => ({
    id: f.id,
    title: f.title,
    impact: f.impact,
    confidence: f.confidence,
    owner: f.owner,
    evidence: f.evidence,
    action: f.action,
    category: f.category,
    severity: f.severity,
  }));

export const evidencePipeline = [
  { id: "E-01", name: "Acme Analytics MSA.pdf", type: "PDF", stage: "Extracted", fields: 24, coverage: 96 },
  { id: "E-02", name: "card_spend_april.csv", type: "CSV", stage: "Confirmed", fields: 512, coverage: 100 },
  { id: "E-03", name: "vendors_master.xlsx", type: "XLSX", stage: "Review", fields: 148, coverage: 71 },
  { id: "E-04", name: "INV-2291.pdf", type: "PDF", stage: "Confirmed", fields: 18, coverage: 100 },
  { id: "E-05", name: "ledger_q1.csv", type: "CSV", stage: "Extracting", fields: 0, coverage: 12 },
];

export const diagnosticsCategories = [
  { id: "contract", name: "Contract risk", issues: 4, impact: 12800, quality: 88, trend: "up" },
  { id: "spend", name: "Spend leakage", issues: 7, impact: 8600, quality: 79, trend: "up" },
  { id: "invoice", name: "Invoice drift", issues: 3, impact: 4200, quality: 91, trend: "flat" },
  { id: "governance", name: "Data governance", issues: 9, impact: 3100, quality: 64, trend: "down" },
  { id: "duplicates", name: "Duplicate payments", issues: 2, impact: 5400, quality: 96, trend: "up" },
];

export const agents = [
  {
    id: "A-1",
    name: "Contract Sentinel",
    role: "Monitors renewal windows and clauses",
    status: "Active",
    confidence: 94,
    workload: 12,
    outputs: 4,
    blocked: 1,
    guardrail: "Cannot send emails without approval",
  },
  {
    id: "A-2",
    name: "Spend Auditor",
    role: "Finds duplicate and drifting spend",
    status: "Active",
    confidence: 88,
    workload: 31,
    outputs: 9,
    blocked: 2,
    guardrail: "Cannot cancel vendors automatically",
  },
  {
    id: "A-3",
    name: "Invoice Reconciler",
    role: "Matches invoices to contracts",
    status: "Idle",
    confidence: 90,
    workload: 6,
    outputs: 3,
    blocked: 0,
    guardrail: "Read-only on ledgers",
  },
  {
    id: "A-4",
    name: "Governance Keeper",
    role: "Flags missing owners and metadata",
    status: "Paused",
    confidence: 76,
    workload: 18,
    outputs: 2,
    blocked: 3,
    guardrail: "Cannot modify records",
  },
];

export const approvals = [
  {
    id: "AP-501",
    title: "Send cancellation notice to Acme Analytics",
    agent: "Contract Sentinel",
    impact: 9600,
    confidence: 94,
    requested: "2h ago",
    priority: "Critical",
    evidence: "Acme Analytics MSA · p.4",
    action: "Email vendor with cancellation and renewal terms request.",
  },
  {
    id: "AP-498",
    title: "Consolidate duplicate research seats",
    agent: "Spend Auditor",
    impact: 3240,
    confidence: 87,
    requested: "5h ago",
    priority: "High",
    evidence: "card_spend_april.csv · rows 42, 119",
    action: "Move 4 seats to primary vendor and cancel duplicate plan.",
  },
  {
    id: "AP-495",
    title: "Dispute invoice overage INV-2291",
    agent: "Invoice Reconciler",
    impact: 2180,
    confidence: 90,
    requested: "1d ago",
    priority: "High",
    evidence: "INV-2291.pdf · line 6",
    action: "Open dispute and attach signed rate card evidence.",
  },
  {
    id: "AP-491",
    title: "Assign owners to 14 recurring charges",
    agent: "Governance Keeper",
    impact: 1450,
    confidence: 76,
    requested: "1d ago",
    priority: "Medium",
    evidence: "vendors_master.xlsx · col E",
    action: "Notify department leads to claim ownership.",
  },
  {
    id: "AP-486",
    title: "Downgrade Datadog plan tier",
    agent: "Spend Auditor",
    impact: 640,
    confidence: 83,
    requested: "2d ago",
    priority: "Low",
    evidence: "seat_report.xlsx · sheet 2",
    action: "Schedule downgrade at next renewal date.",
  },
];

export const excelRows = [
  { id: 1, vendor: "Acme Analytics", category: "SaaS", amount: 9600, owner: "Finance", status: "Anomaly", note: "Above contract rate" },
  { id: 2, vendor: "Datadog", category: "Monitoring", amount: 4200, owner: "Engineering", status: "Duplicate", note: "9 unused seats" },
  { id: 3, vendor: "Notion", category: "Productivity", amount: 320, owner: "Ops", status: "OK", note: "" },
  { id: 4, vendor: "Figma", category: "Design", amount: 540, owner: "—", status: "Missing owner", note: "No owner assigned" },
  { id: 5, vendor: "AWS", category: "Infra", amount: 18240, owner: "Engineering", status: "Forecast variance", note: "+22% vs plan" },
  { id: 6, vendor: "Slack", category: "Comms", amount: 1120, owner: "Ops", status: "OK", note: "" },
  { id: 7, vendor: "Acme Analytics", category: "SaaS", amount: 9600, owner: "Finance", status: "Duplicate", note: "Repeated charge" },
  { id: 8, vendor: "Zoom", category: "Comms", amount: 460, owner: "—", status: "Missing owner", note: "No owner assigned" },
];

export const connectors = [
  { id: "c1", name: "QuickBooks", category: "Accounting", status: "Connected", health: 99, events: 1240, lastSync: "2m ago" },
  { id: "c2", name: "Stripe", category: "Payments", status: "Connected", health: 100, events: 3480, lastSync: "just now" },
  { id: "c3", name: "Gmail", category: "Email", status: "Connected", health: 96, events: 820, lastSync: "6m ago" },
  { id: "c4", name: "Google Drive", category: "Files", status: "Connected", health: 92, events: 410, lastSync: "11m ago" },
  { id: "c5", name: "Salesforce", category: "CRM", status: "Degraded", health: 74, events: 190, lastSync: "1h ago" },
  { id: "c6", name: "Business Live Webhook", category: "Webhook", status: "Connected", health: 100, events: 5210, lastSync: "live" },
  { id: "c7", name: "NetSuite", category: "ERP", status: "Not connected", health: 0, events: 0, lastSync: "—" },
  { id: "c8", name: "Ramp", category: "Spend", status: "Not connected", health: 0, events: 0, lastSync: "—" },
  { id: "c9", name: "Xero", category: "Accounting", status: "Not connected", health: 0, events: 0, lastSync: "—" },
];

export const liveEvents = [
  { id: "ev1", source: "Stripe", type: "invoice.paid", time: "12:04:21", status: "ok" },
  { id: "ev2", source: "Business Live", type: "vendor.updated", time: "12:03:58", status: "ok" },
  { id: "ev3", source: "Salesforce", type: "sync.retry", time: "12:02:10", status: "retry" },
  { id: "ev4", source: "QuickBooks", type: "bill.created", time: "12:01:44", status: "ok" },
  { id: "ev5", source: "Gmail", type: "thread.flagged", time: "11:59:02", status: "ok" },
];

export const reports = [
  { id: "R-1", name: "Weekly risk report", type: "Risk", period: "Wk 27", status: "Ready", findings: 18, updated: "Today" },
  { id: "R-2", name: "Savings proof pack", type: "Savings", period: "Q2", status: "Ready", findings: 12, updated: "Yesterday" },
  { id: "R-3", name: "Renewal risk report", type: "Contract", period: "Jul", status: "Draft", findings: 6, updated: "2d ago" },
  { id: "R-4", name: "Action history", type: "Audit", period: "All", status: "Ready", findings: 41, updated: "3d ago" },
];

export const chatHistory = [
  { id: "ch1", title: "Why is Acme flagged critical?", updated: "2h ago" },
  { id: "ch2", title: "Duplicate spend across tools", updated: "Yesterday" },
  { id: "ch3", title: "Q2 savings summary", updated: "3d ago" },
];

export const chatSeed = [
  {
    role: "user",
    content: "Where are we losing the most money right now?",
  },
  {
    role: "assistant",
    content:
      "Your largest exposure is the Acme Analytics auto-renewal closing in 12 days, at $9,600. It is backed by the signed MSA and a duplicate spend pattern in card_spend_april.csv.",
    citations: [
      { label: "Acme Analytics MSA · p.4", type: "evidence" },
      { label: "card_spend_april.csv · rows 42, 119", type: "evidence" },
    ],
    nextAction: "Prepare an approval to request cancellation and renewal terms.",
    confidence: 94,
  },
];

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export const navSections = [
  { id: "command", label: "Command Center" },
  { id: "chat", label: "AI Chat" },
  { id: "data", label: "Data Intake" },
  { id: "diagnostics", label: "Diagnostics" },
  { id: "savings", label: "Savings Radar" },
  { id: "agents", label: "Agents" },
  { id: "approvals", label: "Approvals" },
  { id: "excel", label: "Excel Workspace" },
  { id: "connectors", label: "Connectors" },
  { id: "reports", label: "Reports" },
];

export const moreSections = [
  { id: "profile", label: "Profile" },
  { id: "support", label: "Support" },
  { id: "settings", label: "Settings" },
];
