# GrowWithHR Intro Experience v2.0 & Production Readiness Master Plan

Version: `v0.12.0-beta`
Status: Working Draft
Product: GrowWithHR — AI Executive Advisory Platform
Last Updated: 2026-07-16

---

## Part A — Executive Intro Experience v2.0

### Vision

The Executive Intro should feel like a premium executive briefing, not a slideshow or loading screen. It should build confidence before the assessment begins and communicate professionalism, executive credibility, trust, intelligence, and calmness.

### Chosen Architecture: Persistent Hero

The hero is no longer an animated scene. It becomes the permanent executive briefing header:

```text
HRTechify Logo
Executive Advisory Intelligence
Powered by HRTechify
────────────────────────────────
Content starts from one fixed anchor below the header.
```

Only the stage content changes. The hero never moves.

### Required Intro Sequence

```text
Every organisation has a story.
Every stage of growth brings new responsibilities.
The decisions you make about people today...
Company DNA
People
Responsibilities
Future
Coach HRTechify
Assessment
```

### Core Layout Principle

The changing content must always begin from exactly the same vertical position below the persistent hero. Different content heights are acceptable. Different starting Y-coordinates are not acceptable.

### Final HTML Architecture

```html
<div class="exec-intro">
  <button class="intro-skip">Skip</button>

  <div class="intro-header">
    <section id="introHero" class="intro-hero"></section>
  </div>

  <div class="intro-stage">
    <div id="introMessages"></div>
    <div id="introCards"></div>
    <div id="introTransition"></div>
    <div id="coachIntroduction"></div>
    <div id="introActions"></div>
  </div>
</div>
```

### HTML Tasks

- Restore `.intro-header` as the permanent hero container.
- Keep `.exec-intro` open until messages, cards, transition, coach, and actions are closed.
- Rename the hero class from `.intro-screen` to `.intro-hero`.
- Remove the hero from the animation-engine scene stack.

### JavaScript Tasks

File: `intro-sequence.js`

- Keep the hero visible for the entire intro.
- Begin the sequence with Message 1 immediately.
- Preserve existing timings for later messages, cards, transition, coach, and assessment handoff.
- Maintain skip functionality.

### CSS Rebuild Plan

File: `13-intro-experience.css`

The stylesheet should be rebuilt by sections rather than patched:

1. Layout and Header.
2. Story Stage.
3. Coach.
4. Engine and Animations.
5. Responsive.
6. Utilities and Polish.

CSS rules:

- One selector, one definition.
- No duplicate selector blocks.
- No experimental overrides.
- No patch-only CSS.
- Dedicated mobile rules rather than desktop-only shrinking.

### Responsive Experience Requirements

- Mobile: smaller typography, reduced spacing, stable content anchor, no horizontal overflow.
- Tablet: centered cinematic composition, readable card widths, stable stage anchor.
- Laptop: premium briefing density without cramped content.
- Desktop: full executive presentation with consistent hero and stage alignment.
- Landscape mobile/tablet: content remains visible with reduced vertical spacing.

---

## Part B — Commercial Product Roadmap

### Product Positioning

GrowWithHR is an AI-powered Executive Advisory Platform. The initial commercial offering is a Compliance Advisory Platform.

### Phase 1 — Compliance MVP

- Executive Assessment.
- Compliance Advisory.
- Executive Advisory PDF.
- Compliance Tracker.
- Policy Checklist.
- Action Plan.

Goal: help organisations understand which compliance obligations apply and what actions they should take next.

### Phase 2 — Compliance Management

- Policy generation.
- Document uploads.
- Gap analysis.
- Evidence library.
- Compliance calendar.

Goal: move from recommendations to compliance management.

### Phase 3 — Enterprise Platform

- Multi-company dashboard.
- HR analytics.
- Benchmarking.
- AI Coach.
- Board reporting.

Goal: become an Executive HR Intelligence Platform.

---

## Traceability Recommendation

The next major investment should be traceability, not simply a more powerful AI model. Every recommendation should answer:

1. Why am I seeing this recommendation?
2. Which assessment answers triggered it?
3. What regulation, policy, or recognised HR principle does it relate to?
4. What should I do next?

Traceability should expose confidence, triggering responses, applicable principles or regulations, a reasoning summary, and suggested next actions.

---

## Production Readiness Snapshot

| Area | Readiness |
| --- | --- |
| Assessment Engine | 95% |
| Executive Advisory | 90% |
| UI / UX | 85% |
| Intro Experience | 70% |
| Compliance Knowledge | 70% |
| AI Explainability | 55% |
| Security | 30% |
| Auditability | 25% |
| Multi-tenancy | 20% |
| Production Infrastructure | 20% |

Overall estimate: approximately 65–70% production-ready.

---

## Production Readiness Workstreams

- Compliance knowledge layer with deterministic company-size, industry, jurisdiction, workforce, and risk-scoring rules.
- Explainability engine with confidence, triggering responses, applicable principles, reasoning summary, and suggested action.
- Compliance tracker with Not Started, In Progress, Complete, and Not Applicable statuses.
- Evidence library for policies, contracts, certificates, and supporting evidence.
- Compliance calendar for reviews, deadlines, renewals, mandatory training, and annual filings.
- Audit dashboard for compliance score, high-risk items, outstanding actions, deadlines, and organisation-wide status.

---

## Device Layout Test Cases

| Device Class | Example Widths | Expected Result |
| --- | --- | --- |
| Mobile portrait | 360px, 390px, 430px | Hero visible immediately, Message 1 visible immediately, no horizontal scrolling, tap targets at least 44px. |
| Mobile landscape | 640px–932px wide landscape | Reduced vertical spacing keeps hero and stage content visible without jumpy repositioning. |
| Tablet portrait | 768px, 820px | Intro stage starts at the same Y-coordinate for messages, cards, coach, and actions. |
| Tablet landscape | 1024px, 1180px | Cards and coach remain centered, readable, and anchored below the persistent hero. |
| Laptop | 1280px, 1366px, 1440px | Premium briefing composition, stable hero, no progressive downward drift. |
| Desktop | 1536px, 1920px | Executive-grade spacing, centered stage, no duplicate content or layout overflow. |
