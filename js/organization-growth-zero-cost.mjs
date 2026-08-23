import { analyzeOrganizationStructure } from "./modules/organization/organization-structure-engine.mjs";
import { buildOrganizationGrowthDecision } from "./modules/organization/organization-growth-options-engine.mjs";
import { saveReport } from "./zero-cost-report-vault.mjs";

const TOTAL_STEPS = 7;
const DRAFT_KEY = "growwithhr.organization-growth.zero-cost-draft.v1";
const intro = document.getElementById("engineIntro");
const wizard = document.getElementById("engineWizard");
const introActions = document.getElementById("introActions");
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

let currentStep = 1;
let saveTimer = null;
let restoredDraft = false;

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" })[ch]);
}

function readDraft() {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || "null"); }
  catch (_error) { return null; }
}

function writeDraft(payload) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(payload)); }
  catch (_error) {}
}

function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch (_error) {}
}

function values() {
  const data = {};
  new FormData(form).forEach((value, key) => {
    data[key] = typeof value === "string" ? value.trim() : value;
  });
  return data;
}

function applyValues(data = {}) {
  Object.entries(data || {}).forEach(([key, value]) => {
    const field = form.elements.namedItem(key);
    if (!field || value === undefined || value === null) return;
    field.value = String(value);
  });
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
  progressBar.style.width = `${Math.round((currentStep / TOTAL_STEPS) * 100)}%`;
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
  for (const field of Array.from(section.querySelectorAll("[required]"))) {
    if (!field.value || !field.checkValidity()) {
      field.reportValidity();
      return false;
    }
  }
  return true;
}

function reviewGroups() {
  return [
    ["Your Company", ["companyName", "industry", "employees", "growthStage", "businessModel", "locations", "productsCount", "customerSegments"]],
    ["Where You Are Going", ["planningHorizon", "expectedEmployees", "revenueGrowth", "profitGrowth", "customerGrowth", "productGrowth", "geographyGrowth", "businessLineGrowth", "acquisitionPlans", "expansion"]],
    ["Your Constraints", ["headcountFlexibility", "leadershipBudget", "layerPreference", "founderInvolvement", "internalTalent", "constraintsNotes"]],
    ["Responsibility Concentration", ["multipleRoleOwnership", "combinedRoleStatus", "combinedRoles", "criticalSharedRoles"]],
    ["Management & Structure", ["managerCount", "reportingLevels", "founderDirectReports", "departments", "managerRole", "workComplexity", "workStandardization", "teamIndependence", "coachingIntensity"]],
    ["How Work & Decisions Happen", ["roleClarity", "decisionRights", "governanceCadence", "coordinationFriction", "founderDecisions", "decisionPain"]]
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
  reviewRoot.innerHTML = reviewGroups().map(([title, keys]) => {
    const rows = keys
      .filter((key) => data[key])
      .map((key) => `<div class="review-row"><span>${esc(fieldLabel(key))}</span><strong>${esc(data[key])}</strong></div>`)
      .join("");
    return `<section class="review-group"><h3>${esc(title)}</h3>${rows || '<p class="prototype-lead" style="font-size:.9rem">No specific information provided.</p>'}</section>`;
  }).join("");
}

function persistNow() {
  const savedAt = new Date().toISOString();
  writeDraft({ currentStep, answers: values(), savedAt });
  autosaveStatus.textContent = `✓ Saved automatically on this device · ${new Date(savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function queueSave() {
  if (wizard.hidden) return;
  autosaveStatus.textContent = "Saving on this device…";
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(persistNow, 500);
}

function restoreExisting() {
  const draft = readDraft();
  if (!draft?.answers) return;
  applyValues(draft.answers);
  currentStep = Math.max(1, Math.min(TOTAL_STEPS, Number(draft.currentStep) || 1));
  restoredDraft = true;
  autosaveStatus.textContent = `✓ Saved device draft restored${draft.savedAt ? ` · ${new Date(draft.savedAt).toLocaleString()}` : ""}`;
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
      email: "",
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
  persistNow();
  const data = values();
  const baseAnalysis = analyzeOrganizationStructure(legacyInput(data));
  const decision = buildOrganizationGrowthDecision({ answers: data, legacyAnalysis: baseAnalysis });
  const payload = {
    schemaVersion: "0.2-zero-cost-prototype",
    answers: data,
    baseAnalysis,
    decision,
    selectedOptionKey: null,
    generatedAt: new Date().toISOString()
  };
  const saved = await saveReport({
    engine: "organization-growth",
    title: `${data.companyName || "Company"} · Organization Structure & Growth`,
    payload,
    metadata: {
      companyName: data.companyName || "",
      growthStage: data.growthStage || "",
      schemaVersion: payload.schemaVersion
    }
  });
  try {
    sessionStorage.setItem("growwithhr.zero-cost.just-created", JSON.stringify({
      reportId: saved.reportId,
      recoveryCode: saved.recoveryCode,
      firstReport: saved.firstReport
    }));
  } catch (_error) {}
  clearDraft();
  location.href = `organization-growth-report-beta.html?report=${encodeURIComponent(saved.reportId)}&created=1`;
}

startButton.addEventListener("click", () => {
  intro.hidden = true;
  wizard.hidden = false;
  if (!restoredDraft) autosaveStatus.textContent = "Auto-save is on. Your answers will stay on this browser while you work.";
  showStep(currentStep);
});

previousButton.addEventListener("click", () => {
  if (currentStep <= 1) return;
  currentStep -= 1;
  showStep(currentStep);
  queueSave();
});

nextButton.addEventListener("click", () => {
  if (!validateCurrentStep()) return;
  if (currentStep >= TOTAL_STEPS) return;
  currentStep += 1;
  showStep(currentStep);
  queueSave();
});

saveExitButton.addEventListener("click", () => {
  persistNow();
  location.href = "intelligence-hub.html";
});

form.addEventListener("input", queueSave);
form.addEventListener("change", queueSave);
window.addEventListener("pagehide", () => {
  if (!wizard.hidden) persistNow();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (currentStep !== TOTAL_STEPS) return;
  analyzeButton.disabled = true;
  previousButton.disabled = true;
  saveExitButton.disabled = true;
  setWizardStatus("Comparing structural options and securely preparing your recovery-based report…");
  try {
    await completeAnalysis();
  } catch (error) {
    setWizardStatus(error.message || "The analysis could not be completed yet. Your answers remain saved on this device.", "error");
    analyzeButton.disabled = false;
    previousButton.disabled = false;
    saveExitButton.disabled = false;
  }
});

restoreExisting();
introActions.hidden = false;
introStatus.textContent = restoredDraft
  ? "A saved assessment was found on this device. You can continue from where you stopped."
  : "No sign-in is required. Progress auto-saves on this device. When you generate a report, GrowWithHR gives you a Report ID and Recovery Code for secure recovery.";
