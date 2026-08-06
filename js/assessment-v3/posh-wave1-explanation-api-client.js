/**
 * Privacy-safe browser client for the six substantive POSH Wave 1 profiles.
 *
 * It extracts only feature-declared control fields, makes no automatic request,
 * writes no browser storage and never accepts complaint narratives, names,
 * allegations, evidence bodies, findings or case-level statistics.
 */

export const POSH_WAVE1_CLIENT_VERSION = "1.0.0";
export const POSH_WAVE1_ROUTE_PREFIX = "/api/legal-explanation/feature/";
export const POSH_WAVE1_RENDER_ORIGIN = "https://growwithhr.onrender.com";
export const POSH_WAVE1_TIMEOUT_MS = 30_000;

const GITHUB_PAGES_ORIGIN = "https://hrtechifyed.github.io";
const GITHUB_PAGES_PROJECT_PATH = "/GrowwithHR-Version2/";
const REQUIRED_LIMITATIONS = Object.freeze([
    "This explanation does not change the deterministic decision.",
    "The rule and source interpretation remain subject to legal review.",
    "Assessment answers and evidence have not been independently verified."
]);

const object = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const array = (value) => Array.isArray(value) ? value : [];
const text = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

function unwrapSavedRecord(value) {
    const source = object(value);
    const wrapped = object(source.data);
    return Object.keys(wrapped).length ? wrapped : source;
}

function scalar(value, maximumLength = 160) {
    if (["boolean", "number"].includes(typeof value)) return value;
    return text(value).slice(0, maximumLength);
}

function stringList(value, maximumItems = 100, maximumLength = 160) {
    return [...new Set(array(value).slice(0, maximumItems)
        .map((item) => typeof item === "string"
            ? text(item).slice(0, maximumLength)
            : text(object(item).reference || object(item).ref || object(item).id).slice(0, maximumLength))
        .filter(Boolean))];
}

function role(value) {
    if (typeof value === "string") return scalar(value, 120);
    const source = object(value);
    return scalar(source.role || source.function || source.reference || source.ref, 120);
}

function eligibility(value) {
    if (typeof value === "boolean") return value;
    const source = object(value);
    return Object.freeze({
        eligible: typeof source.eligible === "boolean" ? source.eligible : undefined,
        womanEmployee: typeof source.womanEmployee === "boolean" ? source.womanEmployee : undefined,
        seniorLevel: typeof source.seniorLevel === "boolean" ? source.seniorLevel : undefined,
        approvedAlternate: typeof source.approvedAlternate === "boolean" ? source.approvedAlternate : undefined,
        notEmployee: typeof source.notEmployee === "boolean" ? source.notEmployee : undefined,
        ngoAssociation: typeof source.ngoAssociation === "boolean" ? source.ngoAssociation : undefined,
        familiarWithIssues: typeof source.familiarWithIssues === "boolean" ? source.familiarWithIssues : undefined
    });
}

function locationControls(value) {
    return array(value).slice(0, 100).map((item) => {
        const source = object(item);
        return Object.freeze({
            locationRef: scalar(source.locationRef || source.location || source.ref || source.id, 120),
            status: scalar(source.status ?? source.value ?? source.present, 40)
        });
    }).filter((item) => item.locationRef && item.status !== "");
}

function unitCounts(value) {
    return array(value).slice(0, 100).map((item) => {
        const source = object(item);
        return Object.freeze({
            unitRef: scalar(source.unitRef || source.unit || source.ref || source.id, 120),
            workerCount: scalar(source.workerCount ?? source.workers ?? source.count, 20)
        });
    }).filter((item) => item.unitRef && item.workerCount !== "");
}

function unitControls(value) {
    return array(value).slice(0, 100).map((item) => {
        const source = object(item);
        return Object.freeze({
            unitRef: scalar(source.unitRef || source.unit || source.ref || source.id, 120),
            status: scalar(source.status ?? source.value ?? source.present, 40)
        });
    }).filter((item) => item.unitRef && item.status !== "");
}

function copyRequired(answers, definitions) {
    const output = {};
    const missingFields = [];
    definitions.forEach(([key, label, transform = scalar]) => {
        if (!hasOwn(answers, key)) {
            missingFields.push(label);
            return;
        }
        const value = transform(answers[key]);
        const present = value !== null && value !== undefined && value !== "" && (!Array.isArray(value) || value.length > 0);
        if (!present) {
            missingFields.push(label);
            return;
        }
        output[key] = value;
    });
    return Object.freeze({
        ready: missingFields.length === 0,
        answers: missingFields.length ? null : Object.freeze(output),
        missingFields: Object.freeze(missingFields)
    });
}

const ADAPTERS = Object.freeze({
    "feature.legal.posh.policy-review": Object.freeze({
        title: "POSH policy review",
        fields: [
            ["poshPolicyExists", "policy existence"],
            ["poshPolicyIssueDate", "policy issue date"],
            ["poshPolicyOwnerRole", "policy owner role", role],
            ["poshPolicyCoverage", "policy coverage categories", stringList],
            ["poshPolicyDisseminationEvidence", "dissemination evidence references", stringList],
            ["poshPolicyReviewEvidence", "review evidence references", stringList]
        ]
    }),
    "feature.legal.posh.awareness-training-review": Object.freeze({
        title: "POSH awareness and training review",
        fields: [
            ["poshEmployeeAwarenessCadence", "employee-awareness cadence"],
            ["poshEmployeeAwarenessEvidence", "employee-awareness evidence references", stringList],
            ["poshIcOrientationEvidence", "Internal Committee orientation evidence references", stringList],
            ["poshCapacityBuildingEvidence", "capacity-building evidence references", stringList]
        ]
    }),
    "feature.legal.posh.notice-display-review": Object.freeze({
        title: "POSH notice and display review",
        fields: [
            ["poshNoticeLocationsReviewed", "reviewed location references", stringList],
            ["poshPenalConsequencesDisplayByLocation", "penal-consequences display controls", locationControls],
            ["poshIcOrderDisplayByLocation", "Internal Committee order display controls", locationControls],
            ["poshMemberContactDisplayByLocation", "committee contact-display controls", locationControls]
        ]
    }),
    "feature.legal.posh.complaint-mechanism-records-review": Object.freeze({
        title: "POSH complaint mechanism and records review",
        fields: [
            ["poshComplaintRouteDefined", "complaint route control"],
            ["poshComplaintProcessOwnerRole", "process owner role", role],
            ["poshComplaintTimelineControls", "timeline-control status"],
            ["poshComplaintConfidentialityControls", "confidentiality-control status"],
            ["poshComplaintRetentionControls", "retention-control status"],
            ["poshComplaintAgainstEmployerRoute", "complaint-against-employer route status"]
        ]
    }),
    "feature.legal.posh.internal-committee-composition-unit-review": Object.freeze({
        title: "POSH Internal Committee composition and unit review",
        fields: [
            ["poshIcPresidingOfficerEligibility", "Presiding Officer eligibility", eligibility],
            ["poshIcEmployeeMemberCount", "employee-member count"],
            ["poshIcExternalMemberEligibility", "external-member eligibility", eligibility],
            ["poshIcWomenMemberRatio", "women-member ratio"],
            ["poshIcNominationDates", "nomination dates", stringList],
            ["poshIcUnitCount", "office or administrative-unit count"],
            ["poshWorkersByUnit", "worker counts by unit", unitCounts],
            ["poshCommitteesByUnit", "committee controls by unit", unitControls]
        ]
    }),
    "feature.legal.posh.annual-reporting-review": Object.freeze({
        title: "POSH annual reporting review",
        fields: [
            ["poshAnnualReportYear", "reporting year"],
            ["poshAnnualReportPrepared", "annual-report preparation control"],
            ["poshAnnualReportSubmittedToEmployer", "employer submission control"],
            ["poshAnnualReportSubmittedToDistrictOfficer", "District Officer submission control"],
            ["poshAnnualReportAggregateStatsPresent", "aggregate-statistics presence control"],
            ["poshAnnualReportWorkshopCountPresent", "workshop-count presence control"],
            ["poshAnnualReportActionStatusPresent", "action-status presence control"],
            ["poshEmployerAnnualDisclosureRecorded", "employer annual disclosure control"]
        ]
    })
});

export const POSH_WAVE1_FEATURE_IDS = Object.freeze(Object.keys(ADAPTERS));

export function extractPoshWave1Answers(featureId, savedRecord) {
    const adapter = ADAPTERS[text(featureId)];
    if (!adapter) throw new Error("The requested POSH Wave 1 feature has no browser adapter.");
    const answers = object(unwrapSavedRecord(savedRecord).answers);
    return copyRequired(answers, adapter.fields);
}

export function createPoshWave1Payload(featureId, savedRecord) {
    const extracted = extractPoshWave1Answers(featureId, savedRecord);
    if (!extracted.ready) {
        throw new Error(`${ADAPTERS[featureId].title} requires ${extracted.missingFields.join(", ")}.`);
    }
    return Object.freeze({ answers: extracted.answers });
}

function isGitHubPages(runtime) {
    const location = runtime?.location;
    return Boolean(location && location.origin === GITHUB_PAGES_ORIGIN &&
        (location.pathname === "/GrowwithHR-Version2" || location.pathname.startsWith(GITHUB_PAGES_PROJECT_PATH)));
}

export function resolvePoshWave1Endpoint(featureId, runtime = globalThis, documentObject = runtime?.document) {
    const normalizedFeatureId = text(featureId);
    if (!ADAPTERS[normalizedFeatureId]) throw new Error("The requested POSH Wave 1 feature has no browser adapter.");
    const explicit = text(documentObject?.body?.dataset?.legalExplanationEndpoint || runtime?.GROWWITHHR_LEGAL_EXPLANATION_ENDPOINT);
    const route = `${POSH_WAVE1_ROUTE_PREFIX}${encodeURIComponent(normalizedFeatureId)}`;
    if (explicit) return explicit.endsWith("/") ? `${explicit}${encodeURIComponent(normalizedFeatureId)}` : explicit;
    return isGitHubPages(runtime) ? `${POSH_WAVE1_RENDER_ORIGIN}${route}` : route;
}

function assertFalse(source, property) {
    if (object(source)[property] !== false) throw new Error(`The legal explanation response violated ${property}.`);
}

export function validatePoshWave1Response(value, expectedFeatureId) {
    const response = object(value);
    const featureId = text(expectedFeatureId);
    if (!ADAPTERS[featureId]) throw new Error("The expected POSH Wave 1 feature has no browser adapter.");
    const decision = object(response.decision);
    const retrieval = object(response.retrieval);
    const explanation = object(response.explanation);
    const generated = object(explanation.response);
    const citations = array(retrieval.citations);
    const citationIds = new Set(citations.map((item) => text(object(item).chunkId)).filter(Boolean));

    if (response.featureId !== featureId || response.lawFamilyId !== "posh" ||
        response.legalReviewStatus !== "needs-legal-review" ||
        response.applicabilityAuthority !== "deterministic-only" || response.providerRole !== "explanation-only") {
        throw new Error("The POSH Wave 1 response did not preserve its feature and authority boundaries.");
    }
    assertFalse(response, "usedForDecision");
    assertFalse(response, "mayChangeDecision");
    if (!["specialist-review", "more-information-needed"].includes(text(decision.status)) ||
        !text(decision.reasonCode) || decision.legalReviewStatus !== "needs-legal-review") {
        throw new Error("The deterministic POSH Wave 1 decision is incomplete.");
    }
    if (retrieval.retrievalStatus !== "completed" || !text(retrieval.decisionFingerprint) ||
        !text(retrieval.retrievalFingerprint) || !citations.length || citationIds.size !== citations.length) {
        throw new Error("The governed POSH Wave 1 retrieval trace is incomplete.");
    }
    if (explanation.explanationStatus !== "completed" ||
        explanation.decisionFingerprint !== retrieval.decisionFingerprint ||
        explanation.retrievalFingerprint !== retrieval.retrievalFingerprint ||
        generated.decisionStatus !== decision.status || generated.reasonCode !== decision.reasonCode ||
        generated.decisionFingerprint !== retrieval.decisionFingerprint || !text(generated.summary) ||
        !array(generated.rationale).length || !array(generated.nextSteps).length ||
        !REQUIRED_LIMITATIONS.every((item) => array(generated.limitations).includes(item))) {
        throw new Error("The generated POSH Wave 1 explanation does not match the protected decision and retrieval trace.");
    }
    assertFalse(explanation, "usedForDecision");
    assertFalse(explanation, "mayChangeDecision");
    assertFalse(explanation, "legalAdvice");
    assertFalse(generated, "usedForDecision");
    assertFalse(generated, "mayChangeDecision");
    assertFalse(generated, "legalAdvice");
    array(generated.rationale).forEach((item) => {
        const record = object(item);
        const ids = array(record.citationChunkIds).map(text).filter(Boolean);
        if (!text(record.statement) || !ids.length || !ids.every((id) => citationIds.has(id))) {
            throw new Error("The generated POSH Wave 1 rationale contains an invalid citation.");
        }
    });
    return response;
}

export async function requestPoshWave1Explanation(input = {}) {
    const request = object(input);
    const featureId = text(request.featureId);
    const runtime = request.runtime || globalThis;
    const fetchImpl = request.fetchImpl || runtime.fetch;
    if (typeof fetchImpl !== "function") throw new Error("Fetch is unavailable.");
    const endpoint = request.endpoint || resolvePoshWave1Endpoint(featureId, runtime, request.documentObject);
    const payload = request.payload || createPoshWave1Payload(featureId, request.savedRecord);
    const controller = new AbortController();
    const timeout = runtime.setTimeout(
        () => controller.abort(),
        Number.isInteger(request.timeoutMs) ? request.timeoutMs : POSH_WAVE1_TIMEOUT_MS
    );
    try {
        const response = await fetchImpl(endpoint, {
            method: "POST",
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            credentials: "omit",
            cache: "no-store",
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        const body = await response.json();
        if (!response.ok) throw new Error(text(object(body).error?.message) || "The POSH Wave 1 explanation request failed.");
        return validatePoshWave1Response(body, featureId);
    } finally {
        runtime.clearTimeout(timeout);
    }
}

export default Object.freeze({
    version: POSH_WAVE1_CLIENT_VERSION,
    featureIds: POSH_WAVE1_FEATURE_IDS,
    extractPoshWave1Answers,
    createPoshWave1Payload,
    resolvePoshWave1Endpoint,
    validatePoshWave1Response,
    requestPoshWave1Explanation
});
