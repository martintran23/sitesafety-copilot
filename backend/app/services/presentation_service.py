"""FFmpeg presentation compiler for narrated toolbox-talk exports."""

from __future__ import annotations

import asyncio
import shutil
import subprocess
from pathlib import Path


async def compile_presentation(*, output_path: Path, audio_path: Path | None, title: str, duration: float) -> Path | None:
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        return None
    output_path.parent.mkdir(parents=True, exist_ok=True)
    duration = max(3.0, min(45.0, duration))
    command = [ffmpeg, "-y", "-f", "lavfi", "-i", "color=c=0x0b1020:s=1280x720:r=30", "-t", str(duration)]
    if audio_path and audio_path.exists():
        command += ["-i", str(audio_path), "-shortest"]
    command += ["-vf", f"drawtext=text='{title.replace(':', '\\:').replace("'", "\\'")}':fontcolor=white:fontsize=42:x=(w-text_w)/2:y=(h-text_h)/2", "-c:v", "libx264", "-pix_fmt", "yuv420p"]
    if audio_path and audio_path.exists():
        command += ["-c:a", "aac"]
    command.append(str(output_path))
    try:
        await asyncio.to_thread(subprocess.run, command, check=True, capture_output=True, timeout=60)
        return output_path if output_path.exists() else None
    except (OSError, subprocess.SubprocessError):
        return None
