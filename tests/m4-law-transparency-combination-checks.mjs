import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync("js/pdf-law-transparency.js", "utf8");
new vm.Script(source, { filename: "js/pdf-law-transparency.js" });

const sandbox = {
    console,
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
assert(api, "M4 transparency API must be installed");
assert.equal(api.version, "0.19.0-m4-law-transparency");
assert.equal(api.lawCatalog.length, 11, "expected governed law catalog size");

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
    womenEmployees: true,
    wageBand: "Confirmed",
    industry: "Technology",
    workerCategories: ["Employees", "Workers"],
    usesPower: true,
    manufacturingOperations: true
};

const sampleByField = {
    employees: 60,
    workers: 120,
    contractors: 25,
    indiaOperations: true,
    establishmentType: "Private limited company",
    primaryState: "Karnataka",
    operatingStates: ["Karnataka", "Maharashtra"],
    womenEmployees: true,
    wageBand: "Confirmed",
    industry: "Technology",
    workerCategories: ["Employees", "Workers"],
    usesPower: true,
    manufacturingOperations: true
};

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
    assert(!/ministry|labour\.gov/i.test(rows[0].officialUrl || ""), `${law.id}: no generic ministry landing page`);
    assert.match(rows[0].confidenceMeaning, /input coverage, not legal certainty/i);
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

        const rows = build(law.id, answers);
        assert.equal(rows.length, 1, `${law.id} mask ${mask}: law detection`);
        const [row] = rows;
        assert.equal(row.inputCoverage.confirmed, expectedConfirmed, `${law.id} mask ${mask}: confirmed count`);
        assert.equal(row.inputCoverage.required, required.length, `${law.id} mask ${mask}: required count`);
        assert.equal(row.missingInputs.length, required.length - expectedConfirmed, `${law.id} mask ${mask}: missing count`);
        masksTested += 1;
    }
}
assert.equal(masksTested, expectedMasks, `expected every governed input bitmask, got ${masksTested} of ${expectedMasks}`);

const boundaryCases = [
    { employees: undefined, expected: "needs-information" },
    { employees: 1, expected: "below" },
    { employees: 8, expected: "near" },
    { employees: 10, expected: "crossed" },
    { employees: 500, expected: "crossed" }
];
for (const testCase of boundaryCases) {
    const answers = { ...completeAnswers };
    if (testCase.employees === undefined) delete answers.employees;
    else answers.employees = testCase.employees;
    const [row] = build("posh", answers);
    assert.equal(row.thresholdResult.state, testCase.expected, `POSH boundary ${String(testCase.employees)}`);
}

for (const [employees, expected] of [[17, "below"], [18, "near"], [19, "near"], [20, "crossed"], [21, "crossed"]]) {
    const [row] = build("epf", { ...completeAnswers, employees });
    assert.equal(row.thresholdResult.state, expected, `EPF ${employees}`);
}

for (const [contractors, expected] of [[17, "below"], [18, "near"], [19, "near"], [20, "crossed"]]) {
    const [row] = build("contract-labour", { ...completeAnswers, employees: 500, contractors });
    assert.equal(row.thresholdResult.state, expected, `contract labour ${contractors}`);
}

for (const scenario of [
    { workers: 9, usesPower: true, expected: "near" },
    { workers: 10, usesPower: true, expected: "crossed" },
    { workers: 18, usesPower: false, expected: "near" },
    { workers: 20, usesPower: false, expected: "crossed" },
    { workers: 20, usesPower: undefined, expected: "needs-information" }
]) {
    const answers = { ...completeAnswers, workers: scenario.workers };
    if (scenario.usesPower === undefined) delete answers.usesPower;
    else answers.usesPower = scenario.usesPower;
    const [row] = build("factories", answers);
    assert.equal(row.thresholdResult.state, scenario.expected, `factory ${JSON.stringify(scenario)}`);
}

const allRecommendations = Object.values(recommendationByLaw).map((title) => ({ title }));
const allRows = sandbox.window.GrowWithHRPDF.buildLawTransparency(
    { answers: completeAnswers },
    { recommendations: [...allRecommendations, ...allRecommendations] }
);
assert.equal(allRows.length, api.lawCatalog.length);
assert.equal(
    JSON.stringify(Array.from(allRows, (row) => row.id)),
    JSON.stringify(Array.from(api.lawCatalog, (law) => law.id)),
    "multiple recommendations must preserve catalog order without duplicates"
);

const first = sandbox.window.GrowWithHRPDF.buildLawTransparency(
    { answers: completeAnswers },
    { recommendations: allRecommendations }
);
const second = sandbox.window.GrowWithHRPDF.buildLawTransparency(
    { answers: completeAnswers },
    { recommendations: allRecommendations }
);
assert.equal(JSON.stringify(first), JSON.stringify(second));

assert(source.includes("REQUIRED INPUTS CONFIRMED"));
assert(source.includes("textWithLink"));
assert(source.includes("This is input coverage, not legal certainty"));
assert(source.includes("deletePage"), "existing closing page must be moved, not replaced permanently");
assert(source.includes("drawClosingPage"), "existing closing structure must remain after appendix");
assert(source.includes("Array.isArray(result?.pdfs)"), "dual-theme output must be covered");
assert(!source.includes("confidencePercent"));
assert(!source.includes("overallScore"));

console.log(`M4 law transparency checks passed (${masksTested} complete input masks plus threshold boundaries).`);
