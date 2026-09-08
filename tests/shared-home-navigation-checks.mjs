import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'js/site-shell.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css/31-home-navigation.css'), 'utf8');
assert.match(source, /setBackgroundInert\(true, header\)/, 'Opening the mobile menu must retain background isolation.');
assert.match(source, /css\/31-home-navigation\.css/, 'The shared shell must load its Home styles.');
assert.match(css, /max-width:900px/, 'The Home label must be available in the mobile menu.');

const location = { pathname: '/GrowwithHR-Version2/index.html' };
const document = {
  body: { dataset: {} },
  currentScript: { getAttribute: name => name === 'src' ? 'js/site-shell.js' : null },
  scripts: [],
  createElement: tag => ({ tagName: tag.toUpperCase(), dataset: {}, innerHTML: '' })
};
const window = { location };
const instrumented = source.replace(
  /    if \(document\.readyState === "loading"\) \{[\s\S]*?\n    \} else \{\n        renderSiteShell\(\);\n    \}\n\}\)\(window, document\);\s*$/,
  '    window.__shellTest = { buildHeader, inferActiveNav, inferRootPrefix, withRoot };\n})(window, document);'
);
assert.notEqual(instrumented, source, 'The test must expose the existing shell functions without changing their implementations.');
vm.runInNewContext(instrumented, { window, document }, { filename: 'site-shell.js' });
const { buildHeader, inferActiveNav, inferRootPrefix, withRoot } = window.__shellTest;

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (['.git', 'node_modules', 'archive', 'archives'].includes(entry.name)) return [];
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : entry.isFile() && entry.name.endsWith('.html') ? [full] : [];
  });
}
const pages = walk(root).filter(file => /<script\b[^>]*\bsrc=["'][^"']*js\/site-shell\.js(?:[?#][^"']*)?["']/i.test(fs.readFileSync(file, 'utf8')));
assert.ok(pages.length >= 8, 'Expected the public pages to share the canonical navbar.');
let baseline = null;
for (const file of pages) {
  const route = path.relative(root, file).replaceAll(path.sep, '/');
  location.pathname = `/GrowwithHR-Version2/${route}`;
  const $ = load(buildHeader(inferRootPrefix(), inferActiveNav()).innerHTML);
  const nav = $('nav.site-nav-glass');
  const home = nav.find('a[data-nav-key="home"]');
  assert.equal(nav.length, 1, `${route}: exactly one primary navigation`);
  assert.equal(home.length, 1, `${route}: exactly one Home link`);
  assert.equal(home.attr('href'), 'index.html#home', `${route}: Home must lead to the homepage`);
  assert.equal(home.attr('aria-label'), 'Home');
  assert.equal(home.find('svg[aria-hidden="true"]').length, 1);
  assert.equal(nav.find('a.site-product-name').attr('href'), 'index.html#home');
  assert.equal(nav.find('a.site-brand-logo').length, 0, 'The logo must stay outside the navigation capsule.');
  const items = [home, nav.find('.site-nav-analyze__toggle'), nav.find('a[data-nav-key="reports"]'), nav.find('a[data-nav-key="resources"]'), nav.find('.site-nav-more__toggle')];
  assert.ok(items.every(item => item.length === 1), `${route}: all canonical navigation items must remain available`);
  const signature = nav.find('#siteNavLinks').text().replace(/\s+/g, ' ').trim();
  if (baseline === null) baseline = signature;
  assert.equal(signature, baseline, `${route}: navigation content must match the homepage`);
  assert.equal(home.attr('aria-current') === 'page', route === 'index.html', `${route}: correct Home active state`);
  assert.equal(fs.readFileSync(file, 'utf8').match(/js\/site-shell\.js(?:[?#][^"']*)?["']/g)?.length, 1, `${route}: exactly one canonical shell loader`);
}
assert.equal(withRoot('../', 'index.html#home'), '../index.html#home');
assert.equal(withRoot('', 'index.html#home'), 'index.html#home');
console.log(`Shared Home navigation checks passed across ${pages.length} public pages.`);
