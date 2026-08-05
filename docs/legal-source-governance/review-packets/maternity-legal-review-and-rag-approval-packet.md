# Maternity Benefit — legal, privacy, RAG and release review packet

**Version:** 0.1.1  
**Prepared:** 5 August 2026  
**Submission status:** Submitted — awaiting completed reviewer decisions  
**Current legal status:** Needs legal review  
**Current privacy status:** Needs privacy review  
**Current RAG status:** Not approved  
**Runtime activation:** Blocked / false  
**Legal effect:** This repository companion is not legal advice, legal certification, RAG approval or permission to activate the feature.

> A blank decision is not approval. Submission, acknowledgement, informal discussion, partial review or an official source alone is not approval.

## 1. Purpose

This packet converts the controlled Maternity Benefit self-review, exact source identities, physical-page mapping and proposed Assessment Fact Contract into explicit legal, privacy, RAG, test and release decisions.

The reviewer must approve, approve with conditions, modify, reject or defer every proposed source, interpretation, fact group, rule family, provider boundary, retrieval scope, customer status and release gate. No production deterministic rule or RAG chunk is created by this packet.

## 2. Authority boundary

```text
assessment answers
→ privacy-minimised facts
→ deterministic legal-rule result
→ separately approved source retrieval
→ explanation-only provider
→ strict response validation
→ blocked/private-beta presentation until release approval
```

Deterministic rules are the only decision authority. Retrieval and an explanation provider may not create facts, determine applicability, alter a status or reason code, override missing information, expand source scope or certify compliance. The Feature Coverage Registry records readiness; it is not a second legal decision engine.

## 3. Controlled review materials

| Material | Controlled or repository path | Status |
|---|---|---|
| Source Register | `GrowWithHR-RAG/00-project-control/Source Register.xlsx` | Four central identities recorded |
| Legal Rule Audit | `GrowWithHR-RAG/GrowWithHR Legal Rule Audit.xlsx` | Maternity marked `Needs legal review` |
| Self-review | `GrowWithHR-RAG/01-source-documents/official/social-security/04-review/maternity-rule-self-review-updated.docx` | Internal research only |
| Assessment Fact Contract | `GrowWithHR-RAG/01-source-documents/official/social-security/04-review/maternity-assessment-fact-contract-v1.docx` | Proposed; not approved |
| Controlled approval packet | `GrowWithHR-RAG/01-source-documents/official/social-security/04-review/maternity-legal-review-and-rag-approval-packet-v1.docx` | Submitted; decisions pending |
| Repository mapping | `data/legal-source-governance/maternity-section-mapping.v1.json` | Draft; blocked |
| Repository fact contract | `data/assessment/maternity-assessment-fact-contract.v1.json` | Draft; capture disabled |
| Repository decision record | `data/legal-source-governance/maternity-legal-review-decision.v1.json` | Blank decision companion |

## 4. Controlled source inventory

| Source ID | Document | SHA-256 | Bytes | Pages |
|---|---|---|---:|---:|
| `social-security-code-2020` | Code on Social Security, 2020 | `53ad67f75fbc874fd837274e9e887fac7a21cc55c7454398b2cdb96046fd7967` | 1,020,695 | 113 |
| `social-security-central-rules-2026` | Social Security (Central) Rules, 2026 | `37c5a8cd8684e9362f86a1a72642174045a302234fa1918e8a73a30296b43878` | 3,856,046 | 259 |
| `social-security-code-commencement-so-5319e-2025` | S.O. 5319(E), 21 November 2025 | `014ba41eba2c0beda344bf084e1bed1d6f7f6929aabdbc7b4fa25fe22bce45c5` | 408,295 | 2 |
| `social-security-code-corrigendum-so-5936e-2025` | S.O. 5936(E), 19 December 2025 | `d14b088ef05a8f34c37d823b3b6fc6bd78a101e37882edc256d931e01e063a03` | 560,515 | 2 |

Every source remains `needs-legal-review` and `not-approved`. A changed or re-downloaded file requires a new hash, byte length, page count, mapping and review decision.

For each source, record whether the exact file is accepted, whether its physical pagination may be used, whether it is current for the proposed purpose, whether additional Central or State material is required, and whether any exact section may proceed to separate RAG approval.

## 5. Current-law, commencement and transition decisions

Proposed position:

1. Use Chapter VI of the Code on Social Security, 2020, with the First Schedule, relevant definitions and cross-cutting provisions, as the central Maternity Benefit basis.
2. Treat 21 November 2025 as the commencement date for sections 59–72 on the basis of S.O. 5319(E), subject to qualified confirmation.
3. Retain S.O. 5936(E) as a companion correction source; do not replace S.O. 5319(E).
4. Do not use the Maternity Benefit Act, 1961 as active current central retrieval authority. Retain legacy material only for transition, savings, historical events or State analysis.
5. Apply the Social Security (Central) Rules, 2026 only within the Central appropriate-Government sphere.
6. Do not infer State implementation from the Central Rules.
7. Require specialist review for saved State rules, notifications, appointments, orders, directions, accrued rights and transition questions under section 164.

**Decision:** ☐ Approve ☐ Approve with conditions ☐ Modify ☐ Reject ☐ Defer  
**Conditions / replacement position:**  
**Reviewer / role:**  
**Decision date:**  
**Next review date or trigger:**  

## 6. Physical-page mapping summary

| Source | Reference | Physical pages | Proposed purpose |
|---|---|---:|---|
| Code | Section 1(4), 1(8) | 8–9 | Chapter applicability and continuing coverage |
| Code | Section 2 selected definitions | 9–18 | Appropriate Government, establishment and related definitions |
| Code | Section 41(7)(b) | 40 | ESI overlap |
| Code | Sections 59–72 | 49–52 | Chapter VI substantive provisions |
| Code | Section 123 | 74–75 | Records, registers and returns |
| Code | Section 133 selected clauses | 80–81 | Penalty context; specialist review only |
| Code | Section 154 | 89–90 | Appropriate-Government rule-making |
| Code | Section 164 | 96–97 | Repeal and savings |
| Code | First Schedule, Chapter VI | 97–98 | Establishment coverage |
| Central Rules | Rules 35–40 | 177–181 | Notice, breaks, crèche, misconduct, complaints and inspection |
| Central Rules | Rule 53 | 195–196 | Register, records and annual return |
| Central Rules | Forms X–XIV | 217–223 | Blank official form structures only |
| Central Rules | Form XXII | 232 | Blank women-employee register structure only |
| Central Rules | Form XXIII | 233–244 | Blank unified annual-return structure only |
| Notification | S.O. 5319(E) | 1–2 | Commencement |
| Corrigendum | S.O. 5936(E) | 1–2 | Companion corrections |

Mapping is not legal approval and does not permit chunk creation.

## 7. Global decisions required

Record a decision, conditions, reviewer, date and re-review trigger for:

1. current-law, commencement, corrigendum and repeal-and-savings treatment;
2. Central-versus-State appropriate-Government treatment;
3. State-sphere rules and saved notifications, competent authorities, Inspector-cum-Facilitators and appeal authorities;
4. ESI overlap and transition under section 41(7)(b), section 61 and Chapter IV;
5. fact sufficiency, enum values, provenance, unknowns, conflicts and `not-applicable` handling;
6. restricted-fact collection, evidence storage, retention, access, logging and provider boundaries;
7. deterministic statuses, reason codes and specialist-review triggers;
8. customer-facing wording and prohibited claims;
9. exact source, section, Rule, form and notification scope permitted for RAG;
10. test, security, audit, release and review-cadence requirements.

## 8. Feature review sheets

### 8.1 Establishment coverage

- **Feature:** `feature.legal.maternity.establishment-coverage`
- **Proposed rule:** `rule.legal.maternity.establishment-coverage`
- **Question:** Does Chapter VI appear to cover the establishment after considering establishment type, current count, the preceding-twelve-month threshold, prior application and the correct appropriate Government?
- **Facts:** country, primary State, operating States, appropriate-Government sphere, establishment type, current employee count, preceding-twelve-month threshold status and prior Chapter VI coverage status.
- **Sources:** section 1(4), section 1(8), selected section 2 definitions, First Schedule Chapter VI, S.O. 5319(E) and S.O. 5936(E).
- **Proposed reason codes:** `MATERNITY_ESTABLISHMENT_COVERAGE_REVIEW_REQUIRED`, `MATERNITY_ESTABLISHMENT_COVERAGE_FACTS_MISSING`, `MATERNITY_CONTINUING_COVERAGE_REVIEW_REQUIRED`, `MATERNITY_APPROPRIATE_GOVERNMENT_REVIEW_REQUIRED`, `MATERNITY_STATE_MATERIAL_REVIEW_REQUIRED`.
- **Limitation:** Current employee count alone must not decide coverage.

### 8.2 Employee eligibility

- **Feature:** `feature.legal.maternity.employee-eligibility`
- **Proposed rule:** `rule.legal.maternity.employee-eligibility`
- **Question:** Do approved restricted facts support review of the section 60 workday condition without exposing individual evidence?
- **Facts:** workdays in the preceding twelve months and controlled event category.
- **Sources:** section 60(1)–(2), Rule 35, S.O. 5319(E) and S.O. 5936(E).
- **Proposed reason codes:** `MATERNITY_EMPLOYEE_ELIGIBILITY_REVIEW_REQUIRED`, `MATERNITY_EMPLOYEE_ELIGIBILITY_FACTS_MISSING`, `MATERNITY_EMPLOYEE_ELIGIBILITY_SPECIALIST_REVIEW`.
- **Limitation:** Do not determine final entitlement or payment from incomplete wage, employment-history or medical facts.

### 8.3 Benefit duration

- **Feature:** `feature.legal.maternity.benefit-duration-review`
- **Proposed rule:** `rule.legal.maternity.benefit-duration-review`
- **Question:** Do approved category bands support review of the applicable duration branch without collecting full family history?
- **Facts:** surviving-child-count band and event category.
- **Sources:** section 60(3), S.O. 5319(E) and S.O. 5936(E).
- **Proposed reason codes:** `MATERNITY_BENEFIT_DURATION_REVIEW_REQUIRED`, `MATERNITY_BENEFIT_CATEGORY_FACTS_MISSING`, `MATERNITY_BENEFIT_DURATION_SPECIALIST_REVIEW`.
- **Limitation:** Use only approved bands; do not collect names or detailed family histories.

### 8.4 Adopting and commissioning mother review

- **Feature:** `feature.legal.maternity.adopting-commissioning-mother-review`
- **Proposed rule:** `rule.legal.maternity.adopting-commissioning-mother-review`
- **Question:** Do approved status and age bands support a constrained category review without collecting adoption or surrogacy documents?
- **Facts:** adopting-mother status, commissioning-mother status, child-age band, work-from-home feasibility and agreement status.
- **Sources:** section 60(4)–(5), S.O. 5319(E) and S.O. 5936(E).
- **Proposed reason codes:** `MATERNITY_ADOPTING_MOTHER_REVIEW_REQUIRED`, `MATERNITY_COMMISSIONING_MOTHER_REVIEW_REQUIRED`, `MATERNITY_CHILD_AGE_FACTS_MISSING`, `MATERNITY_WORK_FROM_HOME_REVIEW_REQUIRED`.
- **Limitation:** Do not collect or transmit adoption documents, surrogacy records or child identity details.

### 8.5 Special-leave controls

- **Feature:** `feature.legal.maternity.miscarriage-tubectomy-illness-leave-review`
- **Proposed rule:** `rule.legal.maternity.miscarriage-tubectomy-illness-leave-review`
- **Question:** Are separate organisational controls evidenced for section 65 leave categories without collecting medical details?
- **Facts:** miscarriage, medical-termination, tubectomy and pregnancy-related-illness leave-control statuses.
- **Sources:** section 65, Rule 35, S.O. 5319(E) and S.O. 5936(E).
- **Proposed reason codes:** `MATERNITY_MISCARRIAGE_LEAVE_REVIEW_REQUIRED`, `MATERNITY_MEDICAL_TERMINATION_LEAVE_REVIEW_REQUIRED`, `MATERNITY_TUBECTOMY_LEAVE_REVIEW_REQUIRED`, `MATERNITY_RELATED_ILLNESS_LEAVE_REVIEW_REQUIRED`, `MATERNITY_SPECIAL_LEAVE_FACTS_MISSING`.
- **Limitation:** Collect process status only; never medical certificates, diagnoses, clinical narratives or procedure details.

### 8.6 Nursing breaks

- **Feature:** `feature.legal.maternity.nursing-break-review`
- **Proposed rule:** `rule.legal.maternity.nursing-break-review`
- **Question:** Are nursing-break policy, duration, journey-time and dispute controls evidenced separately from crèche controls?
- **Facts:** policy, duration, journey-time and dispute-process statuses.
- **Sources:** section 66, Rule 36, S.O. 5319(E) and S.O. 5936(E).
- **Proposed reason codes:** `MATERNITY_NURSING_BREAK_REVIEW_REQUIRED`, `MATERNITY_NURSING_BREAK_DURATION_REVIEW_REQUIRED`, `MATERNITY_NURSING_BREAK_FACTS_MISSING`.
- **Limitation:** Do not combine nursing-break and crèche thresholds or conclusions.

### 8.7 Crèche review

- **Feature:** `feature.legal.maternity.creche-review`
- **Proposed rule:** `rule.legal.maternity.creche-review`
- **Question:** Do approved organisation-level facts support review of the crèche threshold, facility controls and any allowance arrangement without certifying full compliance?
- **Facts:** employee count, threshold, facility, distance, space, sanitation, staffing, hours, feeding facilities, first aid, allowance arrangement and negotiating-union/council status.
- **Sources:** section 67, Rule 37, S.O. 5319(E) and S.O. 5936(E).
- **Proposed reason codes:** `MATERNITY_CRECHE_THRESHOLD_REVIEW_REQUIRED`, `MATERNITY_CRECHE_FACILITY_REVIEW_REQUIRED`, `MATERNITY_CRECHE_ALLOWANCE_REVIEW_REQUIRED`, `MATERNITY_CRECHE_FACTS_MISSING`.
- **Limitation:** A room labelled “crèche” is not sufficient evidence of all required controls.

### 8.8 Notice, payment, records and returns

- **Feature:** `feature.legal.maternity.notice-payment-records-review`
- **Proposed rule:** `rule.legal.maternity.notice-payment-records-review`
- **Question:** Are organisation controls evidenced for notice, nomination, payment, medical bonus, employee information, complaints, display, register, retention and annual return?
- **Facts:** process-status fields only; no form contents, individual amounts or identity data.
- **Sources:** sections 62–64, 71–72 and 123; Rules 35, 39, 40 and 53; Forms X–XIV, XXII and XXIII; S.O. 5319(E) and S.O. 5936(E).
- **Proposed reason codes:** `MATERNITY_NOTICE_PROCESS_REVIEW_REQUIRED`, `MATERNITY_PAYMENT_CONTROL_REVIEW_REQUIRED`, `MATERNITY_MEDICAL_BONUS_REVIEW_REQUIRED`, `MATERNITY_EMPLOYEE_INFORMATION_REVIEW_REQUIRED`, `MATERNITY_COMPLAINT_PROCESS_REVIEW_REQUIRED`, `MATERNITY_INSPECTION_READINESS_REVIEW_REQUIRED`, `MATERNITY_REGISTER_REVIEW_REQUIRED`, `MATERNITY_RECORD_RETENTION_REVIEW_REQUIRED`, `MATERNITY_ANNUAL_RETURN_REVIEW_REQUIRED`, `MATERNITY_PROCESS_FACTS_MISSING`.
- **Limitation:** Completed forms, names, nominees, bank details, medical dates and claim documents are excluded from RAG and provider payloads.

### 8.9 Employment protection

- **Feature:** `feature.legal.maternity.employment-protection-review`
- **Proposed rule:** `rule.legal.maternity.employment-protection-review`
- **Question:** Are controls evidenced for protected work periods, arduous-work requests, dismissal, deprivation, deductions, forfeiture and appeal, with individual disputes routed to specialist review?
- **Facts:** protected-period, arduous-work, policy, dismissal-review, gross-misconduct, appeal, wage-deduction and forfeiture control statuses.
- **Sources:** section 59, sections 68–70, Rule 38, S.O. 5319(E) and S.O. 5936(E).
- **Proposed reason codes:** `MATERNITY_PROTECTED_PERIOD_REVIEW_REQUIRED`, `MATERNITY_ARDUOUS_WORK_CONTROL_REVIEW_REQUIRED`, `MATERNITY_EMPLOYMENT_PROTECTION_REVIEW_REQUIRED`, `MATERNITY_DISMISSAL_PROCESS_REVIEW_REQUIRED`, `MATERNITY_GROSS_MISCONDUCT_REVIEW_REQUIRED`, `MATERNITY_WAGE_DEDUCTION_REVIEW_REQUIRED`, `MATERNITY_FORFEITURE_REVIEW_REQUIRED`, `MATERNITY_EMPLOYMENT_PROTECTION_FACTS_MISSING`.
- **Limitation:** Do not adjudicate a dismissal, misconduct allegation or individual dispute.

### 8.10 ESI overlap

- **Feature:** `feature.legal.maternity.esi-overlap-review`
- **Proposed rule:** `rule.legal.maternity.esi-overlap-review`
- **Question:** Do approved restricted statuses support review of the Chapter IV and Chapter VI route without relying on ESI registration alone?
- **Facts:** ESI coverage, actual maternity-benefit eligibility, existing Chapter VI entitlement and transition-date status.
- **Sources:** section 41(7)(b), section 61, S.O. 5319(E) and S.O. 5936(E).
- **Proposed reason codes:** `MATERNITY_ESI_OVERLAP_REVIEW_REQUIRED`, `MATERNITY_ESI_ELIGIBILITY_FACTS_MISSING`, `MATERNITY_ESI_TRANSITION_REVIEW_REQUIRED`.
- **Limitation:** No insurance number, contribution history, claim document or medical evidence may enter retrieval or provider payloads.

For every feature sheet above record: reviewer decision, approved facts, approved statuses, approved reason codes, exact approved source scope, conditions, specialist-review triggers, customer wording approval, privacy approval, reviewer identity, decision date and next review trigger.

## 9. Assessment Fact Contract decision

The repository fact contract contains organisation-level controls and restricted individual status facts. It does not activate assessment capture.

Contract-wide rules proposed for review:

- unknown and conflict values remain available;
- no silent default converts an unknown into a favourable or unfavourable result;
- `not-applicable` is used only after an approved prior condition;
- restricted facts remain inside the deterministic boundary;
- evidence is stored separately from RAG and provider payloads;
- provenance distinguishes self-reported, document-verified, system-derived and reviewer-confirmed values;
- any fact ID, type, enum, privacy class, dependency or provider-handling change requires a new contract version and tests.

**Decision:** ☐ Approve ☐ Approve with conditions ☐ Modify ☐ Reject ☐ Defer  
**Conditions / replacement requirements:**  
**Reviewer / role:**  
**Decision date:**  

## 10. Privacy and provider boundary

Prohibited from RAG, provider prompts and provider-visible logs:

- names, addresses and contact details;
- medical certificates, diagnoses, clinical narratives and procedure details;
- exact expected-delivery, delivery, miscarriage or other medical-event dates;
- child details, adoption documents and surrogacy records;
- ESI identifiers, contribution histories and claim documents;
- nominee details, bank data, payment instructions, signatures and thumb impressions;
- completed Forms X–XIII, XXII or XXIII;
- disciplinary evidence, allegation narratives, dispute files and individual case records;
- raw assessment answers and uploaded evidence bodies.

A future provider payload may contain only the validated deterministic status, deterministic reason code, approved citation chunks and fingerprints, non-identifying missing-fact IDs, and mandatory limitations.

**Privacy decision:** ☐ Approve ☐ Approve with conditions ☐ Modify ☐ Reject ☐ Defer  
**Conditions:**  
**Reviewer / role:**  
**Decision date:**  

## 11. RAG source-scope decision

No source row may produce a chunk until the exact source identity, reference, page range, permitted excerpt, permitted reason-code scope, retrieval terms, customer-citation permission, legal decision, RAG approval, content fingerprint and runtime-profile status are recorded.

Completed forms and individual evidence are always excluded. Blank form structures may be considered only if separately approved.

**RAG decision:** ☐ Approve ☐ Approve with conditions ☐ Modify ☐ Reject ☐ Defer  
**Approved source and section scope:**  
**Conditions:**  
**Reviewer / role:**  
**Decision date:**  

## 12. Customer statuses and prohibited wording

Proposed statuses are `outside-current-india-law-scope`, `more-information-needed`, `specialist-review-required`, `coverage-indicated-review-required`, `control-not-evidenced` and `control-evidenced-verification-recommended`.

Prohibited wording includes:

- fully compliant or legally compliant;
- violation confirmed or penalty payable;
- employee definitely entitled or employee not entitled;
- dismissal lawful or unlawful;
- ESI route conclusively applies where eligibility or transition facts are unresolved;
- wording implying that retrieval or a language model made or verified the legal decision.

**Wording decision:** ☐ Approve ☐ Approve with conditions ☐ Modify ☐ Reject ☐ Defer  
**Approved statuses and exact wording:**  
**Conditions:**  
**Reviewer / role:**  
**Decision date:**  

## 13. Test, audit and release gates

Before activation, evidence must show that:

1. changed hashes, byte lengths, paths, page counts and unregistered PDFs are rejected;
2. unknown fact IDs, invalid enums, negative counts, unsafe defaults and unresolved conflicts are rejected;
3. every feature has missing-information and specialist-review scenarios;
4. threshold, prior coverage, workday, category, crèche and ESI boundaries are tested;
5. provider payloads contain no raw answers, restricted facts, evidence, names, medical information or completed forms;
6. retrieval and provider output cannot alter deterministic status, reason code, missing facts or source scope;
7. every citation maps to an approved chunk and exact source fingerprint;
8. the provider is never called while the profile or approvals are blocked;
9. audit logs contain rule ID, version, reason code, fingerprints and non-sensitive provenance only;
10. Feature Coverage Registry, controlled records and repository state agree;
11. stable report, PDF, email and browser-storage contracts remain unchanged unless separately approved;
12. release and runtime activation are independently approved.

## 14. Additional source and specialist actions

Open items:

- State-sphere rules and saved notifications for every supported State;
- competent-authority, Inspector-cum-Facilitator and appeal-authority appointments;
- current portal and Form XXIII filing instructions;
- current monetary notifications or prescribed amounts needed for any calculation feature;
- qualified ESI overlap and transition interpretation;
- legacy sources needed for saved or pre-commencement events;
- approved customer wording, review cadence and event-driven re-review triggers.

## 15. Final approval record

| Approval area | Decision | Reviewer / role | Date | Conditions or reference |
|---|---|---|---|---|
| Qualified legal review |  |  |  |  |
| State / jurisdiction review |  |  |  |  |
| Privacy and data-protection review |  |  |  |  |
| RAG source and chunk approval |  |  |  |  |
| Deterministic rule approval |  |  |  |  |
| Assessment Fact Contract approval |  |  |  |  |
| Customer wording approval |  |  |  |  |
| Security and logging approval |  |  |  |  |
| Test evidence approval |  |  |  |  |
| Release / runtime activation approval |  |  |  |  |

**Overall outcome:** ☐ Approved for implementation ☐ Approved with conditions ☐ Changes required ☐ Rejected ☐ Deferred  
**Permitted feature IDs:**  
**Permitted rule IDs:**  
**Permitted source and section scope:**  
**Permitted customer statuses:**  
**Conditions enforced in code:**  
**Next review date:**  
**Immediate re-review triggers:** source hash change; amendment; new notification; State-source change; fact-contract change; provider or retrieval change; security or privacy incident.

## 16. Current gate

```text
Legal approval: Not granted
Privacy approval: Not granted
RAG approval: Not approved
Deterministic production rules: Not created
Production RAG chunks: Not created
Runtime activation: Blocked / false
```
