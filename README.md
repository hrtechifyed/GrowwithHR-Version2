# GrowWithHR

GrowWithHR is a deterministic, traceable HR compliance advisory engine. It records explicit organisation facts, applies versioned deterministic rules, retrieves governed source material only after the decision, and uses AI only to explain the fixed result.

## Current release

- Application version: `0.20.2`
- Release: Governed Legal RAG Private Beta
- Public assessment: `/analyze-company.html`
- Private-beta Compliance DNA route: `/analyze-company-v3.html`
- Private-beta feature flag: `complianceDnaV3: false`
- Shared legal explanation route: `POST /api/legal-explanation/feature/:featureId`
- Legal RAG status route: `GET /api/legal-rag/status`
- Main integration: legal-RAG stack through Wave 5M integrated on 10 August 2026

The deployed product remains the root-level HTML/CSS/JavaScript application. `apps/web/src` remains an **archived experimental React/TypeScript UX layer** and is not part of the deployed build.

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

Deterministic rules decide. RAG retrieves governed material. The hosted model explains only. Retrieval and provider output cannot create assessment facts, choose applicable law, change status/reason/missing facts/source scope, or certify compliance.

Complete and reported-gap substantive outcomes remain `specialist-review`. Missing required facts return `more-information-needed`.

## Main-integrated Legal RAG coverage

The main-integrated private-beta registry contains **57 callable feature profiles / 55 substantive profiles / 2 governance-fallback profiles / 21 active catalogues**.

Substantive coverage includes:

- seven POSH profiles;
- ten Maternity Benefit profiles;
- twelve EPF/EPS/EDLI profiles across Waves 3A–3C;
- fifteen ESI profiles across Waves 4A–4D;
- Appropriate Government Wave 5A;
- Maharashtra Shops and Establishments Wave 5B;
- Code on Wages Wave 5C;
- Gratuity Wave 5D;
- Employee's Compensation Wave 5E;
- OSHWC Wave 5F;
- Industrial Relations Wave 5G;
- Apprentices Wave 5H;
- Child and Adolescent Labour Wave 5I;
- Contract Workforce Wave 5K; and
- Generic Social Security family routing Wave 5L.

The two governance-fallback profiles are:

1. **Wave 5J — Bonded and Forced Labour.** Research/safeguarding only. No assessment fact contract, browser panel, substantive rule, runtime catalogue or provider route is allowed while the current legal/safeguarding/source blockers remain open.
2. **Wave 5M — Multi-country Employment.** Outside the supported jurisdictional scope until one country pair, operating model, specialist jurisdictional approval and cross-border data approval are selected. It has no assessment capture, runtime catalogue, browser surface or provider route.

## Wave 5 boundaries

### Wave 5A — Appropriate Government
Records cross-code jurisdiction/source readiness and escalation only. It does not select the legally appropriate Government, governing State/UT, source set, forum or applicable law.

### Wave 5B — Maharashtra Shops and Establishments
Records Maharashtra source and organisation-control readiness only. The 2025 amendment record remains draft-only; official re-checks on 10 August 2026 did not identify an exact final instrument. The wave does not decide coverage, thresholds, registration, working conditions, penalties or enforcement.

### Wave 5C — Code on Wages
Records Code/Rules, commencement/version, jurisdiction routing, rate-source-register and State/UT-instrument controls. It does not select wage rates/categories/zones/scheduled employment, perform payroll arithmetic or determine individual entitlement/remedy.

### Wave 5D — Gratuity
Records Chapter V, First Schedule, Central Rules, commencement/transition and organisation-level source controls. It does not determine customer coverage, employee eligibility, continuous service, wages, gratuity amount, nomination, forfeiture, claims or remedies.

### Wave 5E — Employee's Compensation
Records Chapter VII, schedules, Central Rules, transition, ESI-overlap and organisation-level process/authority controls. It does not decide accident/disease causation, diagnosis, disablement, dependency, liability, wages, compensation, claims or remedies.

### Wave 5F — OSHWC
Records a bounded Central/Maharashtra route, Code/Central Rules/commencement, generic establishment controls and draft-versus-final reconciliation. Maharashtra's 2026 OSHWC Labour and Factories/Other Ports rules remain draft-only after the 10 August 2026 official re-check. The wave does not decide applicability, thresholds, classification, registration/licensing, working conditions, incidents or enforcement.

### Wave 5G — Industrial Relations
Records current Code/Rules, transition/amendment, Model Standing Orders, Maharashtra draft reconciliation, standing-orders source controls and authority routing. Maharashtra's current State rules remain draft-only after the 10 August 2026 official re-check. It does not decide Chapter IV applicability, worker thresholds, certification, disputes, strikes/lock-outs, retrenchment/closure, penalties or remedies.

### Wave 5H — Apprentices
Records current Act/Rules/amendment, current-Rules-versus-portal reconciliation, trade/category classification-source, manpower/band, State-variation, portal/NAPS, authority and training-infrastructure controls. It does not decide Act applicability, mandatory engagement, counts, individual eligibility, contracts, stipend, certification, NAPS/DBT, enforcement or remedies.

### Wave 5I — Child and Adolescent Labour
Safeguarding-first organisation-level source readiness only. It does not accept identifying/case-level child data or decide age/status, work, hazardous classification, exceptions, offences, rescue, prosecution, rehabilitation or remedies. Live safeguarding concerns must leave the RAG route for an approved human process.

### Wave 5J — Bonded and Forced Labour
Research-only governance stop. Current blockers include the exact Ministry SOP referenced by NHRC as issued on 14 May 2026, the exact approved/notified 2026–31 rehabilitation/welfare operational plan, qualified cross-framework legal mapping, human-only safeguarding design, privacy/security controls and State/UT operational review. Current official research confirms the SOP's existence/date but the exact Ministry-hosted file remains uncontrolled; the public Ministry surface still exposes the 2021 rehabilitation scheme and no exact 2026–31 operational plan has been controlled.

### Wave 5K — Contract Workforce
Bounded cross-family readiness over OSHWC Chapter XI Part I with **separate** EPF and ESI contractor dependencies. An OSHWC result cannot determine EPF/ESI outcomes and EPF/ESI results cannot determine OSHWC applicability. Maharashtra OSHWC rules remain draft-only.

### Wave 5L — Generic Social Security family routing
A chapter/source-family router, not a generic applicability engine. Dedicated EPF/EPS/EDLI, ESI, Gratuity, Maternity Benefit and Employee's Compensation results remain separate. BOCW Chapter VIII and unorganised/gig/platform-worker Chapter IX remain specialist-only routes.

### Wave 5M — Multi-country Employment
Governance-only jurisdiction/data gate. The feature remains outside supported scope until a single country pair and operating model are selected and exact employment, immigration, tax/treaty/payroll/PE, social-security/SSA and cross-border-data source/approval packs exist. It does not decide applicable employment law, work authorisation, tax residency, permanent establishment, payroll withholding, social-security coverage, EOR/PEO legality, cross-border transfer legality, termination, forum or remedy.

## Source governance

The platform distinguishes exact controlled full files from `source-identity-only` records, official portal/programme context, draft instruments and historical/research sources.

The active Drive Source Register was reconciled through Wave 5M on 10 August 2026 and now records the later-wave identities/research leads while reusing shared exact Social Security/EPF/ESI files rather than duplicating them. Where an exact controlled file does not exist, hashes/page counts are not invented.

Current source-file hardening remains open for source-identity-only records and for the Wave 5J exact SOP / 2026–31 operational-plan blockers. Maharashtra draft instruments remain draft-only until exact final official instruments are acquired, fingerprinted and approved.

## Privacy and product-surface boundary

Substantive private-beta legal-review panels are explicit-submit and in-memory only. They send strict allow-listed organisation-level controls and controlled reference identifiers. They do not save panel inputs/results or change stable report, PDF or email contracts.

Person-level identities, payroll/contribution rows, medical/case data, complaint/dispute bodies, notices/orders and evidence bodies remain excluded unless a separately approved flow explicitly permits them. Wave 5J and Wave 5M have no browser/provider product surface.

## Validation

The main-integration PR was validated on the exact integration head with:

- All-Laws RAG Private Beta — success;
- Executive Assessment Tests — success;
- M4 Report Integration — success;
- M7 RAG-Ready Hardening — success; and
- repository-wide GrowWithHR CI — success.

Local legal-RAG validation includes:

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
node tests/social-security-wave5l-private-beta-checks.mjs
node tests/multi-country-employment-wave5m-scope-guard-checks.mjs
npm run test:complete-legal-rag-platform
```

## Approval boundary

Main integration and green CI are software evidence only. **LEGAL, PRIVACY, RAG, SOURCE-FILE, SECURITY and RELEASE approvals remain open**, with additional safeguarding, State/UT finality/variation, section-mapping, assessment-fact, deterministic-rule and cross-border-data gates where applicable.

GrowWithHR provides advisory information, traceability, templates and implementation starting points. It does not provide legal certification, verified compliance or professional legal, tax, payroll or employment advice.
