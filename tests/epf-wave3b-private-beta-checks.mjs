import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
    createEpfWave3bPayload,
    EPF_WAVE3B_FEATURE_IDS as BROWSER_EPF_WAVE3B_FEATURE_IDS
} from "../js/assessment-v3/epf-wave3b-explanation-api-client.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const router = require(path.join(ROOT, "server-legal-explanation-router-wave3b.js"));
const loader = require(path.join(ROOT, "server-legal-rag-catalogs.js"));
const { createCompleteLegalModulesLoader } = require(path.join(ROOT, "server-legal-rag-modules.js"));
const { FALLBACK_CATALOG_ID } = require(path.join(ROOT, "server-all-laws-private-beta.js"));
const { POSH_CATALOG_ID } = require(path.join(ROOT, "server-posh-wave1-rule-catalogs.js"));
const { MATERNITY_CATALOG_ID } = require(path.join(ROOT, "server-maternity-wave2-rule-catalogs.js"));
const { EPF_WAVE3A_CATALOG_ID, EPF_WAVE3A_FEATURE_IDS } = require(path.join(ROOT, "server-epf-wave3a-rule-catalogs.js"));
const { EPF_WAVE3B_CATALOG_ID, EPF_WAVE3B_FEATURE_IDS } = require(path.join(ROOT, "server-epf-wave3b-rule-catalogs.js"));

const modules = await createCompleteLegalModulesLoader({ retrievalMode: "lexical" })();
const ragRuntime = await import("../growwithhr-rag/legal-rag-runtime.js");
const registry = router.DEFAULT_PROFILE_REGISTRY;
const specifications = router.defaultFeatureSpecifications();
const registryValidation = ragRuntime.validateLegalRagProfiles(registry);

assert.equal(registryValidation.valid, true, JSON.stringify(registryValidation.errors, null, 2));
assert.equal(registry.profiles.length, 57);
assert.equal(Object.keys(specifications).length, 57);
assert.equal(registry.profiles.filter((profile) => profile.catalogId === POSH_CATALOG_ID).length, 7);
assert.equal(registry.profiles.filter((profile) => profile.catalogId === MATERNITY_CATALOG_ID).length, 10);
assert.equal(registry.profiles.filter((profile) => profile.catalogId === EPF_WAVE3A_CATALOG_ID).length, 5);
assert.equal(registry.profiles.filter((profile) => profile.catalogId === EPF_WAVE3B_CATALOG_ID).length, 5);
assert.equal(registry.profiles.filter((profile) => profile.catalogId === FALLBACK_CATALOG_ID).length, 30);

const snapshot = loader.loadGovernedLegalCatalogs({ profileRegistry: registry });
assert.deepEqual(snapshot.activeCatalogIds, [
    EPF_WAVE3A_CATALOG_ID,
    EPF_WAVE3B_CATALOG_ID,
    FALLBACK_CATALOG_ID,
    MATERNITY_CATALOG_ID,
    POSH_CATALOG_ID
].sort());
assert.equal(Object.keys(snapshot.catalogs).length, 5);
assert.equal(snapshot.catalogs[EPF_WAVE3B_CATALOG_ID].catalogMode, "statutory");
assert.equal(snapshot.catalogs[EPF_WAVE3B_CATALOG_ID].sources.length, 7);
assert.equal(snapshot.catalogs[EPF_WAVE3B_CATALOG_ID].chunks.length, 9);

const status = router.statusPayload(registry, snapshot, "lexical");
assert.equal(status.profileCount, 57);
assert.equal(status.activeProfileCount, 57);
assert.equal(status.substantiveProfileCount, 27);
assert.equal(status.governanceFallbackProfileCount, 30);
assert.equal(status.catalogs.length, 5);

let scenariosTested = 0;
for (const featureId of EPF_WAVE3B_FEATURE_IDS) {
    const profile = registry.profiles.find((item) => item.featureId === featureId);
    const specification = specifications[featureId];
    assert.ok(profile, `Missing profile for ${featureId}`);
    assert.ok(specification, `Missing specification for ${featureId}`);
    assert.equal(profile.lawFamilyId, "epf-eps-edli");
    assert.equal(profile.privateBetaMode, "statutory-catalogue");
    assert.equal(profile.catalogId, EPF_WAVE3B_CATALOG_ID);
    assert.equal(specification.privateBetaMode, "statutory-catalogue");
    assert.equal(specification.ruleCatalog.factMappingMode, "catalog-defined");

    const catalogValidation = modules.assurance.validateLegalRuleCatalog(specification.ruleCatalog);
    assert.equal(catalogValidation.valid, true, `${featureId}: ${JSON.stringify(catalogValidation.errors, null, 2)}`);

    for (const scenario of specification.ruleCatalog.rules[0].automatedBoundaryTestScenarios) {
        const normalized = specification.normalizeBody({ answers: scenario.answers });
        const assurance = modules.assurance.evaluateLegalRuleAssurance({
            answers: normalized.answers,
            catalog: specification.ruleCatalog,
            evaluatedAt: "2026-08-06T10:45:00.000Z"
        });
        assert.equal(assurance.decisions.length, 1);
        const decision = assurance.decisions[0];
        assert.equal(decision.ruleId, profile.ruleIds[0]);
        assert.equal(decision.status, scenario.expectedStatus, `${featureId}/${scenario.scenarioId}`);
        assert.equal(decision.reasonCode, scenario.expectedReasonCode, `${featureId}/${scenario.scenarioId}`);
        const routed = modules.ragRuntime.runLegalRagRetrieval({ featureId, decision, registry, catalogs: snapshot.catalogs });
        assert.equal(routed.retrieval.retrievalStatus, "completed");
        assert.equal(routed.retrieval.usedForDecision, false);
        assert.equal(routed.retrieval.applicabilityAuthority, "none");
        assert.equal(routed.retrieval.retrievedChunks.length > 0, true);
        assert.equal(routed.retrieval.retrievedChunks.every((chunk) => decision.sourceRegistryIds.includes(chunk.registrySourceId)), true);
        const request = modules.contract.buildLegalExplanationRequest({
            decision,
            retrievalTrace: routed.retrieval,
            requestedAt: "2026-08-06T10:45:00.000Z"
        });
        const explanation = modules.contract.createDeterministicLegalExplanation({ request });
        assert.equal(explanation.decisionStatus, decision.status);
        assert.equal(explanation.reasonCode, decision.reasonCode);
        assert.equal(explanation.usedForDecision, false);
        assert.equal(explanation.mayChangeDecision, false);
        scenariosTested += 1;
    }
}
assert.equal(scenariosTested, 15);
assert.equal(BROWSER_EPF_WAVE3B_FEATURE_IDS.length, 5);
assert.equal(EPF_WAVE3A_FEATURE_IDS.length, 5);

const payload = createEpfWave3bPayload("feature.legal.edli.coverage-control", {
    answers: {
        edliMembershipControl: "evidenced",
        edliRateSourceStatus: "evidenced",
        edliContributionControl: "evidenced",
        edliClaimControl: "evidenced",
        edliTransitionReviewStatus: "evidenced",
        edliEvidenceReferences: [{ reference: "edli-control-register", body: "private evidence body" }],
        employeeName: "Private Person",
        uan: "private-uan",
        employeeWage: 100000,
        payrollRows: [{ employee: "Private Person", wage: 100000 }],
        contributionHistory: [1200],
        ecrBody: "private-ecr-body",
        bankDetails: "private-bank-details",
        claimDocument: "private-claim",
        nomineeDetails: "private-nominee",
        familyDetails: "private-family"
    }
});
assert.deepEqual(payload, {
    answers: {
        edliMembershipControl: "evidenced",
        edliRateSourceStatus: "evidenced",
        edliContributionControl: "evidenced",
        edliClaimControl: "evidenced",
        edliTransitionReviewStatus: "evidenced",
        edliEvidenceReferences: ["edli-control-register"]
    }
});
const payloadText = JSON.stringify(payload);
for (const prohibited of [
    "Private Person", "private evidence body", "private-uan", "100000", "1200",
    "private-ecr-body", "private-bank-details", "private-claim", "private-nominee", "private-family"
]) assert.equal(payloadText.includes(prohibited), false);

for (const deferredFeatureId of [
    "feature.legal.epf.exemption-review",
    "feature.legal.epf.international-worker-review"
]) {
    const profile = registry.profiles.find((item) => item.featureId === deferredFeatureId);
    assert.ok(profile);
    assert.equal(profile.catalogId, FALLBACK_CATALOG_ID);
    assert.equal(profile.privateBetaMode, "governance-fallback");
}

console.log(JSON.stringify({
    valid: true,
    profileCount: registry.profiles.length,
    substantiveProfiles: status.substantiveProfileCount,
    substantiveEpfWave3aProfiles: EPF_WAVE3A_FEATURE_IDS.length,
    substantiveEpfWave3bProfiles: EPF_WAVE3B_FEATURE_IDS.length,
    wave3bScenarios: scenariosTested,
    governanceFallbackProfiles: status.governanceFallbackProfileCount,
    activeCatalogs: snapshot.activeCatalogIds.length,
    epfWave3bSources: snapshot.catalogs[EPF_WAVE3B_CATALOG_ID].sources.length,
    epfWave3bChunks: snapshot.catalogs[EPF_WAVE3B_CATALOG_ID].chunks.length
}, null, 2));
