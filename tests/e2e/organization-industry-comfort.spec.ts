import { expect, test } from "@playwright/test";

test.describe("Organization & Growth industry and form comfort", () => {
  test("industry aliases are suggested and normalize to the canonical industry", async ({ page }) => {
    await page.goto("/organization-intelligence.html", { waitUntil: "networkidle" });

    const industry = page.locator("#industry");
    const options = page.locator("#orgIndustryOptions option");

    await expect(industry).toHaveAttribute("list", "orgIndustryOptions");
    expect(await options.count()).toBeGreaterThan(20);

    await industry.fill("cloud kitchen");
    await industry.blur();
    await expect(industry).toHaveValue("Restaurants, QSR & Food Service");
  });

  test("only the five minimum company basics are compulsory", async ({ page }) => {
    await page.goto("/organization-intelligence.html", { waitUntil: "networkidle" });

    const requiredIds = await page.locator("form#organizationForm [required]").evaluateAll(elements =>
      elements.map(element => element.id).filter(Boolean)
    );

    expect(requiredIds.sort()).toEqual(["companyName", "email", "employees", "industry", "locations"].sort());
    await expect(page.getByText(/Start with five basics/i)).toBeVisible();
    await expect(page.locator(".org-field-status.is-optional")).not.toHaveCount(0);
  });
});
