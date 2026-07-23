# Customer Email Signature Release Plan

Status: release preparation  
Prepared: 23 July 2026

This change standardises the customer advisory email closing in both plain-text and HTML output.

## Approved closing

Warm Wishes,

**Anurag Sinha**

Founder, HRTechify

https://www.linkedin.com/in/anuragsinha1009/

## Presentation contract

- The founder name uses title case, with only `A` and `S` capitalised.
- The founder name is bold in HTML.
- The closing, title and LinkedIn link inherit the same font family and 16px font size.
- The LinkedIn address is a clickable HTTPS link in HTML and remains fully visible in plain text.
- The signature is the final user-facing content in the customer email.

## Release gates

- Run the complete GrowWithHR CI suite.
- Run the Executive Assessment Playwright workflow.
- Verify the exact signature contract through a maintained static test.
- Complete one deployed assessment-to-PDF-to-email smoke test before production release.
- Confirm `REPLY_TO_EMAIL` and `INTERNAL_NOTIFICATION_EMAIL` behaviour in the deployed environment.

## Version position

The canonical application version remains `0.18.0` on this preparation branch. A coordinated version cut or tag remains a separate release decision so package, application, visible labels and release evidence can be advanced together.

## Rollback

Revert the signature preparation pull request. No browser state, report schema, PDF contract or customer data migration is involved.
