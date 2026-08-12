import { expect, test } from "@playwright/test";

const BASE_REPORT = {
    companyName: "Founder Intelligence Golden Co",
    employees: 9,
    workers: 5,
    contractors: 2,
    indiaOperations: true,
    establishmentType: "Private limited company",
    primaryState: "Karnataka",
    operatingStates: ["Karnataka"],
    womenEmployees: "yes",
    esiWageEligibility: "yes",
    bonusWageEligibility: "yes",
    industry: "Business consulting",
    workerCategories: ["employees"],
    usesPower: "no",
    manufacturingOperations: "no"
};

async function installRuntime(page: any, report: Record<string, unknown>) {
    await page.route("**/jspdf.umd.min.js", async (route: any) => {
        await route.fulfill({ status: 200, contentType: "application/javascript", body: "" });
    });
    await page.route("**/api/report-id", async (route: any) => {
        const request = route.request();
        const body = request.method() === "POST" ? JSON.parse(request.postData() || "{}") : {};
        await route.fulfill({
            status: 201,
            contentType: "application/json",
            body: JSON.stringify({
                ok: true,
                reportId: "GWHR-2026-0812-AA06",
                previousReportId: body.previousReportId || "",
                suffix: "AA06",
                generatedAt: "2026-08-12T14:45:00.000Z",
                replayed: false,
                storageBackend: "cloudflare-durable-object",
                durableStorageConfigured: true,
                persistenceRequirement: "persistent-storage-configured"
            })
        });
    });
    await page.route("**/api/legal-explanation/feature/**", async (route: any) => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                featureId: "feature.legal.posh.internal-committee-threshold",
                lawFamilyId: "posh",
                legalReviewStatus: "needs-legal-review",
                applicabilityAuthority: "deterministic-only",
                providerRole: "explanation-only",
                usedForDecision: false,
                mayChangeDecision: false,
                retrieval: {
                    citations: [{ chunkId: "posh-1", title: "Governed POSH source" }]
                },
                explanation: {
                    response: {
                        summary: "This governed explanation describes the fixed POSH finding without changing it.",
                        rationale: [{ statement: "The supplied employee count drives the deterministic threshold result.", citationChunkIds: ["posh-1"] }],
                        nextSteps: ["Review the fixed result and the governed source."],
                        limitations: []
                    }
                }
            })
        });
    });
    await page.addInitScript((savedReport: Record<string, unknown>) => {
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
            save(): this { return this; }
        }
        (window as Window & { jspdf?: { jsPDF: typeof FakeJsPDF } }).jspdf = { jsPDF: FakeJsPDF };
        localStorage.setItem("growwithhr-report", JSON.stringify(savedReport));
        localStorage.setItem("growwithhr-report-theme", "light");
    }, report);
}

test.describe("Founder intelligence roadmap", () => {
    test("runs today, growth and governed-explanation stories", async ({ page }) => {
        await installRuntime(page, BASE_REPORT);
        await page.goto("/executive-advisory-report.html", { waitUntil: "domcontentloaded" });
        await page.waitForFunction(() => (window as any).GrowWithHRFounderWebReport?.version === "3.0.0-founder-intelligence-web");

        await expect(page.getByRole("heading", { name: "What to understand about each fixed finding" })).toBeVisible();
        await expect(page.getByRole("heading", { name: "What to do next" })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Founder scenario simulation" })).toBeVisible();
        await expect(page.getByText(/applicability findings, not a compliance score/i)).toBeVisible();

        await page.locator("#scenarioField").selectOption("employees");
        await page.locator("#scenarioValue").fill("10");
        await page.getByRole("button", { name: "Run scenario" }).click();
        await expect(page.locator("#scenarioResult")).toContainText("Review needed");
        await expect(page.locator("#scenarioResult")).toContainText("Relevant now");
        await expect(page.locator("#scenarioResult")).toContainText("not AI predictions");

        const poshPanel = page.locator('[data-rag-obligation="posh"]');
        await expect(poshPanel).toBeVisible();
        await poshPanel.getByRole("button", { name: "Get governed source-backed explanation" }).click();
        await expect(poshPanel).toContainText("fixed POSH finding without changing it");
        await expect(poshPanel).toContainText("AI used for decision: No");
    });

    test("asks unresolved facts once, previews deterministic changes and regenerates with lineage", async ({ page }) => {
        const priorReportId = "GWHR-2026-0812-AA05";
        await installRuntime(page, {
            ...BASE_REPORT,
            employees: 60,
            esiWageEligibility: "not-sure",
            bonusWageEligibility: "not-sure",
            reportId: priorReportId,
            generatedAt: "2026-08-12T14:00:00.000Z"
        });
        await page.goto("/executive-advisory-report.html", { waitUntil: "domcontentloaded" });
        await page.waitForFunction(() => (window as any).GrowWithHRFounderWebReport?.version === "3.0.0-founder-intelligence-web");

        await expect(page.getByRole("heading", { name: "Resolve missing company facts" })).toBeVisible();
        await expect(page.locator('[data-missing-field="esiWageEligibility"]')).toHaveCount(1);
        await expect(page.locator('[data-missing-field="bonusWageEligibility"]')).toHaveCount(1);

        await page.locator('[data-missing-field="esiWageEligibility"]').selectOption("yes");
        await page.getByRole("button", { name: "Preview deterministic changes" }).click();
        await expect(page.locator("#missingFactPreview")).toContainText("Preview only");
        await expect(page.locator("#missingFactPreview")).toContainText("deterministic rule engine only");

        await page.getByRole("button", { name: "Generate revised report" }).click();
        await expect(page.locator(".gwh-intel-lineage")).toContainText("GWHR-2026-0812-AA06");
        await expect(page.locator(".gwh-intel-lineage")).toContainText("Revised from GWHR-2026-0812-AA05");
        await expect(page.locator('[data-missing-field="esiWageEligibility"]')).toHaveCount(0);
        await expect(page.locator('[data-missing-field="bonusWageEligibility"]')).toHaveCount(1);

        const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("growwithhr-report") || "{}"));
        expect(saved.reportId).toBe("GWHR-2026-0812-AA06");
        expect(saved.previousReportId).toBe(priorReportId);
        expect(saved.esiWageEligibility).toBe("yes");
        expect(saved.bonusWageEligibility).toBe("not-sure");
    });
});
