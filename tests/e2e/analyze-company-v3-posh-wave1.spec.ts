import { expect, test, type Page, type Request } from "@playwright/test";

const PRIVATE_BETA_ROUTE = "/analyze-company-v3.html";
const POLICY_FEATURE_ID = "feature.legal.posh.policy-review";

type Wave1Window = Window & typeof globalThis & {
    __growwithhrWave1StorageWrites?: string[];
};

function requestJson(request: Request) {
    const body = request.postData();
    return body ? JSON.parse(body) : null;
}

function createPolicyResponse() {
    return {
        featureId: POLICY_FEATURE_ID,
        lawFamilyId: "posh",
        legalReviewStatus: "needs-legal-review",
        applicabilityAuthority: "deterministic-only",
        providerRole: "explanation-only",
        usedForDecision: false,
        mayChangeDecision: false,
        decision: {
            productRuleId: "posh-policy-review",
            ruleId: "rule.legal.posh.policy-review",
            ruleVersion: "1.0.0-private-beta",
            sourceRecordId: "CENTRAL-POSH",
            status: "specialist-review",
            reasonCode: "POSH_POLICY_CONTROLS_RECORDED_REVIEW_REQUIRED",
            reason: "The reported policy controls satisfy the deterministic private-beta test.",
            legalReviewStatus: "needs-legal-review"
        },
        retrieval: {
            retrievalStatus: "completed",
            decisionFingerprint: "wave1-decision-fingerprint",
            retrievalFingerprint: "wave1-retrieval-fingerprint",
            citations: [{
                chunkId: "posh-act-2013-section-19-wave1-001",
                registrySourceId: "posh-act-2013",
                sourceTitle: "Sexual Harassment of Women at Workplace Act, 2013",
                sectionReference: "Section 19(a)-(c)"
            }]
        },
        explanation: {
            explanationStatus: "completed",
            decisionFingerprint: "wave1-decision-fingerprint",
            retrievalFingerprint: "wave1-retrieval-fingerprint",
            usedForDecision: false,
            mayChangeDecision: false,
            legalAdvice: false,
            response: {
                decisionStatus: "specialist-review",
                reasonCode: "POSH_POLICY_CONTROLS_RECORDED_REVIEW_REQUIRED",
                decisionFingerprint: "wave1-decision-fingerprint",
                summary: "The reported policy controls are source-grounded, but qualified legal review remains required.",
                rationale: [{
                    statement: "Section 19 and Rule 13 provide the controlled statutory context for this fixed result.",
                    citationChunkIds: ["posh-act-2013-section-19-wave1-001"]
                }],
                nextSteps: ["Have a qualified reviewer inspect the policy and supporting evidence."],
                limitations: [
                    "This explanation does not change the deterministic decision.",
                    "The rule and source interpretation remain subject to legal review.",
                    "Assessment answers and evidence have not been independently verified."
                ],
                usedForDecision: false,
                mayChangeDecision: false,
                legalAdvice: false
            }
        }
    };
}

async function installStorageRecorder(page: Page) {
    await page.evaluate(() => {
        const writes: string[] = [];
        (window as Wave1Window).__growwithhrWave1StorageWrites = writes;
        const originalSetItem = Storage.prototype.setItem;
        const originalRemoveItem = Storage.prototype.removeItem;
        const originalClear = Storage.prototype.clear;

        Storage.prototype.setItem = function setItem(key, value) {
            writes.push(`set:${String(key)}`);
            return originalSetItem.call(this, key, value);
        };
        Storage.prototype.removeItem = function removeItem(key) {
            writes.push(`remove:${String(key)}`);
            return originalRemoveItem.call(this, key);
        };
        Storage.prototype.clear = function clear() {
            writes.push("clear");
            return originalClear.call(this);
        };
    });
}

test.describe("Compliance DNA POSH Wave 1 panel", () => {
    test("exposes six controls, calls only after submit and does not persist inputs", async ({ page }) => {
        let requestCount = 0;
        let submittedPayload: unknown = null;

        await page.route("**/api/legal-explanation/feature/*", async (route) => {
            requestCount += 1;
            submittedPayload = requestJson(route.request());
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify(createPolicyResponse())
            });
        });

        await page.goto(PRIVATE_BETA_ROUTE, { waitUntil: "domcontentloaded" });
        await expect(page.locator("#dnaPoshWave1")).toBeVisible();
        await expect(page.locator("#dnaPoshWave1Feature option")).toHaveCount(6);
        expect(requestCount).toBe(0);

        await installStorageRecorder(page);

        await page.getByLabel("Policy exists").selectOption("true");
        await page.getByLabel("Policy issue date").fill("2026-01-10");
        await page.getByLabel("Policy owner role").fill("People Operations");
        await page.getByLabel("Coverage categories").fill("prevention, prohibition, redressal");
        await page.getByLabel("Dissemination evidence references").fill("policy-circulation-2026");
        await page.getByLabel("Review evidence references").fill("policy-review-2026");

        await page.getByRole("button", { name: "Generate review", exact: true }).click();

        await expect(page.locator("#dnaPoshWave1Result")).toBeVisible();
        await expect(page.locator("#dnaPoshWave1Badge")).toHaveText("Specialist Review");
        await expect(page.locator("#dnaPoshWave1Summary")).toContainText("qualified legal review remains required");
        await expect(page.locator("#dnaPoshWave1Citations")).toContainText("Section 19(a)-(c)");

        expect(requestCount).toBe(1);
        expect(submittedPayload).toEqual({
            answers: {
                poshPolicyExists: true,
                poshPolicyIssueDate: "2026-01-10",
                poshPolicyOwnerRole: "People Operations",
                poshPolicyCoverage: ["prevention", "prohibition", "redressal"],
                poshPolicyDisseminationEvidence: ["policy-circulation-2026"],
                poshPolicyReviewEvidence: ["policy-review-2026"]
            }
        });

        const writes = await page.evaluate(() =>
            (window as Wave1Window).__growwithhrWave1StorageWrites || []
        );
        expect(writes).toEqual([]);
    });
});
