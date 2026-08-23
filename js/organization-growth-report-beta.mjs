import { getReport, getUser, updateReportChoice } from "./auth-client.js";
import { analyzeOrganizationStructure } from "./modules/organization/organization-structure-engine.mjs";
import { buildOrganizationGrowthDecision } from "./modules/organization/organization-growth-options-engine.mjs";

const params = new URLSearchParams(location.search);
const sampleMode = params.get("sample") === "1";
const reportId = params.get("report");
const status = document.getElementById("reportStatus");
const title = document.getElementById("reportTitle");
const lead = document.getElementById("reportLead");
const workspaceLink = document.getElementById("backWorkspace");
const roots = {
  summary: document.getElementById("reportSummary"),
  signals: document.getElementById("reportSignals"),
  question: document.getElementById("reportQuestion"),
  references: document.getElementById("reportReferences"),
  options: document.getElementById("reportOptions"),
  comparison: document.getElementById("reportComparison"),
  recommendation: document.getElementById("reportRecommendation"),
  choice: document.getElementById("reportChoice"),
  implementation: document.getElementById("reportImplementation"),
  triggers: document.getElementById("reportTriggers"),
  trust: document.getElementById("reportTrust")
};

let reportRecord = null;
let payload = null;
let selectedOptionKey = null;

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"})[ch]);
}

function list(items = []) {
  return `<ul>${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
}

function samplePayload() {
  const answers = {
    companyName: "Northstar Cloud (sample)",
    industry: "B2B software / SaaS",
    employees: "120",
    growthStage: "Growth",
    businessModel: "Business-to-business",
    locations: "1",
    productsCount: "2",
    customerSegments: "Mid-market and enterprise",
    planningHorizon: "18 months",
    expectedEmployees: "205",
    revenueGrowth: "Rapid",
    profitGrowth: "Improving",
    customerGrowth: "Rapid",
    productGrowth: "Several",
    geographyGrowth: "New country",
    businessLineGrowth: "Possible",
    acquisitionPlans: "None",
    expansion: "Two new products and initial expansion into Singapore",
    headcountFlexibility: "Limited — 1–3 roles",
    leadershipBudget: "Selective investment possible",
    layerPreference: "Avoid new layers where possible",
    founderInvolvement: "Delegate more recurring decisions",
    internalTalent: "Some roles could",
    constraintsNotes: "Keep leadership additions selective while the next funding milestone is pending.",
    multipleRoleOwnership: "Yes",
    combinedRoleStatus: "Starting to feel stretched",
    combinedRoles: "Product + Engineering leadership",
    criticalSharedRoles: "Product priorities and engineering execution",
    managerCount: "11",
    reportingLevels: "2",
    founderDirectReports: "9",
    departments: "Product, Engineering, Sales, Customer Success, Finance, People",
    managerRole: "player-coach",
    workComplexity: "complex",
    workStandardization: "mixed",
    teamIndependence: "mixed",
    coachingIntensity: "medium",
    roleClarity: "mixed",
    decisionRights: "mixed",
    governanceCadence: "biweekly",
    coordinationFriction: "some",
    founderDecisions: "pricing exceptions, senior hiring, major product investment",
    decisionPain: "Product priorities and customer exceptions often escalate to the founder."
  };
  const legacyInput = {
    shared: { companyName: answers.companyName, email: "sample@example.com", industry: answers.industry, employees: 120, growthStage: answers.growthStage, expectedEmployees: 205 },
    workforce: { totalEmployees: 120, expectedEmployees12Months: 205 },
    geography: { operatingLocationCount: 1 },
    organization: {
      peopleManagerCount: 11,
      reportingLevels: 2,
      founderDirectReports: 9,
      locations: 1,
      departments: answers.departments.split(",").map((v) => v.trim()),
      managerRole: answers.managerRole,
      workComplexity: answers.workComplexity,
      workStandardization: answers.workStandardization,
      teamIndependence: answers.teamIndependence,
      coachingIntensity: answers.coachingIntensity,
      founderDecisions: answers.founderDecisions,
      expansion: answers.expansion,
      roleClarity: answers.roleClarity,
      decisionRights: answers.decisionRights,
      governanceCadence: answers.governanceCadence,
      coordinationFriction: answers.coordinationFriction,
      confirmedAt: new Date().toISOString()
    }
  };
  const baseAnalysis = analyzeOrganizationStructure(legacyInput);
  const decision = buildOrganizationGrowthDecision({ answers, legacyAnalysis: baseAnalysis });
  return { schemaVersion: "0.1-prototype-sample", answers, baseAnalysis, decision, generatedAt: new Date().toISOString() };
}

function signalCard(label, value) {
  return `<div class="signal-card"><div class="signal-label">${esc(label)}</div><div class="signal-value">${esc(value || "Not specified")}</div></div>`;
}

function pressureLabel(entry) {
  const status = entry?.status || "needs-information";
  return status === "action" ? "Increasing pressure" : status === "watch" ? "Watch as growth lands" : status === "stable" ? "Workable from current inputs" : "More information would help";
}

function renderSummary() {
  const { answers, decision, baseAnalysis } = payload;
  title.textContent = sampleMode ? `${answers.companyName} · Sample decision report` : `${answers.companyName || "Your company"} · Organization Structure & Growth`;
  lead.textContent = decision.currentStateMessage;
  roots.summary.innerHTML = `
    <div class="prototype-kicker">Executive view</div>
    <h2>What the current information suggests</h2>
    <p class="prototype-lead">${esc(decision.currentStateMessage)}</p>
    <div class="signal-grid">
      ${signalCard("Company stage", answers.growthStage)}
      ${signalCard("Current employees", answers.employees)}
      ${signalCard("Planning horizon", answers.planningHorizon)}
      ${signalCard("Expected employees", answers.expectedEmployees || "Unknown")}
    </div>
    <div class="prototype-card" style="margin-top:16px"><h3>Existing deterministic structure check</h3><p>${esc(baseAnalysis?.reportModel?.executiveSummary || "The current structural analysis is included in the decision package.")}</p></div>`;
}

function renderSignals() {
  const { decision } = payload;
  const growth = decision.growthVector;
  const pressure = decision.structuralPressure;
  roots.signals.innerHTML = `
    <div class="prototype-kicker">Growth & pressure map</div>
    <h2>What is changing — and where the structure may feel it</h2>
    <p class="prototype-lead">GrowWithHR separates growth dimensions so a company with stable headcount but fast product or geographic expansion is not treated the same as a company that is simply hiring quickly.</p>
    <h3>Growth dimensions</h3>
    <div class="signal-grid">
      ${signalCard("Headcount", growth.headcountGrowthPercent === null ? "Unknown" : `${growth.headcountGrowthPercent >= 0 ? "+" : ""}${growth.headcountGrowthPercent}%`)}
      ${signalCard("Product", growth.product.band)}
      ${signalCard("Geography", growth.geography.band)}
      ${signalCard("Customers", growth.customer.band)}
      ${signalCard("Revenue", growth.revenue.band)}
      ${signalCard("Business lines", growth.businessLines.band)}
      ${signalCard("Acquisitions", growth.acquisitions.band)}
      ${signalCard("Headcount constraint", decision.constraints.headcountFlexibility)}
    </div>
    <h3 style="margin-top:22px">Structural pressure signals</h3>
    <div class="signal-grid">
      ${signalCard("Management capacity", pressureLabel(pressure.managementCapacity))}
      ${signalCard("Founder dependency", pressureLabel(pressure.founderDependency))}
      ${signalCard("Decision ownership", pressureLabel(pressure.decisionOwnership))}
      ${signalCard("Coordination", pressureLabel(pressure.coordination))}
      ${signalCard("Role clarity", pressureLabel(pressure.roleClarity))}
      ${signalCard("Responsibility concentration", pressureLabel(pressure.responsibilityConcentration))}
      ${signalCard("Business complexity", pressureLabel(pressure.businessComplexity))}
    </div>`;
}

function renderQuestion() {
  roots.question.innerHTML = `<div class="prototype-kicker">The organization question to solve</div><h2>${esc(payload.decision.coreOrganizationQuestion)}</h2><p class="prototype-lead">The options below are compared against this question rather than against a generic idea of a “perfect” organization structure.</p>`;
}

function renderReferences() {
  const refs = payload.decision.referencePoints || [];
  roots.references.innerHTML = `<div class="prototype-kicker">External reference points</div><h2>What public frameworks and references contribute</h2><p class="prototype-lead">These references support principles or comparisons. They do not prescribe GrowWithHR's recommendation for your company.</p><div class="reference-list">${refs.map((ref) => `<article class="reference-item"><strong>${esc(ref.name)}</strong><p>${esc(ref.applicability || ref.note)}</p><p style="font-size:.88rem">${esc(ref.reuseStatus)}</p><a href="${esc(ref.url)}" target="_blank" rel="noopener">Open source/reference ↗</a></article>`).join("")}</div>`;
}

function optionCard(option, recommendedKey) {
  const recommended = option.key === recommendedKey;
  return `<article class="option-card${recommended ? " is-recommended" : ""}">
    <span class="option-badge${recommended ? " recommended" : ""}">${recommended ? "GrowWithHR suggested direction" : "Viable alternative"}</span>
    <h3>${esc(option.name)}</h3>
    <p>${esc(option.short)}</p>
    <div><strong>Headcount implication</strong><p>${esc(option.headcount)}</p></div>
    <div><strong>Best when</strong><p>${esc(option.bestWhen)}</p></div>
    <div><strong>Advantages</strong>${list(option.pros)}</div>
    <div><strong>Trade-offs</strong>${list(option.cons)}</div>
    <div><strong>What it may not solve</strong>${list(option.doesNotSolve)}</div>
    <div><strong>How long it may fit</strong><p>${esc(option.longevity)}</p></div>
    ${sampleMode ? `<button class="prototype-btn secondary" type="button" disabled>Sample option</button>` : `<button class="prototype-btn${recommended ? "" : " secondary"}" type="button" data-select-option="${esc(option.key)}">Choose this direction</button>`}
  </article>`;
}

function renderOptions() {
  const { options, recommendedOptionKey } = payload.decision;
  roots.options.innerHTML = `<div class="prototype-kicker">Structural choices</div><h2>Three credible ways the structure could evolve</h2><p class="prototype-lead">These are choices, not a hidden “right answer”. Each option is tested against the growth pattern and constraints you supplied.</p><div class="option-grid">${options.map((option) => optionCard(option, recommendedOptionKey)).join("")}</div>`;
}

function renderComparison() {
  const options = payload.decision.options;
  roots.comparison.innerHTML = `<div class="prototype-kicker">Side-by-side comparison</div><h2>Compare the trade-offs before choosing</h2><div class="table-wrap"><table class="decision-table"><thead><tr><th>Decision factor</th>${options.map((o) => `<th>${esc(o.name)}</th>`).join("")}</tr></thead><tbody>
    <tr><td>Headcount</td>${options.map((o) => `<td>${esc(o.headcount)}</td>`).join("")}</tr>
    <tr><td>Cost</td>${options.map((o) => `<td>${esc(o.cost)}</td>`).join("")}</tr>
    <tr><td>Change disruption</td>${options.map((o) => `<td>${esc(o.disruption)}</td>`).join("")}</tr>
    <tr><td>What it solves</td>${options.map((o) => `<td>${esc(o.solves.join(" · "))}</td>`).join("")}</tr>
    <tr><td>What it does not solve</td>${options.map((o) => `<td>${esc(o.doesNotSolve.join(" · "))}</td>`).join("")}</tr>
    <tr><td>Why it scored this way</td>${options.map((o) => `<td>${esc((o.scoreReasons || []).join(" ") || "No dominant scoring reason.")}</td>`).join("")}</tr>
  </tbody></table></div>`;
}

function renderRecommendation() {
  const recommended = payload.decision.recommendedDirection;
  roots.recommendation.innerHTML = `<div class="prototype-kicker">GrowWithHR suggested direction</div><h2>${esc(recommended?.name || "No single suggested direction yet")}</h2><p class="prototype-lead">${esc(recommended?.wording || "More information is needed before a direction can be suggested.")}</p>${recommended?.reason?.length ? `<div class="prototype-card"><h3>Why this direction is currently favored</h3>${list(recommended.reason)}</div>` : ""}<p style="margin-top:16px"><strong>The final organization decision remains yours.</strong> You can choose another viable option and GrowWithHR will build the implementation path around that choice.</p>`;
}

function selectedOption() {
  return payload.decision.options.find((option) => option.key === selectedOptionKey) || null;
}

function renderChoice() {
  if (sampleMode) {
    roots.choice.innerHTML = `<div class="prototype-kicker">Management choice</div><h2>In a real report, the user chooses the direction</h2><p class="prototype-lead">The sample keeps this read-only. In the signed-in experience, the chosen direction is stored separately from GrowWithHR's suggested direction.</p>`;
    return;
  }
  const option = selectedOption();
  roots.choice.innerHTML = option
    ? `<div class="prototype-kicker">Your selected direction</div><h2>${esc(option.name)}</h2><p class="prototype-lead">You selected this direction. ${option.key === payload.decision.recommendedOptionKey ? "It matches the current GrowWithHR suggestion." : "It differs from the current GrowWithHR suggestion, which is valid — the implementation plan below is now adapted to your selected direction."}</p><div class="prototype-actions"><button class="prototype-btn secondary" type="button" data-change-choice>Change my selection</button></div>`
    : `<div class="prototype-kicker">Your decision</div><h2>Choose the direction that fits your business reality</h2><p class="prototype-lead">GrowWithHR has suggested one direction, but no choice has been recorded yet. Use the buttons on the option cards above.</p>`;
}

function renderImplementation() {
  const option = selectedOption() || payload.decision.options.find((o) => o.key === payload.decision.recommendedOptionKey);
  const plan = option ? payload.decision.implementationPlans?.[option.key] : null;
  if (!option || !plan) {
    roots.implementation.innerHTML = `<div class="prototype-kicker">Implementation</div><h2>Choose an option to build the implementation path</h2>`;
    return;
  }
  const fallbackNote = selectedOptionKey ? "This plan follows the direction you selected." : "No management choice has been recorded yet, so this preview follows GrowWithHR's suggested direction.";
  roots.implementation.innerHTML = `
    <div class="prototype-kicker">How to make the selected structure work</div>
    <h2>${esc(option.name)} · implementation path</h2>
    <p class="prototype-lead">${esc(fallbackNote)}</p>
    <div class="prototype-grid">
      <article class="prototype-card"><h3>Days 0–30</h3>${list(plan.first30Days)}</article>
      <article class="prototype-card"><h3>Days 30–60</h3>${list(plan.days30to60)}</article>
      <article class="prototype-card"><h3>Days 60–90</h3>${list(plan.days60to90)}</article>
      <article class="prototype-card"><h3>Months 3–6</h3>${list(plan.months3to6)}</article>
    </div>
    <div class="prototype-card" style="margin-top:16px"><h3>Monitor whether the change is working</h3>${list(plan.measures)}<p>${esc(plan.note)}</p></div>`;
}

function renderTriggers() {
  roots.triggers.innerHTML = `<div class="prototype-kicker">Evolution, not a permanent org chart</div><h2>When to reassess</h2>${list(payload.decision.reviewTriggers)}<div class="prototype-card" style="margin-top:16px"><h3>What GrowWithHR does not currently suggest changing yet</h3>${list(payload.decision.whatNotToChangeYet)}</div>`;
}

function renderTrust() {
  const trust = payload.decision.trustTrace;
  const confidence = payload.decision.confidence;
  roots.trust.innerHTML = `<div class="prototype-kicker">How GrowWithHR arrived here</div><h2>Inspect the reasoning rather than trusting a black box</h2><div class="trust-trace">
    <div class="trace-step"><strong>1 · Your company facts</strong><span>${esc(trust.factsConsidered.length)} supplied fields were available to the decision layer.</span></div>
    <div class="trace-step"><strong>2 · Deterministic structure analysis</strong><span>${esc(trust.deterministicAnalysis.length)} structural findings were generated from explicit rule paths.</span></div>
    <div class="trace-step"><strong>3 · External reference points</strong><span>${esc(trust.externalReferences.join(", ") || "None")}</span></div>
    <div class="trace-step"><strong>4 · Option comparison</strong><span>Growth pattern, constraints and structural pressures were used to rank viable alternatives.</span></div>
  </div>
  <div class="prototype-grid" style="margin-top:18px">
    <article class="prototype-card"><h3>Recommendation confidence: ${esc(confidence.label)}</h3><p>${esc(confidence.meaning)}</p>${confidence.missingInputs?.length ? `<strong>Inputs that would improve confidence</strong>${list(confidence.missingInputs)}` : "<p>No major prototype-required inputs are missing.</p>"}</article>
    <article class="prototype-card"><h3>What could change the conclusion?</h3>${list(trust.whatCouldChangeTheConclusion)}</article>
  </div>
  <div class="prototype-card" style="margin-top:16px"><h3>Source boundary</h3><p>${esc(trust.interpretationBoundary)}</p></div>`;
}

function renderAll() {
  renderSummary();
  renderSignals();
  renderQuestion();
  renderReferences();
  renderOptions();
  renderComparison();
  renderRecommendation();
  renderChoice();
  renderImplementation();
  renderTriggers();
  renderTrust();
  bindChoiceButtons();
}

function bindChoiceButtons() {
  document.querySelectorAll("[data-select-option]").forEach((button) => {
    button.addEventListener("click", async () => {
      const key = button.dataset.selectOption;
      const option = payload.decision.options.find((item) => item.key === key);
      if (!option) return;
      selectedOptionKey = key;
      status.textContent = `Saving your selected direction: ${option.name}…`;
      try {
        await updateReportChoice(reportRecord.id, key, payload.decision.implementationPlans[key]);
        reportRecord.selected_option_key = key;
        renderChoice();
        renderImplementation();
        status.textContent = `✓ Your selected direction is saved separately from GrowWithHR's suggested direction.`;
        document.getElementById("reportChoice").scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (error) {
        status.textContent = error.message || "Your selection could not be saved yet.";
        status.className = "prototype-status prototype-error";
      }
    });
  });
  document.querySelectorAll("[data-change-choice]").forEach((button) => button.addEventListener("click", () => roots.options.scrollIntoView({ behavior: "smooth" })));
}

async function loadRealReport() {
  const user = await getUser();
  if (!user) {
    const target = `organization-growth-report-beta.html?report=${encodeURIComponent(reportId || "")}`;
    location.replace(`auth.html?return=${encodeURIComponent(target)}`);
    return false;
  }
  if (!reportId) throw new Error("No report was selected.");
  reportRecord = await getReport(reportId);
  if (!reportRecord) throw new Error("This report was not found in your signed-in account.");
  payload = reportRecord.payload;
  selectedOptionKey = reportRecord.selected_option_key || null;
  return true;
}

document.getElementById("printReport").addEventListener("click", () => window.print());

async function boot() {
  try {
    if (sampleMode) {
      payload = samplePayload();
      workspaceLink.textContent = "Sign in to run your own assessment";
      workspaceLink.href = "auth.html?return=organization-growth-beta.html";
      selectedOptionKey = null;
      status.textContent = "Public sample report · no sign-in required.";
      renderAll();
      return;
    }
    if (!(await loadRealReport())) return;
    status.textContent = "Signed-in report · your option selection will be saved to your account.";
    renderAll();
  } catch (error) {
    status.textContent = error.message || "This report could not be loaded.";
    status.className = "prototype-status prototype-error";
    Object.values(roots).forEach((root) => { root.hidden = true; });
  }
}

boot();
