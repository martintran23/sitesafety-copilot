"use client";

import { useState } from "react";
import { SpeakerIcon } from "./Icons";

interface BriefingPreset {
  id: string;
  title: string;
  sector: string;
  subpart: string;
  duration: string;
  script: string;
}

const SAMPLE_BRIEFINGS: BriefingPreset[] = [
  {
    id: "tb_01",
    title: "Tower Crane Pad B & Leading Edge Fall Protection",
    sector: "Sector 4 — High Iron Bay",
    subpart: "29 CFR 1926.501(b)(1)",
    duration: "28s",
    script:
      "Good morning, Tower Crane Pad B crew. Our primary concern is an unprotected leading edge above six feet under 1926.501(b)(1). Install a compliant guardrail or personal fall arrest system before anyone returns to that bay. Confirm the edge is protected and sign the JHA before the next lift.",
  },
  {
    id: "tb_02",
    title: "Deep Utility Trench Excavation & Shoring Safety",
    sector: "West Wall Station 12+50",
    subpart: "29 CFR 1926.652(a)(1)",
    duration: "32s",
    script:
      "Attention utility pipe crew. We have active trenching exceeding five feet depth. OSHA 1926.652 mandates an approved trench box or hydraulic shoring before entry. Keep spoil piles at least two feet back from the edge and verify ladder egress within twenty-five feet travel.",
  },
  {
    id: "tb_03",
    title: "Exterior Supported Scaffold Decking & Mid-Rail Check",
    sector: "South Facade Scaffold Run C",
    subpart: "29 CFR 1926.451(g)(4)",
    duration: "26s",
    script:
      "Morning masonry crew. Inspect all working scaffold platforms on Facade C. 1926.451 requires top rails at forty-two inches and mid-rails halfway down. Ensure all mudsills and base plates are pinned before loading pallets.",
  },
];

export default function ToolboxTalkStudio({
  activeScript,
  onLaunchInspector,
}: {
  activeScript?: string | null;
  onLaunchInspector?: () => void;
}) {
  const [selectedBriefing, setSelectedBriefing] = useState<BriefingPreset>(SAMPLE_BRIEFINGS[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  function handlePlayScript(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="space-y-6">
      {/* Hero / Studio Header */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-mono font-bold text-amber-400 ring-1 ring-amber-500/30">
                Morning Safety Studio
              </span>
              <span className="text-xs text-slate-400">Field-Practical Narration Engine</span>
            </div>
            <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
              Toolbox Talk &amp; JHA Briefing Center
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              Generate under-45-second spoken morning briefings with synchronized animated bounding box callouts. Grounded strictly in OSHA 1926 and structured for maximum crew clarity before work begins.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onLaunchInspector && (
              <button
                type="button"
                onClick={onLaunchInspector}
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-amber-400 shadow-md shadow-amber-500/20"
              >
                <span>Run Inspection</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Script Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Left: Active Script Player & Structure Guide */}
        <div className="space-y-4">
          {/* Active Spoken Script Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-md">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                  {selectedBriefing.subpart} • {selectedBriefing.sector}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{selectedBriefing.title}</h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-mono font-semibold text-slate-300">
                  Target: {selectedBriefing.duration}
                </span>
                <button
                  type="button"
                  onClick={() => handlePlayScript(selectedBriefing.script)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                    isPlaying
                      ? "bg-amber-500 text-slate-950 shadow-amber-500/30"
                      : "bg-slate-800 border border-slate-700 text-slate-200 hover:border-amber-400"
                  }`}
                >
                  <SpeakerIcon className="h-4 w-4" />
                  <span>{isPlaying ? "Pause Speech" : "Listen Spoken Audio"}</span>
                </button>
              </div>
            </div>

            {/* Simulated Audio Waveform Bar */}
            <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                <span className="font-mono text-amber-400">TTS Audio Synthesizer (Amazon Polly / Web Speech)</span>
                <span>{isPlaying ? "Speaking Script…" : "Ready"}</span>
              </div>
              <div className="flex items-end gap-1 h-10 w-full overflow-hidden">
                {Array.from({ length: 48 }).map((_, idx) => {
                  const h = isPlaying
                    ? Math.max(20, Math.round(Math.abs(Math.sin((idx * 0.5) % Math.PI)) * 80 + 15))
                    : ((idx * 7) % 25) + 10;
                  return (
                    <div
                      key={idx}
                      className={`flex-1 rounded-full transition-all duration-200 ${
                        isPlaying ? "bg-amber-400 animate-pulse" : "bg-slate-800"
                      }`}
                      style={{ height: `${h}%` }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Teleprompter Script */}
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Spoken Teleprompter Text:
              </span>
              <p className="mt-2 text-sm leading-relaxed text-slate-100 font-medium italic">
                &ldquo;{selectedBriefing.script}&rdquo;
              </p>
            </div>
          </div>

          {/* 4-Step Script Formulation Contract */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              OSHA Title 29 CFR 1926 Narration Guidelines (Master Prompt Contract)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3">
                <span className="font-bold text-amber-400">1. Greeting (1 sentence)</span>
                <p className="mt-1 text-slate-400">Address the crew and name the specific site sector or work bay.</p>
              </div>
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3">
                <span className="font-bold text-amber-400">2. Primary Concern (1-2 sentences)</span>
                <p className="mt-1 text-slate-400">State highest-severity hazard, explicit CFR cite, and why it matters now.</p>
              </div>
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3">
                <span className="font-bold text-amber-400">3. Physical Fix (1-2 sentences)</span>
                <p className="mt-1 text-slate-400">Actionable remediation: install, remove, secure, stop work, barricade.</p>
              </div>
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3">
                <span className="font-bold text-amber-400">4. Crew Sign-off (1 sentence)</span>
                <p className="mt-1 text-slate-400">Confirm edge protection and sign off on JHA sheet before next crane lift.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Briefing Library & Active Session */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Standard Briefings Library
            </h4>
            <div className="space-y-2.5">
              {SAMPLE_BRIEFINGS.map((tb) => {
                const isSelected = tb.id === selectedBriefing.id;
                return (
                  <button
                    key={tb.id}
                    type="button"
                    onClick={() => {
                      setSelectedBriefing(tb);
                      if (isPlaying) {
                        window.speechSynthesis.cancel();
                        setIsPlaying(false);
                      }
                    }}
                    className={`w-full text-left rounded-xl border p-3 transition ${
                      isSelected
                        ? "border-amber-400 bg-amber-500/10 ring-1 ring-amber-400/30"
                        : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-amber-400">{tb.subpart}</span>
                      <span className="text-slate-500 font-mono">{tb.duration}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-100 mt-1">{tb.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{tb.sector}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {activeScript && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs">
              <span className="font-bold text-emerald-400">Active Inspection Briefing Available</span>
              <p className="mt-1 text-slate-300 italic line-clamp-3">
                &ldquo;{activeScript}&rdquo;
              </p>
              <button
                type="button"
                onClick={() => handlePlayScript(activeScript)}
                className="mt-3 flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
              >
                <SpeakerIcon className="h-3.5 w-3.5" />
                <span>Play Live Inspection Audio</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
