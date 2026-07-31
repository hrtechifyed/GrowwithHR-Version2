"use strict";

const RESPONSE_SCHEMA = require("../schemas/legal-explanation-response.schema.v1.json");

const CLOUDFLARE_WORKERS_AI_PROVIDER_VERSION = "0.2.0";
const CLOUDFLARE_WORKERS_AI_PROVIDER_NAME = "cloudflare-workers-ai";
const CLOUDFLARE_WORKERS_AI_MODEL = "@cf/qwen/qwen3-30b-a3b-fp8";
const CLOUDFLARE_API_ORIGIN = "https://api.cloudflare.com";
const DEFAULT_TIMEOUT_MS = 12000;
const MIN_TIMEOUT_MS = 1000;
const MAX_TIMEOUT_MS = 30000;
const MAX_OUTPUT_TOKENS = 400;
const MAX_REQUEST_CHARACTERS = 60000;
const FORBIDDEN_REQUEST_KEYS = new Set([
    "answers",
    "assessmentAnswers",
    "rawAnswers",
    "facts",
    "mappedFacts",
    "evidence"
]);

function cleanText(value) {
    return String(value ?? "").trim();
}

function object(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
}

function safeDetails(value) {
    const source = object(value);
    return {
        errors: Array.isArray(source.errors) ? source.errors : [],
        messages: Array.isArray(source.messages) ? source.messages : []
    };
}

class CloudflareWorkersAIProviderError extends Error {
    constructor(message, options = {}) {
        super(cleanText(message) || "Cloudflare Workers AI request failed.");
        this.name = "CloudflareWorkersAIProviderError";
        this.code = cleanText(options.code) || "cloudflare-provider-error";
        this.status = Number.isInteger(options.status) ? options.status : 0;
        this.retryable = options.retryable === true;
        this.details = deepFreeze(safeDetails(options.details));
    }
}

function timeoutValue(value) {
    const parsed = Number.parseInt(cleanText(value), 10);
    if (!Number.isInteger(parsed)) return DEFAULT_TIMEOUT_MS;
    return Math.min(MAX_TIMEOUT_MS, Math.max(MIN_TIMEOUT_MS, parsed));
}

function cloudflareWorkersAIConfigFromEnvironment(environment = process.env) {
    const env = object(environment);
    const accountId = cleanText(env.CLOUDFLARE_ACCOUNT_ID);
    const apiToken = cleanText(env.CLOUDFLARE_WORKERS_AI_API_TOKEN);
    const freeOnly = cleanText(env.CLOUDFLARE_WORKERS_AI_FREE_ONLY).toLowerCase() === "true";
    const missing = [];

    if (!accountId) missing.push("CLOUDFLARE_ACCOUNT_ID");
    if (!apiToken) missing.push("CLOUDFLARE_WORKERS_AI_API_TOKEN");
    if (!freeOnly) missing.push("CLOUDFLARE_WORKERS_AI_FREE_ONLY=true");

    if (missing.length) {
        throw new CloudflareWorkersAIProviderError(
            `Cloudflare Workers AI is not configured for free-only use: ${missing.join(", ")}.`,
            { code: "cloudflare-configuration-missing" }
        );
    }

    return deepFreeze({
        providerName: CLOUDFLARE_WORKERS_AI_PROVIDER_NAME,
        providerVersion: CLOUDFLARE_WORKERS_AI_PROVIDER_VERSION,
        model: CLOUDFLARE_WORKERS_AI_MODEL,
        accountId,
        apiToken,
        freeOnly: true,
        timeoutMs: timeoutValue(env.CLOUDFLARE_WORKERS_AI_TIMEOUT_MS),
        endpoint: `${CLOUDFLARE_API_ORIGIN}/client/v4/accounts/${encodeURIComponent(accountId)}/ai/run/${CLOUDFLARE_WORKERS_AI_MODEL}`
    });
}

function forbiddenRequestPaths(value, path = "") {
    const matches = [];
    if (!value || typeof value !== "object") return matches;
    if (Array.isArray(value)) {
        value.forEach((item, index) => matches.push(...forbiddenRequestPaths(item, `${path}/${index}`)));
        return matches;
    }
    Object.entries(value).forEach(([key, item]) => {
        const childPath = `${path}/${key}`;
        if (FORBIDDEN_REQUEST_KEYS.has(key)) matches.push(childPath);
        matches.push(...forbiddenRequestPaths(item, childPath));
    });
    return matches;
}

function assertProtectedExplanationRequest(value) {
    const request = object(value);
    const errors = [];

    if (request.providerRole !== "explanation-only") errors.push("providerRole must be explanation-only");
    if (request.usedForDecision !== false) errors.push("usedForDecision must be false");
    if (request.mayChangeDecision !== false) errors.push("mayChangeDecision must be false");
    if (request.applicabilityAuthority !== "none") errors.push("applicabilityAuthority must be none");
    if (request.legalAdvice !== false) errors.push("legalAdvice must be false");
    if (!cleanText(object(request.decisionReference).decisionFingerprint)) errors.push("decisionFingerprint is required");
    if (!cleanText(object(request.retrievalReference).retrievalFingerprint)) errors.push("retrievalFingerprint is required");

    const forbidden = forbiddenRequestPaths(request);
    if (forbidden.length) errors.push(`forbidden raw-data keys were supplied: ${forbidden.join(", ")}`);

    const serialized = JSON.stringify(request);
    if (!serialized || serialized.length > MAX_REQUEST_CHARACTERS) {
        errors.push(`the protected explanation request must be between 1 and ${MAX_REQUEST_CHARACTERS} characters`);
    }

    if (errors.length) {
        throw new CloudflareWorkersAIProviderError(
            `Cloudflare explanation request was rejected: ${errors.join("; ")}.`,
            { code: "cloudflare-request-rejected" }
        );
    }

    return request;
}

function cloudflareResponseSchema(value = RESPONSE_SCHEMA) {
    const schema = JSON.parse(JSON.stringify(object(value)));
    delete schema.$schema;
    delete schema.$id;
    delete schema.title;
    delete schema.description;
    return schema;
}

function buildCloudflareWorkersAIRequest(value, responseSchema = RESPONSE_SCHEMA) {
    const request = assertProtectedExplanationRequest(value);
    const systemMessage = [
        "You are an explanation-only component for GrowWithHR.",
        "The deterministic legal decision is already fixed and cannot be changed.",
        "Use only the supplied governed source chunks.",
        "Do not infer assessment facts, legal applicability, legal approval, certification, or evidence verification.",
        "Return exactly one valid JSON object and nothing else.",
        "Do not use markdown fences, commentary, preambles, or reasoning text.",
        "The JSON object must match the supplied response schema exactly."
    ].join(" ");
    const userMessage = {
        protectedRequest: request,
        requiredResponseSchema: cloudflareResponseSchema(responseSchema),
        outputRules: [
            "Copy protected status, reason code, fingerprints and boolean authority fields exactly.",
            "Use only citationChunkIds present in protectedRequest.retrievalReference.retrievedChunks.",
            "Include every string in protectedRequest.requiredLimitations exactly.",
            "Generate only summary, rationale statements and next steps; do not add properties."
        ]
    };

    return deepFreeze({
        messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: JSON.stringify(userMessage) }
        ],
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

function parseStrictJsonObject(candidate) {
    if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
        return candidate;
    }
    if (typeof candidate !== "string") return null;

    const serialized = candidate.trim();
    if (!serialized.startsWith("{") || !serialized.endsWith("}")) return null;

    try {
        const parsed = JSON.parse(serialized);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed)
            ? parsed
            : null;
    } catch (_error) {
        return null;
    }
}

function qwenMessageContent(result) {
    const choices = Array.isArray(result.choices) ? result.choices : [];
    const firstChoice = object(choices[0]);
    return object(firstChoice.message).content;
}

function extractCloudflareWorkersAIResponse(payload) {
    const envelope = object(payload);
    if (envelope.success !== true) {
        throw new CloudflareWorkersAIProviderError(
            "Cloudflare Workers AI returned an unsuccessful response.",
            { code: "cloudflare-unsuccessful-response", details: envelope }
        );
    }

    const result = object(envelope.result);
    const candidates = [
        qwenMessageContent(result),
        result.response
    ];

    for (const candidate of candidates) {
        const parsed = parseStrictJsonObject(candidate);
        if (parsed) return parsed;
    }

    throw new CloudflareWorkersAIProviderError(
        "Cloudflare Workers AI did not return one strict JSON object in the Qwen response.",
        { code: "cloudflare-invalid-structured-output", details: envelope }
    );
}

function createCloudflareWorkersAILegalExplanationProvider(options = {}) {
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
            "The Cloudflare adapter permits only the approved free-only Qwen configuration.",
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
                body: JSON.stringify(buildCloudflareWorkersAIRequest(request, responseSchema)),
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
                        : "Cloudflare Workers AI rejected the request.",
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
        providerVersion: CLOUDFLARE_WORKERS_AI_PROVIDER_VERSION,
        model: CLOUDFLARE_WORKERS_AI_MODEL,
        freeOnly: true,
        generate
    });
}

async function runCloudflareWorkersAILegalExplanation(options = {}) {
    const source = object(options);
    const contract = object(source.contract);
    if (typeof contract.runLegalExplanationProvider !== "function") {
        throw new CloudflareWorkersAIProviderError(
            "The governed legal explanation contract runner is required.",
            { code: "cloudflare-contract-runner-missing" }
        );
    }

    const provider = createCloudflareWorkersAILegalExplanationProvider(source);
    return contract.runLegalExplanationProvider({
        request: source.request,
        generate: provider.generate,
        providerName: provider.providerName,
        model: provider.model
    });
}

module.exports = Object.freeze({
    CLOUDFLARE_WORKERS_AI_PROVIDER_VERSION,
    CLOUDFLARE_WORKERS_AI_PROVIDER_NAME,
    CLOUDFLARE_WORKERS_AI_MODEL,
    CLOUDFLARE_API_ORIGIN,
    DEFAULT_TIMEOUT_MS,
    MAX_OUTPUT_TOKENS,
    CloudflareWorkersAIProviderError,
    cloudflareWorkersAIConfigFromEnvironment,
    buildCloudflareWorkersAIRequest,
    extractCloudflareWorkersAIResponse,
    createCloudflareWorkersAILegalExplanationProvider,
    runCloudflareWorkersAILegalExplanation
});
