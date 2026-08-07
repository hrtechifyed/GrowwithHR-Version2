# GrowWithHR

GrowWithHR is a deterministic, traceable HR compliance advisory engine for founders, business leaders and People teams. It records explicit company facts, applies versioned rules, retrieves governed source material only after the decision and uses AI only to explain the fixed result.

## Current release

- Application version: `0.20.2`
- Release: Governed Legal RAG Private Beta
- Public assessment: `/analyze-company.html`
- Private-beta Compliance DNA route: `/analyze-company-v3.html`
- Private-beta feature flag: `complianceDnaV3: false`
- Shared legal explanation route: `POST /api/legal-explanation/feature/:featureId`
- Legal RAG status route: `GET /api/legal-rag/status`

## Compliance-engine authority boundary

```text
Assessment answers
→ deterministic fact mapping
→ deterministic legal rule
→ immutable decision and reason code
→ governed source retrieval
→ explanation-only provider
→ strict response validation
```

Deterministic rules decide. RAG retrieves governed material. The hosted model explains only. Retrieval and provider output cannot create assessment facts, change applicability, expand source scope or certify compliance.

## Legal RAG coverage

The Wave 5H stacked private-beta registry contains 57 runnable feature profiles:

- seven POSH profiles;
- ten Maternity Benefit profiles;
- twelve EPF, EPS and EDLI profiles across Waves 3A–3C;
- fifteen ESI profiles across Waves 4A–4D;
- one Appropriate Government Wave 5A profile;
- one Maharashtra Shops and Establishments Wave 5B profile;
- one Code on Wages Wave 5C profile;
- one Gratuity Wave 5D profile;
- one Employee's Compensation Wave 5E profile;
- one OSHWC Wave 5F profile;
- one Industrial Relations Wave 5G profile;
- one Apprentices Wave 5H profile;
- five profiles using conservative governance-fallback rules until law-specific sources and rules complete review.

The resulting runtime mix is **57 callable / 52 substantive / 5 governance fallback / 18 catalogues**, with zero blocked runtime profiles.

### Waves 1–4D

Earlier waves preserve the existing deterministic boundaries for POSH, Maternity Benefit, EPF/EPS/EDLI and ESI. They do not allow retrieval or model output to create applicability, membership, contribution, claim, benefit, medical, exemption, enforcement or other individual legal outcomes.

### Wave 5A — Appropriate Government source routing

Wave 5A records cross-code definition, Central/State source-set, establishment/activity classification, multi-location, version and escalation controls. It does not choose the legally appropriate Government, governing law, source set, forum or jurisdiction.

### Wave 5B — Maharashtra Shops source controls

Wave 5B records Maharashtra Act/Rules, amendment, draft-final reconciliation, establishment, worker-count-band, registration/intimation, working-condition and specialist-escalation source controls. It does not decide Act coverage, thresholds, registration, hours, leave, welfare, safety, penalties or enforcement. The November 2025 amendment remains explicitly draft-only.

### Wave 5C — Code on Wages source readiness

Wave 5C reviews organisation-level Code/Rules, commencement, version, jurisdiction-routing, rate-source-register and State-instrument controls. It does not select an appropriate Government, individual minimum wage, rate, category, zone, scheduled employment or State instrument and performs no wage, bonus, deduction, overtime, arrears or remedy arithmetic.

### Wave 5D — Gratuity source readiness

Wave 5D reviews Code on Social Security Chapter V, First Schedule, Rules 31–34, commencement/transition, establishment/workforce source controls and authority/process routing. It does not determine customer coverage, employee eligibility, continuous service, wages, gratuity amount, nomination, forfeiture, claim, appeal, recovery or remedy.

### Wave 5E — Employee's Compensation source readiness

Wave 5E reviews Chapter VII, relevant schedules, Rules 57–63, commencement/transition, ESI-overlap, employer-process and authority source controls. It does not determine worker coverage, accident or disease causation, diagnosis, disablement, dependency, liability, wages, compensation amount, claim, appeal, recovery or remedy.

### Wave 5F — OSHWC source readiness

Wave 5F reviews a bounded Central/Maharashtra source route, Code/Central Rules/commencement, two Maharashtra 2026 draft-rule branches, draft-final reconciliation and generic establishment controls. It does not decide OSHWC applicability, worker thresholds, establishment or industry classification, registration/licensing, substantive safety or working conditions, incidents, inspection, penalties, prosecution or remedies. Both Maharashtra rule sets remain draft-only.

### Wave 5G — Industrial Relations standing-orders readiness

Wave 5G promotes `feature.legal.industrial-relations` into a bounded organisation-level transition and standing-orders source-readiness review. It records:

- Industrial Relations Code, 2020 and current Central Rules source status;
- commencement and transition-source controls;
- the 2026 amendment and Model Standing Orders source status;
- Maharashtra draft-rule and draft-final reconciliation controls;
- standing-orders threshold-source, establishment-classification, adoption/certification and authority-routing controls;
- legacy repeal/savings, authority-continuity, specialist-escalation and controlled-reference statuses.

Wave 5G does **not** decide Chapter IV applicability, worker-count thresholds, industrial-establishment or Model Standing Orders sector classification, certification/modification validity, territorial authority, saved rights, pending forums, dismissal/disciplinary merits, disputes, strikes/lock-outs, lay-off/retrenchment/closure, unfair labour practices, penalties, prosecution or remedies.

Its governed catalogue contains eight official source identities and twelve reason-code-scoped chunks. Maharashtra's 2026 Industrial Relations rules remain explicitly draft-only and exact controlled full-file mirrors remain an approval dependency.

### Wave 5H — Apprentices source and classification readiness

Wave 5H promotes `feature.legal.apprentices` into a bounded organisation-level review of:

- current Apprentices Act source status;
- the DGT-hosted Apprenticeship Rules, 1992 base-source status;
- Apprenticeship (Amendment) Rules, 2025 — G.S.R. 610(E);
- a mandatory current-Rules-versus-portal-summary reconciliation control;
- designated-versus-optional trade source classification;
- apprentice-category source classification;
- establishment manpower and engagement-band source control;
- State-variation source control;
- DGT designated- and optional-trade registers;
- Apprenticeship India / NAPS-2 lifecycle source control;
- Apprenticeship Adviser or Board authority routing;
- organisation training-infrastructure, specialist-escalation and controlled-reference statuses.

Current official source surfaces are not assumed to be synchronized. The September 2025 amendment and current Gazette/India Code material must be reconciled against older base-rule or portal-summary wording; portal copy cannot be used to calculate an establishment obligation or silently replace current statutory material.

Wave 5H does **not** decide Apprentices Act applicability, mandatory engagement, worker strength, apprentice numbers, percentage bands, State-law effects, customer role trade classification, apprentice category, individual eligibility, age/education/fitness/reservation/disability treatment, contract validity, training period/completion, stipend/payment, examination/certification, NAPS eligibility/reimbursement/DBT, competent authority, enforcement, penalty, dispute or remedy.

The governed Wave 5H catalogue contains eight official `curated-source-identity-v1` / `source-identity-only` records and twelve reason-code-scoped chunks. Exact controlled full-file Drive mirrors and a qualified consolidated current-Rules review remain approval dependencies.

## Legal and privacy status

All Wave 1–5H catalogues remain `needs-legal-review`. Complete and reported-gap outcomes remain `specialist-review`; absent required facts return `more-information-needed`. Passing software tests is implementation evidence only and does not grant legal, privacy, RAG, source-file, security or release approval.

The private-beta v3 page includes explicit in-memory panels for seventeen substantive waves. They send only strict allow-listed organisation facts, routes, categories, statuses and controlled references after the user explicitly submits. They do not save panel inputs/results and do not modify the stable report, PDF or email contracts.

Wave 5H excludes apprentice identities, date of birth/age, sex/gender, caste/community, disability or medical data, education records, Aadhaar, contact/address information, contract bodies/numbers, bank/stipend/payroll data, training dates, attendance, assessments/certificates, disputes, notices/orders, injury information and evidence bodies. Evidence arrays are reduced to controlled references only.

## What makes GrowWithHR different

- It creates a reproducible decision record rather than an untraceable AI answer.
- It preserves triggering facts, missing facts, rule version, reason code, source IDs and fingerprints.
- It treats uncertainty and specialist escalation as valid outcomes.
- It continues to provide deterministic results when RAG, the hosted provider or remote persistence is unavailable.
- It connects decisions to the Compliance Story, priorities, obligations, tasks, owners and evidence placeholders.

See `docs/ARCHITECTURE.md` and `docs/testing/all-laws-rag-validation.md` for architecture and validation details.

## Production stack

The deployed product is the root-level HTML, CSS and JavaScript application. `server.js` supplies the optional Gmail delivery API and legal explanation routes; `server-entry.js` is the CORS-aware production entrypoint used by Render. `apps/web/src` remains an archived experimental React/TypeScript UX layer and is not part of the deployed build.

## Data and persistence boundary

Assessment and workspace progress remain browser-local unless a user explicitly requests email delivery. Wave 1–5H legal-review panels are in-memory only. M6 durable-persistence contracts exist, but authentication, database connections, cloud evidence storage and cross-device resume remain disabled pending privacy, legal, security and release approval.

## Local validation

```bash
npm install
npm run verify:all-laws-rag
node tests/epf-wave3a-private-beta-checks.mjs
node tests/epf-wave3b-private-beta-checks.mjs
node tests/epf-wave3c-private-beta-checks.mjs
node tests/esi-wave4a-private-beta-checks.mjs
node tests/esi-wave4b-private-beta-checks.mjs
node tests/esi-wave4c-private-beta-checks.mjs
node tests/esi-wave4d-private-beta-checks.mjs
node tests/jurisdiction-wave5a-private-beta-checks.mjs
node tests/shops-wave5b-private-beta-checks.mjs
node tests/code-on-wages-wave5c-private-beta-checks.mjs
node tests/gratuity-wave5d-private-beta-checks.mjs
node tests/employee-compensation-wave5e-private-beta-checks.mjs
node tests/oshwc-wave5f-private-beta-checks.mjs
node tests/industrial-relations-wave5g-private-beta-checks.mjs
node tests/apprentices-wave5h-private-beta-checks.mjs
npm run test:release
npm run test:release:e2e
npm start
```

## Product boundary

GrowWithHR provides advisory information, traceability, templates and implementation starting points. It does not provide legal certification, verified compliance or professional legal, tax, payroll or employment advice.
