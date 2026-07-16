# GrowWithHR repository audit for stacked cards and advisory flow

## Files inspected

- Home HTML: `index.html`
- Home CSS: `css/06-hero.css`, `css/07-homepage.css`
- Shared responsive CSS: `css/11-responsive.css`
- Executive Advisory / assessment HTML: `analyze-company.html`, `assessment.html`
- Advisory CSS: `css/12-executive-assessment.css`, `css/13-intro-experience.css`
- Hero/scenes/cards JavaScript: `js/intro-sequence.js`
- Assessment JavaScript: `js/executive-assessment.js`
- Question data source: `ExecutiveAssessment.initializeQuestions()` in `js/executive-assessment.js`
- Question renderer: `ExecutiveAssessment.renderCurrentQuestion()` in `js/executive-assessment.js`
- Report-generation/download logic: `generateReport()`, `showNameCapture()`, `showEmailCapture()`, `startReportGeneration()`, `showInputPreview()`, `downloadReport()`, and `buildDownloadableReport()` in `js/executive-assessment.js`; PDF modal support in `js/pdf.js`; dashboard renderer in `js/renderer.js`
- Font system: `css/01-variables.css`, `css/02-base.css`, `css/03-typography.css`
- Test configuration: `package.json`, `tests/frontend-production-checks.js`, `tests/requirements-static-check.js`, `tests/playwright/`, `tests/e2e/`
- CI workflows: no `.github/workflows` files were present in this checkout.

## Selector inventory

- Eligible home-page card groups:
  - Executive Intelligence controls: `.hero-sidebar`, now `.home-stack-section`
  - Process stages: `.how-grid`, now `.home-stack-section`
  - Platform capabilities: `.carousel-track`, now `.home-stack-section`
- Existing home-page card selectors:
  - `.workspace-card`, `.company-dna-card`, `.growth-stage`, `.recommendation-card`
  - `.how-card`
  - `.capability-slide`
- Advisory Hero selectors: `#introHero`, `.intro-hero`, `.intro-title`
- Story-scene selectors: `.intro-scene`, `[data-scene]`
- Executive briefing-card selectors: `.intro-card`, `[data-card]`
- Coach/welcome selectors: `#coachIntroduction`, `.advisory-welcome-card`, `#coachMessageContainer`
- Begin Assessment button selector: `#startAssessment`, `[data-testid="begin-executive-assessment"]`
- Assessment-stage selector: `#assessmentShell.advisory-experience-stage`, `#conversationWorkspace`, `#conversationContainer`
- Question-title/body selectors: `#questionTitle`, `#questionText`, `#questionResponse`
- Assessment section names/order: Company → Workforce → Operations → Growth
- Name/email selectors: `#recipientName`, `#recipientEmail`, `#contactValidation`
- Generate Advisory button selector: `#generateReportButton`
- Report-preview selector: `[data-testid="advisory-report-preview"]`
- Download button selector: `#generateReportButton` when `reportStage === "preview"`
- Typography variables: `--font-primary`, heading/body styles in `css/03-typography.css`, color/spacing variables in `css/01-variables.css`
- Existing animation timings before this pass: intro hero/message/card/coach timers in `js/intro-sequence.js`; CSS keyframes in `css/13-intro-experience.css`
- Playwright status: `@playwright/test` is not installed in `package.json` or `node_modules`.
- Build/test inclusion: production scripts do not import `tests/e2e` or `tests/playwright`; frontend checks are run with Node scripts.
