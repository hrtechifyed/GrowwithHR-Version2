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
node tests/esi-wave4a-private-beta-checks.mjs
```

The maintained baseline command validates Wave 1 and Wave 2. The Wave 3A–3C and Wave 4A overlay commands validate the complete stacked 57-profile registry.

## Required Wave 4A pass indicators

```json
{
  "valid": true,
  "profileCount": 57,
  "substantiveProfiles": 34,
  "substantiveEsiWave4aProfiles": 5,
  "wave4aScenarios": 15,
  "governanceFallbackProfiles": 23,
  "activeCatalogs": 7,
  "esiWave4aSources": 6,
  "esiWave4aChunks": 11
}
```

The test fails when a profile is missing, a deterministic catalogue is invalid, a source-governance enum or fingerprint is unsupported, a scenario produces an unexpected status or reason code, retrieval cannot complete, a chunk escapes the deterministic source scope, a decision is mutated, or a contract-valid explanation cannot be built.

## POSH Wave 1 checks

The maintained test evaluates complete, reported-gap and missing-information scenarios for policy and dissemination, awareness and training, location-specific notice display, complaint and records controls, Internal Committee composition and unit coverage, and annual reporting.

## Maternity Benefit Wave 2 checks

The maintained test evaluates complete, reported-gap and missing-information scenarios for establishment coverage, employee eligibility route, benefit-duration category, adopting or commissioning mother route, special leave, nursing breaks, crèche controls, notice/payment/records, employment protection, and Maternity Benefit/ESI overlap.

## EPF Waves 3A–3C checks

The maintained overlay tests evaluate the EPF, EPS and EDLI operational, source-routing and specialist-control profiles while preserving contribution, membership, exemption, certificate and individual-entitlement boundaries.

## ESI Wave 4A checks

The Wave 4A overlay evaluates complete, reported-gap and missing-information scenarios for:

- ESI establishment source and registration controls;
- ESI employee-insurance process controls;
- ESI contractor and principal-employer controls;
- ESI monthly payment and return-process controls;
- ESI accident-register and reporting controls.

For every Wave 4A scenario the suite proves that:

- only declared organisation-level statuses, one declared route and evidence references are mapped;
- the deterministic decision exists before retrieval;
- complete and reported-gap scenarios remain `specialist-review` because applicability, saved-law treatment, operational source sufficiency and evidence quality are not certified;
- absent required facts produce `more-information-needed`;
- retrieval reports `usedForDecision: false` and `applicabilityAuthority: none`;
- retrieved chunks stay inside the deterministic reason-code and Source Register allow-list;
- explanations preserve status, reason code and decision fingerprint;
- no rule decides ESI applicability, selects a wage ceiling or contribution rate, calculates amounts, determines individual insurance or benefit entitlement, or finds accident causation.

The Wave 4A browser payload check proves that names, contact details, Aadhaar, insurance numbers, employee wage amounts, payroll rows, contribution histories, challans, returns, medical or family details, accident narratives, injury records, claims and evidence bodies are excluded. Evidence arrays are reduced to controlled references. The Chromium test verifies five selectable reviews, no automatic request, allow-listed submission, rendered citations and zero browser-storage writes.

## Source-governance checks

The Wave 4A catalogue uses the Code, Social Security (Central) Rules, commencement notification and corrigendum as controlled current central sources. The consolidated 1950 Central Rules are represented as historical or transition context only. The consolidated 1950 General Regulations are represented as saved-law candidates only.

The test prevents those legacy instruments from being represented as automatic prospective authority. Area commencement, hazardous routes, current wage ceiling, current portal procedures, forms, due dates, State medical administration and saved-law treatment remain explicit specialist-review dependencies.

## Runtime status check

After starting the Wave 4A server entrypoint, inspect:

```text
GET /api/legal-rag/status
```

The response should report:

- `platformStatus: all-laws-runnable-private-beta`;
- 57 active profiles;
- zero blocked runtime profiles;
- `substantiveProfileCount: 34`;
- `governanceFallbackProfileCount: 23`;
- six substantive catalogues and one governance-fallback catalogue.

## Runtime versus legal approval

A green runtime test proves that Waves 1, 2, 3A–3C and 4A have feature-specific deterministic rules, source-scoped governed retrieval, strict request adapters and contract-valid explanations. It does not record qualified legal approval, verify customer evidence, decide ESI applicability, calculate payroll or contributions, determine individual insurance or benefits, decide accident causation, decide claims or certify compliance.

The onboarding-readiness snapshot remains separate. It may continue to report pending legal, privacy, source-file, mapping, RAG or release decisions until those controlled approvals are explicitly recorded. Passing software tests is not approval.
