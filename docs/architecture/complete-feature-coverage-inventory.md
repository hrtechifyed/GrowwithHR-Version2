# GrowWithHR complete feature coverage inventory

**Inventory version:** 2.0.0  
**Updated:** 11 August 2026  
**Runtime baseline:** current main-integrated Wave 5L substantive router with Wave 5J/5M governance guards  
**Scope:** assessment/fact contracts, deterministic rules, governed source catalogues, retrieval, explanation, product surfaces and release boundaries

## 1. Purpose

This inventory records the current effective private-beta Legal RAG coverage. It replaces the earlier 3 August snapshot that described the platform as essentially POSH-only.

It remains an engineering/governance inventory. It does not grant legal approval or certify any law-family result.

## 2. Authority boundary

```text
Assessment input
→ feature-specific/privacy-safe fact mapping
→ deterministic rule
→ fixed decision + permitted source IDs
→ governed retrieval
→ explanation-only provider
→ strict validation
→ private-beta presentation
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
| **Substantive private-beta profile** | Feature-specific deterministic rules plus a governed catalogue are wired into the shared Legal RAG runtime. Legal approval may still be pending. |
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
| Wave 5B — Maharashtra Shops | 1 | Substantive source readiness | Current 2025 amendment remains draft-only until final instrument is acquired/approved |
| Wave 5C — Code on Wages | 1 | Substantive source readiness | No wage-rate/category/zone selection, payroll arithmetic or entitlement |
| Wave 5D — Gratuity | 1 | Substantive Chapter V readiness | No eligibility, continuous-service, wage, amount, claim or remedy determination |
| Wave 5E — Employee's Compensation | 1 | Substantive Chapter VII readiness | No causation, diagnosis, disablement, liability, compensation or remedy determination |
| Wave 5F — OSHWC | 1 | Substantive Central/Maharashtra readiness | Maharashtra 2026 State rules remain draft/non-operative; no applicability/licensing/enforcement decision |
| Wave 5G — Industrial Relations | 1 | Substantive transition/standing-orders readiness | Maharashtra 2026 State rules remain draft; no dispute/strike/retrenchment/closure/remedy determination |
| Wave 5H — Apprentices | 1 | Substantive classification/source readiness | No individual eligibility, contract, stipend, certification or enforcement determination |
| Wave 5I — Child and Adolescent Labour | 1 | Substantive safeguarding-first source readiness | No identifying case data, age/work/offence/rescue/rehabilitation determination; live safeguarding is human-only |
| Wave 5J — Bonded and Forced Labour | 1 | **Governance fallback** | No assessment/runtime activation while #139/#140 are open |
| Wave 5K — Contract Workforce | 1 | Substantive cross-family readiness | OSHWC/EPF/ESI results remain separate and non-substitutable |
| Wave 5L — Generic Social Security | 1 | Substantive family/chapter routing | Dedicated EPF/ESI/Gratuity/Maternity/Employee Compensation results remain separate; BOCW/Chapter IX specialist-only |
| Wave 5M — Multi-country Employment | 1 | **Governance fallback / out of scope** | #141 closed `not planned`; no international assessment/catalogue/provider/data-transfer path in current release |

Total: **57 profiles = 55 substantive + 2 governance fallbacks**.

## 6. Current source catalogue inventory

The effective runtime has **21 active catalogues**. Catalogues are loaded by the effective cumulative registry and remain retrieval/explanation assets rather than legal applicability authority.

Key control rules:

- source IDs must resolve to governed catalogue records;
- retrieval is constrained by the deterministic decision's source scope;
- law-family results cannot substitute for one another;
- active catalogues remain `needs-legal-review` until qualified review evidence exists;
- draft/research sources retain their status even if exact bytes are controlled.

## 7. Exact official-file coverage

The canonical Drive Source Register was upgraded on 11 August 2026 with an `Exact File Reconciliation` sheet.

Current reconciliation:

| Control | State |
|---|---:|
| Exact PDFs mapped to existing Source IDs | 31 |
| Official-byte SHA-256 recorded | Yes |
| Byte length recorded | Yes |
| Physical PDF page count recorded | Yes |
| Runtime source-identity hashes overwritten | No |
| Runtime migration applied | No |
| Duplicate quarantine items | 1 |

Repository record:

```text
data/legal-source-governance/exact-source-file-reconciliation-2026-08-11.v1.json
```

The remaining #143 work is primarily classification/closure of portal/register/guidance identities and the reviewed runtime manifest/catalogue migration, rather than the broad 10 August exact-file backlog.

## 8. Remaining source exceptions

### Maharashtra finality

Keep the following as draft/non-operative until exact final instruments are published, acquired and approved:

- Maharashtra Shops 2025 draft amendment;
- Maharashtra OSHWC Labour 2026 draft rules;
- Maharashtra OSHWC Factories/Other Ports 2026 draft rules;
- Maharashtra Industrial Relations 2026 draft rules.

### Wave 5J exact-source blockers

Still missing/blocked under #139:

1. exact Ministry SOP referenced as issued 14 May 2026;
2. exact approved/notified 2026–31 Labour Welfare/bonded-labour rehabilitation operational material.

No source-identity/secondary-text substitute may be treated as these exact files.

### Wave 5M

No two-country source pack is required because international/multi-country employment is excluded from the current release.

## 9. Assessment/fact boundaries

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

## 10. Deterministic-rule coverage

The effective runtime has feature-specific deterministic specifications for all 55 substantive profiles.

Typical bounded outcomes are:

- `specialist-review` for complete/reported-gap source/readiness controls;
- `more-information-needed` where required facts are absent.

Specific permitted statuses/reason codes remain defined by the relevant rule catalogue. The model/provider cannot create additional outcome authority.

## 11. Retrieval/explanation coverage

All substantive profiles use the shared deterministic-first RAG architecture.

Required retrieval invariants:

```text
usedForDecision: false
applicabilityAuthority: none
```

The explanation layer must preserve the deterministic decision fingerprint/status/reason and cite only chunks in the governed retrieval trace.

Provider failure or invalid output fails closed.

## 12. Product-surface coverage

The private-beta legal review flows are explicit-submit and in-memory only. They do not automatically persist panel values/results into browser storage or change stable report/PDF/email contracts.

Wave 5J and Wave 5M have no substantive browser/provider surface.

The deployed product remains the root HTML/CSS/JavaScript application. The React/TypeScript `apps/web/src` tree is not the deployed production build.

## 13. Operational/non-legal features

The repository also contains older HR module readiness/advisory checks and M2 operational recommendations. Those remain separate from governed legal applicability.

They must continue to use an explicit operational-advisory authority label and must not borrow legal statuses such as `applicable` unless a separately governed legal rule exists.

## 14. State/UT knowledge records

The broader central/State/UT knowledge data remains useful as product/source context, but schema-valid knowledge records are not automatically governed deterministic rules or approved RAG source packs.

Any new State/UT substantive feature requires:

- explicit supported-jurisdiction scope;
- exact source/control model;
- section mapping;
- assessment fact contract;
- deterministic rule boundary;
- State/UT legal review;
- RAG/source/security/release approval.

## 15. Special safeguards

### Child and Adolescent Labour

Wave 5I is safeguarding-first. Identifying/live case handling stays human-only.

### Bonded and Forced Labour

Wave 5J must not become an automated classifier for trafficking, bonded labour, forced labour, criminal liability, rescue/release or rehabilitation. It remains research/governance-only pending #139/#140.

### Multi-country Employment

Wave 5M is not a partially implemented international engine. It is a deliberate current-release exclusion. If international employment is later introduced, #141 must be reopened and a new country-pair/legal/privacy/security source programme started.

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

## 17. Release gaps

The remaining gap is no longer general architecture implementation. It is controlled certification work:

1. review/approve exact-file reconciliation and complete #143 classifications;
2. perform a separately reviewed source-manifest/catalogue migration where required;
3. obtain named LEGAL, PRIVACY, RAG, SOURCE-FILE and SECURITY approvals under #142;
4. keep Wave 5J blocked until #139/#140 close;
5. run final regression on the approved release SHA;
6. deploy the approved SHA and archive smoke evidence;
7. record RELEASE approval under #142.

## 18. Current conclusion

For the current non-international scope, the Legal RAG software architecture is substantively implemented through Wave 5L. The next programme phase is source/runtime reconciliation review, authorised governance approval and production release certification—not another broad "implement RAG for all laws" engineering wave.