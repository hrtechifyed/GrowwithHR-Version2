# GrowWithHR v0.12.0-beta

Codename: Intro Experience v2.0 & Production Readiness

---

## Overview

This release updates GrowWithHR documentation around the Executive Intro Experience v2.0, production-readiness planning, commercial compliance-advisory roadmap, recommendation traceability, and responsive device-layout QA.

The most important product decision in this release is that the intro should become a persistent executive briefing header with a fixed content anchor, while the broader product roadmap moves GrowWithHR toward a traceable AI Executive Advisory Platform.

---

## Highlights

### Persistent-Hero Executive Intro v2.0

The intro direction is now a persistent executive briefing header. The hero appears immediately, Message 1 appears immediately, and messages, cards, coach content, and actions all start from the same fixed content anchor below the header.


### Production Readiness Roadmap

The roadmap now identifies compliance knowledge, explainability, security, auditability, multi-tenancy, and production infrastructure as key readiness workstreams. The current readiness estimate remains approximately 65–70% until these workstreams mature.

### Traceability as the Next Major Investment

Every recommendation should eventually explain why it appears, which assessment answers triggered it, which regulation or recognised HR principle it relates to, and what the user should do next.

### Device Layout Test Cases

The testing checklist now includes explicit layout checks for mobile portrait, mobile landscape, tablet portrait, tablet landscape, laptop, and desktop viewports.

### Wizard-Style Assessment Flow

The new `WizardForm` component separates the flow into scenes:

1. Welcome and animated introduction.
2. Company context questions.
3. Contact capture for the open tab only.
4. Personalized advisory report.

### No-Storage Data Policy

The current build uses open-tab memory only.

- No localStorage.
- No sessionStorage.
- No cookies.
- No backend database.
- No Google Drive upload.
- No CRM export.
- No HRTechify admin dashboard.
- No email delivery.
- No cross-device resume link.

If a user leaves midway, refreshes, closes the tab, or switches devices, they must start fresh.

### Personalized Report Generator

The report generator creates a rules-based advisory using the user's company context. It includes:

- Company-specific summary.
- Risk level.
- Maturity score.
- Operating archetype.
- Directional benchmark language.
- CFO and HR viewpoints.
- Priority actions.

### Privacy and Trust Signaling

Privacy notices now appear directly near sensitive assessment areas and in a dedicated privacy component. The copy clearly explains what is and is not stored.

### Visual Consistency

The new UX components use the same font family as the advisory dashboard: `Inter`, `Segoe UI`, `sans-serif`.

---

## Current Beta Scope

Included:

- Static landing and advisory pages from the existing prototype.
- New React/TypeScript assessment UX components.
- Current-tab-only state management.
- No-storage privacy messaging.
- Rules-based personalized report generation.
- Unit-test examples for key UX behavior.

Not included:

- Production backend.
- Persistent user accounts.
- Saved reports.
- Save-and-resume.
- Admin dashboards.
- CRM/email/Google Drive integrations.

---

## Next Release Focus

The next release should focus on integration quality:

- Wire the React UX layer into a runnable application shell.
- Add a confirmed test/build toolchain with lockfile.
- Replace static examples with live routes.
- Decide whether future storage is required and document consent requirements before implementation.
---

## Intro Experience v2.0 and Production Readiness Alignment

Version: `v0.12.0-beta`

This document is aligned with the GrowWithHR Intro Experience v2.0 and production-readiness plan. The current product direction is an AI-powered Executive Advisory Platform with a premium, persistent-hero introduction, deterministic compliance advisory foundations, stronger recommendation traceability, and responsive validation across mobile, tablet, laptop, and desktop breakpoints.
