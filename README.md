# GrowWithHR

GrowWithHR is a deterministic, traceable HR compliance advisory engine for founders, business leaders and People teams. It records explicit company facts, applies versioned rules, retrieves governed source material after the decision and uses AI only to explain the fixed result.

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

Deterministic rules decide. RAG retrieves governed material. The hosted model explains only. Retrieval and provider output cannot create assessment facts, change applicability, expand the source scope or certify compliance.

## Legal RAG coverage

The Wave 5F stacked private-beta registry contains 57 runnable feature profiles:

- seven POSH profiles use feature-specific deterministic rules and the governed POSH statutory catalogue;
- ten Maternity Benefit profiles use feature-specific deterministic rules and a governed Social Security Code, Central Rules, commencement and corrigendum catalogue;
- five EPF Wave 3A operational profiles use feature-specific deterministic rules and a governed Social Security Code, EPF Scheme, commencement and corrigendum catalogue;
- five EPF, EPS and EDLI Wave 3B profiles use feature-specific deterministic verification or routing rules and a governed seven-source catalogue;
- two EPF Wave 3C profiles use feature-specific deterministic specialist-control rules and a governed exemption and international-worker source catalogue;
- five ESI Wave 4A profiles use feature-specific deterministic employer-control rules and a governed six-source catalogue;
- five ESI Wave 4B profiles use deterministic coverage and source-routing rules and a governed seven-source catalogue;
- three ESI Wave 4C profiles use deterministic special-route, benefit-process and medical-administration control rules and a governed seven-source catalogue;
- two ESI Wave 4D profiles use deterministic exemption-governance and enforcement-authority source-routing rules and a governed eight-source catalogue;
- one Appropriate Government Wave 5A profile uses a deterministic cross-code source-readiness and escalation review with a governed nine-source catalogue;
- one Maharashtra Shops and Establishments Wave 5B profile uses a deterministic State source-readiness and organisational-control review with a governed five-source catalogue;
- one Code on Wages Wave 5C profile uses a deterministic organisation-level source-readiness, version, jurisdiction-routing and specialist-escalation review with a governed seven-source catalogue;
- one Gratuity Wave 5D profile uses a deterministic Chapter V, First Schedule, transition and organisational-control review with a governed four-source catalogue;
- one Employee's Compensation Wave 5E profile uses a deterministic Chapter VII, schedule, ESI-overlap, transition and organisational-process review with a governed four-source catalogue;
- one OSHWC Wave 5F profile uses a deterministic bounded Central/Maharashtra source-readiness, generic establishment-control and State draft-final reconciliation review with a governed five-source-identity catalogue;
- 7 profiles use conservative governance-fallback rules until their law-specific rules, official source packs and approvals are complete.

### Wave 1 — POSH

The seven substantive POSH profiles cover Internal Committee threshold, policy and dissemination, awareness and training, location-specific notice display, complaint and records controls, committee composition and unit coverage, and annual reporting.

### Wave 2 — Maternity Benefit

The ten substantive Maternity Benefit profiles cover establishment coverage, employee eligibility route, benefit-duration category, adopting or commissioning mother route, special-leave controls, nursing-break controls, crèche controls, notice/payment/records, employment protection and ESI overlap.

### Waves 3A–3C — EPF, EPS and EDLI

Wave 3A covers establishment, member-inclusion, monthly-process, contractor, records and returns controls. Wave 3B covers wage-ceiling and contribution-rate source verification, EPS membership and pension routing, and EDLI coverage and process controls. Wave 3C covers exemption governance and international-worker or Social Security Agreement controls.

These waves do not calculate contributions, select the legally applicable 10% or 12% branch, decide individual EPF or EPS membership, determine pension or EDLI benefits, validate exemption orders or Certificates of Coverage, or decide claims. Missing rate, exemption, country-specific, transition and historical sources remain qualified-review dependencies.

### Waves 4A–4D — ESI

Wave 4A covers establishment, employee-insurance, contractor, payment/return and accident-register controls. Wave 4B covers continuing or voluntary coverage, area commencement, wage-ceiling source, ceiling-continuation and contribution-rate source routing. Wave 4C covers seasonal, hazardous or plantation route controls, benefit-process support and medical-administration routing. Wave 4D covers exemption governance and enforcement-authority source routing.

The ESI waves do not decide applicability, territorial coverage, current wage ceilings, contribution-rate branches, contribution amounts, individual insured-person status, accident causation, claims, medical entitlement, exemptions, liability, recovery, penalties, prosecution or jurisdiction. Saved-law treatment, area notifications, State implementation and customer-specific documents remain qualified-review dependencies.

### Wave 5A — Appropriate Government source routing

The Wave 5A profile reviews whether relevant labour-code definitions, Central-rule source sets, exact State or Union Territory materials, establishment and activity classification controls, multi-location routing, effective-date controls and specialist escalation are recorded.

Wave 5A does not choose the legally appropriate Government, applicable law, State source set, forum or jurisdiction. The Social Security Code and Social Security Central Rules reuse controlled-file fingerprints. Other cross-code records remain clearly labelled source-identity snapshots until exact controlled files are verified.

### Wave 5B — Maharashtra Shops source controls

The Wave 5B profile reviews only organisation-level Maharashtra source readiness and controls:

- declared Maharashtra source scope;
- 2017 Act and 2018 Rules source status;
- amendment and notification register status;
- draft-versus-final reconciliation;
- establishment-classification and worker-count-band controls;
- registration or intimation source control;
- working-condition source control;
- effective-date/version control;
- specialist escalation and controlled evidence references.

Wave 5B does not decide whether the Maharashtra Act applies, whether registration or intimation is required, which employee-count threshold applies, how an establishment is classified, working hours, leave, night work, welfare, safety, records, penalties or enforcement.

The catalogue contains five official source identities and eight reason-code-scoped chunks. The November 2025 amendment remains explicitly a **draft** notification. Proposed changes cannot be treated as final or operative without a separately controlled final instrument and qualified Maharashtra legal review. No State or Union Territory other than Maharashtra is onboarded by this wave.

### Wave 5C — Code on Wages source readiness

The Wave 5C profile promotes `feature.legal.code-on-wages` from the governance fallback into a bounded organisation-level review of Code, Rules, commencement, version, jurisdiction and bounded source-register controls.

Wave 5C does **not** select an individual's minimum wage, wage rate, wage category, zone, scheduled employment, applicable Government or State instrument. It performs no payroll, bonus, deduction, overtime, wage-period, entitlement, arrears, damages or remedy arithmetic and does not decide whether an employee is owed any amount.

### Wave 5D — Gratuity source readiness

The Wave 5D profile promotes `feature.legal.social-security.gratuity` from the governance fallback into a bounded organisation-level review of:

- declared source route;
- Code on Social Security Chapter V, sections 53–58 source status;
- First Schedule Chapter V applicability-source status;
- Social Security (Central) Rules, 2026 Chapter V, Rules 31–34 source status;
- commencement and corrigendum source controls;
- transition from the Payment of Gratuity (Central) Rules, 1972 under the 2026 Rules' supersession-and-savings clause;
- establishment-classification and workforce-category source controls;
- authority/process source control, specialist escalation and controlled references.

Wave 5D does **not** decide whether Chapter V applies to a customer, classify an establishment, count employees, determine an individual's eligibility, continuous service, fixed-term status, wages, gratuity amount, nomination, forfeiture, insurance, claim, appeal, recovery or remedy.

The governed retrieval catalogue contains four exact controlled Social Security files and eight reason-code-scoped chunks. Wave 5D reuses their registered SHA-256 fingerprints rather than introducing unverified source-file claims. State and Union Territory instruments and customer-specific facts remain qualified-review dependencies.

### Wave 5E — Employee's Compensation source readiness

The Wave 5E profile promotes `feature.legal.social-security.employee-compensation` from the governance fallback into a bounded organisation-level review of Chapter VII, applicability and occupational-disease/compensation-factor schedules, current Central Rules, commencement and transition, ESI-overlap routing, employer process, authority/process, specialist escalation and controlled references.

Wave 5E does **not** decide whether Chapter VII applies to a customer or worker, whether ESI applies, whether an accident or occupational disease arose out of or in the course of employment, diagnosis, causation, disablement, dependency, employer liability, monthly wages, compensation amount, interest, damages, claim, appeal, recovery or remedy. The Third and Sixth Schedules are retrieval/source-control inputs only; they are not used to diagnose a condition or calculate compensation.

The governed retrieval catalogue contains the same four exact controlled Social Security files and nine reason-code-scoped chunks. Wave 5E reuses their registered SHA-256 fingerprints and introduces no new unverified source-file claims. State and Union Territory instruments, customer-specific facts and individual injury/entitlement matters remain qualified-review dependencies.

### Wave 5F — OSHWC source readiness

The Wave 5F profile promotes `feature.legal.oshwc` from the governance fallback into a bounded organisation-level Central/Maharashtra source-readiness review of:

- a declared Central, Maharashtra general-labour, Maharashtra factory/other-port, mixed, multi-location or unresolved candidate source route;
- the Occupational Safety, Health and Working Conditions Code, 2020 source identity;
- the Occupational Safety, Health and Working Conditions (Central) Rules, 2026 source identity;
- S.O. 5321(E), dated 21 November 2025 commencement-source status;
- the Maharashtra OSHWC (Labour) Rules, 2026 **draft** source identity;
- the Maharashtra OSHWC (Factories and Other Ports) Rules, 2026 **draft** source identity;
- a mandatory draft-versus-final State-rule reconciliation control;
- generic establishment-scope, registration, core safety/health/welfare, hours/leave/records, authority/enforcement and specialist-escalation source controls;
- an explicit boundary that defers contract labour, inter-State migrant workers and other Chapter XI special-category determinations.

Wave 5F does **not** decide Code applicability, worker-count thresholds, establishment or industry classification, factory/mine/port/plantation/building-work status, registration or licence liability, safety-standard sufficiency, working hours, overtime, leave, women-night-work conditions, accident-reporting sufficiency, inspection, penalty, prosecution or remedy. It cannot treat either Maharashtra draft as final or operative.

The governed retrieval catalogue contains five official source identities and ten reason-code-scoped chunks. The Code and Central Rules identities reuse existing Wave 5A registrations; the commencement and Maharashtra draft identities are curated source snapshots pending exact controlled full-file mirrors. Any final Maharashtra rule instrument must be separately acquired, fingerprinted and approved before it can replace a draft-source control. Contract workforce remains a later handoff item and preserves separate EPF/ESI dependencies.

## Legal and privacy status

All Wave 1–5F catalogues remain `needs-legal-review`. Complete and reported-gap outcomes remain `specialist-review`; absent required facts return `more-information-needed`. No wave certifies compliance or creates an individual entitlement, contribution, claim, exemption, enforcement, jurisdiction, applicable-wage, Gratuity-amount, Employee's Compensation liability/amount, OSHWC applicability/working-condition/enforcement or State-law conclusion.

The private-beta v3 page includes explicit in-memory review panels for fifteen substantive waves. They send only strict allow-listed organisational facts, categories, bands, routes, statuses, counts and controlled references after the user chooses to submit. They do not save inputs or results.

Wave 5F excludes names, contact details, addresses, registration numbers, employee identities, age or sex data, work schedules, attendance, payroll, wages, appointment letters, medical or health records, accident or dangerous-occurrence narratives, licences, certificates, notices, orders, penalties, disputes and evidence bodies. Only organisation-level source-control statuses and controlled references are sent.

## What makes GrowWithHR different

- It creates a reproducible decision record rather than an untraceable AI answer.
- It preserves triggering facts, missing facts, rule version, reason code, source IDs and fingerprints.
- It treats uncertainty and specialist escalation as valid outcomes.
- It continues to provide deterministic results when RAG, the hosted provider or remote persistence is unavailable.
- It connects decisions to the Compliance Story, priorities, obligations, tasks, owners and evidence placeholders.

See `docs/architecture/compliance-engine-differentiation.md` for the detailed architecture and `docs/testing/all-laws-rag-validation.md` for the all-laws validation procedure.

## Production stack

The deployed product is the root-level HTML, CSS and JavaScript application. `server.js` supplies the optional Gmail delivery API and legal explanation routes; `server-entry.js` is the CORS-aware production entrypoint used by Render. `apps/web/src` remains an archived experimental React/TypeScript UX layer and is not part of the deployed build.

## Data and persistence boundary

Assessment and workspace progress remain browser-local unless a user explicitly requests email delivery. The Wave 1–5F review panels are in-memory only. M6 durable-persistence contracts exist, but authentication, database connections, cloud evidence storage and cross-device resume remain disabled pending privacy, legal, security and release approval.

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
npm run test:release
npm run test:release:e2e
npm start
```

## Product boundary

GrowWithHR provides advisory information, traceability, templates and implementation starting points. It does not provide legal certification, verified compliance or professional legal, tax, payroll or employment advice.
