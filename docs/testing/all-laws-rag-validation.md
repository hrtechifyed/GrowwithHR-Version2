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
  "substantivePoshProfiles": 7,
  "statutoryProfiles": 7,
  "wave1Profiles": 6,
  "wave1Scenarios": 18,
  "governanceFallbackProfiles": 50,
  "fallbackSources": 17,
  "fallbackChunks": 17,
  "poshSources": 3
}
```

The exact POSH chunk count may grow when governed reason-code coverage is extended. The test fails when any profile is missing, blocked, has an invalid deterministic catalogue, cannot complete retrieval, retrieves outside its permitted scope, mutates the decision or cannot build a contract-valid explanation.

## POSH Wave 1 behavior checks

The maintained test evaluates complete, reported-gap and missing-information scenarios for each of these six profiles:

- policy and dissemination;
- awareness, orientation and capacity building;
- notice and display by location;
- complaint mechanism and records controls;
- Internal Committee composition and unit coverage;
- annual reporting.

For each scenario it proves that:

- the rule receives only declared privacy-safe facts;
- the decision is produced before retrieval;
- complete and reported-gap scenarios remain `specialist-review` because legal sufficiency and evidence quality are not certified;
- absent required facts produce `more-information-needed`;
- retrieval reports `usedForDecision: false` and `applicabilityAuthority: none`;
- retrieved chunks stay inside the deterministic reason-code and Source Register allow-list;
- the explanation preserves the decision status, reason code and fingerprint.

The browser payload test also proves that undeclared names, evidence bodies and complaint narratives are excluded.

## Governance-fallback behavior checks

For a fallback profile such as Maternity Benefit establishment coverage:

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
- `substantiveProfileCount: 7`;
- `governanceFallbackProfileCount: 50`;
- statutory and governance-fallback catalogue modes.

## Runtime versus legal approval

A green runtime test proves that the six Wave 1 POSH control profiles have feature-specific deterministic rules, source-scoped statutory retrieval, strict request adapters and contract-valid explanations. It does not record qualified legal approval, verify customer evidence or certify compliance.

The onboarding-readiness snapshot is intentionally separate. It may continue to report pending legal, privacy, source-file, mapping, RAG or release decisions until those controlled approvals are explicitly recorded. Passing software tests is not approval.
