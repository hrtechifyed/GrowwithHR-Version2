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
        await page.waitForFunction(() => Boolean(
            (window as Window & { GrowWithHRDualEditionEmail?: { mode?: string } })
                .GrowWithHRDualEditionEmail?.mode === "two-separate-pdfs-one-email"
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
            return { content: style.content, borderWidth: style.borderTopWidth, borderRadius: style.borderRadius };
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

    test("tailors the executive summary across legal, sector, workforce and operating combinations", async ({ page }) => {
        const summaries = await page.evaluate(() => {
            const executive = (window as Window & {
                GrowWithHRExecutiveSummaryReport?: { executiveCopy: (data: unknown, rows: unknown[]) => any };
            }).GrowWithHRExecutiveSummaryReport!;
            const cases = [
                {
                    companyName: "Solo Technology OPC", entity: "One Person Company (OPC)", industry: "Software and SaaS",
                    employees: 1, workers: 0, contractors: 0, workforcePresence: "owner-only", primaryState: "Karnataka", workModel: "Remote"
                },
                {
                    companyName: "Retail Start Pvt Ltd", entity: "Private Limited Company", industry: "Retail and E-commerce",
                    employees: 8, contractors: 2, workforcePresence: "other-people", primaryState: "Maharashtra", workModel: "On-site", shiftWork: true
                },
                {
                    companyName: "Build Network LLP", entity: "Limited Liability Partnership", industry: "Construction and Real Estate",
                    employees: 12, workers: 18, contractors: 9, workforcePresence: "other-people", operatingStates: ["Delhi", "Haryana"], workModel: "Project sites"
                },
                {
                    companyName: "Precision Works Ltd", entity: "Public Limited Company", industry: "Manufacturing and Industrial",
                    employees: 72, workers: 45, contractors: 12, workforcePresence: "other-people", primaryState: "Pan India", workModel: "Factory", manufacturingProcess: true, nightShift: true
                },
                {
                    companyName: "Learning Mission Trust", entity: "Public Trust", industry: "Education and Training",
                    employees: 6, contractors: 4, workforcePresence: "other-people", primaryState: "Tamil Nadu", workModel: "Hybrid"
                }
            ];
            return cases.map((profile) => executive.executiveCopy(profile, []));
        });

        expect(summaries[0].profile.workforceStage).toBe("owner-only");
        expect(summaries[0].meaning).toContain("owner/director-led");
        expect(summaries[1].profile.sectorFamily).toBe("customer-operations");
        expect(summaries[1].profile.workforceStage).toBe("emerging-team");
        expect(summaries[1].ahead).toContain("customer-facing operations");
        expect(summaries[2].profile.legalFamily).toBe("partnership");
        expect(summaries[2].profile.workforceMix).toBe("mixed-workforce");
        expect(summaries[2].ahead).toContain("more than one state");
        expect(summaries[3].profile.workforceStage).toBe("scaled-workforce");
        expect(summaries[3].profile.sectorFamily).toBe("manufacturing");
        expect(summaries[3].ahead).toContain("factory status");
        expect(summaries[4].profile.legalFamily).toBe("mission-led");
        expect(summaries[4].profile.sectorFamily).toBe("care-education");
        expect(new Set(summaries.map((summary) => summary.ahead)).size).toBe(summaries.length);
    });

    test("generates a personalised executive-summary report", async ({ page }) => {
        const result = await page.evaluate(async () => {
            const service = (window as Window & {
                GrowWithHRPDF?: { buildAdvisoryPdf: (payload: unknown) => Promise<any> };
            }).GrowWithHRPDF!;
            return service.buildAdvisoryPdf({
                theme: "light",
                report: {
                    companyName: "Growth Services Pvt Ltd", entity: "Private Limited Company", industry: "Professional Services",
                    employees: 24, contractors: 6, workforcePresence: "other-people", primaryState: "Karnataka", workModel: "Hybrid"
                },
                answers: {
                    entity: "Private Limited Company", industry: "Professional Services", employees: 24, contractors: 6,
                    workforcePresence: "other-people", primaryState: "Karnataka", workModel: "Hybrid"
                }
            });
        });

        expect(result.reportStructureVersion).toBe("visual-sectioned-v5");
        expect(result.reportLayoutVersion).toBe("0.22.1-profile-tailored-executive-summary");
        expect(result.readingSections).toEqual([
            "Table of Contents", "Executive summary", "At a glance", "What to do now", "Complete the picture",
            "Your 90-day plan", "Watch as you grow", "The profile used", "End of Report"
        ]);
        expect(result.pdfs).toHaveLength(1);
        expect(result.emailAttachments).toHaveLength(0);
        expect(result.pageCount).toBeGreaterThanOrEqual(8);
    });

    test("sends Light and Dark as two separate attachments in one email", async ({ page }) => {
        const requests: Array<{ headers: Record<string, string>; body: any }> = [];
        await page.route("**/api/send-advisory", async (route) => {
            const request = route.request();
            requests.push({ headers: request.headers(), body: request.postDataJSON() });
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    ok: true,
                    customerSent: true,
                    customerStatus: "sent",
                    attachmentCount: 2,
                    attachmentFilenames: ["Light.pdf", "Dark.pdf"]
                })
            });
        });

        const result = await page.evaluate(async () => {
            const pdfService = (window as Window & {
                GrowWithHRPDF?: { buildAdvisoryPdf: (payload: unknown) => Promise<any> };
                GrowWithHREmail?: { sendAdvisory: (payload: unknown) => Promise<any> };
            }).GrowWithHRPDF!;
            const emailService = (window as Window & {
                GrowWithHREmail?: { sendAdvisory: (payload: unknown) => Promise<any> };
            }).GrowWithHREmail!;
            const report = {
                companyName: "Dual Edition Pvt Ltd", entity: "Private Limited", industry: "Professional Services",
                employees: 12, workforcePresence: "other-people", primaryState: "Maharashtra", workModel: "Hybrid",
                recipientEmail: "founder@example.com"
            };
            const pdf = await pdfService.buildAdvisoryPdf({ theme: "both", report, answers: report });
            const delivery = await emailService.sendAdvisory({
                action: "capture",
                lead: { name: "Founder", email: "founder@example.com", companyName: report.companyName },
                report,
                answers: report,
                pdf
            });
            return { pdf, delivery };
        });

        expect(result.pdf.selectedThemes).toEqual(["light", "dark"]);
        expect(result.pdf.pdfs).toHaveLength(2);
        expect(result.pdf.emailAttachments).toHaveLength(2);
        expect(result.pdf.deliveryMode).toBe("two-separate-pdfs-one-email");
        expect(result.pdf.theme).toBe("light");
        expect(result.pdf.filename).toContain("Light");
        expect(result.pdf.pdfs[0].filename).not.toBe(result.pdf.pdfs[1].filename);
        expect(result.delivery.attachmentCount).toBe(2);
        expect(result.delivery.singleEmailPerRecipient).toBe(true);
        expect(requests).toHaveLength(1);
        expect(requests[0].headers["x-growwithhr-attachment-count"]).toBe("2");
        expect(requests[0].body.pdfs).toHaveLength(2);
        expect(requests[0].body.pdfs.map((pdf: any) => pdf.theme)).toEqual(["light", "dark"]);
        expect(requests[0].body.pdf).toBeUndefined();
    });
});
