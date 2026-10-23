import { expect, test } from "@playwright/test";

test.describe("Commercial beta readiness", () => {
  test("homepage presents only the two current products and the Founding Beta", async ({ page }) => {
    await page.goto("/index.html", { waitUntil: "networkidle" });

    await expect(page.getByText("Two ways to use GrowWithHR")).toBeVisible();
    await expect(page.locator("#capabilities .ph-product-card")).toHaveCount(2);
    await expect(page.getByText("Founding Beta", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Explore the Founding Beta/i })).toHaveAttribute("href", "founding-beta.html");
    await expect(page.locator("body")).not.toContainText(/Decision scenario|Scenario comparisons|Model a Decision|checkout|subscribe now|pricing plans/i);
    await expect(page.getByRole("link", { name: /Start free Organization assessment/i })).toHaveAttribute("href", "organization-intelligence.html");
    await expect(page.locator("head link[rel=canonical]")).toHaveAttribute("href", "https://hrtechifyed.github.io/GrowwithHR-Version2/");
    await expect(page.getByText("Free to explore during our Founding Beta.", { exact: false })).toBeVisible();
  });

  test("Founding Beta page provides a working request conversion path", async ({ page }) => {
    let captured: any = null;
    await page.route("**/api/beta-interest", async route => {
      captured = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true })
      });
    });

    await page.goto("/founding-beta.html?utm_source=linkedin&utm_medium=organic&utm_campaign=founding-beta", { waitUntil: "networkidle" });

    await expect(page.getByRole("heading", { name: /Use GrowWithHR on a real company question/i })).toBeVisible();
    await expect(page.getByText("Organization & Growth", { exact: true })).toBeVisible();
    await expect(page.getByText("HR Compliance Readiness", { exact: true })).toBeVisible();
    await expect(page.getByText("Founding Beta, not certification.")).toBeVisible();
    await expect(page.getByRole("link", { name: /Start free Organization assessment/i })).toHaveAttribute("href", "organization-intelligence.html");
    await expect(page.getByRole("link", { name: /Try HR Compliance Readiness/i }).first()).toHaveAttribute("href", "compliance-intelligence.html");
    await expect(page.getByText("Optional founder feedback")).toBeVisible();
    await expect(page.getByRole("link", { name: /Request a beta invite/i })).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText(/Secure complete-report delivery|checkout|pay now|subscribe now|pricing plans/i);

    await page.locator("#betaName").fill("Founder Test");
    await page.locator("#betaEmail").fill("founder@example.com");
    await page.locator("#betaCompany").fill("Example Growth Co");
    await page.locator("#betaEmployees").fill("150");
    await page.locator("#betaRole").selectOption({ label: "Founder / CEO" });
    await page.locator("#betaQuestion").fill("We are growing quickly and want to test whether ownership and management structure will keep up.");
    await page.getByRole("button", { name: /Share my company question/i }).click();

    await expect(page.locator("#betaStatus")).toContainText(/message has been shared with HRTechify/i);
    expect(captured?.company).toBe("Example Growth Co");
    expect(captured?.email).toBe("founder@example.com");
    expect(captured?.source).toBe("founding-beta");
    expect(captured?.utmSource).toBe("linkedin");
    expect(captured?.utmMedium).toBe("organic");
    expect(captured?.utmCampaign).toBe("founding-beta");
  });

  test("Visitors can start both free assessments without requesting an invite", async ({ page }) => {
    await page.goto("/founding-beta.html", { waitUntil: "networkidle" });
    await page.getByRole("link", { name: /Start free Organization assessment/i }).click();
    await expect(page).toHaveURL(/organization-intelligence\.html$/);
    await expect(page.locator("#organizationForm")).toBeVisible();

    await page.goto("/founding-beta.html", { waitUntil: "networkidle" });
    await page.getByRole("link", { name: /Try HR Compliance Readiness/i }).first().click();
    await expect(page).toHaveURL(/compliance-intelligence\.html$/);
    await expect(page.getByRole("button", { name: /Start compliance review/i }).first()).toBeVisible();
  });

  test("Compliance public experience uses one product name end to end", async ({ page }) => {
    await page.goto("/compliance-intelligence.html", { waitUntil: "networkidle" });

    await expect(page).toHaveTitle(/HR Compliance Readiness/);
    await expect(page.getByRole("heading", { name: /See what needs attention before it becomes a compliance problem/i })).toBeVisible();
    await expect(page.locator("body")).not.toContainText(/Executive Advisory Briefing|Generate my advisory|Building your advisory/i);

    await page.goto("/sample-advisory-report.html", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "HR Compliance Readiness Report" })).toBeVisible();
    await expect(page.locator("body")).not.toContainText("Executive Advisory Report");
  });
});
