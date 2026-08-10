import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
    createPoshWave1Payload,
    POSH_WAVE1_FEATURE_IDS as BROWSER_POSH_WAVE1_FEATURE_IDS
} from "../js/assessment-v3/posh-wave1-explanation-api-client.js";
import {
    createMaternityWave2Payload,
    MATERNITY_WAVE2_FEATURE_IDS as BROWSER_MATERNITY_WAVE2_FEATURE_IDS
} from "../js/assessment-v3/maternity-wave2-explanation-api-client.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const router = require(path.join(ROOT, "server-legal-explanation-router.js"));
const loader = require(path.join(ROOT, "server-legal-rag-catalogs.js"));
const {
    createCompleteLegalModulesLoader
} = require(path.join(ROOT, "server-legal-rag-modules.js"));
const {
    POSH_THRESHOLD_FEATURE_ID,
    FALLBACK_CATALOG_ID
} = require(path.join(ROOT, "server-all-laws-private-beta.js"));
const {
    POSH_CATALOG_ID,
    POSH_WAVE1_FEATURE_IDS
} = require(path.join(ROOT, "server-posh-wave1-rule-catalogs.js"));
const {
    MATERNITY_CATALOG_ID,
    MATERNITY_WAVE2_FEATURE_IDS
} = require(path.join(ROOT, "server-maternity-wave2-rule-catalogs.js"));
const thresholdCatalog = require(path.join(ROOT, "data/assessment/legal-applicability-rules.v1.json"));

const modules = await createCompleteLegalModulesLoader({ retrievalMode: "lexical" })();
const ragRuntime = await import("../growwithhr-rag/legal-rag-runtime.js");
const registry = router.DEFAULT_PROFILE_REGISTRY;
const specifications = router.defaultFeatureSpecifications();
const registryValidation = ragRuntime.validateLegalRagProfiles(registry);

assert.equal(registryValidation.valid, true, JSON.stringify(registryValidation.errors, null, 2));
assert.equal(registry.profiles.length, 57);
assert.equal(Object.keys(specifications).length, 57);
assert.equal(registry.profiles.every((profile) => profile.activationStatus === "active-private-beta"), true);
assert.equal(registry.profiles.every((profile) => profile.explanationEnabled === true), true);
assert.equal(registry.profiles.filter((profile) => profile.blockers.length > 0).length, 0);
assert.equal(registry.profiles.filter((profile) => profile.catalogId === POSH_CATALOG_ID).length, 7);
assert.equal(registry.profiles.filter((profile) => profile.catalogId === MATERNITY_CATALOG_ID).length, 10);
assert.equal(registry.profiles.filter((profile) => profile.catalogId === FALLBACK_CATALOG_ID).length, 40);

const snapshot = loader.loadGovernedLegalCatalogs({ profileRegistry: registry });
assert.deepEqual(snapshot.activeCatalogIds, [
    FALLBACK_CATALOG_ID,
    MATERNITY_CATALOG_ID,
    POSH_CATALOG_ID
].sort());
assert.equal(Object.keys(snapshot.catalogs).length, 3);
assert.equal(snapshot.catalogs[FALLBACK_CATALOG_ID].catalogMode, "governance-fallback");
assert.equal(snapshot.catalogs[FALLBACK_CATALOG_ID].sources.length, 17);
assert.equal(snapshot.catalogs[FALLBACK_CATALOG_ID].chunks.length, 17);
assert.equal(snapshot.catalogs[FALLBACK_CATALOG_ID].sources.every((source) => source.legalContent === false), true);
assert.equal(snapshot.catalogs[POSH_CATALOG_ID].catalogMode, "statutory");
assert.equal(snapshot.catalogs[POSH_CATALOG_ID].sources.length, 3);
assert.equal(snapshot.catalogs[POSH_CATALOG_ID].chunks.length >= 12, true);
assert.equal(snapshot.catalogs[MATERNITY_CATALOG_ID].catalogMode, "statutory");
assert.equal(snapshot.catalogs[MATERNITY_CATALOG_ID].sources.length, 4);
assert.equal(snapshot.catalogs[MATERNITY_CATALOG_ID].chunks.length, 13);

const status = router.statusPayload(registry, snapshot, "lexical");
assert.equal(status.platformStatus, "all-laws-runnable-private-beta");
assert.equal(status.profileCount, 57);
assert.equal(status.activeProfileCount, 57);
assert.equal(status.substantiveProfileCount, 17);
assert.equal(status.governanceFallbackProfileCount, 40);
assert.equal(status.blockedProfileCount, 0);
assert.equal(status.catalogs.length, 3);

const thresholdAssurance = modules.assurance.evaluateLegalRuleAssurance({
    answers: { employees: 10, primaryState: "Maharashtra", locations: 1 },
    catalog: thresholdCatalog,
    evaluatedAt: "2026-08-06T04:00:00.000Z"
});
const thresholdDecision = thresholdAssurance.decisions[0];
const thresholdRouted = modules.ragRuntime.runLegalRagRetrieval({
    featureId: POSH_THRESHOLD_FEATURE_ID,
    decision: thresholdDecision,
    registry,
    catalogs: snapshot.catalogs
});
assert.equal(thresholdDecision.reasonCode, "POSH_IC_THRESHOLD_REACHED_REVIEW_REQUIRED");
assert.equal(thresholdRouted.retrieval.retrievalStatus, "completed");
assert.equal(thresholdRouted.retrieval.usedForDecision, false);

async function validateSubstantiveProfiles(featureIds, expectedFamilyId) {
    let profilesTested = 0;
    let scenariosTested = 0;
    for (const featureId of featureIds) {
        const profile = registry.profiles.find((item) => item.featureId === featureId);
        const specification = specifications[featureId];
        assert.ok(profile, `Missing profile for ${featureId}`);
        assert.ok(specification, `Missing specification for ${featureId}`);
        assert.equal(profile.lawFamilyId, expectedFamilyId);
        assert.equal(profile.privateBetaMode, "statutory-catalogue");
        assert.equal(specification.privateBetaMode, "statutory-catalogue");
        assert.equal(specification.ruleCatalog.factMappingMode, "catalog-defined");

        const catalogValidation = modules.assurance.validateLegalRuleCatalog(specification.ruleCatalog);
        assert.equal(
            catalogValidation.valid,
            true,
            `${featureId}: ${JSON.stringify(catalogValidation.errors, null, 2)}`
        );

        for (const scenario of specification.ruleCatalog.rules[0].automatedBoundaryTestScenarios) {
            const normalized = specification.normalizeBody({ answers: scenario.answers });
            const assurance = modules.assurance.evaluateLegalRuleAssurance({
                answers: normalized.answers,
                catalog: specification.ruleCatalog,
                evaluatedAt: "2026-08-06T04:00:00.000Z"
            });
            assert.equal(assurance.decisions.length, 1);
            const decision = assurance.decisions[0];
            assert.equal(decision.ruleId, profile.ruleIds[0]);
            assert.equal(decision.status, scenario.expectedStatus, `${featureId}/${scenario.scenarioId}`);
            assert.equal(decision.reasonCode, scenario.expectedReasonCode, `${featureId}/${scenario.scenarioId}`);
            const routed = modules.ragRuntime.runLegalRagRetrieval({
                featureId,
                decision,
                registry,
                catalogs: snapshot.catalogs
            });
            assert.equal(routed.retrieval.retrievalStatus, "completed");
            assert.equal(routed.retrieval.usedForDecision, false);
            assert.equal(routed.retrieval.applicabilityAuthority, "none");
            assert.equal(routed.retrieval.retrievedChunks.length > 0, true);
            assert.equal(
                routed.retrieval.retrievedChunks.every((chunk) =>
                    decision.sourceRegistryIds.includes(chunk.registrySourceId)
                ),
                true
            );
            const request = modules.contract.buildLegalExplanationRequest({
                decision,
                retrievalTrace: routed.retrieval,
                requestedAt: "2026-08-06T04:00:00.000Z"
            });
            const explanation = modules.contract.createDeterministicLegalExplanation({ request });
            assert.equal(explanation.decisionStatus, decision.status);
            assert.equal(explanation.reasonCode, decision.reasonCode);
            assert.equal(explanation.usedForDecision, false);
            assert.equal(explanation.mayChangeDecision, false);
            scenariosTested += 1;
        }
        profilesTested += 1;
    }
    return { profilesTested, scenariosTested };
}

const wave1 = await validateSubstantiveProfiles(POSH_WAVE1_FEATURE_IDS, "posh");
assert.equal(wave1.profilesTested, 6);
assert.equal(wave1.scenariosTested, 18);
assert.equal(BROWSER_POSH_WAVE1_FEATURE_IDS.length, 6);

const wave2 = await validateSubstantiveProfiles(MATERNITY_WAVE2_FEATURE_IDS, "maternity");
assert.equal(wave2.profilesTested, 10);
assert.equal(wave2.scenariosTested, 30);
assert.equal(BROWSER_MATERNITY_WAVE2_FEATURE_IDS.length, 10);

const policyPayload = createPoshWave1Payload("feature.legal.posh.policy-review", {
    answers: {
        poshPolicyExists: true,
        poshPolicyIssueDate: "2026-01-10",
        poshPolicyOwnerRole: { role: "People Operations", name: "Private Person" },
        poshPolicyCoverage: ["prevention", "prohibition", "redressal"],
        poshPolicyDisseminationEvidence: [{ reference: "policy-circulation", body: "private body" }],
        poshPolicyReviewEvidence: ["policy-review"],
        complaintNarrative: "prohibited narrative"
    }
});
const policyPayloadText = JSON.stringify(policyPayload);
assert.equal(policyPayloadText.includes("Private Person"), false);
assert.equal(policyPayloadText.includes("private body"), false);
assert.equal(policyPayloadText.includes("prohibited narrative"), false);

const maternityPayload = createMaternityWave2Payload(
    "feature.legal.maternity.employee-eligibility",
    {
        answers: {
            maternityWorkdaysBandValue: 80,
            maternityEligibilityEventCategory: "delivery",
            employeeName: "Private Person",
            medicalNarrative: "prohibited medical narrative",
            medicalCertificate: { body: "prohibited certificate" },
            exactEventDate: "2026-07-01",
            esiIdentifier: "private-esi-id",
            bankDetails: "private-bank-details"
        }
    }
);
assert.deepEqual(maternityPayload, {
    answers: {
        maternityWorkdaysBandValue: 80,
        maternityEligibilityEventCategory: "delivery"
    }
});
const maternityPayloadText = JSON.stringify(maternityPayload);
for (const prohibited of [
    "Private Person",
    "prohibited medical narrative",
    "prohibited certificate",
    "2026-07-01",
    "private-esi-id",
    "private-bank-details"
]) {
    assert.equal(maternityPayloadText.includes(prohibited), false);
}

let fallbackProfilesTested = 0;
for (const profile of registry.profiles) {
    if (profile.catalogId !== FALLBACK_CATALOG_ID) continue;
    const specification = specifications[profile.featureId];
    assert.ok(specification, `Missing fallback specification for ${profile.featureId}`);
    assert.equal(specification.privateBetaMode, "governance-fallback");
    const catalogValidation = modules.assurance.validateLegalRuleCatalog(specification.ruleCatalog);
    assert.equal(catalogValidation.valid, true, `${profile.featureId}: ${JSON.stringify(catalogValidation.errors, null, 2)}`);

    const assurance = modules.assurance.evaluateLegalRuleAssurance({
        answers: { employees: 1 },
        catalog: specification.ruleCatalog,
        evaluatedAt: "2026-08-06T04:00:00.000Z"
    });
    const decision = assurance.decisions[0];
    assert.equal(decision.ruleId, profile.ruleIds[0]);
    assert.equal(decision.status, "specialist-review");
    const routed = modules.ragRuntime.runLegalRagRetrieval({
        featureId: profile.featureId,
        decision,
        registry,
        catalogs: snapshot.catalogs
    });
    assert.equal(routed.retrieval.retrievalStatus, "completed");
    assert.equal(routed.retrieval.usedForDecision, false);
    fallbackProfilesTested += 1;
}
assert.equal(fallbackProfilesTested, 40);

for (const featureId of [
    "feature.legal.maternity.establishment-coverage",
    "feature.legal.epf.establishment-coverage",
    "feature.legal.esi.establishment-coverage",
    "feature.legal.oshwc",
    "feature.legal.multi-country-employment"
]) {
    const specification = specifications[featureId];
    const assurance = modules.assurance.evaluateLegalRuleAssurance({
        answers: {},
        catalog: specification.ruleCatalog,
        evaluatedAt: "2026-08-06T04:00:00.000Z"
    });
    const decision = assurance.decisions[0];
    assert.equal(decision.status, "more-information-needed");
    const routed = modules.ragRuntime.runLegalRagRetrieval({
        featureId,
        decision,
        registry,
        catalogs: snapshot.catalogs
    });
    assert.equal(routed.retrieval.retrievalStatus, "completed");
}

console.log(JSON.stringify({
    valid: true,
    profileCount: registry.profiles.length,
    activeProfileCount: status.activeProfileCount,
    blockedProfileCount: status.blockedProfileCount,
    substantiveProfiles: status.substantiveProfileCount,
    substantivePoshProfiles: 7,
    substantiveMaternityProfiles: wave2.profilesTested,
    statutoryProfiles: status.substantiveProfileCount,
    wave1Profiles: wave1.profilesTested,
    wave1Scenarios: wave1.scenariosTested,
    wave2Profiles: wave2.profilesTested,
    wave2Scenarios: wave2.scenariosTested,
    governanceFallbackProfiles: fallbackProfilesTested,
    fallbackSources: snapshot.catalogs[FALLBACK_CATALOG_ID].sources.length,
    fallbackChunks: snapshot.catalogs[FALLBACK_CATALOG_ID].chunks.length,
    poshSources: snapshot.catalogs[POSH_CATALOG_ID].sources.length,
    poshChunks: snapshot.catalogs[POSH_CATALOG_ID].chunks.length,
    maternitySources: snapshot.catalogs[MATERNITY_CATALOG_ID].sources.length,
    maternityChunks: snapshot.catalogs[MATERNITY_CATALOG_ID].chunks.length
}, null, 2));
