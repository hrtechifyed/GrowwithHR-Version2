import { analyzeOrganizationStructure } from "./modules/organization/organization-structure-engine.mjs";
import { buildOrganizationGrowthDecision } from "./modules/organization/organization-growth-options-engine.mjs";
import { getLocalWorkspace, loadReport, updateReport } from "./zero-cost-report-vault.mjs";

const params = new URLSearchParams(location.search);
const sampleMode = params.get("sample") === "1";
const reportId = params.get("report");
const createdNow = params.get("created") === "1";
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

let payload = null;
let recoveryCode = "";
let selectedOptionKey = null;

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" })[ch]);
}

function list(items = []) {
  return `<ul>${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
}

function samplePayload() {
  const answers = {
    companyName: "Northstar Cloud (sample)", industry: "B2B software / SaaS", employees: "120", growthStage: "Growth",
    businessModel: "Business-to-business", locations: "1", productsCount: "2", customerSegments: "Mid-market and enterprise",
    planningHorizon: "18 months", expectedEmployees: "205", revenueGrowth: "Rapid", profitGrowth: "Improving",
    customerGrowth: "Rapid", productGrowth: "Several", geographyGrowth: "New country", businessLineGrowth: "Possible",
    acquisitionPlans: "None", expansion: "Two new products and initial expansion into Singapore",
    headcountFlexibility: "Limited — 1–3 roles", leadershipBudget: "Selective investment possible",
    layerPreference: "Avoid new layers where possible", founderInvolvement: "Delegate more recurring decisions",
    internalTalent: "Some roles could", constraintsNotes: "Keep leadership additions selective while the next funding milestone is pending.",
    multipleRoleOwnership: "Yes", combinedRoleStatus: "Starting to feel stretched", combinedRoles: "Product + Engineering leadership",
    criticalSharedRoles: "Product priorities and engineering execution", managerCount: "11", reportingLevels: "2",
    founderDirectReports: "9", departments: "Product, Engineering, Sales, Customer Success, Finance, People",
    managerRole: "player-coach", workComplexity: "complex", workStandardization: "mixed", teamIndependence: "mixed",
    coachingIntensity: "medium", roleClarity: "mixed", decisionRights: "mixed", governanceCadence: "biweekly",
    coordinationFriction: "some", founderDecisions: "pricing exceptions, senior hiring, major product investment",
    decisionPain: "Product priorities and customer exceptions often escalate to the founder."
  };
  const baseInput = {
    shared: { companyName: answers.companyName, email: "", industry: answers.industry, employees: 120, growthStage: answers.growthStage, expectedEmployees: 205 },
    workforce: { totalEmployees: 120, expectedEmployees12Months: 205 },
    geography: { operatingLocationCount: 1 },
    organization: {
      peopleManagerCount: 11, reportingLevels: 2, founderDirectReports: 9, locations: 1,
      departments: answers.departments.split(",").map((v) => v.trim()), managerRole: answers.managerRole,
      workComplexity: answers.workComplexity, workStandardization: answers.workStandardization,
      teamIndependence: answers.teamIndependence, coachingIntensity: answers.coachingIntensity,
      founderDecisions: answers.founderDecisions, expansion: answers.expansion, roleClarity: answers.roleClarity,
      decisionRights: answers.decisionRights, governanceCadence: answers.governanceCadence,
      coordinationFriction: answers.coordinationFriction, confirmedAt: new Date().toISOString()
    }
  };
  const baseAnalysis = analyzeOrganizationStructure(baseInput);
  const decision = buildOrganizationGrowthDecision({ answers, legacyAnalysis: baseAnalysis });
  return { schemaVersion: "0.2-zero-cost-sample", answers, baseAnalysis, decision, selectedOptionKey: null, generatedAt: new Date().toISOString() };
}

function signalCard(label, value) {
  return `<div class="signal-card"><div class="signal-label">${esc(label)}</div><div class="signal-value">${esc(value || "Not specified")}</div></div>`;
}

function pressureLabel(entry) {
  const value = entry?.status || "needs-information";
  if (value === "action") return "Increasing pressure";
  if (value === "watch") return "Watch as growth lands";
  if (value === "stable") return "Workable from current inputs";
  return "More information would help";
}

function selectedOption() {
  return payload?.decision?.options?.find((option) => option.key === selectedOptionKey) || null;
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
    <div class="prototype-card" style="margin-top:16px"><h3>Existing deterministic structure check</h3><p>${esc(baseAnalysis?.reportModel?.executiveSummary || "The existing GrowWithHR structure analysis is included underneath this decision layer.")}</p></div>`;
}

function renderSignals() {
  const growth = payload.decision.growthVector;
  const pressure = payload.decision.structuralPressure;
  roots.signals.innerHTML = `
    <div class="prototype-kicker">Growth & pressure map</div>
    <h2>What is changing — and where the structure may feel it</h2>
    <p class="prototype-lead">Growth dimensions are separated so headcount, products, customers and geography do not get treated as the same kind of organizational change.</p>
    <div class="signal-grid">
      ${signalCard("Headcount", growth.headcountGrowthPercent === null ? "Unknown" : `${growth.headcountGrowthPercent >= 0 ? "+" : ""}${growth.headcountGrowthPercent}%`)}
      ${signalCard("Product", growth.product.band)}
      ${signalCard("Geography", growth.geography.band)}
      ${signalCard("Customers", growth.customer.band)}
      ${signalCard("Revenue", growth.revenue.band)}
      ${signalCard("Business lines", growth.businessLines.band)}
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
  roots.question.innerHTML = `<div class="prototype-kicker">The organization question to solve</div><h2>${esc(payload.decision.coreOrganizationQuestion)}</h2><p class="prototype-lead">The options below are compared against this business question rather than against a generic idea of a perfect org chart.</p>`;
}

function renderReferences() {
  const refs = payload.decision.referencePoints || [];
  roots.references.innerHTML = `<div class="prototype-kicker">External reference points</div><h2>What public frameworks contribute</h2><p class="prototype-lead">Reference points support principles and comparisons. They do not prescribe GrowWithHR's recommendation for your company.</p><div class="reference-list">${refs.map((ref) => `<article class="reference-item"><strong>${esc(ref.name)}</strong><p>${esc(ref.applicability || ref.note)}</p><p style="font-size:.88rem">${esc(ref.reuseStatus || "Reference use only")}</p><a href="${esc(ref.url)}" target="_blank" rel="noopener">Open source/reference ↗</a></article>`).join("")}</div>`;
}

function optionCard(option, recommendedKey) {
  const recommended = option.key === recommendedKey;
  return `<article class="option-card${recommended ? " is-recommended" : ""}">
    <span class="option-badge${recommended ? " recommended" : ""}">${recommended ? "GrowWithHR suggested direction" : "Viable alternative"}</span>
    <h3>${esc(option.name)}</h3><p>${esc(option.short)}</p>
    <div><strong>Headcount implication</strong><p>${esc(option.headcount)}</p></div>
    <div><strong>Best when</strong><p>${esc(option.bestWhen)}</p></div>
    <div><strong>Advantages</strong>${list(option.pros)}</div>
    <div><strong>Trade-offs</strong>${list(option.cons)}</div>
    <div><strong>What it may not solve</strong>${list(option.doesNotSolve)}</div>
    <div><strong>How long it may fit</strong><p>${esc(option.longevity)}</p></div>
    ${sampleMode ? "" : `<button class="prototype-btn${recommended ? "" : " secondary"}" type="button" data-select-option="${esc(option.key)}">${selectedOptionKey === option.key ? "Selected" : "Choose this direction"}</button>`}
  </article>`;
}

function renderOptions() {
  const { options, recommendedOptionKey } = payload.decision;
  roots.options.innerHTML = `<div class="prototype-kicker">Structural choices</div><h2>Credible ways the structure could evolve</h2><p class="prototype-lead">These are choices, not a hidden right answer. Each option is tested against the growth pattern and constraints supplied.</p><div class="option-grid">${options.map((option) => optionCard(option, recommendedOptionKey)).join("")}</div>`;
}

function renderComparison() {
  const options = payload.decision.options;
  roots.comparison.innerHTML = `<div class="prototype-kicker">Side-by-side comparison</div><h2>Compare the trade-offs before choosing</h2><div class="table-wrap"><table class="decision-table"><thead><tr><th>Decision factor</th>${options.map((o) => `<th>${esc(o.name)}</th>`).join("")}</tr></thead><tbody>
    <tr><td>Headcount</td>${options.map((o) => `<td>${esc(o.headcount)}</td>`).join("")}</tr>
    <tr><td>Cost</td>${options.map((o) => `<td>${esc(o.cost)}</td>`).join("")}</tr>
    <tr><td>Change disruption</td>${options.map((o) => `<td>${esc(o.disruption)}</td>`).join("")}</tr>
    <tr><td>What it solves</td>${options.map((o) => `<td>${esc(o.solves.join(" · "))}</td>`).join("")}</tr>
    <tr><td>What it does not solve</td>${options.map((o) => `<td>${esc(o.doesNotSolve.join(" · "))}</td>`).join("")}</tr>
  </tbody></table></div>`;
}

function renderRecommendation() {
  const recommended = payload.decision.recommendedDirection;
  roots.recommendation.innerHTML = `<div class="prototype-kicker">GrowWithHR suggested direction</div><h2>${esc(recommended?.name || "No single suggested direction yet")}</h2><p class="prototype-lead">${esc(recommended?.wording || "More information is needed before a direction can be suggested.")}</p>${recommended?.reason?.length ? `<div class="prototype-card"><h3>Why this direction is currently favored</h3>${list(recommended.reason)}</div>` : ""}<p style="margin-top:16px"><strong>The final organization decision remains yours.</strong></p>`;
}

function renderChoice() {
  if (sampleMode) {
    roots.choice.innerHTML = `<div class="prototype-kicker">Management choice</div><h2>The real user chooses the direction</h2><p class="prototype-lead">The sample is read-only. In a real report, GrowWithHR stores the user's selected direction separately from its own suggested direction.</p>`;
    return;
  }
  const option = selectedOption();
  roots.choice.innerHTML = option
    ? `<div class="prototype-kicker">Your selected direction</div><h2>${esc(option.name)}</h2><p class="prototype-lead">${option.key === payload.decision.recommendedOptionKey ? "Your choice matches the current GrowWithHR suggestion." : "Your choice differs from GrowWithHR's current suggestion. That is valid — the implementation plan follows the direction you selected."}</p>`
    : `<div class="prototype-kicker">Your decision</div><h2>Choose the direction that fits your business reality</h2><p class="prototype-lead">GrowWithHR has suggested one direction, but no management choice has been recorded yet.</p>`;
}

function renderImplementation() {
  const option = selectedOption() || payload.decision.options.find((o) => o.key === payload.decision.recommendedOptionKey);
  const plan = option ? payload.decision.implementationPlans?.[option.key] : null;
  if (!option || !plan) {
    roots.implementation.innerHTML = `<div class="prototype-kicker">Implementation</div><h2>Choose an option to build the implementation path</h2>`;
    return;
  }
  roots.implementation.innerHTML = `<div class="prototype-kicker">How to make the selected structure work</div><h2>${esc(option.name)} · implementation path</h2><p class="prototype-lead">${selectedOptionKey ? "This plan follows the direction you selected." : "Until you choose, this preview follows GrowWithHR's suggested direction."}</p><div class="prototype-grid">
    <article class="prototype-card"><h3>Days 0–30</h3>${list(plan.first30Days)}</article>
    <article class="prototype-card"><h3>Days 30–60</h3>${list(plan.days30to60)}</article>
    <article class="prototype-card"><h3>Days 60–90</h3>${list(plan.days60to90)}</article>
    <article class="prototype-card"><h3>Months 3–6</h3>${list(plan.months3to6)}</article>
  </div><div class="prototype-card" style="margin-top:16px"><h3>Measures to watch</h3>${list(plan.measures || [])}<p>${esc(plan.note || "")}</p></div>`;
}

function renderTriggers() {
  roots.triggers.innerHTML = `<div class="prototype-kicker">Evolve deliberately</div><h2>What not to change yet — and when to review again</h2><div class="prototype-grid"><article class="prototype-card"><h3>What not to change yet</h3>${list(payload.decision.whatNotToChangeYet || [])}</article><article class="prototype-card"><h3>Review triggers</h3>${list(payload.decision.reviewTriggers || [])}</article></div>`;
}

function renderTrust() {
  const trust = payload.decision.trustTrace || {};
  const confidence = payload.decision.confidence || {};
  const missing = confidence.missingInputs || [];
  roots.trust.innerHTML = `<div class="prototype-kicker">How GrowWithHR arrived here</div><h2>Inspect the reasoning, not just the recommendation</h2><p class="prototype-lead">GrowWithHR separates the company facts, deterministic structural findings, public references and its own interpretation.</p><div class="prototype-grid">
    <article class="prototype-card"><h3>Facts considered</h3><p>${esc((trust.factsConsidered || []).join(" · ") || "No facts recorded")}</p></article>
    <article class="prototype-card"><h3>Confidence</h3><p><strong>${esc(confidence.label || "Context-dependent")}</strong></p><p>${esc(confidence.meaning || "Confidence depends on the completeness of the information supplied.")}</p></article>
    <article class="prototype-card"><h3>Information that could change the conclusion</h3>${missing.length ? list(missing) : "<p>No priority missing inputs were identified by the prototype.</p>"}</article>
    <article class="prototype-card"><h3>Interpretation boundary</h3><p>${esc(trust.interpretationBoundary || "Public sources support principles. GrowWithHR remains responsible for how those principles are interpreted against company facts.")}</p></article>
  </div>`;
}

function renderAll() {
  selectedOptionKey = payload.selectedOptionKey || null;
  renderSummary(); renderSignals(); renderQuestion(); renderReferences(); renderOptions(); renderComparison(); renderRecommendation(); renderChoice(); renderImplementation(); renderTriggers(); renderTrust();
}

function showCredentials() {
  if (sampleMode || !createdNow || !reportId) return;
  const local = getLocalWorkspace();
  if (!local?.recoveryCode) return;
  const header = status.closest("header");
  if (!header || header.querySelector("[data-recovery-credentials]")) return;
  const box = document.createElement("div");
  box.dataset.recoveryCredentials = "";
  box.className = "prototype-card";
  box.style.marginTop = "18px";
  box.innerHTML = `<div class="prototype-kicker">Keep these recovery details</div><h3>Your report is saved</h3><p>This report does not require an account. Keep both values private. You can use them from <strong>My Reports</strong> to recover the report later.</p><div class="review-row"><span>Report ID</span><strong><code>${esc(reportId)}</code></strong></div><div class="review-row"><span>Recovery Code</span><strong><code>${esc(local.recoveryCode)}</code></strong></div><div class="prototype-actions"><button type="button" class="prototype-btn secondary" data-copy-recovery>Copy recovery details</button><a class="prototype-btn secondary" href="my-reports.html">Open My Reports</a></div>`;
  header.appendChild(box);
  box.querySelector("[data-copy-recovery]")?.addEventListener("click", async () => {
    await navigator.clipboard.writeText(`GrowWithHR Report ID: ${reportId}\nRecovery Code: ${local.recoveryCode}`);
    status.textContent = "Recovery details copied.";
  });
}

function recoveryPrompt(message = "Enter the Recovery Code associated with this report.") {
  const header = status.closest("header");
  if (!header) return;
  status.textContent = message;
  const form = document.createElement("form");
  form.className = "prototype-card";
  form.style.marginTop = "16px";
  form.innerHTML = `<h3>Recover this report</h3><div class="prototype-field"><label for="reportRecoveryCode">Recovery Code</label><input id="reportRecoveryCode" autocomplete="off" placeholder="XXXX-XXXX-XXXX-XXXX-XXXX" required></div><div class="prototype-actions"><button class="prototype-btn" type="submit">Recover Report</button><a class="prototype-btn secondary" href="my-reports.html">My Reports</a></div>`;
  header.appendChild(form);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const code = form.querySelector("#reportRecoveryCode").value.trim();
    status.textContent = "Recovering encrypted report…";
    try {
      const loaded = await loadReport(reportId, code);
      payload = loaded.payload;
      recoveryCode = loaded.recoveryCode;
      form.remove();
      status.textContent = "Report recovered.";
      renderAll();
    } catch (error) {
      status.textContent = error.message || "That report could not be recovered.";
    }
  });
}

async function persistSelection(optionKey) {
  selectedOptionKey = optionKey;
  payload.selectedOptionKey = optionKey;
  renderOptions(); renderChoice(); renderImplementation();
  if (sampleMode || !reportId) return;
  status.textContent = "Saving your selected direction…";
  try {
    await updateReport({
      reportId,
      recoveryCode,
      payload,
      metadata: {
        companyName: payload.answers?.companyName || "",
        growthStage: payload.answers?.growthStage || "",
        selectedOptionKey,
        schemaVersion: payload.schemaVersion || ""
      }
    });
    status.textContent = "✓ Your selected direction is saved with this report.";
  } catch (error) {
    status.textContent = `${error.message || "Your choice could not be synced."} Keep this browser open until you retry.`;
  }
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-select-option]");
  if (button) persistSelection(button.dataset.selectOption);
});

document.getElementById("printReport")?.addEventListener("click", () => window.print());
if (workspaceLink) {
  workspaceLink.href = "my-reports.html";
  workspaceLink.textContent = "My Reports";
}

async function boot() {
  if (sampleMode) {
    payload = samplePayload();
    renderAll();
    status.textContent = "Public sample report · no sign-in required.";
    return;
  }
  if (!reportId) {
    status.textContent = "No Report ID was supplied.";
    return;
  }
  try {
    const loaded = await loadReport(reportId);
    payload = loaded.payload;
    recoveryCode = loaded.recoveryCode;
    renderAll();
    status.textContent = loaded.source === "device" ? "Report loaded from this device." : "Report recovered securely.";
    showCredentials();
  } catch (error) {
    recoveryPrompt(error.message || "Enter the Recovery Code associated with this report.");
  }
}

boot();
