"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

// Sub-components
import { SituationSection } from "./overview-situation";
import { RecommendationSection } from "./overview-recommendation";
import { EvidenceAndConfidence } from "./overview-evidence";
import { RisksSection } from "./overview-risks";
import { SCENARIOS, ScenarioComparison } from "./overview-scenarios";
import { ExecutionPreview } from "./overview-execution";

// Animation settings
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, ease: "easeOut" },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export function OverviewTab({
  report,
  busy,
  onOpenDetails,
  onOpenEvidence,
  onOpenRisks,
  onConfigureExecution,
}) {
  const [scenarioId, setScenarioId] = useState("recommended");
  
  const activeScenarioData = useMemo(() => {
    return SCENARIOS.find(s => s.id === scenarioId) || SCENARIOS[1];
  }, [scenarioId]);

  if (busy) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 lg:gap-8 p-4 lg:p-6 pb-24 min-w-0"
    >
      {/* 1. AI Recommendation Hero & Metrics (Full Width) */}
      <RecommendationSection scenarioData={activeScenarioData} itemVariants={itemVariants} onOpenRationale={onOpenDetails} />

      {/* Row 3: Three-Column Grid for supporting details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <SituationSection report={report} itemVariants={itemVariants} onOpenDetails={onOpenDetails} />
        <EvidenceAndConfidence scenarioData={activeScenarioData} itemVariants={itemVariants} onOpenEvidence={onOpenEvidence} />
        <RisksSection itemVariants={itemVariants} onOpenRisks={onOpenRisks} />
      </div>

      {/* Row 4: Two-Column Split (Alternative Scenarios & Execution Preview) */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-4 lg:gap-6">
        <ScenarioComparison scenario={scenarioId} setScenario={setScenarioId} itemVariants={itemVariants} />
        <ExecutionPreview scenarioData={activeScenarioData} itemVariants={itemVariants} onConfigureExecution={onConfigureExecution} />
      </div>
    </motion.div>
  );
}
