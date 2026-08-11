# GrowWithHR prototype release readiness

**Status date:** 11 August 2026  
**Candidate baseline:** v0.20.3-prototype.1 Governed Compliance & Legal RAG Prototype  
**Runtime baseline:** 57 callable / 55 substantive / 2 governance fallback / 21 catalogues  
**Release classification:** **RESEARCH-GRADE PROTOTYPE / PRERELEASE**  
**Production legal certification:** **NOT CLAIMED**

## 1. Release decision in one sentence

GrowWithHR may be released as a clearly labelled research-grade prototype once the exact candidate SHA passes the maintained engineering regression and preserves the prototype research, privacy, safeguarding and no-certification boundaries in this document.

The future production-grade LEGAL / PRIVACY / RAG / SOURCE-FILE / SECURITY / RELEASE certification programme remains tracked under GitHub #142 and does **not** block this prototype release.

## 2. Prototype research standard

For this prototype release, the accepted legal/source basis is:

**structured secondary research + controlled provenance + deterministic rules + governed retrieval + explicit limitations**.

Required controls:

- secondary research may be used as the source basis for the prototype;
- secondary-research provenance must not be represented as official or counsel-approved provenance;
- exact official-file verification is supplementary assurance, not a prototype release prerequisite;
- exact-file evidence already collected may remain recorded without being migrated into runtime fingerprints;
- all active catalogues remain `needs-legal-review`;
- draft/research/guidance/portal classifications remain explicit;
- no output may claim legal opinion, legal certification or proof of compliance;
- RAG/provider output remains post-decision and explanation-only;
- the deterministic engine remains the product decision authority within the bounded prototype contract.

## 3. Current scope

### In scope

The substantive prototype scope runs through Wave 5L:

- POSH;
- Maternity Benefit;
- EPF/EPS/EDLI;
- ESI;
- Appropriate Government source/jurisdiction readiness;
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

- **Wave 5J — Bonded and Forced Labour:** governance/research-only. No substantive assessment/runtime/provider activation. Live safeguarding concerns remain human-only.
- **Wave 5M — Multi-country Employment:** excluded from the current release. #141 is closed `not planned`; no country pair, assessment capture, runtime catalogue, provider/browser route or cross-border data design is part of this release.

## 4. Current prototype evidence

| Area | Current evidence | Prototype release effect |
|---|---|---|
| Runtime integration | Legal RAG stack integrated into `main`; shared legal explanation delegates to the Wave 5L router | Ready for candidate validation |
| Runtime invariant | 57 callable / 55 substantive / 2 governance fallback / 21 active catalogues | Must remain unchanged unless intentionally versioned |
| Legal status | Active catalogues remain `needs-legal-review` | Required prototype limitation |
| Research provenance | Governed source identities and source-controlled research records | Accepted prototype source basis |
| Exact-file reconciliation | 31 acquired files mapped to existing Source IDs with byte-level metadata | Supplementary assurance; non-blocking |
| Runtime exact-file migration | Not applied | Acceptable for prototype; future production hardening |
| Duplicate control | Mislabelled Maharashtra Shops Rules duplicate quarantined | Prevents accidental source substitution |
| Wave 5M scope | #141 closed `not planned` | No international work required for this release |
| Production hardening | #142 and #143 remain open | Explicitly non-blocking for prototype/prerelease |

## 5. Prototype release gate

| Gate | Prototype requirement | Current disposition |
|---|---|---|
| RELEASE LABEL | Version/tag/release title clearly say prototype/prerelease | Required |
| SOURCE PROVENANCE | Secondary-research basis represented truthfully; no official/counsel-approved overclaim | Required |
| LEGAL STATUS | All active catalogues remain `needs-legal-review`; no certification claim | Required |
| RAG AUTHORITY | Retrieval/provider remain post-decision, `usedForDecision: false`, `applicabilityAuthority: none` | Required |
| PRIVACY | Existing allow-list/minimisation/prohibited-data boundaries remain green | Required |
| SECURITY/RELIABILITY | Existing CORS/provider/secrets/fail-closed and maintained release checks remain green | Required |
| WAVE 5J | Non-runtime; human safeguarding boundary retained | Required |
| WAVE 5M | Out of scope/non-runtime | Required |
| ENGINEERING REGRESSION | Complete maintained release suite green on exact candidate SHA | Required |
| PRODUCTION CERTIFICATION | Formal #142/#143 closure | **Not required for prototype** |

## 6. Exact next steps to publish v0.20.3-prototype.1

### Step 1 — freeze prototype scope

Do not add new law families, international employment or Wave 5J case handling to this release.

### Step 2 — version the candidate

Use:

```text
Version: 0.20.3-prototype.1
Tag: v0.20.3-prototype.1
Release title: GrowWithHR v0.20.3-prototype.1 — Governed Compliance & Legal RAG Prototype
GitHub release type: Pre-release
```

Run the repository version synchronization/check procedure and ensure visible version references are aligned.

### Step 3 — verify source/research wording

Confirm release-facing docs state:

- secondary research is accepted for the prototype;
- exact official-file assurance is supplementary/future hardening;
- `needs-legal-review` remains unchanged;
- no legal certification is claimed.

#142 and #143 may remain open because they now describe future production hardening.

### Step 4 — run the release regression

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
npm run test:release:e2e
```

Required runtime invariant:

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

Every retrieval path must continue to report:

```text
usedForDecision: false
applicabilityAuthority: none
```

### Step 5 — prototype owner release review

Before tagging, the prototype release owner should confirm:

- the release is visibly labelled prototype/prerelease;
- source claims match the secondary-research standard;
- all active catalogues remain `needs-legal-review`;
- no user-facing copy promises legal certification;
- Wave 5J and Wave 5M boundaries are intact;
- the exact candidate SHA has green engineering validation.

This is a product/release decision for a prototype; it is **not** a substitute for future production legal certification.

### Step 6 — tag and publish

Tag the exact validated candidate SHA:

```text
v0.20.3-prototype.1
```

Publish the GitHub release as **Pre-release**, not Latest/production legal certification.

### Step 7 — optional deployment smoke

If the prototype is deployed, archive smoke evidence for:

- homepage/assessment availability;
- `GET /api/legal-rag/status`;
- expected 57/55/2/21 invariant;
- at least one permitted substantive family path;
- Wave 5J non-activation;
- Wave 5M non-activation;
- provider failure/fail-closed behaviour where applicable;
- no report/PDF/email regression.

## 7. Prototype no-go conditions

Do **not** publish the prototype release if any of the following is true:

- the release is presented as production legal certification rather than a prototype;
- an active catalogue has been changed from `needs-legal-review` to an approval state without actual approval evidence;
- secondary-research provenance is misrepresented as official/counsel-approved provenance;
- a draft instrument is represented as final/operative;
- Wave 5J gains substantive assessment/runtime/provider handling;
- Wave 5M gains a country-pair, catalogue, assessment or provider surface;
- retrieval can affect deterministic applicability/status/reason/source scope;
- a provider can receive prohibited person-level/case/payroll/medical/evidence data;
- the final engineering regression is not green on the tagged SHA;
- the deployed SHA, if deployed, differs from the validated/tagged SHA.

## 8. Future production-hardening programme

The following are explicitly **after-prototype** work and do not block `v0.20.3-prototype.1`:

- formal qualified legal review and status promotion where justified;
- official-source/portal/register classification and exact-file assurance under #143;
- any reviewed runtime migration from curated/secondary-research identities to exact-file fingerprints;
- formal Privacy, RAG/Source and Security approval records;
- production certification/release decision under #142;
- any Wave 5J activation programme under #139/#140;
- any future international Wave 5M programme.

## 9. Current release posture

**Prototype engineering posture:** ready for version cut and final regression.  
**Prototype source basis:** structured secondary research with controlled provenance.  
**Exact-file assurance:** supplementary, non-blocking.  
**Production certification:** deliberately not claimed.  
**International/Wave 5M:** excluded.  
**Bonded/Forced Labour/Wave 5J:** governance/research-only.  
**All active substantive catalogues:** `needs-legal-review`.