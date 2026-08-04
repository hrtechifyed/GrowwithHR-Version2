import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
    OPERATIONAL_EXPLANATION_CONTRACT_VERSION,
    REQUIRED_OPERATIONAL_LIMITATIONS,
    buildOperationalExplanationRequest,
    validateOperationalExplanationResponse,
    createDeterministicOperationalExplanation,
    runOperationalExplanationProvider,
    runOperationalExplanationProviderSafely
} from "../growwithhr-rag/operational-explanation-contract.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCHEMA_PATH = path.join(ROOT, "schemas", "operational-explanation-response.schema.v1.json");
const PACKAGE_PATH = path.join(ROOT, "package.json");
const clone = (value) => JSON.parse(JSON.stringify(value));

function deterministicRecommendation() {
    return {
        featureId: "feature.advisory.workforce-planning",
        ruleId: "rule.growth.rapid-change.workforce-planning",
        ruleVersion: "1.0.0",
        operationalStatus: "recommended",
        reasonCode: "WORKFORCE_PLANNING_RECOMMENDED",
        reason: "The organisation reported significant hiring growth or active expansion.",
        title: "Create a workforce plan",
        action: "Document expected roles, hiring sequence, ownership and onboarding capacity.",
        timeline: "Before major hiring or expansion begins",
        recommendationFingerprint: "a".repeat(64),
        sourceIds: ["source.labour-ministry.official-portal"],
        limitations: ["The assessment uses reported plans rather than verified forecasts."]
    };
}

function guidance() {
    return {
        sources: [{
            id: "source.labour-ministry.official-portal",
            title: "Ministry of Labour and Employment",
            publisher: "Government of India",
            url: "https://www.labour.gov.in/",
            sourceType: "official-portal",
            official: true
        }]
    };
}

function expectIssue(validation, expectedPath) {
    assert.equal(validation.valid, false, "Expected validation to fail.");
    assert(
        validation.errors.some((item) => item.path === expectedPath),
        JSON.stringify(validation.errors, null, 2)
    );
}

async function main() {
    const [schema, packageJson] = await Promise.all([
        readFile(SCHEMA_PATH, "utf8").then(JSON.parse),
        readFile(PACKAGE_PATH, "utf8").then(JSON.parse)
    ]);

    assert.equal(OPERATIONAL_EXPLANATION_CONTRACT_VERSION, "1.0.0");
    assert.equal(REQUIRED_OPERATIONAL_LIMITATIONS.length, 3);

    const request = buildOperationalExplanationRequest({
        recommendation: deterministicRecommendation(),
        guidance: guidance(),
        requestedAt: "2026-08-03T10:00:00.000Z"
    });

    assert.equal(request.providerRole, "explanation-only");
    assert.equal(request.usedForRecommendation, false);
    assert.equal(request.mayChangeRecommendation, false);
    assert.equal(request.recommendationAuthority, "none");
    assert.equal(request.legalAdvice, false);
    assert.equal(Object.hasOwn(request, "answers"), false);
    assert.equal(Object.hasOwn(request, "facts"), false);
    assert.equal(Object.hasOwn(request, "evidence"), false);
    assert(Object.isFrozen(request));
    assert(Object.isFrozen(request.recommendationReference));

    const fallback = createDeterministicOperationalExplanation({ request });
    const validation = validateOperationalExplanationResponse({ request, response: fallback });
    assert.equal(validation.valid, true, JSON.stringify(validation.errors, null, 2));

    const ajv = new Ajv2020({ allErrors: true, strict: true });
    addFormats(ajv);
    const validateSchema = ajv.compile(schema);
    assert.equal(validateSchema(fallback), true, JSON.stringify(validateSchema.errors, null, 2));

    let providerReceivedFrozenRequest = false;
    const envelope = await runOperationalExplanationProvider({
        request,
        providerName: "test-provider",
        model: "test-model",
        generate: async (providerRequest) => {
            providerReceivedFrozenRequest =
                Object.isFrozen(providerRequest) &&
                Object.isFrozen(providerRequest.recommendationReference);
            return clone(fallback);
        }
    });

    assert.equal(providerReceivedFrozenRequest, true);
    assert.equal(envelope.provider.role, "explanation-only");
    assert.equal(envelope.usedForRecommendation, false);
    assert.equal(envelope.mayChangeRecommendation, false);
    assert.equal(envelope.legalAdvice, false);
    assert.equal(envelope.recommendationFingerprint, "a".repeat(64));
    assert(Object.isFrozen(envelope));

    const statusOverride = clone(fallback);
    statusOverride.operationalStatus = "not-triggered";
    expectIssue(
        validateOperationalExplanationResponse({ request, response: statusOverride }),
        "/response/operationalStatus"
    );

    const reasonOverride = clone(fallback);
    reasonOverride.reasonCode = "PROVIDER_CHANGED_REASON";
    expectIssue(
        validateOperationalExplanationResponse({ request, response: reasonOverride }),
        "/response/reasonCode"
    );

    const fingerprintOverride = clone(fallback);
    fingerprintOverride.recommendationFingerprint = "b".repeat(64);
    expectIssue(
        validateOperationalExplanationResponse({ request, response: fingerprintOverride }),
        "/response/recommendationFingerprint"
    );

    const unknownSource = clone(fallback);
    unknownSource.rationale[0].sourceIds = ["unknown-source"];
    expectIssue(
        validateOperationalExplanationResponse({ request, response: unknownSource }),
        "/response/rationale/0/sourceIds"
    );

    const missingLimitation = clone(fallback);
    missingLimitation.limitations.shift();
    expectIssue(
        validateOperationalExplanationResponse({ request, response: missingLimitation }),
        "/response/limitations"
    );

    const legalClaim = clone(fallback);
    legalClaim.summary = "This is legally required and certified compliant.";
    expectIssue(
        validateOperationalExplanationResponse({ request, response: legalClaim }),
        "/response"
    );

    const extraProperty = clone(fallback);
    extraProperty.legalApplicability = "applicable";
    expectIssue(
        validateOperationalExplanationResponse({ request, response: extraProperty }),
        "/response/legalApplicability"
    );

    const rejected = await runOperationalExplanationProviderSafely({
        request,
        generate: async () => statusOverride
    });
    expectIssue(rejected, "/response/operationalStatus");

    assert.throws(
        () => buildOperationalExplanationRequest({
            recommendation: {
                ...deterministicRecommendation(),
                sourceIds: ["unknown-source"]
            },
            guidance: guidance(),
            requestedAt: "2026-08-03T10:00:00.000Z"
        }),
        (error) => error.issues.some((item) => item.path === "/recommendation/sourceIds")
    );

    assert.equal(
        packageJson.scripts["test:operational-explanation-contract"],
        "node tests/operational-explanation-contract-checks.mjs"
    );
    assert.match(packageJson.scripts["test:m2"], /test:operational-explanation-contract/);

    console.log("Operational explanation contract checks passed.");
}

main().catch((error) => {
    console.error(error?.stack || error?.message || String(error));
    process.exitCode = 1;
});
