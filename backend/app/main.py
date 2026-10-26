"""SiteSafety Copilot API entrypoint."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.inspect import router as inspect_router
from app.api.export import router as export_router

app = FastAPI(
    title="SiteSafety Copilot API",
    description=(
        "Multimodal voice-vision OSHA hazard intelligence. "
        "Phase 1: mock inspection. Phase 2: Bedrock + RAG + Polly + exports."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(inspect_router)
app.include_router(export_router)



@app.get("/")
async def root() -> dict[str, str]:
    return {
        "service": "SiteSafety Copilot",
        "docs": "/docs",
        "inspect": "POST /api/v1/inspect",
        "health": "GET /api/v1/health",
    }
