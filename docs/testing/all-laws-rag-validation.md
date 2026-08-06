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
node tests/esi-wave4d-private-beta-checks.mjs
node tests/jurisdiction-wave5a-private-beta-checks.mjs
```

The maintained baseline command validates Wave 1 and Wave 2. The Wave 3A–3C, Wave 4A–4D and Wave 5A overlay commands validate the complete stacked 57-profile registry.

## Required Wave 5A pass indicators

```json
{
  "valid": true,
  "profileCount": 57,
  "substantiveProfiles": 45,
  "substantiveJurisdictionWave5aProfiles": 1,
  "wave5aScenarios": 3,
  "governanceFallbackProfiles": 12,
  "activeCatalogs": 11,
  "jurisdictionWave5aSources": 9,
  "jurisdictionWave5aChunks": 10
}
```

The test fails when a profile is missing, a deterministic catalogue is invalid, a source-governance enum or fingerprint is unsupported, a scenario produces an unexpected status or reason code, retrieval cannot complete, a chunk escapes the deterministic source scope, a decision is mutated, or a contract-valid explanation cannot be built.

## POSH Wave 1 checks

The maintained test evaluates complete, reported-gap and missing-information scenarios for policy and dissemination, awareness and training, location-specific notice display, complaint and records controls, Internal Committee composition and unit coverage, and annual reporting.

## Maternity Benefit Wave 2 checks

The maintained test evaluates complete, reported-gap and missing-information scenarios for establishment coverage, employee eligibility route, benefit-duration category, adopting or commissioning mother route, special leave, nursing breaks, crèche controls, notice/payment/records, employment protection, and Maternity Benefit/ESI overlap.

## EPF Waves 3A–3C checks

The maintained overlay tests evaluate the EPF, EPS and EDLI operational, source-routing and specialist-control profiles while preserving contribution, membership, exemption, certificate and individual-entitlement boundaries.

## ESI Waves 4A–4D checks

The maintained ESI overlays evaluate establishment, employee-insurance, contractor, payment, accident, coverage-routing, wage-ceiling, rate-source, special-route, benefit-process, medical-administration, exemption-governance and enforcement-authority controls while preserving applicability, calculation, claim, medical, exemption, enforcement and individual-entitlement boundaries.

## Appropriate Government Wave 5A checks

The Wave 5A overlay evaluates complete, reported-gap and missing-information scenarios for cross-code Appropriate Government source routing.

For every Wave 5A scenario the suite proves that:

- only the declared candidate route, cross-code definition source status, Central and State source-set statuses, establishment and activity classification control, multi-location routing, effective-date and version control, specialist escalation and evidence references are mapped;
- the deterministic decision exists before retrieval;
- complete and reported-gap scenarios remain `specialist-review` because the legally appropriate Government, governing source set, establishment classification, effective-date treatment, forum and evidence quality are not certified;
- absent required facts produce `more-information-needed`;
- retrieval reports `usedForDecision: false` and `applicabilityAuthority: none`;
- retrieved chunks stay inside the deterministic reason-code and Source Register allow-list;
- explanations preserve status, reason code and decision fingerprint;
- no rule infers a location, classifies an establishment, chooses Central or State jurisdiction, selects a State or Union Territory source set, resolves conflicts, validates a delegation or selects a forum.

The Wave 5A browser payload check proves that names, contact details, addresses, registration numbers, employee identities, wages, payroll, disputes, allegations, notices, orders, contracts, legal submissions and evidence bodies are excluded. Evidence arrays are reduced to controlled references. The Chromium test verifies no automatic request, allow-listed submission, rendered citations and zero browser-storage writes.

## Source-governance checks

The Wave 5A catalogue contains nine official source identities and ten reason-code-scoped chunks.

The Social Security Code and Social Security (Central) Rules retain controlled-file fingerprints. The Code on Wages, Industrial Relations Code, OSHWC Code, their 2026 Central Rules and the Ministry labour-jurisdiction page use clearly labelled `source-identity-only` fingerprints. The test prevents those records from being represented as verified full files or complete linked-source archives.

No State or Union Territory Act, rule, amendment, notification, delegation, forum or effective-date pack is represented as complete. Exact customer-specific establishment, ownership, control, industry, activity, location and contract facts remain specialist-review dependencies.

## Runtime status check

After starting the Wave 5A server entrypoint, inspect:

```text
GET /api/legal-rag/status
```

The response should report:

- `platformStatus: all-laws-runnable-private-beta`;
- 57 active profiles;
- zero blocked runtime profiles;
- `substantiveProfileCount: 45`;
- `governanceFallbackProfileCount: 12`;
- ten substantive catalogues and one governance-fallback catalogue.

## Runtime versus legal approval

A green runtime test proves that Waves 1, 2, 3A–3C, 4A–4D and 5A have feature-specific deterministic rules, source-scoped governed retrieval, strict request adapters and contract-valid explanations. It does not record qualified legal approval, verify customer evidence, approve exemptions, authenticate documents or officers, decide liability or recovery, select the legally appropriate Government, determine applicable law or forum, or certify compliance.

The onboarding-readiness snapshot remains separate. It may continue to report pending legal, privacy, source-file, mapping, RAG, security or release decisions until those controlled approvals are explicitly recorded. Passing software tests is not approval.
