# PF/EPF — legal, privacy, RAG and release review packet

**Version:** 0.1.0  
**Prepared:** 5 August 2026  
**Submission status:** Draft — not submitted  
**Legal review:** Needs legal review  
**Privacy review:** Needs privacy review  
**RAG approval:** Not approved  
**Assessment capture:** Disabled / false  
**Runtime activation:** Blocked / false

> A blank decision is not approval. Preparation, circulation, acknowledgement, internal self-review or the presence of an official source is not approval.

## Purpose and authority boundary

This repository packet mirrors the controlled PF/EPF Drive materials. It creates governance companions only.

```text
approved assessment design
→ privacy-minimised facts
→ approved deterministic rule
→ separately approved source retrieval
→ explanation-only provider
→ runtime only after release approval
```

No production deterministic rule or RAG chunk is created by this packet. Retrieval and a language model may not create facts, determine applicability, select a contribution rate, calculate an amount, change a status or reason code, fill missing facts, or expand source scope.

## Controlled materials

| Material | Path |
|---|---|
| Source Register | `GrowWithHR-RAG/00-project-control/Source Register.xlsx` |
| Self-review | `GrowWithHR-RAG/01-source-documents/official/social-security/04-review/pf-epf-rule-self-review-v1.docx` |
| Controlled fact contract | `GrowWithHR-RAG/01-source-documents/official/social-security/04-review/pf-epf-assessment-fact-contract-v1.docx` |
| Controlled approval packet | `GrowWithHR-RAG/01-source-documents/official/social-security/04-review/pf-epf-legal-review-and-rag-approval-packet-v1.docx` |
| Repository fact contract | `data/assessment/pf-epf-assessment-fact-contract.v1.json` |
| Repository mapping | `data/legal-source-governance/pf-epf-section-mapping.v1.json` |
| Repository decision record | `data/legal-source-governance/pf-epf-legal-review-decision.v1.json` |

## Exact controlled source baseline

| Source ID | Document | SHA-256 | Bytes | Pages |
|---|---|---|---:|---:|
| `social-security-code-2020` | Code on Social Security, 2020 | `53ad67f75fbc874fd837274e9e887fac7a21cc55c7454398b2cdb96046fd7967` | 1,020,695 | 113 |
| `social-security-central-rules-2026` | Social Security (Central) Rules, 2026 | `37c5a8cd8684e9362f86a1a72642174045a302234fa1918e8a73a30296b43878` | 3,856,046 | 259 |
| `social-security-code-commencement-so-5319e-2025` | S.O. 5319(E), 21 November 2025 | `014ba41eba2c0beda344bf084e1bed1d6f7f6929aabdbc7b4fa25fe22bce45c5` | 408,295 | 2 |
| `social-security-code-corrigendum-so-5936e-2025` | S.O. 5936(E), 19 December 2025 | `d14b088ef05a8f34c37d823b3b6fc6bd78a101e37882edc256d931e01e063a03` | 560,515 | 2 |
| `employees-provident-funds-scheme-2026` | Employees’ Provident Funds Scheme, 2026 | `4e062db5bf5d8b904ae1c0d4af10950dc01de7df8360398dfe197d6d06aef489` | 2,510,370 | 129 |
| `employees-pension-scheme-2026` | Employees’ Pension Scheme, 2026 | `6bd9d6fb82a1e0e6efcc6dff3901485aaf101dd621a68b8592409585e18a6592` | 1,324,116 | 83 |
| `employees-deposit-linked-insurance-scheme-2026` | Employees’ Deposit-Linked Insurance Scheme, 2026 | `a4a61bcf182dcaab026ad49ab50044d088f91930b9967494ac559054daecc957` | 1,022,320 | 22 |
| `social-security-wage-ceiling-so-2702e-2026` | S.O. 2702(E), 29 May 2026 — Chapter III wage ceiling | `62dbc6c22949eed3ccd0cde11488312c4db4480623078254a558770d14cb3893` | 946,569 | 2 |

Every source remains `needs-legal-review` and `not-approved`. A changed identity requires re-verification, mapping review and re-approval.

## Preserved blockers

1. The exact official Gazette file for S.O. 320(E), dated 9 April 1997, was not obtained.
2. Applicability of the 10% or 12% contribution rate requires qualified legal review.
3. The current EDLI contribution-rate authority requires confirmation.
4. Transition and savings treatment requires legal review.
5. S.O. 2060(E), dated 3 May 2023, is referenced in the commencement sequence but is not in the controlled pack.
6. Exemption, international-worker, social-security-agreement, higher-pension, historical and spanning-period matters remain specialist-review paths.

These blockers prohibit automatic rate selection, employee-level contribution calculations, EDLI amount calculations, higher-pension conclusions and historical-liability conclusions.

## Proposed review families

| Feature | Proposed rule | Facts | Recorded physical-page scope |
|---|---|---:|---|
| `feature.legal.epf.establishment-coverage` | `rule.legal.epf.establishment-coverage` | 15 | social-security-code-2020 8–19 (Sections 1–3 and selected definitions); social-security-code-2020 97–97 (First Schedule, Chapter III); employees-provident-funds-scheme-2026 66–68 (Notification, paragraph 1 and definitions) |
| `feature.legal.epf.member-inclusion` | `rule.legal.epf.member-inclusion` | 14 | social-security-code-2020 9–19 (Section 2 selected definitions); employees-provident-funds-scheme-2026 66–70 (Definitions and paragraphs 9–11) |
| `feature.legal.epf.wage-ceiling` | `rule.legal.epf.wage-ceiling` | 8 | social-security-code-2020 9–19 (Section 2(89) wage ceiling definition); social-security-wage-ceiling-so-2702e-2026 1–2 (Chapter III wage-ceiling notification); employees-provident-funds-scheme-2026 75–78 (Paragraph 18) |
| `feature.legal.epf.contribution-rate-source` | `rule.legal.epf.contribution-rate-source` | 6 | social-security-code-2020 27–31 (Section 16 and Chapter III contribution framework); employees-provident-funds-scheme-2026 75–78 (Paragraph 18 contribution rates) |
| `feature.legal.epf.monthly-contribution-control` | `rule.legal.epf.monthly-contribution-control` | 13 | social-security-code-2020 27–31 (Sections 16–17); employees-provident-funds-scheme-2026 75–82 (Paragraphs 18–30) |
| `feature.legal.epf.contractor-control` | `rule.legal.epf.contractor-control` | 5 | social-security-code-2020 27–31 (Section 17 contractor contributions); employees-provident-funds-scheme-2026 75–82 (Paragraphs 20 and 27) |
| `feature.legal.epf.exemption-review` | `rule.legal.epf.exemption-review` | 5 | social-security-code-2020 85–87 (Section 143); social-security-central-rules-2026 203–205 (Section 143-related exemption rules); employees-provident-funds-scheme-2026 70–75 (Paragraphs 12–17) |
| `feature.legal.epf.international-worker-review` | `rule.legal.epf.international-worker-review` | 4 | employees-provident-funds-scheme-2026 66–70 (Definitions, membership and international-worker provisions); employees-provident-funds-scheme-2026 87–95 (International-worker withdrawal and payment provisions); employees-pension-scheme-2026 58–60 (Paragraph 36) |
| `feature.legal.eps.membership-routing` | `rule.legal.eps.membership-routing` | 11 | social-security-code-2020 27–31 (Section 16(1)(b)); employees-pension-scheme-2026 43–47 (Paragraphs 1–8) |
| `feature.legal.eps.pension-control` | `rule.legal.eps.pension-control` | 11 | employees-pension-scheme-2026 47–58 (Paragraphs 9–29) |
| `feature.legal.edli.coverage-control` | `rule.legal.edli.coverage-control` | 10 | social-security-code-2020 27–31 (Section 16(1)(c)); employees-deposit-linked-insurance-scheme-2026 12–18 (Paragraphs 1–25) |
| `feature.legal.epf.records-returns` | `rule.legal.epf.records-returns` | 12 | social-security-code-2020 73–75 (Sections 122–123); employees-provident-funds-scheme-2026 78–82 (Paragraphs 24–30); employees-pension-scheme-2026 56–58 (Paragraphs 18–29); employees-deposit-linked-insurance-scheme-2026 14–18 (Paragraphs 7–25) |

All proposed statuses, reason codes and source scopes remain unapproved. The JSON companions retain the complete proposed status and reason-code lists.

## Privacy boundary

RAG and provider payloads must never contain raw assessment answers, names, contact details, UANs, Aadhaar or PAN values, passport details, bank details, employee-level wages, payroll line items, contribution histories, ECR bodies, nominee or family details, disability information, claim documents, exemption or trust records, social-security-agreement documents, certificate-of-coverage bodies or evidence bodies.

A future provider payload may contain only an immutable approved deterministic status and reason code, non-identifying missing-fact IDs, approved aggregate/control summaries, approved citation chunks and mandatory limitations.

## Decisions required

Authorised reviewers must explicitly decide:

- current-law, commencement, supersession, transition and savings treatment;
- establishment aggregation, prior coverage and exceptions;
- membership, excluded-employee, apprentice and wage-ceiling treatment;
- the exact controlling source for each 10% or 12% branch;
- EPS routing, higher-wage pension and EDLI authority;
- contractor, exemption and international-worker treatment;
- all 60 proposed facts and privacy classifications;
- each source mapping, status, reason code and wording pattern;
- RAG excerpts, citation requirements and retrieval isolation;
- deterministic, privacy, security, CI and release gates.

## Mandatory blocked state

- `legalReviewStatus = needs-legal-review`
- `privacyReviewStatus = needs-privacy-review`
- `ragApprovalStatus = not-approved`
- `assessmentCapture = false`
- `runtimeActivation = false`

No active deterministic rules, governed chunks, source-pack manifest, active RAG profile, endpoint, UI, report, PDF or email output is authorised by this batch.
