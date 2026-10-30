"""Unit and integration tests for Phase 2 services (RAG, Bedrock, PDF, Polly, Narration, Export)."""

from __future__ import annotations

import asyncio
import io
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.schemas.hazard_schema import Hazard, Severity
from app.services import (
    live_hazard_service,
    narration_service,
    pdf_service,
    polly_service,
    presentation_service,
    rag_service,
)


def _make_hazard(
    *,
    hid: str = "hzd_001",
    title: str = "Unprotected leading edge",
    severity: Severity = Severity.CRITICAL,
    weight: int = 35,
    citation: str = "29 CFR 1926.501(b)(1)",
    description: str = "Worker exposed near slab edge >6 ft.",
    action: str = "Install 42-inch guardrails immediately.",
    box: list[int] | None = None,
) -> Hazard:
    return Hazard(
        id=hid,
        title=title,
        severity=severity,
        severity_weight=weight,
        osha_citation=citation,
        description=description,
        corrective_action=action,
        box_2d=box or [120, 340, 680, 810],
        confidence=0.93,
        audio_response_script="Critical fall hazard. Install guardrails immediately.",
    )


def test_rag_loads_all_master_prompt_citations():
    """Corpus must expose all 14 grounded citations across Subparts M, L, P, X, E, K."""
    citations = rag_service.allowed_citations()
    expected = {
        "1926.501(b)(1)",
        "1926.502(d)",
        "1926.501(b)(4)",
        "1926.451(g)(1)",
        "1926.451(g)(4)",
        "1926.451(b)(1)",
        "1926.451(c)(2)",
        "1926.652(a)(1)",
        "1926.651(c)(2)",
        "1926.651(j)(2)",
        "1926.1053(b)(1)",
        "1926.1053(b)(4)",
        "1926.100(a)",
        "1926.404(b)(1)",
    }
    assert expected == citations


def test_rag_citation_from_model_accepts_four_digit_subpart_x_and_rejects_hallucinations():
    """Subpart X ladder citations (1926.1053) have 4-digit section numbers and must not be dropped."""
    assert rag_service.citation_from_model("29 CFR 1926.501(b)(1)") == "1926.501(b)(1)"
    assert rag_service.citation_from_model("29 CFR 1926.1053(b)(1)") == "1926.1053(b)(1)"
    assert rag_service.citation_from_model("OSHA 1926.1053(b)(4) unsecured ladder") == "1926.1053(b)(4)"
    assert rag_service.citation_from_model("29 CFR 1926.501(b)(1)(i)") == "1926.501(b)(1)"
    assert rag_service.citation_from_model("29 CFR 1926.999(z)(9)") is None
    assert rag_service.citation_from_model("general fall rule") is None


def test_rag_retrieve_ranks_domain_keywords():
    trench_hits = rag_service.retrieve("trench shoring spoil pile ladder egress", top_k=3)
    assert len(trench_hits) == 3
    assert any(c.citation.startswith("1926.65") for c in trench_hits)


def test_pdf_service_escapes_xml_special_characters(tmp_path: Path):
    """ReportLab Paragraph parses XML; &, <, > in hazard fields or metadata must not crash export."""
    out = tmp_path / "jha_special.pdf"
    hazard = _make_hazard(
        title="Trench & Shoring <br> unclosed tag",
        description="Clearance < 2 ft & spoil rocks > 10 lbs near lip.",
        action="Barricade trench & move spoil >= 2 ft back <font color=red>.",
    )
    result = pdf_service.generate_jha_pdf(
        output_path=out,
        site_name="Sector 4 & Bay <B>",
        foreman_name="Alex Rivera & Co.",
        hazards=[hazard],
        weather="Rain & Wind > 15mph",
    )
    assert result == out
    data = out.read_bytes()
    assert data.startswith(b"%PDF-")
    assert len(data) > 1000


def test_narration_sorts_by_severity_and_summarizes_overflow():
    """Narration must lead with highest severity, punctuate cleanly, and note >3 findings in JHA PDF."""
    low = _make_hazard(
        hid="h_low",
        title="Minor cord housekeeping",
        severity=Severity.LOW,
        weight=6,
        citation="29 CFR 1926.404(b)(1)",
        action="Route cord clear of walkway",  # intentionally no trailing period
    )
    crit = _make_hazard(
        hid="h_crit",
        title="Unprotected slab edge",
        severity=Severity.CRITICAL,
        weight=38,
        citation="29 CFR 1926.501(b)(1)",
        action="Install perimeter guardrails",  # intentionally no trailing period
    )
    h2 = _make_hazard(hid="h_2", title="Missing mid-rail", severity=Severity.HIGH, weight=25, citation="29 CFR 1926.451(g)(4)")
    h3 = _make_hazard(hid="h_3", title="Short ladder extension", severity=Severity.HIGH, weight=22, citation="29 CFR 1926.1053(b)(1)")

    script = narration_service.build_presentation_script("Tower Pad B", [low, h3, crit, h2])

    assert "Our primary concern is Unprotected slab edge under 29 CFR 1926.501(b)(1)." in script
    assert "Install perimeter guardrails. Stop work" in script
    assert "Minor cord housekeeping" not in script
    assert "JHA PDF" in script


def test_live_hazard_service_clamps_boxes_keeps_ladder_citations_and_handles_missing_script(monkeypatch):
    """Live service must preserve 1926.1053 citations, clamp float/out-of-range boxes, and sniff PNG bytes."""
    fake_model_json = """```json
    {
      "overall_risk_score": 12,
      "risk_level": "LOW",
      "hazards": [
        {
          "id": "",
          "title": "Ladder side rails short of landing",
          "severity": "HIGH",
          "severity_weight": 24,
          "osha_citation": "29 CFR 1926.1053(b)(1)",
          "description": "Portable ladder does not extend 3 feet above upper landing.",
          "corrective_action": "Extend ladder rails 36 inches above landing and secure.",
          "box_2d": [-5, 120.4, 680.6, 1004],
          "confidence": 0.91,
          "audio_response_script": "Ladder rails are short under 1926.1053. Extend three feet above landing."
        },
        {
          "id": "h_fake",
          "title": "Hallucinated rule",
          "severity": "LOW",
          "severity_weight": 5,
          "osha_citation": "29 CFR 1926.999(a)(1)",
          "description": "Fake citation must be filtered.",
          "corrective_action": "Remove.",
          "box_2d": [10, 10, 100, 100],
          "confidence": 0.5,
          "audio_response_script": "Fake."
        }
      ]
    }
    ```"""

    captured_calls: list[dict] = []

    class FakeBedrockClient:
        def converse(self, **kwargs):
            captured_calls.append(kwargs)
            return {"output": {"message": {"content": [{"text": fake_model_json}]}}}

    import boto3

    monkeypatch.setattr(boto3, "client", lambda service, **kw: FakeBedrockClient())

    png_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR"
    resp = asyncio.run(
        live_hazard_service.run_live_inspection(
            image_bytes=png_bytes,
            content_type=None,  # missing content_type should sniff PNG magic bytes
            audio_transcript="check ladder access",
            site_id="site_42",
        )
    )

    assert resp.mode == "live"
    assert resp.site_id == "site_42"
    assert resp.foreman_transcript_used is True
    assert len(resp.hazards) == 1
    assert resp.hazards[0].osha_citation == "29 CFR 1926.1053(b)(1)"
    assert resp.hazards[0].box_2d == [0, 120, 681, 1000]
    assert resp.overall_risk_score == 24
    assert resp.risk_level.value == "LOW"
    assert resp.audio_response_script
    image_block = captured_calls[0]["messages"][0]["content"][1]["image"]
    assert image_block["format"] == "png"


def test_polly_and_presentation_services(monkeypatch, tmp_path: Path):
    """Verify Polly writes stream bytes and presentation service handles missing/present ffmpeg."""
    import boto3

    class FakePollyClient:
        def synthesize_speech(self, **kwargs):
            return {"AudioStream": io.BytesIO(b"ID3-fake-mp3-bytes")}

    monkeypatch.setattr(boto3, "client", lambda service, **kw: FakePollyClient())
    mp3_out = tmp_path / "speech.mp3"
    res_audio = asyncio.run(polly_service.synthesize_speech("Good morning crew.", mp3_out))
    assert res_audio == mp3_out
    assert mp3_out.read_bytes() == b"ID3-fake-mp3-bytes"

    monkeypatch.setattr(presentation_service.shutil, "which", lambda _: None)
    res_video = asyncio.run(
        presentation_service.compile_presentation(
            output_path=tmp_path / "out.mp4",
            audio_path=mp3_out,
            title="Sector 4: Bay 'B'",
            duration=15.0,
        )
    )
    assert res_video is None

    recorded_cmd: list[str] = []

    def fake_run(cmd, **kwargs):
        recorded_cmd.extend(cmd)
        Path(cmd[-1]).write_bytes(b"\x00\x00\x00\x18ftypmp42")

    monkeypatch.setattr(presentation_service.shutil, "which", lambda _: "ffmpeg")
    monkeypatch.setattr(presentation_service.subprocess, "run", fake_run)
    mp4_out = tmp_path / "compiled.mp4"
    compiled = asyncio.run(
        presentation_service.compile_presentation(
            output_path=mp4_out,
            audio_path=mp3_out,
            title="Sector 4: Bay 'B'",
            duration=15.0,
        )
    )
    assert compiled == mp4_out
    assert "-c:a" in recorded_cmd and "aac" in recorded_cmd


def test_live_inspect_rejects_svg_upload():
    """SVG presets are raster-incompatible with Bedrock Converse and must return 400 in live mode."""
    from app.main import app

    client = TestClient(app)
    files = {"image": ("preset.svg", b"<svg xmlns='http://www.w3.org/2000/svg'></svg>", "image/svg+xml")}
    res = client.post("/api/v1/inspect", files=files, data={"mode": "live"})
    assert res.status_code == 400
    assert "format" in res.json()["detail"].lower()


def test_export_endpoint_serves_generated_jha_pdf(monkeypatch):
    """App must import cleanly even on fresh clone and serve generated JHA PDFs over /static."""
    from app.api import export as export_api
    from app.main import app

    async def no_polly(text: str, out: Path):
        return None

    monkeypatch.setattr(export_api, "synthesize_speech", no_polly)

    client = TestClient(app)
    pdf_file = export_api.EXPORT_DIR / "jha_insp_pdf_check.pdf"
    try:
        hazard = _make_hazard(title="Edge & Hole <br> <6ft").model_dump(mode="json")
        res = client.post(
            "/api/v1/export/presentation",
            json={
                "inspection_id": "insp_pdf_check",
                "site_name": "Sector 4 & Bay B",
                "foreman_name": "Dave Foreman",
                "hazards": [hazard],
                "include_narration": True,
                "output_format": "pdf",
            },
        )
        assert res.status_code == 200
        body = res.json()
        assert body["jha_pdf_url"] == "/static/exports/jha_insp_pdf_check.pdf"
        assert body["download_url"] == "/static/exports/jha_insp_pdf_check.pdf"

        dl = client.get(body["jha_pdf_url"])
        assert dl.status_code == 200
        assert dl.content.startswith(b"%PDF-")
    finally:
        pdf_file.unlink(missing_ok=True)
