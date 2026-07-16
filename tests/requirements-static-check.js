const fs = require('fs');
const assert = require('assert');

const read = (file) => fs.readFileSync(file, 'utf8');
const htmlFiles = [
  'index.html',
  'analyze-company.html',
  'assessment.html',
  'official-resources.html',
  'sample-advisory-report.html',
  'more-info.html',
  'compliance-roadmap.html',
  'growth-roadmap.html',
  'people-roadmap.html',
  'pages/company-profile.html',
  'pages/organization-profile.html',
];

for (const file of htmlFiles) {
  assert(read(file).includes('<footer class="footer"'), `${file} is missing the shared footer`);
  assert(read(file).includes('Smart People Strategy. More business momentum.'), `${file} is missing home footer copy`);
}

const home = read('index.html');
assert(home.indexOf('View Sample Advisory') < home.indexOf('Executive Intelligence'), 'home animation must follow sample advisory CTA');
assert(home.includes('href="sample-advisory-report.html"'), 'sample advisory CTA must link to the sample advisory page');

const heroCss = read('css/06-hero.css');
assert(heroCss.includes('grid-template-columns: minmax(min(100%, 260px), clamp(260px, 26vw, 360px)) minmax(0, 1fr);'), 'executive intelligence must use responsive navigation + graph columns');
assert(heroCss.includes('introStackCardEnter'), 'executive intelligence cards must use scene-style stacked animation');

const introJs = read('js/intro-sequence.js');
assert(introJs.includes('steps = ['), 'intro sequence must define an explicit state timeline');
assert(introJs.includes('state.advisoryState = "assessment"'), 'intro must hand off to assessment in the shared state model');

const introCss = read('css/13-intro-experience.css');
assert(!introCss.includes('Brush Script MT'), 'briefing cards must not switch to the old cursive font');
assert(introCss.includes('font-family: inherit;'), 'briefing cards should inherit the scene font');


const variablesCss = read('css/01-variables.css');
['--page-max-width', '--page-gutter', '--content-narrow', '--content-medium', '--content-wide', '--section-space', '--card-gap', '--navbar-height'].forEach((token) => {
  assert(variablesCss.includes(token), `responsive token ${token} must exist`);
});
const buildMarker = read('js/build-marker.js');
assert(buildMarker.includes('window.GWHR_BUILD_ID'), 'development build marker must be exposed');
assert(!home.includes('backupstyles.css'), 'obsolete backup stylesheet must not be loaded by home');

const assessmentJs = read('js/executive-assessment.js');
assert(assessmentJs.includes('pendingQuestionRender'), 'assessment should guard pending question renders');
assert(assessmentJs.includes('this.conversationContainer.innerHTML = "";'), 'assessment should clear the current question card before render');

const playwrightSpec = read('tests/playwright/growwithhr-ui.spec.js');
assert(playwrightSpec.includes("from '@playwright/test'"), 'Playwright test file should be generated');

console.log('Static requirement checks passed.');
