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
includes(siteShell, "HRTechify - People • Technology • Growth", "The shared footer must retain the current HRTechify brand line.");
includes(siteShell, "© 2026 All Rights Reserved.", "The shared footer must retain the rights line.");
includes(siteShell, 'class="site-nav-toggle"', "The shared shell must provide mobile navigation.");
includes(siteShell, 'aria-expanded="false"', "Mobile navigation must begin collapsed.");
includes(siteShell, 'aria-controls="siteNavLinks"', "The navigation toggle must identify its controlled links.");
includes(siteShell, 'nav.classList.add("is-open")', "The shared navigation must support opening.");
includes(siteShell, 'nav.classList.remove("is-open")', "The shared navigation must support closing.");
includes(siteShell, 'event.key === "Escape"', "The shared navigation must support keyboard dismissal.");

const home = read("index.html");
includes(home, 'id="home"', "The homepage hero must remain available.");
includes(home, 'href="sample-advisory-report.html"', "The sample advisory CTA must retain its destination.");
includes(home, "View Sample Advisory", "The sample advisory CTA must remain visible.");
includes(home, "Executive Intelligence", "The executive-intelligence preview must remain visible.");
assert(home.indexOf("View Sample Advisory") < home.indexOf("Executive Intelligence"), "The sample advisory CTA must appear before the executive-intelligence preview.");
includes(home, 'data-testid="home-executive-stack"', "The homepage intelligence-stack test hook is required.");
assert(!home.includes("backupstyles.css"), "The obsolete backup stylesheet must not be loaded.");

const heroCss = read("css/06-hero.css");
includes(heroCss, ".hero-dashboard-layout", "The executive-intelligence layout is required.");
includes(heroCss, "grid-template-areas:", "The executive-intelligence layout must define responsive grid areas.");
includes(heroCss, ".hero-sidebar", "The executive-intelligence controls are required.");
includes(heroCss, "grid-template-columns:repeat(3, 1fr);", "The desktop intelligence cards must use three equal columns.");
includes(heroCss, "introStackCardEnter", "The homepage cards must retain their staged entrance animation.");

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

const playwrightSpec = read("tests/playwright/growwithhr-ui.spec.js");
assert(/from\s+["']@playwright\/test["']/.test(playwrightSpec), "The Playwright UI test must import @playwright/test.");

const workspaceHtml = read("m5-compliance-workspace.html");
includes(workspaceHtml, "Compliance Workspace Beta", "The M5 private workspace must remain available.");
includes(workspaceHtml, "Nothing on this page is uploaded to a server", "The M5 workspace must disclose its browser-local boundary.");

console.log("Static requirement checks passed.");