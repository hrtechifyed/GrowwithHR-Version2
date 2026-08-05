# ESI — legal, privacy, RAG and release review packet

**Version:** 0.1.0  
**Prepared:** 5 August 2026  
**Submission status:** Draft — not submitted  
**Current legal status:** Needs legal review  
**Current privacy status:** Needs privacy review  
**Current RAG status:** Not approved  
**Assessment capture:** Disabled  
**Runtime activation:** Blocked / false  
**Legal effect:** This repository companion is not legal advice, legal certification, RAG approval or permission to activate an ESI feature.

> A blank decision is not approval. Source registration, internal self-review, packet preparation, discussion or acknowledgement is not approval.

## 1. Purpose and authority boundary

This packet mirrors the controlled ESI self-review and Assessment Fact Contract in repository-readable governance records. It records proposed sources, page mappings, fact dependencies, privacy restrictions, feature-review families and unresolved decisions.

```text
assessment answers
→ approved privacy-minimised facts
→ approved deterministic rule
→ separately approved source retrieval
→ explanation-only provider
→ blocked presentation until release approval
```

No production deterministic rule or RAG chunk is created by this packet. Retrieval and a model may not create facts, decide coverage or entitlement, choose a wage ceiling, alter a rate, calculate an amount, determine medical or employment causation, change a status or reason code, or remove a specialist-review trigger.

## 2. Controlled materials

| Material | Path | Status |
|---|---|---|
| Source Register | `GrowWithHR-RAG/00-project-control/Source Register.xlsx` | Source identities recorded; reconciliation issues remain |
| Self-review | `GrowWithHR-RAG/01-source-documents/official/social-security/04-review/esi-rule-self-review-v1.docx` | Internal research only |
| Assessment Fact Contract | `GrowWithHR-RAG/01-source-documents/official/social-security/04-review/esi-assessment-fact-contract-v1.docx` | Draft; capture disabled |
| Controlled approval packet | `GrowWithHR-RAG/01-source-documents/official/social-security/04-review/esi-legal-review-and-rag-approval-packet-v1.docx` | Draft; decisions blank |
| Repository mapping | `data/legal-source-governance/esi-section-mapping.v1.json` | Draft; blocked |
| Repository fact contract | `data/assessment/esi-assessment-fact-contract.v1.json` | 65 proposed facts; capture disabled |
| Repository decision record | `data/legal-source-governance/esi-legal-review-decision.v1.json` | Blank decision companion |

## 3. Controlled source inventory

| Source ID | Document | SHA-256 | Bytes | Pages |
|---|---|---|---|---|
| `social-security-code-2020` | Code on Social Security, 2020 | `53ad67f75fbc874fd837274e9e887fac7a21cc55c7454398b2cdb96046fd7967` | 1,020,695 | 113 |
| `social-security-central-rules-2026` | Social Security (Central) Rules, 2026 - G.S.R. 344(E) | `37c5a8cd8684e9362f86a1a72642174045a302234fa1918e8a73a30296b43878` | 3,856,046 | 259 |
| `social-security-code-commencement-so-5319e-2025` | S.O. 5319(E), 21 November 2025 | `014ba41eba2c0beda344bf084e1bed1d6f7f6929aabdbc7b4fa25fe22bce45c5` | 408,295 | 2 |
| `social-security-code-corrigendum-so-5936e-2025` | S.O. 5936(E), 19 December 2025 | `d14b088ef05a8f34c37d823b3b6fc6bd78a101e37882edc256d931e01e063a03` | 560,515 | 2 |
| `employees-state-insurance-central-rules-1950` | Employees’ State Insurance (Central) Rules, 1950 - consolidated as on 26 April 2024 | `bf1c13836ab0d718340763e6f037efb70c74655158cd1363ceb984b06c96be5a` | 339,742 | 32 |
| `employees-state-insurance-general-regulations-1950` | Employees’ State Insurance (General) Regulations, 1950 - consolidated as on 11 January 2024 | `01392b8a2f76104f270bf5933b6276316e5c45ef3db9dc7159bdb8006766e0d5` | 357,557 | 34 |
| `social-security-esi-authorised-officers-so-2350e-2026` | S.O. 2350(E) - Chapter IV Authorised Officers | `785ab9a70a7b10e76beacb4a57a44d56064d77b865533175bd0f3c8c428fa5f3` | 520,182 | 2 |
| `social-security-esi-membership-continuation-so-2351e-2026` | S.O. 2351(E) - wage-ceiling continuation during contribution period | `be49210c90df27fc329e3116c93f119549015af16a79e6b397f234d2fea7a9a0` | 485,272 | 2 |
| `social-security-esi-medical-practitioners-so-2352e-2026` | S.O. 2352(E) - recognised medical practitioners | `54467f4d4a77493d2e9848351c245c8420b0f2b10b2880a6413c1ac2e075c0f6` | 562,248 | 2 |
| `social-security-esi-recovery-officers-so-2353e-2026` | S.O. 2353(E) - Recovery Officers and territorial jurisdictions | `2d8bc3cdcad88e7cd8fd8ff6373779445b80d91a8ce6d2ef8ce6857faeb2d709` | 836,087 | 9 |
| `social-security-esi-orders-authentication-so-2354e-2026` | S.O. 2354(E) - authentication of ESIC orders and decisions | `d79982ec9db3f685d6b15cd0a2af9b110e3fe2058145702fa089ee4237726df4` | 458,884 | 2 |
| `other-beneficiaries-medical-facilities-scheme-2026` | Other Beneficiaries and Members of Their Families Medical Facilities Scheme, 2026 - S.O. 2355(E) | `70a4a7626c7f3d313c3dec9eaa98a52f4a9fbb3ddcb789de5af4860494d58f49` | 740,840 | 3 |
| `social-security-esi-inspector-cum-facilitators-so-2356e-2026` | S.O. 2356(E) - Inspector-cum-Facilitators | `29fe75efb149f0c44f0f263a9dedd4ff393856c27d3f35b48f35da81e84f6d41` | 573,456 | 2 |

Every source remains subject to legal review. The two 1950 instruments are legacy or saved-law candidates and are not approved as prospective current-law authority.

## 4. Mandatory source gaps

1. Exact current Chapter IV wage-ceiling notification under section 2(89) is not included.
2. Exact hazardous or life-threatening occupation notification for the single-employee route is not included.
3. Area and establishment notifications showing when Chapter IV benefits are provided and contributions commence are not included.
4. S.O. 2060(E), dated 3 May 2023, referenced by the commencement corrigendum is not included.
5. Current replacement or amendment regulations for the relied-on 1950 General Regulations are not included.
6. State and Union Territory medical administration, ESI Society, court and local procedure sources are not onboarded.
7. Customer-specific exemption notifications and benefit-comparison evidence require specialist review.
8. Current portal specifications, forms, return formats and administrative instructions are not registered.
9. The user-charge instrument for the other-beneficiaries scheme is not included.
10. Current contribution-period, benefit-period and wage-period regulation treatment requires transition confirmation.

These gaps require either exact controlled sources and approval or a mandatory specialist-review/disabled route.

## 5. Proposed feature review families

| Feature | Proposed rule | Provisional statuses | Reason-code families |
|---|---|---|---|
| `feature.legal.esi.establishment-coverage` | `rule.legal.esi.establishment-coverage` | coverage-indicated-review-required, more-information-needed, specialist-review-required, blocked-pending-legal-review | `ESI_ESTABLISHMENT_COVERAGE_REVIEW_REQUIRED`<br>`ESI_ESTABLISHMENT_FACTS_MISSING`<br>`ESI_SEASONAL_CLASSIFICATION_SPECIALIST_REVIEW`<br>`ESI_PRIOR_COVERAGE_SPECIALIST_REVIEW` |
| `feature.legal.esi.continuing-voluntary-coverage` | `rule.legal.esi.continuing-voluntary-coverage` | coverage-indicated-review-required, more-information-needed, specialist-review-required, blocked-pending-legal-review | `ESI_CONTINUING_COVERAGE_REVIEW_REQUIRED`<br>`ESI_VOLUNTARY_APPLICATION_SPECIALIST_REVIEW`<br>`ESI_COVERAGE_HISTORY_FACTS_MISSING` |
| `feature.legal.esi.seasonal-hazardous-plantation` | `rule.legal.esi.special-coverage-routes` | more-information-needed, specialist-review-required, blocked-pending-legal-review | `ESI_SEASONAL_FACTORY_SPECIALIST_REVIEW`<br>`ESI_HAZARDOUS_ROUTE_SOURCE_MISSING`<br>`ESI_PLANTATION_OPT_IN_SPECIALIST_REVIEW` |
| `feature.legal.esi.area-benefit-commencement` | `rule.legal.esi.area-benefit-commencement` | more-information-needed, specialist-review-required, blocked-pending-legal-review | `ESI_AREA_NOTIFICATION_MISSING`<br>`ESI_BENEFIT_COMMENCEMENT_SPECIALIST_REVIEW`<br>`ESI_CONTRIBUTION_START_FACTS_MISSING` |
| `feature.legal.esi.employee-insurance` | `rule.legal.esi.employee-insurance` | control-evidenced-verification-recommended, control-not-evidenced, more-information-needed, specialist-review-required, blocked-pending-legal-review | `ESI_EMPLOYEE_INSURANCE_CONTROL_EVIDENCED`<br>`ESI_EMPLOYEE_INSURANCE_CONTROL_NOT_EVIDENCED`<br>`ESI_EMPLOYEE_INSURANCE_FACTS_MISSING`<br>`ESI_IDENTITY_PROCESS_SPECIALIST_REVIEW` |
| `feature.legal.esi.wage-ceiling` | `rule.legal.esi.wage-ceiling` | more-information-needed, specialist-review-required, blocked-pending-legal-review | `ESI_CURRENT_WAGE_CEILING_SOURCE_MISSING`<br>`ESI_WAGE_BASIS_FACTS_MISSING`<br>`ESI_WAGE_CLASSIFICATION_SPECIALIST_REVIEW` |
| `feature.legal.esi.ceiling-continuation` | `rule.legal.esi.ceiling-continuation` | continuation-indicated-review-required, more-information-needed, specialist-review-required, blocked-pending-legal-review | `ESI_CEILING_CONTINUATION_REVIEW_REQUIRED`<br>`ESI_CONTRIBUTION_PERIOD_FACTS_MISSING`<br>`ESI_CURRENT_WAGE_CEILING_SOURCE_MISSING` |
| `feature.legal.esi.contribution-rate` | `rule.legal.esi.contribution-rate` | rate-source-evidenced-verification-recommended, more-information-needed, specialist-review-required, blocked-pending-legal-review | `ESI_ORDINARY_RATE_SOURCE_EVIDENCED`<br>`ESI_RATE_FACTS_MISSING`<br>`ESI_HISTORICAL_RATE_SPECIALIST_REVIEW` |
| `feature.legal.esi.contractor-control` | `rule.legal.esi.contractor-control` | control-evidenced-verification-recommended, control-not-evidenced, more-information-needed, specialist-review-required, blocked-pending-legal-review | `ESI_CONTRACTOR_CONTROL_EVIDENCED`<br>`ESI_CONTRACTOR_CONTROL_NOT_EVIDENCED`<br>`ESI_CONTRACTOR_FACTS_MISSING`<br>`ESI_WORKER_CLASSIFICATION_SPECIALIST_REVIEW` |
| `feature.legal.esi.monthly-payment-control` | `rule.legal.esi.monthly-payment-control` | control-evidenced-verification-recommended, control-not-evidenced, more-information-needed, specialist-review-required, blocked-pending-legal-review | `ESI_PAYMENT_CONTROL_EVIDENCED`<br>`ESI_PAYMENT_CONTROL_NOT_EVIDENCED`<br>`ESI_PAYMENT_FACTS_MISSING`<br>`ESI_SAVED_REGULATION_SPECIALIST_REVIEW` |
| `feature.legal.esi.accident-reporting-control` | `rule.legal.esi.accident-reporting-control` | control-evidenced-verification-recommended, control-not-evidenced, more-information-needed, specialist-review-required, blocked-pending-legal-review | `ESI_ACCIDENT_REPORTING_CONTROL_EVIDENCED`<br>`ESI_ACCIDENT_REPORTING_CONTROL_NOT_EVIDENCED`<br>`ESI_ACCIDENT_REPORTING_FACTS_MISSING`<br>`ESI_ACCIDENT_CAUSATION_SPECIALIST_REVIEW` |
| `feature.legal.esi.benefit-process-control` | `rule.legal.esi.benefit-process-control` | control-evidenced-verification-recommended, control-not-evidenced, more-information-needed, specialist-review-required, blocked-pending-legal-review | `ESI_BENEFIT_PROCESS_CONTROL_EVIDENCED`<br>`ESI_BENEFIT_PROCESS_CONTROL_NOT_EVIDENCED`<br>`ESI_BENEFIT_PROCESS_FACTS_MISSING`<br>`ESI_INDIVIDUAL_ENTITLEMENT_SPECIALIST_REVIEW` |
| `feature.legal.esi.medical-administration` | `rule.legal.esi.medical-administration` | more-information-needed, specialist-review-required, blocked-pending-legal-review | `ESI_MEDICAL_ADMINISTRATION_SOURCE_MISSING`<br>`ESI_STATE_IMPLEMENTATION_SPECIALIST_REVIEW`<br>`ESI_MEDICAL_RECORDS_PROHIBITED` |
| `feature.legal.esi.exemption` | `rule.legal.esi.exemption` | specialist-review-required, more-information-needed, blocked-pending-legal-review | `ESI_EXEMPTION_SPECIALIST_REVIEW`<br>`ESI_EXEMPTION_NOTIFICATION_MISSING`<br>`ESI_BENEFIT_COMPARISON_SPECIALIST_REVIEW` |
| `feature.legal.esi.enforcement-authority` | `rule.legal.esi.enforcement-authority` | specialist-review-required, more-information-needed, blocked-pending-legal-review | `ESI_ENFORCEMENT_CONTEXT_SPECIALIST_REVIEW`<br>`ESI_AUTHORITY_JURISDICTION_FACTS_MISSING`<br>`ESI_ORDER_AUTHENTICATION_SPECIALIST_REVIEW` |

All 15 proposed rules are placeholders for review only. Their decision fields are blank. They must not be added to the deterministic runtime catalogue or RAG routing registry as active capabilities.

## 6. Core legal boundaries

1. The Code on Social Security, 2020 and Social Security (Central) Rules, 2026 are the principal current central sources in this pack.
2. Rule 19 records ordinary rates of 3.25% employer and 0.75% employee contribution, but use remains subject to approved coverage, membership, wage basis and period logic.
3. No approved current Chapter IV wage-ceiling notification is in the pack. The product must not state or hard-code a ceiling amount.
4. S.O. 2351(E) addresses continuation after crossing a separately notified ceiling; it does not provide that ceiling.
5. The 1950 Central Rules are historical after supersession, except transition matters.
6. Use of the 1950 General Regulations for periods, due dates, registration, accident reporting, claims or benefits remains subject to saved-law review.
7. Area commencement, hazardous-occupation, State/UT administration and exemption questions require exact separately governed sources.
8. The other-beneficiaries medical-facilities scheme is ancillary and does not determine ordinary employer/employee ESI coverage.

## 7. Privacy and provider boundary

The following are prohibited from assessment facts, RAG chunks and explanation-provider payloads:

- names, contact details, Aadhaar, insurance numbers, PAN, bank details, portal credentials and identity images;
- employee-level wages, payslips, attendance, contribution histories, challans, returns and payroll ledgers;
- family composition, pregnancy information, diagnoses, disability records, medical certificates and claim evidence;
- accident narratives, witness details, injury or death records and investigation files;
- exemption files, notices, inspection reports, recovery documents, pleadings, legal opinions and dispute narratives.

Only approved organisation-level statuses, aggregate counts, bands, missing-fact IDs, registered source IDs and approved excerpts may be used after separate approvals.

## 8. Required decisions

The legal, privacy, RAG and release reviewers must expressly decide:

1. current-law, commencement, S.O. 2060(E) and section 164 treatment;
2. source completeness and saved-regulation use;
3. establishment, seasonal, hazardous, plantation, continuing and voluntary coverage;
4. area/benefit commencement and contribution-start sources;
5. employee insurance, current wage-ceiling source and S.O. 2351(E) continuation;
6. Rule 19 rate use, contractor controls and payment/return periods;
7. organisational benefit, accident and medical-administration boundaries;
8. exemption and enforcement-authority routing;
9. all 65 facts, allowed values, provenance, retention and evidence separation;
10. deterministic statuses, reason codes and specialist-review triggers;
11. exact RAG page scope, wording and prohibited claims;
12. tests, security, audit, release and separate runtime activation.

**Decision:** ☐ Approve ☐ Approve with conditions ☐ Modify ☐ Reject ☐ Defer  
**Conditions / replacement position:**  
**Reviewer / role:**  
**Decision date:**  
**Next review date or trigger:**  

## 9. Test and release gates

The implementation must fail closed when any source fingerprint, mapping, fact, privacy decision, legal decision, RAG approval or runtime approval is missing. It must also ensure:

- no threshold result from an incomplete branch-only count;
- no seasonal, hazardous or plantation route without approved classification and sources;
- no wage-ceiling result without an approved current notification;
- no S.O. 2351(E) continuation result without contribution-period timing facts;
- no use of historical Rule 50 or Rules 51–52 as current authority;
- no individual benefit, accident-causation, medical or exemption conclusion;
- no provider access to prohibited data;
- no retrieval or model override of deterministic outputs.

## 10. Final recorded state

- Legal review: **Needs legal review**
- Privacy review: **Needs privacy review**
- RAG approval: **Not approved**
- Assessment capture: **Disabled**
- Deterministic rules: **Not created**
- Governed chunks: **Not created**
- Endpoints and UI: **Not created**
- Runtime activation: **Blocked / false**

No production deterministic rule or RAG chunk is created by this packet.
