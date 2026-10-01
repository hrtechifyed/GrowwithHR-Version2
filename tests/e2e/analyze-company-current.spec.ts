import { expect, Page, test } from "@playwright/test";

const STORAGE_KEY = "growwithhr-advisory-briefing-v2";

async function seedSavedBriefing(page: Page, currentMoment = 2): Promise<void> {
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

test.describe("Company Analysis entry", () => {
  test("routes the homepage directly to the flagship Organization & Growth experience", async ({ page }) => {
    await page.goto("/index.html");

    const primaryCta = page.getByRole("link", { name: "Analyze Organization & Growth", exact: true }).first();
    await expect(primaryCta).toHaveAttribute("href", "organization-intelligence.html");

    await primaryCta.click();
    await expect(page).toHaveURL(/organization-intelligence\.html$/);
    await expect(page.getByRole("heading", { name: /organization/i }).first()).toBeVisible();

    await page.getByRole("button", { name: /Analyze/i }).click();
    await expect(page.getByRole("link", { name: "HR Compliance Readiness", exact: true })).toHaveAttribute("href", "compliance-intelligence.html");
    await expect(page.getByRole("link", { name: "Organization & Growth", exact: true })).toHaveAttribute("href", "organization-intelligence.html");
    await expect(page.getByRole("link", { name: "Model a Decision", exact: true })).toHaveCount(0);
  });
});

test.describe("Analyze My Company", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test("shows the first-visit landing state", async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto("/analyze-company.html");

    await expect(page.locator("[data-site-shell-header]")).toHaveCount(1);
    await expect(page.locator("#firstVisitActions")).toBeVisible();
    await expect(page.locator("#resumePanel")).toBeHidden();
    await expect(page.getByRole("button", { name: "Start compliance review" })).toBeVisible();
    await expect(page.getByRole("link", { name: "View a sample advisory" })).toBeVisible();
  });

  test("shows only the returning-user state when progress exists", async ({ page }) => {
    await seedSavedBriefing(page);
    await page.goto("/analyze-company.html");

    await expect(page.locator("#firstVisitActions")).toBeHidden();
    await expect(page.locator("#resumePanel")).toBeVisible();
    await expect(page.locator("#resumeMessage")).toHaveText("Your progress is saved.");
    await expect(page.getByRole("button", { name: /Continue compliance review/ })).toBeVisible();
  });

  test("uses equal-width desktop panels", async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto("/analyze-company.html");

    const briefing = await page.locator(".advisory-entry__features").boundingBox();
    const story = await page.locator(".advisory-entry__visual").boundingBox();
    expect(briefing).not.toBeNull();
    expect(story).not.toBeNull();
    expect(Math.abs(briefing!.width - story!.width)).toBeLessThanOrEqual(2);
  });

  test("requires only name and email at contact capture", async ({ page }) => {
    await seedSavedBriefing(page, 6);
    await page.goto("/analyze-company.html");
    await page.getByRole("button", { name: /Continue compliance review/ }).click();

    const founderLed = page.getByRole("radio", { name: /Founder-led/i });
    await expect(founderLed).toBeVisible();
    await founderLed.check();
    await expect(founderLed).toBeChecked();
    await expect(page.locator('input[name="priorities"]')).toHaveCount(0);
    await page.locator("#nextButton").click();
    await page.locator("#continueToContactButton").click();

    await expect(page.locator("#serviceConsent")).toHaveCount(0);
    const marketing = page.locator("#marketingConsent");
    await expect(marketing).toBeVisible();
    await expect(marketing).not.toBeChecked();
    await expect(marketing).not.toHaveAttribute("required", "");

    await page.locator("#generateReportButton").click();
    await expect(page.locator("#leadNameError")).toContainText("Enter your name");
    await expect(page.locator("#leadEmailError")).toContainText("Enter at least one work email");

    await page.locator("#leadName").fill("Test User");
    const emailInput = page.locator("#leadEmail");
    await emailInput.fill("test.user@example.com");
    await emailInput.blur();
    await expect(emailInput).toHaveValue("test.user@example.com;");

    await page.evaluate(() => {
      const app = (window as any).executiveAssessment;
      app.deliveryService.prepareAndSend = async (payload: any) => ({
        ...payload,
        pdf: { base64: 'JVBERi0xLjQK', inputChanges: [] },
        delivery: { ok: true, customerStatus: 'auth-required', customerSent: false }
      });
    });

    await page.locator("#generateReportButton").click();
    await expect(page.locator("#successScreen")).toBeVisible();
  });
});

test.describe("Shared report navigation", () => {
  test("renders one shared navbar with a single Analyze menu", async ({ page }) => {
    await page.goto("/executive-advisory-report.html");

    await expect(page.locator("[data-site-shell-header]")).toHaveCount(1);
    await expect(page.locator("nav.navbar")).toHaveCount(0);
    await expect(page.locator(".site-nav-link:visible")).toHaveCount(2);
    await expect(page.getByRole("link", { name: "Home", exact: true })).toHaveCount(1);
    await expect(page.getByRole("button", { name: /Analyze/i })).toHaveCount(1);
    await expect(page.getByRole("link", { name: "My Reports", exact: true })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Sources & Methodology", exact: true })).toHaveCount(1);
    await expect(page.getByRole("button", { name: /More/i })).toHaveCount(1);
  });
});
