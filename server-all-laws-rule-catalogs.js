"use strict";

/**
 * Deterministic rule catalogs for the shared legal explanation route.
 *
 * POSH Wave 1 profiles use feature-specific statutory catalogs. Remaining
 * profiles retain conservative escalation-only catalogs until their controlled
 * law-specific onboarding is complete.
 */

const ONBOARDING_REGISTRY = require("./data/legal-source-governance/all-laws-rag-onboarding.v1.json");
const {
    POSH_THRESHOLD_FEATURE_ID,
    familySourceId,
    familyReasonCode,
    privateBetaRuleId,
    normalizeGenericLegalBody
} = require("./server-all-laws-private-beta.js");
const {
    POSH_WAVE1_FEATURE_IDS,
    createPoshWave1FeatureSpecifications
} = require("./server-posh-wave1-rule-catalogs.js");

const MODULE_VERSION = "1.1.0";
const GOVERNANCE_URL = "https://github.com/hrtechifyed/GrowwithHR-Version2/blob/main/data/legal-source-governance/all-laws-rag-onboarding.v1.json";

const object = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const array = (value) => Array.isArray(value) ? value : [];
const text = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
}

function slug(value) {
    return text(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function featureEntries() {
    const entries = [];
    array(object(ONBOARDING_REGISTRY).families).forEach((family) => {
        array(family.candidateFeatureIds).forEach((featureId) => entries.push({
            featureId: text(featureId),
            lawFamilyId: text(family.lawFamilyId),
            title: text(family.title),
            nextControlledAction: text(family.nextControlledAction)
        }));
    });
    entries.push({
        featureId: "feature.legal.social-security",
        lawFamilyId: "social-security",
        title: "Social Security Code feature-family review",
        nextControlledAction: "Select the relevant Social Security chapter or scheme and complete its governed feature-specific review."
    });
    return entries;
}

function sourceId(lawFamilyId) {
    return `source.governance.${slug(lawFamilyId)}.readiness`;
}

function recommendation(prefix, title, action) {
    return {
        id: `recommendation.legal.${prefix}`,
        title,
        action,
        timeline: "Before relying on the private-beta result as a legal conclusion",
        limitations: [
            "The result is a conservative private-beta escalation outcome.",
            "The complete law-specific statutory corpus and deterministic rule remain subject to qualified review."
        ]
    };
}

function buildConservativeRuleCatalog(entryValue) {
    const entry = object(entryValue);
    const familyId = text(entry.lawFamilyId);
    const featureId = text(entry.featureId);
    const familySlug = slug(familyId);
    const featureSlug = slug(featureId.replace(/^feature\.legal\./, ""));
    const registrySourceId = familySourceId(familyId);
    const matchedReasonCode = familyReasonCode(familyId, false);
    const missingReasonCode = familyReasonCode(familyId, true);
    const structuralReasonCode = `${familySlug.toUpperCase().replace(/-/g, "_")}_STRUCTURAL_NOT_MATCHED`;
    const governedSourceId = sourceId(familyId);
    const ruleId = privateBetaRuleId(featureId);

    return deepFreeze({
        catalogVersion: "0.1.0",
        title: `${entry.title} conservative private-beta rule catalog`,
        updatedAt: "2026-08-06",
        jurisdiction: "India and selected jurisdictions",
        legalRuleCatalog: true,
        legalReviewStatus: "needs-legal-review",
        applicabilityAuthority: "deterministic-only",
        retrievalRole: "source-retrieval-only",
        llmRole: "explanation-only",
        advisoryOnly: true,
        privateBetaOnly: true,
        stableReportMutation: false,
        sourceRegistry: {
            name: "All-laws governed RAG onboarding registry",
            location: "data/legal-source-governance/all-laws-rag-onboarding.v1.json",
            reviewStatus: "needs-legal-review"
        },
        approval: { status: "draft", approvedBy: null, approvedAt: null },
        defaults: {
            ruleVersion: "0.1.0",
            requiredFactMode: "all",
            evidence: {
                status: "not-verified",
                notes: "Assessment facts and legal applicability have not been independently verified.",
                verificationProcessId: null,
                verifiedAt: null
            },
            limitations: [
                "This catalog is conservative private-beta product logic and is not legal approval.",
                "Valid requests emit only specialist-review or more-information-needed.",
                "Retrieval and language-model output cannot create facts or change the result."
            ]
        },
        sources: [{
            id: governedSourceId,
            registrySourceId,
            title: `${entry.title} governed readiness record`,
            publisher: "GrowWithHR",
            url: GOVERNANCE_URL,
            jurisdiction: "Governance boundary",
            sourceType: "authoritative-professional-guidance",
            documentType: "internal-governance-readiness-record",
            reviewedAt: "2026-08-06",
            reviewStatus: "needs-legal-review",
            fileName: "all-laws-rag-onboarding.v1.json",
            drivePath: `repository://data/legal-source-governance/all-laws-rag-onboarding.v1.json#${familySlug}`,
            notes: "Governance readiness context only; not statutory legal content.",
            official: true
        }],
        rules: [{
            id: ruleId,
            productRuleId: `private-beta-${familySlug}`,
            version: "0.1.0",
            domain: "legal",
            title: `${entry.title} conservative private-beta review`,
            description: "Runs a deterministic escalation-only review while the law-specific statutory corpus and substantive rule remain under controlled onboarding.",
            jurisdiction: { country: "IN", level: "review-boundary", code: "IN" },
            sourceRecordId: `GOVERNANCE-${familySlug.toUpperCase().replace(/-/g, "_")}`,
            legalReviewStatus: "needs-legal-review",
            requiredAssessmentFacts: [{
                factId: "fact.workforce.employee-count",
                sourceAssessmentField: "employees",
                type: "non-negative-integer",
                required: true
            }],
            requiredFactMode: "all",
            requiredFactIds: ["fact.workforce.employee-count"],
            missingInformationHandling: {
                defaultStatus: "more-information-needed",
                reasonCode: missingReasonCode,
                neverInferMissingFacts: true,
                allowRetrievalToFillFacts: false,
                allowLlmToFillFacts: false
            },
            match: {
                mode: "all",
                conditions: [{ factId: "fact.workforce.employee-count", operator: "exists" }]
            },
            outcomes: {
                matched: {
                    status: "specialist-review",
                    reasonCode: matchedReasonCode,
                    reason: `${entry.title} is runnable in private beta. The supplied employee count permits the deterministic review to run, but the feature-specific legal rule and statutory source corpus are not qualified for a substantive conclusion.`,
                    recommendation: recommendation(
                        `${featureSlug}.specialist-review`,
                        `Complete the ${entry.title} specialist review`,
                        entry.nextControlledAction
                    )
                },
                notMatched: {
                    status: "not-currently-applicable",
                    reasonCode: structuralReasonCode,
                    reason: "This structural branch is unreachable for a valid request and must not be presented as a substantive legal conclusion.",
                    recommendation: null
                },
                missing: {
                    status: "more-information-needed",
                    reasonCode: missingReasonCode,
                    reason: `Employee count is required to run the conservative ${entry.title} private-beta review.`,
                    recommendation: recommendation(
                        `${featureSlug}.confirm-input`,
                        `Confirm the ${entry.title} review input`,
                        "Confirm the organisation's non-negative employee count, then re-run the deterministic review."
                    )
                }
            },
            permittedResultStatuses: ["specialist-review", "more-information-needed", "not-currently-applicable"],
            sourceIds: [governedSourceId],
            officialSourceIds: [registrySourceId],
            sourceSections: [{
                registrySourceId,
                reference: "Governed RAG onboarding readiness record",
                purpose: "Private-beta source-readiness and escalation boundary"
            }],
            effectiveDateMetadata: {
                effectiveFrom: "2026-08-06",
                effectiveTo: null,
                sourceRegistryId: registrySourceId
            },
            limitations: [
                "legalReviewStatus remains needs-legal-review.",
                "The retrieved readiness record is not statutory legal content.",
                "Retrieval and language models cannot create facts or change the deterministic result."
            ],
            automatedBoundaryTestScenarios: [
                {
                    scenarioId: `${featureSlug}-input-present`,
                    description: "A non-negative employee count is supplied.",
                    answers: { employees: 1 },
                    expectedStatus: "specialist-review",
                    expectedReasonCode: matchedReasonCode
                },
                {
                    scenarioId: `${featureSlug}-input-missing`,
                    description: "The employee count is not supplied.",
                    answers: {},
                    expectedStatus: "more-information-needed",
                    expectedReasonCode: missingReasonCode
                }
            ]
        }]
    });
}

function createRunnableAllLawsFeatureSpecifications() {
    const specifications = {
        ...createPoshWave1FeatureSpecifications()
    };
    const wave1Ids = new Set(POSH_WAVE1_FEATURE_IDS);
    featureEntries().forEach((entry) => {
        if (entry.featureId === POSH_THRESHOLD_FEATURE_ID || wave1Ids.has(entry.featureId)) return;
        specifications[entry.featureId] = deepFreeze({
            featureId: entry.featureId,
            lawFamilyId: entry.lawFamilyId,
            normalizeBody: normalizeGenericLegalBody,
            ruleCatalog: buildConservativeRuleCatalog(entry),
            privateBetaMode: "governance-fallback"
        });
    });
    return deepFreeze(specifications);
}

module.exports = Object.freeze({
    MODULE_VERSION,
    buildConservativeRuleCatalog,
    createRunnableAllLawsFeatureSpecifications
});
