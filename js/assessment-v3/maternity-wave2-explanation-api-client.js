/**
 * Privacy-safe browser client for the ten substantive Maternity Benefit Wave 2
 * profiles. Only declared controlled fields are copied. It makes no automatic
 * request and writes no browser storage.
 */

export const MATERNITY_WAVE2_CLIENT_VERSION = "1.0.0";
export const MATERNITY_WAVE2_ROUTE_PREFIX = "/api/legal-explanation/feature/";
export const MATERNITY_WAVE2_RENDER_ORIGIN = "https://growwithhr.onrender.com";
export const MATERNITY_WAVE2_TIMEOUT_MS = 30_000;

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
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "boolean") return value;
    return text(value).slice(0, maximumLength);
}

function stringList(value, maximumItems = 40, maximumLength = 120) {
    return [...new Set(array(value).slice(0, maximumItems)
        .map((item) => text(item).slice(0, maximumLength))
        .filter(Boolean))];
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
        const present = value !== null && value !== undefined && value !== "" &&
            (!Array.isArray(value) || value.length > 0);
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

const STATUS_FIELDS = Object.freeze([
    "maternityMiscarriageLeaveControlStatus",
    "maternityMedicalTerminationLeaveControlStatus",
    "maternityTubectomyLeaveControlStatus",
    "maternityRelatedIllnessLeaveControlStatus",
    "maternityNursingBreakPolicyStatus",
    "maternityNursingBreakDurationControlStatus",
    "maternityNursingBreakJourneyTimeStatus",
    "maternityNursingBreakDisputeProcessStatus",
    "maternityCrecheThresholdStatus",
    "maternityCrecheFacilityStatus",
    "maternityCrecheDistanceStatus",
    "maternityCrecheSpaceStatus",
    "maternityCrecheSanitationStatus",
    "maternityCrecheStaffingStatus",
    "maternityCrecheHoursStatus",
    "maternityCrecheFeedingFacilityStatus",
    "maternityCrecheFirstAidStatus",
    "maternityCrecheAllowanceArrangementStatus",
    "maternityNegotiatingUnionOrCouncilStatus",
    "maternityNoticeClaimProcessStatus",
    "maternityNominationProcessStatus",
    "maternityAdvancePaymentControlStatus",
    "maternityPostDeliveryPaymentControlStatus",
    "maternityDeathPaymentControlStatus",
    "maternityMedicalBonusControlStatus",
    "maternityEmployeeInformationProcessStatus",
    "maternityComplaintProcessStatus",
    "maternityInspectionReadinessStatus",
    "maternityPrescribedFormsAvailabilityStatus",
    "maternityStatutoryAbstractDisplayStatus",
    "maternityRegisterMaintainedStatus",
    "maternityRecordsRetentionStatus",
    "maternityAnnualReturnStatus",
    "maternityProtectedPeriodControlStatus",
    "maternityArduousWorkRequestProcessStatus",
    "maternityEmploymentProtectionPolicyStatus",
    "maternityDismissalReviewProcessStatus",
    "maternityGrossMisconductProcessStatus",
    "maternityAppealProcessStatus",
    "maternityWageDeductionControlStatus",
    "maternityForfeitureControlStatus"
]);

const fields = (keys) => keys.map((key) => [key, key.replace(/^maternity/, "").replace(/([A-Z])/g, " $1").trim().toLowerCase()]);

const ADAPTERS = Object.freeze({
    "feature.legal.maternity.establishment-coverage": Object.freeze({
        title: "Maternity Benefit establishment coverage review",
        fields: [
            ["maternityCountry", "country"],
            ["maternityPrimaryState", "primary State"],
            ["maternityOperatingStates", "operating States", stringList],
            ["maternityAppropriateGovernmentSphere", "appropriate Government sphere"],
            ["maternityEstablishmentType", "establishment type"],
            ["maternityEmployeeCount", "establishment employee count"],
            ["maternityPrecedingTwelveMonthsThresholdStatus", "preceding twelve-month threshold status"],
            ["maternityChapterViCoveredStatus", "Chapter VI prior coverage status"]
        ]
    }),
    "feature.legal.maternity.employee-eligibility": Object.freeze({
        title: "Maternity Benefit employee eligibility review",
        fields: [
            ["maternityWorkdaysBandValue", "workdays in the preceding twelve months"],
            ["maternityEligibilityEventCategory", "eligibility event category"]
        ]
    }),
    "feature.legal.maternity.benefit-duration-review": Object.freeze({
        title: "Maternity Benefit duration-category review",
        fields: [
            ["maternitySurvivingChildCountBand", "surviving-child count band"],
            ["maternityDurationEventCategory", "duration event category"]
        ]
    }),
    "feature.legal.maternity.adopting-commissioning-mother-review": Object.freeze({
        title: "Adopting and commissioning mother review",
        fields: [
            ["maternityAdoptingMotherStatus", "adopting-mother status"],
            ["maternityCommissioningMotherStatus", "commissioning-mother status"],
            ["maternityChildAgeEligibilityBand", "child-age eligibility band"],
            ["maternityWorkFromHomeFeasibilityStatus", "work-from-home feasibility status"],
            ["maternityWorkFromHomeAgreementStatus", "work-from-home agreement status"]
        ]
    }),
    "feature.legal.maternity.miscarriage-tubectomy-illness-leave-review": Object.freeze({
        title: "Maternity special-leave control review",
        fields: fields(STATUS_FIELDS.slice(0, 4))
    }),
    "feature.legal.maternity.nursing-break-review": Object.freeze({
        title: "Maternity nursing-break control review",
        fields: fields(STATUS_FIELDS.slice(4, 8))
    }),
    "feature.legal.maternity.creche-review": Object.freeze({
        title: "Maternity crèche control review",
        fields: [
            ["maternityCrecheEmployeeCount", "establishment employee count"],
            ...fields(STATUS_FIELDS.slice(8, 19))
        ]
    }),
    "feature.legal.maternity.notice-payment-records-review": Object.freeze({
        title: "Maternity notice, payment and records review",
        fields: fields(STATUS_FIELDS.slice(19, 33))
    }),
    "feature.legal.maternity.employment-protection-review": Object.freeze({
        title: "Maternity employment-protection review",
        fields: fields(STATUS_FIELDS.slice(33, 41))
    }),
    "feature.legal.maternity.esi-overlap-review": Object.freeze({
        title: "Maternity and ESI overlap review",
        fields: [
            ["maternityEmployeeEsiCoverageStatus", "employee ESI coverage status"],
            ["maternityEsiMaternityBenefitEligibilityStatus", "ESI maternity-benefit eligibility status"],
            ["maternityChapterViExistingEntitlementStatus", "existing Chapter VI entitlement status"],
            ["maternityEsiTransitionDateStatus", "ESI transition-date status"]
        ]
    })
});

export const MATERNITY_WAVE2_FEATURE_IDS = Object.freeze(Object.keys(ADAPTERS));

export function extractMaternityWave2Answers(featureId, savedRecord) {
    const adapter = ADAPTERS[text(featureId)];
    if (!adapter) throw new Error("The requested Maternity Wave 2 feature has no browser adapter.");
    const answers = object(unwrapSavedRecord(savedRecord).answers);
    return copyRequired(answers, adapter.fields);
}

export function createMaternityWave2Payload(featureId, savedRecord) {
    const extracted = extractMaternityWave2Answers(featureId, savedRecord);
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

export function resolveMaternityWave2Endpoint(featureId, runtime = globalThis, documentObject = runtime?.document) {
    const normalizedFeatureId = text(featureId);
    if (!ADAPTERS[normalizedFeatureId]) throw new Error("The requested Maternity Wave 2 feature has no browser adapter.");
    const explicit = text(documentObject?.body?.dataset?.legalExplanationEndpoint || runtime?.GROWWITHHR_LEGAL_EXPLANATION_ENDPOINT);
    const route = `${MATERNITY_WAVE2_ROUTE_PREFIX}${encodeURIComponent(normalizedFeatureId)}`;
    if (explicit) return explicit.endsWith("/") ? `${explicit}${encodeURIComponent(normalizedFeatureId)}` : explicit;
    return isGitHubPages(runtime) ? `${MATERNITY_WAVE2_RENDER_ORIGIN}${route}` : route;
}

function assertFalse(source, property) {
    if (object(source)[property] !== false) throw new Error(`The legal explanation response violated ${property}.`);
}

export function validateMaternityWave2Response(value, expectedFeatureId) {
    const response = object(value);
    const featureId = text(expectedFeatureId);
    if (!ADAPTERS[featureId]) throw new Error("The expected Maternity Wave 2 feature has no browser adapter.");
    const decision = object(response.decision);
    const retrieval = object(response.retrieval);
    const explanation = object(response.explanation);
    const generated = object(explanation.response);
    const citations = array(retrieval.citations);
    const citationIds = new Set(citations.map((item) => text(object(item).chunkId)).filter(Boolean));

    if (response.featureId !== featureId || response.lawFamilyId !== "maternity" ||
        response.legalReviewStatus !== "needs-legal-review" ||
        response.applicabilityAuthority !== "deterministic-only" || response.providerRole !== "explanation-only") {
        throw new Error("The Maternity Wave 2 response did not preserve its feature and authority boundaries.");
    }
    assertFalse(response, "usedForDecision");
    assertFalse(response, "mayChangeDecision");
    if (!["specialist-review", "more-information-needed"].includes(text(decision.status)) ||
        !text(decision.reasonCode) || decision.legalReviewStatus !== "needs-legal-review") {
        throw new Error("The deterministic Maternity Wave 2 decision is incomplete.");
    }
    if (retrieval.retrievalStatus !== "completed" || !text(retrieval.decisionFingerprint) ||
        !text(retrieval.retrievalFingerprint) || !citations.length || citationIds.size !== citations.length) {
        throw new Error("The governed Maternity Wave 2 retrieval trace is incomplete.");
    }
    if (explanation.explanationStatus !== "completed" ||
        explanation.decisionFingerprint !== retrieval.decisionFingerprint ||
        explanation.retrievalFingerprint !== retrieval.retrievalFingerprint ||
        generated.decisionStatus !== decision.status || generated.reasonCode !== decision.reasonCode ||
        generated.decisionFingerprint !== retrieval.decisionFingerprint || !text(generated.summary) ||
        !array(generated.rationale).length || !array(generated.nextSteps).length ||
        !REQUIRED_LIMITATIONS.every((item) => array(generated.limitations).includes(item))) {
        throw new Error("The generated Maternity Wave 2 explanation does not match the protected decision and retrieval trace.");
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
            throw new Error("The generated Maternity Wave 2 rationale contains an invalid citation.");
        }
    });
    return response;
}

export async function requestMaternityWave2Explanation(input = {}) {
    const request = object(input);
    const featureId = text(request.featureId);
    const runtime = request.runtime || globalThis;
    const fetchImpl = request.fetchImpl || runtime.fetch;
    if (typeof fetchImpl !== "function") throw new Error("Fetch is unavailable.");
    const endpoint = request.endpoint || resolveMaternityWave2Endpoint(featureId, runtime, request.documentObject);
    const payload = request.payload || createMaternityWave2Payload(featureId, request.savedRecord);
    const controller = new AbortController();
    const timeout = runtime.setTimeout(
        () => controller.abort(),
        Number.isInteger(request.timeoutMs) ? request.timeoutMs : MATERNITY_WAVE2_TIMEOUT_MS
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
        if (!response.ok) throw new Error(text(object(body).error?.message) || "The Maternity Wave 2 explanation request failed.");
        return validateMaternityWave2Response(body, featureId);
    } finally {
        runtime.clearTimeout(timeout);
    }
}

export default Object.freeze({
    version: MATERNITY_WAVE2_CLIENT_VERSION,
    featureIds: MATERNITY_WAVE2_FEATURE_IDS,
    extractMaternityWave2Answers,
    createMaternityWave2Payload,
    resolveMaternityWave2Endpoint,
    validateMaternityWave2Response,
    requestMaternityWave2Explanation
});
