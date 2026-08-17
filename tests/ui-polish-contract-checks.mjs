import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const [siteShell, uiCss, uiJs, homepage, homepageRuntime, officialResources, moreInfo, brandCss] = await Promise.all([
  read("js/site-shell.js"),
  read("css/25-ui-polish.css"),
  read("js/ui-polish.js"),
  read("index.html"),
  read("app.js"),
  read("official-resources.html"),
  read("more-info.html"),
  read("css/26-brand-unification.css")
]);

assert.match(siteShell, /GrowWithHR by HRTechify/);
assert.match(siteShell, /About/);
assert.match(siteShell, /Privacy/);
assert.match(siteShell, /Contact/);
assert.match(siteShell, /© 2026 HRTechify\. All rights reserved\./);
assert.match(siteShell, /index\.html#home/);
assert.match(siteShell, /Company Insights/);
assert.match(siteShell, /Evidence & Sources/);
assert.match(siteShell, /Sample Reports/);
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
assert.match(homepage, /Organization Structure \(Available\)/);
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

assert.match(brandCss, /hub-engine-card__action/);
assert.match(brandCss, /gradient-brand/);
assert.match(brandCss, /Semantic status colours remain distinct/i);

assert.doesNotMatch(officialResources, /sticky-card-debug\.js/);
assert.doesNotMatch(moreInfo, /sticky-card-debug\.js/);
assert.match(moreInfo, /Progress on this device/);
assert.match(moreInfo, /Reusable Company Workspace/);
assert.match(moreInfo, /Secure new-tab handoff/);
assert.match(moreInfo, /Report activity metadata/);
assert.match(moreInfo, /Deletion and reminders/);

console.log("GrowWithHR UI polish contracts passed.");