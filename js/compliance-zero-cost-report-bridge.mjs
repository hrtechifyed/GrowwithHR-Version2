import { getLocalWorkspace, saveReport } from "./zero-cost-report-vault.mjs";

const LAST_KEY = "growwithhr.compliance.zero-cost.last.v1";

function readJson(key) {
  try { return JSON.parse(localStorage.getItem(key) || "null"); }
  catch (_error) { return null; }
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" })[ch]);
}

async function fingerprint(value) {
  const text = JSON.stringify(value || {});
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest)).slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function showCredentials(reportId, recoveryCode, { existing = false } = {}) {
  const root = document.getElementById("founderReportRoot") || document.querySelector("main");
  if (!root || root.querySelector("[data-zero-cost-compliance-recovery]")) return;
  const section = document.createElement("section");
  section.dataset.zeroCostComplianceRecovery = "";
  section.className = "gwh-web-section";
  section.innerHTML = `
    <p class="gwh-web-eyebrow">REPORT RECOVERY</p>
    <h2>${existing ? "Recovery details for this report" : "Keep these recovery details"}</h2>
    <p>No account is required. Keep both values private. They can be used from <strong>My Reports</strong> to recover this completed report later.</p>
    <div style="display:grid;gap:10px;margin:18px 0">
      <div><strong>Report ID</strong><br><code>${esc(reportId)}</code></div>
      <div><strong>Recovery Code</strong><br><code>${esc(recoveryCode)}</code></div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button type="button" data-copy-compliance-recovery>Copy recovery details</button>
      <a href="my-reports.html">Open My Reports</a>
    </div>`;
  root.prepend(section);
  section.querySelector("[data-copy-compliance-recovery]")?.addEventListener("click", async () => {
    await navigator.clipboard.writeText(`GrowWithHR Report ID: ${reportId}\nRecovery Code: ${recoveryCode}`);
  });
}

async function boot() {
  const params = new URLSearchParams(location.search);
  if (params.get("sample") === "1") return;
  const reportData = readJson("growwithhr-report");
  if (!reportData || !Object.keys(reportData).length) return;

  const currentFingerprint = await fingerprint(reportData);
  const previous = readJson(LAST_KEY);
  const workspace = getLocalWorkspace();

  if (previous?.fingerprint === currentFingerprint && previous?.reportId && workspace?.recoveryCode) {
    showCredentials(previous.reportId, workspace.recoveryCode, { existing: true });
    return;
  }

  try {
    const saved = await saveReport({
      engine: "compliance",
      title: `${reportData.companyName || "Company"} · HR Compliance & Growth Report`,
      payload: reportData,
      metadata: {
        companyName: reportData.companyName || "",
        industry: reportData.industry || "",
        employees: reportData.employees || "",
        schemaVersion: reportData.schemaVersion || "compliance-current"
      }
    });
    localStorage.setItem(LAST_KEY, JSON.stringify({
      fingerprint: currentFingerprint,
      reportId: saved.reportId,
      savedAt: new Date().toISOString()
    }));
    showCredentials(saved.reportId, saved.recoveryCode);
  } catch (error) {
    console.warn("GrowWithHR zero-cost Compliance recovery save did not complete", error);
  }
}

boot();
