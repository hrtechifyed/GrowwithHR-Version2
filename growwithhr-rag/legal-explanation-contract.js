/**
 * Provider-neutral legal explanation contract.
 *
 * A deterministic legal decision and governed retrieval trace must already
 * exist before this module is called. The module has no network, storage,
 * browser, PDF, email or production-report side effects.
 */

export const LEGAL_EXPLANATION_CONTRACT_VERSION = "1.0.0";

const object = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const array = (value) => Array.isArray(value) ? value : [];
const text = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const unique = (values) => [...new Set(array(values).map(text).filter(Boolean))];
const clone = (value) => JSON.parse(JSON.stringify(value));

const REQUIRED_LIMITATIONS = Object.freeze([
    "This explanation does not change the deterministic decision.",
    "The rule and source interpretation remain subject to legal review.",
    "Assessment answers and evidence have not been independently verified."
]);

const FORBIDDEN_TEXT_PATTERNS = Object.freeze([
    /\bdefinitely applies\b/i,
    /\bdoes not apply\b/i,
    /\bno POSH obligations\b/i,
    /\blegally compliant\b/i,
    /\bcertified compliant\b/i,
    /\blegal approval has been granted\b/i,
    /\bguaranteed compliance\b/i
]);

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
}

function issue(path, message) {
    return Object.freeze({
        path: text(path) || "/",
        message: text(message) || "Legal explanation validation failed."
    });
}

export class LegalExplanationContractError extends Error {
    constructor(issues) {
        const normalized = Object.freeze(
            array(Array.isArray(issues) ? issues : [issues])
                .filter(Boolean)
                .map((item) => issue(object(item).path, object(item).message))
        );
        super(normalized.map((item) => `${item.path}: ${item.message}`).join("\n") || "Legal explanation validation failed.");
        this.name = "LegalExplanationContractError";
        this.issues = normalized;
    }
}

function exactKeys(value, allowed, path, errors) {
    const source = object(value);
    Object.keys(source).forEach((key) => {
        if (!allowed.includes(key)) errors.push(issue(`${path}/${key}`, "Unexpected explanation property."));
    });
}

function decisionReference(decisionValue, retrievalValue) {
    const decision = object(decisionValue);
    const retrieval = object(retrievalValue);
    const retrievalDecision = object(retrieval.decisionReference);

    return deepFreeze({
        productRuleId: text(decision.productRuleId),
        ruleId: text(decision.ruleId),
        ruleVersion: text(decision.ruleVersion),
        status: text(decision.status),
        reasonCode: text(decision.reasonCode),
        reason: text(decision.reason),
        legalReviewStatus: text(decision.legalReviewStatus),
        decisionFingerprint: text(retrieval.decisionFingerprint),
        sourceRegistryIds: unique(decision.sourceRegistryIds),
        retrievedStatus: text(retrievalDecision.status),
        retrievedReasonCode: text(retrievalDecision.reasonCode)
    });
}

function validateInput(decision, retrieval) {
    const errors = [];
    const reference = decisionReference(decision, retrieval);
    const trace = object(retrieval);

    ["productRuleId", "ruleId", "ruleVersion", "status", "reasonCode", "decisionFingerprint"].forEach((key) => {
        if (!reference[key]) errors.push(issue(`/decision/${key}`, "A deterministic decision value is required before explanation."));
    });

    if (reference.status !== reference.retrievedStatus) {
        errors.push(issue("/retrieval/decisionReference/status", "Retrieval trace status must match the deterministic decision."));
    }
    if (reference.reasonCode !== reference.retrievedReasonCode) {
        errors.push(issue("/retrieval/decisionReference/reasonCode", "Retrieval trace reason code must match the deterministic decision."));
    }
    if (trace.triggeredAfterDecision !== true) {
        errors.push(issue("/retrieval/triggeredAfterDecision", "Explanation requires retrieval that ran after the decision."));
    }
    if (trace.usedForDecision !== false || trace.applicabilityAuthority !== "none") {
        errors.push(issue("/retrieval/usedForDecision", "Retrieval must have no decision authority."));
    }
    if (trace.retrievalStatus !== "completed") {
        errors.push(issue("/retrieval/retrievalStatus", "A completed governed retrieval trace is required for source-grounded explanation."));
    }
    if (trace.legalReviewStatus !== "needs-legal-review" || reference.legalReviewStatus !== "needs-legal-review") {
        errors.push(issue("/legalReviewStatus", "The POSH explanation proof must remain needs-legal-review."));
    }
    if (!array(trace.retrievedChunks).length) {
        errors.push(issue("/retrieval/retrievedChunks", "At least one governed retrieved chunk is required."));
    }

    const chunkIds = new Set();
    array(trace.retrievedChunks).forEach((chunkValue, index) => {
        const chunk = object(chunkValue);
        const chunkId = text(chunk.chunkId);
        if (!chunkId) errors.push(issue(`/retrieval/retrievedChunks/${index}/chunkId`, "A governed chunk ID is required."));
        else if (chunkIds.has(chunkId)) errors.push(issue(`/retrieval/retrievedChunks/${index}/chunkId`, "Retrieved chunk IDs must be unique."));
        else chunkIds.add(chunkId);
        ["registrySourceId", "sourceTitle", "sectionReference", "text", "contentSha256"].forEach((key) => {
            if (!text(chunk[key])) errors.push(issue(`/retrieval/retrievedChunks/${index}/${key}`, "A governed citation value is required."));
        });
    });

    if (errors.length) throw new LegalExplanationContractError(errors);
    return reference;
}

/** Build the immutable input supplied to an explanation-only provider. */
export function buildLegalExplanationRequest(input = {}) {
    const source = object(input);
    const decision = object(source.decision);
    const retrieval = object(source.retrievalTrace);
    const reference = validateInput(decision, retrieval);

    const citations = array(retrieval.retrievedChunks).map((chunkValue) => {
        const chunk = object(chunkValue);
        return {
            chunkId: text(chunk.chunkId),
            registrySourceId: text(chunk.registrySourceId),
            sourceTitle: text(chunk.sourceTitle),
            sectionReference: text(chunk.sectionReference),
            pageStart: chunk.pageStart,
            pageEnd: chunk.pageEnd,
            officialUrl: text(chunk.officialUrl),
            contentSha256: text(chunk.contentSha256),
            text: text(chunk.text)
        };
    });

    return deepFreeze({
        contractVersion: LEGAL_EXPLANATION_CONTRACT_VERSION,
        requestedAt: text(source.requestedAt),
        providerRole: "explanation-only",
        usedForDecision: false,
        mayChangeDecision: false,
        applicabilityAuthority: "none",
        legalAdvice: false,
        decisionReference: reference,
        retrievalReference: {
            retrievalVersion: text(retrieval.retrievalVersion),
            retrievalFingerprint: text(retrieval.retrievalFingerprint),
            retrievedChunks: citations
        },
        instructions: [
            "Explain only the supplied deterministic decision.",
            "Use only the supplied governed citations for source-grounded statements.",
            "Do not add, infer or alter assessment facts.",
            "Do not change the decision status, reason code or fingerprint.",
            "Do not present the output as legal advice, certification or approval.",
            "Return only the required structured response."
        ],
        requiredLimitations: [...REQUIRED_LIMITATIONS]
    });
}

function allGeneratedText(response) {
    return [
        text(response.summary),
        ...array(response.rationale).map((item) => text(object(item).statement)),
        ...array(response.nextSteps).map(text),
        ...array(response.limitations).map(text)
    ].filter(Boolean);
}

export function validateLegalExplanationResponse(input = {}) {
    const source = object(input);
    const request = object(source.request);
    const response = object(source.response);
    const errors = [];

    exactKeys(response, [
        "contractVersion",
        "decisionFingerprint",
        "decisionStatus",
        "reasonCode",
        "summary",
        "rationale",
        "nextSteps",
        "limitations",
        "legalReviewStatus",
        "usedForDecision",
        "mayChangeDecision",
        "legalAdvice"
    ], "/response", errors);

    const reference = object(request.decisionReference);
    if (response.contractVersion !== LEGAL_EXPLANATION_CONTRACT_VERSION) {
        errors.push(issue("/response/contractVersion", "Explanation contract version must match the request."));
    }
    if (text(response.decisionFingerprint) !== text(reference.decisionFingerprint)) {
        errors.push(issue("/response/decisionFingerprint", "Provider output cannot change the decision fingerprint."));
    }
    if (text(response.decisionStatus) !== text(reference.status)) {
        errors.push(issue("/response/decisionStatus", "Provider output cannot change the deterministic status."));
    }
    if (text(response.reasonCode) !== text(reference.reasonCode)) {
        errors.push(issue("/response/reasonCode", "Provider output cannot change the deterministic reason code."));
    }
    if (response.legalReviewStatus !== "needs-legal-review") {
        errors.push(issue("/response/legalReviewStatus", "Provider output must remain needs-legal-review."));
    }
    if (response.usedForDecision !== false || response.mayChangeDecision !== false || response.legalAdvice !== false) {
        errors.push(issue("/response/usedForDecision", "Explanation output must have no decision or legal-advice authority."));
    }

    const summary = text(response.summary);
    if (!summary || summary.length > 600) {
        errors.push(issue("/response/summary", "A concise summary of 1 to 600 characters is required."));
    }

    const allowedChunkIds = new Set(array(object(request.retrievalReference).retrievedChunks).map((chunk) => text(object(chunk).chunkId)));
    const rationale = array(response.rationale);
    if (!rationale.length || rationale.length > 8) {
        errors.push(issue("/response/rationale", "Between one and eight grounded rationale items are required."));
    }
    rationale.forEach((itemValue, index) => {
        const item = object(itemValue);
        exactKeys(item, ["statement", "citationChunkIds"], `/response/rationale/${index}`, errors);
        const statement = text(item.statement);
        const citationChunkIds = unique(item.citationChunkIds);
        if (!statement || statement.length > 900) {
            errors.push(issue(`/response/rationale/${index}/statement`, "A grounded statement of 1 to 900 characters is required."));
        }
        if (!citationChunkIds.length) {
            errors.push(issue(`/response/rationale/${index}/citationChunkIds`, "Every rationale item must cite at least one governed chunk."));
        }
        citationChunkIds.forEach((chunkId) => {
            if (!allowedChunkIds.has(chunkId)) {
                errors.push(issue(`/response/rationale/${index}/citationChunkIds`, `Unknown or unapproved citation chunk: ${chunkId}.`));
            }
        });
    });

    const nextSteps = array(response.nextSteps).map(text).filter(Boolean);
    if (nextSteps.length > 6 || nextSteps.some((item) => item.length > 500)) {
        errors.push(issue("/response/nextSteps", "Up to six concise next steps are permitted."));
    }

    const limitations = unique(response.limitations);
    REQUIRED_LIMITATIONS.forEach((required) => {
        if (!limitations.includes(required)) {
            errors.push(issue("/response/limitations", `Required limitation is missing: ${required}`));
        }
    });

    allGeneratedText(response).forEach((value) => {
        FORBIDDEN_TEXT_PATTERNS.forEach((pattern) => {
            if (pattern.test(value)) errors.push(issue("/response", `Definitive or certification wording is not permitted: ${pattern}.`));
        });
    });

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
}

function assertResponse(request, response) {
    const validation = validateLegalExplanationResponse({ request, response });
    if (!validation.valid) throw new LegalExplanationContractError(validation.errors);
    return response;
}

/** Deterministic non-LLM fallback used when no hosted provider is configured. */
export function createDeterministicLegalExplanation(input = {}) {
    const request = object(input.request);
    const reference = object(request.decisionReference);
    const chunks = array(object(request.retrievalReference).retrievedChunks);

    const statusText = {
        "specialist-review": "The deterministic POSH rule produced a specialist-review result.",
        "not-currently-applicable": "The deterministic POSH rule did not trigger the current Internal Committee threshold.",
        "more-information-needed": "The deterministic POSH rule could not be completed because required assessment information is missing."
    }[text(reference.status)] || "The deterministic POSH rule produced the recorded result.";

    const response = {
        contractVersion: LEGAL_EXPLANATION_CONTRACT_VERSION,
        decisionFingerprint: text(reference.decisionFingerprint),
        decisionStatus: text(reference.status),
        reasonCode: text(reference.reasonCode),
        summary: `${statusText} The supporting source material is provided for context only and does not change that result.`,
        rationale: chunks.slice(0, 4).map((chunkValue) => {
            const chunk = object(chunkValue);
            return {
                statement: `The governed retrieval trace includes ${text(chunk.sectionReference)} from ${text(chunk.sourceTitle)} as supporting context for the recorded decision.`,
                citationChunkIds: [text(chunk.chunkId)]
            };
        }),
        nextSteps: reference.status === "more-information-needed"
            ? ["Confirm the missing assessment information before re-running the deterministic rule."]
            : ["Review the cited source passages and obtain qualified legal review before relying on the result as a legal conclusion."],
        limitations: [...REQUIRED_LIMITATIONS],
        legalReviewStatus: "needs-legal-review",
        usedForDecision: false,
        mayChangeDecision: false,
        legalAdvice: false
    };

    return deepFreeze(assertResponse(request, response));
}

/** Run an injected provider and reject any output that crosses the contract. */
export async function runLegalExplanationProvider(input = {}) {
    const source = object(input);
    const request = source.request;
    if (typeof source.generate !== "function") {
        throw new LegalExplanationContractError([issue("/generate", "An injected explanation provider function is required.")]);
    }

    const requestSnapshot = JSON.stringify(request);
    const providerResponse = await source.generate(deepFreeze(clone(request)));
    if (JSON.stringify(request) !== requestSnapshot) {
        throw new LegalExplanationContractError([issue("/request", "The explanation provider mutated the protected request.")]);
    }

    const validated = deepFreeze(assertResponse(request, object(providerResponse)));
    return deepFreeze({
        contractVersion: LEGAL_EXPLANATION_CONTRACT_VERSION,
        explanationStatus: "completed",
        provider: {
            name: text(source.providerName) || "injected-provider",
            model: text(source.model) || "unspecified",
            role: "explanation-only"
        },
        usedForDecision: false,
        mayChangeDecision: false,
        legalAdvice: false,
        decisionFingerprint: text(object(request.decisionReference).decisionFingerprint),
        retrievalFingerprint: text(object(request.retrievalReference).retrievalFingerprint),
        response: validated
    });
}

export async function runLegalExplanationProviderSafely(input = {}) {
    try {
        return Object.freeze({ valid: true, value: await runLegalExplanationProvider(input), errors: Object.freeze([]) });
    } catch (error) {
        const errors = error instanceof LegalExplanationContractError
            ? error.issues
            : Object.freeze([issue("/", error?.message || "Unknown legal explanation error.")]);
        return Object.freeze({ valid: false, value: null, errors });
    }
}

export default Object.freeze({
    version: LEGAL_EXPLANATION_CONTRACT_VERSION,
    requiredLimitations: REQUIRED_LIMITATIONS,
    buildLegalExplanationRequest,
    validateLegalExplanationResponse,
    createDeterministicLegalExplanation,
    runLegalExplanationProvider,
    runLegalExplanationProviderSafely
});
