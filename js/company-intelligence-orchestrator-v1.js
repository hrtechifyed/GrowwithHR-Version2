/* GrowWithHR Company Intelligence Orchestrator
 * Coordinates specialist engines and shared company facts.
 * It does not make specialist Organization, Compliance or Workforce decisions.
 */
(() => {
  "use strict";

  const VERSION = "1.0.0";
  const WORKSPACE_KEY = "growwithhr.workspace";

  const ENGINES = Object.freeze([
    Object.freeze({
      id: "organization",
      label: "Organization & Growth",
      href: "organization-intelligence.html",
      methodologyHref: "organization-structure-methodology.html",
      description: "Structure, management capacity, founder dependency, decision ownership and growth readiness.",
      decisionAuthority: "GrowWithHR Organization Structure deterministic engine"
    }),
    Object.freeze({
      id: "compliance",
      label: "HR Compliance Readiness",
      href: "compliance-intelligence.html",
      methodologyHref: "official-resources.html#complianceSources",
      description: "Company-level HR compliance review areas, missing facts, sources and specialist-review signals.",
      decisionAuthority: "GrowWithHR deterministic compliance applicability engine"
    }),
    Object.freeze({
      id: "workforce-capability",
      label: "Workforce & Capability Planning",
      href: "workforce-capability-planning.html",
      methodologyHref: "workforce-capability-methodology.html",
      description: "Strategy-to-capability demand, workforce gaps, framework comparison, scenarios and implementation choices.",
      decisionAuthority: "GrowWithHR Workforce & Capability deterministic ruleset WCP-2026.1"
    })
  ]);

  function asObject(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function list(value) {
    return Array.isArray(value) ? value : [];
  }

  function clean(value, fallback = "") {
    return String(value ?? "").trim() || fallback;
  }

  function readWorkspace() {
    try { return JSON.parse(sessionStorage.getItem(WORKSPACE_KEY) || "null"); }
    catch (_error) { return null; }
  }

  function completedSet(workspace = readWorkspace()) {
    return new Set(list(workspace?.completedEngines).map((value) => clean(value).toLowerCase()));
  }

  function knownFacts(workspace = readWorkspace()) {
    const data = asObject(workspace?.companyData);
    const shared = asObject(data.shared);
    const workforce = asObject(data.workforce);
    const geography = asObject(data.geography);
    const organization = asObject(data.organization);
    const workforceCapability = asObject(data.workforceCapability);
    return {
      companyName: clean(workspace?.companyName || shared.companyName),
      email: clean(workspace?.email || shared.email),
      industry: clean(shared.industry),
      employees: workforce.totalEmployees ?? shared.employees ?? null,
      expectedEmployees: workforce.expectedEmployees12Months ?? shared.expectedEmployees ?? null,
      locations: geography.operatingLocationCount ?? organization.locations ?? null,
      growthStage: clean(shared.growthStage),
      organization,
      workforceCapability
    };
  }

  function nextRecommendedEngine(workspace = readWorkspace()) {
    const completed = completedSet(workspace);
    const facts = knownFacts(workspace);
    if (!completed.has("organization")) {
      return { engineId: "organization", reason: "Establish the structural baseline first so management capacity and decision ownership are visible before adding workforce demand." };
    }
    if (!completed.has("workforce-capability")) {
      return { engineId: "workforce-capability", reason: "The structural baseline can now be reused to connect growth strategy with capability and workforce demand." };
    }
    if (!completed.has("compliance")) {
      return { engineId: "compliance", reason: "Complete the compliance-readiness view so workforce changes can be reassessed against the relevant HR review areas." };
    }
    return {
      engineId: "change-intelligence",
      reason: facts.companyName
        ? `All three decision engines have a baseline for ${facts.companyName}. Reassess when material company facts change.`
        : "All three decision engines have a baseline. Reassess when material company facts change."
    };
  }

  function engineStatus(workspace = readWorkspace()) {
    const completed = completedSet(workspace);
    return ENGINES.map((engine) => ({
      ...engine,
      completed: completed.has(engine.id),
      status: completed.has(engine.id) ? "completed" : "available"
    }));
  }

  function sharedFactSummary(workspace = readWorkspace()) {
    const facts = knownFacts(workspace);
    return [
      ["Company", facts.companyName],
      ["Industry", facts.industry],
      ["Employees", facts.employees],
      ["Expected employees", facts.expectedEmployees],
      ["Locations", facts.locations],
      ["Growth stage", facts.growthStage]
    ].filter(([, value]) => value !== null && value !== undefined && clean(value) !== "")
      .map(([label, value]) => ({ label, value }));
  }

  function createHandoffTarget(engineId) {
    const engine = ENGINES.find((item) => item.id === engineId);
    return engine?.id || "organization";
  }

  window.GrowWithHRCompanyIntelligence = Object.freeze({
    version: VERSION,
    installed: true,
    engines: ENGINES,
    specialistDecisionAuthorityPreserved: true,
    crossEngineDecisionAuthority: false,
    readWorkspace,
    knownFacts,
    completedSet,
    engineStatus,
    sharedFactSummary,
    nextRecommendedEngine,
    createHandoffTarget
  });
})();
