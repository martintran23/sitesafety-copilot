"""Build concise toolbox-talk narration from an inspection response."""

from __future__ import annotations

from app.schemas.hazard_schema import Hazard


def build_presentation_script(site_name: str, hazards: list[Hazard]) -> str:
    if not hazards:
        return f"Good morning, {site_name} crew. The inspection found no grounded OSHA hazards. Confirm conditions remain controlled before the next lift."
    primary = hazards[0]
    parts = [
        f"Good morning, {site_name} crew.",
        f"Our primary concern is {primary.title} under {primary.osha_citation}.",
        f"{primary.corrective_action} Stop work in the affected area until the correction is verified.",
    ]
    for hazard in hazards[1:3]:
        parts.append(f"Also address {hazard.title} under {hazard.osha_citation}: {hazard.corrective_action}")
    parts.append("Confirm the controls and sign the JHA before the next lift.")
    return " ".join(parts)
