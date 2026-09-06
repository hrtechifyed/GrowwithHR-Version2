import { analyzeWorkforceCapability, finalizeWorkforcePlan } from "./modules/workforce/workforce-capability-engine.mjs";

const REPORT_KEY = "growwithhr.workforce-capability.report";
const SESSION_KEY = "growwithhr.workspace";
const MAX_CAPABILITIES = 5;
const GITHUB_PAGES_ORIGIN = "https://hrtechifyed.github.io";
const RENDER_BASE = "https://growwithhr.onrender.com";

const form = document.getElementById("wcpForm");
const capabilityList = document.getElementById("wcpCapabilityList");
const addCapabilityButton = document.getElementById("wcpAddCapability");
const results = document.getElementById("wcpResults");
const frameworkResults = document.getElementById("wcpFrameworkResults");
const findingResults = document.getElementById("wcpFindingResults");
const overallPosition = document.getElementById("wcpOverallPosition");
const errorBox = document.getElementById("wcpFormError");
const finalizeButton = document.getElementById("wcpFinalize");
const finalizeStatus = document.getElementById("wcpFinalizeStatus");
const reuseNotice = document.getElementById("wcpReuseNotice");

let recovered = readWorkspace();
let latestAnalysis = null;
let selectedPlanChoice = "hybrid";
let capabilityCounter = 0;

function clean(value, fallback = "") {
  return String(value ?? "").replace(/\s+/g, " ").trim() || fallback;
}
function esc(value) {
  return clean(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
function numberOrNull(value) {
  const raw = clean(value);
  if (!raw) return null;
  const number = Number(raw);
  return Number.isFinite(number) ? number : null;
}
function apiBase() {
  return location.origin === GITHUB_PAGES_ORIGIN ? RENDER_BASE : "";
}
function readWorkspace() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); }
  catch (_error) { return null; }
}
function saveWorkspace(workspace) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(workspace)); }
  catch (_error) {}
}
function setValue(id, value) {
  const element = document.getElementById(id);
  if (!element || value === undefined || value === null || value === "") return;
  element.value = String(value);
}
function value(id) {
  return clean(document.getElementById(id)?.value);
}

function capabilityMarkup(index, seed = {}) {
  const number = index + 1;
  const selected = (name, candidate, fallback = "") => clean(seed[name], fallback).toLowerCase() === candidate ? " selected" : "";
  return `<article class="wcp-capability-card" data-capability-index="${index}">
    <div class="wcp-capability-card__head"><strong>Capability ${number}</strong>${index >= 2 ? '<button class="wcp-remove-capability" type="button" data-remove-capability>Remove</button>' : ""}</div>
    <div class="wcp-grid">
      <div class="wcp-field wide"><label>Business capability</label><input data-capability-field="name" value="${esc(seed.name)}" placeholder="Enterprise solution selling, data engineering, manufacturing quality" ${index === 0 ? "required" : ""}></div>
      <div class="wcp-field"><label>Strategic importance</label><select data-capability-field="importance"><option value="critical"${selected("importance", "critical")}>Critical</option><option value="important"${selected("importance", "important", "important")}>Important</option><option value="supporting"${selected("importance", "supporting")}>Supporting</option></select></div>
      <div class="wcp-field"><label>Current capability coverage</label><select data-capability-field="currentCoverage"><option value="unknown"${selected("currentCoverage", "unknown", "unknown")}>I don’t know</option><option value="none"${selected("currentCoverage", "none")}>None</option><option value="low"${selected("currentCoverage", "low")}>Low</option><option value="partial"${selected("currentCoverage", "partial")}>Partial</option><option value="adequate"${selected("currentCoverage", "adequate")}>Adequate</option></select></div>
      <div class="wcp-field"><label>Current capacity</label><select data-capability-field="capacityStatus"><option value="unknown"${selected("capacityStatus", "unknown", "unknown")}>I don’t know</option><option value="insufficient"${selected("capacityStatus", "insufficient")}>Insufficient</option><option value="constrained"${selected("capacityStatus", "constrained")}>Constrained</option><option value="adequate"${selected("capacityStatus", "adequate")}>Adequate</option></select></div>
      <div class="wcp-field"><label>Concentration risk</label><select data-capability-field="concentrationRisk"><option value="unknown"${selected("concentrationRisk", "unknown", "unknown")}>I don’t know</option><option value="single-point"${selected("concentrationRisk", "single-point")}>Single-point dependency</option><option value="high"${selected("concentrationRisk", "high")}>High</option><option value="medium"${selected("concentrationRisk", "medium")}>Medium</option><option value="low"${selected("concentrationRisk", "low")}>Low</option></select></div>
      <div class="wcp-field"><label>Adjacent internal capability?</label><select data-capability-field="internalAdjacency"><option value="unknown"${selected("internalAdjacency", "unknown", "unknown")}>I don’t know</option><option value="yes"${selected("internalAdjacency", "yes")}>Yes</option><option value="no"${selected("internalAdjacency", "no")}>No / not identified</option></select></div>
      <div class="wcp-field"><label>Is the need temporary / variable?</label><select data-capability-field="temporaryNeed"><option value="no"${selected("temporaryNeed", "no", "no")}>No</option><option value="yes"${selected("temporaryNeed", "yes")}>Yes</option><option value="unknown"${selected("temporaryNeed", "unknown")}>I don’t know</option></select></div>
      <div class="wcp-field"><label>Work redesign / automation potential</label><select data-capability-field="workRedesignPotential"><option value="unknown"${selected("workRedesignPotential", "unknown", "unknown")}>I don’t know</option><option value="low"${selected("workRedesignPotential", "low")}>Low</option><option value="medium"${selected("workRedesignPotential", "medium")}>Medium</option><option value="high"${selected("workRedesignPotential", "high")}>High</option></select></div>
      <div class="wcp-field wide"><label>Roles or workforce segments affected</label><input data-capability-field="rolesAffected" value="${esc(seed.rolesAffected)}" placeholder="For example: enterprise account executives, solution consultants"></div>
      <div class="wcp-field wide"><label>Evidence / context you already know</label><textarea data-capability-field="evidenceNote" placeholder="Optional organization-level evidence. Do not enter individual employee case data.">${esc(seed.evidenceNote)}</textarea></div>
    </div>
  </article>`;
}

function addCapability(seed = {}) {
  if (capabilityList.children.length >= MAX_CAPABILITIES) return;
  const index = capabilityCounter++;
  capabilityList.insertAdjacentHTML("beforeend", capabilityMarkup(index, seed));
  addCapabilityButton.disabled = capabilityList.children.length >= MAX_CAPABILITIES;
}

function readCapabilities() {
  return [...capabilityList.querySelectorAll(".wcp-capability-card")]
    .map((card, index) => {
      const read = (field) => clean(card.querySelector(`[data-capability-field="${field}"]`)?.value);
      return {
        id: `CAP-${String(index + 1).padStart(2, "0")}`,
        name: read("name"),
        importance: read("importance"),
        currentCoverage: read("currentCoverage"),
        capacityStatus: read("capacityStatus"),
        concentrationRisk: read("concentrationRisk"),
        internalAdjacency: read("internalAdjacency"),
        temporaryNeed: read("temporaryNeed"),
        workRedesignPotential: read("workRedesignPotential"),
        rolesAffected: read("rolesAffected"),
        evidenceNote: read("evidenceNote")
      };
    })
    .filter((item) => item.name);
}

function readFrameworks() {
  return [...document.querySelectorAll('input[name="wcpFramework"]:checked')].map((item) => item.value);
}

function buildInput() {
  return {
    company: {
      name: value("wcpCompanyName"),
      email: value("wcpEmail"),
      industry: value("wcpIndustry"),
      currentEmployees: numberOrNull(value("wcpCurrentEmployees")),
      expectedEmployees: numberOrNull(value("wcpExpectedEmployees")),
      horizonMonths: numberOrNull(value("wcpHorizonMonths")),
      locations: value("wcpLocations")
    },
    strategy: {
      objective: value("wcpStrategyObjective"),
      targetOutcome: value("wcpTargetOutcome"),
      businessImpact: value("wcpBusinessImpact")
    },
    capabilities: readCapabilities(),
    frameworks: readFrameworks(),
    scenarios: {
      baseGrowthPct: numberOrNull(value("wcpBaseGrowthPct")),
      highGrowthPct: numberOrNull(value("wcpHighGrowthPct")),
      workRedesignPct: numberOrNull(value("wcpWorkRedesignPct"))
    },
    economics: {
      currency: value("wcpCurrency") || "INR",
      budgetCap: numberOrNull(value("wcpBudgetCap")),
      annualCostPerHire: numberOrNull(value("wcpAnnualCostPerHire")),
      trainingCostPerPerson: numberOrNull(value("wcpTrainingCostPerPerson")),
      contractorMonthlyCost: numberOrNull(value("wcpContractorMonthlyCost")),
      automationInvestment: numberOrNull(value("wcpAutomationInvestment"))
    }
  };
}

function validateInput(input) {
  if (!input.company.name) return "Company name is required.";
  if (!/^[^\s@;,]+@[^\s@;,]+\.[^\s@;,]+$/.test(input.company.email)) return "A valid work email is required.";
  if (!input.company.industry) return "Industry is required.";
  if (!Number.isFinite(input.company.currentEmployees) || input.company.currentEmployees < 1) return "Current employee count is required.";
  if (!input.strategy.objective) return "State the business objective the workforce plan must enable.";
  if (!input.capabilities.length) return "Add at least one business capability.";
  if (input.frameworks.length < 2) return "Select at least two planning frameworks to compare.";
  return "";
}

function statusClass(status) {
  if (["confirmed-gap", "capacity-gap", "likely-gap"].includes(status)) return "is-action";
  if (status === "adequate") return "is-good";
  return "";
}

function renderFrameworks(analysis) {
  frameworkResults.innerHTML = analysis.frameworkComparisons.map((item) => `
    <article class="wcp-framework-card">
      <div class="wcp-eyebrow">${esc(item.framework.lens)}</div>
      <h3>${esc(item.framework.name)}</h3>
      <p><strong>${esc(item.headline)}</strong></p>
      <p>${esc(item.interpretation)}</p>
      <p><small>Decision emphasis: ${esc(item.decisionEmphasis)}</small></p>
      <a class="wcp-method-link" href="${esc(item.framework.sourceUrl)}" ${item.framework.sourceUrl.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>Framework / methodology ↗</a>
    </article>`).join("");
}

function renderFindings(analysis) {
  findingResults.innerHTML = analysis.findings.map((item) => `
    <article class="wcp-result-card">
      <div class="wcp-result-card__top"><span class="wcp-status ${statusClass(item.status)}">${esc(item.label)}</span><span class="wcp-confidence">${esc(item.confidence)} confidence</span></div>
      <h3>${esc(item.capability)}</h3>
      <p>${esc(item.reason)}</p>
      <p><strong>Leading options:</strong> ${esc(item.interventions.slice(0, 3).map((option) => option.label).join(" · "))}</p>
      <details><summary>Why this result?</summary>
        <p><strong>Facts used:</strong></p><ul>${item.factsUsed.map((fact) => `<li>${esc(fact)}</li>`).join("")}</ul>
        <p><strong>Rule${item.ruleIds.length > 1 ? "s" : ""}:</strong> ${esc(item.ruleIds.join(" · "))}</p>
        ${item.missingFacts.length ? `<p><strong>Information that would increase confidence:</strong> ${esc(item.missingFacts.join(", "))}</p>` : ""}
        <p><strong>What could change the result:</strong> ${esc(item.whatWouldChangeThis)}</p>
        <p><strong>AI decision authority:</strong> No. The finding is produced by deterministic GrowWithHR rules using the company information shown above.</p>
      </details>
    </article>`).join("");
}

function selectPlanChoice(choice) {
  selectedPlanChoice = choice;
  document.querySelectorAll("[data-plan-choice]").forEach((button) => button.classList.toggle("is-selected", button.dataset.planChoice === choice));
}

function invalidateAnalysis() {
  if (!latestAnalysis) return;
  latestAnalysis = null;
  results.hidden = true;
  finalizeStatus.textContent = "";
}

async function allocateReportId(input, previousReportId = "") {
  const response = await fetch(`${apiBase()}/api/report-id`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requestKey: `workforce-capability:${crypto.randomUUID()}`,
      email: input.company.email,
      companyName: input.company.name,
      assessmentId: `workforce-capability-${Date.now()}`,
      previousReportId
    })
  });
  const body = await response.json();
  if (!response.ok || !body.ok || !body.reportId) throw new Error(body.error || "Could not issue a GrowWithHR Report ID.");
  return body.reportId;
}

function companyWorkspaceData(input, plan) {
  const existing = recovered?.companyData || {};
  return {
    ...existing,
    shared: {
      ...(existing.shared || {}),
      companyName: input.company.name,
      email: input.company.email,
      industry: input.company.industry
    },
    workforce: {
      ...(existing.workforce || {}),
      totalEmployees: input.company.currentEmployees,
      expectedEmployees12Months: input.company.expectedEmployees
    },
    geography: {
      ...(existing.geography || {}),
      workforceLocations: input.company.locations
    },
    workforceCapability: {
      strategy: input.strategy,
      capabilities: input.capabilities,
      frameworks: input.frameworks,
      scenarios: input.scenarios,
      economics: input.economics,
      selectedApproach: plan.selectedApproach,
      overallPosition: plan.overallPosition,
      rulesetVersion: plan.rulesetVersion,
      confirmedAt: new Date().toISOString()
    }
  };
}

async function persistWorkspace(input, plan) {
  const previousReportId = recovered?.reportId || "";
  const reportId = await allocateReportId(input, previousReportId);
  const companyData = companyWorkspaceData(input, plan);
  let workspace;

  if (recovered?.reportId && recovered?.accessKey) {
    workspace = (await window.GrowWithHRCompanyWorkspace.complete({
      reportId: recovered.reportId,
      newReportId: reportId,
      accessKey: recovered.accessKey,
      companyName: input.company.name,
      companyData,
      completedEngine: "workforce-capability"
    })).workspace;
    recovered = {
      ...recovered,
      reportId,
      reportIds: workspace.reportIds || recovered.reportIds || [],
      companyName: workspace.companyName || input.company.name,
      email: workspace.email || input.company.email,
      companyData: workspace.companyData || companyData,
      completedEngines: workspace.completedEngines || [],
      expiresAt: workspace.expiresAt
    };
  } else {
    workspace = (await window.GrowWithHRCompanyWorkspace.create({
      reportId,
      email: input.company.email,
      companyName: input.company.name,
      companyData,
      completedEngine: "workforce-capability"
    })).workspace;
    recovered = {
      reportId,
      reportIds: workspace.reportIds || [reportId],
      accessKey: workspace.accessKey,
      email: input.company.email,
      companyName: input.company.name,
      companyData,
      completedEngines: workspace.completedEngines || ["workforce-capability"],
      expiresAt: workspace.expiresAt
    };
  }
  saveWorkspace(recovered);
  return { reportId, previousReportId, companyData, workspace: recovered };
}

async function redeemWorkspaceHandoff() {
  const params = new URLSearchParams(location.search);
  const token = params.get("handoff");
  if (!token) return;
  reuseNotice.textContent = "Recovering your Company Workspace through a short-lived one-time handoff…";
  try {
    const result = await window.GrowWithHRCompanyWorkspace.redeemHandoff(token);
    const handoff = result?.handoff || {};
    const workspace = handoff.workspace || {};
    recovered = {
      reportId: workspace.reportId,
      reportIds: workspace.reportIds || [],
      accessKey: handoff.accessKey,
      email: workspace.email,
      companyName: workspace.companyName,
      completedEngines: workspace.completedEngines || [],
      expiresAt: workspace.expiresAt,
      companyData: workspace.companyData || {}
    };
    saveWorkspace(recovered);
    reuseNotice.textContent = `Welcome back${recovered.companyName ? ` to ${recovered.companyName}` : ""}. Shared company facts were transferred using a one-time handoff. Update anything that has changed.`;
  } catch (error) {
    recovered = null;
    reuseNotice.textContent = "The one-time Company Workspace handoff was unavailable or expired. Start fresh below; no recovery credential was exposed in the URL.";
  } finally {
    history.replaceState(null, "", `${location.pathname}${location.hash || ""}`);
  }
}

function prefillWorkspace() {
  if (!recovered) return;
  const data = recovered.companyData || {};
  const shared = data.shared || {};
  const workforce = data.workforce || {};
  const geography = data.geography || {};
  const wcp = data.workforceCapability || {};
  setValue("wcpCompanyName", recovered.companyName || shared.companyName);
  setValue("wcpEmail", recovered.email || shared.email);
  setValue("wcpIndustry", shared.industry);
  setValue("wcpCurrentEmployees", workforce.totalEmployees ?? shared.employees);
  setValue("wcpExpectedEmployees", workforce.expectedEmployees12Months ?? shared.expectedEmployees);
  setValue("wcpLocations", geography.workforceLocations || geography.operatingLocationCount);
  setValue("wcpStrategyObjective", wcp.strategy?.objective);
  setValue("wcpTargetOutcome", wcp.strategy?.targetOutcome);
  setValue("wcpBusinessImpact", wcp.strategy?.businessImpact);
  setValue("wcpBaseGrowthPct", wcp.scenarios?.baseGrowthPct);
  setValue("wcpHighGrowthPct", wcp.scenarios?.highGrowthPct);
  setValue("wcpWorkRedesignPct", wcp.scenarios?.workRedesignPct);
  setValue("wcpCurrency", wcp.economics?.currency);
  setValue("wcpBudgetCap", wcp.economics?.budgetCap);
  setValue("wcpAnnualCostPerHire", wcp.economics?.annualCostPerHire);
  setValue("wcpTrainingCostPerPerson", wcp.economics?.trainingCostPerPerson);
  setValue("wcpContractorMonthlyCost", wcp.economics?.contractorMonthlyCost);
  setValue("wcpAutomationInvestment", wcp.economics?.automationInvestment);
  if (Array.isArray(wcp.capabilities) && wcp.capabilities.length) {
    capabilityList.innerHTML = "";
    capabilityCounter = 0;
    wcp.capabilities.slice(0, MAX_CAPABILITIES).forEach((item) => addCapability(item));
  }
  if (Array.isArray(wcp.frameworks)) {
    document.querySelectorAll('input[name="wcpFramework"]').forEach((checkbox) => { checkbox.checked = wcp.frameworks.includes(checkbox.value); });
  }
  if (!location.search.includes("handoff=")) reuseNotice.textContent = `Welcome back${recovered.companyName ? ` to ${recovered.companyName}` : ""}. Existing company facts have been reused where available; update anything that has changed.`;
}

addCapabilityButton.addEventListener("click", () => addCapability());
capabilityList.addEventListener("click", (event) => {
  const remove = event.target.closest("[data-remove-capability]");
  if (!remove) return;
  remove.closest(".wcp-capability-card")?.remove();
  addCapabilityButton.disabled = capabilityList.children.length >= MAX_CAPABILITIES;
  invalidateAnalysis();
});

form.addEventListener("input", invalidateAnalysis);
form.addEventListener("change", invalidateAnalysis);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  errorBox.hidden = true;
  const input = buildInput();
  const validation = validateInput(input);
  if (validation) {
    errorBox.textContent = validation;
    errorBox.hidden = false;
    return;
  }
  latestAnalysis = analyzeWorkforceCapability(input);
  overallPosition.textContent = latestAnalysis.overallPosition.headline;
  renderFrameworks(latestAnalysis);
  renderFindings(latestAnalysis);
  selectPlanChoice("hybrid");
  results.hidden = false;
  results.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.getElementById("wcpChoiceGrid").addEventListener("click", (event) => {
  const button = event.target.closest("[data-plan-choice]");
  if (!button) return;
  selectPlanChoice(button.dataset.planChoice);
});

finalizeButton.addEventListener("click", async () => {
  if (!latestAnalysis) {
    finalizeStatus.textContent = "Re-run the framework comparison before creating the report.";
    return;
  }
  finalizeButton.disabled = true;
  finalizeStatus.textContent = "Creating your implementation plan and saving the confirmed company baseline…";
  try {
    const input = buildInput();
    const plan = finalizeWorkforcePlan(latestAnalysis, selectedPlanChoice);
    const persisted = await persistWorkspace(input, plan);
    const payload = {
      data: input,
      analysis: latestAnalysis,
      plan,
      reportId: persisted.reportId,
      previousReportId: persisted.previousReportId,
      generatedAt: new Date().toISOString()
    };
    sessionStorage.setItem(REPORT_KEY, JSON.stringify(payload));
    finalizeStatus.textContent = `Report ${persisted.reportId} created. Opening the executive report glimpse…`;
    window.setTimeout(() => { location.href = "workforce-capability-report.html"; }, 250);
  } catch (error) {
    finalizeStatus.textContent = error.message || "GrowWithHR could not create the Workforce & Capability report yet.";
    finalizeButton.disabled = false;
  }
});

await redeemWorkspaceHandoff();
if (!capabilityList.children.length) {
  addCapability({ importance: "critical" });
  addCapability({ importance: "important" });
}
prefillWorkspace();
