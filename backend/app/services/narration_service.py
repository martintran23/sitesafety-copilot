"""Build concise toolbox-talk narration from an inspection response."""

from __future__ import annotations

from app.schemas.hazard_schema import Hazard


def _sentence(text: str) -> str:
    stripped = text.strip()
    if not stripped:
        return ""
    return stripped if stripped[-1] in ".!?" else f"{stripped}."


def build_presentation_script(site_name: str, hazards: list[Hazard]) -> str:
    if not hazards:
        return f"Good morning, {site_name} crew. The inspection found no grounded OSHA hazards. Confirm conditions remain controlled before the next lift."
    ordered = sorted(hazards, key=lambda h: h.severity_weight, reverse=True)
    primary = ordered[0]
    parts = [
        f"Good morning, {site_name} crew.",
        f"Our primary concern is {primary.title} under {primary.osha_citation}.",
        f"{_sentence(primary.corrective_action)} Stop work in the affected area until the correction is verified.",
    ]
    for hazard in ordered[1:3]:
        parts.append(f"Also address {hazard.title} under {hazard.osha_citation}: {_sentence(hazard.corrective_action)}")
    if len(ordered) > 3:
        parts.append("Additional findings are detailed in the JHA PDF.")
    parts.append("Confirm the controls and sign the JHA before the next lift.")
    return " ".join(parts)
