# Validate RAG across all registered legal profiles

**Updated:** 11 August 2026  
**Release baseline:** v0.20.2 Governed Legal RAG Private Beta  
**Purpose:** prove the effective 57-profile runtime remains deterministic-first, source-scoped and privacy-bounded; verify the exact-file reconciliation control; prove Wave 5J remains blocked and Wave 5M remains excluded; and produce software evidence for the human release gate.

## 1. Validation is evidence, not approval

Passing these tests demonstrates software/runtime contract behaviour. It does **not** grant legal, privacy, RAG, source-file, security, safeguarding or production release approval.

All active substantive catalogues remain `needs-legal-review` until authorised decisions are recorded.

Programme release gate: #142.

## 2. Required effective runtime invariant

```json
{
  "profileCount": 57,
  "substantiveProfiles": 55,
  "governanceFallbackProfiles": 2,
  "activeCatalogs": 21
}
```

Governance fallbacks:

- `feature.legal.bonded-forced-labour` — Wave 5J research/safeguarding stop;
- `feature.legal.multi-country-employment` — Wave 5M current-release exclusion.

Wave 5M is no longer waiting for a country pair in this release. #141 is closed `not planned`; the scope guard must preserve zero substantive Wave 5M runtime surface.

## 3. Primary acceptance commands

```bash
npm install --no-audit --no-fund
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
node tests/multi-country-employment-wave5m-scope-guard-checks.mjs

npm run test:complete-legal-rag-platform
npm run test:m7
npm run test:server-cors
npm run test:release
```

Run the maintained Chromium release/e2e suite after the final approved source/runtime change.

## 4. Exact-source reconciliation validation

The all-laws onboarding regression also validates the repository audit bridge:

```text
data/legal-source-governance/exact-source-file-reconciliation-2026-08-11.v1.json
```

Required reconciliation assertions:

- `matchedExactFiles` = 31;
- the exact Source ID list contains 31 unique IDs;
- `runtimeMigrationApplied` remains `false` until a separately reviewed migration occurs;
- `legalReviewStatus` remains `needs-legal-review`;
- Wave 5J remains non-runtime and records its two hard source blockers;
- Wave 5M remains out-of-scope with no selected country pair/runtime activation;
- duplicate quarantine state remains recorded;
- rules prohibit silent replacement of curated source-identity fingerprints by PDF hashes.

This validates the audit record, not the legal accuracy of the source mapping. Qualified source/legal/RAG review is still required.

## 5. Deterministic-first invariant

For every substantive feature scenario:

1. normalise only the feature's permitted input fields;
2. evaluate the deterministic rule;
3. create the decision before retrieval;
4. run RAG using only the decision's permitted Source Register IDs;
5. confirm retrieved chunks all belong to that allowed source scope;
6. build the explanation request from the decision/retrieval trace;
7. confirm the explanation cannot change the decision.

Required retrieval metadata:

```text
usedForDecision: false
applicabilityAuthority: none
```

Complete/reported-gap outcomes remain review-oriented (`specialist-review`) where defined. Missing required facts remain `more-information-needed`.

## 6. Family regression coverage

The maintained suites protect:

- POSH — 7 substantive profiles;
- Maternity Benefit — 10;
- EPF/EPS/EDLI Waves 3A–3C — 12;
- ESI Waves 4A–4D — 15;
- Appropriate Government 5A — 1;
- Maharashtra Shops 5B — 1;
- Code on Wages 5C — 1;
- Gratuity 5D — 1;
- Employee's Compensation 5E — 1;
- OSHWC 5F — 1;
- Industrial Relations 5G — 1;
- Apprentices 5H — 1;
- Child and Adolescent Labour 5I — 1;
- Contract Workforce 5K — 1;
- Generic Social Security 5L — 1.

Total substantive profiles: 55.

## 7. Wave 5J — Bonded and Forced Labour guard

`tests/bonded-forced-labour-wave5j-research-governance-checks.mjs` must continue to prove that Wave 5J is governance/research-only.

The test should fail if an unapproved Wave 5J assessment fact contract, substantive deterministic rule, runtime source-chunk catalogue, browser panel or provider/router overlay appears.

External blockers remain:

- #139 — exact Ministry SOP referenced as issued 14 May 2026 and exact approved/notified 2026–31 rehabilitation/welfare operational material;
- #140 — qualified Article 23 / 1976 Act / BNS / Supreme Court mapping, safeguarding, privacy/security and State/UT review.

Live coercion/trafficking/confinement/violence/retaliation/rescue case content must not enter the normal RAG provider path.

## 8. Wave 5K — Contract Workforce non-substitution

Wave 5K remains a bounded OSHWC Chapter XI Part I/cross-family readiness feature.

Validation must prove:

- the OSHWC/Contract Workforce result cannot decide EPF or ESI coverage;
- EPF/ESI results cannot decide OSHWC applicability;
- retrieval/provider output cannot merge the three family decisions;
- Maharashtra OSHWC State drafts remain non-operative.

## 9. Wave 5L — Generic Social Security routing

Wave 5L remains a family/chapter source router, not a generic Social Security applicability engine.

Validate that:

- dedicated EPF/EPS/EDLI, ESI, Gratuity, Maternity Benefit and Employee's Compensation results remain separate;
- BOCW Chapter VIII and unorganised/gig/platform-worker Chapter IX remain specialist-only routes;
- only the declared family route and permitted core sources are used;
- the provider cannot combine or override dedicated family results.

## 10. Wave 5M — explicit current-release exclusion

`tests/multi-country-employment-wave5m-scope-guard-checks.mjs` must prove that Multi-country Employment remains governance-only/out-of-scope.

Current release requirements:

- `countryPairSelected` is false;
- no assessment fact contract/person-level mobility intake;
- no substantive deterministic rule;
- no runtime catalogue/chunks;
- no browser/provider route;
- no cross-border data design;
- no immigration, tax-residence, PE, payroll-withholding, social-security-coverage or foreign-employment-law determination.

Do not relax the guard because #141 is closed. Closing #141 records exclusion; it does not activate Wave 5M.

## 11. Browser/privacy checks

Every substantive legal-review panel must:

- make no automatic provider request;
- submit only after explicit user action;
- emit only the feature allow-list of organisation-level controls/references;
- exclude prohibited person-level/payroll/medical/case/evidence content;
- store no panel inputs/results in local/session storage;
- remain outside stable report/PDF/email contracts unless separately approved.

Wave 5J and Wave 5M must have no substantive browser/provider surface.

## 12. Source/citation checks

For each substantive scenario, verify:

- retrieval is restricted to `decision.sourceRegistryIds`;
- every returned chunk resolves to a governed source;
- the explanation cites only retrieved chunks;
- decision/retrieval fingerprints are preserved;
- draft/research classification is not upgraded by retrieval;
- one family cannot cite its way into another family's decision authority.

## 13. Runtime status smoke check

Start the deployed/current server entrypoint and inspect:

```text
GET /api/legal-rag/status
```

Expected:

- `platformStatus: all-laws-runnable-private-beta`;
- 57 active profiles;
- 55 substantive profiles;
- 2 governance fallback profiles;
- 21 active catalogues;
- Wave 5L shared router is the effective substantive router;
- no Wave 5M router.

## 14. Source-governance state to preserve

The 11 August source reconciliation materially updates the old 10 August "many exact files missing" state.

Current controls:

- 31 exact official PDFs are mapped to existing Source IDs in the canonical Drive Source Register;
- curated runtime identity hashes remain distinct from exact-file hashes;
- runtime source migration is still review-gated;
- remaining #143 items are principally portal/register/guidance classification plus reviewed runtime migration;
- Maharashtra Shops/OSHWC/IR draft instruments remain draft/non-operative;
- Wave 5J exact sources remain blocked under #139.

No missing exact file may be assigned a fabricated hash, byte length or pagination.

## 15. Release-candidate validation order

After any approved source-manifest/catalogue migration:

1. run exact-source/onboarding governance checks;
2. run every family Wave suite;
3. run shared Legal RAG platform tests;
4. run M7 source lifecycle/readiness/DR tests;
5. run CORS/security-related repository checks;
6. run full release tests;
7. run maintained Chromium release/e2e coverage;
8. inspect `GET /api/legal-rag/status`;
9. verify the exact approved main SHA is the deployed SHA;
10. archive post-deploy smoke evidence.

## 16. Previous integration evidence

The exact pre-merge integration head passed:

- All-Laws RAG Private Beta #107;
- Executive Assessment Tests #784;
- M4 Report Integration #139;
- M7 RAG-Ready Hardening #98;
- GrowWithHR CI #1552.

The 10 August live smoke also passed. These are useful baseline evidence, but the final approved release must rerun the applicable suites after the last approved source/runtime change.

## 17. Release gate

Do not interpret a successful workflow as release certification.

Production release requires named authorised evidence for applicable LEGAL, PRIVACY, RAG, SOURCE-FILE and SECURITY gates plus final RELEASE approval under #142.

Wave 5J remains blocked under #139/#140. Wave 5M is excluded from the current release under closed #141.