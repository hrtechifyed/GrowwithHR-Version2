import {
  ensureProfile,
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
  return `executive-advisory-report.html?report=${encodeURIComponent(item.id)}`;
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
      <div class="account-meta"><span>${esc(engineLabel(item.engine))}</span><span>Created ${esc(new Date(item.created_at).toLocaleString())}</span>${item.selected_option_key ? `<span>Direction selected</span>` : ""}</div>
    </div>
    <a class="prototype-btn secondary" href="${reportHref(item)}">Open report</a>
  </article>`).join("");
}

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
    const [assessments, reports] = await Promise.all([listAssessments(), listReports()]);
    renderAssessments(assessments);
    renderReports(reports);
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
