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

The private-beta registry contains 57 runnable feature profiles: one POSH Internal Committee threshold profile with a statutory catalogue and 56 conservative governance-fallback profiles across the other registered legal features. Fallback profiles return only `more-information-needed` or `specialist-review` until controlled law-specific rules and source packs replace them.

## What makes GrowWithHR different

- It creates a reproducible decision record rather than an untraceable AI answer.
- It preserves triggering facts, missing facts, rule version, reason code, source IDs and fingerprints.
- It treats uncertainty and specialist escalation as valid outcomes.
- It continues to provide deterministic results when RAG, the hosted provider or remote persistence is unavailable.
- It connects decisions to the Compliance Story, priorities, obligations, tasks, owners and evidence placeholders.

See `docs/architecture/compliance-engine-differentiation.md` for the detailed architecture and `docs/testing/all-laws-rag-validation.md` for the all-laws validation procedure.

## Production stack

The deployed product is the root-level HTML, CSS and JavaScript application. `server.js` supplies the optional Gmail delivery API and legal explanation routes; `server-entry.js` is the CORS-aware production entrypoint used by Render. `apps/web/src` remains an archived experimental React/TypeScript layer and is not part of the deployed build.

## Data and persistence boundary

Assessment and workspace progress remain browser-local unless a user explicitly requests email delivery. M6 durable-persistence contracts exist, but authentication, database connections, cloud evidence storage and cross-device resume remain disabled pending privacy, legal, security and release approval.

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
