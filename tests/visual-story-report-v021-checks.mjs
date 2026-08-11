import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const story = fs.readFileSync("js/story-visual-sections-v021.js", "utf8");
const reportCore = fs.readFileSync("js/report-visual-core-v021.js", "utf8");
const brandTemplate = fs.readFileSync("js/report-brand-template-v022.js", "utf8");
const reportRenderers = fs.readFileSync("js/report-visual-renderers-v021.js", "utf8");
const executiveSummary = fs.readFileSync("js/report-executive-summary-v022.js", "utf8");
const templateParity = fs.readFileSync("js/report-template-parity-v022.js", "utf8");
const identity = fs.readFileSync("js/report-identity-v1.js", "utf8");
const founderDemo = fs.readFileSync("js/report-founder-demo-single-v1.js", "utf8");
const report = fs.readFileSync("js/report-visual-sections-v021.js", "utf8");
const serverSingle = fs.readFileSync("server-single-report-delivery.js", "utf8");
const serverEntry = fs.readFileSync("server-entry.js", "utf8");
const dashboard = fs.readFileSync("advisory-dashboard.html", "utf8");
const css = fs.readFileSync("css/21-story-visual-sections.css", "utf8");
const polishCss = fs.readFileSync("css/22-story-visual-polish.css", "utf8");
const bootstrap = fs.readFileSync("js/report-runtime-bootstrap.js", "utf8");

[
    [story, "js/story-visual-sections-v021.js"],
    [reportCore, "js/report-visual-core-v021.js"],
    [brandTemplate, "js/report-brand-template-v022.js"],
    [reportRenderers, "js/report-visual-renderers-v021.js"],
    [executiveSummary, "js/report-executive-summary-v022.js"],
    [templateParity, "js/report-template-parity-v022.js"],
    [identity, "js/report-identity-v1.js"],
    [founderDemo, "js/report-founder-demo-single-v1.js"],
    [report, "js/report-visual-sections-v021.js"],
    [serverSingle, "server-single-report-delivery.js"],
    [serverEntry, "server-entry.js"],
    [bootstrap, "js/report-runtime-bootstrap.js"]
].forEach(([source, filename]) => new vm.Script(source, { filename }));

assert.match(story, /0\.21\.1-story-visual-sections/);
assert.match(story, /Tell us the essentials/);
assert.match(story, /Three quick answers/);
assert.match(story, /advisory-question-card/);
assert.match(story, /Why this matters/);
assert.match(story, /storyQuickGuide/);
assert.match(story, /CHAPTER_INSIGHTS/);
assert.match(story, /Business context captured/);
assert.match(story, /People context captured/);
assert.match(story, /Who works with you\?/);
assert.match(story, /No individual salaries are requested/);

assert.match(css, /grid-template-columns: repeat\(2/);
assert.match(css, /align-items: stretch/);
assert.match(css, /@media \(max-width: 820px\)/);
assert.match(polishCss, /summary::before/);
assert.doesNotMatch(polishCss, /border-radius:\s*50%/);

assert.match(identity, /\/api\/report-id/);
assert.match(identity, /GrowWithHRReportIdentity/);
assert.match(identity, /could not reserve a unique report ID/);

assert.match(founderDemo, /hrtechify-founder-compliance-growth-v1/);
assert.match(founderDemo, /assets\/hrtechify-logo\.png/);
assert.match(founderDemo, /HR COMPLIANCE/);
assert.match(founderDemo, /& GROWTH REPORT/);
assert.match(founderDemo, /END OF REPORT/);
assert.match(founderDemo, /Your company profile/);
assert.match(founderDemo, /Your HR compliance position/);
assert.match(founderDemo, /Compliance areas relevant today/);
assert.match(founderDemo, /Information that could change this report/);
assert.match(founderDemo, /Growth compliance radar/);
assert.match(founderDemo, /Your founder action list/);
assert.match(founderDemo, /How GrowWithHR reached this report/);
assert.match(founderDemo, /Report basis, scope & limitations/);
assert.match(founderDemo, /usedForDecision: false/);
assert.match(founderDemo, /applicabilityAuthority: none/);
assert.match(founderDemo, /Source authority/);
assert.match(founderDemo, /Secondary research/);
assert.match(founderDemo, /Needs legal review/);
assert.match(founderDemo, /singleEdition: true/);
assert.match(founderDemo, /scorecards: false/);
assert.match(founderDemo, /evidenceUpload: false/);
assert.match(founderDemo, /selectedThemes: \(\) => \["standard"\]/);
assert.doesNotMatch(founderDemo, /statCard\(/);
assert.doesNotMatch(founderDemo, /Upload evidence/i);

assert.match(report, /founder-demo-single-v1/);
assert.match(report, /attachmentCount: 1/);
assert.match(report, /selectedThemes: \["standard"\]/);
assert.match(report, /singleReportDelivery: true/);
assert.match(report, /dualThemeDelivery: false/);
assert.match(report, /single-pdf-one-email/);
assert.match(report, /reportId: identityRecord\.reportId/);
assert.doesNotMatch(report, /two-separate-pdfs-one-email/);

assert.match(bootstrap, /report-identity-v1\.js/);
assert.match(bootstrap, /report-founder-demo-single-v1\.js/);
assert.match(bootstrap, /founderDemoSingleReport: true/);
assert.match(bootstrap, /singleReportDelivery: true/);
assert.match(bootstrap, /darkReportAvailable: false/);
assert.doesNotMatch(bootstrap, /dual-edition-email-v022\.js/);
assert.doesNotMatch(bootstrap, /singleEmailDualEdition/);

assert.match(serverEntry, /handleReportIdRequest/);
assert.match(serverEntry, /handleSingleReportDeliveryRequest/);
assert.doesNotMatch(serverEntry, /handleDualEditionDeliveryRequest/);
assert.doesNotMatch(serverEntry, /handleM4DeliveryRequest/);
assert.match(serverSingle, /Exactly one standard GrowWithHR report PDF is required/);
assert.match(serverSingle, /Dark report variants are no longer supported/);
assert.match(serverSingle, /attachmentCount: 1/);
assert.match(serverSingle, /reportThemes: \["standard"\]/);
assert.match(serverSingle, /one PDF/);

assert.doesNotMatch(dashboard, /Dark Version/i);
assert.doesNotMatch(dashboard, /name="reportTheme"/i);
assert.doesNotMatch(dashboard, /Choose the report style/i);
assert.match(dashboard, /standard HRTechify format/);

const registry = require("../server-report-id-registry.js");

const first = registry.nextSequence({ width: 2, letters: "AA", number: 0 });
assert.deepEqual(first, { width: 2, letters: "AA", number: 1 });
assert.equal(registry.sequenceSuffix(first), "AA01");

const nextLetter = registry.nextSequence({ width: 2, letters: "AA", number: 99 });
assert.deepEqual(nextLetter, { width: 2, letters: "AB", number: 1 });
assert.equal(registry.sequenceSuffix(nextLetter), "AB01");

const expandToThree = registry.nextSequence({ width: 2, letters: "ZZ", number: 99 });
assert.deepEqual(expandToThree, { width: 3, letters: "AAA", number: 1 });
assert.equal(registry.sequenceSuffix(expandToThree), "AAA001");

const expandToFour = registry.nextSequence({ width: 3, letters: "ZZZ", number: 999 });
assert.deepEqual(expandToFour, { width: 4, letters: "AAAA", number: 1 });
assert.equal(registry.sequenceSuffix(expandToFour), "AAAA0001");

assert.equal(
    registry.reportIdFor({ width: 2, letters: "AA", number: 1 }, new Date("2026-08-11T10:00:00Z")),
    "GWHR-2026-0811-AA01"
);
assert.equal(registry.emptyRegistry().sequencePolicy, "global-non-resetting-symmetric-alpha-numeric");

console.log("Founder-demo single report, clean layout and persistent report-ID checks passed.");
