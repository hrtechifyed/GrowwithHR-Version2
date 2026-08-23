import { analyzeOrganizationStructure } from "./modules/organization/organization-structure-engine.mjs";
import { buildOrganizationGrowthDecision } from "./modules/organization/organization-growth-options-engine.mjs";
import {
  ensureCompany,
  ensureProfile,
  getUser,
  getAssessment,
  latestAssessment,
  saveAssessmentDraft,
  saveReport
} from "./auth-client.js";

const TOTAL_STEPS = 7;
const ENGINE = "organization-growth";
const intro = document.getElementById("engineIntro");
const wizard = document.getElementById("engineWizard");
const signedOutActions = document.getElementById("introSignedOutActions");
const signedInActions = document.getElementById("introSignedInActions");
const introStatus = document.getElementById("introStatus");
const startButton = document.getElementById("startAssessment");
const form = document.getElementById("organizationGrowthForm");
const stepLabel = document.getElementById("stepLabel");
const progressBar = document.getElementById("progressBar");
const autosaveStatus = document.getElementById("autosaveStatus");
const wizardStatus = document.getElementById("wizardStatus");
const previousButton = document.getElementById("previousStep");
const nextButton = document.getElementById("nextStep");
const analyzeButton = document.getElementById("analyzeOrganization");
const saveExitButton = document.getElementById("saveExit");
const reviewRoot = document.getElementById("reviewRoot");
const stepSections = Array.from(document.querySelectorAll(".wizard-step"));

let user = null;
let assessmentId = null;
let companyId = null;
let currentStep = 1;
let saveTimer = null;
let saveInFlight = Promise.resolve();
let restoredFromServer = false;

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"})[ch]);
}

function localDraftKey() {
  return `growwithhr.organization-growth.account-draft.v1:${user?.id || "anonymous"}`;
}

function readLocalDraft() {
  try { return JSON.parse(localStorage.getItem(localDraftKey()) || "null"); }
  catch (_error) { return null; }
}

function writeLocalDraft(payload) {
  try { localStorage.setItem(localDraftKey(), JSON.stringify(payload)); }
  catch (_error) {}
}

function values() {
  const data = {};
  new FormData(form).forEach((value, key) => { data[key] = typeof value === "string" ? value.trim() : value; });
  return data;
}

function applyValues(data = {}) {
  Object.entries(data || {}).forEach(([key, value]) => {
    const field = form.elements.namedItem(key);
    if (!field || value === undefined || value === null) return;
    field.value = String(value);
  });
}

function progressFor(step = currentStep) {
  return Math.round(((Math.max(1, Math.min(TOTAL_STEPS, step)) - 1) / TOTAL_STEPS) * 100);
}

function setWizardStatus(message, kind = "") {
  wizardStatus.textContent = message || "";
  wizardStatus.className = `prototype-status${kind ? ` prototype-${kind}` : ""}`;
}

function stepTitle(step) {
  return stepSections.find((section) => Number(section.dataset.step) === step)?.dataset.stepTitle || "Review";
}

function showStep(step) {
  currentStep = Math.max(1, Math.min(TOTAL_STEPS, step));
  stepSections.forEach((section) => section.classList.toggle("is-active", Number(section.dataset.step) === currentStep));
  const percent = Math.round((currentStep / TOTAL_STEPS) * 100);
  progressBar.style.width = `${percent}%`;
  stepLabel.textContent = `Step ${currentStep} of ${TOTAL_STEPS} · ${stepTitle(currentStep)}`;
  previousButton.disabled = currentStep === 1;
  nextButton.hidden = currentStep === TOTAL_STEPS;
  analyzeButton.hidden = currentStep !== TOTAL_STEPS;
  if (currentStep === TOTAL_STEPS) renderReview();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function validateCurrentStep() {
  const section = stepSections.find((item) => Number(item.dataset.step) === currentStep);
  if (!section) return true;
  const requiredFields = Array.from(section.querySelectorAll("[required]"));
  for (const field of requiredFields) {
    if (!field.value || !field.checkValidity()) {
      field.reportValidity();
      return false;
    }
  }
  return true;
}

function reviewGroups(data) {
  return [
    ["Your Company", ["companyName","industry","employees","growthStage","businessModel","locations","productsCount","customerSegments"]],
    ["Where You Are Going", ["planningHorizon","expectedEmployees","revenueGrowth","profitGrowth","customerGrowth","productGrowth","geographyGrowth","businessLineGrowth","acquisitionPlans","expansion"]],
    ["Your Constraints", ["headcountFlexibility","leadershipBudget","layerPreference","founderInvolvement","internalTalent","constraintsNotes"]],
    ["Responsibility Concentration", ["multipleRoleOwnership","combinedRoleStatus","combinedRoles","criticalSharedRoles"]],
    ["Management & Structure", ["managerCount","reportingLevels","founderDirectReports","departments","managerRole","workComplexity","workStandardization","teamIndependence","coachingIntensity"]],
    ["How Work & Decisions Happen", ["roleClarity","decisionRights","governanceCadence","coordinationFriction","founderDecisions","decisionPain"]]
  ];
}

function fieldLabel(key) {
  const field = form.elements.namedItem(key);
  if (!field) return key;
  const label = form.querySelector(`label[for="${CSS.escape(field.id)}"]`);
  return label?.textContent?.trim() || key;
}

function renderReview() {
  const data = values();
  reviewRoot.innerHTML = reviewGroups(data).map(([title, keys]) => {
    const rows = keys.filter((key) => data[key]).map((key) => `<div class="review-row"><span>${esc(fieldLabel(key))}</span><strong>${esc(data[key])}</strong></div>`).join("");
    return `<section class="review-group"><h3>${esc(title)}</h3>${rows || `<p class="prototype-lead" style="font-size:.9rem">No specific information provided.</p>`}</section>`;
  }).join("");
}

async function ensureCompanyForAnswers(answers) {
  if (companyId || !answers.companyName) return companyId;
  const company = await ensureCompany({
    name: answers.companyName,
    industry: answers.industry,
    profile: {
      growthStage: answers.growthStage || "",
      businessModel: answers.businessModel || "",
      currentEmployees: answers.employees || "",
      operatingLocations: answers.locations || "",
      productsCount: answers.productsCount || ""
    }
  });
  companyId = company?.id || null;
  return companyId;
}

async function persistNow({ status = "in_progress", analysisPayload = null, silent = false } = {}) {
  if (!user) throw new Error("Sign in is required to save this assessment.");
  const answers = values();
  const localPayload = { assessmentId, companyId, currentStep, answers, savedAt: new Date().toISOString() };
  writeLocalDraft(localPayload);
  if (!silent) autosaveStatus.textContent = "Saving securely to your GrowWithHR account…";

  saveInFlight = saveInFlight.then(async () => {
    await ensureCompanyForAnswers(answers);
    const saved = await saveAssessmentDraft({
      id: assessmentId,
      companyId,
      engine: ENGINE,
      answers,
      progress: status === "completed" ? 100 : progressFor(currentStep),
      lastStep: currentStep,
      status,
      analysisPayload
    });
    assessmentId = saved.id;
    companyId = saved.company_id || companyId;
    writeLocalDraft({ assessmentId, companyId, currentStep, answers, savedAt: saved.updated_at });
    if (!silent) autosaveStatus.textContent = `✓ Saved automatically · ${new Date(saved.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    return saved;
  }).catch((error) => {
    autosaveStatus.textContent = "Saved on this device · Account sync will retry after your next change.";
    throw error;
  });
  return saveInFlight;
}

function queueSave() {
  if (!user || wizard.hidden) return;
  autosaveStatus.textContent = "Saving…";
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => persistNow().catch(() => {}), 700);
}

async function restoreExisting() {
  const params = new URLSearchParams(location.search);
  const requestedId = params.get("assessment");
  let saved = null;
  try {
    if (requestedId) saved = await getAssessment(requestedId);
    if (!saved) saved = await latestAssessment(ENGINE);
  } catch (_error) {}

  if (saved?.answers) {
    assessmentId = saved.id;
    companyId = saved.company_id || null;
    currentStep = Math.max(1, Math.min(TOTAL_STEPS, Number(saved.last_step) || 1));
    applyValues(saved.answers);
    restoredFromServer = true;
    autosaveStatus.textContent = `✓ Saved assessment restored · ${new Date(saved.updated_at).toLocaleString()}`;
    return;
  }

  const local = readLocalDraft();
  if (local?.answers) {
    assessmentId = local.assessmentId || null;
    companyId = local.companyId || null;
    currentStep = Math.max(1, Math.min(TOTAL_STEPS, Number(local.currentStep) || 1));
    applyValues(local.answers);
    autosaveStatus.textContent = `Saved device draft restored${local.savedAt ? ` · ${new Date(local.savedAt).toLocaleString()}` : ""}`;
  }
}

function legacyInput(data) {
  const numberOrNull = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };
  const locations = numberOrNull(data.locations);
  const employees = numberOrNull(data.employees);
  const expectedEmployees = numberOrNull(data.expectedEmployees);
  return {
    shared: {
      companyName: data.companyName,
      email: user?.email || "",
      industry: data.industry,
      employees,
      growthStage: data.growthStage,
      expectedEmployees
    },
    workforce: { totalEmployees: employees, expectedEmployees12Months: expectedEmployees },
    geography: { operatingLocationCount: locations },
    organization: {
      peopleManagerCount: numberOrNull(data.managerCount),
      reportingLevels: numberOrNull(data.reportingLevels),
      founderDirectReports: numberOrNull(data.founderDirectReports),
      locations,
      departments: String(data.departments || "").split(",").map((item) => item.trim()).filter(Boolean),
      managerRole: data.managerRole,
      workComplexity: data.workComplexity,
      workStandardization: data.workStandardization,
      teamIndependence: data.teamIndependence,
      coachingIntensity: data.coachingIntensity,
      founderDecisions: data.founderDecisions,
      expansion: data.expansion,
      roleClarity: data.roleClarity,
      decisionRights: data.decisionRights,
      governanceCadence: data.governanceCadence,
      coordinationFriction: data.coordinationFriction,
      confirmedAt: new Date().toISOString()
    }
  };
}

async function completeAnalysis() {
  const data = values();
  const baseAnalysis = analyzeOrganizationStructure(legacyInput(data));
  const decision = buildOrganizationGrowthDecision({ answers: data, legacyAnalysis: baseAnalysis });
  const analysisPayload = { baseAnalysis, decision };
  const completed = await persistNow({ status: "completed", analysisPayload, silent: true });
  const report = await saveReport({
    assessmentId: completed.id,
    companyId: completed.company_id || companyId,
    engine: ENGINE,
    title: `${data.companyName || "Company"} · Organization Structure & Growth`,
    payload: {
      schemaVersion: "0.1-prototype",
      answers: data,
      baseAnalysis,
      decision,
      accountEmail: user.email,
      generatedAt: new Date().toISOString()
    }
  });
  try { sessionStorage.setItem("growwithhr.organization-growth.report-beta", JSON.stringify(report)); } catch (_error) {}
  localStorage.removeItem(localDraftKey());
  location.href = `organization-growth-report-beta.html?report=${encodeURIComponent(report.id)}`;
}

startButton.addEventListener("click", async () => {
  intro.hidden = true;
  wizard.hidden = false;
  if (!restoredFromServer && !assessmentId) autosaveStatus.textContent = "Auto-save is on. Your first change will create a secure account draft.";
  showStep(currentStep);
});

previousButton.addEventListener("click", () => {
  if (currentStep > 1) {
    currentStep -= 1;
    showStep(currentStep);
    queueSave();
  }
});

nextButton.addEventListener("click", () => {
  if (!validateCurrentStep()) return;
  if (currentStep < TOTAL_STEPS) {
    currentStep += 1;
    showStep(currentStep);
    queueSave();
  }
});

saveExitButton.addEventListener("click", async () => {
  saveExitButton.disabled = true;
  setWizardStatus("Saving before exit…");
  try {
    await persistNow();
    location.href = "my-growwithhr.html";
  } catch (error) {
    setWizardStatus(error.message || "Your account save did not complete. The latest answers remain saved on this device.", "error");
    saveExitButton.disabled = false;
  }
});

form.addEventListener("input", queueSave);
form.addEventListener("change", queueSave);
window.addEventListener("pagehide", () => {
  if (!wizard.hidden && user) {
    writeLocalDraft({ assessmentId, companyId, currentStep, answers: values(), savedAt: new Date().toISOString() });
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (currentStep !== TOTAL_STEPS) return;
  analyzeButton.disabled = true;
  previousButton.disabled = true;
  saveExitButton.disabled = true;
  setWizardStatus("Comparing structural options and preparing your decision report…");
  try {
    await completeAnalysis();
  } catch (error) {
    setWizardStatus(error.message || "The analysis could not be completed yet.", "error");
    analyzeButton.disabled = false;
    previousButton.disabled = false;
    saveExitButton.disabled = false;
  }
});

async function boot() {
  try {
    user = await getUser();
    if (!user) {
      signedOutActions.hidden = false;
      introStatus.textContent = "Sign in before entering company information so your progress and report can be saved securely to your GrowWithHR account.";
      return;
    }
    await ensureProfile(user).catch(() => null);
    signedInActions.hidden = false;
    introStatus.textContent = `Signed in as ${user.email}. Your assessment will auto-save to this account.`;
    await restoreExisting();
  } catch (error) {
    signedOutActions.hidden = false;
    introStatus.textContent = error.message || "Account sign-in is not configured in this environment yet.";
    introStatus.className = "prototype-status prototype-error";
  }
}

boot();
