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

The v3 route now mounts the POSH, Maternity Benefit, EPF Waves 3A–3C, ESI Waves 4A–4D, Appropriate Government Wave 5A, Maharashtra Shops Wave 5B, Code on Wages Wave 5C, Gratuity Wave 5D, Employee's Compensation Wave 5E, OSHWC Wave 5F, Industrial Relations Wave 5G and Apprentices Wave 5H review surfaces.

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

The compliance engine uses one authority boundary across legal features:

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

The Wave 5H stacked private-beta registry exposes 57 callable profiles:

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
- five conservative governance-fallback profiles.

The resulting runtime mix is:

- **52 substantive profiles**;
- **5 governance-fallback profiles**;
- **18 catalogues** — 17 substantive plus one governance fallback;
- zero blocked runtime profiles.

All Wave 1–5H substantive catalogues remain `needs-legal-review`. Complete and reported-gap outcomes are `specialist-review`; missing required facts produce `more-information-needed`.

## Wave 5A–5F authority boundaries

Wave 5A records cross-code jurisdiction-source readiness but does not select the legally appropriate Government or forum. Wave 5B records Maharashtra Shops source and organisational controls but does not decide coverage, thresholds, registration or working conditions. Wave 5C records Code on Wages source/version/jurisdiction controls but does not select wage rates, categories, zones or individual entitlements. Wave 5D records Gratuity Chapter V and transition controls but does not decide eligibility or amounts. Wave 5E records Employee's Compensation Chapter VII/schedule/process controls but does not decide injury causation, liability or compensation. Wave 5F records a bounded Central/Maharashtra OSHWC route and draft-final controls but does not decide OSHWC applicability, industry classification, registration/licensing, working conditions or enforcement.

## Wave 5G authority boundary — Industrial Relations

Wave 5G promotes `feature.legal.industrial-relations` into a substantive deterministic transition and standing-orders source-readiness profile. It accepts organisation-level controls for:

- Industrial Relations Code and Central Rules source status;
- commencement, removal-of-difficulties and 2026 amendment transition sources;
- Model Standing Orders source status;
- Maharashtra draft-rule and draft-final reconciliation;
- standing-orders threshold-source and industrial-establishment classification controls;
- adoption/certification/modification and authority-routing source controls;
- repeal/savings and statutory-authority continuity controls;
- specialist escalation and controlled references.

Wave 5G does not determine Chapter IV applicability, worker thresholds, industrial-establishment or Model Standing Orders sector classification, certification/modification validity, territorial authority, saved rights, dismissal/disciplinary merits, disputes, strikes/lock-outs, retrenchment/closure, unfair labour practices, penalties, prosecution or remedies. Maharashtra's 2026 IR rules remain draft-only.

## Wave 5H authority boundary — Apprentices

Wave 5H promotes `feature.legal.apprentices` into a substantive deterministic source and classification-readiness profile. It accepts organisation-level controls for:

- current Apprentices Act source status;
- DGT-hosted Apprenticeship Rules, 1992 base-source status;
- Apprenticeship (Amendment) Rules, 2025 source status;
- current-Rules-versus-portal-summary reconciliation;
- designated-versus-optional trade classification source control;
- apprentice-category classification source control;
- establishment manpower and engagement-band source control;
- State-variation source control;
- designated- and optional-trade registers;
- Apprenticeship India / NAPS-2 lifecycle source control;
- Apprenticeship Adviser or Board authority routing;
- training-infrastructure source control;
- specialist escalation and controlled references.

These are source/readiness controls only. Wave 5H does not determine Act applicability, mandatory apprentice engagement, worker strength, apprentice numbers, percentage bands, State-law effects, customer role trade classification, apprentice category, individual eligibility, age/education/fitness/reservation/disability treatment, contract validity, training period or completion, stipend/payment, examination/certification, NAPS eligibility/reimbursement/DBT, competent authority, enforcement, penalty, dispute or remedy.

### Current-rules reconciliation rule

Wave 5H deliberately distinguishes statutory sources from programme/portal summaries. The DGT base Rules file and DGT overview are not represented as a current consolidated legal text. Later Gazette amendments and current India Code material must be reconciled explicitly. Retrieval/provider output may not resolve conflicting or lagging portal wording by inference and may not calculate a customer obligation from portal copy.

## Source-governance boundary

The platform distinguishes:

- controlled full files with verified hashes, byte lengths and physical pagination;
- `source-identity-only` snapshots;
- regulator or programme guidance;
- official portal context;
- draft instruments;
- historical or saved-law candidates.

Wave 5D and Wave 5E reuse exact controlled Social Security files already registered in Drive. Wave 5F and Wave 5G use bounded official source identities where exact full-file mirrors are pending and keep Maharashtra draft instruments explicitly draft-only.

Wave 5H contains eight official `curated-source-identity-v1` / `source-identity-only` records and twelve reason-code-scoped chunks:

1. current Apprentices Act, 1961 India Code text;
2. DGT-hosted Apprenticeship Rules, 1992 base file;
3. Apprenticeship (Amendment) Rules, 2025 — G.S.R. 610(E);
4. DGT Apprenticeship Training overview;
5. DGT designated-trades register;
6. DGT optional-trades register;
7. NAPS-2 Guidelines;
8. Apprenticeship India portal.

The active Drive Source Register does not yet contain exact controlled Apprentices full files. Exact mirrors, a qualified consolidated current-Rules set, applicable State variations and customer-specific authority/trade classification remain approval dependencies.

## Privacy boundaries

Earlier waves retain their established prohibitions on names, contact details, complaints, medical records, payroll, claims, accident narratives, notices/orders and evidence bodies except where an explicitly approved privacy-safe organisational field is part of a deterministic contract.

Industrial Relations Wave 5G excludes employee/union-member identities, disciplinary or termination narratives, grievance/dispute/strike/lock-out bodies, payroll/wages/attendance, raw standing-order text, notices/orders/pleadings, settlements and evidence bodies.

Apprentices Wave 5H excludes apprentice identities, date of birth/age, sex/gender, caste/community, disability/medical data, educational records, Aadhaar, contact/address data, contract bodies/numbers, bank/stipend/payroll data, training dates, attendance, assessments/certificates, disputes, notices/orders, injury information and evidence bodies. Worker-strength numbers, apprentice counts and individual eligibility facts are also outside the provider payload.

## Operational endpoints

```text
POST /api/legal-explanation/feature/:featureId
GET  /api/legal-rag/status
GET  /api/m7/readiness
```

`server-entry.js` uses the Wave 5H router overlay. The overlay preserves earlier waves, activates the bounded Apprentices source/classification-readiness profile and reports the 52/5 runtime mix.

## Approval boundary

Passing deterministic, retrieval, browser, report or hardening tests is software evidence only. It does not grant legal, privacy, RAG, exact-source-file, section-mapping, security or release approval. Every active catalogue remains `needs-legal-review` until qualified decisions are recorded.

See `docs/architecture/compliance-engine-differentiation.md`, `docs/architecture/all-laws-runnable-private-beta-rag.md` and `docs/testing/all-laws-rag-validation.md`.
