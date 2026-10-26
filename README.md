# SiteSafety Copilot

**Multimodal Voice-Vision Assistant for Autonomous OSHA Hazard Intelligence**

SiteSafety Copilot is an AI-powered smart assistant built for HackGlobal Theme 2. It helps field foremen and safety superintendents detect construction hazards from photos and video walkthroughs, cite OSHA Title 29 CFR 1926 standards, speak findings aloud, score jobsite risk in real time, and export signed Job Hazard Analysis (JHA) PDFs plus narrated toolbox-talk presentation videos.

---

## Competition Phases

| Phase | Scope |
| --- | --- |
| **Phase 1 (Round 1 Prototype Submission)** | Core MVP slice with mock inference, responsive bounding box canvas overlays, push-to-talk audio capture, and dynamic risk scoring. |
| **Phase 2 (Final Submission)** | Live Amazon Bedrock multimodal vision, ChromaDB Title 29 CFR 1926 RAG, bidirectional Amazon Polly speech feedback, ReportLab JHA PDF generation, and automated narrated presentation video export. |

---

## Core Features

- **Multimodal hazard detection** from site photos and continuous video walkthroughs.
- **Synchronized spatial area highlighting** using normalized 0 to 1000 coordinate bounding boxes.
- **Bidirectional voice assistance**: field foremen dictate observations; the assistant speaks back OSHA findings.
- **Real-time 0 to 100 jobsite compliance risk scoring**.
- **Signed, audit-ready daily Job Hazard Analysis (JHA) PDF generation**.
- **Downloadable narrated presentation export** with synchronized assistant audio commentary and animated bounding box callouts for morning toolbox talks.

---

## System Architecture

```
┌─────────────────────────────────────┐
│  Client                             │
│  React / Tailwind / Web Audio       │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│  FastAPI Orchestrator               │
│  /api/v1/inspect                    │
│  /api/v1/export/presentation        │
└─────────────────┬───────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌───────────────────┐ ┌───────────────────────┐
│ Amazon Bedrock    │ │ ChromaDB              │
│ Claude 3.5 Sonnet │ │ OSHA 1926 RAG         │
│ / Nova Pro        │ │ Title 29 CFR chunks   │
└─────────┬─────────┘ └───────────┬───────────┘
          │                       │
          └───────────┬───────────┘
                      ▼
        ┌─────────────────────────────┐
        │ ReportLab PDF               │
        │ + FFmpeg Presentation Export│
        └─────────────────────────────┘
```

**Pipeline summary:**  
`[Client: React / Tailwind / Web Audio]` -> `[FastAPI Orchestrator]` -> `[Amazon Bedrock / Claude 3.5 Sonnet / Nova Pro]` + `[ChromaDB OSHA 1926 RAG]` -> `[ReportLab PDF + FFmpeg Presentation Export]`

---

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Backend API | FastAPI, Pydantic v2 |
| Frontend | Next.js / React, Tailwind CSS |
| Multimodal Vision | Amazon Bedrock (Claude 3.5 Sonnet / Nova Pro) |
| Speech | Amazon Polly, browser Web Audio (push-to-talk) |
| Regulatory RAG | ChromaDB (OSHA Title 29 CFR 1926) |
| Document Export | ReportLab (JHA PDF) |
| Video Export | FFmpeg (narrated presentation `.mp4`) |

---

## Data Contracts

### `POST /api/v1/inspect`

**Content-Type:** `multipart/form-data`

| Field | Type | Description |
| --- | --- | --- |
| `image` | file | Jobsite photo or extracted video frame |
| `audio_transcript` | string (optional) | Foreman's spoken observations (from push-to-talk STT) |
| `site_id` | string (optional) | Jobsite identifier for audit trail |
| `mode` | string (optional) | `mock` (Phase 1) or `live` (Phase 2 Bedrock) |

**Response JSON:**

```json
{
  "overall_risk_score": 72,
  "risk_level": "HIGH",
  "hazards": [
    {
      "id": "hzd_001",
      "title": "Unprotected leading edge",
      "severity": "CRITICAL",
      "severity_weight": 35,
      "osha_citation": "29 CFR 1926.501(b)(1)",
      "description": "Worker exposed at unprotected side/edge greater than 6 feet above lower level.",
      "corrective_action": "Install guardrail system or personal fall arrest before continuing work.",
      "box_2d": [120, 340, 680, 810],
      "audio_response_script": "Critical fall hazard at the leading edge. OSHA 1926.501 requires fall protection above six feet. Install a guardrail or personal fall arrest system immediately."
    }
  ],
  "audio_response_script": "Inspection complete. Overall risk score is seventy-two, high. Address the critical leading-edge fall hazard before resuming work.",
  "mode": "mock"
}
```

| Field | Type | Notes |
| --- | --- | --- |
| `overall_risk_score` | integer 0-100 | `min(100, sum(hazard.severity_weight))` |
| `risk_level` | string | Derived band: CRITICAL / HIGH / MEDIUM / LOW |
| `hazards[].box_2d` | `[ymin, xmin, ymax, xmax]` | Normalized integers on a 0 to 1000 scale |
| `hazards[].audio_response_script` | string | Max 3 spoken sentences per hazard |
| `audio_response_script` | string | Aggregate spoken summary for Polly / browser TTS |

### `POST /api/v1/export/presentation`

**Content-Type:** `application/json` (or `multipart/form-data` when re-attaching source frames)

**Request body (JSON shape):**

```json
{
  "inspection_id": "insp_abc123",
  "site_name": "Tower Crane Pad B",
  "foreman_name": "Alex Rivera",
  "hazards": [],
  "include_narration": true,
  "output_format": "mp4"
}
```

**Response:**

| Field | Type | Description |
| --- | --- | --- |
| `download_url` | string | Temporary URL or path to the generated `.mp4` |
| `duration_seconds` | number | Total narrated runtime (target under 45s for primary script) |
| `jha_pdf_url` | string (optional) | Companion signed JHA PDF if co-generated |
| `status` | string | `ready` / `processing` / `failed` |

Phase 1 may stub this endpoint. Phase 2 compiles frames, animated highlight boxes, and Polly narration via FFmpeg.

---

## Repository Folder Structure

```
sitesafety-copilot/
├── README.md
├── MASTER_PROMPT_CONTEXT.md
├── .cursorrules
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/                 # routers (inspect, export)
│   │   ├── services/            # bedrock, polly, rag, pdf, presentation
│   │   ├── schemas/             # Pydantic v2 contracts
│   │   └── data/
│   │       └── osha_1926/       # Title 29 CFR 1926 source chunks
│   ├── requirements.txt
│   └── ...
└── frontend/
    ├── app/                     # Next.js app router
    ├── components/
    │   ├── InspectionCanvas.tsx
    │   ├── VoiceController.tsx
    │   ├── HazardSidebar.tsx
    │   └── PresentationModal.tsx
    ├── hooks/                   # push-to-talk, inspect, risk score
    ├── package.json
    └── ...
```

---

## Setup Guide

### Prerequisites

- Python 3.11+
- Node.js 20+
- (Phase 2) AWS credentials with Bedrock + Polly access
- (Phase 2) FFmpeg on PATH
- (Phase 2) ChromaDB runtime or Bedrock Knowledge Base

### Backend (Phase 1 mock mode)

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Set `INSPECT_MODE=mock` (default for Phase 1) so the API returns deterministic hazards without AWS keys.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Point the frontend at `http://localhost:8000` via env (for example `NEXT_PUBLIC_API_BASE_URL`).

### Phase 2 live mode

1. Configure AWS credentials and Bedrock model IDs.
2. Ingest `backend/app/data/osha_1926` into ChromaDB.
3. Set `INSPECT_MODE=live`.
4. Verify Polly voices and FFmpeg for export endpoints.

---

## 60-Second Live Demo Script

| Time | Segment | Action |
| --- | --- | --- |
| **0:00-0:08** | **The Hook** | Open SiteSafety Copilot on a dark slate UI. Show a real jobsite photo already loaded. State: "Field foremen get OSHA hazard intelligence from a photo and a voice note in under a minute." |
| **0:08-0:35** | **The Walkthrough Demo** | Hold push-to-talk: "Leading edge looks open on the third floor, no guardrail." Release. Call `POST /api/v1/inspect`. Bounding boxes animate onto `InspectionCanvas` as `HazardSidebar` lists CFR citations and the risk score climbs. Play the spoken OSHA finding back through speakers. |
| **0:35-0:60** | **The JHA / Presentation Export** | Click export. Generate the signed daily JHA PDF, then download the narrated `.mp4` with animated box callouts for the morning toolbox talk. Close on the overall risk score and one corrective action. |

---

## Team Workstreams & Handoffs

| Workstream | Ownership | Status |
| --- | --- | --- |
| **Workstream 1** | Backend API, Pydantic schemas, and contracts. | **DONE (Person 1 + 2)** |
| **Workstream 2** | React spatial inspection canvas, voice STT, dynamic remediation, multi-view website. | **DONE (Person 2)** |
| **Workstream 3** | Live Amazon Bedrock multimodal vision (Claude 3.5 Sonnet / Nova Pro). | **READY FOR PERSON 3** |
| **Workstream 4** | ChromaDB OSHA 1926 Regulatory RAG vector store. | **READY FOR PERSON 3** |
| **Workstream 5** | Amazon Polly speech synthesis, ReportLab JHA PDF, and FFmpeg presentation export. | **READY FOR PERSON 3** |

> For full execution details and contracts, see **[PHASE_2_HANDOFF_PERSON_3.md](docs/PHASE_2_HANDOFF_PERSON_3.md)**.

---

## License & Hackathon Context

Built for **HackGlobal Theme 2: AI-Powered Smart Assistant**. Internal team documentation and competition submission materials. Align all prompts and citations with `MASTER_PROMPT_CONTEXT.md` and agent behavior with `.cursorrules`.
