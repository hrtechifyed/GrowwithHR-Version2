# GrowWithHR File Overview

This document describes the major files and folders in the current GrowWithHR repository snapshot. The project now combines a static browser-based assessment experience, browser-side PDF generation, a Node.js/Express backend, Gmail API delivery, structured HR/compliance data, automated tests, and an experimental React/TypeScript UX layer.

---

## Primary Application Entry Points

- `index.html` — Main GrowWithHR landing page. It contains the homepage content, Executive Intelligence presentation, calls to action, links to the assessment, sample advisory, official sources, and supporting pages.
- `analyze-company.html` — Current primary Executive Advisory assessment experience. It loads the shared design system, the advisory briefing stylesheet, PDF generation, Gmail delivery, and `js/executive-assessment.js`.
- `executive-advisory-report.html` — Dynamic advisory report page that renders previously prepared report data using `js/executive-advisory-report.js`.
- `sample-advisory-report.html` — Static example of the advisory output. It also supports sample PDF generation through `js/sample-advisory-pdf.js`.
- `official-resources.html` — Public page for official government, statutory, and legal-reference links.
- `more-info.html` — About, privacy, and contact information used by the shared navigation.

## Supporting and Retained Pages

- `assessment.html` — Older/alternate assessment interface retained for compatibility and reference. The current primary assessment route is `analyze-company.html`.
- `advisory-dashboard.html` — Earlier dashboard-style output using compliance, people, growth, expansion, rendering, and PDF helpers.
- `growth-roadmap.html` — Supporting organisation growth-readiness page.
- `compliance-roadmap.html` — Supporting compliance roadmap page.
- `people-roadmap.html` — Supporting people-foundations page.
- `pages/company-profile.html` — Company-profile form and storage flow retained from the broader platform architecture.
- `pages/organization-profile.html` — Organisation-profile form and persistence flow.

---

## Backend and Email Delivery

- `server.js` — Main Node.js/Express server. It:
  - Serves the static website.
  - Exposes `GET /api/health` for Gmail API configuration and deployment checks.
  - Exposes `POST /api/send-advisory` for customer delivery and internal notifications.
  - Validates recipient email addresses and PDF data.
  - Limits PDF attachments to 8 MB.
  - Builds MIME email messages with plain-text and HTML alternatives.
  - Sends messages using the Gmail API and Google OAuth 2.0.
  - Applies request rate limiting.
  - Blocks direct public access to server, package, environment, and dependency files.

- `package.json` — Node.js package metadata, runtime dependencies, start commands, and test scripts. The server entry point is `server.js` and the required Node version is 20 or newer.
- `.env.example` — Safe placeholder list for the required Gmail/OAuth and notification environment variables. Real secret values must not be committed.
- `.gitignore` — Prevents local environment files, dependencies, and common generated files from being committed.

### Required server environment variables

```text
GMAIL_USER
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REFRESH_TOKEN
INTERNAL_NOTIFICATION_EMAIL
REPLY_TO_EMAIL
PORT
```

`PORT` is mainly for local development; the deployment platform can supply it automatically.

---

## Main Browser JavaScript

- `js/executive-assessment.js` — Main controller for the current advisory assessment. It manages:
  - Multi-stage assessment questions.
  - Validation and review.
  - Browser-based progress and report state.
  - Recipient details.
  - Advisory model preparation.
  - PDF preparation and download.
  - Gmail API delivery and customer resend actions.
  - Delivery-status records.

- `js/gmail-service.js` — Browser-side client for `/api/send-advisory`. It serialises the lead, report, answers, and generated PDF; posts them to the backend; and exposes `window.GrowWithHREmail`.
- `js/pdf.js` — Branded advisory PDF builder. It exposes `window.GrowWithHRPDF`, creates the PDF model, generates the document with jsPDF, supports downloads, and preserves older PDF helper names for compatibility.
- `js/executive-advisory-report.js` — Renders the dynamic advisory report page from available report data.
- `js/sample-advisory-pdf.js` — Generates the downloadable PDF for the sample advisory page.
- `js/site-shell.js` — Creates the shared HRTechify header, navigation, active states, mobile menu, and shared footer across public pages.
- `js/build-marker.js` — Exposes the deployed/static build marker for troubleshooting and browser validation.
- `js/intro-sequence.js` — Controls the homepage introductory story and Executive Intelligence sequence.
- `app.js` — Main module bootstrap for the broader GrowWithHR homepage/data platform.
- `js/bootstrap.js` — Application startup and module registration helper.
- `js/config/app-config.js` — Central product name, version, release name, website, support email, and copyright configuration.
- `js/intelligence-core.js` — Shared intelligence and rules helpers used by the wider platform.

## Supporting Browser JavaScript

- `js/helpers.js` — Shared formatting and utility helpers.
- `js/renderer.js` — Dashboard and content-rendering functions.
- `js/dashboard.js` — Dashboard interaction and orchestration.
- `js/compliance.js` — Earlier compliance flow used by the dashboard pages.
- `js/people.js` — People-foundation logic used by supporting pages.
- `js/growth.js` — Growth-readiness logic.
- `js/expansion.js` — State/expansion analysis helpers.
- `js/company-dna.js` — Earlier Company DNA helpers.
- `js/sticky-card-debug.js` — Development/debug support for sticky-card behaviour.
- `js/old-email-service.js` — Retained legacy EmailJS implementation. The current production delivery path uses `js/gmail-service.js` and `server.js` instead.

---

## Advisory, Company, Core, and Domain Modules

### Advisory modules

- `js/advisor/**` — Advisory orchestration, mapping, prompts, repositories, services, templates, and report helpers.

### Company modules

- `js/company/company.js` — Company-profile model and operations.
- `js/company/company-storage.js` — Browser persistence for company information.
- `js/company/organization-profile.js` — Organisation-profile interface logic.

### Core intelligence modules

- `js/core/**` — Reusable platform infrastructure including:
  - AI/context preparation.
  - Cache and persistence helpers.
  - Company DNA logic.
  - Error and logging utilities.
  - Event bus and notification engine.
  - Intelligence engine and intelligence graph.
  - Knowledge-library access.
  - Recommendation generation and prioritisation.
  - Report and rule engines.
  - Schema and validation utilities.

### Domain modules

- `js/modules/compliance/**`
- `js/modules/culture/**`
- `js/modules/hiring/**`
- `js/modules/leadership/**`
- `js/modules/learning/**`
- `js/modules/organization/**`
- `js/modules/performance/**`
- `js/modules/policy/**`
- `js/modules/rewards/**`
- `js/modules/talent/**`

Each domain folder follows a similar structure using files such as `engine.js`, `index.js`, `mapper.js`, `report.js`, `repository.js`, `rules.js`, `service.js`, `templates.js`, and `validator.js`.

---

## CSS and Design System

- `styles.css` — Main stylesheet entry point. It imports the modular CSS files used by the public experience.
- `backupstyles.css` — Older consolidated stylesheet retained as a backup/reference file.
- `css/00-design-system.css` — Additional design-system definitions.
- `css/01-variables.css` — Shared tokens, colours, sizing, and responsive variables.
- `css/02-base.css` — Base element and reset styling.
- `css/03-typography.css` — Typography system.
- `css/04-layout.css` — Shared layout utilities.
- `css/05-navbar.css` — Original/shared navigation styling.
- `css/06-hero.css` — Homepage hero and Executive Intelligence styling.
- `css/07-homepage.css` — Homepage sections and cards.
- `css/08-assessment.css` — Earlier assessment components.
- `css/09-dashboard.css` — Dashboard styling.
- `css/10-modal.css` — Modal and dialog styling.
- `css/11-responsive.css` — Shared responsive adjustments.
- `css/12-executive-assessment.css` — Older executive-assessment interface styling.
- `css/13-intro-experience.css` — Intro/story sequence presentation.
- `css/14-executive-advisory.css` — Advisory-report styling.
- `css/15-print.css` — Print stylesheet placeholder.
- `css/16-homepage-refresh.css` — Updated homepage presentation and responsive fixes.
- `css/17-advisory-briefing.css` — Current page-scoped styling for `analyze-company.html`.
- `css/18-site-shell.css` — Shared header, navigation, footer, mobile-menu, accessibility, and print visibility styling.

---

## Data and Knowledge Base

### Main reference data

- `data/industries.json` — Main industry list used by the assessment.
- `data/states.json` — Indian state and union territory reference data.
- `data/entity-types.json` — Entity-type data.
- `data/official-resources.json` — Official-source registry displayed by the public resources page.
- `data/resources.json` — Additional resource metadata.
- `data/live-updates.json`, `data/updates.json`, and `data/update-history.json` — Update and verification metadata.
- `data/state-expansion-data.js` — State expansion information used by the dashboard flow.

### Company, rules, and schemas

- `data/company/**` — Company defaults and sample/current company-profile data.
- `data/compliance-engine.json` and `data/compliance-rules.json` — Compliance-engine definitions and rules.
- `data/requirements/requirements.json` — Requirement definitions.
- `data/schema/rule-schema.json` — Rule structure/schema.

### Reference lists

- `data/reference/business-nature.json`
- `data/reference/entity-types.json`
- `data/reference/establishment-types.json`
- `data/reference/industries.json`
- `data/reference/organization-status.json`
- `data/reference/work-models.json`

### Compliance knowledge base

- `data/knowledge-base/laws/central/**` — Central labour and employment law content, including EPFO, ESIC, gratuity, maternity benefit, POSH, bonus, apprentices, contract labour, and related subjects.
- `data/knowledge-base/laws/states/**` — State and union-territory specific law/reference files.
- `data/knowledge-base/entities/**` — Entity-related knowledge content.
- `data/knowledge-base/industries/**` — Industry-specific knowledge content.
- `data/knowledge-base/metadata/**` — Knowledge-base constants, schema version, and version metadata.
- `data/knowledge-base/source-registry.json` and `data/knowledge-base/sources/**` — Source and citation registries.

---

## Experimental React/TypeScript UX Layer

The `apps/web/src` directory contains an experimental React/Next.js-ready UX layer. It is not the primary deployed application shell.

```text
apps/web/src/
├── components/UX/
│   ├── Animations/
│   ├── Assessment/
│   ├── Forms/
│   ├── Privacy/
│   ├── Reports/
│   ├── __tests__/
│   └── examples/
├── hooks/
├── services/
├── stores/
└── types/
```

Important files include:

- `Assessment/WizardForm.tsx` — Wizard-style assessment component.
- `Forms/LeadCaptureForm.tsx` — React lead-capture component.
- `Reports/PersonalizedReportGenerator.tsx` — Rules-based React report generator.
- `Privacy/DataHandling.tsx` and `Privacy/PrivacyPolicy.tsx` — Privacy and data-handling UI.
- `stores/assessmentStore.ts` — Zustand assessment store.
- `hooks/useSessionPersistence.ts` and `services/sessionPersistenceService.ts` — Experimental session-persistence layer.

---

## RAG Research Scaffold

- `growwithhr-rag/**` — Early retrieval-augmented-generation research scaffold containing configuration, prompt, notebook, Python source, requirements, and test placeholders.

Most files in this folder are currently placeholders and should not be treated as a production RAG implementation.

---

## Testing and Validation

- `jest.config.js` — Jest configuration for React/TypeScript UX tests.
- `playwright.config.ts` — Playwright end-to-end test configuration.
- `tests/frontend-production-checks.js` — Static/frontend production checks.
- `tests/assessment-journey-checks.js` — Assessment journey validation.
- `tests/report-dynamic-scenarios.js` — Dynamic report scenario tests.
- `tests/requirements-static-check.js` — Repository and footer/static requirement checks.
- `tests/tsx-transformer.js` — Jest TypeScript/TSX transform helper.
- `tests/e2e/**` — Playwright tests for the advisory assessment, scenes, user details, homepage stacking, and the current Analyze Company experience.
- `tests/playwright/growwithhr-ui.spec.js` — Additional UI regression checks.
- `apps/web/src/components/UX/__tests__/**` — React component unit tests.

### Test commands

```text
npm test
npm run test:frontend
npm run test:journeys
npm run test:ux
npm run test:e2e
npm run test:advisory
```

---

## Scripts

- `scripts/scrape-updates.js` — Rewrites `data/official-resources.json` with the current verification date and the configured official-source list.

---

## Documentation and Release Files

### Root documentation

- `README.md` — Main project introduction, current feature summary, deployment notes, and security/privacy overview.
- `FILES_OVERVIEW.md` — This repository guide.
- `CHANGELOG.md` — Version history.
- `RELEASE_NOTES.md` — Release-specific notes.
- `ROADMAP.md` — Product and implementation roadmap.
- `PLAYWRIGHT_TEST_PLAN.md` — End-to-end testing plan.
- `RESPONSIVE_MANUAL_TEST_MATRIX.md` — Manual responsive-device test matrix.
- `update.md` — Additional working/update notes.

### `docs/` directory

- `docs/ARCHITECTURE.md` — Architecture documentation.
- `docs/DESIGN_SYSTEM.md` — Design-system notes.
- `docs/IMPLEMENTATION_SUMMARY.md` — Implementation summary.
- `docs/INTRO_EXPERIENCE_V2_MASTER_PLAN.md` — Intro experience, product direction, traceability, and responsive plan.
- `docs/RESPONSIVE_REPAIR_AUDIT.md` — Responsive layout audit.
- `docs/STACKED_CARDS_ADVISORY_AUDIT.md` — Stacked-card and advisory interaction audit.
- `docs/TESTING_CHECKLIST.md` — Manual and functional testing checklist.
- `docs/UX_DECISIONS.md` — UX decisions and rationale.
- `docs/KNOWN_ISSUES.md` — Known limitations and issues.
- `docs/CONTRIBUTING.md` — Contribution guidance.

---

## Assets

- `assets/hrtechify-logo.png` — HRTechify logo used by the shared site shell, pages, generated report output, and branded email content.

---

## Current End-to-End Advisory Flow

```text
Visitor opens analyze-company.html
        ↓
js/executive-assessment.js manages the assessment
        ↓
js/pdf.js builds the personalised advisory PDF
        ↓
js/gmail-service.js posts the lead, report, answers, and PDF
        ↓
server.js validates the request and attachment
        ↓
Gmail API sends the customer email and optional internal notification
```

---

## Legacy and Cleanup Notes

The repository intentionally retains several older or experimental paths alongside the current experience:

- `assessment.html` and `css/12-executive-assessment.css` represent an older assessment UI.
- `advisory-dashboard.html` and the roadmap pages represent earlier product flows.
- `js/old-email-service.js` is the previous EmailJS delivery implementation and is not the current Gmail API path.
- `backupstyles.css` is a retained backup stylesheet.
- `growwithhr-rag/**` is an incomplete research scaffold.
- `apps/web/src/**` is experimental and is not yet the deployed Next.js application.

These files should be reviewed before a future stable release so that active, legacy, experimental, and archival code are clearly separated.

---

## Version Alignment

Target release documentation: `v0.15.0-beta`

The uploaded repository snapshot still contains `0.14.1-beta` in `package.json` and `js/config/app-config.js`. Update both version values to `0.15.0-beta` before creating the `v0.15.0-beta` GitHub tag and release.

---

## Brand Footer

```text
© 2026 HRTechify. All Rights Reserved. People • Technology • Growth
```
