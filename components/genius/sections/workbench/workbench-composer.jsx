"use client";

import { cn } from "@/lib/utils";
import { Plus, ArrowUp, Zap, MessageSquare, BarChart2, GitMerge, FileText, Settings2, Mic, ChevronDown, Check, Paperclip, Wrench, Square, Database, Blocks, Play, Bookmark, Maximize2, Sparkles, Lock, FileIcon, X, ShieldAlert, ShieldCheck, CheckCircle2, RotateCcw } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

function fileSizeLabel(size = 0) {
  const kb = Number(size || 0) / 1024;
  return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(kb))} KB`;
}

function composerFileChip(record = {}, fallback = {}) {
  const name = record.name || record.fileName || fallback.name || "Attached file";
  const mime = String(record.type || record.mimeType || fallback.type || "").toLowerCase();
  let type = "other";
  if (mime.includes("pdf") || /\.pdf$/i.test(name)) type = "pdf";
  else if (mime.includes("sheet") || mime.includes("excel") || /\.(xlsx|xls|csv)$/i.test(name)) type = "excel";
  else if (mime.includes("image") || /\.(png|jpe?g|webp|gif)$/i.test(name)) type = "image";

  return {
    id: record.id || `${name}-${fallback.size || record.size || Math.random().toString(36).slice(2)}`,
    name,
    size: record.sizeLabel || fileSizeLabel(record.size || fallback.size || 0),
    type,
    status: record.status || "uploaded",
  };
}

export function WorkbenchComposer({
  input,
  setInput,
  isSending,
  onSend,
  onStop,
  isEmpty,
  workspaceName = "GENIUS Workspace",
  onAttachFiles,
  onClearConversation,
  onOpenSettings,
  onShowShortcuts,
}) {
  const [activeMode, setActiveMode] = useState("ask");
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);

  const handleFileUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files || []).filter(Boolean);
    if (!selectedFiles.length) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const optimisticFiles = selectedFiles.map((file) => composerFileChip({ status: "uploading" }, file));
    setFiles((current) => [...current, ...optimisticFiles]);

    try {
      if (!onAttachFiles) {
        setFiles((current) => current.map((file) => (
          optimisticFiles.some((optimistic) => optimistic.id === file.id) ? { ...file, status: "ready" } : file
        )));
        return;
      }

      const result = await onAttachFiles(selectedFiles);
      const uploadedRecords = Array.isArray(result?.evidence) ? result.evidence : Array.isArray(result?.records) ? result.records : [];
      setFiles((current) => [
        ...current.filter((file) => !optimisticFiles.some((optimistic) => optimistic.id === file.id)),
        ...(uploadedRecords.length ? uploadedRecords.map((record, index) => composerFileChip(record, selectedFiles[index])) : optimisticFiles.map((file) => ({ ...file, status: "uploaded" }))),
      ]);
    } catch (error) {
      setFiles((current) => current.filter((file) => !optimisticFiles.some((optimistic) => optimistic.id === file.id)));
      toast.error(error.message || "Files could not be attached to the workspace.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleAiAssist = () => {
    if (input.trim()) {
      toast.info("AI Assist will use the current prompt and workspace context when you send it.");
      return;
    }
    setInput("Analyze this workspace and summarize the top risks, evidence gaps, and recommended next actions.");
  };

  const handleGeniusBadge = () => {
    toast.info("GENIUS responses use workspace evidence, diagnostics, reports, and supervised agent context.");
  };

  const handleExpand = () => {
    textareaRef.current?.focus();
    toast.info("Use the composer for longer multi-line prompts; it expands automatically.");
  };

  const handleLockedComposerAction = (label) => {
    toast.info(`${label} is locked until persistent workspace configuration is enabled.`);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(Math.max(textareaRef.current.scrollHeight, 72), 220)}px`;
    }
  }, [input]);

  const modes = [
    { id: "ask", label: "Ask", icon: MessageSquare },
    { id: "analyze", label: "Analyze", icon: BarChart2 },
    { id: "compare", label: "Compare", icon: GitMerge },
    { id: "negotiate", label: "Negotiate", icon: FileText },
    { id: "build", label: "Build", icon: Blocks },
    { id: "execute", label: "Execute", icon: Play }
  ];

  const suggestions = [
    "What is our biggest renewal risk?",
    "Compare pricing to market benchmarks",
    "Summarize key contract terms",
    "Identify unused licenses & savings"
  ];

  return (
    <div className="w-full px-4 sm:px-6 pb-4 pt-2">
      <div className="flex flex-col w-full mx-auto relative z-20">
        
        {/* Mode Navigation */}
        <div className="flex items-center justify-between overflow-x-auto scrollbar-hide mb-2 px-1">
          <div className="flex items-center gap-4 shrink-0">
            {modes.map(mode => {
              const Icon = mode.icon;
              const isActive = activeMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id)}
                  className={cn(
                    "flex items-center gap-1.5 pb-2 text-[13px] font-semibold transition-all relative",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-white"
                  )}
                >
                  <Icon className="size-4" />
                  {mode.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full shadow-[0_0_8px_rgba(78,161,255,0.6)]" />
                  )}
                </button>
              );
            })}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg bg-transparent px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-white transition-colors shrink-0 mb-1">
              <Settings2 className="size-3.5" /> Options <ChevronDown className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-[#0E1116] border-[#28313C] text-white">
              <DropdownMenuItem onClick={onOpenSettings} className="hover:bg-[#28313C] focus:bg-[#28313C] cursor-pointer">Chat settings</DropdownMenuItem>
              <DropdownMenuItem onClick={onShowShortcuts} className="hover:bg-[#28313C] focus:bg-[#28313C] cursor-pointer">Keyboard shortcuts</DropdownMenuItem>
              <DropdownMenuItem onClick={onClearConversation} className="hover:bg-[#28313C] focus:bg-[#28313C] cursor-pointer">Clear conversation</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Composer Shell - "change a colour to our" */}
        <div className="flex flex-col rounded-[16px] border border-[#28313C] bg-[#0E1116] p-3.5 sm:p-5 shadow-lg focus-within:border-primary/50 focus-within:shadow-[0_4px_30px_rgba(78,161,255,0.1)] transition-all gap-4">
          
          {/* Prompt Area */}
          <div className="flex flex-col gap-3">
            {isEmpty && (
              <h2 className="text-[20px] font-medium text-white/90 tracking-tight">What would you like to explore today?</h2>
            )}
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Describe your goal, ask a question, or request an analysis..."
              className="resize-none border-0 bg-transparent px-0 py-1 text-[15px] text-white placeholder-muted-foreground outline-none ring-0 focus-visible:ring-0 shadow-none leading-relaxed overflow-y-auto scrollbar-thin"
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && !(e.keyCode === 229)) {
                  e.preventDefault();
                  onSend();
                }
              }}
            />

            <div className="flex flex-wrap items-end justify-between mt-1 gap-4">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                {suggestions.map((suggestion, i) => (
                  <button key={i} type="button" onClick={() => setInput(suggestion)} className="flex items-center gap-1.5 rounded-[8px] border border-[#28313C] bg-[#141A22]/50 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-white hover:border-primary/40 transition-colors shrink-0">
                    <Sparkles className="size-3 text-primary" /> {suggestion}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-4 text-muted-foreground shrink-0 mb-1">
                <span className="text-[11px] font-mono font-medium">{input.length} / 4000</span>
                <button type="button" onClick={handleAiAssist} className="hover:text-white transition-colors" title="AI Assist"><Sparkles className="size-4" /></button>
                <button type="button" onClick={handleGeniusBadge} className="flex size-[18px] items-center justify-center rounded-full bg-[#10b981] text-[#0E1116] font-bold text-[10px] hover:brightness-110 transition-colors" title="GENIUS">G</button>
                <button type="button" onClick={() => setInput("")} className="hover:text-white transition-colors" title="Reset"><RotateCcw className="size-4" /></button>
                <button type="button" onClick={handleExpand} className="hover:text-white transition-colors" title="Expand"><Maximize2 className="size-4" /></button>
              </div>
            </div>
          </div>

          {/* Hidden file input */}
          <input 
            type="file" 
            multiple 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />

          {/* Attached Files Section */}
          {files.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#28313C]/50">
              {files.map((file) => (
                <div key={file.id} className="flex items-center gap-3 rounded-[10px] border border-[#28313C] bg-[#141A22] px-3 py-1.5 shadow-sm group">
                  <div className={cn(
                    "flex size-5 items-center justify-center rounded text-white shrink-0",
                    file.type === "pdf" ? "bg-[#ef4444]" : file.type === "excel" ? "bg-[#10b981]" : "bg-[#4EA1FF]"
                  )}>
                    <FileIcon className="size-3" />
                  </div>
                  <span className="text-[12px] font-medium text-white/90 truncate max-w-[150px]">{file.name}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">{file.size}</span>
                  <button type="button" onClick={() => removeFile(file.id)} className="ml-1 text-muted-foreground hover:text-white shrink-0"><X className="size-3.5" /></button>
                </div>
              ))}
              
              <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 rounded-[10px] border border-dashed border-[#28313C] bg-transparent px-3 py-1.5 text-[12px] text-muted-foreground hover:text-white hover:bg-[#141A22] transition-colors h-[34px]">
                <Plus className="size-3.5" /> Add more files
              </button>
            </div>
          )}

          {/* Context Control Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            
            {/* Left Group */}
            <div className="flex items-center flex-wrap gap-2.5">
              <button type="button" className="flex size-[38px] items-center justify-center rounded-[12px] border border-[#28313C] bg-[#141A22] text-muted-foreground transition-colors hover:text-white hover:bg-[#28313C]" title="Add" onClick={() => fileInputRef.current?.click()}>
                <Plus className="size-4" />
              </button>
              
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-[12px] border border-primary/40 bg-primary/10 px-3 py-1.5 text-left hover:bg-primary/20 transition-colors shadow-sm outline-none">
                  <Database className="size-[18px] text-primary" />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-white/90 leading-tight">Workspace <ChevronDown className="size-3 inline-block text-muted-foreground ml-0.5" /></span>
                    <span className="text-[10px] text-muted-foreground leading-tight">{workspaceName}</span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 bg-[#0E1116] border-[#28313C] text-white">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Select Workspace</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleLockedComposerAction("Workspace switching")} className="hover:bg-[#28313C] focus:bg-[#28313C] cursor-pointer flex items-center justify-between">
                    {workspaceName} <Check className="size-3.5 text-primary" />
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLockedComposerAction("Workspace switching")} className="hover:bg-[#28313C] focus:bg-[#28313C] cursor-pointer">Global Finance</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLockedComposerAction("Workspace switching")} className="hover:bg-[#28313C] focus:bg-[#28313C] cursor-pointer">HR Department</DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#28313C]" />
                  <DropdownMenuItem onClick={() => handleLockedComposerAction("Workspace creation")} className="hover:bg-[#28313C] focus:bg-[#28313C] cursor-pointer text-primary">
                    <Plus className="size-3.5 mr-2" /> Create Workspace
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-[12px] border border-[#28313C] bg-[#141A22]/50 px-3 py-1.5 text-left hover:bg-[#28313C]/50 transition-colors shadow-sm outline-none">
                  <Database className="size-[18px] text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-white/90 leading-tight">Sources <span className="text-muted-foreground font-normal">(8)</span></span>
                    <span className="text-[10px] text-muted-foreground leading-tight flex items-center gap-1"><span className="size-1.5 rounded-full bg-[#10b981]" /> 8 connected</span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 bg-[#0E1116] border-[#28313C] text-white">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Active Sources</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleLockedComposerAction("Source scoping")} className="hover:bg-[#28313C] focus:bg-[#28313C] cursor-pointer"><div className="size-2 rounded-full bg-[#10b981] mr-2" /> Salesforce CRM</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLockedComposerAction("Source scoping")} className="hover:bg-[#28313C] focus:bg-[#28313C] cursor-pointer"><div className="size-2 rounded-full bg-[#10b981] mr-2" /> Snowflake Data</DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#28313C]" />
                  <DropdownMenuItem onClick={() => handleLockedComposerAction("Source management")} className="hover:bg-[#28313C] focus:bg-[#28313C] cursor-pointer">Manage Sources...</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-[12px] border border-[#28313C] bg-[#141A22]/50 px-3 py-1.5 text-left hover:bg-[#28313C]/50 transition-colors shadow-sm outline-none">
                  <Wrench className="size-[18px] text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-white/90 leading-tight">Tools <ChevronDown className="size-3 inline-block text-muted-foreground ml-0.5" /></span>
                    <span className="text-[10px] text-muted-foreground leading-tight flex items-center gap-1"><ArrowUp className="size-2.5" /> 12 available</span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 bg-[#0E1116] border-[#28313C] text-white">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Available Agents & Tools</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleLockedComposerAction("Tool configuration")} className="hover:bg-[#28313C] focus:bg-[#28313C] cursor-pointer flex items-center justify-between">Web Search <Check className="size-3.5 text-primary" /></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLockedComposerAction("Tool configuration")} className="hover:bg-[#28313C] focus:bg-[#28313C] cursor-pointer flex items-center justify-between">Code Execution <Check className="size-3.5 text-primary" /></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLockedComposerAction("Tool configuration")} className="hover:bg-[#28313C] focus:bg-[#28313C] cursor-pointer flex items-center justify-between">Data Analyst <Check className="size-3.5 text-primary" /></DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#28313C]" />
                  <DropdownMenuItem onClick={() => handleLockedComposerAction("Tool configuration")} className="hover:bg-[#28313C] focus:bg-[#28313C] cursor-pointer">Configure Tools...</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Right Group */}
            <div className="flex items-center gap-2.5">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-[12px] border border-[#28313C] bg-[#141A22]/50 px-3 py-1.5 text-left hover:bg-[#28313C]/50 transition-colors shadow-sm outline-none">
                  <Sparkles className="size-[18px] text-primary" fill="currentColor" />
                  <span className="text-[12px] font-semibold text-white/90">Gemini 1.5 Pro <ChevronDown className="size-3 inline-block text-muted-foreground ml-0.5" /></span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-[#0E1116] border-[#28313C] text-white">
                  <DropdownMenuItem onClick={() => handleLockedComposerAction("Model routing")} className="hover:bg-[#28313C] focus:bg-[#28313C] cursor-pointer flex items-center justify-between">Gemini 1.5 Pro <Check className="size-3.5 text-primary" /></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLockedComposerAction("Model routing")} className="hover:bg-[#28313C] focus:bg-[#28313C] cursor-pointer">Gemini 1.5 Flash</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLockedComposerAction("Model routing")} className="hover:bg-[#28313C] focus:bg-[#28313C] cursor-pointer">Claude 3.5 Sonnet</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-[12px] border border-[#28313C] bg-[#141A22]/50 px-3 py-1.5 text-left hover:bg-[#28313C]/50 transition-colors shadow-sm outline-none">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-white/90 leading-tight flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-[#10b981]" /> 72%</span>
                    <span className="text-[10px] text-muted-foreground leading-tight">Context used</span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-[#0E1116] border-[#28313C] text-white p-3">
                  <div className="text-xs text-muted-foreground mb-1">Context Window</div>
                  <div className="text-sm font-bold mb-2">1,500,000 / 2,000,000</div>
                  <div className="w-full h-1.5 bg-[#28313C] rounded-full overflow-hidden">
                    <div className="h-full bg-[#10b981] w-[72%]" />
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Optimal length for analysis.</div>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <button type="button" onClick={() => handleLockedComposerAction("Voice input")} className="flex size-[38px] items-center justify-center rounded-[12px] border border-[#28313C] bg-[#141A22] text-muted-foreground transition-colors hover:text-white hover:bg-[#28313C]" title="Voice Input">
                <Mic className="size-4" />
              </button>
              
              <div className={cn(
                "flex items-center rounded-[12px] shadow-sm overflow-hidden transition-colors",
                (!input.trim() && !isSending) ? "bg-[#28313C]" : "bg-primary"
              )}>
                <button
                  type="button"
                  onClick={isSending ? onStop : onSend}
                  disabled={!isSending && !input.trim()}
                  className={cn(
                    "flex items-center justify-center gap-2 px-4 py-2 text-[13px] font-semibold transition-all h-[38px]",
                    isSending 
                      ? "text-white hover:bg-primary/90"
                      : input.trim()
                        ? "text-white hover:bg-primary/90" 
                        : "text-muted-foreground cursor-not-allowed hover:bg-transparent"
                  )}
                  title={isSending ? "Stop generation" : "Send message"}
                >
                  {isSending ? (
                    <Square className="size-4 fill-current text-white" />
                  ) : (
                    <ArrowUp className="size-4 rotate-45" />
                  )}
                  {isSending ? "Stop" : "Send"}
                </button>
                <div className={cn("w-[1px] h-[38px]", (!input.trim() && !isSending) ? "bg-[#141A22]" : "bg-white/20")} />
                <button 
                  type="button"
                  onClick={() => handleLockedComposerAction("Advanced send options")}
                  className={cn(
                    "flex items-center justify-center px-2 py-2 transition-colors h-[38px]",
                    (!input.trim() && !isSending) ? "text-muted-foreground hover:bg-transparent cursor-not-allowed" : "text-white hover:bg-primary/90"
                  )}
                  disabled={!input.trim() && !isSending}
                >
                  <ChevronDown className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground px-2 pt-3 pb-1">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="size-3.5 opacity-70" /> 
            <span>GENIUS can make mistakes. Always validate important information. <a href="#" className="text-primary hover:underline hover:text-primary/80">Learn more</a></span>
          </div>
          <div className="flex items-center gap-4 hidden sm:flex">
            <span className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 opacity-70" /> Enterprise security</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="size-3.5 opacity-70" /> SOC 2</span>
            <span className="flex items-center gap-1.5"><Lock className="size-3.5 opacity-70" /> No data training</span>
          </div>
        </div>

      </div>
    </div>
  );
}
