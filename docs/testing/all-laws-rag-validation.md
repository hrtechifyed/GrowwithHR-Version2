# Validate RAG across all registered legal profiles

**Release:** v0.20.2 Governed Legal RAG Private Beta  
**Main integration:** stack through Wave 5M integrated on 10 August 2026  
**Purpose:** prove that every profile is runnable, retrieval/explanation remain outside deterministic authority, dedicated legal families cannot substitute for one another, and governance-only families remain blocked from accidental product capture.

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
node tests/multi-country-employment-wave5m-scope-guard-checks.mjs
npm run test:complete-legal-rag-platform
```

## Required platform invariant

```json
{
  "profileCount": 57,
  "substantiveProfiles": 55,
  "governanceFallbackProfiles": 2,
  "activeCatalogs": 21,
  "blockedRuntimeProfiles": 0
}
```

The two governance fallbacks must remain:

- `feature.legal.bonded-forced-labour` — Wave 5J research/safeguarding stop;
- `feature.legal.multi-country-employment` — Wave 5M jurisdiction/cross-border-data stop.

Every substantive decision must exist before retrieval. Governed retrieval must report `usedForDecision: false` and `applicabilityAuthority: none`. Explanation output must preserve the deterministic decision fingerprint, status, reason code and permitted citation scope.

## Earlier-wave regression coverage

The maintained suites protect the deterministic/privacy boundaries for POSH, Maternity Benefit, EPF/EPS/EDLI Waves 3A–3C, ESI Waves 4A–4D, Appropriate Government Wave 5A, Maharashtra Shops Wave 5B, Code on Wages Wave 5C, Gratuity Wave 5D, Employee's Compensation Wave 5E, OSHWC Wave 5F, Industrial Relations Wave 5G, Apprentices Wave 5H, Child and Adolescent Labour Wave 5I, Contract Workforce Wave 5K and Generic Social Security Wave 5L.

Complete and reported-gap substantive scenarios remain `specialist-review`; missing required facts return `more-information-needed`.

## Wave 5J — Bonded and Forced Labour research guard

`tests/bonded-forced-labour-wave5j-research-governance-checks.mjs` proves that `feature.legal.bonded-forced-labour` remains on governance fallback while specialist legal/safeguarding/source blockers are open.

The test must fail if a Bonded/Forced Labour assessment contract, runtime source-chunk catalogue, browser panel, substantive server rule or router overlay appears prematurely.

Current hard blockers remain external to the product runtime, including the exact Ministry SOP referenced by NHRC as issued on 14 May 2026, the exact approved/notified 2026–31 rehabilitation/welfare operational plan, qualified cross-framework mapping, human-only safeguarding, privacy/security and State/UT controls.

## Wave 5K — Contract Workforce non-substitution

Wave 5K remains the bounded OSHWC Chapter XI Part I cross-family layer. The acceptance test proves that OSHWC, EPF and ESI contractor outcomes remain separate and that one family cannot supply another family's applicability or substantive result.

Maharashtra OSHWC State rules remain draft-only until exact final instruments are separately controlled and approved.

## Wave 5L — Generic Social Security routing

Wave 5L evaluates complete, reported-gap and missing-information scenarios for `feature.legal.social-security`.

The suite proves that:

- only the declared family route, four core-source statuses, First Schedule/chapter routing controls, dedicated-family handoffs, BOCW/Chapter IX specialist handoffs, cross-family reconciliation, State/UT variation, specialist escalation and controlled references are mapped;
- the deterministic decision exists before retrieval;
- complete/reported-gap results remain `specialist-review`;
- missing required facts produce `more-information-needed`;
- retrieval remains source-scoped and post-decision;
- explanations preserve status/reason/fingerprint;
- no rule/retrieval/provider output decides chapter applicability or scheme coverage;
- the generic route cannot override, combine or infer a dedicated family result; and
- BOCW Chapter VIII and unorganised/gig/platform-worker Chapter IX remain specialist-only.

The governed Wave 5L catalogue contains four exact controlled files and twelve reason-code-scoped chunks:

1. `social-security-code-2020`;
2. `social-security-central-rules-2026`;
3. `social-security-code-commencement-so-5319e-2025`;
4. `social-security-code-corrigendum-so-5936e-2025`.

## Wave 5M — Multi-country Employment out-of-scope guard

`tests/multi-country-employment-wave5m-scope-guard-checks.mjs` proves that `feature.legal.multi-country-employment` remains governance-only until exactly one country pair and operating model are selected and specialist jurisdictional plus cross-border-data approvals exist.

The Wave 5M guard must fail if any of the following appears prematurely:

- assessment fact contract or person-level mobility intake;
- substantive deterministic rule;
- governed runtime source catalogue/chunks;
- browser panel or provider route;
- immigration, tax-residence, permanent-establishment, payroll-withholding, social-security-coverage, employment-law-applicability or cross-border-transfer determination.

Wave 5M must leave the runtime invariant at **57 callable / 55 substantive / 2 governance fallback / 21 catalogues**.

## Browser/privacy checks

Every substantive legal-review browser panel must:

- make no automatic explanation request;
- submit only after explicit user action;
- emit only the family-specific allow-list of organisation-level controls and controlled reference identifiers;
- write zero panel input/result data to local/session storage; and
- remain outside stable report, PDF and email contracts.

Wave 5J and Wave 5M have no browser/provider surface.

The full Chromium suite protects against prohibited identity, payroll/contribution, medical/case, complaint/dispute, notices/orders and evidence-body transmission defined by each family contract.

## Runtime status check

Start the main-integrated server entrypoint and inspect:

```text
GET /api/legal-rag/status
```

Expected result:

- `platformStatus: all-laws-runnable-private-beta`;
- 57 active profiles;
- zero blocked runtime profiles;
- `substantiveProfileCount: 55`;
- `governanceFallbackProfileCount: 2`;
- 21 active catalogues;
- Wave 5L shared-router version remains the substantive router because Wave 5M intentionally has no router.

## Main-integration validation

Before merging the integrated stack into `main`, the exact integration head passed:

- All-Laws RAG Private Beta #107;
- Executive Assessment Tests #784;
- M4 Report Integration #139;
- M7 RAG-Ready Hardening #98; and
- GrowWithHR CI #1552.

This proves the stacked legal-RAG implementation and the actual `main` integration diff passed the required software gates. It does not convert implementation evidence into qualified legal/privacy/source/security/release approval.

## Source-governance recheck

The active Drive Source Register was reconciled through Wave 5M on 10 August 2026. Current official re-checks preserve these open source states:

- Maharashtra Shops 2025 amendment: draft-only; no exact final instrument identified;
- Maharashtra OSHWC Labour 2026 rules: draft-only;
- Maharashtra OSHWC Factories/Other Ports 2026 rules: draft-only;
- Maharashtra Industrial Relations 2026 rules: draft-only;
- Bonded Labour Ministry SOP dated 14 May 2026: existence/date confirmed through NHRC material, exact Ministry-hosted file not controlled;
- Bonded Labour 2026–31 rehabilitation/welfare operational plan: exact approved/notified plan not controlled.

No missing exact file may be assigned a fabricated hash, byte length or pagination.

## Approval boundary

Green deterministic, retrieval, browser, integration and hardening tests are software evidence only. They do **not** grant legal, privacy, safeguarding, RAG, exact-source-file, State/UT, section-mapping, assessment-fact, deterministic-rule, security, cross-border-data or release approval.

All active substantive catalogues remain `needs-legal-review` until qualified approvals are recorded.
