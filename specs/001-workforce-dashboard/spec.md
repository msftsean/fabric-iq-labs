# Feature Specification: Workforce Analytics Dashboard

**Feature Branch**: `001-workforce-dashboard`  
**Created**: 2026-03-29  
**Status**: Draft  
**Input**: User description: "Workforce analytics dashboard with KPIs, trends, and embedded Power BI for transit operations"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Workforce KPIs at a Glance (Priority: P1)

A transit operations manager opens the dashboard and immediately sees
high-level workforce signals: absence rate, total overtime hours, trip
cancellations, and the delta between scheduled and actual hours worked.
These KPIs are derived from the canonical workforce events dataset.

**Why this priority**: This is the core value proposition. If a manager
cannot see aggregate KPIs at a glance, no other feature matters.

**Independent Test**: Can be fully tested by opening the dashboard page
and verifying KPI cards display correct values matching manual
calculations against the seed dataset.

**Acceptance Scenarios**:

1. **Given** the dataset contains 7 shift records with 1 absence,
   **When** the manager opens the dashboard,
   **Then** the absence rate card displays approximately 14.3%.

2. **Given** the dataset contains overtime hours totaling 10,
   **When** the manager views the KPI panel,
   **Then** the overtime hours card displays 10.0.

3. **Given** the dataset contains 2 trip cancellations,
   **When** the manager views the KPI panel,
   **Then** the trip cancellations card displays 2.

4. **Given** the dataset has scheduled=56 and actual=58 total hours,
   **When** the manager views the KPI panel,
   **Then** the delivered-vs-plan delta card displays +2.0.

---

### User Story 2 - Explore Trends by Dimension (Priority: P2)

The operations manager drills into trends by selecting a grouping
dimension (Garage, Employee, or All) and sees daily breakdowns of
absences, overtime, cancellations, and the delivered-vs-plan delta
in a tabular view.

**Why this priority**: After seeing aggregate KPIs, the natural next
question is "where is this happening?" Trend breakdowns answer that.

**Independent Test**: Can be tested by selecting each grouping option
and verifying the trend table shows correct per-group, per-date
aggregations matching manual calculations.

**Acceptance Scenarios**:

1. **Given** the manager selects "Garage" as the grouping dimension,
   **When** the trend data loads,
   **Then** rows are grouped by Date + Garage with correct aggregates
   per combination.

2. **Given** the manager selects "All" as the grouping dimension,
   **When** the trend data loads,
   **Then** rows are grouped by Date only with no dimension column.

3. **Given** the manager selects an invalid grouping value,
   **When** the request is sent,
   **Then** the system returns a clear error listing valid options.

---

### User Story 3 - View Embedded Power BI Report (Priority: P3)

The operations manager sees an embedded Power BI report alongside
the KPI cards, authenticated with their own organizational credentials
(User-Owns-Data). The report is built from the same dataset in the
Fabric Lakehouse semantic model.

**Why this priority**: This is the full Fabric IQ experience, but it
depends on Azure infrastructure and Power BI configuration, making it
the last mile.

**Independent Test**: Can be tested by configuring the embed
parameters, loading the dashboard, and verifying the Power BI report
renders in the designated container area.

**Acceptance Scenarios**:

1. **Given** the embed configuration is set with valid report ID and
   embed URL, **When** the dashboard loads,
   **Then** the Power BI report renders in the embed container.

2. **Given** the embed configuration is NOT set,
   **When** the dashboard loads,
   **Then** the embed section shows a graceful message indicating
   configuration is needed.

3. **Given** the user has valid Entra ID credentials,
   **When** the embedded report loads,
   **Then** authentication is handled client-side without server
   involvement.

---

### Edge Cases

- What happens when the workforce events data file is missing?
  The system MUST return a clear error indicating the file was not found.

- What happens when the dataset has zero rows?
  KPIs MUST return zero values; trends MUST return an empty result set.

- What happens when date values are unparseable?
  The system MUST surface the parsing error rather than silently dropping rows.

- What happens when the user provides an unsupported grouping dimension?
  The system MUST return an error listing the valid dimension options.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display aggregate KPIs (absence rate, overtime
  hours, trip cancellations, delivered-vs-plan delta) derived from the
  workforce events dataset.

- **FR-002**: System MUST allow users to view trend data grouped by
  Garage, Employee, or All, with daily breakdowns.

- **FR-003**: System MUST validate the grouping dimension parameter and
  return a descriptive error for invalid values.

- **FR-004**: System MUST provide Power BI embed configuration from
  environment-supplied parameters (report ID, embed URL).

- **FR-005**: System MUST return descriptive errors when the data source
  is missing or misconfigured.

- **FR-006**: System MUST serve all API responses as JSON with
  appropriate HTTP status codes (2xx for success, 4xx for client errors,
  5xx for server errors).

- **FR-007**: System MUST include a health check endpoint that confirms
  operational status.

- **FR-008**: Dashboard MUST render KPI cards, a dimension selector, a
  trend table, and a Power BI embed container.

- **FR-009**: Dashboard MUST function without Power BI configuration —
  KPIs and trends operate independently of the embed feature.

### Key Entities

- **WorkforceEvent**: A single shift record representing one employee's
  work on a given date. Attributes: employee identifier, date, garage
  location, scheduled hours, actual hours, absence flag, overtime hours,
  trip cancelled flag.

- **KPI**: A derived aggregate metric calculated from workforce events.
  Includes absence rate, total overtime hours, trip cancellation count,
  and delivered-vs-plan hours delta.

- **TrendRow**: A grouped aggregation of workforce events by date and an
  optional dimension (garage or employee). Contains per-group totals for
  absences, overtime, cancellations, scheduled hours, actual hours, and
  the delivered delta.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Manager can identify the current absence rate within 5
  seconds of opening the dashboard.

- **SC-002**: Manager can switch between trend dimensions and see updated
  data within 3 seconds.

- **SC-003**: A new user can follow the project documentation to run the
  dashboard locally in under 5 minutes.

- **SC-004**: All KPI values match manual spreadsheet calculations
  against the seed dataset with zero discrepancy.

- **SC-005**: The dashboard remains fully functional (KPIs + trends) even
  when Power BI embed is not configured.

## Assumptions

- Target users are transit operations managers with stable internet
  connectivity and a modern web browser.

- Mobile-responsive layout is out of scope for v1.

- The 7-row seed CSV is sufficient for development and testing;
  production data will be loaded via Microsoft Fabric Lakehouse.

- Power BI embedding requires users to have valid Entra ID credentials
  with access to the Fabric workspace.

- The dashboard is a single-page application with no routing or
  navigation — all content is visible on one page.
