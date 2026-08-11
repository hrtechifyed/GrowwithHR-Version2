# GrowWithHR

GrowWithHR is a deterministic, traceable HR compliance advisory prototype. It records explicit organisation facts, applies versioned deterministic rules, retrieves governed research material only after the decision, and uses AI only to explain the fixed result.

> **Authority boundary:** deterministic rules decide the product result within the prototype contract. RAG retrieves only the source scope selected by that decision. The provider explains only and cannot create facts, choose applicable law, change status/reason/source scope or certify compliance.

## Current prototype release

**Updated:** 11 August 2026  
**Application baseline:** `0.20.3-prototype.1`  
**Release line:** Governed Compliance & Legal RAG Prototype  
**Release classification:** research-grade prototype / GitHub prerelease  
**Legal-review status:** every active legal catalogue remains `needs-legal-review`

The effective Legal RAG runtime contains:

| Control | Current state |
|---|---:|
| Callable profiles | 57 |
| Substantive profiles | 55 |
| Governance fallback profiles | 2 |
| Active catalogues | 21 |
| Active catalogue legal status | `needs-legal-review` |

The two governance fallbacks are deliberately non-substantive:

- **Wave 5J — Bonded and Forced Labour:** governance/research-only; no assessment/runtime activation. Live safeguarding concerns remain human-only.
- **Wave 5M — Multi-country Employment:** excluded from the current release. #141 is closed `not planned`; there is no country pair, assessment contract, runtime catalogue, browser/provider route or cross-border data design in this release.

## Prototype source standard

This release is intentionally a **high-quality research prototype**, not a production legal-certification system.

For the prototype:

- structured secondary research with controlled provenance is an accepted legal/source basis;
- exact official-file verification is supplementary assurance, not a release prerequisite;
- secondary-research provenance must not be presented as official or counsel-approved provenance;
- draft, guidance, portal and research material retains its classification;
- all active legal catalogues remain `needs-legal-review`;
- outputs must not be represented as legal opinions, legal certification or proof of compliance.

The 31-file Exact File Reconciliation already recorded in the Source Register remains useful supplementary audit evidence, but a runtime migration to official-file hashes is **not required for this prototype release**. Production-grade official-file assurance remains tracked as future hardening under #143. Production legal/privacy/RAG/source/security certification remains future work under #142.

## Start here

- [ABOUT.md](ABOUT.md) — what the prototype is, how it works, privacy/authority boundaries and a hypothetical end-to-end example.
- [Legal RAG runtime README](growwithhr-rag/README.md) — runtime components, retrieval/provider behaviour and server configuration.
- [Platform architecture](docs/architecture/legal-rag-platform-architecture.md) — current effective architecture and runtime composition.
- [Source-pack pipeline](docs/architecture/legal-rag-source-pack-build-pipeline.md) — source identity, optional exact-file assurance and publication controls.
- [Feature coverage inventory](docs/architecture/complete-feature-coverage-inventory.md) — current family/profile catalogue inventory.
- [All-laws validation](docs/testing/all-laws-rag-validation.md) — regression and release validation procedure.
- [Prototype release readiness](docs/releases/legal-rag-release-readiness-2026-08-11.md) — prototype release gate, validation and production-hardening boundary.

## Product routes

- Public assessment: `/analyze-company.html`
- Private-beta Compliance DNA route: `/analyze-company-v3.html`
- Private-beta feature flag: `complianceDnaV3: false`
- Shared legal explanation route: `POST /api/legal-explanation/feature/:featureId`
- Legal RAG status route: `GET /api/legal-rag/status`

The deployed product remains the root-level HTML/CSS/JavaScript application. `apps/web/src` is an archived experimental React/TypeScript UX layer and is not the deployed build.

## How a legal explanation is produced

```text
Assessment answers
→ privacy-safe deterministic fact mapping
→ versioned deterministic rule
→ immutable decision + reason code + missing facts + allowed source IDs
→ governed source retrieval
→ retrieval/citation fingerprint
→ explanation-only provider
→ strict response validation
→ user-facing explanation and next action
```

Retrieval happens only after the deterministic decision. Complete/reported-gap substantive outcomes remain review-oriented (`specialist-review`); missing required facts remain `more-information-needed`. A language model cannot repair missing facts or turn research evidence into legal approval.

## Main-integrated substantive coverage

Substantive prototype coverage includes:

- POSH — 7 profiles;
- Maternity Benefit — 10 profiles;
- EPF/EPS/EDLI — 12 profiles across Waves 3A–3C;
- ESI — 15 profiles across Waves 4A–4D;
- Appropriate Government — Wave 5A;
- Maharashtra Shops and Establishments — Wave 5B;
- Code on Wages — Wave 5C;
- Gratuity — Wave 5D;
- Employee's Compensation — Wave 5E;
- OSHWC — Wave 5F;
- Industrial Relations — Wave 5G;
- Apprentices — Wave 5H;
- Child and Adolescent Labour — Wave 5I;
- Contract Workforce — Wave 5K; and
- Generic Social Security family/chapter routing — Wave 5L.

The tool does not turn these bounded controls into individual entitlement, payroll, medical, injury-causation, enforcement, immigration, tax, safeguarding or legal-certification decisions.

## RAG authority boundary

All substantive profiles use deterministic-first RAG. Retrieval/provider output must preserve:

```text
usedForDecision: false
applicabilityAuthority: none
```

RAG is used for governed explanation and citation support, not applicability authority.

## Privacy and security boundary

Legal-review browser panels are explicit-submit and in-memory only. Feature clients must send only allow-listed organisation-level controls and controlled references.

Person-level identities, payroll/contribution bodies, medical/case data, complaint/dispute narratives, notices/orders, evidence bodies and other prohibited content remain outside the provider path unless a separately approved contract explicitly allows them. Wave 5J and Wave 5M have no substantive browser/provider surface.

## Validation and prototype release gate

A prototype release may be published when:

1. the release is explicitly labelled prototype/prerelease;
2. `needs-legal-review` remains intact;
3. secondary-research provenance is represented truthfully;
4. the complete maintained engineering regression is green on the exact release SHA;
5. the runtime remains 57 callable / 55 substantive / 2 governance fallback / 21 catalogues;
6. Wave 5J and Wave 5M remain non-substantive;
7. the release notes retain the no-certification and professional-review limitations.

Key smoke invariant:

```json
{
  "profileCount": 57,
  "substantiveProfiles": 55,
  "governanceFallbackProfiles": 2,
  "activeCatalogs": 21
}
```

## Prototype versus production

Issue #142 remains open as the **future production-hardening/certification gate**. It does not block this clearly labelled prototype release. Issue #143 remains open as future exact official-source hardening and is also non-blocking for the prototype.

GrowWithHR provides research-backed advisory information, traceability and implementation starting points. It is not professional legal, tax, payroll, immigration, privacy, security or safeguarding advice.