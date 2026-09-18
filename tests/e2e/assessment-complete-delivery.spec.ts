import { expect, test } from "@playwright/test";

const ASSESSMENT_STORAGE_KEY = "growwithhr-advisory-briefing-v2";
const REPORT_STORAGE_KEY = "growwithhr-report";
const DELIVERY_STORAGE_KEY = "growwithhr-advisory-delivery-v1";

test.describe("Complete assessment and advisory delivery", () => {
  test("moves from Analyze My Company through PDF generation and confirmed email delivery", async ({ page }) => {
    test.setTimeout(60_000);
    let deliveryPayload: Record<string, any> | null = null;

    await page.route("https://unpkg.com/**", route => route.abort());
    await page.route("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/**", route => route.abort());
    await page.route("**/jspdf.umd.min.js", async route => {
      await route.fulfill({ status: 200, contentType: "application/javascript", body: "" });
    });
    await page.route("**/api/health", async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, provider: "gmail-api", gmailConfigured: true })
      });
    });
    await page.route("**/api/report-id", async route => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          reportId: "GWHR-2026-0812-AA01",
          suffix: "AA01",
          generatedAt: "2026-08-12T03:51:00.000Z",
          durableStorageConfigured: true
        })
      });
    });
    await page.route("**/api/send-advisory", async route => {
      expect(route.request().headers()["authorization"]).toBe("Bearer local-test-token");
      deliveryPayload = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          mode: "gmail-api",
          customerStatus: "sent",
          customerSent: true,
          internalStatus: "not-configured",
          internalSent: false,
          attachmentFilename: "GrowWithHR-HR-Compliance-Growth-Report-End-to-End-Test-Company-GWHR-2026-0812-AA01.pdf"
        })
      });
    });

    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
      let session: any = null;
      (window as any).supabase = { createClient: () => ({ auth: {
        getSession: async () => ({ data: { session }, error: null }),
        signInWithPassword: async ({ email }: { email: string }) => {
          session = { user: { email }, access_token: 'local-test-token' };
          return { data: { session }, error: null };
        },
        signOut: async () => { session = null; return { error: null }; }
      } }) };

      class FakeJsPDF {
        pages = 1;
        constructor() {
          return new Proxy(this, {
            get(target, property, receiver) {
              if (property in target) return Reflect.get(target, property, receiver);
              return () => receiver;
            }
          });
        }
        splitTextToSize(value: unknown): string[] { return String(value ?? "").split("\n"); }
        addPage(): this { this.pages += 1; return this; }
        deletePage(): this { this.pages = Math.max(1, this.pages - 1); return this; }
        setPage(): this { return this; }
        getNumberOfPages(): number { return this.pages; }
        getTextWidth(value: unknown): number { return Math.max(1, String(value ?? "").length * 1.8); }
        output(type: string): string | ArrayBuffer {
          if (type === "datauristring") return "data:application/pdf;base64,JVBERi0xLjQK";
          if (type === "arraybuffer") return new TextEncoder().encode("%PDF-1.4\n").buffer;
          return "";
        }
        save(): void {}
      }
      (window as Window & { jspdf?: { jsPDF: typeof FakeJsPDF } }).jspdf = { jsPDF: FakeJsPDF };
    });

    await page.goto("/");
    await page.getByRole("link", { name: "Start an Assessment" }).click();
    await expect(page).toHaveURL(/\/intelligence-hub\.html$/);
    await page.locator('.analysis-action[href="compliance-intelligence.html"]').click();
    await expect(page).toHaveURL(/\/compliance-intelligence\.html$/);
    await page.getByRole("button", { name: "Start my advisory" }).click();

    await page.locator("#companyName").fill("End-to-End Test Company");
    await page.locator("#industry").fill("People analytics platform");
    await page.locator("#nature").fill("We provide people analytics software to growing businesses.");
    await page.locator("#nextButton").click();

    await expect(page.locator("#founded")).toBeVisible();
    await page.locator("#founded").fill("2020");
    await page.locator("#entity").selectOption("Private Limited");
    await page.locator("#fundingStage").selectOption("Bootstrapped");
    await page.locator("#nextButton").click();

    await expect(page.locator("#employees")).toBeVisible();
    await page.locator("#employees").fill("25");
    await page.locator("#nextButton").click();

    await page.getByText("Hybrid", { exact: true }).click();
    await page.getByText("25–50%", { exact: true }).click();
    await page.locator("#nextButton").click();

    await page.locator("#primaryState").fill("Maharashtra");
    await page.locator("#locations").fill("2");
    await page.locator("#countries").fill("1");
    await page.locator("#nextButton").click();

    await page.locator('input[name="hiringPlans"][value="Moderate Growth"]').check();
    await page.locator('input[name="expansionPlans"][value="scale-operations"]').check();
    await page.locator("#nextButton").click();

    const founderLed = page.getByRole("radio", { name: /Founder-led/i });
    await expect(founderLed).toBeVisible();
    await founderLed.check();
    await expect(founderLed).toBeChecked();
    await expect(page.locator('input[name="priorities"]')).toHaveCount(0);
    await page.locator("#nextButton").click();

    await expect(page.locator("#reviewScreen")).toBeVisible();
    await page.locator("#continueToContactButton").click();
    await page.locator("#leadName").fill("Test User");
    await page.locator("#leadEmail").fill("test.user@example.com");

    await page.waitForFunction(() => Boolean(
      (window as Window & {
        GrowWithHRReportRuntimeBootstrap?: { ready?: boolean };
        GrowWithHRPDF?: { buildAdvisoryPdf?: unknown; singleReportDelivery?: boolean };
        GrowWithHREmail?: { sendAdvisory?: unknown };
      }).GrowWithHRReportRuntimeBootstrap?.ready &&
      (window as Window & { GrowWithHRPDF?: { singleReportDelivery?: boolean } }).GrowWithHRPDF?.singleReportDelivery === true &&
      (window as Window & { GrowWithHREmail?: { sendAdvisory?: unknown } }).GrowWithHREmail?.sendAdvisory
    ));

    await page.waitForFunction(() => Boolean((window as any).GrowWithHRReportAccessGate?.installed));
    await page.locator("#generateReportButton").click();
    await expect(page.locator("#successScreen")).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('#personalReportGlimpse')).toBeVisible();
    expect(deliveryPayload).toBeNull();
    await expect(page.locator('#emailFullReportButton')).toBeDisabled();
    await page.locator('#customerAuthMount input[name="password"]').fill('local-test-password');
    await page.locator('#customerAuthMount .gwh-auth-submit').click();
    await expect(page.locator('#emailFullReportButton')).toBeEnabled();
    await page.locator('#emailFullReportButton').click();
    await expect(page.locator('#fullReportDeliveryStatus')).toContainText('Complete report sent');

    expect(deliveryPayload).not.toBeNull();
    const payload = deliveryPayload as Record<string, any>;
    expect(payload.action).toBe("capture");
    expect(payload.lead.email).toBe("test.user@example.com");
    expect(payload.report.companyName).toBe("End-to-End Test Company");
    expect(payload.pdf.base64).toBeTruthy();
    expect(Buffer.from(payload.pdf.base64, "base64").toString("ascii").startsWith("%PDF-")).toBe(true);

    const saved = await page.evaluate(({ assessmentKey, reportKey, deliveryKey }) => ({
      assessment: JSON.parse(localStorage.getItem(assessmentKey) || "null"),
      report: JSON.parse(localStorage.getItem(reportKey) || "null"),
      delivery: JSON.parse(localStorage.getItem(deliveryKey) || "null")
    }), {
      assessmentKey: ASSESSMENT_STORAGE_KEY,
      reportKey: REPORT_STORAGE_KEY,
      deliveryKey: DELIVERY_STORAGE_KEY
    });

    expect(saved.assessment?.completed).toBe(true);
    expect(saved.assessment?.answers?.customIndustry).toBe("People analytics platform");
    expect(saved.report?.companyName).toBe("End-to-End Test Company");
    expect(saved.delivery?.customerSent).toBe(true);
  });
});
