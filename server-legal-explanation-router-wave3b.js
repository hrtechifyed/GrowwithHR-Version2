"use strict";

const base = require("./server-legal-explanation-router-wave3a.js");
const {
    buildAllLawsPrivateBetaRegistry
} = require("./server-all-laws-private-beta-wave3b.js");
const {
    createRunnableAllLawsFeatureSpecifications
} = require("./server-all-laws-rule-catalogs-wave3b.js");
const {
    loadGovernedLegalCatalogs
} = require("./server-legal-rag-catalogs.js");

const SHARED_ROUTER_VERSION = "1.5.0";
const DEFAULT_PROFILE_REGISTRY = buildAllLawsPrivateBetaRegistry();
const DEFAULT_FEATURE_SPECIFICATIONS = Object.freeze({
    ...base.defaultFeatureSpecifications(),
    ...createRunnableAllLawsFeatureSpecifications()
});
const text = (value) => String(value ?? "").trim();

function defaultFeatureSpecifications() {
    return DEFAULT_FEATURE_SPECIFICATIONS;
}

function statusPayload(registry, catalogSnapshot, retrievalMode) {
    return Object.freeze({
        ...base.statusPayload(registry, catalogSnapshot, retrievalMode),
        routerVersion: SHARED_ROUTER_VERSION,
        limitations: [
            "Seven POSH, ten Maternity Benefit, five EPF Wave 3A operational and five EPF/EPS/EDLI Wave 3B verification or routing profiles use feature-specific deterministic rules and governed statutory catalogues.",
            "Wave 1, Wave 2, Wave 3A and Wave 3B remain needs-legal-review and emit specialist-review or more-information-needed, not legal certification, contribution calculations or individual membership or benefit decisions.",
            "Thirty remaining profiles are runnable through conservative governance-fallback catalogues.",
            "Wave 3B records controlled wage bands, declared rate branches, routing statuses and process controls only; it does not select an applicable rate, calculate amounts or resolve transition and savings treatment.",
            "EPF exemption and international-worker profiles remain on governance fallback.",
            "Retrieval and provider output cannot create facts or alter deterministic outcomes."
        ]
    });
}

function writeStatus(response, payload) {
    response.statusCode = 200;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.setHeader("Cache-Control", "no-store");
    response.end(JSON.stringify(payload));
}

function createSharedLegalExplanationRequestHandler(options = {}) {
    const profileRegistry = options.profileRegistry || DEFAULT_PROFILE_REGISTRY;
    const featureSpecifications = options.featureSpecifications || DEFAULT_FEATURE_SPECIFICATIONS;
    const catalogSnapshot = options.catalogSnapshot || loadGovernedLegalCatalogs({ profileRegistry });
    const delegated = base.createSharedLegalExplanationRequestHandler({
        ...options,
        profileRegistry,
        featureSpecifications,
        catalogSnapshot,
        catalogs: options.catalogs || catalogSnapshot.catalogs
    });
    const retrievalMode = text(
        options.retrievalMode || process.env.LEGAL_RAG_RETRIEVAL_MODE || "lexical"
    ).toLowerCase();

    return function handleWave3bLegalExplanationRequest(request, response) {
        const requestPath = text(request.url).split("?")[0];
        if (requestPath === base.STATUS_ROUTE && request.method === "GET") {
            writeStatus(response, statusPayload(profileRegistry, catalogSnapshot, retrievalMode));
            return true;
        }
        return delegated(request, response);
    };
}

let defaultHandler = null;
function handleSharedLegalExplanationRequest(request, response) {
    if (!defaultHandler) defaultHandler = createSharedLegalExplanationRequestHandler();
    return defaultHandler(request, response);
}

module.exports = Object.freeze({
    ...base,
    SHARED_ROUTER_VERSION,
    DEFAULT_PROFILE_REGISTRY,
    defaultFeatureSpecifications,
    statusPayload,
    createSharedLegalExplanationRequestHandler,
    handleSharedLegalExplanationRequest
});
