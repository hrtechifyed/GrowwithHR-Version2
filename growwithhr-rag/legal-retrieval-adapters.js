/**
 * Provider-neutral governed legal retrieval adapters.
 *
 * Deterministic decisions and approved Source Register IDs must exist before
 * an adapter is invoked. Adapters may rank only already-allowed governed
 * chunks and have no applicability or fact-creation authority.
 */

import { retrieveLegalDecisionSources } from "./legal-source-retrieval.js";

export const LEGAL_RETRIEVAL_ADAPTER_VERSION = "1.0.0";

const MODES = new Set(["lexical", "hybrid"]);
const object = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const array = (value) => Array.isArray(value) ? value : [];
const text = (value) => String(value ?? "").trim();
const unique = (values) => [...new Set(array(values).map(text).filter(Boolean))];
const clone = (value) => JSON.parse(JSON.stringify(value));

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
}

function issue(path, message, code = "legal-retrieval-adapter-invalid") {
    return Object.freeze({
        path: text(path) || "/",
        message: text(message) || "Legal retrieval adapter validation failed.",
        code: text(code) || "legal-retrieval-adapter-invalid"
    });
}

export class LegalRetrievalAdapterError extends Error {
    constructor(issues) {
        const normalized = Object.freeze(
            array(Array.isArray(issues) ? issues : [issues])
                .filter(Boolean)
                .map((item) => issue(object(item).path, object(item).message, object(item).code))
        );
        super(normalized.map((item) => `${item.path}: ${item.message}`).join("\n") || "Legal retrieval adapter validation failed.");
        this.name = "LegalRetrievalAdapterError";
        this.issues = normalized;
        this.code = normalized[0]?.code || "legal-retrieval-adapter-invalid";
    }
}

function stableFingerprint(value) {
    const source = JSON.stringify(value);
    let hash = 0x811c9dc5;
    for (let index = 0; index < source.length; index += 1) {
        hash ^= source.charCodeAt(index);
        hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
}

function normalizedTokens(values) {
    const tokens = [];
    array(values).forEach((value) => {
        const normalized = text(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
        if (!normalized) return;
        const parts = normalized.split(/\s+/).filter((token) => token.length >= 2);
        tokens.push(...parts);
        for (let index = 0; index < parts.length - 1; index += 1) {
            tokens.push(`${parts[index]}_${parts[index + 1]}`);
        }
    });
    return tokens;
}

function sparseVector(values) {
    const vector = new Map();
    normalizedTokens(values).forEach((token) => vector.set(token, (vector.get(token) || 0) + 1));
    return vector;
}

function cosine(left, right) {
    if (!left.size || !right.size) return 0;
    let dot = 0;
    let leftNorm = 0;
    let rightNorm = 0;
    left.forEach((value, key) => {
        leftNorm += value * value;
        dot += value * (right.get(key) || 0);
    });
    right.forEach((value) => {
        rightNorm += value * value;
    });
    return leftNorm && rightNorm ? dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm)) : 0;
}

function adapterView(adapter) {
    return deepFreeze({
        adapterVersion: LEGAL_RETRIEVAL_ADAPTER_VERSION,
        adapterId: text(adapter.adapterId),
        mode: text(adapter.mode),
        retrievalRole: "source-retrieval-only",
        applicabilityAuthority: "none",
        usesExternalNetwork: adapter.usesExternalNetwork === true
    });
}

export function validateLegalRetrievalAdapter(value) {
    const adapter = object(value);
    const errors = [];
    if (!text(adapter.adapterId)) errors.push(issue("/adapterId", "A stable adapter ID is required."));
    if (!MODES.has(text(adapter.mode))) errors.push(issue("/mode", "Adapter mode must be lexical or hybrid."));
    if (adapter.retrievalRole !== "source-retrieval-only") {
        errors.push(issue("/retrievalRole", "The adapter must remain source-retrieval-only."));
    }
    if (adapter.applicabilityAuthority !== "none") {
        errors.push(issue("/applicabilityAuthority", "The adapter must have no applicability authority."));
    }
    if (typeof adapter.retrieve !== "function") errors.push(issue("/retrieve", "An adapter retrieve function is required."));
    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
}

function assertAdapter(value) {
    const validation = validateLegalRetrievalAdapter(value);
    if (!validation.valid) throw new LegalRetrievalAdapterError(validation.errors);
    return value;
}

function assertTraceBoundaries(trace, decision, catalog) {
    const errors = [];
    const reference = object(decision);
    const allowedSources = new Set(unique(reference.sourceRegistryIds));
    const reasonCode = text(reference.reasonCode);
    const catalogChunks = new Map(
        array(object(catalog).chunks).map((chunk) => [text(object(chunk).chunkId), object(chunk)])
    );
    const returnedIds = new Set();

    if (trace.usedForDecision !== false) {
        errors.push(issue("/trace/usedForDecision", "Retrieval must not be used for the deterministic decision.", "legal-retrieval-authority-violation"));
    }
    if (trace.applicabilityAuthority !== "none") {
        errors.push(issue("/trace/applicabilityAuthority", "Retrieval must have no applicability authority.", "legal-retrieval-authority-violation"));
    }
    array(trace.retrievedChunks).forEach((chunk, index) => {
        const citation = object(chunk);
        const chunkId = text(citation.chunkId);
        const sourceId = text(citation.registrySourceId);
        const governedChunk = catalogChunks.get(chunkId);

        if (!allowedSources.has(sourceId)) {
            errors.push(issue(
                `/trace/retrievedChunks/${index}/registrySourceId`,
                `Adapter returned a chunk outside the deterministic source scope: ${sourceId || "(missing)"}.`,
                "legal-retrieval-source-scope-expanded"
            ));
        }
        if (!governedChunk) {
            errors.push(issue(
                `/trace/retrievedChunks/${index}/chunkId`,
                `Adapter returned an unknown governed chunk: ${chunkId || "(missing)"}.`,
                "legal-retrieval-chunk-not-governed"
            ));
        } else {
            if (!unique(governedChunk.reasonCodes).includes(reasonCode)) {
                errors.push(issue(
                    `/trace/retrievedChunks/${index}/chunkId`,
                    `Adapter returned chunk ${chunkId} outside the deterministic reason-code scope.`,
                    "legal-retrieval-reason-scope-expanded"
                ));
            }
            if (
                text(governedChunk.registrySourceId) !== sourceId ||
                text(governedChunk.contentSha256) !== text(citation.contentSha256)
            ) {
                errors.push(issue(
                    `/trace/retrievedChunks/${index}`,
                    `Adapter changed governed identity or content fingerprint for chunk ${chunkId}.`,
                    "legal-retrieval-chunk-integrity-mismatch"
                ));
            }
        }
        if (returnedIds.has(chunkId)) {
            errors.push(issue(
                `/trace/retrievedChunks/${index}/chunkId`,
                `Adapter returned duplicate chunk ${chunkId}.`,
                "legal-retrieval-duplicate-chunk"
            ));
        }
        returnedIds.add(chunkId);
    });
    if (errors.length) throw new LegalRetrievalAdapterError(errors);
}

function withAdapter(trace, adapter, additions = {}) {
    return deepFreeze({
        ...clone(trace),
        ...clone(additions),
        adapter: adapterView(adapter)
    });
}

export function createLexicalLegalRetrievalAdapter(options = {}) {
    const retrieve = typeof options.retrieve === "function"
        ? options.retrieve
        : retrieveLegalDecisionSources;
    return deepFreeze({
        adapterId: "adapter.legal.lexical.v1",
        mode: "lexical",
        retrievalRole: "source-retrieval-only",
        applicabilityAuthority: "none",
        usesExternalNetwork: false,
        retrieve(input = {}) {
            return withAdapter(retrieve(input), this);
        }
    });
}

export function createHybridLegalRetrievalAdapter(options = {}) {
    const retrieve = typeof options.retrieve === "function"
        ? options.retrieve
        : retrieveLegalDecisionSources;
    const lexicalWeight = Number.isFinite(options.lexicalWeight)
        ? Math.min(1, Math.max(0, options.lexicalWeight))
        : 0.7;
    const semanticWeight = 1 - lexicalWeight;

    return deepFreeze({
        adapterId: "adapter.legal.hybrid-local.v1",
        mode: "hybrid",
        retrievalRole: "source-retrieval-only",
        applicabilityAuthority: "none",
        usesExternalNetwork: false,
        retrieve(input = {}) {
            const request = object(input);
            const maxChunks = Number.isInteger(request.maxChunks) && request.maxChunks > 0
                ? Math.min(request.maxChunks, 20)
                : 4;
            const baseline = retrieve({
                ...request,
                maxChunks: 20
            });
            const candidates = array(baseline.retrievedChunks);
            if (baseline.retrievalStatus !== "completed" || !candidates.length) {
                return withAdapter(baseline, this, {
                    hybrid: {
                        lexicalWeight,
                        semanticWeight,
                        candidateCount: candidates.length
                    }
                });
            }

            const decision = object(request.decision);
            const queryVector = sparseVector([
                decision.productRuleId,
                decision.ruleId,
                decision.status,
                decision.reasonCode,
                ...array(request.queryTerms)
            ]);
            const chunksById = new Map(array(object(request.catalog).chunks)
                .map((chunk) => [text(object(chunk).chunkId), object(chunk)]));
            const lexicalScores = candidates.map((chunk) => Number(object(chunk).score) || 0);
            const minimum = Math.min(...lexicalScores);
            const maximum = Math.max(...lexicalScores);
            const range = maximum - minimum;

            const ranked = candidates.map((citation) => {
                const chunk = chunksById.get(text(citation.chunkId)) || {};
                const lexicalNormalized = range === 0
                    ? 1
                    : ((Number(citation.score) || 0) - minimum) / range;
                const semanticScore = cosine(queryVector, sparseVector([
                    chunk.title,
                    chunk.sectionReference,
                    chunk.text,
                    ...array(chunk.retrievalTerms),
                    ...array(chunk.reasonCodes)
                ]));
                const hybridScore = Math.round(
                    (lexicalWeight * lexicalNormalized + semanticWeight * semanticScore) * 1_000_000
                );
                return {
                    citation: {
                        ...clone(citation),
                        score: hybridScore
                    },
                    hybridScore
                };
            }).sort((left, right) =>
                right.hybridScore - left.hybridScore ||
                text(left.citation.chunkId).localeCompare(text(right.citation.chunkId))
            );

            const retrievedChunks = ranked.slice(0, maxChunks).map((item) => item.citation);
            const retrievalFingerprint = stableFingerprint({
                adapterId: this.adapterId,
                decisionFingerprint: baseline.decisionFingerprint,
                chunks: retrievedChunks.map((chunk) => ({
                    chunkId: chunk.chunkId,
                    contentSha256: chunk.contentSha256,
                    score: chunk.score
                }))
            });
            return withAdapter({
                ...clone(baseline),
                retrievedChunks,
                retrievalFingerprint
            }, this, {
                hybrid: {
                    lexicalWeight,
                    semanticWeight,
                    candidateCount: candidates.length
                }
            });
        }
    });
}

export function createLegalRetrievalAdapterRegistry(options = {}) {
    const source = object(options);
    const lexical = source.lexical || createLexicalLegalRetrievalAdapter(source);
    const hybrid = source.hybrid || createHybridLegalRetrievalAdapter(source);
    assertAdapter(lexical);
    assertAdapter(hybrid);
    return deepFreeze({
        lexical,
        hybrid
    });
}

export function resolveLegalRetrievalAdapter(input = {}) {
    const request = object(input);
    const mode = text(request.mode || "lexical").toLowerCase();
    if (!MODES.has(mode)) {
        throw new LegalRetrievalAdapterError([issue(
            "/mode",
            `Unsupported legal retrieval mode: ${mode || "(missing)"}.`,
            "legal-retrieval-mode-unsupported"
        )]);
    }
    const registry = request.registry || createLegalRetrievalAdapterRegistry();
    const adapter = object(registry)[mode];
    return assertAdapter(adapter);
}

export function runLegalRetrievalAdapter(input = {}) {
    const request = object(input);
    const adapter = assertAdapter(request.adapter || resolveLegalRetrievalAdapter(request));
    const before = JSON.stringify(request.decision);
    const trace = adapter.retrieve({
        decision: request.decision,
        catalog: request.catalog,
        queryTerms: unique(request.queryTerms),
        maxChunks: request.maxChunks,
        enabled: request.enabled !== false
    });
    if (JSON.stringify(request.decision) !== before) {
        throw new LegalRetrievalAdapterError([issue(
            "/decision",
            "The protected deterministic decision was mutated during adapter retrieval.",
            "legal-retrieval-decision-mutated"
        )]);
    }
    assertTraceBoundaries(trace, request.decision, request.catalog);
    return deepFreeze(trace);
}

export function runLegalRetrievalAdapterSafely(input = {}) {
    try {
        return Object.freeze({ valid: true, value: runLegalRetrievalAdapter(input), errors: Object.freeze([]) });
    } catch (error) {
        const errors = error instanceof LegalRetrievalAdapterError
            ? error.issues
            : Object.freeze([issue("/", error?.message || "Unknown legal retrieval adapter error.")]);
        return Object.freeze({ valid: false, value: null, errors });
    }
}

export default Object.freeze({
    version: LEGAL_RETRIEVAL_ADAPTER_VERSION,
    validateLegalRetrievalAdapter,
    createLexicalLegalRetrievalAdapter,
    createHybridLegalRetrievalAdapter,
    createLegalRetrievalAdapterRegistry,
    resolveLegalRetrievalAdapter,
    runLegalRetrievalAdapter,
    runLegalRetrievalAdapterSafely
});
