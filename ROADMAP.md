# GrowWithHR Product Roadmap

Version: `v0.12.1-beta`
Last Updated: 2026-07-16

---

# Product Vision

GrowWithHR is evolving into an AI-powered Executive Assessment and Executive Advisory Platform that helps leaders understand their organisation, people responsibilities, compliance posture, and next actions through a premium, explainable, executive-grade experience.

# Product Positioning

Today, GrowWithHR is a static HTML/CSS/JavaScript executive assessment and advisory prototype with a client-side assessment flow, advisory report generation, and an executive intro experience. It is evolving into a commercial Compliance Advisory Platform and, over time, a broader HR governance and intelligence platform with stronger traceability, compliance management, and executive reporting.

# Development Phases

## Phase 1 (Immediate / MVP)

- Objective
  - Prepare the frontend for executive demonstrations and commercial MVP conversations without changing the product's current business logic or no-storage posture.
- Features
  - Single fixed Story Stage intro sequence.
  - Hero appears once, fades after the opening moment, and is replaced by Scene 1 in the same location.
  - Premium executive story cards using existing HRTechify branding.
  - Coach HRTechify appears once with a visible Begin Assessment button.
  - Begin Assessment opens the assessment question field directly and does not auto-start before user action.
  - Dedicated responsive breakpoints for desktop, laptop, tablet, and mobile.
- Deliverables
  - Stable intro HTML, CSS, and JavaScript architecture.
  - Mobile-safe landing, assessment, advisory, dashboard, card, button, and modal layout hardening.
  - Frontend production checks for intro sequence, duplicate rendering, breakpoint coverage, and responsive safeguards.

## Phase 2 (Next Release)

- Objective
  - Improve advisory credibility and commercial readiness through explainability, compliance logic, and report quality.
- Features
  - Deterministic compliance knowledge layer for company-size, industry, jurisdiction, workforce, and risk thresholds.
  - Recommendation traceability showing why each recommendation appears, which assessment answers triggered it, and what action should follow.
  - Stronger executive advisory PDF/report presentation.
  - Compliance tracker, policy checklist, and action plan.
- Deliverables
  - Explainability model for recommendations.
  - Compliance MVP content model.
  - QA-ready report templates and export-ready layouts.

## Phase 3 (Long-Term Vision)

- Objective
  - Expand from advisory into ongoing compliance management and executive HR intelligence.
- Features
  - Policy generation.
  - Document uploads.
  - Gap analysis.
  - Evidence library.
  - Compliance calendar.
  - Multi-company dashboard.
  - HR analytics, benchmarking, AI Coach, and board reporting.
- Deliverables
  - Compliance Intelligence Platform foundation.
  - Enterprise dashboard concepts.
  - Governance reporting and multi-company operating model.

# Key Architectural Decisions

- Preserve current branding, colour palette, typography style, and product behavior unless explicitly requested.
- Keep the intro as one fixed Story Stage below the navbar; scenes replace one another without page movement.
- Use dynamic viewport units instead of relying on full-screen `100vh` sections for the intro.
- Use dedicated breakpoint ranges: desktop ≥1200px, laptop 992–1199px, tablet 768–991px, and mobile ≤767px.
- Do not auto-start the assessment after the intro; start only when the user clicks Begin Assessment.
- Preserve the current no-storage model until future consent and persistence architecture is approved.

# Core Product Principles

- Executive-first presentation.
- Calm, premium, trustworthy experience.
- No unnecessary redesign or brand drift.
- Explainable recommendations.
- Mobile demonstration readiness.
- Privacy and no hidden persistence by default.
- Maintainable frontend architecture.
- Progressive production hardening without over-engineering.

# Production Readiness Recommendations

- Add browser-based regression testing for intro, assessment, advisory, dashboard, and modal flows.
- Add real mobile-device QA for iOS Safari and Android Chrome.
- Configure the existing React/TSX test runner so `npm run test:ux` can transform TypeScript and JSX.
- Add traceability metadata to advisory recommendations.
- Add deterministic compliance rules before commercial launch.
- Add auditability, security review, monitoring, and deployment checks before handling production customer data.

# Risks

- Without browser-based tests, visual regressions can pass static checks but fail in real mobile layouts.
- Advisory recommendations may lack executive trust until traceability and compliance source mapping are added.
- Future persistence, dashboards, CRM, email, or document storage could create privacy risk unless designed with explicit consent.
- The current static architecture may become difficult to scale without a clearer application shell and routing strategy.

# Success Criteria

- Hero appears once, fades away, and Scene 1 appears in the same Story Stage position.
- Story scenes, briefing cards, Coach, and Begin Assessment all stay within the same fixed stage.
- Assessment starts only after Begin Assessment is clicked.
- Begin Assessment opens the assessment question field directly.
- Desktop and mobile experiences remain on-brand and presentation-ready.
- No horizontal scrolling or overflowing intro cards on mobile.
- Existing assessment and advisory business logic remains intact.

# Next Development Tasks

1. Verify the full intro flow in a real browser at desktop, laptop, tablet, and mobile widths.
2. Confirm Begin Assessment opens the first assessment question directly and back/continue controls behave correctly.
3. Run mobile QA for landing, assessment, advisory, dashboard, modals, forms, cards, and buttons.
4. Add Playwright or equivalent browser smoke tests when a browser runtime is available.
5. Fix the React/TSX Jest transform setup for existing UX tests.
6. Expand compliance logic and traceability metadata for the advisory report.
7. Prepare a production-demo checklist covering console errors, layout overflow, navigation, modals, and report generation.
