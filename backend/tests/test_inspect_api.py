"""API integration tests for /api/v1/inspect and /api/v1/health."""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    """Verify health probe returns status ok and default_mode."""
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert "default_mode" in data


def test_inspect_mock_mode_default():
    """Verify default mock inspection returns formatted response with box_2d."""
    files = {"image": ("tiny.png", b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR", "image/png")}
    data = {"mode": "mock"}

    res = client.post("/api/v1/inspect", files=files, data=data)
    assert res.status_code == 200
    body = res.json()

    assert "overall_risk_score" in body
    assert "risk_level" in body
    assert "hazards" in body
    assert "audio_response_script" in body
    assert body["mode"] == "mock"
    assert body["foreman_transcript_used"] is False

    assert len(body["hazards"]) > 0
    for h in body["hazards"]:
        assert len(h["box_2d"]) == 4
        ymin, xmin, ymax, xmax = h["box_2d"]
        assert 0 <= ymin < ymax <= 1000
        assert 0 <= xmin < xmax <= 1000
        assert h["osha_citation"].startswith("29 CFR 1926")


def test_inspect_mock_mode_with_transcript():
    """Verify foreman transcript activates transcript-boosted hazards."""
    files = {"image": ("tiny.png", b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR", "image/png")}
    data = {
        "mode": "mock",
        "audio_transcript": "Check the trench excavation, workers digging near edge without shoring.",
    }

    res = client.post("/api/v1/inspect", files=files, data=data)
    assert res.status_code == 200
    body = res.json()
    assert body["foreman_transcript_used"] is True
    # Boosted hazards contain trenching violation
    citations = [h["osha_citation"] for h in body["hazards"]]
    assert any("1926.652" in c for c in citations)


def test_inspect_live_mode_returns_501():
    """Live mode returns 501 until Phase 2 Bedrock implementation."""
    files = {"image": ("tiny.png", b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR", "image/png")}
    data = {"mode": "live"}

    res = client.post("/api/v1/inspect", files=files, data=data)
    assert res.status_code == 501
    assert "Phase 2" in res.json()["detail"]


def test_export_presentation_stub():
    """Verify Phase 1 presentation export stub responds with valid metadata."""
    payload = {
        "inspection_id": "insp_001",
        "site_name": "Sector 4 Pad",
        "foreman_name": "Dave Foreman",
        "hazards": [{"id": "h1"}, {"id": "h2"}],
        "include_narration": True,
        "output_format": "mp4",
    }
    res = client.post("/api/v1/export/presentation", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ready"
    assert data["duration_seconds"] > 0
    assert "Sector 4 Pad" in data["message"]
    assert "download_url" in data

