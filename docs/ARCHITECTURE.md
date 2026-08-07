# GrowWithHR Architecture

## Deployment decision

The production application is the root-level static HTML/CSS/JavaScript site. `server.js` supplies optional delivery and explanation APIs, while `server-entry.js` is the CORS-aware production entrypoint used by Render. `apps/web/src` remains an archived experimental React/TypeScript UX layer and is not part of the deployed build.

## Public architecture

1. `index.html` presents the product and links to `analyze-company.html`.
2. Stable assessment modules validate answers and persist same-browser progress under protected keys.
3. Presentation modules enrich the report experience without changing compliance applicability logic.
4. The stable report mapper prepares the advisory record.
5. `js/pdf.js` and `js/pdf-polish.js` render the deterministic advisory model as a browser-generated PDF.
6. `executive-advisory-report.html` consumes the same enriched advisory model.
7. Email delivery uses a data-minimised request only when requested.
8. `server-entry.js` applies exact-origin CORS controls and delegates protected API routes.

The approved cross-origin client is `https://hrtechifyed.github.io`. Additional approved origins may be supplied through `ALLOWED_CORS_ORIGINS`; wildcard origins are not used.

## Private-beta architecture

`/analyze-company-v3.html` is no-index and disabled from public routing by default. Its Compliance DNA modules consume protected assessment answers through compatibility adapters and produce isolated traceability, legal-review and workspace output without changing stable report, PDF, email or delivery contracts.

The v3 route mounts the POSH, Maternity Benefit, EPF Waves 3A–3C, ESI Waves 4A–4D, Appropriate Government Wave 5A, Maharashtra Shops Wave 5B, Code on Wages Wave 5C, Gratuity Wave 5D, Employee's Compensation Wave 5E, OSHWC Wave 5F, Industrial Relations Wave 5G, Apprentices Wave 5H and Child and Adolescent Labour Wave 5I review surfaces.

All legal-review panels submit only after explicit user action. Their inputs and results are not written to browser storage and are not inserted into the stable report, PDF or email.

## Protected browser keys

- `growwithhr-advisory-briefing-v2`
- `growwithhr-report`
- `growwithhr-lead`
- `growwithhr-advisory-delivery-v1`
- `growwithhr-industry-catalog-v1`
- `growwithhr-report-theme` — presentation preference only

Feature-flag overrides use the documented `growwithhr-feature-` prefix and are not assessment records.

## Compliance decision and governed RAG architecture

```text
assessment answers
→ deterministic fact mapper
→ deterministic rule evaluator
→ immutable decision
→ legal RAG profile resolver
→ governed catalogue retrieval
→ explanation-only provider
→ strict response validation
```

The deterministic rule owns status, reason code, missing facts and source scope. Retrieval has `applicabilityAuthority: none` and `usedForDecision: false`. Provider output must preserve the decision fingerprint, status, reason code and citation scope and may never fill missing assessment facts.

## Runtime coverage

The Wave 5I stacked private-beta registry exposes 57 callable profiles:

- seven POSH;
- ten Maternity Benefit;
- twelve EPF/EPS/EDLI across Waves 3A–3C;
- fifteen ESI across Waves 4A–4D;
- one Appropriate Government Wave 5A;
- one Maharashtra Shops Wave 5B;
- one Code on Wages Wave 5C;
- one Gratuity Wave 5D;
- one Employee's Compensation Wave 5E;
- one OSHWC Wave 5F;
- one Industrial Relations Wave 5G;
- one Apprentices Wave 5H;
- one Child and Adolescent Labour Wave 5I;
- four conservative governance-fallback profiles.

The resulting runtime mix is **53 substantive profiles / 4 governance-fallback profiles / 19 catalogues**, with zero blocked runtime profiles. All Wave 1–5I substantive catalogues remain `needs-legal-review`. Complete and reported-gap outcomes are `specialist-review`; missing required facts produce `more-information-needed`.

## Wave 5A–5F authority boundaries

Wave 5A records cross-code jurisdiction-source readiness but does not select the legally appropriate Government or forum. Wave 5B records Maharashtra Shops source and organisational controls but does not decide coverage, thresholds, registration or working conditions. Wave 5C records Code on Wages source/version/jurisdiction controls but does not select wage rates, categories, zones or individual entitlements. Wave 5D records Gratuity Chapter V and transition controls but does not decide eligibility or amounts. Wave 5E records Employee's Compensation Chapter VII/schedule/process controls but does not decide injury causation, liability or compensation. Wave 5F records a bounded Central/Maharashtra OSHWC route and draft-final controls but does not decide OSHWC applicability, industry classification, registration/licensing, working conditions or enforcement.

## Wave 5G authority boundary — Industrial Relations

Wave 5G promotes `feature.legal.industrial-relations` into a substantive deterministic transition and standing-orders source-readiness profile. It does not determine Chapter IV applicability, worker thresholds, industrial-establishment or Model Standing Orders sector classification, certification/modification validity, territorial authority, saved rights, dismissal/disciplinary merits, disputes, strikes/lock-outs, retrenchment/closure, unfair labour practices, penalties, prosecution or remedies. Maharashtra's 2026 IR rules remain draft-only.

## Wave 5H authority boundary — Apprentices

Wave 5H promotes `feature.legal.apprentices` into a substantive deterministic source and classification-readiness profile. It accepts only organisation-level Act/Rules/amendment, current-Rules reconciliation, trade/category classification-source, manpower/band, State-variation, trade-register, portal/NAPS, authority, training-infrastructure, escalation and controlled-reference statuses.

These are source/readiness controls only. Wave 5H does not determine Act applicability, mandatory apprentice engagement, worker strength, apprentice numbers, percentage bands, State-law effects, customer role trade classification, apprentice category, individual eligibility, contract validity, stipend, certification, NAPS eligibility/DBT, competent authority, enforcement, penalty, dispute or remedy.

## Wave 5I authority boundary — Child and Adolescent Labour

Wave 5I promotes `feature.legal.child-adolescent-labour` into a substantive safeguarding-first source-readiness profile. It accepts only:

- a declared organisation-level safeguarding source route;
- current central Act source status;
- 1988 principal Rules and 2017 Amendment Rules source status;
- S.O. 2823(E) commencement and S.O. 2827(E) hazardous Schedule source status;
- current Act/Rules/Schedule reconciliation;
- privacy-safe age-band source control without exact age or date of birth;
- work-type/hazard classification-source control without classifying a customer activity;
- family-enterprise and artist-participation exception-source controls without deciding an exception;
- education-protection and register/notice source controls;
- District-authority and immediate human safeguarding escalation controls;
- State-variation source control and controlled references.

Wave 5I does not determine whether a person is a child/adolescent, whether work/employment exists, whether an occupation or process is hazardous, whether Part A/Part B or a statutory exception applies, schooling impact, age disputes, register/notice compliance, offences, rescue/complaint requirements, authority jurisdiction, liability, penalty, prosecution, compounding, rehabilitation, fund/payment, State-law applicability or remedy.

### Safeguarding-first execution boundary

Wave 5I is not case management, an emergency service, automated age inference or safeguarding risk scoring. Any live safeguarding concern must leave the RAG path and follow an approved human process. Retrieval/provider execution receives no child/adolescent identity, exact age/date of birth, family identity, school or health record, allegation, abuse/trafficking narrative, rescue/complaint/case detail, victim/witness data or evidence body. The provider cannot decide a case disposition or replace human escalation.

## Source-governance boundary

The platform distinguishes controlled full files with verified hashes/pagination from `source-identity-only` snapshots, regulator/programme guidance, official portal context, draft instruments and historical/saved-law candidates.

Wave 5D and Wave 5E reuse exact controlled Social Security files already registered in Drive. Wave 5F and Wave 5G use bounded official source identities where exact full-file mirrors are pending and keep Maharashtra draft instruments explicitly draft-only. Wave 5H contains eight source-identity records and twelve chunks pending exact Apprentices mirrors.

Wave 5I contains five official `curated-source-identity-v1` / `source-identity-only` records and ten reason-code-scoped chunks:

1. current Child and Adolescent Labour (Prohibition and Regulation) Act, 1986 source identity;
2. Child Labour (Prohibition and Regulation) Rules, 1988 principal Rules source identity;
3. Child Labour (Prohibition and Regulation) Amendment Rules, 2017 — G.S.R. 543(E);
4. S.O. 2823(E), 1 September 2016 commencement source identity;
5. S.O. 2827(E), 30 August 2017 hazardous Schedule amendment source identity.

The active Drive Source Register does not yet contain exact controlled Child and Adolescent Labour files. These SHA-256 values fingerprint curated source-identity records only; they are not byte hashes of the official PDFs. Exact full-file mirrors, qualified current-law consolidation and applicable State/UT variations remain open source/legal gates.

## Privacy boundaries

Earlier waves retain their established prohibitions on names, contact details, complaints, medical records, payroll, claims, accident narratives, notices/orders and evidence bodies except where an explicitly approved privacy-safe organisational field is part of a deterministic contract.

Industrial Relations Wave 5G excludes employee/union-member identities, disciplinary or termination narratives, grievance/dispute/strike/lock-out bodies, payroll/wages/attendance, raw standing-order text, notices/orders/pleadings, settlements and evidence bodies.

Apprentices Wave 5H excludes apprentice identities, date of birth/age, sex/gender, caste/community, disability/medical data, educational records, Aadhaar, contact/address data, contract bodies/numbers, bank/stipend/payroll data, training dates, attendance, assessments/certificates, disputes, notices/orders, injury information and evidence bodies.

Child and Adolescent Labour Wave 5I excludes child/adolescent identities, exact age/date of birth, parent/guardian/family identities, school/education records, medical/disability data, caste/community/religion, address/contact/precise child-linked location data, photographs/video, payment/payroll, schedules/attendance, allegation/abuse/trafficking/exploitation narratives, rescue/complaint/case/notice/order content, victim/witness data, police/CWC/District Magistrate case facts and evidence bodies. Only organisation-level source/control statuses and controlled reference identifiers are allowed.

## Operational endpoints

```text
POST /api/legal-explanation/feature/:featureId
GET  /api/legal-rag/status
GET  /api/m7/readiness
```

`server-entry.js` uses the Wave 5I router overlay on this stacked private-beta branch. The overlay preserves earlier waves, activates the safeguarding-first Child and Adolescent Labour profile and reports the 53/4 runtime mix. This stacked state does not by itself prove `main` integration or deployment.

## Approval boundary

Passing deterministic, retrieval, browser, report or hardening tests is software evidence only. It does not grant legal, privacy, safeguarding, RAG, exact-source-file, section-mapping, security or release approval. Every active catalogue remains `needs-legal-review` until qualified decisions are recorded.

See `docs/architecture/compliance-engine-differentiation.md`, `docs/architecture/all-laws-runnable-private-beta-rag.md` and `docs/testing/all-laws-rag-validation.md`.
