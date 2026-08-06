"use strict";

const crypto = require("crypto");
const ONBOARDING_REGISTRY = require("./data/legal-source-governance/all-laws-rag-onboarding.v1.json");
const {
    FALLBACK_CATALOG_ID,
    familySourceId,
    familyReasonCode
} = require("./server-all-laws-private-beta.js");

const CATALOG_VERSION = "1.0.0";
const REGISTRY_PATH = "data/legal-source-governance/all-laws-rag-onboarding.v1.json";
const REGISTRY_URL = "https://github.com/hrtechifyed/GrowwithHR-Version2/blob/main/data/legal-source-governance/all-laws-rag-onboarding.v1.json";

const object = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const array = (value) => Array.isArray(value) ? value : [];
const text = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
}

function sha256(value) {
    return crypto.createHash("sha256").update(Buffer.from(String(value), "utf8")).digest("hex");
}

function slug(value) {
    return text(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function familyEntries() {
    const entries = array(object(ONBOARDING_REGISTRY).families).map((family) => ({
        lawFamilyId: text(family.lawFamilyId),
        title: text(family.title),
        sourceStatus: text(family.controlledSourceStatus),
        implementationStatus: text(family.implementationStatus),
        nextControlledAction: text(family.nextControlledAction)
    }));
    entries.push({
        lawFamilyId: "social-security",
        title: "Social Security Code feature-family review",
        sourceStatus: "family-routing-and-scheme-selection-required",
        implementationStatus: "runnable-governance-fallback",
        nextControlledAction: "Select the relevant Social Security chapter or scheme and complete its governed feature-specific review."
    });
    return entries;
}

function recordText(entry) {
    return [
        `GrowWithHR governed RAG readiness record for ${entry.title}.`,
        `Controlled source status: ${entry.sourceStatus}.`,
        `Implementation status: ${entry.implementationStatus}.`,
        "This record makes the feature callable in private beta but does not contain or replace the complete statutory corpus.",
        "The deterministic result is limited to more-information-needed or specialist-review and cannot be changed by retrieval or model output.",
        `Next controlled action: ${entry.nextControlledAction}`
    ].join(" ");
}

function buildAllLawsGovernanceFallbackCatalog() {
    const entries = familyEntries();
    const sources = entries.map((entry) => {
        const content = recordText(entry);
        return {
            registrySourceId: familySourceId(entry.lawFamilyId),
            title: `${entry.title} — governed readiness record`,
            documentType: "internal-governance-readiness-record",
            sourceRole: "governance-readiness-record",
            legalContent: false,
            official: true,
            reviewStatus: "needs-legal-review",
            officialUrl: REGISTRY_URL,
            fileName: "all-laws-rag-onboarding.v1.json",
            drivePath: `repository://${REGISTRY_PATH}#${slug(entry.lawFamilyId)}`,
            sha256: sha256(content),
            byteLength: Buffer.byteLength(content, "utf8"),
            pageCount: 1
        };
    });
    const chunks = entries.map((entry) => {
        const content = recordText(entry);
        return {
            chunkId: `governance-${slug(entry.lawFamilyId)}-readiness-001`,
            registrySourceId: familySourceId(entry.lawFamilyId),
            title: `${entry.title} private-beta readiness boundary`,
            sectionReference: "Governed RAG onboarding readiness record",
            pageStart: 1,
            pageEnd: 1,
            priority: 100,
            reasonCodes: [
                familyReasonCode(entry.lawFamilyId, false),
                familyReasonCode(entry.lawFamilyId, true)
            ],
            retrievalTerms: [
                entry.title,
                entry.lawFamilyId,
                entry.sourceStatus,
                entry.implementationStatus,
                "specialist review",
                "more information needed",
                "source readiness",
                "private beta"
            ].map(text).filter(Boolean),
            text: content,
            contentSha256: sha256(content)
        };
    });

    return deepFreeze({
        catalogId: FALLBACK_CATALOG_ID,
        catalogVersion: CATALOG_VERSION,
        title: "GrowWithHR all-laws governance fallback retrieval catalogue",
        updatedAt: "2026-08-06",
        jurisdiction: "Multi-jurisdiction governance boundary",
        retrievalCatalog: true,
        retrievalRole: "source-retrieval-only",
        applicabilityAuthority: "none",
        llmRole: "none",
        catalogMode: "governance-fallback",
        legalReviewStatus: "needs-legal-review",
        advisoryOnly: true,
        privateBetaOnly: true,
        productionIntegration: false,
        sourceRegisterPath: REGISTRY_PATH,
        sourcePack: {
            name: "All-laws governed readiness fallback",
            verifiedAt: "2026-08-06",
            ingestionMode: "repository-governance-record",
            runtimeSourceAccess: false,
            notes: "The fallback provides runnable, source-grounded escalation responses while law-specific statutory catalogues are being completed."
        },
        sources,
        chunks,
        limitations: [
            "These chunks are governance readiness records, not statutory legal text.",
            "The fallback cannot produce applicable, likely-applicable or not-currently-applicable outcomes.",
            "A law-specific statutory catalogue must replace the fallback before substantive applicability results are enabled.",
            "Retrieval and provider output cannot create facts or change the deterministic decision."
        ]
    });
}

module.exports = Object.freeze({
    CATALOG_VERSION,
    buildAllLawsGovernanceFallbackCatalog
});
