import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
    createPoshWave1Payload,
    POSH_WAVE1_FEATURE_IDS as BROWSER_POSH_WAVE1_FEATURE_IDS
} from "../js/assessment-v3/posh-wave1-explanation-api-client.js";

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
const thresholdCatalog = require(path.join(ROOT, "data/assessment/legal-applicability-rules.v1.json"));

const modules = await createCompleteLegalModulesLoader({ retrievalMode: "lexical" })();
const registry = router.DEFAULT_PROFILE_REGISTRY;
const specifications = router.defaultFeatureSpecifications();
const registryValidation = modules.ragEngine.validateLegalRagProfiles(registry);

assert.equal(registryValidation.valid, true, JSON.stringify(registryValidation.errors, null, 2));
assert.equal(registry.profiles.length, 57);
assert.equal(Object.keys(specifications).length, 57);
assert.equal(registry.profiles.every((profile) => profile.activationStatus === "active-private-beta"), true);
assert.equal(registry.profiles.every((profile) => profile.explanationEnabled === true), true);
assert.equal(registry.profiles.filter((profile) => profile.blockers.length > 0).length, 0);
assert.equal(registry.profiles.filter((profile) => profile.catalogId === POSH_CATALOG_ID).length, 7);
assert.equal(registry.profiles.filter((profile) => profile.catalogId === FALLBACK_CATALOG_ID).length, 50);

const snapshot = loader.loadGovernedLegalCatalogs({ profileRegistry: registry });
assert.deepEqual(snapshot.activeCatalogIds, [FALLBACK_CATALOG_ID, POSH_CATALOG_ID].sort());
assert.equal(Object.keys(snapshot.catalogs).length, 2);
assert.equal(snapshot.catalogs[FALLBACK_CATALOG_ID].catalogMode, "governance-fallback");
assert.equal(snapshot.catalogs[FALLBACK_CATALOG_ID].sources.length, 17);
assert.equal(snapshot.catalogs[FALLBACK_CATALOG_ID].chunks.length, 17);
assert.equal(snapshot.catalogs[FALLBACK_CATALOG_ID].sources.every((source) => source.legalContent === false), true);
assert.equal(snapshot.catalogs[POSH_CATALOG_ID].catalogMode, "statutory");
assert.equal(snapshot.catalogs[POSH_CATALOG_ID].sources.length, 3);
assert.equal(snapshot.catalogs[POSH_CATALOG_ID].chunks.length >= 12, true);

const status = router.statusPayload(registry, snapshot, "lexical");
assert.equal(status.platformStatus, "all-laws-runnable-private-beta");
assert.equal(status.profileCount, 57);
assert.equal(status.activeProfileCount, 57);
assert.equal(status.blockedProfileCount, 0);
assert.equal(status.catalogs.length, 2);

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

let wave1ProfilesTested = 0;
let wave1ScenariosTested = 0;
for (const featureId of POSH_WAVE1_FEATURE_IDS) {
    const profile = registry.profiles.find((item) => item.featureId === featureId);
    const specification = specifications[featureId];
    assert.ok(profile);
    assert.ok(specification);
    assert.equal(profile.privateBetaMode, "statutory-catalogue");
    assert.equal(specification.privateBetaMode, "statutory-catalogue");
    assert.equal(specification.ruleCatalog.factMappingMode, "catalog-defined");

    const catalogValidation = modules.assurance.validateLegalRuleCatalog(specification.ruleCatalog);
    assert.equal(catalogValidation.valid, true, `${featureId}: ${JSON.stringify(catalogValidation.errors, null, 2)}`);

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
        wave1ScenariosTested += 1;
    }
    wave1ProfilesTested += 1;
}
assert.equal(wave1ProfilesTested, 6);
assert.equal(wave1ScenariosTested, 18);
assert.equal(BROWSER_POSH_WAVE1_FEATURE_IDS.length, 6);
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
assert.equal(fallbackProfilesTested, 50);

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
    substantivePoshProfiles: 7,
    statutoryProfiles: 7,
    wave1Profiles: wave1ProfilesTested,
    wave1Scenarios: wave1ScenariosTested,
    governanceFallbackProfiles: fallbackProfilesTested,
    fallbackSources: snapshot.catalogs[FALLBACK_CATALOG_ID].sources.length,
    fallbackChunks: snapshot.catalogs[FALLBACK_CATALOG_ID].chunks.length,
    poshSources: snapshot.catalogs[POSH_CATALOG_ID].sources.length,
    poshChunks: snapshot.catalogs[POSH_CATALOG_ID].chunks.length
}, null, 2));
