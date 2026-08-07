# GrowWithHR Architecture

## Deployment decision

The production application is the root-level static HTML/CSS/JavaScript site. `server.js` supplies the optional Gmail delivery API and `server-entry.js` is the CORS-aware production entrypoint used by Render. `apps/web/src` is an archived experimental React/TypeScript UX layer and is not part of the deployed build.

## Public architecture

1. `index.html` presents the product and links to `analyze-company.html`.
2. Stable assessment modules validate answers and persist same-browser progress under protected keys.
3. Presentation modules enrich the report experience without changing compliance applicability logic.
4. The stable report mapper prepares the advisory record.
5. `js/pdf.js` and `js/pdf-polish.js` render the deterministic advisory model as a browser-generated PDF.
6. `executive-advisory-report.html` consumes the same enriched advisory model.
7. Email delivery uses a data-minimised request to `POST /api/send-advisory` only when requested.
8. `server-entry.js` applies exact-origin CORS controls and delegates protected API routes.

The approved cross-origin client is `https://hrtechifyed.github.io`. Additional approved origins may be supplied through `ALLOWED_CORS_ORIGINS`; wildcard origins are not used.

## Private-beta architecture

`/analyze-company-v3.html` is no-index and disabled from public routing by default. M1–M5 modules consume protected assessment answers through compatibility adapters and produce isolated traceability, Compliance Story and workspace output without changing stable report, PDF, email or delivery contracts.

The v3 route mounts thirteen legal-review surfaces:

- the existing POSH Internal Committee threshold explanation;
- the POSH Wave 1 panel;
- the Maternity Benefit Wave 2 panel;
- EPF Wave 3A, 3B and 3C panels;
- ESI Wave 4A, 4B, 4C and 4D panels;
- the Appropriate Government Wave 5A panel;
- the Maharashtra Shops Wave 5B panel;
- the Code on Wages Wave 5C panel.

All panels submit only after explicit user action. Their inputs and results are not written to browser storage and are not inserted into the stable report, PDF or email.

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

The deterministic decision owns applicability, control-review or entitlement-route status and reason-code selection. Retrieval has `applicabilityAuthority: none` and `usedForDecision: false`. Provider output must preserve the decision fingerprint, status, reason code and supplied citation scope.

## Runtime coverage

The Wave 5C stacked private-beta registry exposes 57 active profiles:

- seven POSH profiles;
- ten Maternity Benefit profiles;
- twelve EPF, EPS and EDLI profiles across Waves 3A–3C;
- fifteen ESI profiles across Waves 4A–4D;
- one Appropriate Government Wave 5A profile;
- one Maharashtra Shops Wave 5B profile;
- one Code on Wages Wave 5C profile;
- ten conservative governance-fallback profiles.

The resulting runtime mix is:

- 47 substantive profiles;
- 10 governance-fallback profiles;
- 13 catalogues, comprising 12 substantive catalogues and one governance fallback;
- zero blocked runtime profiles.

The Wave 1–5C catalogues remain `needs-legal-review`. Complete and reported-gap outcomes are `specialist-review`; missing facts produce `more-information-needed`.

## Wave 5A authority boundary

Wave 5A accepts only an organisation-declared candidate route, cross-code definition source status, Central and State source-set status, establishment and activity classification control, multi-location routing, effective-date/version control, specialist escalation and evidence references.

It does not select the legally appropriate Government, applicable law, State source set, forum or jurisdiction.

## Wave 5B authority boundary

Wave 5B accepts only:

- declared Maharashtra State source scope;
- 2017 Act and 2018 Rules source statuses;
- amendment/notification register status;
- draft-versus-final reconciliation control;
- establishment-classification control;
- worker-count-band control;
- registration or intimation source control;
- working-condition source control;
- effective-date/version control;
- specialist escalation;
- evidence references.

Wave 5B does not decide Act coverage, establishment classification, employee-count thresholds, registration, intimation, working hours, leave, night work, welfare, safety, records, penalties or enforcement.

## Wave 5C authority boundary

Wave 5C promotes `feature.legal.code-on-wages` into a substantive deterministic source-readiness profile. It accepts only:

- a declared Central, State, mixed, multi-state or unresolved source route;
- Code on Wages, 2019 source status;
- Code on Wages (Central) Rules, 2026 source status;
- July 2026 Central Rules corrigendum status;
- commencement and implementation source-set status;
- effective-date/version control;
- appropriate-Government source-routing control;
- bounded rate-source register control;
- State or Union Territory instrument-register control;
- specialist escalation;
- controlled source references.

The declared route is an organisation-level source-routing input, not a legal conclusion. Wave 5C does not select the appropriate Government, an individual's applicable minimum wage, wage rate, wage category, zone, scheduled employment or State instrument. It does not perform payroll, bonus, deduction, overtime, wage-period, entitlement, arrears, damages or remedy arithmetic and does not determine whether an individual employee is owed an amount.

## Source-governance boundary

The platform distinguishes:

- controlled full files with verified hashes, byte lengths and physical pagination;
- source-identity-only snapshots;
- regulator guidance;
- official portal context;
- draft instruments;
- historical or saved-law candidates.

Wave 4A–4D preserve the controlled ESI current-source, historical, saved-law, authority, rate, ceiling, medical, exemption and enforcement distinctions documented in their catalogues. Missing area notifications, hazardous-route instruments, State implementation sources, customer-specific documents and transition treatment remain qualified-review dependencies.

Wave 5A reuses controlled-file fingerprints for the Social Security Code and Social Security Central Rules. Other cross-code records remain source-identity snapshots until exact controlled files are verified. No complete State or Union Territory jurisdiction pack is represented.

Wave 5B contains five official Maharashtra source identities and eight reason-code-scoped chunks. All five are `source-identity-only` records. The November 2025 record is explicitly draft and cannot be treated as final or operative. Exact current Act and Rules files, all final amendments, notifications and local implementation materials still require controlled-file acquisition and qualified Maharashtra review.

Wave 5C contains seven official source identities and nine reason-code-scoped chunks:

1. Code on Wages, 2019;
2. Code on Wages (Central) Rules, 2026;
3. S.O. 4604(E), dated 18 December 2020;
4. S.O. 5322(E), dated 21 November 2025;
5. the July 2026 corrigendum to the Central Rules;
6. the Ministry Code on Wages notifications register;
7. the Ministry labour-jurisdiction portal.

The Code, Central Rules and jurisdiction identities reuse Wave 5A registrations. The added commencement, corrigendum and notification-register records are source-identity controls pending exact controlled-file acquisition. State/UT wage instruments, rate schedules, categories, zones and scheduled-employment mappings are not represented as selected or complete.

## Privacy boundaries

Earlier waves preserve their existing exclusions for names, contact details, complaint narratives, medical records, exact event dates, UANs, Aadhaar, insurance numbers, passports, payroll, contribution histories, claims, family data, accident narratives, exemption documents, notices, orders, signatures, findings, recovery amounts, disputes and evidence bodies.

Appropriate Government Wave 5A excludes names, contact details, addresses, registration numbers, employee identities, wages, payroll, disputes, allegations, notices, orders, contracts, legal submissions and evidence bodies. It accepts no raw location or establishment narrative.

Maharashtra Shops Wave 5B excludes names, addresses, contact details, registration numbers, employee identities, age or gender data, schedules, attendance, wages, payroll, applications, certificates, notices, orders, disputes and evidence bodies.

Code on Wages Wave 5C excludes employee identities, payroll, wage records, payslips, attendance, disputes, claims, notices, orders, individual entitlements and evidence bodies. It accepts no numeric wage-rate decision input and no raw employee or payroll evidence. Evidence arrays are reduced to controlled references before submission.

## Operational endpoints

```text
POST /api/legal-explanation/feature/:featureId
GET  /api/legal-rag/status
GET  /api/m7/readiness
```

`server-entry.js` uses the Wave 5C router overlay. The overlay preserves Waves 1–5B, activates the bounded Code on Wages source-readiness profile and reports the 47/10 runtime mix.

## Approval boundary

Passing deterministic, retrieval, browser, report or hardening tests is software evidence only. It does not grant legal, privacy, RAG, source-file, security, release or runtime approval. Every active catalogue remains `needs-legal-review` until qualified decisions are recorded.

See `docs/architecture/compliance-engine-differentiation.md`, `docs/architecture/all-laws-runnable-private-beta-rag.md` and `docs/testing/all-laws-rag-validation.md`.
