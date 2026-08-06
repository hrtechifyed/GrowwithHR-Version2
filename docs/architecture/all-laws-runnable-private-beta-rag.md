# All-laws runnable private-beta RAG

Status: implemented on a stacked review branch  
Date: 6 August 2026

## Objective

Every registered legal feature can use the shared endpoint:

```text
POST /api/legal-explanation/feature/:featureId
```

The implementation preserves one authority boundary for every feature:

```text
assessment answers
→ deterministic rule
→ governed retrieval
→ explanation-only provider
```

Retrieval and model output never decide applicability and cannot create or change assessment facts.

## Runtime modes

### Statutory catalogue

The POSH Internal Committee threshold continues to use:

- its existing deterministic threshold rule;
- the governed POSH statutory source catalogue;
- reason-code-scoped statutory chunks;
- the existing compatibility route.

### Governance fallback

All other profiles are active private-beta profiles. Until a feature-specific statutory catalogue replaces the fallback, each profile uses:

- a deterministic conservative rule;
- employee count as the minimum explicit input;
- only `more-information-needed` or `specialist-review` outcomes;
- a governed family readiness record;
- the same retrieval integrity guards and explanation contract as POSH.

The fallback cannot emit:

- `applicable`;
- `likely-applicable`;
- `not-currently-applicable`;
- a compliance certification;
- a legal approval claim.

## Coverage

The runtime registry contains 57 active private-beta profiles:

- one POSH statutory profile;
- 56 governance-fallback profiles across POSH duties, Maternity Benefit, EPF/EPS/EDLI, ESI, jurisdiction routing, State Shops and Establishments, Code on Wages, gratuity, employee compensation, OSHWC, Industrial Relations, apprentices, child and adolescent labour, bonded and forced labour, contract workforce, Social Security family routing and multi-country employment.

The fallback retrieval catalogue contains 17 governed family readiness records. Each record is explicitly marked:

```text
sourceRole: governance-readiness-record
legalContent: false
```

A readiness record is source-grounded governance context. It is not statutory text.

## Request behavior

A fallback request with no employee-count input returns:

```text
more-information-needed
```

A fallback request with a non-negative employee count returns:

```text
specialist-review
```

This makes every route executable without inventing a feature-specific threshold, exemption, commencement date, contribution rate, entitlement or State/country rule.

## Status endpoint

```text
GET /api/legal-rag/status
```

The response reports:

- `platformStatus: all-laws-runnable-private-beta`;
- 57 active profiles;
- zero blocked runtime profiles;
- statutory versus governance-fallback catalogue modes;
- the active retrieval mode;
- explicit limitations.

## Corpus replacement path

For each fallback feature, the governance record is replaced only after the following are complete:

1. exact controlled official source identities and fingerprints;
2. reviewed section and physical-page mappings;
3. approved assessment facts and privacy boundaries;
4. deterministic rule and boundary scenarios;
5. curated reason-code-specific chunks;
6. legal, privacy, RAG, security, test and runtime decisions;
7. catalogue compilation and integrity verification.

Replacement changes the profile catalogue and feature rule, not the shared endpoint or explanation contract.

## Safety properties

- Blank review fields are not approval.
- No missing fact is inferred.
- No fallback rule makes a positive or negative applicability conclusion.
- Source scope remains constrained by the deterministic decision.
- Chunk identity and content fingerprints are checked after retrieval.
- Provider output must preserve the decision status, reason code and fingerprint.
- No report, PDF, email, browser-storage or M6 persistence contract is changed.
- The controlled `GrowWithHR-RAG- Old` folder is not used.

## Validation

```bash
npm run test:all-laws-rag-onboarding
npm run test:all-laws-runnable-private-beta
npm run test:complete-legal-rag-platform
```

The runnable test validates all 57 profiles, all 56 fallback rule catalogues, governed retrieval and deterministic explanation construction.
