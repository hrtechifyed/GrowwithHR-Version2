import { expect, test } from '@playwright/test';

const pages = [
  '/',
  '/analyze-company.html',
  '/assessment.html',
  '/official-resources.html',
  '/sample-advisory-report.html',
  '/more-info.html',
];

test.describe('GrowWithHR UI requirements', () => {
  for (const pagePath of pages) {
    test(`renders shared home footer on ${pagePath}`, async ({ page }) => {
      await page.goto(pagePath);
      const footer = page.locator('footer.footer');
      await expect(footer).toBeVisible();
      await expect(footer).toContainText('Smart People Strategy. More business momentum.');
    });
  }

  test('home sample advisory CTA appears before executive intelligence animation', async ({ page }) => {
    await page.goto('/');
    const sampleCta = page.getByRole('link', { name: /view sample advisory/i });
    await expect(sampleCta).toHaveAttribute('href', 'sample-advisory-report.html');
    await expect(page.locator('.hero-actions')).toBeVisible();
    await expect(page.locator('.hero-workspace')).toBeVisible();
    const ctaBox = await sampleCta.boundingBox();
    const workspaceBox = await page.locator('.hero-workspace').boundingBox();
    expect(ctaBox && workspaceBox && ctaBox.y).toBeLessThan(workspaceBox.y);
  });

  test('executive intelligence cards stack vertically', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('.hero-sidebar .workspace-card');
    await expect(cards).toHaveCount(3);
    const first = await cards.nth(0).boundingBox();
    const second = await cards.nth(1).boundingBox();
    const third = await cards.nth(2).boundingBox();
    expect(first && second && third && first.x).toBeCloseTo(second.x, 1);
    expect(second.y).toBeGreaterThan(first.y + first.height - 1);
    expect(third.y).toBeGreaterThan(second.y + second.height - 1);
  });

  test('intro scenes include the fourth scene and keep font consistent into briefing cards', async ({ page }) => {
    await page.goto('/analyze-company.html');
    await expect(page.locator('.intro-scene')).toHaveCount(4);
    const sceneFont = await page.locator('.intro-scene h2').first().evaluate((el) => getComputedStyle(el).fontFamily);
    const cardFont = await page.locator('.intro-card h2').first().evaluate((el) => getComputedStyle(el).fontFamily);
    expect(cardFont).toBe(sceneFont);
  });
});
