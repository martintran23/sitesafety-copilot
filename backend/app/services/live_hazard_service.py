"""Amazon Bedrock multimodal inspection with strict local contract validation."""

from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Any

from fastapi import HTTPException

from app.schemas.hazard_schema import Hazard, InspectResponse, compute_overall_risk_score, risk_level_from_score
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


def _validated_payload(payload: dict[str, Any], *, site_id: str | None, transcript: str | None) -> InspectResponse:
    valid_citations = allowed_citations()
    hazards: list[dict[str, Any]] = []
    for item in payload.get("hazards", []):
        if not isinstance(item, dict):
            continue
        citation = citation_from_model(str(item.get("osha_citation", "")))
        if citation is None or citation not in valid_citations:
            continue
        item["osha_citation"] = f"29 CFR {citation}"
        hazards.append(item)
    hazards.sort(key=lambda item: int(item.get("severity_weight", 0)), reverse=True)
    for index, item in enumerate(hazards, start=1):
        item["id"] = str(item.get("id") or f"hzd_{index:03d}")
    validated_hazards = [Hazard.model_validate(item) for item in hazards]
    score = compute_overall_risk_score(validated_hazards)
    payload.update({
        "hazards": validated_hazards,
        "overall_risk_score": score,
        "risk_level": risk_level_from_score(score).value,
        "mode": "live",
        "site_id": site_id,
        "foreman_transcript_used": bool(transcript and transcript.strip()),
    })
    return InspectResponse.model_validate(payload)


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

    image_format = (content_type or "image/jpeg").split("/")[-1].lower()
    if image_format == "jpg":
        image_format = "jpeg"
    if image_format not in {"jpeg", "png", "gif", "webp"}:
        raise HTTPException(status_code=400, detail=f"Bedrock does not accept image format: {image_format}")

    retrieved = retrieve(" ".join(filter(None, [audio_transcript or "", "construction jobsite hazard inspection"])))
    grounding = "\n".join(f"- 29 CFR {chunk.citation}: {chunk.requirement}" for chunk in retrieved)
    citation_whitelist = ", ".join(f"29 CFR {citation}" for citation in sorted(allowed_citations()))
    prompt = _system_prompt().replace("{FOREMAN_TRANSCRIPT}", audio_transcript or "")
    prompt += f"\n\nRetrieved OSHA 1926 chunks. Use these first:\n{grounding}\n\nComplete citation whitelist: {citation_whitelist}"

    try:
        client = boto3.client("bedrock-runtime", region_name=os.getenv("AWS_REGION", "us-east-1"))
        response = client.converse(
            modelId=MODEL_ID,
            system=[{"text": prompt}],
            messages=[{"role": "user", "content": [
                {"text": "Inspect this jobsite image and return the required JSON."},
                {"image": {"format": image_format, "source": {"bytes": image_bytes}}},
            ]}],
            inferenceConfig={"temperature": 0.0, "maxTokens": 4000},
        )
        return _validated_payload(_json_from_text(_response_text(response)), site_id=site_id, transcript=audio_transcript)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Bedrock inspection failed: {exc}") from exc
