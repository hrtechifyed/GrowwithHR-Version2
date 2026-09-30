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

  test("functions create an optional ownership map without asking for employee names", async ({ page }) => {
    await page.goto("/organization-intelligence.html", { waitUntil: "networkidle" });

    await page.locator("#departments").fill("Sales, Product, Finance");
    const rows = page.locator("#functionOwnershipRows .org-ownership-row");
    await expect(rows).toHaveCount(3);
    await expect(rows.nth(0)).toContainText("Sales");
    await expect(rows.nth(1)).toContainText("Product");
    await expect(rows.nth(2)).toContainText("Finance");

    await rows.nth(0).locator("select").selectOption("clear-owner");
    await rows.nth(1).locator("select").selectOption("founder");
    await rows.nth(2).locator("select").selectOption("shared");

    await expect(rows.nth(0).locator("select")).toHaveValue("clear-owner");
    await expect(rows.nth(1).locator("select")).toHaveValue("founder");
    await expect(rows.nth(2).locator("select")).toHaveValue("shared");
    await expect(page.getByText(/No employee names are needed/i)).toBeVisible();
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
