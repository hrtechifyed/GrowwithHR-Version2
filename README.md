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

The Wave 4C stacked private-beta registry contains 57 runnable feature profiles:

- seven POSH profiles use feature-specific deterministic rules and the governed POSH statutory catalogue;
- ten Maternity Benefit profiles use feature-specific deterministic rules and a governed Social Security Code, Central Rules, commencement and corrigendum catalogue;
- five EPF Wave 3A operational profiles use feature-specific deterministic rules and a governed Social Security Code, EPF Scheme, commencement and corrigendum catalogue;
- five EPF, EPS and EDLI Wave 3B profiles use feature-specific deterministic verification or routing rules and a governed seven-source catalogue;
- two EPF Wave 3C profiles use feature-specific deterministic specialist-control rules and a governed exemption and international-worker source catalogue;
- five ESI Wave 4A profiles use feature-specific deterministic employer-control rules and a governed six-source catalogue;
- five ESI Wave 4B profiles use deterministic coverage and source-routing rules and a governed seven-source catalogue;
- three ESI Wave 4C profiles use deterministic special-route, benefit-process and medical-administration control rules and a governed seven-source catalogue;
- 15 profiles use conservative governance-fallback rules until their law-specific rules, official source packs and approvals are complete.

### Wave 1 — POSH

The seven substantive POSH profiles cover Internal Committee threshold, policy and dissemination, awareness and training, location-specific notice display, complaint and records controls, committee composition and unit coverage, and annual reporting.

### Wave 2 — Maternity Benefit

The ten substantive Maternity Benefit profiles cover establishment coverage, employee eligibility route, benefit-duration category, adopting or commissioning mother route, special-leave controls, nursing-break controls, crèche controls, notice/payment/records, employment protection and ESI overlap.

### Wave 3A — EPF operational controls

The five substantive EPF profiles cover establishment coverage, member-inclusion controls, monthly contribution-process controls, contractor controls, and records and returns.

### Wave 3B — EPF, EPS and EDLI verification and routing

The five substantive Wave 3B profiles cover EPF wage-ceiling source review, EPF contribution-rate source verification, EPS membership routing, EPS pension-process controls, and EDLI coverage and process controls.

Wave 3B accepts only controlled wage bands, declared rate branches, routing statuses, process-control statuses and evidence references. It does not select the legally applicable 10% or 12% contribution branch, calculate contributions, determine individual EPF or EPS membership, calculate a pension or insurance benefit, or decide a claim. The exact official S.O. 320(E) rate source, current EDLI rate authority and transition or savings treatment remain subject to qualified legal review.

### Wave 3C — EPF specialist controls

The two substantive Wave 3C profiles cover EPF exemption governance and source controls, and international-worker and Social Security Agreement controls.

Wave 3C records whether an organisation has controlled exemption, trust, returns, inspection, international-worker population, SSA routing, certificate-of-coverage, expiry-monitoring and specialist-escalation controls. It does not determine that an establishment is exempt, interpret an establishment-specific exemption order, infer a person's country or nationality, validate a certificate, determine international-worker or excluded-employee status, or decide individual EPF or EPS membership. Establishment-specific orders, country-specific agreements and administrative arrangements remain subject to qualified legal review.

### Wave 4A — ESI employer operational controls

The five substantive Wave 4A profiles cover establishment source and registration controls, employee-insurance process controls, contractor and principal-employer controls, monthly payment and return-process controls, and accident-register and reporting controls.

Wave 4A accepts only controlled organisation statuses, a declared coverage route and evidence references. It does not decide ESI applicability, area or benefit commencement, hazardous or plantation routes, a current wage ceiling, an applicable contribution rate, individual insured-person status, contribution amounts, accident causation, benefit entitlement, medical administration, exemption or enforcement outcomes. The 1950 Central Rules are retained only as historical or transition context, and the 1950 General Regulations are retained only as saved-law candidates pending qualified legal review.

### Wave 4B — ESI coverage and source routing

The five substantive Wave 4B profiles cover continuing and voluntary coverage routing, area and benefit-commencement source review, Chapter IV wage-ceiling source review, contribution-period ceiling continuation and contribution-rate source verification.

Wave 4B accepts only organisation-level source, routing and escalation statuses plus evidence references. It does not decide continuing or voluntary coverage, territorial applicability, benefit availability, contribution commencement, a Chapter IV wage-ceiling amount, individual continuation, an applicable rate or any contribution amount. S.O. 2351(E) is used only as a controlled continuation source that depends on a separately notified Chapter IV ceiling; it is not represented as supplying that ceiling. The exact Chapter IV ceiling notification and complete area-notification set remain controlled gaps.

### Wave 4C — ESI benefit and medical controls

The three substantive Wave 4C profiles cover seasonal, hazardous and plantation route controls; organisation-level benefit-process support controls; and medical-administration source routing.

Wave 4C does not classify a seasonal factory, hazardous occupation or plantation route, decide a claim, validate a medical certificate, process diagnoses or treatment records, select a medical provider, determine a benefit scale or decide individual benefit entitlement. S.O. 2352(E) is retained only as a controlled medical-practitioner authority source. State and Union Territory implementation sources, the hazardous-occupation notification, plantation opt-in instruments, saved-regulation treatment and the other-beneficiaries user-charge instrument remain controlled gaps.

The Wave 1, Wave 2 and Wave 3A–4C profiles remain `needs-legal-review`. Their permitted private-beta outcomes are `specialist-review` and `more-information-needed`; they do not certify compliance, calculate payroll or contributions, decide individual insurance or entitlement, or represent qualified legal approval.

The private-beta v3 page includes explicit in-memory review panels for all eight waves. They send only strict allow-listed organisational facts, categories, bands, routes, statuses, counts and evidence references after the user chooses to submit. They do not save inputs or results. Wave 4C excludes names, contact details, Aadhaar, insurance numbers, wages, payroll and contribution records, diagnoses, certificates, prescriptions, treatment records, family details, accident narratives, claims and evidence bodies.

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

Assessment and workspace progress remain browser-local unless a user explicitly requests email delivery. The Wave 1, Wave 2 and Wave 3A–4C review panels are in-memory only. M6 durable-persistence contracts exist, but authentication, database connections, cloud evidence storage and cross-device resume remain disabled pending privacy, legal, security and release approval.

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
npm run test:release
npm run test:release:e2e
npm start
```

## Product boundary

GrowWithHR provides advisory information, traceability, templates and implementation starting points. It does not provide legal certification, verified compliance or professional legal, tax, payroll or employment advice.
