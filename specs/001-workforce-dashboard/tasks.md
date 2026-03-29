# Tasks: Workforce Analytics Dashboard

**Input**: Design documents from `/specs/001-workforce-dashboard/`
**Prerequisites**: plan.md (required), spec.md (required), research.md,
data-model.md, contracts/api.md, quickstart.md

**Tests**: Not explicitly requested in the specification. Test tasks
included as optional for smoke verification only.

**Organization**: Tasks grouped by user story for independent
implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3)
- File paths are relative to repository root

## Path Conventions

- **Backend**: `app/backend/`
- **Frontend**: `app/frontend/`
- **Data**: `data/`
- **Specs**: `specs/001-workforce-dashboard/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [ ] T001 Create Python virtual environment in `app/backend/.venv`
- [ ] T002 Install dependencies from `app/backend/requirements.txt`
- [ ] T003 [P] Copy `app/backend/.env.example` to `app/backend/.env`
- [ ] T004 [P] Verify `data/workforce_events.csv` has correct schema (8 columns, 7 data rows)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data loading and API framework that ALL user stories
depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is
complete

- [ ] T005 Implement `load_df()` in `app/backend/main.py` with CSV loading, date parsing, and boolean coercion per Constitution Principle VII
- [ ] T006 Configure FastAPI app with CORS middleware for localhost:5500 in `app/backend/main.py` per Constitution Principle V
- [ ] T007 Implement `GET /health` endpoint in `app/backend/main.py`
- [ ] T008 [P] Create base HTML structure with KPI grid, trend section, and PBI embed container in `app/frontend/index.html`
- [ ] T009 [P] Create Fluent-inspired stylesheet with CSS custom properties in `app/frontend/style.css`

**Checkpoint**: Backend starts, `/health` returns `{"ok": true}`,
frontend loads with empty containers

---

## Phase 3: User Story 1 - View Workforce KPIs (Priority: P1) 🎯 MVP

**Goal**: Display aggregate KPIs (absence rate, overtime, cancellations,
delivered delta) on the dashboard

**Independent Test**: `GET /kpis` returns correct values; KPI cards
render in browser

### Implementation for User Story 1

- [ ] T010 [US1] Implement `GET /kpis` endpoint in `app/backend/main.py` returning total_records, absence_rate, overtime_hours, trip_cancellations, delivered_vs_plan_hours per `contracts/api.md`
- [ ] T011 [US1] Implement `GET /api/data/events` endpoint in `app/backend/main.py` returning full dataset as JSON array
- [ ] T012 [US1] Implement `loadKpis()` in `app/frontend/app.js` to fetch `/kpis` and populate KPI cards
- [ ] T013 [US1] Add number formatting helpers (`fmtPct`, `fmtNum`) in `app/frontend/app.js`

**Checkpoint**: KPI cards display correct values matching manual CSV
calculations. SC-001 met (manager sees KPIs within 5 seconds).

---

## Phase 4: User Story 2 - Explore Trends by Dimension (Priority: P2)

**Goal**: Allow trend exploration grouped by Garage, EmployeeId, or All

**Independent Test**: `GET /trend?by=Garage` returns grouped rows;
dropdown switches dimensions in browser

### Implementation for User Story 2

- [ ] T014 [US2] Implement `GET /trend` endpoint in `app/backend/main.py` with `by` parameter validation (Garage, EmployeeId, all) and groupby aggregation per `contracts/api.md`
- [ ] T015 [US2] Implement `loadTrend()` in `app/frontend/app.js` to fetch `/trend?by={dim}` and render trend table
- [ ] T016 [US2] Wire groupBy dropdown change event and refresh button in `app/frontend/app.js`

**Checkpoint**: Trend table updates when dimension changes. SC-002 met
(dimension switch < 3 seconds).

---

## Phase 5: User Story 3 - Embedded Power BI Report (Priority: P3)

**Goal**: Embed a Power BI report using User-Owns-Data pattern

**Independent Test**: `GET /pbi/config` returns embed metadata when env
vars set; embed container renders report with valid credentials

### Implementation for User Story 3

- [ ] T017 [US3] Implement `GET /pbi/config` endpoint in `app/backend/main.py` reading PBI_REPORT_ID and PBI_EMBED_URL from env vars per Constitution Principle III
- [ ] T018 [US3] Implement `loadPowerBI()` in `app/frontend/app.js` to fetch `/pbi/config` and configure embed container
- [ ] T019 [US3] Add `powerbi-client` CDN script tag to `app/frontend/index.html` for embed rendering
- [ ] T020 [US3] Handle graceful fallback in `app/frontend/app.js` when `/pbi/config` returns 400 (env vars not set)

**Checkpoint**: PBI report renders when configured; graceful message
when not. SC-005 met (dashboard works without PBI config).

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, validation, and quality improvements

- [ ] T021 [P] Update `README.md` with complete project structure and all setup instructions
- [ ] T022 [P] Create `prompts/copilot-cli-runbook.md` with Copilot CLI lab prompts
- [ ] T023 Verify all 5 endpoints return correct responses per `contracts/api.md`
- [ ] T024 Verify frontend loads and displays KPIs + trends without errors in browser console
- [ ] T025 [P] Run quickstart.md end-to-end to validate SC-003 (new user setup < 5 minutes)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all
  user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase
  - US1 (KPIs): Can start after Phase 2
  - US2 (Trends): Can start after Phase 2 (independent of US1)
  - US3 (PBI Embed): Can start after Phase 2 (independent of US1/US2)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Independent — no dependencies on other stories
- **US2 (P2)**: Independent — no dependencies on other stories
- **US3 (P3)**: Independent — no dependencies on other stories

### Within Each User Story

- Backend endpoint before frontend consumer
- Core implementation before integration
- Commit after each task or logical group

### Parallel Opportunities

- T003 + T004 (setup tasks on different files)
- T008 + T009 (frontend HTML + CSS)
- US1, US2, US3 can all proceed in parallel after Phase 2
- T021 + T022 + T025 (documentation + validation)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (KPIs)
4. **STOP and VALIDATE**: KPI cards show correct values
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → KPIs visible → Demo (MVP!)
3. Add User Story 2 → Trends explorable → Demo
4. Add User Story 3 → PBI embedded → Demo
5. Polish → Documentation + validation → Release

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All 3 user stories share `load_df()` from Foundational phase
