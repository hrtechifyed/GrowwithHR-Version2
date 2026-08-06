"use strict";

/**
 * Source-scoped deterministic catalogues for five EPF Wave 3A operational
 * private-beta reviews. These reviews do not calculate payroll, decide an
 * employee's membership or certify compliance. Complete and reported-gap
 * branches remain specialist-review; absent required facts remain
 * more-information-needed.
 */

const MODULE_VERSION = "1.0.0";
const EPF_WAVE3A_CATALOG_ID = "catalog.legal.epf-wave3a.v1";
const EPF_WAVE3A_CATALOG_PATH = "growwithhr-rag/data/epf-wave3a-source-chunks.v1.json";
const SOURCE_IDS = Object.freeze([
    "source.social-security.code-2020",
    "source.epf.scheme-2026",
    "source.social-security.commencement-2025",
    "source.social-security.corrigendum-2025"
]);
const REGISTRY_IDS = Object.freeze([
    "social-security-code-2020",
    "employees-provident-funds-scheme-2026",
    "social-security-code-commencement-so-5319e-2025",
    "social-security-code-corrigendum-so-5936e-2025"
]);

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
        incomplete: "not-evidenced"
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
    return unique(array(value).slice(0, maxItems).map((item) => {
        if (typeof item === "string") return text(item).slice(0, maxLength);
        const source = object(item);
        return text(source.reference || source.ref || source.id).slice(0, maxLength);
    }));
}

const normalizers = Object.freeze({
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
    "The catalogue remains needs-legal-review and cannot certify EPF compliance or decide an individual employee's membership.",
    "Only organisation-level statuses, counts and evidence references are evaluated; payroll calculations and evidence quality are not verified.",
    "Retrieval and language-model output cannot create facts, calculate contributions or change the deterministic result.",
    "Names, UANs, payroll rows, employee-level wages, contribution histories, ECR bodies, bank details, claims and evidence bodies are prohibited.",
    "Contribution rates, wage ceilings, exemptions, international-worker treatment, EPS routing and EDLI rates remain outside Wave 3A."
]);

const SECTIONS = Object.freeze({
    establishment: [
        ["social-security-code-2020", "Sections 1–3, selected definitions and First Schedule Chapter III", "Establishment coverage, continuing application and defined terms"],
        ["employees-provident-funds-scheme-2026", "Notification, paragraph 1 and definitions", "Scheme commencement and establishment terminology"]
    ],
    member: [
        ["social-security-code-2020", "Section 2 selected definitions", "Employee, employer and establishment definitions"],
        ["employees-provident-funds-scheme-2026", "Definitions and paragraphs 9–11", "Membership, excluded-employee and classification controls"]
    ],
    monthly: [
        ["social-security-code-2020", "Sections 16–17", "Contribution and contractor framework"],
        ["employees-provident-funds-scheme-2026", "Paragraphs 18–30", "Monthly deduction, employer share, remittance, filing and reconciliation controls"]
    ],
    contractor: [
        ["social-security-code-2020", "Section 17", "Principal-employer and contractor contribution framework"],
        ["employees-provident-funds-scheme-2026", "Paragraphs 20 and 27", "Contractor data and principal-employer control context"]
    ],
    records: [
        ["social-security-code-2020", "Sections 122–123", "Records, returns, inspection and information framework"],
        ["employees-provident-funds-scheme-2026", "Paragraphs 24–30", "Authorisation, returns, member administration and record controls"]
    ]
});

function sourceSections(key) {
    return [
        ...SECTIONS[key].map(([registrySourceId, reference, purpose]) => ({ registrySourceId, reference, purpose })),
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
        id: `recommendation.legal.epf-wave3a.${id}`,
        title,
        action,
        timeline: "Before relying on this private-beta review as an EPF compliance conclusion",
        limitations: clone(COMMON_LIMITATIONS)
    };
}

const configs = Object.freeze([
    {
        key: "establishment",
        featureId: "feature.legal.epf.establishment-coverage",
        ruleId: "rule.legal.epf.establishment-coverage",
        productRuleId: "epf-establishment-coverage-operational-review",
        title: "EPF establishment coverage operational review",
        queryTerms: ["epf establishment coverage", "employee threshold", "prior coverage", "branches", "continuing application"],
        fields: [
            { factId: "fact.epf.establishment.india-operations", answerKey: "epfIndiaOperations", type: "control-status", label: "India operations status", normalize: "yesNo", complete: "yes", gap: "no", operator: "equals" },
            { factId: "fact.epf.establishment.total-employee-count", answerKey: "epfTotalEmployeeCount", type: "non-negative-integer", label: "Total employee count", normalize: "integer", min: 0, complete: 20, gap: 10, operator: "greater-than-or-equal", conditionValue: 20 },
            { factId: "fact.epf.establishment.all-branches-included", answerKey: "epfAllBranchesIncluded", type: "control-status", label: "All branches included", normalize: "yesNo", complete: "yes", gap: "no", operator: "equals" },
            { factId: "fact.epf.establishment.prior-coverage-known", answerKey: "epfPriorCoverageKnown", type: "control-status", label: "Prior coverage status known", normalize: "yesNo", complete: "yes", gap: "unknown", operator: "equals" },
            { factId: "fact.epf.establishment.prior-epf-code-present", answerKey: "epfPriorCodePresent", type: "control-status", label: "Prior EPF code status", normalize: "yesNo", complete: "no", gap: "unknown", operator: "not-equals", conditionValue: "unknown" }
        ],
        codes: ["EPF_ESTABLISHMENT_COVERAGE_REVIEW_REQUIRED", "EPF_ESTABLISHMENT_SCOPE_GAP_REVIEW_REQUIRED", "EPF_ESTABLISHMENT_FACTS_MISSING"],
        limitations: ["A current headcount below the threshold does not resolve prior coverage or continuing application.", "Co-operative and government-controlled establishment questions remain specialist-review only."]
    },
    {
        key: "member",
        featureId: "feature.legal.epf.member-inclusion",
        ruleId: "rule.legal.epf.member-inclusion",
        productRuleId: "epf-member-inclusion-operational-review",
        title: "EPF member-inclusion operational review",
        queryTerms: ["epf membership", "excluded employee", "apprentice", "contract employee", "prior member"],
        fields: [
            { factId: "fact.epf.membership.population-reconciled", answerKey: "epfPopulationReconciled", type: "control-status", label: "Direct and contract population reconciled", normalize: "status", complete: "evidenced", gap: "not-evidenced" },
            { factId: "fact.epf.membership.apprentice-classification-reviewed", answerKey: "epfApprenticeClassificationReviewed", type: "control-status", label: "Apprentice and trainee classification reviewed", normalize: "status", complete: "evidenced", gap: "not-evidenced" },
            { factId: "fact.epf.membership.prior-member-routing-reviewed", answerKey: "epfPriorMemberRoutingReviewed", type: "control-status", label: "Prior-member routing reviewed", normalize: "status", complete: "evidenced", gap: "not-evidenced" },
            { factId: "fact.epf.membership.excluded-employee-review-recorded", answerKey: "epfExcludedEmployeeReviewRecorded", type: "control-status", label: "Excluded-employee review recorded", normalize: "status", complete: "evidenced", gap: "not-evidenced" },
            { factId: "fact.epf.membership.international-worker-escalation-reviewed", answerKey: "epfInternationalWorkerEscalationReviewed", type: "control-status", label: "International-worker escalation reviewed", normalize: "status", complete: "evidenced", gap: "unknown" }
        ],
        codes: ["EPF_MEMBER_INCLUSION_REVIEW_REQUIRED", "EPF_MEMBER_INCLUSION_CONTROL_GAPS_REVIEW_REQUIRED", "EPF_MEMBER_FACTS_MISSING"],
        limitations: ["The route reviews organisation classification controls and does not determine an individual employee's membership.", "International-worker legal treatment remains outside Wave 3A and must be escalated."]
    },
    {
        key: "monthly",
        featureId: "feature.legal.epf.monthly-contribution-control",
        ruleId: "rule.legal.epf.monthly-contribution-control",
        productRuleId: "epf-monthly-contribution-operational-review",
        title: "EPF monthly contribution operational-control review",
        queryTerms: ["epf monthly contribution", "employee deduction", "employer share", "ecr filing", "due date", "reconciliation"],
        fields: [
            { factId: "fact.epf.rate.official-basis-recorded", answerKey: "epfRateBasisRecorded", type: "control-status", label: "Official rate basis recorded", normalize: "status", complete: "evidenced", gap: "not-evidenced" },
            { factId: "fact.epf.control.employee-deduction", answerKey: "epfEmployeeDeductionControl", type: "control-status", label: "Employee-deduction control", normalize: "status", complete: "evidenced", gap: "not-evidenced" },
            { factId: "fact.epf.control.employer-share", answerKey: "epfEmployerShareControl", type: "control-status", label: "Employer-share control", normalize: "status", complete: "evidenced", gap: "not-evidenced" },
            { factId: "fact.epf.control.ecr-filing", answerKey: "epfEcrFilingControl", type: "control-status", label: "ECR filing control", normalize: "status", complete: "evidenced", gap: "not-evidenced" },
            { factId: "fact.epf.control.payment-due-date", answerKey: "epfPaymentDueDateControl", type: "control-status", label: "Payment due-date control", normalize: "status", complete: "evidenced", gap: "not-evidenced" },
            { factId: "fact.epf.control.payroll-reconciliation", answerKey: "epfPayrollReconciliationControl", type: "control-status", label: "Payroll reconciliation control", normalize: "status", complete: "evidenced", gap: "not-evidenced" },
            { factId: "fact.epf.control.exception-management", answerKey: "epfExceptionManagementControl", type: "control-status", label: "Exception-management control", normalize: "status", complete: "evidenced", gap: "not-evidenced" }
        ],
        codes: ["EPF_MONTHLY_CONTROL_EVIDENCED_REVIEW_REQUIRED", "EPF_MONTHLY_CONTROL_GAPS_REVIEW_REQUIRED", "EPF_MONTHLY_CONTROL_FACTS_MISSING"],
        limitations: ["The review records whether a controlled rate source exists but does not select or calculate the 10% or 12% branch.", "No payroll row, wage amount, contribution amount or ECR body is accepted."]
    },
    {
        key: "contractor",
        featureId: "feature.legal.epf.contractor-control",
        ruleId: "rule.legal.epf.contractor-control",
        productRuleId: "epf-contractor-operational-review",
        title: "EPF contractor operational-control review",
        queryTerms: ["epf contractor", "principal employer", "contract labour", "monthly data", "reconciliation"],
        fields: [
            { factId: "fact.epf.contractor.count", answerKey: "epfContractorCount", type: "non-negative-integer", label: "Contractor count", normalize: "integer", min: 0, complete: 1, gap: 1, operator: "greater-than-or-equal", conditionValue: 0 },
            { factId: "fact.epf.contractor.declaration-control", answerKey: "epfContractorDeclarationControl", type: "control-status", label: "Contractor declaration control", normalize: "status", complete: "evidenced", gap: "not-evidenced" },
            { factId: "fact.epf.contractor.monthly-data-control", answerKey: "epfContractorMonthlyDataControl", type: "control-status", label: "Contractor monthly-data control", normalize: "status", complete: "evidenced", gap: "not-evidenced" },
            { factId: "fact.epf.contractor.principal-employer-reconciliation", answerKey: "epfPrincipalEmployerReconciliation", type: "control-status", label: "Principal-employer reconciliation", normalize: "status", complete: "evidenced", gap: "not-evidenced" }
        ],
        codes: ["EPF_CONTRACTOR_CONTROL_EVIDENCED_REVIEW_REQUIRED", "EPF_CONTRACTOR_CONTROL_GAPS_REVIEW_REQUIRED", "EPF_CONTRACTOR_FACTS_MISSING"],
        limitations: ["A zero-contractor response is an organisation fact that remains subject to evidence review.", "No contractor employee roster, payroll file or individual identifier is accepted."]
    },
    {
        key: "records",
        featureId: "feature.legal.epf.records-returns",
        ruleId: "rule.legal.epf.records-returns",
        productRuleId: "epf-records-returns-operational-review",
        title: "EPF records and returns operational-control review",
        queryTerms: ["epf records", "returns", "authorised signatory", "uan onboarding", "nomination", "retention", "evidence"],
        fields: [
            { factId: "fact.epf.records.ownership-return", answerKey: "epfRecordsOwnershipControl", type: "control-status", label: "Records and returns ownership control", normalize: "status", complete: "evidenced", gap: "not-evidenced" },
            { factId: "fact.epf.records.authorised-signatories", answerKey: "epfAuthorisedSignatoryControl", type: "control-status", label: "Authorised-signatory control", normalize: "status", complete: "evidenced", gap: "not-evidenced" },
            { factId: "fact.epf.records.uan-onboarding", answerKey: "epfUanOnboardingControl", type: "control-status", label: "UAN onboarding control", normalize: "status", complete: "evidenced", gap: "not-evidenced" },
            { factId: "fact.epf.records.nomination-control", answerKey: "epfNominationControl", type: "control-status", label: "Nomination process control", normalize: "status", complete: "evidenced", gap: "not-evidenced" },
            { factId: "fact.epf.records.retention-access", answerKey: "epfRetentionAccessControl", type: "control-status", label: "Retention and access control", normalize: "status", complete: "evidenced", gap: "not-evidenced" },
            { factId: "fact.epf.evidence.references", answerKey: "epfEvidenceReferences", type: "evidence-reference-array", label: "Evidence references", normalize: "array", complete: ["epf-monthly-control-register"], gap: ["epf-gap-register"], operator: "exists" }
        ],
        codes: ["EPF_RECORDS_CONTROL_EVIDENCED_REVIEW_REQUIRED", "EPF_RECORDS_CONTROL_GAPS_REVIEW_REQUIRED", "EPF_RECORDS_FACTS_MISSING"],
        limitations: ["Only evidence references are accepted; evidence bodies, completed forms and personal records are prohibited.", "The route does not inspect or certify records or returns."]
    }
]);

function requiredFact(field) {
    return {
        factId: field.factId,
        sourceAssessmentField: field.answerKey,
        type: field.type,
        label: field.label,
        required: true
    };
}

function condition(field) {
    const operator = field.operator || "equals";
    const value = field.conditionValue !== undefined ? field.conditionValue : field.complete;
    return operator === "exists"
        ? { factId: field.factId, operator }
        : { factId: field.factId, operator, value };
}

function scenarioAnswers(config, mode) {
    const answers = {};
    config.fields.forEach((field, index) => {
        if (mode === "gap" && index === Math.min(1, config.fields.length - 1)) {
            answers[field.answerKey] = clone(field.gap);
        } else {
            answers[field.answerKey] = clone(field.complete);
        }
    });
    return answers;
}

function buildRuleCatalog(config) {
    const [matchedCode, gapCode, missingCode] = config.codes;
    const requiredFacts = config.fields.map(requiredFact);
    const requiredFactIds = config.fields.map((field) => field.factId);
    const limitations = unique([...COMMON_LIMITATIONS, ...config.limitations]);
    const sections = sourceSections(config.key);
    return deepFreeze({
        catalogVersion: "1.0.0-private-beta",
        title: `${config.title} deterministic catalogue`,
        updatedAt: "2026-08-06",
        jurisdiction: "India",
        legalRuleCatalog: true,
        legalReviewStatus: "needs-legal-review",
        applicabilityAuthority: "deterministic-only",
        retrievalRole: "source-retrieval-only",
        llmRole: "explanation-only",
        advisoryOnly: true,
        privateBetaOnly: true,
        stableReportMutation: false,
        factMappingMode: "catalog-defined",
        outcomeModel: "control-review",
        sourceRegistry: {
            name: "GrowWithHR controlled Social Security and EPF source register",
            location: "GrowWithHR-RAG/00-project-control/Source Register.xlsx",
            reviewStatus: "needs-legal-review"
        },
        approval: { status: "draft", approvedBy: null, approvedAt: null },
        defaults: {
            ruleVersion: "1.0.0-private-beta",
            requiredFactMode: "all",
            evidence: {
                status: "not-verified",
                notes: "Organisation facts and evidence have not been independently verified.",
                verificationProcessId: null,
                verifiedAt: null
            },
            limitations
        },
        sources: REGISTRY_IDS.map((registrySourceId, index) => ({
            id: SOURCE_IDS[index],
            registrySourceId,
            title: registrySourceId,
            publisher: "Government of India",
            url: "https://www.labour.gov.in/",
            jurisdiction: "India",
            sourceType: "statute-or-statutory-scheme",
            documentType: "controlled-official-source",
            reviewedAt: "2026-08-06",
            reviewStatus: "needs-legal-review",
            official: true
        })),
        rules: [{
            id: config.ruleId,
            productRuleId: config.productRuleId,
            version: "1.0.0-private-beta",
            domain: "legal",
            title: config.title,
            description: "Reviews declared organisation-level EPF operational controls against a source-scoped deterministic catalogue without calculating payroll or deciding individual membership.",
            jurisdiction: { country: "IN", level: "central", code: "IN" },
            sourceRecordId: `EPF-WAVE3A-${config.key.toUpperCase()}`,
            legalReviewStatus: "needs-legal-review",
            requiredAssessmentFacts: requiredFacts,
            requiredFactMode: "all",
            requiredFactIds,
            missingInformationHandling: {
                defaultStatus: "more-information-needed",
                reasonCode: missingCode,
                neverInferMissingFacts: true,
                allowRetrievalToFillFacts: false,
                allowLlmToFillFacts: false
            },
            match: {
                mode: "all",
                conditions: config.fields.map(condition)
            },
            outcomes: {
                matched: {
                    status: "specialist-review",
                    reasonCode: matchedCode,
                    reason: `${config.title} has the declared operational facts recorded. Source interpretation, evidence sufficiency and implementation effectiveness remain subject to specialist review.`,
                    recommendation: recommendation(`${config.key}.verify`, `Verify ${config.title.toLowerCase()}`, "Review the declared controls and evidence references against the controlled source sections before relying on the result.")
                },
                notMatched: {
                    status: "specialist-review",
                    reasonCode: gapCode,
                    reason: `${config.title} contains one or more declared control gaps, conflicts or unresolved statuses that require remediation and specialist review.`,
                    recommendation: recommendation(`${config.key}.remediate`, `Address ${config.title.toLowerCase()} gaps`, "Resolve the reported control gaps, retain evidence references and obtain specialist confirmation for unresolved legal branches.")
                },
                missing: {
                    status: "more-information-needed",
                    reasonCode: missingCode,
                    reason: `${config.title} cannot run because one or more required organisation-level facts are missing.`,
                    recommendation: recommendation(`${config.key}.complete-input`, `Complete ${config.title.toLowerCase()} inputs`, "Provide the missing controlled statuses, counts or evidence references without including employee-level or payroll data.")
                }
            },
            permittedResultStatuses: ["specialist-review", "more-information-needed", "not-currently-applicable"],
            sourceIds: clone(SOURCE_IDS),
            officialSourceIds: clone(REGISTRY_IDS),
            sourceSections: sections,
            effectiveDateMetadata: {
                effectiveFrom: "2025-11-21",
                effectiveTo: null,
                sourceRegistryId: "social-security-code-commencement-so-5319e-2025"
            },
            limitations,
            automatedBoundaryTestScenarios: [
                {
                    scenarioId: `${config.key}-complete`,
                    description: "All required organisation-level controls are supplied in the expected state.",
                    answers: scenarioAnswers(config, "complete"),
                    expectedStatus: "specialist-review",
                    expectedReasonCode: matchedCode
                },
                {
                    scenarioId: `${config.key}-gap`,
                    description: "All required facts are supplied and at least one control is reported as a gap.",
                    answers: scenarioAnswers(config, "gap"),
                    expectedStatus: "specialist-review",
                    expectedReasonCode: gapCode
                },
                {
                    scenarioId: `${config.key}-missing`,
                    description: "Required organisation-level facts are omitted.",
                    answers: {},
                    expectedStatus: "more-information-needed",
                    expectedReasonCode: missingCode
                }
            ]
        }]
    });
}

const EPF_WAVE3A_PROFILE_DEFINITIONS = deepFreeze(configs.map((config) => ({
    featureId: config.featureId,
    ruleId: config.ruleId,
    productRuleId: config.productRuleId,
    queryTerms: clone(config.queryTerms),
    maxChunks: 4
})));
const EPF_WAVE3A_FEATURE_IDS = deepFreeze(configs.map((config) => config.featureId));

function createEpfWave3aFeatureSpecifications() {
    const specifications = {};
    configs.forEach((config) => {
        specifications[config.featureId] = deepFreeze({
            featureId: config.featureId,
            lawFamilyId: "epf-eps-edli",
            normalizeBody: (value) => normalizeFeatureBody(config, value),
            ruleCatalog: buildRuleCatalog(config),
            privateBetaMode: "statutory-catalogue"
        });
    });
    return deepFreeze(specifications);
}

module.exports = Object.freeze({
    MODULE_VERSION,
    EPF_WAVE3A_CATALOG_ID,
    EPF_WAVE3A_CATALOG_PATH,
    EPF_WAVE3A_FEATURE_IDS,
    EPF_WAVE3A_PROFILE_DEFINITIONS,
    createEpfWave3aFeatureSpecifications
});
