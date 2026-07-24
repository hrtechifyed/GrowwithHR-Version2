import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync("js/pdf-law-transparency.js", "utf8");
new vm.Script(source, { filename: "js/pdf-law-transparency.js" });

const documentStub = {
    body: { classList: { contains: () => false } }
};
const sandbox = {
    console,
    document: documentStub,
    window: {
        GrowWithHRPDF: {
            buildAdvisoryPdf: async () => ({ document: null, theme: "light" }),
            buildAdvisoryModel: (payload) => payload.model || {}
        }
    }
};
vm.createContext(sandbox);
vm.runInContext(source, sandbox);

const api = sandbox.window.GrowWithHRLawTransparency;
assert(api, "law transparency API must be installed");
assert.equal(api.version, "0.23.0-law-transparency");
assert.equal(api.lawCatalog.length, 11, "expected governed law catalog size");
assert.match(api.questions.esiWageEligibility, /ESI wage-eligibility/i);
assert.match(api.questions.bonusWageEligibility, /statutory bonus eligibility/i);
assert.match(api.questions.workerCategories, /types of people/i);

const recommendationByLaw = {
    posh: "Constitute an Internal Committee under POSH",
    maternity: "Review maternity benefit and creche obligations",
    epf: "Complete EPF registration",
    esi: "Review ESIC coverage",
    gratuity: "Maintain gratuity compliance",
    bonus: "Review statutory bonus under Payment of Bonus Act",
    "minimum-wages": "Validate minimum wage obligations under Code on Wages",
    shops: "Complete Shops and Establishments registration",
    "contract-labour": "Review Contract Labour principal employer duties",
    "standing-orders": "Certify standing orders",
    factories: "Review Factories Act licence requirements"
};

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
const sampleByField = { ...completeAnswers };

function build(lawId, answers = completeAnswers, title = recommendationByLaw[lawId]) {
    return sandbox.window.GrowWithHRPDF.buildLawTransparency(
        { answers },
        { recommendations: [{ title, observation: "", recommendation: "" }] }
    );
}

for (const law of api.lawCatalog) {
    const rows = build(law.id);
    assert.equal(rows.length, 1, `${law.id}: exactly one law should be detected`);
    assert.equal(rows[0].id, law.id);
    assert.equal(rows[0].officialUrl, law.url);
    assert.match(rows[0].confidenceMeaning, /input coverage, not legal certainty/i);
    assert(Array.isArray(rows[0].missingQuestions));
}

const unrelated = sandbox.window.GrowWithHRPDF.buildLawTransparency(
    { answers: completeAnswers },
    { recommendations: [{ title: "Improve manager capability" }] }
);
assert.equal(unrelated.length, 0, "unrelated recommendations must not invent laws");

let masksTested = 0;
let expectedMasks = 0;
for (const law of api.lawCatalog) {
    const required = Array.from(law.requiredInputs);
    const combinations = 2 ** required.length;
    expectedMasks += combinations;
    for (let mask = 0; mask < combinations; mask += 1) {
        const answers = {};
        let expectedConfirmed = 0;
        required.forEach((field, index) => {
            if (mask & (1 << index)) {
                assert(Object.hasOwn(sampleByField, field), `${law.id}: missing test sample for ${field}`);
                answers[field] = sampleByField[field];
                expectedConfirmed += 1;
            }
        });
        const [row] = build(law.id, answers);
        assert(row, `${law.id} mask ${mask}: law detection`);
        assert.equal(row.inputCoverage.confirmed, expectedConfirmed, `${law.id} mask ${mask}: confirmed count`);
        assert.equal(row.inputCoverage.required, required.length, `${law.id} mask ${mask}: required count`);
        assert.equal(row.missingInputs.length, required.length - expectedConfirmed, `${law.id} mask ${mask}: missing count`);
        assert.equal(row.missingQuestions.length, row.missingInputs.length, `${law.id} mask ${mask}: missing question count`);
        masksTested += 1;
    }
}
assert.equal(masksTested, expectedMasks);

for (const [employees, expected] of [[1, "below"], [8, "near"], [10, "crossed"], [20, "crossed"]]) {
    const [row] = build("posh", { ...completeAnswers, employees });
    assert.equal(row.thresholdResult.state, expected, `POSH ${employees}`);
}
const singular = build("posh", { ...completeAnswers, employees: 1 })[0];
assert.match(singular.thresholdResult.explanation, /^1 reported employee;/);
assert.doesNotMatch(singular.thresholdResult.explanation, /1 reported employees/);

for (const [workers, power, expected] of [[9, "yes", "near"], [10, "yes", "crossed"], [18, "no", "near"], [20, "no", "crossed"]]) {
    const [row] = build("factories", { ...completeAnswers, workers, usesPower: power, manufacturingOperations: "yes" });
    assert.equal(row.thresholdResult.state, expected, `factory ${workers}/${power}`);
}

const nonManufacturingFactory = build("factories", {
    ...completeAnswers,
    manufacturingOperations: "no",
    workers: 0,
    usesPower: "no"
})[0];
assert.equal(nonManufacturingFactory.thresholdResult.state, "below");
assert.equal(nonManufacturingFactory.status, "Not currently triggered");

const employeeOnlyFactory = build("factories", {
    ...completeAnswers,
    workers: undefined,
    employees: 500,
    usesPower: "yes",
    manufacturingOperations: "yes"
})[0];
assert.equal(employeeOnlyFactory.thresholdResult.state, "needs-information", "employee count must never substitute for factory-worker count");

const esiMissingEligibility = build("esi", {
    ...completeAnswers,
    employees: 30,
    esiWageEligibility: "not-sure"
})[0];
assert.equal(esiMissingEligibility.status, "Needs information");
assert(esiMissingEligibility.missingInputs.includes("esiWageEligibility"));
assert.match(esiMissingEligibility.missingQuestions.join(" "), /ESI wage-eligibility/i);

const allRecommendations = Object.values(recommendationByLaw).map((title) => ({ title }));
const allRows = sandbox.window.GrowWithHRPDF.buildLawTransparency(
    { answers: completeAnswers },
    { recommendations: [...allRecommendations, ...allRecommendations] }
);
assert.equal(allRows.length, api.lawCatalog.length);

[
    "Required inputs confirmed",
    "textWithLink",
    "input coverage, not legal certainty",
    "deletePage",
    "drawClosingPage",
    "Array.isArray(result?.pdfs)",
    "0, 0, 0",
    "countNoun",
    "missingQuestions"
].forEach((marker) => assert(source.includes(marker), `missing law transparency marker: ${marker}`));
assert(!source.includes('workers: ["workers", "workerCount", "workmen", "totalWorkers", "employees"]'));
assert(!source.includes("confidencePercent"));
assert(!source.includes("overallScore"));

console.log(`Law transparency checks passed (${masksTested} input masks plus founder-first safeguards).`);
