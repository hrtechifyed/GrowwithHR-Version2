import {
    expect,
    test,
    type Page,
    type Request
} from "@playwright/test";

const PRIVATE_BETA_ROUTE = "/analyze-company-v3.html";
const PROTECTED_STATE_KEY = "growwithhr-advisory-briefing-v2";
const FEATURE_ID = "feature.advisory.workforce-planning";

type StorageWriteRecord = {
    method: "setItem" | "removeItem" | "clear";
    key: string | null;
};

type OperationalWindow = Window & typeof globalThis & {
    GrowWithHROperationalExplanationPanel?: {
        getState: () => Record<string, unknown>;
    };
    __growwithhrOperationalStorageWrites?: StorageWriteRecord[];
};

function savedState() {
    return {
        version: "2.1.0",
        schemaVersion: 1,
        started: true,
        completed: true,
        answers: {
            companyName: "Must not be submitted",
            employees: 35,
            locations: 3,
            workModel: "Hybrid",
            remoteBand: "26-50%",
            remoteExact: 40,
            hiringPlans: "Significant Growth",
            expansionPlans: ["new-locations"],
            peopleFunction: "Founder-led",
            priorities: ["policies-compliance"],
            primaryState: "Maharashtra"
        },
        lead: {
            name: "Must not be submitted",
            email: "private@example.com",
            phone: "+91-0000000000"
        },
        updatedAt: "2026-08-03T00:00:00.000Z"
    };
}

function responseEnvelope() {
    return {
        endpointVersion: "1.0.0",
        featureId: FEATURE_ID,
        recommendationAuthority: "deterministic-operational",
        providerRole: "explanation-only",
        usedForRecommendation: false,
        mayChangeRecommendation: false,
        legalAdvice: false,
        recommendation: {
            featureId: FEATURE_ID,
            ruleId: "rule.growth.rapid-change.workforce-planning",
            ruleVersion: "1.0.0",
            operationalStatus: "recommended",
            reasonCode: "WORKFORCE_PLANNING_RECOMMENDED",
            reason: "The organisation reported significant hiring growth or active expansion.",
            title: "Create a workforce plan",
            action: "Document expected roles, hiring sequence, ownership and onboarding capacity.",
            timeline: "Before major hiring or expansion begins",
            recommendationFingerprint: "e".repeat(64),
            sourceIds: ["source.labour-ministry.official-portal"],
            limitations: [],
            triggeringFactIds: [
                "fact.growth.rapid-growth",
                "fact.growth.expansion-activity"
            ],
            missingFactIds: []
        },
        guidance: {
            sources: [{
                id: "source.labour-ministry.official-portal",
                title: "Ministry of Labour and Employment",
                publisher: "Government of India",
                url: "https://www.labour.gov.in/",
                sourceType: "official-portal",
                official: true
            }]
        },
        explanation: {
            contractVersion: "1.0.0",
            explanationStatus: "completed",
            provider: {
                name: "cloudflare-workers-ai",
                model: "@cf/meta/llama-3.1-8b-instruct-fast",
                role: "explanation-only"
            },
            usedForRecommendation: false,
            mayChangeRecommendation: false,
            legalAdvice: false,
            recommendationFingerprint: "e".repeat(64),
            response: {
                contractVersion: "1.0.0",
                recommendationFingerprint: "e".repeat(64),
                operationalStatus: "recommended",
                reasonCode: "WORKFORCE_PLANNING_RECOMMENDED",
                summary: "The deterministic recommendation suggests preparing a workforce plan before major growth begins.",
                rationale: [{
                    statement: "The reported hiring and expansion context triggered the fixed workforce-planning recommendation.",
                    sourceIds: ["source.labour-ministry.official-portal"]
                }],
                nextSteps: [
                    "Document expected roles, hiring sequence and accountable owners.",
                    "Review onboarding and manager capacity before major hiring begins."
                ],
                limitations: [
                    "This explanation does not change the deterministic operational recommendation.",
                    "This output is general HR guidance and not legal advice.",
                    "Assessment answers and supporting evidence have not been independently verified."
                ],
                usedForRecommendation: false,
                mayChangeRecommendation: false,
                legalAdvice: false
            }
        },
        delivery: {
            cacheStatus: "miss",
            providerRequestsForThisResponse: 1
        }
    };
}

async function installState(page: Page) {
    await page.addInitScript(
        ({ key, value }) => {
            localStorage.setItem(key, JSON.stringify(value));
            const writes: StorageWriteRecord[] = [];
            (window as OperationalWindow).__growwithhrOperationalStorageWrites = writes;

            const originalSetItem = Storage.prototype.setItem;
            const originalRemoveItem = Storage.prototype.removeItem;
            const originalClear = Storage.prototype.clear;

            Storage.prototype.setItem = function setItem(name, storedValue) {
                writes.push({ method: "setItem", key: String(name) });
                return originalSetItem.call(this, name, storedValue);
            };
            Storage.prototype.removeItem = function removeItem(name) {
                writes.push({ method: "removeItem", key: String(name) });
                return originalRemoveItem.call(this, name);
            };
            Storage.prototype.clear = function clear() {
                writes.push({ method: "clear", key: null });
                return originalClear.call(this);
            };
        },
        { key: PROTECTED_STATE_KEY, value: savedState() }
    );
}

function isOperationalRequest(request: Request) {
    return new URL(request.url()).pathname === "/api/operational-explanation";
}

test("manually explains one operational feature without sending wider assessment data", async ({ page }) => {
    await installState(page);

    const requests: Request[] = [];
    await page.route("**/api/operational-explanation", async (route) => {
        requests.push(route.request());
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(responseEnvelope())
        });
    });

    await page.goto(PRIVATE_BETA_ROUTE);

    const panel = page.locator("#dnaOperationalExplanation");
    await expect(panel).toBeVisible();
    await expect(panel.getByRole("heading", { name: "Explain other governed HR recommendations" })).toBeVisible();
    await expect(panel.locator(".dna-operational-explanation__feature-card")).toHaveCount(6);
    expect(requests.filter(isOperationalRequest)).toHaveLength(0);

    const workforceCard = panel
        .locator(".dna-operational-explanation__feature-card")
        .filter({ hasText: "Workforce planning" });
    await workforceCard.getByRole("button", { name: "Generate explanation" }).click();

    await expect.poll(() => requests.filter(isOperationalRequest).length).toBe(1);
    const request = requests.find(isOperationalRequest);
    expect(request).toBeTruthy();
    const payload = request?.postDataJSON() as Record<string, unknown>;
    expect(payload).toEqual({
        featureId: FEATURE_ID,
        answers: {
            hiringPlans: "Significant Growth",
            expansionPlans: ["new-locations"]
        }
    });
    const serialized = JSON.stringify(payload);
    expect(serialized).not.toContain("Must not be submitted");
    expect(serialized).not.toContain("private@example.com");
    expect(serialized).not.toContain("employees");
    expect(serialized).not.toContain("primaryState");
    expect(serialized).not.toContain("peopleFunction");

    await expect(panel.locator("#dnaOperationalExplanationContent")).toBeVisible();
    await expect(panel.locator("#dnaOperationalExplanationBadge")).toHaveText("Recommended");
    await expect(panel.locator("#dnaOperationalExplanationSummary")).toContainText("workforce plan");
    await expect(panel.locator("#dnaOperationalExplanationSources a")).toHaveAttribute(
        "href",
        "https://www.labour.gov.in/"
    );
    await expect(panel.locator("#dnaOperationalExplanationLimitations")).toContainText("not legal advice");
    await expect(panel.locator("#dnaOperationalExplanationMetadata")).toContainText("deterministic-operational");
    await expect(panel.locator("#dnaOperationalExplanationMetadata")).toContainText("miss · 1 provider request(s)");

    const state = await page.evaluate(() =>
        (window as OperationalWindow).GrowWithHROperationalExplanationPanel?.getState()
    );
    expect(state).toMatchObject({
        automaticProviderCall: false,
        newStorageKeyIntroduced: false,
        stableReportMutation: false,
        stablePdfMutation: false,
        stableEmailMutation: false,
        hasResult: true
    });

    const writes = await page.evaluate(() =>
        (window as OperationalWindow).__growwithhrOperationalStorageWrites || []
    );
    expect(writes).toEqual([]);
});
