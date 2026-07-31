/** Proves that POSH retrieval runs after, and cannot change, the legal decision. */

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FIXED_AT = "2026-07-31T00:00:00.000Z";
const assessment = (...parts) => path.join(ROOT, "js", "assessment-v3", ...parts);
const project = (...parts) => path.join(ROOT, ...parts);

const paths = {
    contract: assessment("traceability-contract.js"),
    mapper: assessment("fact-mapper.js"),
    evaluator: assessment("recommendation-evaluator.js"),
    assurance: assessment("legal-rule-assurance.js"),
    retrieval: project("growwithhr-rag", "legal-source-retrieval.js"),
    legalCatalog: project("data", "assessment", "legal-applicability-rules.v1.json"),
    retrievalCatalog: project("growwithhr-rag", "data", "posh-source-chunks.v1.json"),
    verifier: project("scripts", "verify-posh-source-pack.mjs"),
    readme: project("growwithhr-rag", "README.md"),
    package: project("package.json")
};

const clone = (value) => JSON.parse(JSON.stringify(value));

function rewriteImports(source) {
    return source
        .replaceAll("./traceability-contract.js", "./traceability-contract.mjs")
        .replaceAll("./fact-mapper.js", "./fact-mapper.mjs")
        .replaceAll("./recommendation-evaluator.js", "./recommendation-evaluator.mjs");
}

async function loadModules() {
    const directory = await mkdtemp(path.join(tmpdir(), "growwithhr-legal-retrieval-"));
    const sources = await Promise.all([
        readFile(paths.contract, "utf8"),
        readFile(paths.mapper, "utf8"),
        readFile(paths.evaluator, "utf8"),
        readFile(paths.assurance, "utf8"),
        readFile(paths.retrieval, "utf8")
    ]);
    const files = [
        ["traceability-contract.mjs", sources[0]],
        ["fact-mapper.mjs", rewriteImports(sources[1])],
        ["recommendation-evaluator.mjs", rewriteImports(sources[2])],
        ["legal-rule-assurance.mjs", rewriteImports(sources[3])],
        ["legal-source-retrieval.mjs", sources[4]]
    ];
    await Promise.all(files.map(([name, content]) => writeFile(path.join(directory, name), content, "utf8")));
    return {
        directory,
        retrievalSource: sources[4],
        assurance: await import(pathToFileURL(path.join(directory, "legal-rule-assurance.mjs")).href),
        retrieval: await import(pathToFileURL(path.join(directory, "legal-source-retrieval.mjs")).href)
    };
}

function expectIssue(result, expectedPath) {
    assert.equal(result.valid, false);
    assert(result.errors.some((item) => item.path === expectedPath), JSON.stringify(result.errors, null, 2));
}

function poshDecision(assurance) {
    const decision = assurance.decisions.find((item) => item.productRuleId === "posh");
    assert(decision, "The deterministic assurance result must include POSH.");
    return decision;
}

async function main() {
    const [legalCatalog, retrievalCatalog, verifierSource, readme, packageJson] = await Promise.all([
        readFile(paths.legalCatalog, "utf8").then(JSON.parse),
        readFile(paths.retrievalCatalog, "utf8").then(JSON.parse),
        readFile(paths.verifier, "utf8"),
        readFile(paths.readme, "utf8"),
        readFile(paths.package, "utf8").then(JSON.parse)
    ]);
    const loaded = await loadModules();

    try {
        const validation = loaded.retrieval.validateLegalSourceRetrievalCatalog(retrievalCatalog);
        assert.equal(validation.valid, true, JSON.stringify(validation.errors, null, 2));
        assert.equal(retrievalCatalog.applicabilityAuthority, "none");
        assert.equal(retrievalCatalog.llmRole, "none");
        assert.equal(retrievalCatalog.legalReviewStatus, "needs-legal-review");
        assert.equal(retrievalCatalog.sources.length, 3);

        for (const chunk of retrievalCatalog.chunks) {
            const digest = createHash("sha256").update(chunk.text, "utf8").digest("hex");
            assert.equal(digest, chunk.contentSha256, `Chunk fingerprint mismatch: ${chunk.chunkId}`);
        }

        const legalSources = new Map(legalCatalog.sources.map((source) => [source.registrySourceId, source]));
        for (const source of retrievalCatalog.sources) {
            const legalSource = legalSources.get(source.registrySourceId);
            assert(legalSource, `Unknown legal source: ${source.registrySourceId}`);
            assert.equal(source.fileName, legalSource.fileName);
            assert.equal(source.drivePath, legalSource.drivePath);
            assert.equal(source.reviewStatus, "needs-legal-review");
        }

        const evaluate = (answers) => loaded.assurance.evaluateLegalRuleAssurance({
            answers,
            catalog: legalCatalog,
            evaluatedAt: FIXED_AT
        });

        const thresholdDecision = poshDecision(evaluate({ employees: 10, primaryState: "Maharashtra", locations: 1 }));
        const decisionBefore = JSON.stringify(thresholdDecision);
        const thresholdTrace = loaded.retrieval.retrieveLegalDecisionSources({
            decision: thresholdDecision,
            catalog: retrievalCatalog,
            queryTerms: ["Internal Committee", "office administrative unit"],
            maxChunks: 4
        });

        assert.equal(thresholdTrace.retrievalStatus, "completed");
        assert.equal(thresholdTrace.triggeredAfterDecision, true);
        assert.equal(thresholdTrace.usedForDecision, false);
        assert.equal(thresholdTrace.applicabilityAuthority, "none");
        assert.equal(thresholdTrace.llmUsed, false);
        assert.equal(thresholdTrace.decisionReference.status, "specialist-review");
        assert.equal(thresholdTrace.decisionReference.reasonCode, "POSH_IC_THRESHOLD_REACHED_REVIEW_REQUIRED");
        assert.equal(JSON.stringify(thresholdDecision), decisionBefore, "Retrieval mutated the decision.");
        assert(thresholdTrace.retrievedChunks.some((chunk) => chunk.chunkId === "posh-act-2013-section-4-001"));
        assert(thresholdTrace.retrievedChunks.every((chunk) => thresholdDecision.sourceRegistryIds.includes(chunk.registrySourceId)));

        const disabled = loaded.retrieval.retrieveLegalDecisionSources({
            decision: thresholdDecision,
            catalog: retrievalCatalog,
            enabled: false
        });
        assert.equal(disabled.retrievalStatus, "disabled");
        assert.equal(disabled.retrievedChunks.length, 0);
        assert.equal(disabled.decisionFingerprint, thresholdTrace.decisionFingerprint);

        const changedCatalog = clone(retrievalCatalog);
        changedCatalog.chunks[0].text = "Changed retrieval-only text used to prove decision isolation.";
        const changedTrace = loaded.retrieval.retrieveLegalDecisionSources({
            decision: thresholdDecision,
            catalog: changedCatalog
        });
        assert.equal(changedTrace.decisionFingerprint, thresholdTrace.decisionFingerprint);
        assert.equal(changedTrace.decisionReference.status, thresholdDecision.status);
        assert.equal(changedTrace.decisionReference.reasonCode, thresholdDecision.reasonCode);

        const belowDecision = poshDecision(evaluate({ employees: 9, primaryState: "Maharashtra", locations: 1 }));
        const belowTrace = loaded.retrieval.retrieveLegalDecisionSources({ decision: belowDecision, catalog: retrievalCatalog });
        assert.equal(belowTrace.decisionReference.status, "not-currently-applicable");
        assert(belowTrace.retrievedChunks.some((chunk) => chunk.chunkId === "posh-act-2013-section-6-001"));

        const missingDecision = poshDecision(evaluate({ primaryState: "Delhi (NCT)", locations: 1 }));
        const missingTrace = loaded.retrieval.retrieveLegalDecisionSources({ decision: missingDecision, catalog: retrievalCatalog });
        assert.equal(missingTrace.decisionReference.status, "more-information-needed");
        assert(missingTrace.decisionReference.missingFactIds.includes("fact.workforce.employee-count"));
        assert.equal(Object.hasOwn(missingTrace, "facts"), false);

        const unknownDecision = clone(thresholdDecision);
        unknownDecision.sourceRegistryIds.push("unknown-source");
        expectIssue(loaded.retrieval.retrieveLegalDecisionSourcesSafely({
            decision: unknownDecision,
            catalog: retrievalCatalog
        }), "/decision/sourceRegistryIds");

        const invalidCatalog = clone(retrievalCatalog);
        invalidCatalog.chunks[0].registrySourceId = "unregistered-source";
        expectIssue(loaded.retrieval.validateLegalSourceRetrievalCatalog(invalidCatalog), "/chunks/0/registrySourceId");

        assert(Object.isFrozen(thresholdTrace));
        assert(Object.isFrozen(thresholdTrace.retrievedChunks));
        for (const forbidden of [/\bfetch\s*\(/, /XMLHttpRequest/, /localStorage/, /sessionStorage/, /openai/i, /anthropic/i, /chromadb/i, /embedding/i]) {
            assert.equal(forbidden.test(loaded.retrievalSource), false, `Forbidden runtime marker: ${forbidden}`);
        }

        assert.match(verifierSource, /createHash\("sha256"\)/);
        assert.match(verifierSource, /Unregistered PDF files/);
        assert.match(readme, /retrieval happens only after a deterministic decision/i);
        assert.match(readme, /does not use embeddings or a vector database/i);
        assert.equal(packageJson.scripts["test:legal-source-retrieval"], "node tests/legal-source-retrieval-checks.mjs");
        assert.match(packageJson.scripts["test:m2"], /test:legal-source-retrieval/);

        console.log([
            "Governed legal source retrieval checks passed.",
            `Threshold chunks: ${thresholdTrace.retrievedChunks.length}`,
            `Below-threshold chunks: ${belowTrace.retrievedChunks.length}`,
            `Missing-information chunks: ${missingTrace.retrievedChunks.length}`,
            `Decision fingerprint: ${thresholdTrace.decisionFingerprint}`
        ].join("\n"));
    } finally {
        await rm(loaded.directory, { recursive: true, force: true });
    }
}

main().catch((error) => {
    console.error(error?.stack || error?.message || String(error));
    process.exitCode = 1;
});
