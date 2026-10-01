import { expect, test } from "@playwright/test";

async function acceptNextBeforeUnload(page) {
  page.once("dialog", async (dialog) => {
    expect(dialog.type()).toBe("beforeunload");
    await dialog.accept();
  });
}

test.describe("Confirmed reset on refresh", () => {
  test("Organization asks before refresh and reloads to a clean page", async ({ page }) => {
    await page.goto("/organization-intelligence.html", { waitUntil: "networkidle" });

    await page.locator("#companyName").fill("Refresh Reset Co");
    await page.locator("#industry").fill("SaaS");

    await acceptNextBeforeUnload(page);
    await page.reload({ waitUntil: "networkidle" });

    await expect(page.locator("#companyName")).toHaveValue("");
    await expect(page.locator("#industry")).toHaveValue("");
    await expect.poll(() => page.evaluate(() => sessionStorage.getItem("growwithhr.workspace"))).toBeNull();
    await expect.poll(() => page.evaluate(() => sessionStorage.getItem("growwithhr.organization.report"))).toBeNull();
  });

  test("Compliance asks before refresh and clears saved assessment data", async ({ page }) => {
    await page.goto("/compliance-intelligence.html", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Start compliance review", exact: true }).click();

    await page.locator("#companyName").fill("Refresh Reset Compliance Co");
    await expect.poll(() =>
      page.evaluate(() => localStorage.getItem("growwithhr-advisory-briefing-v2"))
    ).not.toBeNull();

    await acceptNextBeforeUnload(page);
    await page.reload({ waitUntil: "networkidle" });

    await expect.poll(() =>
      page.evaluate(() => localStorage.getItem("growwithhr-advisory-briefing-v2"))
    ).toBeNull();
    await expect.poll(() =>
      page.evaluate(() => localStorage.getItem("growwithhr-report"))
    ).toBeNull();
    await expect(page.locator("#firstVisitActions")).toBeVisible();
  });
});
