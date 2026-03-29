# API Contracts: Workforce Analytics Dashboard

**Branch**: `001-workforce-dashboard`  
**Date**: 2026-03-29  
**Base URL**: `http://localhost:8000`

## GET /health

Health check endpoint.

**Response** `200 OK`:
```json
{
  "ok": true
}
```

---

## GET /kpis

Returns aggregate workforce KPIs derived from the full dataset.

**Response** `200 OK`:
```json
{
  "total_records": 7,
  "absence_rate": 0.14285714285714285,
  "overtime_hours": 10.0,
  "trip_cancellations": 2,
  "delivered_vs_plan_hours": {
    "scheduled": 56.0,
    "actual": 58.0,
    "delta": 2.0
  }
}
```

**Error** `500 Internal Server Error` (CSV missing):
```json
{
  "detail": "workforce_events.csv not found"
}
```

---

## GET /trend

Returns trend data grouped by date and an optional dimension.

**Query Parameters**:

| Parameter | Type | Default | Valid Values |
|-----------|------|---------|--------------|
| by | string | `Garage` | `Garage`, `EmployeeId`, `all` (case-insensitive) |

**Response** `200 OK` (by=Garage):
```json
{
  "rows": [
    {
      "Date": "2026-03-01",
      "Garage": "North",
      "absences": 0,
      "overtime_hours": 2,
      "cancellations": 0,
      "scheduled": 16.0,
      "actual": 18.0,
      "delivered_delta": 2.0
    }
  ]
}
```

**Response** `200 OK` (by=all):
```json
{
  "rows": [
    {
      "Date": "2026-03-01",
      "absences": 1,
      "overtime_hours": 2,
      "cancellations": 1,
      "scheduled": 24.0,
      "actual": 18.0,
      "delivered_delta": -6.0
    }
  ]
}
```

**Error** `400 Bad Request` (invalid dimension):
```json
{
  "detail": "Invalid 'by' value: 'InvalidValue'. Must be one of: Garage, EmployeeId, all"
}
```

---

## GET /api/data/events

Returns the full workforce events dataset as JSON array.

**Response** `200 OK`:
```json
[
  {
    "EmployeeId": "E101",
    "Date": "2026-03-01",
    "Garage": "North",
    "ScheduledShiftHours": 8,
    "ActualWorkedHours": 8,
    "AbsenceFlag": false,
    "OvertimeHours": 0,
    "TripCancelledFlag": false
  }
]
```

---

## GET /pbi/config

Returns Power BI embed configuration for User-Owns-Data embedding.

**Response** `200 OK`:
```json
{
  "type": "report",
  "reportId": "<from PBI_REPORT_ID env var>",
  "embedUrl": "<from PBI_EMBED_URL env var>"
}
```

**Error** `400 Bad Request` (env vars missing):
```json
{
  "detail": "Missing PBI_REPORT_ID or PBI_EMBED_URL env vars"
}
```
