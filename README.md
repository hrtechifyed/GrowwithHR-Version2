# GrowWithHR v0.12.1-beta

**GrowWithHR** is an executive HR intelligence and advisory prototype by HRTechify. It helps founders, business leaders, and HR professionals explore company context, statutory compliance, growth readiness, and people-governance priorities through explainable recommendations.

The repository currently contains the original static HTML/CSS/JavaScript experience plus a new React/Next.js-ready assessment UX layer under `apps/web/src`.

---


## Executive Advisory Experience v3

The current intro experience uses a one-time brand reveal followed by concise executive story scenes, briefing cards, Coach HRTechify, and an explicit Begin Executive Assessment action. Homepage mobile compatibility has been hardened for the intelligence and carousel sections with dedicated desktop, laptop, tablet, and mobile breakpoints.

---

## Current Data Policy

The current executive assessment UX is intentionally **client-side and no-storage**.

- Assessment answers live only in the open browser tab while the user is completing the flow.
- No answers are saved to `localStorage`, `sessionStorage`, cookies, a database, a server, Google Drive, CRM, email tool, or an HRTechify admin dashboard.
- If the user refreshes, closes the tab, navigates away, or switches devices, the assessment must be started fresh.
- Contact-capture fields are held only in the open tab in this implementation.
- Any future Google Drive, email, CRM, dashboard, or backend integration must be added deliberately with explicit consent and updated documentation.

---

## Key Features

- Company DNA assessment concept.
- Executive Intelligence Core.
- HR compliance and growth-readiness framing.
- Official source mapping in the existing static experience.
- Animated executive assessment intro in the new UX layer.
- Wizard-style assessment flow in the new UX layer.
- Contact-capture step that does not persist data.
- Rules-based personalized advisory report generator.
- Privacy and data-handling notices near sensitive questions.
- Responsive, executive-style UI using the advisory dashboard font stack: `Inter`, `Segoe UI`, `sans-serif`.

---

## Assessment Framework

The assessment is organized around company context that can affect people, compliance, and growth-readiness decisions:

1. Company profile.
2. Workforce and headcount context.
3. Entity, state, and industry context.
4. Hiring, funding, expansion, and work-model signals.

The new report generator uses these inputs to produce deterministic, rules-based outputs such as risk level, maturity score, archetype, benchmarks, and priority actions.

---

## Current Technology Stack

Existing static experience:

- HTML5.
- CSS3.
- JavaScript.
- Static JSON data.

New assessment UX layer:

- React/Next.js-ready TypeScript components.
- Zustand state store for current-tab state.
- Component-scoped responsive CSS.
- Jest/Testing Library test examples.

---

## New UX File Structure

```text
apps/web/src/
├── components/UX/
│   ├── Animations/AnimatedText.tsx
│   ├── Animations/SceneTransition.tsx
│   ├── Assessment/WizardForm.tsx
│   ├── Forms/LeadCaptureForm.tsx
│   ├── Privacy/DataHandling.tsx
│   ├── Privacy/PrivacyPolicy.tsx
│   ├── Reports/PersonalizedReportGenerator.tsx
│   ├── __tests__/
│   └── examples/ExecutiveAssessmentIntegration.tsx
├── hooks/
├── services/
├── stores/
└── types/
```

---

## Current Status

Version: `v0.12.2-beta`

The platform is still a prototype/beta. The new assessment UX layer is modular and typed, but it is not yet wired into a full deployed Next.js application shell in this repository.

---

## Important Non-Goals for This Build

This build does **not** include:

- User accounts.
- Saved reports.
- Save-and-resume links.
- Backend report storage.
- HRTechify admin dashboard.
- CRM export.
- Google Drive upload.
- Email delivery.
- Authentication or authorization.
- Production monitoring/logging infrastructure.

---

## License

Copyright © HRTechify.

All Rights Reserved.
---

## Intro Experience v2.0 and Production Readiness Alignment

Version: `v0.12.1-beta`

This document is aligned with the GrowWithHR Intro Experience v2.0 and production-readiness plan. The current product direction is an AI-powered Executive Advisory Platform with a premium, persistent-hero introduction, deterministic compliance advisory foundations, stronger recommendation traceability, and responsive validation across mobile, tablet, laptop, and desktop breakpoints.
