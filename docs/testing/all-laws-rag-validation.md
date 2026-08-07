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
node tests/gratuity-wave5d-private-beta-checks.mjs
```

The maintained baseline command validates Wave 1 and Wave 2. The Wave 3A–3C, Wave 4A–4D and Wave 5A–5D overlay commands validate the complete stacked 57-profile registry.

## Required Wave 5D pass indicators

```json
{
  "valid": true,
  "profileCount": 57,
  "substantiveProfiles": 48,
  "substantiveGratuityWave5dProfiles": 1,
  "wave5dScenarios": 3,
  "governanceFallbackProfiles": 9,
  "activeCatalogs": 14,
  "gratuitySources": 4,
  "gratuityChunks": 8
}
```

The test fails when a profile is missing, a deterministic catalogue is invalid, a source-governance fingerprint is unexpected, a scenario produces an unexpected status or reason code, retrieval cannot complete, a chunk escapes the deterministic source scope, a decision is mutated, or a contract-valid explanation cannot be built.

## Earlier wave checks

The maintained tests continue to evaluate:

- POSH Wave 1 complete, reported-gap and missing-information scenarios for the six expanded organisational duties and the existing Internal Committee threshold profile;
- Maternity Benefit Wave 2 establishment, eligibility-route, duration, adopting or commissioning mother, special-leave, nursing-break, crèche, notice/payment/records, employment-protection and ESI-overlap controls;
- EPF Waves 3A–3C operational, source-routing and specialist-control profiles while preserving contribution, membership, exemption, certificate and individual-entitlement boundaries;
- ESI Waves 4A–4D establishment, employee-insurance, contractor, payment, accident, coverage-routing, wage-ceiling, rate-source, special-route, benefit-process, medical-administration, exemption-governance and enforcement-authority controls;
- Appropriate Government Wave 5A cross-code source-readiness and escalation controls without selecting Central or State jurisdiction;
- Maharashtra Shops Wave 5B State source-readiness and organisational controls without coverage, threshold, registration, working-condition, penalty or enforcement decisions;
- Code on Wages Wave 5C organisation-level source-readiness, commencement, version, jurisdiction-routing and bounded source-register controls without selecting a Government, wage rate, category, zone, State instrument or employee entitlement.

## Gratuity Wave 5D checks

The Wave 5D overlay evaluates complete, reported-gap and missing-information scenarios for `feature.legal.social-security.gratuity`.

For every scenario the suite proves that:

- only the declared source route, Chapter V source status, First Schedule source status, Central Rules source status, commencement/transition source-set status, legacy-rule transition control, establishment-classification control, workforce-category source control, authority/process source control, specialist escalation and controlled references are mapped;
- the deterministic decision exists before retrieval;
- complete and reported-gap scenarios remain `specialist-review` because customer coverage and individual eligibility, continuous service, fixed-term status, wages, amount, nomination, forfeiture, insurance, claims, appeals, recovery and remedies remain specialist-only;
- absent required facts produce `more-information-needed`;
- retrieval reports `usedForDecision: false` and `applicabilityAuthority: none`;
- retrieved chunks stay inside the deterministic reason-code and source-registry allow-list;
- explanations preserve status, reason code and the decision fingerprint;
- no rule, retrieval result or provider output classifies an establishment, counts employees, infers a worker category or service history, calculates gratuity, validates a nomination or forfeiture, decides a claim or changes the deterministic outcome.

The Wave 5D browser payload check proves that employee identities, nominee or heir data, payroll, wages, payslips, attendance, service records, claims, disputes, notices, orders, medical or death information and evidence bodies are excluded. Evidence arrays are reduced to controlled references. The Chromium test verifies no automatic request, allow-listed submission, rendered citations and zero browser-storage writes.

## Wave 5D source-governance checks

The Wave 5D catalogue contains four exact controlled sources and eight reason-code-scoped chunks:

1. Code on Social Security, 2020;
2. Social Security (Central) Rules, 2026;
3. S.O. 5319(E), dated 21 November 2025;
4. S.O. 5936(E), dated 19 December 2025.

The test verifies the exact registered SHA-256 fingerprints for all four files. The catalogue maps Chapter V sections 53–58, the First Schedule Chapter V applicability entry, Rules 31–34, commencement/corrigendum context and the transition from the Payment of Gratuity (Central) Rules, 1972 under the 2026 Rules' supersession-and-savings clause.

These mappings remain source-readiness controls. They cannot create a customer coverage conclusion or an individual service, wage, eligibility, amount, nomination, forfeiture, claim, appeal, recovery or remedy outcome. State/UT instruments and customer-specific facts remain qualified-review dependencies.

## Runtime status check

After starting the Wave 5D server entrypoint, inspect:

```text
GET /api/legal-rag/status
```

The response should report:

- `platformStatus: all-laws-runnable-private-beta`;
- 57 active profiles;
- zero blocked runtime profiles;
- `substantiveProfileCount: 48`;
- `governanceFallbackProfileCount: 9`;
- thirteen substantive catalogues and one governance-fallback catalogue.

## Browser regression gate

The Executive Assessment workflow runs the dedicated Wave 5D Chromium test together with all existing assessment, report, homepage and workspace browser tests. Wave 5D must remain explicit-submit, in-memory only and absent from the stable report, PDF and email contracts.

## Runtime versus legal approval

A green runtime test proves that Waves 1, 2, 3A–3C, 4A–4D and 5A–5D have feature-specific deterministic rules, source-scoped governed retrieval, strict request adapters and contract-valid explanations. It does not record qualified legal approval, verify customer evidence, decide Gratuity coverage, eligibility, service, wages, amount, nomination, forfeiture, claim, appeal, recovery or remedy, or certify compliance.

The onboarding-readiness snapshot remains separate. It may continue to report pending legal, privacy, source-file, mapping, RAG, security or release decisions until those controlled approvals are explicitly recorded. Passing software tests is not approval.
