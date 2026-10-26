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
            title="Unprotected leading edge",
            severity=Severity.CRITICAL,
            severity_weight=35,
            osha_citation="29 CFR 1926.501(b)(1)",
            description=(
                "Worker exposed at unprotected side/edge greater than 6 feet "
                "above a lower level."
            ),
            corrective_action=(
                "Install a guardrail system or personal fall arrest before "
                "continuing work."
            ),
            box_2d=[120, 340, 680, 810],
            confidence=0.92,
            audio_response_script=(
                "Critical fall hazard at the leading edge. "
                "OSHA 1926.501 requires fall protection above six feet. "
                "Install a guardrail or personal fall arrest system immediately."
            ),
        ),
        Hazard(
            id="hzd_002",
            title="Portable ladder not extended above landing",
            severity=Severity.HIGH,
            severity_weight=24,
            osha_citation="29 CFR 1926.1053(b)(1)",
            description=(
                "Access ladder does not extend at least 3 feet (36 inches) "
                "above the upper landing surface."
            ),
            corrective_action=(
                "Reposition or replace the ladder so side rails extend 36 inches "
                "above the landing and secure it against displacement."
            ),
            box_2d=[450, 80, 920, 280],
            confidence=0.88,
            audio_response_script=(
                "High severity ladder hazard. "
                "1926.1053 requires three feet of extension above the landing. "
                "Extend and secure the ladder before the next climb."
            ),
        ),
        Hazard(
            id="hzd_003",
            title="Missing hard hat in active work zone",
            severity=Severity.MEDIUM,
            severity_weight=14,
            osha_citation="29 CFR 1926.100(a)",
            description=(
                "Personnel observed in an area with potential head injury from "
                "impact or falling objects without hard hats."
            ),
            corrective_action=(
                "Stop work in the zone until all crew members don compliant "
                "hard hats."
            ),
            box_2d=[200, 520, 420, 700],
            confidence=0.81,
            audio_response_script=(
                "Medium PPE finding under 1926.100. "
                "Hard hats are required where head injury is possible. "
                "Issue helmets and resume only when the crew is protected."
            ),
        ),
    ]


def _transcript_boosted_hazards(transcript: str) -> list[Hazard]:
    """Lightly adapt mock set when the foreman mentions common keywords."""
    hazards = _base_hazards()
    text = transcript.lower()

    if "trench" in text or "excavation" in text:
        hazards.append(
            Hazard(
                id="hzd_004",
                title="Trench lacking protective system",
                severity=Severity.CRITICAL,
                severity_weight=38,
                osha_citation="29 CFR 1926.652(a)(1)",
                description=(
                    "Transcript and scene context indicate a trench about 5 feet "
                    "or deeper without an adequate protective system."
                ),
                corrective_action=(
                    "Evacuate the trench and install sloping, shoring, or a "
                    "trench box before re-entry."
                ),
                box_2d=[500, 200, 900, 750],
                confidence=0.75,
                audio_response_script=(
                    "Critical excavation hazard. "
                    "1926.652 requires a protective system at five feet or deeper. "
                    "Evacuate and protect the trench before anyone re-enters."
                ),
            )
        )

    if "scaffold" in text:
        hazards.append(
            Hazard(
                id="hzd_005",
                title="Scaffold mid-rail missing",
                severity=Severity.HIGH,
                severity_weight=26,
                osha_citation="29 CFR 1926.451(g)(4)",
                description=(
                    "Scaffold guardrail system appears incomplete; mid-rail not "
                    "present between top rail and platform."
                ),
                corrective_action=(
                    "Install mid-rails approximately halfway between the top rail "
                    "and platform before allowing work on the scaffold."
                ),
                box_2d=[80, 100, 350, 600],
                confidence=0.79,
                audio_response_script=(
                    "High scaffold guardrail finding. "
                    "1926.451 requires top rails and mid-rails. "
                    "Install the missing mid-rail before crews climb."
                ),
            )
        )

    return hazards


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
