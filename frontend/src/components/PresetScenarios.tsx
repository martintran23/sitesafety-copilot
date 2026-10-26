"use client";

import { LayersIcon } from "./Icons";

export interface PresetScenario {
  id: string;
  name: string;
  sector: string;
  tag: string;
  imagePath: string;
  defaultTranscript: string;
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: "leading_edge",
    name: "Upper Deck & Leading Edge",
    sector: "Tower B — Level 7",
    tag: "Subparts M & X (Falls/Ladders)",
    imagePath: "/demo/leading-edge.jpg",
    defaultTranscript:
      "Upper deck concrete floor has workers near the unprotected edge, uncovered core holes, and ladder.",
  },
  {
    id: "trench_pit",
    name: "Deep Trench Excavation & Spoil",
    sector: "Utility Station 12+50",
    tag: "Subpart P (Excavation Voice Boost)",
    imagePath: "/demo/trench.jpg",
    defaultTranscript:
      "Check the trench excavation, worker shoveling in six-foot cut without shoring or ladder egress.",
  },
  {
    id: "scaffold_facade",
    name: "Supported Facade Scaffold",
    sector: "South Facade Elevation",
    tag: "Subpart L (Scaffolding Voice Boost)",
    imagePath: "/demo/scaffold.jpg",
    defaultTranscript:
      "Scaffold framing on south elevation looks incomplete, mid-rail missing and gaps in plank decking.",
  },
];

interface Props {
  activePresetId: string | null;
  onSelectPreset: (preset: PresetScenario) => void;
  onClearPreset: () => void;
}

export default function PresetScenarios({
  activePresetId,
  onSelectPreset,
  onClearPreset,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-2xl border border-slate-800 bg-slate-900/60 p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
          <LayersIcon className="h-3.5 w-3.5" />
        </span>
        <span className="text-xs font-bold text-slate-300">Preset Jobsite Scenarios:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {PRESET_SCENARIOS.map((p) => {
          const active = activePresetId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectPreset(p)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? "border-amber-400 bg-amber-500/15 text-amber-300 shadow-xs ring-1 ring-amber-400/30"
                  : "border-slate-800 bg-slate-950/80 text-slate-300 hover:border-slate-700 hover:text-slate-100"
              }`}
            >
              <span>{p.name}</span>
              <span className="rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                {p.tag}
              </span>
            </button>
          );
        })}

        {activePresetId && (
          <button
            type="button"
            onClick={onClearPreset}
            className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-2 ml-1"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
