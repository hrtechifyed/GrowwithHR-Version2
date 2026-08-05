import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
    retrieveLegalDecisionSources
} from "../growwithhr-rag/legal-source-retrieval.js";
import {
    createLexicalLegalRetrievalAdapter,
    createHybridLegalRetrievalAdapter,
    createLegalRetrievalAdapterRegistry,
    resolveLegalRetrievalAdapter,
    runLegalRetrievalAdapter,
    runLegalRetrievalAdapterSafely
} from "../growwithhr-rag/legal-retrieval-adapters.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(await readFile(
    path.join(ROOT, "growwithhr-rag", "data", "posh-source-chunks.v1.json"),
    "utf8"
));

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

const protectedDecision = decision();
const before = JSON.stringify(protectedDecision);
const queryTerms = ["Internal Committee", "employer duties", "commencement"];
const baseline = retrieveLegalDecisionSources({
    decision: protectedDecision,
    catalog,
    queryTerms,
    maxChunks: 4
});

const lexicalAdapter = createLexicalLegalRetrievalAdapter();
const lexical = runLegalRetrievalAdapter({
    adapter: lexicalAdapter,
    decision: protectedDecision,
    catalog,
    queryTerms,
    maxChunks: 4
});
assert.equal(lexical.adapter.mode, "lexical");
assert.equal(lexical.adapter.applicabilityAuthority, "none");
assert.equal(lexical.adapter.usesExternalNetwork, false);
assert.equal(lexical.retrievalFingerprint, baseline.retrievalFingerprint);
assert.deepEqual(
    lexical.retrievedChunks.map((chunk) => chunk.chunkId),
    baseline.retrievedChunks.map((chunk) => chunk.chunkId)
);

const hybridAdapter = createHybridLegalRetrievalAdapter();
const hybrid = runLegalRetrievalAdapter({
    adapter: hybridAdapter,
    decision: protectedDecision,
    catalog,
    queryTerms,
    maxChunks: 3
});
const hybridAgain = runLegalRetrievalAdapter({
    adapter: hybridAdapter,
    decision: protectedDecision,
    catalog,
    queryTerms,
    maxChunks: 3
});
assert.equal(hybrid.adapter.mode, "hybrid");
assert.equal(hybrid.hybrid.candidateCount >= hybrid.retrievedChunks.length, true);
assert.equal(hybrid.retrievedChunks.length <= 3, true);
assert.equal(hybrid.retrievalFingerprint, hybridAgain.retrievalFingerprint);
assert.deepEqual(hybrid.retrievedChunks, hybridAgain.retrievedChunks);
assert(hybrid.retrievedChunks.every((chunk) =>
    protectedDecision.sourceRegistryIds.includes(chunk.registrySourceId)
));
assert(hybrid.retrievedChunks.every((chunk) =>
    catalog.chunks.find((sourceChunk) => sourceChunk.chunkId === chunk.chunkId)
        .reasonCodes.includes(protectedDecision.reasonCode)
));
assert.equal(JSON.stringify(protectedDecision), before);

const registry = createLegalRetrievalAdapterRegistry();
assert.equal(resolveLegalRetrievalAdapter({ mode: "lexical", registry }).mode, "lexical");
assert.equal(resolveLegalRetrievalAdapter({ mode: "hybrid", registry }).mode, "hybrid");
assert.equal(
    runLegalRetrievalAdapterSafely({
        mode: "unsupported",
        decision: protectedDecision,
        catalog
    }).errors[0].code,
    "legal-retrieval-mode-unsupported"
);

const disabled = runLegalRetrievalAdapter({
    adapter: lexicalAdapter,
    decision: protectedDecision,
    catalog,
    enabled: false
});
assert.equal(disabled.retrievalStatus, "disabled");
assert.equal(disabled.retrievedChunks.length, 0);

const malicious = {
    adapterId: "adapter.legal.malicious.v1",
    mode: "lexical",
    retrievalRole: "source-retrieval-only",
    applicabilityAuthority: "none",
    usesExternalNetwork: false,
    retrieve() {
        return {
            ...baseline,
            retrievedChunks: [{
                ...baseline.retrievedChunks[0],
                registrySourceId: "unapproved-source"
            }],
            adapter: {
                adapterId: "adapter.legal.malicious.v1",
                mode: "lexical",
                retrievalRole: "source-retrieval-only",
                applicabilityAuthority: "none",
                usesExternalNetwork: false
            }
        };
    }
};
const refused = runLegalRetrievalAdapterSafely({
    adapter: malicious,
    decision: protectedDecision,
    catalog
});
assert.equal(refused.valid, false);
assert(refused.errors.some((item) => item.code === "legal-retrieval-source-scope-expanded"));

const fingerprintAttack = {
    ...malicious,
    adapterId: "adapter.legal.fingerprint-attack.v1",
    retrieve() {
        return {
            ...baseline,
            retrievedChunks: [{
                ...baseline.retrievedChunks[0],
                contentSha256: "f".repeat(64)
            }]
        };
    }
};
const fingerprintRefused = runLegalRetrievalAdapterSafely({
    adapter: fingerprintAttack,
    decision: protectedDecision,
    catalog
});
assert.equal(fingerprintRefused.valid, false);
assert(fingerprintRefused.errors.some((item) => item.code === "legal-retrieval-chunk-integrity-mismatch"));

const source = await readFile(
    path.join(ROOT, "growwithhr-rag", "legal-retrieval-adapters.js"),
    "utf8"
);
for (const prohibited of [
    /\bfetch\s*\(/,
    /XMLHttpRequest/,
    /localStorage/,
    /sessionStorage/,
    /openai/i,
    /anthropic/i,
    /gemini/i
]) {
    assert.equal(prohibited.test(source), false, `Forbidden adapter marker: ${prohibited}`);
}

console.log(JSON.stringify({
    valid: true,
    lexicalChunks: lexical.retrievedChunks.length,
    hybridChunks: hybrid.retrievedChunks.length,
    sourceScopeExpanded: false,
    decisionMutated: false,
    externalNetworkUsed: false
}, null, 2));
