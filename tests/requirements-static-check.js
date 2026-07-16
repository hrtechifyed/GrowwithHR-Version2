const fs = require('fs');
const assert = require('assert');

const read = (file) => fs.readFileSync(file, 'utf8');
const pkg = JSON.parse(read('package.json'));
const index = read('index.html');
const analyze = read('analyze-company.html');
const homeCss = read('css/07-homepage.css');
const introCss = read('css/13-intro-experience.css');
const introJs = read('js/intro-sequence.js');
const assessmentJs = read('js/executive-assessment.js');

assert(!pkg.dependencies?.['@playwright/test'] && !pkg.devDependencies?.['@playwright/test'], '@playwright/test should not be assumed installed');
assert(index.includes('home-stack-section'), 'home stack section classes must be present');
assert(index.includes('home-stack-card'), 'home stack card classes must be present');
assert(homeCss.includes('--home-stack-top'), 'home stack CSS custom properties must be defined');
assert(homeCss.includes('position: sticky'), 'home stack cards must use sticky positioning');
assert(homeCss.includes('@media (max-height: 620px), (prefers-reduced-motion: reduce)'), 'home fallback/reduced-motion rule must exist');
assert(!homeCss.includes('.card{') && !homeCss.includes('.card {'), 'global .card selector must not be modified in homepage stack CSS');

assert(analyze.includes('advisory-experience-stage'), 'shared advisory stage must be present');
assert(analyze.includes('Willing to share the story of your organization?'), 'final invitation copy must be present');
assert(!analyze.includes('One final step.'), 'old final-step copy must be removed');
assert(analyze.includes('Welcome to HRTechify — let\'s begin your Executive Advisory assessment.'), 'one-line welcome must be present');
assert((analyze.match(/data-testid="advisory-briefing-card"/g) || []).length === 5, 'five advisory briefing cards must exist');

['is-entering', 'is-active', 'is-behind', 'is-leaving', 'is-hidden'].forEach((className) => {
  assert(introCss.includes(className) || introJs.includes(className), `${className} state class must be implemented`);
});
assert(introJs.includes('visibilitychange'), 'intro timeline must reconcile hidden-tab timers');
assert(introJs.includes('e2e'), 'safe e2e timing mode must exist');
assert(assessmentJs.includes('this.boundEvents'), 'assessment event binding must be guarded');
assert(assessmentJs.includes('validateName'), 'name validation must exist');
assert(assessmentJs.includes('validateEmail'), 'email validation must exist');
assert(assessmentJs.includes('showReportError'), 'report error/retry state must exist');
assert(assessmentJs.includes('isDownloading'), 'download duplicate-click guard must exist');
assert(assessmentJs.includes('data-testid", "assessment-question-card"'), 'question card test id must be assigned once per render');
assert(fs.existsSync('PLAYWRIGHT_TEST_PLAN.md'), 'Playwright/manual test plan must exist');

console.log('Static requirement checks passed.');
