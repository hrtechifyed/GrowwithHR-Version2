# Validate RAG across all registered legal profiles

**Release:** v0.20.2 private-beta branch  
**Purpose:** prove that every profile is runnable and that retrieval and explanation remain outside the deterministic decision.

## One-command acceptance test

```bash
npm install
npm run verify:all-laws-rag
```

The command runs the maintained 57-profile runtime test and then prints the separate legal-source onboarding-readiness snapshot.

## Required runtime pass indicators

```json
{
  "valid": true,
  "profileCount": 57,
  "activeProfileCount": 57,
  "blockedProfileCount": 0,
  "substantiveProfiles": 17,
  "substantivePoshProfiles": 7,
  "substantiveMaternityProfiles": 10,
  "wave1Profiles": 6,
  "wave1Scenarios": 18,
  "wave2Profiles": 10,
  "wave2Scenarios": 30,
  "governanceFallbackProfiles": 40,
  "fallbackSources": 17,
  "fallbackChunks": 17,
  "poshSources": 3,
  "maternitySources": 4,
  "maternityChunks": 13
}
```

The test fails when any profile is missing, blocked, has an invalid deterministic catalogue, cannot complete retrieval, retrieves outside its permitted scope, mutates the decision or cannot build a contract-valid explanation.

## POSH Wave 1 checks

The maintained test evaluates complete, reported-gap and missing-information scenarios for policy and dissemination, awareness and training, location-specific notice display, complaint and records controls, Internal Committee composition and unit coverage, and annual reporting.

## Maternity Benefit Wave 2 checks

The maintained test evaluates complete, reported-gap and missing-information scenarios for:

- establishment coverage;
- employee eligibility route;
- benefit-duration category;
- adopting or commissioning mother route;
- miscarriage, medical-termination, tubectomy and related-illness leave controls;
- nursing-break controls;
- crèche controls;
- notice, payment and records controls;
- employment-protection controls;
- Maternity Benefit and ESI overlap.

For every substantive scenario the suite proves that:

- only declared controlled facts are mapped;
- the deterministic decision exists before retrieval;
- complete and reported-gap scenarios remain `specialist-review` because legal sufficiency, evidence quality and individual entitlement are not certified;
- absent required facts produce `more-information-needed`;
- retrieval reports `usedForDecision: false` and `applicabilityAuthority: none`;
- retrieved chunks stay inside the deterministic reason-code and Source Register allow-list;
- explanations preserve status, reason code and decision fingerprint.

The browser boundary tests prove that Wave 2 requests exclude names, contact details, medical narratives, certificates, exact event dates, child details, adoption or surrogacy documents, claim documents, ESI identifiers, bank details, disciplinary evidence and completed forms. The v3 panel test also verifies ten selectable reviews, no automatic request and no browser-storage writes.

## Governance-fallback checks

For a remaining fallback profile:

- no employee-count input must produce `more-information-needed`;
- a non-negative employee count must produce `specialist-review`;
- retrieval must report `retrievalStatus: completed`;
- retrieval must report `usedForDecision: false` and `applicabilityAuthority: none`;
- the explanation must preserve the decision status and reason code.

## Runtime status check

After starting the server, inspect:

```text
GET /api/legal-rag/status
```

The response should report:

- `platformStatus: all-laws-runnable-private-beta`;
- 57 active profiles;
- zero blocked runtime profiles;
- `substantiveProfileCount: 17`;
- `governanceFallbackProfileCount: 40`;
- two statutory catalogues and one governance-fallback catalogue.

## Runtime versus legal approval

A green runtime test proves that Wave 1 and Wave 2 have feature-specific deterministic rules, source-scoped statutory retrieval, strict request adapters and contract-valid explanations. It does not record qualified legal approval, verify customer evidence, decide an individual entitlement or certify compliance.

The onboarding-readiness snapshot is intentionally separate. It may continue to report pending legal, privacy, source-file, mapping, RAG or release decisions until those controlled approvals are explicitly recorded. Passing software tests is not approval.
