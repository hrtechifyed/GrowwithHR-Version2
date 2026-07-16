import { expect, test } from '@playwright/test';

test.describe('advisory assessment shared stage', () => {
  test('begin shows one-line welcome and one question', async ({ page }) => {
    await page.goto('/analyze-company.html?e2e=1');
    await page.getByTestId('begin-executive-assessment').click();
    await expect(page.getByText("Welcome to HRTechify — let's begin your Executive Advisory assessment.")).toBeVisible();
    await expect(page.getByTestId('assessment-question-card')).toBeVisible();
    const titles = await page.locator('#questionTitle').count();
    expect(titles).toBe(1);
  });
});
