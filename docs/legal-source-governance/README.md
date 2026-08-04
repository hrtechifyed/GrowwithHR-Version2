# GrowWithHR legal source governance

**Status:** Phase 0 repository companion  
**Prepared:** 2026-08-04  
**Legal review:** required  
**Runtime effect:** none

This directory implements the repository-side control scaffolding from the GrowWithHR Legal Source-Pack Expansion Plan. It does not replace the controlled Google Drive files and does not approve a legal interpretation, source, deterministic rule, retrieval catalogue, endpoint, or UI surface.

## Authority boundary

```text
assessment answers
→ deterministic fact mapping
→ deterministic legal or operational result
→ approved source retrieval for legal features only
→ explanation-only provider
→ strict response validation
→ private-beta presentation
```

The feature registry describes readiness. It is not a decision engine. Retrieval and an explanation provider must never supply missing assessment facts or alter a deterministic result, status, reason code, fingerprint, or legal-review status.

## Source of truth

The legal-file source of truth remains:

`GrowWithHR-RAG/00-project-control/Source Register.xlsx`

Repository files in this directory are version-controlled templates and validation aids. Drive changes must be confirmed against the live Drive before any duplicate is removed, renamed, moved, or treated as superseded.

## Phase 0 artifacts

- `templates/source-register-v2.csv` — columns for the controlled multi-sheet Source Register v2 design.
- `templates/legal-feature-review-register.csv` — the 18 legal feature families aligned to the Feature Coverage Registry.
- `templates/section-mapping.csv` — the standard source-section-to-feature mapping columns.
- `source-pack-completion-checklist.md` — the source-pack workflow and release gates.
- `data/legal-source-governance/posh-section-mapping.v1.json` — a draft repository companion for the six remaining POSH duties.
- `tests/legal-source-governance-checks.mjs` — guardrails that prevent draft mappings from being mistaken for live or RAG-approved material.

## Source-pack readiness states

| State | Meaning | Allowed action |
|---|---|---|
| `not-started` | No governed official files or register rows | Research only |
| `collected` | Official files stored and identified | Prepare register and section map |
| `registered` | Register is complete with integrity metadata | Internal review and supersession check |
| `reviewed` | Internal review is complete | Prepare governed chunks and tests |
| `approved-for-rag` | Exact file hash and section scope approved | Repository source/chunk update allowed |
| `live-governed` | Rule, retrieval, explanation, UI, and regression gates pass | Private-beta activation allowed |
| `superseded` / `archived` | Replaced or rejected source | Never retrieve as current authority |

## Standard workflow

1. Create the controlled feature folder without renaming current POSH paths.
2. Define the exact legal question, jurisdiction, deterministic statuses, and missing facts.
3. Collect official sources only.
4. Verify title, issuer, document type, jurisdiction, official record URL, and direct PDF URL.
5. Check amendments, commencement, effective dates, supersession, and state variations.
6. Store one authoritative file.
7. Record SHA-256, byte length, and page count.
8. Complete Source Register v2.
9. Map exact sections and pages to feature IDs and proposed reason codes.
10. Complete internal self-review, including prohibited claims and unresolved questions.
11. Record qualified legal review and any conditions.
12. Approve exact file hashes and section scopes for RAG.
13. Create curated governed chunks only.
14. Implement deterministic rules with explicit missing-information or specialist-review outcomes.
15. Run schema, cross-reference, boundary, retrieval, provider, endpoint, UI, privacy, and regression tests.
16. Activate private beta only after every gate is green.
17. Set periodic and event-driven review triggers.

## Phase 1 boundary

The six remaining POSH mappings are drafts. They may support Drive review and legal review, but they must not be used to:

- mark any feature `live-governed`;
- add a deterministic legal outcome without required facts;
- retrieve unapproved sections;
- send complaint content, case details, or raw assessment answers to an explanation provider;
- change stable report, PDF, email, endpoint, or UI behavior.

The next implementation PR is allowed only after the live Drive master, source hashes, exact page mappings, assessment facts, legal-review conditions, and RAG approvals are recorded.