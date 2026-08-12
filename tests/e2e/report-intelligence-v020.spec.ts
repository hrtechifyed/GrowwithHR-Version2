import { expect, test } from "@playwright/test";

const ASSESSMENT_KEY = "growwithhr-advisory-briefing-v2";

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
        await page.waitForFunction(() => Boolean(
            (window as Window & { GrowWithHRSectorContextIntelligence?: { version?: string } })
                .GrowWithHRSectorContextIntelligence?.version
        ));
    });

    test("forces one standard report even when a stale caller requests both editions", async ({ page }) => {
        await page.waitForFunction(() => Boolean(
            (window as Window & {
                GrowWithHRReportRuntimeBootstrap?: { ready?: boolean };
                GrowWithHRPDF?: { singleReportDelivery?: boolean; reportStructureVersion?: string };
            }).GrowWithHRReportRuntimeBootstrap?.ready &&
            (window as Window & { GrowWithHRPDF?: { singleReportDelivery?: boolean } })
                .GrowWithHRPDF?.singleReportDelivery === true
        ));

        const result = await page.evaluate(async () => {
            const input = document.createElement("input");
            input.type = "radio";
            input.name = "advisoryReportTheme";
            input.value = "both";
            input.checked = true;
            document.body.appendChild(input);

            const service = (window as Window & {
                GrowWithHRPDF?: { buildAdvisoryPdf: (payload: unknown) => Promise<any> };
            }).GrowWithHRPDF!;
            const built = await service.buildAdvisoryPdf({
                theme: "both",
                report: {
                    companyName: "Single Edition Test",
                    entity: "Private Limited",
                    industry: "Business consulting",
                    employees: 25,
                    primaryState: "Karnataka"
                },
                answers: {
                    entity: "Private Limited",
                    industry: "Business consulting",
                    employees: 25,
                    primaryState: "Karnataka"
                }
            });

            return {
                selectedThemes: built.selectedThemes,
                count: built.pdfs.length,
                firstTheme: built.pdfs[0]?.theme,
                singleReportDelivery: service.singleReportDelivery,
                darkOptionVisible: (window as Window & {
                    GrowWithHRSingleEditionReportUI?: { darkOptionVisible?: boolean };
                }).GrowWithHRSingleEditionReportUI?.darkOptionVisible
            };
        });

        expect(result.selectedThemes).toEqual(["standard"]);
        expect(result.count).toBe(1);
        expect(result.firstTheme).toBe("standard");
        expect(result.singleReportDelivery).toBe(true);
        expect(result.darkOptionVisible).toBe(false);
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

    test("asks OPC and manufacturing questions progressively", async ({ page }) => {
        await page.evaluate(({ key }) => {
            localStorage.setItem(key, JSON.stringify({
                version: "2.1.0",
                started: true,
                completed: false,
                currentMoment: 2,
                answers: {
                    companyName: "Progressive Manufacturing OPC",
                    industry: "Manufacturing",
                    customIndustry: "",
                    entity: "One Person Company",
                    employees: 1,
                    locations: "1",
                    countries: "1",
                    expansionPlans: [],
                    priorities: []
                },
                lead: { name: "", email: "", role: "", marketingConsent: false },
                ui: { showSupplementalWorkforce: false },
                updatedAt: new Date().toISOString()
            }));
        }, { key: ASSESSMENT_KEY });

        await page.reload({ waitUntil: "domcontentloaded" });
        await page.getByRole("button", { name: /Continue my advisory/ }).click();

        const section = page.locator('[data-industry-adaptive="manufacturing"]');
        await expect(section).toBeVisible();
        await expect(section.locator('[data-field-wrapper="workforcePresence"]')).toBeVisible();
        await expect(section.locator('input[name="workforcePresence"][value="not-sure"]')).toHaveCount(0);
        await expect(section.locator('[data-field-wrapper="workerCategories"]')).toBeHidden();
        await expect(section.locator('[data-field-wrapper="manufacturingOperations"]')).toBeHidden();
        await expect(section.locator('[data-field-wrapper="workers"]')).toBeHidden();
        await expect(section.locator('[data-field-wrapper="usesPower"]')).toBeHidden();

        await section.locator('input[name="workforcePresence"][value="other-people"]').check({ force: true });
        await expect(section.locator('[data-field-wrapper="workerCategories"]')).toBeVisible();
        await expect(section.locator('[data-field-wrapper="manufacturingOperations"]')).toBeVisible();
        await expect(section.locator('[data-field-wrapper="workers"]')).toBeHidden();
        await expect(section.locator('[data-field-wrapper="usesPower"]')).toBeHidden();

        await section.locator('input[name="manufacturingOperations"][value="yes"]').check({ force: true });
        await expect(section.locator('[data-field-wrapper="workers"]')).toBeVisible();
        await expect(section.locator('[data-field-wrapper="usesPower"]')).toBeVisible();
    });

    test("selects different operating questions for major sector families", async ({ page }) => {
        const result = await page.evaluate(() => {
            const api = (window as Window & {
                GrowWithHRSectorContextIntelligence?: {
                    profileFor: (industry: string) => string;
                    activeQuestionFields: (data: Record<string, unknown>) => Set<string>;
                };
            }).GrowWithHRSectorContextIntelligence!;
            const fields = (data: Record<string, unknown>) => [...api.activeQuestionFields(data)].sort();
            const base = { entity: "Private Limited", employees: 32, workforcePresence: "other-people" };
            return {
                profiles: {
                    software: api.profileFor("Software and SaaS"),
                    retail: api.profileFor("Retail and e-commerce"),
                    healthcare: api.profileFor("Hospital and diagnostics"),
                    logistics: api.profileFor("Logistics and warehousing"),
                    construction: api.profileFor("Construction and real estate"),
                    finance: api.profileFor("Banking, insurance and fintech"),
                    unknown: api.profileFor("Specialised custom business")
                },
                software: fields({ ...base, industry: "Software and SaaS" }),
                retail: fields({ ...base, industry: "Retail and e-commerce" }),
                healthcare: fields({ ...base, industry: "Hospital and diagnostics" }),
                construction: fields({ ...base, industry: "Construction and real estate" })
            };
        });

        expect(result.profiles).toEqual({
            software: "software",
            retail: "retail-ecommerce",
            healthcare: "healthcare-life-sciences",
            logistics: "logistics-warehousing",
            construction: "construction-real-estate",
            finance: "finance-fintech",
            unknown: "mixed"
        });
        expect(result.software).toEqual(expect.arrayContaining(["clientSiteWorkers", "overseasWorkers", "outsourcedOperations"]));
        expect(result.software).not.toEqual(expect.arrayContaining(["manufacturingOperations", "usesPower", "workers"]));
        expect(result.retail).toEqual(expect.arrayContaining(["warehouseOperations", "shiftOperations", "seasonalWorkers", "multiLocationOperations"]));
        expect(result.healthcare).toEqual(expect.arrayContaining(["continuousOperations", "agencyLabourUsed", "outsourcedOperations"]));
        expect(result.construction).toEqual(expect.arrayContaining(["projectSiteOperations", "agencyLabourUsed", "seasonalWorkers"]));
    });

    test("owner-only OPC overrides every sector and mixed businesses reveal activity-led follow-ups", async ({ page }) => {
        const result = await page.evaluate(() => {
            const api = (window as Window & {
                GrowWithHRSectorContextIntelligence?: {
                    activeQuestionFields: (data: Record<string, unknown>) => Set<string>;
                    normalisePayload: (payload: any) => any;
                };
            }).GrowWithHRSectorContextIntelligence!;
            const ownerOnly = [
                "Manufacturing", "Software and SaaS", "Retail and e-commerce", "Hospital",
                "Logistics", "Construction", "Financial services", "Hospitality"
            ].map((industry) => [...api.activeQuestionFields({
                entity: "One Person Company",
                industry,
                employees: 1,
                workers: 0,
                contractors: 0,
                workforcePresence: "owner-only"
            })]);
            const mixed = [...api.activeQuestionFields({
                entity: "Private Limited",
                industry: "Specialised custom business",
                employees: 12,
                workforcePresence: "other-people",
                businessActivities: ["manufacturing", "night-operations"],
                manufacturingOperations: "yes",
                shiftOperations: "yes"
            })];
            const staleSoftware = api.normalisePayload({
                answers: {
                    entity: "Private Limited",
                    industry: "Software and SaaS",
                    employees: 8,
                    workforcePresence: "other-people",
                    manufacturingOperations: "yes",
                    workers: 18,
                    usesPower: "yes"
                },
                report: {
                    entity: "Private Limited",
                    industry: "Software and SaaS",
                    employees: 8,
                    workforcePresence: "other-people",
                    manufacturingOperations: "yes",
                    workers: 18,
                    usesPower: "yes"
                }
            });
            const agency = api.normalisePayload({
                answers: {
                    entity: "Private Limited",
                    industry: "Hospitality",
                    employees: 24,
                    workforcePresence: "other-people",
                    agencyLabourUsed: "yes",
                    workerCategories: ["permanent-employees"]
                }
            });
            return {
                ownerOnly,
                mixed,
                staleSoftware: staleSoftware.answers,
                agencyCategories: agency.answers.workerCategories
            };
        });

        result.ownerOnly.forEach((fields) => expect(fields).toEqual(["workforcePresence"]));
        expect(result.mixed).toEqual(expect.arrayContaining([
            "businessActivities", "manufacturingOperations", "workers", "usesPower", "shiftOperations", "nightShifts"
        ]));
        expect(result.staleSoftware.manufacturingOperations).toBe("no");
        expect(result.staleSoftware.workers).toBe(0);
        expect(result.staleSoftware.usesPower).toBe("no");
        expect(result.staleSoftware.esiWageEligibility).toBe("no");
        expect(result.agencyCategories).toContain("agency-contract-labour");
    });
});
