import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
    SHARED_LEGAL_EXPLANATION_ROUTE_PREFIX,
    createSharedLegalExplanationPayload,
    resolveSharedLegalExplanationEndpoint,
    validateSharedLegalExplanationResponse,
    requestSharedLegalExplanation
} from "../js/assessment-v3/legal-explanation-api-client.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const featureId = "feature.legal.posh.internal-committee-threshold";
const savedRecord = {
    answers: {
        employees: "10",
        primaryState: " Maharashtra ",
        locations: "1",
        companyName: "Private Company",
        email: "private@example.com"
    }
};

assert.deepEqual(
    createSharedLegalExplanationPayload(featureId, savedRecord),
    {
        answers: {
            employees: 10,
            primaryState: "Maharashtra",
            locations: 1
        }
    }
);
assert.throws(
    () => createSharedLegalExplanationPayload(featureId, { answers: {} }),
    /requires/
);
assert.throws(
    () => createSharedLegalExplanationPayload("feature.legal.unknown", savedRecord),
    /no browser adapter/
);

const localRuntime = {
    location: {
        origin: "http://localhost:3000",
        pathname: "/analyze-company-v3.html"
    }
};
assert.equal(
    resolveSharedLegalExplanationEndpoint(featureId, localRuntime),
    `${SHARED_LEGAL_EXPLANATION_ROUTE_PREFIX}${encodeURIComponent(featureId)}`
);
const pagesRuntime = {
    location: {
        origin: "https://hrtechifyed.github.io",
        pathname: "/GrowwithHR-Version2/analyze-company-v3.html"
    }
};
assert.equal(
    resolveSharedLegalExplanationEndpoint(featureId, pagesRuntime),
    `https://growwithhr.onrender.com${SHARED_LEGAL_EXPLANATION_ROUTE_PREFIX}${encodeURIComponent(featureId)}`
);

const decisionFingerprint = "decision-fingerprint";
const retrievalFingerprint = "retrieval-fingerprint";
const citation = {
    chunkId: "posh-act-2013-section-4-001",
    registrySourceId: "posh-act-2013",
    sourceTitle: "POSH Act",
    sectionReference: "Section 4",
    pageStart: 1,
    pageEnd: 1,
    officialUrl: "https://example.gov/source",
    contentSha256: "a".repeat(64)
};
const validResponse = {
    featureId,
    lawFamilyId: "posh",
    legalReviewStatus: "needs-legal-review",
    applicabilityAuthority: "deterministic-only",
    providerRole: "explanation-only",
    usedForDecision: false,
    mayChangeDecision: false,
    decision: {
        status: "specialist-review",
        reasonCode: "POSH_IC_THRESHOLD_REACHED_REVIEW_REQUIRED",
        legalReviewStatus: "needs-legal-review"
    },
    retrieval: {
        retrievalStatus: "completed",
        decisionFingerprint,
        retrievalFingerprint,
        citations: [citation]
    },
    explanation: {
        explanationStatus: "completed",
        decisionFingerprint,
        retrievalFingerprint,
        usedForDecision: false,
        mayChangeDecision: false,
        legalAdvice: false,
        response: {
            decisionStatus: "specialist-review",
            reasonCode: "POSH_IC_THRESHOLD_REACHED_REVIEW_REQUIRED",
            decisionFingerprint,
            summary: "A governed explanation.",
            rationale: [{
                statement: "The threshold path requires review.",
                citationChunkIds: [citation.chunkId]
            }],
            nextSteps: ["Review the official sources."],
            limitations: [
                "This explanation does not change the deterministic decision.",
                "The rule and source interpretation remain subject to legal review.",
                "Assessment answers and evidence have not been independently verified."
            ],
            usedForDecision: false,
            mayChangeDecision: false,
            legalAdvice: false
        }
    }
};
assert.equal(validateSharedLegalExplanationResponse(validResponse, featureId), validResponse);

const sent = [];
const runtime = {
    ...localRuntime,
    fetch: async (url, options) => {
        sent.push({ url, options });
        return {
            ok: true,
            async json() {
                return validResponse;
            }
        };
    },
    setTimeout,
    clearTimeout
};
const result = await requestSharedLegalExplanation({
    featureId,
    savedRecord,
    runtime,
    fetchImpl: runtime.fetch
});
assert.equal(result, validResponse);
assert.equal(sent.length, 1);
assert.equal(sent[0].url, `${SHARED_LEGAL_EXPLANATION_ROUTE_PREFIX}${encodeURIComponent(featureId)}`);
const sentPayload = JSON.parse(sent[0].options.body);
assert.deepEqual(Object.keys(sentPayload.answers).sort(), ["employees", "locations", "primaryState"]);
assert.equal(JSON.stringify(sentPayload).includes("Private Company"), false);
assert.equal(JSON.stringify(sentPayload).includes("private@example.com"), false);
assert.equal(sent[0].options.credentials, "omit");
assert.equal(sent[0].options.cache, "no-store");

const source = await readFile(
    path.join(ROOT, "js", "assessment-v3", "legal-explanation-api-client.js"),
    "utf8"
);
assert.equal(/localStorage|sessionStorage/.test(source), false);
assert.equal(/automatic/i.test(source), true);
assert.equal(/openai|anthropic|gemini|groq/i.test(source), false);

console.log(JSON.stringify({
    valid: true,
    featureId,
    payloadFields: Object.keys(sentPayload.answers).length,
    automaticRequests: 0,
    browserStorageWrites: 0
}, null, 2));
