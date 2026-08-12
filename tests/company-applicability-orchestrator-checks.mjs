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
assert.equal(api.version, "1.1.0-founder-intelligence");
assert.equal(typeof sandbox.window.GrowWithHRPDF.buildCompanyApplicability, "function");
assert.equal(typeof sandbox.window.GrowWithHRPDF.simulateCompanyApplicability, "function");
assert.equal(typeof sandbox.window.GrowWithHRPDF.resolveCompanyMissingFacts, "function");

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
assert.equal(assessment.obligationObjects.length, assessment.findings.length, "every fixed finding must produce one obligation object");
assert(Array.isArray(assessment.founderActions));
assert(assessment.founderActions.every((item) => item.completionTracked === false));
assert(assessment.founderActions.every((item) => item.decisionAuthority === "deterministic-engine"));

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

assessment.obligationObjects.forEach((obligation) => {
    const finding = assessment.findings.find((item) => item.id === obligation.findingId);
    assert(finding, `obligation must trace to a deterministic finding: ${obligation.obligationId}`);
    assert.equal(obligation.backendStatus, finding.backendStatus);
    assert.equal(obligation.founderState, finding.founderState);
    assert.equal(obligation.trigger.reassessmentPoint, finding.trigger.reassessmentPoint);
    assert.equal(obligation.decisionAuthority, "deterministic-engine");
    assert.equal(obligation.ragPolicy.usedForDecision, false);
    assert.equal(obligation.ragPolicy.applicabilityAuthority, "none");
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
for (let index = 1; index < assessment.scaleTriggerMatrix.length; index += 1) {
    const previous = assessment.scaleTriggerMatrix[index - 1];
    const current = assessment.scaleTriggerMatrix[index];
    if (previous.triggerState === "below") {
        assert.notEqual(current.triggerState, "near", "near trigger rows must be prioritised ahead of below rows");
    }
}

const incompleteAnswers = { ...completeAnswers, esiWageEligibility: "not-sure", bonusWageEligibility: "not-sure" };
const incompletePayload = { answers: incompleteAnswers, report: incompleteAnswers };
const incomplete = api.assess(incompletePayload, {});
const missingFields = new Map(incomplete.missingFacts.map((item) => [item.field, item]));
assert(missingFields.has("esiWageEligibility"));
assert(missingFields.has("bonusWageEligibility"));
assert(missingFields.get("esiWageEligibility").affectedLawIds.includes("esi"));
assert(missingFields.get("bonusWageEligibility").affectedLawIds.includes("bonus"));

const resolution = api.resolveMissingFacts(incompletePayload, {}, { esiWageEligibility: "yes", unrelatedField: "ignored" });
assert.deepEqual(Object.keys(resolution.acceptedAnswers), ["esiWageEligibility"], "only currently unresolved facts may be updated by the resolution loop");
assert.equal(resolution.payload.answers.employees, incompleteAnswers.employees, "previously confirmed answers must be preserved");
assert.equal(resolution.payload.answers.esiWageEligibility, "yes");
assert.equal(resolution.payload.answers.unrelatedField, undefined, "unresolved-fact continuation must not accept unrelated writes");
assert(!resolution.remainingMissingFacts.some((item) => item.field === "esiWageEligibility"));
assert(resolution.remainingMissingFacts.some((item) => item.field === "bonusWageEligibility"));
assert(resolution.changes.every((item) => item.decisionAuthority === "deterministic-engine"));

const nineEmployees = { ...completeAnswers, employees: 9 };
const scenario = api.simulate(
    { answers: nineEmployees, report: nineEmployees },
    {},
    { employees: 10, unsupportedFutureCountry: "US" }
);
const poshChange = scenario.changes.find((item) => item.lawId === "posh");
assert(poshChange, "scenario simulation must surface the existing POSH state change at the existing trigger");
assert.equal(poshChange.before.backendStatus, "Review required");
assert.equal(poshChange.after.backendStatus, "Applicable");
assert.equal(scenario.overrides.employees, 10);
assert.equal(scenario.overrides.unsupportedFutureCountry, undefined, "scenario UI/API must discard unsupported fact overrides");
assert.equal(scenario.changedFacts.employees, 10);
assert.equal(scenario.planningView, true);
assert.equal(scenario.decisionAuthority, "deterministic-engine");
assert.equal(scenario.ragPolicy.usedForDecision, false);
assert.equal(scenario.ragPolicy.applicabilityAuthority, "none");
assert(scenario.unchangedLawIds.length > 0, "scenario diff must preserve unchanged findings instead of manufacturing changes");

const presentationCopy = JSON.parse(JSON.stringify(assessment.obligationObjects[0]));
presentationCopy.title = "Presentation-only title change";
assert.equal(assessment.findings[0].backendStatus, rawById.get(assessment.findings[0].id).status, "presentation changes cannot mutate deterministic status");
assert.equal(assessment.findings[0].trigger.reassessmentPoint, rawById.get(assessment.findings[0].id).thresholdResult.triggerText, "presentation changes cannot mutate deterministic triggers");

const forbiddenText = JSON.stringify({ obligations: assessment.obligationObjects, actions: assessment.founderActions }).toLowerCase();
assert(!forbiddenText.includes("% compliant"));
assert(!forbiddenText.includes("completion percentage"));
assert(!forbiddenText.includes("evidence upload"));

console.log("Company-wide applicability, obligation objects, founder actions, missing-fact resolution, scenario diff and Scale Trigger Matrix checks passed.");
