import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
    runLegalRagEngine,
    runLegalRagEngineSafely
} from "../growwithhr-rag/legal-rag-engine.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [catalog, profiles] = await Promise.all([
    readFile(path.join(ROOT, "growwithhr-rag", "data", "posh-source-chunks.v1.json"), "utf8").then(JSON.parse),
    readFile(path.join(ROOT, "growwithhr-rag", "data", "legal-rag-profiles.v1.json"), "utf8").then(JSON.parse)
]);

function decision() {
    return {
        productRuleId: "posh",
        ruleId: "rule.legal.posh.internal-committee-threshold",
        ruleVersion: "0.1.0",
        status: "specialist-review",
        reasonCode: "POSH_IC_THRESHOLD_REACHED_REVIEW_REQUIRED",
        sourceRegistryIds: [
            "posh-act-2013",
            "posh-rules-2013",
            "posh-commencement-2013"
        ],
        requiredFactIds: [
            "fact.workforce.employee-count",
            "fact.footprint.primary-state",
            "fact.footprint.location-count"
        ],
        triggeringFactIds: [
            "fact.workforce.employee-count",
            "fact.footprint.primary-state",
            "fact.footprint.location-count"
        ],
        missingFactIds: []
    };
}

const catalogs = {
    "catalog.legal.posh.v1": catalog
};
const protectedDecision = decision();
const before = JSON.stringify(protectedDecision);

const lexical = runLegalRagEngine({
    featureId: "feature.legal.posh.internal-committee-threshold",
    decision: protectedDecision,
    registry: profiles,
    catalogs,
    adapterMode: "lexical"
});
assert.equal(lexical.runtimeRole, "post-decision-rag-routing-only");
assert.equal(lexical.retrievalRole, "source-retrieval-only");
assert.equal(lexical.applicabilityAuthority, "none");
assert.equal(lexical.usedForDecision, false);
assert.equal(lexical.llmUsed, false);
assert.equal(lexical.retrievalAdapter.mode, "lexical");
assert.equal(lexical.retrieval.retrievalStatus, "completed");
assert(lexical.retrieval.retrievedChunks.length > 0);

const hybrid = runLegalRagEngine({
    featureId: "feature.legal.posh.internal-committee-threshold",
    decision: protectedDecision,
    registry: profiles,
    catalogs,
    adapterMode: "hybrid",
    maxChunks: 2
});
assert.equal(hybrid.retrievalAdapter.mode, "hybrid");
assert.equal(hybrid.retrieval.retrievedChunks.length <= 2, true);
assert(hybrid.retrieval.retrievedChunks.every((chunk) =>
    protectedDecision.sourceRegistryIds.includes(chunk.registrySourceId)
));
assert.equal(JSON.stringify(protectedDecision), before);

const blockedDecision = {
    ...decision(),
    productRuleId: "posh-policy",
    ruleId: "rule.legal.posh.policy-review",
    reasonCode: "POSH_POLICY_REVIEW_REQUIRED"
};
const blocked = runLegalRagEngineSafely({
    featureId: "feature.legal.posh.policy-review",
    decision: blockedDecision,
    registry: profiles,
    catalogs,
    adapterMode: "hybrid"
});
assert.equal(blocked.valid, false);
assert(blocked.errors.some((item) => item.code === "legal-rag-profile-blocked"));

const missingCatalog = runLegalRagEngineSafely({
    featureId: "feature.legal.posh.internal-committee-threshold",
    decision: protectedDecision,
    registry: profiles,
    catalogs: {},
    adapterMode: "lexical"
});
assert.equal(missingCatalog.valid, false);
assert(missingCatalog.errors.some((item) => item.code === "legal-rag-catalog-not-injected"));

const unsupported = runLegalRagEngineSafely({
    featureId: "feature.legal.posh.internal-committee-threshold",
    decision: protectedDecision,
    registry: profiles,
    catalogs,
    adapterMode: "unsupported"
});
assert.equal(unsupported.valid, false);
assert(unsupported.errors.some((item) => item.code === "legal-retrieval-mode-unsupported"));

console.log(JSON.stringify({
    valid: true,
    profileId: lexical.profile.profileId,
    lexicalAdapter: lexical.retrievalAdapter.adapterId,
    hybridAdapter: hybrid.retrievalAdapter.adapterId,
    blockedProviderEligible: false,
    decisionMutated: false
}, null, 2));
