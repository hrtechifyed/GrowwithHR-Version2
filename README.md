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
- 50 profiles use conservative governance-fallback rules until their law-specific rules, official source packs and approvals are complete.

The seven substantive POSH private-beta profiles are:

1. Internal Committee threshold;
2. policy and dissemination controls;
3. awareness, orientation and capacity-building controls;
4. notice and display controls by location;
5. complaint-mechanism, confidentiality, timeline and records controls;
6. Internal Committee composition and office or administrative-unit coverage;
7. annual-reporting controls.

The six Wave 1 control profiles remain `needs-legal-review`. Their permitted outcomes are `specialist-review` and `more-information-needed`; they do not certify compliance or represent qualified legal approval.

The private-beta v3 page includes an explicit in-memory Wave 1 control-review panel. It sends only strict allow-listed organisational control facts after the user chooses to submit. It does not save inputs or results and excludes names, complaint narratives, allegations, evidence bodies, findings, personal contact details and case-level statistics.

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

Assessment and workspace progress remain browser-local unless a user explicitly requests email delivery. The Wave 1 control-review panel is in-memory only. M6 durable-persistence contracts exist, but authentication, database connections, cloud evidence storage and cross-device resume remain disabled pending privacy, legal, security and release approval.

## Local validation

```bash
npm install
npm run verify:all-laws-rag
npm run test:release
npm run test:release:e2e
npm start
```

## Product boundary

GrowWithHR provides advisory information, traceability, templates and implementation starting points. It does not provide legal certification, verified compliance or professional legal, tax, payroll or employment advice.
