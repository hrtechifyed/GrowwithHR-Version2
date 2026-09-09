import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const [siteShell, shellCss, uiCss, homepage, homepageRuntime, officialResources, moreInfo, hub, workforce] = await Promise.all([
  read("js/site-shell.js"),
  read("css/18-site-shell.css"),
  read("css/25-ui-polish.css"),
  read("index.html"),
  read("app.js"),
  read("official-resources.html"),
  read("more-info.html"),
  read("intelligence-hub.html"),
  read("workforce-capability-planning.html")
]);

assert.match(siteShell, /<strong>GrowWithHR<\/strong> by HRTechify/);
assert.match(siteShell, /mailto:hrtechifyed@gmail\.com/);
assert.match(siteShell, /Company Analysis Overview/);
assert.match(siteShell, /Organization & Growth/);
assert.match(siteShell, /HR Compliance Readiness/);
assert.match(siteShell, /Workforce & Capability Planning/);
assert.match(siteShell, /Change Intelligence/);
assert.match(siteShell, /site-nav-analyze__toggle/);
assert.match(siteShell, /site-nav-analyze__menu/);
assert.match(siteShell, /My Reports/);
assert.match(siteShell, /Sources & Methodology/);
assert.match(siteShell, /Sample Reports/);
assert.match(siteShell, /© 2026 HRTechify\. All rights reserved\./);
assert.match(siteShell, /setBackgroundInert/);
assert.match(siteShell, /event\.key !== "Tab"/);

assert.match(shellCss, /\.site-header-shell\s*\{/);
assert.match(shellCss, /position:\s*relative/);
assert.match(shellCss, /\.site-nav-analyze/);
assert.match(shellCss, /\.site-nav-analyze__menu/);
assert.match(shellCss, /\.site-brand-logo/);
assert.match(shellCss, /\.site-nav-glass/);
assert.doesNotMatch(shellCss, /\.site-header-shell\s*\{[\s\S]{0,220}?position:\s*fixed/);

assert.match(uiCss, /:focus-visible/);
assert.match(uiCss, /grid-template-columns: minmax\(0, 1fr\) auto minmax\(0, 1fr\)/);
assert.match(uiCss, /body\.intelligence-hub-page/);
assert.match(uiCss, /@media \(prefers-reduced-motion: reduce\)/);

assert.match(homepage, /href="intelligence-hub\.html" class="primary-btn"[^>]*>Understand My Company/);
assert.match(homepage, /href="sample-reports\.html" class="secondary-btn"[^>]*>Explore Sample Reports/);
assert.match(homepage, /Current Product/i);
assert.match(homepage, /Welcome back!/);
assert.match(homepage, /Workforce &amp; Capability Planning/);
assert.match(homepage, /gwhr-approved-home__preview/);
assert.doesNotMatch(homepage, /Talent Intelligence \(Planned\)/);
assert.doesNotMatch(homepage, /Leadership Intelligence \(Planned\)/);
assert.doesNotMatch(homepageRuntime, /fetch\(/);
assert.doesNotMatch(homepageRuntime, /setInterval\(/);

assert.match(hub, /Multiple specialist analysis engines/);
assert.match(hub, /COMPANY INTELLIGENCE ORCHESTRATOR/);
assert.match(hub, /workforce-capability-planning\.html/);
assert.match(hub, /analysis-engine-grid/);
assert.match(hub, /Recover your Company Workspace/);

assert.match(workforce, /One analysis\. Three planning lenses\./);
assert.match(workforce, /Implementation economics/);
assert.match(workforce, /Methodology &amp; Rules/);

assert.doesNotMatch(officialResources, /sticky-card-debug\.js/);
assert.match(officialResources, /Workforce &amp; Capability Planning/);
assert.match(moreInfo, /Progress on this device/);
assert.match(moreInfo, /Reusable Company Workspace/);
assert.match(moreInfo, /Anurag Sinha/);
assert.match(moreInfo, /How can I contact HRTechify\?/);

console.log("GrowWithHR unified navigation and UI polish contracts passed.");
