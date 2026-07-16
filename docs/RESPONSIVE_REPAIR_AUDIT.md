# Responsive Repair Audit

## Baseline
- Branch: `work`
- Base commit: `1795d1c982fae64e92cb8881556a0d84e360a18b`
- Baseline package version: `0.12.0-beta`
- Baseline tests passed: `npm run test:frontend`, `npm run test:journeys`, `npm run test:ux`, `npm test`.

## Root-cause table
| Area | Root cause | Repair |
|---|---|---|
| Executive Intelligence | The previous hero override forced one column and constrained the workspace to 760px, concentrating content left/above the graph and leaving unused space. | Restored a fluid shell with a nav column plus graph column on laptop/desktop, tablet/mobile stacking, and responsive graph dimensions. |
| Graph | Three.js renderer only listened to window resize and used raw client dimensions, missing parent/container changes and hidden-to-visible transitions. | Added debounced `ResizeObserver`, DPR cap, orientation handling, and safe minimum render dimensions. |
| Coach-to-assessment | Skip scrolled to Begin Assessment and the assessment workspace could behave like a separate vertical destination. | Removed `scrollIntoView`, used explicit shared-stage state handoff, hid/inerted old intro content, and kept assessment screens inside `#assessmentShell`. |
| Sticky cards | The initializer enabled sticky classes without checking reduced motion, ancestor overflow/transform, or usable scroll geometry. | Added an enablement gate and a responsive non-overlapping fallback class. |
| Footer | Real site footer centering was scattered and could be confused with component footers. | Scoped centering to `body > footer.footer` and `body > footer.exec-footer`. |
| Stale assets | No consistent runtime marker was available to prove that current JS/CSS loaded. | Added `js/build-marker.js` with one concise build log and opt-in `?debug=1` diagnostics. |

## Stylesheet loading audit
- `index.html`: `styles.css`, Font Awesome.
- `analyze-company.html`: `css/01-variables.css`, `02-base.css`, `03-typography.css`, `04-layout.css`, `05-navbar.css`, `11-responsive.css`, `12-executive-assessment.css`, `13-intro-experience.css`, Font Awesome.
- `assessment.html`: same assessment modular CSS except without `13-intro-experience.css`.
- Dashboard/report/roadmap/info pages primarily load `styles.css`; `backupstyles.css` is not loaded.

## Selector audit
- Executive Intelligence: `.hero-v2 .workspace-window`, `.hero-dashboard-layout`, `.hero-sidebar`, `.hero-graph`, `.dna-core-wrapper`, `#dnaCoreCanvas`.
- Shared stage: `#assessmentShell`, `.advisory-experience-stage`, `.intro-stage`, `#introHero`, `#introMessages`, `#coachIntroduction`, `#introActions`, `#conversationWorkspace`.
- Sticky cards: `.rolling-card-group`, `.rolling-card`, `.rolling-card-enabled`, `.rolling-card-fallback`.
- Site footers: `body > footer.footer`, `body > footer.exec-footer`.

## Unverified browser behaviours
Playwright was unavailable due npm registry 403, so visual screenshots and viewport browser evidence are documented in `RESPONSIVE_MANUAL_TEST_MATRIX.md` for reviewer validation.
