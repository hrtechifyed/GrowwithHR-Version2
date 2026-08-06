import assert from "node:assert/strict";
import crypto from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (target) => readFile(path.join(ROOT, target), "utf8").then(JSON.parse);

function gitBlobSha(content) {
    const bytes = Buffer.from(content, "utf8");
    return crypto.createHash("sha1")
        .update(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`, "utf8"), bytes]))
        .digest("hex");
}

const [hardening, schema, reliability, packageJson, roadmap] = await Promise.all([
    readJson("data/architecture/m7-rag-ready-hardening.v1.json"),
    readJson("schemas/m7-rag-ready-hardening.schema.v1.json"),
    readJson("data/releases/m7-reliability-evidence.v1.json"),
    readJson("package.json"),
    readFile(path.join(ROOT, "ROADMAP.md"), "utf8")
]);

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);
assert.equal(validate(hardening), true, JSON.stringify(validate.errors, null, 2));

assert.equal(hardening.milestone, "M7");
assert.equal(hardening.targetRelease, "0.22.0");
assert.equal(hardening.implementationStatus, "implemented-awaiting-release-evidence");
assert.equal(hardening.releaseCut, false);
assert.equal(hardening.authorityBoundary.applicabilityAuthority, "deterministic-only");
assert.equal(hardening.authorityBoundary.retrievalRole, "source-retrieval-only");
assert.equal(hardening.authorityBoundary.providerRole, "explanation-only");
assert.equal(hardening.authorityBoundary.ragMayChangeDecision, false);

const categories = new Set(hardening.frozenContracts.map((item) => item.category));
assert.deepEqual(categories, new Set(["profile", "obligation", "applicability", "citation"]));
assert.equal(new Set(hardening.frozenContracts.map((item) => item.contractId)).size, hardening.frozenContracts.length);

for (const contract of hardening.frozenContracts) {
    const target = path.resolve(ROOT, contract.path);
    assert(target.startsWith(`${ROOT}${path.sep}`));
    const content = await readFile(target, "utf8");
    assert.equal(gitBlobSha(content), contract.baselineGitBlobSha, `Frozen contract drift: ${contract.contractId}`);
    assert(contract.requiredInvariants.length >= 2);
}

assert.equal(hardening.sourceLifecycle.dateInferenceAllowed, false);
assert.equal(hardening.sourceLifecycle.highCertaintyRequiresCurrentSources, true);
assert.equal(hardening.sourceLifecycle.changedOrSupersededSourcesInvalidateHighCertaintyOutput, true);
assert.equal(hardening.operationalHardening.readinessRoute, "/api/m7/readiness");
assert.equal(hardening.operationalHardening.disasterRecovery.deterministicDecisionsIndependentOfRag, true);
assert.equal(hardening.activationBoundary.newLegalProfilesActivated, false);
assert.equal(hardening.activationBoundary.newCorporaApproved, false);
assert.equal(hardening.activationBoundary.remotePersistenceActivated, false);
assert.equal(hardening.activationBoundary.publicV3Cutover, false);
assert.equal(hardening.activationBoundary.reportPdfEmailMutation, false);

assert.equal(reliability.requiredConsecutiveQualifiedReleases, 2);
assert.deepEqual(reliability.qualifiedReleases, []);
assert.equal(reliability.releaseExitSatisfied, false);
assert.equal(reliability.status, "awaiting-production-releases");
assert(reliability.qualificationRules.some((item) => /CI run alone is not/.test(item)));

assert.notEqual(packageJson.version, hardening.targetRelease, "M7 hardening must not silently cut v0.22.0.");
assert.match(packageJson.version, /^0\.20\.\d+(?:-[0-9A-Za-z.-]+)?$/, "Pre-M7 product releases must remain on the v0.20 line until the M7 release exit is satisfied.");
assert.equal(packageJson.scripts["test:m7-contract-freeze"], "node tests/m7-rag-ready-hardening-checks.mjs");
assert.match(packageJson.scripts["test:m7"], /test:m7-contract-freeze/);
assert.match(packageJson.scripts.test, /test:m7/);
assert.match(roadmap, /M7 — RAG-Ready Hardening/);
assert.match(roadmap, /implemented, release exit pending/i);
assert.match(roadmap, /two consecutive qualified production releases/i);

console.log(JSON.stringify({
    valid: true,
    milestone: hardening.milestone,
    implementationStatus: hardening.implementationStatus,
    frozenContractCount: hardening.frozenContracts.length,
    releaseExitSatisfied: reliability.releaseExitSatisfied
}, null, 2));
