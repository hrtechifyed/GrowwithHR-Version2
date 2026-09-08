import assert from "node:assert/strict";
import fs from "node:fs";
import {
  analyzeWorkforceCapability,
  finalizeWorkforcePlan,
  ENGINE_ID,
  ENGINE_VERSION,
  RULESET_VERSION
} from "../js/modules/workforce/workforce-capability-engine.mjs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const baseInput = {
  company: {
    name: "Northstar Cloud Systems",
    email: "people@northstar.example",
    industry: "B2B Technology",
    currentEmployees: 420,
    expectedEmployees: 560,
    horizonMonths: 18,
    locations: "India; UK; Remote"
  },
  strategy: {
    objective: "Increase enterprise revenue from 18% to 40% within 18 months.",
    targetOutcome: "40% enterprise revenue",
    businessImpact: "critical"
  },
  frameworks: ["cipd", "capability", "scenario"],
  capabilities: [
    {
      id: "CAP-01",
      name: "Enterprise solution selling",
      importance: "critical",
      currentCoverage: "low",
      capacityStatus: "constrained",
      concentrationRisk: "medium",
      internalAdjacency: "yes",
      temporaryNeed: "no",
      workRedesignPotential: "low",
      rolesAffected: "Enterprise account executives; solution consultants"
    },
    {
      id: "CAP-02",
      name: "Revenue operations analytics",
      importance: "important",
      currentCoverage: "adequate",
      capacityStatus: "adequate",
      concentrationRisk: "single-point",
      internalAdjacency: "yes",
      temporaryNeed: "no",
      workRedesignPotential: "high",
      rolesAffected: "Revenue operations"
    }
  ],
  scenarios: { baseGrowthPct: 33, highGrowthPct: 45, workRedesignPct: 12 },
  economics: {
    currency: "INR",
    budgetCap: 18000000,
    annualCostPerHire: 2400000,
    trainingCostPerPerson: 180000,
    contractorMonthlyCost: 350000,
    automationInvestment: 4500000
  }
};

const analysis = analyzeWorkforceCapability(baseInput);
assert.equal(analysis.engineId, ENGINE_ID);
assert.equal(analysis.engineVersion, ENGINE_VERSION);
assert.equal(analysis.rulesetVersion, RULESET_VERSION);
assert.equal(analysis.methodology.aiUsedForDecision, false);
assert.equal(analysis.methodology.applicabilityAuthority, "deterministic GrowWithHR rules using user-confirmed company facts");
assert.equal(analysis.frameworkComparisons.length, 3);
assert.equal(analysis.sevenRights.length, 7);
assert.equal(analysis.scenarios.currentEmployees, 420);
assert.equal(analysis.scenarios.baseDemand, 560);
assert.equal(analysis.scenarios.higherGrowthDemand, 609);
assert.equal(analysis.scenarios.redesignedWorkEquivalent, 493);

const enterprise = analysis.findings.find((item) => item.capability === "Enterprise solution selling");
assert.ok(enterprise);
assert.equal(enterprise.status, "confirmed-gap");
assert.ok(enterprise.ruleIds.includes("WCP-CAP-GAP-04"));
assert.equal(enterprise.confidence, "High");
assert.ok(enterprise.interventions.some((item) => item.id === "build"));
assert.ok(enterprise.interventions.some((item) => item.id === "buy"));
assert.equal(enterprise.interventions.find((item) => item.id === "buy")?.cost.source, "company-supplied");

const revops = analysis.findings.find((item) => item.capability === "Revenue operations analytics");
assert.ok(revops);
assert.equal(revops.status, "fragile-coverage");
assert.ok(revops.ruleIds.includes("WCP-CONCENTRATION-01"));
assert.ok(revops.interventions.some((item) => item.id === "bind"));
assert.ok(revops.interventions.some((item) => item.id === "bot"));

const hybrid = finalizeWorkforcePlan(analysis, "hybrid");
assert.equal(hybrid.selectedApproach, "hybrid");
assert.equal(hybrid.selectedApproachLabel, "Hybrid plan");
assert.equal(hybrid.roadmap.length, 4);
assert.ok(hybrid.roadmap.some((item) => item.horizon === "12–36 months"));
assert.match(hybrid.implementationBoundary, /does not invent role quantities or salary benchmarks/i);

const unknownSupply = analyzeWorkforceCapability({
  ...baseInput,
  capabilities: [{
    id: "CAP-01",
    name: "Data engineering",
    importance: "critical",
    currentCoverage: "unknown",
    capacityStatus: "unknown",
    concentrationRisk: "unknown",
    internalAdjacency: "unknown",
    temporaryNeed: "unknown",
    workRedesignPotential: "unknown",
    rolesAffected: ""
  }],
  economics: { currency: "INR" }
});
const unknownFinding = unknownSupply.findings[0];
assert.equal(unknownFinding.status, "information-needed");
assert.ok(unknownFinding.ruleIds.includes("WCP-GAP-INFO-01"));
assert.equal(unknownFinding.confidence, "Low");
assert.ok(unknownFinding.missingFacts.includes("company cost inputs"));
assert.equal(unknownFinding.interventions[0].cost.display, "Not estimated");

const twoFrameworks = analyzeWorkforceCapability({ ...baseInput, frameworks: ["cipd", "capability"] });
assert.deepEqual(twoFrameworks.frameworkSelection, ["cipd", "capability"]);
assert.equal(twoFrameworks.frameworkComparisons.length, 2);

const planningPage = read("workforce-capability-planning.html");
const reportPage = read("workforce-capability-report.html");
const reportRuntime = read("js/workforce-capability-report.mjs");
const pdfRuntime = read("js/workforce-capability-pdf.mjs");
const workspaceBridge = read("js/workforce-capability-workspace-bridge.js");
const customerGate = read("server-customer-report-gate.js");
const serverEntry = read("server-entry.js");
const delivery = read("server-workforce-capability-report-delivery.js");
const orchestrator = read("js/company-intelligence-orchestrator-v1.js");

assert.match(planningPage, /Compare planning frameworks/);
assert.match(planningPage, /Implementation economics/);
assert.match(planningPage, /Create my implementation plan &amp; report/);
assert.match(planningPage, /workforce-capability-methodology\.html/);
assert.match(planningPage, /workforce-capability-workspace-bridge\.js/);
assert.ok(
  planningPage.indexOf("workforce-capability-workspace-bridge.js") < planningPage.indexOf("workforce-capability-planning.mjs"),
  "The WCP workspace bridge must normalize cross-engine horizon data before the planning module persists a workspace."
);
assert.match(workspaceBridge, /planningHorizonMonths/);
assert.match(workspaceBridge, /planningHorizonEmployees/);
assert.match(workspaceBridge, /horizonMonths === 12/);
assert.match(workspaceBridge, /delete companyData\.workforce\.expectedEmployees12Months/);
assert.match(reportPage, /workforce-capability-report\.mjs/);
assert.match(reportRuntime, /generateWorkforceCapabilityPdf/);
assert.match(reportRuntime, /\/api\/workforce-capability-report\/deliver/);
assert.match(pdfRuntime, /GROWWITHHR · WORKFORCE & CAPABILITY PLANNING/);
assert.match(pdfRuntime, /Build the capability\. Shape the workforce\./);
assert.match(customerGate, /\/api\/workforce-capability-report\/deliver/);
assert.match(customerGate, /handlers\.workforce/);
assert.match(serverEntry, /handleWorkforceCapabilityReportRequest/);
assert.match(serverEntry, /workforce:\s*handleWorkforceCapabilityReportRequest/);
assert.match(delivery, /Your GrowWithHR Workforce & Capability Plan/);
assert.match(delivery, /WCP-2026\.1/);
assert.match(orchestrator, /specialistDecisionAuthorityPreserved:\s*true/);
assert.match(orchestrator, /crossEngineDecisionAuthority:\s*false/);

console.log("Workforce & Capability deterministic planning, report, workspace and delivery checks passed.");
