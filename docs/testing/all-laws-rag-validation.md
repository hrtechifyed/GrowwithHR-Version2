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
node tests/esi-wave4b-private-beta-checks.mjs
```

The maintained baseline command validates Wave 1 and Wave 2. The Wave 3A–3C and Wave 4A–4B overlay commands validate the complete stacked 57-profile registry.

## Required Wave 4B pass indicators

```json
{
  "valid": true,
  "profileCount": 57,
  "substantiveProfiles": 39,
  "substantiveEsiWave4bProfiles": 5,
  "wave4bScenarios": 15,
  "governanceFallbackProfiles": 18,
  "activeCatalogs": 8,
  "esiWave4bSources": 7,
  "esiWave4bChunks": 11
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

The Wave 4A overlay evaluates complete, reported-gap and missing-information scenarios for establishment source and registration controls, employee-insurance process controls, contractor and principal-employer controls, monthly payment and return-process controls, and accident-register and reporting controls.

## ESI Wave 4B checks

The Wave 4B overlay evaluates complete, reported-gap and missing-information scenarios for:

- continuing and voluntary coverage routing;
- area and benefit-commencement source review;
- Chapter IV wage-ceiling source review;
- contribution-period ceiling-continuation routing;
- contribution-rate source verification.

For every Wave 4B scenario the suite proves that:

- only declared organisation-level source, routing and escalation statuses plus evidence references are mapped;
- the deterministic decision exists before retrieval;
- complete and reported-gap scenarios remain `specialist-review` because coverage, territorial applicability, source sufficiency, transition treatment and evidence quality are not certified;
- absent required facts produce `more-information-needed`;
- retrieval reports `usedForDecision: false` and `applicabilityAuthority: none`;
- retrieved chunks stay inside the deterministic reason-code and Source Register allow-list;
- explanations preserve status, reason code and decision fingerprint;
- no rule supplies a missing notification, selects a wage ceiling or rate, calculates an amount, determines individual continuation or decides ESI applicability.

The Wave 4B browser payload check proves that names, contact details, Aadhaar, insurance numbers, addresses, employee wages, wage-ceiling amounts, rate percentages, payroll rows, contribution histories, challans, returns, medical, accident, claim and evidence bodies are excluded. Evidence arrays are reduced to controlled references. The Chromium test verifies five selectable reviews, no automatic request, allow-listed submission, rendered citations and zero browser-storage writes.

## Source-governance checks

The Wave 4B catalogue uses the Code, Social Security (Central) Rules, commencement notification, corrigendum and S.O. 2351(E) as controlled current central sources. S.O. 2351(E) is represented only as a continuation source that depends on a separately notified Chapter IV wage ceiling; it is not represented as supplying the ceiling.

The consolidated 1950 Central Rules are historical or transition context only. The consolidated 1950 General Regulations are saved-law candidates only. The test prevents those legacy instruments from being represented as automatic prospective authority.

The exact Chapter IV wage-ceiling notification, complete State, Union Territory, area and establishment notification set, contribution-period saved-law treatment, rate exceptions and effective-date treatment remain explicit specialist-review dependencies.

## Runtime status check

After starting the Wave 4B server entrypoint, inspect:

```text
GET /api/legal-rag/status
```

The response should report:

- `platformStatus: all-laws-runnable-private-beta`;
- 57 active profiles;
- zero blocked runtime profiles;
- `substantiveProfileCount: 39`;
- `governanceFallbackProfileCount: 18`;
- seven substantive catalogues and one governance-fallback catalogue.

## Runtime versus legal approval

A green runtime test proves that Waves 1, 2, 3A–3C and 4A–4B have feature-specific deterministic rules, source-scoped governed retrieval, strict request adapters and contract-valid explanations. It does not record qualified legal approval, verify customer evidence, decide ESI coverage or territorial applicability, select thresholds or rates, calculate payroll or contributions, determine individual insurance or continuation, decide benefits or certify compliance.

The onboarding-readiness snapshot remains separate. It may continue to report pending legal, privacy, source-file, mapping, RAG or release decisions until those controlled approvals are explicitly recorded. Passing software tests is not approval.
