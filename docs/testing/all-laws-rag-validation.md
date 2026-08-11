# Validate RAG across all registered legal profiles

**Updated:** 11 August 2026  
**Release baseline:** v0.20.3-prototype.1 Governed Compliance & Legal RAG Prototype  
**Purpose:** prove the effective 57-profile runtime remains deterministic-first, source-scoped and privacy-bounded; verify the supplementary exact-file reconciliation control; prove Wave 5J remains non-runtime and Wave 5M remains excluded; and produce engineering evidence for the research-grade prototype release.

## 1. Validation is engineering evidence

Passing these tests demonstrates software/runtime contract behaviour. It does **not** grant legal approval or convert secondary research into counsel-approved/official provenance.

For the prototype:

- structured secondary research with controlled provenance is an accepted source basis;
- active substantive catalogues remain `needs-legal-review`;
- no release output may claim legal certification or proof of compliance;
- formal production Legal/Privacy/RAG/Source/Security/Release certification remains future work under #142/#143.

A clearly labelled prototype/prerelease may be published when the exact candidate SHA is green and the prototype boundaries remain intact.

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

Wave 5M is not waiting for a country pair in this release. #141 is closed `not planned`; the scope guard must preserve zero substantive Wave 5M runtime surface.

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
npm run test:release:e2e
```

Run the maintained Chromium release/e2e suite on the exact candidate SHA.

## 4. Source-reconciliation validation

The all-laws onboarding regression validates the repository audit bridge:

```text
data/legal-source-governance/exact-source-file-reconciliation-2026-08-11.v1.json
```

Required reconciliation assertions:

- `matchedExactFiles` = 31;
- the exact Source ID list contains 31 unique IDs;
- `runtimeMigrationApplied` remains `false`;
- `legalReviewStatus` remains `needs-legal-review`;
- Wave 5J remains non-runtime and records its research/source blockers;
- Wave 5M remains out-of-scope with no selected country pair/runtime activation;
- duplicate quarantine state remains recorded;
- rules prohibit silent replacement of runtime source-identity fingerprints by PDF hashes.

For the prototype, this validates **supplementary audit evidence**, not a mandatory official-source migration. The accepted release basis remains structured secondary research with controlled provenance.

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

The test must fail if a Wave 5J substantive assessment fact contract, deterministic classifier, runtime source-chunk catalogue, browser panel or provider/router overlay appears.

#139/#140 remain a future activation/hardening programme. They do not block this prototype because Wave 5J remains non-substantive.

Live coercion/trafficking/confinement/violence/retaliation/rescue case content must not enter the normal RAG provider path.

## 8. Wave 5K — Contract Workforce non-substitution

Wave 5K remains a bounded OSHWC Chapter XI Part I/cross-family readiness feature.

Validation must prove:

- the OSHWC/Contract Workforce result cannot decide EPF or ESI coverage;
- EPF/ESI results cannot decide OSHWC applicability;
- retrieval/provider output cannot merge the three family decisions;
- draft Maharashtra OSHWC material remains non-operative.

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
- every returned chunk resolves to a governed source identity;
- the explanation cites only retrieved chunks;
- decision/retrieval fingerprints are preserved;
- source provenance/authority classification is not upgraded by retrieval;
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

The internal status string may retain `private-beta` for compatibility; the GitHub release itself is labelled `v0.20.3-prototype.1` research prototype/prerelease.

## 14. Source-governance state to preserve

Current controls:

- structured secondary research with controlled provenance is accepted for the prototype;
- 31 acquired files are additionally mapped to existing Source IDs as supplementary evidence;
- runtime identity hashes remain distinct from exact-file hashes;
- runtime source migration is not required for the prototype;
- #143 is a future production-hardening backlog;
- draft instruments remain draft/non-operative;
- Wave 5J remains non-runtime.

No source may be assigned fabricated official authority, hash, byte length or pagination.

## 15. Prototype release validation order

For the final candidate:

1. run version consistency checks;
2. run source/onboarding governance checks;
3. run every family Wave suite;
4. run shared Legal RAG platform tests;
5. run M7 source lifecycle/readiness/DR tests;
6. run CORS/security-related repository checks;
7. run full release tests;
8. run maintained Chromium release/e2e coverage;
9. inspect `GET /api/legal-rag/status`;
10. confirm source/release wording states research prototype and `needs-legal-review`;
11. tag the exact validated SHA only.

If deployed, verify the deployed SHA matches the validated/tagged SHA and archive smoke evidence.

## 16. Previous integration evidence

Previous integration and live-smoke runs provide useful baseline evidence, but the prototype candidate must pass the applicable suites after the final release/document/version changes.

## 17. Prototype release gate

A successful workflow is necessary engineering evidence but does not constitute legal approval.

For `v0.20.3-prototype.1`, publish only when:

- the version/tag/title clearly identify a prototype/prerelease;
- the exact candidate SHA is green;
- all active catalogues remain `needs-legal-review`;
- structured secondary-research provenance is represented truthfully;
- RAG remains explanation-only and source-scoped;
- privacy/fail-closed boundaries pass;
- Wave 5J and Wave 5M remain non-substantive.

Future production-grade certification remains under #142 and future exact official-source hardening under #143. Those issues do **not** block the clearly labelled research prototype.