"use strict";

const {
    LegalExplanationOrchestrationError,
    legalExplanationOrchestratorConfig,
    createConcurrencyGate,
    orchestrationError,
    createGenericLegalExplanationOrchestrator
} = require("./server-legal-explanation-orchestrator.js");

const ROUTE = "/api/legal-explanation/posh";
const FEATURE_ID = "feature.legal.posh.internal-committee-threshold";
const ENDPOINT_VERSION = "0.1.0";
const MAX_REQUEST_BYTES = 16 * 1024;
const ALLOWED_BODY_KEYS = new Set(["answers"]);
const ALLOWED_ANSWER_KEYS = new Set(["employees", "primaryState", "locations"]);

const cleanText = (value) => String(value ?? "").trim();
const object = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};

class LegalExplanationEndpointError extends LegalExplanationOrchestrationError {
    constructor(message, options = {}) {
        super(message, options);
        this.name = "LegalExplanationEndpointError";
    }
}

function legalExplanationEndpointConfig(environment = process.env) {
    return legalExplanationOrchestratorConfig(environment);
}

function invalidInput(message) {
    return new LegalExplanationEndpointError(message, {
        code: "legal-explanation-invalid-input",
        status: 400,
        publicMessage: message
    });
}

function normalizeOptionalInteger(value, fieldName, minimum) {
    if (value === undefined || value === null || cleanText(value) === "") return undefined;
    const normalized = typeof value === "string" && /^\d+$/.test(value.trim())
        ? Number(value.trim())
        : value;
    if (!Number.isInteger(normalized) || normalized < minimum || normalized > 10000000) {
        throw invalidInput(`${fieldName} must be a whole number of at least ${minimum}.`);
    }
    return normalized;
}

function normalizeAnswers(value) {
    const answers = object(value);
    const unknown = Object.keys(answers).filter((key) => !ALLOWED_ANSWER_KEYS.has(key));
    if (unknown.length) throw invalidInput(`Unsupported assessment fields: ${unknown.join(", ")}.`);

    const employees = normalizeOptionalInteger(answers.employees, "employees", 0);
    const locations = normalizeOptionalInteger(answers.locations, "locations", 1);
    const primaryState = answers.primaryState === undefined || answers.primaryState === null
        ? undefined
        : cleanText(answers.primaryState);
    if (primaryState && primaryState.length > 120) {
        throw invalidInput("primaryState must contain no more than 120 characters.");
    }

    return Object.freeze({
        ...(employees === undefined ? {} : { employees }),
        ...(primaryState ? { primaryState } : {}),
        ...(locations === undefined ? {} : { locations })
    });
}

function normalizeBody(value) {
    const body = object(value);
    const unknown = Object.keys(body).filter((key) => !ALLOWED_BODY_KEYS.has(key));
    if (unknown.length) throw invalidInput(`Unsupported request properties: ${unknown.join(", ")}.`);
    if (!Object.hasOwn(body, "answers") || !body.answers || typeof body.answers !== "object" || Array.isArray(body.answers)) {
        throw invalidInput("A JSON answers object is required.");
    }
    return Object.freeze({ answers: normalizeAnswers(body.answers) });
}

function createLegalExplanationService(options = {}) {
    return createGenericLegalExplanationOrchestrator({
        ...options,
        featureId: FEATURE_ID,
        normalizeBody
    });
}

function readJsonBody(request) {
    return new Promise((resolve, reject) => {
        const contentType = cleanText(request.headers["content-type"]).toLowerCase();
        if (!contentType.startsWith("application/json")) {
            reject(new LegalExplanationEndpointError("Content-Type must be application/json.", {
                code: "legal-explanation-content-type-required",
                status: 415,
                publicMessage: "Content-Type must be application/json."
            }));
            return;
        }

        const declaredLength = Number.parseInt(cleanText(request.headers["content-length"]), 10);
        if (Number.isInteger(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
            reject(new LegalExplanationEndpointError("The request body is too large.", {
                code: "legal-explanation-request-too-large",
                status: 413,
                publicMessage: "The request body is too large."
            }));
            request.resume();
            return;
        }

        const chunks = [];
        let received = 0;
        let settled = false;
        const fail = (error) => {
            if (settled) return;
            settled = true;
            reject(error);
        };

        request.on("data", (chunk) => {
            if (settled) return;
            received += chunk.length;
            if (received > MAX_REQUEST_BYTES) {
                fail(new LegalExplanationEndpointError("The request body is too large.", {
                    code: "legal-explanation-request-too-large",
                    status: 413,
                    publicMessage: "The request body is too large."
                }));
                return;
            }
            chunks.push(chunk);
        });

        request.on("end", () => {
            if (settled) return;
            settled = true;
            try {
                resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
            } catch (_error) {
                reject(new LegalExplanationEndpointError("The request body must contain valid JSON.", {
                    code: "legal-explanation-invalid-json",
                    status: 400,
                    publicMessage: "The request body must contain valid JSON."
                }));
            }
        });

        request.on("error", () => fail(new LegalExplanationEndpointError("The request body could not be read.", {
            code: "legal-explanation-request-read-failed",
            status: 400,
            publicMessage: "The request body could not be read."
        })));
    });
}

function writeJson(response, status, payload) {
    response.statusCode = status;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.setHeader("Cache-Control", "no-store");
    response.end(JSON.stringify(payload));
}

function errorPayload(error) {
    const endpointError = orchestrationError(error);
    return {
        status: endpointError.status,
        payload: {
            error: {
                code: endpointError.code,
                message: endpointError.publicMessage,
                retryable: endpointError.retryable
            },
            legalReviewStatus: "needs-legal-review",
            usedForDecision: false
        }
    };
}

function createLegalExplanationRequestHandler(options = {}) {
    const service = options.service || createLegalExplanationService(options);
    return function handleLegalExplanationRequest(request, response) {
        if (cleanText(request.url).split("?")[0] !== ROUTE) return false;

        if (request.method !== "POST") {
            response.setHeader("Allow", "POST, OPTIONS");
            writeJson(response, 405, {
                error: {
                    code: "legal-explanation-method-not-allowed",
                    message: "Only POST is supported.",
                    retryable: false
                }
            });
            return true;
        }

        (async () => {
            try {
                const body = await readJsonBody(request);
                writeJson(response, 200, await service.explain(body));
            } catch (error) {
                const failure = errorPayload(error);
                writeJson(response, failure.status, failure.payload);
            }
        })();
        return true;
    };
}

let defaultHandler = null;
function handleLegalExplanationRequest(request, response) {
    if (!defaultHandler) defaultHandler = createLegalExplanationRequestHandler();
    return defaultHandler(request, response);
}

module.exports = Object.freeze({
    ROUTE,
    FEATURE_ID,
    ENDPOINT_VERSION,
    MAX_REQUEST_BYTES,
    LegalExplanationEndpointError,
    legalExplanationEndpointConfig,
    normalizeAnswers,
    normalizeBody,
    createConcurrencyGate,
    createLegalExplanationService,
    createLegalExplanationRequestHandler,
    handleLegalExplanationRequest
});