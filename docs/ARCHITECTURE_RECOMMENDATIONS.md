# Architecture Recommendations & Phase Transition Guide

This document captures architecture recommendations derived from code analysis, domain contracts, and Graphify knowledge graph audits. Use this as a checklist for Phase 1 polish and Phase 2 expansion.

---

## 1. Domain Contract Enforcement (`box_2d` & OSHA Standards)
- **Status**: Implemented in Phase 1.
- **Contract Rules**:
  - `box_2d`: Exact format `[ymin, xmin, ymax, xmax]` as integers `0–1000`.
  - Backend validation (Pydantic v2): Exactly 4 ints, `0 <= ymin < ymax <= 1000`, `0 <= xmin < xmax <= 1000`.
  - Frontend conversion: `top = ymin/10%`, `left = xmin/10%`, `height = (ymax - ymin)/10%`, `width = (xmax - xmin)/10%`. Never use pixels.
- **Recommendation**:
  - Run automated unit tests in both backend (`pytest`) and frontend (`vitest`) verifying the canonical example `[120, 340, 680, 810] -> top: 12%, left: 34%, height: 56%, width: 47%`.
  - Ensure any future Bedrock vision prompt explicitly constrains model output to this exact schema.

---

## 2. Hazard Schemas & Risk Calculation
- **Location**: `backend/app/schemas/hazard_schema.py`
- **Current State**:
  - Unified ~116-line module defining `Severity`, `Hazard`, `InspectResponse`, and risk scoring algorithms (`compute_overall_risk_score`, `risk_level_from_score`).
- **Phase 1 Recommendation**:
  - **Keep unified**. Cohesion is appropriate for the current feature set. Avoid premature micro-module splitting.
- **Phase 2 Expansion Trigger**:
  - When Bedrock RAG context weights, dynamic OSHA penalty factors, or multi-modal fusion scoring are introduced, refactor into:
    - `backend/app/schemas/hazard.py` (Pydantic data models & validators)
    - `backend/app/services/risk_calculator.py` (scoring engine & algorithms)

---

## 3. FastAPI Endpoint Routing & Modularity
- **Location**: `backend/app/api/inspect.py`
- **Current State**:
  - Contains `GET /health` and `POST /api/v1/inspect`.
- **Phase 1 Recommendation**:
  - Keep single router; unblocks frontend person 2 without complex sub-router overhead.
- **Phase 2 Modular Routing**:
  - Split into domain-specific routers mounted under `app.main.py`:
    - `backend/app/api/health.py`: Liveness, readiness, and Bedrock/AWS credential health checks.
    - `backend/app/api/inspect.py`: Multimodal inspection (`POST /api/v1/inspect`).
    - `backend/app/api/export.py`: JHA PDF generator (ReportLab/WeasyPrint) & video presentation export (FFmpeg).
    - `backend/app/api/speech.py`: Amazon Polly audio narration streaming and transcript synchronization.

---

## 4. Frontend Component & State Architecture
- **Location**: `frontend/src/`
- **Current State**:
  - Next.js 16 (App Router) + React 19 + Tailwind CSS 4.
  - State managed cleanly in `src/app/page.tsx` passing props to `InspectionCanvas`, `HazardSidebar`, and `RiskSummary`.
- **Recommendation**:
  - Retain component decoupling. Ensure bidirectional selection between `InspectionCanvas` bounding box clicks and `HazardSidebar` item expansion.
  - When Person 3 introduces audio playback and JHA modal exports, isolate them into:
    - `src/components/AudioNarrationPlayer.tsx`
    - `src/components/PresentationModal.tsx`
