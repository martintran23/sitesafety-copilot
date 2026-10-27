# Graph Report - sitesafety-copilot  (2026-10-26)

## Corpus Check
- 42 files · ~24,687 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 307 nodes · 556 edges · 38 communities (11 shown, 27 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Inspector Application & State Orchestration
- Landing Page & Live Vision Demo Scenes
- Frontend Dependencies & Tooling
- Inspection Canvas & UI Component System
- FastAPI Presentation & JHA Export Service
- OSHA Hazard Schemas & Risk Calculation
- TypeScript Configuration & Compilation
- Backend Schema & Validation Unit Tests
- FastAPI Inspect & Health Endpoint Tests
- Layout, Typography & Global Styles
- Voice Assistant & Audio Walkthrough
- Spatial Contracts & Regulatory Specs
- Agent Rules & Safety Constraints
- Audio Narration Script Guidelines
- OSHA Citations Skill Reference
- Backend Image Fixtures
- Backend Python Requirements
- Backend Dependency Manifest
- ChromaDB OSHA 1926 RAG Pipeline
- FFmpeg Video Presentation Compiler
- ReportLab JHA PDF Generator
- Frontend Architecture Guidelines
- Static Icon Assets
- Brand Globe Asset
- Next.js Framework Logo
- Scaffold Inspection Diagram Preset
- Trench Excavation Diagram Preset
- Vercel Platform Branding
- Window Layout Graphic
- Frontend Documentation
- Master Prompt & Inference Context
- SiteSafety Copilot Architecture
- Root Project Documentation

## God Nodes (most connected - your core abstractions)
1. `Home()` - 22 edges
2. `compilerOptions` - 17 edges
3. `Hazard` - 13 edges
4. `react` - 12 edges
5. `HazardSidebar()` - 12 edges
6. `VoiceAssistantBar()` - 11 edges
7. `LandingPage()` - 10 edges
8. `Hazard` - 9 edges
9. `next` - 9 edges
10. `ShieldAlertIcon()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Domain Contract Enforcement & box_2d` --rationale_for--> `Hazard`  [EXTRACTED]
  docs/ARCHITECTURE_RECOMMENDATIONS.md → backend/app/schemas/hazard_schema.py
- `API Data Contracts Spec` --references--> `InspectResponse`  [EXTRACTED]
  README.md → backend/app/schemas/hazard_schema.py
- `Phase 2 Live AWS & Production Pipeline Handoff` --references--> `run_live_inspection()`  [EXTRACTED]
  docs/PHASE_2_HANDOFF_PERSON_3.md → backend/app/services/live_hazard_service.py
- `Upper Deck Leading Edge Demo Scene` --conceptually_related_to--> `DEMO_SCENES`  [INFERRED]
  frontend/public/demo/leading-edge.jpg → frontend/src/lib/demoScenes.ts
- `Jobsite Scaffold Inspection Demo Scene` --conceptually_related_to--> `DEMO_SCENES`  [INFERRED]
  frontend/public/demo/scaffold.jpg → frontend/src/lib/demoScenes.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Phase 2 Production Pipeline Workstreams** — docs_phase_2_handoff_person_3_bedrock_multimodal, docs_phase_2_handoff_person_3_chromadb_rag, docs_phase_2_handoff_person_3_reportlab_pdf, docs_phase_2_handoff_person_3_ffmpeg_export [EXTRACTED 1.00]

## Communities (38 total, 27 thin omitted)

### Community 0 - "Inspector Application & State Orchestration"
Cohesion: 0.09
Nodes (32): Home(), runInspection(), ArchitectureSpecsView(), Footer(), HazardSidebar(), CheckCircleIcon(), CrosshairIcon(), DocumentCheckIcon() (+24 more)

### Community 1 - "Landing Page & Live Vision Demo Scenes"
Cohesion: 0.12
Nodes (25): nextConfig, Upper Deck Leading Edge Demo Scene, Jobsite Scaffold Inspection Demo Scene, Utility Trench & Spoil Pile Demo Scene, LandingPage(), metadata, HardHatIcon(), InspectionCanvas() (+17 more)

### Community 2 - "Frontend Dependencies & Tooling"
Cohesion: 0.07
Nodes (33): eslintConfig, dependencies, next@16.4.3, react@19.3.0, react-dom@19.3.0, devDependencies, eslint@^9, eslint-config-next@16.4.3 (+25 more)

### Community 3 - "Inspection Canvas & UI Component System"
Cohesion: 0.12
Nodes (24): Props, PrinterIcon(), VideoCameraIcon(), Props, PresentationModal(), handleExportVideo(), Props, exportPresentation() (+16 more)

### Community 4 - "FastAPI Presentation & JHA Export Service"
Cohesion: 0.08
Nodes (11): export_presentation(), ExportPresentationRequest, ExportPresentationResponse, _default_mode(), health(), inspect(), root(), run_live_inspection() (+3 more)

### Community 5 - "OSHA Hazard Schemas & Risk Calculation"
Cohesion: 0.15
Nodes (11): compute_overall_risk_score(), Hazard, InspectResponse, risk_level_from_score(), RiskLevel, Severity, _base_hazards(), run_mock_inspection() (+3 more)

### Community 6 - "TypeScript Configuration & Compilation"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 7 - "Backend Schema & Validation Unit Tests"
Cohesion: 0.18
Nodes (5): test_box_2d_order_validation(), test_box_2d_range_and_length_validation(), test_risk_scoring_and_level_mapping(), test_severity_weight_range_validation(), test_valid_box_2d_and_hazard()

### Community 8 - "FastAPI Inspect & Health Endpoint Tests"
Cohesion: 0.15
Nodes (5): test_export_presentation_stub(), test_health_check(), test_inspect_live_mode_returns_501(), test_inspect_mock_mode_default(), test_inspect_mock_mode_with_transcript()

### Community 9 - "Layout, Typography & Global Styles"
Cohesion: 0.33
Nodes (3): geistMono, geistSans, metadata

### Community 10 - "Voice Assistant & Audio Walkthrough"
Cohesion: 0.60
Nodes (5): VoiceAssistantBar(), playTourStep(), speakAssistantScript(), startWalkthroughTour(), stopTour()

## Knowledge Gaps
- **30 isolated node(s):** `SiteSafety Copilot Rules`, `Audio Narration Script Guidelines`, `OSHA Citations Skill Guide`, `Static Asset: tiny.png`, `Next.js Agent Guidelines` (+25 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 130 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Inspector Application & State Orchestration` to `Landing Page & Live Vision Demo Scenes`, `Frontend Dependencies & Tooling`, `Inspection Canvas & UI Component System`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **What connects `SiteSafety Copilot Rules`, `Audio Narration Script Guidelines`, `OSHA Citations Skill Guide` to the rest of the system?**
  _30 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Inspector Application & State Orchestration` be split into smaller, more focused modules?**
  _Cohesion score 0.08823529411764706 - nodes in this community are weakly interconnected._
- **Why does `next` connect `Landing Page & Live Vision Demo Scenes` to `Inspector Application & State Orchestration`, `Layout, Typography & Global Styles`, `Frontend Dependencies & Tooling`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Should `Landing Page & Live Vision Demo Scenes` be split into smaller, more focused modules?**
  _Cohesion score 0.11587301587301588 - nodes in this community are weakly interconnected._
- **Why does `Home()` connect `Inspector Application & State Orchestration` to `Landing Page & Live Vision Demo Scenes`, `Voice Assistant & Audio Walkthrough`, `Inspection Canvas & UI Component System`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Should `Frontend Dependencies & Tooling` be split into smaller, more focused modules?**
  _Cohesion score 0.07394957983193277 - nodes in this community are weakly interconnected._