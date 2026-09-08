export const ENGINE_ID = "workforce-capability";
export const ENGINE_VERSION = "1.0.0";
export const RULESET_VERSION = "WCP-2026.1";

export const FRAMEWORKS = Object.freeze({
  cipd: Object.freeze({
    id: "cipd",
    name: "CIPD Strategic Workforce Planning",
    lens: "Workforce planning",
    sourceUrl: "https://www.cipd.org/uk/knowledge/guides/strategic-workforce-planning/",
    purpose: "Structures baseline, workforce supply, workforce demand, gap analysis, action planning and delivery, with the seven-rights completeness check."
  }),
  capability: Object.freeze({
    id: "capability",
    name: "GrowWithHR Capability Cascade",
    lens: "Capability-led planning",
    sourceUrl: "workforce-capability-methodology.html#capability-cascade",
    purpose: "Connects business strategy to critical capabilities, work, skills, roles and workforce capacity without treating skills and capabilities as interchangeable."
  }),
  scenario: Object.freeze({
    id: "scenario",
    name: "GrowWithHR Scenario & Work Redesign Lens",
    lens: "Scenario / work redesign",
    sourceUrl: "workforce-capability-methodology.html#scenario-planning",
    purpose: "Tests how workforce demand changes under base growth, higher growth and work-redesign assumptions rather than presenting one forecast as certain."
  }),
  esco: Object.freeze({
    id: "esco",
    name: "ESCO",
    lens: "Occupation and skills taxonomy",
    sourceUrl: "https://esco.ec.europa.eu/en/classification",
    referenceVersion: "ESCO v1.2.1",
    purpose: "Reference vocabulary for occupations, skills and knowledge. ESCO does not decide whether the company has a capability gap."
  }),
  onet: Object.freeze({
    id: "onet",
    name: "O*NET Content Model",
    lens: "Work, task and skill reference",
    sourceUrl: "https://www.onetcenter.org/content.html",
    referenceVersion: "O*NET 31.0 reference",
    purpose: "Reference structure for work activities, tasks, skills and knowledge. O*NET does not decide company workforce demand."
  })
});

const INTERVENTIONS = Object.freeze({
  build: Object.freeze({ id: "build", label: "Build", time: "6–12 months", ruleId: "WCP-ACTION-BUILD-01" }),
  buy: Object.freeze({ id: "buy", label: "Buy", time: "3–6 months", ruleId: "WCP-ACTION-BUY-01" }),
  borrow: Object.freeze({ id: "borrow", label: "Borrow", time: "1–3 months", ruleId: "WCP-ACTION-BORROW-01" }),
  bind: Object.freeze({ id: "bind", label: "Bind", time: "1–3 months", ruleId: "WCP-ACTION-BIND-01" }),
  bot: Object.freeze({ id: "bot", label: "Bot / Automate", time: "3–9 months", ruleId: "WCP-ACTION-BOT-01" }),
  move: Object.freeze({ id: "move", label: "Move / Redeploy", time: "2–4 months", ruleId: "WCP-ACTION-MOVE-01" })
});

function clean(value, fallback = "") {
  return String(value ?? "").replace(/\s+/g, " ").trim() || fallback;
}
function numberOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
function uniq(values) {
  return [...new Set((Array.isArray(values) ? values : []).filter(Boolean))];
}
function titleCase(value) {
  return clean(value).replace(/(^|\s|-)([a-z])/g, (_, lead, c) => `${lead}${c.toUpperCase()}`);
}

function normalizeFrameworkSelection(value) {
  const raw = Array.isArray(value) ? value : [value];
  const selected = uniq(raw.map((item) => clean(item).toLowerCase()).filter((id) => ["cipd", "capability", "scenario"].includes(id)));
  return selected.length >= 2 ? selected : ["cipd", "capability", "scenario"];
}

function normalizeCapability(item = {}, index = 0) {
  const name = clean(item.name);
  if (!name) return null;
  return {
    id: clean(item.id, `CAP-${String(index + 1).padStart(2, "0")}`),
    name,
    importance: clean(item.importance, "important").toLowerCase(),
    currentCoverage: clean(item.currentCoverage, "unknown").toLowerCase(),
    capacityStatus: clean(item.capacityStatus, "unknown").toLowerCase(),
    concentrationRisk: clean(item.concentrationRisk, "unknown").toLowerCase(),
    internalAdjacency: clean(item.internalAdjacency, "unknown").toLowerCase(),
    temporaryNeed: clean(item.temporaryNeed, "no").toLowerCase(),
    workRedesignPotential: clean(item.workRedesignPotential, "unknown").toLowerCase(),
    rolesAffected: clean(item.rolesAffected),
    evidenceNote: clean(item.evidenceNote)
  };
}

function capabilityGap(capability) {
  const rules = [];
  const coverage = capability.currentCoverage;
  const capacity = capability.capacityStatus;
  const importance = capability.importance;
  const concentration = capability.concentrationRisk;

  if (coverage === "unknown") {
    rules.push("WCP-GAP-INFO-01");
    return {
      status: "information-needed",
      label: "Information needed",
      reason: "Future capability demand was identified, but current capability coverage is not known well enough to conclude a gap.",
      rules
    };
  }

  if (["none", "low"].includes(coverage) && ["critical", "important"].includes(importance)) {
    rules.push("WCP-CAP-GAP-04");
    return {
      status: "confirmed-gap",
      label: "Confirmed gap",
      reason: `The capability is ${importance} for the stated strategy and current coverage is ${coverage}.`,
      rules
    };
  }

  if (coverage === "partial" && importance === "critical") {
    rules.push("WCP-CAP-GAP-05");
    return {
      status: "likely-gap",
      label: "Likely gap",
      reason: "The capability is critical to the stated strategy but current coverage is only partial.",
      rules
    };
  }

  if (capacity === "insufficient") {
    rules.push("WCP-CAPACITY-GAP-02");
    return {
      status: "capacity-gap",
      label: "Capacity gap",
      reason: "The capability exists, but the company reported insufficient capacity for the expected demand.",
      rules
    };
  }

  if (capacity === "constrained") {
    rules.push("WCP-CAPACITY-PRESSURE-01");
    return {
      status: "capacity-pressure",
      label: "Capacity pressure",
      reason: "The capability exists, but current capacity is already constrained.",
      rules
    };
  }

  if (["high", "single-point"].includes(concentration) && ["adequate", "partial"].includes(coverage)) {
    rules.push("WCP-CONCENTRATION-01");
    return {
      status: "fragile-coverage",
      label: "Fragile coverage",
      reason: "The capability is present, but it is concentrated enough that continuity or retention exposure may be material.",
      rules
    };
  }

  rules.push("WCP-COVERAGE-OK-01");
  return {
    status: "adequate",
    label: "Adequate for current scenario",
    reason: "The supplied information does not currently indicate a material capability or capacity gap.",
    rules
  };
}

function confidenceFor(capability, economics) {
  const missing = [];
  if (capability.currentCoverage === "unknown") missing.push("current capability coverage");
  if (capability.capacityStatus === "unknown") missing.push("current capacity");
  if (capability.concentrationRisk === "unknown") missing.push("concentration risk");
  if (!capability.rolesAffected) missing.push("roles / workforce segments affected");
  const costInputs = [
    economics.annualCostPerHire,
    economics.trainingCostPerPerson,
    economics.contractorMonthlyCost,
    economics.automationInvestment
  ].filter((value) => value !== null);
  if (!costInputs.length) missing.push("company cost inputs");
  if (missing.length >= 3) return { level: "Low", missing };
  if (missing.length) return { level: "Medium", missing };
  return { level: "High", missing };
}

function interventionCost(id, economics) {
  const currency = clean(economics.currency, "INR");
  const notEstimated = { display: "Not estimated", basis: "No sufficient company cost input was supplied.", source: "information-needed" };
  if (id === "buy") {
    if (economics.annualCostPerHire === null) return notEstimated;
    return {
      display: `${currency} ${Math.round(economics.annualCostPerHire).toLocaleString("en-IN")} per role / year`,
      basis: "Company-supplied annual cost per external hire; role quantity is not invented by GrowWithHR.",
      source: "company-supplied"
    };
  }
  if (id === "build") {
    if (economics.trainingCostPerPerson === null) return notEstimated;
    return {
      display: `${currency} ${Math.round(economics.trainingCostPerPerson).toLocaleString("en-IN")} per person`,
      basis: "Company-supplied training / development cost per person.",
      source: "company-supplied"
    };
  }
  if (id === "borrow") {
    if (economics.contractorMonthlyCost === null) return notEstimated;
    return {
      display: `${currency} ${Math.round(economics.contractorMonthlyCost).toLocaleString("en-IN")} per month`,
      basis: "Company-supplied contractor / partner monthly cost. Duration must be selected during implementation.",
      source: "company-supplied"
    };
  }
  if (id === "bot") {
    if (economics.automationInvestment === null) return notEstimated;
    return {
      display: `${currency} ${Math.round(economics.automationInvestment).toLocaleString("en-IN")} planning envelope`,
      basis: "Company-supplied automation / technology investment assumption.",
      source: "company-supplied"
    };
  }
  return notEstimated;
}

function suggestInterventions(capability, gap, context) {
  const suggestions = [];
  const months = context.horizonMonths;
  const urgent = months !== null && months <= 6;
  const adjacency = capability.internalAdjacency === "yes";
  const temporary = capability.temporaryNeed === "yes";
  const redesign = ["medium", "high"].includes(capability.workRedesignPotential);

  const push = (id, why) => {
    if (suggestions.some((item) => item.id === id)) return;
    const intervention = INTERVENTIONS[id];
    suggestions.push({
      ...intervention,
      why,
      cost: interventionCost(id, context.economics),
      planningAssumption: `Indicative implementation timing: ${intervention.time}. Validate against company hiring, learning, procurement and technology lead times before commitment.`
    });
  };

  if (temporary || urgent) push("borrow", temporary ? "The need was identified as temporary / variable, so external temporary capacity may avoid premature permanent structure." : "The capability is needed quickly; borrowing capacity may create time while a durable option is built.");
  if (gap.status === "confirmed-gap" || gap.status === "likely-gap") {
    if (adjacency && (months === null || months >= 6)) push("build", "Adjacent internal capability exists and there appears to be time to develop the required capability.");
    if (!adjacency || urgent || capability.importance === "critical") push("buy", "The capability is strategically important and current internal coverage is insufficient or timing is tight.");
  }
  if (adjacency && !temporary) push("move", "Adjacent internal capability exists, so redeployment or role movement should be tested before defaulting to external hiring.");
  if (["high", "single-point"].includes(capability.concentrationRisk)) push("bind", "The capability is concentrated, making retention, succession and knowledge continuity part of the workforce plan.");
  if (redesign) push("bot", "The company indicated that a meaningful part of the work may be redesigned or automated. Automation should be tested at task level before changing role or headcount assumptions.");
  if (!suggestions.length) push("build", "No urgent external gap is indicated; maintaining and developing the capability is the lowest-regret starting point.");
  return suggestions;
}

function workforceScenario(input) {
  const current = numberOrNull(input.company?.currentEmployees);
  const expected = numberOrNull(input.company?.expectedEmployees);
  const baseGrowthPct = numberOrNull(input.scenarios?.baseGrowthPct);
  const highGrowthPct = numberOrNull(input.scenarios?.highGrowthPct);
  const workRedesignPct = numberOrNull(input.scenarios?.workRedesignPct);

  const base = expected !== null
    ? expected
    : (current !== null && baseGrowthPct !== null ? Math.round(current * (1 + baseGrowthPct / 100)) : null);
  const higher = current !== null && highGrowthPct !== null
    ? Math.round(current * (1 + highGrowthPct / 100))
    : null;
  const redesigned = base !== null && workRedesignPct !== null
    ? Math.max(0, Math.round(base * (1 - workRedesignPct / 100)))
    : null;

  return {
    currentEmployees: current,
    baseDemand: base,
    higherGrowthDemand: higher,
    redesignedWorkEquivalent: redesigned,
    baseGrowthPct,
    highGrowthPct,
    workRedesignPct,
    disclaimer: "Scenario values are planning assumptions, not forecasts. Work-redesign percentages represent an equivalent capacity scenario and do not automatically translate into job reductions."
  };
}

function sevenRights(input, capabilities, economics) {
  const company = input.company || {};
  const scenario = workforceScenario(input);
  const anyRoles = capabilities.some((item) => Boolean(item.rolesAffected));
  const coverageKnown = capabilities.some((item) => item.currentCoverage !== "unknown");
  const locationKnown = Boolean(clean(company.locations));
  const timeKnown = numberOrNull(company.horizonMonths) !== null;
  const costKnown = [
    economics.budgetCap,
    economics.annualCostPerHire,
    economics.trainingCostPerPerson,
    economics.contractorMonthlyCost,
    economics.automationInvestment
  ].some((value) => value !== null);

  return [
    { right: "People", status: scenario.currentEmployees !== null && scenario.baseDemand !== null ? "covered" : "needs-information", reason: "Current and future workforce size / demand." },
    { right: "Skills", status: coverageKnown ? "covered" : "needs-information", reason: "Current capability / skill coverage." },
    { right: "Roles", status: anyRoles ? "covered" : "needs-information", reason: "Roles or workforce segments affected." },
    { right: "Shape", status: scenario.baseDemand !== null && capabilities.length ? "covered" : "needs-information", reason: "Future workforce and capability shape." },
    { right: "Place", status: locationKnown ? "covered" : "needs-information", reason: "Where the workforce / capability must be available." },
    { right: "Time", status: timeKnown ? "covered" : "needs-information", reason: "When the capability is needed." },
    { right: "Cost", status: costKnown ? "covered" : "needs-information", reason: "Company cost or budget assumptions." }
  ];
}

function frameworkComparisons(input, findings, capabilities, economics) {
  const selected = normalizeFrameworkSelection(input.frameworks);
  const rights = sevenRights(input, capabilities, economics);
  const scenario = workforceScenario(input);
  const gaps = findings.filter((item) => ["confirmed-gap", "likely-gap", "capacity-gap", "capacity-pressure", "fragile-coverage"].includes(item.status));
  const comparisons = [];

  if (selected.includes("cipd")) {
    const covered = rights.filter((item) => item.status === "covered").length;
    comparisons.push({
      id: "cipd",
      framework: FRAMEWORKS.cipd,
      headline: `${covered} of 7 workforce-planning rights currently have sufficient input`,
      interpretation: `${gaps.length} material capability / capacity finding${gaps.length === 1 ? "" : "s"} should be carried into the workforce action plan.`,
      evidence: rights,
      decisionEmphasis: "Supply, demand, workforce completeness, timing and cost."
    });
  }

  if (selected.includes("capability")) {
    const critical = capabilities.filter((item) => item.importance === "critical").length;
    const confirmed = findings.filter((item) => ["confirmed-gap", "likely-gap"].includes(item.status)).length;
    comparisons.push({
      id: "capability",
      framework: FRAMEWORKS.capability,
      headline: `${critical} critical capability${critical === 1 ? "" : "ies"} identified`,
      interpretation: `${confirmed} capability coverage gap${confirmed === 1 ? "" : "s"} require validation or intervention before the stated strategy horizon.`,
      evidence: findings.map((item) => ({ capability: item.capability, status: item.status, ruleId: item.ruleIds[0] })),
      decisionEmphasis: "Strategy → capability → work → skills → roles → capacity."
    });
  }

  if (selected.includes("scenario")) {
    const values = [scenario.baseDemand, scenario.higherGrowthDemand, scenario.redesignedWorkEquivalent].filter((value) => value !== null);
    const spread = values.length >= 2 ? Math.max(...values) - Math.min(...values) : null;
    comparisons.push({
      id: "scenario",
      framework: FRAMEWORKS.scenario,
      headline: spread === null ? "More scenario inputs are needed" : `Planning demand varies by up to ${spread.toLocaleString("en-IN")} workforce-equivalent positions across supplied scenarios`,
      interpretation: "Use scenario differences to separate robust actions from actions that are only justified under one growth or work-redesign assumption.",
      evidence: scenario,
      decisionEmphasis: "Uncertainty, work redesign and no-regret actions."
    });
  }
  return { selected, rights, scenario, comparisons };
}

function economicsFrom(input = {}) {
  const source = input.economics || {};
  return {
    currency: clean(source.currency, "INR"),
    budgetCap: numberOrNull(source.budgetCap),
    annualCostPerHire: numberOrNull(source.annualCostPerHire),
    trainingCostPerPerson: numberOrNull(source.trainingCostPerPerson),
    contractorMonthlyCost: numberOrNull(source.contractorMonthlyCost),
    automationInvestment: numberOrNull(source.automationInvestment)
  };
}

function overallPosition(findings) {
  if (!findings.length) return { status: "information-needed", headline: "Capability demand needs to be defined before a workforce plan can be produced." };
  if (findings.some((item) => ["confirmed-gap", "capacity-gap"].includes(item.status))) {
    return { status: "action", headline: "The stated strategy creates at least one material workforce or capability gap that needs an implementation decision." };
  }
  if (findings.some((item) => ["likely-gap", "capacity-pressure", "fragile-coverage"].includes(item.status))) {
    return { status: "watch", headline: "The workforce can support part of the stated strategy, but capability, capacity or concentration pressure should be resolved before execution." };
  }
  if (findings.some((item) => item.status === "information-needed")) {
    return { status: "information-needed", headline: "The direction is visible, but key workforce information is still needed before a gap can be concluded." };
  }
  return { status: "stable", headline: "The supplied information does not currently indicate a material workforce or capability gap for the stated scenario." };
}

export function analyzeWorkforceCapability(input = {}) {
  const company = {
    name: clean(input.company?.name),
    email: clean(input.company?.email).toLowerCase(),
    industry: clean(input.company?.industry),
    currentEmployees: numberOrNull(input.company?.currentEmployees),
    expectedEmployees: numberOrNull(input.company?.expectedEmployees),
    horizonMonths: numberOrNull(input.company?.horizonMonths),
    locations: clean(input.company?.locations)
  };
  const strategy = {
    objective: clean(input.strategy?.objective),
    businessImpact: clean(input.strategy?.businessImpact),
    targetOutcome: clean(input.strategy?.targetOutcome)
  };
  const capabilities = (Array.isArray(input.capabilities) ? input.capabilities : [])
    .map(normalizeCapability)
    .filter(Boolean)
    .slice(0, 5);
  const economics = economicsFrom(input);

  const findings = capabilities.map((capability) => {
    const gap = capabilityGap(capability);
    const confidence = confidenceFor(capability, economics);
    const interventions = suggestInterventions(capability, gap, {
      horizonMonths: company.horizonMonths,
      economics
    });
    const factsUsed = [
      strategy.objective ? `Strategy: ${strategy.objective}` : "",
      `Importance: ${titleCase(capability.importance)}`,
      `Current coverage: ${titleCase(capability.currentCoverage)}`,
      `Capacity: ${titleCase(capability.capacityStatus)}`,
      `Concentration risk: ${titleCase(capability.concentrationRisk)}`,
      capability.rolesAffected ? `Roles / segments: ${capability.rolesAffected}` : ""
    ].filter(Boolean);
    return {
      id: `WCP-${capability.id}`,
      capability: capability.name,
      importance: capability.importance,
      status: gap.status,
      label: gap.label,
      reason: gap.reason,
      ruleIds: gap.rules,
      factsUsed,
      missingFacts: confidence.missing,
      confidence: confidence.level,
      whatWouldChangeThis: gap.status === "information-needed"
        ? "Confirmed current capability coverage and capacity could change this result."
        : "A different strategy horizon, stronger internal coverage, higher productive capacity, credible partner capacity or validated work redesign could change the recommended intervention.",
      interventions,
      rolesAffected: capability.rolesAffected,
      evidenceNote: capability.evidenceNote
    };
  });

  const framework = frameworkComparisons({ ...input, company }, findings, capabilities, economics);
  const position = overallPosition(findings);

  return {
    engineId: ENGINE_ID,
    engineVersion: ENGINE_VERSION,
    rulesetVersion: RULESET_VERSION,
    generatedAt: new Date().toISOString(),
    company,
    strategy,
    capabilities,
    economics,
    findings,
    frameworkSelection: framework.selected,
    frameworkComparisons: framework.comparisons,
    sevenRights: framework.rights,
    scenarios: framework.scenario,
    overallPosition: position,
    methodology: {
      name: "GrowWithHR Workforce & Capability Planning Methodology",
      version: ENGINE_VERSION,
      rulesetVersion: RULESET_VERSION,
      methodologyUrl: "workforce-capability-methodology.html",
      frameworks: [FRAMEWORKS.cipd, FRAMEWORKS.capability, FRAMEWORKS.scenario],
      referenceTaxonomies: [FRAMEWORKS.esco, FRAMEWORKS.onet],
      aiUsedForDecision: false,
      applicabilityAuthority: "deterministic GrowWithHR rules using user-confirmed company facts",
      note: "External frameworks and taxonomies provide structure and reference vocabulary. They do not silently create company facts or decide a capability gap."
    },
    auditTrail: findings.flatMap((finding) => finding.ruleIds.map((ruleId) => ({ ruleId, findingId: finding.id, capability: finding.capability })))
  };
}

function prioritiseInterventions(analysis, approach) {
  const weight = {
    hybrid: ["borrow", "build", "buy", "move", "bind", "bot"],
    cipd: ["buy", "build", "borrow", "move", "bind", "bot"],
    capability: ["build", "move", "buy", "bind", "borrow", "bot"],
    scenario: ["bot", "borrow", "move", "build", "buy", "bind"]
  };
  const order = weight[approach] || weight.hybrid;
  return analysis.findings.map((finding) => ({
    ...finding,
    interventions: [...finding.interventions].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
  }));
}

export function finalizeWorkforcePlan(analysis, choice = "hybrid") {
  const approach = ["hybrid", "cipd", "capability", "scenario"].includes(clean(choice).toLowerCase())
    ? clean(choice).toLowerCase()
    : "hybrid";
  const findings = prioritiseInterventions(analysis, approach);
  const urgent = findings.filter((item) => ["confirmed-gap", "capacity-gap", "likely-gap"].includes(item.status));
  const information = findings.filter((item) => item.status === "information-needed");
  const robustActions = uniq(findings.flatMap((item) => item.interventions.slice(0, 2).map((action) => action.label)));
  const roadmap = [
    {
      horizon: "0–90 days",
      actions: uniq([
        ...information.map((item) => `Close the information gap for ${item.capability}: ${item.missingFacts.join(", ") || "confirm current supply"}.`),
        ...urgent.slice(0, 3).map((item) => `Confirm the implementation route for ${item.capability} and validate the ${item.interventions[0]?.label || "workforce"} option against company lead time and budget.`)
      ]).slice(0, 6)
    },
    {
      horizon: "3–6 months",
      actions: uniq(urgent.flatMap((item) => item.interventions.slice(0, 2).map((action) => `${action.label}: ${item.capability} — ${action.why}`))).slice(0, 6)
    },
    {
      horizon: "6–12 months",
      actions: uniq(findings.map((item) => `Reassess ${item.capability} coverage, capacity and concentration after implementation starts.`)).slice(0, 5)
    },
    {
      horizon: "12–36 months",
      actions: [
        "Re-run the workforce and capability scenarios when strategy, headcount, locations, automation assumptions or capability supply materially change.",
        "Use Change Intelligence to distinguish company-fact changes from methodology / rule-version changes."
      ]
    }
  ];
  return {
    ...analysis,
    selectedApproach: approach,
    selectedApproachLabel: ({
      hybrid: "Hybrid plan",
      cipd: "CIPD workforce-planning led",
      capability: "Capability-led",
      scenario: "Scenario / work-redesign led"
    })[approach],
    findings,
    robustActions,
    roadmap,
    implementationBoundary: "Time and cost values are either company-supplied inputs or clearly labelled planning assumptions. GrowWithHR does not invent role quantities or salary benchmarks when those facts are not supplied."
  };
}
