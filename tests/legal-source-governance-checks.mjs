import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TEST_PATH = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(TEST_PATH), "..");

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(ROOT, relativePath), "utf8"));
}

async function readCsv(relativePath) {
  const text = await readFile(path.join(ROOT, relativePath), "utf8");
  return text.trim().split(/\r?\n/).map((line) => line.split(","));
}

const registry = await readJson("data/assessment/feature-coverage-registry.v1.json");
const catalog = await readJson("growwithhr-rag/data/posh-source-chunks.v1.json");
const mapping = await readJson("data/legal-source-governance/posh-section-mapping.v1.json");
const reviewRegister = await readCsv("docs/legal-source-governance/templates/legal-feature-review-register.csv");
const sourceRegisterTemplate = await readCsv("docs/legal-source-governance/templates/source-register-v2.csv");
const sectionMappingTemplate = await readCsv("docs/legal-source-governance/templates/section-mapping.csv");

assert.equal(mapping.schemaVersion, 1);
assert.equal(mapping.status, "draft-section-map");
assert.equal(mapping.legalReviewStatus, "needs-legal-review");
assert.equal(mapping.ragApprovalStatus, "not-approved");
assert.equal(mapping.runtimeActivation, false);

const expectedPoshFeatureIds = new Set([
  "feature.legal.posh.policy-review",
  "feature.legal.posh.awareness-training-review",
  "feature.legal.posh.notice-display-review",
  "feature.legal.posh.complaint-mechanism-records-review",
  "feature.legal.posh.internal-committee-composition-unit-review",
  "feature.legal.posh.annual-reporting-review"
]);

assert.equal(mapping.features.length, expectedPoshFeatureIds.size);
assert.deepEqual(new Set(mapping.features.map((feature) => feature.featureId)), expectedPoshFeatureIds);

const registryById = new Map(registry.features.map((feature) => [feature.id, feature]));
const sourceById = new Map(catalog.sources.map((source) => [source.registrySourceId, source]));

for (const feature of mapping.features) {
  const registryFeature = registryById.get(feature.featureId);
  assert.ok(registryFeature, `Missing Feature Coverage Registry entry for ${feature.featureId}`);
  assert.equal(registryFeature.classification, "legal-assurance");
  assert.notEqual(registryFeature.readiness, "live-governed", `${feature.featureId} must remain blocked while mapping is draft`);
  assert.ok(feature.proposedRuleId.startsWith("rule.legal.posh."));
  assert.ok(feature.requiredAssessmentFacts.length > 0);
  assert.ok(feature.proposedReasonCodes.length > 0);
  assert.ok(feature.sourceMappings.length > 0);

  for (const sourceMapping of feature.sourceMappings) {
    const source = sourceById.get(sourceMapping.registrySourceId);
    assert.ok(source, `Unknown POSH Source Register ID: ${sourceMapping.registrySourceId}`);
    assert.ok(sourceMapping.reference);

    const hasPages = Number.isInteger(sourceMapping.pdfPageStart) && Number.isInteger(sourceMapping.pdfPageEnd);
    if (hasPages) {
      assert.ok(sourceMapping.pdfPageStart >= 1);
      assert.ok(sourceMapping.pdfPageEnd >= sourceMapping.pdfPageStart);
      assert.ok(sourceMapping.pdfPageEnd <= source.pageCount);
      assert.notEqual(sourceMapping.pageVerificationStatus, "pending-exact-file-verification");
    } else {
      assert.equal(sourceMapping.pdfPageStart, null);
      assert.equal(sourceMapping.pdfPageEnd, null);
      assert.equal(sourceMapping.pageVerificationStatus, "pending-exact-file-verification");
    }
  }
}

for (const featureId of [
  "feature.legal.posh.complaint-mechanism-records-review",
  "feature.legal.posh.annual-reporting-review"
]) {
  const feature = mapping.features.find((candidate) => candidate.featureId === featureId);
  assert.ok(feature.privacyBoundary, `${featureId} requires an explicit privacy boundary`);
}

const legalRegistryIds = new Set(
  registry.features
    .filter((feature) => feature.classification === "legal-assurance")
    .map((feature) => feature.id)
);
const reviewRegisterRows = reviewRegister.slice(1);
assert.equal(legalRegistryIds.size, 18);
assert.equal(reviewRegisterRows.length, 18);
assert.deepEqual(new Set(reviewRegisterRows.map((row) => row[0])), legalRegistryIds);
assert.ok(reviewRegisterRows.every((row) => row[4] === "needs-legal-review"));
assert.ok(reviewRegisterRows.every((row) => row[5] === "not-approved"));

const requiredSourceColumns = [
  "sourceId",
  "featureId",
  "ruleId",
  "officialRecordUrl",
  "directOfficialPdfUrl",
  "currentStatus",
  "legalReviewStatus",
  "ragApproval",
  "sha256",
  "byteLength",
  "pageCount",
  "verificationStatus"
];
for (const column of requiredSourceColumns) {
  assert.ok(sourceRegisterTemplate[0].includes(column), `Source Register v2 template is missing ${column}`);
}

const requiredSectionColumns = [
  "featureId",
  "ruleId",
  "sourceId",
  "sectionRuleNotificationReference",
  "pdfPageStart",
  "pdfPageEnd",
  "permittedReasonCodes",
  "requiredAssessmentFacts",
  "missingFacts",
  "customerWordingLimitations",
  "legalReviewQuestions",
  "ragApprovalStatus",
  "chunkId"
];
for (const column of requiredSectionColumns) {
  assert.ok(sectionMappingTemplate[0].includes(column), `Section mapping template is missing ${column}`);
}

console.log(JSON.stringify({
  valid: true,
  legalFeatureCount: legalRegistryIds.size,
  mappedPoshFeatureCount: mapping.features.length,
  registeredPoshSourceCount: sourceById.size,
  pendingExactPageMappings: mapping.features.flatMap((feature) => feature.sourceMappings)
    .filter((sourceMapping) => sourceMapping.pageVerificationStatus === "pending-exact-file-verification")
    .length
}, null, 2));
