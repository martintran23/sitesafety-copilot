"""Small, deterministic OSHA retrieval layer for the Phase 2 MVP.

The corpus is intentionally local and citation-whitelisted. A ChromaDB adapter can
replace the scorer later without changing the live inspection contract.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path


CORPUS_DIR = Path(__file__).resolve().parents[1] / "data" / "osha_1926"
CITATION_RE = re.compile(r"1926\.\d{3,4}(?:\([a-z]\)(?:\(\d+\))?)?")


@dataclass(frozen=True)
class OshaChunk:
    citation: str
    requirement: str
    source: str


def _load_chunks() -> list[OshaChunk]:
    chunks: list[OshaChunk] = []
    for path in sorted(CORPUS_DIR.glob("*.md")):
        text = path.read_text(encoding="utf-8")
        matches = list(re.finditer(r"Citation:\s*([^\n]+)\n\s*Requirement:\s*([^\n]+)", text))
        chunks.extend(OshaChunk(m.group(1).strip(), m.group(2).strip(), path.name) for m in matches)
    return chunks


def all_chunks() -> list[OshaChunk]:
    return _load_chunks()


def allowed_citations() -> set[str]:
    return {chunk.citation for chunk in all_chunks()}


def retrieve(query: str, *, top_k: int = 3) -> list[OshaChunk]:
    terms = {term for term in re.findall(r"[a-z0-9]+", query.lower()) if len(term) > 2}
    scored: list[tuple[int, OshaChunk]] = []
    for chunk in all_chunks():
        haystack = f"{chunk.citation} {chunk.requirement}".lower()
        score = sum(1 for term in terms if term in haystack)
        if score:
            scored.append((score, chunk))
    scored.sort(key=lambda item: (-item[0], item[1].citation))
    return [chunk for _, chunk in scored[:top_k]]


def citation_from_model(value: str) -> str | None:
    """Normalize a model citation and reject anything outside the local corpus."""
    match = CITATION_RE.search(value)
    if not match:
        return None
    citation = match.group(0)
    return citation if citation in allowed_citations() else None
