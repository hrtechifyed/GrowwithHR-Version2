# GrowWithHR Zero-Cost Prototype Handoff

**Date:** 23 August 2026  
**Branch:** `prototype/account-org-growth-workflow-v1`  
**Protected restore point:** `baseline/2026-08-23-pre-account-org-growth-upgrade` at `a84f17a9d800efa8171c01e3e46013b12499b5da`

## 1. Product constraint

This prototype must not require paid infrastructure. The active prototype therefore does **not** depend on Render and does **not** require a paid Supabase development branch.

Password accounts are intentionally deferred. The following account features are not part of the active zero-cost experience:

- Sign up / sign in / sign out
- Sign in with Google
- Forgot / reset password
- Cross-device draft autosave through an account
- Account-based report library
- Account-based email re-send

The earlier account implementation remains on this prototype branch as dormant development work so it can be reconsidered later without affecting the active zero-cost flow.

## 2. Active user model

### Assessment drafts

Organization Structure & Growth answers auto-save in the user's browser. A user can leave and resume on the **same browser/device**.

Compliance retains its existing browser/local persistence behavior.

### Completed reports

When a real report is generated, GrowWithHR assigns:

1. a **Report ID**; and
2. a **Recovery Code**.

The first completed report created on a browser establishes the recovery workspace and Recovery Code. Later Compliance or Organization Structure & Growth reports generated from that browser reuse the same recovery workspace/code and receive their own Report IDs.

A user can recover the linked report history from another device by providing any Report ID from the workspace together with the Recovery Code.

## 3. Report security model

The completed report payload is encrypted **in the browser before upload**.

Current browser cryptography:

- PBKDF2
- SHA-256
- 180,000 iterations
- AES-GCM 256-bit
- random per-report salt
- random per-report IV

The Recovery Code is used to derive the encryption key. The prototype database stores the encrypted payload, salt and IV. It does not store the plaintext Recovery Code; it stores a one-way SHA-256 recovery hash for access validation.

The browser may retain the Recovery Code locally for convenience. The user should keep an independent copy. If the user loses the Recovery Code and every device/browser that still has it, GrowWithHR cannot decrypt the remotely stored report.

## 4. Supabase prototype objects

The existing free GrowWithHR Supabase project is used. No paid branch was created.

All new database objects are isolated under a `prototype_` prefix:

- `prototype_report_workspaces`
- `prototype_saved_reports`
- `prototype_growwithhr_report_seq`
- `prototype_allocate_report_id()`

RLS is enabled on both prototype tables and no anon/authenticated table policy is created intentionally. Browser clients cannot query them directly.

The report-ID allocator is `SECURITY DEFINER`, but execute permission is revoked from `anon`, `authenticated` and `public`; only the service role can execute it.

## 5. Supabase Edge Function

Function: `growwithhr-prototype-report-vault`

The function is deployed with platform JWT verification disabled because the active product has no user login. It implements its own Report ID + Recovery Code validation before returning, updating or deleting a report.

Supported actions:

- `create`
- `list`
- `get`
- `update`
- `delete`

The service-role key stays inside Supabase Edge Functions and is never sent to the browser.

Allowed browser origin is restricted to `https://hrtechifyed.github.io`, with localhost/127.0.0.1 permitted for development.

## 6. Organization Structure & Growth flow

The working prototype contains seven guided stages:

1. Your Company
2. Where You Are Going
3. Your Constraints
4. Responsibility Concentration
5. Management & Structure
6. How Work & Decisions Happen
7. Review

The engine intentionally separates headcount growth from revenue, customer, product, geographic, business-line and acquisition complexity.

It also treats combined roles contextually. A Product + Engineering leader, for example, is not automatically treated as a problem. The engine considers whether the combination is still workable under the company's current stage, expected complexity and headcount constraints.

## 7. Decision output

The report follows this logic:

`Company facts → Growth dimensions → Constraints → Existing deterministic structure analysis → Structural pressure → External reference points → Viable structure options → Trade-offs → GrowWithHR suggested direction → Management choice → Implementation plan → Reassessment triggers`

The language is deliberately developmental:

> Your current structure has supported the company to this point. Based on the growth and constraints you described, some parts may come under increasing pressure and may need to evolve.

It does not tell a company that its structure is "bad".

## 8. Structural choices

The option engine can create context-dependent alternatives such as:

- strengthen the current functional structure;
- functional structure + product pods;
- functional structure + regional ownership;
- selective leadership separation;
- product divisions + shared services;
- regional divisions + shared functions;
- hybrid/divisional future-state structures.

Each option includes:

- headcount implication;
- cost/change level;
- when it fits;
- advantages;
- trade-offs;
- what it solves;
- what it does not solve;
- expected longevity;
- scoring reasons.

GrowWithHR identifies a suggested direction, but the user can choose another viable option. The implementation plan then follows the user's chosen direction.

## 9. Implementation guidance

The selected structure receives a phased plan:

- Days 0–30
- Days 30–60
- Days 60–90
- Months 3–6

It also includes measures to monitor, items not to change prematurely and triggers for reassessing structure later.

## 10. Trust and reference points

The report keeps separate:

1. facts provided by the user;
2. deterministic GrowWithHR structural findings;
3. public/external reference points;
4. GrowWithHR interpretation;
5. the resulting options and recommendation.

Reference points are not presented as universal "best practice". They provide context rather than mechanically determining the answer.

## 11. My Reports

`my-reports.html` now supports the zero-cost recovery model:

- reports generated/recovered on the current browser are listed automatically;
- Report ID + Recovery Code recovers the linked report history;
- Organization Structure & Growth reports open in the decision report;
- Compliance reports are restored into the existing Compliance report renderer;
- the encrypted prototype recovery workspace can be deleted by the holder of valid recovery credentials.

## 12. Compliance compatibility

The existing Compliance assessment/report engine has not been rewritten.

A small bridge attaches the zero-cost recovery model when a completed Compliance report is opened. It encrypts the current report payload, saves it in the same recovery workspace and displays the Report ID + Recovery Code.

Recovered Compliance reports are decrypted in the browser and handed back to the existing `executive-advisory-report.html` rendering path.

## 13. Account prototype status

Account code created earlier remains **dormant** on this development branch. Shared authentication redirects have been disabled and account controls are hidden from the active prototype UI.

The stale account-recovery GitHub workflow is manual-only so it does not run against the active zero-cost implementation on every push.

## 14. What has not been changed

- `main` is not the working target for this prototype.
- The protected pre-upgrade baseline remains the restore point.
- Existing production report pages and deterministic engines are preserved unless explicitly wrapped by prototype behavior.
- No paid Supabase branch was created.
- No Render service is used by the active zero-cost prototype.

## 15. Validation

The repository contains `tests/zero-cost-prototype-checks.mjs` and a dedicated GitHub Actions workflow which checks the active browser modules and recovery contracts.

Supabase security linting was run after the prototype schema was created. The initial warning that the `SECURITY DEFINER` Report ID allocator was callable by anon/authenticated roles was corrected. Remaining RLS-without-policy messages are informational and intentional for these server-only prototype tables.

## 16. Before any production release

This remains a working prototype. Before any user-facing production merge, perform at minimum:

- full browser end-to-end generation and recovery test;
- wrong Recovery Code test;
- second-device recovery test;
- multiple reports under one recovery workspace test;
- deletion test;
- payload-size test;
- mobile/desktop UX test;
- abuse/rate-limit review for the public custom-auth Edge Function;
- privacy/security copy review;
- confirmation that Supabase usage remains inside the desired free-plan limits.
