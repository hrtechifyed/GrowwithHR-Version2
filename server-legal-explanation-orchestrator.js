"use strict";

const path = require("path");
const { pathToFileURL } = require("url");

const DEFAULT_RULE_CATALOG = require("./data/assessment/legal-applicability-rules.v1.json");
const DEFAULT_PROFILE_REGISTRY = require("./growwithhr-rag/data/legal-rag-profiles.v1.json");
const DEFAULT_POSH_CATALOG = require("./growwithhr-rag/data/posh-source-chunks.v1.json");
const {
    CloudflareWorkersAIProviderError,
    runCloudflareWorkersAILegalExplanation
} = require("./growwithhr-rag/cloudflare-workers-ai-provider.cjs");

const ORCHESTRATOR_VERSION = "1.0.0";
const DEFAULT_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const DEFAULT_FAILURE_BACKOFF_MS = 60 * 1000;
const DEFAULT_MAX_CONCURRENCY = 4;
const DEFAULT_MAX_QUEUE = 100;

const cleanText = (value) => String(value ?? "").trim();
const object = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const array = (value) => Array.isArray(value) ? value : [];
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

class LegalExplanationOrchestrationError extends Error {
    constructor(message, options = {}) {
        super(cleanText(message) || "The legal explanation request failed.");
        this.name = "LegalExplanationOrchestrationError";
        this.code = cleanText(options.code) || "legal-explanation-error";
        this.status = Number.isInteger(options.status) ? options.status : 500;
        this.retryable = options.retryable === true;
        this.publicMessage = cleanText(options.publicMessage) || this.message;
    }
}

function legalExplanationOrchestratorConfig(environment = process.env) {
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

function moduleUrl(...segments) {
    return pathToFileURL(path.join(__dirname, ...segments)).href;
}

let defaultModulesPromise = null;
function loadDefaultLegalExplanationModules() {
    if (!defaultModulesPromise) {
        defaultModulesPromise = Promise.all([
            import(moduleUrl("js", "assessment-v3", "legal-rule-assurance.js")),
            import(moduleUrl("growwithhr-rag", "legal-rag-runtime.js")),
            import(moduleUrl("growwithhr-rag", "legal-explanation-contract.js"))
        ]).then(([assurance, ragRuntime, contract]) => Object.freeze({
            assurance,
            ragRuntime,
            contract
        }));
    }
    return defaultModulesPromise;
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
                return Promise.reject(new LegalExplanationOrchestrationError(
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

function profileForFeature(registry, featureId) {
    const profiles = array(object(registry).profiles)
        .filter((profile) => cleanText(profile.featureId) === featureId);
    if (profiles.length !== 1) {
        throw new LegalExplanationOrchestrationError(
            `The legal RAG profile for ${featureId} was not uniquely resolved.`,
            {
                code: profiles.length ? "legal-explanation-profile-ambiguous" : "legal-explanation-profile-unavailable",
                status: profiles.length ? 500 : 404,
                publicMessage: "The requested legal explanation feature is not available."
            }
        );
    }
    return profiles[0];
}

function selectDecision(decisionsValue, profile, featureId) {
    const decisions = array(decisionsValue);
    const ruleIds = new Set(array(profile.ruleIds).map(cleanText).filter(Boolean));
    const productRuleIds = new Set(array(profile.productRuleIds).map(cleanText).filter(Boolean));
    const matches = decisions.filter((decision) =>
        ruleIds.has(cleanText(decision.ruleId)) ||
        productRuleIds.has(cleanText(decision.productRuleId))
    );
    if (matches.length !== 1) {
        throw new LegalExplanationOrchestrationError(
            `The deterministic legal decision for ${featureId} was not uniquely resolved.`,
            {
                code: "legal-explanation-decision-unavailable",
                status: 500,
                publicMessage: "The legal explanation could not be prepared."
            }
        );
    }
    return matches[0];
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
        sourceRegistryIds: array(decision.sourceRegistryIds).map(cleanText).filter(Boolean),
        sourceSections: clone(array(decision.sourceSections)),
        legalReviewStatus: cleanText(decision.legalReviewStatus),
        limitations: array(decision.limitations).map(cleanText).filter(Boolean)
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

function baseEnvelope({ featureId, profile, decision, retrievalTrace, explanation }) {
    return deepFreeze({
        orchestratorVersion: ORCHESTRATOR_VERSION,
        endpointVersion: "0.1.0",
        featureId,
        lawId: cleanText(profile.lawFamilyId),
        lawFamilyId: cleanText(profile.lawFamilyId),
        ragProfileId: cleanText(profile.profileId),
        catalogId: cleanText(profile.catalogId),
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
            citations: array(retrievalTrace.retrievedChunks).map(citationView)
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

function cacheKey(featureId, retrievalTrace) {
    return [
        featureId,
        cleanText(retrievalTrace.decisionFingerprint),
        cleanText(retrievalTrace.retrievalFingerprint)
    ].join(":");
}

function orchestrationError(error) {
    if (error instanceof LegalExplanationOrchestrationError) return error;
    const code = cleanText(error?.code);

    if (code === "legal-rag-profile-blocked") {
        return new LegalExplanationOrchestrationError("The legal RAG profile is blocked.", {
            code,
            status: 409,
            publicMessage: "This legal explanation feature is awaiting approval."
        });
    }
    if ([
        "legal-rag-profile-not-found",
        "legal-rag-catalog-not-found",
        "legal-rag-catalog-not-injected"
    ].includes(code)) {
        return new LegalExplanationOrchestrationError("The governed legal RAG configuration is incomplete.", {
            code,
            status: 503,
            publicMessage: "This legal explanation feature is not available on this deployment."
        });
    }
    if (code === "cloudflare-free-quota-or-rate-limit") {
        return new LegalExplanationOrchestrationError("Cloudflare free capacity is unavailable.", {
            code,
            status: 429,
            retryable: true,
            publicMessage: "The free explanation allowance is currently unavailable. Please try again later."
        });
    }
    if (["cloudflare-timeout", "cloudflare-network-error", "cloudflare-service-unavailable"].includes(code)) {
        return new LegalExplanationOrchestrationError("Cloudflare Workers AI is temporarily unavailable.", {
            code,
            status: 503,
            retryable: true,
            publicMessage: "The free explanation service is temporarily unavailable. Please try again later."
        });
    }
    if (["cloudflare-configuration-missing", "cloudflare-authentication-failed"].includes(code)) {
        return new LegalExplanationOrchestrationError("The Cloudflare provider is not configured.", {
            code,
            status: 503,
            publicMessage: "The explanation service is not available on this deployment."
        });
    }
    if (
        error instanceof CloudflareWorkersAIProviderError ||
        error?.name === "LegalExplanationContractError"
    ) {
        return new LegalExplanationOrchestrationError("The provider output failed the governed explanation contract.", {
            code: code || "legal-explanation-provider-output-rejected",
            status: 502,
            publicMessage: "The generated explanation could not be accepted."
        });
    }
    return new LegalExplanationOrchestrationError("The legal explanation service failed.", {
        code: code || "legal-explanation-internal-error",
        status: 500,
        publicMessage: "The explanation service could not complete this request."
    });
}

function defaultCatalogs() {
    return Object.freeze({
        "catalog.legal.posh.v1": DEFAULT_POSH_CATALOG
    });
}

function createGenericLegalExplanationOrchestrator(options = {}) {
    const source = object(options);
    const environment = source.environment || process.env;
    const config = source.config || legalExplanationOrchestratorConfig(environment);
    const featureId = cleanText(source.featureId);
    if (!featureId) {
        throw new LegalExplanationOrchestrationError("A legal feature ID is required.", {
            code: "legal-explanation-feature-required",
            status: 500
        });
    }

    const normalizeBody = typeof source.normalizeBody === "function"
        ? source.normalizeBody
        : (value) => deepFreeze(clone(object(value)));
    const modulesLoader = source.modulesLoader || loadDefaultLegalExplanationModules;
    const ruleCatalog = source.ruleCatalog || DEFAULT_RULE_CATALOG;
    const profileRegistry = source.profileRegistry || DEFAULT_PROFILE_REGISTRY;
    const catalogs = source.catalogs || defaultCatalogs();
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
            throw new LegalExplanationOrchestrationError("The legal explanation endpoint is disabled.", {
                code: "legal-explanation-endpoint-disabled",
                status: 404,
                publicMessage: "Not found."
            });
        }

        const body = normalizeBody(bodyValue);
        const evaluatedAt = now().toISOString();
        const modules = await modulesLoader();
        const profile = profileForFeature(profileRegistry, featureId);
        const assurance = modules.assurance.evaluateLegalRuleAssurance({
            answers: object(body.answers),
            catalog: ruleCatalog,
            evaluatedAt
        });
        const decision = selectDecision(assurance.decisions, profile, featureId);
        const routed = modules.ragRuntime.runLegalRagRetrieval({
            featureId,
            decision,
            registry: profileRegistry,
            catalogs
        });
        const retrievalTrace = routed.retrieval;
        const request = modules.contract.buildLegalExplanationRequest({
            decision,
            retrievalTrace,
            requestedAt: evaluatedAt
        });
        const key = cacheKey(featureId, retrievalTrace);
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
                    retrievalTrace,
                    featureId,
                    profile: routed.profile
                });
                const value = baseEnvelope({
                    featureId,
                    profile: routed.profile,
                    decision,
                    retrievalTrace,
                    explanation
                });
                cache.set(key, {
                    value,
                    expiresAt: now().getTime() + config.cacheTtlMs
                });
                return value;
            } catch (error) {
                const mapped = orchestrationError(error);
                failures.set(key, {
                    error: mapped,
                    expiresAt: now().getTime() + config.failureBackoffMs
                });
                throw mapped;
            } finally {
                inFlight.delete(key);
            }
        });

        inFlight.set(key, pending);
        return withDelivery(await pending, "miss");
    }

    return Object.freeze({
        featureId,
        explain,
        config,
        stats: () => deepFreeze({
            featureId,
            cacheEntries: cache.size,
            failureEntries: failures.size,
            inFlight: inFlight.size,
            gate: gate.stats()
        })
    });
}

module.exports = Object.freeze({
    ORCHESTRATOR_VERSION,
    LegalExplanationOrchestrationError,
    legalExplanationOrchestratorConfig,
    loadDefaultLegalExplanationModules,
    createConcurrencyGate,
    profileForFeature,
    selectDecision,
    orchestrationError,
    createGenericLegalExplanationOrchestrator
});