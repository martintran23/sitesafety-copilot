import Link from "next/link";
import { HardHatIcon } from "../Icons";

export function TrustStrip() {
  const subparts = [
    ["M", "Fall protection"],
    ["L", "Scaffolds"],
    ["P", "Excavations"],
    ["X", "Ladders"],
    ["E", "PPE"],
    ["K", "Electrical"],
  ];
  return (
    <div className="border-b border-slate-800 bg-slate-950">
      <div className="h-2 bg-hazard-stripe" aria-hidden />
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-5 py-5 sm:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
          Grounded only in
        </p>
        {subparts.map(([k, v]) => (
          <p key={k} className="text-sm text-slate-300">
            <span className="mr-2 font-mono font-bold text-amber-400">Subpart {k}</span>
            <span className="text-slate-500">{v}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

export function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Capture",
      body: "Take a photo from the deck, or pull a frame from a walkthrough. Hold the mic and say what you see: “leading edge looks open on three.” The voice note rides along as context.",
      meta: "image + audio_transcript",
    },
    {
      n: "02",
      title: "Analyze",
      body: "Every violation gets a box on a 0 to 1000 grid, an exact 29 CFR 1926 paragraph, a severity, and a physical fix. Points add up to a single site risk score.",
      meta: "box_2d · osha_citation · severity_weight",
    },
    {
      n: "03",
      title: "Brief the crew",
      body: "The assistant reads each finding aloud in three sentences or fewer. Then export the daily JHA and a toolbox-talk presentation that runs under 45 seconds.",
      meta: "audio_response_script · JHA · .mp4",
    },
  ];
  return (
    <section id="how" className="bg-blueprint scroll-mt-20 border-b border-slate-800">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-400">
          How it works
        </p>
        <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
          From a photo to a signed-off morning briefing.
        </h2>

        <ol className="mt-14 border-t border-slate-700">
          {steps.map((s) => (
            <li
              key={s.n}
              className="grid gap-4 border-b border-slate-700 py-8 md:grid-cols-[120px_220px_minmax(0,1fr)_240px] md:items-baseline md:gap-8"
            >
              <span className="font-mono text-4xl font-black text-slate-700">{s.n}</span>
              <h3 className="text-xl font-bold text-white">{s.title}</h3>
              <p className="max-w-xl text-sm leading-relaxed text-slate-400">{s.body}</p>
              <p className="font-mono text-[11px] text-amber-400/80 md:text-right">{s.meta}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Features() {
  const rows = [
    [
      "Boxes that stay put",
      "Coordinates are normalized integers, never pixels, so a box lands on the same hazard on a phone, a tablet, or a trailer monitor.",
    ],
    [
      "Voice in, voice out",
      "Dictate observations with push-to-talk. Hear each finding back, or run an audio tour that highlights the matching box as it speaks.",
    ],
    [
      "A score that moves with the work",
      "Mark a hazard Stop Work or Corrected and the site score drops in real time, with the points mitigated shown.",
    ],
    [
      "Audit-ready JHA",
      "A daily Job Hazard Analysis with a PPE check, hazard matrix, status per item, and signature blocks for the superintendent and crew lead.",
    ],
    [
      "Toolbox talk in 45 seconds",
      "Greeting, primary concern, physical fix, sign-off. The narration is written for the ear and capped so the crew actually listens.",
    ],
    [
      "No invented citations",
      "The model is held to the paragraphs in the OSHA 1926 corpus. If it is not sure, it drops the finding rather than guess a number.",
    ],
  ];
  return (
    <section id="features" className="scroll-mt-20 border-b border-slate-800 bg-[#0b1020]">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] lg:py-28">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-400">
            What it does
          </p>
          <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
            Built for the person walking the deck, not the person reading the report.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            The Phase 1 demo runs on a deterministic mock engine. Live Bedrock vision, Polly voices
            and FFmpeg export are the Phase 2 build.
          </p>
        </div>

        <dl className="border-t border-slate-700">
          {rows.map(([title, body]) => (
            <div
              key={title}
              className="grid gap-2 border-b border-slate-700 py-6 sm:grid-cols-[240px_minmax(0,1fr)] sm:gap-8"
            >
              <dt className="text-base font-bold text-white">{title}</dt>
              <dd className="text-sm leading-relaxed text-slate-400">{body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function StandardsTeaser() {
  const rows = [
    ["1926.501(b)(1)", "Unprotected sides and edges 6 ft or higher need fall protection.", "CRITICAL"],
    ["1926.652(a)(1)", "Trenches 5 ft or deeper need a protective system.", "CRITICAL"],
    ["1926.451(g)(4)", "Scaffold top rails 38–45 in, mid-rails halfway down.", "HIGH"],
    ["1926.1053(b)(1)", "Ladders extend 3 ft above the upper landing.", "HIGH"],
    ["1926.100(a)", "Hard hats where head injury is possible.", "MEDIUM"],
  ];
  const tone: Record<string, string> = {
    CRITICAL: "text-red-400",
    HIGH: "text-orange-400",
    MEDIUM: "text-amber-300",
  };
  return (
    <section id="standards" className="scroll-mt-20 border-b border-slate-800 bg-[#0d1326]">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-400">
              The rulebook
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
              Cited to the paragraph.
            </h2>
          </div>
          <Link
            href="/app"
            className="text-sm font-semibold text-amber-400 underline-offset-4 hover:underline"
          >
            Browse the full standards store &rarr;
          </Link>
        </div>

        <div className="mt-10 overflow-x-auto rounded-md border border-slate-700">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-950 font-mono text-[10px] uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Citation</th>
                <th className="px-5 py-3 font-medium">Requirement</th>
                <th className="px-5 py-3 text-right font-medium">Typical severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rows.map(([cite, req, sev]) => (
                <tr key={cite} className="transition hover:bg-white/[0.03]">
                  <td className="whitespace-nowrap px-5 py-4 font-mono text-xs font-bold text-amber-400">
                    29 CFR {cite}
                  </td>
                  <td className="px-5 py-4 text-slate-300">{req}</td>
                  <td className={`px-5 py-4 text-right font-mono text-xs font-bold ${tone[sev]}`}>
                    {sev}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="bg-[#0b1020]">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="overflow-hidden rounded-lg border border-amber-400/30">
          <div className="h-2 bg-hazard-stripe" aria-hidden />
          <div className="flex flex-col items-start justify-between gap-8 bg-slate-950 px-6 py-12 sm:px-12 md:flex-row md:items-center">
            <div className="max-w-xl">
              <h2 className="text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
                Walk the site before the crew does.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Load a preset scene or upload your own photo. No account needed.
              </p>
            </div>
            <Link
              href="/app"
              className="shrink-0 rounded-md bg-amber-400 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-amber-300 active:scale-[0.97]"
            >
              Open the inspector &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 text-xs text-slate-500 sm:px-8 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-2.5 text-slate-300">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-amber-400 text-slate-950">
            <HardHatIcon className="h-4 w-4" />
          </span>
          <span className="font-bold">SiteSafety Copilot</span>
        </div>
        <p className="max-w-2xl leading-relaxed">
          Grounded in OSHA Title 29 CFR Part 1926. SiteSafety Copilot is an assistive tool for
          superintendents and safety officers. It does not replace an OSHA compliance officer or a
          licensed Professional Engineer. Demo scene photos are AI-generated. Built for HackGlobal
          Theme 2.
        </p>
      </div>
    </footer>
  );
}
