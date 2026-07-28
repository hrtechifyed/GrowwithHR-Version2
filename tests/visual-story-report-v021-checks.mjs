import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const story = fs.readFileSync("js/story-visual-sections-v021.js", "utf8");
const reportCore = fs.readFileSync("js/report-visual-core-v021.js", "utf8");
const brandTemplate = fs.readFileSync("js/report-brand-template-v022.js", "utf8");
const reportRenderers = fs.readFileSync("js/report-visual-renderers-v021.js", "utf8");
const executiveSummary = fs.readFileSync("js/report-executive-summary-v022.js", "utf8");
const report = fs.readFileSync("js/report-visual-sections-v021.js", "utf8");
const dualEmail = fs.readFileSync("js/dual-edition-email-v022.js", "utf8");
const serverDualDelivery = fs.readFileSync("server-dual-edition-delivery.js", "utf8");
const serverEntry = fs.readFileSync("server-entry.js", "utf8");
const css = fs.readFileSync("css/21-story-visual-sections.css", "utf8");
const polishCss = fs.readFileSync("css/22-story-visual-polish.css", "utf8");
const bootstrap = fs.readFileSync("js/report-runtime-bootstrap.js", "utf8");

new vm.Script(story, { filename: "js/story-visual-sections-v021.js" });
new vm.Script(reportCore, { filename: "js/report-visual-core-v021.js" });
new vm.Script(brandTemplate, { filename: "js/report-brand-template-v022.js" });
new vm.Script(reportRenderers, { filename: "js/report-visual-renderers-v021.js" });
new vm.Script(executiveSummary, { filename: "js/report-executive-summary-v022.js" });
new vm.Script(report, { filename: "js/report-visual-sections-v021.js" });
new vm.Script(dualEmail, { filename: "js/dual-edition-email-v022.js" });
new vm.Script(serverDualDelivery, { filename: "server-dual-edition-delivery.js" });
new vm.Script(serverEntry, { filename: "server-entry.js" });
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
assert.match(polishCss, /summary::before/);
assert.match(polishCss, /border: 0/);
assert.match(polishCss, /border-radius: 0/);
assert.doesNotMatch(polishCss, /border-radius:\s*50%/);

assert.match(reportCore, /0\.21\.1-visual-sectioned-report/);
assert.match(brandTemplate, /0\.22\.1-shared-hrtechify-template/);
assert.match(brandTemplate, /hrtechify-action-brief-shared-v1/);
assert.match(brandTemplate, /assets\/hrtechify-logo\.png/);
assert.match(brandTemplate, /sameLayoutForLightAndDark: true/);
assert.match(brandTemplate, /drawPageBrand/);
assert.match(brandTemplate, /createWriter/);
assert.doesNotMatch(brandTemplate, /assets\/(?!hrtechify-logo\.png)[^"']*logo[^"']*/i);

assert.match(executiveSummary, /0\.22\.1-profile-tailored-executive-summary/);
assert.match(executiveSummary, /visual-sectioned-v5/);
assert.match(executiveSummary, /Executive summary/);
assert.match(executiveSummary, /What this means for you/);
assert.match(executiveSummary, /What lies ahead/);
assert.match(executiveSummary, /organisationProfile/);
assert.match(executiveSummary, /legalFamily/);
assert.match(executiveSummary, /sectorFamily/);
assert.match(executiveSummary, /workforceStage/);
assert.match(executiveSummary, /workforceMix/);
assert.match(executiveSummary, /multiState/);
assert.match(executiveSummary, /shifts/);
assert.match(executiveSummary, /manufacturing/);
[
    "owner-only",
    "micro-team",
    "emerging-team",
    "growing-team",
    "established-team",
    "scaled-workforce",
    "contractor-led",
    "mixed-workforce",
    "knowledge-services",
    "customer-operations",
    "care-education",
    "site-operations",
    "financial-services"
].forEach((profileSignal) => assert.match(executiveSummary, new RegExp(profileSignal)));
assert.match(executiveSummary, /No current trigger/);
assert.match(executiveSummary, /No review item/);
assert.match(executiveSummary, /All key inputs given/);
assert.match(executiveSummary, /No watch item/);
assert.match(executiveSummary, /This is not a legal exemption or certification/);
assert.doesNotMatch(executiveSummary, /buildBundleVariant/);
assert.doesNotMatch(executiveSummary, /Light-and-Dark/);

assert.match(report, /visual-sectioned-v5/);
assert.match(report, /oneEmailDelivery/);
assert.match(report, /emailAttachments/);
assert.match(report, /deliveryAttachments/);
assert.match(report, /two-separate-pdfs-one-email/);
assert.match(report, /hrtechify-action-brief-shared-v1/);
assert.match(report, /assets\/hrtechify-logo\.png/);
assert.match(report, /colour-palette-only/);
assert.match(report, /sharedTemplateParity/);
assert.doesNotMatch(report, /buildBundleVariant/);

assert.match(dualEmail, /two-separate-pdfs-one-email/);
assert.match(dualEmail, /X-GrowWithHR-Attachment-Count/);
assert.match(dualEmail, /pdfs: attachments/);
assert.match(dualEmail, /attachmentCount: 2/);
assert.doesNotMatch(dualEmail, /Light-and-Dark\.pdf/);
assert.match(serverDualDelivery, /Exactly two PDF attachments/);
assert.match(serverDualDelivery, /one Light report and one Dark report/);
assert.match(serverDualDelivery, /same report template/);
assert.match(serverDualDelivery, /attachments/);
assert.match(serverDualDelivery, /attachmentFilenames/);
assert.match(serverEntry, /handleDualEditionDeliveryRequest/);
assert.match(serverEntry, /X-GrowWithHR-Attachment-Count/);

[
    "Table of Contents",
    "Executive summary",
    "At a glance",
    "What to do now",
    "Complete the picture",
    "Your 90-day plan",
    "Watch as you grow",
    "The profile used",
    "End of Report"
].forEach((section) => assert.match(`${reportRenderers}\n${executiveSummary}\n${report}`, new RegExp(section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));
assert.match(reportRenderers, /Designed for quick decisions—not a legal lecture/);
assert.match(reportRenderers, /drawCentredLogo/);
assert.match(reportRenderers, /Open official source/);
assert.match(reportRenderers, /link: \{ label: "Open official source"/);
assert.match(report, /readingSections/);
assert.doesNotMatch(reportRenderers, /Strategic Recommendations/);
assert.doesNotMatch(reportRenderers, /Current Legal Position/);

assert.match(bootstrap, /story-visual-sections-v021\.js/);
assert.match(bootstrap, /report-visual-core-v021\.js/);
assert.match(bootstrap, /report-brand-template-v022\.js/);
assert.match(bootstrap, /report-visual-renderers-v021\.js/);
assert.match(bootstrap, /report-executive-summary-v022\.js/);
assert.match(bootstrap, /report-visual-sections-v021\.js/);
assert.match(bootstrap, /dual-edition-email-v022\.js/);
assert.match(bootstrap, /visual-sectioned-v5/);
assert.match(bootstrap, /singleEmailDualEdition/);
assert.match(bootstrap, /profileTailoredExecutiveSummary/);
assert.match(bootstrap, /sharedLightDarkTemplate/);
assert.match(bootstrap, /assets\/hrtechify-logo\.png/);

console.log("v0.22 shared HRTechify template, profile summary and two-attachment email checks passed.");
