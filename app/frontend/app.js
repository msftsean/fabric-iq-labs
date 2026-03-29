/**
 * ThinkTransit Workforce Dashboard — Frontend
 */

const API = location.hostname === "localhost" || location.hostname === "127.0.0.1"
  ? "http://localhost:8000"
  : "https://ca-api-6iq3am.bravefield-8dee0ad6.eastus2.azurecontainerapps.io";

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

// ── Power BI Embed (User-Owns-Data) ──────────────────────────────────────────

async function loadPowerBI() {
  const status = $("pbiStatus");
  const container = $("pbiContainer");

  if (!status || !container) return;

  try {
    const meta = await fetchJSON("/pbi/config");
    status.innerHTML = `<div class="status-banner info">
      Power BI report configured (ID: ${meta.reportId}). Click "Sign In & Embed" to load.
    </div>`;
  } catch {
    status.innerHTML = `<div class="status-banner info">
      Power BI embed not configured. Set <code>PBI_REPORT_ID</code> and
      <code>PBI_EMBED_URL</code> env vars on the backend.
    </div>`;
    container.innerHTML = "";
  }
}

// ── Init ─────────────────────────────────────────────────────────────────────

$("refresh").addEventListener("click", loadTrend);

(async function init() {
  await loadKpis();
  await loadTrend();
  await loadPowerBI();
})();
