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
assert.match(shellSource, /if \(document\.body\)\s*\{\s*renderSiteShell\(\)/,
    "The shared shell must render immediately when a deferred head script finds body available.");
assert.doesNotMatch(shellSource, /if \(document\.readyState === ["']loading["']\) document\.addEventListener\(["']DOMContentLoaded["'], renderSiteShell/,
    "The shell must not always wait for DOMContentLoaded after body parsing has completed.");

console.log(`Site shell first-paint checks passed for ${shellPages.length} pages.`);
