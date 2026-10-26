"""POST /api/v1/export/presentation — JHA PDF and toolbox video export."""

from __future__ import annotations

from typing import Any, Literal
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/v1/export", tags=["export"])


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
    # Phase 1 stub: calculates runtime estimate based on hazard count and narration flag.
    # Phase 2 connects FFmpeg compilation, ReportLab PDF, and Amazon Polly TTS audio.
    base_duration = 12.0
    narration_duration = len(req.hazards) * 8.5 if req.include_narration else 0.0
    total_duration = round(base_duration + narration_duration, 1)

    return ExportPresentationResponse(
        download_url=f"/api/v1/export/sample_{req.inspection_id or 'demo'}.mp4",
        duration_seconds=total_duration,
        jha_pdf_url=f"/api/v1/export/jha_{req.inspection_id or 'demo'}.pdf",
        status="ready",
        message=(
            f"Phase 1 stub: Presentation '{req.site_name}' prepared for {req.foreman_name}. "
            f"Includes {len(req.hazards)} hazard breakdown slides."
        ),
    )
