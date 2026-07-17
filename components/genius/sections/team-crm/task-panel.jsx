"use client";

import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { 
  X, Calendar, AlertTriangle, CheckSquare, Loader2, Check, Clock, FileText, 
  MessageSquare, Paperclip, ChevronLeft, ChevronRight, Link as LinkIcon, 
  Maximize2, Settings, Hash, User, Tag, Sparkles, Plus, AlertCircle, Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useWorkspace } from "../../workspace-context";
import Image from "next/image";

const CHECKLIST_TEMPLATE = [
  { id: 1, label: "Receive delivery and verify quantity" },
  { id: 2, label: "Inspect quality and document findings" },
  { id: 3, label: "Record intake in inventory system" },
  { id: 4, label: "Upload delivery receipt" },
  { id: 5, label: "Update batch tracking" },
  { id: 6, label: "Notify warehouse team" },
  { id: 7, label: "AI / CEO review" },
];

function checklistProgress(task = {}) {
  const value = String(task.checklist || "");
  const match = value.match(/(\d+)\s*\/\s*(\d+)/);
  if (match) {
    const total = Math.max(1, Number(match[2]) || CHECKLIST_TEMPLATE.length);
    const completed = Math.max(0, Math.min(total, Number(match[1]) || 0));
    return { completed, total };
  }

  const progress = Math.max(0, Math.min(100, Number(task.progress || 0) || 0));
  return {
    completed: Math.round((progress / 100) * CHECKLIST_TEMPLATE.length),
    total: CHECKLIST_TEMPLATE.length,
  };
}

function buildChecklist(task = {}) {
  const { completed } = checklistProgress(task);
  return CHECKLIST_TEMPLATE.map((item, index) => {
    const checked = index < completed;
    return {
      ...item,
      checked,
      user: checked ? task.assignee || "Operations" : "Pending",
      date: checked ? task.date || "Today" : "Pending",
    };
  });
}

export function TaskPanel({ task, onClose, onSubmitted, onUpdated, onDeleted, onNavigate, onNavigateRelative, hasPrevious = false, hasNext = false }) {
  const { submitTeamReport, createCrmTask, updateCrmTask, deleteCrmTask, can } = useWorkspace();
  const canSubmitTeamReport = can("submit_team_report");
  const [activeMainTab, setActiveMainTab] = useState("Overview");
  const [activeRightTab, setActiveRightTab] = useState("Activity");
  const [checklist, setChecklist] = useState(() => buildChecklist(task));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingChecklist, setIsSavingChecklist] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [templateSaved, setTemplateSaved] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [extraSubtasks, setExtraSubtasks] = useState([]);
  const [editForm, setEditForm] = useState({ 
    title: task.title, 
    description: task.description || "Record and reconcile daily supply intake of 50kg mushrooms from Farm Fresh Co. Ensure quantity, quality, and documentation are accurate.",
    team: task.team,
    priority: task.priority
  });

  const persistChecklist = async (nextChecklist) => {
    if (!task?.id) return;

    const completed = nextChecklist.filter((item) => item.checked).length;
    const total = nextChecklist.length || 1;
    const progress = Math.round((completed / total) * 100);
    const patch = {
      ...task,
      checklist: `${completed}/${total}`,
      progress,
      comments: Math.min(999, Number(task.comments || 0) + 1),
    };

    setIsSavingChecklist(true);
    try {
      const savedTask = await updateCrmTask(patch);
      onUpdated?.(savedTask || patch);
    } catch (error) {
      toast.error(error.message || "Checklist progress could not be saved.");
      throw error;
    } finally {
      setIsSavingChecklist(false);
    }
  };

  const handleToggleCheck = async (id) => {
    const previousChecklist = checklist;
    const nextChecklist = checklist.map((item) => (
      item.id === id ? { ...item, checked: !item.checked, user: !item.checked ? task.assignee || "You" : "Pending", date: !item.checked ? "Just now" : "Pending" } : item
    ));

    setChecklist(nextChecklist);
    try {
      await persistChecklist(nextChecklist);
    } catch {
      setChecklist(previousChecklist);
    }
  };

  const handleAddChecklistItem = () => {
    const nextItem = {
      id: Date.now(),
      label: "New checklist item",
      checked: false,
      user: "Pending",
      date: "Pending",
    };
    setChecklist((current) => [...current, nextItem]);
  };

  const handleSubmit = async () => {
    if (!canSubmitTeamReport) {
      toast.error("Team report submission requires submit team report permission.");
      return;
    }

    setIsSubmitting(true);
    try {
      const report = await submitTeamReport({
        taskId: task.id,
        taskTitle: task.title,
        team: task.team,
        sender: task.assignee,
        role: task.team,
        deliveryLog: checklist.map((item) => `${item.checked ? "[x]" : "[ ]"} ${item.label}`).join("\n"),
        notes: `Submitted from Team Operations CRM. Checklist ${checklist.filter((item) => item.checked).length}/${checklist.length} complete.`,
      });
      onSubmitted?.(task, report);
      setIsSubmitting(false);
      setIsSuccess(true);
      toast.success("Submitted to CEO AI Gateway");
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (error) {
      setIsSubmitting(false);
      toast.error(error.message || "Team report submission failed.");
    }
  };

  const handleSaveEdit = async () => {
    try {
      const updatedTask = { ...task, ...editForm };
      const savedTask = await updateCrmTask(updatedTask);
      onUpdated?.(savedTask || updatedTask);
      setIsEditing(false);
      toast.success("Task updated");
    } catch (error) {
      toast.error(error.message || "Failed to update task.");
    }
  };

  const persistTaskPatch = async (patch, successMessage) => {
    try {
      const nextTask = { ...task, ...patch };
      const savedTask = await updateCrmTask(nextTask);
      onUpdated?.(savedTask || nextTask);
      toast.success(successMessage);
      return savedTask || nextTask;
    } catch (error) {
      toast.error(error.message || "Task update failed.");
      return null;
    }
  };

  const handleDuplicateTask = async () => {
    try {
      const duplicate = {
        ...task,
        id: `T-${Date.now().toString().slice(-6)}`,
        title: `Copy of ${task.title}`,
        status: "todo",
        isCompleted: false,
        progress: Math.min(20, Number(task.progress || 0)),
        checklist: "0/7",
        comments: 0,
      };
      const savedTask = await createCrmTask(duplicate);
      onUpdated?.(savedTask || duplicate);
      toast.success("Task duplicated");
    } catch (error) {
      toast.error(error.message || "Task duplication failed.");
    }
  };

  const handleDeleteTask = async () => {
    try {
      await deleteCrmTask(task.id);
      onDeleted?.(task);
      toast.success("Task deleted");
      onClose();
    } catch (error) {
      toast.error(error.message || "Task deletion failed.");
    }
  };

  const handleCopyLink = async () => {
    const url = `${window.location.href.split("#")[0]}#crm-task-${encodeURIComponent(task.id)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Task link copied");
    } catch {
      setCommentDraft(url);
    }
  };

  const handleSaveTemplate = () => {
    setTemplateSaved(true);
  };

  const handleAddSubtask = () => {
    setExtraSubtasks((current) => [
      ...current,
      {
        id: `${task.id}-custom-${Date.now()}`,
        title: `Follow-up step ${current.length + 1}`,
        owner: task.assignee || "Operations",
        done: false,
      },
    ]);
  };

  const handleSaveComment = async () => {
    const cleanComment = commentDraft.trim();
    if (!cleanComment) return;
    const saved = await persistTaskPatch(
      { comments: Math.min(999, Number(task.comments || 0) + 1), lastComment: cleanComment },
      "Comment saved",
    );
    if (saved) setCommentDraft("");
  };

  const portalRoot = typeof document !== "undefined" ? document.body : null;
  if (!task || !portalRoot) return null;

  const completedCount = checklist.filter(c => c.checked).length;
  const totalCount = checklist.length;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const subtasks = [
    { id: `${task.id}-qa`, title: "Validate source data and owner", owner: task.assignee || "Operations", done: completionPercent >= 40 },
    { id: `${task.id}-evidence`, title: "Attach evidence or delivery note", owner: task.team || "Team", done: Number(task.attachments || 0) > 0 },
    { id: `${task.id}-gateway`, title: "Prepare CEO AI Gateway summary", owner: "AI Review", done: ["review", "submitted", "completed"].includes(task.status) },
    ...extraSubtasks,
  ];
  const files = Number(task.attachments || 0) > 0
    ? Array.from({ length: Number(task.attachments || 0) }, (_, index) => ({
        id: `${task.id}-file-${index}`,
        name: `${task.title.replace(/\s+/g, "_").slice(0, 24)}_${index + 1}.pdf`,
        type: index % 2 ? "Evidence" : "Source",
        status: "Linked",
      }))
    : [];
  const dependencies = [
    { id: "source", label: "Source evidence", value: files.length ? `${files.length} linked` : "Awaiting upload", tone: files.length ? "primary" : "warning" },
    { id: "owner", label: "Business owner", value: task.assignee || "Unassigned", tone: task.assignee ? "primary" : "warning" },
    { id: "gateway", label: "CEO AI Gateway", value: ["review", "submitted", "completed"].includes(task.status) ? "Ready" : "Not submitted", tone: ["review", "submitted", "completed"].includes(task.status) ? "primary" : "warning" },
  ];
  const aiReviewItems = [
    { label: "Completion confidence", value: `${Math.max(42, completionPercent)}%`, tone: completionPercent >= 70 ? "primary" : "warning" },
    { label: "SLA risk", value: task.priorityColor === "critical" ? "High" : task.priorityColor === "warning" ? "Medium" : "Low", tone: task.priorityColor === "critical" ? "critical" : task.priorityColor === "warning" ? "warning" : "primary" },
    { label: "Gateway action", value: ["submitted", "completed"].includes(task.status) ? "Already submitted" : "Submit for review", tone: ["submitted", "completed"].includes(task.status) ? "primary" : "warning" },
  ];

  return createPortal(
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 md:p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.98, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.98, opacity: 0, y: 10 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative flex flex-col bg-[#0E1116] w-full max-w-[1680px] w-[95vw] h-[95vh] rounded-[16px] border border-[#4EA1FF]/22 shadow-[0_24px_70px_rgba(0,0,0,0.68),0_0_70px_rgba(78,161,255,0.1)] overflow-hidden"
      >
        
        {/* HEADER */}
        <div className="flex items-center justify-between h-[68px] px-6 border-b border-[#28313C] shrink-0 bg-gradient-to-b from-[#141A22]/60 to-[#0E1116]">
          <div className="flex items-center gap-4 flex-1">
            <span className="text-muted-foreground font-mono text-[13px] tracking-wider shrink-0">{task.id}</span>
            {isEditing ? (
              <input 
                value={editForm.title}
                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
                className="text-lg font-bold text-white bg-[#141A22] border border-[#28313C] rounded-md px-3 py-1 w-full max-w-[400px] outline-none focus:border-[#4EA1FF]/50"
                autoFocus
              />
            ) : (
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 group cursor-pointer truncate max-w-[600px]" onClick={() => setIsEditing(true)}>
                <span className="truncate">{task.title}</span>
                <Settings className="size-3.5 opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity shrink-0" />
              </h1>
            )}
            
            <div className="flex items-center gap-2 ml-4 shrink-0">
              <span className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border border-[#28313C] bg-[#141A22] rounded-md">
                <Hash className="size-3" /> {task.team}
              </span>
              <span className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest border rounded-md",
                task.priorityColor === "critical" ? "border-critical/30 bg-critical/10 text-critical" : 
                task.priorityColor === "warning" ? "border-warning/30 bg-warning/10 text-warning" : 
                "border-muted-foreground/30 bg-muted-foreground/10 text-muted-foreground"
              )}>
                {task.priority}
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest border border-[#4EA1FF]/30 bg-[#4EA1FF]/10 text-[#4EA1FF] rounded-md">
                {task.status.replace('-', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-4">
            <div className="flex items-center border border-[#28313C] rounded-lg overflow-hidden bg-[#141A22]/50">
              <button type="button" disabled={!hasPrevious} onClick={() => onNavigateRelative?.(-1)} className="flex items-center justify-center px-3 py-1.5 text-muted-foreground hover:text-white hover:bg-[#28313C] transition-colors border-r border-[#28313C] gap-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40">
                <ChevronLeft className="size-3.5" /> Prev
              </button>
              <button type="button" disabled={!hasNext} onClick={() => onNavigateRelative?.(1)} className="flex items-center justify-center px-3 py-1.5 text-muted-foreground hover:text-white hover:bg-[#28313C] transition-colors gap-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40">
                Next <ChevronRight className="size-3.5" />
              </button>
            </div>
            
            <div className="w-px h-5 bg-[#28313C] mx-1" />

            <button type="button" onClick={handleCopyLink} className="flex items-center justify-center size-8 text-muted-foreground hover:text-white rounded-lg hover:bg-[#141A22] transition-colors" title="Copy link">
              <LinkIcon className="size-4" />
            </button>
            <button type="button" onClick={() => setActiveMainTab("Overview")} className="flex items-center justify-center size-8 text-muted-foreground hover:text-white rounded-lg hover:bg-[#141A22] transition-colors" title="Full page">
              <Maximize2 className="size-4" />
            </button>
            <button onClick={onClose} className="flex items-center justify-center size-8 text-muted-foreground hover:text-white rounded-lg hover:bg-critical/20 hover:text-critical transition-colors" title="Close">
              <X className="size-4" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {deleteConfirmOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex items-center justify-center bg-black/72 p-6 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.96, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.96, y: 10 }}
                className="w-full max-w-[460px] rounded-2xl border border-critical/30 bg-[#0E1116] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.6)]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-critical/30 bg-critical/10 text-critical">
                    <AlertTriangle className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-white">Delete task?</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      This removes the CRM task from the workspace board. Reports already submitted to CEO AI Gateway remain in audit history.
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" onClick={() => setDeleteConfirmOpen(false)} className="rounded-lg border border-[#28313C] bg-[#0E1116] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#141A22]">
                    Cancel
                  </button>
                  <button type="button" onClick={handleDeleteTask} className="rounded-lg border border-critical/40 bg-critical/15 px-4 py-2 text-xs font-bold text-critical transition-colors hover:bg-critical hover:text-white">
                    Delete task
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BODY */}
        <div className="flex flex-1 min-h-0">
          
          {/* LEFT WORKSPACE (60%) */}
          <div className="flex flex-col w-[60%] border-r border-[#28313C] bg-[#080A0E] overflow-y-auto scrollbar-thin scrollbar-thumb-[#28313C] scrollbar-track-transparent">
            {/* Tabs */}
            <div className="flex items-center gap-6 px-8 border-b border-[#28313C] shrink-0 sticky top-0 bg-[#080A0E]/92 backdrop-blur z-10">
              {["Overview", "Checklist", "Subtasks", "Files", "Dependencies", "AI Review"].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveMainTab(tab)}
                  className={cn(
                    "py-4 text-xs font-bold transition-colors relative",
                    activeMainTab === tab ? "text-white" : "text-muted-foreground hover:text-white"
                  )}
                >
                  {tab}
                  {tab === "Files" && <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-[#28313C] text-[9px]">{task.attachments || 0}</span>}
                  {activeMainTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4EA1FF] rounded-t-full" />}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-8 flex flex-col gap-8 pb-16">
              
              {(activeMainTab === "Overview" || activeMainTab === "Description") && (
                <>
                  {/* Description */}
                  <div className="flex flex-col gap-3 group/desc">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                      Task Description
                      <button className="text-muted-foreground hover:text-white opacity-0 group-hover/desc:opacity-100 transition-opacity"><Settings className="size-3.5" /></button>
                    </h3>
                    {isEditing ? (
                      <textarea 
                        value={editForm.description}
                        onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                        className="w-full min-h-[100px] text-sm text-foreground bg-[#141A22] border border-[#28313C] rounded-lg p-3 outline-none focus:border-[#4EA1FF]/50 resize-y"
                      />
                    ) : (
                      <p className="text-sm text-foreground leading-relaxed">
                        {task.description || "Record and reconcile daily supply intake of 50kg mushrooms from Farm Fresh Co. Ensure quantity, quality, and documentation are accurate. Verify all regulatory conditions are met before accepting."}
                      </p>
                    )}
                  </div>

                  {/* AI Summary */}
                  <div className="flex flex-col gap-3 rounded-xl border border-[#4EA1FF]/20 bg-[#4EA1FF]/5 p-5">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#4EA1FF] flex items-center gap-1.5">
                      <Sparkles className="size-3.5" /> AI Summary & Insights
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-white/90 leading-relaxed pr-8">
                        Task is proceeding on schedule. Found a minor SLA risk due to delivery delay from GreenFarm earlier today. Recommended action: expedite warehouse QA upon arrival.
                      </p>
                      <button className="px-3 py-1.5 bg-[#141A22] hover:bg-[#28313C] border border-[#28313C] rounded-lg text-xs font-bold text-white transition-colors shrink-0 shadow-sm">
                        Details
                      </button>
                    </div>
                  </div>

                  {/* Expected Result */}
                  <div className="flex flex-col gap-3">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Expected Outcome</h3>
                    <div className="flex items-center gap-3 p-4 rounded-xl border border-[#28313C] bg-[#141A22]/30">
                      <CheckSquare className="size-5 text-emerald-500 shrink-0" />
                      <p className="text-sm text-white">Confirmed intake of 50kg mushrooms without critical quality or weight deviations.</p>
                    </div>
                  </div>
                </>
              )}

              {(activeMainTab === "Overview" || activeMainTab === "Checklist") && (
                <div className="flex flex-col gap-4 mt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Checklist</h3>
                    <span className="text-xs text-muted-foreground font-medium">{completedCount} of {totalCount} completed</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-[#28313C] h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-[#4EA1FF]"
                      initial={{ width: 0 }}
                      animate={{ width: `${completionPercent}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  <div className="flex flex-col mt-2 gap-1">
                    {checklist.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-[#28313C] hover:bg-[#141A22]/40 transition-colors group cursor-pointer" onClick={() => handleToggleCheck(item.id)}>
                        <button 
                          className={cn(
                            "flex size-5 shrink-0 items-center justify-center rounded border transition-colors",
                            item.checked ? "bg-[#4EA1FF] border-[#4EA1FF] text-white" : "border-[#28313C] group-hover:border-[#4EA1FF]"
                          )}
                        >
                          {item.checked && <Check className="size-3.5" />}
                        </button>
                        <span className={cn("text-sm flex-1 transition-colors", item.checked ? "text-muted-foreground line-through" : "text-white")}>
                          {item.label}
                        </span>
                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] text-muted-foreground">{item.date}</span>
                          <div className="flex items-center gap-1.5">
                            <Image src={`https://api.dicebear.com/7.x/notionists/png?seed=${item.user}`} alt="" width={16} height={16} className="rounded-full ring-1 ring-[#28313C]" />
                            <span className="text-xs text-muted-foreground font-medium w-16 truncate">{item.user}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={handleAddChecklistItem} className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-white p-2 mt-2 transition-colors w-fit rounded-lg hover:bg-[#141A22]">
                      <Plus className="size-3.5" /> Add checklist item
                    </button>
                  </div>
                </div>
              )}

              {activeMainTab === "Subtasks" && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Subtasks</h3>
                    <button type="button" onClick={handleAddSubtask} className="flex items-center gap-1.5 rounded-lg border border-[#28313C] bg-[#141A22] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#28313C]">
                      <Plus className="size-3.5" /> Add subtask
                    </button>
                  </div>
                  <div className="grid gap-3">
                    {subtasks.map((subtask) => (
                      <button key={subtask.id} type="button" onClick={() => setActiveMainTab("Checklist")} className="flex items-center justify-between gap-4 rounded-xl border border-[#28313C] bg-[#141A22]/35 p-4 text-left transition-colors hover:border-[#4EA1FF]/35 hover:bg-[#141A22]/70">
                        <span className="flex min-w-0 items-center gap-3">
                          <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full border", subtask.done ? "border-primary/30 bg-primary/15 text-primary" : "border-[#28313C] bg-[#0E1116] text-muted-foreground")}>
                            {subtask.done ? <Check className="size-3.5" /> : <Clock className="size-3.5" />}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-bold text-white">{subtask.title}</span>
                            <span className="mt-1 block text-[11px] text-muted-foreground">Owner: {subtask.owner}</span>
                          </span>
                        </span>
                        <span className={cn("rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest", subtask.done ? "border-primary/30 bg-primary/10 text-primary" : "border-warning/30 bg-warning/10 text-warning")}>
                          {subtask.done ? "Done" : "Open"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeMainTab === "Files" && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Files and evidence</h3>
                    <button type="button" onClick={() => onNavigate?.("data", { source: "crm-task", taskId: task.id })} className="flex items-center gap-1.5 rounded-lg border border-[#28313C] bg-[#141A22] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#28313C]">
                      <Paperclip className="size-3.5" /> Attach
                    </button>
                  </div>
                  {files.length > 0 ? (
                    <div className="grid gap-3">
                      {files.map((file) => (
                        <button key={file.id} type="button" onClick={() => onNavigate?.("data", { evidenceId: file.id, source: "crm-task" })} className="flex items-center justify-between gap-4 rounded-xl border border-[#28313C] bg-[#141A22]/35 p-4 text-left transition-colors hover:border-[#4EA1FF]/35 hover:bg-[#141A22]/70">
                          <span className="flex min-w-0 items-center gap-3">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[#7CC7FF]/25 bg-[#7CC7FF]/10 text-[#7CC7FF]">
                              <FileText className="size-4" />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-bold text-white">{file.name}</span>
                              <span className="mt-1 block text-[11px] text-muted-foreground">{file.type} evidence</span>
                            </span>
                          </span>
                          <span className="rounded border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">{file.status}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#28313C] bg-[#141A22]/25 p-6">
                      <div className="flex items-start gap-3">
                        <Paperclip className="mt-0.5 size-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-bold text-white">No files attached yet</p>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">The task is still usable. Attach source evidence from Data Intake before final approval if this action affects money, compliance, or inventory.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeMainTab === "Dependencies" && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Dependencies</h3>
                  <div className="grid gap-3">
                    {dependencies.map((dependency) => (
                      <div key={dependency.id} className="flex items-center justify-between gap-4 rounded-xl border border-[#28313C] bg-[#141A22]/35 p-4">
                        <span className="flex min-w-0 items-center gap-3">
                          <LinkIcon className="size-4 shrink-0 text-muted-foreground" />
                          <span className="truncate text-sm font-bold text-white">{dependency.label}</span>
                        </span>
                        <span className={cn("rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest", dependency.tone === "primary" ? "border-primary/30 bg-primary/10 text-primary" : "border-warning/30 bg-warning/10 text-warning")}>
                          {dependency.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeMainTab === "AI Review" && (
                <div className="flex flex-col gap-4">
                  <div className="rounded-xl border border-[#4EA1FF]/20 bg-[#4EA1FF]/5 p-5">
                    <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#4EA1FF]">
                      <Sparkles className="size-3.5" /> AI Review
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/90">
                      GENIUS can prepare this task for CEO AI Gateway, but execution remains approval-first. The review checks evidence coverage, SLA risk, and whether a human owner is assigned.
                    </p>
                  </div>
                  <div className="grid gap-3">
                    {aiReviewItems.map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-4 rounded-xl border border-[#28313C] bg-[#141A22]/35 p-4">
                        <span className="text-sm font-bold text-white">{item.label}</span>
                        <span className={cn(
                          "rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest",
                          item.tone === "critical" ? "border-critical/30 bg-critical/10 text-critical" : item.tone === "warning" ? "border-warning/30 bg-warning/10 text-warning" : "border-primary/30 bg-primary/10 text-primary"
                        )}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={handleSubmit} disabled={isSubmitting || isSuccess} className="flex w-fit items-center gap-2 rounded-lg bg-[#4EA1FF] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#4EA1FF] disabled:opacity-60">
                    {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Submit to CEO AI Gateway
                  </button>
                </div>
              )}
              
            </div>
          </div>

          {/* RIGHT INFO PANEL (40%) */}
          <div className="flex flex-col w-[40%] bg-[#0E1116]">
            {/* Properties */}
            <div className="p-8 border-b border-[#28313C] flex flex-col gap-5 shrink-0">
              <div className="grid grid-cols-[130px_1fr] items-center gap-y-4">
                
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-2"><User className="size-4"/> Assignee</span>
                <div className="flex items-center gap-2 hover:bg-[#141A22] p-1.5 -ml-1.5 rounded cursor-pointer w-fit transition-colors">
                  <Image src={`https://api.dicebear.com/7.x/notionists/png?seed=${task.assignee}`} alt="" width={24} height={24} className="rounded-full ring-1 ring-[#28313C]" />
                  <span className="text-[13px] font-bold text-white">{task.assignee}</span>
                </div>

                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-2"><Clock className="size-4"/> Due Date</span>
                <div className="flex items-center gap-2 hover:bg-[#141A22] p-1.5 -ml-1.5 rounded cursor-pointer w-fit transition-colors">
                  <span className={cn("text-[13px] font-bold", task.priorityColor === "critical" ? "text-critical" : "text-white")}>
                    21 May, 17:00
                  </span>
                  {task.priorityColor === "critical" && <span className="text-[11px] font-bold text-critical/80 ml-1">Overdue</span>}
                </div>

                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-2"><AlertCircle className="size-4"/> SLA</span>
                <div className="flex items-center gap-2 hover:bg-[#141A22] p-1.5 -ml-1.5 rounded cursor-pointer w-fit transition-colors">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-warning/10 text-warning text-[11px] font-bold uppercase tracking-widest">
                    At risk
                  </span>
                  <span className="text-[13px] text-muted-foreground">— 2h 30m</span>
                </div>

                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-2"><Tag className="size-4"/> Tags</span>
                <div className="flex items-center gap-2 hover:bg-[#141A22] p-1.5 -ml-1.5 rounded cursor-pointer w-fit transition-colors">
                  <span className="px-2 py-1 rounded-md bg-[#28313C] text-muted-foreground text-[11px] font-bold">supply</span>
                  <span className="px-2 py-1 rounded-md bg-[#28313C] text-muted-foreground text-[11px] font-bold">warehouse</span>
                </div>

              </div>
            </div>

            {/* Activity Tabs */}
            <div className="flex items-center gap-8 px-8 border-b border-[#28313C] shrink-0 bg-[#0E1116]">
              {["Activity", "Comments", "History"].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveRightTab(tab)}
                  className={cn(
                    "py-4 text-xs font-bold transition-colors relative uppercase tracking-widest",
                    activeRightTab === tab ? "text-white" : "text-muted-foreground hover:text-white"
                  )}
                >
                  {tab} {tab === "Comments" && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#28313C] text-[10px]">{task.comments || 0}</span>}
                  {activeRightTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4EA1FF] rounded-t-full" />}
                </button>
              ))}
            </div>

            {/* Timeline Feed */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#28313C] scrollbar-track-transparent p-8 flex flex-col gap-8">
              {activeRightTab === "Comments" && (
                <div className="rounded-xl border border-[#28313C] bg-[#141A22]/45 p-4">
                  <p className="text-sm font-bold text-white">{task.comments || 0} comments</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">Use the composer below to add operational context, blockers, or evidence notes. Comments are counted against the task and saved when you submit a draft.</p>
                </div>
              )}
              {activeRightTab === "History" && (
                <div className="flex flex-col gap-3">
                  {["Task opened in CRM", `Checklist ${completedCount}/${totalCount}`, `Current status: ${task.status.replace("-", " ")}`].map((event, index) => (
                    <div key={event} className="flex items-center gap-3 rounded-xl border border-[#28313C] bg-[#141A22]/45 p-3">
                      <Clock className="size-4 text-muted-foreground" />
                      <span className="text-[13px] font-medium text-white">{event}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground">{index === 0 ? "Now" : "Today"}</span>
                    </div>
                  ))}
                </div>
              )}
              {/* Activity Item */}
              <div className={cn("flex gap-4 relative", activeRightTab !== "Activity" && "hidden")}>
                <div className="absolute left-3.5 top-8 bottom-[-32px] w-px bg-[#28313C]" />
                <Image src={`https://api.dicebear.com/7.x/notionists/png?seed=${task.assignee}`} alt="" width={28} height={28} className="rounded-full ring-2 ring-[#0E1116] shrink-0 z-10 bg-[#28313C]" />
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-white">{task.assignee}</span>
                    <span className="text-[11px] text-muted-foreground">20 May, 12:01</span>
                  </div>
                  <span className="text-[13px] text-muted-foreground">Task created</span>
                </div>
              </div>

              <div className={cn("flex gap-4 relative", activeRightTab !== "Activity" && "hidden")}>
                <div className="absolute left-3.5 top-8 bottom-[-32px] w-px bg-[#28313C]" />
                <div className="size-7 rounded-full bg-[#4EA1FF]/20 text-[#4EA1FF] flex items-center justify-center ring-2 ring-[#0E1116] shrink-0 z-10">
                  <Sparkles className="size-4" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-[#4EA1FF]">AI Assistant</span>
                    <span className="text-[11px] text-muted-foreground">20 May, 12:20</span>
                  </div>
                  <div className="mt-1 p-3 rounded-lg border border-[#4EA1FF]/20 bg-[#4EA1FF]/5 text-[13px] text-white/90">
                    Detected SLA risk due to GreenFarm supply delay.
                  </div>
                </div>
              </div>

              <div className={cn("flex gap-4 relative", activeRightTab !== "Activity" && "hidden")}>
                <Image src={`https://api.dicebear.com/7.x/notionists/png?seed=Ken`} alt="" width={28} height={28} className="rounded-full ring-2 ring-[#0E1116] shrink-0 z-10 bg-[#28313C]" />
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-white">Ken R.</span>
                    <span className="text-[11px] text-muted-foreground">20 May, 12:15</span>
                  </div>
                  <span className="text-[13px] text-muted-foreground">Status changed: Todo to In progress</span>
                </div>
              </div>
            </div>

            {/* Comment Composer */}
            <div className="p-6 border-t border-[#28313C] shrink-0 bg-[#0E1116]">
              <div className="flex flex-col rounded-xl border border-[#28313C] bg-[#141A22] focus-within:border-[#4EA1FF]/50 focus-within:ring-1 focus-within:ring-[#4EA1FF]/50 transition-all shadow-inner">
                <textarea 
                  placeholder="Write a comment..." 
                  value={commentDraft}
                  onChange={(event) => setCommentDraft(event.target.value)}
                  className="w-full bg-transparent border-none outline-none resize-none p-4 text-[13px] text-white placeholder:text-muted-foreground min-h-[80px]"
                />
                <div className="flex items-center justify-between p-3 pt-0">
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setActiveMainTab("Files")} className="p-2 text-muted-foreground hover:text-white rounded-lg hover:bg-[#28313C] transition-colors"><Paperclip className="size-4"/></button>
                    <button type="button" onClick={() => setCommentDraft((value) => `${value}${value ? " " : ""}@${task.assignee || "owner"} `)} className="p-2 text-muted-foreground hover:text-white rounded-lg hover:bg-[#28313C] transition-colors font-bold text-sm">@</button>
                    <button type="button" onClick={() => setActiveMainTab("AI Review")} className="p-2 text-muted-foreground hover:text-[#4EA1FF] rounded-lg hover:bg-[#28313C] transition-colors"><Sparkles className="size-4"/></button>
                  </div>
                  <button type="button" disabled={!commentDraft.trim()} onClick={handleSaveComment} className="px-4 py-1.5 bg-[#4EA1FF] text-white rounded-lg hover:bg-[#4EA1FF] transition-colors shadow-lg shadow-[rgba(78,161,255,0.20)] font-semibold text-[13px] disabled:cursor-not-allowed disabled:opacity-45">
                    <Send className="size-4"/>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="flex items-center justify-between h-[72px] px-8 border-t border-[#28313C] shrink-0 bg-[#0E1116]">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setDeleteConfirmOpen(true)} className="px-4 py-2 text-xs font-bold text-critical border border-critical/30 hover:bg-critical/10 rounded-lg transition-colors">
              Delete
            </button>
            <button type="button" onClick={handleDuplicateTask} className="px-4 py-2 text-xs font-bold text-white border border-[#28313C] hover:bg-[#141A22] rounded-lg transition-colors">
              Duplicate
            </button>
            <button type="button" onClick={handleSaveTemplate} className={cn("px-4 py-2 text-xs font-bold border rounded-lg transition-colors", templateSaved ? "border-primary/30 bg-primary/10 text-primary" : "text-white border-[#28313C] hover:bg-[#141A22]")}>
              {templateSaved ? "Template saved" : "Save as template"}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => persistTaskPatch({ ...editForm, comments: Math.min(999, Number(task.comments || 0) + 1) }, "Draft saved")} className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-white hover:bg-[#141A22] rounded-lg transition-colors">
              Save draft
            </button>
            <button type="button" onClick={() => persistTaskPatch({ priority: "High", priorityColor: "critical", tag: "SLA", status: task.status === "completed" ? "review" : task.status }, "Task marked blocked")} className="px-4 py-2 text-xs font-bold text-warning border border-[#28313C] hover:bg-[#141A22] rounded-lg transition-colors">
              Mark blocked
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting || isSuccess}
              className="px-4 py-2 text-xs font-bold text-white border border-[#28313C] bg-[#141A22] hover:bg-[#28313C] rounded-lg transition-colors flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Submit for review"}
            </button>
            <button type="button" onClick={() => persistTaskPatch({ status: "completed", progress: 100, checklist: `${checklist.length}/${checklist.length}`, isCompleted: true }, "Task completed")} className="px-6 py-2 text-xs font-bold text-white bg-[#4EA1FF] hover:bg-[#4EA1FF] rounded-lg transition-colors shadow-[0_0_15px_rgba(78,161,255,0.3)]">
              Complete task
            </button>
          </div>
        </div>

      </motion.div>
    </motion.div>,
    portalRoot
  );
}
