/**
 * Shared post-decision legal RAG routing runtime.
 *
 * This module does not load files, evaluate applicability, collect facts,
 * call a language model, or mutate a deterministic decision. Governed
 * catalogues are injected by the server or test layer after a profile has
 * been resolved.
 */

import { retrieveLegalDecisionSources } from "./legal-source-retrieval.js";

export const LEGAL_RAG_RUNTIME_VERSION = "0.1.0";

const STABLE_ID = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const FEATURE_ID = /^feature\.legal\.[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const RULE_ID = /^rule\.legal\.[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const ACTIVE_STATUS = "active-private-beta";
const ALLOWED_STATUSES = new Set([
    ACTIVE_STATUS,
    "blocked-awaiting-approval",
    "blocked-no-catalog",
    "withdrawn"
]);

const object = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const array = (value) => Array.isArray(value) ? value : [];
const text = (value) => String(value ?? "").trim();
const unique = (values) => [...new Set(array(values).map(text).filter(Boolean))];
const clone = (value) => JSON.parse(JSON.stringify(value));

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
}

function issue(path, message, code = "legal-rag-runtime-invalid") {
    return Object.freeze({
        path: text(path) || "/",
        message: text(message) || "Legal RAG runtime validation failed.",
        code: text(code) || "legal-rag-runtime-invalid"
    });
}

export class LegalRagRuntimeError extends Error {
    constructor(issues) {
        const normalized = Object.freeze(
            array(Array.isArray(issues) ? issues : [issues])
                .filter(Boolean)
                .map((item) => issue(object(item).path, object(item).message, object(item).code))
        );
        super(normalized.map((item) => `${item.path}: ${item.message}`).join("\n") || "Legal RAG runtime validation failed.");
        this.name = "LegalRagRuntimeError";
        this.issues = normalized;
        this.code = normalized[0]?.code || "legal-rag-runtime-invalid";
    }
}

function validatePath(value) {
    const normalized = text(value).replaceAll("\\", "/");
    return Boolean(normalized)
        && !normalized.startsWith("/")
        && !normalized.includes("../")
        && normalized.endsWith(".json");
}

function normalizedDecision(value) {
    const decision = object(value);
    return deepFreeze({
        productRuleId: text(decision.productRuleId),
        ruleId: text(decision.ruleId),
        ruleVersion: text(decision.ruleVersion),
        status: text(decision.status),
        reasonCode: text(decision.reasonCode),
        sourceRegistryIds: unique(decision.sourceRegistryIds),
        requiredFactIds: unique(decision.requiredFactIds),
        triggeringFactIds: unique(decision.triggeringFactIds),
        missingFactIds: unique(decision.missingFactIds)
    });
}

function assertDecision(value) {
    const decision = normalizedDecision(value);
    const errors = [];
    ["productRuleId", "ruleId", "ruleVersion", "status", "reasonCode"].forEach((key) => {
        if (!decision[key]) errors.push(issue(`/decision/${key}`, "A deterministic decision value is required before RAG routing.", "legal-rag-decision-required"));
    });
    if (!decision.sourceRegistryIds.length) {
        errors.push(issue("/decision/sourceRegistryIds", "At least one governed Source Register ID is required before RAG routing.", "legal-rag-decision-required"));
    }
    if (errors.length) throw new LegalRagRuntimeError(errors);
    return decision;
}

export function validateLegalRagProfiles(value) {
    const registry = object(value);
    const errors = [];

    if (registry.schemaVersion !== 1) errors.push(issue("/schemaVersion", "Legal RAG profile schemaVersion must be 1."));
    if (registry.runtimeRole !== "post-decision-rag-routing-only") {
        errors.push(issue("/runtimeRole", "The registry must remain post-decision-rag-routing-only."));
    }
    if (registry.applicabilityAuthority !== "none") {
        errors.push(issue("/applicabilityAuthority", "The RAG registry must have no applicability authority."));
    }
    if (registry.llmRole !== "explanation-only") {
        errors.push(issue("/llmRole", "The language-model role must remain explanation-only."));
    }
    if (registry.legalReviewStatus !== "needs-legal-review") {
        errors.push(issue("/legalReviewStatus", "The architecture registry must remain needs-legal-review until separately approved."));
    }

    const defaultMaxChunks = object(registry.defaults).maxChunks;
    if (!Number.isInteger(defaultMaxChunks) || defaultMaxChunks < 1 || defaultMaxChunks > 20) {
        errors.push(issue("/defaults/maxChunks", "A default maxChunks value between 1 and 20 is required."));
    }

    const catalogs = new Map();
    array(registry.catalogs).forEach((raw, index) => {
        const catalog = object(raw);
        const path = `/catalogs/${index}`;
        const catalogId = text(catalog.catalogId);
        if (!STABLE_ID.test(catalogId)) errors.push(issue(`${path}/catalogId`, "A stable catalogue ID is required."));
        else if (catalogs.has(catalogId)) errors.push(issue(`${path}/catalogId`, `Catalogue ID ${catalogId} is duplicated.`));
        else catalogs.set(catalogId, catalog);
        if (!STABLE_ID.test(text(catalog.lawFamilyId))) errors.push(issue(`${path}/lawFamilyId`, "A stable law-family ID is required."));
        if (!validatePath(catalog.catalogPath)) errors.push(issue(`${path}/catalogPath`, "A safe repository-relative JSON catalogue path is required."));
        if (catalog.format !== "governed-legal-source-chunks-v1") errors.push(issue(`${path}/format`, "The governed legal chunk format must be declared."));
        if (!unique(catalog.allowedFeatureIds).length) errors.push(issue(`${path}/allowedFeatureIds`, "At least one allowed legal feature is required."));
        unique(catalog.allowedFeatureIds).forEach((featureId) => {
            if (!FEATURE_ID.test(featureId)) errors.push(issue(`${path}/allowedFeatureIds`, `Invalid legal feature ID: ${featureId}.`));
        });
    });

    const profileIds = new Set();
    const featureIds = new Set();
    const activeRuleOwners = new Map();
    const activeProductOwners = new Map();

    array(registry.profiles).forEach((raw, index) => {
        const profile = object(raw);
        const path = `/profiles/${index}`;
        const profileId = text(profile.profileId);
        const featureId = text(profile.featureId);
        const activationStatus = text(profile.activationStatus);
        const catalogId = profile.catalogId === null ? null : text(profile.catalogId);
        const ruleIds = unique(profile.ruleIds);
        const productRuleIds = unique(profile.productRuleIds);

        if (!STABLE_ID.test(profileId)) errors.push(issue(`${path}/profileId`, "A stable RAG profile ID is required."));
        else if (profileIds.has(profileId)) errors.push(issue(`${path}/profileId`, `RAG profile ID ${profileId} is duplicated.`));
        else profileIds.add(profileId);

        if (!FEATURE_ID.test(featureId)) errors.push(issue(`${path}/featureId`, "A valid legal feature ID is required."));
        else if (featureIds.has(featureId)) errors.push(issue(`${path}/featureId`, `Legal feature ${featureId} has more than one RAG profile.`));
        else featureIds.add(featureId);

        if (!STABLE_ID.test(text(profile.lawFamilyId))) errors.push(issue(`${path}/lawFamilyId`, "A stable law-family ID is required."));
        if (!ALLOWED_STATUSES.has(activationStatus)) errors.push(issue(`${path}/activationStatus`, "Unknown RAG activation status."));
        if (!Number.isInteger(profile.maxChunks) || profile.maxChunks < 1 || profile.maxChunks > 20) {
            errors.push(issue(`${path}/maxChunks`, "Profile maxChunks must be between 1 and 20."));
        }
        ruleIds.forEach((ruleId) => {
            if (!RULE_ID.test(ruleId)) errors.push(issue(`${path}/ruleIds`, `Invalid legal rule ID: ${ruleId}.`));
        });
        if (unique(profile.queryTerms).some((term) => term.length > 160)) {
            errors.push(issue(`${path}/queryTerms`, "RAG query terms must be concise."));
        }

        if (catalogId) {
            const catalog = catalogs.get(catalogId);
            if (!catalog) errors.push(issue(`${path}/catalogId`, `Unknown governed catalogue: ${catalogId}.`));
            else if (!unique(catalog.allowedFeatureIds).includes(featureId)) {
                errors.push(issue(`${path}/catalogId`, `Catalogue ${catalogId} does not allow feature ${featureId}.`));
            }
        }

        if (activationStatus === ACTIVE_STATUS) {
            if (!catalogId) errors.push(issue(`${path}/catalogId`, "An active RAG profile requires a governed catalogue."));
            if (!ruleIds.length && !productRuleIds.length) {
                errors.push(issue(`${path}/ruleIds`, "An active RAG profile requires a deterministic rule mapping."));
            }
            if (!unique(profile.queryTerms).length) errors.push(issue(`${path}/queryTerms`, "An active RAG profile requires governed query terms."));
            if (profile.explanationEnabled !== true) errors.push(issue(`${path}/explanationEnabled`, "An active profile must explicitly enable explanation."));
            if (unique(profile.blockers).length) errors.push(issue(`${path}/blockers`, "An active profile cannot retain blockers."));

            ruleIds.forEach((ruleId) => {
                if (activeRuleOwners.has(ruleId)) errors.push(issue(`${path}/ruleIds`, `Active rule ${ruleId} is already routed by ${activeRuleOwners.get(ruleId)}.`));
                else activeRuleOwners.set(ruleId, profileId);
            });
            productRuleIds.forEach((productRuleId) => {
                if (activeProductOwners.has(productRuleId)) errors.push(issue(`${path}/productRuleIds`, `Active product rule ${productRuleId} is already routed by ${activeProductOwners.get(productRuleId)}.`));
                else activeProductOwners.set(productRuleId, profileId);
            });
        } else {
            if (profile.explanationEnabled !== false) errors.push(issue(`${path}/explanationEnabled`, "A blocked profile cannot enable explanation."));
            if (!unique(profile.blockers).length && activationStatus !== "withdrawn") {
                errors.push(issue(`${path}/blockers`, "A blocked profile must explain why it cannot run."));
            }
        }
    });

    if (!array(registry.profiles).length) errors.push(issue("/profiles", "At least one legal RAG profile is required."));
    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
}

function assertRegistry(registry) {
    const validation = validateLegalRagProfiles(registry);
    if (!validation.valid) throw new LegalRagRuntimeError(validation.errors);
    return registry;
}

function profileView(profile, catalog) {
    return deepFreeze({
        profileId: text(profile.profileId),
        featureId: text(profile.featureId),
        lawFamilyId: text(profile.lawFamilyId),
        activationStatus: text(profile.activationStatus),
        catalogId: profile.catalogId === null ? null : text(profile.catalogId),
        catalogPath: catalog ? text(catalog.catalogPath) : null,
        ruleIds: unique(profile.ruleIds),
        productRuleIds: unique(profile.productRuleIds),
        queryTerms: unique(profile.queryTerms),
        maxChunks: profile.maxChunks,
        explanationEnabled: profile.explanationEnabled === true,
        compatibilityRoutes: unique(profile.compatibilityRoutes),
        blockers: unique(profile.blockers)
    });
}

/** Resolve one routing profile without loading a catalogue or running retrieval. */
export function resolveLegalRagProfile(input = {}) {
    const request = object(input);
    const registry = assertRegistry(request.registry);
    const decision = assertDecision(request.decision);
    const requestedFeatureId = text(request.featureId);
    const profiles = array(registry.profiles);

    let matches = requestedFeatureId
        ? profiles.filter((profile) => text(profile.featureId) === requestedFeatureId)
        : profiles.filter((profile) => unique(profile.ruleIds).includes(decision.ruleId));

    if (!matches.length && !requestedFeatureId) {
        matches = profiles.filter((profile) => unique(profile.productRuleIds).includes(decision.productRuleId));
    }

    if (!matches.length) {
        throw new LegalRagRuntimeError([issue(
            requestedFeatureId ? "/featureId" : "/decision/ruleId",
            requestedFeatureId
                ? `No legal RAG profile is registered for feature ${requestedFeatureId}.`
                : `No legal RAG profile is registered for rule ${decision.ruleId}.`,
            "legal-rag-profile-not-found"
        )]);
    }
    if (matches.length !== 1) {
        throw new LegalRagRuntimeError([issue("/profiles", "The deterministic decision resolved to more than one legal RAG profile.", "legal-rag-profile-ambiguous")]);
    }

    const profile = matches[0];
    const profileRuleIds = unique(profile.ruleIds);
    const profileProductRuleIds = unique(profile.productRuleIds);
    if (requestedFeatureId && !profileRuleIds.includes(decision.ruleId) && !profileProductRuleIds.includes(decision.productRuleId)) {
        throw new LegalRagRuntimeError([issue("/decision/ruleId", "The deterministic decision does not belong to the requested feature profile.", "legal-rag-profile-mismatch")]);
    }
    if (profile.activationStatus !== ACTIVE_STATUS) {
        throw new LegalRagRuntimeError([issue(
            "/profile/activationStatus",
            `RAG profile ${profile.profileId} is blocked: ${unique(profile.blockers).join(" ")}`,
            "legal-rag-profile-blocked"
        )]);
    }

    const catalog = array(registry.catalogs).find((item) => text(item.catalogId) === text(profile.catalogId));
    if (!catalog) {
        throw new LegalRagRuntimeError([issue("/profile/catalogId", "The active profile catalogue descriptor is missing.", "legal-rag-catalog-not-found")]);
    }

    return deepFreeze({
        runtimeVersion: LEGAL_RAG_RUNTIME_VERSION,
        runtimeRole: "post-decision-rag-routing-only",
        applicabilityAuthority: "none",
        decision,
        profile: profileView(profile, catalog)
    });
}

function injectedCatalog(catalogs, catalogId) {
    if (catalogs instanceof Map) return catalogs.get(catalogId);
    return object(catalogs)[catalogId];
}

/** Run governed retrieval through the resolved architecture-wide profile. */
export function runLegalRagRetrieval(input = {}) {
    const request = object(input);
    const decisionSnapshot = JSON.stringify(request.decision);
    const resolved = resolveLegalRagProfile(request);
    const catalogId = resolved.profile.catalogId;
    const catalog = injectedCatalog(request.catalogs, catalogId);

    if (!catalog) {
        throw new LegalRagRuntimeError([issue(
            "/catalogs",
            `The governed catalogue ${catalogId} was not injected into the RAG runtime.`,
            "legal-rag-catalog-not-injected"
        )]);
    }

    const maxChunks = Number.isInteger(request.maxChunks) && request.maxChunks > 0
        ? Math.min(request.maxChunks, resolved.profile.maxChunks)
        : resolved.profile.maxChunks;
    const queryTerms = unique([
        ...resolved.profile.queryTerms,
        ...array(request.queryTerms)
    ]);

    const retrieval = retrieveLegalDecisionSources({
        decision: request.decision,
        catalog,
        queryTerms,
        maxChunks,
        enabled: request.enabled !== false
    });

    if (JSON.stringify(request.decision) !== decisionSnapshot) {
        throw new LegalRagRuntimeError([issue("/decision", "The protected deterministic decision was mutated during RAG retrieval.", "legal-rag-decision-mutated")]);
    }

    return deepFreeze({
        runtimeVersion: LEGAL_RAG_RUNTIME_VERSION,
        runtimeRole: "post-decision-rag-routing-only",
        applicabilityAuthority: "none",
        llmUsed: false,
        usedForDecision: false,
        profile: resolved.profile,
        retrieval
    });
}

export function runLegalRagRetrievalSafely(input = {}) {
    try {
        return Object.freeze({ valid: true, value: runLegalRagRetrieval(input), errors: Object.freeze([]) });
    } catch (error) {
        const errors = error instanceof LegalRagRuntimeError
            ? error.issues
            : Object.freeze([issue("/", error?.message || "Unknown legal RAG runtime error.")]);
        return Object.freeze({ valid: false, value: null, errors });
    }
}

export default Object.freeze({
    version: LEGAL_RAG_RUNTIME_VERSION,
    validateLegalRagProfiles,
    resolveLegalRagProfile,
    runLegalRagRetrieval,
    runLegalRagRetrievalSafely
});
