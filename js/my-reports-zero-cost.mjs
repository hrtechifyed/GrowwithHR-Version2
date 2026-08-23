import {
  deleteRecoveryWorkspace,
  getLocalWorkspace,
  listLocalReports,
  recoverWorkspace
} from "./zero-cost-report-vault.mjs";

const localRoot = document.getElementById("localReportList");
const form = document.getElementById("workspaceRecoverForm");
const reportField = document.getElementById("workspaceReportId");
const codeField = document.getElementById("workspaceRecoveryCode");
const status = document.getElementById("workspaceStatus");
const dashboard = document.getElementById("workspaceDashboard");
const workspaceReportList = document.getElementById("workspaceReportList");
const workspaceReportCount = document.getElementById("workspaceReportCount");
const workspaceFirstReport = document.getElementById("workspaceFirstReport");
const workspaceCurrentReport = document.getElementById("workspaceCurrentReport");
const deleteButton = document.getElementById("deleteWorkspace");

let recoveredWorkspace = null;
let recoveredReports = [];
let activeRecoveryCode = "";

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" })[ch]);
}

function dateText(value) {
  const date = new Date(value || "");
  return Number.isFinite(date.getTime()) ? date.toLocaleString() : "Date unavailable";
}

function engineLabel(engine) {
  return engine === "organization-growth" ? "Organization Structure & Growth" : "HR Compliance & Growth";
}

function reportHref(report) {
  const id = encodeURIComponent(report.reportId || report.report_id || "");
  return report.engine === "organization-growth"
    ? `organization-growth-report-beta.html?report=${id}`
    : `compliance-report-recover.html?report=${id}`;
}

function normalizeRemote(report) {
  return {
    reportId: report.report_id,
    engine: report.engine,
    title: report.title,
    metadata: report.metadata || {},
    createdAt: report.created_at
  };
}

function reportMarkup(report, note = "") {
  return `<article class="workspace-report-row" style="align-items:center">
    <div>
      <strong>${esc(report.title || engineLabel(report.engine))}</strong><br>
      <code>${esc(report.reportId)}</code><br>
      <span>${esc(engineLabel(report.engine))} · ${esc(dateText(report.createdAt))}${note ? ` · ${esc(note)}` : ""}</span>
    </div>
    <a class="primary-btn" href="${reportHref(report)}">Open report</a>
  </article>`;
}

function renderLocalReports() {
  const reports = listLocalReports();
  if (!reports.length) {
    localRoot.innerHTML = `<div class="workspace-card-v2"><h3>No reports saved on this browser yet</h3><p>Complete a GrowWithHR analysis or recover an existing report below.</p><a class="primary-btn" href="intelligence-hub.html">Analyze My Company</a></div>`;
    return;
  }
  localRoot.innerHTML = reports.map((report) => reportMarkup(report, "Available on this device")).join("");
}

function renderRecovered(result, recoveryCode) {
  recoveredWorkspace = result.workspace;
  activeRecoveryCode = recoveryCode;
  recoveredReports = (result.reports || []).map(normalizeRemote);
  workspaceReportCount.textContent = String(recoveredReports.length);
  workspaceFirstReport.textContent = recoveredWorkspace.firstReportId || "—";
  workspaceCurrentReport.textContent = recoveredWorkspace.currentReportId || "—";
  workspaceReportList.innerHTML = recoveredReports.length
    ? recoveredReports.map((report) => reportMarkup(report, report.reportId === recoveredWorkspace.currentReportId ? "Current report" : "Linked report")).join("")
    : "<p>No reports were found in this recovery workspace.</p>";
  dashboard.hidden = false;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  dashboard.hidden = true;
  status.textContent = "Recovering your GrowWithHR report workspace…";
  try {
    const reportId = reportField.value.trim();
    const recoveryCode = codeField.value.trim();
    const result = await recoverWorkspace(reportId, recoveryCode);
    renderRecovered(result, recoveryCode);
    renderLocalReports();
    status.textContent = "Recovery successful. Linked report history is shown below.";
  } catch (error) {
    status.textContent = error.message || "GrowWithHR could not recover that report workspace.";
  }
});

deleteButton.addEventListener("click", async () => {
  if (!recoveredWorkspace?.currentReportId || !activeRecoveryCode) return;
  if (!confirm("Delete the encrypted reports stored in this prototype recovery workspace? Reports already downloaded or saved elsewhere are not affected. This cannot be undone.")) return;
  deleteButton.disabled = true;
  status.textContent = "Deleting encrypted recovery workspace…";
  try {
    await deleteRecoveryWorkspace(recoveredWorkspace.currentReportId, activeRecoveryCode);
    dashboard.hidden = true;
    recoveredWorkspace = null;
    recoveredReports = [];
    activeRecoveryCode = "";
    status.textContent = "Encrypted recovery workspace deleted.";
  } catch (error) {
    status.textContent = error.message || "The recovery workspace could not be deleted.";
  } finally {
    deleteButton.disabled = false;
  }
});

const localWorkspace = getLocalWorkspace();
if (localWorkspace?.currentReportId && localWorkspace?.recoveryCode) {
  reportField.value = localWorkspace.currentReportId;
  codeField.value = localWorkspace.recoveryCode;
}
renderLocalReports();
