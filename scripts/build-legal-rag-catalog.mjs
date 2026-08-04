#!/usr/bin/env node

/**
 * Build and verify a governed legal RAG catalogue.
 *
 * Examples:
 *   node scripts/build-legal-rag-catalog.mjs --manifest growwithhr-rag/manifests/posh-source-pack.v1.json --check --compare-existing
 *   node scripts/build-legal-rag-catalog.mjs --manifest ... --verify-files --source-root /absolute/path/to/GrowWithHR-RAG
 *   node scripts/build-legal-rag-catalog.mjs --manifest ... --publish --source-root /absolute/path/to/GrowWithHR-RAG
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
    compileLegalRagCatalog,
    publishLegalRagCatalog,
    validateLegalSourcePackManifest,
    verifyLegalSourcePackFiles
} from "../growwithhr-rag/source-pack-builder.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(values) {
    const result = {
        check: false,
        compareExisting: false,
        verifyFiles: false,
        publish: false,
        manifest: "",
        sourceRoot: "",
        output: ""
    };
    for (let index = 0; index < values.length; index += 1) {
        const value = values[index];
        if (value === "--check") result.check = true;
        else if (value === "--compare-existing") result.compareExisting = true;
        else if (value === "--verify-files") result.verifyFiles = true;
        else if (value === "--publish") result.publish = true;
        else if (["--manifest", "--source-root", "--output"].includes(value)) {
            const next = values[index + 1];
            if (!next || next.startsWith("--")) throw new Error(`${value} requires a value.`);
            const key = value === "--source-root" ? "sourceRoot" : value.slice(2);
            result[key] = next;
            index += 1;
        } else {
            throw new Error(`Unknown argument: ${value}`);
        }
    }
    if (!result.check && !result.verifyFiles && !result.publish) result.check = true;
    if (result.publish) result.verifyFiles = true;
    return result;
}

function repositoryPath(value) {
    const resolved = path.resolve(ROOT, String(value || ""));
    if (resolved !== ROOT && !resolved.startsWith(`${ROOT}${path.sep}`)) {
        throw new Error(`Repository path escapes the project root: ${value}`);
    }
    return resolved;
}

function stableJson(value) {
    return `${JSON.stringify(value, null, 2)}\n`;
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    if (!args.manifest) throw new Error("--manifest is required.");

    const manifestPath = repositoryPath(args.manifest);
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    const validation = validateLegalSourcePackManifest(manifest);
    if (!validation.valid) {
        const error = new Error(validation.errors.map((item) => `${item.path}: ${item.message}`).join("\n"));
        error.code = "legal-source-pack-invalid";
        throw error;
    }

    const catalog = compileLegalRagCatalog(manifest);
    const result = {
        valid: true,
        manifestPath: path.relative(ROOT, manifestPath).replaceAll("\\", "/"),
        manifestVersion: manifest.manifestVersion,
        sourceCount: catalog.sources.length,
        chunkCount: catalog.chunks.length,
        outputCatalogPath: manifest.outputCatalogPath,
        comparedExisting: false,
        filesVerified: false,
        published: false
    };

    if (args.compareExisting) {
        const existingPath = repositoryPath(manifest.outputCatalogPath);
        const existing = JSON.parse(await readFile(existingPath, "utf8"));
        if (stableJson(existing) !== stableJson(catalog)) {
            throw new Error(`Compiled catalogue differs from ${manifest.outputCatalogPath}.`);
        }
        result.comparedExisting = true;
    }

    let verification = null;
    if (args.verifyFiles) {
        const sourceRoot = args.sourceRoot || process.env.GROWWITHHR_RAG_SOURCE_ROOT;
        if (!sourceRoot) throw new Error("--source-root or GROWWITHHR_RAG_SOURCE_ROOT is required for file verification.");
        verification = await verifyLegalSourcePackFiles({ manifest, sourcePackRoot: sourceRoot });
        result.filesVerified = true;
        result.verificationFingerprint = verification.verificationFingerprint;
    }

    if (args.publish) {
        const outputPath = args.output
            ? path.resolve(args.output)
            : repositoryPath(manifest.outputCatalogPath);
        const publication = await publishLegalRagCatalog({
            manifest,
            verification,
            outputPath
        });
        result.published = true;
        result.publishedPath = publication.outputPath;
        result.catalogFingerprint = publication.catalogFingerprint;
    }

    console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
    console.error(error?.stack || error?.message || String(error));
    process.exitCode = 1;
});
