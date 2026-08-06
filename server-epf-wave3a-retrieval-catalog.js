"use strict";

const crypto = require("crypto");
const { EPF_WAVE3A_CATALOG_ID } = require("./server-epf-wave3a-rule-catalogs.js");

const MODULE_VERSION = "1.0.0";
const ALL_REASON_CODES = Object.freeze([
    "EPF_ESTABLISHMENT_COVERAGE_REVIEW_REQUIRED",
    "EPF_ESTABLISHMENT_SCOPE_GAP_REVIEW_REQUIRED",
    "EPF_ESTABLISHMENT_FACTS_MISSING",
    "EPF_MEMBER_INCLUSION_REVIEW_REQUIRED",
    "EPF_MEMBER_INCLUSION_CONTROL_GAPS_REVIEW_REQUIRED",
    "EPF_MEMBER_FACTS_MISSING",
    "EPF_MONTHLY_CONTROL_EVIDENCED_REVIEW_REQUIRED",
    "EPF_MONTHLY_CONTROL_GAPS_REVIEW_REQUIRED",
    "EPF_MONTHLY_CONTROL_FACTS_MISSING",
    "EPF_CONTRACTOR_CONTROL_EVIDENCED_REVIEW_REQUIRED",
    "EPF_CONTRACTOR_CONTROL_GAPS_REVIEW_REQUIRED",
    "EPF_CONTRACTOR_FACTS_MISSING",
    "EPF_RECORDS_CONTROL_EVIDENCED_REVIEW_REQUIRED",
    "EPF_RECORDS_CONTROL_GAPS_REVIEW_REQUIRED",
    "EPF_RECORDS_FACTS_MISSING"
]);

const CODE_URL = "https://www.labour.gov.in/offerings/schemes-and-services/details/labour-codes-gzNzQzMtQWa";
const EPFO_URL = "https://www.epfindia.gov.in/";

const source = (registrySourceId, title, documentType, officialUrl, fileName, drivePath, sha256, byteLength, pageCount) => ({
    registrySourceId,
    title,
    documentType,
    official: true,
    reviewStatus: "needs-legal-review",
    officialUrl,
    fileName,
    drivePath,
    sha256,
    byteLength,
    pageCount
});

const chunk = (chunkId, registrySourceId, title, sectionReference, pageStart, pageEnd, reasonCodes, retrievalTerms, body) => ({
    chunkId,
    registrySourceId,
    title,
    sectionReference,
    pageStart,
    pageEnd,
    priority: 100,
    reasonCodes,
    retrievalTerms,
    text: body,
    contentSha256: crypto.createHash("sha256").update(body).digest("hex")
});

const chunks = Object.freeze([
    chunk(
        "social-security-code-epf-establishment-wave3a-001",
        "social-security-code-2020",
        "EPF establishment coverage and continuing-application context",
        "Sections 1–3, selected definitions and First Schedule Chapter III",
        8,
        19,
        ["EPF_ESTABLISHMENT_COVERAGE_REVIEW_REQUIRED", "EPF_ESTABLISHMENT_SCOPE_GAP_REVIEW_REQUIRED", "EPF_ESTABLISHMENT_FACTS_MISSING"],
        ["epf establishment", "employee count", "branches", "prior coverage", "continuing application"],
        "The controlled Code source provides the establishment, employee and continuing-application context for Chapter III. Wave 3A uses organisation-level counts and branch-scope statuses only; a current count does not by itself resolve prior coverage, co-operative or government-controlled establishment questions."
    ),
    chunk(
        "epf-scheme-establishment-wave3a-001",
        "employees-provident-funds-scheme-2026",
        "EPF Scheme notification and establishment definitions",
        "Notification, paragraph 1 and definitions",
        66,
        68,
        ["EPF_ESTABLISHMENT_COVERAGE_REVIEW_REQUIRED", "EPF_ESTABLISHMENT_SCOPE_GAP_REVIEW_REQUIRED", "EPF_ESTABLISHMENT_FACTS_MISSING"],
        ["provident fund scheme", "establishment", "factory", "branch", "coverage"],
        "The controlled EPF Scheme source supplies scheme-level establishment and definition context. The route does not treat a code number, registration record or current headcount as sufficient evidence of full legal coverage without specialist review."
    ),
    chunk(
        "epf-scheme-member-inclusion-wave3a-001",
        "employees-provident-funds-scheme-2026",
        "Membership and excluded-employee classification controls",
        "Definitions and paragraphs 9–11",
        66,
        70,
        ["EPF_MEMBER_INCLUSION_REVIEW_REQUIRED", "EPF_MEMBER_INCLUSION_CONTROL_GAPS_REVIEW_REQUIRED", "EPF_MEMBER_FACTS_MISSING"],
        ["membership", "excluded employee", "apprentice", "contract employee", "prior member"],
        "The controlled Scheme source provides membership and classification context for employees, apprentices, excluded employees and prior-member routing. Wave 3A checks only whether organisation classification controls are recorded and never decides an individual's membership."
    ),
    chunk(
        "epf-scheme-monthly-controls-wave3a-001",
        "employees-provident-funds-scheme-2026",
        "Monthly deduction, employer share, filing and reconciliation controls",
        "Paragraphs 18–30",
        75,
        82,
        ["EPF_MONTHLY_CONTROL_EVIDENCED_REVIEW_REQUIRED", "EPF_MONTHLY_CONTROL_GAPS_REVIEW_REQUIRED", "EPF_MONTHLY_CONTROL_FACTS_MISSING"],
        ["employee deduction", "employer share", "ecr", "due date", "reconciliation", "exception"],
        "The controlled Scheme source supplies monthly contribution-process context. Wave 3A records whether rate-source, deduction, employer-share, filing, due-date, reconciliation and exception controls exist; it does not select a contribution-rate branch or process payroll rows, wage amounts or ECR bodies."
    ),
    chunk(
        "social-security-code-contractor-wave3a-001",
        "social-security-code-2020",
        "Principal-employer and contractor contribution framework",
        "Section 17",
        27,
        31,
        ["EPF_CONTRACTOR_CONTROL_EVIDENCED_REVIEW_REQUIRED", "EPF_CONTRACTOR_CONTROL_GAPS_REVIEW_REQUIRED", "EPF_CONTRACTOR_FACTS_MISSING"],
        ["contractor", "principal employer", "contribution", "recovery", "responsibility"],
        "Section 17 provides principal-employer and contractor contribution context. The product reviews only contractor-count, declaration, monthly-data and reconciliation controls and does not collect contractor employee rosters or contribution histories."
    ),
    chunk(
        "epf-scheme-contractor-wave3a-001",
        "employees-provident-funds-scheme-2026",
        "Contractor data and principal-employer operational controls",
        "Paragraphs 20 and 27",
        75,
        82,
        ["EPF_CONTRACTOR_CONTROL_EVIDENCED_REVIEW_REQUIRED", "EPF_CONTRACTOR_CONTROL_GAPS_REVIEW_REQUIRED", "EPF_CONTRACTOR_FACTS_MISSING"],
        ["contractor declaration", "monthly data", "principal employer", "reconciliation"],
        "The controlled Scheme source supplies contractor operational-control context. A zero-contractor response remains an organisation fact requiring evidence review; no worker name, UAN, wage or payroll record is accepted."
    ),
    chunk(
        "social-security-code-records-returns-wave3a-001",
        "social-security-code-2020",
        "Records, returns, information and inspection framework",
        "Sections 122–123",
        73,
        75,
        ["EPF_RECORDS_CONTROL_EVIDENCED_REVIEW_REQUIRED", "EPF_RECORDS_CONTROL_GAPS_REVIEW_REQUIRED", "EPF_RECORDS_FACTS_MISSING"],
        ["records", "returns", "information", "inspection", "retention"],
        "The controlled Code source provides records, returns, information and inspection context. Wave 3A processes control statuses and evidence references only and does not retrieve completed forms, employee records, nominee information or evidence bodies."
    ),
    chunk(
        "epf-scheme-records-returns-wave3a-001",
        "employees-provident-funds-scheme-2026",
        "Authorisation, returns, member administration and record controls",
        "Paragraphs 24–30",
        78,
        82,
        ["EPF_RECORDS_CONTROL_EVIDENCED_REVIEW_REQUIRED", "EPF_RECORDS_CONTROL_GAPS_REVIEW_REQUIRED", "EPF_RECORDS_FACTS_MISSING"],
        ["authorised signatory", "return", "uan onboarding", "nomination", "retention", "access"],
        "The controlled Scheme source supplies operational context for returns, authorisation, member administration and record controls. The route records evidence references but does not inspect, retain or transmit the underlying documents."
    ),
    chunk(
        "social-security-commencement-epf-wave3a-001",
        "social-security-code-commencement-so-5319e-2025",
        "Commencement context",
        "S.O. 5319(E), dated 21 November 2025",
        1,
        2,
        ALL_REASON_CODES,
        ["commencement", "21 november 2025", "social security code", "chapter iii"],
        "The controlled commencement notification is retained as effective-date context for the mapped Code provisions. Transition and savings treatment remains subject to qualified legal review and cannot be resolved by retrieval or provider output."
    ),
    chunk(
        "social-security-corrigendum-epf-wave3a-001",
        "social-security-code-corrigendum-so-5936e-2025",
        "Corrigendum context",
        "S.O. 5936(E), dated 19 December 2025",
        1,
        2,
        ALL_REASON_CODES,
        ["corrigendum", "19 december 2025", "so 5936", "so 5319"],
        "The controlled corrigendum remains attached to the commencement context so the original notification is not represented in isolation. Its legal effect and transition implications remain subject to specialist review."
    )
]);

function buildEpfWave3aRetrievalCatalog() {
    return Object.freeze({
        catalogVersion: "1.0.0-private-beta",
        title: "GrowWithHR EPF Wave 3A Governed Statutory Retrieval Catalogue",
        updatedAt: "2026-08-06",
        jurisdiction: "India",
        retrievalCatalog: true,
        retrievalRole: "source-retrieval-only",
        applicabilityAuthority: "none",
        llmRole: "none",
        legalReviewStatus: "needs-legal-review",
        advisoryOnly: true,
        privateBetaOnly: true,
        productionIntegration: false,
        catalogMode: "statutory",
        sourceRegisterPath: "GrowWithHR-RAG/00-project-control/Source Register.xlsx",
        sourcePack: {
            name: "GrowWithHR EPF Wave 3A controlled statutory snapshot",
            verifiedAt: "2026-08-06",
            ingestionMode: "curated-offline-private-beta",
            runtimeSourceAccess: false,
            notes: "Curated source-grounded summaries for five EPF operational reviews. Qualified legal, privacy and RAG approval remain required; unresolved rates, ceilings, exemptions, international-worker, EPS and EDLI branches are excluded."
        },
        limitations: [
            "The EPF Wave 3A catalogue remains needs-legal-review and is not payroll, membership or compliance advice.",
            "Only organisation-level statuses, counts and evidence references are eligible for retrieval context.",
            "Retrieval cannot create facts, calculate contributions, select a rate branch or change the deterministic decision."
        ],
        sources: [
            source("social-security-code-2020", "Code on Social Security, 2020", "Code", CODE_URL, "code-on-social-security-2020-official.pdf", "GrowWithHR-RAG/01-source-documents/official/social-security/01-code/code-on-social-security-2020-official.pdf", "53ad67f75fbc874fd837274e9e887fac7a21cc55c7454398b2cdb96046fd7967", 1020695, 113),
            source("employees-provident-funds-scheme-2026", "Employees' Provident Funds Scheme, 2026", "Statutory Scheme", EPFO_URL, "employees-provident-funds-scheme-2026-official.pdf", "GrowWithHR-RAG/01-source-documents/official/social-security/02-schemes/employees-provident-funds-scheme-2026-official.pdf", "4e062db5bf5d8b904ae1c0d4af10950dc01de7df8360398dfe197d6d06aef489", 2510370, 129),
            source("social-security-code-commencement-so-5319e-2025", "Code on Social Security commencement notification S.O. 5319(E), 2025", "Official Gazette notification", "https://www.labour.gov.in/", "social-security-code-commencement-so-5319e-2025.pdf", "GrowWithHR-RAG/01-source-documents/official/social-security/03-notifications/social-security-code-commencement-so-5319e-2025.pdf", "014ba41eba2c0beda344bf084e1bed1d6f7f6929aabdbc7b4fa25fe22bce45c5", 408295, 2),
            source("social-security-code-corrigendum-so-5936e-2025", "Code on Social Security corrigendum S.O. 5936(E), 2025", "Official Gazette corrigendum", "https://www.labour.gov.in/whats-new", "social-security-code-corrigendum-so-5936e-2025.pdf", "GrowWithHR-RAG/01-source-documents/official/social-security/03-notifications/social-security-code-corrigendum-so-5936e-2025.pdf", "d14b088ef05a8f34c37d823b3b6fc6bd78a101e37882edc256d931e01e063a03", 560515, 2)
        ],
        chunks: chunks.map((item) => Object.freeze({ ...item }))
    });
}

module.exports = Object.freeze({
    MODULE_VERSION,
    EPF_WAVE3A_CATALOG_ID,
    ALL_REASON_CODES,
    buildEpfWave3aRetrievalCatalog
});
