"use strict";

const base = require("./server-all-laws-rule-catalogs.js");
const {
    createEpfWave3aFeatureSpecifications
} = require("./server-epf-wave3a-rule-catalogs.js");

const MODULE_VERSION = "1.0.0";
const SOURCE_FILES = Object.freeze({
    "social-security-code-2020": Object.freeze({
        fileName: "code-on-social-security-2020-official.pdf",
        drivePath: "GrowWithHR-RAG/01-source-documents/official/social-security/01-code/code-on-social-security-2020-official.pdf"
    }),
    "employees-provident-funds-scheme-2026": Object.freeze({
        fileName: "employees-provident-funds-scheme-2026-official.pdf",
        drivePath: "GrowWithHR-RAG/01-source-documents/official/social-security/02-schemes/employees-provident-funds-scheme-2026-official.pdf"
    }),
    "social-security-code-commencement-so-5319e-2025": Object.freeze({
        fileName: "social-security-code-commencement-so-5319e-2025.pdf",
        drivePath: "GrowWithHR-RAG/01-source-documents/official/social-security/03-notifications/social-security-code-commencement-so-5319e-2025.pdf"
    }),
    "social-security-code-corrigendum-so-5936e-2025": Object.freeze({
        fileName: "social-security-code-corrigendum-so-5936e-2025.pdf",
        drivePath: "GrowWithHR-RAG/01-source-documents/official/social-security/03-notifications/social-security-code-corrigendum-so-5936e-2025.pdf"
    })
});

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
}

function createCompatibleEpfSpecifications() {
    const source = createEpfWave3aFeatureSpecifications();
    const specifications = {};
    Object.entries(source).forEach(([featureId, specification]) => {
        const catalog = JSON.parse(JSON.stringify(specification.ruleCatalog));
        catalog.sources = catalog.sources.map((item) => ({
            ...item,
            ...(SOURCE_FILES[item.registrySourceId] || {})
        }));
        specifications[featureId] = deepFreeze({
            ...specification,
            ruleCatalog: catalog
        });
    });
    return deepFreeze(specifications);
}

function createRunnableAllLawsFeatureSpecifications() {
    return deepFreeze({
        ...base.createRunnableAllLawsFeatureSpecifications(),
        ...createCompatibleEpfSpecifications()
    });
}

module.exports = Object.freeze({
    ...base,
    MODULE_VERSION,
    createRunnableAllLawsFeatureSpecifications
});
