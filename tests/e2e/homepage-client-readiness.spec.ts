import { expect, test } from "@playwright/test";

test.describe("homepage client readiness", () => {
  test("desktop shows the three current product capabilities", async ({ page }) => {
    const problems: string[] = [];
    page.on("console", message => {
      if (["error", "warning"].includes(message.type())) problems.push(`${message.type()}: ${message.text()}`);
    });
    page.on("pageerror", error => problems.push(`pageerror: ${error.message}`));
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/index.html", { waitUntil: "networkidle" });

    await expect(page.getByRole("link", { name: /Plan Workforce & Capabilities/i })).toBeVisible();
    const cards = page.locator("#capabilities .buyer-card");
    await expect(cards).toHaveCount(3);
    await expect(page.getByRole("link", { name: /Assess Compliance Readiness/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Analyze Organization Structure/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Open My Reports/i })).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText(/Recovery Code|recover previous saved company/i);
    expect(problems).toEqual([]);
  });

  test("mobile capabilities remain usable without horizontal page overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/index.html", { waitUntil: "networkidle" });
    await expect(page.locator("#capabilities .buyer-card")).toHaveCount(3);

    const overflow = await page.evaluate(() => (
      document.documentElement.scrollWidth - document.documentElement.clientWidth
    ));
    expect(overflow).toBeLessThanOrEqual(2);
  });

  test("legacy assessment URL redirects to the single stable route", async ({ page }) => {
    await page.goto("/assessment.html?from=legacy", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/analyze-company\.html\?from=legacy$/);
    await expect(page.locator("#landingScreen")).toBeVisible();
  });
});

test("homepage explains the source and GrowWithHR rule boundary", async ({ page }) => {
  await page.goto("/index.html", { waitUntil: "networkidle" });
  await expect(page.locator("[data-testid=\"home-report-preview\"]")).toBeVisible();
  await expect(page.getByText("Company information", { exact: true })).toBeVisible();
  await expect(page.getByText("Evaluation criteria", { exact: true })).toBeVisible();
  await expect(page.getByText("Public source context", { exact: true })).toBeVisible();
  await expect(page.getByText("Missing information flagged", { exact: true })).toBeVisible();
});
