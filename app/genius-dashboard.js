"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./page.module.css";

const navGroups = [
  {
    id: "command",
    title: "Command",
    titleKey: "navCommand",
    items: [
      { id: "chat", label: "Chat", short: "AI" },
      { id: "overview", label: "Dashboard", short: "DB" },
      { id: "data", label: "Data Intake", short: "DI" },
    ],
  },
  {
    id: "intelligence",
    title: "Intelligence",
    titleKey: "navIntelligence",
    items: [
      { id: "analytics", label: "Analytics", short: "AN" },
      { id: "leaks", label: "Savings Radar", short: "SR" },
      { id: "agents", label: "Agent Control", short: "AC" },
      { id: "approvals", label: "Approvals", short: "AP" },
      { id: "reports", label: "Board Reports", short: "BR" },
    ],
  },
  {
    id: "extensions",
    title: "Extensions",
    titleKey: "navExtensions",
    items: [
      { id: "plugins", label: "Future Plugins", short: "PX" },
    ],
  },
];

const baseLeaks = [
  {
    id: "leak-1",
    title: "Auto-renewal window closes in 12 days",
    titleKey: "leakAutoRenewalTitle",
    category: "Contract",
    categoryKey: "categoryContract",
    impact: 9600,
    confidence: "94%",
    severity: "Critical",
    owner: "Finance",
    ownerKey: "ownerFinance",
    source: "Acme Analytics MSA, page 4",
    sourceKey: "leakAutoRenewalSource",
    action: "Request cancellation terms and renewal discount.",
    actionKey: "leakAutoRenewalAction",
  },
  {
    id: "leak-2",
    title: "Duplicate research tools detected",
    titleKey: "leakDuplicateToolsTitle",
    category: "Spend",
    categoryKey: "categorySpend",
    impact: 3240,
    confidence: "87%",
    severity: "High",
    owner: "Ops",
    ownerKey: "ownerOps",
    source: "card_spend_april.csv, rows 42 and 119",
    sourceKey: "leakDuplicateToolsSource",
    action: "Consolidate seats into one vendor before June billing.",
    actionKey: "leakDuplicateToolsAction",
  },
  {
    id: "leak-3",
    title: "Invoice exceeds contract by 18%",
    titleKey: "leakInvoiceDriftTitle",
    category: "Invoice",
    categoryKey: "categoryInvoice",
    impact: 2180,
    confidence: "91%",
    severity: "Critical",
    owner: "Finance",
    ownerKey: "ownerFinance",
    source: "Northstar Cloud invoice INV-1042",
    sourceKey: "leakInvoiceDriftSource",
    action: "Ask vendor to credit overage against next invoice.",
    actionKey: "leakInvoiceDriftAction",
  },
  {
    id: "leak-4",
    title: "Vendor has no internal owner",
    titleKey: "leakMissingOwnerTitle",
    category: "Ops",
    categoryKey: "categoryOps",
    impact: 1420,
    confidence: "78%",
    severity: "Watch",
    owner: "CEO",
    ownerKey: "ownerCeo",
    source: "Vendor register import",
    sourceKey: "leakMissingOwnerSource",
    action: "Assign owner and review usage before renewal.",
    actionKey: "leakMissingOwnerAction",
  },
];

const agentProfiles = [
  {
    id: "contract",
    name: "Contract Analyst",
    nameKey: "agentContractName",
    status: "Reviewing",
    focus: "Extract dates, clauses, renewal risk, and evidence.",
    focusKey: "agentContractFocus",
    workload: "8 files",
    workloadKey: "agentContractWorkload",
    guardrail: "Cannot save extracted fields before human review.",
    guardrailKey: "agentContractGuardrail",
  },
  {
    id: "spend",
    name: "Spend Auditor",
    nameKey: "agentSpendName",
    status: "Active",
    focus: "Find duplicates, unused tools, and payment drift.",
    focusKey: "agentSpendFocus",
    workload: "312 rows",
    workloadKey: "agentSpendWorkload",
    guardrail: "Cannot mark savings as confirmed without approval.",
    guardrailKey: "agentSpendGuardrail",
  },
  {
    id: "finance",
    name: "Finance Watcher",
    nameKey: "agentFinanceName",
    status: "Monitoring",
    focus: "Watch renewal deadlines and missing owners.",
    focusKey: "agentFinanceFocus",
    workload: "31 vendors",
    workloadKey: "agentFinanceWorkload",
    guardrail: "Cannot contact vendors or cancel tools.",
    guardrailKey: "agentFinanceGuardrail",
  },
  {
    id: "action",
    name: "Action Drafter",
    nameKey: "agentActionName",
    status: "Waiting",
    focus: "Prepare emails, tasks, and manager summaries.",
    focusKey: "agentActionFocus",
    workload: "7 actions",
    workloadKey: "agentActionWorkload",
    guardrail: "Every draft goes to approvals first.",
    guardrailKey: "agentActionGuardrail",
  },
];

const approvals = [
  {
    id: "approval-1",
    title: "Send renewal discount request to Acme Analytics",
    titleKey: "approvalRenewalTitle",
    owner: "CEO approval",
    ownerKey: "approvalCeoOwner",
    impact: 9600,
    status: "Needs review",
  },
  {
    id: "approval-2",
    title: "Create internal task to remove unused research seats",
    titleKey: "approvalUnusedSeatsTitle",
    owner: "Ops approval",
    ownerKey: "approvalOpsOwner",
    impact: 1740,
    status: "Ready",
  },
  {
    id: "approval-3",
    title: "Ask Northstar Cloud for invoice correction",
    titleKey: "approvalInvoiceTitle",
    owner: "Finance approval",
    ownerKey: "approvalFinanceOwner",
    impact: 2180,
    status: "Needs review",
  },
];

const baseSources = [
  { id: "source-1", name: "Vendor contracts", nameKey: "sourceVendorContractsName", count: 18, status: "11 verified", statusKey: "sourceVendorContractsStatus", type: "PDF", health: 78 },
  { id: "source-2", name: "Invoices", nameKey: "sourceInvoicesName", count: 42, status: "6 need review", statusKey: "sourceInvoicesStatus", type: "PDF / CSV", health: 64 },
  { id: "source-3", name: "Spend exports", nameKey: "sourceSpendExportsName", count: 4, status: "Last import 2h ago", statusKey: "sourceSpendExportsStatus", type: "CSV", health: 88 },
  { id: "source-4", name: "Owner map", nameKey: "sourceOwnerMapName", count: 31, status: "9 missing owners", statusKey: "sourceOwnerMapStatus", type: "Table", typeKey: "typeTable", health: 58 },
];

const reports = [
  { title: "Weekly leak summary", titleKey: "reportWeeklyTitle", detail: "3 urgent actions before Friday", detailKey: "reportWeeklyDetail", status: "Ready" },
  { title: "Renewal risk report", titleKey: "reportRenewalTitle", detail: "$11,020 exposed in 30 days", detailKey: "reportRenewalDetail", status: "Draft" },
  { title: "Savings proof pack", titleKey: "reportSavingsTitle", detail: "Evidence for confirmed wins", detailKey: "reportSavingsDetail", status: "Build" },
];

const modelOptions = [
  {
    id: "fast",
    name: "Genius Fast",
    badge: "Fast",
    description: "Quick triage for files, renewals, and straightforward questions.",
  },
  {
    id: "deep",
    name: "Genius Deep",
    badge: "Smart",
    description: "Balanced reasoning for evidence-backed analysis and dashboard updates.",
  },
  {
    id: "audit",
    name: "Genius Audit",
    badge: "Pro",
    description: "Stricter financial review, source checks, and approval-safe outputs.",
  },
  {
    id: "agents",
    name: "Genius Agents",
    badge: "Soon",
    description: "Multi-agent workflow orchestration for future plugins.",
    disabled: true,
  },
];
const supportedExtensions = [".pdf", ".csv", ".txt", ".xlsx", ".xls", ".doc", ".docx"];
const maxUploadBytes = 20 * 1024 * 1024;
const initialAssistantMessage = {
  role: "assistant",
  text: "I am ready to inspect uploaded business data, estimate exposure, and prepare actions that stay behind approval.",
};
const chatStorageKey = "genius-chat-history-v2";
const defaultChatThreads = [
  {
    id: "thread-default",
    title: "New analysis",
    updatedLabel: "Ready",
    messages: [initialAssistantMessage],
  },
  {
    id: "thread-renewals",
    title: "Renewal risk scan",
    updatedLabel: "Yesterday",
    messages: [
      initialAssistantMessage,
      { role: "user", text: "Review upcoming renewals and show cancellation windows." },
      { role: "assistant", text: "I found one critical renewal window closing in 12 days and prepared an approval-safe vendor action." },
    ],
  },
  {
    id: "thread-spend",
    title: "April spend audit",
    updatedLabel: "2 days ago",
    messages: [
      initialAssistantMessage,
      { role: "user", text: "Find duplicate subscriptions in April spend." },
      { role: "assistant", text: "Duplicate research tools and unused seats are the highest-confidence savings signal." },
    ],
  },
];

const languageOptions = [
  { id: "en", label: "English", native: "English" },
  { id: "ru", label: "Russian", native: "Русский" },
  { id: "hy", label: "Armenian", native: "Հայերեն" },
];

const supportedLanguageIds = languageOptions.map((option) => option.id);

const voiceLocaleMap = {
  en: "en-US",
  ru: "ru-RU",
  hy: "hy-AM",
};

const settingsTabs = [
  { id: "general", label: "General", icon: "G" },
  { id: "appearance", label: "Appearance", icon: "A" },
  { id: "language", label: "Language", icon: "L" },
  { id: "personalization", label: "Personalization", icon: "P" },
  { id: "apps", label: "Apps", icon: "X" },
  { id: "billing", label: "Billing", icon: "B" },
  { id: "security", label: "Security", icon: "S" },
  { id: "archive", label: "Archive", icon: "H" },
  { id: "account", label: "Account", icon: "U" },
];

const copy = {
  en: {
    chat: "Chat",
    overview: "Dashboard",
    data: "Data Intake",
    analytics: "Analytics",
    leaks: "Savings Radar",
    agents: "Agent Control",
    approvals: "Approvals",
    reports: "Board Reports",
    plugins: "Future Plugins",
    navCommand: "Command",
    navIntelligence: "Intelligence",
    navExtensions: "Extensions",
    newAnalysis: "New analysis",
    recent: "Recent",
    uploadData: "Upload data",
    analyzeLink: "Analyze link",
    signIn: "Sign in",
    settings: "Settings",
    approvalFirst: "Approval-first",
    connectedSources: "connected sources",
    model: "model",
    chatHero: "Upload business evidence or ask a question.",
    chatLead: "Start with contracts, invoices, spend exports, vendor lists, or a direct business question. Every suggested action stays approval-first.",
    composerPlaceholder: "Ask GENIUS to analyze business data...",
    evidenceRequired: "Evidence required",
    humanApproval: "Human approval",
    agentReady: "Agent-ready workflow",
    renewalAudit: "Renewal audit",
    spendLeakScan: "Spend leak scan",
    ceoSummary: "CEO summary",
    thisWeek: "This week",
    renewalAuditText: "Find auto-renewals, notice periods, and negotiation windows.",
    spendLeakText: "Detect duplicated vendors, unused seats, and payment drift.",
    ceoSummaryText: "Turn findings into a short decision-ready brief.",
    dashboardHeroTitle: "Find revenue leaks, prove them, and move actions through approval.",
    dashboardHeroText: "GENIUS turns fragmented B2B operations data into a decision cockpit for savings, risk, agents, and controlled execution.",
    executiveCommand: "Executive command",
    liveSupervised: "Live supervised mode",
    uploadEvidence: "Upload evidence",
    askAnalyst: "Ask AI analyst",
    aiWorkspace: "AI Workspace",
    chatQuestion: "What should GENIUS analyze first?",
    settingsTitle: "GENIUS settings",
    settingsGeneral: "General",
    settingsAppearance: "Appearance",
    settingsLanguage: "Language",
    settingsPersonalization: "Personalization",
    settingsApps: "Apps",
    settingsBilling: "Billing",
    settingsSecurity: "Security",
    settingsAccount: "Account",
    appearanceTitle: "Appearance",
    appearanceHelp: "System, dark, or light workspace theme.",
    languageTitle: "Language",
    languageHelp: "Translate navigation, chat, settings, and key workspace sections.",
    voiceInput: "Voice input",
    voiceInputHelp: "Enable microphone controls inside the chat composer.",
    motionEffects: "Interface animations",
    motionEffectsHelp: "Use smooth transitions, modal motion, and section reveal animations.",
    approvalActions: "Approval-first actions",
    approvalActionsHelp: "Agents can draft but cannot execute without human review.",
    voiceTitle: "Voice",
    voiceHelp: "Default voice for future mobile and desktop review flows.",
    preview: "Preview",
    darkTheme: "Dark premium",
    darkThemeHelp: "Black workspace with violet neon edge states.",
    lightTheme: "Light review",
    lightThemeHelp: "Clean bright workspace for long analysis sessions.",
    accentColor: "Accent color",
    accentColorHelp: "Brand violet is applied to active states, focus rings, and metrics.",
    rename: "Rename",
    archive: "Archive",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    micListening: "Listening...",
    micUnsupported: "Voice input is not supported in this browser.",
    micDisabled: "Voice input is disabled in settings.",
    micReady: "Voice transcript added to the composer.",
    metricExposure: "Exposure",
    metricExposureDetail: "Potential leakage found",
    metricDecisionQueue: "Decision queue",
    metricSavingsLocked: "Savings locked",
    metricSavingsDetail: "Confirmed this quarter",
    metricDataCoverage: "Data coverage",
    approved: "approved",
    recordsMapped: "records mapped",
    pipelineImported: "Imported",
    pipelineFindings: "Findings",
    pipelineAgents: "Agents",
    pipelineApprovals: "Approvals",
    indicatorReadiness: "Data readiness",
    indicatorAgentCoverage: "Agent coverage",
    indicatorDecisionLatency: "Decision latency",
    indicatorSavingsConfidence: "Savings confidence",
    activeAgents: "active agents",
    openApprovals: "open approvals",
    openShort: "open",
    findingsRanked: "findings ranked",
    usageDataProcessed: "Data processed",
    usageDataProcessedText: "Files, links, invoices, owner maps",
    usageAiRequests: "AI requests",
    activeInComposer: "active in composer",
    usageAutomationHealth: "Automation health",
    usageAutomationHealthText: "Temporary agents behind approvals",
    usagePluginActivity: "Plugin activity",
    usagePluginActivityText: "B2B extensions staged for setup",
    readyShort: "ready",
    dataIntakeTitle: "Connect business evidence",
    uploadFiles: "Upload files",
    dropEvidenceTitle: "Drop contracts, invoices, Excel spend exports, or owner maps",
    dropEvidenceText: "Files update dashboard metrics, chat context, Savings Radar, and extraction review immediately.",
    websiteUrl: "Website / URL",
    linkAnalysis: "Link analysis",
    linkAnalysisText: "Analyze a pricing page, vendor portal, shared document, or public data source.",
    analyze: "Analyze",
    excelCsv: "Excel / CSV",
    spendWorkbook: "Spend workbook",
    spendWorkbookText: "Parse vendor spend, owner maps, seat counts, renewal rows, and finance exports.",
    uploadSpreadsheet: "Upload spreadsheet",
    sqlDatabase: "SQL database",
    connectionPlaceholder: "Connection placeholder",
    connectionPlaceholderText: "Future read-only warehouse connector for invoices, CRM, subscriptions, and usage tables.",
    prepareConnection: "Prepare connection",
    extractionReview: "Extraction review",
    noFileSelected: "No file selected",
    extractionReviewText: "Review extracted fields before GENIUS can move any action into approvals.",
    uploadFileFirst: "Upload a file first",
    pending: "Pending",
    saveReviewedFields: "Save reviewed fields",
    analyticsTitle: "Leak pressure by business area",
    liveModel: "Live model",
    signals: "Signals",
    operatingHealth: "Operating health",
    askAI: "Ask AI",
    savingsRadarTitle: "Evidence-backed money leaks",
    prepareApprovals: "Prepare approvals",
    guardrail: "Guardrail",
    resumeAgent: "Resume agent",
    pauseAgent: "Pause agent",
    estimatedImpact: "Estimated impact",
    approve: "Approve",
    edit: "Edit",
    reject: "Reject",
    openReport: "Open report",
    decisionQueue: "Decision queue",
    approvalRequired: "Approval required",
    review: "Review",
    agentLayer: "Agent layer",
    temporaryCoverage: "Temporary coverage",
    configure: "Configure",
    unavailable: "Unavailable",
    enablePlugin: "Enable plugin",
    exposureModel: "Exposure model",
    topSource: "Top source",
    highestPriorityFindings: "Highest priority findings",
    openRadar: "Open radar",
    rows: "rows",
    contracts: "Contracts",
    spend: "Spend",
    invoices: "Invoices",
    owners: "Owners",
    approvalsLabel: "Approvals",
    connectedEvidence: "Connected evidence",
    analyzedNow: "Analyzed now",
    items: "items",
    mapped: "mapped",
    googleOrEmail: "Google or email",
    evidenceSources: "evidence sources",
    reviewDecisions: "Review decisions",
    you: "You",
    geniusAnalyst: "GENIUS analyst",
    more: "more",
    processingEvidence: "Processing evidence",
    evidencePipeline: "Evidence pipeline",
    emptyEvidenceTitle: "No evidence uploaded yet",
    emptyEvidenceText: "Upload contracts, invoices, or spend exports to populate findings, extraction fields, and approvals.",
    chooseFiles: "Choose files",
    uploadedEvidence: "Uploaded evidence",
    clearAll: "Clear all",
    viewResult: "View result",
    remove: "Remove",
    uploadFilesHint: "PDF, CSV, Excel, DOCX, TXT up to 20 MB",
    excelAnalysis: "Excel analysis",
    excelAnalysisHint: "Attach XLSX/XLS/CSV for spend and vendor analysis",
    analyzeSourceUrl: "Analyze website or source URL",
    chatRunTitle: "Run analysis with context, evidence, and approvals.",
    contextPacket: "Context packet",
    noAttachedFiles: "No attached files",
    attachedFiles: "attached files",
    attachedFile: "attached file",
    topExposure: "Top exposure",
    agentsLive: "Agents live",
    approvalMode: "Approval mode",
    required: "Required",
    accountAccess: "Account access",
    authSignInTitle: "Sign in to GENIUS",
    authCreateWorkspace: "Create workspace",
    authSignInTab: "Sign in",
    authRegisterTab: "Register",
    continueGoogle: "Continue with Google",
    signInEmail: "Sign in with email",
    createAccount: "Create account",
    passwordPlaceholder: "Minimum 8 characters",
    notSignedIn: "Not signed in",
    provider: "Provider",
    connectGoogleEmailLater: "Connect Google or email to save workspace state later.",
    manageAccount: "Manage account",
    signInRegister: "Sign in or register",
    authNoticeIdle: "Use Google or email to enter the workspace.",
    authNoticeInvalid: "Enter a valid business email address.",
    authNoticeChecking: "Checking workspace access...",
    authNoticeSignedIn: "Signed in as",
    themeDarkLabel: "Dark",
    themeLightLabel: "Light",
    aiRequestsLabel: "AI requests",
    settingsPluginExcel: "Excel analysis",
    settingsPluginWorkflow: "Workflow approvals",
    settingsPluginDocument: "Document intelligence",
    settingsPluginCrm: "CRM context",
    settingsPluginFinance: "Finance analyzer",
    settingsPluginEnabled: "Enabled for B2B analysis.",
    settingsPluginReady: "Ready for future backend integration.",
    orUseEmail: "or use email",
    email: "Email",
    password: "Password",
    default: "Default",
    requireEvidence: "Require evidence",
    requireEvidenceHelp: "Every recommendation must cite source context.",
    autoCreateTasks: "Auto-create tasks",
    autoCreateTasksHelp: "Future workflow option for connected tools.",
    plan: "Plan",
    founderWorkspace: "Founder workspace",
    mockBilling: "Mock billing state for future Stripe or subscription backend.",
    usage: "Usage",
    tracksUsage: "Tracks chat requests, file analysis, and link analysis locally.",
    humanApprovalBeforeExecution: "Human approval before execution",
    evidenceOnEveryFinding: "Evidence required on every finding",
    realOauthPending: "Real OAuth provider pending",
    apiKeysPending: "API keys, webhooks, and audit export pending",
    companyName: "Company name",
    workspace: "Workspace",
    pluginAll: "All",
    pluginAnalytics: "Analytics",
    pluginFinance: "Finance",
    pluginAutomation: "Automation",
    pluginDocuments: "Documents",
    pluginBI: "BI",
    pluginSalesOps: "Sales ops",
    pluginExcelDetail: "Parse workbooks, spend rows, renewal columns, and owner maps.",
    pluginCrmDetail: "Match customer revenue, segments, and churn risk against vendor cost.",
    pluginFinanceDetail: "Detect invoice drift, duplicate payments, unused subscriptions, and budget variance.",
    pluginWorkflowDetail: "Route agent-prepared actions into a human approval queue before execution.",
    pluginDocumentDetail: "Extract clauses, dates, notice periods, obligations, and source evidence.",
    pluginEnrichmentDetail: "Append vendor category, owner, renewal risk, and business unit metadata.",
    settingsArchive: "Archived chats",
    archivedChats: "Archived chats",
    archivedChatsHelp: "Chats moved out of the sidebar stay here. Restore them or open them back in the workspace.",
    noArchivedChats: "No archived chats yet",
    noArchivedChatsText: "Archived conversations will appear here and can be restored later.",
    restore: "Restore",
    open: "Open",
    deleteForever: "Delete forever",
    readyForAnalysis: "Ready for analysis",
    updatedNow: "Now",
    archivedLabel: "Archived",
    ingestIdle: "Connect contracts, invoices, spend exports, and owner maps to start.",
    uploadBusinessData: "upload business data",
    categoryContract: "Contract",
    categorySpend: "Spend",
    categoryInvoice: "Invoice",
    categoryOps: "Ops",
    ownerFinance: "Finance",
    ownerOps: "Ops",
    ownerCeo: "CEO",
    typeTable: "Table",
    typeLive: "Live",
    leakAutoRenewalTitle: "Auto-renewal window closes in 12 days",
    leakAutoRenewalSource: "Acme Analytics MSA, page 4",
    leakAutoRenewalAction: "Request cancellation terms and renewal discount.",
    leakDuplicateToolsTitle: "Duplicate research tools detected",
    leakDuplicateToolsSource: "card_spend_april.csv, rows 42 and 119",
    leakDuplicateToolsAction: "Consolidate seats into one vendor before June billing.",
    leakInvoiceDriftTitle: "Invoice exceeds contract by 18%",
    leakInvoiceDriftSource: "Northstar Cloud invoice INV-1042",
    leakInvoiceDriftAction: "Ask vendor to credit overage against next invoice.",
    leakMissingOwnerTitle: "Vendor has no internal owner",
    leakMissingOwnerSource: "Vendor register import",
    leakMissingOwnerAction: "Assign owner and review usage before renewal.",
    agentContractName: "Contract Analyst",
    agentContractFocus: "Extract dates, clauses, renewal risk, and evidence.",
    agentContractWorkload: "8 files",
    agentContractGuardrail: "Cannot save extracted fields before human review.",
    agentSpendName: "Spend Auditor",
    agentSpendFocus: "Find duplicates, unused tools, and payment drift.",
    agentSpendWorkload: "312 rows",
    agentSpendGuardrail: "Cannot mark savings as confirmed without approval.",
    agentFinanceName: "Finance Watcher",
    agentFinanceFocus: "Watch renewal deadlines and missing owners.",
    agentFinanceWorkload: "31 vendors",
    agentFinanceGuardrail: "Cannot contact vendors or cancel tools.",
    agentActionName: "Action Drafter",
    agentActionFocus: "Prepare emails, tasks, and manager summaries.",
    agentActionWorkload: "7 actions",
    agentActionGuardrail: "Every draft goes to approvals first.",
    approvalRenewalTitle: "Send renewal discount request to Acme Analytics",
    approvalUnusedSeatsTitle: "Create internal task to remove unused research seats",
    approvalInvoiceTitle: "Ask Northstar Cloud for invoice correction",
    approvalCeoOwner: "CEO approval",
    approvalOpsOwner: "Ops approval",
    approvalFinanceOwner: "Finance approval",
    sourceVendorContractsName: "Vendor contracts",
    sourceVendorContractsStatus: "11 verified",
    sourceInvoicesName: "Invoices",
    sourceInvoicesStatus: "6 need review",
    sourceSpendExportsName: "Spend exports",
    sourceSpendExportsStatus: "Last import 2h ago",
    sourceOwnerMapName: "Owner map",
    sourceOwnerMapStatus: "9 missing owners",
    reportWeeklyTitle: "Weekly leak summary",
    reportWeeklyDetail: "3 urgent actions before Friday",
    reportRenewalTitle: "Renewal risk report",
    reportRenewalDetail: "$11,020 exposed in 30 days",
    reportSavingsTitle: "Savings proof pack",
    reportSavingsDetail: "Evidence for confirmed wins",
    statusInstalled: "Installed",
    statusAvailable: "Available",
    statusDisabled: "Disabled",
    statusActive: "Active",
    statusReviewing: "Reviewing",
    statusMonitoring: "Monitoring",
    statusWaiting: "Waiting",
    statusPaused: "Paused",
    statusApproved: "Approved",
    statusRejected: "Rejected",
    statusEdited: "Edited",
    statusNeedsReview: "Needs review",
    statusReady: "Ready",
    statusDraft: "Draft",
    statusBuild: "Build",
    statusCritical: "Critical",
    statusHigh: "High",
    statusWatch: "Watch",
  },
  ru: {
    chat: "Чат",
    overview: "Дашборд",
    data: "Данные",
    analytics: "Аналитика",
    leaks: "Радар экономии",
    agents: "AI агенты",
    approvals: "Согласования",
    reports: "Отчеты",
    plugins: "Плагины",
    navCommand: "Управление",
    navIntelligence: "Аналитика",
    navExtensions: "Расширения",
    newAnalysis: "Новый чат",
    recent: "История",
    uploadData: "Загрузить данные",
    analyzeLink: "Анализ ссылки",
    signIn: "Войти",
    settings: "Настройки",
    approvalFirst: "Через согласование",
    connectedSources: "источников",
    model: "модель",
    chatHero: "Загрузите бизнес-данные или задайте вопрос.",
    chatLead: "Начните с договоров, счетов, Excel-выгрузок, списка поставщиков или прямого бизнес-вопроса. Все действия остаются под подтверждением.",
    composerPlaceholder: "Спросите GENIUS про бизнес-данные...",
    evidenceRequired: "Нужны доказательства",
    humanApproval: "Подтверждение человеком",
    agentReady: "Готово для агентов",
    renewalAudit: "Аудит продлений",
    spendLeakScan: "Поиск потерь",
    ceoSummary: "Сводка CEO",
    thisWeek: "Эта неделя",
    renewalAuditText: "Найти автопродления, сроки уведомления и окна переговоров.",
    spendLeakText: "Найти дубли, неиспользуемые места и дрейф платежей.",
    ceoSummaryText: "Собрать краткий отчет для решения.",
    dashboardHeroTitle: "Найдите потери денег, докажите их и проведите действия через согласование.",
    dashboardHeroText: "GENIUS превращает разрозненные B2B-данные в рабочий центр решений по экономии, рискам, агентам и контролируемым действиям.",
    executiveCommand: "Командный центр",
    liveSupervised: "Контроль руководителя",
    uploadEvidence: "Загрузить данные",
    askAnalyst: "Спросить AI",
    aiWorkspace: "AI рабочая область",
    chatQuestion: "Что GENIUS должен проанализировать первым?",
    settingsTitle: "Настройки GENIUS",
    settingsGeneral: "Общее",
    settingsAppearance: "Внешний вид",
    settingsLanguage: "Язык",
    settingsPersonalization: "Персонализация",
    settingsApps: "Приложения",
    settingsBilling: "Оплата",
    settingsSecurity: "Безопасность",
    settingsAccount: "Аккаунт",
    appearanceTitle: "Внешний вид",
    appearanceHelp: "Системная, темная или светлая тема рабочей области.",
    languageTitle: "Язык",
    languageHelp: "Переводит навигацию, чат, настройки и ключевые разделы.",
    voiceInput: "Голосовой ввод",
    voiceInputHelp: "Включает микрофон в строке чата.",
    motionEffects: "Анимации интерфейса",
    motionEffectsHelp: "Плавные переходы, появление разделов и модальные анимации.",
    approvalActions: "Действия через согласование",
    approvalActionsHelp: "Агенты могут готовить действия, но не выполнять без подтверждения.",
    voiceTitle: "Голос",
    voiceHelp: "Голос по умолчанию для будущих mobile и desktop сценариев.",
    preview: "Прослушать",
    darkTheme: "Темная premium",
    darkThemeHelp: "Черная рабочая область с фиолетовыми neon-состояниями.",
    lightTheme: "Светлая review",
    lightThemeHelp: "Светлая рабочая область для долгой аналитики.",
    accentColor: "Акцентный цвет",
    accentColorHelp: "Фиолетовый брендовый цвет применяется к active states, focus и метрикам.",
    rename: "Переименовать",
    archive: "Архивировать",
    delete: "Удалить",
    save: "Сохранить",
    cancel: "Отмена",
    micListening: "Слушаю...",
    micUnsupported: "Голосовой ввод не поддерживается этим браузером.",
    micDisabled: "Голосовой ввод выключен в настройках.",
    micReady: "Голос добавлен в строку чата.",
    metricExposure: "Риск потерь",
    metricExposureDetail: "Потенциальные потери найдены",
    metricDecisionQueue: "Очередь решений",
    metricSavingsLocked: "Зафиксированная экономия",
    metricSavingsDetail: "Подтверждено за квартал",
    metricDataCoverage: "Покрытие данных",
    approved: "согласовано",
    recordsMapped: "записей обработано",
    pipelineImported: "Импортировано",
    pipelineFindings: "Находки",
    pipelineAgents: "Агенты",
    pipelineApprovals: "Согласования",
    indicatorReadiness: "Готовность данных",
    indicatorAgentCoverage: "Покрытие агентами",
    indicatorDecisionLatency: "Скорость решений",
    indicatorSavingsConfidence: "Уверенность экономии",
    activeAgents: "активных агентов",
    openApprovals: "открытых согласований",
    openShort: "открыто",
    findingsRanked: "находок ранжировано",
    usageDataProcessed: "Обработано данных",
    usageDataProcessedText: "Файлы, ссылки, счета, карты владельцев",
    usageAiRequests: "AI запросы",
    activeInComposer: "активна в чате",
    usageAutomationHealth: "Здоровье автоматизации",
    usageAutomationHealthText: "Временные агенты работают через согласования",
    usagePluginActivity: "Активность плагинов",
    usagePluginActivityText: "B2B расширения готовы к настройке",
    readyShort: "готово",
    dataIntakeTitle: "Подключите бизнес-данные",
    uploadFiles: "Загрузить файлы",
    dropEvidenceTitle: "Перетащите договоры, счета, Excel-выгрузки или карты владельцев",
    dropEvidenceText: "Файлы сразу обновляют метрики, контекст чата, радар экономии и проверку извлеченных данных.",
    websiteUrl: "Сайт / URL",
    linkAnalysis: "Анализ ссылки",
    linkAnalysisText: "Проанализировать страницу цен, портал поставщика, документ или публичный источник данных.",
    analyze: "Анализировать",
    excelCsv: "Excel / CSV",
    spendWorkbook: "Таблица расходов",
    spendWorkbookText: "Разобрать расходы, владельцев, места, продления и финансовые выгрузки.",
    uploadSpreadsheet: "Загрузить таблицу",
    sqlDatabase: "SQL база",
    connectionPlaceholder: "Будущее подключение",
    connectionPlaceholderText: "Будущий read-only коннектор для счетов, CRM, подписок и usage-таблиц.",
    prepareConnection: "Подготовить",
    extractionReview: "Проверка извлечения",
    noFileSelected: "Файл не выбран",
    extractionReviewText: "Проверьте поля перед тем, как GENIUS перенесет действие в согласования.",
    uploadFileFirst: "Сначала загрузите файл",
    pending: "Ожидает",
    saveReviewedFields: "Сохранить проверенные поля",
    analyticsTitle: "Давление потерь по зонам бизнеса",
    liveModel: "Живая модель",
    signals: "Сигналы",
    operatingHealth: "Рабочее здоровье",
    askAI: "Спросить AI",
    savingsRadarTitle: "Денежные потери с доказательствами",
    prepareApprovals: "Подготовить согласования",
    guardrail: "Ограничение",
    resumeAgent: "Запустить агента",
    pauseAgent: "Поставить на паузу",
    estimatedImpact: "Оценка эффекта",
    approve: "Согласовать",
    edit: "Редактировать",
    reject: "Отклонить",
    openReport: "Открыть отчет",
    decisionQueue: "Очередь решений",
    approvalRequired: "Требует согласования",
    review: "Проверить",
    agentLayer: "Слой агентов",
    temporaryCoverage: "Временное покрытие",
    configure: "Настроить",
    unavailable: "Недоступно",
    enablePlugin: "Включить плагин",
    exposureModel: "Модель риска",
    topSource: "Главный источник",
    highestPriorityFindings: "Самые важные находки",
    openRadar: "Открыть радар",
    rows: "строк",
    contracts: "Договоры",
    spend: "Расходы",
    invoices: "Счета",
    owners: "Владельцы",
    approvalsLabel: "Согласования",
    connectedEvidence: "Подключенные данные",
    analyzedNow: "Проанализировано сейчас",
    items: "элементов",
    mapped: "обработано",
    googleOrEmail: "Google или email",
    evidenceSources: "источников данных",
    reviewDecisions: "Проверить решения",
    you: "Вы",
    geniusAnalyst: "Аналитик GENIUS",
    more: "еще",
    processingEvidence: "Обработка данных",
    evidencePipeline: "Пайплайн данных",
    emptyEvidenceTitle: "Данные еще не загружены",
    emptyEvidenceText: "Загрузите договоры, счета или выгрузки расходов, чтобы заполнить находки, поля и согласования.",
    chooseFiles: "Выбрать файлы",
    uploadedEvidence: "Загруженные данные",
    clearAll: "Очистить все",
    viewResult: "Смотреть результат",
    remove: "Удалить",
    uploadFilesHint: "PDF, CSV, Excel, DOCX, TXT до 20 MB",
    excelAnalysis: "Анализ Excel",
    excelAnalysisHint: "Прикрепите XLSX/XLS/CSV для анализа расходов и поставщиков",
    analyzeSourceUrl: "Анализ сайта или источника",
    chatRunTitle: "Запустите анализ с контекстом, доказательствами и согласованиями.",
    contextPacket: "Пакет контекста",
    noAttachedFiles: "Нет прикрепленных файлов",
    attachedFiles: "прикрепленных файлов",
    attachedFile: "прикрепленный файл",
    topExposure: "Главный риск",
    agentsLive: "Агенты активны",
    approvalMode: "Режим согласования",
    required: "Обязательно",
    accountAccess: "Доступ к аккаунту",
    authSignInTitle: "Вход в GENIUS",
    authCreateWorkspace: "Создать рабочую область",
    authSignInTab: "Войти",
    authRegisterTab: "Регистрация",
    continueGoogle: "Продолжить через Google",
    signInEmail: "Войти по email",
    createAccount: "Создать аккаунт",
    passwordPlaceholder: "Минимум 8 символов",
    notSignedIn: "Вы не вошли",
    provider: "Провайдер",
    connectGoogleEmailLater: "Подключите Google или email, чтобы позже сохранять состояние рабочей области.",
    manageAccount: "Управлять аккаунтом",
    signInRegister: "Войти или зарегистрироваться",
    authNoticeIdle: "Используйте Google или email, чтобы войти в рабочую область.",
    authNoticeInvalid: "Введите корректный рабочий email.",
    authNoticeChecking: "Проверяем доступ к рабочей области...",
    authNoticeSignedIn: "Выполнен вход как",
    themeDarkLabel: "Темная",
    themeLightLabel: "Светлая",
    aiRequestsLabel: "AI-запросов",
    settingsPluginExcel: "Анализ Excel",
    settingsPluginWorkflow: "Согласование workflow",
    settingsPluginDocument: "Интеллект документов",
    settingsPluginCrm: "CRM-контекст",
    settingsPluginFinance: "Финансовый анализатор",
    settingsPluginEnabled: "Включено для B2B-анализа.",
    settingsPluginReady: "Готово для будущей backend-интеграции.",
    orUseEmail: "или используйте email",
    email: "Email",
    password: "Пароль",
    default: "По умолчанию",
    requireEvidence: "Требовать доказательства",
    requireEvidenceHelp: "Каждая рекомендация должна ссылаться на источник.",
    autoCreateTasks: "Автоматически создавать задачи",
    autoCreateTasksHelp: "Будущая опция для подключенных workflow-инструментов.",
    plan: "План",
    founderWorkspace: "Рабочая область основателя",
    mockBilling: "Тестовое состояние оплаты для будущего Stripe или подписок.",
    usage: "Использование",
    tracksUsage: "Отслеживает чат, анализ файлов и анализ ссылок локально.",
    humanApprovalBeforeExecution: "Подтверждение человеком перед выполнением",
    evidenceOnEveryFinding: "Доказательства для каждой находки",
    realOauthPending: "Реальный OAuth провайдер еще не подключен",
    apiKeysPending: "Ключи API, вебхуки и экспорт аудита еще не подключены",
    companyName: "Название компании",
    workspace: "Рабочая область",
    pluginAll: "Все",
    pluginAnalytics: "Аналитика",
    pluginFinance: "Финансы",
    pluginAutomation: "Автоматизация",
    pluginDocuments: "Документы",
    pluginBI: "BI",
    pluginSalesOps: "Продажи",
    pluginExcelDetail: "Разбирает Excel, расходы, продления и карты владельцев.",
    pluginCrmDetail: "Сопоставляет выручку клиентов, сегменты и churn risk с расходами на поставщиков.",
    pluginFinanceDetail: "Находит дрейф счетов, дубли платежей, неиспользуемые подписки и отклонения бюджета.",
    pluginWorkflowDetail: "Отправляет подготовленные агентами действия в очередь человеческого согласования.",
    pluginDocumentDetail: "Извлекает пункты договора, даты, сроки уведомления, обязательства и источники.",
    pluginEnrichmentDetail: "Добавляет категорию поставщика, владельца, renewal risk и бизнес-метаданные.",
    settingsArchive: "Архив чатов",
    archivedChats: "Архив чатов",
    archivedChatsHelp: "Чаты, убранные из сайдбара, остаются здесь. Их можно открыть или вернуть в рабочую область.",
    noArchivedChats: "В архиве пока пусто",
    noArchivedChatsText: "Архивированные диалоги появятся здесь, и их можно будет восстановить позже.",
    restore: "Вернуть",
    open: "Открыть",
    deleteForever: "Удалить навсегда",
    readyForAnalysis: "Готово к анализу",
    updatedNow: "Сейчас",
    archivedLabel: "В архиве",
    ingestIdle: "Подключите договоры, счета, выгрузки расходов и карты владельцев, чтобы начать.",
    uploadBusinessData: "загрузить бизнес-данные",
    categoryContract: "Договор",
    categorySpend: "Расходы",
    categoryInvoice: "Счет",
    categoryOps: "Операции",
    ownerFinance: "Финансы",
    ownerOps: "Операции",
    ownerCeo: "CEO",
    typeTable: "Таблица",
    typeLive: "Активно",
    leakAutoRenewalTitle: "Окно автопродления закрывается через 12 дней",
    leakAutoRenewalSource: "Acme Analytics MSA, стр. 4",
    leakAutoRenewalAction: "Запросить условия отмены и скидку на продление.",
    leakDuplicateToolsTitle: "Найдены дублирующиеся research-инструменты",
    leakDuplicateToolsSource: "card_spend_april.csv, строки 42 и 119",
    leakDuplicateToolsAction: "Объединить места у одного поставщика до июньского списания.",
    leakInvoiceDriftTitle: "Счет превышает договор на 18%",
    leakInvoiceDriftSource: "Счет Northstar Cloud INV-1042",
    leakInvoiceDriftAction: "Попросить поставщика зачесть переплату в следующий счет.",
    leakMissingOwnerTitle: "У поставщика нет внутреннего владельца",
    leakMissingOwnerSource: "Импорт реестра поставщиков",
    leakMissingOwnerAction: "Назначить владельца и проверить использование до продления.",
    agentContractName: "Аналитик договоров",
    agentContractFocus: "Извлекает даты, пункты договора, риск продления и доказательства.",
    agentContractWorkload: "8 файлов",
    agentContractGuardrail: "Не может сохранить извлеченные поля без проверки человеком.",
    agentSpendName: "Аудитор расходов",
    agentSpendFocus: "Ищет дубли, неиспользуемые инструменты и дрейф платежей.",
    agentSpendWorkload: "312 строк",
    agentSpendGuardrail: "Не может отметить экономию подтвержденной без согласования.",
    agentFinanceName: "Финансовый наблюдатель",
    agentFinanceFocus: "Отслеживает сроки продлений и отсутствующих владельцев.",
    agentFinanceWorkload: "31 поставщик",
    agentFinanceGuardrail: "Не может связываться с поставщиками или отменять инструменты.",
    agentActionName: "Автор действий",
    agentActionFocus: "Готовит письма, задачи и краткие сводки для руководителей.",
    agentActionWorkload: "7 действий",
    agentActionGuardrail: "Каждый черновик сначала идет на согласование.",
    approvalRenewalTitle: "Отправить запрос скидки на продление в Acme Analytics",
    approvalUnusedSeatsTitle: "Создать внутреннюю задачу на удаление неиспользуемых мест",
    approvalInvoiceTitle: "Попросить Northstar Cloud исправить счет",
    approvalCeoOwner: "Согласование CEO",
    approvalOpsOwner: "Согласование операций",
    approvalFinanceOwner: "Согласование финансов",
    sourceVendorContractsName: "Договоры поставщиков",
    sourceVendorContractsStatus: "11 проверено",
    sourceInvoicesName: "Счета",
    sourceInvoicesStatus: "6 требуют проверки",
    sourceSpendExportsName: "Выгрузки расходов",
    sourceSpendExportsStatus: "Последний импорт 2 ч назад",
    sourceOwnerMapName: "Карта владельцев",
    sourceOwnerMapStatus: "9 владельцев не указаны",
    reportWeeklyTitle: "Недельная сводка потерь",
    reportWeeklyDetail: "3 срочных действия до пятницы",
    reportRenewalTitle: "Отчет по риску продлений",
    reportRenewalDetail: "$11,020 под риском в ближайшие 30 дней",
    reportSavingsTitle: "Пакет доказательств экономии",
    reportSavingsDetail: "Доказательства для подтвержденных выигрышей",
    statusInstalled: "Установлен",
    statusAvailable: "Доступен",
    statusDisabled: "Отключен",
    statusActive: "Активен",
    statusReviewing: "Проверяет",
    statusMonitoring: "Мониторит",
    statusWaiting: "Ждет",
    statusPaused: "На паузе",
    statusApproved: "Согласовано",
    statusRejected: "Отклонено",
    statusEdited: "Изменено",
    statusNeedsReview: "Нужна проверка",
    statusReady: "Готово",
    statusDraft: "Черновик",
    statusBuild: "Сборка",
    statusCritical: "Критично",
    statusHigh: "Высокий",
    statusWatch: "Наблюдение",
  },
  hy: {
    chat: "Չատ",
    overview: "Վահանակ",
    data: "Տվյալներ",
    analytics: "Վերլուծություն",
    leaks: "Խնայողության ռադար",
    agents: "AI գործակալներ",
    approvals: "Հաստատումներ",
    reports: "Զեկույցներ",
    plugins: "Փլագիններ",
    navCommand: "Կառավարում",
    navIntelligence: "Վերլուծություն",
    navExtensions: "Ընդլայնումներ",
    newAnalysis: "Նոր չատ",
    recent: "Պատմություն",
    uploadData: "Վերբեռնել տվյալներ",
    analyzeLink: "Վերլուծել հղումը",
    signIn: "Մուտք",
    settings: "Կարգավորումներ",
    approvalFirst: "Հաստատմամբ",
    connectedSources: "աղբյուր",
    model: "մոդել",
    chatHero: "Վերբեռնեք բիզնես տվյալներ կամ հարց տվեք։",
    chatLead: "Սկսեք պայմանագրերից, հաշիվներից, Excel արտահանումներից կամ ուղիղ բիզնես հարցից։ Բոլոր գործողությունները մնում են հաստատման տակ։",
    composerPlaceholder: "Հարցրեք GENIUS-ին բիզնես տվյալների մասին...",
    evidenceRequired: "Ապացույցներ պարտադիր",
    humanApproval: "Մարդու հաստատում",
    agentReady: "Պատրաստ գործակալների համար",
    renewalAudit: "Երկարաձգումների աուդիտ",
    spendLeakScan: "Ծախսերի կորուստներ",
    ceoSummary: "CEO ամփոփում",
    renewalAuditText: "Գտնել ավտոմատ երկարաձգումներ և ծանուցման ժամկետներ։",
    spendLeakText: "Գտնել կրկնվող գործիքներ և չօգտագործվող տեղեր։",
    ceoSummaryText: "Պատրաստել կարճ որոշման ամփոփում։",
    thisWeek: "Այս շաբաթ",
    dashboardHeroTitle: "Գտեք դրամական կորուստները, ապացուցեք դրանք և անցկացրեք գործողությունները հաստատման միջով։",
    dashboardHeroText: "GENIUS-ը մասնատված B2B տվյալները դարձնում է որոշումների կենտրոն՝ խնայողության, ռիսկերի, գործակալների և վերահսկվող գործողությունների համար։",
    executiveCommand: "Կառավարման կենտրոն",
    liveSupervised: "Վերահսկվող ռեժիմ",
    uploadEvidence: "Վերբեռնել ապացույցներ",
    askAnalyst: "Հարցնել AI-ին",
    aiWorkspace: "AI աշխատանքային տարածք",
    chatQuestion: "Ի՞նչ պետք է GENIUS-ը վերլուծի առաջինը։",
    settingsTitle: "GENIUS կարգավորումներ",
    settingsGeneral: "Ընդհանուր",
    settingsAppearance: "Տեսք",
    settingsLanguage: "Լեզու",
    settingsPersonalization: "Անհատականացում",
    settingsApps: "Հավելվածներ",
    settingsBilling: "Վճարումներ",
    settingsSecurity: "Անվտանգություն",
    settingsAccount: "Հաշիվ",
    appearanceTitle: "Տեսք",
    appearanceHelp: "Համակարգային, մուգ կամ բաց աշխատանքային թեմա։",
    languageTitle: "Լեզու",
    languageHelp: "Թարգմանում է նավիգացիան, չատը, կարգավորումները և հիմնական բաժինները։",
    voiceInput: "Ձայնային մուտք",
    voiceInputHelp: "Միացնում է միկրոֆոնը չատի մուտքագրման տողում։",
    motionEffects: "Ինտերֆեյսի անիմացիաներ",
    motionEffectsHelp: "Օգտագործել հարթ անցումներ, modal շարժում և բաժինների բացում։",
    approvalActions: "Գործողություններ հաստատմամբ",
    approvalActionsHelp: "Գործակալները կարող են պատրաստել գործողություններ, բայց չեն կատարում առանց մարդու հաստատման։",
    voiceTitle: "Ձայն",
    voiceHelp: "Լռելյայն ձայն ապագա mobile և desktop ստուգման հոսքերի համար։",
    preview: "Նախադիտել",
    darkTheme: "Մուգ պրեմիում",
    darkThemeHelp: "Սև աշխատանքային տարածք՝ մանուշակագույն նեոնային ակտիվ վիճակներով։",
    lightTheme: "Բաց տեսք",
    lightThemeHelp: "Մաքուր բաց միջավայր երկար վերլուծության համար։",
    accentColor: "Ակցենտի գույն",
    accentColorHelp: "Բրենդային մանուշակագույնը օգտագործվում է ակտիվ վիճակների, focus-ի և մետրիկաների համար։",
    rename: "Վերանվանել",
    archive: "Արխիվացնել",
    delete: "Ջնջել",
    save: "Պահպանել",
    cancel: "Չեղարկել",
    micListening: "Լսում եմ...",
    micUnsupported: "Ձայնային մուտքը չի աջակցվում այս բրաուզերում։",
    micDisabled: "Ձայնային մուտքն անջատված է կարգավորումներում։",
    micReady: "Ձայնային տեքստը ավելացվեց չատի տողում։",
    metricExposure: "Ռիսկի գումար",
    metricExposureDetail: "Գտնվել են հնարավոր կորուստներ",
    metricDecisionQueue: "Որոշումների հերթ",
    metricSavingsLocked: "Հաստատված խնայողություն",
    metricSavingsDetail: "Հաստատված է այս եռամսյակում",
    metricDataCoverage: "Տվյալների ծածկույթ",
    approved: "հաստատված",
    recordsMapped: "գրառում մշակված",
    pipelineImported: "Ներմուծված",
    pipelineFindings: "Գտածոներ",
    pipelineAgents: "Գործակալներ",
    pipelineApprovals: "Հաստատումներ",
    indicatorReadiness: "Տվյալների պատրաստություն",
    indicatorAgentCoverage: "Գործակալների ծածկույթ",
    indicatorDecisionLatency: "Որոշման արագություն",
    indicatorSavingsConfidence: "Խնայողության վստահություն",
    activeAgents: "ակտիվ գործակալ",
    openApprovals: "բաց հաստատում",
    openShort: "բաց",
    findingsRanked: "դասակարգված գտածո",
    usageDataProcessed: "Մշակված տվյալներ",
    usageDataProcessedText: "Ֆայլեր, հղումներ, հաշիվներ, սեփականատերերի քարտեզներ",
    usageAiRequests: "AI հարցումներ",
    activeInComposer: "ակտիվ է մուտքագրման տողում",
    usageAutomationHealth: "Ավտոմատացման առողջություն",
    usageAutomationHealthText: "Ժամանակավոր գործակալները աշխատում են հաստատումների տակ",
    usagePluginActivity: "Պլագինների ակտիվություն",
    usagePluginActivityText: "B2B ընդլայնումները պատրաստ են կարգավորման",
    readyShort: "պատրաստ",
    dataIntakeTitle: "Միացրեք բիզնես ապացույցները",
    uploadFiles: "Վերբեռնել ֆայլեր",
    dropEvidenceTitle: "Քաշեք պայմանագրեր, հաշիվներ, Excel արտահանումներ կամ սեփականատերերի քարտեզներ",
    dropEvidenceText: "Ֆայլերը անմիջապես թարմացնում են մետրիկաները, չատի կոնտեքստը, խնայողության ռադարը և extraction review-ը։",
    websiteUrl: "Կայք / URL",
    linkAnalysis: "Հղման վերլուծություն",
    linkAnalysisText: "Վերլուծել գնային էջ, մատակարարի պորտալ, կիսված փաստաթուղթ կամ բաց տվյալների աղբյուր։",
    analyze: "Վերլուծել",
    excelCsv: "Excel / CSV",
    spendWorkbook: "Ծախսերի աղյուսակ",
    spendWorkbookText: "Վերլուծել մատակարարների ծախսերը, սեփականատերերը, տեղերը, երկարաձգումները և ֆինանսական արտահանումները։",
    uploadSpreadsheet: "Վերբեռնել աղյուսակ",
    sqlDatabase: "SQL բազա",
    connectionPlaceholder: "Միացման placeholder",
    connectionPlaceholderText: "Ապագա միայն կարդալու warehouse միացում հաշիվների, CRM-ի, բաժանորդագրությունների և օգտագործման աղյուսակների համար։",
    prepareConnection: "Պատրաստել միացումը",
    extractionReview: "Տվյալների ստուգում",
    noFileSelected: "Ֆայլ ընտրված չէ",
    extractionReviewText: "Ստուգեք դաշտերը նախքան GENIUS-ը որևէ գործողություն ուղարկի հաստատման։",
    uploadFileFirst: "Սկզբում վերբեռնեք ֆայլ",
    pending: "Սպասում է",
    saveReviewedFields: "Պահպանել ստուգված դաշտերը",
    analyticsTitle: "Կորստի ճնշումը ըստ բիզնես տարածքների",
    liveModel: "Կենդանի մոդել",
    signals: "Սիգնալներ",
    operatingHealth: "Գործառնական առողջություն",
    askAI: "Հարցնել AI-ին",
    savingsRadarTitle: "Ապացույցներով դրամական կորուստներ",
    prepareApprovals: "Պատրաստել հաստատումներ",
    guardrail: "Սահմանափակում",
    resumeAgent: "Վերսկսել գործակալը",
    pauseAgent: "Դադարեցնել գործակալը",
    estimatedImpact: "Գնահատված ազդեցություն",
    approve: "Հաստատել",
    edit: "Խմբագրել",
    reject: "Մերժել",
    openReport: "Բացել զեկույցը",
    decisionQueue: "Որոշումների հերթ",
    approvalRequired: "Հաստատում է պահանջվում",
    review: "Ստուգել",
    agentLayer: "Գործակալների շերտ",
    temporaryCoverage: "Ժամանակավոր ծածկույթ",
    configure: "Կարգավորել",
    unavailable: "Անհասանելի",
    enablePlugin: "Միացնել պլագինը",
    exposureModel: "Ռիսկի մոդել",
    topSource: "Գլխավոր աղբյուր",
    highestPriorityFindings: "Ամենակարևոր գտածոները",
    openRadar: "Բացել ռադարը",
    rows: "տող",
    contracts: "Պայմանագրեր",
    spend: "Ծախսեր",
    invoices: "Հաշիվներ",
    owners: "Սեփականատերեր",
    approvalsLabel: "Հաստատումներ",
    connectedEvidence: "Միացված ապացույցներ",
    analyzedNow: "Վերլուծվել է հիմա",
    items: "կետ",
    mapped: "մշակված",
    googleOrEmail: "Google կամ email",
    evidenceSources: "ապացույցի աղբյուր",
    reviewDecisions: "Ստուգել որոշումները",
    you: "Դուք",
    geniusAnalyst: "GENIUS վերլուծաբան",
    more: "ևս",
    processingEvidence: "Ապացույցների մշակում",
    evidencePipeline: "Ապացույցների հոսք",
    emptyEvidenceTitle: "Ապացույցներ դեռ չկան",
    emptyEvidenceText: "Վերբեռնեք պայմանագրեր, հաշիվներ կամ ծախսերի արտահանումներ՝ գտածոները, դաշտերը և հաստատումները լրացնելու համար։",
    chooseFiles: "Ընտրել ֆայլեր",
    uploadedEvidence: "Վերբեռնված ապացույցներ",
    clearAll: "Մաքրել բոլորը",
    viewResult: "Դիտել արդյունքը",
    remove: "Հեռացնել",
    uploadFilesHint: "PDF, CSV, Excel, DOCX, TXT մինչև 20 MB",
    excelAnalysis: "Excel վերլուծություն",
    excelAnalysisHint: "Կցեք XLSX/XLS/CSV ծախսերի և մատակարարների վերլուծության համար",
    analyzeSourceUrl: "Վերլուծել կայք կամ աղբյուրի URL",
    chatRunTitle: "Գործարկեք վերլուծություն կոնտեքստով, ապացույցներով և հաստատումներով։",
    contextPacket: "Կոնտեքստի փաթեթ",
    noAttachedFiles: "Կցված ֆայլեր չկան",
    attachedFiles: "կցված ֆայլ",
    attachedFile: "կցված ֆայլ",
    topExposure: "Գլխավոր ռիսկ",
    agentsLive: "Ակտիվ գործակալներ",
    approvalMode: "Հաստատման ռեժիմ",
    required: "Պարտադիր",
    accountAccess: "Հաշվի մուտք",
    authSignInTitle: "Մուտք GENIUS",
    authCreateWorkspace: "Ստեղծել աշխատանքային տարածք",
    authSignInTab: "Մուտք",
    authRegisterTab: "Գրանցում",
    continueGoogle: "Շարունակել Google-ով",
    signInEmail: "Մուտք email-ով",
    createAccount: "Ստեղծել հաշիվ",
    passwordPlaceholder: "Առնվազն 8 նիշ",
    notSignedIn: "Մուտք չեք գործել",
    provider: "Պրովայդեր",
    connectGoogleEmailLater: "Միացրեք Google կամ email՝ աշխատանքային տարածքի վիճակը հետո պահպանելու համար։",
    manageAccount: "Կառավարել հաշիվը",
    signInRegister: "Մուտք կամ գրանցում",
    authNoticeIdle: "Օգտագործեք Google կամ email՝ աշխատանքային տարածք մտնելու համար։",
    authNoticeInvalid: "Մուտքագրեք ճիշտ աշխատանքային email։",
    authNoticeChecking: "Ստուգում ենք աշխատանքային տարածքի մուտքը...",
    authNoticeSignedIn: "Մուտք է կատարվել որպես",
    themeDarkLabel: "Մուգ",
    themeLightLabel: "Բաց",
    aiRequestsLabel: "AI հարցում",
    settingsPluginExcel: "Excel վերլուծություն",
    settingsPluginWorkflow: "Workflow հաստատումներ",
    settingsPluginDocument: "Փաստաթղթերի ինտելեկտ",
    settingsPluginCrm: "CRM կոնտեքստ",
    settingsPluginFinance: "Ֆինանսական վերլուծիչ",
    settingsPluginEnabled: "Միացված է B2B վերլուծության համար։",
    settingsPluginReady: "Պատրաստ է ապագա backend ինտեգրման համար։",
    orUseEmail: "կամ օգտագործեք email",
    email: "Email",
    password: "Գաղտնաբառ",
    default: "Լռելյայն",
    requireEvidence: "Պահանջել ապացույց",
    requireEvidenceHelp: "Յուրաքանչյուր առաջարկ պետք է հղվի աղբյուրի կոնտեքստին։",
    autoCreateTasks: "Ավտոմատ ստեղծել առաջադրանքներ",
    autoCreateTasksHelp: "Ապագա workflow տարբերակ միացված գործիքների համար։",
    plan: "Պլան",
    founderWorkspace: "Հիմնադրի աշխատանքային տարածք",
    mockBilling: "Թեստային վճարային վիճակ ապագա Stripe-ի կամ բաժանորդագրության backend-ի համար։",
    usage: "Օգտագործում",
    tracksUsage: "Տեղային հետևում է չատի հարցումներին, ֆայլերի և հղումների վերլուծությանը։",
    humanApprovalBeforeExecution: "Մարդու հաստատում կատարումից առաջ",
    evidenceOnEveryFinding: "Ապացույց յուրաքանչյուր գտածոյի համար",
    realOauthPending: "Իրական OAuth provider-ը դեռ սպասում է",
    apiKeysPending: "API keys, webhooks և audit export դեռ սպասում են",
    companyName: "Ընկերության անուն",
    workspace: "Աշխատանքային տարածք",
    pluginAll: "Բոլորը",
    pluginAnalytics: "Վերլուծություն",
    pluginFinance: "Ֆինանսներ",
    pluginAutomation: "Ավտոմատացում",
    pluginDocuments: "Փաստաթղթեր",
    pluginBI: "BI",
    pluginSalesOps: "Վաճառքի օպերացիաներ",
    pluginExcelDetail: "Վերլուծում է աղյուսակներ, ծախսերի տողեր, երկարաձգումներ և սեփականատերերի քարտեզներ։",
    pluginCrmDetail: "Համադրում է հաճախորդի եկամուտը, սեգմենտները և churn risk-ը մատակարարի ծախսերի հետ։",
    pluginFinanceDetail: "Գտնում է հաշիվների շեղումներ, կրկնվող վճարումներ, չօգտագործվող բաժանորդագրություններ և բյուջեի տարբերություններ։",
    pluginWorkflowDetail: "Գործակալների պատրաստած գործողությունները ուղարկում է մարդու հաստատման հերթ։",
    pluginDocumentDetail: "Հանում է դրույթներ, ամսաթվեր, ծանուցման ժամկետներ, պարտավորություններ և աղբյուրներ։",
    pluginEnrichmentDetail: "Ավելացնում է մատակարարի կատեգորիա, սեփականատեր, renewal risk և բիզնես մետատվյալներ։",
    settingsArchive: "Արխիվացված չատեր",
    archivedChats: "Արխիվացված չատեր",
    archivedChatsHelp: "Սայդբարից հանված չատերը մնում են այստեղ։ Կարելի է բացել կամ վերադարձնել աշխատանքային տարածք։",
    noArchivedChats: "Արխիվում դեռ չատ չկա",
    noArchivedChatsText: "Արխիվացված խոսակցությունները կհայտնվեն այստեղ և հնարավոր կլինի վերականգնել։",
    restore: "Վերականգնել",
    open: "Բացել",
    deleteForever: "Ջնջել ընդմիշտ",
    readyForAnalysis: "Պատրաստ է վերլուծության",
    updatedNow: "Հիմա",
    archivedLabel: "Արխիվացված",
    ingestIdle: "Միացրեք պայմանագրեր, հաշիվներ, ծախսերի արտահանումներ և սեփականատերերի քարտեզներ՝ սկսելու համար։",
    uploadBusinessData: "վերբեռնել բիզնես տվյալներ",
    categoryContract: "Պայմանագիր",
    categorySpend: "Ծախսեր",
    categoryInvoice: "Հաշիվ",
    categoryOps: "Օպերացիաներ",
    ownerFinance: "Ֆինանսներ",
    ownerOps: "Օպերացիաներ",
    ownerCeo: "CEO",
    typeTable: "Աղյուսակ",
    typeLive: "Ակտիվ",
    leakAutoRenewalTitle: "Ավտոմատ երկարաձգման պատուհանը փակվում է 12 օրից",
    leakAutoRenewalSource: "Acme Analytics MSA, էջ 4",
    leakAutoRenewalAction: "Պահանջել չեղարկման պայմաններ և երկարաձգման զեղչ։",
    leakDuplicateToolsTitle: "Գտնվել են կրկնվող research գործիքներ",
    leakDuplicateToolsSource: "card_spend_april.csv, տողեր 42 և 119",
    leakDuplicateToolsAction: "Միավորել տեղերը մեկ մատակարարի մոտ մինչև հունիսյան վճարումը։",
    leakInvoiceDriftTitle: "Հաշիվը 18%-ով գերազանցում է պայմանագիրը",
    leakInvoiceDriftSource: "Northstar Cloud հաշիվ INV-1042",
    leakInvoiceDriftAction: "Պահանջել մատակարարից գերավճարը հաշվանցել հաջորդ հաշվում։",
    leakMissingOwnerTitle: "Մատակարարը չունի ներքին պատասխանատու",
    leakMissingOwnerSource: "Մատակարարների ռեեստրի ներմուծում",
    leakMissingOwnerAction: "Նշանակել պատասխանատու և ստուգել օգտագործումը մինչև երկարաձգումը։",
    agentContractName: "Պայմանագրերի վերլուծաբան",
    agentContractFocus: "Հանում է ամսաթվեր, դրույթներ, երկարաձգման ռիսկ և ապացույցներ։",
    agentContractWorkload: "8 ֆայլ",
    agentContractGuardrail: "Չի կարող պահպանել հանված դաշտերը առանց մարդու ստուգման։",
    agentSpendName: "Ծախսերի աուդիտոր",
    agentSpendFocus: "Գտնում է կրկնություններ, չօգտագործվող գործիքներ և վճարումների շեղումներ։",
    agentSpendWorkload: "312 տող",
    agentSpendGuardrail: "Չի կարող խնայողությունը հաստատված նշել առանց համաձայնեցման։",
    agentFinanceName: "Ֆինանսական դիտորդ",
    agentFinanceFocus: "Հետևում է երկարաձգման ժամկետներին և բացակայող պատասխանատուներին։",
    agentFinanceWorkload: "31 մատակարար",
    agentFinanceGuardrail: "Չի կարող կապվել մատակարարների հետ կամ չեղարկել գործիքներ։",
    agentActionName: "Գործողությունների հեղինակ",
    agentActionFocus: "Պատրաստում է նամակներ, առաջադրանքներ և ղեկավարի ամփոփումներ։",
    agentActionWorkload: "7 գործողություն",
    agentActionGuardrail: "Յուրաքանչյուր սևագիր նախ գնում է հաստատման։",
    approvalRenewalTitle: "Ուղարկել երկարաձգման զեղչի հարցում Acme Analytics-ին",
    approvalUnusedSeatsTitle: "Ստեղծել ներքին առաջադրանք չօգտագործվող տեղերը հեռացնելու համար",
    approvalInvoiceTitle: "Պահանջել Northstar Cloud-ից հաշվի ուղղում",
    approvalCeoOwner: "CEO հաստատում",
    approvalOpsOwner: "Օպերացիաների հաստատում",
    approvalFinanceOwner: "Ֆինանսների հաստատում",
    sourceVendorContractsName: "Մատակարարների պայմանագրեր",
    sourceVendorContractsStatus: "11 ստուգված",
    sourceInvoicesName: "Հաշիվներ",
    sourceInvoicesStatus: "6 պետք է ստուգել",
    sourceSpendExportsName: "Ծախսերի արտահանումներ",
    sourceSpendExportsStatus: "Վերջին ներմուծումը՝ 2 ժ առաջ",
    sourceOwnerMapName: "Սեփականատերերի քարտեզ",
    sourceOwnerMapStatus: "9 պատասխանատու բացակայում է",
    reportWeeklyTitle: "Կորուստների շաբաթական ամփոփում",
    reportWeeklyDetail: "3 շտապ գործողություն մինչև ուրբաթ",
    reportRenewalTitle: "Երկարաձգման ռիսկի զեկույց",
    reportRenewalDetail: "$11,020 ռիսկի տակ առաջիկա 30 օրում",
    reportSavingsTitle: "Խնայողության ապացույցների փաթեթ",
    reportSavingsDetail: "Ապացույցներ հաստատված շահումների համար",
    statusInstalled: "Տեղադրված",
    statusAvailable: "Հասանելի",
    statusDisabled: "Անջատված",
    statusActive: "Ակտիվ",
    statusReviewing: "Ստուգում է",
    statusMonitoring: "Մոնիտորինգ",
    statusWaiting: "Սպասում է",
    statusPaused: "Դադարեցված",
    statusApproved: "Հաստատված",
    statusRejected: "Մերժված",
    statusEdited: "Խմբագրված",
    statusNeedsReview: "Պետք է ստուգել",
    statusReady: "Պատրաստ",
    statusDraft: "Սևագիր",
    statusBuild: "Կառուցվում է",
    statusCritical: "Կրիտիկական",
    statusHigh: "Բարձր",
    statusWatch: "Դիտարկում",
  },
};

function classNames(...names) {
  return names.filter(Boolean).join(" ");
}

function formatCurrency(value) {
  return `$${value.toLocaleString("en-US")}`;
}

function fileSizeLabel(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function sourceKindFromName(name) {
  const lowerName = name.toLowerCase();
  if (lowerName.startsWith("http")) return "URL";
  if (lowerName.endsWith(".csv")) return "CSV";
  if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) return "Excel";
  if (lowerName.endsWith(".pdf")) return "PDF";
  return "Document";
}

function statusTone(status) {
  if (status === "Approved" || status === "Active" || status === "Ready") return "success";
  if (status === "Rejected" || status === "Paused") return "danger";
  if (status === "Needs review" || status === "Reviewing" || status === "Monitoring") return "warning";
  return "neutral";
}

function statusCopyKey(status) {
  const map = {
    "Needs review": "statusNeedsReview",
  };
  if (map[status]) return map[status];
  const normalized = status.replace(/\s+/g, "");
  return `status${normalized.slice(0, 1).toUpperCase()}${normalized.slice(1)}`;
}

function StatusDot({ tone = "neutral" }) {
  return <span className={classNames(styles.statusDot, styles[`dot${tone}`])} aria-hidden="true" />;
}

function getCopy(language, key) {
  const languageKey = supportedLanguageIds.includes(language) ? language : "en";
  return copy[languageKey]?.[key] ?? copy.en[key] ?? key;
}

function createThreadTitle(text, fallbackTitle = "New analysis") {
  const trimmed = text.trim();
  if (!trimmed) return fallbackTitle;
  return trimmed.length > 42 ? `${trimmed.slice(0, 42)}...` : trimmed;
}

function threadPreview(thread, fallback = "Ready for analysis") {
  const threadMessages = Array.isArray(thread.messages) ? thread.messages : [];
  const lastMessage = [...threadMessages].reverse().find((message) => message.role !== "system");
  return lastMessage?.text ?? fallback;
}

export default function GeniusDashboard() {
  const fileInputRef = useRef(null);
  const chatFileInputRef = useRef(null);
  const urlInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const paneMotionTimerRef = useRef(null);
  const [theme, setTheme] = useState("black");
  const [language, setLanguage] = useState("en");
  const [motionEnabled, setMotionEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [micState, setMicState] = useState("idle");
  const [micStatus, setMicStatus] = useState("");
  const [activeSection, setActiveSection] = useState("chat");
  const [paneMotionState, setPaneMotionState] = useState("ready");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState("general");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authStatus, setAuthStatus] = useState({ type: "idle", messageKey: "authNoticeIdle", email: "" });
  const [session, setSession] = useState(null);
  const [selectedModel, setSelectedModel] = useState("deep");
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const [pluginFilter, setPluginFilter] = useState("all");
  const [urlInput, setUrlInput] = useState("");
  const [openGroups, setOpenGroups] = useState(() =>
    Object.fromEntries(navGroups.map((group) => [group.id, true])),
  );
  const [chatInput, setChatInput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [ingestState, setIngestState] = useState({
    status: "idle",
    messageKey: "ingestIdle",
  });
  const [messages, setMessages] = useState([initialAssistantMessage]);
  const [chatThreads, setChatThreads] = useState(defaultChatThreads);
  const [archivedThreads, setArchivedThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(defaultChatThreads[0].id);
  const [renamingThreadId, setRenamingThreadId] = useState(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [historyReady, setHistoryReady] = useState(false);
  const [approvalState, setApprovalState] = useState(() =>
    Object.fromEntries(approvals.map((approval) => [approval.id, approval.status])),
  );
  const [agentState, setAgentState] = useState(() =>
    Object.fromEntries(agentProfiles.map((agent) => [agent.id, agent.status])),
  );
  const [companyName, setCompanyName] = useState("Northwind B2B");
  const [promptDraft, setPromptDraft] = useState(
    "You are GENIUS, a supervised AI business leak analyst. Find money leaks, cite evidence, estimate impact, and prepare actions that require approval before execution.",
  );

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(chatStorageKey);
      if (!saved) {
        setHistoryReady(true);
        return;
      }

      const parsed = JSON.parse(saved);
      const savedThreads = Array.isArray(parsed.threads) && parsed.threads.length ? parsed.threads : defaultChatThreads;
      const savedActiveId = savedThreads.some((thread) => thread.id === parsed.activeThreadId)
        ? parsed.activeThreadId
        : savedThreads[0].id;
      const activeThread = savedThreads.find((thread) => thread.id === savedActiveId) ?? savedThreads[0];

      setChatThreads(savedThreads);
      setArchivedThreads(Array.isArray(parsed.archivedThreads) ? parsed.archivedThreads : []);
      setActiveThreadId(savedActiveId);
      setMessages(activeThread.messages?.length ? activeThread.messages : [initialAssistantMessage]);
      setLanguage(supportedLanguageIds.includes(parsed.language) ? parsed.language : "en");
      setMotionEnabled(parsed.motionEnabled ?? true);
      setVoiceEnabled(parsed.voiceEnabled ?? true);
      setHistoryReady(true);
    } catch {
      setHistoryReady(true);
    }
  }, []);

  useEffect(() => {
    if (!historyReady) return;

    window.localStorage.setItem(
      chatStorageKey,
      JSON.stringify({
        activeThreadId,
        threads: chatThreads,
        archivedThreads,
        language,
        motionEnabled,
        voiceEnabled,
      }),
    );
  }, [activeThreadId, archivedThreads, chatThreads, historyReady, language, motionEnabled, voiceEnabled]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop?.();
      window.clearTimeout(paneMotionTimerRef.current);
    };
  }, []);

  const uploadedLeaks = useMemo(
    () =>
      uploadedFiles.map((file, index) => {
        const impact = 1100 + index * 420;
        return {
          id: `upload-leak-${file.id}`,
          title: `Review ${file.name} for contract and spend leakage`,
          category: file.kind,
          impact,
          confidence: `${82 + (index % 4) * 3}%`,
          severity: index % 2 === 0 ? "High" : "Watch",
          owner: "Review",
          source: file.name,
          action: "Review extracted fields, confirm owner, and approve the prepared next action.",
        };
      }),
    [uploadedFiles],
  );

  const leaks = useMemo(() => [...uploadedLeaks, ...baseLeaks], [uploadedLeaks]);
  const tr = (key) => getCopy(language, key);
  const fieldText = (item, field) => {
    const key = item?.[`${field}Key`];
    return key ? tr(key) : item?.[field] ?? "";
  };
  const ingestMessage = ingestState.messageKey ? tr(ingestState.messageKey) : ingestState.message;
  const statusLabel = (status) => tr(statusCopyKey(status));
  const activeLabel = tr(activeSection);
  const languageMeta = languageOptions.find((option) => option.id === language) ?? languageOptions[0];
  const moneyAtRisk = leaks.reduce((sum, leak) => sum + leak.impact, 0);
  const approvedCount = Object.values(approvalState).filter((status) => status === "Approved").length;
  const openApprovalCount = approvals.length - approvedCount;
  const dataCoverage = Math.min(68 + uploadedFiles.length * 5, 96);
  const sourceCount = baseSources.reduce((sum, source) => sum + source.count, 0) + uploadedFiles.length;
  const activeAgentCount = Object.values(agentState).filter((status) => status !== "Paused").length;
  const isFreshChat = messages.length <= 1 && uploadedFiles.length === 0;
  const selectedModelConfig = modelOptions.find((model) => model.id === selectedModel) ?? modelOptions[1];
  const settingsLabel = (tabId) => tr(`settings${tabId.slice(0, 1).toUpperCase()}${tabId.slice(1)}`);
  const authStatusText =
    authStatus.messageKey === "authNoticeSignedIn"
      ? `${tr("authNoticeSignedIn")} ${authStatus.email}.`
      : tr(authStatus.messageKey);

  const metrics = [
    { id: "exposure", label: tr("metricExposure"), value: formatCurrency(moneyAtRisk), detail: tr("metricExposureDetail"), trend: "+18%", icon: "$", tone: "danger", bars: [44, 61, 38, 74, 82] },
    { id: "decisions", label: tr("metricDecisionQueue"), value: String(openApprovalCount), detail: `${approvedCount} ${tr("approved")}`, trend: `${openApprovalCount} ${tr("openShort")}`, icon: "A", tone: "warning", bars: [28, 42, 51, 47, 66] },
    { id: "savings", label: tr("metricSavingsLocked"), value: "$6,880", detail: tr("metricSavingsDetail"), trend: "+32%", icon: "S", tone: "success", bars: [30, 36, 58, 62, 77] },
    { id: "coverage", label: tr("metricDataCoverage"), value: `${dataCoverage}%`, detail: `${sourceCount} ${tr("recordsMapped")}`, trend: "+5%", icon: "D", tone: "info", bars: [56, 63, 59, 72, 86] },
  ];

  const pipeline = [
    { id: "imported", label: tr("pipelineImported"), value: String(uploadedFiles.length), tone: uploadedFiles.length ? "success" : "neutral" },
    { id: "findings", label: tr("pipelineFindings"), value: String(leaks.length), tone: "success" },
    { id: "agents", label: tr("pipelineAgents"), value: `${activeAgentCount}/${agentProfiles.length}`, tone: "info" },
    { id: "approvals", label: tr("pipelineApprovals"), value: String(openApprovalCount), tone: openApprovalCount ? "warning" : "success" },
  ];

  const healthIndicators = [
    { id: "readiness", label: tr("indicatorReadiness"), value: dataCoverage, tone: "info", detail: `${sourceCount} ${tr("recordsMapped")}` },
    { id: "agent-coverage", label: tr("indicatorAgentCoverage"), value: Math.min(62 + activeAgentCount * 9, 96), tone: "success", detail: `${activeAgentCount} ${tr("activeAgents")}` },
    { id: "latency", label: tr("indicatorDecisionLatency"), value: Math.max(28, 86 - openApprovalCount * 11), tone: openApprovalCount ? "warning" : "success", detail: `${openApprovalCount} ${tr("openApprovals")}` },
    { id: "confidence", label: tr("indicatorSavingsConfidence"), value: Math.min(74 + uploadedFiles.length * 4, 94), tone: "danger", detail: `${leaks.length} ${tr("findingsRanked")}` },
  ];

  function runPaneMotion() {
    if (!motionEnabled) return;
    window.clearTimeout(paneMotionTimerRef.current);
    setPaneMotionState("switching");
    paneMotionTimerRef.current = window.setTimeout(() => {
      setPaneMotionState("ready");
    }, 520);
  }

  function navigate(sectionId) {
    if (sectionId !== activeSection) runPaneMotion();
    setActiveSection(sectionId);
  }

  function openSettingsPanel() {
    setSettingsOpen(true);
  }

  function toggleGroup(groupTitle) {
    setOpenGroups((current) => ({
      ...current,
      [groupTitle]: !current[groupTitle],
    }));
  }

  function selectModel(model) {
    if (model.disabled) return;
    setSelectedModel(model.id);
    setModelMenuOpen(false);
  }

  function createEmptyThread() {
    return {
      id: `thread-${Date.now()}`,
      title: tr("newAnalysis"),
      updatedLabel: tr("readyForAnalysis"),
      messages: [initialAssistantMessage],
    };
  }

  function commitThreadMessages(nextMessages, titleHint) {
    const fallbackTitle = createThreadTitle(nextMessages.find((message) => message.role === "user")?.text ?? "", tr("newAnalysis"));
    const nextTitle = titleHint || fallbackTitle;

    setMessages(nextMessages);
    setChatThreads((current) =>
      current.map((thread) =>
        thread.id === activeThreadId
          ? {
              ...thread,
              title: thread.title === "New analysis" || thread.title === tr("newAnalysis") || titleHint ? nextTitle : thread.title,
              updatedLabel: tr("updatedNow"),
              messages: nextMessages,
            }
          : thread,
      ),
    );
  }

  function openThread(threadId) {
    const thread = chatThreads.find((item) => item.id === threadId);
    if (!thread) return;
    if (thread.id !== activeThreadId || activeSection !== "chat") runPaneMotion();
    setActiveThreadId(thread.id);
    setMessages(thread.messages?.length ? thread.messages : [initialAssistantMessage]);
    setChatInput("");
    setAttachmentMenuOpen(false);
    setMicStatus("");
    setActiveSection("chat");
  }

  function beginRenameThread(thread) {
    setRenamingThreadId(thread.id);
    setRenameDraft(thread.title);
  }

  function saveThreadRename(threadId) {
    const nextTitle = renameDraft.trim();
    if (!nextTitle) return;
    setChatThreads((current) =>
      current.map((thread) => (thread.id === threadId ? { ...thread, title: nextTitle, updatedLabel: "Now" } : thread)),
    );
    setRenamingThreadId(null);
    setRenameDraft("");
  }

  function archiveThread(threadId) {
    const threadToArchive = chatThreads.find((thread) => thread.id === threadId);
    if (!threadToArchive) return;

    const remainingThreads = chatThreads.filter((thread) => thread.id !== threadId);
    const fallbackThread = remainingThreads[0] ?? createEmptyThread();

    setArchivedThreads((current) => [
      {
        ...threadToArchive,
        archivedAt: new Date().toISOString(),
        updatedLabel: tr("archivedLabel"),
      },
      ...current.filter((thread) => thread.id !== threadId),
    ]);
    setChatThreads(remainingThreads.length ? remainingThreads : [fallbackThread]);
    setRenamingThreadId(null);
    setRenameDraft("");

    if (activeThreadId === threadId) {
      setActiveThreadId(fallbackThread.id);
      setMessages(fallbackThread.messages?.length ? fallbackThread.messages : [initialAssistantMessage]);
      setChatInput("");
      setActiveSection("chat");
    }
  }

  function deleteThread(threadId) {
    const remainingThreads = chatThreads.filter((thread) => thread.id !== threadId);
    const fallbackThread = remainingThreads[0] ?? createEmptyThread();

    setChatThreads(remainingThreads.length ? remainingThreads : [fallbackThread]);
    setRenamingThreadId(null);
    setRenameDraft("");

    if (activeThreadId === threadId) {
      setActiveThreadId(fallbackThread.id);
      setMessages(fallbackThread.messages?.length ? fallbackThread.messages : [initialAssistantMessage]);
      setChatInput("");
      setActiveSection("chat");
    }
  }

  function restoreArchivedThread(threadId, shouldOpen = false) {
    const archivedThread = archivedThreads.find((thread) => thread.id === threadId);
    if (!archivedThread) return;

    const threadToRestore = { ...archivedThread };
    delete threadToRestore.archivedAt;
    const restoredThread = { ...threadToRestore, updatedLabel: tr("updatedNow") };

    setArchivedThreads((current) => current.filter((thread) => thread.id !== threadId));
    setChatThreads((current) => [restoredThread, ...current.filter((thread) => thread.id !== threadId)]);

    if (shouldOpen) {
      runPaneMotion();
      setActiveThreadId(restoredThread.id);
      setMessages(restoredThread.messages?.length ? restoredThread.messages : [initialAssistantMessage]);
      setSettingsOpen(false);
      setChatInput("");
      setAttachmentMenuOpen(false);
      setActiveSection("chat");
    }
  }

  function deleteArchivedThread(threadId) {
    setArchivedThreads((current) => current.filter((thread) => thread.id !== threadId));
  }


  function startNewAnalysis(prompt = "") {
    const id = `thread-${Date.now()}`;
    const nextThread = {
      id,
      title: createThreadTitle(prompt, tr("newAnalysis")),
      updatedLabel: tr("updatedNow"),
      messages: [initialAssistantMessage],
    };
    setChatThreads((current) => [nextThread, ...current]);
    runPaneMotion();
    setActiveThreadId(id);
    setMessages(nextThread.messages);
    setChatInput(prompt);
    setAttachmentMenuOpen(false);
    setActiveSection("chat");
  }

  function toggleVoiceInput() {
    if (!voiceEnabled) {
      setMicStatus(tr("micDisabled"));
      return;
    }

    if (micState === "listening") {
      recognitionRef.current?.stop?.();
      setMicState("idle");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicStatus(tr("micUnsupported"));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = voiceLocaleMap[language] ?? "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setMicState("listening");
      setMicStatus(tr("micListening"));
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript)
        .filter(Boolean)
        .join(" ")
        .trim();

      if (transcript) {
        setChatInput((current) => `${current ? `${current} ` : ""}${transcript}`.trim());
        setMicStatus(tr("micReady"));
      }
    };

    recognition.onerror = () => {
      setMicStatus(tr("micUnsupported"));
      setMicState("idle");
    };

    recognition.onend = () => {
      setMicState("idle");
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function openUploadPicker() {
    setAttachmentMenuOpen(false);
    fileInputRef.current?.click();
  }

  function openChatUploadPicker() {
    setAttachmentMenuOpen(false);
    chatFileInputRef.current?.click();
  }

  function handleFileInputChange(event, source) {
    handleFiles(event.target.files, source);
    event.target.value = "";
  }

  function handleFiles(files, source = "Data Intake") {
    const fileList = Array.from(files ?? []);
    if (!fileList.length) return;

    const unsupportedFile = fileList.find((file) => {
      const lowerName = file.name.toLowerCase();
      return file.size > maxUploadBytes || !supportedExtensions.some((extension) => lowerName.endsWith(extension));
    });

    if (unsupportedFile) {
      setIngestState({
        status: "error",
        message: `${unsupportedFile.name} is not supported. Use PDF, CSV, XLSX, DOCX, TXT under 20 MB.`,
      });
      setActiveSection("data");
      return;
    }

    setIngestState({
      status: "processing",
      message: `Reading ${fileList.length} file${fileList.length > 1 ? "s" : ""}, extracting fields, and scoring exposure.`,
    });

    const prepared = fileList.map((file, index) => ({
      id: `${Date.now()}-${index}-${file.name}`,
      name: file.name,
      size: fileSizeLabel(file.size),
      type: file.type || "Unknown",
      kind: sourceKindFromName(file.name),
      status: "Analyzed",
      fields: {
        vendor: file.name.replace(/\.[^.]+$/, "").slice(0, 28) || "Uploaded vendor",
        renewal: `2026-0${(index % 6) + 4}-18`,
        notice: `${30 + index * 15} days`,
        value: formatCurrency(2400 + index * 850),
      },
    }));

    setUploadedFiles((current) => [...prepared, ...current]);
    commitThreadMessages(
      [
        ...messages,
        {
          role: "assistant",
          text: `${source}: analyzed ${prepared.length} file${prepared.length > 1 ? "s" : ""}. I updated exposure, evidence, Data Intake, and Savings Radar.`,
        },
      ],
      prepared[0]?.name ? `Analyze ${prepared[0].name}` : undefined,
    );
    setActiveSection(source === "AI Workspace" ? "chat" : "data");

    window.setTimeout(() => {
      setIngestState({
        status: "ready",
        message: `${prepared.length} file${prepared.length > 1 ? "s" : ""} analyzed. Review extracted fields before approving actions.`,
      });
    }, 420);
  }

  function handleUrlAnalysis(source = "Data Intake") {
    const rawValue = (urlInputRef.current?.value || urlInput).trim();
    if (!rawValue) {
      setIngestState({
        status: "error",
        message: "Enter a website or source URL before running link analysis.",
      });
      setActiveSection(source === "AI Workspace" ? "chat" : "data");
      return;
    }

    const normalizedUrl = /^https?:\/\//i.test(rawValue) ? rawValue : `https://${rawValue}`;
    let parsedUrl;

    try {
      parsedUrl = new URL(normalizedUrl);
    } catch {
      setIngestState({
        status: "error",
        message: "This link is not valid. Use a complete business website, document URL, or data source URL.",
      });
      setActiveSection(source === "AI Workspace" ? "chat" : "data");
      return;
    }

    const hostName = parsedUrl.hostname.replace(/^www\./, "");
    const prepared = {
      id: `${Date.now()}-url-${hostName}`,
      name: hostName,
      size: "URL",
      type: "Website / Link",
      kind: "URL",
      status: "Analyzed",
      fields: {
        vendor: hostName,
        renewal: "Not detected",
        notice: "Pending crawl",
        value: "Source connected",
      },
    };

    setIngestState({
      status: "processing",
      message: `Analyzing ${hostName}, extracting business context, and preparing evidence signals.`,
    });
    setUploadedFiles((current) => [prepared, ...current]);
    commitThreadMessages(
      [
        ...messages,
        {
          role: "assistant",
          text: `${source}: connected ${hostName}. I added it to Data Intake and updated the context packet for link analysis.`,
        },
      ],
      `Analyze ${hostName}`,
    );
    setUrlInput("");
    setAttachmentMenuOpen(false);
    setActiveSection(source === "AI Workspace" ? "chat" : "data");

    window.setTimeout(() => {
      setIngestState({
        status: "ready",
        message: `${hostName} analyzed. Review extracted signals before using them in approvals.`,
      });
    }, 420);
  }

  function removeUploadedFile(fileId) {
    setUploadedFiles((current) => current.filter((file) => file.id !== fileId));
    setIngestState({
      status: "ready",
      message: "Evidence source removed. Dashboard exposure and context packet were recalculated.",
    });
  }

  function clearUploadedFiles() {
    setUploadedFiles([]);
    setIngestState({
      status: "idle",
      message: "All uploaded evidence has been cleared. Connect files or links to rebuild the dashboard state.",
    });
  }

  function handleDrop(event) {
    event.preventDefault();
    handleFiles(event.dataTransfer.files, "Data Intake");
  }

  function handleSendMessage() {
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    commitThreadMessages(
      [
        ...messages,
        { role: "user", text: trimmed },
      {
        role: "assistant",
        text: `${selectedModelConfig.name}: first priority is "${fieldText(leaks[0], "title") || tr("uploadBusinessData")}". I will keep all actions in approval mode and cite source evidence.`,
      },
      ],
      createThreadTitle(trimmed),
    );
    setChatInput("");
  }

  function handleComposerKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }

  function handleAuth(provider) {
    const email = provider === "Google" ? "founder@gmail.com" : authEmail || "founder@company.com";
    if (provider === "Email" && !email.includes("@")) {
      setAuthStatus({ type: "error", messageKey: "authNoticeInvalid", email: "" });
      return;
    }

    setAuthStatus({ type: "loading", messageKey: "authNoticeChecking", email: "" });
    window.setTimeout(() => {
      setSession({ provider, email, name: email.split("@")[0] });
      setAuthStatus({ type: "success", messageKey: "authNoticeSignedIn", email });
      setAuthOpen(false);
      setAuthPassword("");
    }, 360);
  }

  function applyApproval(id, status) {
    setApprovalState((current) => ({ ...current, [id]: status }));
  }

  function toggleAgent(id) {
    setAgentState((current) => ({
      ...current,
      [id]: current[id] === "Paused" ? "Active" : "Paused",
    }));
  }

  function renderActiveSection() {
    if (activeSection === "chat") return renderChat();
    if (activeSection === "data") return renderDataIntake();
    if (activeSection === "analytics") return renderAnalytics();
    if (activeSection === "leaks") return renderLeaks();
    if (activeSection === "agents") return renderAgents();
    if (activeSection === "approvals") return renderApprovals();
    if (activeSection === "reports") return renderReports();
    if (activeSection === "plugins") return renderPlugins();
    return renderOverview();
  }

  function renderOverview() {
    return (
      <div className={styles.overview}>
        <section className={styles.heroBoard}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrowRow}>
              <span>{tr("executiveCommand")}</span>
              <span>{tr("liveSupervised")}</span>
            </div>
            <h2>{tr("dashboardHeroTitle")}</h2>
            <p>{tr("dashboardHeroText")}</p>
            <div className={styles.heroActions}>
              <button className={styles.primaryButton} type="button" onClick={openUploadPicker}>
                {tr("uploadEvidence")}
              </button>
              <button className={styles.secondaryButton} type="button" onClick={() => navigate("chat")}>
                {tr("askAnalyst")}
              </button>
            </div>
          </div>
          <div className={styles.commandCard}>
            <div className={styles.commandCardHeader}>
              <span>{tr("exposureModel")}</span>
              <strong>{formatCurrency(moneyAtRisk)}</strong>
            </div>
            <div className={styles.radarGraph} aria-hidden="true">
              {[76, 44, 68, 58, 91, 63, 82].map((height, index) => (
                <span key={index} style={{ "--bar-height": `${height}%` }} />
              ))}
            </div>
            <div className={styles.commandFooter}>
              <span>{tr("topSource")}</span>
              <strong>{fieldText(leaks[0], "source")}</strong>
            </div>
          </div>
        </section>

        <section className={styles.metricGrid} aria-label="Business metrics">
          {metrics.map((metric) => (
            <article className={styles.metricCard} data-tone={metric.tone} key={metric.id}>
              <div className={styles.metricTopline}>
                <span>{metric.label}</span>
                <i>{metric.icon}</i>
              </div>
              <strong>{metric.value}</strong>
              <div className={styles.metricFooter}>
                <p>{metric.detail}</p>
                <em>{metric.trend}</em>
              </div>
              <div className={styles.metricBars} aria-hidden="true">
                {metric.bars.map((height, index) => (
                  <span key={index} style={{ "--metric-height": `${height}%` }} />
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className={styles.pipelineStrip} aria-label="Operating pipeline">
          {pipeline.map((step) => (
            <article key={step.id}>
              <StatusDot tone={step.tone} />
              <span>{step.label}</span>
              <strong>{step.value}</strong>
            </article>
          ))}
        </section>

        <section className={styles.usageGrid} aria-label="Workspace usage metrics">
          {[
            { id: "data-processed", label: tr("usageDataProcessed"), value: `${sourceCount * 84} ${tr("rows")}`, detail: tr("usageDataProcessedText") },
            { id: "ai-requests", label: tr("usageAiRequests"), value: String(messages.length + uploadedFiles.length * 3), detail: `${selectedModelConfig.name} ${tr("activeInComposer")}` },
            { id: "automation-health", label: tr("usageAutomationHealth"), value: `${Math.min(72 + activeAgentCount * 5, 96)}%`, detail: tr("usageAutomationHealthText") },
            { id: "plugin-activity", label: tr("usagePluginActivity"), value: `4 ${tr("readyShort")}`, detail: tr("usagePluginActivityText") },
          ].map((item) => (
            <article key={item.id}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <p>{item.detail}</p>
            </article>
          ))}
        </section>

        <section className={styles.indicatorGrid} aria-label="Animated operating indicators">
          {healthIndicators.map((indicator) => (
            <article className={styles.indicatorCard} data-tone={indicator.tone} key={indicator.id}>
              <div className={styles.indicatorOrb} style={{ "--indicator-value": `${indicator.value}%` }}>
                <span>{indicator.value}%</span>
              </div>
              <div>
                <strong>{indicator.label}</strong>
                <p>{indicator.detail}</p>
              </div>
            </article>
          ))}
        </section>

        <section className={styles.boardGrid}>
          <div className={styles.panel}>
            <PanelHeader label={tr("leaks")} title={tr("highestPriorityFindings")}>
              <button className={styles.secondaryButton} type="button" onClick={() => navigate("leaks")}>
                {tr("openRadar")}
              </button>
            </PanelHeader>
            <LeakTable compact />
          </div>
          <div className={styles.stackPanel}>
            <DecisionQueue />
            <AgentPulse />
          </div>
        </section>
      </div>
    );
  }

  function renderChat() {
    const promptButtons = [
      { label: tr("renewalAudit"), prompt: "Audit all vendor renewals and find cancellation windows." },
      { label: tr("spendLeakScan"), prompt: "Find duplicate tools and unused subscriptions from uploaded spend data." },
      { label: tr("ceoSummary"), prompt: "Create a CEO summary of the fastest savings opportunities." },
      { label: tr("thisWeek"), prompt: "What should I fix this week?" },
    ];

    const composer = (
      <>
        <div className={styles.promptChips}>
          {promptButtons.map((item) => (
            <button key={item.prompt} type="button" onClick={() => setChatInput(item.prompt)}>
              {item.label}
            </button>
          ))}
        </div>
        {uploadedFiles.length > 0 && (
          <div className={styles.attachmentChips} aria-label="Attached evidence">
            {uploadedFiles.slice(0, 4).map((file) => (
              <span key={file.id}>
                <strong>{file.kind}</strong>
                {file.name}
                <button type="button" onClick={() => removeUploadedFile(file.id)} aria-label={`Remove ${file.name}`}>
                  x
                </button>
              </span>
            ))}
            {uploadedFiles.length > 4 && <em>+{uploadedFiles.length - 4} {tr("more")}</em>}
          </div>
        )}
        <div className={classNames(styles.chatComposer, attachmentMenuOpen && styles.chatComposerOpen)}>
          <div className={styles.attachWrap}>
            <button
              className={styles.attachButton}
              type="button"
              onClick={() => setAttachmentMenuOpen((current) => !current)}
              aria-label="Attach files or links"
              aria-expanded={attachmentMenuOpen}
            >
              +
            </button>
            <div className={classNames(styles.attachmentMenu, attachmentMenuOpen && styles.attachmentMenuOpen)}>
              <button type="button" onClick={openChatUploadPicker}>
                <strong>{tr("uploadFiles")}</strong>
                <span>{tr("uploadFilesHint")}</span>
              </button>
              <button type="button" onClick={openChatUploadPicker}>
                <strong>{tr("excelAnalysis")}</strong>
                <span>{tr("excelAnalysisHint")}</span>
              </button>
              <div className={styles.linkAnalysisBox}>
                <span>{tr("analyzeSourceUrl")}</span>
                <div>
                  <input
                    ref={urlInputRef}
                    value={urlInput}
                    onChange={(event) => setUrlInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") handleUrlAnalysis("AI Workspace");
                    }}
                    placeholder="company.com/pricing or data source URL"
                  />
                  <button type="button" onClick={() => handleUrlAnalysis("AI Workspace")}>
                    {tr("analyze")}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <textarea
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
            onKeyDown={handleComposerKeyDown}
            placeholder={tr("composerPlaceholder")}
            rows={1}
          />
          <div className={styles.chatComposerActions}>
            {ModelSelector({ compact: true })}
            <button
              className={classNames(styles.micButton, micState === "listening" && styles.micButtonActive)}
              type="button"
              onClick={toggleVoiceInput}
              aria-label={tr("voiceInput")}
              aria-pressed={micState === "listening"}
              title={micStatus || tr("voiceInput")}
            >
              <span aria-hidden="true" />
            </button>
            <button className={styles.sendButton} type="button" onClick={handleSendMessage} aria-label="Send message">
              ↑
            </button>
          </div>
        </div>
        {micStatus && <p className={styles.composerStatus}>{micStatus}</p>}
      </>
    );

    if (isFreshChat) {
      return (
        <section className={classNames(styles.aiDesk, styles.aiDeskFresh)}>
          <div className={styles.chatLanding}>
            <div className={styles.landingTopbar}>
              <div>
                <p className={styles.kicker}>{tr("aiWorkspace")}</p>
                <h2>{tr("chatQuestion")}</h2>
              </div>
              <div className={styles.workspaceStatusPill}>
                <span><StatusDot tone="success" /> {tr("approvalFirst")}</span>
                <strong>{selectedModelConfig.name}</strong>
              </div>
            </div>

            <div className={styles.landingCenter}>
              <span className={styles.aiMark}>Genius.</span>
              <h3>{tr("chatHero")}</h3>
              <p>
                {getCopy(language, "chatLead")}
              </p>
              <div className={styles.trustRail}>
                <span><StatusDot tone="success" /> {tr("evidenceRequired")}</span>
                <span><StatusDot tone="success" /> {tr("humanApproval")}</span>
                <span><StatusDot tone="info" /> {tr("agentReady")}</span>
              </div>
              <div className={styles.taskGrid}>
                <button type="button" onClick={() => setChatInput("Audit all vendor renewals and find cancellation windows.")}>
                  <strong>{tr("renewalAudit")}</strong>
                  <span>{tr("renewalAuditText")}</span>
                </button>
                <button type="button" onClick={() => setChatInput("Find duplicate tools and unused subscriptions from uploaded spend data.")}>
                  <strong>{tr("spendLeakScan")}</strong>
                  <span>{tr("spendLeakText")}</span>
                </button>
                <button type="button" onClick={() => setChatInput("Create a CEO summary of the fastest savings opportunities.")}>
                  <strong>{tr("ceoSummary")}</strong>
                  <span>{tr("ceoSummaryText")}</span>
                </button>
              </div>
            </div>

            <div className={styles.landingComposer}>{composer}</div>
          </div>
        </section>
      );
    }

    return (
      <section className={styles.aiDesk}>
        <div className={styles.aiHeader}>
          <div>
            <p className={styles.kicker}>{tr("aiWorkspace")}</p>
            <h2>{tr("chatRunTitle")}</h2>
          </div>
          <div className={styles.aiControls}>
            <span className={styles.workspaceStatusPill}><StatusDot tone="success" /> {selectedModelConfig.name}</span>
            <span className={styles.workspaceStatusPill}>{uploadedFiles.length} {tr("evidenceSources")}</span>
          </div>
        </div>

        <div className={styles.aiBody}>
          <div className={styles.messageColumn} aria-live="polite">
            {messages.map((message, index) => (
              <article
                className={classNames(styles.message, message.role === "user" && styles.userMessage)}
                key={`${message.role}-${index}`}
              >
                <span>{message.role === "user" ? tr("you") : tr("geniusAnalyst")}</span>
                <p>{message.text}</p>
              </article>
            ))}
          </div>
          <aside className={styles.contextRail}>
            <div>
              <p className={styles.kicker}>{tr("contextPacket")}</p>
              <h3>{uploadedFiles.length ? `${uploadedFiles.length} ${uploadedFiles.length > 1 ? tr("attachedFiles") : tr("attachedFile")}` : tr("noAttachedFiles")}</h3>
              <p>{ingestMessage}</p>
            </div>
            <div className={styles.contextStats}>
              <article>
                <span>{tr("topExposure")}</span>
                <strong>{formatCurrency(leaks[0]?.impact ?? 0)}</strong>
              </article>
              <article>
                <span>{tr("agentsLive")}</span>
                <strong>{activeAgentCount}/{agentProfiles.length}</strong>
              </article>
              <article>
                <span>{tr("approvalMode")}</span>
                <strong>{tr("required")}</strong>
              </article>
            </div>
            <button className={styles.secondaryButtonWide} type="button" onClick={() => navigate("approvals")}>
              {tr("reviewDecisions")}
            </button>
          </aside>
        </div>

        <div className={styles.composerDock}>{composer}</div>
      </section>
    );
  }

  function renderDataIntake() {
    return (
      <section className={styles.dataGridLayout}>
        <div className={styles.panel}>
          <PanelHeader label={tr("data")} title={tr("dataIntakeTitle")}>
            <button className={styles.primaryButton} type="button" onClick={openUploadPicker}>
              {tr("uploadFiles")}
            </button>
          </PanelHeader>
          <div
            className={styles.dropZone}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter") openUploadPicker();
            }}
          >
            <span className={styles.dropGlyph}>+</span>
            <h3>{tr("dropEvidenceTitle")}</h3>
            <p>{tr("dropEvidenceText")}</p>
          </div>
          <div className={styles.connectorGrid}>
            <article className={styles.connectorCard}>
              <div>
                <span>{tr("websiteUrl")}</span>
                <strong>{tr("linkAnalysis")}</strong>
                <p>{tr("linkAnalysisText")}</p>
              </div>
              <div className={styles.urlInputRow}>
                <input
                  ref={urlInputRef}
                  value={urlInput}
                  onChange={(event) => setUrlInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleUrlAnalysis("Data Intake");
                  }}
                  placeholder="https://vendor.com/pricing"
                />
                <button className={styles.secondaryButton} type="button" onClick={() => handleUrlAnalysis("Data Intake")}>
                  {tr("analyze")}
                </button>
              </div>
            </article>
            <article className={styles.connectorCard}>
              <div>
                <span>{tr("excelCsv")}</span>
                <strong>{tr("spendWorkbook")}</strong>
                <p>{tr("spendWorkbookText")}</p>
              </div>
              <button className={styles.secondaryButtonWide} type="button" onClick={openUploadPicker}>
                {tr("uploadSpreadsheet")}
              </button>
            </article>
            <article className={classNames(styles.connectorCard, styles.connectorCardMuted)}>
              <div>
                <span>{tr("sqlDatabase")}</span>
                <strong>{tr("connectionPlaceholder")}</strong>
                <p>{tr("connectionPlaceholderText")}</p>
              </div>
              <button className={styles.secondaryButtonWide} type="button" disabled>
                {tr("prepareConnection")}
              </button>
            </article>
          </div>
          <UploadStatus />
          <SourceGrid />
          <UploadedFileList />
        </div>

        <div className={styles.panel}>
          <p className={styles.kicker}>{tr("extractionReview")}</p>
          <h2>{uploadedFiles[0] ? uploadedFiles[0].name : tr("noFileSelected")}</h2>
          <p className={styles.panelLead}>{tr("extractionReviewText")}</p>
          <div className={styles.fieldList}>
            {Object.entries(
              uploadedFiles[0]?.fields ?? {
                vendor: tr("uploadFileFirst"),
                renewal: tr("pending"),
                notice: tr("pending"),
                value: tr("pending"),
              },
            ).map(([field, value]) => (
              <label key={field}>
                <span>{field}</span>
                <input defaultValue={value} />
              </label>
            ))}
          </div>
          <button className={styles.primaryButtonWide} type="button">
            {tr("saveReviewedFields")}
          </button>
        </div>
      </section>
    );
  }

  function renderAnalytics() {
    return (
      <section className={styles.analyticsLayout}>
        <div className={styles.panel}>
          <PanelHeader label={tr("analytics")} title={tr("analyticsTitle")}>
            <span className={styles.countPill}>{tr("liveModel")}</span>
          </PanelHeader>
          <div className={styles.analyticsChart}>
            {[
              { id: "contracts", label: tr("contracts"), value: 86 },
              { id: "spend", label: tr("spend"), value: 64 },
              { id: "invoices", label: tr("invoices"), value: 72 },
              { id: "owners", label: tr("owners"), value: 48 },
              { id: "approvals", label: tr("approvalsLabel"), value: 58 },
            ].map((item) => (
              <article key={item.id}>
                <div>
                  <span>{item.label}</span>
                  <strong>{item.value}%</strong>
                </div>
                <div className={styles.analyticsTrack}>
                  <span style={{ "--track-width": `${item.value}%` }} />
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.panel}>
          <PanelHeader label={tr("signals")} title={tr("operatingHealth")}>
            <button className={styles.secondaryButton} type="button" onClick={() => navigate("chat")}>
              {tr("askAI")}
            </button>
          </PanelHeader>
          <div className={styles.signalGrid}>
            {pipeline.map((item) => (
              <article key={item.label}>
                <StatusDot tone={item.tone} />
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  function renderLeaks() {
    return (
      <section className={styles.panel}>
        <PanelHeader label={tr("leaks")} title={tr("savingsRadarTitle")}>
          <button className={styles.primaryButton} type="button" onClick={() => navigate("approvals")}>
            {tr("prepareApprovals")}
          </button>
        </PanelHeader>
        <LeakTable detailed />
      </section>
    );
  }

  function renderAgents() {
    return (
      <section className={styles.agentGrid}>
        {agentProfiles.map((agent) => (
          <article className={styles.agentCard} key={agent.id}>
            <div className={styles.agentTop}>
              <div>
                <p className={styles.kicker}>{fieldText(agent, "workload")}</p>
                <h2>{fieldText(agent, "name")}</h2>
              </div>
              {StatusBadge({ tone: statusTone(agentState[agent.id]), children: statusLabel(agentState[agent.id]) })}
            </div>
            <p>{fieldText(agent, "focus")}</p>
            <div className={styles.guardrail}>
              <span>{tr("guardrail")}</span>
              <p>{fieldText(agent, "guardrail")}</p>
            </div>
            <button className={styles.secondaryButtonWide} type="button" onClick={() => toggleAgent(agent.id)}>
              {agentState[agent.id] === "Paused" ? tr("resumeAgent") : tr("pauseAgent")}
            </button>
          </article>
        ))}
      </section>
    );
  }

  function renderApprovals() {
    return (
      <section className={styles.approvalGrid}>
        {approvals.map((approval) => (
          <article className={styles.approvalCard} key={approval.id}>
            <div>
              <p className={styles.kicker}>{fieldText(approval, "owner")}</p>
              <h2>{fieldText(approval, "title")}</h2>
              <p>{tr("estimatedImpact")}: {formatCurrency(approval.impact)}</p>
            </div>
            {StatusBadge({ tone: statusTone(approvalState[approval.id]), children: statusLabel(approvalState[approval.id]) })}
            <div className={styles.actionRow}>
              <button className={styles.primaryButton} type="button" onClick={() => applyApproval(approval.id, "Approved")}>
                {tr("approve")}
              </button>
              <button className={styles.secondaryButton} type="button" onClick={() => applyApproval(approval.id, "Edited")}>
                {tr("edit")}
              </button>
              <button className={styles.secondaryButton} type="button" onClick={() => applyApproval(approval.id, "Rejected")}>
                {tr("reject")}
              </button>
            </div>
          </article>
        ))}
      </section>
    );
  }

  function renderReports() {
    return (
      <section className={styles.reportGrid}>
        {reports.map((report) => (
          <article className={styles.reportCard} key={report.title}>
            <div>
              <p className={styles.kicker}>{statusLabel(report.status)}</p>
              <h2>{fieldText(report, "title")}</h2>
              <p>{fieldText(report, "detail")}</p>
            </div>
            <button className={styles.secondaryButtonWide} type="button">
              {tr("openReport")}
            </button>
          </article>
        ))}
      </section>
    );
  }

  function renderPlugins() {
    const plugins = [
      { title: "Excel Analysis", category: "analytics", label: tr("pluginAnalytics"), detail: tr("pluginExcelDetail"), status: "Installed", tone: "success" },
      { title: "CRM Revenue Context", category: "analytics", label: tr("pluginSalesOps"), detail: tr("pluginCrmDetail"), status: "Available", tone: "info" },
      { title: "Finance Analyzer", category: "finance", label: tr("pluginFinance"), detail: tr("pluginFinanceDetail"), status: "Available", tone: "info" },
      { title: "Workflow Approvals", category: "automation", label: tr("pluginAutomation"), detail: tr("pluginWorkflowDetail"), status: "Installed", tone: "success" },
      { title: "Document Intelligence", category: "documents", label: tr("pluginDocuments"), detail: tr("pluginDocumentDetail"), status: "Installed", tone: "success" },
      { title: "Data Enrichment", category: "bi", label: tr("pluginBI"), detail: tr("pluginEnrichmentDetail"), status: "Disabled", tone: "neutral" },
    ];
    const pluginCategories = [
      { id: "all", label: tr("pluginAll") },
      { id: "analytics", label: tr("pluginAnalytics") },
      { id: "finance", label: tr("pluginFinance") },
      { id: "automation", label: tr("pluginAutomation") },
      { id: "documents", label: tr("pluginDocuments") },
      { id: "bi", label: tr("pluginBI") },
    ];
    const visiblePlugins = pluginFilter === "all" ? plugins : plugins.filter((plugin) => plugin.category === pluginFilter);

    return (
      <section className={styles.pluginPage}>
        <div className={styles.pluginToolbar}>
          {pluginCategories.map((category) => (
            <button
              className={pluginFilter === category.id ? styles.pluginFilterActive : ""}
              key={category.id}
              type="button"
              onClick={() => setPluginFilter(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>
        <div className={styles.pluginGrid}>
          {visiblePlugins.map((plugin) => (
            <article className={styles.pluginCard} key={plugin.title}>
              <div className={styles.pluginTopline}>
                <span>{plugin.label}</span>
                {StatusBadge({ tone: plugin.tone, children: statusLabel(plugin.status) })}
              </div>
              <div>
                <h2>{plugin.title}</h2>
                <p>{plugin.detail}</p>
              </div>
              <button className={styles.secondaryButtonWide} type="button" disabled={plugin.status === "Disabled"}>
                {plugin.status === "Installed" ? tr("configure") : plugin.status === "Disabled" ? tr("unavailable") : tr("enablePlugin")}
              </button>
            </article>
          ))}
        </div>
      </section>
    );
  }

  function PanelHeader({ label, title, children }) {
    return (
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.kicker}>{label}</p>
          <h2>{title}</h2>
        </div>
        {children}
      </div>
    );
  }

  function StatusBadge({ tone = "neutral", children }) {
    return <span className={classNames(styles.statusBadge, styles[`badge${tone}`])}>{children}</span>;
  }

  function GeniusLogo() {
    return (
      <span className={styles.logoMark} aria-hidden="true">
        <svg viewBox="0 0 32 32" role="img">
          <path d="M16 3.5 26.8 9.8v12.4L16 28.5 5.2 22.2V9.8L16 3.5Z" />
          <path d="M16 9.2a6.8 6.8 0 1 0 4.7 11.7v-4.1h-4.4" />
          <circle cx="23.5" cy="8.5" r="2" />
        </svg>
      </span>
    );
  }

  function ModelSelector({ compact = false }) {
    return (
      <div className={classNames(styles.modelSelector, compact && styles.modelSelectorCompact)}>
        <button
          className={classNames(styles.modelTrigger, modelMenuOpen && styles.modelTriggerOpen)}
          type="button"
          onClick={() => setModelMenuOpen((current) => !current)}
          aria-expanded={modelMenuOpen}
        >
          <span>
            <strong>{selectedModelConfig.name}</strong>
            <small>{selectedModelConfig.description}</small>
          </span>
          <em>{selectedModelConfig.badge}</em>
        </button>
        <div className={classNames(styles.modelMenu, modelMenuOpen && styles.modelMenuOpen)}>
          {modelOptions.map((model) => (
            <button
              className={classNames(
                styles.modelOption,
                selectedModel === model.id && styles.modelOptionSelected,
                model.disabled && styles.modelOptionDisabled,
              )}
              key={model.id}
              type="button"
              disabled={model.disabled}
              onClick={() => selectModel(model)}
            >
              <span>
                <strong>{model.name}</strong>
                <small>{model.description}</small>
              </span>
              <em>{model.badge}</em>
            </button>
          ))}
        </div>
      </div>
    );
  }

  function LeakTable({ compact = false, detailed = false }) {
    const visibleLeaks = compact ? leaks.slice(0, 4) : leaks;

    return (
      <div className={classNames(styles.leakTable, detailed && styles.leakTableDetailed)}>
        {visibleLeaks.map((leak) => (
          <article className={styles.leakRow} key={leak.id}>
            <div className={styles.leakMain}>
              {StatusBadge({
                tone: leak.severity === "Critical" ? "danger" : leak.severity === "High" ? "warning" : "neutral",
                children: statusLabel(leak.severity),
              })}
              <div>
                <h3>{fieldText(leak, "title")}</h3>
                <p>{fieldText(leak, "source")}</p>
              </div>
            </div>
            <div className={styles.leakMeta}>
              <span>{fieldText(leak, "category")}</span>
              <span>{fieldText(leak, "owner")}</span>
              <strong>{formatCurrency(leak.impact)}</strong>
            </div>
            {detailed && (
              <div className={styles.leakDetail}>
                <p>{fieldText(leak, "action")}</p>
                <div className={styles.actionRow}>
                  <button className={styles.primaryButton} type="button" onClick={() => navigate("approvals")}>
                    {tr("prepareApprovals")}
                  </button>
                  <button className={styles.secondaryButton} type="button" onClick={() => navigate("chat")}>
                    {tr("askAI")}
                  </button>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    );
  }

  function DecisionQueue() {
    return (
      <div className={styles.panel}>
        <PanelHeader label={tr("decisionQueue")} title={tr("approvalRequired")}>
          <span className={styles.countPill}>{openApprovalCount}</span>
        </PanelHeader>
        <div className={styles.queueList}>
          {approvals.map((approval) => (
            <article key={approval.id}>
              <div>
                <h3>{fieldText(approval, "title")}</h3>
                <p>{fieldText(approval, "owner")}</p>
              </div>
              <button type="button" onClick={() => navigate("approvals")}>
                {tr("review")}
              </button>
            </article>
          ))}
        </div>
      </div>
    );
  }

  function AgentPulse() {
    return (
      <div className={styles.panel}>
        <PanelHeader label={tr("agentLayer")} title={tr("temporaryCoverage")}>
          <span className={styles.countPill}>{activeAgentCount}/{agentProfiles.length}</span>
        </PanelHeader>
        <div className={styles.agentPulse}>
          {agentProfiles.map((agent) => (
            <article key={agent.id}>
              <StatusDot tone={statusTone(agentState[agent.id])} />
              <div>
                <h3>{fieldText(agent, "name")}</h3>
                <p>{fieldText(agent, "focus")}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  function SourceGrid() {
    const uploadedSource = uploadedFiles.length
      ? [{ id: "uploaded-source", name: tr("connectedEvidence"), count: uploadedFiles.length, status: tr("analyzedNow"), type: "Live", typeKey: "typeLive", health: 92 }]
      : [];

    return (
      <div className={styles.sourceGrid}>
        {[...uploadedSource, ...baseSources].map((source) => (
          <article className={styles.sourceCard} key={source.id}>
            <div>
              <span className={styles.sourceTypeBadge}>{fieldText(source, "type")}</span>
              <strong>{fieldText(source, "name")}</strong>
              <p>{source.count} {tr("items")} - {fieldText(source, "status")}</p>
            </div>
            <div className={styles.healthLine} aria-label={`${source.health}% source health`}>
              <span style={{ "--health": `${source.health}%` }} />
            </div>
          </article>
        ))}
      </div>
    );
  }

  function UploadStatus() {
    const tone = ingestState.status === "error" ? "warning" : ingestState.status === "idle" ? "neutral" : "success";

    return (
      <div className={classNames(styles.uploadStatus, styles[`upload${ingestState.status}`])}>
        <StatusDot tone={tone} />
        <div>
          <strong>{ingestState.status === "processing" ? tr("processingEvidence") : tr("evidencePipeline")}</strong>
          <p>{ingestMessage}</p>
        </div>
      </div>
    );
  }

  function UploadedFileList() {
    if (!uploadedFiles.length) {
      return (
        <div className={styles.emptyState}>
          <strong>{tr("emptyEvidenceTitle")}</strong>
          <p>{tr("emptyEvidenceText")}</p>
          <button className={styles.secondaryButton} type="button" onClick={openUploadPicker}>
            {tr("chooseFiles")}
          </button>
        </div>
      );
    }

    return (
      <div className={styles.uploadedList}>
        <div className={styles.inlineHeader}>
          <div>
            <p className={styles.kicker}>{tr("uploadedEvidence")}</p>
            <span className={styles.countPill}>{uploadedFiles.length}</span>
          </div>
          <button className={styles.dangerTextButton} type="button" onClick={clearUploadedFiles}>
            {tr("clearAll")}
          </button>
        </div>
        {uploadedFiles.map((file) => (
          <article className={styles.fileRow} key={file.id}>
            <div>
              <strong>{file.name}</strong>
              <p>{file.kind} - {file.size} - {file.status}</p>
            </div>
            <div className={styles.fileActions}>
              <button className={styles.secondaryButton} type="button" onClick={() => navigate("leaks")}>
                {tr("viewResult")}
              </button>
              <button className={styles.dangerTextButton} type="button" onClick={() => removeUploadedFile(file.id)}>
                {tr("remove")}
              </button>
            </div>
          </article>
        ))}
      </div>
    );
  }

  function AuthModal() {
    if (!authOpen) return null;

    return (
      <div className={styles.modalLayer} role="presentation">
        <button className={styles.overlayScrim} type="button" aria-label="Close auth" onClick={() => setAuthOpen(false)} />
        <section className={styles.authModal} aria-label="Authentication">
          <div className={styles.drawerHeader}>
            <div>
              <p className={styles.kicker}>{tr("accountAccess")}</p>
              <h2>{authMode === "signin" ? tr("authSignInTitle") : tr("authCreateWorkspace")}</h2>
            </div>
            <button className={styles.iconButton} type="button" onClick={() => setAuthOpen(false)} aria-label="Close auth">
              x
            </button>
          </div>

          <div className={styles.authTabs}>
            <button className={authMode === "signin" ? styles.tabActive : ""} type="button" onClick={() => setAuthMode("signin")}>
              {tr("authSignInTab")}
            </button>
            <button className={authMode === "signup" ? styles.tabActive : ""} type="button" onClick={() => setAuthMode("signup")}>
              {tr("authRegisterTab")}
            </button>
          </div>

          <div className={classNames(styles.authNotice, styles[`auth${authStatus.type}`])}>
            <StatusDot tone={authStatus.type === "error" ? "warning" : authStatus.type === "success" ? "success" : "info"} />
            <span>{authStatusText}</span>
          </div>

          <button className={styles.googleButton} type="button" onClick={() => handleAuth("Google")}>
            {tr("continueGoogle")}
          </button>

          <div className={styles.dividerText}>{tr("orUseEmail")}</div>

          <div className={styles.fieldList}>
            <label>
              <span>{tr("email")}</span>
              <input value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="founder@company.com" />
            </label>
            <label>
              <span>{tr("password")}</span>
              <input
                value={authPassword}
                onChange={(event) => setAuthPassword(event.target.value)}
                placeholder={tr("passwordPlaceholder")}
                type="password"
              />
            </label>
          </div>

          <button className={styles.primaryButtonWide} type="button" onClick={() => handleAuth("Email")}>
            {authMode === "signin" ? tr("signInEmail") : tr("createAccount")}
          </button>
        </section>
      </div>
    );
  }

  function SettingsDrawer() {
    if (!settingsOpen) return null;
    const activeSettingsTab = settingsTabs.find((tab) => tab.id === settingsTab) ?? settingsTabs[0];
    const activeSettingsLabel = settingsLabel(activeSettingsTab.id);

    return (
      <div className={styles.drawerLayer} role="presentation">
        <button className={styles.overlayScrim} type="button" aria-label="Close settings" onClick={() => setSettingsOpen(false)} />
        <section className={styles.settingsModal} aria-label="Settings panel">
          <aside className={styles.settingsRail} aria-label="Settings sections">
            <button className={styles.settingsCloseButton} type="button" onClick={() => setSettingsOpen(false)} aria-label="Close settings">
              x
            </button>
            {settingsTabs.map((tab) => (
              <button
                className={classNames(styles.settingsTab, settingsTab === tab.id && styles.settingsTabActive)}
                key={tab.id}
                type="button"
                onClick={() => setSettingsTab(tab.id)}
              >
                <span>{tab.icon}</span>
                <strong>{settingsLabel(tab.id)}</strong>
              </button>
            ))}
          </aside>

          <div className={styles.settingsContent}>
            <div className={styles.settingsTitlebar}>
              <div>
                <p className={styles.kicker}>{tr("settingsTitle")}</p>
                <h2>{activeSettingsLabel}</h2>
              </div>
              <span className={styles.settingsLanguagePill}>{languageMeta.native}</span>
            </div>

            <div className={styles.settingsPane}>
            {settingsTab === "general" && (
              <div className={styles.settingsRows}>
                <div className={styles.settingsRow}>
                  <div>
                    <strong>{tr("appearanceTitle")}</strong>
                    <p>{tr("appearanceHelp")}</p>
                  </div>
                  <button className={styles.selectPill} type="button" onClick={() => setSettingsTab("appearance")}>
                    {theme === "black" ? tr("themeDarkLabel") : tr("themeLightLabel")} <span>⌄</span>
                  </button>
                </div>
                <div className={styles.settingsRow}>
                  <div>
                    <strong>{tr("languageTitle")}</strong>
                    <p>{tr("languageHelp")}</p>
                  </div>
                  <button className={styles.selectPill} type="button" onClick={() => setSettingsTab("language")}>
                    {languageMeta.native} <span>⌄</span>
                  </button>
                </div>
                <label className={styles.switchRow}>
                  <span>
                    <strong>{tr("voiceInput")}</strong>
                    <small>{tr("voiceInputHelp")}</small>
                  </span>
                  <input type="checkbox" checked={voiceEnabled} onChange={(event) => setVoiceEnabled(event.target.checked)} />
                </label>
                <label className={styles.switchRow}>
                  <span>
                    <strong>{tr("motionEffects")}</strong>
                    <small>{tr("motionEffectsHelp")}</small>
                  </span>
                  <input type="checkbox" checked={motionEnabled} onChange={(event) => setMotionEnabled(event.target.checked)} />
                </label>
                <label className={styles.switchRow}>
                  <span>
                    <strong>{tr("approvalActions")}</strong>
                    <small>{tr("approvalActionsHelp")}</small>
                  </span>
                  <input type="checkbox" defaultChecked />
                </label>
                <div className={styles.settingsRow}>
                  <div>
                    <strong>{tr("voiceTitle")}</strong>
                    <p>{tr("voiceHelp")}</p>
                  </div>
                  <button className={styles.playPill} type="button">▶ {tr("preview")}</button>
                </div>
              </div>
            )}

            {settingsTab === "appearance" && (
              <div className={styles.settingsRows}>
                <div className={styles.themeCards}>
                  <button className={theme === "black" ? styles.themeCardActive : ""} type="button" onClick={() => setTheme("black")}>
                    <strong>{tr("darkTheme")}</strong>
                    <span>{tr("darkThemeHelp")}</span>
                  </button>
                  <button className={theme === "white" ? styles.themeCardActive : ""} type="button" onClick={() => setTheme("white")}>
                    <strong>{tr("lightTheme")}</strong>
                    <span>{tr("lightThemeHelp")}</span>
                  </button>
                </div>
                <div className={styles.settingsRow}>
                  <div>
                    <strong>{tr("accentColor")}</strong>
                    <p>{tr("accentColorHelp")}</p>
                  </div>
                  <span className={styles.colorSwatch}>{tr("default")}</span>
                </div>
              </div>
            )}

            {settingsTab === "language" && (
              <div className={styles.settingsRows}>
                <div className={styles.languageGrid}>
                  {languageOptions.map((option) => (
                    <button
                      className={language === option.id ? styles.languageActive : ""}
                      key={option.id}
                      type="button"
                      onClick={() => setLanguage(option.id)}
                    >
                      <strong>{option.native}</strong>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {settingsTab === "personalization" && (
              <div className={styles.settingsRows}>
                <textarea
                  className={styles.promptEditor}
                  value={promptDraft}
                  onChange={(event) => setPromptDraft(event.target.value)}
                  rows={8}
                />
                <div className={styles.toggleList}>
                  <label>
                    <input type="checkbox" defaultChecked />
                    <span>
                      <strong>{tr("requireEvidence")}</strong>
                      <small>{tr("requireEvidenceHelp")}</small>
                    </span>
                  </label>
                  <label>
                    <input type="checkbox" />
                    <span>
                      <strong>{tr("autoCreateTasks")}</strong>
                      <small>{tr("autoCreateTasksHelp")}</small>
                    </span>
                  </label>
                </div>
              </div>
            )}

            {settingsTab === "apps" && (
              <div className={styles.toggleList}>
                {["settingsPluginExcel", "settingsPluginWorkflow", "settingsPluginDocument", "settingsPluginCrm", "settingsPluginFinance"].map((nameKey, index) => (
                  <label key={nameKey}>
                    <input type="checkbox" defaultChecked={index < 3} />
                    <span>
                      <strong>{tr(nameKey)}</strong>
                      <small>{index < 3 ? tr("settingsPluginEnabled") : tr("settingsPluginReady")}</small>
                    </span>
                  </label>
                ))}
              </div>
            )}

            {settingsTab === "billing" && (
              <div className={styles.settingsGrid}>
                <div className={styles.settingsCard}>
                  <span>{tr("plan")}</span>
                  <strong>{tr("founderWorkspace")}</strong>
                  <p>{tr("mockBilling")}</p>
                </div>
                <div className={styles.settingsCard}>
                  <span>{tr("usage")}</span>
                  <strong>{messages.length + uploadedFiles.length * 3} {tr("aiRequestsLabel")}</strong>
                  <p>{tr("tracksUsage")}</p>
                </div>
              </div>
            )}

            {settingsTab === "security" && (
              <div className={styles.checkList}>
                <p><StatusDot tone="success" /> {tr("humanApprovalBeforeExecution")}</p>
                <p><StatusDot tone="success" /> {tr("evidenceOnEveryFinding")}</p>
                <p><StatusDot tone="warning" /> {tr("realOauthPending")}</p>
                <p><StatusDot tone="warning" /> {tr("apiKeysPending")}</p>
              </div>
            )}

            {settingsTab === "archive" && (
              <div className={styles.archivePane}>
                <div className={styles.settingsRow}>
                  <div>
                    <strong>{tr("archivedChats")}</strong>
                    <p>{tr("archivedChatsHelp")}</p>
                  </div>
                  <span className={styles.countPill}>{archivedThreads.length}</span>
                </div>
                {archivedThreads.length ? (
                  <div className={styles.archiveList}>
                    {archivedThreads.map((thread) => (
                      <article className={styles.archiveItem} key={thread.id}>
                        <button className={styles.archiveOpenButton} type="button" onClick={() => restoreArchivedThread(thread.id, true)}>
                          <strong>{thread.title}</strong>
                          <span>{threadPreview(thread, tr("readyForAnalysis"))}</span>
                          <em>{thread.updatedLabel || tr("archivedLabel")}</em>
                        </button>
                        <div className={styles.archiveActions}>
                          <button type="button" onClick={() => restoreArchivedThread(thread.id, true)}>
                            {tr("open")}
                          </button>
                          <button type="button" onClick={() => restoreArchivedThread(thread.id)}>
                            {tr("restore")}
                          </button>
                          <button className={styles.archiveDeleteButton} type="button" onClick={() => deleteArchivedThread(thread.id)}>
                            {tr("deleteForever")}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <strong>{tr("noArchivedChats")}</strong>
                    <p>{tr("noArchivedChatsText")}</p>
                  </div>
                )}
              </div>
            )}

            {settingsTab === "account" && (
              <div className={styles.settingsRows}>
                <label className={styles.settingsInputRow}>
                  <span>{tr("companyName")}</span>
                  <input value={companyName} onChange={(event) => setCompanyName(event.target.value)} />
                </label>
                <div className={styles.settingsCard}>
                  <strong>{session ? session.email : tr("notSignedIn")}</strong>
                  <p>{session ? `${tr("provider")}: ${session.provider}` : tr("connectGoogleEmailLater")}</p>
                  <button className={styles.secondaryButtonWide} type="button" onClick={() => setAuthOpen(true)}>
                    {session ? tr("manageAccount") : tr("signInRegister")}
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div
      className={classNames(styles.shell, sidebarCollapsed && styles.shellCollapsed)}
      data-motion={motionEnabled ? "on" : "off"}
      data-theme={theme}
    >
      <input
        ref={fileInputRef}
        className={styles.hiddenInput}
        type="file"
        multiple
        accept=".pdf,.csv,.txt,.xlsx,.xls,.doc,.docx"
        onChange={(event) => handleFileInputChange(event, "Data Intake")}
      />
      <input
        ref={chatFileInputRef}
        className={styles.hiddenInput}
        type="file"
        multiple
        accept=".pdf,.csv,.txt,.xlsx,.xls,.doc,.docx"
        onChange={(event) => handleFileInputChange(event, "AI Workspace")}
      />

      <aside className={styles.sidebar} aria-label="GENIUS navigation">
        <div className={styles.brandCluster}>
          <button className={styles.brandButton} type="button" onClick={() => navigate("overview")}>
            {GeniusLogo()}
            <span className={styles.brandText}>
              Genius<span>.</span>
            </span>
          </button>
          <button
            className={styles.collapseButton}
            type="button"
            onClick={() => setSidebarCollapsed((current) => !current)}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? ">" : "<"}
          </button>
        </div>

        <div className={styles.workspaceCard}>
          <span>{tr("workspace")}</span>
          <strong>{companyName}</strong>
          <p>{dataCoverage}% {tr("mapped")}</p>
        </div>

        <button className={styles.newThreadButton} type="button" onClick={() => startNewAnalysis()}>
          <span>+</span>
          <strong>{tr("newAnalysis")}</strong>
        </button>

        <div className={styles.sidebarActionGroup}>
          <button className={styles.sidebarActionButton} type="button" onClick={openUploadPicker}>
            <span>UP</span>
            <strong>{tr("uploadData")}</strong>
          </button>
          <button className={styles.sidebarActionButton} type="button" onClick={() => navigate("data")}>
            <span>URL</span>
            <strong>{tr("analyzeLink")}</strong>
          </button>
        </div>

        <div className={styles.recentThreads}>
          <p>{tr("recent")}</p>
          {chatThreads.slice(0, 6).map((thread) => (
            <div
              className={classNames(styles.threadRow, activeThreadId === thread.id && styles.threadRowActive)}
              key={thread.id}
            >
              {renamingThreadId === thread.id ? (
                <div className={styles.threadRename}>
                  <input
                    value={renameDraft}
                    onChange={(event) => setRenameDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") saveThreadRename(thread.id);
                      if (event.key === "Escape") {
                        setRenamingThreadId(null);
                        setRenameDraft("");
                      }
                    }}
                    aria-label={`Rename ${thread.title}`}
                  />
                  <button type="button" onClick={() => saveThreadRename(thread.id)}>
                    {tr("save")}
                  </button>
                  <button type="button" onClick={() => setRenamingThreadId(null)}>
                    {tr("cancel")}
                  </button>
                </div>
              ) : (
                <>
                  <button className={styles.threadButton} type="button" onClick={() => openThread(thread.id)}>
                    <strong>{thread.title}</strong>
                    <span>{threadPreview(thread, tr("readyForAnalysis"))}</span>
                    <em>{thread.updatedLabel}</em>
                  </button>
                  <div className={styles.threadActions}>
                    <button className={styles.threadActionButton} type="button" onClick={() => beginRenameThread(thread)} aria-label={`${tr("rename")} ${thread.title}`} title={tr("rename")}>
                      <span aria-hidden="true">✎</span>
                      <strong>{tr("rename")}</strong>
                    </button>
                    <button className={styles.threadActionButton} type="button" onClick={() => archiveThread(thread.id)} aria-label={`${tr("archive")} ${thread.title}`} title={tr("archive")}>
                      <span aria-hidden="true">↓</span>
                      <strong>{tr("archive")}</strong>
                    </button>
                    <button
                      className={classNames(styles.threadActionButton, styles.threadDeleteButton)}
                      type="button"
                      onClick={() => deleteThread(thread.id)}
                      aria-label={`${tr("delete")} ${thread.title}`}
                      title={tr("delete")}
                    >
                      <span aria-hidden="true">×</span>
                      <strong>{tr("delete")}</strong>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <nav className={styles.navList}>
          {navGroups.map((group) => (
            <div className={classNames(styles.navGroup, !openGroups[group.id] && styles.navGroupCollapsed)} key={group.id}>
              <button
                className={styles.navGroupHeader}
                type="button"
                onClick={() => toggleGroup(group.id)}
                aria-expanded={openGroups[group.id]}
              >
                <span>{tr(group.titleKey)}</span>
                <i aria-hidden="true">›</i>
              </button>
              <div className={styles.navGroupItems}>
                {group.items.map((item) => (
                  <button
                    className={classNames(styles.navItem, activeSection === item.id && styles.navItemActive)}
                    key={item.id}
                    type="button"
                    title={sidebarCollapsed ? tr(item.id) : undefined}
                    aria-pressed={activeSection === item.id}
                    onClick={() => navigate(item.id)}
                  >
                    <span>{item.short}</span>
                    <strong>{tr(item.id)}</strong>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.accountButton} type="button" onClick={() => setAuthOpen(true)}>
            <span>{session ? session.name.slice(0, 1).toUpperCase() : "U"}</span>
            <div>
              <strong>{session ? session.name : tr("signIn")}</strong>
              <small>{session ? session.email : tr("googleOrEmail")}</small>
            </div>
          </button>
          <button
            className={styles.gearButton}
            type="button"
            onClick={openSettingsPanel}
            aria-label={tr("settings")}
          >
            <span className={styles.gearIcon} aria-hidden="true" />
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <p className={styles.kicker}>GENIUS OS</p>
            <h1>{activeLabel}</h1>
          </div>
          <div className={styles.topActions}>
            <span className={styles.topStatusPill}><StatusDot tone="success" /> {tr("approvalFirst")}</span>
            <span className={styles.topStatusPill}>{uploadedFiles.length} {tr("connectedSources")}</span>
            <span className={styles.topStatusPill}>{selectedModelConfig.badge} {tr("model")}</span>
          </div>
        </header>

        <div className={classNames(styles.activePane, paneMotionState === "switching" && styles.activePaneSwitching)}>
          {renderActiveSection()}
        </div>
      </main>

      {AuthModal()}
      {SettingsDrawer()}
    </div>
  );
}
