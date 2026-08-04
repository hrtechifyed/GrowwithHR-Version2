import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const orchestrator = require(path.join(ROOT, "server-legal-explanation-orchestrator.js"));
const poshCatalog = require(path.join(ROOT, "growwithhr-rag", "data", "posh-source-chunks.v1.json"));
const FIXED_DATE = new Date("2026-08-04T00:00:00.000Z");
const POSH_FEATURE = "feature.legal.posh.internal-committee-threshold";
const TEST_FEATURE = "feature.legal.test.explanation";

function testConfig(overrides = {}) {
    return Object.freeze({
        enabled: true,
        cacheTtlMs: 6 * 60 * 60 * 1000,
        failureBackoffMs: 60 * 1000,
        maxConcurrency: 4,
        maxQueue: 100,
        ...overrides
    });
}

function allObjectKeys(value, result = []) {
    if (!value || typeof value !== "object") return result;
    if (Array.isArray(value)) {
        value.forEach((item) => allObjectKeys(item, result));
        return result;
    }
    Object.entries(value).forEach(([key, item]) => {
        result.push(key);
        allObjectKeys(item, result);
    });
    return result;
}

async function validProvider({ contract, request }) {
    return contract.runLegalExplanationProvider({
        request,
        generate: async (protectedRequest) => contract.createDeterministicLegalExplanation({
            request: protectedRequest
        }),
        providerName: "generic-orchestration-test-provider",
        model: "test-model"
    });
}

function customRegistry({ blocked = false } = {}) {
    return {
        schemaVersion: 1,
        registryVersion: "test",
        runtimeRole: "post-decision-rag-routing-only",
        applicabilityAuthority: "none",
        llmRole: "explanation-only",
        legalReviewStatus: "needs-legal-review",
        defaults: { maxChunks: 2 },
        catalogs: [
            {
                catalogId: "catalog.legal.test.v1",
                lawFamilyId: "test-law",
                catalogPath: "growwithhr-rag/data/posh-source-chunks.v1.json",
                format: "governed-legal-source-chunks-v1",
                allowedFeatureIds: [TEST_FEATURE]
            }
        ],
        profiles: [
            {
                profileId: "rag.legal.test.explanation",
                featureId: TEST_FEATURE,
                lawFamilyId: "test-law",
                activationStatus: blocked ? "blocked-awaiting-approval" : "active-private-beta",
                catalogId: "catalog.legal.test.v1",
                ruleIds: ["rule.legal.posh.internal-committee-threshold"],
                productRuleIds: [],
                queryTerms: ["Internal Committee", "commencement"],
                maxChunks: 2,
                explanationEnabled: !blocked,
                compatibilityRoutes: [],
                blockers: blocked ? ["Test approval is incomplete."] : []
            }
        ]
    };
}

async function main() {
    assert.equal(orchestrator.ORCHESTRATOR_VERSION, "1.0.0");
    assert.equal(orchestrator.legalExplanationOrchestratorConfig({}).enabled, false);
    assert.equal(orchestrator.legalExplanationOrchestratorConfig({
        LEGAL_EXPLANATION_ENDPOINT_ENABLED: "true"
    }).enabled, true);

    const answersBody = {
        answers: {
            employees: 10,
            primaryState: "Maharashtra",
            locations: 1
        }
    };

    let providerCalls = 0;
    const providerRequests = [];
    const poshService = orchestrator.createGenericLegalExplanationOrchestrator({
        featureId: POSH_FEATURE,
        config: testConfig(),
        normalizeBody: (value) => value,
        now: () => new Date(FIXED_DATE),
        providerRunner: async (input) => {
            providerCalls += 1;
            providerRequests.push(input.request);
            return validProvider(input);
        }
    });

    const simultaneous = await Promise.all(
        Array.from({ length: 25 }, () => poshService.explain(answersBody))
    );
    assert.equal(providerCalls, 1);
    assert.equal(simultaneous.filter((item) => item.delivery.cacheStatus === "miss").length, 1);
    assert.equal(simultaneous.filter((item) => item.delivery.cacheStatus === "shared").length, 24);

    const poshResult = simultaneous[0];
    assert.equal(poshResult.featureId, POSH_FEATURE);
    assert.equal(poshResult.lawFamilyId, "posh");
    assert.equal(poshResult.ragProfileId, "rag.legal.posh.internal-committee-threshold");
    assert.equal(poshResult.catalogId, "catalog.legal.posh.v1");
    assert.equal(poshResult.decision.status, "specialist-review");
    assert.equal(poshResult.decision.reasonCode, "POSH_IC_THRESHOLD_REACHED_REVIEW_REQUIRED");
    assert(poshResult.retrieval.citations.length > 0);
    assert.equal(Object.hasOwn(poshResult.retrieval.citations[0], "text"), false);

    const cached = await poshService.explain(answersBody);
    assert.equal(cached.delivery.cacheStatus, "hit");
    assert.equal(providerCalls, 1);

    providerRequests.forEach((request) => {
        const keys = new Set(allObjectKeys(request));
        for (const forbidden of ["answers", "assessmentAnswers", "rawAnswers", "facts", "mappedFacts", "evidence"]) {
            assert.equal(keys.has(forbidden), false, `Provider request exposed forbidden key: ${forbidden}`);
        }
    });

    let customProviderCalls = 0;
    const customService = orchestrator.createGenericLegalExplanationOrchestrator({
        featureId: TEST_FEATURE,
        config: testConfig(),
        normalizeBody: (value) => value,
        profileRegistry: customRegistry(),
        catalogs: { "catalog.legal.test.v1": poshCatalog },
        now: () => new Date(FIXED_DATE),
        providerRunner: async (input) => {
            customProviderCalls += 1;
            assert.equal(input.featureId, TEST_FEATURE);
            assert.equal(input.profile.lawFamilyId, "test-law");
            return validProvider(input);
        }
    });

    const customResult = await customService.explain(answersBody);
    assert.equal(customProviderCalls, 1);
    assert.equal(customResult.featureId, TEST_FEATURE);
    assert.equal(customResult.lawId, "test-law");
    assert.equal(customResult.lawFamilyId, "test-law");
    assert.equal(customResult.ragProfileId, "rag.legal.test.explanation");
    assert.equal(customResult.catalogId, "catalog.legal.test.v1");
    assert.equal(customResult.decision.ruleId, "rule.legal.posh.internal-committee-threshold");
    assert(customResult.retrieval.citations.length > 0);

    let blockedProviderCalls = 0;
    const blockedService = orchestrator.createGenericLegalExplanationOrchestrator({
        featureId: TEST_FEATURE,
        config: testConfig(),
        normalizeBody: (value) => value,
        profileRegistry: customRegistry({ blocked: true }),
        catalogs: { "catalog.legal.test.v1": poshCatalog },
        now: () => new Date(FIXED_DATE),
        providerRunner: async () => {
            blockedProviderCalls += 1;
            throw new Error("Provider must not run for a blocked feature.");
        }
    });

    await assert.rejects(
        blockedService.explain(answersBody),
        (error) => error.code === "legal-rag-profile-blocked"
    );
    assert.equal(blockedProviderCalls, 0);

    const source = await readFile(path.join(ROOT, "server-legal-explanation-orchestrator.js"), "utf8");
    assert.match(source, /featureId/);
    assert.match(source, /runLegalRagRetrieval/);
    assert.match(source, /decisionFingerprint/);
    assert.match(source, /retrievalFingerprint/);
    assert.match(source, /cacheStatus/);
    assert.match(source, /failureBackoffMs/);
    assert.equal(source.includes("/api/legal-explanation/posh"), false, "Generic orchestration must not own the POSH compatibility route.");
    assert.equal(/openai|anthropic|gemini|groq/i.test(source), false, "The orchestrator must not introduce another hosted provider.");

    console.log(JSON.stringify({
        valid: true,
        orchestratorVersion: orchestrator.ORCHESTRATOR_VERSION,
        poshProfile: poshResult.ragProfileId,
        customProfile: customResult.ragProfileId,
        blockedProviderCalls,
        providerRequestsWithRawAnswers: 0
    }, null, 2));
}

main().catch((error) => {
    console.error(error?.stack || error?.message || String(error));
    process.exitCode = 1;
});