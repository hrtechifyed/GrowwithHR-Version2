# All-laws runnable private-beta RAG

Status: Wave 1 substantive POSH implementation on the v0.20.2 private-beta line  
Date: 6 August 2026

## Objective

Every registered legal feature can use the shared endpoint:

```text
POST /api/legal-explanation/feature/:featureId
```

The implementation preserves one authority boundary for every feature:

```text
assessment answers
→ deterministic fact mapping
→ deterministic rule
→ immutable decision and reason code
→ governed retrieval
→ explanation-only provider
→ strict response validation
```

Retrieval and model output never decide applicability or control status and cannot create or change assessment facts.

## Runtime modes

### Substantive POSH statutory catalogue

Seven POSH profiles use feature-specific deterministic rules and the governed POSH statutory catalogue:

1. Internal Committee threshold;
2. policy and dissemination controls;
3. awareness, orientation and capacity-building controls;
4. notice and display controls by location;
5. complaint-mechanism, timeline, confidentiality and records controls;
6. Internal Committee composition and office or administrative-unit coverage;
7. annual-reporting controls.

The threshold profile retains its existing compatibility route. All seven profiles can use the shared feature-addressed route.

The six Wave 1 controls use catalog-defined privacy-safe facts and reason-code-scoped chunks from the controlled POSH Act, Rules and commencement records. Their catalogues remain `needs-legal-review`. Complete and reported-gap scenarios therefore produce `specialist-review`; missing required facts produce `more-information-needed`.

A `specialist-review` result is still substantive: it records the exact facts used, the deterministic control test, the gap or completion reason code, the permitted statutory sections and the next action. It is not legal certification.

### Governance fallback

The remaining 50 profiles are active private-beta routes. Until a feature-specific statutory catalogue replaces the fallback, each profile uses:

- a deterministic conservative rule;
- employee count as the minimum explicit input;
- only `more-information-needed` or `specialist-review` outcomes for valid requests;
- a governed family readiness record;
- the same retrieval-integrity guards and explanation contract as POSH.

The fallback cannot emit a substantive applicability conclusion, a compliance certification or a legal approval claim.

## Coverage

The runtime registry contains 57 active private-beta profiles:

- seven substantive POSH statutory profiles;
- 50 governance-fallback profiles across Maternity Benefit, EPF/EPS/EDLI, ESI, jurisdiction routing, State Shops and Establishments, Code on Wages, gratuity, employee compensation, OSHWC, Industrial Relations, apprentices, child and adolescent labour, bonded and forced labour, contract workforce, Social Security family routing and multi-country employment.

The fallback retrieval catalogue contains 17 governed family readiness records. Each record is explicitly marked as governance context rather than statutory legal content.

## POSH Wave 1 request boundary

The private-beta browser surface provides one in-memory form for the six Wave 1 features. It makes no automatic request and writes no browser storage. Each submission is rebuilt through a strict feature adapter before transmission.

The request boundary excludes:

- names and personal contact details;
- complaint narratives or allegations;
- evidence bodies or attachments;
- findings and case outcomes;
- complaint counts or case-level statistics.

The complaint and annual-reporting profiles process only organisational control statuses and presence indicators.

## Status endpoint

```text
GET /api/legal-rag/status
```

The response reports:

- `platformStatus: all-laws-runnable-private-beta`;
- 57 active profiles;
- zero blocked runtime profiles;
- seven substantive statutory profiles;
- 50 governance-fallback profiles;
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
- A passing test is not legal approval.
- No missing fact is inferred.
- Unknown per-location or per-unit data remains missing rather than becoming a reported gap.
- One office's facts are never generalised to another office.
- Source scope remains constrained by the deterministic decision.
- Chunk identity and content fingerprints are checked after retrieval.
- Provider output must preserve the decision status, reason code and fingerprint.
- No stable report, PDF, email, browser-storage or M6 persistence contract is changed.
- The controlled `GrowWithHR-RAG- Old` folder is not used.

## Validation

```bash
npm run test:all-laws-rag-onboarding
npm run test:all-laws-runnable-private-beta
npm run test:complete-legal-rag-platform
```

The runnable test validates all 57 profiles, 18 Wave 1 boundary scenarios, 50 fallback rule catalogues, governed retrieval, deterministic explanation construction and browser payload minimisation.

## Human-verifiable acceptance test

Run:

```bash
npm run verify:all-laws-rag
```

The runtime portion is accepted only when it reports `valid: true`, `profileCount: 57`, `activeProfileCount: 57`, `blockedProfileCount: 0`, `statutoryProfiles: 7`, `wave1Profiles: 6`, `wave1Scenarios: 18` and `governanceFallbackProfiles: 50`.

The separate onboarding-readiness output remains the source of truth for pending qualified legal, source, privacy, RAG and release approvals. Runtime availability must not be presented as approval.
