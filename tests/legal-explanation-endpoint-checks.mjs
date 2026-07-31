import assert from "node:assert/strict";
import http from "node:http";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const endpointPath = path.join(ROOT, "server-legal-explanation.js");
const endpoint = require(endpointPath);
const FIXED_DATE = new Date("2026-07-31T00:00:00.000Z");

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

async function validMockProvider({ contract, request }) {
    await new Promise((resolve) => setTimeout(resolve, 20));
    return contract.runLegalExplanationProvider({
        request,
        generate: async (protectedRequest) => contract.createDeterministicLegalExplanation({
            request: protectedRequest
        }),
        providerName: "mock-cloudflare-workers-ai",
        model: "@cf/qwen/qwen3-30b-a3b-fp8"
    });
}

async function listen(handler) {
    const server = http.createServer((request, response) => {
        if (handler(request, response)) return;
        response.statusCode = 404;
        response.end("Not found");
    });
    await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", resolve);
    });
    const address = server.address();
    return {
        server,
        baseUrl: `http://127.0.0.1:${address.port}`
    };
}

async function close(server) {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}

async function main() {
    assert.equal(endpoint.ROUTE, "/api/legal-explanation/posh");
    assert.equal(endpoint.ENDPOINT_VERSION, "0.1.0");
    assert.equal(endpoint.MAX_REQUEST_BYTES, 16 * 1024);

    assert.equal(endpoint.legalExplanationEndpointConfig({}).enabled, false);
    assert.equal(endpoint.legalExplanationEndpointConfig({
        LEGAL_EXPLANATION_ENDPOINT_ENABLED: "true"
    }).enabled, true);

    assert.deepEqual(
        endpoint.normalizeAnswers({ employees: "10", primaryState: " Maharashtra ", locations: "1" }),
        { employees: 10, primaryState: "Maharashtra", locations: 1 }
    );
    assert.deepEqual(endpoint.normalizeAnswers({}), {});
    assert.throws(
        () => endpoint.normalizeAnswers({ employees: 10, companyName: "Private Company" }),
        (error) => error.code === "legal-explanation-invalid-input"
    );
    assert.throws(
        () => endpoint.normalizeBody({ answers: {}, rawAnswers: {} }),
        (error) => error.code === "legal-explanation-invalid-input"
    );

    let providerCalls = 0;
    const protectedRequests = [];
    const service = endpoint.createLegalExplanationService({
        config: testConfig(),
        now: () => new Date(FIXED_DATE),
        providerRunner: async (input) => {
            providerCalls += 1;
            protectedRequests.push(input.request);
            return validMockProvider(input);
        }
    });

    const body = {
        answers: {
            employees: 10,
            primaryState: "Maharashtra",
            locations: 1
        }
    };

    const simultaneous = await Promise.all(
        Array.from({ length: 50 }, () => service.explain(body))
    );
    assert.equal(providerCalls, 1, "Fifty identical simultaneous outcomes must share one provider request.");
    assert.equal(simultaneous.filter((item) => item.delivery.cacheStatus === "miss").length, 1);
    assert.equal(simultaneous.filter((item) => item.delivery.cacheStatus === "shared").length, 49);
    simultaneous.forEach((item) => {
        assert.equal(item.decision.status, "specialist-review");
        assert.equal(item.decision.reasonCode, "POSH_IC_THRESHOLD_REACHED_REVIEW_REQUIRED");
        assert.equal(item.legalReviewStatus, "needs-legal-review");
        assert.equal(item.applicabilityAuthority, "deterministic-only");
        assert.equal(item.usedForDecision, false);
        assert.equal(item.mayChangeDecision, false);
        assert.equal(item.explanation.provider.model, "@cf/qwen/qwen3-30b-a3b-fp8");
        assert(item.retrieval.citations.length >= 1);
        assert.equal(Object.hasOwn(item.retrieval.citations[0], "text"), false);
        const keys = new Set(allObjectKeys(item));
        for (const forbidden of ["answers", "assessmentAnswers", "rawAnswers", "facts", "mappedFacts", "evidence"]) {
            assert.equal(keys.has(forbidden), false, `Endpoint response exposed forbidden key: ${forbidden}`);
        }
    });

    const cached = await service.explain(body);
    assert.equal(cached.delivery.cacheStatus, "hit");
    assert.equal(providerCalls, 1);

    const belowThreshold = await service.explain({
        answers: {
            employees: 9,
            primaryState: "Maharashtra",
            locations: 1
        }
    });
    assert.equal(belowThreshold.decision.status, "not-currently-applicable");
    assert.equal(belowThreshold.decision.reasonCode, "POSH_IC_THRESHOLD_NOT_MET");
    assert.equal(providerCalls, 2, "A distinct deterministic outcome may create one distinct provider request.");

    assert.equal(protectedRequests.length, 2);
    protectedRequests.forEach((request) => {
        assert.equal(request.providerRole, "explanation-only");
        assert.equal(request.usedForDecision, false);
        assert.equal(request.mayChangeDecision, false);
        assert.equal(request.applicabilityAuthority, "none");
        const keys = new Set(allObjectKeys(request));
        for (const forbidden of ["answers", "assessmentAnswers", "rawAnswers", "facts", "mappedFacts", "evidence"]) {
            assert.equal(keys.has(forbidden), false, `Provider request exposed forbidden key: ${forbidden}`);
        }
    });

    let quotaCalls = 0;
    const quotaService = endpoint.createLegalExplanationService({
        config: testConfig(),
        now: () => new Date(FIXED_DATE),
        providerRunner: async () => {
            quotaCalls += 1;
            const error = new Error("quota");
            error.code = "cloudflare-free-quota-or-rate-limit";
            error.retryable = true;
            throw error;
        }
    });

    for (let attempt = 0; attempt < 2; attempt += 1) {
        await assert.rejects(
            quotaService.explain(body),
            (error) => error.code === "cloudflare-free-quota-or-rate-limit" && error.status === 429
        );
    }
    assert.equal(quotaCalls, 1, "Failure backoff must avoid repeatedly consuming free-provider capacity.");

    const disabledService = endpoint.createLegalExplanationService({
        config: testConfig({ enabled: false }),
        now: () => new Date(FIXED_DATE),
        providerRunner: validMockProvider
    });
    await assert.rejects(
        disabledService.explain(body),
        (error) => error.code === "legal-explanation-endpoint-disabled" && error.status === 404
    );

    const handler = endpoint.createLegalExplanationRequestHandler({ service });
    const hosted = await listen(handler);
    try {
        const completed = await fetch(`${hosted.baseUrl}${endpoint.ROUTE}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        assert.equal(completed.status, 200);
        const completedBody = await completed.json();
        assert.equal(completedBody.decision.status, "specialist-review");
        assert.equal(completedBody.delivery.cacheStatus, "hit");
        assert.equal(completedBody.explanation.usedForDecision, false);

        const wrongMethod = await fetch(`${hosted.baseUrl}${endpoint.ROUTE}`);
        assert.equal(wrongMethod.status, 405);
        assert.match(wrongMethod.headers.get("allow") || "", /POST/);

        const wrongType = await fetch(`${hosted.baseUrl}${endpoint.ROUTE}`, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify(body)
        });
        assert.equal(wrongType.status, 415);

        const invalid = await fetch(`${hosted.baseUrl}${endpoint.ROUTE}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answers: { employees: 10, locations: 1, primaryState: "Maharashtra", email: "private@example.com" } })
        });
        assert.equal(invalid.status, 400);
        const invalidBody = await invalid.json();
        assert.equal(invalidBody.error.code, "legal-explanation-invalid-input");
        assert.equal(JSON.stringify(invalidBody).includes("private@example.com"), false);

        const otherRoute = await fetch(`${hosted.baseUrl}/api/not-this-route`);
        assert.equal(otherRoute.status, 404);
    } finally {
        await close(hosted.server);
    }

    const [source, serverEntry, readme, packageJson, assessmentPackage, ragPackage] = await Promise.all([
        readFile(endpointPath, "utf8"),
        readFile(path.join(ROOT, "server-entry.js"), "utf8"),
        readFile(path.join(ROOT, "growwithhr-rag", "README.md"), "utf8"),
        readFile(path.join(ROOT, "package.json"), "utf8").then(JSON.parse),
        readFile(path.join(ROOT, "js", "assessment-v3", "package.json"), "utf8").then(JSON.parse),
        readFile(path.join(ROOT, "growwithhr-rag", "package.json"), "utf8").then(JSON.parse)
    ]);

    assert.equal(assessmentPackage.type, "module");
    assert.equal(ragPackage.type, "module");
    assert.match(serverEntry, /handleLegalExplanationRequest/);
    assert.match(serverEntry, /server-legal-explanation/);
    assert.match(source, /decisionFingerprint.*retrievalFingerprint/s);
    assert.match(source, /cacheStatus/);
    assert.match(source, /failureBackoffMs/);
    assert.equal(/createDeterministicLegalExplanation/.test(source), false, "The live endpoint must not invoke the deterministic fallback.");
    assert.equal(/openai|anthropic|gemini|groq/i.test(source), false, "The endpoint must not contain a second hosted provider.");
    assert.match(readme, /\/api\/legal-explanation\/posh/);
    assert.match(readme, /50 simultaneous/i);
    assert.match(readme, /no second hosted provider/i);
    assert.equal(packageJson.scripts["test:legal-explanation-endpoint"], "node tests/legal-explanation-endpoint-checks.mjs");
    assert.match(packageJson.scripts["test:m2"], /test:legal-explanation-endpoint/);

    console.log([
        "Legal explanation endpoint checks passed.",
        "Fifty identical simultaneous requests: one provider request.",
        "Raw assessment fields sent to provider: 0.",
        "Second hosted providers: 0."
    ].join("\n"));
}

main().catch((error) => {
    console.error(error?.stack || error?.message || String(error));
    process.exitCode = 1;
});
