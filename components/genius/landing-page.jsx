"use client";

import { useState, useEffect } from "react";
import { GeniusLogo } from "./logo";
import {
  ArrowRight, Check, ChevronRight, Shield, Lock, Zap,
  Upload, Search, TrendingDown, CheckSquare, FileText,
  BarChart2, BarChart3, Bot, Database, AlertTriangle, Eye,
  Star, Globe, Code, Users, Building2, DollarSign,
  ArrowUpRight, Play, Sparkles, ShieldCheck, Clock,
  ReceiptText, Activity, Target, RefreshCw, Package,
  MessageSquare, BookOpen, CloudUpload, FileCheck, FileSearch, UserCheck,
  LayoutGrid, Download, Brain, User, FileSpreadsheet,
  AtSign, Settings, ChevronDown, Bell, PiggyBank, ClipboardCheck, TrendingUp, Info, ArrowLeftFromLine, Cloud,
  Quote, Calendar, FileEdit, CheckCircle, Link, PieChart,
  FileCog, ListTodo, Pencil, XCircle, UserPlus, Send, ArrowDown,
  Fingerprint, ScanFace, KeyRound, ChevronLeft, X, Signal, Wifi, Battery, Cpu, EyeOff, Headphones, ShieldPlus, Rocket, Puzzle, Network, Store, Code2, Layers, LogOut
} from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buildSessionProfile } from "./identity-display";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ── Site Header ──────────────────────────────────────────────────────────────
function SiteHeader({ session, onEnter, onSignIn }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const sessionProfile = buildSessionProfile(session);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, { threshold: 0.3 });

    const sections = ['hero', 'ai-preview', 'how-it-works', 'command-center', 'proof-trails', 'approvals', 'agents', 'security', 'roadmap', 'trial-audit'];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  const navStructure = [
    {
      label: "Product",
      target: "command-center",
      dropdown: [
        { label: "Command Center", target: "command-center" },
        { label: "Proof Trails", target: "proof-trails" },
        { label: "Approvals", target: "approvals" },
        { label: "Trial Audit", target: "trial-audit" }
      ]
    },
    {
      label: "Solutions",
      target: "how-it-works",
      dropdown: [
        { label: "Finance Teams", target: "how-it-works" },
        { label: "Operations Teams", target: "how-it-works" },
        { label: "Procurement", target: "how-it-works" },
        { label: "RevOps", target: "how-it-works" }
      ]
    },
    { label: "Agents", target: "agents" },
    { label: "Security", target: "security" },
    { label: "Pricing", target: "trial-audit" },
    {
      label: "Resources",
      target: "trial-audit",
      dropdown: [
        { label: "Sample Report", target: "trial-audit" },
        { label: "Security Overview", target: "security" },
        { label: "Roadmap", target: "roadmap" },
        { label: "Contact Sales", target: "trial-audit" }
      ]
    }
  ];

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 flex items-center justify-between px-8 py-4 transition-all duration-300 ${scrolled ? 'bg-[#080A0E]/80 backdrop-blur-md border-b border-white/5' : 'bg-transparent border-transparent'}`}
        onMouseLeave={() => setActiveDropdown(null)}
      >
        <div className="flex items-center gap-3 w-[200px] cursor-pointer" onClick={() => scrollTo('hero')}>
          <GeniusLogo className="w-8 h-8 text-[#4EA1FF]" preload />
          <span className="text-xl font-bold tracking-tight text-white">GENIUS.</span>
        </div>

        <div className="hidden lg:flex items-center justify-center gap-8 text-sm font-medium flex-1 relative">
          {navStructure.map(item => (
            <div
              key={item.label}
              className="relative py-4 cursor-pointer"
              onMouseEnter={() => setActiveDropdown(item.label)}
            >
              <span
                onClick={() => scrollTo(item.target)}
                className={`flex items-center gap-1 transition-colors ${activeSection === item.target || activeDropdown === item.label ? 'text-white' : 'text-[#778493] hover:text-white'}`}
              >
                {item.label}
                {item.dropdown && <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === item.label ? 'rotate-180' : ''}`} />}
              </span>

              {/* Dropdown Panel */}
              {item.dropdown && activeDropdown === item.label && (
                <div className="absolute top-[80%] left-1/2 -translate-x-1/2 w-48 pt-2">
                   <div className="bg-[#0E1116]/90 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-top-2 duration-200">
                     {item.dropdown.map(subItem => (
                       <div
                         key={subItem.label}
                         onClick={(e) => { e.stopPropagation(); scrollTo(subItem.target); }}
                         className="px-4 py-2.5 rounded-lg text-[#778493] hover:text-white hover:bg-white/5 transition-colors"
                       >
                         {subItem.label}
                       </div>
                     ))}
                   </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="hidden lg:flex items-center justify-end gap-5 w-auto">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer border-none bg-transparent outline-none">
                  <Avatar className="h-9 w-9 ring-1 ring-[#28313C] transition-colors hover:ring-white/20 bg-[#141A22]">
                    <AvatarFallback className="bg-transparent text-xs font-bold text-white">
                      {sessionProfile.initials}
                    </AvatarFallback>
                  </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#0B1021] border-[#28313C] text-white">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-0.5 leading-none">
                    <p className="font-medium text-sm">{sessionProfile.name}</p>
                    <p className="text-xs text-slate-400">{session.isGuest ? "Local guest mode" : sessionProfile.role}</p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-[#28313C]" />
                <DropdownMenuItem
                  onClick={onEnter}
                  className="cursor-pointer focus:bg-[#28313C] focus:text-white"
                >
                  <LayoutGrid className="mr-2 h-4 w-4 text-[#4EA1FF]" />
                  <span>Go to Workspace</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onSignIn}
                  className="cursor-pointer focus:bg-[#28313C] focus:text-white"
                >
                  <UserPlus className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Add account</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onSignIn}
                  className="cursor-pointer focus:bg-[#28313C] focus:text-white"
                >
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Switch account</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#28313C]" />
                <DropdownMenuItem
                  onClick={async () => {
                    await fetch("/api/auth/session", { method: "DELETE" });
                    window.location.reload();
                  }}
                  className="cursor-pointer focus:bg-red-500/20 focus:text-red-400 text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <button
                onClick={onSignIn}
                className="text-sm font-medium text-[#778493] hover:text-white transition-colors whitespace-nowrap"
              >
                Sign In
              </button>
              <button
                onClick={onEnter}
                className="group relative flex items-center gap-2 text-sm font-semibold text-white px-6 py-2.5 rounded-lg overflow-hidden transition-all hover:scale-105"
              >
                <div className="absolute inset-0 bg-[#4EA1FF] group-hover:bg-[#4EA1FF] transition-colors duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                <span className="relative z-10 whitespace-nowrap">Create Workspace</span>
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden flex items-center">
           <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white p-2">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <div className="space-y-1.5"><div className="w-6 h-0.5 bg-white"/><div className="w-6 h-0.5 bg-white"/><div className="w-6 h-0.5 bg-white"/></div>}
           </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#080A0E]/95 backdrop-blur-xl flex flex-col pt-24 px-8 pb-8 overflow-y-auto">
          <div className="flex flex-col gap-2 text-xl font-bold text-[#778493]">
             {navStructure.map(item => (
               <div key={item.label} className="flex flex-col">
                 <div
                   className="flex items-center justify-between py-4 border-b border-white/5 cursor-pointer"
                   onClick={() => item.dropdown ? (activeDropdown === item.label ? setActiveDropdown(null) : setActiveDropdown(item.label)) : scrollTo(item.target)}
                 >
                   <span className={`transition-colors ${activeSection === item.target ? 'text-white' : ''}`}>{item.label}</span>
                   {item.dropdown && <ChevronDown className={`w-5 h-5 transition-transform ${activeDropdown === item.label ? 'rotate-180' : ''}`} />}
                 </div>
                 {item.dropdown && activeDropdown === item.label && (
                   <div className="flex flex-col pl-4 py-2 border-b border-white/5 bg-white/5">
                      {item.dropdown.map(subItem => (
                        <div
                          key={subItem.label}
                          onClick={() => scrollTo(subItem.target)}
                          className="py-3 text-lg font-medium text-[#778493] hover:text-white"
                        >
                          {subItem.label}
                        </div>
                      ))}
                   </div>
                 )}
               </div>
             ))}
          </div>
          <div className="mt-auto pt-8 flex flex-col gap-4">
             <button
               onClick={() => { setMobileMenuOpen(false); onSignIn?.(); }}
               className="w-full py-4 text-center text-white font-bold bg-white/5 rounded-xl border border-white/10"
             >
               Sign In
             </button>
             <button onClick={() => { setMobileMenuOpen(false); onEnter(); }} className="w-full py-4 text-center text-white font-bold bg-[#4EA1FF] rounded-xl">Create Workspace</button>
          </div>
        </div>
      )}
    </>
  );
}

// ── Section 1: Hero ──────────────────────────────────────────────────────────
function HeroSection({ onEnter }) {
  const [chatInput, setChatInput] = useState("");
  const questions = [
    "Where are we overspending?",
    "Show renewal risks",
    "What subscriptions are unused?",
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  const sparklineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    show: { pathLength: 1, opacity: 1, transition: { duration: 1.5, ease: "easeOut", delay: 1.5 } }
  };

  return (
    <section id="hero" className="bg-transparent relative overflow-hidden min-h-[920px] flex flex-col bg-[#080A0E]">
      {/* Animated Ambient Parallax Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#080A0E]">
        {/* Deep background glow */}
        <motion.div
          animate={{ opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(11,107,255,0.08)_0%,transparent_100%)]"
        />
        {/* Massive primary blue orb */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2], rotate: [0, 90, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(circle,rgba(11,107,255,0.2)_0%,transparent_70%)] blur-[140px]"
        />
        {/* Floating cyan orb */}
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0.3, 0.15], x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle,rgba(78,161,255,0.15)_0%,transparent_70%)] blur-[120px]"
        />
        {/* Deep violet accent orb */}
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.25, 0.1], x: [0, -80, 0], y: [0, 60, 0] }}
          transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.15)_0%,transparent_70%)] blur-[130px]"
        />
        {/* Soft sweeping light beam */}
        <motion.div
          animate={{ rotate: [0, 15, 0, -15, 0], opacity: [0, 0.15, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[50%] left-[20%] w-[20vw] h-[200vh] bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.03)_50%,transparent_100%)] blur-2xl transform origin-top"
        />
      </div>



      {/* Hero content */}
      <div className="relative z-10 flex flex-col pt-32 pb-16 w-[92vw] max-w-[1680px] mx-auto flex-1 justify-center">

        {/* 42/58 Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-[42%_58%] gap-12 xl:gap-[60px] items-center mb-16">

          {/* Left Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col pr-4"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#4EA1FF]/30 bg-[#4EA1FF]/10 text-xs font-medium tracking-wide text-[#7CC7FF] mb-8 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4EA1FF] animate-pulse shadow-[0_0_8px_#4EA1FF]" />
              AI-Powered Operations Workspace
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl lg:text-[56px] leading-[1.1] font-bold text-white mb-6 tracking-tight">
              Find where your<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#4EA1FF] via-[#7CC7FF] to-[#7CC7FF]">business is</span><br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#4EA1FF] via-[#7CC7FF] to-[#7CC7FF]">losing money.</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-[#778493] text-lg leading-relaxed mb-10 xl:pr-4">
              GENIUS turns fragmented business data into found profit — proving every insight with source evidence, preparing the next action, and keeping humans in control.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 mb-10">
              <button
                onClick={onEnter}
                className="group relative flex items-center gap-2 bg-[#4EA1FF] text-white font-semibold px-6 py-3.5 rounded-lg transition-all hover:scale-105 overflow-hidden shadow-[0_0_30px_rgba(11,107,255,0.3)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                Create Workspace <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group flex items-center gap-2 text-sm font-medium text-white transition-all px-5 py-3.5 border border-white/10 rounded-lg hover:bg-white/5 hover:border-white/20">
                <Play className="w-3.5 h-3.5 text-white" fill="currentColor" />
                See How It Works
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-6 text-[13px] text-[#778493] mb-12">
              <span className="flex items-center gap-2"><Check className="w-4 h-4 text-[#4EA1FF]" /> Approval-first</span>
              <span className="flex items-center gap-2"><Check className="w-4 h-4 text-[#4EA1FF]" /> Evidence-backed</span>
              <span className="flex items-center gap-2"><Check className="w-4 h-4 text-[#4EA1FF]" /> Built for finance and operations teams</span>
            </motion.div>

            {/* AI Chat Teaser */}
            <motion.div variants={itemVariants} className="rounded-xl border border-white/10 bg-[#0E1116]/80 p-5 backdrop-blur-md relative overflow-hidden group">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#778493] mb-4">
                <Sparkles className="w-3.5 h-3.5 text-[#4EA1FF]" />
                Ask GENIUS about business operations
              </div>

              <div className="flex items-center gap-3 bg-[#080A0E] border border-white/10 rounded-lg px-4 py-3 mb-4 group-hover:border-[#4EA1FF]/30 group-hover:shadow-[0_0_15px_rgba(11,107,255,0.1)] transition-all">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Ask where your business may be losing money..."
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-[#778493]/60 outline-none"
                />
                <ArrowRight className="w-4 h-4 text-[#4EA1FF]" />
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {questions.map(q => (
                  <button
                    key={q}
                    onClick={() => setChatInput(q)}
                    className="text-[11px] px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 text-[#778493] hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
              <div className="flex items-start gap-2 text-[10px] text-[#778493]/70">
                <Lock className="w-3 h-3 shrink-0 mt-0.5" />
                <p>Preview general answers instantly. Analyze your company data and unlock deeper insights with an account.</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full min-h-[640px] rounded-[24px] border border-white/10 bg-[#080A0E] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden flex flex-col group relative"
          >
            {/* Premium glossy reflection overlay */}
            <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none z-0" />

            {/* Dashboard header */}
            <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#080A0E]/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#EF4444]/80 border border-white/10" />
                  <div className="w-3 h-3 rounded-full bg-[#F59E0B]/80 border border-white/10" />
                  <div className="w-3 h-3 rounded-full bg-[#22C55E]/80 border border-white/10" />
                </div>
                <span className="text-[14px] font-semibold text-white/90 ml-2 tracking-wide">Command Center</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[#778493] cursor-pointer hover:bg-white/10 transition-colors shadow-sm">
                May 1 – May 31, 2024 <ChevronDown className="w-3 h-3" />
              </div>
            </div>

            {/* KPIs Grid */}
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 gap-px bg-white/5 border-b border-white/5">
              {[
                { label: "Money at Risk", value: "$2.48M", change: "+18% vs last month", color: "text-[#EF4444]", icon: AlertTriangle, lineColor: "#EF4444" },
                { label: "Savings Potential", value: "$1.32M", change: "+25% vs last month", color: "text-[#7CC7FF]", icon: DollarSign, lineColor: "#7CC7FF" },
                { label: "Evidence Coverage", value: "92%", change: "+17% vs Apr 1–Apr 30", color: "text-[#4EA1FF]", icon: FileSearch, lineColor: "#4EA1FF" },
                { label: "Open Approvals", value: "23", change: "+8% vs last month", color: "text-white", icon: CheckCircle, lineColor: "#22C55E" },
                { label: "AI Confidence", value: "87%", change: "+6% vs last month", color: "text-white", icon: Sparkles, lineColor: "#7CC7FF" },
                { label: "Active Agents", value: "14", change: "+3 vs last month", color: "text-white", icon: UserPlus, lineColor: "#7CC7FF" },
              ].map((kpi, i) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + (i * 0.1) }}
                  key={kpi.label}
                  className="bg-[#0E1116] p-5 relative overflow-hidden group/card hover:bg-[#141A22] transition-colors cursor-pointer flex flex-col justify-between h-[110px]"
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#778493] mb-2">
                      <kpi.icon className="w-3.5 h-3.5" /> {kpi.label}
                    </div>
                    <div className={`text-2xl font-bold ${kpi.color} mb-1 tracking-tight`}>{kpi.value}</div>
                    <div className="text-[10px] text-[#778493]">{kpi.change}</div>
                  </div>
                  {/* Sparkline */}
                  <div className="absolute bottom-4 right-4 w-16 h-6">
                    <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                      <motion.path
                        variants={sparklineVariants}
                        initial="hidden"
                        animate="show"
                        d={[
                          "M0,25 L20,15 L40,18 L60,10 L80,12 L100,5",
                          "M0,28 L20,20 L40,12 L60,15 L80,8 L100,2",
                          "M0,20 L20,22 L40,15 L60,18 L80,10 L100,4",
                          "M0,30 L20,25 L40,15 L60,10 L80,12 L100,6",
                          "M0,22 L20,18 L40,25 L60,12 L80,8 L100,3",
                          "M0,26 L20,18 L40,20 L60,15 L80,12 L100,8"
                        ][i % 6]}
                        fill="none"
                        stroke={kpi.lineColor}
                        strokeWidth="1.5"
                        vectorEffect="non-scaling-stroke"
                        className="opacity-70"
                      />
                    </svg>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Dashboard Lower Split */}
            <div className="relative z-10 flex-1 flex flex-col xl:flex-row overflow-hidden bg-[#080A0E]">
              {/* Left: Table */}
              <div className="flex-[55%] p-5 border-b xl:border-b-0 xl:border-r border-white/5 flex flex-col bg-[#080A0E]">
                <div className="text-[12px] font-semibold text-white/90 mb-4 tracking-wide">Top Risks & Opportunities</div>

                {/* Table Header */}
                <div className="flex items-center gap-2 text-[10px] text-[#778493] font-medium pb-2 border-b border-white/5 mb-3 px-2">
                  <span className="flex-1">Risk / Opportunity</span>
                  <span className="w-16 hidden sm:block">Category</span>
                  <span className="w-16">Exposure</span>
                  <span className="w-16 hidden sm:block">Impact</span>
                  <span className="w-16 hidden sm:block">Confidence</span>
                  <span className="w-20">Priority</span>
                </div>

                <div className="space-y-1">
                  {[
                    { name: "Contract auto-renewal – Acme Software", cat: "SaaS", exp: "$442K", imp: "High", conf: "92%", status: "At Risk", statusColor: "text-[#EF4444]" },
                    { name: "Unused SaaS licenses – 47 seats", cat: "SaaS", exp: "$85K", imp: "High", conf: "95%", status: "Opportunity", statusColor: "text-[#7CC7FF]" },
                    { name: "Duplicate vendor payment", cat: "Finance", exp: "$156K", imp: "Med", conf: "96%", status: "Investigate", statusColor: "text-[#F59E0B]" },
                    { name: "Add spend to contract ROI", cat: "Marketing", exp: "$122K", imp: "Med", conf: "94%", status: "Review", statusColor: "text-[#778493]" },
                    { name: "Cloud instance rightsizing", cat: "Cloud", exp: "$210K", imp: "High", conf: "90%", status: "Opportunity", statusColor: "text-[#7CC7FF]" },
                  ].map((row, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 + (i * 0.1) }}
                      key={i}
                      className="flex items-center gap-2 text-[11px] p-2 rounded hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <span className="text-white truncate flex-1">{row.name}</span>
                      <span className="text-[#778493] w-16 hidden sm:block">{row.cat}</span>
                      <span className="text-white w-16 font-medium">{row.exp}</span>
                      <span className="text-[#778493] w-16 hidden sm:block">{row.imp}</span>
                      <span className="text-[#778493] w-16 hidden sm:block">{row.conf}</span>
                      <span className={`${row.statusColor} w-20 font-medium`}>{row.status}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-auto pt-4">
                  <button className="text-[11px] text-[#4EA1FF] hover:text-[#7CC7FF] transition-colors flex items-center gap-1">
                    View all findings <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Right: Approval Queue */}
              <div className="flex-[45%] bg-[#0E1116] p-5 flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[11px] font-semibold text-white">Approval Queue</span>
                  <span className="bg-white/10 text-[10px] text-white px-2 py-0.5 rounded">23</span>
                </div>

                <div className="space-y-4">
                  {[
                    { id: 1, name: "Acme Software Renewal", meta: "Auto-renews Jun 15, 2024", tag: "Contract", amount: "$442K at risk", conf: "92%", amountColor: "text-[#EF4444]" },
                    { id: 2, name: "Unused SaaS Licenses", meta: "47 seats across 6 tools", tag: "SaaS", amount: "$85K savings", conf: "95%", amountColor: "text-[#7CC7FF]" },
                    { id: 3, name: "Duplicate Vendor Payment", meta: "Paid twice on Apr 28, 2024", tag: "Finance", amount: "$156K", conf: "96%", amountColor: "text-[#F59E0B]" },
                  ].map((item, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.5 + (i * 0.15) }}
                      key={item.id}
                      className="border-b border-white/5 pb-4 last:border-0 last:pb-0 group/approval"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-3">
                          <span className="w-5 h-5 rounded-full bg-[#4EA1FF]/20 text-[#4EA1FF] text-[9px] flex items-center justify-center font-bold mt-0.5 shrink-0">{item.id}</span>
                          <div>
                            <div className="text-[11px] text-white font-medium mb-1">{item.name}</div>
                            <div className="flex items-center gap-2 text-[9px] text-[#778493]">
                              <span>{item.meta}</span>
                              <span className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5">{item.tag}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold ${item.amountColor}`}>{item.amount}</span>
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-[#778493] mb-1.5 px-8">
                        <span>AI Confidence</span>
                        <span>{item.conf}</span>
                      </div>
                      <div className="w-auto ml-8 h-1 bg-white/5 rounded-full overflow-hidden mb-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: item.conf }}
                          transition={{ duration: 1, delay: 1.8 + (i * 0.1) }}
                          className="h-full bg-gradient-to-r from-[#4EA1FF] to-[#7CC7FF]"
                        />
                      </div>

                      <button className="w-[calc(100%-32px)] ml-8 text-[10px] py-1.5 rounded border border-[#4EA1FF]/30 text-white bg-[#4EA1FF]/10 hover:bg-[#4EA1FF]/20 transition-colors opacity-0 group-hover/approval:opacity-100 transform translate-y-2 group-hover/approval:translate-y-0 duration-200">
                        Review
                      </button>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-auto pt-4 text-left border-t border-white/5">
                  <button className="text-[10px] text-[#4EA1FF] hover:text-[#7CC7FF] transition-colors flex items-center gap-1">
                    View all approvals <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Bottom Feature Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 rounded-2xl border border-white/5 bg-[#0E1116]/50 backdrop-blur-sm shadow-xl"
        >
          {[
            { icon: Target, title: "Detect leakage faster", desc: "AI scans all financial, contracts, and usage data to surface hidden risks and savings." },
            { icon: ShieldCheck, title: "Prove findings with source evidence", desc: "Every insight is linked to underlying documents and transactions you can trust and verify." },
            { icon: UserCheck, title: "Approve actions safely", desc: "Built-in approval workflows and audit trails ensure control, compliance, and accountability." },
            { icon: BarChart3, title: "Board-ready reporting", desc: "Clear, concise reports and KPIs that demonstrate impact and drive better decisions." },
          ].map(feature => (
            <div key={feature.title} className="flex gap-4 group p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-[#4EA1FF]/20 transition-all cursor-pointer">
              <div className="w-11 h-11 rounded-lg bg-[#080A0E] border border-white/10 flex items-center justify-center shrink-0 group-hover:border-[#4EA1FF]/40 group-hover:shadow-[0_0_15px_rgba(11,107,255,0.2)] transition-all">
                <feature.icon className="w-5 h-5 text-[#4EA1FF]" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-white mb-1.5 group-hover:text-[#7CC7FF] transition-colors">{feature.title}</h4>
                <p className="text-[11px] text-[#778493] leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}

// ── Section 2: AI Teaser ─────────────────────────────────────────────────────
function AITeaserSection({ onEnter }) {
  const [chatInput, setChatInput] = useState("");
  const questions = [
    "Where are we overspending?",
    "Show renewal risks",
    "What subscriptions are unused?",
  ];

  const capabilities = [
    { icon: FileText, label: "Analyze company documents", desc: "Extract data from invoices, contracts, spreadsheets, and reports." },
    { icon: ReceiptText, label: "Detect duplicate payments", desc: "Find overpayments, billing issues, and suspicious vendor records." },
    { icon: RefreshCw, label: "Find renewal risks", desc: "Catch auto-renewals, contract gaps, and missed negotiation windows." },
    { icon: Package, label: "Build savings proof pack", desc: "Create board-ready reports backed by source evidence." },
    { icon: ShieldCheck, label: "Prepare approval-safe actions", desc: "AI drafts actions, but humans approve before execution." },
  ];

  const answerText = "Common leakage areas include unused SaaS licenses, duplicate invoices, missed renewal windows, vendor overbilling, and ad spend without clear ROI. Create a workspace to connect your own data and receive evidence-backed findings.";

  return (
    <section id="ai-preview" className="bg-transparent py-24 md:py-32 xl:py-40 relative min-h-[760px] flex items-center bg-[#080A0E] overflow-hidden border-t border-white/5">
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Ambient Glow */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.15 }}
          viewport={{ once: true }}
          transition={{ duration: 2 }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(11,107,255,0.1)_0%,transparent_100%)]"
        />
        {/* Radial Orbs behind right side */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,rgba(11,107,255,0.15)_0%,transparent_70%)] blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.1)_0%,transparent_70%)] blur-[120px]"
        />
        {/* Faint cinematic light beam */}
        <motion.div
          animate={{ rotate: [15, 25, 15], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[30%] right-[20%] w-[30vw] h-[150vh] bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.03)_50%,transparent_100%)] blur-3xl transform origin-top"
        />
      </div>

      <div className="relative z-10 w-[92vw] max-w-[1680px] mx-auto flex flex-col gap-12">
        <div className="grid grid-cols-1 lg:grid-cols-[46%_54%] gap-16 items-center">

          {/* Left Column */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.15 } }
            }}
            className="flex flex-col pr-8"
          >
            <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-[11px] font-semibold tracking-wide text-[#778493] mb-6 w-fit">
              <Sparkles className="w-3.5 h-3.5 text-[#4EA1FF]" /> AI Preview
            </motion.div>

            <motion.h2 variants={{ hidden: { filter: "blur(10px)", opacity: 0, y: 20 }, show: { filter: "blur(0px)", opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: "easeOut" }} className="text-4xl lg:text-[42px] font-bold text-white leading-[1.1] mb-5 tracking-tight">
              Ask first. Unlock deeper<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#4EA1FF] via-[#7CC7FF] to-[#7CC7FF]">analysis with your workspace.</span>
            </motion.h2>

            <motion.p variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="text-[#778493] text-[15px] leading-relaxed mb-10">
              GENIUS can explain common business risks instantly. To analyze your real invoices, contracts, spreadsheets, CRM exports, and ad reports, create a secure workspace.
            </motion.p>

            {/* AI Preview Card */}
            <motion.div variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: "easeOut" }} className="rounded-2xl border border-white/10 bg-[#0E1116]/80 backdrop-blur-xl shadow-2xl p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#4EA1FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-[#778493] uppercase mb-6">
                <Sparkles className="w-4 h-4 text-[#4EA1FF]" />
                Ask GENIUS about business operations
              </div>

              {/* User Question */}
              <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }} className="flex items-center gap-4 bg-[#141A22] border border-white/5 rounded-xl px-4 py-3 mb-4 group-hover:border-[#4EA1FF]/20 transition-all">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                  <User className="w-4 h-4 text-[#778493]" />
                </div>
                <input
                  readOnly
                  value="Where could a B2B company be losing money?"
                  className="flex-1 bg-transparent text-[13px] text-white outline-none cursor-default"
                />
                <Send className="w-4 h-4 text-[#4EA1FF]" />
              </motion.div>

              {/* AI Answer with streaming effect */}
              <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="flex items-start gap-4 bg-[#080A0E] border border-white/5 rounded-xl px-5 py-4 mb-6 shadow-inner">
                <div className="w-8 h-8 rounded-lg bg-[#4EA1FF]/10 flex items-center justify-center shrink-0 border border-[#4EA1FF]/20 mt-0.5">
                  <Sparkles className="w-4 h-4 text-[#4EA1FF]" />
                </div>
                <div className="flex-1 text-[13px] text-[#778493] leading-relaxed">
                  {answerText.split(" ").map((word, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.1, delay: 0.5 + (i * 0.03) }}
                      className="inline-block mr-1 text-white/90"
                    >
                      {word}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              <div className="flex flex-wrap gap-2 mb-6">
                {questions.map((q, i) => (
                  <motion.button
                    key={q}
                    variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }}
                    className="text-[11px] px-4 py-2 rounded-full border border-white/10 bg-[#141A22] text-[#778493] hover:text-white hover:bg-[#4EA1FF]/10 hover:border-[#4EA1FF]/30 transition-all font-medium flex items-center gap-1.5"
                  >
                    {q} <ArrowRight className="w-3 h-3" />
                  </motion.button>
                ))}
              </div>

              <div className="flex items-start gap-2 text-[11px] text-[#778493]/60 pt-4 border-t border-white/5">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 opacity-70" />
                <p>General answers are available instantly. Company-specific analysis requires a secure workspace.</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Locked Capabilities */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.4 } }
            }}
            className="flex flex-col"
          >
            <motion.h3 variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="text-[18px] font-bold text-white mb-6">
              Unlock full analysis with your workspace
            </motion.h3>

            <div className="flex flex-col gap-3">
              {capabilities.map((cap, i) => (
                <motion.div
                  key={cap.label}
                  variants={{ hidden: { opacity: 0, x: 40 }, show: { opacity: 1, x: 0 } }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-[#0E1116]/60 hover:bg-[#141A22]/80 hover:border-[#4EA1FF]/30 transition-all duration-300 group cursor-default hover:-translate-y-1 shadow-lg hover:shadow-[0_10px_30px_rgba(11,107,255,0.1)]"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 rounded-xl bg-[#4EA1FF]/10 border border-[#4EA1FF]/20 flex items-center justify-center shrink-0 group-hover:bg-[#4EA1FF]/20 transition-colors">
                      <cap.icon className="w-5 h-5 text-[#7CC7FF]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-white mb-1 group-hover:text-white transition-colors">{cap.label}</div>
                      <div className="text-[12px] text-[#778493]">{cap.desc}</div>
                    </div>
                  </div>
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                    className="pl-4 border-l border-white/5 ml-4"
                  >
                    <Lock className="w-4 h-4 text-[#778493]" />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* Bottom CTA Strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 1 }}
          className="w-full flex flex-col md:flex-row items-center justify-between gap-6 p-6 md:p-8 rounded-[24px] border border-white/10 bg-gradient-to-r from-[#0E1116] via-[#141A22] to-[#0E1116] shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#4EA1FF]/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-[#080A0E] border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
              <Shield className="w-6 h-6 text-[#4EA1FF]" />
            </div>
            <div>
              <div className="text-[15px] font-bold text-white mb-0.5">Your data. Your rules.</div>
              <div className="text-[12px] text-[#778493]">Private workspace. Full control.<br className="hidden md:block"/> No data shared. No AI training.</div>
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-3">
            <button
              onClick={onEnter}
              className="group/btn relative flex items-center justify-center gap-2 bg-[#4EA1FF] text-white font-bold px-8 py-4 rounded-xl transition-all hover:scale-[1.02] overflow-hidden shadow-[0_0_30px_rgba(11,107,255,0.3)] min-w-[280px]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#4EA1FF] to-[#4EA1FF] transition-colors" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />
              <Lock className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Create Workspace to Analyze Your Data</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="relative z-10 flex flex-col items-end gap-3 hidden lg:flex">
            <button className="text-[13px] font-semibold text-[#4EA1FF] hover:text-[#7CC7FF] transition-colors flex items-center gap-1.5">
              View Sample Analysis <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-4 text-[10px] text-[#778493]">
              <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" /> Secure<br/>workspace</div>
              <div className="flex items-center gap-1.5 border-l border-white/10 pl-4"><FileText className="w-3.5 h-3.5 text-[#778493]" /> Evidence-backed<br/>findings</div>
              <div className="flex items-center gap-1.5 border-l border-white/10 pl-4"><User className="w-3.5 h-3.5 text-[#778493]" /> Human approval<br/>required</div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

// ── Section 3: How It Works ──────────────────────────────────────────────────
// ── Section 3: How It Works ──────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    { num: "1", icon: CloudUpload, label: "Upload or connect data", desc: "Invoices, contracts, spreadsheets, CRM exports, ad reports, vendor files, SaaS data, and more.", status: "Connected" },
    { num: "2", icon: FileCheck, label: "Extract and validate evidence", desc: "GENIUS structures data, detects missing fields, and links every item back to source evidence.", status: "Validated" },
    { num: "3", icon: FileSearch, label: "Detect leakage and risks", desc: "Diagnostics identify duplicate payments, unused licenses, renewal risks, invoice mismatches, and inefficient spend.", status: "Identified" },
    { num: "4", icon: BarChart3, label: "Rank opportunities", desc: "Savings Radar prioritizes findings by impact, confidence, urgency, and ease of action.", status: "Prioritized" },
    { num: "5", icon: UserCheck, label: "Approve safe actions", desc: "AI agents prepare next steps, but humans approve before anything happens.", status: "Approved" },
  ];

  return (
    <section id="how-it-works" className="bg-transparent py-24 md:py-32 xl:py-40 relative min-h-[850px] bg-[#080A0E] overflow-hidden border-t border-white/5">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Central glow */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.15 }}
          viewport={{ once: true }}
          transition={{ duration: 2 }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(11,107,255,0.12)_0%,transparent_100%)]"
        />
        {/* Left and Right orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[-15%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle,rgba(11,107,255,0.15)_0%,transparent_70%)] blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          className="absolute bottom-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.1)_0%,transparent_70%)] blur-[130px]"
        />
        {/* Faint side beams */}
        <motion.div
          animate={{ rotate: [10, 20, 10], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[50%] -left-[10%] w-[20vw] h-[150vh] bg-[linear-gradient(90deg,transparent_0%,rgba(78,161,255,0.03)_50%,transparent_100%)] blur-3xl transform origin-top"
        />
        {/* Subtle light lines near bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[20vh] bg-[radial-gradient(ellipse_at_bottom,rgba(11,107,255,0.1)_0%,transparent_70%)] blur-2xl" />
      </div>

      <div className="relative z-10 w-[92vw] max-w-[1680px] mx-auto flex flex-col items-center">

        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.2 } }
          }}
          className="text-center mb-24 flex flex-col items-center"
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-[11px] font-semibold tracking-widest text-[#778493] uppercase mb-8">
            How GENIUS Works
          </motion.div>

          <motion.h2 variants={{ hidden: { filter: "blur(10px)", opacity: 0, y: 20 }, show: { filter: "blur(0px)", opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: "easeOut" }} className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6 tracking-tight">
            From fragmented data to<br className="hidden md:block" /> approved <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#4EA1FF] via-[#7CC7FF] to-[#7CC7FF]">business action</span>
          </motion.h2>

          <motion.p variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="text-[#778493] text-[16px] max-w-3xl mx-auto leading-relaxed">
            GENIUS connects business data, extracts evidence, identifies financial leakage, and prepares actions that humans approve.
          </motion.p>
        </motion.div>

        {/* 5-Step Workflow */}
        <div className="w-full relative mb-24">
          {/* Animated Connecting Line */}
          <div className="absolute top-5 left-[10%] right-[10%] h-[2px] bg-white/5 z-0 hidden lg:block">
            <motion.div
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
              className="h-full bg-gradient-to-r from-[#4EA1FF] via-[#7CC7FF] to-[#7CC7FF] relative"
            >
              <motion.div
                animate={{ opacity: [0, 1, 0], x: [0, 200, 400] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-[2px] bg-white blur-[2px]"
              />
            </motion.div>
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 1 } }
            }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-6"
          >
            {steps.map((step, i) => (
              <div key={step.num} className="relative flex flex-col items-center group/step">
                {/* Number Node */}
                <motion.div
                  variants={{ hidden: { opacity: 0, scale: 0 }, show: { opacity: 1, scale: 1 } }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-10 h-10 rounded-full bg-[#080A0E] border-2 border-[#4EA1FF] text-white flex items-center justify-center text-sm font-bold z-10 mb-8 shadow-[0_0_20px_rgba(11,107,255,0.4)]"
                >
                  {step.num}
                </motion.div>

                {/* Glass Card */}
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center text-center p-6 rounded-2xl border border-white/5 bg-[#080A0E]/90 backdrop-blur-md w-full h-full hover:border-[#4EA1FF]/30 transition-all z-10 group shadow-2xl shadow-black/50 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(11,107,255,0.1)] relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

                  <div className="mb-5 relative">
                    <div className="absolute inset-0 bg-[#4EA1FF]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <step.icon className="w-8 h-8 text-[#7CC7FF] relative z-10 stroke-[1.5]" />
                  </div>
                  <div className="text-[15px] font-bold text-white mb-3 tracking-wide">{step.label}</div>
                  <div className="text-[13px] text-[#778493] leading-relaxed mb-6 flex-1">{step.desc}</div>

                  {/* Status Pill */}
                  <motion.div
                    variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }}
                    className="mt-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#4EA1FF]/10 border border-[#4EA1FF]/20 text-[#7CC7FF] text-[11px] font-semibold tracking-wide shadow-[0_0_10px_rgba(11,107,255,0)] group-hover:shadow-[0_0_10px_rgba(11,107,255,0.2)] transition-shadow"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {step.status}
                  </motion.div>
                </motion.div>

                {/* Arrow connecting to next card (mobile only, visible when stacked) */}
                {i < steps.length - 1 && (
                  <div className="lg:hidden mt-6 mb-2">
                    <ChevronDown className="w-5 h-5 text-[#4EA1FF]/50" />
                  </div>
                )}

                {/* Side Arrow (Desktop) */}
                {i < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 2.5 + (i * 0.2) }}
                    className="hidden lg:block absolute -right-5 top-[60%] -translate-y-1/2 z-20"
                  >
                    <ChevronRight className="w-5 h-5 text-[#4EA1FF] opacity-50 group-hover/step:opacity-100 transition-opacity" />
                  </motion.div>
                )}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom Trust Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 2.5 }}
          className="w-full flex flex-col xl:flex-row items-center justify-between gap-10 p-8 md:p-10 rounded-[24px] border border-white/10 bg-gradient-to-r from-[#0E1116] via-[#141A22] to-[#0E1116] shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#4EA1FF]/5 via-transparent to-[#7CC7FF]/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

          <div className="flex items-center gap-6 relative z-10 max-w-2xl">
            <div className="w-16 h-16 rounded-2xl bg-[#080A0E] border border-white/10 flex items-center justify-center shrink-0 shadow-inner group-hover:border-[#4EA1FF]/30 transition-colors">
              <ShieldCheck className="w-8 h-8 text-[#4EA1FF]" />
            </div>
            <div>
              <div className="text-[20px] font-bold text-white mb-2">No source = no trusted finding.</div>
              <div className="text-[14px] text-[#778493] leading-relaxed">
                Every insight is backed by source evidence your team can review, verify, and trust.
              </div>
            </div>
          </div>

          <div className="relative z-10 flex flex-wrap lg:flex-nowrap items-center gap-6 xl:gap-8">
            {[
              { icon: FileText, label: "Source-backed evidence" },
              { icon: UserCheck, label: "Human approval required" },
              { icon: Lock, label: "Enterprise-grade security" }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-3 text-center">
                <div className="w-10 h-10 rounded-lg bg-[#080A0E] border border-white/10 flex items-center justify-center group-hover:bg-[#4EA1FF]/10 transition-colors">
                  <item.icon className="w-4 h-4 text-[#778493] group-hover:text-[#7CC7FF] transition-colors" />
                </div>
                <span className="text-[12px] text-[#778493] font-medium max-w-[100px] leading-tight">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}

// ── Section 4: Platform Modules (Operations Terminal) ────────────────────────
function PlatformModulesSection({ onEnter }) {
  const dashStagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemFade = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

  return (
    <section id="command-center" className="bg-transparent py-24 md:py-32 xl:py-40 relative min-h-[1200px] bg-[#080A0E] overflow-hidden border-t border-white/5">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Soft animated ambient glow */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 0.15 }} viewport={{ once: true }} transition={{ duration: 2 }} className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(11,107,255,0.15)_0%,transparent_100%)]" />

        {/* Lower Left light beam */}
        <motion.div animate={{ rotate: [-5, -10, -5], opacity: [0.03, 0.08, 0.03] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }} className="absolute -bottom-[50%] left-[-15%] w-[40vw] h-[150vh] bg-[linear-gradient(90deg,transparent_0%,rgba(11,107,255,0.1)_50%,transparent_100%)] blur-[100px] transform origin-bottom" />

        {/* Lower Right light beam */}
        <motion.div animate={{ rotate: [5, 10, 5], opacity: [0.03, 0.08, 0.03] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute -bottom-[50%] right-[-15%] w-[40vw] h-[150vh] bg-[linear-gradient(90deg,transparent_0%,rgba(139,92,246,0.1)_50%,transparent_100%)] blur-[100px] transform origin-bottom" />

        {/* Gentle radial glow behind the dashboard */}
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[35%] left-[25%] w-[50vw] h-[50vh] rounded-full bg-[radial-gradient(circle,rgba(78,161,255,0.1)_0%,transparent_70%)] blur-[120px]" />
      </div>

      <div className="relative z-10 w-[92vw] max-w-[1792px] mx-auto flex flex-col items-center">

        {/* Header */}
        <motion.div initial={{ filter: "blur(10px)", opacity: 0, y: 20 }} whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="text-center mb-16 flex flex-col items-center">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-white/10 bg-[#4EA1FF]/5 text-[11px] font-bold tracking-widest text-[#7CC7FF] uppercase mb-8 shadow-[0_0_20px_rgba(11,107,255,0.1)]">
            WHY GENIUS IS DIFFERENT
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6 tracking-tight">
            A real <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#4EA1FF] via-[#7CC7FF] to-[#7CC7FF]">operations terminal</span>,<br className="hidden md:block" /> not a toy dashboard.
          </h2>
          <p className="text-[#778493] text-[16px] max-w-4xl mx-auto leading-relaxed">
            The GENIUS Command Center gives operators a live workspace to detect financial leakage, validate evidence, review priorities, and route sensitive actions through human approval.
          </p>
        </motion.div>

        {/* Massive Dashboard UI Container */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="w-full bg-[#080A0E]/90 backdrop-blur-xl border border-[#28313C]/80 rounded-[20px] shadow-[0_40px_100px_-20px_rgba(11,107,255,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] flex flex-col overflow-hidden mb-12 hover:shadow-[0_40px_120px_-20px_rgba(11,107,255,0.25)] transition-shadow duration-500"
        >
          {/* Dashboard Header Bar & Sidebar Layout */}
          <div className="flex w-full min-h-[850px]">

            {/* Left Sidebar */}
            <div className="w-64 border-r border-[#28313C]/80 bg-[#080A0E]/60 flex flex-col p-4 shrink-0 relative">
              <div className="flex items-center gap-2 px-2 mb-10 mt-2">
                <GeniusLogo className="w-7 h-7 text-white" />
                <span className="font-bold text-lg text-white tracking-tight">GENIUS</span>
              </div>

              <div className="flex flex-col gap-1 flex-1">
                {[
                  { icon: LayoutGrid, label: "Command Center", active: true },
                  { icon: CloudUpload, label: "Data Intake" },
                  { icon: Activity, label: "Diagnostics" },
                  { icon: Target, label: "Savings Radar" },
                  { icon: Brain, label: "AI Workbench" },
                  { icon: Bot, label: "AI Agents" },
                  { icon: ShieldCheck, label: "Approvals / Vault" },
                  { icon: FileText, label: "Reports" }
                ].map((nav, i) => (
                  <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium cursor-pointer transition-colors ${nav.active ? 'bg-[#4EA1FF]/10 text-[#7CC7FF] shadow-[inset_2px_0_0_#7CC7FF]' : 'text-[#778493] hover:text-white hover:bg-white/5'}`}>
                    <nav.icon className={`w-4 h-4 ${nav.active ? 'text-[#7CC7FF]' : 'text-[#778493]'}`} />
                    {nav.label}
                  </div>
                ))}
              </div>

              <div className="mt-auto border-t border-[#28313C]/80 pt-4">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium text-[#778493] hover:text-white hover:bg-white/5 cursor-pointer transition-colors">
                  <ArrowLeftFromLine className="w-4 h-4" />
                  Collapse
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top,rgba(11,107,255,0.05)_0%,transparent_50%)]">

              {/* Top Header */}
              <div className="h-16 border-b border-[#28313C]/80 flex items-center justify-between px-6 bg-[#080A0E]/40 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-6">
                  <h1 className="text-xl font-semibold text-white tracking-tight">Command Center</h1>
                </div>

                <div className="flex items-center gap-4 text-[13px]">
                  <div className="flex items-center gap-2 text-[#778493] cursor-pointer hover:text-white transition-colors">
                    Workspace: <span className="text-white font-medium">Acme Global Workspace</span> <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                  <div className="w-[1px] h-4 bg-[#28313C]" />
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#080A0E] border border-[#28313C] text-[#778493] cursor-pointer hover:border-[#7CC7FF]/50 transition-colors">
                    <Calendar className="w-3.5 h-3.5" /> May 1 – May 31, 2025 <ChevronDown className="w-3 h-3 ml-1" />
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <div className="relative group">
                    <Search className="w-4 h-4 text-[#778493] absolute left-3 top-1/2 -translate-y-1/2 group-hover:text-[#7CC7FF] transition-colors" />
                    <input type="text" placeholder="Search findings, vendors, invoices..." className="w-[280px] bg-[#080A0E] border border-[#28313C] rounded-full py-1.5 pl-9 pr-4 text-[13px] text-white placeholder-[#778493] focus:outline-none focus:border-[#7CC7FF] focus:ring-1 focus:ring-[#7CC7FF] transition-all" />
                  </div>

                  <div className="relative cursor-pointer">
                    <Bell className="w-5 h-5 text-[#778493] hover:text-white transition-colors" />
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#EF4444] rounded-full border-2 border-[#080A0E] flex items-center justify-center text-[9px] font-bold text-white">3</div>
                  </div>

                  <div className="flex items-center gap-2 cursor-pointer group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4EA1FF] to-[#7CC7FF] flex items-center justify-center text-white text-xs font-bold shadow-md">
                      AV
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-semibold text-white leading-tight group-hover:text-[#7CC7FF] transition-colors">Ava Nguyen</span>
                      <span className="text-[11px] text-[#778493] leading-tight">Operator</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-[#778493] ml-1" />
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">

                {/* KPI Cards */}
                <motion.div variants={dashStagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                  {[
                    { label: "Money at Risk", value: "$2.48M", trend: "↑ 18%", trendText: "vs Apr 1 - Apr 30", isPositive: false, color: "#EF4444" },
                    { label: "Savings Potential", value: "$1.32M", trend: "↑ 24%", trendText: "vs Apr 1 - Apr 30", isPositive: true, color: "#22C55E" },
                    { label: "Evidence Coverage", value: "92%", trend: "↑ 6pp", trendText: "vs Apr 1 - Apr 30", isPositive: true, color: "#7CC7FF" },
                    { label: "Open Approvals", value: "23", trend: "↑ 5", trendText: "vs Apr 1 - Apr 30", isPositive: false, color: "#F59E0B" },
                    { label: "AI Confidence", value: "87%", trend: "↑ 10pp", trendText: "vs Apr 1 - Apr 30", isPositive: true, color: "#7CC7FF" },
                    { label: "Active Agents", value: "14", trend: "↑ 2", trendText: "new this week", isPositive: true, color: "#4EA1FF" }
                  ].map((kpi, i) => {
                    const seed = i * 42;
                    const pathData = `M 0,${20 + (seed % 10)} Q 15,${5 + (seed % 15)} 25,${15 + (seed % 10)} T 50,${10 + (seed % 5)} T 75,${20 + (seed % 15)} T 100,${5 + (seed % 5)}`;
                    return (
                      <motion.div key={i} variants={itemFade} className="bg-[#080A0E] border border-[#28313C]/80 rounded-xl p-4 hover:-translate-y-1 hover:border-[#7CC7FF]/30 transition-all shadow-sm">
                        <div className="text-[12px] text-[#778493] font-medium mb-1">{kpi.label}</div>
                        <div className="flex items-end gap-2 mb-2">
                          <div className="text-2xl font-bold text-white tracking-tight">{kpi.value}</div>
                          <ArrowDown className={`w-3.5 h-3.5 pb-1 ${kpi.isPositive ? 'text-[#22C55E] rotate-180' : 'text-[#EF4444]'}`} />
                        </div>
                        <div className="text-[10px] text-[#778493] flex items-center gap-1 mb-4">
                          <span className={kpi.isPositive ? 'text-[#22C55E]' : 'text-[#EF4444]'}>{kpi.trend}</span> {kpi.trendText}
                        </div>
                        <div className="w-full h-8 relative">
                          <svg viewBox="0 0 100 30" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                            <motion.path
                              d={pathData}
                              fill="none"
                              stroke={kpi.color}
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              initial={{ pathLength: 0, opacity: 0 }}
                              whileInView={{ pathLength: 1, opacity: 1 }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.1 }}
                            />
                            <motion.path
                              d={`${pathData} L 100,30 L 0,30 Z`}
                              fill={`url(#gradient-${i})`}
                              stroke="none"
                              initial={{ opacity: 0 }}
                              whileInView={{ opacity: 1 }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                            />
                            <defs>
                              <linearGradient id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={kpi.color} stopOpacity="0.2" />
                                <stop offset="100%" stopColor={kpi.color} stopOpacity="0" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>

                {/* Middle Grid: Ranked Insights & Approval Queue */}
                <div className="grid grid-cols-3 gap-6 mb-6">

                  {/* Ranked Insights (Col span 2) */}
                  <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="col-span-2 bg-[#080A0E] border border-[#28313C]/80 rounded-xl p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[15px] font-bold text-white">Ranked Insights</h3>
                        <Info className="w-3.5 h-3.5 text-[#778493] cursor-help" />
                      </div>
                      <div className="flex items-center gap-4 text-[12px] text-[#778493]">
                        <span className="text-white bg-white/10 px-3 py-1 rounded-full cursor-pointer font-medium">All</span>
                        <span className="hover:text-white cursor-pointer transition-colors">Risk</span>
                        <span className="hover:text-white cursor-pointer transition-colors">Savings</span>
                        <span className="hover:text-white cursor-pointer transition-colors">Renewals</span>
                        <span className="hover:text-white cursor-pointer transition-colors">Duplicates</span>
                        <span className="hover:text-white cursor-pointer transition-colors">Anomalies</span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-[#778493] cursor-pointer">
                        View: <span className="text-white font-medium">Impact</span> <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      {[
                        { num: 1, t: "SaaS renewal price increases", cat: "Renewals", cColor: "#7CC7FF", val: "$680K", p: "High", pColor: "#22C55E", width: "90%", bColor: "#7CC7FF" },
                        { num: 2, t: "Duplicate payments", cat: "Duplicates", cColor: "#4EA1FF", val: "$410K", p: "High", pColor: "#22C55E", width: "70%", bColor: "#7CC7FF" },
                        { num: 3, t: "Cloud spend anomalies", cat: "Anomalies", cColor: "#7CC7FF", val: "$360K", p: "Medium", pColor: "#F59E0B", width: "65%", bColor: "#4EA1FF" },
                        { num: 4, t: "Unused SaaS licenses", cat: "Savings", cColor: "#22C55E", val: "$210K", p: "Medium", pColor: "#F59E0B", width: "40%", bColor: "#7CC7FF" },
                        { num: 5, t: "Contract compliance gaps", cat: "Risk", cColor: "#F59E0B", val: "$145K", p: "Medium", pColor: "#F59E0B", width: "25%", bColor: "#F59E0B" }
                      ].map((row, i) => (
                        <div key={i} className="flex items-center gap-4 py-2.5 group cursor-pointer">
                          <div className="w-4 text-[12px] text-[#778493] font-medium text-right">{row.num}</div>
                          <div className="w-56 text-[13px] text-white font-medium truncate group-hover:text-[#7CC7FF] transition-colors">{row.t}</div>
                          <div className="w-24 flex items-center gap-2 text-[12px] text-[#778493]">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: row.cColor }} />
                            {row.cat}
                          </div>
                          <div className="flex-1 relative h-2.5 bg-[#080A0E] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: "0%" }}
                              whileInView={{ width: row.width }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: 0.2 + (i * 0.1), ease: "easeOut" }}
                              className="absolute top-0 left-0 h-full rounded-full"
                              style={{ backgroundColor: row.bColor }}
                            />
                          </div>
                          <div className="w-16 text-[13px] font-bold text-white text-right">{row.val}</div>
                          <div className="w-16 text-right">
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded border bg-[#080A0E]" style={{ color: row.pColor, borderColor: `${row.pColor}40` }}>{row.p}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#28313C]/50 flex items-center gap-1 text-[13px] text-[#7CC7FF] font-medium cursor-pointer hover:text-white transition-colors">
                      View all insights <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </motion.div>

                  {/* Approval Queue (Col span 1) */}
                  <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="col-span-1 bg-[#080A0E] border border-[#28313C]/80 rounded-xl p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-[15px] font-bold text-white">Approval Queue</h3>
                      <span className="text-[12px] text-[#7CC7FF] font-medium cursor-pointer hover:text-white transition-colors">View all</span>
                    </div>

                    <div className="flex-1 flex flex-col gap-3">
                      {[
                        { title: "Acme renewal review", sub: "Salesforce • Renewal • Jun 1, 2025", val: "$312K at risk", icon: FileText, stat: "High", sCol: "#EF4444" },
                        { title: "Duplicate payment recovery", sub: "Oracle • Invoice # INV-84321", val: "$145K to recover", icon: Database, stat: "High", sCol: "#EF4444" },
                        { title: "Cloud spend review", sub: "AWS • April 2025", val: "$98K potential savings", icon: Cloud, stat: "Medium", sCol: "#F59E0B" }
                      ].map((item, i) => (
                        <div key={i} className="bg-[#080A0E] border border-[#28313C]/80 rounded-lg p-3 hover:border-[#7CC7FF]/40 transition-colors group">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-md bg-[#080A0E] border border-[#28313C] flex items-center justify-center shrink-0 mt-0.5">
                              <item.icon className="w-4 h-4 text-[#778493]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-0.5">
                                <div className="text-[13px] font-bold text-white truncate">{item.title}</div>
                                <span className="text-[10px] font-medium" style={{ color: item.sCol }}>{item.stat}</span>
                              </div>
                              <div className="text-[11px] text-[#778493] mb-1.5 truncate">{item.sub}</div>
                              <div className="flex items-center justify-between">
                                <div className="text-[12px] text-white font-medium">{item.val}</div>
                                <button className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[11px] font-medium text-white transition-colors">
                                  Review
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#28313C]/50 flex items-center gap-1 text-[13px] text-[#7CC7FF] font-medium cursor-pointer hover:text-white transition-colors">
                      View all approvals <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </motion.div>
                </div>

                {/* Bottom Table: Top Risks & Opportunities */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="bg-[#080A0E] border border-[#28313C]/80 rounded-xl p-5">
                  <h3 className="text-[15px] font-bold text-white mb-4">Top Risks & Opportunities</h3>

                  <div className="w-full">
                    <div className="flex items-center py-2 border-b border-[#28313C]/80 text-[11px] font-semibold text-[#778493] uppercase tracking-wider mb-2">
                      <div className="w-8 text-center">!</div>
                      <div className="flex-1">Finding</div>
                      <div className="w-32">Category</div>
                      <div className="w-24 text-right">Impact</div>
                      <div className="w-24 text-center">Confidence</div>
                      <div className="w-32 text-center">Evidence</div>
                      <div className="w-36 text-right pr-2">Status</div>
                    </div>

                    {[
                      { num: 1, f: "Salesforce renewal 30% increase", c: "Renewals", col: "#7CC7FF", i: "$312K", conf: "High", cfC: "#22C55E", ev: 12, st: "Pending Approval", stC: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30" },
                      { num: 2, f: "Duplicate payment to IBM", c: "Duplicates", col: "#4EA1FF", i: "$145K", conf: "High", cfC: "#22C55E", ev: 7, st: "In Approval", stC: "bg-[#7CC7FF]/10 text-[#7CC7FF] border-[#7CC7FF]/30" },
                      { num: 3, f: "AWS S3 & EC2 idle resources", c: "Anomalies", col: "#7CC7FF", i: "$98K", conf: "Medium", cfC: "#F59E0B", ev: 8, st: "Ready for Review", stC: "bg-[#4EA1FF]/10 text-[#4EA1FF] border-[#4EA1FF]/30" },
                      { num: 4, f: "Adobe unused licenses", c: "Savings", col: "#22C55E", i: "$78K", conf: "Medium", cfC: "#F59E0B", ev: 5, st: "Pending Approval", stC: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30" },
                      { num: 5, f: "Contract auto-renewal risk", c: "Risk", col: "#F59E0B", i: "$66K", conf: "Medium", cfC: "#F59E0B", ev: 3, st: "Pending Approval", stC: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30" }
                    ].map((row, i) => (
                      <div key={i} className="flex items-center py-2.5 border-b border-[#28313C]/40 last:border-0 hover:bg-white/[0.02] cursor-pointer transition-colors group rounded-md px-1 -mx-1">
                        <div className="w-8 text-center text-[12px] text-[#778493] font-medium">{row.num}</div>
                        <div className="flex-1 text-[13px] text-white font-medium group-hover:text-[#7CC7FF] transition-colors truncate pr-4">{row.f}</div>
                        <div className="w-32 flex items-center gap-2 text-[12px] text-[#778493]">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: row.col }} /> {row.c}
                        </div>
                        <div className="w-24 text-[13px] font-bold text-white text-right">{row.i}</div>
                        <div className="w-24 text-center">
                          <span className="text-[11px] font-medium" style={{ color: row.cfC }}>{row.conf}</span>
                        </div>
                        <div className="w-32 flex items-center justify-center gap-2 text-[#778493]">
                          <FileText className="w-3 h-3" />
                          <Database className="w-3 h-3" />
                          <span className="text-[11px] bg-[#28313C] text-white px-1.5 py-0.5 rounded">{row.ev}</span>
                        </div>
                        <div className="w-36 text-right pr-2">
                          <span className={`text-[10px] font-medium px-2 py-1 rounded-full border ${row.stC}`}>{row.st}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#28313C]/50 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[13px] text-[#7CC7FF] font-medium cursor-pointer hover:text-white transition-colors">
                      View full report <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex items-center gap-1 text-[12px] text-[#778493] font-medium cursor-pointer hover:text-white transition-colors">
                      Export <Download className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </motion.div>

              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Feature Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-[#080A0E]/80 backdrop-blur-md border border-[#28313C]/60 rounded-2xl p-6 shadow-xl"
        >
          {[
            { icon: Activity, title: "Live Findings Stream", desc: "Real-time detection across every system and source." },
            { icon: FileSearch, title: "Evidence Queue", desc: "Every finding linked to the proof that matters." },
            { icon: ShieldCheck, title: "Approval Routing", desc: "Sensitive actions flow through policy-driven approvals." },
            { icon: BarChart3, title: "Board-Ready Visibility", desc: "Executive summaries with audit trails and impact clarity." }
          ].map((feat, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/[0.02] border border-transparent hover:border-[#7CC7FF]/20 transition-all cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-[#080A0E] border border-[#28313C] flex items-center justify-center shrink-0 group-hover:border-[#7CC7FF]/40 group-hover:shadow-[0_0_15px_rgba(78,161,255,0.2)] transition-all">
                <feat.icon className="w-5 h-5 text-[#7CC7FF]" />
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-white mb-1 group-hover:text-[#7CC7FF] transition-colors">{feat.title}</h4>
                <p className="text-[13px] text-[#778493] leading-snug">{feat.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}

// ── Section 6: Evidence / Proof Trail ───────────────────────────────────────
function EvidenceSection() {
  const containerStagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemFade = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section id="proof-trails" className="bg-transparent py-24 md:py-32 xl:py-40 relative min-h-[1100px] bg-[#080A0E] overflow-hidden border-t border-white/5">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Soft animated ambient glow */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 0.15 }} viewport={{ once: true }} transition={{ duration: 2 }} className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(11,107,255,0.1)_0%,transparent_100%)]" />

        {/* Left cinematic light beam */}
        <motion.div animate={{ opacity: [0.03, 0.1, 0.03], scale: [1, 1.05, 1], rotate: [-5, 0, -5] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[10%] left-[-20%] w-[60vw] h-[80vh] bg-[conic-gradient(from_90deg_at_0%_50%,rgba(78,161,255,0.15)_0deg,transparent_60deg)] blur-[100px] transform origin-left" />

        {/* Right cinematic light beam */}
        <motion.div animate={{ opacity: [0.03, 0.1, 0.03], scale: [1, 1.1, 1], rotate: [5, 0, 5] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[20%] right-[-20%] w-[60vw] h-[80vh] bg-[conic-gradient(from_270deg_at_100%_50%,rgba(139,92,246,0.15)_0deg,transparent_60deg)] blur-[120px] transform origin-right" />

        {/* Center engine radial glow */}
        <motion.div animate={{ opacity: [0.1, 0.2, 0.1], scale: [0.9, 1.1, 0.9] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-[radial-gradient(circle,rgba(78,161,255,0.15)_0%,transparent_60%)] blur-[100px]" />
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-8 relative z-10 flex flex-col items-center">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-24 flex flex-col items-center"
        >
          <div className="flex items-center justify-center gap-2 mb-6 border border-[#4EA1FF]/30 bg-[#4EA1FF]/10 px-4 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4 text-[#7CC7FF]" />
            <span className="text-[12px] font-bold tracking-widest text-[#7CC7FF] uppercase">EVIDENCE & PROOF TRAILS</span>
          </div>
          <h2 className="text-5xl lg:text-[64px] font-bold text-white tracking-tight leading-tight">
            Every insight comes <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4EA1FF] to-[#7CC7FF]">with proof</span>
          </h2>
          <p className="mt-8 text-[#778493] text-lg max-w-3xl mx-auto leading-relaxed font-medium">
            GENIUS does not ask teams to trust AI blindly.<br />
            Every finding is backed by source evidence, verification logic, and human review.
          </p>
        </motion.div>

        {/* 3-Column Verification System */}
        <div className="relative w-full max-w-[1500px] mx-auto flex flex-col xl:flex-row items-stretch justify-between gap-6 lg:gap-8 mb-20">

          {/* SVG Connectors (Desktop Only) */}
          <div className="absolute inset-0 pointer-events-none z-0 hidden xl:block">
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(78,161,255,0.2)" />
                  <stop offset="50%" stopColor="rgba(78,161,255,0.8)" />
                  <stop offset="100%" stopColor="rgba(139,92,246,0.2)" />
                </linearGradient>
                <linearGradient id="flow-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(78,161,255,0.2)" />
                  <stop offset="50%" stopColor="rgba(78,161,255,0.8)" />
                  <stop offset="100%" stopColor="rgba(78,161,255,0.2)" />
                </linearGradient>
              </defs>

              {/* Arrow Col 1 -> Col 2 */}
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }}
                d="M 28 50 C 31 50, 31 50, 33 50"
                fill="none"
                stroke="url(#flow-gradient)"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />

              {/* Arrow Col 2 -> Col 3 */}
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, delay: 1.6, ease: "easeInOut" }}
                d="M 68 50 C 70 50, 70 50, 73 50"
                fill="none"
                stroke="url(#flow-gradient-2)"
                strokeWidth="2"
                markerEnd="url(#arrowhead-2)"
              />

              <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <polygon points="0 0, 6 3, 0 6" fill="#4EA1FF" />
              </marker>
              <marker id="arrowhead-2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <polygon points="0 0, 6 3, 0 6" fill="#7CC7FF" />
              </marker>
            </svg>
          </div>

          {/* COLUMN 1: Source Evidence Pack */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="w-full xl:w-[28%] flex flex-col z-10"
          >
            <div className="w-full h-full bg-[#080A0E]/80 backdrop-blur-xl border border-[#28313C] rounded-[32px] p-8 shadow-2xl relative">
              <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
                <div className="w-8 h-8 rounded-full bg-[#4EA1FF]/20 flex items-center justify-center text-[#7CC7FF] font-bold text-sm">1</div>
                <div>
                  <h3 className="text-[19px] font-bold text-white leading-tight">Source Evidence Pack</h3>
                  <div className="text-[12px] text-[#778493] mt-1">5 verified sources</div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {[
                  { icon: FileText, title: "Invoice #INV-2041", sub: "Accounts payable system", date: "May 1, 2024" },
                  { icon: FileEdit, title: "Contract clause 4.2", sub: "Seat-based billing", date: "Feb 16, 2024" },
                  { icon: BarChart2, title: "Usage export — 47 inactive seats", sub: "SaaS admin console", date: "Apr 28, 2024" },
                  { icon: UserCheck, title: "Admin access report", sub: "Okta / identity system", date: "Apr 20, 2024" },
                  { icon: Calendar, title: "Renewal schedule — August 14", sub: "Contract management system", date: "Feb 16, 2024" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (i * 0.1) }}
                    viewport={{ once: true }}
                    className="flex items-start gap-4 p-3.5 rounded-xl bg-[#080A0E] border border-white/5 hover:bg-[#0E1116] hover:border-[#7CC7FF]/30 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#0E1116] border border-[#28313C] flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-[#4EA1FF] group-hover:text-[#7CC7FF] transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="text-[14px] font-bold text-white truncate group-hover:text-[#7CC7FF] transition-colors">{item.title}</div>
                      <div className="text-[11px] text-[#778493] truncate mt-0.5">{item.sub}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0 pt-1">
                      <div className="text-[10px] text-[#778493] font-medium">{item.date}</div>
                      <CheckCircle className="w-3.5 h-3.5 text-[#22C55E]" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* COLUMN 2: Verification Engine */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="w-full xl:w-[44%] flex flex-col z-10"
          >
            <div className="w-full h-full bg-[#080A0E]/80 backdrop-blur-xl border border-[#4EA1FF]/40 rounded-[32px] p-8 shadow-[0_0_50px_rgba(78,161,255,0.15)] relative overflow-hidden group hover:border-[#7CC7FF]/60 transition-colors duration-500">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4EA1FF] to-[#7CC7FF] opacity-50" />

              <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6">
                <div className="w-8 h-8 rounded-full bg-[#4EA1FF] flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_#4EA1FF]">2</div>
                <div>
                  <h3 className="text-[19px] font-bold text-white leading-tight">Verification Engine</h3>
                  <div className="text-[12px] text-[#778493] mt-1">5-step verification workflow</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-8 h-[380px]">

                {/* Left Steps */}
                <div className="flex flex-col justify-between h-full relative pl-2 w-[180px]">
                  <div className="absolute top-4 bottom-4 left-5 w-px bg-white/10" />

                  {[
                    { label: "Parse", sub: "source records", icon: FileText },
                    { label: "Match billing", sub: "to usage", icon: Link },
                    { label: "Cross-check", sub: "owners and renewals", icon: Users },
                    { label: "Calculate", sub: "confidence score", icon: PieChart },
                    { label: "Prepare review-ready", sub: "finding", icon: Check },
                  ].map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0 + (i * 0.15) }}
                      viewport={{ once: true }}
                      className="flex items-center gap-4 relative z-10 group/step"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#0E1116] border border-[#28313C] flex items-center justify-center text-[10px] text-[#778493] group-hover/step:border-[#7CC7FF] group-hover/step:text-[#7CC7FF] group-hover/step:shadow-[0_0_10px_#7CC7FF] transition-all">
                        {i + 1}
                      </div>
                      <div>
                        <div className="text-[12px] font-bold text-white group-hover/step:text-[#7CC7FF] transition-colors">{step.label}</div>
                        <div className="text-[10px] text-[#778493]">{step.sub}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Center Engine Core */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.0, duration: 1 }}
                  viewport={{ once: true }}
                  className="relative shrink-0 flex items-center justify-center w-[160px] h-[160px]"
                >
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border border-dashed border-[#4EA1FF]/30" />
                  <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute inset-4 rounded-full border border-[#7CC7FF]/20" />
                  <div className="absolute inset-8 rounded-full bg-[#4EA1FF]/10 blur-xl" />
                  <div className="relative w-20 h-20 bg-gradient-to-br from-[#4EA1FF] to-[#0E1116] rounded-2xl border border-[#7CC7FF]/50 flex items-center justify-center shadow-[0_0_30px_rgba(78,161,255,0.4)]">
                    <ShieldCheck className="w-10 h-10 text-white" strokeWidth={1.5} />
                  </div>
                </motion.div>

                {/* Right Scoring Modules */}
                <div className="flex flex-col justify-between h-full w-[160px]">
                  {[
                    { label: "Data completeness", val: "94%", color: "text-[#7CC7FF]", bg: "bg-[#7CC7FF]", icon: PieChart },
                    { label: "Source consistency", val: "97%", color: "text-[#4EA1FF]", bg: "bg-[#4EA1FF]", icon: ShieldCheck },
                    { label: "Confidence score", val: "95%", color: "text-[#7CC7FF]", bg: "bg-[#7CC7FF]", icon: Star },
                  ].map((score, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.4 + (i * 0.2) }}
                      viewport={{ once: true }}
                      className="bg-[#080A0E] border border-white/5 rounded-xl p-4 hover:border-white/20 transition-all flex flex-col justify-center"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-[#0E1116] border border-white/10 flex items-center justify-center shrink-0">
                          <score.icon className={`w-4 h-4 ${score.color}`} />
                        </div>
                        <div className="text-[11px] font-medium text-[#778493] leading-tight pr-2">{score.label}</div>
                      </div>
                      <div className="flex items-end justify-between gap-4">
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-1.5">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: score.val }}
                            transition={{ duration: 1, delay: 1.6 + (i * 0.2), ease: "easeOut" }}
                            className={`h-full ${score.bg}`}
                          />
                        </div>
                        <div className={`text-xl font-bold ${score.color} tracking-tight`}>{score.val}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

              </div>
            </div>
          </motion.div>

          {/* COLUMN 3: Proven Insight */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
            className="w-full xl:w-[28%] flex flex-col z-10"
          >
            <div className="w-full h-full bg-[#080A0E]/80 backdrop-blur-xl border border-[#28313C] rounded-[32px] p-8 shadow-2xl relative group hover:border-[#7CC7FF]/40 hover:-translate-y-1 transition-all duration-500">
              <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#7CC7FF]/20 flex items-center justify-center text-[#7CC7FF] font-bold text-sm">3</div>
                  <h3 className="text-[19px] font-bold text-white leading-tight">Proven Insight</h3>
                </div>
                <div className="px-2 py-1 bg-[#4EA1FF]/10 border border-[#4EA1FF]/20 rounded-md text-[9px] font-bold tracking-widest text-[#7CC7FF] uppercase">
                  Review Ready
                </div>
              </div>

              <div className="bg-[#0E1116] border border-white/10 rounded-2xl p-6 relative overflow-hidden group-hover:border-[#7CC7FF]/20 transition-colors">
                {/* Soft pulse glow when complete */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: [0, 0.5, 0] }}
                  transition={{ delay: 2.5, duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.15)_0%,transparent_70%)] pointer-events-none"
                />

                <div className="flex items-start gap-4 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-[#4EA1FF]/10 border border-[#4EA1FF]/20 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5 text-[#7CC7FF]" />
                  </div>
                  <h3 className="text-xl font-bold text-white leading-tight">
                    Unused SaaS licenses detected
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
                  <div>
                    <div className="text-[10px] text-[#778493] font-bold tracking-wider uppercase mb-1">Impact</div>
                    <div className="text-3xl font-bold text-white tracking-tight">$186K</div>
                    <div className="text-[9px] text-[#778493] mt-1 leading-tight">Potential annual savings</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#778493] font-bold tracking-wider uppercase mb-1">Confidence</div>
                    <div className="text-3xl font-bold text-white tracking-tight">95%</div>
                    <div className="w-full h-1 bg-white/10 rounded-full mt-2.5 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#4EA1FF] to-[#7CC7FF] w-[95%]" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-2 text-[#778493]"><Activity className="w-3.5 h-3.5" /> STATUS</div>
                    <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" /><span className="text-[#22C55E] font-medium">Opportunity</span></div>
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-2 text-[#778493]"><User className="w-3.5 h-3.5" /> OWNER</div>
                    <div className="text-white font-medium">Finance team</div>
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-2 text-[#778493]"><Link className="w-3.5 h-3.5" /> EVIDENCE LINKED</div>
                    <div className="text-white font-medium">5 sources</div>
                  </div>
                </div>

                {/* Animated Sparkline */}
                <div className="mt-8 pt-4 relative">
                  <div className="text-[9px] text-[#778493] font-bold tracking-wider uppercase mb-2">POTENTIAL ANNUAL SAVINGS</div>
                  <div className="h-[40px] relative">
                    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                      <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, delay: 2.0, ease: "easeOut" }}
                        d="M 0 25 C 15 25, 20 22, 30 18 C 45 12, 60 20, 75 10 C 85 5, 95 8, 100 2"
                        fill="none"
                        stroke="#4EA1FF"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                        className="drop-shadow-[0_0_6px_rgba(78,161,255,0.5)]"
                      />
                      <motion.circle
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 3.5 }}
                        cx="100" cy="2" r="3" fill="#7CC7FF" className="drop-shadow-[0_0_5px_#7CC7FF]"
                      />
                    </svg>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Principles & Trust Pill */}
        <div className="w-full max-w-[1500px] mx-auto flex flex-col items-center gap-10">
          {/* Principles Row */}
          <motion.div
            variants={containerStagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="w-full grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { icon: Quote, title: "Source citations", desc: "Every insight is linked to the exact invoices, contracts, exports, and systems." },
              { icon: CheckCircle, title: "Confidence scoring", desc: "Confidence is calculated from data quality, source completeness, and cross-source consistency." },
              { icon: UserCheck, title: "Human review", desc: "Findings are triaged by operators before any action is taken." }
            ].map((principle, i) => (
              <motion.div
                key={i}
                variants={itemFade}
                className="bg-[#080A0E]/60 backdrop-blur-md border border-[#28313C] rounded-[24px] p-6 flex items-start gap-5 hover:border-[#4EA1FF]/40 transition-colors group relative overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-14 h-14 rounded-xl bg-[#0E1116] border border-white/5 flex items-center justify-center shrink-0 group-hover:shadow-[0_0_15px_rgba(78,161,255,0.15)] transition-all">
                  <principle.icon className="w-6 h-6 text-[#4EA1FF] group-hover:text-[#7CC7FF] transition-colors" />
                </div>
                <div className="flex-1">
                  <h4 className="text-[17px] font-bold text-white mb-2 group-hover:text-[#7CC7FF] transition-colors">
                    {principle.title}
                  </h4>
                  <p className="text-[14px] text-[#778493] leading-relaxed">{principle.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Trust Pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-4 rounded-full border border-white/10 bg-[#0E1116]/80 backdrop-blur-md px-10 py-5 shadow-2xl hover:border-[#4EA1FF]/30 transition-all"
          >
            <ShieldCheck className="w-6 h-6 text-[#4EA1FF]" />
            <p className="text-[19px] font-medium text-[#778493]">
              <span className="text-[#4EA1FF] font-bold">No source</span> = no trusted finding.
            </p>
          </motion.div>
        </div>

      </div>
    </section>
  );
}

// ── Section 7: Approvals / Execution ──────────────────────────────────────────
function ApprovalsSection() {
  return (
    <section id="approvals" className="bg-transparent py-24 md:py-32 xl:py-40 relative bg-[#080A0E] overflow-hidden border-t border-white/5">

      {/* ── Cinematic Background ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#080A0E]">
        {/* Deep pulsing central orb */}
        <motion.div
          animate={{ opacity: [0.15, 0.3, 0.15], scale: [0.95, 1.15, 0.95] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[45%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(78,161,255,0.25) 0%, rgba(78,161,255,0.08) 40%, transparent 70%)", filter: "blur(60px)" }}
        />
        {/* Left blue haze */}
        <motion.div
          animate={{ x: [0, 40, 0], opacity: [0.1, 0.18, 0.1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[-15%] w-[60%] h-[90%]"
          style={{ background: "radial-gradient(ellipse, rgba(78,161,255,0.15) 0%, transparent 65%)", filter: "blur(90px)" }}
        />
        {/* Right violet haze */}
        <motion.div
          animate={{ x: [0, -40, 0], opacity: [0.1, 0.18, 0.1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[5%] right-[-15%] w-[55%] h-[95%]"
          style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.15) 0%, transparent 65%)", filter: "blur(90px)" }}
        />
        {/* Flowing light trails */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-[60%] top-[20%] overflow-visible opacity-40" preserveAspectRatio="none">
           <defs>
              <linearGradient id="lt-left" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" stopColor="rgba(78,161,255,0)" />
                 <stop offset="50%" stopColor="rgba(78,161,255,0.8)" />
                 <stop offset="100%" stopColor="rgba(139,92,246,0.2)" />
              </linearGradient>
           </defs>
           <motion.path d="M 0 50 C 25 40, 35 60, 50 50 C 65 40, 75 60, 100 50" fill="none" stroke="url(#lt-left)" strokeWidth="1.5"
             initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} transition={{ duration: 2.5, ease: "easeInOut" }} />
           <motion.path d="M 0 55 C 25 45, 35 65, 50 55 C 65 45, 75 65, 100 55" fill="none" stroke="url(#lt-left)" strokeWidth="0.5" opacity="0.5"
             initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 0.5 }} transition={{ duration: 2.5, delay: 0.2, ease: "easeInOut" }} />
        </svg>
      </div>

      <div className="w-full max-w-[1680px] w-[92vw] mx-auto relative z-10 flex flex-col items-center">

        {/* ── TOP AREA ── */}
        <div className="text-center mb-12 flex flex-col items-center pt-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-2 mb-6 border border-[#4EA1FF]/40 bg-[#4EA1FF]/10 px-5 py-2 rounded-full backdrop-blur-md shadow-[0_0_20px_rgba(78,161,255,0.2)]"
          >
            <Lock className="w-3.5 h-3.5 text-[#7CC7FF]" />
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#7CC7FF] uppercase">Approvals & Execution</span>
          </motion.div>

          <motion.h2
             initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
             whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8, delay: 0.3 }}
             className="text-5xl lg:text-[76px] font-extrabold text-white tracking-tight leading-[1.05] mb-5"
          >
            AI prepares.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7CC7FF] via-[#7CC7FF] to-[#7CC7FF]">
              Humans approve.
            </span>
          </motion.h2>

          <motion.p
             initial={{ opacity: 0, y: 15 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6, delay: 0.5 }}
             className="text-[#778493] text-[18px] max-w-3xl mx-auto leading-relaxed font-medium"
          >
            GENIUS analyzes, recommends, and prepares actions — but every sensitive business action waits for human approval.
          </motion.p>
        </div>

        {/* ── MIDDLE WORKFLOW ── */}
        <div className="w-full relative flex flex-col xl:flex-row items-center xl:items-stretch justify-between gap-6 mb-4 min-h-[560px]">

          {/* ── ANIMATED SVG CONNECTING LINES (Middle layer) ── */}
          <div className="absolute inset-0 pointer-events-none z-0 hidden xl:block">
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="line-left" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(78,161,255,0)" />
                  <stop offset="100%" stopColor="rgba(78,161,255,0.6)" />
                </linearGradient>
                <linearGradient id="line-right" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(78,161,255,0.6)" />
                  <stop offset="100%" stopColor="rgba(139,92,246,0.1)" />
                </linearGradient>
                <filter id="glow-dot"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              </defs>
              {/* Left to Center */}
              <g>
                <motion.path d="M 28 45 C 35 45, 40 50, 45 50" fill="none" stroke="url(#line-left)" strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 0.8 }} transition={{ duration: 1.2, delay: 0.9, ease: "easeInOut" }} />
              </g>
              {/* Center to Right */}
              <g>
                <motion.path d="M 55 50 C 60 50, 65 45, 71 45" fill="none" stroke="url(#line-right)" strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 0.8 }} transition={{ duration: 1.2, delay: 1.1, ease: "easeInOut" }} />
              </g>
            </svg>
          </div>

          {/* ════════════════════════
              LEFT: AI PREPARES
          ════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="xl:w-[32%] w-full flex flex-col items-center xl:items-start z-10"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4EA1FF]/30 to-[#7CC7FF]/20 border border-[#4EA1FF]/50 flex items-center justify-center text-[#7CC7FF] text-[12px] font-bold shadow-[0_0_12px_rgba(78,161,255,0.3)]">01</div>
              <span className="text-[13px] font-bold tracking-[0.2em] text-[#778493] uppercase">AI Prepares</span>
            </div>

            <p className="text-[12px] text-[#778493] font-medium mb-6 max-w-[280px]">
              AI scans data, finds opportunities, and prepares decision-ready proposals.
            </p>

            {/* 3D Card Stack (Larger) */}
            <div className="relative w-full max-w-[390px] h-[480px] group cursor-default" style={{ perspective: "1500px" }}>

              <div className="absolute inset-0 -z-10" style={{ background: "radial-gradient(ellipse at center, rgba(78,161,255,0.12) 0%, transparent 65%)", filter: "blur(60px)" }} />

              {/* Card 3 (Back) */}
              <div className="absolute inset-0 h-[420px] rounded-[24px] bg-gradient-to-br from-[#0E1116] to-[#080A0E] border border-white/[0.04]"
                style={{ transform: "rotateY(16deg) rotateX(8deg) translate3d(-60px, 65px, -240px) scale(0.85)", opacity: 0.4 }} />

              {/* Card 2 (Mid) */}
              <div className="absolute inset-0 h-[420px] rounded-[24px] bg-gradient-to-br from-[#0E1116] to-[#080A0E] border border-white/[0.07]"
                style={{ transform: "rotateY(12deg) rotateX(6deg) translate3d(-30px, 35px, -120px) scale(0.92)", opacity: 0.7 }} />

              {/* Card 1 (Front) */}
              <motion.div
                className="absolute inset-0 h-[420px] rounded-[24px] border-t-[1.5px] border-l-[1.5px] border-white/20 border-r border-b border-[#4EA1FF]/25 p-7 z-20 overflow-hidden"
                style={{
                  transform: "rotateY(8deg) rotateX(4deg)",
                  background: "linear-gradient(155deg, rgba(15,24,48,0.98) 0%, rgba(4,8,18,0.98) 100%)",
                  boxShadow: "0 45px 90px rgba(0,0,0,0.85), inset 0 0 40px rgba(255,255,255,0.02), 0 0 0 1px rgba(78,161,255,0.15)"
                }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <div className="absolute inset-0 rounded-[24px] pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 45%)" }} />

                <div className="flex items-center gap-2 mb-6 relative z-10">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4EA1FF] to-[#7CC7FF] flex items-center justify-center shadow-[0_0_15px_rgba(78,161,255,0.7)]">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[11px] font-bold tracking-[0.15em] text-[#7CC7FF] uppercase">AI Analysis</span>
                  <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30">
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                    <span className="text-[10px] font-bold text-[#22C55E]">Opportunity</span>
                  </div>
                </div>

                <h4 className="text-[24px] font-bold text-white leading-tight mb-5 relative z-10">SaaS spend optimization</h4>

                <div className="mb-5 p-4 rounded-xl border border-[#7CC7FF]/20 relative z-10" style={{ background: "linear-gradient(to right, rgba(78,161,255,0.15), rgba(78,161,255,0.05))" }}>
                  <div className="text-[10px] text-[#778493] uppercase tracking-wider mb-1.5 font-bold">Impact</div>
                  <div className="text-[34px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#7CC7FF] to-[#7CC7FF] leading-none">$186,000</div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5 relative z-10">
                  <div className="bg-black/40 rounded-xl p-3.5 border border-white/[0.06]">
                    <div className="text-[9px] text-[#778493] uppercase tracking-wider mb-1.5 font-bold">Confidence</div>
                    <div className="flex items-center gap-1.5 text-[14px] font-bold text-white"><ShieldCheck className="w-4 h-4 text-[#22C55E]"/> 95%</div>
                  </div>
                  <div className="bg-black/40 rounded-xl p-3.5 border border-white/[0.06]">
                    <div className="text-[9px] text-[#778493] uppercase tracking-wider mb-1.5 font-bold">Evidence</div>
                    <div className="flex items-center gap-1.5 text-[14px] font-bold text-white"><FileSearch className="w-4 h-4 text-[#7CC7FF]"/> 12 sources</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/30 border-l-2 border-[#4EA1FF] relative z-10">
                  <div className="text-[9px] text-[#778493] uppercase tracking-wider mb-1.5 font-bold">Recommendation</div>
                  <div className="text-[12px] text-white leading-snug">Negotiate renewal and remove unused seats</div>
                </div>

                <div className="flex items-center gap-2 mt-5 pt-4 border-t border-white/[0.06] relative z-10">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#4EA1FF] to-[#7CC7FF] flex items-center justify-center text-white text-[9px] font-bold shadow-[0_0_10px_rgba(78,161,255,0.6)]">G</div>
                  <div>
                    <div className="text-[10px] text-[#778493] font-bold">Prepared by GENIUS AI</div>
                    <div className="text-[9px] text-[#778493]">Today, 09:42 AM</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* ════════════════════════
              CENTER: HUMAN APPROVAL GATE
          ════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
            className="xl:w-[32%] w-full flex flex-col items-center justify-center z-20 relative pt-10"
          >
            <div className="relative flex flex-col items-center justify-center h-[340px]">

              <motion.div animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.1, 0.9] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(78,161,255,0.25) 0%, transparent 60%)", filter: "blur(30px)" }} />

              {/* Central Core */}
              <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative z-10 flex flex-col items-center">

                {/* Large Shield */}
                <div className="relative w-[220px] h-[250px] flex items-center justify-center mb-6"
                  style={{ filter: "drop-shadow(0 0 50px rgba(78,161,255,0.6))" }}>
                  <svg viewBox="0 0 100 120" className="absolute inset-0 w-full h-full">
                    <defs>
                      <linearGradient id="hc1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#0E1116"/><stop offset="100%" stopColor="#080A0E"/></linearGradient>
                      <linearGradient id="hc2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#7CC7FF"/><stop offset="50%" stopColor="#7CC7FF"/><stop offset="100%" stopColor="#7CC7FF"/></linearGradient>
                    </defs>
                    <motion.path d="M 50 0 L 98 16 L 98 57 C 98 90 50 118 50 118 C 50 118 2 90 2 57 L 2 16 Z" fill="rgba(78,161,255,0.06)" stroke="url(#hc2)" strokeWidth="1" opacity="0.6"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }} />
                    <motion.path d="M 50 6 L 91 20 L 91 58 C 91 85 50 110 50 110 C 50 110 9 85 9 58 L 9 20 Z" fill="url(#hc1)" stroke="url(#hc2)" strokeWidth="2.5"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeOut" }} />
                    <motion.path d="M 50 12 L 85 24 L 85 57 C 85 80 50 102 50 102 C 50 102 15 80 15 57 L 15 24 Z" fill="none" stroke="rgba(78,161,255,0.3)" strokeWidth="1"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "mirror", delay: 1 }} />
                  </svg>
                  <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                    <Fingerprint className="relative z-10 w-[84px] h-[84px] text-[#7CC7FF]" style={{ filter: "drop-shadow(0 0 15px rgba(78,161,255,1))" }} />
                  </motion.div>
                </div>

                {/* Labels inside the core flow */}
                <div className="bg-[#050A14] border border-[#4EA1FF]/40 px-5 py-2.5 rounded-full shadow-[0_0_20px_rgba(78,161,255,0.4)]">
                   <div className="text-[12px] font-bold tracking-[0.25em] text-[#7CC7FF] uppercase text-center">Awaiting Human Approval</div>
                </div>
                <div className="text-[10px] text-[#778493] font-bold uppercase tracking-widest mt-4 opacity-70 text-center">No sensitive action executes before approval</div>
              </motion.div>
            </div>
          </motion.div>

          {/* ════════════════════════
              RIGHT: MOBILE APPROVAL
          ════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
            className="xl:w-[34%] w-full flex flex-col items-center xl:items-end z-10"
          >
            <div className="flex items-center gap-3 mb-8 xl:self-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7CC7FF]/30 to-[#7CC7FF]/20 border border-[#7CC7FF]/50 flex items-center justify-center text-[#7CC7FF] text-[12px] font-bold shadow-[0_0_12px_rgba(139,92,246,0.3)]">02</div>
              <span className="text-[13px] font-bold tracking-[0.2em] text-[#778493] uppercase">Humans Approve</span>
            </div>

            <div className="flex items-start gap-5">

              {/* Phone Mockup (Enlarged) */}
              <motion.div
                className="relative shrink-0 w-[260px] h-[520px]" style={{ perspective: "2000px" }}
                animate={{ y: [-8, 8, -8] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[100%] pointer-events-none -z-10"
                  style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.15) 0%, transparent 60%)", filter: "blur(50px)" }} />

                <motion.div
                  className="w-full h-full relative"
                  style={{ transformStyle: "preserve-3d" }}
                  initial={{ rotateY: -30, rotateX: 15 }}
                  animate={{ rotateY: -15, rotateX: 6 }}
                  whileHover={{ rotateY: -5, rotateX: 2 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                   {/* 3D Depth Layer */}
                   <div className="absolute inset-0 rounded-[44px] bg-[#111] border border-[#333]"
                     style={{ transform: "translateZ(-15px)", boxShadow: "20px 20px 40px rgba(0,0,0,0.8)" }} />

                   {/* Phone Screen */}
                   <div className="absolute inset-0 rounded-[44px] overflow-hidden bg-[#080A0E] z-10"
                     style={{ border: "8px solid #0A0A0A", boxShadow: "inset 0 0 20px rgba(0,0,0,0.9), 0 0 0 1px #222", transform: "translateZ(0px)" }}>

                      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[90px] h-[28px] bg-black rounded-[20px] z-50 flex items-center px-3" />

                      <div className="w-full h-12 flex justify-between px-6 pt-3 relative z-40 text-white">
                         <span className="text-[11px] font-bold">9:41</span>
                         <div className="flex gap-1.5"><Signal className="w-3.5 h-3.5"/><Wifi className="w-3.5 h-3.5"/><Battery className="w-4 h-4"/></div>
                      </div>

                      <div className="pt-2 px-4 pb-4 h-full flex flex-col bg-[#080A0E]">
                         <div className="flex items-center justify-between mb-4">
                            <ChevronLeft className="w-4 h-4 text-white" />
                            <span className="text-[14px] font-bold text-white">Approval Request</span>
                            <Info className="w-4 h-4 text-white" />
                         </div>

                         <div className="bg-[#0E1116] border border-white/10 rounded-[20px] p-4 flex-1 flex flex-col shadow-lg">
                            <div className="text-[9px] text-[#7CC7FF] font-bold uppercase tracking-widest mb-1.5">SaaS spend optimization</div>
                            <div className="text-[28px] font-extrabold text-white leading-none mb-1.5">$186,000</div>
                            <div className="text-[10px] text-[#22C55E] font-bold mb-4">Save 41% vs last year</div>

                            <div className="flex gap-2 mb-4">
                               <div className="flex-1 bg-black/50 p-2.5 rounded-xl border border-white/5">
                                  <div className="text-[8px] text-[#778493] uppercase mb-1">Confidence</div>
                                  <div className="text-[12px] text-white font-bold">95%</div>
                               </div>
                               <div className="flex-1 bg-black/50 p-2.5 rounded-xl border border-white/5">
                                  <div className="text-[8px] text-[#778493] uppercase mb-1">Evidence</div>
                                  <div className="text-[12px] text-white font-bold">12 sources</div>
                               </div>
                            </div>

                            <div className="text-[9px] text-[#778493] uppercase mb-1.5 font-bold">Recommendation</div>
                            <div className="text-[11px] text-white bg-[#4EA1FF]/15 border-l-2 border-[#4EA1FF] p-2.5 rounded-r-lg mb-4">
                               Negotiate renewal and remove unused seats
                            </div>

                            <div className="mt-auto pt-3 border-t border-white/10 flex items-center gap-2">
                               <div className="w-5 h-5 rounded-full bg-[#4EA1FF] flex items-center justify-center text-[8px] font-bold text-white">G</div>
                               <span className="text-[9px] text-[#778493] font-bold">GENIUS AI • 09:42 AM</span>
                            </div>
                         </div>

                         <div className="mt-4 flex flex-col gap-2.5">
                            <button className="w-full h-12 bg-gradient-to-b from-[#22C55E] to-[#16A34A] rounded-2xl text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(34,197,94,0.3)]">
                               <CheckSquare className="w-4 h-4"/> Approve
                            </button>
                            <div className="flex gap-2">
                               <button className="flex-1 h-11 bg-[#141A22] rounded-xl border border-white/10 text-[11px] font-bold text-[#778493]">Request changes</button>
                               <button className="flex-1 h-11 bg-[#141A22] rounded-xl border border-white/10 text-[11px] font-bold text-[#EF4444]">Reject</button>
                            </div>
                         </div>
                      </div>
                   </div>
                </motion.div>
               </motion.div>

              {/* Verify Panel */}
              <div className="relative flex flex-col items-center pt-8 xl:ml-6">

                {/* Connecting Arrow from Phone */}
                <div className="absolute top-[80px] right-[100%] w-[50px] h-[40px] pointer-events-none xl:block hidden">
                   <svg width="100%" height="100%" viewBox="0 0 50 40" fill="none">
                      <motion.path
                        d="M 0 20 L 40 20"
                        stroke="url(#arrow-grad)" strokeWidth="1.5" strokeDasharray="4 4"
                        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 1.8 }}
                      />
                      <motion.path
                        d="M 35 15 L 42 20 L 35 25"
                        stroke="#7CC7FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                        initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 3 }}
                      />
                      <defs>
                        <linearGradient id="arrow-grad" x1="0" y1="0" x2="1" y2="0">
                           <stop offset="0%" stopColor="rgba(78,161,255,0)" />
                           <stop offset="100%" stopColor="rgba(129,140,248,0.8)" />
                        </linearGradient>
                      </defs>
                   </svg>
                </div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 1.4 }}
                  className="flex flex-col items-center"
                >
                  <div className="flex items-center gap-2 mb-4">
                     <Lock className="w-3.5 h-3.5 text-[#7CC7FF]" />
                     <div className="text-[10px] font-bold tracking-[0.2em] text-[#778493] uppercase text-center">Verify it&apos;s you</div>
                  </div>
                  {[
                    { Icon: ScanFace, label: "Face ID", color: "#7CC7FF", bg: "rgba(78,161,255,0.15)" },
                    { Icon: Fingerprint, label: "Fingerprint", color: "#7CC7FF", bg: "rgba(129,140,248,0.15)" },
                    { Icon: KeyRound, label: "Auth Code", color: "#7CC7FF", bg: "rgba(192,132,252,0.15)" },
                  ].map((item, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 1.5 + i * 0.15 }}
                      whileHover={{ scale: 1.05, x: -5, backgroundColor: "rgba(255,255,255,0.03)" }}
                      className="group relative flex flex-col items-center gap-2 p-3.5 rounded-[20px] border border-white/[0.08] backdrop-blur-md mb-3 w-[100px] cursor-pointer transition-colors duration-300 overflow-hidden bg-[#0E1116]">

                       {/* Hover Glow Edge */}
                       <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                            style={{ background: `linear-gradient(to bottom right, transparent, ${item.bg})` }} />

                       <div className="w-12 h-12 rounded-[14px] flex items-center justify-center border border-white/10 relative z-10 transition-colors duration-300"
                            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                          <item.Icon className="w-5 h-5 text-[#778493] group-hover:text-white transition-colors duration-300" />
                          {/* Inner pulse ring on hover */}
                          <div className="absolute inset-0 rounded-[14px] border border-transparent group-hover:border-[color:var(--c)] opacity-0 group-hover:opacity-100 transition-all duration-300"
                               style={{ "--c": item.color }} />
                       </div>
                       <span className="text-[10px] text-[#778493] font-bold text-center group-hover:text-[#E8EDF3] transition-colors duration-300 relative z-10">{item.label}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── INTEGRATED EXECUTION STEP ── */}
        <div className="w-full flex flex-col items-center mt-[-30px] relative z-20">
           {/* Vertical Connector */}
           <motion.div initial={{ height: 0 }} whileInView={{ height: 60 }} viewport={{ once: true }} transition={{ duration: 1, delay: 1.8 }}
             className="w-[2px] bg-gradient-to-b from-[#7CC7FF] to-transparent mb-2" />
           <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 2.8 }}
             className="w-3 h-3 rounded-full bg-[#7CC7FF] shadow-[0_0_15px_#7CC7FF] mb-4" />

           <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 3, duration: 0.6 }}
             className="flex flex-col items-center">
             <div className="flex items-center gap-3 mb-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4EA1FF] to-[#7CC7FF] flex items-center justify-center text-white text-[10px] font-bold shadow-[0_0_15px_rgba(78,161,255,0.5)]">03</div>
                <h3 className="text-[14px] font-bold tracking-[0.2em] text-white uppercase">Action Executed</h3>
             </div>
             <p className="text-[14px] text-[#778493] font-medium">Once approved, GENIUS executes the action safely and securely.</p>
           </motion.div>

           {/* Flow Bar */}
           <motion.div initial={{ opacity: 0, scaleX: 0 }} whileInView={{ opacity: 1, scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 3.5, ease: "easeOut" }}
             className="mt-8 py-3 px-8 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-md flex flex-wrap justify-center items-center gap-3 text-[11px] font-bold text-[#778493] uppercase tracking-wider w-full max-w-4xl shadow-xl">
               <span className="text-white">Prepared by AI</span>
               <span className="text-[#7CC7FF]">→</span>
               <span className="text-white">Awaiting approval</span>
               <span className="text-[#7CC7FF]">→</span>
               <span className="text-white">Approved on mobile</span>
               <span className="text-[#7CC7FF]">→</span>
               <span className="text-white">Executed securely</span>
               <span className="text-[#7CC7FF]">→</span>
               <span className="text-white">Logged in audit trail</span>
           </motion.div>
        </div>

        {/* ── BOTTOM TRUST STRIP ── */}
        <div className="w-full mt-12 mb-8 flex flex-col items-center relative z-20">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15, delayChildren: 4 } } }}
            className="w-full grid grid-cols-1 md:grid-cols-4 gap-6 mb-10"
          >
            {[
              { icon: Sparkles,   title: "AI prepares",           desc: "AI analyzes data, finds opportunities, and prepares safe proposals." },
              { icon: UserCheck,  title: "Humans approve",         desc: "Real people review every proposal and confirm, edit, or reject it." },
              { icon: Lock,       title: "Verified every time",    desc: "Mobile approval can require Face ID, fingerprint, or one-time code." },
              { icon: FileText,   title: "Everything is recorded", desc: "Every step from AI analysis to approval and execution is logged." },
            ].map((card, i) => (
              <motion.div
                key={i}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
                className="bg-[#080D1A] border border-[#1A2540] p-6 rounded-[24px] shadow-lg flex flex-col gap-3"
              >
                <div className="w-12 h-12 rounded-[14px] bg-[#4EA1FF]/10 border border-[#4EA1FF]/30 flex items-center justify-center">
                  <card.icon className="w-6 h-6 text-[#7CC7FF]" />
                </div>
                <h4 className="text-[16px] font-bold text-white mt-1">{card.title}</h4>
                <p className="text-[13px] text-[#778493] leading-relaxed font-medium">{card.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 4.8, duration: 1 }}
             className="px-6 py-2.5 rounded-full border border-white/10 bg-white/5 text-[12px] text-white font-bold tracking-widest uppercase shadow-2xl">
             Control stays with humans. Always.
          </motion.div>
        </div>

      </div>
    </section>
  );
}




// ── Section 8: AI Agents ──────────────────────────────────────────────────────
function AgentsSection() {
  const agents = [
    { name: "Accounting Agent", icon: ReceiptText, desc: "Finds overcharges, invoice mismatches, and GL anomalies.", activity: "Scanning 12,842 records" },
    { name: "Marketing Agent", icon: Target, desc: "Identifies wasted spend, weak ROAS, and budget leaks.", activity: "Monitoring 34 campaigns" },
    { name: "Sales Agent", icon: User, desc: "Uncovers pricing gaps, deal risks, and pipeline insights.", activity: "Watching 562 opportunities" },
    { name: "Ops Agent", icon: Package, desc: "Tracks vendor performance, SLA issues, and operational risks.", activity: "Analyzing 28 vendors" },
    { name: "Action Drafter", icon: FileEdit, desc: "Prepares safe, validated actions with full context.", activity: "Preparing actions" },
    { name: "Report Builder", icon: BarChart3, desc: "Creates executive-ready reports and audit trails.", activity: "Building report" },
  ];

  const blurReveal = {
    hidden: { opacity: 0, y: 15, filter: "blur(8px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <section id="agents" className="bg-transparent py-24 md:py-32 xl:py-40 bg-[#080A0E] relative overflow-hidden flex flex-col items-center">

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[800px] bg-gradient-to-b from-[#4EA1FF]/5 to-[#7CC7FF]/5 blur-[120px] rounded-full opacity-60" />

        {/* Light Waves */}
        <motion.div initial={{ opacity: 0, x: -100 }} whileInView={{ opacity: 0.3, x: 0 }} transition={{ duration: 2, ease: "easeOut" }} viewport={{ once: true }}
          className="absolute top-[20%] -left-[20%] w-[60%] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(78,161,255,0.3)_0%,transparent_70%)] blur-[80px]" />
        <motion.div initial={{ opacity: 0, x: 100 }} whileInView={{ opacity: 0.2, x: 0 }} transition={{ duration: 2, delay: 0.2, ease: "easeOut" }} viewport={{ once: true }}
          className="absolute top-[30%] -right-[20%] w-[60%] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.2)_0%,transparent_70%)] blur-[80px]" />
      </div>

      <div className="w-[92vw] max-w-[1680px] mx-auto relative z-10">

        {/* Header */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }} className="text-center mb-16 flex flex-col items-center">
          <motion.div variants={blurReveal} className="inline-flex items-center gap-2 mb-6 border border-[#7CC7FF]/20 bg-[#7CC7FF]/5 px-4 py-1.5 rounded-full backdrop-blur-sm">
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#7CC7FF]">01 AGENTS</span>
          </motion.div>
          <motion.h2 variants={blurReveal} className="text-[44px] md:text-[56px] font-extrabold text-white mb-6 tracking-tight leading-[1.1]">
            Specialized agents for<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7CC7FF] to-[#7CC7FF]">business operations</span>
          </motion.h2>
          <motion.p variants={blurReveal} className="text-[#778493] text-[18px] max-w-[650px] mx-auto leading-relaxed">
            GENIUS deploys purpose-built AI agents that continuously analyze, act, and keep your business data in the right hands.
          </motion.p>
        </motion.div>

        {/* Agent Cards Grid */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 max-w-[1200px] mx-auto relative z-20"
        >
          {agents.map((agent, i) => (
            <motion.div key={i} variants={{ hidden: { opacity: 0, y: 30, filter: "blur(5px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: "easeOut" } } }}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              className="group relative p-7 rounded-[20px] border border-white/[0.06] bg-[#0B101D]/90 backdrop-blur-md hover:border-[#7CC7FF]/30 transition-all overflow-hidden flex flex-col justify-between h-full min-h-[230px] shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_35px_rgba(78,161,255,0.15)]"
            >
               {/* Hover Glow */}
               <div className="absolute inset-0 bg-gradient-to-br from-[#4EA1FF]/0 to-[#4EA1FF]/5 group-hover:to-[#7CC7FF]/10 transition-colors duration-500 opacity-0 group-hover:opacity-100" />

               <div className="relative z-10 flex justify-between items-start mb-6">
                 <div className="w-12 h-12 rounded-[14px] bg-white/[0.03] border border-white/[0.08] flex items-center justify-center group-hover:border-[#7CC7FF]/40 group-hover:bg-[#7CC7FF]/10 transition-colors shadow-inner group-hover:shadow-[0_0_15px_rgba(78,161,255,0.2)]">
                   <agent.icon className="w-5 h-5 text-[#778493] group-hover:text-[#7CC7FF] transition-colors" />
                 </div>
                 <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.1 }} viewport={{ once: true }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#22C55E]/20 bg-[#22C55E]/5 shadow-[0_0_10px_rgba(34,197,94,0.05)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shadow-[0_0_5px_#22C55E]" />
                    <span className="text-[9px] font-bold text-[#778493] tracking-widest group-hover:text-[#E8EDF3] transition-colors uppercase">ACTIVE</span>
                 </motion.div>
               </div>

               <div className="relative z-10 mb-6">
                 <h3 className="text-[17px] font-bold text-white mb-2">{agent.name}</h3>
                 <p className="text-[13px] text-[#778493] leading-relaxed pr-2">{agent.desc}</p>
               </div>

               <div className="relative z-10 flex items-end justify-between mt-auto pt-4 border-t border-white/[0.04]">
                 <div className="w-16 h-4 opacity-50 group-hover:opacity-100 transition-opacity">
                    <svg viewBox="0 0 100 20" className="w-full h-full overflow-visible">
                       <motion.path d="M0 10 Q10 20 20 10 T40 10 T60 15 T80 5 T100 10" fill="none" stroke="#4EA1FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                         initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.8 + i*0.1 }} viewport={{ once: true }} />
                    </svg>
                 </div>
                 <span className="text-[11px] font-medium text-[#4EA1FF] group-hover:text-[#7CC7FF] transition-colors">{agent.activity}</span>
               </div>
            </motion.div>
          ))}
        </motion.div>




        {/* Bottom Trust Strip */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.5 }} viewport={{ once: true }}
          className="max-w-[1200px] mx-auto rounded-[24px] border border-white/[0.08] bg-[#0E1116]/70 backdrop-blur-xl p-8 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-20"
        >
           <div className="flex items-center gap-5 flex-1">
              <div className="w-14 h-14 shrink-0 rounded-full bg-gradient-to-br from-[#4EA1FF]/20 to-[#7CC7FF]/10 flex items-center justify-center border border-[#7CC7FF]/20 relative overflow-hidden">
                 <div className="absolute inset-0 bg-[#7CC7FF]/20 blur-[10px]" />
                 <Sparkles className="w-6 h-6 text-[#7CC7FF] relative z-10" />
              </div>
              <div>
                <div className="text-[16px] font-bold text-white mb-1">One workspace. Six agents.</div>
                <div className="text-[14px] text-[#778493]">All working together to protect margins, reduce risk, and drive business impact.</div>
              </div>
           </div>

           <div className="hidden md:block w-px h-16 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

           <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-left">
              <div className="flex flex-col gap-1.5">
                 <div className="flex items-center gap-2 text-[#E8EDF3] font-bold text-[17px]"><Activity className="w-4 h-4 text-[#7CC7FF]" /> 24/7</div>
                 <div className="text-[13px] text-[#778493]">Continuous monitoring</div>
              </div>
              <div className="flex flex-col gap-1.5">
                 <div className="flex items-center gap-2 text-[#E8EDF3] font-bold text-[17px]"><TrendingUp className="w-4 h-4 text-[#7CC7FF]" /> 100%</div>
                 <div className="text-[13px] text-[#778493]">AI-powered analysis</div>
              </div>
              <div className="flex flex-col gap-1.5">
                 <div className="flex items-center gap-2 text-[#E8EDF3] font-bold text-[17px]"><ShieldCheck className="w-4 h-4 text-[#7CC7FF]" /> Human in control</div>
                 <div className="text-[13px] text-[#778493]">Every action requires approval</div>
              </div>
           </div>
        </motion.div>

      </div>
    </section>
  );
}
// ── Section 9: Security & Trust ───────────────────────────────────────────────
function SecurityStageCard({ num, icon: Icon, title, desc, delay, isOutput }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay }}
      className={`group relative flex flex-col items-center text-center p-6 rounded-[20px] border border-white/[0.08] bg-[#0E1116]/80 backdrop-blur-md hover:border-[#4EA1FF]/60 transition-all w-full xl:w-[200px] shrink-0 shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(78,161,255,0.2)] z-10 h-[340px] ${isOutput ? "border-[#7CC7FF]/30 shadow-[0_0_20px_rgba(78,161,255,0.1)]" : ""}`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#4EA1FF]/0 to-[#4EA1FF]/10 group-hover:to-[#4EA1FF]/20 rounded-[20px] pointer-events-none transition-colors" />
      <div className="w-10 h-10 rounded-full bg-[#4EA1FF]/15 border border-[#4EA1FF]/30 flex items-center justify-center text-[13px] font-bold text-[#7CC7FF] mb-5 shadow-inner">
        {num}
      </div>
      <div className="mb-5 text-[#778493] group-hover:text-[#7CC7FF] transition-colors relative">
        <div className="absolute inset-0 bg-[#7CC7FF]/20 blur-[15px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        <Icon className="w-10 h-10 drop-shadow-[0_0_10px_rgba(78,161,255,0)] group-hover:drop-shadow-[0_0_20px_rgba(78,161,255,0.8)] transition-all relative z-10" strokeWidth={1.5} />
      </div>
      <h3 className="text-[17px] font-extrabold text-white mb-3 leading-tight tracking-tight">{title}</h3>
      <p className="text-[13px] text-[#778493] leading-relaxed group-hover:text-[#778493] transition-colors">{desc}</p>
    </motion.div>
  );
}

function SecuritySection() {
  const policies = [
    { icon: Users, label: "Finance team", desc: "Full access", color: "bg-[#22C55E]", dotBorder: "border-[#22C55E]/40" },
    { icon: User, label: "Ops team", desc: "Limited access", color: "bg-[#F59E0B]", dotBorder: "border-[#F59E0B]/40" },
    { icon: Eye, label: "External advisor", desc: "View only", color: "bg-[#7CC7FF]", dotBorder: "border-[#7CC7FF]/40" },
    { icon: Bot, label: "AI Agent", desc: "Prepare only", color: "bg-[#7CC7FF]", dotBorder: "border-[#7CC7FF]/40" },
    { icon: ShieldCheck, label: "External execution", desc: "Requires approval", color: "bg-[#EF4444]", dotBorder: "border-[#EF4444]/40" }
  ];

  const compliance = [
    { icon: Lock, title: "Encryption", desc: "at rest & in transit" },
    { icon: Users, title: "RBAC", desc: "Role-based access" },
    { icon: ShieldCheck, title: "SSO", desc: "Single sign-on support" },
    { icon: FileText, title: "Audit logs", desc: "Immutable & traceable" },
    { icon: Globe, title: "Data residency", desc: "Region-specific storage" },
    { icon: EyeOff, title: "No public model training", desc: "Your data stays yours" },
    { icon: Database, title: "Private deployment options", desc: "On-prem or private cloud" },
    { icon: Shield, title: "SOC 2 readiness", desc: "Security controls aligned" }
  ];

  return (
    <section id="security" className="bg-transparent py-24 md:py-32 xl:py-40 bg-[#080A0E] relative overflow-hidden flex flex-col items-center border-t border-white/5">

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Main Central Glow */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 0.2 }} transition={{ duration: 2, ease: "easeOut" }} viewport={{ once: true }}
          className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[800px] bg-gradient-to-b from-[#4EA1FF]/30 via-[#7CC7FF]/10 to-transparent blur-[150px]" />

        {/* Cinematic Light Beams */}
        <motion.div initial={{ opacity: 0, x: -100 }} whileInView={{ opacity: 0.15, x: 0 }} transition={{ duration: 2, delay: 0.5, ease: "easeOut" }} viewport={{ once: true }}
          className="absolute top-[20%] -left-[20%] w-[50%] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(78,161,255,0.4)_0%,transparent_70%)] blur-[80px]" />
        <motion.div initial={{ opacity: 0, x: 100 }} whileInView={{ opacity: 0.15, x: 0 }} transition={{ duration: 2, delay: 0.7, ease: "easeOut" }} viewport={{ once: true }}
          className="absolute top-[30%] -right-[20%] w-[50%] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.3)_0%,transparent_70%)] blur-[80px]" />
      </div>

      <div className="w-[94vw] max-w-[1680px] mx-auto relative z-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20, filter: "blur(10px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="mb-24 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 mb-6 border border-[#4EA1FF]/40 bg-[#4EA1FF]/10 px-5 py-2 rounded-full backdrop-blur-sm shadow-[0_0_20px_rgba(78,161,255,0.2)]">
            <ShieldCheck className="w-4 h-4 text-[#7CC7FF]" />
            <span className="text-[11px] font-bold tracking-[0.25em] text-[#7CC7FF] uppercase">02 SECURITY & TRUST</span>
          </div>
          <h2 className="text-[48px] md:text-[64px] font-extrabold text-white mb-6 tracking-tight leading-[1.1]">
            Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7CC7FF] via-[#7CC7FF] to-[#7CC7FF]">sensitive business data</span>
          </h2>
          <p className="text-[#778493] text-[20px] max-w-[800px] leading-relaxed font-medium">
            GENIUS is designed from the ground up for enterprise teams that handle financial, operational, vendor, and customer data.
          </p>
        </motion.div>

        {/* Main Pipeline Layout */}
        <div className="flex flex-col xl:flex-row items-center xl:items-center justify-between gap-6 xl:gap-8 mb-24 relative w-full">

          {/* Main Horizontal Connection Line (Behind Stages) */}
          <div className="hidden xl:block absolute top-[170px] left-[100px] right-[400px] h-[3px] bg-[#4EA1FF]/30 z-0 shadow-[0_0_15px_rgba(78,161,255,0.6)]">
             {/* Animated Data Packets */}
             <motion.div animate={{ left: ["0%", "100%"] }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
               className="absolute top-1/2 -translate-y-1/2 w-[150px] h-[3px] bg-gradient-to-r from-transparent via-[#7CC7FF] to-transparent shadow-[0_0_20px_#7CC7FF]" />

             {/* Verification Dots */}
             <div className="absolute top-1/2 -translate-y-1/2 left-[20%] w-6 h-6 rounded-full bg-[#4EA1FF]/40 border border-[#7CC7FF]/60 flex items-center justify-center backdrop-blur-sm z-10 shadow-[0_0_20px_rgba(78,161,255,0.5)]">
               <Check className="w-3.5 h-3.5 text-[#7CC7FF]" strokeWidth={3} />
             </div>
             <div className="absolute top-1/2 -translate-y-1/2 left-[50%] w-6 h-6 rounded-full bg-[#4EA1FF]/40 border border-[#7CC7FF]/60 flex items-center justify-center backdrop-blur-sm z-10 shadow-[0_0_20px_rgba(78,161,255,0.5)]">
               <Check className="w-3.5 h-3.5 text-[#7CC7FF]" strokeWidth={3} />
             </div>
             <div className="absolute top-1/2 -translate-y-1/2 left-[75%] w-6 h-6 rounded-full bg-[#4EA1FF]/40 border border-[#7CC7FF]/60 flex items-center justify-center backdrop-blur-sm z-10 shadow-[0_0_20px_rgba(78,161,255,0.5)]">
               <Check className="w-3.5 h-3.5 text-[#7CC7FF]" strokeWidth={3} />
             </div>
          </div>

          {/* Visual Connection to Access Console */}
          <div className="hidden xl:block absolute top-[170px] right-[320px] w-[80px] h-[3px] bg-gradient-to-r from-[#4EA1FF]/30 to-[#7CC7FF]/80 z-0 shadow-[0_0_20px_rgba(78,161,255,0.6)]" />

          {/* Pipeline Stages */}
          <SecurityStageCard num="01" icon={BarChart2} title="Sensitive Data" desc="Financial, vendor, operational, and customer records." delay={0.2} />
          <SecurityStageCard num="02" icon={Lock} title="Secure Intake" desc="Encrypted upload, structured extraction, and source validation." delay={0.3} />

          {/* Central Core: Private Workspace */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }}
            className="relative flex flex-col items-center justify-between p-8 pt-12 rounded-[28px] border border-[#7CC7FF]/40 bg-[#0E1116]/95 backdrop-blur-2xl shrink-0 w-full xl:w-[320px] shadow-[0_20px_60px_rgba(78,161,255,0.3),inset_0_0_30px_rgba(78,161,255,0.15)] z-20 h-auto min-h-[420px]"
          >
             <div className="absolute inset-0 bg-gradient-to-b from-[#7CC7FF]/10 to-transparent rounded-[28px] pointer-events-none" />

             {/* Core Badge - Overlapping the border */}
             <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-[60px] h-8 rounded-full bg-[#0E1116] border border-[#7CC7FF]/60 flex items-center justify-center text-[13px] font-extrabold text-white shadow-[0_0_15px_rgba(78,161,255,0.4)] z-30">
               03
             </div>

             {/* Sophisticated Data Core Visual */}
             <div className="relative w-full flex-1 flex flex-col items-center justify-center mb-6 mt-2">
               <div className="text-[9px] font-bold tracking-[0.25em] text-[#7CC7FF]/70 uppercase mb-5">Secure Container</div>
               <div className="relative flex items-center justify-center">
                 {/* Outer Container Ring / Shield */}
                 <div className="absolute w-[160px] h-[160px] rounded-full border border-dashed border-[#4EA1FF]/30 animate-[spin_40s_linear_infinite]" />
                 <div className="absolute w-[120px] h-[120px] rounded-full border border-[#7CC7FF]/20 animate-[spin_30s_linear_infinite_reverse]" />

                 {/* Ambient Core Glow */}
                 <div className="absolute w-[100px] h-[100px] bg-[#4EA1FF]/40 blur-[35px] rounded-full animate-pulse" />

                 {/* 3D Cube Core */}
                 <svg viewBox="0 0 100 100" className="w-[75px] h-[75px] text-[#7CC7FF] drop-shadow-[0_0_20px_rgba(78,161,255,0.9)] relative z-10">
                    <path d="M50 15 L85 35 L85 75 L50 95 L15 75 L15 35 Z" fill="rgba(10,16,28,0.9)" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
                    {/* Inner glowing cube surfaces */}
                    <path d="M50 15 L85 35 L50 55 L15 35 Z" fill="rgba(78,161,255,0.15)" />
                    <path d="M15 35 L50 55 L50 95 L15 75 Z" fill="rgba(78,161,255,0.1)" />
                    <path d="M85 35 L50 55 L50 95 L85 75 Z" fill="rgba(78,161,255,0.2)" />

                    <path d="M50 15 L50 55 L85 35" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" opacity="1" />
                    <path d="M50 55 L15 35" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" opacity="1" />
                    <path d="M50 55 L50 95" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" opacity="1" />

                    {/* Inner Data Core Dot */}
                    <circle cx="50" cy="55" r="3.5" fill="#fff" className="animate-pulse shadow-[0_0_10px_#fff]" />
                 </svg>
               </div>
             </div>

             <div className="flex flex-col items-center mt-auto w-full">
               <h3 className="text-[19px] font-extrabold text-white mb-2">Private Workspace</h3>
               <p className="text-[12px] text-[#778493] text-center leading-relaxed mb-6 px-2 font-medium">Customer data stays separated inside a controlled workspace.</p>

               <div className="grid grid-cols-2 gap-2.5 w-full">
                 <div className="flex items-center justify-center gap-1.5 bg-[#0E1116]/90 border border-[#4EA1FF]/40 rounded-[10px] py-2 text-[11px] text-[#7CC7FF] font-bold tracking-wide shadow-inner group hover:bg-[#4EA1FF]/15 transition-colors"><Lock className="w-3.5 h-3.5" /> Private</div>
                 <div className="flex items-center justify-center gap-1.5 bg-[#0E1116]/90 border border-[#4EA1FF]/40 rounded-[10px] py-2 text-[11px] text-[#7CC7FF] font-bold tracking-wide shadow-inner group hover:bg-[#4EA1FF]/15 transition-colors"><ShieldCheck className="w-3.5 h-3.5" /> Encrypted</div>
                 <div className="flex items-center justify-center gap-1.5 bg-[#0E1116]/90 border border-[#4EA1FF]/40 rounded-[10px] py-2 text-[11px] text-[#7CC7FF] font-bold tracking-wide shadow-inner group hover:bg-[#4EA1FF]/15 transition-colors"><Users className="w-3.5 h-3.5" /> Controlled</div>
                 <div className="flex items-center justify-center gap-1.5 bg-[#0E1116]/90 border border-[#4EA1FF]/40 rounded-[10px] py-2 text-[11px] text-[#7CC7FF] font-bold tracking-wide shadow-inner group hover:bg-[#4EA1FF]/15 transition-colors"><FileText className="w-3.5 h-3.5" /> Logged</div>
               </div>
             </div>
          </motion.div>

          <SecurityStageCard num="04" icon={Users} title="Permission Layer" desc="Role-based access, owner controls, and least-privilege permissions." delay={0.5} />
          <SecurityStageCard num="05" icon={FileText} title="Audit Ledger" desc="Every finding, approval, rejection, and action is recorded." delay={0.6} />
          <SecurityStageCard num="06" icon={UserCheck} title="Human-Controlled Output" desc="No sensitive action happens without human confirmation." delay={0.7} isOutput={true} />

          {/* Right Panel: Access Policy Console */}
          <div className="flex flex-col shrink-0 w-full xl:w-[310px] z-20 xl:-ml-4 relative h-full min-h-[400px]">
             <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.8 }}
               className="flex flex-col p-6 rounded-[24px] border border-white/[0.08] bg-[#0E1116]/95 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(78,161,255,0.05)] relative h-full justify-between"
             >
                {/* Visual connection dot on the left side of the console */}
                {/* Removed per user request */}

                <div className="text-[11px] font-bold tracking-[0.15em] text-[#778493] uppercase mb-4 pb-4 border-b border-white/[0.06] w-full text-center">
                  ACCESS POLICY CONSOLE
                </div>

                <div className="flex flex-col gap-2.5">
                  {policies.map((p, i) => (
                    <div key={i} className="flex items-center gap-3.5 p-2 rounded-xl border border-transparent hover:border-white/[0.06] hover:bg-white/[0.02] transition-colors group cursor-default">
                       <div className="w-9 h-9 rounded-[10px] bg-[#4EA1FF]/10 border border-[#4EA1FF]/20 flex items-center justify-center shrink-0 group-hover:bg-[#4EA1FF]/20 transition-colors shadow-inner">
                         <p.icon className="w-4 h-4 text-[#778493] group-hover:text-white transition-colors" />
                       </div>
                       <div className="flex-1">
                         <div className="text-[13px] font-bold text-[#E8EDF3] leading-tight mb-0.5">{p.label}</div>
                         <div className="text-[11px] text-[#778493] font-medium">{p.desc}</div>
                       </div>
                       <div className={`w-2.5 h-2.5 rounded-full border ${p.dotBorder} flex items-center justify-center shrink-0 mr-1`}>
                         <div className={`w-1.5 h-1.5 rounded-full ${p.color}`} />
                       </div>
                    </div>
                  ))}
                </div>
             </motion.div>
          </div>
        </div>

        {/* Compliance Strip */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1 }} viewport={{ once: true }}
          className="w-full max-w-[1600px] mx-auto rounded-[24px] border border-white/[0.08] bg-[#0E1116]/70 backdrop-blur-2xl p-10 lg:px-14 shadow-[0_30px_60px_rgba(0,0,0,0.4)] mb-14"
        >
           <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-8">
             {compliance.map((b, i) => (
               <div key={i} className="flex items-start gap-5 group cursor-default">
                 <div className="w-12 h-12 shrink-0 rounded-[14px] bg-gradient-to-br from-[#4EA1FF]/10 to-[#7CC7FF]/5 border border-[#4EA1FF]/30 flex items-center justify-center group-hover:bg-[#4EA1FF]/20 group-hover:border-[#7CC7FF]/50 transition-colors shadow-inner relative overflow-hidden">
                   <div className="absolute inset-0 bg-[#7CC7FF]/10 opacity-0 group-hover:opacity-100 transition-opacity blur-[5px]" />
                   <b.icon className="w-5 h-5 text-[#778493] group-hover:text-[#7CC7FF] transition-colors relative z-10" strokeWidth={1.5} />
                 </div>
                 <div>
                   <div className="text-[16px] font-extrabold text-[#E8EDF3] mb-1.5 group-hover:text-white transition-colors leading-tight">{b.title}</div>
                   <div className="text-[14px] text-[#778493] leading-snug font-medium">{b.desc}</div>
                 </div>
               </div>
             ))}
           </div>
        </motion.div>

        {/* Bottom Trust Statement */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1, delay: 1.2 }} viewport={{ once: true }}
          className="text-center text-[22px] text-[#778493] flex justify-center"
        >
          <div className="inline-flex items-center justify-center gap-4 px-8 py-3 rounded-full border border-white/[0.03] bg-[#0E1116]/50 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
            <Fingerprint className="w-7 h-7 text-[#4EA1FF]" strokeWidth={1.5} />
            <span className="font-medium tracking-wide">
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#4EA1FF] to-[#7CC7FF]">Security</span> by design.{" "}
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#7CC7FF] to-[#7CC7FF]">Human control</span> by default.
            </span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
// ── Section 10: Future Vision / Roadmap ──────────────────────────────────────
function FutureSection() {
  const roadmapCards = [
    { num: "01", icon: Rocket, title: "MVP", desc: "Manual upload, evidence extraction, diagnostics, savings radar, approvals, and reports.", active: true, color: "from-[#7CC7FF] to-[#4EA1FF]", dotColor: "bg-[#7CC7FF]", shadow: "shadow-[0_0_30px_rgba(78,161,255,0.4)]", glow: "rgba(78,161,255,0.5)" },
    { num: "02", icon: Database, title: "Workspace Memory", desc: "Company profile, vendors, owners, departments, thresholds, and recurring checks.", color: "from-white/10 to-transparent", dotColor: "bg-[#7CC7FF]", shadow: "shadow-none", glow: "transparent" },
    { num: "03", icon: Puzzle, title: "Browser Extension", desc: "Capture evidence from SaaS tools without heavy integrations.", color: "from-white/10 to-transparent", dotColor: "bg-[#7CC7FF]", shadow: "shadow-none", glow: "transparent" },
    { num: "04", icon: Network, title: "Deep Integrations", desc: "QuickBooks, Xero, HubSpot, Salesforce, Slack, Gmail, and Google Drive.", color: "from-white/10 to-transparent", dotColor: "bg-[#4EA1FF]", shadow: "shadow-none", glow: "transparent" },
    { num: "05", icon: Store, title: "Agent Marketplace", desc: "Specialized agents for industries, departments, and business workflows.", color: "from-white/10 to-transparent", dotColor: "bg-[#7CC7FF]", shadow: "shadow-none", glow: "transparent" },
    { num: "06", icon: Code2, title: "Open Developer API", desc: "Third-party developers can build custom agents on GENIUS infrastructure.", color: "from-white/10 to-transparent", dotColor: "bg-[#7CC7FF]", shadow: "shadow-none", glow: "transparent" },
    { num: "07", icon: Shield, title: "Enterprise Readiness", desc: "SSO, RBAC, audit logs, SOC 2 readiness, data residency, and private deployment.", color: "from-white/10 to-transparent", dotColor: "bg-[#7CC7FF]", shadow: "shadow-none", glow: "transparent" },
  ];

  const strategy = [
    { num: "1", icon: Target, title: "Focused MVP", desc: "Spend, contracts, invoices, approvals, and reports." },
    { num: "2", icon: Layers, title: "Compounding Workspace Memory", desc: "Every vendor, owner, threshold, and decision improves future analysis." },
    { num: "3", icon: TrendingUp, title: "Platform Expansion", desc: "Agents, integrations, APIs, and enterprise controls create long-term leverage." }
  ];

  return (
    <section id="roadmap" className="bg-transparent py-24 md:py-32 xl:py-40 bg-[#080A0E] relative overflow-hidden flex flex-col items-center border-t border-white/5">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[30%] left-[20%] w-[800px] h-[500px] bg-[#4EA1FF]/20 blur-[150px] mix-blend-screen" />
        <div className="absolute top-[40%] right-[20%] w-[800px] h-[500px] bg-[#7CC7FF]/15 blur-[150px] mix-blend-screen" />
      </div>

      <div className="w-[96vw] max-w-[1700px] mx-auto relative z-10 flex flex-col items-center">

        {/* Header Area */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-16 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 mb-6 border border-[#7CC7FF]/30 bg-[#7CC7FF]/10 px-5 py-2 rounded-full backdrop-blur-sm">
            <Target className="w-4 h-4 text-[#7CC7FF]" />
            <span className="text-[11px] font-bold tracking-[0.25em] text-[#7CC7FF] uppercase">03 FUTURE VISION / ROADMAP</span>
          </div>
          <h2 className="text-[48px] md:text-[60px] font-extrabold text-white mb-6 tracking-tight leading-[1.1]">
            Starting focused. <br /> Built to become a <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4EA1FF] via-[#7CC7FF] to-[#7CC7FF]">platform.</span>
          </h2>
          <p className="text-[#778493] text-[18px] max-w-[800px] leading-relaxed font-medium mb-8">
            GENIUS starts as a focused ROI product and expands into the unified AI command layer for business operations.
          </p>
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full border border-white/10 bg-white/[0.03] shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <Target className="w-5 h-5 text-[#7CC7FF]" />
            <span className="text-[14px] font-medium text-[#778493]">
              <span className="text-[#7CC7FF] font-bold">Start narrow. Prove ROI.</span> Expand into the operating layer.
            </span>
          </div>
        </motion.div>

        {/* Roadmap Grid Area */}
        <div className="w-full relative flex flex-col items-center mb-24">

          {/* Top Cards */}
          <div className="flex flex-row justify-between w-full gap-4 items-end mb-8 relative z-20">
            {roadmapCards.map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`relative flex flex-col items-center text-center p-5 rounded-[16px] border w-full flex-1 min-h-[260px] backdrop-blur-md transition-all group ${card.active ? 'border-[#7CC7FF] bg-[#0E1116]/90 shadow-[0_0_30px_rgba(78,161,255,0.2)]' : 'border-white/[0.05] bg-[#0E1116]/60 hover:border-white/[0.15] hover:bg-[#0E1116]/90'}`}
              >
                {/* Active specific UI */}
                {card.active && (
                  <>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#4EA1FF] text-[9px] font-extrabold text-white tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(78,161,255,0.6)] whitespace-nowrap">
                      Current Focus
                    </div>
                    {/* Glow underneath the card active */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[2px] h-10 bg-[#7CC7FF] z-0 shadow-[0_0_15px_#7CC7FF]" />
                  </>
                )}

                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold mb-4 shadow-inner ${card.active ? 'bg-[#4EA1FF] text-white border-transparent' : 'bg-white/[0.05] text-[#7CC7FF] border border-[#7CC7FF]/30'}`}>
                  {card.num}
                </div>

                <div className={`mb-4 transition-colors ${card.active ? 'text-[#7CC7FF]' : 'text-[#778493] group-hover:text-[#778493]'}`}>
                  <card.icon className={`w-10 h-10 ${card.active ? 'drop-shadow-[0_0_15px_rgba(78,161,255,0.8)]' : ''}`} strokeWidth={1.5} />
                </div>

                <h3 className={`text-[15px] font-extrabold mb-2 leading-tight tracking-tight ${card.active ? 'text-white' : 'text-[#E8EDF3]'}`}>{card.title}</h3>
                <p className="text-[11px] text-[#778493] leading-relaxed px-1">{card.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Timeline Bar */}
          <div className="relative w-full h-[3px] bg-white/10 rounded-full mb-10 flex items-center z-10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <motion.div initial={{ width: "0%" }} whileInView={{ width: "100%" }} viewport={{ once: true }} transition={{ duration: 2, ease: "easeInOut" }}
              className="absolute left-0 top-0 bottom-0 rounded-full bg-gradient-to-r from-[#7CC7FF] via-[#7CC7FF] to-[#7CC7FF] shadow-[0_0_15px_rgba(139,92,246,0.6)]" />

            {/* Dots */}
            <div className="absolute inset-0 flex justify-between px-[5%]">
              {roadmapCards.map((card, i) => (
                <div key={i} className="h-full flex items-center justify-center relative">
                  <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.2 + 0.5 }}
                    className={`w-4 h-4 rounded-full border-2 border-[#080A0E] ${card.dotColor} shadow-[0_0_10px_${card.dotColor}] z-20`} />
                  <div className="absolute -bottom-8 text-[11px] font-bold text-[#778493]">{card.num}</div>
                </div>
              ))}
            </div>
            {/* Animated Pulse */}
            <motion.div animate={{ left: ["0%", "100%"] }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
               className="absolute top-1/2 -translate-y-1/2 w-[100px] h-[3px] bg-white shadow-[0_0_20px_#fff] blur-[1px] z-20 rounded-full" />
          </div>

          {/* 3D Platform Layers */}
          <div className="flex flex-row justify-between w-full gap-3 items-stretch relative z-10 mt-6">

            {/* Platform 1 */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
              className="flex-1 flex flex-col items-center justify-center p-4 rounded-xl border border-[#7CC7FF]/40 border-b-[8px] border-b-[#4EA1FF] bg-gradient-to-b from-[#4EA1FF]/20 to-[#0E1116] shadow-[0_15px_30px_rgba(78,161,255,0.3)] relative min-h-[140px]"
            >
              <div className="absolute -top-3 px-2 py-0.5 rounded text-[8px] font-bold bg-[#4EA1FF] text-white tracking-widest uppercase">Focused Wedge</div>
              <h4 className="text-[22px] font-extrabold text-white mt-2 italic pr-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">MVP</h4>
            </motion.div>

            {/* Platform 2 */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }}
              className="w-[26%] flex flex-col items-center justify-center p-4 rounded-xl border border-[#7CC7FF]/20 border-b-[8px] border-b-[#7CC7FF]/60 bg-gradient-to-b from-[#7CC7FF]/10 to-[#0E1116] shadow-[0_15px_30px_rgba(78,161,255,0.15)] relative min-h-[140px]"
            >
              <div className="absolute -top-3 text-[9px] font-bold text-[#778493] tracking-widest uppercase">Foundation</div>
              <div className="flex items-center justify-center gap-4 mt-2">
                 <div className="flex items-center gap-2 text-[#E8EDF3]"><Database className="w-5 h-5 text-[#7CC7FF]" strokeWidth={1.5} /><span className="text-[12px] font-bold leading-tight">Workspace<br/>Memory</span></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-[#7CC7FF]/50" />
                 <div className="flex items-center gap-2 text-[#E8EDF3]"><Puzzle className="w-5 h-5 text-[#7CC7FF]" strokeWidth={1.5} /><span className="text-[12px] font-bold leading-tight">Browser<br/>Extension</span></div>
              </div>
            </motion.div>

            {/* Platform 3 */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }}
              className="flex-1 flex flex-col items-center justify-center p-4 rounded-xl border border-[#7CC7FF]/20 border-b-[8px] border-b-[#7CC7FF]/60 bg-gradient-to-b from-[#7CC7FF]/10 to-[#0E1116] shadow-[0_15px_30px_rgba(139,92,246,0.15)] relative min-h-[140px]"
            >
              <div className="absolute -top-3 text-[9px] font-bold text-[#778493] tracking-widest uppercase">Connectivity</div>
              <div className="flex items-center gap-3 mt-2 text-[#E8EDF3]"><Network className="w-6 h-6 text-[#7CC7FF]" strokeWidth={1.5} /><span className="text-[13px] font-bold">Deep Integrations</span></div>
            </motion.div>

            {/* Platform 4 */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.5 }}
              className="flex-1 flex flex-col items-center justify-center p-4 rounded-xl border border-[#7CC7FF]/20 border-b-[8px] border-b-[#7CC7FF]/60 bg-gradient-to-b from-[#7CC7FF]/10 to-[#0E1116] shadow-[0_15px_30px_rgba(168,85,247,0.15)] relative min-h-[140px]"
            >
              <div className="absolute -top-3 text-[9px] font-bold text-[#778493] tracking-widest uppercase">Intelligence Layer</div>
              <div className="flex items-center gap-3 mt-2 text-[#E8EDF3]"><Store className="w-6 h-6 text-[#7CC7FF]" strokeWidth={1.5} /><span className="text-[13px] font-bold">Agent Marketplace</span></div>
            </motion.div>

            {/* Platform 5 */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.6 }}
              className="w-[26%] flex flex-col items-center justify-center p-4 rounded-xl border border-[#7CC7FF]/20 border-b-[8px] border-b-[#7CC7FF]/60 bg-gradient-to-b from-[#7CC7FF]/10 to-[#0E1116] shadow-[0_15px_30px_rgba(192,132,252,0.15)] relative min-h-[140px]"
            >
              <div className="absolute -top-3 text-[9px] font-bold text-[#778493] tracking-widest uppercase">Platform Layer</div>
              <div className="flex items-center justify-center gap-5 mt-2">
                 <div className="flex items-center gap-2 text-[#E8EDF3]"><Code2 className="w-6 h-6 text-[#7CC7FF]" strokeWidth={1.5} /><span className="text-[12px] font-bold leading-tight">Open<br/>Developer API</span></div>
                 <div className="w-[1px] h-8 bg-white/10" />
                 <div className="flex items-center gap-2 text-[#E8EDF3]"><Shield className="w-5 h-5 text-[#7CC7FF]" strokeWidth={1.5} /><span className="text-[12px] font-bold leading-tight">Enterprise<br/>Readiness</span></div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Bottom Strategic Strip */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1 }} viewport={{ once: true }}
          className="w-full max-w-[1500px] rounded-[24px] border border-white/[0.05] bg-[#0E1116]/60 backdrop-blur-md p-8 shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/[0.05]">
            {strategy.map((s, i) => (
              <div key={i} className={`flex items-start gap-4 ${i !== 0 ? 'md:pl-8 pt-8 md:pt-0' : ''}`}>
                 <div className="w-12 h-12 rounded-full bg-[#4EA1FF]/10 border border-[#4EA1FF]/20 flex items-center justify-center shrink-0">
                   <s.icon className="w-5 h-5 text-[#7CC7FF]" strokeWidth={1.5} />
                 </div>
                 <div>
                   <h4 className="text-[16px] font-extrabold text-[#E8EDF3] mb-2">{s.num}. {s.title}</h4>
                   <p className="text-[13px] text-[#778493] leading-relaxed">{s.desc}</p>
                 </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
// ── Section 11: Final CTA ─────────────────────────────────────────────────────
function CTASection({ onEnter }) {
  const uploadData = [
    { icon: FileText, label: "Invoices", formats: "PDF, CSV, XLSX", check: true },
    { icon: FileText, label: "Contracts", formats: "PDF, DOCX", check: true },
    { icon: FileSpreadsheet, label: "Spreadsheets", formats: "XLSX, CSV", check: true },
    { icon: Users, label: "CRM Export", formats: "CSV", check: true },
    { icon: BarChart3, label: "Ad Reports", formats: "CSV, XLSX", check: false, status: "Optional" },
  ];

  const findings = [
    { num: 1, text: "Unused software seats", category: "Software", status: "Evidence-backed", color: "text-[#22C55E]", bg: "bg-[#22C55E]/10 border-[#22C55E]/30" },
    { num: 2, text: "Duplicate vendor invoice", category: "Finance", status: "Evidence-backed", color: "text-[#22C55E]", bg: "bg-[#22C55E]/10 border-[#22C55E]/30" },
    { num: 3, text: "Renewal price increase", category: "Contracts", status: "Needs review", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10 border-[#F59E0B]/30" },
  ];

  const timelineSteps = [
    { title: "Upload sample files", desc: "Use invoices, contracts, spreadsheets, CRM exports, or ad reports.", icon: Upload },
    { title: "GENIUS runs diagnostic scan", desc: "AI checks for duplicate spend, unused licenses, renewal risks, vendor issues, and anomalies.", icon: Brain },
    { title: "Findings are verified", desc: "Every issue is linked to source evidence and confidence signals.", icon: ShieldCheck },
    { title: "You receive a review-ready summary", desc: "Your team sees what may be leaking and decides the next step.", icon: FileText },
  ];

  return (
    <section id="trial-audit" className="bg-transparent py-24 md:py-32 xl:py-40 xl: bg-[#080A0E] relative overflow-hidden flex flex-col items-center border-t border-white/5">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0.1, 0.25, 0.1], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[1200px] h-[700px] bg-gradient-to-b from-[#4EA1FF]/30 via-[#7CC7FF]/10 to-transparent blur-[120px] mix-blend-screen rounded-full"
        />
      </div>

      <div className="w-[96vw] max-w-[1600px] mx-auto relative z-10 flex flex-col items-center">

        {/* Top Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-16 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 mb-6 border border-[#7CC7FF]/30 bg-[#7CC7FF]/10 px-5 py-2 rounded-full backdrop-blur-sm shadow-[0_0_20px_rgba(78,161,255,0.1)] cursor-default">
            <span className="text-[11px] font-bold tracking-[0.25em] text-[#7CC7FF] uppercase">04 GET STARTED</span>
          </div>
          <h2 className="text-[48px] md:text-[64px] font-extrabold text-white mb-2 tracking-tight leading-[1.1]">
            Start with a trial audit.
          </h2>
          <h2 className="text-[40px] md:text-[48px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#7CC7FF] via-[#4EA1FF] to-[#7CC7FF] mb-6 tracking-tight leading-[1.1]">
            See where money may be leaking.
          </h2>
          <p className="text-[#778493] text-[16px] xl:text-[18px] max-w-[900px] leading-relaxed font-medium mb-10">
            Upload sample invoices, contracts, spreadsheets, CRM exports, or ad reports.<br className="hidden xl:block" />
            GENIUS scans for leakage, verifies findings with source evidence,<br className="hidden xl:block" />
            and returns a review-ready opportunity summary.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full">
            <button onClick={onEnter} className="group relative w-full sm:w-auto bg-gradient-to-r from-[#4EA1FF] to-[#7CC7FF] text-white font-bold px-10 py-4 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(78,161,255,0.3)] overflow-hidden">
               <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
               <span className="flex items-center justify-center gap-2 relative z-10">
                 Start Trial Audit <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
               </span>
            </button>
            <button className="group w-full sm:w-auto text-[15px] font-bold text-[#E8EDF3] hover:text-white transition-all px-10 py-4 border border-white/20 hover:border-white/40 bg-[#0E1116]/60 rounded-xl flex items-center justify-center gap-3 hover:bg-white/10 backdrop-blur-md">
               View Sample Report <FileText className="w-4 h-4 text-[#778493] group-hover:text-white transition-colors" />
            </button>
          </div>
        </motion.div>

        {/* Middle 3-Column Diagnostic Flow */}
        <div className="flex flex-col xl:flex-row items-center xl:items-stretch justify-between w-full relative mb-12 gap-8 xl:gap-0">

           {/* LEFT PANEL: Sample Data Intake */}
           <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
             className="w-full xl:w-[320px] flex flex-col shrink-0 z-20 relative"
           >
             <div className="flex items-center gap-3 mb-4">
               <div className="w-5 h-5 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-[10px] text-[#E8EDF3] font-bold">1</div>
               <div className="text-[11px] font-extrabold tracking-widest text-[#E8EDF3] uppercase">Sample Data Intake</div>
             </div>

             <div className="flex flex-col p-4 rounded-[20px] border border-white/[0.08] bg-[#0E1116]/80 backdrop-blur-xl gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
                {uploadData.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + (i * 0.1) }}
                    className="flex items-center justify-between p-3 rounded-[14px] border border-white/[0.04] bg-black/40 hover:bg-white/[0.05] hover:border-[#4EA1FF]/30 transition-colors group cursor-default relative overflow-hidden"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#4EA1FF]/10 border border-[#4EA1FF]/20 flex items-center justify-center shadow-inner group-hover:bg-[#4EA1FF]/20 transition-colors">
                         <item.icon className="w-5 h-5 text-[#7CC7FF]" strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-[#E8EDF3] leading-tight mb-0.5">{item.label}</div>
                        <div className="text-[10px] text-[#778493]">{item.formats}</div>
                      </div>
                    </div>
                    {item.check ? (
                      <div className="flex items-center gap-1 text-[#22C55E]">
                        <span className="text-[10px] font-bold">Uploaded</span>
                        <CheckCircle className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[#778493]">
                        <span className="text-[10px] font-bold">Optional</span>
                      </div>
                    )}
                  </motion.div>
                ))}
             </div>
           </motion.div>

           {/* CENTER PANEL: Strong Trial Audit Engine */}
           <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }}
             className="w-full flex-1 flex flex-col items-center relative min-h-[500px] xl:px-4 z-10"
           >
             <div className="flex items-center gap-3 mb-8 xl:mb-4 absolute top-0">
               <div className="w-5 h-5 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-[10px] text-[#E8EDF3] font-bold">2</div>
               <div className="text-[11px] font-extrabold tracking-widest text-[#E8EDF3] uppercase">Trial Audit Core</div>
             </div>

             {/* SVG Light Rays (Incoming & Outgoing) */}
             <svg viewBox="0 0 1000 500" className="hidden xl:block absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                <defs>
                  <linearGradient id="rayIncoming" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7CC7FF" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#4EA1FF" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="rayOutgoing" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4EA1FF" stopOpacity="0" />
                    <stop offset="100%" stopColor="#7CC7FF" stopOpacity="0.8" />
                  </linearGradient>
                </defs>

                {/* Incoming Rays (Left panel to Center) */}
                <path d="M -50,250 C 100,250 200,250 350,250" fill="none" stroke="url(#rayIncoming)" strokeWidth="3" strokeDasharray="6 6" className="animate-[pulse_2s_infinite]" />
                <path d="M -50,180 C 100,180 200,250 350,250" fill="none" stroke="url(#rayIncoming)" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
                <path d="M -50,320 C 100,320 200,250 350,250" fill="none" stroke="url(#rayIncoming)" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />

                {/* Outgoing Rays (Center to Right panel) */}
                <path d="M 650,250 C 800,250 900,250 1050,250" fill="none" stroke="url(#rayOutgoing)" strokeWidth="3" strokeDasharray="6 6" className="animate-[pulse_2s_infinite_500ms]" />
                <path d="M 650,250 C 800,250 900,180 1050,180" fill="none" stroke="url(#rayOutgoing)" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
                <path d="M 650,250 C 800,250 900,320 1050,320" fill="none" stroke="url(#rayOutgoing)" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />

                {/* Connecting Rays to Mini-Blocks */}
                <line x1="50%" y1="250" x2="22%" y2="90" stroke="#7CC7FF" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
                <line x1="50%" y1="250" x2="78%" y2="90" stroke="#7CC7FF" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
                <line x1="50%" y1="250" x2="22%" y2="410" stroke="#7CC7FF" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
                <line x1="50%" y1="250" x2="78%" y2="410" stroke="#7CC7FF" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
             </svg>

             {/* The Heart of the System (Larger Hexagon Core) */}
             <div className="relative w-full h-full flex items-center justify-center flex-1 z-20 mt-10 xl:mt-0">
                {/* Glow & Aura */}
                <div className="absolute w-[350px] h-[350px] bg-[#4EA1FF]/20 blur-[60px] rounded-full animate-[pulse_4s_ease-in-out_infinite]" />
                <div className="absolute w-[250px] h-[250px] bg-[#7CC7FF]/20 blur-[30px] rounded-full animate-[pulse_3s_ease-in-out_infinite_500ms]" />

                {/* Concentric rings */}
                <div className="absolute w-[340px] h-[340px] rounded-full border border-dashed border-[#7CC7FF]/20 animate-[spin_40s_linear_infinite]" />
                <div className="absolute w-[260px] h-[260px] rounded-full border border-[#4EA1FF]/30 animate-[spin_25s_linear_infinite_reverse]" />

                {/* The Primary Hexagon Core */}
                <div className="relative w-[150px] h-[170px] bg-gradient-to-br from-[#080A0E] to-[#0E1116] border-2 border-[#4EA1FF]/60 shadow-[0_0_60px_rgba(78,161,255,0.6),inset_0_0_40px_rgba(78,161,255,0.4)] flex items-center justify-center"
                     style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>

                   {/* Inner Layer */}
                   <div className="absolute inset-2 bg-gradient-to-t from-[#4EA1FF]/30 to-transparent flex items-center justify-center"
                        style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                      <div className="absolute inset-0 opacity-20 mix-blend-overlay [background-image:linear-gradient(30deg,rgba(255,255,255,0.16)_12%,transparent_12.5%,transparent_87%,rgba(255,255,255,0.16)_87.5%,rgba(255,255,255,0.16)),linear-gradient(150deg,rgba(255,255,255,0.16)_12%,transparent_12.5%,transparent_87%,rgba(255,255,255,0.16)_87.5%,rgba(255,255,255,0.16)),linear-gradient(30deg,rgba(255,255,255,0.16)_12%,transparent_12.5%,transparent_87%,rgba(255,255,255,0.16)_87.5%,rgba(255,255,255,0.16)),linear-gradient(150deg,rgba(255,255,255,0.16)_12%,transparent_12.5%,transparent_87%,rgba(255,255,255,0.16)_87.5%,rgba(255,255,255,0.16))] [background-size:18px_31px] [background-position:0_0,0_0,9px_16px,9px_16px]" />
                   </div>

                   <div className="text-[72px] font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-[#7CC7FF] to-[#4EA1FF] drop-shadow-[0_0_20px_rgba(78,161,255,0.8)] relative z-10">G</div>
                </div>

                {/* 4 Premium Mini-Block Modules (Replacing circular icons) */}
                {/* Top Left */}
                <div className="absolute top-[40px] left-[0%] xl:left-[6%] flex items-center gap-3 p-3 rounded-xl border border-[#7CC7FF]/40 bg-[#0E1116]/90 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_15px_rgba(78,161,255,0.2)] w-[160px] z-30 group hover:border-[#7CC7FF]/80 transition-colors">
                   <div className="w-9 h-9 rounded-lg bg-[#4EA1FF]/20 border border-[#4EA1FF]/40 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-[#4EA1FF]/40 transition-colors">
                     <Search className="w-4 h-4 text-[#7CC7FF]" />
                   </div>
                   <div className="text-[12px] font-bold text-[#E8EDF3] leading-tight group-hover:text-white transition-colors">Leakage<br/>Scan</div>
                </div>

                {/* Top Right */}
                <div className="absolute top-[40px] right-[0%] xl:right-[6%] flex items-center gap-3 p-3 rounded-xl border border-[#7CC7FF]/40 bg-[#0E1116]/90 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_15px_rgba(139,92,246,0.2)] w-[160px] z-30 group hover:border-[#7CC7FF]/80 transition-colors">
                   <div className="w-9 h-9 rounded-lg bg-[#7CC7FF]/20 border border-[#7CC7FF]/40 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-[#7CC7FF]/40 transition-colors">
                     <ShieldCheck className="w-4 h-4 text-[#7CC7FF]" />
                   </div>
                   <div className="text-[12px] font-bold text-[#E8EDF3] leading-tight group-hover:text-white transition-colors">Evidence<br/>Check</div>
                </div>

                {/* Bottom Left */}
                <div className="absolute bottom-[40px] left-[0%] xl:left-[6%] flex items-center gap-3 p-3 rounded-xl border border-[#7CC7FF]/40 bg-[#0E1116]/90 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_15px_rgba(78,161,255,0.2)] w-[160px] z-30 group hover:border-[#7CC7FF]/80 transition-colors">
                   <div className="w-9 h-9 rounded-lg bg-[#4EA1FF]/20 border border-[#4EA1FF]/40 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-[#4EA1FF]/40 transition-colors">
                     <BarChart2 className="w-4 h-4 text-[#7CC7FF]" />
                   </div>
                   <div className="text-[12px] font-bold text-[#E8EDF3] leading-tight group-hover:text-white transition-colors">Confidence<br/>Scoring</div>
                </div>

                {/* Bottom Right */}
                <div className="absolute bottom-[40px] right-[0%] xl:right-[6%] flex items-center gap-3 p-3 rounded-xl border border-[#7CC7FF]/40 bg-[#0E1116]/90 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_15px_rgba(139,92,246,0.2)] w-[160px] z-30 group hover:border-[#7CC7FF]/80 transition-colors">
                   <div className="w-9 h-9 rounded-lg bg-[#7CC7FF]/20 border border-[#7CC7FF]/40 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-[#7CC7FF]/40 transition-colors">
                     <ListTodo className="w-4 h-4 text-[#7CC7FF]" />
                   </div>
                   <div className="text-[12px] font-bold text-[#E8EDF3] leading-tight group-hover:text-white transition-colors">Opportunity<br/>Summary</div>
                </div>
             </div>

             <div className="absolute bottom-0 flex items-center gap-2 z-10 pt-4 pb-2">
                <span className="text-[12px] font-bold text-[#778493] tracking-widest uppercase">Analyzing signals</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#7CC7FF] animate-[pulse_1s_infinite]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4EA1FF] animate-[pulse_1s_infinite_100ms]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#7CC7FF] animate-[pulse_1s_infinite_200ms]" />
                </div>
             </div>
           </motion.div>

           {/* RIGHT PANEL: Opportunity Summary */}
           <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.6 }}
             className="w-full xl:w-[420px] flex flex-col shrink-0 z-20 relative"
           >
             <div className="flex items-center gap-3 mb-4">
               <div className="w-5 h-5 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-[10px] text-[#E8EDF3] font-bold">3</div>
               <div className="text-[11px] font-extrabold tracking-widest text-[#E8EDF3] uppercase">Opportunity Summary</div>
               <div className="ml-auto text-[9px] font-bold bg-[#7CC7FF]/20 text-[#7CC7FF] border border-[#7CC7FF]/40 px-2 py-1 rounded tracking-widest uppercase">
                 Sample Preview
               </div>
             </div>

             <div className="flex flex-col p-4 rounded-[20px] border border-white/[0.08] bg-[#0E1116]/80 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)]">

                {/* Metrics */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {[
                    { val: "7", label: "Potential<br/>issues found", icon: Search, color: "text-[#7CC7FF]" },
                    { val: "5", label: "Evidence-backed<br/>findings", icon: ShieldCheck, color: "text-[#22C55E]" },
                    { val: "91%", label: "Average<br/>confidence", icon: Target, color: "text-[#7CC7FF]" },
                    { val: "3", label: "Review-ready<br/>actions", icon: ListTodo, color: "text-[#7CC7FF]" },
                  ].map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.8 + (i * 0.1) }}
                      className="flex flex-col items-center justify-center text-center p-2 rounded-xl bg-black/40 border border-white/[0.03] group hover:bg-white/5 transition-colors cursor-default"
                    >
                      <m.icon className={`w-4 h-4 ${m.color} mb-2 group-hover:scale-110 transition-transform`} />
                      <div className="text-[22px] font-black text-white leading-none mb-1">{m.val}</div>
                      <div className="text-[9px] text-[#778493] font-medium leading-tight" dangerouslySetInnerHTML={{ __html: m.label }} />
                    </motion.div>
                  ))}
                </div>

                <div className="text-[12px] font-bold text-[#778493] mb-3 px-1">Top sample findings (preview)</div>

                {/* Findings List */}
                <div className="flex flex-col gap-2 mb-4">
                  {findings.map((f, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 1 + (i * 0.15) }}
                      className="flex items-center justify-between p-3 rounded-[14px] border border-white/[0.04] bg-black/40 hover:bg-white/[0.05] transition-colors cursor-default relative overflow-hidden"
                    >
                       <div className="flex items-start gap-3">
                         <div className="w-5 h-5 rounded-full bg-[#4EA1FF] flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5 shadow-inner">
                           {f.num}
                         </div>
                         <div className="flex flex-col">
                           <span className="text-[13px] font-bold text-white mb-0.5">{f.text}</span>
                           <span className="text-[10px] text-[#778493]">Category: {f.category}</span>
                         </div>
                       </div>

                       <div className="flex flex-col items-end gap-1 shrink-0">
                         <div className="flex items-center gap-1.5 text-[9px] text-[#778493]">
                           <span>Evidence:</span>
                           <FileText className="w-3 h-3 text-[#778493]" />
                           <FileText className="w-3 h-3 text-[#778493]" />
                         </div>
                         <div className={`px-2 py-0.5 rounded border text-[10px] font-bold ${f.bg} ${f.color}`}>
                           {f.status}
                         </div>
                       </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-[10px] text-[#778493] border-t border-white/5 pt-3 justify-center">
                  <ShieldCheck className="w-3 h-3 text-[#7CC7FF]" />
                  Sample preview. Results depend on uploaded data quality and coverage.
                </div>
             </div>
           </motion.div>
        </div>

        {/* Big Bottom Container */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.8 }}
          className="w-full rounded-[24px] border border-white/[0.08] bg-gradient-to-b from-[#0E1116]/80 to-[#0E1116]/30 backdrop-blur-xl flex flex-col xl:flex-row p-8 xl:p-12 gap-12 xl:gap-0 mb-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
           {/* Left Half (Timeline) */}
           <div className="flex-1 flex flex-col xl:pr-12">
             <h3 className="text-[20px] font-extrabold text-white mb-10">What happens after you start?</h3>

             <div className="flex items-start justify-between relative mt-4">
                {/* Connecting line */}
                <div className="absolute top-[18px] left-[10%] right-[10%] h-[2px] bg-white/[0.05] z-0 origin-left">
                   <motion.div
                     initial={{ scaleX: 0 }}
                     whileInView={{ scaleX: 1 }}
                     viewport={{ once: true }}
                     transition={{ duration: 1.5, ease: "easeInOut", delay: 1.2 }}
                     className="h-full bg-gradient-to-r from-[#4EA1FF] to-[#7CC7FF] w-[40%] rounded-full shadow-[0_0_10px_#7CC7FF] origin-left"
                   />
                </div>

                {/* Steps */}
                {timelineSteps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 1.2 + (i * 0.2) }}
                    className="flex flex-col items-center relative z-10 w-1/4 group cursor-default"
                  >
                     <div className={`w-9 h-9 rounded-full border-2 bg-[#0E1116] flex items-center justify-center text-[12px] font-bold text-white mb-5 transition-all ${i === 0 ? 'border-[#7CC7FF] shadow-[0_0_15px_rgba(78,161,255,0.5)]' : i === 1 ? 'border-[#4EA1FF]' : 'border-white/10 group-hover:border-white/30'}`}>
                       {i + 1}
                     </div>
                     <div className="w-12 h-12 rounded-full border border-white/10 bg-black/40 flex items-center justify-center mb-4 group-hover:bg-white/5 transition-colors">
                       <step.icon className={`w-5 h-5 ${i === 0 ? 'text-[#7CC7FF]' : i === 1 ? 'text-[#4EA1FF]' : 'text-[#778493] group-hover:text-white'}`} strokeWidth={1.5} />
                     </div>
                     <div className="text-[13px] font-bold text-[#E8EDF3] mb-2 text-center px-1 leading-tight">{step.title}</div>
                     <div className="text-[11px] text-[#778493] text-center px-2 leading-relaxed">{step.desc}</div>
                  </motion.div>
                ))}
             </div>
           </div>

           {/* Right Half (What you receive) */}
           <div className="flex-1 flex flex-col xl:border-l border-white/[0.08] xl:pl-12 pt-10 xl:pt-0 border-t xl:border-t-0">
             <h3 className="text-[20px] font-extrabold text-white mb-10">What you receive</h3>

             <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8, delay: 1.5 }}
               className="flex items-end gap-3 md:gap-4 relative mt-auto mb-4 justify-center"
             >
                {/* Folder (Static as requested) */}
                <div className="w-[130px] h-[170px] bg-gradient-to-br from-[#0E1116] to-[#0E1116] border-l-[6px] border-[#4EA1FF] border-t border-r border-b border-white/10 rounded-lg shadow-[0_20px_40px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center z-20 transform -rotate-2">
                   <div className="w-10 h-10 border border-[#7CC7FF]/40 bg-[#4EA1FF]/20 rounded-md flex items-center justify-center mb-3 shadow-inner">
                     <svg viewBox="0 0 100 100" className="w-6 h-6 text-[#7CC7FF]">
                        <path d="M50 15 L85 35 L85 75 L50 95 L15 75 L15 35 Z" fill="currentColor" opacity="0.2" />
                        <path d="M50 15 L50 55 L85 35 M50 55 L15 35 M50 55 L50 95" stroke="currentColor" fill="none" strokeWidth="6" />
                     </svg>
                   </div>
                   <div className="text-[14px] font-black text-white leading-tight text-center tracking-tight">GENIUS</div>
                   <div className="text-[8px] text-[#778493] tracking-[0.2em] font-bold mt-1">AUDIT PACK</div>
                </div>

                {/* Sheets Array (Animated) */}
                <div className="flex items-end gap-2 -ml-6 relative z-10 perspective">

                   {/* Sheet 1 */}
                   <motion.div
                     animate={{ y: [0, -4, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                     className="w-[100px] h-[150px] bg-gradient-to-b from-[#E8EDF3] to-[#E8EDF3] rounded-md shadow-xl transform rotate-1 border border-white/50 p-2.5 flex flex-col"
                   >
                      <div className="text-[6px] font-bold text-[#141A22] mb-2 border-b border-black/10 pb-1">1. Leakage Summary</div>
                      <div className="flex items-end gap-1.5 h-10 mt-auto mb-2 justify-center">
                        <motion.div animate={{ height: ["24px", "12px", "24px"] }} transition={{ duration: 3, repeat: Infinity }} className="w-2.5 bg-[#7CC7FF] rounded-t-sm" />
                        <motion.div animate={{ height: ["40px", "20px", "40px"] }} transition={{ duration: 3, repeat: Infinity, delay: 0.2 }} className="w-2.5 bg-[#4EA1FF] rounded-t-sm" />
                        <motion.div animate={{ height: ["16px", "28px", "16px"] }} transition={{ duration: 3, repeat: Infinity, delay: 0.4 }} className="w-2.5 bg-[#7CC7FF] rounded-t-sm" />
                        <motion.div animate={{ height: ["32px", "16px", "32px"] }} transition={{ duration: 3, repeat: Infinity, delay: 0.6 }} className="w-2.5 bg-[#4EA1FF] rounded-t-sm" />
                      </div>
                      <div className="w-full h-1 bg-black/10 rounded-full mt-2" />
                   </motion.div>

                   {/* Sheet 2 */}
                   <motion.div
                     animate={{ y: [0, -5, 0] }} transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                     className="w-[100px] h-[150px] bg-gradient-to-b from-[#E8EDF3] to-[#E8EDF3] rounded-md shadow-xl transform rotate-2 border border-white/50 p-2.5 flex flex-col"
                   >
                      <div className="text-[6px] font-bold text-[#141A22] mb-2 border-b border-black/10 pb-1">2. Evidence List</div>
                      <div className="flex flex-col gap-1.5 mt-2">
                         <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-[#7CC7FF]" /><motion.div animate={{ width: ["40px", "30px", "40px"] }} transition={{ duration: 4, repeat: Infinity }} className="h-1 bg-black/10 rounded" /></div>
                         <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-[#4EA1FF]" /><motion.div animate={{ width: ["56px", "46px", "56px"] }} transition={{ duration: 4, repeat: Infinity, delay: 0.5 }} className="h-1 bg-black/10 rounded" /></div>
                         <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-[#7CC7FF]" /><motion.div animate={{ width: ["32px", "22px", "32px"] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }} className="h-1 bg-black/10 rounded" /></div>
                         <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-[#4EA1FF]" /><motion.div animate={{ width: ["48px", "38px", "48px"] }} transition={{ duration: 4, repeat: Infinity, delay: 1.5 }} className="h-1 bg-black/10 rounded" /></div>
                      </div>
                   </motion.div>

                   {/* Sheet 3 */}
                   <motion.div
                     animate={{ y: [0, -4, 0] }} transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                     className="w-[100px] h-[150px] bg-gradient-to-b from-[#E8EDF3] to-[#E8EDF3] rounded-md shadow-xl transform rotate-[3deg] border border-white/50 p-2.5 flex flex-col"
                   >
                      <div className="text-[6px] font-bold text-[#141A22] mb-2 border-b border-black/10 pb-1">3. Priority Ranking</div>
                      <div className="flex flex-col gap-2 mt-2">
                         <div className="w-full p-1 bg-black/5 rounded flex items-center gap-1"><motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-red-500" /><div className="w-12 h-1 bg-black/20 rounded" /></div>
                         <div className="w-full p-1 bg-black/5 rounded flex items-center gap-1"><motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }} className="w-1.5 h-1.5 rounded-full bg-amber-500" /><div className="w-10 h-1 bg-black/20 rounded" /></div>
                         <div className="w-full p-1 bg-black/5 rounded flex items-center gap-1"><motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }} className="w-1.5 h-1.5 rounded-full bg-green-500" /><div className="w-14 h-1 bg-black/20 rounded" /></div>
                      </div>
                   </motion.div>

                   {/* Sheet 4 */}
                   <motion.div
                     animate={{ y: [0, -6, 0] }} transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                     className="w-[100px] h-[150px] bg-gradient-to-b from-[#E8EDF3] to-[#E8EDF3] rounded-md shadow-xl transform rotate-[4deg] border border-white/50 p-2.5 flex flex-col"
                   >
                      <div className="text-[6px] font-bold text-[#141A22] mb-2 border-b border-black/10 pb-1">4. Next Steps</div>
                      <div className="flex flex-col gap-1.5 mt-2">
                         <div className="flex items-start gap-1"><CheckSquare className="w-2 h-2 text-black/40 mt-0.5" /><motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }} className="flex-1 h-2 bg-black/10 rounded" /></div>
                         <div className="flex items-start gap-1"><CheckSquare className="w-2 h-2 text-black/40 mt-0.5" /><motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }} className="flex-1 h-2 bg-black/10 rounded" /></div>
                         <div className="flex items-start gap-1"><CheckSquare className="w-2 h-2 text-black/40 mt-0.5" /><motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} className="w-10 h-2 bg-black/10 rounded" /></div>
                      </div>
                   </motion.div>

                </div>
             </motion.div>
           </div>
        </motion.div>

        {/* Trust Strip */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 1 }}
          className="w-full flex flex-wrap items-center justify-center gap-4 md:gap-8 py-4 px-8 rounded-full border border-white/[0.05] bg-[#0E1116]/40 backdrop-blur-md mb-12 shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
        >
           {[
             { icon: Lock, text: "No full integration required" },
             { icon: Database, text: "Sample data is enough" },
             { icon: ShieldCheck, text: "No automatic action" },
             { icon: Users, text: "Human review before next steps" },
             { icon: Lock, text: "Secure private workspace" }
           ].map((t, i) => (
             <div key={i} className="flex items-center gap-4 md:gap-8">
               <motion.div whileHover={{ scale: 1.05, color: '#fff' }} className="flex items-center gap-2 cursor-default group text-[#778493]">
                 <t.icon className="w-4 h-4 text-[#778493] group-hover:text-[#7CC7FF] transition-colors" strokeWidth={2} />
                 <span className="text-[12px] font-medium transition-colors group-hover:text-white">{t.text}</span>
               </motion.div>
               {i < 4 && <div className="hidden xl:block w-px h-4 bg-white/10" />}
             </div>
           ))}
        </motion.div>

        {/* Final Bottom Line */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 1.2 }}
          className="text-center"
        >
          <span className="text-[18px] font-medium tracking-wide text-[#778493]">
            Start small. See the evidence. <span className="text-[#4EA1FF] font-bold drop-shadow-[0_0_10px_rgba(78,161,255,0.5)]">Decide with confidence.</span>
          </span>
        </motion.div>

      </div>
    </section>
  );
}
// ── Footer ────────────────────────────────────────────────────────────────────
// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <GeniusLogo className="w-7 h-7" />
              <span className="text-sm font-bold text-white">GENIUS</span>
            </div>
            <p className="text-xs text-[#778493] leading-relaxed">Find the leaks. Prove the value. Approve the action.</p>
          </div>
          {[
            { label: "Product", links: ["Platform Overview", "Modules", "AI Agents", "Roadmap"] },
            { label: "Solutions", links: ["Finance", "Operations", "Procurement", "SaaS Management"] },
            { label: "Resources", links: ["Blog", "Docs", "Case Studies", "Guides", "Webinars"] },
            { label: "Company", links: ["About Us", "Partners", "Careers", "Contact"] },
            { label: "Legal", links: ["Privacy Policy", "Terms of Service", "Trust Center"] },
          ].map(col => (
            <div key={col.label}>
              <div className="text-xs font-semibold text-white mb-3">{col.label}</div>
              <div className="space-y-2">
                {col.links.map(l => <div key={l} className="text-xs text-[#778493] hover:text-white cursor-pointer transition-colors">{l}</div>)}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-white/5 pt-6 flex items-center justify-between text-[10px] text-[#778493]">
          <span>© 2024 GENIUS. All rights reserved.</span>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer">Privacy</span>
            <span className="hover:text-white cursor-pointer">Terms</span>
            <span className="hover:text-white cursor-pointer">Trust Center</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Main Landing Page ─────────────────────────────────────────────────────────
export default function LandingPage({ session, onEnter, onSignIn }) {
  return (
    <div className="min-h-screen bg-[#080A0E] text-white scrollbar-thin relative overflow-x-hidden">
      <SiteHeader session={session} onEnter={onEnter} onSignIn={onSignIn} />
      <HeroSection onEnter={onEnter} />
      <AITeaserSection onEnter={onEnter} />
      <HowItWorksSection />
      <PlatformModulesSection onEnter={onEnter} />
      <EvidenceSection />
      <ApprovalsSection />
      <AgentsSection />
      <SecuritySection />
      <FutureSection />
      <CTASection onEnter={onEnter} />
      <Footer />
    </div>
  );
}
