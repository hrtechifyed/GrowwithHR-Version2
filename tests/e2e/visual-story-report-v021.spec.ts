import { expect, test } from "@playwright/test";

test.describe("founder-demo visual story and report", () => {
    test.beforeEach(async ({ page }) => {
        await page.route("**/jspdf.umd.min.js", async (route) => {
            await route.fulfill({ status: 200, contentType: "application/javascript", body: "" });
        });
        await page.route("**/api/report-id", async (route) => {
            await route.fulfill({
                status: 201,
                contentType: "application/json",
                body: JSON.stringify({
                    ok: true,
                    reportId: "GWHR-2026-0811-AA01",
                    suffix: "AA01",
                    generatedAt: "2026-08-11T10:00:00.000Z",
                    replayed: false,
                    durableStorageConfigured: true
                })
            });
        });
        await page.addInitScript(() => {
            class FakeJsPDF {
                pages = 1;
                images: unknown[][] = [];
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
                addImage(...args: unknown[]): this { this.images.push(args); return this; }
                output(type: string): string | ArrayBuffer {
                    if (type === "datauristring") return "data:application/pdf;base64,JVBERi0xLjQK";
                    if (type === "arraybuffer") return new TextEncoder().encode("%PDF-1.4\n").buffer;
                    return "";
                }
            }
            (window as Window & { jspdf?: { jsPDF: typeof FakeJsPDF } }).jspdf = { jsPDF: FakeJsPDF };
        });
        await page.goto("/analyze-company.html?engine=compliance", { waitUntil: "domcontentloaded" });
        await page.waitForFunction(() => Boolean(
            (window as Window & { GrowWithHRPDF?: { visualSectionedReportVersion?: string } })
                .GrowWithHRPDF?.visualSectionedReportVersion
        ));
        await page.waitForFunction(() => Boolean(
            (window as Window & { GrowWithHRFounderDemoReport?: { singleEdition?: boolean } })
                .GrowWithHRFounderDemoReport?.singleEdition
        ));
        await page.waitForFunction(() => Boolean(
            (window as Window & { GrowWithHRReportBrandTemplate?: { singleEdition?: boolean } })
                .GrowWithHRReportBrandTemplate?.singleEdition
        ));
        await page.waitForFunction(() => Boolean(
            (window as Window & { GrowWithHRReportRuntimeBootstrap?: { singleReportDelivery?: boolean } })
                .GrowWithHRReportRuntimeBootstrap?.singleReportDelivery
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
    });

    test("tailors the executive summary across legal, sector, workforce and operating combinations", async ({ page }) => {
        const summaries = await page.evaluate(() => {
            const executive = (window as Window & {
                GrowWithHRExecutiveSummaryReport?: { executiveCopy: (data: unknown, rows: unknown[]) => any };
            }).GrowWithHRExecutiveSummaryReport!;
            const cases = [
                { companyName: "Solo Technology OPC", entity: "One Person Company (OPC)", industry: "Software and SaaS", employees: 1, workers: 0, contractors: 0, workforcePresence: "owner-only", primaryState: "Karnataka", workModel: "Remote" },
                { companyName: "Retail Start Pvt Ltd", entity: "Private Limited Company", industry: "Retail and E-commerce", employees: 8, contractors: 2, workforcePresence: "other-people", primaryState: "Maharashtra", workModel: "On-site", shiftWork: true },
                { companyName: "Build Network LLP", entity: "Limited Liability Partnership", industry: "Construction and Real Estate", employees: 12, workers: 18, contractors: 9, workforcePresence: "other-people", operatingStates: ["Delhi", "Haryana"], workModel: "Project sites" },
                { companyName: "Precision Works Ltd", entity: "Public Limited Company", industry: "Manufacturing and Industrial", employees: 72, workers: 45, contractors: 12, workforcePresence: "other-people", primaryState: "Pan India", workModel: "Factory", manufacturingProcess: true, nightShift: true },
                { companyName: "Learning Mission Trust", entity: "Public Trust", industry: "Education and Training", employees: 6, contractors: 4, workforcePresence: "other-people", primaryState: "Tamil Nadu", workModel: "Hybrid" }
            ];
            return cases.map((profile) => executive.executiveCopy(profile, []));
        });

        expect(summaries[0].profile.workforceStage).toBe("owner-only");
        expect(summaries[1].profile.sectorFamily).toBe("customer-operations");
        expect(summaries[2].profile.legalFamily).toBe("partnership");
        expect(summaries[2].profile.workforceMix).toBe("mixed-workforce");
        expect(summaries[3].profile.workforceStage).toBe("scaled-workforce");
        expect(summaries[3].profile.sectorFamily).toBe("manufacturing");
        expect(summaries[4].profile.legalFamily).toBe("mission-led");
        expect(new Set(summaries.map((summary) => summary.ahead)).size).toBe(summaries.length);
    });

    test("forces one clean standard HRTechify report even when an old caller asks for both themes", async ({ page }) => {
        const result = await page.evaluate(async () => {
            const service = (window as Window & {
                GrowWithHRPDF?: { buildAdvisoryPdf: (payload: unknown) => Promise<any> };
            }).GrowWithHRPDF!;
            const brand = (window as Window & {
                GrowWithHRReportBrandTemplate?: {
                    templateId?: string;
                    logoAsset?: string;
                    singleEdition?: boolean;
                    reportStyle?: string;
                    editorialResearchTemplate?: boolean;
                    reusableTemplateContext?: boolean;
                    preservesDeterministicInformation?: boolean;
                };
            }).GrowWithHRReportBrandTemplate!;
            const report = {
                companyName: "Template Standard Pvt Ltd", entity: "Private Limited Company", industry: "Professional Services",
                employees: 24, contractors: 6, workforcePresence: "other-people", primaryState: "Karnataka", workModel: "Hybrid"
            };
            const pdf = await service.buildAdvisoryPdf({ theme: "both", report, answers: report });
            return {
                selectedThemes: pdf.selectedThemes,
                pdfCount: pdf.pdfs.length,
                attachmentCount: pdf.attachmentCount,
                deliveryMode: pdf.deliveryMode,
                filename: pdf.filename,
                reportId: pdf.reportId,
                reportStructureVersion: pdf.reportStructureVersion,
                sharedTemplateId: pdf.sharedTemplateId,
                reportStyleId: pdf.reportStyleId,
                informationPreservation: pdf.informationPreservation,
                brandLogoAsset: pdf.brandLogoAsset,
                imageCount: pdf.document.images.length,
                brand
            };
        });

        expect(result.selectedThemes).toEqual(["standard"]);
        expect(result.pdfCount).toBe(1);
        expect(result.attachmentCount).toBe(1);
        expect(result.deliveryMode).toBe("single-pdf-one-email");
        expect(result.filename).not.toContain("Light");
        expect(result.filename).not.toContain("Dark");
        expect(result.filename).toContain("GWHR-2026-0811-AA01");
        expect(result.reportId).toBe("GWHR-2026-0811-AA01");
        expect(result.reportStructureVersion).toBe("founder-demo-single-v1");
        expect(result.sharedTemplateId).toBe("hrtechify-founder-compliance-growth-v1");
        expect(result.reportStyleId).toBe("editorial-research-v1");
        expect(result.informationPreservation).toBe("full-deterministic-finding-appendix");
        expect(result.brandLogoAsset).toBe("assets/hrtechify-logo.png");
        expect(result.brand.singleEdition).toBe(true);
        expect(result.brand.reportStyle).toBe("editorial-research-v1");
        expect(result.brand.editorialResearchTemplate).toBe(true);
        expect(result.brand.reusableTemplateContext).toBe(true);
        expect(result.brand.preservesDeterministicInformation).toBe(true);
        expect(result.imageCount).toBeGreaterThanOrEqual(2);
    });

    test("generates the founder-report section sequence without scorecards or dual attachments", async ({ page }) => {
        const result = await page.evaluate(async () => {
            const service = (window as Window & {
                GrowWithHRPDF?: { buildAdvisoryPdf: (payload: unknown) => Promise<any> };
            }).GrowWithHRPDF!;
            return service.buildAdvisoryPdf({
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

        expect(result.reportStructureVersion).toBe("founder-demo-single-v1");
        expect(result.readingSections).toEqual([
            "Your company profile",
            "Your HR compliance position",
            "Compliance areas relevant today",
            "Information that could change this report",
            "Growth compliance radar",
            "Your founder action list",
            "How GrowWithHR reached this report",
            "Report basis, scope & limitations",
            "End of Report"
        ]);
        expect(result.pdfs).toHaveLength(1);
        expect(result.emailAttachments).toHaveLength(1);
        expect(result.attachmentCount).toBe(1);
        expect(result.singleReportDelivery).toBe(true);
        expect(result.dualThemeDelivery).toBe(false);
        expect(result.pageCount).toBeGreaterThanOrEqual(6);
    });

    test("emails exactly one standard report PDF", async ({ page }) => {
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
                    attachmentCount: 1,
                    attachmentFilenames: ["GrowWithHR-HR-Compliance-Growth-Report.pdf"],
                    singleReportDelivery: true
                })
            });
        });

        const result = await page.evaluate(async () => {
            const pdfService = (window as Window & {
                GrowWithHRPDF?: { buildAdvisoryPdf: (payload: unknown) => Promise<any> };
            }).GrowWithHRPDF!;
            const emailService = (window as Window & {
                GrowWithHREmail?: { sendAdvisory: (payload: unknown) => Promise<any> };
            }).GrowWithHREmail!;
            const report = {
                companyName: "Single Edition Pvt Ltd", entity: "Private Limited", industry: "Professional Services",
                employees: 12, workforcePresence: "other-people", primaryState: "Maharashtra", workModel: "Hybrid",
                recipientEmail: "founder@example.com"
            };
            const pdf = await pdfService.buildAdvisoryPdf({ theme: "dark", report, answers: report });
            const delivery = await emailService.sendAdvisory({
                action: "capture",
                lead: { name: "Founder", email: "founder@example.com", companyName: report.companyName },
                report,
                answers: report,
                pdf
            });
            return {
                selectedThemes: pdf.selectedThemes,
                pdfCount: pdf.pdfs.length,
                attachmentCount: pdf.attachmentCount,
                deliveryMode: pdf.deliveryMode,
                filename: pdf.filename,
                delivery
            };
        });

        expect(result.selectedThemes).toEqual(["standard"]);
        expect(result.pdfCount).toBe(1);
        expect(result.attachmentCount).toBe(1);
        expect(result.deliveryMode).toBe("single-pdf-one-email");
        expect(result.filename).not.toContain("Dark");
        expect(result.delivery.attachmentCount).toBe(1);
        expect(requests).toHaveLength(1);
        expect(requests[0].body.pdf).toBeDefined();
        expect(requests[0].body.pdfs).toBeUndefined();
        expect(requests[0].headers["x-growwithhr-attachment-count"]).toBeUndefined();
    });
});