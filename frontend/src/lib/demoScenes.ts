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
 * Citations come from official OSHA 29 CFR 1926 standards.
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
        title: "Unprotected perimeter edge",
        severity: "CRITICAL",
        severity_weight: 35,
        osha_citation: "29 CFR 1926.501(b)(1)",
        description:
          "Worker in high-vis vest stands near an unprotected floor edge with no guardrails, safety nets, or personal fall arrest system.",
        corrective_action:
          "Halt work at the perimeter. Install a standard 42-inch guardrail system or require personal fall arrest tied to a 5,000 lb anchorage.",
        box_2d: [145, 600, 760, 730],
        confidence: 0.95,
        audio_response_script:
          "Critical fall hazard at the slab edge. OSHA 1926.501 requires guardrails or tie-off above six feet. Stop work at the perimeter until protection is installed.",
      },
      {
        id: "d1_hole",
        title: "Uncovered slab penetration with rebar",
        severity: "CRITICAL",
        severity_weight: 32,
        osha_citation: "29 CFR 1926.501(b)(4)",
        description:
          "Open square concrete penetration with exposed steel rebar rods, creating an imminent fall-through and impalement hazard.",
        corrective_action:
          "Securely cover and label the floor opening with material supporting twice the intended load, and install impalement caps on all exposed rebar.",
        box_2d: [455, 247, 930, 603],
        confidence: 0.92,
        audio_response_script:
          "Imminent danger at the open floor hole. Concrete penetrations must be covered under 1926.501, and rebar capped under 1926.701. Secure a cover immediately.",
      },
      {
        id: "d1_ladder",
        title: "Ladder rails not extended 3 ft",
        severity: "HIGH",
        severity_weight: 22,
        osha_citation: "29 CFR 1926.1053(b)(1)",
        description:
          "Portable ladder resting against the concrete column has side rails ending flush at the deck instead of extending 36 inches above the landing.",
        corrective_action:
          "Extend side rails at least 3 feet above the upper landing surface and lash the top to prevent displacement during use.",
        box_2d: [65, 715, 815, 860],
        confidence: 0.89,
        audio_response_script:
          "Ladder setup violation against the pillar. Side rails must extend three feet above the landing under 1926.1053. Reposition and secure it before use.",
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
        title: "Trench excavation lacking shoring",
        severity: "CRITICAL",
        severity_weight: 38,
        osha_citation: "29 CFR 1926.652(a)(1)",
        description:
          "Worker shoveling inside a 6-foot deep trench with vertical un-sloped earthen walls without an approved trench shield or hydraulic shoring.",
        corrective_action:
          "Evacuate worker immediately. Install an engineered trench box or slope sidewalls to permissible angle before anyone re-enters.",
        box_2d: [208, 269, 970, 538],
        confidence: 0.96,
        audio_response_script:
          "Stop work immediately in the trench. A six-foot vertical cut requires cave-in protection under 1926.652. Evacuate the worker and set a trench box.",
      },
      {
        id: "d2_spoil",
        title: "Spoil pile on the excavation lip",
        severity: "HIGH",
        severity_weight: 25,
        osha_citation: "29 CFR 1926.651(j)(2)",
        description:
          "Excavated rocks, dirt, and boulders are piled directly on the trench edge with zero clearance, posing severe surcharge load and roll-in hazards.",
        corrective_action:
          "Relocate the spoil pile at least 2 feet back from the trench lip or install retaining barriers to keep material from falling into the cut.",
        box_2d: [40, 516, 540, 980],
        confidence: 0.91,
        audio_response_script:
          "Spoil pile violation on the right embankment. Excavated dirt must stay at least two feet back from the lip under 1926.651. Move the spoil back now.",
      },
      {
        id: "d2_egress",
        title: "No egress ladder within 25 ft",
        severity: "HIGH",
        severity_weight: 22,
        osha_citation: "29 CFR 1926.651(c)(2)",
        description:
          "Trench deeper than 4 feet has no ladder, ramp, or stairway provided within 25 feet of lateral travel for rapid emergency escape.",
        corrective_action:
          "Place a ladder extending 3 feet above ground surface within 25 feet of lateral travel of the worker's station.",
        box_2d: [480, 345, 865, 472],
        confidence: 0.88,
        audio_response_script:
          "No safe escape route from the excavation. Trenches over four feet deep require an egress ladder within twenty-five feet under 1926.651. Place a ladder now.",
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
        title: "Unprotected scaffold work >10 ft",
        severity: "CRITICAL",
        severity_weight: 35,
        osha_citation: "29 CFR 1926.451(g)(1)",
        description:
          "Worker performing tasks on an elevated scaffold platform more than 10 feet above ground without complete guardrails or personal fall arrest.",
        corrective_action:
          "Halt work on the upper tier until complete perimeter guardrails are installed or worker is tied off to an engineered anchorage.",
        box_2d: [140, 585, 490, 690],
        confidence: 0.93,
        audio_response_script:
          "Fall hazard on the upper scaffold platform. Scaffolds above ten feet require full guardrails or fall arrest under 1926.451. Halt work until secured.",
      },
      {
        id: "d3_rail",
        title: "Missing guardrail mid-rails",
        severity: "HIGH",
        severity_weight: 25,
        osha_citation: "29 CFR 1926.451(g)(4)",
        description:
          "Scaffold guardrail perimeter lacks intermediate mid-rails halfway between the top rail and the platform surface, leaving open fall gaps.",
        corrective_action:
          "Install mid-rails approximately halfway between the top guardrail (38-45 inches) and the walking deck along all open sides.",
        box_2d: [325, 76, 535, 592],
        confidence: 0.87,
        audio_response_script:
          "Missing mid-rails along the scaffold run. Mid-rails must be installed halfway between top rail and deck under 1926.451 before crew access.",
      },
      {
        id: "d3_plank",
        title: "Incompletely planked deck gaps",
        severity: "HIGH",
        severity_weight: 22,
        osha_citation: "29 CFR 1926.451(b)(1)",
        description:
          "Lower platform walkway has missing planks and open gaps between boards, creating serious trip and fall-through hazards.",
        corrective_action:
          "Fully plank all working levels between the uprights and guardrail supports, with no spaces between planks greater than 1 inch.",
        box_2d: [650, 152, 985, 868],
        confidence: 0.84,
        audio_response_script:
          "Gaps in the scaffold walkway. Working platforms must be fully planked under 1926.451. Lay full scaffold planks before anyone steps on the tier.",
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
