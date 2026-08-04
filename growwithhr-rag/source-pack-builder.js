/**
 * Governed legal RAG source-pack build pipeline.
 *
 * A manifest contains curated source metadata and curated legal excerpts.
 * This module validates the manifest, computes chunk fingerprints, verifies
 * exact source files, and enforces publication approvals. It does not extract
 * or interpret law from PDFs and it has no applicability authority.
 */

import { createHash } from "node:crypto";
import { readdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";

export const LEGAL_SOURCE_PACK_BUILDER_VERSION = "0.1.0";

const SHA256 = /^[a-f0-9]{64}$/;
const STABLE_ID = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const REVIEW_STATUSES = new Set(["needs-legal-review", "approved", "approved-with-conditions"]);
const RAG_STATUSES = new Set(["not-approved", "approved"]);
const PUBLICATION_STATUSES = new Set([
    "blocked-awaiting-exact-file-and-legal-approval",
    "approved-for-publication"
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

function issue(pathValue, message, code = "legal-source-pack-invalid") {
    return Object.freeze({
        path: text(pathValue) || "/",
        message: text(message) || "Legal source-pack validation failed.",
        code: text(code) || "legal-source-pack-invalid"
    });
}

export class LegalSourcePackBuildError extends Error {
    constructor(issues) {
        const normalized = Object.freeze(
            array(Array.isArray(issues) ? issues : [issues])
                .filter(Boolean)
                .map((item) => issue(object(item).path, object(item).message, object(item).code))
        );
        super(normalized.map((item) => `${item.path}: ${item.message}`).join("\n") || "Legal source-pack build failed.");
        this.name = "LegalSourcePackBuildError";
        this.issues = normalized;
        this.code = normalized[0]?.code || "legal-source-pack-invalid";
    }
}

function sha256Bytes(value) {
    return createHash("sha256").update(value).digest("hex");
}

function sha256Text(value) {
    return sha256Bytes(Buffer.from(text(value), "utf8"));
}

function safeRelativePath(value, suffix = null) {
    const normalized = text(value).replaceAll("\\", "/").replace(/^\/+/, "");
    if (!normalized || normalized.includes("../") || path.posix.isAbsolute(normalized)) return false;
    return suffix ? normalized.endsWith(suffix) : true;
}

function normalizedSourcePath(value, rootFolderName) {
    const normalized = text(value).replaceAll("\\", "/").replace(/^\/+/, "");
    const prefix = `${text(rootFolderName).replaceAll("\\", "/").replace(/^\/+|\/+$/g, "")}/`;
    return normalized.startsWith(prefix) ? normalized.slice(prefix.length) : normalized;
}

function catalogFingerprint(catalog) {
    return sha256Bytes(Buffer.from(JSON.stringify(catalog), "utf8"));
}

export function validateLegalSourcePackManifest(value) {
    const manifest = object(value);
    const errors = [];

    if (manifest.schemaVersion !== 1) errors.push(issue("/schemaVersion", "schemaVersion must be 1."));
    if (!text(manifest.manifestVersion)) errors.push(issue("/manifestVersion", "A manifest version is required."));
    if (manifest.builderRole !== "curated-source-pack-compilation-only") {
        errors.push(issue("/builderRole", "The builder role must remain curated-source-pack-compilation-only."));
    }
    if (manifest.applicabilityAuthority !== "none") {
        errors.push(issue("/applicabilityAuthority", "The source-pack builder must have no applicability authority."));
    }
    if (manifest.automaticLegalInterpretation !== false) {
        errors.push(issue("/automaticLegalInterpretation", "Automatic legal interpretation must be disabled."));
    }

    const catalog = object(manifest.catalog);
    ["catalogVersion", "title", "updatedAt", "jurisdiction", "sourceRegisterPath"].forEach((key) => {
        if (!text(catalog[key])) errors.push(issue(`/catalog/${key}`, "A non-empty catalogue value is required."));
    });
    if (catalog.retrievalCatalog !== true) errors.push(issue("/catalog/retrievalCatalog", "The output must be a retrieval catalogue."));
    if (catalog.retrievalRole !== "source-retrieval-only") errors.push(issue("/catalog/retrievalRole", "Retrieval role must be source-retrieval-only."));
    if (catalog.applicabilityAuthority !== "none") errors.push(issue("/catalog/applicabilityAuthority", "The output catalogue must have no applicability authority."));
    if (catalog.llmRole !== "none") errors.push(issue("/catalog/llmRole", "The source catalogue itself must have no language-model role."));
    if (!REVIEW_STATUSES.has(text(catalog.legalReviewStatus))) errors.push(issue("/catalog/legalReviewStatus", "Unknown legal-review status."));
    if (catalog.advisoryOnly !== true) errors.push(issue("/catalog/advisoryOnly", "The catalogue must remain advisory only."));
    if (typeof catalog.privateBetaOnly !== "boolean") errors.push(issue("/catalog/privateBetaOnly", "privateBetaOnly must be explicit."));
    if (typeof catalog.productionIntegration !== "boolean") errors.push(issue("/catalog/productionIntegration", "productionIntegration must be explicit."));
    if (!safeRelativePath(manifest.outputCatalogPath, ".json")) errors.push(issue("/outputCatalogPath", "A safe repository-relative JSON output path is required."));

    const sourcePack = object(manifest.sourcePack);
    ["name", "verifiedAt", "ingestionMode", "rootFolderName", "officialFolder", "notes"].forEach((key) => {
        if (!text(sourcePack[key])) errors.push(issue(`/sourcePack/${key}`, "A non-empty source-pack value is required."));
    });
    if (!safeRelativePath(sourcePack.officialFolder)) errors.push(issue("/sourcePack/officialFolder", "A safe official-folder path is required."));
    if (sourcePack.runtimeSourceAccess !== false) errors.push(issue("/sourcePack/runtimeSourceAccess", "Runtime source-file access must remain disabled."));
    if (sourcePack.rejectUnregisteredPdfs !== true) errors.push(issue("/sourcePack/rejectUnregisteredPdfs", "Unregistered PDFs must be rejected."));

    const contentPolicy = object(manifest.contentPolicy);
    if (contentPolicy.curatedOfficialSourceTextOnly !== true) errors.push(issue("/contentPolicy/curatedOfficialSourceTextOnly", "Only curated official-source text may be compiled."));
    for (const key of ["allowRawAssessmentAnswers", "allowPersonalData", "allowComplaintCaseContent", "allowEvidenceBodies"]) {
        if (contentPolicy[key] !== false) errors.push(issue(`/contentPolicy/${key}`, `${key} must be false.`));
    }

    const sources = new Map();
    array(manifest.sources).forEach((raw, index) => {
        const source = object(raw);
        const base = `/sources/${index}`;
        const sourceId = text(source.registrySourceId);
        if (!STABLE_ID.test(sourceId)) errors.push(issue(`${base}/registrySourceId`, "A stable Source Register ID is required."));
        else if (sources.has(sourceId)) errors.push(issue(`${base}/registrySourceId`, `Duplicate Source Register ID: ${sourceId}.`));
        else sources.set(sourceId, source);
        for (const key of ["title", "documentType", "officialUrl", "fileName", "drivePath"]) {
            if (!text(source[key])) errors.push(issue(`${base}/${key}`, "A non-empty governed source value is required."));
        }
        if (source.official !== true) errors.push(issue(`${base}/official`, "Every source must be official."));
        if (!REVIEW_STATUSES.has(text(source.reviewStatus))) errors.push(issue(`${base}/reviewStatus`, "Unknown source review status."));
        if (!SHA256.test(text(source.sha256))) errors.push(issue(`${base}/sha256`, "A lower-case SHA-256 is required."));
        if (!Number.isInteger(source.byteLength) || source.byteLength <= 0) errors.push(issue(`${base}/byteLength`, "A positive byte length is required."));
        if (!Number.isInteger(source.pageCount) || source.pageCount <= 0) errors.push(issue(`${base}/pageCount`, "A positive page count is required."));
        if (!safeRelativePath(source.drivePath, ".pdf")) errors.push(issue(`${base}/drivePath`, "A safe governed PDF path is required."));
        const relative = normalizedSourcePath(source.drivePath, sourcePack.rootFolderName);
        const officialFolder = `${text(sourcePack.officialFolder).replace(/\/+$/g, "")}/`;
        if (relative && officialFolder !== "/" && !relative.startsWith(officialFolder)) {
            errors.push(issue(`${base}/drivePath`, "The governed source must be inside the manifest official folder."));
        }
    });
    if (!sources.size) errors.push(issue("/sources", "At least one governed source is required."));

    const chunkIds = new Set();
    array(manifest.chunks).forEach((raw, index) => {
        const chunk = object(raw);
        const base = `/chunks/${index}`;
        const chunkId = text(chunk.chunkId);
        const source = sources.get(text(chunk.registrySourceId));
        if (!STABLE_ID.test(chunkId)) errors.push(issue(`${base}/chunkId`, "A stable chunk ID is required."));
        else if (chunkIds.has(chunkId)) errors.push(issue(`${base}/chunkId`, `Duplicate chunk ID: ${chunkId}.`));
        else chunkIds.add(chunkId);
        if (!source) errors.push(issue(`${base}/registrySourceId`, "Every chunk must reference a governed source."));
        for (const key of ["title", "sectionReference", "text"]) {
            if (!text(chunk[key])) errors.push(issue(`${base}/${key}`, "A non-empty curated chunk value is required."));
        }
        if (text(chunk.text).length > 12000) errors.push(issue(`${base}/text`, "A curated chunk cannot exceed 12,000 characters."));
        if (!Number.isInteger(chunk.pageStart) || !Number.isInteger(chunk.pageEnd) || chunk.pageStart <= 0 || chunk.pageEnd < chunk.pageStart || (source && chunk.pageEnd > source.pageCount)) {
            errors.push(issue(`${base}/pageStart`, "Chunk page bounds must be inside the registered source."));
        }
        if (!Number.isInteger(chunk.priority) || chunk.priority < 0) errors.push(issue(`${base}/priority`, "A non-negative deterministic priority is required."));
        if (!unique(chunk.reasonCodes).length) errors.push(issue(`${base}/reasonCodes`, "At least one deterministic reason code is required."));
        if (!unique(chunk.retrievalTerms).length) errors.push(issue(`${base}/retrievalTerms`, "At least one governed retrieval term is required."));
        if (!SHA256.test(text(chunk.expectedContentSha256))) errors.push(issue(`${base}/expectedContentSha256`, "An expected curated-text SHA-256 is required."));
        else if (text(chunk.text) && sha256Text(chunk.text) !== text(chunk.expectedContentSha256)) {
            errors.push(issue(`${base}/expectedContentSha256`, "The curated chunk text does not match its expected SHA-256.", "legal-source-pack-chunk-drift"));
        }
    });
    if (!chunkIds.size) errors.push(issue("/chunks", "At least one curated chunk is required."));

    const publication = object(manifest.publication);
    if (!PUBLICATION_STATUSES.has(text(publication.status))) errors.push(issue("/publication/status", "Unknown publication status."));
    if (!REVIEW_STATUSES.has(text(publication.legalReviewStatus))) errors.push(issue("/publication/legalReviewStatus", "Unknown publication legal-review status."));
    if (!RAG_STATUSES.has(text(publication.ragApprovalStatus))) errors.push(issue("/publication/ragApprovalStatus", "Unknown RAG approval status."));
    for (const key of ["sourceFilesApproved", "sectionMappingsApproved", "runtimeActivationApproved"]) {
        if (typeof publication[key] !== "boolean") errors.push(issue(`/publication/${key}`, `${key} must be explicit.`));
    }
    if (publication.status === "approved-for-publication") {
        if (!publication.approvedBy || !publication.approvedAt) errors.push(issue("/publication", "Approved publication requires approver and approval date."));
    }

    if (!unique(manifest.limitations).length) errors.push(issue("/limitations", "At least one catalogue limitation is required."));
    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
}

function assertManifest(manifest) {
    const validation = validateLegalSourcePackManifest(manifest);
    if (!validation.valid) throw new LegalSourcePackBuildError(validation.errors);
    return manifest;
}

/** Compile a deterministic governed retrieval catalogue from curated manifest data. */
export function compileLegalRagCatalog(value) {
    const manifest = assertManifest(value);
    const catalog = object(manifest.catalog);
    const sourcePack = object(manifest.sourcePack);

    const sources = array(manifest.sources).map((sourceValue) => {
        const source = object(sourceValue);
        return {
            registrySourceId: text(source.registrySourceId),
            title: text(source.title),
            documentType: text(source.documentType),
            official: true,
            reviewStatus: text(source.reviewStatus),
            officialUrl: text(source.officialUrl),
            fileName: text(source.fileName),
            drivePath: text(source.drivePath),
            sha256: text(source.sha256),
            byteLength: source.byteLength,
            pageCount: source.pageCount
        };
    });

    const chunks = array(manifest.chunks).map((chunkValue) => {
        const chunk = object(chunkValue);
        const chunkText = text(chunk.text);
        return {
            chunkId: text(chunk.chunkId),
            registrySourceId: text(chunk.registrySourceId),
            title: text(chunk.title),
            sectionReference: text(chunk.sectionReference),
            pageStart: chunk.pageStart,
            pageEnd: chunk.pageEnd,
            priority: chunk.priority,
            reasonCodes: unique(chunk.reasonCodes),
            retrievalTerms: unique(chunk.retrievalTerms),
            text: chunkText,
            contentSha256: sha256Text(chunkText)
        };
    });

    return deepFreeze({
        catalogVersion: text(catalog.catalogVersion),
        title: text(catalog.title),
        updatedAt: text(catalog.updatedAt),
        jurisdiction: text(catalog.jurisdiction),
        retrievalCatalog: true,
        retrievalRole: "source-retrieval-only",
        applicabilityAuthority: "none",
        llmRole: "none",
        legalReviewStatus: text(catalog.legalReviewStatus),
        advisoryOnly: true,
        privateBetaOnly: catalog.privateBetaOnly === true,
        productionIntegration: catalog.productionIntegration === true,
        sourceRegisterPath: text(catalog.sourceRegisterPath),
        sourcePack: {
            name: text(sourcePack.name),
            verifiedAt: text(sourcePack.verifiedAt),
            ingestionMode: text(sourcePack.ingestionMode),
            runtimeSourceAccess: false,
            notes: text(sourcePack.notes)
        },
        sources,
        chunks,
        limitations: unique(manifest.limitations)
    });
}

async function listPdfFiles(directory) {
    const results = [];
    async function visit(current) {
        const entries = await readdir(current, { withFileTypes: true });
        for (const entry of entries) {
            const entryPath = path.join(current, entry.name);
            if (entry.isDirectory()) await visit(entryPath);
            else if (entry.isFile() && entry.name.toLowerCase().endsWith(".pdf")) results.push(path.resolve(entryPath));
        }
    }
    await visit(directory);
    return results.sort();
}

/** Rehash all registered source files and reject unregistered PDFs. */
export async function verifyLegalSourcePackFiles(input = {}) {
    const request = object(input);
    const manifest = assertManifest(request.manifest);
    const configuredRoot = text(request.sourcePackRoot);
    if (!configuredRoot) {
        throw new LegalSourcePackBuildError([issue("/sourcePackRoot", "An absolute source-pack root is required.", "legal-source-pack-root-required")]);
    }
    const sourcePackRoot = path.resolve(configuredRoot);
    const sourcePack = object(manifest.sourcePack);
    const verifiedSources = [];
    const expectedPaths = [];

    for (const source of array(manifest.sources)) {
        const relativePath = normalizedSourcePath(source.drivePath, sourcePack.rootFolderName);
        const filePath = path.resolve(sourcePackRoot, relativePath);
        if (filePath !== sourcePackRoot && !filePath.startsWith(`${sourcePackRoot}${path.sep}`)) {
            throw new LegalSourcePackBuildError([issue("/sources/drivePath", `Governed source escapes the source-pack root: ${source.drivePath}.`, "legal-source-pack-path-escape")]);
        }
        const fileStat = await stat(filePath);
        if (!fileStat.isFile()) throw new LegalSourcePackBuildError([issue("/sources/drivePath", `Governed source is not a file: ${source.drivePath}.`, "legal-source-pack-file-missing")]);
        if (fileStat.size !== source.byteLength) {
            throw new LegalSourcePackBuildError([issue("/sources/byteLength", `Byte-length mismatch for ${source.registrySourceId}: expected ${source.byteLength}, received ${fileStat.size}.`, "legal-source-pack-byte-length-mismatch")]);
        }
        const digest = sha256Bytes(await readFile(filePath));
        if (digest !== source.sha256) {
            throw new LegalSourcePackBuildError([issue("/sources/sha256", `SHA-256 mismatch for ${source.registrySourceId}: expected ${source.sha256}, received ${digest}.`, "legal-source-pack-hash-mismatch")]);
        }
        expectedPaths.push(filePath);
        verifiedSources.push({
            registrySourceId: source.registrySourceId,
            drivePath: source.drivePath,
            sha256: digest,
            byteLength: fileStat.size,
            registeredPageCount: source.pageCount
        });
    }

    const officialRoot = path.resolve(sourcePackRoot, text(sourcePack.officialFolder));
    const actualPdfPaths = await listPdfFiles(officialRoot);
    const expected = new Set(expectedPaths.map((item) => path.resolve(item)));
    const unexpected = actualPdfPaths.filter((item) => !expected.has(path.resolve(item)));
    if (unexpected.length) {
        throw new LegalSourcePackBuildError([issue(
            "/sourcePack/officialFolder",
            ["Unregistered PDF files were found in the active official source folder:", ...unexpected.map((item) => `- ${path.relative(sourcePackRoot, item)}`)].join("\n"),
            "legal-source-pack-unregistered-pdf"
        )]);
    }
    if (actualPdfPaths.length !== expectedPaths.length) {
        throw new LegalSourcePackBuildError([issue("/sources", `Expected ${expectedPaths.length} registered PDFs but found ${actualPdfPaths.length}.`, "legal-source-pack-pdf-count-mismatch")]);
    }

    const result = {
        valid: true,
        builderVersion: LEGAL_SOURCE_PACK_BUILDER_VERSION,
        manifestVersion: manifest.manifestVersion,
        sourcePackRoot,
        verifiedSourceCount: verifiedSources.length,
        verifiedSources
    };
    result.verificationFingerprint = sha256Bytes(Buffer.from(JSON.stringify(result.verifiedSources), "utf8"));
    return deepFreeze(result);
}

/** Fail closed unless exact files and all legal/RAG activation approvals exist. */
export function assertLegalCatalogPublicationAllowed(input = {}) {
    const request = object(input);
    const manifest = assertManifest(request.manifest);
    const verification = object(request.verification);
    const publication = object(manifest.publication);
    const errors = [];

    if (verification.valid !== true || verification.verifiedSourceCount !== array(manifest.sources).length || !SHA256.test(text(verification.verificationFingerprint))) {
        errors.push(issue("/verification", "A successful exact-file verification result is required.", "legal-source-pack-publication-blocked"));
    }
    if (publication.status !== "approved-for-publication") errors.push(issue("/publication/status", "Publication status is not approved-for-publication.", "legal-source-pack-publication-blocked"));
    if (!["approved", "approved-with-conditions"].includes(publication.legalReviewStatus)) errors.push(issue("/publication/legalReviewStatus", "Qualified legal review approval is required.", "legal-source-pack-publication-blocked"));
    if (publication.ragApprovalStatus !== "approved") errors.push(issue("/publication/ragApprovalStatus", "RAG approval is required.", "legal-source-pack-publication-blocked"));
    if (publication.sourceFilesApproved !== true) errors.push(issue("/publication/sourceFilesApproved", "Source-file approval is required.", "legal-source-pack-publication-blocked"));
    if (publication.sectionMappingsApproved !== true) errors.push(issue("/publication/sectionMappingsApproved", "Section-mapping approval is required.", "legal-source-pack-publication-blocked"));
    if (publication.runtimeActivationApproved !== true) errors.push(issue("/publication/runtimeActivationApproved", "Runtime activation approval is required.", "legal-source-pack-publication-blocked"));
    if (!text(publication.approvedBy) || !text(publication.approvedAt)) errors.push(issue("/publication", "Approver and approval date are required.", "legal-source-pack-publication-blocked"));
    if (errors.length) throw new LegalSourcePackBuildError(errors);

    return deepFreeze({
        allowed: true,
        approvedBy: text(publication.approvedBy),
        approvedAt: text(publication.approvedAt),
        verificationFingerprint: text(verification.verificationFingerprint)
    });
}

/** Atomically publish a compiled catalogue after all gates pass. */
export async function publishLegalRagCatalog(input = {}) {
    const request = object(input);
    const gate = assertLegalCatalogPublicationAllowed(request);
    const catalog = compileLegalRagCatalog(request.manifest);
    const outputPath = path.resolve(text(request.outputPath));
    if (!text(request.outputPath)) throw new LegalSourcePackBuildError([issue("/outputPath", "An output path is required.")]);
    const payload = `${JSON.stringify(catalog, null, 2)}\n`;
    const temporaryPath = `${outputPath}.tmp-${process.pid}`;
    await writeFile(temporaryPath, payload, "utf8");
    await rename(temporaryPath, outputPath);
    return deepFreeze({
        published: true,
        outputPath,
        catalogFingerprint: catalogFingerprint(catalog),
        approval: gate
    });
}

export function compileLegalRagCatalogSafely(manifest) {
    try {
        return Object.freeze({ valid: true, value: compileLegalRagCatalog(manifest), errors: Object.freeze([]) });
    } catch (error) {
        const errors = error instanceof LegalSourcePackBuildError
            ? error.issues
            : Object.freeze([issue("/", error?.message || "Unknown source-pack build error.")]);
        return Object.freeze({ valid: false, value: null, errors });
    }
}

export default Object.freeze({
    version: LEGAL_SOURCE_PACK_BUILDER_VERSION,
    validateLegalSourcePackManifest,
    compileLegalRagCatalog,
    compileLegalRagCatalogSafely,
    verifyLegalSourcePackFiles,
    assertLegalCatalogPublicationAllowed,
    publishLegalRagCatalog
});
