import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const register = JSON.parse(await readFile(
  path.join(ROOT, "data/legal-source-governance/legal-source-readiness-register.v1.json"),
  "utf8"
));
const documentation = await readFile(
  path.join(ROOT, "docs/legal-source-governance/legal-source-readiness-register.md"),
  "utf8"
);

assert.equal(register.schemaVersion, 1);
assert.equal(register.registerVersion, "0.1.0");
assert.equal(register.status, "governance-only-blocked-register");
assert.equal(register.runtimeRole, "none");
assert.equal(register.applicabilityAuthority, "none");
assert.equal(register.legalAdvice, false);
assert.equal(register.assessmentCapture, false);
assert.equal(register.runtimeActivation, false);
assert.equal(register.sourceRegistrationIsApproval, false);

const expectedFamilies = new Set([
  "feature.legal.jurisdiction.appropriate-government",
  "feature.legal.state.shops-establishments",
  "feature.legal.code-on-wages",
  "feature.legal.social-security.gratuity",
  "feature.legal.social-security.employee-compensation",
  "feature.legal.oshwc",
  "feature.legal.industrial-relations",
  "feature.legal.apprentices",
  "feature.legal.child-adolescent-labour",
  "feature.legal.bonded-forced-labour",
  "feature.legal.contract-workforce",
  "feature.legal.multi-country-employment"
]);

assert.equal(register.remainingFamilies.length, expectedFamilies.size);
assert.deepEqual(
  new Set(register.remainingFamilies.map((item) => item.featureFamilyId)),
  expectedFamilies
);

const allowedClassifications = new Set([
  "source-collection-incomplete",
  "needs-legal-research",
  "outside-current-india-law-scope"
]);
const allowedPackStatuses = new Set([
  "not-started",
  "shared-core-only",
  "out-of-scope"
]);

for (const family of register.remainingFamilies) {
  assert.ok(allowedClassifications.has(family.classification));
  assert.ok(allowedPackStatuses.has(family.controlledSourcePackStatus));
  assert.match(family.repositoryImplementationStatus, /^blocked-/);
  assert.equal(family.assessmentCapture, false);
  assert.equal(family.runtimeActivation, false);
  assert.ok(Array.isArray(family.productRuleIds));
  assert.ok(Array.isArray(family.legacyProductRuleIds));
  assert.equal("proposedRuleIds" in family, false);
  assert.equal("facts" in family, false);
  assert.equal("sourceMappings" in family, false);
  assert.ok(family.dependencies.length > 0);
  assert.ok(family.nextControlledAction.length > 20);
  assert.ok(documentation.includes(family.featureFamilyId));
}

const knownSharedSources = new Set([
  "social-security-code-2020",
  "social-security-central-rules-2026",
  "social-security-code-commencement-so-5319e-2025",
  "social-security-code-corrigendum-so-5936e-2025"
]);
for (const family of register.remainingFamilies) {
  for (const sourceId of family.availableSharedSourceIds ?? []) {
    assert.ok(knownSharedSources.has(sourceId), `Unexpected shared source ${sourceId}`);
  }
  if (family.controlledSourcePackStatus === "shared-core-only") {
    assert.ok(family.availableSharedSourceIds.length === 4);
    assert.match(family.repositoryImplementationStatus, /chapter-specific/);
  }
}

assert.equal(register.completedOrInProgressBatches.length, 4);
assert.deepEqual(
  register.completedOrInProgressBatches.map((item) => item.pullRequest),
  [null, 106, 107, 108]
);

const reconciliationIds = new Set(
  register.controlledDriveReconciliationQueue.map((item) => item.id)
);
assert.equal(reconciliationIds.size, 6);
for (const item of register.controlledDriveReconciliationQueue) {
  assert.equal(item.status, "pending-controlled-drive-update");
  assert.ok(item.description.length > 20);
  assert.notEqual(item.runtimeImpact, "activates-runtime");
  assert.ok(documentation.includes(item.id));
}

for (const phrase of [
  "does not create legal rules",
  "Assessment capture:",
  "Runtime activation:",
  "does not edit Google Drive",
  "Knowledge-base records, legacy thresholds, public links and internal notes are not controlled legal source packs"
]) {
  assert.ok(documentation.includes(phrase), `Documentation missing: ${phrase}`);
}

const serialized = JSON.stringify(register);
for (const prohibitedKey of [
  "\"conditions\"",
  "\"decision\"",
  "\"evaluate\"",
  "\"operator\"",
  "\"outcomes\"",
  "\"prompt\"",
  "\"providerRequest\""
]) {
  assert.equal(serialized.includes(prohibitedKey), false, `Register contains ${prohibitedKey}`);
}

console.log(JSON.stringify({
  valid: true,
  remainingFamilyCount: register.remainingFamilies.length,
  reconciliationItemCount: register.controlledDriveReconciliationQueue.length,
  completedOrInProgressBatchCount: register.completedOrInProgressBatches.length,
  assessmentCapture: register.assessmentCapture,
  runtimeActivation: register.runtimeActivation
}, null, 2));
