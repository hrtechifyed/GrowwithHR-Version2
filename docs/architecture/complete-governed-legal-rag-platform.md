# Complete governed legal RAG platform

**Version:** 1.0.0  
**Prepared:** 5 August 2026  
**Status:** Platform implemented; corpus activation remains approval-gated  
**Authority boundary:** Deterministic rules decide. Retrieval ranks only approved source chunks. The provider explains only.

## Delivered platform

The repository now contains one reusable legal RAG path:

```text
validated assessment subset
  -> deterministic fact mapper
  -> deterministic legal rule evaluator
  -> immutable decision and Source Register allow-list
  -> legal RAG profile resolution
  -> safe manifest-driven catalogue loading
  -> provider-neutral retrieval adapter
       -> lexical baseline, or
       -> deterministic local hybrid ranking
  -> immutable retrieval trace and citations
  -> explanation-only provider contract
  -> shared feature-addressed endpoint
  -> shared browser client
```

The existing `POST /api/legal-explanation/posh` route remains a compatibility route. The shared route is:

```text
POST /api/legal-explanation/feature/:featureId
```

Deployment-safe platform status is available at:

```text
GET /api/legal-rag/status
```

## Retrieval adapters

`growwithhr-rag/legal-retrieval-adapters.js` defines the common adapter contract.

Every adapter must declare:

- `retrievalRole: source-retrieval-only`;
- `applicabilityAuthority: none`;
- whether it uses an external network;
- a stable adapter ID and mode.

The adapters cannot expand the deterministic decision's Source Register allow-list. Returned chunks are checked again after retrieval. Decision mutation, source-scope expansion, reason-code expansion, ungoverned chunks, duplicate chunks and content-fingerprint drift fail closed.

### Lexical adapter

The lexical adapter preserves the existing deterministic retriever and its retrieval fingerprint. It is the default and compatibility baseline.

### Hybrid adapter

The hybrid adapter:

1. obtains candidates through the governed lexical retriever;
2. therefore inherits source-ID and reason-code filtering before ranking;
3. computes a deterministic local sparse-vector similarity over governed query terms and approved chunk text;
4. combines lexical and vector-like scores;
5. returns the same citation fields and content fingerprints.

It makes no network call and introduces no embedding provider, vector database, or second model provider.

Choose the server mode with:

```text
LEGAL_RAG_RETRIEVAL_MODE=lexical
LEGAL_RAG_RETRIEVAL_MODE=hybrid
```

Unknown modes fail closed.

## Catalogue loading

`server-legal-rag-catalogs.js` replaces hardcoded server catalogue assumptions for the shared route.

It:

- reads only repository-declared JSON catalogue paths;
- rejects absolute paths and path traversal;
- loads active or explicitly private-beta catalogue descriptors;
- validates the minimum governed retrieval shape;
- fingerprints each checked-in catalogue with SHA-256;
- refuses startup of an active profile when its catalogue is unavailable.

It does not download official files, parse PDFs, approve a manifest, or change an activation status.

## Shared endpoint

`server-legal-explanation-router.js` provides one route for every profile.

A request is rejected before service/provider creation when:

- the feature is unknown;
- the profile is blocked;
- the feature has no approved request adapter;
- the catalogue is unavailable;
- the endpoint is disabled;
- the request body violates its feature allow-list.

The route keeps one service instance per feature so existing cache, in-flight sharing, concurrency, queue, and provider-failure backoff controls remain effective.

## Shared browser client

`js/assessment-v3/legal-explanation-api-client.js` provides:

- feature-addressed endpoint resolution;
- feature-specific minimum-field extraction;
- request construction;
- timeout handling;
- generic response-boundary validation.

It makes no automatic request and writes no browser storage. The existing POSH panel remains the current private-beta presentation and compatibility surface.

## Current activation boundary

This platform implementation does not approve or activate any additional legal feature.

The following remain blocked until their controlled decision records contain explicit legal, privacy, RAG, source, section, test, security, release, and runtime approvals:

- remaining POSH duties;
- Maternity Benefit;
- PF/EPF, EPS and EDLI;
- ESI;
- every family in the legal-source readiness register.

Blank reviewer fields, source registration, an internal self-review, a section map, a fact contract, a review packet, a compiled manifest, or a passing software test is not approval.

## Definition of platform completion

The reusable technical platform is complete when all of the following exist, which this batch provides:

- profile-based routing;
- manifest-driven catalogue loading;
- lexical and hybrid retrieval behind one interface;
- strict deterministic source filtering;
- immutable retrieval traces and citations;
- generic provider orchestration;
- shared endpoint and status route;
- shared browser client;
- compatibility with the current POSH route;
- contract tests wired into M2.

Feature content onboarding remains a separate approval-dependent process. It requires approved deterministic rules and approved reason-code-specific chunks for each feature before its profile can become active.
