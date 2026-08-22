import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const baseUrl = process.env.UI_BASE_URL || 'http://127.0.0.1:4173';
const pages = [
  'index.html',
  'intelligence-hub.html',
  'organization-intelligence.html',
  'official-resources.html',
  'my-reports.html',
  'sample-reports.html',
  'more-info.html',
  'security.html',
  'terms.html'
];
const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'desktop', width: 1440, height: 900 }
];

const browser = await chromium.launch({ headless: true });
const failures = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    for (const file of pages) {
      const page = await context.newPage();
      await page.goto(`${baseUrl}/${file}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(250);

      const runAxe = async (state) => {
        const results = await new AxeBuilder({ page })
          .withRules(['color-contrast'])
          .analyze();
        for (const violation of results.violations) {
          for (const node of violation.nodes) {
            failures.push({
              viewport: viewport.name,
              file,
              state,
              target: node.target.join(' '),
              summary: node.failureSummary || violation.help
            });
          }
        }
      };

      await runAxe('default');

      if (file === 'index.html') {
        const compact = page.locator('[data-gwh-view-mode-choice="compact"]');
        const wide = page.locator('[data-gwh-view-mode-choice="wide"]');
        if (await compact.count() && await wide.count()) {
          await compact.first().click();
          await page.waitForTimeout(80);
          const compactState = await page.evaluate(() => ({
            mode: document.documentElement.dataset.gwhViewMode,
            stored: localStorage.getItem('growwithhr:view-mode')
          }));
          if (compactState.mode !== 'compact' || compactState.stored !== 'compact') {
            failures.push({ viewport: viewport.name, file, state: 'switch-compact', target: 'footer view switch', summary: 'Compact mode did not apply and persist.' });
          }
          await runAxe('compact-selected');

          await wide.first().click();
          await page.waitForTimeout(80);
          const wideState = await page.evaluate(() => ({
            mode: document.documentElement.dataset.gwhViewMode,
            stored: localStorage.getItem('growwithhr:view-mode')
          }));
          if (wideState.mode !== 'wide' || wideState.stored !== 'wide') {
            failures.push({ viewport: viewport.name, file, state: 'switch-wide', target: 'footer view switch', summary: 'Wide mode did not apply and persist.' });
          }
          await runAxe('wide-selected');
        } else {
          failures.push({ viewport: viewport.name, file, state: 'view-switch', target: 'footer view switch', summary: 'Expected Mobile / Tablet and Laptop / Desktop controls were not rendered.' });
        }
      }

      if (viewport.width <= 900) {
        const menu = page.locator('.site-nav-toggle');
        if (await menu.count()) {
          await menu.first().click();
          await page.waitForTimeout(100);
          await runAxe('mobile-menu-open');
        }
      }

      await page.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`Color contrast / view-mode audit found ${failures.length} issue(s):`);
  for (const failure of failures.slice(0, 80)) {
    console.error(`- [${failure.viewport}] ${failure.file} (${failure.state}) ${failure.target}: ${failure.summary}`);
  }
  if (failures.length > 80) console.error(`...and ${failures.length - 80} more.`);
  process.exit(1);
}

console.log(`Color contrast and view-mode audit passed across ${pages.length} pages and ${viewports.length} viewport classes.`);