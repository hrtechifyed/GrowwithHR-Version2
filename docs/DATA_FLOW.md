# GrowWithHR Data Flow

## One-sentence demo answer

**Assessment progress and report-style preference stay in the visitor's browser; only when email delivery is requested are recipient details, advisory data and the selected generated PDF sent to the GrowWithHR backend for Gmail delivery.**

## Browser flow

- Company-level and aggregated workforce answers are collected in `analyze-company.html`.
- One Person Company selection fixes the employee count at one; all other employee counts are normalised to a minimum of one before report preparation.
- Progress may be stored under `growwithhr-advisory-briefing-v2` for same-browser resume.
- The advisory record may be stored under `growwithhr-report` and lead/delivery metadata under their protected keys.
- The selected light or dark report style may be stored under `growwithhr-report-theme`.
- The advisory model and selected PDF are generated in the browser.
- Static template resources are downloaded directly from `resources/`; GrowWithHR does not receive the user's later edits to those files.
- The industry catalog cache may use `growwithhr-industry-catalog-v1` even on a clean profile.

## Delivery flow

When the visitor explicitly requests email delivery, the browser sends the recipient, required advisory data and the selected PDF payload to `POST /api/send-advisory`. On GitHub Pages, the frontend sends the request to the Render API over HTTPS; Render permits only the configured frontend origin and rejects unapproved cross-origin API requests. The Express backend validates size, type and required fields, applies rate limiting and calls Gmail. Sent mail and attachments may remain in the connected Gmail account under its retention settings.

No Gmail or OAuth credential is present in the browser request or static GitHub Pages files. Credentials remain in Render environment variables.

## What does not exist

GrowWithHR currently has no customer account, dedicated assessment database, cloud-save service, cross-device resume, document/evidence repository or RAG conversation-history store.

## Private beta

M1-M3 diagnostics read protected assessment state without adding traceability or Compliance Story data to stable persistence.
