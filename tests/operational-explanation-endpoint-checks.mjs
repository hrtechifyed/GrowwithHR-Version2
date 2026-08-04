import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const {
    ROUTE,
    ENDPOINT_VERSION,
    SUPPORTED_FEATURES,
    OperationalExplanationEndpointError,
    normalizeBody,
    createOperationalExplanationService
} = require("../server-operational-explanation.js");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGE_PATH = path.join(ROOT, "package.json");
const FIXED_DATE = new Date("2026-08-03T10:00:00.000Z");

async function modulesLoader() {
    const [factMapper, evaluator, contract] = await Promise.all([
        import("../js/assessment-v3/fact-mapper.js"),
        import("../js/assessment-v3/recommendation-evaluator.js"),
        import("../growwithhr-rag/operational-explanation-contract.js")
    ]);
    return { factMapper, evaluator, contract };
}

async function providerRunner({ contract, request }) {
    const fallback = contract.createDeterministicOperationalExplanation({ request });
    return contract.runOperationalExplanationProvider({
        request,
        providerName: "test-provider",
        model: "test-model",
        generate: async () => JSON.parse(JSON.stringify(fallback))
    });
}

function assertGovernedEnvelope(value, expectedFeatureId, expectedStatus) {
    assert.equal(value.endpointVersion, ENDPOINT_VERSION);
    assert.equal(value.featureId, expectedFeatureId);
    assert.equal(value.recommendationAuthority, "deterministic-operational");
    assert.equal(value.providerRole, "explanation-only");
    assert.equal(value.usedForRecommendation, false);
    assert.equal(value.mayChangeRecommendation, false);
    assert.equal(value.legalAdvice, false);
    assert.equal(value.recommendation.featureId, expectedFeatureId);
    assert.equal(value.recommendation.operationalStatus, expectedStatus);
    assert.match(value.recommendation.recommendationFingerprint, /^[a-f0-9]{64}$/);
    assert.equal(value.explanation.provider.role, "explanation-only");
    assert.equal(value.explanation.usedForRecommendation, false);
    assert.equal(value.explanation.mayChangeRecommendation, false);
    assert.equal(value.explanation.legalAdvice, false);
    assert.equal(
        value.explanation.recommendationFingerprint,
        value.recommendation.recommendationFingerprint
    );
    assert.equal(
        value.explanation.response.recommendationFingerprint,
        value.recommendation.recommendationFingerprint
    );
    assert.equal(
        value.explanation.response.operationalStatus,
        value.recommendation.operationalStatus
    );
    assert.equal(value.guidance.sources.length >= 1, true);
    assert.equal(value.guidance.sources.every((source) => source.official === true), true);
    assert.equal(value.guidance.sources.every((source) => /^https:\/\//.test(source.url)), true);
}

async function main() {
    const packageJson = await readFile(PACKAGE_PATH, "utf8").then(JSON.parse);

    assert.equal(ROUTE, "/api/operational-explanation");
    assert.equal(ENDPOINT_VERSION, "1.0.0");
    assert.equal(Object.keys(SUPPORTED_FEATURES).length, 6);

    assert.deepEqual(
        normalizeBody({
            featureId: "feature.advisory.employment-documentation",
            answers: { employees: "12" }
        }),
        {
            featureId: "feature.advisory.employment-documentation",
            answers: { employees: 12 }
        }
    );

    assert.throws(
        () => normalizeBody({
            featureId: "feature.legal.social-security",
            answers: { employees: 12 }
        }),
        (error) => error instanceof OperationalExplanationEndpointError && error.status === 400
    );
    assert.throws(
        () => normalizeBody({
            featureId: "feature.advisory.employment-documentation",
            answers: { employees: 12, companyName: "Must not be accepted" }
        }),
        /Unsupported assessment fields/
    );
    assert.throws(
        () => normalizeBody({
            featureId: "feature.advisory.distributed-workforce",
            answers: { remoteExact: 101 }
        }),
        /between 0 and 100/
    );

    let providerCalls = 0;
    const service = createOperationalExplanationService({
        config: {
            enabled: true,
            cacheTtlMs: 60 * 60 * 1000,
            failureBackoffMs: 60 * 1000,
            maxConcurrency: 2,
            maxQueue: 10
        },
        modulesLoader,
        now: () => new Date(FIXED_DATE),
        providerRunner: async (input) => {
            providerCalls += 1;
            return providerRunner(input);
        }
    });

    const scenarios = [
        {
            featureId: "feature.advisory.employment-documentation",
            answers: { employees: 12 },
            status: "recommended"
        },
        {
            featureId: "feature.advisory.multi-location-workplace",
            answers: { locations: 3 },
            status: "recommended"
        },
        {
            featureId: "feature.advisory.distributed-workforce",
            answers: { workModel: "Remote", remoteBand: "51-75%", remoteExact: 60 },
            status: "recommended"
        },
        {
            featureId: "feature.advisory.workforce-planning",
            answers: { hiringPlans: "Significant Growth", expansionPlans: ["new-locations"] },
            status: "recommended"
        },
        {
            featureId: "feature.advisory.people-governance-ownership",
            answers: { peopleFunction: "Founder-led" },
            status: "recommended"
        },
        {
            featureId: "feature.advisory.policies-compliance-priority",
            answers: { priorities: ["policies-compliance"] },
            status: "recommended"
        }
    ];

    for (const scenario of scenarios) {
        const result = await service.explain({
            featureId: scenario.featureId,
            answers: scenario.answers
        });
        assertGovernedEnvelope(result, scenario.featureId, scenario.status);
        assert.equal(result.delivery.cacheStatus, "miss");
        assert.equal(result.delivery.providerRequestsForThisResponse, 1);
        assert.equal(
            Object.keys(result.recommendation).includes("answers"),
            false
        );
    }
    assert.equal(providerCalls, 6);

    const cached = await service.explain({
        featureId: scenarios[0].featureId,
        answers: scenarios[0].answers
    });
    assertGovernedEnvelope(cached, scenarios[0].featureId, "recommended");
    assert.equal(cached.delivery.cacheStatus, "hit");
    assert.equal(cached.delivery.providerRequestsForThisResponse, 0);
    assert.equal(providerCalls, 6);

    const notTriggered = await service.explain({
        featureId: "feature.advisory.multi-location-workplace",
        answers: { locations: 1 }
    });
    assertGovernedEnvelope(
        notTriggered,
        "feature.advisory.multi-location-workplace",
        "not-triggered"
    );

    const missing = await service.explain({
        featureId: "feature.advisory.employment-documentation",
        answers: {}
    });
    assertGovernedEnvelope(
        missing,
        "feature.advisory.employment-documentation",
        "more-information-needed"
    );
    assert.deepEqual(
        missing.recommendation.missingFactIds,
        ["fact.workforce.employee-count"]
    );

    assert.equal(
        packageJson.scripts["test:operational-explanation-endpoint"],
        "node tests/operational-explanation-endpoint-checks.mjs"
    );
    assert.match(packageJson.scripts["test:m2"], /test:operational-explanation-endpoint/);

    console.log("Operational explanation endpoint checks passed.");
}

main().catch((error) => {
    console.error(error?.stack || error?.message || String(error));
    process.exitCode = 1;
});
