# Contributing to GrowWithHR

Thank you for contributing to GrowWithHR.

The project is built around modular architecture, executive-grade UX, explainable recommendations, and privacy-first handling of sensitive company information.

---

## Current Privacy Rule

Do not add persistence without explicit approval and documentation.

Current assessment data must remain:

- In the open browser tab only.
- Not stored in localStorage or sessionStorage.
- Not written to cookies.
- Not sent to a backend.
- Not exported to CRM, email, Google Drive, or dashboards.

If a feature would allow users to resume later, send reports, or let HRTechify view submissions, it requires a separate privacy and consent design before implementation.

---

## Branch Strategy

- `main`: production-ready code.
- `develop`: integration branch for completed features.
- `feature/*`: new features.
- `release/*`: release stabilization.
- `hotfix/*`: critical production fixes.

---

## Commit Convention

Examples:

- `feat: add animated assessment intro`
- `fix: clarify no-storage privacy copy`
- `refactor: simplify assessment state store`
- `style: align wizard typography with advisory dashboard`
- `docs: update architecture for no-storage assessment`

---

## Pull Request Checklist

- Feature works as intended.
- No console errors.
- Responsive behavior verified.
- Existing functionality not broken.
- CSS is scoped to the component or existing design system.
- JavaScript/TypeScript remains modular.
- Documentation updated if architecture, privacy, storage, or UX flow changes.
- No new data persistence has been added without explicit approval.

---

## Coding Principles

- Keep components self-contained.
- Prefer typed interfaces for new React/TypeScript work.
- Reuse the advisory dashboard font stack: `Inter`, `Segoe UI`, `sans-serif`.
- Use accessible labels, keyboard support, and visible validation states.
- Keep copy executive-friendly and transparent.
- Avoid claims about backend, CRM, email, Google Drive, or dashboards unless those features are actually implemented.

---

## Review Criteria

Every change should improve at least one of:

- Simplicity.
- Privacy clarity.
- Performance.
- Explainability.
- Executive experience.
- Maintainability.
---

## Intro Experience v2.0 and Production Readiness Alignment

Version: `v0.12.1-beta`

This document is aligned with the GrowWithHR Intro Experience v2.0 and production-readiness plan. The current product direction is an AI-powered Executive Advisory Platform with a premium, persistent-hero introduction, deterministic compliance advisory foundations, stronger recommendation traceability, and responsive validation across mobile, tablet, laptop, and desktop breakpoints.
