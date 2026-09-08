import { test, expect } from '@playwright/test';

test('workforce capability help explains and selects without changing the contract', async ({ page }) => {
  await page.goto('/workforce-capability-planning.html');
  const select = page.locator('[data-capability-field="currentCoverage"]').first();
  await expect(select).toHaveValue('unknown');
  const field = select.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " wcp-field ")]');
  await field.getByRole('button', { name: /Explain Current capability coverage/i }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('skills and expertise');
  await expect(dialog).toContainText('major gaps remain');
  await expect(select).toHaveValue('unknown');
  const changes = await page.evaluate(() => {
    const control = document.querySelector('[data-capability-field="currentCoverage"]')!;
    (window as any).__choiceChanges = 0;
    control.addEventListener('change', () => (window as any).__choiceChanges++);
    return (window as any).__choiceChanges;
  });
  expect(changes).toBe(0);
  await dialog.locator('.gwh-choice-help-option').filter({ hasText: 'Partial' }).getByRole('button', { name: 'Use this answer' }).click();
  await expect(select).toHaveValue('partial');
  expect(await page.evaluate(() => (window as any).__choiceChanges)).toBe(1);
  await page.locator('#wcpAddCapability').click();
  await expect(page.locator('[data-capability-field="currentCoverage"]')).toHaveCount(3);
  await expect(page.locator('.gwh-choice-help-trigger')).toHaveCount(26);
});

test('organization help preserves unknown values and supports keyboard dismissal', async ({ page }) => {
  await page.goto('/organization-intelligence.html');
  const select = page.locator('#decisionRights');
  await expect(select).toHaveValue('dont-know');
  await page.getByRole('button', { name: /Explain How clear is ownership of recurring decisions/i }).click();
  await expect(page.getByRole('dialog')).toContainText('founder/CEO intervention');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(select).toHaveValue('dont-know');
  await select.selectOption('mixed');
  await page.getByRole('button', { name: /Explain How clear is ownership of recurring decisions/i }).click();
  await expect(page.getByRole('dialog')).toContainText('Current selection');
});

test('shared assessment supports legal-structure explanations without guessing', async ({ page }) => {
  await page.goto('/analyze-company.html');
  await page.waitForFunction(() => Boolean((window as any).GrowWithHRAssessmentChoiceHelp));
  await page.evaluate(() => {
    const main = document.querySelector('main')!;
    const fixture = document.createElement('form');
    fixture.innerHTML = '<div class="advisory-field" data-field-wrapper="entity"><label for="entity">How is the organisation legally structured?</label><select id="entity" name="entity"><option value="Not Sure">Not sure</option><option value="Private Limited">Private Limited</option><option value="DPIIT Recognized Startup">Recognised startup</option></select></div>';
    main.append(fixture);
    (window as any).GrowWithHRAssessmentChoiceHelp.scan();
  });
  await page.getByRole('button', { name: /Explain How is the organisation legally structured/i }).click();
  await expect(page.getByRole('dialog')).toContainText('Recognition and legal entity type are not necessarily the same thing');
  await expect(page.locator('#entity')).toHaveValue('Not Sure');
  await page.getByRole('dialog').locator('.gwh-choice-help-option').filter({ hasText: 'Private Limited' }).getByRole('button', { name: 'Use this answer' }).click();
  await expect(page.locator('#entity')).toHaveValue('Private Limited');
});
