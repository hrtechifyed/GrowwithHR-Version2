# GrowWithHR complete feature coverage inventory

**Inventory version:** 2.1.0  
**Updated:** 11 August 2026  
**Release baseline:** v0.20.3-prototype.1 research-grade prototype  
**Runtime baseline:** current Wave 5L substantive router with Wave 5J/5M governance guards  
**Scope:** assessment/fact contracts, deterministic rules, governed source catalogues, retrieval, explanation, product surfaces and prototype/production boundaries

## 1. Purpose

This inventory records the effective Legal RAG prototype coverage. It is an engineering/governance inventory and does not grant legal approval or certify any law-family result.

The prototype source basis is structured secondary research with controlled provenance. Exact official-file assurance is supplementary and is tracked separately as future production hardening.

## 2. Authority boundary

```text
Assessment input
→ feature-specific/privacy-safe fact mapping
→ deterministic rule
→ fixed decision + permitted source IDs
→ governed retrieval
→ explanation-only provider
→ strict validation
→ prototype presentation
```

Retrieval/provider output must not create facts, determine applicability, alter status/reason/source scope or certify compliance.

## 3. Effective runtime snapshot

| Control | Current state |
|---|---:|
| Callable profiles | 57 |
| Substantive profiles | 55 |
| Governance fallback profiles | 2 |
| Active catalogues | 21 |
| Active catalogue legal-review state | `needs-legal-review` |
| Main shared router | `server-legal-explanation-router-wave5l.js` |
| Wave 5J | Governance/research-only |
| Wave 5M | Out of current release scope |

The effective registry is composed by the cumulative Wave server overlays. The early static profile/onboarding registries should not be read as the current runtime by themselves.

## 4. Coverage status model

| Status | Meaning |
|---|---|
| **Substantive prototype profile** | Feature-specific deterministic rules plus a governed catalogue are wired into the shared Legal RAG runtime. Legal approval remains pending. |
| **Governance fallback** | Callable only through conservative governance-stop behaviour. No substantive family assessment/result is activated. |
| **Operational advisory** | Non-legal/legacy product guidance remains separate from legal applicability authority. |
| **Out of current scope** | Feature is intentionally excluded from the release and must not acquire assessment/runtime/provider activation. |

## 5. Legal RAG family inventory

| Wave/family | Profiles | Catalogue/runtime state | Deliberate boundary |
|---|---:|---|---|
| Wave 1 — POSH | 7 | Substantive | Case narratives/findings/person identities outside provider authority; no compliance certification |
| Wave 2 — Maternity Benefit | 10 | Substantive | Individual entitlement, medical evidence/outcomes and ESI overlap conclusions remain specialist-only |
| Waves 3A–3C — EPF/EPS/EDLI | 12 | Substantive | No contribution arithmetic, individual membership/exemption/certificate determination |
| Waves 4A–4D — ESI | 15 | Substantive | No individual claim/medical/enforcement determination |
| Wave 5A — Appropriate Government | 1 | Substantive source/jurisdiction readiness | Does not select Central vs State/UT Government, forum or applicable law |
| Wave 5B — Maharashtra Shops | 1 | Substantive source readiness | Draft amendments remain draft until separately established otherwise |
| Wave 5C — Code on Wages | 1 | Substantive source readiness | No wage-rate/category/zone selection, payroll arithmetic or entitlement |
| Wave 5D — Gratuity | 1 | Substantive chapter readiness | No eligibility, continuous-service, wage, amount, claim or remedy determination |
| Wave 5E — Employee's Compensation | 1 | Substantive chapter readiness | No causation, diagnosis, disablement, liability, compensation or remedy determination |
| Wave 5F — OSHWC | 1 | Substantive Central/Maharashtra readiness | Draft State material remains draft/non-operative; no applicability/licensing/enforcement decision |
| Wave 5G — Industrial Relations | 1 | Substantive transition/standing-orders readiness | Draft State material remains draft; no dispute/strike/retrenchment/closure/remedy determination |
| Wave 5H — Apprentices | 1 | Substantive classification/source readiness | No individual eligibility, contract, stipend, certification or enforcement determination |
| Wave 5I — Child and Adolescent Labour | 1 | Substantive safeguarding-first source readiness | No identifying case data, age/work/offence/rescue/rehabilitation determination; live safeguarding is human-only |
| Wave 5J — Bonded and Forced Labour | 1 | **Governance fallback** | No substantive assessment/runtime/provider activation; live safeguarding is human-only |
| Wave 5K — Contract Workforce | 1 | Substantive cross-family readiness | OSHWC/EPF/ESI results remain separate and non-substitutable |
| Wave 5L — Generic Social Security | 1 | Substantive family/chapter routing | Dedicated EPF/ESI/Gratuity/Maternity/Employee Compensation results remain separate; BOCW/Chapter IX specialist-only |
| Wave 5M — Multi-country Employment | 1 | **Governance fallback / out of scope** | #141 closed `not planned`; no international assessment/catalogue/provider/data-transfer path in current release |

Total: **57 profiles = 55 substantive + 2 governance fallbacks**.

## 6. Current source catalogue inventory

The effective runtime has **21 active catalogues**. Catalogues are retrieval/explanation assets rather than legal applicability authority.

Key control rules:

- source IDs must resolve to governed catalogue records;
- retrieval is constrained by the deterministic decision's source scope;
- law-family results cannot substitute for one another;
- active catalogues remain `needs-legal-review`;
- source provenance and authority classification must be represented truthfully;
- draft/research sources retain their status.

## 7. Prototype source standard

The prototype accepts **structured secondary research with controlled provenance** as its source basis.

Required distinctions:

1. **Runtime source identity** — stable identity used by validated catalogue contracts.
2. **Secondary-research provenance** — accepted prototype research basis.
3. **Exact-file evidence** — supplementary file-level assurance where available.
4. **Portal/register identity** — controlled web/register source where no stable single PDF exists.
5. **Draft/guidance/research-only status** — retained explicitly and never upgraded by inference.

Secondary-research provenance must not be represented as official or counsel-approved provenance.

## 8. Supplementary exact-file evidence

The canonical Drive Source Register contains an `Exact File Reconciliation` sheet.

Current supplementary evidence:

| Control | State |
|---|---:|
| Acquired files mapped to existing Source IDs | 31 |
| File-byte SHA-256 recorded | Yes |
| Byte length recorded | Yes |
| Physical PDF page count recorded | Yes |
| Runtime source-identity hashes overwritten | No |
| Runtime migration applied | No |
| Duplicate quarantine items | 1 |

Repository record:

```text
data/legal-source-governance/exact-source-file-reconciliation-2026-08-11.v1.json
```

For `v0.20.3-prototype.1`, this evidence is **supplementary and non-blocking**. A runtime migration to exact-file fingerprints is not required for the prototype. #143 now tracks future production hardening.

## 9. Source exceptions and safeguards

### Draft/finality controls

Material classified as draft remains draft/non-operative in the prototype unless its status is deliberately updated with evidence. Retrieval must not upgrade draft/research material into operative law.

### Wave 5J

Wave 5J remains non-substantive. Its source/legal/safeguarding work under #139/#140 is a future activation programme and does not block this prototype because the feature is not activated.

Live coercion, trafficking, confinement, violence, retaliation, rescue or comparable case content remains outside normal RAG/provider handling.

### Wave 5M

No two-country source pack is required because international/multi-country employment is excluded from the current release.

## 10. Assessment/fact boundaries

GrowWithHR uses feature-specific fact contracts rather than sending a broad company object to the provider.

Allowed facts vary by feature and are designed to be organisation-level where possible. Missing required facts remain missing.

Commonly prohibited provider content includes:

- names/person identities;
- payroll/contribution record bodies;
- medical/case narratives;
- complaint/dispute bodies;
- notices/orders;
- evidence bodies;
- live safeguarding case content;
- international mobility/visa/tax data for the excluded Wave 5M flow.

The existing broad company assessment fields remain useful for general advisory/product context but must not be silently reinterpreted as law-specific establishment/worker-category facts.

## 11. Deterministic-rule coverage

The effective runtime has feature-specific deterministic specifications for all 55 substantive profiles.

Typical bounded outcomes are:

- `specialist-review` for complete/reported-gap source/readiness controls;
- `more-information-needed` where required facts are absent.

Specific permitted statuses/reason codes remain defined by the relevant rule catalogue. The model/provider cannot create additional outcome authority.

## 12. Retrieval/explanation coverage

All substantive profiles use the shared deterministic-first RAG architecture.

Required retrieval invariants:

```text
usedForDecision: false
applicabilityAuthority: none
```

The explanation layer must preserve the deterministic decision fingerprint/status/reason and cite only chunks in the governed retrieval trace. Provider failure or invalid output fails closed.

## 13. Product-surface coverage

The legal review flows are explicit-submit and in-memory only. They do not automatically persist panel values/results into browser storage or change stable report/PDF/email contracts.

Wave 5J and Wave 5M have no substantive browser/provider surface.

The deployed product remains the root HTML/CSS/JavaScript application. The React/TypeScript `apps/web/src` tree is not the deployed production build.

## 14. Founder compliance-engine objective

The underlying architecture supports a founder-oriented product goal:

- identify compliance families that need attention now from supplied organisation facts;
- explain the deterministic result and research basis;
- identify missing information;
- recommend a controlled next action;
- reassess when employee count, locations, worker categories or operating model changes;
- surface future compliance **review triggers** as the company scales.

The current runtime provides the family-specific building blocks. A consolidated founder-facing "what applies now / what comes next" forecast remains product work after this release and must preserve law-family separation and the prototype no-certification boundary.

## 15. State/UT knowledge records

The broader central/State/UT knowledge data remains useful as product/source context, but schema-valid knowledge records are not automatically governed deterministic rules or approved legal source packs.

Any new State/UT substantive feature requires explicit jurisdiction scope, source classification, assessment fact contract, deterministic rule boundary and appropriate safeguards before activation.

## 16. Validation coverage

The repository maintains dedicated suites for:

- POSH/Maternity baseline;
- EPF Waves 3A–3C;
- ESI Waves 4A–4D;
- Waves 5A–5I;
- Wave 5J research-only guard;
- Wave 5K;
- Wave 5L;
- Wave 5M out-of-scope guard;
- shared catalogue loader/retrieval/explanation contracts;
- browser/privacy boundaries;
- M7 source lifecycle/operational readiness/DR;
- repository release/e2e checks.

See `docs/testing/all-laws-rag-validation.md`.

## 17. Prototype release gaps

The remaining work before `v0.20.3-prototype.1` is engineering/release control rather than production legal certification:

1. align version metadata and prototype release notes;
2. ensure release-facing wording represents the secondary-research source basis truthfully;
3. keep `needs-legal-review` unchanged;
4. keep Wave 5J and Wave 5M non-substantive;
5. run the complete regression on the exact candidate SHA;
6. publish the exact validated SHA as a GitHub prerelease.

The following are **future production hardening**, not prototype blockers:

- formal qualified legal approval/status promotion;
- exact official-source assurance and portal/register classification under #143;
- any reviewed migration to exact-file fingerprints;
- formal Privacy/RAG/Source/Security certification;
- production release certification under #142;
- Wave 5J activation work;
- future international Wave 5M work.

## 18. Current conclusion

For the current non-international scope, the Legal RAG software architecture is substantively implemented through Wave 5L and is suitable for a clearly labelled research-grade prototype release after final engineering validation.

The next product phase should focus on the consolidated founder experience — **what needs attention now, why, what to do next, and what compliance review triggers appear as the organisation scales** — while the exact-official-source and formal legal-certification programme remains the documented path from prototype to production-grade compliance software.