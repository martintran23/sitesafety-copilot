"""Amazon Polly synthesis with a deterministic local fallback boundary."""

from __future__ import annotations

import os
from pathlib import Path


async def synthesize_speech(text: str, output_path: Path) -> Path | None:
    try:
        import boto3
    except ImportError:
        return None
    try:
        client = boto3.client("polly", region_name=os.getenv("AWS_REGION", "us-east-1"))
        response = client.synthesize_speech(
            Text=text[:5000], OutputFormat="mp3", VoiceId=os.getenv("POLLY_VOICE_ID", "Matthew"), Engine="neural"
        )
        stream = response.get("AudioStream")
        if stream is None:
            return None
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_bytes(stream.read())
        return output_path
    except Exception:
        return None
