> **Testing reference:** use with `docs/TESTING_CHECKLIST.md`.

# GrowWithHR Stacked Cards + Advisory Flow Test Plan

## Environment status

- `@playwright/test` is not installed in this environment.
- Do not install packages or change npm registry settings in this environment.
- Playwright tests are drafted under `tests/e2e/` and `tests/playwright/`; they are not imported by production code.
- Use `?e2e=1` to shorten time-driven advisory sequence durations without skipping required states or changing validation rules.

## Draft automated coverage

1. Home card stacking
   - Eligible groups have `.home-stack-section` and `.home-stack-card`.
   - Ineligible card areas remain unchanged.
   - Sticky stacking is disabled for reduced motion / short viewports.
   - No horizontal overflow at 1440, 1024, 768, 430, 390, 360.

2. Advisory scenes
   - Brand hero appears first.
   - Story scenes appear in approved order.
   - Five briefing cards appear in approved order.
   - Final invitation remains until user action.
   - Old “One final step” and old multi-line Coach script are absent.

3. Assessment
   - Begin button shows one welcome line.
   - First question replaces welcome in the same stage.
   - Each question title appears once.
   - Answering advances once.
   - Section transitions only appear at section boundaries.

4. User details and report
   - Name validation rejects empty/whitespace, preserves invalid value, accepts hyphen/apostrophe/accented/non-Latin names.
   - Email validation accepts modern valid addresses and rejects malformed addresses.
   - Generation shows status sequence and prevents duplicate submission.
   - Report preview shows download immediately.
   - Download is guarded against rapid repeated clicks.

5. Accessibility
   - Hidden panels are inert/aria-hidden.
   - New interactive states focus the relevant control.
   - Reduced motion removes scale/blur/movement.
   - Footer and stage labels remain centered.

## Manual checklist required when Playwright is unavailable

- [ ] Full desktop journey at 1440px.
- [ ] Full tablet journey at 768px.
- [ ] Full mobile journey at 430px, 390px and 360px.
- [ ] Reduced-motion journey.
- [ ] Keyboard-only journey.
- [ ] Name validation cases: empty, whitespace, long, apostrophe, hyphen, accented, non-Latin, trimmed spaces.
- [ ] Email validation cases: empty, missing @, missing domain, trimmed spaces, uppercase, subdomain, plus-addressing, repeated dots.
- [ ] Report-generation retry using simulated failure.
- [ ] Download success.
- [ ] Download failure does not remove preview.
- [ ] Home-page stack releases into the next section.
- [ ] Footer and stage labels remain centered.
- [ ] Duplicate-question removal.
- [ ] No horizontal overflow.
- [ ] No unexpected page jump.
- [ ] No stale hidden controls remain tabbable.
- [ ] Correct home typography across advisory states.

## Draft Playwright command when dependency is available

```bash
npx playwright test tests/e2e tests/playwright
```
