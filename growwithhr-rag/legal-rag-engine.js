/**
 * Complete governed legal RAG engine.
 *
 * Resolves the active feature profile, selects a provider-neutral retrieval
 * adapter and runs source-scoped retrieval after a deterministic legal decision.
 */

import {
    LEGAL_RAG_RUNTIME_VERSION,
    LegalRagRuntimeError,
    resolveLegalRagProfile
} from "./legal-rag-runtime.js";
import {
    LEGAL_RETRIEVAL_ADAPTER_VERSION,
    LegalRetrievalAdapterError,
    createLegalRetrievalAdapterRegistry,
    resolveLegalRetrievalAdapter,
    runLegalRetrievalAdapter
} from "./legal-retrieval-adapters.js";

export const LEGAL_RAG_ENGINE_VERSION = "1.0.0";

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

function issue(path, message, code = "legal-rag-engine-invalid") {
    return Object.freeze({
        path: text(path) || "/",
        message: text(message) || "Legal RAG engine validation failed.",
        code: text(code) || "legal-rag-engine-invalid"
    });
}

export class LegalRagEngineError extends Error {
    constructor(issues) {
        const normalized = Object.freeze(
            array(Array.isArray(issues) ? issues : [issues])
                .filter(Boolean)
                .map((item) => issue(object(item).path, object(item).message, object(item).code))
        );
        super(normalized.map((item) => `${item.path}: ${item.message}`).join("\n") || "Legal RAG engine validation failed.");
        this.name = "LegalRagEngineError";
        this.issues = normalized;
        this.code = normalized[0]?.code || "legal-rag-engine-invalid";
    }
}

function injectedCatalog(catalogs, catalogId) {
    if (catalogs instanceof Map) return catalogs.get(catalogId);
    return object(catalogs)[catalogId];
}

function mappedError(error) {
    if (error instanceof LegalRagEngineError) return error;
    if (error instanceof LegalRagRuntimeError || error instanceof LegalRetrievalAdapterError) {
        const mapped = new LegalRagEngineError(error.issues);
        mapped.name = error.name;
        return mapped;
    }
    return new LegalRagEngineError([issue("/", error?.message || "Unknown legal RAG engine error.")]);
}

export function runLegalRagEngine(input = {}) {
    const request = object(input);
    const before = JSON.stringify(request.decision);
    try {
        const resolved = resolveLegalRagProfile({
            featureId: request.featureId,
            decision: request.decision,
            registry: request.registry
        });
        const catalogId = resolved.profile.catalogId;
        const catalog = injectedCatalog(request.catalogs, catalogId);
        if (!catalog) {
            throw new LegalRagEngineError([issue(
                "/catalogs",
                `The governed catalogue ${catalogId} was not injected into the RAG engine.`,
                "legal-rag-catalog-not-injected"
            )]);
        }

        const registry = request.adapterRegistry || createLegalRetrievalAdapterRegistry(request.adapterOptions);
        const adapter = request.adapter || resolveLegalRetrievalAdapter({
            mode: request.adapterMode || "lexical",
            registry
        });
        const maxChunks = Number.isInteger(request.maxChunks) && request.maxChunks > 0
            ? Math.min(request.maxChunks, resolved.profile.maxChunks)
            : resolved.profile.maxChunks;
        const retrieval = runLegalRetrievalAdapter({
            adapter,
            decision: request.decision,
            catalog,
            queryTerms: unique([
                ...resolved.profile.queryTerms,
                ...array(request.queryTerms)
            ]),
            maxChunks,
            enabled: request.enabled !== false
        });

        if (JSON.stringify(request.decision) !== before) {
            throw new LegalRagEngineError([issue(
                "/decision",
                "The protected deterministic decision was mutated during RAG execution.",
                "legal-rag-decision-mutated"
            )]);
        }

        return deepFreeze({
            engineVersion: LEGAL_RAG_ENGINE_VERSION,
            runtimeVersion: LEGAL_RAG_RUNTIME_VERSION,
            adapterVersion: LEGAL_RETRIEVAL_ADAPTER_VERSION,
            runtimeRole: "post-decision-rag-routing-only",
            retrievalRole: "source-retrieval-only",
            applicabilityAuthority: "none",
            llmUsed: false,
            usedForDecision: false,
            profile: clone(resolved.profile),
            retrievalAdapter: clone(retrieval.adapter),
            retrieval
        });
    } catch (error) {
        throw mappedError(error);
    }
}

export function runLegalRagEngineSafely(input = {}) {
    try {
        return Object.freeze({ valid: true, value: runLegalRagEngine(input), errors: Object.freeze([]) });
    } catch (error) {
        const mapped = mappedError(error);
        return Object.freeze({ valid: false, value: null, errors: mapped.issues });
    }
}

export default Object.freeze({
    version: LEGAL_RAG_ENGINE_VERSION,
    runLegalRagEngine,
    runLegalRagEngineSafely
});
