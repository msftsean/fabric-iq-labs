# Data Model: Workforce Analytics Dashboard

**Branch**: `001-workforce-dashboard`  
**Date**: 2026-03-29

## Entities

### WorkforceEvent (source record)

The atomic unit of data. One row per employee per shift date.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| EmployeeId | string | Required, format `E###` | Unique employee identifier |
| Date | date | Required, ISO 8601 | Shift date |
| Garage | string | Required, enum: North, South | Depot location |
| ScheduledShiftHours | number | Required, >= 0 | Planned shift length in hours |
| ActualWorkedHours | number | Required, >= 0 | Hours actually worked |
| AbsenceFlag | boolean | Required | Whether employee was absent |
| OvertimeHours | number | Required, >= 0 | Extra hours beyond scheduled |
| TripCancelledFlag | boolean | Required | Whether a trip was cancelled |

**Source**: `data/workforce_events.csv`  
**Boolean coercion**: String values `"true"`, `"1"`, `"yes"`, `"y"` (case-insensitive) → `true`. All other values → `false`.

### KPI (derived aggregate)

Computed on-demand from all WorkforceEvent records. Not stored.

| Field | Type | Derivation |
|-------|------|------------|
| total_records | integer | `COUNT(*)` |
| absence_rate | float | `SUM(AbsenceFlag) / COUNT(*)` |
| overtime_hours | float | `SUM(OvertimeHours)` |
| trip_cancellations | integer | `SUM(TripCancelledFlag)` |
| delivered_vs_plan_hours.scheduled | float | `SUM(ScheduledShiftHours)` |
| delivered_vs_plan_hours.actual | float | `SUM(ActualWorkedHours)` |
| delivered_vs_plan_hours.delta | float | `actual - scheduled` |

### TrendRow (derived grouped aggregate)

Computed on-demand, grouped by Date + optional dimension. Not stored.

| Field | Type | Derivation |
|-------|------|------------|
| Date | string | Group key (formatted YYYY-MM-DD) |
| {dimension} | string | Optional group key (Garage or EmployeeId) |
| absences | integer | `SUM(AbsenceFlag)` per group |
| overtime_hours | float | `SUM(OvertimeHours)` per group |
| cancellations | integer | `SUM(TripCancelledFlag)` per group |
| scheduled | float | `SUM(ScheduledShiftHours)` per group |
| actual | float | `SUM(ActualWorkedHours)` per group |
| delivered_delta | float | `actual - scheduled` per group |

**Grouping dimensions**: `Garage`, `EmployeeId`, `all` (date-only).

### EmbedConfig (runtime configuration)

Not derived from data. Read from environment variables.

| Field | Type | Source |
|-------|------|--------|
| type | string | Constant `"report"` |
| reportId | string | Env var `PBI_REPORT_ID` |
| embedUrl | string | Env var `PBI_EMBED_URL` |

## Relationships

```
WorkforceEvent ──(aggregated by)──▶ KPI (1:1, all records → one KPI object)
WorkforceEvent ──(grouped by)──▶ TrendRow (1:N, grouped by date + dimension)
EmbedConfig ──(independent)──▶ No data relationship
```

## State Transitions

None. All entities are stateless derivations or static configuration.
The system has no write operations, no state mutations, and no lifecycle.
