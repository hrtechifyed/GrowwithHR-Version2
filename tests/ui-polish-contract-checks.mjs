import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const [siteShell, shellCss, uiCss, approvedCss, homepage, homepageRuntime, officialResources, moreInfo, hub, workforce, productHomeCss, styles, variablesCss, unifiedButtonsCss, homepageReleaseCss] = await Promise.all([
  read("js/site-shell.js"),
  read("css/18-site-shell.css"),
  read("css/25-ui-polish.css"),
  read("css/31-approved-template.css"),
  read("index.html"),
  read("app.js"),
  read("official-resources.html"),
  read("more-info.html"),
  read("intelligence-hub.html"),
  read("workforce-capability-planning.html"),
  read("css/34-homepage-product-led.css"),
  read("styles.css"),
  read("css/01-variables.css"),
  read("css/36-unified-action-buttons.css"),
  read("css/35-homepage-product-led-release.css")
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
assert.match(approvedCss, /site-nav-link\[href\$="my-reports\.html"\][\s\S]*display:none/i);
assert.match(approvedCss, /intelligence-hub-page \.analysis-workspace[\s\S]*display:none/i);

assert.match(homepage, /class="ph-primary" href="intelligence-hub\.html">Start an Assessment/);
assert.match(homepage, /class="ph-secondary" href="sample-reports\.html">View a Sample Report/);
assert.match(homepage, /data-testid="home-product-preview"/);
assert.match(homepage, /data-testid="home-report-preview"/);
assert.match(homepage, /No arbitrary scores/i);
assert.match(homepage, /Review may be required/);
assert.doesNotMatch(homepage, /Open My Reports|Recovery Code|recover previous saved company/i);
assert.doesNotMatch(homepage, /Talent Intelligence \(Planned\)/);
assert.doesNotMatch(homepage, /Leadership Intelligence \(Planned\)/);
assert.doesNotMatch(homepageRuntime, /fetch\(/);
assert.doesNotMatch(homepageRuntime, /setInterval\(/);
assert.match(productHomeCss, /\.ph-hero-grid/);
assert.match(productHomeCss, /\.ph-report-window/);
assert.match(productHomeCss, /@media \(max-width: 760px\)/);

assert.match(hub, /Multiple specialist analysis engines/);
assert.match(hub, /COMPANY INTELLIGENCE ORCHESTRATOR/);
assert.match(hub, /workforce-capability-planning\.html/);
assert.match(hub, /analysis-engine-grid/);

assert.match(workforce, /One analysis\. Three planning lenses\./);
assert.match(workforce, /Implementation economics/);
assert.match(workforce, /Methodology &amp; Rules/);

assert.doesNotMatch(officialResources, /sticky-card-debug\.js/);
assert.match(officialResources, /Workforce &amp; Capability Planning/);
assert.match(moreInfo, /Progress on this device/);
assert.doesNotMatch(moreInfo, /Reusable Company Workspace|Workspace Recovery Code|one-time opaque handoff token/i);
assert.match(moreInfo, /Anurag Sinha/);
assert.match(moreInfo, /How can I contact HRTechify\?/);
assert.match(moreInfo, /hrtechifyed@gmail\.com/);
assert.match(moreInfo, /HRTechify on LinkedIn/);

/* Action-button design contract: one canonical component must be loaded by both
   bundled and isolated pages and cover every current product button family. */
assert.match(styles, /36-unified-action-buttons\.css/);
assert.match(variablesCss, /36-unified-action-buttons\.css/);
assert.match(homepageReleaseCss, /36-unified-action-buttons\.css/);
for (const selector of [
  ".primary-btn",
  ".secondary-btn",
  ".ph-card-action",
  ".org-primary",
  ".org-secondary",
  ".wcp-primary",
  ".wcp-secondary",
  ".dna-primary-button",
  ".dna-secondary-button",
  ".gwh-web-primary",
  ".gwh-web-secondary",
  ".gwh-auth-submit"
]) {
  assert.ok(unifiedButtonsCss.includes(selector), `Unified button system must include ${selector}`);
}
assert.match(unifiedButtonsCss, /--gwh-action-height:\s*54px/);
assert.match(unifiedButtonsCss, /border-bottom:\s*3px solid var\(--gwh-action-edge\)/);
assert.match(unifiedButtonsCss, /translateY\(-3px\)/);
assert.match(unifiedButtonsCss, /:focus-visible/);
assert.match(unifiedButtonsCss, /prefers-reduced-motion/);
assert.doesNotMatch(unifiedButtonsCss, /site-nav-toggle|site-nav-analyze__toggle|site-nav-more__toggle|accordion-trigger/);

console.log("GrowWithHR unified navigation and UI polish contracts passed.");
