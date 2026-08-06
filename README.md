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

The private-beta registry contains 57 runnable feature profiles:

- seven POSH profiles use feature-specific deterministic rules and the governed POSH statutory catalogue;
- ten Maternity Benefit profiles use feature-specific deterministic rules and a governed Social Security Code, Central Rules, commencement and corrigendum catalogue;
- five EPF operational profiles use feature-specific deterministic rules and a governed Social Security Code, EPF Scheme, commencement and corrigendum catalogue;
- 35 profiles use conservative governance-fallback rules until their law-specific rules, official source packs and approvals are complete.

### Wave 1 — POSH

The seven substantive POSH profiles cover Internal Committee threshold, policy and dissemination, awareness and training, location-specific notice display, complaint and records controls, committee composition and unit coverage, and annual reporting.

### Wave 2 — Maternity Benefit

The ten substantive Maternity Benefit profiles cover establishment coverage, employee eligibility route, benefit-duration category, adopting or commissioning mother route, special-leave controls, nursing-break controls, crèche controls, notice/payment/records, employment protection and ESI overlap.

### Wave 3A — EPF operational controls

The five substantive EPF profiles cover establishment coverage, member-inclusion controls, monthly contribution-process controls, contractor controls, and records and returns.

Wave 3A deliberately excludes contribution-rate selection, wage ceilings, exemptions, international-worker treatment, EPS membership or pension routing, and EDLI coverage or rates. Those profiles remain on conservative governance fallback until their exact notification and transition sources are approved.

The Wave 1, Wave 2 and Wave 3A profiles remain `needs-legal-review`. Their permitted private-beta outcomes are `specialist-review` and `more-information-needed`; they do not certify compliance, calculate payroll, decide an individual entitlement or membership, or represent qualified legal approval.

The private-beta v3 page includes explicit in-memory control-review panels for all three waves. They send only strict allow-listed organisational facts, categories, bands, statuses, counts and evidence references after the user chooses to submit. They do not save inputs or results. The EPF panel excludes names, UANs, employee-level wages, payroll rows, contribution histories, ECR bodies, bank details, claims, completed forms and evidence bodies.

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

Assessment and workspace progress remain browser-local unless a user explicitly requests email delivery. The Wave 1, Wave 2 and Wave 3A control-review panels are in-memory only. M6 durable-persistence contracts exist, but authentication, database connections, cloud evidence storage and cross-device resume remain disabled pending privacy, legal, security and release approval.

## Local validation

```bash
npm install
npm run verify:all-laws-rag
node tests/epf-wave3a-private-beta-checks.mjs
npm run test:release
npm run test:release:e2e
npm start
```

## Product boundary

GrowWithHR provides advisory information, traceability, templates and implementation starting points. It does not provide legal certification, verified compliance or professional legal, tax, payroll or employment advice.
