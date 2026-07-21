import { expect, test } from "@playwright/test";

test.describe("homepage client readiness", () => {
  test("desktop capability controls are visible and advance the carousel", async ({ page }) => {
    const problems: string[] = [];
    page.on("console", message => {
      if (["error", "warning"].includes(message.type())) problems.push(`${message.type()}: ${message.text()}`);
    });
    page.on("pageerror", error => problems.push(`pageerror: ${error.message}`));
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/index.html", { waitUntil: "networkidle" });
    const track = page.locator(".carousel-track");
    const next = page.getByRole("button", { name: "Next capability" });
    await expect(next).toBeVisible();
    const before = await track.evaluate(element => element.scrollLeft);
    await next.click();
    await expect.poll(() => track.evaluate(element => element.scrollLeft)).toBeGreaterThan(before);
    await expect(page.locator(".capability-slide").nth(1)).toHaveClass(/active/);
    expect(problems).toEqual([]);
  });

  test("mobile carousel remains horizontally scrollable without desktop arrows", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/index.html", { waitUntil: "networkidle" });
    await expect(page.getByRole("button", { name: "Next capability" })).toBeHidden();
    const dimensions = await page.locator(".carousel-track").evaluate(element => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }));
    expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.clientWidth);
  });

  test("legacy assessment URL redirects to the single stable route", async ({ page }) => {
    await page.goto("/assessment.html?from=legacy", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/analyze-company\.html\?from=legacy$/);
    await expect(page.locator("#landingScreen")).toBeVisible();
  });
});
