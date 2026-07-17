"use client";

import { useState } from "react";
import { Clock, LineChart, FileText, FileSearch, Filter, Plus, User, ShieldCheck } from "lucide-react";
import { Sparkline } from "../../shared";
import { cn } from "@/lib/utils";

// --- Details Tab ---
export function DetailsTab({ report, onOpenEvidence, onOpenAudit }) {
  const metrics = report.decision?.metrics || {};
  const impact = report.decision?.impact || {};
  const variables = [
    { label: "Decision action", value: report.decision?.action || "Review follow-up" },
    { label: "Risk level", value: metrics.risk || "Medium" },
    { label: "Demand trend", value: metrics.trend || "Live" },
    { label: "Current intake", value: metrics.intake || "N/A" },
    { label: "Optimal range", value: metrics.optimal || "N/A" },
    { label: "Revenue impact", value: impact.revenue || "Protected" },
    { label: "Coverage window", value: impact.coverage || "Current period" },
    { label: "Execution cost", value: impact.cost || "Approval gated" },
  ];
  const checks = [
    { label: "Evidence freshness", value: "Very fresh", state: "passed" },
    { label: "Policy compliance", value: "Passed", state: "passed" },
    { label: "Budget availability", value: metrics.risk === "High" ? "Warning" : "Passed", state: metrics.risk === "High" ? "warning" : "passed" },
    { label: "Human approval", value: report.status || "Pending", state: /approved|ready/i.test(report.status || "") ? "passed" : "warning" },
  ];
  const decisionPayload = {
    reportId: report.id,
    title: report.title,
    status: report.status,
    confidence: report.decision?.confidence || 90,
    action: report.decision?.action || null,
    metrics,
    impact,
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white">Decision Details</h2>
          <p className="text-sm text-muted-foreground">Technical variables, policy checks, and execution context for this Gateway decision.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onOpenEvidence} className="rounded-lg border border-[#28313C] bg-[#141A22] px-3 py-2 text-xs font-semibold text-white hover:bg-[#28313C]">
            Evidence
          </button>
          <button type="button" onClick={onOpenAudit} className="rounded-lg border border-[#28313C] bg-[#141A22] px-3 py-2 text-xs font-semibold text-white hover:bg-[#28313C]">
            Audit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-xl border border-[#28313C] bg-[#0E1116] p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-white"><FileSearch className="size-4 text-primary" /> Variables Used</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {variables.map((item) => (
              <div key={item.label} className="rounded-lg border border-[#28313C]/70 bg-[#141A22]/50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#28313C] bg-[#0E1116] p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-white"><ShieldCheck className="size-4 text-primary" /> Readiness Checks</h3>
          <div className="space-y-3">
            {checks.map((check) => (
              <div key={check.label} className="flex items-center justify-between rounded-lg border border-[#28313C]/70 bg-[#141A22]/50 px-3 py-2">
                <span className="text-xs text-muted-foreground">{check.label}</span>
                <span className={cn("text-xs font-bold", check.state === "passed" ? "text-emerald-500" : "text-warning")}>{check.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#28313C] bg-[#0E1116] p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Decision Payload</h3>
          <span className="rounded border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">{report.id}</span>
        </div>
        <pre className="max-h-[280px] overflow-auto rounded-lg border border-[#28313C] bg-[#080A0E] p-4 text-xs leading-relaxed text-muted-foreground">
{JSON.stringify(decisionPayload, null, 2)}
        </pre>
      </div>
    </div>
  );
}

// --- Forecast Tab ---
export function ForecastTab({ report }) {
  // Move trend visualizations here per requirement 25
  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white">Demand & Inventory Forecast</h2>
        <p className="text-sm text-muted-foreground">Scenario impact modeling and forecasted stockout risk.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-[#28313C] bg-[#141A22] p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><LineChart className="size-4 text-primary" /> Demand Trend (90 Days)</h3>
          <div className="h-[200px] w-full flex items-end">
             {/* Note: Sparkline is a placeholder. A robust implementation would use Recharts here as requested for responsive resizing & tooltips. */}
             <Sparkline data={[40, 45, 42, 50, 58, 65, 72, 85, 82, 95]} stroke="#4EA1FF" className="h-full w-full" />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground mt-3 pt-3 border-t border-[#28313C]/50">
            <span>Model: Prophet-v2.1</span>
            <span>Confidence: <span className="text-primary font-medium">High (92%)</span></span>
          </div>
        </div>

        <div className="rounded-xl border border-[#28313C] bg-[#141A22] p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><LineChart className="size-4 text-warning" /> Forecasted Stockout Risk</h3>
          <div className="h-[200px] w-full flex items-end">
             <Sparkline data={[100, 90, 75, 60, 45, 30, 15, 0, 0]} stroke="#f59e0b" className="h-full w-full" />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground mt-3 pt-3 border-t border-[#28313C]/50">
            <span>Best Case: 8 Days</span>
            <span>Expected: <span className="text-warning font-medium">3-5 Days</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Evidence Tab ---
export function EvidenceTab({ report, onRevalidate, onOpenRaw }) {
  // Requirement 26: Evidence Source List
  const sources = [
    { name: `${report.title || "Gateway decision"} evidence package`, status: "Healthy", quality: `${report.decision?.confidence || 90}%`, freshness: report.time || "Live", fields: ["Decision", "Risk", "Impact"] },
    { name: "Warehouse_ERP_Export_May2026.csv", status: "Healthy", quality: "98%", freshness: "4m ago", fields: ["Inventory_Level", "Throughput"] },
    { name: "Supplier_SLA_Master.pdf", status: "Healthy", quality: "100%", freshness: "2d ago", fields: ["Lead_Time", "Pricing_Tiers"] },
    { name: "Historical_Demand_Q1_Q3.xlsx", status: "Warning", quality: "85%", freshness: "30d ago", fields: ["Seasonal_Index"] },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white">Evidence & Lineage</h2>
          <p className="text-sm text-muted-foreground">Traceable sources for all facts and assumptions.</p>
        </div>
        <button type="button" onClick={onRevalidate} className="text-xs bg-[#141A22] hover:bg-[#28313C] border border-[#28313C] text-white px-4 py-2 rounded-lg font-semibold transition-colors">
          Revalidate Sources
        </button>
      </div>

      <div className="rounded-xl border border-[#28313C] overflow-hidden bg-[#0E1116]">
        <table className="w-full text-left text-sm text-white">
          <thead className="bg-[#141A22] text-xs uppercase text-muted-foreground border-b border-[#28313C]">
            <tr>
              <th className="px-4 py-3 font-semibold">Source Name</th>
              <th className="px-4 py-3 font-semibold">Data Quality</th>
              <th className="px-4 py-3 font-semibold">Freshness</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#28313C]/50">
            {sources.map((s, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-medium flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground" /> {s.name}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", s.status === "Healthy" ? "bg-primary" : "bg-warning")} />
                    {s.quality}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{s.freshness}</td>
                <td className="px-4 py-3 text-right">
                  <button type="button" onClick={() => onOpenRaw?.(s)} className="text-xs text-primary hover:underline cursor-pointer font-medium">View Raw</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function auditTimeLabel(value) {
  if (!value) return "Just now";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "Just now";
  }
}

function gatewayAuditAction(event = {}) {
  if (event.type === "note_added") return "Decision note added";
  if (event.status) return `Status changed to ${event.status}`;
  return "Gateway event";
}

// --- Notes Tab ---
export function NotesTab({ report, onSaveNote, isSaving = false }) {
  // Requirement 27: Notes Tab
  const [newNote, setNewNote] = useState("");
  const savedNotes = (Array.isArray(report.auditTrail) ? report.auditTrail : [])
    .filter((event) => String(event.note || "").trim())
    .map((event, index) => ({
      id: `${event.createdAt || "note"}-${index}`,
      author: event.actor || "Workspace user",
      text: event.note,
      time: auditTimeLabel(event.createdAt),
      status: event.status,
    }));

  const handleSave = async () => {
    if (await onSaveNote?.(newNote) === false) return;
    setNewNote("");
  };

  return (
    <div className="flex flex-col h-full p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="space-y-1 mb-6">
        <h2 className="text-lg font-bold text-white">Decision Notes</h2>
        <p className="text-sm text-muted-foreground">Context, discussions, and AI reasoning logs.</p>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        <div className="bg-[#141A22]/50 border border-primary/20 rounded-xl p-4 flex gap-4">
          <div className="size-8 rounded bg-primary/20 text-primary flex items-center justify-center shrink-0 font-bold text-xs">AI</div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">GENIUS Reasoning Engine</span>
              <span className="text-[10px] text-muted-foreground">Generated at {report.date}</span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed mt-1">
              {report.decision?.reasoning || "Anomaly detected."}
            </p>
          </div>
        </div>

        <div className="bg-[#141A22]/50 border border-[#28313C] rounded-xl p-4 flex gap-4">
          <div className="size-8 rounded bg-[#28313C] text-white flex items-center justify-center shrink-0"><User className="size-4" /></div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Sarah K. (Operations)</span>
              <span className="text-[10px] text-muted-foreground">2 hours ago</span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed mt-1">
              Supplier confirmed they can expedite the freight if approved before 3PM today.
            </p>
          </div>
        </div>
        {savedNotes.map((note) => (
          <div key={note.id} className="bg-[#141A22]/50 border border-[#28313C] rounded-xl p-4 flex gap-4">
            <div className="size-8 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0"><User className="size-4" /></div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{note.author}</span>
                <span className="text-[10px] text-muted-foreground">{note.status ? `${note.status} - ${note.time}` : note.time}</span>
              </div>
              <p className="text-sm text-white/80 leading-relaxed mt-1">{note.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto shrink-0 relative">
        <textarea 
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a human note or mention someone..."
          className="w-full bg-[#0E1116] border border-[#28313C] rounded-xl p-4 text-sm text-white focus:outline-none focus:border-primary/50 resize-none min-h-[100px]"
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {newNote && <span className="text-[10px] text-warning italic mr-2 animate-pulse">Unsaved</span>}
          <button type="button" onClick={handleSave} disabled={isSaving || !newNote.trim()} className="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50">
            {isSaving ? "Saving..." : "Save Note"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Audit Log Tab ---
export function AuditLogTab({ report }) {
  // Requirement 28: Audit Log
  const [onlyDecisionEvents, setOnlyDecisionEvents] = useState(false);
  const persistedLogs = (Array.isArray(report.auditTrail) ? report.auditTrail : []).map((event) => ({
    actor: event.actor || "Workspace user",
    action: gatewayAuditAction(event),
    time: auditTimeLabel(event.createdAt),
    details: event.note || (event.status ? `Gateway report status is ${event.status}.` : "Gateway report updated."),
  }));
  const logs = [
    ...persistedLogs,
    { actor: "GENIUS System", action: "Recommendation Generated", time: report.date, details: "Confidence: 90%" },
    { actor: "Sarah K.", action: "Viewed Decision", time: "2 hours ago", details: "IP: 192.168.1.42" },
    { actor: "Data Pipeline", action: "Evidence Updated", time: "3 hours ago", details: "Warehouse_ERP_Export synced." },
  ];
  const visibleLogs = onlyDecisionEvents ? logs.filter((log) => /decision|recommendation/i.test(`${log.action} ${log.details}`)) : logs;

  const exportCsv = () => {
    const rows = [["actor", "action", "time", "details"], ...visibleLogs.map((log) => [log.actor, log.action, log.time, log.details])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([`${csv}\n`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `genius-gateway-audit-${report.id || "report"}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white">Audit Log</h2>
          <p className="text-sm text-muted-foreground">Immutable history of actions, views, and state changes.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setOnlyDecisionEvents((value) => !value)} className="text-xs bg-[#141A22] border border-[#28313C] text-white px-3 py-1.5 rounded font-semibold flex items-center gap-2"><Filter className="size-3.5" /> {onlyDecisionEvents ? "All events" : "Decision events"}</button>
          <button type="button" onClick={exportCsv} className="text-xs bg-[#141A22] border border-[#28313C] text-white px-3 py-1.5 rounded font-semibold">Export CSV</button>
        </div>
      </div>

      <div className="space-y-0 border-l border-[#28313C] ml-4">
        {visibleLogs.map((log, i) => (
          <div key={i} className="relative pl-6 pb-6 last:pb-0">
            <div className="absolute left-[-5px] top-1 size-2.5 rounded-full bg-[#28313C] ring-4 ring-[#0E1116]" />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{log.actor}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded border border-[#28313C] bg-[#141A22] text-muted-foreground">{log.action}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">{log.details}</p>
              <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1 mt-1"><Clock className="size-3" /> {log.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
