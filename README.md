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

The Wave 5K stacked private-beta registry contains 57 runnable feature profiles:

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
- one Child and Adolescent Labour Wave 5I profile;
- one Contract Workforce Wave 5K profile;
- three profiles using conservative governance-fallback rules until law-specific sources and rules complete review.

The resulting runtime mix is **57 callable / 54 substantive / 3 governance fallback / 20 catalogues**, with zero blocked runtime profiles. Wave 5J remains a research-only Bonded and Forced Labour governance layer and does not add a substantive catalogue or product surface.

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

Wave 5G records Industrial Relations Code/Rules, commencement/transition, the 2026 amendment, Model Standing Orders, Maharashtra draft-rule reconciliation, standing-orders threshold/classification, adoption/certification, authority, legacy savings, escalation and controlled-reference statuses. It does not decide Chapter IV applicability, thresholds, industrial-establishment/sector classification, certification validity, disciplinary/dispute outcomes, strikes/lock-outs, retrenchment/closure, penalties or remedies.

### Wave 5H — Apprentices source and classification readiness

Wave 5H reviews current Apprentices Act/Rules/amendment status, current-Rules-versus-portal reconciliation, trade/category classification-source controls, establishment manpower/band, State variation, trade registers, portal/NAPS lifecycle, authority routing, training infrastructure, escalation and controlled references. It does not decide Act applicability, mandatory engagement, counts/bands, trade/person classification, individual eligibility, contract/stipend/certification, NAPS/DBT, enforcement or remedy.

### Wave 5I — Child and Adolescent Labour safeguarding source readiness

Wave 5I reviews current Act/Rules/Schedule sources, privacy-safe classification-source and exception-source controls, State variation and human safeguarding escalation. It is not case management, an emergency service, age inference or safeguarding risk scoring. It does not determine a person's age/status, work, hazardous classification, exception, offence, rescue, prosecution, rehabilitation or remedy. Any live safeguarding concern must leave the RAG route for an approved human process.

### Wave 5J — Bonded and Forced Labour specialist research boundary

Wave 5J follows the handoff requirement to complete specialist legal and safeguarding research **before assessment capture**. `feature.legal.bonded-forced-labour` remains on governance fallback. The research packet records the constitutional, 1976 Act/Rules, criminal-law, jurisprudence, rehabilitation-transition and safeguarding source leads, while blocking runtime promotion until the May 2026 Ministry SOP, 2026–31 rehabilitation/welfare transition materials, qualified cross-framework mapping, human safeguarding, privacy/security and State/UT controls are resolved.

Wave 5J creates no assessment fact contract, case intake, browser panel, statutory RAG catalogue, provider narrative route or new server router. Coercion, debt, recruitment, movement and retaliation remain research topics rather than automated indicators.

### Wave 5K — Contract Workforce cross-family source readiness

Wave 5K promotes `feature.legal.contract-workforce` into a bounded organisation-level review built on the existing OSHWC foundation. It records:

- OSHWC Code, Central Rules and commencement source status;
- Chapter XI Part I scope and threshold source controls;
- principal-employer and contractor classification-source controls;
- contractor licensing and work-order/portal-intimation source controls;
- welfare and wage-responsibility source controls;
- core-activity classification source control;
- Maharashtra draft-versus-final reconciliation;
- **separate** EPF contractor-control and ESI contractor-control dependency statuses;
- OSHWC/EPF/ESI cross-family reconciliation, authority/escalation and controlled references.

The governed Wave 5K catalogue contains eight sources and twelve reason-code-scoped chunks. Four OSHWC records remain `curated-source-identity-v1` / `source-identity-only`; four Social Security/EPF/ESI records reuse exact controlled files and fingerprints from the existing governed packs.

The cross-family boundary is strict. An OSHWC Contract Workforce result cannot establish EPF membership/contributions or ESI insurance/contributions. EPF or ESI contractor results cannot establish OSHWC contract-labour applicability. Dependency status is orchestration metadata, not a substitute legal conclusion.

Maharashtra's 2026 OSHWC Labour Rules remain draft-only. Wave 5K cannot decide OSHWC Chapter XI Part I applicability, thresholds, principal-employer/contractor classification, licence requirement/validity, fees/security, work-order validity, welfare breach, wage default/recovery, core-activity classification/prohibition, exemption, EPF/ESI substantive outcomes, State-law applicability, authority jurisdiction, inspection, penalty, prosecution, dispute or remedy.

## Legal and privacy status

All substantive Wave 1–5K catalogues remain `needs-legal-review`. Complete and reported-gap outcomes remain `specialist-review`; absent required facts return `more-information-needed`. Wave 5J remains `research-only-blocked`. Passing software tests is implementation evidence only and does not grant legal, privacy, safeguarding, RAG, source-file, security or release approval.

The private-beta v3 page includes explicit in-memory panels for substantive legal-review waves. They send only strict allow-listed organisation facts, routes, categories, statuses and controlled references after explicit submission. They do not save panel inputs/results and do not modify the stable report, PDF or email contracts. Wave 5J adds no browser panel.

Wave 5K excludes contractor/worker identities, contact/address data, PAN/GST/registration identifiers, contract or work-order bodies, worker rosters, UAN/IP numbers, payroll/wage/contribution rows, attendance/schedules, bank/payment/invoice data, licences/certificates, notices/orders/disputes, accident/medical information and evidence bodies. Evidence arrays are reduced to controlled reference identifiers only.

## What makes GrowWithHR different

- It creates a reproducible decision record rather than an untraceable AI answer.
- It preserves triggering facts, missing facts, rule version, reason code, source IDs and fingerprints.
- It treats uncertainty and specialist escalation as valid outcomes.
- It continues to provide deterministic results when RAG, the hosted provider or remote persistence is unavailable.
- It connects decisions to the Compliance Story, priorities, obligations, tasks, owners and evidence placeholders.

See `docs/ARCHITECTURE.md` and `docs/testing/all-laws-rag-validation.md` for architecture and validation details.

## Production stack

The deployed product is the root-level HTML, CSS and JavaScript application. `server.js` supplies optional delivery and explanation APIs; `server-entry.js` is the CORS-aware production entrypoint used by Render. `apps/web/src` remains an archived experimental React/TypeScript UX layer and is not part of the deployed build.

## Data and persistence boundary

Assessment and workspace progress remain browser-local unless a user explicitly requests email delivery. Legal-review panels are in-memory only. Wave 5J adds no assessment or persistence surface. M6 durable-persistence contracts exist, but authentication, database connections, cloud evidence storage and cross-device resume remain disabled pending privacy, legal, security and release approval.

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
node tests/child-adolescent-labour-wave5i-private-beta-checks.mjs
node tests/bonded-forced-labour-wave5j-research-governance-checks.mjs
node tests/contract-workforce-wave5k-private-beta-checks.mjs
npm run test:release
npm run test:release:e2e
npm start
```

## Product boundary

GrowWithHR provides advisory information, traceability, templates and implementation starting points. It does not provide legal certification, verified compliance or professional legal, tax, payroll or employment advice.
