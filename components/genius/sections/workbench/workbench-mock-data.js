export const workbenchMockData = {
  kpis: {
    moneyAtRisk: "$2.48M",
    evidenceSources: 95,
    activeFindings: 34,
    openActions: 24,
    aiConfidence: 94
  },
  executiveSummary: {
    text: "Your current EA renewal shows a $2.48M (23%) above-market risk driven by overlapping licenses, unused capacity, and unfavorable price escalators. With strategic negotiation and right-sizing, you can reduce annual spend by $1.37M.",
    totalRisk: "$2.48M",
    potentialSavings: "$1.37M",
    riskDelta: "23% above market",
    savingsDelta: "12% of total spend"
  },
  riskBreakdown: [
    { label: "Overlapping licenses", value: 1.05, percent: 42, color: "var(--critical)" },
    { label: "Unused capacity", value: 0.75, percent: 30, color: "var(--warning)" },
    { label: "Price escalators", value: 0.42, percent: 17, color: "var(--primary)" },
    { label: "Unfavorable terms", value: 0.26, percent: 10, color: "#4EA1FF" }
  ],
  topRiskDrivers: [
    { driver: "Overlapping licenses", impact: "$1.05M", confidence: "High", confidenceTone: "primary", evidence: "5 sources" },
    { driver: "Unused capacity", impact: "$750K", confidence: "High", confidenceTone: "primary", evidence: "3 sources" },
    { driver: "Price escalators", impact: "$420K", confidence: "Medium", confidenceTone: "warning", evidence: "2 sources" },
    { driver: "Unfavorable terms", impact: "$260K", confidence: "Medium", confidenceTone: "warning", evidence: "4 sources" }
  ],
  marketBenchmark: [
    { category: "M365 E5", yourTerms: "$57.20", benchmark: "$44.50", variance: "+28.5%", risk: "$620K", varianceTone: "critical" },
    { category: "Azure Consumption", yourTerms: "$0.167 / hour", benchmark: "$0.128 / hour", variance: "+30.5%", risk: "$480K", varianceTone: "critical" },
    { category: "Power BI Pro", yourTerms: "$13.70", benchmark: "$9.80", variance: "+39.8%", risk: "$310K", varianceTone: "critical" },
    { category: "Dynamics 365", yourTerms: "$65.00", benchmark: "$54.20", variance: "+19.9%", risk: "$290K", varianceTone: "critical" }
  ],
  recommendations: [
    { title: "Right-size M365 licenses", impact: "$750K" },
    { title: "Eliminate overlapping licenses", impact: "$630K" },
    { title: "Negotiate Azure committed use discount", impact: "$480K" },
    { title: "Remove unused Power BI seats", impact: "$310K" },
    { title: "Re-negotiate price escalators", impact: "$260K" }
  ]
};
