"use client";

import { SEVERITY_STYLES } from "@/lib/severity";
import type { Hazard } from "@/lib/types";

interface Props {
  hazards: Hazard[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export default function HazardSidebar({ hazards, selectedId, onSelect }: Props) {
  if (hazards.length === 0) {
    return <p className="text-sm text-slate-400">No hazards detected.</p>;
  }
  return (
    <ul className="flex flex-col gap-3">
      {hazards.map((h, i) => {
        const selected = h.id === selectedId;
        const s = SEVERITY_STYLES[h.severity] ?? SEVERITY_STYLES.LOW;
        return (
          <li key={h.id}>
            <button
              id={`hazard-${h.id}`}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(selected ? null : h.id)}
              className={`w-full rounded-xl border p-4 text-left transition-all duration-200 ${
                selected
                  ? "border-sky-400/70 bg-slate-800 shadow-lg shadow-sky-500/10"
                  : "border-slate-700/60 bg-slate-800/40 hover:border-slate-500 hover:bg-slate-800/70"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${s.dot}`} />
                  <h3 className="text-sm font-semibold text-slate-100">
                    {i + 1}. {h.title}
                  </h3>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold tracking-wide ring-1 ${s.badge}`}
                >
                  {h.severity}
                </span>
              </div>
              <p className="mt-2 font-mono text-xs text-sky-300">{h.osha_citation}</p>
              {selected && (
                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  <p>{h.description}</p>
                  <p>
                    <span className="font-semibold text-slate-100">Fix: </span>
                    {h.corrective_action}
                  </p>
                </div>
              )}
              <p className="mt-2 text-xs text-slate-500">
                Confidence {Math.round(h.confidence * 100)}%
              </p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
