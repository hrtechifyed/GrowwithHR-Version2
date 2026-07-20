import {
    expect,
    Page,
    test
} from "@playwright/test";

const STORAGE_KEY =
    "growwithhr-advisory-briefing-v2";

async function seedSavedBriefing(
    page: Page,
    currentMoment = 2
): Promise<void> {
    await page.addInitScript(
        ({ key, moment }) => {
            localStorage.setItem(
                key,
                JSON.stringify({
                    version: "2.1.0",
                    started: true,
                    completed: false,
                    currentMoment: moment,
                    answers: {
                        locations: "1",
                        countries: "1",
                        expansionPlans: [],
                        priorities: []
                    },
                    lead: {
                        name: "",
                        email: "",
                        role: "",
                        marketingConsent: false
                    },
                    ui: {
                        showSupplementalWorkforce:
                            false
                    },
                    updatedAt:
                        new Date().toISOString()
                })
            );
        },
        {
            key: STORAGE_KEY,
            moment: currentMoment
        }
    );
}

test.describe(
    "Analyze My Company",
    () => {
        test.beforeEach(
            async ({ page }) => {
                await page.setViewportSize({
                    width: 1440,
                    height: 900
                });
            }
        );

        test(
            "shows the first-visit landing state",
            async ({ page }) => {
                await page.addInitScript(
                    () => {
                        localStorage.clear();
                    }
                );

                await page.goto(
                    "/analyze-company.html"
                );

                await expect(
                    page.locator(
                        "[data-site-shell-header]"
                    )
                ).toHaveCount(1);

                await expect(
                    page.locator(
                        "#firstVisitActions"
                    )
                ).toBeVisible();

                await expect(
                    page.locator(
                        "#resumePanel"
                    )
                ).toBeHidden();

                await expect(
                    page.getByRole(
                        "button",
                        {
                            name:
                                "Start my advisory"
                        }
                    )
                ).toBeVisible();

                await expect(
                    page.getByRole(
                        "link",
                        {
                            name:
                                "View a sample advisory"
                        }
                    )
                ).toBeVisible();
            }
        );

        test(
            "shows only the returning-user state when progress exists",
            async ({ page }) => {
                await seedSavedBriefing(
                    page
                );

                await page.goto(
                    "/analyze-company.html"
                );

                await expect(
                    page.locator(
                        "#firstVisitActions"
                    )
                ).toBeHidden();

                await expect(
                    page.locator(
                        "#resumePanel"
                    )
                ).toBeVisible();

                await expect(
                    page.locator(
                        "#resumeMessage"
                    )
                ).toHaveText(
                    "Your progress is saved."
                );

                await expect(
                    page.getByRole(
                        "button",
                        {
                            name:
                                /Continue my advisory/
                        }
                    )
                ).toBeVisible();
            }
        );

        test(
            "uses equal-width desktop panels",
            async ({ page }) => {
                await page.addInitScript(
                    () => {
                        localStorage.clear();
                    }
                );

                await page.goto(
                    "/analyze-company.html"
                );

                const briefing =
                    await page
                        .locator(
                            ".advisory-entry__features"
                        )
                        .boundingBox();

                const story =
                    await page
                        .locator(
                            ".advisory-entry__visual"
                        )
                        .boundingBox();

                expect(
                    briefing
                ).not.toBeNull();

                expect(
                    story
                ).not.toBeNull();

                expect(
                    Math.abs(
                        briefing!.width -
                            story!.width
                    )
                ).toBeLessThanOrEqual(2);
            }
        );

        test(
            "requires only name and email at contact capture",
            async ({ page }) => {
                await seedSavedBriefing(
                    page,
                    6
                );

                await page.goto(
                    "/analyze-company.html"
                );

                await page
                    .getByRole(
                        "button",
                        {
                            name:
                                /Continue my advisory/
                        }
                    )
                    .click();

                const founderLed =
                    page.locator(
                        'input[name="peopleFunction"]' +
                            '[value="Founder Led"]'
                    );

                await expect(
                    founderLed
                ).toBeVisible();

                await founderLed.check({
                    force: true
                });

                await expect(
                    founderLed
                ).toBeChecked();

                const hiringPriority =
                    page.locator(
                        'input[name="priorities"]' +
                            '[value="hiring-onboarding"]'
                    );

                await expect(
                    hiringPriority
                ).toBeVisible();

                await hiringPriority.check({
                    force: true
                });

                await expect(
                    hiringPriority
                ).toBeChecked();

                await page
                    .locator(
                        "#nextButton"
                    )
                    .click();

                await page
                    .locator(
                        "#continueToContactButton"
                    )
                    .click();

                await expect(
                    page.locator(
                        "#serviceConsent"
                    )
                ).toHaveCount(0);

                const marketing =
                    page.locator(
                        "#marketingConsent"
                    );

                await expect(
                    marketing
                ).toBeVisible();

                await expect(
                    marketing
                ).not.toBeChecked();

                await expect(
                    marketing
                ).not.toHaveAttribute(
                    "required",
                    ""
                );

                await page
                    .locator(
                        "#generateReportButton"
                    )
                    .click();

                await expect(
                    page.locator(
                        "#leadNameError"
                    )
                ).toContainText(
                    "Enter your name"
                );

                await expect(
                    page.locator(
                        "#leadEmailError"
                    )
                ).toContainText(
                    "Enter your work email"
                );

                await page
                    .locator(
                        "#leadName"
                    )
                    .fill(
                        "Test User"
                    );

                await page
                    .locator(
                        "#leadEmail"
                    )
                    .fill(
                        "test.user@example.com"
                    );

                await page.evaluate(
                    () => {
                        window.GrowWithHRPDF = {
                            buildAdvisoryPdf:
                                async () =>
                                    null
                        };

                        window.GrowWithHREmail = {
                            sendAdvisory:
                                async () => ({
                                    ok: true,
                                    customerStatus:
                                        "sent",
                                    customerSent:
                                        true,
                                    internalStatus:
                                        "sent",
                                    internalSent:
                                        true
                                })
                        };
                    }
                );

                await page
                    .locator(
                        "#generateReportButton"
                    )
                    .click();

                await expect(
                    page.locator(
                        "#successScreen"
                    )
                ).toBeVisible();
            }
        );
    }
);

test.describe(
    "Shared report navigation",
    () => {
        test(
            "renders one shared navbar without duplicate links",
            async ({ page }) => {
                await page.goto(
                    "/executive-advisory-report.html"
                );

                await expect(
                    page.locator(
                        "[data-site-shell-header]"
                    )
                ).toHaveCount(1);

                await expect(
                    page.locator(
                        "nav.navbar"
                    )
                ).toHaveCount(0);

                await expect(
                    page.locator(
                        ".site-nav-link"
                    )
                ).toHaveCount(4);

                await expect(
                    page.getByRole(
                        "link",
                        {
                            name:
                                "Analyze My Company",
                            exact:
                                true
                        }
                    )
                ).toHaveCount(1);

                await expect(
                    page.getByRole(
                        "link",
                        {
                            name:
                                "Official Sources",
                            exact:
                                true
                        }
                    )
                ).toHaveCount(1);

                await expect(
                    page.getByRole(
                        "link",
                        {
                            name:
                                "Sample Advisory",
                            exact:
                                true
                        }
                    )
                ).toHaveCount(1);
            }
        );
    }
);
