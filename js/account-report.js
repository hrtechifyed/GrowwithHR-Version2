import { emailReportAgain, getReport, getUser } from "./auth-client.js";

const params = new URLSearchParams(location.search);
const reportId = params.get("report");
const title = document.getElementById("accountReportTitle");
const lead = document.getElementById("accountReportLead");
const status = document.getElementById("accountReportStatus");
const overview = document.getElementById("accountReportOverview");
const details = document.getElementById("accountReportDetails");
const openButton = document.getElementById("openFullReport");
const emailButton = document.getElementById("emailAccountReport");

let report = null;

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"})[ch]);
}

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function companyName(payload) {
  const data = asObject(payload);
  const answers = asObject(data.answers);
  const legacyAssessment = asObject(data.legacyAssessment);
  const legacyAnswers = asObject(legacyAssessment.answers);
  return answers.companyName || legacyAnswers.companyName || data.companyName || "Your company";
}

function reportSummary(payload) {
  const data = asObject(payload);
  const legacy = asObject(data.legacyReport);
  const decision = asObject(data.decision);
  const baseAnalysis = asObject(data.baseAnalysis);
  return (
    decision.currentStateMessage ||
    legacy.executiveSummary ||
    legacy.summary ||
    legacy.report?.executiveSummary ||
    baseAnalysis.reportModel?.executiveSummary ||
    "This account copy preserves the report generated from your signed-in GrowWithHR assessment."
  );
}

function render() {
  const payload = asObject(report.payload);
  const name = companyName(payload);
  title.textContent = report.title || `${name} · GrowWithHR Report`;
  lead.textContent = reportSummary(payload);
  overview.hidden = false;
  overview.innerHTML = `
    <div class="prototype-kicker">Report overview</div>
    <h2>${esc(name)}</h2>
    <div class="signal-grid">
      <div class="signal-card"><div class="signal-label">Engine</div><div class="signal-value">${esc(report.engine === "organization-growth" ? "Organization Structure & Growth" : "Compliance")}</div></div>
      <div class="signal-card"><div class="signal-label">Generated</div><div class="signal-value">${esc(new Date(report.created_at).toLocaleString())}</div></div>
      <div class="signal-card"><div class="signal-label">Legacy Report ID</div><div class="signal-value">${esc(report.legacy_report_id || "Provisioning pending")}</div></div>
      <div class="signal-card"><div class="signal-label">Email history</div><div class="signal-value">${esc(Number(report.email_count) || 0)} resend${Number(report.email_count) === 1 ? "" : "s"}</div></div>
    </div>
    <p class="prototype-lead" style="margin-top:18px">${esc(reportSummary(payload))}</p>`;

  details.hidden = false;
  if (report.engine === "organization-growth") {
    const decision = asObject(payload.decision);
    details.innerHTML = `
      <div class="prototype-kicker">Decision report</div>
      <h2>${esc(decision.coreOrganizationQuestion || "Organization Structure & Growth")}</h2>
      <p class="prototype-lead">Open the full decision report to compare structural options, trade-offs, the GrowWithHR suggested direction, your selected direction and the implementation path.</p>`;
    openButton.textContent = "Open full Organization Structure & Growth report";
  } else {
    details.innerHTML = `
      <div class="prototype-kicker">Compliance report</div>
      <h2>Your full advisory remains available</h2>
      <p class="prototype-lead">GrowWithHR will securely restore the saved compliance report into the existing report experience on this device when you open it.</p>`;
    openButton.textContent = "Open full Compliance report";
  }
  openButton.hidden = false;
  emailButton.hidden = false;
}

openButton.addEventListener("click", () => {
  if (!report) return;
  if (report.engine === "organization-growth") {
    location.href = `organization-growth-report-beta.html?report=${encodeURIComponent(report.id)}`;
    return;
  }

  const payload = asObject(report.payload);
  const legacyReport = payload.legacyReport || payload.report || null;
  const legacyAssessment = payload.legacyAssessment || null;
  if (!legacyReport) {
    status.textContent = "This account report does not contain a restorable compliance report payload yet.";
    status.className = "prototype-status prototype-error";
    return;
  }
  try {
    localStorage.setItem("growwithhr-report", JSON.stringify(legacyReport));
    if (legacyAssessment) localStorage.setItem("growwithhr-advisory-briefing-v2", JSON.stringify(legacyAssessment));
    location.href = "executive-advisory-report.html?accountRestored=1";
  } catch (_error) {
    status.textContent = "The full report could not be restored on this device because browser storage is unavailable.";
    status.className = "prototype-status prototype-error";
  }
});

emailButton.addEventListener("click", async () => {
  if (!report) return;
  emailButton.disabled = true;
  const original = emailButton.textContent;
  emailButton.textContent = "Sending…";
  status.textContent = "Preparing a secure report email…";
  try {
    const delivery = await emailReportAgain(report.id);
    emailButton.textContent = "Emailed";
    status.textContent = `Report emailed again to ${delivery.email}. The link requires GrowWithHR sign-in.`;
  } catch (error) {
    emailButton.disabled = false;
    emailButton.textContent = original;
    status.textContent = error.message || "The report email could not be sent.";
    status.className = "prototype-status prototype-error";
  }
});

async function boot() {
  try {
    const user = await getUser();
    if (!user) {
      location.replace(`auth.html?return=${encodeURIComponent(`account-report.html?report=${reportId || ""}`)}`);
      return;
    }
    if (!reportId) throw new Error("No account report was selected.");
    report = await getReport(reportId);
    if (!report) throw new Error("That report was not found in your GrowWithHR account.");
    render();
  } catch (error) {
    title.textContent = "This report could not be opened";
    lead.textContent = error.message || "GrowWithHR could not load this account report.";
    status.className = "prototype-status prototype-error";
  }
}

boot();
