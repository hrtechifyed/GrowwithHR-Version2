# GrowWithHR governed legal RAG runtime

**Updated:** 11 August 2026  
**Application baseline:** v0.20.2 Governed Legal RAG Private Beta  
**Effective runtime:** 57 callable profiles / 55 substantive profiles / 2 governance fallbacks / 21 active catalogues  
**Legal status:** all active legal catalogues remain `needs-legal-review`

This directory contains the governed retrieval, citation and explanation layer used after GrowWithHR's deterministic legal-rule engine has already produced a fixed result.

It is **not** a legal decision engine. Retrieval and provider output have no applicability authority.

## Mandatory execution order

```text
Protected feature input
  -> feature-specific normalisation / assessment fact contract
  -> deterministic legal-rule catalogue
  -> immutable decision
  -> effective Legal RAG profile resolution
  -> governed catalogue loading
  -> source-scoped retrieval
  -> retrieval fingerprint and citations
  -> provider-neutral explanation request
  -> optional approved provider
  -> strict response validation
  -> minimized user-facing response
```

The deterministic decision must exist before retrieval.

Every retrieval path must preserve:

```text
usedForDecision: false
applicabilityAuthority: none
```

The provider cannot create facts, change the status/reason code, expand permitted source scope, select another legal family or certify compliance.

## Current runtime composition

The effective server runtime is built from the maintained Wave overlay modules, not from the original static profile JSON alone.

`server-entry.js` delegates shared legal explanation requests to:

```text
server-legal-explanation-router-wave5l.js
```

The Wave 5L router composes the cumulative all-laws private-beta registry and feature specifications built by the earlier Wave overlays.

Current invariant:

| Control | Count/state |
|---|---:|
| Callable profiles | 57 |
| Substantive profiles | 55 |
| Governance fallback profiles | 2 |
| Active catalogues | 21 |
| Wave 5J | Governance/research-only |
| Wave 5M | Out of current release scope |

### Important registry note

`growwithhr-rag/data/legal-rag-profiles.v1.json` is an early/base architecture registry and must not be used by itself to infer the effective 11 August runtime. The later `server-all-laws-private-beta-wave*.js` overlays progressively replace fallback profiles with substantive feature-specific catalogues. Repository/runtime claims should be made from the effective Wave 5L composition and `GET /api/legal-rag/status`.

## Current substantive families

The 55 substantive profiles cover:

- POSH — 7;
- Maternity Benefit — 10;
- EPF/EPS/EDLI — 12;
- ESI — 15;
- Appropriate Government — 1;
- Maharashtra Shops and Establishments — 1;
- Code on Wages — 1;
- Gratuity — 1;
- Employee's Compensation — 1;
- OSHWC — 1;
- Industrial Relations — 1;
- Apprentices — 1;
- Child and Adolescent Labour — 1;
- Contract Workforce — 1; and
- Generic Social Security family routing — 1.

Most Wave 5 families are intentionally **source-readiness/routing controls**, not automatic statutory applicability or individual-entitlement engines. Their complete/reported-gap outcomes remain `specialist-review`; missing required facts remain `more-information-needed`.

## Governance fallbacks

### Wave 5J — Bonded and Forced Labour

Wave 5J is a deliberate research/safeguarding stop. There is no approved assessment contract, substantive runtime rule, governed source-chunk catalogue, browser panel or provider route.

It remains blocked by:

- #139 — exact Ministry SOP referenced as issued 14 May 2026 and exact approved/notified 2026–31 rehabilitation/welfare operational material;
- #140 — qualified Article 23 / 1976 Act / BNS / Supreme Court mapping, human safeguarding design, privacy/security and State/UT review.

Live coercion, trafficking, confinement, violence, threat, retaliation, rescue or similar case narratives must not enter the normal RAG/provider path.

### Wave 5M — Multi-country Employment

Wave 5M is excluded from the current release. #141 is closed `not planned`.

Required current state:

- no country pair;
- no operating model;
- no assessment fact contract/person-level mobility intake;
- no substantive deterministic rule;
- no runtime source catalogue/chunks;
- no browser/provider route;
- no cross-border data flow design.

The current product must not attempt immigration, tax residence, permanent establishment, payroll withholding, social-security coverage, applicable foreign employment law or cross-border transfer determinations.

## Governed catalogue loading

`server-legal-rag-catalogs.js` loads the catalogues selected by the effective profile registry. Each substantive catalogue is constrained by its feature profile and deterministic decision.

A profile/catalogue relationship does not itself constitute legal approval. Catalogue records continue to carry `needs-legal-review` until authorised evidence is recorded.

The loader/runtime must reject or fail closed on unknown catalogue/source relationships rather than broadening the source scope.

## Source identity versus exact official files

GrowWithHR keeps two related but distinct fingerprints:

1. **curated source-identity fingerprint** — the identifier/fingerprint already used by validated runtime source records;
2. **official-file fingerprint** — SHA-256 from the exact raw official PDF/file bytes stored in the controlled Drive source tree.

These must not be silently substituted for one another.

As of 11 August 2026, the canonical Drive `Source Register.xlsx` contains an **Exact File Reconciliation** sheet mapping 31 acquired official PDFs to existing Source IDs with:

- actual-file SHA-256;
- byte length;
- physical PDF page count;
- Drive identity/path and controlled classification.

The repository governance record is:

```text
data/legal-source-governance/exact-source-file-reconciliation-2026-08-11.v1.json
```

`runtimeMigrationApplied` remains `false`. The exact-file evidence must be reviewed before any source-manifest/catalogue migration changes runtime metadata.

One duplicate Maharashtra Shops Rules-labelled file was quarantined because its bytes were identical to the Shops Act. Draft Maharashtra instruments remain draft/non-operative even when exact draft bytes are controlled.

## Retrieval behaviour

The baseline retrieval implementation is governed lexical retrieval. It ranks only within the source/chunk scope permitted by the fixed deterministic decision.

A retrieval trace records data such as:

- feature/profile/rule identifiers;
- deterministic decision fingerprint;
- status and reason code;
- permitted Source Register IDs;
- retrieved chunk IDs;
- source/chunk fingerprints;
- page/section references;
- official URLs/citation metadata;
- retrieval fingerprint;
- `usedForDecision: false`;
- `applicabilityAuthority: none`.

Retrieval must not:

- infer missing assessment facts;
- select Central versus State/UT law;
- add an unregistered source;
- use one law family to replace another family's result;
- upgrade draft/research material into operative source material;
- change a deterministic outcome.

## Explanation contract

`growwithhr-rag/legal-explanation-contract.js` builds the protected provider request and validates accepted responses.

A provider response is accepted only when it preserves the fixed decision and governed retrieval contract. Validation includes:

- exact status/reason/fingerprint preservation;
- citation membership in the retrieval trace;
- required limitations;
- no unapproved applicability/decision claims;
- no certification or legal-advice claim;
- no provider authority to change the decision.

Malformed, unsupported or decision-changing provider output fails closed.

## Provider implementation

The maintained server-only adapter is:

```text
growwithhr-rag/cloudflare-workers-ai-provider.cjs
```

Configured provider/model baseline:

```text
Provider: Cloudflare Workers AI
Model: @cf/meta/llama-3.1-8b-instruct-fast
Structured output: JSON Mode
Free-only deployment guard: true
```

The adapter is an explanation provider only. Secrets remain server-side.

Typical server-only values:

```text
CLOUDFLARE_ACCOUNT_ID=<account ID>
CLOUDFLARE_WORKERS_AI_API_TOKEN=<token>
CLOUDFLARE_WORKERS_AI_FREE_ONLY=true
LEGAL_EXPLANATION_ENDPOINT_ENABLED=true
```

Optional controls include provider timeout, cache TTL, failure backoff, maximum concurrency and queue size.

Provider failure has no alternate legal-decision path. It must fail closed rather than use another model to invent a result.

## Shared API

Primary shared feature route:

```text
POST /api/legal-explanation/feature/:featureId
```

Status route:

```text
GET /api/legal-rag/status
```

Compatibility routes may exist for earlier features, but the effective shared router is the Wave 5L router. Wave 5M intentionally has no router overlay.

The status endpoint is the authoritative runtime smoke check for the effective profile/catalogue counts.

## Browser/privacy boundary

Legal-review panels are explicit-submit and in-memory only. Feature clients build minimal allow-listed payloads.

Prohibited provider content depends on the feature contract but generally includes person-level identities, payroll/contribution bodies, medical/case narratives, complaint/dispute bodies, notices/orders and evidence bodies.

The legal-review panels do not automatically mutate stable report, PDF or email contracts.

## Source-pack build/publication boundary

`growwithhr-rag/source-pack-builder.js` and `scripts/build-legal-rag-catalog.mjs` implement manifest validation, exact-file verification where configured, catalogue compilation and publication gates.

Publication is not equivalent to file upload. Exact file acquisition, legal review, section mapping, RAG approval and runtime activation are separate controls.

See `docs/architecture/legal-rag-source-pack-build-pipeline.md` for the current 11 August source-migration process.

## Validation

Use:

```bash
npm install --no-audit --no-fund
npm run verify:all-laws-rag
npm run test:complete-legal-rag-platform
node tests/bonded-forced-labour-wave5j-research-governance-checks.mjs
node tests/multi-country-employment-wave5m-scope-guard-checks.mjs
npm run test:m7
```

The release procedure and complete family regression list are maintained in:

```text
docs/testing/all-laws-rag-validation.md
docs/releases/legal-rag-release-readiness-2026-08-11.md
```

Expected effective invariant:

```json
{
  "profileCount": 57,
  "substantiveProfiles": 55,
  "governanceFallbackProfiles": 2,
  "activeCatalogs": 21
}
```

## Release boundary

The software stack is integrated, but green CI, source acquisition and live smoke are not legal/privacy/security/release approval.

Programme gate #142 remains open. Active catalogues remain `needs-legal-review`. Wave 5J remains blocked under #139/#140. Wave 5M is outside the current release under closed #141.

The current release can be prepared and tested, but production certification must wait for named authorised reviewers and the final release decision.