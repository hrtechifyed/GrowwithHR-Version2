import { referencesFor } from "./organization-growth-reference-registry.mjs";

const LEVEL = Object.freeze({ LOW: "low", MODERATE: "moderate", HIGH: "high", VERY_HIGH: "very-high" });

function txt(value) { return String(value ?? "").trim(); }
function num(value) { const n = Number(value); return Number.isFinite(n) ? n : null; }
function lower(value) { return txt(value).toLowerCase(); }

function categoricalPressure(value) {
  const v = lower(value);
  if (["very rapid", "exponential", "very-high", "very high", "multiple", "several", "international expansion", "rapid"].includes(v)) return 3;
  if (["high", "moderate", "growing", "new cities", "new country", "new countries", "one new", "possible", "planned"].includes(v)) return 2;
  if (["stable", "same", "none", "low", "decline", "not planned"].includes(v)) return 0;
  return v ? 1 : 0;
}

function band(points) {
  if (points >= 8) return LEVEL.VERY_HIGH;
  if (points >= 5) return LEVEL.HIGH;
  if (points >= 2) return LEVEL.MODERATE;
  return LEVEL.LOW;
}

function headcountGrowth(answers) {
  const current = num(answers.employees);
  const expected = num(answers.expectedEmployees);
  if (!current || expected === null) return null;
  return ((expected - current) / current) * 100;
}

function growthVector(answers) {
  const hc = headcountGrowth(answers);
  const workforcePoints = hc === null ? 1 : hc >= 75 ? 3 : hc >= 35 ? 2 : hc >= 10 ? 1 : 0;
  const productPoints = Math.max(categoricalPressure(answers.productGrowth), num(answers.productsCount) >= 4 ? 3 : num(answers.productsCount) >= 2 ? 2 : 0);
  const geographyPoints = Math.max(categoricalPressure(answers.geographyGrowth), num(answers.locations) >= 4 ? 3 : num(answers.locations) >= 2 ? 1 : 0);
  const customerPoints = categoricalPressure(answers.customerGrowth);
  const revenuePoints = categoricalPressure(answers.revenueGrowth);
  const profitPoints = categoricalPressure(answers.profitGrowth);
  const businessLinePoints = categoricalPressure(answers.businessLineGrowth);
  const acquisitionPoints = categoricalPressure(answers.acquisitionPlans);

  return {
    headcountGrowthPercent: hc === null ? null : Number(hc.toFixed(1)),
    workforce: { points: workforcePoints, band: band(workforcePoints) },
    product: { points: productPoints, band: band(productPoints) },
    geography: { points: geographyPoints, band: band(geographyPoints) },
    customer: { points: customerPoints, band: band(customerPoints) },
    revenue: { points: revenuePoints, band: band(revenuePoints) },
    profitability: { points: profitPoints, band: band(profitPoints) },
    businessLines: { points: businessLinePoints, band: band(businessLinePoints) },
    acquisitions: { points: acquisitionPoints, band: band(acquisitionPoints) }
  };
}

function constraintProfile(answers) {
  const headcount = lower(answers.headcountFlexibility);
  const noHeadcount = headcount.includes("no additional") || headcount === "none" || headcount === "0";
  const limitedHeadcount = noHeadcount || headcount.includes("1–3") || headcount.includes("1-3") || headcount.includes("limited");
  const noLayers = lower(answers.layerPreference).includes("no new") || lower(answers.layerPreference).includes("avoid");
  const tightBudget = ["tight", "constrained", "low", "limited"].some((word) => lower(answers.leadershipBudget).includes(word));
  return {
    headcountFlexibility: txt(answers.headcountFlexibility) || "Not specified",
    noAdditionalHeadcount: noHeadcount,
    limitedHeadcount,
    avoidNewLayers: noLayers,
    leadershipBudgetConstrained: tightBudget,
    founderInvolvement: txt(answers.founderInvolvement) || "Not specified",
    internalTalent: txt(answers.internalTalent) || "Not specified",
    notes: txt(answers.constraintsNotes)
  };
}

function multipleHatProfile(answers) {
  const hasCombined = lower(answers.multipleRoleOwnership) === "yes" || Boolean(txt(answers.combinedRoles));
  const status = lower(answers.combinedRoleStatus);
  return {
    present: hasCombined,
    roles: txt(answers.combinedRoles),
    status: status || "not-specified",
    pressure: status.includes("bottleneck") ? 3 : status.includes("stretched") ? 2 : status.includes("working") ? 0 : hasCombined ? 1 : 0,
    criticalSharedRoles: txt(answers.criticalSharedRoles)
  };
}

function legacyStatus(analysis, area) {
  const finding = (analysis?.findings || []).find((item) => item.area === area);
  return finding?.status || "needs-information";
}

function structuralPressure(answers, legacyAnalysis, growth, multipleHat) {
  const decision = legacyStatus(legacyAnalysis, "decision-rights");
  const founder = legacyStatus(legacyAnalysis, "founder-dependency");
  const capacity = legacyStatus(legacyAnalysis, "management-capacity");
  const coordination = legacyStatus(legacyAnalysis, "coordination");
  const clarity = legacyStatus(legacyAnalysis, "role-clarity");
  const mapping = { action: 3, watch: 2, stable: 0, "needs-information": 1 };
  const complexityPoints = growth.product.points + growth.geography.points + growth.businessLines.points + growth.acquisitions.points;
  return {
    managementCapacity: { status: capacity, points: mapping[capacity] ?? 1 },
    founderDependency: { status: founder, points: mapping[founder] ?? 1 },
    decisionOwnership: { status: decision, points: mapping[decision] ?? 1 },
    coordination: { status: coordination, points: mapping[coordination] ?? 1 },
    roleClarity: { status: clarity, points: mapping[clarity] ?? 1 },
    responsibilityConcentration: { status: multipleHat.pressure >= 3 ? "action" : multipleHat.pressure >= 2 ? "watch" : "stable", points: multipleHat.pressure },
    businessComplexity: { status: complexityPoints >= 7 ? "action" : complexityPoints >= 3 ? "watch" : "stable", points: complexityPoints }
  };
}

function coreQuestion(growth, pressure, constraints, multipleHat) {
  const productDominant = growth.product.points >= growth.geography.points && growth.product.points >= 2;
  const geoDominant = growth.geography.points > growth.product.points && growth.geography.points >= 2;
  const founderHigh = pressure.founderDependency.points >= 2 || pressure.decisionOwnership.points >= 2;
  const capacityHigh = pressure.managementCapacity.points >= 2;

  if (constraints.noAdditionalHeadcount && multipleHat.present && multipleHat.pressure >= 2) {
    return "How can responsibility and decision ownership be redistributed so growth is supported without requiring additional leadership headcount right now?";
  }
  if (productDominant && founderHigh) {
    return "How can product growth be supported without making the founder or existing functional leaders the coordination layer for every cross-functional decision?";
  }
  if (geoDominant) {
    return "How should local-versus-central ownership evolve as the company expands geographically without creating unnecessary duplication?";
  }
  if (capacityHigh) {
    return "How can management and decision capacity evolve before planned growth adds more coordination load to the current structure?";
  }
  return "How can the current structure evolve with the company's next stage of growth while preserving what already works and avoiding unnecessary complexity?";
}

function optionBase({ key, name, short, headcount, disruption, cost, bestWhen, pros, cons, solves, doesNotSolve, longevity, structure }) {
  return { key, name, short, headcount, disruption, cost, bestWhen, pros, cons, solves, doesNotSolve, longevity, structure, score: 0, scoreReasons: [] };
}

function buildOptions(answers, growth, constraints, multipleHat) {
  const productHeavy = growth.product.points >= 2;
  const geographyHeavy = growth.geography.points >= 2;
  const stage = lower(answers.growthStage);

  const optionA = optionBase({
    key: "evolve-current",
    name: "Strengthen the Current Functional Structure",
    short: "Clarify ownership and redistribute decisions before adding structural complexity.",
    headcount: "0 required; optional internal role clarification",
    disruption: "Low",
    cost: "Low",
    bestWhen: "The company needs a lower-change path, headcount is constrained, or combined roles can still work with clearer ownership.",
    pros: ["Preserves organizational simplicity", "Can work without additional headcount", "Creates clearer accountability before reorganization", "Reduces unnecessary founder or senior-leader escalation"],
    cons: ["May not be enough if products or geographies become genuinely independent", "Combined leadership roles can remain overloaded if decision transfer is incomplete", "Cross-functional coordination can still depend on senior leaders"],
    solves: ["Role ambiguity", "Decision concentration", "Some founder dependency", "Responsibility concentration where internal owners can be named"],
    doesNotSolve: ["Large-scale product diversification", "Major geographic duplication", "Severe management-capacity shortages that cannot be delegated"],
    longevity: "Useful while complexity remains manageable within shared functions; reassess when products, locations or decision load materially diverge.",
    structure: ["CEO / Founder", "Functional or combined leaders", "Explicit domain owners", "Teams with documented decision boundaries"]
  });

  const optionB = optionBase(productHeavy ? {
    key: "functional-pods",
    name: "Functional Structure + Cross-Functional Product Pods",
    short: "Keep functional homes while moving more product decisions into cross-functional teams.",
    headcount: constraints.noAdditionalHeadcount ? "Can begin with 0; may later need selective roles" : "0–2 selective roles depending on internal capability",
    disruption: "Medium",
    cost: "Low–Medium",
    bestWhen: "Product/customer complexity is rising faster than geography and shared specialist capabilities still matter.",
    pros: ["Improves product ownership and decision speed", "Retains functional expertise", "Can reduce senior-leader coordination load", "Can be piloted before broad reorganization"],
    cons: ["Requires very clear functional-versus-pod decision rights", "Can become a confusing matrix if accountability is vague", "Shared specialists can become bottlenecks"],
    solves: ["Product coordination friction", "Cross-functional handoffs", "Some founder escalation", "Need for faster product decisions"],
    doesNotSolve: ["Products that need fully independent economics and operations", "Major regional autonomy requirements"],
    longevity: "Can scale through several products if interfaces and platform/shared-service ownership remain clear.",
    structure: ["CEO", "Functional leaders", "Product / customer pods", "Shared platform and specialist capabilities"]
  } : geographyHeavy ? {
    key: "functional-regional",
    name: "Functional Structure + Regional Ownership",
    short: "Keep shared functions while defining which decisions move closer to locations or regions.",
    headcount: constraints.noAdditionalHeadcount ? "0 initially if regional ownership is assigned internally" : "0–2 regional leadership roles depending on scale",
    disruption: "Medium",
    cost: "Low–Medium",
    bestWhen: "Geographic complexity is rising but full regional divisions would be premature.",
    pros: ["Clarifies local-versus-central decisions", "Preserves shared capabilities", "Avoids immediate duplication", "Can evolve gradually as markets mature"],
    cons: ["Requires disciplined decision boundaries", "Regional owners may lack dedicated capacity", "Shared functions can still slow local decisions"],
    solves: ["Geographic coordination", "Local escalation", "Ambiguous regional accountability"],
    doesNotSolve: ["Highly independent regional business models", "Need for duplicated end-to-end regional capabilities"],
    longevity: "Useful until regions develop materially different customer, regulatory or operating models.",
    structure: ["CEO", "Shared functions", "Named regional owners", "Local teams with defined decision thresholds"]
  } : {
    key: "selective-separation",
    name: "Selective Leadership Separation",
    short: "Separate the most overloaded combined responsibility while keeping the rest of the structure lean.",
    headcount: constraints.noAdditionalHeadcount ? "0 if filled through internal progression; otherwise +1" : "+1 targeted leadership role",
    disruption: "Medium",
    cost: "Medium",
    bestWhen: "One combined leadership role or responsibility cluster is becoming a recurring bottleneck.",
    pros: ["Targets the highest-pressure responsibility", "Improves accountability", "Avoids full redesign", "Can create a clearer succession and delegation path"],
    cons: ["Adds cost if external hiring is required", "May shift rather than remove bottlenecks if decision rights remain centralized", "Requires strong interface design between the separated roles"],
    solves: ["Responsibility concentration", "Leadership overload", "Ambiguous functional ownership"],
    doesNotSolve: ["Broad coordination problems across many functions", "Product/geography complexity that needs a different operating model"],
    longevity: "Useful when a specific leadership combination, rather than the whole structure, is the primary constraint.",
    structure: ["CEO", "Separated critical functional owners", "Lean remaining leadership structure", "Explicit shared decisions"]
  });

  const optionC = optionBase(productHeavy && geographyHeavy ? {
    key: "hybrid-divisional",
    name: "Hybrid Divisions + Shared Services",
    short: "Create stronger business/product or regional accountability while retaining selected shared capabilities.",
    headcount: "+2 or more leadership/capability roles likely",
    disruption: "High",
    cost: "High",
    bestWhen: "Products or regions are becoming materially different and need more end-to-end accountability.",
    pros: ["Strong accountability", "Faster business-level decisions", "Supports divergent products/markets", "Makes economics and ownership easier to separate"],
    cons: ["More expensive", "Duplicates capabilities", "Creates additional leadership interfaces", "Can be premature for smaller companies"],
    solves: ["High product and geographic complexity", "Need for business-level accountability", "Slow cross-company decision paths"],
    doesNotSolve: ["Poor role clarity inside each division", "Capability gaps that still require specialist investment"],
    longevity: "A later-stage option when separate business units have enough scale and difference to justify the added cost.",
    structure: ["CEO / Group leadership", "Product or regional divisions", "Shared Finance / People / Platform services", "End-to-end accountable business leaders"]
  } : productHeavy ? {
    key: "product-divisions",
    name: "Product Divisions + Shared Services",
    short: "Move toward more independent product businesses while sharing selected specialist capabilities.",
    headcount: "+2 or more leadership/capability roles likely",
    disruption: "High",
    cost: "High",
    bestWhen: "Products have distinct customers, economics, roadmaps and operating needs.",
    pros: ["Strong product accountability", "Clear business-level ownership", "Faster product decisions", "Can support substantially different product strategies"],
    cons: ["Duplicates capabilities", "Adds leadership cost", "Can weaken functional consistency", "Often premature before products have enough independent scale"],
    solves: ["Independent product complexity", "Product-level accountability", "Senior coordination overload across unrelated products"],
    doesNotSolve: ["Shared platform bottlenecks", "Unclear decision rights inside divisions"],
    longevity: "Best treated as a future-state option until product lines have enough independent scale.",
    structure: ["CEO", "Product Division A", "Product Division B", "Shared services / platform capabilities"]
  } : geographyHeavy ? {
    key: "regional-divisions",
    name: "Regional Divisions + Shared Functions",
    short: "Give mature regions stronger end-to-end ownership while retaining selected group functions.",
    headcount: "+2 or more regional leadership/capability roles likely",
    disruption: "High",
    cost: "High",
    bestWhen: "Regions have materially different customers, regulations, economics or operating models.",
    pros: ["Strong local accountability", "Faster region-specific decisions", "Clear market ownership", "Can fit divergent regulatory/market needs"],
    cons: ["Capability duplication", "Higher cost", "Risk of fragmented standards", "May be premature before regional scale exists"],
    solves: ["High geographic complexity", "Need for regional autonomy", "Central bottlenecks in local decisions"],
    doesNotSolve: ["Weak local leadership capability", "Cross-region platform/shared-service design"],
    longevity: "A later-stage choice when regional differences outweigh the efficiency of centralized functions.",
    structure: ["CEO / Group leadership", "Region A", "Region B", "Shared specialist functions"]
  } : {
    key: "future-divisional",
    name: "Divisional / Business-Unit Structure",
    short: "A future-state option if business lines become sufficiently independent to justify separate accountability.",
    headcount: "+2 or more leadership/capability roles likely",
    disruption: "High",
    cost: "High",
    bestWhen: "Business lines become meaningfully different in customers, economics, capabilities or operating model.",
    pros: ["Clear business accountability", "Supports diversification", "Reduces some cross-business coordination"],
    cons: ["High cost", "Potential duplication", "Can add hierarchy before it is needed", "Requires stronger leaders and governance"],
    solves: ["Diversification at scale", "End-to-end business ownership"],
    doesNotSolve: ["Current-day bottlenecks that can be fixed through clearer ownership"],
    longevity: "Mostly a future-state reference unless complexity and scale justify it now.",
    structure: ["CEO", "Business Unit A", "Business Unit B", "Shared services where efficient"]
  });

  if (["startup", "growth"].includes(stage)) optionC.score -= 2;
  return [optionA, optionB, optionC];
}

function scoreOptions(options, answers, growth, constraints, pressure, multipleHat) {
  const productHeavy = growth.product.points >= 2;
  const geoHeavy = growth.geography.points >= 2;
  const founderHigh = pressure.founderDependency.points >= 2 || pressure.decisionOwnership.points >= 2;
  const coordinationHigh = pressure.coordination.points >= 2;

  const add = (option, points, reason) => { option.score += points; if (reason) option.scoreReasons.push(reason); };
  for (const option of options) {
    if (option.key === "evolve-current") {
      if (constraints.noAdditionalHeadcount) add(option, 5, "Fits the stated no-headcount constraint.");
      if (constraints.limitedHeadcount) add(option, 2, "Keeps additional leadership cost low.");
      if (multipleHat.present && multipleHat.pressure <= 2) add(option, 2, "Allows combined roles to continue with clearer sub-ownership.");
      if (founderHigh) add(option, 2, "Decision delegation can reduce founder concentration without a full reorganization.");
      if (productHeavy && growth.product.points >= 3) add(option, -2, "May be too light if product complexity continues rising quickly.");
      if (geoHeavy && growth.geography.points >= 3) add(option, -2, "May be too centralized for strong geographic divergence.");
    }
    if (option.key === "functional-pods") {
      if (productHeavy) add(option, 5, "Matches rising product/customer coordination needs.");
      if (coordinationHigh) add(option, 3, "Moves recurring cross-functional coordination closer to product teams.");
      if (founderHigh) add(option, 2, "Can distribute product decisions away from the founder/senior layer.");
      if (constraints.noAdditionalHeadcount) add(option, 1, "Can be piloted using existing people before selective hiring.");
    }
    if (option.key === "functional-regional") {
      if (geoHeavy) add(option, 5, "Matches rising geographic complexity.");
      if (founderHigh) add(option, 2, "Creates clearer local-versus-central decision ownership.");
      if (constraints.noAdditionalHeadcount) add(option, 1, "Can begin with named internal regional owners.");
    }
    if (option.key === "selective-separation") {
      if (multipleHat.present && multipleHat.pressure >= 2) add(option, 5, "Targets a combined responsibility that is becoming stretched.");
      if (!constraints.noAdditionalHeadcount) add(option, 2, "Targeted leadership capacity is possible under the stated constraint.");
      if (constraints.noAdditionalHeadcount) add(option, -2, "Requires internal progression or a future headcount opening.");
    }
    if (["product-divisions", "regional-divisions", "hybrid-divisional", "future-divisional"].includes(option.key)) {
      if (growth.product.points >= 3 || growth.geography.points >= 3 || growth.businessLines.points >= 3) add(option, 3, "Longer-term fit improves as complexity becomes genuinely independent.");
      if (constraints.noAdditionalHeadcount || constraints.leadershipBudgetConstrained) add(option, -5, "Conflicts with current headcount or leadership-budget constraints.");
      if (["startup", "growth"].includes(lower(answers.growthStage))) add(option, -2, "May add more structure than the current stage needs.");
    }
    if (constraints.avoidNewLayers && option.disruption === "High") add(option, -2, "Conflicts with the preference to avoid additional structural layers.");
  }
  return options.sort((a, b) => b.score - a.score);
}

function implementationPlan(option, answers, constraints) {
  const combined = txt(answers.combinedRoles);
  const productPod = option.key === "functional-pods";
  const regional = option.key === "functional-regional";
  const divisional = ["product-divisions", "regional-divisions", "hybrid-divisional", "future-divisional"].includes(option.key);
  const separate = option.key === "selective-separation";

  const first30 = [
    "Map the recurring decisions that currently escalate to the founder/CEO or the most overloaded leader.",
    "Write one accountable owner for each major function or responsibility domain, even where one person owns more than one domain.",
    "Confirm which responsibilities must stay combined because of current headcount or budget constraints."
  ];
  if (combined) first30.push(`Review the combined responsibility currently described as: ${combined}. Separate decision ownership even if the formal job remains combined.`);
  if (productPod) first30.push("Choose one product/customer flow with the highest coordination friction as the pilot rather than reorganizing every team at once.");
  if (regional) first30.push("List the decisions that must remain central and those that can move to a named regional owner.");
  if (separate) first30.push("Define the boundary between the two responsibilities before appointing or hiring the second owner.");

  const days30to60 = [
    "Transfer selected recurring decisions to the newly clarified owners and publish escalation criteria.",
    "Update role outcomes and team interfaces so people know where to go for decisions and handoffs.",
    "Start a short recurring operating review focused on unresolved dependencies, not status reporting."
  ];
  if (productPod) days30to60.push("Form the pilot cross-functional pod using existing functional members and define what the pod can decide without functional escalation.");
  if (regional) days30to60.push("Pilot local decision thresholds in one location/region and record exceptions that still need central approval.");
  if (divisional) days30to60.push("Model shared-service versus divisional ownership before moving people; avoid duplicating capabilities without a clear reason.");

  const days60to90 = [
    "Measure escalation frequency, decision delay, manager load and recurring coordination friction.",
    "Ask whether the new ownership boundaries are reducing dependency on the founder/senior layer.",
    "Correct interfaces that are still ambiguous before adding new roles or layers."
  ];
  if (productPod) days60to90.push("Decide whether the pod should continue, expand to another product, or stop based on the pilot evidence.");
  if (regional) days60to90.push("Review whether local ownership improved speed without creating inconsistent standards or duplicated work.");

  const months3to6 = [
    "Reassess the structure against actual growth rather than the original forecast alone.",
    "Add headcount only where a responsibility remains constrained after delegation, role clarity and process changes.",
    "Record the next structural trigger so the organization evolves deliberately rather than through repeated exceptions."
  ];
  if (constraints.noAdditionalHeadcount) months3to6.push("If headcount remains frozen, continue separating accountabilities from job titles and use internal progression before creating new positions.");
  if (divisional) months3to6.push("Move toward the divisional model only if products/regions show enough independent scale and economics to justify the added leadership and duplicated capability cost.");

  return {
    selectedOptionKey: option.key,
    first30Days: first30,
    days30to60,
    days60to90,
    months3to6,
    measures: ["Founder/CEO escalation frequency", "Decision cycle time", "Manager workload/capacity", "Cross-functional handoff friction", "Role/decision ownership clarity"],
    note: "This implementation plan is decision support. It should be adapted to the company's people, legal, financial and operational context before organizational changes are made."
  };
}

function reviewTriggers(answers, growth, constraints) {
  const triggers = [
    "A new product or business line creates materially different customer or operating needs.",
    "Recurring decisions continue escalating to the founder/CEO despite clarified ownership.",
    "Manager workload or coaching requirements materially increase.",
    "Cross-functional handoffs or decisions regularly stall after the selected changes are implemented."
  ];
  if (growth.geography.points >= 1) triggers.push("The company enters another significant geography or location with different local operating needs.");
  if (growth.product.points >= 1) triggers.push("A product develops sufficiently different customers, economics or capabilities to need more independent accountability.");
  if (constraints.noAdditionalHeadcount) triggers.push("Leadership/headcount capacity becomes available, allowing previously combined responsibilities to be reconsidered.");
  if (num(answers.expectedEmployees) && num(answers.employees) && num(answers.expectedEmployees) > num(answers.employees)) triggers.push("Actual headcount growth materially differs from the planning assumption used in this assessment.");
  return Array.from(new Set(triggers));
}

function notYet(answers, growth, constraints) {
  const items = [];
  const stage = lower(answers.growthStage);
  if (["startup", "growth"].includes(stage) || constraints.noAdditionalHeadcount) items.push("Do not add management layers only to match a benchmark; add structure when a distinct decision, coaching or coordination need is clear.");
  if (growth.geography.points < 2) items.push("There is not enough geographic complexity in the supplied facts to justify regional divisions yet.");
  if (growth.product.points < 3) items.push("There is not enough evidence yet to assume fully independent product divisions are necessary.");
  items.push("Do not split every multiple-hat role automatically. Separate responsibilities when the combination is creating capacity, accountability or decision problems.");
  return items;
}

function referencePoints(answers, growth, pressure, multipleHat) {
  const tags = ["span-context", "functional", "growth-stage-transition"];
  if (multipleHat.present) tags.push("multi-role-ownership", "small-company-maturity");
  if (growth.product.points >= 2) tags.push("stream-aligned-teams", "product-flow");
  if (pressure.managementCapacity.points >= 1) tags.push("span-reference", "management-capacity");
  return referencesFor(tags).map((reference) => ({
    ...reference,
    applicability: reference.id === "GITLAB-SPAN"
      ? /software|technology|tech|saas|digital/i.test(txt(answers.industry))
        ? "Relevant public company reference for a technology context, but still not a universal benchmark."
        : "Cross-industry comparison only; do not treat GitLab's company-specific span guidance as an industry rule."
      : reference.note
  }));
}

function confidence(answers, legacyAnalysis) {
  const required = ["employees", "industry", "growthStage", "headcountFlexibility", "managerCount", "decisionRights", "coordinationFriction"];
  const missing = required.filter((key) => !txt(answers[key]));
  const legacyMissing = legacyAnalysis?.missingFacts?.length || 0;
  const score = Math.max(0, 100 - (missing.length * 9) - Math.min(legacyMissing, 6) * 5);
  return {
    score,
    label: score >= 80 ? "High" : score >= 60 ? "Moderate–High" : score >= 40 ? "Moderate" : "Low",
    missingInputs: missing,
    meaning: "Confidence reflects the completeness of the supplied company facts and the deterministic decision path. It is not statistical certainty and does not mean one structure is universally correct."
  };
}

export function buildOrganizationGrowthDecision({ answers = {}, legacyAnalysis = {} } = {}) {
  const growth = growthVector(answers);
  const constraints = constraintProfile(answers);
  const multipleHat = multipleHatProfile(answers);
  const pressure = structuralPressure(answers, legacyAnalysis, growth, multipleHat);
  const question = coreQuestion(growth, pressure, constraints, multipleHat);
  const options = scoreOptions(buildOptions(answers, growth, constraints, multipleHat), answers, growth, constraints, pressure, multipleHat);
  const recommended = options[0];
  const references = referencePoints(answers, growth, pressure, multipleHat);
  const confidenceResult = confidence(answers, legacyAnalysis);

  return {
    schemaVersion: "0.1-prototype",
    generatedAt: new Date().toISOString(),
    product: "GrowWithHR Organization Structure & Growth Engine",
    positioning: "Decision support that presents viable structural choices, trade-offs and an implementation path rather than claiming one universally correct org chart.",
    currentStateMessage: "Your current structure has supported the company to this point. Based on the growth and constraints you described, some parts may come under increasing pressure and may need to evolve.",
    growthVector: growth,
    constraints,
    multipleHat,
    structuralPressure: pressure,
    coreOrganizationQuestion: question,
    options,
    recommendedOptionKey: recommended?.key || null,
    recommendedDirection: recommended ? {
      key: recommended.key,
      name: recommended.name,
      reason: recommended.scoreReasons,
      wording: `${recommended.name} appears to offer the strongest current balance between the growth pattern, organizational pressures and constraints you supplied. This is a suggested direction, not a mandatory structure.`
    } : null,
    implementationPlans: Object.fromEntries(options.map((option) => [option.key, implementationPlan(option, answers, constraints)])),
    whatNotToChangeYet: notYet(answers, growth, constraints),
    reviewTriggers: reviewTriggers(answers, growth, constraints),
    referencePoints: references,
    confidence: confidenceResult,
    trustTrace: {
      factsConsidered: Object.entries(answers).filter(([, value]) => txt(value)).map(([key]) => key),
      deterministicAnalysis: (legacyAnalysis?.findings || []).map((finding) => ({ id: finding.id, area: finding.area, status: finding.status, title: finding.title, factsUsed: finding.factsUsed || [] })),
      externalReferences: references.map((reference) => reference.id),
      interpretationBoundary: "External frameworks and public company reference points support principles. GrowWithHR remains responsible for how supplied company facts are translated into options and does not represent a source as prescribing the recommendation.",
      whatCouldChangeTheConclusion: [
        "Different growth assumptions, particularly product or geographic growth.",
        "A change in headcount or leadership-budget constraints.",
        "More detailed team-level management capacity or product-level workforce information.",
        "Evidence that current combined roles are working without decision or capacity bottlenecks.",
        "A material change in founder involvement or decision ownership."
      ]
    }
  };
}

export default buildOrganizationGrowthDecision;
