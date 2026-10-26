"use client";

export interface PresetScenario {
  id: string;
  name: string;
  tag: string;
  imagePath: string;
  defaultTranscript: string;
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: "scaffold_ladder",
    name: "Upper Deck & Ladder Access",
    tag: "Subpart M & X",
    imagePath: "/presets/scaffold_ladder.svg",
    defaultTranscript: "",
  },
  {
    id: "trench_pit",
    name: "Trench Excavation & Lip Spoil",
    tag: "Subpart P (Voice Boosted)",
    imagePath: "/presets/trench_excavation.svg",
    defaultTranscript: "Check the trench excavation, workers digging near edge without shoring.",
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
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-slate-400">Quick Demo Presets:</span>
      {PRESET_SCENARIOS.map((p) => {
        const active = activePresetId === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelectPreset(p)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
              active
                ? "border-sky-400 bg-sky-500/20 text-sky-200 shadow-sm"
                : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800"
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
          className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2 ml-1"
        >
          Reset
        </button>
      )}
    </div>
  );
}
