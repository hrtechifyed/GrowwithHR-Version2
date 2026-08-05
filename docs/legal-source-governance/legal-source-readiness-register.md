# Legal source readiness and reconciliation register

**Version:** 0.1.0  
**Updated:** 5 August 2026  
**Role:** Governance-only planning record  
**Applicability authority:** None  
**Assessment capture:** Disabled  
**Runtime activation:** Blocked / false

> This register does not create legal rules, approve sources, activate RAG, or authorise customer-facing conclusions.

## Purpose

This record closes the repository-planning gap for legal families that do not yet have complete controlled source packs. It distinguishes source-ready blocked onboarding from source collection, legal research, state-material, safeguarding and jurisdiction work that must happen before another law-specific repository batch can be created.

Knowledge-base records, legacy thresholds, public links and internal notes are not controlled legal source packs. Shared Social Security Code sources do not approve a chapter-specific interpretation.

## Completed or in-progress controlled batches

| Family | Repository state | PR |
|---|---|---:|
| POSH | Private-beta threshold plus blocked expansion governance | Existing merged baseline |
| Maternity Benefit | Blocked governance companions merged | #106 |
| PF/EPF, EPS and EDLI | Blocked governance companions in draft review | #107 |
| ESI | Blocked governance companions in stacked draft review | #108 |

## Remaining legal families

| Feature family | Classification | Source-pack state | Repository state | Next controlled action |
|---|---|---|---|---|
| `feature.legal.jurisdiction.appropriate-government` | `needs-legal-research` | `not-started` | `blocked-no-source-pack` | Complete cross-cutting legal research and create a controlled jurisdiction source pack before proposing facts or rules. |
| `feature.legal.state.shops-establishments` | `source-collection-incomplete` | `not-started` | `blocked-no-state-catalogues` | Select the first supported State, collect and fingerprint its exact official source pack, and complete state-specific self-review. |
| `feature.legal.code-on-wages` | `source-collection-incomplete` | `not-started` | `blocked-no-source-pack` | Collect the current central framework and one bounded rate/jurisdiction pack before proposing deterministic review families. |
| `feature.legal.social-security.gratuity` | `source-collection-incomplete` | `shared-core-only` | `blocked-no-chapter-specific-pack` | Prepare a chapter-specific controlled source mapping and self-review using the shared core only as input, not as approval. |
| `feature.legal.social-security.employee-compensation` | `source-collection-incomplete` | `shared-core-only` | `blocked-no-chapter-specific-pack` | Collect and map the chapter-specific source set and design an organisational-control-only first scope. |
| `feature.legal.oshwc` | `source-collection-incomplete` | `not-started` | `blocked-no-source-pack` | Choose a bounded establishment/contract-workforce scope and collect exact current Central and State materials. |
| `feature.legal.industrial-relations` | `source-collection-incomplete` | `not-started` | `blocked-no-source-pack` | Collect current central transition sources and define a narrow standing-orders readiness scope. |
| `feature.legal.apprentices` | `source-collection-incomplete` | `not-started` | `blocked-no-source-pack` | Collect the official apprenticeship source set and complete a classification-focused self-review. |
| `feature.legal.child-adolescent-labour` | `source-collection-incomplete` | `not-started` | `blocked-no-source-pack` | Collect exact official sources and design a safeguarding-first, non-entitlement review boundary. |
| `feature.legal.bonded-forced-labour` | `needs-legal-research` | `not-started` | `blocked-research-and-safeguarding` | Complete specialist legal and safeguarding research before collecting any potentially identifying or allegation-related fact. |
| `feature.legal.contract-workforce` | `source-collection-incomplete` | `not-started` | `blocked-cross-family-dependencies` | Complete the underlying OSHWC source pack and treat PF/EPF and ESI contractor controls as separate dependencies, not substitutes. |
| `feature.legal.multi-country-employment` | `outside-current-india-law-scope` | `out-of-scope` | `blocked-outside-supported-jurisdiction` | Select a country pair and obtain specialist jurisdictional approval before creating any product rule or source pack. |

## Mandatory delivery boundary

For every remaining family:

- `assessmentCapture = false`
- `runtimeActivation = false`
- no active deterministic rule
- no governed RAG catalogue or manifest
- no explanation route, endpoint or UI result
- no customer-facing legal status
- no source or internal review treated as approval

The next repository onboarding batch may begin only after the controlled source pack, exact-file identities, self-review, Assessment Fact Contract and blank legal/RAG review packet are complete.

## Controlled Drive reconciliation queue

| Control item | Status | Required correction | Runtime effect |
|---|---|---|---|
| `drive.source-register.posh-fingerprints` | `pending-controlled-drive-update` | Populate POSH SHA-256, byte-length and physical-page fields from the verified repository/controlled source identities. | `none-until-approved` |
| `drive.source-register.duplicate-social-security-rules` | `pending-controlled-drive-update` | Resolve the duplicate social-security-central-rules-2026 row without losing feature-use metadata. | `none-until-approved` |
| `drive.source-register.esi-recovery-row-corruption` | `pending-controlled-drive-update` | Repair the ESI Recovery Officers SHA and shifted/corrupted columns against the exact controlled file. | `blocks-source-publication` |
| `drive.source-register.esi-central-rules-path` | `pending-controlled-drive-update` | Reconcile the registered ESI Central Rules path with its actual controlled Drive location. | `blocks-exact-file-verification` |
| `drive.legal-rule-audit.current-law-basis` | `pending-controlled-drive-update` | Reconcile legacy Maternity, EPF and ESI legal-basis rows to the current controlled Code/scheme workstreams while retaining transition history. | `governance-only` |
| `drive.project-status-and-changelog.esi` | `pending-controlled-drive-update` | Record the completed ESI controlled source pack and blocked repository onboarding PR after review. | `governance-only` |

These entries are tracking records only. This repository PR does not edit Google Drive.

## Recommended research order after the current PR stack

1. Cross-cutting Appropriate Government and jurisdiction model.
2. First State Shops and Establishments pack.
3. Bounded Code on Wages pack.
4. Gratuity chapter-specific Social Security pack.
5. Employee compensation chapter-specific Social Security pack.
6. OSHWC and contract-workforce packs.
7. Industrial Relations and standing-orders pack.
8. Apprentices.
9. Child and Adolescent Labour.
10. Bonded/forced-labour legal and safeguarding research.
11. Multi-country employment only after a country pair is selected.

This sequence is a planning recommendation, not legal priority or approval.
