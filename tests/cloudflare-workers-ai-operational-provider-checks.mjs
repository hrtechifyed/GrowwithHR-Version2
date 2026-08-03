import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
    buildOperationalExplanationRequest,
    createDeterministicOperationalExplanation
} from "../growwithhr-rag/operational-explanation-contract.js";

const require = createRequire(import.meta.url);
const {
    CLOUDFLARE_WORKERS_AI_MODEL,
    assertProtectedOperationalRequest,
    buildCloudflareWorkersAIOperationalRequest,
    createCloudflareWorkersAIOperationalExplanationProvider,
    runCloudflareWorkersAIOperationalExplanation
} = require("../growwithhr-rag/cloudflare-workers-ai-operational-provider.cjs");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGE_PATH = path.join(ROOT, "package.json");
const clone = (value) => JSON.parse(JSON.stringify(value));

function protectedRequest() {
    return buildOperationalExplanationRequest({
        requestedAt: "2026-08-03T10:00:00.000Z",
        recommendation: {
            featureId: "feature.advisory.employment-documentation",
            ruleId: "rule.governance.employment-documentation.review",
            ruleVersion: "1.0.0",
            operationalStatus: "recommended",
            reasonCode: "EMPLOYMENT_DOCUMENTATION_RECOMMENDED",
            reason: "The organisation reported one or more employees.",
            title: "Review employment documentation",
            action: "Review offer letters, employment terms and onboarding records.",
            timeline: "Within 30 days",
            recommendationFingerprint: "c".repeat(64),
            sourceIds: ["source.labour-ministry.official-portal"],
            limitations: []
        },
        guidance: {
            sources: [{
                id: "source.labour-ministry.official-portal",
                title: "Ministry of Labour and Employment",
                publisher: "Government of India",
                url: "https://www.labour.gov.in/",
                sourceType: "official-portal",
                official: true
            }]
        }
    });
}

async function main() {
    const packageJson = await readFile(PACKAGE_PATH, "utf8").then(JSON.parse);
    const request = protectedRequest();

    assert.equal(assertProtectedOperationalRequest(request), request);
    assert.throws(
        () => assertProtectedOperationalRequest({
            ...clone(request),
            answers: { employees: 10 }
        }),
        /forbidden raw-data keys/i
    );
    assert.throws(
        () => assertProtectedOperationalRequest({
            ...clone(request),
            usedForRecommendation: true
        }),
        /usedForRecommendation must be false/i
    );

    const cloudflareRequest = buildCloudflareWorkersAIOperationalRequest(request);
    assert.equal(cloudflareRequest.stream, false);
    assert.equal(cloudflareRequest.temperature, 0);
    assert.equal(cloudflareRequest.response_format.type, "json_schema");
    assert.equal(cloudflareRequest.messages.length, 2);
    assert.match(cloudflareRequest.messages[0].content, /operational HR guidance/i);
    assert.match(cloudflareRequest.messages[0].content, /cannot be changed/i);
    assert.doesNotMatch(JSON.stringify(cloudflareRequest), /private@example\.com/i);
    assert.doesNotMatch(JSON.stringify(cloudflareRequest), /companyName/i);

    const expectedResponse = createDeterministicOperationalExplanation({ request });
    const observed = [];
    const config = {
        providerName: "cloudflare-workers-ai",
        providerVersion: "test",
        model: CLOUDFLARE_WORKERS_AI_MODEL,
        accountId: "test-account",
        apiToken: "secret-token",
        freeOnly: true,
        timeoutMs: 5000,
        endpoint: "https://api.cloudflare.com/client/v4/accounts/test-account/ai/run/test-model"
    };
    const fetchImpl = async (url, options) => {
        observed.push({ url, options });
        return {
            ok: true,
            status: 200,
            async json() {
                return {
                    success: true,
                    result: {
                        response: JSON.stringify(expectedResponse)
                    }
                };
            }
        };
    };

    const provider = createCloudflareWorkersAIOperationalExplanationProvider({
        config,
        fetchImpl
    });
    const rawResponse = await provider.generate(request);
    assert.deepEqual(rawResponse, expectedResponse);
    assert.equal(observed.length, 1);
    assert.equal(observed[0].options.method, "POST");
    assert.equal(observed[0].options.headers.Authorization, "Bearer secret-token");
    assert.equal(JSON.parse(observed[0].options.body).response_format.type, "json_schema");

    const contract = await import("../growwithhr-rag/operational-explanation-contract.js");
    const governed = await runCloudflareWorkersAIOperationalExplanation({
        contract,
        request,
        config,
        fetchImpl
    });
    assert.equal(governed.provider.role, "explanation-only");
    assert.equal(governed.provider.model, CLOUDFLARE_WORKERS_AI_MODEL);
    assert.equal(governed.usedForRecommendation, false);
    assert.equal(governed.mayChangeRecommendation, false);
    assert.equal(governed.legalAdvice, false);
    assert.equal(governed.recommendationFingerprint, "c".repeat(64));

    assert.equal(
        packageJson.scripts["test:cloudflare-workers-ai-operational-provider"],
        "node tests/cloudflare-workers-ai-operational-provider-checks.mjs"
    );
    assert.match(
        packageJson.scripts["test:m2"],
        /test:cloudflare-workers-ai-operational-provider/
    );

    console.log("Cloudflare operational explanation provider checks passed.");
}

main().catch((error) => {
    console.error(error?.stack || error?.message || String(error));
    process.exitCode = 1;
});
