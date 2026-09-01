import { expect, test } from "@playwright/test";

test.describe("homepage client readiness", () => {
  test("desktop shows the two current product capabilities with Organization first", async ({ page }) => {
    const problems: string[] = [];
    page.on("console", message => {
      if (["error", "warning"].includes(message.type())) problems.push(`${message.type()}: ${message.text()}`);
    });
    page.on("pageerror", error => problems.push(`pageerror: ${error.message}`));
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/index.html", { waitUntil: "networkidle" });

    const cards = page.locator("#capabilities .buyer-card");
    await expect(cards).toHaveCount(2);
    await expect(cards.first()).toContainText("Organization Structure & Growth · Flagship");
    await expect(page.getByRole("link", { name: /Analyze My Organization Structure & Growth/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Assess My HR Compliance Readiness/i })).toBeVisible();
    expect(problems).toEqual([]);
  });

  test("mobile capabilities remain usable without horizontal page overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/index.html", { waitUntil: "networkidle" });
    await expect(page.locator("#capabilities .buyer-card")).toHaveCount(2);

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
  await expect(page.locator("#compliance-engine-title")).toHaveText("Every recommendation shows what it is based on.");
  await expect(page.locator("[data-testid=\"compliance-engine-flow\"] .engine-step")).toHaveCount(4);
  await expect(page.getByText("GrowWithHR shows how those criteria produced the result.", { exact: false })).toBeVisible();
  await expect(page.getByText("The relevant public source shows the underlying principle or authority.", { exact: false })).toBeVisible();
});
