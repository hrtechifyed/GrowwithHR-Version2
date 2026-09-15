"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.resolve(__dirname, "..");
const read = (relativePath) => {
    const absolutePath = path.join(root, relativePath);
    assert(fs.existsSync(absolutePath), `Required file is missing: ${relativePath}`);
    return fs.readFileSync(absolutePath, "utf8");
};
const includes = (source, expected, message) => {
    assert(source.includes(expected), message || `Expected to find: ${expected}`);
};

const packageJson = JSON.parse(read("package.json"));
assert.match(packageJson.version, /^0\.20\.\d+(?:-[0-9A-Za-z.-]+)?$/, "Static requirements must use an approved v0.20 release.");

const htmlFiles = [
    "index.html",
    "analyze-company.html",
    "official-resources.html",
    "sample-advisory-report.html",
    "more-info.html"
];
for (const file of htmlFiles) {
    const html = read(file);
    const loadsSharedShell = /src=["'](?:\.\.\/)?js\/site-shell\.js(?:[?#][^"']*)?["']/.test(html);
    const hasStaticFooter = /<footer\b[^>]*class=["'][^"']*\bfooter\b[^"']*["']/.test(html);
    assert(loadsSharedShell || hasStaticFooter, `${file} must load the shared site shell or contain the current static footer fallback.`);
    if (hasStaticFooter && html.includes('id="productVersion"')) {
        includes(html, `GrowWithHR Public ${packageJson.version}`, `${file} must display the current release version.`);
    }
}

const siteShell = read("js/site-shell.js");
includes(siteShell, "<strong>GrowWithHR</strong> by HRTechify", "The shared footer must use the approved GrowWithHR brand line.");
includes(siteShell, "© 2026 HRTechify. All rights reserved.", "The shared footer must use the approved rights line.");
includes(siteShell, "https://hrtechifyed.github.io/The-Corporatex/index.html#about", "The shared footer must link to the HRTechify corporate About page.");
includes(siteShell, "https://hrtechifyed.github.io/The-Corporatex/privacy-safety.html", "The shared footer must link to the HRTechify corporate Privacy page.");
includes(siteShell, "mailto:hrtechifyed@gmail.com", "The shared footer must link Contact to HRTechify email.");
includes(siteShell, "removeHomepageTriggerStrip", "The shared shell must remove the redundant homepage buyer-trigger strip.");
includes(siteShell, 'class="site-nav-toggle"', "The shared shell must provide mobile navigation.");
includes(siteShell, 'aria-expanded="false"', "Mobile navigation must begin collapsed.");
includes(siteShell, 'aria-controls="siteNavLinks"', "The navigation toggle must identify its controlled links.");
includes(siteShell, 'nav.classList.add("is-open")', "The shared navigation must support opening.");
includes(siteShell, 'nav.classList.remove("is-open")', "The shared navigation must support closing.");
includes(siteShell, 'event.key === "Escape"', "The shared navigation must support keyboard dismissal.");
includes(siteShell, "setBackgroundInert", "The mobile navigation must prevent interaction with background content while open.");

const home = read("index.html");
includes(home, 'id="home"', "The homepage hero must remain available.");
includes(home, 'href="intelligence-hub.html"', "The primary assessment CTA must route through the intelligence hub.");
includes(home, "Start an Assessment", "The primary homepage assessment CTA must remain visible.");
includes(home, 'href="sample-reports.html"', "The sample reports CTA must route through the sample-report hub.");
includes(home, "View a Sample Report", "The sample report CTA must remain visible.");
includes(home, 'data-testid="home-product-preview"', "The homepage must show a qualitative product preview.");
includes(home, 'data-testid="home-report-preview"', "The homepage must show a report preview.");
includes(home, 'data-testid="home-capabilities-stack"', "The current product cards must remain visible.");
includes(home, "Organization Structure &amp; Growth · Flagship", "Organization Structure & Growth must remain the flagship product.");
includes(home, "Where could our structure constrain growth?", "Organization Structure must retain a clear growth-oriented buyer question.");
includes(home, "No arbitrary scores", "The homepage must explicitly avoid arbitrary score framing.");
includes(home, "Review may be required", "The homepage preview must use qualitative statuses.");
assert(!home.includes('data-testid="home-executive-stack"'), "The retired legacy intelligence-card preview must not reappear.");
assert(!home.includes("dnaCoreCanvas"), "The retired homepage graph must not reappear.");
assert(!home.includes("Organization Structure (Available)"), "The retired roadmap-style Organization status label must not reappear.");
assert(!home.includes(">Analyze My Company<"), "The retired homepage CTA label must not reappear.");
assert(!home.includes(">View Sample Advisory<"), "The retired single-sample CTA label must not reappear.");
assert(!home.includes("backupstyles.css"), "The obsolete backup stylesheet must not be loaded.");
assert(!home.includes("es-module-shims"), "The homepage must not load the retired module shim.");
assert(!home.includes("three@"), "The homepage must not load unused Three.js.");

const homeRuntime = read("app.js");
assert(!homeRuntime.includes("fetch("), "The marketing homepage must not eagerly load the compliance knowledge base.");
assert(!homeRuntime.includes("setInterval("), "Homepage preview controls must not auto-cycle without user control.");

const heroCss = read("css/06-hero.css");
includes(heroCss, ".hero-dashboard-layout", "The legacy executive-intelligence layout must remain available for pages that still use it.");
includes(heroCss, "grid-template-areas:", "The executive-intelligence layout must define responsive grid areas.");
includes(heroCss, ".hero-sidebar", "The executive-intelligence controls must remain styled for compatible pages.");
includes(heroCss, "grid-template-columns:repeat(3, 1fr);", "The desktop intelligence cards must retain their compatibility styling.");
includes(heroCss, "introStackCardEnter", "The compatibility stylesheet must retain its staged entrance animation.");

const productHomeCss = read("css/34-homepage-product-led.css");
includes(productHomeCss, ".ph-hero-grid", "The product-led homepage hero layout is required.");
includes(productHomeCss, ".ph-products-grid", "The product-led homepage product-card layout is required.");
includes(productHomeCss, ".ph-report-window", "The product-led homepage report preview is required.");
includes(productHomeCss, "@media (max-width: 760px)", "The product-led homepage must provide mobile behavior.");

const assessmentHtml = read("analyze-company.html");
[
    'id="assessmentShell"',
    'id="landingScreen"',
    'id="conversationWorkspace"',
    'id="reviewScreen"',
    'id="contactScreen"',
    'id="loadingScreen"',
    'id="successScreen"',
    'href="css/17-advisory-briefing.css"',
    'src="js/executive-assessment.js"'
].forEach((contract) => includes(assessmentHtml, contract, `Stable assessment contract is missing: ${contract}`));
assert(!assessmentHtml.includes('src="js/intro-sequence.js"'), "The current assessment route must not load the obsolete intro sequence.");

const assessmentJs = read("js/executive-assessment.js");
[
    "Storage.readAssessment();",
    "State.createDefaultState();",
    "this.bindEvents();",
    "this.initialiseView();"
].forEach((contract) => includes(assessmentJs, contract, `Assessment controller contract is missing: ${contract}`));

const storageJs = read("js/executive-assessment/assessment-storage.js");
includes(storageJs, '"growwithhr-advisory-briefing-v2"', "The current assessment storage key must be preserved.");
includes(storageJs, "window.localStorage.getItem", "Saved assessment progress must remain readable.");
includes(storageJs, "window.localStorage.setItem", "Assessment progress must remain writable.");

const variablesCss = read("css/01-variables.css");
[
    "--page-max-width",
    "--page-gutter",
    "--content-narrow",
    "--content-medium",
    "--content-wide",
    "--section-space",
    "--card-gap",
    "--navbar-height"
].forEach((token) => includes(variablesCss, token, `Responsive token ${token} must exist.`));

const buildMarker = read("js/build-marker.js");
includes(buildMarker, "window.GWHR_BUILD_ID", "The development build marker must remain exposed.");
includes(buildMarker, "window.GWHR_DEBUG", "Opt-in build diagnostics must remain available.");
