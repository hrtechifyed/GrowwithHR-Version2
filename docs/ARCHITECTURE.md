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

The v3 route mounts twelve legal-review surfaces:

- the existing POSH Internal Committee threshold explanation;
- the POSH Wave 1 panel;
- the Maternity Benefit Wave 2 panel;
- EPF Wave 3A, 3B and 3C panels;
- ESI Wave 4A, 4B, 4C and 4D panels;
- the Appropriate Government Wave 5A panel;
- the Maharashtra Shops Wave 5B panel.

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

The Wave 5B stacked private-beta registry exposes 57 active profiles:

- seven POSH profiles;
- ten Maternity Benefit profiles;
- twelve EPF, EPS and EDLI profiles across Waves 3A–3C;
- fifteen ESI profiles across Waves 4A–4D;
- one Appropriate Government Wave 5A profile;
- one Maharashtra Shops Wave 5B profile;
- eleven conservative governance-fallback profiles.

The resulting runtime mix is:

- 46 substantive profiles;
- 11 governance-fallback profiles;
- 12 catalogues, comprising 11 substantive catalogues and one governance fallback;
- zero blocked runtime profiles.

The Wave 1–5B catalogues remain `needs-legal-review`. Complete and reported-gap outcomes are `specialist-review`; missing facts produce `more-information-needed`.

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

Wave 5B contains five official Maharashtra source identities and eight reason-code-scoped chunks:

1. Maharashtra Shops and Establishments Act, 2017;
2. Maharashtra Shops and Establishments Rules, 2018;
3. Draft Maharashtra Shops and Establishments Amendment Rules, 2025;
4. Maharashtra Labour Department services portal;
5. Maharashtra Labour RTS services portal.

All five are `source-identity-only` records. The November 2025 record is explicitly draft and cannot be treated as final or operative. Exact current Act and Rules files, all final amendments, notifications and local implementation materials still require controlled-file acquisition and qualified Maharashtra review.

## Privacy boundaries

Earlier waves preserve their existing exclusions for names, contact details, complaint narratives, medical records, exact event dates, UANs, Aadhaar, insurance numbers, passports, payroll, contribution histories, claims, family data, accident narratives, exemption documents, notices, orders, signatures, findings, recovery amounts, disputes and evidence bodies.

Appropriate Government Wave 5A excludes names, contact details, addresses, registration numbers, employee identities, wages, payroll, disputes, allegations, notices, orders, contracts, legal submissions and evidence bodies. It accepts no raw location or establishment narrative.

Maharashtra Shops Wave 5B excludes:

- names, addresses and contact details;
- registration numbers;
- employee identities, age or gender data;
- schedules and attendance;
- wages and payroll;
- applications and certificates;
- notices and orders;
- disputes and evidence bodies.

Evidence arrays are reduced to controlled references before submission.

## Operational endpoints

```text
POST /api/legal-explanation/feature/:featureId
GET  /api/legal-rag/status
GET  /api/m7/readiness
```

`server-entry.js` uses the Wave 5B router overlay. The overlay preserves Waves 1–5A, activates the Maharashtra source-controls profile and reports the 46/11 runtime mix.

## Approval boundary

Passing deterministic, retrieval, browser, report or hardening tests is software evidence only. It does not grant legal, privacy, RAG, source-file, security, release or runtime approval. Every active catalogue remains `needs-legal-review` until qualified decisions are recorded.

See `docs/architecture/compliance-engine-differentiation.md`, `docs/architecture/all-laws-runnable-private-beta-rag.md` and `docs/testing/all-laws-rag-validation.md`.
