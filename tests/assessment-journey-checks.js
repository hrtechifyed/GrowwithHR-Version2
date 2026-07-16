const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const home = read('index.html');
const analyze = read('analyze-company.html');
const assessmentJs = read('js/executive-assessment.js');
const introJs = read('js/intro-sequence.js');
const navbarCss = read('css/05-navbar.css');
const homeCss = read('css/07-homepage.css');
const introCss = read('css/13-intro-experience.css');

function includes(source, needle, message) {
  assert(source.includes(needle), message || `Expected ${needle}`);
}

function ordered(source, needles, label) {
  let last = -1;
  for (const needle of needles) {
    const index = source.indexOf(needle);
    assert(index > last, `${label}: expected ${needle} after previous milestone`);
    last = index;
  }
}

// Landing page and responsive navigation.
includes(home, 'id="home"', 'Landing page hero must exist.');
includes(home, 'id="hamburger"', 'Landing page hamburger must exist.');
includes(home, 'aria-expanded="false"', 'Hamburger must expose collapsed state.');
includes(home, 'navLinks.classList.toggle("active")', 'Hamburger must toggle mobile navigation.');
includes(navbarCss, 'backdrop-filter: blur(18px) saturate(150%)', 'Navbar must use glass styling.');
includes(navbarCss, '.nav-links.active', 'Mobile nav open state must be styled.');

// Homepage carousel removal and responsive layouts.
includes(home, 'class="capability-carousel"', 'Capabilities section must still render.');
includes(homeCss, '.carousel-arrow { display: none !important; }', 'Carousel arrows must be removed from UI.');
includes(homeCss, 'grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))', 'Capabilities must use responsive grid cards.');
includes(homeCss, '@media (max-width: 760px)', 'Mobile homepage breakpoint must exist.');

// Executive advisory intro.
ordered(analyze, ['id="introHero"', 'id="introMessages"', 'id="introCards"', 'id="coachIntroduction"', 'id="conversationWorkspace"'], 'Intro journey');
assert(!analyze.includes('Every decision shapes its future.'), 'Scene 1 second statement should be removed.');
assert(!analyze.includes('<span>Structure</span><span>People</span><span>Responsibilities</span>'), 'Scene 2 second statement keywords should be removed.');
assert(!analyze.includes('They prepare.</p>'), 'Scene 3 second statement should be removed.');
includes(introCss, 'introStackCardExit', 'Intro scenes/cards must use stacked card exit animation.');
includes(introJs, 'skipIntroduction', 'Skip button journey must be wired.');
includes(introJs, 'beginTarget.scrollIntoView', 'Skip must take users to Begin Assessment.');

// Assessment navigation and progress.
includes(assessmentJs, 'this.renderCurrentQuestion();', 'Begin Assessment must render the first question.');
includes(assessmentJs, 'this.progressBar.style.width', 'Progress indicator must be updated.');
includes(assessmentJs, 'Question ${this.currentQuestion + 1} of ${totalQuestions}', 'Question progress output must exist.');
assert.strictEqual((assessmentJs.match(/renderSegmentTransitionCard\(/g) || []).length, 2, 'Transition card should be called once by showStepIntroduction plus its function declaration.');
includes(assessmentJs, '}, 3200);', 'Section loading transition should stay visible for a few seconds.');

// Name/email collection and advisory generation output.
includes(assessmentJs, 'Generate Advisory', 'Generate Advisory action must appear after answered questions.');
includes(assessmentJs, 'showNameCapture()', 'Name capture step must be wired.');
includes(assessmentJs, 'showEmailCapture()', 'Email capture step must be wired.');
includes(assessmentJs, 'showInputPreview()', 'Input preview step must be wired.');
includes(assessmentJs, 'downloadReport()', 'Download step must be wired.');
includes(assessmentJs, 'id="recipientName"', 'Name collection input must be rendered.');
includes(assessmentJs, 'id="recipientEmail"', 'Email collection input must be rendered.');
includes(assessmentJs, 'Input preview', 'Input preview screen must be rendered.');
includes(assessmentJs, 'application/pdf', 'Download must produce a PDF blob.');
includes(assessmentJs, 'HRTechify-GrowWithHR-illustrative-advisory.pdf', 'PDF filename must use HRTechify/GrowWithHR branding.');
includes(assessmentJs, 'Brand palette: deep navy page, cyan highlights, white report text.', 'PDF content must preserve branding guidance.');

// Question duplication regression.
includes(assessmentJs, 'card.getElementById("coachContext").textContent', 'Coach context helper must remain available.');
includes(assessmentJs, 'card.getElementById("questionExplanation").textContent =\n            "";', 'Duplicate helper explanation must remain disabled.');

console.log('Assessment journey checks passed.');
