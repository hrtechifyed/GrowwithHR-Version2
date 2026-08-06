# Validate RAG across all registered legal profiles

**Release:** v0.20.2 private-beta branch  
**Purpose:** prove that every profile is runnable and that retrieval and explanation remain outside the deterministic decision.

## Acceptance commands

```bash
npm install
npm run verify:all-laws-rag
node tests/epf-wave3a-private-beta-checks.mjs
node tests/epf-wave3b-private-beta-checks.mjs
```

The maintained baseline command validates Wave 1 and Wave 2. The Wave 3A and Wave 3B overlay commands validate the complete stacked 57-profile registry.

## Required Wave 3B pass indicators

```json
{
  "valid": true,
  "profileCount": 57,
  "substantiveProfiles": 27,
  "substantiveEpfWave3aProfiles": 5,
  "substantiveEpfWave3bProfiles": 5,
  "wave3bScenarios": 15,
  "governanceFallbackProfiles": 30,
  "activeCatalogs": 5,
  "epfWave3bSources": 7,
  "epfWave3bChunks": 9
}
```

The test fails when a profile is missing, a deterministic catalogue is invalid, a scenario produces an unexpected status or reason code, retrieval cannot complete, a chunk escapes the deterministic source scope, a decision is mutated, or a contract-valid explanation cannot be built.

## POSH Wave 1 checks

The maintained test evaluates complete, reported-gap and missing-information scenarios for policy and dissemination, awareness and training, location-specific notice display, complaint and records controls, Internal Committee composition and unit coverage, and annual reporting.

## Maternity Benefit Wave 2 checks

The maintained test evaluates complete, reported-gap and missing-information scenarios for establishment coverage, employee eligibility route, benefit-duration category, adopting or commissioning mother route, special leave, nursing breaks, crèche controls, notice/payment/records, employment protection, and Maternity Benefit/ESI overlap.

## EPF Wave 3A checks

The Wave 3A overlay evaluates complete, reported-gap and missing-information scenarios for establishment coverage, member-inclusion controls, monthly contribution-process controls, contractor controls, and records and returns.

## EPF Wave 3B checks

The Wave 3B overlay evaluates complete, reported-gap and missing-information scenarios for:

- EPF wage-ceiling source and routing review;
- EPF contribution-rate source verification;
- EPS membership routing;
- EPS pension-process controls;
- EDLI coverage and process controls.

For every Wave 3B scenario the suite proves that:

- only declared organisation-level statuses, bands and evidence references are mapped;
- the deterministic decision exists before retrieval;
- complete and reported-gap scenarios remain `specialist-review` because source sufficiency, legal routing, transition treatment and evidence quality are not certified;
- absent required facts produce `more-information-needed`;
- retrieval reports `usedForDecision: false` and `applicabilityAuthority: none`;
- retrieved chunks stay inside the deterministic reason-code and Source Register allow-list;
- explanations preserve status, reason code and decision fingerprint;
- no rule calculates contributions or determines individual EPF, EPS or EDLI outcomes.

The Wave 3B browser payload check proves that names, UANs, employee wage amounts, payroll rows, contribution histories, ECR bodies, bank details, claims, nominee or family details, completed forms and evidence bodies are excluded. Evidence arrays are reduced to controlled references. The Chromium test verifies five selectable reviews, no automatic request, allow-listed submission, rendered citations and zero browser-storage writes.

## Remaining EPF fallback profiles

These profiles remain on governance fallback:

- EPF exemption review;
- EPF international-worker review.

Wave 3B also records explicit limitations for unresolved source questions. The exact official S.O. 320(E) contribution-rate file, current EDLI rate authority and transition or savings treatment require qualified legal review. A declared 10% or 12% branch is accepted only as a verification input; the product does not select the legally applicable branch.

## Runtime status check

After starting the Wave 3B server entrypoint, inspect:

```text
GET /api/legal-rag/status
```

The response should report:

- `platformStatus: all-laws-runnable-private-beta`;
- 57 active profiles;
- zero blocked runtime profiles;
- `substantiveProfileCount: 27`;
- `governanceFallbackProfileCount: 30`;
- four statutory catalogues and one governance-fallback catalogue.

## Runtime versus legal approval

A green runtime test proves that Waves 1, 2, 3A and 3B have feature-specific deterministic rules, source-scoped statutory retrieval, strict request adapters and contract-valid explanations. It does not record qualified legal approval, verify customer evidence, calculate payroll or contributions, decide individual membership or benefits, decide claims or certify compliance.

The onboarding-readiness snapshot remains separate. It may continue to report pending legal, privacy, source-file, mapping, RAG or release decisions until those controlled approvals are explicitly recorded. Passing software tests is not approval.
