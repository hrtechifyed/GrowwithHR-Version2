import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TEST_PATH = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(TEST_PATH), "..");

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(ROOT, relativePath), "utf8"));
}

async function readText(relativePath) {
  return readFile(path.join(ROOT, relativePath), "utf8");
}

const decision = await readJson("data/legal-source-governance/remaining-posh-legal-review-decision.v1.json");
const mapping = await readJson("data/legal-source-governance/posh-section-mapping.v1.json");
const factContract = await readJson("data/assessment/posh-assessment-fact-contract.v1.json");
const pageVerification = await readJson("data/legal-source-governance/posh-rules-page-verification.v1.json");
const catalog = await readJson("growwithhr-rag/data/posh-source-chunks.v1.json");
const registry = await readJson("data/assessment/feature-coverage-registry.v1.json");
const packet = await readText("docs/legal-source-governance/review-packets/remaining-posh-legal-review-packet.md");

assert.equal(decision.schemaVersion, 1);
assert.equal(decision.status, "awaiting-qualified-legal-review");
assert.equal(decision.legalReviewStatus, "needs-legal-review");
assert.equal(decision.ragApprovalStatus, "not-approved");
assert.equal(decision.runtimeActivation, false);
assert.equal(decision.legalAdvice, false);
assert.equal(decision.repositoryCompanionOnly, true);
assert.deepEqual(decision.allowedLegalReviewDecisions, [
  "reviewed-with-conditions",
  "approved",
  "rejected"
]);

assert.equal(decision.reviewMaterials.sectionMapping, "data/legal-source-governance/posh-section-mapping.v1.json");
assert.equal(decision.reviewMaterials.factContract, "data/assessment/posh-assessment-fact-contract.v1.json");
assert.equal(decision.reviewMaterials.rulesPageVerification, "data/legal-source-governance/posh-rules-page-verification.v1.json");
assert.equal(decision.reviewMaterials.sourceCatalog, "growwithhr-rag/data/posh-source-chunks.v1.json");

const catalogSources = new Map(catalog.sources.map((source) => [source.registrySourceId, source]));
assert.equal(decision.sourceBaseline.length, catalog.sources.length);
for (const sourceRecord of decision.sourceBaseline) {
  const source = catalogSources.get(sourceRecord.registrySourceId);
  assert.ok(source, `Unknown source in legal-review decision record: ${sourceRecord.registrySourceId}`);
  assert.equal(sourceRecord.sha256, source.sha256);
  assert.equal(sourceRecord.pageCount, source.pageCount);
  assert.equal(sourceRecord.exactControlledDriveFileVerifiedForThisReview, false);
  assert.equal(sourceRecord.legalReviewDecision, null);
}

assert.equal(decision.reviewPrerequisites.length, 3);
for (const prerequisite of decision.reviewPrerequisites) {
  assert.equal(prerequisite.status, "pending");
  assert.equal(prerequisite.evidenceReference, null);
}

const globalDecisionIds = new Set(decision.globalDecisions.map((entry) => entry.decisionId));
assert.ok(globalDecisionIds.has("posh-current-law-and-supersession"));
assert.ok(globalDecisionIds.has("posh-2016-terminology-amendment"));
assert.ok(globalDecisionIds.has("posh-fact-sufficiency"));
assert.ok(globalDecisionIds.has("posh-status-and-reason-code-model"));
assert.ok(globalDecisionIds.has("posh-privacy-and-provider-boundary"));
assert.ok(globalDecisionIds.has("posh-customer-wording-boundary"));
for (const entry of decision.globalDecisions) {
  assert.equal(entry.decision, null);
  assert.deepEqual(entry.conditions, []);
  assert.equal(entry.reviewer, null);
  assert.equal(entry.reviewDate, null);
  assert.equal(entry.nextReviewDate, null);
}

const mappedFeatureIds = new Set(mapping.features.map((feature) => feature.featureId));
assert.equal(decision.featureDecisions.length, mapping.features.length);
assert.deepEqual(new Set(decision.featureDecisions.map((entry) => entry.featureId)), mappedFeatureIds);

const mappingByFeature = new Map(mapping.features.map((feature) => [feature.featureId, feature]));
const registryByFeature = new Map(registry.features.map((feature) => [feature.id, feature]));
const factsByFeature = new Map();
for (const fact of factContract.facts) {
  for (const featureId of fact.featureIds) {
    const facts = factsByFeature.get(featureId) || [];
    facts.push(fact.factId);
    factsByFeature.set(featureId, facts);
  }
}

for (const entry of decision.featureDecisions) {
  const featureMapping = mappingByFeature.get(entry.featureId);
  assert.ok(featureMapping, `Missing section mapping for ${entry.featureId}`);
  assert.equal(entry.proposedRuleId, featureMapping.proposedRuleId);
  assert.equal(entry.factCount, featureMapping.requiredAssessmentFacts.length);
  assert.equal(entry.factCount, (factsByFeature.get(entry.featureId) || []).length);
  assert.deepEqual(
    new Set(factsByFeature.get(entry.featureId) || []),
    new Set(featureMapping.requiredAssessmentFacts)
  );

  const registryFeature = registryByFeature.get(entry.featureId);
  assert.ok(registryFeature, `Missing registry feature ${entry.featureId}`);
  assert.equal(registryFeature.classification, "legal-assurance");
  assert.notEqual(registryFeature.readiness, "live-governed");
  assert.deepEqual(registryFeature.currentRuleRefs, []);
  assert.equal(registryFeature.explanation.route, null);
  assert.equal(registryFeature.explanation.uiSurface, null);

  assert.equal(entry.decision, null);
  assert.deepEqual(entry.approvedStatuses, []);
  assert.deepEqual(entry.approvedReasonCodes, []);
  assert.deepEqual(entry.approvedSourceScopes, []);
  assert.deepEqual(entry.conditions, []);
  assert.equal(entry.customerWordingApproved, false);
  if (Object.hasOwn(entry, "privacyBoundaryApproved")) {
    assert.equal(entry.privacyBoundaryApproved, false);
  }
  assert.equal(entry.reviewer, null);
  assert.equal(entry.reviewDate, null);
  assert.equal(entry.nextReviewDate, null);

  for (const sourceMapping of featureMapping.sourceMappings) {
    assert.ok(
      entry.sourceScope.includes(sourceMapping.reference),
      `${entry.featureId} decision scope is missing ${sourceMapping.reference}`
    );
  }
  assert.ok(entry.sourceScope.includes("S.O. 3606(E)"));
}

assert.equal(mapping.runtimeActivation, false);
assert.equal(factContract.runtimeMapping, false);
assert.equal(factContract.assessmentCapture, false);
assert.equal(factContract.ruleActivation, false);
assert.equal(pageVerification.runtimeActivation, false);
assert.equal(pageVerification.approvalBoundary.exactDriveFileHashVerifiedInThisRecord, false);
assert.equal(pageVerification.approvalBoundary.legalInterpretationApproved, false);
assert.equal(pageVerification.approvalBoundary.approvedForRag, false);

assert.match(packet, /not legal advice/i);
assert.match(packet, /awaiting qualified legal review/i);
assert.match(packet, /A blank decision is not approval\./);
assert.match(packet, /2016 terminology-amendment record/i);
assert.match(packet, /complaint narratives, names, allegations/i);
assert.match(packet, /stable report, PDF, email, and browser-storage contracts remain unchanged/i);
for (const featureId of mappedFeatureIds) {
  assert.ok(packet.includes(featureId), `Review packet is missing ${featureId}`);
}
for (const source of catalog.sources) {
  assert.ok(packet.includes(source.registrySourceId), `Review packet is missing ${source.registrySourceId}`);
  assert.ok(packet.includes(source.sha256), `Review packet is missing the registered hash for ${source.registrySourceId}`);
}

console.log(JSON.stringify({
  valid: true,
  reviewStatus: decision.status,
  featureDecisionCount: decision.featureDecisions.length,
  globalDecisionCount: decision.globalDecisions.length,
  factCount: factContract.facts.length,
  sourceCount: decision.sourceBaseline.length,
  pendingPrerequisiteCount: decision.reviewPrerequisites.filter((item) => item.status === "pending").length
}, null, 2));
