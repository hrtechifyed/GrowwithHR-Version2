import { expect, test } from "@playwright/test";

test.describe("v0.20 contextual report intelligence", () => {
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
                splitTextToSize(value: unknown): string[] {
                    return String(value ?? "").split("\n");
                }
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
            }
            (window as Window & { jspdf?: { jsPDF: typeof FakeJsPDF } }).jspdf = { jsPDF: FakeJsPDF };
            localStorage.setItem("growwithhr-report-theme", "light");
        });
        await page.goto("/analyze-company.html", { waitUntil: "domcontentloaded" });
        await page.waitForFunction(() => Boolean(
            (window as Window & { GrowWithHRPDF?: { reportIntelligenceFixVersion?: string } })
                .GrowWithHRPDF?.reportIntelligenceFixVersion
        ));
    });

    test("generates only the selected light edition unless both is explicitly selected", async ({ page }) => {
        const result = await page.evaluate(async () => {
            const input = document.createElement("input");
            input.type = "radio";
            input.name = "advisoryReportTheme";
            input.value = "light";
            input.checked = true;
            document.body.appendChild(input);

            const service = (window as Window & {
                GrowWithHRPDF?: { buildAdvisoryPdf: (payload: unknown) => Promise<any> };
            }).GrowWithHRPDF!;
            const light = await service.buildAdvisoryPdf({
                report: {
                    companyName: "Owner Only Consulting OPC",
                    entity: "One Person Company",
                    industry: "Business consulting",
                    employees: 1,
                    workers: 0,
                    contractWorkers: 0,
                    workforcePresence: "owner-only",
                    primaryState: "Karnataka",
                    workModel: "Remote"
                },
                answers: {
                    entity: "One Person Company",
                    industry: "Business consulting",
                    employees: 1,
                    workers: 0,
                    contractWorkers: 0,
                    workforcePresence: "owner-only",
                    primaryState: "Karnataka",
                    workModel: "Remote"
                }
            });

            input.value = "both";
            const both = await service.buildAdvisoryPdf({
                report: { companyName: "Two Edition Test", entity: "Private Limited", employees: 25 },
                answers: { entity: "Private Limited", employees: 25 }
            });

            return {
                lightThemes: light.selectedThemes,
                lightCount: light.pdfs.length,
                lightTheme: light.pdfs[0]?.theme,
                bothThemes: both.selectedThemes,
                bothCount: both.pdfs.length
            };
        });

        expect(result.lightThemes).toEqual(["light"]);
        expect(result.lightCount).toBe(1);
        expect(result.lightTheme).toBe("light");
        expect(result.bothThemes).toEqual(["light", "dark"]);
        expect(result.bothCount).toBe(2);
    });

    test("removes factory and workforce questions from an owner-only non-manufacturing OPC report", async ({ page }) => {
        const result = await page.evaluate(() => {
            const api = (window as Window & {
                GrowWithHRReportIntelligenceFixes?: {
                    contextualiseRows: (rows: unknown[], data: unknown) => any[];
                    contextFor: (data: unknown) => any;
                };
            }).GrowWithHRReportIntelligenceFixes!;
            const data = {
                entity: "One Person Company",
                industry: "Business consulting",
                employees: 1,
                workers: 0,
                contractors: 0,
                workforcePresence: "owner-only"
            };
            const rows = api.contextualiseRows([
                {
                    id: "factories",
                    shortTitle: "Factories Act, 1948",
                    status: "Needs information",
                    confirmedInputs: ["primaryState"],
                    missingInputs: ["workers", "usesPower", "manufacturingOperations"],
                    missingQuestions: [
                        "How many factory workers are engaged?",
                        "Is power used?",
                        "Is there a manufacturing process?"
                    ],
                    inputCoverage: { confirmed: 1, required: 4 },
                    thresholdResult: { state: "needs-information" }
                },
                {
                    id: "shops",
                    shortTitle: "Shops and Establishments Law",
                    status: "Review required",
                    confirmedInputs: ["primaryState", "establishmentType", "indiaOperations"],
                    missingInputs: [],
                    missingQuestions: [],
                    inputCoverage: { confirmed: 3, required: 3 },
                    thresholdResult: { state: "review" }
                }
            ], data);
            return {
                context: api.contextFor(data),
                ids: rows.map((row) => row.id),
                questions: rows.flatMap((row) => row.missingQuestions || [])
            };
        });

        expect(result.context.ownerOnly).toBe(true);
        expect(result.context.manufacturingContext).toBe(false);
        expect(result.ids).toEqual(["shops"]);
        expect(result.questions).toEqual([]);
    });
});
