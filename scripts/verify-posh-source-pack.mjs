/**
 * Verifies the private POSH source pack against the governed retrieval catalog.
 *
 * Usage:
 *   node scripts/verify-posh-source-pack.mjs /absolute/path/to/GrowWithHR-RAG
 */

import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const PROJECT_ROOT = path.resolve(path.dirname(SCRIPT_PATH), "..");
const CATALOG_PATH = path.join(PROJECT_ROOT, "growwithhr-rag", "data", "posh-source-chunks.v1.json");

function normalizeRelativePath(value) {
    const normalized = String(value ?? "")
        .replaceAll("\\", "/")
        .replace(/^GrowWithHR-RAG\//, "")
        .replace(/^\/+/, "");

    if (!normalized || normalized.includes("../")) {
        throw new Error(`Unsafe or empty governed path: ${value}`);
    }

    return normalized;
}

async function sha256(filePath) {
    return createHash("sha256")
        .update(await readFile(filePath))
        .digest("hex");
}

async function listPdfFiles(directory) {
    const results = [];

    async function visit(currentDirectory) {
        const entries = await readdir(currentDirectory, { withFileTypes: true });
        for (const entry of entries) {
            const entryPath = path.join(currentDirectory, entry.name);
            if (entry.isDirectory()) await visit(entryPath);
            else if (entry.isFile() && entry.name.toLowerCase().endsWith(".pdf")) results.push(entryPath);
        }
    }

    await visit(directory);
    return results.sort();
}

async function main() {
    const configuredRoot = process.argv[2] || process.env.GROWWITHHR_RAG_SOURCE_ROOT;
    if (!configuredRoot) {
        throw new Error("Provide the absolute GrowWithHR-RAG folder path as the first argument or GROWWITHHR_RAG_SOURCE_ROOT.");
    }

    const sourcePackRoot = path.resolve(configuredRoot);
    const catalog = JSON.parse(await readFile(CATALOG_PATH, "utf8"));
    const verifiedSources = [];
    const expectedPdfPaths = [];

    for (const source of catalog.sources || []) {
        const relativePath = normalizeRelativePath(source.drivePath);
        const filePath = path.resolve(sourcePackRoot, relativePath);

        if (!filePath.startsWith(`${sourcePackRoot}${path.sep}`)) {
            throw new Error(`Governed path escapes the source-pack root: ${source.drivePath}`);
        }

        const fileStat = await stat(filePath);
        if (!fileStat.isFile()) throw new Error(`Governed source is not a file: ${source.drivePath}`);
        if (fileStat.size !== source.byteLength) {
            throw new Error(`Byte-length mismatch for ${source.registrySourceId}: expected ${source.byteLength}, received ${fileStat.size}.`);
        }

        const digest = await sha256(filePath);
        if (digest !== source.sha256) {
            throw new Error(`SHA-256 mismatch for ${source.registrySourceId}: expected ${source.sha256}, received ${digest}.`);
        }

        expectedPdfPaths.push(filePath);
        verifiedSources.push({
            registrySourceId: source.registrySourceId,
            drivePath: source.drivePath,
            sha256: digest,
            byteLength: fileStat.size
        });
    }

    const officialPoshRoot = path.join(sourcePackRoot, "01-source-documents", "official", "posh");
    const actualPdfPaths = await listPdfFiles(officialPoshRoot);
    const expected = new Set(expectedPdfPaths.map((filePath) => path.resolve(filePath)));
    const unexpected = actualPdfPaths.filter((filePath) => !expected.has(path.resolve(filePath)));

    if (unexpected.length) {
        throw new Error([
            "Unregistered PDF files were found in the active official POSH folders:",
            ...unexpected.map((filePath) => `- ${path.relative(sourcePackRoot, filePath)}`)
        ].join("\n"));
    }

    if (actualPdfPaths.length !== expectedPdfPaths.length) {
        throw new Error(`Expected ${expectedPdfPaths.length} active official POSH PDFs but found ${actualPdfPaths.length}.`);
    }

    console.log(JSON.stringify({
        valid: true,
        catalogVersion: catalog.catalogVersion,
        sourcePackRoot,
        verifiedSourceCount: verifiedSources.length,
        verifiedSources
    }, null, 2));
}

main().catch((error) => {
    console.error(error?.stack || error?.message || String(error));
    process.exitCode = 1;
});
