# Quickstart: Workforce Analytics Dashboard

**Branch**: `001-workforce-dashboard`

## Prerequisites

- Python 3.10+
- Modern web browser (Chrome, Edge, Firefox)
- (Optional) Azure CLI for Fabric/MCP integration
- (Optional) Power BI workspace for embedded report

## 1. Start the Backend

```bash
cd app/backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Verify: open http://localhost:8000/docs to see the API docs.

Quick test:
```bash
curl http://localhost:8000/health
# {"ok":true}

curl http://localhost:8000/kpis
# {"total_records":7,"absence_rate":0.142...}
```

## 2. Start the Frontend

```bash
cd app/frontend
python -m http.server 5500
```

Open http://localhost:5500 in your browser.

You should see:
- 4 KPI cards (Absence Rate, Overtime Hours, Trip Cancellations, Delta)
- A "Group by" dropdown with Garage/EmployeeId/all options
- A trend data table
- A Power BI embed section (shows configuration message if not set up)

## 3. (Optional) Configure Power BI Embed

```bash
cd app/backend
cp .env.example .env
```

Edit `.env` and set:
```
PBI_REPORT_ID=<your-report-id>
PBI_EMBED_URL=<your-embed-url>
```

Restart uvicorn. The embed section on the frontend will activate.

## 4. (Optional) Copilot CLI with Azure MCP

```bash
copilot --additional-mcp-config ./.copilot/mcp-config.json
```

Inside Copilot CLI:
```
/mcp show
```

Verify `azure-mcp` is listed.

## Common Issues

| Problem | Solution |
|---------|----------|
| `workforce_events.csv not found` | Run from repo root, ensure `data/` exists |
| CORS error in browser console | Backend must run on port 8000, frontend on 5500 |
| Power BI embed blank | Check `.env` has valid `PBI_REPORT_ID` and `PBI_EMBED_URL` |
| `az login` errors | Run `az login` in a separate terminal, restart Copilot |
