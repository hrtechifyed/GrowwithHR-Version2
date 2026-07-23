import assert from "node:assert/strict";
import fs from "node:fs";
import {
    MODEL_VERSION,
    DIMENSIONS,
    QUESTION_CATALOG,
    buildExplainableIntelligence
} from "../js/assessment-v3/explainable-intelligence-model.js";

const schema = JSON.parse(
    fs.readFileSync("schemas/explainable-intelligence.schema.json", "utf8")
);

assert.equal(MODEL_VERSION, "0.19.0-m4-explainable-intelligence");
assert.deepEqual(DIMENSIONS, [
    "profileCompleteness",
    "applicabilityCertainty",
    "evidenceCoverage"
]);
assert.equal(QUESTION_CATALOG.length, 6);
assert.equal(schema.properties.modelVersion.const, MODEL_VERSION);

const input = {
    answers: {
        entity: "Private Limited",
        employees: 45,
        primaryState: "Maharashtra; Karnataka",
        workModel: "Hybrid",
        peopleFunction: "Founder Led"
    },
    traceability: {
        facts: [
            { id: "fact-1", evidenceStatus: "verified" },
            { id: "fact-2", evidenceStatus: "not_verified" }
        ],
        rules: [
            { id: "rule-1", status: "applicable", missingFacts: [] },
            { id: "rule-2", status: "more_information_needed", missingFacts: ["contractorCount"] }
        ],
        recommendations: [
            { id: "rec-1", evidenceStatus: "available" },
            { id: "rec-2", evidenceStatus: "not_verified" }
        ]
    }
};

const first = buildExplainableIntelligence(input);
const second = buildExplainableIntelligence(input);

assert.equal(first.metrics.profileCompleteness.value, 100);
assert.equal(first.metrics.applicabilityCertainty.value, 50);
assert.equal(first.metrics.evidenceCoverage.value, 50);
assert.equal(first.nextBestQuestion.id, "evidence-register");
assert.equal(first.nextBestQuestion.dimension, "evidenceCoverage");
assert.equal(first.safeguards.noBlendedPercentage, true);
assert.equal(first.safeguards.modifiesProtectedState, false);
assert.equal(first.safeguards.legalCertification, false);
assert.equal(first.safeguards.indiaOperationsOnly, true);
assert.equal(first.decisionTrace.length, 5);
assert.equal(Object.prototype.hasOwnProperty.call(first, "overallScore"), false);
assert.equal(Object.prototype.hasOwnProperty.call(first.metrics, "overall"), false);

const withoutTime = ({ generatedAt, ...value }) => value;
assert.deepEqual(withoutTime(first), withoutTime(second));

const incomplete = buildExplainableIntelligence({ answers: {} });
assert.equal(incomplete.metrics.profileCompleteness.value, 0);
assert.equal(incomplete.metrics.applicabilityCertainty.value, 0);
assert.equal(incomplete.metrics.evidenceCoverage.value, 0);
assert.equal(incomplete.questions.length, QUESTION_CATALOG.length);
assert.equal(incomplete.questions[0].id, "evidence-register");
assert(
    incomplete.questions.every((question, index, questions) => (
        index === 0 ||
        questions[index - 1].estimatedInformationGain >= question.estimatedInformationGain
    )),
    "questions must be ordered by estimated information gain"
);

for (const dimension of DIMENSIONS) {
    const metric = first.metrics[dimension];
    assert(Number.isInteger(metric.value));
    assert(metric.value >= 0 && metric.value <= 100);
    assert.equal(typeof metric.basis, "string");
    assert(metric.basis.length > 20);
}

console.log("M4 explainable intelligence contract checks passed.");
