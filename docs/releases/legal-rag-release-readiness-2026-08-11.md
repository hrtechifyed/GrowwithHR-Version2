# GrowWithHR Legal RAG release readiness

**Status date:** 11 August 2026  
**Candidate baseline:** v0.20.2 Governed Legal RAG Private Beta  
**Runtime baseline:** 57 callable / 55 substantive / 2 governance fallback / 21 catalogues  
**Production certification:** **NOT YET GRANTED**  
**Programme release gate:** GitHub #142

## 1. Release decision in one sentence

The software implementation is integrated and release-candidate documentation/source reconciliation is being prepared, but production release must not be certified until the applicable authorised LEGAL, PRIVACY, RAG, SOURCE-FILE, SECURITY and RELEASE gates have signed evidence and the final regression/deployment evidence is green.

## 2. Current scope

### In scope

The current substantive private-beta scope runs through Wave 5L:

- POSH;
- Maternity Benefit;
- EPF/EPS/EDLI;
- ESI;
- Appropriate Government source routing;
- Maharashtra Shops and Establishments source readiness;
- Code on Wages source readiness;
- Gratuity source readiness;
- Employee's Compensation source readiness;
- OSHWC source readiness;
- Industrial Relations source/transition readiness;
- Apprentices source/classification readiness;
- Child and Adolescent Labour safeguarding-first source readiness;
- Contract Workforce cross-family readiness; and
- Generic Social Security family/chapter routing.

### Explicitly not activated

- **Wave 5J — Bonded and Forced Labour:** governance/research-only. No assessment/runtime activation until #139 and #140 plus programme gates are closed with authorised evidence.
- **Wave 5M — Multi-country Employment:** excluded from the current release. #141 is closed `not planned`; no country pair, no assessment capture, no runtime catalogue, no provider/browser route and no cross-border data design are part of this release.

## 3. Completed release-candidate evidence

| Area | Current evidence | Release effect |
|---|---|---|
| Runtime integration | Legal RAG stack integrated into `main`; `server-entry.js` delegates shared legal explanation to the Wave 5L router | Software baseline exists |
| Runtime invariant | 57 callable / 55 substantive / 2 governance fallback / 21 active catalogues | Must remain unchanged unless separately approved |
| Previous integration CI | All-Laws RAG, Executive Assessment, M4, M7 and GrowWithHR CI passed on the validated integration head | Software evidence only |
| Live smoke | 10 August smoke evidence passed for deployed surfaces and Legal RAG status | Deployment evidence only |
| Exact-file reconciliation | Canonical Drive Source Register now maps 31 exact official PDFs to existing Source IDs with official-byte SHA-256, byte length and physical page count | SOURCE-FILE evidence awaiting authorised review |
| Duplicate control | Mislabelled Maharashtra Shops Rules duplicate was quarantined because it was byte-identical to the Shops Act | Prevents accidental source substitution |
| Wave 5M scope | #141 closed `not planned` for current release | Removes international-country-pair work from this release |
| Legal status | Active catalogues remain `needs-legal-review` | Correct; no approval inferred |

## 4. Gate matrix

| Gate | Current state | Required evidence before release |
|---|---|---|
| LEGAL | OPEN | Named qualified reviewer decision for each active family: law/source mapping, deterministic boundary, limitations, jurisdiction assumptions, transition, State/UT and cross-family treatment |
| PRIVACY | OPEN | Named reviewer approval of fact contracts, provider minimisation, access, logging, retention/deletion, vendor/provider controls and incident handling |
| RAG | OPEN | Named reviewer approval of catalogue scope, chunks, reason-code retrieval constraints, fingerprints/citations, fallback/provider behaviour and publication controls |
| SOURCE-FILE | OPEN | Review the 31-file reconciliation; resolve/classify remaining portal/register identities; approve any runtime source-manifest/catalogue migration |
| SECURITY | OPEN | Named reviewer approval of secrets, CORS/network boundary, access, logging, retention, dependency/security scanning, incident response and recovery controls |
| RELEASE | OPEN | All applicable upstream gates closed; final regression green; approved main SHA deployed; post-deploy smoke archived; release decision recorded |
| Wave 5J source | OPEN (#139) | Exact 14 May 2026 Ministry SOP and approved/notified 2026-31 operational material acquired/fingerprinted |
| Wave 5J human review | OPEN (#140) | Legal/safeguarding/privacy/security/State-UT decisions recorded |
| Wave 5M | OUT OF SCOPE (#141 closed) | No action for this release |

## 5. Exact next steps for the tool/release team

Perform these steps in order. Do not skip from source upload directly to release certification.

### Step 1 — review the source reconciliation PR

Review draft PR #144 and the canonical Drive `Source Register.xlsx` Exact File Reconciliation sheet.

Required checks:

- 31 exact files map to the intended existing Source IDs;
- SHA-256, byte length and physical page count come from the stored official bytes;
- the quarantined Maharashtra Shops duplicate cannot be selected as the Rules file;
- draft Maharashtra instruments remain draft/non-operative;
- curated source-identity fingerprints are not overwritten by PDF hashes;
- Wave 5J and Wave 5M remain non-runtime.

**Owner needed:** source-governance/RAG reviewer plus qualified legal reviewer for source identity/scope.

### Step 2 — close or narrow the remaining #143 source-control backlog

The exact-file acquisition backlog is no longer the broad 10 August state. The remaining identities are principally portal/register/guidance records such as jurisdiction/notification portals, DGT trade registers, standing-orders authority notifications and Apprenticeship India portal material.

For each remaining identity, explicitly classify it as one of:

- exact file required;
- official portal/register snapshot required;
- guidance/context only;
- research-only/not runtime;
- intentionally out of scope.

Do not invent a PDF hash for a portal page.

### Step 3 — perform the reviewed source-manifest/catalogue migration

Only after Step 1 approval, update the relevant source manifests/catalogue metadata so the runtime identity records can reference the approved exact-file evidence without changing legal meaning.

Rules:

- preserve stable Source IDs unless a reviewed migration explicitly changes them;
- keep `legalReviewStatus: needs-legal-review` until the authorised legal decision exists;
- preserve deterministic reason codes and source scope unless separately approved;
- do not activate Wave 5J or Wave 5M;
- do not turn draft State instruments into operative sources.

### Step 4 — obtain authorised human approvals

Nominate and record actual reviewers/approvers in #142 (and #140 for Wave 5J).

Minimum roles:

- qualified employment/labour legal reviewer(s);
- privacy reviewer;
- RAG/source-governance reviewer;
- security reviewer;
- release owner/approver;
- safeguarding specialist for Wave 5J.

Engineering, product ownership, AI/model review and green CI do not self-grant these roles.

### Step 5 — run the release regression

At minimum:

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

Run the maintained Chromium release/e2e suite required by the repository after the final approved code/data change.

Required invariant after the source migration:

```json
{
  "profileCount": 57,
  "substantiveProfiles": 55,
  "governanceFallbackProfiles": 2,
  "activeCatalogs": 21,
  "wave5JRuntimeActivation": false,
  "wave5MRuntimeActivation": false
}
```

Every retrieval path must continue to report `usedForDecision: false` and `applicabilityAuthority: none`.

### Step 6 — prepare the actual release commit/version only after approvals

Do not bump the production release version merely because the documentation is ready.

After the applicable gates are approved:

1. select the release version;
2. run the repository's version-sync/check procedure;
3. generate/update release notes;
4. identify the exact approved main SHA;
5. attach CI evidence to the release decision;
6. deploy that exact SHA.

### Step 7 — deploy and archive smoke evidence

Verify the approved deployment target against the approved main SHA, then archive post-deploy evidence for:

- application homepage/assessment availability;
- `GET /api/legal-rag/status`;
- expected 57/55/2/21 invariant;
- one permitted substantive family path;
- Wave 5J non-activation;
- Wave 5M non-activation;
- CORS/provider-failure behaviour as applicable;
- no stable report/PDF/email contract regression.

### Step 8 — record formal release approval

Close #142 only when named authorised reviewers have linked evidence for all applicable gates and the release owner records the production decision.

## 6. No-go conditions

Do **not** release if any of the following is true:

- an active catalogue has been silently changed from `needs-legal-review` without authorised evidence;
- a PDF hash has overwritten a curated source-identity fingerprint without reviewed migration;
- a draft Maharashtra instrument is treated as final/operative;
- Wave 5J acquires assessment/runtime/provider handling before #139/#140 are satisfied;
- Wave 5M acquires a country-pair, catalogue, assessment or provider surface in the current release;
- retrieval can affect deterministic applicability/status/reason/source scope;
- a provider can receive prohibited person-level/case/payroll/medical/evidence data;
- final regression is not green on the approved release SHA;
- the deployed SHA differs from the approved SHA;
- #142 lacks named authorised approvals.

## 7. Recommended ownership map

| Work item | Accountable owner to nominate |
|---|---|
| Exact official-file acquisition/reconciliation | Source/legal operations owner |
| Section/law/rule/transition/State-UT review | Qualified labour/employment counsel |
| Assessment/provider data boundary | Privacy reviewer |
| Catalogue/chunk/retrieval/citation governance | RAG/source-governance reviewer |
| API/provider/dependency/incident controls | Security reviewer |
| Wave 5J live-risk handoff | Qualified safeguarding reviewer |
| Final deploy/no-go decision | Release owner |

## 8. Release evidence bundle

The final release decision should point to:

- exact approved main SHA;
- PR(s) carrying the approved source/docs/runtime migration;
- canonical Drive Project Status and Changelog;
- canonical Drive Source Register and Exact File Reconciliation sheet;
- legal/privacy/RAG/security decision records;
- #139/#140 status for Wave 5J;
- #141 closed/not-planned decision for Wave 5M;
- #142 release approval record;
- CI workflow/run identifiers;
- deployment smoke artifact;
- release notes/version record.

## 9. Current release posture

**Engineering posture:** release-candidate preparation can continue.  
**Production posture:** no-go until authorised gate closure.  
**International/Wave 5M:** excluded.  
**Bonded/Forced Labour/Wave 5J:** blocked.  
**All active substantive catalogues:** remain `needs-legal-review` until qualified approval is recorded.