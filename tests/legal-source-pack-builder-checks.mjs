import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
    assertLegalCatalogPublicationAllowed,
    compileLegalRagCatalog,
    compileLegalRagCatalogSafely,
    publishLegalRagCatalog,
    validateLegalSourcePackManifest,
    verifyLegalSourcePackFiles
} from "../growwithhr-rag/source-pack-builder.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(ROOT, "growwithhr-rag", "manifests", "posh-source-pack.v1.json");
const catalogPath = path.join(ROOT, "growwithhr-rag", "data", "posh-source-chunks.v1.json");
const builderPath = path.join(ROOT, "growwithhr-rag", "source-pack-builder.js");
const cliPath = path.join(ROOT, "scripts", "build-legal-rag-catalog.mjs");
const packagePath = path.join(ROOT, "package.json");

const clone = (value) => JSON.parse(JSON.stringify(value));
const digest = (value) => createHash("sha256").update(value).digest("hex");

function expectBuildError(action, code) {
    assert.throws(action, (error) => error?.code === code || error?.issues?.some((item) => item.code === code));
}

async function expectBuildRejection(action, code) {
    await assert.rejects(action, (error) => error?.code === code || error?.issues?.some((item) => item.code === code));
}

function fakeManifest(base, bytes) {
    const manifest = clone(base);
    const excerpt = "Curated official source excerpt used for deterministic source-pack testing.";
    manifest.manifestVersion = "test-1.0.0";
    manifest.outputCatalogPath = "growwithhr-rag/data/test-source-chunks.v1.json";
    manifest.catalog = {
        ...manifest.catalog,
        catalogVersion: "test-1.0.0",
        title: "Test governed retrieval catalogue",
        updatedAt: "2026-08-04",
        jurisdiction: "Test jurisdiction",
        legalReviewStatus: "needs-legal-review",
        privateBetaOnly: true,
        productionIntegration: false
    };
    manifest.sourcePack = {
        ...manifest.sourcePack,
        name: "Test-Pack",
        verifiedAt: "2026-08-04",
        rootFolderName: "Test-Pack",
        officialFolder: "01-source-documents/official/test",
        notes: "Synthetic bytes used only for source-pack build contract tests."
    };
    manifest.sources = [{
        registrySourceId: "test-source-001",
        title: "Test official source",
        documentType: "Test PDF",
        official: true,
        reviewStatus: "needs-legal-review",
        officialUrl: "https://example.invalid/official-source",
        fileName: "test-source.pdf",
        drivePath: "Test-Pack/01-source-documents/official/test/test-source.pdf",
        sha256: digest(bytes),
        byteLength: bytes.length,
        pageCount: 1
    }];
    manifest.chunks = [{
        chunkId: "test-source-001-section-1-001",
        registrySourceId: "test-source-001",
        title: "Test section",
        sectionReference: "Section 1",
        pageStart: 1,
        pageEnd: 1,
        priority: 100,
        reasonCodes: ["TEST_REASON_CODE"],
        retrievalTerms: ["test", "official source"],
        text: excerpt,
        expectedContentSha256: digest(Buffer.from(excerpt, "utf8"))
    }];
    manifest.publication = {
        status: "blocked-awaiting-exact-file-and-legal-approval",
        legalReviewStatus: "needs-legal-review",
        ragApprovalStatus: "not-approved",
        sourceFilesApproved: false,
        sectionMappingsApproved: false,
        runtimeActivationApproved: false,
        approvedBy: null,
        approvedAt: null
    };
    manifest.limitations = ["Synthetic test catalogue with no applicability authority."];
    return manifest;
}

async function main() {
    const [manifest, existingCatalog, builderSource, cliSource, packageJson] = await Promise.all([
        readFile(manifestPath, "utf8").then(JSON.parse),
        readFile(catalogPath, "utf8").then(JSON.parse),
        readFile(builderPath, "utf8"),
        readFile(cliPath, "utf8"),
        readFile(packagePath, "utf8").then(JSON.parse)
    ]);

    const validation = validateLegalSourcePackManifest(manifest);
    assert.equal(validation.valid, true, JSON.stringify(validation.errors, null, 2));
    const compiled = compileLegalRagCatalog(manifest);
    assert.deepEqual(compiled, existingCatalog, "The POSH manifest must reproduce the checked-in catalogue exactly.");
    assert.equal(compiled.sources.length, 3);
    assert.equal(compiled.chunks.length, 6);
    compiled.chunks.forEach((chunk) => {
        assert.equal(chunk.contentSha256, digest(Buffer.from(chunk.text, "utf8")));
    });

    const drifted = clone(manifest);
    drifted.chunks[0].text += " changed";
    const driftResult = compileLegalRagCatalogSafely(drifted);
    assert.equal(driftResult.valid, false);
    assert(driftResult.errors.some((item) => item.code === "legal-source-pack-chunk-drift"));

    const escaped = clone(manifest);
    escaped.sources[0].drivePath = "../outside.pdf";
    assert.equal(validateLegalSourcePackManifest(escaped).valid, false);

    expectBuildError(
        () => assertLegalCatalogPublicationAllowed({ manifest, verification: { valid: false } }),
        "legal-source-pack-publication-blocked"
    );

    const tempRoot = await mkdtemp(path.join(tmpdir(), "growwithhr-source-pack-builder-"));
    try {
        const bytes = Buffer.from("%PDF-1.7\nsynthetic-governed-source\n", "utf8");
        const testManifest = fakeManifest(manifest, bytes);
        const officialFolder = path.join(tempRoot, testManifest.sourcePack.officialFolder);
        await mkdir(officialFolder, { recursive: true });
        const sourcePath = path.join(officialFolder, "test-source.pdf");
        await writeFile(sourcePath, bytes);

        const verification = await verifyLegalSourcePackFiles({
            manifest: testManifest,
            sourcePackRoot: tempRoot
        });
        assert.equal(verification.valid, true);
        assert.equal(verification.verifiedSourceCount, 1);
        assert.match(verification.verificationFingerprint, /^[a-f0-9]{64}$/);

        await writeFile(path.join(officialFolder, "unregistered.pdf"), Buffer.from("extra", "utf8"));
        await expectBuildRejection(
            () => verifyLegalSourcePackFiles({ manifest: testManifest, sourcePackRoot: tempRoot }),
            "legal-source-pack-unregistered-pdf"
        );
        await rm(path.join(officialFolder, "unregistered.pdf"));

        const hashMismatch = clone(testManifest);
        hashMismatch.sources[0].sha256 = "0".repeat(64);
        await expectBuildRejection(
            () => verifyLegalSourcePackFiles({ manifest: hashMismatch, sourcePackRoot: tempRoot }),
            "legal-source-pack-hash-mismatch"
        );

        const approved = clone(testManifest);
        approved.catalog.legalReviewStatus = "approved";
        approved.catalog.privateBetaOnly = false;
        approved.catalog.productionIntegration = true;
        approved.sources[0].reviewStatus = "approved";
        approved.publication = {
            status: "approved-for-publication",
            legalReviewStatus: "approved",
            ragApprovalStatus: "approved",
            sourceFilesApproved: true,
            sectionMappingsApproved: true,
            runtimeActivationApproved: true,
            approvedBy: "qualified-reviewer-id",
            approvedAt: "2026-08-04"
        };
        assert.equal(validateLegalSourcePackManifest(approved).valid, true);
        const gate = assertLegalCatalogPublicationAllowed({ manifest: approved, verification });
        assert.equal(gate.allowed, true);

        const outputPath = path.join(tempRoot, "published", "test-catalog.json");
        await mkdir(path.dirname(outputPath), { recursive: true });
        const publication = await publishLegalRagCatalog({
            manifest: approved,
            verification,
            outputPath
        });
        assert.equal(publication.published, true);
        assert.match(publication.catalogFingerprint, /^[a-f0-9]{64}$/);
        const published = JSON.parse(await readFile(outputPath, "utf8"));
        assert.deepEqual(published, compileLegalRagCatalog(approved));
    } finally {
        await rm(tempRoot, { recursive: true, force: true });
    }

    assert.match(builderSource, /automaticLegalInterpretation/);
    assert.match(builderSource, /Unregistered PDF files/);
    assert.match(builderSource, /approved-for-publication/);
    assert.equal(/fetch\s*\(/.test(builderSource), false, "The builder must not download or crawl legal sources.");
    assert.equal(/openai|anthropic|gemini|cloudflare/i.test(builderSource), false, "The builder must not call a model provider.");
    assert.match(cliSource, /--compare-existing/);
    assert.match(cliSource, /--verify-files/);
    assert.match(cliSource, /--publish/);
    assert.equal(packageJson.scripts["test:legal-source-pack-builder"], "node tests/legal-source-pack-builder-checks.mjs");
    assert.equal(
        packageJson.scripts["build:legal-rag-catalog:posh"],
        "node scripts/build-legal-rag-catalog.mjs --manifest growwithhr-rag/manifests/posh-source-pack.v1.json --check --compare-existing"
    );
    assert.match(packageJson.scripts["test:m2"], /test:legal-source-pack-builder/);

    console.log([
        "Governed legal source-pack builder checks passed.",
        "POSH manifest sources: 3",
        "POSH curated chunks: 6",
        "Tampered source rejection: passed",
        "Unregistered PDF rejection: passed",
        "Publication gate: passed"
    ].join("\n"));
}

main().catch((error) => {
    console.error(error?.stack || error?.message || String(error));
    process.exitCode = 1;
});
