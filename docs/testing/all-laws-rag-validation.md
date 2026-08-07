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
node tests/employee-compensation-wave5e-private-beta-checks.mjs
node tests/oshwc-wave5f-private-beta-checks.mjs
```

The maintained baseline command validates Wave 1 and Wave 2. The Wave 3A–3C, Wave 4A–4D and Wave 5A–5F overlay commands validate the complete stacked 57-profile registry.

## Required Wave 5F pass indicators

```json
{
  "valid": true,
  "profileCount": 57,
  "substantiveProfiles": 50,
  "substantiveOshwcWave5fProfiles": 1,
  "wave5fScenarios": 3,
  "governanceFallbackProfiles": 7,
  "activeCatalogs": 16,
  "oshwcSources": 5,
  "oshwcChunks": 10
}
```

The test fails when a profile is missing, a deterministic catalogue is invalid, a source-governance fingerprint or draft-state marker is unexpected, a scenario produces an unexpected status or reason code, retrieval cannot complete, a chunk escapes the deterministic source scope, a decision is mutated, or a contract-valid explanation cannot be built.

## Earlier wave checks

The maintained tests continue to evaluate:

- POSH Wave 1 complete, reported-gap and missing-information scenarios for the six expanded organisational duties and the existing Internal Committee threshold profile;
- Maternity Benefit Wave 2 establishment, eligibility-route, duration, adopting or commissioning mother, special-leave, nursing-break, crèche, notice/payment/records, employment-protection and ESI-overlap controls;
- EPF Waves 3A–3C operational, source-routing and specialist-control profiles while preserving contribution, membership, exemption, certificate and individual-entitlement boundaries;
- ESI Waves 4A–4D establishment, employee-insurance, contractor, payment, accident, coverage-routing, wage-ceiling, rate-source, special-route, benefit-process, medical-administration, exemption-governance and enforcement-authority controls;
- Appropriate Government Wave 5A cross-code source-readiness and escalation controls without selecting Central or State jurisdiction;
- Maharashtra Shops Wave 5B State source-readiness and organisational controls without coverage, threshold, registration, working-condition, penalty or enforcement decisions;
- Code on Wages Wave 5C organisation-level source-readiness, commencement, version, jurisdiction-routing and bounded source-register controls without selecting a Government, wage rate, category, zone, State instrument or employee entitlement;
- Gratuity Wave 5D Chapter V, First Schedule, Rules, transition and organisation-control review without customer coverage, individual eligibility, service, wage, amount, claim, appeal or recovery decisions;
- Employee's Compensation Wave 5E Chapter VII, schedules, Rules, ESI-overlap, transition and organisation-control review without injury, causation, liability, amount, claim or remedy decisions.

## OSHWC Wave 5F checks

The Wave 5F overlay evaluates complete, reported-gap and missing-information scenarios for `feature.legal.oshwc`.

For every scenario the suite proves that:

- only the declared Central/Maharashtra candidate source route, Code source status, Central Rules source status, commencement source status, two Maharashtra draft-rule source statuses, draft-final reconciliation control, establishment-scope control, registration source control, core safety/health/welfare source control, hours/leave/records source control, authority/enforcement source control, deferred-special-category boundary, specialist escalation and controlled references are mapped;
- the deterministic decision exists before retrieval;
- complete and reported-gap scenarios remain `specialist-review` because OSHWC applicability, worker thresholds, establishment/industry classification, registration/licensing, substantive safety/working-condition duties, incidents, enforcement and remedies remain specialist-only;
- absent required facts produce `more-information-needed`;
- retrieval reports `usedForDecision: false` and `applicabilityAuthority: none`;
- retrieved chunks stay inside the deterministic reason-code and source-registry allow-list;
- explanations preserve status, reason code and the decision fingerprint;
- no rule, retrieval result or provider output treats a Maharashtra draft as final, infers customer classification or worker thresholds, decides registration/licensing, certifies safety standards, calculates hours/leave or determines inspection, penalty, prosecution or remedy outcomes.

The Wave 5F browser payload check proves that names, contact details, addresses, registration numbers, employee identities, age/sex data, schedules, attendance, payroll, wages, appointment letters, medical/health records, accident/dangerous-occurrence narratives, licences, certificates, notices, orders, penalties, disputes and evidence bodies are excluded. Evidence arrays are reduced to controlled references. The Chromium test verifies no automatic request, draft-boundary messaging, allow-listed submission, rendered citations and zero browser-storage writes.

## Wave 5F source-governance checks

The Wave 5F catalogue contains five official source identities and ten reason-code-scoped chunks:

1. Occupational Safety, Health and Working Conditions Code, 2020;
2. Occupational Safety, Health and Working Conditions (Central) Rules, 2026;
3. S.O. 5321(E), dated 21 November 2025;
4. draft Maharashtra Occupational Safety, Health and Working Conditions (Labour) Rules, 2026;
5. draft Maharashtra Occupational Safety, Health and Working Conditions (Factories and Other Ports) Rules, 2026.

The test verifies the registered/curated source-identity SHA-256 values for all five records, requires `curated-source-identity-v1` / `source-identity-only`, and requires both Maharashtra records to carry `instrumentStatus: draft`.

The catalogue maps generic Code application/registration/employer-duty controls, Chapters IV–X working-condition source context, current Central Rules and transition context, commencement, both Maharashtra draft branches, an explicit draft-final reconciliation control and a deferred Chapter XI special-category boundary.

These mappings remain source-readiness controls. They cannot create an OSHWC applicability, classification, threshold, registration/licensing, safety-standard, working-condition, incident, enforcement or remedy outcome. Exact full controlled file mirrors and any final Maharashtra rules remain source-file/qualified-review dependencies. Contract labour and inter-State migrant worker determinations remain deferred and preserve separate EPF/ESI dependencies.

## Runtime status check

After starting the Wave 5F server entrypoint, inspect:

```text
GET /api/legal-rag/status
```

The response should report:

- `platformStatus: all-laws-runnable-private-beta`;
- 57 active profiles;
- zero blocked runtime profiles;
- `substantiveProfileCount: 50`;
- `governanceFallbackProfileCount: 7`;
- fifteen substantive catalogues and one governance-fallback catalogue.

## Browser regression gate

The Executive Assessment workflow runs the dedicated Wave 5F Chromium test together with all existing assessment, report, homepage and workspace browser tests. Wave 5F must remain explicit-submit, in-memory only and absent from the stable report, PDF and email contracts.

## Runtime versus legal approval

A green runtime test proves that Waves 1, 2, 3A–3C, 4A–4D and 5A–5F have feature-specific deterministic rules, source-scoped governed retrieval, strict request adapters and contract-valid explanations. It does not record qualified legal approval, verify customer evidence, decide OSHWC applicability, establishment/industry classification, worker thresholds, registration/licensing, substantive safety or working conditions, incident sufficiency, inspection, penalty, prosecution or remedy, treat draft Maharashtra rules as final, or certify compliance.

The onboarding-readiness snapshot remains separate. It may continue to report pending legal, privacy, source-file, mapping, RAG, security or release decisions until those controlled approvals are explicitly recorded. Passing software tests is not approval.
