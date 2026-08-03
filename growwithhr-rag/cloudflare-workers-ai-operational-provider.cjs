"use strict";

const RESPONSE_SCHEMA = require("../schemas/operational-explanation-response.schema.v1.json");
const {
    CLOUDFLARE_WORKERS_AI_PROVIDER_NAME,
    CLOUDFLARE_WORKERS_AI_MODEL,
    CloudflareWorkersAIProviderError,
    cloudflareWorkersAIConfigFromEnvironment,
    extractCloudflareWorkersAIResponse
} = require("./cloudflare-workers-ai-provider.cjs");

const OPERATIONAL_PROVIDER_VERSION = "1.0.0";
const MAX_OUTPUT_TOKENS = 1000;
const MAX_REQUEST_CHARACTERS = 60000;
const FORBIDDEN_REQUEST_KEYS = new Set([
    "answers",
    "assessmentAnswers",
    "rawAnswers",
    "facts",
    "mappedFacts",
    "evidence",
    "companyName",
    "email",
    "phone"
]);

const cleanText = (value) => String(value ?? "").trim();
const object = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
}

function timeoutValue(value) {
    const parsed = Number.parseInt(cleanText(value), 10);
    if (!Number.isInteger(parsed)) return 12000;
    return Math.min(30000, Math.max(1000, parsed));
}

function forbiddenRequestPaths(value, path = "") {
    const matches = [];
    if (!value || typeof value !== "object") return matches;
    if (Array.isArray(value)) {
        value.forEach((item, index) => {
            matches.push(...forbiddenRequestPaths(item, `${path}/${index}`));
        });
        return matches;
    }
    Object.entries(value).forEach(([key, item]) => {
        const childPath = `${path}/${key}`;
        if (FORBIDDEN_REQUEST_KEYS.has(key)) matches.push(childPath);
        matches.push(...forbiddenRequestPaths(item, childPath));
    });
    return matches;
}

function assertProtectedOperationalRequest(value) {
    const request = object(value);
    const errors = [];

    if (request.providerRole !== "explanation-only") errors.push("providerRole must be explanation-only");
    if (request.usedForRecommendation !== false) errors.push("usedForRecommendation must be false");
    if (request.mayChangeRecommendation !== false) errors.push("mayChangeRecommendation must be false");
    if (request.recommendationAuthority !== "none") errors.push("recommendationAuthority must be none");
    if (request.legalAdvice !== false) errors.push("legalAdvice must be false");

    const recommendation = object(request.recommendationReference);
    if (!cleanText(recommendation.recommendationFingerprint)) {
        errors.push("recommendationFingerprint is required");
    }
    if (!cleanText(recommendation.operationalStatus)) {
        errors.push("operationalStatus is required");
    }
    if (!cleanText(recommendation.reasonCode)) {
        errors.push("reasonCode is required");
    }

    const sources = Array.isArray(object(request.guidanceReference).sources)
        ? object(request.guidanceReference).sources
        : [];
    if (!sources.length) errors.push("at least one official guidance source is required");

    const forbidden = forbiddenRequestPaths(request);
    if (forbidden.length) {
        errors.push(`forbidden raw-data keys were supplied: ${forbidden.join(", ")}`);
    }

    const serialized = JSON.stringify(request);
    if (!serialized || serialized.length > MAX_REQUEST_CHARACTERS) {
        errors.push(`the protected operational request must be between 1 and ${MAX_REQUEST_CHARACTERS} characters`);
    }

    if (errors.length) {
        throw new CloudflareWorkersAIProviderError(
            `Cloudflare operational explanation request was rejected: ${errors.join("; ")}.`,
            { code: "cloudflare-operational-request-rejected" }
        );
    }

    return request;
}

function cloudflareSchemaNode(value) {
    if (Array.isArray(value)) return value.map(cloudflareSchemaNode);
    if (!value || typeof value !== "object") return value;

    const source = object(value);
    const schema = {};
    if (source.type !== undefined) schema.type = source.type;
    if (source.const !== undefined) schema.enum = [source.const];
    else if (Array.isArray(source.enum)) schema.enum = [...source.enum];
    if (source.additionalProperties !== undefined) schema.additionalProperties = source.additionalProperties;
    if (Array.isArray(source.required)) schema.required = [...source.required];
    if (source.properties && typeof source.properties === "object") {
        schema.properties = Object.fromEntries(
            Object.entries(source.properties).map(([key, item]) => [key, cloudflareSchemaNode(item)])
        );
    }
    if (source.items !== undefined) schema.items = cloudflareSchemaNode(source.items);
    if (Number.isInteger(source.minItems)) schema.minItems = source.minItems;
    if (Number.isInteger(source.maxItems)) schema.maxItems = source.maxItems;
    return schema;
}

function buildCloudflareWorkersAIOperationalRequest(value, responseSchema = RESPONSE_SCHEMA) {
    const request = assertProtectedOperationalRequest(value);
    const systemMessage = [
        "You are an explanation-only component for GrowWithHR operational HR guidance.",
        "The deterministic operational recommendation is already fixed and cannot be changed.",
        "Use only the supplied recommendation reference and official guidance references.",
        "Do not infer assessment facts, legal applicability, statutory duties, legal approval, certification or evidence verification.",
        "Return the JSON object required by the supplied JSON schema.",
        "Copy all protected fields exactly and do not add properties."
    ].join(" ");

    const userMessage = {
        protectedRequest: request,
        outputRules: [
            "Copy contractVersion, recommendationFingerprint, operationalStatus, reasonCode, usedForRecommendation, mayChangeRecommendation and legalAdvice exactly.",
            "Use only sourceIds present in protectedRequest.guidanceReference.sources.",
            "Include every string in protectedRequest.requiredLimitations exactly.",
            "Generate only summary, rationale statements and next steps; do not add properties.",
            "Use recommendation language, not legal applicability language."
        ]
    };

    return deepFreeze({
        messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: JSON.stringify(userMessage) }
        ],
        response_format: {
            type: "json_schema",
            json_schema: cloudflareSchemaNode(responseSchema)
        },
        stream: false,
        temperature: 0,
        top_p: 0.1,
        seed: 1,
        max_tokens: MAX_OUTPUT_TOKENS
    });
}

function cloudflareErrorCode(status) {
    if (status === 429) return "cloudflare-free-quota-or-rate-limit";
    if (status === 401 || status === 403) return "cloudflare-authentication-failed";
    if (status >= 500) return "cloudflare-service-unavailable";
    return "cloudflare-request-failed";
}

function createCloudflareWorkersAIOperationalExplanationProvider(options = {}) {
    const source = object(options);
    const config = source.config || cloudflareWorkersAIConfigFromEnvironment(source.environment);
    const fetchImpl = source.fetchImpl || globalThis.fetch;
    const responseSchema = source.responseSchema || RESPONSE_SCHEMA;

    if (typeof fetchImpl !== "function") {
        throw new CloudflareWorkersAIProviderError(
            "A server-side Fetch implementation is required.",
            { code: "cloudflare-fetch-unavailable" }
        );
    }
    if (config.freeOnly !== true || config.model !== CLOUDFLARE_WORKERS_AI_MODEL) {
        throw new CloudflareWorkersAIProviderError(
            "The operational adapter permits only the approved free-only Llama JSON Mode configuration.",
            { code: "cloudflare-free-only-configuration-required" }
        );
    }

    async function generate(request) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutValue(config.timeoutMs));

        try {
            const response = await fetchImpl(config.endpoint, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${config.apiToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(
                    buildCloudflareWorkersAIOperationalRequest(request, responseSchema)
                ),
                signal: controller.signal
            });

            let payload = null;
            try {
                payload = await response.json();
            } catch (_error) {
                throw new CloudflareWorkersAIProviderError(
                    "Cloudflare Workers AI returned a non-JSON response.",
                    {
                        code: "cloudflare-invalid-envelope",
                        status: response.status,
                        retryable: response.status >= 500
                    }
                );
            }

            if (!response.ok || object(payload).success !== true) {
                throw new CloudflareWorkersAIProviderError(
                    response.status === 429
                        ? "Cloudflare free allocation or rate limit is currently unavailable."
                        : "Cloudflare Workers AI rejected the operational explanation request.",
                    {
                        code: cloudflareErrorCode(response.status),
                        status: response.status,
                        retryable: response.status === 429 || response.status >= 500,
                        details: payload
                    }
                );
            }

            return extractCloudflareWorkersAIResponse(payload);
        } catch (error) {
            if (error instanceof CloudflareWorkersAIProviderError) throw error;
            if (error?.name === "AbortError") {
                throw new CloudflareWorkersAIProviderError(
                    "Cloudflare Workers AI request timed out.",
                    { code: "cloudflare-timeout", retryable: true }
                );
            }
            throw new CloudflareWorkersAIProviderError(
                "Cloudflare Workers AI could not be reached.",
                { code: "cloudflare-network-error", retryable: true }
            );
        } finally {
            clearTimeout(timeout);
        }
    }

    return deepFreeze({
        providerName: CLOUDFLARE_WORKERS_AI_PROVIDER_NAME,
        providerVersion: OPERATIONAL_PROVIDER_VERSION,
        model: CLOUDFLARE_WORKERS_AI_MODEL,
        freeOnly: true,
        generate
    });
}

async function runCloudflareWorkersAIOperationalExplanation(options = {}) {
    const source = object(options);
    const contract = object(source.contract);
    if (typeof contract.runOperationalExplanationProvider !== "function") {
        throw new CloudflareWorkersAIProviderError(
            "The governed operational explanation contract runner is required.",
            { code: "cloudflare-operational-contract-runner-missing" }
        );
    }

    const provider = createCloudflareWorkersAIOperationalExplanationProvider(source);
    return contract.runOperationalExplanationProvider({
        request: source.request,
        generate: provider.generate,
        providerName: provider.providerName,
        model: provider.model
    });
}

module.exports = Object.freeze({
    OPERATIONAL_PROVIDER_VERSION,
    CLOUDFLARE_WORKERS_AI_PROVIDER_NAME,
    CLOUDFLARE_WORKERS_AI_MODEL,
    CloudflareWorkersAIProviderError,
    assertProtectedOperationalRequest,
    buildCloudflareWorkersAIOperationalRequest,
    createCloudflareWorkersAIOperationalExplanationProvider,
    runCloudflareWorkersAIOperationalExplanation
});
