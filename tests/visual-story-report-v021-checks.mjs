import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const story = fs.readFileSync("js/story-visual-sections-v021.js", "utf8");
const reportCore = fs.readFileSync("js/report-visual-core-v021.js", "utf8");
const reportRenderers = fs.readFileSync("js/report-visual-renderers-v021.js", "utf8");
const report = fs.readFileSync("js/report-visual-sections-v021.js", "utf8");
const css = fs.readFileSync("css/21-story-visual-sections.css", "utf8");
const bootstrap = fs.readFileSync("js/report-runtime-bootstrap.js", "utf8");

new vm.Script(story, { filename: "js/story-visual-sections-v021.js" });
new vm.Script(reportCore, { filename: "js/report-visual-core-v021.js" });
new vm.Script(reportRenderers, { filename: "js/report-visual-renderers-v021.js" });
new vm.Script(report, { filename: "js/report-visual-sections-v021.js" });
new vm.Script(bootstrap, { filename: "js/report-runtime-bootstrap.js" });

assert.match(story, /0\.21\.1-story-visual-sections/);
assert.match(story, /Tell us the essentials/);
assert.match(story, /Three quick answers/);
assert.match(story, /advisory-question-card/);
assert.match(story, /Why this matters/);
assert.match(story, /storyQuickGuide/);
assert.match(story, /CHAPTER_INSIGHTS/);
assert.match(story, /Business context captured/);
assert.match(story, /People context captured/);
assert.match(story, /What your previous answers clarified/);
assert.match(story, /Who works with you\?/);
assert.match(story, /No individual salaries are requested/);
assert.match(story, /21-story-visual-sections\.css/);

assert.match(css, /grid-template-columns: repeat\(2/);
assert.match(css, /align-items: stretch/);
assert.match(css, /fieldset\.advisory-question-card > legend/);
assert.match(css, /advisory-question-card--wide/);
assert.match(css, /advisory-help-disclosure/);
assert.match(css, /advisory-industry-adaptive__heading/);
assert.match(css, /advisory-chapter-insight/);
assert.match(css, /min-height: 118px/);
assert.match(css, /@media \(max-width: 820px\)/);

assert.match(reportCore, /0\.21\.1-visual-sectioned-report/);
assert.match(reportCore, /visual-sectioned-v4/);
assert.match(report, /visual-sectioned-v4/);
[
    "Table of Contents",
    "At a glance",
    "What to do now",
    "Complete the picture",
    "Your 90-day plan",
    "Watch as you grow",
    "The profile used",
    "End of Report"
].forEach((section) => assert.match(`${reportRenderers}\n${report}`, new RegExp(section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));
assert.match(reportRenderers, /Designed for quick decisions—not a legal lecture/);
assert.match(reportRenderers, /drawCentredLogo/);
assert.match(reportRenderers, /How to read these results/);
assert.match(reportRenderers, /No People compliance law is currently indicated as applicable/);
assert.match(reportRenderers, /This is not a legal exemption or certification/);
assert.match(reportRenderers, /Open official source/);
assert.match(reportRenderers, /link: \{ label: "Open official source"/);
assert.match(reportRenderers, /renderContents/);
assert.match(reportRenderers, /writer\.sectionPages\.end/);
assert.match(report, /readingSections/);
assert.doesNotMatch(reportRenderers, /Strategic Recommendations/);
assert.doesNotMatch(reportRenderers, /Current Legal Position/);

assert.match(bootstrap, /story-visual-sections-v021\.js/);
assert.match(bootstrap, /report-visual-core-v021\.js/);
assert.match(bootstrap, /report-visual-renderers-v021\.js/);
assert.match(bootstrap, /report-visual-sections-v021\.js/);
assert.match(bootstrap, /visual-sectioned-v4/);

console.log("v0.21 visual story and report checks passed.");