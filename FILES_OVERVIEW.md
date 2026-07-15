# GrowWithHR File Overview

This document explains the major files and folders in the GrowWithHR public assessment and executive advisory tool.

## Entry Pages

- `index.html` — Main landing page with homepage sections, navigation, carousel, calls to action and links into the assessment and reference pages.
- `assessment.html` — Executive Assessment experience. It contains the screen shells and HTML templates used by `js/executive-assessment.js`.
- `executive-advisory-report.html` — Dynamic Executive Advisory report page. It reads assessment responses from browser storage and renders the personalised advisory.
- `sample-advisory-report.html` — Static sample advisory that demonstrates the final report format without using visitor input.
- `official-resources.html` — Dedicated page for official government and statutory reference links.
- `analyze-company.html` — Earlier company analysis flow retained in the project for compatibility.
- `growth-roadmap.html`, `compliance-roadmap.html`, `advisory-dashboard.html` — Supporting roadmap/dashboard pages retained for existing product flows.

## JavaScript

- `js/executive-assessment.js` — Runs the multi-step assessment, validation, review screen, recipient capture, local storage and report navigation.
- `js/executive-advisory-report.js` — Generates the personalised Executive Advisory sections from assessment responses.
- `app.js` — Legacy/module bootstrap for broader GrowWithHR data loading and platform initialization.
- `js/bootstrap.js` and `js/config/app-config.js` — Application startup and product configuration.
- `js/intelligence-core.js` — Shared intelligence helpers used by product modules.
- `js/pdf.js` — PDF/print-related helper logic.
- `js/modules/**` — Domain modules for compliance, hiring, organisation, leadership, learning, rewards, culture and performance.
- `js/advisor/**` — Advisory service, prompts, mapper, repository and report helpers.
- `js/company/**` and `js/core/**` — Company profile, persistence, rule, recommendation and report engine utilities.

## CSS

- `styles.css` — Main consolidated styling used by the landing, advisory and resource pages.
- `css/01-variables.css` to `css/15-print.css` — Modular design system files for variables, layout, navigation, homepage, assessment, advisory, responsiveness and print handling.

## Data

- `data/industries.json` — Industry reference data used by assessment and compliance logic.
- `data/states.json` — Indian state and union territory reference list.
- `data/official-resources.json` — Official source link registry rendered by `official-resources.html`.
- `data/knowledge-base/**` — Central and state law knowledge-base content used by compliance intelligence.
- `data/reference/**` — Reference lists for industries, entity types, work models, business nature and organization status.
- `data/company/**`, `data/requirements/**`, `data/schema/**` — Defaults, requirements and rule schema files.

## Documentation

- `README.md` — Project introduction and setup notes.
- `docs/ARCHITECTURE.md` — Architecture documentation.
- `docs/DESIGN_SYSTEM.md` — Design system notes.
- `docs/IMPLEMENTATION_SUMMARY.md` — Implementation summary.
- `docs/TESTING_CHECKLIST.md` — Manual and functional test checklist.
- `docs/UX_DECISIONS.md` — UX decisions and rationale.
- `docs/KNOWN_ISSUES.md` — Known issues list.
- `docs/CONTRIBUTING.md` — Contribution guidance.

## Assets

- `assets/hrtechify-logo.png` — Brand logo used in navigation, reports and footer areas.
