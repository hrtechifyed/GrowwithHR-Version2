import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const loader = require(path.join(ROOT, "server-legal-rag-catalogs.js"));
const profiles = require(path.join(ROOT, "growwithhr-rag", "data", "legal-rag-profiles.v1.json"));

loader.resetDefaultGovernedLegalCatalogsForTests();
const snapshot = loader.loadDefaultGovernedLegalCatalogs();
assert.equal(snapshot.loaderVersion, "1.0.0");
assert.deepEqual(snapshot.activeCatalogIds, ["catalog.legal.posh.v1"]);
assert.equal(Object.keys(snapshot.catalogs).length, 1);
assert.equal(snapshot.metadata.length, 1);
assert.equal(snapshot.metadata[0].catalogId, "catalog.legal.posh.v1");
assert.equal(snapshot.metadata[0].sourceCount, 3);
assert.equal(snapshot.metadata[0].chunkCount, 6);
assert.match(snapshot.metadata[0].fileSha256, /^[a-f0-9]{64}$/);
assert.equal(snapshot.catalogs["catalog.legal.posh.v1"].applicabilityAuthority, "none");

const duplicate = JSON.parse(JSON.stringify(profiles));
duplicate.catalogs.push({ ...duplicate.catalogs[0] });
assert.throws(
    () => loader.loadGovernedLegalCatalogs({ profileRegistry: duplicate }),
    (error) => error.code === "legal-rag-catalog-descriptor-invalid"
);

const unsafe = JSON.parse(JSON.stringify(profiles));
unsafe.catalogs[0].catalogPath = "../outside.json";
assert.throws(
    () => loader.loadGovernedLegalCatalogs({ profileRegistry: unsafe }),
    (error) => error.code === "legal-rag-catalog-path-unsafe"
);

const missing = JSON.parse(JSON.stringify(profiles));
missing.catalogs[0].catalogPath = "growwithhr-rag/data/not-present.json";
assert.throws(
    () => loader.loadGovernedLegalCatalogs({ profileRegistry: missing }),
    (error) => error.code === "legal-rag-catalog-file-unavailable"
);

const source = await readFile(path.join(ROOT, "server-legal-rag-catalogs.js"), "utf8");
assert.equal(/\bfetch\s*\(/.test(source), false);
assert.equal(/https?:\/\//.test(source), false);
assert.match(source, /sha256/);
assert.match(source, /active-private-beta/);
assert.match(source, /path escapes the repository root/);

console.log(JSON.stringify({
    valid: true,
    loadedCatalogs: Object.keys(snapshot.catalogs).length,
    activeCatalogs: snapshot.activeCatalogIds.length,
    sourceCount: snapshot.metadata[0].sourceCount,
    chunkCount: snapshot.metadata[0].chunkCount,
    unsafePathRejected: true
}, null, 2));
