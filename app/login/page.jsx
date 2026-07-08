"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  FileText, Network, ShieldAlert, Bot, UserCheck, FileSpreadsheet,
  Lock, CheckCircle2, Search, Trash2, Factory, Briefcase, ShoppingCart, Cloud, HeartPulse, Truck,
  CheckCircle, Globe, ChevronRight, EyeOff, Mail, ArrowRight, ShieldCheck, Database, FileDigit, Cpu, LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("signin");

  return (
    <div className="flex min-h-screen w-full bg-[#040504] text-foreground font-sans overflow-hidden">
      
      {/* LEFT PANE - BRANDING */}
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden border-r border-[#1E2730] bg-[#0A0C0B] p-12 lg:flex xl:w-[40%]">
        {/* Abstract Glows */}
        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-evidence/10 blur-[120px]" />

        <div className="relative z-10 flex flex-col gap-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">GENIUS.</span>
          </div>

          {/* Value Prop */}
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-[1.1]">
              Evidence-backed<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-300">AI operations workspace</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-[420px] leading-relaxed">
              Turn messy business data into trusted insights, supervised actions, and board-ready reports.
            </p>
          </div>

          {/* Pipeline Diagram */}
          <div className="flex w-full items-start justify-between gap-2 relative">
            <div className="absolute top-8 left-6 right-6 h-px border-t border-dashed border-[#1E2730] -z-10" />
            
            {[
              { icon: FileText, label: "Evidence", sub: "Files, sheets, URLs, connectors", color: "var(--evidence)", bg: "rgba(56,189,248,0.1)" },
              { icon: Network, label: "Facts", sub: "Extracted fields & entities", color: "var(--foreground)", bg: "rgba(255,255,255,0.05)" },
              { icon: ShieldAlert, label: "Risks", sub: "Issues, anomalies & opportunities", color: "var(--critical)", bg: "rgba(239,68,68,0.1)" },
              { icon: Bot, label: "Agents", sub: "Supervised AI actions", color: "var(--warning)", bg: "rgba(245,158,11,0.1)" },
              { icon: UserCheck, label: "Approvals", sub: "Human review & control", color: "var(--warning)", bg: "rgba(245,158,11,0.1)" },
              { icon: FileSpreadsheet, label: "Reports", sub: "Evidence-backed outcomes", color: "var(--primary)", bg: "rgba(16,185,129,0.1)" },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-3 w-20">
                <div 
                  className="flex size-14 items-center justify-center rounded-2xl border backdrop-blur-sm transition-transform hover:scale-105"
                  style={{ backgroundColor: step.bg, borderColor: `${step.color}40`, color: step.color, boxShadow: `0 0 20px ${step.color}15` }}
                >
                  <step.icon className="size-6" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-white">{step.label}</span>
                  <span className="text-[9px] text-muted-foreground leading-tight px-1">{step.sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Features */}
          <div className="flex flex-col gap-5 mt-4">
            <div className="text-sm font-semibold text-primary mb-2 text-center">Built for control. Designed for trust.</div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              {[
                { icon: Lock, title: "Your data stays yours", desc: "Secure on Supabase. RLS enabled." },
                { icon: CheckCircle2, title: "Approval-first", desc: "No external actions without your approval." },
                { icon: Search, title: "Evidence everywhere", desc: "Every metric links to source proof." },
                { icon: Trash2, title: "You're in control", desc: "Export your data or delete anytime." },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary">
                    <f.icon className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-white">{f.title}</span>
                    <span className="text-[10px] text-muted-foreground leading-snug">{f.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Industry Icons */}
          <div className="flex flex-col gap-4 mt-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-center">Trusted by operations teams</span>
            <div className="flex items-center justify-center gap-6 opacity-60">
              {[
                { icon: Factory, label: "Manufacturing" },
                { icon: Briefcase, label: "Professional Services" },
                { icon: ShoppingCart, label: "Retail & eCommerce" },
                { icon: Cloud, label: "SaaS" },
                { icon: HeartPulse, label: "Healthcare" },
                { icon: Truck, label: "Logistics" },
              ].map((ind, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 transition-opacity hover:opacity-100">
                  <ind.icon className="size-5" strokeWidth={1.5} />
                  <span className="text-[9px] whitespace-nowrap">{ind.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Left Footer */}
        <div className="relative z-10 flex items-center justify-between mt-12 border-t border-[#1E2730] pt-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-white">Enterprise-grade security</span>
                <span className="text-[9px] text-muted-foreground">SOC 2 practices • Encryption in transit & at rest • Regular backups</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex size-3 items-center justify-center">
                <div className="absolute inset-0 animate-ping rounded-full bg-primary opacity-20" />
                <div className="size-1.5 rounded-full bg-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-white">System status</span>
                <span className="text-[9px] text-muted-foreground">All systems operational <span className="text-primary ml-2 hover:underline cursor-pointer">View status →</span></span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 left-12 text-[10px] text-muted-foreground">
          © 2025 GENIUS. All rights reserved.
        </div>
      </div>

      {/* RIGHT PANE - AUTH FORMS */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-[#0d1110]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-10 py-6">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setActiveTab("signin")}
              className={cn("text-sm font-semibold transition-colors border-b-2 pb-1", activeTab === "signin" ? "text-white border-primary" : "text-muted-foreground border-transparent hover:text-white")}
            >
              Sign in
            </button>
            <button 
              onClick={() => setActiveTab("create")}
              className={cn("text-sm font-semibold transition-colors border-b-2 pb-1", activeTab === "create" ? "text-white border-primary" : "text-muted-foreground border-transparent hover:text-white")}
            >
              Create account
            </button>
          </div>
          <button className="flex items-center gap-1.5 rounded-full border border-[#1E2730] bg-[#141B21] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#1E2730]">
            <Globe className="size-3.5 text-muted-foreground" />
            English
            <ChevronRight className="size-3 text-muted-foreground ml-1 rotate-90" />
          </button>
        </div>

        {/* Main Content Area - Split into 2 columns for large screens to match mockup feeling of density */}
        <div className="flex flex-1 flex-col justify-center px-10 pb-16 lg:px-16 xl:px-24">
          
          <div className="grid gap-16 lg:grid-cols-2">
            
            {/* Column 1: Sign In */}
            <div className="flex flex-col max-w-sm">
              <h2 className="text-2xl font-bold tracking-tight text-white">Sign in to your workspace</h2>
              <p className="mt-1 text-sm text-muted-foreground">Access your AI operations workspace.</p>

              <div className="mt-8 flex flex-col gap-3">
                <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#1E2730] bg-[#141B21] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1E2730]">
                  <svg className="size-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Continue with Google
                </button>
                <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#1E2730] bg-[#141B21] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1E2730]">
                  <svg className="size-4" viewBox="0 0 21 21"><path d="M10 0H0v10h10V0z" fill="#f25022"/><path d="M21 0H11v10h10V0z" fill="#7fba00"/><path d="M10 11H0v10h10V11z" fill="#00a4ef"/><path d="M21 11H11v10h10V11z" fill="#ffb900"/></svg>
                  Continue with Microsoft
                </button>
              </div>

              <div className="my-6 flex items-center justify-center text-xs text-muted-foreground before:flex-1 before:border-t before:border-[#1E2730] before:mr-4 after:flex-1 after:border-t after:border-[#1E2730] after:ml-4">or</div>

              <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10">
                <Mail className="size-4" />
                Email magic link
              </button>

              <div className="mt-8 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Email address</label>
                  <input type="email" placeholder="you@acme.com" className="w-full rounded-lg border border-[#1E2730] bg-[#141B21] px-3 py-2 text-sm text-white placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Password</label>
                  <div className="relative">
                    <input type="password" placeholder="••••••••••••" className="w-full rounded-lg border border-[#1E2730] bg-[#141B21] px-3 py-2 text-sm text-white placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                    <EyeOff className="absolute right-3 top-2.5 size-4 text-muted-foreground hover:text-white cursor-pointer" />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-white">
                    <input type="checkbox" className="rounded border-[#1E2730] bg-[#141B21] checked:bg-primary" />
                    Remember this device
                  </label>
                  <a href="#" className="text-xs font-medium text-primary hover:underline">Forgot password?</a>
                </div>

                <Link href="/" className="mt-2 flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  Sign in
                </Link>
              </div>

              <div className="my-6 flex items-center justify-center text-xs text-muted-foreground before:flex-1 before:border-t before:border-[#1E2730] before:mr-4 after:flex-1 after:border-t after:border-[#1E2730] after:ml-4">or continue with</div>

              <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#1E2730] bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-white hover:border-[#ffffff20]">
                <Lock className="size-4" />
                Enterprise SSO (SAML)
                <span className="ml-2 rounded bg-[#1E2730] px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">Soon</span>
              </button>

              <div className="mt-6 flex items-start gap-3 rounded-lg bg-primary/5 p-4 border border-primary/10">
                <CheckCircle className="size-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  By continuing, you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                </p>
              </div>

            </div>

            {/* Column 2: Create Workspace (Stepper) */}
            <div className="flex flex-col relative max-w-sm xl:border-l xl:border-[#1E2730] xl:pl-16">
              
              <h2 className="text-2xl font-bold tracking-tight text-white">New here? Create your workspace</h2>
              <p className="mt-1 text-sm text-muted-foreground">Get started in minutes.</p>

              <div className="mt-8 flex flex-col gap-6">
                
                {/* Stepper */}
                <div className="flex flex-col gap-0">
                  {[
                    { num: 1, label: "Create account", active: true },
                    { num: 2, label: "Create workspace", active: false },
                    { num: 3, label: "Connect data", active: false },
                    { num: 4, label: "Review first findings", active: false },
                  ].map((step, i, arr) => (
                    <div key={step.num} className="flex flex-col">
                      <div className="flex items-center gap-3">
                        <div className={cn("flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold", step.active ? "border-primary text-primary" : "border-[#1E2730] text-muted-foreground")}>
                          {step.num}
                        </div>
                        <span className={cn("text-sm font-medium", step.active ? "text-white" : "text-muted-foreground")}>{step.label}</span>
                      </div>
                      {i < arr.length - 1 && (
                        <div className="ml-3 my-1 h-4 w-px border-l-2 border-dotted border-[#1E2730]" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Form fields for Create Workspace */}
                <div className="mt-4 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Workspace name</label>
                    <input type="text" defaultValue="Acme Corporation Operations" className="w-full rounded-lg border border-[#1E2730] bg-[#141B21] px-3 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Your role</label>
                    <div className="relative">
                      <UserCheck className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                      <select className="w-full appearance-none rounded-lg border border-[#1E2730] bg-[#141B21] pl-9 pr-8 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                        <option>Operations Manager</option>
                        <option>CFO</option>
                        <option>Data Analyst</option>
                        <option>Procurement</option>
                      </select>
                      <ChevronRight className="absolute right-3 top-3 size-3 text-muted-foreground rotate-90 pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Company size</label>
                      <div className="relative">
                        <select className="w-full appearance-none rounded-lg border border-[#1E2730] bg-[#141B21] px-3 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                          <option>51 - 200 employees</option>
                          <option>201 - 500 employees</option>
                          <option>500+ employees</option>
                        </select>
                        <ChevronRight className="absolute right-3 top-3 size-3 text-muted-foreground rotate-90 pointer-events-none" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Business type</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                        <select className="w-full appearance-none rounded-lg border border-[#1E2730] bg-[#141B21] pl-8 pr-8 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                          <option>Professional Services</option>
                          <option>SaaS</option>
                          <option>Manufacturing</option>
                        </select>
                        <ChevronRight className="absolute right-3 top-3 size-3 text-muted-foreground rotate-90 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 p-4 flex gap-3">
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <p className="text-xs text-white leading-relaxed">
                        Workspace data is stored securely on Supabase. You can invite teammates after setup.
                      </p>
                    </div>
                    <Lock className="size-4 text-primary shrink-0 opacity-50" />
                  </div>

                  <Link href="/" className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-primary/50 bg-primary/10 px-4 py-2.5 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground shadow-[0_0_20px_rgba(16,185,129,0.15)] group">
                    Continue
                    <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                </div>

              </div>

            </div>
          </div>
          
        </div>

        {/* Global Footer in Right Pane */}
        <div className="mt-auto flex flex-col border-t border-[#1E2730] bg-[#0A0C0B]">
          
          {/* System Integration Status Bar */}
          <div className="flex items-center justify-between px-10 py-4 border-b border-[#1E2730]">
            <span className="text-xs font-semibold text-white">AI & Data providers</span>
            <div className="flex items-center gap-4">
              
              <div className="flex items-center gap-2 rounded-md border border-[#1E2730] bg-[#141B21] px-3 py-1.5">
                <Cpu className="size-3.5 text-muted-foreground" />
                <span className="text-[11px] font-medium text-white">Gemini 1.5 Pro</span>
                <span className="ml-2 flex items-center gap-1.5 text-[10px] font-semibold text-primary"><div className="size-1.5 rounded-full bg-primary shadow-[0_0_4px_#10B981]" /> Ready</span>
              </div>
              
              <div className="flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-1.5">
                <Database className="size-3.5 text-muted-foreground" />
                <span className="text-[11px] font-medium text-white">Supabase</span>
                <span className="ml-2 flex items-center gap-1.5 text-[10px] font-semibold text-primary"><div className="size-1.5 rounded-full bg-primary shadow-[0_0_4px_#10B981]" /> Connected</span>
              </div>

              <div className="flex items-center gap-2 rounded-md border border-[#1E2730] bg-[#141B21] px-3 py-1.5">
                <FileDigit className="size-3.5 text-muted-foreground" />
                <span className="text-[11px] font-medium text-white">OCR Engine</span>
                <span className="ml-2 flex items-center gap-1.5 text-[10px] font-semibold text-primary"><div className="size-1.5 rounded-full bg-primary shadow-[0_0_4px_#10B981]" /> Ready</span>
              </div>
              
              <div className="flex items-center gap-2 rounded-md border border-[#1E2730] bg-[#141B21] px-3 py-1.5">
                <LayoutDashboard className="size-3.5 text-muted-foreground" />
                <span className="text-[11px] font-medium text-white">Local Parser</span>
                <span className="ml-2 flex items-center gap-1.5 text-[10px] font-semibold text-primary"><div className="size-1.5 rounded-full bg-primary shadow-[0_0_4px_#10B981]" /> Ready</span>
              </div>

            </div>
            <a href="#" className="text-[11px] text-muted-foreground hover:text-white flex items-center gap-1">
              What is this? <span className="flex size-3.5 items-center justify-center rounded-full border border-muted-foreground/50 text-[9px]">?</span>
            </a>
          </div>

          {/* Bottom Security Tags */}
          <div className="flex items-center justify-center gap-12 py-4">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <EyeOff className="size-3.5" /> No hidden training on your data
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Globe className="size-3.5" /> Data residency: US/EU
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <UserCheck className="size-3.5" /> Approval-first agents
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
