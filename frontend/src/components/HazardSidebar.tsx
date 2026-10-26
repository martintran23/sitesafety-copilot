"use client";

import { useMemo, useState } from "react";
import { CheckCircleIcon, ShieldAlertIcon, SpeakerIcon, StopCircleIcon } from "./Icons";
import { getSubpartKey, OSHA_SUBPARTS, SEVERITY_STYLES, STATUS_STYLES } from "@/lib/severity";
import type { Hazard, HazardStatus, OshaSubpartKey, Severity } from "@/lib/types";

interface Props {
  hazards: Hazard[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  hoveredId?: string | null;
  onHover?: (id: string | null) => void;
  statuses?: Record<string, HazardStatus>;
  onStatusChange?: (id: string, status: HazardStatus) => void;
  activeTourId?: string | null;
}

export default function HazardSidebar({
  hazards,
  selectedId,
  onSelect,
  hoveredId = null,
  onHover,
  statuses = {},
  onStatusChange,
  activeTourId = null,
}: Props) {
  const [playingHazardId, setPlayingHazardId] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | "ALL">("ALL");
  const [selectedSubpart, setSelectedSubpart] = useState<OshaSubpartKey>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHazards = useMemo(() => {
    return hazards.filter((h) => {
      // Severity filter
      if (selectedSeverity !== "ALL" && h.severity !== selectedSeverity) {
        return false;
      }
      // Subpart filter
      if (selectedSubpart !== "ALL" && getSubpartKey(h.osha_citation) !== selectedSubpart) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = h.title.toLowerCase().includes(q);
        const matchCite = h.osha_citation.toLowerCase().includes(q);
        const matchAction = h.corrective_action.toLowerCase().includes(q);
        const matchDesc = h.description.toLowerCase().includes(q);
        if (!matchTitle && !matchCite && !matchAction && !matchDesc) {
          return false;
        }
      }
      return true;
    });
  }, [hazards, selectedSeverity, selectedSubpart, searchQuery]);

  function playHazardAudio(e: React.MouseEvent, h: Hazard) {
    e.stopPropagation();
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (playingHazardId === h.id) {
      window.speechSynthesis.cancel();
      setPlayingHazardId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(h.audio_response_script);
    utterance.rate = 1.0;
    utterance.onstart = () => setPlayingHazardId(h.id);
    utterance.onend = () => setPlayingHazardId(null);
    utterance.onerror = () => setPlayingHazardId(null);
    window.speechSynthesis.speak(utterance);
  }

  function handleStatusClick(e: React.MouseEvent, hazardId: string, nextStatus: HazardStatus) {
    e.stopPropagation();
    onStatusChange?.(hazardId, nextStatus);
  }

  if (hazards.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center text-slate-400">
        <p className="text-sm font-semibold text-slate-300">No OSHA Hazards Detected</p>
        <p className="mt-1 text-xs text-slate-500">
          Jobsite scene appears compliant under Title 29 CFR 1926 standards.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Search and Filter Controls */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 shadow-md backdrop-blur-xs">
        {/* Search Input */}
        <div className="relative mb-2.5">
          <input
            id="hazard-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search CFR standard, keyword, action..."
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-1.5 pl-8 text-xs text-slate-200 placeholder-slate-500 transition focus:border-sky-400 focus:outline-none"
          />
          <span className="pointer-events-none absolute left-2.5 top-2 text-xs text-slate-500">
            🔍
          </span>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1.5 text-xs text-slate-400 hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </div>

        {/* Severity Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mr-1">
            Severity:
          </span>
          {(["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((sev) => {
            const isSelected = selectedSeverity === sev;
            const count =
              sev === "ALL" ? hazards.length : hazards.filter((h) => h.severity === sev).length;
            if (count === 0 && sev !== "ALL") return null;

            return (
              <button
                key={sev}
                type="button"
                onClick={() => setSelectedSeverity(sev)}
                className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold transition ${
                  isSelected
                    ? "bg-sky-500 text-slate-950 shadow-sm"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-750 hover:text-slate-200"
                }`}
              >
                {sev} ({count})
              </button>
            );
          })}
        </div>

        {/* OSHA Subpart Selector */}
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 shrink-0">
            Subpart:
          </span>
          <select
            id="subpart-filter-select"
            aria-label="Filter hazards by OSHA Subpart"
            value={selectedSubpart}
            onChange={(e) => setSelectedSubpart(e.target.value as OshaSubpartKey)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-200 focus:border-sky-400 focus:outline-none"
          >
            {OSHA_SUBPARTS.map((sp) => (
              <option key={sp.key} value={sp.key}>
                {sp.label} — {sp.title}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Results Status */}
        {(selectedSeverity !== "ALL" || selectedSubpart !== "ALL" || searchQuery) && (
          <div className="mt-2 flex items-center justify-between border-t border-slate-800 pt-1.5 text-[10px] text-slate-400">
            <span>
              Showing {filteredHazards.length} of {hazards.length} hazards
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedSeverity("ALL");
                setSelectedSubpart("ALL");
                setSearchQuery("");
              }}
              className="text-sky-400 hover:underline"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* Hazard List */}
      <ul className="flex flex-col gap-3">
        {filteredHazards.map((h, i) => {
          const isSelected = h.id === selectedId;
          const isHovered = h.id === hoveredId;
          const isTouring = h.id === activeTourId;
          const isSpeaking = playingHazardId === h.id || isTouring;
          const status = statuses[h.id] || "OPEN";
          const sevStyle = SEVERITY_STYLES[h.severity] ?? SEVERITY_STYLES.LOW;
          const statusStyle = STATUS_STYLES[status];

          return (
            <li
              key={h.id}
              onMouseEnter={() => onHover?.(h.id)}
              onMouseLeave={() => onHover?.(null)}
            >
              <div
                id={`hazard-${h.id}`}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => onSelect(isSelected ? null : h.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(isSelected ? null : h.id);
                  }
                }}
                className={`w-full cursor-pointer rounded-2xl border p-4 text-left transition-all duration-200 ${
                  isTouring
                    ? "border-sky-400 bg-sky-950/40 shadow-xl shadow-sky-500/20 ring-2 ring-sky-400"
                    : isSelected
                    ? "border-sky-400/80 bg-slate-800/90 shadow-xl shadow-sky-500/10 ring-1 ring-sky-400/30"
                    : isHovered
                    ? "border-slate-700 bg-slate-850 shadow-md"
                    : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-850"
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                        status === "RESOLVED"
                          ? "bg-emerald-400"
                          : status === "STOP_WORK"
                          ? "bg-amber-400 animate-pulse"
                          : sevStyle.dot
                      }`}
                    />
                    <h3 className="text-sm font-semibold text-slate-100">
                      {i + 1}. {h.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="rounded-md bg-slate-800/90 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400">
                      +{h.severity_weight} pts
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ring-1 ${sevStyle.badge}`}
                    >
                      {h.severity}
                    </span>
                  </div>
                </div>

                {/* Sub-header row: Citation, Status badge, Listen */}
                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-xs font-semibold text-sky-400">{h.osha_citation}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${statusStyle.badge}`}
                    >
                      {statusStyle.label}
                    </span>
                  </div>

                  <button
                    type="button"
                    title="Listen to spoken audio findings"
                    onClick={(e) => playHazardAudio(e, h)}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                      isSpeaking
                        ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/40"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <SpeakerIcon className="h-3.5 w-3.5 text-amber-400" />
                    <span>{isSpeaking ? (isTouring ? "Touring" : "Speaking") : "Listen"}</span>
                  </button>
                </div>

                {/* Status action toggle buttons */}
                <div className="mt-3 flex items-center gap-1.5 border-t border-slate-800/80 pt-2.5">
                  <span className="text-[10px] font-semibold text-slate-400 mr-0.5">Action:</span>
                  <button
                    type="button"
                    onClick={(e) => handleStatusClick(e, h.id, "OPEN")}
                    className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold transition ${
                      status === "OPEN"
                        ? "bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <ShieldAlertIcon className="h-3 w-3" />
                    <span>Open</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleStatusClick(e, h.id, "STOP_WORK")}
                    className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold transition ${
                      status === "STOP_WORK"
                        ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <StopCircleIcon className="h-3 w-3" />
                    <span>Stop Work</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleStatusClick(e, h.id, "RESOLVED")}
                    className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold transition ${
                      status === "RESOLVED"
                        ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <CheckCircleIcon className="h-3 w-3" />
                    <span>Corrected</span>
                  </button>
                </div>

                {/* Expanded Details on Selection or Active Tour */}
                {(isSelected || isTouring) && (
                  <div className="mt-3.5 space-y-2.5 border-t border-slate-700/60 pt-3 text-xs text-slate-300">
                    <p className="leading-relaxed">{h.description}</p>
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5">
                      <span className="font-bold text-amber-300">Immediate Corrective Action: </span>
                      <span className="text-slate-200">{h.corrective_action}</span>
                    </div>
                    {h.audio_response_script && (
                      <p className="italic text-slate-400">
                        &ldquo;{h.audio_response_script}&rdquo;
                      </p>
                    )}
                  </div>
                )}

                {/* Footer metadata */}
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Confidence: {Math.round(h.confidence * 100)}%</span>
                  <span className="font-mono text-[10px]">[{h.box_2d.join(", ")}]</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
