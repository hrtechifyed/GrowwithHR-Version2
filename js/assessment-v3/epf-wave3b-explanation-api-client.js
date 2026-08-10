/**
 * Privacy-safe browser client for five EPF Wave 3B verification and routing profiles.
 * Only controlled organisation-level statuses, bands and evidence references are sent.
 */
export const EPF_WAVE3B_CLIENT_VERSION = "1.0.0";
export const EPF_WAVE3B_ROUTE_PREFIX = "/api/legal-explanation/feature/";
export const EPF_WAVE3B_RENDER_ORIGIN = "https://growwithhr.onrender.com";
export const EPF_WAVE3B_TIMEOUT_MS = 30_000;

const GITHUB_PAGES_ORIGIN = "https://hrtechifyed.github.io";
const GITHUB_PAGES_PROJECT_PATH = "/GrowwithHR-Version2/";
const REQUIRED_LIMITATIONS = Object.freeze([
    "This explanation does not change the deterministic decision.",
    "The rule and source interpretation remain subject to legal review.",
    "Assessment answers and evidence have not been independently verified."
]);
const object = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const array = (value) => Array.isArray(value) ? value : [];
const text = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

function unwrapSavedRecord(value) {
    const source = object(value);
    const wrapped = object(source.data);
    return Object.keys(wrapped).length ? wrapped : source;
}
function scalar(value, maximumLength = 120) {
    if (["boolean", "number"].includes(typeof value)) return value;
    return text(value).slice(0, maximumLength);
}
function references(value) {
    return [...new Set(array(value).slice(0, 40).map((item) => {
        if (typeof item === "string") return text(item).slice(0, 120);
        const source = object(item);
        return text(source.reference || source.ref || source.id).slice(0, 120);
    }).filter(Boolean))];
}
function copyRequired(answers, definitions) {
    const output = {};
    const missingFields = [];
    definitions.forEach(([key, label, transform = scalar]) => {
        if (!hasOwn(answers, key)) {
            missingFields.push(label);
            return;
        }
        const value = transform(answers[key]);
        const present = value !== null && value !== undefined && value !== "" && (!Array.isArray(value) || value.length > 0);
        if (!present) {
            missingFields.push(label);
            return;
        }
        output[key] = value;
    });
    return Object.freeze({
        ready: missingFields.length === 0,
        answers: missingFields.length ? null : Object.freeze(output),
        missingFields: Object.freeze(missingFields)
    });
}

const ADAPTERS = Object.freeze({
    "feature.legal.epf.wage-ceiling": Object.freeze({
        title: "EPF wage-ceiling source and routing review",
        fields: [
            ["epfWageCeilingSourceStatus", "notified wage-ceiling source status"],
            ["epfStatutoryWageBand", "statutory wage band"],
            ["epfPriorMemberStatus", "prior-member status"],
            ["epfHigherWageContributionStatus", "higher-wage review status"]
        ]
    }),
    "feature.legal.epf.contribution-rate-source": Object.freeze({
        title: "EPF contribution-rate source verification review",
        fields: [
            ["epfDeclaredRateBranch", "declared contribution-rate branch"],
            ["epfOfficialRateBasisStatus", "official rate-basis status"],
            ["epfRateSourceReferenceStatus", "official rate-source reference status"],
            ["epfRateHigherWageStatus", "higher-wage review status"],
            ["epfRateTransitionReviewStatus", "transition and savings review status"]
        ]
    }),
    "feature.legal.eps.membership-routing": Object.freeze({
        title: "EPS membership-routing review",
        fields: [
            ["epsMembershipRoutingStatus", "EPS membership-routing status"],
            ["epsPriorMemberStatus", "prior-member status"],
            ["epsStatutoryWageBand", "statutory wage band"],
            ["epsHigherWageCaseStatus", "higher-wage case review status"],
            ["epsEmployerDiversionControl", "employer-diversion control"]
        ]
    }),
    "feature.legal.eps.pension-control": Object.freeze({
        title: "EPS pension-process control review",
        fields: [
            ["epsMembershipRoutingControl", "membership-routing control"],
            ["epsPensionEmployerDiversionControl", "employer-diversion control"],
            ["epsRecordsControl", "EPS records control"],
            ["epsClaimControl", "EPS claim-process control"],
            ["epsHigherWageEscalationControl", "higher-wage escalation control"],
            ["epsEvidenceReferences", "EPS evidence references", references]
        ]
    }),
    "feature.legal.edli.coverage-control": Object.freeze({
        title: "EDLI coverage and process-control review",
        fields: [
            ["edliMembershipControl", "EDLI membership control"],
            ["edliRateSourceStatus", "current EDLI rate-source status"],
            ["edliContributionControl", "EDLI contribution-process control"],
            ["edliClaimControl", "EDLI claim-process control"],
            ["edliTransitionReviewStatus", "EDLI transition review status"],
            ["edliEvidenceReferences", "EDLI evidence references", references]
        ]
    })
});
export const EPF_WAVE3B_FEATURE_IDS = Object.freeze(Object.keys(ADAPTERS));

export function extractEpfWave3bAnswers(featureId, savedRecord) {
    const adapter = ADAPTERS[text(featureId)];
    if (!adapter) throw new Error("The requested EPF Wave 3B feature has no browser adapter.");
    const answers = object(unwrapSavedRecord(savedRecord).answers);
    return copyRequired(answers, adapter.fields);
}
export function createEpfWave3bPayload(featureId, savedRecord) {
    const extracted = extractEpfWave3bAnswers(featureId, savedRecord);
    if (!extracted.ready) {
        throw new Error(`${ADAPTERS[featureId].title} requires ${extracted.missingFields.join(", ")}.`);
    }
    return Object.freeze({ answers: extracted.answers });
}
function isGitHubPages(runtime) {
    const location = runtime?.location;
    return Boolean(location && location.origin === GITHUB_PAGES_ORIGIN &&
        (location.pathname === "/GrowwithHR-Version2" || location.pathname.startsWith(GITHUB_PAGES_PROJECT_PATH)));
}
export function resolveEpfWave3bEndpoint(featureId, runtime = globalThis, documentObject = runtime?.document) {
    const normalizedFeatureId = text(featureId);
    if (!ADAPTERS[normalizedFeatureId]) throw new Error("The requested EPF Wave 3B feature has no browser adapter.");
    const explicit = text(documentObject?.body?.dataset?.legalExplanationEndpoint || runtime?.GROWWITHHR_LEGAL_EXPLANATION_ENDPOINT);
    const route = `${EPF_WAVE3B_ROUTE_PREFIX}${encodeURIComponent(normalizedFeatureId)}`;
    if (explicit) return explicit.endsWith("/") ? `${explicit}${encodeURIComponent(normalizedFeatureId)}` : explicit;
    return isGitHubPages(runtime) ? `${EPF_WAVE3B_RENDER_ORIGIN}${route}` : route;
}
function assertFalse(source, property) {
    if (object(source)[property] !== false) throw new Error(`The legal explanation response violated ${property}.`);
}
export function validateEpfWave3bResponse(value, expectedFeatureId) {
    const response = object(value);
    const featureId = text(expectedFeatureId);
    if (!ADAPTERS[featureId]) throw new Error("The expected EPF Wave 3B feature has no browser adapter.");
    const decision = object(response.decision);
    const retrieval = object(response.retrieval);
    const explanation = object(response.explanation);
    const generated = object(explanation.response);
    const citations = array(retrieval.citations);
    const citationIds = new Set(citations.map((item) => text(object(item).chunkId)).filter(Boolean));
    if (response.featureId !== featureId || response.lawFamilyId !== "epf-eps-edli" ||
        response.legalReviewStatus !== "needs-legal-review" || response.applicabilityAuthority !== "deterministic-only" ||
        response.providerRole !== "explanation-only") {
        throw new Error("The EPF Wave 3B response did not preserve its feature and authority boundaries.");
    }
    assertFalse(response, "usedForDecision");
    assertFalse(response, "mayChangeDecision");
    if (!["specialist-review", "more-information-needed"].includes(text(decision.status)) ||
        !text(decision.reasonCode) || decision.legalReviewStatus !== "needs-legal-review") {
        throw new Error("The deterministic EPF Wave 3B decision is incomplete.");
    }
    if (retrieval.retrievalStatus !== "completed" || !text(retrieval.decisionFingerprint) ||
        !text(retrieval.retrievalFingerprint) || !citations.length || citationIds.size !== citations.length) {
        throw new Error("The governed EPF Wave 3B retrieval trace is incomplete.");
    }
    if (explanation.explanationStatus !== "completed" || explanation.decisionFingerprint !== retrieval.decisionFingerprint ||
        explanation.retrievalFingerprint !== retrieval.retrievalFingerprint || generated.decisionStatus !== decision.status ||
        generated.reasonCode !== decision.reasonCode || generated.decisionFingerprint !== retrieval.decisionFingerprint ||
        !text(generated.summary) || !array(generated.rationale).length || !array(generated.nextSteps).length ||
        !REQUIRED_LIMITATIONS.every((item) => array(generated.limitations).includes(item))) {
        throw new Error("The generated EPF Wave 3B explanation does not match the protected decision and retrieval trace.");
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
            throw new Error("The generated EPF Wave 3B rationale contains an invalid citation.");
        }
    });
    return response;
}
export async function requestEpfWave3bExplanation(input = {}) {
    const request = object(input);
    const featureId = text(request.featureId);
    const runtime = request.runtime || globalThis;
    const fetchImpl = request.fetchImpl || runtime.fetch;
    if (typeof fetchImpl !== "function") throw new Error("Fetch is unavailable.");
    const endpoint = request.endpoint || resolveEpfWave3bEndpoint(featureId, runtime, request.documentObject);
    const payload = request.payload || createEpfWave3bPayload(featureId, request.savedRecord);
    const controller = new AbortController();
    const timeout = runtime.setTimeout(() => controller.abort(), Number.isInteger(request.timeoutMs) ? request.timeoutMs : EPF_WAVE3B_TIMEOUT_MS);
    try {
        const response = await fetchImpl(endpoint, {
            method: "POST",
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            credentials: "omit",
            cache: "no-store",
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        const body = await response.json();
        if (!response.ok) throw new Error(text(object(body).error?.message) || "The EPF Wave 3B explanation request failed.");
        return validateEpfWave3bResponse(body, featureId);
    } finally {
        runtime.clearTimeout(timeout);
    }
}
export default Object.freeze({
    version: EPF_WAVE3B_CLIENT_VERSION,
    featureIds: EPF_WAVE3B_FEATURE_IDS,
    extractEpfWave3bAnswers,
    createEpfWave3bPayload,
    resolveEpfWave3bEndpoint,
    validateEpfWave3bResponse,
    requestEpfWave3bExplanation
});
