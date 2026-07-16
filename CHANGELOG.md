# Changelog

All notable changes to GrowWithHR are documented here.

---

## [v0.12.0-beta] - Intro Experience v2.0 and Production Readiness Plan

Release Date: 2026-07-16

### Added

- Documented the persistent-hero Executive Intro v2.0 architecture.
- Added production-readiness roadmap direction for compliance advisory, traceability, auditability, and responsive QA.
- Added device-layout test coverage expectations for mobile, tablet, laptop, and desktop.

### Changed

- Updated documentation version references to `v0.12.0-beta`.
- Reframed GrowWithHR as an AI-powered Executive Advisory Platform moving toward compliance intelligence and HR governance.

---

## [v0.11.0-beta] - Executive Assessment UX Layer

Release Date: 2026-07-12

### Added

- React/Next.js-ready executive assessment UX structure under `apps/web/src`.
- Animated, beat-by-beat intro copy for the executive assessment welcome flow.
- Scene transition wrapper for cinematic assessment steps.
- Wizard-style assessment component with company context fields and responsive layout.
- Contact-capture component that works in the open tab only.
- Rules-based personalized report generator with maturity score, risk level, archetype, benchmarks, CFO view, and HR view.
- Privacy and data-handling components that explicitly explain the no-storage model.
- Zustand assessment store for current-tab state management.
- TypeScript types for assessment, lead, session, report, and UI state.
- Unit-test examples for animated text and personalized report generation.

### Changed

- Assessment data policy is now documented as **current-tab memory only**.
- Save-and-resume has been intentionally removed from the current implementation.
- Users are explicitly told that if they leave, refresh, close the tab, or switch devices, they must start fresh.
- New UX components use the advisory dashboard font stack: `Inter`, `Segoe UI`, `sans-serif`.
- Documentation now avoids claims about server storage, CRM export, Google Drive upload, dashboards, authentication, or completed production infrastructure that does not exist in this repository.

### Not Included in Current Build

- No localStorage/sessionStorage/cookie persistence.
- No backend API for saving assessment answers.
- No HRTechify admin dashboard.
- No CRM export.
- No Google Drive upload.
- No email delivery.
- No cross-device resume link.

---

## [v0.10.0-beta] - Executive Intelligence

Release Date: Earlier beta

### Added

- Executive Intelligence landing page.
- Company DNA intelligence cards.
- Growth Stage intelligence.
- Recommendation Basis intelligence.
- Interactive Intelligence Core visualization.
- Executive advisory preview.
- Platform capabilities carousel.
- Executive assessment framework.
- Official government resources section.
- Privacy section.
- About section.
- Contact section.
- Premium glass navigation.
- Responsive navigation.
- Advisory preview page.

### Improved

- Hero layout redesigned.
- Intelligence graph centering.
- Card spacing and alignment.
- Dynamic recommendation rotation.
- Dynamic growth stage rotation.
- Dynamic Company DNA rotation.
- Executive styling throughout homepage.
- Improved typography.
- Glassmorphism components.
- Executive dashboard presentation.

### Fixed

- Intelligence graph alignment.
- Hero content spacing.
- Company DNA card symmetry.
- Growth Stage synchronization.
- Recommendation animation consistency.
- Card layout refinements.
- Navigation structure.
- Hero responsiveness.
---

## Intro Experience v2.0 and Production Readiness Alignment

Version: `v0.12.0-beta`

This document is aligned with the GrowWithHR Intro Experience v2.0 and production-readiness plan. The current product direction is an AI-powered Executive Advisory Platform with a premium, persistent-hero introduction, deterministic compliance advisory foundations, stronger recommendation traceability, and responsive validation across mobile, tablet, laptop, and desktop breakpoints.
