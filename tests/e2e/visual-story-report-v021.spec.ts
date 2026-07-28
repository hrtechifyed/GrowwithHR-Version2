import { expect, test } from "@playwright/test";

test.describe("v0.22 visual story and report", () => {
    test.beforeEach(async ({ page }) => {
        await page.route("**/jspdf.umd.min.js", async (route) => {
            await route.fulfill({ status: 200, contentType: "application/javascript", body: "" });
        });
        await page.addInitScript(() => {
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
                setPage(): this { return this; }
                getNumberOfPages(): number { return this.pages; }
                getTextWidth(value: unknown): number { return Math.max(1, String(value ?? "").length * 1.8); }
                output(type: string): string | ArrayBuffer {
                    if (type === "datauristring") return "data:application/pdf;base64,JVBERi0xLjQK";
                    if (type === "arraybuffer") return new TextEncoder().encode("%PDF-1.4\n").buffer;
                    return "";
                }
            }
            (window as Window & { jspdf?: { jsPDF: typeof FakeJsPDF } }).jspdf = { jsPDF: FakeJsPDF };
            localStorage.setItem("growwithhr-report-theme", "light");
        });
        await page.goto("/analyze-company.html", { waitUntil: "domcontentloaded" });
        await page.waitForFunction(() => Boolean(
            (window as Window & { GrowWithHRPDF?: { visualSectionedReportVersion?: string } })
                .GrowWithHRPDF?.visualSectionedReportVersion
        ));
        await page.waitForFunction(() => Boolean(
            (window as Window & { GrowWithHRExecutiveSummaryReport?: { version?: string } })
                .GrowWithHRExecutiveSummaryReport?.version
        ));
    });

    test("turns the first story into concise cards with plain disclosure markers", async ({ page }) => {
        await page.getByTestId("begin-executive-assessment").click();
        await expect(page.locator("#stepTitle .advisory-visible-step-title")).toHaveText("Tell us the essentials.");
        await expect(page.locator("#stepDescription")).toHaveText("Three quick answers about the organisation.");
        await expect(page.locator("#storyQuickGuide")).toBeVisible();
        await expect(page.locator("#storyContainer .advisory-question-card")).toHaveCount(3);
        await expect(page.locator("#storyContainer .advisory-question-card--wide")).toHaveCount(1);
        await expect(page.locator("#storyContainer .advisory-help-disclosure")).toHaveCount(3);
        const marker = await page.locator(".advisory-help-disclosure summary").first().evaluate((element) => {
            const style = getComputedStyle(element, "::before");
            return {
                content: style.content,
                borderWidth: style.borderTopWidth,
                borderRadius: style.borderRadius
            };
        });
        expect(marker.content).toContain("+");
        expect(marker.borderWidth).toBe("0px");
        expect(marker.borderRadius).toBe("0px");
    });

    test("explains what the previous chapter clarified before the next chapter", async ({ page }) => {
        await page.getByTestId("begin-executive-assessment").click();
        await page.evaluate(() => {
            const app = (window as Window & { executiveAssessment?: { showMoment?: (moment: number) => void } }).executiveAssessment;
            app?.showMoment?.(2);
        });

        await expect(page.locator("#chapterInsight")).toBeVisible();
        await expect(page.locator("#chapterInsight")).toContainText("Business context captured");
        await expect(page.locator("#chapterInsight")).toContainText("what the organisation does");
        await expect(page.locator("#chapterInsight")).toContainText("workforce questions");
        await expect(page.locator(".advisory-industry-adaptive__heading").first().locator("h3")).toHaveText("Who works with you?");
        await expect(page.locator('[data-field-wrapper="womenEmployees"]')).not.toHaveClass(/advisory-question-card--wide/);
    });

    test("generates a personalised executive-summary report", async ({ page }) => {
        const result = await page.evaluate(async () => {
            const service = (window as Window & {
                GrowWithHRPDF?: { buildAdvisoryPdf: (payload: unknown) => Promise<any> };
            }).GrowWithHRPDF!;
            const executive = (window as Window & {
                GrowWithHRExecutiveSummaryReport?: { executiveCopy: (data: unknown, rows: unknown[]) => any };
            }).GrowWithHRExecutiveSummaryReport!;
            const summary = executive.executiveCopy({
                companyName: "Solo Technology OPC",
                entity: "One Person Company (OPC)",
                industry: "Software and SaaS",
                employees: 1,
                workers: 0,
                contractors: 0,
                workforcePresence: "owner-only",
                primaryState: "Karnataka",
                workModel: "Remote"
            }, []);
            const pdf = await service.buildAdvisoryPdf({
                theme: "light",
                report: {
                    companyName: "Solo Technology OPC",
                    entity: "One Person Company (OPC)",
                    industry: "Software and SaaS",
                    employees: 1,
                    workforcePresence: "owner-only",
                    primaryState: "Karnataka",
                    workModel: "Remote"
                },
                answers: {
                    entity: "One Person Company (OPC)",
                    industry: "Software and SaaS",
                    employees: 1,
                    workforcePresence: "owner-only",
                    primaryState: "Karnataka",
                    workModel: "Remote"
                }
            });
            return { pdf, summary };
        });

        expect(result.summary.profile.ownerOnly).toBe(true);
        expect(result.summary.meaning).toContain("lean owner-led setup");
        expect(result.summary.ahead).toContain("hiring the first employee");
        expect(result.pdf.reportStructureVersion).toBe("visual-sectioned-v5");
        expect(result.pdf.reportLayoutVersion).toBe("0.22.0-executive-summary-report");
        expect(result.pdf.readingSections).toEqual([
            "Table of Contents",
            "Executive summary",
            "At a glance",
            "What to do now",
            "Complete the picture",
            "Your 90-day plan",
            "Watch as you grow",
            "The profile used",
            "End of Report"
        ]);
        expect(result.pdf.pdfs).toHaveLength(1);
        expect(result.pdf.pageCount).toBeGreaterThanOrEqual(8);
    });

    test("bundles Light and Dark editions into one email PDF", async ({ page }) => {
        const result = await page.evaluate(async () => {
            const service = (window as Window & {
                GrowWithHRPDF?: { buildAdvisoryPdf: (payload: unknown) => Promise<any> };
            }).GrowWithHRPDF!;
            return service.buildAdvisoryPdf({
                theme: "both",
                report: {
                    companyName: "Dual Edition Pvt Ltd",
                    entity: "Private Limited",
                    industry: "Professional Services",
                    employees: 12,
                    workforcePresence: "other-people",
                    primaryState: "Maharashtra",
                    workModel: "Hybrid"
                },
                answers: {
                    entity: "Private Limited",
                    industry: "Professional Services",
                    employees: 12,
                    workforcePresence: "other-people",
                    primaryState: "Maharashtra",
                    workModel: "Hybrid"
                }
            });
        });

        expect(result.selectedThemes).toEqual(["light", "dark"]);
        expect(result.pdfs).toHaveLength(2);
        expect(result.oneEmailDelivery).toBe(true);
        expect(result.oneEmailBundle).toBe(true);
        expect(result.theme).toBe("both");
        expect(result.filename).toContain("Light-and-Dark");
        expect(result.bundledThemes).toEqual(["light", "dark"]);
        expect(result.pageCount).toBeGreaterThan(result.pdfs[0].pageCount);
    });
});
