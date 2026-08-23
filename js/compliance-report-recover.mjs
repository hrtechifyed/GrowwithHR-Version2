import { getLocalWorkspace, loadReport } from "./zero-cost-report-vault.mjs";

const form = document.getElementById("recoverComplianceForm");
const reportField = document.getElementById("recoverReportId");
const codeField = document.getElementById("recoverCode");
const status = document.getElementById("recoverComplianceStatus");
const params = new URLSearchParams(location.search);
const requestedReport = params.get("report") || "";
const localWorkspace = getLocalWorkspace();

reportField.value = requestedReport;
if (localWorkspace?.recoveryCode) codeField.value = localWorkspace.recoveryCode;

async function recover(reportId, recoveryCode) {
  status.textContent = "Recovering encrypted report…";
  const loaded = await loadReport(reportId, recoveryCode);
  const report = loaded.payload;
  if (!report || typeof report !== "object") throw new Error("The recovered report payload is invalid.");
  localStorage.setItem("growwithhr-report", JSON.stringify(report));
  status.textContent = "Report recovered. Opening it now…";
  location.replace("executive-advisory-report.html?recovered=1");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await recover(reportField.value.trim(), codeField.value.trim());
  } catch (error) {
    status.textContent = error.message || "The report could not be recovered.";
  }
});

if (requestedReport && localWorkspace?.recoveryCode) {
  recover(requestedReport, localWorkspace.recoveryCode).catch(() => {
    status.textContent = "Enter the Recovery Code for this report.";
  });
}
