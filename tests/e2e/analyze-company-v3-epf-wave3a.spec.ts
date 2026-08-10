import { expect, test, type Page, type Request } from "@playwright/test";

const PRIVATE_BETA_ROUTE = "/analyze-company-v3.html";
const FEATURE_ID = "feature.legal.epf.member-inclusion";

type StorageWrite = { method: "setItem" | "removeItem" | "clear"; key: string | null };
type EpfWindow = Window & typeof globalThis & {
    GrowWithHREpfWave3aPanel?: {
        getState: () => Record<string, unknown>;
    };
    __epfWave3aStorageWrites?: StorageWrite[];
};

function responsePayload() {
    const chunkId = "epf-scheme-member-inclusion-wave3a-001";
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
            productRuleId: "epf-member-inclusion-operational-review",
            ruleId: "rule.legal.epf.member-inclusion",
            ruleVersion: "1.0.0-private-beta",
            sourceRecordId: "EPF-WAVE3A-MEMBER",
            status: "specialist-review",
            reasonCode: "EPF_MEMBER_INCLUSION_REVIEW_REQUIRED",
            reason: "The controlled organisation-level classification controls are recorded.",
            sourceRegistryIds: ["employees-provident-funds-scheme-2026"],
            sourceSections: [],
            legalReviewStatus: "needs-legal-review",
            limitations: ["This does not decide an individual employee's membership."]
        },
        retrieval: {
            retrievalStatus: "completed",
            decisionFingerprint: "epf-wave3a-decision-fingerprint",
            retrievalFingerprint: "epf-wave3a-retrieval-fingerprint",
            citations: [{
                chunkId,
                registrySourceId: "employees-provident-funds-scheme-2026",
                sourceTitle: "Employees' Provident Funds Scheme, 2026",
                sectionReference: "Definitions and paragraphs 9–11",
                pageStart: 66,
                pageEnd: 70,
                officialUrl: "https://www.epfindia.gov.in/",
                contentSha256: "64b8d207cd70c8a733882fe270cb4b2c34231bcb96376d0a3be5d13997399666"
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
            decisionFingerprint: "epf-wave3a-decision-fingerprint",
            retrievalFingerprint: "epf-wave3a-retrieval-fingerprint",
            response: {
                contractVersion: "1.0.0",
                decisionFingerprint: "epf-wave3a-decision-fingerprint",
                decisionStatus: "specialist-review",
                reasonCode: "EPF_MEMBER_INCLUSION_REVIEW_REQUIRED",
                summary: "The organisation-level EPF classification controls require qualified review before reliance.",
                rationale: [{
                    citationChunkIds: [chunkId],
                    statement: "The governed Scheme source provides context for the fixed operational review result."
                }],
                nextSteps: ["Verify the classification controls without sending employee-level records."],
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
        (window as EpfWindow).__epfWave3aStorageWrites = writes;
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

test.describe("Compliance DNA EPF Wave 3A", () => {
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
        const root = page.locator("#dnaEpfWave3a");
        await expect(root).toBeVisible();
        await expect(page.locator("#dnaEpfWave3aFeature option")).toHaveCount(5);
        expect(requestCount).toBe(0);

        await page.locator("#dnaEpfWave3aFeature").selectOption(FEATURE_ID);
        await page.locator('[name="epfPopulationReconciled"]').selectOption("evidenced");
        await page.locator('[name="epfApprenticeClassificationReviewed"]').selectOption("evidenced");
        await page.locator('[name="epfPriorMemberRoutingReviewed"]').selectOption("evidenced");
        await page.locator('[name="epfExcludedEmployeeReviewRecorded"]').selectOption("evidenced");
        await page.locator('[name="epfInternationalWorkerEscalationReviewed"]').selectOption("evidenced");
        await page.getByRole("button", { name: "Generate EPF review", exact: true }).click();

        await expect(page.locator("#dnaEpfWave3aResult")).toBeVisible();
        await expect(page.locator("#dnaEpfWave3aBadge")).toHaveText("Specialist Review");
        await expect(page.locator("#dnaEpfWave3aSummary")).toContainText("qualified review");
        await expect(page.locator("#dnaEpfWave3aCitations")).toContainText("paragraphs 9–11");
        expect(requestCount).toBe(1);
        expect(submittedPayload).toEqual({
            answers: {
                epfPopulationReconciled: "evidenced",
                epfApprenticeClassificationReviewed: "evidenced",
                epfPriorMemberRoutingReviewed: "evidenced",
                epfExcludedEmployeeReviewRecorded: "evidenced",
                epfInternationalWorkerEscalationReviewed: "evidenced"
            }
        });

        const state = await page.evaluate(() =>
            (window as EpfWindow).GrowWithHREpfWave3aPanel?.getState() || null
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
            (window as EpfWindow).__epfWave3aStorageWrites || []
        );
        expect(writes).toEqual([]);
    });
});
