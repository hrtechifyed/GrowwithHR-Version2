import {
    expect,
    Page,
    test
} from "@playwright/test";

const PRIVATE_BETA_ROUTE =
    "/analyze-company-v3.html";

const STABLE_ROUTE =
    "analyze-company.html";

const PROTECTED_STORAGE_KEY =
    "growwithhr-advisory-briefing-v2";

type ComplianceDnaDiagnostics = {
    version: string;
    route: string;
    fallbackRoute: string;
    narrativeLoaded: boolean;
    getState(): {
        currentActNumber: number;
        totalActs: number;
        progress: number;
        currentAct: {
            id: string;
            label: string;
            title: string;
        };
    };
};

type ComplianceDnaWindow =
    Window & {
        GrowWithHRComplianceDna?:
            ComplianceDnaDiagnostics;
    };

async function openPrivateBeta(
    page: Page
): Promise<void> {
    await page.goto(
        PRIVATE_BETA_ROUTE
    );

    await page.waitForFunction(
        () => {
            return Boolean(
                (
                    window as
                        ComplianceDnaWindow
                ).GrowWithHRComplianceDna
            );
        }
    );
}

test.describe(
    "Compliance DNA private beta",
    () => {
        test.beforeEach(
            async ({ page }) => {
                await page.setViewportSize({
                    width: 1440,
                    height: 900
                });

                await page.addInitScript(
                    () => {
                        localStorage.clear();
                    }
                );
            }
        );

        test(
            "loads the configured Five-Act experience",
            async ({ page }) => {
                await openPrivateBeta(
                    page
                );

                await expect(
                    page.locator(
                        "#dnaShell"
                    )
                ).toBeVisible();

                await expect(
                    page.locator(
                        "[data-act-button]"
                    )
                ).toHaveCount(5);

                await expect(
                    page.locator(
                        "#dnaCurrentAct"
                    )
                ).toHaveText(
                    "Act 1 of 5"
                );

                await expect(
                    page.locator(
                        "#dnaProgressLabel"
                    )
                ).toHaveText(
                    "Discover"
                );

                await expect(
                    page.locator(
                        "#dnaStageTitle"
                    )
                ).toHaveText(
                    "Meet the organisation behind the obligations"
                );

                const progressBar =
                    page.locator(
                        '[role="progressbar"]'
                    );

                await expect(
                    progressBar
                ).toHaveAttribute(
                    "aria-valuemin",
                    "1"
                );

                await expect(
                    progressBar
                ).toHaveAttribute(
                    "aria-valuemax",
                    "5"
                );

                await expect(
                    progressBar
                ).toHaveAttribute(
                    "aria-valuenow",
                    "1"
                );

                await expect(
                    page.locator(
                        "#dnaStartButton"
                    )
                ).toHaveText(
                    "Continue to People"
                );

                const diagnostics =
                    await page.evaluate(
                        () => {
                            return (
                                window as
                                    ComplianceDnaWindow
                            ).GrowWithHRComplianceDna;
                        }
                    );

                expect(
                    diagnostics
                        ?.narrativeLoaded
                ).toBe(true);

                expect(
                    diagnostics
                        ?.route
                ).toBe(
                    "analyze-company-v3.html"
                );

                expect(
                    diagnostics
                        ?.fallbackRoute
                ).toBe(
                    STABLE_ROUTE
                );
            }
        );

        test(
            "supports direct and sequential act navigation",
            async ({ page }) => {
                await openPrivateBeta(
                    page
                );

                await page
                    .locator(
                        '[data-act-button="3"]'
                    )
                    .click();

                await expect(
                    page.locator(
                        "#dnaCurrentAct"
                    )
                ).toHaveText(
                    "Act 3 of 5"
                );

                await expect(
                    page.locator(
                        "#dnaProgressLabel"
                    )
                ).toHaveText(
                    "Footprint"
                );

                await expect(
                    page.locator(
                        "#dnaStageTitle"
                    )
                ).toHaveText(
                    "Trace how work and growth create compliance signals"
                );

                await expect(
                    page.locator(
                        '[role="progressbar"]'
                    )
                ).toHaveAttribute(
                    "aria-valuenow",
                    "3"
                );

                await expect(
                    page.locator(
                        '[data-act-button="3"]'
                    )
                ).toHaveAttribute(
                    "aria-current",
                    "step"
                );

                const progressWidth =
                    await page
                        .locator(
                            "#dnaProgressValue"
                        )
                        .evaluate(
                            (element) => {
                                return (
                                    element as
                                        HTMLElement
                                ).style.width;
                            }
                        );

                expect(
                    progressWidth
                ).toBe("60%");

                await page
                    .locator(
                        "#dnaStartButton"
                    )
                    .click();

                await expect(
                    page.locator(
                        "#dnaCurrentAct"
                    )
                ).toHaveText(
                    "Act 4 of 5"
                );

                await expect(
                    page.locator(
                        "#dnaProgressLabel"
                    )
                ).toHaveText(
                    "Understand"
                );

                await page
                    .locator(
                        '[data-act-button="5"]'
                    )
                    .click();

                await expect(
                    page.locator(
                        "#dnaCurrentAct"
                    )
                ).toHaveText(
                    "Act 5 of 5"
                );

                await expect(
                    page.locator(
                        "#dnaStageTitle"
                    )
                ).toHaveText(
                    "Receive the current GrowWithHR advisory"
                );

                await expect(
                    page.locator(
                        "#dnaStartButton"
                    )
                ).toHaveText(
                    "Open the stable assessment"
                );

                const stableAssessmentLink =
                    page.getByRole(
                        "link",
                        {
                            name:
                                "Use the stable assessment",
                            exact:
                                true
                        }
                    );

                await expect(
                    stableAssessmentLink
                ).toBeVisible();

                await expect(
                    stableAssessmentLink
                ).toHaveAttribute(
                    "href",
                    STABLE_ROUTE
                );
            }
        );

        test(
            "does not modify protected v2 progress",
            async ({ page }) => {
                const protectedValue =
                    JSON.stringify({
                        version:
                            "2.1.0",
                        started:
                            true,
                        completed:
                            false,
                        currentMoment:
                            2,
                        marker:
                            "m1-protected-state"
                    });

                await page.addInitScript(
                    ({ key, value }) => {
                        localStorage.setItem(
                            key,
                            value
                        );
                    },
                    {
                        key:
                            PROTECTED_STORAGE_KEY,
                        value:
                            protectedValue
                    }
                );

                await openPrivateBeta(
                    page
                );

                await page
                    .locator(
                        '[data-act-button="2"]'
                    )
                    .click();

                await page
                    .locator(
                        "#dnaStartButton"
                    )
                    .click();

                await page
                    .locator(
                        '[data-act-button="5"]'
                    )
                    .click();

                const storedValue =
                    await page.evaluate(
                        (key) => {
                            return localStorage
                                .getItem(key);
                        },
                        PROTECTED_STORAGE_KEY
                    );

                expect(
                    storedValue
                ).toBe(
                    protectedValue
                );
            }
        );

        test(
            "retains private-beta indexing protection",
            async ({ page }) => {
                await openPrivateBeta(
                    page
                );

                await expect(
                    page.locator(
                        'meta[name="robots"]'
                    )
                ).toHaveAttribute(
                    "content",
                    "noindex, nofollow"
                );

                await expect(
                    page.getByText(
                        "Private beta",
                        {
                            exact:
                                true
                        }
                    )
                ).toBeVisible();
            }
        );
    }
);
