# Validate RAG across all registered legal profiles

**Release:** v0.20.2 private-beta branch  
**Purpose:** prove that every profile is runnable and that retrieval and explanation remain outside the deterministic decision.

## Acceptance commands

```bash
npm install
npm run verify:all-laws-rag
node tests/epf-wave3a-private-beta-checks.mjs
node tests/epf-wave3b-private-beta-checks.mjs
node tests/epf-wave3c-private-beta-checks.mjs
```

The maintained baseline command validates Wave 1 and Wave 2. The Wave 3A, Wave 3B and Wave 3C overlay commands validate the complete stacked 57-profile registry.

## Required Wave 3C pass indicators

```json
{
  "valid": true,
  "profileCount": 57,
  "substantiveProfiles": 29,
  "substantiveWave3cProfiles": 2,
  "wave3cScenarios": 6,
  "governanceFallbackProfiles": 28,
  "activeCatalogs": 6,
  "wave3cSources": 8,
  "wave3cChunks": 9
}
```

The test fails when a profile is missing, a deterministic catalogue is invalid, a source-governance enum is unsupported, a scenario produces an unexpected status or reason code, retrieval cannot complete, a chunk escapes the deterministic source scope, a decision is mutated, or a contract-valid explanation cannot be built.

## POSH Wave 1 checks

The maintained test evaluates complete, reported-gap and missing-information scenarios for policy and dissemination, awareness and training, location-specific notice display, complaint and records controls, Internal Committee composition and unit coverage, and annual reporting.

## Maternity Benefit Wave 2 checks

The maintained test evaluates complete, reported-gap and missing-information scenarios for establishment coverage, employee eligibility route, benefit-duration category, adopting or commissioning mother route, special leave, nursing breaks, crèche controls, notice/payment/records, employment protection, and Maternity Benefit/ESI overlap.

## EPF Wave 3A checks

The Wave 3A overlay evaluates complete, reported-gap and missing-information scenarios for establishment coverage, member-inclusion controls, monthly contribution-process controls, contractor controls, and records and returns.

## EPF Wave 3B checks

The Wave 3B overlay evaluates complete, reported-gap and missing-information scenarios for EPF wage-ceiling source and routing review, EPF contribution-rate source verification, EPS membership routing, EPS pension-process controls, and EDLI coverage and process controls.

## EPF Wave 3C checks

The Wave 3C overlay evaluates complete, reported-gap and missing-information scenarios for:

- EPF exemption governance and source-control review;
- EPF international-worker and Social Security Agreement control review.

For every Wave 3C scenario the suite proves that:

- only declared organisation-level control statuses and evidence references are mapped;
- the deterministic decision exists before retrieval;
- complete and reported-gap scenarios remain `specialist-review` because exemption applicability, country-specific instruments, certificate validity and evidence quality are not certified;
- absent required facts produce `more-information-needed`;
- retrieval reports `usedForDecision: false` and `applicabilityAuthority: none`;
- retrieved chunks stay inside the deterministic reason-code and Source Register allow-list;
- explanations preserve status, reason code and decision fingerprint;
- no rule determines an establishment exemption, infers a person or country, validates a certificate or decides individual EPF or EPS membership.

The Wave 3C browser payload check proves that names, UANs, passports, nationality documents, employee wage amounts, payroll rows, contribution histories, exemption-order bodies, certificate bodies, trust member or investment records, claims, family details and evidence bodies are excluded. Evidence arrays are reduced to controlled references. The Chromium test verifies two selectable reviews, no automatic request, allow-listed submission, rendered citations and zero browser-storage writes.

## Source-governance checks

The Wave 3C rule catalogue distinguishes source roles:

- Code and statutory schemes use `legislation` or `regulation`;
- EPFO manuals, SOPs and FAQs use `regulator-guidance`;
- the operating SSA register uses `official-portal`.

The test rejects unsupported generic source types and prevents guidance or portal content from being represented as statutory authority.

## Runtime status check

After starting the Wave 3C server entrypoint, inspect:

```text
GET /api/legal-rag/status
```

The response should report:

- `platformStatus: all-laws-runnable-private-beta`;
- 57 active profiles;
- zero blocked runtime profiles;
- `substantiveProfileCount: 29`;
- `governanceFallbackProfileCount: 28`;
- five substantive catalogues and one governance-fallback catalogue.

## Runtime versus legal approval

A green runtime test proves that Waves 1, 2 and 3A–3C have feature-specific deterministic rules, source-scoped governed retrieval, strict request adapters and contract-valid explanations. It does not record qualified legal approval, verify customer evidence, determine an exemption, validate a certificate, calculate payroll or contributions, decide individual membership or benefits, decide claims or certify compliance.

The onboarding-readiness snapshot remains separate. It may continue to report pending legal, privacy, source-file, mapping, RAG or release decisions until those controlled approvals are explicitly recorded. Passing software tests is not approval.
