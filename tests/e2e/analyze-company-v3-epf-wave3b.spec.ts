import { expect, test, type Page, type Request } from "@playwright/test";

const PRIVATE_BETA_ROUTE = "/analyze-company-v3.html";
const FEATURE_ID = "feature.legal.epf.contribution-rate-source";

type StorageWrite = { method: "setItem" | "removeItem" | "clear"; key: string | null };
type EpfWave3bWindow = Window & typeof globalThis & {
    GrowWithHREpfWave3bPanel?: {
        getState: () => Record<string, unknown>;
    };
    __epfWave3bStorageWrites?: StorageWrite[];
};

function responsePayload() {
    const chunkId = "epf-scheme-rate-source-wave3b-001";
    return {
        endpointVersion: "1.0.0",
        featureId: FEATURE_ID,
        lawFamilyId: "epf-eps-edli",
        legalReviewStatus: "needs-legal-review",
        applicabilityAuthority: "deterministic-only",
        providerRole: "explanation-only",
        usedForDecision: false,
        mayChangeDecision: false,
        decision: {
            productRuleId: "epf-contribution-rate-source-verification",
            ruleId: "rule.legal.epf.contribution-rate-source",
            ruleVersion: "1.0.0-private-beta",
            sourceRecordId: "EPF-WAVE3B-RATE-SOURCE",
            status: "specialist-review",
            reasonCode: "EPF_RATE_BASIS_EVIDENCED_VERIFICATION_RECOMMENDED",
            reason: "The controlled rate-source verification facts are recorded.",
            sourceRegistryIds: ["employees-provident-funds-scheme-2026"],
            sourceSections: [],
            legalReviewStatus: "needs-legal-review",
            limitations: ["This does not select a legally applicable contribution-rate branch."]
        },
        retrieval: {
            retrievalStatus: "completed",
            decisionFingerprint: "epf-wave3b-decision-fingerprint",
            retrievalFingerprint: "epf-wave3b-retrieval-fingerprint",
            citations: [{
                chunkId,
                registrySourceId: "employees-provident-funds-scheme-2026",
                sourceTitle: "Employees' Provident Funds Scheme, 2026",
                sectionReference: "Paragraph 18",
                pageStart: 75,
                pageEnd: 78,
                officialUrl: "https://www.epfindia.gov.in/",
                contentSha256: "9864f39707881c7cab20992dffec5551db9fafc35996e4da35fa168a85cf6a75"
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
            decisionFingerprint: "epf-wave3b-decision-fingerprint",
            retrievalFingerprint: "epf-wave3b-retrieval-fingerprint",
            response: {
                contractVersion: "1.0.0",
                decisionFingerprint: "epf-wave3b-decision-fingerprint",
                decisionStatus: "specialist-review",
                reasonCode: "EPF_RATE_BASIS_EVIDENCED_VERIFICATION_RECOMMENDED",
                summary: "The declared contribution-rate branch and source controls require qualified verification before reliance.",
                rationale: [{
                    citationChunkIds: [chunkId],
                    statement: "The governed Scheme source provides context for the fixed rate-source verification result."
                }],
                nextSteps: ["Verify the official rate authority and transition treatment without sending payroll data."],
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
        (window as EpfWave3bWindow).__epfWave3bStorageWrites = writes;
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

test.describe("Compliance DNA EPF Wave 3B", () => {
    test("exposes five reviews, sends an allow-listed payload and persists nothing", async ({ page }) => {
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
        const root = page.locator("#dnaEpfWave3b");
        await expect(root).toBeVisible();
        await expect(page.locator("#dnaEpfWave3bFeature option")).toHaveCount(5);
        expect(requestCount).toBe(0);

        await page.locator("#dnaEpfWave3bFeature").selectOption(FEATURE_ID);
        await page.locator('[name="epfDeclaredRateBranch"]').selectOption("twelve-percent-branch");
        await page.locator('[name="epfOfficialRateBasisStatus"]').selectOption("evidenced");
        await page.locator('[name="epfRateSourceReferenceStatus"]').selectOption("evidenced");
        await page.locator('[name="epfRateHigherWageStatus"]').selectOption("not-applicable");
        await page.locator('[name="epfRateTransitionReviewStatus"]').selectOption("evidenced");
        await page.getByRole("button", { name: "Generate EPF/EPS/EDLI review", exact: true }).click();

        await expect(page.locator("#dnaEpfWave3bResult")).toBeVisible();
        await expect(page.locator("#dnaEpfWave3bBadge")).toHaveText("Specialist Review");
        await expect(page.locator("#dnaEpfWave3bSummary")).toContainText("qualified verification");
        await expect(page.locator("#dnaEpfWave3bCitations")).toContainText("Paragraph 18");
        expect(requestCount).toBe(1);
        expect(submittedPayload).toEqual({
            answers: {
                epfDeclaredRateBranch: "twelve-percent-branch",
                epfOfficialRateBasisStatus: "evidenced",
                epfRateSourceReferenceStatus: "evidenced",
                epfRateHigherWageStatus: "not-applicable",
                epfRateTransitionReviewStatus: "evidenced"
            }
        });

        const state = await page.evaluate(() =>
            (window as EpfWave3bWindow).GrowWithHREpfWave3bPanel?.getState() || null
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
            (window as EpfWave3bWindow).__epfWave3bStorageWrites || []
        );
        expect(writes).toEqual([]);
    });
});
