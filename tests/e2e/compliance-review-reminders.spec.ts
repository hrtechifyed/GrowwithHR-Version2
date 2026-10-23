import { expect, test } from "@playwright/test";

test("declining compliance reminders never subscribes or sends an enrollment request", async ({ page }) => {
  await page.goto("/founding-beta.html", { waitUntil: "domcontentloaded" });
  await page.evaluate(async () => {
    const element = document.createElement("div");
    element.id = "testReportCompletion";
    document.querySelector("main")!.appendChild(element);
    (window as any).reminderCalls = [];
    (window as any).GrowWithHRCompanyWorkspace = {
      reviewReminderStatus: async () => ({ status: "off" }),
      enrollReviewReminder: async (payload: unknown) => {
        (window as any).reminderCalls.push(payload);
        return { status: "active" };
      }
    };
    const module = await import("./js/compliance-review-prompt.js");
    module.render(element, {
      reportId: "GWHR-2026-1010-AB12",
      accessKey: "test-credential-not-displayed",
      email: "founder@example.org",
      lastComplianceReportId: "GWHR-2026-1010-AB12"
    });
  });
  await expect(page.locator("#gwhComplianceReviewReminders")).toBeVisible();
  await page.getByRole("button", { name: "No, thanks" }).click();
  await expect(page.locator(".gwh-review-status")).toContainText("No reminders scheduled");
  expect(await page.evaluate(() => (window as any).reminderCalls)).toEqual([]);
});

test("Yes alone cannot enroll; final confirmation requires matching signed-in email", async ({ page }) => {
  await page.goto("/founding-beta.html", { waitUntil: "domcontentloaded" });
  await page.evaluate(async () => {
    const element = document.createElement("div");
    element.id = "testCompletedAudit";
    document.querySelector("main")!.appendChild(element);
    (window as any).reminderCalls = [];
    (window as any).GrowWithHRCompanyWorkspace = {
      reviewReminderStatus: async () => ({ status: "off" }),
      enrollReviewReminder: async (payload: any, token: string) => {
        (window as any).reminderCalls.push({ payload, token });
        return { status: "active", cadence: payload.cadence, nextReviewAt: "2026-11-23T08:00:00Z" };
      },
      manageReviewReminder: async () => ({ status: "paused", cadence: "monthly" })
    };
    (window as any).GrowWithHRCustomerAuth = {
      requireMatchingSession: async (email: string) => {
        if (email !== "founder@example.org") throw new Error("Different work email");
        return { access_token: "test-user-token" };
      }
    };
    const module = await import("./js/compliance-review-prompt.js");
    module.render(element, {
      reportId: "GWHR-2026-1010-AB12",
      accessKey: "test-credential-not-displayed",
      email: "founder@example.org",
      lastComplianceReportId: "GWHR-2026-1010-AB12"
    });
  });
  await page.getByRole("button", { name: "Yes, set up reminders" }).click();
  await expect(page.locator(".gwh-review-confirm")).toBeVisible();
  expect(await page.evaluate(() => (window as any).reminderCalls)).toEqual([]);
  await page.locator("#gwhReviewCadence").selectOption("quarterly");
  await page.getByRole("button", { name: "Start reminders" }).click();
  await expect(page.locator(".gwh-review-status")).toContainText("Reminders enabled");
  const calls = await page.evaluate(() => (window as any).reminderCalls);
  expect(calls).toHaveLength(1);
  expect(calls[0].payload).toEqual({
    reportId: "GWHR-2026-1010-AB12",
    accessKey: "test-credential-not-displayed",
    email: "founder@example.org",
    cadence: "quarterly",
    confirm: true
  });
  expect(calls[0].token).toBe("test-user-token");
  await expect(page.locator("#gwhComplianceReviewReminders")).not.toContainText("test-credential-not-displayed");
});

test("email unsubscribe link never unsubscribes before clicking confirm", async ({ page }) => {
  let called = 0;
  await page.route("**/api/company-workspace/review-reminders/unsubscribe", async route => {
    called += 1;
    await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true,"stopped":true}' });
  });
  await page.goto("/reminder-preferences.html#token=" + "x".repeat(43), { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("button", { name: "Stop review reminders" })).toBeEnabled();
  expect(called).toBe(0);
  await page.getByRole("button", { name: "Stop review reminders" }).click();
  await expect(page.locator("#reminderPreferenceStatus")).toContainText("have been turned off");
  expect(called).toBe(1);
  await expect(page).not.toHaveURL(/#token=/);
});
