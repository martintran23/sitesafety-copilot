"""POST /api/v1/inspect — multimodal hazard inspection."""

from __future__ import annotations

import os
from typing import Literal

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.schemas.hazard_schema import InspectResponse
from app.services.live_hazard_service import run_live_inspection
from app.services.mock_hazard_service import run_mock_inspection

router = APIRouter(prefix="/api/v1", tags=["inspect"])

ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
}



def _default_mode() -> Literal["mock", "live"]:
    raw = os.getenv("INSPECT_MODE", "mock").strip().lower()
    return "live" if raw == "live" else "mock"


@router.post("/inspect", response_model=InspectResponse)
async def inspect(
    image: UploadFile = File(..., description="Jobsite photo or video frame"),
    audio_transcript: str | None = Form(default=None),
    site_id: str | None = Form(default=None),
    mode: Literal["mock", "live"] | None = Form(default=None),
) -> InspectResponse:
    effective_mode: Literal["mock", "live"] = mode or _default_mode()

    raw_type = (image.content_type or "").lower()
    content_type = raw_type.split(";")[0].strip()
    is_svg = (
        content_type in {"image/svg+xml", "image/svg", "text/xml", "application/xml"}
        or (image.filename and image.filename.lower().endswith(".svg"))
    )

    if content_type and content_type not in ALLOWED_IMAGE_TYPES and not is_svg:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image type: {content_type}. Use JPEG, PNG, WebP, GIF, or SVG.",
        )

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty image upload.")

    if effective_mode == "mock":
        return run_mock_inspection(
            audio_transcript=audio_transcript,
            site_id=site_id,
        )

    return await run_live_inspection(
        image_bytes=image_bytes,
        content_type=content_type or None,
        audio_transcript=audio_transcript,
        site_id=site_id,
    )


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "default_mode": _default_mode()}
