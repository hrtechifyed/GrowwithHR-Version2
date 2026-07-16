import { expect, test } from '@playwright/test';

test.describe('advisory time-driven scenes', () => {
  test('plays approved sequence and stops at invitation', async ({ page }) => {
    await page.goto('/analyze-company.html?e2e=1');
    await expect(page.getByText('Executive Advisory Intelligence')).toBeVisible();
    await expect(page.getByText('Every organisation has a story.')).toBeVisible();
    await expect(page.getByText('Growth changes everything.')).toBeVisible();
    await expect(page.getByText("Great organisations don't react.")).toBeVisible();
    await expect(page.getByText("Let's understand yours.")).toBeVisible();
    await expect(page.getByText('Company DNA')).toBeVisible();
    await expect(page.getByText('Preparing Recommendations')).toBeVisible();
    await expect(page.getByText('Willing to share the story of your organization?')).toBeVisible();
    await expect(page.getByTestId('begin-executive-assessment')).toBeVisible();
    await expect(page.getByText('One final step.')).toHaveCount(0);
  });
});
