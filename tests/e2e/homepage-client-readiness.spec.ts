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

    const cards = page.locator("#capabilities .buyer-card");
    await expect(cards).toHaveCount(3);
    await expect(cards.nth(0)).toContainText("HR Compliance Readiness");
    await expect(cards.nth(1)).toContainText("Organization & Growth");
    await expect(cards.nth(2)).toContainText("Workforce & Capability Planning");
    await expect(cards.nth(0).getByRole("link", { name: /Get started/i })).toHaveAttribute("href", "compliance-intelligence.html");
    await expect(cards.nth(1).getByRole("link", { name: /Get started/i })).toHaveAttribute("href", "organization-intelligence.html");
    await expect(cards.nth(2).getByRole("link", { name: /Get started/i })).toHaveAttribute("href", "workforce-capability-planning.html");
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

test("homepage explains a finding without an invented readiness score", async ({ page }) => {
  await page.goto("/index.html", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Explore a sample insight" })).toBeVisible();
  await expect(page.locator(".gwhr-home-example")).toContainText("Decision ownership needs clarification");
  await expect(page.locator(".gwhr-home-example")).toContainText("Recommended action");
  await expect(page.locator(".gwhr-home-example")).toContainText("Clarify decision owners and escalation paths.");
  await expect(page.locator(".gwhr-home-example").getByRole("link", { name: /See a Sample Report/i })).toHaveAttribute("href", "sample-reports.html");
  await expect(page.locator(".gwhr-home-example")).not.toContainText(/readiness score|\d+\s*\/\s*100/i);
  await expect(page.getByRole("link", { name: /Open My Reports/i })).toHaveCount(0);
});
