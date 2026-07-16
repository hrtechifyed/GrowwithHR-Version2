# Known Issues

## Current

- The new React/Next.js-ready assessment UX layer exists under `apps/web/src`, but it is not yet wired into a full runnable app route in this repository.
- The current build intentionally has no save-and-resume. If the user leaves, refreshes, closes the tab, or switches devices, they must start fresh.
- Contact capture is current-tab only and does not send email or create a lead in any CRM/admin dashboard.
- Dependency installation and lockfile generation need to be finalized for the new React/Jest/Zustand toolchain.
- Type-checking and test execution should be verified after dependencies are available.
- Existing static navigation dropdown still requires final polish.
- Capability carousel redesign remains pending.
- Mobile QA is still required across the legacy static pages and the new UX layer.

---

## Privacy and Storage Constraints

Current assessment data must not be persisted unless a future change explicitly adds consent, storage details, and updated documentation.

Not currently supported:

- localStorage/sessionStorage autosave.
- Resume links.
- Google Drive storage.
- Email delivery.
- CRM export.
- HRTechify admin dashboard.
- Saved reports.

---

## Planned Improvements

- Wire the new assessment UX into a live route.
- Add comprehensive unit and integration tests.
- Improve report methodology and benchmarking explanation.
- Add visual regression checks.
- Decide whether future persistence is needed and document the privacy model before implementation.
---

## Intro Experience v2.0 and Production Readiness Alignment

Version: `v0.12.0-beta`

This document is aligned with the GrowWithHR Intro Experience v2.0 and production-readiness plan. The current product direction is an AI-powered Executive Advisory Platform with a premium, persistent-hero introduction, deterministic compliance advisory foundations, stronger recommendation traceability, and responsive validation across mobile, tablet, laptop, and desktop breakpoints.
