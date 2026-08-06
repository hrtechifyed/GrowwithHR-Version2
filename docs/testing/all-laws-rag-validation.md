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
node tests/esi-wave4c-private-beta-checks.mjs
```

The maintained baseline command validates Wave 1 and Wave 2. The Wave 3A–3C and Wave 4A–4C overlay commands validate the complete stacked 57-profile registry.

## Required Wave 4C pass indicators

```json
{
  "valid": true,
  "profileCount": 57,
  "substantiveProfiles": 42,
  "substantiveEsiWave4cProfiles": 3,
  "wave4cScenarios": 9,
  "governanceFallbackProfiles": 15,
  "activeCatalogs": 9,
  "esiWave4cSources": 7,
  "esiWave4cChunks": 10
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

The Wave 4B overlay evaluates complete, reported-gap and missing-information scenarios for continuing and voluntary coverage routing, area and benefit-commencement source review, Chapter IV wage-ceiling source review, contribution-period ceiling continuation and contribution-rate source verification.

## ESI Wave 4C checks

The Wave 4C overlay evaluates complete, reported-gap and missing-information scenarios for:

- seasonal, hazardous and plantation route controls;
- organisation-level benefit-process support controls;
- medical-administration source routing.

For every Wave 4C scenario the suite proves that:

- only declared organisation-level routes, process statuses, source statuses, escalation controls and evidence references are mapped;
- the deterministic decision exists before retrieval;
- complete and reported-gap scenarios remain `specialist-review` because route classification, source sufficiency, saved-law treatment, State implementation and evidence quality are not certified;
- absent required facts produce `more-information-needed`;
- retrieval reports `usedForDecision: false` and `applicabilityAuthority: none`;
- retrieved chunks stay inside the deterministic reason-code and Source Register allow-list;
- explanations preserve status, reason code and decision fingerprint;
- no rule classifies a seasonal, hazardous or plantation route, decides a claim, validates a medical certificate, processes medical records, selects a provider or determines individual benefit entitlement.

The Wave 4C browser payload check proves that names, contact details, Aadhaar, insurance numbers, wages, payroll and contribution records, diagnoses, certificates, prescriptions, treatment records, family details, accident narratives, claims and evidence bodies are excluded. Evidence arrays are reduced to controlled references. The Chromium test verifies three selectable reviews, no automatic request, allow-listed submission, rendered citations and zero browser-storage writes.

## Source-governance checks

The Wave 4C catalogue uses the Code, Social Security (Central) Rules, commencement notification and corrigendum as controlled current central sources. S.O. 2352(E) is registered only as a controlled medical-practitioner authority source. The Other Beneficiaries Medical Facilities Scheme, 2026 is retained as bounded scheme context.

The consolidated 1950 General Regulations remain saved-law candidates for benefit-process context only. The test prevents that legacy instrument from being represented as automatic prospective authority.

The hazardous-occupation notification, plantation opt-in instruments, State and Union Territory medical-administration sources, State or Corporation agreements, local facility procedures, the other-beneficiaries user-charge instrument and saved-regulation transition treatment remain explicit specialist-review dependencies.

## Runtime status check

After starting the Wave 4C server entrypoint, inspect:

```text
GET /api/legal-rag/status
```

The response should report:

- `platformStatus: all-laws-runnable-private-beta`;
- 57 active profiles;
- zero blocked runtime profiles;
- `substantiveProfileCount: 42`;
- `governanceFallbackProfileCount: 15`;
- eight substantive catalogues and one governance-fallback catalogue.

## Runtime versus legal approval

A green runtime test proves that Waves 1, 2, 3A–3C and 4A–4C have feature-specific deterministic rules, source-scoped governed retrieval, strict request adapters and contract-valid explanations. It does not record qualified legal approval, verify customer evidence, classify special routes, decide ESI coverage or territorial applicability, select thresholds or rates, calculate payroll or contributions, validate medical certification, process medical records, decide claims, determine individual benefits or certify compliance.

The onboarding-readiness snapshot remains separate. It may continue to report pending legal, privacy, source-file, mapping, RAG or release decisions until those controlled approvals are explicitly recorded. Passing software tests is not approval.
