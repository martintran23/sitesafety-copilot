"""Unit tests for hazard schemas, box_2d validation, and risk scoring."""

import pytest
from pydantic import ValidationError

from app.schemas.hazard_schema import (
    Hazard,
    InspectResponse,
    RiskLevel,
    Severity,
    compute_overall_risk_score,
    risk_level_from_score,
)


def test_valid_box_2d_and_hazard():
    """Verify that the contract box_2d format [ymin, xmin, ymax, xmax] validates successfully."""
    hazard = Hazard(
        id="hzd_001",
        title="Unprotected edge",
        severity=Severity.CRITICAL,
        severity_weight=35,
        osha_citation="29 CFR 1926.501(b)(1)",
        description="Fall hazard observed.",
        corrective_action="Install guardrails.",
        box_2d=[120, 340, 680, 810],
        confidence=0.95,
        audio_response_script="Critical fall hazard at leading edge.",
    )
    assert hazard.box_2d == [120, 340, 680, 810]
    assert hazard.severity_weight == 35


def test_box_2d_order_validation():
    """ymin must be < ymax and xmin must be < xmax."""
    base_kwargs = {
        "id": "hzd_err",
        "title": "Invalid Box",
        "severity": Severity.HIGH,
        "severity_weight": 25,
        "osha_citation": "29 CFR 1926.1053",
        "description": "desc",
        "corrective_action": "action",
        "confidence": 0.9,
        "audio_response_script": "script",
    }

    # ymin >= ymax
    with pytest.raises(ValidationError, match="requires ymin < ymax and xmin < xmax"):
        Hazard(**base_kwargs, box_2d=[680, 100, 120, 500])

    # xmin >= xmax
    with pytest.raises(ValidationError, match="requires ymin < ymax and xmin < xmax"):
        Hazard(**base_kwargs, box_2d=[100, 800, 500, 200])


def test_box_2d_range_and_length_validation():
    """Coordinates must be clamped to [0, 1000] and have exactly 4 ints."""
    base_kwargs = {
        "id": "hzd_err",
        "title": "Invalid Box",
        "severity": Severity.MEDIUM,
        "severity_weight": 15,
        "osha_citation": "29 CFR 1926.100",
        "description": "desc",
        "corrective_action": "action",
        "confidence": 0.8,
        "audio_response_script": "script",
    }

    # Out of range negative
    with pytest.raises(ValidationError, match="must be integers in 0..1000"):
        Hazard(**base_kwargs, box_2d=[-5, 100, 500, 600])

    # Out of range > 1000
    with pytest.raises(ValidationError, match="must be integers in 0..1000"):
        Hazard(**base_kwargs, box_2d=[0, 0, 1005, 500])

    # Invalid length
    with pytest.raises(ValidationError):
        Hazard(**base_kwargs, box_2d=[0, 0, 500])


def test_severity_weight_range_validation():
    """severity_weight must be within designated range for severity level."""
    base_kwargs = {
        "id": "hzd_weight",
        "title": "Weight Range Test",
        "severity": Severity.LOW,
        "osha_citation": "29 CFR 1926",
        "description": "desc",
        "corrective_action": "action",
        "box_2d": [0, 0, 100, 100],
        "audio_response_script": "script",
    }

    # LOW is 1-9; 20 is invalid for LOW
    with pytest.raises(ValidationError, match="severity_weight 20 out of range for LOW"):
        Hazard(**base_kwargs, severity_weight=20)


def test_risk_scoring_and_level_mapping():
    """Verify compute_overall_risk_score and risk_level_from_score."""
    assert compute_overall_risk_score([]) == 0
    assert risk_level_from_score(0) == RiskLevel.CLEAR
    assert risk_level_from_score(10) == RiskLevel.LOW
    assert risk_level_from_score(24) == RiskLevel.LOW
    assert risk_level_from_score(25) == RiskLevel.MEDIUM
    assert risk_level_from_score(49) == RiskLevel.MEDIUM
    assert risk_level_from_score(50) == RiskLevel.HIGH
    assert risk_level_from_score(79) == RiskLevel.HIGH
    assert risk_level_from_score(80) == RiskLevel.CRITICAL
    assert risk_level_from_score(100) == RiskLevel.CRITICAL

    # Clamping behavior: weights summing over 100 clamp to 100
    h1 = Hazard(
        id="h1",
        title="t1",
        severity=Severity.CRITICAL,
        severity_weight=35,
        osha_citation="29 CFR 1926.501",
        description="d",
        corrective_action="a",
        box_2d=[0, 0, 100, 100],
        confidence=0.9,
        audio_response_script="s",
    )
    h2 = Hazard(
        id="h2",
        title="t2",
        severity=Severity.CRITICAL,
        severity_weight=40,
        osha_citation="29 CFR 1926.501",
        description="d",
        corrective_action="a",
        box_2d=[100, 100, 200, 200],
        confidence=0.9,
        audio_response_script="s",
    )
    h3 = Hazard(
        id="h3",
        title="t3",
        severity=Severity.CRITICAL,
        severity_weight=35,
        osha_citation="29 CFR 1926.501",
        description="d",
        corrective_action="a",
        box_2d=[200, 200, 300, 300],
        confidence=0.9,
        audio_response_script="s",
    )
    # Sum is 35 + 40 + 35 = 110 -> clamped to 100
    assert compute_overall_risk_score([h1, h2, h3]) == 100
