# GrowWithHR — Opt-in compliance reassessment reminders

Status: **Product design approved in principle; NOT implemented or activated**. This feature must never start emailing users merely because they completed an audit. PDF improvements ship separately.

## Intent

After the **HR Compliance Readiness** assessment has produced a confirmed snapshot, invite the user to receive optional prompts to review the areas identified in that snapshot and reassess when company facts change. GrowWithHR assesses *applicability and missing information*, **not** proof that a company has fulfilled or breached an obligation. Reminders must preserve that distinction.

## Consent-first completion experience

Prompt after the final compliance executive overview, once the user's report/work-email identity is established:

> **Would you like reminders based on your latest HR Compliance Readiness assessment?**
>
> We can remind you to review relevant compliance areas, confirm missing company information and reassess when your organisation changes. Reminders are optional; completing this assessment does not sign you up.
>
> **[No, thanks]**  **[Yes, set up reminders]**

- **Default: No**. Neither option should be preselected. Closing or skipping the prompt means **no reminders**.
- Clicking Yes opens a *second confirmation step* (no scheduling yet): show verified recipient work email, the snapshot date, topic categories, frequency (monthly or quarterly), next planned review date, and a short summary of data used. Users must explicitly confirm **Start reminders**.
- Confirm only after durable server write. A failed write shows an error; **never claim enrollment was successful**.
- Keep email and reminders out of the general product marketing CTA. No payment, newsletter subscription or cross-sell. Do not reuse earlier marketing consents.
- The opt-in must be scoped to the **current authenticated company workspace and last completed compliance snapshot**, not another company's data or a prior report.
- Allow **Pause**, **Change schedule**, and **Turn off reminders** from the workspace, plus a one-click signed unsubscribe link in each email. Unsubscribe must work even after account sign-out and should never require the recipient to disclose a recovery code by email.

## Safe and simple v1 cadence

Two types of notifications:
1. **Periodic review check-in** (monthly or quarterly, user's choice): `Your GrowWithHR compliance readiness review is due`. Briefly mention relevant review categories but not sensitive assessment answers. Deep link to authenticated workspace.
2. **Assessment-aging reminder** at the next user-approved review date: ask whether workforce size, location, working arrangements or contractor model has changed. If yes, invite reassessment.

Do **not** send statutory due-date alerts based only on a law's applicability result. A genuine legal deadline must additionally have a current, reviewed legal source, jurisdiction, establishment category, effective date, prescribed frequency, prerequisites, ownership and a deterministic date calculation verified against company facts. In v1, label dates as **review dates**, not statutory due dates. Avoid words like "non-compliant", "violation", "penalty imminent", or "overdue filing" unless separately verified.

## Persistence, privacy and deliverability requirements

- New backend consent record: `workspace_id`, `snapshot_report_id`, `consent_version`, `consented_at`, `recipient_email_hash` (plus encrypted delivery identity), `cadence`, `next_review_at`, `status`, `revoked_at`, `latest_send_at`. Store rationale/topic IDs as allowed governed, non-sensitive identifiers.
- All CRUD endpoints require authenticated workspace ownership and explicit CSRF/CORS controls. Webhook/scheduler may only use scoped server credentials.
- Use one scheduled job, suppress duplicates with unique `workspace + snapshot + review_period` key, cap sending rate, retry transient failures carefully, stop after unsubscribe or retention expiry.
- When a new compliance audit is completed, mark older reminder schedule **superseded**; request permission to use the new snapshot before updating scope. Never silently keep sending reminders based on stale snapshot.
- Respect six-month workspace retention and existing deletion processes. On workspace deletion/expiry, deactivate reminders and remove associated schedule/recipient details as required by the data policy.
- Email should disclose that GrowWithHR is research-grade decision support, that requirements may have changed since the assessment, and that the user should verify with official sources/qualified advisers.
- Track consent and successful sends **server-side**; Umami may track only a non-identifying `reminder_opt_in_confirmed` event if added to the allowlist, without email/report ID/company/snapshot details.
- No automatic backfill for historic assessments; invite again at next completed compliance assessment.

## Release tests

- Default no/skip/close produces zero database records and zero emails.
- Yes without final confirmation produces zero active records.
- Authenticated Yes+confirm produces exactly one consent record; repeat click is idempotent.
- Snapshot/company/recipient mismatch rejected.
- One reminder at cadence; no duplicate sends after retry or rescheduling.
- User pauses/unsubscribes: future sends stop promptly.
- New report supersedes previous schedule, requests fresh opt-in before changing reminder subject/scope.
- Retention expiry and workspace deletion cancel all reminders.
- Unreviewed jurisdictional deadlines are never advertised as statutory due dates.
- Time zones, daylight savings (when relevant), undeliverable email, rate limits and partial failures tested.

**Do not launch the feature until all above tests are green and a real end-to-end opt-in + unsubscribe email flow has been verified.**
