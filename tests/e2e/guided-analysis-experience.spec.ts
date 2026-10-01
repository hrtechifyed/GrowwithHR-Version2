import { expect, test } from "@playwright/test";

test.describe("Guided analysis experiences", () => {
  test("Organization & Growth presents a guided four-part workspace", async ({ page }) => {
    await page.goto("/organization-intelligence.html", { waitUntil: "networkidle" });

    await expect(page.getByRole("heading", { name: /See where your organization could constrain growth/i })).toBeVisible();
    await expect(page.locator(".analysis-output-card")).toHaveCount(4);
    await expect(page.locator(".org-assessment-rail__item")).toHaveCount(4);
    await expect(page.locator(".org-question-section")).toHaveCount(4);

    const sections = page.locator(".org-question-section");
    await expect(sections.nth(0)).toHaveAttribute("open", "");
    await expect(sections.nth(1)).toHaveAttribute("open", "");
    await expect(sections.nth(2)).not.toHaveAttribute("open", "");
    await expect(sections.nth(3)).not.toHaveAttribute("open", "");

    await page.getByRole("button", { name: /Management capacity/i }).click();
    await expect(sections.nth(2)).toHaveAttribute("open", "");

    const requiredIds = await page.locator("#organizationForm [required]").evaluateAll(elements =>
      elements.map(element => element.id).filter(Boolean)
    );
    expect(requiredIds.sort()).toEqual(["companyName", "email", "employees", "industry", "locations"].sort());
  });

  test("Compliance leads with outputs and keeps the existing guided review", async ({ page }) => {
    await page.goto("/compliance-intelligence.html", { waitUntil: "networkidle" });

    await expect(page.getByRole("heading", { name: /See what needs attention before it becomes a compliance problem/i })).toBeVisible();
    await expect(page.locator(".analysis-output-card")).toHaveCount(4);
    await expect(page.getByRole("button", { name: "Start compliance review", exact: true })).toBeVisible();
    await expect(page.getByText("What the review gives you")).toBeVisible();
    await expect(page.getByText("Review areas")).toBeVisible();
    await expect(page.getByText("Information gaps")).toBeVisible();
    await expect(page.getByText("Evidence trail")).toBeVisible();
    await expect(page.getByText("Growth triggers")).toBeVisible();
  });

  test("Scenario Studio has no public entry point in the two-module launch experience", async ({ page }) => {
    await page.goto("/index.html", { waitUntil: "networkidle" });
    await expect(page.getByText("Two ways to use GrowWithHR")).toBeVisible();
    await expect(page.getByText("Decision Scenario Studio")).toHaveCount(0);
    await page.getByRole("button", { name: /Analyze/i }).click();
    await expect(page.locator("#siteAnalyzeMenu a")).toHaveCount(2);
    await expect(page.getByRole("link", { name: "Model a Decision", exact: true })).toHaveCount(0);
  });
});
