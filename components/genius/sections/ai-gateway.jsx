"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useWorkspace } from "../workspace-context";

// Imports
import { DecisionInbox } from "./ai-gateway/decision-inbox";
import { DecisionHeader } from "./ai-gateway/decision-header";
import { OverviewTab } from "./ai-gateway/overview-tab";
import { DecisionReadinessPanel } from "./ai-gateway/decision-readiness-panel";
import { ApprovalActions } from "./ai-gateway/approval-actions";
import { ConfigureDrawer, RevisionDrawer } from "./ai-gateway/approval-drawers";
import { ValidationDialog } from "./ai-gateway/validation-dialog";
import { Panel } from "../shared";

// Tab components
import { DetailsTab, ForecastTab, EvidenceTab, NotesTab, AuditLogTab } from "./ai-gateway/tabs";

// Mock formatter (in a real app, this might be in lib/utils or the context)
function formatGatewayReport(report) {
  const createdAt = report.createdAt ? new Date(report.createdAt) : null;
  const isUrgent = Boolean(report.urgent);

  return {
    ...report,
    time: createdAt ? "Just now" : report.time || "Live",
    date: createdAt ? createdAt.toLocaleString() : report.date || "Live operations intake",
    department: report.department || "Operations",
    assignee: report.assignee || "Michael Wong",
    period: report.period || "Last 14 Days",
    dataStale: report.dataStale || false,
    color: isUrgent ? "critical" : report.status === "Ready" ? "evidence" : "primary",
    decision: {
      summary: report.decision?.summary || "Anomaly detected requiring manual override.",
      action: report.decision?.action || "Review follow-up",
      confidence: report.decision?.confidence || 90,
      metrics: {
        trend: report.decision?.metrics?.trend || "+12%",
        intake: report.decision?.metrics?.intake || "50 kg",
        optimal: report.decision?.metrics?.optimal || "120 - 150 kg",
        risk: report.decision?.metrics?.risk || (isUrgent ? "High" : "Low"),
      },
      impact: {
        revenue: report.decision?.impact?.revenue || 4800,
        coverage: report.decision?.impact?.coverage || "4-6 days",
        cost: report.decision?.impact?.cost || 1620,
      },
    },
  };
}

const TABS = ["Overview", "Details", "Forecast", "Evidence", "Notes", "Audit Log"];

export default function AiGateway({ onNavigate }) {
  const { operations, updateGatewayReport, busy, can } = useWorkspace();
  const canDecideGatewayReport = can("decide_gateway_report");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [isMobile, setIsMobile] = useState(false);

  // URL state sync
  const queryReportId = searchParams.get("report");
  const rawQueryTab = searchParams.get("tab") || "Overview";
  const queryTab = TABS.includes(rawQueryTab) ? rawQueryTab : "Overview";

  // Drawers and Dialogs State
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [revisionDrawerOpen, setRevisionDrawerOpen] = useState(false);
  const [validationOpen, setValidationOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Responsive check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Data processing
  const workspaceReports = useMemo(() => (operations?.gatewayReports || []).map(formatGatewayReport), [operations]);

  const selectedReport = useMemo(() => {
    if (queryReportId) {
      return workspaceReports.find((r) => r.id === queryReportId) || workspaceReports[0];
    }
    return workspaceReports[0] || null;
  }, [workspaceReports, queryReportId]);

  // Routing actions
  const setQueryState = useCallback((key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [searchParams, router, pathname]);

  const handleSelectReport = (id) => setQueryState("report", id);
  const handleSelectTab = (tab) => setQueryState("tab", tab);
  const handleBackToReports = () => setQueryState("report", "");

  const updateSelectedReport = async (status, note, successMessage) => {
    if (!selectedReport) return;
    if (!canDecideGatewayReport) {
      toast.error("Gateway decisions require decide gateway report permission.");
      return;
    }
    try {
      await updateGatewayReport(selectedReport.id, status, note);
      toast.success(successMessage);
    } catch (error) {
      toast.error(error.message || "Gateway decision could not be saved");
    }
  };

  // --- Actions & Validation Logic ---
  const handleInitiateApproval = () => {
    setPendingAction("approve");
    setValidationOpen(true);
  };

  const handleValidationComplete = () => {
    if (pendingAction === "approve") {
      updateSelectedReport("Approved", "Approved by CEO Gateway.", "Decision approved successfully");
    } else {
      toast.success("Gateway data validation completed");
    }
  };

  const handleApproveAndConfigure = () => setConfigDrawerOpen(true);
  const submitConfiguration = async () => {
    await updateSelectedReport("Execution Queued", "Approved & Configured by CEO Gateway.", "Execution scheduled");
  };

  const handleRequestRevision = () => setRevisionDrawerOpen(true);
  const submitRevision = async (reason) => {
    await updateSelectedReport("Revision Requested", `Revision requested: ${reason}`, "Revision requested successfully");
  };

  const handleReject = () => {
    updateSelectedReport("Rejected", "Rejected by CEO Gateway.", "Decision rejected");
  };

  const handleValidateData = () => {
    setPendingAction("validate");
    setValidationOpen(true);
  };

  const handleCopyReportId = async () => {
    if (!selectedReport?.id) return;
    try {
      await navigator.clipboard.writeText(selectedReport.id);
      toast.success("Report ID copied");
    } catch {
      toast.info(selectedReport.id);
    }
  };

  const handleOpenRawEvidence = (source) => {
    onNavigate?.("data", {
      source: "gateway-evidence",
      reportId: selectedReport?.id || null,
      evidenceName: source?.name || selectedReport?.title || null,
    });
  };

  const handleSaveNote = async (note) => {
    const cleanNote = String(note || "").trim();
    if (!cleanNote) {
      toast.error("Write a note before saving.");
      return false;
    }
    if (!selectedReport) return false;
    if (!canDecideGatewayReport) {
      toast.error("Gateway notes require decide gateway report permission.");
      return false;
    }

    try {
      await updateGatewayReport(selectedReport.id, "", cleanNote);
      toast.success("Decision note saved to the Gateway audit trail.");
      return true;
    } catch (error) {
      toast.error(error.message || "Decision note could not be saved.");
      return false;
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#080A0E]">
      {/* Drawers & Dialogs */}
      <ConfigureDrawer open={configDrawerOpen} onOpenChange={setConfigDrawerOpen} onConfirm={submitConfiguration} />
      <RevisionDrawer open={revisionDrawerOpen} onOpenChange={setRevisionDrawerOpen} onConfirm={submitRevision} />
      <ValidationDialog open={validationOpen} onOpenChange={setValidationOpen} onComplete={handleValidationComplete} shouldFail={false} />

      {/* 1. Left Sidebar: Inbox */}
      <div className={cn(
        "flex flex-col w-full lg:w-[320px] xl:w-[340px] shrink-0 z-20 border-r border-[#28313C] bg-[#0E1116]",
        isMobile && selectedReport ? "hidden" : "flex"
      )}>
        <DecisionInbox
          reports={workspaceReports}
          selectedReportId={selectedReport?.id}
          onSelectReport={handleSelectReport}
          isLoading={!workspaceReports.length}
        />
      </div>

      {/* Main Workspace Layout */}
      {selectedReport ? (
        <>
          {/* 2. Main Decision Canvas */}
          <div className={cn(
            "flex-1 flex flex-col min-w-0 bg-[#080A0E] relative z-10",
            isMobile && !selectedReport && "hidden"
          )}>
            <DecisionHeader
              report={selectedReport}
              onBack={handleBackToReports}
              onValidateData={handleValidateData}
              onOpenAudit={() => handleSelectTab("Audit Log")}
              onCopyReportId={handleCopyReportId}
            />

            {/* Decision Tabs */}
            <div className="flex items-center gap-6 px-6 lg:px-8 overflow-x-auto scrollbar-none border-b border-[#28313C] bg-[#0E1116]">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleSelectTab(tab)}
                  className={cn(
                    "whitespace-nowrap pb-3 text-[13px] font-semibold transition-all relative mt-3 border-b-2",
                    queryTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-white"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col relative bg-[#080A0E]">
              <div className="flex-1 overflow-y-auto">
                {queryTab === "Overview" && (
                  <OverviewTab
                    report={selectedReport}
                    busy={busy}
                    onOpenDetails={() => handleSelectTab("Details")}
                    onOpenEvidence={() => handleSelectTab("Evidence")}
                    onOpenRisks={() => onNavigate?.("diagnostics", { source: "gateway-risks", reportId: selectedReport.id })}
                    onConfigureExecution={() => setConfigDrawerOpen(true)}
                  />
                )}
                {queryTab === "Details" && (
                  <DetailsTab
                    report={selectedReport}
                    onOpenEvidence={() => handleSelectTab("Evidence")}
                    onOpenAudit={() => handleSelectTab("Audit Log")}
                  />
                )}
                {queryTab === "Forecast" && <ForecastTab report={selectedReport} />}
                {queryTab === "Evidence" && <EvidenceTab report={selectedReport} onRevalidate={handleValidateData} onOpenRaw={handleOpenRawEvidence} />}
                {queryTab === "Notes" && <NotesTab report={selectedReport} onSaveNote={handleSaveNote} isSaving={busy} />}
                {queryTab === "Audit Log" && <AuditLogTab report={selectedReport} />}
              </div>

              {/* Sticky Action Bar */}
              <ApprovalActions
                report={selectedReport}
                isMobile={isMobile}
                onApprove={handleInitiateApproval}
                onApproveAndConfigure={handleApproveAndConfigure}
                onRequestRevision={handleRequestRevision}
                onReject={handleReject}
                canAct={canDecideGatewayReport}
              />
            </div>
          </div>

          {/* 3. Right Rail: Readiness Panel */}
          {!isMobile && (
           <div className="hidden lg:flex flex-col w-[320px] xl:w-[360px] shrink-0 z-10 border-l border-[#28313C] bg-[#0E1116]">
              <DecisionReadinessPanel
                report={selectedReport}
                onOpenDetails={() => handleSelectTab("Details")}
                onOpenAudit={() => handleSelectTab("Audit Log")}
                onOpenIssues={() => handleSelectTab("Details")}
              />
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground bg-[#080A0E]">
          <div className="size-16 rounded-2xl bg-[#141A22] border border-[#28313C] flex items-center justify-center mb-6">
             <span className="text-xl">ðŸ“¥</span>
          </div>
          <p className="text-sm font-medium">Select a decision from the inbox to review</p>
        </div>
      )}
    </div>
  );
}
