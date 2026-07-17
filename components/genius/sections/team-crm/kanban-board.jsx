"use client";

import { cn } from "@/lib/utils";
import { Plus, MoreHorizontal, Calendar, MessageSquare, Paperclip, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const COLUMNS = [
  { id: "backlog", label: "Backlog" },
  { id: "todo", label: "To Do" },
  { id: "in-progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "submitted", label: "Submitted" },
  { id: "completed", label: "Completed" },
];

export function KanbanBoard({ 
  tasks = [], 
  draggedTaskId, 
  onDragStart, 
  onDragEnd, 
  onDrop, 
  selectedTaskId, 
  onSelectTask,
  onAddTask,
  onColumnAction,
}) {
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  return (
    <div className="flex-1 flex gap-3 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-[#28313C] scrollbar-track-transparent px-5 pb-4 pt-2">
      {COLUMNS.map((col, index) => {
        const columnTasks = tasks.filter(t => t.status === col.id);
        const isDraggingOver = draggedTaskId && tasks.find(t => t.id === draggedTaskId)?.status !== col.id;

        return (
          <motion.div 
            key={col.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05, ease: [0.23, 1, 0.32, 1] }}
            className={cn(
              "flex flex-col flex-1 min-w-[250px] 2xl:min-w-[300px] shrink-0 gap-3 rounded-2xl transition-colors duration-300",
              isDraggingOver ? "bg-[#141A22]/40 border border-dashed border-[#4EA1FF]/50" : "bg-transparent border border-transparent"
            )}
            onDragOver={handleDragOver}
            onDrop={(e) => onDrop(e, col.id)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                {col.label} 
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#28313C] text-[10px] font-bold text-muted-foreground">
                  {columnTasks.length}
                </span>
              </h3>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <button type="button" onClick={() => onAddTask?.(col.id)} className="flex items-center justify-center size-6 rounded-md hover:bg-[#141A22] hover:text-white transition-colors" aria-label={`Add task to ${col.label}`}>
                  <Plus className="size-3.5" />
                </button>
                <button type="button" onClick={() => onColumnAction?.(col.id)} className="flex items-center justify-center size-6 rounded-md hover:bg-[#141A22] hover:text-white transition-colors" aria-label={`${col.label} column actions`}>
                  <MoreHorizontal className="size-3.5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 scrollbar-none pb-4">
              <AnimatePresence mode="popLayout">
                {columnTasks.map(task => {
                  const isSelected = selectedTaskId === task.id;
                  
                  return (
                    <motion.div 
                      key={task.id}
                      layout
                      layoutId={task.id}
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      draggable
                      onDragStart={(e) => onDragStart(e, task.id)}
                      onDragEnd={onDragEnd}
                      onClick={() => onSelectTask(task.id)}
                      className={cn(
                        "flex flex-col gap-3.5 border p-4 cursor-grab active:cursor-grabbing transition-colors group rounded-xl",
                        isSelected 
                          ? "border-[#4EA1FF]/50 bg-gradient-to-b from-[rgba(78,161,255,0.10)] to-[#0E1116] shadow-[0_4px_20px_rgba(78,161,255,0.15)] ring-1 ring-[#4EA1FF]/20" 
                          : "border-[#28313C] bg-gradient-to-b from-[#141A22] to-[#0E1116] hover:border-[#4EA1FF]/30 shadow-sm"
                      )}
                    >
                    {/* Priority & Status line */}
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest border",
                        task.priorityColor === "critical" ? "border-critical/30 bg-critical/10 text-critical" : 
                        task.priorityColor === "warning" ? "border-warning/30 bg-warning/10 text-warning" : 
                        "border-muted-foreground/20 bg-muted-foreground/10 text-muted-foreground"
                      )}>{task.priority}</span>
                      
                      {task.tag && (
                        <span className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 uppercase tracking-widest border",
                          task.tag === "SLA" ? "border-warning/30 bg-warning/10 text-warning" : "border-[#4EA1FF]/30 bg-[#4EA1FF]/10 text-[#4EA1FF]"
                        )}>
                          {task.tag}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <div className="flex flex-col gap-1.5 mt-0.5">
                      <span className={cn(
                        "text-[13px] font-bold leading-snug transition-colors",
                        task.isCompleted ? "text-muted-foreground line-through" : "text-white group-hover:text-primary-foreground"
                      )}>{task.title}</span>
                      <span className="text-[10px] text-muted-foreground font-medium">{task.team}</span>
                    </div>

                    {/* Progress bar (if any) */}
                    {task.progress !== undefined && (
                      <div className="flex items-center gap-2.5 mt-1">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="size-3 text-[#4EA1FF]" />
                          <span className="text-[10px] font-bold text-white">{task.checklist}</span>
                        </div>
                        <div className="h-1 flex-1 rounded-full bg-[#28313C] overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${task.progress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full bg-[#4EA1FF]" 
                          />
                        </div>
                        <span className="text-[10px] font-bold text-[#4EA1FF]">{task.progress}%</span>
                      </div>
                    )}

                    {/* Footer: Assignee, Date, Icons */}
                    <div className="flex items-center justify-between mt-1 pt-3 border-t border-[#28313C]/50">
                      <div className="flex items-center gap-2">
                        <div className="flex size-6 items-center justify-center rounded-full bg-[#28313C] text-[8px] font-bold text-white border border-[#28313C] overflow-hidden ring-2 ring-[#0E1116]">
                          <Image src={`https://api.dicebear.com/7.x/notionists/png?seed=${encodeURIComponent(task.assignee)}`} alt={`${task.assignee} avatar`} width={24} height={24} className="h-full w-full object-cover" />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium">{task.assignee}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-muted-foreground">
                        {task.checklist && task.progress === undefined && (
                          <div className="flex items-center gap-1 text-[10px] font-semibold">
                            <CheckCircle2 className="size-3" /> {task.checklist}
                          </div>
                        )}
                        {task.attachments > 0 && (
                          <div className="flex items-center gap-1 text-[10px] font-semibold">
                            <Paperclip className="size-3" /> {task.attachments}
                          </div>
                        )}
                        {task.comments > 0 && (
                          <div className="flex items-center gap-1 text-[10px] font-semibold">
                            <MessageSquare className="size-3" /> {task.comments}
                          </div>
                        )}
                        {task.date && (
                          <div className={cn(
                            "flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border",
                            task.status === "completed" ? "border-muted-foreground/20 bg-muted-foreground/10 text-muted-foreground" :
                            task.priorityColor === "critical" && task.status !== "completed" ? "border-critical/20 bg-critical/10 text-critical" :
                            "border-[#4EA1FF]/20 bg-[#4EA1FF]/10 text-[#4EA1FF]"
                          )}>
                            <Calendar className="size-2.5" /> {task.date}
                          </div>
                        )}
                      </div>
                    </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => onAddTask?.(col.id)}
                className="w-full mt-2 rounded-xl border border-dashed border-[#28313C] bg-[#141A22]/30 py-3 text-[11px] font-bold text-muted-foreground hover:text-white hover:border-muted-foreground/50 hover:bg-[#141A22] transition-all flex items-center justify-center gap-2 group"
              >
                <Plus className="size-3.5 group-hover:text-[#4EA1FF] transition-colors" /> Add task
              </motion.button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
