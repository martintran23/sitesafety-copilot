# SiteSafety Copilot — Phase 2 Handoff (Person 3: Live AWS & Production Pipeline)

**Date:** Phase 1 Completion  
**From:** Person 2 (Frontend & Orchestrator Contracts)  
**To:** Person 3 (Backend Live Services, Bedrock Multimodal, ChromaDB RAG, Polly, ReportLab, FFmpeg)  
**Git Branch:** `frontend` (commit `dda0d6a`)  

---

## 1. Executive Summary & Current State

Person 2 has completed the full frontend application and backend contracts:
- **Frontend App**: Next.js 16 + Tailwind CSS 4 on `http://localhost:3000`. Fully functional, dark industrial aesthetic with zero browser emojis, custom SVG icons, structured into:
  - **Landing Page (`/`)**: Cinematic blueprint hero with automated looping vision scan demo, real-time risk score ticker, OSHA subparts trust strip, 3-step capture-to-briefing workflow, interactive hazard sandbox canvas, and feature breakdown.
  - **Inspector Application (`/app`)**: 4 dedicated workspaces:
    1. `Jobsite Inspector`: Normalized 0–1000 spatial bounding canvas, push-to-talk STT, dynamic hazard remediation tracking with live risk score drops (e.g. 73 down to 38), and synchronized audio walkthrough tour.
    2. `OSHA 1926 Standards Store`: Searchable regulatory database for Title 29 CFR Part 1926 Subparts M, L, P, X, E, and K with penalty thresholds.
    3. `Toolbox Talks & JHA Studio`: Morning briefing teleprompter, simulated audio waveform synthesizer, and 4-step narration structure guide.
    4. `Spatial Specs & Architecture`: Mathematical coordinate contracts, severity formula, and pipeline visualization.
- **Backend API**: FastAPI running on `http://127.0.0.1:8000` with Swagger docs at `http://127.0.0.1:8000/docs`.
  - `POST /api/v1/inspect` accepts multipart image, `audio_transcript`, `site_id`, and `mode` (`mock` | `live`).
  - `POST /api/v1/export/presentation` accepts export parameters and returns presentation video and companion JHA PDF metadata.
- **Quality & Verification**:
  - `10/10` Backend `pytest` tests passing.
  - `8/8` Frontend `node --test` tests passing.
  - `0` TypeScript compilation errors (`npx tsc --noEmit`).
  - `0` ESLint errors or warnings (`npm run lint`).
  - Validated with end-to-end browser subagent walkthrough across `/` and `/app`.

---

## 2. Person 3 Ownership & Task Breakdown

Person 3 is responsible for **Phase 2 Live AWS Integration & Production Artifact Generation**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PERSON 3 WORKSTREAMS (PHASE 2)                        │
├────────────────────────┬────────────────────────────────────────────────────┤
│ Workstream A           │ Amazon Bedrock Multimodal Vision (Claude / Nova)   │
│ Workstream B           │ ChromaDB OSHA Title 29 CFR 1926 Regulatory RAG     │
│ Workstream C           │ Amazon Polly Bidirectional Speech Synthesis        │
│ Workstream D           │ ReportLab Audit-Ready Daily JHA PDF Generation     │
│ Workstream E           │ FFmpeg Narrated Presentation Video Compiler (.mp4) │
└────────────────────────┴────────────────────────────────────────────────────┘
```

---

## 3. Workstream A: Amazon Bedrock Multimodal Vision

### Target File
`backend/app/services/live_hazard_service.py`

### Objective
Replace the 501 stub in `run_live_inspection` with live Bedrock runtime invocation using `anthropic.claude-3-5-sonnet-20241022-v2:0` or `amazon.nova-pro-v1:0`.

### Requirements & Contracts
1. **System Prompt**: Copy verbatim from `MASTER_PROMPT_CONTEXT.md` (lines 118-159).
2. **Input Payload**:
   - Format image bytes as Bedrock image document content block (PNG, JPEG, WebP, GIF).
   - Substitute `{{FOREMAN_TRANSCRIPT}}` with `audio_transcript` (or empty string).
3. **Hard Rules Enforced in Prompt**:
   - `box_2d` output must be 4 integers `[ymin, xmin, ymax, xmax]` normalized to `[0, 1000]`.
   - `severity_weight` ranges: CRITICAL (30-40), HIGH (20-29), MEDIUM (10-19), LOW (1-9).
   - `overall_risk_score` = `min(100, sum(severity_weight))`.
   - `audio_response_script`: Maximum 3 spoken sentences per hazard, field-practical, short clauses.
4. **Validation**:
   - Parse returned model output into `app.schemas.hazard_schema.InspectResponse`.
   - Pydantic v2 validator will automatically assert coordinate bounds, order (`ymin < ymax`, `xmin < xmax`), and weight ranges.

### Example Implementation Pattern
```python
import json
import boto3
from app.schemas.hazard_schema import InspectResponse

bedrock = boto3.client("bedrock-runtime", region_name=os.getenv("AWS_REGION", "us-east-1"))

async def run_live_inspection(
    *,
    image_bytes: bytes,
    content_type: str | None,
    audio_transcript: str | None = None,
    site_id: str | None = None,
) -> InspectResponse:
    # 1. Format Converse / InvokeModel payload
    # 2. Call anthropic.claude-3-5-sonnet-20241022-v2:0
    # 3. Parse JSON response into InspectResponse
    ...
```

---

## 4. Workstream B: ChromaDB OSHA 1926 Regulatory RAG Store

### Target Directory
`backend/app/data/osha_1926/` and `backend/app/services/rag_service.py`

### Objective
Ground Bedrock responses strictly in official OSHA Title 29 CFR Part 1926 to prevent hallucinated citations.

### Source Corpus
The grounded regulatory table is located in `MASTER_PROMPT_CONTEXT.md` ("Grounded OSHA 1926 Regulatory Knowledge Base"):
- **Subpart M (Fall Protection)**: `1926.501(b)(1)`, `1926.502(d)`, `1926.501(b)(4)`
- **Subpart L (Scaffolding)**: `1926.451(g)(1)`, `1926.451(g)(4)`, `1926.451(b)(1)`, `1926.451(c)(2)`
- **Subpart P (Excavations & Trenching)**: `1926.652(a)(1)`, `1926.651(c)(2)`, `1926.651(j)(2)`
- **Subpart X (Stairways & Ladders)**: `1926.1053(b)(1)`, `1926.1053(b)(4)`
- **Subparts E & K (PPE & Electrical)**: `1926.100(a)`, `1926.404(b)(1)`

### Workflow
1. Populate markdown or text chunks in `backend/app/data/osha_1926/`.
2. Use ChromaDB or Bedrock Knowledge Base with Titan Embeddings (`amazon.titan-embed-text-v2:0`).
3. Retrieve top-3 relevant OSHA chunks matching detected scene or foreman voice transcript keywords.

---

## 5. Workstream C: Amazon Polly Speech Synthesis

### Target File
`backend/app/services/polly_service.py`

### Objective
Synthesize the aggregate `audio_response_script` and per-hazard scripts into spoken audio files.

### Guidelines from `MASTER_PROMPT_CONTEXT.md`
- Target runtime: **under 45 seconds** total spoken runtime for morning toolbox briefings.
- 4-step narration structure:
  1. **Greeting** (1 sentence): Address crew, name site sector.
  2. **Primary Concern** (1-2 sentences): Highest-severity hazard, explicit CFR cite, urgency.
  3. **Corrective Action** (1-2 sentences): Immediate physical fix, stop-work condition.
  4. **Crew Sign-Off** (1 sentence): Confirm protective measures before next lift.
- Voice recommendations: Amazon Polly Neural engine, voice `Matthew` or `Ruth`.

---

## 6. Workstream D: ReportLab JHA PDF Generator

### Target File
`backend/app/services/pdf_service.py`

### Objective
Generate downloadable, audit-ready daily Job Hazard Analysis (JHA) PDF reports for site superintendents.

### JHA Document Elements Required
1. **Contractor & Sector Metadata**: Company header, Site Sector (e.g. "Sector 4 — Bay B"), Assessment Date, Lead Inspector (OSHA 30 Superintendent).
2. **Weather / Environmental Conditions**: Ambient temp, wind speed, surface conditions.
3. **PPE Checklist Table (Subpart E)**: Hard Hat (`1926.100`), Eye Protection (`1926.102`), Fall Harness (`1926.502`), High-Vis Vest, Steel-Toe Boots.
4. **Hazard Identification Matrix**:
   - Item #
   - Identified Hazard & Description
   - OSHA 29 CFR 1926 Citation
   - Severity & Risk Points
   - Mandatory Physical Corrective Action
   - Remediation Status (`Open`, `Work Stopped`, `Corrected`)
5. **Formal Signature Blocks**: Safety Superintendent sign-off line and Subcontractor/Crew Lead briefing acknowledgement.

---

## 7. Workstream E: FFmpeg Narrated Presentation Video Compiler

### Target File
`backend/app/services/presentation_service.py`

### Objective
Power the `POST /api/v1/export/presentation` endpoint to generate an `.mp4` video with synchronized animated bounding boxes and Polly narration.

### Pipeline
1. Take source jobsite image frame.
2. Synchronize animated bounding box callouts (`box_2d`) highlighting Hazard 1 during Primary Concern narration, then Hazard 2 if time allows.
3. Overlay Amazon Polly narration `.mp3`.
4. Output compressed `.mp4` video (H.264 / AAC) with total duration matching Polly audio (<45s).
5. Save to `backend/static/exports/` and return download URL in `ExportResponse`.

---

## 8. Frontend-Backend Contract Reference

### `POST /api/v1/inspect`
- **Request**: `multipart/form-data`
  - `image`: UploadFile (JPEG, PNG, WebP, GIF, SVG)
  - `audio_transcript`: string (optional)
  - `site_id`: string (optional)
  - `mode`: `"mock"` | `"live"` (optional, defaults to `INSPECT_MODE` env)
- **Response**: JSON matching `InspectResponse`:
  ```json
  {
    "overall_risk_score": 73,
    "risk_level": "HIGH",
    "hazards": [
      {
        "id": "hzd_001",
        "title": "Unprotected leading edge",
        "severity": "CRITICAL",
        "severity_weight": 35,
        "osha_citation": "29 CFR 1926.501(b)(1)",
        "description": "Worker exposed at unprotected edge >6 ft above lower level.",
        "corrective_action": "Install top rail (42 in) and mid-rail, or personal fall arrest.",
        "box_2d": [120, 340, 680, 810],
        "confidence": 0.92,
        "audio_response_script": "Critical fall hazard at the leading edge. OSHA 1926.501 requires fall protection above six feet. Install a guardrail immediately."
      }
    ],
    "audio_response_script": "Inspection complete. Overall risk score is 73, HIGH. Address the leading edge before work resumes.",
    "mode": "live",
    "site_id": null,
    "foreman_transcript_used": false
  }
  ```

### `POST /api/v1/export/presentation`
- **Request**: JSON matching `ExportRequest` (`inspection_id`, `site_name`, `foreman_name`, `hazards`, `include_narration`, `output_format`).
- **Response**: JSON matching `ExportResponse`:
  ```json
  {
    "download_url": "/api/v1/export/download/pres_123.mp4",
    "duration_seconds": 37.5,
    "jha_pdf_url": "/api/v1/export/download/jha_123.pdf",
    "status": "ready"
  }
  ```

---

## 9. Quick Start Commands for Person 3

```bash
# 1. Pull the frontend branch
git fetch origin
git checkout frontend

# 2. Run backend in development reload mode
cd backend
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# 3. In another terminal, run frontend
cd frontend
npm install
npm run dev

# 4. Verify test suites before and after changes
pytest backend/tests
npm test --prefix frontend
```

---

## 10. Contact & Notes

- **Spatial Coordinate Rule**: Never emit pixel coordinates. Keep `box_2d` normalized integers in `[0, 1000]`.
- **Zero-Hallucination Policy**: If Claude or Nova is uncertain of a specific CFR subpart, omit the citation or flag confidence low; never invent paragraph numbers.
- **Frontend Mode Switcher**: In the header of `http://localhost:3000`, clicking "Live Bedrock" automatically sends `mode=live` to `/api/v1/inspect`. As soon as `live_hazard_service.py` is implemented, Person 3 can test live inference directly in the browser!
