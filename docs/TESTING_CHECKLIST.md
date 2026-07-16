# Testing Checklist

## Documentation and Repository Checks

- `git diff --check` passes.
- Documentation reflects the current no-storage assessment policy.
- README, release notes, roadmap, architecture, implementation summary, known issues, design system, UX decisions, and changelog are aligned.

---

## Static Homepage

- Hero loads.
- Intelligence graph animates.
- Company DNA rotates.
- Growth Stage rotates.
- Recommendation rotates.
- No console errors appear.

---

## Existing Navigation

- All links work.
- Dropdown opens.
- Dropdown closes correctly.
- Mobile navigation works.
- CTA works.

---

## New Executive Assessment UX Layer

- Welcome scene appears first.
- Animated text reveals one beat at a time.
- Animation controls are keyboard accessible.
- Wizard form displays company context fields.
- Required-field validation appears.
- Data-handling notice is visible near assessment fields.
- Notice clearly says data is not stored and users must start fresh if they leave.
- Contact-capture step appears after valid company context.
- Contact form says fields are current-tab only and not stored/sent/exported.
- Personalized report generates from entered company data.
- Report includes risk level, maturity score, archetype, benchmarks, CFO view, HR view, and priority actions.
- Report privacy note says no data is stored or sent.

---

## No-Storage Verification

Confirm the assessment does not write to:

- localStorage.
- sessionStorage.
- Cookies.
- Network endpoints.
- Google Drive.
- Email services.
- CRM/admin dashboard.

Refresh behavior:

- Refreshing or closing the tab clears the flow because no progress is persisted.

---

## Responsive Behavior

Check mobile, tablet, and desktop:

- Text remains readable.
- Form fields stack correctly on smaller screens.
- Tap targets are at least 44px tall.
- Privacy panels remain readable.
- Report cards stack without horizontal overflow.

---

## Browser Support

- Chrome.
- Edge.
- Safari.
- Firefox.
---

## Intro Experience v2.0 and Production Readiness Alignment

Version: `v0.12.0-beta`

This document is aligned with the GrowWithHR Intro Experience v2.0 and production-readiness plan. The current product direction is an AI-powered Executive Advisory Platform with a premium, persistent-hero introduction, deterministic compliance advisory foundations, stronger recommendation traceability, and responsive validation across mobile, tablet, laptop, and desktop breakpoints.


---

## Intro Experience v2.0 Device Layout Test Cases

Run these checks after the persistent-hero intro is implemented in HTML, JavaScript, and CSS.

### Mobile Portrait

- Viewports: 360x740, 390x844, 430x932.
- Hero is visible immediately.
- Message 1 is visible immediately without a three-second delay.
- Stage content starts at the same Y-coordinate for messages, cards, coach, and actions.
- No horizontal scrolling occurs.
- Tap targets are at least 44px high.

### Mobile Landscape

- Viewports: 640x360, 844x390, 932x430.
- Reduced spacing keeps the hero and active stage content visible.
- Skip button remains reachable.
- Content does not progressively move downward between scenes.

### Tablet Portrait

- Viewports: 768x1024 and 820x1180.
- Persistent hero remains fixed at the top of the intro composition.
- Cards, transition content, coach card, and actions share the same content anchor.
- Cards remain readable without overflow.

### Tablet Landscape

- Viewports: 1024x768 and 1180x820.
- Stage width is comfortable and centered.
- Cards and coach card do not stretch excessively.
- Scene transitions do not shift the intro header.

### Laptop

- Viewports: 1280x800, 1366x768, 1440x900.
- Intro feels like a premium executive briefing rather than a slideshow.
- Hero and stage composition remains balanced above the fold.
- No duplicate CSS selector behavior or unexpected overrides appear in computed styles.

### Desktop

- Viewports: 1536x864 and 1920x1080.
- Hero, messages, cards, coach, and assessment actions remain centered and stable.
- Stage content starts from the same Y-coordinate in every scene.
- No unused experimental intro screens remain visible.
