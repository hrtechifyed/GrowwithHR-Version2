# GrowWithHR shared Legal RAG platform architecture

**Architecture version:** 1.0.0  
**Updated:** 11 August 2026  
**Application baseline:** v0.20.2 Governed Legal RAG Private Beta  
**Effective runtime:** 57 callable / 55 substantive / 2 governance fallback / 21 active catalogues  
**Authority boundary:** deterministic rules decide; RAG retrieves permitted governed sources; the provider explains only

## 1. Purpose

GrowWithHR's legal-assurance architecture separates four activities that must not be collapsed into one AI step:

1. collecting/minimising assessment facts;
2. creating a deterministic product decision;
3. retrieving governed legal source material permitted by that decision; and
4. explaining the already-fixed result.

This design provides traceability while preventing retrieval similarity or model output from deciding legal applicability.

## 2. End-to-end architecture

```text
Browser / assessment surface
        |
        v
feature-specific client allow-list
        |
        v
server-side input normalisation
        |
        v
assessment fact contract
        |
        v
versioned deterministic rule catalogue
        |
        v
immutable decision
(status + reason + missing facts + permitted source IDs + fingerprint)
        |
        v
Legal RAG profile resolver
        |
        v
governed catalogue loader
        |
        v
source-scoped retrieval
        |
        v
retrieval fingerprint + citations
        |
        v
provider-neutral explanation contract
        |
        +--> deterministic explanation capability where explicitly invoked
        |
        +--> approved hosted provider adapter
        |
        v
strict response validator
        |
        v
minimized user-facing explanation
```

The decision exists before retrieval. Retrieval and explanation remain downstream of deterministic authority.

## 3. Non-negotiable authority boundaries

The following activities are outside RAG/provider authority:

- creating, inferring or repairing missing assessment facts;
- selecting the legally applicable jurisdiction or law;
- changing deterministic status or reason code;
- expanding the deterministic source scope;
- treating a source upload as legal approval;
- substituting one law-family result for another;
- turning draft/research sources into operative law;
- certifying compliance;
- making individual entitlement, payroll, medical, injury-causation, immigration, tax, safeguarding, enforcement or remedy decisions unless a separately approved deterministic contract expressly permits a narrow outcome.

Every active substantive legal catalogue remains `needs-legal-review` until qualified approvals are recorded.

## 4. Effective runtime composition

### 4.1 Server entrypoint

`server-entry.js` is the deployed server entrypoint. It delegates shared legal explanation handling to:

```text
server-legal-explanation-router-wave5l.js
```

The Wave 5L router is the cumulative substantive router. Wave 5M intentionally has no runtime router.

### 4.2 Cumulative Wave overlay model

The effective registry is built by the maintained cumulative modules:

```text
server-all-laws-private-beta.js
  -> Wave 3A
  -> Wave 3B
  -> Wave 3C
  -> Wave 4A
  -> Wave 4B
  -> Wave 4C
  -> Wave 4D
  -> Wave 5A
  -> Wave 5B
  -> Wave 5C
  -> Wave 5D
  -> Wave 5E
  -> Wave 5F
  -> Wave 5G
  -> Wave 5H
  -> Wave 5I
  -> Wave 5K
  -> Wave 5L
```

Each substantive overlay replaces the relevant conservative fallback profile with a law-family catalogue and deterministic feature specification while retaining the legal-review boundary.

### 4.3 Base/static registry caveat

`growwithhr-rag/data/legal-rag-profiles.v1.json` is an early architecture/base registry. It is useful as historical routing metadata but is **not sufficient to determine the current effective runtime**.

Runtime truth must be checked from the cumulative Wave 5L registry composition and `GET /api/legal-rag/status`.

### 4.4 Current invariant

| Runtime control | Current state |
|---|---:|
| Callable profiles | 57 |
| Substantive profiles | 55 |
| Governance fallback profiles | 2 |
| Active catalogues | 21 |
| Blocked callable profiles | 0 in the private-beta registry; governance fallbacks are callable only through conservative stop behaviour |

The two governance fallbacks are:

- Wave 5J Bonded and Forced Labour;
- Wave 5M Multi-country Employment.

## 5. Deterministic rule layer

Feature specifications contain:

- required organisation-level facts;
- normalisation logic;
- deterministic match/missing behaviour;
- fixed reason codes;
- permitted result statuses;
- permitted Source Register IDs;
- legal/product limitations;
- automated boundary scenarios.

Rules remain the only product applicability/status authority. Complete or reported-gap source-readiness scenarios generally return `specialist-review`. Missing required facts return `more-information-needed`.

No retrieval adapter or provider may fill facts or override these outcomes.

## 6. Legal RAG profile registry

The effective profile registry maps each feature to:

- stable feature/profile/law-family IDs;
- activation mode;
- catalogue ID;
- deterministic rule/product-rule IDs;
- bounded query terms;
- maximum chunk count;
- explanation availability;
- fallback/governance mode where applicable.

A profile is routing metadata. It does not grant source, legal or runtime approval by itself.

## 7. Governed source catalogues

`server-legal-rag-catalogs.js` loads only catalogues referenced by the effective profile registry.

A governed catalogue records controlled source identities and reason-code-scoped chunks. Substantive Wave 5 catalogues are intentionally bounded to explanation/source-readiness functions rather than broad legal interpretation.

The platform currently has 21 active catalogues across the 55 substantive profiles plus governance-fallback handling.

## 8. Source-control architecture

### 8.1 Four source states

GrowWithHR distinguishes:

1. **curated source identity** — stable runtime/catalogue identity and its validated identity fingerprint;
2. **exact official file** — raw official bytes stored in the controlled Drive source tree with SHA-256/byte length/page count;
3. **official portal/register identity** — a controlled URL/register/snapshot identity that may not have one stable PDF;
4. **draft/research material** — controlled for review but not treated as operative runtime authority.

These states must remain explicit.

### 8.2 Exact-file reconciliation — 11 August 2026

The canonical Drive Source Register now contains an `Exact File Reconciliation` sheet mapping 31 acquired official PDFs to existing Source IDs using hashes and measurements from the real stored bytes.

Repository governance record:

```text
data/legal-source-governance/exact-source-file-reconciliation-2026-08-11.v1.json
```

That record deliberately states:

```text
runtimeMigrationApplied: false
legalReviewStatus: needs-legal-review
```

Exact-file fingerprints must not silently overwrite curated source-identity fingerprints. A separately reviewed source-manifest/catalogue migration is required.

One duplicate Maharashtra Shops Rules-labelled file was quarantined because it was byte-identical to the Shops Act. The controlled Rules candidate is recorded separately in the Source Register.

### 8.3 Draft-state controls

Current Maharashtra Shops 2025 amendment and 2026 OSHWC/Industrial Relations State instruments remain draft/non-operative until exact final instruments are acquired, fingerprinted and legally approved.

## 9. Retrieval architecture

The current baseline is deterministic lexical retrieval.

The runtime receives an already-created decision and:

1. resolves the feature's effective profile;
2. resolves the profile's governed catalogue;
3. filters candidates by the decision's permitted Source Register IDs;
4. ranks only within that allowed scope;
5. returns governed chunks plus an immutable retrieval trace;
6. verifies that the decision did not change.

Every retrieval trace must record that it was not used for the decision.

Unknown/ambiguous profile/catalogue/source relationships fail closed.

## 10. Explanation/provider architecture

`growwithhr-rag/legal-explanation-contract.js` creates the protected explanation request and validates accepted output.

The provider may receive:

- the fixed deterministic decision fields required by the contract;
- retrieval/chunk/citation identifiers and governed text;
- mandatory limitations.

It must not receive arbitrary assessment objects or prohibited person-level/case evidence.

The maintained hosted adapter is Cloudflare Workers AI using the configured Llama JSON Mode model. Provider credentials remain server-only.

A provider response is rejected when it:

- changes status/reason/fingerprint;
- cites outside the retrieval trace;
- invents applicability authority;
- makes prohibited certification/legal-advice claims;
- violates required response shape/limits.

Provider failure fails closed rather than creating a substitute legal answer.

## 11. Browser and privacy architecture

Feature-specific clients construct minimal allow-listed requests. Legal-review panels are explicit-submit and in-memory only.

Prohibited provider content generally includes:

- employee/person identities;
- payroll/contribution bodies;
- medical/claim/case narratives;
- complaint/dispute bodies;
- notices/orders;
- evidence bodies;
- protected/safeguarding material not separately approved.

Stable report/PDF/email contracts remain outside the legal-review panels unless a separately reviewed release changes them.

## 12. Cross-family architecture

Dedicated law families remain non-substitutable.

Examples:

- Contract Workforce/OSHWC cannot decide EPF or ESI contractor coverage;
- EPF/ESI cannot decide OSHWC applicability;
- Generic Social Security Wave 5L cannot replace dedicated EPF/EPS/EDLI, ESI, Gratuity, Maternity Benefit or Employee's Compensation results;
- BOCW Chapter VIII and unorganised/gig/platform-worker Chapter IX remain specialist-only in the generic router.

This separation must be preserved in deterministic rules, retrieval scope and explanations.

## 13. Governance-only families

### 13.1 Wave 5J — Bonded and Forced Labour

Wave 5J remains outside substantive assessment/runtime.

Required blockers:

- exact 14 May 2026 Ministry SOP;
- exact approved/notified 2026–31 rehabilitation/welfare operational material;
- qualified Article 23 / Bonded Labour Act / BNS / Supreme Court mapping;
- human-only safeguarding approval;
- privacy/security and State/UT operational review.

The architecture must not collapse trafficking, bonded labour, forced labour, criminal liability, rescue/release or rehabilitation into one automated classifier.

### 13.2 Wave 5M — Multi-country Employment

Wave 5M is explicitly outside the current release. #141 is closed `not planned`.

The architecture must continue to contain zero substantive Wave 5M source chunks, assessment capture, cross-border data flow or provider route for this release.

## 14. Source-pack build/publication architecture

The manifest-driven builder verifies controlled source metadata and compiles governed catalogues, but it does not download/interpret law automatically.

Publication/activation requires separately recorded approvals for applicable source files, legal/section mapping, RAG, tests, security and runtime activation.

The current 11 August exact-file reconciliation is **pre-migration evidence**, not an automatic publication event.

See `legal-rag-source-pack-build-pipeline.md`.

## 15. Vector/hybrid retrieval position

A vector database is optional infrastructure, not legal authority.

Any future vector/hybrid adapter must:

- index only approved governed chunks;
- pre-filter by deterministic Source Register IDs before similarity ranking;
- preserve exact source/chunk fingerprints and citation metadata;
- produce no result when the approved scope has no match;
- pass parity/boundary tests against the deterministic baseline;
- remain replaceable without changing deterministic outcomes.

No vector store is required for the current release.

## 16. Operational/failure behaviour

The architecture is fail-closed at key boundaries:

- missing facts do not trigger model inference;
- unknown source/profile/catalogue IDs are rejected;
- provider errors do not create fallback legal conclusions;
- invalid provider citations/results are rejected;
- Wave 5J/5M scope guards prevent accidental product activation.

The M7 source lifecycle, operational-readiness and disaster-recovery controls remain part of release validation.

## 17. Release architecture

Software implementation and production certification are separate states.

The release gate requires authorised evidence for:

- LEGAL;
- PRIVACY;
- RAG;
- SOURCE-FILE;
- SECURITY; and
- RELEASE.

Programme issue: #142.

Wave 5J additionally depends on #139/#140. Wave 5M has no release dependency because it is explicitly excluded under closed #141.

## 18. Definition of current architecture completion

For the current release scope, architecture implementation is complete when:

- the 57/55/2/21 effective runtime invariant is preserved;
- every substantive feature is deterministic-first and source-scoped;
- Wave 5J remains governance/research-only;
- Wave 5M remains excluded;
- exact-file/source-identity state is auditable;
- the approved source-manifest migration passes regression;
- browser/provider privacy boundaries remain intact;
- final release evidence is tied to one approved main SHA.

Architecture implementation completion still does not grant legal or production approval; that remains an authorised human release decision.