# GrowWithHR File Overview

This document describes the major files and folders in the current GrowWithHR
repository.

The project combines:

- a static browser-based assessment experience;
- limited browser persistence;
- browser-side PDF generation;
- a Node.js and Express backend;
- Gmail API delivery;
- structured HR and compliance data;
- automated tests;
- an experimental React and TypeScript UX layer.

---

## Primary Application Entry Points

- `index.html` — Main GrowWithHR landing page. It contains the homepage content,
  Executive Intelligence presentation, calls to action, links to the
  assessment, sample advisory, official sources and supporting pages.

- `analyze-company.html` — Current primary Executive Advisory assessment
  experience. It loads the shared design system, advisory briefing stylesheet,
  PDF generation, Gmail delivery and `js/executive-assessment.js`.

- `executive-advisory-report.html` — Dynamic advisory report page that renders
  prepared report data using `js/executive-advisory-report.js`.

- `sample-advisory-report.html` — Static example of the advisory output. It also
  supports sample PDF generation through `js/sample-advisory-pdf.js`.

- `official-resources.html` — Public page for official government, statutory and
  legal-reference links.

- `more-info.html` — Public About, privacy, data-handling and contact
  information.

---

## Supporting and Retained Pages

- `assessment.html` — Older or alternate assessment interface retained for
  compatibility and reference. The current primary route is
  `analyze-company.html`.

- `advisory-dashboard.html` — Earlier dashboard-style output using compliance,
  people, growth, expansion, rendering and PDF helpers.

- `growth-roadmap.html` — Supporting organisation growth-readiness page.

- `compliance-roadmap.html` — Supporting compliance roadmap page.

- `people-roadmap.html` — Supporting people-foundations page.

- `pages/company-profile.html` — Company-profile form and storage flow retained
  from the broader platform architecture.

- `pages/organization-profile.html` — Organisation-profile form and persistence
  flow.

---

## Backend and Email Delivery

### `server.js`

Main Node.js and Express server.

It:

- serves the static website;
- exposes `GET /api/health` for Gmail API configuration and deployment checks;
- exposes `POST /api/send-advisory` for customer delivery and internal
  notifications;
- validates recipient email addresses;
- validates required request fields;
- validates Base64 and PDF data;
- validates the PDF signature;
- limits PDF attachments to 8 MB;
- sanitises PDF filenames;
- builds MIME email messages with plain-text and HTML alternatives;
- sends messages using the Gmail API and Google OAuth 2.0;
- applies request rate limiting;
- produces operational logs;
- blocks direct public access to server, package, environment and dependency
  files.

### Supporting server files

- `package.json` — Node.js package metadata, runtime dependencies, commands and
  test scripts. The server entry point is `server.js`.

- `package-lock.json` — Locked dependency versions used for reproducible
  installations.

- `.env.example` — Safe placeholder list for Gmail, OAuth and notification
  environment variables. Real secret values must not be committed.

- `.gitignore` — Prevents environment files, dependencies and common generated
  files from being committed.

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

`PORT` is mainly used for local or hosted server configuration. The deployment
platform may supply it automatically.

---

## Browser State, Persistence and Delivery

### `js/executive-assessment.js`

Main controller for the current advisory assessment.

It manages:

- multi-stage assessment questions;
- answer validation;
- review summaries;
- browser-based progress;
- prepared report state;
- recipient details;
- advisory model preparation;
- PDF preparation and download;
- Gmail API delivery;
- resend actions;
- delivery-status records;
- save, resume and restart behaviour.

Current browser-storage keys include:

```text
growwithhr-advisory-briefing-v2
growwithhr-report
growwithhr-lead
growwithhr-advisory-delivery-v1
growwithhr-industry-catalog-v1
```

Browser persistence is limited to the same browser.

It is not:

- a customer account;
- a cloud-save facility;
- a cross-device persistence service;
- a dedicated assessment database.

Future changes to the assessment-answer structure should introduce:

- schema versioning;
- restored-data validation;
- migration where practical;
- safe reset where migration is impossible;
- clear separation between current and legacy state.

### `js/gmail-service.js`

Browser-side delivery client for:

```text
POST /api/send-advisory
```

It may serialise and send:

- recipient information;
- assessment answers;
- report data;
- generated PDF data;
- attachment information;
- delivery metadata.

### `js/pdf.js`

Branded advisory PDF builder.

It:

- exposes `window.GrowWithHRPDF`;
- creates the PDF model;
- generates the document using jsPDF;
- supports browser download;
- supplies PDF content for email delivery;
- preserves older helper names where required for compatibility.

### `js/executive-advisory-report.js`

Renders the dynamic advisory report page using prepared report data.

### `js/sample-advisory-pdf.js`

Generates the downloadable PDF for the sample advisory page.

---

## Main Browser JavaScript

- `js/site-shell.js` — Shared HRTechify header, navigation, active states,
  mobile menu and footer.

- `js/build-marker.js` — Deployed or static build marker for troubleshooting and
  browser validation.

- `js/intro-sequence.js` — Homepage introductory story and Executive
  Intelligence sequence.

- `app.js` — Main module bootstrap for the broader GrowWithHR homepage and data
  platform.

- `js/bootstrap.js` — Application startup and module-registration helper.

- `js/config/app-config.js` — Central product name, version, release name,
  website, support email and copyright configuration.

- `js/intelligence-core.js` — Shared intelligence and rules helpers used by the
  wider platform.

---

## Supporting Browser JavaScript

- `js/helpers.js` — Shared formatting and utility helpers.

- `js/renderer.js` — Dashboard and content-rendering functions.

- `js/dashboard.js` — Dashboard interaction and orchestration.

- `js/compliance.js` — Earlier compliance flow used by dashboard pages.

- `js/people.js` — People-foundation logic used by supporting pages.

- `js/growth.js` — Growth-readiness logic.

- `js/expansion.js` — State and expansion analysis helpers.

- `js/company-dna.js` — Earlier Company DNA helpers.

- `js/sticky-card-debug.js` — Development and debugging support for sticky-card
  behaviour.

- `js/old-email-service.js` — Retained legacy EmailJS implementation. The
  current delivery path uses `js/gmail-service.js` and `server.js`.

---

## Advisory, Company, Core and Domain Modules

### Advisory modules

- `js/advisor/**` — Advisory orchestration, mapping, prompts, repositories,
  services, templates and report helpers.

### Company modules

- `js/company/company.js` — Company-profile model and operations.

- `js/company/company-storage.js` — Browser persistence for company
  information.

- `js/company/organization-profile.js` — Organisation-profile interface logic.

### Core intelligence modules

- `js/core/**` — Reusable platform infrastructure including:
  - AI and context preparation;
  - cache and persistence helpers;
  - Company DNA logic;
  - error and logging utilities;
  - event bus and notification engine;
  - intelligence engine and intelligence graph;
  - knowledge-library access;
  - recommendation generation and prioritisation;
  - report and rule engines;
  - schema and validation utilities.

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

Each domain folder may contain files such as:

```text
engine.js
index.js
mapper.js
report.js
repository.js
rules.js
service.js
templates.js
validator.js
```

---

## CSS and Design System

- `styles.css` — Main stylesheet entry point.

- `backupstyles.css` — Older consolidated stylesheet retained as backup or
  reference.

- `css/00-design-system.css` — Additional design-system definitions.

- `css/01-variables.css` — Shared tokens, colours, sizing and responsive
  variables.

- `css/02-base.css` — Base elements and reset styling.

- `css/03-typography.css` — Typography system.

- `css/04-layout.css` — Shared layout utilities.

- `css/05-navbar.css` — Original and shared navigation styling.

- `css/06-hero.css` — Homepage hero and Executive Intelligence styling.

- `css/07-homepage.css` — Homepage sections and cards.

- `css/08-assessment.css` — Earlier assessment components.

- `css/09-dashboard.css` — Dashboard styling.

- `css/10-modal.css` — Modal and dialog styling.

- `css/11-responsive.css` — Shared responsive adjustments.

- `css/12-executive-assessment.css` — Older executive-assessment interface
  styling.

- `css/13-intro-experience.css` — Intro and story-sequence presentation.

- `css/14-executive-advisory.css` — Advisory-report styling.

- `css/15-print.css` — Print stylesheet placeholder.

- `css/16-homepage-refresh.css` — Updated homepage presentation and responsive
  fixes.

- `css/17-advisory-briefing.css` — Current page-scoped styling for
  `analyze-company.html`.

- `css/18-site-shell.css` — Shared header, navigation, footer, mobile menu,
  accessibility and print visibility.

---

## Data and Knowledge Base

### Main reference data

- `data/industries.json` — Main industry list used by the assessment.

- `data/states.json` — Indian state and union-territory reference data.

- `data/entity-types.json` — Entity-type reference data.

- `data/official-resources.json` — Official-source registry displayed by the
  public resources page.

- `data/resources.json` — Additional resource metadata.

- `data/live-updates.json` — Live update metadata.

- `data/updates.json` — Update metadata.

- `data/update-history.json` — Update-history and verification metadata.

- `data/state-expansion-data.js` — State-expansion information used by earlier
  dashboard flows.

### Company, rules and schemas

- `data/company/**` — Company defaults and sample or current company-profile
  data.

- `data/compliance-engine.json` — Compliance-engine definitions.

- `data/compliance-rules.json` — Compliance rule definitions.

- `data/requirements/requirements.json` — Requirement definitions.

- `data/schema/rule-schema.json` — Rule structure and validation schema.

### Reference lists

- `data/reference/business-nature.json`
- `data/reference/entity-types.json`
- `data/reference/establishment-types.json`
- `data/reference/industries.json`
- `data/reference/organization-status.json`
- `data/reference/work-models.json`

### Compliance knowledge base

- `data/knowledge-base/laws/central/**` — Central labour and employment law
  content.

- `data/knowledge-base/laws/states/**` — State and union-territory law and
  reference files.

- `data/knowledge-base/entities/**` — Entity-related knowledge content.

- `data/knowledge-base/industries/**` — Industry-specific knowledge content.

- `data/knowledge-base/metadata/**` — Knowledge-base constants, schema version
  and version metadata.

- `data/knowledge-base/source-registry.json` — Main source registry.

- `data/knowledge-base/sources/**` — Source and citation records.

---

## Current Compliance-Engine Boundary

The current and planned compliance architecture should distinguish between:

1. Company facts supplied or confirmed by the user.
2. Facts inferred from structured answers.
3. Rules that determine possible legal applicability.
4. Compliance obligations produced by those rules.
5. Evidence supplied for those obligations.
6. Verification status.
7. Explanations and official-source citations.

The rules engine should determine applicability.

Future RAG features may explain, retrieve sources and answer follow-up
questions, but must not independently invent or decide legal applicability.

---

## Experimental React and TypeScript UX Layer

The `apps/web/src` directory contains an experimental React and
Next.js-ready UX layer.

It is not the primary deployed application shell.

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

- `components/UX/Assessment/WizardForm.tsx` — Wizard-style assessment
  component.

- `components/UX/Forms/LeadCaptureForm.tsx` — React lead-capture component.

- `components/UX/Reports/PersonalizedReportGenerator.tsx` — Rules-based React
  report generator.

- `components/UX/Privacy/DataHandling.tsx` — Browser, backend and Gmail
  processing explanation.

- `components/UX/Privacy/PrivacyPolicy.tsx` — Detailed privacy and retention
  page.

- `stores/assessmentStore.ts` — Zustand assessment store.

- `hooks/useSessionPersistence.ts` — Experimental persistence hook.

- `services/sessionPersistenceService.ts` — Experimental session-persistence
  service.

Privacy and persistence copy in this experimental layer must remain aligned
with the deployed static application.

Experimental files must not be treated as proof of deployed behaviour unless
they are connected to the production application.

---

## RAG Research Scaffold

- `growwithhr-rag/**` — Early retrieval-augmented-generation research scaffold
  containing configuration, prompts, notebooks, Python source, requirements
  and test placeholders.

Most files in this folder are placeholders and must not be treated as a
production RAG implementation.

RAG should be introduced only after the following are defined:

- deterministic applicability rules;
- source traceability;
- document-update procedures;
- model-processing disclosures;
- privacy and retention controls;
- prompt and conversation storage rules;
- tenant isolation;
- deletion and export procedures.

---

## Testing and Validation

- `jest.config.js` — Jest configuration for React and TypeScript UX tests.

- `playwright.config.ts` — Playwright end-to-end configuration.

- `tests/frontend-production-checks.js` — Static and frontend production
  checks.

- `tests/assessment-journey-checks.js` — Assessment journey validation.

- `tests/report-dynamic-scenarios.js` — Dynamic report scenario tests.

- `tests/requirements-static-check.js` — Repository and static-requirement
  checks.

- `tests/tsx-transformer.js` — Jest TypeScript and TSX transform helper.

- `tests/e2e/**` — Playwright tests for the advisory assessment, scenes, user
  details, homepage stacking and Analyze Company flow.

- `tests/playwright/growwithhr-ui.spec.js` — Additional UI-regression checks.

- `apps/web/src/components/UX/__tests__/**` — React component unit tests.

### Test commands documented in the repository

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

- `scripts/scrape-updates.js` — Rewrites
  `data/official-resources.json` with the current verification date and
  configured official-source list.

Future version-synchronisation scripts should:

- use `package.json` as the canonical current-version source;
- update only approved current-version markers;
- avoid rewriting historical changelog entries;
- fail when required version markers are missing;
- provide a version-consistency check.

---

## Documentation and Release Files

### Root documentation

- `README.md` — Main project introduction, current feature summary, deployment
  notes and security and privacy overview.

- `FILES_OVERVIEW.md` — This repository guide.

- `CHANGELOG.md` — Version history.

- `RELEASE_NOTES.md` — Release-specific notes.

- `ROADMAP.md` — Product and implementation roadmap.

- `PLAYWRIGHT_TEST_PLAN.md` — End-to-end testing plan.

- `RESPONSIVE_MANUAL_TEST_MATRIX.md` — Manual responsive-device test matrix.

- `update.md` — Additional working and update notes.

### `docs/` directory

- `docs/ARCHITECTURE.md` — Current system architecture covering browser
  persistence, report generation, backend delivery, Gmail API processing and
  future persistence gates.

- `docs/DATA_FLOW.md` — Current data categories, browser storage, backend
  transmission, Gmail processing, retention position and future persistence
  checklist.

- `docs/DESIGN_SYSTEM.md` — Design-system notes.

- `docs/IMPLEMENTATION_SUMMARY.md` — Implementation summary.

- `docs/INTRO_EXPERIENCE_V2_MASTER_PLAN.md` — Intro experience, product
  direction, traceability and responsive plan.

- `docs/RESPONSIVE_REPAIR_AUDIT.md` — Responsive-layout audit.

- `docs/STACKED_CARDS_ADVISORY_AUDIT.md` — Stacked-card and advisory interaction
  audit.

- `docs/TESTING_CHECKLIST.md` — Manual and functional testing checklist.

- `docs/UX_DECISIONS.md` — UX decisions and rationale.

- `docs/KNOWN_ISSUES.md` — Known limitations and issues.

- `docs/CONTRIBUTING.md` — Contribution guidance.

---

## Assets

- `assets/hrtechify-logo.png` — HRTechify logo used by the shared site shell,
  public pages, report output and branded email.

---

## Current End-to-End Advisory Flow

```text
Visitor opens analyze-company.html
        |
        v
js/executive-assessment.js manages the assessment
        |
        +--> localStorage supports same-browser continuity
        |
        v
js/pdf.js builds the personalised advisory PDF
        |
        v
js/gmail-service.js posts recipient, report, answers and PDF
        |
        v
server.js validates the request and attachment
        |
        v
Gmail API sends the customer email and optional internal notification
```

---

## Current Data-Handling Position

GrowWithHR currently uses:

- browser memory;
- limited browser `localStorage`;
- browser-side report and PDF generation;
- a backend delivery request;
- Gmail API processing;
- Gmail sent-message and attachment retention;
- operational application or hosting logs.

GrowWithHR does not currently use:

- a dedicated assessment database;
- user accounts;
- cloud-saved assessments;
- cross-device resume;
- a customer compliance workspace;
- compliance evidence storage;
- CRM synchronisation;
- Google Drive storage;
- RAG conversation-history storage.

See:

```text
docs/ARCHITECTURE.md
docs/DATA_FLOW.md
more-info.html
```

---

## Future Persistence Gate

Before introducing a database, customer accounts, document uploads, compliance
evidence, CRM data, analytics profiles or RAG conversation history, update:

```text
docs/ARCHITECTURE.md
docs/DATA_FLOW.md
more-info.html
apps/web/src/components/UX/Privacy/DataHandling.tsx
apps/web/src/components/UX/Privacy/PrivacyPolicy.tsx
README.md
CHANGELOG.md
RELEASE_NOTES.md
```

The new persistence design must define:

- purpose;
- data fields;
- access controls;
- consent or lawful processing basis;
- encryption;
- retention;
- deletion;
- tenant isolation;
- audit logs;
- backup and recovery;
- schema migration;
- rollback.

---

## Legacy and Cleanup Notes

The repository intentionally retains older or experimental paths alongside the
current experience:

- `assessment.html` and `css/12-executive-assessment.css` represent an older
  assessment UI.

- `advisory-dashboard.html` and roadmap pages represent earlier flows.

- `js/old-email-service.js` is the previous EmailJS implementation.

- `backupstyles.css` is a retained backup stylesheet.

- `growwithhr-rag/**` is an incomplete research scaffold.

- `apps/web/src/**` is experimental and is not yet the deployed Next.js
  application.

These files should be reviewed before a future stable release so that active,
legacy, experimental and archival code are clearly separated.

---

## Version Alignment

The current application version should be sourced from:

```text
package.json
```

It should remain aligned with:

```text
package-lock.json
js/config/app-config.js
README.md
RELEASE_NOTES.md
ROADMAP.md
public page footers
build markers
current architecture documentation where a version is displayed
```

Historical version entries in `CHANGELOG.md` must not be rewritten by automatic
version synchronisation.

---

## Brand Footer

```text
© 2026 HRTechify. All Rights Reserved. People • Technology • Growth
```
