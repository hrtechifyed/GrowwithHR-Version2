/**
 * Shared browser client for governed legal explanations.
 *
 * This module performs no automatic request and writes no browser storage.
 * Feature adapters expose only the minimal answer subset accepted by the
 * corresponding server route.
 */

export const SHARED_LEGAL_EXPLANATION_CLIENT_VERSION = "1.0.0";
export const SHARED_LEGAL_EXPLANATION_ROUTE_PREFIX = "/api/legal-explanation/feature/";
export const SHARED_LEGAL_EXPLANATION_RENDER_ORIGIN = "https://growwithhr.onrender.com";
export const SHARED_LEGAL_EXPLANATION_TIMEOUT_MS = 30_000;

const GITHUB_PAGES_ORIGIN = "https://hrtechifyed.github.io";
const GITHUB_PAGES_PROJECT_PATH = "/GrowwithHR-Version2/";
const POSH_FEATURE_ID = "feature.legal.posh.internal-committee-threshold";
const MAX_INTEGER = 10_000_000;
const MAX_STATE_LENGTH = 120;
const REQUIRED_LIMITATIONS = Object.freeze([
    "This explanation does not change the deterministic decision.",
    "The rule and source interpretation remain subject to legal review.",
    "Assessment answers and evidence have not been independently verified."
]);

const object = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const array = (value) => Array.isArray(value) ? value : [];
const text = (value) => String(value ?? "").trim();

function parseInteger(value) {
    if (typeof value === "number" && Number.isInteger(value)) return value;
    const normalized = text(value);
    if (!/^\d+$/.test(normalized)) return null;
    const parsed = Number.parseInt(normalized, 10);
    return Number.isSafeInteger(parsed) ? parsed : null;
}

function unwrapSavedRecord(value) {
    const source = object(value);
    const wrapped = object(source.data);
    return Object.keys(wrapped).length ? wrapped : source;
}

function poshAdapter(value) {
    const answers = object(unwrapSavedRecord(value).answers);
    const employees = parseInteger(answers.employees);
    const locations = parseInteger(answers.locations);
    const primaryState = text(answers.primaryState);
    const missingFields = [];
    if (employees === null || employees < 0 || employees > MAX_INTEGER) missingFields.push("employee count");
    if (locations === null || locations < 1 || locations > MAX_INTEGER) missingFields.push("operating location count");
    if (!primaryState || primaryState.length > MAX_STATE_LENGTH) missingFields.push("primary operating state");
    return missingFields.length
        ? Object.freeze({ ready: false, answers: null, missingFields: Object.freeze(missingFields) })
        : Object.freeze({
            ready: true,
            answers: Object.freeze({ employees, primaryState, locations }),
            missingFields: Object.freeze([])
        });
}

export const LEGAL_EXPLANATION_FEATURE_ADAPTERS = Object.freeze({
    [POSH_FEATURE_ID]: Object.freeze({
        featureId: POSH_FEATURE_ID,
        lawFamilyId: "posh",
        extract: poshAdapter
    })
});

export function createSharedLegalExplanationPayload(featureId, savedRecord) {
    const adapter = LEGAL_EXPLANATION_FEATURE_ADAPTERS[text(featureId)];
    if (!adapter) throw new Error("The requested legal explanation feature has no browser adapter.");
    const extracted = adapter.extract(savedRecord);
    if (!extracted.ready) {
        throw new Error(`Legal explanation requires ${extracted.missingFields.join(", ")}.`);
    }
    return Object.freeze({ answers: extracted.answers });
}

function isGitHubPages(runtime) {
    const location = runtime?.location;
    return Boolean(
        location &&
        location.origin === GITHUB_PAGES_ORIGIN &&
        (location.pathname === "/GrowwithHR-Version2" ||
            location.pathname.startsWith(GITHUB_PAGES_PROJECT_PATH))
    );
}

export function resolveSharedLegalExplanationEndpoint(featureId, runtime = globalThis, documentObject = runtime?.document) {
    const normalizedFeatureId = text(featureId);
    if (!normalizedFeatureId) throw new Error("A legal feature ID is required.");
    const explicit = text(
        documentObject?.body?.dataset?.legalExplanationEndpoint ||
        runtime?.GROWWITHHR_LEGAL_EXPLANATION_ENDPOINT
    );
    const route = `${SHARED_LEGAL_EXPLANATION_ROUTE_PREFIX}${encodeURIComponent(normalizedFeatureId)}`;
    if (explicit) {
        return explicit.endsWith("/")
            ? `${explicit}${encodeURIComponent(normalizedFeatureId)}`
            : explicit;
    }
    return isGitHubPages(runtime)
        ? `${SHARED_LEGAL_EXPLANATION_RENDER_ORIGIN}${route}`
        : route;
}

function assertFalse(source, property) {
    if (object(source)[property] !== false) {
        throw new Error(`The legal explanation response violated ${property}.`);
    }
}

export function validateSharedLegalExplanationResponse(value, expectedFeatureId) {
    const response = object(value);
    const featureId = text(expectedFeatureId);
    const adapter = LEGAL_EXPLANATION_FEATURE_ADAPTERS[featureId];
    if (!adapter) throw new Error("The expected legal feature has no browser adapter.");
    const decision = object(response.decision);
    const retrieval = object(response.retrieval);
    const explanation = object(response.explanation);
    const generated = object(explanation.response);
    const citations = array(retrieval.citations);
    const citationIds = new Set(citations.map((item) => text(object(item).chunkId)).filter(Boolean));

    if (
        response.featureId !== featureId ||
        response.lawFamilyId !== adapter.lawFamilyId ||
        response.legalReviewStatus !== "needs-legal-review" ||
        response.applicabilityAuthority !== "deterministic-only" ||
        response.providerRole !== "explanation-only"
    ) {
        throw new Error("The legal explanation response did not preserve its feature and authority boundaries.");
    }
    assertFalse(response, "usedForDecision");
    assertFalse(response, "mayChangeDecision");

    if (
        !text(decision.status) ||
        !text(decision.reasonCode) ||
        decision.legalReviewStatus !== "needs-legal-review"
    ) {
        throw new Error("The deterministic legal decision is incomplete.");
    }
    if (
        retrieval.retrievalStatus !== "completed" ||
        !text(retrieval.decisionFingerprint) ||
        !text(retrieval.retrievalFingerprint) ||
        !citations.length ||
        citationIds.size !== citations.length
    ) {
        throw new Error("The governed legal retrieval trace is incomplete.");
    }
    if (
        explanation.explanationStatus !== "completed" ||
        explanation.decisionFingerprint !== retrieval.decisionFingerprint ||
        explanation.retrievalFingerprint !== retrieval.retrievalFingerprint ||
        generated.decisionStatus !== decision.status ||
        generated.reasonCode !== decision.reasonCode ||
        generated.decisionFingerprint !== retrieval.decisionFingerprint ||
        !text(generated.summary) ||
        !array(generated.rationale).length ||
        !array(generated.nextSteps).length ||
        !REQUIRED_LIMITATIONS.every((item) => array(generated.limitations).includes(item))
    ) {
        throw new Error("The generated legal explanation does not match the protected decision and retrieval trace.");
    }
    assertFalse(explanation, "usedForDecision");
    assertFalse(explanation, "mayChangeDecision");
    assertFalse(explanation, "legalAdvice");
    assertFalse(generated, "usedForDecision");
    assertFalse(generated, "mayChangeDecision");
    assertFalse(generated, "legalAdvice");

    array(generated.rationale).forEach((item) => {
        const record = object(item);
        const ids = array(record.citationChunkIds).map(text).filter(Boolean);
        if (!text(record.statement) || !ids.length || !ids.every((id) => citationIds.has(id))) {
            throw new Error("The generated legal rationale contains an invalid citation.");
        }
    });
    return response;
}

export async function requestSharedLegalExplanation(input = {}) {
    const request = object(input);
    const featureId = text(request.featureId);
    const runtime = request.runtime || globalThis;
    const fetchImpl = request.fetchImpl || runtime.fetch;
    if (typeof fetchImpl !== "function") throw new Error("Fetch is unavailable.");
    const endpoint = request.endpoint || resolveSharedLegalExplanationEndpoint(featureId, runtime, request.documentObject);
    const payload = request.payload || createSharedLegalExplanationPayload(featureId, request.savedRecord);
    const controller = new AbortController();
    const timeout = runtime.setTimeout(
        () => controller.abort(),
        Number.isInteger(request.timeoutMs) ? request.timeoutMs : SHARED_LEGAL_EXPLANATION_TIMEOUT_MS
    );
    try {
        const response = await fetchImpl(endpoint, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            credentials: "omit",
            cache: "no-store",
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        const body = await response.json();
        if (!response.ok) {
            throw new Error(text(object(body).error?.message) || "The legal explanation request failed.");
        }
        return validateSharedLegalExplanationResponse(body, featureId);
    } finally {
        runtime.clearTimeout(timeout);
    }
}

export default Object.freeze({
    version: SHARED_LEGAL_EXPLANATION_CLIENT_VERSION,
    createSharedLegalExplanationPayload,
    resolveSharedLegalExplanationEndpoint,
    validateSharedLegalExplanationResponse,
    requestSharedLegalExplanation
});
