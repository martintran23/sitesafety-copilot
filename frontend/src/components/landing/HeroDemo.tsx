"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { box2dToStyle } from "@/lib/box";
import { DEMO_SCENES } from "@/lib/demoScenes";
import { riskColor, riskLevelFromScore, SEVERITY_STYLES } from "@/lib/severity";

/** One tick = 900ms. A scene lasts CYCLE ticks: scan, reveal 3 hazards, hold. */
const TICK_MS = 900;
const CYCLE = 13;
const REVEAL_START = 2;
const REVEAL_EVERY = 2;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function HeroDemo() {
  const [reduced] = useState(prefersReducedMotion);
  // Reduced motion: freeze on a fully annotated first scene.
  const [tick, setTick] = useState(reduced ? CYCLE - 1 : 0);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, [reduced]);

  const sceneIndex = Math.floor(tick / CYCLE) % DEMO_SCENES.length;
  const phase = tick % CYCLE;
  const scene = DEMO_SCENES[sceneIndex];

  const revealed =
    phase < REVEAL_START
      ? 0
      : Math.min(scene.hazards.length, Math.floor((phase - REVEAL_START) / REVEAL_EVERY) + 1);
  const shown = scene.hazards.slice(0, revealed);
  const score = Math.min(
    100,
    shown.reduce((s, h) => s + h.severity_weight, 0),
  );
  const level = riskLevelFromScore(score);
  const scanning = phase < REVEAL_START;

  return (
    <section className="relative isolate overflow-hidden border-b border-slate-800">
      {/* Ambient background: the same photo, pushed back */}
      <div className="absolute inset-0 -z-10" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={scene.id}
          src={scene.image}
          alt=""
          className="animate-kenburns h-full w-full object-cover opacity-30 blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1020] via-[#0b1020]/85 to-[#0b1020]/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1020] via-transparent to-[#0b1020]/70" />
        <div className="bg-blueprint absolute inset-0 opacity-60" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.25fr)] lg:pb-28 lg:pt-20">
        {/* Copy */}
        <div className="animate-rise">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-400">
            OSHA 29 CFR 1926 &middot; Construction
          </p>
          <h1 className="mt-5 text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-[3.1rem]">
            Point a camera at the site.
            <span className="block text-amber-400">Get the citation back.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-slate-300">
            SiteSafety Copilot reads a jobsite photo and a foreman&apos;s voice note, boxes every
            violation, cites the exact OSHA paragraph, and says what to fix, out loud, before the
            crew starts work.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/app"
              className="group inline-flex items-center gap-2 rounded-md bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300 active:scale-[0.97]"
            >
              Open the inspector
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                &rarr;
              </span>
            </Link>
            <a
              href="#how"
              className="rounded-md border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-white/5"
            >
              See how it works
            </a>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-slate-700/70 pt-6">
            {[
              ["< 45s", "spoken briefing"],
              ["0–1000", "box contract"],
              ["6", "OSHA subparts"],
            ].map(([k, v]) => (
              <div key={v}>
                <dt className="font-mono text-xl font-bold text-white">{k}</dt>
                <dd className="mt-1 text-[11px] uppercase tracking-wider text-slate-400">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Analysis frame */}
        <div className="animate-rise [animation-delay:120ms]">
          <div className="overflow-hidden rounded-lg border border-slate-600/60 bg-slate-950 shadow-2xl shadow-black/60 ring-1 ring-amber-400/10">
            {/* HUD bar */}
            <div className="flex items-center justify-between border-b border-slate-700/70 bg-slate-900/90 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-2">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${scanning ? "animate-pulse bg-amber-400" : "bg-emerald-400"}`}
                />
                {scanning ? "Analyzing frame" : "Analysis complete"}
              </span>
              <span className="hidden sm:inline">{scene.site}</span>
              <span>mock engine</span>
            </div>

            {/* Image + overlays. Boxes use percent math (box_2d / 10). */}
            <div className="relative aspect-[1376/768] w-full bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={scene.id}
                src={scene.image}
                alt={`${scene.label} jobsite photo being analyzed for OSHA hazards`}
                className="absolute inset-0 h-full w-full object-cover"
              />
              {scanning && (
                <div
                  key={`scan-${tick}`}
                  className="animate-scan pointer-events-none absolute inset-x-0 z-20 h-px bg-amber-300 shadow-[0_0_18px_4px_rgba(245,165,36,0.55)]"
                />
              )}
              {shown.map((h, i) => (
                <div
                  key={h.id}
                  style={box2dToStyle(h.box_2d)}
                  className={`animate-box-in absolute border-2 ${SEVERITY_STYLES[h.severity].box}`}
                >
                  <span className="absolute -left-0.5 -top-6 flex items-center gap-1.5 whitespace-nowrap bg-slate-950/90 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white">
                    <span className="text-amber-400">{i + 1}</span>
                    {h.osha_citation.replace("29 CFR ", "")}
                  </span>
                </div>
              ))}

              {/* Score readout */}
              <div className="absolute bottom-3 right-3 z-10 rounded-md border border-slate-600/60 bg-slate-950/85 px-3 py-2 text-right backdrop-blur">
                <p className="font-mono text-[9px] uppercase tracking-widest text-slate-400">
                  Risk score
                </p>
                <p className={`font-mono text-2xl font-bold tabular-nums leading-none ${riskColor(level)}`}>
                  {score}
                  <span className="ml-1 text-[10px] font-semibold">{score ? level : "—"}</span>
                </p>
              </div>
            </div>

            {/* Findings feed */}
            <ul className="min-h-[7.5rem] divide-y divide-slate-800 border-t border-slate-700/70 bg-slate-900/90">
              {shown.length === 0 && (
                <li className="px-4 py-3 font-mono text-[11px] text-slate-500">
                  Reading frame&hellip;
                </li>
              )}
              {shown.map((h) => (
                <li
                  key={h.id}
                  className="animate-chip-in flex items-center justify-between gap-3 px-4 py-2"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${SEVERITY_STYLES[h.severity].dot}`} />
                    <span className="truncate text-xs font-semibold text-slate-100">{h.title}</span>
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-slate-400">
                    +{h.severity_weight} &middot; {h.severity}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Scene switcher */}
          <div className="mt-3 flex gap-2">
            {DEMO_SCENES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setTick(i * CYCLE)}
                aria-label={`Show ${s.label} demo`}
                className="group flex-1 text-left"
              >
                <span className="block h-0.5 w-full overflow-hidden rounded bg-slate-700">
                  <span
                    className={`block h-full bg-amber-400 transition-all duration-700 ${
                      i === sceneIndex ? "w-full" : "w-0"
                    }`}
                  />
                </span>
                <span
                  className={`mt-1.5 block font-mono text-[10px] uppercase tracking-wider transition-colors ${
                    i === sceneIndex ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300"
                  }`}
                >
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
