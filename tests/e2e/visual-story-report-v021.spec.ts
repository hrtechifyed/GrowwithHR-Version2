import { expect, test } from "@playwright/test";

test.describe("v0.21 visual story and report", () => {
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
            (window as Window & { GrowWithHRStoryVisualSections?: { version?: string } })
                .GrowWithHRStoryVisualSections?.version
        ));
    });

    test("turns the first story into concise, aligned question cards", async ({ page }) => {
        await page.getByTestId("begin-executive-assessment").click();
        await expect(page.locator("#stepTitle .advisory-visible-step-title")).toHaveText("Tell us the essentials.");
        await expect(page.locator("#stepDescription")).toHaveText("Three quick answers about the organisation.");
        await expect(page.locator("#storyQuickGuide")).toBeVisible();
        await expect(page.locator("#storyContainer .advisory-question-card")).toHaveCount(3);
        await expect(page.locator("#storyContainer .advisory-question-card--wide")).toHaveCount(1);
        await expect(page.locator("#storyContainer .advisory-help-disclosure")).toHaveCount(3);
        await expect(page.locator("#storyContainer")).toHaveAttribute("data-visual-section-version", "0.21.1-story-visual-sections");
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

    test("generates a navigable action brief instead of a lecture-style report", async ({ page }) => {
        const result = await page.evaluate(async () => {
            const service = (window as Window & {
                GrowWithHRPDF?: { buildAdvisoryPdf: (payload: unknown) => Promise<any> };
            }).GrowWithHRPDF!;
            return service.buildAdvisoryPdf({
                theme: "light",
                report: {
                    companyName: "Simple Sections Pvt Ltd",
                    entity: "Private Limited",
                    industry: "Software and SaaS",
                    employees: 25,
                    workforcePresence: "other-people",
                    primaryState: "Karnataka",
                    workModel: "Hybrid"
                },
                answers: {
                    entity: "Private Limited",
                    industry: "Software and SaaS",
                    employees: 25,
                    workforcePresence: "other-people",
                    primaryState: "Karnataka",
                    workModel: "Hybrid"
                }
            });
        });

        expect(result.reportStructureVersion).toBe("visual-sectioned-v4");
        expect(result.reportLayoutVersion).toBe("0.21.1-visual-sectioned-report");
        expect(result.readingSections).toEqual([
            "Table of Contents",
            "At a glance",
            "What to do now",
            "Complete the picture",
            "Your 90-day plan",
            "Watch as you grow",
            "The profile used",
            "End of Report"
        ]);
        expect(result.pdfs).toHaveLength(1);
        expect(result.pdfs[0].filename).toContain("Action-Brief");
        expect(result.pdfs[0].pageCount).toBeGreaterThanOrEqual(7);
    });
});