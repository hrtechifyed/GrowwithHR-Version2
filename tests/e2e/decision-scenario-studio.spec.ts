import { test, expect } from '@playwright/test';

test('Decision Scenario Studio generates editable scenarios and compares them', async ({ page }) => {
  await page.goto('/decision-scenario-studio.html');

  await expect(page.getByRole('heading', { name: /See how a company decision could/i })).toBeVisible();
  await page.getByRole('button', { name: 'Load fictional example' }).click();

  await expect(page.getByLabel('Current employees')).toHaveValue('120');
  await expect(page.getByLabel('Conservative employees')).toHaveValue('138');
  await expect(page.getByLabel('Growth employees')).toHaveValue('168');
  await expect(page.getByLabel('Growth operating locations')).toHaveValue('2');

  await page.getByLabel('Growth employees').fill('180');
  await page.getByRole('button', { name: /Compare scenarios/i }).click();

  const results = page.locator('#scenarioResults');
  await expect(results).toBeVisible();
  await expect(results).toContainText('50% employees vs Current');
  await expect(results).toContainText('Manager capacity grows more slowly than workforce size');
  await expect(results).toContainText('Operating-location change');
  await expect(results).toContainText('Critical capability coverage declines');
});

test('Decision Scenario Studio reuses known Company Workspace baseline facts without inventing capability coverage', async ({ page }) => {
  await page.goto('/decision-scenario-studio.html');
  await page.evaluate(() => {
    sessionStorage.setItem('growwithhr.workspace', JSON.stringify({
      reportId: 'GWHR-TEST-001',
      accessKey: 'TEST-CODE',
      companyName: 'Scenario Fixture Ltd',
      companyData: {
        shared: { employees: 240 },
        workforce: { totalEmployees: 240 },
        geography: { operatingLocationCount: 3 },
        organization: {
          peopleManagerCount: 24,
          reportingLevels: 4,
          locations: 3
        }
      }
    }));
  });
  await page.reload();

  await expect(page.locator('#scenarioReuseNotice')).toContainText('Scenario Fixture Ltd');
  await expect(page.getByLabel('Current employees')).toHaveValue('240');
  await expect(page.getByLabel('Current people managers')).toHaveValue('24');
  await expect(page.getByLabel('Current reporting layers')).toHaveValue('4');
  await expect(page.getByLabel('Current operating locations')).toHaveValue('3');
  await expect(page.getByLabel('Current critical capability coverage')).toHaveValue('');

  await page.getByRole('button', { name: 'Generate starting scenarios' }).click();
  await expect(page.locator('#scenarioError')).toContainText('Complete the five Current values');
  await expect(page.locator('#scenarioResults')).toBeHidden();
});
