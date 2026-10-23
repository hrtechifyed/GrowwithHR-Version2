# GrowWithHR — Privacy-first analytics and report feedback

## Implemented

GrowWithHR now has first-party integration hooks for six **allowlisted** product events:
`assessment_started`, `assessment_completed`, `report_viewed`, `full_report_requested`, `feedback_submitted`, and `return_visit`.

Events have only a fixed product property (`organization` or `compliance`). Successful feedback may additionally send the one-word rating (`yes`, `partly`, `no`) to Umami. No company details, emails, answers, report IDs, recovery codes, full URL queries or URL fragments are included. The analytics integration runs only for the official GitHub Pages hostname and respects browser Do Not Track.

The Founding Beta and both assessments continue to work if Umami is unavailable or not configured. Report-view feedback does not require authentication or payment. It uses `POST /api/report-feedback` on the existing Render/Gmail backend. A 400-character optional comment is sent to HRTechify's internal notification mailbox. The form has a honeypot and rate limiting; email addresses, links and likely phone numbers are blocked in comments. The full-report authentication, PDF and report recipient matching are unchanged.

## Umami activated — owner configuration received

The owner supplied a public Website ID on 23 October 2026, and `js/product-analytics.js` now loads Umami Cloud on the official GitHub Pages host `hrtechifyed.github.io`. The public ID is configured in source; no API key, email password or Umami account credential is stored in GrowWithHR. Analytics remains excluded from staging and other hostnames.

**Production verification:** Visit the deployed [GrowWithHR homepage](https://hrtechifyed.github.io/GrowwithHR-Version2/) in a browser with Do Not Track disabled, then open Umami's Realtime view for GrowWithHR. Complete an assessment using fictional company information and inspect Events for `assessment_started`, `assessment_completed` and `report_viewed`. Ensure event properties show only the `product` field (and `rating` after feedback); verify URL query strings and fragments are never received. A successful deploy verifies the integration is served, **not** that the authenticated Umami dashboard has accepted events.

Configure an Umami funnel: pageview → assessment_started → assessment_completed → report_viewed → feedback_submitted. Filter by the `product` property. `full_report_requested` is an optional secondary event.

## Verify real feedback receipt

Complete each assessment with **fictional** company details. Select Yes/Partly/Not yet on the personal report summary and optionally add a short, non-sensitive comment. Confirm the existing internal notification mailbox receives a message with only the product, rating and optional comment. If mail is unavailable, the form displays an error; it does not claim success or lose the user's input.

The Playwright browser test stubs the transport and checks request content and UI states; **it is not proof that a real email arrived**. The existing live smoke verifies Gmail API credentials, not an actual feedback email. Confirm one real submission before wider promotion.

## Weekly measures

- Unique visitors: Umami dashboard (once activated)
- Starts and completions: custom Umami events
- Completion % = assessment_completed / assessment_started (by product and time window; use comparable sessions/cohorts)
- Positive feedback % = (Yes + Partly) / all submitted usefulness answers
- Return engagement = return_visit counts and repeat usage (directional, not user-identified)
- Qualitative feedback: manually cluster comments without retaining confidential details in the analytics platform

Avoid reporting conversion figures until the tracker is activated and enough real traffic exists.

## Current product boundary

This is a free, non-transactional Founding Beta. Feedback is optional; the report's authenticated secure PDF process is separate. Compliance outputs remain research-grade, not legal advice or certification. No Stripe, subscription, checkout or additional paid services were added.
