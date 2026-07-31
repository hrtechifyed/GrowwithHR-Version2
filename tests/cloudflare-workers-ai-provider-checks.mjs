import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const providerPath = path.join(ROOT, "growwithhr-rag", "cloudflare-workers-ai-provider.cjs");
const contractPath = path.join(ROOT, "growwithhr-rag", "legal-explanation-contract.js");
const schemaPath = path.join(ROOT, "schemas", "legal-explanation-response.schema.v1.json");
const readmePath = path.join(ROOT, "growwithhr-rag", "README.md");
const packagePath = path.join(ROOT, "package.json");

const REQUIRED_LIMITATIONS = [
    "This explanation does not change the deterministic decision.",
    "The rule and source interpretation remain subject to legal review.",
    "Assessment answers and evidence have not been independently verified."
];

function fixtureRequest() {
    return {
        contractVersion: "1.0.0",
        requestedAt: "2026-07-31T00:00:00.000Z",
        providerRole: "explanation-only",
        usedForDecision: false,
        mayChangeDecision: false,
        applicabilityAuthority: "none",
        legalAdvice: false,
        decisionReference: {
            productRuleId: "posh",
            ruleId: "rule.legal.posh.internal-committee-threshold",
            ruleVersion: "0.1.0",
            status: "specialist-review",
            reasonCode: "POSH_IC_THRESHOLD_REACHED_REVIEW_REQUIRED",
            reason: "The deterministic threshold rule requires specialist review.",
            legalReviewStatus: "needs-legal-review",
            decisionFingerprint: "c1ee3b36",
            sourceRegistryIds: ["posh-act-2013"],
            retrievedStatus: "specialist-review",
            retrievedReasonCode: "POSH_IC_THRESHOLD_REACHED_REVIEW_REQUIRED"
        },
        retrievalReference: {
            retrievalVersion: "0.1.0",
            retrievalFingerprint: "a1b2c3d4",
            retrievedChunks: [{
                chunkId: "posh-act-2013-section-4-001",
                registrySourceId: "posh-act-2013",
                sourceTitle: "The Sexual Harassment of Women at Workplace Act, 2013",
                sectionReference: "Section 4",
                pageStart: 4,
                pageEnd: 5,
                officialUrl: "https://www.indiacode.nic.in/handle/123456789/2104?locale=en",
                contentSha256: "8f74f3cbf09bc4dc721cc02cc3568cc346c0556c90382c6228c1c6c11cdd6fc0",
                text: "Every employer of a workplace shall constitute an Internal Committee by an order in writing."
            }]
        },
        instructions: [
            "Explain only the supplied deterministic decision.",
            "Use only the supplied governed citations for source-grounded statements."
        ],
        requiredLimitations: [...REQUIRED_LIMITATIONS]
    };
}

function validResponse(request = fixtureRequest()) {
    return {
        contractVersion: "1.0.0",
        decisionFingerprint: request.decisionReference.decisionFingerprint,
        decisionStatus: request.decisionReference.status,
        reasonCode: request.decisionReference.reasonCode,
        summary: "The deterministic POSH result requires specialist review, supported by the supplied official-source passage.",
        rationale: [{
            statement: "The retrieved Section 4 passage provides source context for the recorded Internal Committee threshold result.",
            citationChunkIds: ["posh-act-2013-section-4-001"]
        }],
        nextSteps: ["Obtain qualified legal review before relying on the result as a legal conclusion."],
        limitations: [...REQUIRED_LIMITATIONS],
        legalReviewStatus: "needs-legal-review",
        usedForDecision: false,
        mayChangeDecision: false,
        legalAdvice: false
    };
}

async function loadContract() {
    const directory = await mkdtemp(path.join(tmpdir(), "growwithhr-cloudflare-provider-"));
    const source = await readFile(contractPath, "utf8");
    const target = path.join(directory, "legal-explanation-contract.mjs");
    await writeFile(target, source, "utf8");
    return {
        directory,
        contract: await import(pathToFileURL(target).href)
    };
}

function responseEnvelope(value, status = 200) {
    return {
        ok: status >= 200 && status < 300,
        status,
        async json() {
            return value;
        }
    };
}

function structuredEnvelope(response) {
    return {
        success: true,
        result: { response },
        errors: [],
        messages: []
    };
}

async function main() {
    const provider = require(providerPath);
    const [schema, source, readme, packageJson] = await Promise.all([
        readFile(schemaPath, "utf8").then(JSON.parse),
        readFile(providerPath, "utf8"),
        readFile(readmePath, "utf8"),
        readFile(packagePath, "utf8").then(JSON.parse)
    ]);
    const loaded = await loadContract();

    try {
        assert.equal(provider.CLOUDFLARE_WORKERS_AI_PROVIDER_VERSION, "0.3.0");
        assert.equal(provider.CLOUDFLARE_WORKERS_AI_MODEL, "@cf/meta/llama-3.1-8b-instruct-fast");
        assert.equal(provider.CLOUDFLARE_WORKERS_AI_PROVIDER_NAME, "cloudflare-workers-ai");
        assert.equal(provider.MAX_OUTPUT_TOKENS, 1000);

        assert.throws(
            () => provider.cloudflareWorkersAIConfigFromEnvironment({}),
            (error) => error.code === "cloudflare-configuration-missing"
        );
        assert.throws(
            () => provider.cloudflareWorkersAIConfigFromEnvironment({
                CLOUDFLARE_ACCOUNT_ID: "account",
                CLOUDFLARE_WORKERS_AI_API_TOKEN: "token",
                CLOUDFLARE_WORKERS_AI_FREE_ONLY: "false"
            }),
            (error) => error.code === "cloudflare-configuration-missing"
        );

        const config = provider.cloudflareWorkersAIConfigFromEnvironment({
            CLOUDFLARE_ACCOUNT_ID: "account-123",
            CLOUDFLARE_WORKERS_AI_API_TOKEN: "secret-token",
            CLOUDFLARE_WORKERS_AI_FREE_ONLY: "true",
            CLOUDFLARE_WORKERS_AI_TIMEOUT_MS: "5000"
        });
        assert.equal(config.freeOnly, true);
        assert.equal(config.timeoutMs, 5000);
        assert.equal(config.endpoint, "https://api.cloudflare.com/client/v4/accounts/account-123/ai/run/@cf/meta/llama-3.1-8b-instruct-fast");

        const request = fixtureRequest();
        const outbound = provider.buildCloudflareWorkersAIRequest(request, schema);
        const promptPayload = JSON.parse(outbound.messages[1].content);
        const structuredSchema = outbound.response_format.json_schema;
        const serializedStructuredSchema = JSON.stringify(structuredSchema);
        assert.equal(outbound.stream, false);
        assert.equal(outbound.temperature, 0);
        assert.equal(outbound.max_tokens, 1000);
        assert.equal(outbound.response_format.type, "json_schema");
        assert.equal(structuredSchema.additionalProperties, false);
        assert.deepEqual(structuredSchema.properties.contractVersion.enum, ["1.0.0"]);
        assert.deepEqual(structuredSchema.properties.legalReviewStatus.enum, ["needs-legal-review"]);
        assert.deepEqual(structuredSchema.properties.usedForDecision.enum, [false]);
        assert.equal(serializedStructuredSchema.includes('"$schema"'), false);
        assert.equal(serializedStructuredSchema.includes('"$id"'), false);
        assert.equal(serializedStructuredSchema.includes('"const"'), false);
        assert.equal(serializedStructuredSchema.includes('"allOf"'), false);
        assert.equal(serializedStructuredSchema.includes('"contains"'), false);
        assert.equal(promptPayload.protectedRequest.decisionReference.status, "specialist-review");
        assert.equal(Object.hasOwn(promptPayload, "requiredResponseSchema"), false);
        assert.match(outbound.messages[0].content, /JSON schema/i);
        assert.equal(outbound.messages[1].content.includes("assessmentAnswers"), false);

        assert.throws(
            () => provider.buildCloudflareWorkersAIRequest({ ...request, answers: { employees: 10 } }, schema),
            (error) => error.code === "cloudflare-request-rejected"
        );

        let callCount = 0;
        let capturedUrl = "";
        let capturedInit = null;
        const fetchImpl = async (url, init) => {
            callCount += 1;
            capturedUrl = url;
            capturedInit = init;
            return responseEnvelope(structuredEnvelope(validResponse(request)));
        };

        const completed = await provider.runCloudflareWorkersAILegalExplanation({
            request,
            contract: loaded.contract,
            config,
            fetchImpl,
            responseSchema: schema
        });
        assert.equal(completed.explanationStatus, "completed");
        assert.equal(completed.provider.name, "cloudflare-workers-ai");
        assert.equal(completed.provider.model, "@cf/meta/llama-3.1-8b-instruct-fast");
        assert.equal(completed.usedForDecision, false);
        assert.equal(callCount, 1);
        assert.equal(capturedUrl, config.endpoint);
        assert.equal(capturedInit.headers.Authorization, "Bearer secret-token");
        assert.equal(capturedInit.body.includes("secret-token"), false);
        assert.equal(capturedInit.body.includes('"response_format"'), true);
        assert.equal(capturedInit.body.includes('"type":"json_schema"'), true);

        const structuredStringProvider = provider.createCloudflareWorkersAILegalExplanationProvider({
            config,
            responseSchema: schema,
            fetchImpl: async () => responseEnvelope(structuredEnvelope(JSON.stringify(validResponse(request))))
        });
        assert.deepEqual(await structuredStringProvider.generate(request), validResponse(request));

        let quotaCalls = 0;
        const quotaProvider = provider.createCloudflareWorkersAILegalExplanationProvider({
            config,
            responseSchema: schema,
            fetchImpl: async () => {
                quotaCalls += 1;
                return responseEnvelope({ success: false, errors: [{ message: "limit" }], messages: [] }, 429);
            }
        });
        await assert.rejects(
            quotaProvider.generate(request),
            (error) => error.code === "cloudflare-free-quota-or-rate-limit" && error.retryable === true
        );
        assert.equal(quotaCalls, 1, "The free-only adapter must not retry through another provider.");

        for (const response of [
            "not-json",
            `\u0060\u0060\u0060json\n${JSON.stringify(validResponse(request))}\n\u0060\u0060\u0060`,
            [validResponse(request)],
            null
        ]) {
            const invalidProvider = provider.createCloudflareWorkersAILegalExplanationProvider({
                config,
                responseSchema: schema,
                fetchImpl: async () => responseEnvelope(structuredEnvelope(response))
            });
            await assert.rejects(
                invalidProvider.generate(request),
                (error) => error.code === "cloudflare-invalid-structured-output"
            );
        }

        const overrideProvider = provider.createCloudflareWorkersAILegalExplanationProvider({
            config,
            responseSchema: schema,
            fetchImpl: async () => responseEnvelope(structuredEnvelope({
                ...validResponse(request),
                decisionStatus: "applicable"
            }))
        });
        await assert.rejects(
            loaded.contract.runLegalExplanationProvider({
                request,
                generate: overrideProvider.generate,
                providerName: overrideProvider.providerName,
                model: overrideProvider.model
            }),
            (error) => error.name === "LegalExplanationContractError"
        );

        for (const forbidden of [
            /createDeterministicLegalExplanation/,
            /@cf\/qwen/i,
            /choices\[0\]/,
            /openai/i,
            /anthropic/i,
            /gemini/i,
            /groq/i,
            /localStorage/,
            /sessionStorage/
        ]) {
            assert.equal(forbidden.test(source), false, `Forbidden provider marker: ${forbidden}`);
        }

        assert.match(readme, /@cf\/meta\/llama-3\.1-8b-instruct-fast/);
        assert.match(readme, /Cloudflare JSON Mode/i);
        assert.match(readme, /result\.response/);
        assert.equal(/@cf\/qwen/i.test(readme), false);
        assert.match(readme, /CLOUDFLARE_WORKERS_AI_FREE_ONLY=true/);
        assert.match(readme, /no second hosted provider/i);
        assert.match(readme, /fail closed/i);
        assert.equal(packageJson.scripts["test:cloudflare-workers-ai-provider"], "node tests/cloudflare-workers-ai-provider-checks.mjs");
        assert.match(packageJson.scripts["test:m2"], /test:cloudflare-workers-ai-provider/);

        console.log([
            "Cloudflare Workers AI provider checks passed.",
            `Provider: ${provider.CLOUDFLARE_WORKERS_AI_PROVIDER_NAME}`,
            `Model: ${provider.CLOUDFLARE_WORKERS_AI_MODEL}`,
            "Structured response envelope: result.response",
            "Free-only alternate-provider retries: 0"
        ].join("\n"));
    } finally {
        await rm(loaded.directory, { recursive: true, force: true });
    }
}

main().catch((error) => {
    console.error(error?.stack || error?.message || String(error));
    process.exitCode = 1;
});
