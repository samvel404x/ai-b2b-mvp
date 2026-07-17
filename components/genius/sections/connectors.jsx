"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Database, FileText, Globe, Code2, TrendingUp, Zap, Check, CheckCircle2,
  Settings, Activity, Shield, AlertCircle, ArrowUpRight, ArrowDownRight,
  FileSpreadsheet, Lock, ExternalLink, ChevronRight, Pause, RotateCcw,
  RefreshCw, Copy, Search, HelpCircle, Eye, ArrowRight, MoreHorizontal,
  Mail, Cloud, FileImage, MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  connectorsKpis, connectorCatalog, connectorLocked,
  connectorDetail, connectorHealthPanel, liveEvents
} from "@/lib/genius-data";
import { Ring, Sparkline } from "../shared";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/components/genius/workspace-context";

const catalogIconMap = {
  xlsx:    { Icon: FileSpreadsheet, color: "text-[#22C55E]" },
  gsheet:  { Icon: FileSpreadsheet, color: "text-primary" },
  finance: { Icon: Database,    color: "text-[#7CC7FF]" },
  crm:     { Icon: Cloud,  color: "text-[#4EA1FF]" },
  webhook: { Icon: Code2,       color: "text-primary" },
  url:     { Icon: Globe,       color: "text-warning" },
};

const defaultConnectorFilterRules = [
  { id: "amount", field: "amount", op: "is greater than", val: "100", active: true },
  { id: "status", field: "status", op: "equals", val: "completed", active: true },
  { id: "source", field: "source", op: "is not", val: "test", active: true },
];

const connectorRequestStatusMeta = {
  requested: {
    label: "Requested",
    className: "border-[#7CC7FF]/25 bg-[#7CC7FF]/10 text-[#7CC7FF]",
  },
  reviewing: {
    label: "Reviewing",
    className: "border-warning/25 bg-warning/10 text-warning",
  },
  planned: {
    label: "Planned",
    className: "border-primary/25 bg-primary/10 text-primary",
  },
  declined: {
    label: "Declined",
    className: "border-critical/25 bg-critical/10 text-critical",
  },
};

const connectorRequestActions = {
  requested: [
    { status: "reviewing", label: "Review", Icon: Eye },
    { status: "planned", label: "Plan", Icon: CheckCircle2 },
    { status: "declined", label: "Decline", Icon: AlertCircle },
  ],
  reviewing: [
    { status: "planned", label: "Plan", Icon: CheckCircle2 },
    { status: "declined", label: "Decline", Icon: AlertCircle },
  ],
  planned: [
    { status: "requested", label: "Reopen", Icon: RotateCcw },
  ],
  declined: [
    { status: "requested", label: "Reopen", Icon: RotateCcw },
  ],
};

function flattenConnectorCatalog(catalog = {}) {
  return Object.entries(catalog).flatMap(([category, items]) => (
    (items || []).map((item) => ({ ...item, category }))
  ));
}

function formatLiveEventTime(value) {
  if (!value) return "Live";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatLiveEventAmount(event = {}) {
  if (typeof event.amount === "string") return event.amount;
  const amount = Number(event.amount || 0);
  const currency = String(event.currency || "USD").toUpperCase();
  if (!Number.isFinite(amount)) return "$0";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `$${Math.round(amount).toLocaleString("en-US")}`;
  }
}

function mapLiveEventRow(event, index) {
  return {
    id: event.id || event.externalId || event.orderId || `event-${index}`,
    time: formatLiveEventTime(event.occurredAt || event.createdAt || event.time),
    type: event.type || "event",
    source: event.source || event.channel || event.connectorId || "Business Live",
    orderId: event.externalId || event.orderId || event.id || `event-${index + 1}`,
    customer: event.customer || event.vendor || event.sku || event.name || "Workspace event",
    amount: formatLiveEventAmount(event),
    status: event.status || "captured",
    ingestion: event.updatedAt || event.createdAt ? "workspace" : (event.ingestion || "demo"),
  };
}

function parseLiveEventAmount(value) {
  const amount = Number.parseFloat(String(value || "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(amount) ? amount : 0;
}

function liveEventFieldValue(event = {}, field = "") {
  const key = String(field || "").trim().toLowerCase();
  if (key === "amount") return parseLiveEventAmount(event.amount);
  if (key === "status") return event.status || "";
  if (key === "source") return event.source || "";
  if (key === "type") return event.type || "";
  if (key === "customer") return event.customer || "";
  if (key === "order" || key === "order_id" || key === "orderid") return event.orderId || "";
  if (key === "ingestion") return event.ingestion || "";
  return event[key] ?? "";
}

function liveEventMatchesRule(event, rule = {}) {
  if (!rule.active) return true;

  const op = String(rule.op || "").toLowerCase();
  const expected = String(rule.val || "").trim().toLowerCase();
  const rawValue = liveEventFieldValue(event, rule.field);
  const actual = String(rawValue || "").trim().toLowerCase();

  if (op.includes("greater")) return Number(rawValue) > Number.parseFloat(expected);
  if (op.includes("less")) return Number(rawValue) < Number.parseFloat(expected);
  if (op.includes("not")) return actual !== expected;
  if (op.includes("contains")) return actual.includes(expected);
  if (op.includes("equals")) return actual === expected;
  return actual.includes(expected);
}

function applyLiveEventFilters(rows = [], rules = []) {
  const activeRules = rules.filter((rule) => rule.active);
  if (!activeRules.length) return rows;
  return rows.filter((event) => activeRules.every((rule) => liveEventMatchesRule(event, rule)));
}

function KpiCard({ kpi, index, onSelect }) {
  const trendUp = kpi.trendDir === "up";
  const trendDown = kpi.trendDir === "down";

  return (
    <button
      type="button"
      onClick={() => onSelect?.(kpi)}
      className="group relative flex min-w-0 w-full animate-fade-up flex-col gap-2 overflow-hidden rounded-xl border border-[#28313C] bg-[#0E1116] p-3 text-left transition-all hover:border-white/10 hover:bg-[#141A22] hover:shadow-[0_0_15px_rgba(255,255,255,0.03)]"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-center gap-2">
        <div className="transition-transform duration-500 group-hover:scale-110">
           <Ring value={kpi.ring} size={36} stroke={`var(--${kpi.tone})`} />
        </div>
        <div className="flex flex-col gap-0 min-w-0">
          <span className="truncate text-[9px] font-semibold uppercase tracking-widest text-muted-foreground leading-snug">
            {kpi.label}
          </span>
          <span className="text-lg font-bold tabular-nums leading-tight text-white">
            {kpi.value}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-1 mt-1">
        <span
          className={cn(
            "flex items-center gap-0.5 text-[9px] font-semibold tabular-nums",
            trendUp ? "text-primary" : trendDown ? "text-critical" : "text-muted-foreground"
          )}
        >
          {trendUp && <ArrowUpRight className="size-3" />}
          {trendDown && <ArrowDownRight className="size-3" />}
          {kpi.trend}
        </span>
        <span className="text-[9px] text-muted-foreground truncate max-w-[80px]">
          {kpi.sub}
        </span>
      </div>
      {kpi.spark && (
        <div className="absolute bottom-0 left-0 right-0 hidden h-8 opacity-20 transition-opacity group-hover:opacity-40 min-[1500px]:block">
          <Sparkline data={kpi.spark} color={`var(--${kpi.tone})`} />
        </div>
      )}
    </button>
  );
}

export default function Connectors({ onNavigate }) {
  const {
    workspace,
    busy,
    loadWorkspace,
    ingestDemoLiveEvents,
    clearLiveEvents,
    requestConnector,
    saveConnectorFilters,
    updateConnectorRequestStatus,
    connectorRequests = [],
    connectorFilters = {},
    can,
  } = useWorkspace();
  const canIngestLiveEvents = can("ingest_live_events");
  const canManageLiveEvents = can("manage_live_events");
  const canManageConnectors = can("manage_connectors");
  const [activeTab, setActiveTab] = useState("Schema mapping");
  const [activeConnectorId, setActiveConnectorId] = useState("c-biz");
  const [connectorSearch, setConnectorSearch] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  const [isRequestingConnector, setIsRequestingConnector] = useState(false);
  const [isSavingFilters, setIsSavingFilters] = useState(false);
  const [updatingConnectorRequest, setUpdatingConnectorRequest] = useState(null);
  const [isLiveStreamPaused, setIsLiveStreamPaused] = useState(false);
  const [pausedLiveEventRows, setPausedLiveEventRows] = useState([]);
  const [connectorRequestDraft, setConnectorRequestDraft] = useState({
    name: "HubSpot CRM",
    category: "CRM",
    useCase: "Sync deal stages, account owners, and renewal dates into GENIUS diagnostics.",
  });
  const [filterRules, setFilterRules] = useState(() => (
    connectorFilters?.["c-biz"]?.rules?.length ? connectorFilters["c-biz"].rules : defaultConnectorFilterRules
  ));
  const liveEventCount = workspace.liveEvents?.length || 0;
  const connectorCatalogEntries = useMemo(() => flattenConnectorCatalog(connectorCatalog), []);
  const activeConnector = connectorCatalogEntries.find((item) => item.id === activeConnectorId) || connectorCatalogEntries.find((item) => item.id === connectorDetail.id);
  const normalizedConnectorSearch = connectorSearch.trim().toLowerCase();
  const filteredConnectorCatalog = useMemo(() => {
    if (!normalizedConnectorSearch) return connectorCatalog;

    return Object.fromEntries(
      Object.entries(connectorCatalog)
        .map(([category, items]) => [
          category,
          items.filter((item) => (
            item.name.toLowerCase().includes(normalizedConnectorSearch)
            || item.desc.toLowerCase().includes(normalizedConnectorSearch)
            || category.toLowerCase().includes(normalizedConnectorSearch)
          )),
        ])
        .filter(([, items]) => items.length > 0),
    );
  }, [normalizedConnectorSearch]);
  const baseLiveEventRows = useMemo(() => {
    const workspaceEvents = Array.isArray(workspace.liveEvents) ? workspace.liveEvents : [];
    const rows = workspaceEvents.length ? workspaceEvents : connectorDetail.eventStream;
    return rows.slice(0, 12).map(mapLiveEventRow);
  }, [workspace.liveEvents]);
  const savedFilterPreset = connectorFilters?.[activeConnectorId] || null;
  const activeFilterCount = filterRules.filter((rule) => rule.active).length;
  const visibleLiveEventRows = isLiveStreamPaused && pausedLiveEventRows.length ? pausedLiveEventRows : baseLiveEventRows;
  const filteredLiveEventRows = useMemo(
    () => applyLiveEventFilters(visibleLiveEventRows, filterRules),
    [filterRules, visibleLiveEventRows],
  );
  const filterTabLabel = `Filters (${activeFilterCount})`;

  const handleTabClick = (tab) => {
    setActiveTab(tab.startsWith("Filters") ? "Filters" : tab);
  };

  const handleConnectorClick = (item) => {
    const id = item.id;
    setActiveConnectorId(id);
    setFilterRules(connectorFilters?.[id]?.rules?.length ? connectorFilters[id].rules : defaultConnectorFilterRules);

    if (id === "c-excel" || id === "c-fin") {
      onNavigate?.("data", { connectorId: id, connectorName: item.name, source: "connectors-catalog" });
      return;
    }

    if (id === "c-url") {
      onNavigate?.("data", { sourceType: "URL", connectorId: id, connectorName: item.name, source: "connectors-catalog" });
      return;
    }

    if (id !== connectorDetail.id) {
      handleLockedConnectorAction(`${item.name} native sync`);
      return;
    }

    setActiveTab("Schema mapping");
  };

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error(`${label} could not be copied.`);
    }
  };

  const handleManualSync = async () => {
    try {
      await loadWorkspace();
      toast.success("Connector state synced");
    } catch (error) {
      toast.error(error.message || "Connector sync failed.");
    }
  };

  const handleSendTestEvent = async () => {
    if (!canIngestLiveEvents) {
      toast.error("Sending test events requires ingest live events permission.");
      return;
    }
    setIsTesting(true);
    try {
      const events = await ingestDemoLiveEvents();
      toast.success(`Business Live accepted ${events.length} events. Findings and actions refreshed.`);
      onNavigate?.("savings");
    } catch (error) {
      toast.error(error.message || "Test event failed.");
    } finally {
      setIsTesting(false);
    }
  };

  const handleClearEvents = async () => {
    if (!canManageLiveEvents) {
      toast.error("Clearing live events requires manage live events permission.");
      return;
    }
    if (!window.confirm("Clear all Business Live events from this workspace?")) return;
    try {
      await clearLiveEvents();
      toast.success("Business Live events cleared");
    } catch (error) {
      toast.error(error.message || "Could not clear live events.");
    }
  };

  const handleToggleLiveStreamPause = () => {
    if (isLiveStreamPaused) {
      setIsLiveStreamPaused(false);
      setPausedLiveEventRows([]);
      toast.success("Live event stream resumed.");
      return;
    }

    setPausedLiveEventRows(baseLiveEventRows);
    setIsLiveStreamPaused(true);
    toast.success(`Live event stream paused at ${baseLiveEventRows.length} visible events.`);
  };

  const handleLockedConnectorAction = (label) => {
    toast.info(`${label} is locked until production connector credentials and role permissions are enabled.`);
  };

  const handleKpiClick = (kpi) => {
    if (["events", "rows", "freshness"].includes(kpi.id)) {
      setActiveTab("Event stream");
      return;
    }

    if (["health", "failed"].includes(kpi.id)) {
      onNavigate?.("diagnostics", { source: "connectors-kpi", metricId: kpi.id });
      return;
    }

    if (kpi.id === "coverage") {
      onNavigate?.("data", { source: "connectors-kpi", metricId: kpi.id });
      return;
    }

    if (kpi.id === "pending") {
      onNavigate?.("approvals", { source: "connectors-kpi", metricId: kpi.id });
      return;
    }

    setActiveTab("Schema mapping");
  };

  const handleChecklistStep = (step) => {
    const label = step.label.toLowerCase();
    if (label.includes("map")) {
      setActiveTab("Schema mapping");
      return;
    }
    if (label.includes("test")) {
      handleSendTestEvent();
      return;
    }
    if (label.includes("stream")) {
      setActiveTab("Event stream");
      return;
    }
    if (label.includes("endpoint")) {
      copyToClipboard("/api/live-events", "Webhook endpoint");
      return;
    }
    onNavigate?.("settings", { source: "connectors-checklist", step: step.label, connectorId: activeConnectorId });
  };

  const handleValidateMapping = () => {
    const missingRequired = connectorDetail.schemaMapping.filter((row) => row.required && !row.mappedTo);
    if (missingRequired.length) {
      toast.error(`${missingRequired.length} required fields need mapping.`);
      return;
    }
    toast.success(`${connectorDetail.schemaMapping.length} fields validated for ${connectorDetail.name}.`);
  };

  const handleOpenEvent = (event) => {
    onNavigate?.("diagnostics", {
      source: "connectors-event-stream",
      connectorId: activeConnectorId,
      liveEventId: event.id,
      externalId: event.orderId,
    });
  };

  const updateConnectorRequestDraft = (field, value) => {
    setConnectorRequestDraft((current) => ({ ...current, [field]: value }));
  };

  const handleRequestConnector = async (event) => {
    event.preventDefault();
    setIsRequestingConnector(true);
    try {
      const request = await requestConnector(connectorRequestDraft);
      toast.success(`${request.name} request saved to the workspace connector backlog.`);
      setIsRequestFormOpen(false);
    } catch (error) {
      toast.error(error.message || "Connector request could not be saved.");
    } finally {
      setIsRequestingConnector(false);
    }
  };

  const handleUpdateConnectorRequestStatus = async (request, status) => {
    if (!canManageConnectors) {
      toast.error("Connector request management requires owner or admin permission.");
      return;
    }

    const requestKey = `${request.id}:${status}`;
    setUpdatingConnectorRequest(requestKey);
    try {
      const updatedRequest = await updateConnectorRequestStatus({
        id: request.id,
        status,
        note: `Moved from ${request.status} to ${status} from Connectors workspace.`,
      });
      toast.success(`${updatedRequest.name} moved to ${updatedRequest.status}.`);
    } catch (error) {
      toast.error(error.message || "Connector request status could not be updated.");
    } finally {
      setUpdatingConnectorRequest(null);
    }
  };

  const handleSaveFilters = async () => {
    if (!canManageLiveEvents) {
      toast.error("Saving live filters requires manage live events permission.");
      return;
    }

    setIsSavingFilters(true);
    try {
      const preset = await saveConnectorFilters({
        connectorId: activeConnectorId,
        label: `${activeConnector?.name || connectorDetail.name} event filters`,
        rules: filterRules,
      });
      toast.success(`${preset.rules.length} connector filter rules saved.`);
    } catch (error) {
      toast.error(error.message || "Connector filters could not be saved.");
    } finally {
      setIsSavingFilters(false);
    }
  };

  const handleToggleFilter = (id) => {
    setFilterRules((current) => current.map((rule) => (
      rule.id === id ? { ...rule, active: !rule.active } : rule
    )));
  };

  const handleRemoveFilter = (id) => {
    setFilterRules((current) => current.filter((rule) => rule.id !== id));
  };

  const handleAddFilter = () => {
    setFilterRules((current) => [
      ...current,
      { id: `rule-${Date.now()}`, field: "source", op: "contains", val: "production", active: true },
    ]);
  };

  const handleViewAllEvents = () => {
    if (!activeFilterCount) {
      toast.info("All loaded events are already visible.");
      return;
    }

    setFilterRules((current) => current.map((rule) => ({ ...rule, active: false })));
    setActiveTab("Event stream");
    toast.success("Active event filters disabled for this view.");
  };

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto scrollbar-thin p-6 pb-2 bg-[#080A0E]">
      {/* Header */}
      <header className="flex items-start justify-between shrink-0 animate-fade-in">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-white">
            <span className="text-muted-foreground">Connectors /</span> Business Live
          </h1>
          <p className="text-[11px] text-muted-foreground">Connect, sync, and manage your business data sources.</p>
        </div>
        <div className="flex items-center gap-4">
          <button type="button" className="flex items-center gap-2 rounded-full border border-[#28313C] bg-[#0E1116] px-3 py-1.5 text-left transition-all hover:bg-[#141A22]" onClick={() => onNavigate?.("settings")}>
             <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center"><Zap className="size-2.5 text-primary" /></div>
             <div className="flex flex-col gap-0 leading-none">
               <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Provider</span>
               <span className="text-[10px] font-semibold text-white">Gemini 1.5 Pro</span>
             </div>
          </button>
          <button type="button" className="flex items-center gap-2 rounded-full border border-[#28313C] bg-[#0E1116] px-3 py-1.5 text-left transition-all hover:bg-[#141A22]" onClick={() => onNavigate?.("settings")}>
             <div className="size-4 rounded-full bg-[#21A366]/20 flex items-center justify-center"><Database className="size-2.5 text-[#21A366]" /></div>
             <div className="flex flex-col gap-0 leading-none">
               <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Database</span>
               <span className="text-[10px] font-semibold text-white">Supabase</span>
             </div>
          </button>
          <button type="button" className="flex items-center gap-2 rounded-full border border-[#28313C] bg-[#0E1116] px-3 py-1.5 text-left transition-all hover:bg-[#141A22]" onClick={() => onNavigate?.("diagnostics", { source: "connectors-health" })}>
             <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center"><CheckCircle2 className="size-2.5 text-primary" /></div>
             <div className="flex flex-col gap-0 leading-none">
               <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Connector health</span>
               <span className="text-[10px] font-semibold text-white">98%</span>
             </div>
          </button>
          <button type="button" className="flex items-center gap-2 rounded-full border border-[#28313C] bg-[#0E1116] px-3 py-1.5 text-left transition-all hover:bg-[#141A22]" onClick={() => onNavigate?.("diagnostics", { source: "connectors-data-quality" })}>
             <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center"><CheckCircle2 className="size-2.5 text-primary" /></div>
             <div className="flex flex-col gap-0 leading-none">
               <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Data quality</span>
               <span className="text-[10px] font-semibold text-primary flex items-center gap-1">Good (84%)</span>
             </div>
          </button>
          <button type="button" className="group flex items-center gap-2 rounded-full border border-[#28313C] bg-[#0E1116] px-3 py-1.5 text-left transition-all hover:bg-[#141A22] disabled:cursor-not-allowed disabled:opacity-50" onClick={handleManualSync} disabled={busy}>
             <div className="size-4 rounded-full bg-[#28313C] flex items-center justify-center group-hover:bg-primary/20 transition-colors"><RefreshCw className="size-2.5 text-muted-foreground group-hover:text-primary transition-colors" /></div>
             <div className="flex flex-col gap-0 leading-none">
               <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Last sync</span>
               <span className="text-[10px] font-semibold text-white">{liveEventCount} live events</span>
             </div>
          </button>
        </div>
      </header>

      {/* KPI Strip */}
      <div className="grid min-w-0 shrink-0 grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
        {connectorsKpis.map((kpi, i) => (
          <KpiCard key={kpi.id} kpi={kpi} index={i} onSelect={handleKpiClick} />
        ))}
      </div>

      {/* Main 3-Column Layout */}
      <div className="flex gap-6 min-h-[700px] mb-2 animate-fade-in-up" style={{ animationDelay: '100ms' }}>

        {/* LEFT SIDEBAR: Connector Catalog */}
        <div className="w-[280px] flex flex-col gap-4 shrink-0">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search connectors..."
              value={connectorSearch}
              onChange={(event) => setConnectorSearch(event.target.value)}
              className="w-full bg-[#0E1116] border border-[#28313C] rounded-lg pl-9 pr-8 py-2 text-[11px] text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            />
            {connectorSearch && (
              <button
                type="button"
                onClick={() => setConnectorSearch("")}
                className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-[#141A22] hover:text-white"
                aria-label="Clear connector search"
              >
                <RotateCcw className="size-3" />
              </button>
            )}
          </div>

          <div className="flex flex-col flex-1 overflow-y-auto scrollbar-thin pr-2 gap-6">
            {Object.entries(filteredConnectorCatalog).map(([category, items]) => (
              <div key={category} className="flex flex-col gap-2">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-1">{category}</span>
                <div className="flex flex-col gap-1">
                  {items.map(item => {
                    const isActive = item.id === activeConnectorId;
                    const cfg = catalogIconMap[item.icon] || { Icon: FileText, color: "text-white" };
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleConnectorClick(item)}
                        className={cn(
                          "group flex items-center justify-between p-2 rounded-lg text-left transition-all border",
                          isActive
                            ? "bg-[#141A22] border-[#28313C] shadow-[0_0_10px_rgba(255,255,255,0.02)]"
                            : "border-transparent hover:bg-white/[0.03] hover:border-white/5"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "size-6 rounded bg-[#0E1116] flex items-center justify-center border transition-colors",
                            isActive ? "border-primary/50 shadow-[0_0_8px_rgba(33,163,102,0.15)]" : "border-[#28313C] group-hover:border-white/20"
                          )}>
                            <cfg.Icon className={cn("size-3.5", cfg.color)} />
                          </div>
                          <div className="flex flex-col gap-0">
                            <span className={cn("text-[11px] font-semibold transition-colors", isActive ? "text-white" : "text-muted-foreground group-hover:text-white")}>{item.name}</span>
                            <span className="text-[9px] text-muted-foreground">{item.desc}</span>
                          </div>
                        </div>
                        <span className="flex items-center gap-1 text-[9px] text-primary font-bold uppercase tracking-widest">
                          <span className={cn("size-1.5 rounded-full transition-colors", isActive ? "bg-primary shadow-[0_0_5px_rgba(33,163,102,0.8)]" : "bg-primary/50")} /> {item.status}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-[#28313C]">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-1">FUTURE CONNECTORS (LOCKED)</span>
              <div className="flex flex-col gap-1">
                {connectorLocked.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleLockedConnectorAction(item.name)}
                    className="flex items-center justify-between p-2 rounded-lg text-left opacity-50 hover:opacity-80 transition-opacity grayscale hover:bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-6 rounded bg-[#0E1116] flex items-center justify-center border border-[#28313C]">
                        <Lock className="size-3 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col gap-0">
                        <span className="text-[11px] font-semibold text-muted-foreground">{item.name}</span>
                        <span className="text-[9px] text-muted-foreground">{item.desc}</span>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                       <Lock className="size-2" /> Locked
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRequestFormOpen((open) => !open)}
              className="w-full text-[11px] border-[#28313C] bg-[#0E1116] hover:bg-[#141A22] hover:text-white hover:border-white/20 transition-all mt-4"
            >
              {isRequestFormOpen ? "Close request" : "Request a connector"}
            </Button>
            {isRequestFormOpen && (
              <form onSubmit={handleRequestConnector} className="mt-3 flex flex-col gap-3 rounded-xl border border-[#28313C] bg-[#0E1116] p-3">
                <input
                  value={connectorRequestDraft.name}
                  onChange={(event) => updateConnectorRequestDraft("name", event.target.value)}
                  className="rounded-lg border border-[#28313C] bg-[#141A22] px-3 py-2 text-[11px] text-white outline-none focus:border-primary/50"
                  placeholder="Connector name"
                />
                <select
                  value={connectorRequestDraft.category}
                  onChange={(event) => updateConnectorRequestDraft("category", event.target.value)}
                  className="rounded-lg border border-[#28313C] bg-[#141A22] px-3 py-2 text-[11px] text-white outline-none focus:border-primary/50"
                >
                  <option>CRM</option>
                  <option>ERP</option>
                  <option>Finance</option>
                  <option>Commerce</option>
                  <option>Data Warehouse</option>
                  <option>Other</option>
                </select>
                <textarea
                  value={connectorRequestDraft.useCase}
                  onChange={(event) => updateConnectorRequestDraft("useCase", event.target.value)}
                  rows={3}
                  className="resize-none rounded-lg border border-[#28313C] bg-[#141A22] px-3 py-2 text-[11px] text-white outline-none focus:border-primary/50"
                  placeholder="What should GENIUS sync from this connector?"
                />
                <Button type="submit" disabled={isRequestingConnector || busy} className="h-8 text-[11px] font-bold disabled:opacity-60">
                  {isRequestingConnector ? "Saving..." : "Save request"}
                </Button>
              </form>
            )}
            {connectorRequests.length > 0 && (
              <div className="mt-3 flex flex-col gap-2 rounded-xl border border-[#28313C] bg-[#0E1116] p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] font-bold uppercase text-muted-foreground">Request backlog</span>
                  <span className="rounded border border-[#28313C] bg-[#141A22] px-1.5 py-0.5 text-[9px] font-semibold text-white">
                    {connectorRequests.length}
                  </span>
                </div>
                {!canManageConnectors && (
                  <p className="text-[9px] leading-snug text-muted-foreground">
                    Owner or admin permission is required to change request status.
                  </p>
                )}
                {connectorRequests.slice(0, 4).map((request) => {
                  const meta = connectorRequestStatusMeta[request.status] || connectorRequestStatusMeta.requested;
                  const actions = connectorRequestActions[request.status] || [];
                  const requesterLabel = [request.requester?.role, request.requester?.department]
                    .filter(Boolean)
                    .join(" / ");

                  return (
                    <div key={request.id} className="rounded-lg border border-[#28313C] bg-[#080A0E] p-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="block truncate text-[10px] font-bold text-white">{request.name}</span>
                          <span className="block truncate text-[9px] text-muted-foreground">{request.category}</span>
                        </div>
                        <span className={cn("shrink-0 rounded border px-1.5 py-0.5 text-[8px] font-bold uppercase", meta.className)}>
                          {meta.label}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[9px] leading-snug text-muted-foreground">{request.useCase}</p>
                      {requesterLabel && (
                        <p className="mt-1 truncate text-[9px] text-muted-foreground">Requested by {requesterLabel}</p>
                      )}
                      {request.statusNote && (
                        <p className="mt-1 line-clamp-2 rounded border border-[#28313C] bg-[#0E1116] px-2 py-1 text-[9px] leading-snug text-muted-foreground">
                          {request.statusNote}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {actions.map(({ status, label, Icon }) => {
                          const actionKey = `${request.id}:${status}`;
                          const isUpdating = updatingConnectorRequest === actionKey;
                          return (
                            <button
                              key={status}
                              type="button"
                              disabled={!canManageConnectors || Boolean(updatingConnectorRequest) || busy}
                              onClick={() => handleUpdateConnectorRequestStatus(request, status)}
                              className="inline-flex h-6 items-center gap-1 rounded border border-[#28313C] bg-[#141A22] px-2 text-[9px] font-semibold text-white transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-45"
                            >
                              <Icon className="size-3" />
                              {isUpdating ? "Saving" : label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* CENTER PANEL: Main Connector Setup & Details */}
        <div className="flex-1 flex flex-col rounded-xl border border-[#28313C] bg-[#0E1116] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-[#28313C] bg-[#0E1116]">
             <div className="flex items-center gap-4">
               <div className="size-10 rounded-lg bg-[#141A22] border border-[#28313C] shadow-[0_0_15px_rgba(33,163,102,0.05)] flex items-center justify-center">
                 <Code2 className="size-5 text-primary" />
               </div>
               <div className="flex flex-col gap-1">
                 <div className="flex items-center gap-3">
                   <h2 className="text-lg font-bold text-white">{connectorDetail.name}</h2>
                   <span className="flex items-center gap-1 text-[10px] text-primary font-bold uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded border border-primary/20 shadow-[0_0_10px_rgba(33,163,102,0.1)]">
                     <span className="size-1.5 rounded-full bg-primary animate-pulse" /> {connectorDetail.status}
                   </span>
                 </div>
                 <p className="text-[11px] text-muted-foreground">{connectorDetail.description}</p>
               </div>
             </div>
             <div className="flex items-center gap-2">
               <Button
                 type="button"
                 variant="outline"
                 size="sm"
                 onClick={() => onNavigate?.("support", { source: "connectors-docs", connectorId: activeConnectorId })}
                 className="h-8 text-[11px] border-[#28313C] bg-[#141A22] hover:bg-white/[0.05] hover:text-white hover:border-white/20 transition-all text-white"
               >
                 <FileText className="size-3.5 mr-1.5" /> View docs
               </Button>
               <Button
                 type="button"
                 variant="outline"
                 size="sm"
                 onClick={() => onNavigate?.("settings", { source: "connector-settings", connectorId: activeConnectorId })}
                 className="h-8 text-[11px] border-[#28313C] bg-[#141A22] hover:bg-white/[0.05] hover:text-white hover:border-white/20 transition-all text-white"
               >
                 <Settings className="size-3.5 mr-1.5" /> Connector settings
               </Button>
               <Button
                 type="button"
                 variant="outline"
                 size="icon"
                 onClick={() => onNavigate?.("settings", { source: "connector-advanced-options", connectorId: activeConnectorId })}
                 className="h-8 w-8 border-[#28313C] bg-[#141A22] hover:bg-white/[0.05] hover:text-white hover:border-white/20 transition-all text-white"
               >
                 <MoreHorizontal className="size-3.5" />
               </Button>
             </div>
          </div>

          {/* Setup Checklist */}
          <div className="flex flex-col gap-4 p-6 border-b border-[#28313C] bg-gradient-to-b from-[#0E1116] to-[#141A22]/30">
            <h3 className="text-[11px] font-bold text-white">Setup checklist</h3>
            <div className="flex items-start justify-between relative mt-2">
               <div className="absolute top-[9px] left-4 right-4 h-px bg-[#28313C] z-0" />
               {connectorDetail.checklist.map((step, idx) => (
                 <button key={idx} type="button" className="group relative z-10 flex w-24 flex-col items-center gap-2 text-center" onClick={() => handleChecklistStep(step)}>
                   <div className={cn(
                     "flex items-center justify-center size-5 rounded-full border-2 bg-[#0E1116] transition-all duration-300",
                     step.done
                       ? "border-primary text-primary shadow-[0_0_10px_rgba(33,163,102,0.3)] group-hover:bg-primary/10"
                       : "border-[#28313C] text-muted-foreground group-hover:border-white/30 group-hover:text-white/70"
                   )}>
                     <Check className="size-3" strokeWidth={3} />
                   </div>
                   <div className="flex flex-col items-center text-center gap-0.5">
                     <span className={cn(
                       "text-[10px] font-bold leading-tight transition-colors",
                       step.done ? "text-white" : "text-muted-foreground group-hover:text-white/70"
                     )}>{step.label}</span>
                     <span className={cn(
                       "text-[9px] transition-colors",
                       step.done ? "text-primary" : "text-muted-foreground"
                     )}>{step.sub}</span>
                   </div>
                 </button>
               ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-[#28313C] px-4 bg-[#0E1116]">
             <div className="flex items-center gap-6">
               {["Schema mapping", "Event stream", "Logs", "Transformations", filterTabLabel].map(tab => {
                const isActiveTab = activeTab === tab || (activeTab === "Filters" && tab.startsWith("Filters"));
                return (
                 <button
                   type="button"
                   key={tab}
                   onClick={() => handleTabClick(tab)}
                   className={cn(
                     "px-2 py-3 text-[11px] font-semibold border-b-2 transition-all relative overflow-hidden",
                     isActiveTab
                       ? "border-primary text-primary"
                       : "border-transparent text-muted-foreground hover:text-white hover:border-white/20"
                   )}
                 >
                   {isActiveTab && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary shadow-[0_0_8px_rgba(33,163,102,1)]" />}
                   {tab}
                 </button>
                );
               })}
             </div>
             <button
               type="button"
               onClick={() => onNavigate?.("support", { source: "connector-setup-guide", connectorId: activeConnectorId })}
               className="text-[10px] text-[#4EA1FF] hover:text-[#7CC7FF] transition-colors flex items-center gap-1 font-medium group"
             >
               <ExternalLink className="size-3 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" /> View setup guide
             </button>
          </div>

          {/* Tab Content: Switch content based on activeTab */}
          <div className="flex-1 flex flex-col overflow-y-auto scrollbar-thin p-6 bg-gradient-to-b from-[#0E1116] to-[#080A0E] relative">

            {(activeTab === "Schema mapping" || activeTab === "Event stream") && (
              <div className="flex flex-col gap-10 animate-fade-in">
                {/* Schema Mapping Section */}
                <div id="schema-mapping" className="flex flex-col gap-4">
                  <table className="w-full text-left text-[10px]">
                    <thead className="border-b border-[#28313C] text-muted-foreground">
                      <tr>
                        <th className="pb-2 font-bold uppercase tracking-widest w-6"></th>
                        <th className="pb-2 font-bold uppercase tracking-widest">Payload field</th>
                        <th className="pb-2 font-bold uppercase tracking-widest">Example value</th>
                        <th className="pb-2 font-bold uppercase tracking-widest">Mapped to</th>
                        <th className="pb-2 font-bold uppercase tracking-widest">Data type</th>
                        <th className="pb-2 font-bold uppercase tracking-widest text-center">Required</th>
                        <th className="pb-2 font-bold uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#28313C]/50">
                      {connectorDetail.schemaMapping.map((row, i) => (
                        <tr key={i} className="group hover:bg-white/[0.03] transition-colors">
                          <td className="py-2.5 text-muted-foreground"><MoreHorizontal className="size-3 opacity-30 group-hover:opacity-100 transition-opacity" /></td>
                          <td className="py-2.5 font-semibold text-white group-hover:text-primary transition-colors">{row.field}</td>
                          <td className="py-2.5 text-muted-foreground tabular-nums group-hover:text-white/80 transition-colors">{row.example}</td>
                          <td className="py-2.5">
                             <div className="flex items-center justify-between border border-[#28313C] group-hover:border-white/20 transition-colors rounded bg-[#141A22] px-2 py-1 max-w-[140px]">
                               <span className="text-white font-medium">{row.mappedTo}</span>
                               <ChevronRight className="size-3 text-muted-foreground rotate-90" />
                             </div>
                          </td>
                          <td className="py-2.5 text-muted-foreground"><span className="px-1.5 py-0.5 rounded bg-[#141A22] border border-[#28313C]">{row.dataType}</span></td>
                          <td className="py-2.5 text-center">
                            {row.required ? <Check className="size-3.5 text-primary mx-auto" /> : <span className="text-muted-foreground">-</span>}
                          </td>
                          <td className="py-2.5 text-right">
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-white p-1 rounded hover:bg-[#141A22] transition-all"
                              onClick={() => setActiveTab("Transformations")}
                              aria-label={`Open settings for ${row.field}`}
                            >
                              <Settings className="size-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex items-center justify-between mt-2 pt-4 border-t border-[#28313C]">
                     <button
                       type="button"
                       onClick={() => setActiveTab("Transformations")}
                       className="text-[10px] text-muted-foreground hover:text-white flex items-center gap-1.5 font-medium group transition-colors"
                     >
                       <div className="flex items-center justify-center size-4 rounded bg-[#28313C] group-hover:bg-primary group-hover:text-white transition-colors"><Check className="size-2.5" /></div>
                       Add field mapping
                     </button>
                     <Button
                       type="button"
                       variant="outline"
                       size="sm"
                       onClick={handleValidateMapping}
                       className="h-7 text-[10px] border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/50 transition-all hover:shadow-[0_0_10px_rgba(33,163,102,0.2)]"
                     >
                       <Check className="size-3 mr-1.5" /> Validate mapping
                     </Button>
                  </div>
                </div>

                {/* Event Stream Section */}
                <div id="event-stream" className="flex flex-col gap-4 pt-4 border-t border-[#28313C]">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-[11px] font-bold text-white flex items-center gap-2">
                       Live event stream <span className={cn("flex items-center gap-1 text-[9px] uppercase tracking-widest px-2 py-0.5 rounded border", isLiveStreamPaused ? "border-warning/20 bg-warning/10 text-warning" : "border-primary/20 bg-primary/10 text-primary")}><span className={cn("size-1.5 rounded-full", isLiveStreamPaused ? "bg-warning" : "bg-primary animate-pulse")} /> {isLiveStreamPaused ? "Paused" : "Live"}</span>
                     </h3>
                     <div className="flex items-center gap-2">
                       <Button type="button" variant="outline" size="sm" onClick={handleToggleLiveStreamPause} className="h-7 text-[10px] border-[#28313C] bg-[#141A22] hover:bg-white/[0.05] hover:text-white transition-all text-white">
                         {isLiveStreamPaused ? <RefreshCw className="size-3 mr-1.5" /> : <Pause className="size-3 mr-1.5" />} {isLiveStreamPaused ? "Resume" : "Pause"}
                       </Button>
                       <Button type="button" variant="outline" size="sm" onClick={handleClearEvents} disabled={busy || liveEventCount === 0} className="h-7 text-[10px] border-[#28313C] bg-[#141A22] hover:bg-white/[0.05] hover:text-white transition-all text-white disabled:opacity-40">
                         <RotateCcw className="size-3 mr-1.5" /> Clear
                       </Button>
                       <div className="relative">
                         <button
                           type="button"
                           className="flex h-7 w-24 items-center justify-between rounded border border-[#28313C] bg-[#141A22] px-2 py-1 text-left transition-colors hover:border-white/20 group/filter"
                          onClick={() => handleTabClick(filterTabLabel)}
                         >
                           <span className="text-white text-[10px] font-medium">{activeFilterCount ? `${filteredLiveEventRows.length}/${visibleLiveEventRows.length}` : "All events"}</span>
                           <ChevronRight className="size-3 text-muted-foreground group-hover/filter:rotate-90 transition-transform" />
                         </button>
                       </div>
                     </div>
                  </div>

                  <table className="w-full text-left text-[9px]">
                    <thead className="border-b border-[#28313C] text-muted-foreground">
                      <tr>
                        <th className="pb-2 font-bold uppercase tracking-widest">Time (Live)</th>
                        <th className="pb-2 font-bold uppercase tracking-widest">Event Type</th>
                        <th className="pb-2 font-bold uppercase tracking-widest">Source</th>
                        <th className="pb-2 font-bold uppercase tracking-widest">Order / Ref ID</th>
                        <th className="pb-2 font-bold uppercase tracking-widest">Customer</th>
                        <th className="pb-2 font-bold uppercase tracking-widest text-right">Amount</th>
                        <th className="pb-2 font-bold uppercase tracking-widest text-center">Status</th>
                        <th className="pb-2 font-bold uppercase tracking-widest text-right">Ingestion</th>
                        <th className="pb-2 font-bold uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#28313C]/50">
                      {filteredLiveEventRows.map((ev, i) => (
                        <tr key={ev.id || i} className="group hover:bg-white/[0.03] transition-colors">
                          <td className="py-2.5 tabular-nums text-muted-foreground group-hover:text-white/80 transition-colors">{ev.time}</td>
                          <td className="py-2.5 text-white font-medium flex items-center gap-1.5">
                            <span className="size-1 rounded-full bg-primary shadow-[0_0_5px_rgba(33,163,102,0.8)]" /> {ev.type}
                          </td>
                          <td className="py-2.5 text-muted-foreground"><span className="px-1.5 py-0.5 rounded bg-[#141A22] border border-[#28313C]">{ev.source}</span></td>
                          <td className="py-2.5 text-white tabular-nums font-mono">{ev.orderId}</td>
                          <td className="py-2.5 text-muted-foreground">{ev.customer}</td>
                          <td className="py-2.5 text-white font-bold tabular-nums text-right group-hover:text-primary transition-colors">{ev.amount}</td>
                          <td className="py-2.5 text-center">
                            <span className={cn(
                              "px-2 py-0.5 rounded uppercase tracking-widest text-[8px] font-bold",
                              ev.status === "completed" ? "text-primary bg-primary/10 border border-primary/20" :
                              ev.status === "refunded" ? "text-critical bg-critical/10 border border-critical/20" :
                              ev.status === "updated" ? "text-[#4EA1FF] bg-[#4EA1FF]/10 border border-[#4EA1FF]/20" :
                              "text-warning bg-warning/10 border border-warning/20"
                            )}>{ev.status}</span>
                          </td>
                          <td className="py-2.5 text-muted-foreground tabular-nums text-right">{ev.ingestion}</td>
                          <td className="py-2.5 text-right">
                            <button type="button" className="text-muted-foreground hover:text-white p-1 rounded hover:bg-[#141A22] transition-all" onClick={() => handleOpenEvent(ev)} aria-label={`Open event ${ev.orderId}`}>
                              <Eye className="size-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!filteredLiveEventRows.length && (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-[10px] text-muted-foreground">
                            No events match the active filters. Open Filters to adjust the current rules.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <div className="flex items-center justify-between mt-4">
                    <button
                      type="button"
                      onClick={handleViewAllEvents}
                      className="text-[10px] text-[#4EA1FF] hover:text-[#7CC7FF] transition-colors font-medium flex items-center gap-1 group"
                    >
                      View all events <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                    <span className="flex items-center gap-1 text-[9px] text-primary font-bold uppercase tracking-widest px-2 py-1 rounded bg-primary/5 border border-primary/10">
                      <span className={cn("size-1.5 rounded-full shadow-[0_0_8px_rgba(33,163,102,0.8)]", isLiveStreamPaused ? "bg-warning" : "bg-primary animate-pulse")} /> {isLiveStreamPaused ? "Paused" : "Streaming"} - {filteredLiveEventRows.length} shown / {visibleLiveEventRows.length} loaded
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Filters" && (
              <div className="flex flex-col gap-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">Active Filters</h3>
                    {savedFilterPreset?.savedAt && (
                      <p className="mt-1 text-[10px] text-muted-foreground">Saved {new Date(savedFilterPreset.savedAt).toLocaleString()}</p>
                    )}
                  </div>
                  <Button type="button" variant="outline" size="sm" disabled={isSavingFilters || busy || !canManageLiveEvents} onClick={handleSaveFilters} className="h-7 text-[10px] border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50">
                    <Check className="size-3 mr-1.5" /> {isSavingFilters ? "Saving..." : "Save filters"}
                  </Button>
                </div>

                <div className="flex flex-col gap-2">
                  {filterRules.map((filter) => (
                    <div key={filter.id} className="flex items-center gap-4 p-3 rounded-lg border border-[#28313C] bg-[#141A22] hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="px-2 py-1 rounded bg-[#0E1116] border border-[#28313C] text-[10px] text-white font-medium min-w-[80px] text-center">{filter.field}</span>
                        <span className="text-[10px] text-muted-foreground font-semibold">{filter.op}</span>
                        <span className="px-2 py-1 rounded bg-[#0E1116] border border-[#28313C] text-[10px] text-white font-mono">{filter.val}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          aria-pressed={filter.active}
                          onClick={() => handleToggleFilter(filter.id)}
                          className={cn("relative h-4 w-8 rounded-full transition-colors", filter.active ? "bg-primary/20" : "bg-[#28313C]")}
                        >
                           <div className={cn("absolute top-0.5 size-3 rounded-full shadow-[0_0_5px_rgba(33,163,102,0.8)] transition-all", filter.active ? "left-4 bg-primary" : "left-1 bg-muted-foreground")} />
                        </button>
                        <button type="button" className="text-muted-foreground hover:text-critical transition-colors" onClick={() => handleRemoveFilter(filter.id)} aria-label={`Remove ${filter.field} filter`}><RotateCcw className="size-3.5 rotate-45" /></button>
                      </div>
                    </div>
                  ))}

                  <button type="button" className="border border-dashed border-[#28313C] hover:border-white/20 hover:bg-white/[0.02] transition-colors rounded-lg p-3 text-center text-[10px] text-muted-foreground hover:text-white flex items-center justify-center gap-2 mt-2" onClick={handleAddFilter}>
                     <div className="size-4 rounded-full bg-[#28313C] flex items-center justify-center"><Check className="size-2.5" /></div>
                     Add filter rule
                  </button>
                </div>
              </div>
            )}

            {/* Placeholder for other tabs */}
            {!["Schema mapping", "Event stream", "Filters"].includes(activeTab) && (
               <div className="flex flex-col items-center justify-center flex-1 text-center animate-fade-in mt-10">
                 <Settings className="size-8 text-muted-foreground/30 mb-3" />
                 <h3 className="text-sm font-semibold text-white">{activeTab}</h3>
                 <p className="text-[11px] text-muted-foreground mt-1 max-w-xs">Configuration for {activeTab.toLowerCase()} will appear here. This section is currently locked in demo mode.</p>
                 <Button type="button" variant="outline" size="sm" onClick={() => handleTabClick("Schema mapping")} className="mt-4 border-[#28313C] bg-[#141A22] text-white hover:bg-white/[0.05]">
                   Return to Schema mapping
                 </Button>
               </div>
            )}

          </div>
        </div>

        {/* RIGHT SIDEBAR: Health & Auth */}
        <div className="w-[300px] shrink-0 flex flex-col gap-6">

          {/* Connector Health */}
          <div className="flex flex-col rounded-xl border border-[#28313C] bg-[#0E1116] p-5 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:border-primary/30 transition-colors group">
             <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">Connector health</h3>
               <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">Healthy</span>
             </div>
             <div className="flex items-center gap-4 mb-4">
               <div className="relative">
                 <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                 <Ring value={98} size={50} stroke="var(--primary)" />
               </div>
               <div className="flex flex-col gap-0.5">
                 <span className="text-[11px] font-semibold text-primary">Excellent</span>
                 <span className="text-[10px] text-muted-foreground">All systems operational</span>
               </div>
             </div>
             <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#28313C]">
                <button type="button" className="flex flex-col gap-1 p-1.5 -ml-1.5 rounded text-left transition-colors hover:bg-white/[0.02]" onClick={() => onNavigate?.("diagnostics", { source: "connectors-latency", connectorId: activeConnectorId })}>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Latency</span>
                  <span className="text-lg font-bold text-white tabular-nums">1.8s</span>
                  <span className="text-[9px] text-primary flex items-center gap-1 font-semibold"><ArrowUpRight className="size-2.5" /> Good</span>
                </button>
                <button type="button" className="flex flex-col gap-1 p-1.5 -ml-1.5 rounded text-left transition-colors hover:bg-white/[0.02]" onClick={() => onNavigate?.("diagnostics", { source: "connectors-error-rate", connectorId: activeConnectorId })}>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Error rate</span>
                  <span className="text-lg font-bold text-white tabular-nums">0.12%</span>
                  <span className="text-[9px] text-primary flex items-center gap-1 font-semibold"><ArrowDownRight className="size-2.5" /> Good</span>
                </button>
             </div>
             <button
               type="button"
               onClick={() => onNavigate?.("diagnostics")}
               className="text-[10px] text-[#4EA1FF] hover:text-[#7CC7FF] transition-colors flex items-center gap-1 font-medium mt-4 group/btn"
             >
               View health details <ArrowRight className="size-3 group-hover/btn:translate-x-0.5 transition-transform" />
             </button>
          </div>

          {/* Authentication & permissions */}
          <div className="flex flex-col rounded-xl border border-[#28313C] bg-[#0E1116] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:border-white/10 transition-colors">
            <h3 className="text-[11px] font-bold text-white uppercase tracking-widest mb-4">Authentication & permissions</h3>
            <div className="flex flex-col gap-3 text-[10px] border-b border-[#28313C] pb-4 mb-4">
               <div className="flex items-center justify-between">
                 <span className="text-muted-foreground">API Key</span>
                 <span className="font-semibold text-primary flex items-center gap-1"><Check className="size-3" /> Connected</span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-muted-foreground">Permission scope</span>
                 <span className="font-medium text-white px-1.5 py-0.5 rounded bg-[#141A22] border border-[#28313C]">Read / Write</span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-muted-foreground">Last verified</span>
                 <span className="font-medium text-white tabular-nums">10m ago</span>
               </div>
            </div>
            <button
              type="button"
              onClick={() => handleLockedConnectorAction("Credential manager")}
              className="text-[10px] text-[#4EA1FF] hover:text-[#7CC7FF] transition-colors flex items-center gap-1 font-medium group/btn"
            >
               Manage credentials <ArrowRight className="size-3 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Retry queue */}
          <div className="flex flex-col rounded-xl border border-[#28313C] bg-[#0E1116] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">Retry queue</h3>
               <span className="text-[10px] font-bold text-warning px-2 py-0.5 rounded bg-warning/10 border border-warning/20">3 items</span>
            </div>
            <div className="flex flex-col gap-2 text-[10px] border-b border-[#28313C] pb-4 mb-4">
               {connectorHealthPanel.retryQueue.map((r, i) => (
                 <button key={i} type="button" className="flex items-center justify-between text-muted-foreground hover:text-white transition-colors p-1 -mx-1 rounded hover:bg-white/[0.03]" onClick={() => handleLockedConnectorAction(`Retry ${r.id}`)}>
                   <span className="w-16 tabular-nums font-mono">{r.id}</span>
                   <span className="flex-1 truncate px-2">{r.type}</span>
                   <span className="w-12 text-right text-warning">{r.retries} retry</span>
                 </button>
               ))}
            </div>
            <button
              type="button"
              onClick={() => handleLockedConnectorAction("Retry queue manager")}
              className="text-[10px] text-[#4EA1FF] hover:text-[#7CC7FF] transition-colors flex items-center gap-1 font-medium group/btn"
            >
               View retry queue <ArrowRight className="size-3 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Webhook secret */}
          <div className="flex flex-col rounded-xl border border-[#28313C] bg-[#0E1116] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:border-white/10 transition-colors">
            <h3 className="text-[11px] font-bold text-white uppercase tracking-widest mb-3">Webhook secret</h3>
            <div className="flex items-center justify-between bg-[#141A22] border border-[#28313C] hover:border-white/20 transition-colors rounded-lg px-3 py-2 mb-3 group/secret">
               <span className="text-[11px] font-mono text-muted-foreground tracking-wider blur-[2px] group-hover/secret:blur-0 transition-all">{connectorHealthPanel.webhookSecret}</span>
               <button
                 type="button"
                 onClick={() => copyToClipboard(connectorHealthPanel.webhookSecret, "Webhook secret")}
                 className="text-muted-foreground hover:text-white transition-colors p-1 rounded hover:bg-[#28313C]"
               >
                 <Copy className="size-3.5" />
               </button>
            </div>
            <button
              type="button"
              onClick={() => handleLockedConnectorAction("Webhook secret rotation")}
              className="text-[10px] text-[#4EA1FF] hover:text-[#7CC7FF] transition-colors flex items-center gap-1 font-medium"
            >
               <RotateCcw className="size-3" /> Rotate secret
            </button>
          </div>

          {/* Test connection */}
          <div className="flex flex-col rounded-xl border border-[#28313C] bg-[#0E1116] p-5 mt-auto shadow-[0_4px_20px_rgba(0,0,0,0.2)] bg-gradient-to-br from-[#0E1116] to-primary/5">
            <h3 className="text-[11px] font-bold text-white uppercase tracking-widest mb-1.5">Test connection</h3>
            <p className="text-[10px] text-muted-foreground mb-4 leading-relaxed">Send a test event to verify your webhook is working.</p>
            <Button
              type="button"
              variant="outline"
              disabled={isTesting || busy || !canIngestLiveEvents}
              onClick={handleSendTestEvent}
              className="w-full text-[11px] border-primary/30 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-[0_0_10px_rgba(33,163,102,0.2)] hover:shadow-[0_0_15px_rgba(33,163,102,0.4)] disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <div className="size-3.5 mr-2 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Zap className="size-3.5 mr-1.5" /> {canIngestLiveEvents ? "Send test event" : "Ingest access required"}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={isTesting || busy || !canManageLiveEvents || liveEventCount === 0}
              onClick={handleClearEvents}
              className="mt-2 w-full text-[11px] text-muted-foreground hover:text-white disabled:opacity-40"
            >
              Clear live events
            </Button>
          </div>

        </div>
      </div>


    </div>
  );
}
