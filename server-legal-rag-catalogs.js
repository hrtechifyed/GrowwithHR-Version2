"use strict";

/**
 * Server-side governed legal catalogue loader.
 *
 * Loads repository-declared JSON catalogues and the deterministic generated
 * all-laws governance fallback. It does not download sources, parse PDFs,
 * approve a corpus or make an applicability decision.
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const DEFAULT_PROFILE_REGISTRY = require("./growwithhr-rag/data/legal-rag-profiles.v1.json");
const {
    FALLBACK_CATALOG_ID
} = require("./server-all-laws-private-beta.js");
const {
    buildAllLawsGovernanceFallbackCatalog
} = require("./server-all-laws-fallback-catalog.js");

const CATALOG_LOADER_VERSION = "1.1.0";

const cleanText = (value) => String(value ?? "").trim();
const object = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const array = (value) => Array.isArray(value) ? value : [];
const clone = (value) => JSON.parse(JSON.stringify(value));

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
}

class LegalRagCatalogLoaderError extends Error {
    constructor(message, options = {}) {
        super(cleanText(message) || "The governed legal catalogue could not be loaded.");
        this.name = "LegalRagCatalogLoaderError";
        this.code = cleanText(options.code) || "legal-rag-catalog-load-failed";
        this.catalogId = cleanText(options.catalogId);
        this.catalogPath = cleanText(options.catalogPath);
    }
}

function safePath(rootDir, repositoryPath) {
    const normalized = cleanText(repositoryPath).replaceAll("\\", "/");
    if (!normalized || normalized.startsWith("/") || normalized.includes("../") || !normalized.endsWith(".json")) {
        throw new LegalRagCatalogLoaderError("A safe repository-relative JSON catalogue path is required.", {
            code: "legal-rag-catalog-path-unsafe",
            catalogPath: normalized
        });
    }
    const root = path.resolve(rootDir);
    const resolved = path.resolve(root, normalized);
    if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
        throw new LegalRagCatalogLoaderError("The catalogue path escapes the repository root.", {
            code: "legal-rag-catalog-path-unsafe",
            catalogPath: normalized
        });
    }
    return resolved;
}

function catalogFingerprint(raw) {
    return crypto.createHash("sha256").update(raw).digest("hex");
}

function assertCatalogShape(catalog, descriptor) {
    const value = object(catalog);
    const catalogId = cleanText(descriptor.catalogId);
    if (value.retrievalCatalog !== true ||
        value.retrievalRole !== "source-retrieval-only" ||
        value.applicabilityAuthority !== "none" ||
        value.llmRole !== "none" ||
        !array(value.sources).length ||
        !array(value.chunks).length) {
        throw new LegalRagCatalogLoaderError(
            `Catalogue ${catalogId} does not satisfy the governed retrieval shape.`,
            {
                code: "legal-rag-catalog-invalid",
                catalogId,
                catalogPath: descriptor.catalogPath
            }
        );
    }
    return value;
}

function activeCatalogIds(registry) {
    return new Set(
        array(object(registry).profiles)
            .filter((profile) => cleanText(profile.activationStatus) === "active-private-beta")
            .map((profile) => cleanText(profile.catalogId))
            .filter(Boolean)
    );
}

function generatedCatalog(catalogId) {
    if (catalogId !== FALLBACK_CATALOG_ID) return null;
    return buildAllLawsGovernanceFallbackCatalog();
}

function loadGovernedLegalCatalogs(options = {}) {
    const source = object(options);
    const registry = source.profileRegistry || DEFAULT_PROFILE_REGISTRY;
    const rootDir = source.rootDir || __dirname;
    const readFileSync = source.readFileSync || fs.readFileSync;
    const activeIds = activeCatalogIds(registry);
    const descriptors = array(object(registry).catalogs);
    const seen = new Set();
    const catalogs = {};
    const metadata = [];

    for (const descriptorValue of descriptors) {
        const descriptor = object(descriptorValue);
        const catalogId = cleanText(descriptor.catalogId);
        if (!catalogId || seen.has(catalogId)) {
            throw new LegalRagCatalogLoaderError(
                `Catalogue descriptor ${catalogId || "(missing)"} is missing or duplicated.`,
                {
                    code: "legal-rag-catalog-descriptor-invalid",
                    catalogId
                }
            );
        }
        seen.add(catalogId);

        const shouldLoad = activeIds.has(catalogId) ||
            cleanText(descriptor.runtimeStatus) === "available-private-beta";
        if (!shouldLoad) continue;

        safePath(rootDir, descriptor.catalogPath);
        let raw;
        let parsed = generatedCatalog(catalogId);

        if (parsed) {
            raw = JSON.stringify(parsed);
        } else {
            const filePath = safePath(rootDir, descriptor.catalogPath);
            try {
                raw = readFileSync(filePath, "utf8");
            } catch (error) {
                throw new LegalRagCatalogLoaderError(
                    `Catalogue ${catalogId} could not be read.`,
                    {
                        code: "legal-rag-catalog-file-unavailable",
                        catalogId,
                        catalogPath: descriptor.catalogPath,
                        cause: error
                    }
                );
            }

            try {
                parsed = JSON.parse(raw);
            } catch (error) {
                throw new LegalRagCatalogLoaderError(
                    `Catalogue ${catalogId} is not valid JSON.`,
                    {
                        code: "legal-rag-catalog-json-invalid",
                        catalogId,
                        catalogPath: descriptor.catalogPath,
                        cause: error
                    }
                );
            }
        }

        const catalog = assertCatalogShape(parsed, descriptor);
        catalogs[catalogId] = deepFreeze(clone(catalog));
        metadata.push(deepFreeze({
            catalogId,
            lawFamilyId: cleanText(descriptor.lawFamilyId),
            catalogPath: cleanText(descriptor.catalogPath),
            runtimeStatus: cleanText(descriptor.runtimeStatus),
            catalogMode: cleanText(descriptor.catalogMode || catalog.catalogMode || "statutory"),
            allowedFeatureIds: array(descriptor.allowedFeatureIds).map(cleanText).filter(Boolean),
            fileSha256: catalogFingerprint(raw),
            sourceCount: array(catalog.sources).length,
            chunkCount: array(catalog.chunks).length
        }));
    }

    for (const catalogId of activeIds) {
        if (!Object.hasOwn(catalogs, catalogId)) {
            throw new LegalRagCatalogLoaderError(
                `Active profile catalogue ${catalogId} was not loaded.`,
                {
                    code: "legal-rag-active-catalog-unavailable",
                    catalogId
                }
            );
        }
    }

    return deepFreeze({
        loaderVersion: CATALOG_LOADER_VERSION,
        catalogs,
        metadata,
        activeCatalogIds: [...activeIds].sort()
    });
}

let defaultSnapshot = null;
function loadDefaultGovernedLegalCatalogs() {
    if (!defaultSnapshot) defaultSnapshot = loadGovernedLegalCatalogs();
    return defaultSnapshot;
}

function resetDefaultGovernedLegalCatalogsForTests() {
    defaultSnapshot = null;
}

module.exports = Object.freeze({
    CATALOG_LOADER_VERSION,
    LegalRagCatalogLoaderError,
    safePath,
    loadGovernedLegalCatalogs,
    loadDefaultGovernedLegalCatalogs,
    resetDefaultGovernedLegalCatalogsForTests
});
