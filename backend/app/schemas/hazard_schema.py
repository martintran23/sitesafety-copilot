"""Pydantic v2 contracts for hazard inspection (Phase 1 + Phase 2)."""

from __future__ import annotations

from enum import Enum
from typing import Annotated, Literal

from pydantic import BaseModel, Field, field_validator, model_validator


class Severity(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class RiskLevel(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    CLEAR = "CLEAR"


InspectMode = Literal["mock", "live"]

# Normalized [ymin, xmin, ymax, xmax] on integer scale 0..1000
Box2D = Annotated[
    list[int],
    Field(min_length=4, max_length=4, description="[ymin, xmin, ymax, xmax] 0-1000"),
]

SEVERITY_WEIGHT_RANGES: dict[Severity, tuple[int, int]] = {
    Severity.CRITICAL: (30, 40),
    Severity.HIGH: (20, 29),
    Severity.MEDIUM: (10, 19),
    Severity.LOW: (1, 9),
}


def compute_overall_risk_score(hazards: list[Hazard]) -> int:
    """Overall Risk Score = min(100, sum(hazard.severity_weight))."""
    return min(100, sum(h.severity_weight for h in hazards))


def risk_level_from_score(score: int) -> RiskLevel:
    if score <= 0:
        return RiskLevel.CLEAR
    if score >= 80:
        return RiskLevel.CRITICAL
    if score >= 50:
        return RiskLevel.HIGH
    if score >= 25:
        return RiskLevel.MEDIUM
    return RiskLevel.LOW


class Hazard(BaseModel):
    id: str
    title: str
    severity: Severity
    severity_weight: int = Field(ge=1, le=40)
    osha_citation: str
    description: str
    corrective_action: str
    box_2d: Box2D
    audio_response_script: str
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)

    @field_validator("box_2d")
    @classmethod
    def validate_box_2d(cls, value: list[int]) -> list[int]:
        if len(value) != 4:
            raise ValueError("box_2d must be [ymin, xmin, ymax, xmax]")
        ymin, xmin, ymax, xmax = value
        for coord in value:
            if coord < 0 or coord > 1000:
                raise ValueError("box_2d coordinates must be integers in 0..1000")
        if ymin >= ymax or xmin >= xmax:
            raise ValueError("box_2d requires ymin < ymax and xmin < xmax")
        return value

    @model_validator(mode="after")
    def validate_severity_weight(self) -> Hazard:
        low, high = SEVERITY_WEIGHT_RANGES[self.severity]
        if not (low <= self.severity_weight <= high):
            raise ValueError(
                f"severity_weight {self.severity_weight} out of range "
                f"for {self.severity.value} ({low}-{high})"
            )
        return self


class InspectResponse(BaseModel):
    overall_risk_score: int = Field(ge=0, le=100)
    risk_level: RiskLevel
    hazards: list[Hazard]
    audio_response_script: str
    mode: InspectMode
    site_id: str | None = None
    foreman_transcript_used: bool = False

    @model_validator(mode="after")
    def validate_score_matches_hazards(self) -> InspectResponse:
        expected = compute_overall_risk_score(self.hazards)
        if self.overall_risk_score != expected:
            raise ValueError(
                f"overall_risk_score {self.overall_risk_score} != "
                f"min(100, sum(weights)) {expected}"
            )
        return self


# Resolve forward ref used in compute_overall_risk_score annotation at runtime
Hazard.model_rebuild()
