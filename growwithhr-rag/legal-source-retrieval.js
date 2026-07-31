/**
 * Pure, deterministic retrieval over a governed legal-source chunk catalog.
 * The deterministic legal decision must exist before this module is called.
 */

export const LEGAL_SOURCE_RETRIEVAL_VERSION = "0.1.0";

const SHA256 = /^[a-f0-9]{64}$/;
const STABLE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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

function issue(path, message) {
    return Object.freeze({ path: text(path) || "/", message: text(message) || "Legal source retrieval validation failed." });
}

export class LegalSourceRetrievalError extends Error {
    constructor(issues) {
        const normalized = Object.freeze(array(Array.isArray(issues) ? issues : [issues])
            .filter(Boolean)
            .map((item) => issue(object(item).path, object(item).message)));
        super(normalized.map((item) => `${item.path}: ${item.message}`).join("\n") || "Legal source retrieval validation failed.");
        this.name = "LegalSourceRetrievalError";
        this.issues = normalized;
    }
}

function tokens(values) {
    const result = new Set();
    array(values).forEach((value) => {
        const normalized = text(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
        if (!normalized) return;
        result.add(normalized);
        normalized.split(/\s+/).filter((token) => token.length >= 3).forEach((token) => result.add(token));
    });
    return result;
}

function fingerprint(value) {
    const source = JSON.stringify(value);
    let hash = 0x811c9dc5;
    for (let index = 0; index < source.length; index += 1) {
        hash ^= source.charCodeAt(index);
        hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
}

function decisionReference(value) {
    const decision = object(value);
    return deepFreeze({
        productRuleId: text(decision.productRuleId),
        ruleId: text(decision.ruleId),
        ruleVersion: text(decision.ruleVersion),
        status: text(decision.status),
        reasonCode: text(decision.reasonCode),
        sourceRegistryIds: unique(decision.sourceRegistryIds),
        requiredFactIds: unique(decision.requiredFactIds),
        triggeringFactIds: unique(decision.triggeringFactIds),
        missingFactIds: unique(decision.missingFactIds)
    });
}

function assertDecision(reference) {
    const errors = [];
    ["productRuleId", "ruleId", "ruleVersion", "status", "reasonCode"].forEach((key) => {
        if (!reference[key]) errors.push(issue(`/decision/${key}`, "A deterministic decision value is required before retrieval."));
    });
    if (!reference.sourceRegistryIds.length) {
        errors.push(issue("/decision/sourceRegistryIds", "At least one approved Source Register ID is required for retrieval."));
    }
    if (errors.length) throw new LegalSourceRetrievalError(errors);
    return reference;
}

export function validateLegalSourceRetrievalCatalog(value) {
    const catalog = object(value);
    const errors = [];

    if (catalog.retrievalCatalog !== true) errors.push(issue("/retrievalCatalog", "A retrieval catalog must be explicitly identified."));
    if (catalog.retrievalRole !== "source-retrieval-only") errors.push(issue("/retrievalRole", "Retrieval must remain source-retrieval-only."));
    if (catalog.applicabilityAuthority !== "none") errors.push(issue("/applicabilityAuthority", "A retrieval catalog must have no applicability authority."));
    if (catalog.llmRole !== "none") errors.push(issue("/llmRole", "This retrieval proof must not call or represent a language model."));
    if (catalog.legalReviewStatus !== "needs-legal-review") errors.push(issue("/legalReviewStatus", "The provisional retrieval catalog must remain needs-legal-review."));
    if (catalog.productionIntegration !== false) errors.push(issue("/productionIntegration", "The proof catalog must not claim production integration."));

    const sources = new Map();
    array(catalog.sources).forEach((raw, index) => {
        const source = object(raw);
        const path = `/sources/${index}`;
        const id = text(source.registrySourceId);
        if (!STABLE_ID.test(id)) errors.push(issue(`${path}/registrySourceId`, "A stable lower-case Source Register ID is required."));
        else if (sources.has(id)) errors.push(issue(`${path}/registrySourceId`, `Source Register ID "${id}" is duplicated.`));
        else sources.set(id, source);
        if (source.official !== true) errors.push(issue(`${path}/official`, "Retrieval sources must be marked official."));
        if (source.reviewStatus !== "needs-legal-review") errors.push(issue(`${path}/reviewStatus`, "Retrieval sources must remain needs-legal-review."));
        ["title", "officialUrl", "fileName", "drivePath"].forEach((key) => {
            if (!text(source[key])) errors.push(issue(`${path}/${key}`, "A non-empty governed source value is required."));
        });
        if (!SHA256.test(text(source.sha256))) errors.push(issue(`${path}/sha256`, "A lower-case SHA-256 source fingerprint is required."));
        if (!Number.isInteger(source.byteLength) || source.byteLength <= 0) errors.push(issue(`${path}/byteLength`, "A positive source byte length is required."));
        if (!Number.isInteger(source.pageCount) || source.pageCount <= 0) errors.push(issue(`${path}/pageCount`, "A positive source page count is required."));
    });

    const chunkIds = new Set();
    array(catalog.chunks).forEach((raw, index) => {
        const chunk = object(raw);
        const path = `/chunks/${index}`;
        const id = text(chunk.chunkId);
        const source = sources.get(text(chunk.registrySourceId));
        if (!STABLE_ID.test(id)) errors.push(issue(`${path}/chunkId`, "A stable lower-case chunk ID is required."));
        else if (chunkIds.has(id)) errors.push(issue(`${path}/chunkId`, `Chunk ID "${id}" is duplicated.`));
        else chunkIds.add(id);
        if (!source) errors.push(issue(`${path}/registrySourceId`, "Every chunk must resolve to a registered official source."));
        ["title", "sectionReference", "text"].forEach((key) => {
            if (!text(chunk[key])) errors.push(issue(`${path}/${key}`, "A non-empty governed chunk value is required."));
        });
        if (!SHA256.test(text(chunk.contentSha256))) errors.push(issue(`${path}/contentSha256`, "A lower-case SHA-256 content fingerprint is required."));
        if (!Number.isInteger(chunk.pageStart) || !Number.isInteger(chunk.pageEnd) || chunk.pageStart <= 0 || chunk.pageEnd < chunk.pageStart || (source && chunk.pageEnd > source.pageCount)) {
            errors.push(issue(`${path}/pageStart`, "Chunk page bounds must be inside the registered source."));
        }
        if (!Number.isInteger(chunk.priority) || chunk.priority < 0) errors.push(issue(`${path}/priority`, "A non-negative deterministic priority is required."));
        if (!unique(chunk.reasonCodes).length) errors.push(issue(`${path}/reasonCodes`, "At least one deterministic decision reason code is required."));
        if (!unique(chunk.retrievalTerms).length) errors.push(issue(`${path}/retrievalTerms`, "At least one governed retrieval term is required."));
    });

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
}

function assertCatalog(catalog) {
    const validation = validateLegalSourceRetrievalCatalog(catalog);
    if (!validation.valid) throw new LegalSourceRetrievalError(validation.errors);
    return catalog;
}

function score(chunk, queryTokens, reasonCode) {
    const governedTerms = tokens([chunk.title, chunk.sectionReference, ...array(chunk.retrievalTerms)]);
    let overlap = 0;
    queryTokens.forEach((token) => { if (governedTerms.has(token)) overlap += 1; });
    const reasonMatch = unique(chunk.reasonCodes).includes(reasonCode) ? 1 : 0;
    return reasonMatch * 10000 + overlap * 100 + Number(chunk.priority || 0);
}

function citation(chunk, source, chunkScore) {
    return deepFreeze({
        chunkId: text(chunk.chunkId),
        registrySourceId: text(source.registrySourceId),
        sourceTitle: text(source.title),
        sectionReference: text(chunk.sectionReference),
        pageStart: chunk.pageStart,
        pageEnd: chunk.pageEnd,
        officialUrl: text(source.officialUrl),
        drivePath: text(source.drivePath),
        sourceSha256: text(source.sha256),
        contentSha256: text(chunk.contentSha256),
        text: text(chunk.text),
        score: chunkScore
    });
}

/** Retrieve official-source chunks only after a deterministic decision exists. */
export function retrieveLegalDecisionSources(input = {}) {
    const request = object(input);
    const catalog = assertCatalog(request.catalog);
    const reference = assertDecision(decisionReference(request.decision));
    const decisionFingerprint = fingerprint(reference);
    const enabled = request.enabled !== false;
    const maxChunks = Number.isInteger(request.maxChunks) && request.maxChunks > 0 ? Math.min(request.maxChunks, 20) : 4;

    const baseTrace = {
        retrievalVersion: LEGAL_SOURCE_RETRIEVAL_VERSION,
        triggeredAfterDecision: true,
        usedForDecision: false,
        applicabilityAuthority: "none",
        llmUsed: false,
        legalReviewStatus: catalog.legalReviewStatus,
        decisionReference: reference,
        decisionFingerprint,
        requestedSourceIds: reference.sourceRegistryIds,
        limitations: clone(catalog.limitations)
    };

    if (!enabled) return deepFreeze({ ...baseTrace, retrievalStatus: "disabled", retrievedChunks: [] });

    const sourceMap = new Map(array(catalog.sources).map((source) => [source.registrySourceId, source]));
    const unknown = reference.sourceRegistryIds.filter((id) => !sourceMap.has(id));
    if (unknown.length) {
        throw new LegalSourceRetrievalError([issue("/decision/sourceRegistryIds", `Retrieval refused unknown Source Register IDs: ${unknown.join(", ")}.`)]);
    }

    const queryTokens = tokens([
        reference.productRuleId,
        reference.ruleId,
        reference.status,
        reference.reasonCode,
        ...array(request.queryTerms)
    ]);
    const allowed = new Set(reference.sourceRegistryIds);
    const retrievedChunks = array(catalog.chunks)
        .filter((chunk) => allowed.has(text(chunk.registrySourceId)) && unique(chunk.reasonCodes).includes(reference.reasonCode))
        .map((chunk) => ({ chunk, score: score(chunk, queryTokens, reference.reasonCode) }))
        .sort((left, right) => right.score - left.score || text(left.chunk.chunkId).localeCompare(text(right.chunk.chunkId)))
        .slice(0, maxChunks)
        .map(({ chunk, score: chunkScore }) => citation(chunk, sourceMap.get(chunk.registrySourceId), chunkScore));

    return deepFreeze({
        ...baseTrace,
        retrievalStatus: retrievedChunks.length ? "completed" : "no-matching-chunks",
        retrievedChunks,
        retrievalFingerprint: fingerprint(retrievedChunks.map((chunk) => ({
            chunkId: chunk.chunkId,
            contentSha256: chunk.contentSha256,
            score: chunk.score
        })))
    });
}

export function retrieveLegalDecisionSourcesSafely(input = {}) {
    try {
        return Object.freeze({ valid: true, value: retrieveLegalDecisionSources(input), errors: Object.freeze([]) });
    } catch (error) {
        const errors = error instanceof LegalSourceRetrievalError
            ? error.issues
            : Object.freeze([issue("/", error?.message || "Unknown legal source retrieval error.")]);
        return Object.freeze({ valid: false, value: null, errors });
    }
}

export default Object.freeze({
    version: LEGAL_SOURCE_RETRIEVAL_VERSION,
    validateLegalSourceRetrievalCatalog,
    retrieveLegalDecisionSources,
    retrieveLegalDecisionSourcesSafely
});
