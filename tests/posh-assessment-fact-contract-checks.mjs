import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TEST_PATH = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(TEST_PATH), "..");

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(ROOT, relativePath), "utf8"));
}

const contract = await readJson("data/assessment/posh-assessment-fact-contract.v1.json");
const mapping = await readJson("data/legal-source-governance/posh-section-mapping.v1.json");
const registry = await readJson("data/assessment/feature-coverage-registry.v1.json");
const factMapperSource = await readFile(path.join(ROOT, "js/assessment-v3/fact-mapper.js"), "utf8");

assert.equal(contract.schemaVersion, 1);
assert.equal(contract.status, "draft-fact-contract");
assert.equal(contract.legalReviewStatus, "needs-legal-review");
assert.equal(contract.runtimeMapping, false);
assert.equal(contract.assessmentCapture, false);
assert.equal(contract.ruleActivation, false);

for (const [policy, allowed] of Object.entries({
  rawAssessmentAnswersAllowed: false,
  personalNamesAllowed: false,
  contactDetailsAllowed: false,
  complaintNarrativesAllowed: false,
  allegationsAllowed: false,
  caseEvidenceAllowed: false,
  caseFindingsAllowed: false,
  caseLevelStatisticsAllowed: false
})) {
  assert.equal(contract.providerPolicy[policy], allowed, `${policy} must remain prohibited`);
}

assert.equal(contract.facts.length, 35);

const factIds = contract.facts.map((fact) => fact.factId);
const answerKeys = contract.facts.map((fact) => fact.answerKey);
assert.equal(new Set(factIds).size, factIds.length, "POSH fact IDs must be unique");
assert.equal(new Set(answerKeys).size, answerKeys.length, "POSH answer keys must be unique");

const allowedValueTypes = new Set(contract.allowedValueTypes);
const factsById = new Map(contract.facts.map((fact) => [fact.factId, fact]));
const registryById = new Map(registry.features.map((feature) => [feature.id, feature]));

for (const fact of contract.facts) {
  assert.match(fact.factId, /^fact\.posh\./);
  assert.match(fact.answerKey, /^posh[A-Z]/);
  assert.equal(fact.featureIds.length, 1);
  assert.ok(allowedValueTypes.has(fact.valueType), `Unknown value type for ${fact.factId}`);
  assert.equal(fact.collectionStatus, "planned-not-captured");
  assert.equal(fact.legalReviewStatus, "needs-legal-review");
  assert.ok(["never", "deterministic-summary-only"].includes(fact.providerHandling));
  assert.ok(fact.notes);
  assert.equal(
    factMapperSource.includes(fact.answerKey),
    false,
    `${fact.answerKey} must not enter the runtime mapper while runtimeMapping is false`
  );
}

const mappedFactIds = mapping.features.flatMap((feature) => feature.requiredAssessmentFacts);
assert.deepEqual(
  new Set(factIds),
  new Set(mappedFactIds),
  "The draft fact contract must exactly cover the facts in the approved draft POSH section map"
);

for (const feature of mapping.features) {
  const registryFeature = registryById.get(feature.featureId);
  assert.ok(registryFeature, `Missing registry feature ${feature.featureId}`);
  assert.equal(registryFeature.readiness, "blocked");
  assert.deepEqual(registryFeature.currentRuleRefs, []);
  assert.equal(registryFeature.explanation.status, "blocked");

  for (const factId of feature.requiredAssessmentFacts) {
    const fact = factsById.get(factId);
    assert.ok(fact, `Missing fact contract entry for ${factId}`);
    assert.deepEqual(fact.featureIds, [feature.featureId]);
  }
}

const evidenceFacts = contract.facts.filter((fact) => fact.valueType === "evidence-reference-array");
assert.ok(evidenceFacts.length > 0);
assert.ok(evidenceFacts.every((fact) => fact.providerHandling === "never"));
assert.ok(evidenceFacts.every((fact) => fact.sensitivity === "restricted"));

const complaintFacts = contract.facts.filter((fact) => fact.factId.startsWith("fact.posh.complaint."));
assert.equal(complaintFacts.length, 6);
assert.ok(complaintFacts.every((fact) => ["restricted", "highly-restricted"].includes(fact.sensitivity)));
assert.ok(complaintFacts.every((fact) => fact.providerHandling === "deterministic-summary-only"));

const annualSensitiveFacts = [
  "fact.posh.annual-report.aggregate-complaint-statistics-present",
  "fact.posh.annual-report.action-status-present"
].map((factId) => factsById.get(factId));
assert.ok(annualSensitiveFacts.every(Boolean));
assert.ok(annualSensitiveFacts.every((fact) => fact.sensitivity === "highly-restricted"));
assert.ok(annualSensitiveFacts.every((fact) => fact.valueType === "boolean"));

const perLocationFacts = contract.facts.filter((fact) =>
  fact.valueType === "location-control-array" ||
  fact.valueType === "location-reference-array"
);
assert.equal(perLocationFacts.length, 4);
assert.ok(perLocationFacts.every((fact) => fact.collectionUnit === "location"));

const perUnitFacts = contract.facts.filter((fact) =>
  fact.valueType === "unit-count-array" ||
  fact.valueType === "unit-control-array"
);
assert.equal(perUnitFacts.length, 2);
assert.ok(perUnitFacts.every((fact) => fact.collectionUnit === "administrative-unit"));

for (const factId of [
  "fact.posh.policy.owner",
  "fact.posh.complaint.process-owner",
  "fact.posh.ic.presiding-officer",
  "fact.posh.ic.external-member"
]) {
  assert.match(factsById.get(factId).notes, /do not collect a person's name/i);
}

console.log(JSON.stringify({
  valid: true,
  factCount: contract.facts.length,
  featureCount: mapping.features.length,
  evidenceReferenceFactCount: evidenceFacts.length,
  complaintFactCount: complaintFacts.length,
  perLocationFactCount: perLocationFacts.length,
  perUnitFactCount: perUnitFacts.length,
  runtimeMapping: contract.runtimeMapping,
  assessmentCapture: contract.assessmentCapture,
  ruleActivation: contract.ruleActivation
}, null, 2));
