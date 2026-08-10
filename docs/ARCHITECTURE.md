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

The v3 route mounts the POSH, Maternity Benefit, EPF Waves 3A–3C, ESI Waves 4A–4D, Appropriate Government Wave 5A, Maharashtra Shops Wave 5B, Code on Wages Wave 5C, Gratuity Wave 5D, Employee's Compensation Wave 5E, OSHWC Wave 5F, Industrial Relations Wave 5G, Apprentices Wave 5H, Child and Adolescent Labour Wave 5I and Contract Workforce Wave 5K review surfaces. Wave 5J Bonded and Forced Labour remains research-only and has no browser surface.

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

The Wave 5K stacked private-beta registry exposes 57 callable profiles. The resulting runtime mix is **54 substantive profiles / 3 governance-fallback profiles / 20 catalogues**, with zero blocked runtime profiles.

The substantive stack includes POSH, Maternity Benefit, EPF/EPS/EDLI Waves 3A–3C, ESI Waves 4A–4D and one profile each for Appropriate Government, Maharashtra Shops, Code on Wages, Gratuity, Employee's Compensation, OSHWC, Industrial Relations, Apprentices, Child and Adolescent Labour and Contract Workforce. Bonded and Forced Labour remains one of the governance-fallback profiles through the Wave 5J research-only boundary.

All substantive catalogues remain `needs-legal-review`. Complete and reported-gap outcomes are `specialist-review`; missing required facts produce `more-information-needed`.

## Wave 5A–5F authority boundaries

Wave 5A records cross-code jurisdiction-source readiness but does not select the legally appropriate Government or forum. Wave 5B records Maharashtra Shops source and organisational controls but does not decide coverage, thresholds, registration or working conditions. Wave 5C records Code on Wages source/version/jurisdiction controls but does not select wage rates, categories, zones or individual entitlements. Wave 5D records Gratuity Chapter V and transition controls but does not decide eligibility or amounts. Wave 5E records Employee's Compensation Chapter VII/schedule/process controls but does not decide injury causation, liability or compensation. Wave 5F records a bounded Central/Maharashtra OSHWC route and draft-final controls but does not decide OSHWC applicability, industry classification, registration/licensing, working conditions or enforcement.

## Wave 5G authority boundary — Industrial Relations

Wave 5G promotes `feature.legal.industrial-relations` into a substantive deterministic transition and standing-orders source-readiness profile. It does not determine Chapter IV applicability, worker thresholds, industrial-establishment or Model Standing Orders sector classification, certification/modification validity, territorial authority, saved rights, disciplinary/dispute outcomes, strikes/lock-outs, retrenchment/closure, penalties or remedies. Maharashtra's 2026 IR rules remain draft-only.

## Wave 5H authority boundary — Apprentices

Wave 5H promotes `feature.legal.apprentices` into a substantive deterministic source and classification-readiness profile. It accepts only organisation-level Act/Rules/amendment, current-Rules reconciliation, trade/category classification-source, manpower/band, State-variation, trade-register, portal/NAPS, authority, training-infrastructure, escalation and controlled-reference statuses. It does not determine Act applicability, mandatory engagement, counts/bands, individual eligibility, contract/stipend/certification, NAPS/DBT, enforcement or remedy.

## Wave 5I authority boundary — Child and Adolescent Labour

Wave 5I is safeguarding-first. It accepts only current Act/Rules/Schedule source status, privacy-safe age-band and work-type classification-source controls, exception-source controls, education/register/notice controls, State variation, authority/human safeguarding escalation and controlled references. It is not case management, emergency handling, age inference or risk scoring and does not determine age/status, work, hazardous classification, exception, offence, rescue, prosecution, rehabilitation or remedy.

## Wave 5J authority boundary — Bonded and Forced Labour

Wave 5J is a research-only governance stop. `feature.legal.bonded-forced-labour` remains on governance fallback and no assessment fact contract, source-chunk catalogue, browser panel, substantive rule or router overlay exists. Runtime promotion is blocked pending exact current operational materials, qualified constitutional/statutory/criminal mapping, human-only safeguarding, privacy/security and State/UT controls.

## Wave 5K authority boundary — Contract Workforce

Wave 5K promotes `feature.legal.contract-workforce` into a bounded cross-family source-readiness profile. Its first scope is OSHWC Chapter XI Part I and current Central Rules contract-labour material, plus State-rule reconciliation and **separate** EPF/ESI contractor dependencies.

The 19-field deterministic contract records only organisation-level:

- declared Central/Maharashtra/mixed source route;
- OSHWC Code, Central Rules and commencement status;
- Maharashtra draft-versus-final reconciliation;
- Chapter XI Part I scope and threshold source controls;
- principal-employer/contractor classification-source controls;
- contractor licensing and work-order/portal-intimation controls;
- welfare and wage-responsibility controls;
- core-activity classification source control;
- separate EPF and ESI contractor-dependency statuses;
- OSHWC/EPF/ESI reconciliation, authority/escalation, specialist escalation and controlled references.

Wave 5K does **not** determine OSHWC contract-labour applicability, thresholds, principal-employer/contractor classification, licensing liability or validity, fees/security, work-order validity, welfare breach, wage default/recovery, core-activity classification/prohibition, exemption, authority jurisdiction, EPF membership/contribution, ESI insurance/contribution, State-law applicability, inspection, penalty, prosecution, dispute or remedy.

### Cross-family non-substitution rule

The contract-workforce layer is orchestration, not aggregation of legal authority:

```text
OSHWC contract-workforce decision ─┐
EPF contractor-control decision ───┼─> separate dependency/reconciliation statuses only
ESI contractor-control decision ───┘
```

No family may determine another family's applicability or substantive result. Rule 93(4) of the current OSHWC Central Rules is treated as a routing dependency to the respective Social Security Code provisions, not as authority to infer EPF or ESI outcomes inside the OSHWC review.

## Source-governance boundary

The platform distinguishes controlled full files with verified hashes/pagination from `source-identity-only` snapshots, regulator/programme guidance, official portal context, draft instruments and historical/saved-law candidates.

Wave 5K contains eight source records and twelve reason-code-scoped chunks. Four OSHWC records are source-identity snapshots pending exact controlled mirrors: OSHWC Code 2020, OSHWC Central Rules 2026, S.O. 5321(E) commencement and Maharashtra OSHWC Labour draft Rules 2026. Four dependency records reuse exact controlled files already present in the governed EPF/ESI stack: Code on Social Security 2020, Employees' Provident Funds Scheme 2026, Social Security (Central) Rules 2026 and the ESI General Regulations 1950 consolidated 11 January 2024 saved-law candidate.

Maharashtra's 2026 OSHWC Labour Rules remain draft-only. A later final State instrument must be independently acquired, fingerprinted and approved before any final-State rule can enter a substantive determination.

## Privacy boundaries

Earlier waves retain their established prohibitions on identities, contact details, complaints, medical records, payroll, claims, accident narratives, notices/orders and evidence bodies except where an explicitly approved privacy-safe organisational field is part of a deterministic contract.

Wave 5K excludes contractor/worker identities, contact/address data, PAN/GST/registration identifiers, contract/work-order bodies, worker rosters, UAN/ESI insurance numbers, payroll/wage/contribution rows, attendance/schedules, bank/payment/invoice data, licence/certificate bodies, notices/orders/disputes, accident/medical information and evidence bodies. Only organisation-level statuses and controlled reference identifiers are allowed.

## Operational endpoints

```text
POST /api/legal-explanation/feature/:featureId
GET  /api/legal-rag/status
GET  /api/m7/readiness
```

`server-entry.js` uses the Wave 5K router overlay on this stacked private-beta branch. The overlay preserves Waves 1–5I, leaves Wave 5J Bonded and Forced Labour on governance fallback, activates the bounded Contract Workforce profile and reports the 54/3 runtime mix. This stacked state does not by itself prove `main` integration or deployment.

## Approval boundary

Passing deterministic, retrieval, browser, report or hardening tests is software evidence only. It does not grant legal, privacy, safeguarding, RAG, exact-source-file, State-final-rule, section-mapping, security or release approval. Every active catalogue remains `needs-legal-review` until qualified decisions are recorded.

See `docs/architecture/compliance-engine-differentiation.md`, `docs/architecture/all-laws-runnable-private-beta-rag.md` and `docs/testing/all-laws-rag-validation.md`.
