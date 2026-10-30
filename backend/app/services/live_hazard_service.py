"""Amazon Bedrock multimodal inspection with strict local contract validation."""

from __future__ import annotations

import asyncio
import json
import os
import re
from pathlib import Path
from typing import Any

from fastapi import HTTPException

from app.schemas.hazard_schema import (
    SEVERITY_WEIGHT_RANGES,
    Hazard,
    InspectResponse,
    Severity,
    compute_overall_risk_score,
    risk_level_from_score,
)
from app.services.rag_service import allowed_citations, citation_from_model, retrieve


MODEL_ID = os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-5-sonnet-20241022-v2:0")
PROMPT_PATH = Path(__file__).resolve().parents[3] / "MASTER_PROMPT_CONTEXT.md"


def _system_prompt() -> str:
    if PROMPT_PATH.exists():
        text = PROMPT_PATH.read_text(encoding="utf-8")
        start = text.index("You are a Senior OSHA Construction Safety Inspector")
        end = text.index("\n```", start)
        return text[start:end].replace("{{FOREMAN_TRANSCRIPT}}", "{FOREMAN_TRANSCRIPT}")
    return (
        "You are a Senior OSHA Construction Safety Inspector and Superintendent Assistant. "
        "Analyze the image and transcript using only OSHA 29 CFR 1926. Return only valid JSON. "
        "Use box_2d [ymin, xmin, ymax, xmax] as integer coordinates from 0 to 1000, "
        "cite only supplied OSHA chunks, rank hazards by severity_weight, and compute the risk score."
    )


def _detect_image_format(image_bytes: bytes, content_type: str | None) -> str:
    normalized = (content_type or "").split(";")[0].strip().lower()
    if normalized and normalized != "application/octet-stream":
        fmt = normalized.split("/")[-1]
        if fmt == "jpg":
            fmt = "jpeg"
        if fmt not in {"jpeg", "png", "gif", "webp"}:
            raise HTTPException(status_code=400, detail=f"Bedrock does not accept image format: {fmt}")
        return fmt
    if image_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if image_bytes.startswith((b"GIF87a", b"GIF89a")):
        return "gif"
    if len(image_bytes) >= 12 and image_bytes[:4] == b"RIFF" and image_bytes[8:12] == b"WEBP":
        return "webp"
    return "jpeg"


def _json_from_text(text: str) -> dict[str, Any]:
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", cleaned, flags=re.IGNORECASE | re.DOTALL).strip()
    try:
        value = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        start, end = cleaned.find("{"), cleaned.rfind("}")
        if start < 0 or end <= start:
            raise ValueError("Bedrock response did not contain a JSON object") from exc
        value = json.loads(cleaned[start : end + 1])
    if not isinstance(value, dict):
        raise ValueError("Bedrock response must be a JSON object")
    return value


def _response_text(response: dict[str, Any]) -> str:
    content = response.get("output", {}).get("message", {}).get("content", [])
    return "\n".join(item.get("text", "") for item in content if isinstance(item, dict) and item.get("text"))


def _normalize_box_2d(raw: Any) -> list[int] | None:
    if not isinstance(raw, (list, tuple)) or len(raw) != 4:
        return None
    try:
        box = [max(0, min(1000, int(round(float(c))))) for c in raw]
    except (TypeError, ValueError):
        return None
    ymin, xmin, ymax, xmax = box
    return box if (ymin < ymax and xmin < xmax) else None


def _validated_payload(payload: dict[str, Any], *, site_id: str | None, transcript: str | None) -> InspectResponse:
    valid_citations = allowed_citations()
    candidates: list[dict[str, Any]] = []
    for item in payload.get("hazards", []):
        if not isinstance(item, dict):
            continue
        citation = citation_from_model(str(item.get("osha_citation", "")))
        if citation is None or citation not in valid_citations:
            continue
        box = _normalize_box_2d(item.get("box_2d"))
        if box is None:
            continue
        item = dict(item)
        item["osha_citation"] = f"29 CFR {citation}"
        item["box_2d"] = box
        try:
            sev = Severity(str(item.get("severity", "")).upper())
            low, high = SEVERITY_WEIGHT_RANGES[sev]
            weight = int(round(float(item.get("severity_weight", low))))
            item["severity"] = sev.value
            item["severity_weight"] = max(low, min(high, weight))
        except (TypeError, ValueError):
            pass
        candidates.append(item)

    candidates.sort(key=lambda item: int(item.get("severity_weight", 0)), reverse=True)
    validated_hazards: list[Hazard] = []
    for item in candidates:
        item["id"] = str(item.get("id") or f"hzd_{len(validated_hazards) + 1:03d}")
        try:
            validated_hazards.append(Hazard.model_validate(item))
        except Exception:
            continue

    score = compute_overall_risk_score(validated_hazards)
    level = risk_level_from_score(score)
    summary_script = str(payload.get("audio_response_script") or "").strip()
    if not summary_script:
        summary_script = (
            f"Inspection complete. Overall risk score is {score}, {level.value.lower()}. "
            f"Address {validated_hazards[0].title.lower()} before resuming work."
            if validated_hazards
            else "Inspection complete. No grounded hazards detected. Risk score is zero, clear."
        )

    return InspectResponse.model_validate({
        "hazards": validated_hazards,
        "overall_risk_score": score,
        "risk_level": level.value,
        "audio_response_script": summary_script,
        "mode": "live",
        "site_id": site_id,
        "foreman_transcript_used": bool(transcript and transcript.strip()),
    })


async def run_live_inspection(
    *,
    image_bytes: bytes,
    content_type: str | None,
    audio_transcript: str | None = None,
    site_id: str | None = None,
) -> InspectResponse:
    try:
        import boto3
    except ImportError as exc:
        raise HTTPException(status_code=503, detail="Live inspection requires boto3. Install backend requirements first.") from exc

    image_format = _detect_image_format(image_bytes, content_type)
    retrieved = retrieve(" ".join(filter(None, [audio_transcript or "", "construction jobsite hazard inspection"])))
    grounding = "\n".join(f"- 29 CFR {chunk.citation}: {chunk.requirement}" for chunk in retrieved)
    citation_whitelist = ", ".join(f"29 CFR {citation}" for citation in sorted(allowed_citations()))
    prompt = _system_prompt().replace("{FOREMAN_TRANSCRIPT}", audio_transcript or "")
    prompt += f"\n\nRetrieved OSHA 1926 chunks. Use these first:\n{grounding}\n\nComplete citation whitelist: {citation_whitelist}"

    def _invoke() -> dict[str, Any]:
        client = boto3.client("bedrock-runtime", region_name=os.getenv("AWS_REGION", "us-east-1"))
        return client.converse(
            modelId=MODEL_ID,
            system=[{"text": prompt}],
            messages=[{"role": "user", "content": [
                {"text": "Inspect this jobsite image and return the required JSON."},
                {"image": {"format": image_format, "source": {"bytes": image_bytes}}},
            ]}],
            inferenceConfig={"temperature": 0.0, "maxTokens": 4000},
        )

    try:
        response = await asyncio.to_thread(_invoke)
        return _validated_payload(_json_from_text(_response_text(response)), site_id=site_id, transcript=audio_transcript)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Bedrock inspection failed: {exc}") from exc
