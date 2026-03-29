# Research: Workforce Analytics Dashboard

**Branch**: `001-workforce-dashboard`  
**Date**: 2026-03-29  
**Status**: Complete — no unresolved clarifications

## Technology Decisions

### Backend Framework

- **Decision**: FastAPI with uvicorn
- **Rationale**: Already in use in `app/backend/main.py`. Lightweight,
  async-capable, auto-generates OpenAPI docs at `/docs`. Aligns with
  Constitution Principle II (stateless compute).
- **Alternatives considered**: Flask (no auto-docs, no async), Django
  (too heavy for a stateless CSV API).

### Data Processing

- **Decision**: pandas for CSV loading and aggregation
- **Rationale**: Already in use. Handles CSV parsing, date coercion,
  boolean coercion, and groupby aggregations in a few lines. Aligns
  with Constitution Principle I (single source of truth).
- **Alternatives considered**: Built-in csv module (no aggregation
  support), polars (unnecessary dependency change for 7 rows).

### Frontend Approach

- **Decision**: Vanilla HTML/CSS/JS with no build tools
- **Rationale**: Constitution Principle IV mandates no frameworks or
  bundlers. Current implementation uses `fetch()` for API calls and
  DOM manipulation for rendering. Served via `python -m http.server`.
- **Alternatives considered**: None — constitution prohibits frameworks.

### Power BI Embedding

- **Decision**: User-Owns-Data via `/pbi/config` endpoint
- **Rationale**: Constitution Principle III mandates UOD pattern. Server
  provides `reportId` and `embedUrl` from env vars. Client-side MSAL.js
  handles authentication. No server-side token generation.
- **Alternatives considered**: App-Owns-Data (prohibited by constitution).

### Data Storage

- **Decision**: CSV file at `data/workforce_events.csv`, loaded per request
- **Rationale**: Constitution Principle II prohibits caching or persistence.
  The CSV is the development seed; production uses Fabric Lakehouse Delta
  tables (same schema, different transport).
- **Alternatives considered**: SQLite (would violate "no database" constraint).

### Testing Strategy

- **Decision**: pytest with FastAPI TestClient for endpoint verification
- **Rationale**: Standard Python testing. TestClient enables testing
  endpoints without starting a server. No test infrastructure exists
  yet — to be added in implementation.
- **Alternatives considered**: unittest (less ergonomic with FastAPI),
  httpx (TestClient already wraps it).

## Open Questions

None. All technical decisions are determined by the existing codebase
and constitution constraints.
