/**
 * ThinkTransit Workforce Dashboard — Frontend
 */

const API = location.hostname === "localhost" || location.hostname === "127.0.0.1"
  ? "http://localhost:8000"
  : "https://ca-api-5jran7.lemonglacier-1d7bbe4a.eastus2.azurecontainerapps.io";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtPct(x) { return (x * 100).toFixed(1) + "%"; }
function fmtNum(x) { return (Math.round(x * 10) / 10).toLocaleString(); }

function $(id) { return document.getElementById(id); }

async function fetchJSON(path) {
  const resp = await fetch(`${API}${path}`);
  if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
  return resp.json();
}

// ── KPI Cards ────────────────────────────────────────────────────────────────

async function loadKpis() {
  try {
    const k = await fetchJSON("/kpis");

    const items = [
      { label: "Absence rate", value: fmtPct(k.absence_rate) },
      { label: "Overtime hours", value: fmtNum(k.overtime_hours) },
      { label: "Trip cancellations", value: k.trip_cancellations.toLocaleString() },
      {
        label: "Delivered vs plan (hrs)",
        value: `${fmtNum(k.delivered_vs_plan_hours.actual)} / ${fmtNum(k.delivered_vs_plan_hours.scheduled)} (Δ ${fmtNum(k.delivered_vs_plan_hours.delta)})`,
        cls: k.delivered_vs_plan_hours.delta < 0 ? "danger" : "success",
      },
    ];

    $("kpi-grid").innerHTML = items
      .map(
        (i) => `
      <div class="kpi-card ${i.cls || ""}">
        <div class="value">${i.value}</div>
        <div class="label">${i.label}</div>
      </div>
    `
      )
      .join("");
  } catch (err) {
    $("kpi-grid").innerHTML = `<div class="status-banner error">Failed to load KPIs: ${err.message}</div>`;
  }
}

// ── Trend Table ──────────────────────────────────────────────────────────────

async function loadTrend() {
  const groupBy = $("groupBy").value;
  try {
    const data = await fetchJSON(`/trend?by=${encodeURIComponent(groupBy)}`);
    const rows = data.rows;
    const cols = rows.length ? Object.keys(rows[0]) : [];
    const table = $("trendTable");
    table.innerHTML = `
      <thead><tr>${cols.map((c) => `<th>${c}</th>`).join("")}</tr></thead>
      <tbody>
        ${rows.map((r) => `<tr>${cols.map((c) => `<td>${r[c]}</td>`).join("")}</tr>`).join("")}
      </tbody>
    `;
  } catch (err) {
    $("trendTable").innerHTML = `<tr><td class="status-banner error">${err.message}</td></tr>`;
  }
}

// ── Power BI Embed (User-Owns-Data via MSAL) ────────────────────────────────

const PBI_CLIENT_ID = "41d5e493-6bd9-4bda-83fd-53308a14c68a";
const PBI_TENANT_ID = "999097f4-0a95-4a60-b69a-2a50bdf72f6e";

const msalConfig = {
  auth: {
    clientId: PBI_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${PBI_TENANT_ID}`,
    redirectUri: window.location.origin + "/",
  },
  cache: { cacheLocation: "sessionStorage" },
};

let msalInitPromise = null;

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

async function loadPowerBI() {
  const status = $("pbiStatus");
  const container = $("pbiContainer");

  if (!status || !container) return;

  try {
    const meta = await fetchJSON("/pbi/config");

    if (meta.reportId) {
      status.innerHTML = `<div class="status-banner info" style="display:flex; align-items:center; gap:1rem;">
        <span>Power BI report ready (ID: ${escapeHtml(meta.reportId.substring(0, 8))}…).</span>
        <button id="pbiSignIn" style="padding:.4rem 1rem; border-radius:4px; border:1px solid var(--primary); background:var(--primary); color:#fff; cursor:pointer; font-size:.85rem;">
          Sign In &amp; Embed
        </button>
      </div>`;
      $("pbiSignIn").addEventListener("click", () => embedReport(meta, container, status));
    } else if (meta.datasetId) {
      status.innerHTML = `<div class="status-banner info" style="display:flex; align-items:center; gap:1rem;">
        <span>Dataset found. Click to create a report with visuals.</span>
        <button id="pbiCreate" style="padding:.4rem 1rem; border-radius:4px; border:1px solid var(--primary); background:var(--primary); color:#fff; cursor:pointer; font-size:.85rem;">
          Sign In &amp; Create Report
        </button>
      </div>`;
      $("pbiCreate").addEventListener("click", () => createReport(meta, container, status));
    }
  } catch {
    status.innerHTML = `<div class="status-banner info">
      Power BI embed not configured. Set <code>PBI_REPORT_ID</code> and
      <code>PBI_EMBED_URL</code> env vars on the backend.
    </div>`;
    container.innerHTML = "";
  }
}

async function embedReport(meta, container, status) {
  const btn = $("pbiSignIn");
  if (btn) btn.disabled = true;

  try {
    status.innerHTML = `<div class="status-banner info">Signing in to Power BI…</div>`;

    if (!msalInitPromise) {
      const instance = new msal.PublicClientApplication(msalConfig);
      msalInitPromise = instance.initialize().then(() => instance);
    }
    const msalInstance = await msalInitPromise;

    const loginReq = { scopes: ["https://analysis.windows.net/powerbi/api/Report.Read.All"] };
    let tokenResponse;

    try {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        tokenResponse = await msalInstance.acquireTokenSilent({ ...loginReq, account: accounts[0] });
      } else {
        tokenResponse = await msalInstance.acquireTokenPopup(loginReq);
      }
    } catch {
      tokenResponse = await msalInstance.acquireTokenPopup(loginReq);
    }

    status.innerHTML = `<div class="status-banner info">Loading report…</div>`;

    const embedConfig = {
      type: "report",
      id: meta.reportId,
      embedUrl: meta.embedUrl,
      accessToken: tokenResponse.accessToken,
      tokenType: window["powerbi-client"].models.TokenType.Aad,
      settings: {
        panes: { filters: { visible: false }, pageNavigation: { visible: true } },
        background: window["powerbi-client"].models.BackgroundType.Transparent,
      },
    };

    const powerbiClient = new window["powerbi-client"].service.Service(
      window["powerbi-client"].factories.hpmFactory,
      window["powerbi-client"].factories.wpmpFactory,
      window["powerbi-client"].factories.routerFactory
    );

    powerbiClient.reset(container);
    const report = powerbiClient.embed(container, embedConfig);

    report.on("loaded", () => {
      status.innerHTML = `<div class="status-banner info" style="color:var(--success);">✅ Report loaded successfully.</div>`;
    });

    report.on("error", (event) => {
      status.innerHTML = `<div class="status-banner error">Report error: ${escapeHtml(event.detail.message)}</div>`;
    });
  } catch (err) {
    status.innerHTML = `<div class="status-banner error">Failed to embed: ${escapeHtml(err.message)}</div>`;
    if (btn) btn.disabled = false;
  }
}

async function createReport(meta, container, status) {
  const btn = $("pbiCreate");
  if (btn) btn.disabled = true;

  try {
    status.innerHTML = `<div class="status-banner info">Signing in to Power BI…</div>`;

    if (!msalInitPromise) {
      const instance = new msal.PublicClientApplication(msalConfig);
      msalInitPromise = instance.initialize().then(() => instance);
    }
    const msalInstance = await msalInitPromise;

    const loginReq = { scopes: ["https://analysis.windows.net/powerbi/api/Report.Read.All"] };
    let tokenResponse;
    try {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        tokenResponse = await msalInstance.acquireTokenSilent({ ...loginReq, account: accounts[0] });
      } else {
        tokenResponse = await msalInstance.acquireTokenPopup(loginReq);
      }
    } catch {
      tokenResponse = await msalInstance.acquireTokenPopup(loginReq);
    }

    status.innerHTML = `<div class="status-banner info">Opening report editor — drag fields to create visuals, then click <strong>File → Save</strong>.</div>`;

    const createConfig = {
      type: "report",
      tokenType: window["powerbi-client"].models.TokenType.Aad,
      accessToken: tokenResponse.accessToken,
      embedUrl: "https://app.powerbi.com/reportEmbed",
      datasetId: meta.datasetId,
      settings: {
        panes: { filters: { visible: true }, pageNavigation: { visible: true } },
      },
    };

    const powerbiClient = new window["powerbi-client"].service.Service(
      window["powerbi-client"].factories.hpmFactory,
      window["powerbi-client"].factories.wpmpFactory,
      window["powerbi-client"].factories.routerFactory
    );

    powerbiClient.reset(container);
    const report = powerbiClient.createReport(container, createConfig);

    report.on("saved", (event) => {
      status.innerHTML = `<div class="status-banner info" style="color:var(--success);">✅ Report saved! ID: ${escapeHtml(event.detail.reportObjectId)}</div>`;
    });

    report.on("error", (event) => {
      status.innerHTML = `<div class="status-banner error">Editor error: ${escapeHtml(event.detail.message)}</div>`;
    });
  } catch (err) {
    status.innerHTML = `<div class="status-banner error">Failed to open editor: ${escapeHtml(err.message)}</div>`;
    if (btn) btn.disabled = false;
  }
}

// ── Init ─────────────────────────────────────────────────────────────────────

$("refresh").addEventListener("click", loadTrend);

(async function init() {
  await loadKpis();
  await loadTrend();
  await loadPowerBI();
})();
