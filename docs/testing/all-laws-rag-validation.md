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
node tests/child-adolescent-labour-wave5i-private-beta-checks.mjs
```

The maintained baseline validates Wave 1 and Wave 2. The Wave 3A–3C, Wave 4A–4D and Wave 5A–5I overlay commands validate the complete stacked 57-profile registry.

## Required Wave 5I pass indicators

```json
{
  "valid": true,
  "profileCount": 57,
  "substantiveProfiles": 53,
  "substantiveChildAdolescentLabourWave5iProfiles": 1,
  "wave5iScenarios": 3,
  "governanceFallbackProfiles": 4,
  "activeCatalogs": 19,
  "childAdolescentLabourSources": 5,
  "childAdolescentLabourChunks": 10
}
```

The test fails when a profile is missing, a deterministic catalogue is invalid, an expected source-identity fingerprint changes, safeguarding/source reconciliation is absent, a scenario produces an unexpected status/reason code, retrieval fails or escapes deterministic source scope, a decision is mutated, prohibited browser data is retained, or a contract-valid explanation cannot be built.

## Earlier wave checks

The maintained suites continue to prove the existing deterministic and privacy boundaries for POSH Wave 1, Maternity Benefit Wave 2, EPF/EPS/EDLI Waves 3A–3C, ESI Waves 4A–4D, Appropriate Government Wave 5A, Maharashtra Shops Wave 5B, Code on Wages Wave 5C, Gratuity Wave 5D, Employee's Compensation Wave 5E, OSHWC Wave 5F, Industrial Relations Wave 5G and Apprentices Wave 5H.

Every earlier-wave decision remains deterministic before retrieval, every governed retrieval reports `usedForDecision: false` and `applicabilityAuthority: none`, and explanation output remains fingerprint-bound.

## Child and Adolescent Labour Wave 5I deterministic checks

The Wave 5I overlay evaluates complete, reported-gap and missing-information scenarios for `feature.legal.child-adolescent-labour`.

For every scenario the suite proves that:

- only the declared safeguarding source route, current Act, principal Rules, 2017 Amendment Rules, commencement, hazardous Schedule, current-source reconciliation, privacy-safe age-band source control, work-type/hazard classification-source control, family-enterprise/artist exception-source controls, education/register/notice source controls, District-authority escalation, immediate human safeguarding escalation, State variation and controlled references are mapped;
- no exact age, date of birth, identity or case-level safeguarding fact is part of the fact contract;
- the deterministic decision exists before retrieval;
- complete and reported-gap scenarios remain `specialist-review` because age, work, hazardous classification, exception, offence, rescue, enforcement, rehabilitation and remedy outcomes remain human/specialist-only;
- absent required facts produce `more-information-needed`;
- retrieval reports `usedForDecision: false` and `applicabilityAuthority: none`;
- retrieved chunks stay inside the deterministic source-registry allow-list;
- explanations preserve decision status, reason code and fingerprint;
- no rule, retrieval result or provider output classifies a person/activity, approves a statutory exception, decides an offence/rescue/enforcement outcome, or replaces human safeguarding escalation.

## Wave 5I source-governance checks

The governed catalogue contains five official source identities and ten reason-code-scoped chunks:

1. current Child and Adolescent Labour (Prohibition and Regulation) Act, 1986 source identity;
2. Child Labour (Prohibition and Regulation) Rules, 1988 principal Rules source identity;
3. Child Labour (Prohibition and Regulation) Amendment Rules, 2017 — G.S.R. 543(E);
4. S.O. 2823(E), 1 September 2016 amendment commencement;
5. S.O. 2827(E), 30 August 2017 hazardous Schedule amendment.

The acceptance test verifies the expected SHA-256 values for all five source-identity records and requires `fingerprintBasis: curated-source-identity-v1` and `snapshotRole: source-identity-only` for each. These are not official PDF byte hashes. Exact controlled full-file Drive mirrors remain pending.

The suite also requires `child-adolescent-rules-reconciliation-wave5i-001`, proving that the 1988 principal Rules are not represented as a standalone current consolidated text, and `child-adolescent-district-safeguarding-wave5i-001`, proving that complaint, rescue, abuse, trafficking, victim/witness and case information is outside retrieval/provider context.

## Wave 5I browser/privacy/safeguarding checks

The browser adapter emits exactly the 16 allowed scalar controls plus `childAdolescentEvidenceReferences`, with evidence reduced to controlled reference strings.

The deterministic acceptance and Chromium tests protect against transmission or persistence of:

- child/adolescent identity;
- exact age or date of birth;
- parent, guardian or family identity;
- school/education records;
- medical/disability data;
- caste/community/religion data;
- address/contact or precise child-linked location data;
- photographs/video;
- payment/payroll or schedules/attendance;
- allegation, abuse, trafficking or exploitation narratives;
- rescue, complaint, case, notice or order content;
- victim/witness data;
- police, CWC or District Magistrate case facts;
- evidence bodies.

The Chromium test verifies that the Wave 5I panel is visible on `/analyze-company-v3.html`, makes no automatic request, displays the human-safeguarding boundary, submits only allow-listed fields after explicit user action, renders `specialist-review` and governed citations, and makes zero local/session-storage writes.

## Runtime status check

After starting the Wave 5I server entrypoint, inspect:

```text
GET /api/legal-rag/status
```

The response should report:

- `platformStatus: all-laws-runnable-private-beta`;
- 57 active profiles;
- zero blocked runtime profiles;
- `substantiveProfileCount: 53`;
- `governanceFallbackProfileCount: 4`;
- eighteen substantive catalogues and one governance-fallback catalogue.

## Browser regression gate

The Executive Assessment workflow runs the dedicated Child and Adolescent Labour Wave 5I Chromium test together with all existing assessment, legal-review, report, homepage and workspace browser tests. Wave 5I must remain explicit-submit, in-memory only and absent from stable report, PDF and email contracts.

## Runtime versus legal/safeguarding approval

A green runtime test proves that Waves 1, 2, 3A–3C, 4A–4D and 5A–5I have deterministic rules, source-scoped governed retrieval, strict request adapters and contract-valid explanations. It does **not** record qualified legal/privacy/safeguarding approval, verify customer evidence, determine a person's age, classify work or a hazardous process, approve an exception, decide an offence/rescue/enforcement/rehabilitation/remedy outcome, resolve State law or provide an emergency/case-management service.

The onboarding-readiness snapshot remains separate. It may continue to report pending legal, privacy, safeguarding, source-file, section-mapping, RAG, security or release decisions until those controlled approvals are explicitly recorded. Passing software tests is not approval.
