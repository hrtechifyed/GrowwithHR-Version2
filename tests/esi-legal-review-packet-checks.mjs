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

const mapping = await readJson("data/legal-source-governance/esi-section-mapping.v1.json");
const factContract = await readJson("data/assessment/esi-assessment-fact-contract.v1.json");
const decision = await readJson("data/legal-source-governance/esi-legal-review-decision.v1.json");
const packet = await readText("docs/legal-source-governance/review-packets/esi-legal-review-and-rag-approval-packet.md");

for (const record of [mapping, factContract, decision]) {
  assert.equal(record.schemaVersion, 1);
  assert.equal(record.legalReviewStatus, "needs-legal-review");
  assert.equal(record.privacyReviewStatus, "needs-privacy-review");
  assert.equal(record.ragApprovalStatus, "not-approved");
}
assert.equal(mapping.status, "draft-section-map");
assert.equal(mapping.assessmentCapture, false);
assert.equal(mapping.runtimeActivation, false);
assert.equal(factContract.status, "draft-fact-contract");
assert.equal(factContract.assessmentCapture, false);
assert.equal(factContract.runtimeMapping, false);
assert.equal(factContract.ruleActivation, false);
assert.equal(factContract.runtimeActivation, false);
assert.equal(decision.status, "awaiting-qualified-legal-review");
assert.equal(decision.submissionStatus, "draft-not-submitted");
assert.equal(decision.assessmentCapture, false);
assert.equal(decision.runtimeActivation, false);
assert.equal(decision.legalAdvice, false);
assert.equal(decision.repositoryCompanionOnly, true);
assert.equal(decision.finalOutcome.overallOutcome, null);
assert.equal(decision.finalOutcome.releaseApproval, null);

const expectedSources = new Map([
  ["social-security-code-2020", ["53ad67f75fbc874fd837274e9e887fac7a21cc55c7454398b2cdb96046fd7967", 1020695, 113]],
  ["social-security-central-rules-2026", ["37c5a8cd8684e9362f86a1a72642174045a302234fa1918e8a73a30296b43878", 3856046, 259]],
  ["social-security-code-commencement-so-5319e-2025", ["014ba41eba2c0beda344bf084e1bed1d6f7f6929aabdbc7b4fa25fe22bce45c5", 408295, 2]],
  ["social-security-code-corrigendum-so-5936e-2025", ["d14b088ef05a8f34c37d823b3b6fc6bd78a101e37882edc256d931e01e063a03", 560515, 2]],
  ["employees-state-insurance-central-rules-1950", ["bf1c13836ab0d718340763e6f037efb70c74655158cd1363ceb984b06c96be5a", 339742, 32]],
  ["employees-state-insurance-general-regulations-1950", ["01392b8a2f76104f270bf5933b6276316e5c45ef3db9dc7159bdb8006766e0d5", 357557, 34]],
  ["social-security-esi-authorised-officers-so-2350e-2026", ["785ab9a70a7b10e76beacb4a57a44d56064d77b865533175bd0f3c8c428fa5f3", 520182, 2]],
  ["social-security-esi-membership-continuation-so-2351e-2026", ["be49210c90df27fc329e3116c93f119549015af16a79e6b397f234d2fea7a9a0", 485272, 2]],
  ["social-security-esi-medical-practitioners-so-2352e-2026", ["54467f4d4a77493d2e9848351c245c8420b0f2b10b2880a6413c1ac2e075c0f6", 562248, 2]],
  ["social-security-esi-recovery-officers-so-2353e-2026", ["2d8bc3cdcad88e7cd8fd8ff6373779445b80d91a8ce6d2ef8ce6857faeb2d709", 836087, 9]],
  ["social-security-esi-orders-authentication-so-2354e-2026", ["d79982ec9db3f685d6b15cd0a2af9b110e3fe2058145702fa089ee4237726df4", 458884, 2]],
  ["other-beneficiaries-medical-facilities-scheme-2026", ["70a4a7626c7f3d313c3dec9eaa98a52f4a9fbb3ddcb789de5af4860494d58f49", 740840, 3]],
  ["social-security-esi-inspector-cum-facilitators-so-2356e-2026", ["29fe75efb149f0c44f0f263a9dedd4ff393856c27d3f35b48f35da81e84f6d41", 573456, 2]]
]);

assert.equal(mapping.sources.length, expectedSources.size);
assert.equal(decision.sourceBaseline.length, expectedSources.size);
for (const [sourceId, hash, bytes, pages] of mapping.sources) {
  const expected = expectedSources.get(sourceId);
  assert.ok(expected, `Unknown source ${sourceId}`);
  assert.deepEqual([hash, bytes, pages], expected);
}
for (const [sourceId, hash, bytes, pages, legalDecision, ragDecision] of decision.sourceBaseline) {
  const expected = expectedSources.get(sourceId);
  assert.ok(expected, `Unknown decision source ${sourceId}`);
  assert.deepEqual([hash, bytes, pages], expected);
  assert.equal(legalDecision, null);
  assert.equal(ragDecision, null);
}

const expectedFeatureIds = new Set([
  "feature.legal.esi.establishment-coverage",
  "feature.legal.esi.continuing-voluntary-coverage",
  "feature.legal.esi.seasonal-hazardous-plantation",
  "feature.legal.esi.area-benefit-commencement",
  "feature.legal.esi.employee-insurance",
  "feature.legal.esi.wage-ceiling",
  "feature.legal.esi.ceiling-continuation",
  "feature.legal.esi.contribution-rate",
  "feature.legal.esi.contractor-control",
  "feature.legal.esi.monthly-payment-control",
  "feature.legal.esi.accident-reporting-control",
  "feature.legal.esi.benefit-process-control",
  "feature.legal.esi.medical-administration",
  "feature.legal.esi.exemption",
  "feature.legal.esi.enforcement-authority"
]);
assert.equal(mapping.features.length, expectedFeatureIds.size);
assert.equal(factContract.featureFactGroups.length, expectedFeatureIds.size);
assert.equal(decision.featureDecisions.length, expectedFeatureIds.size);
assert.deepEqual(new Set(mapping.features.map((x) => x.featureId)), expectedFeatureIds);

assert.equal(factContract.factCount, 65);
assert.equal(factContract.factIds.length, 65);
assert.equal(new Set(factContract.factIds).size, 65);

const factSet = new Set(factContract.factIds);
const groups = new Map(factContract.featureFactGroups.map((x) => [x.featureId, x.factIds]));
const mappedFeatures = new Map(mapping.features.map((x) => [x.featureId, x]));
const decisions = new Map(decision.featureDecisions.map((x) => [x.featureId, x]));
for (const featureId of expectedFeatureIds) {
  const feature = mappedFeatures.get(featureId);
  const featureDecision = decisions.get(featureId);
  assert.ok(feature);
  assert.ok(feature.proposedRuleId.startsWith("rule.legal.esi."));
  assert.equal(feature.approvalStatus, "not-approved");
  assert.ok(feature.proposedStatuses.includes("blocked-pending-legal-review"));
  assert.ok(feature.proposedReasonCodes.length > 0);
  assert.ok(feature.sourceMappings.length > 0);
  assert.ok(groups.get(featureId).length > 0);
  for (const factId of groups.get(featureId)) assert.ok(factSet.has(factId), `Unknown fact ${factId}`);
  assert.equal(featureDecision.decision, null);
  assert.deepEqual(featureDecision.approvedStatuses, []);
  assert.deepEqual(featureDecision.approvedReasonCodes, []);
  assert.deepEqual(featureDecision.approvedSourceScopes, []);
  assert.equal(featureDecision.customerWordingApproved, false);
  assert.equal(featureDecision.privacyBoundaryApproved, false);
  for (const [sourceId, , start, end] of feature.sourceMappings) {
    const expected = expectedSources.get(sourceId);
    assert.ok(expected, `Unknown mapping source ${sourceId}`);
    assert.ok(Number.isInteger(start) && Number.isInteger(end));
    assert.ok(start >= 1 && end >= start && end <= expected[2]);
  }
  assert.ok(packet.includes(featureId), `Packet missing ${featureId}`);
}

for (const key of [
  "rawAssessmentAnswersAllowed",
  "personalNamesAllowed",
  "identityNumbersAllowed",
  "employeeLevelWagesAllowed",
  "payrollOrContributionBodiesAllowed",
  "medicalOrFamilyDetailsAllowed",
  "accidentNarrativesAllowed",
  "claimDocumentsAllowed",
  "enforcementDocumentsAllowed",
  "exemptionEvidenceBodiesAllowed",
  "evidenceBodiesAllowed"
]) assert.equal(factContract.providerPolicy[key], false, `${key} must remain false`);

assert.equal(mapping.sourceGaps.length, 10);
assert.deepEqual(mapping.sourceGaps, decision.sourceGaps);
assert.ok(mapping.sourceGaps.some((x) => /wage-ceiling/i.test(x)));
assert.ok(mapping.sourceGaps.some((x) => /hazardous/i.test(x)));
assert.ok(mapping.sourceGaps.some((x) => /area/i.test(x)));
assert.ok(mapping.sourceGaps.some((x) => /S\.O\. 2060\(E\)/.test(x)));
assert.ok(mapping.sourceGaps.some((x) => /saved-law|regulation/i.test(x)));

for (const item of decision.globalDecisions) {
  assert.equal(item.decision, null);
  assert.deepEqual(item.conditions, []);
  assert.equal(item.reviewer, null);
  assert.equal(item.reviewDate, null);
}
assert.equal(decision.globalDecisions.length, 12);
assert.match(packet, /A blank decision is not approval\./);
assert.match(packet, /No production deterministic rule or RAG chunk is created by this packet\./);
assert.match(packet, /Runtime activation: \*\*Blocked \/ false\*\*/);
assert.match(packet, /current Chapter IV wage-ceiling notification/i);
assert.match(packet, /medical or employment causation/i);
assert.match(packet, /Assessment capture: \*\*Disabled\*\*/);

for (const [sourceId, [hash]] of expectedSources) {
  assert.ok(packet.includes(sourceId), `Packet missing ${sourceId}`);
  assert.ok(packet.includes(hash), `Packet missing hash for ${sourceId}`);
}

console.log(JSON.stringify({
  valid: true,
  sourceCount: mapping.sources.length,
  featureCount: mapping.features.length,
  uniqueFactCount: factContract.factIds.length,
  pendingGlobalDecisions: decision.globalDecisions.length,
  pendingFeatureDecisions: decision.featureDecisions.length,
  assessmentCapture: factContract.assessmentCapture,
  runtimeActivation: decision.runtimeActivation
}, null, 2));
