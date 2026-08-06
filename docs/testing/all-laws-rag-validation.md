# Validate RAG across all registered legal profiles

**Release:** v0.20.2  
**Purpose:** prove that every profile is runnable and that retrieval and explanation remain outside the applicability decision.

## One-command acceptance test

```bash
npm install
npm run verify:all-laws-rag
```

The command runs the maintained 57-profile runtime test and then prints the onboarding-readiness snapshot.

## Required pass indicators

```json
{
  "valid": true,
  "profileCount": 57,
  "activeProfileCount": 57,
  "blockedProfileCount": 0,
  "statutoryProfiles": 1,
  "governanceFallbackProfiles": 56,
  "fallbackSources": 17,
  "fallbackChunks": 17
}
```

The test fails when any profile is missing, blocked, has an invalid deterministic catalogue, cannot complete retrieval, retrieves outside its permitted scope, mutates the decision or cannot build a contract-valid explanation.

## Representative behavior checks

For a fallback profile such as Maternity Benefit establishment coverage:

- no employee-count input must produce `more-information-needed`;
- a non-negative employee count must produce `specialist-review`;
- retrieval must report `retrievalStatus: completed`;
- retrieval must report `usedForDecision: false` and `applicabilityAuthority: none`;
- the explanation must preserve the decision status and reason code.

For POSH Internal Committee threshold, the test must retrieve statutory chunks whose source IDs were already permitted by the deterministic decision.

## Runtime status check

After starting the server, inspect:

```text
GET /api/legal-rag/status
```

The response should report `platformStatus: all-laws-runnable-private-beta`, 57 active profiles, zero blocked profiles and two catalogue modes: statutory and governance fallback.

A green test proves that the shared RAG pipeline works for every registered profile. It does not prove that all 56 fallback profiles have completed statutory corpus onboarding or legal approval.
