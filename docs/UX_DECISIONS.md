> **Current UX decision:** the root HTML/CSS/JavaScript application is production; the React/TypeScript layer is archived.

# UX Decisions

This document records important GrowWithHR product and UX decisions.

---

## Homepage

Decision: Homepage should inspire rather than explain every detail.

Reason: Executive users need fast orientation and confidence before exploring deeper content.

---

## Assessment Introduction

Decision: Use animated, short text beats before the assessment form.

Reason: The experience should feel guided and premium, not like a static survey. Short beats reduce cognitive load and make the assessment feel like a sequence of executive scenes.

---

## Assessment Structure

Decision: Convert long forms into a guided multi-step experience.

Reason: Progressive disclosure improves completion quality and allows privacy notices to appear near sensitive questions.

---

## No-Storage Policy

Decision: The current assessment should not store data anywhere.

Reason: The user requested a client-side-only experience with explicit notice that leaving midway requires starting fresh. This avoids hidden persistence and reduces friction around sensitive business information.

Implications:

- No localStorage.
- No sessionStorage.
- No cookies.
- No backend persistence.
- No Google Drive upload.
- No CRM export.
- No HRTechify admin dashboard.
- No save-and-resume link.

---

## Contact Capture

Decision: Include a contact-capture step but keep it current-tab only in this build.

Reason: The product flow can demonstrate where contact details belong without implying that a lead is stored, emailed, or exported before a consent-based integration exists.

---

## Privacy Signaling

Decision: Place privacy/data-handling copy directly near sensitive questions.

Reason: Companies may be sharing headcount, funding, hiring plans, and expansion plans. The user should not have to search for how that information is handled.

---

## Reports

Decision: Generate a deterministic rules-based report rather than a static demo.

Reason: Even simple personalization creates more value than a generic sample page and gives users a clear reason to complete the assessment.

---

## Benchmarking

Decision: Use directional, rules-based benchmarking language only.

Reason: The current build does not include a verified external benchmark database. The UI must not imply external authority or exact peer ranking.

---

## Typography

Decision: Use the advisory dashboard font stack in the new UX layer.

Reason: Consistent typography makes the React/Next.js-ready components feel like part of the existing GrowWithHR experience.

Font stack:

```css
font-family: "Inter", "Segoe UI", sans-serif;
```
---

## Intro Experience v2.0 and Production Readiness Alignment

Version: `v0.15.0-beta`

This document is aligned with the GrowWithHR Intro Experience v2.0 and production-readiness plan. The current product direction is an AI-powered Executive Advisory Platform with a premium, persistent-hero introduction, deterministic compliance advisory foundations, stronger recommendation traceability, and responsive validation across mobile, tablet, laptop, and desktop breakpoints.
