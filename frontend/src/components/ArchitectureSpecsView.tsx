"use client";

import { CrosshairIcon, LayersIcon, ShieldAlertIcon } from "./Icons";

export default function ArchitectureSpecsView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-8 shadow-xl">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-sky-500/10 px-2 py-0.5 text-xs font-mono font-bold text-sky-400 ring-1 ring-sky-500/30">
              Technical Specification
            </span>
            <span className="text-xs text-slate-400">Phase 1 &amp; Phase 2 System Architecture</span>
          </div>
          <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
            Spatial Coordinate Contract &amp; Multimodal Pipeline
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-300">
            SiteSafety Copilot guarantees rigorous contract adherence between multimodal foundation models and client spatial rendering. All bounding boxes operate on normalized integer scales with zero pixel-drift.
          </p>
        </div>
      </div>

      {/* Grid of Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: 0-1000 Coordinate Contract */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-sky-500/10 p-2 text-sky-400 ring-1 ring-sky-500/30">
              <CrosshairIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Spatial Coordinate Contract</h3>
              <p className="text-[11px] text-slate-400 font-mono">box_2d: [ymin, xmin, ymax, xmax]</p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300">
            <p className="text-slate-400">{"// Contract requirements:"}</p>
            <p className="mt-1">1. Integers strictly clamped to [0, 1000]</p>
            <p>2. Constraint: ymin &lt; ymax and xmin &lt; xmax</p>
            <p>3. Frontend converts to CSS percentages via / 10</p>
            <div className="mt-3 border-t border-slate-800 pt-2 text-sky-400">
              <p>top: ymin / 10 %</p>
              <p>left: xmin / 10 %</p>
              <p>height: (ymax - ymin) / 10 %</p>
              <p>width: (xmax - xmin) / 10 %</p>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400 leading-relaxed">
            By avoiding absolute pixel dimensions, the layout scales identically across smartphones, field tablets, and 4K command centers with zero coordinate skew.
          </p>
        </div>

        {/* Card 2: Severity Weights & Formula */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-400 ring-1 ring-amber-500/30">
              <ShieldAlertIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">OSHA Severity Formula</h3>
              <p className="text-[11px] text-slate-400 font-mono">Score = min(100, sum(severity_weight))</p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs">
            <div className="grid grid-cols-3 gap-2 border-b border-slate-800 pb-2 text-[11px] font-bold text-slate-400">
              <span>Severity</span>
              <span>Points</span>
              <span>Typical Trigger</span>
            </div>
            <div className="space-y-1.5 pt-2 text-[11px]">
              <div className="grid grid-cols-3 text-rose-400">
                <span className="font-bold">CRITICAL</span>
                <span>30 - 40</span>
                <span className="text-slate-300">Fall / Trench collapse</span>
              </div>
              <div className="grid grid-cols-3 text-orange-400">
                <span className="font-bold">HIGH</span>
                <span>20 - 29</span>
                <span className="text-slate-300">Scaffold mid-rail / Ladder</span>
              </div>
              <div className="grid grid-cols-3 text-amber-300">
                <span className="font-bold">MEDIUM</span>
                <span>10 - 19</span>
                <span className="text-slate-300">PPE drop zone / GFCI</span>
              </div>
              <div className="grid grid-cols-3 text-emerald-400">
                <span className="font-bold">LOW</span>
                <span>1 - 9</span>
                <span className="text-slate-300">Housekeeping / Stacking</span>
              </div>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400 leading-relaxed">
            Band thresholds: <strong>80-100 CRITICAL</strong>, <strong>50-79 HIGH</strong>, <strong>25-49 MEDIUM</strong>, <strong>1-24 LOW</strong>, <strong>0 CLEAR</strong>.
          </p>
        </div>
      </div>

      {/* Card 3: End-to-End Multimodal Pipeline */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-md">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="rounded-xl bg-purple-500/10 p-2 text-purple-400 ring-1 ring-purple-500/30">
            <LayersIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Full Multimodal Vision &amp; Speech Pipeline</h3>
            <p className="text-[11px] text-slate-400">HackGlobal Theme 2 End-to-End Orchestration</p>
          </div>
        </div>

        {/* ASCII / Diagram Flow */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 font-mono text-xs text-slate-300 overflow-x-auto">
          <pre className="text-slate-300 text-[11px] leading-relaxed">
{`┌────────────────────────────────┐
│ Field Client (Next.js/React)   │ <── Push-to-Talk STT & Web Audio Narration
└───────────────┬────────────────┘
                │ multipart/form-data: image, audio_transcript, site_id
                ▼
┌────────────────────────────────┐
│ FastAPI Orchestrator           │ <── Deterministic Mock / Live Bedrock Mode
└───────┬────────────────┬───────┘
        │                │
        ▼                ▼
┌───────────────┐ ┌───────────────────────────┐
│ Amazon Bedrock│ │ ChromaDB RAG              │
│ Claude / Nova │ │ Title 29 CFR 1926 Chunks  │
└───────┬───────┘ └─────────────┬─────────────┘
        │                       │
        └───────────┬───────────┘
                    ▼
┌─────────────────────────────────────────────┐
│ ReportLab JHA PDF + FFmpeg Presentation Mp4 │
└─────────────────────────────────────────────┘`}
          </pre>
        </div>
      </div>
    </div>
  );
}
