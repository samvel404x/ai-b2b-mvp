"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { CheckCircle2, Loader2, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const validationSteps = [
  { id: "permissions", label: "Validating permissions" },
  { id: "freshness", label: "Checking data freshness" },
  { id: "evidence", label: "Verifying evidence completeness" },
  { id: "budget", label: "Checking budget constraints" },
  { id: "policy", label: "Checking policy compliance" },
  { id: "supplier", label: "Verifying supplier status" },
  { id: "readiness", label: "Preparing approval" },
];

export function ValidationDialog({ open, onOpenChange, onComplete, shouldFail = false }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [status, setStatus] = useState("idle"); // idle, running, success, error

  useEffect(() => {
    if (open && status === "idle") {
      const timer = window.setTimeout(() => {
        setStatus("running");
        setCurrentStep(0);
      }, 0);
      return () => window.clearTimeout(timer);
    }
    
    if (open && status === "running") {
      const stepDuration = 400 + Math.random() * 400; // 400-800ms per step
      
      const timer = setTimeout(() => {
        if (shouldFail && currentStep === 3) {
          // Force fail at budget check for demo purposes
          setStatus("error");
          return;
        }

        if (currentStep < validationSteps.length - 1) {
          setCurrentStep(c => c + 1);
        } else {
          setStatus("success");
          setTimeout(() => {
            onComplete();
            onOpenChange(false);
          }, 800);
        }
      }, stepDuration);

      return () => clearTimeout(timer);
    }

    if (!open) {
      const timer = window.setTimeout(() => setStatus("idle"), 300);
      return () => window.clearTimeout(timer);
    }
  }, [open, currentStep, status, shouldFail, onComplete, onOpenChange]);

  return (
    <Dialog.Root open={open} onOpenChange={status === "running" ? undefined : onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-all" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[#28313C] bg-[#0E1116] p-6 shadow-2xl transition-all">
          
          <Dialog.Title className="text-lg font-bold text-white flex items-center gap-2 mb-6 uppercase tracking-wider">
            <ShieldIcon status={status} />
            Approval Validation
          </Dialog.Title>

          <div className="space-y-4 mb-8">
            {validationSteps.map((step, index) => {
              const isPast = index < currentStep;
              const isCurrent = index === currentStep && status === "running";
              const isError = index === currentStep && status === "error";
              
              // Only show current and past steps, hide future steps unless we're done
              if (index > currentStep && status !== "success") return null;

              return (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }}
                  key={step.id} 
                  className={cn(
                    "flex items-center gap-3 transition-colors duration-300",
                    isPast || status === "success" ? "text-primary" : isCurrent ? "text-white" : isError ? "text-critical" : "text-muted-foreground opacity-50"
                  )}
                >
                  {isPast || status === "success" ? (
                    <CheckCircle2 className="size-4" />
                  ) : isCurrent ? (
                    <Loader2 className="size-4 animate-spin text-primary" />
                  ) : isError ? (
                    <XCircle className="size-4 text-critical" />
                  ) : (
                    <div className="size-4 rounded-full border-2 border-current opacity-30" />
                  )}
                  <span className={cn("text-sm", isError ? "font-bold" : isCurrent ? "font-semibold" : "")}>
                    {step.label}
                  </span>
                </motion.div>
              );
            })}
          </div>

          <AnimatePresence>
            {status === "error" && (
              <motion.div 
                initial={{ opacity: 0, y: 10, height: 0 }} 
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                className="rounded-lg border border-critical/30 bg-critical/10 p-4 mb-6"
              >
                <div className="flex items-start gap-2 text-critical mb-2">
                  <AlertTriangle className="size-4 mt-0.5 shrink-0" />
                  <span className="text-sm font-bold">Validation Failed</span>
                </div>
                <p className="text-xs text-critical/80 ml-6">
                  Budget allocation constraint exceeded for Q3. Approving this requires an explicit policy override from Finance.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end gap-3">
            {status === "error" ? (
              <>
                <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-white hover:bg-[#141A22]">
                  Cancel
                </Button>
                <Button onClick={() => setStatus("running") || setCurrentStep(0)} className="bg-[#141A22] text-white hover:bg-[#28313C] font-bold border border-[#28313C]">
                  Retry Validation
                </Button>
              </>
            ) : status === "success" ? (
              <Button disabled className="bg-primary/50 text-black font-bold border-transparent">
                <CheckCircle2 className="size-4 mr-2" /> Complete
              </Button>
            ) : (
              <Button disabled variant="ghost" className="text-muted-foreground">
                Processing...
              </Button>
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ShieldIcon({ status }) {
  if (status === "error") return <XCircle className="size-5 text-critical" />;
  if (status === "success") return <CheckCircle2 className="size-5 text-primary" />;
  return <Loader2 className="size-5 text-primary animate-spin" />;
}
