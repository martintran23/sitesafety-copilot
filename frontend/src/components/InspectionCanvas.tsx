"use client";

import { box2dToStyle } from "@/lib/box";
import { SEVERITY_STYLES } from "@/lib/severity";
import type { Hazard } from "@/lib/types";

interface Props {
  imageUrl: string;
  hazards: Hazard[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export default function InspectionCanvas({ imageUrl, hazards, selectedId, onSelect }: Props) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-950 shadow-2xl shadow-black/40">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt="Uploaded site photo" className="block h-auto w-full select-none" />
      {hazards.map((h, i) => {
        const selected = h.id === selectedId;
        const s = SEVERITY_STYLES[h.severity] ?? SEVERITY_STYLES.LOW;
        return (
          <button
            key={h.id}
            id={`box-${h.id}`}
            type="button"
            aria-label={h.title}
            aria-pressed={selected}
            onClick={() => onSelect(selected ? null : h.id)}
            style={box2dToStyle(h.box_2d)}
            className={`absolute border-2 transition-all duration-200 ${s.box} ${
              selected ? "z-10 border-4 shadow-[0_0_0_9999px_rgba(2,6,23,0.55)]" : "hover:brightness-125"
            }`}
          >
            <span className="absolute -top-px -left-px flex h-6 min-w-6 items-center justify-center bg-slate-900/90 px-1.5 text-xs font-bold text-white">
              {i + 1}
            </span>
          </button>
        );
      })}
    </div>
  );
}
