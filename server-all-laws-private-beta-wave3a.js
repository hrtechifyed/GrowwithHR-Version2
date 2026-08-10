"use strict";

const base = require("./server-all-laws-private-beta.js");
const {
    EPF_WAVE3A_CATALOG_ID,
    EPF_WAVE3A_CATALOG_PATH,
    EPF_WAVE3A_FEATURE_IDS,
    EPF_WAVE3A_PROFILE_DEFINITIONS
} = require("./server-epf-wave3a-rule-catalogs.js");

const MODULE_VERSION = "1.0.0";
const object = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const array = (value) => Array.isArray(value) ? value : [];
const text = (value) => String(value ?? "").trim();
const clone = (value) => JSON.parse(JSON.stringify(value));

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
}

function buildAllLawsPrivateBetaRegistry(options = {}) {
    const registry = clone(base.buildAllLawsPrivateBetaRegistry(options));
    const definitionByFeature = new Map(
        EPF_WAVE3A_PROFILE_DEFINITIONS.map((item) => [item.featureId, item])
    );
    const epfIds = new Set(EPF_WAVE3A_FEATURE_IDS);

    registry.profiles = array(registry.profiles).map((profileValue) => {
        const profile = object(profileValue);
        const definition = definitionByFeature.get(text(profile.featureId));
        if (!definition) return profile;
        return {
            ...profile,
            lawFamilyId: "epf-eps-edli",
            catalogId: EPF_WAVE3A_CATALOG_ID,
            ruleIds: [definition.ruleId],
            productRuleIds: [definition.productRuleId],
            queryTerms: clone(definition.queryTerms),
            maxChunks: definition.maxChunks,
            privateBetaMode: "statutory-catalogue",
            activationStatus: "active-private-beta",
            explanationEnabled: true,
            blockers: []
        };
    });

    const fallback = array(registry.catalogs)
        .find((catalog) => text(object(catalog).catalogId) === base.FALLBACK_CATALOG_ID);
    if (!fallback) throw new Error("The all-laws governance fallback catalogue is required.");
    fallback.allowedFeatureIds = array(fallback.allowedFeatureIds)
        .filter((featureId) => !epfIds.has(text(featureId)))
        .sort();

    registry.catalogs.push({
        catalogId: EPF_WAVE3A_CATALOG_ID,
        lawFamilyId: "epf-eps-edli",
        catalogPath: EPF_WAVE3A_CATALOG_PATH,
        format: "governed-legal-source-chunks-v1",
        runtimeStatus: "available-private-beta",
        legalReviewStatus: "needs-legal-review",
        catalogMode: "statutory",
        allowedFeatureIds: [...EPF_WAVE3A_FEATURE_IDS].sort()
    });
    registry.catalogs.sort((left, right) => text(left.catalogId).localeCompare(text(right.catalogId)));
    registry.registryVersion = "0.5.0";
    registry.updatedAt = "2026-08-06";
    registry.limitations = [
        "Every registered profile is callable in private beta.",
        "Seven POSH, ten Maternity Benefit and five EPF operational profiles use feature-specific deterministic rules and governed statutory catalogues.",
        "The remaining profiles use conservative governance-fallback rules until their law-specific sources and rules complete review.",
        "No profile is legally approved; substantive outcomes remain specialist-review or more-information-needed.",
        "EPF Wave 3A excludes contribution-rate selection, wage ceilings, exemptions, international-worker treatment, EPS routing and EDLI rates.",
        "A language model may explain a deterministic result but cannot create or change it."
    ];
    return deepFreeze(registry);
}

module.exports = Object.freeze({
    ...base,
    MODULE_VERSION,
    buildAllLawsPrivateBetaRegistry
});
