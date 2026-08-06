"use strict";

/**
 * Runnable private-beta specifications for every governed legal profile.
 *
 * POSH Internal Committee threshold continues to use its existing reviewed
 * deterministic rule and statutory source catalogue. Every other profile uses
 * a conservative deterministic review decision and a governed readiness
 * record until its law-specific rule and statutory chunks replace the fallback.
 */

const BASE_PROFILE_REGISTRY = require("./growwithhr-rag/data/legal-rag-profiles.v1.json");
const ONBOARDING_REGISTRY = require("./data/legal-source-governance/all-laws-rag-onboarding.v1.json");

const MODULE_VERSION = "1.0.0";
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
    Object.entries(rawAnswers).slice(0, 64).forEach(([key, value]) => {
        const normalizedKey = text(key).slice(0, 100);
        const scalar = safeScalar(value);
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
        const answerCount = suppliedAnswerCount(request.answers);
        const missing = answerCount === 0;
        const status = missing ? "more-information-needed" : "specialist-review";
        const reasonCode = familyReasonCode(family.lawFamilyId, missing);
        const featureId = text(request.featureId || family.featureId);
        const ruleId = privateBetaRuleId(featureId);
        const reason = missing
            ? `No assessment facts were supplied for the ${family.title} private-beta review. The feature is runnable, but it cannot infer missing facts or reach an applicability conclusion.`
            : `The ${family.title} private-beta review received assessment information. Until the feature-specific deterministic rule and statutory corpus complete qualified review, the only permitted result is specialist review.`;

        return deepFreeze({
            productRuleId: `private-beta-${slug(family.lawFamilyId)}`,
            ruleId,
            ruleVersion: "0.1.0",
            sourceRecordId: `GOVERNANCE-${upperCode(family.lawFamilyId)}`,
            status,
            reasonCode,
            reason,
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
                "The retrieved readiness record is governance context and is not a substitute for the law-specific statutory corpus.",
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
    const basePoshCatalog = array(baseRegistry.catalogs).find((catalog) => text(catalog.catalogId) === "catalog.legal.posh.v1");
    const basePoshProfile = array(baseRegistry.profiles).find((profile) => text(profile.featureId) === POSH_THRESHOLD_FEATURE_ID);
    if (!basePoshCatalog || !basePoshProfile) throw new Error("The existing POSH private-beta profile is required.");

    const entries = featureEntries(onboarding);
    const allowedFeatureIds = entries
        .map((entry) => entry.featureId)
        .filter((featureId) => featureId !== POSH_THRESHOLD_FEATURE_ID)
        .sort();
    const profiles = [clone(basePoshProfile)];

    entries.forEach((entry) => {
        if (entry.featureId === POSH_THRESHOLD_FEATURE_ID) return;
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

    return deepFreeze({
        schemaVersion: 1,
        registryVersion: "0.2.0",
        title: "GrowWithHR all-laws runnable private-beta RAG profiles",
        updatedAt: "2026-08-06",
        runtimeRole: "post-decision-rag-routing-only",
        applicabilityAuthority: "none",
        llmRole: "explanation-only",
        legalReviewStatus: "needs-legal-review",
        defaults: clone(object(baseRegistry).defaults),
        catalogs: [
            clone(basePoshCatalog),
            {
                catalogId: FALLBACK_CATALOG_ID,
                lawFamilyId: "all-laws-governance-fallback",
                catalogPath: FALLBACK_CATALOG_PATH,
                format: "governed-legal-source-chunks-v1",
                runtimeStatus: "available-private-beta",
                legalReviewStatus: "needs-legal-review",
                catalogMode: "governance-fallback",
                allowedFeatureIds
            }
        ],
        profiles,
        limitations: [
            "Every registered profile is callable in private beta.",
            "Only the POSH Internal Committee threshold currently uses a law-specific deterministic rule and statutory chunk catalogue.",
            "Fallback profiles may emit only more-information-needed or specialist-review.",
            "Fallback retrieval cites governance readiness records rather than claiming a complete statutory corpus.",
            "A language model may explain a deterministic result but cannot create or change it."
        ]
    });
}

function createAllLawsPrivateBetaFeatureSpecifications(options = {}) {
    const onboarding = object(options).onboardingRegistry || ONBOARDING_REGISTRY;
    const specifications = {};
    featureEntries(onboarding).forEach((entry) => {
        if (entry.featureId === POSH_THRESHOLD_FEATURE_ID) return;
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
