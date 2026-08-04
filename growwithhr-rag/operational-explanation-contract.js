/**
 * Provider-neutral operational explanation contract.
 *
 * A deterministic operational recommendation must already exist before this
 * module is called. The module has no network, storage, browser, PDF, email or
 * production-report side effects.
 */

export const OPERATIONAL_EXPLANATION_CONTRACT_VERSION = "1.0.0";

const object = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const array = (value) => Array.isArray(value) ? value : [];
const text = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const unique = (values) => [...new Set(array(values).map(text).filter(Boolean))];
const clone = (value) => JSON.parse(JSON.stringify(value));

export const REQUIRED_OPERATIONAL_LIMITATIONS = Object.freeze([
    "This explanation does not change the deterministic operational recommendation.",
    "This output is general HR guidance and not legal advice.",
    "Assessment answers and supporting evidence have not been independently verified."
]);

const ALLOWED_OPERATIONAL_STATUSES = Object.freeze([
    "recommended",
    "not-triggered",
    "more-information-needed"
]);

const FORBIDDEN_TEXT_PATTERNS = Object.freeze([
    /\blegally required\b/i,
    /\bdefinitely applies\b/i,
    /\bdoes not apply\b/i,
    /\blegally compliant\b/i,
    /\bcertified compliant\b/i,
    /\blegal approval\b/i,
    /\bguaranteed compliance\b/i,
    /\bstatutory conclusion\b/i
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
        message: text(message) || "Operational explanation validation failed."
    });
}

export class OperationalExplanationContractError extends Error {
    constructor(issues) {
        const normalized = Object.freeze(
            array(Array.isArray(issues) ? issues : [issues])
                .filter(Boolean)
                .map((item) => issue(object(item).path, object(item).message))
        );
        super(
            normalized.map((item) => `${item.path}: ${item.message}`).join("\n") ||
            "Operational explanation validation failed."
        );
        this.name = "OperationalExplanationContractError";
        this.issues = normalized;
    }
}

function exactKeys(value, allowed, path, errors) {
    Object.keys(object(value)).forEach((key) => {
        if (!allowed.includes(key)) {
            errors.push(issue(`${path}/${key}`, "Unexpected operational explanation property."));
        }
    });
}

function recommendationReference(value) {
    const recommendation = object(value);
    return deepFreeze({
        featureId: text(recommendation.featureId),
        ruleId: text(recommendation.ruleId),
        ruleVersion: text(recommendation.ruleVersion),
        operationalStatus: text(recommendation.operationalStatus),
        reasonCode: text(recommendation.reasonCode),
        reason: text(recommendation.reason),
        title: text(recommendation.title),
        action: text(recommendation.action),
        timeline: text(recommendation.timeline),
        recommendationFingerprint: text(recommendation.recommendationFingerprint),
        sourceIds: unique(recommendation.sourceIds),
        limitations: unique(recommendation.limitations)
    });
}

function guidanceReference(value) {
    const source = object(value);
    const sources = array(source.sources).map((itemValue) => {
        const item = object(itemValue);
        return {
            id: text(item.id),
            title: text(item.title),
            publisher: text(item.publisher),
            url: text(item.url),
            sourceType: text(item.sourceType),
            official: item.official === true
        };
    });
    return deepFreeze({ sources });
}

function validateInput(recommendationValue, guidanceValue) {
    const errors = [];
    const recommendation = recommendationReference(recommendationValue);
    const guidance = guidanceReference(guidanceValue);

    [
        "featureId",
        "ruleId",
        "ruleVersion",
        "operationalStatus",
        "reasonCode",
        "reason",
        "title",
        "recommendationFingerprint"
    ].forEach((key) => {
        if (!recommendation[key]) {
            errors.push(issue(`/recommendation/${key}`, "A deterministic recommendation value is required."));
        }
    });

    if (!ALLOWED_OPERATIONAL_STATUSES.includes(recommendation.operationalStatus)) {
        errors.push(issue(
            "/recommendation/operationalStatus",
            `Operational status must be one of: ${ALLOWED_OPERATIONAL_STATUSES.join(", ")}.`
        ));
    }

    if (!/^[a-f0-9]{64}$/.test(recommendation.recommendationFingerprint)) {
        errors.push(issue(
            "/recommendation/recommendationFingerprint",
            "A lowercase SHA-256 recommendation fingerprint is required."
        ));
    }

    if (!recommendation.sourceIds.length) {
        errors.push(issue("/recommendation/sourceIds", "At least one governed guidance source is required."));
    }

    const sourceIds = new Set();
    guidance.sources.forEach((source, index) => {
        if (!source.id) errors.push(issue(`/guidance/sources/${index}/id`, "A source ID is required."));
        else if (sourceIds.has(source.id)) {
            errors.push(issue(`/guidance/sources/${index}/id`, "Guidance source IDs must be unique."));
        } else {
            sourceIds.add(source.id);
        }
        if (!source.title || !source.publisher || !source.url) {
            errors.push(issue(`/guidance/sources/${index}`, "Source title, publisher and URL are required."));
        }
        if (source.official !== true) {
            errors.push(issue(`/guidance/sources/${index}/official`, "Only official guidance references are permitted."));
        }
        try {
            if (new URL(source.url).protocol !== "https:") {
                errors.push(issue(`/guidance/sources/${index}/url`, "Guidance source URLs must use HTTPS."));
            }
        } catch (_error) {
            errors.push(issue(`/guidance/sources/${index}/url`, "A valid guidance source URL is required."));
        }
    });

    recommendation.sourceIds.forEach((sourceId) => {
        if (!sourceIds.has(sourceId)) {
            errors.push(issue(
                "/recommendation/sourceIds",
                `Recommendation source "${sourceId}" does not resolve to the guidance source list.`
            ));
        }
    });

    if (errors.length) throw new OperationalExplanationContractError(errors);
    return { recommendation, guidance };
}

/** Build the immutable input supplied to an explanation-only provider. */
export function buildOperationalExplanationRequest(input = {}) {
    const source = object(input);
    const validated = validateInput(source.recommendation, source.guidance);

    return deepFreeze({
        contractVersion: OPERATIONAL_EXPLANATION_CONTRACT_VERSION,
        requestedAt: text(source.requestedAt),
        providerRole: "explanation-only",
        usedForRecommendation: false,
        mayChangeRecommendation: false,
        recommendationAuthority: "none",
        legalAdvice: false,
        recommendationReference: validated.recommendation,
        guidanceReference: validated.guidance,
        instructions: [
            "Explain only the supplied deterministic operational recommendation.",
            "Use only the supplied official guidance references for contextual statements.",
            "Do not add, infer or alter assessment answers, facts or evidence.",
            "Do not change the operational status, reason code or recommendation fingerprint.",
            "Do not present the output as legal advice, legal applicability, certification or compliance approval.",
            "Return only the required structured response."
        ],
        requiredLimitations: [...REQUIRED_OPERATIONAL_LIMITATIONS]
    });
}

function generatedText(response) {
    return [
        text(response.summary),
        ...array(response.rationale).map((item) => text(object(item).statement)),
        ...array(response.nextSteps).map(text),
        ...array(response.limitations).map(text)
    ].filter(Boolean);
}

export function validateOperationalExplanationResponse(input = {}) {
    const source = object(input);
    const request = object(source.request);
    const response = object(source.response);
    const errors = [];

    exactKeys(response, [
        "contractVersion",
        "recommendationFingerprint",
        "operationalStatus",
        "reasonCode",
        "summary",
        "rationale",
        "nextSteps",
        "limitations",
        "usedForRecommendation",
        "mayChangeRecommendation",
        "legalAdvice"
    ], "/response", errors);

    const reference = object(request.recommendationReference);
    const guidanceSources = array(object(request.guidanceReference).sources);
    const allowedSourceIds = new Set(guidanceSources.map((item) => text(object(item).id)).filter(Boolean));

    if (response.contractVersion !== OPERATIONAL_EXPLANATION_CONTRACT_VERSION) {
        errors.push(issue("/response/contractVersion", "Explanation contract version must match the request."));
    }
    if (text(response.recommendationFingerprint) !== text(reference.recommendationFingerprint)) {
        errors.push(issue("/response/recommendationFingerprint", "Provider output cannot change the recommendation fingerprint."));
    }
    if (text(response.operationalStatus) !== text(reference.operationalStatus)) {
        errors.push(issue("/response/operationalStatus", "Provider output cannot change the deterministic operational status."));
    }
    if (text(response.reasonCode) !== text(reference.reasonCode)) {
        errors.push(issue("/response/reasonCode", "Provider output cannot change the deterministic reason code."));
    }
    if (
        response.usedForRecommendation !== false ||
        response.mayChangeRecommendation !== false ||
        response.legalAdvice !== false
    ) {
        errors.push(issue(
            "/response/usedForRecommendation",
            "Explanation output must have no recommendation or legal-advice authority."
        ));
    }

    const summary = text(response.summary);
    if (!summary || summary.length > 600) {
        errors.push(issue("/response/summary", "A concise summary of 1 to 600 characters is required."));
    }

    const rationale = array(response.rationale);
    if (!rationale.length || rationale.length > 6) {
        errors.push(issue("/response/rationale", "Between one and six rationale items are required."));
    }
    rationale.forEach((itemValue, index) => {
        const item = object(itemValue);
        exactKeys(item, ["statement", "sourceIds"], `/response/rationale/${index}`, errors);
        const statement = text(item.statement);
        const sourceIds = unique(item.sourceIds);
        if (!statement || statement.length > 900) {
            errors.push(issue(`/response/rationale/${index}/statement`, "A rationale statement of 1 to 900 characters is required."));
        }
        if (!sourceIds.length) {
            errors.push(issue(`/response/rationale/${index}/sourceIds`, "Every rationale item must cite at least one supplied guidance source."));
        }
        sourceIds.forEach((sourceId) => {
            if (!allowedSourceIds.has(sourceId)) {
                errors.push(issue(`/response/rationale/${index}/sourceIds`, `Unknown guidance source: ${sourceId}.`));
            }
        });
    });

    const nextSteps = array(response.nextSteps).map(text).filter(Boolean);
    if (nextSteps.length > 6 || nextSteps.some((item) => item.length > 500)) {
        errors.push(issue("/response/nextSteps", "Up to six concise next steps are permitted."));
    }

    const limitations = unique(response.limitations);
    REQUIRED_OPERATIONAL_LIMITATIONS.forEach((required) => {
        if (!limitations.includes(required)) {
            errors.push(issue("/response/limitations", `Required limitation is missing: ${required}`));
        }
    });

    generatedText(response).forEach((value) => {
        FORBIDDEN_TEXT_PATTERNS.forEach((pattern) => {
            if (pattern.test(value)) {
                errors.push(issue("/response", `Legal or certification wording is not permitted: ${pattern}.`));
            }
        });
    });

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
}

function assertResponse(request, response) {
    const validation = validateOperationalExplanationResponse({ request, response });
    if (!validation.valid) throw new OperationalExplanationContractError(validation.errors);
    return response;
}

/** Deterministic non-LLM fallback for testing and controlled degradation. */
export function createDeterministicOperationalExplanation(input = {}) {
    const request = object(input.request);
    const reference = object(request.recommendationReference);
    const sourceIds = array(object(request.guidanceReference).sources)
        .map((item) => text(object(item).id))
        .filter(Boolean);

    const summaryByStatus = {
        recommended: "The deterministic operational rule recommends action for the supplied assessment context.",
        "not-triggered": "The deterministic operational rule did not trigger this recommendation for the supplied assessment context.",
        "more-information-needed": "The deterministic operational rule needs more assessment information before it can complete this recommendation."
    };

    const response = {
        contractVersion: OPERATIONAL_EXPLANATION_CONTRACT_VERSION,
        recommendationFingerprint: text(reference.recommendationFingerprint),
        operationalStatus: text(reference.operationalStatus),
        reasonCode: text(reference.reasonCode),
        summary: `${summaryByStatus[text(reference.operationalStatus)] || "The deterministic operational rule produced the recorded result."} ${text(reference.reason)}`,
        rationale: [{
            statement: text(reference.reason),
            sourceIds: sourceIds.slice(0, 2)
        }],
        nextSteps: text(reference.action)
            ? [
                text(reference.action),
                ...(text(reference.timeline) ? [`Suggested timing: ${text(reference.timeline)}`] : [])
            ]
            : [],
        limitations: [...REQUIRED_OPERATIONAL_LIMITATIONS],
        usedForRecommendation: false,
        mayChangeRecommendation: false,
        legalAdvice: false
    };

    return deepFreeze(assertResponse(request, response));
}

/** Run an injected provider and reject any output that crosses the contract. */
export async function runOperationalExplanationProvider(input = {}) {
    const source = object(input);
    const request = source.request;
    if (typeof source.generate !== "function") {
        throw new OperationalExplanationContractError([
            issue("/generate", "An injected operational explanation provider function is required.")
        ]);
    }

    const snapshot = JSON.stringify(request);
    const providerResponse = await source.generate(deepFreeze(clone(request)));
    if (JSON.stringify(request) !== snapshot) {
        throw new OperationalExplanationContractError([
            issue("/request", "The explanation provider mutated the protected request.")
        ]);
    }

    const validated = deepFreeze(assertResponse(request, object(providerResponse)));
    return deepFreeze({
        contractVersion: OPERATIONAL_EXPLANATION_CONTRACT_VERSION,
        explanationStatus: "completed",
        provider: {
            name: text(source.providerName) || "injected-provider",
            model: text(source.model) || "unspecified",
            role: "explanation-only"
        },
        usedForRecommendation: false,
        mayChangeRecommendation: false,
        legalAdvice: false,
        recommendationFingerprint: text(object(request.recommendationReference).recommendationFingerprint),
        response: validated
    });
}

export async function runOperationalExplanationProviderSafely(input = {}) {
    try {
        return Object.freeze({
            valid: true,
            value: await runOperationalExplanationProvider(input),
            errors: Object.freeze([])
        });
    } catch (error) {
        return Object.freeze({
            valid: false,
            value: null,
            errors: error instanceof OperationalExplanationContractError
                ? error.issues
                : Object.freeze([issue("/provider", text(error?.message) || "Operational explanation provider failed.")])
        });
    }
}

export default Object.freeze({
    version: OPERATIONAL_EXPLANATION_CONTRACT_VERSION,
    requiredLimitations: REQUIRED_OPERATIONAL_LIMITATIONS,
    buildOperationalExplanationRequest,
    validateOperationalExplanationResponse,
    createDeterministicOperationalExplanation,
    runOperationalExplanationProvider,
    runOperationalExplanationProviderSafely
});
