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
assert(heroCss.includes('grid-template-columns: 1fr !important;'), 'executive intelligence cards must stack instead of sitting side by side');
assert(heroCss.includes('introStackCardEnter'), 'executive intelligence cards must use scene-style stacked animation');

const introJs = read('js/intro-sequence.js');
assert(introJs.includes('activate(messageScenes, 3)'), 'fourth intro scene must be part of the timeline');

const introCss = read('css/13-intro-experience.css');
assert(!introCss.includes('Brush Script MT'), 'briefing cards must not switch to the old cursive font');
assert(introCss.includes('font-family: inherit;'), 'briefing cards should inherit the scene font');

const assessmentJs = read('js/executive-assessment.js');
assert(assessmentJs.includes('pendingQuestionRender'), 'assessment should guard pending question renders');
assert(assessmentJs.includes('this.conversationContainer.innerHTML = "";'), 'assessment should clear the current question card before render');

const playwrightSpec = read('tests/playwright/growwithhr-ui.spec.js');
assert(playwrightSpec.includes("from '@playwright/test'"), 'Playwright test file should be generated');

console.log('Static requirement checks passed.');
