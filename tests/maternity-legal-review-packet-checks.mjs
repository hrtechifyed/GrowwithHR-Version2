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

const mapping = await readJson("data/legal-source-governance/maternity-section-mapping.v1.json");
const factContract = await readJson("data/assessment/maternity-assessment-fact-contract.v1.json");
const decision = await readJson("data/legal-source-governance/maternity-legal-review-decision.v1.json");
const packet = await readText("docs/legal-source-governance/review-packets/maternity-legal-review-and-rag-approval-packet.md");

for (const record of [mapping, factContract, decision]) {
  assert.equal(record.schemaVersion, 1);
  assert.equal(record.legalReviewStatus, "needs-legal-review");
  assert.equal(record.ragApprovalStatus, "not-approved");
}

assert.equal(mapping.status, "draft-section-map");
assert.equal(mapping.privacyReviewStatus, "needs-privacy-review");
assert.equal(mapping.runtimeActivation, false);
assert.equal(factContract.status, "draft-fact-contract");
assert.equal(factContract.privacyReviewStatus, "needs-privacy-review");
assert.equal(factContract.runtimeMapping, false);
assert.equal(factContract.assessmentCapture, false);
assert.equal(factContract.ruleActivation, false);
assert.equal(decision.status, "awaiting-qualified-legal-review");
assert.equal(decision.submissionStatus, "submitted-awaiting-completed-reviewer-decisions");
assert.equal(decision.privacyReviewStatus, "needs-privacy-review");
assert.equal(decision.runtimeActivation, false);
assert.equal(decision.legalAdvice, false);
assert.equal(decision.repositoryCompanionOnly, true);
assert.equal(decision.finalOutcome.overallOutcome, null);
assert.equal(decision.finalOutcome.releaseApproval, null);

const expectedSources = new Map([
  ["social-security-code-2020", ["53ad67f75fbc874fd837274e9e887fac7a21cc55c7454398b2cdb96046fd7967", 1020695, 113]],
  ["social-security-central-rules-2026", ["37c5a8cd8684e9362f86a1a72642174045a302234fa1918e8a73a30296b43878", 3856046, 259]],
  ["social-security-code-commencement-so-5319e-2025", ["014ba41eba2c0beda344bf084e1bed1d6f7f6929aabdbc7b4fa25fe22bce45c5", 408295, 2]],
  ["social-security-code-corrigendum-so-5936e-2025", ["d14b088ef05a8f34c37d823b3b6fc6bd78a101e37882edc256d931e01e063a03", 560515, 2]]
]);

assert.equal(mapping.sources.length, expectedSources.size);
assert.equal(decision.sourceBaseline.length, expectedSources.size);

for (const source of mapping.sources) {
  const expected = expectedSources.get(source.registrySourceId);
  assert.ok(expected, `Unknown source ${source.registrySourceId}`);
  assert.equal(source.sha256, expected[0]);
  assert.equal(source.byteLength, expected[1]);
  assert.equal(source.pageCount, expected[2]);
}

for (const source of decision.sourceBaseline) {
  const expected = expectedSources.get(source.registrySourceId);
  assert.ok(expected, `Unknown decision source ${source.registrySourceId}`);
  assert.equal(source.sha256, expected[0]);
  assert.equal(source.byteLength, expected[1]);
  assert.equal(source.pageCount, expected[2]);
  assert.equal(source.controlledIdentityRecorded, true);
  assert.equal(source.legalReviewDecision, null);
  assert.equal(source.ragApprovalDecision, null);
}

const expectedFeatureIds = new Set([
  "feature.legal.maternity.establishment-coverage",
  "feature.legal.maternity.employee-eligibility",
  "feature.legal.maternity.benefit-duration-review",
  "feature.legal.maternity.adopting-commissioning-mother-review",
  "feature.legal.maternity.miscarriage-tubectomy-illness-leave-review",
  "feature.legal.maternity.nursing-break-review",
  "feature.legal.maternity.creche-review",
  "feature.legal.maternity.notice-payment-records-review",
  "feature.legal.maternity.employment-protection-review",
  "feature.legal.maternity.esi-overlap-review"
]);

assert.equal(mapping.features.length, expectedFeatureIds.size);
assert.deepEqual(new Set(mapping.features.map((entry) => entry.featureId)), expectedFeatureIds);
assert.equal(decision.featureDecisions.length, expectedFeatureIds.size);
assert.equal(factContract.featureFactGroups.length, expectedFeatureIds.size);

const factsByFeature = new Map();
const factById = new Map();
for (const group of factContract.featureFactGroups) {
  assert.ok(expectedFeatureIds.has(group.featureId), `Unknown fact group ${group.featureId}`);
  const ids = [];
  for (const fact of group.facts) {
    ids.push(fact.factId);
    const existing = factById.get(fact.factId);
    if (existing) {
      assert.deepEqual(existing, fact, `Shared fact ${fact.factId} must have identical metadata`);
    } else {
      factById.set(fact.factId, fact);
    }
    assert.ok(["internal", "restricted", "highly-sensitive"].includes(fact.sensitivity));
    if (fact.sensitivity === "highly-sensitive") {
      assert.equal(fact.providerHandling, "never");
    }
  }
  factsByFeature.set(group.featureId, ids);
}
assert.ok(factById.size >= 50);
assert.equal(factContract.factDefaults.collectionStatus, "planned-not-captured");
assert.equal(factContract.factDefaults.legalReviewStatus, "needs-legal-review");

const mappingByFeature = new Map(mapping.features.map((entry) => [entry.featureId, entry]));
const decisionByFeature = new Map(decision.featureDecisions.map((entry) => [entry.featureId, entry]));

for (const featureId of expectedFeatureIds) {
  const feature = mappingByFeature.get(featureId);
  const featureDecision = decisionByFeature.get(featureId);
  assert.ok(feature, `Missing mapping ${featureId}`);
  assert.ok(featureDecision, `Missing decision ${featureId}`);
  assert.ok(feature.proposedRuleId.startsWith("rule.legal.maternity."));
  assert.equal(feature.approvalStatus, "not-approved");
  assert.ok(feature.requiredAssessmentFacts.length > 0);
  assert.ok(feature.proposedReasonCodes.length > 0);
  assert.ok(feature.sourceMappings.length > 0);
  assert.equal(featureDecision.proposedRuleId, feature.proposedRuleId);
  assert.equal(featureDecision.factCount, feature.requiredAssessmentFacts.length);
  assert.deepEqual(new Set(factsByFeature.get(featureId)), new Set(feature.requiredAssessmentFacts));
  assert.equal(featureDecision.decision, null);
  assert.deepEqual(featureDecision.approvedStatuses, []);
  assert.deepEqual(featureDecision.approvedReasonCodes, []);
  assert.deepEqual(featureDecision.approvedSourceScopes, []);
  assert.equal(featureDecision.customerWordingApproved, false);
  assert.equal(featureDecision.privacyBoundaryApproved, false);
  assert.equal(featureDecision.reviewer, null);
  assert.equal(featureDecision.reviewDate, null);

  for (const sourceMapping of feature.sourceMappings) {
    const expected = expectedSources.get(sourceMapping.registrySourceId);
    assert.ok(expected, `Unknown mapping source ${sourceMapping.registrySourceId}`);
    assert.equal(sourceMapping.pdfPages.length, 2);
    const [start, end] = sourceMapping.pdfPages;
    assert.ok(Number.isInteger(start) && Number.isInteger(end));
    assert.ok(start >= 1);
    assert.ok(end >= start);
    assert.ok(end <= expected[2]);
    assert.equal(sourceMapping.verificationStatus, "recorded-against-controlled-file-identity");
  }

  assert.ok(packet.includes(featureId), `Packet is missing ${featureId}`);
}

for (const key of [
  "rawAssessmentAnswersAllowed",
  "personalNamesAllowed",
  "medicalCertificatesAllowed",
  "medicalNarrativesAllowed",
  "exactEventDatesAllowed",
  "childDetailsAllowed",
  "adoptionDocumentsAllowed",
  "surrogacyRecordsAllowed",
  "esiIdentifiersAllowed",
  "claimDocumentsAllowed",
  "bankDetailsAllowed",
  "disciplinaryEvidenceAllowed",
  "completedFormsAllowed"
]) {
  assert.equal(factContract.providerPolicy[key], false, `${key} must remain false`);
}

for (const entry of decision.globalDecisions) {
  assert.equal(entry.decision, null);
  assert.deepEqual(entry.conditions, []);
  assert.equal(entry.reviewer, null);
  assert.equal(entry.reviewDate, null);
}

assert.ok(decision.reviewPrerequisites.every((item) => item.status === "pending"));
assert.match(packet, /A blank decision is not approval\./);
assert.match(packet, /No production deterministic rule or RAG chunk is created by this packet\./);
assert.match(packet, /Runtime activation: Blocked \/ false/);
assert.match(packet, /medical certificates, diagnoses, clinical narratives/i);
assert.match(packet, /State-sphere rules and saved notifications/i);

for (const [sourceId, [hash]] of expectedSources) {
  assert.ok(packet.includes(sourceId), `Packet is missing ${sourceId}`);
  assert.ok(packet.includes(hash), `Packet is missing the hash for ${sourceId}`);
}

console.log(JSON.stringify({
  valid: true,
  sourceCount: mapping.sources.length,
  featureCount: mapping.features.length,
  uniqueFactCount: factById.size,
  pendingGlobalDecisions: decision.globalDecisions.filter((entry) => entry.decision === null).length,
  pendingFeatureDecisions: decision.featureDecisions.filter((entry) => entry.decision === null).length,
  runtimeActivation: decision.runtimeActivation
}, null, 2));
