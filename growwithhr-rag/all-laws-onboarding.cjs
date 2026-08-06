"use strict";

/**
 * All-laws governed RAG onboarding controls.
 *
 * This module prepares and validates candidate profiles. It does not load
 * source PDFs, curate legal text, evaluate applicability, call a provider or
 * activate a feature. A blank review field is never approval.
 */

const DEFAULT_REGISTRY = require("../data/legal-source-governance/all-laws-rag-onboarding.v1.json");

const MODULE_VERSION = "1.0.0";
const ACTIVE_FEATURE_ID = "feature.legal.posh.internal-committee-threshold";
const APPROVED_LEGAL_STATUSES = new Set(["approved", "approved-with-conditions"]);
const REQUIRED_APPROVAL_KEYS = Object.freeze([
    "legalReview",
    "privacyReview",
    "ragApproval",
    "sourceFiles",
    "sectionMappings",
    "assessmentFacts",
    "deterministicRules",
    "catalogCompilation",
    "testApproval",
    "securityApproval",
    "runtimeActivation"
]);

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

function safeRepositoryJsonPath(value) {
    const normalized = text(value).replaceAll("\\", "/");
    return Boolean(
        normalized &&
        normalized.endsWith(".json") &&
        !normalized.startsWith("/") &&
        !normalized.includes("../")
    );
}

class AllLawsRagOnboardingError extends Error {
    constructor(message, options = {}) {
        super(text(message) || "All-laws RAG onboarding validation failed.");
        this.name = "AllLawsRagOnboardingError";
        this.code = text(options.code) || "all-laws-rag-onboarding-invalid";
        this.familyId = text(options.familyId);
        this.featureId = text(options.featureId);
        this.missingApprovals = Object.freeze(array(options.missingApprovals).map(text).filter(Boolean));
    }
}

function validateAllLawsOnboardingRegistry(value = DEFAULT_REGISTRY) {
    const registry = object(value);
    const issues = [];
    const families = array(registry.families);
    const familyIds = new Set();
    const featureIds = new Set();
    const activeFeatureIds = [];

    if (registry.schemaVersion !== 1) issues.push("schemaVersion must be 1.");
    if (registry.runtimeRole !== "candidate-onboarding-only") issues.push("runtimeRole must remain candidate-onboarding-only.");
    if (registry.applicabilityAuthority !== "none") issues.push("The onboarding registry must have no applicability authority.");
    if (registry.automaticLegalInterpretation !== false) issues.push("Automatic legal interpretation must remain disabled.");
    if (registry.sourceRegistrationIsApproval !== false) issues.push("Source registration cannot be approval.");
    if (registry.blankReviewIsApproval !== false) issues.push("Blank review fields cannot be approval.");
    if (families.length !== 16) issues.push("Exactly 16 governed law-family onboarding records are required.");

    const requiredApprovals = array(registry.requiredActivationApprovals);
    if (JSON.stringify(requiredApprovals) !== JSON.stringify(REQUIRED_APPROVAL_KEYS)) {
        issues.push("The activation approval sequence changed.");
    }

    families.forEach((family, index) => {
        const entry = object(family);
        const familyId = text(entry.lawFamilyId);
        if (!familyId || familyIds.has(familyId)) issues.push(`Family ${index} has a missing or duplicate lawFamilyId.`);
        familyIds.add(familyId);
        if (!text(entry.title)) issues.push(`Family ${familyId} requires a title.`);
        if (!text(entry.parentFeatureId).startsWith("feature.legal.")) issues.push(`Family ${familyId} requires a legal parentFeatureId.`);
        if (!safeRepositoryJsonPath(entry.candidateManifestPath)) issues.push(`Family ${familyId} has an unsafe candidate manifest path.`);
        if (!safeRepositoryJsonPath(entry.catalogPath)) issues.push(`Family ${familyId} has an unsafe catalogue path.`);
        if (!array(entry.governanceArtifacts).length) issues.push(`Family ${familyId} requires governance artifacts.`);

        const candidates = array(entry.candidateFeatureIds).map(text).filter(Boolean);
        if (!candidates.length) issues.push(`Family ${familyId} requires candidate features.`);
        candidates.forEach((featureId) => {
            if (!featureId.startsWith("feature.legal.")) issues.push(`Family ${familyId} has an invalid feature ID ${featureId}.`);
            if (featureIds.has(featureId)) issues.push(`Duplicate candidate feature ID ${featureId}.`);
            featureIds.add(featureId);
        });

        const active = array(entry.activeFeatureIds).map(text).filter(Boolean);
        const blocked = array(entry.blockedFeatureIds).map(text).filter(Boolean);
        active.forEach((featureId) => {
            if (!candidates.includes(featureId)) issues.push(`Active feature ${featureId} is not a candidate of ${familyId}.`);
            activeFeatureIds.push(featureId);
        });
        blocked.forEach((featureId) => {
            if (!candidates.includes(featureId)) issues.push(`Blocked feature ${featureId} is not a candidate of ${familyId}.`);
        });
        if (new Set([...active, ...blocked]).size !== candidates.length) {
            issues.push(`Family ${familyId} must classify every candidate as active or blocked.`);
        }
        if (familyId !== "posh" && active.length) issues.push(`Only POSH may contain an active feature.`);
        if (familyId !== "posh" && entry.runtimeActivation !== "blocked") {
            issues.push(`Family ${familyId} must remain runtime blocked.`);
        }
    });

    if (featureIds.size !== 56) issues.push("Exactly 56 feature-level onboarding candidates are required.");
    if (activeFeatureIds.length !== 1 || activeFeatureIds[0] !== ACTIVE_FEATURE_ID) {
        issues.push("The POSH Internal Committee threshold must remain the only active candidate.");
    }

    return deepFreeze({
        valid: issues.length === 0,
        issues,
        familyCount: families.length,
        featureCount: featureIds.size,
        activeFeatureIds
    });
}

function assertValidRegistry(registry) {
    const validation = validateAllLawsOnboardingRegistry(registry);
    if (!validation.valid) {
        throw new AllLawsRagOnboardingError(validation.issues.join("\n"), {
            code: "all-laws-rag-registry-invalid"
        });
    }
    return registry;
}

function familyIndex(registry = DEFAULT_REGISTRY) {
    const valid = assertValidRegistry(registry);
    return new Map(array(valid.families).map((family) => [text(family.lawFamilyId), family]));
}

function featureIndex(registry = DEFAULT_REGISTRY) {
    const valid = assertValidRegistry(registry);
    const result = new Map();
    array(valid.families).forEach((family) => {
        array(family.candidateFeatureIds).forEach((featureId) => {
            result.set(text(featureId), family);
        });
    });
    return result;
}

function resolveLawFamily(lawFamilyId, registry = DEFAULT_REGISTRY) {
    const family = familyIndex(registry).get(text(lawFamilyId));
    if (!family) {
        throw new AllLawsRagOnboardingError("The requested law family is not registered.", {
            code: "all-laws-rag-family-not-found",
            familyId: lawFamilyId
        });
    }
    return deepFreeze(clone(family));
}

function resolveCandidateFeature(featureId, registry = DEFAULT_REGISTRY) {
    const family = featureIndex(registry).get(text(featureId));
    if (!family) {
        throw new AllLawsRagOnboardingError("The requested legal feature is not registered for RAG onboarding.", {
            code: "all-laws-rag-feature-not-found",
            featureId
        });
    }
    const active = array(family.activeFeatureIds).includes(text(featureId));
    return deepFreeze({
        featureId: text(featureId),
        lawFamilyId: text(family.lawFamilyId),
        parentFeatureId: text(family.parentFeatureId),
        candidateManifestPath: text(family.candidateManifestPath),
        catalogPath: text(family.catalogPath),
        activationStatus: active ? "active-private-beta" : "blocked-awaiting-approval",
        explanationEnabled: active,
        usedForDecision: false,
        mayChangeDecision: false
    });
}

function buildCandidateManifestBlueprint(lawFamilyId, registry = DEFAULT_REGISTRY) {
    const family = resolveLawFamily(lawFamilyId, registry);
    return deepFreeze({
        schemaVersion: 1,
        candidateManifestVersion: "0.1.0",
        lawFamilyId: family.lawFamilyId,
        title: `${family.title} governed source-pack candidate`,
        status: "blocked-candidate-manifest",
        builderCompatible: false,
        applicabilityAuthority: "none",
        automaticLegalInterpretation: false,
        sourceStatus: family.controlledSourceStatus,
        governanceArtifacts: clone(family.governanceArtifacts),
        outputCatalogPath: family.catalogPath,
        candidateFeatureIds: clone(family.candidateFeatureIds),
        sources: [],
        chunks: [],
        publication: {
            status: "blocked-awaiting-exact-file-and-legal-approval",
            legalReviewStatus: "needs-legal-review",
            privacyReviewStatus: "needs-privacy-review",
            ragApprovalStatus: "not-approved",
            sourceFilesApproved: false,
            sectionMappingsApproved: false,
            assessmentFactsApproved: false,
            deterministicRulesApproved: false,
            catalogCompiled: false,
            testApprovalStatus: "not-approved",
            securityApprovalStatus: "not-approved",
            runtimeActivationApproved: false,
            approvedBy: null,
            approvedAt: null
        },
        nextControlledAction: family.nextControlledAction
    });
}

function approvalState(value) {
    const approval = object(value);
    return {
        legalReview: APPROVED_LEGAL_STATUSES.has(text(approval.legalReviewStatus)),
        privacyReview: text(approval.privacyReviewStatus) === "approved",
        ragApproval: text(approval.ragApprovalStatus) === "approved",
        sourceFiles: approval.sourceFilesApproved === true,
        sectionMappings: approval.sectionMappingsApproved === true,
        assessmentFacts: approval.assessmentFactsApproved === true,
        deterministicRules: approval.deterministicRulesApproved === true,
        catalogCompilation: approval.manifestVerified === true && approval.catalogCompiled === true,
        testApproval: text(approval.testApprovalStatus) === "approved",
        securityApproval: text(approval.securityApprovalStatus) === "approved",
        runtimeActivation: approval.runtimeActivationApproved === true
    };
}

function assertCandidateActivationApproved(featureId, approvalValue, registry = DEFAULT_REGISTRY) {
    const candidate = resolveCandidateFeature(featureId, registry);
    if (candidate.activationStatus === "active-private-beta") return candidate;

    const approval = object(approvalValue);
    const state = approvalState(approval);
    const missingApprovals = REQUIRED_APPROVAL_KEYS.filter((key) => state[key] !== true);
    if (!text(approval.approvedBy)) missingApprovals.push("approvedBy");
    if (!/^\d{4}-\d{2}-\d{2}(?:T.*Z)?$/.test(text(approval.approvedAt))) missingApprovals.push("approvedAt");

    if (missingApprovals.length) {
        throw new AllLawsRagOnboardingError(
            "The legal feature cannot be activated because mandatory approvals are incomplete.",
            {
                code: "all-laws-rag-activation-blocked",
                familyId: candidate.lawFamilyId,
                featureId: candidate.featureId,
                missingApprovals
            }
        );
    }

    return deepFreeze({
        ...clone(candidate),
        activationStatus: "approved-for-runtime-activation",
        explanationEnabled: true,
        approvalFingerprintInput: {
            approvedBy: text(approval.approvedBy),
            approvedAt: text(approval.approvedAt),
            legalReviewStatus: text(approval.legalReviewStatus)
        }
    });
}

function buildAllLawsReadinessSnapshot(registry = DEFAULT_REGISTRY) {
    const validation = validateAllLawsOnboardingRegistry(registry);
    if (!validation.valid) assertValidRegistry(registry);
    const families = array(registry.families);
    const activeFeatureCount = validation.activeFeatureIds.length;
    return deepFreeze({
        moduleVersion: MODULE_VERSION,
        registryVersion: text(registry.registryVersion),
        platformStatus: "all-laws-onboarding-implemented-approval-gated",
        applicabilityAuthority: "deterministic-only-outside-this-module",
        retrievalRole: "governed-source-retrieval-only",
        providerRole: "explanation-only",
        familyCount: validation.familyCount,
        featureCount: validation.featureCount,
        activeFeatureCount,
        blockedFeatureCount: validation.featureCount - activeFeatureCount,
        activeFeatureIds: validation.activeFeatureIds,
        families: families.map((family) => ({
            lawFamilyId: text(family.lawFamilyId),
            title: text(family.title),
            controlledSourceStatus: text(family.controlledSourceStatus),
            implementationStatus: text(family.implementationStatus),
            candidateFeatureCount: array(family.candidateFeatureIds).length,
            activeFeatureCount: array(family.activeFeatureIds).length,
            blockedFeatureCount: array(family.blockedFeatureIds).length,
            runtimeActivation: text(family.runtimeActivation),
            nextControlledAction: text(family.nextControlledAction)
        }))
    });
}

module.exports = Object.freeze({
    MODULE_VERSION,
    ACTIVE_FEATURE_ID,
    REQUIRED_APPROVAL_KEYS,
    AllLawsRagOnboardingError,
    validateAllLawsOnboardingRegistry,
    resolveLawFamily,
    resolveCandidateFeature,
    buildCandidateManifestBlueprint,
    assertCandidateActivationApproved,
    buildAllLawsReadinessSnapshot
});
