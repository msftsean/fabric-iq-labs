<!--
  Sync Impact Report
  Version change: 0.0.0 → 1.0.0 (initial ratification)
  Modified principles: N/A (initial)
  Added sections:
    - Core Principles (7): Data Immutability, Stateless Compute,
      User-Owns-Data PBI, Vanilla Frontend, Scoped CORS,
      Lab Reproducibility, Typed Data Coercion
    - Technology Constraints
    - Development Workflow
    - Governance
  Removed sections: None
  Templates requiring updates:
    ✅ .specify/templates/plan-template.md (no changes needed — Constitution Check section is generic)
    ✅ .specify/templates/spec-template.md (no changes needed — requirements section is generic)
    ✅ .specify/templates/tasks-template.md (no changes needed — phase structure is generic)
  Follow-up TODOs: None
-->
# ThinkTransit Fabric IQ Labs Constitution

## Core Principles

### I. Data Immutability & Single Source of Truth

All dashboards, API responses, and calculations MUST source from
`data/workforce_events.csv` as the authoritative dataset. Metrics
MUST be derived via stateless aggregations on-demand. MUST NOT
implement an ORM, maintain denormalized copies, or introduce
secondary data schemas that could diverge from the source CSV.
In production, the Fabric Lakehouse Delta table replaces the CSV
but the single-source-of-truth rule still applies.

### II. Stateless Compute & No Backend Persistence

All API endpoints MUST be stateless functions that load and aggregate
the dataset on each request. MUST NOT cache results server-side,
store intermediate state, or maintain a database backend. Python
with FastAPI MUST be the sole backend runtime. MUST NOT introduce
Node.js, Java, or other server runtimes.

### III. User-Owns-Data Power BI Embedding

Power BI reports MUST be embedded using the User-Owns-Data pattern
exclusively. The server provides embed configuration (`reportId`,
`embedUrl`) from environment variables `PBI_REPORT_ID` and
`PBI_EMBED_URL`. MUST NOT implement service-principal authentication,
application-owns-data patterns, or server-side token generation.
Client-side authentication via MSAL.js / Entra ID only.

### IV. Frontend-as-Vanilla-Appliance

The dashboard MUST be implemented using vanilla HTML5, CSS3
(Grid/Flexbox), and ES6+ JavaScript with no build step, bundler,
or package manager. MUST NOT use React, Vue, Angular, webpack, or
any JavaScript framework. Styling MUST conform to Microsoft Fluent
Design System conventions (Segoe UI, `--primary: #0078d4`). External
libraries (e.g., `powerbi-client`) are permitted via CDN only.

### V. Scoped CORS for Local Development

CORS MUST be enabled explicitly for known frontend origins
(`http://localhost:5500`, `http://127.0.0.1:5500`) in FastAPI
middleware with `allow_credentials=True`. MUST NOT deploy with
`allow_origins=["*"]`. Each environment MUST define its own
origin whitelist.

### VI. Lab Reproducibility & AI-Assisted Workflow

All lab instructions MUST be executable by a new user with only the
prerequisites listed in README.md. The repo MUST include
`.copilot/mcp-config.json` for Copilot CLI + Azure MCP integration.
`.squad/` MUST define role-based work routing (X-Force agents).
Copilot CLI prompts MUST be provided as quoted strings users can
paste directly. MUST NOT require proprietary IDEs or undocumented
setup steps.

### VII. Typed Data Coercion & Strict Boolean Handling

Boolean flags (`AbsenceFlag`, `TripCancelledFlag`) MUST be coerced
from string/int CSV values to Python `bool` via explicit type
mapping accepting `"true"`, `"1"`, `"yes"`, `"y"` case-insensitively.
Dates MUST be parsed using `parse_dates=["Date"]` in `pd.read_csv()`.
MUST NOT assume CSV booleans are already typed. MUST NOT silently
accept or drop invalid values.

## Technology Constraints

- **Backend**: Python 3.10+, FastAPI, pandas. No additional server
  dependencies without a spec-kit specification and constitution review.
- **Frontend**: Vanilla HTML/CSS/JS. `powerbi-client` via CDN for
  embedding. No npm, no bundler, no framework.
- **Data Platform**: Microsoft Fabric (Lakehouse + Power BI). Azure MCP
  for Copilot CLI integration.
- **Auth**: Azure CLI (`az login`) for MCP. Entra ID / MSAL.js for
  Power BI embed. No secrets in source code — env vars only
  (`.env` + `.env.example`).
- **AI Tooling**: Copilot CLI with repo-local MCP config, spec-kit
  for spec-driven development, squad-cli for X-Force agent team.

## Development Workflow

1. **Spec first**: New features go through `/speckit.specify` before
   implementation.
2. **Anvil verification**: Code changes MUST pass the Anvil loop
   (baseline → implement → verify → adversarial review) for Medium
   and Large tasks.
3. **X-Force routing**: Work is routed per `.squad/routing.md` —
   Beast (data), Forge (backend), Storm (frontend), Wolverine
   (review), Cerebro (docs), Xavier (coordination).
4. **Commit hygiene**: Conventional commits (`feat:`, `fix:`, `docs:`,
   `chore:`). Co-authored-by trailer for Copilot-assisted commits.
5. **No broken main**: Every commit on `main` MUST leave the backend
   importable (`python -c "import main"`) and all existing endpoints
   returning 2xx for valid inputs.

## Governance

This constitution supersedes all ad-hoc decisions. Amendments require:

1. A spec-kit specification documenting the proposed change and rationale.
2. Anvil-verified implementation with adversarial review.
3. Version bump following semver:
   - MAJOR: Principle removal or backward-incompatible redefinition.
   - MINOR: New principle or materially expanded guidance.
   - PATCH: Clarifications, wording, non-semantic refinements.
4. Updated `LAST_AMENDED_DATE`.

All PRs and code reviews MUST verify compliance with these principles.

**Version**: 1.0.0 | **Ratified**: 2026-03-29 | **Last Amended**: 2026-03-29
