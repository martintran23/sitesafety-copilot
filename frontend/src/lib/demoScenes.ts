import type { Hazard } from "./types.ts";

export interface DemoScene {
  id: string;
  label: string;
  site: string;
  image: string;
  hazards: Hazard[];
}

/**
 * Hand-annotated demo scenes for the landing page. Boxes follow the same
 * contract as the API: [ymin, xmin, ymax, xmax], integers 0-1000.
 * Citations come from MASTER_PROMPT_CONTEXT.md only.
 */
export const DEMO_SCENES: DemoScene[] = [
  {
    id: "leading-edge",
    label: "Upper deck",
    site: "Tower B, Level 7",
    image: "/demo/leading-edge.jpg",
    hazards: [
      {
        id: "d1_edge",
        title: "Unprotected leading edge",
        severity: "CRITICAL",
        severity_weight: 35,
        osha_citation: "29 CFR 1926.501(b)(1)",
        description:
          "Worker walking an unprotected slab edge well above 6 feet with no guardrail, net or arrest system.",
        corrective_action:
          "Stop work at the edge. Install a guardrail system or tie off to a 5,000 lb anchorage.",
        box_2d: [230, 560, 560, 880],
        confidence: 0.94,
        audio_response_script:
          "Critical fall hazard at the leading edge. Fall protection is required above six feet under 1926.501. Install a guardrail or tie off before anyone returns.",
      },
      {
        id: "d1_hole",
        title: "Uncovered floor openings",
        severity: "CRITICAL",
        severity_weight: 30,
        osha_citation: "29 CFR 1926.501(b)(4)",
        description:
          "Open slab penetrations and rebar mat with no covers or perimeter protection.",
        corrective_action:
          "Cover and secure each opening, or erect a guardrail around the penetration.",
        box_2d: [490, 0, 840, 465],
        confidence: 0.87,
        audio_response_script:
          "Open floor holes on the deck. Cover or guard every opening under 1926.501. Secure the covers before the next pour.",
      },
      {
        id: "d1_ladder",
        title: "Ladder not extended above landing",
        severity: "HIGH",
        severity_weight: 24,
        osha_citation: "29 CFR 1926.1053(b)(1)",
        description:
          "Portable ladder ends at the deck surface instead of extending 3 feet above it.",
        corrective_action:
          "Reposition the ladder so the side rails extend 36 inches above the landing and secure it.",
        box_2d: [436, 500, 1000, 625],
        confidence: 0.9,
        audio_response_script:
          "Ladder is too short for the landing. Rails must extend three feet above the deck under 1926.1053. Extend and lash it before anyone climbs.",
      },
    ],
  },
  {
    id: "trench",
    label: "Utility trench",
    site: "Station 12+50, west run",
    image: "/demo/trench.jpg",
    hazards: [
      {
        id: "d2_trench",
        title: "Trench with no protective system",
        severity: "CRITICAL",
        severity_weight: 38,
        osha_citation: "29 CFR 1926.652(a)(1)",
        description:
          "Crew working in a trench about 6 feet deep with vertical walls and no sloping, shoring or shield.",
        corrective_action:
          "Evacuate the trench. Install a trench box or shoring before anyone re-enters.",
        box_2d: [260, 275, 1000, 510],
        confidence: 0.93,
        audio_response_script:
          "Critical cave-in hazard. Trenches five feet or deeper need a protective system under 1926.652. Get everyone out and set the trench box.",
      },
      {
        id: "d2_spoil",
        title: "Spoil pile at the trench edge",
        severity: "HIGH",
        severity_weight: 25,
        osha_citation: "29 CFR 1926.651(j)(2)",
        description:
          "Excavated material is stacked against the lip, adding load and a rolling hazard.",
        corrective_action:
          "Move the spoil at least 2 feet back from the edge or install retaining barriers.",
        box_2d: [40, 465, 650, 1000],
        confidence: 0.86,
        audio_response_script:
          "Spoil pile is on the trench lip. Keep it two feet back under 1926.651. Move it before work continues.",
      },
      {
        id: "d2_egress",
        title: "No means of egress",
        severity: "HIGH",
        severity_weight: 22,
        osha_citation: "29 CFR 1926.651(c)(2)",
        description:
          "No ladder, stairway or ramp within 25 feet of lateral travel for workers in the trench.",
        corrective_action:
          "Place a ladder extending 3 feet above grade within 25 feet of every worker.",
        box_2d: [480, 337, 850, 472],
        confidence: 0.82,
        audio_response_script:
          "No way out of the trench. Egress is required within twenty-five feet under 1926.651. Place a ladder now.",
      },
    ],
  },
  {
    id: "scaffold",
    label: "Facade scaffold",
    site: "South elevation, Run C",
    image: "/demo/scaffold.jpg",
    hazards: [
      {
        id: "d3_fall",
        title: "Scaffold work above 10 ft",
        severity: "CRITICAL",
        severity_weight: 32,
        osha_citation: "29 CFR 1926.451(g)(1)",
        description:
          "Crew stacking block on an upper platform without a complete fall protection system.",
        corrective_action:
          "Halt work on the platform until guardrails or personal fall arrest are complete.",
        box_2d: [235, 420, 510, 800],
        confidence: 0.88,
        audio_response_script:
          "Fall protection gap on the upper platform. Scaffolds above ten feet need guardrails or arrest under 1926.451. Complete it before loading block.",
      },
      {
        id: "d3_rail",
        title: "Mid-rail missing",
        severity: "HIGH",
        severity_weight: 26,
        osha_citation: "29 CFR 1926.451(g)(4)",
        description:
          "Guardrail run is incomplete; no mid-rail halfway between top rail and platform.",
        corrective_action:
          "Install mid-rails halfway between the top rail and the platform before work resumes.",
        box_2d: [390, 170, 640, 700],
        confidence: 0.8,
        audio_response_script:
          "Mid-rail is missing on the guardrail. Install it halfway between top rail and deck under 1926.451. Then clear the platform for use.",
      },
      {
        id: "d3_plank",
        title: "Incomplete platform decking",
        severity: "HIGH",
        severity_weight: 22,
        osha_citation: "29 CFR 1926.451(b)(1)",
        description:
          "Lower platform has gaps between planks, creating a fall-through and trip hazard.",
        corrective_action:
          "Fully plank the platform and close the gaps before anyone walks it.",
        box_2d: [755, 150, 900, 930],
        confidence: 0.78,
        audio_response_script:
          "Gaps in the scaffold decking. Platforms must be fully planked under 1926.451. Close the gaps before use.",
      },
    ],
  },
];

export function sceneScore(hazards: Hazard[]): number {
  return Math.min(
    100,
    hazards.reduce((sum, h) => sum + h.severity_weight, 0),
  );
}
