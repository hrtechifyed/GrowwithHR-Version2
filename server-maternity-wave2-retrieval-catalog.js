"use strict";

const crypto = require("crypto");
const { MATERNITY_CATALOG_ID } = require("./server-maternity-wave2-rule-catalogs.js");

const MODULE_VERSION = "1.0.0";
const ALL_REASON_CODES = Object.freeze([
    "MATERNITY_ESTABLISHMENT_COVERAGE_REVIEW_REQUIRED",
    "MATERNITY_APPROPRIATE_GOVERNMENT_REVIEW_REQUIRED",
    "MATERNITY_ESTABLISHMENT_COVERAGE_FACTS_MISSING",
    "MATERNITY_EMPLOYEE_ELIGIBILITY_REVIEW_REQUIRED",
    "MATERNITY_EMPLOYEE_ELIGIBILITY_SPECIALIST_REVIEW",
    "MATERNITY_EMPLOYEE_ELIGIBILITY_FACTS_MISSING",
    "MATERNITY_BENEFIT_DURATION_REVIEW_REQUIRED",
    "MATERNITY_BENEFIT_DURATION_SPECIALIST_REVIEW",
    "MATERNITY_BENEFIT_CATEGORY_FACTS_MISSING",
    "MATERNITY_ADOPTING_COMMISSIONING_REVIEW_REQUIRED",
    "MATERNITY_WORK_FROM_HOME_REVIEW_REQUIRED",
    "MATERNITY_CHILD_AGE_FACTS_MISSING",
    "MATERNITY_SPECIAL_LEAVE_CONTROLS_RECORDED_REVIEW_REQUIRED",
    "MATERNITY_SPECIAL_LEAVE_CONTROL_GAPS_REVIEW_REQUIRED",
    "MATERNITY_SPECIAL_LEAVE_FACTS_MISSING",
    "MATERNITY_NURSING_BREAK_REVIEW_REQUIRED",
    "MATERNITY_NURSING_BREAK_DURATION_REVIEW_REQUIRED",
    "MATERNITY_NURSING_BREAK_FACTS_MISSING",
    "MATERNITY_CRECHE_FACILITY_REVIEW_REQUIRED",
    "MATERNITY_CRECHE_ALLOWANCE_REVIEW_REQUIRED",
    "MATERNITY_CRECHE_FACTS_MISSING",
    "MATERNITY_NOTICE_PAYMENT_RECORDS_REVIEW_REQUIRED",
    "MATERNITY_PROCESS_CONTROL_GAPS_REVIEW_REQUIRED",
    "MATERNITY_PROCESS_FACTS_MISSING",
    "MATERNITY_EMPLOYMENT_PROTECTION_REVIEW_REQUIRED",
    "MATERNITY_DISMISSAL_PROCESS_REVIEW_REQUIRED",
    "MATERNITY_EMPLOYMENT_PROTECTION_FACTS_MISSING",
    "MATERNITY_ESI_OVERLAP_REVIEW_REQUIRED",
    "MATERNITY_ESI_TRANSITION_REVIEW_REQUIRED",
    "MATERNITY_ESI_ELIGIBILITY_FACTS_MISSING"
]);

const CODE_URL = "https://www.labour.gov.in/offerings/schemes-and-services/details/labour-codes-gzNzQzMtQWa";
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

const reason = (...values) => Object.freeze(values);
const chunk = (chunkId, registrySourceId, title, sectionReference, pageStart, pageEnd, reasonCodes, retrievalTerms, text) => ({
    chunkId,
    registrySourceId,
    title,
    sectionReference,
    pageStart,
    pageEnd,
    priority: 100,
    reasonCodes,
    retrievalTerms,
    text,
    contentSha256: crypto.createHash("sha256").update(text).digest("hex")
});

const featureChunks = Object.freeze([
    chunk(
        "social-security-code-maternity-establishment-wave2-001",
        "social-security-code-2020",
        "Chapter VI establishment coverage and continuing application",
        "Section 1(4), Section 1(8), selected Section 2 definitions and First Schedule Chapter VI",
        8,
        18,
        reason("MATERNITY_ESTABLISHMENT_COVERAGE_REVIEW_REQUIRED", "MATERNITY_APPROPRIATE_GOVERNMENT_REVIEW_REQUIRED", "MATERNITY_ESTABLISHMENT_COVERAGE_FACTS_MISSING"),
        ["maternity benefit", "establishment", "preceding twelve months", "appropriate government", "chapter vi"],
        "The controlled Code source sets the Chapter VI establishment and continuing-application boundary. The product records establishment-specific counts and controlled jurisdiction facts but does not infer the appropriate Government or generalise facts across establishments."
    ),
    chunk(
        "social-security-code-maternity-eligibility-wave2-001",
        "social-security-code-2020",
        "Maternity benefit and workday condition",
        "Section 60(1)-(2)",
        49,
        50,
        reason("MATERNITY_EMPLOYEE_ELIGIBILITY_REVIEW_REQUIRED", "MATERNITY_EMPLOYEE_ELIGIBILITY_SPECIALIST_REVIEW", "MATERNITY_EMPLOYEE_ELIGIBILITY_FACTS_MISSING"),
        ["workdays", "eighty days", "preceding twelve months", "eligibility"],
        "Section 60(1) and (2) provide the maternity-benefit and workday-condition context. Only a non-negative workday value and controlled event category are accepted; records, medical evidence, names and exact dates are prohibited."
    ),
    chunk(
        "social-security-code-maternity-duration-wave2-001",
        "social-security-code-2020",
        "Benefit-duration category branches",
        "Section 60(3)",
        49,
        50,
        reason("MATERNITY_BENEFIT_DURATION_REVIEW_REQUIRED", "MATERNITY_BENEFIT_DURATION_SPECIALIST_REVIEW", "MATERNITY_BENEFIT_CATEGORY_FACTS_MISSING"),
        ["benefit duration", "surviving children", "category", "section 60"],
        "Section 60(3) contains category-dependent duration provisions. The product uses a controlled surviving-child-count band and event category, does not collect family history or child details, and does not calculate payment or certify duration."
    ),
    chunk(
        "social-security-code-maternity-adopting-wave2-001",
        "social-security-code-2020",
        "Adopting or commissioning mother and work-from-home provisions",
        "Section 60(4)-(5)",
        50,
        50,
        reason("MATERNITY_ADOPTING_COMMISSIONING_REVIEW_REQUIRED", "MATERNITY_WORK_FROM_HOME_REVIEW_REQUIRED", "MATERNITY_CHILD_AGE_FACTS_MISSING"),
        ["adopting mother", "commissioning mother", "child age band", "work from home"],
        "Section 60(4) and (5) provide adopting or commissioning mother and work-from-home context. Only controlled statuses and an age band are accepted; adoption documents, surrogacy records, child identity and exact dates are prohibited."
    ),
    chunk(
        "social-security-code-maternity-special-leave-wave2-001",
        "social-security-code-2020",
        "Special leave categories",
        "Section 65",
        51,
        51,
        reason("MATERNITY_SPECIAL_LEAVE_CONTROLS_RECORDED_REVIEW_REQUIRED", "MATERNITY_SPECIAL_LEAVE_CONTROL_GAPS_REVIEW_REQUIRED", "MATERNITY_SPECIAL_LEAVE_FACTS_MISSING"),
        ["miscarriage", "medical termination", "tubectomy", "related illness", "leave"],
        "Section 65 provides source context for special leave categories. The route reviews organisation control statuses only and prohibits diagnoses, procedure details, certificates, medical narratives and individual evidence."
    ),
    chunk(
        "social-security-code-maternity-nursing-wave2-001",
        "social-security-code-2020",
        "Nursing-break duty",
        "Section 66 and Central Rule 36",
        51,
        51,
        reason("MATERNITY_NURSING_BREAK_REVIEW_REQUIRED", "MATERNITY_NURSING_BREAK_DURATION_REVIEW_REQUIRED", "MATERNITY_NURSING_BREAK_FACTS_MISSING"),
        ["nursing break", "duration", "journey time", "dispute process"],
        "Section 66 and the mapped Central Rule provide nursing-break context. The private-beta review checks policy, duration, journey-time and dispute controls separately from crèche controls and does not decide an individual schedule."
    ),
    chunk(
        "social-security-code-maternity-creche-wave2-001",
        "social-security-code-2020",
        "Crèche threshold, facility and allowance controls",
        "Section 67 and Central Rule 37",
        51,
        51,
        reason("MATERNITY_CRECHE_FACILITY_REVIEW_REQUIRED", "MATERNITY_CRECHE_ALLOWANCE_REVIEW_REQUIRED", "MATERNITY_CRECHE_FACTS_MISSING"),
        ["creche", "fifty employees", "distance", "staffing", "allowance"],
        "Section 67 and the mapped Central Rule provide crèche threshold, facility and allowance context. The route records establishment-level control statuses and does not inspect or certify a facility."
    ),
    chunk(
        "social-security-code-maternity-process-wave2-001",
        "social-security-code-2020",
        "Notice, payment, information, complaint and records controls",
        "Sections 62-64, 71-72 and 123; mapped Central Rules and forms",
        50,
        75,
        reason("MATERNITY_NOTICE_PAYMENT_RECORDS_REVIEW_REQUIRED", "MATERNITY_PROCESS_CONTROL_GAPS_REVIEW_REQUIRED", "MATERNITY_PROCESS_FACTS_MISSING"),
        ["notice", "payment", "medical bonus", "register", "retention", "annual return"],
        "The mapped Code provisions and Central Rules provide notice, payment, information, complaint, inspection, register, retention and annual-return context. Only control statuses are processed; completed forms, claims, bank details and case records are prohibited."
    ),
    chunk(
        "social-security-code-maternity-protection-wave2-001",
        "social-security-code-2020",
        "Employment protection, dismissal, deductions and appeal",
        "Section 59 and Sections 68-70; Central Rule 38",
        49,
        52,
        reason("MATERNITY_EMPLOYMENT_PROTECTION_REVIEW_REQUIRED", "MATERNITY_DISMISSAL_PROCESS_REVIEW_REQUIRED", "MATERNITY_EMPLOYMENT_PROTECTION_FACTS_MISSING"),
        ["protected period", "arduous work", "dismissal", "gross misconduct", "appeal"],
        "The mapped provisions provide employment-protection, dismissal, deduction, forfeiture and appeal context. The route checks organisation controls only and prohibits identities, allegations, disciplinary evidence and individual dispute outcomes."
    ),
    chunk(
        "social-security-code-maternity-esi-wave2-001",
        "social-security-code-2020",
        "Chapter VI and ESI maternity-benefit route",
        "Section 41(7)(b) and Section 61",
        40,
        50,
        reason("MATERNITY_ESI_OVERLAP_REVIEW_REQUIRED", "MATERNITY_ESI_TRANSITION_REVIEW_REQUIRED", "MATERNITY_ESI_ELIGIBILITY_FACTS_MISSING"),
        ["esi overlap", "maternity benefit", "chapter iv", "chapter vi", "transition"],
        "Sections 41(7)(b) and 61 provide ESI and Chapter VI routing context. ESI registration alone is not treated as resolving the route, and identifiers, claims, medical details and exact transition dates are prohibited."
    ),
    chunk(
        "social-security-rules-maternity-implementation-wave2-001",
        "social-security-central-rules-2026",
        "Central maternity implementation rules",
        "Rules 35-40 and 53; mapped forms",
        177,
        244,
        ALL_REASON_CODES,
        ["central rules", "maternity claim", "nursing break", "creche", "register", "forms"],
        "The controlled Central Rules supply implementation context for claims, nursing breaks, crèche controls, gross-misconduct procedure, information, registers, retention, returns and forms. Central Rules do not resolve unsupported State-sphere material."
    ),
    chunk(
        "social-security-commencement-maternity-wave2-001",
        "social-security-code-commencement-so-5319e-2025",
        "Commencement context",
        "S.O. 5319(E), dated 21 November 2025",
        1,
        2,
        ALL_REASON_CODES,
        ["commencement", "21 november 2025", "social security code", "effective date"],
        "The controlled commencement notification records 21 November 2025 for the mapped provisions. Retrieval and provider output cannot alter the deterministic effective-date metadata."
    ),
    chunk(
        "social-security-corrigendum-maternity-wave2-001",
        "social-security-code-corrigendum-so-5936e-2025",
        "Corrigendum context",
        "S.O. 5936(E), dated 19 December 2025",
        1,
        2,
        ALL_REASON_CODES,
        ["corrigendum", "19 december 2025", "so 5936", "so 5319"],
        "The controlled corrigendum is retained with the commencement source so transition context is not represented from the original notification alone. Its legal effect remains subject to qualified review."
    )
]);

function buildMaternityWave2RetrievalCatalog() {
    return Object.freeze({
        catalogVersion: "1.0.0-private-beta",
        title: "GrowWithHR Maternity Benefit Wave 2 Governed Statutory Retrieval Catalogue",
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
            name: "GrowWithHR Maternity Benefit Wave 2 controlled statutory snapshot",
            verifiedAt: "2026-08-06",
            ingestionMode: "curated-offline-private-beta",
            runtimeSourceAccess: false,
            notes: "Curated source-grounded summaries from controlled Code, Central Rules, commencement and corrigendum identities. Qualified legal, privacy and RAG approval remain required."
        },
        sources: [
            source("social-security-code-2020", "Code on Social Security, 2020", "Code", CODE_URL, "code-on-social-security-2020-official.pdf", "GrowWithHR-RAG/01-source-documents/official/social-security/01-code/code-on-social-security-2020-official.pdf", "53ad67f75fbc874fd837274e9e887fac7a21cc55c7454398b2cdb96046fd7967", 1020695, 113),
            source("social-security-central-rules-2026", "Social Security (Central) Rules, 2026", "Central Rules", CODE_URL, "social-security-central-rules-2026-official.pdf", "GrowWithHR-RAG/01-source-documents/official/social-security/02-rules/social-security-central-rules-2026-official.pdf", "37c5a8cd8684e9362f86a1a72642174045a302234fa1918e8a73a30296b43878", 3856046, 259),
            source("social-security-code-commencement-so-5319e-2025", "Code on Social Security commencement notification S.O. 5319(E), 2025", "Official Gazette notification", "https://www.labour.gov.in/", "social-security-code-commencement-so-5319e-2025.pdf", "GrowWithHR-RAG/01-source-documents/official/social-security/03-notifications/social-security-code-commencement-so-5319e-2025.pdf", "014ba41eba2c0beda344bf084e1bed1d6f7f6929aabdbc7b4fa25fe22bce45c5", 408295, 2),
            source("social-security-code-corrigendum-so-5936e-2025", "Code on Social Security corrigendum S.O. 5936(E), 2025", "Official Gazette corrigendum", "https://www.labour.gov.in/whats-new", "social-security-code-corrigendum-so-5936e-2025.pdf", "GrowWithHR-RAG/01-source-documents/official/social-security/03-notifications/social-security-code-corrigendum-so-5936e-2025.pdf", "d14b088ef05a8f34c37d823b3b6fc6bd78a101e37882edc256d931e01e063a03", 560515, 2)
        ],
        chunks: featureChunks.map((item) => Object.freeze({ ...item }))
    });
}

module.exports = Object.freeze({
    MODULE_VERSION,
    MATERNITY_CATALOG_ID,
    ALL_REASON_CODES,
    buildMaternityWave2RetrievalCatalog
});
