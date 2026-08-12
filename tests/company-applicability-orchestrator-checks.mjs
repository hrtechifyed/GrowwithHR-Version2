import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const lawSource = fs.readFileSync("js/pdf-law-transparency-core.js", "utf8");
const orchestratorSource = fs.readFileSync("js/company-applicability-orchestrator-v1.js", "utf8");

new vm.Script(orchestratorSource, { filename: "js/company-applicability-orchestrator-v1.js" });

const sandbox = {
    console,
    document: { body: { classList: { contains: () => false } } },
    window: {
        setTimeout,
        GrowWithHRPDF: {
            buildAdvisoryPdf: async () => ({ document: null, theme: "standard" }),
            buildAdvisoryModel: (payload) => payload.model || {}
        }
    }
};
vm.createContext(sandbox);
vm.runInContext(lawSource, sandbox);
vm.runInContext(orchestratorSource, sandbox);

const api = sandbox.window.GrowWithHRCompanyApplicability;
assert(api, "company-wide applicability orchestrator must be installed");
assert.equal(api.version, "1.0.0-company-applicability-scale-trigger");
assert.equal(typeof sandbox.window.GrowWithHRPDF.buildCompanyApplicability, "function");
assert.equal(typeof sandbox.window.GrowWithHRPDF.simulateCompanyApplicability, "function");

const completeAnswers = {
    employees: 60,
    workers: 120,
    contractors: 25,
    indiaOperations: true,
    establishmentType: "Private limited company",
    primaryState: "Karnataka",
    operatingStates: ["Karnataka", "Maharashtra"],
    womenEmployees: "yes",
    esiWageEligibility: "yes",
    bonusWageEligibility: "yes",
    industry: "Manufacturing",
    workerCategories: ["permanent-employees", "factory-workers"],
    usesPower: "yes",
    manufacturingOperations: "yes"
};

const payload = { answers: completeAnswers, report: completeAnswers };
const assessment = api.assess(payload, {});
assert.equal(assessment.companyWide, true);
assert.equal(assessment.decisionAuthority, "deterministic-engine");
assert.equal(assessment.ragPolicy.usedForDecision, false);
assert.equal(assessment.ragPolicy.applicabilityAuthority, "none");
assert.equal(assessment.findings.length, 11, "orchestrator must evaluate the entire existing deterministic law catalogue");

const groupedCount = assessment.groups.relevantNow.length +
    assessment.groups.reviewNeeded.length +
    assessment.groups.moreInformationRequired.length +
    assessment.groups.watchAsYouGrow.length;
assert.equal(groupedCount, assessment.findings.length, "every deterministic finding must map to one founder-facing state");

const allowedBackendStatuses = new Set(["Applicable", "Review required", "Needs information", "Not currently triggered"]);
const allowedFounderStates = new Set(["relevant-now", "review-needed", "more-information-required", "watch-as-you-grow"]);
assessment.findings.forEach((finding) => {
    assert(allowedBackendStatuses.has(finding.backendStatus), `unexpected backend status for ${finding.id}`);
    assert(allowedFounderStates.has(finding.founderState), `unexpected founder state for ${finding.id}`);
    assert.equal(finding.status, finding.backendStatus, "existing backend status must be preserved");
    assert.equal(finding.decision.authority, "deterministic-engine");
    assert.equal(finding.ragPolicy.usedForDecision, false);
    assert.equal(finding.ragPolicy.applicabilityAuthority, "none");
});

const rawRows = sandbox.window.GrowWithHRPDF.buildReportLawTransparency(payload, {});
const rawById = new Map(rawRows.map((row) => [row.id, row]));
assessment.scaleTriggerMatrix.forEach((trigger) => {
    const raw = rawById.get(trigger.lawId);
    assert(raw, `scale trigger must come from an existing deterministic row: ${trigger.lawId}`);
    assert(["below", "near"].includes(raw.thresholdResult.state), `scale trigger state must already exist for ${trigger.lawId}`);
    assert.equal(trigger.reassessmentPoint, raw.thresholdResult.triggerText, "orchestrator must not invent a trigger threshold");
    assert.equal(trigger.currentPosition, raw.thresholdResult.positionText, "orchestrator must reuse the deterministic current position");
});

const incompleteAnswers = { ...completeAnswers, esiWageEligibility: "not-sure", bonusWageEligibility: "not-sure" };
const incomplete = api.assess({ answers: incompleteAnswers, report: incompleteAnswers }, {});
const missingFields = new Map(incomplete.missingFacts.map((item) => [item.field, item]));
assert(missingFields.has("esiWageEligibility"));
assert(missingFields.has("bonusWageEligibility"));
assert(missingFields.get("esiWageEligibility").affectedLawIds.includes("esi"));
assert(missingFields.get("bonusWageEligibility").affectedLawIds.includes("bonus"));

const nineEmployees = { ...completeAnswers, employees: 9 };
const scenario = api.simulate(
    { answers: nineEmployees, report: nineEmployees },
    {},
    { employees: 10 }
);
const poshChange = scenario.changes.find((item) => item.lawId === "posh");
assert(poshChange, "scenario simulation must surface the existing POSH state change at the existing trigger");
assert.equal(poshChange.before.backendStatus, "Review required");
assert.equal(poshChange.after.backendStatus, "Applicable");
assert.equal(scenario.decisionAuthority, "deterministic-engine");
assert.equal(scenario.ragPolicy.usedForDecision, false);
assert.equal(scenario.ragPolicy.applicabilityAuthority, "none");

console.log("Company-wide applicability orchestrator and Scale Trigger Matrix checks passed.");
