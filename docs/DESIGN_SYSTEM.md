# GrowWithHR Design System

## Design Philosophy

Executive software should feel calm, trustworthy, focused, and transparent.

---

## Principles

- Premium SaaS feel.
- Executive-first language.
- Progressive disclosure.
- Low cognitive load.
- Explainable recommendations.
- Consistent spacing.
- Clear visual hierarchy.
- Privacy notices near sensitive questions.

---

## Typography

Primary font stack:

```css
font-family: "Inter", "Segoe UI", sans-serif;
```

This stack is used by the advisory dashboard and must also be used by the new executive assessment UX components.

Hierarchy:

- H1: hero or page title only.
- H2: major scene or section title.
- H3: card title or panel title.
- Body: 16px baseline.
- Caption/helper text: 13–14px.

---

## Colors

Primary:

- Executive blue.
- Gold/orange accent gradients where already used.

Neutral:

- Soft white cards.
- Glass black overlays.
- Light blue privacy/info panels.

Status colors:

- Error: accessible red.
- Success: accessible green.
- Info: calm blue.

---

## Border Radius

- Cards: 20–32px.
- Buttons: 999px for pill CTAs or 10–14px for utility controls.
- Badges: 999px.

---

## Shadows

Use soft, premium shadows. Avoid heavy or harsh shadows.

---

## Animations

- Purposeful, not decorative.
- Short scene transitions.
- Respect `prefers-reduced-motion`.
- Text reveals should use short beats rather than long paragraphs.

---

## Accessibility

- Minimum interactive target: 44px height.
- Use ARIA labels for controls and live regions.
- Support keyboard navigation for animated content.
- Keep validation messages visible and associated with inputs.

---

## Privacy UI Pattern

Sensitive assessment sections should include a short data-handling notice stating:

- Data is only in the open tab.
- Nothing is stored or sent.
- If the user leaves, they must start fresh.
