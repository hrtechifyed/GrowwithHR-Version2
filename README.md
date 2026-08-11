# GrowWithHR

GrowWithHR is a deterministic, traceable HR compliance advisory engine. It records explicit organisation facts, applies versioned deterministic rules, retrieves governed source material only after the decision, and uses AI only to explain the fixed result.

> **Authority boundary:** deterministic rules decide the product result. RAG retrieves only the source scope selected by that decision. The provider explains only and cannot create facts, choose applicable law, change status/reason/source scope or certify compliance.

## Current release-candidate state

**Updated:** 11 August 2026  
**Application baseline:** `0.20.2`  
**Release line:** Governed Legal RAG Private Beta  
**Production certification:** not yet granted; programme gate is GitHub #142

The effective private-beta Legal RAG runtime contains:

| Control | Current state |
|---|---:|
| Callable profiles | 57 |
| Substantive profiles | 55 |
| Governance fallback profiles | 2 |
| Active catalogues | 21 |
| Active catalogue legal status | `needs-legal-review` |

The two governance fallbacks are deliberately non-substantive:

- **Wave 5J — Bonded and Forced Labour:** governance/research-only; no assessment/runtime activation while #139 and #140 remain open.
- **Wave 5M — Multi-country Employment:** excluded from the current release. #141 is closed `not planned`; there is no country pair, assessment contract, runtime catalogue, browser/provider route or cross-border data design in this release.

## Start here

- [ABOUT.md](ABOUT.md) — what the tool is, how it works, privacy/authority boundaries and a hypothetical end-to-end example.
- [Legal RAG runtime README](growwithhr-rag/README.md) — runtime components, retrieval/provider behaviour and server configuration.
- [Platform architecture](docs/architecture/legal-rag-platform-architecture.md) — current effective architecture and runtime composition.
- [Source-pack pipeline](docs/architecture/legal-rag-source-pack-build-pipeline.md) — source identity, exact-file verification and publication controls.
- [Feature coverage inventory](docs/architecture/complete-feature-coverage-inventory.md) — current family/profile catalogue inventory.
- [All-laws validation](docs/testing/all-laws-rag-validation.md) — regression and release validation procedure.
- [Release readiness](docs/releases/legal-rag-release-readiness-2026-08-11.md) — gate matrix and exact next steps to production certification.

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

Retrieval happens only after the deterministic decision. Complete/reported-gap substantive outcomes remain review-oriented (`specialist-review`); missing required facts remain `more-information-needed`. A language model cannot repair missing facts or turn implementation evidence into legal approval.

## Main-integrated substantive coverage

Substantive private-beta coverage includes:

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

The tool does not turn these bounded source/readiness controls into individual entitlement, payroll, medical, injury-causation, enforcement, immigration, tax, safeguarding or legal-certification decisions.

## Source governance status

The canonical Google Drive Source Register remains the source-control record. On 11 August 2026 an Exact File Reconciliation sheet was added that maps **31 acquired official PDFs** to existing Source IDs with SHA-256, byte length and physical page count derived from the stored bytes.

That reconciliation deliberately does **not** overwrite the validated curated source-identity fingerprints. One misleading duplicate Maharashtra Shops Rules file was quarantined because it was byte-identical to the Shops Act. Draft Maharashtra Shops/OSHWC/Industrial Relations instruments remain draft/non-operative until exact final instruments are separately acquired and approved.

The remaining source-control work is tracked under #143; Wave 5J's two separate exact-source blockers remain #139.

## Privacy and security boundary

Legal-review browser panels are explicit-submit and in-memory only. Feature clients must send only allow-listed organisation-level controls and controlled references.

Person-level identities, payroll/contribution bodies, medical/case data, complaint/dispute narratives, notices/orders, evidence bodies and other prohibited content remain outside the provider path unless a separately approved contract explicitly allows them. Wave 5J and Wave 5M have no substantive browser/provider surface.

## Validation

The previous main-integration head passed All-Laws RAG, Executive Assessment, M4 Report Integration, M7 RAG-Ready Hardening and repository-wide GrowWithHR CI. That remains software evidence, not production certification.

For the current release candidate, run the maintained all-laws and release regression documented in [docs/testing/all-laws-rag-validation.md](docs/testing/all-laws-rag-validation.md) and [docs/releases/legal-rag-release-readiness-2026-08-11.md](docs/releases/legal-rag-release-readiness-2026-08-11.md).

Key smoke invariant:

```json
{
  "profileCount": 57,
  "substantiveProfiles": 55,
  "governanceFallbackProfiles": 2,
  "activeCatalogs": 21
}
```

Wave 5J and Wave 5M must remain non-substantive/non-activated.

## Release boundary

Main integration, source upload, successful tests, live smoke, product-owner review or AI/model review do not grant legal/privacy/RAG/security/release approval.

Before production certification, named authorised reviewers must close the applicable LEGAL, PRIVACY, RAG, SOURCE-FILE and SECURITY gates and a release owner must record the RELEASE decision under #142. Wave 5J remains separately blocked by #139/#140. Wave 5M is not part of the current release.

GrowWithHR provides advisory information, traceability and implementation starting points. It is not professional legal, tax, payroll, immigration, privacy, security or safeguarding advice.