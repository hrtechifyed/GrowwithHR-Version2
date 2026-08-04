# GrowWithHR shared legal RAG platform architecture

**Version:** 0.1.0  
**Prepared:** 4 August 2026  
**Status:** Architecture foundation; only the existing POSH threshold profile is active  
**Authority boundary:** Deterministic rules decide. RAG retrieves approved sources. The provider explains only.

## 1. Why this layer exists

The first POSH implementation proved the end-to-end pattern, but its runtime is still feature-specific:

- one hardcoded POSH chunk catalogue;
- one hardcoded POSH endpoint;
- one product-rule identifier;
- POSH-specific fallback wording;
- no architecture-wide mapping from legal feature to governed catalogue.

The shared legal RAG platform removes that duplication without weakening the legal and privacy gates.

## 2. What the preceding four governance batches established

1. **Phase 0 legal source governance** — Source Register v2 templates, an 18-feature review register, section-mapping controls and release gates.
2. **POSH assessment fact contract** — 35 planned facts with value types, collection units, evidence handling and privacy restrictions.
3. **POSH Rules page verification gate** — reproducible physical-PDF page observations plus an exact controlled-file hash verifier.
4. **Remaining POSH legal-review packet** — blank qualified-review decisions, conditions and source-scope fields that cannot be mistaken for approval.

Those changes are prerequisites for governed RAG onboarding. They did not themselves create a reusable runtime.

## 3. Target architecture

```text
Assessment answers
  -> deterministic fact mapper
  -> deterministic legal rule evaluator
  -> immutable legal decision
  -> shared legal RAG profile resolver
  -> injected approved source-chunk catalogue
  -> governed retrieval trace
  -> provider-neutral explanation request
  -> explanation provider
  -> strict response validation
  -> shared private-beta presentation
```

The following paths remain outside RAG authority:

- assessment fact creation or inference;
- legal applicability;
- status or reason-code selection;
- legal-review approval;
- report, PDF or email mutation unless separately approved.

## 4. Architecture components

### 4.1 Legal RAG profile registry

`growwithhr-rag/data/legal-rag-profiles.v1.json`

The registry contains exactly one routing profile for each legal feature in the Feature Coverage Registry. It records:

- stable profile and feature IDs;
- law-family ID;
- activation status;
- governed catalogue ID;
- deterministic rule IDs and product-rule IDs;
- governed query terms;
- maximum chunk count;
- compatibility routes;
- blockers for every inactive profile.

A profile is routing metadata only. It does not make a source, rule or feature approved.

### 4.2 Shared runtime resolver

`growwithhr-rag/legal-rag-runtime.js`

The runtime:

1. validates the architecture registry;
2. receives an already-created deterministic decision;
3. resolves exactly one active RAG profile by feature, rule ID or product-rule ID;
4. refuses blocked, ambiguous or unknown profiles;
5. requires the governed catalogue to be injected by the server layer;
6. delegates retrieval to the existing deterministic source retriever;
7. returns an immutable profile plus retrieval trace;
8. verifies that the decision was not mutated.

The runtime does not read files or call external services. This keeps catalogue loading, secrets and provider operations at the server boundary.

### 4.3 Governed source catalogues

The existing `posh-source-chunks.v1.json` remains the first catalogue. Future catalogues should follow the same controlled-source principles but may be split by feature family or approved shared family.

Examples:

```text
growwithhr-rag/data/maharashtra-shops-establishments-source-chunks.v1.json
growwithhr-rag/data/apprentices-source-chunks.v1.json
growwithhr-rag/data/child-adolescent-labour-source-chunks.v1.json
growwithhr-rag/data/oshwc-source-chunks.v1.json
growwithhr-rag/data/code-on-wages-source-chunks.v1.json
growwithhr-rag/data/social-security-epf-source-chunks.v1.json
```

A catalogue must not be registered as active until exact files, hashes, page ranges, sections, reason codes and legal-review scope are approved.

## 5. Current activation state

| Feature set | Runtime status | Catalogue status |
|---|---|---|
| POSH Internal Committee threshold | Active private beta | Existing governed POSH catalogue |
| Six remaining POSH duties | Routing profiles defined but blocked | POSH catalogue may be shared only after approved chunks and rules are added |
| Other 11 legal feature families | Routing profiles defined but blocked | No approved catalogue |

The six operational-advisory features remain outside the legal RAG path and continue to use their separate operational explanation contract.

## 6. Implementation sequence for the entire architecture

### Batch A — Shared routing runtime

- architecture-wide profile registry;
- shared resolver and catalogue injection;
- compatibility proof for the current POSH retrieval;
- blocked-profile enforcement.

### Batch B — Generic explanation orchestration

- remove POSH-specific assumptions from the explanation contract and fallback wording;
- add a generic law-family envelope;
- build one shared server service;
- preserve `/api/legal-explanation/posh` as a compatibility route;
- support future `/api/legal-explanation/:featureId` or an approved equivalent.

### Batch C — Source-pack build pipeline

- manifest-driven source verification;
- SHA-256, byte length and page-count checks;
- curated section-to-chunk generation;
- chunk content fingerprints;
- schema and cross-reference validation;
- no automatic legal interpretation or unreviewed raw-PDF ingestion.

### Batch D — Retrieval adapters

- keep the deterministic lexical retriever as the baseline;
- define a provider-neutral retriever interface;
- optionally add a vector/hybrid adapter after evaluation;
- require identical source-ID filtering and decision isolation for every adapter;
- prohibit vector similarity from expanding source scope or filling missing facts.

### Batch E — Shared endpoint and UI

- shared feature resolver;
- common cache and concurrency controls;
- provider-neutral request construction;
- strict validated response envelope;
- shared legal explanation panel;
- no automatic provider request without the existing private-beta controls.

### Batch F — Feature onboarding

For each legal feature family:

1. approve source pack and exact hash scope;
2. approve fact model and deterministic rule;
3. add reason-code-specific chunks;
4. activate its RAG profile;
5. run retrieval, provider, endpoint, UI and regression tests;
6. update the Feature Coverage Registry only after all gates pass.

## 7. Vector database position

The current governed POSH proof uses deterministic lexical metadata and does not require a vector database. A vector store is an optional retrieval implementation, not a legal decision engine or source of truth.

Any vector or hybrid adapter must:

- index only approved chunk IDs and exact content fingerprints;
- filter by the decision's approved Source Register IDs before ranking;
- preserve section, page, source-hash and chunk-hash citations;
- return no result when the approved source scope has no matching chunks;
- remain replaceable without changing deterministic decisions;
- pass parity and boundary tests against the baseline retriever.

## 8. Definition of architecture completion

The architecture is complete when:

- all 18 legal features have stable routing profiles;
- a shared server service and shared UI handle active profiles;
- catalogue loading is manifest-driven and hash-gated;
- lexical and optional vector retrieval use one interface and the same authority boundaries;
- every active feature has approved sources, deterministic rules, chunks and tests;
- adding a feature requires data and configuration, not copying a POSH-specific server or panel.
