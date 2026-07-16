const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const html = read('analyze-company.html');
const introJs = read('js/intro-sequence.js');
const introCss = read('css/13-intro-experience.css');
const responsiveCss = read('css/11-responsive.css');

function assertIncludes(source, needle, message) {
  assert(source.includes(needle), message || `Expected to find ${needle}`);
}

function stripAtRules(css) {
  return css.replace(/@media[^{]+\{[\s\S]*?\n\}/g, '').replace(/@keyframes[^{]+\{[\s\S]*?\n\}/g, '');
}

function topLevelSelectors(css) {
  return Array.from(stripAtRules(css).matchAll(/(^|\n)([^@{}\n][^{}]*)\{/g))
    .map((match) => match[2].trim().replace(/\s+/g, ' '))
    .filter(Boolean)
    .filter((selector) => !['from', 'to'].includes(selector));
}

// Intro HTML architecture checks.
assertIncludes(html, '<div class="intro-header">', 'Intro header wrapper is required.');
assertIncludes(html, 'id="introHero"\n    class="intro-hero"', 'Hero must use intro-hero, not intro-screen.');
assertIncludes(html, '<div class="intro-stage" aria-live="polite">', 'Intro stage wrapper is required.');
assert(html.indexOf('class="intro-header"') < html.indexOf('class="intro-stage"'), 'Header must appear before stage.');
assert(html.indexOf('id="introHero"') < html.indexOf('id="introMessages"'), 'Hero must appear before messages.');
assert(html.indexOf('id="introMessages"') < html.indexOf('id="introCards"'), 'Messages must appear before cards.');
assert(html.indexOf('id="introCards"') < html.indexOf('id="coachIntroduction"'), 'Cards must appear before coach.');

// Intro JavaScript behavior checks.
assert(!introJs.includes('hero: document.getElementById("introHero")'), 'Hero must not be registered as an animated section.');
assert(!introJs.includes('TIMING.hero'), 'Intro must not use an initial hero delay.');
assertIncludes(introJs, 'runTimeline();', 'Timeline should begin immediately.');
assertIncludes(introJs, 'setHeroVisible();', 'Hero visibility must be explicit and persistent.');
assertIncludes(introJs, 'skipIntroduction', 'Skip behavior must remain available.');

// Intro CSS structure and duplicate checks.
['1. Layout & Header', '2. Story Stage', '3. Coach', '4. Engine & Animations', '5. Responsive', '6. Utilities & Polish'].forEach((section) => {
  assertIncludes(introCss, section, `Missing intro CSS section: ${section}`);
});

const selectors = topLevelSelectors(introCss);
const duplicates = selectors.filter((selector, index) => selectors.indexOf(selector) !== index);
assert.deepStrictEqual([...new Set(duplicates)], [], `Duplicate top-level intro CSS selectors found: ${[...new Set(duplicates)].join(', ')}`);

// Responsive coverage checks for demo devices.
assertIncludes(introCss, '@media (max-width: 992px)', 'Intro tablet breakpoint is required.');
assertIncludes(introCss, '@media (max-width: 720px)', 'Intro mobile breakpoint is required.');
assertIncludes(introCss, '@media (max-height: 560px) and (orientation: landscape)', 'Intro landscape breakpoint is required.');
assertIncludes(responsiveCss, 'overflow-x: hidden', 'Global responsive hardening must prevent horizontal overflow.');
assertIncludes(responsiveCss, 'table {', 'Tables must be scroll-safe on mobile.');

console.log('Frontend production checks passed.');
