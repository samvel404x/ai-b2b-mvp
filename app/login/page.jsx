"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { GeniusLogo } from "@/components/genius/logo";
import {
  ShieldCheck, ArrowLeft, ArrowRight, EyeOff, Eye, CheckCircle2, ChevronRight, Briefcase, UserCheck, Lock, CheckCircle, Mail, User, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Animation Variants ---
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.05, staggerDirection: -1 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3, ease: "easeIn" } }
};

const slideVariants = {
  hidden: (direction) => ({ opacity: 0, x: direction > 0 ? 40 : -40 }),
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: (direction) => ({ opacity: 0, x: direction < 0 ? 40 : -40, transition: { duration: 0.3, ease: "easeIn" } })
};

const noiseBackgroundImage =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("signin"); // "signin" | "create"
  const [registrationStep, setRegistrationStep] = useState(1);
  const [direction, setDirection] = useState(1);

  // Visibility toggles
  const [showSigninPassword, setShowSigninPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Form State
  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [role, setRole] = useState("Owner");
  const [position, setPosition] = useState("CEO");
  const [department, setDepartment] = useState("Operations");
  const [companySize, setCompanySize] = useState("51 - 200 employees");
  const [businessType, setBusinessType] = useState("Professional Services");
  const [loadingMode, setLoadingMode] = useState(null);
  const [inviteToken] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("invite") || "";
  });
  const [inviteDetails, setInviteDetails] = useState(null);
  const [inviteError, setInviteError] = useState("");
  const inviteMode = Boolean(inviteToken);

  useEffect(() => {
    if (!inviteToken) return;

    let ignore = false;

    window.queueMicrotask(() => {
      if (ignore) return;
      setActiveTab("create");
      setRegistrationStep(1);
      setInviteError("");
    });

    fetch(`/api/workspace/invite?token=${encodeURIComponent(inviteToken)}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || "Invite link is invalid.");
        return payload.invite;
      })
      .then((invite) => {
        if (ignore) return;
        setInviteDetails(invite);
        if (invite?.member?.email) {
          setSignupEmail(invite.member.email);
          setSigninEmail(invite.member.email);
        }
      })
      .catch((error) => {
        if (!ignore) setInviteError(error.message || "Invite link is invalid.");
      });

    return () => {
      ignore = true;
    };
  }, [inviteToken]);

  const switchTab = (tab) => {
    if (tab === activeTab) return;
    setDirection(tab === "signin" ? -1 : 1);
    setActiveTab(tab);
    setRegistrationStep(1);
  };

  const nextStep = () => {
    if (registrationStep === 1 && (!signupEmail || !signupPassword)) {
      toast.error("Please fill in email and password.");
      return;
    }
    if (inviteMode && registrationStep === 1) {
      if (inviteError) {
        toast.error(inviteError);
        return;
      }
      submitEmailAuth("signup");
      return;
    }
    if (registrationStep === 2 && !workspaceName) {
      toast.error("Please provide a workspace name.");
      return;
    }
    setDirection(1);
    setRegistrationStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setDirection(-1);
    setRegistrationStep((prev) => prev - 1);
  };

  async function submitEmailAuth(mode) {
    const email = mode === "signup" ? signupEmail : signinEmail;
    const password = mode === "signup" ? signupPassword : signinPassword;

    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }
    if (inviteMode && inviteError) {
      toast.error(inviteError);
      return;
    }

    setLoadingMode(mode);

    try {
      const response = await fetch("/api/auth/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          email,
          password,
          workspaceName: workspaceName || "Acme Corporation Operations",
          role,
          position,
          department,
          companySize,
          businessType,
          inviteToken,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Authentication failed.");
      }

      toast.success(inviteMode ? "Workspace invitation accepted" : mode === "signup" ? "Workspace created successfully" : "Signed in successfully");
      router.replace("/workspace");
    } catch (error) {
      toast.error(error.message || "Authentication failed.");
    } finally {
      setLoadingMode(null);
    }
  }

  async function startGuestWorkspace() {
    setLoadingMode("guest");

    try {
      const response = await fetch("/api/auth/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceName: "GENIUS Guest Workspace" }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Guest workspace could not be created.");
      }

      toast.success("Guest workspace created locally");
      router.replace("/workspace");
    } catch (error) {
      toast.error(error.message || "Guest workspace could not be created.");
    } finally {
      setLoadingMode(null);
    }
  }

  function showPendingAuth(provider) {
    toast.info(`${provider} authentication will be available in the next release.`);
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-[#020617] text-foreground font-sans overflow-hidden">

      {/* --- Ambient Background --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Deep mesh gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#4EA1FF]/20 via-[#020617] to-[#020617] opacity-80" />

        {/* Animated Orbs */}
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute top-1/4 left-1/4 h-[600px] w-[600px] rounded-full bg-[#3b82f6]/10 blur-[140px]"
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-[#1d4ed8]/10 blur-[120px]"
        />

        {/* Subtle noise overlay for texture */}
        <div
          className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
          style={{ backgroundImage: noiseBackgroundImage, backgroundSize: "256px 256px" }}
        />
      </div>

      {/* --- Auth Card --- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[540px] px-6 py-10"
      >
        <div className="flex flex-col w-full bg-[#0a0f1a]/80 backdrop-blur-2xl border border-[#1e293b]/60 rounded-3xl p-8 sm:p-10 shadow-[0_0_80px_rgba(29,78,216,0.15)] ring-1 ring-white/5">

          {/* Card Header: Back & Secure Badge */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="group flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Back to home
            </Link>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <ShieldCheck className="size-3.5" />
              {activeTab === "signin" ? "Secure sign-in" : "Secure sign-up"}
            </div>
          </div>

          {/* Logo */}
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              <GeniusLogo className="size-10 shadow-[0_0_22px_rgba(78,161,255,0.35)]" preload />
              <span className="text-2xl font-bold tracking-tight text-white">GENIUS.</span>
            </div>
            {inviteMode && (
              <div className={cn(
                "mt-4 w-full rounded-xl border px-4 py-3 text-center text-xs",
                inviteError ? "border-red-500/30 bg-red-500/10 text-red-200" : "border-[#4EA1FF]/30 bg-[#4EA1FF]/10 text-blue-100",
              )}>
                {inviteError || `Join ${inviteDetails?.workspaceName || "your GENIUS workspace"} as ${inviteDetails?.member?.role || "Member"}.`}
              </div>
            )}
          </div>

          {/* Segmented Control */}
          {activeTab !== "forgot" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center p-1 mb-10 bg-[#0f172a] rounded-full ring-1 ring-slate-800/50 shadow-inner w-full max-w-[320px] mx-auto">
            <button
              onClick={() => switchTab("signin")}
              className={cn("relative flex-1 py-2 text-sm font-medium transition-colors rounded-full z-10", activeTab === "signin" ? "text-white" : "text-slate-400 hover:text-white")}
            >
              Sign in
              {activeTab === "signin" && (
                <motion.div layoutId="tab-pill" className="absolute inset-0 bg-[#1e293b] rounded-full -z-10 shadow-sm ring-1 ring-white/10" />
              )}
            </button>
            <button
              onClick={() => switchTab("create")}
              className={cn("relative flex-1 py-2 text-sm font-medium transition-colors rounded-full z-10", activeTab === "create" ? "text-white" : "text-slate-400 hover:text-white")}
            >
              Create account
              {activeTab === "create" && (
                <motion.div layoutId="tab-pill" className="absolute inset-0 bg-[#1e293b] rounded-full -z-10 shadow-sm ring-1 ring-white/10" />
              )}
            </button>
          </motion.div>
          )}

          {/* Form Content Area */}
          <div className="relative min-h-[380px]">
            <AnimatePresence mode="wait" custom={direction}>
              {activeTab === "signin" ? (
                <motion.div
                  key="signin-view"
                  custom={direction}
                  variants={slideVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex flex-col w-full"
                >
                  <div className="flex flex-col items-center text-center mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-white mb-2">{inviteMode ? "Sign in and join" : "Welcome back"}</h2>
                    <p className="text-sm text-slate-400">{inviteMode ? "Use your invited work email to accept access" : "Sign in to your AI operations workspace"}</p>
                  </div>

                  <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col gap-4">
                    <motion.div variants={fadeUp} className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-400 ml-1">Email address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-3.5 size-4 text-slate-500" />
                        <input
                          type="email"
                          value={signinEmail}
                          onChange={(e) => setSigninEmail(e.target.value)}
                          placeholder="you@company.com"
                          className="w-full rounded-xl border border-slate-800 bg-[#0f172a] pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-[#4EA1FF] focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={fadeUp} className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-400 ml-1">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-3.5 size-4 text-slate-500" />
                        <input
                          type={showSigninPassword ? "text" : "password"}
                          value={signinPassword}
                          onChange={(e) => setSigninPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full rounded-xl border border-slate-800 bg-[#0f172a] pl-11 pr-11 py-3 text-sm text-white placeholder:text-slate-600 focus:border-[#4EA1FF] focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSigninPassword(!showSigninPassword)}
                          className="absolute right-4 top-3.5 text-slate-500 hover:text-white transition-colors"
                        >
                          {showSigninPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </motion.div>

                    <motion.div variants={fadeUp} className="flex items-center justify-between mt-1 px-1">
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-400 cursor-pointer hover:text-white transition-colors">
                        <input type="checkbox" className="rounded-sm border-slate-700 bg-slate-800 checked:bg-[#4EA1FF] accent-blue-600" />
                        Remember me
                      </label>
                      <button type="button" onClick={() => switchTab("forgot")} className="text-xs font-medium text-[#4EA1FF] hover:text-[#7CC7FF] transition-colors">
                        Forgot password?
                      </button>
                    </motion.div>

                    <motion.button
                      variants={fadeUp}
                      whileHover={{ y: -2 }}
                      whileTap={{ y: 0 }}
                      type="button"
                      onClick={() => submitEmailAuth("signin")}
                      disabled={loadingMode !== null}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#4EA1FF] px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-[#4EA1FF] disabled:cursor-not-allowed disabled:opacity-60 shadow-[0_0_20px_rgba(78,161,255,0.3)] hover:shadow-[0_0_30px_rgba(78,161,255,0.5)] group"
                    >
                      {loadingMode === "signin" ? "Signing in..." : "Sign in to workspace"}
                      {loadingMode !== "signin" && <ArrowRight className="size-4 opacity-70 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />}
                    </motion.button>
                  </motion.div>

                  <div className="my-6 flex items-center justify-center text-xs text-slate-600 before:flex-1 before:border-t before:border-slate-800 before:mr-4 after:flex-1 after:border-t after:border-slate-800 after:ml-4">
                    or continue with
                  </div>

                  <div className="flex flex-col gap-3">
                    <button type="button" onClick={startGuestWorkspace} disabled={loadingMode !== null} className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#4EA1FF]/30 bg-[#4EA1FF]/10 px-4 py-3 text-sm font-semibold text-blue-100 transition-all hover:bg-[#4EA1FF]/15 hover:border-blue-400/60 disabled:cursor-not-allowed disabled:opacity-60">
                      <Layers className="size-4" />
                      {loadingMode === "guest" ? "Creating local workspace..." : "Continue as guest"}
                    </button>
                    <button type="button" onClick={() => showPendingAuth("Google")} className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-800 bg-[#0f172a] px-4 py-3 text-sm font-medium text-white transition-all hover:bg-slate-800 hover:border-slate-700">
                      <svg className="size-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                      Continue with Google
                    </button>
                    <button type="button" onClick={() => showPendingAuth("Microsoft")} className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-800 bg-[#0f172a] px-4 py-3 text-sm font-medium text-white transition-all hover:bg-slate-800 hover:border-slate-700">
                      <svg className="size-4" viewBox="0 0 21 21"><path d="M10 0H0v10h10V0z" fill="#f25022"/><path d="M21 0H11v10h10V0z" fill="#7fba00"/><path d="M10 11H0v10h10V11z" fill="#00a4ef"/><path d="M21 11H11v10h10V11z" fill="#ffb900"/></svg>
                      Continue with Microsoft
                    </button>
                  </div>
                </motion.div>
              ) : activeTab === "forgot" ? (
                <motion.div
                  key="forgot-view"
                  custom={direction}
                  variants={slideVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex flex-col w-full"
                >
                  <div className="flex flex-col items-center text-center mb-8">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-[#4EA1FF]/10 text-[#4EA1FF] mb-4 ring-1 ring-blue-500/20 shadow-[0_0_20px_rgba(78,161,255,0.2)]">
                      <Lock className="size-6" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Reset password</h2>
                    <p className="text-sm text-slate-400 max-w-[260px]">Enter your email and we will send you a secure link to reset your password.</p>
                  </div>

                  <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col gap-4">
                    <motion.div variants={fadeUp} className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-400 ml-1">Email address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-3.5 size-4 text-slate-500" />
                        <input
                          type="email"
                          value={signinEmail}
                          onChange={(e) => setSigninEmail(e.target.value)}
                          placeholder="you@company.com"
                          className="w-full rounded-xl border border-slate-800 bg-[#0f172a] pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-[#4EA1FF] focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
                        />
                      </div>
                    </motion.div>

                    <motion.button
                      variants={fadeUp}
                      whileHover={{ y: -2 }}
                      whileTap={{ y: 0 }}
                      type="button"
                      onClick={() => {
                        toast.success("Password reset link sent securely to your email.");
                        switchTab("signin");
                      }}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#4EA1FF] px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-[#4EA1FF] shadow-[0_0_20px_rgba(78,161,255,0.3)] hover:shadow-[0_0_30px_rgba(78,161,255,0.5)] group"
                    >
                      Send reset link
                      <ArrowRight className="size-4 opacity-70 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                    </motion.button>
                  </motion.div>

                  <div className="mt-8 flex justify-center">
                    <button type="button" onClick={() => switchTab("signin")} className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
                      <ArrowLeft className="size-4" />
                      Back to sign in
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="signup-view"
                  custom={direction}
                  variants={slideVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex flex-col w-full h-full"
                >
                  <div className="flex flex-col items-center text-center mb-6">
                    <h2 className="text-2xl font-bold tracking-tight text-white mb-2">{inviteMode ? "Accept workspace invite" : "Create your account"}</h2>
                    <p className="text-sm text-slate-400">{inviteMode ? "Create your login and enter the shared workspace" : "Set up your AI command center"}</p>
                  </div>

                  {/* Stepper Dots */}
                  <div className="flex items-center justify-center gap-2 mb-8">
                    {(inviteMode ? [1] : [1, 2, 3]).map((step) => (
                      <div key={step} className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        registrationStep === step ? "bg-[#4EA1FF] w-8 shadow-[0_0_8px_rgba(78,161,255,0.5)]" : registrationStep > step ? "bg-[#4EA1FF]/50 w-2" : "bg-slate-800 w-2"
                      )} />
                    ))}
                  </div>

                  <AnimatePresence mode="wait" custom={direction}>
                    {registrationStep === 1 && (
                      <motion.div key="step1" custom={direction} variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-400 ml-1">Work email or company name</label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-3.5 size-4 text-slate-500" />
                            <input
                              type="email"
                              value={signupEmail}
                              onChange={(e) => setSignupEmail(e.target.value)}
                              placeholder="you@company.com"
                              className="w-full rounded-xl border border-slate-800 bg-[#0f172a] pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-[#4EA1FF] focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-400 ml-1">Password</label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-3.5 size-4 text-slate-500" />
                            <input
                              type={showSignupPassword ? "text" : "password"}
                              value={signupPassword}
                              onChange={(e) => setSignupPassword(e.target.value)}
                              placeholder="Create a strong password"
                              className="w-full rounded-xl border border-slate-800 bg-[#0f172a] pl-11 pr-11 py-3 text-sm text-white placeholder:text-slate-600 focus:border-[#4EA1FF] focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
                            />
                            <button
                              type="button"
                              onClick={() => setShowSignupPassword(!showSignupPassword)}
                              className="absolute right-4 top-3.5 text-slate-500 hover:text-white transition-colors"
                            >
                              {showSignupPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                          </div>

                          {/* Simple Password Strength Indicator Mock */}
                          {signupPassword.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 p-3 mt-1 rounded-lg border border-slate-800/50 bg-[#0f172a]/50">
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                <CheckCircle2 className={cn("size-3", signupPassword.length >= 8 ? "text-emerald-500" : "text-slate-600")} /> At least 8 characters
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                <CheckCircle2 className={cn("size-3", /[A-Z]/.test(signupPassword) ? "text-emerald-500" : "text-slate-600")} /> One uppercase letter
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                          <input type="checkbox" id="tos" className="rounded-sm border-slate-700 bg-slate-800 checked:bg-[#4EA1FF] accent-blue-600 cursor-pointer" />
                          <label htmlFor="tos" className="text-xs text-slate-400 cursor-pointer">
                            I agree to the <a href="#" className="text-[#4EA1FF] hover:underline">Terms of Service</a> and <a href="#" className="text-[#4EA1FF] hover:underline">Privacy Policy</a>
                          </label>
                        </div>

                        <motion.button
                          whileHover={{ y: -2 }}
                          whileTap={{ y: 0 }}
                          type="button"
                          onClick={nextStep}
                          disabled={loadingMode !== null || (inviteMode && Boolean(inviteError))}
                          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#4EA1FF] px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-[#4EA1FF] shadow-[0_0_20px_rgba(78,161,255,0.3)] hover:shadow-[0_0_30px_rgba(78,161,255,0.5)] group"
                        >
                          {inviteMode ? (loadingMode === "signup" ? "Joining Workspace..." : "Create account and join") : "Continue"}
                          <ArrowRight className="size-4 opacity-70 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                        </motion.button>
                      </motion.div>
                    )}

                    {registrationStep === 2 && (
                      <motion.div key="step2" custom={direction} variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-400 ml-1">Workspace name</label>
                          <input
                            type="text"
                            value={workspaceName}
                            onChange={(e) => setWorkspaceName(e.target.value)}
                            placeholder="Acme Corporation"
                            className="w-full rounded-xl border border-slate-800 bg-[#0f172a] px-4 py-3 text-sm text-white focus:border-[#4EA1FF] focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-400 ml-1">Company size</label>
                            <div className="relative">
                              <select
                                value={companySize}
                                onChange={(e) => setCompanySize(e.target.value)}
                                className="w-full appearance-none rounded-xl border border-slate-800 bg-[#0f172a] px-4 py-3 text-sm text-white focus:border-[#4EA1FF] focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-inner cursor-pointer"
                              >
                                <option>1 - 50 employees</option>
                                <option>51 - 200 employees</option>
                                <option>201 - 500 employees</option>
                                <option>500+ employees</option>
                              </select>
                              <ChevronRight className="absolute right-3 top-3.5 size-4 text-slate-500 rotate-90 pointer-events-none" />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-400 ml-1">Business type</label>
                            <div className="relative">
                              <select
                                value={businessType}
                                onChange={(e) => setBusinessType(e.target.value)}
                                className="w-full appearance-none rounded-xl border border-slate-800 bg-[#0f172a] px-4 py-3 text-sm text-white focus:border-[#4EA1FF] focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-inner cursor-pointer"
                              >
                                <option>SaaS & Tech</option>
                                <option>Services</option>
                                <option>Manufacturing</option>
                                <option>Retail/eComm</option>
                                <option>Healthcare</option>
                                <option>Logistics</option>
                              </select>
                              <ChevronRight className="absolute right-3 top-3.5 size-4 text-slate-500 rotate-90 pointer-events-none" />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mt-6">
                          <button
                            type="button"
                            onClick={prevStep}
                            className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-[#0f172a] text-slate-400 transition-all hover:bg-slate-800 hover:text-white"
                          >
                            <ArrowLeft className="size-4" />
                          </button>
                          <motion.button
                            whileHover={{ y: -2 }}
                            whileTap={{ y: 0 }}
                            type="button"
                            onClick={nextStep}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#4EA1FF] px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-[#4EA1FF] shadow-[0_0_20px_rgba(78,161,255,0.3)] hover:shadow-[0_0_30px_rgba(78,161,255,0.5)] group"
                          >
                            Continue
                            <ArrowRight className="size-4 opacity-70 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {registrationStep === 3 && (
                      <motion.div key="step3" custom={direction} variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-4">

                        <div className="flex flex-col items-center justify-center p-6 border border-slate-800/60 rounded-2xl bg-gradient-to-b from-[#0f172a] to-[#0a0f1a] mb-2 shadow-inner">
                          <div className="size-14 rounded-full bg-[#4EA1FF]/10 flex items-center justify-center text-[#4EA1FF] mb-4 ring-2 ring-blue-500/20">
                            <UserCheck className="size-7" />
                          </div>
                          <h3 className="text-base font-bold text-white">Select your primary role</h3>
                          <p className="text-xs text-slate-400 text-center mt-1">
                            We&apos;ll customize your GENIUS workspace<br/>and agent workflows accordingly.
                          </p>
                        </div>

                        <div className="flex flex-col gap-3">
                          {/* Role Select */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-400 ml-1">Access Role</label>
                            <div className="relative">
                              <ShieldCheck className="absolute left-4 top-3.5 size-4 text-slate-500" />
                              <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full appearance-none rounded-xl border border-slate-800 bg-[#0f172a] pl-11 pr-4 py-3 text-sm text-white focus:border-[#4EA1FF] focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-inner cursor-pointer"
                              >
                                <option>Owner</option>
                                <option>Admin</option>
                                <option>Manager</option>
                                <option>Member</option>
                                <option>Viewer</option>
                              </select>
                              <ChevronRight className="absolute right-4 top-4 size-4 text-slate-500 rotate-90 pointer-events-none" />
                            </div>
                          </div>

                          {/* Position Select */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-400 ml-1">Position / Title</label>
                            <div className="relative">
                              <User className="absolute left-4 top-3.5 size-4 text-slate-500" />
                              <select
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                className="w-full appearance-none rounded-xl border border-slate-800 bg-[#0f172a] pl-11 pr-4 py-3 text-sm text-white focus:border-[#4EA1FF] focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-inner cursor-pointer"
                              >
                                <option>CEO</option>
                                <option>CFO</option>
                                <option>Operations</option>
                                <option>Procurement</option>
                                <option>Finance</option>
                                <option>Analyst</option>
                                <option>Sales</option>
                                <option>Logistics</option>
                                <option>HR</option>
                                <option>Custom</option>
                              </select>
                              <ChevronRight className="absolute right-4 top-4 size-4 text-slate-500 rotate-90 pointer-events-none" />
                            </div>
                          </div>

                          {/* Department Select */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-400 ml-1">Department</label>
                            <div className="relative">
                              <Layers className="absolute left-4 top-3.5 size-4 text-slate-500" />
                              <select
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                className="w-full appearance-none rounded-xl border border-slate-800 bg-[#0f172a] pl-11 pr-4 py-3 text-sm text-white focus:border-[#4EA1FF] focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-inner cursor-pointer"
                              >
                                <option>Operations</option>
                                <option>Finance</option>
                                <option>Procurement</option>
                                <option>Sales</option>
                                <option>Logistics</option>
                                <option>Warehouse</option>
                                <option>HR</option>
                                <option>Custom</option>
                              </select>
                              <ChevronRight className="absolute right-4 top-4 size-4 text-slate-500 rotate-90 pointer-events-none" />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mt-6">
                          <button
                            type="button"
                            onClick={prevStep}
                            className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-[#0f172a] text-slate-400 transition-all hover:bg-slate-800 hover:text-white"
                          >
                            <ArrowLeft className="size-4" />
                          </button>
                          <motion.button
                            whileHover={{ y: -2 }}
                            whileTap={{ y: 0 }}
                            type="button"
                            onClick={() => submitEmailAuth("signup")}
                            disabled={loadingMode !== null}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#4EA1FF] px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-[#4EA1FF] disabled:cursor-not-allowed disabled:opacity-60 shadow-[0_0_20px_rgba(78,161,255,0.3)] hover:shadow-[0_0_30px_rgba(78,161,255,0.5)] group"
                          >
                            {loadingMode === "signup" ? "Creating Workspace..." : "Create Workspace"}
                            {loadingMode !== "signup" && <CheckCircle2 className="size-4 opacity-70 group-hover:scale-110 group-hover:opacity-100 transition-all" />}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Trust Badges */}
          <div className="mt-12 flex items-center justify-between gap-4 border-t border-slate-800/60 pt-6">
            <div className="flex items-center gap-2.5 opacity-70 hover:opacity-100 transition-opacity">
              <ShieldCheck className="size-4 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-white uppercase tracking-wider">Enterprise grade</span>
                <span className="text-[9px] text-slate-500">SOC 2 compliant</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 opacity-70 hover:opacity-100 transition-opacity">
              <Lock className="size-4 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-white uppercase tracking-wider">Your data is private</span>
                <span className="text-[9px] text-slate-500">End-to-end encrypted</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 opacity-70 hover:opacity-100 transition-opacity">
              <CheckCircle className="size-4 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-white uppercase tracking-wider">Approval-first</span>
                <span className="text-[9px] text-slate-500">Controlled by your org</span>
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
