import type { Hazard, HazardStatus, OshaSubpartKey, Severity, SubpartMeta } from "./types.ts";

export const SEVERITY_STYLES: Record<
  Severity,
  { box: string; badge: string; dot: string; text: string }
> = {
  CRITICAL: {
    box: "border-red-500 bg-red-500/15 text-red-300",
    badge: "bg-red-500/15 text-red-300 ring-red-500/40",
    dot: "bg-red-500",
    text: "text-red-400",
  },
  HIGH: {
    box: "border-orange-500 bg-orange-500/15 text-orange-300",
    badge: "bg-orange-500/15 text-orange-300 ring-orange-500/40",
    dot: "bg-orange-500",
    text: "text-orange-400",
  },
  MEDIUM: {
    box: "border-amber-400 bg-amber-400/15 text-amber-200",
    badge: "bg-amber-400/15 text-amber-200 ring-amber-400/40",
    dot: "bg-amber-400",
    text: "text-amber-300",
  },
  LOW: {
    box: "border-emerald-400 bg-emerald-400/15 text-emerald-200",
    badge: "bg-emerald-400/15 text-emerald-200 ring-emerald-400/40",
    dot: "bg-emerald-400",
    text: "text-emerald-400",
  },
};

export const STATUS_STYLES: Record<
  HazardStatus,
  { label: string; badge: string; border: string; bg: string; dot: string; icon: string }
> = {
  OPEN: {
    label: "Open",
    badge: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
    border: "border-rose-500/40",
    bg: "bg-rose-500/5",
    dot: "bg-rose-500",
    icon: "⚠️",
  },
  STOP_WORK: {
    label: "Work Stopped",
    badge: "bg-amber-500/20 text-amber-300 ring-amber-500/40 animate-pulse",
    border: "border-amber-500/60 border-dashed",
    bg: "bg-amber-500/10",
    dot: "bg-amber-400",
    icon: "🛑",
  },
  RESOLVED: {
    label: "Corrected",
    badge: "bg-emerald-500/20 text-emerald-300 ring-emerald-500/40",
    border: "border-emerald-500/60",
    bg: "bg-emerald-500/10",
    dot: "bg-emerald-400",
    icon: "✓",
  },
};

export const OSHA_SUBPARTS: SubpartMeta[] = [
  { key: "ALL", label: "All Citations", code: "All", title: "All CFR Standards" },
  { key: "SUBPART_M", label: "Subpart M", code: "1926.501/502", title: "Fall Protection" },
  { key: "SUBPART_L", label: "Subpart L", code: "1926.451", title: "Scaffolding" },
  { key: "SUBPART_P", label: "Subpart P", code: "1926.651/652", title: "Excavations & Trenching" },
  { key: "SUBPART_X", label: "Subpart X", code: "1926.1053", title: "Stairways & Ladders" },
  { key: "SUBPART_E_K", label: "Subparts E/K", code: "1926.100/404", title: "PPE & Electrical" },
  { key: "OTHER", label: "Other", code: "1926", title: "General Construction" },
];

export function getSubpartKey(citation: string): OshaSubpartKey {
  const norm = citation.replace(/\s+/g, "");
  if (norm.includes("1926.501") || norm.includes("1926.502") || norm.includes("1926.503")) {
    return "SUBPART_M";
  }
  if (norm.includes("1926.451") || norm.includes("1926.452")) {
    return "SUBPART_L";
  }
  if (norm.includes("1926.651") || norm.includes("1926.652")) {
    return "SUBPART_P";
  }
  if (norm.includes("1926.1053") || norm.includes("1926.1051") || norm.includes("1926.1060")) {
    return "SUBPART_X";
  }
  if (norm.includes("1926.100") || norm.includes("1926.102") || norm.includes("1926.404")) {
    return "SUBPART_E_K";
  }
  return "OTHER";
}

export function riskLevelFromScore(score: number): string {
  if (score <= 0) return "CLEAR";
  if (score >= 80) return "CRITICAL";
  if (score >= 50) return "HIGH";
  if (score >= 25) return "MEDIUM";
  return "LOW";
}

export function riskColor(level: string): string {
  switch (level.toUpperCase()) {
    case "CRITICAL":
      return "text-red-400";
    case "HIGH":
      return "text-orange-400";
    case "MEDIUM":
    case "MODERATE":
      return "text-amber-300";
    case "LOW":
      return "text-emerald-400";
    case "CLEAR":
      return "text-emerald-300";
    default:
      return "text-slate-300";
  }
}

export function calculateRemediatedScore(
  hazards: Hazard[],
  statuses: Record<string, HazardStatus>
): {
  score: number;
  level: string;
  originalScore: number;
  mitigatedPoints: number;
  openCount: number;
  stopWorkCount: number;
  resolvedCount: number;
} {
  const originalScore = Math.min(
    100,
    hazards.reduce((acc, h) => acc + h.severity_weight, 0)
  );

  let activeSum = 0;
  let openCount = 0;
  let stopWorkCount = 0;
  let resolvedCount = 0;

  for (const h of hazards) {
    const st = statuses[h.id] || "OPEN";
    if (st === "OPEN") {
      activeSum += h.severity_weight;
      openCount++;
    } else if (st === "STOP_WORK") {
      // Work stopped / barricaded reduces acute active exposure by 50%
      activeSum += Math.ceil(h.severity_weight * 0.5);
      stopWorkCount++;
    } else if (st === "RESOLVED") {
      resolvedCount++;
    }
  }

  const score = Math.min(100, activeSum);
  const level = riskLevelFromScore(score);
  const mitigatedPoints = Math.max(0, originalScore - score);

  return {
    score,
    level,
    originalScore,
    mitigatedPoints,
    openCount,
    stopWorkCount,
    resolvedCount,
  };
}
