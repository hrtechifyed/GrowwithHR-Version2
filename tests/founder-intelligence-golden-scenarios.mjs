import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const lawSource = fs.readFileSync("js/pdf-law-transparency-core.js", "utf8");
const orchestratorSource = fs.readFileSync("js/company-applicability-orchestrator-v1.js", "utf8");
const webSource = fs.readFileSync("js/founder-web-report-v2.js", "utf8");
const pdfParitySource = fs.readFileSync("js/report-founder-intelligence-parity-v1.js", "utf8");
const visualInstallerSource = fs.readFileSync("js/report-visual-sections-v021.js", "utf8");

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

const completeFacts = {
    companyName: "Golden Scenario Private Limited",
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

// Scenario A — What applies today?
const today = api.assess({ report: completeFacts, answers: completeFacts }, {});
assert.equal(today.findings.length, 11);
assert.equal(today.obligationObjects.length, today.findings.length);
assert(today.groups.relevantNow.length > 0, "complete facts should produce relevant-now findings");
assert(today.groups.reviewNeeded.length > 0, "variable/jurisdiction rules should preserve review-needed findings");
assert(today.founderActions.some((item) => item.taxonomy === "review-now"));
assert(today.founderActions.every((item) => item.completionTracked === false));
assert(today.findings.every((item) => item.decision.authority === "deterministic-engine"));
assert(today.findings.every((item) => item.ragPolicy.usedForDecision === false));

// Scenario B — What changes if we grow?
const nine = { ...completeFacts, employees: 9 };
const growth = api.simulate({ report: nine, answers: nine }, {}, { employees: 10 });
const posh = growth.changes.find((item) => item.lawId === "posh");
assert(posh, "9→10 employee growth scenario must produce the existing POSH deterministic transition");
assert.equal(posh.before.backendStatus, "Review required");
assert.equal(posh.after.backendStatus, "Applicable");
assert.equal(growth.changedFacts.employees, 10);
assert(growth.unchangedLawIds.length > 0, "scenario diff must keep unchanged findings explicitly unchanged");
assert.equal(growth.planningView, true);

// Scenario C — We do not know enough yet.
const incompleteFacts = { ...completeFacts, esiWageEligibility: "not-sure", bonusWageEligibility: "not-sure" };
const incompletePayload = { report: incompleteFacts, answers: incompleteFacts };
const incomplete = api.assess(incompletePayload, {});
assert.deepEqual(
    incomplete.missingFacts.map((item) => item.field).sort(),
    ["bonusWageEligibility", "esiWageEligibility"],
    "missing facts must be deduplicated by company fact"
);
const resolved = api.resolveMissingFacts(incompletePayload, {}, { esiWageEligibility: "yes" });
assert.equal(resolved.acceptedAnswers.esiWageEligibility, "yes");
assert.equal(resolved.payload.answers.bonusWageEligibility, "not-sure", "unanswered missing facts must be preserved, not inferred");
assert(!resolved.remainingMissingFacts.some((item) => item.field === "esiWageEligibility"));
assert(resolved.remainingMissingFacts.some((item) => item.field === "bonusWageEligibility"));
assert(resolved.changes.every((item) => item.decisionAuthority === "deterministic-engine"));

// Web/PDF/report delivery acceptance surface.
[
    "OBLIGATION OBJECTS",
    "YOUR FOUNDER ACTION LIST",
    "COMPLETE THE PICTURE",
    "Founder scenario simulation",
    "Preview deterministic changes",
    "Generate revised report",
    "Get governed source-backed explanation",
    "usedForDecision: false",
    "applicabilityAuthority: none"
].forEach((marker) => assert(webSource.includes(marker), `missing founder web acceptance marker: ${marker}`));

[
    "api.assess(payload, model)",
    "assessment.obligationObjects",
    "assessment.founderActions",
    "assessment.missingFacts",
    "assessment.scaleTriggerMatrix",
    "Founder intelligence summary",
    "END OF REPORT"
].forEach((marker) => assert(pdfParitySource.includes(marker), `missing web/PDF parity marker: ${marker}`));

[
    "pdfs: [report]",
    "emailAttachments: [report]",
    "deliveryAttachments: [report]",
    "attachmentCount: 1",
    'deliveryMode: "single-pdf-one-email"',
    "previousReportId"
].forEach((marker) => assert(visualInstallerSource.includes(marker), `missing single-delivery/report-lineage marker: ${marker}`));

const forbidden = `${webSource}\n${pdfParitySource}`.toLowerCase();
assert(!forbidden.includes("72% compliant"));
assert(!forbidden.includes("compliance-readiness percentage"));
assert(!forbidden.includes("evidence upload"));
assert(!forbidden.includes("light / dark / both"));

console.log("Founder intelligence golden scenarios and cross-surface acceptance checks passed.");
