"use client";

import { useState } from "react";
import { box2dToStyle } from "@/lib/box";
import { SEVERITY_STYLES, STATUS_STYLES } from "@/lib/severity";
import type { Hazard, HazardStatus } from "@/lib/types";

interface Props {
  imageUrl: string;
  hazards: Hazard[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  hoveredId?: string | null;
  onHover?: (id: string | null) => void;
  statuses?: Record<string, HazardStatus>;
  activeTourId?: string | null;
  showLabels?: boolean;
  dimBackground?: boolean;
}

export default function InspectionCanvas({
  imageUrl,
  hazards,
  selectedId,
  onSelect,
  hoveredId = null,
  onHover,
  statuses = {},
  activeTourId = null,
  showLabels = true,
  dimBackground = true,
}: Props) {
  const [localHoveredId, setLocalHoveredId] = useState<string | null>(null);
  const activeHover = hoveredId ?? localHoveredId;

  function handleMouseEnter(id: string) {
    setLocalHoveredId(id);
    onHover?.(id);
  }

  function handleMouseLeave() {
    setLocalHoveredId(null);
    onHover?.(null);
  }

  const activeFocusId = activeTourId || selectedId || activeHover;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-950 shadow-2xl shadow-black/50">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt="Jobsite inspection spatial canvas"
        className="block h-auto w-full select-none"
      />

      {/* Dim overlay when focusing on a box */}
      {dimBackground && activeFocusId && (
        <div className="pointer-events-none absolute inset-0 bg-slate-950/40 transition-opacity duration-300" />
      )}

      {hazards.map((h, i) => {
        const isSelected = h.id === selectedId;
        const isTouring = h.id === activeTourId;
        const isHovered = h.id === activeHover;
        const status = statuses[h.id] || "OPEN";
        const sevStyle = SEVERITY_STYLES[h.severity] ?? SEVERITY_STYLES.LOW;
        const statusStyle = STATUS_STYLES[status];

        // Determine border and visual style based on status and selection
        let boxClasses = "border-2";
        if (status === "RESOLVED") {
          boxClasses = "border-emerald-400 bg-emerald-500/20";
        } else if (status === "STOP_WORK") {
          boxClasses = "border-amber-400 border-dashed bg-amber-500/25";
        } else {
          boxClasses = sevStyle.box;
        }

        let focusClasses = "";
        if (isTouring) {
          focusClasses = "z-30 border-4 ring-4 ring-sky-400 ring-offset-2 ring-offset-slate-950 animate-pulse shadow-2xl shadow-sky-500/50";
        } else if (isSelected) {
          focusClasses = "z-20 border-4 ring-2 ring-sky-400 shadow-2xl shadow-black/80";
        } else if (isHovered) {
          focusClasses = "z-10 border-3 brightness-125 shadow-lg shadow-black/60";
        } else if (activeFocusId) {
          // Dim other non-focused boxes slightly
          focusClasses = "opacity-40";
        }

        const [ymin] = h.box_2d;
        const showTooltipAbove = ymin > 180;

        return (
          <div
            key={h.id}
            style={box2dToStyle(h.box_2d)}
            className={`absolute transition-all duration-200 pointer-events-auto ${boxClasses} ${focusClasses}`}
            onMouseEnter={() => handleMouseEnter(h.id)}
            onMouseLeave={handleMouseLeave}
          >
            {/* Clickable hit area button */}
            <button
              id={`box-${h.id}`}
              type="button"
              aria-label={`${h.title} (${h.osha_citation})`}
              aria-pressed={isSelected}
              onClick={() => onSelect(isSelected ? null : h.id)}
              className="absolute inset-0 w-full h-full cursor-pointer focus:outline-none"
            >
              <span className="sr-only">{h.title}</span>
            </button>

            {/* Corner Badge */}
            <span
              className={`absolute -top-px -left-px flex h-6 min-w-6 items-center justify-center px-1.5 text-xs font-bold text-white shadow-md ${
                status === "RESOLVED"
                  ? "bg-emerald-600"
                  : status === "STOP_WORK"
                  ? "bg-amber-600"
                  : "bg-slate-900/95"
              }`}
            >
              {status === "RESOLVED" ? "✓" : status === "STOP_WORK" ? "🛑" : i + 1}
            </span>

            {/* In-canvas Label Pill */}
            {showLabels && (
              <div className="pointer-events-none absolute left-7 -top-px flex items-center gap-1.5 rounded-br-md bg-slate-900/90 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-200 shadow backdrop-blur-xs">
                <span className="text-sky-300">{h.osha_citation.replace("29 CFR ", "")}</span>
                <span className="text-slate-400">•</span>
                <span className={status === "RESOLVED" ? "text-emerald-300" : sevStyle.text}>
                  {status === "RESOLVED" ? "RESOLVED" : h.severity}
                </span>
              </div>
            )}

            {/* Floating Rich Tooltip on Hover or Tour */}
            {(isHovered || isTouring) && (
              <div
                className={`pointer-events-none absolute left-0 z-40 w-72 rounded-xl border border-slate-700 bg-slate-900/95 p-3 text-left shadow-2xl backdrop-blur-md transition-opacity duration-200 ${
                  showTooltipAbove ? "bottom-full mb-2" : "top-full mt-2"
                }`}
              >
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
                  <span className="font-mono text-[11px] font-bold text-sky-400">
                    {h.osha_citation}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${statusStyle.badge}`}>
                    {statusStyle.label}
                  </span>
                </div>
                <p className="mt-1.5 text-xs font-semibold text-slate-100">{h.title}</p>
                <p className="mt-1 text-[11px] text-slate-400 line-clamp-2">{h.corrective_action}</p>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Confidence: {Math.round(h.confidence * 100)}%</span>
                  <span className="font-mono text-slate-400">+{h.severity_weight} pts</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
