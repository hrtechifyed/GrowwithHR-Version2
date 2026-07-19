# Changelog

All notable changes to GrowWithHR are documented here.

---

## [Unreleased]

### Documentation

- Updated `docs/ARCHITECTURE.md` to reflect the current deployed architecture.
- Documented the current use of browser `localStorage`.
- Documented browser-side advisory report and PDF generation.
- Documented the Node.js and Express advisory-delivery backend.
- Documented Gmail API processing and email retention.
- Added `docs/DATA_FLOW.md`.
- Updated the public privacy explanation in `more-info.html`.
- Updated the experimental React privacy and data-handling components.
- Clarified that GrowWithHR does not currently maintain a dedicated assessment
  database.
- Clarified that same-browser progress is not a user account, cloud-save
  service or cross-device resume service.
- Added a formal approval gate for future databases, user accounts, compliance
  workspaces, document storage, evidence storage and RAG conversation history.
- Clarified that sent advisory emails and PDF attachments may remain in the
  connected Gmail account according to its retention settings.

---

## [v0.15.1-beta] - Gmail Advisory Delivery and HRTechify Brand Alignment

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

- Replaced the production EmailJS delivery path with Gmail API delivery through
  the GrowWithHR backend.
- Updated the Executive Advisory journey to support report preparation,
  download, email delivery and resend actions.
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
- Report-delivery information is sent to the backend when the user requests
  email delivery.
- The backend validates the request and sends the advisory through the Gmail
  API.
- Sent emails and PDF attachments may remain in the connected Gmail account.
- GrowWithHR does not currently intentionally save completed assessments in a
  dedicated application database.

### Known limitations

- GrowWithHR remains a beta-stage, rules-based advisory product.
- The current customer-facing report primarily focuses on the compliance
  pillar.
- Browser progress is available only in the same browser.
- Browser data may be cleared or replaced.
- GrowWithHR does not currently provide user accounts.
- GrowWithHR does not currently provide cloud-saved assessments.
- GrowWithHR does not currently provide cross-device resume.
- GrowWithHR does not currently provide a persistent customer-report database.
- GrowWithHR does not currently provide compliance evidence storage.
- GrowWithHR does not currently provide a customer compliance workspace.
- GrowWithHR does not currently provide RAG conversation-history storage.
- Sent-email retention depends on the connected Gmail account.
- Automated deletion controls for sent Gmail messages are not currently
  available.
