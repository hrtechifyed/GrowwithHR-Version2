import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function walk(directory) {
    const output = [];
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        if ([".git", "node_modules", "archive", "archives"].includes(entry.name)) continue;
        const full = path.join(directory, entry.name);
        if (entry.isDirectory()) output.push(...walk(full));
        else if (entry.isFile() && entry.name.endsWith(".html")) output.push(full);
    }
    return output;
}

const shellPages = [];
for (const file of walk(root)) {
    const source = fs.readFileSync(file, "utf8");
    if (!source.includes("site-shell.js")) continue;
    shellPages.push(path.relative(root, file));

    const headMatch = source.match(/<head[\s\S]*?<\/head>/i);
    assert.ok(headMatch, `${path.relative(root, file)} must have a head element.`);
    const head = headMatch[0];
    const loaders = source.match(/<script\b[^>]*\bsrc=["'][^"']*js\/site-shell\.js(?:[?#][^"']*)?["'][^>]*>\s*<\/script>/gi) || [];
    assert.equal(loaders.length, 1, `${path.relative(root, file)} must load site-shell.js exactly once.`);
    assert.match(head, /<script\b[^>]*\bsrc=["'][^"']*js\/site-shell\.js(?:[?#][^"']*)?["'][^>]*\bdefer\b[^>]*>\s*<\/script>/i,
        `${path.relative(root, file)} must fetch the shared navigation from head with defer.`);
}

assert.ok(shellPages.length >= 8, "Expected the active GrowWithHR routes to use the shared site shell.");

const shellSource = fs.readFileSync(path.join(root, "js/site-shell.js"), "utf8");
const immediateBodyBootstrap = /if \(document\.body\)\s*(?:\{\s*)?renderSiteShell\(\)/.test(shellSource);
const deferredReadyStateBootstrap = /if \(document\.readyState === ["']loading["']\)[\s\S]*DOMContentLoaded[\s\S]*else\s*\{\s*renderSiteShell\(\)/.test(shellSource);
assert.ok(
    immediateBodyBootstrap || deferredReadyStateBootstrap,
    "The deferred shared shell must render immediately once parsing has progressed beyond loading."
);
assert.match(shellSource, /document\.getElementById\(["']dnaCoreCanvas["']\)/,
    "The shared shell must detect the homepage intelligence graph container.");
assert.match(shellSource, /import\(["']\.\/intelligence-core\.js["']\)/,
    "The homepage intelligence graph must have an independent module bootstrap fallback.");
assert.match(shellSource, /css\/25-ui-polish\.css/,
    "The shared shell must load the final cross-page UI/accessibility polish layer.");
assert.doesNotMatch(shellSource, /26-header-brand-lockup\.css/,
    "The shared shell must not load a second navbar geometry layer.");
assert.match(shellSource, /<strong>GrowWithHR<\/strong> by HRTechify/,
    "The shared shell must expose the approved left-aligned GrowWithHR footer brand line.");
assert.match(shellSource, /The-Corporatex\/index\.html#about/,
    "The footer About link must point to the HRTechify corporate About page.");
assert.match(shellSource, /The-Corporatex\/privacy-safety\.html/,
    "The footer Privacy link must point to the HRTechify corporate privacy page.");
assert.match(shellSource, /mailto:hrtechifyed@gmail\.com/,
    "The footer Contact link must open email to HRTechify.");
assert.match(shellSource, /removeHomepageTriggerStrip/,
    "The shared shell must remove the redundant homepage buyer-trigger strip.");
assert.match(
    shellSource,
    /<div class="site-header-shell__inner">\s*<a class="site-brand-logo"[\s\S]*?<nav class="site-nav-glass"/,
    "Every page must use the same logo-plus-navigation DOM contract from site-shell.js."
);

const buildMarkerSource = fs.readFileSync(path.join(root, "js/build-marker.js"), "utf8");
assert.doesNotMatch(buildMarkerSource, /integrateBrandIntoNavigation/,
    "The build marker must not reparent the shared brand after the site shell renders.");
assert.doesNotMatch(buildMarkerSource, /site-header-shell--integrated-brand/,
    "Runtime enhancements must not add an alternate integrated-brand navbar mode.");
assert.doesNotMatch(buildMarkerSource, /integratedBrand/,
    "Runtime enhancements must not introduce a second navbar DOM contract.");

const stylesSource = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const styleImports = [...stylesSource.matchAll(/@import\s+url\(["']([^"']+)["']\);/g)].map((match) => match[1]);
assert.equal(
    styleImports.at(-1),
    "css/18-site-shell.css",
    "The static shared site shell remains last in styles.css; the runtime polish layer is loaded explicitly afterward."
);
assert.ok(
    styleImports.indexOf("css/24-intelligence-hub.css") < styleImports.indexOf("css/18-site-shell.css"),
    "Analyze My Company styles must load before the shared site shell."
);
assert.equal(
    styleImports.filter((item) => item.includes("header-brand-lockup")).length,
    0,
    "The stylesheet bundle must not include a second shared-navbar parity layer."
);

const shellCss = fs.readFileSync(path.join(root, "css/18-site-shell.css"), "utf8");
const presentationCss = fs.readFileSync(path.join(root, "css/19-presentation-polish.css"), "utf8");
assert.match(shellCss, /\.site-header-shell__inner\s*\{/,
    "Shared navbar geometry must be defined by css/18-site-shell.css.");
assert.match(shellCss, /\.site-nav-glass\s*\{/,
    "Shared navigation capsule geometry must be defined by css/18-site-shell.css.");
assert.match(shellCss, /\.site-brand-logo\s*\{/,
    "Shared logo geometry must be defined by css/18-site-shell.css.");
assert.doesNotMatch(presentationCss, /(^|\n)\s*\.site-header-shell__inner\s*\{/,
    "Page-level presentation CSS must not redefine the shared header layout.");
assert.doesNotMatch(presentationCss, /(^|\n)\s*\.site-nav-glass\s*\{/,
    "Page-level presentation CSS must not redefine the shared navigation capsule.");
assert.doesNotMatch(presentationCss, /(^|\n)\s*\.site-brand-logo\s*\{/,
    "Page-level presentation CSS must not move or resize the shared logo.");

console.log(`Site shell first-paint checks passed for ${shellPages.length} pages, including one canonical navbar layout source, independent homepage graph bootstrap, shared footer and final polish loading.`);
