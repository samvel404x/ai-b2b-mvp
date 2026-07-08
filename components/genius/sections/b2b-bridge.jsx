"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Inbox,
  MessageSquare,
  CheckCircle2,
  Calendar,
  FileText,
  Users,
  LineChart,
  Settings,
  MoreVertical,
  Info,
  ShieldCheck,
  Send,
  Paperclip,
  Sparkles,
  RefreshCw,
  Lock,
  ChevronRight,
  HelpCircle,
  PlusSquare,
  ThumbsUp,
  LayoutGrid,
  Clock,
  Hexagon,
  Check,
  Search,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function B2bBridge() {
  const [activeTab, setActiveTab] = useState("Chats");
  const [chatInput, setChatInput] = useState("");
  const [useAI, setUseAI] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState("Pending Approval"); // 'Pending Approval' | 'Approved'

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "You",
      role: "Alex Rivera",
      time: "May 20, 9:15 AM",
      text: "Hi Sarah, while reviewing Invoice INV-2025-0519, we noticed a discrepancy in the delivered quantity for White Button Mushrooms.\nInvoice lists 550kg, but our receiving report shows 500kg.",
      isSelf: true,
      status: "Delivered",
      statusColor: "text-primary"
    },
    {
      id: 2,
      sender: "Farm Fresh Co.",
      role: "Sarah Miller",
      time: "May 20, 9:18 AM",
      text: "Hi Alex, thanks for flagging this. You're correct — there was a packing variance at dispatch. We can issue a credit note for the 50kg difference.",
      isSelf: false
    },
    {
      id: 3,
      sender: "You",
      role: "Alex Rivera",
      time: "May 20, 9:20 AM",
      text: "Great, please proceed with the credit note.\nAlso, can we confirm payment terms as Net 30 from invoice date?",
      isSelf: true,
      status: "Read 9:21 AM",
      statusColor: "text-[#3b82f6]"
    },
    {
      id: 4,
      sender: "Farm Fresh Co.",
      role: "Sarah Miller",
      time: "May 20, 9:22 AM",
      text: "Confirmed — Net 30 from invoice date. Credit note will reference INV-2025-0519.\nExpect it within 24 hours.",
      isSelf: false
    },
    {
      id: "ai-1",
      sender: "Smart Assist",
      role: "AI Summary",
      time: "9:23 AM",
      text: "Invoice discrepancy acknowledged (50kg overcharge). Credit note to be issued.\nPayment terms confirmed: Net 30 from invoice date.",
      isSystem: true
    },
    {
      id: 5,
      sender: "You",
      role: "Alex Rivera",
      time: "May 20, 9:24 AM",
      text: "Perfect, thanks Sarah. Please share once the credit note is issued.",
      isSelf: true,
      status: "Read 9:24 AM",
      statusColor: "text-[#3b82f6]"
    }
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setMessages([...messages, {
      id: Date.now(),
      sender: "You",
      role: "Alex Rivera",
      time: "Just now",
      text: chatInput,
      isSelf: true,
      status: "Sending...",
      statusColor: "text-muted-foreground"
    }]);
    setChatInput("");
    toast.success("Encrypted message sent");

    // Simulate read receipt
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.status === "Sending..." ? { ...m, status: "Delivered", statusColor: "text-primary" } : m));
    }, 1500);
  };

  const handleApproveTerms = () => {
    toast.success("Terms Approved & Finance Notified!");
    setWorkflowStatus("Approved");
    setMessages([...messages, {
      id: Date.now(),
      sender: "Smart Assist",
      role: "System Action",
      time: "Just now",
      text: "Terms approved by Alex Rivera. Credit note CN-2025-0520 has been unlocked for Finance processing.",
      isSystem: true,
      isAction: true
    }]);
  };

  const handleSummarize = () => {
    toast.info("Generating deep thread summary...");
    setTimeout(() => {
      setMessages([...messages, {
        id: Date.now(),
        sender: "Smart Assist",
        role: "AI Summary",
        time: "Just now",
        text: "Thread Summary:\n- Discrepancy: 50kg missing on INV-2025-0519.\n- Resolution: Credit note CN-2025-0520 to be issued within 24h.\n- Terms: Net 30 confirmed.",
        isSystem: true
      }]);
    }, 1000);
  };

  const navItems = [
    { name: "Inbox", icon: Inbox, count: 8 },
    { name: "Chats", icon: MessageSquare },
    { name: "Tasks", icon: CheckCircle2, count: 12 },
    { name: "Workflows", icon: RefreshCw },
    { name: "Calendar", icon: Calendar },
    { name: "Files", icon: FileText },
    { name: "Partners", icon: Users },
    { name: "Analytics", icon: LineChart },
    { name: "Settings", icon: Settings }
  ];

  return (
    <div className="flex h-full w-full bg-[#050606] overflow-hidden text-white font-sans">
      
      {/* 1. Inner Left Navigation (B2B specific) */}
      <div className="w-[200px] shrink-0 border-r border-[#1E2730] flex flex-col bg-[#0A0C0B] py-6 relative z-20">
        
        <div className="px-5 mb-8">
          <div className="flex items-center justify-between cursor-pointer opacity-80 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2">
              <LayoutGrid className="size-4 text-muted-foreground" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Menu</span>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5 px-3 flex-1 overflow-y-auto scrollbar-none">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition-all group relative",
                activeTab === item.name 
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(34,197,94,0.05)]" 
                  : "text-muted-foreground hover:bg-[#141B21] hover:text-white border border-transparent"
              )}
            >
              {activeTab === item.name && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-r-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
              )}
              <div className="flex items-center gap-3">
                <item.icon className={cn("size-4", activeTab === item.name ? "text-primary" : "text-muted-foreground group-hover:text-white")} /> 
                {item.name}
              </div>
              {item.count && (
                <span className={cn(
                  "rounded px-1.5 py-0.5 text-[10px] font-bold border",
                  activeTab === item.name 
                    ? "bg-primary/20 border-primary/30 text-primary" 
                    : "bg-[#141B21] border-[#1E2730] text-muted-foreground"
                )}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      {activeTab === "Chats" ? (
        <>
          {/* 2. Main Chat Area */}
          <div className="flex-1 flex flex-col bg-[#0A0C0B] relative overflow-hidden">
            
            {/* Top Status Bar */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-[#1E2730] bg-[#0A0C0B] shrink-0 relative z-20">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-white tracking-tight">Invoice Discrepancy Discussion</h1>
                <span className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary uppercase tracking-widest shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                  <ShieldCheck className="size-3.5" /> Secure Session
                </span>
              </div>
              <div className="flex items-center gap-5 text-muted-foreground">
                <div className="flex items-center gap-2 text-sm font-semibold hover:text-white cursor-pointer transition-colors bg-[#141B21] px-3 py-1.5 rounded-lg border border-[#1E2730]">
                  <Users className="size-4" /> 2 Participants
                </div>
                <div className="flex items-center justify-center size-8 rounded-lg hover:bg-[#141B21] cursor-pointer transition-colors">
                  <Info className="size-4.5" />
                </div>
                <div className="flex items-center justify-center size-8 rounded-lg hover:bg-[#141B21] cursor-pointer transition-colors">
                  <MoreVertical className="size-4.5" />
                </div>
              </div>
            </div>

            {/* Connection visualization */}
            <div className="flex items-center justify-center gap-10 py-6 border-b border-[#1E2730] bg-[#050606] shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10 border border-primary/30 text-primary shadow-[0_0_20px_rgba(34,197,94,0.15)]">
                  <Hexagon className="size-8 absolute opacity-50" />
                  <span className="text-xl font-bold font-mono z-10">G</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold text-white">Your Company</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">Alex Rivera <span className="rounded bg-[#3b82f6]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#3b82f6] uppercase tracking-wider">You</span></span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-primary mt-1.5"><CheckCircle2 className="size-3" /> Verified Business</span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center px-12 relative w-64">
                <div className="h-px w-full bg-[#1E2730] absolute top-1/2 -z-10"></div>
                <div className="absolute top-1/2 left-0 size-2 rounded-full bg-[#3b82f6] -mt-[4px] shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                <div className="absolute top-1/2 right-0 size-2 rounded-full bg-[#3b82f6] -mt-[4px] shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                <div className="flex flex-col items-center gap-1.5 bg-[#050606] px-4 py-1">
                  <ShieldCheck className="size-7 text-[#3b82f6]" />
                  <span className="text-xs font-bold text-white">Trusted Connection</span>
                  <span className="text-[10px] text-muted-foreground">Established May 20, 2025</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div className="flex flex-col items-end">
                  <span className="text-base font-bold text-white">Farm Fresh Co.</span>
                  <span className="text-xs text-muted-foreground mt-0.5">Sarah Miller</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-primary mt-1.5"><CheckCircle2 className="size-3" /> Verified Business</span>
                </div>
                <div className="flex size-14 items-center justify-center rounded-xl bg-[#141B21] border border-[#1E2730] text-white">
                  <span className="text-xs font-bold">FFC</span>
                </div>
              </div>
            </div>

            {/* Chat Feed */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-[#1E2730] pb-48">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex w-full", msg.isSystem ? "justify-center" : msg.isSelf ? "justify-end" : "justify-start")}>
                  
                  {msg.isSystem ? (
                    /* AI Summary Block */
                    <div className={cn(
                      "flex flex-col rounded-xl border p-5 shadow-lg relative min-w-[500px] max-w-[700px]",
                      msg.isAction 
                        ? "border-primary/40 bg-primary/5 shadow-[0_0_20px_rgba(34,197,94,0.1)]" 
                        : "border-[#3b82f6]/40 bg-[#142338]/60 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                    )}>
                      <div className="absolute -top-3.5 left-5 flex items-center gap-1.5 rounded-full bg-[#0A0C0B] border border-[#3b82f6]/50 px-3 py-1 shadow-sm">
                        <Sparkles className="size-3.5 text-[#3b82f6]" />
                        <span className="text-[10px] font-bold text-[#3b82f6] uppercase tracking-widest">{msg.role} • {msg.time}</span>
                      </div>
                      {!msg.isAction && (
                        <div className="absolute top-4 right-5">
                          <span className="rounded border border-[#3b82f6]/30 bg-[#3b82f6]/10 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-[#3b82f6]">Smart Assist</span>
                        </div>
                      )}
                      <p className="text-[14px] text-white/95 leading-relaxed mt-3 whitespace-pre-line font-medium">{msg.text}</p>
                      {!msg.isAction && (
                        <div className="flex items-center gap-2 mt-4">
                          <button className="flex items-center gap-1.5 rounded bg-[#141B21] hover:bg-[#1E2730] transition-colors border border-[#2C3842] px-3 py-1.5 text-[11px] text-primary font-bold">
                             <ThumbsUp className="size-3.5" /> 1
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Normal Chat Bubbles */
                    <div className={cn("flex gap-4 max-w-[75%]", msg.isSelf ? "flex-row" : "flex-row-reverse")}>
                      
                      <div className="flex flex-col w-full">
                        <div className={cn("flex items-center gap-2 mb-2 px-1", msg.isSelf ? "justify-end" : "justify-start")}>
                          <span className="text-[12px] font-bold text-white">{msg.role}</span>
                          <span className="text-[11px] text-muted-foreground">• {msg.sender}</span>
                          <span className="text-[10px] text-muted-foreground ml-2">{msg.time}</span>
                        </div>
                        
                        <div className="flex gap-3 items-end">
                          {!msg.isSelf && (
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#141B21] border border-[#1E2730] text-white text-[10px] font-bold shadow-sm">
                              FFC
                            </div>
                          )}

                          <div className={cn(
                            "rounded-2xl p-4 text-[14px] leading-relaxed shadow-sm relative",
                            msg.isSelf 
                              ? "bg-gradient-to-br from-[#0f766e]/90 to-[#064e3b]/90 text-white border border-primary/20 rounded-br-sm shadow-[0_4px_20px_rgba(15,118,110,0.15)]" 
                              : "bg-[#141B21] text-white/90 border border-[#1E2730] rounded-bl-sm"
                          )}>
                            <p className="whitespace-pre-line">{msg.text}</p>
                            
                            {msg.isSelf && (
                              <div className="flex justify-end mt-2 -mb-1">
                                <span className={cn("text-[10px] font-semibold flex items-center gap-1", msg.statusColor)}>
                                  {msg.status} {(msg.status.includes('Read') || msg.status === 'Delivered') && <CheckCircle2 className="size-3" />}
                                </span>
                              </div>
                            )}
                          </div>

                          {msg.isSelf && (
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/30 text-primary shadow-sm relative">
                              <Hexagon className="size-10 absolute opacity-30" />
                              <div className="size-4 z-10 font-bold text-[12px] flex items-center justify-center">G</div>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Chat Input Container (Absolute at bottom) */}
            <div className="absolute bottom-0 left-0 w-full bg-[#0A0C0B] border-t border-[#1E2730] px-8 py-5 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
              
              {/* Smart Action Buttons */}
              <div className="flex items-center gap-3 mb-4">
                <button className="flex items-center gap-2 rounded-full border border-[#2C3842] bg-[#141B21] px-4 py-2 text-[11px] font-semibold text-white hover:bg-[#1E2730] hover:border-[#3C4852] transition-colors">
                  <HelpCircle className="size-4 text-muted-foreground" /> Request Clarification
                </button>
                <button 
                  onClick={handleApproveTerms}
                  disabled={workflowStatus === "Approved"}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold transition-all shadow-[0_0_15px_rgba(34,197,94,0.1)]",
                    workflowStatus === "Approved" 
                      ? "bg-primary/5 border-primary/20 text-primary/50 cursor-not-allowed"
                      : "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:scale-[1.02]"
                  )}
                >
                  <CheckCircle2 className="size-4" /> {workflowStatus === "Approved" ? "Terms Approved" : "Approve Terms"}
                </button>
                <button className="flex items-center gap-2 rounded-full border border-[#2C3842] bg-[#141B21] px-4 py-2 text-[11px] font-semibold text-white hover:bg-[#1E2730] hover:border-[#3C4852] transition-colors">
                  <PlusSquare className="size-4 text-muted-foreground" /> Create Task
                </button>
                <button 
                  onClick={handleSummarize}
                  className="flex items-center gap-2 rounded-full border border-[#3b82f6]/40 bg-[#3b82f6]/10 px-4 py-2 text-[11px] font-semibold text-[#3b82f6] hover:bg-[#3b82f6]/20 transition-all ml-auto shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:scale-[1.02]"
                >
                  <Sparkles className="size-4" /> Summarize Thread
                </button>
              </div>

              {/* Input Box */}
              <form onSubmit={handleSendMessage} className="relative">
                <div className="flex items-center rounded-xl border border-[#2C3842] bg-[#141B21] p-2 focus-within:border-primary/50 focus-within:bg-[#1A232A] transition-all shadow-inner">
                  <button type="button" className="flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors">
                    <Paperclip className="size-5" />
                  </button>
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type a secure message..."
                    className="flex-1 bg-transparent px-4 py-2 text-[15px] text-white placeholder-muted-foreground outline-none"
                  />
                  <div className="flex items-center gap-4 pr-2">
                    
                    {/* AI Toggle */}
                    <div 
                      className="flex items-center gap-2 cursor-pointer bg-[#0A0C0B] px-3 py-1.5 rounded-lg border border-[#1E2730]"
                      onClick={() => setUseAI(!useAI)}
                    >
                      <span className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors", useAI ? "text-[#3b82f6]" : "text-muted-foreground")}>Share with AI</span>
                      <div className={cn("h-4 w-8 rounded-full relative transition-colors", useAI ? "bg-[#3b82f6] shadow-[0_0_10px_rgba(59,130,246,0.4)]" : "bg-[#2C3842]")}>
                        <div className={cn("absolute top-[2px] size-3 rounded-full transition-all", useAI ? "right-[2px] bg-white" : "left-[2px] bg-muted-foreground")}></div>
                      </div>
                    </div>

                    {/* Send Button */}
                    <button type="submit" className="flex size-10 items-center justify-center rounded-lg bg-primary text-black shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:scale-105 active:scale-95 transition-all ml-1">
                      <Send className="size-5 ml-0.5" />
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-center mt-3">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary/80">
                    <Lock className="size-3" /> Messages are encrypted end-to-end
                  </span>
                </div>
              </form>

            </div>

          </div>

          {/* 3. Right Sidebar: Shared Context */}
          <div className="w-[380px] shrink-0 border-l border-[#1E2730] flex flex-col bg-[#050606] relative z-20">
            
            {/* Top Status Indicators */}
            <div className="flex flex-col border-b border-[#1E2730] bg-[#0A0C0B] shrink-0">
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#1E2730]">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-primary shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">System Status:</span>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">All Systems Operational</span>
                </div>
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <RefreshCw className="size-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Data Sync: Real-time</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground cursor-pointer hover:text-white transition-colors">
                  <Lock className="size-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Secure Connection</span>
                  <ChevronRight className="size-3.5" />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#1E2730] pb-10">
              
              <div className="p-6 flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">Shared Context <Info className="size-4 text-muted-foreground cursor-pointer hover:text-white" /></h3>
                <div className="flex items-center gap-2 text-muted-foreground cursor-pointer hover:text-white transition-colors bg-[#141B21] px-2.5 py-1 rounded-md border border-[#1E2730]">
                   <RefreshCw className="size-3" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Sync: Live</span>
                   <MoreVertical className="size-3 ml-1" />
                </div>
              </div>

              {/* Section 1: Documents */}
              <div className="px-6 space-y-4 mb-8">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">1. Shared Invoices & Documents</h4>
                  <span className="text-[11px] font-semibold text-[#3b82f6] flex items-center cursor-pointer hover:text-[#60a5fa] transition-colors">View all <ChevronRight className="size-3.5 ml-0.5" /></span>
                </div>
                
                <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2 -mx-6 px-6">
                  
                  {/* Doc Card 1 */}
                  <div className="min-w-[200px] rounded-xl border border-[#2C3842] bg-[#0A0C0B] p-4 shrink-0 hover:border-primary/40 transition-all cursor-pointer group shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="rounded-lg bg-critical/10 p-1.5 text-critical"><FileText className="size-5" /></div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white leading-tight group-hover:text-primary transition-colors">INV-2025-0519.pdf</span>
                          <span className="text-[10px] text-muted-foreground">May 19, 2025</span>
                        </div>
                      </div>
                      <MoreVertical className="size-4 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col gap-0.5 mb-4">
                      <span className="text-xl font-bold text-white tracking-tight">$12,485.00</span>
                      <span className="text-[11px] text-muted-foreground font-medium">Invoice</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-[9px] font-bold text-primary uppercase tracking-widest"><CheckCircle2 className="size-3" /> Parsed</span>
                      <span className="flex items-center gap-1 rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-[9px] font-bold text-primary uppercase tracking-widest"><CheckCircle2 className="size-3" /> Verified</span>
                    </div>
                  </div>

                  {/* Doc Card 2 */}
                  <div className={cn(
                    "min-w-[200px] rounded-xl border p-4 shrink-0 cursor-pointer transition-all shadow-sm group",
                    workflowStatus === "Approved" ? "border-primary/40 bg-[#0A0C0B]" : "border-warning/40 bg-[#0A0C0B] shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                  )}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="rounded-lg bg-critical/10 p-1.5 text-critical"><FileText className="size-5" /></div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white leading-tight">CN-2025-0520.pdf</span>
                          <span className="text-[10px] text-muted-foreground">May 20, 2025</span>
                        </div>
                      </div>
                      <MoreVertical className="size-4 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col gap-0.5 mb-4">
                      <span className="text-xl font-bold text-white tracking-tight">-$1,135.00</span>
                      <span className="text-[11px] text-muted-foreground font-medium">Credit Note</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-[9px] font-bold text-primary uppercase tracking-widest"><CheckCircle2 className="size-3" /> Parsed</span>
                      {workflowStatus === "Approved" ? (
                        <span className="flex items-center gap-1 rounded bg-primary/10 border border-primary/30 px-2 py-0.5 text-[9px] font-bold text-primary uppercase tracking-widest"><CheckCircle2 className="size-3" /> Approved</span>
                      ) : (
                        <span className="flex items-center gap-1 rounded bg-warning/10 border border-warning/30 px-2 py-0.5 text-[9px] font-bold text-warning uppercase tracking-widest">Needs review</span>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Section 2: Workflow Timeline */}
              <div className="px-6 space-y-5 mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">2. Collaboration Workflow</h4>
                  <span className="text-[11px] font-semibold text-[#3b82f6] flex items-center cursor-pointer hover:text-[#60a5fa] transition-colors">View full <ChevronRight className="size-3.5 ml-0.5" /></span>
                </div>

                <div className="flex flex-col relative px-2">
                  <div className="absolute left-[15px] top-2 bottom-4 w-0.5 bg-gradient-to-b from-primary via-primary to-[#1E2730] opacity-30"></div>

                  {/* Step 1 */}
                  <div className="flex items-start gap-5 mb-6 relative z-10">
                    <div className="flex size-6 items-center justify-center rounded-full bg-[#050606] border-2 border-primary text-primary shrink-0 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                      <Check className="size-3.5 stroke-[3]" />
                    </div>
                    <div className="flex flex-col flex-1 pt-0.5">
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-bold text-white">Invoice uploaded</span>
                        <span className="text-[10px] text-muted-foreground">May 19, 09:04 AM</span>
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[11px] text-muted-foreground font-medium">INV-2025-0519.pdf</span>
                        <div className="flex size-5 items-center justify-center rounded-full bg-[#141B21] border border-[#2C3842] text-[8px] font-bold text-white">AR</div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-5 mb-6 relative z-10">
                    <div className="flex size-6 items-center justify-center rounded-full bg-[#050606] border-2 border-primary text-primary shrink-0 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                      <Check className="size-3.5 stroke-[3]" />
                    </div>
                    <div className="flex flex-col flex-1 pt-0.5">
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-bold text-white">AI extracted fields</span>
                        <span className="text-[10px] text-muted-foreground">May 19, 09:04 AM</span>
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[11px] text-muted-foreground font-medium">Quantities, amounts parsed</span>
                        <div className="flex size-5 items-center justify-center rounded-full bg-primary/20 border border-primary/30 text-[8px] font-bold text-primary"><Sparkles className="size-3" /></div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-5 mb-6 relative z-10">
                    <div className="flex size-6 items-center justify-center rounded-full bg-[#050606] border-2 border-primary text-primary shrink-0 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                      <Check className="size-3.5 stroke-[3]" />
                    </div>
                    <div className="flex flex-col flex-1 pt-0.5">
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-bold text-white">Supplier confirmed</span>
                        <span className="text-[10px] text-muted-foreground">May 20, 09:18 AM</span>
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[11px] text-muted-foreground font-medium">Discrepancy acknowledged</span>
                        <div className="flex size-5 items-center justify-center rounded-full bg-[#141B21] border border-[#2C3842] text-[8px] font-bold text-white">SM</div>
                      </div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex items-start gap-5 mb-6 relative z-10">
                    <div className="flex size-6 items-center justify-center rounded-full bg-[#050606] border-2 border-primary text-primary shrink-0 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                      <Check className="size-3.5 stroke-[3]" />
                    </div>
                    <div className="flex flex-col flex-1 pt-0.5">
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-bold text-white">Terms reviewed</span>
                        <span className="text-[10px] text-muted-foreground">May 20, 09:22 AM</span>
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[11px] text-muted-foreground font-medium">Net 30 confirmed</span>
                        <div className="flex size-5 items-center justify-center rounded-full bg-[#141B21] border border-[#2C3842] text-[8px] font-bold text-white">SM</div>
                      </div>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="flex items-start gap-5 mb-6 relative z-10">
                    <div className={cn(
                      "flex size-6 items-center justify-center rounded-full border-2 shrink-0 transition-colors",
                      workflowStatus === "Approved" 
                        ? "bg-[#050606] border-primary text-primary shadow-[0_0_10px_rgba(34,197,94,0.2)]" 
                        : "bg-[#050606] border-[#3b82f6] text-[#3b82f6] shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                    )}>
                      {workflowStatus === "Approved" ? <Check className="size-3.5 stroke-[3]" /> : <Lock className="size-3" />}
                    </div>
                    <div className="flex flex-col flex-1 pt-0.5">
                      <div className="flex items-start justify-between">
                        <span className={cn("text-xs font-bold", workflowStatus === "Approved" ? "text-white" : "text-[#3b82f6]")}>Escalated to Finance</span>
                        <span className={cn("text-[10px]", workflowStatus === "Approved" ? "text-muted-foreground" : "text-[#3b82f6]")}>May 20, 09:25 AM</span>
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className={cn("text-[11px] font-medium", workflowStatus === "Approved" ? "text-muted-foreground" : "text-[#3b82f6] opacity-90")}>
                          {workflowStatus === "Approved" ? "Credit note approved" : "Reviewing credit note"}
                        </span>
                        <div className="flex size-5 items-center justify-center rounded-full bg-[#1e3a8a] border border-[#3b82f6] text-[7px] font-bold text-white">FIN</div>
                      </div>
                    </div>
                  </div>

                  {/* Step 6 */}
                  <div className="flex items-start gap-5 relative z-10">
                    <div className={cn(
                      "flex size-6 items-center justify-center rounded-full border-2 shrink-0 border-dashed transition-all",
                      workflowStatus === "Approved"
                        ? "bg-[#050606] border-primary text-primary shadow-[0_0_10px_rgba(34,197,94,0.2)]"
                        : "bg-[#050606] border-warning text-warning shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    )}>
                      {workflowStatus === "Approved" ? <Check className="size-3.5 stroke-[3]" /> : <Clock className="size-3" />}
                    </div>
                    <div className="flex flex-col flex-1 pt-0.5">
                      <div className="flex items-start justify-between">
                        <span className={cn("text-xs font-bold", workflowStatus === "Approved" ? "text-primary" : "text-warning")}>Final Approval</span>
                        <span className="text-[10px] text-muted-foreground">—</span>
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[11px] text-muted-foreground font-medium">
                          {workflowStatus === "Approved" ? "Completed" : "Awaiting final approval"}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Section 3: Collaboration Summary */}
              <div className="px-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Collaboration Summary</h4>
                  <span className="text-[11px] font-semibold text-[#3b82f6] flex items-center cursor-pointer hover:text-[#60a5fa] transition-colors">Details <ChevronRight className="size-3.5 ml-0.5" /></span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#2C3842] bg-[#0A0C0B] p-4 hover:border-[#3C4852] transition-colors">
                    <div className="flex items-center gap-2 mb-3 text-white">
                      <LineChart className="size-3.5 opacity-60" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Invoice Value</span>
                    </div>
                    <span className="text-base font-bold text-white block tracking-tight">$12,485.00</span>
                  </div>
                  
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-[inset_0_0_20px_rgba(34,197,94,0.02)]">
                    <div className="flex items-center gap-2 mb-3 text-primary">
                      <ShieldCheck className="size-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Counterparty</span>
                    </div>
                    <span className="text-base font-bold text-primary block tracking-tight">Low Risk</span>
                  </div>
                  
                  <div className="rounded-xl border border-[#2C3842] bg-[#0A0C0B] p-4 hover:border-[#3C4852] transition-colors">
                    <div className="flex items-center gap-2 mb-3 text-[#3b82f6]">
                      <Clock className="size-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#3b82f6]/80">Response SLA</span>
                    </div>
                    <span className="text-base font-bold text-white block tracking-tight">2h 14m</span>
                  </div>
                  
                  <div className="rounded-xl border border-[#2C3842] bg-[#0A0C0B] p-4 hover:border-[#3C4852] transition-colors">
                    <div className="flex items-center gap-2 mb-3 text-white">
                      <Users className="size-3.5 opacity-60" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Businesses</span>
                    </div>
                    <span className="text-base font-bold text-white block tracking-tight">2 Linked</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </>
      ) : (
        /* Empty State for other tabs */
        <div className="flex-1 flex flex-col items-center justify-center bg-[#0A0C0B] relative z-20">
          <div className="flex flex-col items-center max-w-sm text-center">
            <div className="size-20 rounded-full bg-[#141B21] border border-[#1E2730] flex items-center justify-center mb-6">
              {activeTab === 'Inbox' && <Inbox className="size-8 text-muted-foreground" />}
              {activeTab === 'Tasks' && <CheckCircle2 className="size-8 text-muted-foreground" />}
              {activeTab === 'Workflows' && <RefreshCw className="size-8 text-muted-foreground" />}
              {activeTab === 'Calendar' && <Calendar className="size-8 text-muted-foreground" />}
              {activeTab === 'Files' && <FileText className="size-8 text-muted-foreground" />}
              {activeTab === 'Partners' && <Users className="size-8 text-muted-foreground" />}
              {activeTab === 'Analytics' && <LineChart className="size-8 text-muted-foreground" />}
              {activeTab === 'Settings' && <Settings className="size-8 text-muted-foreground" />}
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{activeTab}</h2>
            <p className="text-sm text-muted-foreground">
              This module is securely locked and accessible based on role permissions. Analytics data remains private to Your Company.
            </p>
            <button 
              onClick={() => setActiveTab("Chats")}
              className="mt-8 rounded-full bg-primary/10 border border-primary/30 text-primary px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-primary/20 transition-colors"
            >
              Return to Active Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
