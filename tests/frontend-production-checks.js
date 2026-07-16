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

function count(source, needle) {
  return source.split(needle).length - 1;
}

// Intro HTML architecture checks.
assertIncludes(html, '<div class="intro-stage" aria-live="polite">', 'A single fixed story stage is required.');
assert(!html.includes('<div class="intro-header">'), 'Intro header wrapper should not exist because the hero is not persistent.');
assertIncludes(html, 'id="introHero"\n    class="intro-screen intro-hero"', 'Hero must be a single intro-screen inside the story stage.');
assert.strictEqual(count(html, 'id="introHero"'), 1, 'Hero must render exactly once.');
assert.strictEqual(count(html, 'id="coachIntroduction"'), 1, 'Coach must render exactly once.');
assert.strictEqual(count(html, 'id="startAssessment"'), 1, 'Begin Assessment button must render exactly once.');
assert(html.indexOf('id="introHero"') < html.indexOf('id="introMessages"'), 'Hero must appear before messages.');
assert(html.indexOf('id="introMessages"') < html.indexOf('id="introCards"'), 'Messages must appear before cards.');
assert(html.indexOf('id="introCards"') < html.indexOf('id="coachIntroduction"'), 'Cards must appear before coach.');
assert(html.indexOf('id="coachIntroduction"') < html.indexOf('id="conversationWorkspace"'), 'Coach must stay in the intro before the assessment workspace.');

// Intro JavaScript behavior checks.
assertIncludes(introJs, 'hero: document.getElementById("introHero")', 'Hero must be part of the opening story stage timeline.');
assertIncludes(introJs, 'TIMING.hero', 'Opening hero duration is required before Scene 1.');
assertIncludes(introJs, 'completeIntro()', 'Intro must finish by revealing the Begin Assessment action instead of auto-starting.');
assertIncludes(introJs, 'setActionsVisible(true)', 'Begin Assessment must become visible after coach completion.');
assertIncludes(introJs, 'skipIntroduction', 'Skip behavior must remain available.');

// Intro CSS structure and duplicate checks.
['1. Fixed Intro Layout', '2. Story Stage & Executive Cards', '3. Coach & Begin Assessment', '4. Engine & Animations', '5. Responsive', '6. Utilities & Polish'].forEach((section) => {
  assertIncludes(introCss, section, `Missing intro CSS section: ${section}`);
});

const selectors = topLevelSelectors(introCss);
const duplicates = selectors.filter((selector, index) => selectors.indexOf(selector) !== index);
assert.deepStrictEqual([...new Set(duplicates)], [], `Duplicate top-level intro CSS selectors found: ${[...new Set(duplicates)].join(', ')}`);

// Responsive coverage checks for demo devices.
assertIncludes(introCss, 'height: calc(100dvh - 90px)', 'Intro must use dynamic viewport height on desktop.');
assertIncludes(introCss, '@media (max-width: 992px)', 'Intro tablet breakpoint is required.');
assertIncludes(introCss, '@media (max-width: 720px)', 'Intro mobile breakpoint is required.');
assertIncludes(introCss, '@media (max-height: 560px) and (orientation: landscape)', 'Intro landscape breakpoint is required.');
assertIncludes(responsiveCss, 'overflow-x: hidden', 'Global responsive hardening must prevent horizontal overflow.');
assertIncludes(responsiveCss, 'table {', 'Tables must be scroll-safe on mobile.');

console.log('Frontend production checks passed.');
