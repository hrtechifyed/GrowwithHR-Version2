import { expect, Page, test } from "@playwright/test";

const STORAGE_KEY = "growwithhr-advisory-briefing-v2";

async function clearSavedProgress(page: Page): Promise<void> {
  await page.addInitScript(() => localStorage.clear());
}

async function seedSavedProgress(page: Page, currentMoment = 2): Promise<void> {
  await page.addInitScript(({ key, moment }) => {
    localStorage.setItem(key, JSON.stringify({
      version: "2.1.0",
      started: true,
      completed: false,
      currentMoment: moment,
      answers: {
        locations: "1",
        countries: "1",
        expansionPlans: [],
        priorities: []
      },
      lead: {
        name: "",
        email: "",
        role: "",
        marketingConsent: false
      },
      ui: { showSupplementalWorkforce: false },
      updatedAt: new Date().toISOString()
    }));
  }, { key: STORAGE_KEY, moment: currentMoment });
}

test.describe("Dedicated Compliance entry", () => {
  test("Company Insights opens the dedicated Compliance URL", async ({ page }) => {
    await clearSavedProgress(page);
    await page.goto("/intelligence-hub.html");

    const complianceLink = page.getByRole("link", {
      name: /Identify My Company’s Compliance Needs/i
    });

    await expect(complianceLink).toHaveAttribute("href", "compliance-intelligence.html");
    await complianceLink.click();
    await expect(page).toHaveURL(/\/compliance-intelligence\.html$/);
    await expect(page.locator("#firstVisitActions")).toBeVisible();
  });

  test("first-time users get the same working assessment shell", async ({ page }) => {
    await clearSavedProgress(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/compliance-intelligence.html");

    await expect(page.locator("[data-site-shell-header]")).toHaveCount(1);
    await expect(page.locator('.site-nav-link[data-nav-key="analyze"]')).toHaveAttribute("aria-current", "page");
    await expect(page.locator("#firstVisitActions")).toBeVisible();
    await expect(page.locator("#resumePanel")).toBeHidden();
    await expect(page.getByRole("button", { name: "Start my advisory" })).toBeVisible();
    await expect(page.getByRole("link", { name: "View a sample advisory" })).toHaveAttribute("href", "sample-advisory-report.html");

    await page.getByRole("button", { name: "Start my advisory" }).click();
    await expect(page.locator("#landingScreen")).toBeHidden();
    await expect(page.locator("#conversationWorkspace")).toBeVisible();
    await expect(page.locator("#storyForm")).toBeVisible();
    await expect(page.locator("#nextButton")).toBeVisible();
  });

  test("saved progress is reusable on the dedicated route", async ({ page }) => {
    await seedSavedProgress(page, 2);
    await page.goto("/compliance-intelligence.html");

    await expect(page.locator("#firstVisitActions")).toBeHidden();
    await expect(page.locator("#resumePanel")).toBeVisible();
    await expect(page.locator("#resumeMessage")).toHaveText("Your progress is saved.");
    await expect(page.getByRole("button", { name: /Continue my advisory/ })).toBeVisible();
  });

  test("legacy Compliance URL remains functional during migration", async ({ page }) => {
    await clearSavedProgress(page);
    await page.goto("/analyze-company.html?engine=compliance");

    await expect(page).toHaveURL(/\/analyze-company\.html\?engine=compliance$/);
    await expect(page.locator("#firstVisitActions")).toBeVisible();
    await expect(page.getByRole("button", { name: "Start my advisory" })).toBeVisible();
    await expect(page.locator("#assessmentShell")).toBeVisible();
  });

  test("dedicated route preserves the existing responsive UI without page overflow", async ({ page }) => {
    await clearSavedProgress(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/compliance-intelligence.html");

    await expect(page.locator("#assessmentShell")).toBeVisible();
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(2);
  });
});
