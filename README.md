# GrowWithHR

**Current production stack:** the deployed product is the root-level HTML, CSS and JavaScript application backed by `server.js` for optional Gmail delivery. `apps/web/src` is an archived experimental React/TypeScript UX layer; it is not built, deployed or used by the public product.

GrowWithHR is a rules-based executive HR and compliance advisory for founders, business leaders and People teams.

## Current release

- Application version: `0.18.0`
- Public assessment: `/analyze-company.html`
- Private-beta Compliance DNA route: `/analyze-company-v3.html`
- Private-beta feature flag: `complianceDnaV3: false`
- Latest published release: `v0.18.0`

The old `/assessment.html` URL redirects to the public assessment so visitors encounter one current journey.

## What is deployed

- Guided four-chapter assessment with same-browser save and resume.
- Deterministic stable advisory/report mapping.
- Browser-generated PDF download.
- Optional email delivery through the Node/Express Gmail API backend.
- M1-M3 private-beta Compliance DNA foundations: Five-Act presentation, deterministic traceability and Compliance Story presentation.

The private-beta route does not replace the public assessment and does not mutate protected report, PDF, email or delivery contracts.

## Data statement for demos

**Assessment progress stays in the visitor's browser; only when the visitor requests email delivery are recipient details, advisory data and the generated PDF sent to the GrowWithHR backend for delivery through Gmail.**

GrowWithHR currently has no customer account system, cloud-save service or dedicated assessment database. See `docs/DATA_FLOW.md` and the public privacy section in `more-info.html`.

## Repository map

- `index.html` — public homepage.
- `analyze-company.html` — stable public assessment.
- `analyze-company-v3.html` — no-index private-beta review route.
- `sample-advisory-report.html` — fictional, illustrative report.
- `server.js` — health endpoint and Gmail delivery boundary.
- `js/executive-assessment/` — stable assessment modules.
- `js/assessment-v3/` — isolated M1-M3 private-beta modules.
- `data/assessment/` and `data/schema/` — governed data and schemas.
- `tests/` — maintained contract and browser coverage.
- `apps/web/src/` — archived experiment, not production.

## Canonical documentation

- `README.md` — current deployed product and stack decision.
- `CHANGELOG.md` — authoritative release history.
- `ROADMAP.md` — authoritative future milestones.
- `docs/ARCHITECTURE.md` — deployed architecture.
- `docs/DATA_FLOW.md` — current data flow and privacy boundary.
- `docs/KNOWN_ISSUES.md` — current limitations and release blockers.
- `docs/releases/` — immutable historical release manifests and validation records.

`RELEASE_NOTES.md` and `update.md` are pointers only; they are not competing sources of truth.

## Local commands

```bash
npm install
npm run test:release
npm run test:release:e2e
npm start
```

## Security

Secrets belong only in deployment environment variables. Never commit `.env`, OAuth credentials, Gmail app passwords or refresh tokens. See `SECURITY.md`.

## Product boundary

GrowWithHR provides advisory information, not legal certification, verified compliance, evidence verification or professional legal, tax, payroll or employment advice.
