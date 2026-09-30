import { expect, test } from "@playwright/test";

test.describe("Organization & Growth report readiness", () => {
  test("sample report presents ownership, bottlenecks, findings and growth scenario coherently", async ({ page }) => {
    await page.goto("/organization-structure-report.html?sample=1", { waitUntil: "networkidle" });

    await expect(page).toHaveTitle(/Organization Structure & Growth Report/);
    await expect(page.getByText("ORGANIZATION BOTTLENECK MAP")).toBeVisible();
    await expect(page.getByText("FUNCTIONAL OWNERSHIP")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Primary constraint" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Top priorities" })).toBeVisible();

    await page.getByRole("button", { name: /Detailed Findings/ }).click();
    await expect(page.getByRole("heading", { name: "Evidence-backed structural findings" })).toBeVisible();

    await page.getByRole("button", { name: /12-Month Growth Scenario/ }).click();
    await expect(page.getByText("12-MONTH SCENARIO")).toBeVisible();
    await expect(page.getByText(/deterministic planning scenario, not a forecast/i)).toBeVisible();

    await expect(page.getByRole("link", { name: /Methodology & Sources/ })).toBeVisible();
  });
});
