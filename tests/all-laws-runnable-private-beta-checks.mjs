import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

const runtime = await import(new URL("../growwithhr-rag/legal-rag-runtime.js", import.meta.url));
const modules = await createCompleteLegalModulesLoader({ retrievalMode: "lexical" })();
const registry = router.DEFAULT_PROFILE_REGISTRY;
const specifications = router.defaultFeatureSpecifications();
const registryValidation = runtime.validateLegalRagProfiles(registry);

assert.equal(registryValidation.valid, true, JSON.stringify(registryValidation.errors, null, 2));
assert.equal(registry.profiles.length, 57);
assert.equal(Object.keys(specifications).length, 57);
assert.equal(registry.profiles.every((profile) => profile.activationStatus === "active-private-beta"), true);
assert.equal(registry.profiles.every((profile) => profile.explanationEnabled === true), true);
assert.equal(registry.profiles.filter((profile) => profile.blockers.length > 0).length, 0);
assert.equal(registry.profiles.filter((profile) => profile.catalogId === "catalog.legal.posh.v1").length, 1);
assert.equal(registry.profiles.filter((profile) => profile.catalogId === FALLBACK_CATALOG_ID).length, 56);

const snapshot = loader.loadGovernedLegalCatalogs({ profileRegistry: registry });
assert.deepEqual(snapshot.activeCatalogIds, [FALLBACK_CATALOG_ID, "catalog.legal.posh.v1"].sort());
assert.equal(Object.keys(snapshot.catalogs).length, 2);
assert.equal(snapshot.catalogs[FALLBACK_CATALOG_ID].catalogMode, "governance-fallback");
assert.equal(snapshot.catalogs[FALLBACK_CATALOG_ID].sources.length, 17);
assert.equal(snapshot.catalogs[FALLBACK_CATALOG_ID].chunks.length, 17);
assert.equal(snapshot.catalogs[FALLBACK_CATALOG_ID].sources.every((source) => source.legalContent === false), true);

const status = router.statusPayload(registry, snapshot, "lexical");
assert.equal(status.platformStatus, "all-laws-runnable-private-beta");
assert.equal(status.profileCount, 57);
assert.equal(status.activeProfileCount, 57);
assert.equal(status.activeProfiles.length, 57);
assert.equal(status.blockedProfileCount, 0);
assert.equal(status.catalogs.length, 2);

let fallbackProfilesTested = 0;
for (const profile of registry.profiles) {
    if (profile.featureId === POSH_THRESHOLD_FEATURE_ID) continue;
    const specification = specifications[profile.featureId];
    assert.ok(specification, `Missing feature specification for ${profile.featureId}`);
    assert.equal(specification.privateBetaMode, "governance-fallback");
    assert.ok(specification.ruleCatalog, `Missing deterministic fallback rule for ${profile.featureId}`);

    const catalogValidation = modules.assurance.validateLegalRuleCatalog(specification.ruleCatalog);
    assert.equal(
        catalogValidation.valid,
        true,
        `${profile.featureId}: ${JSON.stringify(catalogValidation.errors, null, 2)}`
    );

    const assurance = modules.assurance.evaluateLegalRuleAssurance({
        answers: { employees: 1 },
        catalog: specification.ruleCatalog,
        evaluatedAt: "2026-08-06T04:00:00.000Z"
    });
    assert.equal(assurance.decisions.length, 1);
    const decision = assurance.decisions[0];
    assert.equal(decision.ruleId, profile.ruleIds[0]);
    assert.equal(decision.status, "specialist-review");
    assert.equal(decision.legalReviewStatus, "needs-legal-review");
    assert.equal(decision.sourceRegistryIds.length, 1);

    const routed = modules.ragRuntime.runLegalRagRetrieval({
        featureId: profile.featureId,
        decision,
        registry,
        catalogs: snapshot.catalogs
    });
    assert.equal(routed.profile.activationStatus, "active-private-beta");
    assert.equal(routed.profile.catalogId, FALLBACK_CATALOG_ID);
    assert.equal(routed.retrieval.retrievalStatus, "completed");
    assert.equal(routed.retrieval.usedForDecision, false);
    assert.equal(routed.retrieval.applicabilityAuthority, "none");
    assert.equal(routed.retrieval.retrievedChunks.length, 1);

    const request = modules.contract.buildLegalExplanationRequest({
        decision,
        retrievalTrace: routed.retrieval,
        requestedAt: "2026-08-06T04:00:00.000Z"
    });
    const explanation = modules.contract.createDeterministicLegalExplanation({ request });
    assert.equal(explanation.decisionStatus, "specialist-review");
    assert.equal(explanation.reasonCode, decision.reasonCode);
    assert.equal(explanation.usedForDecision, false);
    assert.equal(explanation.mayChangeDecision, false);
    fallbackProfilesTested += 1;
}

assert.equal(fallbackProfilesTested, 56);

for (const featureId of [
    "feature.legal.maternity.establishment-coverage",
    "feature.legal.epf.establishment-coverage",
    "feature.legal.esi.establishment-coverage",
    "feature.legal.oshwc",
    "feature.legal.multi-country-employment"
]) {
    const profile = registry.profiles.find((item) => item.featureId === featureId);
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
    assert.equal(routed.profile.profileId, profile.profileId);
    assert.equal(routed.retrieval.retrievalStatus, "completed");
}

console.log(JSON.stringify({
    valid: true,
    profileCount: registry.profiles.length,
    activeProfileCount: status.activeProfileCount,
    blockedProfileCount: status.blockedProfileCount,
    statutoryProfiles: 1,
    governanceFallbackProfiles: fallbackProfilesTested,
    fallbackSources: snapshot.catalogs[FALLBACK_CATALOG_ID].sources.length,
    fallbackChunks: snapshot.catalogs[FALLBACK_CATALOG_ID].chunks.length
}, null, 2));
