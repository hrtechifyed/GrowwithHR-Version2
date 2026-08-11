# GrowWithHR governed legal RAG runtime

**Updated:** 11 August 2026  
**Application baseline:** v0.20.3-prototype.1 Governed Compliance & Legal RAG Prototype  
**Effective runtime:** 57 callable profiles / 55 substantive profiles / 2 governance fallbacks / 21 active catalogues  
**Legal status:** all active legal catalogues remain `needs-legal-review`

This directory contains the governed retrieval, citation and explanation layer used after GrowWithHR's deterministic legal-rule engine has already produced a fixed result.

It is **not** a legal decision engine. Retrieval and provider output have no applicability authority.

## Prototype source basis

This release is a research-grade prototype. The accepted source basis is structured secondary research with controlled provenance. Exact official-file verification is supplementary assurance and is not a prototype release prerequisite.

Prototype source rules:

- secondary-research provenance must not be represented as official or counsel-approved provenance;
- draft/research/guidance/portal classifications remain explicit;
- all active catalogues remain `needs-legal-review`;
- exact-file evidence may be retained separately without replacing validated runtime source identities;
- no prototype output may claim legal opinion, legal certification or proof of compliance.

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

**Retrieval happens only after a deterministic decision.** The deterministic decision must exist before retrieval.

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

Wave 5J is a deliberate research/safeguarding stop. There is no substantive assessment contract, runtime rule, governed source-chunk catalogue, browser panel or provider route.

#139 and #140 remain a future activation programme, not a blocker for the current prototype because Wave 5J is non-runtime.

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

A profile/catalogue relationship does not itself constitute legal approval. Catalogue records continue to carry `needs-legal-review`.

The loader/runtime must reject or fail closed on unknown catalogue/source relationships rather than broadening the source scope.

## Runtime source identity, secondary research and exact-file evidence

GrowWithHR now distinguishes three related source-control concepts:

1. **runtime source identity** — the identifier/fingerprint already used by validated catalogue/source contracts;
2. **secondary-research provenance** — the accepted research basis for the current prototype;
3. **exact-file fingerprint** — supplementary SHA-256 evidence from stored file bytes where available.

These concepts must not be silently substituted for one another.

As of 11 August 2026, the canonical Drive `Source Register.xlsx` contains an **Exact File Reconciliation** sheet mapping 31 acquired files to existing Source IDs with:

- actual-file SHA-256;
- byte length;
- physical PDF page count;
- Drive identity/path and controlled classification.

The repository governance record is:

```text
data/legal-source-governance/exact-source-file-reconciliation-2026-08-11.v1.json
```

`runtimeMigrationApplied` remains `false`. That is acceptable for the prototype release. The exact-file evidence is supplementary audit assurance and does not need to replace the current validated runtime identities before `v0.20.3-prototype.1` can be published.

One duplicate Maharashtra Shops Rules-labelled file was quarantined because its bytes were identical to the Shops Act. Draft Maharashtra instruments remain draft/non-operative even when exact draft bytes are controlled.

Future exact official-source hardening remains tracked under #143 and future production certification under #142.

## Retrieval behaviour

The baseline retrieval implementation is governed lexical retrieval. **The current baseline does not use embeddings or a vector database.** It ranks only within the source/chunk scope permitted by the fixed deterministic decision.

A retrieval trace records data such as:

- feature/profile/rule identifiers;
- deterministic decision fingerprint;
- status and reason code;
- permitted Source Register IDs;
- retrieved chunk IDs;
- source/chunk fingerprints;
- page/section references;
- source URLs/citation metadata;
- retrieval fingerprint;
- `usedForDecision: false`;
- `applicabilityAuthority: none`.

Retrieval must not infer missing facts, select Central versus State/UT law, add an unregistered source, substitute one law family for another, upgrade draft/research material into operative law, or change a deterministic outcome.

## Explanation contract

`growwithhr-rag/legal-explanation-contract.js` builds the protected provider request and validates accepted responses. This is the **provider-neutral explanation contract**: a provider **cannot change the deterministic decision**.

A provider response is accepted only when it preserves the fixed decision and governed retrieval contract. Validation includes exact status/reason/fingerprint preservation, citation membership in the retrieval trace, mandatory limitations, no unapproved applicability claim and no certification/legal-advice claim.

Malformed, unsupported or decision-changing provider output must **fail closed**.

## Provider implementation

The maintained server-only adapter is:

```text
growwithhr-rag/cloudflare-workers-ai-provider.cjs
```

Configured provider/model baseline:

```text
Provider: Cloudflare Workers AI
Model: @cf/meta/llama-3.1-8b-instruct-fast
Structured response: Cloudflare JSON Mode
Response envelope: result.response
Free-only deployment guard: true
```

The hosted provider uses **Cloudflare JSON Mode** and the validated structured response is read from `result.response`. The adapter is explanation-only and secrets remain server-side.

Typical server-only values:

```text
CLOUDFLARE_ACCOUNT_ID=<account ID>
CLOUDFLARE_WORKERS_AI_API_TOKEN=<token>
CLOUDFLARE_WORKERS_AI_FREE_ONLY=true
LEGAL_EXPLANATION_ENDPOINT_ENABLED=true
```

Optional controls include provider timeout, cache TTL, failure backoff, maximum concurrency and queue size.

There is **no second hosted provider** in the legal explanation path. Provider failure has no alternate legal-decision path and must **fail closed** rather than use another model to invent a result.

## Shared API

Primary shared feature route:

```text
POST /api/legal-explanation/feature/:featureId
```

Status route:

```text
GET /api/legal-rag/status
```

The original POSH compatibility route remains documented and tested:

```text
POST /api/legal-explanation/posh
```

The endpoint concurrency contract proves that **50 simultaneous** identical POSH explanation requests share one provider request. This protects free-provider capacity and does not change the deterministic decision.

Compatibility routes may exist for earlier features, but the effective shared router is the Wave 5L router. Wave 5M intentionally has no router overlay.

## Browser/privacy boundary

Legal-review panels are explicit-submit and in-memory only. Feature clients build minimal allow-listed payloads.

Prohibited provider content depends on the feature contract but generally includes person-level identities, payroll/contribution bodies, medical/case narratives, complaint/dispute bodies, notices/orders and evidence bodies.

The legal-review panels do not automatically mutate stable report, PDF or email contracts.

## Source-pack build/publication boundary

`growwithhr-rag/source-pack-builder.js` and `scripts/build-legal-rag-catalog.mjs` implement manifest validation, exact-file verification where configured, catalogue compilation and publication gates.

For the prototype, publication may rely on governed secondary-research identities when their provenance and limitations are explicit. Exact file acquisition, legal review, official-source hardening and runtime fingerprint migration are separate future production controls unless a specific prototype catalogue explicitly requires exact-file verification.

See `docs/architecture/legal-rag-source-pack-build-pipeline.md` for the source-migration model.

## Validation

Use:

```bash
npm install --no-audit --no-fund
npm run verify:all-laws-rag
npm run test:complete-legal-rag-platform
node tests/bonded-forced-labour-wave5j-research-governance-checks.mjs
node tests/multi-country-employment-wave5m-scope-guard-checks.mjs
npm run test:m7
npm run test:server-cors
npm run test:release
npm run test:release:e2e
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

The research-grade prototype may be published as a GitHub prerelease when the exact candidate SHA is green, the source basis is represented truthfully, `needs-legal-review` is preserved, and Wave 5J/Wave 5M remain non-substantive.

Programme issue #142 now tracks **future production-grade certification** and does not block the prototype. #143 tracks future exact official-source hardening and also does not block the prototype.

The prototype must still be represented as advisory research software, not professional legal advice or compliance certification.