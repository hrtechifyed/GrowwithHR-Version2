# Remaining POSH duties — limited-scope legal review packet

**Prepared:** 4 August 2026  
**Status:** Awaiting qualified legal review  
**Legal status:** This packet is not legal advice, legal approval, or product approval.  
**Runtime effect:** None. It does not activate assessment capture, deterministic rules, governed chunks, retrieval, explanation, endpoints, UI, reports, PDFs, emails, or storage changes.

## 1. Review objective

Record a qualified legal review decision for the six remaining POSH feature families using the governed source baseline, draft section map, proposed fact contract, privacy boundaries, statuses, reason codes, and customer-wording limitations already present in the repository.

The reviewer is not being asked to certify GrowWithHR or declare an organisation compliant. The reviewer is being asked to determine whether each proposed product review question and source scope is suitable for a constrained deterministic review, and to record any conditions, exclusions, missing sources, missing facts, specialist-review triggers, and re-review requirements.

## 2. Authority boundary

The product boundary must remain:

```text
Assessment answers
→ deterministic fact mapping
→ deterministic legal-rule result
→ approved source retrieval
→ explanation-only provider
→ strict response validation
→ private-beta presentation
```

Retrieval and an explanation provider must never create missing facts, decide applicability, change a deterministic status, or override a reason code. A source being official does not by itself approve a product interpretation.

## 3. Controlled review materials

Review the exact controlled Drive files and registers together with these repository companions:

| Material | Controlled or repository path | Current status |
|---|---|---|
| Source Register | `GrowWithHR-RAG/00-project-control/Source Register.xlsx` | Controlled Drive source of truth; exact live master must be confirmed |
| Legal Feature Review Register | `GrowWithHR-RAG/00-project-control/Legal Feature Review Register.xlsx` | Controlled decision register; reviewer decision must be recorded here |
| Section Mapping | Controlled Drive workbook plus `data/legal-source-governance/posh-section-mapping.v1.json` | Draft; three Rules mappings await exact controlled-file hash verification |
| Fact and privacy contract | `data/assessment/posh-assessment-fact-contract.v1.json` | Draft; 35 facts; no runtime mapping or capture |
| Rules page observation | `data/legal-source-governance/posh-rules-page-verification.v1.json` | Official PDF pages observed; controlled Drive hash still pending |
| Governed POSH source catalogue | `growwithhr-rag/data/posh-source-chunks.v1.json` | Existing POSH threshold catalogue; all sources remain `needs-legal-review` |
| Decision record | `data/legal-source-governance/remaining-posh-legal-review-decision.v1.json` | Blank repository companion; not a substitute for the controlled Drive register |

## 4. Source baseline

The limited review uses the three existing stable Source IDs. The reviewer must confirm the exact controlled Drive files and current-law position before approving any source or section scope.

| Source ID | Registered file | SHA-256 | Pages |
|---|---|---|---:|
| `posh-act-2013` | `posh-act-2013-official-indiacode.pdf` | `e59776d9ce4300c35acb8f3ed8150b33c18a77b5b553423ef9f1c69dbd144475` | 14 |
| `posh-rules-2013` | `posh-rules-2013-official-indiacode.pdf` | `d372e3dbc83f1f960ed9d4c9f2204eac2f716c70688a8e299c75e03753c8f09d` | 6 |
| `posh-commencement-2013` | `posh-commencement-notification-so-3606e-official-gazette.pdf` | `87c595e66e29e803ae3dc38ce5d2cb510038e5d95ff8d2d5be7f4341bcfa91e5` | 1 |

### Rules physical-PDF page observations

The registered Rules PDF is bilingual. Hindi Gazette text occupies physical PDF pages 1–3 and English Gazette text occupies physical PDF pages 4–6.

| Reference | Observed physical PDF pages | Current gate |
|---|---:|---|
| Rule 3 | 4 | Official PDF page observed; exact controlled Drive hash pending |
| Rules 6–12 | 4–6 | Official PDF pages observed; exact controlled Drive hash pending |
| Rule 14 | 6 | Official PDF page observed; exact controlled Drive hash pending |

Run the read-only exact-file gate before updating the controlled section map:

```bash
npm run verify:posh-rules-page-gate -- /absolute/path/to/GrowWithHR-RAG
```

## 5. Mandatory global decisions

Record a decision, conditions, reviewer, review date, and next-review trigger for each item.

1. **Current law and supersession:** Are the registered Act, Rules and commencement notification current and sufficient for this limited review scope? Identify any amendment, notification, state variation, official guidance, replacement, or uncertainty that changes the scope.
2. **2016 terminology-amendment record:** The expansion plan identifies an unregistered 2016 POSH terminology-amendment record. Decide whether it must be verified and added to the governed pack or remain excluded. Record the reason and exact official source if inclusion is required.
3. **Fact sufficiency:** Are the 35 proposed facts sufficient, necessary, appropriately typed, and separated by organisation, location, office, or administrative unit?
4. **Status model:** Are `review-required`, `more-information-needed`, and `specialist-review` suitable for each feature? Identify any status that must be added, removed, or narrowed.
5. **Reason-code model:** Approve, condition, or reject each proposed reason-code family. Reason codes must not imply certification or final legal approval.
6. **Privacy boundary:** Confirm that complaint narratives, names, allegations, case evidence, findings, case-level statistics, raw assessment answers, and evidence document bodies remain prohibited from any explanation-provider payload.
7. **Customer wording:** Confirm the wording limits needed to avoid certification, guaranteed compliance, legal approval, or unsupported conclusions.
8. **Review cadence:** State the next review date and event-driven triggers, including amendments, notifications, source hash changes, assessment-fact changes, provider changes, or customer-wording changes.

## 6. Feature review sheets

### 6.1 POSH policy review

- **Feature ID:** `feature.legal.posh.policy-review`
- **Proposed rule ID:** `rule.legal.posh.policy-review`
- **Proposed source scope:** Section 19; Rule 13(a); commencement notification
- **Proposed facts:** 6
- **Question for review:** May this source scope support a deterministic evidence-based review of policy existence, issue date, role ownership, coverage, dissemination evidence, and review evidence without claiming that a policy is legally approved or fully compliant?

Reviewer decisions:

- Confirm whether Section 19 and Rule 13(a) are sufficient for the proposed product question.
- State whether any amendment or official guidance is required.
- Define safe interpretations of policy existence, coverage, dissemination, and review evidence.
- State whether a date or review cadence may be evaluated and, if so, on what source basis.
- Approve or revise missing-information and specialist-review triggers.
- Approve or revise the customer-wording limitation.

### 6.2 POSH awareness and training review

- **Feature ID:** `feature.legal.posh.awareness-training-review`
- **Proposed rule ID:** `rule.legal.posh.awareness-training-review`
- **Proposed source scope:** Section 19(c); Rule 13(b)–(f); commencement notification
- **Proposed facts:** 4
- **Question for review:** May this source scope support deterministic review of employee awareness, Internal Committee orientation, and capacity-building evidence without treating attendance evidence alone as proof of legal sufficiency or quality?

Reviewer decisions:

- Confirm the exact duties and whether the product may evaluate only evidence presence or also cadence and coverage.
- State whether official modules or guidance are required sources.
- Define when evidence is insufficient and must return `more-information-needed`.
- Define circumstances requiring `specialist-review`.
- Approve or revise the prohibition on training-quality certification.

### 6.3 POSH notice and display review

- **Feature ID:** `feature.legal.posh.notice-display-review`
- **Proposed rule ID:** `rule.legal.posh.notice-display-review`
- **Proposed source scope:** Section 19(b); Rule 13(e); commencement notification
- **Proposed facts:** 4
- **Question for review:** May this source scope support per-location review of display evidence without generalising evidence from one location to all offices or administrative units?

Reviewer decisions:

- Confirm the required display subjects and whether Rule 13(e) belongs in the display review, another feature, or both.
- Define the correct location, office, administrative-unit, divisional, or sub-divisional scope.
- Confirm whether member contact details may be represented only as a control-presence status, not transmitted details.
- Define incomplete-location and missing-unit outcomes.
- Approve or revise the per-location wording limitation.

### 6.4 POSH complaint mechanism and records review

- **Feature ID:** `feature.legal.posh.complaint-mechanism-records-review`
- **Proposed rule ID:** `rule.legal.posh.complaint-mechanism-records-review`
- **Proposed source scope:** Sections 9–18; Rules 6–12; commencement notification
- **Proposed facts:** 6
- **Question for review:** May this source scope support a control-only review of complaint routes, process ownership, timeline controls, confidentiality controls, record-retention controls, and the complaint-against-employer route without collecting, processing, retrieving, or transmitting case content?

Reviewer decisions:

- Confirm the product may evaluate control presence without evaluating an individual complaint or outcome.
- Confirm the exact timelines or determine whether the product should record only that timeline controls exist until a separate legally reviewed model is approved.
- Confirm complaint-against-employer routing and any Local Committee dependencies.
- Determine whether record-retention is supported by the proposed source scope or requires an additional official source or narrower wording.
- Approve the prohibition on complaint narratives, names, allegations, evidence, findings, and case-level statistics.
- Define mandatory `specialist-review` triggers.

### 6.5 POSH Internal Committee composition and unit review

- **Feature ID:** `feature.legal.posh.internal-committee-composition-unit-review`
- **Proposed rule ID:** `rule.legal.posh.internal-committee-composition-unit-review`
- **Proposed source scope:** Section 4(1)–(2); Rule 3; commencement notification
- **Proposed facts:** 8
- **Question for review:** May this source scope support deterministic review of committee composition and office or administrative-unit coverage without inferring unit facts from total company headcount or one committee record?

Reviewer decisions:

- Confirm the correct member roles, eligibility conditions, composition requirements, women-member requirement, tenure considerations, and external-member requirements to be represented.
- Confirm whether Rule 3 is relevant only to external-member fees or affects the proposed composition question more broadly.
- Define the office, administrative-unit, divisional, and sub-divisional coverage model.
- Confirm whether workers must be counted by unit and which worker categories must be included.
- Approve role-only references and prohibit personal names from explanation payloads.
- Define missing-unit, incomplete-composition, and specialist-review outcomes.

### 6.6 POSH annual reporting review

- **Feature ID:** `feature.legal.posh.annual-reporting-review`
- **Proposed rule ID:** `rule.legal.posh.annual-reporting-review`
- **Proposed source scope:** Sections 21–22; Rule 14; commencement notification
- **Proposed facts:** 7
- **Question for review:** May this source scope support privacy-safe review of annual-report preparation and submission using only reporting-year metadata, control-presence indicators, and aggregate evidence?

Reviewer decisions:

- Confirm the report preparation and submission duties and relevant recipients.
- Confirm the permitted annual-report evidence fields.
- Determine whether aggregate complaint or action information may be represented only as present/not-present or whether approved aggregate counts may be used later.
- Confirm no names, allegations, evidence, findings, or case narratives may enter retrieval or provider payloads.
- Define missing-year, missing-submission, incomplete-content, and specialist-review outcomes.

## 7. Decision recording rules

Allowed legal-review decisions are:

- `approved`
- `reviewed-with-conditions`
- `rejected`

A blank decision is not approval. `Reviewed-with-conditions` must list every condition and identify which source, section, fact, status, reason code, privacy rule, or wording rule it affects.

For each approved or conditionally approved feature, record:

- reviewer or controlled reviewer reference;
- review date;
- next review date and event-driven triggers;
- exact approved Source IDs and file hashes;
- exact approved sections and physical PDF pages;
- approved fact IDs and any required changes;
- approved deterministic statuses and reason codes;
- approved customer wording and prohibited claims;
- approved privacy boundary;
- whether the feature may proceed to deterministic rule design;
- whether the exact source scope may proceed to RAG approval review.

## 8. Release boundary after review

Legal review alone does not activate a feature. After a recorded legal decision, each feature must still pass:

1. exact controlled Drive identity and hash gate;
2. controlled Source Register and section-map update;
3. fact sufficiency and assessment-design approval;
4. deterministic rule and missing-information tests;
5. exact-file and section-level RAG approval;
6. governed chunk and retrieval tests;
7. provider and response-validation tests;
8. privacy and customer-wording tests;
9. endpoint and private-beta UI tests;
10. full repository and browser regressions;
11. Drive, registry, and GitHub status alignment.

The stable report, PDF, email, and browser-storage contracts remain unchanged unless separately approved.
