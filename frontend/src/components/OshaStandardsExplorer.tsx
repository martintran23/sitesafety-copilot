"use client";

import { useMemo, useState } from "react";
import { ShieldAlertIcon } from "./Icons";

interface StandardItem {
  subpart: string;
  subpartTitle: string;
  citation: string;
  title: string;
  requirement: string;
  typicalTriggers: string;
  severityBand: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  severityPoints: string;
  mandatoryAction: string;
  maxFines: string;
}

const OSHA_STANDARDS: StandardItem[] = [
  {
    subpart: "Subpart M",
    subpartTitle: "Fall Protection",
    citation: "29 CFR 1926.501(b)(1)",
    title: "Unprotected Sides & Leading Edges",
    requirement: "Each employee on a walking/working surface with an unprotected side or edge which is 6 feet (1.8 m) or more above a lower level shall be protected from falling by guardrail systems, safety net systems, or personal fall arrest systems.",
    typicalTriggers: "Imminent fall exposure >6 ft without railings, unbarricaded balcony decks, open perimeter framing.",
    severityBand: "CRITICAL",
    severityPoints: "30 - 40 pts",
    mandatoryAction: "Install top rail (42\" ±3\") & mid-rail, or tie off with 5,000 lb rated fall arrest.",
    maxFines: "Up to $161,323 (Willful/Repeat)",
  },
  {
    subpart: "Subpart M",
    subpartTitle: "Fall Protection",
    citation: "29 CFR 1926.502(d)",
    title: "Personal Fall Arrest Anchorages",
    requirement: "Anchorages used for attachment of personal fall arrest equipment shall be independent of any anchorage being used to support or suspend platforms and capable of supporting at least 5,000 pounds (22.2 kN) per employee attached.",
    typicalTriggers: "Anchorage tied to conduit, HVAC ductwork, or unengineered structural framing.",
    severityBand: "HIGH",
    severityPoints: "20 - 29 pts",
    mandatoryAction: "Verify engineer-certified anchor rated for 5,000 lbs per worker prior to connection.",
    maxFines: "Up to $16,131 per violation",
  },
  {
    subpart: "Subpart M",
    subpartTitle: "Fall Protection",
    citation: "29 CFR 1926.501(b)(4)",
    title: "Holes and Skylights Protection",
    requirement: "Each employee on walking/working surfaces shall be protected from falling through holes (including skylights) more than 6 feet above lower levels by personal fall arrest systems, covers, or guardrail systems erected around such holes.",
    typicalTriggers: "Uncovered floor penetrations, unfastened plywood over duct openings, fragile skylights.",
    severityBand: "CRITICAL",
    severityPoints: "30 - 40 pts",
    mandatoryAction: "Install secured cover labeled 'HOLE' or erect 42-inch guardrail perimeter.",
    maxFines: "Up to $161,323 (Willful/Repeat)",
  },
  {
    subpart: "Subpart L",
    subpartTitle: "Scaffolding",
    citation: "29 CFR 1926.451(g)(1)",
    title: "Scaffold Fall Protection >10 Feet",
    requirement: "Each employee on a scaffold more than 10 feet (3.1 m) above a lower level shall be protected from falling to that lower level by personal fall arrest or guardrail systems meeting requirements.",
    typicalTriggers: "Working on supported or suspended scaffold above 10 ft without perimeter guardrails.",
    severityBand: "CRITICAL",
    severityPoints: "30 - 40 pts",
    mandatoryAction: "Halt work until complete guardrail or engineered lifeline is attached.",
    maxFines: "Up to $161,323 (Willful/Repeat)",
  },
  {
    subpart: "Subpart L",
    subpartTitle: "Scaffolding",
    citation: "29 CFR 1926.451(g)(4)",
    title: "Scaffold Guardrail Top/Mid-rail Heights",
    requirement: "Top rails must be 38 to 45 inches high; mid-rails installed approximately halfway between top rail and platform surface.",
    typicalTriggers: "Missing scaffold mid-rails, crossbracing used inappropriately without compliant top rail.",
    severityBand: "HIGH",
    severityPoints: "20 - 29 pts",
    mandatoryAction: "Install rigid steel or timber mid-rails halfway between deck and top rail.",
    maxFines: "Up to $16,131 per violation",
  },
  {
    subpart: "Subpart L",
    subpartTitle: "Scaffolding",
    citation: "29 CFR 1926.451(c)(2)",
    title: "Scaffold Base Plates & Mudsills",
    requirement: "Supported scaffold poles, legs, posts, frames, and uprights shall bear on base plates and mud sills or other adequate firm foundation.",
    typicalTriggers: "Scaffold legs resting directly on bare soil, asphalt, or irregular concrete blocks.",
    severityBand: "HIGH",
    severityPoints: "20 - 29 pts",
    mandatoryAction: "Install 2x10 mudsills and screw jacks with pinned base plates on leveled ground.",
    maxFines: "Up to $16,131 per violation",
  },
  {
    subpart: "Subpart P",
    subpartTitle: "Excavations & Trenching",
    citation: "29 CFR 1926.652(a)(1)",
    title: "Protective Systems in Trenches >5 Feet",
    requirement: "Each employee in an excavation shall be protected from cave-ins by an adequate protective system (sloping, benching, shoring, or shield systems) unless excavation is made entirely in stable rock or less than 5 feet deep with examination by competent person.",
    typicalTriggers: "Excavation 5 ft or deeper with vertical dirt walls and crew working inside.",
    severityBand: "CRITICAL",
    severityPoints: "35 - 40 pts",
    mandatoryAction: "Evacuate trench immediately. Install hydraulic shoring or pre-engineered trench shield box.",
    maxFines: "Up to $161,323 (Willful/Repeat)",
  },
  {
    subpart: "Subpart P",
    subpartTitle: "Excavations & Trenching",
    citation: "29 CFR 1926.651(c)(2)",
    title: "Trench Egress (Ladders / Ramps)",
    requirement: "A stairway, ladder, ramp or other safe means of egress shall be located in trench excavations that are 4 feet (1.22 m) or more in depth so as to require no more than 25 feet (7.6 m) of lateral travel for employees.",
    typicalTriggers: "Trench deeper than 4 ft with no ladder or ladder spaced >25 ft away.",
    severityBand: "HIGH",
    severityPoints: "20 - 29 pts",
    mandatoryAction: "Position access ladder extending 36 inches above surface within 25 feet lateral travel.",
    maxFines: "Up to $16,131 per violation",
  },
  {
    subpart: "Subpart P",
    subpartTitle: "Excavations & Trenching",
    citation: "29 CFR 1926.651(j)(2)",
    title: "Excavation Spoil Pile Setback (2 Feet)",
    requirement: "Employees shall be protected from excavated or other materials or equipment that could pose a hazard by falling or rolling into excavations. Protection shall be provided by placing and keeping such materials or equipment at least 2 feet (0.61 m) from the edge.",
    typicalTriggers: "Dirt spoil piled directly at trench lip, or heavy excavator parked at excavation edge.",
    severityBand: "HIGH",
    severityPoints: "20 - 25 pts",
    mandatoryAction: "Reposition spoil pile at least 24 inches back from the edge with retaining barriers.",
    maxFines: "Up to $16,131 per violation",
  },
  {
    subpart: "Subpart X",
    subpartTitle: "Stairways & Ladders",
    citation: "29 CFR 1926.1053(b)(1)",
    title: "Portable Ladder 3-Foot Extension",
    requirement: "When portable ladders are used for access to an upper landing surface, the ladder side rails shall extend at least 3 feet (.9 m) above the upper landing surface to which the ladder is used to gain access.",
    typicalTriggers: "Extension ladder rails flush with or below the upper roof or mezzanine landing.",
    severityBand: "HIGH",
    severityPoints: "20 - 24 pts",
    mandatoryAction: "Extend ladder rails 36 inches past the landing and lash top rung to rigid structure.",
    maxFines: "Up to $16,131 per violation",
  },
  {
    subpart: "Subpart E & K",
    subpartTitle: "PPE & Electrical",
    citation: "29 CFR 1926.100(a)",
    title: "Head Protection (Hard Hats)",
    requirement: "Employees working in areas where there is a possible danger of head injury from impact, or from falling or flying objects, or from electrical shock and burns, shall be protected by protective helmets.",
    typicalTriggers: "Workers on ground beneath active overhead crane or scaffold framing without ANSI Z89 hard hats.",
    severityBand: "MEDIUM",
    severityPoints: "10 - 15 pts",
    mandatoryAction: "Halt task until all personnel in designated drop zone wear compliant hard hats.",
    maxFines: "Up to $16,131 per violation",
  },
  {
    subpart: "Subpart E & K",
    subpartTitle: "PPE & Electrical",
    citation: "29 CFR 1926.404(b)(1)",
    title: "GFCI Protection for Temporary Outlets",
    requirement: "Ground-fault circuit interrupters (GFCI) required on all 120-volt, single-phase, 15- and 20-ampere receptacle outlets on construction sites which are not a part of the permanent wiring of the building.",
    typicalTriggers: "Power tools connected to spider boxes or extension cords without inline GFCI modules.",
    severityBand: "MEDIUM",
    severityPoints: "12 - 18 pts",
    mandatoryAction: "Install calibrated inline GFCI breaker or test existing trip threshold before tool usage.",
    maxFines: "Up to $16,131 per violation",
  },
];

export default function OshaStandardsExplorer({ onLaunchPreset }: { onLaunchPreset?: () => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubpart, setSelectedSubpart] = useState("ALL");

  const subparts = useMemo(() => {
    const list = Array.from(new Set(OSHA_STANDARDS.map((s) => s.subpart)));
    return ["ALL", ...list];
  }, []);

  const filteredStandards = useMemo(() => {
    return OSHA_STANDARDS.filter((s) => {
      if (selectedSubpart !== "ALL" && s.subpart !== selectedSubpart) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          s.citation.toLowerCase().includes(q) ||
          s.title.toLowerCase().includes(q) ||
          s.requirement.toLowerCase().includes(q) ||
          s.mandatoryAction.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedSubpart, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-mono font-bold text-amber-400 ring-1 ring-amber-500/30">
                Title 29 CFR Part 1926
              </span>
              <span className="text-xs text-slate-400">Construction Regulatory Standard Store</span>
            </div>
            <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
              Grounded OSHA Regulatory Corpus
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              SiteSafety Copilot strictly limits computer vision detection and text-to-speech scripts to official OSHA construction standards. No speculative medical advice, no synthetic citations.
            </p>
          </div>

          {onLaunchPreset && (
            <button
              type="button"
              onClick={onLaunchPreset}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400 self-start md:self-center"
            >
              <ShieldAlertIcon className="h-4 w-4" />
              <span>Test in Inspector</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search standard, citation (e.g. '1926.501'), requirement, or action..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-amber-400 focus:outline-none"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {subparts.map((sp) => (
            <button
              key={sp}
              type="button"
              onClick={() => setSelectedSubpart(sp)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition ${
                selectedSubpart === sp
                  ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {sp === "ALL" ? "All Subparts" : sp}
            </button>
          ))}
        </div>
      </div>

      {/* Standards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStandards.map((std) => {
          const isCritical = std.severityBand === "CRITICAL";
          const isHigh = std.severityBand === "HIGH";

          return (
            <div
              key={std.citation}
              className={`rounded-2xl border p-5 transition-all duration-200 bg-slate-900/80 shadow-md ${
                isCritical
                  ? "border-rose-500/30 hover:border-rose-500/60"
                  : isHigh
                  ? "border-orange-500/30 hover:border-orange-500/60"
                  : "border-slate-800 hover:border-slate-700"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {std.citation}
                    </span>
                    <span className="rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400 font-medium">
                      {std.subpart}
                    </span>
                  </div>
                  <h3 className="mt-1 text-sm font-bold text-white">{std.title}</h3>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${
                      isCritical
                        ? "bg-rose-500/15 text-rose-300 ring-rose-500/40"
                        : isHigh
                        ? "bg-orange-500/15 text-orange-300 ring-orange-500/40"
                        : "bg-amber-500/15 text-amber-200 ring-amber-500/40"
                    }`}
                  >
                    {std.severityBand}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {std.severityPoints}
                  </span>
                </div>
              </div>

              {/* Requirement Text */}
              <p className="mt-3 text-xs leading-relaxed text-slate-300 border-l-2 border-slate-700 pl-3">
                {std.requirement}
              </p>

              {/* Physical Corrective Action */}
              <div className="mt-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs">
                <span className="font-bold text-amber-300">Mandatory Physical Fix: </span>
                <span className="text-slate-200">{std.mandatoryAction}</span>
              </div>

              {/* Footer Meta */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <span>Triggers: {std.typicalTriggers}</span>
                <span className="font-mono text-[10px] text-rose-400 shrink-0 ml-2">
                  {std.maxFines}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
