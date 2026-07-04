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

// ── Savings Radar ─────────────────────────────────────────────────────────────

export const savingsRadarKpis = [
  { id: "risk",        label: "Total money at risk",      value: "$16.44M", trend: "+18.6% vs last 7 days", trendDir: "up",   tone: "critical",  confidence: "High",   ring: 72, spark: [9,10,11,12,11,13,14,15,15,16.44] },
  { id: "savings",     label: "Savings opportunities",    value: "$4.87M",  trend: "+12.3% vs last 7 days", trendDir: "up",   tone: "primary",   confidence: "High",   ring: 87, spark: [2.8,3.0,3.3,3.5,3.8,4.0,4.2,4.5,4.7,4.87] },
  { id: "risks",       label: "High confidence risks",    value: "23",      trend: "+15% vs last 7 days",   trendDir: "up",   tone: "critical",  confidence: "High",   ring: 92, spark: [12,13,14,15,15,16,18,19,21,23] },
  { id: "renewal",     label: "Renewal exposure",         value: "$7.62M",  trend: "+7% vs last 7 days",    trendDir: "up",   tone: "warning",   confidence: "Medium", ring: 68, spark: [5.1,5.4,5.6,5.8,6.0,6.3,6.7,7.0,7.3,7.62] },
  { id: "leakage",     label: "Spend leakage exposure",   value: "$3.21M",  trend: "+15% vs last 7 days",   trendDir: "up",   tone: "critical",  confidence: "High",   ring: 80, spark: [2.1,2.2,2.4,2.5,2.6,2.8,2.9,3.0,3.1,3.21] },
  { id: "duplicates",  label: "Duplicate payments",       value: "$1.23M",  trend: "+23% vs last 7 days",   trendDir: "up",   tone: "warning",   confidence: "High",   ring: 91, spark: [0.7,0.75,0.8,0.88,0.9,0.95,1.0,1.08,1.15,1.23] },
  { id: "approvals",   label: "Open approvals",           value: "8",       trend: "3 urgent",               trendDir: "up",   tone: "warning",   confidence: "Medium", ring: 65, spark: [3,3,4,4,5,5,6,6,7,8] },
  { id: "prooftrails", label: "Proof trails",             value: "1,247",   trend: "+14% vs last 7 days",   trendDir: "up",   tone: "evidence",  confidence: "High",   ring: 84, spark: [900,950,980,1020,1060,1100,1140,1180,1210,1247] },
];

export const savingsRadarOpportunities = [
  {
    id: 1, riskId: "SR-001",
    title: "Microsoft renewal above benchmark",
    subtitle: "EA renewal is 18-22% above benchmark",
    category: "Renewal Risk", severity: "High",
    confidence: 92, impact: 2450000, impactStr: "$2.45M",
    evidenceFile: "Microsoft_EA.pdf", evidenceLabel: "Microsoft_EA_Renewal_Quote.pdf", evidenceDate: "May 23, 2026",
    proofTrail: "PT-1247",
    action: "Renegotiate terms", actionSub: "Target 15-20% reduction",
    actionState: null,
    owner: "Sarah K.",
  },
  {
    id: 2, riskId: "SR-002",
    title: "Unused SaaS licenses",
    subtitle: "298 seats unused for > 60 days",
    category: "Spend Leakage", severity: "High",
    confidence: 89, impact: 1150000, impactStr: "$1.15M",
    evidenceFile: "SaaS_Usage.xlsx", evidenceLabel: "SaaS_Usage_May_2026.xlsx", evidenceDate: "May 24, 2026",
    proofTrail: "PT-1245",
    action: "Reclaim or reassign", actionSub: "End of month cleanup",
    actionState: "In progress",
    owner: "James T.",
  },
  {
    id: 3, riskId: "SR-003",
    title: "Duplicate vendor payments",
    subtitle: "32 duplicates across AP & cards",
    category: "Data Quality", severity: "High",
    confidence: 91, impact: 280000, impactStr: "$280K",
    evidenceFile: "AP_Invoices.xlsx", evidenceLabel: "AP_Invoices_May.xlsx", evidenceDate: "May 24, 2026",
    proofTrail: "PT-1239",
    action: "Void duplicates", actionSub: "Recover overpayments",
    actionState: "Review",
    owner: "Daniel R.",
  },
  {
    id: 4, riskId: "SR-004",
    title: "Payment terms drift",
    subtitle: "Net 30 vs Net 15 in 27% of invoices",
    category: "Financial Risk", severity: "Medium",
    confidence: 78, impact: 820000, impactStr: "$820K",
    evidenceFile: "AP_Terms_Drift.csv", evidenceLabel: "AP_Terms_Drift_May.csv", evidenceDate: "May 24, 2026",
    proofTrail: "PT-1243",
    action: "Standardize terms", actionSub: "Net 30 to Net 15",
    actionState: null,
    owner: "Sarah K.",
  },
  {
    id: 5, riskId: "SR-005",
    title: "Contract auto-renews",
    subtitle: "12 contracts auto-renewing soon",
    category: "Renewal Risk", severity: "Medium",
    confidence: 85, impact: 612000, impactStr: "$612K",
    evidenceFile: "Contracts_Master.xlsx", evidenceLabel: "Contracts_Master.xlsx", evidenceDate: "May 24, 2026",
    proofTrail: "PT-1241",
    action: "Add opt-out notice", actionSub: "Calendar reminders",
    actionState: null,
    owner: "Michael W.",
  },
  {
    id: 6, riskId: "SR-006",
    title: "Inventory overstock",
    subtitle: "Excess inventory across 4 SKUs",
    category: "Inventory", severity: "Medium",
    confidence: 73, impact: 438000, impactStr: "$438K",
    evidenceFile: "Inventory_Aging.xlsx", evidenceLabel: "Inventory_Aging_May.xlsx", evidenceDate: "May 24, 2026",
    proofTrail: "PT-1231",
    action: "Adjust purchase plan", actionSub: "Reduce overstock",
    actionState: "Review",
    owner: "Priya N.",
  },
  {
    id: 7, riskId: "SR-007",
    title: "Forecast variance increase",
    subtitle: "Q4 revenue exceeds 10%",
    category: "Forecasting", severity: "Low",
    confidence: 64, impact: -430000, impactStr: "-$430K",
    evidenceFile: "Forecast_Variance_Q4.xlsx", evidenceLabel: "Forecast_Variance_Q4.xlsx", evidenceDate: "May 24, 2026",
    proofTrail: "PT-1222",
    action: "Re-forecast Q4", actionSub: "Update assumptions",
    actionState: "Monitoring",
    owner: "James T.",
  },
  {
    id: 8, riskId: "SR-008",
    title: "Marketing ad spend leakage",
    subtitle: "Low performing campaigns",
    category: "Spend Leakage", severity: "Low",
    confidence: 61, impact: 196000, impactStr: "$196K",
    evidenceFile: "Google_Ads_Q4.xlsx", evidenceLabel: "Google_Ads_Q4_Campaigns.xlsx", evidenceDate: "May 24, 2026",
    proofTrail: "PT-1227",
    action: "Pause & reallocate", actionSub: "Focus on ROAS > 3",
    actionState: null,
    owner: "Riva N.",
  },
];

export const savingsRadarTimeline = [
  { id: "t1", date: "May 22, 10:15 AM", title: "Microsoft renewal above benchmark",   subtitle: "$2.45M opportunity",   tone: "critical", category: "Renewal Risk" },
  { id: "t2", date: "May 23, 9:41 AM",  title: "Unused SaaS licenses detected",        subtitle: "$1.15M opportunity",   tone: "warning",  category: "Spend Leakage" },
  { id: "t3", date: "May 23, 11:02 AM", title: "Duplicate payments found",             subtitle: "$280K opportunity",    tone: "critical", category: "Data Quality" },
  { id: "t4", date: "May 24, 8:37 AM",  title: "Payment terms drift increasing",       subtitle: "$820K opportunity",    tone: "warning",  category: "Financial Risk" },
  { id: "t5", date: "May 24, 10:06 AM", title: "Inventory overstock identified",       subtitle: "$438K opportunity",    tone: "warning",  category: "Inventory" },
  { id: "t6", date: "May 24, 1:14 PM",  title: "Forecast variance Q4 increased",       subtitle: "-$430K risk",          tone: "evidence", category: "Forecasting" },
  { id: "t7", date: "May 24, 3:22 PM",  title: "Marketing spend leakage detected",     subtitle: "$196K opportunity",    tone: "warning",  category: "Spend Leakage" },
];

export const savingsRadarDetail = {
  title: "Microsoft renewal above benchmark",
  badge: "High",
  badgeTone: "critical",
  state: "Open",
  estimatedImpact: "$2.45M",
  impactSub: "Annual opportunity",
  confidence: 92,
  confidenceLabel: "High",
  category: "Renewal Risk",
  owner: "Sarah K.",
  ownerRole: "Procurement",
  dueDate: "May 30, 2026",
  dueSub: "4 days",
  riskNarrative: "Microsoft EA renewal quote is 18-22% above benchmark for similar scope and usage. Negotiation opportunities exist on price, licensing mix, and payment terms.",
  impactBreakdown: [
    { label: "Price uplift",  value: "$1.68M", pct: 68 },
    { label: "Licensing mix", value: "$520K",  pct: 21 },
    { label: "Payment terms", value: "$270K",  pct: 11 },
  ],
  supportingEvidence: [
    { name: "Microsoft_EA_Renewal_Quote.pdf", type: "PDF", date: "May 22, 2026", size: "2.4 MB" },
    { name: "EA_Benchmark_2026.xlsx",          type: "XLSX", date: "May 22, 2026", size: "1.1 MB" },
    { name: "License_Usage_Report.csv",        type: "CSV",  date: "May 20, 2026", size: "942 KB" },
  ],
  extractedFacts: [
    "EA renewal quote: $3.42M",
    "Benchmark range: $2.81M – $2.90M",
    "Price delta: 18–22% above benchmark",
    "Payment terms: Annual upfront",
  ],
  recommendedAgent: "Contract Analyst",
  recommendedAgentDesc: "Renegotiate Microsoft EA terms\nTarget 15–20% savings",
  nextActions: [
    "Prepare negotiation brief",
    "Identify low-utilization SKUs",
    "Model savings scenarios",
  ],
};

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
  { id: "A-1", name: "Contract Analyst", role: "Contracts & obligations", status: "Active", confidence: 92, workload: 78, outputs: 23, outputsDelta: "+6", blocked: 0, guardrailsState: "Strict", lastRun: "2m ago", lastRunFull: "May 12, 10:42 AM", queue: 5, risks: "Renewal risk\nTerms risk", risksCount: 12, nextAction: "Review renewals\n12 pending", guardrail: "On / Strict" },
  { id: "A-2", name: "Spend Auditor", role: "Spend leakage & anomalies", status: "Active", confidence: 89, workload: 62, outputs: 19, outputsDelta: "+5", blocked: 0, guardrailsState: "Strict", lastRun: "5m ago", lastRunFull: "May 12, 10:39 AM", queue: 4, risks: "Spend leakage\nMaverick spend", risksCount: 9, nextAction: "Investigate leakage\n9 queued", guardrail: "On / Strict" },
  { id: "A-3", name: "Finance Watcher", role: "Financial health & trends", status: "Active", confidence: 85, workload: 35, outputs: 15, outputsDelta: "+4", blocked: 0, guardrailsState: "Standard", lastRun: "7m ago", lastRunFull: "May 12, 10:37 AM", queue: 2, risks: "Cash flow\nBudget variance", risksCount: 5, nextAction: "Validate forecast\n5 queued", guardrail: "On / Standard" },
  { id: "A-4", name: "Excel Analyst", role: "Spreadsheets & models", status: "Active", confidence: 88, workload: 55, outputs: 18, outputsDelta: "+3", blocked: 0, guardrailsState: "Strict", lastRun: "4m ago", lastRunFull: "May 12, 10:40 AM", queue: 3, risks: "Model errors\nData quality", risksCount: 6, nextAction: "Check models\n6 queued", guardrail: "On / Strict" },
  { id: "A-5", name: "Report Builder", role: "Reports & summaries", status: "Idle", confidence: 91, workload: 22, outputs: 8, outputsDelta: "+2", blocked: 0, guardrailsState: "Standard", lastRun: "18m ago", lastRunFull: "May 12, 10:26 AM", queue: 0, risks: "Board reports\nKPIs", risksCount: 0, nextAction: "Build weekly pack\nDue 11:00 AM", guardrail: "On / Standard" },
  { id: "A-6", name: "Action Drafter", role: "Actions & recommendations", status: "Active", confidence: 87, workload: 48, outputs: 4, outputsDelta: "+1", blocked: 0, guardrailsState: "Strict", lastRun: "3m ago", lastRunFull: "May 12, 10:41 AM", queue: 4, risks: "Multi-category\nHigh impact", risksCount: 4, nextAction: "Draft actions\n4 pending", guardrail: "On / Strict" },
];

export const agentKpis = [
  { label: "Active agents", value: "6 / 6", sub: "All online", tone: "primary" },
  { label: "Queued workloads", value: 18, sub: "+2 vs last hour", tone: "neutral" },
  { label: "Outputs today", value: 87, sub: "+21 vs yesterday", tone: "primary" },
  { label: "Guardrail incidents", value: 2, sub: "+1 vs yesterday", tone: "warning" },
  { label: "Avg runtime", value: "2m 14s", sub: "+19% vs yesterday", tone: "neutral" },
  { label: "Approvals pending", value: 8, sub: "+3 vs yesterday", tone: "warning" },
  { label: "Agent confidence", value: "87%", sub: "+5 pts vs yesterday", tone: "primary" },
  { label: "External actions blocked", value: 12, sub: "+2 vs yesterday", tone: "critical" },
];

export const agentRunHistory = [
  { time: "10:42 AM", status: "completed", outputs: 23, incidents: 0, duration: null },
  { time: "10:21 AM", status: "completed", outputs: 19, incidents: 0, duration: "2m 02s" },
  { time: "10:01 AM", status: "completed", outputs: 17, incidents: 0, duration: "2m 31s" },
  { time: "09:40 AM", status: "completed", outputs: 21, incidents: 0, duration: null },
  { time: "09:19 AM", status: "completed", outputs: 13, incidents: 0, duration: "1m 56s" },
];

export const agentTaskBoard = {
  queued: [
    { title: "Extract clauses – Acme MSA", agent: "Contract Analyst", duration: "10m", confidence: null },
    { title: "Analyze spend pattern – Q4", agent: "Spend Auditor", duration: "15m", confidence: null },
    { title: "Validate budget �� Product Ops", agent: "Finance Watcher", duration: "20m", confidence: null },
  ],
  analyzing: [
    { title: "Renewal risk scan – 45 contracts", agent: "Contract Analyst", duration: null, confidence: 68 },
    { title: "Vendor spend deep dive", agent: "Spend Auditor", duration: null, confidence: 42 },
    { title: "Cash flow forecast update", agent: "Finance Watcher", duration: null, confidence: 55 },
  ],
  drafted: [
    { title: "MSA renewal summary", agent: "Contract Analyst", duration: null, confidence: null, flag: true },
    { title: "Spend leakage report", agent: "Spend Auditor", duration: null, confidence: null, flag: true },
    { title: "Forecast variance memo", agent: "Finance Watcher", duration: null, confidence: null, flag: true },
  ],
  completed: [
    { title: "Renegotiate Acme MSA\n$245K impact", agent: "Contract Analyst", duration: null, confidence: null },
    { title: "Remove Maverick spend\n$120K impact", agent: "Spend Auditor", duration: null, confidence: null },
    { title: "Standardize terms – Intech\n$85K impact", agent: "Finance Watcher", duration: null, confidence: null },
    { title: "Terminate unused addendum – Stark\n$62K impact", agent: "Contract Analyst", duration: null, confidence: null },
  ],
};

export const agentDetailByName = {
  "Contract Analyst": {
    status: "Active",
    description: "Analyzes contracts, terms, renewals, and obligations to identify risks and opportunities.",
    workload: "High 78%",
    workloadTone: "critical",
    lastRun: "2m ago\nMay 12, 10:42 AM",
    outputs24h: 23,
    outputsDelta: "+6 vs yesterday",
    confidence: 92,
    guardrails: "On / Strict",
    allowedTools: ["Contract parser", "Clause extractor", "Risk classifier", "OCR", "Web lookup"],
    blockedActions: [
      "Send emails",
      "Create / modify records in external systems",
      "Payments / fund transfers",
      "Execute vendor notifications",
    ],
    recentOutputs: [
      { title: "Acme Manufacturing – MSA review", time: "10:42 AM", state: "New" },
      { title: "Globex – Renewal risk summary", time: "10:38 AM", state: "New" },
      { title: "Intech – Term compliance check", time: "10:37 AM", state: "Review" },
      { title: "Stark Industries – Auto-renewal alert", time: "10:33 AM", state: "New" },
      { title: "Cyberdyne – Liability clause analysis", time: "10:30 AM", state: "Review" },
    ],
    proofTrails: [
      { id: "PT-1247", title: "Acme MSA – Payment risk", time: "10:42 AM" },
      { id: "PT-1245", title: "Globex – Renewal terms extraction", time: "10:40 AM" },
      { id: "PT-1243", title: "Intech – Term compliance", time: "10:39 AM" },
    ],
    currentTasks: [
      { title: "Review Acme MSA auto-renewal", priority: "High", eta: "2m" },
      { title: "Extract indemnity clauses – Globex", priority: "High", eta: "5m" },
      { title: "Identify change of control – Intech", priority: "Medium", eta: "7m" },
      { title: "Check termination terms – Stark", priority: "Medium", eta: "10m" },
      { title: "Generate renewal calendar – Cyberdyne", priority: "Low", eta: "12m" },
    ],
    approvalQueue: [
      { title: "Renegotiate auto-renewal – Acme MSA", impact: "$245K impact", due: "Due in 14m", priority: "Urgent" },
      { title: "Remove unfavorable liability – Globex", impact: "$120K impact", due: "Due in 1h 12m", priority: "High" },
      { title: "Standardize payment terms – Intech", impact: "$85K impact", due: "Due in 2h 5m", priority: "Medium" },
      { title: "Terminate unused addendum – Stark", impact: "$62K impact", due: "Due in 4h 32m", priority: "Low" },
    ],
  },
};

// ── Approvals Dashboard ───────────────────────────────────────────────────────

export const approvalsKpis = [
  { id: "open",         label: "Open Approvals",        value: "24",    trend: "+6 vs last 7 days",  trendDir: "up",   tone: "warning",  confidence: "High",   ring: 78, spark: [14,15,16,17,18,19,20,21,22,24] },
  { id: "urgent",       label: "Urgent Approvals",      value: "6",     trend: "+2 vs last 7 days",  trendDir: "up",   tone: "critical", confidence: "High",   ring: 90, spark: [2,2,3,3,3,4,4,4,5,6] },
  { id: "approved",     label: "Approved Actions",      value: "87",    trend: "+18% vs last 7 days",trendDir: "up",   tone: "primary",  confidence: "High",   ring: 87, spark: [50,55,58,62,65,69,73,78,82,87] },
  { id: "rejected",     label: "Rejected Actions",      value: "12",    trend: "-3 vs last 7 days",  trendDir: "down", tone: "critical", confidence: "High",   ring: 65, spark: [18,17,17,16,15,15,14,13,13,12] },
  { id: "snoozed",      label: "Snoozed Items",         value: "5",     trend: "— vs last 7 days",   trendDir: "flat", tone: "warning",  confidence: "Medium", ring: 55, spark: [4,5,4,5,5,4,5,5,4,5] },
  { id: "review",       label: "Avg Review Time",       value: "28m",   trend: "+12% vs last 7 days",trendDir: "up",   tone: "evidence", confidence: "Medium", ring: 72, spark: [18,20,21,22,23,24,25,26,27,28] },
  { id: "impact",       label: "Est. Impact in Queue",  value: "$3.21M",trend: "Across 24 actions",  trendDir: "up",   tone: "primary",  confidence: "High",   ring: 84, spark: [1.8,1.9,2.1,2.3,2.5,2.7,2.9,3.0,3.1,3.21] },
  { id: "owners",       label: "Owners Waiting",        value: "7",     trend: "Across 6 owners",    trendDir: "flat", tone: "warning",  confidence: "Medium", ring: 68, spark: [4,4,5,5,5,6,6,7,7,7] },
  { id: "completeness", label: "Evidence Completeness", value: "84%",   trend: "+6% vs last 7 days", trendDir: "up",   tone: "evidence", confidence: "High",   ring: 84, spark: [68,70,72,74,76,78,80,82,83,84] },
];

export const approvalsQueue = [
  { id: "AQ-001", priority: "High",   urgency: "Urgent",   title: "Approve vendor contract renewal", sub: "TechSoft Solutions – 12mo renewal",  impact: 245000, impactStr: "$245K", impactSub: "Save 15-20%",   owner: "Michael Wong", ownerRole: "Procurement", evidenceDocs: 12, proofTrail: "PT-1247", status: "Urgent",   due: "14m overdue",        dueUrgent: true,  agent: "Contract Analyst",  agentVer: "v2.3", confidence: 92 },
  { id: "AQ-002", priority: "Medium", urgency: "Due soon", title: "Increase marketing ad spend",      sub: "Google Ads – Q4 campaign",           impact: 120000, impactStr: "$120K", impactSub: "Est. impact",   owner: "Sarah Green",  ownerRole: "Marketing",   evidenceDocs: 8,  proofTrail: "PT-1245", status: "Due soon", due: "1h 12m",             dueUrgent: false, agent: "Spend Auditor",     agentVer: "v1.8", confidence: 89 },
  { id: "AQ-003", priority: "High",   urgency: "Due soon", title: "Write off aged receivable",        sub: "Acme Corp – $42,500",                impact: 42500,  impactStr: "$42.5K",impactSub: "Write-off",     owner: "Daniel Tran",  ownerRole: "Finance",     evidenceDocs: 6,  proofTrail: "PT-1243", status: "Due soon", due: "2h 5m",              dueUrgent: false, agent: "Finance Watcher",   agentVer: "v2.1", confidence: 85 },
  { id: "AQ-004", priority: "Low",    urgency: "Review",   title: "Approve new vendor onboarding",    sub: "CloudScale LLC",                     impact: 18000,  impactStr: "$18K",  impactSub: "First year",    owner: "James Silva",  ownerRole: "Procurement", evidenceDocs: 9,  proofTrail: "PT-1241", status: "Review",   due: "4h 32m",             dueUrgent: false, agent: "Vendor Risk",       agentVer: "v1.6", confidence: 81 },
  { id: "AQ-005", priority: "Medium", urgency: "Review",   title: "Discount approval – Enterprise deal",sub: "Northwind – 15% discount",          impact: 85000,  impactStr: "$85K",  impactSub: "Est. impact",   owner: "Lisa Morgan",  ownerRole: "Sales",       evidenceDocs: 7,  proofTrail: "PT-1239", status: "Review",   due: "5h 10m",             dueUrgent: false, agent: "Deal Approver",     agentVer: "v1.9", confidence: 78 },
  { id: "AQ-006", priority: "Medium", urgency: "Review",   title: "Budget reallocation – Q4",         sub: "Events → Content",                   impact: 60000,  impactStr: "$60K",  impactSub: "Reallocate",    owner: "Arjun Kapoor", ownerRole: "Marketing",   evidenceDocs: 5,  proofTrail: "PT-1237", status: "Review",   due: "7h 45m",             dueUrgent: false, agent: "Budget Optimizer",  agentVer: "v2.0", confidence: 75 },
  { id: "AQ-007", priority: "Low",    urgency: "Snoozed",  title: "Approve PO increase",               sub: "Office Depot – PO #88912",          impact: 22000,  impactStr: "$22K",  impactSub: "Increase",      owner: "Michael Wong", ownerRole: "Procurement", evidenceDocs: 6,  proofTrail: "PT-1235", status: "Snoozed",  due: "Tomorrow 9:00 AM",   dueUrgent: false, agent: "Procure Guard",     agentVer: "v1.7", confidence: 76 },
  { id: "AQ-008", priority: "Medium", urgency: "Review",   title: "SaaS license renewal",              sub: "Datadog – 50 seats",                impact: 15000,  impactStr: "$15K",  impactSub: "Renewal",       owner: "Irene Tan",    ownerRole: "IT",          evidenceDocs: 4,  proofTrail: "PT-1233", status: "Review",   due: "Tomorrow 11:30 AM",  dueUrgent: false, agent: "IT Guardian",       agentVer: "v1.5", confidence: 84 },
];

export const approvalsDetail = {
  title: "Approve vendor contract renewal",
  sub: "TechSoft Solutions – 12mo renewal",
  badge: "High", badgeTone: "critical",
  urgency: "Urgent",
  requestedBy: "Michael Wong (Procurement)",
  requestedAt: "May 24, 2026 10:15 AM",
  estimatedImpact: "$245,000", impactSub: "Estimated annual savings",
  roi: "7.4x", roiSub: "ROI / Value ratio",
  reduction: "15–20%", reductionSub: "Target reduction",
  strategicPriority: "High",
  confidence: 92, confidenceLabel: "High",
  totalDocs: 12, dataSources: 7, extractedFacts: 38, completeness: 88,
  recommendedAction: "Approve the renewal with a negotiated 18–22% price reduction compared to the current benchmark.",
  rationale: [
    "Market benchmark shows 18–22% potential savings.",
    "Strong vendor performance and SLA compliance.",
    "No material risk flags detected.",
    "Finance confirms budget availability.",
  ],
  timeline: [
    { label: "Detected",        date: "May 22 8:41 AM",  done: true,  active: false },
    { label: "Agent analyzed",  date: "May 22 10:02 AM", done: true,  active: false },
    { label: "Drafted",         date: "May 22 10:15 AM", done: true,  active: false },
    { label: "Submitted",       date: "May 24 10:15 AM", done: true,  active: false },
    { label: "Under review",    date: "May 24 10:17 AM", done: false, active: true  },
    { label: "Decision made",   date: "—",               done: false, active: false },
    { label: "Action executed", date: "—",               done: false, active: false },
  ],
  sla: "4h", slaRisk: "At risk",
};

export const approvalsInsights = {
  byCategory: [
    { label: "Procurement", value: 9, pct: 38, color: "var(--primary)" },
    { label: "Finance",     value: 6, pct: 25, color: "var(--evidence)" },
    { label: "Marketing",   value: 4, pct: 17, color: "var(--warning)" },
    { label: "IT",          value: 3, pct: 12, color: "#6ee7b7" },
    { label: "Sales",       value: 2, pct: 8,  color: "#94a3b8" },
  ],
  byOwner: [
    { label: "Michael Wong", value: 9, max: 9 },
    { label: "Sarah Green",  value: 4, max: 9 },
    { label: "Daniel Tran",  value: 3, max: 9 },
    { label: "Lisa Morgan",  value: 2, max: 9 },
    { label: "Others",       value: 6, max: 9 },
  ],
  byUrgency: [
    { label: "Urgent",       value: 6,  pct: 25, color: "var(--critical)" },
    { label: "Due soon",     value: 7,  pct: 29, color: "var(--warning)" },
    { label: "Review",       value: 8,  pct: 33, color: "var(--evidence)" },
    { label: "Low priority", value: 3,  pct: 13, color: "#3a4440" },
  ],
};

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

// ── Connectors Dashboard ─────────────────────────────────────────────────────

export const connectorsKpis = [
  { id: "sources",   label: "Connected Sources",  value: "34",     sub: "20 active",           trend: "+3 vs last 7 days",  trendDir: "up",   tone: "primary",  ring: 84,  spark: [26,27,28,29,30,30,31,32,33,34] },
  { id: "events",    label: "Live Events Today",   value: "18,562", sub: "Streaming",           trend: "+12.4% vs yesterday",trendDir: "up",   tone: "evidence", ring: 78,  spark: [9200,10100,11000,12200,13100,14300,15200,16400,17400,18562] },
  { id: "rows",      label: "Rows Synced",         value: "1.42M",  sub: "Across all sources",  trend: "+18.7% vs yesterday",trendDir: "up",   tone: "primary",  ring: 92,  spark: [0.8,0.9,1.0,1.1,1.15,1.2,1.25,1.3,1.38,1.42] },
  { id: "health",    label: "Sync Health",         value: "98%",    sub: "Healthy",             trend: "+1 pts vs last 7 days",trendDir: "up",  tone: "primary",  ring: 98,  spark: [94,95,95,96,96,97,97,97,97,98] },
  { id: "failed",    label: "Failed Syncs",        value: "3",      sub: "Requires attention",  trend: "-40% vs last 7 days",trendDir: "down", tone: "critical", ring: 85,  spark: [8,7,7,6,5,5,4,4,3,3] },
  { id: "freshness", label: "Data Freshness",      value: "2m ago", sub: "Real-time",           trend: "Avg latency",        trendDir: "flat", tone: "evidence", ring: 95,  spark: null },
  { id: "coverage",  label: "Evidence Coverage",   value: "68%",    sub: "Good",                trend: "+5 pts vs last 7 days",trendDir: "up",  tone: "warning",  ring: 68,  spark: [55,57,58,59,61,62,63,65,66,68] },
  { id: "pending",   label: "Pending Reviews",     value: "24",     sub: "High priority",       trend: "+4 vs last 7 days",  trendDir: "up",   tone: "warning",  ring: 72,  spark: [14,15,16,17,18,19,20,21,22,24] },
];

export const connectorCatalog = {
  "FILES & SHEETS": [
    { id: "c-excel",  name: "Excel / CSV Upload", desc: "Upload files",               status: "Active",  icon: "xlsx" },
    { id: "c-gsheet", name: "Google Sheets",      desc: "Sync sheets",                status: "Active",  icon: "gsheet" },
  ],
  "FINANCE": [
    { id: "c-fin",    name: "Finance Upload",     desc: "Bank, AP, GL files",         status: "Active",  icon: "finance" },
  ],
  "CRM": [
    { id: "c-crm",    name: "CRM Export",         desc: "Salesforce, HubSpot, etc.",  status: "Active",  icon: "crm" },
  ],
  "COMMERCE": [
    { id: "c-biz",    name: "Business Live Webhook", desc: "Real-time business events", status: "Active", icon: "webhook" },
  ],
  "ADS": [
    { id: "c-url",    name: "URL Analysis",       desc: "Web content & competitors",  status: "Active",  icon: "url" },
  ],
};

export const connectorLocked = [
  { id: "cl-gmail",    name: "Gmail",              desc: "Email ingestion" },
  { id: "cl-gdrive",   name: "Google Drive",       desc: "Docs & files" },
  { id: "cl-qb",       name: "QuickBooks / Xero",  desc: "Accounting sync" },
  { id: "cl-shopify",  name: "Shopify / WooCommerce", desc: "Products & orders" },
  { id: "cl-hubspot",  name: "HubSpot / Pipedrive",desc: "CRM native sync" },
  { id: "cl-slack",    name: "Slack",              desc: "Team notifications" },
];

export const connectorDetail = {
  id: "c-biz",
  name: "Business Live Webhook",
  status: "Active",
  description: "Stream real-time events from your platform to GENIUS.",
  checklist: [
    { label: "Create endpoint",      sub: "Endpoint created",   done: true },
    { label: "Install plugin / script", sub: "Script installed", done: true },
    { label: "Map event fields",     sub: "7 fields mapped",    done: true },
    { label: "Test event",           sub: "Last test: 2m ago",  done: true },
    { label: "Start streaming",      sub: "Streaming live",     done: true },
  ],
  schemaMapping: [
    { field: "order_id",  example: "ORD-884512",            mappedTo: "Order ID",       dataType: "string",   required: true },
    { field: "customer",  example: "jane.doe@email.com",    mappedTo: "Customer Email", dataType: "string",   required: true },
    { field: "amount",    example: "129.99",                mappedTo: "Order Amount",   dataType: "number",   required: true },
    { field: "product",   example: "Premium Plan",          mappedTo: "Product Name",   dataType: "string",   required: false },
    { field: "status",    example: "completed",             mappedTo: "Order Status",   dataType: "string",   required: true },
    { field: "source",    example: "web",                   mappedTo: "Channel / Source", dataType: "string", required: false },
    { field: "timestamp", example: "2025-05-26T10:41:22Z",  mappedTo: "Event Time",     dataType: "datetime", required: true },
  ],
  eventStream: [
    { time: "10:42:31 AM", type: "purchase",        source: "web",       orderId: "ORD-884512", customer: "jane.doe@email.com",   amount: "$129.99", status: "completed", ingestion: "2s ago" },
    { time: "10:42:17 AM", type: "refund",           source: "web",       orderId: "REF-884498", customer: "john.smith@email.com", amount: "-$48.00", status: "refunded",  ingestion: "4s ago" },
    { time: "10:42:03 AM", type: "ad_spend_update",  source: "meta_ads",  orderId: "AD-557812",  customer: "acme_marketing",       amount: "$82.14",  status: "updated",   ingestion: "6s ago" },
    { time: "10:41:48 AM", type: "inventory_event",  source: "warehouse", orderId: "INV-331221", customer: "SKU-7891",             amount: "-3",      status: "reserved",  ingestion: "9s ago" },
    { time: "10:41:22 AM", type: "purchase",         source: "mobile_app",orderId: "ORD-884476", customer: "alice.wong@email.com", amount: "$199.00", status: "completed", ingestion: "11s ago" },
  ],
  pipeline: [
    { step: 1, label: "Live event",     sub: "purchase\nORD-884512",         icon: "cart" },
    { step: 2, label: "Extracted fact", sub: "Order amount\n$129.99",        icon: "doc" },
    { step: 3, label: "Metric update",  sub: "Revenue tracked\n+$129.99",    icon: "chart" },
    { step: 4, label: "Risk impact",    sub: "Low risk\nNo anomalies",        icon: "shield" },
    { step: 5, label: "Approval (if needed)", sub: "Auto-approved\nRules applied", icon: "check" },
    { step: 6, label: "Audit trail",    sub: "Proof trail\nPT-1247",         icon: "trail" },
  ],
};

export const connectorHealthPanel = {
  health: 98,
  label: "Healthy",
  sub: "All systems operational",
  latency: "1.8s",
  latencyLabel: "Good",
  errorRate: "0.12%",
  errorRateLabel: "Good",
  auth: {
    apiKey: "Connected",
    permissionScope: "Read / Write",
    lastVerified: "10m ago",
  },
  retryQueue: [
    { id: "ORD-884201", type: "purchase",        retries: 2 },
    { id: "ORD-884199", type: "purchase",        retries: 1 },
    { id: "INV-331112", type: "inventory_event", retries: 1 },
  ],
  webhookSecret: "whsec_••••••••••••••••••••a7b3",
};

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
  { id: "ev1", source: "Stripe", type: "invoice.paid", time: "12:42:21", status: "ok" },
  { id: "ev2", source: "Business Live", type: "vendor.updated", time: "12:39:58", status: "ok" },
  { id: "ev3", source: "Salesforce", type: "sync.retry", time: "12:32:10", status: "retry" },
  { id: "ev4", source: "QuickBooks", type: "bill.created", time: "12:21:44", status: "ok" },
  { id: "ev5", source: "Gmail", type: "thread.flagged", time: "11:59:02", status: "ok" },
];

export const liveEvents = [
  { id: "ev1", source: "Stripe", type: "invoice.paid", time: "12:04:21", status: "ok" },
  { id: "ev2", source: "Business Live", type: "vendor.updated", time: "12:03:58", status: "ok" },
  { id: "ev3", source: "Salesforce", type: "sync.retry", time: "12:02:10", status: "retry" },
  { id: "ev4", source: "QuickBooks", type: "bill.created", time: "12:01:44", status: "ok" },
  { id: "ev5", source: "Gmail", type: "thread.flagged", time: "11:59:02", status: "ok" },
];

// ── Reports Dashboard ─────────────────────────────────────────────────────────

export const reportsKpis = [
  { id: "readiness",  label: "Report Readiness",     value: "92%",   trend: "+12% vs last week", trendDir: "up", tone: "primary",  ring: 92, spark: [75,78,80,82,84,86,87,89,90,92] },
  { id: "generated",  label: "Reports Generated",    value: "28",    trend: "+4 vs last week",   trendDir: "up", tone: "evidence", ring: 80, spark: [18,19,20,21,22,23,24,25,26,28] },
  { id: "boardready", label: "Board-Ready Packs",    value: "6",     trend: "+1 vs last week",   trendDir: "up", tone: "primary",  ring: 75, spark: [3,3,4,4,4,5,5,5,5,6] },
  { id: "history",    label: "Action History Items", value: "312",   trend: "+28 vs last week",  trendDir: "up", tone: "warning",  ring: 84, spark: [240,250,260,270,276,284,290,298,305,312] },
  { id: "coverage",   label: "Proof Coverage",       value: "88%",   trend: "Across 24 reports", trendDir: "up", tone: "primary",  ring: 88, spark: [76,78,80,82,83,84,85,86,87,88] },
  { id: "approvals",  label: "Approvals Included",   value: "47",    trend: "+8 vs last week",   trendDir: "up", tone: "evidence", ring: 78, spark: [32,34,36,38,40,42,43,44,46,47] },
  { id: "published",  label: "Last Published",       value: "Today", trend: "May 24, 2026 10:17 AM", trendDir: "flat", tone: "primary", ring: 100, spark: null },
];

export const reportsLibrary = [
  {
    id: "RL-1", name: "Weekly Risk Report",    icon: "risk",
    status: "Board-ready", period: "May 18 – May 24, 2026",
    updated: "2m ago", formats: ["PDF", "XLSX"],
    findings: 18, approvals: 4, proofChain: 38, linkedEvidence: 24,
  },
  {
    id: "RL-2", name: "Savings Proof Pack",    icon: "savings",
    status: "Board-ready", period: "May 1 – May 24, 2026",
    updated: "1d ago", formats: ["PDF", "XLSX"],
    findings: 12, approvals: 6, proofChain: 29, linkedEvidence: 18,
  },
  {
    id: "RL-3", name: "Renewal Risk Report",   icon: "renewal",
    status: "In review", period: "Q2 2026",
    updated: "6h ago", formats: ["PDF", "XLSX"],
    findings: 6, approvals: 2, proofChain: 14, linkedEvidence: 9,
  },
  {
    id: "RL-4", name: "Action History",        icon: "history",
    status: "Board-ready", period: "May 1 – May 24, 2026",
    updated: "3h ago", formats: ["PDF", "XLSX"],
    findings: 41, approvals: 12, proofChain: 55, linkedEvidence: 41,
  },
  {
    id: "RL-5", name: "Executive Summary",     icon: "summary",
    status: "Draft", period: "May 24, 2026",
    updated: "5h ago", formats: ["PDF", "MD"],
    findings: 9, approvals: 3, proofChain: 10, linkedEvidence: 7,
  },
];

export const reportsDetail = {
  id: "RL-1",
  title: "Weekly Risk Report",
  badge: "Board-ready",
  autoRefresh: true,
  period: "May 18 – May 24, 2026",
  prepared: "May 24, 2026 10:17 AM",
  tabs: ["Executive Summary", "Metrics", "Findings", "Approvals", "Proof Chain", "Linked Evidence"],
  tabCounts: { Approvals: 4, "Proof Chain": 38, "Linked Evidence": 24 },
  // Executive Summary strip
  summaryStats: [
    { label: "High risk items",    value: "12",     trend: "+3 vs last week",  trendDir: "up",   tone: "critical" },
    { label: "At-risk spend",      value: "$3.21M", trend: "+$420K vs last week", trendDir: "up", tone: "critical" },
    { label: "Open approvals",     value: "6",      trend: "-2 vs last week",  trendDir: "down", tone: "warning" },
    { label: "Savings realized",   value: "$1.47M", trend: "+$220K vs last week", trendDir: "up", tone: "primary" },
    { label: "Avg. vendor score",  value: "74",     trend: "+6 vs last week",  trendDir: "up",   tone: "evidence", ring: 74 },
  ],
  description: "This report highlights material risks, vendor performance issues, and savings opportunities requiring leadership attention. All findings are backed by evidence and approved actions.",
  // Top findings
  topFindings: [
    { severity: "High",   title: "Approve vendor contract renewal",  sub: "TechSoft Solutions – 12mo renewal at risk of overpay.", value: "$245K", valueSub: "Potential impact" },
    { severity: "High",   title: "Write off aged receivables",        sub: "Acme Corp – $42,500",                                   value: "$42.5K", valueSub: "Potential impact" },
    { severity: "Medium", title: "Increase marketing ad spend",       sub: "Google Ads – Q4 campaign",                              value: "$120K", valueSub: "Est. impact" },
    { severity: "Low",    title: "Approve new vendor onboarding",     sub: "CloudScale LLC",                                        value: "$18K",  valueSub: "Est. impact" },
  ],
  // Risk exposure by category
  riskExposure: {
    total: "$3.21M",
    totalTrend: "-$420K vs last week",
    categories: [
      { label: "Vendor / Contract",   value: "$1.45M", pct: 45, color: "var(--critical)" },
      { label: "Financial / Liquidity",value: "$0.98M", pct: 30, color: "var(--warning)" },
      { label: "Compliance / Legal",  value: "$0.46M", pct: 14, color: "var(--evidence)" },
      { label: "Operational",         value: "$0.32M", pct: 11, color: "#3a4440" },
    ],
  },
  // Recent approvals
  recentApprovals: [
    { title: "Approve vendor contract renewal", owner: "Michael Wong", date: "May 24, 10:15 AM", status: "Approved" },
    { title: "Increase marketing ad spend",     owner: "Sarah Green",  date: "May 24, 9:02 AM",  status: "Approved" },
    { title: "Write off aged receivables",      owner: "Daniel Tran",  date: "May 24, 8:32 AM",  status: "Approved" },
    { title: "Discount approval – Enterprise deal", owner: "Lisa Morgan", date: "May 23, 6:45 PM", status: "Approved" },
  ],
};

export const reportsSummaryPanel = {
  proofCoverage: 88,
  proofCoverageItems: [
    { label: "Linked evidence",  value: 24 },
    { label: "Proof trail items",value: 38 },
    { label: "Exceptions",       value: 3  },
    { label: "Gaps identified",  value: 2  },
  ],
  boardStatus: {
    readiness: "Board-ready",
    qualityScore: "92%",
    lastReviewed: "May 24, 2026 10:17 AM",
    nextReview: "May 31, 2026",
  },
  includedApprovals: [
    { label: "Approved",     value: 41, tone: "primary" },
    { label: "In review",    value: 6,  tone: "evidence" },
    { label: "Rejected",     value: 0,  tone: "critical" },
    { label: "Not required", value: 3,  tone: "muted" },
  ],
  keyRisks: [
    { label: "Contract renewals at risk", value: "$245K", tone: "critical" },
    { label: "Aged receivables exposure", value: "$42.5K", tone: "warning" },
    { label: "Budget overspend – Q4",     value: "$220K", tone: "warning" },
  ],
  reportDetails: {
    id: "RPT-2026-05-24-0012",
    preparedBy: "Genius AI",
    dataAsOf: "May 24, 2026 10:17 AM",
    period: "May 18 – May 24, 2026",
    entities: "Acme Corporation",
  },
};

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
