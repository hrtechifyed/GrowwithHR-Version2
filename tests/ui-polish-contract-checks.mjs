import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const [siteShell, uiCss, uiJs, homepage, homepageRuntime, officialResources, moreInfo] = await Promise.all([
  read("js/site-shell.js"),
  read("css/25-ui-polish.css"),
  read("js/ui-polish.js"),
  read("index.html"),
  read("app.js"),
  read("official-resources.html"),
  read("more-info.html")
]);

assert.match(siteShell, /<strong>GrowWithHR<\/strong> by HRTechify/);
assert.match(siteShell, /The-Corporatex\/index\.html#about/);
assert.match(siteShell, /The-Corporatex\/privacy-safety\.html/);
assert.match(siteShell, /mailto:hrtechifyed@gmail\.com/);
assert.match(siteShell, /Security & Data/);
assert.match(siteShell, /My Reports/);
assert.match(siteShell, /© 2026 HRTechify\. All rights reserved\./);
assert.match(siteShell, /removeHomepageTriggerStrip/);
assert.match(siteShell, /index\.html#home/);
assert.match(siteShell, /intelligence-hub\.html/);
assert.doesNotMatch(siteShell, /HRTechify ↗/);
assert.match(siteShell, /setBackgroundInert/);
assert.match(siteShell, /event\.key !== "Tab"/);

assert.match(uiCss, /:focus-visible/);
assert.match(uiCss, /grid-template-columns: minmax\(0, 1fr\) auto minmax\(0, 1fr\)/);
assert.match(uiCss, /body\.intelligence-hub-page \.hub-engine-section/);
assert.match(uiCss, /body\[data-active-nav="analyze"\] \.org/);
assert.match(uiCss, /@media \(prefers-reduced-motion: reduce\)/);

assert.match(homepage, /href="intelligence-hub\.html" class="primary-btn">Understand My Company/);
assert.match(homepage, /href="sample-reports\.html" class="secondary-btn">Explore Sample Reports/);
assert.match(homepage, /Compliance Needs/);
assert.match(homepage, /Organization Structure/);
assert.match(homepage, /Current Product/i);
assert.doesNotMatch(homepage, /Talent Intelligence \(Planned\)/);
assert.doesNotMatch(homepage, /Leadership Intelligence \(Planned\)/);
assert.doesNotMatch(homepage, />Analyze My Company</);
assert.doesNotMatch(homepage, />View Sample Advisory</);
assert.match(homepage, /Interactive preview/);
assert.doesNotMatch(homepage, /es-module-shims/);
assert.doesNotMatch(homepage, /three@/);

assert.doesNotMatch(homepageRuntime, /fetch\(/);
assert.doesNotMatch(homepageRuntime, /setInterval\(/);
assert.match(homepageRuntime, /aria-pressed/);
assert.match(homepageRuntime, /new CustomEvent\(eventName/);

assert.match(uiJs, /Choose an analysis/);
assert.match(uiJs, /hubDeleteConfirmDialog/);
assert.match(uiJs, /org-step-panel/);
assert.match(uiJs, /carousel-progress/);
assert.match(uiJs, /Source library last verified/);
assert.match(uiJs, /sample-report-nav/);

assert.doesNotMatch(officialResources, /sticky-card-debug\.js/);
assert.doesNotMatch(moreInfo, /sticky-card-debug\.js/);
assert.match(moreInfo, /Progress on this device/);
assert.match(moreInfo, /Reusable Company Workspace/);
assert.match(moreInfo, /Deletion and reminders/);
assert.match(moreInfo, /Report download and delivery activity/);
assert.match(moreInfo, /Anurag Sinha/);

console.log("GrowWithHR UI polish contracts passed.");
