"use strict";

/**
 * M7 operational readiness, monitoring and release-exit status.
 *
 * The endpoint returns contract and process metrics only. It never exposes
 * assessment answers, evidence, source text, provider prompts or credentials.
 */

const HARDENING = require("./data/architecture/m7-rag-ready-hardening.v1.json");
const RELIABILITY = require("./data/releases/m7-reliability-evidence.v1.json");
const PROFILE_REGISTRY = require("./growwithhr-rag/data/legal-rag-profiles.v1.json");
const { loadDefaultGovernedLegalCatalogs } = require("./server-legal-rag-catalogs.js");

const M7_READINESS_VERSION = "1.0.0";
const M7_READINESS_ROUTE = "/api/m7/readiness";

const cleanText = (value) => String(value ?? "").trim();
const object = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const array = (value) => Array.isArray(value) ? value : [];

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
}

function percentile(values, ratio) {
    if (!values.length) return null;
    const sorted = [...values].sort((left, right) => left - right);
    const index = Math.max(0, Math.ceil(sorted.length * ratio) - 1);
    return sorted[index];
}

function createM7OperationalMonitor(options = {}) {
    const maximumSamples = Number.isInteger(options.maximumSamples)
        ? Math.min(1000, Math.max(10, options.maximumSamples))
        : HARDENING.operationalHardening.performanceBudgets.maximumMetricSamplesPerOperation;
    const records = new Map();

    function stateFor(operation) {
        if (!records.has(operation)) {
            records.set(operation, {
                requests: 0,
                successes: 0,
                failures: 0,
                durations: [],
                codes: new Map(),
                lastRecordedAt: null
            });
        }
        return records.get(operation);
    }

    function record(value = {}) {
        const event = object(value);
        const operation = cleanText(event.operation);
        const outcome = cleanText(event.outcome) === "failure" ? "failure" : "success";
        const durationMs = Number(event.durationMs);
        const code = cleanText(event.code) || (outcome === "success" ? "ok" : "error");
        if (!HARDENING.operationalHardening.monitoring.trackedOperations.includes(operation)) {
            throw new Error(`Unsupported M7 monitored operation: ${operation || "(missing)"}.`);
        }
        if (!Number.isFinite(durationMs) || durationMs < 0 || durationMs > 10 * 60 * 1000) {
            throw new Error("M7 monitoring duration must be a finite non-negative number.");
        }

        const state = stateFor(operation);
        state.requests += 1;
        state[outcome === "success" ? "successes" : "failures"] += 1;
        state.durations.push(durationMs);
        if (state.durations.length > maximumSamples) state.durations.shift();
        state.codes.set(code, (state.codes.get(code) || 0) + 1);
        state.lastRecordedAt = new Date().toISOString();
        return snapshot();
    }

    function snapshot() {
        const operations = {};
        for (const operation of HARDENING.operationalHardening.monitoring.trackedOperations) {
            const state = stateFor(operation);
            operations[operation] = {
                requests: state.requests,
                successes: state.successes,
                failures: state.failures,
                successRate: state.requests ? state.successes / state.requests : null,
                p50Milliseconds: percentile(state.durations, 0.5),
                p95Milliseconds: percentile(state.durations, 0.95),
                maximumMilliseconds: state.durations.length ? Math.max(...state.durations) : null,
                sampledRequestCount: state.durations.length,
                resultCodes: Object.fromEntries([...state.codes.entries()].sort()),
                lastRecordedAt: state.lastRecordedAt
            };
        }
        return deepFreeze({
            version: M7_READINESS_VERSION,
            maximumSamplesPerOperation: maximumSamples,
            sensitivePayloadLogging: false,
            operations
        });
    }

    function reset() {
        records.clear();
    }

    return Object.freeze({ record, snapshot, reset });
}

const defaultM7Monitor = createM7OperationalMonitor();

function profileSummary(registry) {
    const profiles = array(object(registry).profiles);
    return {
        total: profiles.length,
        active: profiles.filter((profile) => cleanText(profile.activationStatus) === "active-private-beta").length,
        blocked: profiles.filter((profile) => cleanText(profile.activationStatus) !== "active-private-beta").length
    };
}

function catalogueSummary(snapshot) {
    const metadata = array(object(snapshot).metadata);
    return {
        catalogues: metadata.length,
        sources: metadata.reduce((total, item) => total + Number(item.sourceCount || 0), 0),
        chunks: metadata.reduce((total, item) => total + Number(item.chunkCount || 0), 0),
        activeCatalogues: array(object(snapshot).activeCatalogIds).length
    };
}

function createM7ReadinessSnapshot(options = {}) {
    const monitor = options.monitor || defaultM7Monitor;
    const registry = options.profileRegistry || PROFILE_REGISTRY;
    const catalogSnapshot = options.catalogSnapshot || loadDefaultGovernedLegalCatalogs();
    const qualified = array(RELIABILITY.qualifiedReleases).length;
    const required = RELIABILITY.requiredConsecutiveQualifiedReleases;
    const releaseExitSatisfied = RELIABILITY.releaseExitSatisfied === true && qualified >= required;

    return deepFreeze({
        readinessVersion: M7_READINESS_VERSION,
        milestone: HARDENING.milestone,
        targetRelease: HARDENING.targetRelease,
        implementationVersion: HARDENING.implementationVersion,
        implementationStatus: HARDENING.implementationStatus,
        releaseCut: HARDENING.releaseCut,
        releaseReady: releaseExitSatisfied,
        releaseExitStatus: releaseExitSatisfied ? "satisfied" : "pending-production-evidence",
        authorityBoundary: HARDENING.authorityBoundary,
        contractFreeze: {
            frozenContractCount: HARDENING.frozenContracts.length,
            categories: [...new Set(HARDENING.frozenContracts.map((item) => item.category))].sort(),
            breakingChangesRequireVersionedContract: true
        },
        sourceGovernance: {
            lifecycleContractVersion: "1.0.0",
            dateInferenceAllowed: false,
            highCertaintyRequiresCurrentSources: true,
            changedOrSupersededSourcesInvalidateHighCertaintyOutput: true,
            catalogueCoverage: catalogueSummary(catalogSnapshot)
        },
        ragPlatform: profileSummary(registry),
        reliability: {
            requiredConsecutiveQualifiedReleases: required,
            currentConsecutiveQualifiedReleases: qualified,
            status: RELIABILITY.status,
            releaseExitSatisfied
        },
        performanceBudgets: HARDENING.operationalHardening.performanceBudgets,
        monitoring: monitor.snapshot(),
        security: {
            controls: HARDENING.operationalHardening.securityControls,
            credentialsExposed: false,
            sensitivePayloadLogging: false
        },
        disasterRecovery: {
            drillCommand: HARDENING.operationalHardening.disasterRecovery.drillCommand,
            deterministicDecisionsIndependentOfRag: true,
            rollbackTarget: HARDENING.operationalHardening.disasterRecovery.rollbackTarget,
            remotePersistenceRequired: false
        },
        activationBoundary: HARDENING.activationBoundary,
        generatedAt: new Date().toISOString()
    });
}

function writeJson(response, status, payload) {
    response.statusCode = status;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.end(JSON.stringify(payload));
}

function createM7ReadinessRequestHandler(options = {}) {
    const monitor = options.monitor || defaultM7Monitor;
    return function handleM7ReadinessRequest(request, response) {
        const requestPath = cleanText(request.url).split("?")[0];
        if (requestPath !== M7_READINESS_ROUTE) return false;
        const startedAt = process.hrtime.bigint();

        if (request.method !== "GET") {
            response.setHeader("Allow", "GET, OPTIONS");
            writeJson(response, 405, {
                error: {
                    code: "m7-readiness-method-not-allowed",
                    message: "Only GET is supported.",
                    retryable: false
                }
            });
            const elapsed = Number(process.hrtime.bigint() - startedAt) / 1e6;
            monitor.record({ operation: "m7-readiness", durationMs: elapsed, outcome: "failure", code: "method-not-allowed" });
            return true;
        }

        try {
            const payload = createM7ReadinessSnapshot({ ...options, monitor });
            writeJson(response, 200, payload);
            const elapsed = Number(process.hrtime.bigint() - startedAt) / 1e6;
            monitor.record({ operation: "m7-readiness", durationMs: elapsed, outcome: "success", code: "ok" });
        } catch (_error) {
            writeJson(response, 503, {
                error: {
                    code: "m7-readiness-unavailable",
                    message: "M7 readiness status is unavailable.",
                    retryable: true
                }
            });
            const elapsed = Number(process.hrtime.bigint() - startedAt) / 1e6;
            monitor.record({ operation: "m7-readiness", durationMs: elapsed, outcome: "failure", code: "unavailable" });
        }
        return true;
    };
}

let defaultHandler = null;
function handleM7ReadinessRequest(request, response) {
    if (!defaultHandler) defaultHandler = createM7ReadinessRequestHandler();
    return defaultHandler(request, response);
}

module.exports = Object.freeze({
    M7_READINESS_VERSION,
    M7_READINESS_ROUTE,
    createM7OperationalMonitor,
    defaultM7Monitor,
    createM7ReadinessSnapshot,
    createM7ReadinessRequestHandler,
    handleM7ReadinessRequest
});
