import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";

const require = createRequire(import.meta.url);
const registry = require("../data/legal-source-governance/all-laws-rag-onboarding.v1.json");
const onboarding = require("../growwithhr-rag/all-laws-onboarding.js");

const validation = onboarding.validateAllLawsOnboardingRegistry(registry);
assert.equal(validation.valid, true, validation.issues.join("\n"));
assert.equal(validation.familyCount, 16);
assert.equal(validation.featureCount, 56);
assert.deepEqual(validation.activeFeatureIds, [onboarding.ACTIVE_FEATURE_ID]);

const snapshot = onboarding.buildAllLawsReadinessSnapshot(registry);
assert.equal(snapshot.platformStatus, "all-laws-onboarding-implemented-approval-gated");
assert.equal(snapshot.familyCount, 16);
assert.equal(snapshot.featureCount, 56);
assert.equal(snapshot.activeFeatureCount, 1);
assert.equal(snapshot.blockedFeatureCount, 55);
assert.equal(snapshot.applicabilityAuthority, "deterministic-only-outside-this-module");
assert.equal(snapshot.providerRole, "explanation-only");

const posh = onboarding.resolveCandidateFeature(onboarding.ACTIVE_FEATURE_ID, registry);
assert.equal(posh.activationStatus, "active-private-beta");
assert.equal(posh.explanationEnabled, true);
assert.equal(posh.usedForDecision, false);
assert.equal(posh.mayChangeDecision, false);

const maternityFeature = "feature.legal.maternity.establishment-coverage";
const maternity = onboarding.resolveCandidateFeature(maternityFeature, registry);
assert.equal(maternity.lawFamilyId, "maternity");
assert.equal(maternity.parentFeatureId, "feature.legal.social-security");
assert.equal(maternity.activationStatus, "blocked-awaiting-approval");
assert.equal(maternity.explanationEnabled, false);

const blueprint = onboarding.buildCandidateManifestBlueprint("maternity", registry);
assert.equal(blueprint.status, "blocked-candidate-manifest");
assert.equal(blueprint.builderCompatible, false);
assert.equal(blueprint.applicabilityAuthority, "none");
assert.equal(blueprint.automaticLegalInterpretation, false);
assert.deepEqual(blueprint.sources, []);
assert.deepEqual(blueprint.chunks, []);
assert.equal(blueprint.publication.runtimeActivationApproved, false);
assert.equal(blueprint.publication.ragApprovalStatus, "not-approved");
assert.equal(blueprint.publication.approvedBy, null);

assert.throws(
    () => onboarding.assertCandidateActivationApproved(maternityFeature, {}, registry),
    (error) => {
        assert.equal(error.code, "all-laws-rag-activation-blocked");
        assert.equal(error.featureId, maternityFeature);
        assert.ok(error.missingApprovals.includes("legalReview"));
        assert.ok(error.missingApprovals.includes("privacyReview"));
        assert.ok(error.missingApprovals.includes("catalogCompilation"));
        assert.ok(error.missingApprovals.includes("runtimeActivation"));
        assert.ok(error.missingApprovals.includes("approvedBy"));
        assert.ok(error.missingApprovals.includes("approvedAt"));
        return true;
    }
);

const fullyApproved = {
    legalReviewStatus: "approved-with-conditions",
    privacyReviewStatus: "approved",
    ragApprovalStatus: "approved",
    sourceFilesApproved: true,
    sectionMappingsApproved: true,
    assessmentFactsApproved: true,
    deterministicRulesApproved: true,
    manifestVerified: true,
    catalogCompiled: true,
    testApprovalStatus: "approved",
    securityApprovalStatus: "approved",
    runtimeActivationApproved: true,
    approvedBy: "qualified-reviewer",
    approvedAt: "2026-08-06"
};
const approvedCandidate = onboarding.assertCandidateActivationApproved(
    maternityFeature,
    fullyApproved,
    registry
);
assert.equal(approvedCandidate.activationStatus, "approved-for-runtime-activation");
assert.equal(approvedCandidate.explanationEnabled, true);
assert.equal(approvedCandidate.usedForDecision, false);
assert.equal(approvedCandidate.mayChangeDecision, false);

const duplicateRegistry = JSON.parse(JSON.stringify(registry));
duplicateRegistry.families[1].candidateFeatureIds[0] = onboarding.ACTIVE_FEATURE_ID;
const duplicateValidation = onboarding.validateAllLawsOnboardingRegistry(duplicateRegistry);
assert.equal(duplicateValidation.valid, false);
assert.ok(duplicateValidation.issues.some((issue) => issue.includes("Duplicate candidate feature ID")));

const unsafePathRegistry = JSON.parse(JSON.stringify(registry));
unsafePathRegistry.families[1].catalogPath = "../outside.json";
const unsafePathValidation = onboarding.validateAllLawsOnboardingRegistry(unsafePathRegistry);
assert.equal(unsafePathValidation.valid, false);
assert.ok(unsafePathValidation.issues.some((issue) => issue.includes("unsafe catalogue path")));

const source = await readFile(new URL("../growwithhr-rag/all-laws-onboarding.js", import.meta.url), "utf8");
assert.doesNotMatch(source, /\bfetch\s*\(/);
assert.doesNotMatch(source, /XMLHttpRequest|axios|sendBeacon/);
assert.doesNotMatch(source, /\bdocument\b|\bwindow\b|localStorage|sessionStorage/);
assert.doesNotMatch(source, /readFile|writeFile|readdir|unlink|rename/);

console.log(JSON.stringify({
    valid: true,
    familyCount: snapshot.familyCount,
    featureCount: snapshot.featureCount,
    activeFeatureCount: snapshot.activeFeatureCount,
    blockedFeatureCount: snapshot.blockedFeatureCount
}, null, 2));
