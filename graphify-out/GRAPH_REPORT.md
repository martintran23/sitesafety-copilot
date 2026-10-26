# Graph Report - sitesafety-copilot  (2026-10-25)

## Corpus Check
- Corpus is ~7,697 words - fits in a single context window. You may not need a graph.

## Summary
- 155 nodes · 218 edges · 25 communities (7 shown, 18 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Hazard Schemas & Risk Scoring
- Frontend UI & Canvas
- Linting & Dev Dependencies
- FastAPI Inspect Endpoints
- TypeScript Compiler Options
- Next.js App Runtime
- NPM Lifecycle Scripts
- OSHA & Spatial Contract
- Agent Rules & Workflow
- Audio Narration Guidelines
- OSHA Citations Skill Guide
- Inspection Test Fixtures
- Backend Python Requirements
- Next.js Agent Guidelines
- Static Assets: File SVG
- Static Assets: Globe SVG
- Static Assets: Next SVG
- Static Assets: Vercel SVG
- Static Assets: Window SVG
- Frontend Documentation
- Master Prompt Context
- Project Root Documentation

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `run_mock_inspection()` - 9 edges
3. `Hazard` - 8 edges
4. `InspectResponse` - 8 edges
5. `inspect()` - 7 edges
6. `Severity` - 7 edges
7. `compute_overall_risk_score()` - 7 edges
8. `Home()` - 7 edges
9. `_transcript_boosted_hazards()` - 6 edges
10. `RiskLevel` - 5 edges

## Surprising Connections (you probably didn't know these)
- `inspect()` --uses--> `InspectResponse`  [INFERRED]
  backend/app/api/inspect.py → backend/app/schemas/hazard_schema.py
- `inspect()` --calls--> `run_mock_inspection()`  [EXTRACTED]
  backend/app/api/inspect.py → backend/app/services/mock_hazard_service.py
- `_base_hazards()` --uses--> `Severity`  [INFERRED]
  backend/app/services/mock_hazard_service.py → backend/app/schemas/hazard_schema.py
- `_transcript_boosted_hazards()` --uses--> `Severity`  [INFERRED]
  backend/app/services/mock_hazard_service.py → backend/app/schemas/hazard_schema.py
- `Props` --references--> `Hazard`  [EXTRACTED]
  frontend/src/components/HazardSidebar.tsx → frontend/src/lib/types.ts

## Import Cycles
- None detected.

## Communities (25 total, 18 thin omitted)

### Community 0 - "Hazard Schemas & Risk Scoring"
Cohesion: 0.15
Nodes (10): compute_overall_risk_score(), Hazard, InspectResponse, risk_level_from_score(), RiskLevel, Severity, _base_hazards(), run_mock_inspection() (+2 more)

### Community 1 - "Frontend UI & Canvas"
Cohesion: 0.19
Nodes (15): Home(), runInspection(), HazardSidebar(), Props, InspectionCanvas(), Props, RiskSummary(), inspectImage() (+7 more)

### Community 2 - "Linting & Dev Dependencies"
Cohesion: 0.12
Nodes (21): eslintConfig, devDependencies, eslint@^9, eslint-config-next@16.4.3, tailwindcss@^4, @tailwindcss/turbopack@^4, @types/node@^20, @types/react@^19 (+13 more)

### Community 3 - "FastAPI Inspect Endpoints"
Cohesion: 0.14
Nodes (5): _default_mode(), health(), inspect(), root(), run_live_inspection()

### Community 4 - "TypeScript Compiler Options"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 5 - "Next.js App Runtime"
Cohesion: 0.13
Nodes (11): nextConfig, dependencies, next@16.4.3, react@19.3.0, react-dom@19.3.0, geistMono, geistSans, metadata (+3 more)

### Community 6 - "NPM Lifecycle Scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

## Knowledge Gaps
- **16 isolated node(s):** `SiteSafety Copilot Rules`, `Box 2D Spatial Contract`, `OSHA 1926 Safety Standards`, `Audio Narration Script Guidelines`, `OSHA Citations Skill Guide` (+11 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 70 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Next.js App Runtime` to `Frontend UI & Canvas`, `Linting & Dev Dependencies`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **What connects `SiteSafety Copilot Rules`, `Box 2D Spatial Contract`, `OSHA 1926 Safety Standards` to the rest of the system?**
  _16 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Hazard Schemas & Risk Scoring` be split into smaller, more focused modules?**
  _Cohesion score 0.14814814814814814 - nodes in this community are weakly interconnected._
- **Why does `next` connect `Next.js App Runtime` to `Linting & Dev Dependencies`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Should `Linting & Dev Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.1225296442687747 - nodes in this community are weakly interconnected._
- **Should `FastAPI Inspect Endpoints` be split into smaller, more focused modules?**
  _Cohesion score 0.1368421052631579 - nodes in this community are weakly interconnected._
- **Should `TypeScript Compiler Options` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._