"use client";

import { useState } from "react";
import HazardSidebar from "../HazardSidebar";
import InspectionCanvas from "../InspectionCanvas";
import { DEMO_SCENES, sceneScore } from "@/lib/demoScenes";
import { riskColor, riskLevelFromScore } from "@/lib/severity";

/** Static, interactive version of the product: the real canvas + sidebar. */
export default function InteractiveDemo() {
  const [sceneId, setSceneId] = useState(DEMO_SCENES[0].id);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const scene = DEMO_SCENES.find((s) => s.id === sceneId) ?? DEMO_SCENES[0];
  const score = sceneScore(scene.hazards);
  const level = riskLevelFromScore(score);

  function pickScene(id: string) {
    setSceneId(id);
    setSelectedId(null);
    setHoveredId(null);
  }

  return (
    <section id="demo" className="scroll-mt-20 border-b border-slate-800 bg-[#0d1326]">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-400">
              Try it
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
              Click a box. Read the rule.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Three real-looking scenes, annotated the way the engine annotates them. Select a
              violation to see the citation, the fix, and the points it adds to the score.
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-md border border-slate-700 bg-slate-950 p-1">
            {DEMO_SCENES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => pickScene(s.id)}
                className={`rounded px-3 py-1.5 text-xs font-semibold transition ${
                  s.id === sceneId
                    ? "bg-amber-400 text-slate-950"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div>
            <InspectionCanvas
              imageUrl={scene.image}
              hazards={scene.hazards}
              selectedId={selectedId}
              onSelect={setSelectedId}
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
            <div className="mt-3 flex items-center justify-between font-mono text-[11px] text-slate-500">
              <span>{scene.site}</span>
              <span>
                Score{" "}
                <span className={`font-bold ${riskColor(level)}`}>
                  {score} {level}
                </span>
              </span>
            </div>
          </div>

          <HazardSidebar
            key={scene.id}
            hazards={scene.hazards}
            selectedId={selectedId}
            onSelect={setSelectedId}
            hoveredId={hoveredId}
            onHover={setHoveredId}
          />
        </div>
      </div>
    </section>
  );
}
