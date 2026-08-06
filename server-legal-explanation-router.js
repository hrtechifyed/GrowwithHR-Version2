"use strict";

/**
 * Shared feature-addressed legal explanation router and RAG status endpoint.
 * Deterministic rules decide; governed retrieval and providers explain only.
 */

const {
    FEATURE_ID: POSH_FEATURE_ID,
    MAX_REQUEST_BYTES,
    normalizeBody: normalizePoshBody
} = require("./server-legal-explanation.js");
const {
    createGenericLegalExplanationOrchestrator,
    orchestrationError
} = require("./server-legal-explanation-orchestrator.js");
const {
    buildAllLawsPrivateBetaRegistry
} = require("./server-all-laws-private-beta.js");
const {
    createRunnableAllLawsFeatureSpecifications
} = require("./server-all-laws-rule-catalogs.js");
const {
    normalizePoshNoticeBody
} = require("./server-posh-wave1-normalizer-overrides.js");
const {
    loadGovernedLegalCatalogs
} = require("./server-legal-rag-catalogs.js");
const {
    createCompleteLegalModulesLoader
} = require("./server-legal-rag-modules.js");

const DEFAULT_PROFILE_REGISTRY = buildAllLawsPrivateBetaRegistry();
const SHARED_ROUTE_PREFIX = "/api/legal-explanation/feature/";
const STATUS_ROUTE = "/api/legal-rag/status";
const SHARED_ROUTER_VERSION = "1.2.0";

const cleanText = (value) => String(value ?? "").trim();
const object = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const array = (value) => Array.isArray(value) ? value : [];

function writeJson(response, status, payload) {
    response.statusCode = status;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.setHeader("Cache-Control", "no-store");
    response.end(JSON.stringify(payload));
}

function publicError(code, message, status, retryable = false) {
    return {
        status,
        payload: {
            error: { code, message, retryable },
            legalReviewStatus: "needs-legal-review",
            usedForDecision: false
        }
    };
}

function readJsonBody(request) {
    return new Promise((resolve, reject) => {
        const contentType = cleanText(request.headers["content-type"]).toLowerCase();
        if (!contentType.startsWith("application/json")) {
            reject(publicError(
                "legal-explanation-content-type-required",
                "Content-Type must be application/json.",
                415
            ));
            return;
        }
        const declaredLength = Number.parseInt(cleanText(request.headers["content-length"]), 10);
        if (Number.isInteger(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
            reject(publicError(
                "legal-explanation-request-too-large",
                "The request body is too large.",
                413
            ));
            request.resume();
            return;
        }

        const chunks = [];
        let received = 0;
        let settled = false;
        const fail = (value) => {
            if (settled) return;
            settled = true;
            reject(value);
        };
        request.on("data", (chunk) => {
            if (settled) return;
            received += chunk.length;
            if (received > MAX_REQUEST_BYTES) {
                fail(publicError(
                    "legal-explanation-request-too-large",
                    "The request body is too large.",
                    413
                ));
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
                reject(publicError(
                    "legal-explanation-invalid-json",
                    "The request body must contain valid JSON.",
                    400
                ));
            }
        });
        request.on("error", () => fail(publicError(
            "legal-explanation-request-read-failed",
            "The request body could not be read.",
            400
        )));
    });
}

function profileMap(registry) {
    return new Map(array(object(registry).profiles)
        .map((profile) => [cleanText(profile.featureId), profile])
        .filter(([featureId]) => Boolean(featureId)));
}

function defaultFeatureSpecifications() {
    const specifications = createRunnableAllLawsFeatureSpecifications();
    const noticeFeatureId = "feature.legal.posh.notice-display-review";
    const noticeSpecification = object(specifications[noticeFeatureId]);
    return Object.freeze({
        [POSH_FEATURE_ID]: Object.freeze({
            featureId: POSH_FEATURE_ID,
            normalizeBody: normalizePoshBody,
            privateBetaMode: "statutory-catalogue"
        }),
        ...specifications,
        [noticeFeatureId]: Object.freeze({
            ...noticeSpecification,
            normalizeBody: normalizePoshNoticeBody
        })
    });
}

function decodeFeatureId(requestPath) {
    const raw = requestPath.slice(SHARED_ROUTE_PREFIX.length);
    if (!raw || raw.includes("/")) return "";
    try {
        return cleanText(decodeURIComponent(raw));
    } catch (_error) {
        return "";
    }
}

function statusPayload(registry, catalogSnapshot, retrievalMode) {
    const profiles = array(object(registry).profiles);
    const activeProfiles = profiles
        .filter((profile) => cleanText(profile.activationStatus) === "active-private-beta")
        .map((profile) => ({
            featureId: cleanText(profile.featureId),
            profileId: cleanText(profile.profileId),
            lawFamilyId: cleanText(profile.lawFamilyId),
            catalogId: cleanText(profile.catalogId),
            activationStatus: cleanText(profile.activationStatus),
            privateBetaMode: cleanText(profile.privateBetaMode || "statutory-catalogue")
        }));
    const substantiveProfiles = activeProfiles
        .filter((profile) => profile.privateBetaMode === "statutory-catalogue");
    const fallbackProfiles = activeProfiles
        .filter((profile) => profile.privateBetaMode === "governance-fallback");

    return {
        routerVersion: SHARED_ROUTER_VERSION,
        platformStatus: "all-laws-runnable-private-beta",
        applicabilityAuthority: "deterministic-only",
        retrievalRole: "source-retrieval-only",
        providerRole: "explanation-only",
        legalReviewStatus: "needs-legal-review",
        retrievalMode,
        profileCount: profiles.length,
        activeProfileCount: activeProfiles.length,
        substantiveProfileCount: substantiveProfiles.length,
        governanceFallbackProfileCount: fallbackProfiles.length,
        activeProfiles,
        blockedProfileCount: profiles
            .filter((profile) => cleanText(profile.activationStatus) !== "active-private-beta")
            .length,
        catalogs: array(catalogSnapshot.metadata).map((item) => ({
            catalogId: cleanText(item.catalogId),
            lawFamilyId: cleanText(item.lawFamilyId),
            catalogMode: cleanText(item.catalogMode || "statutory"),
            sourceCount: item.sourceCount,
            chunkCount: item.chunkCount,
            fileSha256: cleanText(item.fileSha256)
        })),
        limitations: [
            "Seven POSH profiles use feature-specific deterministic rules and the governed POSH statutory catalogue.",
            "The six Wave 1 control reviews remain needs-legal-review and therefore emit specialist-review or more-information-needed, not legal certification.",
            "The remaining profiles are runnable through conservative governance-fallback catalogues.",
            "Retrieval and provider output cannot create facts or alter deterministic outcomes."
        ]
    };
}

function createSharedLegalExplanationRequestHandler(options = {}) {
    const source = object(options);
    const profileRegistry = source.profileRegistry || DEFAULT_PROFILE_REGISTRY;
    const profiles = profileMap(profileRegistry);
    const featureSpecifications = source.featureSpecifications || defaultFeatureSpecifications();
    const catalogSnapshot = source.catalogSnapshot || loadGovernedLegalCatalogs({ profileRegistry });
    const catalogs = source.catalogs || catalogSnapshot.catalogs;
    const environment = source.environment || process.env;
    const retrievalMode = cleanText(
        source.retrievalMode || environment.LEGAL_RAG_RETRIEVAL_MODE || "lexical"
    ).toLowerCase();
    const modulesLoader = source.modulesLoader || createCompleteLegalModulesLoader({ retrievalMode });
    const createService = source.createService || ((featureId, specification) =>
        createGenericLegalExplanationOrchestrator({
            ...source,
            featureId,
            normalizeBody: specification.normalizeBody,
            ruleCatalog: specification.ruleCatalog || source.ruleCatalog,
            profileRegistry,
            catalogs,
            environment,
            modulesLoader
        }));
    const services = new Map();

    function serviceFor(featureId, specification) {
        if (!services.has(featureId)) services.set(featureId, createService(featureId, specification));
        return services.get(featureId);
    }

    return function handleSharedLegalExplanationRequest(request, response) {
        const requestPath = cleanText(request.url).split("?")[0];
        if (requestPath === STATUS_ROUTE) {
            if (request.method !== "GET") {
                response.setHeader("Allow", "GET, OPTIONS");
                writeJson(response, 405, publicError(
                    "legal-rag-status-method-not-allowed",
                    "Only GET is supported.",
                    405
                ).payload);
                return true;
            }
            writeJson(response, 200, statusPayload(profileRegistry, catalogSnapshot, retrievalMode));
            return true;
        }
        if (!requestPath.startsWith(SHARED_ROUTE_PREFIX)) return false;
        if (request.method !== "POST") {
            response.setHeader("Allow", "POST, OPTIONS");
            writeJson(response, 405, publicError(
                "legal-explanation-method-not-allowed",
                "Only POST is supported.",
                405
            ).payload);
            return true;
        }

        const featureId = decodeFeatureId(requestPath);
        const profile = profiles.get(featureId);
        if (!featureId || !profile) {
            writeJson(response, 404, publicError(
                "legal-explanation-feature-not-found",
                "The requested legal explanation feature is not available.",
                404
            ).payload);
            return true;
        }
        if (cleanText(profile.activationStatus) !== "active-private-beta" || profile.explanationEnabled !== true) {
            writeJson(response, 409, publicError(
                "legal-rag-profile-blocked",
                "This legal explanation feature is awaiting approval.",
                409
            ).payload);
            return true;
        }

        const specification = object(featureSpecifications)[featureId];
        if (!specification || typeof specification.normalizeBody !== "function") {
            writeJson(response, 503, publicError(
                "legal-explanation-feature-adapter-unavailable",
                "This legal explanation feature is not available on this deployment.",
                503
            ).payload);
            return true;
        }

        (async () => {
            try {
                const body = await readJsonBody(request);
                writeJson(response, 200, await serviceFor(featureId, specification).explain(body));
            } catch (error) {
                if (error && Number.isInteger(error.status) && error.payload) {
                    writeJson(response, error.status, error.payload);
                    return;
                }
                const mapped = orchestrationError(error);
                writeJson(response, mapped.status, publicError(
                    mapped.code,
                    mapped.publicMessage,
                    mapped.status,
                    mapped.retryable
                ).payload);
            }
        })();
        return true;
    };
}

let defaultHandler = null;
function handleSharedLegalExplanationRequest(request, response) {
    if (!defaultHandler) defaultHandler = createSharedLegalExplanationRequestHandler();
    return defaultHandler(request, response);
}

module.exports = Object.freeze({
    SHARED_ROUTER_VERSION,
    SHARED_ROUTE_PREFIX,
    STATUS_ROUTE,
    DEFAULT_PROFILE_REGISTRY,
    defaultFeatureSpecifications,
    statusPayload,
    createSharedLegalExplanationRequestHandler,
    handleSharedLegalExplanationRequest
});
