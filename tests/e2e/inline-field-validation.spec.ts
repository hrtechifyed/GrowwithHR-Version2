import { expect, test } from "@playwright/test";

test.describe("GrowWithHR inline field validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.clear(); sessionStorage.clear(); });
  });

  test("Organization & Growth highlights invalid email, headcount and cross-field counts", async ({ page }) => {
    await page.goto("/organization-intelligence.html", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean((window as any).GrowWithHRFieldValidation));
    await page.locator("#companyName").fill("Example Growth Company");
    await page.locator("#industry").fill("Software");
    await page.locator("#email").fill("invalid-email");
    await page.locator("#employees").fill("0");
    await page.locator("#locations").fill("1");
    await page.locator("#organizationForm button[type=submit]").click();
    await expect(page.locator("#email")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#email").locator("xpath=..")).toContainText("valid email address");
    await expect(page).toHaveURL(/organization-intelligence\.html/);

    await page.locator("#email").fill("founder@example.org");
    await expect(page.locator("#email")).not.toHaveAttribute("aria-invalid", "true");
    await page.locator("#organizationForm button[type=submit]").click();
    await expect(page.locator("#employees")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#employees").locator("xpath=..")).toContainText("at least 1");

    await page.locator("#employees").fill("-4");
    await page.locator("#employees").blur();
    await expect(page.locator("#employees")).toHaveAttribute("aria-invalid", "true");
    await page.locator("#employees").fill("5");
    await expect(page.locator("#employees")).not.toHaveAttribute("aria-invalid", "true");

    await page.locator("#managerCount").fill("6");
    await page.locator("#managerCount").blur();
    await expect(page.locator("#managerCount")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#managerCount").locator("xpath=..")).toContainText("cannot exceed");
    await page.locator("#managerCount").fill("0");
    await expect(page.locator("#managerCount")).not.toHaveAttribute("aria-invalid", "true");
  });

  test("Founding Beta blocks invalid optional employee count and email before network request", async ({ page }) => {
    let requests = 0;
    await page.route("**/api/beta-interest", async route => {
      requests++;
      await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
    });
    await page.goto("/founding-beta.html", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean((window as any).GrowWithHRFieldValidation));
    await page.locator("#betaName").fill("Test Founder");
    await page.locator("#betaEmail").fill("bad@domain");
    await page.locator("#betaCompany").fill("Test Group");
    await page.locator("#betaQuestion").fill("What should we change in our organization before scaling?");
    await page.locator("#betaEmployees").fill("0");
    await page.locator("#betaSubmit").click();
    await expect(page.locator("#betaEmail")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#betaEmployees")).toHaveAttribute("aria-invalid", "true");
    expect(requests).toBe(0);
    await page.locator("#betaEmail").fill("founder@example.org");
    await page.locator("#betaEmployees").fill("16");
    await expect(page.locator("#betaEmail")).not.toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#betaEmployees")).not.toHaveAttribute("aria-invalid", "true");
    await page.locator("#betaSubmit").click();
    await expect(page.locator("#betaStatus")).toContainText("shared with HRTechify");
    expect(requests).toBe(1);
  });

  test("Compliance Readiness rejects zero employees but accepts valid headcount", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/compliance-intelligence.html", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean((window as any).GrowWithHRFieldValidation &&
      (window as any).executiveAssessment));
    await page.getByRole("button", { name: "Start compliance review" }).first().click();
    await page.locator("#companyName").fill("Compliance Check Ltd");
    await page.locator("#industry").fill("People analytics platform");
    await page.locator("#nature").fill("We provide consulting services to growing businesses.");
    await page.locator("#nextButton").click();
    await expect(page.locator("#founded")).toBeVisible();
    await page.locator("#founded").fill("2025");
    await page.locator("#entity").selectOption({ label: "Not sure" });
    await page.locator("#nextButton").click();
    await expect(page.locator("#employees")).toBeVisible();
    await expect(page.locator("#employees")).toHaveAttribute("min", "1");
    await page.locator("#employees").fill("0");
    await page.locator("#nextButton").click();
    await expect(page.locator("#employees")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#employees").locator("xpath=..")).toContainText("at least 1");
    await page.locator("#employees").fill("20");
    await page.locator("#nextButton").click();
    await expect(page.locator("#employees")).toHaveCount(0);
  });

  test("Required whitespace-only field shows message and focuses field", async ({ page }) => {
    await page.goto("/organization-intelligence.html", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean((window as any).GrowWithHRFieldValidation));
    await page.locator("#companyName").fill("   ");
    await page.locator("#companyName").blur();
    await expect(page.locator("#companyName")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#companyName").locator("xpath=..")).toContainText("Please enter");
    await page.locator("#companyName").fill("Valid Company");
    await expect(page.locator("#companyName")).not.toHaveAttribute("aria-invalid", "true");
  });
});
