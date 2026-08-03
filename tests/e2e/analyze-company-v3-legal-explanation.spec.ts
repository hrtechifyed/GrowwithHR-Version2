import {
    expect,
    test,
    type Page,
    type Request
} from "@playwright/test";

const PRIVATE_BETA_ROUTE =
    "/analyze-company-v3.html";

const PROTECTED_STATE_KEY =
    "growwithhr-advisory-briefing-v2";

type StorageWriteRecord = {
    method:
        | "setItem"
        | "removeItem"
        | "clear";
    key:
        string |
        null;
};

type LegalExplanationWindow =
    Window &
    typeof globalThis & {
        GrowWithHRLegalExplanationPanel?: {
            getState:
                () => Record<string, unknown>;
        };
        __growwithhrLegalStorageWrites?:
            StorageWriteRecord[];
    };

function createSavedState() {
    return {
        version:
            "2.1.0",
        schemaVersion:
            1,
        started:
            true,
        completed:
            true,
        answers: {
            companyName:
                "Must not be submitted",
            employees:
                10,
            primaryState:
                "Maharashtra",
            locations:
                1,
            priorities: [
                "policies-compliance"
            ]
        },
        lead: {
            name:
                "Must not be submitted",
            email:
                "private@example.com"
        },
        updatedAt:
            "2026-08-03T00:00:00.000Z"
    };
}

function createResponse() {
    return {
        endpointVersion:
            "0.1.0",
        lawId:
            "posh",
        legalReviewStatus:
            "needs-legal-review",
        applicabilityAuthority:
            "deterministic-only",
        providerRole:
            "explanation-only",
        usedForDecision:
            false,
        mayChangeDecision:
            false,
        decision: {
            productRuleId:
                "posh",
            ruleId:
                "rule.legal.posh.internal-committee-threshold",
            ruleVersion:
                "0.1.0",
            sourceRecordId:
                "CENTRAL-POSH",
            status:
                "specialist-review",
            reasonCode:
                "POSH_IC_THRESHOLD_REACHED_REVIEW_REQUIRED",
            reason:
                "The deterministic threshold result requires specialist review.",
            sourceRegistryIds: [
                "posh-act-2013"
            ],
            sourceSections: [],
            legalReviewStatus:
                "needs-legal-review",
            limitations: [
                "legalReviewStatus remains needs-legal-review."
            ]
        },
        retrieval: {
            retrievalStatus:
                "completed",
            decisionFingerprint:
                "c1ee3b36",
            retrievalFingerprint:
                "21fd9b70",
            citations: [{
                chunkId:
                    "posh-act-2013-section-4-001",
                registrySourceId:
                    "posh-act-2013",
                sourceTitle:
                    "Sexual Harassment of Women at Workplace Act, 2013",
                sectionReference:
                    "Section 4(1)",
                pageStart:
                    5,
                pageEnd:
                    6,
                officialUrl:
                    "https://www.indiacode.nic.in/handle/123456789/2104?locale=en",
                contentSha256:
                    "c4672dd3cd5d0cc7f895c5ab08287dd440b2362aa64439c424fce29ed5a43228"
            }]
        },
        explanation: {
            contractVersion:
                "1.0.0",
            explanationStatus:
                "completed",
            provider: {
                name:
                    "cloudflare-workers-ai",
                model:
                    "@cf/meta/llama-3.1-8b-instruct-fast",
                role:
                    "explanation-only"
            },
            usedForDecision:
                false,
            mayChangeDecision:
                false,
            legalAdvice:
                false,
            decisionFingerprint:
                "c1ee3b36",
            retrievalFingerprint:
                "21fd9b70",
            response: {
                contractVersion:
                    "1.0.0",
                decisionFingerprint:
                    "c1ee3b36",
                decisionStatus:
                    "specialist-review",
                reasonCode:
                    "POSH_IC_THRESHOLD_REACHED_REVIEW_REQUIRED",
                summary:
                    "The organisation crossed the product threshold, but legal review remains required.",
                rationale: [{
                    citationChunkIds: [
                        "posh-act-2013-section-4-001"
                    ],
                    statement:
                        "The approved Section 4 source provides context for the fixed threshold result."
                }],
                nextSteps: [
                    "Obtain qualified legal review before relying on the result."
                ],
                limitations: [
                    "This explanation does not change the deterministic decision.",
                    "The rule and source interpretation remain subject to legal review.",
                    "Assessment answers and evidence have not been independently verified."
                ],
                legalReviewStatus:
                    "needs-legal-review",
                usedForDecision:
                    false,
                mayChangeDecision:
                    false,
                legalAdvice:
                    false
            }
        },
        delivery: {
            cacheStatus:
                "miss",
            providerRequestsForThisResponse:
                1
        }
    };
}

async function installSavedState(
    page: Page
) {
    await page.addInitScript(
        ({
            key,
            value
        }) => {
            localStorage.setItem(
                key,
                JSON.stringify(value)
            );

            const writes:
                StorageWriteRecord[] =
                [];

            (
                window as
                    LegalExplanationWindow
            )
                .__growwithhrLegalStorageWrites =
                writes;

            const originalSetItem =
                Storage.prototype.setItem;
            const originalRemoveItem =
                Storage.prototype.removeItem;
            const originalClear =
                Storage.prototype.clear;

            Storage.prototype.setItem =
                function setItem(
                    name,
                    storedValue
                ) {
                    writes.push({
                        method:
                            "setItem",
                        key:
                            String(name)
                    });
                    return originalSetItem.call(
                        this,
                        name,
                        storedValue
                    );
                };

            Storage.prototype.removeItem =
                function removeItem(
                    name
                ) {
                    writes.push({
                        method:
                            "removeItem",
                        key:
                            String(name)
                    });
                    return originalRemoveItem.call(
                        this,
                        name
                    );
                };

            Storage.prototype.clear =
                function clear() {
                    writes.push({
                        method:
                            "clear",
                        key:
                            null
                    });
                    return originalClear.call(this);
                };
        },
        {
            key:
                PROTECTED_STATE_KEY,
            value:
                createSavedState()
        }
    );
}

async function openPrivateBeta(
    page: Page
) {
    await page.goto(
        PRIVATE_BETA_ROUTE,
        {
            waitUntil:
                "domcontentloaded"
        }
    );
}

function requestJson(request: Request) {
    const text =
        request.postData();

    return text
        ? JSON.parse(text)
        : null;
}

test.describe(
    "Compliance DNA private-beta POSH explanation",
    () => {
        test(
            "submits only approved facts and renders the governed explanation",
            async ({ page }) => {
                await installSavedState(page);

                let submittedPayload:
                    unknown =
                    null;

                let requestCount =
                    0;

                await page.route(
                    "**/api/legal-explanation/posh",
                    async (route) => {
                        requestCount +=
                            1;
                        submittedPayload =
                            requestJson(
                                route.request()
                            );

                        await route.fulfill({
                            status:
                                200,
                            contentType:
                                "application/json",
                            body:
                                JSON.stringify(
                                    createResponse()
                                )
                        });
                    }
                );

                await openPrivateBeta(page);

                const root =
                    page.locator(
                        "#dnaLegalExplanation"
                    );

                await expect(root)
                    .toHaveAttribute(
                        "data-legal-explanation-state",
                        "ready"
                    );

                await expect(
                    page.locator(
                        "#dnaLegalExplanationButton"
                    )
                ).toBeEnabled();

                expect(requestCount)
                    .toBe(0);

                await page
                    .getByRole(
                        "button",
                        {
                            name:
                                "Generate POSH explanation",
                            exact:
                                true
                        }
                    )
                    .click();

                await expect(root)
                    .toHaveAttribute(
                        "data-legal-explanation-state",
                        "complete"
                    );

                expect(requestCount)
                    .toBe(1);

                expect(submittedPayload)
                    .toEqual({
                        answers: {
                            employees:
                                10,
                            primaryState:
                                "Maharashtra",
                            locations:
                                1
                        }
                    });

                expect(
                    JSON.stringify(
                        submittedPayload
                    )
                ).not.toContain(
                    "private@example.com"
                );

                expect(
                    JSON.stringify(
                        submittedPayload
                    )
                ).not.toContain(
                    "Must not be submitted"
                );

                await expect(
                    page.locator(
                        "#dnaLegalExplanationDecisionBadge"
                    )
                ).toHaveText(
                    "Specialist Review"
                );

                await expect(
                    page.locator(
                        "#dnaLegalExplanationSummary"
                    )
                ).toContainText(
                    "legal review remains required"
                );

                await expect(
                    page.locator(
                        "#dnaLegalExplanationRationale"
                    )
                ).toContainText(
                    "posh-act-2013-section-4-001"
                );

                const citationLink =
                    page.locator(
                        "#dnaLegalExplanationCitations a"
                    );

                await expect(citationLink)
                    .toHaveAttribute(
                        "href",
                        /^https:\/\//
                    );

                await expect(
                    page.locator(
                        "#dnaLegalExplanationMetadata"
                    )
                ).toContainText(
                    "@cf/meta/llama-3.1-8b-instruct-fast"
                );

                await expect(
                    page.locator(
                        "#dnaLegalExplanationMetadata"
                    )
                ).toContainText(
                    "deterministic-only"
                );

                const state =
                    await page.evaluate(
                        () => {
                            return (
                                window as
                                    LegalExplanationWindow
                            )
                                .GrowWithHRLegalExplanationPanel
                                ?.getState() ||
                                null;
                        }
                    );

                expect(state)
                    .toMatchObject({
                        version:
                            "1.0.0",
                        phase:
                            "complete",
                        hasResult:
                            true,
                        automaticProviderCall:
                            false,
                        newStorageKeyIntroduced:
                            false,
                        stableReportMutation:
                            false,
                        stablePdfMutation:
                            false,
                        stableEmailMutation:
                            false
                    });

                const writes =
                    await page.evaluate(
                        () =>
                            (
                                window as
                                    LegalExplanationWindow
                            )
                                .__growwithhrLegalStorageWrites ||
                            []
                    );

                expect(writes)
                    .toEqual([]);
            }
        );

        test(
            "does not call the provider when saved facts are missing",
            async ({ page }) => {
                let requestCount =
                    0;

                await page.route(
                    "**/api/legal-explanation/posh",
                    async (route) => {
                        requestCount +=
                            1;
                        await route.abort();
                    }
                );

                await openPrivateBeta(page);

                await expect(
                    page.locator(
                        "#dnaLegalExplanation"
                    )
                ).toHaveAttribute(
                    "data-legal-explanation-state",
                    "missing"
                );

                await expect(
                    page.locator(
                        "#dnaLegalExplanationButton"
                    )
                ).toBeDisabled();

                await expect(
                    page.locator(
                        "#dnaLegalExplanationMissing"
                    )
                ).toBeVisible();

                expect(requestCount)
                    .toBe(0);
            }
        );
    }
);
