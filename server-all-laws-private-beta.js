"use strict";

/**
 * Runnable private-beta registry for every governed legal profile.
 *
 * Seven POSH profiles use substantive, source-scoped deterministic catalogs:
 * the existing Internal Committee threshold plus the six Wave 1 controls.
 * The remaining profiles retain conservative governance-fallback behavior.
 */

const BASE_PROFILE_REGISTRY = require("./growwithhr-rag/data/legal-rag-profiles.v1.json");
const ONBOARDING_REGISTRY = require("./data/legal-source-governance/all-laws-rag-onboarding.v1.json");
const {
    POSH_CATALOG_ID,
    POSH_WAVE1_CATALOG_PATH,
    POSH_WAVE1_PROFILE_DEFINITIONS,
    POSH_WAVE1_FEATURE_IDS
} = require("./server-posh-wave1-rule-catalogs.js");

const MODULE_VERSION = "1.1.0";
const POSH_THRESHOLD_FEATURE_ID = "feature.legal.posh.internal-committee-threshold";
const FALLBACK_CATALOG_ID = "catalog.legal.all-laws-governance-fallback.v1";
const FALLBACK_CATALOG_PATH = "growwithhr-rag/data/all-laws-governance-fallback-chunks.v1.json";
const GENERIC_PARENT_FEATURES = Object.freeze([
    Object.freeze({
        featureId: "feature.legal.social-security",
        lawFamilyId: "social-security",
        title: "Social Security Code feature-family review",
        sourceStatus: "family-routing-and-scheme-selection-required",
        nextControlledAction: "Select the relevant Social Security chapter or scheme and complete its governed feature-specific review."
    })
]);

const object = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const array = (value) => Array.isArray(value) ? value : [];
const text = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const clone = (value) => JSON.parse(JSON.stringify(value));

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
}

function unique(values) {
    return [...new Set(array(values).map(text).filter(Boolean))];
}

function slug(value) {
    return text(value)
        .toLowerCase()
        .replace(/^feature\.legal\./, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function upperCode(value) {
    return text(value)
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
}

function familySourceId(lawFamilyId) {
    return `governance-${slug(lawFamilyId)}-readiness`;
}

function familyReasonCode(lawFamilyId, missing) {
    return `${upperCode(lawFamilyId)}_${missing ? "REQUIRED_FACTS_MISSING" : "SPECIALIST_REVIEW_REQUIRED"}`;
}

function privateBetaRuleId(featureId) {
    return `rule.legal.${text(featureId).replace(/^feature\.legal\./, "")}.private-beta-review`;
}

function familyEntries(onboarding = ONBOARDING_REGISTRY) {
    const entries = array(object(onboarding).families).map((family) => ({
        lawFamilyId: text(family.lawFamilyId),
        title: text(family.title),
        sourceStatus: text(family.controlledSourceStatus),
        nextControlledAction: text(family.nextControlledAction),
        candidateFeatureIds: unique(family.candidateFeatureIds)
    }));
    GENERIC_PARENT_FEATURES.forEach((entry) => entries.push({
        ...entry,
        candidateFeatureIds: [entry.featureId]
    }));
    return entries;
}

function featureEntries(onboarding = ONBOARDING_REGISTRY) {
    const entries = [];
    familyEntries(onboarding).forEach((family) => {
        family.candidateFeatureIds.forEach((featureId) => entries.push(deepFreeze({
            featureId,
            lawFamilyId: family.lawFamilyId,
            title: family.title,
            sourceStatus: family.sourceStatus,
            nextControlledAction: family.nextControlledAction
        })));
    });
    return entries;
}

function safeScalar(value) {
    if (value === null) return null;
    if (["string", "number", "boolean"].includes(typeof value)) return value;
    return undefined;
}

function normalizeGenericLegalBody(value) {
    const source = object(value);
    const rawAnswers = object(source.answers);
    const answers = {};
    Object.entries(rawAnswers).slice(0, 64).forEach(([key, answerValue]) => {
        const normalizedKey = text(key).slice(0, 100);
        const scalar = safeScalar(answerValue);
        if (!normalizedKey || scalar === undefined) return;
        answers[normalizedKey] = typeof scalar === "string" ? scalar.slice(0, 500) : scalar;
    });
    return deepFreeze({ answers });
}

function suppliedAnswerCount(answersValue) {
    return Object.values(object(answersValue)).filter((value) => {
        if (value === null || value === undefined) return false;
        if (typeof value === "string") return text(value).length > 0;
        return ["number", "boolean"].includes(typeof value);
    }).length;
}

function createConservativeDecisionEvaluator(entry) {
    const family = deepFreeze(clone(entry));
    return function evaluateConservativeDecision(input = {}) {
        const request = object(input);
        const missing = suppliedAnswerCount(request.answers) === 0;
        const status = missing ? "more-information-needed" : "specialist-review";
        const reasonCode = familyReasonCode(family.lawFamilyId, missing);
        const featureId = text(request.featureId || family.featureId);
        return deepFreeze({
            productRuleId: `private-beta-${slug(family.lawFamilyId)}`,
            ruleId: privateBetaRuleId(featureId),
            ruleVersion: "0.1.0",
            sourceRecordId: `GOVERNANCE-${upperCode(family.lawFamilyId)}`,
            status,
            reasonCode,
            reason: missing
                ? `No assessment facts were supplied for the ${family.title} private-beta review. Missing facts are not inferred.`
                : `The ${family.title} private-beta route received assessment information, but its law-specific rule and statutory catalogue remain under controlled onboarding.`,
            requiredFactIds: [],
            triggeringFactIds: [],
            missingFactIds: missing ? ["fact.feature-specific-input"] : [],
            sourceIds: [],
            sourceRegistryIds: [familySourceId(family.lawFamilyId)],
            sourceSections: [{
                registrySourceId: familySourceId(family.lawFamilyId),
                reference: "Governed RAG onboarding readiness record",
                purpose: "Private-beta source-readiness and escalation boundary"
            }],
            legalReviewStatus: "needs-legal-review",
            limitations: [
                "This private-beta feature does not make a positive or negative legal applicability conclusion.",
                "The retrieved readiness record is governance context and is not statutory legal content.",
                "Retrieval and model output cannot create facts or change the deterministic decision.",
                family.nextControlledAction
            ]
        });
    };
}

function buildAllLawsPrivateBetaRegistry(options = {}) {
    const source = object(options);
    const baseRegistry = source.baseRegistry || BASE_PROFILE_REGISTRY;
    const onboarding = source.onboardingRegistry || ONBOARDING_REGISTRY;
    const basePoshCatalog = array(baseRegistry.catalogs)
        .find((catalog) => text(catalog.catalogId) === POSH_CATALOG_ID);
    const basePoshProfile = array(baseRegistry.profiles)
        .find((profile) => text(profile.featureId) === POSH_THRESHOLD_FEATURE_ID);
    if (!basePoshCatalog || !basePoshProfile) {
        throw new Error("The existing POSH threshold catalogue and profile are required.");
    }

    const entries = featureEntries(onboarding);
    const wave1ByFeature = new Map(POSH_WAVE1_PROFILE_DEFINITIONS.map((item) => [item.featureId, item]));
    const substantiveFeatureIds = new Set([POSH_THRESHOLD_FEATURE_ID, ...POSH_WAVE1_FEATURE_IDS]);
    const fallbackFeatureIds = entries
        .map((entry) => entry.featureId)
        .filter((featureId) => !substantiveFeatureIds.has(featureId))
        .sort();

    const thresholdProfile = {
        ...clone(basePoshProfile),
        activationStatus: "active-private-beta",
        catalogId: POSH_CATALOG_ID,
        explanationEnabled: true,
        privateBetaMode: "statutory-catalogue",
        blockers: []
    };
    const profiles = [thresholdProfile];

    entries.forEach((entry) => {
        if (entry.featureId === POSH_THRESHOLD_FEATURE_ID) return;
        const wave1 = wave1ByFeature.get(entry.featureId);
        if (wave1) {
            profiles.push({
                profileId: `rag.legal.${entry.featureId.replace(/^feature\.legal\./, "")}`,
                featureId: entry.featureId,
                lawFamilyId: "posh",
                activationStatus: "active-private-beta",
                catalogId: POSH_CATALOG_ID,
                ruleIds: [wave1.ruleId],
                productRuleIds: [wave1.productRuleId],
                queryTerms: clone(wave1.queryTerms),
                maxChunks: wave1.maxChunks,
                explanationEnabled: true,
                compatibilityRoutes: [],
                privateBetaMode: "statutory-catalogue",
                blockers: []
            });
            return;
        }
        profiles.push({
            profileId: `rag.legal.${entry.featureId.replace(/^feature\.legal\./, "")}`,
            featureId: entry.featureId,
            lawFamilyId: entry.lawFamilyId,
            activationStatus: "active-private-beta",
            catalogId: FALLBACK_CATALOG_ID,
            ruleIds: [privateBetaRuleId(entry.featureId)],
            productRuleIds: [],
            queryTerms: unique([
                entry.title,
                entry.lawFamilyId,
                entry.featureId.replace(/^feature\.legal\./, "").replace(/[.-]+/g, " "),
                "specialist review",
                "more information needed",
                "source readiness"
            ]),
            maxChunks: 2,
            explanationEnabled: true,
            compatibilityRoutes: [],
            privateBetaMode: "governance-fallback",
            blockers: []
        });
    });

    const poshCatalog = {
        ...clone(basePoshCatalog),
        catalogPath: POSH_WAVE1_CATALOG_PATH,
        runtimeStatus: "available-private-beta",
        legalReviewStatus: "needs-legal-review",
        catalogMode: "statutory",
        allowedFeatureIds: [...substantiveFeatureIds].sort()
    };

    return deepFreeze({
        schemaVersion: 1,
        registryVersion: "0.3.0",
        title: "GrowWithHR all-laws runnable private-beta RAG profiles",
        updatedAt: "2026-08-06",
        runtimeRole: "post-decision-rag-routing-only",
        applicabilityAuthority: "none",
        llmRole: "explanation-only",
        legalReviewStatus: "needs-legal-review",
        defaults: clone(object(baseRegistry).defaults),
        catalogs: [
            poshCatalog,
            {
                catalogId: FALLBACK_CATALOG_ID,
                lawFamilyId: "all-laws-governance-fallback",
                catalogPath: FALLBACK_CATALOG_PATH,
                format: "governed-legal-source-chunks-v1",
                runtimeStatus: "available-private-beta",
                legalReviewStatus: "needs-legal-review",
                catalogMode: "governance-fallback",
                allowedFeatureIds: fallbackFeatureIds
            }
        ],
        profiles,
        limitations: [
            "Every registered profile is callable in private beta.",
            "Seven POSH profiles use feature-specific deterministic rules and the governed POSH statutory catalogue.",
            "The remaining profiles use conservative governance-fallback rules until their law-specific sources and rules complete review.",
            "No profile is legally approved; substantive POSH control outcomes remain specialist-review or more-information-needed.",
            "A language model may explain a deterministic result but cannot create or change it."
        ]
    });
}

function createAllLawsPrivateBetaFeatureSpecifications(options = {}) {
    const onboarding = object(options).onboardingRegistry || ONBOARDING_REGISTRY;
    const specifications = {};
    const substantiveFeatureIds = new Set([POSH_THRESHOLD_FEATURE_ID, ...POSH_WAVE1_FEATURE_IDS]);
    featureEntries(onboarding).forEach((entry) => {
        if (substantiveFeatureIds.has(entry.featureId)) return;
        specifications[entry.featureId] = deepFreeze({
            featureId: entry.featureId,
            lawFamilyId: entry.lawFamilyId,
            normalizeBody: normalizeGenericLegalBody,
            evaluateDecision: createConservativeDecisionEvaluator(entry),
            privateBetaMode: "governance-fallback"
        });
    });
    return deepFreeze(specifications);
}

module.exports = Object.freeze({
    MODULE_VERSION,
    POSH_THRESHOLD_FEATURE_ID,
    FALLBACK_CATALOG_ID,
    FALLBACK_CATALOG_PATH,
    familySourceId,
    familyReasonCode,
    privateBetaRuleId,
    normalizeGenericLegalBody,
    createConservativeDecisionEvaluator,
    buildAllLawsPrivateBetaRegistry,
    createAllLawsPrivateBetaFeatureSpecifications
});
