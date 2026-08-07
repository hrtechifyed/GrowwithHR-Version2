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
```

The maintained baseline command validates Wave 1 and Wave 2. The Wave 3A–3C, Wave 4A–4D, Wave 5A and Wave 5B overlay commands validate the complete stacked 57-profile registry.

## Required Wave 5B pass indicators

```json
{
  "valid": true,
  "profileCount": 57,
  "substantiveProfiles": 46,
  "substantiveShopsWave5bProfiles": 1,
  "wave5bScenarios": 3,
  "governanceFallbackProfiles": 11,
  "activeCatalogs": 12,
  "shopsWave5bSources": 5,
  "shopsWave5bChunks": 8
}
```

The test fails when a profile is missing, a deterministic catalogue is invalid, a source-governance enum or fingerprint is unsupported, a scenario produces an unexpected status or reason code, retrieval cannot complete, a chunk escapes the deterministic source scope, a decision is mutated, or a contract-valid explanation cannot be built.

## Earlier wave checks

The maintained tests continue to evaluate:

- POSH Wave 1 complete, reported-gap and missing-information scenarios for the six expanded organisational duties and the existing Internal Committee threshold profile;
- Maternity Benefit Wave 2 establishment, eligibility-route, duration, adopting or commissioning mother, special-leave, nursing-break, crèche, notice/payment/records, employment-protection and ESI-overlap controls;
- EPF Waves 3A–3C operational, source-routing and specialist-control profiles while preserving contribution, membership, exemption, certificate and individual-entitlement boundaries;
- ESI Waves 4A–4D establishment, employee-insurance, contractor, payment, accident, coverage-routing, wage-ceiling, rate-source, special-route, benefit-process, medical-administration, exemption-governance and enforcement-authority controls;
- Appropriate Government Wave 5A cross-code source-readiness and escalation controls without selecting Central or State jurisdiction.

## Maharashtra Shops Wave 5B checks

The Wave 5B overlay evaluates complete, reported-gap and missing-information scenarios for the Maharashtra Shops and Establishments source-controls profile.

For every scenario the suite proves that:

- only the declared Maharashtra State scope, 2017 Act source status, 2018 Rules source status, amendment-register status, draft-versus-final reconciliation, establishment-classification control, worker-count-band control, registration or intimation source control, working-condition source control, effective-date/version control, specialist escalation and evidence references are mapped;
- the deterministic decision exists before retrieval;
- complete and reported-gap scenarios remain `specialist-review` because customer coverage, establishment classification, thresholds, registration, working conditions, records, penalties and enforcement are not certified;
- absent required facts produce `more-information-needed`;
- retrieval reports `usedForDecision: false` and `applicabilityAuthority: none`;
- retrieved chunks stay inside the deterministic reason-code and Source Register allow-list;
- explanations preserve status, reason code and decision fingerprint;
- no rule infers a location, employee count or establishment type, selects a threshold, validates a filing or certificate, or treats a draft notification as final law.

The Wave 5B browser payload check proves that names, addresses, contact details, registration numbers, employee identities, age or gender data, schedules, attendance, wages, payroll, applications, certificates, notices, orders, disputes and evidence bodies are excluded. Evidence arrays are reduced to controlled references. The Chromium test verifies no automatic request, allow-listed submission, rendered citations and zero browser-storage writes.

## Wave 5B source-governance checks

The Wave 5B catalogue contains five official source identities and eight reason-code-scoped chunks:

1. Maharashtra Shops and Establishments Act, 2017 source identity;
2. Maharashtra Shops and Establishments Rules, 2018 source identity;
3. Draft Maharashtra Shops and Establishments Amendment Rules, 2025 source identity;
4. Maharashtra Labour Department services portal source identity;
5. Maharashtra Labour RTS services portal source identity.

All five records are labelled `source-identity-only` and use curated identity fingerprints. They are not represented as verified full files. The November 2025 record remains explicitly draft and cannot supply an operative threshold, form, night-work rule or other legal duty without a separately controlled final instrument and qualified review.

No State or Union Territory other than Maharashtra is represented as onboarded. Exact amendments, final notifications, local authority practice and customer-specific establishment facts remain specialist-review dependencies.

## Runtime status check

After starting the Wave 5B server entrypoint, inspect:

```text
GET /api/legal-rag/status
```

The response should report:

- `platformStatus: all-laws-runnable-private-beta`;
- 57 active profiles;
- zero blocked runtime profiles;
- `substantiveProfileCount: 46`;
- `governanceFallbackProfileCount: 11`;
- eleven substantive catalogues and one governance-fallback catalogue.

## Browser regression gate

The Executive Assessment workflow runs the dedicated Wave 5B Chromium test together with all existing assessment, report, homepage and workspace browser tests. Wave 5B must remain explicit-submit, in-memory only and absent from the stable report, PDF and email contracts.

## Runtime versus legal approval

A green runtime test proves that Waves 1, 2, 3A–3C, 4A–4D, 5A and 5B have feature-specific deterministic rules, source-scoped governed retrieval, strict request adapters and contract-valid explanations. It does not record qualified legal approval, verify customer evidence, approve exemptions, authenticate documents or officers, decide liability or recovery, select the legally appropriate Government, decide Maharashtra coverage or duties, or certify compliance.

The onboarding-readiness snapshot remains separate. It may continue to report pending legal, privacy, source-file, mapping, RAG, security or release decisions until those controlled approvals are explicitly recorded. Passing software tests is not approval.
