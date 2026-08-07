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
node tests/industrial-relations-wave5g-private-beta-checks.mjs
node tests/apprentices-wave5h-private-beta-checks.mjs
```

The maintained baseline command validates Wave 1 and Wave 2. The Wave 3A–3C, Wave 4A–4D and Wave 5A–5H overlay commands validate the complete stacked 57-profile registry.

## Required Wave 5H pass indicators

```json
{
  "valid": true,
  "profileCount": 57,
  "substantiveProfiles": 52,
  "substantiveApprenticesWave5hProfiles": 1,
  "wave5hScenarios": 3,
  "governanceFallbackProfiles": 5,
  "activeCatalogs": 18,
  "apprenticesSources": 8,
  "apprenticesChunks": 12
}
```

The test fails when a profile is missing, a deterministic catalogue is invalid, an expected source fingerprint or source-identity mode changes, the current-Rules reconciliation chunk is absent, a scenario produces an unexpected status/reason code, retrieval fails or escapes deterministic source scope, a decision is mutated, prohibited browser data is retained, or a contract-valid explanation cannot be built.

## Earlier wave checks

The maintained suites continue to prove the existing authority boundaries for:

- POSH Wave 1 and Maternity Benefit Wave 2;
- EPF/EPS/EDLI Waves 3A–3C;
- ESI Waves 4A–4D;
- Appropriate Government Wave 5A;
- Maharashtra Shops Wave 5B;
- Code on Wages Wave 5C;
- Gratuity Wave 5D;
- Employee's Compensation Wave 5E;
- OSHWC Wave 5F;
- Industrial Relations Wave 5G.

Every earlier-wave decision remains deterministic before retrieval, every governed retrieval reports `usedForDecision: false` and `applicabilityAuthority: none`, and explanation output remains fingerprint-bound.

## Industrial Relations Wave 5G checks

Wave 5G evaluates complete, reported-gap and missing-information scenarios for `feature.legal.industrial-relations`. The suite verifies 51 substantive / 6 fallback profiles and 17 catalogues at the Wave 5G overlay, eight IR source identities, twelve scoped chunks, Maharashtra draft-only treatment, transition-source separation and the standing-orders privacy boundary.

Wave 5G cannot determine standing-orders applicability or thresholds, classify an industrial establishment or sector, validate adoption/certification/modification, choose a territorial authority, adjudicate disciplinary/termination or dispute matters, or determine strike/lock-out, retrenchment/closure, penalty or remedy outcomes.

## Apprentices Wave 5H deterministic checks

The Wave 5H overlay evaluates complete, reported-gap and missing-information scenarios for `feature.legal.apprentices`.

For every scenario the suite proves that:

- only the declared apprenticeship source route, Act/base-Rules/2025-amendment source statuses, current-Rules-versus-portal reconciliation, designated/optional trade source control, apprentice-category source control, establishment manpower/band source control, State-variation control, designated/optional trade-register statuses, portal/NAPS lifecycle, authority routing, training-infrastructure, specialist escalation and controlled references are mapped;
- the deterministic decision exists before retrieval;
- complete and reported-gap scenarios remain `specialist-review` because statutory applicability, mandatory engagement, counts/bands, trade/category classification and all individual outcomes remain specialist-only;
- absent required facts produce `more-information-needed`;
- retrieval reports `usedForDecision: false` and `applicabilityAuthority: none`;
- retrieved chunks stay inside the deterministic source-registry allow-list;
- explanations preserve decision status, reason code and fingerprint;
- no rule, retrieval result or provider output calculates worker strength/apprentice numbers, chooses a percentage band, resolves a State variation, classifies a customer role or person, validates a contract/stipend, determines NAPS/DBT eligibility, selects an authority or adjudicates enforcement/remedy matters.

## Wave 5H current-rules reconciliation check

The catalogue must contain `apprentices-current-rules-reconciliation-wave5h-001`. The acceptance suite verifies that this chunk records the known source-synchronisation issue between the September 2025 Rule 7B amendment and older DGT overview wording.

The product rule is conservative by design:

- Gazette/current India Code material and amendments must be reconciled explicitly;
- the DGT-hosted 1992 Rules file is retained as a base source, not represented as a current consolidated ruleset;
- DGT programme/portal summaries are source context only;
- retrieval/provider output cannot silently harmonise contradictory wording;
- no customer obligation may be calculated from portal summary text.

## Wave 5H source-governance checks

The governed catalogue contains eight official source identities and twelve reason-code-scoped chunks:

1. current Apprentices Act, 1961 India Code text;
2. DGT-hosted Apprenticeship Rules, 1992 base file;
3. Apprenticeship (Amendment) Rules, 2025 — G.S.R. 610(E);
4. DGT Apprenticeship Training overview;
5. DGT designated-trades register;
6. DGT optional-trades register;
7. NAPS-2 Guidelines;
8. Apprenticeship India portal.

The acceptance test verifies the expected SHA-256 values for all eight records and requires `fingerprintBasis: curated-source-identity-v1` and `snapshotRole: source-identity-only` for each. No Wave 5H record is represented as an exact controlled full file.

Exact controlled Drive mirrors, a qualified consolidated current-Rules set, applicable State variations and customer-specific trade/category/authority conclusions remain separate approval dependencies.

## Wave 5H browser/privacy checks

The browser adapter must emit exactly the 15 allowed scalar controls plus `apprenticesEvidenceReferences`, with evidence reduced to reference strings.

The deterministic acceptance test and Chromium test protect against transmission or persistence of:

- apprentice identity;
- date of birth or age;
- sex/gender, caste/community or disability/medical data;
- educational records or Aadhaar;
- contact/address information;
- contract bodies or numbers;
- bank, stipend or payroll data;
- training dates or attendance;
- assessments/certificates;
- disputes, notices or orders;
- injury information;
- evidence bodies.

The Chromium test verifies:

- the Wave 5H panel is visible on `/analyze-company-v3.html`;
- no automatic explanation request occurs;
- the panel explains the current-Rules/portal reconciliation boundary;
- only allow-listed fields are submitted after explicit user action;
- specialist-review status and governed citations render correctly;
- zero local/session storage writes occur.

## Runtime status check

After starting the Wave 5H server entrypoint, inspect:

```text
GET /api/legal-rag/status
```

The response should report:

- `platformStatus: all-laws-runnable-private-beta`;
- 57 active profiles;
- zero blocked runtime profiles;
- `substantiveProfileCount: 52`;
- `governanceFallbackProfileCount: 5`;
- seventeen substantive catalogues and one governance-fallback catalogue.

## Browser regression gate

The Executive Assessment workflow runs the dedicated Apprentices Wave 5H Chromium test together with all existing assessment, legal-review, report, homepage and workspace browser tests. Wave 5H must remain explicit-submit, in-memory only and absent from stable report, PDF and email contracts.

## Runtime versus legal approval

A green runtime test proves that Waves 1, 2, 3A–3C, 4A–4D and 5A–5H have deterministic rules, source-scoped governed retrieval, strict request adapters and contract-valid explanations. It does **not** record qualified legal approval, verify customer evidence, decide apprenticeship applicability or mandatory engagement, calculate counts/bands, resolve State law, classify trades or apprentices, decide individual eligibility/contract/stipend/training/certification/NAPS/authority/enforcement outcomes, or certify compliance.

The onboarding-readiness snapshot remains separate. It may continue to report pending legal, privacy, source-file, section-mapping, RAG, security or release decisions until those controlled approvals are explicitly recorded. Passing software tests is not approval.
