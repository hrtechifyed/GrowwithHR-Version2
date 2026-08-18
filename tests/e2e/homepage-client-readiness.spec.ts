import { expect, test } from "@playwright/test";

test.describe("homepage client readiness", () => {
  test("desktop shows the two current product capabilities", async ({ page }) => {
    const problems: string[] = [];
    page.on("console", message => {
      if (["error", "warning"].includes(message.type())) problems.push(`${message.type()}: ${message.text()}`);
    });
    page.on("pageerror", error => problems.push(`pageerror: ${error.message}`));
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/index.html", { waitUntil: "networkidle" });

    const cards = page.locator("#capabilities .buyer-card");
    await expect(cards).toHaveCount(2);
    await expect(page.getByRole("link", { name: /Identify My Company’s Compliance Needs/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Understand My Organization Structure/i })).toBeVisible();
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
  await expect(page.locator("#compliance-engine-title")).toHaveText("The recommendation and its source are kept separate.");
  await expect(page.locator("[data-testid=\"compliance-engine-flow\"] .engine-step")).toHaveCount(4);
  await expect(page.getByText("The GrowWithHR rule explains how those facts produced the result.", { exact: false })).toBeVisible();
  await expect(page.getByText("The relevant public source explains the underlying principle or authority.", { exact: false })).toBeVisible();
});
