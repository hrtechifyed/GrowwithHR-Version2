import { test, expect } from "@playwright/test";

test.describe("Organization Structure journey", () => {
  test("securely hands a recovered Company Workspace into the new Organization tab", async ({ context, page }) => {
    await context.route("**/api/company-workspace/handoff/create", async (route) => {
      const request = route.request();
      expect(request.method()).toBe("POST");
      const body = request.postDataJSON();
      expect(body.reportId).toBe("GWHR-2026-0817-AA01");
      expect(body.accessKey).toBe("TEST-RECOVERY-CODE");
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, token: "one-time-test-token", expiresAt: new Date(Date.now() + 120000).toISOString() })
      });
    });

    await context.route("**/api/company-workspace/handoff/consume", async (route) => {
      const request = route.request();
      expect(request.method()).toBe("POST");
      const body = request.postDataJSON();
      expect(body.token).toBe("one-time-test-token");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          accessKey: "TEST-RECOVERY-CODE",
          workspace: {
            reportId: "GWHR-2026-0817-AA01",
            reportIds: ["GWHR-2026-0817-AA01"],
            email: "founder@example.com",
            companyName: "Browser Test Co",
            completedEngines: ["compliance"],
            expiresAt: "2027-02-17T12:00:00.000Z",
            companyData: {
              shared: { companyName: "Browser Test Co", email: "founder@example.com", industry: "Technology", employees: 42 },
              workforce: { totalEmployees: 42, expectedEmployees12Months: 60 },
              geography: { operatingLocationCount: 2 },
              organization: { peopleManagerCount: 6, reportingLevels: 2, founderDirectReports: 5, departments: ["Sales", "Product", "People"] }
            }
          }
        })
      });
    });

    await page.goto("/intelligence-hub.html");
    await page.evaluate(() => {
      sessionStorage.setItem("growwithhr.workspace", JSON.stringify({
        reportId: "GWHR-2026-0817-AA01",
        reportIds: ["GWHR-2026-0817-AA01"],
        accessKey: "TEST-RECOVERY-CODE",
        email: "founder@example.com",
        companyName: "Browser Test Co",
        completedEngines: ["compliance"],
        companyData: {}
      }));
    });

    const popupPromise = page.waitForEvent("popup");
    await page.getByRole("link", { name: /Understand My Organization Structure/i }).click();
    const popup = await popupPromise;
    await popup.waitForLoadState("domcontentloaded");

    await expect(popup).toHaveURL(/organization-intelligence\.html$/);
    await expect(popup.locator("#companyName")).toHaveValue("Browser Test Co");
    await expect(popup.locator("#email")).toHaveValue("founder@example.com");
    await expect(popup.locator("#employees")).toHaveValue("42");
    await expect(popup.locator("#managerCount")).toHaveValue("6");
    expect(popup.url()).not.toContain("TEST-RECOVERY-CODE");
    expect(popup.url()).not.toContain("handoff=");
  });

  test("keeps Overview, Findings and Growth Scenario in one report tab and restores the active section after refresh", async ({ page }) => {
    await page.goto("/organization-structure-report.html?sample=1#overview");

    await expect(page.getByRole("heading", { name: /Understand My Organization Structure/i })).toBeVisible();
    await expect(page.locator("#screen-overview")).toBeVisible();
    await expect(page.locator("#screen-findings")).toBeHidden();
    await expect(page.getByRole("button", { name: /Download PDF/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Email Report/i })).toBeDisabled();

    await page.getByRole("button", { name: /View Detailed Findings/i }).click();
    await expect(page).toHaveURL(/#findings$/);
    await expect(page.locator("#screen-findings")).toBeVisible();
    await expect(page.getByText(/Basis & Sources/i).first()).toBeVisible();
    await expect(page.getByText(/GrowWithHR rule:/i).first()).toBeVisible();

    await page.reload();
    await expect(page).toHaveURL(/#findings$/);
    await expect(page.locator("#screen-findings")).toBeVisible();

    await page.getByRole("button", { name: /View 12-Month Growth Scenario/i }).click();
    await expect(page).toHaveURL(/#scenario$/);
    await expect(page.locator("#screen-scenario")).toBeVisible();
    await expect(page.getByText(/This is a deterministic planning scenario/i)).toBeVisible();

    await page.getByRole("button", { name: /Executive Overview/i }).click();
    await expect(page).toHaveURL(/#overview$/);
    await expect(page.locator("#screen-overview")).toBeVisible();
  });

  test("Organization report remains usable on a narrow mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/organization-structure-report.html?sample=1#overview");

    await expect(page.getByRole("heading", { name: /Understand My Organization Structure/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Download PDF/i })).toBeVisible();
    await expect(page.locator(".org-stepper")).toBeVisible();

    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.innerWidth + 2);
  });

  test("report navigation exposes accessible step state and source links", async ({ page }) => {
    await page.goto("/organization-structure-report.html?sample=1#overview");

    const overviewStep = page.getByRole("button", { name: /1 · Executive Overview/i });
    await expect(overviewStep).toHaveAttribute("aria-current", "step");
    await page.getByRole("button", { name: /View Detailed Findings/i }).click();
    const findingsStep = page.getByRole("button", { name: /2 · Detailed Findings/i });
    await expect(findingsStep).toHaveAttribute("aria-current", "step");

    const firstSource = page.locator(".org-source-list a").first();
    await expect(firstSource).toHaveAttribute("href", /^https:\/\//);
    await expect(firstSource).toHaveAttribute("target", "_blank");
  });
});
