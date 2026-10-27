"""Deterministic mock inspection for Phase 1 frontend development (no AWS keys)."""

from __future__ import annotations

from app.schemas.hazard_schema import (
    Hazard,
    InspectResponse,
    Severity,
    compute_overall_risk_score,
    risk_level_from_score,
)


def _base_hazards() -> list[Hazard]:
    return [
        Hazard(
            id="hzd_001",
            title="Unprotected perimeter edge",
            severity=Severity.CRITICAL,
            severity_weight=35,
            osha_citation="29 CFR 1926.501(b)(1)",
            description=(
                "Worker in high-vis vest stands near an unprotected floor edge with no "
                "guardrails, safety nets, or personal fall arrest system."
            ),
            corrective_action=(
                "Halt work at the perimeter. Install a standard 42-inch guardrail system "
                "or require personal fall arrest tied to a 5,000 lb anchorage."
            ),
            box_2d=[145, 600, 760, 730],
            confidence=0.95,
            audio_response_script=(
                "Critical fall hazard at the slab edge. OSHA 1926.501 requires guardrails "
                "or tie-off above six feet. Stop work at the perimeter until protection is installed."
            ),
        ),
        Hazard(
            id="hzd_002",
            title="Uncovered slab penetration with rebar",
            severity=Severity.CRITICAL,
            severity_weight=32,
            osha_citation="29 CFR 1926.501(b)(4)",
            description=(
                "Open square concrete penetration with exposed steel rebar rods, creating an "
                "imminent fall-through and impalement hazard."
            ),
            corrective_action=(
                "Securely cover and label the floor opening with material supporting twice the "
                "intended load, and install impalement caps on all exposed rebar."
            ),
            box_2d=[455, 247, 930, 603],
            confidence=0.92,
            audio_response_script=(
                "Imminent danger at the open floor hole. Concrete penetrations must be covered "
                "under 1926.501, and rebar capped under 1926.701. Secure a cover immediately."
            ),
        ),
        Hazard(
            id="hzd_003",
            title="Ladder rails not extended 3 ft",
            severity=Severity.HIGH,
            severity_weight=22,
            osha_citation="29 CFR 1926.1053(b)(1)",
            description=(
                "Portable ladder resting against the concrete column has side rails ending flush "
                "at the deck instead of extending 36 inches above the landing."
            ),
            corrective_action=(
                "Extend side rails at least 3 feet above the upper landing surface and lash the "
                "top to prevent displacement during use."
            ),
            box_2d=[65, 715, 815, 860],
            confidence=0.89,
            audio_response_script=(
                "Ladder setup violation against the pillar. Side rails must extend three feet "
                "above the landing under 1926.1053. Reposition and secure it before use."
            ),
        ),
    ]


def _transcript_boosted_hazards(transcript: str) -> list[Hazard]:
    """Adapt mock set to match the specific scene identified in the foreman's voice note."""
    text = transcript.lower()

    if "trench" in text or "excavation" in text or "digging" in text:
        return [
            Hazard(
                id="hzd_004",
                title="Trench excavation lacking shoring",
                severity=Severity.CRITICAL,
                severity_weight=38,
                osha_citation="29 CFR 1926.652(a)(1)",
                description=(
                    "Worker shoveling inside a 6-foot deep trench with vertical un-sloped "
                    "earthen walls without an approved trench shield or hydraulic shoring."
                ),
                corrective_action=(
                    "Evacuate worker immediately. Install an engineered trench box or slope "
                    "sidewalls to permissible angle before anyone re-enters."
                ),
                box_2d=[208, 269, 970, 538],
                confidence=0.96,
                audio_response_script=(
                    "Stop work immediately in the trench. A six-foot vertical cut requires cave-in "
                    "protection under 1926.652. Evacuate the worker and set a trench box."
                ),
            ),
            Hazard(
                id="hzd_005",
                title="Spoil pile on the excavation lip",
                severity=Severity.HIGH,
                severity_weight=25,
                osha_citation="29 CFR 1926.651(j)(2)",
                description=(
                    "Excavated rocks, dirt, and boulders are piled directly on the trench edge "
                    "with zero clearance, posing severe surcharge load and roll-in hazards."
                ),
                corrective_action=(
                    "Relocate the spoil pile at least 2 feet back from the trench lip or install "
                    "retaining barriers to keep material from falling into the cut."
                ),
                box_2d=[40, 516, 540, 980],
                confidence=0.91,
                audio_response_script=(
                    "Spoil pile violation on the right embankment. Excavated dirt must stay at least "
                    "two feet back from the lip under 1926.651. Move the spoil back now."
                ),
            ),
            Hazard(
                id="hzd_006",
                title="No egress ladder within 25 ft",
                severity=Severity.HIGH,
                severity_weight=22,
                osha_citation="29 CFR 1926.651(c)(2)",
                description=(
                    "Trench deeper than 4 feet has no ladder, ramp, or stairway provided within "
                    "25 feet of lateral travel for rapid emergency escape."
                ),
                corrective_action=(
                    "Place a ladder extending 3 feet above ground surface within 25 feet of lateral "
                    "travel of the worker's station."
                ),
                box_2d=[480, 345, 865, 472],
                confidence=0.88,
                audio_response_script=(
                    "No safe escape route from the excavation. Trenches over four feet deep require "
                    "an egress ladder within twenty-five feet under 1926.651. Place a ladder now."
                ),
            ),
        ]

    if "scaffold" in text or "facade" in text:
        return [
            Hazard(
                id="hzd_007",
                title="Unprotected scaffold work >10 ft",
                severity=Severity.CRITICAL,
                severity_weight=35,
                osha_citation="29 CFR 1926.451(g)(1)",
                description=(
                    "Worker performing tasks on an elevated scaffold platform more than 10 feet "
                    "above ground without complete guardrails or personal fall arrest."
                ),
                corrective_action=(
                    "Halt work on the upper tier until complete perimeter guardrails are installed "
                    "or worker is tied off to an engineered anchorage."
                ),
                box_2d=[140, 585, 490, 690],
                confidence=0.93,
                audio_response_script=(
                    "Fall hazard on the upper scaffold platform. Scaffolds above ten feet require "
                    "full guardrails or fall arrest under 1926.451. Halt work until secured."
                ),
            ),
            Hazard(
                id="hzd_008",
                title="Missing guardrail mid-rails",
                severity=Severity.HIGH,
                severity_weight=25,
                osha_citation="29 CFR 1926.451(g)(4)",
                description=(
                    "Scaffold guardrail perimeter lacks intermediate mid-rails halfway between "
                    "the top rail and the platform surface, leaving open fall gaps."
                ),
                corrective_action=(
                    "Install mid-rails approximately halfway between the top guardrail (38-45 inches) "
                    "and the walking deck along all open sides."
                ),
                box_2d=[325, 76, 535, 592],
                confidence=0.87,
                audio_response_script=(
                    "Missing mid-rails along the scaffold run. Mid-rails must be installed halfway "
                    "between top rail and deck under 1926.451 before crew access."
                ),
            ),
            Hazard(
                id="hzd_009",
                title="Incompletely planked deck gaps",
                severity=Severity.HIGH,
                severity_weight=22,
                osha_citation="29 CFR 1926.451(b)(1)",
                description=(
                    "Lower platform walkway has missing planks and open gaps between boards, "
                    "creating serious trip and fall-through hazards."
                ),
                corrective_action=(
                    "Fully plank all working levels between the uprights and guardrail supports, "
                    "with no spaces between planks greater than 1 inch."
                ),
                box_2d=[650, 152, 985, 868],
                confidence=0.84,
                audio_response_script=(
                    "Gaps in the scaffold walkway. Working platforms must be fully planked under "
                    "1926.451. Lay full scaffold planks before anyone steps on the tier."
                ),
            ),
        ]

    return _base_hazards()


def run_mock_inspection(
    *,
    audio_transcript: str | None = None,
    site_id: str | None = None,
) -> InspectResponse:
    transcript = (audio_transcript or "").strip()
    hazards = (
        _transcript_boosted_hazards(transcript) if transcript else _base_hazards()
    )
    hazards = sorted(hazards, key=lambda h: h.severity_weight, reverse=True)

    score = compute_overall_risk_score(hazards)
    level = risk_level_from_score(score)
    spoken_score = _score_to_words(score)
    aggregate_script = (
        f"Inspection complete. Overall risk score is {spoken_score}, "
        f"{level.value.lower()}. "
        f"Address the {hazards[0].title.lower()} before resuming work."
        if hazards
        else "Inspection complete. No hazards detected. Risk score is zero, clear."
    )

    return InspectResponse(
        overall_risk_score=score,
        risk_level=level,
        hazards=hazards,
        audio_response_script=aggregate_script,
        mode="mock",
        site_id=site_id,
        foreman_transcript_used=bool(transcript),
    )


def _score_to_words(score: int) -> str:
    """Simple TTS-friendly number phrasing for demo scripts."""
    ones = [
        "zero",
        "one",
        "two",
        "three",
        "four",
        "five",
        "six",
        "seven",
        "eight",
        "nine",
    ]
    teens = [
        "ten",
        "eleven",
        "twelve",
        "thirteen",
        "fourteen",
        "fifteen",
        "sixteen",
        "seventeen",
        "eighteen",
        "nineteen",
    ]
    tens = [
        "",
        "",
        "twenty",
        "thirty",
        "forty",
        "fifty",
        "sixty",
        "seventy",
        "eighty",
        "ninety",
    ]
    if score < 10:
        return ones[score]
    if score < 20:
        return teens[score - 10]
    if score == 100:
        return "one hundred"
    t, o = divmod(score, 10)
    if o == 0:
        return tens[t]
    return f"{tens[t]}-{ones[o]}"
