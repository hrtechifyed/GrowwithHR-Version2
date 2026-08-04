"use strict";

const crypto = require("crypto");
const path = require("path");
const { pathToFileURL } = require("url");

const RECOMMENDATION_CATALOG = require("./data/assessment/recommendation-rules.v1.json");
const {
    CloudflareWorkersAIProviderError,
    runCloudflareWorkersAIOperationalExplanation
} = require("./growwithhr-rag/cloudflare-workers-ai-operational-provider.cjs");

const ROUTE = "/api/operational-explanation";
const ENDPOINT_VERSION = "1.0.0";
const MAX_REQUEST_BYTES = 24 * 1024;
const DEFAULT_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const DEFAULT_FAILURE_BACKOFF_MS = 60 * 1000;
const DEFAULT_MAX_CONCURRENCY = 4;
const DEFAULT_MAX_QUEUE = 100;
const ALLOWED_BODY_KEYS = new Set(["featureId", "answers"]);

const SUPPORTED_FEATURES = Object.freeze({
    "feature.advisory.employment-documentation": Object.freeze({
        ruleId: "rule.governance.employment-documentation.review",
        answerKeys: Object.freeze(["employees"])
    }),
    "feature.advisory.multi-location-workplace": Object.freeze({
        ruleId: "rule.workplace.multi-location.review",
        answerKeys: Object.freeze(["locations"])
    }),
    "feature.advisory.distributed-workforce": Object.freeze({
        ruleId: "rule.workforce.distributed-workforce.review",
        answerKeys: Object.freeze(["workModel", "remoteBand", "remoteExact"])
    }),
    "feature.advisory.workforce-planning": Object.freeze({
        ruleId: "rule.growth.rapid-change.workforce-planning",
        answerKeys: Object.freeze(["hiringPlans", "expansionPlans"])
    }),
    "feature.advisory.people-governance-ownership": Object.freeze({
        ruleId: "rule.people.ownership.formal-function-review",
        answerKeys: Object.freeze(["peopleFunction"])
    }),
    "feature.advisory.policies-compliance-priority": Object.freeze({
        ruleId: "rule.people.priority.policies-compliance",
        answerKeys: Object.freeze(["priorities"])
    })
});

const cleanText = (value) => String(value ?? "").trim();
const object = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const clone = (value) => JSON.parse(JSON.stringify(value));

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
}

function boundedInteger(value, fallback, minimum, maximum) {
    const parsed = Number.parseInt(cleanText(value), 10);
    return Number.isInteger(parsed)
        ? Math.min(maximum, Math.max(minimum, parsed))
        : fallback;
}

class OperationalExplanationEndpointError extends Error {
    constructor(message, options = {}) {
        super(cleanText(message) || "The operational explanation request failed.");
        this.name = "OperationalExplanationEndpointError";
        this.code = cleanText(options.code) || "operational-explanation-error";
        this.status = Number.isInteger(options.status) ? options.status : 500;
        this.retryable = options.retryable === true;
        this.publicMessage = cleanText(options.publicMessage) || this.message;
    }
}

function operationalExplanationEndpointConfig(environment = process.env) {
    const env = object(environment);
    const explicitEnabled = cleanText(env.OPERATIONAL_EXPLANATION_ENDPOINT_ENABLED);
    const inheritedEnabled = cleanText(env.LEGAL_EXPLANATION_ENDPOINT_ENABLED);
    return deepFreeze({
        enabled: cleanText(explicitEnabled || inheritedEnabled).toLowerCase() === "true",
        cacheTtlMs: boundedInteger(
            env.OPERATIONAL_EXPLANATION_CACHE_TTL_MS || env.LEGAL_EXPLANATION_CACHE_TTL_MS,
            DEFAULT_CACHE_TTL_MS,
            5 * 60 * 1000,
            24 * 60 * 60 * 1000
        ),
        failureBackoffMs: boundedInteger(
            env.OPERATIONAL_EXPLANATION_FAILURE_BACKOFF_MS || env.LEGAL_EXPLANATION_FAILURE_BACKOFF_MS,
            DEFAULT_FAILURE_BACKOFF_MS,
            5 * 1000,
            5 * 60 * 1000
        ),
        maxConcurrency: boundedInteger(
            env.OPERATIONAL_EXPLANATION_MAX_CONCURRENCY || env.LEGAL_EXPLANATION_MAX_CONCURRENCY,
            DEFAULT_MAX_CONCURRENCY,
            1,
            20
        ),
        maxQueue: boundedInteger(
            env.OPERATIONAL_EXPLANATION_MAX_QUEUE || env.LEGAL_EXPLANATION_MAX_QUEUE,
            DEFAULT_MAX_QUEUE,
            1,
            500
        )
    });
}

function invalidInput(message) {
    return new OperationalExplanationEndpointError(message, {
        code: "operational-explanation-invalid-input",
        status: 400,
        publicMessage: message
    });
}

function normalizeOptionalInteger(value, fieldName, minimum, maximum = 10000000) {
    if (value === undefined || value === null || cleanText(value) === "") return undefined;
    const normalized = typeof value === "string" && /^\d+$/.test(value.trim())
        ? Number(value.trim())
        : value;
    if (!Number.isInteger(normalized) || normalized < minimum || normalized > maximum) {
        throw invalidInput(`${fieldName} must be a whole number between ${minimum} and ${maximum}.`);
    }
    return normalized;
}

function normalizeOptionalText(value, fieldName, maximum = 160) {
    if (value === undefined || value === null) return undefined;
    const normalized = cleanText(value);
    if (!normalized) return undefined;
    if (normalized.length > maximum) {
        throw invalidInput(`${fieldName} must contain no more than ${maximum} characters.`);
    }
    return normalized;
}

function normalizeOptionalTextArray(value, fieldName) {
    if (value === undefined || value === null) return undefined;
    if (!Array.isArray(value)) throw invalidInput(`${fieldName} must be an array of text values.`);
    if (value.length > 20) throw invalidInput(`${fieldName} must contain no more than 20 values.`);
    const normalized = [
        ...new Set(
            value.map((item) => normalizeOptionalText(item, fieldName, 120)).filter(Boolean)
        )
    ];
    return normalized.length ? normalized : undefined;
}

function normalizeAnswer(key, value) {
    switch (key) {
        case "employees":
            return normalizeOptionalInteger(value, key, 0);
        case "locations":
            return normalizeOptionalInteger(value, key, 1);
        case "remoteExact":
            return normalizeOptionalInteger(value, key, 0, 100);
        case "workModel":
        case "remoteBand":
        case "hiringPlans":
        case "peopleFunction":
            return normalizeOptionalText(value, key, 160);
        case "expansionPlans":
        case "priorities":
            return normalizeOptionalTextArray(value, key);
        default:
            throw invalidInput(`Unsupported assessment field: ${key}.`);
    }
}

function normalizeAnswers(value, feature) {
    const answers = object(value);
    const allowed = new Set(feature.answerKeys);
    const unknown = Object.keys(answers).filter((key) => !allowed.has(key));
    if (unknown.length) throw invalidInput(`Unsupported assessment fields: ${unknown.join(", ")}.`);

    const normalized = {};
    feature.answerKeys.forEach((key) => {
        const valueForKey = normalizeAnswer(key, answers[key]);
        if (valueForKey !== undefined) normalized[key] = valueForKey;
    });
    return deepFreeze(normalized);
}

function normalizeBody(value) {
    const body = object(value);
    const unknown = Object.keys(body).filter((key) => !ALLOWED_BODY_KEYS.has(key));
    if (unknown.length) throw invalidInput(`Unsupported request properties: ${unknown.join(", ")}.`);

    const featureId = cleanText(body.featureId);
    const feature = SUPPORTED_FEATURES[featureId];
    if (!feature) {
        throw invalidInput(`Unsupported operational feature: ${featureId || "missing featureId"}.`);
    }
    if (!Object.hasOwn(body, "answers") || !body.answers || typeof body.answers !== "object" || Array.isArray(body.answers)) {
        throw invalidInput("A JSON answers object is required.");
    }

    return deepFreeze({
        featureId,
        answers: normalizeAnswers(body.answers, feature)
    });
}

function moduleUrl(...segments) {
    return pathToFileURL(path.join(__dirname, ...segments)).href;
}

let operationalModulesPromise = null;
function loadOperationalModules() {
    if (!operationalModulesPromise) {
        operationalModulesPromise = Promise.all([
            import(moduleUrl("js", "assessment-v3", "fact-mapper.js")),
            import(moduleUrl("js", "assessment-v3", "recommendation-evaluator.js")),
            import(moduleUrl("growwithhr-rag", "operational-explanation-contract.js"))
        ]).then(([factMapper, evaluator, contract]) => Object.freeze({
            factMapper,
            evaluator,
            contract
        }));
    }
    return operationalModulesPromise;
}

function createConcurrencyGate(limit, maxQueue) {
    let active = 0;
    const queue = [];

    function launch(entry) {
        active += 1;
        Promise.resolve()
            .then(entry.task)
            .then(entry.resolve, entry.reject)
            .finally(() => {
                active -= 1;
                const next = queue.shift();
                if (next) launch(next);
            });
    }

    return Object.freeze({
        run(task) {
            if (active < limit) {
                return new Promise((resolve, reject) => launch({ task, resolve, reject }));
            }
            if (queue.length >= maxQueue) {
                return Promise.reject(new OperationalExplanationEndpointError(
                    "The free operational explanation queue is currently full.",
                    {
                        code: "operational-explanation-queue-full",
                        status: 503,
                        retryable: true,
                        publicMessage: "The free explanation service is busy. Please try again shortly."
                    }
                ));
            }
            return new Promise((resolve, reject) => queue.push({ task, resolve, reject }));
        },
        stats: () => Object.freeze({ active, queued: queue.length, limit, maxQueue })
    });
}

function operationalStatus(outcome) {
    return {
        matched: "recommended",
        notMatched: "not-triggered",
        missing: "more-information-needed"
    }[cleanText(outcome)] || "more-information-needed";
}

function reasonCode(featureId, status) {
    const prefix = featureId
        .replace(/^feature\.advisory\./, "")
        .replace(/[^a-z0-9]+/gi, "_")
        .replace(/^_+|_+$/g, "")
        .toUpperCase();
    const suffix = {
        recommended: "RECOMMENDED",
        "not-triggered": "NOT_TRIGGERED",
        "more-information-needed": "MORE_INFORMATION_NEEDED"
    }[status];
    return `${prefix}_${suffix}`;
}

function sourceView(value) {
    const source = object(value);
    return deepFreeze({
        id: cleanText(source.id),
        title: cleanText(source.title),
        publisher: cleanText(source.publisher),
        url: cleanText(source.url),
        sourceType: cleanText(source.sourceType),
        official: source.official === true
    });
}

function fingerprint(value) {
    return crypto
        .createHash("sha256")
        .update(JSON.stringify(value))
        .digest("hex");
}

function resolveDeterministicRecommendation({ featureId, traceability }) {
    const feature = SUPPORTED_FEATURES[featureId];
    const rule = RECOMMENDATION_CATALOG.rules.find((item) => item.id === feature.ruleId);
    const evaluation = traceability.ruleEvaluations.find((item) => item.ruleId === feature.ruleId);
    const recommendation = traceability.recommendations.find((item) => item.ruleId === feature.ruleId) || null;

    if (!rule || !evaluation) {
        throw new OperationalExplanationEndpointError(
            "The deterministic operational rule was not uniquely resolved.",
            {
                code: "operational-explanation-rule-unavailable",
                status: 500,
                publicMessage: "The operational explanation could not be prepared."
            }
        );
    }

    const outcome = cleanText(object(evaluation.metadata).outcome);
    const status = operationalStatus(outcome);
    const sources = RECOMMENDATION_CATALOG.sources
        .filter((item) => rule.sourceIds.includes(item.id))
        .map(sourceView);
    if (!sources.length || sources.some((item) => !item.id || !item.title || !item.publisher || !item.url || !item.official)) {
        throw new OperationalExplanationEndpointError(
            "The operational rule does not resolve to governed official guidance references.",
            {
                code: "operational-explanation-guidance-unavailable",
                status: 500,
                publicMessage: "The operational explanation could not be prepared."
            }
        );
    }

    const normalized = {
        featureId,
        ruleId: cleanText(evaluation.ruleId),
        ruleVersion: cleanText(evaluation.ruleVersion),
        operationalStatus: status,
        reasonCode: reasonCode(featureId, status),
        reason: cleanText(evaluation.reason),
        title: cleanText(recommendation?.title || rule.title),
        action: cleanText(recommendation?.action),
        timeline: cleanText(recommendation?.timeline),
        sourceIds: sources.map((item) => item.id),
        limitations: Array.isArray(recommendation?.limitations)
            ? [...recommendation.limitations]
            : [...(RECOMMENDATION_CATALOG.defaults?.limitations || [])],
        triggeringFactIds: Array.isArray(evaluation.triggeringFactIds)
            ? [...evaluation.triggeringFactIds]
            : [],
        missingFactIds: Array.isArray(evaluation.missingFactIds)
            ? [...evaluation.missingFactIds]
            : []
    };

    const recommendationFingerprint = fingerprint({
        featureId: normalized.featureId,
        ruleId: normalized.ruleId,
        ruleVersion: normalized.ruleVersion,
        operationalStatus: normalized.operationalStatus,
        reasonCode: normalized.reasonCode,
        reason: normalized.reason,
        title: normalized.title,
        action: normalized.action,
        timeline: normalized.timeline,
        sourceIds: normalized.sourceIds,
        triggeringFactIds: normalized.triggeringFactIds,
        missingFactIds: normalized.missingFactIds
    });

    return deepFreeze({
        recommendation: deepFreeze({
            ...normalized,
            recommendationFingerprint
        }),
        guidance: deepFreeze({ sources })
    });
}

function envelope(recommendation, guidance, explanation) {
    return deepFreeze({
        endpointVersion: ENDPOINT_VERSION,
        featureId: recommendation.featureId,
        recommendationAuthority: "deterministic-operational",
        providerRole: "explanation-only",
        usedForRecommendation: false,
        mayChangeRecommendation: false,
        legalAdvice: false,
        recommendation: clone(recommendation),
        guidance: clone(guidance),
        explanation
    });
}

function withDelivery(value, cacheStatus) {
    return deepFreeze({
        ...clone(value),
        delivery: {
            cacheStatus,
            providerRequestsForThisResponse: cacheStatus === "miss" ? 1 : 0
        }
    });
}

function endpointErrorFromProvider(error) {
    if (error instanceof OperationalExplanationEndpointError) return error;
    const code = cleanText(error?.code);

    if (code === "cloudflare-free-quota-or-rate-limit") {
        return new OperationalExplanationEndpointError("Cloudflare free capacity is unavailable.", {
            code,
            status: 429,
            retryable: true,
            publicMessage: "The free explanation allowance is currently unavailable. Please try again later."
        });
    }
    if (["cloudflare-timeout", "cloudflare-network-error", "cloudflare-service-unavailable"].includes(code)) {
        return new OperationalExplanationEndpointError("Cloudflare Workers AI is temporarily unavailable.", {
            code,
            status: 503,
            retryable: true,
            publicMessage: "The free explanation service is temporarily unavailable. Please try again later."
        });
    }
    if (["cloudflare-configuration-missing", "cloudflare-authentication-failed"].includes(code)) {
        return new OperationalExplanationEndpointError("The Cloudflare provider is not configured.", {
            code,
            status: 503,
            publicMessage: "The explanation service is not available on this deployment."
        });
    }
    if (
        error instanceof CloudflareWorkersAIProviderError ||
        error?.name === "OperationalExplanationContractError"
    ) {
        return new OperationalExplanationEndpointError(
            "The provider output failed the governed operational explanation contract.",
            {
                code: code || "operational-explanation-provider-output-rejected",
                status: 502,
                publicMessage: "The generated explanation could not be accepted."
            }
        );
    }
    return new OperationalExplanationEndpointError("The operational explanation service failed.", {
        code: "operational-explanation-internal-error",
        status: 500,
        publicMessage: "The explanation service could not complete this request."
    });
}

function createOperationalExplanationService(options = {}) {
    const source = object(options);
    const environment = source.environment || process.env;
    const config = source.config || operationalExplanationEndpointConfig(environment);
    const modulesLoader = source.modulesLoader || loadOperationalModules;
    const now = typeof source.now === "function" ? source.now : () => new Date();
    const providerRunner = typeof source.providerRunner === "function"
        ? source.providerRunner
        : ({ contract, request }) => runCloudflareWorkersAIOperationalExplanation({
            contract,
            request,
            environment,
            fetchImpl: source.fetchImpl
        });
    const gate = createConcurrencyGate(config.maxConcurrency, config.maxQueue);
    const cache = new Map();
    const failures = new Map();
    const inFlight = new Map();

    function prune(currentTime) {
        for (const [key, item] of cache) if (item.expiresAt <= currentTime) cache.delete(key);
        for (const [key, item] of failures) if (item.expiresAt <= currentTime) failures.delete(key);
    }

    async function explain(bodyValue) {
        if (config.enabled !== true) {
            throw new OperationalExplanationEndpointError("The operational explanation endpoint is disabled.", {
                code: "operational-explanation-endpoint-disabled",
                status: 404,
                publicMessage: "Not found."
            });
        }

        const body = normalizeBody(bodyValue);
        const evaluatedAt = now().toISOString();
        const modules = await modulesLoader();
        const facts = modules.factMapper.createTraceabilityFacts(body.answers, {
            recordedAt: evaluatedAt
        });
        const traceability = modules.evaluator.evaluateRecommendationRules({
            facts,
            catalog: RECOMMENDATION_CATALOG,
            evaluatedAt,
            generatedAt: evaluatedAt,
            metadata: {
                source: "operational-explanation-endpoint",
                stableReportMutation: false
            }
        });
        const resolved = resolveDeterministicRecommendation({
            featureId: body.featureId,
            traceability
        });
        const request = modules.contract.buildOperationalExplanationRequest({
            recommendation: resolved.recommendation,
            guidance: resolved.guidance,
            requestedAt: evaluatedAt
        });
        const key = resolved.recommendation.recommendationFingerprint;
        const currentTime = now().getTime();
        prune(currentTime);

        const cached = cache.get(key);
        if (cached) return withDelivery(cached.value, "hit");
        const failed = failures.get(key);
        if (failed) throw failed.error;
        const existing = inFlight.get(key);
        if (existing) return withDelivery(await existing, "shared");

        const pending = gate.run(async () => {
            try {
                const explanation = await providerRunner({
                    contract: modules.contract,
                    request,
                    recommendation: resolved.recommendation,
                    guidance: resolved.guidance
                });
                const value = envelope(
                    resolved.recommendation,
                    resolved.guidance,
                    explanation
                );
                cache.set(key, {
                    value,
                    expiresAt: now().getTime() + config.cacheTtlMs
                });
                return value;
            } catch (error) {
                const endpointError = endpointErrorFromProvider(error);
                failures.set(key, {
                    error: endpointError,
                    expiresAt: now().getTime() + config.failureBackoffMs
                });
                throw endpointError;
            } finally {
                inFlight.delete(key);
            }
        });

        inFlight.set(key, pending);
        return withDelivery(await pending, "miss");
    }

    return Object.freeze({
        explain,
        config,
        stats: () => deepFreeze({
            cacheEntries: cache.size,
            failureEntries: failures.size,
            inFlight: inFlight.size,
            gate: gate.stats()
        })
    });
}

function readJsonBody(request) {
    return new Promise((resolve, reject) => {
        const contentType = cleanText(request.headers["content-type"]).toLowerCase();
        if (!contentType.startsWith("application/json")) {
            reject(new OperationalExplanationEndpointError("Content-Type must be application/json.", {
                code: "operational-explanation-content-type-required",
                status: 415,
                publicMessage: "Content-Type must be application/json."
            }));
            return;
        }

        const declaredLength = Number.parseInt(cleanText(request.headers["content-length"]), 10);
        if (Number.isInteger(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
            reject(new OperationalExplanationEndpointError("The request body is too large.", {
                code: "operational-explanation-request-too-large",
                status: 413,
                publicMessage: "The request body is too large."
            }));
            request.resume();
            return;
        }

        const chunks = [];
        let received = 0;
        let settled = false;
        const fail = (error) => {
            if (settled) return;
            settled = true;
            reject(error);
        };

        request.on("data", (chunk) => {
            if (settled) return;
            received += chunk.length;
            if (received > MAX_REQUEST_BYTES) {
                fail(new OperationalExplanationEndpointError("The request body is too large.", {
                    code: "operational-explanation-request-too-large",
                    status: 413,
                    publicMessage: "The request body is too large."
                }));
                return;
            }
            chunks.push(chunk);
        });

        request.on("end", () => {
            if (settled) return;
            settled = true;
            try {
                resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
            } catch (_error) {
                reject(new OperationalExplanationEndpointError("The request body must contain valid JSON.", {
                    code: "operational-explanation-invalid-json",
                    status: 400,
                    publicMessage: "The request body must contain valid JSON."
                }));
            }
        });

        request.on("error", () => fail(new OperationalExplanationEndpointError(
            "The request body could not be read.",
            {
                code: "operational-explanation-request-read-failed",
                status: 400,
                publicMessage: "The request body could not be read."
            }
        )));
    });
}

function writeJson(response, status, payload) {
    response.statusCode = status;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.setHeader("Cache-Control", "no-store");
    response.end(JSON.stringify(payload));
}

function errorPayload(error) {
    const endpointError = endpointErrorFromProvider(error);
    return {
        status: endpointError.status,
        payload: {
            error: {
                code: endpointError.code,
                message: endpointError.publicMessage,
                retryable: endpointError.retryable
            },
            recommendationAuthority: "deterministic-operational",
            usedForRecommendation: false,
            legalAdvice: false
        }
    };
}

function createOperationalExplanationRequestHandler(options = {}) {
    const service = options.service || createOperationalExplanationService(options);
    return function handleOperationalExplanationRequest(request, response) {
        if (cleanText(request.url).split("?")[0] !== ROUTE) return false;

        if (request.method !== "POST") {
            response.setHeader("Allow", "POST, OPTIONS");
            writeJson(response, 405, {
                error: {
                    code: "operational-explanation-method-not-allowed",
                    message: "Only POST is supported.",
                    retryable: false
                }
            });
            return true;
        }

        (async () => {
            try {
                const body = await readJsonBody(request);
                writeJson(response, 200, await service.explain(body));
            } catch (error) {
                const failure = errorPayload(error);
                writeJson(response, failure.status, failure.payload);
            }
        })();
        return true;
    };
}

let defaultHandler = null;
function handleOperationalExplanationRequest(request, response) {
    if (!defaultHandler) defaultHandler = createOperationalExplanationRequestHandler();
    return defaultHandler(request, response);
}

module.exports = Object.freeze({
    ROUTE,
    ENDPOINT_VERSION,
    MAX_REQUEST_BYTES,
    SUPPORTED_FEATURES,
    OperationalExplanationEndpointError,
    operationalExplanationEndpointConfig,
    normalizeBody,
    createConcurrencyGate,
    resolveDeterministicRecommendation,
    createOperationalExplanationService,
    createOperationalExplanationRequestHandler,
    handleOperationalExplanationRequest
});
