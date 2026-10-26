import type { Severity } from "./types";

export const SEVERITY_STYLES: Record<
  Severity,
  { box: string; badge: string; dot: string }
> = {
  CRITICAL: {
    box: "border-red-500 bg-red-500/15",
    badge: "bg-red-500/15 text-red-300 ring-red-500/40",
    dot: "bg-red-500",
  },
  HIGH: {
    box: "border-orange-500 bg-orange-500/15",
    badge: "bg-orange-500/15 text-orange-300 ring-orange-500/40",
    dot: "bg-orange-500",
  },
  MEDIUM: {
    box: "border-amber-400 bg-amber-400/15",
    badge: "bg-amber-400/15 text-amber-200 ring-amber-400/40",
    dot: "bg-amber-400",
  },
  LOW: {
    box: "border-emerald-400 bg-emerald-400/15",
    badge: "bg-emerald-400/15 text-emerald-200 ring-emerald-400/40",
    dot: "bg-emerald-400",
  },
};

export function riskColor(level: string): string {
  switch (level.toUpperCase()) {
    case "CRITICAL":
      return "text-red-400";
    case "HIGH":
      return "text-orange-400";
    case "MEDIUM":
    case "MODERATE":
      return "text-amber-300";
    default:
      return "text-emerald-400";
  }
}
