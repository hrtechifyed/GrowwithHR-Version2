import { expect, test, type Page, type Request } from "@playwright/test";

const PRIVATE_BETA_ROUTE = "/analyze-company-v3.html";
const FEATURE_ID = "feature.legal.maternity.employee-eligibility";

type StorageWrite = { method: "setItem" | "removeItem" | "clear"; key: string | null };
type MaternityWindow = Window & typeof globalThis & {
    GrowWithHRMaternityWave2Panel?: {
        getState: () => Record<string, unknown>;
    };
    __maternityWave2StorageWrites?: StorageWrite[];
};

function responsePayload() {
    const chunkId = "social-security-code-maternity-eligibility-wave2-001";
    return {
        endpointVersion: "1.0.0",
        featureId: FEATURE_ID,
        lawFamilyId: "maternity",
        legalReviewStatus: "needs-legal-review",
        applicabilityAuthority: "deterministic-only",
        providerRole: "explanation-only",
        usedForDecision: false,
        mayChangeDecision: false,
        decision: {
            productRuleId: "maternity-employee-eligibility-review",
            ruleId: "rule.legal.maternity.employee-eligibility",
            ruleVersion: "1.0.0-private-beta",
            sourceRecordId: "CENTRAL-SOCIAL-SECURITY-MATERNITY",
            status: "specialist-review",
            reasonCode: "MATERNITY_EMPLOYEE_ELIGIBILITY_REVIEW_REQUIRED",
            reason: "The controlled facts satisfy the private-beta review boundary.",
            sourceRegistryIds: ["social-security-code-2020"],
            sourceSections: [],
            legalReviewStatus: "needs-legal-review",
            limitations: ["This is not an individual entitlement determination."]
        },
        retrieval: {
            retrievalStatus: "completed",
            decisionFingerprint: "maternity-decision-fingerprint",
            retrievalFingerprint: "maternity-retrieval-fingerprint",
            citations: [{
                chunkId,
                registrySourceId: "social-security-code-2020",
                sourceTitle: "Code on Social Security, 2020",
                sectionReference: "Section 60(1)-(2)",
                pageStart: 49,
                pageEnd: 50,
                officialUrl: "https://www.labour.gov.in/offerings/schemes-and-services/details/labour-codes-gzNzQzMtQWa",
                contentSha256: "7a0a2451de2d51b0136f9f776efde5d3d1b790786227c97239d8ed39bb9d6710"
            }]
        },
        explanation: {
            contractVersion: "1.0.0",
            explanationStatus: "completed",
            provider: {
                name: "deterministic-test-provider",
                model: "test-model",
                role: "explanation-only"
            },
            usedForDecision: false,
            mayChangeDecision: false,
            legalAdvice: false,
            decisionFingerprint: "maternity-decision-fingerprint",
            retrievalFingerprint: "maternity-retrieval-fingerprint",
            response: {
                contractVersion: "1.0.0",
                decisionFingerprint: "maternity-decision-fingerprint",
                decisionStatus: "specialist-review",
                reasonCode: "MATERNITY_EMPLOYEE_ELIGIBILITY_REVIEW_REQUIRED",
                summary: "The controlled workday and event-category facts require qualified Maternity Benefit review.",
                rationale: [{
                    citationChunkIds: [chunkId],
                    statement: "The governed Section 60 source provides context for the fixed review result."
                }],
                nextSteps: ["Obtain qualified review before relying on an entitlement conclusion."],
                limitations: [
                    "This explanation does not change the deterministic decision.",
                    "The rule and source interpretation remain subject to legal review.",
                    "Assessment answers and evidence have not been independently verified."
                ],
                legalReviewStatus: "needs-legal-review",
                usedForDecision: false,
                mayChangeDecision: false,
                legalAdvice: false
            }
        }
    };
}

async function trackStorage(page: Page) {
    await page.addInitScript(() => {
        const writes: StorageWrite[] = [];
        (window as MaternityWindow).__maternityWave2StorageWrites = writes;
        const originalSetItem = Storage.prototype.setItem;
        const originalRemoveItem = Storage.prototype.removeItem;
        const originalClear = Storage.prototype.clear;
        Storage.prototype.setItem = function setItem(key, value) {
            writes.push({ method: "setItem", key: String(key) });
            return originalSetItem.call(this, key, value);
        };
        Storage.prototype.removeItem = function removeItem(key) {
            writes.push({ method: "removeItem", key: String(key) });
            return originalRemoveItem.call(this, key);
        };
        Storage.prototype.clear = function clear() {
            writes.push({ method: "clear", key: null });
            return originalClear.call(this);
        };
    });
}

function requestJson(request: Request) {
    const data = request.postData();
    return data ? JSON.parse(data) : null;
}

test.describe("Compliance DNA Maternity Benefit Wave 2", () => {
    test("exposes ten reviews, sends an allow-listed payload and persists nothing", async ({ page }) => {
        await trackStorage(page);
        let requestCount = 0;
        let submittedPayload: unknown = null;

        await page.route("**/api/legal-explanation/feature/**", async (route) => {
            requestCount += 1;
            submittedPayload = requestJson(route.request());
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify(responsePayload())
            });
        });

        await page.goto(PRIVATE_BETA_ROUTE, { waitUntil: "domcontentloaded" });
        const root = page.locator("#dnaMaternityWave2");
        await expect(root).toBeVisible();
        await expect(page.locator("#dnaMaternityWave2Feature option")).toHaveCount(10);
        expect(requestCount).toBe(0);

        await page.locator("#dnaMaternityWave2Feature").selectOption(FEATURE_ID);
        await page.locator('[name="maternityWorkdaysBandValue"]').fill("80");
        await page.locator('[name="maternityEligibilityEventCategory"]').selectOption("delivery");
        await page.getByRole("button", { name: "Generate Maternity review", exact: true }).click();

        await expect(page.locator("#dnaMaternityWave2Result")).toBeVisible();
        await expect(page.locator("#dnaMaternityWave2Badge")).toHaveText("Specialist Review");
        await expect(page.locator("#dnaMaternityWave2Summary")).toContainText("qualified Maternity Benefit review");
        await expect(page.locator("#dnaMaternityWave2Citations")).toContainText("Section 60(1)-(2)");
        expect(requestCount).toBe(1);
        expect(submittedPayload).toEqual({
            answers: {
                maternityWorkdaysBandValue: 80,
                maternityEligibilityEventCategory: "delivery"
            }
        });

        const state = await page.evaluate(() =>
            (window as MaternityWindow).GrowWithHRMaternityWave2Panel?.getState() || null
        );
        expect(state).toMatchObject({
            phase: "complete",
            requestCount: 1,
            selectedFeatureId: FEATURE_ID,
            hasResult: true,
            automaticRequest: false,
            browserStorageWrites: 0,
            stableReportMutation: false,
            stablePdfMutation: false,
            stableEmailMutation: false
        });

        const writes = await page.evaluate(() =>
            (window as MaternityWindow).__maternityWave2StorageWrites || []
        );
        expect(writes).toEqual([]);
    });
});
