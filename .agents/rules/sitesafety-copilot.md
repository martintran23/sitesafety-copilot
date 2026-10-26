# SiteSafety Copilot Agent Rules

You are assisting developers building **SiteSafety Copilot**, a multimodal voice-vision OSHA hazard assistant for HackGlobal Theme 2 (AI-Powered Smart Assistant).

Primary references (read before feature work):
- `README.md`: architecture, API contracts, workstreams, setup
- `MASTER_PROMPT_CONTEXT.md`: OSHA 1926 citations, severity model, Bedrock system prompt, narration rules

Avoid em dashes in generated docs and user-facing copy.

## Role

Act as a staff engineer embedded on this repo. Prefer small, reviewable diffs that match existing patterns. Do not invent alternate API shapes when contracts already exist in `README.md` and Pydantic schemas. Ground regulatory language in `MASTER_PROMPT_CONTEXT.md`; never fabricate OSHA paragraph numbers.

## Architectural Constraints

1. **Two-phase delivery**
   - **Phase 1 (Round 1 Prototype):** mock inference, responsive bounding box overlays, push-to-talk audio, dynamic risk scoring.
   - **Phase 2 (Final Submission):** live Amazon Bedrock multimodal vision, ChromaDB Title 29 CFR 1926 RAG, bidirectional Amazon Polly speech, ReportLab JHA PDF, FFmpeg narrated presentation `.mp4` export.
2. **Backend** under `/backend` (FastAPI, Pydantic v2, services for bedrock / polly / rag / pdf / presentation).
3. **Frontend** under `/frontend` (Next.js / React, Tailwind CSS, components: InspectionCanvas, VoiceController, HazardSidebar, PresentationModal).
4. **Inspect modes:** support `mock` and `live` behind the same `POST /api/v1/inspect` contract so the UI never forks.
5. **Secrets:** never commit AWS keys, `.env` with credentials, or Polly/Bedrock tokens. Use env vars and document required names only.
6. **JSON contract stability:** responses include `overall_risk_score`, `risk_level`, `hazards[]` with `box_2d` as `[ymin, xmin, ymax, xmax]`, and `audio_response_script`.

## Coordinate Rule (Critical)

Backend / model output uses normalized integers 0-1000: `box_2d = [ymin, xmin, ymax, xmax]`.

Frontend converts to responsive CSS percentages:

```
top:    ymin / 10 %
left:   xmin / 10 %
height: (ymax - ymin) / 10 %
width:  (xmax - xmin) / 10 %
```

Example: `[120, 340, 680, 810]` -> `top: 12%; left: 34%; height: 56%; width: 47%`.

Never use fixed pixels. Keep canvas highlight selection synchronized with `HazardSidebar`. See the `box-2d-contract` skill.

## Code Conventions

### Backend (Python / FastAPI)
- Pydantic v2 models in `backend/app/schemas/`.
- Routers thin; business logic in `backend/app/services/`.
- Prefer explicit `mode: Literal["mock", "live"]` over silent fallbacks.
- Type hints on public functions; validate `box_2d` length and ordering.
- `overall_risk_score = min(100, sum(h.severity_weight for h in hazards))`.

### Frontend (Next.js / React / Tailwind)
- Dark mode base `slate-900` with high-contrast safety accents (amber / red / lime for severity).
- Colocate hooks under `frontend/hooks/`.
- Accessible push-to-talk (keyboard operable, clear recording state).
- Never hardcode pixel box positions.

### Shared
- Match naming in README workstreams when adding files.
- Spoken scripts at most 3 sentences per hazard.
- No em dashes in UI strings, PDFs, or scripts.

## Implementation Roadmap

### Phase 1 (complete in order; keep mock path working before AWS work)
1. Pydantic models in `backend/app/schemas/hazard_schema.py`.
2. `backend/app/services/mock_hazard_service.py`.
3. `POST /api/v1/inspect` supporting mock and live (live may stub).
4. Scaffold Next.js frontend with Tailwind.
5. `InspectionCanvas.tsx` with bounding boxes synced to `HazardSidebar.tsx`.
6. Browser-native push-to-talk (Web Audio / MediaRecorder), transcript wired into inspect requests.

Success: upload/select image -> optional voice note -> mock hazards with boxes + risk score + readable/playable script.

### Phase 2
1. Live Bedrock client (`boto3`), Claude 3.5 Sonnet / Nova Pro, production prompt from `MASTER_PROMPT_CONTEXT.md`.
2. Ingest OSHA 1926 chunks into ChromaDB or Bedrock Knowledge Bases from `backend/app/data/osha_1926`.
3. Amazon Polly bidirectional voice.
4. ReportLab JHA PDF endpoint.
5. FFmpeg presentation generator (`POST /api/v1/export/presentation`).

Success: live vision + RAG citations, Polly playback, JHA PDF, narrated export under demo time limits.

## Agent Behavior Checklist

- [ ] Preserves the `box_2d` 0-1000 contract?
- [ ] Frontend converts with `/ 10` percentage math?
- [ ] OSHA cites are specific 1926 subparts from `MASTER_PROMPT_CONTEXT.md` or RAG?
- [ ] Mock mode still works without AWS credentials?
- [ ] Phase 1 vs Phase 2 boundaries respected?
- [ ] Audio scripts at most 3 sentences per hazard?

If a request conflicts with these rules, follow this file and explain the constraint briefly.
