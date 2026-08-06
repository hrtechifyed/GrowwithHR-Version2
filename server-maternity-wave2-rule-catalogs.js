"use strict";

/**
 * Source-scoped deterministic catalogs for the ten Maternity Benefit Wave 2
 * private-beta reviews. No rule certifies compliance or decides an individual
 * entitlement. Complete and reported-gap branches remain specialist-review;
 * absent required facts remain more-information-needed.
 */

const MODULE_VERSION = "1.0.0";
const MATERNITY_CATALOG_ID = "catalog.legal.maternity.v1";
const MATERNITY_WAVE2_CATALOG_PATH = "growwithhr-rag/data/maternity-wave2-source-chunks.v1.json";
const SOURCE_IDS = [
    "source.social-security.code-2020",
    "source.social-security.central-rules-2026",
    "source.social-security.commencement-2025",
    "source.social-security.corrigendum-2025"
];
const REGISTRY_IDS = [
    "social-security-code-2020",
    "social-security-central-rules-2026",
    "social-security-code-commencement-so-5319e-2025",
    "social-security-code-corrigendum-so-5936e-2025"
];

const object = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const array = (value) => Array.isArray(value) ? value : [];
const text = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const clone = (value) => JSON.parse(JSON.stringify(value));

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
}

function unique(values) {
    return [...new Set(array(values).map(text).filter(Boolean))];
}

function normalizedToken(value) {
    return text(value)
        .toLowerCase()
        .replace(/[_\s]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

function integer(value, min = 0, max = 10_000_000) {
    const parsed = typeof value === "number" && Number.isInteger(value)
        ? value
        : /^\d+$/.test(text(value))
            ? Number.parseInt(text(value), 10)
            : null;
    return Number.isSafeInteger(parsed) && parsed >= min && parsed <= max ? parsed : null;
}

function normalizeString(value, max = 160) {
    const normalized = text(value);
    return normalized ? normalized.slice(0, max) : null;
}

function normalizeToken(value, allowed = []) {
    const normalized = normalizedToken(value);
    if (!normalized) return null;
    return !allowed.length || allowed.includes(normalized) ? normalized : "unknown";
}

function normalizeStatus(value) {
    const normalized = normalizedToken(value);
    const aliases = {
        yes: "evidenced",
        true: "evidenced",
        implemented: "evidenced",
        present: "evidenced",
        complete: "evidenced",
        no: "not-evidenced",
        false: "not-evidenced",
        missing: "not-evidenced",
        absent: "not-evidenced",
        incomplete: "not-evidenced",
        na: "not-applicable",
        "n-a": "not-applicable"
    };
    const candidate = aliases[normalized] || normalized;
    return ["evidenced", "not-evidenced", "unknown", "not-applicable", "conflict"].includes(candidate)
        ? candidate
        : null;
}

function normalizeYesNo(value) {
    const normalized = normalizedToken(value);
    const aliases = {
        true: "yes",
        evidenced: "yes",
        implemented: "yes",
        false: "no",
        "not-evidenced": "no",
        missing: "no"
    };
    const candidate = aliases[normalized] || normalized;
    return ["yes", "no", "unknown", "conflict", "not-applicable"].includes(candidate)
        ? candidate
        : null;
}

function normalizeArray(value, maxItems = 40, maxLength = 120) {
    return unique(array(value).slice(0, maxItems).map((item) => text(item).slice(0, maxLength)));
}

const normalizers = Object.freeze({
    string: (value) => normalizeString(value),
    token: (value, field) => normalizeToken(value, field.allowed || []),
    status: (value) => normalizeStatus(value),
    yesNo: (value) => normalizeYesNo(value),
    integer: (value, field) => integer(value, field.min ?? 0, field.max ?? 10_000_000),
    array: (value) => normalizeArray(value)
});

function normalizeFeatureBody(config, value) {
    const raw = object(object(value).answers);
    const answers = {};
    config.fields.forEach((field) => {
        if (!Object.prototype.hasOwnProperty.call(raw, field.answerKey)) return;
        const normalize = normalizers[field.normalize || "token"];
        const normalized = normalize(raw[field.answerKey], field);
        if (normalized === null || normalized === undefined) return;
        if (Array.isArray(normalized) && normalized.length === 0) return;
        answers[field.answerKey] = normalized;
    });
    return deepFreeze({ answers });
}

const COMMON_LIMITATIONS = Object.freeze([
    "The catalog remains needs-legal-review and cannot certify legal compliance or an individual entitlement.",
    "Only controlled statuses, categories, bands and organisation facts are evaluated; evidence quality and implementation effectiveness are not verified.",
    "Retrieval and language-model output cannot create facts, decide entitlement or change the deterministic result.",
    "Names, contact details, medical narratives, certificates, claim documents, exact event dates, family details, bank details and ESI identifiers are prohibited."
]);

const F = (factId, answerKey, type, label) => ({
    factId,
    sourceAssessmentField: answerKey,
    type,
    label,
    required: true
});

const C = (factId, operator, value) =>
    value === undefined ? { factId, operator } : { factId, operator, value };

const SECTIONS = Object.freeze({
    establishment: [
        ["social-security-code-2020", "Section 1(4), Section 1(8), selected Section 2 definitions and First Schedule Chapter VI", "Establishment coverage, continuing application and defined terms"]
    ],
    eligibility: [
        ["social-security-code-2020", "Section 60(1)-(2)", "Workday condition and maternity-benefit eligibility review"],
        ["social-security-central-rules-2026", "Rule 35", "Prescribed claim and payment procedure supporting the review"]
    ],
    duration: [
        ["social-security-code-2020", "Section 60(3)", "Benefit-duration category branches"]
    ],
    adopting: [
        ["social-security-code-2020", "Section 60(4)-(5)", "Adopting or commissioning mother and work-from-home review"]
    ],
    specialLeave: [
        ["social-security-code-2020", "Section 65", "Miscarriage, medical termination, tubectomy and related-illness leave categories"],
        ["social-security-central-rules-2026", "Rule 35", "Supporting prescribed procedure"]
    ],
    nursing: [
        ["social-security-code-2020", "Section 66", "Nursing-break duty"],
        ["social-security-central-rules-2026", "Rule 36", "Duration and implementation controls"]
    ],
    creche: [
        ["social-security-code-2020", "Section 67", "Crèche threshold, visits and employer arrangement"],
        ["social-security-central-rules-2026", "Rule 37", "Facility, distance, staffing and allowance controls"]
    ],
    process: [
        ["social-security-code-2020", "Sections 62-64, 71-72 and 123", "Notice, payment, employee information, complaint and inspection controls"],
        ["social-security-central-rules-2026", "Rules 35, 39, 40 and 53; Forms X-XIV, XXII and XXIII", "Prescribed forms, register, retention and annual return controls"]
    ],
    protection: [
        ["social-security-code-2020", "Section 59 and Sections 68-70", "Protected work periods, dismissal, wage deduction, forfeiture and appeal controls"],
        ["social-security-central-rules-2026", "Rule 38", "Gross-misconduct and related procedure"]
    ],
    esi: [
        ["social-security-code-2020", "Section 41(7)(b) and Section 61", "ESI maternity-benefit overlap and transition route"]
    ]
});

function sourceSections(key) {
    return [
        ...SECTIONS[key].map(([registrySourceId, reference, purpose]) => ({
            registrySourceId,
            reference,
            purpose
        })),
        {
            registrySourceId: "social-security-code-commencement-so-5319e-2025",
            reference: "S.O. 5319(E)",
            purpose: "Commencement and transition context"
        },
        {
            registrySourceId: "social-security-code-corrigendum-so-5936e-2025",
            reference: "S.O. 5936(E)",
            purpose: "Corrigendum context"
        }
    ];
}

function recommendation(id, title, action) {
    return {
        id: `recommendation.legal.maternity.${id}`,
        title,
        action,
        timeline: "Before relying on this private-beta review as a legal or entitlement conclusion",
        limitations: clone(COMMON_LIMITATIONS)
    };
}

const configs = [
    {
        key: "establishment",
        featureId: "feature.legal.maternity.establishment-coverage",
        ruleId: "rule.legal.maternity.establishment-coverage",
        productRuleId: "maternity-establishment-coverage-review",
        title: "Maternity Benefit establishment coverage review",
        queryTerms: ["maternity benefit", "establishment coverage", "preceding twelve months", "appropriate government", "Chapter VI", "First Schedule"],
        fields: [
            { factId: "fact.footprint.country", answerKey: "maternityCountry", type: "controlled-text", label: "Country", normalize: "token", allowed: ["india"], complete: "india", gap: "unknown" },
            { factId: "fact.footprint.primary-state", answerKey: "maternityPrimaryState", type: "controlled-text", label: "Primary State", normalize: "string", complete: "Maharashtra" },
            { factId: "fact.footprint.operating-states", answerKey: "maternityOperatingStates", type: "controlled-text-array", label: "Operating States", normalize: "array", complete: ["Maharashtra"] },
            { factId: "fact.legal.appropriate-government-sphere", answerKey: "maternityAppropriateGovernmentSphere", type: "controlled-text", label: "Appropriate Government sphere", normalize: "token", allowed: ["central", "state", "union-territory", "unknown"], complete: "central" },
            { factId: "fact.establishment.type", answerKey: "maternityEstablishmentType", type: "controlled-text", label: "Establishment type", normalize: "string", complete: "commercial-establishment" },
            { factId: "fact.establishment.employee-count", answerKey: "maternityEmployeeCount", type: "non-negative-integer", label: "Employee count", normalize: "integer", min: 0, complete: 10 },
            { factId: "fact.establishment.employee-count-preceding-twelve-months-status", answerKey: "maternityPrecedingTwelveMonthsThresholdStatus", type: "control-status", label: "Preceding twelve-month threshold status", normalize: "token", allowed: ["met", "not-met", "unknown", "conflict"], complete: "met", gap: "conflict" },
            { factId: "fact.establishment.chapter-vi-covered-status", answerKey: "maternityChapterViCoveredStatus", type: "control-status", label: "Chapter VI prior coverage status", normalize: "yesNo", complete: "yes" }
        ],
        codes: ["MATERNITY_ESTABLISHMENT_COVERAGE_REVIEW_REQUIRED", "MATERNITY_APPROPRIATE_GOVERNMENT_REVIEW_REQUIRED", "MATERNITY_ESTABLISHMENT_COVERAGE_FACTS_MISSING"],
        limitations: ["The review does not resolve unsupported State rules or appropriate-Government questions.", "A company-wide employee count is not automatically a valid establishment count."]
    },
    {
        key: "eligibility",
        featureId: "feature.legal.maternity.employee-eligibility",
        ruleId: "rule.legal.maternity.employee-eligibility",
        productRuleId: "maternity-employee-eligibility-review",
        title: "Maternity Benefit employee eligibility review",
        queryTerms: ["workdays", "preceding twelve months", "eligibility", "Section 60", "Rule 35"],
        fields: [
            { factId: "fact.maternity.employee-workdays-preceding-twelve-months", answerKey: "maternityWorkdaysBandValue", type: "non-negative-integer", label: "Workdays in preceding twelve months", normalize: "integer", min: 0, max: 366, complete: 80, gap: 79, operator: "greater-than-or-equal", conditionValue: 80 },
            { factId: "fact.maternity.eligibility-event-category", answerKey: "maternityEligibilityEventCategory", type: "controlled-text", label: "Eligibility event category", normalize: "token", allowed: ["expected-delivery", "delivery", "miscarriage", "medical-termination", "adoption", "commissioning-mother", "tubectomy", "related-illness", "unknown"], complete: "delivery", gap: "unknown", operator: "not-equals", conditionValue: "unknown" }
        ],
        codes: ["MATERNITY_EMPLOYEE_ELIGIBILITY_REVIEW_REQUIRED", "MATERNITY_EMPLOYEE_ELIGIBILITY_SPECIALIST_REVIEW", "MATERNITY_EMPLOYEE_ELIGIBILITY_FACTS_MISSING"],
        limitations: ["This route does not collect attendance records, medical evidence or exact event dates.", "The result is not an individual entitlement determination."]
    },
    {
        key: "duration",
        featureId: "feature.legal.maternity.benefit-duration-review",
        ruleId: "rule.legal.maternity.benefit-duration-review",
        productRuleId: "maternity-benefit-duration-review",
        title: "Maternity Benefit duration-category review",
        queryTerms: ["benefit duration", "surviving children", "event category", "Section 60(3)"],
        fields: [
            { factId: "fact.maternity.surviving-child-count-band", answerKey: "maternitySurvivingChildCountBand", type: "controlled-text", label: "Surviving-child count band", normalize: "token", allowed: ["zero-or-one", "two-or-more", "unknown"], complete: "zero-or-one", gap: "unknown", operator: "not-equals", conditionValue: "unknown" },
            { factId: "fact.maternity.eligibility-event-category", answerKey: "maternityDurationEventCategory", type: "controlled-text", label: "Duration event category", normalize: "token", allowed: ["expected-delivery", "delivery", "adoption", "commissioning-mother", "unknown"], complete: "delivery", gap: "unknown", operator: "not-equals", conditionValue: "unknown" }
        ],
        codes: ["MATERNITY_BENEFIT_DURATION_REVIEW_REQUIRED", "MATERNITY_BENEFIT_DURATION_SPECIALIST_REVIEW", "MATERNITY_BENEFIT_CATEGORY_FACTS_MISSING"],
        limitations: ["Only a controlled child-count band is accepted; full family history and child details are prohibited.", "The product does not calculate payment or certify duration."]
    },
    {
        key: "adopting",
        featureId: "feature.legal.maternity.adopting-commissioning-mother-review",
        ruleId: "rule.legal.maternity.adopting-commissioning-mother-review",
        productRuleId: "maternity-adopting-commissioning-review",
        title: "Adopting and commissioning mother control review",
        queryTerms: ["adopting mother", "commissioning mother", "child age band", "work from home", "Section 60(4)", "Section 60(5)"],
        fields: [
            { factId: "fact.maternity.adopting-mother-status", answerKey: "maternityAdoptingMotherStatus", type: "control-status", label: "Adopting-mother category status", normalize: "yesNo", complete: "yes" },
            { factId: "fact.maternity.commissioning-mother-status", answerKey: "maternityCommissioningMotherStatus", type: "control-status", label: "Commissioning-mother category status", normalize: "yesNo", complete: "no" },
            { factId: "fact.maternity.child-age-eligibility-band", answerKey: "maternityChildAgeEligibilityBand", type: "controlled-text", label: "Child-age eligibility band", normalize: "token", allowed: ["below-three-months", "three-months-or-more", "unknown"], complete: "below-three-months", gap: "unknown" },
            { factId: "fact.maternity.work-from-home-feasibility-status", answerKey: "maternityWorkFromHomeFeasibilityStatus", type: "control-status", label: "Work-from-home feasibility status", normalize: "token", allowed: ["feasible", "not-feasible", "unknown", "not-assessed"], complete: "feasible" },
            { factId: "fact.maternity.work-from-home-agreement-status", answerKey: "maternityWorkFromHomeAgreementStatus", type: "control-status", label: "Work-from-home agreement status", normalize: "token", allowed: ["agreed", "not-agreed", "unknown", "not-applicable"], complete: "agreed" }
        ],
        codes: ["MATERNITY_ADOPTING_COMMISSIONING_REVIEW_REQUIRED", "MATERNITY_WORK_FROM_HOME_REVIEW_REQUIRED", "MATERNITY_CHILD_AGE_FACTS_MISSING"],
        limitations: ["Adoption documents, surrogacy records, child identity and exact age are prohibited.", "The review uses category statuses only and does not decide entitlement."]
    },
    {
        key: "specialLeave",
        featureId: "feature.legal.maternity.miscarriage-tubectomy-illness-leave-review",
        ruleId: "rule.legal.maternity.miscarriage-tubectomy-illness-leave-review",
        productRuleId: "maternity-special-leave-controls-review",
        title: "Maternity special-leave control review",
        queryTerms: ["miscarriage", "medical termination", "tubectomy", "related illness", "Section 65", "Rule 35"],
        fields: [
            { factId: "fact.maternity.miscarriage-leave-control-status", answerKey: "maternityMiscarriageLeaveControlStatus", type: "control-status", label: "Miscarriage leave control", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.medical-termination-leave-control-status", answerKey: "maternityMedicalTerminationLeaveControlStatus", type: "control-status", label: "Medical-termination leave control", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.tubectomy-leave-control-status", answerKey: "maternityTubectomyLeaveControlStatus", type: "control-status", label: "Tubectomy leave control", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.pregnancy-related-illness-leave-control-status", answerKey: "maternityRelatedIllnessLeaveControlStatus", type: "control-status", label: "Related-illness leave control", normalize: "status", complete: "evidenced", gap: "not-evidenced" }
        ],
        codes: ["MATERNITY_SPECIAL_LEAVE_CONTROLS_RECORDED_REVIEW_REQUIRED", "MATERNITY_SPECIAL_LEAVE_CONTROL_GAPS_REVIEW_REQUIRED", "MATERNITY_SPECIAL_LEAVE_FACTS_MISSING"],
        limitations: ["The route records organisation controls only; diagnoses, procedure details, certificates and medical narratives are prohibited."]
    },
    {
        key: "nursing",
        featureId: "feature.legal.maternity.nursing-break-review",
        ruleId: "rule.legal.maternity.nursing-break-review",
        productRuleId: "maternity-nursing-break-controls-review",
        title: "Maternity nursing-break control review",
        queryTerms: ["nursing break", "journey time", "dispute process", "Section 66", "Rule 36"],
        fields: [
            { factId: "fact.maternity.nursing-break-policy-status", answerKey: "maternityNursingBreakPolicyStatus", type: "control-status", label: "Nursing-break policy", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.nursing-break-duration-control-status", answerKey: "maternityNursingBreakDurationControlStatus", type: "control-status", label: "Nursing-break duration control", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.nursing-break-journey-time-status", answerKey: "maternityNursingBreakJourneyTimeStatus", type: "control-status", label: "Journey-time control", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.nursing-break-dispute-process-status", answerKey: "maternityNursingBreakDisputeProcessStatus", type: "control-status", label: "Dispute process", normalize: "status", complete: "evidenced", gap: "not-evidenced" }
        ],
        codes: ["MATERNITY_NURSING_BREAK_REVIEW_REQUIRED", "MATERNITY_NURSING_BREAK_DURATION_REVIEW_REQUIRED", "MATERNITY_NURSING_BREAK_FACTS_MISSING"],
        limitations: ["Nursing-break controls are reviewed separately from crèche controls and individual feeding or medical information is prohibited."]
    },
    {
        key: "creche",
        featureId: "feature.legal.maternity.creche-review",
        ruleId: "rule.legal.maternity.creche-review",
        productRuleId: "maternity-creche-controls-review",
        title: "Maternity crèche control review",
        queryTerms: ["creche", "fifty employees", "distance", "staffing", "allowance", "Section 67", "Rule 37"],
        fields: [
            { factId: "fact.establishment.employee-count", answerKey: "maternityCrecheEmployeeCount", type: "non-negative-integer", label: "Establishment employee count", normalize: "integer", min: 0, complete: 50, gap: 49, operator: "greater-than-or-equal", conditionValue: 50 },
            { factId: "fact.maternity.creche-threshold-status", answerKey: "maternityCrecheThresholdStatus", type: "control-status", label: "Crèche threshold assessment", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.creche-facility-status", answerKey: "maternityCrecheFacilityStatus", type: "control-status", label: "Crèche facility", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.creche-distance-status", answerKey: "maternityCrecheDistanceStatus", type: "control-status", label: "Distance control", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.creche-space-status", answerKey: "maternityCrecheSpaceStatus", type: "control-status", label: "Space control", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.creche-sanitation-status", answerKey: "maternityCrecheSanitationStatus", type: "control-status", label: "Sanitation control", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.creche-staffing-status", answerKey: "maternityCrecheStaffingStatus", type: "control-status", label: "Staffing control", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.creche-hours-status", answerKey: "maternityCrecheHoursStatus", type: "control-status", label: "Operating-hours control", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.creche-feeding-facility-status", answerKey: "maternityCrecheFeedingFacilityStatus", type: "control-status", label: "Feeding-facility control", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.creche-first-aid-status", answerKey: "maternityCrecheFirstAidStatus", type: "control-status", label: "First-aid control", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.creche-allowance-arrangement-status", answerKey: "maternityCrecheAllowanceArrangementStatus", type: "control-status", label: "Allowance arrangement", normalize: "status", complete: "evidenced", gap: "not-evidenced" },
            { factId: "fact.maternity.negotiating-union-or-council-status", answerKey: "maternityNegotiatingUnionOrCouncilStatus", type: "control-status", label: "Negotiating union or council status", normalize: "status", complete: "not-applicable" }
        ],
        codes: ["MATERNITY_CRECHE_FACILITY_REVIEW_REQUIRED", "MATERNITY_CRECHE_ALLOWANCE_REVIEW_REQUIRED", "MATERNITY_CRECHE_FACTS_MISSING"],
        limitations: ["A headcount at another establishment is not generalised to the reviewed establishment.", "Facility evidence is not inspected or certified."]
    },
    {
        key: "process",
        featureId: "feature.legal.maternity.notice-payment-records-review",
        ruleId: "rule.legal.maternity.notice-payment-records-review",
        productRuleId: "maternity-notice-payment-records-review",
        title: "Maternity notice, payment and records control review",
        queryTerms: ["notice", "nomination", "payment", "medical bonus", "register", "annual return", "Forms X XIV XXII XXIII"],
        fields: [
            { factId: "fact.maternity.notice-and-claim-process-status", answerKey: "maternityNoticeClaimProcessStatus", type: "control-status", label: "Notice and claim process", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.nomination-process-status", answerKey: "maternityNominationProcessStatus", type: "control-status", label: "Nomination process", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.advance-payment-control-status", answerKey: "maternityAdvancePaymentControlStatus", type: "control-status", label: "Advance payment control", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.post-delivery-payment-control-status", answerKey: "maternityPostDeliveryPaymentControlStatus", type: "control-status", label: "Post-delivery payment control", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.death-payment-control-status", answerKey: "maternityDeathPaymentControlStatus", type: "control-status", label: "Death-payment control", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.medical-bonus-control-status", answerKey: "maternityMedicalBonusControlStatus", type: "control-status", label: "Medical-bonus control", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.employee-information-process-status", answerKey: "maternityEmployeeInformationProcessStatus", type: "control-status", label: "Employee-information process", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.complaint-process-status", answerKey: "maternityComplaintProcessStatus", type: "control-status", label: "Complaint process", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.inspection-readiness-status", answerKey: "maternityInspectionReadinessStatus", type: "control-status", label: "Inspection readiness", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.prescribed-forms-availability-status", answerKey: "maternityPrescribedFormsAvailabilityStatus", type: "control-status", label: "Prescribed forms availability", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.statutory-abstract-display-status", answerKey: "maternityStatutoryAbstractDisplayStatus", type: "control-status", label: "Statutory abstract display", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.register-maintained-status", answerKey: "maternityRegisterMaintainedStatus", type: "control-status", label: "Register maintained", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.records-retention-status", answerKey: "maternityRecordsRetentionStatus", type: "control-status", label: "Records retention", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.annual-return-status", answerKey: "maternityAnnualReturnStatus", type: "control-status", label: "Annual return", normalize: "status", complete: "evidenced", gap: "not-evidenced" }
        ],
        codes: ["MATERNITY_NOTICE_PAYMENT_RECORDS_REVIEW_REQUIRED", "MATERNITY_PROCESS_CONTROL_GAPS_REVIEW_REQUIRED", "MATERNITY_PROCESS_FACTS_MISSING"],
        limitations: ["Completed forms, claim documents, bank details, registers and complaint records are prohibited from provider payloads.", "The route records only organisation-level control statuses."]
    },
    {
        key: "protection",
        featureId: "feature.legal.maternity.employment-protection-review",
        ruleId: "rule.legal.maternity.employment-protection-review",
        productRuleId: "maternity-employment-protection-review",
        title: "Maternity employment-protection control review",
        queryTerms: ["protected period", "arduous work", "dismissal", "gross misconduct", "appeal", "wage deduction", "forfeiture"],
        fields: [
            { factId: "fact.maternity.protected-period-control-status", answerKey: "maternityProtectedPeriodControlStatus", type: "control-status", label: "Protected-period control", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.arduous-work-request-process-status", answerKey: "maternityArduousWorkRequestProcessStatus", type: "control-status", label: "Arduous-work request process", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.employment-protection-policy-status", answerKey: "maternityEmploymentProtectionPolicyStatus", type: "control-status", label: "Employment-protection policy", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.dismissal-review-process-status", answerKey: "maternityDismissalReviewProcessStatus", type: "control-status", label: "Dismissal review process", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.gross-misconduct-process-status", answerKey: "maternityGrossMisconductProcessStatus", type: "control-status", label: "Gross-misconduct process", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.appeal-process-status", answerKey: "maternityAppealProcessStatus", type: "control-status", label: "Appeal process", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.wage-deduction-control-status", answerKey: "maternityWageDeductionControlStatus", type: "control-status", label: "Wage-deduction control", normalize: "status", complete: "evidenced" },
            { factId: "fact.maternity.forfeiture-control-status", answerKey: "maternityForfeitureControlStatus", type: "control-status", label: "Forfeiture control", normalize: "status", complete: "evidenced", gap: "not-evidenced" }
        ],
        codes: ["MATERNITY_EMPLOYMENT_PROTECTION_REVIEW_REQUIRED", "MATERNITY_DISMISSAL_PROCESS_REVIEW_REQUIRED", "MATERNITY_EMPLOYMENT_PROTECTION_FACTS_MISSING"],
        limitations: ["Individual disputes, allegations, disciplinary evidence and dismissal records are prohibited.", "The route reviews control presence only and does not determine a dispute outcome."]
    },
    {
        key: "esi",
        featureId: "feature.legal.maternity.esi-overlap-review",
        ruleId: "rule.legal.maternity.esi-overlap-review",
        productRuleId: "maternity-esi-overlap-review",
        title: "Maternity and ESI overlap control review",
        queryTerms: ["ESI overlap", "maternity benefit eligibility", "transition", "Section 41(7)(b)", "Section 61"],
        fields: [
            { factId: "fact.maternity.employee-esi-coverage-status", answerKey: "maternityEmployeeEsiCoverageStatus", type: "control-status", label: "Employee ESI coverage status", normalize: "yesNo", complete: "yes" },
            { factId: "fact.maternity.esi-maternity-benefit-eligibility-status", answerKey: "maternityEsiMaternityBenefitEligibilityStatus", type: "control-status", label: "ESI maternity-benefit eligibility status", normalize: "yesNo", complete: "no" },
            { factId: "fact.maternity.chapter-vi-existing-entitlement-status", answerKey: "maternityChapterViExistingEntitlementStatus", type: "control-status", label: "Existing Chapter VI entitlement status", normalize: "yesNo", complete: "yes" },
            { factId: "fact.maternity.esi-transition-date-status", answerKey: "maternityEsiTransitionDateStatus", type: "control-status", label: "ESI transition-date status", normalize: "status", complete: "evidenced", gap: "unknown" }
        ],
        codes: ["MATERNITY_ESI_OVERLAP_REVIEW_REQUIRED", "MATERNITY_ESI_TRANSITION_REVIEW_REQUIRED", "MATERNITY_ESI_ELIGIBILITY_FACTS_MISSING"],
        limitations: ["ESI registration alone is not treated as resolving the benefit route.", "ESI identifiers, claim documents, exact transition dates and medical details are prohibited."]
    }
];

function conditionFor(field) {
    if (field.operator) return C(field.factId, field.operator, field.conditionValue);
    return C(field.factId, "equals", field.complete);
}

function sources() {
    const officialUrl = "https://www.labour.gov.in/offerings/schemes-and-services/details/labour-codes-gzNzQzMtQWa";
    return [
        {
            id: "source.social-security.code-2020",
            registrySourceId: "social-security-code-2020",
            title: "Code on Social Security, 2020",
            publisher: "Government of India",
            url: officialUrl,
            jurisdiction: "India - Central",
            sourceType: "legislation",
            documentType: "official-legal-source",
            reviewedAt: "2026-08-06",
            reviewStatus: "needs-legal-review",
            fileName: "code-on-social-security-2020-official.pdf",
            drivePath: "GrowWithHR-RAG/01-source-documents/official/social-security/01-code/code-on-social-security-2020-official.pdf",
            notes: "Controlled official Code identity; interpretation remains subject to review.",
            official: true
        },
        {
            id: "source.social-security.central-rules-2026",
            registrySourceId: "social-security-central-rules-2026",
            title: "Social Security (Central) Rules, 2026",
            publisher: "Government of India",
            url: officialUrl,
            jurisdiction: "India - Central sphere",
            sourceType: "regulation",
            documentType: "official-legal-source",
            reviewedAt: "2026-08-06",
            reviewStatus: "needs-legal-review",
            fileName: "social-security-central-rules-2026-official.pdf",
            drivePath: "GrowWithHR-RAG/01-source-documents/official/social-security/02-rules/social-security-central-rules-2026-official.pdf",
            notes: "Central Rules do not resolve unsupported State appropriate-Government material.",
            official: true
        },
        {
            id: "source.social-security.commencement-2025",
            registrySourceId: "social-security-code-commencement-so-5319e-2025",
            title: "Code on Social Security commencement notification S.O. 5319(E), 2025",
            publisher: "Government of India",
            url: officialUrl,
            jurisdiction: "India - Central",
            sourceType: "legislation",
            documentType: "official-gazette-notification",
            reviewedAt: "2026-08-06",
            reviewStatus: "needs-legal-review",
            fileName: "social-security-code-commencement-so-5319e-2025.pdf",
            drivePath: "GrowWithHR-RAG/01-source-documents/official/social-security/03-notifications/social-security-code-commencement-so-5319e-2025.pdf",
            notes: "Controlled commencement source identity.",
            official: true
        },
        {
            id: "source.social-security.corrigendum-2025",
            registrySourceId: "social-security-code-corrigendum-so-5936e-2025",
            title: "Code on Social Security corrigendum S.O. 5936(E), 2025",
            publisher: "Government of India",
            url: officialUrl,
            jurisdiction: "India - Central",
            sourceType: "legislation",
            documentType: "official-gazette-corrigendum",
            reviewedAt: "2026-08-06",
            reviewStatus: "needs-legal-review",
            fileName: "social-security-code-corrigendum-so-5936e-2025.pdf",
            drivePath: "GrowWithHR-RAG/01-source-documents/official/social-security/03-notifications/social-security-code-corrigendum-so-5936e-2025.pdf",
            notes: "Controlled corrigendum source identity.",
            official: true
        }
    ];
}

function buildRule(config) {
    const complete = {};
    config.fields.forEach((field) => { complete[field.answerKey] = clone(field.complete); });
    const gapField = config.fields.find((field) => Object.prototype.hasOwnProperty.call(field, "gap")) || config.fields[config.fields.length - 1];
    const gap = { ...clone(complete), [gapField.answerKey]: clone(gapField.gap ?? "unknown") };
    const missing = clone(complete);
    delete missing[config.fields[0].answerKey];

    const scenarios = [
        {
            scenarioId: `maternity-${config.key}-complete`,
            description: `${config.title}: all declared controlled facts satisfy the configured private-beta boundary.`,
            answers: complete,
            expectedStatus: "specialist-review",
            expectedReasonCode: config.codes[0]
        },
        {
            scenarioId: `maternity-${config.key}-gap`,
            description: `${config.title}: one declared fact reports a gap, conflict or outside-boundary value.`,
            answers: gap,
            expectedStatus: "specialist-review",
            expectedReasonCode: config.codes[1]
        },
        {
            scenarioId: `maternity-${config.key}-missing`,
            description: `${config.title}: one required controlled fact is absent.`,
            answers: missing,
            expectedStatus: "more-information-needed",
            expectedReasonCode: config.codes[2]
        }
    ];

    return {
        id: config.ruleId,
        productRuleId: config.productRuleId,
        version: "1.0.0-private-beta",
        domain: "legal",
        title: config.title,
        description: `Deterministic source-scoped ${config.title.toLowerCase()}.`,
        jurisdiction: { country: "IN", level: "central-and-review-boundary", code: "IN" },
        sourceRecordId: "CENTRAL-SOCIAL-SECURITY-MATERNITY",
        legalReviewStatus: "needs-legal-review",
        requiredAssessmentFacts: config.fields.map((field) =>
            F(field.factId, field.answerKey, field.type, field.label)
        ),
        requiredFactMode: "all",
        requiredFactIds: config.fields.map((field) => field.factId),
        missingInformationHandling: {
            defaultStatus: "more-information-needed",
            reasonCode: config.codes[2],
            neverInferMissingFacts: true,
            allowRetrievalToFillFacts: false,
            allowLlmToFillFacts: false
        },
        match: {
            mode: "all",
            conditions: config.fields.map(conditionFor)
        },
        outcomes: {
            matched: {
                status: "specialist-review",
                reasonCode: config.codes[0],
                reason: "The supplied controlled facts satisfy the configured source-scoped private-beta test. Qualified review is still required before any legal or individual-entitlement conclusion.",
                recommendation: recommendation(
                    `${config.key}.confirm`,
                    `Obtain qualified review for ${config.title}`,
                    "Review the underlying controls, establishment boundary and restricted facts against the current controlled sources."
                )
            },
            notMatched: {
                status: "specialist-review",
                reasonCode: config.codes[1],
                reason: "One or more supplied controlled facts report a gap, conflict or value outside the configured private-beta boundary.",
                recommendation: recommendation(
                    `${config.key}.remediate`,
                    `Review the reported ${config.title} gap`,
                    "Resolve the identified control or boundary issue and retain evidence outside the retrieval and provider payload."
                )
            },
            missing: {
                status: "more-information-needed",
                reasonCode: config.codes[2],
                reason: "Every declared controlled fact is required before the deterministic private-beta review can run.",
                recommendation: recommendation(
                    `${config.key}.inputs`,
                    `Complete the ${config.title} inputs`,
                    "Provide the missing controlled field without names, narratives, exact dates, documents or identifiers."
                )
            }
        },
        permittedResultStatuses: ["specialist-review", "more-information-needed"],
        sourceIds: clone(SOURCE_IDS),
        officialSourceIds: clone(REGISTRY_IDS),
        sourceSections: sourceSections(config.key),
        effectiveDateMetadata: {
            effectiveFrom: "2025-11-21",
            effectiveTo: null,
            sourceRegistryId: "social-security-code-commencement-so-5319e-2025"
        },
        limitations: [...COMMON_LIMITATIONS, ...config.limitations],
        automatedBoundaryTestScenarios: scenarios
    };
}

function buildCatalog(config) {
    return deepFreeze({
        catalogVersion: "1.0.0-private-beta",
        title: `${config.title} catalog`,
        updatedAt: "2026-08-06",
        jurisdiction: "India",
        legalRuleCatalog: true,
        factMappingMode: "catalog-defined",
        outcomeModel: "control-review",
        legalReviewStatus: "needs-legal-review",
        applicabilityAuthority: "deterministic-only",
        retrievalRole: "source-retrieval-only",
        llmRole: "explanation-only",
        advisoryOnly: true,
        privateBetaOnly: true,
        stableReportMutation: false,
        sourceRegistry: {
            name: "Source Register",
            location: "GrowWithHR-RAG/00-project-control/Source Register.xlsx",
            reviewStatus: "needs-legal-review"
        },
        approval: { status: "draft", approvedBy: null, approvedAt: null },
        defaults: {
            ruleVersion: "1.0.0-private-beta",
            requiredFactMode: "all",
            evidence: {
                status: "not-verified",
                notes: "Assessment facts and control evidence have not been independently verified.",
                verificationProcessId: null,
                verifiedAt: null
            },
            limitations: clone(COMMON_LIMITATIONS)
        },
        sources: sources(),
        rules: [buildRule(config)]
    });
}

const MATERNITY_WAVE2_PROFILE_DEFINITIONS = deepFreeze(configs.map((config) => ({
    featureId: config.featureId,
    ruleId: config.ruleId,
    productRuleId: config.productRuleId,
    queryTerms: clone(config.queryTerms),
    maxChunks: config.key === "process" || config.key === "creche" ? 8 : 6
})));

const MATERNITY_WAVE2_FEATURE_IDS = Object.freeze(
    MATERNITY_WAVE2_PROFILE_DEFINITIONS.map((item) => item.featureId)
);

function createMaternityWave2FeatureSpecifications() {
    const specifications = {};
    configs.forEach((config) => {
        specifications[config.featureId] = deepFreeze({
            featureId: config.featureId,
            lawFamilyId: "maternity",
            normalizeBody: (value) => normalizeFeatureBody(config, value),
            ruleCatalog: buildCatalog(config),
            privateBetaMode: "statutory-catalogue"
        });
    });
    return deepFreeze(specifications);
}

module.exports = Object.freeze({
    MODULE_VERSION,
    MATERNITY_CATALOG_ID,
    MATERNITY_WAVE2_CATALOG_PATH,
    MATERNITY_WAVE2_PROFILE_DEFINITIONS,
    MATERNITY_WAVE2_FEATURE_IDS,
    createMaternityWave2FeatureSpecifications
});
