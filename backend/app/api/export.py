"""POST /api/v1/export/presentation — JHA PDF and toolbox video export."""

from __future__ import annotations

from pathlib import Path
import re
from typing import Any, Literal
from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.schemas.hazard_schema import Hazard
from app.services.narration_service import build_presentation_script
from app.services.pdf_service import generate_jha_pdf
from app.services.polly_service import synthesize_speech
from app.services.presentation_service import compile_presentation

router = APIRouter(prefix="/api/v1/export", tags=["export"])
EXPORT_DIR = Path(__file__).resolve().parent.parent / "static" / "exports"


class ExportPresentationRequest(BaseModel):
    inspection_id: str | None = Field(default="insp_demo")
    site_name: str = Field(default="Jobsite Sector 4")
    foreman_name: str = Field(default="Field Foreman")
    hazards: list[dict[str, Any]] = Field(default_factory=list)
    include_narration: bool = True
    output_format: Literal["mp4", "pdf"] = "mp4"


class ExportPresentationResponse(BaseModel):
    download_url: str
    duration_seconds: float
    jha_pdf_url: str | None = None
    status: Literal["ready", "processing", "failed"] = "ready"
    message: str


@router.post("/presentation", response_model=ExportPresentationResponse)
async def export_presentation(req: ExportPresentationRequest) -> ExportPresentationResponse:
    export_dir = EXPORT_DIR
    export_id = re.sub(r"[^A-Za-z0-9_-]", "_", req.inspection_id or "demo")[:80] or "demo"
    hazards: list[Hazard] = []
    for raw in req.hazards:
        try:
            hazards.append(Hazard.model_validate(raw))
        except Exception:
            continue
    script = build_presentation_script(req.site_name, hazards)
    total_duration = min(45.0, max(3.0, round(len(script.split()) / 2.4, 1))) if req.include_narration else 8.0
    pdf_path = export_dir / f"jha_{export_id}.pdf"
    pdf_url: str | None = None
    try:
        generate_jha_pdf(output_path=pdf_path, site_name=req.site_name, foreman_name=req.foreman_name, hazards=hazards)
        pdf_url = f"/static/exports/{pdf_path.name}"
    except RuntimeError:
        # Keep the API usable in the lightweight Phase 1 environment.
        pdf_url = f"/api/v1/export/jha_{export_id}.pdf"

    audio_path = None
    if req.include_narration:
        audio_path = await synthesize_speech(script, export_dir / f"narration_{export_id}.mp3")
    video_path = export_dir / f"presentation_{export_id}.mp4"
    compiled = await compile_presentation(output_path=video_path, audio_path=audio_path, title=req.site_name, duration=total_duration) if req.output_format == "mp4" else None
    if req.output_format == "pdf":
        download_url = pdf_url or f"/api/v1/export/jha_{export_id}.pdf"
    else:
        download_url = f"/static/exports/{compiled.name}" if compiled else f"/api/v1/export/sample_{export_id}.mp4"

    return ExportPresentationResponse(
        download_url=download_url,
        duration_seconds=total_duration,
        jha_pdf_url=pdf_url,
        status="ready",
        message=f"Presentation '{req.site_name}' prepared for {req.foreman_name}. Includes {len(hazards)} grounded hazard breakdowns.",
    )
