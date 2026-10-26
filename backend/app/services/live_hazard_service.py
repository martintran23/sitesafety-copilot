"""Live Bedrock multimodal inspection (Phase 2). Stubbed for Phase 1."""

from __future__ import annotations

from fastapi import HTTPException


async def run_live_inspection(
    *,
    image_bytes: bytes,
    content_type: str | None,
    audio_transcript: str | None = None,
    site_id: str | None = None,
) -> None:
    """Phase 2: call Amazon Bedrock Claude / Nova with MASTER_PROMPT_CONTEXT.

    Phase 1 keeps this as an explicit stub so clients can detect live mode
    is not configured yet.
    """
    _ = (image_bytes, content_type, audio_transcript, site_id)
    raise HTTPException(
        status_code=501,
        detail=(
            "Live Bedrock inspection is not enabled yet (Phase 2). "
            "Retry with mode=mock or set INSPECT_MODE=mock."
        ),
    )
