# GrowWithHR post-v0.18 and M4 report-hardening status

- Reporting date: 2026-07-27
- Canonical package version: `0.18.0`
- M4 target release: `v0.19.0`
- Stable public route: `/analyze-company.html`
- Private routes: `/analyze-company-v3.html` and `/m4-explainable-intelligence.html`
- Public `complianceDnaV3` default: disabled

## Executive status

The customer-email signature requirement, the M4 Explainable Intelligence foundation, the M4 report integration, and the subsequent founder-report acceptance and single-tier PDF rebuild are merged on `main`.

M4 implementation is therefore complete at the feature and integration level. The canonical application version remains `0.18.0`; `v0.19.0` has not been cut or declared released.

The remaining release gates are operational rather than model-development work:

1. complete a deployed assessment-to-PDF-to-email smoke test using the current Render and Gmail configuration;
2. verify `REPLY_TO_EMAIL` and `INTERNAL_NOTIFICATION_EMAIL` behaviour with archived evidence;
3. archive representative Light, Dark and dual-delivery PDF evidence from the current single-tier assembler;
4. run and record the coordinated `v0.19.0` release validation and version cut only after the operational gates pass.

## Work completed after the 23 July status update

| Pull request | Result | Status |
| --- | --- | --- |
| #61 | Implemented the approved Warm Wishes customer-email signature in plain text and HTML with exact wording, title-case founder name, bold HTML name and LinkedIn link. | Complete |
| #62 | Added unlimited priority selection and multi-state or Pan India operating-footprint support while preserving compatibility fields. | Complete |
| #63 | Extended PDF running-text justification; later acceptance work narrowed and replaced the global treatment where required. | Superseded by later report assembly |
| #64 | Implemented the M4 Explainable Intelligence model, separate metrics, information-gain questions, decision trace, schema, private view and dedicated checks. | Complete |
| #65 | Integrated M4 law transparency into the executive PDF and email-delivery path. | Complete |
| #66-#70 | Corrected report sequencing, industry inputs, legal links, remote-work locks and assessment performance/navigation regressions. | Complete |
| #71 | Made assessment inputs and the PDF founder-first, with explicit missing-information and law-status explanations. | Complete |
| #72 | Added final report-acceptance sequencing, scoped narrative justification, link fixes and One Person Company workforce logic. | Complete |
| #73 | Fixed the lightweight PDF adapter timeout in the maintained browser-delivery test. | Complete |
| #74 | Rebuilt Light and Dark PDFs through one single-tier assembler with one cover, one contents page, one page-count system, compressed dormant-law content and an optional annexure. | Complete |

## Current M4 interpretation

M4 now delivers the planned implementation capabilities:

- profile completeness, applicability certainty and evidence coverage remain separate;
- no blended compliance, health or maturity percentage is produced;
- missing governed questions are ranked by named information gain;
- calculations produce a reproducible decision trace;
- the model is connected to the current founder-facing report and delivery path;
- protected storage, public routing and browser-local operation remain intact.

This is an implementation-complete position, not a release-complete position. The package and visible canonical version remain `0.18.0` until the release gates and coordinated cut are recorded.

## Protected contracts confirmed

The following boundaries remain unchanged:

- `/analyze-company.html` stays the public and rollback route;
- `/analyze-company-v3.html` stays private;
- `complianceDnaV3` stays disabled by default;
- protected browser-storage keys remain readable;
- no cloud persistence, authentication or evidence upload is introduced;
- browser-generated PDFs and `POST /api/send-advisory` remain the compatibility delivery path;
- deterministic applicability decisions remain independent of presentation and future RAG work.

## Remaining acceptance evidence

| Gate | Required evidence | Current status |
| --- | --- | --- |
| Deployed customer delivery | A real customer receives the expected current PDF and the endpoint confirms customer delivery. | Pending manual verification |
| Reply-to and internal notification | A monitored reply reaches the configured reply-to address and the internal notification is archived. | Pending manual verification |
| Representative PDF archive | Current Light, Dark and dual-delivery samples are archived on desktop and mobile with the release record. | Pending |
| Complete release regression | Version consistency, compliance-data validation, complete maintained tests and required browser workflows pass on the release branch. | Required for version cut |
| Coordinated version cut | Package, application configuration, visible version labels, tests, roadmap, changelog and release evidence are aligned to `0.19.0`. | Not started |

## Recommended next release action

Do not begin another report architecture layer. Complete the deployed delivery and evidence gates, then open a focused `release/v0.19.0` pull request that performs only the coordinated version cut and release-record updates.

## Rollback position

Until the version cut is approved, the canonical release remains `0.18.0`. If a current report or delivery regression is discovered, revert the relevant post-v0.18 pull request while retaining the deterministic M2/M3/M4 model contracts and the stable public route. No storage migration or cleanup is required.
