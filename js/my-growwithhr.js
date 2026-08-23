import {
  ensureProfile,
  ensureLegacyRecoveryForReport,
  emailReportAgain,
  getLegacyRecoveryCredentials,
  getUser,
  listAssessments,
  listReports,
  signOut
} from "./auth-client.js";

const loading = document.getElementById("workspaceLoading");
const content = document.getElementById("workspaceContent");
const welcome = document.getElementById("workspaceWelcome");
const assessmentsRoot = document.getElementById("assessmentList");
const reportsRoot = document.getElementById("reportList");
const signOutButton = document.getElementById("workspaceSignOut");
const status = document.getElementById("workspaceStatus");
const legacySection = document.getElementById("legacyRecoverySection");
const legacyReportId = document.getElementById("legacyRecoveryReportId");
const legacyCode = document.getElementById("legacyRecoveryCode");
const legacyEmailStatus = document.getElementById("legacyRecoveryEmailStatus");
const copyLegacyButton = document.getElementById("copyLegacyRecovery");

let legacyRecovery = null;

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"})[ch]);
}

function engineLabel(engine) {
  return engine === "organization-growth" ? "Organization Structure & Growth Engine" : "Compliance Engine";
}

function assessmentHref(item) {
  if (item.engine === "organization-growth") return `organization-growth-beta.html?assessment=${encodeURIComponent(item.id)}`;
  return `compliance-intelligence.html?assessment=${encodeURIComponent(item.id)}`;
}

function reportHref(item) {
  if (item.engine === "organization-growth") return `organization-growth-report-beta.html?report=${encodeURIComponent(item.id)}`;
  return `account-report.html?report=${encodeURIComponent(item.id)}`;
}

function renderAssessments(items) {
  if (!items.length) {
    assessmentsRoot.innerHTML = `<div class="prototype-card"><h3>No saved assessments yet</h3><p>Start with the company question you need answered. Your progress will appear here once you begin.</p><div class="prototype-actions"><a class="prototype-btn" href="intelligence-hub.html">Analyze My Company</a></div></div>`;
    return;
  }
  assessmentsRoot.innerHTML = items.map((item) => {
    const progress = Math.max(0, Math.min(100, Number(item.progress) || 0));
    const state = item.status === "completed" ? "Completed" : "In progress";
    const action = item.status === "completed" ? "Review assessment" : "Continue assessment";
    return `<article class="account-item">
      <div>
        <h3 style="margin:0 0 7px">${esc(engineLabel(item.engine))}</h3>
        <div class="account-meta"><span>${esc(state)}</span><span>Last saved ${esc(new Date(item.updated_at).toLocaleString())}</span><span>Step ${esc(item.last_step)}</span></div>
        <div class="account-progress" aria-label="${progress}% complete"><span style="width:${progress}%"></span></div>
      </div>
      <a class="prototype-btn secondary" href="${assessmentHref(item)}">${esc(action)}</a>
    </article>`;
  }).join("");
}

function renderReports(items) {
  if (!items.length) {
    reportsRoot.innerHTML = `<div class="prototype-card"><h3>No account-linked reports yet</h3><p>Completed signed-in analyses will be listed here. Public sample reports remain available separately.</p><div class="prototype-actions"><a class="prototype-btn secondary" href="sample-reports.html">View sample reports</a></div></div>`;
    return;
  }
  reportsRoot.innerHTML = items.map((item) => `<article class="account-item">
    <div>
      <h3 style="margin:0 0 7px">${esc(item.title || engineLabel(item.engine))}</h3>
      <div class="account-meta">
        <span>${esc(engineLabel(item.engine))}</span>
        <span>Created ${esc(new Date(item.created_at).toLocaleString())}</span>
        ${item.legacy_report_id ? `<span>Report ID ${esc(item.legacy_report_id)}</span>` : `<span>Legacy Report ID pending</span>`}
        ${item.email_count ? `<span>Emailed ${esc(item.email_count)} time${Number(item.email_count) === 1 ? "" : "s"}</span>` : ""}
        ${item.selected_option_key ? `<span>Direction selected</span>` : ""}
      </div>
    </div>
    <div class="prototype-actions">
      <a class="prototype-btn secondary" href="${reportHref(item)}">Open report</a>
      <button class="prototype-btn secondary" type="button" data-email-report="${esc(item.id)}">Email report again</button>
    </div>
  </article>`).join("");

  reportsRoot.querySelectorAll("[data-email-report]").forEach((button) => {
    button.addEventListener("click", async () => {
      const reportId = button.dataset.emailReport;
      button.disabled = true;
      const original = button.textContent;
      button.textContent = "Sending…";
      status.textContent = "Preparing secure report access email…";
      try {
        const delivery = await emailReportAgain(reportId);
        button.textContent = "Emailed";
        status.textContent = `Report emailed again to ${delivery.email}. The link requires GrowWithHR sign-in.`;
      } catch (error) {
        button.textContent = original;
        button.disabled = false;
        status.textContent = error.message || "The report email could not be sent.";
        status.className = "prototype-status prototype-error";
      }
    });
  });
}

function renderLegacyRecovery(recovery) {
  legacyRecovery = recovery;
  if (!recovery?.recoveryReportId || !recovery?.recoveryCode) {
    legacySection.hidden = true;
    return;
  }
  legacyReportId.textContent = recovery.recoveryReportId;
  legacyCode.textContent = recovery.recoveryCode;
  legacyEmailStatus.textContent = recovery.credentialsEmailedAt
    ? `These fallback credentials were also emailed to your account on ${new Date(recovery.credentialsEmailedAt).toLocaleString()}.`
    : "These fallback credentials are assigned to your account. Email delivery of the credentials is pending or not configured in this prototype environment.";
  legacySection.hidden = false;
}

async function provisionMissingLegacyIds(reports) {
  // Oldest report is processed first so the account's first generated report
  // becomes the permanent legacy recovery identity, irrespective of engine.
  const chronological = [...reports].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  for (const report of chronological) {
    if (report.legacy_report_id) continue;
    try {
      const recovery = await ensureLegacyRecoveryForReport(report.id);
      if (recovery?.reportLegacyId) report.legacy_report_id = recovery.reportLegacyId;
    } catch (error) {
      console.warn("GrowWithHR legacy Report ID provisioning is pending.", error);
    }
  }
  return reports;
}

copyLegacyButton?.addEventListener("click", async () => {
  if (!legacyRecovery?.recoveryReportId || !legacyRecovery?.recoveryCode) return;
  const text = `GrowWithHR Legacy Recovery\nReport ID: ${legacyRecovery.recoveryReportId}\nRecovery Code: ${legacyRecovery.recoveryCode}`;
  try {
    await navigator.clipboard.writeText(text);
    copyLegacyButton.textContent = "Copied";
    window.setTimeout(() => { copyLegacyButton.textContent = "Copy recovery credentials"; }, 1800);
  } catch (_error) {
    status.textContent = "Copy was unavailable. You can select the Report ID and Recovery Code above manually.";
  }
});

async function boot() {
  try {
    const user = await getUser();
    if (!user) {
      location.replace(`auth.html?return=${encodeURIComponent("my-growwithhr.html")}`);
      return;
    }
    await ensureProfile(user).catch(() => null);
    const name = user.user_metadata?.display_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "there";
    welcome.textContent = `Welcome back, ${name}`;

    const [assessments, initialReports] = await Promise.all([listAssessments(), listReports()]);
    renderAssessments(assessments);

    const reports = await provisionMissingLegacyIds(initialReports);
    renderReports(reports);

    if (reports.length) {
      try {
        const recovery = await getLegacyRecoveryCredentials();
        renderLegacyRecovery(recovery);
      } catch (error) {
        legacySection.hidden = false;
        legacyReportId.textContent = "Provisioning pending";
        legacyCode.textContent = "Provisioning pending";
        legacyEmailStatus.textContent = error.message || "Legacy recovery could not be loaded in this prototype environment.";
      }
    }

    loading.hidden = true;
    content.hidden = false;
  } catch (error) {
    status.textContent = error.message || "Your GrowWithHR workspace could not be loaded.";
    status.className = "prototype-status prototype-error";
  }
}

signOutButton.addEventListener("click", async () => {
  signOutButton.disabled = true;
  try {
    await signOut();
    location.replace("index.html");
  } catch (error) {
    status.textContent = error.message || "Sign out did not complete.";
    signOutButton.disabled = false;
  }
});

boot();
