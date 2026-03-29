# Implementation Plan: Workforce Analytics Dashboard

**Branch**: `001-workforce-dashboard` | **Date**: 2026-03-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-workforce-dashboard/spec.md`

## Summary

Build a workforce analytics dashboard for transit operations managers.
The backend serves KPIs and trend data from a CSV dataset via a stateless
API. The frontend displays KPI cards, a trend table with dimension
switching, and an embedded Power BI report (User-Owns-Data). All metrics
are derived on-demand from the canonical workforce events dataset.

## Technical Context

**Language/Version**: Python 3.10+  
**Primary Dependencies**: FastAPI, pandas, uvicorn  
**Storage**: CSV file (`data/workforce_events.csv`), no database  
**Testing**: pytest (to be added), manual smoke via TestClient  
**Target Platform**: Windows/Linux/macOS local dev, browser dashboard  
**Project Type**: Web application (API + static frontend)  
**Performance Goals**: KPI response < 500ms, page load < 2s  
**Constraints**: No server-side caching, no ORM, no npm/bundler  
**Scale/Scope**: Single-page dashboard, 5 API endpoints, 7-row seed CSV

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Data Immutability & Single Source of Truth | ✅ Pass | All metrics derived from CSV on-demand via `load_df()` |
| II. Stateless Compute & No Backend Persistence | ✅ Pass | Endpoints load CSV per request, no caching |
| III. User-Owns-Data Power BI Embedding | ✅ Pass | `/pbi/config` serves env vars only, no server-side tokens |
| IV. Frontend-as-Vanilla-Appliance | ✅ Pass | Vanilla HTML/CSS/JS, no build tools |
| V. Scoped CORS for Local Development | ✅ Pass | Origin whitelist for localhost:5500 |
| VI. Lab Reproducibility & AI-Assisted Workflow | ✅ Pass | README has full setup instructions, MCP config present |
| VII. Typed Data Coercion & Strict Boolean Handling | ✅ Pass | Boolean `.isin()` coercion in `load_df()` |

All gates pass. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-workforce-dashboard/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
app/
├── backend/
│   ├── main.py           # FastAPI app (KPIs, trends, PBI config)
│   ├── requirements.txt  # Python dependencies
│   └── .env.example      # PBI embed env var template
└── frontend/
    ├── index.html         # Dashboard page
    ├── style.css          # Fluent-inspired styling
    └── app.js             # KPI/trend/PBI embed logic

data/
└── workforce_events.csv  # Seed dataset (7 records)

prompts/
└── copilot-cli-runbook.md # Copilot CLI lab runbook
```

**Structure Decision**: Web application layout matching the existing repo
structure. Backend and frontend are co-located under `app/` with a shared
`data/` directory at the repo root. No `src/` or `tests/` directories at
root — the project is flat by design per Constitution Principle IV.

## Complexity Tracking

No constitution violations. Table intentionally empty.
