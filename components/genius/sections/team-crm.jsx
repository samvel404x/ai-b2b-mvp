"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useWorkspace } from "../workspace-context";
import { sessionIdentityLabel } from "../identity-display";
import { CrmHeader } from "./team-crm/crm-header";
import { CrmMetrics } from "./team-crm/crm-metrics";
import { KanbanBoard } from "./team-crm/kanban-board";
import { TaskPanel } from "./team-crm/task-panel";
import { CrmBottomWidgets } from "./team-crm/crm-bottom-widgets";
import {
  CRM_METRICS,
  INITIAL_TASKS,
  TEAM_WORKLOAD,
  SLA_ALERTS,
  RECENT_ACTIVITY,
  REVIEW_QUEUE
} from "./team-crm/data";
import { AnimatePresence } from "framer-motion";

function priorityColor(priority) {
  if (/high|urgent|critical/i.test(priority || "")) return "critical";
  if (/medium|review/i.test(priority || "")) return "warning";
  return "muted";
}

function normalizeTaskStatus(status) {
  const value = String(status || "todo").toLowerCase();
  if (["backlog", "todo", "in-progress", "review", "submitted", "completed"].includes(value)) return value;
  if (value === "done" || value === "approved") return "submitted";
  if (value === "pending ai review" || value === "ready") return "review";
  return "todo";
}

function dateLabel(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Today";
  return date.toLocaleDateString([], { month: "short", day: "2-digit" });
}

function weekRangeLabel() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);
  return `${dateLabel(start)} - ${dateLabel(end)}`;
}

function sessionAssignee(session) {
  return sessionIdentityLabel(session, "You");
}

function normalizePersistedTask(task, index = 0) {
  const status = normalizeTaskStatus(task.status);
  const priority = task.priority || (task.urgent ? "High" : "Medium");
  return {
    id: task.id || task.reportId || `OPS-${index + 1}`,
    reportId: task.reportId || null,
    title: task.title || "Submitted operations report",
    team: task.team || task.role || "Team Operations",
    priority,
    priorityColor: priorityColor(priority),
    assignee: task.assignee || task.sender || "Operations Team",
    date: dateLabel(task.submittedAt || task.updatedAt || task.createdAt),
    checklist: status === "submitted" ? "7/7" : "4/7",
    attachments: task.attachments || 0,
    comments: task.comments || 1,
    tag: "AI",
    progress: status === "submitted" ? 100 : 67,
    status,
    isCompleted: status === "completed",
    persisted: true,
  };
}

function mergeTasks(currentTasks = [], persistedTasks = []) {
  const currentById = new Map(currentTasks.filter((task) => task?.id).map((task) => [task.id, task]));
  const persistedIds = new Set(persistedTasks.filter((task) => task?.id).map((task) => task.id));
  const mergedPersisted = persistedTasks
    .filter((task) => task?.id)
    .map((task) => ({ ...task, ...(currentById.get(task.id) || {}) }));
  const localOnly = currentTasks.filter((task) => task?.id && !persistedIds.has(task.id));
  return [...mergedPersisted, ...localOnly];
}

function buildMetrics(tasks = []) {
  const open = tasks.filter((task) => !["submitted", "completed"].includes(task.status)).length;
  const inProgress = tasks.filter((task) => task.status === "in-progress").length;
  const waiting = tasks.filter((task) => task.status === "review").length;
  const submitted = tasks.filter((task) => task.status === "submitted").length;
  const blocked = tasks.filter((task) => task.priorityColor === "critical" && !["submitted", "completed"].includes(task.status)).length;
  const completed = tasks.filter((task) => task.status === "completed").length;
  const sla = tasks.length ? Math.max(58, Math.round(100 - (blocked / tasks.length) * 42)) : 100;
  const capacity = tasks.length ? Math.min(99, Math.round((open / Math.max(tasks.length, 1)) * 100)) : 0;
  const throughput = submitted + completed;

  return [
    { id: "open", title: "Open Tasks", value: String(open), change: `${submitted} submitted`, trend: "up", color: "primary", sparkline: [Math.max(1, open - 5), open - 2, open, open + 1, open] },
    { id: "progress", title: "In Progress", value: String(inProgress), change: `${waiting} in review`, trend: "up", color: "primary", sparkline: [1, Math.max(1, inProgress - 1), inProgress, inProgress + 1, inProgress] },
    { id: "waiting", title: "Waiting Review", value: String(waiting), change: `${submitted} to Gateway`, trend: waiting ? "down" : "up", color: "warning", sparkline: [waiting + 2, waiting + 1, waiting, waiting, Math.max(0, waiting - 1)] },
    { id: "submitted", title: "Submitted Today", value: String(submitted), target: "15", type: "circular", progress: Math.min(100, submitted * 18), color: "primary" },
    { id: "blocked", title: "Blocked", value: String(blocked), change: `${blocked} high priority`, trend: "down", color: blocked ? "critical" : "primary", sparkline: [blocked + 2, blocked + 1, blocked, blocked, Math.max(0, blocked - 1)] },
    { id: "sla", title: "SLA Health", value: `${sla}%`, change: `${blocked} at risk`, trend: blocked ? "down" : "up", color: blocked ? "warning" : "primary", sparkline: [sla - 6, sla - 3, sla - 2, sla, sla] },
    { id: "capacity", title: "Team Capacity", value: `${capacity}%`, subtitle: "Current board", color: "primary", sparkline: [capacity - 8, capacity - 4, capacity, capacity + 2, capacity] },
    { id: "throughput", title: "Throughput", value: String(throughput), subtitle: "Submitted + completed", type: "bar", data: [open, inProgress, waiting, submitted, completed, throughput, tasks.length] },
  ];
}

function buildTeamWorkload(tasks = []) {
  const counts = new Map();
  tasks.forEach((task) => counts.set(task.assignee, (counts.get(task.assignee) || 0) + 1));
  return Array.from(counts.entries()).slice(0, 5).map(([name, load]) => ({
    name,
    load,
    max: Math.max(8, load + 4),
    isMaxed: load >= 8,
  }));
}

function buildSlaAlerts(tasks = []) {
  return tasks
    .filter((task) => task.priorityColor === "critical" && !["submitted", "completed"].includes(task.status))
    .slice(0, 4)
    .map((task) => ({
      title: task.title,
      status: `${task.status.replace("-", " ")} - ${task.date || "Today"}`,
      priority: task.priority || "High",
    }));
}

function buildRecentActivity(tasks = []) {
  return tasks.slice(0, 4).map((task) => ({
    user: task.assignee,
    action: task.status === "submitted" ? "submitted" : task.status === "completed" ? "completed" : "updated",
    target: task.title,
    time: task.submittedAt ? dateLabel(task.submittedAt) : "Just now",
  }));
}

function buildReviewQueue(tasks = [], gatewayReports = []) {
  const reportItems = gatewayReports.slice(0, 3).map((report) => ({
    title: report.title,
    team: report.role || "CEO AI Gateway",
    date: report.status || "Pending AI Review",
    priority: report.urgent ? "High" : "Medium",
  }));
  const taskItems = tasks
    .filter((task) => ["review", "submitted"].includes(task.status))
    .slice(0, 4)
    .map((task) => ({
      title: task.title,
      team: task.team,
      date: task.status === "submitted" ? "Submitted to Gateway" : "Waiting review",
      priority: task.priority || "Medium",
    }));
  return mergeTasks(reportItems.map((item, index) => ({ ...item, id: `report-${index}` })), taskItems.map((item, index) => ({ ...item, id: `task-${index}` }))).map(({ id, ...item }) => item);
}

export default function TeamCrm({ focusContext, onNavigate }) {
  const { operations, session, busy, createCrmTask, updateCrmTask } = useWorkspace();
  const [activeTab, setActiveTab] = useState("board");
  const [localTasks, setLocalTasks] = useState(INITIAL_TASKS);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(
    focusContext?.taskId || focusContext?.crmTaskId || null
  );
  const persistedTasks = useMemo(
    () => (operations?.crmTasks || []).map(normalizePersistedTask),
    [operations?.crmTasks],
  );
  const tasks = useMemo(() => mergeTasks(localTasks, persistedTasks), [localTasks, persistedTasks]);
  const myAssignee = sessionAssignee(session);
  const myTasks = useMemo(() => tasks.filter((task) => (
    task.assignee === myAssignee || task.assignee === "You" || task.assignee === "Sarah M."
  )), [myAssignee, tasks]);

  const visibleTasks = useMemo(() => {
    if (activeTab === "my_tasks") return myTasks;
    if (activeTab === "submissions") return tasks.filter((task) => ["submitted", "completed"].includes(task.status));
    return tasks;
  }, [activeTab, myTasks, tasks]);

  const metrics = useMemo(() => buildMetrics(tasks), [tasks]);
  const teamWorkload = useMemo(() => buildTeamWorkload(tasks), [tasks]);
  const slaAlerts = useMemo(() => buildSlaAlerts(tasks), [tasks]);
  const recentActivity = useMemo(() => buildRecentActivity(tasks), [tasks]);
  const reviewQueue = useMemo(
    () => buildReviewQueue(tasks, operations?.gatewayReports || []),
    [operations?.gatewayReports, tasks],
  );

  const handleCreateTask = async (status = "todo") => {
    const id = `T-${Date.now().toString().slice(-6)}`;
    const task = {
      id,
      title: status === "review" ? "Review submitted operations update" : "New operations task",
      team: "Operations",
      priority: status === "review" ? "High" : "Medium",
      priorityColor: status === "review" ? "critical" : "warning",
      assignee: myAssignee,
      date: dateLabel(),
      checklist: "0/5",
      attachments: 0,
      comments: 0,
      status,
      progress: status === "in-progress" ? 10 : undefined,
      tag: status === "review" ? "AI" : "SLA",
    };

    try {
      const savedTask = await createCrmTask(task);
      const committedTask = savedTask ? { ...task, ...savedTask, persisted: true } : task;
      setLocalTasks((current) => [
        committedTask,
        ...current.filter((item) => item.id !== task.id && item.id !== committedTask.id),
      ]);
      setSelectedTaskId(committedTask.id);
      setActiveTab("board");
      toast.success("Task added to Team Operations CRM");
    } catch (error) {
      toast.error(error.message || "Task could not be created.");
      throw error;
    }
  };

  const handleColumnAction = (status) => {
    setActiveTab("analytics");
  };

  const handleTaskSubmitted = (task, report) => {
    const submittedTask = { ...task, status: "submitted", reportId: report?.id || task.reportId, progress: 100, checklist: "7/7", tag: "AI", isCompleted: false };
    setLocalTasks((current) => (
      current.some((item) => item.id === task.id)
        ? current.map((item) => (item.id === task.id ? submittedTask : item))
        : [submittedTask, ...current]
    ));
    setSelectedTaskId(task.id);
  };

  const handleTaskUpdated = (task) => {
    if (!task?.id) return;
    setLocalTasks((current) => (
      current.some((item) => item.id === task.id)
        ? current.map((item) => (item.id === task.id ? { ...item, ...task, persisted: true } : item))
        : [{ ...task, persisted: true }, ...current]
    ));
    setSelectedTaskId(task.id);
  };

  const handleTaskDeleted = (task) => {
    if (!task?.id) return;
    setLocalTasks((current) => current.filter((item) => item.id !== task.id));
    setSelectedTaskId(null);
  };

  // Drag and drop handlers
  const handleDragStart = (e, id) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
    // Micro-delay for smooth drag visual
    setTimeout(() => {
      if (e.target) e.target.style.opacity = '0.4';
    }, 0);
  };

  const handleDragEnd = (e) => {
    if (e.target) e.target.style.opacity = '1';
    setDraggedTaskId(null);
  };

  const handleDrop = async (e, status) => {
    e.preventDefault();
    if (draggedTaskId) {
      const draggedTask = tasks.find((task) => task.id === draggedTaskId);
      if (!draggedTask) return;
      const nextTask = {
        ...draggedTask,
        status,
        isCompleted: status === "completed",
        progress: status === "completed" || status === "submitted" ? 100 : draggedTask.progress,
      };
      setLocalTasks(prev => (
        prev.some((task) => task.id === draggedTaskId)
          ? prev.map(task => (task.id === draggedTaskId ? nextTask : task))
          : [nextTask, ...prev]
      ));
      try {
        const savedTask = await updateCrmTask(nextTask);
        handleTaskUpdated(savedTask || nextTask);
      } catch (error) {
        toast.error(error.message || "Task status could not be saved.");
      }
    }
  };

  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : null;
  const selectedTaskIndex = selectedTaskId ? visibleTasks.findIndex((task) => task.id === selectedTaskId) : -1;
  const handleNavigateRelativeTask = (direction) => {
    if (selectedTaskIndex < 0) return;
    const nextIndex = selectedTaskIndex + direction;
    if (nextIndex < 0 || nextIndex >= visibleTasks.length) return;
    setSelectedTaskId(visibleTasks[nextIndex].id);
  };

  return (
    <div className="flex h-full flex-col w-full bg-[#080A0E] overflow-hidden text-white font-sans">

      {/* 1. Header Navigation */}
      <CrmHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        myTaskCount={myTasks.length}
        dateRangeLabel={weekRangeLabel()}
        busy={busy}
        onCreateTask={() => handleCreateTask("todo")}
        onOpenFilters={() => {
          setActiveTab("my_tasks");
        }}
        onOpenAutomations={() => {
          setActiveTab("activity");
        }}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex flex-col flex-1 min-w-0 overflow-y-auto scrollbar-none relative">

          {/* 2. Top Metrics Row */}
          <CrmMetrics metrics={metrics.length ? metrics : CRM_METRICS} />

          {/* 3. Main Board Area (Kanban) */}
          <KanbanBoard
            tasks={visibleTasks}
            draggedTaskId={draggedTaskId}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            selectedTaskId={selectedTaskId}
            onSelectTask={setSelectedTaskId}
            onAddTask={handleCreateTask}
            onColumnAction={handleColumnAction}
          />

          {/* 4. Bottom Analytics Widgets */}
          <div className="mt-4">
            <CrmBottomWidgets
              teamWorkload={teamWorkload.length ? teamWorkload : TEAM_WORKLOAD}
              slaAlerts={slaAlerts.length ? slaAlerts : SLA_ALERTS}
              recentActivity={recentActivity.length ? recentActivity : RECENT_ACTIVITY}
              reviewQueue={reviewQueue.length ? reviewQueue : REVIEW_QUEUE}
            />
          </div>

        </div>

        {/* 5. Right Slide-over Task Panel */}
        <AnimatePresence>
          {selectedTask && (
            <TaskPanel
              key={selectedTask.id}
              task={selectedTask}
              onClose={() => setSelectedTaskId(null)}
              onSubmitted={handleTaskSubmitted}
              onUpdated={handleTaskUpdated}
              onDeleted={handleTaskDeleted}
              onNavigate={onNavigate}
              onNavigateRelative={handleNavigateRelativeTask}
              hasPrevious={selectedTaskIndex > 0}
              hasNext={selectedTaskIndex >= 0 && selectedTaskIndex < visibleTasks.length - 1}
            />
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
