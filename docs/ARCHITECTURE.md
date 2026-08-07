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

The v3 route mounts fifteen legal-review surfaces:

- the existing POSH Internal Committee threshold explanation;
- the POSH Wave 1 panel;
- the Maternity Benefit Wave 2 panel;
- EPF Wave 3A, 3B and 3C panels;
- ESI Wave 4A, 4B, 4C and 4D panels;
- the Appropriate Government Wave 5A panel;
- the Maharashtra Shops Wave 5B panel;
- the Code on Wages Wave 5C panel;
- the Gratuity Wave 5D panel;
- the Employee's Compensation Wave 5E panel.

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

The Wave 5E stacked private-beta registry exposes 57 active profiles:

- seven POSH profiles;
- ten Maternity Benefit profiles;
- twelve EPF, EPS and EDLI profiles across Waves 3A–3C;
- fifteen ESI profiles across Waves 4A–4D;
- one Appropriate Government Wave 5A profile;
- one Maharashtra Shops Wave 5B profile;
- one Code on Wages Wave 5C profile;
- one Gratuity Wave 5D profile;
- one Employee's Compensation Wave 5E profile;
- eight conservative governance-fallback profiles.

The resulting runtime mix is:

- 49 substantive profiles;
- 8 governance-fallback profiles;
- 15 catalogues, comprising 14 substantive catalogues and one governance fallback;
- zero blocked runtime profiles.

The Wave 1–5E catalogues remain `needs-legal-review`. Complete and reported-gap outcomes are `specialist-review`; missing facts produce `more-information-needed`.

## Wave 5A authority boundary

Wave 5A accepts only an organisation-declared candidate route, cross-code definition source status, Central and State source-set status, establishment and activity classification control, multi-location routing, effective-date/version control, specialist escalation and evidence references.

It does not select the legally appropriate Government, applicable law, State source set, forum or jurisdiction.

## Wave 5B authority boundary

Wave 5B accepts only declared Maharashtra State source scope, Act/Rules source statuses, amendment and draft-reconciliation controls, establishment and worker-count controls, registration/working-condition source controls, effective-date/version control, specialist escalation and references.

Wave 5B does not decide Act coverage, establishment classification, employee-count thresholds, registration, intimation, working hours, leave, night work, welfare, safety, records, penalties or enforcement.

## Wave 5C authority boundary

Wave 5C promotes `feature.legal.code-on-wages` into a substantive deterministic source-readiness profile. It accepts only organisation-level Code/Rules, commencement, version, jurisdiction-routing, bounded rate-source and State-instrument controls plus specialist escalation and references.

The declared route is an organisation-level source-routing input, not a legal conclusion. Wave 5C does not select the appropriate Government, an individual's applicable minimum wage, wage rate, wage category, zone, scheduled employment or State instrument. It does not perform payroll, bonus, deduction, overtime, wage-period, entitlement, arrears, damages or remedy arithmetic.

## Wave 5D authority boundary

Wave 5D promotes `feature.legal.social-security.gratuity` into a substantive deterministic source-readiness profile. It accepts only:

- a declared source route;
- Chapter V, sections 53–58 source status;
- First Schedule Chapter V applicability-source status;
- Social Security (Central) Rules, 2026 Chapter V, Rules 31–34 source status;
- commencement and corrigendum source-set status;
- legacy gratuity-rule transition control;
- establishment-classification control;
- workforce-category source control;
- authority/process source control;
- specialist escalation;
- controlled references.

These are organisation-level controls only. Wave 5D does not determine customer coverage, classify an establishment, count employees or decide an individual's eligibility, continuous service, fixed-term status, wages, gratuity amount, nomination, forfeiture, insurance, claim, appeal, recovery or remedy.

## Wave 5E authority boundary

Wave 5E promotes `feature.legal.social-security.employee-compensation` into a substantive deterministic source-readiness profile. It accepts only:

- a declared source route;
- Chapter VII, sections 73–99 source status;
- First and Second Schedule applicability/employee-class source-set status;
- Third Schedule occupational-disease source status;
- Sixth Schedule compensation-factor source status;
- Social Security (Central) Rules, 2026 Chapter XIII, Rules 57–63 source status;
- commencement and corrigendum source-set status;
- legacy Employee's Compensation rules transition control;
- ESI-overlap source-routing control;
- employer reporting and employee-information control;
- competent-authority/process source control;
- specialist escalation;
- controlled references.

These are organisation-level controls only. Wave 5E does not determine customer or worker coverage, ESI applicability, whether an accident or occupational disease arose out of or in the course of employment, diagnosis, causation, disablement, dependency, employer liability, monthly wages, compensation amount, interest, damages, claim, appeal, recovery or remedy. The Third and Sixth Schedules remain source-control inputs only; retrieval and provider output cannot diagnose a condition or perform compensation arithmetic.

## Source-governance boundary

The platform distinguishes:

- controlled full files with verified hashes, byte lengths and physical pagination;
- source-identity-only snapshots;
- regulator guidance;
- official portal context;
- draft instruments;
- historical or saved-law candidates.

Wave 4A–4D preserve the controlled ESI current-source, historical, saved-law, authority, rate, ceiling, medical, exemption and enforcement distinctions documented in their catalogues.

Wave 5A reuses controlled-file fingerprints for the Social Security Code and Social Security Central Rules. Other cross-code records remain source-identity snapshots until exact controlled files are verified.

Wave 5B contains five official Maharashtra source identities and eight reason-code-scoped chunks. All five are `source-identity-only` records. The November 2025 record is explicitly draft and cannot be treated as final or operative.

Wave 5C contains seven official source identities and nine reason-code-scoped chunks. State/UT wage instruments, rate schedules, categories, zones and scheduled-employment mappings are not represented as selected or complete.

Wave 5D contains four exact controlled files and eight reason-code-scoped chunks:

1. Code on Social Security, 2020;
2. Social Security (Central) Rules, 2026;
3. S.O. 5319(E), dated 21 November 2025;
4. S.O. 5936(E), dated 19 December 2025.

The Wave 5D catalogue maps Chapter V sections 53–58, the First Schedule Chapter V entry, Rules 31–34, section 164/repeal-and-savings context, the 2026 Rules' supersession of the Payment of Gratuity (Central) Rules, 1972 subject to savings, and commencement/corrigendum context. It reuses the exact SHA-256 fingerprints registered in the active Source Register. State/UT instruments and customer-specific facts remain qualified-review dependencies.

Wave 5E reuses the same four exact controlled Social Security files and contains nine reason-code-scoped chunks. It maps Chapter VII sections 73–99, the First and Second Schedule applicability/employee-class sources, the Third Schedule occupational-disease source, the Sixth Schedule compensation-factor source, Rules 57–63, section 164/repeal-and-savings context, the 2026 Rules' supersession of the Employee's Compensation Rules, 1924, Employee's Compensation (Transfer of Money) Rules, 1935 and Employee's Compensation (Venue of Proceedings) Rules, 1996 subject to savings, and commencement/corrigendum context. State/UT instruments, customer-specific coverage and ESI-overlap determinations, and individual injury/entitlement facts remain qualified-review dependencies.

## Privacy boundaries

Earlier waves preserve their existing exclusions for names, contact details, complaint narratives, medical records, exact event dates, UANs, Aadhaar, insurance numbers, passports, payroll, contribution histories, claims, family data, accident narratives, exemption documents, notices, orders, signatures, findings, recovery amounts, disputes and evidence bodies.

Appropriate Government Wave 5A excludes names, contact details, addresses, registration numbers, employee identities, wages, payroll, disputes, allegations, notices, orders, contracts, legal submissions and evidence bodies.

Maharashtra Shops Wave 5B excludes names, addresses, contact details, registration numbers, employee identities, age or gender data, schedules, attendance, wages, payroll, applications, certificates, notices, orders, disputes and evidence bodies.

Code on Wages Wave 5C excludes employee identities, payroll, wage records, payslips, attendance, disputes, claims, notices, orders, individual entitlements and evidence bodies.

Gratuity Wave 5D excludes employee identities, nominee or heir data, payroll, wages, payslips, attendance, service records, claims, disputes, notices, orders, medical or death information and evidence bodies. It accepts no individual service or wage values and no raw claim or entitlement evidence.

Employee's Compensation Wave 5E excludes employee and dependant identities, age, sex, addresses, payroll, wages, payslips, attendance, service history, accident or injury narratives, medical or death information, claims, disputes, notices, orders, bank/payment data, compensation amounts and evidence bodies. It accepts only organisation-level source-control statuses and controlled references.

## Operational endpoints

```text
POST /api/legal-explanation/feature/:featureId
GET  /api/legal-rag/status
GET  /api/m7/readiness
```

`server-entry.js` uses the Wave 5E router overlay. The overlay preserves Waves 1–5D, activates the bounded Employee's Compensation source-readiness profile and reports the 49/8 runtime mix.

## Approval boundary

Passing deterministic, retrieval, browser, report or hardening tests is software evidence only. It does not grant legal, privacy, RAG, source-file, security, release or runtime approval. Every active catalogue remains `needs-legal-review` until qualified decisions are recorded.

See `docs/architecture/compliance-engine-differentiation.md`, `docs/architecture/all-laws-runnable-private-beta-rag.md` and `docs/testing/all-laws-rag-validation.md`.
