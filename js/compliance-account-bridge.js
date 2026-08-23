const ASSESSMENT_STORAGE_KEY = "growwithhr-advisory-briefing-v2";
const REPORT_STORAGE_KEY = "growwithhr-report";
const BRIDGE_STATE_KEY = "growwithhr.compliance.account-bridge.v1";
const ENGINE = "compliance";
const TOTAL_MOMENTS = 7;

let user = null;
let accountAssessment = null;
let companyId = null;
let lastSnapshot = "";
let timer = null;
let syncing = false;

function readJson(key) {
  try { return JSON.parse(localStorage.getItem(key) || "null"); }
  catch (_error) { return null; }
}

function writeJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch (_error) { return false; }
}

function bridgeState() {
  return readJson(BRIDGE_STATE_KEY) || {};
}

function saveBridgeState(patch) {
  writeJson(BRIDGE_STATE_KEY, { ...bridgeState(), ...patch, updatedAt: new Date().toISOString() });
}

function setVisibleSaveStatus(message) {
  const node = document.getElementById("saveStatus");
  if (node) node.textContent = message;
}

function enhanceAccountCopy() {
  setVisibleSaveStatus("Progress saves automatically to your GrowWithHR account");
  const modal = document.querySelector("#exitModal .advisory-modal__card p");
  if (modal) modal.textContent = "Your latest progress is saved to your GrowWithHR account. You can return later and continue from a signed-in device.";
  const privacy = document.querySelector(".advisory-entry__privacy");
  if (privacy && !document.getElementById("complianceAccountNotice")) {
    const note = document.createElement("p");
    note.id = "complianceAccountNotice";
    note.className = "advisory-entry__privacy";
    note.innerHTML = "<strong>Signed-in assessment:</strong> your progress is linked to My GrowWithHR so you can save, leave and resume later. Sample reports remain public.";
    privacy.insertAdjacentElement("beforebegin", note);
  }
}

function assessmentSnapshot() {
  return readJson(ASSESSMENT_STORAGE_KEY);
}

function progressFrom(state) {
  if (state?.completed) return 100;
  const moment = Math.max(0, Math.min(TOTAL_MOMENTS - 1, Number(state?.currentMoment) || 0));
  return Math.round((moment / TOTAL_MOMENTS) * 100);
}

function reportSnapshot() {
  return readJson(REPORT_STORAGE_KEY);
}

function companyFacts(state) {
  const answers = state?.answers || {};
  const name = answers.companyName || answers.organisationName || answers.organizationName || answers.businessName || answers.company || "";
  const industry = answers.industryName || answers.industry || answers.industryOther || "";
  return { name: String(name || "").trim(), industry: String(industry || "").trim() };
}

async function ensureCompanyForState(auth, state) {
  if (companyId) return companyId;
  const facts = companyFacts(state);
  if (!facts.name) return null;
  const company = await auth.ensureCompany({
    name: facts.name,
    industry: facts.industry,
    profile: {
      source: "compliance-engine-prototype",
      totalEmployees: state?.answers?.employees || state?.answers?.totalEmployees || "",
      growthStage: state?.answers?.stage || state?.answers?.growthStage || ""
    }
  });
  companyId = company?.id || null;
  return companyId;
}

async function restoreFromAccount(auth) {
  const params = new URLSearchParams(location.search);
  const requestedId = params.get("assessment");
  let saved = null;
  if (requestedId) saved = await auth.getAssessment(requestedId);
  if (!saved) saved = await auth.latestAssessment(ENGINE);
  if (!saved?.answers?.legacyAssessment) return false;

  accountAssessment = saved;
  companyId = saved.company_id || null;
  const local = assessmentSnapshot();
  const localUpdated = Date.parse(local?.updatedAt || 0) || 0;
  const remoteUpdated = Date.parse(saved.updated_at || 0) || 0;
  const alreadyRestored = params.get("accountRestored") === "1";

  if (remoteUpdated > localUpdated && !alreadyRestored) {
    writeJson(ASSESSMENT_STORAGE_KEY, saved.answers.legacyAssessment);
    saveBridgeState({ assessmentId: saved.id, companyId, restoredAt: new Date().toISOString() });
    params.set("assessment", saved.id);
    params.set("accountRestored", "1");
    location.replace(`${location.pathname}?${params.toString()}${location.hash}`);
    return true;
  }

  saveBridgeState({ assessmentId: saved.id, companyId });
  return false;
}

async function linkCompletedReport(auth, savedAssessment, state) {
  if (!state?.completed) return savedAssessment;
  const report = reportSnapshot();
  if (!report) return savedAssessment;
  const linkedId = savedAssessment?.analysis_payload?.accountReportId;
  if (linkedId) return savedAssessment;

  const companyName = companyFacts(state).name || "Company";
  const accountReport = await auth.saveReport({
    assessmentId: savedAssessment.id,
    companyId: savedAssessment.company_id || companyId,
    engine: ENGINE,
    title: `${companyName} · Compliance Advisory`,
    payload: {
      schemaVersion: "legacy-compliance-account-wrapper-v1",
      legacyReport: report,
      legacyAssessment: state,
      linkedAt: new Date().toISOString()
    }
  });

  const updated = await auth.saveAssessmentDraft({
    id: savedAssessment.id,
    companyId: savedAssessment.company_id || companyId,
    engine: ENGINE,
    answers: { legacyAssessment: state },
    progress: 100,
    lastStep: TOTAL_MOMENTS,
    status: "completed",
    analysisPayload: { accountReportId: accountReport.id, legacyReportLinked: true }
  });
  saveBridgeState({ assessmentId: updated.id, companyId: updated.company_id || companyId, reportId: accountReport.id });
  return updated;
}

async function syncCurrentState(auth, { force = false } = {}) {
  if (syncing || !user) return;
  const state = assessmentSnapshot();
  if (!state?.started && !state?.completed) return;
  const serialised = JSON.stringify(state);
  if (!force && serialised === lastSnapshot) return;
  syncing = true;
  setVisibleSaveStatus("Saving to your GrowWithHR account…");
  try {
    const id = accountAssessment?.id || bridgeState().assessmentId || null;
    companyId = accountAssessment?.company_id || bridgeState().companyId || companyId;
    await ensureCompanyForState(auth, state);
    const status = state.completed ? "completed" : "in_progress";
    accountAssessment = await auth.saveAssessmentDraft({
      id,
      companyId,
      engine: ENGINE,
      answers: { legacyAssessment: state },
      progress: progressFrom(state),
      lastStep: Math.min(TOTAL_MOMENTS, (Number(state.currentMoment) || 0) + 1),
      status,
      analysisPayload: accountAssessment?.analysis_payload || null
    });
    companyId = accountAssessment.company_id || companyId;
    lastSnapshot = serialised;
    saveBridgeState({ assessmentId: accountAssessment.id, companyId });
    accountAssessment = await linkCompletedReport(auth, accountAssessment, state);
    setVisibleSaveStatus(`✓ Saved to My GrowWithHR · ${new Date(accountAssessment.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
  } catch (error) {
    console.warn("GrowWithHR compliance account sync did not complete.", error);
    setVisibleSaveStatus("Saved on this device · account sync will retry");
  } finally {
    syncing = false;
  }
}

export async function bootstrapComplianceAccountBridge() {
  if (!document.getElementById("assessmentShell")) return;
  enhanceAccountCopy();
  try {
    const auth = await import("./auth-client.js");
    user = await auth.getUser();
    if (!user) return;
    await auth.ensureProfile(user).catch(() => null);
    const reloading = await restoreFromAccount(auth);
    if (reloading) return;
    lastSnapshot = JSON.stringify(assessmentSnapshot() || {});
    timer = window.setInterval(() => syncCurrentState(auth).catch(() => {}), 1200);
    document.addEventListener("input", () => window.setTimeout(() => syncCurrentState(auth).catch(() => {}), 850), true);
    document.addEventListener("change", () => window.setTimeout(() => syncCurrentState(auth).catch(() => {}), 350), true);
    document.getElementById("saveExitButton")?.addEventListener("click", () => syncCurrentState(auth, { force: true }).catch(() => {}));
    window.addEventListener("pagehide", () => {
      window.clearInterval(timer);
      const state = assessmentSnapshot();
      if (state) saveBridgeState({ assessmentId: accountAssessment?.id || bridgeState().assessmentId, companyId, deviceSnapshotAt: new Date().toISOString() });
    });
    await syncCurrentState(auth, { force: false });
  } catch (error) {
    console.warn("GrowWithHR compliance account bridge is unavailable in this environment.", error);
    setVisibleSaveStatus("Progress saves on this device · account sync is not configured here yet");
  }
}

bootstrapComplianceAccountBridge();
