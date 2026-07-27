# Changelog

All notable changes to GrowWithHR are documented here.

---

## [Unreleased]

No unreleased product changes are currently recorded.

---

## [v0.20.0] - Compliance Workspace Beta

**Release Date:** 2026-07-27

### Added

- Added a private no-index browser-local Compliance Workspace route.
- Added compliance tasks with owners, descriptions, due dates, due-date source states and status history.
- Added local evidence placeholders that do not upload or store file content.
- Added browser-local calendar entries with explicit date-source states.
- Added JSON backup export and strict import validation for nested task, evidence, calendar and audit structures.
- Added isolated workspace reset using only `growwithhr-compliance-workspace-v1`.
- Added in-memory operation and user guidance when browser storage is unavailable.
- Added JSON Schema, maintained contract checks, dedicated CI and Playwright browser coverage.

### Safety and compatibility

- Kept `/analyze-company.html` as the stable public route.
- Kept private v3 and M4 routes unchanged.
- Added no server upload, account, authentication, database or cloud persistence.
- Preserved assessment, report, PDF, email and delivery contracts.
- Treated evidence entries as placeholders rather than proof of compliance.

### Validation

- GrowWithHR CI passed.
- M5 Compliance Workspace checks passed.
- Executive Assessment Tests passed, including persistence, reset and storage-unavailable coverage.
- The complete maintained release chain includes the M5 contract checks.

---

## [v0.19.0] - Explainable Intelligence and Founder Report Integration

**Release Date:** 2026-07-27

### Added

- Added separate profile-completeness, applicability-certainty and evidence-coverage dimensions.
- Added information-gain questions and a reproducible decision trace.
- Integrated governed law explanations into founder-facing Light and Dark reports.
- Rebuilt final PDF generation as a single-tier report with one contents page, one page-count system and an optional annexure.
- Added report input snapshots, stable action IDs, founder brief, evidence boundaries and future reassessment triggers.
- Added the approved Warm Wishes customer-email signature.

### Safety and compatibility

- Produced no blended compliance, health or maturity score.
- Kept the stable public route and disabled-by-default v3 flag.
- Added no cloud persistence or storage migration.

---

## [v0.18.0] - Compliance Story and Safe Health Model

**Release Date:** 2026-07-21

### Added

- Added the versioned M3 Compliance Story model and JSON Schema `1.0.0`.
- Added a private-beta executive story with a company snapshot, safe-status counts, top three priorities, grouped findings, assumptions, implications and structured sources.
- Added isolated M3 presentation styles with responsive, keyboard-focus and reduced-motion safeguards.
- Added M3 contract tests and Playwright coverage for ready, empty, error and mobile states.
- Added the M3 release manifest and rollback record.

### Safety and compatibility

- Kept `/analyze-company.html` as the stable production route.
- Kept `/analyze-company-v3.html` private and `complianceDnaV3` disabled by default.
- Preserved protected browser-storage, report, PDF, email and delivery contracts.
- Preserved deterministic M2 applicability decisions and separated applicability from evidence status.
- Added no cloud persistence, account requirement or storage migration.

### Validation

- GrowWithHR CI passed.
- Compliance Data Validation passed.
- Executive Assessment Tests passed, including M3 browser coverage.
- The complete maintained regression suite passed before the version-cut commit.

---

## [v0.15.0-beta] - Gmail Advisory Delivery and HRTechify Brand Alignment

**Release Date:** 2026-07-19

### Added

- Added a Node.js and Express backend for advisory email delivery.
- Added Gmail API integration using Google OAuth 2.0.
- Added secure delivery of personalised advisory PDF reports.
- Added HTML and plain-text customer email versions.
- Added a branded HRTechify customer email template.
- Added a personalised customer greeting and organisation name.
- Added a PDF attachment notice to the customer email.
- Added a founder signature and reply-to support.
- Added a compact HRTechify email footer bar.
- Added a centred HRTechify logo with the tagline displayed underneath:

  **People • Technology • Growth**

- Added internal assessment-completion notifications.
- Added recipient email-address validation.
- Added Base64 and PDF-signature validation.
- Added PDF attachment-size limits.
- Added safe attachment filename handling.
- Added request rate limiting for advisory email requests.
- Added the Gmail API health-check endpoint:

  ```text
  GET /api/health
  ```

- Added the advisory email-delivery endpoint:

  ```text
  POST /api/send-advisory
  ```

- Added customer report delivery with a generated PDF attachment.
- Added optional internal assessment-completion notifications.
- Added plain-text email alternatives for email-client compatibility.
- Added reply-to configuration for customer responses.
- Added operational delivery-status handling.

### Changed

- Replaced the production EmailJS delivery path with Gmail API delivery through the GrowWithHR backend.
- Updated the Executive Advisory journey to support report preparation, download, email delivery and resend actions.
- Updated recipient-information handling.
- Updated delivery-status handling.
- Improved backend request validation.
- Improved PDF attachment validation.
- Improved customer email presentation.
- Improved HRTechify branding across public pages and email content.
- Improved shared footer and site-shell consistency.

### Security and reliability

- Kept Gmail and OAuth credentials in server-side environment variables.
- Added recipient email-address validation.
- Added required-field validation.
- Added Base64 validation.
- Added PDF-signature validation.
- Added PDF attachment-size enforcement.
- Added safe attachment filename handling.
- Added request rate limiting.
- Restricted direct public access to server, package and environment files.
- Added a backend health-check endpoint for delivery configuration.
- Added error handling for advisory-delivery requests.

### Current data-handling position

- Assessment interaction primarily takes place in the browser.
- Limited progress may be stored in browser `localStorage`.
- The advisory model and PDF are prepared in the browser.
- Report-delivery information is sent to the backend when the user requests email delivery.
- The backend validates the request and sends the advisory through the Gmail API.
- Sent emails and PDF attachments may remain in the connected Gmail account.
- GrowWithHR does not currently intentionally save completed assessments in a dedicated application database.

### Known limitations

- GrowWithHR remains a beta-stage, rules-based advisory product.
- Browser progress is available only in the same browser.
- Browser data may be cleared or replaced.
- GrowWithHR does not currently provide user accounts or cloud-saved assessments.
- GrowWithHR does not currently provide cross-device resume.
- Evidence placeholders in M5 are not uploaded evidence and do not prove compliance.
- Sent-email retention depends on the connected Gmail account.