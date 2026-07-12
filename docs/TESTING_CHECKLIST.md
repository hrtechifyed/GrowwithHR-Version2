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
