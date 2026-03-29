# ThinkTransit Fabric + Fabric IQ Labs

Hands-on labs for **Microsoft Fabric Data Engineering**, **Power BI in Fabric**, and a **FastAPI + Embedded Power BI** dashboard — all driven from a single workforce-events dataset.

---

## Prerequisites

| Tool | Purpose |
|------|---------|
| [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) | Azure authentication |
| [Copilot CLI](https://githubnext.com/projects/copilot-cli) | AI-assisted development |
| Python 3.10+ | Backend API |
| Microsoft Fabric workspace | Lakehouse + Power BI |

## Quick Start

### 1. Start Copilot CLI with repo-local MCP

```bash
copilot --additional-mcp-config ./.copilot/mcp-config.json
```

Inside Copilot, verify Azure MCP is connected:

```
/mcp show
```

Confirm `azure-mcp` is listed. Then test with:

- *"What resource groups do I have available?"*
- *"Show me all resource groups in my subscription."*

> **Auth trouble?** Run `az login`, then restart the Copilot CLI session.

---

## LAB 1 — Fabric Data Engineering (Lakehouse)

**Goal:** Upload CSV → Delta table → governed metrics (views/measures) → ready for Power BI.

**Dataset:** `data/workforce_events.csv`

| Column | Description |
|--------|-------------|
| EmployeeId | Unique employee identifier |
| Date | Shift date |
| Garage | Depot location (North / South) |
| ScheduledShiftHours | Planned shift length |
| ActualWorkedHours | Hours actually worked |
| AbsenceFlag | Whether employee was absent |
| OvertimeHours | Extra hours beyond scheduled |
| TripCancelledFlag | Whether a trip was cancelled |

### Steps

1. Create a Lakehouse in your Fabric workspace.
2. Upload `data/workforce_events.csv` to the Lakehouse **Files** section.
3. Use a notebook or Dataflow Gen2 to load the CSV into a **Delta table**.
4. Create SQL views/measures for governed metrics.

---

## LAB 2 — Power BI in Fabric ("Fabric IQ")

**Goal:** Build a report and ask Copilot questions grounded in the semantic model.

### Practice Prompts

- *"Show overtime by garage over time."*
- *"Show trip cancellations by garage by day."*
- *"Where does actual vs scheduled hours deviate most?"*

---

## APP — FastAPI + Embedded Power BI Dashboard

**Goal:** Show KPIs alongside an embedded Power BI report (User-Owns-Data).

### Run the Backend

```bash
cd app/backend
python -m venv .venv
.venv\Scripts\activate      # Windows
# source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### Run the Frontend

```bash
cd app/frontend
python -m http.server 5500
```

Open http://localhost:5500

### Configuration

Copy `.env.example` to `.env` in `app/backend/` and fill in your Power BI embed settings:

```env
PBI_REPORT_ID=<your-report-id>
PBI_EMBED_URL=<your-embed-url>
```

---

## Project Structure

```
fabric-iq-labs/
├── app/
│   ├── backend/          # FastAPI API (KPIs + Power BI embed)
│   │   ├── main.py
│   │   ├── requirements.txt
│   │   └── .env.example
│   └── frontend/         # HTML/JS dashboard
│       ├── index.html
│       ├── style.css
│       ├── app.js
│       └── vendor/
├── data/
│   └── workforce_events.csv
├── prompts/
├── .copilot/
│   └── mcp-config.json
└── README.md
```
