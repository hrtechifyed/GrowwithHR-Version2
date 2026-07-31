"use strict";

const path = require("path");
const { pathToFileURL } = require("url");

const LEGAL_RULE_CATALOG = require("./data/assessment/legal-applicability-rules.v1.json");
const RETRIEVAL_CATALOG = require("./growwithhr-rag/data/posh-source-chunks.v1.json");
const {
    CloudflareWorkersAIProviderError,
    runCloudflareWorkersAILegalExplanation
} = require("./growwithhr-rag/cloudflare-workers-ai-provider.cjs");

const ROUTE = "/api/legal-explanation/posh";
const ENDPOINT_VERSION = "0.1.0";
const MAX_REQUEST_BYTES = 16 * 1024;
const DEFAULT_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const DEFAULT_FAILURE_BACKOFF_MS = 60 * 1000;
const DEFAULT_MAX_CONCURRENCY = 4;
const DEFAULT_MAX_QUEUE = 100;
const ALLOWED_BODY_KEYS = new Set(["answers"]);
const ALLOWED_ANSWER_KEYS = new Set(["employees", "primaryState", "locations"]);

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

class LegalExplanationEndpointError extends Error {
    constructor(message, options = {}) {
        super(cleanText(message) || "The legal explanation request failed.");
        this.name = "LegalExplanationEndpointError";
        this.code = cleanText(options.code) || "legal-explanation-error";
        this.status = Number.isInteger(options.status) ? options.status : 500;
        this.retryable = options.retryable === true;
        this.publicMessage = cleanText(options.publicMessage) || this.message;
    }
}

function legalExplanationEndpointConfig(environment = process.env) {
    const env = object(environment);
    return deepFreeze({
        enabled: cleanText(env.LEGAL_EXPLANATION_ENDPOINT_ENABLED).toLowerCase() === "true",
        cacheTtlMs: boundedInteger(
            env.LEGAL_EXPLANATION_CACHE_TTL_MS,
            DEFAULT_CACHE_TTL_MS,
            5 * 60 * 1000,
            24 * 60 * 60 * 1000
        ),
        failureBackoffMs: boundedInteger(
            env.LEGAL_EXPLANATION_FAILURE_BACKOFF_MS,
            DEFAULT_FAILURE_BACKOFF_MS,
            5 * 1000,
            5 * 60 * 1000
        ),
        maxConcurrency: boundedInteger(
            env.LEGAL_EXPLANATION_MAX_CONCURRENCY,
            DEFAULT_MAX_CONCURRENCY,
            1,
            20
        ),
        maxQueue: boundedInteger(
            env.LEGAL_EXPLANATION_MAX_QUEUE,
            DEFAULT_MAX_QUEUE,
            1,
            500
        )
    });
}

function invalidInput(message) {
    return new LegalExplanationEndpointError(message, {
        code: "legal-explanation-invalid-input",
        status: 400,
        publicMessage: message
    });
}

function normalizeOptionalInteger(value, fieldName, minimum) {
    if (value === undefined || value === null || cleanText(value) === "") return undefined;
    const normalized = typeof value === "string" && /^\d+$/.test(value.trim())
        ? Number(value.trim())
        : value;
    if (!Number.isInteger(normalized) || normalized < minimum || normalized > 10000000) {
        throw invalidInput(`${fieldName} must be a whole number of at least ${minimum}.`);
    }
    return normalized;
}

function normalizeAnswers(value) {
    const answers = object(value);
    const unknown = Object.keys(answers).filter((key) => !ALLOWED_ANSWER_KEYS.has(key));
    if (unknown.length) throw invalidInput(`Unsupported assessment fields: ${unknown.join(", ")}.`);

    const employees = normalizeOptionalInteger(answers.employees, "employees", 0);
    const locations = normalizeOptionalInteger(answers.locations, "locations", 1);
    const primaryState = answers.primaryState === undefined || answers.primaryState === null
        ? undefined
        : cleanText(answers.primaryState);
    if (primaryState && primaryState.length > 120) {
        throw invalidInput("primaryState must contain no more than 120 characters.");
    }

    return deepFreeze({
        ...(employees === undefined ? {} : { employees }),
        ...(primaryState ? { primaryState } : {}),
        ...(locations === undefined ? {} : { locations })
    });
}

function normalizeBody(value) {
    const body = object(value);
    const unknown = Object.keys(body).filter((key) => !ALLOWED_BODY_KEYS.has(key));
    if (unknown.length) throw invalidInput(`Unsupported request properties: ${unknown.join(", ")}.`);
    if (!Object.hasOwn(body, "answers") || !body.answers || typeof body.answers !== "object" || Array.isArray(body.answers)) {
        throw invalidInput("A JSON answers object is required.");
    }
    return deepFreeze({ answers: normalizeAnswers(body.answers) });
}

function moduleUrl(...segments) {
    return pathToFileURL(path.join(__dirname, ...segments)).href;
}

let legalModulesPromise = null;
function loadLegalModules() {
    if (!legalModulesPromise) {
        legalModulesPromise = Promise.all([
            import(moduleUrl("js", "assessment-v3", "legal-rule-assurance.js")),
            import(moduleUrl("growwithhr-rag", "legal-source-retrieval.js")),
            import(moduleUrl("growwithhr-rag", "legal-explanation-contract.js"))
        ]).then(([assurance, retrieval, contract]) => Object.freeze({
            assurance,
            retrieval,
            contract
        }));
    }
    return legalModulesPromise;
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
                return Promise.reject(new LegalExplanationEndpointError(
                    "The free explanation queue is currently full.",
                    {
                        code: "legal-explanation-queue-full",
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

function decisionView(value) {
    const decision = object(value);
    return deepFreeze({
        productRuleId: cleanText(decision.productRuleId),
        ruleId: cleanText(decision.ruleId),
        ruleVersion: cleanText(decision.ruleVersion),
        sourceRecordId: cleanText(decision.sourceRecordId),
        status: cleanText(decision.status),
        reasonCode: cleanText(decision.reasonCode),
        reason: cleanText(decision.reason),
        sourceRegistryIds: Array.isArray(decision.sourceRegistryIds) ? [...decision.sourceRegistryIds] : [],
        sourceSections: Array.isArray(decision.sourceSections) ? clone(decision.sourceSections) : [],
        legalReviewStatus: cleanText(decision.legalReviewStatus),
        limitations: Array.isArray(decision.limitations) ? [...decision.limitations] : []
    });
}

function citationView(value) {
    const chunk = object(value);
    return deepFreeze({
        chunkId: cleanText(chunk.chunkId),
        registrySourceId: cleanText(chunk.registrySourceId),
        sourceTitle: cleanText(chunk.sourceTitle),
        sectionReference: cleanText(chunk.sectionReference),
        pageStart: chunk.pageStart,
        pageEnd: chunk.pageEnd,
        officialUrl: cleanText(chunk.officialUrl),
        contentSha256: cleanText(chunk.contentSha256)
    });
}

function baseEnvelope(decision, retrievalTrace, explanation) {
    return deepFreeze({
        endpointVersion: ENDPOINT_VERSION,
        lawId: "posh",
        legalReviewStatus: "needs-legal-review",
        applicabilityAuthority: "deterministic-only",
        providerRole: "explanation-only",
        usedForDecision: false,
        mayChangeDecision: false,
        decision: decisionView(decision),
        retrieval: {
            retrievalStatus: cleanText(retrievalTrace.retrievalStatus),
            decisionFingerprint: cleanText(retrievalTrace.decisionFingerprint),
            retrievalFingerprint: cleanText(retrievalTrace.retrievalFingerprint),
            citations: Array.isArray(retrievalTrace.retrievedChunks)
                ? retrievalTrace.retrievedChunks.map(citationView)
                : []
        },
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

function cacheKey(retrievalTrace) {
    return `${cleanText(retrievalTrace.decisionFingerprint)}:${cleanText(retrievalTrace.retrievalFingerprint)}`;
}

function endpointErrorFromProvider(error) {
    if (error instanceof LegalExplanationEndpointError) return error;
    const code = cleanText(error?.code);

    if (code === "cloudflare-free-quota-or-rate-limit") {
        return new LegalExplanationEndpointError("Cloudflare free capacity is unavailable.", {
            code,
            status: 429,
            retryable: true,
            publicMessage: "The free explanation allowance is currently unavailable. Please try again later."
        });
    }
    if (["cloudflare-timeout", "cloudflare-network-error", "cloudflare-service-unavailable"].includes(code)) {
        return new LegalExplanationEndpointError("Cloudflare Workers AI is temporarily unavailable.", {
            code,
            status: 503,
            retryable: true,
            publicMessage: "The free explanation service is temporarily unavailable. Please try again later."
        });
    }
    if (["cloudflare-configuration-missing", "cloudflare-authentication-failed"].includes(code)) {
        return new LegalExplanationEndpointError("The Cloudflare provider is not configured.", {
            code,
            status: 503,
            publicMessage: "The explanation service is not available on this deployment."
        });
    }
    if (error instanceof CloudflareWorkersAIProviderError || error?.name === "LegalExplanationContractError") {
        return new LegalExplanationEndpointError("The provider output failed the governed explanation contract.", {
            code: code || "legal-explanation-provider-output-rejected",
            status: 502,
            publicMessage: "The generated explanation could not be accepted."
        });
    }
    return new LegalExplanationEndpointError("The legal explanation service failed.", {
        code: "legal-explanation-internal-error",
        status: 500,
        publicMessage: "The explanation service could not complete this request."
    });
}

function createLegalExplanationService(options = {}) {
    const source = object(options);
    const environment = source.environment || process.env;
    const config = source.config || legalExplanationEndpointConfig(environment);
    const modulesLoader = source.modulesLoader || loadLegalModules;
    const now = typeof source.now === "function" ? source.now : () => new Date();
    const providerRunner = typeof source.providerRunner === "function"
        ? source.providerRunner
        : ({ contract, request }) => runCloudflareWorkersAILegalExplanation({
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
            throw new LegalExplanationEndpointError("The legal explanation endpoint is disabled.", {
                code: "legal-explanation-endpoint-disabled",
                status: 404,
                publicMessage: "Not found."
            });
        }

        const body = normalizeBody(bodyValue);
        const evaluatedAt = now().toISOString();
        const modules = await modulesLoader();
        const assurance = modules.assurance.evaluateLegalRuleAssurance({
            answers: body.answers,
            catalog: LEGAL_RULE_CATALOG,
            evaluatedAt
        });
        const decisions = assurance.decisions.filter((item) => item.productRuleId === "posh");
        if (decisions.length !== 1) {
            throw new LegalExplanationEndpointError("The governed POSH decision was not uniquely resolved.", {
                code: "legal-explanation-posh-decision-unavailable",
                status: 500,
                publicMessage: "The POSH explanation could not be prepared."
            });
        }

        const decision = decisions[0];
        const retrievalTrace = modules.retrieval.retrieveLegalDecisionSources({
            decision,
            catalog: RETRIEVAL_CATALOG,
            queryTerms: ["POSH", "Internal Committee", "Local Committee", "commencement"],
            maxChunks: 4
        });
        const request = modules.contract.buildLegalExplanationRequest({
            decision,
            retrievalTrace,
            requestedAt: evaluatedAt
        });
        const key = cacheKey(retrievalTrace);
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
                    decision,
                    retrievalTrace
                });
                const value = baseEnvelope(decision, retrievalTrace, explanation);
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
            reject(new LegalExplanationEndpointError("Content-Type must be application/json.", {
                code: "legal-explanation-content-type-required",
                status: 415,
                publicMessage: "Content-Type must be application/json."
            }));
            return;
        }

        const declaredLength = Number.parseInt(cleanText(request.headers["content-length"]), 10);
        if (Number.isInteger(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
            reject(new LegalExplanationEndpointError("The request body is too large.", {
                code: "legal-explanation-request-too-large",
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
                fail(new LegalExplanationEndpointError("The request body is too large.", {
                    code: "legal-explanation-request-too-large",
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
                reject(new LegalExplanationEndpointError("The request body must contain valid JSON.", {
                    code: "legal-explanation-invalid-json",
                    status: 400,
                    publicMessage: "The request body must contain valid JSON."
                }));
            }
        });

        request.on("error", () => fail(new LegalExplanationEndpointError("The request body could not be read.", {
            code: "legal-explanation-request-read-failed",
            status: 400,
            publicMessage: "The request body could not be read."
        })));
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
            legalReviewStatus: "needs-legal-review",
            usedForDecision: false
        }
    };
}

function createLegalExplanationRequestHandler(options = {}) {
    const service = options.service || createLegalExplanationService(options);
    return function handleLegalExplanationRequest(request, response) {
        if (cleanText(request.url).split("?")[0] !== ROUTE) return false;

        if (request.method !== "POST") {
            response.setHeader("Allow", "POST, OPTIONS");
            writeJson(response, 405, {
                error: {
                    code: "legal-explanation-method-not-allowed",
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
function handleLegalExplanationRequest(request, response) {
    if (!defaultHandler) defaultHandler = createLegalExplanationRequestHandler();
    return defaultHandler(request, response);
}

module.exports = Object.freeze({
    ROUTE,
    ENDPOINT_VERSION,
    MAX_REQUEST_BYTES,
    LegalExplanationEndpointError,
    legalExplanationEndpointConfig,
    normalizeAnswers,
    normalizeBody,
    createConcurrencyGate,
    createLegalExplanationService,
    createLegalExplanationRequestHandler,
    handleLegalExplanationRequest
});
