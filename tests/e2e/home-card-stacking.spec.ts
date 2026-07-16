import { expect, test } from '@playwright/test';

test.describe('home sticky stacked cards', () => {
  test('eligible home groups use scoped stack classes and remain responsive', async ({ page }) => {
    for (const viewport of [{ width: 1440, height: 900 }, { width: 1024, height: 768 }, { width: 768, height: 900 }, { width: 430, height: 932 }, { width: 390, height: 844 }, { width: 360, height: 640 }]) {
      await page.setViewportSize(viewport);
      await page.goto('/?e2e=1');
      await expect(page.getByTestId('home-executive-stack')).toBeVisible();
      await expect(page.getByTestId('home-process-stack')).toBeVisible();
      await expect(page.getByTestId('home-capabilities-stack')).toBeVisible();
      await expect(page.locator('.home-stack-section > .home-stack-card').first()).toHaveCSS('position', viewport.height <= 620 ? 'relative' : 'sticky');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      expect(overflow).toBe(false);
    }
  });
});
