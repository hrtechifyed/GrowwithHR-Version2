# GrowWithHR Data Flow

## One-sentence demo answer

**Assessment progress stays in the visitor's browser; only when email delivery is requested are recipient details, advisory data and the generated PDF sent to the GrowWithHR backend for Gmail delivery.**

## Browser flow

- Company-level and aggregated workforce answers are collected in `analyze-company.html`.
- Progress may be stored under `growwithhr-advisory-briefing-v2` for same-browser resume.
- The advisory record may be stored under `growwithhr-report` and lead/delivery metadata under their protected keys.
- The PDF is generated in the browser.
- The industry catalog cache may use `growwithhr-industry-catalog-v1` even on a clean profile.

## Delivery flow

When the visitor explicitly requests email delivery, the browser sends the recipient, required advisory data and PDF payload to `POST /api/send-advisory`. The Express backend validates size, type and required fields, applies rate limiting and calls Gmail. Sent mail and attachments may remain in the connected Gmail account under its retention settings.

## What does not exist

GrowWithHR currently has no customer account, dedicated assessment database, cloud-save service, cross-device resume, document/evidence repository or RAG conversation-history store.

## Private beta

M1-M3 diagnostics read protected assessment state without adding traceability or Compliance Story data to stable persistence.
