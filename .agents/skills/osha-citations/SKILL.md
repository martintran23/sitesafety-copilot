---
name: osha-citations
description: Use when writing or reviewing hazard data, prompts, mock hazards, RAG chunks, or any text that cites OSHA 29 CFR 1926, or assigns severity and risk scores.
---

# OSHA Citations and Severity

Source of truth: `MASTER_PROMPT_CONTEXT.md` (sections "Grounded OSHA 1926 Regulatory Knowledge Base" and "Severity Weights").

## Rules
1. Cite specific paragraphs (e.g. `1926.501(b)(1)`), never a vague rule name.
2. Use only citations in the knowledge base tables, or ones retrieved from the OSHA 1926 store (Phase 2 RAG). Never invent paragraph numbers. If unsure, omit the hazard or lower confidence.
3. Every hazard needs an immediate physical `corrective_action` (install, remove, secure, stop work, reposition, barricade).
4. Severity weights: CRITICAL 30-40, HIGH 20-29, MEDIUM 10-19, LOW 1-9.
5. `overall_risk_score = min(100, sum(severity_weight))`. Bands: 80-100 CRITICAL, 50-79 HIGH, 25-49 MEDIUM, 1-24 LOW, 0 CLEAR.
6. Rank hazards by `severity_weight` descending.

## Workflow
- Open `MASTER_PROMPT_CONTEXT.md`, find the matching subpart row, copy the citation exactly.
- When changing the Bedrock system prompt, edit it in `MASTER_PROMPT_CONTEXT.md` first so mock and live stay aligned.
- Update citation tables only from official OSHA 1926 text.
