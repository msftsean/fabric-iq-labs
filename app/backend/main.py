"""ThinkTransit Workforce Dashboard — FastAPI Backend."""

import os
from pathlib import Path

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="ThinkTransit Workforce Signals API", version="1.0")

_origins = ["http://localhost:5500", "http://127.0.0.1:5500"]
if os.getenv("ALLOWED_ORIGINS"):
    _origins += [o.strip() for o in os.getenv("ALLOWED_ORIGINS").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_data_env = os.getenv("DATA_DIR", "")
if _data_env:
    DATA_DIR = Path(_data_env)
elif (Path(__file__).resolve().parent / "data").is_dir():
    DATA_DIR = Path(__file__).resolve().parent / "data"
else:
    DATA_DIR = Path(__file__).resolve().parents[2] / "data"
CSV_PATH = DATA_DIR / "workforce_events.csv"


def load_df() -> pd.DataFrame:
    if not CSV_PATH.exists():
        raise HTTPException(status_code=500, detail="workforce_events.csv not found")
    df = pd.read_csv(CSV_PATH, parse_dates=["Date"])
    for col in ["AbsenceFlag", "TripCancelledFlag"]:
        if df[col].dtype == object:
            df[col] = df[col].astype(str).str.lower().isin(["true", "1", "yes", "y"])
    return df


# ── Core Endpoints ───────────────────────────────────────────────────────────


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/kpis")
def kpis():
    """High-level workforce KPIs with derived metrics."""
    df = load_df()
    total = len(df)
    absences = int(df["AbsenceFlag"].sum())
    cancels = int(df["TripCancelledFlag"].sum())
    ot = float(df["OvertimeHours"].sum())
    scheduled = float(df["ScheduledShiftHours"].sum())
    actual = float(df["ActualWorkedHours"].sum())

    return {
        "total_records": total,
        "absence_rate": (absences / total) if total else 0.0,
        "overtime_hours": ot,
        "trip_cancellations": cancels,
        "delivered_vs_plan_hours": {
            "scheduled": scheduled,
            "actual": actual,
            "delta": actual - scheduled,
        },
    }


@app.get("/trend")
def trend(by: str = "Garage"):
    """Trend data grouped by date and an optional dimension."""
    valid_dims = {"garage", "employeeid", "all"}
    if by.lower() not in valid_dims:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid 'by' value: '{by}'. Must be one of: Garage, EmployeeId, all",
        )
    df = load_df()
    group_cols = ["Date"] + ([] if by.lower() == "all" else [by])
    g = (
        df.groupby(group_cols)
        .agg(
            absences=("AbsenceFlag", "sum"),
            overtime_hours=("OvertimeHours", "sum"),
            cancellations=("TripCancelledFlag", "sum"),
            scheduled=("ScheduledShiftHours", "sum"),
            actual=("ActualWorkedHours", "sum"),
        )
        .reset_index()
    )
    g["delivered_delta"] = g["actual"] - g["scheduled"]
    g["Date"] = g["Date"].dt.strftime("%Y-%m-%d")
    return {"rows": g.to_dict(orient="records")}


@app.get("/api/data/events")
def all_events():
    """Return the full workforce events dataset."""
    df = load_df()
    df["Date"] = df["Date"].dt.strftime("%Y-%m-%d")
    return df.to_dict(orient="records")


# ── Power BI User-Owns-Data Config ───────────────────────────────────────────


@app.get("/pbi/config")
def pbi_config():
    """Return embed metadata for user-owns-data Power BI embedding."""
    report_id = os.getenv("PBI_REPORT_ID")
    embed_url = os.getenv("PBI_EMBED_URL")

    if not report_id or not embed_url:
        raise HTTPException(
            status_code=400,
            detail="Missing PBI_REPORT_ID or PBI_EMBED_URL env vars",
        )

    return {"type": "report", "reportId": report_id, "embedUrl": embed_url}
