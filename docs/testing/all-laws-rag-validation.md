# Validate RAG across all registered legal profiles

**Release:** v0.20.2 private-beta branch  
**Purpose:** prove that every profile is runnable and that retrieval and explanation remain outside the deterministic decision.

## Acceptance commands

```bash
npm install
npm run verify:all-laws-rag
node tests/epf-wave3a-private-beta-checks.mjs
```

The maintained baseline command validates Wave 1 and Wave 2. The Wave 3A overlay command validates the full stacked 57-profile registry with EPF operational controls activated.

## Required Wave 3A pass indicators

```json
{
  "valid": true,
  "profileCount": 57,
  "substantiveProfiles": 22,
  "substantiveEpfWave3aProfiles": 5,
  "wave3aScenarios": 15,
  "governanceFallbackProfiles": 35,
  "activeCatalogs": 4,
  "epfSources": 4,
  "epfChunks": 10
}
```

The test fails when a profile is missing, a deterministic catalogue is invalid, a scenario produces an unexpected status or reason code, retrieval cannot complete, a chunk escapes the deterministic source scope, a decision is mutated, or a contract-valid explanation cannot be built.

## POSH Wave 1 checks

The maintained test evaluates complete, reported-gap and missing-information scenarios for policy and dissemination, awareness and training, location-specific notice display, complaint and records controls, Internal Committee composition and unit coverage, and annual reporting.

## Maternity Benefit Wave 2 checks

The maintained test evaluates complete, reported-gap and missing-information scenarios for establishment coverage, employee eligibility route, benefit-duration category, adopting or commissioning mother route, special leave, nursing breaks, crèche controls, notice/payment/records, employment protection, and Maternity Benefit/ESI overlap.

## EPF Wave 3A checks

The overlay test evaluates complete, reported-gap and missing-information scenarios for:

- establishment coverage;
- member-inclusion controls;
- monthly contribution-process controls;
- contractor controls;
- records and returns.

For every Wave 3A scenario the suite proves that:

- only declared organisation-level facts are mapped;
- the deterministic decision exists before retrieval;
- complete and reported-gap scenarios remain `specialist-review` because legal sufficiency and evidence quality are not certified;
- absent required facts produce `more-information-needed`;
- retrieval reports `usedForDecision: false` and `applicabilityAuthority: none`;
- retrieved chunks stay inside the deterministic reason-code and Source Register allow-list;
- explanations preserve status, reason code and decision fingerprint.

The browser payload check proves that names, UANs, employee-level wages, payroll rows, contribution histories, ECR bodies, bank details, claims, completed forms and evidence bodies are excluded. The Chromium test verifies five selectable reviews, no automatic request, allow-listed submission, rendered citations and zero browser-storage writes.

## Deferred EPF/EPS/EDLI profiles

These profiles remain on governance fallback until exact controlled notification and transition sources are approved:

- wage ceiling;
- contribution-rate source;
- exemption review;
- international-worker review;
- EPS membership routing;
- EPS pension control;
- EDLI coverage control.

Wave 3A does not calculate contributions, select a 10% or 12% branch, determine individual membership, apply an exemption, decide international-worker treatment, route EPS eligibility or calculate EDLI rates.

## Runtime status check

After starting the Wave 3A server entrypoint, inspect:

```text
GET /api/legal-rag/status
```

The response should report:

- `platformStatus: all-laws-runnable-private-beta`;
- 57 active profiles;
- zero blocked runtime profiles;
- `substantiveProfileCount: 22`;
- `governanceFallbackProfileCount: 35`;
- three statutory catalogues and one governance-fallback catalogue.

## Runtime versus legal approval

A green runtime test proves that Waves 1, 2 and 3A have feature-specific deterministic rules, source-scoped statutory retrieval, strict request adapters and contract-valid explanations. It does not record qualified legal approval, verify customer evidence, calculate payroll, decide individual membership or certify compliance.

The onboarding-readiness snapshot remains separate. It may continue to report pending legal, privacy, source-file, mapping, RAG or release decisions until those controlled approvals are explicitly recorded. Passing software tests is not approval.
