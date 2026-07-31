/** Proves that generated legal explanations cannot change the governed decision or citations. */

import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FIXED_AT = "2026-07-31T00:00:00.000Z";
const project = (...parts) => path.join(ROOT, ...parts);
const assessment = (...parts) => project("js", "assessment-v3", ...parts);
const clone = (value) => JSON.parse(JSON.stringify(value));

const paths = {
    contract: assessment("traceability-contract.js"),
    mapper: assessment("fact-mapper.js"),
    evaluator: assessment("recommendation-evaluator.js"),
    assurance: assessment("legal-rule-assurance.js"),
    retrieval: project("growwithhr-rag", "legal-source-retrieval.js"),
    explanation: project("growwithhr-rag", "legal-explanation-contract.js"),
    legalCatalog: project("data", "assessment", "legal-applicability-rules.v1.json"),
    retrievalCatalog: project("growwithhr-rag", "data", "posh-source-chunks.v1.json"),
    schema: project("schemas", "legal-explanation-response.schema.v1.json"),
    readme: project("growwithhr-rag", "README.md"),
    package: project("package.json")
};

function rewriteImports(source) {
    return source
        .replaceAll("./traceability-contract.js", "./traceability-contract.mjs")
        .replaceAll("./fact-mapper.js", "./fact-mapper.mjs")
        .replaceAll("./recommendation-evaluator.js", "./recommendation-evaluator.mjs");
}

async function loadModules() {
    const directory = await mkdtemp(path.join(tmpdir(), "growwithhr-legal-explanation-"));
    const sources = await Promise.all([
        readFile(paths.contract, "utf8"),
        readFile(paths.mapper, "utf8"),
        readFile(paths.evaluator, "utf8"),
        readFile(paths.assurance, "utf8"),
        readFile(paths.retrieval, "utf8"),
        readFile(paths.explanation, "utf8")
    ]);
    const files = [
        ["traceability-contract.mjs", sources[0]],
        ["fact-mapper.mjs", rewriteImports(sources[1])],
        ["recommendation-evaluator.mjs", rewriteImports(sources[2])],
        ["legal-rule-assurance.mjs", rewriteImports(sources[3])],
        ["legal-source-retrieval.mjs", sources[4]],
        ["legal-explanation-contract.mjs", sources[5]]
    ];
    await Promise.all(files.map(([name, content]) => writeFile(path.join(directory, name), content, "utf8")));
    return {
        directory,
        explanationSource: sources[5],
        assurance: await import(pathToFileURL(path.join(directory, "legal-rule-assurance.mjs")).href),
        retrieval: await import(pathToFileURL(path.join(directory, "legal-source-retrieval.mjs")).href),
        explanation: await import(pathToFileURL(path.join(directory, "legal-explanation-contract.mjs")).href)
    };
}

function expectIssue(validation, expectedPath) {
    assert.equal(validation.valid, false, "Expected validation to fail.");
    assert(validation.errors.some((item) => item.path === expectedPath), JSON.stringify(validation.errors, null, 2));
}

function poshDecision(assurance) {
    const decision = assurance.decisions.find((item) => item.productRuleId === "posh");
    assert(decision, "The deterministic assurance result must include POSH.");
    return decision;
}

async function main() {
    const [legalCatalog, retrievalCatalog, schema, readme, packageJson] = await Promise.all([
        readFile(paths.legalCatalog, "utf8").then(JSON.parse),
        readFile(paths.retrievalCatalog, "utf8").then(JSON.parse),
        readFile(paths.schema, "utf8").then(JSON.parse),
        readFile(paths.readme, "utf8"),
        readFile(paths.package, "utf8").then(JSON.parse)
    ]);
    const loaded = await loadModules();

    try {
        const assurance = loaded.assurance.evaluateLegalRuleAssurance({
            answers: { employees: 10, primaryState: "Maharashtra", locations: 1 },
            catalog: legalCatalog,
            evaluatedAt: FIXED_AT
        });
        const decision = poshDecision(assurance);
        const retrievalTrace = loaded.retrieval.retrieveLegalDecisionSources({
            decision,
            catalog: retrievalCatalog,
            queryTerms: ["Internal Committee", "office administrative unit"],
            maxChunks: 4
        });
        const request = loaded.explanation.buildLegalExplanationRequest({
            decision,
            retrievalTrace,
            requestedAt: FIXED_AT
        });

        assert.equal(request.providerRole, "explanation-only");
        assert.equal(request.usedForDecision, false);
        assert.equal(request.mayChangeDecision, false);
        assert.equal(request.applicabilityAuthority, "none");
        assert.equal(request.legalAdvice, false);
        assert.equal(request.decisionReference.status, decision.status);
        assert.equal(request.decisionReference.reasonCode, decision.reasonCode);
        assert.equal(request.decisionReference.decisionFingerprint, retrievalTrace.decisionFingerprint);
        assert.equal(Object.hasOwn(request, "answers"), false);
        assert.equal(Object.hasOwn(request, "facts"), false);
        assert(Object.isFrozen(request));
        assert(Object.isFrozen(request.retrievalReference.retrievedChunks));

        const fallback = loaded.explanation.createDeterministicLegalExplanation({ request });
        const manualValidation = loaded.explanation.validateLegalExplanationResponse({ request, response: fallback });
        assert.equal(manualValidation.valid, true, JSON.stringify(manualValidation.errors, null, 2));

        const ajv = new Ajv2020({ allErrors: true, strict: true });
        addFormats(ajv);
        const validateSchema = ajv.compile(schema);
        assert.equal(validateSchema(fallback), true, JSON.stringify(validateSchema.errors, null, 2));

        let providerRequestWasFrozen = false;
        const providerEnvelope = await loaded.explanation.runLegalExplanationProvider({
            request,
            providerName: "test-provider",
            model: "test-model",
            generate: async (providerRequest) => {
                providerRequestWasFrozen = Object.isFrozen(providerRequest) && Object.isFrozen(providerRequest.decisionReference);
                return clone(fallback);
            }
        });
        assert.equal(providerRequestWasFrozen, true);
        assert.equal(providerEnvelope.provider.role, "explanation-only");
        assert.equal(providerEnvelope.usedForDecision, false);
        assert.equal(providerEnvelope.mayChangeDecision, false);
        assert.equal(providerEnvelope.decisionFingerprint, retrievalTrace.decisionFingerprint);
        assert(Object.isFrozen(providerEnvelope));
        assert(Object.isFrozen(providerEnvelope.response));

        const repeated = loaded.explanation.createDeterministicLegalExplanation({ request });
        assert.deepEqual(repeated, fallback, "Deterministic fallback changed for identical input.");

        const statusOverride = clone(fallback);
        statusOverride.decisionStatus = "applicable";
        expectIssue(loaded.explanation.validateLegalExplanationResponse({ request, response: statusOverride }), "/response/decisionStatus");

        const reasonOverride = clone(fallback);
        reasonOverride.reasonCode = "PROVIDER_CHANGED_REASON";
        expectIssue(loaded.explanation.validateLegalExplanationResponse({ request, response: reasonOverride }), "/response/reasonCode");

        const unknownCitation = clone(fallback);
        unknownCitation.rationale[0].citationChunkIds = ["unknown-source-chunk"];
        expectIssue(loaded.explanation.validateLegalExplanationResponse({ request, response: unknownCitation }), "/response/rationale/0/citationChunkIds");

        const missingLimitation = clone(fallback);
        missingLimitation.limitations.shift();
        expectIssue(loaded.explanation.validateLegalExplanationResponse({ request, response: missingLimitation }), "/response/limitations");

        const definitiveClaim = clone(fallback);
        definitiveClaim.summary = "This organisation is definitely compliant and the law definitely applies.";
        expectIssue(loaded.explanation.validateLegalExplanationResponse({ request, response: definitiveClaim }), "/response");

        const extraProperty = clone(fallback);
        extraProperty.applicabilityDecision = "applicable";
        expectIssue(loaded.explanation.validateLegalExplanationResponse({ request, response: extraProperty }), "/response/applicabilityDecision");

        const rejectedProvider = await loaded.explanation.runLegalExplanationProviderSafely({
            request,
            generate: async () => statusOverride
        });
        expectIssue(rejectedProvider, "/response/decisionStatus");

        const disabledTrace = loaded.retrieval.retrieveLegalDecisionSources({
            decision,
            catalog: retrievalCatalog,
            enabled: false
        });
        assert.throws(
            () => loaded.explanation.buildLegalExplanationRequest({ decision, retrievalTrace: disabledTrace, requestedAt: FIXED_AT }),
            (error) => error.issues.some((item) => item.path === "/retrieval/retrievalStatus")
        );

        const mismatchedTrace = clone(retrievalTrace);
        mismatchedTrace.decisionReference.status = "not-currently-applicable";
        assert.throws(
            () => loaded.explanation.buildLegalExplanationRequest({ decision, retrievalTrace: mismatchedTrace, requestedAt: FIXED_AT }),
            (error) => error.issues.some((item) => item.path === "/retrieval/decisionReference/status")
        );

        for (const forbidden of [/\bfetch\s*\(/, /XMLHttpRequest/, /process\.env/, /localStorage/, /sessionStorage/, /openai/i, /anthropic/i, /chromadb/i, /embedding/i]) {
            assert.equal(forbidden.test(loaded.explanationSource), false, `Forbidden runtime marker: ${forbidden}`);
        }

        assert.match(readme, /provider-neutral explanation contract/i);
        assert.match(readme, /cannot change the deterministic decision/i);
        assert.equal(packageJson.scripts["test:legal-explanation-contract"], "node tests/legal-explanation-contract-checks.mjs");
        assert.match(packageJson.scripts["test:m2"], /test:legal-explanation-contract/);

        console.log([
            "Legal explanation contract checks passed.",
            `Decision status: ${decision.status}`,
            `Citations available: ${request.retrievalReference.retrievedChunks.length}`,
            `Decision fingerprint: ${request.decisionReference.decisionFingerprint}`
        ].join("\n"));
    } finally {
        await rm(loaded.directory, { recursive: true, force: true });
    }
}

main().catch((error) => {
    console.error(error?.stack || error?.message || String(error));
    process.exitCode = 1;
});
