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

assert.match(story, /0\.21\.0-story-visual-sections/);
assert.match(story, /Tell us the essentials/);
assert.match(story, /Three quick answers/);
assert.match(story, /advisory-question-card/);
assert.match(story, /Why this matters/);
assert.match(story, /storyQuickGuide/);
assert.match(story, /21-story-visual-sections\.css/);

assert.match(css, /grid-template-columns: repeat\(2/);
assert.match(css, /advisory-question-card--wide/);
assert.match(css, /advisory-help-disclosure/);
assert.match(css, /@media \(max-width: 820px\)/);

assert.match(reportCore, /0\.21\.0-visual-sectioned-report/);
assert.match(report, /visual-sectioned-v3/);
[
    "At a glance",
    "What to do now",
    "Complete the picture",
    "Your 90-day plan",
    "Watch as you grow",
    "The profile used"
].forEach((section) => assert.match(`${reportRenderers}\n${report}`, new RegExp(section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));
assert.match(reportRenderers, /Designed for quick decisions—not a legal lecture/);
assert.match(reportRenderers, /Official source/);
assert.match(report, /readingSections/);
assert.doesNotMatch(reportRenderers, /Strategic Recommendations/);
assert.doesNotMatch(reportRenderers, /Current Legal Position/);

assert.match(bootstrap, /story-visual-sections-v021\.js/);
assert.match(bootstrap, /report-visual-core-v021\.js/);
assert.match(bootstrap, /report-visual-renderers-v021\.js/);
assert.match(bootstrap, /report-visual-sections-v021\.js/);
assert.match(bootstrap, /visual-sectioned-v3/);

console.log("v0.21 visual story and report checks passed.");
