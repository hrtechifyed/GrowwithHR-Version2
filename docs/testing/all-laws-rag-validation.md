# Validate RAG across all registered legal profiles

**Release:** v0.20.2 private-beta branch  
**Purpose:** prove that every profile is runnable, that retrieval/explanation remain outside deterministic authority, and that research-only families remain blocked from accidental product capture.

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
node tests/industrial-relations-wave5g-private-beta-checks.mjs
node tests/apprentices-wave5h-private-beta-checks.mjs
node tests/child-adolescent-labour-wave5i-private-beta-checks.mjs
node tests/bonded-forced-labour-wave5j-research-governance-checks.mjs
node tests/contract-workforce-wave5k-private-beta-checks.mjs
```

The maintained baseline validates Waves 1–2. Overlay commands validate the complete stacked 57-profile registry while Wave 5J separately proves that Bonded and Forced Labour remains research-only.

## Required Wave 5K pass indicators

```json
{
  "valid": true,
  "profileCount": 57,
  "substantiveProfiles": 54,
  "substantiveContractWorkforceWave5kProfiles": 1,
  "wave5kScenarios": 3,
  "governanceFallbackProfiles": 3,
  "activeCatalogs": 20,
  "contractWorkforceSources": 8,
  "contractWorkforceChunks": 12
}
```

The Wave 5K test fails when a profile is missing, a deterministic catalogue is invalid, an expected source fingerprint changes, cross-family reconciliation is absent, a scenario produces an unexpected status/reason code, retrieval escapes deterministic source scope, an explanation mutates the decision, prohibited browser data survives payload minimisation, or a governance artifact violates the non-substitution boundary.

## Earlier wave checks

The maintained suites continue to prove existing deterministic and privacy boundaries for POSH, Maternity Benefit, EPF/EPS/EDLI Waves 3A–3C, ESI Waves 4A–4D, Appropriate Government Wave 5A, Maharashtra Shops Wave 5B, Code on Wages Wave 5C, Gratuity Wave 5D, Employee's Compensation Wave 5E, OSHWC Wave 5F, Industrial Relations Wave 5G, Apprentices Wave 5H and Child and Adolescent Labour Wave 5I.

Every substantive decision exists before retrieval. Governed retrieval reports `usedForDecision: false` and `applicabilityAuthority: none`, and explanation output remains fingerprint-bound.

## Bonded and Forced Labour Wave 5J research guard

`tests/bonded-forced-labour-wave5j-research-governance-checks.mjs` proves that `feature.legal.bonded-forced-labour` remains on governance fallback while specialist research and safeguarding blockers are open. It fails if a Bonded/Forced Labour assessment contract, runtime source-chunk catalogue, browser panel, substantive server rule or router overlay appears prematurely.

Wave 5K must not weaken this guard. The Wave 5J research-only boundary remains part of the All-Laws workflow before the Wave 5K acceptance check.

## Contract Workforce Wave 5K deterministic checks

Wave 5K evaluates complete, reported-gap and missing-information scenarios for `feature.legal.contract-workforce`.

For every scenario the suite proves that:

- only the declared source route, OSHWC Code/Central Rules/commencement status, State draft-final reconciliation, Chapter XI Part I scope/threshold source controls, principal-employer/contractor classification-source controls, licensing/work-order/welfare/wage/core-activity controls, separate EPF/ESI dependency statuses, cross-family reconciliation, authority/escalation and controlled references are mapped;
- the deterministic decision exists before retrieval;
- complete and reported-gap scenarios remain `specialist-review`;
- absent required facts produce `more-information-needed`;
- retrieval reports `usedForDecision: false` and `applicabilityAuthority: none`;
- retrieved chunks stay inside the deterministic source-registry allow-list;
- explanations preserve decision status, reason code and fingerprint;
- no rule, retrieval result or provider output turns an OSHWC result into an EPF/ESI result or vice versa.

## Wave 5K source-governance checks

The governed catalogue contains eight source records and twelve reason-code-scoped chunks.

Four OSHWC records are verified as `curated-source-identity-v1` / `source-identity-only` using the existing Wave 5F fingerprints:

1. `oshwc-code-2020`;
2. `oshwc-central-rules-2026`;
3. `oshwc-commencement-so-5321e-2025`;
4. `maharashtra-oshwc-labour-draft-rules-2026`.

The Maharashtra source must retain `instrumentStatus: draft`.

Four dependency records must retain their exact controlled hashes, byte lengths and pagination from the existing EPF/ESI stack:

1. `social-security-code-2020`;
2. `employees-provident-funds-scheme-2026`;
3. `social-security-central-rules-2026`;
4. `employees-state-insurance-general-regulations-1950`.

The suite requires `contract-workforce-social-security-dependency-wave5k-001` to preserve the Rule 93(4) separate-dependency boundary, `contract-workforce-cross-family-reconciliation-wave5k-001` to prohibit family substitution, and `contract-workforce-maharashtra-draft-wave5k-001` to keep the State rules draft-only.

## Wave 5K browser/privacy checks

The browser adapter emits exactly the 18 allowed scalar controls plus `contractWorkforceEvidenceReferences`, with evidence reduced to controlled reference strings.

The deterministic acceptance and Chromium tests protect against transmission or persistence of contractor/worker identities, contact/address data, PAN/GST/registration identifiers, contract/work-order bodies, worker rosters, UAN/IP numbers, payroll/wage/contribution rows, attendance, bank/payment/invoice data, licence/certificate bodies, notices/orders/disputes, accident/medical information and evidence bodies.

The Chromium test verifies that:

- the Wave 5K panel is visible on `/analyze-company-v3.html`;
- no automatic explanation request occurs;
- the panel states that EPF and ESI remain separate deterministic families;
- Maharashtra's current State rules are described as draft-only;
- only allow-listed fields are submitted after explicit user action;
- `specialist-review` and governed Central Rules / Rule 93(4) citations render;
- zero local/session-storage writes occur.

## Runtime status check

After starting the Wave 5K server entrypoint, inspect:

```text
GET /api/legal-rag/status
```

The response should report:

- `platformStatus: all-laws-runnable-private-beta`;
- 57 active profiles;
- zero blocked runtime profiles;
- `substantiveProfileCount: 54`;
- `governanceFallbackProfileCount: 3`;
- nineteen substantive catalogues and one governance-fallback catalogue;
- router version `1.20.0`.

## Regression gates

The All-Laws workflow runs all prior overlays, the Wave 5J research-only guard, the dedicated Wave 5K acceptance test and the complete legal-RAG platform suite.

The Executive Assessment workflow runs the dedicated Contract Workforce Wave 5K Chromium test with all existing assessment, legal-review, report, homepage and workspace browser tests. Wave 5K must remain explicit-submit, in-memory only and absent from stable report, PDF and email contracts.

M4 Report Integration and M7 RAG-Ready Hardening remain required regression gates for the Wave 5K product change.

## Runtime versus legal approval

A green Wave 5K runtime proves deterministic rules, source-scoped retrieval, strict request adapters, cross-family non-substitution and contract-valid explanations. It does **not** determine OSHWC contract-labour applicability, thresholds, principal-employer/contractor status, licensing, wages, core activity, EPF membership/contributions, ESI insurance/contributions, State law, enforcement or remedies, and it does not grant legal/privacy/RAG/source/security/release approval.
