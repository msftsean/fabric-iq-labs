# ThinkTransit Fabric IQ Labs — Copilot CLI Runbook

> Paste these prompts into Copilot CLI. Each section builds on the previous.

---

## 0. Prerequisites

```bash
# Install tools
npm install -g @bradygaster/squad-cli
pip install fastapi uvicorn[standard] pandas python-multipart

# Login to Azure (required for Fabric + MCP)
az login
```

## 1. Start Copilot CLI with Repo-Local MCP

```bash
copilot --additional-mcp-config ./.copilot/mcp-config.json
```

Inside Copilot, verify connectivity:

```
/mcp show
```

Confirm `azure-mcp` is listed, then test with:

- `"What resource groups do I have available?"`
- `"Show me all resource groups in my subscription."`

> **Auth trouble?** Run `az login` outside Copilot, then restart the CLI session.

---

## 2. LAB 1 — Fabric Data Engineering (Lakehouse)

**Goal**: Upload CSV → Delta table → governed metrics → ready for Power BI.

### Step 1: Create a Lakehouse

```
"Create a new Lakehouse called 'ThinkTransitLH' in my Fabric workspace."
```

### Step 2: Upload the dataset

```
"Upload data/workforce_events.csv to the ThinkTransitLH Lakehouse Files section."
```

### Step 3: Load into Delta table

```
"Create a notebook that loads the workforce_events CSV into a Delta table
called 'workforce_events' with proper column types."
```

### Step 4: Create governed views

```
"Create a SQL view 'vw_daily_kpis' that aggregates absence rate, overtime hours,
trip cancellations, and delivered-vs-plan delta by date and garage."
```

---

## 3. LAB 2 — Power BI in Fabric ("Fabric IQ")

**Goal**: Build a report and ask Copilot questions grounded in the semantic model.

### Practice Prompts

After creating a report from the ThinkTransitLH semantic model, try:

- `"Show overtime by garage over time."`
- `"Show trip cancellations by garage by day."`
- `"Where does actual vs scheduled hours deviate most?"`
- `"Which employees have the highest absence rate?"`
- `"Compare North vs South garage overtime trends."`

---

## 4. APP — Run the Dashboard Locally

### Backend

```bash
cd app/backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Verify at http://localhost:8000/docs

### Frontend

```bash
cd app/frontend
python -m http.server 5500
```

Open http://localhost:5500

### Quick API Tests

```bash
curl http://localhost:8000/health
curl http://localhost:8000/kpis
curl http://localhost:8000/trend?by=Garage
curl http://localhost:8000/api/data/events
```

---

## 5. Power BI Embed (User-Owns-Data)

1. Copy `app/backend/.env.example` to `app/backend/.env`
2. Fill in `PBI_REPORT_ID` and `PBI_EMBED_URL` from your Power BI workspace
3. Restart uvicorn — the embed section on the frontend will activate

```bash
curl http://localhost:8000/pbi/config
```

---

## Appendix: X-Force Squad Agents

| Agent | Role | Domain |
|-------|------|--------|
| Xavier | Lead / Coordinator | Architecture, routing |
| Beast | Data Engineer | Fabric, Lakehouse, Delta |
| Forge | Backend Engineer | FastAPI, Python, APIs |
| Storm | Frontend Engineer | HTML/CSS/JS, Power BI embed |
| Wolverine | Code Reviewer | Security, quality, edge cases |
| Cerebro | Scribe | Docs, runbooks, specs |

```bash
# Check squad status
squad status
```

---

## Appendix: Spec-Kit Workflow

```
# Inside Copilot CLI (with spec-kit agents installed):
/speckit.constitution    # Establish project principles
/speckit.specify         # Create feature specification
/speckit.plan            # Generate implementation plan
/speckit.tasks           # Break plan into executable tasks
/speckit.implement       # Implement tasks from the plan
```
