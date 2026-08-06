# All-laws runnable private-beta RAG

Status: Wave 1 POSH and Wave 2 Maternity Benefit substantive implementation on the v0.20.2 private-beta line  
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

Retrieval and model output never decide applicability, control status or individual entitlement and cannot create or change assessment facts.

## Runtime modes

### POSH statutory catalogue

Seven POSH profiles use feature-specific deterministic rules and the governed POSH Act, Rules and commencement catalogue. They cover Internal Committee threshold, policy, awareness and training, notice display, complaint and records controls, committee composition and unit coverage, and annual reporting.

### Maternity Benefit statutory catalogue

Ten Maternity Benefit profiles use feature-specific deterministic rules and a governed catalogue based on the controlled Code on Social Security, Central Rules, commencement and corrigendum identities. They cover:

1. establishment coverage;
2. employee eligibility route;
3. benefit-duration category;
4. adopting or commissioning mother route;
5. special-leave controls;
6. nursing-break controls;
7. crèche controls;
8. notice, payment and records controls;
9. employment-protection controls;
10. Maternity Benefit and ESI overlap.

Wave 2 uses controlled organisation facts, categories, bands and statuses. It does not collect or process names, medical narratives, certificates, exact event dates, child details, adoption or surrogacy documents, completed claims, ESI identifiers, bank details, disciplinary evidence or completed forms.

Both substantive catalogues remain `needs-legal-review`. Complete and reported-gap scenarios produce `specialist-review`; missing required facts produce `more-information-needed`. A substantive result records the exact facts, rule, reason code, permitted source sections and next action, but does not certify compliance or decide an entitlement.

### Governance fallback

The remaining 40 profiles are active private-beta routes. Until a feature-specific statutory catalogue replaces the fallback, each uses a conservative deterministic rule, a governed family readiness record and only review-oriented outcomes. The fallback cannot emit a substantive applicability conclusion, compliance certification or legal approval claim.

## Coverage

The runtime registry contains 57 active private-beta profiles:

- seven substantive POSH profiles;
- ten substantive Maternity Benefit profiles;
- 40 governance-fallback profiles across EPF/EPS/EDLI, ESI, jurisdiction routing, State Shops and Establishments, Code on Wages, gratuity, employee compensation, OSHWC, Industrial Relations, apprentices, child and adolescent labour, bonded and forced labour, contract workforce, Social Security family routing and multi-country employment.

The runtime loads three governed catalogues: POSH statutory, Maternity Benefit statutory and all-laws governance fallback.

## Browser request boundary

The v3 private-beta page provides explicit in-memory panels for Wave 1 and Wave 2. Neither panel makes an automatic request or writes browser storage. Each submission is rebuilt through a strict feature adapter before transmission.

The Wave 2 panel exposes ten controlled review forms and excludes free-form medical, family, claim and dispute content. It does not modify stable assessment, report, PDF, email or M6 persistence contracts.

## Status endpoint

```text
GET /api/legal-rag/status
```

The response reports:

- `platformStatus: all-laws-runnable-private-beta`;
- 57 active profiles;
- zero blocked runtime profiles;
- 17 substantive statutory profiles;
- 40 governance-fallback profiles;
- the active retrieval mode;
- explicit limitations.

## Corpus replacement path

For each fallback feature, the governance record is replaced only after controlled official source identities and fingerprints, reviewed mappings, approved facts and privacy boundaries, deterministic scenarios, reason-code-specific chunks, legal/privacy/RAG/security/test/runtime decisions and catalogue-integrity verification are complete.

Replacement changes the profile catalogue and feature rule, not the shared endpoint or explanation contract.

## Safety properties

- Blank review fields are not approval.
- Passing software tests are not legal approval.
- No missing fact is inferred.
- Unsupported State appropriate-Government material is not resolved from Central Rules.
- Establishment facts are not generalised across offices or entities.
- Source scope remains constrained by the deterministic decision.
- Chunk identity and content fingerprints are checked after retrieval.
- Provider output must preserve status, reason code and fingerprint.
- No stable report, PDF, email, browser-storage or M6 persistence contract is changed.

## Validation

```bash
npm run test:all-laws-rag-onboarding
npm run test:all-laws-runnable-private-beta
npm run test:complete-legal-rag-platform
```

The maintained runnable test validates all 57 profiles, 18 Wave 1 scenarios, 30 Wave 2 scenarios, 40 fallback catalogues, governed retrieval, deterministic explanation construction and browser payload minimisation.

## Human-verifiable acceptance test

Run:

```bash
npm run verify:all-laws-rag
```

The runtime portion is accepted only when it reports `valid: true`, `profileCount: 57`, `activeProfileCount: 57`, `blockedProfileCount: 0`, `substantiveProfiles: 17`, `wave2Profiles: 10`, `wave2Scenarios: 30` and `governanceFallbackProfiles: 40`.

The separate onboarding-readiness output remains the source of truth for pending qualified legal, source, privacy, RAG and release approvals. Runtime availability must not be presented as approval.
