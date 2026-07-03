// GENIUS — enriched mock data matching all UI mockups.

export const workspace = {
  name: "Acme Corporation",
  plan: "Business",
  provider: { name: "Gemini 1.5 Pro", status: "online" },
  database: { name: "Supabase", status: "connected" },
  connectors: { active: 18, total: 20, status: "healthy" },
  dataQuality: 84,
  openApprovals: 8,
  lastSync: "2m ago",
};

export const healthMetrics = [
  {
    id: "health",
    label: "Business health",
    value: 72,
    unit: "/100",
    trend: "+6 pts",
    trendDir: "up",
    tone: "primary",
    hint: "vs last 7 days",
    sub: "Moderate risk",
    subTone: "warning",
    spark: [58, 60, 61, 64, 65, 67, 68, 70, 71, 72],
  },
  {
    id: "diagnostics",
    label: "Diagnostics score",
    value: 62,
    unit: "%",
    trend: "+5 pts",
    trendDir: "up",
    tone: "primary",
    hint: "vs last 7 days",
    spark: [50, 52, 53, 55, 56, 57, 58, 59, 61, 62],
  },
  {
    id: "coverage",
    label: "Proof coverage",
    value: 68,
    unit: "%",
    trend: "+4 pts",
    trendDir: "up",
    tone: "evidence",
    hint: "vs last 7 days",
    spark: [55, 56, 58, 59, 60, 62, 63, 64, 66, 68],
  },
  {
    id: "backlog",
    label: "Approval backlog",
    value: 24,
    unit: "",
    trend: "+4",
    trendDir: "up",
    tone: "warning",
    hint: "vs last 7 days",
    spark: [14, 15, 16, 18, 17, 19, 20, 22, 23, 24],
  },
  {
    id: "exposure",
    label: "Renewal exposure",
    value: "$7.62M",
    unit: "",
    trend: "+7%",
    trendDir: "up",
    tone: "critical",
    hint: "vs last 7 days",
    spark: [5.1, 5.4, 5.6, 5.8, 6.0, 6.3, 6.7, 7.0, 7.3, 7.62],
  },
  {
    id: "leakage",
    label: "Spend leakage",
    value: "$3.21M",
    unit: "",
    trend: "+15%",
    trendDir: "up",
    tone: "critical",
    hint: "vs last 7 days",
    spark: [2.1, 2.2, 2.4, 2.5, 2.6, 2.8, 2.9, 3.0, 3.1, 3.21],
  },
  {
    id: "mismatches",
    label: "Invoice mismatches",
    value: 18,
    unit: "",
    trend: "+4",
    trendDir: "up",
    tone: "warning",
    hint: "vs last 7 days",
    spark: [10, 11, 12, 13, 13, 14, 15, 16, 17, 18],
  },
  {
    id: "confidence",
    label: "Confidence avg",
    value: 87,
    unit: "%",
    trend: "+5 pts",
    trendDir: "up",
    tone: "primary",
    hint: "vs last 7 days",
    spark: [78, 79, 80, 81, 82, 83, 84, 85, 86, 87],
  },
  {
    id: "ttf",
    label: "Time to first finding",
    value: "2h 14m",
    unit: "",
    trend: "-18m",
    trendDir: "down",
    tone: "primary",
    hint: "vs last 7 days",
    spark: [180, 175, 172, 168, 160, 155, 148, 140, 135, 134],
  },
];

// Command Center KPI strip
export const commandKpis = [
  { label: "Business health", value: 72, unit: "/100", trend: "+6 pts", trendDir: "up", tone: "primary", sub: "Moderate risk", subTone: "warning", ring: true, spark: [58,60,61,64,65,67,68,70,71,72] },
  { label: "Money at risk", value: "$287,430", trend: "▲ 18.6%", trendDir: "up", tone: "critical", sub: "High", subTone: "critical", spark: [180,190,210,205,220,240,250,260,270,287] },
  { label: "Savings potential", value: "$147,320", trend: "▲ 12.3%", trendDir: "up", tone: "primary", sub: "Opportunities 24", spark: [90,100,110,115,120,128,132,138,142,147] },
  { label: "Evidence coverage", value: "84%", trend: "+5 pts", trendDir: "up", tone: "evidence", sub: "Good", subTone: "primary", spark: [70,72,73,75,76,78,79,80,82,84] },
  { label: "AI confidence", value: "87%", trend: "+6 pts", trendDir: "up", tone: "primary", sub: "High", subTone: "primary", spark: [76,77,78,79,80,81,82,84,86,87] },
  { label: "Approval queue", value: "8", trend: "3 urgent", trendDir: "up", tone: "warning", sub: "3 urgent", subTone: "critical", spark: [3,3,4,5,5,6,6,7,7,8] },
  { label: "Report readiness", value: "96%", trend: "▲ 2 pts", trendDir: "up", tone: "primary", sub: "12 reports ready", spark: [88,89,90,90,91,92,93,94,95,96] },
];

export const evidenceGraphNodes = {
  sourceEvidence: { count: 95, label: "Source evidence", items: ["Microsoft_EA_Renewal_Quote.pdf","Contracts_Master.xlsx","AP_Invoices_May.xlsx","Vendor_Benchmark_Report.pdf"], scores: [94,89,85,82] },
  extractedFacts: { count: 2841, label: "Extracted facts", items: ["Microsoft EA renewal","Payment terms","Price per user","Auto-renewal"], scores: [95,96,94,93] },
  diagnosticRisks: { count: 34, label: "Diagnostic risks", color: "critical", items: ["Renewal above market","Unused licenses","Payment terms drift","Duplicate payments"], scores: [94,88,78,92], severities: ["High","Medium","Medium","High"] },
  agentActions: { count: 87, label: "Agent actions", items: ["Contract Analyst","Spend Auditor","Finance Watcher","Legal Reviewer"], statuses: ["In progress","In progress","Queued","Queued"], scores: [92,88,85,80] },
  humanApprovals: { count: 24, label: "Human approvals", items: ["Michael Wong","Sarah Green","James Tran","Alex Rivera"], statuses: ["Review","Savings","CFO","Owner"], scores: [92,67,48,"-"] },
  boardReports: { count: 12, label: "Board reports", items: ["Weekly Risk Report","Savings Summary","Renewal Risk Report","Executive Summary"], statuses: ["Included","Included","Upcoming","May 2026"], scores: [95,93,90,90] },
};

export const decisionQueue = [
  { id: "DQ-1", title: "Approve vendor contract renewal", sub: "TechSoft Solutions – 12mo renewal", impact: 245000, due: "14m overdue", priority: "High", requestedBy: "Michael Wong", state: "Pending" },
  { id: "DQ-2", title: "Increase marketing ad spend", sub: "Google Ads – Q4 campaign", impact: 120000, due: "1h 12m", priority: "Medium", requestedBy: "Sarah Green", state: "Pending" },
  { id: "DQ-3", title: "Write off aged receivable", sub: "Acme Corp – $42,500", impact: 42500, due: "2h 5m", priority: "High", requestedBy: "Daniel Tran", state: "Pending" },
  { id: "DQ-4", title: "Approve new vendor onboarding", sub: "CloudScale LLC", impact: 18000, due: "4h 32m", priority: "Low", requestedBy: "James Silva", state: "Pending" },
];

export const activeAgents = [
  { id: "AA-1", name: "Contract Analyst", role: "Reviewing renewals & contracts", status: "Active", workload: 78, lastRun: "2m ago", actionsToday: 24 },
  { id: "AA-2", name: "Spend Auditor", role: "Detecting leakage & anomalies", status: "Active", workload: 62, lastRun: "3m ago", actionsToday: 18 },
  { id: "AA-3", name: "Revenue Analyst", role: "Tracking revenue & forecasts", status: "Waiting", workload: 35, lastRun: "8m ago", actionsToday: 12 },
  { id: "AA-4", name: "Excel Analyst", role: "Processing files & data", status: "Active", workload: 71, lastRun: "1m ago", actionsToday: 27 },
  { id: "AA-5", name: "Report Builder", role: "Preparing board reports", status: "Active", workload: 45, lastRun: "5m ago", actionsToday: 8 },
];

export const proofBackedFindings = [
  { id: "F-1047", title: "Renewal above market benchmark", category: "Contracts", severity: "High", impact: 245000, confidence: 94, evidence: "Microsoft_EA_Renewal_Quote.pdf", owner: "Michael Wong / Procurement", agentAction: "Renegotiate terms\nTarget 15-20% savings", approvalState: "Open" },
  { id: "F-1044", title: "Unused SaaS licenses", category: "Spend", severity: "Medium", impact: 120000, confidence: 89, evidence: "SaaS_Usage_May.xlsx", owner: "Sarah Green / Finance", agentAction: "Reclaim licenses\nEnd of month cleanup", approvalState: "In progress" },
  { id: "F-1041", title: "Invoice mismatch – pricing", category: "Finance", severity: "High", impact: 27850, confidence: 78, evidence: "AP_Invoices_May.xlsx", owner: "Daniel Tran / Finance", agentAction: "Request credit note", approvalState: "Review" },
  { id: "F-1038", title: "Missing contract owner", category: "Contracts", severity: "Medium", impact: 15600, confidence: 71, evidence: "Contracts_Master.xlsx", owner: "Priya N. / Operations", agentAction: "Assign owner", approvalState: "Open" },
  { id: "F-1035", title: "Forecast variance – Q4", category: "Forecast", severity: "Low", impact: -43000, confidence: 65, evidence: "Forecast_Q4.xlsx", owner: "Priya N. / Operations", agentAction: "Update forecast assumptions", approvalState: "In progress" },
];

export const diagnosticsKpis = [
  { label: "Business health score", value: 72, unit: "/100", trend: "+6 pts", sub: "Moderate risk", subTone: "warning", ring: true, spark: [58,60,62,64,65,67,68,70,71,72] },
  { label: "Diagnostics score", value: 62, unit: "%", trend: "+5 pts", spark: [50,52,53,55,56,57,58,59,61,62] },
  { label: "Proof coverage", value: 68, unit: "%", trend: "+4 pts", spark: [55,57,58,60,61,62,63,64,67,68] },
  { label: "Approval backlog", value: 24, unit: "", trend: "+4", tone: "warning", spark: [14,15,16,18,17,19,20,22,23,24] },
  { label: "Renewal exposure", value: "$7.62M", trend: "+7%", tone: "critical", spark: [5.1,5.4,5.6,5.8,6.0,6.3,6.7,7.0,7.3,7.62] },
  { label: "Spend leakage", value: "$3.21M", trend: "+15%", tone: "critical", spark: [2.1,2.2,2.4,2.5,2.6,2.8,2.9,3.0,3.1,3.21] },
  { label: "Invoice mismatches", value: 18, trend: "+4", tone: "warning", spark: [10,11,12,13,13,14,15,16,17,18] },
  { label: "Confidence avg", value: "87%", trend: "+5 pts", tone: "primary", spark: [78,79,80,81,82,83,84,85,86,87] },
  { label: "Time to first finding", value: "2h 14m", trend: "-18m", trendDir: "down", tone: "primary", spark: [180,175,172,168,160,155,148,140,135,134] },
];

export const diagnosticsRows = [
  { id: "D-1", category: "Spend Leakage", description: "Uncaptured spend & pricing drift", score: 48, scoreRing: true, signals: 36, signalTone: "critical", impact: "$3.21M", impactTone: "critical", trend: "worsening", confidence: 92, proofTrails: 24, owner: "Michael W. / FinOps", status: "Open" },
  { id: "D-2", category: "Renewal Risk", description: "Contracts renewing w/o review", score: 55, signals: 28, signalTone: "warning", impact: "$7.62M", impactTone: "critical", trend: "flat", confidence: 89, proofTrails: 18, owner: "Sarah K. / Procurement", status: "Review" },
  { id: "D-3", category: "Missing Owner", description: "Unowned contracts & vendors", score: 62, signals: 18, signalTone: "warning", impact: "$1.14M", impactTone: "warning", trend: "worsening", confidence: 75, proofTrails: 12, owner: "James T. / Legal", status: "Open" },
  { id: "D-4", category: "Invoice / Contract Mismatch", description: "Invoice vs contract misalignment", score: 45, signals: 95, signalTone: "critical", impact: "$912K", impactTone: "warning", trend: "worsening", confidence: 78, proofTrails: 31, owner: "Daniel R. / Finance", status: "Open" },
  { id: "D-5", category: "Data Quality", description: "Incomplete, duplicate, or stale data", score: 68, signals: 41, signalTone: "warning", impact: "$0.48M", impactTone: "warning", trend: "improving", confidence: 86, proofTrails: 22, owner: "Michael W. / IT", status: "In progress" },
  { id: "D-6", category: "Approval Backlog", description: "Pending approvals beyond SLA", score: 50, signals: 24, signalTone: "warning", impact: "$0.22M", impactTone: "warning", trend: "flat", confidence: 94, proofTrails: 7, owner: "Riva N. / Data Ops", status: "Open" },
  { id: "D-7", category: "Duplicate Payments", description: "Same vendor, multiple payments", score: 71, signals: 12, signalTone: "warning", impact: "$0.34M", tone: "warning", trend: "improving", confidence: 91, proofTrails: 9, owner: "Janet K. / Finance", status: "Open" },
];

export const diagnosticSignals = [
  { time: "10:42 AM", severity: "High", signal: "Maverick spend detected: $125K with Office Depot", category: "Spend Leakage", evidence: "AP_Invoices_May.xlsx", impact: "$125K", status: "New" },
  { time: "09:15 AM", severity: "Medium", signal: "Price variance > 10% on 17 SKUs", category: "Spend Leakage", evidence: "Contract_vs_PO_variance.xlsx", impact: "$84K", status: "Investigating" },
  { time: "08:47 AM", severity: "High", signal: "Uncaptured discount available: $38K", category: "Spend Leakage", evidence: "Vendor_Benchmark_Report.pdf", impact: "$38K", status: "New" },
  { time: "Yesterday 4:32 PM", severity: "Medium", signal: "Renewal in 30 days without review", category: "Renewal Risk", evidence: "Contracts_Master.xlsx", impact: "$210K", status: "Awaiting review" },
  { time: "Yesterday 2:10 PM", severity: "Low", signal: "Duplicate vendor record merged", category: "Data Quality", evidence: "Vendors_Master.csv", impact: "—", status: "Resolved" },
];

export const spendLeakageDetail = {
  category: "Spend Leakage",
  score: 48,
  risk: "High risk",
  riskTone: "critical",
  trend: "+8 pts vs last 7 days",
  estimatedImpact: "$3.21M",
  impactSub: "15% of total spend",
  confidence: 92,
  topDrivers: [
    { name: "Maverick spend", value: "$1.28M", pct: 40 },
    { name: "Pricing drift", value: "$0.96M", pct: 30 },
    { name: "Uncaptured discounts", value: "$0.62M", pct: 19 },
    { name: "Off-contract vendors", value: "$0.35M", pct: 11 },
  ],
  riskNarrative: "We identified $3.21M in potential spend leakage across 47 categories. Maverick purchasing and pricing drift drive 34% of the leakage. 24 proof trails support these findings with high confidence.",
  topEvidence: [
    { name: "Maverick_purchases_Q1.pdf", value: "$620K" },
    { name: "Contract_vs_PO_variance.xlsx", value: "$480K" },
    { name: "Pricing_drift_ACME_Corp.pdf", value: "$310K" },
    { name: "Vendor_Benchmark_Report.pdf", value: "$285K" },
    { name: "AP_Invoices_May.xlsx", value: "$210K" },
  ],
  extractedFacts: [
    { fact: "143 POs placed outside contract", ok: true },
    { fact: "12 vendors with price above contract", ok: true },
    { fact: "8% average price variance", ok: true },
    { fact: "$1.2M in uncaptured discounts", ok: true },
    { fact: "36 transactions without PO", ok: false },
  ],
  recommendedAction: "Review top 20 vendors with highest leakage and initiate pricing alignment. Enforce PO compliance and capture discounts before Q3 close.",
  relatedImpacts: [
    { label: "Budget variance", value: "-8.7%", sub: "vs budget", detail: "Impact: $2.14M", trend: "down" },
    { label: "Cost avoidance potential", value: "$1.92M", sub: "identified", detail: "Confidence: 87%", trend: "up" },
    { label: "Cash at risk (30 days)", value: "$2.45M", sub: "exposure", detail: "vs last week ▲9%", trend: "up" },
    { label: "Contracts auto-renewing", value: "12", sub: "at risk", detail: "Value: $3.05M", trend: "neutral" },
    { label: "Suppliers over contract", value: "24%", sub: "of spend", detail: "vs last week ▲3%", trend: "up" },
  ],
};

// AI Chat data
export const chatEvidenceContext = [
  { name: "Microsoft_EA_Renewal_Quote.pdf", type: "PDF", date: "May 23, 2026", size: "2.4 MB" },
  { name: "SaaS_Usage_May_2026.xlsx", type: "XLSX", date: "May 24, 2026", size: "1.1 MB" },
  { name: "AP_Invoices_May.csv", type: "CSV", date: "May 24, 2026", size: "842 KB" },
];

export const chatActiveAgents = [
  { name: "Contract Analyst", desc: "Reviewing renewals & contracts", status: "Active" },
  { name: "Spend Auditor", desc: "Detecting leakage & anomalies", status: "Active" },
  { name: "Revenue Analyst", desc: "Tracking revenue & forecasts", status: "Waiting" },
  { name: "Excel Analyst", desc: "Processing files & data", status: "Active" },
  { name: "Report Builder", desc: "Preparing board reports", status: "Blocked" },
];

export const chatOpenApprovals = [
  { title: "Microsoft EA renewal", priority: "Urgent", amount: "$245K" },
  { title: "Unused SaaS licenses", priority: "High", due: "Due in 1h 12m", amount: "$34.2K" },
  { title: "Payment terms drift", priority: "High", due: "Due in 2h 5m", amount: "$27.9K" },
];

export const chatDataQuality = { complete: 72, partial: 12, missing: 9, invalid: 7 };

export const topChangesThisWeek = [
  { rank: 1, finding: "Microsoft EA renewal above benchmark", risk: "High risk", desc: "Renewal quote is 18-22% above benchmark for similar scope and usage.", impact: "$245,000", confidence: 92, evidence: "Microsoft_EA_Renewal_Quote.pdf", proofTrail: "PT-1247", action: "Approve", actionTone: "primary" },
  { rank: 2, finding: "Unused SaaS licenses detected", risk: "Medium", desc: "298 seats across 4 tools unused for > 60 days. Reclaim or reassign.", impact: "$34,200", confidence: 89, evidence: "SaaS_Usage_May_2026.xlsx", proofTrail: "PT-1245", action: "Review", actionTone: "warning" },
  { rank: 3, finding: "Payment terms drift", risk: "High", desc: "Early payment terms increasing cash outflow by $27.9K across 12 invoices.", impact: "$27,850", confidence: 78, evidence: "AP_Terms_Drift_May.csv", proofTrail: "PT-1243", action: "Review", actionTone: "warning" },
  { rank: 4, finding: "Marketing ad spend variance", risk: "Medium", desc: "Google Ads Q4 spend up 22% vs plan. ROI down 18%.", impact: "$12,300", confidence: 75, evidence: "Google_Ads_Q4_Campaign.pdf", proofTrail: "PT-1241", action: "Approve", actionTone: "primary" },
];

export const chatHistory = [
  { id: "ch-pin1", title: "What changed this week...", updated: "10:42 AM", pinned: true },
  { id: "ch-pin2", title: "Top renewal risks this month", updated: "May 25", pinned: true },
  { id: "ch-pin3", title: "Savings opportunities Q2", updated: "May 24", pinned: true },
  { id: "ch-today1", title: "What should I approve next?", updated: "9:15 AM" },
  { id: "ch-today2", title: "Spend leakage summary", updated: "8:07 AM" },
  { id: "ch-today3", title: "Vendor contract renewals", updated: "7:22 AM" },
  { id: "ch-today4", title: "Cash flow impact forecast", updated: "6:41 AM" },
  { id: "ch-today5", title: "Invoice mismatches > $10K", updated: "6:02 AM" },
  { id: "ch-yest1", title: "Q2 forecast vs target", updated: "May 25" },
  { id: "ch-yest2", title: "Marketing spend analysis", updated: "May 25" },
  { id: "ch-yest3", title: "Duplicate payments review", updated: "May 24" },
];

export const chatSeed = [
  { role: "user", content: "What changed this week and what should I approve next?" },
  {
    role: "assistant",
    content: "Here's what changed this week and the top actions I recommend you approve. All findings are grounded in your data sources and proof trails.",
    showTopChanges: true,
    confidence: 92,
  },
];

// Excel Workspace data
export const excelWorkbookRows = [
  { id: 1, source: "Spend_Analysis_May2026.xlsx", row: 12241, description: "Office Depot – Office supplies", amount: 18742.19, category: "Office Supplies", anomaly: "Duplicate", confidence: 95, suggestedFix: "Keep first, void duplicate", owner: "Michael W.", approvalState: "Pending" },
  { id: 2, source: "Vendor_Payments_May.csv", row: 15882, description: "Google Ads – Digital advertising", amount: 24500.0, category: "Marketing", anomaly: "High spend", confidence: 89, suggestedFix: "Review budget overrun", owner: "Sarah K.", approvalState: "Review" },
  { id: 3, source: "Contracts_Master.xlsx", row: 8771, description: "Acme Corp – CRM Renewal", amount: 72000.0, category: "Software", anomaly: "At risk", confidence: 93, suggestedFix: "Renegotiate terms", owner: "James T.", approvalState: "Pending" },
  { id: 4, source: "Bank_Statements_May.csv", row: 22119, description: "ABC Logistics – Freight", amount: 9850.0, category: "Logistics", anomaly: "Uncoded", confidence: 75, suggestedFix: "Add category = Freight", owner: "Priya N.", approvalState: "Not started" },
  { id: 5, source: "Sales_May.xlsx", row: 5440, description: "Enterprise Subscription – ACME", amount: 120000.0, category: "Revenue", anomaly: "Forecast var.", confidence: 82, suggestedFix: "Update forecast", owner: "Daniel R.", approvalState: "Pending" },
  { id: 6, source: "AP_Invoices_May.csv", row: 9002, description: "Staples – Office supplies", amount: 2345.67, category: "Office Supplies", anomaly: "Price variance", confidence: 78, suggestedFix: "Validate pricing", owner: "Michael W.", approvalState: "Review" },
  { id: 7, source: "Travel_Expenses_May.csv", row: 17221, description: "Sarah Kim – Business Travel", amount: 3812.0, category: "Travel", anomaly: "Policy breach", confidence: 90, suggestedFix: "Request receipt", owner: "HR Team", approvalState: "Pending" },
  { id: 8, source: "Inventory_May.xlsx", row: 3110, description: "Wireless Mouse MX3", amount: 1240.0, category: "Inventory", anomaly: "Low stock", confidence: 88, suggestedFix: "Create suggestion", owner: "Ops Team", approvalState: "Not started" },
  { id: 9, source: "Budget_Forecast_Q2.xlsx", row: 4552, description: "Acme Corp", amount: 0, category: "CRM", anomaly: "Missing owner", confidence: 71, suggestedFix: "Reassign account owner", owner: "Daniel R.", approvalState: "Review" },
  { id: 10, source: "Finance_Summary_May.xlsx", row: 1221, description: "Marketing Budget – Q2", amount: 0, category: "Budget", anomaly: "Formula issue", confidence: 64, suggestedFix: "Fix formula in H12", owner: "Finance", approvalState: "Pending" },
  { id: 11, source: "Vendor_List_2025.csv", row: 3319, description: "TechSoft LLC", amount: 0, category: "Vendors", anomaly: "Inactive vendor", confidence: 88, suggestedFix: "Review vendor status", owner: "Procurement", approvalState: "Review" },
];

export const excelAiFindings = [
  { rank: 1, label: "Spend leakage detected", impact: "$3.21M", confidence: 92, count: 47 },
  { rank: 2, label: "Duplicate payments found", impact: "$280K", confidence: 89, count: 32 },
  { rank: 3, label: "Forecast variance increasing", impact: "-$430K", confidence: 78, count: 18 },
  { rank: 4, label: "Contracts auto-renewing at risk", impact: "$612K", confidence: 85, count: 12 },
  { rank: 5, label: "Missing owners on key accounts", impact: "$1.14M", confidence: 71, count: 27 },
];

export const excelSpendByCategory = [
  { category: "Software", amount: 420, pct: 34.7 },
  { category: "Marketing", amount: 310, pct: 25.6 },
  { category: "Consulting", amount: 180, pct: 14.9 },
  { category: "Office Supplies", amount: 120, pct: 9.9 },
  { category: "Travel", amount: 95, pct: 7.8 },
  { category: "Other", amount: 85, pct: 7.0 },
];

export const excelForecastTrend = [
  { month: "Jan '26", value: 280 },
  { month: "Feb '26", value: 120 },
  { month: "Mar '26", value: 80 },
  { month: "Apr '26", value: -40 },
  { month: "May '26", value: -200 },
  { month: "Jun '26", value: -430 },
];

export const excelProofTrail = [
  { row: 12241, finding: "Duplicate payment", action: "Keep first, void duplicate", approval: "Pending", link: "PT-1247" },
  { row: 8771, finding: "Contract at risk", action: "Renegotiate renewal", approval: "Pending", link: "PT-1245" },
  { row: 5440, finding: "Forecast variance", action: "Update forecast", approval: "Pending", link: "PT-1245" },
  { row: 17221, finding: "Policy breach", action: "Request receipt", approval: "Pending", link: "PT-1241" },
  { row: 15882, finding: "High spend", action: "Review budget", approval: "Review", link: "PT-1239" },
];

export const excelConnectors = [
  { name: "Excel / CSV Upload", rows: "1.24M rows", synced: "2m ago", status: "Healthy", icon: "XL" },
  { name: "Google Sheets", rows: "286K rows", synced: "3m ago", status: "Healthy", icon: "GS" },
  { name: "CRM Export", rows: "412K rows", synced: "5m ago", status: "Healthy", icon: "CR" },
  { name: "Finance Upload", rows: "198K rows", synced: "8m ago", status: "Healthy", icon: "FU" },
  { name: "Business Live Webhook", rows: "Streaming", synced: "Live data", status: "Healthy", icon: "BL" },
];

// Savings Radar
export const savingsOpportunities = [
  { id: "S-1", title: "Renegotiate Microsoft EA", category: "Contract", severity: "Critical", impact: 245000, confidence: 94, owner: "Procurement", evidence: "Microsoft_EA_Renewal_Quote.pdf", action: "Renegotiate pricing – 15-20% reduction possible" },
  { id: "S-2", title: "Reclaim unused SaaS licenses", category: "Spend", severity: "High", impact: 120000, confidence: 89, owner: "Finance", evidence: "SaaS_Usage_May_2026.xlsx", action: "Reclaim 298 idle seats across 4 tools" },
  { id: "S-3", title: "Dispute invoice overage INV-2291", category: "Invoice", severity: "High", impact: 27850, confidence: 78, owner: "Finance", evidence: "AP_Invoices_May.xlsx", action: "Open dispute and attach signed rate card evidence" },
  { id: "S-4", title: "Assign owners to recurring charges", category: "Governance", severity: "Medium", impact: 15600, confidence: 71, owner: "Ops", evidence: "Contracts_Master.xlsx", action: "Notify department leads to claim ownership" },
  { id: "S-5", title: "FX variance on EU subscriptions", category: "Spend", severity: "Medium", impact: 9800, confidence: 73, owner: "Finance", evidence: "ledger_q1.csv – EUR block", action: "Lock annual billing to reduce FX drift" },
  { id: "S-6", title: "Consolidate duplicate research tools", category: "Spend", severity: "Medium", impact: 8400, confidence: 84, owner: "Ops", evidence: "card_spend_april.csv – rows 42, 119", action: "Consolidate seats into one vendor before next billing" },
];

export const savingsTrend = [
  { month: "Jan", captured: 12, potential: 28 },
  { month: "Feb", captured: 18, potential: 34 },
  { month: "Mar", captured: 22, potential: 41 },
  { month: "Apr", captured: 31, potential: 48 },
  { month: "May", captured: 39, potential: 56 },
  { month: "Jun", captured: 47, potential: 64 },
];

// Agents
export const agents = [
  { id: "A-1", name: "Contract Analyst", role: "Reviewing renewal windows and clauses", status: "Active", confidence: 94, workload: 78, outputs: 24, blocked: 1, lastRun: "2m ago", guardrail: "Cannot send emails without approval" },
  { id: "A-2", name: "Spend Auditor", role: "Detecting duplicate and drifting spend", status: "Active", confidence: 88, workload: 62, outputs: 18, blocked: 2, lastRun: "3m ago", guardrail: "Cannot cancel vendors automatically" },
  { id: "A-3", name: "Revenue Analyst", role: "Tracking revenue and forecasts", status: "Waiting", confidence: 82, workload: 35, outputs: 12, blocked: 0, lastRun: "8m ago", guardrail: "Read-only on revenue tables" },
  { id: "A-4", name: "Excel Analyst", role: "Processing files and spreadsheet data", status: "Active", confidence: 79, workload: 71, outputs: 27, blocked: 0, lastRun: "1m ago", guardrail: "Cannot modify source files" },
  { id: "A-5", name: "Report Builder", role: "Preparing board-ready reports", status: "Active", confidence: 91, workload: 45, outputs: 8, blocked: 3, lastRun: "5m ago", guardrail: "Cannot distribute without approval" },
];

// Approvals
export const approvals = [
  { id: "AP-501", title: "Approve vendor contract renewal", sub: "TechSoft Solutions – 12mo renewal", agent: "Contract Analyst", impact: 245000, confidence: 94, requested: "14m overdue", priority: "High", evidence: "Microsoft_EA_Renewal_Quote.pdf", evidenceRef: "PT-1247", action: "Renegotiate terms and renew at 15% discount. Target: $208K.", state: "Pending" },
  { id: "AP-498", title: "Increase marketing ad spend", sub: "Google Ads – Q4 campaign", agent: "Spend Auditor", impact: 120000, confidence: 87, requested: "1h 12m", priority: "Medium", evidence: "SaaS_Usage_May_2026.xlsx", evidenceRef: "PT-1245", action: "Reclaim licenses, end of month cleanup.", state: "Pending" },
  { id: "AP-495", title: "Write off aged receivable", sub: "Acme Corp – $42,500", agent: "Invoice Reconciler", impact: 42500, confidence: 90, requested: "2h 5m", priority: "High", evidence: "AP_Invoices_May.xlsx", evidenceRef: "PT-1243", action: "Open dispute and attach signed rate card.", state: "In review" },
  { id: "AP-491", title: "Approve new vendor onboarding", sub: "CloudScale LLC", agent: "Governance Keeper", impact: 18000, confidence: 76, requested: "4h 32m", priority: "Low", evidence: "Vendors_Master.xlsx", evidenceRef: "PT-1241", action: "Notify department leads to claim ownership.", state: "Pending" },
  { id: "AP-486", title: "Update Q4 forecast assumptions", sub: "Revenue model revision", agent: "Revenue Analyst", impact: 43000, confidence: 83, requested: "2d ago", priority: "Medium", evidence: "Forecast_Q4.xlsx", evidenceRef: "PT-1239", action: "Revise assumptions and resubmit to board.", state: "Pending" },
];

// Evidence pipeline
export const evidencePipeline = [
  { id: "E-01", name: "Microsoft_EA_Renewal_Quote.pdf", type: "PDF", stage: "Confirmed", fields: 24, coverage: 96 },
  { id: "E-02", name: "SaaS_Usage_May_2026.xlsx", type: "XLSX", stage: "Confirmed", fields: 512, coverage: 100 },
  { id: "E-03", name: "AP_Invoices_May.csv", type: "CSV", stage: "Review", fields: 148, coverage: 71 },
  { id: "E-04", name: "Vendor_Benchmark_Report.pdf", type: "PDF", stage: "Confirmed", fields: 18, coverage: 100 },
  { id: "E-05", name: "Forecast_Q4.xlsx", type: "XLSX", stage: "Extracting", fields: 0, coverage: 14 },
];

// Connectors
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

// Reports
export const reports = [
  { id: "R-1", name: "Weekly risk report", type: "Risk", period: "Wk 27", status: "Ready", findings: 18, updated: "Today" },
  { id: "R-2", name: "Savings proof pack", type: "Savings", period: "Q2", status: "Ready", findings: 12, updated: "Yesterday" },
  { id: "R-3", name: "Renewal risk report", type: "Contract", period: "Jul", status: "Draft", findings: 6, updated: "2d ago" },
  { id: "R-4", name: "Action history", type: "Audit", period: "All", status: "Ready", findings: 41, updated: "3d ago" },
];

// Nav sections (all 10 core sections visible in top nav)
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

export const moreSections = [];

// Utilities
export function formatCurrency(value) {
  if (typeof value !== "number") return value;
  if (Math.abs(value) >= 1_000_000)
    return `$${(value / 1_000_000).toFixed(2)}M`;
  if (Math.abs(value) >= 1_000)
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export function formatCurrencyFull(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

// Alias for backward compat
export const findings = proofBackedFindings;
export const commandActivity = [
  { id: "act1", agent: "Contract Analyst", text: "flagged Microsoft EA renewal window closes in 12 days", time: "2m ago", tone: "critical" },
  { id: "act2", agent: "Spend Auditor", text: "found 298 unused SaaS licenses across 4 tools", time: "18m ago", tone: "warning" },
  { id: "act3", agent: "Excel Analyst", text: "matched INV-2291 to contract rate — 18% variance detected", time: "41m ago", tone: "evidence" },
  { id: "act4", agent: "Governance Keeper", text: "requested owners for 14 recurring charges", time: "1h ago", tone: "warning" },
  { id: "act5", agent: "Report Builder", text: "prepared Q2 savings proof pack — 12 findings included", time: "3h ago", tone: "primary" },
];
