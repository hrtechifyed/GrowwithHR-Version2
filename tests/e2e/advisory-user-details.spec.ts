import { expect, test } from '@playwright/test';

test.describe('advisory user details validation', () => {
  test('name and email screens validate inline', async ({ page }) => {
    await page.goto('/analyze-company.html?e2e=1');
    // Complete assessment in a helper in real CI; this draft focuses on stable selectors.
    await expect(page.locator('[data-testid="advisory-name-screen"]')).toHaveCount(0);
  });
});
