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
node tests/shops-wave5b-private-beta-checks.mjs
node tests/code-on-wages-wave5c-private-beta-checks.mjs
```

The maintained baseline command validates Wave 1 and Wave 2. The Wave 3A–3C, Wave 4A–4D and Wave 5A–5C overlay commands validate the complete stacked 57-profile registry.

## Required Wave 5C pass indicators

```json
{
  "valid": true,
  "profileCount": 57,
  "substantiveProfiles": 47,
  "substantiveCodeOnWagesWave5cProfiles": 1,
  "wave5cScenarios": 3,
  "governanceFallbackProfiles": 10,
  "activeCatalogs": 13,
  "codeOnWagesSources": 7,
  "codeOnWagesChunks": 9
}
```

The test fails when a profile is missing, a deterministic catalogue is invalid, a source-governance enum or fingerprint is unsupported, a scenario produces an unexpected status or reason code, retrieval cannot complete, a chunk escapes the deterministic source scope, a decision is mutated, or a contract-valid explanation cannot be built.

## Earlier wave checks

The maintained tests continue to evaluate:

- POSH Wave 1 complete, reported-gap and missing-information scenarios for the six expanded organisational duties and the existing Internal Committee threshold profile;
- Maternity Benefit Wave 2 establishment, eligibility-route, duration, adopting or commissioning mother, special-leave, nursing-break, crèche, notice/payment/records, employment-protection and ESI-overlap controls;
- EPF Waves 3A–3C operational, source-routing and specialist-control profiles while preserving contribution, membership, exemption, certificate and individual-entitlement boundaries;
- ESI Waves 4A–4D establishment, employee-insurance, contractor, payment, accident, coverage-routing, wage-ceiling, rate-source, special-route, benefit-process, medical-administration, exemption-governance and enforcement-authority controls;
- Appropriate Government Wave 5A cross-code source-readiness and escalation controls without selecting Central or State jurisdiction;
- Maharashtra Shops Wave 5B State source-readiness and organisational controls without coverage, threshold, registration, working-condition, penalty or enforcement decisions.

## Code on Wages Wave 5C checks

The Wave 5C overlay evaluates complete, reported-gap and missing-information scenarios for `feature.legal.code-on-wages`.

For every scenario the suite proves that:

- only the declared source route, Code source status, Central Rules source status, Rules-corrigendum status, commencement source-set status, effective-date/version control, appropriate-Government routing control, bounded rate-source register, State/UT instrument register, specialist escalation and controlled references are mapped;
- the deterministic decision exists before retrieval;
- complete and reported-gap scenarios remain `specialist-review` because applicable Government, rate, category, zone, scheduled employment, State instrument, payroll treatment and individual entitlement remain specialist-only;
- absent required facts produce `more-information-needed`;
- retrieval reports `usedForDecision: false` and `applicabilityAuthority: none`;
- retrieved chunks stay inside the deterministic reason-code and source-registry allow-list;
- explanations preserve status, reason code and the decision fingerprint;
- no rule, retrieval result or provider output selects a numeric wage, category, zone, scheduled employment, State instrument or appropriate Government, performs payroll arithmetic, or determines an amount due or remedy.

The Wave 5C browser payload check proves that employee identities, payroll, wage records, payslips, attendance, disputes, claims, notices, orders, individual entitlements and evidence bodies are excluded. Evidence arrays are reduced to controlled references. The Chromium test verifies no automatic request, allow-listed submission, rendered citations and zero browser-storage writes.

## Wave 5C source-governance checks

The Wave 5C catalogue contains seven official source identities and nine reason-code-scoped chunks:

1. Code on Wages, 2019;
2. Code on Wages (Central) Rules, 2026;
3. S.O. 4604(E), dated 18 December 2020;
4. S.O. 5322(E), dated 21 November 2025;
5. the July 2026 Central Rules corrigendum;
6. the Ministry Code on Wages notifications register;
7. the Ministry labour-jurisdiction portal.

The Code, Central Rules and Ministry jurisdiction identities reuse Wave 5A registrations. The new commencement, corrigendum and notification-register records remain `source-identity-only`. They are not represented as a qualified legal determination or a complete State/UT wage-rate pack.

The notification-register source is deliberately bounded. It can support a source-readiness finding but cannot select a rate, category, zone, scheduled employment or State instrument. Exact controlled files, State/UT source packs and rate/version treatment remain qualified-review dependencies.

## Runtime status check

After starting the Wave 5C server entrypoint, inspect:

```text
GET /api/legal-rag/status
```

The response should report:

- `platformStatus: all-laws-runnable-private-beta`;
- 57 active profiles;
- zero blocked runtime profiles;
- `substantiveProfileCount: 47`;
- `governanceFallbackProfileCount: 10`;
- twelve substantive catalogues and one governance-fallback catalogue.

## Browser regression gate

The Executive Assessment workflow runs the dedicated Wave 5C Chromium test together with all existing assessment, report, homepage and workspace browser tests. Wave 5C must remain explicit-submit, in-memory only and absent from the stable report, PDF and email contracts.

## Runtime versus legal approval

A green runtime test proves that Waves 1, 2, 3A–3C, 4A–4D and 5A–5C have feature-specific deterministic rules, source-scoped governed retrieval, strict request adapters and contract-valid explanations. It does not record qualified legal approval, verify customer evidence, select the legally appropriate Government, choose an applicable minimum wage/rate/category/zone/State instrument, perform payroll arithmetic, decide an individual entitlement or remedy, or certify compliance.

The onboarding-readiness snapshot remains separate. It may continue to report pending legal, privacy, source-file, mapping, RAG, security or release decisions until those controlled approvals are explicitly recorded. Passing software tests is not approval.
