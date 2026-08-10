# Validate RAG across all registered legal profiles

**Release:** v0.20.2 private-beta branch  
**Purpose:** prove that every profile is runnable, that retrieval/explanation remain outside deterministic authority, that dedicated legal families cannot substitute for one another, and that research-only families remain blocked from accidental product capture.

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
node tests/social-security-wave5l-private-beta-checks.mjs
```

The maintained baseline validates Waves 1–2. Overlay commands validate the complete stacked 57-profile registry while Wave 5J separately proves that Bonded and Forced Labour remains research-only.

## Required Wave 5L pass indicators

```json
{
  "valid": true,
  "profileCount": 57,
  "substantiveProfiles": 55,
  "substantiveSocialSecurityWave5lProfiles": 1,
  "wave5lScenarios": 3,
  "governanceFallbackProfiles": 2,
  "activeCatalogs": 21,
  "socialSecuritySources": 4,
  "socialSecurityChunks": 12
}
```

The Wave 5L test fails when a profile is missing, a deterministic catalogue is invalid, an exact controlled source fingerprint changes, First Schedule/chapter routing is absent, BOCW or Chapter IX is promoted beyond specialist routing, a scenario produces an unexpected status/reason code, retrieval escapes deterministic source scope, an explanation mutates the decision, prohibited browser data survives payload minimisation, or a governance artifact permits generic/dedicated-family substitution.

## Earlier wave checks

The maintained suites continue to prove existing deterministic and privacy boundaries for POSH, Maternity Benefit, EPF/EPS/EDLI Waves 3A–3C, ESI Waves 4A–4D, Appropriate Government Wave 5A, Maharashtra Shops Wave 5B, Code on Wages Wave 5C, Gratuity Wave 5D, Employee's Compensation Wave 5E, OSHWC Wave 5F, Industrial Relations Wave 5G, Apprentices Wave 5H, Child and Adolescent Labour Wave 5I and Contract Workforce Wave 5K.

Every substantive decision exists before retrieval. Governed retrieval reports `usedForDecision: false` and `applicabilityAuthority: none`, and explanation output remains fingerprint-bound.

## Bonded and Forced Labour Wave 5J research guard

`tests/bonded-forced-labour-wave5j-research-governance-checks.mjs` proves that `feature.legal.bonded-forced-labour` remains on governance fallback while specialist research and safeguarding blockers are open. It fails if a Bonded/Forced Labour assessment contract, runtime source-chunk catalogue, browser panel, substantive server rule or router overlay appears prematurely.

Wave 5L must not weaken this guard. The Wave 5J research-only boundary remains part of the All-Laws workflow before Waves 5K and 5L acceptance checks.

## Contract Workforce Wave 5K non-substitution checks

Wave 5K remains the bounded OSHWC Chapter XI Part I cross-family layer. Its acceptance test continues to prove that OSHWC, EPF and ESI contractor outcomes remain separate, Maharashtra's current OSHWC State rules remain draft-only, and no family result substitutes for another.

## Social Security Wave 5L deterministic checks

Wave 5L evaluates complete, reported-gap and missing-information scenarios for `feature.legal.social-security`.

For every scenario the suite proves that:

- only the declared family route, four core-source statuses, First Schedule/chapter routing controls, dedicated-family handoffs, BOCW/Chapter IX specialist handoffs, cross-family reconciliation, State/UT variation, specialist escalation and controlled references are mapped;
- the deterministic decision exists before retrieval;
- complete and reported-gap scenarios remain `specialist-review`;
- absent required facts produce `more-information-needed`;
- retrieval reports `usedForDecision: false` and `applicabilityAuthority: none`;
- retrieved chunks stay inside the deterministic source-registry allow-list;
- explanations preserve decision status, reason code and fingerprint;
- no rule, retrieval result or provider output decides chapter applicability or scheme coverage;
- the generic Social Security route cannot override, combine or infer a dedicated family result;
- BOCW Chapter VIII and unorganised/gig/platform-worker Chapter IX remain specialist-only.

## Wave 5L source-governance checks

The governed catalogue contains four exact controlled full-file source records and twelve reason-code-scoped chunks.

The acceptance test verifies the existing Source Register fingerprints, byte lengths and pagination for:

1. `social-security-code-2020`;
2. `social-security-central-rules-2026`;
3. `social-security-code-commencement-so-5319e-2025`;
4. `social-security-code-corrigendum-so-5936e-2025`.

No Wave 5L source is `source-identity-only` and no new uncontrolled legal source is represented as an exact file.

The suite requires:

- `social-security-first-schedule-wave5l-001` to preserve the section 1(4)/First Schedule routing-only boundary;
- dedicated EPF/EPS/EDLI, ESI, Gratuity, Maternity Benefit and Employee's Compensation handoff chunks;
- `social-security-bocw-family-wave5l-001` to remain specialist-only;
- `social-security-chapter-ix-wave5l-001` to prohibit person/aggregator/platform classification;
- `social-security-cross-family-wave5l-001` to prohibit family substitution and automatic saved-law resolution.

## Wave 5L browser/privacy checks

The browser adapter emits exactly the 18 allowed scalar controls plus `socialSecurityEvidenceReferences`, with evidence reduced to controlled reference strings.

The deterministic acceptance and Chromium tests protect against transmission or persistence of employee/member/worker identities, contact/address data, UAN/ESI or government identifiers, payroll/wage/contribution rows, attendance/service records, medical/injury/death information, nominee/dependant data, claims/benefit amounts, bank/payment data, notices/orders/disputes and evidence bodies.

The Chromium test verifies that:

- the Wave 5L panel is visible on `/analyze-company-v3.html`;
- no automatic explanation request occurs;
- the panel states that the generic result never decides chapter applicability or scheme coverage;
- BOCW Chapter VIII and Chapter IX are visibly specialist-only;
- only allow-listed fields are submitted after explicit user action;
- `specialist-review` and governed Code / First Schedule citations render;
- zero local/session-storage writes occur.

## Runtime status check

After starting the Wave 5L server entrypoint, inspect:

```text
GET /api/legal-rag/status
```

The response should report:

- `platformStatus: all-laws-runnable-private-beta`;
- 57 active profiles;
- zero blocked runtime profiles;
- `substantiveProfileCount: 55`;
- `governanceFallbackProfileCount: 2`;
- twenty substantive catalogues and one governance-fallback catalogue;
- router version `1.21.0`.

## Regression gates

The All-Laws workflow runs all prior overlays, the Wave 5J research-only guard, Wave 5K non-substitution acceptance, the dedicated Wave 5L acceptance test and the complete legal-RAG platform suite.

The Executive Assessment workflow runs the dedicated Social Security Wave 5L Chromium test with all existing assessment, legal-review, report, homepage and workspace browser tests. Wave 5L must remain explicit-submit, in-memory only and absent from stable report, PDF and email contracts.

M4 Report Integration and M7 RAG-Ready Hardening remain required regression gates for the Wave 5L product change.

## Runtime versus legal approval

A green Wave 5L runtime proves deterministic family routing, exact-source-scoped retrieval, strict request adapters, family non-substitution and contract-valid explanations. It does **not** determine Social Security Code or chapter applicability, scheme coverage, establishment/worker/aggregator classification, contributions, wage ceilings, rates, benefits, BOCW cess, claims, exemptions, enforcement, State/UT law or remedies, and it does not grant legal/privacy/RAG/source/security/release approval.
